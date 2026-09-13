import { dirname } from 'node:path/posix'

export interface UrlParts {
  readonly path: string
  readonly fragment: string | undefined
}

export function normalizePath(value: string): string {
  const segments: string[] = []
  for (const segment of value.replace(/\\/g, '/').split('/')) {
    if (segment === '' || segment === '.') continue
    if (segment === '..') {
      segments.pop()
      continue
    }
    segments.push(segment)
  }
  return segments.join('/')
}

export function directoryOf(filePath: string): string {
  const directory = dirname(filePath)
  return directory === '.' ? '' : directory
}

export function resolvePath(fromPath: string, targetPath: string): string {
  return normalizePath(`${directoryOf(fromPath)}/${targetPath}`)
}

export function splitUrl(url: string): UrlParts {
  const hash = url.indexOf('#')
  return hash === -1 ? { path: url, fragment: undefined } : { path: url.slice(0, hash), fragment: url.slice(hash + 1) }
}

export function decodeUrlPart(value: string): string | undefined {
  try {
    return decodeURIComponent(value)
  } catch {
    return undefined
  }
}

export function isExternalUrl(url: string): boolean {
  return /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(url)
}
