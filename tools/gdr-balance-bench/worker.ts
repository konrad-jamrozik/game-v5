/**
 * Worker thread of server.ts. It loads the engine straight from the TypeScript source of the game-v5-impl-web clone,
 * so it runs the engine as it is on disk when the thread starts, and fights Detached Combats with
 * `developer.tools.fightCombatBatch`.
 *
 * For one Mission site it reports the test team's win rate, then the smallest team that reaches the target win rate.
 * That search starts from a team size estimated from Combat ratings, steps outward from it until the answer is
 * bracketed, and then bisects; each team size tried stops its batch as soon as its answer is certain.
 */
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { parentPort, workerData } from 'node:worker_threads'

interface SiteJob {
  type: 'site'
  gen: number
  id: string
  enemies: unknown[]
  agent: unknown
  n: number
  gdrValues: Record<string, number>
  target: number
  trials: number
  maxn: number
  /** The Combat rating of the site's Enemies at full health, i.e. the sum of their effective skills. */
  rating: number
  /** The effective skill of one Agent of the test team. */
  agentRating: number
}

/** A site already solved in this run: its Combat rating and the team size it needs. */
interface Hint {
  rating: number
  need: number
}

type Rate = { win: number; killed: number; pass: boolean } | { error: string } | null

const impl = (workerData as { impl: string }).impl
const port = parentPort!
const tick = () => new Promise<void>((resolve) => setImmediate(resolve))

async function boot() {
  const { MemoryStorage, createEngine } = await import(pathToFileURL(path.join(impl, 'src/engine/index.ts')).href)
  const { bootstrapGdrCatalog, COMBAT_GDR_VALUE_NAMES } = await import(
    pathToFileURL(path.join(impl, 'src/gdr/index.ts')).href
  )
  let id = 0
  const engine = await createEngine({
    storage: new MemoryStorage(),
    newId: () => `id-${(id += 1)}`,
    randomNumbers: (n: number) => new Array<number>(n).fill(7),
  })
  const created = await engine.session.campaign.create({ seed: 'gdr-balance-bench' })
  if (!created.ok) {
    throw new Error(created.error.message)
  }
  const enabled = engine.session.developer.enable()
  if (!enabled.ok) {
    throw new Error(enabled.error.message)
  }
  const levels = engine.developer.queries.getInitiativeOperationLevels()
  if (!levels.ok) {
    throw new Error(levels.error.message)
  }
  // The order in which a new Mission site of each MissionSiteArchetype creates its Enemies, read from one Combat.
  const enemyOrder: Record<string, string[]> = {}
  for (const site of bootstrapGdrCatalog().missionSiteArchetypes) {
    const probe = engine.developer.tools.fightCombat({
      agents: [
        {
          kind: 'explicit',
          baseSkill: 1,
          currentHealth: 1,
          effectiveMaxHealth: 1,
          exhaustion: 0,
          effectiveWeaponDamage: 1,
        },
      ],
      enemies: { missionSiteArchetype: site.id },
      seed: '1',
    })
    if (!probe.ok) {
      throw new Error(probe.error.message)
    }
    const order: string[] = []
    for (const p of probe.value.participants) {
      if (p.side === 'enemy' && p.named !== null && !order.includes(p.named.id)) {
        order.push(p.named.id)
      }
    }
    enemyOrder[site.id] = order
  }
  return {
    /**
     * One batch of Detached Combats, `developer.tools.fightCombatBatch(setup, count)`: how many Combats Prevailed and
     * how many Agents are dead over the batch. It builds no Combat report.
     */
    fightBatch(
      setup: unknown,
      count: number,
      stop?: { prevailed: number; notPrevailed: number },
    ): { error: string } | { fought: number; prevailed: number; agentsDead: number } {
      const result = engine.developer.tools.fightCombatBatch(setup, count, stop)
      if (!result.ok) {
        return { error: result.error.message }
      }
      const { fought, prevailed, agentsDead } = result.value.totals
      return { fought, prevailed, agentsDead }
    },
    initiativeLevels: Object.fromEntries(
      levels.value.missionSiteArchetypes.map((item: { id: string; level: number | null }) => [item.id, item.level]),
    ),
    enemyOrder,
    combatGdrValueNames: (COMBAT_GDR_VALUE_NAMES ?? null) as string[] | null,
  }
}

const booted = boot()
booted.then(
  (b) =>
    port.postMessage({
      type: 'ready',
      initiativeLevels: b.initiativeLevels,
      enemyOrder: b.enemyOrder,
      combatGdrValueNames: b.combatGdrValueNames,
    }),
  (e: unknown) => port.postMessage({ type: 'error', message: e instanceof Error ? e.message : String(e) }),
)

/** The newest run the server has announced; a job of an older run stops at its next check. */
let gen = 0
/** The sites solved in the newest run, which server.ts passes on to every worker thread. */
let hints: Hint[] = []

