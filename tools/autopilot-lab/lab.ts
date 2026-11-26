/**
 * Autopilot Lab: plays many Campaigns with the Basic Autopilot AI, headless and in parallel, and prints one compact
 * summary to compare sets of Tuning parameters or two Implementation clones on the same seeds. It is the tool for a
 * Balancing run, which Campaign Tests allows only when the Game designer asks for one.
 *
 * Usage:
 *   node tools/autopilot-lab/lab.ts [--campaigns 20] [--turns 200] [--seeds lab] [--set key=value,...]
 *     [--vs key=value,...] [--impl <clone>] [--impl-b <clone>] [--threads <n>] [--out <folder>] [--json]
 *     [--limit <seconds, at most 180>]
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Worker } from 'node:worker_threads'
import type { CampaignResult, CombatRecord, FromWorker, LabTask, TurnRow } from './protocol.ts'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const argv = process.argv.slice(2)
const flag = (name: string) => argv.includes(`--${name}`)
const values = (name: string): string[] =>
  argv.flatMap((value, index) => (argv[index - 1] === `--${name}` ? [value] : []))
const arg = (name: string, fallback: string) => values(name).at(-1) ?? fallback

/** The Implementation repo: the sibling of the Spec repo's main local clone, also from a worktree of it. */
function defaultImpl(): string {
  const common = execFileSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], {
    cwd: HERE,
    encoding: 'utf8',
  }).trim()
  return path.join(path.dirname(path.dirname(common)), 'game-v5-impl-web')
}

/** `key=value,key=value` pairs as Tuning parameters; numbers where they parse. */
function parseSets(list: readonly string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const pair of list.flatMap((item) => item.split(','))) {
    const at = pair.indexOf('=')
    if (at < 1) {
      throw new Error(`Give each parameter as key=value, not "${pair}".`)
    }
    const raw = pair.slice(at + 1).trim()
    const number = Number(raw)
    out[pair.slice(0, at).trim()] = raw !== '' && Number.isFinite(number) ? number : raw
  }
  return out
}

const campaigns = Math.max(1, Number(arg('campaigns', '20')))
const turns = Math.max(1, Number(arg('turns', '200')))
const prefix = arg('seeds', 'lab')
const implA = path.resolve(arg('impl', defaultImpl()))
const implB = path.resolve(arg('impl-b', implA))
const paramsA = parseSets(values('set'))
const comparing = values('vs').length > 0 || implB !== implA
const paramsB = { ...paramsA, ...parseSets(values('vs')) }
const threads = Math.max(1, Number(arg('threads', String(Math.max(1, os.availableParallelism() - 1)))))
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const out = path.resolve(arg('out', path.join(os.tmpdir(), 'autopilot-lab', stamp)))
fs.mkdirSync(out, { recursive: true })

interface Variant {
  readonly name: string
  readonly impl: string
  readonly params: Record<string, unknown>
}
const variants: Variant[] = [{ name: 'A', impl: implA, params: paramsA }]
if (comparing) {
  variants.push({ name: 'B', impl: implB, params: paramsB })
}

function commitOf(impl: string): string {
  try {
    const head = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: impl, encoding: 'utf8' }).trim()
    const dirty = execFileSync('git', ['status', '--porcelain', '--', 'src', 'content'], {
      cwd: impl,
      encoding: 'utf8',
    }).trim()
    return dirty === '' ? head : `${head}+changes`
  } catch {
    return 'unknown'
  }
}

/** ALAB, Run time limit: three minutes from the start of the Lab run; `--limit` may only shorten it, in seconds. */
const LIMIT_SECONDS = 180
const limitSeconds = Math.min(LIMIT_SECONDS, Math.max(1, Number(arg('limit', String(LIMIT_SECONDS)))))
const began = performance.now()

/** What the Run time limit cut short of one variant: Campaigns stopped while being played, and never started. */
interface Cut {
  readonly stopped: number
  readonly notStarted: number
}

/**
 * Plays every task of one variant on its own pool of worker threads until the Run time limit, when every Campaign still
 * being played is stopped and no other is started.
 */
