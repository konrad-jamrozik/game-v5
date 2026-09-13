import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['test/**/*.test.{ts,js}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,js}'],
      reporter: ['text', 'html', 'lcov'],
    },
  },
})
