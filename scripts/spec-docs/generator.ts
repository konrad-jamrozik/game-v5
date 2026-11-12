import { relative } from 'node:path/posix'

import type { Link, Root } from 'mdast'
import { format, type Options } from 'prettier'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'

import { isLink, visit } from '../spec-linter/markdown.ts'
import {
  FAMILY_DIAGRAM_END,
  FAMILY_DIAGRAM_START,
  FAMILY_ORDER,
  familyDirectoryName,
  familyOverviewFileName,
} from '../spec-linter/overviews.ts'
import { decodeUrlPart, directoryOf, isExternalUrl, resolvePath, splitUrl } from '../spec-linter/paths.ts'
import type {
  GlossaryRecord,
  RelationshipKind,
  RelationshipRecord,
  SpecificationCorpus,
  SpecificationFamily,
  SpecificationRecord,
  SpecificationStatus,
} from '../spec-linter/types.ts'

export const DERIVED_BASE_OUTPUT_PATHS = [
  'docs/derived/README.md',
  'docs/derived/glossary.md',
  'docs/derived/relationships.md',
] as const

const STATUS_ORDER: readonly SpecificationStatus[] = ['Stub', 'Draft', 'Accepted', 'Superseded']
const RELATIONSHIP_ORDER: readonly RelationshipKind[] = ['follows', 'refines', 'uses', 'implements', 'verifies']
const PASSIVE_DESCRIPTIONS: Readonly<Record<RelationshipKind, string>> = {
  follows: 'A → B means A is followed by B.',
  refines: 'A → B means A is refined by B.',
  uses: 'A → B means A is used by B.',
  implements: 'A → B means A is implemented by B.',
  verifies: 'A → B means A is verified by B.',
}
const FAMILY_DIAGRAM_NOTICE =
  '_Generated from the specifications’ Relationships sections by `npm run docs:generate`; do not edit between the markers. Arrows run from Dependency to Dependent; dashed boxes stand for whole other Families._'
const GENERATED_NOTICE =
  '> **Generated — do not edit.** Run `npm run docs:generate` after changing registered specifications.'

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
}

function escapeLinkText(value: string): string {
  return value.replace(/([\\\]])/g, '\\$1')
}

function escapeTableCell(value: string): string {
  return value.replace(/\r?\n/g, ' ').replace(/(^|[^\\])\|/g, '$1\\|')
}

function markdownTable(headers: readonly string[], rows: readonly (readonly string[])[]): string {
  return [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.map(escapeTableCell).join(' | ')} |`),
  ].join('\n')
}

function relativeLink(fromPath: string, toPath: string, fragment?: string): string {
  const path = relative(directoryOf(fromPath), toPath) || '.'
  return fragment ? `${path}#${fragment}` : path
}

function specificationLink(specification: SpecificationRecord, outputPath: string, fragment?: string): string {
  const label = `${specification.id} — ${specification.title}`
  return `[${escapeLinkText(label)}](${relativeLink(outputPath, specification.path, fragment)})`
}

function rewriteLink(link: Link, sourcePath: string, outputPath: string): void {
  if (isExternalUrl(link.url)) return
  const parts = splitUrl(link.url)
  const decodedPath = decodeUrlPart(parts.path)
  if (decodedPath === undefined) return
  const destination = decodedPath ? resolvePath(sourcePath, decodedPath) : sourcePath
  link.url = relativeLink(outputPath, destination, parts.fragment)
}

function rewriteInlineLinks(markdown: string, sourcePath: string, outputPath: string): string {
  const processor = remark().use(remarkGfm)
  const tree: Root = processor.parse(markdown)
  visit(tree, (node) => {
    if (isLink(node)) rewriteLink(node, sourcePath, outputPath)
  })
  return processor.stringify(tree).trim()
}

