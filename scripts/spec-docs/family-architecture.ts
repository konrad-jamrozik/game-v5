import type { SpecificationCorpus } from '../spec-linter/types.ts'

/** The generated diagram of how the Families build on one another, linked from the specification index. */
export const FAMILY_ARCHITECTURE_PATH = 'docs/images/family-architecture.svg'

/** The Families drawn together as the game engine. */
const ENGINE_FAMILIES: readonly string[] = ['Foundation', 'Mechanics']

/** The Family every specification follows implicitly; drawn as a caption rather than a box. */
const GOVERNANCE_FAMILY = 'Governance'

export interface FamilyArchitectureRow {
  readonly family: string
  readonly buildsOn: readonly string[]
}

/**
 * Derives what each Family builds on from the explicit uses and refines relationships between specifications: a Family
 * builds on another Family when one of its specifications uses or refines a specification of that other Family.
 * `families` lists every Family to draw, in order, including Families that have no specification yet.
 */
export function computeFamilyArchitecture(
  corpus: SpecificationCorpus,
  families: readonly string[],
): readonly FamilyArchitectureRow[] {
  const familyById = new Map(corpus.specifications.map((specification) => [specification.id, specification.family]))
  const buildsOn = new Map<string, Set<string>>(families.map((family) => [family, new Set<string>()]))
  for (const relationship of corpus.relationships) {
    if (relationship.origin !== 'explicit') continue
    if (relationship.kind !== 'uses' && relationship.kind !== 'refines') continue
    const dependent = familyById.get(relationship.dependentId)
    const dependency = familyById.get(relationship.dependencyId)
    if (dependent === undefined || dependency === undefined || dependent === dependency) continue
    buildsOn.get(dependent)?.add(dependency)
  }
  return families.map((family) => ({
    family,
    buildsOn: families.filter((other) => buildsOn.get(family)?.has(other) === true),
  }))
}

const WIDTH = 1000
const MARGIN = 28
const BOX_WIDTH = 230
const BOX_HEIGHT = 66
const BOX_GAP = 48
const ROW_GAP = 70
const ENGINE_WIDTH = 640
const ENGINE_HEADER = 40
const ENGINE_BAND_HEIGHT = 52
const ENGINE_BAND_GAP = 8
const ENGINE_PADDING = 14
const CAPTION_HEIGHT = 22

const STYLE_SHEET = `
    :root { --bg: #ffffff; --fg: #1b2330; --muted: #5b6676; --line: #8a94a6; --box: #f6f7f9;
      --engine-bg: #f1f2f5; --found-bg: #dfe5f7; --found-fg: #2d3f8f; --mech-bg: #f7dceb; --mech-fg: #8c2a5d; }
    @media (prefers-color-scheme: dark) {
      :root { --bg: #12161d; --fg: #e6eaf0; --muted: #9aa5b5; --line: #7c8698; --box: #1a2029;
        --engine-bg: #1b2029; --found-bg: #222b4a; --found-fg: #b3c2ff; --mech-bg: #43233b; --mech-fg: #f5afd3; }
    }
    text { font-family: "Segoe UI", system-ui, -apple-system, sans-serif; text-anchor: middle; }
    .bg { fill: var(--bg); }
    .box { fill: var(--box); stroke: var(--line); stroke-width: 1.3; }
    .engine { fill: var(--engine-bg); stroke: var(--line); stroke-width: 1.3; }
    .title { fill: var(--fg); font-size: 17px; font-weight: 600; }
    .count { fill: var(--muted); font-size: 12.5px; }
    .engine-title { fill: var(--fg); font-size: 18px; font-weight: 600; }
    .band-found { fill: var(--found-bg); } .ink-found { fill: var(--found-fg); }
    .band-mech { fill: var(--mech-bg); } .ink-mech { fill: var(--mech-fg); }
    .band-name { font-size: 15px; font-weight: 600; }
    .band-count { font-size: 12.5px; }
    .arrow { stroke: var(--line); stroke-width: 1.6; fill: none; }
    .head { fill: var(--line); }
    .caption { fill: var(--muted); font-size: 12.5px; }
  `

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function number(value: number): string {
  return String(Math.round(value * 10) / 10)
}

function countText(count: number): string {
  if (count === 0) return 'no specifications yet'
  return count === 1 ? '1 specification' : `${String(count)} specifications`
}

