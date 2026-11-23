/**
 * The CR Sweep Bench without the page, on the same state and results under data/.
 *
 *   node tools/cr-sweep-bench/cli.ts run     sweeps the measurements of the saved state that have no result yet
 *   node tools/cr-sweep-bench/cli.ts score   prints what the measurements say and scores the saved formulas
 *
 * Both take `--impl <game-v5-impl-web clone>` and `--spec <game-v5 clone>`; `score` also takes `--rows <number>`.
 */
import { analyse, logSlope, prepare, score } from './lib/model.js'
import { Pool, THREADS } from './pool.ts'
import { missing, sweepMissing } from './run.ts'
import {
  IMPL,
  Results,
  arg,
  engineKey,
  engineVersion,
  loadGdr,
  loadState,
  plan,
  type Formula,
  type Measurement,
} from './store.ts'

const gdr = loadGdr()
const state = loadState(gdr)
const engine = engineKey()
const results = new Results()
const command = process.argv[2]

type Curve = [number, number][]
interface Prepared extends Measurement {
  even: number | null
  safe: number | null
  status: string
}
interface Gap {
  m: Prepared
  predicted: number | null
  gap: number | null
  beyond?: boolean
}
interface Analysis {
  factors: Record<string, { agents: Curve; enemies: Curve }>
  counts: Record<string, { agents: Curve; enemies: Curve }>
  pairs: Gap[]
  mixes: Gap[]
  checks: Gap[]
  sites: Gap[]
  dice: { m: Prepared; margin: number }[]
}
interface Summary {
  count: number
  typical: number | null
  bias: number | null
  worst: number | null
  safeRatio: number | null
  lowestSafe: number | null
}
interface Scored {
  error?: string
  rows?: { m: Prepared; evenRatio: number; safeRatio: number | null }[]
  experiments?: Summary
  sites?: Summary
}

const pct = (v: number | null) => (v === null ? '—' : `${(v * 100).toFixed(0)}%`)
const num = (v: number | null) => (v === null ? '—' : v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2))
const spread = (gaps: Gap[]) => {
  const logs = gaps.filter((g) => g.gap !== null).map((g) => Math.log(g.gap!))
  if (logs.length === 0) {
    return 'none resolved'
  }
  const typical = Math.exp(Math.sqrt(logs.reduce((s, v) => s + v * v, 0) / logs.length)) - 1
  const worst = Math.exp(Math.max(...logs.map(Math.abs))) - 1
  return `${logs.length} resolved, typical gap ±${pct(typical)}, largest ±${pct(worst)}`
}

async function run(): Promise<void> {
  const todo = missing(state.config, gdr, engine, results).length
  console.log(`Engine ${IMPL} (${engineVersion()}), ${THREADS} worker threads; ${todo} measurements to sweep.`)
  if (todo === 0) {
    return
  }
  const pool = new Pool(IMPL)
  pool.start()
  await pool.ready
  let done = 0
  await sweepMissing(pool, state.config, gdr, engine, results, (progress) => {
    done += 1
    const what = progress.record ? `${progress.record.label}, ${progress.record.ms} ms` : `failed: ${progress.error}`
    console.log(`${done}/${todo}  ${what}`)
  })
  pool.terminate()
}

