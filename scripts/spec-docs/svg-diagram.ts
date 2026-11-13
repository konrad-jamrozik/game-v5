import type { RelationshipKind } from '../spec-linter/types.ts'

/** A box of the diagram. `layer` 1 is the top row; larger layers are drawn below it. */
export interface DiagramNode {
  readonly id: string
  readonly lines: readonly string[]
  readonly layer: number
  readonly external?: boolean
}

/** An arrow from a Dependency (`from`) to its Dependent (`to`). */
export interface DiagramEdge {
  readonly from: string
  readonly to: string
  readonly kinds: ReadonlySet<RelationshipKind>
}

export interface DiagramInput {
  readonly label: string
  readonly nodes: readonly DiagramNode[]
  readonly edges: readonly DiagramEdge[]
  readonly showLayerLabels: boolean
}

type EdgeStyle = 'uses' | 'refines' | 'both' | 'other'

const STYLE_ORDER: readonly EdgeStyle[] = ['uses', 'refines', 'both', 'other']
const STYLE_LABELS: Readonly<Record<EdgeStyle, string>> = {
  uses: 'used by',
  refines: 'refined by',
  both: 'refined by and used by',
  other: 'other relationship kinds',
}

const FONT_SIZE = 13
const CHARACTER_WIDTH = 7.4
const LINE_HEIGHT = 19
const BOX_PADDING_X = 16
const BOX_PADDING_Y = 13
const PORT_SPACING = 26
const NODE_GAP = 36
const DUMMY_WIDTH = 18
const ROW_GAP = 72
const SAME_ROW_ARC = 26
const MARGIN = 24
const LAYER_LABEL_WIDTH = 76
const LEGEND_HEIGHT = 44
const ARROW_LENGTH = 3

const STYLE_SHEET = `
    :root { --bg: #ffffff; --surface: #ffffff; --fg: #1b2330; --muted: #5b6676; --line: #d5dae2; --uses: #0b86ad; --refines: #c22d8c; --both: #5a45d6; }
    @media (prefers-color-scheme: dark) {
      :root { --bg: #12161d; --surface: #1a2029; --fg: #e6eaf0; --muted: #9aa5b5; --line: #323b49; --uses: #4cc3e6; --refines: #f06cc0; --both: #9d8ff7; }
    }
    text { font-family: "Segoe UI", system-ui, -apple-system, sans-serif; }
    .bg { fill: var(--bg); }
    .box { fill: var(--surface); stroke: var(--fg); stroke-width: 1.4; }
    .external { stroke: var(--muted); stroke-dasharray: 6 5; }
    .label { fill: var(--fg); font-size: ${String(FONT_SIZE)}px; font-weight: 600; text-anchor: middle; }
    .layer { fill: var(--muted); font-size: 11.5px; letter-spacing: 0.04em; }
    .rule { stroke: var(--line); stroke-width: 1; stroke-dasharray: 2 6; }
    .legend { fill: var(--muted); font-size: 12.5px; }
    .edge { fill: none; }
    .edge-uses { stroke: var(--uses); stroke-width: 2; }
    .edge-refines { stroke: var(--refines); stroke-width: 2; }
    .edge-both { stroke: var(--both); stroke-width: 3; }
    .edge-other { stroke: var(--muted); stroke-width: 1.5; stroke-dasharray: 5 4; }
    .head-uses { fill: var(--uses); }
    .head-other { fill: var(--muted); }
    .head-refines { fill: var(--refines); }
    .head-both { fill: var(--both); }
  `

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/[\r\n]+/g, ' ')
}

function number(value: number): string {
  return String(Math.round(value * 10) / 10)
}

function edgeStyle(kinds: ReadonlySet<RelationshipKind>): EdgeStyle {
  const uses = kinds.has('uses')
  const refines = kinds.has('refines')
  if (kinds.size === 1 && uses) return 'uses'
  if (kinds.size === 1 && refines) return 'refines'
  if (kinds.size === 2 && uses && refines) return 'both'
  return 'other'
}

