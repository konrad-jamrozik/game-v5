/**
 * What server.ts and cli.ts share: the GDR values read from the Spec repo's content, the bench's state and swept
 * results, both kept as files under `data/` so that the page, the command line, and an agent all read the same ones,
 * and the pairings a state asks for.
 */
import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import YAML from 'yaml'
import { parseOverrides, parseTeams, parseTypes } from './lib/model.js'
import type { Combatant, Point } from './worker.ts'

export const HERE = import.meta.dirname
export const DATA = path.join(HERE, 'data')
const STATE_FILE = path.join(DATA, 'state.json')
const RESULTS_FILE = path.join(DATA, 'results.ndjson')

export const arg = (name: string, fallback: string) => {
  const at = process.argv.indexOf(`--${name}`)
  return at >= 0 && process.argv[at + 1] !== undefined ? process.argv[at + 1]! : fallback
}
export const SPEC = path.resolve(arg('spec', path.join(HERE, '../..')))
export const IMPL = path.resolve(arg('impl', path.join(SPEC, '../game-v5-impl-web')))

/* ---------- GDR values from the YAML files ---------- */
type Doc = Record<string, unknown> & { id: string; type: string }

function yamlFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name !== 'compendium' && entry.name !== 'cut') {
        out.push(...yamlFiles(full))
      }
    } else if (entry.name.endsWith('.yaml')) {
      out.push(full)
    }
  }
  return out
}

export interface Gdr {
  /** The CombatParameters values and the AgentParameters values a Combat reads, by authored name. */
  combatValues: Record<string, number>
  agentArchetype: Combatant & { name: string }
  weapons: { id: string; name: string; damage: number; item: boolean }[]
  armors: { id: string; name: string; armor: number; item: boolean }[]
  sites: { id: string; name: string; kind: string; groups: (Combatant & { count: number; name: string })[] }[]
}

export function loadGdr(): Gdr {
  const docs: Doc[] = []
  for (const file of yamlFiles(path.join(SPEC, 'content'))) {
    for (const doc of YAML.parseAllDocuments(fs.readFileSync(file, 'utf8'))) {
      const value: unknown = doc.toJS()
      if (value !== null && typeof value === 'object' && 'id' in value && 'type' in value) {
        docs.push(value as Doc)
      }
    }
  }
  const of = (type: string) => docs.filter((d) => d.type === type)
  const byId = (type: string) => new Map(of(type).map((d) => [d.id, d]))
  const weapons = byId('Weapon')
  const armors = byId('Armor')
  const num = (d: Doc | undefined, key: string) => (typeof d?.[key] === 'number' ? (d[key] as number) : 0)
  const name = (d: Doc) => (typeof d['name'] === 'string' ? d['name'] : d.id)
  const combatant = (d: Doc) => ({
    name: name(d),
    skill: num(d, 'base_skill'),
    health: num(d, 'base_health'),
    damage: num(weapons.get(String(d['weapon'])), 'base_weapon_damage'),
    armor: num(armors.get(String(d['armor'])), 'base_armor'),
  })
  const numbers = (d: Doc | undefined) =>
    Object.fromEntries(Object.entries(d ?? {}).filter(([, v]) => typeof v === 'number')) as Record<string, number>
  const agentParameters = numbers(of('AgentParameters')[0])
  // The AgentParameters values a Combat reads, under COMBAT, Combat inputs and outputs.
  const agentCombatNames = [
    'exhaustion_incapacitation',
    'exhaustion_free_points',
    'skill_penalty_pct_per_exhaustion',
    'exhaustion_per_attack',
    'exhaustion_per_defense',
  ]
  const enemies = new Map(of('EnemyArchetype').map((d) => [d.id, combatant(d)]))
  const agent = of('AgentArchetype')[0]
  if (agent === undefined) {
    throw new Error(`no AgentArchetype under ${path.join(SPEC, 'content')}`)
  }
  return {
    combatValues: {
      ...numbers(of('CombatParameters')[0]),
      ...Object.fromEntries(agentCombatNames.filter((k) => k in agentParameters).map((k) => [k, agentParameters[k]!])),
    },
    agentArchetype: combatant(agent),
    weapons: of('Weapon').map((d) => ({
      id: d.id,
      name: name(d),
      damage: num(d, 'base_weapon_damage'),
      item: typeof d['price'] === 'number',
    })),
    armors: of('Armor').map((d) => ({
      id: d.id,
      name: name(d),
      armor: num(d, 'base_armor'),
      item: typeof d['price'] === 'number',
    })),
    sites: of('MissionSiteArchetype').map((d) => ({
      id: d.id,
      name: name(d),
      kind: String(d['kind']),
      groups: Object.entries((d['enemies'] ?? {}) as Record<string, number>).flatMap(([id, count]) => {
        const enemy = enemies.get(id)
        return enemy === undefined || count < 1 ? [] : [{ count, ...enemy }]
      }),
    })),
  }
}

