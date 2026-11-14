import { resolve } from 'node:path'

import { describe, expect, test } from 'vitest'

import { runDerivedDocumentation, type DerivedDocsIO } from '../scripts/derived-docs.ts'
import { collectMarkdownFiles } from '../scripts/lint-specs.ts'
import {
  isGeneratedDiagramFilePath,
  renderDerivedDiagramFiles,
  renderDerivedDocumentation,
  renderFamilyDiagram,
  renderFamilyDiagramFiles,
} from '../scripts/spec-docs/generator.ts'
import { computeLayers, renderSvgDiagram, type DiagramInput } from '../scripts/spec-docs/svg-diagram.ts'
import { analyzeSpecifications } from '../scripts/spec-linter/linter.ts'
import type {
  RelationshipKind,
  RelationshipRecord,
  SpecificationCorpus,
  SpecificationRecord,
} from '../scripts/spec-linter/types.ts'

const PRETTIER_OPTIONS = { printWidth: 120, singleQuote: true, semi: false, tabWidth: 2 }

function kinds(...values: RelationshipKind[]): ReadonlySet<RelationshipKind> {
  return new Set(values)
}

function specification(id: string, family: SpecificationRecord['family']): SpecificationRecord {
  const directory = family.toLowerCase()
  return { id, family, title: `Title ${id}`, status: 'Stub', owns: 'Rules.', path: `docs/specs/${directory}/${id}.md` }
}

function relationship(dependencyId: string, dependentId: string, kind: RelationshipKind): RelationshipRecord {
  return {
    dependencyId,
    dependencyPath: '',
    dependentId,
    dependentPath: '',
    kind,
    origin: 'explicit',
    sourcePaths: [],
  }
}

function mechanicsCorpus(): SpecificationCorpus {
  return {
    specifications: [
      specification('BASE', 'Mechanics'),
      specification('MID', 'Mechanics'),
      specification('TOP', 'Mechanics'),
      specification('FOUND', 'Foundation'),
      specification('FACE', 'Implementation'),
    ],
    glossary: [],
    relationships: [
      relationship('BASE', 'MID', 'uses'),
      relationship('BASE', 'MID', 'refines'),
      relationship('MID', 'TOP', 'uses'),
      relationship('BASE', 'TOP', 'refines'),
      relationship('FOUND', 'BASE', 'refines'),
      relationship('FOUND', 'MID', 'refines'),
      relationship('TOP', 'FACE', 'uses'),
    ],
  }
}

describe('diagram layers', () => {
  test('places a document one layer after the latest document it depends on', () => {
    const layers = computeLayers(
      ['A', 'B', 'C', 'D'],
      [
        { from: 'A', to: 'B' },
        { from: 'B', to: 'C' },
        { from: 'A', to: 'C' },
      ],
    )
    expect(Object.fromEntries(layers)).toEqual({ A: 1, B: 2, C: 3, D: 1 })
  })

  test('gives the documents of a dependency loop one shared layer', () => {
    const layers = computeLayers(
      ['A', 'B', 'C', 'D'],
      [
        { from: 'A', to: 'B' },
        { from: 'B', to: 'C' },
        { from: 'C', to: 'B' },
        { from: 'C', to: 'D' },
      ],
    )
    expect(Object.fromEntries(layers)).toEqual({ A: 1, B: 2, C: 2, D: 3 })
  })

  test('ignores self-references and relationships with unknown documents', () => {
    const layers = computeLayers(
      ['A', 'B'],
      [
        { from: 'A', to: 'A' },
        { from: 'X', to: 'B' },
        { from: 'A', to: 'B' },
      ],
    )
    expect(Object.fromEntries(layers)).toEqual({ A: 1, B: 2 })
  })
})

