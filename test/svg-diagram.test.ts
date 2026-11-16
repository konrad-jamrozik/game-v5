import { describe, expect, test } from 'vitest'

import { checkDerivedOutputs } from '../scripts/derived-docs.ts'
import {
  isGeneratedDiagramFilePath,
  renderFamilyDiagram,
  renderFamilyDiagramFiles,
} from '../scripts/spec-docs/generator.ts'
import { computeFamilyArchitecture, renderFamilyArchitecture } from '../scripts/spec-docs/family-architecture.ts'
import { computeStackLayout, renderStackDiagram } from '../scripts/spec-docs/stack-diagram.ts'
import { computeLayers, renderSvgDiagram, type DiagramInput } from '../scripts/spec-docs/svg-diagram.ts'
import type {
  RelationshipKind,
  RelationshipRecord,
  SpecificationCorpus,
  SpecificationRecord,
} from '../scripts/spec-linter/types.ts'

function kinds(...values: RelationshipKind[]): ReadonlySet<RelationshipKind> {
  return new Set(values)
}

function specification(id: string, family: SpecificationRecord['family']): SpecificationRecord {
  const directory = family.toLowerCase()
  return { id, family, title: `Title ${id}`, owns: 'Rules.', path: `docs/specs/${directory}/${id}.md` }
}

function relationship(dependencyId: string, dependentId: string): RelationshipRecord {
  return { dependencyId, dependencyPath: '', dependentId, dependentPath: '', kind: 'references' }
}

function arrowLines(svg: string): string[] {
  return svg.split('\n').filter((line) => line.includes('class="edge ') && !line.includes(' H '))
}

