import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Temporary declaration-only fixes. Review and remove these when upgrading the affected packages.
// Keep skipLibCheck: false, exact optional properties, and Node-only tooling ambient types.
const patches = [
  {
    dependency: 'tinybench',
    version: '6.1.4',
    file: 'dist/index.d.ts',
    before: 'declare const performanceNow: () => DOMHighResTimeStamp;',
    after: 'declare const performanceNow: () => number;',
  },
  {
    dependency: 'vitest',
    version: '5.0.0',
    file: 'config.d.ts',
    before: "import type {} from '@vitest/expect'",
    after: "import type {} from 'chai'",
  },
  {
    dependency: 'vitest',
    version: '5.0.0',
    file: 'dist/chunks/plugin.d.BbcoZhuj.d.ts',
    before: 'provider?: string;',
    after: 'provider?: string | undefined;',
  },
  {
    dependency: 'vitest',
    version: '5.0.0',
    file: 'browser/context.d.ts',
    before: "export { BrowserCommands, CDPSession, FsOptions } from 'vitest/internal/browser'",
    // Matches packages/browser/context.d.ts in the upstream v5.0.0 release.
    after: `export { BrowserCommands, CDPSession, FsOptions } from 'vitest/internal/browser'
export interface MarkOptions {
  stack?: string
  kind?: 'action' | 'expect' | 'mark' | 'lifecycle'
}`,
  },
  {
    dependency: 'vitest',
    version: '5.0.0',
    file: 'dist/chunks/plugin.d.BbcoZhuj.d.ts',
    before: 'vmMemoryLimit?: string | number;',
    after: 'vmMemoryLimit?: string | number | undefined;',
  },
]

for (const [index, patch] of patches.entries()) {
  const directory = resolve(import.meta.dirname, '..', 'node_modules', patch.dependency)
  const metadata: unknown = JSON.parse(readFileSync(resolve(directory, 'package.json'), 'utf8'))
  if (
    typeof metadata !== 'object' ||
    metadata === null ||
    !('version' in metadata) ||
    metadata.version !== patch.version
  ) {
    throw new Error(`Review the declaration patch for ${patch.dependency}; its installed version changed`)
  }

  const path = resolve(directory, patch.file)
  const content = readFileSync(path, 'utf8')
  const marker = `// game-v5 declaration patch ${index}: scripts/patch-dependency-types.ts\n`
  if (content.includes(marker)) {
    continue
  }
  if (content.split(patch.before).length !== 2) {
    throw new Error(`Review the declaration patch for ${patch.dependency}/${patch.file}; its contents changed`)
  }
  writeFileSync(path, marker + content.replace(patch.before, patch.after))
}
