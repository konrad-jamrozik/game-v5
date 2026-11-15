import { relative } from 'node:path/posix'

import { format, type Options } from 'prettier'

import {
  headingsWithSlugs,
  headingText,
  isHeading,
  isLink,
  parseDocument,
  sectionNodes,
  visit,
} from '../spec-linter/markdown.ts'
import { decodeUrlPart, directoryOf, isExternalUrl, resolvePath, splitUrl } from '../spec-linter/paths.ts'
import type { SpecificationCorpus } from '../spec-linter/types.ts'

export const REVIEW_CHECKLIST_PATH = 'docs/derived/review-checklist.md'

/** The conventions in reading order, each with the specifications it applies to. */
const CHECKLIST_CONVENTIONS: readonly { readonly id: string; readonly appliesTo: string }[] = [
  { id: 'CONV', appliesTo: 'every specification' },
  { id: 'TERM', appliesTo: 'every specification' },
  { id: 'GLOSS', appliesTo: 'every specification' },
  { id: 'OVW', appliesTo: 'every specification and every overview' },
  { id: 'REL', appliesTo: 'every specification' },
  { id: 'DCONV', appliesTo: 'Design specifications' },
  { id: 'ICONV', appliesTo: 'Implementation specifications' },
]

const NON_RULE_HEADINGS: ReadonlySet<string> = new Set([
  'Overview',
  'Relationships',
  'Glossary',
  'Edge cases and failure behavior',
  'Acceptance examples',
  'TODOs',
])

const LINTED_SECTION_HEADING = 'Deterministic validation'

const GENERATED_NOTICE =
  '> **Generated — do not edit.** Run `npm run docs:generate` after changing registered specifications.'

interface RuleHeading {
  readonly text: string
  readonly depth: number
  readonly target: string
}

function headingsWithTargets(path: string, content: string): readonly RuleHeading[] {
  const document = parseDocument({ path, content })
  const headings: RuleHeading[] = []
  let inRuleSection = false
  for (const [index, { heading, slug }] of headingsWithSlugs(document).entries()) {
    const text = headingText(heading)
    const target = `${path}#${slug}`
    if (index === 0) continue
    if (heading.depth === 1) inRuleSection = !NON_RULE_HEADINGS.has(text) && !text.startsWith('Appendix')
    if (inRuleSection && heading.depth <= 3) headings.push({ text, depth: heading.depth, target })
  }
  return headings
}

/** The sections that Deterministic validation in Specification Conventions links, which the linter checks. */
function lintedTargets(path: string, content: string): ReadonlySet<string> {
  const document = parseDocument({ path, content })
  const heading = document.headings.find((candidate) => headingText(candidate) === LINTED_SECTION_HEADING)
  const targets = new Set<string>()
  if (!heading || !isHeading(heading)) return targets
  for (const node of sectionNodes(document, heading)) {
    visit(node, (descendant) => {
      if (!isLink(descendant) || isExternalUrl(descendant.url)) return
      const parts = splitUrl(descendant.url)
      const decoded = decodeUrlPart(parts.path)
      const destination = decoded ? resolvePath(path, decoded) : path
      if (parts.fragment) targets.add(`${destination}#${parts.fragment}`)
    })
  }
  return targets
}

/**
 * Renders the review checklist: every rule section of every convention, linked, and marked as checked by the linter
 * when Deterministic validation links it. Every other rule is checked by a reviewer.
 */
export async function renderReviewChecklist(
  corpus: SpecificationCorpus,
  sources: ReadonlyMap<string, string>,
  prettierOptions: Options = {},
): Promise<ReadonlyMap<string, string>> {
  const conventions = CHECKLIST_CONVENTIONS.flatMap((entry) => {
    const specification = corpus.specifications.find((candidate) => candidate.id === entry.id)
    const content = specification ? sources.get(specification.path) : undefined
    return specification && content !== undefined ? [{ ...entry, specification, content }] : []
  })
  const base = conventions.find((entry) => entry.id === 'CONV')
  if (!base) return new Map()
  const linted = lintedTargets(base.specification.path, base.content)
  const link = (target: string, text: string): string => {
    const [path = '', fragment = ''] = target.split('#')
    return `[${text}](${relative(directoryOf(REVIEW_CHECKLIST_PATH), path)}#${fragment})`
  }
  const lines = [
    '# Specification Review Checklist',
    '',
    GENERATED_NOTICE,
    '',
    'Every rule section of the conventions is a review check. A check marked **linted** is also checked by `npm run lint:specs`, as Deterministic validation in Specification Conventions links it; a reviewer checks every other one.',
    '',
    '[Back to the derived specification catalog](README.md)',
  ]
  for (const entry of conventions) {
    lines.push(
      '',
      `## ${entry.specification.title}`,
      '',
      `Applies to ${entry.appliesTo}.`,
      '',
      ...headingsWithTargets(entry.specification.path, entry.content).map(
        (heading) =>
          `${'  '.repeat(heading.depth - 1)}- ${link(heading.target, heading.text)}${linted.has(heading.target) ? ' — **linted**' : ''}`,
      ),
    )
  }
  const formatted = await format(`${lines.join('\n')}\n`, { ...prettierOptions, parser: 'markdown', endOfLine: 'lf' })
  return new Map([[REVIEW_CHECKLIST_PATH, `${formatted.replace(/\r\n?/g, '\n').trimEnd()}\n`]])
}
