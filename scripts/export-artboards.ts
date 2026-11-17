import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Exports Artboard images from a local copy of the Design canvas, as Visual Design › Design canvas describes.
 *
 * Usage: `npm run artboards:export -- <canvas-dir> [<image.png | Board.dc.html> ...]`
 *
 * `<canvas-dir>` holds the canvas's published files as read with the Artifact tool, i.e. `project/canvas.json` and
 * `project/<Board>.dc.html`, and in `assets/` each file uploaded to the canvas that those artboards show, named by its
 * upload id, e.g. `assets/2cc3fc40822d53d3e35c2181042712ec.png`. With no image or board named, every Artboard in the Artboard sources table is exported;
 * otherwise the named ones and every Artboard whose canvas artboard embeds one of them.
 */

export const ARTBOARD_DIRECTORY = 'docs/images/artboards'
const VISUAL_DESIGN = 'docs/specs/design/ui/visual-design.md'

export interface ArtboardSource {
  readonly image: string
  readonly board: string
}

/** The rows of the Artboard sources table in Visual Design. */
export function artboardSources(visualDesign: string): ArtboardSource[] {
  const section = visualDesign.split('## Artboard sources')[1]?.split(/\n#{1,2} /)[0] ?? ''
  return [...section.matchAll(/^\| `([^`]+\.png)`\s*\|[^|]*\|\s*`([^`]+\.dc\.html)`\s*\|/gm)].map((match) => ({
    image: match[1] ?? '',
    board: match[2] ?? '',
  }))
}

const IMPORT = /<dc-import name="([^"]+)"[^>]*>\s*<\/dc-import>/g

/** The canvas artboards that a canvas artboard embeds directly with `<dc-import>`. */
export function importsOf(html: string): string[] {
  return [...html.matchAll(IMPORT)].map((match) => `${match[1] ?? ''}.dc.html`)
}

/** The given boards, plus every board that embeds one of them, directly or through another board. */
export function withEmbedders(
  boards: Iterable<string>,
  importsByBoard: ReadonlyMap<string, readonly string[]>,
): Set<string> {
  const result = new Set(boards)
  let grew = true
  while (grew) {
    grew = false
    for (const [board, imports] of importsByBoard) {
      if (!result.has(board) && imports.some((name) => result.has(name))) {
        result.add(board)
        grew = true
      }
    }
  }
  return result
}

/** A standalone HTML document of a canvas artboard, with each `<dc-import>` replaced by the body it imports. */
export function composeArtboard(board: string, read: (board: string) => string): string {
  const heads: string[] = []
  const expand = (name: string): string => {
    const content = read(name).match(/<x-dc>([\s\S]*)<\/x-dc>/)?.[1]
    if (content === undefined) throw new Error(`${name} has no <x-dc> element`)
    // An imported board's styles come first, so the importing board's own styles win.
    heads.unshift(content.match(/<helmet>([\s\S]*?)<\/helmet>/)?.[1] ?? '')
    const body = content.replace(/<helmet>[\s\S]*?<\/helmet>/, '')
    return body.replace(IMPORT, (_, imported: string) => expand(`${imported}.dc.html`))
  }
  const body = expand(board)
  return `<!doctype html><html><head><meta charset="utf-8">${heads.join('')}</head><body>${body}</body></html>`
}

/** The frame width of each board in the canvas index `canvas.json`. */
export function boardWidths(canvasJson: string): Map<string, number> {
  const canvas: unknown = JSON.parse(canvasJson)
  const boards = typeof canvas === 'object' && canvas !== null && 'boards' in canvas ? canvas.boards : undefined
  const widths = new Map<string, number>()
  if (typeof boards !== 'object' || boards === null) return widths
  const frames: [string, unknown][] = Object.entries(boards)
  for (const [board, frame] of frames) {
    if (typeof frame === 'object' && frame !== null && 'w' in frame && typeof frame.w === 'number') {
      widths.set(board, frame.w)
    }
  }
  return widths
}

const CANVAS_ORIGIN = 'https://canvas.invalid'

