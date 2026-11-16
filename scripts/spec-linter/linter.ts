import type { Blockquote, Heading, ListItem, Paragraph, RootContent, Table } from 'mdast'
import type { Node } from 'unist'

import {
  columnOf,
  findHeading,
  headingsWithSlugs,
  headingText,
  headingSlugs,
  inlineMarkdown,
  isHeading,
  isLink,
  isParent,
  isTable,
  lineOf,
  parseDocument,
  proseText,
  renderedText,
  sectionNodes,
  tableRows,
  tableText,
  tablesIn,
  textOf,
  topLevelHeadings,
  visit,
} from './markdown.ts'
import {
  FAMILY_DIAGRAM_END,
  FAMILY_DIAGRAM_START,
  FAMILY_KIND,
  FAMILY_ORDER,
  FAMILY_OVERVIEW_HEADINGS,
  familyDirectoryPath,
  familyOverviewPath,
  familyOverviewTitle,
  isFamilyOverviewCandidate,
  isSpecificationFamily,
  KIND_ORDER,
  kindOverviewPath,
  kindOverviewTitle,
} from './overviews.ts'
import { decodeUrlPart, directoryOf, isExternalUrl, normalizePath, resolvePath, splitUrl } from './paths.ts'
import { findFirstMentions, type TermMention } from './term-mentions.ts'
import type {
  Diagnostic,
  GlossaryRecord,
  LintInput,
  RelationshipRecord,
  SpecificationAnalysis,
  SpecificationCorpus,
  SpecificationFamily,
  SpecificationKind,
  SpecificationRecord,
} from './types.ts'

const DEFAULT_SPECIFICATION_ROOT = 'docs/specs'
const DEFAULT_INDEX_PATH = 'docs/specs/README.md'
const INDEX_FAMILY: SpecificationFamily = 'Conventions'
/** The Spec IDs of the conventions that the Conventions metadata row of a specification of each Specification kind links. */
const CONVENTIONS_BY_KIND: Readonly<Record<SpecificationKind, readonly string[]>> = {
  Governance: ['CONV'],
  Design: ['CONV', 'DCONV'],
  Implementation: ['CONV', 'ICONV'],
}

/**
 * The registered conventions a specification follows, under Following the conventions in Specification Conventions.
 * Conventions absent from the corpus are skipped, and no convention follows itself.
 */
function conventionsFollowedBy<T extends { readonly id?: string | undefined; readonly family?: string | undefined }>(
  specification: T,
  specifications: readonly T[],
): readonly T[] {
  if (!isSpecificationFamily(specification.family)) return []
  return CONVENTIONS_BY_KIND[FAMILY_KIND[specification.family]].flatMap((id) => {
    if (id === specification.id) return []
    const convention = specifications.find((candidate) => candidate.id === id)
    return convention ? [convention] : []
  })
}
const PERSONAS = [
  'Game designer',
  'Engine designer',
  'Content designer',
  'UI designer',
  'AI designer',
  'Implementer',
  'Player',
]
const FRAMING_HEADINGS = ['Overview', 'Relationships', 'Glossary']
const TODOS_HEADING = 'TODOs'
const RENAMED_TODOS_HEADING = 'Open decisions'
const CLOSING_HEADINGS = ['Edge cases and failure behavior', 'Acceptance examples', TODOS_HEADING]
const TODO_PREFIX = /^TODO(?: \(later\))?:/
const BLOCKING_TODO_PREFIX = 'TODO:'
const OVERVIEW_WORD_LIMIT = 200
const GLOSSARY_INTRODUCTION_SENTENCE_LIMIT = 2
const DOCUMENT_DESCRIBING_PHRASES =
  /\bthis document (?:defines|states|owns|describes|specifies|refines)\b|\bdoes not own\b|\bownership pointer\b|\bfollows? constraints on\b/gi
const GENERIC_TOPIC_HEADINGS = /^(?:Concepts and contract|Concepts|Contract|Requirements|Details|Specification)$/i
const REMOVED_HEADINGS =
  /^(?:Terms|Terminology|Vocabulary|Background references?|Downstream ownership(?: \(informative\))?|Source basis)(?: \(informative\))?$/i
const PROHIBITED_RELATIONSHIP_TERMS = /\b(?:source|target|upstream|downstream|dependee|inbound|outbound|edge|node)\b/i

interface Metadata {
  readonly values: ReadonlyMap<string, string>
  readonly table: Table | undefined
}

interface Specification {
  readonly path: string
  readonly document: ReturnType<typeof parseDocument>
  readonly metadata: Metadata
  readonly id: string | undefined
  readonly family: string | undefined
  readonly title: string
}

interface RegistryEntry {
  readonly id: string
  readonly family: string
  readonly title: string
  readonly path: string
  readonly owns: string
}

interface GlossaryTerm {
  readonly term: string
  readonly definitionMarkdown: string
  readonly prohibitedSynonymsMarkdown: string
  readonly specification: Specification
  readonly node: Node
  /** The anchor of the Glossary group heading above the term's table, or of the Glossary heading when it has none. */
  readonly anchor: string
}

interface FamilyOverview {
  readonly path: string
  readonly document: ReturnType<typeof parseDocument>
}

interface ParsedInput {
  readonly specifications: readonly Specification[]
  readonly overviews: readonly FamilyOverview[]
  readonly allDocuments: ReadonlyMap<string, ReturnType<typeof parseDocument>>
  readonly exactPaths: ReadonlySet<string>
  readonly casePaths: ReadonlyMap<string, string>
  readonly indexPath: string
  readonly specificationRoot: string
}

function isParagraph(node: Node): node is Paragraph {
  return node.type === 'paragraph'
}

function isBlockquote(node: Node): node is Blockquote {
  return node.type === 'blockquote'
}

function isListItem(node: Node): node is ListItem {
  return node.type === 'listItem'
}

function addDiagnostic(
  diagnostics: Diagnostic[],
  path: string,
  node: Node | undefined,
  code: string,
  message: string,
): void {
  diagnostics.push({
    code,
    path,
    line: lineOf(node),
    column: columnOf(node),
    message,
  })
}

function parseMetadata(path: string, document: ReturnType<typeof parseDocument>, diagnostics: Diagnostic[]): Metadata {
  const title = document.children[0]
  const table = document.children[1]
  if (!title || !isHeading(title) || title.depth !== 1) {
    addDiagnostic(diagnostics, path, title, 'SPEC101', 'The first document element must be the document-title H1.')
  }
  if (!table || !isTable(table)) {
    addDiagnostic(
      diagnostics,
      path,
      table ?? title,
      'SPEC102',
      'A metadata table must immediately follow the document title.',
    )
    return { values: new Map(), table: undefined }
  }
  const rows = tableText(table)
  if (rows[0]?.[0] !== 'Metadata' || rows[0]?.[1] !== 'Value' || rows[0]?.length !== 2) {
    addDiagnostic(diagnostics, path, table, 'SPEC103', 'The metadata table header must be "Metadata | Value".')
  }
  const values = new Map<string, string>()
  for (const row of rows.slice(1)) {
    const key = row[0]
    const value = row[1]
    if (key && value !== undefined) values.set(key, value)
  }
  return { values, table }
}

