import { readdir, readFile } from 'node:fs/promises'
import { relative, resolve } from 'node:path'

import { describe, expect, test } from 'vitest'

import { runSpecificationLint } from '../scripts/lint-specs.ts'
import { analyzeSpecifications, lintRequirementReferences, lintSpecifications } from '../scripts/spec-linter/linter.ts'
import type { SourceFile } from '../scripts/spec-linter/types.ts'

function lines(values: readonly string[]): string {
  return values.join('\n')
}

function validCorpus(): SourceFile[] {
  return [
    {
      path: 'docs/specs/README.md',
      content: lines([
        '# Game Specification Index',
        '',
        '| Metadata | Value |',
        '| --- | --- |',
        '| Spec ID | INDEX |',
        '| Family | Governance |',
        '| Status | Draft |',
        '| Scope | Registry |',
        '',
        '# Purpose and boundaries',
        '',
        'Registry.',
        '',
        '# Relationships',
        '',
        'No explicit relationships.',
        '',
        '# Glossary',
        '',
        'None.',
        '',
        '# Specification register',
        '',
        '| ID | Family | Document | Owns |',
        '| --- | --- | --- | --- |',
        '| INDEX | Governance | [Game Specification Index](README.md) | Registry. |',
        '| CONV | Governance | [Specification Conventions](governance/spec-conventions.md) | Conventions. |',
        '| AAA | Foundation | [Alpha](foundation/alpha.md) | Alpha rules. |',
      ]),
    },
    {
      path: 'docs/specs/governance/spec-conventions.md',
      content: lines([
        '# Specification Conventions',
        '',
        '| Metadata | Value |',
        '| --- | --- |',
        '| Spec ID | CONV |',
        '| Family | Governance |',
        '| Status | Draft |',
        '| Scope | Conventions |',
        '',
        '# Purpose and boundaries',
        '',
        'Conventions.',
        '',
        '# Relationships',
        '',
        'No explicit relationships.',
        '',
        '# Glossary',
        '',
        '| Term | Definition |',
        '| --- | --- |',
        '| Convention | A repository writing rule. |',
        '',
        '# Implicit relationships',
        '',
        'The implicit inventory.',
      ]),
    },
    {
      path: 'docs/specs/foundation/alpha.md',
      content: lines([
        '# Alpha',
        '',
        '| Metadata | Value |',
        '| --- | --- |',
        '| Spec ID | AAA |',
        '| Family | Foundation |',
        '| Status | Draft |',
        '| Scope | Alpha rules |',
        '',
        '# Purpose and boundaries',
        '',
        'Alpha purpose. See [conventions](../governance/spec-conventions.md#implicit-relationships).',
        '',
        '# Relationships',
        '',
        'No explicit relationships.',
        '',
        '# Glossary',
        '',
        'None.',
        '',
        '# Concepts and contract',
        '',
        'Contract.',
        '',
        '# Requirements',
        '',
        '## AAA-001 — Rule',
        '',
        'Alpha must be deterministic.',
        '',
        '# Edge cases and failure behavior',
        '',
        'Failures are defined.',
        '',
        '# Acceptance examples',
        '',
        '[AAA-001](#aaa-001--rule): the same input has the same result.',
        '',
        '# Open decisions',
        '',
        'None.',
      ]),
    },
  ]
}

function diagnosticCodes(files: readonly SourceFile[]): readonly string[] {
  return lintSpecifications({ files }).map((diagnostic) => diagnostic.code)
}

function cycleCorpus(kind: 'follows' | 'refines' | 'uses'): SourceFile[] {
  const files = validCorpus()
  const alpha = files[2]
  if (!alpha) return files
  const active = { follows: 'Follows', refines: 'Refines', uses: 'Uses' }[kind]
  const passive = { follows: 'Followed by', refines: 'Refined by', uses: 'Used by' }[kind]
  const betaContent = alpha.content
    .replaceAll('Alpha', 'Beta')
    .replaceAll('AAA', 'BBB')
    .replaceAll('aaa', 'bbb')
    .replace('No explicit relationships.', '- ' + active + ' [Alpha](alpha.md)\n- ' + passive + ' [Alpha](alpha.md)')
  const withBeta = mutate(
    files,
    'docs/specs/README.md',
    '| AAA | Foundation | [Alpha](foundation/alpha.md) | Alpha rules. |',
    '| AAA | Foundation | [Alpha](foundation/alpha.md) | Alpha rules. |\n| BBB | Foundation | [Beta](foundation/beta.md) | Beta rules. |',
  )
  return [
    ...mutate(
      withBeta,
      alpha.path,
      'No explicit relationships.',
      '- ' + active + ' [Beta](beta.md)\n- ' + passive + ' [Beta](beta.md)',
    ),
    { path: 'docs/specs/foundation/beta.md', content: betaContent },
  ]
}

