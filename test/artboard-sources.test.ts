import { readdirSync, readFileSync } from 'node:fs'
import { posix } from 'node:path'

import { describe, expect, test } from 'vitest'

const ARTBOARD_DIRECTORY = 'docs/images/artboards'
const VISUAL_DESIGN = 'docs/specs/design/ui/visual-design.md'
const UI_DIRECTORY = 'docs/specs/design/ui'

/** The Image column of the Artboard sources table in Visual Design, as file names. */
function tableImages(): readonly string[] {
  const content = readFileSync(VISUAL_DESIGN, 'utf8')
  const section = content.split('## Artboard sources')[1]?.split(/\n#{1,2} /)[0] ?? ''
  return [...section.matchAll(/^\| `([^`]+\.png)`\s*\|/gm)].map((match) => match[1] ?? '')
}

/** Every Artboard image embedded by a UI specification, as file names. */
function embeddedImages(): readonly string[] {
  const images: string[] = []
  for (const entry of readdirSync(UI_DIRECTORY, { recursive: true, encoding: 'utf8' })) {
    if (!entry.endsWith('.md')) continue
    const path = posix.join(UI_DIRECTORY, entry.replace(/\\/g, '/'))
    for (const match of readFileSync(path, 'utf8').matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
      const target = posix.normalize(posix.join(posix.dirname(path), match[1] ?? ''))
      if (target.startsWith(`${ARTBOARD_DIRECTORY}/`)) images.push(posix.basename(target))
    }
  }
  return images
}

describe('Artboard sources', () => {
  const files = readdirSync(ARTBOARD_DIRECTORY).filter((name) => name.endsWith('.png'))

  test('the Artboard sources table lists every Artboard image exactly once', () => {
    expect(tableImages().toSorted()).toEqual(files.toSorted())
  })

  test('every Artboard image is embedded by exactly one UI specification, and every embed resolves', () => {
    expect(embeddedImages().toSorted()).toEqual(files.toSorted())
  })
})
