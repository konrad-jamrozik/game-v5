import type { Node } from 'unist'

import {
  isHeading,
  isLink,
  isParent,
  isTable,
  type ParsedDocument,
  headingText,
  tableRows,
  textOf,
} from './markdown.ts'
import { decodeUrlPart, isExternalUrl, resolvePath, splitUrl } from './paths.ts'
import type { GlossaryRecord, RelationshipRecord, SpecificationFamily } from './types.ts'

/**
 * Compares each specification's recorded `uses` and `refines` relationships with what its Normative text shows, as
 * defined in Artifact Relationships. The comparison is a heuristic: it finds terms by their spelling, so it cannot tell a
 * Pointer from a use, and common words that are also terms match too often. It therefore reports instead of failing.
 */

export interface EvidenceSpecification {
  readonly path: string
  readonly title: string
  readonly family: SpecificationFamily
  readonly document: ParsedDocument
}

export interface EvidenceInput {
  readonly specifications: readonly EvidenceSpecification[]
  readonly glossary: readonly GlossaryRecord[]
  readonly relationships: readonly RelationshipRecord[]
}

export type EvidenceCategory = 'upward' | 'missing' | 'unsupported uses' | 'refines without handoff'

export interface EvidenceFinding {
  readonly category: EvidenceCategory
  readonly dependencyPath: string
  readonly dependentPath: string
  /** The terms the Dependent applies, each with how often, e.g. `Agent x3`; empty for categories without terms. */
  readonly terms: readonly string[]
}

/** The text of Normative text and the specifications it links, after examples introduced with "e.g." are removed. */
interface NormativeText {
  readonly text: string
  readonly linkedPaths: ReadonlySet<string>
}

/** Families whose members may apply the terms of the listed families without recording a relationship. */
const IMPLICIT_FAMILY_DEPENDENCIES: Partial<Record<SpecificationFamily, readonly SpecificationFamily[]>> = {
  Content: ['Foundation', 'Mechanics'],
}

const EXCLUDED_SECTIONS = /^(?:Overview|Relationships|Acceptance examples|Examples?|Worked examples?)$/i

/** From "e.g." to the end of its sentence: a period, question mark, or exclamation mark followed by space or the end. */
const EXAMPLE_CLAUSE = /\be\.g\.[\s\S]*?(?:[.!?](?=\s|$)|$)/gi

const INLINE_CONTAINERS: ReadonlySet<string> = new Set(['paragraph', 'heading', 'tableCell'])

interface LinkSpan {
  readonly start: number
  readonly url: string
}

/** Flattens an inline container to text, recording where each link starts. Code is dropped, as in proseText. */
function flattenInline(node: Node, spans: LinkSpan[], parts: string[], length: { value: number }): void {
  if (node.type === 'inlineCode' || node.type === 'code' || node.type === 'html') return
  if (isLink(node)) spans.push({ start: length.value, url: node.url })
  if ('value' in node && typeof node.value === 'string') {
    parts.push(node.value)
    length.value += node.value.length
    return
  }
  if (isParent(node)) for (const child of node.children) flattenInline(child, spans, parts, length)
}

/** An inline container and whether its text is scanned for terms; its links count either way. */
interface Container {
  readonly node: Node
  readonly scan: boolean
}

/** What recognizing a Pointer needs: the words that may surround its links, and the terms a row may name. */
interface PointerContext {
  /** Specification titles, longest first, as one alternation; "in Saves" names where a linked section is. */
  readonly titles: RegExp
  readonly terms: ReadonlySet<string>
}

/** Text of a node without its link texts and code: what a cell says besides the links it holds. */
function textOutsideLinks(node: Node): string {
  if (isLink(node) || node.type === 'inlineCode' || node.type === 'code' || node.type === 'html') return ' '
  if ('value' in node && typeof node.value === 'string') return node.value
  if (!isParent(node)) return ''
  return node.children.map(textOutsideLinks).join('')
}

/**
 * A Pointer cell holds only links to where something is stated, joined by "in" and a specification title, "and", "for", or
 * punctuation, e.g. "[Dev mode](developer-access.md#dev-mode) in Developer Access". It states no rule.
 */
function isPointerCell(cell: Node, context: PointerContext): boolean {
  if (!descendantsHaveLink(cell)) return false
  const rest = textOutsideLinks(cell)
    .replace(context.titles, ' ')
    .replace(/\b(?:in|and|for)\b|[,;.]/g, ' ')
  return rest.trim() === ''
}

function descendantsHaveLink(node: Node): boolean {
  if (isLink(node)) return true
  return isParent(node) && node.children.some(descendantsHaveLink)
}

function isTermName(cell: Node, context: PointerContext): boolean {
  const text = normalizeTerm(textOutsideLinks(cell).trim())
  if (text === '') return true
  return context.terms.has(text) || context.terms.has(text.replace(/e?s$/, ''))
}

