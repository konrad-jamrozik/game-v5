import { readFileSync } from 'node:fs'

import { describe, expect, test } from 'vitest'

import { GDRS_PATH, collectContentFiles, compendiumFindings } from '../scripts/compendium-check.ts'
import {
  coverageExemptions,
  coverageFindings,
  formatValue,
  loadCompendium,
  loadGameData,
  parseTemplate,
  PLACEHOLDER_SOURCES,
  renderCompendiumPreview,
  resolveArticles,
} from '../scripts/compendium/compendium.ts'
import type { SourceFile } from '../scripts/spec-linter/types.ts'

const ARTICLES = 'content/compendium/compendium_articles'

const PARAMETERS: SourceFile = {
  path: 'content/agents/agent_parameters.yaml',
  content: [
    'id: agent_parameters',
    'type: AgentParameters',
    'exhaustion_per_mission: 5',
    'experience_per_mission_survived: [30, 25]',
  ].join('\n'),
}

const GAME: readonly SourceFile[] = [
  PARAMETERS,
  {
    path: 'content/combat/weapons.yaml',
    content: 'id: rifle\ntype: Weapon\nname: Rifle\nbase_weapon_damage: 14',
  },
  {
    path: 'content/combat/enemy_archetypes.yaml',
    content: 'id: soldier\ntype: EnemyArchetype\nname: Soldier\nbase_skill: 120\nbase_health: 30\nweapon: rifle',
  },
  {
    path: 'content/leads-and-progression/leads.yaml',
    content: 'id: lead_1\ntype: Lead\nname: First lead\ndescription: A trail.\nrequired_progress: 3',
  },
]

function article(id: string, lines: readonly string[]): SourceFile {
  return { path: `${ARTICLES}/${id}.yaml`, content: [`id: ${id}`, 'type: CompendiumArticle', ...lines].join('\n') }
}

function mechanics(id: string, title: string, lines: readonly string[] = []): SourceFile {
  const formulas = lines.some((line) => line.startsWith('formulas:')) ? [] : ['formulas: [{ label: Row, text: Rule }]']
  return article(id, ['category: mechanics', `title: ${title}`, ...lines, ...formulas])
}

const COVERING = mechanics('mechanics_exhaustion', 'Exhaustion', [
  'terms: [exhaustion]',
  'body: Exhaustion wears an Agent down.',
  'formulas:',
  '  - label: Each Mission survived',
  "    text: '+{agent_parameters.exhaustion_per_mission}'",
  '  - label: First Mission',
  "    text: '+{agent_parameters.experience_per_mission_survived.1}'",
])

function findingsOf(files: readonly SourceFile[]): readonly string[] {
  return loadCompendium(loadGameData([...GAME, ...files])).findings
}

describe('parseTemplate and formatValue', () => {
  test('splits text and placeholders and unescapes doubled braces', () => {
    expect(parseTemplate('a {x.y} b {subject.z.2} {{c}}')).toEqual([
      { kind: 'text', text: 'a ' },
      { kind: 'placeholder', gdr: 'x', property: 'y', index: undefined },
      { kind: 'text', text: ' b ' },
      { kind: 'placeholder', gdr: 'subject', property: 'z', index: 2 },
      { kind: 'text', text: ' {c}' },
    ])
  })

  test('rejects a malformed placeholder and a lone closing brace', () => {
    expect(typeof parseTemplate('{x}')).toBe('string')
    expect(typeof parseTemplate('{x.y.0}')).toBe('string')
    expect(typeof parseTemplate('{x.y')).toBe('string')
    expect(typeof parseTemplate('a } b')).toBe('string')
  })

  test('formats numbers without separators or trailing zeros, and negative numbers with a minus sign', () => {
    expect(formatValue(1000)).toBe('1000')
    expect(formatValue(0.5)).toBe('0.5')
    expect(formatValue(2)).toBe('2')
    expect(formatValue(-3)).toBe('−3')
    expect(formatValue('Rifle')).toBe('Rifle')
    expect(formatValue({ money: 5 })).toBeUndefined()
    expect(formatValue(null)).toBeUndefined()
  })
})