function mechanicsCorpus(): SpecificationCorpus {
  return {
    specifications: [
      specification('BASE', 'Mechanics'),
      specification('MID', 'Mechanics'),
      specification('TOP', 'Mechanics'),
      specification('FOUND', 'Foundation'),
      specification('FACE', 'Guidance'),
    ],
    glossary: [],
    relationships: [
      relationship('BASE', 'MID'),
      // A duplicate of the reference above; the diagrams draw it once.
      relationship('BASE', 'MID'),
      relationship('MID', 'TOP'),
      relationship('BASE', 'TOP'),
      relationship('FOUND', 'BASE'),
      relationship('FOUND', 'MID'),
      relationship('TOP', 'FACE'),
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
      { from: 'A', to: 'B', kinds: kinds('references') },
      { from: 'A', to: 'C', kinds: kinds('references') },
      { from: 'B', to: 'C', kinds: kinds('references') },
      { from: 'C', to: 'D', kinds: kinds('references') },
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

  test('draws one references arrow per edge and a legend of only the references style', () => {
    const svg = renderSvgDiagram(input)
    const arrows = arrowLines(svg)
    expect(arrows).toHaveLength(4)
    expect(
      arrows.every((line) => line.includes('class="edge edge-references" marker-end="url(#head-references)"')),
    ).toBe(true)
    expect(svg.match(/>referenced by</g)).toHaveLength(1)
    expect(svg).not.toContain('>another family<')
  })

  test('draws no legend entry for the references style when there is no arrow', () => {
    const svg = renderSvgDiagram({ ...input, edges: [] })
    expect(arrowLines(svg)).toHaveLength(0)
    expect(svg).not.toContain('>referenced by<')
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
        kinds: kinds('references'),
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

  test('links the within and across SVG files from the overview of the family', () => {
    const diagram = renderFamilyDiagram(mechanicsCorpus(), 'Mechanics')
    expect(diagram).toBe(
      [
        '## Within the family',
        '',
        '![Mechanics family: references within the family](../../images/diagrams/mechanics-family-within.svg)',
        '',
        '## Across families',
        '',
        '![Mechanics family: relationships with other families](../../images/diagrams/mechanics-family-across.svg)',
      ].join('\n'),
    )
    expect(diagram).not.toContain('### ')
    expect(diagram).not.toContain('```mermaid')
  })

  test('renders the within and across files with layers, grouped members, and other families', () => {
    const files = renderFamilyDiagramFiles(mechanicsCorpus(), sources)
    expect([...files.keys()]).toEqual([
      'docs/images/diagrams/mechanics-family-within.svg',
      'docs/images/diagrams/mechanics-family-across.svg',
    ])
    for (const path of files.keys()) expect(isGeneratedDiagramFilePath(path)).toBe(true)
    const within = files.get('docs/images/diagrams/mechanics-family-within.svg') ?? ''
    expect(within).toContain('LAYER 3')
    expect(within).toContain('TOP — Title TOP')
    expect(within).not.toContain(' family<')
    // BASE → MID, MID → TOP, and BASE → TOP; the duplicate BASE → MID reference is drawn once.
    expect(arrowLines(within)).toHaveLength(3)
    expect(arrowLines(within).every((line) => line.includes('class="edge edge-references"'))).toBe(true)
    const across = files.get('docs/images/diagrams/mechanics-family-across.svg') ?? ''
    expect(across).toContain('>Foundation family<')
    expect(across).toContain('>Guidance family<')
    expect(across).toContain('>another family<')
    expect(across).not.toContain('LAYER')
    // BASE and MID relate to other families identically, so they share one box.
    expect(across.match(/<rect class="box"/g)).toHaveLength(2)
  })

  test('recognizes the file names of generated diagrams', () => {
    for (const fileName of [
      'specification-stack.svg',
      'family-architecture.svg',
      'references-all.svg',
      'references-game.svg',
      'references-governance.svg',
      'mechanics-family-within.svg',
      'mechanics-family-across.svg',
    ]) {
      expect(isGeneratedDiagramFilePath(`docs/images/diagrams/${fileName}`)).toBe(true)
    }
    expect(isGeneratedDiagramFilePath('docs/images/diagrams/hand-made.svg')).toBe(false)
    expect(isGeneratedDiagramFilePath('docs/images/diagrams/nested/references-all.svg')).toBe(false)
    expect(isGeneratedDiagramFilePath('docs/images/references-all.svg')).toBe(false)
  })

  test('renders files only for a family whose overview exists', () => {
    expect(renderFamilyDiagramFiles(mechanicsCorpus(), new Map()).size).toBe(0)
    const paths = [...renderFamilyDiagramFiles(mechanicsCorpus(), sources).keys()]
    expect(paths.every((path) => path.startsWith('docs/images/diagrams/mechanics-family-'))).toBe(true)
  })

  test('check mode reports a stale, a missing, and an unexpected diagram file', () => {
    const expected = renderFamilyDiagramFiles(mechanicsCorpus(), sources)
    const outputs = { expected, overviews: new Map<string, string>(), sources }
    const within = 'docs/images/diagrams/mechanics-family-within.svg'
    const across = 'docs/images/diagrams/mechanics-family-across.svg'
    expect(expected.has(within) && expected.has(across)).toBe(true)
    expect(checkDerivedOutputs(outputs, expected)).toEqual([])
    expect(checkDerivedOutputs(outputs, new Map([...expected, [within, '<svg/>']]))).toEqual([
      `${within}: generated documentation is stale; run npm run docs:generate.`,
    ])
    expect(checkDerivedOutputs(outputs, new Map([...expected].filter(([path]) => path !== across)))).toEqual([
      `${across}: generated documentation is missing; run npm run docs:generate.`,
    ])
    const extra = 'docs/images/diagrams/old-family-across.svg'
    // An unexpected file is reported alone, before any stale or missing file.
    expect(checkDerivedOutputs(outputs, new Map([...expected, [within, '<svg/>'], [extra, '<svg/>']]))).toEqual([
      `${extra}: unexpected generated documentation file; remove or relocate it.`,
    ])
  })
})

describe('specification stack diagram', () => {
  function stackCorpus(): SpecificationCorpus {
    return {
      specifications: [
        specification('CORE', 'Foundation'),
        specification('ENG', 'Foundation'),
        specification('NUM', 'Foundation'),
        specification('DOM', 'Mechanics'),
        specification('ONE', 'Mechanics'),
        specification('TWO', 'Mechanics'),
        specification('TURN', 'Mechanics'),
        specification('IMPL', 'Guidance'),
      ],
      glossary: [],
      relationships: [
        relationship('CORE', 'ENG'),
        relationship('ENG', 'DOM'),
        relationship('DOM', 'ONE'),
        relationship('DOM', 'TWO'),
        relationship('ONE', 'TWO'),
        relationship('DOM', 'TURN'),
        relationship('ONE', 'TURN'),
        relationship('TWO', 'TURN'),
        relationship('ENG', 'IMPL'),
      ],
    }
  }

  test('gives specifications that reference each other in a cycle one layer', () => {
    const corpus = stackCorpus()
    const layout = computeStackLayout({
      ...corpus,
      relationships: [...corpus.relationships, relationship('TWO', 'ONE')],
    })
    expect(layout.bands.map((band) => [band.family, band.rows.map((row) => row.map((member) => member.id))])).toEqual([
      ['Mechanics', [['TURN'], ['ONE', 'TWO'], ['DOM']]],
      ['Foundation', [['ENG', 'NUM'], ['CORE']]],
    ])
  })

  test('orders each Family by its layers', () => {
    const layout = computeStackLayout(stackCorpus())
    expect(layout.bands.map((band) => [band.family, band.rows.map((row) => row.map((member) => member.id))])).toEqual([
      ['Mechanics', [['TURN'], ['TWO'], ['ONE'], ['DOM']]],
      ['Foundation', [['ENG', 'NUM'], ['CORE']]],
    ])
    expect(layout.foundationIndependent).toBe(true)
    expect(layout.besideFamilies).toEqual(['Guidance'])
  })

  test('renders every layer and the layer captions', () => {
    const svg = renderStackDiagram(stackCorpus())
    expect(svg).toContain('LAYER 4')
    expect(svg).toContain(
      'Mechanics, from its top layer to its bottom layer: Title TURN; Title TWO; Title ONE; Title DOM',
    )
    expect(svg).toContain('Foundation, from its top layer to its bottom layer: Title ENG, Title NUM; Title CORE')
    expect(svg).toContain('No Foundation specification depends on a Mechanics specification.')
    expect(svg).toContain('Guidance specifications sit beside the stack and are not drawn.')
  })
})

describe('family architecture diagram', () => {
  const families = ['Conventions', 'Foundation', 'Mechanics', 'Content', 'UI', 'Guidance']

  function architectureCorpus(): SpecificationCorpus {
    return {
      specifications: [
        specification('ENG', 'Foundation'),
        specification('MECH', 'Mechanics'),
        specification('SCREEN', 'UI'),
        specification('IMPL', 'Guidance'),
      ],
      glossary: [],
      relationships: [
        relationship('ENG', 'MECH'),
        relationship('MECH', 'SCREEN'),
        relationship('SCREEN', 'IMPL'),
        relationship('ENG', 'IMPL'),
      ],
    }
  }

  test('derives what each Family builds on from the relationships of its specifications', () => {
    expect(computeFamilyArchitecture(architectureCorpus(), families)).toEqual([
      { family: 'Conventions', buildsOn: [] },
      { family: 'Foundation', buildsOn: [] },
      { family: 'Mechanics', buildsOn: ['Foundation'] },
      { family: 'Content', buildsOn: [] },
      { family: 'UI', buildsOn: ['Mechanics'] },
      { family: 'Guidance', buildsOn: ['Foundation', 'UI'] },
    ])
  })

  test('draws the game engine, the Families above it, and one arrow per Family it builds on', () => {
    const corpus = architectureCorpus()
    const svg = renderFamilyArchitecture(corpus, computeFamilyArchitecture(corpus, families))
    expect(svg).toContain('>Game engine<')
    expect(svg).toContain('>Guidance<')
    expect(svg).toContain('Guidance builds on Foundation and UI')
    expect(svg).toContain('Content has no specifications yet, so no relationships either.')
    expect(svg).toContain('Every specification also follows the Governance specifications, which are not drawn.')
    expect(svg.match(/class="arrow"/g)).toHaveLength(3)
  })

  test('widens the canvas so that a row of many Families fits', () => {
    const wide = ['Foundation', 'Mechanics', 'Content', 'UI', 'Autopilot AIs', 'Mandatory', 'Guidance'] as const
    const corpus: SpecificationCorpus = {
      specifications: wide.map((family, index) => specification(`S${String(index)}`, family)),
      glossary: [],
      relationships: wide.slice(2).map((_family, index) => relationship('S0', `S${String(index + 2)}`)),
    }
    const svg = renderFamilyArchitecture(corpus, computeFamilyArchitecture(corpus, [...wide]))
    const width = Number(/<svg [^>]*width="(\d+)"/.exec(svg)?.[1])
    const boxes = [...svg.matchAll(/<rect class="box" x="([\d.]+)" y="[\d.]+" width="(\d+)"/g)].map((match) => ({
      left: Number(match[1]),
      right: Number(match[1]) + Number(match[2]),
    }))
    expect(boxes).toHaveLength(5)
    expect(Math.max(...boxes.map((box) => box.right))).toBeLessThan(width)
    expect(Math.min(...boxes.map((box) => box.left))).toBeGreaterThan(0)
  })
})
