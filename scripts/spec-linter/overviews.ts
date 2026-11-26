import type { SpecificationFamily, SpecificationKind } from './types.ts'

export const KIND_ORDER: readonly SpecificationKind[] = ['Governance', 'Design', 'Implementation']

/** Every Family in catalog order, each listed after the Families of its Specification kind that it builds on. */
export const FAMILY_ORDER: readonly SpecificationFamily[] = [
  'Conventions',
  'Process',
  'Foundation',
  'Mechanics',
  'Content',
  'UI',
  'Autopilot AIs',
  'Mandatory',
  'Guidance',
  'Recipes',
  'Autopilot Studies',
]

export const FAMILY_KIND: Readonly<Record<SpecificationFamily, SpecificationKind>> = {
  Conventions: 'Governance',
  Process: 'Governance',
  Foundation: 'Design',
  Mechanics: 'Design',
  Content: 'Design',
  UI: 'Design',
  'Autopilot AIs': 'Design',
  Mandatory: 'Implementation',
  Guidance: 'Implementation',
  Recipes: 'Implementation',
  'Autopilot Studies': 'Implementation',
}

export function isSpecificationFamily(value: string | undefined): value is SpecificationFamily {
  return value !== undefined && Object.hasOwn(FAMILY_KIND, value)
}

export const FAMILY_DIAGRAM_START = '<!-- generated:family-diagram:start -->'
export const FAMILY_DIAGRAM_END = '<!-- generated:family-diagram:end -->'

export const FAMILY_OVERVIEW_HEADINGS = [
  'What this family is for',
  'Documents',
  'How they relate',
  'Why these boundaries',
] as const

/** Lowercases a Family or Specification kind name and joins its words with hyphens, e.g. `autopilot-ais`. */
export function familyDirectoryName(name: string): string {
  return name.toLowerCase().replaceAll(' ', '-')
}

export function kindDirectoryName(kind: SpecificationKind): string {
  return familyDirectoryName(kind)
}

/** The directory of a Family relative to the specification root, e.g. `design/autopilot-ais` for Autopilot AIs. */
export function familyDirectoryPath(family: SpecificationFamily): string {
  return `${kindDirectoryName(FAMILY_KIND[family])}/${familyDirectoryName(family)}`
}

export function familyOverviewFileName(family: SpecificationFamily): string {
  return `about-${familyDirectoryName(family)}.md`
}

export function familyOverviewPath(specificationRoot: string, family: SpecificationFamily): string {
  return `${specificationRoot}/${familyDirectoryPath(family)}/${familyOverviewFileName(family)}`
}

export function familyOverviewTitle(family: SpecificationFamily): string {
  return `About the ${family} family`
}

export function kindOverviewPath(specificationRoot: string, kind: SpecificationKind): string {
  return `${specificationRoot}/${kindDirectoryName(kind)}/about-${kindDirectoryName(kind)}.md`
}

export function kindOverviewTitle(kind: SpecificationKind): string {
  return `About ${kind} specifications`
}

/**
 * Returns true for any `about-*.md` file directly inside a Specification kind directory or a Family directory of the
 * specification root.
 */
export function isFamilyOverviewCandidate(specificationRoot: string, filePath: string): boolean {
  if (!filePath.startsWith(`${specificationRoot}/`)) return false
  const segments = filePath.slice(specificationRoot.length + 1).split('/')
  return (segments.length === 2 || segments.length === 3) && /^about-[^/]*\.md$/.test(segments.at(-1) ?? '')
}
