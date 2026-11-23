/**
 * The one way the CR Sweep Bench sweeps: the measurements of a configuration that have no result as thorough as it
 * asks are swept on the pool and stored. The page's Run button and `cli.ts run` both call it.
 */
import type { Pool } from './pool.ts'
import { plan, satisfies, type Config, type Gdr, type Measurement, type Results, type SweepRecord } from './store.ts'

export interface Progress {
  key: string
  record?: SweepRecord
  error?: string
}

export function missing(config: Config, gdr: Gdr, engine: string, results: Results): Measurement[] {
  const unswept = plan(config, gdr, engine).measurements.filter((m) => {
    const record = results.get(m.key)
    return record === undefined || !satisfies(record, config)
  })
  // Measurements of one key share one sweep.
  return [...new Map(unswept.map((m) => [m.key, m])).values()]
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
  const todo = new Map(missing(config, gdr, engine, results).map((m) => [m.key, m]))
  const fixedOf = (m: Measurement) => (m.swept === 'agents' ? m.enemies : m.agents)
  // The smallest fights first, so that results appear early.
  const size = (m: Measurement) => fixedOf(m).reduce((sum, g) => sum + g.count, 0)
  const jobs = [...todo.values()]
    .sort((a, b) => size(a) - size(b))
    .map((m) => ({
      key: m.key,
      swept: m.swept,
      unit: m.unit,
      fixed: fixedOf(m).flatMap((g) => new Array<typeof g>(g.count).fill(g)),
      gdrValues,
      trials: config.trials,
      probeTrials: Math.min(config.probeTrials, config.trials),
      maxCount: config.maxCount,
      maxPoints: config.maxPoints,
    }))
  await pool.run(jobs, (result) => {
    const m = todo.get(result.key)
    if (m === undefined) {
      return
    }
    if ('error' in result) {
      onProgress({ key: result.key, error: `${m.label}: ${result.error}` })
      return
    }
    const record: SweepRecord = {
      key: m.key,
      label: m.label,
      swept: m.swept,
      unit: m.unit,
      agents: m.agents,
      enemies: m.enemies,
      engine,
      gdrValues,
      trials: config.trials,
      probeTrials: config.probeTrials,
      maxCount: config.maxCount,
      maxPoints: config.maxPoints,
      points: result.points,
      capped: result.capped,
      ms: result.ms,
    }
    results.put(record)
    onProgress({ key: result.key, record })
  })
}