function renderCatalog(corpus: SpecificationCorpus): string {
  const outputPath = DERIVED_BASE_OUTPUT_PATHS[0]
  const specifications = corpus.specifications.toSorted((left, right) => compareText(left.id, right.id))
  const lines = [
    '# Derived Specification Views',
    '',
    GENERATED_NOTICE,
    '',
    'These informative views are derived from the registered Markdown specifications. The source specifications remain authoritative.',
    '',
    '- [Alphabetical glossary](glossary.md)',
    '- [Specification relationship graphs](relationships.md)',
    '',
    '## Counts by status',
    '',
    markdownTable(
      ['Status', 'Specifications'],
      STATUS_ORDER.map((status) => [status, String(specifications.filter((item) => item.status === status).length)]),
    ),
    '',
    '## Counts by family',
    '',
    markdownTable(
      ['Family', 'Specifications'],
      FAMILY_ORDER.map((family) => [family, String(specifications.filter((item) => item.family === family).length)]),
    ),
  ]
  for (const family of FAMILY_ORDER) {
    const members = specifications.filter((specification) => specification.family === family)
    lines.push(
      '',
      `## ${family}`,
      '',
      markdownTable(
        ['ID', 'Document', 'Status', 'Owns'],
        members.map((specification) => [
          specification.id,
          `[${escapeLinkText(specification.title)}](${relativeLink(outputPath, specification.path)})`,
          specification.status,
          specification.owns,
        ]),
      ),
    )
  }
  return `${lines.join('\n')}\n`
}

function glossarySortKey(entry: GlossaryRecord): string {
  return entry.term.toLocaleLowerCase('en-US').replace(/\s+/g, ' ')
}

function renderGlossary(corpus: SpecificationCorpus): string {
  const outputPath = DERIVED_BASE_OUTPUT_PATHS[1]
  const specifications = new Map(corpus.specifications.map((specification) => [specification.id, specification]))
  const entries = corpus.glossary.toSorted(
    (left, right) =>
      compareText(glossarySortKey(left), glossarySortKey(right)) || compareText(left.ownerId, right.ownerId),
  )
  const rows = entries.flatMap((entry) => {
    const owner = specifications.get(entry.ownerId)
    if (!owner) return []
    return [
      [
        entry.term,
        rewriteInlineLinks(entry.definitionMarkdown, entry.ownerPath, outputPath),
        specificationLink(owner, outputPath, 'glossary'),
        entry.ownerStatus,
      ],
    ]
  })
  return `${[
    '# Specification Glossary',
    '',
    GENERATED_NOTICE,
    '',
    'This page inventories declared glossary entries. It does not establish terminology completeness or conceptual correctness.',
    '',
    '[Back to the derived specification catalog](README.md)',
    '',
    markdownTable(['Term', 'Definition', 'Owner', 'Owner status'], rows),
  ].join('\n')}\n`
}

function relationshipSort(left: RelationshipRecord, right: RelationshipRecord): number {
  return (
    compareText(left.dependencyId, right.dependencyId) ||
    compareText(left.dependentId, right.dependentId) ||
    RELATIONSHIP_ORDER.indexOf(left.kind) - RELATIONSHIP_ORDER.indexOf(right.kind) ||
    compareText(left.origin, right.origin)
  )
}

function mermaidText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/[\r\n]+/g, ' ')
}

function renderMermaid(
  specifications: readonly SpecificationRecord[],
  relationships: readonly RelationshipRecord[],
  direction: 'LR' | 'TD' = 'LR',
  firstSpecificationId?: string,
): string {
  const lines = ['```mermaid', `flowchart ${direction}`]
  const sortedSpecifications = specifications.toSorted((left, right) => {
    if (left.id === firstSpecificationId) return -1
    if (right.id === firstSpecificationId) return 1
    return compareText(left.id, right.id)
  })
  for (const specification of sortedSpecifications) {
    lines.push(
      `  ${specification.id}["${mermaidText(`${specification.id} — ${specification.title} (${specification.status})`)}"]`,
    )
  }
  for (const relationship of relationships.toSorted(relationshipSort)) {
    lines.push(`  ${relationship.dependencyId} --> ${relationship.dependentId}`)
  }
  lines.push('```')
  return lines.join('\n')
}

function titleForRelationshipKind(kind: RelationshipKind): string {
  return `${kind[0]?.toUpperCase() ?? ''}${kind.slice(1)}`
}

function passiveDescription(kind: RelationshipKind): string {
  return PASSIVE_DESCRIPTIONS[kind]
}

