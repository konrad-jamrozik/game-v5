# Game v5

The specifications of a turn-based strategy game and the tooling that checks them. The platform, language, UI technology, state management, and persistence are left to each implementation.

## Implementations

Each implementation lives outside this repository, in its own directory beside this repository's local clone, which it treats as its repository root, as required by [Implementation Placement](docs/specs/implementation/mandatory/implementation-placement.md); e.g., beside `repos/game-v5/` an implementer creates `repos/game-v5-impl-a/`. That directory starts as a plain local directory and may later become a standalone repository. This repository has no game code.

## Design and continuation

The [Game Design Brief](docs/game-design-brief.md) records gameplay intent. The [specification index](docs/specs/README.md) links the detailed contracts.

## Getting started

This repository's toolchain checks the specifications only; it implies nothing about the toolchain of an implementation.

Use Node **26.13.1** (see `.node-version`) and its bundled npm **11.20.0**. A Node version manager can install that version. Then run:

```sh
npm ci
npm run check
```

## Agent environment setup

Agents working in this repository need the same Node and npm versions as human contributors. On Windows, install Node **26.13.1** with npm **11.20.0** and ensure both executables are on the `PATH` inherited by the agent host. If Node or npm was installed while the agent application was open, restart the application so newly started tasks receive the updated environment.

Before running repository commands, verify the toolchain from PowerShell without first attempting an npm script:

```powershell
Get-Command node
Get-Command npm
node --version
npm --version
```

The reported versions should satisfy the `engines` field in `package.json`. Then install the pinned dependencies with `npm ci`. A bundled agent runtime is not a substitute for the repository toolchain unless it exposes both `node` and `npm`; this repository's validation commands call npm recursively.

### T3 Code