function parseInput(input: LintInput, diagnostics: Diagnostic[]): ParsedInput {
  const specificationRoot = normalizePath(input.specificationRoot ?? DEFAULT_SPECIFICATION_ROOT)
  const indexPath = normalizePath(input.indexPath ?? DEFAULT_INDEX_PATH)
  const allDocuments = new Map<string, ReturnType<typeof parseDocument>>()
  const exactPaths = new Set<string>()
  const casePaths = new Map<string, string>()
  for (const file of input.files) {
    const filePath = normalizePath(file.path)
    if (exactPaths.has(filePath)) {
      addDiagnostic(
        diagnostics,
        filePath,
        undefined,
        'SPEC001',
        'The input contains the same file path more than once.',
      )
      continue
    }
    exactPaths.add(filePath)
    const lowercasePath = filePath.toLowerCase()
    const caseMatch = casePaths.get(lowercasePath)
    if (caseMatch && caseMatch !== filePath) {
      addDiagnostic(
        diagnostics,
        filePath,
        undefined,
        'SPEC002',
        `File paths differ only by casing: "${caseMatch}" and "${filePath}".`,
      )
    }
    casePaths.set(lowercasePath, filePath)
    if (filePath.endsWith('.md')) {
      allDocuments.set(filePath, parseDocument({ path: filePath, content: file.content }))
    }
  }
  const specifications: Specification[] = []
  const overviews: FamilyOverview[] = []
  for (const [filePath, document] of allDocuments) {
    if (!filePath.startsWith(`${specificationRoot}/`)) continue
    if (isFamilyOverviewCandidate(specificationRoot, filePath)) {
      overviews.push({ path: filePath, document })
      continue
    }
    const metadata = parseMetadata(filePath, document, diagnostics)
    const first = document.children[0]
    specifications.push({
      path: filePath,
      document,
      metadata,
      id: metadata.values.get('Spec ID'),
      family: metadata.values.get('Family'),
      title: first && isHeading(first) ? headingText(first) : '',
    })
  }
  return { specifications, overviews, allDocuments, exactPaths, casePaths, indexPath, specificationRoot }
}

/**
 * Builds the specification registry from metadata: every specification under the specification root, other than a
 * Family overview, is registered by its own metadata table.
 */
function registryEntries(
  parsed: ParsedInput,
  index: Specification | undefined,
  diagnostics: Diagnostic[],
): readonly RegistryEntry[] {
  if (!index) {
    addDiagnostic(diagnostics, parsed.indexPath, undefined, 'SPEC003', 'The specification index is missing.')
  }
  const entries: RegistryEntry[] = []
  for (const specification of parsed.specifications) {
    const owns = (specification.metadata.values.get('Owns') ?? '').replace(/\s+/g, ' ').trim()
    if (!owns) {
      addDiagnostic(
        diagnostics,
        specification.path,
        specification.metadata.table,
        'SPEC113',
        'Metadata must define a nonempty Owns summary.',
      )
    }
    if (!specification.id || !specification.family) continue
    entries.push({
      id: specification.id,
      family: specification.family,
      title: specification.title,
      path: specification.path,
      owns,
    })
  }
  return entries
}

function conventionsRowLinks(specification: Specification): ReadonlySet<string> | undefined {
  const table = specification.metadata.table
  if (!table) return undefined
  const row = tableRows(table).find((cells) => cells[0] && textOf(cells[0]).trim() === 'Conventions')
  const value = row?.[1]
  if (!value) return undefined
  const links = new Set<string>()
  visit(value, (node) => {
    if (!isLink(node) || isExternalUrl(node.url)) return
    const decoded = decodeUrlPart(splitUrl(node.url).path)
    if (decoded) links.add(resolvePath(specification.path, decoded))
  })
  return links
}

function validateConventionsRow(parsed: ParsedInput, specification: Specification, diagnostics: Diagnostic[]): void {
  if (specification.path === parsed.indexPath || specification.id === 'CONV') return
  if (!isSpecificationFamily(specification.family)) return
  const required = conventionsFollowedBy(specification, parsed.specifications)
  if (required.length === 0) return
  const links = conventionsRowLinks(specification)
  const expected = new Set(required.map((convention) => convention.path))
  if (links && links.size === expected.size && [...expected].every((path) => links.has(path))) return
  addDiagnostic(
    diagnostics,
    specification.path,
    specification.metadata.table,
    'SPEC115',
    `The Conventions metadata row of a ${FAMILY_KIND[specification.family]} specification must link exactly ${required
      .map((convention) => convention.title)
      .join(' and ')}.`,
  )
}

