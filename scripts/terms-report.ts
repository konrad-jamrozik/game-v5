import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { collectMarkdownFiles } from './lint-specs.ts'
import { termMentions } from './spec-linter/linter.ts'
import type { TermMention } from './spec-linter/term-mentions.ts'

/**
 * Lists the first mention of each term another specification owns, and whether it links to the term's Glossary group.
 * With no arguments it prints a summary per term; with a specification path it prints that specification's mentions.
 */
export function formatTermMentions(mentions: readonly TermMention[], path: string | undefined): string {
  if (path) {
    return mentions
      .filter((mention) => mention.specificationPath === path)
      .map(
        (mention) =>
          `${mention.line}:${mention.column} ${mention.link.padEnd(12)} "${mention.text}" -> ${mention.ownerPath}#${mention.anchor}`,
      )
      .join('\n')
  }
  const byTerm = new Map<string, TermMention[]>()
  for (const mention of mentions) byTerm.set(mention.term, [...(byTerm.get(mention.term) ?? []), mention])
  const unlinked = mentions.filter((mention) => mention.link !== 'correct')
  const unmappable = mentions.filter((mention) => mention.start === undefined)
  const lines = [
    `First mentions: ${mentions.length}; linked correctly: ${mentions.length - unlinked.length}; to link: ${unlinked.length}; not mappable to source: ${unmappable.length}`,
    '',
    'Specifications that mention each term, most first:',
    ...[...byTerm]
      .toSorted(([, left], [, right]) => right.length - left.length)
      .map(([term, each]) => `${String(each.length).padStart(4)}  ${term}  (${each[0]?.ownerPath ?? ''})`),
  ]
  return lines.join('\n')
}

async function main(): Promise<void> {
  const root = process.cwd()
  const files = await collectMarkdownFiles(root, resolve(root, 'docs'))
  console.log(formatTermMentions(termMentions({ files }), process.argv[2]))
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : undefined
if (invokedPath === fileURLToPath(import.meta.url)) {
  await main()
}