interface Box {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

/**
 * Renders the Families as boxes: the game engine (Foundation and Mechanics) at the bottom and every other Family above
 * the Families it builds on, with an arrow from each Family to each Family it builds on.
 */
export function renderFamilyArchitecture(corpus: SpecificationCorpus, rows: readonly FamilyArchitectureRow[]): string {
  const counts = new Map<string, number>()
  for (const specification of corpus.specifications) {
    counts.set(specification.family, (counts.get(specification.family) ?? 0) + 1)
  }
  const engineMembers = ENGINE_FAMILIES.filter((family) => rows.some((row) => row.family === family))
  const others = rows.filter((row) => row.family !== GOVERNANCE_FAMILY && !ENGINE_FAMILIES.includes(row.family))
  const buildsOn = new Map(rows.map((row) => [row.family, row.buildsOn]))

  const depthCache = new Map<string, number>()
  const depthOf = (family: string, visiting: ReadonlySet<string> = new Set()): number => {
    if (ENGINE_FAMILIES.includes(family)) return 0
    const cached = depthCache.get(family)
    if (cached !== undefined) return cached
    if (visiting.has(family)) return 1
    const next = new Set([...visiting, family])
    const depth =
      1 +
      Math.max(
        0,
        ...(buildsOn.get(family) ?? [])
          .filter((dependency) => dependency !== GOVERNANCE_FAMILY)
          .map((dependency) => depthOf(dependency, next)),
      )
    depthCache.set(family, depth)
    return depth
  }
  const maxDepth = Math.max(0, ...others.map((row) => depthOf(row.family)))

  const parts: string[] = []
  const boxes = new Map<string, Box>()
  let y = MARGIN
  for (let depth = maxDepth; depth >= 1; depth -= 1) {
    const members = others.filter((row) => depthOf(row.family) === depth)
    const rowWidth = members.length * BOX_WIDTH + (members.length - 1) * BOX_GAP
    let x = (WIDTH - rowWidth) / 2
    for (const member of members) {
      boxes.set(member.family, { x, y, width: BOX_WIDTH, height: BOX_HEIGHT })
      parts.push(
        `  <rect class="box" x="${number(x)}" y="${number(y)}" width="${String(BOX_WIDTH)}" height="${String(BOX_HEIGHT)}" rx="10"/>`,
        `  <text class="title" x="${number(x + BOX_WIDTH / 2)}" y="${number(y + 28)}">${escapeXml(member.family)}</text>`,
        `  <text class="count" x="${number(x + BOX_WIDTH / 2)}" y="${number(y + 49)}">${escapeXml(countText(counts.get(member.family) ?? 0))}</text>`,
      )
      x += BOX_WIDTH + BOX_GAP
    }
    y += BOX_HEIGHT + ROW_GAP
  }

  const engineHeight =
    ENGINE_HEADER +
    engineMembers.length * ENGINE_BAND_HEIGHT +
    Math.max(0, engineMembers.length - 1) * ENGINE_BAND_GAP +
    ENGINE_PADDING
  const engine: Box = { x: (WIDTH - ENGINE_WIDTH) / 2, y, width: ENGINE_WIDTH, height: engineHeight }
  parts.push(
    `  <rect class="engine" x="${number(engine.x)}" y="${number(engine.y)}" width="${String(ENGINE_WIDTH)}" height="${number(engineHeight)}" rx="12"/>`,
    `  <text class="engine-title" x="${number(WIDTH / 2)}" y="${number(engine.y + 27)}">Game engine</text>`,
  )
  // Mechanics is drawn above Foundation, as in the specification layer diagram.
  let bandY = engine.y + ENGINE_HEADER
  for (const family of engineMembers.toReversed()) {
    const theme = family === 'Mechanics' ? 'mech' : 'found'
    const bandWidth =
      family === 'Mechanics' ? ENGINE_WIDTH - 2 * ENGINE_PADDING - 80 : ENGINE_WIDTH - 2 * ENGINE_PADDING
    const bandX = (WIDTH - bandWidth) / 2
    parts.push(
      `  <rect class="band-${theme}" x="${number(bandX)}" y="${number(bandY)}" width="${number(bandWidth)}" height="${String(ENGINE_BAND_HEIGHT)}" rx="8"/>`,
      `  <text class="band-name ink-${theme}" x="${number(WIDTH / 2)}" y="${number(bandY + 22)}">${escapeXml(family)}</text>`,
      `  <text class="band-count ink-${theme}" x="${number(WIDTH / 2)}" y="${number(bandY + 40)}">${escapeXml(countText(counts.get(family) ?? 0))}</text>`,
    )
    bandY += ENGINE_BAND_HEIGHT + ENGINE_BAND_GAP
  }
  y = engine.y + engineHeight

  const targets = new Set<string>()
  const edges: string[] = []
  for (const row of others) {
    const from = boxes.get(row.family)
    if (!from) continue
    for (const dependency of row.buildsOn) {
      const targetKey = ENGINE_FAMILIES.includes(dependency) ? 'engine' : dependency
      const key = `${row.family}->${targetKey}`
      if (targets.has(key) || dependency === GOVERNANCE_FAMILY) continue
      targets.add(key)
      const target = targetKey === 'engine' ? engine : boxes.get(dependency)
      if (!target) continue
      const startX = from.x + from.width / 2
      const startY = from.y + from.height
      const endX = Math.min(Math.max(startX, target.x + 30), target.x + target.width - 30)
      const endY = target.y
      edges.push(
        `  <path class="arrow" d="M ${number(startX)} ${number(startY)} L ${number(endX)} ${number(endY - 8)}"/>`,
        `  <path class="head" d="M ${number(endX - 6)} ${number(endY - 10)} L ${number(endX + 6)} ${number(endY - 10)} L ${number(endX)} ${number(endY)} Z"/>`,
      )
    }
  }
  parts.push(...edges)

  const captions = ['Arrows point from a Family to the Families its specifications use or refine.']
  const empty = others.filter((row) => (counts.get(row.family) ?? 0) === 0).map((row) => row.family)
  if (empty.length > 0) {
    captions.push(
      `${empty.join(' and ')} ${empty.length === 1 ? 'has' : 'have'} no specifications yet, so no relationships either.`,
    )
  }
  if (rows.some((row) => row.family === GOVERNANCE_FAMILY)) {
    captions.push('Every specification also follows the Governance family, which is not drawn.')
  }
  y += 22
  for (const caption of captions) {
    parts.push(`  <text class="caption" x="${number(WIDTH / 2)}" y="${number(y + 12)}">${escapeXml(caption)}</text>`)
    y += CAPTION_HEIGHT
  }
  const height = y + MARGIN
  const label = `Family architecture. ${others
    .map((row) => `${row.family} builds on ${row.buildsOn.join(' and ') || 'nothing'}`)
    .join('. ')}. Foundation and Mechanics form the game engine.`
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