function validateMetadata(parsed: ParsedInput, diagnostics: Diagnostic[]): void {
  const metadataIds = new Map<string, Specification[]>()
  for (const specification of parsed.specifications) {
    validateConventionsRow(parsed, specification, diagnostics)
    if (!specification.id) {
      addDiagnostic(
        diagnostics,
        specification.path,
        specification.metadata.table,
        'SPEC104',
        'Metadata must define a nonempty Spec ID.',
      )
    } else {
      const matches = metadataIds.get(specification.id) ?? []
      matches.push(specification)
      metadataIds.set(specification.id, matches)
    }
    if (specification.metadata.values.has('Status')) {
      addDiagnostic(
        diagnostics,
        specification.path,
        specification.metadata.table,
        'SPEC105',
        'Specifications have no status; remove the Status metadata row.',
      )
    }
    if (!isSpecificationFamily(specification.family)) {
      addDiagnostic(
        diagnostics,
        specification.path,
        specification.metadata.table,
        'SPEC109',
        `Metadata Family must be one of ${FAMILY_ORDER.join(', ')}.`,
      )
    } else {
      const relativePath = specification.path.slice(parsed.specificationRoot.length + 1)
      const actualDirectory = directoryOf(relativePath)
      const expectedDirectory = specification.path === parsed.indexPath ? '' : familyDirectoryPath(specification.family)
      if (
        actualDirectory !== expectedDirectory ||
        (specification.path === parsed.indexPath && specification.family !== INDEX_FAMILY)
      ) {
        addDiagnostic(
          diagnostics,
          specification.path,
          specification.metadata.table,
          'SPEC110',
          specification.path === parsed.indexPath
            ? `The specification index must use Family ${INDEX_FAMILY} and remain at ${parsed.indexPath}.`
            : `Family ${specification.family} specifications must be direct children of ${parsed.specificationRoot}/${expectedDirectory}.`,
        )
      }
    }
    const audience = (specification.metadata.values.get('Audience') ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
    const ranks = audience.map((value) => PERSONAS.indexOf(value))
    if (
      audience.length === 0 ||
      ranks.some((rank, index) => rank < 0 || (index > 0 && rank <= (ranks[index - 1] ?? -1)))
    ) {
      addDiagnostic(
        diagnostics,
        specification.path,
        specification.metadata.table,
        'SPEC112',
        `Metadata Audience must list one or more distinct Personas in this order: ${PERSONAS.join(', ')}.`,
      )
    }
    if (specification.metadata.values.has('Scope')) {
      addDiagnostic(
        diagnostics,
        specification.path,
        specification.metadata.table,
        'SPEC111',
        'Scope belongs in Overview, not in metadata.',
      )
    }
    if (specification.metadata.values.has('Binding')) {
      addDiagnostic(
        diagnostics,
        specification.path,
        specification.metadata.table,
        'SPEC114',
        'Binding follows from the Family of an Implementation specification; remove the Binding metadata row.',
      )
    }
  }
  for (const [id, duplicates] of metadataIds) {
    if (duplicates.length < 2) continue
    for (const duplicate of duplicates) {
      addDiagnostic(
        diagnostics,
        duplicate.path,
        duplicate.metadata.table,
        'SPEC108',
        `Metadata Spec ID "${id}" is used by more than one specification.`,
      )
    }
  }
}

function validateSectionContent(specification: Specification, heading: Heading, diagnostics: Diagnostic[]): void {
  const nodes = sectionNodes(specification.document, heading)
  if (nodes.every((node) => textOf(node).trim() === '')) {
    addDiagnostic(
      diagnostics,
      specification.path,
      heading,
      'SPEC204',
      `Section "${headingText(heading)}" must not be empty; omit a section that does not apply.`,
    )
  }
  const content = nodes
    .map((node) => textOf(node).trim())
    .filter(Boolean)
    .join(' ')
  if (content === 'N/A' || content === 'None.' || /^Not applicable\b/i.test(content)) {
    addDiagnostic(
      diagnostics,
      specification.path,
      heading,
      'SPEC205',
      `Section "${headingText(heading)}" must be omitted instead of containing a placeholder.`,
    )
  }
}

/**
 * Reports a topic section or topic subsection whose first content is not a paragraph, i.e. one that opens with a list,
 * table, code block, quotation, or subsection instead of a lead.
 */
function validateLead(specification: Specification, heading: Heading, diagnostics: Diagnostic[]): void {
  const first = sectionNodes(specification.document, heading).find((node) => node.type !== 'html')
  if (!first || first.type === 'paragraph') return
  addDiagnostic(
    diagnostics,
    specification.path,
    heading,
    'SPEC216',
    `Section "${headingText(heading)}" must open with a lead paragraph before any list, table, or subsection.`,
  )
}

function validateLayout(specifications: readonly Specification[], diagnostics: Diagnostic[]): void {
  for (const specification of specifications) {
    const headings = specification.document.headings
    const h1s = topLevelHeadings(specification.document)
    if (h1s.length === 0 || lineOf(h1s[0]) !== 1) {
      addDiagnostic(
        diagnostics,
        specification.path,
        headings[0],
        'SPEC201',
        'The document title must be an H1 at line 1.',
      )
    }
    let previousHeading: Heading | undefined
    for (const heading of headings) {
      const text = headingText(heading)
      if (previousHeading && heading.depth > previousHeading.depth + 1) {
        addDiagnostic(
          diagnostics,
          specification.path,
          heading,
          'SPEC211',
          `Heading depth must not skip from H${previousHeading.depth} to H${heading.depth}.`,
        )
      }
      if (/^\d+(?:\.\d+)*[.)]?\s/.test(text)) {
        addDiagnostic(
          diagnostics,
          specification.path,
          heading,
          'SPEC202',
          'Major and subsection headings must not be numbered.',
        )
      }
      if (REMOVED_HEADINGS.test(text)) {
        addDiagnostic(
          diagnostics,
          specification.path,
          heading,
          'SPEC203',
          `Heading "${text}" is prohibited by Specification Conventions.`,
        )
      }
      previousHeading = heading
    }

    const overview = findHeading(specification.document, 1, 'Overview')
    const relationships = findHeading(specification.document, 1, 'Relationships')
    const glossary = findHeading(specification.document, 1, 'Glossary')
    const universal = [overview, relationships, glossary]
    const presentUniversal = universal.filter((heading): heading is Heading => heading !== undefined)
    if (!overview) {
      addDiagnostic(
        diagnostics,
        specification.path,
        specification.document.children[0],
        'SPEC206',
        'Every specification must contain an Overview H1 section.',
      )
    } else if (
      presentUniversal.some((heading, index) => index > 0 && lineOf(heading) <= lineOf(presentUniversal[index - 1]))
    ) {
      addDiagnostic(
        diagnostics,
        specification.path,
        overview,
        'SPEC207',
        'Universal sections must appear in Overview, Relationships, Glossary order.',
      )
    }

    if (relationships && sectionNodes(specification.document, relationships).some(isHeading)) {
      addDiagnostic(
        diagnostics,
        specification.path,
        relationships,
        'SPEC208',
        'Relationships must be a flat list without subsections.',
      )
    }
    if (relationships && glossary && h1s.indexOf(glossary) !== h1s.indexOf(relationships) + 1) {
      addDiagnostic(
        diagnostics,
        specification.path,
        relationships,
        'SPEC207',
        'Glossary must immediately follow Relationships.',
      )
    }
    for (const heading of universal) {
      if (heading) validateSectionContent(specification, heading, diagnostics)
    }

    const topLevel = h1s.slice(1)
    // A renamed TODOs section is reported once by SPEC213 and otherwise ordered as the TODOs section it replaces.
    const closingName = (text: string): string => (text === RENAMED_TODOS_HEADING ? TODOS_HEADING : text)
    const category = (text: string): number => {
      if (FRAMING_HEADINGS.includes(text)) return 0
      if (CLOSING_HEADINGS.includes(closingName(text))) return 2
      if (text.startsWith('Appendix')) return 3
      return 1
    }
    let previousCategory = 0
    let previousClosing = -1
    let orderReported = false
    for (const heading of topLevel) {
      const text = headingText(heading)
      if (text === RENAMED_TODOS_HEADING) {
        addDiagnostic(
          diagnostics,
          specification.path,
          heading,
          'SPEC213',
          `Section "${RENAMED_TODOS_HEADING}" has been renamed; rename it to "# ${TODOS_HEADING}".`,
        )
      }
      const current = category(text)
      const closing = CLOSING_HEADINGS.indexOf(closingName(text))
      const outOfOrder = current < previousCategory || (closing >= 0 && closing <= previousClosing)
      if (outOfOrder && !orderReported) {
        orderReported = true
        addDiagnostic(
          diagnostics,
          specification.path,
          heading,
          current === 3 || previousCategory === 3 ? 'SPEC210' : 'SPEC209',
          'H1 sections must follow this order: Overview, Relationships, Glossary, topic sections, ' +
            CLOSING_HEADINGS.join(', ') +
            ', appendices.',
        )
      }
      previousCategory = Math.max(previousCategory, current)
      if (closing >= 0) previousClosing = Math.max(previousClosing, closing)
      if (current === 1 && GENERIC_TOPIC_HEADINGS.test(text)) {
        addDiagnostic(
          diagnostics,
          specification.path,
          heading,
          'SPEC212',
          `Topic heading "${text}" is generic; name the section after its subject.`,
        )
      }
      if (current === 1 || current === 2) validateSectionContent(specification, heading, diagnostics)
      if (current === 1) {
        validateLead(specification, heading, diagnostics)
        for (const node of sectionNodes(specification.document, heading)) {
          if (isHeading(node) && node.depth === 2) validateLead(specification, node, diagnostics)
        }
      }
    }
    if (overview) validateOverviewLength(specification, overview, diagnostics)
    validateDocumentDescribingPhrases(specification, diagnostics)
  }
}