/**
 * Assigns each id a layer. An id nothing in `ids` precedes is layer 1; any other id is one layer below the lowest of
 * the ids it depends on. The ids of one dependency loop share a layer, placed as if the loop were one id.
 */
export function computeLayers(
  ids: readonly string[],
  edges: readonly { readonly from: string; readonly to: string }[],
): ReadonlyMap<string, number> {
  const known = new Set(ids)
  const dependents = new Map<string, string[]>(ids.map((id) => [id, []]))
  for (const edge of edges) {
    if (edge.from === edge.to || !known.has(edge.from) || !known.has(edge.to)) continue
    dependents.get(edge.from)?.push(edge.to)
  }
  const index = new Map<string, number>()
  const low = new Map<string, number>()
  const onStack = new Set<string>()
  const stack: string[] = []
  const component = new Map<string, number>()
  let nextIndex = 0
  let componentCount = 0
  const connect = (id: string): void => {
    index.set(id, nextIndex)
    low.set(id, nextIndex)
    nextIndex += 1
    stack.push(id)
    onStack.add(id)
    for (const next of dependents.get(id) ?? []) {
      if (!index.has(next)) {
        connect(next)
        low.set(id, Math.min(low.get(id) ?? 0, low.get(next) ?? 0))
      } else if (onStack.has(next)) {
        low.set(id, Math.min(low.get(id) ?? 0, index.get(next) ?? 0))
      }
    }
    if (low.get(id) !== index.get(id)) return
    for (;;) {
      const member = stack.pop()
      if (member === undefined) break
      onStack.delete(member)
      component.set(member, componentCount)
      if (member === id) break
    }
    componentCount += 1
  }
  for (const id of ids) if (!index.has(id)) connect(id)

  const dependencies = new Map<number, Set<number>>()
  for (const edge of edges) {
    const from = component.get(edge.from)
    const to = component.get(edge.to)
    if (from === undefined || to === undefined || from === to) continue
    const set = dependencies.get(to) ?? new Set<number>()
    set.add(from)
    dependencies.set(to, set)
  }
  const componentLayer = new Map<number, number>()
  const layerOf = (target: number): number => {
    const cached = componentLayer.get(target)
    if (cached !== undefined) return cached
    let layer = 1
    for (const dependency of dependencies.get(target) ?? []) layer = Math.max(layer, layerOf(dependency) + 1)
    componentLayer.set(target, layer)
    return layer
  }
  return new Map(ids.map((id) => [id, layerOf(component.get(id) ?? 0)]))
}

interface Item {
  readonly key: string
  readonly node: DiagramNode | undefined
  readonly row: number
  width: number
  readonly height: number
  x: number
}

interface Chain {
  readonly style: EdgeStyle
  readonly keys: readonly string[]
  readonly step: 1 | -1
}

interface SameRowEdge {
  readonly style: EdgeStyle
  readonly from: string
  readonly to: string
  readonly row: number
  readonly depth: number
}

