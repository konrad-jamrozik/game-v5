import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { collectMarkdownFiles, readWordBudgets } from './lint-specs.ts'
import type { SourceFile, WordBudgets } from './spec-linter/types.ts'
import { budgetFor, countWords, formatWordBudgets, WORD_BUDGETS_PATH } from './spec-linter/word-budgets.ts'

const SPECIFICATION_ROOT = 'docs/specs/'

const USAGE = [
  'Usage: npm run specs:budget -- <command> [<path>...]',
  '',
  '  raise <path>...  Set the budget of each document from its present size, keeping whether it awaits its cut.',
  '  cut <path>...    Record that each document now follows the rules against repetition, and set its budget.',
  '  report           List every document with its words, its budget, and whether it awaits its cut.',
  '  init             Write the budgets file anew, with every document awaiting its cut.',
].join('\n')

/** The budgets after `command` is applied to `paths`, given the documents under the specification root. */
export function updateWordBudgets(
  current: WordBudgets,
  documents: readonly SourceFile[],
  command: 'raise' | 'cut',
  paths: readonly string[],
): WordBudgets {
  const budgets = { ...current.budgets }
  const awaitingCut = new Set(current.awaitingCut)
  for (const path of paths) {
    const document = documents.find((candidate) => candidate.path === path)
    if (!document) throw new Error(`"${path}" is not a document under ${SPECIFICATION_ROOT}.`)
    if (command === 'cut') awaitingCut.delete(path)
    budgets[path] = budgetFor(countWords(document.content), awaitingCut.has(path))
  }
  return { awaitingCut: [...awaitingCut], budgets }
}

async function main(): Promise<void> {
  const root = process.cwd()
  const [command, ...rawPaths] = process.argv.slice(2)
  const paths = rawPaths.map((path) => path.replace(/\\/g, '/'))
  const documents = (await collectMarkdownFiles(root, resolve(root, 'docs'))).filter((file) =>
    file.path.startsWith(SPECIFICATION_ROOT),
  )
  const target = resolve(root, WORD_BUDGETS_PATH)
  if (command === 'init') {
    const budgets = Object.fromEntries(
      documents.map((document) => [document.path, budgetFor(countWords(document.content), true)]),
    )
    await writeFile(target, formatWordBudgets({ awaitingCut: documents.map((document) => document.path), budgets }))
    return
  }
  if (command === 'report') {
    const current = await readWordBudgets(root)
    const awaitingCut = new Set(current.awaitingCut)
    for (const document of documents) {
      const words = String(countWords(document.content)).padStart(6)
      const budget = String(current.budgets[document.path] ?? '-').padStart(6)
      console.log(`${words} ${budget}  ${awaitingCut.has(document.path) ? 'awaiting' : 'cut     '}  ${document.path}`)
    }
    return
  }
  if ((command !== 'raise' && command !== 'cut') || paths.length === 0) {
    console.error(USAGE)
    process.exitCode = 2
    return
  }
  const updated = updateWordBudgets(await readWordBudgets(root), documents, command, paths)
  if (formatWordBudgets(updated) !== (await readFile(target, 'utf8')))
    await writeFile(target, formatWordBudgets(updated))
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : undefined
if (invokedPath === resolve(import.meta.dirname, 'word-budgets.ts')) {
  try {
    await main()
  } catch (error: unknown) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 2
  }
}
