import { readdir, readFile } from 'node:fs/promises'
import { relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { formatDiagnostic, lintSpecifications } from './spec-linter/linter.ts'
import type { SourceFile } from './spec-linter/types.ts'

export function runSpecificationLint(
  files: readonly SourceFile[],
  arguments_: readonly string[],
  writeError: (message: string) => void,
): 0 | 1 | 2 {
  if (arguments_.length !== 0) {
    writeError('Specification linter does not accept command-line arguments.')
    return 2
  }
  try {
    const diagnostics = lintSpecifications({ files })
    for (const diagnostic of diagnostics) {
      writeError(formatDiagnostic(diagnostic))
    }
    return diagnostics.length === 0 ? 0 : 1
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    writeError(`Specification linter failed: ${message}`)
    return 2
  }
}

async function markdownFiles(root: string, directory: string): Promise<readonly SourceFile[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const files: SourceFile[] = []
  for (const entry of entries) {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await markdownFiles(root, path)))
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push({
        path: relative(root, path).replace(/\\/g, '/'),
        content: await readFile(path, 'utf8'),
      })
    }
  }
  return files
}

async function main(): Promise<void> {
  const root = process.cwd()
  const files = await markdownFiles(root, resolve(root, 'docs'))
  process.exitCode = runSpecificationLint(files, process.argv.slice(2), console.error)
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : undefined
if (invokedPath === fileURLToPath(import.meta.url)) {
  try {
    await main()
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`Specification linter failed: ${message}`)
    process.exitCode = 2
  }
}
