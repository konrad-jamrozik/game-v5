import type { SpecificationFamily } from './types.ts'

export const FAMILY_ORDER: readonly SpecificationFamily[] = [
  'Governance',
  'Foundation',
  'Mechanics',
  'Content',
  'UI',
  'Autopilot AIs',
  'Implementation',
]

export const FAMILY_DIAGRAM_START = '<!-- generated:family-diagram:start -->'
export const FAMILY_DIAGRAM_END = '<!-- generated:family-diagram:end -->'

export const FAMILY_OVERVIEW_HEADINGS = [
  'What this family is for',
  'Documents',
  'How they relate',
  'Why these boundaries',
] as const

/** Lowercases the Family name and joins its words with hyphens, e.g. `autopilot-ais` for Autopilot AIs. */
export function familyDirectoryName(family: string): string {
  return family.toLowerCase().replaceAll(' ', '-')
}

export function familyOverviewFileName(family: SpecificationFamily): string {
  return `about-${familyDirectoryName(family)}.md`
}

export function familyOverviewPath(specificationRoot: string, family: SpecificationFamily): string {
  return `${specificationRoot}/${familyDirectoryName(family)}/${familyOverviewFileName(family)}`
}

export function familyOverviewTitle(family: SpecificationFamily): string {
  return `About the ${family} family`
}

/** Returns true for any `about-*.md` file directly inside a directory of the specification root. */
export function isFamilyOverviewCandidate(specificationRoot: string, filePath: string): boolean {
  if (!filePath.startsWith(`${specificationRoot}/`)) return false
  const segments = filePath.slice(specificationRoot.length + 1).split('/')
  return segments.length === 2 && /^about-[^/]*\.md$/.test(segments[1] ?? '')
}
