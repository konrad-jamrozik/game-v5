/**
 * Worker thread of server.ts. It loads the engine straight from the TypeScript source of the game-v5-impl-web clone,
 * so it runs the engine as it is on disk when the thread starts, and fights the probes server.ts hands it: each one
 * batch of Detached Combats of one team size at one Mission site, `developer.tools.fightCombatBatch`. The search that
 * chooses the probes is in search.ts and runs in server.ts, so one site's search can use several threads at once.
 */
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { parentPort, workerData } from 'node:worker_threads'

import type { Probe, ProbeResult } from './search.ts'

const impl = (workerData as { impl: string }).impl
const port = parentPort!

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

/**
 * Fights one probe: Combat `i` of a team of `size` has the Detached seed `<site>|<size>#<i>`, so `fightCombat` with
 * that seed shows it in full. Unless `full`, the batch stops as soon as it is certain whether the team reaches the
 * target, so the rate is over the Combats fought.
 */
async function fight(probe: Probe): Promise<ProbeResult> {
  const engine = await booted
  const head = { type: 'probe', gen: probe.gen, id: probe.id, size: probe.size, full: probe.full } as const
  const needWins = Math.ceil((probe.target / 100) * probe.trials - 1e-9)
  const r = engine.fightBatch(
    {
      agents: new Array<unknown>(probe.size).fill(probe.agent),
      enemies: probe.enemies,
      gdrValues: probe.gdrValues,
      // COMBAT, Detached Combat: the Rating Upgrades of the Agents' side; an engine that predates them ignores the part.
      ratingUpgrades: probe.ratingUpgrades,
      seed: `${probe.id}|${probe.size}`,
    },
    probe.trials,
    probe.full ? undefined : { prevailed: needWins, notPrevailed: probe.trials - needWins + 1 },
  )
  if ('error' in r) {
    return { ...head, error: r.error }
  }
  return {
    ...head,
    fought: r.fought,
    win: (r.prevailed / r.fought) * 100,
    killed: r.agentsDead / r.fought,
    pass: r.prevailed >= needWins,
  }
}

port.on('message', (probe: Probe) => {
  fight(probe).then(
    (result) => port.postMessage(result),
    (e: unknown) =>
      port.postMessage({
        type: 'probe',
        gen: probe.gen,
        id: probe.id,
        size: probe.size,
        full: probe.full,
        error: e instanceof Error ? e.message : String(e),
      }),
  )
})
