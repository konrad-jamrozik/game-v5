/**
 * Worker thread of pool.ts. It loads the engine straight from the TypeScript source of the game-v5-impl-web clone, so
 * it runs the engine as it is on disk when the thread starts, and sweeps the measurements it is handed. A measurement
 * fixes one side and sweeps the count of one Combatant type on the other: the worker finds the counts over which the
 * swept side goes from never getting its way to always getting it, and fights a full batch of Detached Combats at
 * each of them with `developer.tools.fightCombatBatch`.
 *
 * Every Combatant is given by explicit values, so no Agent spends Ammo and none ever falls back to its knife.
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
  /** The side whose count is swept, and the Combatant type it is made of. */
  swept: 'agents' | 'enemies'
  unit: Combatant
  /** The other side in its fixed order, one entry per Combatant. */
  fixed: Combatant[]
  gdrValues: Record<string, number>
  /** The Combats fought at each count of the climb, and at each count tried while looking for the climb. */
  trials: number
  probeTrials: number
  /** The most Combatants the swept side may have, and the most counts fought between the two ends of the climb. */
  maxCount: number
  maxPoints: number
}

/** The Combats of one swept count: the batch on the Detached seed `<key>.<n>`. `won` counts the Agents' wins. */
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
      /** True when even `maxCount` Combatants did not get the swept side its way nearly every Combat. */
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

/** A success rate at or below LOW counts as never, and one at or above HIGH as always. */
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
  const unit = explicit(job.unit)
  const fixed = job.fixed.map(explicit)
  const fought = new Map<number, Point>()
  const fight = (n: number, trials: number): Point => {
    const known = fought.get(n)
    if (known !== undefined && known.trials >= trials) {
      return known
    }
    const swept = new Array(n).fill(unit)
    const result = engine.developer.tools.fightCombatBatch(
      {
        agents: job.swept === 'agents' ? swept : fixed,
        enemies: job.swept === 'agents' ? fixed : swept,
        gdrValues: job.gdrValues,
        seed: `${job.key}.${n}`,
      },
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
  // The swept side gets its way when the Agents win, if it is the Agents, and when they do not, if it is the Enemies.
  const rate = (p: Point) => (job.swept === 'agents' ? p.won : p.trials - p.won) / p.trials
  const sorted = () => [...fought.values()].sort((a, b) => a.n - b.n)

  // 1. Double the swept count until the swept side gets its way nearly every Combat.
  let capped = true
  for (let n = 1; ; n = Math.min(n * 2, job.maxCount)) {
    if (rate(fight(n, job.probeTrials)) >= HIGH) {
      capped = false
      break
    }
    if (n >= job.maxCount) {
      break
    }
  }

  // The climb: from the highest count below which the swept side never gets its way to the lowest at and above which
  // it always does.
  const climb = (): [number, number] => {
    const points = sorted()
    let lo = 0
    for (const p of points) {
      if (rate(p) > LOW) {
        break
      }
      lo = p.n
    }
    let hi = job.maxCount
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

  // 3. Fight the full batch at every count of the climb, and above it while the swept side still fails now and then.
  let [lo, hi] = climb()
  for (const p of sorted()) {
    if (p.n >= Math.max(1, lo) && p.n <= hi) {
      fight(p.n, job.trials)
    }
  }
  for (let i = 0; i < 8 && hi < job.maxCount && rate(fight(hi, job.trials)) < HIGH; i += 1) {
    hi = Math.min(job.maxCount, hi + step)
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
