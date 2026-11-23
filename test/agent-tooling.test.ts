import { describe, expect, test } from 'vitest'

import { plainMarkdown } from '../scripts/plain-docs.ts'

describe('plainMarkdown', () => {
  test('reduces links to their labels and images to their alt text', () => {
    expect(plainMarkdown('An [Agent](../a.md#glossary) is [In transit](b.md#x "t").')).toBe('An Agent is In transit.')
    expect(plainMarkdown('![Agents View](../../images/a.png)')).toBe('[image: Agents View]')
    expect(plainMarkdown('[`assignAgents`](c.md)')).toBe('`assignAgents`')
  })
})
