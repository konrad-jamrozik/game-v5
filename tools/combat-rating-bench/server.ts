/**
 * Local server of the Combat Rating Bench.
 *
 *   node tools/combat-rating-bench/server.ts [--impl <game-v5-impl-web clone>] [--spec <game-v5 clone>] [--port <number>]
 *
 * It serves the bench page at http://127.0.0.1:<port>/ and gives it two things from disk, read again on every page
 * load: the Combat GDR values from the YAML files under <spec>/content, for the page's defaults and presets, and the
 * engine, from the TypeScript source under <impl>/src, run on one worker thread per spare CPU core. The page sends the
 * batches of Combats to fight; this server only hands them to the worker threads and streams their totals back.
 */
import http from 'node:http'
import os from 'node:os'
import fs from 'node:fs'
import path from 'node:path'
import { Worker } from 'node:worker_threads'
import { execFileSync } from 'node:child_process'
import YAML from 'yaml'
import type { Job, JobResult } from './worker.ts'

const arg = (name: string, fallback: string) => {
  const at = process.argv.indexOf(`--${name}`)
  return at >= 0 && process.argv[at + 1] !== undefined ? process.argv[at + 1]! : fallback
}
const HERE = import.meta.dirname
const SPEC = path.resolve(arg('spec', path.join(HERE, '../..')))
const IMPL = path.resolve(arg('impl', path.join(SPEC, '../game-v5-impl-web')))
const PORT = Number(arg('port', '4719'))
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

/** The GDRs the page needs: the Combat parameters, and the Archetypes and Mission sites it offers as presets. */
function loadGdr() {
  const docs: Doc[] = []
  for (const file of yamlFiles(path.join(SPEC, 'content'))) {
    for (const doc of YAML.parseAllDocuments(fs.readFileSync(file, 'utf8'))) {
      const value: unknown = doc.toJS()
      if (value !== null && typeof value === 'object' && 'id' in value && 'type' in value) {
        docs.push(value as Doc)
      }
    }
  }
  const of = (type: string) => docs.filter((d) => d.type === type)
  const byId = (type: string) => new Map(of(type).map((d) => [d.id, d]))
  const weapons = byId('Weapon')
  const armors = byId('Armor')
  const num = (d: Doc | undefined, key: string) => (typeof d?.[key] === 'number' ? (d[key] as number) : 0)
  const combatant = (d: Doc) => ({
    id: d.id,
    name: typeof d['name'] === 'string' ? d['name'] : d.id,
    skill: num(d, 'base_skill'),
    health: num(d, 'base_health'),
    damage: num(weapons.get(String(d['weapon'])), 'base_weapon_damage'),
    armor: num(armors.get(String(d['armor'])), 'base_armor'),
  })
  const numbers = (d: Doc | undefined) =>
    Object.fromEntries(Object.entries(d ?? {}).filter(([, v]) => typeof v === 'number')) as Record<string, number>
  const agentParameters = numbers(of('AgentParameters')[0])
  const combatParameters = numbers(of('CombatParameters')[0])
  // The AgentParameters values a Combat reads, under COMBAT, Combat inputs and outputs.
  const agentCombatNames = [
    'exhaustion_incapacitation',
    'exhaustion_free_points',
    'skill_penalty_pct_per_exhaustion',
    'exhaustion_per_attack',
    'exhaustion_per_defense',
  ]
  return {
    combatValues: {
      ...combatParameters,
      ...Object.fromEntries(agentCombatNames.filter((k) => k in agentParameters).map((k) => [k, agentParameters[k]!])),
    },
    agentArchetypes: of('AgentArchetype').map(combatant),
    enemyArchetypes: of('EnemyArchetype').map(combatant),
    missionSites: of('MissionSiteArchetype').map((d) => ({
      id: d.id,
      enemies: (d['enemies'] ?? {}) as Record<string, number>,
    })),
  }
}

/* ---------- engine worker threads ---------- */
interface Slot {
  worker: Worker
  ready: boolean
  busy: boolean
}
let pool: Slot[] = []
let ready: Promise<void> = Promise.reject(new Error('not started'))
ready.catch(() => {})
/** The current run: its number, the jobs still to hand out, the jobs out on a thread, and the page's stream. */
let gen = 0
let queue: Job[] = []
let running = 0
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
    running += 1
    slot.worker.postMessage(job)
  }
  if (stream !== null && queue.length === 0 && running === 0) {
    stream.end()
    stream = null
  }
}

function startPool(): void {
  for (const slot of pool) {
    void slot.worker.terminate()
  }
  gen += 1
  queue = []
  running = 0
  stream?.end()
  stream = null
  const mine: Slot[] = []
  pool = mine
  ready = new Promise<void>((resolve, reject) => {
    for (let i = 0; i < THREADS; i += 1) {
      const worker = new Worker(new URL('./worker.ts', import.meta.url), { workerData: { impl: IMPL } })
      const slot: Slot = { worker, ready: false, busy: false }
      mine.push(slot)
      worker.on('message', (m: { type: string; message?: string } | JobResult) => {
        if (pool !== mine) {
          return
        }
        if (m.type === 'ready') {
          slot.ready = true
          resolve()
          pump()
        } else if (m.type === 'error') {
          reject(new Error((m as { message?: string }).message))
        } else if (m.type === 'job') {
          slot.busy = false
          running -= 1
          const result = m as JobResult
          if (result.gen === gen) {
            stream?.write(`${JSON.stringify(result)}\n`)
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
  ready.catch(() => {})
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
      const engineError = await ready.then(
        () => null,
        (e: unknown) => (e instanceof Error ? e.message : String(e)),
      )
      json(res, 200, { engineError, engine: engineVersion(), impl: IMPL, threads: THREADS, gdr: loadGdr() })
    } else if (req.method === 'POST' && url === '/api/run') {
      const jobs = (JSON.parse(await body(req)) as { jobs: Omit<Job, 'gen'>[] }).jobs
      // A new run replaces the one before: its queued jobs are dropped and its results still on a thread are ignored.
      gen += 1
      stream?.end()
      stream = res
      res.on('close', () => {
        if (stream === res) {
          stream = null
          queue = []
        }
      })
      queue = jobs.map((job) => ({ ...job, gen }))
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
  console.log(`Combat Rating Bench: http://127.0.0.1:${PORT}/`)
  console.log(`  engine  ${IMPL} (${engineVersion()}), ${THREADS} worker threads`)
  console.log(`  GDRs    ${path.join(SPEC, 'content')}`)
  console.log('Reload the page to read the GDR values and the engine again from disk.')
})
