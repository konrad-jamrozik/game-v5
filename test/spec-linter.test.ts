import { readdir, readFile } from 'node:fs/promises'
import { relative, resolve } from 'node:path'

import { describe, expect, test } from 'vitest'

import { runSpecificationLint } from '../scripts/lint-specs.ts'
import { analyzeSpecifications, lintSectionReferences, lintSpecifications } from '../scripts/spec-linter/linter.ts'
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

        '',
        '# Purpose and boundaries',
        '',
        'Alpha purpose. See [Implicit relationships](../governance/spec-conventions.md#implicit-relationships).',
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
        '## Rule',
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

function withRelationshipDescriptions(files: readonly SourceFile[]): SourceFile[] {
  return files.map((file) => {
    const inventory = /# Relationships\n\n([\s\S]*?)\n# Glossary/.exec(file.content)?.[1] ?? ''
    const descriptions = [...inventory.matchAll(/^- ([^\n]+)$/gm)].map(
      (match) => '- ' + match[1] + ' for the shared contract.',
    )
    return {
      ...file,
      content: descriptions.length
        ? file.content.replace('\n# Relationships', '\n' + descriptions.join('\n') + '\n\n# Relationships')
        : file.content,
    }
  })
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
  return withRelationshipDescriptions([
    ...mutate(
      withBeta,
      alpha.path,
      'No explicit relationships.',
      '- ' + active + ' [Beta](beta.md)\n- ' + passive + ' [Beta](beta.md)',
    ),
    { path: 'docs/specs/foundation/beta.md', content: betaContent },
  ])
}

function mutate(files: readonly SourceFile[], path: string, find: string, replacement: string): SourceFile[] {
  return files.map((file) => ({
    ...file,
    content: file.path === path ? file.content.replace(find, replacement) : file.content,
  }))
}

