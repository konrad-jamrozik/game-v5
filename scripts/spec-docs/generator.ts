import { relative } from 'node:path/posix'

import type { Link, Root } from 'mdast'
import { format, type Options } from 'prettier'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'

import { isLink, visit } from '../spec-linter/markdown.ts'
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

export const DERIVED_OUTPUT_PATHS = [
  'docs/derived/README.md',
  'docs/derived/glossary.md',
  'docs/derived/relationships.md',
] as const

const FAMILY_ORDER: readonly SpecificationFamily[] = [
  'Governance',
  'Foundation',
  'Mechanics',
  'Content',
  'Interfaces',
  'Acceptance',
]
const STATUS_ORDER: readonly SpecificationStatus[] = ['Stub', 'Draft', 'Accepted', 'Superseded']
const RELATIONSHIP_ORDER: readonly RelationshipKind[] = ['follows', 'refines', 'uses', 'implements', 'verifies']
const PASSIVE_DESCRIPTIONS: Readonly<Record<RelationshipKind, string>> = {
  follows: 'A → B means A is followed by B.',
  refines: 'A → B means A is refined by B.',
  uses: 'A → B means A is used by B.',
  implements: 'A → B means A is implemented by B.',
  verifies: 'A → B means A is verified by B.',
}
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
  if (isExternalUrl(link.url) || link.url.startsWith('#')) return
  const parts = splitUrl(link.url)
  const decodedPath = decodeUrlPart(parts.path)
  if (!decodedPath) return
  const destination = resolvePath(sourcePath, decodedPath)
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
  const outputPath = DERIVED_OUTPUT_PATHS[0]
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
        ['ID', 'Document', 'Status', 'Scope', 'Owns'],
        members.map((specification) => [
          specification.id,
          `[${escapeLinkText(specification.title)}](${relativeLink(outputPath, specification.path)})`,
          specification.status,
          specification.scope,
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
  const outputPath = DERIVED_OUTPUT_PATHS[1]
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
    compareText(left.scope, right.scope) ||
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
): string {
  const lines = ['```mermaid', 'flowchart LR']
  for (const specification of specifications.toSorted((left, right) => compareText(left.id, right.id))) {
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

function renderRelationships(corpus: SpecificationCorpus): string {
  const specifications = corpus.specifications.toSorted((left, right) => compareText(left.id, right.id))
  const relationships = corpus.relationships.toSorted(relationshipSort)
  const lines = [
    '# Specification Relationships',
    '',
    GENERATED_NOTICE,
    '',
    'Arrows run from Dependency to Dependent. The section heading supplies the relationship kind, and the arrow is read in the passive direction described under that heading. These views contain declared relationships only and do not infer relationships from citations, paths, review order, or transitive reachability.',
    '',
    '[Back to the derived specification catalog](README.md)',
  ]
  for (const kind of RELATIONSHIP_ORDER) {
    const kindRelationships = uniqueGraphRelationships(
      relationships.filter((relationship) => relationship.kind === kind),
    )
    lines.push('', `## ${titleForRelationshipKind(kind)}`, '', passiveDescription(kind), '')
    if (kindRelationships.length === 0) {
      lines.push(`No ${kind} relationships are declared.`)
      continue
    }
    const participantIds = new Set(
      kindRelationships.flatMap((relationship) => [relationship.dependencyId, relationship.dependentId]),
    )
    const participants = specifications.filter((specification) => participantIds.has(specification.id))
    lines.push(renderMermaid(participants, kindRelationships))
  }
  return `${lines.join('\n')}\n`
}

export async function renderDerivedDocumentation(
  corpus: SpecificationCorpus,
  prettierOptions: Options = {},
): Promise<ReadonlyMap<string, string>> {
  const unformatted = new Map<string, string>([
    [DERIVED_OUTPUT_PATHS[0], renderCatalog(corpus)],
    [DERIVED_OUTPUT_PATHS[1], renderGlossary(corpus)],
    [DERIVED_OUTPUT_PATHS[2], renderRelationships(corpus)],
  ])
  const formatted = new Map<string, string>()
  for (const path of DERIVED_OUTPUT_PATHS) {
    const content = unformatted.get(path)
    if (content === undefined) throw new Error(`Renderer did not produce ${path}.`)
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
