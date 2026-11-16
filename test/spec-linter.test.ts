import { posix } from 'node:path'

import { describe, expect, test } from 'vitest'

import { runDerivedDocumentation, type DerivedDocsIO } from '../scripts/derived-docs.ts'
import { runSpecificationLint as runSpecificationLintRaw } from '../scripts/lint-specs.ts'
import { linkTerms } from '../scripts/link-terms.ts'
import {
  analyzeSpecifications as analyzeSpecificationsRaw,
  lintSectionReferences,
  lintSpecifications as lintSpecificationsRaw,
  termMentions as termMentionsRaw,
} from '../scripts/spec-linter/linter.ts'
import {
  FAMILY_DIAGRAM_END,
  FAMILY_DIAGRAM_START,
  FAMILY_KIND,
  familyDirectoryPath,
  familyOverviewPath,
  isSpecificationFamily,
  kindOverviewPath,
  kindOverviewTitle,
} from '../scripts/spec-linter/overviews.ts'
import type { LintInput, SourceFile, SpecificationFamily, SpecificationKind } from '../scripts/spec-linter/types.ts'

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
    const family = /^\|\s*Family\s*\|\s*([A-Za-z]+(?: [A-Za-z]+)*)\s*\|/m.exec(file.content)?.[1]
    if (!family) continue
    members.set(family, [...(members.get(family) ?? []), file.path])
  }
  const added: SourceFile[] = []
  const kinds = new Map<SpecificationKind, string[]>()
  for (const [family, paths] of members) {
    if (!isSpecificationFamily(family)) continue
    const path = familyOverviewPath('docs/specs', family)
    const kind = FAMILY_KIND[family]
    kinds.set(kind, [...(kinds.get(kind) ?? []), path])
    if (files.some((file) => file.path === path)) continue
    added.push({ path, content: overviewFixture(family, paths, path) })
  }
  for (const [kind, familyOverviews] of kinds) {
    const path = kindOverviewPath('docs/specs', kind)
    if (files.some((file) => file.path === path)) continue
    added.push({
      path,
      content: lines([
        `# ${kindOverviewTitle(kind)}`,
        '',
        ...familyOverviews.map((overview) => `- [${overview}](${posix.relative(posix.dirname(path), overview)})`),
      ]),
    })
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
        '| Family | Conventions |',
        '| Audience | Engine designer, Implementer |',
        '| Owns | Registry. |',

        '',
        '# Overview',
        '',
        'Registry.',
        '',
        '# Navigation',
        '',
        'Links to every specification.',
      ]),
    },
    {
      path: 'docs/specs/governance/conventions/spec-conventions.md',
      content: lines([
        '# Specification Conventions',
        '',
        '| Metadata | Value |',
        '| --- | --- |',
        '| Spec ID | CONV |',
        '| Family | Conventions |',
        '| Audience | Engine designer, Implementer |',
        '| Owns | Conventions. |',

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
      path: 'docs/specs/design/foundation/alpha.md',
      content: lines([
        '# Alpha',
        '',
        '| Metadata | Value |',
        '| --- | --- |',
        '| Spec ID | AAA |',
        '| Family | Foundation |',
        '| Audience | Engine designer, Implementer |',
        '| Owns | Alpha rules. |',
        '| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md) |',

        '',
        '# Overview',
        '',
        'Alpha purpose. See [Implicit relationships](../../governance/conventions/spec-conventions.md#implicit-relationships).',
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

/** Moves the alpha fixture into the given Family. */
function alphaInFamily(family: SpecificationFamily): SourceFile[] {
  const directory = familyDirectoryPath(family)
  return validCorpus().map((file) => ({
    path: file.path.replace('design/foundation/alpha.md', `${directory}/alpha.md`),
    content: file.content
      .replaceAll('Foundation', family)
      .replaceAll('design/foundation/alpha.md', `${directory}/alpha.md`),
  }))
}

function diagnosticCodes(files: readonly SourceFile[]): readonly string[] {
  return lintSpecifications({ files }).map((diagnostic) => diagnostic.code)
}

/** The valid corpus plus Beta, a copy of Alpha. */
function pairCorpus(): SourceFile[] {
  const files = validCorpus()
  const alpha = files[2]
  if (!alpha) return files
  const betaContent = alpha.content.replaceAll('Alpha', 'Beta').replaceAll('AAA', 'BBB').replaceAll('aaa', 'bbb')
  return [...files, { path: 'docs/specs/design/foundation/beta.md', content: betaContent }]
}

function insertSection(content: string, after: readonly string[], section: string): string {
  const headings = [...content.matchAll(/^# .*$/gm)]
  const anchor = headings.filter((match) => after.includes(match[0].slice(2))).at(-1)
  const next = headings.find((match) => (match.index ?? 0) > (anchor?.index ?? 0))
  const position = next?.index ?? content.length
  return content.slice(0, position) + section + '\n\n' + content.slice(position)
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

function glossaryTable(...terms: readonly string[]): string[] {
  return [
    '| Term | Definition |',
    '| --- | --- |',
    ...terms.map((term) => `| ${term} | A ${term.toLowerCase()} definition. |`),
  ]
}

function glossaryGroup(name: string, ...terms: readonly string[]): string[] {
  return [`## ${name}`, '', `Terms about ${name.toLowerCase()}.`, '', ...glossaryTable(...terms), '']
}

function glossaryCodes(glossary: readonly string[]): readonly string[] {
  return diagnosticCodes(
    withGlossary(validCorpus(), 'docs/specs/design/foundation/alpha.md', lines(['# Glossary', '', ...glossary])),
  )
}

describe('specification linter', () => {
  test('accepts modeling Types as glossary terms and descriptions', () => {
    const files = withGlossary(
      validCorpus(),
      'docs/specs/design/foundation/alpha.md',
      '# Glossary\n\n| Term | Definition |\n| --- | --- |\n| Type | A named description of data. |\n| Value | Data conforming to a Type. |',
    )
    expect(lintSpecifications({ files })).toEqual([])
  })

  test.each<SpecificationFamily>([
    'Conventions',
    'Process',
    'Foundation',
    'Mechanics',
    'Content',
    'UI',
    'Autopilot AIs',
    'Mandatory',
    'Guidance',
    'Recipes',
  ])('accepts topic sections for %s', (family) => {
    expect(diagnosticCodes(alphaInFamily(family))).toEqual([])
  })

  test.each<SpecificationFamily>(['Foundation', 'Mandatory', 'Guidance'])(
    'rejects a Binding metadata row in %s',
    (family) => {
      const files = alphaInFamily(family).map((file) => ({
        ...file,
        content: file.path.endsWith('/alpha.md')
          ? file.content.replace('| Owns | Alpha rules. |', '| Owns | Alpha rules. |\n| Binding | Mandatory |')
          : file.content,
      }))
      expect(diagnosticCodes(files)).toEqual(['SPEC114'])
    },
  )

  test.each([
    [
      'missing',
      '| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md) |\n',
      '',
    ],
    [
      'extra',
      '| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md) |',
      '| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Alpha](alpha.md) |',
    ],
  ])('rejects a %s link in the Conventions row', (_reason, find, replacement) => {
    const files = mutate(validCorpus(), 'docs/specs/design/foundation/alpha.md', find, replacement)
    expect(diagnosticCodes(files)).toContain('SPEC115')
  })

  test('requires Design Specification Conventions in the Conventions row of a Design specification', () => {
    const designConventions: SourceFile = {
      path: 'docs/specs/governance/conventions/design-spec-conventions.md',
      content: lines([
        '# Design Specification Conventions',
        '',
        '| Metadata | Value |',
        '| --- | --- |',
        '| Spec ID | DCONV |',
        '| Family | Conventions |',
        '| Audience | Engine designer, Implementer |',
        '| Owns | Design rules. |',
        '| Conventions | [Specification Conventions](spec-conventions.md) |',
        '',
        '# Overview',
        '',
        'Design rules.',
      ]),
    }
    const files = [...validCorpus(), designConventions]
    expect(diagnosticCodes(files)).toEqual(['SPEC115'])
    const fixed = mutate(
      files,
      'docs/specs/design/foundation/alpha.md',
      '| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md) |',
      '| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |',
    )
    expect(diagnosticCodes(fixed)).toEqual([])
  })

  test('accepts a Prohibited synonyms column and keeps its words out of the prohibited-term scan', () => {
    const files = withGlossary(
      validCorpus(),
      'docs/specs/design/foundation/alpha.md',
      '# Glossary\n\n| Term | Definition | Prohibited synonyms |\n| --- | --- | --- |\n| Rulebook | A set of rules. | Relationship type; source |\n| Page | A part of a Rulebook. | |',
    )
    expect(diagnosticCodes(files)).toEqual([])
    const glossary = analyzeSpecifications({ files }).corpus.glossary
    expect(glossary.find((entry) => entry.term === 'Rulebook')?.prohibitedSynonymsMarkdown).toBe(
      'Relationship type; source',
    )
  })

  test('rejects a Glossary whose tables disagree about the Prohibited synonyms column', () => {
    const files = withGlossary(
      validCorpus(),
      'docs/specs/design/foundation/alpha.md',
      lines([
        '# Glossary',
        '',
        ...glossaryGroup('Rulebooks', 'Rulebook', 'Page'),
        '## Readers',
        '',
        'Terms about readers.',
        '',
        '| Term | Definition | Prohibited synonyms |',
        '| --- | --- | --- |',
        '| Reader | A reader definition. | Viewer |',
        '| Owner | An owner definition. | |',
      ]),
    )
    expect(diagnosticCodes(files)).toEqual(['SPEC507'])
  })

  test('rejects an empty topic section', () => {
    const files = mutate(
      validCorpus(),
      'docs/specs/design/foundation/alpha.md',
      '# Edge cases and failure behavior',
      '# Empty topic\n\n# Edge cases and failure behavior',
    )
    expect(diagnosticCodes(files)).toEqual(['SPEC204'])
  })

  test('rejects a topic section after the closing sections', () => {
    const misplaced = mutate(
      validCorpus(),
      'docs/specs/design/foundation/alpha.md',
      '[Rule](#rule): the same input has the same result.',
      '[Rule](#rule): the same input has the same result.\n\n# Late topic\n\nSeparate contract.',
    )
    expect(diagnosticCodes(misplaced)).toEqual(['SPEC209'])
  })

  test.each(['Concepts and contract', 'Requirements', 'Details', 'Specification'])(
    'rejects the generic topic heading %s',
    (heading) => {
      const files = mutate(validCorpus(), 'docs/specs/design/foundation/alpha.md', '# Alpha behavior', '# ' + heading)
      expect(diagnosticCodes(files)).toEqual(['SPEC212'])
    },
  )

  test.each([
    ['Alpha behavior', 'Contract.'],
    ['Edge cases and failure behavior', 'Failures are defined.'],
  ])('allows omitting %s when it does not apply', (section, body) => {
    const files = mutate(
      validCorpus(),
      'docs/specs/design/foundation/alpha.md',
      '# ' + section + '\n\n' + body + '\n\n',
      '',
    )
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
      'docs/specs/design/foundation/alpha.md',
      '| Audience | Engine designer, Implementer |\n',
      value ? '| Audience | ' + value + ' |\n' : '',
    )
    expect(diagnosticCodes(files)).toEqual(['SPEC112'])
  })

  test('requires Overview', () => {
    const files = mutate(validCorpus(), 'docs/specs/design/foundation/alpha.md', '# Overview', '# Introduction')
    expect(diagnosticCodes(files)).toContain('SPEC206')
  })

  test.each([
    ['# TODOs\n\nNone.', 'None'],
    ['# Edge cases and failure behavior\n\nNot applicable — this document defines no operations.', 'Not applicable'],
    ['# Notes\n\nN/A', 'N/A'],
  ])('rejects a placeholder section instead of omission (%s)', (section, _name) => {
    const files = mutate(
      validCorpus(),
      'docs/specs/design/foundation/alpha.md',
      '# Edge cases and failure behavior\n\nFailures are defined.',
      section.startsWith('# Edge') ? section : 'Failures are defined.\n\n' + section,
    )
    expect(diagnosticCodes(files)).toContain('SPEC205')
  })

  test('rejects a misplaced optional TODOs section', () => {
    const misplaced = mutate(
      validCorpus(),
      'docs/specs/design/foundation/alpha.md',
      '# Alpha behavior',
      '# TODOs\n\n- TODO: Choose the numeric representation.\n\n# Alpha behavior',
    )
    expect(diagnosticCodes(misplaced)).toEqual(['SPEC209'])
  })

  test('accepts Foundation examples embedded beside concepts', () => {
    const files = mutate(
      mutate(
        validCorpus(),
        'docs/specs/design/foundation/alpha.md',
        'Contract.',
        'Contract. For example, [Rule](#rule): the same input has the same result.',
      ),
      'docs/specs/design/foundation/alpha.md',
      '# Acceptance examples\n\n[Rule](#rule): the same input has the same result.\n\n',
      '',
    )
    expect(lintSpecifications({ files })).toEqual([])
  })

  test.each<SpecificationFamily>([
    'Conventions',
    'Process',
    'Mechanics',
    'Content',
    'UI',
    'Autopilot AIs',
    'Mandatory',
  ])('allows omitting the separate acceptance section for %s specifications', (family) => {
    const files = alphaInFamily(family).map((file) => ({
      ...file,
      content: file.content.replace(
        '# Acceptance examples\n\n[Rule](#rule): the same input has the same result.\n\n',
        '',
      ),
    }))
    expect(diagnosticCodes(files)).toEqual([])
  })

  test('rejects a misplaced optional Foundation acceptance section', () => {
    const files = mutate(
      validCorpus(),
      'docs/specs/design/foundation/alpha.md',
      '# Edge cases and failure behavior\n\nFailures are defined.\n\n# Acceptance examples\n\n[Rule](#rule): the same input has the same result.',
      '# Acceptance examples\n\n[Rule](#rule): the same input has the same result.\n\n# Edge cases and failure behavior\n\nFailures are defined.',
    )
    expect(diagnosticCodes(files)).toEqual(['SPEC209'])
  })

  test('rejects an empty optional Foundation acceptance section', () => {
    const files = mutate(
      validCorpus(),
      'docs/specs/design/foundation/alpha.md',
      '[Rule](#rule): the same input has the same result.',
      '',
    )
    expect(diagnosticCodes(files)).toEqual(['SPEC204'])
  })

  test('allows omitting several sections that do not apply', () => {
    const files = mutate(
      mutate(
        validCorpus(),
        'docs/specs/design/foundation/alpha.md',
        '# Acceptance examples\n\n[Rule](#rule): the same input has the same result.\n\n',
        '',
      ),
      'docs/specs/design/foundation/alpha.md',
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
      'docs/specs/design/foundation/alpha.md',
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
        'docs/specs/design/foundation/alpha.md',
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
        'docs/specs/design/foundation/alpha.md',
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
      'docs/specs/design/foundation/alpha.md',
      `# Glossary\n\n| Term | Definition |\n| --- | --- |\n| Example | A ${term}. |`,
    )
    expect(diagnosticCodes(files)).toContain('SPEC501')
  })

  test('rejects a Relationships section', () => {
    const files = mutate(
      validCorpus(),
      'docs/specs/design/foundation/alpha.md',
      '# Alpha behavior',
      '# Relationships\n\n- Uses [Game Specification Index](../../README.md)\n\n# Alpha behavior',
    )
    expect(diagnosticCodes(files)).toContain('SPEC401')
  })

  test('accepts a valid in-memory corpus', () => {
    expect(lintSpecifications({ files: validCorpus() })).toEqual([])
  })

  test('accepts ordinary bullets in Overview', () => {
    const files = mutate(
      validCorpus(),
      'docs/specs/design/foundation/alpha.md',
      'Alpha purpose.',
      'Alpha purpose.\n\n- Uses of [Game Specification Index](../../README.md) are informative.\n',
    )
    expect(diagnosticCodes(files)).toEqual([])
  })

  test('accepts requirements nested below H2 and H3 topic headings', () => {
    const files = mutate(
      validCorpus(),
      'docs/specs/design/foundation/alpha.md',
      '# Rule',
      lines(['# Topic', '', 'Lead.', '', '## Detail', '', 'Lead.', '', '### Rule']),
    )
    expect(lintSpecifications({ files })).toEqual([])
  })

  test('accepts a requirement after a sibling topic heading', () => {
    const files = mutate(
      validCorpus(),
      'docs/specs/design/foundation/alpha.md',
      '# Rule',
      lines(['# Topic', '', 'Topic text.', '', '# Rule']),
    )
    expect(diagnosticCodes(files)).toEqual([])
  })

  test('accepts requirements after returning from nested explanatory sections', () => {
    const files = mutate(
      validCorpus(),
      'docs/specs/design/foundation/alpha.md',
      '# Rule',
      lines([
        '# Topic',
        '',
        'Lead.',
        '',
        '## Detail',
        '',
        'Lead.',
        '',
        '### Explanation',
        '',
        '## Nested rule',
        '',
        'Rule.',
        '',
        '# Rule',
      ]),
    )
    expect(diagnosticCodes(files)).toEqual([])
  })

  test('rejects skipped heading levels', () => {
    const files = mutate(validCorpus(), 'docs/specs/design/foundation/alpha.md', '# Rule', '### Rule')
    expect(diagnosticCodes(files)).toContain('SPEC211')
  })

  test.each(['AAA-001', 'AAA-NNN', 'AAA-nnn'])('rejects numbered labels in headings: %s', (label) => {
    const files = mutate(validCorpus(), 'docs/specs/design/foundation/alpha.md', '# Rule', '# ' + label + ' — Rule')
    expect(diagnosticCodes(files)).toContain('SPEC612')
  })

  test('requires the exact section title as hyperlink text', () => {
    const files = mutate(
      validCorpus(),
      'docs/specs/design/foundation/alpha.md',
      '[Rule](#rule)',
      '[Other title](#rule)',
    )
    expect(diagnosticCodes(files)).toEqual(['SPEC611'])
  })

  test('preserves game-data identifiers that are not specification labels', () => {
    const files = mutate(
      validCorpus(),
      'docs/specs/design/foundation/alpha.md',
      'Contract.',
      'Contract uses GDR WEAPON-001.',
    )
    expect(diagnosticCodes(files)).toEqual([])
  })

  test('rejects stale section anchors', () => {
    const files = mutate(
      validCorpus(),
      'docs/specs/design/foundation/alpha.md',
      '[Rule](#rule)',
      '[Rule](#removed-rule)',
    )
    expect(diagnosticCodes(files)).toContain('SPEC606')
  })

  test('validates requirement links in prose, lists, tables, and authored non-spec docs', () => {
    let files = mutate(
      validCorpus(),
      'docs/specs/design/foundation/alpha.md',
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
        content: '[Rule](specs/design/foundation/alpha.md#rule)\n',
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
      'Status metadata',
      (files: SourceFile[]) =>
        mutate(
          files,
          'docs/specs/design/foundation/alpha.md',
          '| Owns | Alpha rules. |',
          '| Owns | Alpha rules. |\n| Status | Draft |',
        ),
      'SPEC105',
    ],
    [
      'missing Owns metadata',
      (files: SourceFile[]) => mutate(files, 'docs/specs/design/foundation/alpha.md', '| Owns | Alpha rules. |\n', ''),
      'SPEC113',
    ],
    [
      'redundant Scope metadata',
      (files: SourceFile[]) =>
        mutate(
          files,
          'docs/specs/design/foundation/alpha.md',
          '| Owns | Alpha rules. |',
          '| Owns | Alpha rules. |\n| Scope | Alpha rules |',
        ),
      'SPEC111',
    ],
    [
      'invalid metadata family',
      (files: SourceFile[]) =>
        mutate(files, 'docs/specs/design/foundation/alpha.md', '| Family | Foundation |', '| Family | Unknown |'),
      'SPEC109',
    ],
    [
      'family and directory disagreement',
      (files: SourceFile[]) =>
        mutate(files, 'docs/specs/design/foundation/alpha.md', '| Family | Foundation |', '| Family | Mechanics |'),
      'SPEC110',
    ],
    [
      'standard heading order',
      (files: SourceFile[]) =>
        mutate(files, 'docs/specs/design/foundation/alpha.md', '# Alpha behavior', '# Acceptance examples'),
      'SPEC209',
    ],
    [
      'removed headings',
      (files: SourceFile[]) =>
        mutate(
          files,
          'docs/specs/design/foundation/alpha.md',
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
          'docs/specs/design/foundation/alpha.md',
          '../../governance/conventions/spec-conventions.md#implicit-relationships',
          'missing.md#implicit-relationships',
        ),
      'SPEC303',
    ],
    [
      'broken anchors',
      (files: SourceFile[]) =>
        mutate(files, 'docs/specs/design/foundation/alpha.md', '#implicit-relationships', '#missing-anchor'),
      'SPEC304',
    ],
    [
      'prohibited formal terminology',
      (files: SourceFile[]) => withGlossary(files, 'docs/specs/design/foundation/alpha.md', '# Glossary\n\nSource.'),
      'SPEC501',
    ],
    [
      'numbered requirement label',
      (files: SourceFile[]) => mutate(files, 'docs/specs/design/foundation/alpha.md', '# Rule', '# AAA-001 — Rule'),
      'SPEC612',
    ],
    [
      'unresolved requirement reference',
      (files: SourceFile[]) =>
        mutate(
          files,
          'docs/specs/design/foundation/alpha.md',
          '[Rule](#rule): the same',
          '[Rule](#removed-rule): the same',
        ),
      'SPEC606',
    ],
  ])('rejects %s', (_name, change, expectedCode) => {
    expect(diagnosticCodes(change(validCorpus()))).toContain(expectedCode)
  })

  test('produces stable sorted diagnostics', () => {
    const files = mutate(
      mutate(validCorpus(), 'docs/specs/design/foundation/alpha.md', '# Alpha', '# ALPHA'),
      'docs/specs/design/foundation/alpha.md',
      '| Owns | Alpha rules. |',
      '| Owns | Alpha rules. |\n| Status | Draft |',
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

  test('rejects duplicate glossary ownership and aliases', () => {
    const files = withGlossary(
      validCorpus(),
      'docs/specs/design/foundation/alpha.md',
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
      'docs/specs/design/foundation/alpha.md',
      lines(['# Glossary', '', '| Term | Definition |', '| --- | --- |', '| Incomplete | |']),
    )
    expect(diagnosticCodes(files)).toContain('SPEC504')
  })

  describe('TODOs', () => {
    const alpha = 'docs/specs/design/foundation/alpha.md'
    const acceptanceEnd = '[Rule](#rule): the same input has the same result.'

    function withTodos(items: readonly string[]): SourceFile[] {
      return mutate(validCorpus(), alpha, acceptanceEnd, lines([acceptanceEnd, '', '# TODOs', '', ...items]))
    }

    test.each([
      [['- TODO: Choose the numeric representation.']],
      [['- TODO (later): Skill gained from a Combat.']],
      [['- TODO: Choose the numeric representation.', '- TODO (later): Skill gained from a Combat.']],
    ])('accepts a specification with TODO items %j', (items) => {
      expect(diagnosticCodes(withTodos(items))).toEqual([])
    })

    test.each([
      ['paragraph', 'TODO: Complete the contract.'],
      ['later paragraph', 'TODO (later): Complete the contract.'],
      ['list item', '- TODO: Complete the contract.'],
    ])('rejects a TODO %s outside the TODOs section', (_name, todo) => {
      expect(diagnosticCodes(mutate(validCorpus(), alpha, 'Contract.', `Contract.\n\n${todo}`))).toEqual(['SPEC607'])
    })

    test.each([
      ['a blockquote', '> TODO: Define the per-turn completion probability.'],
      ['a code span', '`TODO:` marks an item that blocks acceptance.'],
      ['a fenced code block', '```text\nTODO: Define the probability.\n```'],
      ['inline quoted text', 'Avoid vague placeholders; e.g., "TODO: implement investigations."'],
    ])('does not treat TODO text in %s as a TODO', (_name, text) => {
      expect(diagnosticCodes(mutate(validCorpus(), alpha, 'Contract.', `Contract.\n\n${text}`))).toEqual([])
    })

    test.each([
      ['a non-TODO item', ['- TODO: Choose the representation.', '- Choose the rounding.']],
      ['prose', ['Choose the representation.', '', '- TODO: Choose the representation.']],
      ['no TODO item', ['- Choose the representation.']],
    ])('rejects a TODOs section with %s', (_name, items) => {
      expect(diagnosticCodes(withTodos(items))).toContain('SPEC608')
    })

    test('rejects an empty TODOs section', () => {
      expect(diagnosticCodes(withTodos([]))).toEqual(['SPEC204'])
    })

    test('requires renaming Open decisions to TODOs', () => {
      const files = mutate(
        validCorpus(),
        alpha,
        acceptanceEnd,
        lines([acceptanceEnd, '', '# Open decisions', '', '- Choose the numeric representation.']),
      )
      const diagnostics = lintSpecifications({ files })
      expect(diagnostics.map((diagnostic) => diagnostic.code)).toEqual(['SPEC213'])
      expect(diagnostics[0]?.message).toContain('rename it to "# TODOs"')
    })
  })

  describe('subject before document', () => {
    const alpha = 'docs/specs/design/foundation/alpha.md'

    const overviewParagraph =
      'Alpha purpose. See [Implicit relationships](../../governance/conventions/spec-conventions.md#implicit-relationships).'

    /** Builds an Overview of the given word count, including one code span, plus fenced code that is not counted. */
    function overviewOf(words: number): SourceFile[] {
      const text = Array.from({ length: words - 1 }, (_, index) => `word${index}`).join(' ')
      return mutate(
        validCorpus(),
        alpha,
        overviewParagraph,
        `${text} \`code\`\n\n\`\`\`text\nignored fenced words\n\`\`\``,
      )
    }

    test('accepts an Overview of 200 words and rejects one of 201 words', () => {
      expect(diagnosticCodes(overviewOf(200))).toEqual([])
      const diagnostics = lintSpecifications({ files: overviewOf(201) })
      expect(diagnostics.map((diagnostic) => diagnostic.code)).toEqual(['SPEC214'])
      expect(diagnostics[0]?.message).toBe('Overview has 201 words; it must have at most 200.')
    })

    test('counts Overview words in lists and tables', () => {
      const filler = Array.from({ length: 100 }, (_, index) => `word${index}`).join(' ')
      const files = mutate(
        validCorpus(),
        alpha,
        overviewParagraph,
        lines([`- ${filler}`, '', '| Column |', '| --- |', `| ${filler} |`]),
      )
      expect(diagnosticCodes(files)).toEqual(['SPEC214'])
    })

    test.each([
      'This document defines',
      'this document states',
      'This document owns',
      'This document describes',
      'This document specifies',
      'Alpha does not own',
      'The ownership pointer',
      'This document refines',
      'Alpha follows constraints on',
      'Alphas follow constraints on',
    ])('rejects the document-describing phrase "%s"', (phrase) => {
      const files = mutate(validCorpus(), alpha, 'Contract.', `${phrase} the contract.`)
      expect(diagnosticCodes(files)).toEqual(['SPEC215'])
    })

    test.each([
      ['straight quotes', 'Do not write "this document defines the contract".'],
      ['curly quotes', 'Do not write “Alpha does not own payment”.'],
      ['a code span', 'Do not write `this document owns`.'],
      ['a blockquote', '> This document describes the contract.'],
    ])('does not flag a document-describing phrase inside %s', (_name, text) => {
      expect(diagnosticCodes(mutate(validCorpus(), alpha, 'Contract.', `Contract.\n\n${text}`))).toEqual([])
    })

    test.each([
      ['a list', '- First rule.'],
      ['a table', '| Column |\n| --- |\n| Value |'],
      ['a code block', '```text\ncode\n```'],
      ['a subsection', '## Alpha detail\n\nDetail.'],
    ])('rejects a topic section that opens with %s instead of a lead', (_name, text) => {
      const diagnostics = lintSpecifications({ files: mutate(validCorpus(), alpha, 'Contract.', text) })
      expect(diagnostics.map((diagnostic) => diagnostic.code)).toEqual(['SPEC216'])
      expect(diagnostics[0]?.message).toBe(
        'Section "Alpha behavior" must open with a lead paragraph before any list, table, or subsection.',
      )
    })

    test('rejects a topic subsection that opens without a lead', () => {
      const files = mutate(validCorpus(), alpha, 'Contract.', 'Lead.\n\n## Alpha detail\n\n- First rule.')
      expect(diagnosticCodes(files)).toEqual(['SPEC216'])
    })

    test('accepts topic sections and subsections that open with a lead', () => {
      const files = mutate(
        validCorpus(),
        alpha,
        'Contract.',
        'Lead.\n\n- First rule.\n\n## Alpha detail\n\nLead.\n\n- Rule.',
      )
      expect(diagnosticCodes(files)).toEqual([])
    })

    test('does not require a lead in framing or closing sections', () => {
      const files = mutate(validCorpus(), alpha, 'Alpha purpose.', '- Alpha purpose.\n\nAlpha.')
      expect(diagnosticCodes(files)).toEqual([])
    })

    test('flags a document-describing phrase in Overview and tables', () => {
      const files = mutate(
        mutate(validCorpus(), alpha, 'Alpha purpose.', 'This document owns Alpha.'),
        alpha,
        'Contract.',
        'Contract.\n\n| Column |\n| --- |\n| Alpha does not own Beta. |',
      )
      expect(diagnosticCodes(files)).toEqual(['SPEC215', 'SPEC215'])
    })

    test.each([
      ['no introduction', []],
      ['one sentence', ['These terms are specific to Alpha.']],
      [
        'two sentences with e.g. and i.e.',
        [
          'These terms, e.g. Apple, are specific to Alpha, i.e. its rules.',
          'General terms are in the [Specification Conventions glossary](../../governance/conventions/spec-conventions.md#glossary).',
        ],
      ],
    ])('accepts a Glossary introduction with %s', (_name, introduction) => {
      expect(glossaryCodes([...introduction, '', ...glossaryTable('Apple')])).toEqual([])
    })

    test.each([
      ['three sentences', ['These terms are specific to Alpha. General terms are elsewhere. Refunds are elsewhere.']],
      ['three paragraphs', ['One sentence.', '', 'Another sentence.', '', 'A third without a period']],
      [
        'three sentences before groups',
        [
          'One sentence. Another sentence! A third?',
          '',
          ...glossaryGroup('Fruit', 'Apple', 'Pear'),
          ...glossaryGroup('Tools', 'Hammer', 'Saw'),
        ],
      ],
    ])('rejects a Glossary introduction with %s', (_name, introduction) => {
      const glossary = introduction.some((line) => line.startsWith('## '))
        ? introduction
        : [...introduction, '', ...glossaryTable('Apple')]
      expect(glossaryCodes(glossary)).toEqual(['SPEC506'])
    })
  })

  describe('glossary groups', () => {
    test('accepts one ungrouped table', () => {
      expect(glossaryCodes(glossaryTable('Apple'))).not.toContain('SPEC505')
    })

    test('accepts two or more groups of at least two terms', () => {
      expect(
        glossaryCodes([
          'Shared terms are owned elsewhere.',
          '',
          ...glossaryGroup('Fruit', 'Apple', 'Pear'),
          ...glossaryGroup('Tools', 'Hammer', 'Saw'),
        ]),
      ).not.toContain('SPEC505')
    })

    test.each([
      ['two ungrouped tables', [...glossaryTable('Apple'), '', ...glossaryTable('Pear')]],
      [
        'a table outside groups',
        [
          ...glossaryTable('Apple'),
          '',
          ...glossaryGroup('Fruit', 'Pear', 'Plum'),
          ...glossaryGroup('Tools', 'Hammer', 'Saw'),
        ],
      ],
      ['a single group', glossaryGroup('Fruit', 'Apple', 'Pear')],
      ['a one-term group', [...glossaryGroup('Fruit', 'Apple'), ...glossaryGroup('Tools', 'Hammer', 'Saw')]],
      [
        'a group without a description',
        ['## Fruit', '', ...glossaryTable('Apple', 'Pear'), '', ...glossaryGroup('Tools', 'Hammer', 'Saw')],
      ],
      [
        'a group with two tables',
        [
          ...glossaryGroup('Fruit', 'Apple', 'Pear'),
          ...glossaryTable('Plum', 'Fig'),
          '',
          ...glossaryGroup('Tools', 'Hammer', 'Saw'),
        ],
      ],
      [
        'an H3 heading',
        [...glossaryGroup('Fruit', 'Apple', 'Pear'), '### Citrus', '', ...glossaryGroup('Tools', 'Hammer', 'Saw')],
      ],
    ])('rejects %s', (_name, glossary) => {
      expect(glossaryCodes(glossary)).toContain('SPEC505')
    })
  })

  test('rejects compact ranges and removed requirement references', () => {
    const files = mutate(
      validCorpus(),
      'docs/specs/design/foundation/alpha.md',
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
        mutate(
          validCorpus(),
          'docs/specs/design/foundation/alpha.md',
          '| Owns | Alpha rules. |',
          '| Owns | Alpha rules. |\n| Status | Draft |',
        ),
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
  const foundationOverview = 'docs/specs/design/foundation/about-foundation.md'

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
      ['SPEC303', 'docs/specs/design/about-design.md'],
      ['SPEC702', foundationOverview],
    ])
  })

  test('requires an overview for every Specification kind with registered specifications', () => {
    const designOverview = 'docs/specs/design/about-design.md'
    const files = withOverviews(validCorpus()).filter((file) => file.path !== designOverview)
    expect(lintSpecificationsRaw({ files }).map((diagnostic) => [diagnostic.code, diagnostic.path])).toEqual([
      ['SPEC702', designOverview],
    ])
  })

  test('requires the Specification kind overview title and links to every Family overview', () => {
    const designOverview = 'docs/specs/design/about-design.md'
    const files = withOverviews(validCorpus()).map((file) =>
      file.path === designOverview ? { ...file, content: '# About design\n' } : file,
    )
    expect(rawCodes(files)).toEqual(['SPEC703', 'SPEC706'])
  })

  test('rejects a misnamed or misplaced overview', () => {
    const files = [
      ...withOverviews(validCorpus()),
      { path: 'docs/specs/design/foundation/about-mechanics.md', content: '# About\n' },
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
      content.replace('[docs/specs/design/foundation/alpha.md](alpha.md)', 'Alpha'),
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

describe('derived documentation on a sample corpus', () => {
  const prettierOptions = { printWidth: 120, singleQuote: true, semi: false, tabWidth: 2 }

  test('analysis is independent of input ordering and line endings', () => {
    const files = withOverviews(validCorpus())
    const baseline = analyzeSpecificationsRaw({ files })
    expect(baseline.diagnostics).toEqual([])
    expect(analyzeSpecificationsRaw({ files: files.toReversed() })).toEqual(baseline)
    const crlf = files.map((file) => ({ ...file, content: file.content.replace(/\r?\n/g, '\r\n') }))
    expect(analyzeSpecificationsRaw({ files: crlf })).toEqual(baseline)
  })

  test('check mode accepts fresh output, reports a stale overview diagram, and never writes', async () => {
    const sources = withOverviews(validCorpus())
    let generated: ReadonlyMap<string, string> = new Map()
    const errors: string[] = []
    const generateIo: DerivedDocsIO = {
      actualOutputs: new Map(),
      writeOutputs: (outputs) => {
        generated = new Map(outputs)
        return Promise.resolve()
      },
      writeError: (message) => errors.push(message),
    }
    expect(await runDerivedDocumentation(sources, ['generate'], generateIo, prettierOptions)).toBe(0)
    expect(errors).toEqual([])

    const overviewPaths = sources.map((file) => file.path).filter((path) => /\/about-[^/]*\.md$/.test(path))
    expect(overviewPaths.length).toBeGreaterThan(0)
    const fresh = sources.map((file) => ({ ...file, content: generated.get(file.path) ?? file.content }))
    let writes = 0
    const checkIo: DerivedDocsIO = {
      actualOutputs: new Map([...generated].filter(([path]) => !overviewPaths.includes(path))),
      writeOutputs: () => {
        writes += 1
        return Promise.resolve()
      },
      writeError: (message) => errors.push(message),
    }
    expect(await runDerivedDocumentation(fresh, ['check'], checkIo, prettierOptions)).toBe(0)
    expect(errors).toEqual([])

    const stalePath = overviewPaths[0] ?? ''
    const stale = fresh.map((file) =>
      file.path === stalePath
        ? { ...file, content: file.content.replace(FAMILY_DIAGRAM_END, `Stale content.\n\n${FAMILY_DIAGRAM_END}`) }
        : file,
    )
    expect(await runDerivedDocumentation(stale, ['check'], checkIo, prettierOptions)).toBe(1)
    expect(errors).toEqual([`${stalePath}: generated documentation is stale; run npm run docs:generate.`])
    expect(writes).toBe(0)
  })

  test('invalid sources block generation without writing', async () => {
    let writes = 0
    const errors: string[] = []
    const io: DerivedDocsIO = {
      actualOutputs: new Map(),
      writeOutputs: () => {
        writes += 1
        return Promise.resolve()
      },
      writeError: (message) => errors.push(message),
    }
    expect(await runDerivedDocumentation([], ['generate'], io, prettierOptions)).toBe(1)
    expect(writes).toBe(0)
    expect(errors.length).toBeGreaterThan(0)
  })
})

describe('term mentions', () => {
  /** Alpha owns Widget and Gear in its Parts group and Hammer and Wrench in its Tools group; Beta's Rule section says the given text. */
  function mentionCorpus(betaRule: string, alphaRule = 'Alpha must be deterministic.'): SourceFile[] {
    return pairCorpus().map((file) => {
      if (file.path.endsWith('/alpha.md')) {
        return {
          ...file,
          content: insertSection(
            file.content,
            ['Overview'],
            lines([
              '# Glossary',
              '',
              '## Parts',
              '',
              'What Alpha is made of.',
              '',
              '| Term | Definition |',
              '| --- | --- |',
              '| Widget | A thing Alpha has. |',
              '| Gear | Another thing Alpha has. |',
              '',
              '## Tools',
              '',
              'What Alpha is made with.',
              '',
              '| Term | Definition |',
              '| --- | --- |',
              '| Hammer | A tool Alpha uses. |',
              '| Wrench | Another tool Alpha uses. |',
            ]),
          ).replace('Alpha must be deterministic.', alphaRule),
        }
      }
      if (file.path.endsWith('/beta.md')) {
        return { ...file, content: file.content.replace('Beta must be deterministic.', betaRule) }
      }
      return file
    })
  }

  function mentions(betaRule: string): readonly string[] {
    return termMentionsRaw({ files: withOverviews(mentionCorpus(betaRule)) }).map(
      (mention) => `${posix.basename(mention.specificationPath)} ${mention.text} ${mention.link} #${mention.anchor}`,
    )
  }

  test('reports only the first mention of a term another specification owns', () => {
    expect(mentions('Each Widget is counted, and every Widget is kept.')).toEqual(['beta.md Widget none #parts'])
  })

  test('accepts a first mention linked to the Glossary group of its owner', () => {
    expect(mentions('Each [Widget](alpha.md#parts) is counted.')).toEqual(['beta.md Widget correct #parts'])
  })

  test('skips a capitalized one-word term that opens a sentence', () => {
    expect(mentions('Widget counting is exact. Each Widgets total is kept.')).toEqual(['beta.md Widgets none #parts'])
  })

  test('skips terms of Governance specifications in other specifications', () => {
    expect(mentions('Each Convention is followed.')).toEqual([])
  })

  function linkedBeta(betaRule: string): string | undefined {
    const files = withOverviews(mentionCorpus(betaRule))
    return linkTerms(files).find((file) => file.path.endsWith('/beta.md'))?.content
  }

  test('links an unlinked first mention to the Glossary group of its owner', () => {
    expect(linkedBeta('Each Widget is counted, and every Widget is kept.')).toContain(
      'Each [Widget](alpha.md#parts) is counted, and every Widget is kept.',
    )
  })

  test('corrects the anchor of a first mention linked to its owner elsewhere', () => {
    expect(linkedBeta('Each [Widget](alpha.md#tools) is counted.')).toContain(
      'Each [Widget](alpha.md#parts) is counted.',
    )
  })

  test('rejects an unlinked first mention and a link to the wrong anchor', () => {
    const termCodes = (rule: string): readonly string[] => diagnosticCodes(mentionCorpus(rule))
    expect(termCodes('Each Widget is counted.')).toEqual(['SPEC508'])
    expect(termCodes('Each [Widget](alpha.md#tools) is counted.')).toEqual(['SPEC509'])
    expect(termCodes('Each [Widget](alpha.md#parts) is counted.')).toEqual([])
  })

  test.each([
    ['an e.g. clause', 'Things are counted, e.g. a Widget. Counting is exact.'],
    ['a paragraph that opens with E.g.', 'Counting is exact.\n\nE.g., two things are counted. The second is a Widget.'],
    ['the block after an E.g. paragraph ending with a colon', 'Counting is exact.\n\nE.g., these:\n\n- one Widget'],
    [
      'a table column headed Example',
      'Counting is exact.\n\n| Rule | Example |\n| --- | --- |\n| Count all | one Widget |',
    ],
    ['an informative rationale', 'Counting is exact.\n\n**Informative rationale:** a Widget is easy to count.'],
  ])('does not count a mention in %s', (_name, rule) => {
    expect(mentions(rule)).toEqual([])
  })

  test('does not count a mention inside a link to a section of the owner', () => {
    expect(mentions('Counting follows [Widget rules](alpha.md#rule).')).toEqual([])
  })

  test('rejects a cycle of References', () => {
    const files = mentionCorpus(
      'Each [Widget](alpha.md#parts) is counted.',
      'Each [Sprocket](beta.md#glossary) turns.',
    ).map((file) =>
      file.path.endsWith('/beta.md')
        ? {
            ...file,
            content: insertSection(
              file.content,
              ['Overview'],
              '# Glossary\n\n| Term | Definition |\n| --- | --- |\n| Sprocket | A thing Beta has. |',
            ),
          }
        : file,
    )
    expect(diagnosticCodes(files)).toEqual(['SPEC414', 'SPEC414'])
  })

  test('changes nothing once every first mention is linked', () => {
    expect(linkedBeta('Each [Widget](alpha.md#parts) is counted.')).toBeUndefined()
  })
})