describe('SVG diagram renderer', () => {
  const input: DiagramInput = {
    label: 'Sample "diagram" & more',
    nodes: [
      { id: 'A', lines: ['A — Alpha <One>'], layer: 1 },
      { id: 'B', lines: ['B — Beta'], layer: 2 },
      { id: 'C', lines: ['C — Gamma'], layer: 3 },
      { id: 'D', lines: ['D — Delta'], layer: 3 },
    ],
    edges: [
      { from: 'A', to: 'B', kinds: kinds('uses') },
      { from: 'A', to: 'C', kinds: kinds('refines') },
      { from: 'B', to: 'C', kinds: kinds('uses', 'refines') },
      { from: 'C', to: 'D', kinds: kinds('uses') },
    ],
    showLayerLabels: true,
  }

  test('declares its size, escapes text, and labels every layer', () => {
    const svg = renderSvgDiagram(input)
    expect(svg).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="\d+" height="\d+" viewBox="0 0 \d+ \d+"/)
    expect(svg).toContain('aria-label="Sample &quot;diagram&quot; &amp; more"')
    expect(svg).toContain('A — Alpha &lt;One&gt;')
    for (const layer of ['LAYER 1', 'LAYER 2', 'LAYER 3']) expect(svg).toContain(layer)
    expect(svg.endsWith('</svg>\n')).toBe(true)
  })

  test('draws one arrow per relationship pair in the style of its kinds and lists only used styles', () => {
    const svg = renderSvgDiagram(input)
    const arrows = svg.split('\n').filter((line) => line.includes('class="edge ') && !line.includes(' H '))
    expect(arrows).toHaveLength(4)
    expect(arrows.filter((line) => line.includes('edge-uses'))).toHaveLength(2)
    expect(arrows.filter((line) => line.includes('edge-refines'))).toHaveLength(1)
    expect(arrows.filter((line) => line.includes('edge-both'))).toHaveLength(1)
    expect(svg).toContain('>refined by and used by<')
    expect(svg).not.toContain('>other relationship kinds<')
    expect(svg).not.toContain('>another family<')
  })

  test('keeps boxes of one layer apart and omits layer labels on request', () => {
    const svg = renderSvgDiagram({ ...input, showLayerLabels: false })
    expect(svg).not.toContain('LAYER')
    const boxes = [...svg.matchAll(/<rect class="box" x="([\d.-]+)" y="([\d.-]+)" width="([\d.]+)"/g)].map((match) => ({
      x: Number(match[1]),
      y: Number(match[2]),
      width: Number(match[3]),
    }))
    expect(boxes).toHaveLength(4)
    for (const [index, first] of boxes.entries()) {
      for (const second of boxes.slice(index + 1)) {
        if (first.y !== second.y) continue
        const [left, right] = first.x < second.x ? [first, second] : [second, first]
        expect(left.x + left.width).toBeLessThan(right.x)
      }
    }
  })

  test('draws a layer too wide to read as several rows under one layer label', () => {
    const wide: DiagramInput = {
      label: 'Wide',
      nodes: [
        { id: 'ROOT', lines: ['ROOT — Root'], layer: 1 },
        ...Array.from({ length: 12 }, (_, index) => ({
          id: `N${String(index).padStart(2, '0')}`,
          lines: [`N${String(index).padStart(2, '0')} — A specification with a long title`],
          layer: 2,
        })),
      ],
      edges: Array.from({ length: 12 }, (_, index) => ({
        from: 'ROOT',
        to: `N${String(index).padStart(2, '0')}`,
        kinds: kinds('uses'),
      })),
      showLayerLabels: true,
    }
    const svg = renderSvgDiagram(wide)
    const rowTops = new Set([...svg.matchAll(/<rect class="box" x="[\d.-]+" y="([\d.-]+)"/g)].map((match) => match[1]))
    expect(rowTops.size).toBeGreaterThan(2)
    expect(svg.match(/LAYER 2/g)).toHaveLength(1)
    expect(svg).not.toContain('LAYER 3')
  })

  test('produces identical output repeatedly and regardless of input order', () => {
    const reversed = { ...input, nodes: input.nodes.toReversed(), edges: input.edges.toReversed() }
    expect(renderSvgDiagram(input)).toBe(renderSvgDiagram(input))
    expect(renderSvgDiagram(reversed)).toBe(renderSvgDiagram(input))
  })
})

