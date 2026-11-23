import { readdir, readFile } from 'node:fs/promises'
import { relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { formatDiagnostic, lintSpecifications } from './spec-linter/linter.ts'
import type { SourceFile, WordBudgets } from './spec-linter/types.ts'
import { parseWordBudgets, WORD_BUDGETS_PATH } from './spec-linter/word-budgets.ts'

export function runSpecificationLint(
  files: readonly SourceFile[],
  arguments_: readonly string[],
  writeError: (message: string) => void,
  wordBudgets?: WordBudgets,
): 0 | 1 | 2 {
  if (arguments_.length !== 0) {
    writeError('Specification linter does not accept command-line arguments.')
    return 2
  }
  try {
    const diagnostics = lintSpecifications(wordBudgets ? { files, wordBudgets } : { files })
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

export async function collectMarkdownFiles(root: string, directory: string): Promise<readonly SourceFile[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const files: SourceFile[] = []
  for (const entry of entries) {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await collectMarkdownFiles(root, path)))
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push({
        path: relative(root, path).replace(/\\/g, '/'),
        content: await readFile(path, 'utf8'),
      })
    }
  }
  return files
}

/** Reads the word budgets of the repository at `root`. */
export async function readWordBudgets(root: string): Promise<WordBudgets> {
  return parseWordBudgets(await readFile(resolve(root, WORD_BUDGETS_PATH), 'utf8'))
}

async function main(): Promise<void> {
  const root = process.cwd()
  const files = await collectMarkdownFiles(root, resolve(root, 'docs'))
  process.exitCode = runSpecificationLint(files, process.argv.slice(2), console.error, await readWordBudgets(root))
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