async function run(
  variant: Variant,
  share: number,
): Promise<{ results: CampaignResult[]; failures: string[]; cut: Cut }> {
  const tasks: LabTask[] = Array.from({ length: campaigns }, (_, i) => ({
    variant: variant.name,
    seed: `${prefix}-${i + 1}`,
    turns,
    params: variant.params,
    log: path.join(out, `${variant.name}-${prefix}-${i + 1}.json`),
  }))
  const results: CampaignResult[] = []
  const failures: string[] = []
  const pool = Math.max(1, Math.min(share, tasks.length))
  const playing = new Set<Worker>()
  const stops: (() => void)[] = []
  let timedOut = false
  let stopped = 0
  const deadline = setTimeout(
    () => {
      timedOut = true
      stopped = playing.size
      for (const stop of stops) stop()
    },
    Math.max(0, began + limitSeconds * 1000 - performance.now()),
  )
  await Promise.all(
    Array.from(
      { length: pool },
      () =>
        new Promise<void>((resolve, reject) => {
          const worker = new Worker(path.join(HERE, 'worker.ts'), { workerData: { impl: variant.impl } })
          stops.push(() => {
            playing.delete(worker)
            void worker.terminate().then(() => resolve())
          })
          const next = () => {
            const task = timedOut ? undefined : tasks.shift()
            if (task === undefined) {
              playing.delete(worker)
              void worker.terminate().then(() => resolve())
              return
            }
            playing.add(worker)
            worker.postMessage(task)
          }
          worker.on('message', (message: FromWorker) => {
            if (timedOut) return
            if (message.type === 'done') {
              results.push(message.result)
              process.stderr.write('.')
            } else if (message.type === 'failed') {
              failures.push(`${message.variant} ${message.seed}: ${message.message}`)
              process.stderr.write('x')
            }
            next()
          })
          worker.on('error', (error) => (timedOut ? resolve() : reject(error)))
        }),
    ),
  )
  clearTimeout(deadline)
  results.sort((a, b) => a.seed.localeCompare(b.seed, 'en', { numeric: true }))
  return { results, failures, cut: { stopped, notStarted: tasks.length } }
}

// ---- Summary ------------------------------------------------------------------------------------

const quantile = (list: readonly number[], q: number): number | null => {
  if (list.length === 0) return null
  const sorted = [...list].sort((a, b) => a - b)
  const at = q * (sorted.length - 1)
  const low = sorted[Math.floor(at)] ?? 0
  const high = sorted[Math.ceil(at)] ?? low
  return low + (high - low) * (at - Math.floor(at))
}
const round = (value: number | null, digits = 0) =>
  value === null ? '—' : value.toLocaleString('en-US', { maximumFractionDigits: digits })
const spread = (list: readonly number[], digits = 0) =>
  list.length === 0
    ? '—'
    : `${round(quantile(list, 0.5), digits)} (${round(quantile(list, 0.25), digits)}–${round(quantile(list, 0.75), digits)})`
const mean = (list: readonly number[]) => (list.length === 0 ? 0 : list.reduce((s, v) => s + v, 0) / list.length)

function endingKey(result: CampaignResult): string {
  if (result.error !== null) return 'Error'
  if (result.ending === null) return `Playing at Turn ${turns}`
  return result.ending.ending === 'Victory' ? 'Victory' : `Defeat: ${result.ending.reasons.join(' + ')}`
}

const DETECTORS: readonly [string, string, (r: CampaignResult) => number | string | null][] = [
  [
    'Contracting idle ≥ 10 Turns',
    'contractingIdleTurns',
    (r) => (r.detectors.contractingIdleTurns >= 10 ? r.detectors.contractingIdleTurns : null),
  ],
  ['Upgrade bought 3+ times in a Turn', 'repeatedPurchase', (r) => r.detectors.repeatedPurchase],
  [
    'Knife carriers beside stored Weapons ≥ 10 Turns',
    'strandedWeaponTurns',
    (r) => (r.detectors.strandedWeaponTurns >= 10 ? r.detectors.strandedWeaponTurns : null),
  ],
  [
    'Strike team short of goal ≥ 50 Turns in a row',
    'strikeShortTurns',
    (r) => (r.detectors.strikeShortTurns >= 50 ? r.detectors.strikeShortTurns : null),
  ],
  [
    'Projected income below upkeep ≥ 10 Turns in a row',
    'negativeNetTurns',
    (r) => (r.detectors.negativeNetTurns >= 10 ? r.detectors.negativeNetTurns : null),
  ],
  [
    '200+ Player actions in a Turn',
    'maxActionsPerTurn',
    (r) => (r.detectors.maxActionsPerTurn >= 200 ? r.detectors.maxActionsPerTurn : null),
  ],
]

