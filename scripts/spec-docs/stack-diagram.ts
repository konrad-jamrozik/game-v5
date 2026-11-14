import type { SpecificationCorpus, SpecificationFamily, SpecificationRecord } from '../spec-linter/types.ts'

/** The generated layer diagram of the Foundation and Mechanics specifications, linked from the specification index. */
export const STACK_DIAGRAM_PATH = 'docs/images/specification-stack.svg'

/** The Families drawn as layers, from the bottom of the stack to its top. */
const STACK_FAMILIES: readonly SpecificationFamily[] = ['Foundation', 'Mechanics']

const BAND_NAMES: Readonly<Partial<Record<SpecificationFamily, string>>> = {
  Foundation: 'The engine',
  Mechanics: 'Game concepts and mechanics',
}

/** One rectangle of the stack: a Family split into rows of layers. */
export interface StackBand {
  readonly family: SpecificationFamily
  /** Rows of the band from its top to its bottom; each row is one layer. */
  readonly rows: readonly (readonly SpecificationRecord[])[]
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
 * Splits the Foundation and Mechanics specifications into rectangles and rows using only their explicit uses and
 * refines relationships:
 *
 * - Every specification is in its Family's rectangle. Within it, a specification's layer is one above the
 *   highest layer of the specifications of the same rectangle it depends on; one that depends on none of them is in
 *   layer 1, the bottom row. A specification that neither depends on nor is depended on by anything in its rectangle is
 *   drawn in the top row, nearest the specifications above that use it.
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
  const dependentsOf = (id: string): ReadonlySet<string> => dependents.get(id) ?? new Set<string>()
  const familyOf = new Map(stack.map((specification) => [specification.id, specification.family]))
  const byTitle = (left: SpecificationRecord, right: SpecificationRecord): number =>
    compareText(left.title, right.title)

  const foundation = stack.filter((specification) => specification.family === 'Foundation')
  const mechanics = stack.filter((specification) => specification.family === 'Mechanics')
  const rowsOf = (members: readonly SpecificationRecord[]): SpecificationRecord[][] => {
    const memberIds = new Set(members.map((member) => member.id))
    const inside = (ids: ReadonlySet<string>): string[] => [...ids].filter((id) => memberIds.has(id))
    const layers = new Map<string, number>()
    const layerOf = (id: string, visiting: ReadonlySet<string> = new Set()): number => {
      const known = layers.get(id)
      if (known !== undefined) return known
      if (visiting.has(id)) return 1
      const next = new Set([...visiting, id])
      const layer = 1 + Math.max(0, ...inside(dependenciesOf(id)).map((dependency) => layerOf(dependency, next)))
      layers.set(id, layer)
      return layer
    }
    for (const member of members) layerOf(member.id)
    const top = Math.max(1, ...layers.values())
    for (const member of members) {
      if (inside(dependenciesOf(member.id)).length === 0 && inside(dependentsOf(member.id)).length === 0) {
        layers.set(member.id, top)
      }
    }
    const rows: SpecificationRecord[][] = []
    for (let layer = top; layer >= 1; layer -= 1) {
      const row = members.filter((member) => layers.get(member.id) === layer).toSorted(byTitle)
      if (row.length > 0) rows.push(row)
    }
    return rows
  }

