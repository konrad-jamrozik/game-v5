/**
 * Local server of the Autopilot Bench.
 *
 *   node tools/autopilot-bench/server.ts [--impl <game-v5-impl-web clone>] [--port <number>]
 *
 * It serves the bench page at http://127.0.0.1:<port>/ and plays Campaigns with the Basic Autopilot AI of the
 * Implementation clone, built with the parameters the page sends. Campaigns are played only when the page asks: a
 * launch plays new Campaigns up to a Turn, and Play plays more Turns of existing ones. Everything else only reads.
 * The Campaigns live in this process, so they last until the server stops.
 */
import http from 'node:http'
import os from 'node:os'
import fs from 'node:fs'
import path from 'node:path'
import { Worker } from 'node:worker_threads'
import { execFileSync } from 'node:child_process'

import type { CampaignStats, FromWorker, ToWorker, TurnPoint, UpgradeInfo } from './protocol.ts'

const arg = (name: string, fallback: string) => {
  const at = process.argv.indexOf(`--${name}`)
  return at >= 0 && process.argv[at + 1] !== undefined ? process.argv[at + 1]! : fallback
}
const HERE = import.meta.dirname
const SPEC = path.resolve(HERE, '../..')
const IMPL = path.resolve(arg('impl', path.join(SPEC, '../game-v5-impl-web')))
const PORT = Number(arg('port', '4718'))
/**
 * Where the Campaign logs go: one folder per server start, so that a restart, which reuses the Campaign IDs, never
 * writes into the logs of an earlier one. It is outside the repository.
 */
const LOGS = path.join(
  path.resolve(arg('logs', path.join(os.tmpdir(), 'autopilot-bench'))),
  new Date().toISOString().replace(/[:.]/g, '-'),
)
const THREADS = Math.max(1, os.availableParallelism() - 1)
const MAX_CAMPAIGNS = 500
const MAX_TURNS = 100_000

/** One run: the Turns one Play, or the launch, asked a Campaign to play. */
interface Run {
  turns: number
  startTurn: number
  readonly startedAt: number
  endedAt: number | null
  /** The disengagement reason, once the run has ended, e.g. `limitReached` or `campaignEnded`. */
  reason: string | null
  detail: string | null
}

interface Campaign {
  readonly id: string
  /** The number the page shows, in launch order. */
  readonly n: number
  readonly batch: number
  readonly seed: string
  /** The parameters of the Basic Autopilot AI, every one of them, as they were at launch. */
  readonly params: Record<string, unknown>
  /** The Campaign log file, which its worker thread writes; none when its launch asked for no log. */
  readonly log: string | null
  readonly thread: Thread
  state: 'starting' | 'running' | 'idle' | 'failed'
  stats: CampaignStats | null
  /** Every ended Turn of the Campaign, in Turn order, for the per-Turn charts. */
  readonly series: TurnPoint[]
  run: Run | null
  /** The time of every earlier run together, in milliseconds. */
  priorMs: number
  /** The Turns of every earlier run together. */
  priorTurns: number
  error: string | null
}

interface Thread {
  readonly worker: Worker
  readonly ready: Promise<void>
  campaigns: number
}

interface Batch {
  readonly id: number
  readonly engine: string
  readonly createdAt: number
  readonly threads: Thread[]
}

const campaigns = new Map<string, Campaign>()
const batches: Batch[] = []
let nextCampaign = 1

function engineVersion(): string {
  try {
    const git = (...args: string[]) => execFileSync('git', ['-C', IMPL, ...args], { encoding: 'utf8' }).trim()
    const dirty = git('status', '--porcelain', '--', 'src') === '' ? '' : ', with uncommitted changes under src'
    return `commit ${git('rev-parse', '--short', 'HEAD')}${dirty}`
  } catch {
    return 'unknown commit'
  }
}

/** A worker thread, which loads the engine and the AI from the source on disk as it starts. */
function startThread(onReady?: (m: Extract<FromWorker, { type: 'ready' }>) => void): Thread {
  const worker = new Worker(path.join(HERE, 'worker.ts'), { workerData: { impl: IMPL } })
  const ready = new Promise<void>((resolve, reject) => {
    worker.on('message', (m: FromWorker) => {
      if (m.type === 'ready') {
        onReady?.(m)
        resolve()
      } else if (m.type === 'error') {
        reject(new Error(m.message))
      } else {
        onMessage(m)
      }
    })
    worker.on('error', (e) => {
      console.error('engine worker failed:', e.message)
      reject(e)
      for (const c of campaigns.values()) {
        if (c.thread.worker === worker) {
          fail(c, `The worker thread failed: ${e.message}`)
        }
      }
    })
  })
  ready.catch(() => {})
  return { worker, ready, campaigns: 0 }
}

function fail(c: Campaign, message: string) {
  c.state = 'failed'
  c.error = message
  if (c.run !== null && c.run.endedAt === null) {
    c.run.endedAt = Date.now()
    c.run.reason = 'failed'
  }
}

