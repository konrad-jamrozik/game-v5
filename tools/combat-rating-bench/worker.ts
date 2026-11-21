/**
 * Worker thread of server.ts. It loads the engine straight from the TypeScript source of the game-v5-impl-web clone,
 * so it runs the engine as it is on disk when the thread starts, and fights the jobs server.ts hands it: each one batch
 * of Detached Combats, `developer.tools.fightCombatBatch`, between two teams of explicit Combatants.
 */
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { parentPort, workerData } from 'node:worker_threads'

const impl = (workerData as { impl: string }).impl
const port = parentPort!

/** One Combatant given by explicit values; see `DetachedExplicitEntry` in the engine. */
export interface Explicit {
  kind: 'explicit'
  baseSkill: number
  currentHealth: number
  effectiveMaxHealth: number
  exhaustion: number
  effectiveWeaponDamage: number
  effectiveArmor: number
}

export interface Job {
  gen: number
  key: string
  /** `a` when team A is the Agents' side, `b` when team B is. */
  side: 'a' | 'b'
  agents: Explicit[]
  enemies: Explicit[]
  trials: number
  gdrValues: Record<string, number>
  seed: string
}

export type JobResult =
  | { type: 'job'; gen: number; key: string; side: 'a' | 'b'; error: string }
  | {
      type: 'job'
      gen: number
      key: string
      side: 'a' | 'b'
      fought: number
      prevailed: number
      retreated: number
      wiped: number
      agentsDead: number
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
            value: {
              totals: { fought: number; prevailed: number; retreated: number; wiped: number; agentsDead: number }
            }
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
  const created = await engine.session.campaign.create({ seed: 'combat-rating-bench' })
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

async function fight(job: Job): Promise<JobResult> {
  const engine = await booted
  const head = { type: 'job', gen: job.gen, key: job.key, side: job.side } as const
  const result = engine.developer.tools.fightCombatBatch(
    {
      agents: job.agents,
      enemies: job.enemies,
      gdrValues: job.gdrValues,
      // Weapon damage and armor are given as explicit values, so no Upgrade counts toward the engine's Combat rating.
      ratingUpgrades: { weaponDamage: 0, armor: 0 },
      seed: job.seed,
    },
    job.trials,
  )
  if (!result.ok) {
    return { ...head, error: result.error.message }
  }
  return { ...head, ...result.value.totals }
}

port.on('message', (job: Job) => {
  fight(job).then(
    (result) => port.postMessage(result),
    (e: unknown) =>
      port.postMessage({
        type: 'job',
        gen: job.gen,
        key: job.key,
        side: job.side,
        error: e instanceof Error ? e.message : String(e),
      }),
  )
})
