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
import { formatCombatant, parseCombatant, parseList, parseOverrides, parseTypes } from './lib/model.js'
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

/**
 * What identifies the engine in a measurement's key: the git tree of `src/engine`, so that a commit that leaves the
 * engine alone keeps every result, with a mark when the engine has uncommitted changes.
 */
export function engineKey(): string {
  try {
    const git = (...args: string[]) => execFileSync('git', ['-C', IMPL, ...args], { encoding: 'utf8' }).trim()
    const dirty = git('status', '--porcelain', '--', 'src/engine') === '' ? '' : ', with uncommitted changes'
    return `engine tree ${git('rev-parse', 'HEAD:src/engine')}${dirty}`
  } catch {
    return 'unknown engine'
  }
}

/** The engine's commit, for the reader. */
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
  enemyTeam: string
  params: Record<string, number>
  /** The parameters Fit may change. */
  fit: string[]
}

export interface Config {
  /** The reference Combatant, the yardstick every strength is measured in, e.g. `s100 h30 d10 a0`. */
  reference: string
  /** The number of Combatants of a team with one or two values changed, and of a team of two types. */
  baseCount: number
  /** The values each input is tried at, as lists. */
  skills: string
  damages: string
  healths: string
  armors: string
  counts: string
  /** The Combatant types besides the reference, one per line. */
  typesText: string
  /** The sizes of the Enemy teams of the cross-checks, as a list. */
  checkCounts: string
  /** Whether the Mission sites of the content are swept, and whether its Response sites are too. */
  sites: boolean
  responseSites: boolean
  /** Whether the Agents may retreat; a retreat is not a win. */
  retreat: boolean
  overridesText: string
  trials: number
  probeTrials: number
  maxCount: number
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
    enemyTeam: '',
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
    enemyTeam: '',
    params: { k: 1, e: 0, base: Number(Math.sqrt(damageBase * healthBase).toPrecision(4)) },
    fit: ['k', 'e'],
  }
  const bestDamage = Math.max(a.damage, ...gdr.weapons.filter((w) => w.item).map((w) => w.damage))
  const bestArmor = Math.max(a.armor, ...gdr.armors.filter((r) => r.item).map((r) => r.armor))
  const type = (name: string, c: Partial<Combatant>) => `${name}: ${formatCombatant({ ...a, ...c }) as string}`
  return {
    config: {
      reference: formatCombatant(a) as string,
      baseCount: 10,
      skills: [0.25, 0.5, 1, 2, 4].map((t) => Math.round(a.skill * t)).join(', '),
      damages: [0.5, 1, 2, 4].map((t) => Math.round(a.damage * t)).join(', '),
      healths: [0.5, 1, 2, 4].map((t) => Math.round(a.health * t)).join(', '),
      armors: '0, 10, 20, 40, 80',
      counts: '1, 2, 3, 5, 10, 20',
      typesText: [
        type('elite', { skill: a.skill * 4 }),
        type('best weapon', { damage: bestDamage }),
        type('best armor', { armor: bestArmor }),
        type('elite, best gear', { skill: a.skill * 4, damage: bestDamage, armor: bestArmor }),
      ].join('\n'),
      checkCounts: '3, 10, 30',
      sites: true,
      responseSites: true,
      retreat: false,
      overridesText: '',
      trials: 200,
      probeTrials: 30,
      maxCount: 300,
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
      pinned: (saved.pinned ?? defaults.pinned).map((p) => ({ ...p, formula: { ...defaults.formula, ...p.formula } })),
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

/* ---------- measurements and results ---------- */

export type Group = Combatant & { count: number }
export type Role = 'agents' | 'enemies'

/**
 * One measurement: one side fixed, and the count of one Combatant type, its unit, swept on the other. `agents` or
 * `enemies` holds the fixed side and the other is empty.
 */
export interface Measurement {
  key: string
  /**
   * What the measurement is for: `factor`, a team with one value changed; `count`, a team of one type at one size;
   * `pair`, a team with two values changed; `mix`, a team of two types; `check`, Agents of a type against an Enemy
   * team that is not the reference; `site`, Agents of a type against a Mission site.
   */
  kind: 'factor' | 'count' | 'pair' | 'mix' | 'check' | 'site'
  label: string
  meta: Record<string, string | number | boolean>
  swept: Role
  unit: Combatant
  unitIsReference: boolean
  agents: Group[]
  enemies: Group[]
}

/** One swept measurement, as a line of `data/results.ndjson`; a later line of the same key replaces an earlier one. */
export interface SweepRecord {
  key: string
  label: string
  swept: Role
  unit: Combatant
  agents: Group[]
  enemies: Group[]
  engine: string
  gdrValues: Record<string, number>
  trials: number
  probeTrials: number
  maxCount: number
  maxPoints: number
  points: Point[]
  capped: boolean
  ms: number
}

export interface Plan {
  measurements: Measurement[]
  gdrValues: Record<string, number>
  errors: { where: string; line: number; message: string }[]
}

const STATS = ['skill', 'damage', 'health', 'armor'] as const
type Stat = (typeof STATS)[number]
const pick = (c: Combatant): Combatant => ({ skill: c.skill, health: c.health, damage: c.damage, armor: c.armor })
const same = (x: Combatant, y: Combatant) => STATS.every((s) => x[s] === y[s])

/**
 * The measurements a configuration asks for, each under its key. Two measurements of one key are one sweep read for
 * two purposes, e.g. the team of reference Combatants is a point of every curve.
 */
export function plan(config: Config, gdr: Gdr, engine: string): Plan {
  const errors: Plan['errors'] = []
  const parsedReference = parseCombatant(config.reference) as Combatant | string
  if (typeof parsedReference === 'string') {
    errors.push({ where: 'Reference', line: 1, message: parsedReference })
  }
  const reference = typeof parsedReference === 'string' ? pick(gdr.agentArchetype) : parsedReference
  const parsedTypes = parseTypes(config.typesText) as {
    types: (Combatant & { name: string })[]
    errors: { line: number; message: string }[]
  }
  const overrides = parseOverrides(config.overridesText) as {
    values: Record<string, number>
    errors: { line: number; message: string }[]
  }
  errors.push(...parsedTypes.errors.map((e) => ({ where: 'Types', ...e })))
  errors.push(...overrides.errors.map((e) => ({ where: 'GDR values', ...e })))
  const types = [
    { name: 'reference', ...reference },
    ...parsedTypes.types.filter((t) => !same(t, reference) && t.name !== 'reference'),
  ]
  const list = (text: string, min: number, also?: number) => {
    const values = (parseList(text) as number[]).filter((n) => Number.isSafeInteger(n) && n >= min)
    return [...new Set(also === undefined ? values : [...values, also])].sort((x, y) => x - y)
  }
  const values: Record<Stat, number[]> = {
    skill: list(config.skills, 1, reference.skill),
    damage: list(config.damages, 1, reference.damage),
    health: list(config.healths, 1, reference.health),
    armor: list(config.armors, 0, reference.armor),
  }
  const counts = list(config.counts, 1)
  const checkCounts = list(config.checkCounts, 1)
  const baseCount = Math.max(2, Math.floor(config.baseCount))

  // Retreat reads the game's own Combat rating, not the formula under study, so it is off unless asked for.
  const gdrValues = {
    ...gdr.combatValues,
    ...(config.retreat ? {} : { retreat_below_agent_rating_fraction: 0 }),
    ...overrides.values,
  }
  const rules = JSON.stringify(Object.entries(gdrValues).sort(([x], [y]) => (x < y ? -1 : 1)))
  const measurements: Measurement[] = []
  const add = (
    kind: Measurement['kind'],
    label: string,
    meta: Measurement['meta'],
    swept: Role,
    unit: Combatant,
    fixed: Group[],
  ) => {
    const groups = fixed.map((g) => ({ count: g.count, ...pick(g) }))
    const key = createHash('sha256')
      .update(JSON.stringify([swept, pick(unit), groups, rules, engine]))
      .digest('hex')
      .slice(0, 12)
    measurements.push({
      key,
      kind,
      label,
      meta,
      swept,
      unit: pick(unit),
      unitIsReference: same(unit, reference),
      agents: swept === 'agents' ? [] : groups,
      enemies: swept === 'agents' ? groups : [],
    })
  }
  /** Measures a team in reference Combatants, once on each side. */
  const measure = (kind: Measurement['kind'], label: string, meta: Measurement['meta'], team: Group[]) => {
    add(kind, `${label}, as Agents`, { ...meta, role: 'agents' }, 'enemies', reference, team)
    add(kind, `${label}, as Enemies`, { ...meta, role: 'enemies' }, 'agents', reference, team)
  }

  // One value changed.
  for (const stat of STATS) {
    for (const value of values[stat]) {
      measure('factor', `${baseCount} × reference with ${stat} ${value}`, { factor: stat, value }, [
        { count: baseCount, ...reference, [stat]: value },
      ])
    }
  }
  // One type at each size.
  for (const type of types) {
    for (const count of counts) {
      measure(
        'count',
        `${count} × ${type.name}`,
        { type: type.name, value: count, isReference: same(type, reference) },
        [{ count, ...type }],
      )
    }
  }
  // Two values changed, each to its lowest and its highest.
  STATS.forEach((statA, i) => {
    for (const statB of STATS.slice(i + 1)) {
      for (const valueA of [values[statA][0]!, values[statA].at(-1)!]) {
        for (const valueB of [values[statB][0]!, values[statB].at(-1)!]) {
          if (valueA !== reference[statA] && valueB !== reference[statB]) {
            measure(
              'pair',
              `${baseCount} × reference with ${statA} ${valueA} and ${statB} ${valueB}`,
              { factorA: statA, valueA, factorB: statB, valueB, baseA: reference[statA], baseB: reference[statB] },
              [{ count: baseCount, ...reference, [statA]: valueA, [statB]: valueB }],
            )
          }
        }
      }
    }
  })
  // Two types in one team, half of each.
  const half = Math.floor(baseCount / 2)
  types.forEach((typeA, i) => {
    for (const typeB of types.slice(i + 1)) {
      measure(
        'mix',
        `${half} × ${typeA.name} + ${half} × ${typeB.name}`,
        { typeA: typeA.name, typeB: typeB.name, half },
        [
          { count: half, ...typeA },
          { count: half, ...typeB },
        ],
      )
    }
  })
  // Cross-checks: Agents of each type against Enemy teams of each type.
  for (const type of types) {
    for (const enemyType of types) {
      for (const count of checkCounts) {
        add(
          'check',
          `${type.name} Agents against ${count} × ${enemyType.name}`,
          { type: type.name, enemyType: enemyType.name, enemyCount: count, role: 'enemies' },
          'agents',
          type,
          [{ count, ...enemyType }],
        )
      }
    }
  }
  // The final exam: Agents of each type against each Mission site.
  if (config.sites) {
    for (const site of gdr.sites) {
      if (site.groups.length > 0 && (config.responseSites || site.kind !== 'response')) {
        for (const type of types) {
          add(
            'site',
            `${type.name} Agents against ${site.name}`,
            { type: type.name, site: site.name, role: 'enemies' },
            'agents',
            type,
            site.groups,
          )
        }
      }
    }
  }
  return { measurements, gdrValues, errors }
}

/** Whether a record was swept at least as thoroughly as a configuration asks. */
export const satisfies = (record: SweepRecord, config: Config) =>
  record.trials >= config.trials && (!record.capped || record.maxCount >= config.maxCount)

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
