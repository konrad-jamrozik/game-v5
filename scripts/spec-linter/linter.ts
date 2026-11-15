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
  FAMILY_ORDER,
  FAMILY_OVERVIEW_HEADINGS,
  familyDirectoryName,
  familyOverviewPath,
  familyOverviewTitle,
  isFamilyOverviewCandidate,
} from './overviews.ts'
import { decodeUrlPart, directoryOf, isExternalUrl, normalizePath, resolvePath, splitUrl } from './paths.ts'
import type {
  Diagnostic,
  GlossaryRecord,
  LintInput,
  RelationshipKind,
  RelationshipRecord,
  SpecificationAnalysis,
  SpecificationCorpus,
  SpecificationFamily,
  SpecificationRecord,
  SpecificationStatus,
} from './types.ts'

const DEFAULT_SPECIFICATION_ROOT = 'docs/specs'
const DEFAULT_INDEX_PATH = 'docs/specs/README.md'
const CONVENTIONS_PATH = 'docs/specs/governance/spec-conventions.md'
const ALLOWED_STATUSES: ReadonlySet<string> = new Set(['Stub', 'Draft', 'Accepted', 'Superseded'])
const ALLOWED_BINDINGS: ReadonlySet<string> = new Set(['Guidance', 'Mandatory'])
const PERSONAS = ['Engine designer', 'Content designer', 'UI designer', 'AI designer', 'Implementer', 'Player']
const ALLOWED_FAMILIES: ReadonlySet<string> = new Set([
  'Governance',
  'Foundation',
  'Mechanics',
  'Content',
  'UI',
  'Autopilot AIs',
  'Implementation',
])
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
  readonly status: string | undefined
  readonly title: string
}

interface RegistryEntry {
  readonly id: string
  readonly family: string
  readonly title: string
  readonly path: string
  readonly owns: string
}

type Inventory = 'Dependencies' | 'Dependents'

interface RelationshipRow {
  readonly inventory: Inventory
  readonly owner: Specification
  readonly destination: Specification
  readonly kind: RelationshipKind
  readonly node: Node
}

function isSpecificationFamily(value: string | undefined): value is SpecificationFamily {
  return value !== undefined && ALLOWED_FAMILIES.has(value)
}

function isSpecificationStatus(value: string | undefined): value is SpecificationStatus {
  return value !== undefined && ALLOWED_STATUSES.has(value)
}

