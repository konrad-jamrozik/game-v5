/**
 * Local server of the GDR Balance Bench.
 *
 *   node tools/gdr-balance-bench/server.ts [--impl <game-v5-impl-web clone>] [--spec <game-v5 clone>] [--port <number>]
 *
 * It serves the bench page at http://127.0.0.1:<port>/ and gives it two things from disk, read again on every page
 * load, so nothing is ever rebuilt or republished:
 *   - the GDR values, from the YAML files under <spec>/content;
 *   - the engine, from the TypeScript source under <impl>/src, run on one worker thread per spare CPU core.
 */
import http from 'node:http'
import os from 'node:os'
import fs from 'node:fs'
import path from 'node:path'
import { Worker } from 'node:worker_threads'
import { execFileSync } from 'node:child_process'
import YAML from 'yaml'

const arg = (name: string, fallback: string) => {
  const at = process.argv.indexOf(`--${name}`)
  return at >= 0 && process.argv[at + 1] !== undefined ? process.argv[at + 1]! : fallback
}
const HERE = import.meta.dirname
// The Spec repo is the repository this file is in; the Implementation repo is expected next to it.
const SPEC = path.resolve(arg('spec', path.join(HERE, '../..')))
const IMPL = path.resolve(arg('impl', path.join(SPEC, '../game-v5-impl-web')))
const PORT = Number(arg('port', '4717'))
const THREADS = Math.max(1, os.availableParallelism() - 1)

/* ---------- GDR values from the YAML files ---------- */
type Doc = Record<string, unknown> & { id: string; type: string }

function yamlFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name !== 'compendium') {
        out.push(...yamlFiles(full))
      }
    } else if (entry.name.endsWith('.yaml')) {
      out.push(full)
    }
  }
  return out
}

/** The values of the Bootstrap GDRs in the shape the page edits; see `BASE` in the page. */
function loadGdr(): Record<string, unknown> {
  const docs: Doc[] = []
  for (const file of yamlFiles(path.join(SPEC, 'content'))) {
    for (const doc of YAML.parseAllDocuments(fs.readFileSync(file, 'utf8'))) {
      const value: unknown = doc.toJS()
      if (value !== null && typeof value === 'object' && 'id' in value && 'type' in value) {
        docs.push(value as Doc)
      }
    }
  }
  const numbers = (d: Doc) =>
    Object.fromEntries(
      Object.entries(d).filter(
        ([k, v]) =>
          k !== 'level' && (typeof v === 'number' || (Array.isArray(v) && v.every((x) => typeof x === 'number'))),
      ),
    )
  const effects = (list: unknown, keys: string[]) => {
    const out: Record<string, number> = Object.fromEntries(keys.map((k) => [k, 0]))
    for (const effect of Array.isArray(list) ? (list as Record<string, unknown>[]) : []) {
      for (const k of keys) {
        if (typeof effect[k] === 'number') {
          out[k] = effect[k] as number
        }
      }
    }
    return out
  }
  const enemyIds = docs.filter((d) => d.type === 'EnemyArchetype').map((d) => d.id)
  const out: Record<string, unknown> = {}
  for (const d of docs) {
    switch (d.type) {
      case 'CampaignConfiguration':
      case 'AgentParameters':
      case 'CombatParameters':
      case 'RecoveryParameters':
      case 'EconomyParameters':
      case 'InvestigationParameters':
      case 'EndingParameters':
      case 'Weapon':
        out[d.id] = numbers(d)
        break
      case 'Upgrade':
        out[d.id] = { price: d['price'], increment: d['increment'] }
        break
      case 'AgentArchetype':
      case 'EnemyArchetype':
        out[d.id] = { ...numbers(d), weapon: d['weapon'] }
        break
      case 'FactionArchetype':
        out[d.id] = { initial_activity_level: d['initial_activity_level'] }
        break
      case 'FactionActivityLevel': {
        const weights = (d['operation_level_weights'] ?? {}) as Record<string, number>
        const every = d['operation_every_turns'] ?? null
        out[d.id] = {
          lasts_turns: d['lasts_turns'] ?? null,
          operation_every_turns: every,
          operation_level_weights:
            every === null ? {} : Object.fromEntries([1, 2, 3, 4, 5, 6].map((k) => [k, weights[k] ?? 0])),
        }
        break
      }
      case 'FactionOperationLevel': {
        const lost = Array.isArray(d['on_ignored_or_lost'])
          ? (d['on_ignored_or_lost'] as Record<string, unknown>[])
          : []
        out[d.id] = lost.some((e) => 'defeat' in e)
          ? {}
          : {
              on_win: effects(d['on_win'], ['money', 'funding']),
              on_ignored_or_lost: effects(lost, ['panic', 'funding']),
            }
        break
      }
      case 'MissionSiteArchetype': {
        const counts = (d['enemies'] ?? {}) as Record<string, number>
        const site: Record<string, unknown> = {
          kind: d['kind'],
          expires_in_turns: d['expires_in_turns'],
          enemies: Object.fromEntries(enemyIds.map((e) => [e, counts[e] ?? 0])),
        }
        if (d['kind'] === 'initiative') {
          site['on_win'] = effects(d['on_win'], ['money', 'funding', 'panic'])
        } else {
          site['level'] = d['operation_level']
        }
        out[d.id] = site
        break
      }
      case 'Lead': {
        // One row per chain role: the Lead of the first Faction stands for the same Lead of every Faction.
        const faction = typeof d['faction'] === 'string' ? (d['faction'] as string) : null
        const key = faction === null ? d.id : d.id.replace(faction, '<faction>')
        if (!(key in out)) {
          out[key] = { required_progress: d['required_progress'] }
        }
        break
      }
      default:
        break
    }
  }
  return out
}

