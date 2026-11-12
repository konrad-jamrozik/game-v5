import { readdir, readFile } from 'node:fs/promises'
import { relative, resolve } from 'node:path'
import { posix } from 'node:path'

import { describe, expect, test } from 'vitest'

import { runSpecificationLint as runSpecificationLintRaw } from '../scripts/lint-specs.ts'
import {
  analyzeSpecifications as analyzeSpecificationsRaw,
  lintSectionReferences,
  lintSpecifications as lintSpecificationsRaw,
} from '../scripts/spec-linter/linter.ts'
import { FAMILY_DIAGRAM_END, FAMILY_DIAGRAM_START } from '../scripts/spec-linter/overviews.ts'
import type { LintInput, SourceFile } from '../scripts/spec-linter/types.ts'

function lines(values: readonly string[]): string {
  return values.join('\n')
}

function overviewFixture(family: string, memberPaths: readonly string[], overviewPath: string): string {
  return lines([
    `# About the ${family} family`,
    '',
    '# What this family is for',
    '',
    'Purpose.',
    '',
    '# Documents',
    '',
    ...memberPaths.map((path) => `- [${path}](${posix.relative(posix.dirname(overviewPath), path)})`),
    '',
    '# How they relate',
    '',
    FAMILY_DIAGRAM_START,
    FAMILY_DIAGRAM_END,
    '',
    '# Why these boundaries',
    '',
    'Reasons.',
  ])
}

/**
 * Adds a valid family overview for every Family declared in specification metadata that has none yet, so fixtures
 * that are not about family overviews stay focused on what they test.
 */
function withOverviews(files: readonly SourceFile[]): readonly SourceFile[] {
  const members = new Map<string, string[]>()
  for (const file of files) {
    if (!file.path.startsWith('docs/specs/') || /\/about-[^/]*\.md$/.test(file.path)) continue
    const family = /^\|\s*Family\s*\|\s*([A-Za-z]+)\s*\|/m.exec(file.content)?.[1]
    if (!family) continue
    members.set(family, [...(members.get(family) ?? []), file.path])
  }
  const added: SourceFile[] = []
  for (const [family, paths] of members) {
    const path = `docs/specs/${family.toLowerCase()}/about-${family.toLowerCase()}.md`
    if (files.some((file) => file.path === path)) continue
    added.push({ path, content: overviewFixture(family, paths, path) })
  }
  return [...files, ...added]
}

function lintSpecifications(input: LintInput): ReturnType<typeof lintSpecificationsRaw> {
  return lintSpecificationsRaw({ ...input, files: withOverviews(input.files) })
}

function analyzeSpecifications(input: LintInput): ReturnType<typeof analyzeSpecificationsRaw> {
  return analyzeSpecificationsRaw({ ...input, files: withOverviews(input.files) })
}

function runSpecificationLint(
  ...[files, ...rest]: Parameters<typeof runSpecificationLintRaw>
): ReturnType<typeof runSpecificationLintRaw> {
  return runSpecificationLintRaw(withOverviews(files), ...rest)
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
        '| Audience | Engine designer, Implementer |',

        '',
        '# Overview',
        '',
        'Registry.',
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
        '| Audience | Engine designer, Implementer |',

        '',
        '# Overview',
        '',
        'Conventions.',
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
        '| Audience | Engine designer, Implementer |',

        '',
        '# Overview',
        '',
        'Alpha purpose. See [Implicit relationships](../governance/spec-conventions.md#implicit-relationships).',
        '',
        '# Alpha behavior',
        '',
        'Contract.',
        '',
        '# Rule',
        '',
        'Alpha must be deterministic.',
        '',
        '# Edge cases and failure behavior',
        '',
        'Failures are defined.',
        '',
        '# Acceptance examples',
        '',
        '[Rule](#rule): the same input has the same result.',
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
  const betaContent = insertSection(
    alpha.content.replaceAll('Alpha', 'Beta').replaceAll('AAA', 'BBB').replaceAll('aaa', 'bbb'),
    ['Overview'],
    '# Relationships\n\n- ' + active + ' [Alpha](alpha.md)\n- ' + passive + ' [Alpha](alpha.md)',
  )
  const withBeta = mutate(
    files,
    'docs/specs/README.md',
    '| AAA | Foundation | [Alpha](foundation/alpha.md) | Alpha rules. |',
    '| AAA | Foundation | [Alpha](foundation/alpha.md) | Alpha rules. |\n| BBB | Foundation | [Beta](foundation/beta.md) | Beta rules. |',
  )
  return [
    ...withRelationships(withBeta, alpha.path, '- ' + active + ' [Beta](beta.md)\n- ' + passive + ' [Beta](beta.md)'),
    { path: 'docs/specs/foundation/beta.md', content: betaContent },
  ]
}