function mutate(files: readonly SourceFile[], path: string, find: string, replacement: string): SourceFile[] {
  return files.map((file) => ({
    ...file,
    content: file.path === path ? file.content.replace(find, replacement) : file.content,
  }))
}

describe('specification linter', () => {
  test.each([
    ['Uses', 'Used by', 'uses'],
    ['Refines', 'Refined by', 'refines'],
    ['Follows', 'Followed by', 'follows'],
    ['Implements', 'Implemented by', 'implements'],
    ['Verifies', 'Verified by', 'verifies'],
  ])('normalizes %s and %s into one correctly directed edge', (active, passive, kind) => {
    const files = mutate(
      mutate(
        validCorpus(),
        'docs/specs/foundation/alpha.md',
        'No explicit relationships.',
        `- ${active} [Game Specification Index](../README.md)`,
      ),
      'docs/specs/README.md',
      'No explicit relationships.',
      `- ${passive} [Alpha](foundation/alpha.md)`,
    )
    const result = analyzeSpecifications({ files })
    expect(result.diagnostics).toEqual([])
    expect(result.corpus.relationships.filter((edge) => edge.origin === 'explicit')).toEqual([
      expect.objectContaining({ dependencyId: 'INDEX', dependentId: 'AAA', kind }),
    ])
    expect(result.corpus.relationships.every((edge) => !('scope' in edge))).toBe(true)
  })

  test.each([
    ['old table', '| Dependency | Relationship | Scope |\n| --- | --- | --- |', 'SPEC401'],
    ['old subsection', '## Dependencies\n\nNo explicit relationships.', 'SPEC208'],
    [
      'old empty sentence',
      'Only [implicit dependencies](../governance/spec-conventions.md#implicit-relationships).',
      'SPEC401',
    ],
    ['annotated entry', '- Uses [Game Specification Index](../README.md): rules', 'SPEC407'],
    ['nested entry', '- Uses [Game Specification Index](../README.md)\n  - details', 'SPEC407'],
    ['ordered list', '1. Uses [Game Specification Index](../README.md)', 'SPEC401'],
    ['wrong phrase case', '- uses [Game Specification Index](../README.md)', 'SPEC409'],
    ['external destination', '- Uses [Example](https://example.com)', 'SPEC408'],
    ['nonregistered destination', '- Uses [Missing](missing.md)', 'SPEC408'],
    ['fragment destination', '- Uses [Game Specification Index](../README.md#glossary)', 'SPEC408'],
    ['incorrect title', '- Uses [Index](../README.md)', 'SPEC410'],
    [
      'duplicate',
      '- Uses [Game Specification Index](../README.md)\n- Uses [Game Specification Index](../README.md)',
      'SPEC412',
    ],
    ['self reference', '- Uses [Alpha](alpha.md)', 'SPEC411'],
    [
      'wrong group order',
      '- Refines [Game Specification Index](../README.md)\n- Uses [Game Specification Index](../README.md)',
      'SPEC415',
    ],
    [
      'wrong title order',
      '- Uses [Specification Conventions](../governance/spec-conventions.md)\n- Uses [Game Specification Index](../README.md)',
      'SPEC415',
    ],
    [
      'empty mixed with entries',
      'No explicit relationships.\n\n- Uses [Game Specification Index](../README.md)',
      'SPEC401',
    ],
  ])('rejects %s', (_name, inventory, code) => {
    expect(
      diagnosticCodes(mutate(validCorpus(), 'docs/specs/foundation/alpha.md', 'No explicit relationships.', inventory)),
    ).toContain(code)
  })

  test('does not accept a mirror with the wrong direction', () => {
    const files = mutate(
      mutate(
        validCorpus(),
        'docs/specs/foundation/alpha.md',
        'No explicit relationships.',
        '- Uses [Game Specification Index](../README.md)',
      ),
      'docs/specs/README.md',
      'No explicit relationships.',
      '- Uses [Alpha](foundation/alpha.md)',
    )
    expect(diagnosticCodes(files).filter((code) => code === 'SPEC413')).toHaveLength(2)
  })

  test('accepts a valid in-memory corpus', () => {
    expect(lintSpecifications({ files: validCorpus() })).toEqual([])
  })

  test('accepts requirements nested below H2 and H3 topic headings', () => {
    const files = mutate(
      validCorpus(),
      'docs/specs/foundation/alpha.md',
      '## AAA-001 — Rule',
      lines(['## Topic', '', '### Detail', '', '#### AAA-001 — Rule']),
    )
    expect(lintSpecifications({ files })).toEqual([])
  })

  test('rejects a requirement that is not below its current topic heading', () => {
    const files = mutate(
      validCorpus(),
      'docs/specs/foundation/alpha.md',
      '## AAA-001 — Rule',
      lines(['## Topic', '', '## AAA-001 — Rule']),
    )
    expect(diagnosticCodes(files)).toContain('SPEC608')
  })

  test('rejects skipped heading levels', () => {
    const files = mutate(validCorpus(), 'docs/specs/foundation/alpha.md', '## AAA-001 — Rule', '#### AAA-001 — Rule')
    const codes = diagnosticCodes(files)
    expect(codes).toContain('SPEC211')
    expect(codes).toContain('SPEC608')
  })

  test('rejects missing requirement titles and duplicate declarations', () => {
    let files = mutate(validCorpus(), 'docs/specs/foundation/alpha.md', '## AAA-001 — Rule', '## AAA-001')
    expect(diagnosticCodes(files)).toContain('SPEC607')
    files = mutate(
      validCorpus(),
      'docs/specs/foundation/alpha.md',
      'Alpha must be deterministic.',
      lines(['Alpha must be deterministic.', '', '## AAA-001 — Duplicate', '', 'Duplicate rule.']),
    )
    expect(diagnosticCodes(files)).toContain('SPEC602')
  })

  test('requires individual links to the exact requirement destination', () => {
    const unlinked = mutate(
      validCorpus(),
      'docs/specs/foundation/alpha.md',
      '[AAA-001](#aaa-001--rule): the same',
      'AAA-001: the same',
    )
    expect(diagnosticCodes(unlinked)).toContain('SPEC609')
    const wrongTarget = mutate(
      validCorpus(),
      'docs/specs/foundation/alpha.md',
      '[AAA-001](#aaa-001--rule): the same',
      '[AAA-001](#requirements): the same',
    )
    expect(diagnosticCodes(wrongTarget)).toContain('SPEC611')
  })

  test('rejects a range even when its visible endpoints are linked', () => {
    const files = mutate(
      validCorpus(),
      'docs/specs/foundation/alpha.md',
      '[AAA-001](#aaa-001--rule): the same',
      '[AAA-001](#aaa-001--rule) through [AAA-001](#aaa-001--rule): the same',
    )
    expect(diagnosticCodes(files)).toContain('SPEC610')
  })

  test('validates requirement links in prose, lists, tables, and authored non-spec docs', () => {
    let files = mutate(
      validCorpus(),
      'docs/specs/foundation/alpha.md',
      '[AAA-001](#aaa-001--rule): the same input has the same result.',
      lines([
        '[AAA-001](#aaa-001--rule): the same input has the same result.',
        '',
        '- [AAA-001](#aaa-001--rule)',
        '',
        '| Requirement |',
        '| --- |',
        '| [AAA-001](#aaa-001--rule) |',
      ]),
    )
    files = [
      ...files,
      {
        path: 'docs/notes.md',
        content: '[AAA-001](specs/foundation/alpha.md#aaa-001--rule)\n',
      },
    ]
    expect(lintSpecifications({ files })).toEqual([])
  })

  test('checks generated requirement references only when requested', () => {
    const files = [...validCorpus(), { path: 'docs/derived/glossary.md', content: 'AAA-001\n' }]
    expect(lintSpecifications({ files })).toEqual([])
    expect(lintRequirementReferences({ files }, true).map((diagnostic) => diagnostic.code)).toContain('SPEC609')
  })

  test.each([
    [
      'unregistered file',
      (files: SourceFile[]) => [...files, { path: 'docs/specs/orphan.md', content: files[2]?.content ?? '' }],
      'SPEC013',
    ],
    [
      'metadata status',
      (files: SourceFile[]) =>
        mutate(files, 'docs/specs/foundation/alpha.md', '| Status | Draft |', '| Status | Final |'),
      'SPEC105',
    ],
    [
      'invalid register family',
      (files: SourceFile[]) =>
        mutate(
          files,
          'docs/specs/README.md',
          '| AAA | Foundation | [Alpha](foundation/alpha.md)',
          '| AAA | Unknown | [Alpha](foundation/alpha.md)',
        ),
      'SPEC017',
    ],
    [
      'metadata and register family disagreement',
      (files: SourceFile[]) =>
        mutate(files, 'docs/specs/foundation/alpha.md', '| Family | Foundation |', '| Family | Mechanics |'),
      'SPEC018',
    ],
    [
      'invalid metadata family',
      (files: SourceFile[]) =>
        mutate(files, 'docs/specs/foundation/alpha.md', '| Family | Foundation |', '| Family | Unknown |'),
      'SPEC109',
    ],
    [
      'family and directory disagreement',
      (files: SourceFile[]) =>
        mutate(
          mutate(files, 'docs/specs/foundation/alpha.md', '| Family | Foundation |', '| Family | Mechanics |'),
          'docs/specs/README.md',
          '| AAA | Foundation | [Alpha](foundation/alpha.md)',
          '| AAA | Mechanics | [Alpha](foundation/alpha.md)',
        ),
      'SPEC110',
    ],
    [
      'title agreement',
      (files: SourceFile[]) => mutate(files, 'docs/specs/foundation/alpha.md', '# Alpha', '# ALPHA'),
      'SPEC015',
    ],
    [
      'standard heading order',
      (files: SourceFile[]) =>
        mutate(files, 'docs/specs/foundation/alpha.md', '# Concepts and contract', '# Requirements'),
      'SPEC209',
    ],
    [
      'removed headings',
      (files: SourceFile[]) => mutate(files, 'docs/specs/foundation/alpha.md', '# Glossary', '# Terminology'),
      'SPEC203',
    ],
    [
      'broken links',
      (files: SourceFile[]) =>
        mutate(
          files,
          'docs/specs/foundation/alpha.md',
          '../governance/spec-conventions.md#implicit-relationships',
          'missing.md#implicit-relationships',
        ),
      'SPEC303',
    ],
    [
      'broken anchors',
      (files: SourceFile[]) =>
        mutate(files, 'docs/specs/foundation/alpha.md', '#implicit-relationships', '#missing-anchor'),
      'SPEC304',
    ],
    [
      'None dependencies',
      (files: SourceFile[]) => mutate(files, 'docs/specs/foundation/alpha.md', 'No explicit relationships.', 'None.'),
      'SPEC401',
    ],
    [
      'invalid relationship kind',
      (files: SourceFile[]) =>
        mutate(
          files,
          'docs/specs/foundation/alpha.md',
          'No explicit relationships.',
          '- Copies [Specification Conventions](../governance/spec-conventions.md)',
        ),
      'SPEC409',
    ],
    [
      'missing relationship mirror',
      (files: SourceFile[]) =>
        mutate(
          files,
          'docs/specs/foundation/alpha.md',
          'No explicit relationships.',
          '- Uses [Specification Conventions](../governance/spec-conventions.md)',
        ),
      'SPEC413',
    ],
    [
      'prohibited formal terminology',
      (files: SourceFile[]) =>
        mutate(files, 'docs/specs/foundation/alpha.md', 'None.\n\n# Concepts', 'Source.\n\n# Concepts'),
      'SPEC501',
    ],
    [
      'requirement prefix',
      (files: SourceFile[]) => mutate(files, 'docs/specs/foundation/alpha.md', 'AAA-001 — Rule', 'BBB-001 — Rule'),
      'SPEC601',
    ],
    [
      'unresolved requirement reference',
      (files: SourceFile[]) =>
        mutate(files, 'docs/specs/foundation/alpha.md', '[AAA-001](#aaa-001--rule): the same', 'AAA-999: the same'),
      'SPEC606',
    ],
    [
      'accepted unresolved TODO',
      (files: SourceFile[]) =>
        mutate(
          mutate(
            files,
            'docs/specs/foundation/alpha.md',
            '| Status | Draft |',
            '| Status | Accepted |\n| Acceptance reference | Owner approval |',
          ),
          'docs/specs/foundation/alpha.md',
          'Contract.',
          'TODO: Complete the contract.',
        ),
      'SPEC604',
    ],
  ])('rejects %s', (_name, change, expectedCode) => {
    expect(diagnosticCodes(change(validCorpus()))).toContain(expectedCode)
  })

  test('produces stable sorted diagnostics', () => {
    const files = mutate(
      mutate(validCorpus(), 'docs/specs/foundation/alpha.md', '# Alpha', '# ALPHA'),
      'docs/specs/foundation/alpha.md',
      '| Status | Draft |',
      '| Status | Final |',
    )
    const diagnostics = lintSpecifications({ files })
    expect(diagnostics).toEqual(
      diagnostics.toSorted(
        (left, right) =>
          left.path.localeCompare(right.path, 'en') ||
          left.line - right.line ||
          left.column - right.column ||
          left.code.localeCompare(right.code, 'en') ||
          left.message.localeCompare(right.message, 'en'),
      ),
    )
  })

  test.each(['follows', 'refines'] as const)('rejects %s cycles', (kind) => {
    expect(diagnosticCodes(cycleCorpus(kind))).toContain('SPEC414')
  })

  test('permits uses cycles', () => {
    expect(lintSpecifications({ files: cycleCorpus('uses') })).toEqual([])
  })

  test('rejects duplicate glossary ownership and aliases', () => {
    const files = mutate(
      validCorpus(),
      'docs/specs/foundation/alpha.md',
      '# Glossary\n\nNone.',
      lines([
        '# Glossary',
        '',
        '| Term | Definition |',
        '| --- | --- |',
        '| Shared/Alternative | A definition. |',
        '| Convention | A duplicate definition. |',
      ]),
    )
    const codes = diagnosticCodes(files)
    expect(codes).toContain('SPEC502')
    expect(codes).toContain('SPEC503')
  })

  test('rejects incomplete glossary rows', () => {
    const files = mutate(
      validCorpus(),
      'docs/specs/foundation/alpha.md',
      '# Glossary\n\nNone.',
      lines(['# Glossary', '', '| Term | Definition |', '| --- | --- |', '| Incomplete | |']),
    )
    expect(diagnosticCodes(files)).toContain('SPEC504')
  })

  test('rejects compact ranges and removed requirement references', () => {
    const files = mutate(
      validCorpus(),
      'docs/specs/foundation/alpha.md',
      '[AAA-001](#aaa-001--rule): the same input',
      'AAA-001–002: the same input',
    )
    const codes = diagnosticCodes(files)
    expect(codes).toContain('SPEC606')
    expect(codes).toContain('SPEC610')
  })

  test('returns stable CLI exit classes', () => {
    const output: string[] = []
    expect(runSpecificationLint(validCorpus(), [], (message) => output.push(message))).toBe(0)
    expect(
      runSpecificationLint(
        mutate(validCorpus(), 'docs/specs/foundation/alpha.md', '| Status | Draft |', '| Status | Final |'),
        [],
        (message) => output.push(message),
      ),
    ).toBe(1)
    expect(runSpecificationLint(validCorpus(), ['unexpected'], (message) => output.push(message))).toBe(2)
  })
})

async function collectMarkdown(root: string, directory: string): Promise<readonly SourceFile[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const files: SourceFile[] = []
  for (const entry of entries) {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await collectMarkdown(root, path)))
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push({
        path: relative(root, path).replace(/\\/g, '/'),
        content: await readFile(path, 'utf8'),
      })
    }
  }
  return files
}

test('the current specification corpus is clean', async () => {
  const root = process.cwd()
  const files = await collectMarkdown(root, resolve(root, 'docs'))
  expect(lintSpecifications({ files })).toEqual([])
})