export function engineVersion(): string {
  try {
    const git = (...args: string[]) => execFileSync('git', ['-C', IMPL, ...args], { encoding: 'utf8' }).trim()
    const dirty = git('status', '--porcelain', '--', 'src') === '' ? '' : ', with uncommitted changes under src'
    return `commit ${git('rev-parse', '--short', 'HEAD')}${dirty}`
  } catch {
    return 'unknown commit'
  }
}

/* ---------- state ---------- */

export interface Formula {
  combatant: string
  aux: string
  team: string
  enemyCombatant: string
  params: Record<string, number>
  /** The parameters Fit may change. */
  fit: string[]
}

export interface Config {
  /** Whether the Mission sites of the content are among the Enemy teams, and whether its Response sites are too. */
  sites: boolean
  responseSites: boolean
  enemyText: string
  agentText: string
  /** Whether the Agents may retreat; a retreat is not a win. */
  retreat: boolean
  overridesText: string
  trials: number
  probeTrials: number
  maxAgents: number
  maxPoints: number
}

export interface State {
  config: Config
  formula: Formula
  pinned: { name: string; formula: Formula }[]
  view: Record<string, unknown>
}

export function defaultState(gdr: Gdr): State {
  const v = gdr.combatValues
  const a = gdr.agentArchetype
  const damageBase = v['rating_base_weapon_damage'] ?? a.damage
  const healthBase = v['rating_base_health'] ?? a.health
  const game: Formula = {
    combatant: 'skill * (damage / damage_base + health / health_base + armor / armor_base) / 2',
    aux: '',
    team: 'sum * count ** (team_exp - 1)',
    enemyCombatant: '',
    params: {
      damage_base: damageBase,
      health_base: healthBase,
      armor_base: v['rating_base_armor'] ?? 20,
      team_exp: v['rating_team_size_exponent'] ?? 1,
    },
    fit: [],
  }
  const square: Formula = {
    combatant: 'skill * sqrt(damage * (health + k * armor)) / base',
    aux: '',
    team: 'sum * count ** e',
    enemyCombatant: '',
    params: { k: 1, e: 0, base: Number(Math.sqrt(damageBase * healthBase).toPrecision(4)) },
    fit: ['k', 'e'],
  }
  // Agent types: three skills, each with the issued gear, the best gear, and the gear between them.
  const weapons = [...gdr.weapons].filter((w) => w.item).sort((x, y) => x.damage - y.damage)
  const armors = [...gdr.armors].filter((r) => r.item).sort((x, y) => x.armor - y.armor)
  const mid = <T>(list: T[]) => list[Math.floor((list.length - 1) / 2)]
  const gear: [string, number, number][] = [['issued gear', a.damage, a.armor]]
  if (weapons.length > 0 && armors.length > 0) {
    const [w, r, bestW, bestR] = [mid(weapons)!, mid(armors)!, weapons.at(-1)!, armors.at(-1)!]
    gear.push(
      [`${w.name}, ${r.name}`, w.damage, r.armor],
      [`${bestW.name}, ${bestR.name}`, bestW.damage, bestR.armor],
      [`${bestW.name}, no armor`, bestW.damage, a.armor],
      [`issued weapon, ${bestR.name}`, a.damage, bestR.armor],
    )
  }
  const agentText = [1, 2, 4]
    .flatMap((times) =>
      gear.map(
        ([label, damage, armor]) =>
          `skill ${a.skill * times}, ${label}: s${a.skill * times} h${a.health} d${damage} a${armor}`,
      ),
    )
    .join('\n')
  const enemyText = [
    '# Teams the Mission sites do not have, to see how a formula rates lopsided fights.',
    'swarm of 50 weak: 50 x s40 h20 d8 a0',
    'swarm of 30 armored: 30 x s60 h25 d10 a20',
    'squad of 6 elites: 6 x s300 h40 d16 a20',
    'one champion: 1 x s500 h60 d20 a40',
    'three glass cannons: 3 x s250 h20 d28 a0',
    'three walls: 3 x s250 h60 d8 a40',
    'boss and minions: 1 x s400 h60 d20 a40 + 12 x s40 h20 d8 a0',
  ].join('\n')
  return {
    config: {
      sites: true,
      responseSites: true,
      enemyText,
      agentText,
      retreat: false,
      overridesText: '',
      trials: 200,
      probeTrials: 30,
      maxAgents: 200,
      maxPoints: 16,
    },
    formula: square,
    pinned: [
      { name: "Game's formula", formula: game },
      { name: 'Square law', formula: square },
    ],
    view: {},
  }
}