/**
 * Returns the inline containers of a block. A Glossary row's Term and Prohibited synonyms cells are skipped. A table
 * row that holds a Pointer cell is a Pointer when its other cells only name a term or code: none of its text is scanned.
 * Otherwise only its Pointer cells are not scanned.
 */
function inlineContainers(node: Node, inGlossary: boolean, context: PointerContext, output: Container[]): void {
  if (isTable(node)) {
    for (const row of tableRows(node).slice(1)) {
      if (inGlossary) {
        const definition = row[1]
        if (definition) output.push({ node: definition, scan: true })
        continue
      }
      const pointers = row.map((cell) => isPointerCell(cell, context))
      const pointerRow =
        pointers.some(Boolean) && row.every((cell, index) => pointers[index] || isTermName(cell, context))
      row.forEach((cell, index) => output.push({ node: cell, scan: !pointerRow && !pointers[index] }))
    }
    return
  }
  if (INLINE_CONTAINERS.has(node.type)) {
    output.push({ node, scan: true })
    return
  }
  if (isParent(node)) for (const child of node.children) inlineContainers(child, inGlossary, context, output)
}

function normativeText(
  specification: EvidenceSpecification,
  specificationPaths: ReadonlySet<string>,
  context: PointerContext,
): NormativeText {
  const { document } = specification
  const texts: string[] = []
  const linkedPaths = new Set<string>()
  let skipDepth = 0
  let inGlossary = false
  let started = false
  for (const child of document.children) {
    if (isHeading(child)) {
      const heading = child
      if (heading.depth === 1) {
        // The first H1 is the title; its metadata table is not Normative text.
        if (!started) {
          started = true
          skipDepth = 1
          continue
        }
        inGlossary = headingText(heading) === 'Glossary'
      }
      if (skipDepth > 0 && heading.depth <= skipDepth) skipDepth = 0
      if (skipDepth === 0 && EXCLUDED_SECTIONS.test(headingText(heading))) {
        skipDepth = heading.depth
        continue
      }
      if (skipDepth > 0) continue
      texts.push(textOf(heading))
      continue
    }
    if (skipDepth > 0) continue
    const containers: Container[] = []
    inlineContainers(child, inGlossary, context, containers)
    for (const container of containers) {
      const spans: LinkSpan[] = []
      const parts: string[] = []
      flattenInline(container.node, spans, parts, { value: 0 })
      const text = parts.join('')
      const examples = [...text.matchAll(EXAMPLE_CLAUSE)].map((match) => ({
        start: match.index,
        end: match.index + match[0].length,
      }))
      for (const span of spans) {
        if (examples.some((example) => span.start >= example.start && span.start < example.end)) continue
        if (isExternalUrl(span.url)) continue
        const path = decodeUrlPart(splitUrl(span.url).path)
        if (!path) continue
        const resolved = resolvePath(specification.path, path)
        if (resolved !== specification.path && specificationPaths.has(resolved)) linkedPaths.add(resolved)
      }
      if (container.scan) texts.push(text.replace(EXAMPLE_CLAUSE, ' '))
    }
  }
  return { text: texts.join('\n'), linkedPaths }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** One pattern for all terms, longest first so a longer term wins over a term it contains. */
function termPattern(terms: readonly string[]): RegExp | undefined {
  if (terms.length === 0) return undefined
  const alternatives = terms
    .toSorted((left, right) => right.length - left.length)
    .map((term) => {
      const first = term[0] ?? ''
      const rest = escapeRegExp(term.slice(1)).replace(/ /g, '\\s+')
      // A lowercase term may start a sentence capitalized; a capitalized term must keep its capital.
      return first === first.toLowerCase() && first !== first.toUpperCase()
        ? `[${first}${first.toUpperCase()}]${rest}`
        : escapeRegExp(first) + rest
    })
  return new RegExp(`(?<![\\p{L}\\p{N}])(${alternatives.join('|')})(?:s|es)?(?![\\p{L}\\p{N}])`, 'gu')
}

function normalizeTerm(value: string): string {
  return value.toLocaleLowerCase('en-US').replace(/\s+/g, ' ')
}

export function findRelationshipEvidence(input: EvidenceInput): readonly EvidenceFinding[] {
  const specificationPaths = new Set(input.specifications.map((specification) => specification.path))
  const familyByPath = new Map(input.specifications.map((specification) => [specification.path, specification.family]))
  const ownerByTerm = new Map(input.glossary.map((entry) => [normalizeTerm(entry.term), entry.ownerPath]))
  const pattern = termPattern(input.glossary.map((entry) => entry.term))
  const titles = input.specifications
    .map((specification) => escapeRegExp(specification.title))
    .toSorted((left, right) => right.length - left.length)
  const context: PointerContext = {
    titles: new RegExp(`(?<![\\p{L}\\p{N}])(?:${titles.join('|')})(?![\\p{L}\\p{N}])`, 'gu'),
    terms: new Set(ownerByTerm.keys()),
  }

  // Every recorded relationship, of any kind, between a Dependency and a Dependent; and the uses and refines graph.
  const related = new Set<string>()
  const recorded = new Map<string, RelationshipRecord['kind'][]>()
  const dependents = new Map<string, string[]>()
  for (const relationship of input.relationships) {
    const key = relationship.dependencyPath + '\u0000' + relationship.dependentPath
    related.add(key)
    recorded.set(key, [...(recorded.get(key) ?? []), relationship.kind])
    if (relationship.kind !== 'uses' && relationship.kind !== 'refines') continue
    dependents.set(relationship.dependencyPath, [
      ...(dependents.get(relationship.dependencyPath) ?? []),
      relationship.dependentPath,
    ])
  }
  const reachable = new Map<string, ReadonlySet<string>>()
  const reachableFrom = (start: string): ReadonlySet<string> => {
    const cached = reachable.get(start)
    if (cached) return cached
    const seen = new Set<string>([start])
    const queue = [start]
    for (let next = queue.pop(); next !== undefined; next = queue.pop()) {
      for (const dependent of dependents.get(next) ?? []) {
        if (seen.has(dependent)) continue
        seen.add(dependent)
        queue.push(dependent)
      }
    }
    reachable.set(start, seen)
    return seen
  }

  const normative = new Map<string, NormativeText>()
  for (const specification of input.specifications) {
    normative.set(specification.path, normativeText(specification, specificationPaths, context))
  }

  const findings: EvidenceFinding[] = []
  // dependent path -> dependency path -> term -> count
  const applied = new Map<string, Map<string, Map<string, number>>>()
  for (const specification of input.specifications) {
    const text = normative.get(specification.path)?.text ?? ''
    const byOwner = new Map<string, Map<string, number>>()
    applied.set(specification.path, byOwner)
    if (!pattern) continue
    for (const match of text.matchAll(pattern)) {
      const term = normalizeTerm(match[1] ?? '')
      const owner = ownerByTerm.get(term)
      if (!owner || owner === specification.path) continue
      const counts = byOwner.get(owner) ?? new Map<string, number>()
      counts.set(term, (counts.get(term) ?? 0) + 1)
      byOwner.set(owner, counts)
    }
    const implicit = IMPLICIT_FAMILY_DEPENDENCIES[specification.family] ?? []
    for (const [owner, counts] of byOwner) {
      if (related.has(owner + '\u0000' + specification.path)) continue
      const ownerFamily = familyByPath.get(owner)
      if (ownerFamily && implicit.includes(ownerFamily)) continue
      findings.push({
        category: reachableFrom(specification.path).has(owner) ? 'upward' : 'missing',
        dependencyPath: owner,
        dependentPath: specification.path,
        terms: [...counts].map(([term, count]) => `${term} x${count}`),
      })
    }
  }

  for (const [key, kinds] of recorded) {
    const [dependencyPath = '', dependentPath = ''] = key.split('\u0000')
    if (kinds.includes('uses')) {
      const supported =
        (applied.get(dependentPath)?.has(dependencyPath) ?? false) ||
        (normative.get(dependentPath)?.linkedPaths.has(dependencyPath) ?? false)
      if (!supported) findings.push({ category: 'unsupported uses', dependencyPath, dependentPath, terms: [] })
    }
    if (kinds.includes('refines') && !(normative.get(dependencyPath)?.linkedPaths.has(dependentPath) ?? false)) {
      findings.push({ category: 'refines without handoff', dependencyPath, dependentPath, terms: [] })
    }
  }

  const order: readonly EvidenceCategory[] = ['upward', 'missing', 'unsupported uses', 'refines without handoff']
  return findings.toSorted(
    (left, right) =>
      order.indexOf(left.category) - order.indexOf(right.category) ||
      left.dependentPath.localeCompare(right.dependentPath, 'en') ||
      left.dependencyPath.localeCompare(right.dependencyPath, 'en'),
  )
}

export function formatEvidence(findings: readonly EvidenceFinding[]): string {
  const lines: string[] = []
  let category: EvidenceCategory | undefined
  for (const finding of findings) {
    if (finding.category !== category) {
      category = finding.category
      const count = findings.filter((each) => each.category === category).length
      lines.push('', `# ${category} (${count})`, '')
    }
    const terms = finding.terms.length > 0 ? `: ${finding.terms.join(', ')}` : ''
    lines.push(`${finding.dependentPath} <- ${finding.dependencyPath}${terms}`)
  }
  return lines.join('\n').trim()
}
