/**
 * Local server of the globe's reference viewer.
 *
 *   node lib/globe/scripts/serve.ts [--port <number>]
 *
 * It serves `lib/globe` at http://localhost:<port>/ and forbids the browser to keep any file, so a reload always shows
 * the files as they are on disk. A plain static file server does not: the browser then goes on running the globe's
 * code from before a change, for as long as it guesses that code to be current.
 */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const at = process.argv.indexOf('--port')
const PORT = Number(at >= 0 ? process.argv[at + 1] : '4720')
const ROOT = path.resolve(import.meta.dirname, '..')

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
}

http
  .createServer((req, res) => {
    const asked = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname)
    const file = path.join(ROOT, asked.endsWith('/') ? `${asked}index.html` : asked)
    // nothing outside the viewer's folder, and nothing that is not a file
    if (!file.startsWith(ROOT + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.writeHead(404, { 'cache-control': 'no-store' }).end('Not found')
      return
    }
    res.writeHead(200, {
      'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream',
      'content-length': fs.statSync(file).size,
      'cache-control': 'no-store',
    })
    if (req.method === 'HEAD') res.end()
    else fs.createReadStream(file).pipe(res)
  })
  .listen(PORT, () => {
    console.log(`Globe viewer: http://localhost:${PORT}/`)
  })