describe('Compendium article GDR validation', () => {
  test('accepts a valid article of each category', () => {
    expect(
      findingsOf([
        COVERING,
        article('guide_start', ['category: guide', 'title: Start here', 'body: Read this first.']),
        article('soldier_article', [
          'category: subject',
          'subject: soldier',
          'body: Carries a {subject.weapon} and has skill {subject.base_skill}.',
        ]),
      ]),
    ).toEqual([])
  })

  test('reports each broken rule with the file of the article', () => {
    const findings = findingsOf([
      mechanics('mechanics_a', 'Same', ['body: Text.', 'terms: [Alpha]', 'see_also: [mechanics_a, nowhere]']),
      mechanics('mechanics_b', 'same', ['body: Text.', 'terms: [alpha]']),
      article('guide_formulas', [
        'category: guide',
        'title: Guide',
        'body: Text.',
        'formulas: [{ label: A, text: B }]',
      ]),
      article('titled_subject', ['category: subject', 'subject: soldier', 'title: Soldier', 'body: Text.']),
      article('second_subject', ['category: subject', 'subject: soldier', 'body: Text.']),
      article('no_name_subject', ['category: subject', 'subject: agent_parameters', 'body: Text.']),
      article('odd', ['category: other', 'title: Odd', 'body: Text.']),
      mechanics('mechanics_c', 'No rows', ['body: Text.', 'formulas: []']),
      mechanics('mechanics_d', 'Extra', ['body: Text.', 'colour: red']),
    ])
    const expected = [
      [`${ARTICLES}/mechanics_a.yaml`, 'see_also names the article itself'],
      [`${ARTICLES}/mechanics_a.yaml`, 'see_also names "nowhere"'],
      [`${ARTICLES}/mechanics_b.yaml`, 'the displayed title "same" is also that of mechanics_a'],
      [`${ARTICLES}/mechanics_b.yaml`, 'the term "alpha" is also a term of mechanics_a'],
      [`${ARTICLES}/guide_formulas.yaml`, 'a guide article has no formulas'],
      [`${ARTICLES}/titled_subject.yaml`, 'a subject article has no title'],
      [`${ARTICLES}/titled_subject.yaml`, 'the subject soldier already has the article second_subject'],
      [`${ARTICLES}/no_name_subject.yaml`, 'subject identifies a GDR'],
      [`${ARTICLES}/odd.yaml`, 'category is guide, mechanics, or subject'],
      [`${ARTICLES}/mechanics_c.yaml`, 'formulas is a list of one or more rows'],
      [`${ARTICLES}/mechanics_d.yaml`, 'unknown properties: colour'],
    ]
    for (const [path, message] of expected) {
      expect(findings.some((finding) => finding.startsWith(`${path}: `) && finding.includes(message ?? ''))).toBe(true)
    }
  })

  test('reports a placeholder that names nothing, a hidden property, or a wrong index', () => {
    const cases: readonly (readonly [string, string])[] = [
      ['{nothing.value}', 'names no GDR'],
      ['{agent_parameters.missing}', 'names no property of agent_parameters'],
      ['{subject.name}', 'has no subject'],
      ['{lead_1.name}', 'only {subject.property} may name'],
      ['{agent_parameters.experience_per_mission_survived}', 'needs an index'],
      ['{agent_parameters.experience_per_mission_survived.3}', 'beyond the 2 entries'],
      ['{agent_parameters.exhaustion_per_mission.1}', 'not a list'],
    ]
    for (const [placeholder, message] of cases) {
      const findings = findingsOf([mechanics('mechanics_x', 'X', [`body: 'Value ${placeholder}.'`])])
      expect(findings).toHaveLength(1)
      expect(findings[0]).toContain(message)
    }
    const hidden = findingsOf([
      article('lead_article', ['category: subject', 'subject: lead_1', "body: 'Needs {subject.required_progress}.'"]),
    ])
    expect(hidden[0]).toContain('names a property of Lead that no placeholder may name')
  })

  test('reports a file of a one-file-per-GDR directory that is misnamed or holds two GDRs', () => {
    const misnamed = { ...COVERING, path: `${ARTICLES}/other.yaml` }
    expect(loadGameData([misnamed]).findings).toEqual([
      `${ARTICLES}/other.yaml: the file is named after its GDR, i.e. mechanics_exhaustion.yaml.`,
    ])
    const two = { path: COVERING.path, content: `${COVERING.content}\n---\nid: second\ntype: Weapon` }
    expect(loadGameData([two]).findings[0]).toContain('holds exactly one GDR')
  })
})

