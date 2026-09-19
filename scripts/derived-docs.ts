import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { resolveConfig, type Options } from 'prettier'

import { collectMarkdownFiles } from './lint-specs.ts'
import { renderDerivedDocumentation } from './spec-docs/generator.ts'
import { analyzeSpecifications, formatDiagnostic, lintRequirementReferences } from './spec-linter/linter.ts'
import { columnOf, headingSlugs, isLink, lineOf, parseDocument, visit } from './spec-linter/markdown.ts'
import { decodeUrlPart, isExternalUrl, resolvePath, splitUrl } from './spec-linter/paths.ts'
import type { SourceFile } from './spec-linter/types.ts'

export interface DerivedDocsIO {
  readonly actualOutputs: ReadonlyMap<string, string>
  readonly writeOutputs: (outputs: ReadonlyMap<string, string>) => Promise<void>
  readonly writeError: (message: string) => void
}

function normalizeLineEndings(value: string): string {
  return value.replace(/\r\n?/g, '\n')
}

export function derivedOutputFindings(
  expected: ReadonlyMap<string, string>,
  actual: ReadonlyMap<string, string>,
): readonly string[] {
  const expectedPaths: ReadonlySet<string> = new Set(expected.keys())
  const findings: string[] = []
  for (const path of actual.keys()) {
    if (!expectedPaths.has(path)) {
      findings.push(`${path}: unexpected generated documentation file; remove or relocate it.`)
    }
  }
  for (const path of expectedPaths) {
    const expectedContent = expected.get(path)
    const actualContent = actual.get(path)
    if (expectedContent === undefined) {
      throw new Error(`Expected output is missing from the renderer: ${path}.`)
    }
    if (actualContent === undefined) {
      findings.push(`${path}: generated documentation is missing; run npm run docs:generate.`)
    } else if (normalizeLineEndings(actualContent) !== normalizeLineEndings(expectedContent)) {
      findings.push(`${path}: generated documentation is stale; run npm run docs:generate.`)
    }
  }
  return findings.toSorted()
}

export function derivedLinkFindings(
  sourceFiles: readonly SourceFile[],
  outputs: ReadonlyMap<string, string>,
): readonly string[] {
  const documents = new Map(
    sourceFiles
      .filter((file) => file.path.endsWith('.md'))
      .map((file) => [file.path.replace(/\\/g, '/'), parseDocument(file)]),
  )
  for (const [path, content] of outputs) documents.set(path, parseDocument({ path, content }))
  const casePaths = new Map([...documents.keys()].map((path) => [path.toLowerCase(), path]))
  const slugCache = new Map<string, ReadonlySet<string>>()
  const findings: string[] = []
  for (const [path] of outputs) {
    const document = documents.get(path)
    if (!document) continue
    visit(document.tree, (node) => {
      if (!isLink(node) || isExternalUrl(node.url)) return
      const parts = splitUrl(node.url)
      const decodedPath = decodeUrlPart(parts.path)
      const decodedFragment = parts.fragment === undefined ? undefined : decodeUrlPart(parts.fragment)
      const location = `${path}:${lineOf(node)}:${columnOf(node)}`
      if (decodedPath === undefined || (parts.fragment !== undefined && decodedFragment === undefined)) {
        findings.push(`${location}: generated local link "${node.url}" is not valid percent-encoding.`)
        return
      }
      const destinationPath = decodedPath ? resolvePath(path, decodedPath) : path
      const destination = documents.get(destinationPath)
      if (!destination) {
        const actualPath = casePaths.get(destinationPath.toLowerCase())
        findings.push(
          actualPath
            ? `${location}: generated local link path casing differs from "${actualPath}".`
            : `${location}: generated local link destination "${destinationPath}" does not exist.`,
        )
        return
      }
      if (!decodedFragment) return
      let slugs = slugCache.get(destinationPath)
      if (!slugs) {
        slugs = headingSlugs(destination)
        slugCache.set(destinationPath, slugs)
      }
      if (!slugs.has(decodedFragment)) {
        findings.push(
          `${location}: generated local link anchor "#${decodedFragment}" does not exist in "${destinationPath}".`,
        )
      }
    })
  }
  return findings.toSorted()
}