function table(header: readonly string[], rows: readonly (readonly string[])[]): string {
  return [
    `| ${header.join(' | ')} |`,
    `| ${header.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.join(' | ')} |`),
  ].join('\n')
}

/**
 * AIEXPECT, Glossary, Loss share, of each Campaign that ends in Victory, in percent: its Mission sites Expired or whose
 * Mission is Lost, among those Expired or whose Mission is Won or Lost.
 */
function victoryLossShares(results: readonly CampaignResult[]): number[] {
  return results.flatMap((x) => {
    if (x.ending?.ending !== 'Victory') return []
    const sites = Object.values(x.missions)
    const lost = sites.reduce((sum, m) => sum + m.lost + m.expired, 0)
    const all = lost + sites.reduce((sum, m) => sum + m.won, 0)
    return all === 0 ? [] : [(100 * lost) / all]
  })
}

function summarize(
  runs: readonly { variant: Variant; results: CampaignResult[]; failures: string[]; cut: Cut }[],
  seconds: number,
) {
  const names = runs.map((r) => r.variant.name)
  const lines: string[] = []
  lines.push(`# Autopilot Lab: ${campaigns} Campaigns × up to ${turns} Turns, seeds ${prefix}-1…${prefix}-${campaigns}`)
  lines.push('')
  for (const { variant } of runs) {
    const params = Object.keys(variant.params).length === 0 ? 'defaults' : JSON.stringify(variant.params)
    lines.push(`- **${variant.name}:** ${variant.impl} @ ${commitOf(variant.impl)}; parameters ${params}`)
  }
  lines.push(`- Wall-clock ${seconds.toFixed(1)} s on ${threads} threads; records in ${out}`)
  for (const { variant, cut } of runs) {
    if (cut.stopped + cut.notStarted > 0) {
      lines.push(
        `- **${variant.name} stopped at the Run time limit of ${limitSeconds} s:** ${cut.stopped} Campaigns stopped while being played and ${cut.notStarted} never started; the summary holds only the finished ones.`,
      )
    }
  }
  lines.push('')

  // Endings.
  const keys = [...new Set(runs.flatMap((r) => r.results.map(endingKey)))].sort()
  lines.push('## Endings')
  lines.push('')
  lines.push(
    table(
      ['Ending', ...names],
      [
        ...keys.map((key) => [key, ...runs.map((r) => String(r.results.filter((x) => endingKey(x) === key).length))]),
        [
          'Turn of the ending, median (p25–p75)',
          ...runs.map((r) => spread(r.results.flatMap((x) => (x.ending ? [x.ending.turn] : [])))),
        ],
        ['Loss share of Victories %, median (p25–p75)', ...runs.map((r) => spread(victoryLossShares(r.results)))],
        [
          'Victories with a Loss share of 20% or more',
          ...runs.map((r) => String(victoryLossShares(r.results).filter((share) => share >= 20).length)),
        ],
      ],
    ),
  )
  lines.push('')

  // Over time.
  const checkpoints = [
    ...new Set([10, 25, 50, 75, 100, 150, 200, 300, 400, 500, turns].filter((t) => t <= turns)),
  ].sort((a, b) => a - b)
  const at = (r: CampaignResult, turn: number): TurnRow | undefined => r.rows.find((row) => row.turn === turn)
  const metrics: readonly [string, (row: TurnRow) => number, number][] = [
    ['Panic', (row) => row.panic, 0],
    ['Money', (row) => row.money, 0],
    ['Net income', (row) => row.income - row.upkeep, 0],
    ['Agents', (row) => row.agents, 0],
    ['Contracting / cap %', (row) => (row.contractingCap === 0 ? 0 : (100 * row.contracting) / row.contractingCap), 0],
    ['On Recovery %', (row) => (row.agents === 0 ? 0 : (100 * row.recovery) / row.agents), 0],
    ['Research points/Turn', (row) => row.research, 1],
    ['Strike rating / goal %', (row) => (row.goal === 0 ? 0 : (100 * row.strikeRating) / row.goal), 0],
    ['Mean base skill', (row) => row.meanSkill, 0],
    ['Killed so far', (row) => row.killed, 0],
    ['Strike weapon damage', (row) => row.strikeWeapon ?? 0, 1],
    ['Strike armor', (row) => row.strikeArmor ?? 0, 1],
  ]
  lines.push('## Over time')
  lines.push('')
  lines.push('Median (p25–p75) over the Campaigns still being played at that Turn.')
  lines.push('')
  for (const run of runs) {
    lines.push(`### ${run.variant.name}`)
    lines.push('')
    lines.push(
      table(
        ['Turn', ...checkpoints.map(String)],
        [
          ['Campaigns', ...checkpoints.map((t) => String(run.results.filter((r) => at(r, t) !== undefined).length))],
          ...metrics.map(([label, read, digits]) => [
            label,
            ...checkpoints.map((t) =>
              spread(
                run.results.flatMap((r) => {
                  const row = at(r, t)
                  return row === undefined ? [] : [read(row)]
                }),
                digits,
              ),
            ),
          ]),
        ],
      ),
    )
    lines.push('')
  }

  // Missions.
  const archetypes = new Map<string, { kind: string; rating: number }>()
  for (const run of runs)
    for (const r of run.results)
      for (const [id, m] of Object.entries(r.missions)) archetypes.set(id, { kind: m.kind, rating: m.rating })
  const ordered = [...archetypes.entries()].sort(
    (a, b) => a[1].kind.localeCompare(b[1].kind) || a[1].rating - b[1].rating,
  )
  lines.push('## Missions')
  lines.push('')
  lines.push(
    'Per Campaign on average: Won / Lost / Expired; then the share of Campaigns with a win and the median Turn of the first win.',
  )
  lines.push('')
  lines.push(
    table(
      ['Mission site', 'CR', ...names.flatMap((n) => [`${n} W/L/E`, `${n} won in`, `${n} first win`])],
      ordered.map(([id, info]) => [
        `${info.kind} ${id}`,
        round(info.rating),
        ...runs.flatMap((run) => {
          const list = run.results.map((r) => r.missions[id])
          const sum = (k: 'won' | 'lost' | 'expired') => mean(list.map((m) => m?.[k] ?? 0))
          const firsts = list.flatMap((m) => (m?.firstWin == null ? [] : [m.firstWin]))
          return [
            `${round(sum('won'), 1)} / ${round(sum('lost'), 1)} / ${round(sum('expired'), 1)}`,
            `${Math.round((100 * firsts.length) / Math.max(1, list.length))}%`,
            firsts.length === 0 ? '—' : `T${round(quantile(firsts, 0.5))}`,
          ]
        }),
      ]),
    ),
  )
  lines.push('')

  // Panic.
  const levels = [...new Set(runs.flatMap((r) => r.results.flatMap((x) => Object.keys(x.panic.byLevel))))].sort()
  lines.push('## Panic, per Campaign on average')
  lines.push('')
  lines.push(
    table(
      ['Source', ...names],
      [
        ...levels.map((level) => [
          level,
          ...runs.map((r) => round(mean(r.results.map((x) => x.panic.byLevel[level] ?? 0)), 1)),
        ]),
        ['Reduced by Won Missions', ...runs.map((r) => round(mean(r.results.map((x) => x.panic.reduced)), 1))],
      ],
    ),
  )
  lines.push('')

  // Response Mission sites when they appear.
  lines.push('## Response Mission sites when they appear')
  lines.push('')
  lines.push(
    "Per operation level and outcome: how many, and the median (p25–p75) of the ready Combat rating over the Enemies' in %, i.e. the strongest Deployable Agents within the free Transport cap; then Deployable Agents against those the Enemies ask for.",
  )
  lines.push('')
  const outcomes = [
    ...new Set(
      runs.flatMap((r) => r.results.flatMap((x) => (x.responses ?? []).map((s) => `L${s.level} ${s.outcome}`))),
    ),
  ].sort()
  lines.push(
    table(
      ['Level and outcome', ...names.flatMap((n) => [`${n} sites`, `${n} ready %`, `${n} deployable / needed`])],
      outcomes.map((key) => [
        key,
        ...runs.flatMap((r) => {
          const list = r.results.flatMap((x) => (x.responses ?? []).filter((s) => `L${s.level} ${s.outcome}` === key))
          return [
            String(list.length),
            spread(list.map((s) => (100 * s.ready) / Math.max(1, s.rating))),
            `${spread(list.map((s) => s.deployable))} / ${spread(list.map((s) => s.needed))}`,
          ]
        }),
      ]),
    ),
  )
  lines.push('')

  // Combats by the ratio of the Combat ratings at Combat start.
  const bands: readonly [string, number, number][] = [
    ['below 100%', 0, 100],
    ['100% to 110%', 100, 110],
    ['110% to 150%', 110, 150],
    ['150% to 200%', 150, 200],
    ['200% to 400%', 200, 400],
    ['400% and above', 400, Infinity],
  ]
  const ratio = (c: CombatRecord) => (c.enemiesRating === 0 ? Infinity : (100 * c.agentsRating) / c.enemiesRating)
  lines.push('## Combats by the ratio of the Combat ratings at Combat start')
  lines.push('')
  lines.push(
    'Every Combat a Mission fought: how many, the share Lost, the Agents dead per Combat, and the share of Combats in which an Agent ran out of Ammo.',
  )
  lines.push('')
  lines.push(
    table(
      [
        'Agents : Enemies',
        ...names.flatMap((n) => [`${n} Combats`, `${n} Lost`, `${n} dead/Combat`, `${n} out of Ammo`]),
      ],
      bands.map(([label, low, high]) => [
        label,
        ...runs.flatMap((r) => {
          const list = r.results.flatMap((x) => (x.combats ?? []).filter((c) => ratio(c) >= low && ratio(c) < high))
          const pct = (part: number) => (list.length === 0 ? '—' : `${Math.round((100 * part) / list.length)}%`)
          return [
            String(list.length),
            pct(list.filter((c) => c.outcome !== 'Won').length),
            round(mean(list.map((c) => c.agentsDead)), 2),
            pct(list.filter((c) => c.outOfAmmoAttacks > 0).length),
          ]
        }),
      ]),
    ),
  )
  lines.push('')
  for (const run of runs) {
    const lost = run.results
      .flatMap((x) => (x.combats ?? []).map((c) => ({ ...c, seed: x.seed })))
      .filter((c) => c.outcome !== 'Won' && ratio(c) >= 110)
      .sort((a, b) => ratio(b) - ratio(a))
    lines.push(`### ${run.variant.name}: Lost Combats at 110% or more, the strongest first (${lost.length})`)
    lines.push('')
    lines.push(
      table(
        [
          'Campaign',
          'Turn',
          'Mission site',
          'Ratio',
          'Agents vs Enemies',
          'Outcome, rounds',
          'Agents dead',
          'Out-of-Ammo attacks',
          'Combat setup seed',
        ],
        lost
          .slice(0, 12)
          .map((c) => [
            c.seed,
            String(c.turn),
            `${c.kind} ${c.archetype}`,
            `${Math.round(ratio(c))}% (${c.agentsRating} : ${c.enemiesRating})`,
            `${c.agents} vs ${c.enemies}`,
            `${c.outcome}, ${c.rounds}`,
            String(c.agentsDead),
            String(c.outOfAmmoAttacks),
            c.setupSeed === null ? '—' : `\`${c.setupSeed}\``,
          ]),
      ),
    )
    lines.push('')
    // CONFIG, Campaign setup seed: each Campaign quoted above, to create it again in the game and play it to the Turn.
    const quoted = [...new Set(lost.slice(0, 12).map((c) => c.seed))]
    if (quoted.length > 0) {
      lines.push('Campaign setup seeds of the Campaigns above, for the Seed field of the New Campaign panel:')
      lines.push('')
      for (const seed of quoted) {
        const setupSeed = run.results.find((x) => x.seed === seed)?.setupSeed ?? null
        lines.push(`- ${seed}: ${setupSeed === null ? '—' : `\`${setupSeed}\``}`)
      }
      lines.push('')
    }
  }

  // Progress, Upgrades.
  const upgradeIds = [...new Set(runs.flatMap((r) => r.results.flatMap((x) => Object.keys(x.upgrades))))]
  lines.push('## Progress and purchases, at the end, per Campaign on average')
  lines.push('')
  lines.push(
    table(
      ['Value', ...names],
      [
        ['Leads completed', ...runs.map((r) => round(mean(r.results.map((x) => x.leadsCompleted)), 1))],
        ['Leads discovered', ...runs.map((r) => round(mean(r.results.map((x) => x.leadsDiscovered)), 1))],
        ...upgradeIds.map((id) => [
          `Upgrade ${id}`,
          ...runs.map((r) => round(mean(r.results.map((x) => x.upgrades[id] ?? 0)), 1)),
        ]),
        ...[...new Set(runs.flatMap((r) => r.results.flatMap((x) => Object.keys(x.spent ?? {}))))]
          .sort()
          .map((kind) => [
            `Money spent: ${kind}`,
            ...runs.map((r) => round(mean(r.results.map((x) => x.spent?.[kind] ?? 0)))),
          ]),
        ['Seconds per Campaign', ...runs.map((r) => round(mean(r.results.map((x) => x.seconds)), 2))],
      ],
    ),
  )
  lines.push('')

  // Detectors.
  lines.push('## Detectors')
  lines.push('')
  lines.push(
    "Campaigns flagged, with the worst seed. A flag points at a defect to look at in that seed's record, not at balance.",
  )
  lines.push('')
  lines.push(
    table(
      ['Detector', ...names],
      DETECTORS.map(([label, , read]) => [
        label,
        ...runs.map((run) => {
          const flagged = run.results.flatMap((r) => {
            const value = read(r)
            return value === null ? [] : [{ seed: r.seed, value }]
          })
          if (flagged.length === 0) return '0'
          const worst = [...flagged].sort((a, b) =>
            typeof b.value === 'number' && typeof a.value === 'number' ? b.value - a.value : 0,
          )[0]
          return `${flagged.length} (e.g. ${worst?.seed}: ${worst?.value})`
        }),
      ]),
    ),
  )
  lines.push('')
  const errors = runs.flatMap((r) => [
    ...r.failures,
    ...r.results.flatMap((x) =>
      x.error === null ? [] : [`${x.variant} ${x.seed} (${x.setupSeed ?? 'no setup seed'}): ${x.error}`],
    ),
  ])
  if (errors.length > 0) {
    lines.push('## Errors')
    lines.push('')
    for (const e of errors) lines.push(`- ${e.split('\n').slice(0, 6).join(' / ')}`)
    lines.push('')
  }
  return lines.join('\n')
}

const share = Math.max(1, Math.floor(threads / variants.length))
const runs = await Promise.all(variants.map(async (variant) => ({ variant, ...(await run(variant, share)) })))
process.stderr.write('\n')
const seconds = (performance.now() - began) / 1000
const markdown = summarize(runs, seconds)
fs.writeFileSync(path.join(out, 'summary.md'), markdown)
fs.writeFileSync(
  path.join(out, 'summary.json'),
  JSON.stringify(
    runs.map((r) => ({
      variant: r.variant,
      failures: r.failures,
      cut: r.cut,
      results: r.results.map(({ rows: _rows, ...rest }) => rest),
    })),
  ),
)
if (flag('json')) {
  process.stdout.write(fs.readFileSync(path.join(out, 'summary.json'), 'utf8'))
} else {
  process.stdout.write(`${markdown}\n`)
}