function onMessage(m: FromWorker) {
  if (m.type === 'failed') {
    const c = m.id === null ? undefined : campaigns.get(m.id)
    if (c !== undefined) {
      fail(c, m.message)
    } else {
      console.error(m.message)
    }
    return
  }
  if (m.type !== 'stats' && m.type !== 'done') {
    return
  }
  const c = campaigns.get(m.id)
  if (c === undefined) {
    return
  }
  // A message carries only the ended Turns not reported before, so they are appended, and the stats keep none.
  c.series.push(...m.stats.series)
  c.stats = { ...m.stats, series: [] }
  if (c.state === 'starting') {
    startLaunchRun(c)
    return
  }
  if (m.type === 'done' && c.run !== null) {
    c.run.endedAt = Date.now()
    c.run.reason = m.reason
    c.run.detail = m.detail
    c.state = m.reason === 'aiFailed' ? 'failed' : 'idle'
    if (m.reason === 'aiFailed') {
      c.error = m.detail ?? 'The Autopilot AI failed.'
    }
  }
}

function send(c: Campaign, message: ToWorker) {
  c.thread.worker.postMessage(message)
}

/** Starts a run of `turns` Turns of an idle Campaign, unless it has ended. */
function play(c: Campaign, turns: number) {
  if (c.state !== 'idle' || c.stats === null || c.stats.ending !== null || turns < 1) {
    return
  }
  if (c.run !== null && c.run.endedAt !== null) {
    c.priorMs += c.run.endedAt - c.run.startedAt
    c.priorTurns += c.stats.turn - c.run.startTurn
  }
  c.run = { turns, startTurn: c.stats.turn, startedAt: Date.now(), endedAt: null, reason: null, detail: null }
  c.state = 'running'
  send(c, { type: 'play', id: c.id, turns })
}

/**
 * Launches `count` Campaigns. Campaign `i` has the Campaign seed `<prefix>-<i>`, or, for an exact seed, the seed as
 * given, which the page uses to replay one Campaign.
 */
async function launch(
  count: number,
  untilTurn: number,
  seeds: { readonly prefix: string } | { readonly exact: string },
  params: Record<string, unknown>,
  logged: boolean,
) {
  const threads = Array.from({ length: Math.min(count, THREADS) }, () => startThread())
  const batch: Batch = { id: batches.length + 1, engine: engineVersion(), createdAt: Date.now(), threads }
  batches.push(batch)
  const created: Campaign[] = []
  if (logged) fs.mkdirSync(LOGS, { recursive: true })
  for (let i = 0; i < count; i += 1) {
    const thread = threads[i % threads.length]!
    thread.campaigns += 1
    const id = `c${nextCampaign}`
    const seed = 'exact' in seeds ? seeds.exact : `${seeds.prefix}-${i + 1}`
    const c: Campaign = {
      id,
      n: nextCampaign,
      batch: batch.id,
      seed,
      params,
      log: logged ? path.join(LOGS, `${id}-${seed.replace(/[^\w.-]/g, '_')}.jsonl`) : null,
      thread,
      state: 'starting',
      stats: null,
      series: [],
      // The launch's run starts at once, so its time includes starting the engine and creating the Campaign.
      run: { turns: untilTurn - 1, startTurn: 1, startedAt: Date.now(), endedAt: null, reason: null, detail: null },
      priorMs: 0,
      priorTurns: 0,
      error: null,
    }
    nextCampaign += 1
    campaigns.set(c.id, c)
    created.push(c)
  }
  for (const c of created) {
    c.thread.ready.then(
      () =>
        send(c, {
          type: 'create',
          id: c.id,
          seed: c.seed,
          params,
          log: c.log,
          launch: { batch: batch.id, engine: batch.engine, impl: IMPL },
        }),
      (e: unknown) => fail(c, `The engine did not start: ${e instanceof Error ? e.message : String(e)}`),
    )
  }
}

/** The launch run of a Campaign that has just been created: it plays up to the Turn the launch asked for. */
function startLaunchRun(c: Campaign) {
  const run = c.run!
  const turn = c.stats!.turn
  c.run = { ...run, startTurn: turn, turns: Math.max(0, run.turns + run.startTurn - turn) }
  if (c.run.turns < 1) {
    c.run.endedAt = Date.now()
    c.run.reason = 'limitReached'
    c.state = 'idle'
    return
  }
  c.state = 'running'
  send(c, { type: 'play', id: c.id, turns: c.run.turns })
}

function remove(c: Campaign) {
  send(c, { type: 'remove', id: c.id })
  campaigns.delete(c.id)
  c.thread.campaigns -= 1
  if (c.thread.campaigns === 0) {
    void c.thread.worker.terminate()
  }
}

/* ---------- HTTP ---------- */

function body(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c: Buffer) => chunks.push(c))
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'))
      } catch (e) {
        reject(e)
      }
    })
    req.on('error', reject)
  })
}

const json = (res: http.ServerResponse, status: number, value: unknown) => {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  res.end(JSON.stringify(value))
}

