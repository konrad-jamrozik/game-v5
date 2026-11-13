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
import { computeLayers, estimateBoxWidth, renderSvgDiagram, type DiagramEdge, type DiagramNode } from './svg-diagram.ts'

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
  '_Generated from the specifications’ Relationships sections by `npm run docs:generate`; do not edit between the markers. Arrows run from Dependency to Dependent; layer 1 holds the specifications that depend on no other specification of the Family; dashed boxes stand for whole other Families._'
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

interface RelationshipSection {
  readonly heading: string | undefined
  readonly slug: string
  readonly relationships: readonly RelationshipRecord[]
}

/** Splits the relationships of one kind into the diagrams its page shows. */
function relationshipSections(corpus: SpecificationCorpus, kind: RelationshipKind): readonly RelationshipSection[] {
  const kindRelationships = explicitRelationships(corpus, kind)
  if (kind === 'refines') {
    const engineRelationships = descendantRelationships(kindRelationships, 'ENG')
    if (engineRelationships.length > 0) {
      const engineRelationshipSet = new Set(engineRelationships)
      const otherRelationships = kindRelationships.filter((relationship) => !engineRelationshipSet.has(relationship))
      return [
        ...(otherRelationships.length > 0
          ? [
              {
                heading: 'Model and gameplay specifications',
                slug: 'model-and-gameplay',
                relationships: otherRelationships,
              },
            ]
          : []),
        { heading: 'Engine contract', slug: 'engine-contract', relationships: engineRelationships },
      ]
    }
  }
  if (kind === 'uses') {
    const governanceRelationships = kindRelationships.filter(
      (relationship) => relationship.dependencyId === 'REL' && relationship.dependentId === 'CONV',
    )
    if (governanceRelationships.length > 0) {
      const governanceRelationshipSet = new Set(governanceRelationships)
      const gameRelationships = kindRelationships.filter((relationship) => !governanceRelationshipSet.has(relationship))
      return [
        ...(gameRelationships.length > 0
          ? [{ heading: 'Game specifications', slug: 'game', relationships: gameRelationships }]
          : []),
        { heading: 'Relationship governance', slug: 'governance', relationships: governanceRelationships },
      ]
    }
  }
  return [{ heading: undefined, slug: 'all', relationships: kindRelationships }]
}

function relationshipSvgFileName(kind: RelationshipKind, section: RelationshipSection): string {
  return `${kind}-${section.slug}.svg`
}

function relationshipSvgLabel(kind: RelationshipKind, section: RelationshipSection): string {
  const title = `${titleForRelationshipKind(kind)} relationships`
  return section.heading === undefined ? title : `${title}: ${section.heading}`
}

function renderRelationshipSvg(
  corpus: SpecificationCorpus,
  kind: RelationshipKind,
  section: RelationshipSection,
): string {
  const participantIds = new Set(
    section.relationships.flatMap((relationship) => [relationship.dependencyId, relationship.dependentId]),
  )
  const participants = corpus.specifications
    .filter((specification) => participantIds.has(specification.id))
    .toSorted((left, right) => compareText(left.id, right.id))
  const edges = section.relationships.map((relationship) => ({
    from: relationship.dependencyId,
    to: relationship.dependentId,
    kinds: new Set<RelationshipKind>([relationship.kind]),
  }))
  const layers = computeLayers(
    participants.map((specification) => specification.id),
    edges,
  )
  return renderSvgDiagram({
    label: relationshipSvgLabel(kind, section),
    nodes: participants.map((specification) => ({
      id: specification.id,
      lines: [specificationLabel(specification)],
      layer: layers.get(specification.id) ?? 1,
    })),
    edges,
    showLayerLabels: true,
  })
}

function renderRelationshipKind(corpus: SpecificationCorpus, kind: RelationshipKind): string {
  const lines = [
    `# ${titleForRelationshipKind(kind)} Relationships`,
    '',
    GENERATED_NOTICE,
    '',
    `${passiveDescription(kind)} Layer 1 holds the specifications that depend on no other specification in the diagram.`,
    '',
    '[Back to the relationship graph index](../relationships.md)',
    '',
    '[Back to the derived specification catalog](../README.md)',
  ]
  for (const section of relationshipSections(corpus, kind)) {
    if (section.heading !== undefined) lines.push('', `## ${section.heading}`)
    lines.push('', `![${relationshipSvgLabel(kind, section)}](./${relationshipSvgFileName(kind, section)})`)
  }
  return `${lines.join('\n')}\n`
}

