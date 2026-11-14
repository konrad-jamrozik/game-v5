import type { SpecificationCorpus, SpecificationFamily, SpecificationRecord } from '../spec-linter/types.ts'

/** The generated layer diagram of the Foundation and Mechanics specifications, linked from the specification index. */
export const STACK_DIAGRAM_PATH = 'docs/images/specification-stack.svg'

/** The Families drawn as layers, from the bottom of the stack to its top. */
const STACK_FAMILIES: readonly SpecificationFamily[] = ['Foundation', 'Mechanics']

const BAND_NAMES: Readonly<Partial<Record<SpecificationFamily, string>>> = {
  Foundation: 'The engine',
  Mechanics: 'Game concepts and mechanics',
}

type BandRole = 'bottom' | 'middle' | 'tip'

/** One horizontal layer of the stack. */
export interface StackBand {
  readonly family: SpecificationFamily
  readonly role: BandRole
  readonly members: readonly SpecificationRecord[]
  /** Members every other member of the band builds on; drawn as a caption instead of a chip. */
  readonly bases: readonly SpecificationRecord[]
}

export interface StackLayout {
  /** Bands from the top of the stack to its bottom. */
  readonly bands: readonly StackBand[]
  /** True when no Foundation specification depends on a Mechanics specification. */
  readonly foundationIndependent: boolean
  /** Families that have specifications but are not part of the stack. */
  readonly besideFamilies: readonly SpecificationFamily[]
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
}

/**
 * Splits the Foundation and Mechanics specifications into layers using only their explicit uses and refines
 * relationships:
 *
 * - A Foundation specification is at the bottom when it depends on nothing and every other Foundation specification
 *   that depends on anything depends on it directly.
 * - A Mechanics specification is at the tip when nothing depends on it and it depends directly on every other
 *   Mechanics specification.
 * - Every other specification is in the middle layer of its Family. A middle-layer member that depends on no other
 *   member, and that every other member reaches through its dependencies, is the base of that layer.
 */