describe('specification linter', () => {
  test('accepts modeling Types as glossary terms and descriptions', () => {
    const files = mutate(
      validCorpus(),
      'docs/specs/foundation/alpha.md',
      '# Glossary\n\nNone.',
      '# Glossary\n\n| Term | Definition |\n| --- | --- |\n| Type | A named description of data. |\n| Value | Data conforming to a Type. |',
    )
    expect(lintSpecifications({ files })).toEqual([])
  })

  test.each(['Foundation', 'Governance', 'Mechanics', 'Content', 'Interfaces', 'Acceptance'])(
    'accepts narrative requirements without a dedicated section for %s',
    (family) => {
      const directory = family.toLowerCase()
      const files = validCorpus().map((file) => ({
        path: file.path.replace('foundation/alpha.md', directory + '/alpha.md'),
        content: file.content
          .replaceAll('Foundation', family)
          .replaceAll('foundation/alpha.md', directory + '/alpha.md')
          .replace('# Requirements\n\n', '## Explanation\n\nNarrative.\n\n'),
      }))
      expect(diagnosticCodes(files)).toEqual([])
    },
  )

  test('rejects an empty optional Requirements section', () => {
    const files = mutate(
      validCorpus(),
      'docs/specs/foundation/alpha.md',
      '# Edge cases and failure behavior',
      '# Requirements\n\n# Edge cases and failure behavior',
    )
    const narrative = mutate(files, 'docs/specs/foundation/alpha.md', '# Requirements\n\n', '')
    expect(diagnosticCodes(narrative)).toEqual(['SPEC204'])
  })

  test('rejects a misplaced optional Requirements section', () => {
    const files = mutate(validCorpus(), 'docs/specs/foundation/alpha.md', '# Requirements\n\n', '')
    const misplaced = mutate(
      files,
      'docs/specs/foundation/alpha.md',
      '# Open decisions',
      '# Requirements\n\nSeparate contract.\n\n# Open decisions',
    )
    expect(diagnosticCodes(misplaced)).toEqual(['SPEC209'])
  })

  test.each(['Concepts and contract', 'Edge cases and failure behavior'])(
    'still requires %s when requirements are interwoven',
    (section) => {
      const files = mutate(validCorpus(), 'docs/specs/foundation/alpha.md', '# Requirements\n\n', '')
      const missing = mutate(files, 'docs/specs/foundation/alpha.md', '# ' + section, '# Other section')
      expect(diagnosticCodes(missing)).toContain('SPEC209')
    },
  )

  test('allows omission of Open decisions when no unresolved choices remain', () => {
    const files = mutate(validCorpus(), 'docs/specs/foundation/alpha.md', '# Open decisions\n\nNone.', '')
    expect(lintSpecifications({ files })).toEqual([])
  })

  test('rejects a misplaced optional Open decisions section', () => {
    const files = mutate(validCorpus(), 'docs/specs/foundation/alpha.md', '# Open decisions\n\nNone.', '')
    const misplaced = mutate(
      files,
      'docs/specs/foundation/alpha.md',
      '# Concepts and contract',
      '# Open decisions\n\nChoose the numeric representation.\n\n# Concepts and contract',
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

  test.each(['Governance', 'Mechanics', 'Content', 'Interfaces', 'Acceptance'])(
    'still requires the separate acceptance section for standard %s specifications',
    (family) => {
      const directory = family.toLowerCase()
      const files = validCorpus().map((file) => ({
        path: file.path.replace('foundation/alpha.md', `${directory}/alpha.md`),
        content: file.content
          .replaceAll('Foundation', family)
          .replaceAll('foundation/alpha.md', `${directory}/alpha.md`)
          .replace('# Acceptance examples\n\n[Rule](#rule): the same input has the same result.\n\n', ''),
      }))
      expect(diagnosticCodes(files)).toEqual(['SPEC209'])
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

  test('still requires other Foundation sections when examples are embedded', () => {
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
    expect(diagnosticCodes(files)).toEqual(['SPEC209'])
  })

  test('allows Modeling Foundations to omit the separate failure behavior section', () => {
    const files = mutate(
      validCorpus().map((file) => ({
        ...file,
        content: file.content.replaceAll('AAA', 'MODEL').replaceAll('aaa-', 'model-'),
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
      const files = mutate(
        validCorpus(),
        'docs/specs/foundation/alpha.md',
        '# Glossary\n\nNone.',
        `# Glossary\n\n| Term | Definition |\n| --- | --- |\n| Example | A ${term} describing data. |`,
      )
      expect(lintSpecifications({ files })).toEqual([])
    },
  )

  test.each(['', ' A target artifact is also described.'])(
    'distinguishes Constants reference targets from artifact terminology: %s',
    (extra) => {
      const files = mutate(
        validCorpus(),
        'docs/specs/foundation/alpha.md',
        '# Glossary\n\nNone.',
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
    const files = mutate(
      validCorpus(),
      'docs/specs/foundation/alpha.md',
      '# Glossary\n\nNone.',
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
    const result = analyzeSpecifications({ files: withRelationshipDescriptions(files) })
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

  test.each([
    ['', 'missing'],
    ['Uses [Beta](beta.md) for the shared contract.', 'prose outside a bullet'],
    ['1. Uses [Beta](beta.md) for the shared contract.', 'ordered list'],
    ['- Uses [Beta](beta.md)', 'missing explanation'],
    ['- Uses [Beta](beta.md) .', 'punctuation-only explanation'],
    ['- Uses [Beta](beta.md#glossary) for the shared contract.', 'fragment link'],
    ['- Uses [Other](beta.md) for the shared contract.', 'incorrect title'],
    ['- Used by [Beta](beta.md) for the shared contract.', 'wrong direction'],
    ['- Uses [Beta](beta.md) for the shared contract.\n  - Nested detail.', 'nested list'],
    [
      '- Uses [Beta](beta.md) for the shared contract.\n- Uses [Beta](./beta.md) for another contract.',
      'duplicate description',
    ],
  ])('rejects a relationship description with %s (%s)', (replacement, reason) => {
    const files = mutate(
      cycleCorpus('uses'),
      'docs/specs/foundation/alpha.md',
      '- Uses [Beta](beta.md) for the shared contract.',
      replacement,
    )
    expect(diagnosticCodes(files)).toEqual(reason === 'wrong direction' ? ['SPEC416', 'SPEC416'] : ['SPEC416'])
  })

  test('accepts a wrapped description with an equivalent relative document path', () => {
    const files = mutate(
      cycleCorpus('uses'),
      'docs/specs/foundation/alpha.md',
      '- Uses [Beta](beta.md) for the shared contract.',
      '- Uses [Beta](./beta.md) for the shared\n  contract.',
    )
    expect(diagnosticCodes(files)).toEqual([])
  })

  test('requires separate descriptions for different relationship kinds with the same document', () => {
    const files = withRelationshipDescriptions(
      mutate(
        mutate(
          validCorpus(),
          'docs/specs/foundation/alpha.md',
          'No explicit relationships.',
          '- Uses [Game Specification Index](../README.md)\n- Refines [Game Specification Index](../README.md)',
        ),
        'docs/specs/README.md',
        'No explicit relationships.',
        '- Used by [Alpha](foundation/alpha.md)\n- Refined by [Alpha](foundation/alpha.md)',
      ),
    )
    expect(diagnosticCodes(files)).toEqual([])
    const missing = mutate(
      files,
      'docs/specs/foundation/alpha.md',
      '- Refines [Game Specification Index](../README.md) for the shared contract.\n',
      '',
    )
    expect(diagnosticCodes(missing)).toEqual(['SPEC416'])
  })

  test('accepts requirements nested below H2 and H3 topic headings', () => {
    const files = mutate(
      validCorpus(),
      'docs/specs/foundation/alpha.md',
      '## Rule',
      lines(['## Topic', '', '### Detail', '', '#### Rule']),
    )
    expect(lintSpecifications({ files })).toEqual([])
  })

  test('accepts a requirement after a sibling topic heading', () => {
    const files = mutate(validCorpus(), 'docs/specs/foundation/alpha.md', '## Rule', lines(['## Topic', '', '## Rule']))
    expect(diagnosticCodes(files)).toEqual([])
  })

  test('accepts requirements after returning from nested explanatory sections', () => {
    const files = mutate(
      validCorpus(),
      'docs/specs/foundation/alpha.md',
      '## Rule',
      lines(['## Topic', '', '### Detail', '', '#### Explanation', '', '### Nested rule', '', 'Rule.', '', '## Rule']),
    )
    expect(diagnosticCodes(files)).toEqual([])
  })

  test('rejects skipped heading levels', () => {
    const files = mutate(validCorpus(), 'docs/specs/foundation/alpha.md', '## Rule', '#### Rule')
    expect(diagnosticCodes(files)).toContain('SPEC211')
  })

  test.each(['AAA-001', 'AAA-NNN', 'AAA-nnn'])('rejects numbered labels in headings: %s', (label) => {
    const files = mutate(validCorpus(), 'docs/specs/foundation/alpha.md', '## Rule', '## ' + label + ' — Rule')
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
      'numbered requirement label',
      (files: SourceFile[]) => mutate(files, 'docs/specs/foundation/alpha.md', '## Rule', '## AAA-001 — Rule'),
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