describe('family SVG diagrams', () => {
  const overviewPath = 'docs/specs/mechanics/about-mechanics.md'
  const sources = new Map([[overviewPath, '']])

  test('links the SVG files from the overview of a family that uses them', () => {
    const diagram = renderFamilyDiagram(mechanicsCorpus(), 'Mechanics')
    expect(diagram).toContain(
      '![Mechanics family: relationships within the family](../../images/mechanics-family-within.svg)',
    )
    expect(diagram).toContain(
      '![Mechanics family: relationships with other families](../../images/mechanics-family-across.svg)',
    )
    expect(diagram).not.toContain('```mermaid')
  })

  test('renders both files with layers, grouped members, and other families', () => {
    const files = renderFamilyDiagramFiles(mechanicsCorpus(), sources)
    expect([...files.keys()]).toEqual([
      'docs/images/mechanics-family-within.svg',
      'docs/images/mechanics-family-across.svg',
    ])
    for (const path of files.keys()) expect(isGeneratedDiagramFilePath(path)).toBe(true)
    const within = files.get('docs/images/mechanics-family-within.svg') ?? ''
    expect(within).toContain('LAYER 3')
    expect(within).toContain('TOP — Title TOP (Stub)')
    expect(within).not.toContain(' family<')
    const across = files.get('docs/images/mechanics-family-across.svg') ?? ''
    expect(across).toContain('>Foundation family<')
    expect(across).toContain('>Implementation family<')
    expect(across).toContain('>another family<')
    expect(across).not.toContain('LAYER')
    // BASE and MID relate to other families identically, so they share one box.
    expect(across.match(/<rect class="box"/g)).toHaveLength(2)
  })

  test('renders files only for a family whose overview exists', () => {
    expect(renderFamilyDiagramFiles(mechanicsCorpus(), new Map()).size).toBe(0)
    const paths = [...renderFamilyDiagramFiles(mechanicsCorpus(), sources).keys()]
    expect(paths.every((path) => path.startsWith('docs/images/mechanics-family-'))).toBe(true)
  })

  test('check mode reports a stale, a missing, and an unexpected diagram file', async () => {
    const root = process.cwd()
    const files = await collectMarkdownFiles(root, resolve(root, 'docs'))
    const analysis = analyzeSpecifications({ files })
    const derived = new Map([
      ...(await renderDerivedDocumentation(analysis.corpus, PRETTIER_OPTIONS)),
      ...renderDerivedDiagramFiles(analysis.corpus),
    ])
    const fileSources = new Map(files.map((file) => [file.path.replace(/\\/g, '/'), file.content]))
    const diagrams = renderFamilyDiagramFiles(analysis.corpus, fileSources)
    const within = 'docs/images/mechanics-family-within.svg'
    const across = 'docs/images/mechanics-family-across.svg'
    expect(diagrams.has(within) && diagrams.has(across)).toBe(true)
    const run = async (actualOutputs: ReadonlyMap<string, string>): Promise<readonly string[]> => {
      const errors: string[] = []
      const io: DerivedDocsIO = {
        actualOutputs,
        writeOutputs: () => Promise.resolve(),
        writeError: (message) => errors.push(message),
      }
      await runDerivedDocumentation(files, ['check'], io, PRETTIER_OPTIONS)
      return errors
    }
    expect(await run(new Map([...derived, ...diagrams]))).toEqual([])
    expect(await run(new Map([...derived, ...diagrams, [within, '<svg/>']]))).toEqual([
      `${within}: generated documentation is stale; run npm run docs:generate.`,
    ])
    const withoutAcross = [...diagrams].filter(([path]) => path !== across)
    expect(await run(new Map([...derived, ...withoutAcross]))).toEqual([
      `${across}: generated documentation is missing; run npm run docs:generate.`,
    ])
    const extra = 'docs/images/old-family-within.svg'
    expect(await run(new Map([...derived, ...diagrams, [extra, '<svg/>']]))).toEqual([
      `${extra}: unexpected generated documentation file; remove or relocate it.`,
    ])
  }, 60_000)
})