  const bands: StackBand[] = []
  if (mechanics.length > 0) bands.push({ family: 'Mechanics', rows: rowsOf(mechanics) })
  if (foundation.length > 0) bands.push({ family: 'Foundation', rows: rowsOf(foundation) })

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
const BAND_WIDTH_SHARE: Readonly<Record<string, number>> = { Mechanics: 0.86, Foundation: 1 }
const BAND_PADDING_Y = 14
const BAND_PADDING_X = 16
const EYEBROW_HEIGHT = 18
const NAME_HEIGHT = 30
const ROW_PADDING_Y = 7
const ROW_GAP = 6
const ROW_LABEL_WIDTH = 64
const CHIP_HEIGHT = 28
const CHIP_GAP = 8
const CHIP_FONT_WIDTH = 7.6
const CHIP_PADDING_X = 13
const CONNECTOR_HEIGHT = 34
const CAPTION_HEIGHT = 20

/** Gradient stops from the bottom row of the stack to its top: gray, blue, violet, rose, orange. */
const LIGHT_STOPS: readonly (readonly [string, string])[] = [
  ['#e9ebef', '#3d4452'],
  ['#dde4f6', '#2d3f8f'],
  ['#e8ddf6', '#5a2d91'],
  ['#f6dbea', '#8c2a5d'],
  ['#fdd9bb', '#9a4206'],
]
const DARK_STOPS: readonly (readonly [string, string])[] = [
  ['#262b34', '#c6ccd6'],
  ['#222b4a', '#b3c2ff'],
  ['#33264b', '#d4b8ff'],
  ['#43233b', '#f5afd3'],
  ['#4b2c13', '#ffbf85'],
]

function hexToRgb(hex: string): readonly [number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

function mix(stops: readonly (readonly [string, string])[], position: number, part: 0 | 1): string {
  const scaled = Math.min(Math.max(position, 0), 1) * (stops.length - 1)
  const index = Math.min(Math.floor(scaled), stops.length - 2)
  const fraction = scaled - index
  const from = hexToRgb(stops[index]?.[part] ?? '#000000')
  const to = hexToRgb(stops[index + 1]?.[part] ?? '#000000')
  const channel = (offset: 0 | 1 | 2): string =>
    Math.round(from[offset] + (to[offset] - from[offset]) * fraction)
      .toString(16)
      .padStart(2, '0')
  return `#${channel(0)}${channel(1)}${channel(2)}`
}

function styleSheet(rowCount: number): string {
  const light: string[] = []
  const dark: string[] = []
  const classes: string[] = []
  for (let row = 0; row < rowCount; row += 1) {
    const position = rowCount === 1 ? 0 : row / (rowCount - 1)
    const name = String(row)
    light.push(`--r${name}-bg: ${mix(LIGHT_STOPS, position, 0)}; --r${name}-fg: ${mix(LIGHT_STOPS, position, 1)};`)
    dark.push(`--r${name}-bg: ${mix(DARK_STOPS, position, 0)}; --r${name}-fg: ${mix(DARK_STOPS, position, 1)};`)
    classes.push(
      `.fill-r${name} { fill: var(--r${name}-bg); } .ink-r${name} { fill: var(--r${name}-fg); } .stroke-r${name} { stroke: var(--r${name}-fg); }`,
    )
  }
  return `
    :root { --bg: #ffffff; --muted: #5b6676; --frame: #c3c9d4; --frame-fill: #f8f9fb;
      ${light.join('\n      ')} }
    @media (prefers-color-scheme: dark) {
      :root { --bg: #12161d; --muted: #9aa5b5; --frame: #3a4352; --frame-fill: #171c24;
        ${dark.join('\n        ')} }
    }
    text { font-family: "Segoe UI", system-ui, -apple-system, sans-serif; text-anchor: middle; }
    .bg { fill: var(--bg); }
    .frame { fill: var(--frame-fill); stroke: var(--frame); stroke-width: 1.2; }
    .eyebrow { font-size: 11.5px; font-weight: 700; letter-spacing: 0.1em; }
    .name { font-size: 19px; font-weight: 600; }
    .row-label { font-size: 11px; letter-spacing: 0.05em; text-anchor: start; }
    .chip-text { font-size: 13.5px; }
    .chip { fill: none; stroke-width: 1.2; }
    .connector, .caption { fill: var(--muted); font-size: 12.5px; }
    ${classes.join('\n    ')}
  `
}

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function number(value: number): string {
  return String(Math.round(value * 10) / 10)
}

function chipWidth(title: string): number {
  return title.length * CHIP_FONT_WIDTH + CHIP_PADDING_X * 2
}

/** Splits the chip titles into lines that fit `width`. */
function chipLines(titles: readonly string[], width: number): string[][] {
  const lines: string[][] = []
  let line: string[] = []
  let lineWidth = 0
  for (const title of titles) {
    const next = chipWidth(title)
    if (line.length > 0 && lineWidth + CHIP_GAP + next > width) {
      lines.push(line)
      line = []
      lineWidth = 0
    }
    lineWidth += (line.length > 0 ? CHIP_GAP : 0) + next
    line.push(title)
  }
  if (line.length > 0) lines.push(line)
  return lines
}

function joinTitles(titles: readonly string[]): string {
  if (titles.length <= 1) return titles.join('')
  return `${titles.slice(0, -1).join(', ')} and ${titles.at(-1) ?? ''}`
}

/** Renders the layer diagram of the Foundation and Mechanics specifications as an SVG document. */
export function renderStackDiagram(corpus: SpecificationCorpus): string {
  const layout = computeStackLayout(corpus)
  const inner = WIDTH - MARGIN * 2
  const totalRows = layout.bands.reduce((sum, band) => sum + band.rows.length, 0)
  // Gradient row 0 is the bottom row of the stack; the top row of the stack has the highest number.
  let gradientRow = totalRows
  const parts: string[] = []
  const summaries: string[] = []
  let y = MARGIN
  for (const [index, band] of layout.bands.entries()) {
    if (index > 0) {
      parts.push(
        `  <text class="connector" x="${number(WIDTH / 2)}" y="${number(y + CONNECTOR_HEIGHT / 2 + 4)}">depends on ↓</text>`,
      )
      y += CONNECTOR_HEIGHT
    }
    const width = inner * (BAND_WIDTH_SHARE[band.family] ?? 1)
    const x = (WIDTH - width) / 2
    const rowFullWidth = width - BAND_PADDING_X * 2
    const rowLines = band.rows.map((row) =>
      chipLines(
        row.map((member) => member.title),
        rowFullWidth - ROW_LABEL_WIDTH * 2,
      ),
    )
    const rowHeights = rowLines.map(
      (lines) => ROW_PADDING_Y * 2 + lines.length * CHIP_HEIGHT + (lines.length - 1) * CHIP_GAP,
    )
    const headerColor = String(gradientRow - 1)
    const rowsHeight = rowHeights.reduce((sum, rowHeight) => sum + rowHeight, 0) + ROW_GAP * (band.rows.length - 1)
    const height = BAND_PADDING_Y * 2 + EYEBROW_HEIGHT + NAME_HEIGHT + rowsHeight
    parts.push(
      `  <rect class="frame" x="${number(x)}" y="${number(y)}" width="${number(width)}" height="${number(height)}" rx="10"/>`,
    )
    const eyebrow = band.family.toUpperCase()
    const name = BAND_NAMES[band.family] ?? band.family
    const ink = `ink-r${headerColor}`
    let cursor = y + BAND_PADDING_Y + 12
    parts.push(
      `  <text class="eyebrow ${ink}" x="${number(WIDTH / 2)}" y="${number(cursor)}">${escapeXml(eyebrow)}</text>`,
    )
    cursor += EYEBROW_HEIGHT + 9
    parts.push(`  <text class="name ${ink}" x="${number(WIDTH / 2)}" y="${number(cursor)}">${escapeXml(name)}</text>`)
    cursor += NAME_HEIGHT - 16
    for (const [rowIndex, lines] of rowLines.entries()) {
      gradientRow -= 1
      const color = String(gradientRow)
      const rowHeight = rowHeights[rowIndex] ?? 0
      const rowX = x + BAND_PADDING_X
      parts.push(
        `  <rect class="fill-r${color}" x="${number(rowX)}" y="${number(cursor)}" width="${number(rowFullWidth)}" height="${number(rowHeight)}" rx="7"/>`,
        `  <text class="row-label ink-r${color}" x="${number(rowX + 10)}" y="${number(cursor + rowHeight / 2 + 4)}">LAYER ${String(band.rows.length - rowIndex)}</text>`,
      )
      let lineY = cursor + ROW_PADDING_Y
      for (const line of lines) {
        const lineWidth = line.reduce((sum, title) => sum + chipWidth(title), 0) + CHIP_GAP * (line.length - 1)
        let chipX = (WIDTH - lineWidth) / 2
        for (const title of line) {
          const chip = chipWidth(title)
          parts.push(
            `  <rect class="chip stroke-r${color}" x="${number(chipX)}" y="${number(lineY)}" width="${number(chip)}" height="${String(CHIP_HEIGHT)}" rx="14"/>`,
            `  <text class="chip-text ink-r${color}" x="${number(chipX + chip / 2)}" y="${number(lineY + 19)}">${escapeXml(title)}</text>`,
          )
          chipX += chip + CHIP_GAP
        }
        lineY += CHIP_HEIGHT + CHIP_GAP
      }
      cursor += rowHeight + ROW_GAP
    }
    summaries.push(
      `${band.family}, from its top layer to its bottom layer: ${band.rows
        .map((row) => row.map((member) => member.title).join(', '))
        .join('; ')}`,
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
    y += CAPTION_HEIGHT
  }
  const height = y + MARGIN
  const label = `Specification layers from top to bottom. ${summaries.join('. ')}.`
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${String(WIDTH)}" height="${number(height)}" viewBox="0 0 ${String(WIDTH)} ${number(height)}" role="img" aria-label="${escapeXml(label)}">`,
    `  <title>${escapeXml(label)}</title>`,
    `  <style>${styleSheet(totalRows)}</style>`,
    `  <rect class="bg" x="0" y="0" width="${String(WIDTH)}" height="${number(height)}"/>`,
    ...parts,
    '</svg>',
    '',
  ].join('\n')
}