/**
 * Fights `trials` Combats of a team of `n` in one batch, Combat `i` with the Detached seed `<site>|<n>#<i>`, so
 * `fightCombat` with that seed shows any one of them in full. With `decideOnly`, the batch stops as soon as it is
 * certain whether the team reaches the target, so the rate it reports is over the Combats fought.
 */
async function rate(job: SiteJob, n: number, decideOnly: boolean): Promise<Rate> {
  await tick()
  if (job.gen !== gen) {
    return null
  }
  const engine = await booted
  const agents = new Array<unknown>(n).fill(job.agent)
  const needWins = Math.ceil((job.target / 100) * job.trials - 1e-9)
  const r = engine.fightBatch(
    { agents, enemies: job.enemies, gdrValues: job.gdrValues, seed: `${job.id}|${n}` },
    job.trials,
    decideOnly ? { prevailed: needWins, notPrevailed: job.trials - needWins + 1 } : undefined,
  )
  if ('error' in r) {
    return { error: r.error }
  }
  return { win: (r.prevailed / r.fought) * 100, killed: r.agentsDead / r.fought, pass: r.prevailed >= needWins }
}

/**
 * The team size to try first. Teams that need equal strength scale with the Enemies' Combat rating, so the estimate
 * is the need of the solved site whose Combat rating is closest, scaled by the ratio of the two ratings; with no site
 * solved yet, it is the team whose Combat rating equals the Enemies'.
 */
function estimate(job: SiteJob): number {
  let best: Hint | null = null
  for (const hint of hints) {
    if (best === null || Math.abs(Math.log(hint.rating / job.rating)) < Math.abs(Math.log(best.rating / job.rating))) {
      best = hint
    }
  }
  const guess =
    best !== null && job.rating > 0 ? (best.need * job.rating) / best.rating : job.rating / Math.max(1, job.agentRating)
  return Math.min(job.maxn, Math.max(1, Math.round(guess)))
}

async function run(job: SiteJob): Promise<void> {
  const base = await rate(job, job.n, false)
  if (base === null) {
    return
  }
  if ('error' in base) {
    port.postMessage({ type: 'failed', gen: job.gen, id: job.id, message: base.error })
    return
  }
  port.postMessage({ type: 'rate', gen: job.gen, id: job.id, win: base.win, killed: base.killed })
  // The smallest team known to pass is hi, and every team below lo is known to fail; hi of 0 means none passes yet.
  let lo = base.pass ? 1 : job.n + 1
  let hi = base.pass ? job.n : 0
  /** Fights a team size of the search; null when the run was replaced. */
  const passes = async (size: number): Promise<boolean | null> => {
    const r = await rate(job, size, true)
    return r === null ? null : !('error' in r) && r.pass
  }
  const start = Math.min(hi > 0 ? hi : job.maxn, Math.max(lo, estimate(job)))
  // The first step is a few percent of the estimate, so the answer is usually bracketed by the first one or two tries.
  const firstStep = Math.max(1, Math.round(start * 0.04))
  if (hi === 0 || start < hi) {
    const first = await passes(start)
    if (first === null) {
      return
    }
    if (first) {
      hi = start
      // Step down from the estimate, doubling the step, until a size fails.
      for (let step = firstStep; hi - step >= lo; step *= 2) {
        const result = await passes(hi - step)
        if (result === null) {
          return
        }
        if (!result) {
          lo = hi - step + 1
          break
        }
        hi -= step
      }
    } else {
      lo = start + 1
      // Step up from the estimate, doubling the step, until a size passes or the largest team fails.
      for (let step = firstStep; lo <= job.maxn; step *= 2) {
        const size = Math.min(job.maxn, start + step)
        const result = await passes(size)
        if (result === null) {
          return
        }
        if (result) {
          hi = size
          break
        }
        lo = size + 1
      }
    }
  }
  let need: number | null = null
  if (hi > 0) {
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      const result = await passes(mid)
      if (result === null) {
        return
      }
      if (result) {
        hi = mid
      } else {
        lo = mid + 1
      }
    }
    need = hi
  }
  port.postMessage({ type: 'need', gen: job.gen, id: job.id, need, rating: job.rating })
}

port.on('message', (message: SiteJob | { type: 'cancel'; gen: number } | ({ type: 'hint'; gen: number } & Hint)) => {
  if (message.gen > gen) {
    hints = []
  }
  gen = Math.max(gen, message.gen)
  if (message.type === 'hint') {
    if (message.gen === gen) {
      hints.push({ rating: message.rating, need: message.need })
    }
    return
  }
  if (message.type === 'site') {
    run(message).catch((e: unknown) =>
      port.postMessage({
        type: 'failed',
        gen: message.gen,
        id: message.id,
        message: e instanceof Error ? e.message : String(e),
      }),
    )
  }
})
