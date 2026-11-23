# Tech Stack Suggestion

| Metadata | Value |
| --- | --- |
| Spec ID | STACK |
| Family | Guidance |
| Audience | Implementer |
| Owns | A suggested technology stack for a browser Implementation. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Implementation Specification Conventions](../../governance/conventions/implementation-spec-conventions.md) |

# Overview

The browser Implementation has chosen its stack, and its dependency declarations list it. A few of the choices carry a reason that a later change of technology is suggested to keep, and some libraries fail in ways that are slow to diagnose.

# Suggested stack

The reasons below are suggested to outlive any particular library.

- **A fast quick check:** the toolchain is [Vite+](https://viteplus.dev/), whose native [Oxc](https://oxc.rs/) linter and formatter, with the native TypeScript compiler, keep formatting, linting, and type checking to seconds, because the quick check runs far more often than anything else.
- **[World states](../../design/foundation/engine-contract.md#player-actions-and-turns) that share their unchanged parts:** Immer produces each World state as an immutable value that shares what did not change with the one before it, as [Storage Schema](storage-schema.md) suggests for undo and redo.

# Known pitfalls

Each pitfall below names the symptom and the remedy.

- **Unstable table data:** A headless table library that derives its rows from the data it is given, e.g. TanStack Table's `useReactTable`, can re-render without end, and freeze the page, when it receives a new data array on every render. Pass it an array whose reference changes only when its content does, e.g. one built with `useMemo`.
