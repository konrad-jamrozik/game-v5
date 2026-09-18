import { resolve } from 'node:path'

import GithubSlugger from 'github-slugger'
import { describe, expect, test } from 'vitest'

import { collectMarkdownFiles } from '../scripts/lint-specs.ts'
import { renderDerivedDocumentation } from '../scripts/spec-docs/generator.ts'
import { analyzeSpecifications } from '../scripts/spec-linter/linter.ts'
import { headingText, isLink, parseDocument, visit } from '../scripts/spec-linter/markdown.ts'
import { decodeUrlPart, isExternalUrl, resolvePath, splitUrl } from '../scripts/spec-linter/paths.ts'
import type { SourceFile, SpecificationCorpus } from '../scripts/spec-linter/types.ts'
import {
  derivedLinkFindings,
  derivedOutputFindings,
  runDerivedDocumentation,
  type DerivedDocsIO,
} from '../scripts/derived-docs.ts'

const PRETTIER_OPTIONS = { printWidth: 120, singleQuote: true, semi: false, tabWidth: 2 }

function sampleCorpus(): SpecificationCorpus {
  return {
    specifications: [
      {
        id: 'ZZZ',
        family: 'Mechanics',
        title: 'Zulu',
        status: 'Stub',
        scope: 'Zulu scope',
        owns: 'Zulu rules.',
        path: 'docs/specs/mechanics/zulu.md',
      },
      {
        id: 'INDEX',
        family: 'Governance',
        title: 'Specification Index',
        status: 'Draft',
        scope: 'Navigation',
        owns: 'Registration.',
        path: 'docs/specs/README.md',
      },
      {
        id: 'AAA',
        family: 'Foundation',
        title: 'Alpha "Quoted" & More',
        status: 'Draft',
        scope: 'Alpha scope',
        owns: 'Alpha rules.',
        path: 'docs/specs/foundation/alpha.md',
      },
      {
        id: 'CONV',
        family: 'Governance',
        title: 'Conventions',
        status: 'Accepted',
        scope: 'Writing rules',
        owns: 'Writing conventions.',
        path: 'docs/specs/governance/spec-conventions.md',
      },
    ],
    glossary: [
      {
        term: 'Zulu term',
        definitionMarkdown: 'Last definition.',
        ownerId: 'ZZZ',
        ownerPath: 'docs/specs/mechanics/zulu.md',
        ownerStatus: 'Stub',
      },
      {
        term: 'alpha term',
        definitionMarkdown: 'Uses **strong rules** from [Conventions](../governance/spec-conventions.md#glossary).',
        ownerId: 'AAA',
        ownerPath: 'docs/specs/foundation/alpha.md',
        ownerStatus: 'Draft',
      },
    ],
    relationships: [
      {
        dependencyId: 'CONV',
        dependencyPath: 'docs/specs/governance/spec-conventions.md',
        dependentId: 'AAA',
        dependentPath: 'docs/specs/foundation/alpha.md',
        kind: 'follows',
        origin: 'implicit',
        sourcePaths: ['docs/specs/governance/spec-conventions.md'],
      },
      {
        dependencyId: 'AAA',
        dependencyPath: 'docs/specs/foundation/alpha.md',
        dependentId: 'ZZZ',
        dependentPath: 'docs/specs/mechanics/zulu.md',
        kind: 'uses',
        origin: 'explicit',
        sourcePaths: ['docs/specs/foundation/alpha.md', 'docs/specs/mechanics/zulu.md'],
      },
      {
        dependencyId: 'AAA',
        dependencyPath: 'docs/specs/foundation/alpha.md',
        dependentId: 'ZZZ',
        dependentPath: 'docs/specs/mechanics/zulu.md',
        kind: 'refines',
        origin: 'explicit',
        sourcePaths: ['docs/specs/foundation/alpha.md', 'docs/specs/mechanics/zulu.md'],
      },
      {
        dependencyId: 'ZZZ',
        dependencyPath: 'docs/specs/mechanics/zulu.md',
        dependentId: 'AAA',
        dependentPath: 'docs/specs/foundation/alpha.md',
        kind: 'uses',
        origin: 'explicit',
        sourcePaths: ['docs/specs/mechanics/zulu.md', 'docs/specs/foundation/alpha.md'],
      },
    ],
  }
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
    const outputs = await renderDerivedDocumentation(sampleCorpus(), PRETTIER_OPTIONS)
    const catalog = outputs.get('docs/derived/README.md') ?? ''
    expect(catalog).toContain('| Accepted   | 1              |')
    expect(catalog).toContain('| Governance | 2              |')
    expect(catalog).toContain(
      '| AAA | [Alpha "Quoted" & More](../specs/foundation/alpha.md) | Draft  | Alpha scope | Alpha rules. |',
    )
    expect(catalog.indexOf('| CONV')).toBeLessThan(catalog.indexOf('| INDEX'))
    expect(catalog.indexOf('## Governance')).toBeLessThan(catalog.indexOf('## Foundation'))
  })

  test('sorts glossary terms and preserves formatted definitions with rewritten links', async () => {
    const outputs = await renderDerivedDocumentation(sampleCorpus(), PRETTIER_OPTIONS)
    const glossary = outputs.get('docs/derived/glossary.md') ?? ''
    expect(glossary.indexOf('| alpha term')).toBeLessThan(glossary.indexOf('| Zulu term'))
    expect(glossary).toContain(
      'Uses **strong rules** from [Conventions](../specs/governance/spec-conventions.md#glossary).',
    )
    expect(glossary).toContain('[AAA — Alpha "Quoted" & More](../specs/foundation/alpha.md#glossary)')
  })

  test('renders each explicit relationship-kind diagram in its own file and omits implicit follows', async () => {
    const outputs = await renderDerivedDocumentation(sampleCorpus(), PRETTIER_OPTIONS)
    const index = outputs.get('docs/derived/relationships.md') ?? ''
    const refines = outputs.get('docs/derived/relationships/refines.md') ?? ''
    const uses = outputs.get('docs/derived/relationships/uses.md') ?? ''
    expect(index).toContain('[Refines relationships](relationships/refines.md)')
    expect(index).toContain('implicit `follows` relationship')
    expect(outputs.has('docs/derived/relationships/follows.md')).toBe(false)
    expect(refines).toContain('AAA — Alpha &quot;Quoted&quot; &amp; More (Draft)')
    expect(refines).toContain('A → B means A is refined by B.')
    expect(refines).toContain('AAA --> ZZZ')
    expect(uses).toContain('A → B means A is used by B.')
    expect(uses).toContain('AAA --> ZZZ')
    expect(uses).toContain('ZZZ --> AAA')
    expect([...outputs.values()].join('\n')).not.toContain('CONV --> AAA')
    expect(refines).not.toContain('REL-')
    expect(refines).not.toContain('-->|')
    expect(refines).not.toMatch(/^\|/m)
    expect(refines).not.toContain('Explicit relationship overview')
    expect(refines).not.toContain('Shared state')
    expect(index).toContain('Implements: No explicit implements relationships are declared.')
    expect(index).toContain('Verifies: No explicit verifies relationships are declared.')
    expect(outputs.has('docs/derived/relationships/implements.md')).toBe(false)
    expect(outputs.has('docs/derived/relationships/verifies.md')).toBe(false)
  })

  test('renders the Engine Contract refinement subtree as a separate diagram', async () => {
    const corpus = sampleCorpus()
    const outputs = await renderDerivedDocumentation(
      {
        ...corpus,
        specifications: [
          ...corpus.specifications,
          {
            id: 'ENG',
            family: 'Foundation',
            title: 'Engine Contract',
            status: 'Draft',
            scope: 'Engine behavior',
            owns: 'Engine behavior.',
            path: 'docs/specs/foundation/engine-contract.md',
          },
        ],
        relationships: [
          ...corpus.relationships,
          {
            dependencyId: 'ENG',
            dependencyPath: 'docs/specs/foundation/engine-contract.md',
            dependentId: 'CONV',
            dependentPath: 'docs/specs/governance/spec-conventions.md',
            kind: 'refines',
            origin: 'explicit',
            sourcePaths: ['docs/specs/foundation/engine-contract.md', 'docs/specs/governance/spec-conventions.md'],
          },
        ],
      },
      PRETTIER_OPTIONS,
    )
    const refines = outputs.get('docs/derived/relationships/refines.md') ?? ''
    expect(refines).toContain('## Model and gameplay specifications')
    expect(refines).toContain('## Engine contract')
    expect(refines.match(/```mermaid/g)).toHaveLength(2)
    expect(refines.indexOf('AAA --> ZZZ')).toBeLessThan(refines.indexOf('## Engine contract'))
    expect(refines.indexOf('ENG --> CONV')).toBeGreaterThan(refines.indexOf('## Engine contract'))
  })

  test('isolates relationship governance and renders the main uses graph top-down with Domain Model first', async () => {
    const corpus = sampleCorpus()
    const outputs = await renderDerivedDocumentation(
      {
        ...corpus,
        specifications: [
          ...corpus.specifications,
          {
            id: 'DOM',
            family: 'Foundation',
            title: 'Domain Model',
            status: 'Draft',
            scope: 'Shared domain',
            owns: 'Shared domain.',
            path: 'docs/specs/foundation/domain-model.md',
          },
          {
            id: 'REL',
            family: 'Governance',
            title: 'Artifact Relationships',
            status: 'Draft',
            scope: 'Relationship rules',
            owns: 'Relationship rules.',
            path: 'docs/specs/governance/artifact-relationships.md',
          },
        ],
        relationships: [
          ...corpus.relationships,
          {
            dependencyId: 'DOM',
            dependencyPath: 'docs/specs/foundation/domain-model.md',
            dependentId: 'AAA',
            dependentPath: 'docs/specs/foundation/alpha.md',
            kind: 'uses',
            origin: 'explicit',
            sourcePaths: ['docs/specs/foundation/domain-model.md', 'docs/specs/foundation/alpha.md'],
          },
          {
            dependencyId: 'REL',
            dependencyPath: 'docs/specs/governance/artifact-relationships.md',
            dependentId: 'CONV',
            dependentPath: 'docs/specs/governance/spec-conventions.md',
            kind: 'uses',
            origin: 'explicit',
            sourcePaths: [
              'docs/specs/governance/artifact-relationships.md',
              'docs/specs/governance/spec-conventions.md',
            ],
          },
        ],
      },
      PRETTIER_OPTIONS,
    )
    const uses = outputs.get('docs/derived/relationships/uses.md') ?? ''
    const governanceStart = uses.indexOf('## Relationship governance')
    expect(uses).toContain('## Game specifications\n\n```mermaid\nflowchart TD\n  DOM[')
    expect(uses.match(/```mermaid/g)).toHaveLength(2)
    expect(uses.indexOf('DOM --> AAA')).toBeLessThan(governanceStart)
    expect(uses.indexOf('REL --> CONV')).toBeGreaterThan(governanceStart)
    expect(uses.slice(governanceStart)).not.toContain('DOM --> AAA')
  })

  test('produces identical output repeatedly', async () => {
    const first = await renderDerivedDocumentation(sampleCorpus(), PRETTIER_OPTIONS)
    const second = await renderDerivedDocumentation(sampleCorpus(), PRETTIER_OPTIONS)
    expect(outputObject(second)).toEqual(outputObject(first))
  })
})

describe('shared specification analysis', () => {
  test('deduplicates mirrored relationships and materializes implicit follows relationships', async () => {
    const analysis = analyzeSpecifications({ files: await currentFiles() })
    expect(analysis.diagnostics).toEqual([])
    const explicit = analysis.corpus.relationships.filter((relationship) => relationship.origin === 'explicit')
    const keys = explicit.map((relationship) =>
      [relationship.dependencyId, relationship.dependentId, relationship.kind].join('\0'),
    )
    expect(new Set(keys).size).toBe(explicit.length)
    expect(
      explicit.filter(
        (relationship) =>
          relationship.dependencyId === 'REL' && relationship.dependentId === 'CONV' && relationship.kind === 'uses',
      ),
    ).toHaveLength(1)
    const implicit = analysis.corpus.relationships.filter((relationship) => relationship.origin === 'implicit')
    expect(implicit).toHaveLength(analysis.corpus.specifications.length - 1)
    expect(implicit.every((relationship) => relationship.dependencyId === 'CONV')).toBe(true)
    expect(implicit.some((relationship) => relationship.dependentId === 'CONV')).toBe(false)
  })

  test('is independent of input ordering and line endings', async () => {
    const files = await currentFiles()
    const baseline = analyzeSpecifications({ files })
    const reversed = analyzeSpecifications({ files: files.toReversed() })
    const crlf = analyzeSpecifications({
      files: files.map((file) => ({ ...file, content: file.content.replace(/\r?\n/g, '\r\n') })),
    })
    expect(reversed).toEqual(baseline)
    expect(crlf).toEqual(baseline)
    expect(outputObject(await renderDerivedDocumentation(reversed.corpus, PRETTIER_OPTIONS))).toEqual(
      outputObject(await renderDerivedDocumentation(baseline.corpus, PRETTIER_OPTIONS)),
    )
  })
})

describe('derived documentation checking', () => {
  test('reports missing, stale, and unexpected files while accepting CRLF', () => {
    const expected = new Map<string, string>([
      ['docs/derived/README.md', 'docs/derived/README.md\n'],
      ['docs/derived/glossary.md', 'docs/derived/glossary.md\n'],
      ['docs/derived/relationships.md', 'docs/derived/relationships.md\n'],
      ['docs/derived/relationships/uses.md', 'docs/derived/relationships/uses.md\n'],
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
      'docs/derived/relationships/uses.md: generated documentation is missing; run npm run docs:generate.',
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

  test('check mode does not write and invalid sources block generation', async () => {
    const files = await currentFiles()
    const analysis = analyzeSpecifications({ files })
    const expected = await renderDerivedDocumentation(analysis.corpus, PRETTIER_OPTIONS)
    let writes = 0
    const errors: string[] = []
    const io: DerivedDocsIO = {
      actualOutputs: expected,
      writeOutputs: () => {
        writes += 1
        return Promise.resolve()
      },
      writeError: (message) => errors.push(message),
    }
    expect(await runDerivedDocumentation(files, ['check'], io, PRETTIER_OPTIONS)).toBe(0)
    expect(writes).toBe(0)
    expect(errors).toEqual([])
    expect(await runDerivedDocumentation([], ['generate'], io, PRETTIER_OPTIONS)).toBe(1)
    expect(writes).toBe(0)
  })
})

test('generated local links and anchors resolve against the current corpus', async () => {
  const files = await currentFiles()
  const analysis = analyzeSpecifications({ files })
  expect(analysis.diagnostics).toEqual([])
  const outputs = await renderDerivedDocumentation(analysis.corpus, PRETTIER_OPTIONS)
  expect(derivedLinkFindings(files, outputs)).toEqual([])
  const documents = new Map(files.map((file) => [file.path, parseDocument(file)]))
  for (const [path, content] of outputs) documents.set(path, parseDocument({ path, content }))

  for (const path of outputs.keys()) {
    const document = documents.get(path)
    expect(document).toBeDefined()
    if (!document) continue
    visit(document.tree, (node) => {
      if (!isLink(node) || isExternalUrl(node.url) || node.url.startsWith('#')) return
      const parts = splitUrl(node.url)
      const decodedPath = decodeUrlPart(parts.path)
      expect(decodedPath).toBeDefined()
      if (!decodedPath) return
      const destinationPath = resolvePath(path, decodedPath)
      const destination = documents.get(destinationPath)
      expect(destination, `${path} links to missing ${destinationPath}`).toBeDefined()
      if (!destination || !parts.fragment) return
      const slugger = new GithubSlugger()
      const slugs = new Set(destination.headings.map((heading) => slugger.slug(headingText(heading))))
      expect(slugs, `${path} links to missing #${parts.fragment} in ${destinationPath}`).toContain(parts.fragment)
    })
  }
})
