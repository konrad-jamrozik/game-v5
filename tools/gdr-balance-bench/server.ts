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
import { createHash } from 'node:crypto'
import YAML from 'yaml'
import {
  SiteSearch,
  defaultEstimate,
  isUsableHint,
  searchKey,
  MIN_HINT_NEED,
  type Hint,
  type ProbeResult,
  type SiteJob,
} from './search.ts'

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
      if (entry.name !== 'compendium' && entry.name !== 'cut') {
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
  const operationLevels = docs
    .filter((d) => d.type === 'FactionOperationLevel')
    .map((d) => d['level'] as number)
    .toSorted((a, b) => a - b)
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
      case 'Armor':
        out[d.id] = numbers(d)
        break
      case 'Upgrade':
        out[d.id] = { price: d['price'], increment: d['increment'] }
        break
      case 'AgentArchetype':
      case 'EnemyArchetype':
        out[d.id] = { ...numbers(d), weapon: d['weapon'], armor: d['armor'] }
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
            every === null ? {} : Object.fromEntries(operationLevels.map((k) => [k, weights[k] ?? 0])),
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

/* ---------- what the page was loaded from ---------- */
function allFiles(dir: string): string[] {
  const out: string[] = []
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        out.push(...allFiles(full))
      } else {
        out.push(full)
      }
    }
  } catch {
    // A directory that is missing, e.g. while the clone is being updated, contributes no files.
  }
  return out
}

/** A fingerprint of the files, from each one's path, size, and modification time, cheap enough to take every few seconds. */
function fingerprint(files: string[]): string {
  const hash = createHash('sha1')
  for (const file of files.toSorted()) {
    try {
      const stat = fs.statSync(file)
      hash.update(`${file}\0${stat.size}\0${stat.mtimeMs}\n`)
    } catch {
      hash.update(`${file}\0missing\n`)
    }
  }
  return hash.digest('hex')
}

/**
 * The fingerprints of what a page load reads: the bench itself, the GDR values, and the engine source. The page keeps
 * the ones it was loaded with and asks for them again, so that it can say when one of them changed on disk after it
 * loaded, e.g. a pull that changed a Combat rating formula, and its numbers no longer reflect what is on disk.
 */