describe('Article resolution', () => {
  const files = [
    mechanics('mechanics_missions', 'Missions', [
      'terms: [Mission, Missions]',
      'body: A Mission site hosts a Mission.',
    ]),
    mechanics('mechanics_sites', 'Mission sites', [
      'terms: [Mission site]',
      'body: A Mission site waits. Missions end it, and each Mission counts. Submission is no term.',
      'formulas:',
      '  - label: Mission site',
      "    text: 'A Mission costs {agent_parameters.exhaustion_per_mission} with a {rifle.name}'",
      'see_also: [mechanics_missions, soldier_article]',
    ]),
    article('soldier_article', ['category: subject', 'subject: soldier', 'terms: [Rifle]', 'body: A fighter.']),
  ]
  const gameData = loadGameData([...GAME, ...files])
  const compendium = loadCompendium(gameData)

  test('links the first mention of the longest term, never the article itself, and never inserted text', () => {
    expect(compendium.findings).toEqual([])
    const resolved = resolveArticles(compendium.articles, gameData.gdrs)
    const sites = resolved.find((item) => item.article.id === 'mechanics_sites')
    expect(sites?.body).toEqual([
      { kind: 'text', text: 'A Mission site waits. ' },
      { kind: 'link', text: 'Missions', target: 'mechanics_missions' },
      { kind: 'text', text: ' end it, and each Mission counts. Submission is no term.' },
    ])
    expect(sites?.formulas[0]?.text).toEqual([
      { kind: 'text', text: 'A Mission costs ' },
      { kind: 'value', text: '5' },
      { kind: 'text', text: ' with a ' },
      { kind: 'value', text: 'Rifle' },
    ])
    expect(sites?.seeAlso.map((entry) => entry.title)).toEqual(['Missions', 'Soldier'])
    const missions = resolved.find((item) => item.article.id === 'mechanics_missions')
    expect(missions?.body).toEqual([
      { kind: 'text', text: 'A ' },
      { kind: 'link', text: 'Mission site', target: 'mechanics_sites' },
      { kind: 'text', text: ' hosts a Mission.' },
    ])
  })

  test('resolves as though an article that is not visible did not exist', () => {
    const visible = compendium.articles.filter((item) => item.id !== 'mechanics_sites')
    const missions = resolveArticles(visible, gameData.gdrs).find((item) => item.article.id === 'mechanics_missions')
    expect(missions?.body).toEqual([{ kind: 'text', text: 'A Mission site hosts a Mission.' }])
    const withoutMissions = compendium.articles.filter((item) => item.id !== 'mechanics_missions')
    const sites = resolveArticles(withoutMissions, gameData.gdrs).find((item) => item.article.id === 'mechanics_sites')
    expect(sites?.body).toEqual([
      { kind: 'text', text: 'A Mission site waits. Missions end it, and each Mission counts. Submission is no term.' },
    ])
    expect(sites?.seeAlso.map((entry) => entry.target)).toEqual(['soldier_article'])
  })

  test('renders the preview with values, links within the page, and source paths', () => {
    const preview = renderCompendiumPreview(compendium, gameData.gdrs)
    expect(preview).toContain('## Mechanics articles')
    expect(preview).toContain('## Subject articles: EnemyArchetype')
    expect(preview).toContain(`Source: \`${ARTICLES}/mechanics_sites.yaml\``)
    expect(preview).toContain('| Mission site | A Mission costs 5 with a Rifle |')
    expect(preview).toContain('A [Mission site](#mission-sites) hosts a Mission.')
    expect(preview).toContain('See also: [Missions](#missions) · [Soldier](#soldier)')
    expect(preview).toContain('| `base_skill` | `120` |')
  })
})

describe('Compendium coverage', () => {
  const gdrsText = [
    '# Compendium coverage',
    '',
    '| GDR | Property | Why it is exempt |',
    '| --- | --- | --- |',
    '| `agent_parameters` | `experience_per_mission_survived` | A reason. |',
    '',
    '# Victory path',
    '',
    '| `other` | `row` | Not an exemption. |',
  ].join('\n')

  test('reads the exemption table of the section only', () => {
    expect(coverageExemptions(gdrsText)).toEqual(['agent_parameters.experience_per_mission_survived'])
  })

  test('reports an uncovered property, a covered exemption, and an exemption that names nothing', () => {
    const uncovered = loadGameData([...GAME, mechanics('mechanics_x', 'X', ['body: Text.'])])
    expect(coverageFindings(uncovered, loadCompendium(uncovered), [])).toEqual([
      expect.stringContaining('no Compendium article names agent_parameters.exhaustion_per_mission'),
      expect.stringContaining('no Compendium article names agent_parameters.experience_per_mission_survived'),
    ])
    const covered = loadGameData([...GAME, COVERING])
    expect(coverageFindings(covered, loadCompendium(covered), [])).toEqual([])
    expect(coverageFindings(covered, loadCompendium(covered), coverageExemptions(gdrsText))).toEqual([
      expect.stringContaining('is exempt from Compendium coverage, but an article names it'),
    ])
    expect(coverageFindings(covered, loadCompendium(covered), ['music.volume'])).toEqual([
      'Compendium coverage exempts music.volume, which no parameter GDR has.',
    ])
  })
})

describe('the game data of the repository', () => {
  test('passes the Compendium check', async () => {
    const contentFiles = await collectContentFiles(process.cwd())
    expect(compendiumFindings(contentFiles, readFileSync(GDRS_PATH, 'utf8'))).toEqual([])
  })

  test('has the Placeholder sources that the Compendium specification lists', () => {
    const specification = readFileSync('docs/specs/design/mechanics/compendium.md', 'utf8')
    const section = specification.split('\n### Placeholder sources')[1]?.split(/\n#{1,3} /)[0] ?? ''
    const rows = [...section.matchAll(/^\|\s*(\w+)\s*\|([^|]+)\|([^|]+)\|$/gm)]
      .filter((match) => match[1] !== 'Type')
      .map((match) => {
        const properties = (match[2] ?? '').trim()
        return [
          match[1] ?? '',
          {
            properties:
              properties === 'Every property'
                ? 'every'
                : [...properties.matchAll(/`(\w+)`/g)].map((name) => name[1] ?? ''),
            subjectOnly: (match[3] ?? '').trim() !== 'Any',
          },
        ] as const
      })
    expect(Object.fromEntries(rows)).toEqual(PLACEHOLDER_SOURCES)
  })
})
