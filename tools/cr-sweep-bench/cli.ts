/**
 * The CR Sweep Bench without the page, on the same state and results under data/.
 *
 *   node tools/cr-sweep-bench/cli.ts run     sweeps the pairings of the saved state that have no result yet
 *   node tools/cr-sweep-bench/cli.ts score   scores the saved formulas against the swept pairings, as text
 *
 * Both take `--impl <game-v5-impl-web clone>` and `--spec <game-v5 clone>`; `score` also takes `--level <percent>`,
 * `--ignore <percent>`, `--feature <id>`, and `--rows <number>`.
 */
import { FEATURES, prepare, score } from './lib/model.js'
import { Pool, THREADS } from './pool.ts'
import { missing, sweepMissing } from './run.ts'
import { IMPL, Results, arg, engineVersion, loadGdr, loadState, plan, type Formula, type SweepRecord } from './store.ts'

const gdr = loadGdr()
const state = loadState(gdr)
const engine = engineVersion()
const results = new Results()
const command = process.argv[2]

interface Row {
  pairing: { agent: { name: string }; enemy: { name: string }; needed: number }
  ratio: number
  over: number
  ignored: boolean
}
interface Scored {
  error?: string
  rows?: Row[]
  summary?: {
    threshold: number
    lowest: number
    overMean: number
    overMedian: number
    overMax: number
    evenRatio: number
    ignored: number
    unsafePoints: number
  } | null
}
interface Feature {
  id: string
  label: string
  get(pairing: unknown): number
}

const pct = (v: number) => `${(v * 100).toFixed(0)}%`

async function run(): Promise<void> {
  const todo = missing(state.config, gdr, engine, results).length
  console.log(`Engine ${IMPL} (${engine}), ${THREADS} worker threads; ${todo} pairings to sweep.`)
  if (todo === 0) {
    return
  }
  const pool = new Pool(IMPL)
  pool.start()
  await pool.ready
  let done = 0
  await sweepMissing(pool, state.config, gdr, engine, results, (progress) => {
    done += 1
    const what = progress.record
      ? `${progress.record.agent.name} against ${progress.record.enemy.name}, ${progress.record.ms} ms`
      : `failed: ${progress.error}`
    console.log(`${done}/${todo}  ${what}`)
  })
  pool.terminate()
}

function report(): void {
  const level = Number(arg('level', '95')) / 100
  const ignoreWorst = Number(arg('ignore', '0')) / 100
  const rowCount = Number(arg('rows', '10'))
  const feature = (FEATURES as Feature[]).find((f) => f.id === arg('feature', 'skillRatio'))
  const planned = plan(state.config, gdr, engine)
  const records = planned.pairings.map((p) => results.get(p.key)).filter((r): r is SweepRecord => r !== undefined)
  const prepared = prepare(records, level) as { pairings: unknown[]; excluded: { reason: string }[] }
  console.log(
    `${records.length} of ${planned.pairings.length} pairings swept; ${prepared.pairings.length} scored, ` +
      `${prepared.excluded.length} excluded. Win rate asked for: ${pct(level)}.`,
  )
  const reasons = new Map<string, number>()
  for (const e of prepared.excluded) {
    const reason = e.reason.replace(/\d+ Agents/, 'the most Agents')
    reasons.set(reason, (reasons.get(reason) ?? 0) + 1)
  }
  for (const [reason, count] of reasons) {
    console.log(`  excluded, ${reason}: ${count}`)
  }
  const formulas: { name: string; formula: Formula }[] = [
    { name: 'Current formula', formula: state.formula },
    ...state.pinned,
  ]
  for (const { name, formula } of formulas) {
    const scored = score(formula, prepared, { ignoreWorst }) as Scored
    console.log(`\n== ${name} ==`)
    console.log(`  combatant: ${formula.combatant}`)
    if (formula.aux.trim() !== '') {
      console.log(`  aux:       ${formula.aux}`)
    }
    if (formula.enemyCombatant.trim() !== '') {
      console.log(`  enemy:     ${formula.enemyCombatant}`)
    }
    console.log(`  team:      ${formula.team}`)
    console.log(`  params:    ${JSON.stringify(formula.params)}`)
    if (scored.error !== undefined || !scored.summary || !scored.rows) {
      console.log(`  ${scored.error ?? 'no pairing to score'}`)
      continue
    }
    const s = scored.summary
    console.log(
      `  safe at a rating ratio of ${pct(s.threshold)} (lowest ratio any pairing needs: ${pct(s.lowest)}); ` +
        `over-deployment mean ×${s.overMean.toFixed(3)}, median ×${s.overMedian.toFixed(3)}, most ×${s.overMax.toFixed(2)}; ` +
        `ratio at even odds ${pct(s.evenRatio)}; ${s.ignored} pairings ignored; ${s.unsafePoints} fought counts above the threshold that won too rarely.`,
    )
    const line = (r: Row) =>
      `    ratio ${pct(r.ratio).padStart(5)}  over ×${r.over.toFixed(2)}  needs ${r.pairing.needed.toFixed(1).padStart(6)} Agents  ${r.pairing.agent.name}  vs  ${r.pairing.enemy.name}`
    const byRatio = [...scored.rows].sort((a, b) => b.ratio - a.ratio)
    console.log(`  Pairings that need the highest ratio, which set the threshold:`)
    byRatio.slice(0, rowCount).forEach((r) => console.log(line(r)))
    console.log(`  Pairings that need the lowest ratio, which the threshold over-serves most:`)
    byRatio
      .slice(-rowCount)
      .reverse()
      .forEach((r) => console.log(line(r)))
    if (feature !== undefined) {
      // The pairings in four groups of equal size by the feature, lowest first.
      const sorted = [...scored.rows].sort((a, b) => feature.get(a.pairing) - feature.get(b.pairing))
      console.log(`  By ${feature.label}, in four groups of equal size:`)
      for (let i = 0; i < 4; i += 1) {
        const group = sorted.slice(Math.floor((i * sorted.length) / 4), Math.floor(((i + 1) * sorted.length) / 4))
        if (group.length === 0) {
          continue
        }
        const median = (values: number[]) => values.sort((a, b) => a - b)[Math.floor(values.length / 2)]!
        console.log(
          `    ${feature.get(group[0]!.pairing).toPrecision(3)} to ${feature.get(group.at(-1)!.pairing).toPrecision(3)}: ` +
            `${group.length} pairings, median ratio ${pct(median(group.map((r) => r.ratio)))}, median over ×${median(group.map((r) => r.over)).toFixed(2)}`,
        )
      }
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