function wordCount(text: string): number {
  return text.split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word)).length
}

function validateOverviewLength(specification: Specification, overview: Heading, diagnostics: Diagnostic[]): void {
  const words = wordCount(sectionNodes(specification.document, overview).map(renderedText).join(' '))
  if (words > OVERVIEW_WORD_LIMIT) {
    addDiagnostic(
      diagnostics,
      specification.path,
      overview,
      'SPEC214',
      `Overview has ${words} words; it must have at most ${OVERVIEW_WORD_LIMIT}.`,
    )
  }
}

/**
 * Removes text inside straight or curly double quotation marks, so quoted phrases can be discussed without being used.
 */
function withoutQuotations(text: string): string {
  return text.replace(/"[^"]*"/g, ' ').replace(/“[^”]*”/g, ' ')
}

function validateDocumentDescribingPhrases(specification: Specification, diagnostics: Diagnostic[]): void {
  const walk = (node: Node): void => {
    if (isBlockquote(node) || node.type === 'code' || node.type === 'html') return
    if (node.type === 'paragraph' || node.type === 'heading' || node.type === 'tableCell') {
      const text = withoutQuotations(proseText(node).replace(/\s+/g, ' '))
      for (const match of text.matchAll(DOCUMENT_DESCRIBING_PHRASES)) {
        addDiagnostic(
          diagnostics,
          specification.path,
          node,
          'SPEC215',
          `Phrase "${match[0]}" describes the document; write about the subject instead.`,
        )
      }
      return
    }
    if (isParent(node)) for (const child of node.children) walk(child)
  }
  walk(specification.document.tree)
}

function validateLinks(parsed: ParsedInput, diagnostics: Diagnostic[]): void {
  const slugCache = new Map<string, ReadonlySet<string>>()
  for (const specification of [...parsed.specifications, ...parsed.overviews]) {
    visit(specification.document.tree, (node) => {
      if (!isLink(node) || isExternalUrl(node.url)) return
      const parts = splitUrl(node.url)
      const decodedPath = decodeUrlPart(parts.path)
      const decodedFragment = parts.fragment === undefined ? undefined : decodeUrlPart(parts.fragment)
      if (decodedPath === undefined || (parts.fragment !== undefined && decodedFragment === undefined)) {
        addDiagnostic(
          diagnostics,
          specification.path,
          node,
          'SPEC301',
          `Local link "${node.url}" is not valid percent-encoding.`,
        )
        return
      }
      const destinationPath = decodedPath ? resolvePath(specification.path, decodedPath) : specification.path
      const destination = parsed.allDocuments.get(destinationPath)
      if (!destination) {
        const actual = parsed.casePaths.get(destinationPath.toLowerCase())
        addDiagnostic(
          diagnostics,
          specification.path,
          node,
          actual ? 'SPEC302' : 'SPEC303',
          actual
            ? `Local link path casing differs from "${actual}".`
            : `Local link destination "${destinationPath}" does not exist.`,
        )
        return
      }
      if (decodedFragment) {
        let slugs = slugCache.get(destinationPath)
        if (!slugs) {
          slugs = headingSlugs(destination)
          slugCache.set(destinationPath, slugs)
        }
        if (!slugs.has(decodedFragment)) {
          addDiagnostic(
            diagnostics,
            specification.path,
            node,
            'SPEC304',
            `Local link anchor "#${decodedFragment}" does not exist in "${destinationPath}".`,
          )
        }
      }
    })
  }
}

function validateFamilyOverviews(parsed: ParsedInput, diagnostics: Diagnostic[]): void {
  const overviewsByPath = new Map(parsed.overviews.map((overview) => [overview.path, overview]))
  const expectedPaths = new Set<string>()
  for (const family of FAMILY_ORDER) {
    const members = parsed.specifications.filter((specification) => specification.family === family)
    const path = familyOverviewPath(parsed.specificationRoot, family)
    expectedPaths.add(path)
    if (members.length === 0) continue
    const overview = overviewsByPath.get(path)
    if (!overview) {
      addDiagnostic(
        diagnostics,
        path,
        undefined,
        'SPEC702',
        `The ${family} family has registered specifications but no family overview at ${path}.`,
      )
      continue
    }
    validateFamilyOverview(overview, family, members, diagnostics)
  }
  for (const kind of KIND_ORDER) {
    const families = FAMILY_ORDER.filter(
      (family) =>
        FAMILY_KIND[family] === kind && parsed.specifications.some((specification) => specification.family === family),
    )
    const path = kindOverviewPath(parsed.specificationRoot, kind)
    expectedPaths.add(path)
    if (families.length === 0) continue
    const overview = overviewsByPath.get(path)
    if (!overview) {
      addDiagnostic(
        diagnostics,
        path,
        undefined,
        'SPEC702',
        `${kind} specifications exist but there is no Specification kind overview at ${path}.`,
      )
      continue
    }
    validateKindOverview(
      overview,
      kind,
      families.map((family) => familyOverviewPath(parsed.specificationRoot, family)),
      diagnostics,
    )
  }
  for (const overview of parsed.overviews) {
    if (expectedPaths.has(overview.path)) continue
    addDiagnostic(
      diagnostics,
      overview.path,
      undefined,
      'SPEC701',
      'Overviews must be named about-<directory>.md and placed directly in a Specification kind or Family directory.',
    )
  }
}

function linkedLocalPaths(document: FamilyOverview['document'], path: string): ReadonlySet<string> {
  const linkedPaths = new Set<string>()
  visit(document.tree, (node) => {
    if (!isLink(node) || isExternalUrl(node.url)) return
    const decoded = decodeUrlPart(splitUrl(node.url).path)
    if (decoded) linkedPaths.add(resolvePath(path, decoded))
  })
  return linkedPaths
}

function validateKindOverview(
  overview: FamilyOverview,
  kind: SpecificationKind,
  familyOverviewPaths: readonly string[],
  diagnostics: Diagnostic[],
): void {
  const { document, path } = overview
  const title = document.children[0]
  const expectedTitle = kindOverviewTitle(kind)
  if (!title || !isHeading(title) || title.depth !== 1 || headingText(title) !== expectedTitle) {
    addDiagnostic(
      diagnostics,
      path,
      title,
      'SPEC703',
      `The first element of a Specification kind overview must be the H1 "${expectedTitle}".`,
    )
  }
  const linkedPaths = linkedLocalPaths(document, path)
  for (const familyOverview of familyOverviewPaths) {
    if (linkedPaths.has(familyOverview)) continue
    addDiagnostic(
      diagnostics,
      path,
      undefined,
      'SPEC706',
      `The Specification kind overview must link the overview of every ${kind} Family; "${familyOverview}" is not linked.`,
    )
  }
}