/** Returns the SVG diagram files linked from the derived relationship pages. */
export function renderDerivedDiagramFiles(corpus: SpecificationCorpus): ReadonlyMap<string, string> {
  const outputs = new Map<string, string>()
  for (const kind of renderedRelationshipKinds(corpus)) {
    for (const section of relationshipSections(corpus, kind)) {
      outputs.set(
        `docs/derived/relationships/${relationshipSvgFileName(kind, section)}`,
        renderRelationshipSvg(corpus, kind, section),
      )
    }
  }
  return outputs
}

function externalFamilyNodeId(family: SpecificationFamily): string {
  return `family_${familyDirectoryName(family)}`
}

interface FamilyEdge {
  readonly from: string
  readonly to: string
  readonly kinds: ReadonlySet<RelationshipKind>
}

interface FamilyDiagramData {
  readonly members: readonly SpecificationRecord[]
  readonly internalEdges: readonly FamilyEdge[]
  readonly crossEdges: readonly FamilyEdge[]
}

function familyDiagramData(corpus: SpecificationCorpus, family: SpecificationFamily): FamilyDiagramData {
  const familyById = new Map(corpus.specifications.map((specification) => [specification.id, specification.family]))
  const members = corpus.specifications
    .filter((specification) => specification.family === family)
    .toSorted((left, right) => compareText(left.id, right.id))
  const edges = new Map<string, { from: string; to: string; kinds: Set<RelationshipKind> }>()
  for (const relationship of corpus.relationships) {
    if (relationship.origin !== 'explicit') continue
    const dependencyFamily = familyById.get(relationship.dependencyId)
    const dependentFamily = familyById.get(relationship.dependentId)
    if (!dependencyFamily || !dependentFamily) continue
    if (dependencyFamily !== family && dependentFamily !== family) continue
    const from = dependencyFamily === family ? relationship.dependencyId : externalFamilyNodeId(dependencyFamily)
    const to = dependentFamily === family ? relationship.dependentId : externalFamilyNodeId(dependentFamily)
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
  return { members, internalEdges, crossEdges }
}

type DiagramScope = 'within' | 'across'

/** The widest row of member boxes, in pixels, before the across-families diagram starts another row. */
const ACROSS_FAMILIES_ROW_WIDTH = 900

function familySvgFileName(family: SpecificationFamily, scope: DiagramScope): string {
  return `${familyDirectoryName(family)}-family-${scope}.svg`
}

function familySvgLabel(family: SpecificationFamily, scope: DiagramScope): string {
  return scope === 'within'
    ? `${family} family: relationships within the family`
    : `${family} family: relationships with other families`
}

function specificationLabel(specification: SpecificationRecord): string {
  return `${specification.id} — ${specification.title} (${specification.status})`
}

function renderWithinFamilySvg(family: SpecificationFamily, data: FamilyDiagramData): string {
  const layers = computeLayers(
    data.members.map((specification) => specification.id),
    data.internalEdges,
  )
  return renderSvgDiagram({
    label: familySvgLabel(family, 'within'),
    nodes: data.members.map((specification) => ({
      id: specification.id,
      lines: [specificationLabel(specification)],
      layer: layers.get(specification.id) ?? 1,
    })),
    edges: data.internalEdges,
    showLayerLabels: true,
  })
}

/**
 * Draws the other Families a Family depends on above its members and the Families depending on it below them.
 * Members with identical relationships to other Families share one box.
 */
function renderAcrossFamiliesSvg(family: SpecificationFamily, data: FamilyDiagramData): string {
  const memberIds = new Set(data.members.map((specification) => specification.id))
  const kindsText = (kinds: ReadonlySet<RelationshipKind>): string =>
    RELATIONSHIP_ORDER.filter((kind) => kinds.has(kind)).join('+')
  const groups = new Map<string, { readonly members: SpecificationRecord[]; readonly edges: readonly FamilyEdge[] }>()
  for (const specification of data.members) {
    const edges = data.crossEdges.filter((edge) => edge.from === specification.id || edge.to === specification.id)
    if (edges.length === 0) continue
    const signature = edges
      .map((edge) =>
        memberIds.has(edge.from)
          ? `out:${edge.to}:${kindsText(edge.kinds)}`
          : `in:${edge.from}:${kindsText(edge.kinds)}`,
      )
      .toSorted(compareText)
      .join('|')
    const group = groups.get(signature) ?? { members: [], edges }
    group.members.push(specification)
    groups.set(signature, group)
  }
  const sortedGroups = [...groups.values()].toSorted((left, right) =>
    compareText(left.members[0]?.id ?? '', right.members[0]?.id ?? ''),
  )
  // Wrap the member boxes onto several rows so that a Family with many specifications stays readable.
  const groupLayers: number[] = []
  let rowWidth = 0
  let groupLayer = 2
  for (const group of sortedGroups) {
    const width = estimateBoxWidth(group.members.map(specificationLabel))
    if (rowWidth > 0 && rowWidth + width > ACROSS_FAMILIES_ROW_WIDTH) {
      groupLayer += 1
      rowWidth = 0
    }
    rowWidth += width
    groupLayers.push(groupLayer)
  }
  const dependentFamiliesLayer = groupLayer + 1
  const nodes: DiagramNode[] = []
  const edges: DiagramEdge[] = []
  const familyNodes = new Set<string>()
  const addFamilyNode = (externalId: string, side: 'in' | 'out'): string => {
    const id = `${side}_${externalId}`
    if (!familyNodes.has(id)) {
      familyNodes.add(id)
      const external = FAMILY_ORDER.find((candidate) => externalFamilyNodeId(candidate) === externalId)
      nodes.push({
        id,
        lines: [`${external ?? externalId} family`],
        layer: side === 'in' ? 1 : dependentFamiliesLayer,
        external: true,
      })
    }
    return id
  }
  for (const [index, group] of sortedGroups.entries()) {
    const id = `group_${String(index).padStart(3, '0')}`
    nodes.push({ id, lines: group.members.map(specificationLabel), layer: groupLayers[index] ?? 2 })
    for (const edge of group.edges) {
      if (memberIds.has(edge.from)) edges.push({ from: id, to: addFamilyNode(edge.to, 'out'), kinds: edge.kinds })
      else edges.push({ from: addFamilyNode(edge.from, 'in'), to: id, kinds: edge.kinds })
    }
  }
  return renderSvgDiagram({ label: familySvgLabel(family, 'across'), nodes, edges, showLayerLabels: false })
}

function imageLink(family: SpecificationFamily, scope: DiagramScope): string {
  return `![${familySvgLabel(family, scope)}](./${familySvgFileName(family, scope)})`
}

/**
 * Returns the SVG diagram files of every Family whose overview exists in `sources` and whose diagrams are generated
 * as SVG. The overview's generated block links to these files.
 */
export function renderFamilyDiagramFiles(
  corpus: SpecificationCorpus,
  sources: ReadonlyMap<string, string>,
): ReadonlyMap<string, string> {
  const outputs = new Map<string, string>()
  for (const family of FAMILY_ORDER) {
    const overviewPath = familyOverviewOutputPath(corpus, family)
    if (overviewPath === undefined || !sources.has(overviewPath)) continue
    const data = familyDiagramData(corpus, family)
    const directory = directoryOf(overviewPath)
    if (data.members.length > 1) {
      outputs.set(`${directory}/${familySvgFileName(family, 'within')}`, renderWithinFamilySvg(family, data))
    }
    if (data.crossEdges.length > 0) {
      outputs.set(`${directory}/${familySvgFileName(family, 'across')}`, renderAcrossFamiliesSvg(family, data))
    }
  }
  return outputs
}

/** Returns true for a path that `renderFamilyDiagramFiles` may produce. */
export function isFamilyDiagramFilePath(path: string): boolean {
  return /^docs\/specs\/[^/]+\/[^/]+-family-(within|across)\.svg$/.test(path)
}

export function renderFamilyDiagram(corpus: SpecificationCorpus, family: SpecificationFamily): string {
  const { members, internalEdges, crossEdges } = familyDiagramData(corpus, family)
  const sections = ['## Within the family', '']
  if (members.length > 1) {
    sections.push(imageLink(family, 'within'))
    if (internalEdges.length === 0) sections.push('', 'No relationships are declared within this family.')
  } else {
    sections.push('This family has a single specification, so there are no relationships within it.')
  }
  sections.push('', '## Across families', '')
  if (crossEdges.length > 0) {
    sections.push(imageLink(family, 'across'))
  } else {
    sections.push('No relationships are declared with specifications in other families.')
  }
  return sections.join('\n')
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
