import { resolve } from 'node:path'

import GithubSlugger from 'github-slugger'
import { describe, expect, test } from 'vitest'

import { collectMarkdownFiles } from '../scripts/lint-specs.ts'
import { DERIVED_OUTPUT_PATHS, renderDerivedDocumentation } from '../scripts/spec-docs/generator.ts'
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
        scope: 'Document structure, lifecycle, and writing rules',
        origin: 'implicit',
        sourcePaths: ['docs/specs/governance/spec-conventions.md'],
      },
      {
        dependencyId: 'AAA',
        dependencyPath: 'docs/specs/foundation/alpha.md',
        dependentId: 'ZZZ',
        dependentPath: 'docs/specs/mechanics/zulu.md',
        kind: 'uses',
        scope: 'Shared state | flow',
        origin: 'explicit',
        sourcePaths: ['docs/specs/foundation/alpha.md', 'docs/specs/mechanics/zulu.md'],
      },
      {
        dependencyId: 'AAA',
        dependencyPath: 'docs/specs/foundation/alpha.md',
        dependentId: 'ZZZ',
        dependentPath: 'docs/specs/mechanics/zulu.md',
        kind: 'refines',
        scope: 'Detailed Alpha rules',
        origin: 'explicit',
        sourcePaths: ['docs/specs/foundation/alpha.md', 'docs/specs/mechanics/zulu.md'],
      },
      {
        dependencyId: 'ZZZ',
        dependencyPath: 'docs/specs/mechanics/zulu.md',
        dependentId: 'AAA',
        dependentPath: 'docs/specs/foundation/alpha.md',
        kind: 'uses',
        scope: 'Separate result contract',
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

  test('renders one unlabeled dependency-to-dependent graph per nonempty kind', async () => {
    const outputs = await renderDerivedDocumentation(sampleCorpus(), PRETTIER_OPTIONS)
    const relationships = outputs.get('docs/derived/relationships.md') ?? ''
    expect(relationships).toContain('AAA — Alpha &quot;Quoted&quot; &amp; More (Draft)')
    expect(relationships).toContain('A → B means A is refined by B.')
    expect(relationships).toContain('A → B means A is used by B.')
    expect(relationships).toContain('CONV --> AAA')
    expect(relationships).toContain('AAA --> ZZZ')
    expect(relationships).toContain('ZZZ --> AAA')
    expect(relationships).not.toContain('REL-')
    expect(relationships).not.toContain('-->|')
    expect(relationships).not.toMatch(/^\|/m)
    expect(relationships).not.toContain('Explicit relationship overview')
    expect(relationships).not.toContain('Shared state')
    expect(relationships).toContain('No implements relationships are declared.')
    expect(relationships).toContain('No verifies relationships are declared.')
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
      [relationship.dependencyId, relationship.dependentId, relationship.kind, relationship.scope].join('\0'),
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
    const expected = new Map<string, string>(DERIVED_OUTPUT_PATHS.map((path) => [path, `${path}\n`]))
    const actual = new Map<string, string>([
      [DERIVED_OUTPUT_PATHS[0], `${DERIVED_OUTPUT_PATHS[0]}\r\n`],
      [DERIVED_OUTPUT_PATHS[1], 'stale\n'],
      ['docs/derived/extra.md', 'unexpected\n'],
    ])
    expect(derivedOutputFindings(expected, actual)).toEqual([
      'docs/derived/extra.md: unexpected generated documentation file; remove or relocate it.',
      'docs/derived/glossary.md: generated documentation is stale; run npm run docs:generate.',
      'docs/derived/relationships.md: generated documentation is missing; run npm run docs:generate.',
    ])
  })

  test('reports broken generated destinations and anchors', () => {
    const outputs = new Map([
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

  for (const path of DERIVED_OUTPUT_PATHS) {
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
