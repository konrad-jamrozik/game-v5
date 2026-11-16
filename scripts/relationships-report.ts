import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { collectMarkdownFiles } from './lint-specs.ts'
import { relationshipEvidence } from './spec-linter/linter.ts'
import { formatEvidence } from './spec-linter/relationship-evidence.ts'

/**
 * Prints where the recorded uses and refines relationships differ from what the specifications' Normative text shows.
 * It never fails: the comparison is a heuristic, so it reports for review instead of blocking.
 */
async function main(): Promise<void> {
  const root = process.cwd()
  const files = await collectMarkdownFiles(root, resolve(root, 'docs'))
  const findings = relationshipEvidence({ files })
  console.log(findings.length === 0 ? 'No differences found.' : formatEvidence(findings))
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : undefined
if (invokedPath === fileURLToPath(import.meta.url)) {
  await main()
}
