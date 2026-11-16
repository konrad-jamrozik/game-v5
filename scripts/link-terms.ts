import { readFile, writeFile } from 'node:fs/promises'
import { posix, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { collectMarkdownFiles } from './lint-specs.ts'
import { termMentions } from './spec-linter/linter.ts'
import type { TermMention } from './spec-linter/term-mentions.ts'
import type { SourceFile } from './spec-linter/types.ts'

/**
 * Links the first mention of every term another specification owns to the term's Glossary group in its owner. An
 * unlinked mention becomes a link; a mention already linked to its owner at another anchor gets the right anchor.
 * Running it again changes nothing.
 */

interface Edit {
  readonly start: number
  readonly end: number
  readonly text: string
}

function targetOf(mention: TermMention): string {
  const relative = posix.relative(posix.dirname(mention.specificationPath), mention.ownerPath)
  return `${relative}#${mention.anchor}`
}

function editFor(content: string, mention: TermMention): Edit | undefined {
  if (mention.link === 'none' && mention.start !== undefined && mention.end !== undefined) {
    return { start: mention.start, end: mention.end, text: `[${mention.text}](${targetOf(mention)})` }
  }
  if (mention.link === 'other anchor' && mention.linkStart !== undefined && mention.linkEnd !== undefined) {
    // An inline link ends with "](destination)"; only the destination changes.
    const source = content.slice(mention.linkStart, mention.linkEnd)
    const open = source.lastIndexOf('](')
    if (open < 0 || !source.endsWith(')')) return undefined
    return { start: mention.linkStart + open + 2, end: mention.linkEnd - 1, text: targetOf(mention) }
  }
  return undefined
}

/** Returns the files whose content the links change, with their new content. */
export function linkTerms(files: readonly SourceFile[]): readonly SourceFile[] {
  const mentions = termMentions({ files })
  const byPath = new Map<string, TermMention[]>()
  for (const mention of mentions) {
    byPath.set(mention.specificationPath, [...(byPath.get(mention.specificationPath) ?? []), mention])
  }
  const changed: SourceFile[] = []
  for (const file of files) {
    const own = byPath.get(file.path)
    if (!own) continue
    const edits = own
      .map((mention) => editFor(file.content, mention))
      .filter((edit) => edit !== undefined)
      .toSorted((left, right) => right.start - left.start)
    if (edits.length === 0) continue
    let content = file.content
    for (const edit of edits) content = content.slice(0, edit.start) + edit.text + content.slice(edit.end)
    changed.push({ path: file.path, content })
  }
  return changed
}

async function main(): Promise<void> {
  const root = process.cwd()
  const files = await collectMarkdownFiles(root, resolve(root, 'docs'))
  const changed = linkTerms(files)
  for (const file of changed) {
    const path = resolve(root, file.path)
    if ((await readFile(path, 'utf8')) !== file.content) await writeFile(path, file.content)
  }
  console.log(`Linked first mentions in ${changed.length} specifications.`)
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : undefined
if (invokedPath === fileURLToPath(import.meta.url)) {
  await main()
}
