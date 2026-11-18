# Verification

This guide says which checks to run for each kind of change and when. The [Commands](../README.md#commands) table in the README lists every script. Before running any script, confirm the toolchain as described in [Agent environment setup](../README.md#agent-environment-setup).

## Layers

Checks run in four layers. From the commit layer on, each layer includes everything in the layer before it:

| Layer | Command | Runs | Where it runs |
| --- | --- | --- | --- |
| Targeted | Individual scripts | Only what the change touches; see [By change](#by-change) | While iterating |
| Commit | `npm run check:commit` | Specification lint, derived-view check, format check, code lint | Pre-commit hook |
| Full | `npm run check` | Everything in the commit layer, plus tests and type checking | Pre-push hook and before completion |
| Authoritative | `npm run check` in CI | The same as the full layer, on a clean install | Pull requests and pushes to `main` |

Client-side hooks can be bypassed with `--no-verify`, so CI is the authoritative result.

## By change

Run the targeted checks while iterating. They give faster, narrower feedback than the full pipeline.

| Change | Targeted checks |
| --- | --- |
| Specifications under `docs/specs/` | `npm run lint:specs`, then `npm run docs:generate`, and commit the regenerated files in `docs/derived/` and the Family overview diagrams |
| Other Markdown or configuration files | `npm run format:check` (or `npm run format` to fix) |
| Tests in `test/` | `npm test` (or `npm run test:watch`), `npm run lint:code` |
| Tooling in `scripts/` | `npm test`, `npm run lint:code`, `npm run typecheck`; rerun any affected script |
| Dependencies or tool configuration | `npm ci`, then `npm run check` |

Run `npm run lint:specs` first when checking specifications or the references between them. The derived-view check (`npm run docs:check`) and the rest of the pipeline depend on specifications that parse and resolve. When a change adds, removes, or moves a term, run `npm run docs:link-terms` to add and retarget the links from first mentions to their definitions; `npm run lint:specs` then rejects an unlinked first mention or a cycle among the specifications.

## Before declaring a change complete

Run `npm run fix` once after the last edit, review what it changed, e.g. the term links it added, and then run `npm run check` and report every failure. `npm run fix` runs, in order, every script that rewrites files into the form the checks demand: `docs:link-terms`, `docs:generate`, `format`, and `lint:code -- --fix`. A targeted check that passes does not replace the full run.

## What checks do not prove

The specification linter and derived-view check are deterministic structural checks. They confirm registration, links, references, and generated views. A clean result does not prove that a specification is semantically correct, that its gameplay is sound, or that it agrees with the [Game Design Brief](game-design-brief.md). Review those properties separately.