/** The id of a canvas upload from its URL path `/_blob/<id>`, or undefined for any other path. */
export function blobId(path: string): string | undefined {
  return /^\/_blob\/([0-9a-f]{32})$/.exec(path)?.[1]
}

/** The local copy of a canvas upload: the file in `<canvas-dir>/assets` whose name, without its extension, is its id. */
function blobFile(canvasDirectory: string, id: string): string {
  const directory = join(canvasDirectory, 'assets')
  const name = existsSync(directory) ? readdirSync(directory).find((file) => file.split('.')[0] === id) : undefined
  if (name === undefined) {
    throw new Error(`Upload ${id} is missing; read it from the Design canvas with the Artifact tool into ${directory}`)
  }
  return join(directory, name)
}

async function main(): Promise<void> {
  const [canvasArgument, ...names] = process.argv.slice(2)
  if (!canvasArgument)
    throw new Error('Usage: npm run artboards:export -- <canvas-dir> [<image.png | Board.dc.html> ...]')
  const project = existsSync(join(canvasArgument, 'project')) ? join(canvasArgument, 'project') : canvasArgument
  const widths = boardWidths(readFileSync(join(project, 'canvas.json'), 'utf8'))
  const read = (board: string): string => {
    const path = join(project, board)
    if (!existsSync(path)) throw new Error(`${path} is missing; read it from the Design canvas with the Artifact tool`)
    return readFileSync(path, 'utf8')
  }

  const sources = artboardSources(readFileSync(VISUAL_DESIGN, 'utf8'))
  const named = names.map((name) => sources.find((source) => source.image === name || source.board === name))
  const unknown = names.filter((_, index) => named[index] === undefined)
  if (unknown.length > 0) throw new Error(`Not in the Artboard sources table: ${unknown.join(', ')}`)
  const missing = sources.filter((source) => !existsSync(join(project, source.board)))
  if (missing.length > 0) {
    throw new Error(
      `Finding the artboards that embed others needs every canvas artboard in the Artboard sources table. ` +
        `Read these from the Design canvas with the Artifact tool into ${project}: ` +
        missing.map((source) => source.board).join(', '),
    )
  }
  const importsByBoard = new Map(sources.map((source) => [source.board, importsOf(read(source.board))]))
  const boards =
    names.length === 0
      ? new Set(sources.map((source) => source.board))
      : withEmbedders(
          named.map((source) => source?.board ?? ''),
          importsByBoard,
        )

  const { chromium } = await import('playwright')
  const browser = await chromium.launch()
  try {
    for (const source of sources.filter((each) => boards.has(each.board))) {
      const width = widths.get(source.board)
      if (width === undefined) throw new Error(`${source.board} is not in canvas.json`)
      const page = await browser.newPage({ viewport: { width, height: 300 }, deviceScaleFactor: 1 })
      const html = composeArtboard(source.board, read)
      // The page is served from a stand-in origin so that the canvas's uploaded files, at `/_blob/<id>`, resolve to
      // their local copies; every other request, e.g. Google Fonts, goes to the network.
      await page.route(`${CANVAS_ORIGIN}/**`, async (route) => {
        const path = new URL(route.request().url()).pathname
        if (path === '/') return route.fulfill({ contentType: 'text/html', body: html })
        const id = blobId(path)
        if (id === undefined) return route.fulfill({ status: 404 })
        return route.fulfill({ path: blobFile(canvasArgument, id) })
      })
      await page.goto(`${CANVAS_ORIGIN}/`, { waitUntil: 'networkidle' })
      await page.evaluate(async () => {
        await document.fonts.ready
      })
      const out = resolve(ARTBOARD_DIRECTORY, source.image)
      await page.screenshot({ path: out, fullPage: true })
      const height = await page.evaluate(() => document.documentElement.scrollHeight)
      console.log(`${source.image}  ${width}x${height}  from ${source.board}`)
      await page.close()
    }
  } finally {
    await browser.close()
  }
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : undefined
if (invokedPath === fileURLToPath(import.meta.url)) {
  await main()
}