export function computeStackLayout(corpus: SpecificationCorpus): StackLayout {
  const stack = corpus.specifications.filter((specification) => STACK_FAMILIES.includes(specification.family))
  const stackIds = new Set(stack.map((specification) => specification.id))
  const dependencies = new Map<string, Set<string>>(stack.map((specification) => [specification.id, new Set<string>()]))
  const dependents = new Map<string, Set<string>>(stack.map((specification) => [specification.id, new Set<string>()]))
  for (const relationship of corpus.relationships) {
    if (relationship.origin !== 'explicit') continue
    if (relationship.kind !== 'uses' && relationship.kind !== 'refines') continue
    if (!stackIds.has(relationship.dependencyId) || !stackIds.has(relationship.dependentId)) continue
    dependencies.get(relationship.dependentId)?.add(relationship.dependencyId)
    dependents.get(relationship.dependencyId)?.add(relationship.dependentId)
  }
  const dependenciesOf = (id: string): ReadonlySet<string> => dependencies.get(id) ?? new Set<string>()
  const familyOf = new Map(stack.map((specification) => [specification.id, specification.family]))
  const byTitle = (left: SpecificationRecord, right: SpecificationRecord): number =>
    compareText(left.title, right.title)

  const foundation = stack.filter((specification) => specification.family === 'Foundation')
  const mechanics = stack.filter((specification) => specification.family === 'Mechanics')

  const bottom = foundation.filter(
    (candidate) =>
      dependenciesOf(candidate.id).size === 0 &&
      foundation.some((other) => other.id !== candidate.id && dependenciesOf(other.id).size > 0) &&
      foundation.every(
        (other) =>
          other.id === candidate.id ||
          dependenciesOf(other.id).size === 0 ||
          dependenciesOf(other.id).has(candidate.id),
      ),
  )
  const tip = mechanics.filter(
    (candidate) =>
      mechanics.length > 1 &&
      (dependents.get(candidate.id)?.size ?? 0) === 0 &&
      mechanics.every((other) => other.id === candidate.id || dependenciesOf(candidate.id).has(other.id)),
  )

  const basesOf = (members: readonly SpecificationRecord[]): SpecificationRecord[] => {
    const memberIds = new Set(members.map((member) => member.id))
    const reaches = (from: string, target: string): boolean => {
      const seen = new Set<string>()
      const pending = [from]
      while (pending.length > 0) {
        const current = pending.pop()
        if (current === undefined || seen.has(current)) continue
        seen.add(current)
        for (const dependency of dependenciesOf(current)) {
          if (dependency === target) return true
          if (memberIds.has(dependency)) pending.push(dependency)
        }
      }
      return false
    }
    if (members.length < 3) return []
    return members.filter(
      (candidate) =>
        [...dependenciesOf(candidate.id)].every((dependency) => !memberIds.has(dependency)) &&
        members.every((other) => other.id === candidate.id || reaches(other.id, candidate.id)),
    )
  }

  const bottomIds = new Set(bottom.map((specification) => specification.id))
  const tipIds = new Set(tip.map((specification) => specification.id))
  const engine = foundation.filter((specification) => !bottomIds.has(specification.id))
  const game = mechanics.filter((specification) => !tipIds.has(specification.id))

  const bands: StackBand[] = []
  if (tip.length > 0) bands.push({ family: 'Mechanics', role: 'tip', members: tip.toSorted(byTitle), bases: [] })
  if (game.length > 0) {
    bands.push({ family: 'Mechanics', role: 'middle', members: game.toSorted(byTitle), bases: basesOf(game) })
  }
  if (engine.length > 0) {
    bands.push({ family: 'Foundation', role: 'middle', members: engine.toSorted(byTitle), bases: basesOf(engine) })
  }
  if (bottom.length > 0) {
    bands.push({ family: 'Foundation', role: 'bottom', members: bottom.toSorted(byTitle), bases: [] })
  }

  const foundationIndependent = foundation.every((specification) =>
    [...dependenciesOf(specification.id)].every((dependency) => familyOf.get(dependency) === 'Foundation'),
  )
  const besideFamilies = [
    ...new Set(
      corpus.specifications
        .map((specification) => specification.family)
        .filter((family) => !STACK_FAMILIES.includes(family) && family !== 'Governance'),
    ),
  ]
  return { bands, foundationIndependent, besideFamilies }
}

const WIDTH = 1000
const MARGIN = 24
const BAND_WIDTH_SHARE: Readonly<Record<string, number>> = { tip: 0.5, Mechanics: 0.76, Foundation: 0.9, bottom: 1 }
const BAND_PADDING_Y = 16
const BAND_PADDING_X = 20
const EYEBROW_HEIGHT = 18
const NAME_HEIGHT = 28
const NOTE_HEIGHT = 22
const CHIP_HEIGHT = 28
const CHIP_GAP = 8
const CHIP_FONT_WIDTH = 7.6
const CHIP_PADDING_X = 13
const CONNECTOR_HEIGHT = 34
const CAPTION_HEIGHT = 26