export function loadState(gdr: Gdr): State {
  const defaults = defaultState(gdr)
  try {
    const saved = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) as Partial<State>
    return {
      config: { ...defaults.config, ...saved.config },
      formula: { ...defaults.formula, ...saved.formula },
      pinned: saved.pinned ?? defaults.pinned,
      view: saved.view ?? {},
    }
  } catch {
    return defaults
  }
}

export function saveState(state: State): void {
  fs.mkdirSync(DATA, { recursive: true })
  fs.writeFileSync(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`)
}

/* ---------- pairings and results ---------- */

export interface Team {
  name: string
  groups: (Combatant & { count: number })[]
}

export interface Pairing {
  key: string
  agent: Combatant & { name: string }
  enemy: Team
}

/** One swept pairing, as a line of `data/results.ndjson`; a later line of the same key replaces an earlier one. */
export interface SweepRecord extends Pairing {
  engine: string
  gdrValues: Record<string, number>
  trials: number
  probeTrials: number
  maxAgents: number
  maxPoints: number
  points: Point[]
  capped: boolean
  ms: number
}

export interface Plan {
  pairings: Pairing[]
  gdrValues: Record<string, number>
  errors: { where: string; line: number; message: string }[]
}

const pick = (c: Combatant) => ({ skill: c.skill, health: c.health, damage: c.damage, armor: c.armor })

/** The pairings a configuration asks for: every Agent type against every Enemy team, each under its key. */
export function plan(config: Config, gdr: Gdr, engine: string): Plan {
  const extra = parseTeams(config.enemyText)
  const types = parseTypes(config.agentText)
  const overrides = parseOverrides(config.overridesText)
  const teams: Team[] = [
    ...(config.sites
      ? gdr.sites
          .filter((site) => site.groups.length > 0 && (config.responseSites || site.kind !== 'response'))
          .map((site) => ({ name: site.name, groups: site.groups.map((g) => ({ count: g.count, ...pick(g) })) }))
      : []),
    ...(extra.teams as Team[]),
  ]
  // Retreat reads the game's own Combat rating, not the formula under study, so it is off unless asked for.
  const gdrValues = {
    ...gdr.combatValues,
    ...(config.retreat ? {} : { retreat_below_agent_rating_fraction: 0 }),
    ...(overrides.values as Record<string, number>),
  }
  const rules = JSON.stringify(Object.entries(gdrValues).sort(([x], [y]) => (x < y ? -1 : 1)))
  const seen = new Set<string>()
  const pairings: Pairing[] = []
  for (const team of teams) {
    for (const type of types.types as (Combatant & { name: string })[]) {
      const key = createHash('sha256')
        .update(JSON.stringify([pick(type), team.groups.map((g) => [g.count, pick(g)]), rules, engine]))
        .digest('hex')
        .slice(0, 12)
      if (!seen.has(key)) {
        seen.add(key)
        pairings.push({ key, agent: type, enemy: team })
      }
    }
  }
  const tag = (where: string) => (e: { line: number; message: string }) => ({ where, ...e })
  return {
    pairings,
    gdrValues,
    errors: [
      ...extra.errors.map(tag('Enemy teams')),
      ...types.errors.map(tag('Agent types')),
      ...overrides.errors.map(tag('GDR values')),
    ],
  }
}

/** Whether a record was swept at least as thoroughly as a configuration asks. */
export const satisfies = (record: SweepRecord, config: Config) =>
  record.trials >= config.trials && (!record.capped || record.maxAgents >= config.maxAgents)

export class Results {
  private readonly byKey = new Map<string, SweepRecord>()

  constructor() {
    try {
      for (const line of fs.readFileSync(RESULTS_FILE, 'utf8').split('\n')) {
        if (line.trim() !== '') {
          const record = JSON.parse(line) as SweepRecord
          this.byKey.set(record.key, record)
        }
      }
    } catch {
      // No results yet.
    }
  }

  get(key: string): SweepRecord | undefined {
    return this.byKey.get(key)
  }

  put(record: SweepRecord): void {
    this.byKey.set(record.key, record)
    fs.mkdirSync(DATA, { recursive: true })
    fs.appendFileSync(RESULTS_FILE, `${JSON.stringify(record)}\n`)
  }
}