function validateFamilyOverview(
  overview: FamilyOverview,
  family: SpecificationFamily,
  members: readonly Specification[],
  diagnostics: Diagnostic[],
): void {
  const { document, path } = overview
  const title = document.children[0]
  const expectedTitle = familyOverviewTitle(family)
  if (!title || !isHeading(title) || title.depth !== 1 || headingText(title) !== expectedTitle) {
    addDiagnostic(
      diagnostics,
      path,
      title,
      'SPEC703',
      `The first element of a family overview must be the H1 "${expectedTitle}".`,
    )
  }
  const sectionHeadings = topLevelHeadings(document).slice(1)
  const sectionTitles = sectionHeadings.map(headingText)
  let searchFrom = 0
  for (const required of FAMILY_OVERVIEW_HEADINGS) {
    const index = sectionTitles.indexOf(required, searchFrom)
    if (index === -1) {
      addDiagnostic(
        diagnostics,
        path,
        undefined,
        'SPEC704',
        `Family overviews must contain the H1 sections ${FAMILY_OVERVIEW_HEADINGS.map((heading) => `"${heading}"`).join(', ')} in that order; "${required}" is missing or out of order.`,
      )
      break
    }
    searchFrom = index + 1
  }

  const markers = document.children.filter(
    (node): node is RootContent & { value: string } =>
      node.type === 'html' && 'value' in node && typeof node.value === 'string',
  )
  const starts = markers.filter((node) => node.value.trim() === FAMILY_DIAGRAM_START)
  const ends = markers.filter((node) => node.value.trim() === FAMILY_DIAGRAM_END)
  const relateHeading = sectionHeadings.find((heading) => headingText(heading) === 'How they relate')
  const relateSection = relateHeading ? sectionNodes(document, relateHeading) : []
  const start = starts[0]
  const end = ends[0]
  if (
    starts.length !== 1 ||
    ends.length !== 1 ||
    !start ||
    !end ||
    lineOf(start) > lineOf(end) ||
    !relateSection.includes(start) ||
    !relateSection.includes(end)
  ) {
    addDiagnostic(
      diagnostics,
      path,
      start ?? relateHeading,
      'SPEC705',
      `The "How they relate" section must contain exactly one "${FAMILY_DIAGRAM_START}" followed by one "${FAMILY_DIAGRAM_END}" marker, each on its own line.`,
    )
  }

  const linkedPaths = linkedLocalPaths(document, path)
  for (const member of members) {
    if (linkedPaths.has(member.path)) continue
    addDiagnostic(
      diagnostics,
      path,
      undefined,
      'SPEC706',
      `The family overview must link every ${family} specification; "${member.path}" is not linked.`,
    )
  }
}

/** Rejects a Relationships section: references between specifications are derived from their links instead. */
function validateNoRelationshipsSection(specifications: readonly Specification[], diagnostics: Diagnostic[]): void {
  for (const specification of specifications) {
    const heading = findHeading(specification.document, 1, 'Relationships')
    if (!heading) continue
    addDiagnostic(
      diagnostics,
      specification.path,
      heading,
      'SPEC401',
      'A specification has no Relationships section; its references are derived from the links in its text.',
    )
  }
}

const PROHIBITED_SYNONYMS_HEADING = 'Prohibited synonyms'

function termTableHeader(table: Table): readonly string[] | undefined {
  return tableRows(table)[0]?.map((cell) => textOf(cell).trim())
}

function isTermTable(table: Table): boolean {
  const header = termTableHeader(table)
  return header?.[0] === 'Term' && header[1] === 'Definition'
}

/** A Term and Definition table may add one Prohibited synonyms column, under Glossary Conventions. */
function hasProhibitedSynonymsColumn(table: Table): boolean {
  return termTableHeader(table)?.[2] === PROHIBITED_SYNONYMS_HEADING
}

/**
 * Counts sentences deterministically: each run of ".", "?", or "!" (optionally followed by closing quotation marks or
 * parentheses) that is followed by whitespace or the end of the text ends a sentence, and trailing text without such an
 * ending is one more sentence. The abbreviations "e.g." and "i.e." do not end a sentence. Callers pass prose text, which
 * already excludes link targets and code spans.
 */
