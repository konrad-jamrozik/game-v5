/**
 * Worker thread of pool.ts. It loads the engine straight from the TypeScript source of the game-v5-impl-web clone, so
 * it runs the engine as it is on disk when the thread starts, and sweeps the pairings it is handed: for one Agent type
 * against one Enemy team, it finds the Agent counts over which the win rate climbs from none to all, and fights a full
 * batch of Detached Combats at each of them with `developer.tools.fightCombatBatch`.
 */
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { parentPort, workerData } from 'node:worker_threads'

const impl = (workerData as { impl: string }).impl
const port = parentPort!

export interface Combatant {
  skill: number
  health: number
  damage: number
  armor: number
}

export interface Job {
  gen: number
  key: string
  agent: Combatant
  /** The Enemies' side in its fixed order, one entry per Enemy. */
  enemies: Combatant[]
  gdrValues: Record<string, number>
  /** The Combats fought at each Agent count of the climb, and at each count tried while looking for the climb. */
  trials: number
  probeTrials: number
  /** The most Agents a team may have, and the most Agent counts fought between the two ends of the climb. */
  maxAgents: number
  maxPoints: number
}

/** The Combats of one Agent count: the batch on the Detached seed `<key>.<n>`. */
export interface Point {
  n: number
  trials: number
  won: number
  retreated: number
  wiped: number
  agentsDead: number
}

export type JobResult =
  | { type: 'job'; gen: number; key: string; error: string }
  | {
      type: 'job'
      gen: number
      key: string
      points: Point[]
      /** True when even `maxAgents` Agents did not win nearly every Combat. */
      capped: boolean
      ms: number
    }

interface Engine {
  developer: {
    tools: {
      fightCombatBatch(
        setup: unknown,
        count: number,
      ):
        | {
            ok: true
            value: { totals: { fought: number; won: number; retreated: number; wiped: number; agentsDead: number } }
          }
        | { ok: false; error: { message: string } }
    }
  }
}

async function boot(): Promise<Engine> {
  const { MemoryStorage, createEngine } = await import(pathToFileURL(path.join(impl, 'src/engine/index.ts')).href)
  let id = 0
  const engine = await createEngine({
    storage: new MemoryStorage(),
    newId: () => `id-${(id += 1)}`,
    randomNumbers: (n: number) => new Array<number>(n).fill(7),
  })
  const created = await engine.session.campaign.create({ seed: 'cr-sweep-bench' })
  if (!created.ok) {
    throw new Error(created.error.message)
  }
  const enabled = engine.session.developer.enable()
  if (!enabled.ok) {
    throw new Error(enabled.error.message)
  }
  return engine as Engine
}

const booted = boot()
booted.then(
  () => port.postMessage({ type: 'ready' }),
  (e: unknown) => port.postMessage({ type: 'error', message: e instanceof Error ? e.message : String(e) }),
)

/** A win rate at or below LOW counts as never winning, and one at or above HIGH as always winning. */
const LOW = 0.02
const HIGH = 0.99

const explicit = (c: Combatant) => ({
  kind: 'explicit',
  baseSkill: c.skill,
  currentHealth: c.health,
  effectiveMaxHealth: c.health,
  exhaustion: 0,
  effectiveWeaponDamage: c.damage,
  effectiveArmor: c.armor,
})

function sweep(engine: Engine, job: Job): { points: Point[]; capped: boolean } {
  const agent = explicit(job.agent)
  const enemies = job.enemies.map(explicit)
  const fought = new Map<number, Point>()
  const fight = (n: number, trials: number): Point => {
    const known = fought.get(n)
    if (known !== undefined && known.trials >= trials) {
      return known
    }
    const result = engine.developer.tools.fightCombatBatch(
      { agents: new Array(n).fill(agent), enemies, gdrValues: job.gdrValues, seed: `${job.key}.${n}` },
      trials,
    )
    if (!result.ok) {
      throw new Error(result.error.message)
    }
    const { totals } = result.value
    const point = {
      n,
      trials: totals.fought,
      won: totals.won,
      retreated: totals.retreated,
      wiped: totals.wiped,
      agentsDead: totals.agentsDead,
    }
    fought.set(n, point)
    return point
  }
  const rate = (p: Point) => p.won / p.trials
  const sorted = () => [...fought.values()].sort((a, b) => a.n - b.n)

  // 1. Double the Agent count until the team wins nearly every Combat.
  let capped = true
  for (let n = 1; ; n = Math.min(n * 2, job.maxAgents)) {
    if (rate(fight(n, job.probeTrials)) >= HIGH) {
      capped = false
      break
    }
    if (n >= job.maxAgents) {
      break
    }
  }

  // The climb: from the highest count below which the team never wins to the lowest at and above which it always does.
  const climb = (): [number, number] => {
    const points = sorted()
    let lo = 0
    for (const p of points) {
      if (rate(p) > LOW) {
        break
      }
      lo = p.n
    }
    let hi = job.maxAgents
    for (let i = points.length - 1; i >= 0 && rate(points[i]!) >= HIGH; i -= 1) {
      hi = points[i]!.n
    }
    return [lo, hi]
  }

  // 2. Fight evenly spaced counts inside the climb, ever closer, until every count in it is fought or it stops narrowing.
  let step = Infinity
  for (;;) {
    const [lo, hi] = climb()
    const next = Math.max(1, Math.ceil((hi - lo) / (job.maxPoints + 1)))
    if (next >= step) {
      break
    }
    step = next
    for (let n = lo + step; n < hi; n += step) {
      fight(n, job.probeTrials)
    }
  }

  // 3. Fight the full batch at every count of the climb, and above it while the team still loses now and then.
  let [lo, hi] = climb()
  for (const p of sorted()) {
    if (p.n >= lo && p.n <= hi) {
      fight(p.n, job.trials)
    }
  }
  for (let i = 0; i < 8 && hi < job.maxAgents && rate(fight(hi, job.trials)) < HIGH; i += 1) {
    hi = Math.min(job.maxAgents, hi + step)
    fight(hi, job.trials)
  }
  return { points: sorted(), capped: capped || rate(sorted().at(-1)!) < HIGH }
}

port.on('message', (job: Job) => {
  const head = { type: 'job', gen: job.gen, key: job.key } as const
  booted
    .then((engine) => {
      const started = performance.now()
      const result = sweep(engine, job)
      port.postMessage({ ...head, ...result, ms: Math.round(performance.now() - started) })
    })
    .catch((e: unknown) => port.postMessage({ ...head, error: e instanceof Error ? e.message : String(e) }))
})