/* ---------- engine worker threads ---------- */
interface Slot {
  worker: Worker
  ready: boolean
  busy: boolean
}
interface Info {
  initiativeLevels: Record<string, number | null>
  enemyOrder: Record<string, string[]>
  combatGdrValueNames: string[] | null
}
let pool: Slot[] = []
let info: Promise<Info> = Promise.reject(new Error('not started'))
info.catch(() => {})
let gen = 0
let queue: Record<string, unknown>[] = []
let remaining = 0
let stream: http.ServerResponse | null = null

function pump(): void {
  for (const slot of pool) {
    if (!slot.ready || slot.busy) {
      continue
    }
    const job = queue.shift()
    if (job === undefined) {
      break
    }
    slot.busy = true
    slot.worker.postMessage(job)
  }
}

/** Starts fresh worker threads, so the engine is loaded again from the source on disk. */
function startPool(): void {
  for (const slot of pool) {
    void slot.worker.terminate()
  }
  queue = []
  stream?.end()
  stream = null
  const mine: Slot[] = []
  pool = mine
  info = new Promise<Info>((resolve, reject) => {
    for (let i = 0; i < THREADS; i += 1) {
      const worker = new Worker(new URL('./worker.ts', import.meta.url), { workerData: { impl: IMPL } })
      const slot: Slot = { worker, ready: false, busy: false }
      mine.push(slot)
      worker.on('message', (m: { type: string; gen?: number; message?: string } & Partial<Info>) => {
        if (pool !== mine) {
          return
        }
        if (m.type === 'ready') {
          slot.ready = true
          resolve({
            initiativeLevels: m.initiativeLevels!,
            enemyOrder: m.enemyOrder!,
            combatGdrValueNames: m.combatGdrValueNames ?? null,
          })
          pump()
          return
        }
        if (m.type === 'error') {
          reject(new Error(m.message))
          return
        }
        if (m.gen !== gen) {
          return
        }
        stream?.write(`${JSON.stringify(m)}\n`)
        if (m.type === 'need' || m.type === 'failed') {
          slot.busy = false
          remaining -= 1
          if (remaining === 0) {
            stream?.end()
            stream = null
          }
          pump()
        }
      })
      worker.on('error', (e) => {
        console.error('engine worker failed:', e.message)
        reject(e)
      })
    }
  })
  info.catch(() => {})
}

function engineVersion(): string {
  try {
    const git = (...args: string[]) => execFileSync('git', ['-C', IMPL, ...args], { encoding: 'utf8' }).trim()
    const dirty = git('status', '--porcelain', '--', 'src') === '' ? '' : ', with uncommitted changes under src'
    return `commit ${git('rev-parse', '--short', 'HEAD')}${dirty}`
  } catch {
    return 'unknown commit'
  }
}

function body(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c: Buffer) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

const json = (res: http.ServerResponse, status: number, value: unknown) => {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  res.end(JSON.stringify(value))
}

const server = http.createServer((req, res) => {
  void (async () => {
    const url = (req.url ?? '/').split('?')[0]
    if (req.method === 'GET' && url === '/') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' })
      res.end(fs.readFileSync(path.join(HERE, 'index.html'), 'utf8'))
    } else if (req.method === 'GET' && url === '/api/info') {
      // Every page load reads the GDR values again and starts the engine again from the source on disk.
      startPool()
      // An engine that does not start, e.g. while the clone is being updated, is reported and the GDR values still load.
      const loaded = await info.catch((e: unknown) => ({ engineError: e instanceof Error ? e.message : String(e) }))
      json(res, 200, { ...loaded, engine: engineVersion(), impl: IMPL, spec: SPEC, threads: THREADS, gdr: loadGdr() })
    } else if (req.method === 'POST' && url === '/api/run') {
      const jobs = (JSON.parse(await body(req)) as { jobs: Record<string, unknown>[] }).jobs
      gen += 1
      stream?.end()
      stream = res
      res.on('close', () => {
        if (stream === res) {
          stream = null
        }
      })
      for (const job of jobs) {
        job['gen'] = gen
      }
      queue = jobs
      remaining = jobs.length
      for (const slot of pool) {
        slot.busy = false
        slot.worker.postMessage({ type: 'cancel', gen })
      }
      res.writeHead(200, { 'content-type': 'application/x-ndjson', 'cache-control': 'no-store' })
      res.write('\n')
      pump()
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
  console.log(`GDR Balance Bench: http://127.0.0.1:${PORT}/`)
  console.log(`  engine  ${IMPL} (${engineVersion()}), ${THREADS} worker threads`)
  console.log(`  GDRs    ${path.join(SPEC, 'content')}`)
  console.log('Reload the page to read the GDR values and the engine again from disk.')
})
