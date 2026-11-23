/**
 * Worker thread of server.ts. It loads the engine straight from the TypeScript source of the game-v5-impl-web clone,
 * so it runs the engine as it is on disk when the thread starts, and fights the jobs server.ts hands it: each one batch
 * of Detached Combats between two teams of explicit Combatants, fought one by one with `developer.tools.fightCombat`
 * so that each Combat's report gives the Agents' attacks.
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
  /** The Upgrade counts, which only an engine from before the rating factor reads, as its Rating Upgrades. */
  ratingUpgrades?: { weaponDamage: number; armor: number }
  gdrValues: Record<string, number>
  seed: string
  /**
   * The number of Combats already fought on this seed: the job fights Combats `from + 1` to `from + trials`, the same
   * Combats a batch of `from + trials` would end with. 0 when absent.
   */
  from?: number
  /** True to report, for every Combat, the final health and exhaustion of the Agents alive at its end. */
  detail?: boolean
}

/** The Agents alive at the end of one Combat, as [current health in hundredths, exhaustion, count] groups. */
export type Finals = [number, number, number][]

export type JobResult =
  | { type: 'job'; gen: number; key: string; side: 'a' | 'b'; error: string }
  | {
      type: 'job'
      gen: number
      key: string
      side: 'a' | 'b'
      fought: number
      won: number
      retreated: number
      wiped: number
      agentsDead: number
      /** The attacks the Agents made, summed over the Combats, and the most one Agent made in one Combat. */
      agentAttacks: number
      agentAttacksMax: number
      /** With `detail`, one entry per Combat, in order. */
      finals?: Finals[]
    }

interface Engine {
  developer: {
    tools: {
      fightCombat(setup: unknown):
        | {
            ok: true
            value: {
              summary: { outcome: string; agentsDead: number }
              combatReport: { agents: string[]; log: { attacker: string }[] }
              participants: {
                side: string
                dead: boolean
                finalCurrentHealthHundredths: number
                finalExhaustion: number
              }[]
            }
          }
        | { ok: false; error: { message: string } }
    }
    queries: {
      getInitiativeOperationLevels():
        | { ok: true; value: { missionSiteArchetypes: { id: string; level: number | null }[] } }
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
  (engine) => {
    // The operation level of each Initiative Mission site, for the page's labels and order; none from an engine
    // that does not answer the query.
    const levels = engine.developer.queries.getInitiativeOperationLevels()
    port.postMessage({
      type: 'ready',
      initiativeLevels: levels.ok
        ? Object.fromEntries(levels.value.missionSiteArchetypes.map((item) => [item.id, item.level]))
        : {},
    })
  },
  (e: unknown) => port.postMessage({ type: 'error', message: e instanceof Error ? e.message : String(e) }),
)

async function fight(job: Job): Promise<JobResult> {
  const engine = await booted
  const head = { type: 'job', gen: job.gen, key: job.key, side: job.side } as const
  const setup = {
    agents: job.agents,
    enemies: job.enemies,
    gdrValues: job.gdrValues,
    // The explicit values already hold what the Upgrades add. Only an engine from before the rating factor reads the
    // counts, for its own Combat rating, which only the Retreated check reads.
    ratingUpgrades: job.ratingUpgrades ?? { weaponDamage: 0, armor: 0 },
    seed: job.seed,
  }
  const from = job.from ?? 0
  // Combat i of a batch is the Detached Combat on the seed `<seed>#<i>`, so fighting them one by one fights the same
  // Combats as `fightCombatBatch`, continues a batch, and gives each Combat's report, from which the Agents' attacks
  // are counted, and its final values.
  const totals = { fought: 0, won: 0, retreated: 0, wiped: 0, agentsDead: 0, agentAttacks: 0, agentAttacksMax: 0 }
  const finals: Finals[] = []
  for (let i = from + 1; i <= from + job.trials; i += 1) {
    const result = engine.developer.tools.fightCombat({ ...setup, seed: `${job.seed}#${i}` })
    if (!result.ok) {
      return { ...head, error: result.error.message }
    }
    const { summary, participants, combatReport } = result.value
    totals.fought += 1
    totals.agentsDead += summary.agentsDead
    const attacks = new Map<string, number>(combatReport.agents.map((id) => [id, 0]))
    for (const record of combatReport.log) {
      const n = attacks.get(record.attacker)
      if (n !== undefined) {
        attacks.set(record.attacker, n + 1)
        totals.agentAttacks += 1
      }
    }
    totals.agentAttacksMax = Math.max(totals.agentAttacksMax, ...attacks.values())
    if (summary.outcome === 'Won') {
      totals.won += 1
    } else if (summary.outcome === 'Retreated') {
      totals.retreated += 1
    } else {
      totals.wiped += 1
    }
    if (job.detail) {
      const groups = new Map<string, [number, number, number]>()
      for (const p of participants) {
        if (p.side === 'agent' && !p.dead && p.finalCurrentHealthHundredths > 0) {
          const k = `${p.finalCurrentHealthHundredths}|${p.finalExhaustion}`
          const g = groups.get(k) ?? [p.finalCurrentHealthHundredths, p.finalExhaustion, 0]
          g[2] += 1
          groups.set(k, g)
        }
      }
      finals.push([...groups.values()])
    }
  }
  return { ...head, ...totals, ...(job.detail ? { finals } : {}) }
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