When agents run in [T3 Code](https://github.com/pingdotgg/t3code), the skills that change the specifications create their worktree through T3 Code, as [Spec repo changes in a worktree](.claude/skills/spec-repo-worktree.md) directs, so that each thread shows the worktree it works in. Set up T3 Code once, under **Settings › Worktrees**, applying settings for all projects across all environments:

- **Worktree location:** `~/repos/worktrees`, so that worktrees sit next to the repositories instead of in the T3 home folder.
- **Delete worktrees with deleted threads:** on, so that deleting a finished thread also removes its worktree; a worktree with local changes is kept.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run typecheck` | Check tests and tooling |
| `npm run lint:code` | Run type-aware Oxlint; warnings fail |
| `npm run lint:specs` | Deterministically lint registered specifications |
| `npm run compendium:check` | Check the Compendium articles against the game data |
| `npm run docs:generate` | Update views derived from registered specifications |
| `npm run docs:check` | Check that derived specification views are current |
| `npm run docs:link-terms` | Link the first mention of every term to its definition |
| `npm run docs:plain` | Print specifications with every link reduced to its label |
| `npm run specs:budget` | Report, raise, or set the word budget of a specification |
| `npm run balance:bench` | Serve the [GDR Balance Bench](tools/gdr-balance-bench/README.md), a local page for balancing GDR values |
| `npm run autopilot:bench` | Serve the [Autopilot Bench](tools/autopilot-bench/README.md), a local page for tuning the Basic Autopilot AI |
| `npm run rating:bench` | Serve the [Combat Rating Bench](tools/combat-rating-bench/README.md), a local page for finding a Combat rating formula that predicts who wins against each Mission site |
| `npm run terms:report` | List the first mention of every term in every specification |
| `npm run lint` | Run code and specification linting |
| `npm run fix` | Link terms, regenerate derived views, format, fix code lint |
| `npm run lint:fix` | Fix code lint, then check specifications read-only |
| `npm run check:commit` | Run the read-only checks used by the commit hook |
| `npm run format` | Format supported files |
| `npm run format:check` | Check formatting without editing |
| `npm test` | Run tests once |
| `npm run test:watch` | Watch tests |
| `npm run test:ui` | Start the local Vitest UI |
| `npm run test:coverage` | Generate text, HTML, and LCOV reports in `coverage/` |
| `npm run hooks:install` | Enable the tracked Git hooks for this checkout |
| `npm run check` | Run the same validation used in CI |

## Verification

The [verification guide](docs/verification.md) explains which checks to run for each kind of change, how the targeted, commit, full, and CI layers relate, and what a clean result does and does not prove.

## Derived specification views

The [derived specification catalog](docs/derived/README.md) links an alphabetical glossary, specification relationship graphs, and a preview of the Compendium, i.e. of every in-game reference article with its values and links filled in. These informative Markdown files are generated from the registered specifications, and the Compendium preview from the game data under `content/`; the source specifications and game data remain authoritative. Each spec Family directory also has an `about-<family>.md` overview whose relationship diagrams the same command regenerates between marker comments. After changing a specification, run `npm run docs:generate`. The command also writes the diagrams of each family overview as SVG files in `docs/images/diagrams/`, e.g. `docs/images/diagrams/mechanics-family-within.svg`; do not edit them by hand. Hand-made diagrams also live in `docs/images/diagrams/`, and the Screenshots of the game in `docs/images/screens/`. Commit the resulting files. `npm run docs:check` reports missing, stale, or unexpected files without modifying them, and runs as part of commit and CI checks.

## Strictness and tests

The shared TypeScript configuration enables the strict family and the additional strictest-style checks, including exact optional properties and checked indexed access. Declaration files are checked (`skipLibCheck: false`). Tooling and tests have Node ambient types. Any included first-party JavaScript is also checked. Oxlint rejects explicit and unsafe `any`, unsafe assertions, unhandled or misused promises, and non-exhaustive switches.

`npm ci` applies temporary declaration fixes through `scripts/patch-dependency-types.ts`: Tinybench 6.1.4's timestamp return type, and Vitest 5.0.0's stale Chai type import, benchmark/memory-limit optional properties, and missing `MarkOptions` export. These change types only; they preserve full declaration checking without adding browser dependencies. The script checks package versions and fails if an upgrade needs review. Remove each fix once upstream resolves it. The marker type matches [Vitest's v5.0.0 source](https://github.com/vitest-dev/vitest/blob/v5.0.0/packages/browser/context.d.ts).

Put unit tests in `test/**/*.test.ts` and import test APIs explicitly from `vitest`. The test environment is Node, suitable for the repository tooling. No browser runner or DOM emulation is installed.

The specification linter has the repository's first tests. Coverage is available on demand; there is no initial coverage threshold.

## Local Git hooks

Enable the repository's tracked hooks once per checkout or worktree:

```sh
npm run hooks:install
```

The pre-commit hook runs specification linting first, followed by the Compendium check, the derived-view check, formatting, and code linting. The pre-push hook runs the same validation pipeline as `npm run check` and CI: specification linting, the Compendium check, the derived-view check, formatting, code linting, tests, and type checking. The hooks invoke the installed project tools directly so Git clients and agents do not depend on shell-specific npm initialization. A failing command aborts the Git operation, and the hook then names the check that failed, the command that fixes it, e.g. `npm run format` for formatting, and any uncommitted changes, since the hooks check the files on disk. Git's `--no-verify` option can bypass client-side hooks, so CI remains authoritative.

## CI and updates

Pull requests and pushes to `main` run specification linting, the Compendium check, the derived-view check, formatting, code linting, tests, and type checking. The workflow also supports manual dispatch. Nothing is deployed.

Dependencies are pinned and installed reproducibly with `npm ci`. Dependabot opens grouped weekly updates for npm and GitHub Actions; updates require review and are not automatically merged.

## License

[CC BY-NC 4.0](LICENSE), matching [game-ts](https://github.com/konrad-jamrozik/game-ts).

The Agent name lists in `content/agents/name_lists.yaml` are adapted from [The X-Com Files](https://github.com/SolariusScorch/XComFiles) by Solarius Scorch and its contributors, under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/); the Agents GDRs section of [GDRs](docs/specs/design/content/gdrs.md#agents-gdrs) states what was changed.