function uniqueGraphRelationships(relationships: readonly RelationshipRecord[]): readonly RelationshipRecord[] {
  const seen = new Set<string>()
  return relationships.toSorted(relationshipSort).filter((relationship) => {
    const key = `${relationship.dependencyId}\u0000${relationship.dependentId}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function relationshipOutputPath(kind: RelationshipKind): string {
  return `docs/derived/relationships/${kind}.md`
}

function explicitRelationships(corpus: SpecificationCorpus, kind: RelationshipKind): readonly RelationshipRecord[] {
  return uniqueGraphRelationships(
    corpus.relationships.filter((relationship) => relationship.kind === kind && relationship.origin === 'explicit'),
  )
}

function renderedRelationshipKinds(corpus: SpecificationCorpus): readonly RelationshipKind[] {
  return RELATIONSHIP_ORDER.filter((kind) => explicitRelationships(corpus, kind).length > 0)
}

function descendantRelationships(
  relationships: readonly RelationshipRecord[],
  rootId: string,
): readonly RelationshipRecord[] {
  const descendantIds = new Set([rootId])
  const descendants: RelationshipRecord[] = []
  let added = true
  while (added) {
    added = false
    for (const relationship of relationships) {
      if (!descendantIds.has(relationship.dependencyId) || descendants.includes(relationship)) continue
      descendants.push(relationship)
      if (!descendantIds.has(relationship.dependentId)) {
        descendantIds.add(relationship.dependentId)
        added = true
      }
    }
  }
  return descendants
}

function renderRelationshipDiagram(
  specifications: readonly SpecificationRecord[],
  relationships: readonly RelationshipRecord[],
  direction: 'LR' | 'TD' = 'LR',
  firstSpecificationId?: string,
): string {
  const participantIds = new Set(
    relationships.flatMap((relationship) => [relationship.dependencyId, relationship.dependentId]),
  )
  const participants = specifications.filter((specification) => participantIds.has(specification.id))
  return renderMermaid(participants, relationships, direction, firstSpecificationId)
}

function renderRelationshipsIndex(corpus: SpecificationCorpus): string {
  const kinds = renderedRelationshipKinds(corpus)
  return `${[
    '# Specification Relationships',
    '',
    GENERATED_NOTICE,
    '',
    'Each relationship-kind diagram has its own page. Arrows run from Dependency to Dependent and are read in the passive direction described on that page. These views contain declared relationships only and do not infer relationships from citations, paths, review order, or transitive reachability.',
    '',
    '[Back to the derived specification catalog](README.md)',
    '',
    ...kinds.map((kind) => `- [${titleForRelationshipKind(kind)} relationships](relationships/${kind}.md)`),
    ...RELATIONSHIP_ORDER.filter((kind) => kind !== 'follows' && !kinds.includes(kind)).map(
      (kind) => `- ${titleForRelationshipKind(kind)}: No explicit ${kind} relationships are declared.`,
    ),
    '',
    'The always-present implicit `follows` relationship from Specification Conventions to every other registered specification is intentionally not rendered.',
  ].join('\n')}\n`
}

function renderRelationshipKind(corpus: SpecificationCorpus, kind: RelationshipKind): string {
  const specifications = corpus.specifications.toSorted((left, right) => compareText(left.id, right.id))
  const kindRelationships = explicitRelationships(corpus, kind)
  const lines = [
    `# ${titleForRelationshipKind(kind)} Relationships`,
    '',
    GENERATED_NOTICE,
    '',
    passiveDescription(kind),
    '',
    '[Back to the relationship graph index](../relationships.md)',
    '',
    '[Back to the derived specification catalog](../README.md)',
    '',
  ]
  if (kind === 'refines') {
    const engineRelationships = descendantRelationships(kindRelationships, 'ENG')
    if (engineRelationships.length > 0) {
      const engineRelationshipSet = new Set(engineRelationships)
      const otherRelationships = kindRelationships.filter((relationship) => !engineRelationshipSet.has(relationship))
      if (otherRelationships.length > 0) {
        lines.push(
          '## Model and gameplay specifications',
          '',
          renderRelationshipDiagram(specifications, otherRelationships),
          '',
        )
      }
      lines.push('## Engine contract', '', renderRelationshipDiagram(specifications, engineRelationships))
      return `${lines.join('\n')}\n`
    }
  }
  if (kind === 'uses') {
    const governanceRelationships = kindRelationships.filter(
      (relationship) => relationship.dependencyId === 'REL' && relationship.dependentId === 'CONV',
    )
    if (governanceRelationships.length > 0) {
      const governanceRelationshipSet = new Set(governanceRelationships)
      const gameRelationships = kindRelationships.filter((relationship) => !governanceRelationshipSet.has(relationship))
      if (gameRelationships.length > 0) {
        lines.push(
          '## Game specifications',
          '',
          renderRelationshipDiagram(specifications, gameRelationships, 'TD', 'DOM'),
          '',
        )
      }
      lines.push('## Relationship governance', '', renderRelationshipDiagram(specifications, governanceRelationships))
      return `${lines.join('\n')}\n`
    }
  }
  lines.push(renderRelationshipDiagram(specifications, kindRelationships))
  return `${lines.join('\n')}\n`
}

const PASSIVE_LABELS: Readonly<Record<RelationshipKind, string>> = {
  follows: 'followed by',
  refines: 'refined by',
  uses: 'used by',
  implements: 'implemented by',
  verifies: 'verified by',
}

function externalFamilyNodeId(family: SpecificationFamily): string {
  return `family_${familyDirectoryName(family)}`
}

export function renderFamilyDiagram(corpus: SpecificationCorpus, family: SpecificationFamily): string {
  const familyById = new Map(corpus.specifications.map((specification) => [specification.id, specification.family]))
  const members = corpus.specifications
    .filter((specification) => specification.family === family)
    .toSorted((left, right) => compareText(left.id, right.id))
  const edges = new Map<string, { from: string; to: string; kinds: Set<RelationshipKind> }>()
  const externalFamilies = new Set<SpecificationFamily>()
  for (const relationship of corpus.relationships) {
    if (relationship.origin !== 'explicit') continue
    const dependencyFamily = familyById.get(relationship.dependencyId)
    const dependentFamily = familyById.get(relationship.dependentId)
    if (!dependencyFamily || !dependentFamily) continue
    if (dependencyFamily !== family && dependentFamily !== family) continue
    const from = dependencyFamily === family ? relationship.dependencyId : externalFamilyNodeId(dependencyFamily)
    const to = dependentFamily === family ? relationship.dependentId : externalFamilyNodeId(dependentFamily)
    if (dependencyFamily !== family) externalFamilies.add(dependencyFamily)
    if (dependentFamily !== family) externalFamilies.add(dependentFamily)
    const key = `${from}\u0000${to}`
    const edge = edges.get(key) ?? { from, to, kinds: new Set<RelationshipKind>() }
    edge.kinds.add(relationship.kind)
    edges.set(key, edge)
  }
  const memberIds = new Set(members.map((specification) => specification.id))
  const sortedEdges = [...edges.values()].toSorted(
    (left, right) => compareText(left.from, right.from) || compareText(left.to, right.to),
  )
  const internalEdges = sortedEdges.filter((edge) => memberIds.has(edge.from) && memberIds.has(edge.to))
  const crossEdges = sortedEdges.filter((edge) => !memberIds.has(edge.from) || !memberIds.has(edge.to))
  const sections = ['## Within the family', '']
  if (members.length > 1) {
    sections.push(renderFamilyEdges(members, [], internalEdges, 'TD'))
    if (internalEdges.length === 0) sections.push('', 'No relationships are declared within this family.')
  } else {
    sections.push('This family has a single specification, so there are no relationships within it.')
  }
  sections.push('', '## Across families', '')
  if (crossEdges.length > 0) {
    const crossMembers = members.filter((specification) =>
      crossEdges.some((edge) => edge.from === specification.id || edge.to === specification.id),
    )
    const externals = FAMILY_ORDER.filter((candidate) => externalFamilies.has(candidate))
    sections.push(renderFamilyEdges(crossMembers, externals, crossEdges, 'LR'))
  } else {
    sections.push('No relationships are declared with specifications in other families.')
  }
  return sections.join('\n')
}

function renderFamilyEdges(
  members: readonly SpecificationRecord[],
  externals: readonly SpecificationFamily[],
  edges: readonly { from: string; to: string; kinds: ReadonlySet<RelationshipKind> }[],
  direction: 'LR' | 'TD',
): string {
  const lines = ['```mermaid', `flowchart ${direction}`]
  for (const specification of members) {
    lines.push(
      `  ${specification.id}["${mermaidText(`${specification.id} — ${specification.title} (${specification.status})`)}"]`,
    )
  }
  for (const external of externals) {
    lines.push(`  ${externalFamilyNodeId(external)}["${mermaidText(`${external} family`)}"]:::external`)
  }
  for (const edge of edges) {
    const label = RELATIONSHIP_ORDER.filter((kind) => edge.kinds.has(kind))
      .map((kind) => PASSIVE_LABELS[kind])
      .join(', ')
    lines.push(`  ${edge.from} -->|${label}| ${edge.to}`)
  }
  if (externals.length > 0) lines.push('  classDef external stroke-dasharray: 5 5')
  lines.push('```')
  return lines.join('\n')
}

function familyOverviewOutputPath(corpus: SpecificationCorpus, family: SpecificationFamily): string | undefined {
  const directoryName = familyDirectoryName(family)
  const member = corpus.specifications.find(
    (specification) =>
      specification.family === family && directoryOf(specification.path).split('/').at(-1) === directoryName,
  )
  return member ? `${directoryOf(member.path)}/${familyOverviewFileName(family)}` : undefined
}

function spliceFamilyDiagram(content: string, path: string, diagram: string): string {
  const normalized = content.replace(/\r\n?/g, '\n')
  const start = normalized.indexOf(FAMILY_DIAGRAM_START)
  const end = normalized.indexOf(FAMILY_DIAGRAM_END)
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`Family overview ${path} is missing its generated diagram markers.`)
  }
  return [
    normalized.slice(0, start + FAMILY_DIAGRAM_START.length),
    '',
    FAMILY_DIAGRAM_NOTICE,
    '',
    diagram,
    '',
    normalized.slice(end),
  ].join('\n')
}