/** The engine's defaults and Upgrades, from a worker thread started for this alone, so they are read from disk. */
function readInfo(): Promise<{ defaults: Record<string, unknown>; upgrades: readonly UpgradeInfo[] }> {
  return new Promise((resolve, reject) => {
    const thread = startThread((m) => resolve({ defaults: m.defaults, upgrades: m.upgrades }))
    thread.ready.then(
      () => void thread.worker.terminate(),
      (e: unknown) => {
        void thread.worker.terminate()
        reject(e)
      },
    )
  })
}

/**
 * A Campaign as the page reads it. `have` is how many ended Turns of its series the page already holds, so that only
 * the rest is sent; `seriesFrom` is where the part sent starts, 0 when the page holds more than there is, e.g. after a
 * restart reused the Campaign's ID.
 */
function view(c: Campaign, have: number) {
  const from = have <= c.series.length ? have : 0
  return {
    seriesFrom: from,
    series: c.series.slice(from),
    id: c.id,
    n: c.n,
    batch: c.batch,
    seed: c.seed,
    params: c.params,
    log: c.log,
    state: c.state,
    stats: c.stats,
    run: c.run,
    priorMs: c.priorMs,
    priorTurns: c.priorTurns,
    error: c.error,
  }
}

const selected = (ids: unknown): Campaign[] =>
  (Array.isArray(ids) ? ids : []).flatMap((id) => {
    const c = campaigns.get(String(id))
    return c === undefined ? [] : [c]
  })

const whole = (value: unknown, min: number, max: number): number | null =>
  typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max ? value : null

const server = http.createServer((req, res) => {
  void (async () => {
    const [url, query] = (req.url ?? '/').split('?')
    if (req.method === 'GET' && url === '/') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' })
      res.end(fs.readFileSync(path.join(HERE, 'index.html'), 'utf8'))
    } else if (req.method === 'GET' && url === '/api/info') {
      const info = await readInfo().catch((e: unknown) => ({ engineError: e instanceof Error ? e.message : String(e) }))
      json(res, 200, { ...info, engine: engineVersion(), impl: IMPL, threads: THREADS })
    } else if (req.method === 'GET' && url === '/api/state') {
      // `have=c1.40,c2.12`: how many ended Turns of each Campaign's series the page already holds.
      const have = new Map<string, number>()
      for (const part of (new URLSearchParams(query ?? '').get('have') ?? '').split(',')) {
        const [id, n] = part.split('.')
        if (id && Number.isInteger(Number(n))) have.set(id, Math.max(0, Number(n)))
      }
      json(res, 200, {
        now: Date.now(),
        campaigns: [...campaigns.values()].map((c) => view(c, have.get(c.id) ?? 0)),
        batches: batches.map((b) => ({ id: b.id, engine: b.engine, createdAt: b.createdAt })),
      })
    } else if (req.method === 'POST' && url === '/api/launch') {
      const b = await body(req)
      const count = whole(b.count, 1, MAX_CAMPAIGNS - campaigns.size)
      const untilTurn = whole(b.untilTurn, 1, MAX_TURNS)
      const text = (value: unknown) => (typeof value === 'string' && value.trim() !== '' ? value.trim() : null)
      const exact = text(b.seed)
      const seeds = exact === null ? { prefix: text(b.seedPrefix) ?? 'seed' } : { exact }
      if (count === null || untilTurn === null || typeof b.params !== 'object' || b.params === null) {
        json(res, 400, {
          error: `Give 1 to ${MAX_CAMPAIGNS - campaigns.size} Campaigns, a Turn of 1 to ${MAX_TURNS}, and the parameters.`,
        })
        return
      }
      await launch(count, untilTurn, seeds, b.params as Record<string, unknown>, b.log !== false)
      json(res, 200, { ok: true })
    } else if (req.method === 'POST' && url === '/api/play') {
      const b = await body(req)
      const turns = whole(b.turns, 1, MAX_TURNS)
      if (turns === null) {
        json(res, 400, { error: `Give 1 to ${MAX_TURNS} Turns.` })
        return
      }
      for (const c of selected(b.ids)) {
        play(c, turns)
      }
      json(res, 200, { ok: true })
    } else if (req.method === 'POST' && url === '/api/stop') {
      for (const c of selected((await body(req)).ids)) {
        if (c.state === 'running') {
          send(c, { type: 'stop', id: c.id })
        }
      }
      json(res, 200, { ok: true })
    } else if (req.method === 'POST' && url === '/api/remove') {
      for (const c of selected((await body(req)).ids)) {
        remove(c)
      }
      json(res, 200, { ok: true })
    } else {
      json(res, 404, { error: 'not found' })
    }
  })().catch((e: unknown) => {
    const message = e instanceof Error ? e.message : String(e)
    console.error(message)
    if (!res.headersSent) {
      json(res, 500, { error: message })
    } else {
      res.end()
    }
  })
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Autopilot Bench: http://127.0.0.1:${PORT}/`)
  console.log(`  engine  ${IMPL} (${engineVersion()}), up to ${THREADS} worker threads per launch`)
  console.log(`  logs    ${LOGS}`)
  console.log('Each launch starts the engine again from the source on disk; its Campaigns keep that engine.')
})
