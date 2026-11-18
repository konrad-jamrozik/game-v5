import { readFile } from 'node:fs/promises'
import { matchesGlob, resolve } from 'node:path'

import { format, type FormatConfig, type OxfmtConfig } from 'oxfmt'

/** The repository's Oxfmt configuration, as `.oxfmtrc.json` states it. */
export type FormatterConfig = OxfmtConfig

/** Reads `.oxfmtrc.json` from `root`, or returns an empty configuration when the file is absent. */
export async function loadFormatterConfig(root: string): Promise<FormatterConfig> {
  let text
  try {
    text = await readFile(resolve(root, '.oxfmtrc.json'), 'utf8')
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT') return {}
    throw error
  }
  const config: unknown = JSON.parse(text)
  if (!isFormatterConfig(config)) throw new Error('.oxfmtrc.json must contain a JSON object.')
  return config
}

function isFormatterConfig(value: unknown): value is FormatterConfig {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Returns the options Oxfmt applies to `path`: the top-level options with every matching override applied in order,
 * as the Oxfmt command line resolves them.
 */
function optionsFor(path: string, config: FormatterConfig): FormatConfig {
  const { overrides = [], ignorePatterns: _ignorePatterns, $schema: _schema, ...base } = config
  let options: FormatConfig = base
  for (const override of overrides) {
    const matches = override.files.some((glob) => matchesGlob(path, glob))
    const excluded = (override.excludeFiles ?? []).some((glob) => matchesGlob(path, glob))
    if (matches && !excluded) options = { ...options, ...override.options }
  }
  return options
}

/** Formats Markdown that will be written to `path` (relative to the repository root) as `npm run format` would. */
export async function formatMarkdown(path: string, content: string, config: FormatterConfig = {}): Promise<string> {
  const result = await format(path, content, { ...optionsFor(path, config), endOfLine: 'lf' })
  if (result.errors.length > 0) {
    throw new Error(`Formatting ${path} failed: ${result.errors.map((error) => error.message).join('; ')}`)
  }
  return result.code
}
