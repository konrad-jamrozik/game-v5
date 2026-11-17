# Tech Stack Suggestion

| Metadata    | Value                                                                                                                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Spec ID     | STACK                                                                                                                                                                                      |
| Family      | Guidance                                                                                                                                                                                   |
| Audience    | Implementer                                                                                                                                                                                |
| Owns        | A suggested technology stack for a browser Implementation.                                                                                                                                 |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Implementation Specification Conventions](../../governance/conventions/implementation-spec-conventions.md) |

# Overview

A browser Implementation needs many technology choices before its first gameplay code, and a coherent starting set saves
that effort. If an Implementation uses a browser as its GUI, the Implementer may consider the suggested stack, though an
Implementation may choose any other.

The stack centers on one toolchain, React for the user interface, and Redux Toolkit for state with undo and redo. Its
technologies may be obsolete by the time an Implementation starts, so the Implementer is expected to use their
judgement and prefer newer technologies, or newer versions, where they serve the Implementation better.

# Suggested stack

The stack covers the toolchain, the user interface, and the data the game keeps, with each technology's companion
libraries listed with it.

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

# Known pitfalls

Some libraries in or near the stack fail in ways that are slow to diagnose, and each pitfall below names the symptom
and the remedy.

- **Unstable table data:** A headless table library that derives its rows from the data it is given, e.g. TanStack
  Table's `useReactTable`, can re-render without end, and freeze the page, when it receives a new data array on every
  render. Pass it an array whose reference changes only when its content does, e.g. one built with `useMemo`.

# References

The stack was originally adapted from the stack of the `web` directory of
[game-ts](https://github.com/konrad-jamrozik/game-ts/).
