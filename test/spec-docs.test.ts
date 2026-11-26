import { resolve } from 'node:path'

import { describe, expect, test } from 'vitest'

import { collectMarkdownFiles, readWordBudgets } from '../scripts/lint-specs.ts'
import {
  renderDerivedDiagramFiles,
  renderDerivedDocumentation,
  renderFamilyDiagram,
  renderFamilyDiagramFiles,
  renderFamilyOverviews,
} from '../scripts/spec-docs/generator.ts'
import { analyzeSpecifications } from '../scripts/spec-linter/linter.ts'
import { FAMILY_KIND } from '../scripts/spec-linter/overviews.ts'
import type { SourceFile, SpecificationCorpus } from '../scripts/spec-linter/types.ts'
import { derivedLinkFindings, derivedOutputFindings } from '../scripts/derived-docs.ts'

const FORMATTER_CONFIG = { printWidth: 120, singleQuote: true, semi: false, tabWidth: 2, proseWrap: 'never' as const }

function sampleCorpus(): SpecificationCorpus {
  return {
    specifications: [
      {
        id: 'ZZZ',
        family: 'Mechanics',
        title: 'Zulu',
        owns: 'Zulu rules.',
        path: 'docs/specs/design/mechanics/zulu.md',
      },
      {
        id: 'INDEX',
        family: 'Conventions',
        title: 'Specification Index',
        owns: 'Registration.',
        path: 'docs/specs/README.md',
      },
      {
        id: 'AAA',
        family: 'Foundation',
        title: 'Alpha "Quoted" & More',
        owns: 'Alpha rules.',
        path: 'docs/specs/design/foundation/alpha.md',
      },
      {
        id: 'CONV',
        family: 'Conventions',
        title: 'Conventions',
        owns: 'Writing conventions.',
        path: 'docs/specs/governance/conventions/spec-conventions.md',
      },
    ],
    glossary: [
      {
        term: 'Zulu term',
        definitionMarkdown: 'Last definition.',
        prohibitedSynonymsMarkdown: '',
        ownerId: 'ZZZ',
        ownerPath: 'docs/specs/design/mechanics/zulu.md',
      },
      {
        term: 'alpha term',
        definitionMarkdown:
          'Uses **strong rules** from [Conventions](../../governance/conventions/spec-conventions.md#glossary) and [Rule](#rule).',
        prohibitedSynonymsMarkdown: 'Beta term; see [Rule](#rule)',
        ownerId: 'AAA',
        ownerPath: 'docs/specs/design/foundation/alpha.md',
      },
    ],
    relationships: [
      {
        dependencyId: 'AAA',
        dependencyPath: 'docs/specs/design/foundation/alpha.md',
        dependentId: 'ZZZ',
        dependentPath: 'docs/specs/design/mechanics/zulu.md',
        kind: 'references',
      },
      // A duplicate of the reference above; every diagram draws it once.
      {
        dependencyId: 'AAA',
        dependencyPath: 'docs/specs/design/foundation/alpha.md',
        dependentId: 'ZZZ',
        dependentPath: 'docs/specs/design/mechanics/zulu.md',
        kind: 'references',
      },
      {
        dependencyId: 'ZZZ',
        dependencyPath: 'docs/specs/design/mechanics/zulu.md',
        dependentId: 'AAA',
        dependentPath: 'docs/specs/design/foundation/alpha.md',
        kind: 'references',
      },
    ],
  }
}

function arrows(svg: string, style: string): number {
  return svg.split('\n').filter((line) => line.includes(`class="edge edge-${style}"`) && !line.includes(' H ')).length
}

function outputObject(outputs: ReadonlyMap<string, string>): Readonly<Record<string, string>> {
  return Object.fromEntries(outputs)
}

async function currentFiles(): Promise<readonly SourceFile[]> {
  const root = process.cwd()
  return collectMarkdownFiles(root, resolve(root, 'docs'))
}

