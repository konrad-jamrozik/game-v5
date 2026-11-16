import type { Link, Text } from 'mdast'
import type { Node } from 'unist'

import { headingText, isHeading, isLink, isParent, isTable, type ParsedDocument, tableRows } from './markdown.ts'
import { FAMILY_KIND } from './overviews.ts'
import { decodeUrlPart, isExternalUrl, resolvePath, splitUrl } from './paths.ts'
import type { SpecificationFamily } from './types.ts'

/**
 * Finds, in each specification, the first mention of every Glossary term another specification owns. That mention must
 * link to the term's Glossary group in its owning specification; the links then form the reference graph.
 */

export interface MentionSpecification {
  readonly path: string
  readonly title: string
  readonly family: SpecificationFamily
  readonly document: ParsedDocument
}

export interface TermDefinition {
  readonly term: string
  readonly ownerPath: string
  /** The anchor a link to the term uses: its Glossary group heading, or the Glossary heading. */
  readonly anchor: string
}

export interface TermMention {
  readonly specificationPath: string
  readonly term: string
  readonly ownerPath: string
  readonly anchor: string
  readonly line: number
  readonly column: number
  /** Source offsets of the mention, for rewriting it into a link; absent when the text cannot be mapped to source. */
  readonly start: number | undefined
  readonly end: number | undefined
  /** The mention as written, e.g. "Agents". */
  readonly text: string
  /** How the mention is linked: to the owner at the right anchor, to the owner elsewhere, or not at all. */
  readonly link: 'correct' | 'other anchor' | 'none'
  /** Source offsets of the existing link that holds the mention, when it is linked. */
  readonly linkStart: number | undefined
  readonly linkEnd: number | undefined
}

/** Sections whose text is not scanned: the inventory that term links replace. */
const SKIPPED_SECTIONS: ReadonlySet<string> = new Set(['Relationships'])

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function normalizeTerm(value: string): string {
  return value.toLocaleLowerCase('en-US').replace(/\s+/g, ' ')
}

/**
 * One pattern for all terms, longest first so a longer term wins over a term it contains. A lowercase term may start a
 * sentence capitalized; a capitalized term must keep its capital. A plural "s" or "es" may follow.
 */
/**
 * The spellings that mention a term: the term itself, or for a term written with its abbreviation, e.g.
 * "Game Data Record (GDR)", either the full name or the abbreviation.
 */
export function termForms(term: string): readonly string[] {
  const abbreviated = /^(.+?)\s+\((.+)\)$/.exec(term)
  return abbreviated?.[1] && abbreviated[2] ? [abbreviated[1], abbreviated[2]] : [term]
}

/** Replaces each match of a pattern with spaces, keeping every other character where it was. */
function mask(text: string, pattern: RegExp): string {
  return text.replace(pattern, (match) => ' '.repeat(match.length))
}

function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ')
}

function isText(node: Node): node is Text {
  return node.type === 'text'
}

/**
 * Maps a range of a text node's value to source offsets. The value can differ from the source, e.g. a list item's
 * continuation lines lose their indentation and escapes lose their backslash, so the two are aligned character by
 * character, skipping source characters the value does not contain. Returns undefined when they cannot be aligned.
 */
function sourceRange(
  content: string,
  sourceStart: number,
  value: string,
  start: number,
  end: number,
): { readonly start: number; readonly end: number } | undefined {
  let source = sourceStart
  let mapped: number | undefined
  for (let index = 0; index < end; index += 1) {
    while (source < content.length && content[source] !== value[index]) source += 1
    if (source >= content.length) return undefined
    if (index === start) mapped = source
    source += 1
  }
  if (mapped === undefined) return undefined
  return collapseWhitespace(content.slice(mapped, source)) === collapseWhitespace(value.slice(start, end))
    ? { start: mapped, end: source }
    : undefined
}

/**
 * Whether source offset `start` begins a sentence, a list item, or a table cell. Emphasis markers and whitespace before
 * it are ignored, e.g. in "**Fixed:** The".
 */
function startsSentence(content: string, start: number): boolean {
  const raw = content.slice(Math.max(0, start - 200), start)
  // A blank line before the text starts a new paragraph.
  if (/\n[ \t]*\n[\s*_]*$/.test(raw)) return true
  const before = raw.replace(/[\s*_]+$/, '')
  return before === '' || /[.!?:|]$/.test(before) || /(?:^|\n)\s*(?:[-+]|\d+\.)$/.test(before)
}

export function termPattern(terms: readonly string[]): RegExp | undefined {
  if (terms.length === 0) return undefined
  const alternatives = terms
    .toSorted((left, right) => right.length - left.length)
    .map((term) => {
      const first = term[0] ?? ''
      const rest = escapeRegExp(term.slice(1)).replace(/ /g, '\\s+')
      return first === first.toLowerCase() && first !== first.toUpperCase()
        ? `[${first}${first.toUpperCase()}]${rest}`
        : escapeRegExp(first) + rest
    })
  return new RegExp(`(?<![\\p{L}\\p{N}])(${alternatives.join('|')})(?:s|es)?(?![\\p{L}\\p{N}])`, 'gu')
}

