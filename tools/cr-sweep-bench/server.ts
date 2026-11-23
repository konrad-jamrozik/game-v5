/**
 * Local server of the CR Sweep Bench.
 *
 *   node tools/cr-sweep-bench/server.ts [--impl <game-v5-impl-web clone>] [--spec <game-v5 clone>] [--port <number>]
 *
 * It serves the bench page at http://127.0.0.1:<port>/, reads the GDR values from the YAML files under <spec>/content
 * and starts the engine from the TypeScript source under <impl>/src again on every page load, sweeps the measurements the
 * page asks for on one worker thread per spare CPU core, and keeps the page's state and every swept measurement as files
 * under data/.
 */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { Pool, THREADS } from './pool.ts'
import { missing, sweepMissing } from './run.ts'
import {
  DATA,
  HERE,
  IMPL,
  Results,
  SPEC,
  arg,
  defaultState,
  engineKey,
  engineVersion,
  loadGdr,
  loadState,
  plan,
  satisfies,
  saveState,
  type Config,
  type State,
} from './store.ts'

const PORT = Number(arg('port', '4720'))
const pool = new Pool(IMPL)
const results = new Results()
let stream: http.ServerResponse | null = null

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

const file = (res: http.ServerResponse, name: string, type: string) => {
  res.writeHead(200, { 'content-type': `${type}; charset=utf-8`, 'cache-control': 'no-store' })
  res.end(fs.readFileSync(path.join(HERE, name), 'utf8'))
}

/** The measurements of a configuration, each with its swept result when there is one. */
function lookup(config: Config) {
  const gdr = loadGdr()
  const planned = plan(config, gdr, engineKey())
  return {
    errors: planned.errors,
    gdrValues: planned.gdrValues,
    measurements: planned.measurements.map((m) => {
      const record = results.get(m.key) ?? null
      return { ...m, record, thorough: record !== null && satisfies(record, config) }
    }),
  }
}

const server = http.createServer((req, res) => {
  void (async () => {
    const [url, query] = (req.url ?? '/').split('?')
    if (req.method === 'GET' && url === '/') {
      file(res, 'index.html', 'text/html')
    } else if (req.method === 'GET' && url === '/lib/model.js') {
      file(res, 'lib/model.js', 'text/javascript')
    } else if (req.method === 'GET' && url === '/api/info') {
      // Every page load reads the GDR values again and starts the engine again from the source on disk.
      pool.start()
      const engineError = await pool.ready.then(
        () => null,
        (e: unknown) => (e instanceof Error ? e.message : String(e)),
      )
      json(res, 200, { engineError, engine: engineVersion(), impl: IMPL, data: DATA, threads: THREADS, gdr: loadGdr() })
    } else if (req.method === 'GET' && url === '/api/state') {
      json(res, 200, query === 'default' ? defaultState(loadGdr()) : loadState(loadGdr()))
    } else if (req.method === 'PUT' && url === '/api/state') {
      saveState(JSON.parse(await body(req)) as State)
      json(res, 200, {})
    } else if (req.method === 'POST' && url === '/api/lookup') {
      json(res, 200, lookup(JSON.parse(await body(req)) as Config))
    } else if (req.method === 'POST' && url === '/api/run') {
      const config = JSON.parse(await body(req)) as Config
      const gdr = loadGdr()
      const engine = engineKey()
      // A new run replaces the one before.
      stream?.end()
      stream = res
      res.on('close', () => {
        if (stream === res) {
          stream = null
          pool.stop()
        }
      })
      res.writeHead(200, { 'content-type': 'application/x-ndjson', 'cache-control': 'no-store' })
      res.write(`${JSON.stringify({ todo: missing(config, gdr, engine, results).length })}\n`)
      await sweepMissing(pool, config, gdr, engine, results, (progress) => {
        if (stream === res) {
          res.write(`${JSON.stringify(progress)}\n`)
        }
      })
      if (stream === res) {
        stream = null
        res.end()
      }
    } else if (req.method === 'POST' && url === '/api/stop') {
      pool.stop()
      json(res, 200, {})
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
  console.log(`CR Sweep Bench: http://127.0.0.1:${PORT}/`)
  console.log(`  engine  ${IMPL} (${engineVersion()}), ${THREADS} worker threads`)
  console.log(`  GDRs    ${path.join(SPEC, 'content')}`)
  console.log(`  data    ${DATA}`)
  console.log('Reload the page to read the GDR values and the engine again from disk.')
})