function report(): void {
  const rowCount = Number(arg('rows', '8'))
  const planned = plan(state.config, gdr, engine)
  const prepared = prepare(planned.measurements.map((m) => ({ ...m, record: results.get(m.key) }))) as Prepared[]
  const resolved = prepared.filter((m) => m.status === 'ok')
  console.log(`${prepared.length} measurements; ${resolved.length} resolved.`)
  const reasons = new Map<string, number>()
  for (const m of prepared.filter((x) => x.status !== 'ok')) {
    const reason = m.status.replace(/up to \d+/, 'up to the most swept')
    reasons.set(reason, (reasons.get(reason) ?? 0) + 1)
  }
  for (const [reason, count] of reasons) {
    console.log(`  unresolved, ${reason}: ${count}`)
  }
  const a = analyse(prepared) as Analysis

  console.log('\n== One value changed: strength in reference Combatants ==')
  for (const [stat, set] of Object.entries(a.factors)) {
    for (const role of ['agents', 'enemies'] as const) {
      const slope = logSlope(set[role]) as number | null
      console.log(
        `  ${stat.padEnd(7)} as ${role.padEnd(7)} ${set[role].map(([v, s]) => `${v}: ${num(s)}`).join('  ')}` +
          (slope === null ? '' : `   doubling it multiplies strength by ×${(2 ** slope).toFixed(2)}`),
      )
    }
  }
  console.log('\n== One type at each size ==')
  for (const [type, set] of Object.entries(a.counts)) {
    for (const role of ['agents', 'enemies'] as const) {
      const slope = logSlope(set[role]) as number | null
      console.log(
        `  ${type.padEnd(18)} as ${role.padEnd(7)} ${set[role].map(([v, s]) => `${v}: ${num(s)}`).join('  ')}` +
          (slope === null ? '' : `   doubling the count multiplies strength by ×${(2 ** slope).toFixed(2)}`),
      )
    }
  }
  const list = (title: string, gaps: Gap[], predictedAs: string) => {
    console.log(`\n== ${title}: ${spread(gaps)} ==`)
    const shown = gaps
      .filter((g) => g.gap !== null)
      .sort((x, y) => Math.abs(Math.log(y.gap!)) - Math.abs(Math.log(x.gap!)))
      .slice(0, rowCount)
    for (const g of shown) {
      console.log(
        `  measured ${num(g.m.even).padStart(6)}  ${predictedAs} ${num(g.predicted).padStart(6)}  gap ${pct(g.gap).padStart(5)}` +
          `${g.beyond ? ' (beyond the curves)' : ''}  ${g.m.label}`,
      )
    }
  }
  list('Two values changed, against independent effects', a.pairs, 'independent')
  list('Two types in one team, against the sum of the halves', a.mixes, 'sum')
  list('Cross-checks, against the yardstick', a.checks, 'yardstick')
  list('Mission sites, against the yardstick', a.sites, 'yardstick')

  console.log('\n== The dice: reference Agents for the safe win rate, over those for even odds ==')
  const bands: [number, number][] = [
    [1, 2],
    [2, 4],
    [4, 8],
    [8, 16],
    [16, 32],
    [32, Infinity],
  ]
  for (const [lo, hi] of bands) {
    const margins = a.dice
      .filter((d) => d.m.even! >= lo && d.m.even! < hi)
      .map((d) => d.margin)
      .sort((x, y) => x - y)
    if (margins.length > 0) {
      console.log(
        `  ${String(lo).padStart(2)} to ${hi === Infinity ? 'up' : hi} reference Agents at even odds: ${margins.length} sweeps, ` +
          `median ×${margins[Math.floor(margins.length / 2)]!.toFixed(2)}, highest ×${margins.at(-1)!.toFixed(2)}`,
      )
    }
  }

  const formulas: { name: string; formula: Formula }[] = [
    { name: 'Current formula', formula: state.formula },
    ...state.pinned,
  ]
  for (const { name, formula } of formulas) {
    const scored = score(formula, prepared) as Scored
    console.log(`\n== ${name} ==`)
    console.log(`  combatant: ${formula.combatant}`)
    for (const [label, expr] of [
      ['aux', formula.aux],
      ['enemy', formula.enemyCombatant],
      ['enemy team', formula.enemyTeam],
    ] as const) {
      if (expr.trim() !== '') {
        console.log(`  ${`${label}:`.padEnd(10)} ${expr}`)
      }
    }
    console.log(`  team:      ${formula.team}`)
    console.log(`  params:    ${JSON.stringify(formula.params)}`)
    if (scored.error !== undefined || !scored.rows || !scored.experiments || !scored.sites) {
      console.log(`  ${scored.error ?? 'nothing to score'}`)
      continue
    }
    const line = (label: string, s: Summary) =>
      `  ${label}: ${s.count} measurements, rating ratio at even odds typically ±${pct(s.typical)} off 100%, ` +
      `at most ±${pct(s.worst)}, mean ${pct(s.bias)}`
    console.log(line('Experiments', scored.experiments))
    console.log(line('Mission sites', scored.sites))
    console.log(
      `  Mission sites: safe at a rating ratio of ${pct(scored.sites.safeRatio)}; the lowest ratio any needs is ${pct(scored.sites.lowestSafe)}`,
    )
    const worst = [...scored.rows].sort((x, y) => Math.abs(Math.log(y.evenRatio)) - Math.abs(Math.log(x.evenRatio)))
    console.log('  Furthest from 100% at even odds:')
    for (const r of worst.slice(0, rowCount)) {
      console.log(`    ${pct(r.evenRatio).padStart(5)}  ${r.m.label}`)
    }
  }
}

if (command === 'run') {
  await run()
} else if (command === 'score') {
  report()
} else {
  console.log('Usage: node tools/cr-sweep-bench/cli.ts run | score')
  process.exitCode = 1
}