function stamp(): { bench: string; gdr: string; engine: string } {
  return {
    bench: fingerprint(['index.html', 'server.ts', 'search.ts', 'worker.ts'].map((f) => path.join(HERE, f))),
    gdr: fingerprint(yamlFiles(path.join(SPEC, 'content'))),
    engine: fingerprint(allFiles(path.join(IMPL, 'src'))),
  }
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
/** The searches of the current run, one for each Mission site, and the sites it has solved so far. */
let searches: SiteSearch[] = []
let hints: Hint[] = []
let stream: http.ServerResponse | null = null

/** What a site's search took: the time since the run started, the team sizes tried, and the Combats fought. */
function effort(search: SiteSearch): { ms: number; probes: number; combats: number } {
  return { ms: Math.round(performance.now() - search.startedAt), probes: search.probes, combats: search.combats }
}

/** Sends a message of a search to the page and keeps it, so that a later run that keeps the search can resend it. */
function tell(search: SiteSearch, message: unknown): void {
  search.sent.push(message)
  send(message)
}

/** Writes one message of the current run to the page. */
function send(message: unknown): void {
  stream?.write(`${JSON.stringify(message)}\n`)
}

/**
 * Hands every idle worker thread the next probe of the current run. Each probe goes to the unfinished site with the
 * fewest probes running, and among those to the one with the strongest Enemies, whose searches take longest; so every
 * site starts at once, and the threads left over speed up the slowest searches.
 */
function pump(): void {
  for (const slot of pool) {
    if (!slot.ready || slot.busy) {
      continue
    }
    const open = searches
      .filter((search) => !search.done)
      .sort((a, b) => a.running.size - b.running.size || b.job.rating - a.job.rating)
    for (const search of open) {
      const next = search.next(hints, waitsForHint(search))
      if (next === null) {
        continue
      }
      const { job } = search
      slot.busy = true
      slot.worker.postMessage({
        type: 'probe',
        // The probe carries its search's token in place of the run, so that its result reaches the search even when a
        // later run keeps it.
        gen: search.token,
        id: job.id,
        size: next.size,
        full: next.full,
        enemies: job.enemies,
        agent: job.agent,
        gdrValues: job.gdrValues,
        target: job.target,
        trials: job.trials,
      })
      break
    }
  }
  if (stream !== null && searches.length > 0 && searches.every((search) => search.done)) {
    stream.end()
    stream = null
  }
}

/**
 * Whether a search should wait for an estimate: no usable hint exists yet, and a site smaller than it that will need at
 * least MIN_HINT_NEED Agents is still being searched. The smallest such site never waits, so a hint always comes.
 */
function waitsForHint(search: SiteSearch): boolean {
  if (hints.some(isUsableHint)) {
    return false
  }
  const own = defaultEstimate(search.job)
  return searches.some((other) => {
    const its = defaultEstimate(other.job)
    return other !== search && !other.done && its >= MIN_HINT_NEED && its < own
  })
}

/** Records a probe's result in its site's search and tells the page what became known. */
function onProbe(result: ProbeResult): void {
  const search = searches.find((item) => item.token === result.gen)
  if (search === undefined || search.done) {
    return
  }
  search.record(result)
  if ('error' in result) {
    tell(search, { type: 'failed', id: result.id, message: result.error, ...effort(search) })
    return
  }
  if (result.full) {
    tell(search, { type: 'rate', id: result.id, win: result.win, killed: result.killed })
  }
  if (search.need !== undefined) {
    tell(search, { type: 'need', id: result.id, need: search.need, ...effort(search) })
    // A solved site tells the searches still to come where to start.
    if (typeof search.need === 'number') {
      hints.push({ rating: search.job.rating, need: search.need })
    }
  }
}

/** Starts fresh worker threads, so the engine is loaded again from the source on disk. */
function startPool(): void {
  for (const slot of pool) {
    void slot.worker.terminate()
  }
  searches = []
  stream?.end()
  stream = null
  const mine: Slot[] = []
  pool = mine
  info = new Promise<Info>((resolve, reject) => {
    for (let i = 0; i < THREADS; i += 1) {
      const worker = new Worker(new URL('./worker.ts', import.meta.url), { workerData: { impl: IMPL } })
      const slot: Slot = { worker, ready: false, busy: false }
      mine.push(slot)
      worker.on('message', (m: { type: string; message?: string } & Partial<Info>) => {
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
        if (m.type === 'probe') {
          slot.busy = false
          onProbe(m as unknown as ProbeResult)
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
    } else if (req.method === 'GET' && url === '/api/stamp') {
      json(res, 200, stamp())
    } else if (req.method === 'GET' && url === '/api/info') {
      // Every page load reads the GDR values again and starts the engine again from the source on disk.
      const loadedFrom = stamp()
      startPool()
      // An engine that does not start, e.g. while the clone is being updated, is reported and the GDR values still load.
      const loaded = await info.catch((e: unknown) => ({ engineError: e instanceof Error ? e.message : String(e) }))
      json(res, 200, {
        ...loaded,
        engine: engineVersion(),
        impl: IMPL,
        spec: SPEC,
        threads: THREADS,
        gdr: loadGdr(),
        stamp: loadedFrom,
      })
    } else if (req.method === 'POST' && url === '/api/run') {
      const jobs = (JSON.parse(await body(req)) as { jobs: SiteJob[] }).jobs
      stream?.end()
      stream = res
      res.on('close', () => {
        if (stream === res) {
          stream = null
        }
      })
      // A site whose inputs did not change keeps its search, finished or still running, and its results are sent again;
      // only the other sites are searched anew.
      const previous = new Map(
        searches.filter((search) => search.failed === null).map((search) => [search.key, search]),
      )
      searches = jobs.map((job) => previous.get(searchKey(job)) ?? new SiteSearch(job))
      hints = searches.flatMap((search) =>
        typeof search.need === 'number' ? [{ rating: search.job.rating, need: search.need }] : [],
      )
      res.writeHead(200, { 'content-type': 'application/x-ndjson', 'cache-control': 'no-store' })
      res.write('\n')
      for (const search of searches) {
        for (const message of search.sent) {
          send(message)
        }
      }
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