interface GlossaryTerm {
  readonly term: string
  readonly definitionMarkdown: string
  readonly specification: Specification
  readonly node: Node
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
      status: metadata.values.get('Status'),
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

function validateMetadata(parsed: ParsedInput, diagnostics: Diagnostic[]): void {
  const metadataIds = new Map<string, Specification[]>()
  for (const specification of parsed.specifications) {
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
    if (!specification.status || !ALLOWED_STATUSES.has(specification.status)) {
      addDiagnostic(
        diagnostics,
        specification.path,
        specification.metadata.table,
        'SPEC105',
        'Metadata Status must be Stub, Draft, Accepted, or Superseded.',
      )
    }
    if (!specification.family || !ALLOWED_FAMILIES.has(specification.family)) {
      addDiagnostic(
        diagnostics,
        specification.path,
        specification.metadata.table,
        'SPEC109',
        'Metadata Family must be Governance, Foundation, Mechanics, Content, UI, Autopilot AIs, or Implementation.',
      )
    } else {
      const relativePath = specification.path.slice(parsed.specificationRoot.length + 1)
      const actualDirectory = directoryOf(relativePath)
      const expectedDirectory = specification.path === parsed.indexPath ? '' : familyDirectoryName(specification.family)
      if (
        actualDirectory !== expectedDirectory ||
        (specification.path === parsed.indexPath && specification.family !== 'Governance')
      ) {
        addDiagnostic(
          diagnostics,
          specification.path,
          specification.metadata.table,
          'SPEC110',
          specification.path === parsed.indexPath
            ? `The specification index must use Family Governance and remain at ${parsed.indexPath}.`
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
    const binding = specification.metadata.values.get('Binding')
    if (specification.family === 'Implementation' && (binding === undefined || !ALLOWED_BINDINGS.has(binding))) {
      addDiagnostic(
        diagnostics,
        specification.path,
        specification.metadata.table,
        'SPEC114',
        'Metadata Binding of an Implementation family specification must be Guidance or Mandatory.',
      )
    } else if (specification.family !== 'Implementation' && binding !== undefined) {
      addDiagnostic(
        diagnostics,
        specification.path,
        specification.metadata.table,
        'SPEC114',
        'Only Implementation family specifications have a Binding metadata row.',
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
  for (const overview of parsed.overviews) {
    if (expectedPaths.has(overview.path)) continue
    addDiagnostic(
      diagnostics,
      overview.path,
      undefined,
      'SPEC701',
      'Family overviews must be named about-<directory>.md and placed directly in a Family directory.',
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

  const linkedPaths = new Set<string>()
  visit(document.tree, (node) => {
    if (!isLink(node) || isExternalUrl(node.url)) return
    const decoded = decodeUrlPart(splitUrl(node.url).path)
    if (decoded) linkedPaths.add(resolvePath(path, decoded))
  })
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

const RELATIONSHIP_PHRASES: readonly { phrase: string; kind: RelationshipKind; inventory: Inventory }[] = [
  { phrase: 'Uses', kind: 'uses', inventory: 'Dependencies' },
  { phrase: 'Refines', kind: 'refines', inventory: 'Dependencies' },
  { phrase: 'Follows', kind: 'follows', inventory: 'Dependencies' },
  { phrase: 'Implements', kind: 'implements', inventory: 'Dependencies' },
  { phrase: 'Verifies', kind: 'verifies', inventory: 'Dependencies' },
  { phrase: 'Used by', kind: 'uses', inventory: 'Dependents' },
  { phrase: 'Refined by', kind: 'refines', inventory: 'Dependents' },
  { phrase: 'Followed by', kind: 'follows', inventory: 'Dependents' },
  { phrase: 'Implemented by', kind: 'implements', inventory: 'Dependents' },
  { phrase: 'Verified by', kind: 'verifies', inventory: 'Dependents' },
]

function parseInventory(
  specification: Specification,
  specificationsByPath: ReadonlyMap<string, Specification>,
  diagnostics: Diagnostic[],
): readonly RelationshipRow[] {
  const heading = findHeading(specification.document, 1, 'Relationships')
  if (!heading) return []
  const nodes = sectionNodes(specification.document, heading)
  const only = nodes[0]
  if (nodes.length !== 1 || !only || only.type !== 'list' || only.ordered) {
    addDiagnostic(
      diagnostics,
      specification.path,
      heading,
      'SPEC401',
      'Relationships must contain one unordered flat list; omit the section when there are no explicit relationships.',
    )
    return []
  }
  const relationships: RelationshipRow[] = []
  let previousRank = -1
  let previousTitle = ''
  for (const item of only.children) {
    const paragraph = item.children[0]
    if (
      item.children.length !== 1 ||
      !paragraph ||
      paragraph.type !== 'paragraph' ||
      paragraph.children.length !== 2 ||
      paragraph.children[0]?.type !== 'text' ||
      paragraph.children[1]?.type !== 'link' ||
      item.checked != null
    ) {
      addDiagnostic(
        diagnostics,
        specification.path,
        item,
        'SPEC407',
        'Each relationship must contain a directional phrase and one document hyperlink, without annotations.',
      )
      continue
    }
    const phrase = paragraph.children[0].value
    const link = paragraph.children[1]
    const rank = RELATIONSHIP_PHRASES.findIndex((entry) => phrase === entry.phrase + ' ')
    const entry = RELATIONSHIP_PHRASES[rank]
    if (!entry) {
      addDiagnostic(diagnostics, specification.path, item, 'SPEC409', 'Unknown relationship phrase or spelling.')
      continue
    }
    const parts = splitUrl(link.url)
    const linkPath = decodeUrlPart(parts.path)
    const destination =
      linkPath && !isExternalUrl(link.url) && !parts.fragment
        ? specificationsByPath.get(resolvePath(specification.path, linkPath))
        : undefined
    if (!destination) {
      addDiagnostic(
        diagnostics,
        specification.path,
        link,
        'SPEC408',
        'Relationship destination must link to a registered specification document without an anchor.',
      )
      continue
    }
    if (
      textOf(link) !== destination.title ||
      link.title != null ||
      link.children.some((child) => child.type !== 'text')
    ) {
      addDiagnostic(
        diagnostics,
        specification.path,
        link,
        'SPEC410',
        'Relationship link text must be the document title.',
      )
    }
    if (rank < previousRank || (rank === previousRank && previousTitle.localeCompare(destination.title, 'en') > 0)) {
      addDiagnostic(
        diagnostics,
        specification.path,
        item,
        'SPEC415',
        'Relationships must follow directional phrase order and alphabetical document-title order within each group.',
      )
    }
    previousRank = rank
    previousTitle = destination.title
    relationships.push({ inventory: entry.inventory, owner: specification, destination, kind: entry.kind, node: item })
  }
  return relationships
}

function relationshipPair(row: RelationshipRow): {
  readonly dependency: Specification
  readonly dependent: Specification
} {
  return row.inventory === 'Dependencies'
    ? { dependency: row.destination, dependent: row.owner }
    : { dependency: row.owner, dependent: row.destination }
}

function validateOverviewHasNoInventory(specifications: readonly Specification[], diagnostics: Diagnostic[]): void {
  for (const specification of specifications) {
    const overview = findHeading(specification.document, 1, 'Overview')
    if (!overview) continue // The layout validator reports the missing section.
    const bullets = sectionNodes(specification.document, overview).flatMap((node) =>
      node.type === 'list' && !node.ordered ? node.children : [],
    )
    for (const item of bullets) {
      const paragraph = item.children[0]
      if (paragraph?.type !== 'paragraph') continue
      const prefix = paragraph.children[0]
      const link = paragraph.children[1]
      if (prefix?.type !== 'text' || link?.type !== 'link') continue
      if (!RELATIONSHIP_PHRASES.some((entry) => prefix.value === entry.phrase + ' ')) continue
      addDiagnostic(
        diagnostics,
        specification.path,
        item,
        'SPEC417',
        'Overview must not repeat the Relationships inventory as directional-phrase bullets.',
      )
    }
  }
}

function relationshipKey(row: RelationshipRow): string {
  const pair = relationshipPair(row)
  return [pair.dependency.path, pair.dependent.path, row.kind].join('\u0000')
}

function validateGraph(rows: readonly RelationshipRow[], kind: string, diagnostics: Diagnostic[]): void {
  const adjacency = new Map<string, Set<string>>()
  for (const row of rows) {
    if (row.inventory !== 'Dependencies' || row.kind !== kind) continue
    const pair = relationshipPair(row)
    const next = adjacency.get(pair.dependency.path) ?? new Set<string>()
    next.add(pair.dependent.path)
    adjacency.set(pair.dependency.path, next)
  }
  const state = new Map<string, 'visiting' | 'visited'>()
  const cyclic = new Set<string>()
  const stack: string[] = []
  const walk = (path: string): void => {
    if (state.get(path) === 'visiting') {
      const start = stack.indexOf(path)
      for (const member of stack.slice(start)) cyclic.add(member)
      return
    }
    if (state.get(path) === 'visited') return
    state.set(path, 'visiting')
    stack.push(path)
    for (const next of adjacency.get(path) ?? []) walk(next)
    stack.pop()
    state.set(path, 'visited')
  }
  for (const path of adjacency.keys()) walk(path)
  for (const row of rows) {
    if (row.inventory === 'Dependencies' && row.kind === kind && cyclic.has(row.owner.path)) {
      addDiagnostic(diagnostics, row.owner.path, row.node, 'SPEC414', `The ${kind} relationship graph must be acyclic.`)
    }
  }
}

function validateRelationships(
  specifications: readonly Specification[],
  diagnostics: Diagnostic[],
): readonly RelationshipRow[] {
  const byPath = new Map(specifications.map((specification) => [specification.path, specification]))
  const rows = specifications.flatMap((specification) => parseInventory(specification, byPath, diagnostics))
  validateOverviewHasNoInventory(specifications, diagnostics)
  const seen = new Set<string>()
  for (const row of rows) {
    const pair = relationshipPair(row)
    if (pair.dependency.path === pair.dependent.path) {
      addDiagnostic(
        diagnostics,
        row.owner.path,
        row.node,
        'SPEC411',
        'A specification cannot have a relationship with itself.',
      )
    }
    const key = `${row.inventory}\u0000${relationshipKey(row)}`
    if (seen.has(key)) {
      addDiagnostic(
        diagnostics,
        row.owner.path,
        row.node,
        'SPEC412',
        'The relationship inventory contains a duplicate row.',
      )
    }
    seen.add(key)
  }
  const dependencies = new Set(rows.filter((row) => row.inventory === 'Dependencies').map(relationshipKey))
  const dependents = new Set(rows.filter((row) => row.inventory === 'Dependents').map(relationshipKey))
  for (const row of rows) {
    const opposite = row.inventory === 'Dependencies' ? dependents : dependencies
    if (!opposite.has(relationshipKey(row))) {
      addDiagnostic(
        diagnostics,
        row.owner.path,
        row.node,
        'SPEC413',
        `Explicit ${row.inventory} row has no mirrored entry with the same relationship kind.`,
      )
    }
  }
  validateGraph(rows, 'follows', diagnostics)
  validateGraph(rows, 'refines', diagnostics)
  return rows
}

function isTermTable(table: Table): boolean {
  const header = tableRows(table)[0]?.map((cell) => textOf(cell).trim())
  return header?.[0] === 'Term' && header[1] === 'Definition'
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
  for (const table of tablesIn(sectionNodes(specification.document, glossary))) {
    const rows = tableRows(table)
    const header = rows[0]?.map((cell) => textOf(cell).trim())
    if (header?.[0] !== 'Term' || header[1] !== 'Definition') continue
    for (const row of rows.slice(1)) {
      const cell = row[0]
      const definitionCell = row[1]
      const definition = definitionCell ? inlineMarkdown(definitionCell) : ''
      if (row.length !== 2 || !cell || !definitionCell || !textOf(cell).trim() || !textOf(definitionCell).trim()) {
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
      terms.push({ term, definitionMarkdown: definition, specification, node: cell })
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
      for (const node of sectionNodes(specification.document, heading)) {
        visit(node, (descendant) => {
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
      } else if (title !== 'Glossary' && textOf(node) !== title) {
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

function validateLifecycleAndSections(parsed: ParsedInput, diagnostics: Diagnostic[], includeDerived = false): void {
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
    if (specification.status === 'Stub' && !todos.some((todo) => todo.blocking && todo.inTodosSection)) {
      addDiagnostic(
        diagnostics,
        specification.path,
        specification.metadata.table,
        'SPEC603',
        `Stub specifications must contain at least one item beginning "TODO:" in the ${TODOS_HEADING} section.`,
      )
    }
    if (specification.status === 'Accepted') {
      for (const todo of todos) {
        if (!todo.blocking) continue
        addDiagnostic(
          diagnostics,
          specification.path,
          todo.node,
          'SPEC604',
          'Accepted specifications must not contain items beginning "TODO:"; only "TODO (later):" items are allowed.',
        )
      }
    }
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
  relationshipRows: readonly RelationshipRow[],
): SpecificationCorpus {
  const entriesByPath = new Map(entries.map((entry) => [entry.path, entry]))
  const specifications: SpecificationRecord[] = []
  for (const specification of parsed.specifications) {
    const entry = entriesByPath.get(specification.path)
    if (
      !entry ||
      !specification.id ||
      !isSpecificationFamily(specification.family) ||
      !isSpecificationStatus(specification.status)
    ) {
      continue
    }
    specifications.push({
      id: specification.id,
      family: specification.family,
      title: specification.title,
      status: specification.status,
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
      ownerId: owner.id,
      ownerPath: owner.path,
      ownerStatus: owner.status,
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
  for (const row of relationshipRows) {
    if (row.inventory !== 'Dependencies') continue
    const pair = relationshipPair(row)
    const dependency = specificationByPath.get(pair.dependency.path)
    const dependent = specificationByPath.get(pair.dependent.path)
    if (!dependency || !dependent) continue
    relationships.push({
      dependencyId: dependency.id,
      dependencyPath: dependency.path,
      dependentId: dependent.id,
      dependentPath: dependent.path,
      kind: row.kind,
      origin: 'explicit',
      sourcePaths: [dependency.path, dependent.path],
    })
  }
  const conventions = specifications.find((specification) => specification.id === 'CONV')
  if (conventions) {
    for (const dependent of specifications) {
      if (dependent.id === conventions.id) continue
      relationships.push({
        dependencyId: conventions.id,
        dependencyPath: conventions.path,
        dependentId: dependent.id,
        dependentPath: dependent.path,
        kind: 'follows',
        origin: 'implicit',
        sourcePaths: [CONVENTIONS_PATH],
      })
    }
  }
  relationships.sort(
    (left, right) =>
      compareText(left.dependencyId, right.dependencyId) ||
      compareText(left.dependentId, right.dependentId) ||
      compareText(left.kind, right.kind) ||
      compareText(left.origin, right.origin),
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
  const relationships = validateRelationships(parsed.specifications, diagnostics)
  const glossary = validateTerminology(parsed.specifications, diagnostics)
  validateLifecycleAndSections(parsed, diagnostics)
  return {
    diagnostics: diagnostics.toSorted(compareDiagnostics),
    corpus: buildCorpus(parsed, entries, glossary, relationships),
  }
}

export function lintSpecifications(input: LintInput): readonly Diagnostic[] {
  return analyzeSpecifications(input).diagnostics
}

export function lintSectionReferences(input: LintInput, includeDerived = false): readonly Diagnostic[] {
  const diagnostics: Diagnostic[] = []
  const parsed = parseInput(input, diagnostics)
  validateLifecycleAndSections(parsed, diagnostics, includeDerived)
  return diagnostics.toSorted(compareDiagnostics)
}

export function formatDiagnostic(diagnostic: Diagnostic): string {
  return `${diagnostic.path}:${diagnostic.line}:${diagnostic.column} error ${diagnostic.code} ${diagnostic.message}`
}