interface LinkContext {
  readonly path: string | undefined
  readonly anchor: string | undefined
  readonly node: Link
}

export function findFirstMentions(
  specifications: readonly MentionSpecification[],
  definitions: readonly TermDefinition[],
): readonly TermMention[] {
  const byForm = new Map(
    definitions.flatMap((definition) =>
      termForms(definition.term).map((form) => [normalizeTerm(form), definition] as const),
    ),
  )
  const spellings = new Set(definitions.flatMap((definition) => termForms(definition.term)))
  // A title spelled differently from every term names a specification, e.g. "Campaign State", not the term "State".
  const titles = specifications.map((specification) => specification.title).filter((title) => !spellings.has(title))
  const titlePattern =
    titles.length === 0
      ? undefined
      : new RegExp(
          `(?<![\\p{L}\\p{N}])(?:${titles
            .toSorted((left, right) => right.length - left.length)
            .map(escapeRegExp)
            .join('|')})(?![\\p{L}\\p{N}])`,
          'gu',
        )
  const kindByPath = new Map(
    specifications.map((specification) => [specification.path, FAMILY_KIND[specification.family]]),
  )
  const pattern = termPattern([...spellings])
  if (!pattern) return []
  const mentions: TermMention[] = []

  for (const specification of specifications) {
    const kind = FAMILY_KIND[specification.family]
    const seen = new Set<string>()
    const { content } = specification.document

    const linkContext = (node: Link): LinkContext => {
      if (isExternalUrl(node.url)) return { path: undefined, anchor: undefined, node }
      const parts = splitUrl(node.url)
      const path = decodeUrlPart(parts.path)
      return {
        path: path ? resolvePath(specification.path, path) : specification.path,
        anchor: parts.fragment ? (decodeUrlPart(parts.fragment) ?? parts.fragment) : undefined,
        node,
      }
    }

    const scanText = (node: Text, link: LinkContext | undefined): void => {
      const nodeStart = node.position?.start.offset
      const text = titlePattern ? mask(node.value, titlePattern) : node.value
      for (const match of text.matchAll(pattern)) {
        const definition = byForm.get(normalizeTerm(match[1] ?? ''))
        if (!definition) continue
        const key = definition.term
        if (seen.has(key) || definition.ownerPath === specification.path) continue
        // Specifications outside Governance follow the Governance conventions without linking their terms.
        if (kindByPath.get(definition.ownerPath) === 'Governance' && kind !== 'Governance') continue
        if (link && link.path !== definition.ownerPath) continue
        const range =
          nodeStart === undefined
            ? undefined
            : sourceRange(content, nodeStart, node.value, match.index, match.index + match[0].length)
        // A capitalized one-word term opening a sentence may be an ordinary word, e.g. "State what…"; it does not count.
        const oneCapitalizedWord = !/\s/.test(match[1] ?? '') && /^\p{Lu}/u.test(match[1] ?? '')
        if (oneCapitalizedWord && range && startsSentence(content, range.start)) continue
        seen.add(key)
        const before = node.value.slice(0, match.index)
        const lineBreaks = before.split('\n').length - 1
        mentions.push({
          specificationPath: specification.path,
          term: definition.term,
          ownerPath: definition.ownerPath,
          anchor: definition.anchor,
          line: (node.position?.start.line ?? 1) + lineBreaks,
          column:
            lineBreaks === 0
              ? (node.position?.start.column ?? 1) + match.index
              : match.index - before.lastIndexOf('\n'),
          start: range?.start,
          end: range?.end,
          text: match[0],
          link: !link ? 'none' : link.anchor === definition.anchor ? 'correct' : 'other anchor',
          linkStart: link?.node.position?.start.offset,
          linkEnd: link?.node.position?.end.offset,
        })
      }
    }

    const walk = (node: Node, link: LinkContext | undefined): void => {
      if (node.type === 'inlineCode' || node.type === 'code' || node.type === 'html') return
      if (isLink(node)) {
        for (const child of node.children) walk(child, linkContext(node))
        return
      }
      if (isText(node)) {
        scanText(node, link)
        return
      }
      if (isParent(node)) for (const child of node.children) walk(child, link)
    }

    let started = false
    let skipping = false
    let inGlossary = false
    for (const child of specification.document.children) {
      if (isHeading(child)) {
        if (child.depth === 1) {
          // The first H1 is the title; it and the metadata table below it name no terms.
          skipping = !started || SKIPPED_SECTIONS.has(headingText(child))
          started = true
          inGlossary = headingText(child) === 'Glossary'
        }
        continue
      }
      if (skipping) continue
      if (isTable(child) && !inGlossary) {
        // A table's header row names its columns, not terms.
        for (const row of tableRows(child).slice(1)) for (const cell of row) walk(cell, undefined)
        continue
      }
      if (inGlossary && isTable(child)) {
        // A Glossary row's Term cell names the term itself, and its Prohibited synonyms cell names words to avoid.
        for (const row of tableRows(child).slice(1)) {
          const definition = row[1]
          if (definition) walk(definition, undefined)
        }
        continue
      }
      walk(child, undefined)
    }
  }
  return mentions
}