export async function runDerivedDocumentation(
  files: readonly SourceFile[],
  arguments_: readonly string[],
  io: DerivedDocsIO,
  prettierOptions: Options = {},
): Promise<0 | 1 | 2> {
  const mode = arguments_[0]
  if (arguments_.length !== 1 || (mode !== 'generate' && mode !== 'check')) {
    io.writeError('Derived documentation command requires exactly one argument: generate or check.')
    return 2
  }
  try {
    const analysis = analyzeSpecifications({ files })
    if (analysis.diagnostics.length > 0) {
      for (const diagnostic of analysis.diagnostics) io.writeError(formatDiagnostic(diagnostic))
      return 1
    }
    const expected = await renderDerivedDocumentation(analysis.corpus, prettierOptions)
    const linkFindings = derivedLinkFindings(files, expected)
    if (linkFindings.length > 0) {
      for (const finding of linkFindings) io.writeError(finding)
      return 1
    }
    const requirementDiagnostics = lintRequirementReferences(
      {
        files: [
          ...files.filter((file) => !file.path.startsWith('docs/derived/')),
          ...[...expected].map(([path, content]) => ({ path, content })),
        ],
      },
      true,
    )
    if (requirementDiagnostics.length > 0) {
      for (const diagnostic of requirementDiagnostics) io.writeError(formatDiagnostic(diagnostic))
      return 1
    }
    const unexpected = [...io.actualOutputs.keys()].filter((path) => !expected.has(path)).toSorted()
    if (unexpected.length > 0) {
      for (const path of unexpected) {
        io.writeError(`${path}: unexpected generated documentation file; remove or relocate it.`)
      }
      return 1
    }
    if (mode === 'generate') {
      await io.writeOutputs(expected)
      return 0
    }
    const findings = derivedOutputFindings(expected, io.actualOutputs)
    for (const finding of findings) io.writeError(finding)
    return findings.length === 0 ? 0 : 1
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    io.writeError(`Derived documentation command failed: ${message}`)
    return 2
  }
}

async function collectOutputFiles(root: string, directory: string): Promise<ReadonlyMap<string, string>> {
  let entries
  try {
    entries = await readdir(directory, { withFileTypes: true })
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') return new Map()
    throw error
  }
  const output = new Map<string, string>()
  for (const entry of entries) {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) {
      for (const [childPath, content] of await collectOutputFiles(root, path)) output.set(childPath, content)
    } else if (entry.isFile()) {
      output.set(relative(root, path).replace(/\\/g, '/'), await readFile(path, 'utf8'))
    }
  }
  return output
}

async function main(): Promise<void> {
  const root = process.cwd()
  const docsDirectory = resolve(root, 'docs')
  const outputDirectory = resolve(root, 'docs', 'derived')
  const [files, actualOutputs, prettierOptions] = await Promise.all([
    collectMarkdownFiles(root, docsDirectory),
    collectOutputFiles(root, outputDirectory),
    resolveConfig(root),
  ])
  process.exitCode = await runDerivedDocumentation(
    files,
    process.argv.slice(2),
    {
      actualOutputs,
      writeOutputs: async (outputs) => {
        await mkdir(outputDirectory, { recursive: true })
        await Promise.all(
          [...outputs].map(async ([path, content]) => {
            const absolutePath = resolve(root, path)
            await mkdir(dirname(absolutePath), { recursive: true })
            await writeFile(absolutePath, content, 'utf8')
          }),
        )
      },
      writeError: console.error,
    },
    prettierOptions ?? {},
  )
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : undefined
if (invokedPath === fileURLToPath(import.meta.url)) {
  try {
    await main()
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`Derived documentation command failed: ${message}`)
    process.exitCode = 2
  }
}
