import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Prints Markdown files with every link reduced to its label, so that the prose reads and searches as plain text.
 *
 * Usage: `npm run docs:plain -- <file.md> [...]`
 */

/** The Markdown with each inline link `[label](target)` replaced by its label and each image by `[image: alt]`. */
export function plainMarkdown(markdown: string): string {
  return markdown
    .replace(/!\[([^\]]*)\]\([^)\s]*(?:\s+"[^"]*")?\)/g, '[image: $1]')
    .replace(/\[((?:[^[\]]|\[[^\]]*\])*)\]\([^)\s]*(?:\s+"[^"]*")?\)/g, '$1')
}

function main(): void {
  const paths = process.argv.slice(2)
  if (paths.length === 0) throw new Error('Usage: npm run docs:plain -- <file.md> [...]')
  for (const path of paths) {
    if (paths.length > 1) console.log(`==> ${path} <==`)
    console.log(plainMarkdown(readFileSync(path, 'utf8')))
  }
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : undefined
if (invokedPath === fileURLToPath(import.meta.url)) {
  main()
}