function mean(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

/** Renders the diagram as a standalone SVG document. The same input always produces the same text. */
export function renderSvgDiagram(input: DiagramInput): string {
  const nodes = input.nodes.toSorted((left, right) => compareText(left.id, right.id))
  const layerNumbers = [...new Set(nodes.map((node) => node.layer))].toSorted((left, right) => left - right)
  const rowOfLayer = new Map(layerNumbers.map((layer, row) => [layer, row]))
  const rowCount = layerNumbers.length
  const items = new Map<string, Item>()
  const rows: string[][] = layerNumbers.map(() => [])
  const connected = new Set(input.edges.flatMap((edge) => [edge.from, edge.to]))

  for (const node of nodes.toSorted(
    (left, right) =>
      Number(!connected.has(left.id)) - Number(!connected.has(right.id)) || compareText(left.id, right.id),
  )) {
    const row = rowOfLayer.get(node.layer) ?? 0
    const longest = Math.max(0, ...node.lines.map((line) => line.length))
    items.set(node.id, {
      key: node.id,
      node,
      row,
      width: longest * CHARACTER_WIDTH + BOX_PADDING_X * 2,
      height: node.lines.length * LINE_HEIGHT + BOX_PADDING_Y * 2,
      x: 0,
    })
    rows[row]?.push(node.id)
  }

  // Split every arrow into one segment per row gap, so a long arrow passes between the boxes of the rows it skips.
  const chains: Chain[] = []
  const sameRowEdges: SameRowEdge[] = []
  const sameRowCounts = new Map<number, number>()
  const edges = input.edges.toSorted(
    (left, right) => compareText(left.from, right.from) || compareText(left.to, right.to),
  )
  for (const [edgeIndex, edge] of edges.entries()) {
    const from = items.get(edge.from)
    const to = items.get(edge.to)
    if (!from || !to || from === to) continue
    const style = edgeStyle(edge.kinds)
    if (from.row === to.row) {
      const depth = sameRowCounts.get(from.row) ?? 0
      sameRowCounts.set(from.row, depth + 1)
      sameRowEdges.push({ style, from: from.key, to: to.key, row: from.row, depth })
      continue
    }
    const step = to.row > from.row ? 1 : -1
    const keys = [from.key]
    for (let row = from.row + step; row !== to.row; row += step) {
      const key = `\u0000${String(edgeIndex)}:${String(row)}`
      items.set(key, { key, node: undefined, row, width: DUMMY_WIDTH, height: 0, x: 0 })
      rows[row]?.push(key)
      keys.push(key)
    }
    keys.push(to.key)
    chains.push({ style, keys, step })
  }

  const above = new Map<string, string[]>()
  const below = new Map<string, string[]>()
  const segments: { readonly upper: string; readonly lower: string }[] = []
  for (const chain of chains) {
    for (let position = 0; position + 1 < chain.keys.length; position += 1) {
      const first = chain.keys[position]
      const second = chain.keys[position + 1]
      if (first === undefined || second === undefined) continue
      const upper = chain.step === 1 ? first : second
      const lower = chain.step === 1 ? second : first
      segments.push({ upper, lower })
      below.set(upper, [...(below.get(upper) ?? []), lower])
      above.set(lower, [...(above.get(lower) ?? []), upper])
    }
  }

  // Order each row to reduce crossings: repeatedly sort a row by the average position of its neighbors.
  const positions = (): Map<string, number> => {
    const result = new Map<string, number>()
    for (const row of rows) for (const [position, key] of row.entries()) result.set(key, position)
    return result
  }
  const crossings = (): number => {
    const position = positions()
    let count = 0
    for (let row = 0; row + 1 < rowCount; row += 1) {
      const pairs = segments
        .filter((segment) => items.get(segment.upper)?.row === row)
        .map((segment) => [position.get(segment.upper) ?? 0, position.get(segment.lower) ?? 0] as const)
      for (const [first, [upperA, lowerA]] of pairs.entries()) {
        for (const [upperB, lowerB] of pairs.slice(first + 1)) {
          if ((upperA - upperB) * (lowerA - lowerB) < 0) count += 1
        }
      }
    }
    return count
  }
  const sortRow = (row: number, neighbors: ReadonlyMap<string, readonly string[]>): void => {
    const position = positions()
    const current = rows[row] ?? []
    const weight = new Map(
      current.map((key) => {
        const linked = (neighbors.get(key) ?? []).map((neighbor) => position.get(neighbor) ?? 0)
        return [key, linked.length > 0 ? mean(linked) : (position.get(key) ?? 0)] as const
      }),
    )
    rows[row] = current.toSorted(
      (left, right) =>
        (weight.get(left) ?? 0) - (weight.get(right) ?? 0) || (position.get(left) ?? 0) - (position.get(right) ?? 0),
    )
  }
  let bestRows = rows.map((row) => [...row])
  let bestCrossings = crossings()
  for (let sweep = 0; sweep < 24 && bestCrossings > 0; sweep += 1) {
    if (sweep % 2 === 0) for (let row = 1; row < rowCount; row += 1) sortRow(row, above)
    else for (let row = rowCount - 2; row >= 0; row -= 1) sortRow(row, below)
    const count = crossings()
    if (count < bestCrossings) {
      bestCrossings = count
      bestRows = rows.map((row) => [...row])
    }
  }
  for (const [row, keys] of bestRows.entries()) rows[row] = keys

  // Widen a box that has more arrows on one side than its label leaves room for.
  const endpointCount = new Map<string, number>()
  for (const chain of chains) {
    const first = chain.keys[0] ?? ''
    const last = chain.keys.at(-1) ?? ''
    const leaving = `${first}:${chain.step === 1 ? 'bottom' : 'top'}`
    const entering = `${last}:${chain.step === 1 ? 'top' : 'bottom'}`
    endpointCount.set(leaving, (endpointCount.get(leaving) ?? 0) + 1)
    endpointCount.set(entering, (endpointCount.get(entering) ?? 0) + 1)
  }
  for (const item of items.values()) {
    if (!item.node) continue
    const ports = Math.max(endpointCount.get(`${item.key}:top`) ?? 0, endpointCount.get(`${item.key}:bottom`) ?? 0)
    item.width = Math.max(item.width, (ports + 1) * PORT_SPACING)
  }

  // Place each row, then pull every box toward the boxes it connects to while keeping the order and the gaps.
  const separation = (left: Item, right: Item): number =>
    (left.width + right.width) / 2 + (left.node && right.node ? NODE_GAP : NODE_GAP / 2)
  const rowItems = (row: number): Item[] =>
    (rows[row] ?? []).flatMap((key) => {
      const item = items.get(key)
      return item ? [item] : []
    })
  for (let row = 0; row < rowCount; row += 1) {
    const current = rowItems(row)
    let cursor = 0
    for (const [position, item] of current.entries()) {
      const previous = current[position - 1]
      if (previous) cursor += separation(previous, item)
      item.x = cursor
    }
    for (const item of current) item.x -= cursor / 2
  }
  const relaxRow = (row: number): void => {
    const current = rowItems(row)
    const desired = current.map((item) => {
      const linked = [...(above.get(item.key) ?? []), ...(below.get(item.key) ?? [])].flatMap((key) => {
        const neighbor = items.get(key)
        return neighbor ? [neighbor.x] : []
      })
      return linked.length > 0 ? mean(linked) : item.x
    })
    const forward: number[] = []
    for (const [position, item] of current.entries()) {
      const previous = current[position - 1]
      const wanted = desired[position] ?? item.x
      forward.push(previous ? Math.max(wanted, (forward[position - 1] ?? 0) + separation(previous, item)) : wanted)
    }
    const backward: number[] = Array.from({ length: current.length }, () => 0)
    for (let position = current.length - 1; position >= 0; position -= 1) {
      const item = current[position]
      const next = current[position + 1]
      if (!item) continue
      const wanted = desired[position] ?? item.x
      backward[position] = next ? Math.min(wanted, (backward[position + 1] ?? 0) - separation(item, next)) : wanted
    }
    for (const [position, item] of current.entries()) {
      item.x = ((forward[position] ?? item.x) + (backward[position] ?? item.x)) / 2
    }
  }
  for (let sweep = 0; sweep < 12; sweep += 1) {
    if (sweep % 2 === 0) for (let row = 1; row < rowCount; row += 1) relaxRow(row)
    else for (let row = rowCount - 2; row >= 0; row -= 1) relaxRow(row)
  }

  const contentLeft = MARGIN + (input.showLayerLabels ? LAYER_LABEL_WIDTH : 0)
  const allItems = [...items.values()]
  const minimumLeft = Math.min(...allItems.map((item) => item.x - item.width / 2))
  for (const item of allItems) item.x += contentLeft - minimumLeft
  const contentRight = Math.max(...allItems.map((item) => item.x + item.width / 2))

  const rowTop: number[] = []
  const rowHeight: number[] = []
  let cursorY = MARGIN + LEGEND_HEIGHT
  for (let row = 0; row < rowCount; row += 1) {
    const height = Math.max(0, ...rowItems(row).map((item) => item.height))
    rowTop.push(cursorY)
    rowHeight.push(height)
    const arcs = sameRowCounts.get(row) ?? 0
    cursorY += height + (row + 1 < rowCount ? ROW_GAP : 0) + (arcs > 0 ? SAME_ROW_ARC + arcs * 8 : 0)
  }
  const top = (item: Item): number => (rowTop[item.row] ?? 0) + ((rowHeight[item.row] ?? 0) - item.height) / 2
  const bottom = (item: Item): number => top(item) + item.height

  // Spread the arrows along each box edge in the order of where they come from or go to.
  const portX = new Map<string, number>()
  const portGroups = new Map<string, { readonly chain: number; readonly other: number }[]>()
  for (const [chainIndex, chain] of chains.entries()) {
    const first = chain.keys[0] ?? ''
    const last = chain.keys.at(-1) ?? ''
    const afterFirst = items.get(chain.keys[1] ?? '')?.x ?? 0
    const beforeLast = items.get(chain.keys.at(-2) ?? '')?.x ?? 0
    const leaving = `${first}:${chain.step === 1 ? 'bottom' : 'top'}`
    const entering = `${last}:${chain.step === 1 ? 'top' : 'bottom'}`
    portGroups.set(leaving, [...(portGroups.get(leaving) ?? []), { chain: chainIndex, other: afterFirst }])
    portGroups.set(entering, [...(portGroups.get(entering) ?? []), { chain: chainIndex, other: beforeLast }])
  }
  for (const [group, ports] of portGroups) {
    const item = items.get(group.slice(0, group.lastIndexOf(':')))
    if (!item) continue
    const sorted = ports.toSorted((left, right) => left.other - right.other || left.chain - right.chain)
    for (const [position, port] of sorted.entries()) {
      const x = item.x - item.width / 2 + (item.width * (position + 1)) / (sorted.length + 1)
      portX.set(`${group}:${String(port.chain)}`, x)
    }
  }

  const curve = (fromX: number, fromY: number, toX: number, toY: number): string => {
    const middle = (fromY + toY) / 2
    return `C ${number(fromX)} ${number(middle)} ${number(toX)} ${number(middle)} ${number(toX)} ${number(toY)}`
  }
  const edgePaths: string[] = []
  for (const [chainIndex, chain] of chains.entries()) {
    const from = items.get(chain.keys[0] ?? '')
    const to = items.get(chain.keys.at(-1) ?? '')
    if (!from || !to) continue
    const down = chain.step === 1
    let x = portX.get(`${from.key}:${down ? 'bottom' : 'top'}:${String(chainIndex)}`) ?? from.x
    let y = down ? bottom(from) : top(from)
    const parts = [`M ${number(x)} ${number(y)}`]
    for (const key of chain.keys.slice(1, -1)) {
      const dummy = items.get(key)
      if (!dummy) continue
      const bandTop = rowTop[dummy.row] ?? 0
      const bandBottom = bandTop + (rowHeight[dummy.row] ?? 0)
      parts.push(curve(x, y, dummy.x, down ? bandTop : bandBottom))
      x = dummy.x
      y = down ? bandBottom : bandTop
      parts.push(`L ${number(x)} ${number(y)}`)
    }
    const endX = portX.get(`${to.key}:${down ? 'top' : 'bottom'}:${String(chainIndex)}`) ?? to.x
    const endY = down ? top(to) - ARROW_LENGTH : bottom(to) + ARROW_LENGTH
    parts.push(curve(x, y, endX, endY))
    edgePaths.push(
      `  <path class="edge edge-${chain.style}" marker-end="url(#head-${chain.style})" d="${parts.join(' ')}"/>`,
    )
  }
  for (const edge of sameRowEdges) {
    const from = items.get(edge.from)
    const to = items.get(edge.to)
    if (!from || !to) continue
    const direction = to.x > from.x ? 1 : -1
    const startX = from.x + (direction * from.width) / 4
    const endX = to.x - (direction * to.width) / 4
    const startY = bottom(from)
    const endY = bottom(to) + ARROW_LENGTH
    const dip = Math.max(startY, endY) + SAME_ROW_ARC + edge.depth * 8
    edgePaths.push(
      `  <path class="edge edge-${edge.style}" marker-end="url(#head-${edge.style})" d="M ${number(startX)} ${number(startY)} C ${number(startX)} ${number(dip)} ${number(endX)} ${number(dip)} ${number(endX)} ${number(endY)}"/>`,
    )
  }

  const usedStyles = STYLE_ORDER.filter(
    (style) => chains.some((chain) => chain.style === style) || sameRowEdges.some((edge) => edge.style === style),
  )
  const legend: string[] = []
  let legendX = MARGIN
  const legendY = MARGIN + 8
  for (const style of usedStyles) {
    legend.push(
      `  <path class="edge edge-${style}" marker-end="url(#head-${style})" d="M ${number(legendX)} ${number(legendY)} H ${number(legendX + 30)}"/>`,
      `  <text class="legend" x="${number(legendX + 42)}" y="${number(legendY + 4)}">${escapeXml(STYLE_LABELS[style])}</text>`,
    )
    legendX += 42 + STYLE_LABELS[style].length * 6.8 + 28
  }
  if (nodes.some((node) => node.external === true)) {
    legend.push(
      `  <rect class="box external" x="${number(legendX)}" y="${number(legendY - 7)}" width="22" height="14" rx="3"/>`,
      `  <text class="legend" x="${number(legendX + 32)}" y="${number(legendY + 4)}">another family</text>`,
    )
    legendX += 32 + 'another family'.length * 6.8 + 28
  }

  const width = Math.ceil(Math.max(contentRight + MARGIN, legendX))
  const height = Math.ceil(cursorY + MARGIN)

  const layerMarks: string[] = []
  if (input.showLayerLabels) {
    for (const [row, layer] of layerNumbers.entries()) {
      const middle = (rowTop[row] ?? 0) + (rowHeight[row] ?? 0) / 2
      layerMarks.push(
        `  <text class="layer" x="${number(MARGIN)}" y="${number(middle + 4)}">LAYER ${String(layer)}</text>`,
      )
      if (row + 1 < rowCount) {
        const ruleY = (rowTop[row] ?? 0) + (rowHeight[row] ?? 0) + ROW_GAP / 2
        layerMarks.push(
          `  <path class="rule" d="M ${number(MARGIN)} ${number(ruleY)} H ${number(MARGIN + LAYER_LABEL_WIDTH - 16)}"/>`,
        )
      }
    }
  }

  const boxes: string[] = []
  for (const row of rows) {
    for (const key of row) {
      const item = items.get(key)
      if (!item?.node) continue
      const left = item.x - item.width / 2
      boxes.push(
        `  <rect class="box${item.node.external === true ? ' external' : ''}" x="${number(left)}" y="${number(top(item))}" width="${number(item.width)}" height="${number(item.height)}" rx="6"/>`,
      )
      for (const [lineIndex, line] of item.node.lines.entries()) {
        const baseline = top(item) + BOX_PADDING_Y + lineIndex * LINE_HEIGHT + FONT_SIZE
        boxes.push(`  <text class="label" x="${number(item.x)}" y="${number(baseline)}">${escapeXml(line)}</text>`)
      }
    }
  }

  const markers = STYLE_ORDER.map(
    (style) =>
      `    <marker id="head-${style}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto"><path class="head-${style}" d="M0 1 L10 5 L0 9z"/></marker>`,
  )

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${String(width)}" height="${String(height)}" viewBox="0 0 ${String(width)} ${String(height)}" role="img" aria-label="${escapeXml(input.label)}">`,
    `  <!-- Generated by npm run docs:generate; do not edit. -->`,
    `  <style>${STYLE_SHEET}</style>`,
    `  <defs>`,
    ...markers,
    `  </defs>`,
    `  <rect class="bg" x="0" y="0" width="${String(width)}" height="${String(height)}"/>`,
    ...legend,
    ...layerMarks,
    ...edgePaths,
    ...boxes,
    `</svg>`,
    '',
  ].join('\n')
}
