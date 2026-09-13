import { readdir, readFile } from 'node:fs/promises'
import { relative, resolve } from 'node:path'

import { describe, expect, test } from 'vitest'

import { runSpecificationLint } from '../scripts/lint-specs.ts'
import { lintSpecifications } from '../scripts/spec-linter/linter.ts'
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
        '## Dependencies',
        '',
        'Only [implicit dependencies](governance/spec-conventions.md#implicit-relationships).',
        '',
        '## Dependents',
        '',
        'None.',
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
        '## Dependencies',
        '',
        'Only [implicit dependencies](#implicit-relationships).',
        '',
        '## Dependents',
        '',
        'Only [implicit dependents](#implicit-relationships).',
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
        'Alpha purpose.',
        '',
        '# Relationships',
        '',
        '## Dependencies',
        '',
        'Only [implicit dependencies](../governance/spec-conventions.md#implicit-relationships).',
        '',
        '## Dependents',
        '',
        'None.',
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
        '**AAA-001 — Rule.** Alpha must be deterministic.',
        '',
        '# Edge cases and failure behavior',
        '',
        'Failures are defined.',
        '',
        '# Acceptance examples',
        '',
        'AAA-001: the same input has the same result.',
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
  const betaContent = alpha.content
    .replaceAll('Alpha', 'Beta')
    .replaceAll('AAA', 'BBB')
    .replace(
      'Only [implicit dependencies](../governance/spec-conventions.md#implicit-relationships).',
      lines([
        '| Dependency | Relationship | Scope |',
        '| --- | --- | --- |',
        `| [Alpha](alpha.md) | \`${kind}\` | Shared contract | `,
      ]),
    )
    .replace(
      'None.\n\n# Glossary',
      lines([
        '| Dependent | Relationship | Scope |',
        '| --- | --- | --- |',
        `| [Alpha](alpha.md) | \`${kind}\` | Shared contract | `,
        '',
        '# Glossary',
      ]),
    )
  const withBeta = mutate(
    files,
    'docs/specs/README.md',
    '| AAA | Foundation | [Alpha](foundation/alpha.md) | Alpha rules. |',
    lines([
      '| AAA | Foundation | [Alpha](foundation/alpha.md) | Alpha rules. |',
      '| BBB | Foundation | [Beta](foundation/beta.md) | Beta rules. |',
    ]),
  )
  const withAlphaCycle = mutate(
    mutate(
      withBeta,
      'docs/specs/foundation/alpha.md',
      'Only [implicit dependencies](../governance/spec-conventions.md#implicit-relationships).',
      lines([
        '| Dependency | Relationship | Scope |',
        '| --- | --- | --- |',
        `| [Beta](beta.md) | \`${kind}\` | Shared contract | `,
      ]),
    ),
    'docs/specs/foundation/alpha.md',
    'None.\n\n# Glossary',
    lines([
      '| Dependent | Relationship | Scope |',
      '| --- | --- | --- |',
      `| [Beta](beta.md) | \`${kind}\` | Shared contract | `,
      '',
      '# Glossary',
    ]),
  )
  return [...withAlphaCycle, { path: 'docs/specs/foundation/beta.md', content: betaContent }]
}

function mutate(files: readonly SourceFile[], path: string, find: string, replacement: string): SourceFile[] {
  return files.map((file) => ({
    ...file,
    content: file.path === path ? file.content.replace(find, replacement) : file.content,
  }))
}

describe('specification linter', () => {
  test('accepts a valid in-memory corpus', () => {
    expect(lintSpecifications({ files: validCorpus() })).toEqual([])
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
      (files: SourceFile[]) =>
        mutate(
          files,
          'docs/specs/foundation/alpha.md',
          'Only [implicit dependencies](../governance/spec-conventions.md#implicit-relationships).',
          'None.',
        ),
      'SPEC401',
    ],
    [
      'invalid relationship kind',
      (files: SourceFile[]) =>
        mutate(
          files,
          'docs/specs/foundation/alpha.md',
          'Only [implicit dependencies](../governance/spec-conventions.md#implicit-relationships).',
          lines([
            '| Dependency | Relationship | Scope |',
            '| --- | --- | --- |',
            '| [Specification Conventions](../governance/spec-conventions.md) | `copies` | Rules |',
          ]),
        ),
      'SPEC409',
    ],
    [
      'missing relationship mirror',
      (files: SourceFile[]) =>
        mutate(
          files,
          'docs/specs/foundation/alpha.md',
          'Only [implicit dependencies](../governance/spec-conventions.md#implicit-relationships).',
          lines([
            '| Dependency | Relationship | Scope |',
            '| --- | --- | --- |',
            '| [Specification Conventions](../governance/spec-conventions.md) | `uses` | Rules |',
          ]),
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
        mutate(files, 'docs/specs/foundation/alpha.md', 'AAA-001: the same', 'AAA-999: the same'),
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

  test('permits scoped uses cycles', () => {
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

  test('resolves compact requirement ranges through retired IDs', () => {
    let files = mutate(
      validCorpus(),
      'docs/specs/foundation/alpha.md',
      'AAA-001: the same input',
      'AAA-001–002: the same input',
    )
    files = mutate(
      files,
      'docs/specs/foundation/alpha.md',
      '# Open decisions\n\nNone.',
      lines([
        '# Open decisions',
        '',
        'None.',
        '',
        '# Appendix A. Requirement history',
        '',
        '| Retired requirement | Replacement |',
        '| --- | --- |',
        '| AAA-002 | AAA-001 |',
      ]),
    )
    expect(lintSpecifications({ files })).toEqual([])
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
