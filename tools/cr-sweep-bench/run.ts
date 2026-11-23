/**
 * The one way the CR Sweep Bench sweeps: the pairings of a configuration that have no result as thorough as it asks
 * are swept on the pool and stored. The page's Run button and `cli.ts run` both call it.
 */
import type { Pool } from './pool.ts'
import { plan, satisfies, type Config, type Gdr, type Pairing, type Results, type SweepRecord } from './store.ts'

export interface Progress {
  key: string
  record?: SweepRecord
  error?: string
}

export function missing(config: Config, gdr: Gdr, engine: string, results: Results): Pairing[] {
  return plan(config, gdr, engine).pairings.filter((pairing) => {
    const record = results.get(pairing.key)
    return record === undefined || !satisfies(record, config)
  })
}

export async function sweepMissing(
  pool: Pool,
  config: Config,
  gdr: Gdr,
  engine: string,
  results: Results,
  onProgress: (progress: Progress) => void,
): Promise<void> {
  const { gdrValues } = plan(config, gdr, engine)
  const todo = new Map(missing(config, gdr, engine, results).map((pairing) => [pairing.key, pairing]))
  // The smallest fights first, so that results appear early.
  const size = (p: Pairing) => p.enemy.groups.reduce((sum, g) => sum + g.count, 0)
  const jobs = [...todo.values()]
    .sort((a, b) => size(a) - size(b))
    .map((pairing) => ({
      key: pairing.key,
      agent: pairing.agent,
      enemies: pairing.enemy.groups.flatMap((g) =>
        new Array<typeof g>(g.count).fill({ ...g, skill: g.skill, health: g.health, damage: g.damage, armor: g.armor }),
      ),
      gdrValues,
      trials: config.trials,
      probeTrials: Math.min(config.probeTrials, config.trials),
      maxAgents: config.maxAgents,
      maxPoints: config.maxPoints,
    }))
  await pool.run(jobs, (result) => {
    const pairing = todo.get(result.key)
    if (pairing === undefined) {
      return
    }
    if ('error' in result) {
      onProgress({ key: result.key, error: result.error })
      return
    }
    const record: SweepRecord = {
      ...pairing,
      engine,
      gdrValues,
      trials: config.trials,
      probeTrials: config.probeTrials,
      maxAgents: config.maxAgents,
      maxPoints: config.maxPoints,
      points: result.points,
      capped: result.capped,
      ms: result.ms,
    }
    results.put(record)
    onProgress({ key: result.key, record })
  })
}