const STYLE_SHEET = `
    :root { --bg: #ffffff; --muted: #5b6676;
      --tip-bg: #fbe9d9; --tip-fg: #8a4a12; --mech-bg: #e3f2ea; --mech-fg: #1d6b4c;
      --found-bg: #dfe8fb; --found-fg: #23428f; --bottom-bg: #e9edf5; --bottom-fg: #3b4458; }
    @media (prefers-color-scheme: dark) {
      :root { --bg: #12161d; --muted: #9aa5b5;
        --tip-bg: #3a2a1a; --tip-fg: #f2b780; --mech-bg: #17302a; --mech-fg: #7fd8b1;
        --found-bg: #1c2742; --found-fg: #a9c0ff; --bottom-bg: #232a36; --bottom-fg: #c3cad6; }
    }
    text { font-family: "Segoe UI", system-ui, -apple-system, sans-serif; text-anchor: middle; }
    .bg { fill: var(--bg); }
    .eyebrow { font-size: 11.5px; font-weight: 700; letter-spacing: 0.1em; }
    .name { font-size: 19px; font-weight: 600; }
    .note { font-size: 13.5px; }
    .chip-text { font-size: 13.5px; }
    .chip { fill: none; stroke-width: 1.2; }
    .connector, .caption { fill: var(--muted); font-size: 12.5px; }
    .band-tip { fill: var(--tip-bg); } .ink-tip { fill: var(--tip-fg); } .stroke-tip { stroke: var(--tip-fg); }
    .band-mech { fill: var(--mech-bg); } .ink-mech { fill: var(--mech-fg); } .stroke-mech { stroke: var(--mech-fg); }
    .band-found { fill: var(--found-bg); } .ink-found { fill: var(--found-fg); } .stroke-found { stroke: var(--found-fg); }
    .band-bottom { fill: var(--bottom-bg); } .ink-bottom { fill: var(--bottom-fg); } .stroke-bottom { stroke: var(--bottom-fg); }
  `

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function number(value: number): string {
  return String(Math.round(value * 10) / 10)
}

function chipWidth(title: string): number {
  return title.length * CHIP_FONT_WIDTH + CHIP_PADDING_X * 2
}

/** Splits the chip titles into rows that fit `width`. */
function chipRows(titles: readonly string[], width: number): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let rowWidth = 0
  for (const title of titles) {
    const next = chipWidth(title)
    if (row.length > 0 && rowWidth + CHIP_GAP + next > width) {
      rows.push(row)
      row = []
      rowWidth = 0
    }
    rowWidth += (row.length > 0 ? CHIP_GAP : 0) + next
    row.push(title)
  }
  if (row.length > 0) rows.push(row)
  return rows
}

function joinTitles(titles: readonly string[]): string {
  if (titles.length <= 1) return titles.join('')
  return `${titles.slice(0, -1).join(', ')} and ${titles.at(-1) ?? ''}`
}

interface BandText {
  readonly theme: 'tip' | 'mech' | 'found' | 'bottom'
  readonly eyebrow: string
  readonly name: string
  readonly chips: readonly string[]
  readonly note: string | undefined
  readonly share: number
}

function bandText(band: StackBand): BandText {
  const titles = band.members.map((member) => member.title)
  if (band.role === 'tip') {
    return {
      theme: 'tip',
      eyebrow: `${band.family} · tip`.toUpperCase(),
      name: joinTitles(titles),
      chips: [],
      note: `Depends on every other ${band.family} specification`,
      share: BAND_WIDTH_SHARE['tip'] ?? 1,
    }
  }
  if (band.role === 'bottom') {
    return {
      theme: 'bottom',
      eyebrow: `${band.family} · bottom`.toUpperCase(),
      name: joinTitles(titles),
      chips: [],
      note: undefined,
      share: BAND_WIDTH_SHARE['bottom'] ?? 1,
    }
  }
  const baseIds = new Set(band.bases.map((base) => base.id))
  return {
    theme: band.family === 'Mechanics' ? 'mech' : 'found',
    eyebrow: band.family.toUpperCase(),
    name: BAND_NAMES[band.family] ?? band.family,
    chips: band.members.filter((member) => !baseIds.has(member.id)).map((member) => member.title),
    note:
      band.bases.length > 0
        ? `All build on ${joinTitles(band.bases.map((base) => base.title))}, the base of this layer`
        : undefined,
    share: BAND_WIDTH_SHARE[band.family] ?? 1,
  }
}