describe('derived specification renderer', () => {
  test('renders catalog fields, grouping, sorting, and counts', async () => {
    const outputs = await renderDerivedDocumentation(sampleCorpus(), FORMATTER_CONFIG)
    const catalog = outputs.get('docs/derived/README.md') ?? ''
    expect(catalog).toContain('| Governance         | Conventions       | 2              |')
    expect(catalog).toContain('| AAA | [Alpha "Quoted" & More](../specs/design/foundation/alpha.md) | Alpha rules. |')
    expect(catalog.indexOf('| CONV')).toBeLessThan(catalog.indexOf('| INDEX'))
    expect(catalog).not.toContain('Scope')
    expect(catalog.indexOf('## Conventions')).toBeLessThan(catalog.indexOf('## Foundation'))
  })

  test('sorts glossary terms and preserves formatted definitions with rewritten links', async () => {
    const outputs = await renderDerivedDocumentation(sampleCorpus(), FORMATTER_CONFIG)
    const glossary = outputs.get('docs/derived/glossary.md') ?? ''
    expect(glossary.indexOf('| alpha term')).toBeLessThan(glossary.indexOf('| Zulu term'))
    expect(glossary).toContain('[Conventions](../specs/governance/conventions/spec-conventions.md#glossary)')
    expect(glossary).toContain('[Rule](../specs/design/foundation/alpha.md#rule)')
    expect(glossary).toContain('[AAA — Alpha "Quoted" & More](../specs/design/foundation/alpha.md#glossary)')
  })

  test('collects the Prohibited synonyms of every term in one table', async () => {
    const outputs = await renderDerivedDocumentation(sampleCorpus(), FORMATTER_CONFIG)
    const glossary = outputs.get('docs/derived/glossary.md') ?? ''
    const section = glossary.slice(glossary.indexOf('## Prohibited synonyms'))
    expect(section).toContain('| Beta term; see [Rule](../specs/design/foundation/alpha.md#rule) | alpha term |')
    expect(section).not.toContain('Zulu term')
  })

  test('renders the references diagram in its own file and draws each duplicate reference once', async () => {
    const outputs = await renderDerivedDocumentation(sampleCorpus(), FORMATTER_CONFIG)
    expect([...outputs.keys()]).toEqual([
      'docs/derived/README.md',
      'docs/derived/glossary.md',
      'docs/derived/relationships.md',
      'docs/derived/relationships/references.md',
    ])
    const index = outputs.get('docs/derived/relationships.md') ?? ''
    const references = outputs.get('docs/derived/relationships/references.md') ?? ''
    expect(index).toContain('- [References relationships](relationships/references.md)')
    expect(index).not.toContain('No specification links another.')
    const diagrams = renderDerivedDiagramFiles(sampleCorpus())
    expect([...diagrams.keys()]).toEqual([
      'docs/images/diagrams/specification-stack.svg',
      'docs/images/diagrams/references-all.svg',
    ])
    const referencesDiagram = diagrams.get('docs/images/diagrams/references-all.svg') ?? ''
    expect(references).toContain('A → B means A is referenced by B: the text of B links to A.')
    expect(references).toContain('![References relationships](../../images/diagrams/references-all.svg)')
    expect(referencesDiagram).toContain('AAA — Alpha &quot;Quoted&quot; &amp; More')
    expect(referencesDiagram).toContain('>referenced by<')
    // AAA and ZZZ reference each other, so they share a layer; the duplicate AAA → ZZZ reference is drawn once.
    expect(arrows(referencesDiagram, 'references')).toBe(2)
    expect(referencesDiagram).not.toContain('LAYER 2')
    expect([...diagrams.values()].join('\n')).not.toContain('CONV')
    expect([...outputs.values()].join('\n')).not.toContain('```mermaid')
    expect(references).not.toContain('## ')
    // The same references as text: each specification with its layer and what it references.
    expect(references).toMatch(/^\| Layer +\| Specification +\| References +\|$/m)
    expect(references).toMatch(/^\| 1 +\| AAA .*\| ZZZ +\|$/m)
  })

  test('notes in the index that no specification links another when there are no references', async () => {
    const corpus: SpecificationCorpus = { ...sampleCorpus(), relationships: [] }
    const outputs = await renderDerivedDocumentation(corpus, FORMATTER_CONFIG)
    const index = outputs.get('docs/derived/relationships.md') ?? ''
    expect(index).toContain('- References: No specification links another.')
    expect(outputs.has('docs/derived/relationships/references.md')).toBe(false)
    expect([...renderDerivedDiagramFiles(corpus).keys()]).toEqual(['docs/images/diagrams/specification-stack.svg'])
  })

  test('renders every reference in one diagram when none stays within the governance specifications', async () => {
    const corpus = sampleCorpus()
    const engineCorpus: SpecificationCorpus = {
      ...corpus,
      specifications: [
        ...corpus.specifications,
        {
          id: 'ENG',
          family: 'Foundation',
          title: 'Engine Contract',
          owns: 'Engine behavior.',
          path: 'docs/specs/design/foundation/engine-contract.md',
        },
      ],
      relationships: [
        ...corpus.relationships,
        {
          dependencyId: 'ENG',
          dependencyPath: 'docs/specs/design/foundation/engine-contract.md',
          dependentId: 'CONV',
          dependentPath: 'docs/specs/governance/conventions/spec-conventions.md',
          kind: 'references',
        },
      ],
    }
    const outputs = await renderDerivedDocumentation(engineCorpus, FORMATTER_CONFIG)
    const diagrams = renderDerivedDiagramFiles(engineCorpus)
    const references = outputs.get('docs/derived/relationships/references.md') ?? ''
    expect(references).not.toContain('## ')
    expect(references.match(/!\[References relationships/g)).toHaveLength(1)
    expect(references).toContain('(../../images/diagrams/references-all.svg)')
    const all = diagrams.get('docs/images/diagrams/references-all.svg') ?? ''
    expect(all).toContain('ZZZ — Zulu')
    expect(all).toContain('ENG — Engine Contract')
    expect(all).toContain('CONV — Conventions')
    expect(diagrams.has('docs/images/diagrams/references-game.svg')).toBe(false)
    expect(diagrams.has('docs/images/diagrams/references-governance.svg')).toBe(false)
  })

  test('isolates references among governance specifications from the game references', async () => {
    const corpus = sampleCorpus()
    const governanceCorpus: SpecificationCorpus = {
      ...corpus,
      specifications: [
        ...corpus.specifications,
        {
          id: 'DOM',
          family: 'Foundation',
          title: 'Domain Model',
          owns: 'Shared domain.',
          path: 'docs/specs/design/foundation/domain-model.md',
        },
        {
          id: 'REL',
          family: 'Conventions',
          title: 'Artifact Relationships',
          owns: 'Relationship rules.',
          path: 'docs/specs/governance/conventions/artifact-relationships.md',
        },
      ],
      relationships: [
        ...corpus.relationships,
        {
          dependencyId: 'DOM',
          dependencyPath: 'docs/specs/design/foundation/domain-model.md',
          dependentId: 'AAA',
          dependentPath: 'docs/specs/design/foundation/alpha.md',
          kind: 'references',
        },
        {
          dependencyId: 'REL',
          dependencyPath: 'docs/specs/governance/conventions/artifact-relationships.md',
          dependentId: 'CONV',
          dependentPath: 'docs/specs/governance/conventions/spec-conventions.md',
          kind: 'references',
        },
      ],
    }
    const outputs = await renderDerivedDocumentation(governanceCorpus, FORMATTER_CONFIG)
    const diagrams = renderDerivedDiagramFiles(governanceCorpus)
    expect([...diagrams.keys()]).toEqual([
      'docs/images/diagrams/specification-stack.svg',
      'docs/images/diagrams/references-game.svg',
      'docs/images/diagrams/references-governance.svg',
    ])
    const references = outputs.get('docs/derived/relationships/references.md') ?? ''
    const gameStart = references.indexOf('## Game specifications')
    const governanceStart = references.indexOf('## Governance specifications')
    expect(gameStart).toBeGreaterThan(-1)
    expect(gameStart).toBeLessThan(governanceStart)
    expect(
      references.indexOf('![References relationships: Game specifications](../../images/diagrams/references-game.svg)'),
    ).toBeGreaterThan(gameStart)
    expect(references.indexOf('(../../images/diagrams/references-game.svg)')).toBeLessThan(governanceStart)
    expect(
      references.indexOf(
        '![References relationships: Governance specifications](../../images/diagrams/references-governance.svg)',
      ),
    ).toBeGreaterThan(governanceStart)
    const game = diagrams.get('docs/images/diagrams/references-game.svg') ?? ''
    const governance = diagrams.get('docs/images/diagrams/references-governance.svg') ?? ''
    expect(game).toContain('DOM — Domain Model')
    expect(game).not.toContain('REL — ')
    expect(game).not.toContain('CONV — ')
    expect(governance).toContain('REL — Artifact Relationships')
    expect(governance).toContain('CONV — Conventions')
    expect(governance).not.toContain('DOM — ')
  })

  test('produces identical output repeatedly', async () => {
    const first = await renderDerivedDocumentation(sampleCorpus(), FORMATTER_CONFIG)
    const second = await renderDerivedDocumentation(sampleCorpus(), FORMATTER_CONFIG)
    expect(outputObject(second)).toEqual(outputObject(first))
  })
})

describe('family overview diagrams', () => {
  const overview = [
    '# About the Foundation family',
    '',
    '# How they relate',
    '',
    'Prose.',
    '',
    '<!-- generated:family-diagram:start -->',
    'stale content',
    '<!-- generated:family-diagram:end -->',
    '',
    '# Why these boundaries',
    '',
    'Reasons.',
    '',
  ].join('\n')

  const foundationOverview = 'docs/specs/design/foundation/about-foundation.md'
  const withinPath = 'docs/images/diagrams/foundation-family-within.svg'
  const acrossPath = 'docs/images/diagrams/foundation-family-across.svg'

  function withBeta(reference: boolean): SpecificationCorpus {
    const corpus = sampleCorpus()
    return {
      ...corpus,
      specifications: [
        ...corpus.specifications,
        {
          id: 'BBB',
          family: 'Foundation',
          title: 'Beta',
          owns: 'Beta rules.',
          path: 'docs/specs/design/foundation/beta.md',
        },
      ],
      relationships: reference
        ? [
            ...corpus.relationships,
            {
              dependencyId: 'AAA',
              dependencyPath: 'docs/specs/design/foundation/alpha.md',
              dependentId: 'BBB',
              dependentPath: 'docs/specs/design/foundation/beta.md',
              kind: 'references',
            },
          ]
        : corpus.relationships,
    }
  }

  test('collapses other Families into one box per side and draws each duplicate reference once', () => {
    const diagram = renderFamilyDiagram(sampleCorpus(), 'Foundation')
    expect(diagram).toBe(
      [
        '## Within the family',
        '',
        'This family has a single specification, so there are no references within it.',
        '',
        '## Across families',
        '',
        '![Foundation family: relationships with other families](../../../images/diagrams/foundation-family-across.svg)',
      ].join('\n'),
    )
    const files = renderFamilyDiagramFiles(sampleCorpus(), new Map([[foundationOverview, overview]]))
    expect([...files.keys()]).toEqual([acrossPath])
    const across = files.get(acrossPath) ?? ''
    // The Mechanics family both references and is referenced by AAA, so it is drawn on both sides.
    expect(across.match(/>Mechanics family</g)).toHaveLength(2)
    // One arrow to the Mechanics family and one from it, although AAA → ZZZ is listed twice.
    expect(arrows(across, 'references')).toBe(2)
    expect(across).toContain('AAA — Alpha &quot;Quoted&quot; &amp; More')
    expect(across).not.toContain('CONV')
    expect(across).not.toContain('Conventions family')
  })

  test('renders the references within a Family in one diagram, separately from those across Families', () => {
    const corpus = withBeta(true)
    expect(renderFamilyDiagram(corpus, 'Foundation')).toContain(
      [
        '## Within the family',
        '',
        '![Foundation family: references within the family](../../../images/diagrams/foundation-family-within.svg)',
        '',
        '## Across families',
      ].join('\n'),
    )
    const files = renderFamilyDiagramFiles(corpus, new Map([[foundationOverview, overview]]))
    expect([...files.keys()]).toEqual([withinPath, acrossPath])
    const within = files.get(withinPath) ?? ''
    expect(within).toContain('aria-label="Foundation family: references within the family"')
    expect(within).toContain('AAA — ')
    expect(within).toContain('BBB — Beta')
    expect(within).toContain('LAYER 2')
    expect(arrows(within, 'references')).toBe(1)
    expect(within).not.toContain('Mechanics family')
    const across = files.get(acrossPath) ?? ''
    expect(across).toContain('>Mechanics family<')
    expect(across).not.toContain('BBB')
  })

  test('renders no within diagram for a Family whose specifications do not reference each other', () => {
    const corpus = withBeta(false)
    expect(renderFamilyDiagram(corpus, 'Foundation')).toContain(
      ['## Within the family', '', 'No specification of this family links another specification of it.'].join('\n'),
    )
    const files = renderFamilyDiagramFiles(corpus, new Map([[foundationOverview, overview]]))
    expect([...files.keys()]).toEqual([acrossPath])
  })

  test('replaces only the marked block and is idempotent', async () => {
    const sources = new Map([['docs/specs/design/foundation/about-foundation.md', overview]])
    const first = await renderFamilyOverviews(sampleCorpus(), sources, FORMATTER_CONFIG)
    const output = first.get('docs/specs/design/foundation/about-foundation.md') ?? ''
    expect(output).not.toContain('stale content')
    expect(output).toContain('Prose.')
    expect(output).toContain('Reasons.')
    expect(output).toContain('(../../../images/diagrams/foundation-family-across.svg)')
    expect(output).not.toContain('```mermaid')
    expect(first.has('docs/specs/design/mechanics/about-mechanics.md')).toBe(false)
    const second = await renderFamilyOverviews(
      sampleCorpus(),
      new Map([['docs/specs/design/foundation/about-foundation.md', output]]),
      FORMATTER_CONFIG,
    )
    expect(second.get('docs/specs/design/foundation/about-foundation.md')).toBe(output)
  })
})

describe('shared specification analysis', () => {
  test('derives one sorted references relationship per linking pair and none from game to governance', async () => {
    const analysis = analyzeSpecifications({
      files: await currentFiles(),
      wordBudgets: await readWordBudgets(process.cwd()),
    })
    expect(analysis.diagnostics).toEqual([])
    const { relationships, specifications } = analysis.corpus
    expect(relationships.length).toBeGreaterThan(0)
    expect(relationships.every((relationship) => relationship.kind === 'references')).toBe(true)
    expect(relationships.every((relationship) => relationship.dependencyId !== relationship.dependentId)).toBe(true)
    const keys = relationships.map((relationship) => [relationship.dependencyId, relationship.dependentId].join('\0'))
    expect(new Set(keys).size).toBe(relationships.length)
    expect(keys).toEqual(keys.toSorted((left, right) => (left < right ? -1 : left > right ? 1 : 0)))
    const byId = new Map(specifications.map((specification) => [specification.id, specification]))
    for (const relationship of relationships) {
      expect(byId.get(relationship.dependencyId)?.path).toBe(relationship.dependencyPath)
      expect(byId.get(relationship.dependentId)?.path).toBe(relationship.dependentPath)
    }
    // Specifications outside Governance follow the Governance conventions without linking their terms.
    const kindOf = (id: string): string | undefined => {
      const specification = byId.get(id)
      return specification ? FAMILY_KIND[specification.family] : undefined
    }
    expect(
      relationships.filter(
        (relationship) =>
          kindOf(relationship.dependencyId) === 'Governance' && kindOf(relationship.dependentId) !== 'Governance',
      ),
    ).toEqual([])
    // It analyses every specification, which takes several seconds when the machine is busy.
  }, 60_000)
})

describe('derived documentation checking', () => {
  test('reports missing, stale, and unexpected files while accepting CRLF', () => {
    const expected = new Map<string, string>([
      ['docs/derived/README.md', 'docs/derived/README.md\n'],
      ['docs/derived/glossary.md', 'docs/derived/glossary.md\n'],
      ['docs/derived/relationships.md', 'docs/derived/relationships.md\n'],
      ['docs/derived/relationships/references.md', 'docs/derived/relationships/references.md\n'],
    ])
    const actual = new Map<string, string>([
      ['docs/derived/README.md', 'docs/derived/README.md\r\n'],
      ['docs/derived/glossary.md', 'stale\n'],
      ['docs/derived/extra.md', 'unexpected\n'],
    ])
    expect(derivedOutputFindings(expected, actual)).toEqual([
      'docs/derived/extra.md: unexpected generated documentation file; remove or relocate it.',
      'docs/derived/glossary.md: generated documentation is stale; run npm run docs:generate.',
      'docs/derived/relationships.md: generated documentation is missing; run npm run docs:generate.',
      'docs/derived/relationships/references.md: generated documentation is missing; run npm run docs:generate.',
    ])
  })

  test('reports broken generated destinations and anchors', () => {
    const outputs = new Map<string, string>([
      ['docs/derived/README.md', '# Derived\n\n[Missing file](missing.md) and [missing anchor](glossary.md#absent).\n'],
      ['docs/derived/glossary.md', '# Glossary\n'],
      ['docs/derived/relationships.md', '# Relationships\n'],
    ])
    const findings = derivedLinkFindings([], outputs)
    expect(findings.some((finding) => finding.includes('destination "docs/derived/missing.md" does not exist'))).toBe(
      true,
    )
    expect(findings.some((finding) => finding.includes('anchor "#absent" does not exist'))).toBe(true)
  })
})