function insertSection(content: string, after: readonly string[], section: string): string {
  const headings = [...content.matchAll(/^# .*$/gm)]
  const anchor = headings.filter((match) => after.includes(match[0].slice(2))).at(-1)
  const next = headings.find((match) => (match.index ?? 0) > (anchor?.index ?? 0))
  const position = next?.index ?? content.length
  return content.slice(0, position) + section + '\n\n' + content.slice(position)
}

function withRelationships(files: readonly SourceFile[], path: string, inventory: string): SourceFile[] {
  return files.map((file) =>
    file.path === path
      ? { ...file, content: insertSection(file.content, ['Overview'], '# Relationships\n\n' + inventory) }
      : file,
  )
}

function withGlossary(files: readonly SourceFile[], path: string, glossary: string): SourceFile[] {
  return files.map((file) =>
    file.path === path
      ? { ...file, content: insertSection(file.content, ['Overview', 'Relationships'], glossary) }
      : file,
  )
}

function mutate(files: readonly SourceFile[], path: string, find: string, replacement: string): SourceFile[] {
  return files.map((file) => ({
    ...file,
    content: file.path === path ? file.content.replace(find, replacement) : file.content,
  }))
}

describe('specification linter', () => {
  test('accepts modeling Types as glossary terms and descriptions', () => {
    const files = withGlossary(
      validCorpus(),
      'docs/specs/foundation/alpha.md',
      '# Glossary\n\n| Term | Definition |\n| --- | --- |\n| Type | A named description of data. |\n| Value | Data conforming to a Type. |',
    )
    expect(lintSpecifications({ files })).toEqual([])
  })

  test.each(['Foundation', 'Governance', 'Mechanics', 'Content', 'Interfaces', 'Acceptance', 'Guidance'])(
    'accepts topic sections for %s',
    (family) => {
      const directory = family.toLowerCase()
      const files = validCorpus().map((file) => ({
        path: file.path.replace('foundation/alpha.md', directory + '/alpha.md'),
        content: file.content
          .replaceAll('Foundation', family)
          .replaceAll('foundation/alpha.md', directory + '/alpha.md'),
      }))
      expect(diagnosticCodes(files)).toEqual([])
    },
  )

  test('rejects an empty topic section', () => {
    const files = mutate(
      validCorpus(),
      'docs/specs/foundation/alpha.md',
      '# Edge cases and failure behavior',
      '# Empty topic\n\n# Edge cases and failure behavior',
    )
    expect(diagnosticCodes(files)).toEqual(['SPEC204'])
  })

  test('rejects a topic section after the closing sections', () => {
    const misplaced = mutate(
      validCorpus(),
      'docs/specs/foundation/alpha.md',
      '[Rule](#rule): the same input has the same result.',
      '[Rule](#rule): the same input has the same result.\n\n# Late topic\n\nSeparate contract.',
    )
    expect(diagnosticCodes(misplaced)).toEqual(['SPEC209'])
  })

  test.each(['Concepts and contract', 'Requirements', 'Details', 'Specification'])(
    'rejects the generic topic heading %s',
    (heading) => {
      const files = mutate(validCorpus(), 'docs/specs/foundation/alpha.md', '# Alpha behavior', '# ' + heading)
      expect(diagnosticCodes(files)).toEqual(['SPEC212'])
    },
  )

  test.each([
    ['Alpha behavior', 'Contract.'],
    ['Edge cases and failure behavior', 'Failures are defined.'],
  ])('allows omitting %s when it does not apply', (section, body) => {
    const files = mutate(validCorpus(), 'docs/specs/foundation/alpha.md', '# ' + section + '\n\n' + body + '\n\n', '')
    expect(diagnosticCodes(files)).toEqual([])
  })

  test.each([
    ['', 'missing'],
    ['Engine designer, Designer', 'unknown Persona'],
    ['Implementer, Engine designer', 'wrong order'],
    ['Implementer, Implementer', 'duplicate'],
  ])('rejects Audience metadata %j (%s)', (value, _reason) => {
    const files = mutate(
      validCorpus(),
      'docs/specs/foundation/alpha.md',
      '| Audience | Engine designer, Implementer |',
      value ? '| Audience | ' + value + ' |' : '',
    )
    expect(diagnosticCodes(files)).toEqual(['SPEC112'])
  })

  test('requires Overview', () => {
    const files = mutate(validCorpus(), 'docs/specs/foundation/alpha.md', '# Overview', '# Introduction')
    expect(diagnosticCodes(files)).toContain('SPEC206')
  })

  test.each([
    ['# Open decisions\n\nNone.', 'None'],
    ['# Edge cases and failure behavior\n\nNot applicable — this document defines no operations.', 'Not applicable'],
    ['# Notes\n\nN/A', 'N/A'],
  ])('rejects a placeholder section instead of omission (%s)', (section, _name) => {
    const files = mutate(
      validCorpus(),
      'docs/specs/foundation/alpha.md',
      '# Edge cases and failure behavior\n\nFailures are defined.',
      section.startsWith('# Edge') ? section : 'Failures are defined.\n\n' + section,
    )
    expect(diagnosticCodes(files)).toContain('SPEC205')
  })

  test('rejects a misplaced optional Open decisions section', () => {
    const misplaced = mutate(
      validCorpus(),
      'docs/specs/foundation/alpha.md',
      '# Alpha behavior',
      '# Open decisions\n\nChoose the numeric representation.\n\n# Alpha behavior',
    )
    expect(diagnosticCodes(misplaced)).toContain('SPEC209')
  })

  test('accepts Foundation examples embedded beside concepts', () => {
    const files = mutate(
      mutate(
        validCorpus(),
        'docs/specs/foundation/alpha.md',
        'Contract.',
        'Contract. For example, [Rule](#rule): the same input has the same result.',
      ),
      'docs/specs/foundation/alpha.md',
      '# Acceptance examples\n\n[Rule](#rule): the same input has the same result.\n\n',
      '',
    )
    expect(lintSpecifications({ files })).toEqual([])
  })

  test.each(['Governance', 'Mechanics', 'Content', 'Interfaces', 'Acceptance', 'Guidance'])(
    'allows omitting the separate acceptance section for %s specifications',
    (family) => {
      const directory = family.toLowerCase()
      const files = validCorpus().map((file) => ({
        path: file.path.replace('foundation/alpha.md', `${directory}/alpha.md`),
        content: file.content
          .replaceAll('Foundation', family)
          .replaceAll('foundation/alpha.md', `${directory}/alpha.md`)
          .replace('# Acceptance examples\n\n[Rule](#rule): the same input has the same result.\n\n', ''),
      }))
      expect(diagnosticCodes(files)).toEqual([])
    },
  )

  test('rejects a misplaced optional Foundation acceptance section', () => {
    const files = mutate(
      validCorpus(),
      'docs/specs/foundation/alpha.md',
      '# Edge cases and failure behavior\n\nFailures are defined.\n\n# Acceptance examples\n\n[Rule](#rule): the same input has the same result.',
      '# Acceptance examples\n\n[Rule](#rule): the same input has the same result.\n\n# Edge cases and failure behavior\n\nFailures are defined.',
    )
    expect(diagnosticCodes(files)).toEqual(['SPEC209'])
  })

  test('rejects an empty optional Foundation acceptance section', () => {
    const files = mutate(
      validCorpus(),
      'docs/specs/foundation/alpha.md',
      '[Rule](#rule): the same input has the same result.',
      '',
    )
    expect(diagnosticCodes(files)).toEqual(['SPEC204'])
  })

  test('allows omitting several sections that do not apply', () => {
    const files = mutate(
      mutate(
        validCorpus(),
        'docs/specs/foundation/alpha.md',
        '# Acceptance examples\n\n[Rule](#rule): the same input has the same result.\n\n',
        '',
      ),
      'docs/specs/foundation/alpha.md',
      '# Edge cases and failure behavior\n\nFailures are defined.\n\n',
      '',
    )
    expect(diagnosticCodes(files)).toEqual([])
  })

  test('allows Campaign Modeling Contract to omit the separate failure behavior section', () => {
    const files = mutate(
      validCorpus().map((file) => ({
        ...file,
        content: file.content.replaceAll('AAA', 'CMC').replaceAll('aaa-', 'cmc-'),
      })),
      'docs/specs/foundation/alpha.md',
      '# Edge cases and failure behavior\n\nFailures are defined.\n\n',
      '',
    )
    expect(lintSpecifications({ files })).toEqual([])
  })

  test.each(['TypeScript type', 'TypeScript types', '`TypeScript type`', '**TypeScript type**'])(
    'allows explicit programming terminology: %s',
    (term) => {
      const files = withGlossary(
        validCorpus(),
        'docs/specs/foundation/alpha.md',
        `# Glossary\n\n| Term | Definition |\n| --- | --- |\n| Example | A ${term} describing data. |`,
      )
      expect(lintSpecifications({ files })).toEqual([])
    },
  )

  test.each(['', ' A target artifact is also described.'])(
    'distinguishes Constants reference targets from artifact terminology: %s',
    (extra) => {
      const files = withGlossary(
        validCorpus(),
        'docs/specs/foundation/alpha.md',
        `# Glossary\n\n| Term | Definition |\n| --- | --- |\n| Constants | Values owned by this Campaign instance that remain fixed for its lifetime. A reference stored in Constants has a fixed target; it does not require the target’s State to remain fixed.${extra} |`,
      )
      expect(diagnosticCodes(files)).toEqual(extra === '' ? [] : ['SPEC501'])
    },
  )

  test.each([
    'relationship type',
    'relationship Types',
    'relationship **type**',
    '`relationship` type',
    'Type and relationship type',
    'TypeScript type and relationship type',
    'TypeScript type and target',
    'fixed target',
    'target’s State',
  ])('still rejects competing formal relationship terminology: %s', (term) => {
    const files = withGlossary(
      validCorpus(),
      'docs/specs/foundation/alpha.md',
      `# Glossary\n\n| Term | Definition |\n| --- | --- |\n| Example | A ${term}. |`,
    )
    expect(diagnosticCodes(files)).toContain('SPEC501')
  })

  test.each([
    ['Uses', 'Used by', 'uses'],
    ['Refines', 'Refined by', 'refines'],
    ['Follows', 'Followed by', 'follows'],
    ['Implements', 'Implemented by', 'implements'],
    ['Verifies', 'Verified by', 'verifies'],
  ])('normalizes %s and %s into one correctly directed edge', (active, passive, kind) => {
    const files = withRelationships(
      withRelationships(
        validCorpus(),
        'docs/specs/foundation/alpha.md',
        `- ${active} [Game Specification Index](../README.md)`,
      ),
      'docs/specs/README.md',
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
    expect(diagnosticCodes(withRelationships(validCorpus(), 'docs/specs/foundation/alpha.md', inventory))).toContain(
      code,
    )
  })

  test('does not accept a mirror with the wrong direction', () => {
    const files = withRelationships(
      withRelationships(
        validCorpus(),
        'docs/specs/foundation/alpha.md',
        '- Uses [Game Specification Index](../README.md)',
      ),
      'docs/specs/README.md',
      '- Uses [Alpha](foundation/alpha.md)',
    )
    expect(diagnosticCodes(files).filter((code) => code === 'SPEC413')).toHaveLength(2)
  })

  test('accepts a valid in-memory corpus', () => {
    expect(lintSpecifications({ files: validCorpus() })).toEqual([])
  })

  test.each([
    ['- Uses [Game Specification Index](../README.md) for the shared contract.', 'description bullet'],
    ['- Used by [Game Specification Index](../README.md)', 'bare inventory bullet'],
  ])('rejects a repeated inventory entry in Overview (%s)', (bullet) => {
    const files = mutate(
      validCorpus(),
      'docs/specs/foundation/alpha.md',
      'Alpha purpose.',
      'Alpha purpose.\n\n' + bullet + '\n',
    )
    expect(diagnosticCodes(files)).toEqual(['SPEC417'])
  })

  test('accepts ordinary bullets in Overview', () => {
    const files = mutate(
      validCorpus(),
      'docs/specs/foundation/alpha.md',
      'Alpha purpose.',
      'Alpha purpose.\n\n- Uses of [Game Specification Index](../README.md) are informative.\n',
    )
    expect(diagnosticCodes(files)).toEqual([])
  })

  test('accepts requirements nested below H2 and H3 topic headings', () => {
    const files = mutate(
      validCorpus(),
      'docs/specs/foundation/alpha.md',
      '# Rule',
      lines(['# Topic', '', '## Detail', '', '### Rule']),
    )
    expect(lintSpecifications({ files })).toEqual([])
  })

  test('accepts a requirement after a sibling topic heading', () => {
    const files = mutate(
      validCorpus(),
      'docs/specs/foundation/alpha.md',
      '# Rule',
      lines(['# Topic', '', 'Topic text.', '', '# Rule']),
    )
    expect(diagnosticCodes(files)).toEqual([])
  })

  test('accepts requirements after returning from nested explanatory sections', () => {
    const files = mutate(
      validCorpus(),
      'docs/specs/foundation/alpha.md',
      '# Rule',
      lines(['# Topic', '', '## Detail', '', '### Explanation', '', '## Nested rule', '', 'Rule.', '', '# Rule']),
    )
    expect(diagnosticCodes(files)).toEqual([])
  })

  test('rejects skipped heading levels', () => {
    const files = mutate(validCorpus(), 'docs/specs/foundation/alpha.md', '# Rule', '### Rule')
    expect(diagnosticCodes(files)).toContain('SPEC211')
  })

  test.each(['AAA-001', 'AAA-NNN', 'AAA-nnn'])('rejects numbered labels in headings: %s', (label) => {
    const files = mutate(validCorpus(), 'docs/specs/foundation/alpha.md', '# Rule', '# ' + label + ' — Rule')
    expect(diagnosticCodes(files)).toContain('SPEC612')
  })

  test('requires the exact section title as hyperlink text', () => {
    const files = mutate(validCorpus(), 'docs/specs/foundation/alpha.md', '[Rule](#rule)', '[Other title](#rule)')
    expect(diagnosticCodes(files)).toEqual(['SPEC611'])
  })

  test('preserves game-data identifiers that are not specification labels', () => {
    const files = mutate(validCorpus(), 'docs/specs/foundation/alpha.md', 'Contract.', 'Contract uses GDR WEAPON-001.')
    expect(diagnosticCodes(files)).toEqual([])
  })

  test('rejects stale section anchors', () => {
    const files = mutate(validCorpus(), 'docs/specs/foundation/alpha.md', '[Rule](#rule)', '[Rule](#removed-rule)')
    expect(diagnosticCodes(files)).toContain('SPEC606')
  })

  test('validates requirement links in prose, lists, tables, and authored non-spec docs', () => {
    let files = mutate(
      validCorpus(),
      'docs/specs/foundation/alpha.md',
      '[Rule](#rule): the same input has the same result.',
      lines([
        '[Rule](#rule): the same input has the same result.',
        '',
        '- [Rule](#rule)',
        '',
        '| Requirement |',
        '| --- |',
        '| [Rule](#rule) |',
      ]),
    )
    files = [
      ...files,
      {
        path: 'docs/notes.md',
        content: '[Rule](specs/foundation/alpha.md#rule)\n',
      },
    ]
    expect(lintSpecifications({ files })).toEqual([])
  })

  test('checks generated requirement references only when requested', () => {
    const files = [...validCorpus(), { path: 'docs/derived/glossary.md', content: 'AAA-001\n' }]
    expect(lintSpecifications({ files })).toEqual([])
    expect(lintSectionReferences({ files }, true).map((diagnostic) => diagnostic.code)).toContain('SPEC612')
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
      'redundant Scope metadata',
      (files: SourceFile[]) =>
        mutate(
          files,
          'docs/specs/foundation/alpha.md',
          '| Status | Draft |',
          '| Status | Draft |\n| Scope | Alpha rules |',
        ),
      'SPEC111',
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
        mutate(files, 'docs/specs/foundation/alpha.md', '# Alpha behavior', '# Acceptance examples'),
      'SPEC209',
    ],
    [
      'removed headings',
      (files: SourceFile[]) =>
        mutate(
          files,
          'docs/specs/foundation/alpha.md',
          '# Alpha behavior',
          '# Terminology\n\nTerms.\n\n# Alpha behavior',
        ),
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
      (files: SourceFile[]) => withRelationships(files, 'docs/specs/foundation/alpha.md', 'None.'),
      'SPEC401',
    ],
    [
      'invalid relationship kind',
      (files: SourceFile[]) =>
        withRelationships(
          files,
          'docs/specs/foundation/alpha.md',
          '- Copies [Specification Conventions](../governance/spec-conventions.md)',
        ),
      'SPEC409',
    ],
    [
      'missing relationship mirror',
      (files: SourceFile[]) =>
        withRelationships(
          files,
          'docs/specs/foundation/alpha.md',
          '- Uses [Specification Conventions](../governance/spec-conventions.md)',
        ),
      'SPEC413',
    ],
    [
      'prohibited formal terminology',
      (files: SourceFile[]) => withGlossary(files, 'docs/specs/foundation/alpha.md', '# Glossary\n\nSource.'),
      'SPEC501',
    ],
    [
      'numbered requirement label',
      (files: SourceFile[]) => mutate(files, 'docs/specs/foundation/alpha.md', '# Rule', '# AAA-001 — Rule'),
      'SPEC612',
    ],
    [
      'unresolved requirement reference',
      (files: SourceFile[]) =>
        mutate(files, 'docs/specs/foundation/alpha.md', '[Rule](#rule): the same', '[Rule](#removed-rule): the same'),
      'SPEC606',
    ],
    [
      'accepted unresolved TODO',
      (files: SourceFile[]) =>
        mutate(
          mutate(files, 'docs/specs/foundation/alpha.md', '| Status | Draft |', '| Status | Accepted |'),
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
    const files = withGlossary(
      validCorpus(),
      'docs/specs/foundation/alpha.md',
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
    const files = withGlossary(
      validCorpus(),
      'docs/specs/foundation/alpha.md',
      lines(['# Glossary', '', '| Term | Definition |', '| --- | --- |', '| Incomplete | |']),
    )
    expect(diagnosticCodes(files)).toContain('SPEC504')
  })

  test('rejects compact ranges and removed requirement references', () => {
    const files = mutate(
      validCorpus(),
      'docs/specs/foundation/alpha.md',
      '[Rule](#rule): the same input',
      'AAA-001–002: the same input',
    )
    const codes = diagnosticCodes(files)
    expect(codes).toContain('SPEC612')
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

function rawCodes(files: readonly SourceFile[]): readonly string[] {
  return lintSpecificationsRaw({ files }).map((diagnostic) => diagnostic.code)
}

function replaceOverview(
  files: readonly SourceFile[],
  path: string,
  edit: (content: string) => string,
): readonly SourceFile[] {
  return files.map((file) => (file.path === path ? { ...file, content: edit(file.content) } : file))
}

describe('family overviews', () => {
  const foundationOverview = 'docs/specs/foundation/about-foundation.md'

  test('accepts overviews without treating them as specifications', () => {
    const files = withOverviews(validCorpus())
    expect(lintSpecificationsRaw({ files })).toEqual([])
    const ids = analyzeSpecificationsRaw({ files }).corpus.specifications.map((specification) => specification.id)
    expect(ids).toEqual(['AAA', 'CONV', 'INDEX'])
  })

  test('requires an overview for every Family with registered specifications', () => {
    const files = withOverviews(validCorpus()).filter((file) => file.path !== foundationOverview)
    const diagnostics = lintSpecificationsRaw({ files })
    expect(diagnostics.map((diagnostic) => [diagnostic.code, diagnostic.path])).toEqual([
      ['SPEC702', foundationOverview],
    ])
  })

  test('rejects a misnamed or misplaced overview', () => {
    const files = [
      ...withOverviews(validCorpus()),
      { path: 'docs/specs/foundation/about-mechanics.md', content: '# About\n' },
    ]
    expect(rawCodes(files)).toEqual(['SPEC701'])
  })

  test('requires the overview title', () => {
    const files = replaceOverview(withOverviews(validCorpus()), foundationOverview, (content) =>
      content.replace('# About the Foundation family', '# Foundation'),
    )
    expect(rawCodes(files)).toEqual(['SPEC703'])
  })

  test('requires the overview sections in order', () => {
    const files = replaceOverview(withOverviews(validCorpus()), foundationOverview, (content) =>
      content.replace('# Why these boundaries', '# Rationale'),
    )
    expect(rawCodes(files)).toEqual(['SPEC704'])
  })

  test('requires exactly one pair of diagram markers inside How they relate', () => {
    const missing = replaceOverview(withOverviews(validCorpus()), foundationOverview, (content) =>
      content.replace(FAMILY_DIAGRAM_END, ''),
    )
    expect(rawCodes(missing)).toEqual(['SPEC705'])
    const misplaced = replaceOverview(
      withOverviews(validCorpus()),
      foundationOverview,
      (content) =>
        content.replace(`${FAMILY_DIAGRAM_START}\n${FAMILY_DIAGRAM_END}\n`, '') +
        `\n\n${FAMILY_DIAGRAM_START}\n${FAMILY_DIAGRAM_END}\n`,
    )
    expect(rawCodes(misplaced)).toEqual(['SPEC705'])
  })

  test('requires a link to every specification in the Family', () => {
    const files = replaceOverview(withOverviews(validCorpus()), foundationOverview, (content) =>
      content.replace('[docs/specs/foundation/alpha.md](alpha.md)', 'Alpha'),
    )
    expect(rawCodes(files)).toEqual(['SPEC706'])
  })

  test('checks overview links', () => {
    const files = replaceOverview(withOverviews(validCorpus()), foundationOverview, (content) =>
      content.replace('Reasons.', '[Missing](missing.md)'),
    )
    expect(rawCodes(files)).toEqual(['SPEC303'])
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
