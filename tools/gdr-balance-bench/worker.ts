/**
 * Worker thread of server.ts. It loads the engine straight from the TypeScript source of the game-v5-impl-web clone,
 * so it runs the engine as it is on disk when the thread starts, and fights Detached Combats with
 * `developer.tools.fightCombat`.
 *
 * For one Mission site it reports the test team's win rate, then the smallest team that reaches the target win rate.
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
    /** One Detached Combat: its Combat outcome and how many Agents are dead. */
    fight(setup: unknown): { error: string } | { outcome: string; killed: number } {
      const result = engine.developer.tools.fightCombat(setup)
      if (!result.ok) {
        return { error: result.error.message }
      }
      let killed = 0
      for (const p of result.value.participants) {
        if (p.side === 'agent' && p.dead) {
          killed += 1
        }
      }
      return { outcome: String(result.value.combatReport.outcome), killed }
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

/** Fights up to `trials` Combats; with `decideOnly`, stops as soon as reaching the target is decided. */
async function rate(job: SiteJob, n: number, decideOnly: boolean): Promise<Rate> {
  await tick()
  if (job.gen !== gen) {
    return null
  }
  const engine = await booted
  const agents = new Array<unknown>(n).fill(job.agent)
  const needWins = Math.ceil((job.target / 100) * job.trials - 1e-9)
  let wins = 0
  let killed = 0
  let fought = 0
  let last = performance.now()
  for (let i = 0; i < job.trials; i += 1) {
    const r = engine.fight({ agents, enemies: job.enemies, gdrValues: job.gdrValues, seed: `${job.id}|${n}|${i}` })
    if ('error' in r) {
      return { error: r.error }
    }
    fought += 1
    wins += r.outcome === 'Prevailed' ? 1 : 0
    killed += r.killed
    if (decideOnly && (wins >= needWins || fought - wins > job.trials - needWins)) {
      break
    }
    if (performance.now() - last > 80) {
      await tick()
      last = performance.now()
      if (job.gen !== gen) {
        return null
      }
    }
  }
  return { win: (wins / fought) * 100, killed: killed / fought, pass: wins >= needWins }
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
  let lo = 1
  let hi = 0
  if (base.pass) {
    hi = job.n
  } else {
    // Double the team until it reaches the target, so a small answer never costs a Combat of the largest team.
    lo = job.n + 1
    let size = job.n
    while (size < job.maxn) {
      size = Math.min(job.maxn, size * 2)
      const r = await rate(job, size, true)
      if (r === null) {
        return
      }
      if (!('error' in r) && r.pass) {
        hi = size
        break
      }
      lo = size + 1
    }
  }
  let need: number | null = null
  if (hi > 0) {
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      const r = await rate(job, mid, true)
      if (r === null) {
        return
      }
      if (!('error' in r) && r.pass) {
        hi = mid
      } else {
        lo = mid + 1
      }
    }
    need = lo
  }
  port.postMessage({ type: 'need', gen: job.gen, id: job.id, need })
}

port.on('message', (message: SiteJob | { type: 'cancel'; gen: number }) => {
  gen = Math.max(gen, message.gen)
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
