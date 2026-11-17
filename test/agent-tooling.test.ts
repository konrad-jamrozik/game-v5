import { readFileSync } from 'node:fs'

import { describe, expect, test } from 'vitest'

import { artboardSources, blobId, composeArtboard, importsOf, withEmbedders } from '../scripts/export-artboards.ts'
import { plainMarkdown } from '../scripts/plain-docs.ts'

describe('plainMarkdown', () => {
  test('reduces links to their labels and images to their alt text', () => {
    expect(plainMarkdown('An [Agent](../a.md#glossary) is [In transit](b.md#x "t").')).toBe('An Agent is In transit.')
    expect(plainMarkdown('![Agents View](../../images/a.png)')).toBe('[image: Agents View]')
    expect(plainMarkdown('[`assignAgents`](c.md)')).toBe('`assignAgents`')
  })
})

describe('export-artboards', () => {
  test('reads every row of the Artboard sources table', () => {
    const sources = artboardSources(readFileSync('docs/specs/design/ui/visual-design.md', 'utf8'))
    expect(sources).toContainEqual({ image: 'agents-view.png', board: 'AgentsView.dc.html' })
    expect(new Set(sources.map((source) => source.image)).size).toBe(sources.length)
  })

  test('adds every board that embeds a named board, directly or through another', () => {
    const imports = new Map([
      ['Screen.dc.html', ['Middle.dc.html']],
      ['Middle.dc.html', ['Panel.dc.html']],
      ['Other.dc.html', []],
    ])
    expect([...withEmbedders(['Panel.dc.html'], imports)].toSorted()).toEqual([
      'Middle.dc.html',
      'Panel.dc.html',
      'Screen.dc.html',
    ])
  })

  test('inlines each <dc-import> with the imported board styles first', () => {
    const boards: Record<string, string> = {
      'Screen.dc.html':
        '<x-dc><helmet><style>.s{}</style></helmet><main><dc-import name="Panel"></dc-import></main></x-dc>',
      'Panel.dc.html': '<x-dc><helmet><style>.p{}</style></helmet><section>panel</section></x-dc>',
    }
    expect(importsOf(boards['Screen.dc.html'] ?? '')).toEqual(['Panel.dc.html'])
    expect(composeArtboard('Screen.dc.html', (name) => boards[name] ?? '')).toBe(
      '<!doctype html><html><head><meta charset="utf-8"><style>.p{}</style><style>.s{}</style></head>' +
        '<body><main><section>panel</section></main></body></html>',
    )
  })

  test('recognises the path of a canvas upload and nothing else', () => {
    expect(blobId('/_blob/2cc3fc40822d53d3e35c2181042712ec')).toBe('2cc3fc40822d53d3e35c2181042712ec')
    expect(blobId('/_blob/../secret')).toBeUndefined()
    expect(blobId('/support.js')).toBeUndefined()
  })
})