/** Renders the layer diagram of the Foundation and Mechanics specifications as an SVG document. */
export function renderStackDiagram(corpus: SpecificationCorpus): string {
  const layout = computeStackLayout(corpus)
  const inner = WIDTH - MARGIN * 2
  const parts: string[] = []
  let y = MARGIN
  const bandSummaries: string[] = []
  for (const [index, band] of layout.bands.entries()) {
    if (index > 0) {
      parts.push(
        `  <text class="connector" x="${number(WIDTH / 2)}" y="${number(y + CONNECTOR_HEIGHT / 2 + 4)}">depends on ↓</text>`,
      )
      y += CONNECTOR_HEIGHT
    }
    const text = bandText(band)
    const width = inner * text.share
    const x = (WIDTH - width) / 2
    const rows = chipRows(text.chips, width - BAND_PADDING_X * 2)
    const height =
      BAND_PADDING_Y * 2 +
      EYEBROW_HEIGHT +
      NAME_HEIGHT +
      rows.length * (CHIP_HEIGHT + CHIP_GAP) +
      (text.note === undefined ? 0 : NOTE_HEIGHT)
    parts.push(
      `  <rect class="band-${text.theme}" x="${number(x)}" y="${number(y)}" width="${number(width)}" height="${number(height)}" rx="10"/>`,
    )
    let cursor = y + BAND_PADDING_Y + 12
    parts.push(
      `  <text class="eyebrow ink-${text.theme}" x="${number(WIDTH / 2)}" y="${number(cursor)}">${escapeXml(text.eyebrow)}</text>`,
    )
    cursor += EYEBROW_HEIGHT + 8
    parts.push(
      `  <text class="name ink-${text.theme}" x="${number(WIDTH / 2)}" y="${number(cursor)}">${escapeXml(text.name)}</text>`,
    )
    cursor += NAME_HEIGHT - 14
    for (const row of rows) {
      const rowWidth = row.reduce((sum, title) => sum + chipWidth(title), 0) + CHIP_GAP * (row.length - 1)
      let chipX = (WIDTH - rowWidth) / 2
      for (const title of row) {
        const chip = chipWidth(title)
        parts.push(
          `  <rect class="chip stroke-${text.theme}" x="${number(chipX)}" y="${number(cursor)}" width="${number(chip)}" height="${String(CHIP_HEIGHT)}" rx="14"/>`,
          `  <text class="chip-text ink-${text.theme}" x="${number(chipX + chip / 2)}" y="${number(cursor + 19)}">${escapeXml(title)}</text>`,
        )
        chipX += chip + CHIP_GAP
      }
      cursor += CHIP_HEIGHT + CHIP_GAP
    }
    if (text.note !== undefined) {
      parts.push(
        `  <text class="note ink-${text.theme}" x="${number(WIDTH / 2)}" y="${number(cursor + 15)}">${escapeXml(text.note)}</text>`,
      )
    }
    bandSummaries.push(
      `${text.name}: ${[...text.chips, ...band.bases.map((base) => base.title)].join(', ') || text.name}`,
    )
    y += height
  }
  const captions = [
    layout.foundationIndependent
      ? 'No Foundation specification depends on a Mechanics specification.'
      : 'Some Foundation specifications depend on Mechanics specifications.',
  ]
  if (layout.besideFamilies.length > 0) {
    captions.push(`${joinTitles(layout.besideFamilies)} specifications sit beside the stack and are not drawn.`)
  }
  y += 14
  for (const caption of captions) {
    parts.push(`  <text class="caption" x="${number(WIDTH / 2)}" y="${number(y + 12)}">${escapeXml(caption)}</text>`)
    y += CAPTION_HEIGHT - 6
  }
  const height = y + MARGIN
  const label = `Specification layers from top to bottom. ${bandSummaries.join('. ')}.`
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${String(WIDTH)}" height="${number(height)}" viewBox="0 0 ${String(WIDTH)} ${number(height)}" role="img" aria-label="${escapeXml(label)}">`,
    `  <title>${escapeXml(label)}</title>`,
    `  <style>${STYLE_SHEET}</style>`,
    `  <rect class="bg" x="0" y="0" width="${String(WIDTH)}" height="${number(height)}"/>`,
    ...parts,
    '</svg>',
    '',
  ].join('\n')
}
