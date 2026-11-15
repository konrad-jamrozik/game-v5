# Tech Stack Suggestion

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | STACK                                                          |
| Family      | Implementation                                                 |
| Status      | Draft                                                          |
| Binding     | Guidance                                                       |
| Audience    | Implementer                                                    |
| Owns        | A suggested technology stack for a browser Implementation.     |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Overview

If an Implementation uses a browser as its GUI, the Implementer may consider the technology stack of the `web`
directory of [game-ts](https://github.com/konrad-jamrozik/game-ts/). The stack is a suggestion; an Implementation may
choose any other.

# Suggested stack

- TypeScript 7 or later, whose native compiler `tsc` replaces the `tsgo` preview that game-ts uses.
- Vite, with `@vitejs/plugin-react` and the React Compiler.
- Vitest, with Testing Library, jsdom, and `@vitest/coverage-v8`.
- React.
- Redux Toolkit (RTK), with React Redux and `redux-undo` for undo and redo.
- MUI, with Emotion, MUI Icons, and MUI X Charts, Data Grid, and Tree View.
- Dexie, with `dexie-react-hooks`, for IndexedDB persistence.
- Oxlint for linting, Prettier for formatting, and dependency-cruiser for enforcing module dependency rules.

# Newer tooling

The Implementer may also consider tooling beyond what game-ts uses:

- [Vite+](https://viteplus.dev/), a unified toolchain that bundles Vite, Vitest, and the Oxc tools behind one command
  line.
- More of the [Oxc](https://oxc.rs/) toolchain, e.g. its formatter Oxfmt in place of Prettier.
