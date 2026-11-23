import type { WordBudgets } from './types.ts'

/** The file that records the word budget of every document under the specification root. */
export const WORD_BUDGETS_PATH = 'docs/specs/word-budgets.json'

/** How far a document that follows the rules against repetition may grow before its budget must be raised. */
const CUT_HEADROOM = 1.1
/** How far a document awaiting its cut may grow: enough for a correction, not for a new section. */
const AWAITING_HEADROOM = 1.02

/** Counts the words of a Markdown document as authored: every run of characters that holds a letter or a digit. */
export function countWords(text: string): number {
  return text.split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word)).length
}

/** The budget of a document of the given size: its words plus the headroom of its state, rounded up to a ten. */
export function budgetFor(words: number, awaitingCut: boolean): number {
  return Math.ceil((words * (awaitingCut ? AWAITING_HEADROOM : CUT_HEADROOM)) / 10) * 10
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Reads the content of the word budgets file, rejecting any other shape. */
export function parseWordBudgets(content: string): WordBudgets {
  const data: unknown = JSON.parse(content)
  if (!isRecord(data) || !isRecord(data['budgets']) || !Array.isArray(data['awaitingCut'])) {
    throw new Error(`${WORD_BUDGETS_PATH} must hold an object with "awaitingCut" (a list) and "budgets" (an object).`)
  }
  const budgets: Record<string, number> = {}
  for (const [path, budget] of Object.entries(data['budgets'])) {
    if (typeof budget !== 'number' || !Number.isInteger(budget) || budget < 0) {
      throw new Error(`${WORD_BUDGETS_PATH}: the budget of "${path}" must be a whole number.`)
    }
    budgets[path] = budget
  }
  const awaitingCut = data['awaitingCut'].map((path: unknown) => {
    if (typeof path !== 'string') throw new Error(`${WORD_BUDGETS_PATH}: "awaitingCut" must list paths.`)
    return path
  })
  return { awaitingCut, budgets }
}

function compare(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
}

/** Renders the word budgets file with its paths sorted, so a change to one budget is a change to one line. */
export function formatWordBudgets(wordBudgets: WordBudgets): string {
  const budgets = Object.fromEntries(
    Object.entries(wordBudgets.budgets).toSorted(([left], [right]) => compare(left, right)),
  )
  return `${JSON.stringify({ awaitingCut: wordBudgets.awaitingCut.toSorted(compare), budgets }, null, 2)}\n`
}