/**
 * Returns each existing family overview with its generated diagram block refreshed. Overviews that are absent from
 * `sources` are skipped; the specification linter reports them.
 */
export async function renderFamilyOverviews(
  corpus: SpecificationCorpus,
  sources: ReadonlyMap<string, string>,
  prettierOptions: Options = {},
): Promise<ReadonlyMap<string, string>> {
  const outputs = new Map<string, string>()
  for (const family of FAMILY_ORDER) {
    const path = familyOverviewOutputPath(corpus, family)
    const source = path === undefined ? undefined : sources.get(path)
    if (path === undefined || source === undefined) continue
    const spliced = spliceFamilyDiagram(source, path, renderFamilyDiagram(corpus, family))
    outputs.set(
      path,
      normalizeOutput(await format(spliced, { ...prettierOptions, parser: 'markdown', endOfLine: 'lf' })),
    )
  }
  return outputs
}

export async function renderDerivedDocumentation(
  corpus: SpecificationCorpus,
  prettierOptions: Options = {},
): Promise<ReadonlyMap<string, string>> {
  const kinds = renderedRelationshipKinds(corpus)
  const unformatted = new Map<string, string>([
    [DERIVED_BASE_OUTPUT_PATHS[0], renderCatalog(corpus)],
    [DERIVED_BASE_OUTPUT_PATHS[1], renderGlossary(corpus)],
    [DERIVED_BASE_OUTPUT_PATHS[2], renderRelationshipsIndex(corpus)],
    ...kinds.map((kind) => [relationshipOutputPath(kind), renderRelationshipKind(corpus, kind)] as const),
  ])
  const formatted = new Map<string, string>()
  for (const [path, content] of unformatted) {
    formatted.set(
      path,
      normalizeOutput(await format(content, { ...prettierOptions, parser: 'markdown', endOfLine: 'lf' })),
    )
  }
  return formatted
}

function normalizeOutput(value: string): string {
  return `${value.replace(/\r\n?/g, '\n').trimEnd()}\n`
}