function sentenceCount(text: string): number {
  const normalized = text
    .replace(/\b(?:e\.g|i\.e)\./gi, 'eg')
    .replace(/\s+/g, ' ')
    .trim()
  if (!normalized) return 0
  const endings = [...normalized.matchAll(/[.?!]+["'”’)]*(?=\s|$)/g)]
  const last = endings.at(-1)
  const trailing = last ? normalized.slice((last.index ?? 0) + last[0].length).trim() : normalized
  return endings.length + (trailing ? 1 : 0)
}

function validateGlossaryIntroduction(
  specification: Specification,
  nodes: readonly RootContent[],
  diagnostics: Diagnostic[],
): void {
  const end = nodes.findIndex((node) => isTable(node) || isHeading(node))
  const introduction = nodes.slice(0, end < 0 ? nodes.length : end)
  const sentences = sentenceCount(introduction.map(proseText).join(' '))
  if (sentences > GLOSSARY_INTRODUCTION_SENTENCE_LIMIT) {
    addDiagnostic(
      diagnostics,
      specification.path,
      introduction[0],
      'SPEC506',
      `The Glossary introduction has ${sentences} sentences; it must have at most ${GLOSSARY_INTRODUCTION_SENTENCE_LIMIT}.`,
    )
  }
}

function validateGlossaryGroups(specification: Specification, glossary: Heading, diagnostics: Diagnostic[]): void {
  const nodes = sectionNodes(specification.document, glossary)
  validateGlossaryIntroduction(specification, nodes, diagnostics)
  const report = (node: Node | undefined, message: string): void =>
    addDiagnostic(diagnostics, specification.path, node, 'SPEC505', message)
  const groupStarts: number[] = []
  nodes.forEach((node, index) => {
    if (!isHeading(node)) return
    if (node.depth === 2) groupStarts.push(index)
    else report(node, 'Glossary must not contain headings deeper than H2.')
  })
  if (groupStarts.length === 0) {
    const tables = tablesIn(nodes).filter(isTermTable)
    if (tables.length > 1) {
      report(tables[1], 'An ungrouped Glossary must contain exactly one Term and Definition table.')
    }
    return
  }
  const firstGroup = nodes[groupStarts[0] ?? 0]
  if (groupStarts.length < 2) {
    report(firstGroup, 'A grouped Glossary must contain at least two groups; otherwise use one ungrouped table.')
  }
  for (const table of tablesIn(nodes.slice(0, groupStarts[0])).filter(isTermTable)) {
    report(table, 'In a grouped Glossary, every Term and Definition table must belong to an H2 group.')
  }
  groupStarts.forEach((start, position) => {
    const heading = nodes[start]
    const end = groupStarts[position + 1] ?? nodes.length
    const body = nodes.slice(start + 1, end).filter((node) => !isHeading(node))
    const tables = tablesIn(body)
    const table = tables[0]
    if (tables.length !== 1 || !table || !isTermTable(table)) {
      report(heading, 'Each Glossary group must contain exactly one Term and Definition table.')
      return
    }
    const tableIndex = body.indexOf(table)
    const description = body.slice(0, tableIndex)
    if (!description.some((node) => node.type === 'paragraph' && textOf(node).trim())) {
      report(heading, 'Each Glossary group must start with a description before its table.')
    }
    if (tableRows(table).length - 1 < 2) {
      report(heading, 'Each Glossary group must contain at least two terms.')
    }
  })
}

function glossaryTerms(specification: Specification, diagnostics: Diagnostic[]): readonly GlossaryTerm[] {
  const glossary = findHeading(specification.document, 1, 'Glossary')
  if (!glossary) return []
  validateGlossaryGroups(specification, glossary, diagnostics)
  const terms: GlossaryTerm[] = []
  const termTables = tablesIn(sectionNodes(specification.document, glossary)).filter(isTermTable)
  const withSynonyms = termTables.filter(hasProhibitedSynonymsColumn)
  for (const table of termTables) {
    const header = termTableHeader(table) ?? []
    if (
      header.length > 3 ||
      (header.length === 3 && !hasProhibitedSynonymsColumn(table)) ||
      (withSynonyms.length > 0 && !hasProhibitedSynonymsColumn(table))
    ) {
      addDiagnostic(
        diagnostics,
        specification.path,
        table,
        'SPEC507',
        `A Term and Definition table may add only a "${PROHIBITED_SYNONYMS_HEADING}" column, and then every table of the Glossary must have it.`,
      )
    }
  }
  const slugs = new Map(headingsWithSlugs(specification.document).map(({ heading, slug }) => [heading, slug]))
  const anchors = new Map<Node, string>()
  let group: Heading = glossary
  for (const node of sectionNodes(specification.document, glossary)) {
    if (isHeading(node) && node.depth === 2) group = node
    if (isTable(node)) anchors.set(node, slugs.get(group) ?? 'glossary')
  }
  for (const table of termTables) {
    const anchor = anchors.get(table) ?? 'glossary'
    const rows = tableRows(table)
    const columns = rows[0]?.length ?? 2
    for (const row of rows.slice(1)) {
      const cell = row[0]
      const definitionCell = row[1]
      const synonymsCell = row[2]
      const definition = definitionCell ? inlineMarkdown(definitionCell) : ''
      if (
        row.length !== columns ||
        !cell ||
        !definitionCell ||
        !textOf(cell).trim() ||
        !textOf(definitionCell).trim()
      ) {
        addDiagnostic(
          diagnostics,
          specification.path,
          cell ?? table,
          'SPEC504',
          'Every glossary row must contain a nonempty Term and Definition.',
        )
        continue
      }
      const term = textOf(cell).replace(/\s+/g, ' ').trim()
      if (/\//.test(term) || /\b(?:or|aka|a\.k\.a\.)\b/i.test(term)) {
        addDiagnostic(
          diagnostics,
          specification.path,
          cell,
          'SPEC503',
          `Glossary term "${term}" must not declare aliases or slash-separated alternatives.`,
        )
      }
      terms.push({
        term,
        definitionMarkdown: definition,
        prohibitedSynonymsMarkdown: synonymsCell ? inlineMarkdown(synonymsCell) : '',
        specification,
        node: cell,
        anchor,
      })
    }
  }
  return terms
}

function validateTerminology(
  specifications: readonly Specification[],
  diagnostics: Diagnostic[],
): readonly GlossaryTerm[] {
  const owners = new Map<string, Specification>()
  const terms: GlossaryTerm[] = []
  for (const specification of specifications) {
    for (const sectionName of ['Relationships', 'Glossary']) {
      const heading = findHeading(specification.document, 1, sectionName)
      if (!heading) continue
      // A Prohibited synonyms cell names the very words it prohibits, so it is not scanned.
      const synonymNodes = new Set<Node>()
      for (const table of tablesIn(sectionNodes(specification.document, heading)).filter(hasProhibitedSynonymsColumn)) {
        for (const row of tableRows(table).slice(1)) {
          const cell = row[2]
          if (cell) visit(cell, (node) => synonymNodes.add(node))
        }
      }
      for (const node of sectionNodes(specification.document, heading)) {
        visit(node, (descendant) => {
          if (synonymNodes.has(descendant)) return
          // Check whole inline phrases so emphasis cannot hide a competing relationship term.
          if (descendant.type === 'paragraph' || descendant.type === 'tableCell') {
            const match = /\brelationship\s+types?\b/i.exec(textOf(descendant))
            if (match) {
              addDiagnostic(
                diagnostics,
                specification.path,
                descendant,
                'SPEC501',
                `Prohibited formal relationship term "${match[0]}" appears in ${sectionName}.`,
              )
            }
          }
          if (!('value' in descendant) || typeof descendant.value !== 'string') {
            return
          }
          // Modeling Types and programming types are distinct from relationship kinds.
          let relationshipText = descendant.value.replace(/\bTypeScript\s+types?\b/gi, '')
          // These phrases describe model references, not specification relationships.
          if (sectionName === 'Glossary' && /\breference stored in Constants\b/.test(relationshipText)) {
            relationshipText = relationshipText.replace(/\bfixed target\b|\btarget[’']s State\b/g, '')
          }
          const match = PROHIBITED_RELATIONSHIP_TERMS.exec(relationshipText)
          if (match) {
            addDiagnostic(
              diagnostics,
              specification.path,
              descendant,
              'SPEC501',
              `Prohibited formal relationship term "${match[0]}" appears in ${sectionName}.`,
            )
          }
        })
      }
    }
    for (const entry of glossaryTerms(specification, diagnostics)) {
      terms.push(entry)
      const normalized = entry.term.toLocaleLowerCase('en-US').replace(/\s+/g, ' ')
      const owner = owners.get(normalized)
      if (owner) {
        addDiagnostic(
          diagnostics,
          specification.path,
          entry.node,
          'SPEC502',
          `Glossary term "${entry.term}" is already owned by ${owner.id ?? owner.path}.`,
        )
      } else {
        owners.set(normalized, specification)
      }
    }
  }
  return terms
}

interface Todo {
  readonly node: Node
  readonly blocking: boolean
  readonly inTodosSection: boolean
}

/**
 * Returns the TODO prefix text of a paragraph or list item, read from its prose so that code spans such as `TODO:`
 * that quote the marker are not TODOs.
 */
function todoText(node: Node): string | undefined {
  const first = isListItem(node) ? node.children[0] : node
  if (!first || !isParagraph(first)) return undefined
  const text = proseText(first).trim()
  return TODO_PREFIX.test(text) ? text : undefined
}

/**
 * Finds every paragraph or list item beginning with a TODO marker outside quoted material (blockquotes and fenced
 * code). A TODO list item is reported once, not again through its first paragraph.
 */
function todoNodes(specification: Specification): readonly Todo[] {
  const todos: Todo[] = []
  let inTodosSection = false
  const walk = (node: Node, skip: Node | undefined): void => {
    if (isBlockquote(node) || node.type === 'code') return
    const text = node === skip ? undefined : todoText(node)
    if (text !== undefined && (isParagraph(node) || isListItem(node))) {
      todos.push({ node, blocking: text.startsWith(BLOCKING_TODO_PREFIX), inTodosSection })
    }
    if (!isParent(node)) return
    const nextSkip = text !== undefined && isListItem(node) ? node.children[0] : undefined
    for (const child of node.children) walk(child, nextSkip)
  }
  for (const child of specification.document.children) {
    if (isHeading(child) && child.depth === 1) inTodosSection = headingText(child) === TODOS_HEADING
    walk(child, undefined)
  }
  return todos
}

function validateTodosSection(specification: Specification, todos: readonly Todo[], diagnostics: Diagnostic[]): void {
  const heading = findHeading(specification.document, 1, TODOS_HEADING)
  if (!heading) return
  const nodes = sectionNodes(specification.document, heading)
  if (nodes.every((node) => textOf(node).trim() === '')) return // SPEC204 reports an empty section.
  const report = (node: Node, message: string): void =>
    addDiagnostic(diagnostics, specification.path, node, 'SPEC608', message)
  for (const node of nodes) {
    if (node.type !== 'list') {
      report(node, `The ${TODOS_HEADING} section must contain only list items beginning "TODO:" or "TODO (later):".`)
      continue
    }
    for (const item of node.children) {
      if (todoText(item) === undefined) {
        report(item, `Every item in the ${TODOS_HEADING} section must begin "TODO:" or "TODO (later):".`)
      }
    }
  }
  if (!todos.some((todo) => todo.inTodosSection)) {
    report(heading, `The ${TODOS_HEADING} section must contain at least one TODO item; omit it otherwise.`)
  }
}

function validateSectionReferences(parsed: ParsedInput, diagnostics: Diagnostic[], includeDerived: boolean): void {
  const specificationIds = new Set(parsed.specifications.map((specification) => specification.id))
  const sectionsByPath = new Map(
    parsed.specifications.map((specification) => [
      specification.path,
      new Map(headingsWithSlugs(specification.document).map(({ heading, slug }) => [slug, headingText(heading)])),
    ]),
  )
  // A term link names the term, not the Glossary group it lands on, so its text need not be the group's title.
  const glossaryGroups = new Set(
    parsed.specifications.flatMap((specification) => {
      let inGlossary = false
      return headingsWithSlugs(specification.document).flatMap(({ heading, slug }) => {
        if (heading.depth === 1) inGlossary = headingText(heading) === 'Glossary'
        return inGlossary && heading.depth === 2 ? [`${specification.path}#${slug}`] : []
      })
    }),
  )
  for (const [path, document] of parsed.allDocuments) {
    if (!includeDerived && path.startsWith('docs/derived/')) continue
    visit(document.tree, (node) => {
      if ('value' in node && typeof node.value === 'string') {
        for (const match of node.value.matchAll(/\b([A-Z][A-Z0-9]*)-(?:\d{3}|NNN|nnn)\b/g)) {
          if (!specificationIds.has(match[1])) continue
          addDiagnostic(
            diagnostics,
            path,
            node,
            'SPEC612',
            'Numbered requirement label "' +
              match[0] +
              '" is prohibited; use a descriptive section title and hyperlink.',
          )
        }
      }
      if (!isLink(node) || isExternalUrl(node.url)) return
      const parts = splitUrl(node.url)
      const decodedPath = decodeUrlPart(parts.path)
      const fragment = parts.fragment === undefined ? undefined : decodeUrlPart(parts.fragment)
      if (decodedPath === undefined || !fragment) return
      const destinationPath = decodedPath ? resolvePath(path, decodedPath) : path
      const sections = sectionsByPath.get(destinationPath)
      if (!sections) return
      const title = sections.get(fragment)
      if (title === undefined) {
        addDiagnostic(
          diagnostics,
          path,
          node,
          'SPEC606',
          'Section reference "' + node.url + '" does not resolve to a specification heading.',
        )
      } else if (
        title !== 'Glossary' &&
        !glossaryGroups.has(`${destinationPath}#${fragment}`) &&
        textOf(node) !== title
      ) {
        addDiagnostic(
          diagnostics,
          path,
          node,
          'SPEC611',
          'Section reference must use the exact heading title "' + title + '" as its visible text.',
        )
      }
    })
  }
}

function validateTodosAndSections(parsed: ParsedInput, diagnostics: Diagnostic[], includeDerived = false): void {
  for (const specification of parsed.specifications) {
    const todos = todoNodes(specification)
    for (const todo of todos) {
      if (todo.inTodosSection) continue
      addDiagnostic(
        diagnostics,
        specification.path,
        todo.node,
        'SPEC607',
        `TODO items must appear only in the ${TODOS_HEADING} section.`,
      )
    }
    validateTodosSection(specification, todos, diagnostics)
  }
  validateSectionReferences(parsed, diagnostics, includeDerived)
}

function compareDiagnostics(left: Diagnostic, right: Diagnostic): number {
  return (
    left.path.localeCompare(right.path, 'en') ||
    left.line - right.line ||
    left.column - right.column ||
    left.code.localeCompare(right.code, 'en') ||
    left.message.localeCompare(right.message, 'en')
  )
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
}

function buildCorpus(
  parsed: ParsedInput,
  entries: readonly RegistryEntry[],
  terms: readonly GlossaryTerm[],
  mentions: readonly TermMention[],
): SpecificationCorpus {
  const entriesByPath = new Map(entries.map((entry) => [entry.path, entry]))
  const specifications: SpecificationRecord[] = []
  for (const specification of parsed.specifications) {
    const entry = entriesByPath.get(specification.path)
    if (!entry || !specification.id || !isSpecificationFamily(specification.family)) {
      continue
    }
    specifications.push({
      id: specification.id,
      family: specification.family,
      title: specification.title,
      owns: entry.owns,
      path: specification.path,
    })
  }
  specifications.sort((left, right) => compareText(left.id, right.id))
  const specificationByPath = new Map(specifications.map((specification) => [specification.path, specification]))

  const glossary: GlossaryRecord[] = []
  for (const entry of terms) {
    const owner = specificationByPath.get(entry.specification.path)
    if (!owner) continue
    glossary.push({
      term: entry.term,
      definitionMarkdown: entry.definitionMarkdown,
      prohibitedSynonymsMarkdown: entry.prohibitedSynonymsMarkdown,
      ownerId: owner.id,
      ownerPath: owner.path,
    })
  }
  glossary.sort(
    (left, right) =>
      compareText(
        left.term.toLocaleLowerCase('en-US').replace(/\s+/g, ' '),
        right.term.toLocaleLowerCase('en-US').replace(/\s+/g, ' '),
      ) || compareText(left.ownerId, right.ownerId),
  )

  const relationships: RelationshipRecord[] = []
  // A specification references the owner of every term its rule text mentions; the first mention links the owner.
  const seen = new Set<string>()
  for (const mention of mentions) {
    const dependency = specificationByPath.get(mention.ownerPath)
    const dependent = specificationByPath.get(mention.specificationPath)
    if (!dependency || !dependent) continue
    const key = dependency.path + ' ' + dependent.path
    if (seen.has(key)) continue
    seen.add(key)
    relationships.push({
      dependencyId: dependency.id,
      dependencyPath: dependency.path,
      dependentId: dependent.id,
      dependentPath: dependent.path,
      kind: 'references',
    })
  }
  relationships.sort(
    (left, right) =>
      compareText(left.dependencyId, right.dependencyId) || compareText(left.dependentId, right.dependentId),
  )

  return { specifications, glossary, relationships }
}

export function analyzeSpecifications(input: LintInput): SpecificationAnalysis {
  const diagnostics: Diagnostic[] = []
  const parsed = parseInput(input, diagnostics)
  const index = parsed.specifications.find((specification) => specification.path === parsed.indexPath)
  const entries = registryEntries(parsed, index, diagnostics)
  validateMetadata(parsed, diagnostics)
  validateLayout(parsed.specifications, diagnostics)
  validateLinks(parsed, diagnostics)
  validateFamilyOverviews(parsed, diagnostics)
  validateNoRelationshipsSection(parsed.specifications, diagnostics)
  const glossary = validateTerminology(parsed.specifications, diagnostics)
  const mentions = firstMentions(parsed, glossary)
  validateTermLinks(mentions, diagnostics)
  validateReferenceCycles(mentions, diagnostics)
  validateConventionsIndependence(parsed, diagnostics)
  validateTodosAndSections(parsed, diagnostics)
  return {
    diagnostics: diagnostics.toSorted(compareDiagnostics),
    corpus: buildCorpus(parsed, entries, glossary, mentions),
  }
}

function firstMentions(parsed: ParsedInput, glossary: readonly GlossaryTerm[]): readonly TermMention[] {
  // The specification index navigates to every specification, so it is exempt like the other overviews.
  const specifications = parsed.specifications.flatMap((specification) =>
    isSpecificationFamily(specification.family) && specification.path !== parsed.indexPath
      ? [{ ...specification, family: specification.family }]
      : [],
  )
  const definitions = glossary.map((entry) => ({
    term: entry.term,
    ownerPath: entry.specification.path,
    anchor: entry.anchor,
  }))
  return findFirstMentions(specifications, definitions)
}

/** Requires the first mention of each term another specification owns to link to the term's Glossary group. */
function validateTermLinks(mentions: readonly TermMention[], diagnostics: Diagnostic[]): void {
  for (const mention of mentions) {
    if (mention.link === 'correct') continue
    diagnostics.push({
      code: mention.link === 'none' ? 'SPEC508' : 'SPEC509',
      path: mention.specificationPath,
      line: mention.line,
      column: mention.column,
      message:
        (mention.link === 'none'
          ? `The first mention of "${mention.term}" must link to its Glossary group: `
          : `The first mention of "${mention.term}" links to the wrong anchor; link to its Glossary group: `) +
        `${mention.ownerPath}#${mention.anchor}. Run npm run docs:link-terms to fix it.`,
    })
  }
}

/**
 * Rejects a cycle among References: each first mention whose specification and Term owner reference each other,
 * directly or through others, is reported. Tarjan's algorithm visits each specification and Reference once.
 */
/**
 * Rejects a link from a Conventions specification to a Design or Implementation specification: the conventions govern
 * those specifications, so they must not rely on them, not even by citing them. The specification index is exempt,
 * because it navigates to every specification.
 */
function validateConventionsIndependence(parsed: ParsedInput, diagnostics: Diagnostic[]): void {
  const kindByPath = new Map(
    parsed.specifications.flatMap((specification) =>
      isSpecificationFamily(specification.family) ? [[specification.path, FAMILY_KIND[specification.family]]] : [],
    ),
  )
  for (const specification of parsed.specifications) {
    if (specification.family !== 'Conventions' || specification.path === parsed.indexPath) continue
    visit(specification.document.tree, (node) => {
      if (!isLink(node) || isExternalUrl(node.url)) return
      const path = decodeUrlPart(splitUrl(node.url).path)
      if (!path) return
      const kind = kindByPath.get(resolvePath(specification.path, path))
      if (kind === undefined || kind === 'Governance') return
      addDiagnostic(
        diagnostics,
        specification.path,
        node,
        'SPEC416',
        `A Conventions specification must not rely on a ${kind} specification, not even by linking it; state the rule without the game term, or move it to the specification that owns the term.`,
      )
    })
  }
}

function validateReferenceCycles(mentions: readonly TermMention[], diagnostics: Diagnostic[]): void {
  const adjacency = new Map<string, Set<string>>()
  for (const mention of mentions) {
    const next = adjacency.get(mention.ownerPath) ?? new Set<string>()
    next.add(mention.specificationPath)
    adjacency.set(mention.ownerPath, next)
  }
  const index = new Map<string, number>()
  const low = new Map<string, number>()
  const onStack = new Set<string>()
  const stack: string[] = []
  const component = new Map<string, number>()
  let components = 0
  const strongConnect = (node: string): void => {
    index.set(node, index.size)
    low.set(node, index.size - 1)
    stack.push(node)
    onStack.add(node)
    for (const next of adjacency.get(node) ?? []) {
      if (!index.has(next)) {
        strongConnect(next)
        low.set(node, Math.min(low.get(node) ?? 0, low.get(next) ?? 0))
      } else if (onStack.has(next)) {
        low.set(node, Math.min(low.get(node) ?? 0, index.get(next) ?? 0))
      }
    }
    if (low.get(node) !== index.get(node)) return
    const members: string[] = []
    for (let member = stack.pop(); member !== undefined; member = stack.pop()) {
      onStack.delete(member)
      members.push(member)
      if (member === node) break
    }
    if (members.length > 1) {
      for (const member of members) component.set(member, components)
      components += 1
    }
  }
  for (const node of adjacency.keys()) if (!index.has(node)) strongConnect(node)
  for (const mention of mentions) {
    const cycle = component.get(mention.ownerPath)
    if (cycle === undefined || cycle !== component.get(mention.specificationPath)) continue
    diagnostics.push({
      code: 'SPEC414',
      path: mention.specificationPath,
      line: mention.line,
      column: mention.column,
      message: `"${mention.term}" makes this specification reference ${mention.ownerPath}, which references it back, directly or through others; move the term or the rule that uses it.`,
    })
  }
}

/** Finds the first mention of each term another specification owns, from one parse of the input. */
export function termMentions(input: LintInput): readonly TermMention[] {
  const diagnostics: Diagnostic[] = []
  const parsed = parseInput(input, diagnostics)
  return firstMentions(parsed, validateTerminology(parsed.specifications, diagnostics))
}

export function lintSpecifications(input: LintInput): readonly Diagnostic[] {
  return analyzeSpecifications(input).diagnostics
}

export function lintSectionReferences(input: LintInput, includeDerived = false): readonly Diagnostic[] {
  const diagnostics: Diagnostic[] = []
  const parsed = parseInput(input, diagnostics)
  validateTodosAndSections(parsed, diagnostics, includeDerived)
  return diagnostics.toSorted(compareDiagnostics)
}

export function formatDiagnostic(diagnostic: Diagnostic): string {
  return `${diagnostic.path}:${diagnostic.line}:${diagnostic.column} error ${diagnostic.code} ${diagnostic.message}`
}
