import { readdir, readFile } from 'node:fs/promises'
import { relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  CONTENT_DIRECTORY,
  CUT_CONTENT_DIRECTORY,
  coverageExemptions,
  coverageFindings,
  loadCompendium,
  loadGameData,
} from './compendium/compendium.ts'
import type { SourceFile } from './spec-linter/types.ts'

/**
 * Checks the Compendium articles under `content/`: every rule of Compendium article GDR validation in the Compendium
 * specification, and Compendium coverage in Bootstrap GDRs. It reads files only and changes none.
 */

export const BOOTSTRAP_GDRS_PATH = 'docs/specs/design/content/bootstrap-gdrs.md'

/** Every finding of the Compendium check for the given content files and the text of Bootstrap GDRs. */
export function compendiumFindings(contentFiles: readonly SourceFile[], bootstrapGdrs: string): readonly string[] {
  const gameData = loadGameData(contentFiles)
  const compendium = loadCompendium(gameData)
  return [...compendium.findings, ...coverageFindings(gameData, compendium, coverageExemptions(bootstrapGdrs))]
}

/** The YAML files under `content/`, outside the Cut content directory `content/cut/`, with paths relative to `root`. */
export async function collectContentFiles(root: string): Promise<readonly SourceFile[]> {
  const directory = resolve(root, CONTENT_DIRECTORY)
  const entries = await readdir(directory, { withFileTypes: true, recursive: true })
  const files: SourceFile[] = []
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.yaml')) continue
    const path = resolve(entry.parentPath, entry.name)
    const relativePath = relative(root, path).replace(/\\/g, '/')
    if (relativePath.startsWith(`${CUT_CONTENT_DIRECTORY}/`)) continue
    files.push({ path: relativePath, content: await readFile(path, 'utf8') })
  }
  return files.toSorted((left, right) => (left.path < right.path ? -1 : left.path > right.path ? 1 : 0))
}

async function main(): Promise<void> {
  const root = process.cwd()
  const [contentFiles, bootstrapGdrs] = await Promise.all([
    collectContentFiles(root),
    readFile(resolve(root, BOOTSTRAP_GDRS_PATH), 'utf8'),
  ])
  const findings = compendiumFindings(contentFiles, bootstrapGdrs)
  for (const finding of findings) console.error(finding)
  process.exitCode = findings.length === 0 ? 0 : 1
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : undefined
if (invokedPath === fileURLToPath(import.meta.url)) {
  try {
    await main()
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`Compendium check failed: ${message}`)
    process.exitCode = 2
  }
}
