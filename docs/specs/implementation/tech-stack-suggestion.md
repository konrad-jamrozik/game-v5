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

If an Implementation uses a browser as its GUI, the Implementer may consider the following technology stack. The stack
is a suggestion; an Implementation may choose any other. The technologies listed here may be obsolete by the time an
Implementation starts, so the Implementer is expected to use their judgement and prefer newer technologies, or newer
versions, where they serve the Implementation better.

# Suggested stack

- TypeScript 7 or later, with its native compiler `tsc`.
- [Vite+](https://viteplus.dev/), a unified toolchain that bundles Vite, Vitest, and the [Oxc](https://oxc.rs/) tools
  behind one command line, with:
  - `@vitejs/plugin-react` and the React Compiler in Vite.
  - Testing Library, jsdom, and `@vitest/coverage-v8` in Vitest.
  - Oxlint for linting and Oxfmt for formatting.
- React.
- Redux Toolkit (RTK), with React Redux and `redux-undo` for undo and redo.
- MUI, with Emotion, MUI Icons, and MUI X Charts, Data Grid, and Tree View.
- Dexie, with `dexie-react-hooks`, for IndexedDB persistence.
- dependency-cruiser for enforcing module dependency rules.

# References

The stack was originally adapted from the stack of the `web` directory of
[game-ts](https://github.com/konrad-jamrozik/game-ts/).
