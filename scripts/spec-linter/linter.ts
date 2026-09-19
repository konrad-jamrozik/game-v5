import type { Blockquote, Heading, Link, ListItem, Paragraph, Table } from 'mdast'
import type { Node } from 'unist'

import {
  columnOf,
  findHeading,
  firstLink,
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
  sectionNodes,
  tableRows,
  tableText,
  tablesIn,
  textOf,
  topLevelHeadings,
  visit,
} from './markdown.ts'
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
const GOVERNANCE_LAYOUT_EXCEPTIONS = new Set(['CONV', 'INDEX'])
const ALLOWED_STATUSES: ReadonlySet<string> = new Set(['Stub', 'Draft', 'Accepted', 'Superseded'])
const ALLOWED_FAMILIES: ReadonlySet<string> = new Set([
  'Governance',
  'Foundation',
  'Mechanics',
  'Content',
  'Interfaces',
  'Acceptance',
])
const RULE_HEADINGS = [
  'Purpose and boundaries',
  'Relationships',
  'Glossary',
  'Concepts and contract',
  'Requirements',
  'Edge cases and failure behavior',
  'Acceptance examples',
  'Open decisions',
]
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
  readonly node: Node
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

interface RequirementDeclaration {
  readonly id: string
  readonly anchor: string
  readonly depth: number
  readonly specification: Specification
  readonly node: Node
}

interface ParsedInput {
  readonly specifications: readonly Specification[]
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
  for (const [filePath, document] of allDocuments) {
    if (!filePath.startsWith(`${specificationRoot}/`)) continue
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
  return { specifications, allDocuments, exactPaths, casePaths, indexPath, specificationRoot }
}

function registryEntries(
  index: Specification | undefined,
  indexPath: string,
  diagnostics: Diagnostic[],
): readonly RegistryEntry[] {
  if (!index) {
    addDiagnostic(diagnostics, indexPath, undefined, 'SPEC003', 'The specification index is missing.')
    return []
  }
  const heading = findHeading(index.document, 1, 'Specification register')
  if (!heading) {
    addDiagnostic(
      diagnostics,
      index.path,
      undefined,
      'SPEC004',
      'The specification index must contain a Specification register section.',
    )
    return []
  }
  const table = tablesIn(sectionNodes(index.document, heading))[0]
  if (!table) {
    addDiagnostic(
      diagnostics,
      index.path,
      heading,
      'SPEC005',
      'The Specification register section must contain a table.',
    )
    return []
  }
  const rows = tableRows(table)
  const header = rows[0]?.map((cell) => textOf(cell).trim())
  if (
    header?.[0] !== 'ID' ||
    header[1] !== 'Family' ||
    header[2] !== 'Document' ||
    header[3] !== 'Owns' ||
    header.length !== 4
  ) {
    addDiagnostic(
      diagnostics,
      index.path,
      table,
      'SPEC006',
      'The specification register header must be "ID | Family | Document | Owns".',
    )
  }
  const entries: RegistryEntry[] = []
  for (const row of rows.slice(1)) {
    const id = row[0] ? textOf(row[0]).trim() : ''
    const family = row[1] ? textOf(row[1]).trim() : ''
    const documentCell = row[2]
    const owns = row[3] ? textOf(row[3]).replace(/\s+/g, ' ').trim() : ''
    const link = documentCell ? firstLink(documentCell) : undefined
    if (!id || !family || !link || !owns) {
      addDiagnostic(
        diagnostics,
        index.path,
        row[0] ?? table,
        'SPEC007',
        'Every specification register row must contain an ID, Family, one document link, and an Owns value.',
      )
      continue
    }
    const url = splitUrl(link.url)
    const decodedPath = decodeUrlPart(url.path)
    if (!decodedPath || isExternalUrl(link.url)) {
      addDiagnostic(
        diagnostics,
        index.path,
        link,
        'SPEC008',
        'A specification register document must be a local file link.',
      )
      continue
    }
    if (!ALLOWED_FAMILIES.has(family)) {
      addDiagnostic(
        diagnostics,
        index.path,
        row[1] ?? table,
        'SPEC017',
        'Register Family must be Governance, Foundation, Mechanics, Content, Interfaces, or Acceptance.',
      )
    }
    entries.push({
      id,
      family,
      title: textOf(link).trim(),
      path: resolvePath(index.path, decodedPath),
      owns,
      node: row[0] ?? table,
    })
  }
  return entries
}

function validateRegistryAndMetadata(
  parsed: ParsedInput,
  entries: readonly RegistryEntry[],
  diagnostics: Diagnostic[],
): void {
  const specificationsByPath = new Map(
    parsed.specifications.map((specification) => [specification.path, specification]),
  )
  const entriesByPath = new Map<string, RegistryEntry[]>()
  const entriesById = new Map<string, RegistryEntry[]>()
  for (const entry of entries) {
    const pathEntries = entriesByPath.get(entry.path) ?? []
    pathEntries.push(entry)
    entriesByPath.set(entry.path, pathEntries)
    const idEntries = entriesById.get(entry.id) ?? []
    idEntries.push(entry)
    entriesById.set(entry.id, idEntries)
    if (!parsed.exactPaths.has(entry.path)) {
      const actual = parsed.casePaths.get(entry.path.toLowerCase())
      addDiagnostic(
        diagnostics,
        entry.path,
        entry.node,
        actual ? 'SPEC009' : 'SPEC010',
        actual
          ? `The registered path casing differs from "${actual}".`
          : 'The registered specification file does not exist.',
      )
    }
  }
  for (const [id, duplicates] of entriesById) {
    if (duplicates.length < 2) continue
    for (const duplicate of duplicates) {
      addDiagnostic(
        diagnostics,
        duplicate.path,
        duplicate.node,
        'SPEC011',
        `Spec ID "${id}" is registered more than once.`,
      )
    }
  }
  for (const [filePath, duplicates] of entriesByPath) {
    if (duplicates.length < 2) continue
    for (const duplicate of duplicates) {
      addDiagnostic(
        diagnostics,
        filePath,
        duplicate.node,
        'SPEC012',
        'The specification file is registered more than once.',
      )
    }
  }
  const metadataIds = new Map<string, Specification[]>()
  for (const specification of parsed.specifications) {
    const registered = entriesByPath.get(specification.path) ?? []
    if (registered.length === 0) {
      addDiagnostic(
        diagnostics,
        specification.path,
        specification.metadata.table,
        'SPEC013',
        'Every Markdown file under docs/specs must be registered exactly once.',
      )
    }
    const entry = registered[0]
    if (entry && specification.id !== entry.id) {
      addDiagnostic(
        diagnostics,
        specification.path,
        specification.metadata.table,
        'SPEC014',
        `Metadata Spec ID "${specification.id ?? ''}" does not match registered ID "${entry.id}".`,
      )
    }
    if (entry && specification.title !== entry.title) {
      addDiagnostic(
        diagnostics,
        specification.path,
        specification.document.children[0],
        'SPEC015',
        `Document title "${specification.title}" does not match registered title "${entry.title}".`,
      )
    }
    if (entry && specification.family !== entry.family) {
      addDiagnostic(
        diagnostics,
        specification.path,
        specification.metadata.table,
        'SPEC018',
        `Metadata Family "${specification.family ?? ''}" does not match registered Family "${entry.family}".`,
      )
    }
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
        'Metadata Family must be Governance, Foundation, Mechanics, Content, Interfaces, or Acceptance.',
      )
    } else {
      const relativePath = specification.path.slice(parsed.specificationRoot.length + 1)
      const actualDirectory = directoryOf(relativePath)
      const expectedDirectory = specification.path === parsed.indexPath ? '' : specification.family.toLowerCase()
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
    if (!specification.metadata.values.get('Scope')) {
      addDiagnostic(
        diagnostics,
        specification.path,
        specification.metadata.table,
        'SPEC106',
        'Metadata must define a nonempty Scope.',
      )
    }
    if (specification.status === 'Accepted' && !specification.metadata.values.get('Acceptance reference')) {
      addDiagnostic(
        diagnostics,
        specification.path,
        specification.metadata.table,
        'SPEC107',
        'Accepted specifications must record an Acceptance reference.',
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
  for (const entry of entries) {
    if (!specificationsByPath.has(entry.path)) {
      addDiagnostic(
        diagnostics,
        entry.path,
        entry.node,
        'SPEC016',
        'The register entry does not resolve to a parsed specification.',
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
      `Required section "${headingText(heading)}" must not be empty.`,
    )
  }
  for (const node of nodes) {
    if (textOf(node).trim() === 'N/A') {
      addDiagnostic(
        diagnostics,
        specification.path,
        node,
        'SPEC205',
        'Use a precise explanation or "None.", not bare "N/A".',
      )
    }
  }
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

    const purpose = findHeading(specification.document, 1, 'Purpose and boundaries')
    const relationships = findHeading(specification.document, 1, 'Relationships')
    const glossary = findHeading(specification.document, 1, 'Glossary')
    const universal = [purpose, relationships, glossary]
    if (universal.some((heading) => heading === undefined)) {
      addDiagnostic(
        diagnostics,
        specification.path,
        specification.document.children[0],
        'SPEC206',
        'Every specification must contain Purpose and boundaries, Relationships, and Glossary H1 sections.',
      )
    } else if (!(lineOf(purpose) < lineOf(relationships) && lineOf(relationships) < lineOf(glossary))) {
      addDiagnostic(
        diagnostics,
        specification.path,
        purpose,
        'SPEC207',
        'Universal sections must appear in Purpose and boundaries, Relationships, Glossary order.',
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

    if (specification.id && !GOVERNANCE_LAYOUT_EXCEPTIONS.has(specification.id)) {
      const topLevel = h1s.slice(1)
      const actual = topLevel.map(headingText)
      const requiredHeadings = RULE_HEADINGS.filter(
        (text) => text !== 'Acceptance examples' || specification.family !== 'Foundation' || actual.includes(text),
      )
      const positions = requiredHeadings.map((text) => actual.indexOf(text))
      const valid = positions.every(
        (position, index) => position >= 0 && (index === 0 || position > (positions[index - 1] ?? -1)),
      )
      if (!valid) {
        addDiagnostic(
          diagnostics,
          specification.path,
          topLevel[0],
          'SPEC209',
          `Standard specifications must use this H1 order: ${requiredHeadings.join(' -> ')}.`,
        )
      }
      for (const sectionName of RULE_HEADINGS.slice(3)) {
        const heading = findHeading(specification.document, 1, sectionName)
        if (heading) validateSectionContent(specification, heading, diagnostics)
      }
      const openIndex = actual.indexOf('Open decisions')
      for (let index = 0; index < actual.length; index += 1) {
        if (actual[index]?.startsWith('Appendix') && index < openIndex) {
          addDiagnostic(
            diagnostics,
            specification.path,
            topLevel[index],
            'SPEC210',
            'Appendices must appear after Open decisions.',
          )
        }
      }
    }
  }
}

function validateLinks(parsed: ParsedInput, diagnostics: Diagnostic[]): void {
  const slugCache = new Map<string, ReadonlySet<string>>()
  for (const specification of parsed.specifications) {
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
  if (
    nodes.length === 1 &&
    only &&
    isParagraph(only) &&
    only.children.length === 1 &&
    only.children[0]?.type === 'text' &&
    textOf(only) === 'No explicit relationships.'
  )
    return []
  if (nodes.length !== 1 || !only || only.type !== 'list' || only.ordered) {
    addDiagnostic(
      diagnostics,
      specification.path,
      heading,
      'SPEC401',
      'Relationships must contain one unordered flat list or exactly "No explicit relationships.".',
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

function glossaryTerms(specification: Specification, diagnostics: Diagnostic[]): readonly GlossaryTerm[] {
  const glossary = findHeading(specification.document, 1, 'Glossary')
  if (!glossary) return []
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
          const relationshipText = descendant.value.replace(/\bTypeScript\s+types?\b/gi, '')
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

function startsWithTodo(node: Node): boolean {
  if (isParagraph(node)) return textOf(node).trim().startsWith('TODO:')
  if (isListItem(node)) {
    const first = node.children[0]
    return Boolean(first && textOf(first).trim().startsWith('TODO:'))
  }
  return false
}

function todoNodes(specification: Specification): readonly Node[] {
  const todos: Node[] = []
  const walk = (node: Node, quoted: boolean): void => {
    const nextQuoted = quoted || isBlockquote(node)
    if (!nextQuoted && startsWithTodo(node)) todos.push(node)
    if (!isParent(node)) return
    for (const child of node.children) walk(child, nextQuoted)
  }
  walk(specification.document.tree, false)
  return todos
}

function declaredRequirements(
  specification: Specification,
  diagnostics: Diagnostic[],
): readonly RequirementDeclaration[] {
  const declarations: RequirementDeclaration[] = []
  let container: Heading | undefined
  for (const { heading, slug } of headingsWithSlugs(specification.document)) {
    const text = headingText(heading)
    const start = /^([A-Z][A-Z0-9]*-\d{3})\b/.exec(text)
    if (!start?.[1]) {
      container = heading
      continue
    }
    const match = /^([A-Z][A-Z0-9]*-\d{3})\s+—\s+(.+)$/.exec(text)
    if (!match?.[1] || !match[2] || match[2].endsWith('.')) {
      addDiagnostic(
        diagnostics,
        specification.path,
        heading,
        'SPEC607',
        'Requirement headings must use "ID — Descriptive title" without a trailing period.',
      )
    }
    const id = start[1]
    if (specification.id && !id.startsWith(`${specification.id}-`)) {
      addDiagnostic(
        diagnostics,
        specification.path,
        heading,
        'SPEC601',
        `Requirement "${id}" must use the ${specification.id} prefix.`,
      )
    }
    const expectedDepth = container ? container.depth + 1 : 2
    if (heading.depth === 1 || expectedDepth > 6 || heading.depth !== expectedDepth) {
      addDiagnostic(
        diagnostics,
        specification.path,
        heading,
        'SPEC608',
        expectedDepth > 6
          ? `Requirement "${id}" cannot be nested below an H6 container; restructure the containing sections.`
          : `Requirement "${id}" must be H${expectedDepth}, one level below its containing heading.`,
      )
    }
    if (match?.[1] && match[2])
      declarations.push({ id, anchor: slug, depth: heading.depth, specification, node: heading })
  }
  return declarations
}

function expandRequirementReferences(text: string): readonly string[] {
  const references = new Set<string>()
  const pattern =
    /\b([A-Z][A-Z0-9]*)-(\d{3})(?:(?:–|-)(\d{3})|\s+through\s+(?:([A-Z][A-Z0-9]*)-)?(\d{3})|((?:\/(?:[A-Z][A-Z0-9]*-)?\d{3})+))?/g
  for (const match of text.matchAll(pattern)) {
    const prefix = match[1]
    const startText = match[2]
    if (!prefix || !startText) continue
    references.add(`${prefix}-${startText}`)
    const endText = match[3] ?? match[5]
    if (endText) {
      const start = Number(startText)
      const end = Number(endText)
      const endPrefix = match[4] ?? prefix
      if (endPrefix === prefix && end >= start && end - start <= 999) {
        for (let value = start + 1; value <= end; value += 1) {
          references.add(`${prefix}-${String(value).padStart(3, '0')}`)
        }
      } else {
        references.add(`${endPrefix}-${endText}`)
      }
    }
    const compact = match[6]
    if (compact) {
      for (const part of compact.slice(1).split('/')) {
        references.add(part.includes('-') ? part : `${prefix}-${part}`)
      }
    }
  }
  return [...references]
}

function validateRequirementReferences(
  parsed: ParsedInput,
  declarations: readonly RequirementDeclaration[],
  diagnostics: Diagnostic[],
  includeDerived: boolean,
): void {
  const byId = new Map<string, RequirementDeclaration[]>()
  for (const declaration of declarations) {
    const matches = byId.get(declaration.id) ?? []
    matches.push(declaration)
    byId.set(declaration.id, matches)
  }
  const declarationNodes = new Set(declarations.map((declaration) => declaration.node))
  const compactPattern =
    /\b[A-Z][A-Z0-9]*-\d{3}(?:(?:\/\d{3})+|(?:–|-)(?:[A-Z][A-Z0-9]*-)?\d{3}|\s+through\s+[A-Z][A-Z0-9]*-\d{3})\b/g

  for (const [path, document] of parsed.allDocuments) {
    if (!includeDerived && path.startsWith('docs/derived/')) continue
    const walk = (node: Node, activeLink: Link | undefined): void => {
      if (declarationNodes.has(node)) return
      const link = isLink(node) ? node : activeLink
      if (node.type === 'paragraph' || node.type === 'tableCell' || node.type === 'heading') {
        for (const match of textOf(node).matchAll(compactPattern)) {
          addDiagnostic(
            diagnostics,
            path,
            node,
            'SPEC610',
            `Requirement reference "${match[0]}" must be expanded into individually linked full IDs.`,
          )
        }
      }
      if ('value' in node && typeof node.value === 'string') {
        for (const reference of expandRequirementReferences(node.value)) {
          const candidates = byId.get(reference) ?? []
          if (candidates.length === 0) {
            addDiagnostic(
              diagnostics,
              path,
              node,
              'SPEC606',
              `Requirement reference "${reference}" does not resolve to a live requirement heading.`,
            )
            continue
          }
          if (candidates.length !== 1) continue
          if (!link) {
            addDiagnostic(
              diagnostics,
              path,
              node,
              'SPEC609',
              `Requirement reference "${reference}" must be a hyperlink to its declaration.`,
            )
            continue
          }
          const expected = candidates[0]
          if (!expected) continue
          const parts = splitUrl(link.url)
          const decodedPath = decodeUrlPart(parts.path)
          const decodedFragment = parts.fragment === undefined ? undefined : decodeUrlPart(parts.fragment)
          const destinationPath =
            decodedPath === undefined ? undefined : decodedPath ? resolvePath(path, decodedPath) : path
          if (
            textOf(link).trim() !== reference ||
            isExternalUrl(link.url) ||
            destinationPath !== expected.specification.path ||
            decodedFragment !== expected.anchor
          ) {
            addDiagnostic(
              diagnostics,
              path,
              link,
              'SPEC611',
              `Requirement reference "${reference}" must be its own link to "${expected.specification.path}#${expected.anchor}".`,
            )
          }
        }
      }
      if (!isParent(node)) return
      for (const child of node.children) walk(child, link)
    }
    walk(document.tree, undefined)
  }
}

function validateLifecycleAndRequirements(
  parsed: ParsedInput,
  diagnostics: Diagnostic[],
  includeDerived = false,
): void {
  const declarations = parsed.specifications.flatMap((specification) =>
    declaredRequirements(specification, diagnostics),
  )
  const byId = new Map<string, RequirementDeclaration[]>()
  for (const declaration of declarations) {
    const matches = byId.get(declaration.id) ?? []
    matches.push(declaration)
    byId.set(declaration.id, matches)
  }
  for (const [id, duplicates] of byId) {
    if (duplicates.length < 2) continue
    for (const duplicate of duplicates) {
      addDiagnostic(
        diagnostics,
        duplicate.specification.path,
        duplicate.node,
        'SPEC602',
        `Requirement "${id}" is declared more than once.`,
      )
    }
  }
  for (const specification of parsed.specifications) {
    const todos = todoNodes(specification)
    if (specification.status === 'Stub' && todos.length === 0) {
      addDiagnostic(
        diagnostics,
        specification.path,
        specification.metadata.table,
        'SPEC603',
        'Stub specifications must contain unresolved work beginning "TODO:".',
      )
    }
    if (specification.status === 'Accepted') {
      for (const todo of todos) {
        addDiagnostic(
          diagnostics,
          specification.path,
          todo,
          'SPEC604',
          'Accepted specifications must not contain unresolved work beginning "TODO:".',
        )
      }
      if (specification.id && !GOVERNANCE_LAYOUT_EXCEPTIONS.has(specification.id)) {
        const open = findHeading(specification.document, 1, 'Open decisions')
        if (open) {
          const content = sectionNodes(specification.document, open)
            .map((node) => textOf(node).trim())
            .filter(Boolean)
            .join(' ')
          if (content !== 'None.') {
            addDiagnostic(
              diagnostics,
              specification.path,
              open,
              'SPEC605',
              'Accepted standard specifications must contain exactly "None." under Open decisions.',
            )
          }
        }
      }
    }
  }
  validateRequirementReferences(parsed, declarations, diagnostics, includeDerived)
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
    const scope = specification.metadata.values.get('Scope')
    if (
      !entry ||
      !specification.id ||
      !isSpecificationFamily(specification.family) ||
      !isSpecificationStatus(specification.status) ||
      !scope
    ) {
      continue
    }
    specifications.push({
      id: specification.id,
      family: specification.family,
      title: specification.title,
      status: specification.status,
      scope,
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
  const entries = registryEntries(index, parsed.indexPath, diagnostics)
  validateRegistryAndMetadata(parsed, entries, diagnostics)
  validateLayout(parsed.specifications, diagnostics)
  validateLinks(parsed, diagnostics)
  const relationships = validateRelationships(parsed.specifications, diagnostics)
  const glossary = validateTerminology(parsed.specifications, diagnostics)
  validateLifecycleAndRequirements(parsed, diagnostics)
  return {
    diagnostics: diagnostics.toSorted(compareDiagnostics),
    corpus: buildCorpus(parsed, entries, glossary, relationships),
  }
}

export function lintSpecifications(input: LintInput): readonly Diagnostic[] {
  return analyzeSpecifications(input).diagnostics
}

export function lintRequirementReferences(input: LintInput, includeDerived = false): readonly Diagnostic[] {
  const diagnostics: Diagnostic[] = []
  const parsed = parseInput(input, diagnostics)
  validateLifecycleAndRequirements(parsed, diagnostics, includeDerived)
  return diagnostics.toSorted(compareDiagnostics)
}

export function formatDiagnostic(diagnostic: Diagnostic): string {
  return `${diagnostic.path}:${diagnostic.line}:${diagnostic.column} error ${diagnostic.code} ${diagnostic.message}`
}
