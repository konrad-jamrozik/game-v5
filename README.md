# Game v5

A fresh, framework-neutral browser game repository. It currently displays a placeholder and has no runtime dependencies.
The UI framework, renderer, game mechanics, state management, and persistence are deliberately undecided.

## Getting started

Use Node **24.21.0** (see `.node-version`) and its bundled npm **11.19.0**. A Node version manager can install that version.
Then run:

```sh
npm ci
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173/game-v5/`. Application code lives in `src/`.

## Agent environment setup

Agents working in this repository need the same Node and npm versions as human contributors. On Windows, install
Node **24.21.0** with npm **11.19.0** and ensure both executables are on the `PATH` inherited by the agent host. If Node
or npm was installed while the agent application was open, restart the application so newly started tasks receive the
updated environment.

Before running repository commands, verify the toolchain from PowerShell without first attempting an npm script:

```powershell
Get-Command node
Get-Command npm
node --version
npm --version
```

The reported versions should satisfy the `engines` field in `package.json`. Then install the pinned dependencies with
`npm ci`. A bundled agent runtime is not a substitute for the repository toolchain unless it exposes both `node` and
`npm`; this repository's validation commands call npm recursively.

## Commands

| Command                 | Purpose                                              |
| ----------------------- | ---------------------------------------------------- |
| `npm run dev`           | Start the development server                         |
| `npm run build`         | Type-check and build into `dist/`                    |
| `npm run preview`       | Serve the existing production build locally          |
| `npm run typecheck`     | Check application, tests, and tooling                |
| `npm run lint:code`     | Run type-aware Oxlint; warnings fail                 |
| `npm run lint:specs`    | Deterministically lint registered specifications     |
| `npm run lint`          | Run code and specification linting                   |
| `npm run lint:fix`      | Fix code lint, then check specifications read-only   |
| `npm run check:commit`  | Run the read-only checks used by the commit hook     |
| `npm run format`        | Format supported files                               |
| `npm run format:check`  | Check formatting without editing                     |
| `npm test`              | Run tests once                                       |
| `npm run test:watch`    | Watch tests                                          |
| `npm run test:ui`       | Start the local Vitest UI                            |
| `npm run test:coverage` | Generate text, HTML, and LCOV reports in `coverage/` |
| `npm run hooks:install` | Enable the tracked Git hooks for this checkout       |
| `npm run check`         | Run the same validation used in CI                   |

## Strictness and tests

The shared TypeScript configuration enables the strict family and the additional strictest-style checks, including exact
optional properties and checked indexed access. Declaration files are checked (`skipLibCheck: false`). Application code has
browser ambient types; tooling and tests have Node ambient types. Any included first-party JavaScript is also checked.
Oxlint rejects explicit and unsafe `any`, unsafe assertions, unhandled or misused promises, and non-exhaustive switches.

`npm ci` applies temporary declaration fixes through `scripts/patch-dependency-types.ts`: Tinybench 6.1.4's timestamp
return type, and Vitest 5.0.0's stale Chai type import, benchmark/memory-limit optional properties, and missing `MarkOptions`
export. These change types only; they preserve full declaration checking without adding browser dependencies. The script
checks package versions and fails if an upgrade needs review. Remove each fix once upstream resolves it. The marker type
matches [Vitest's v5.0.0 source](https://github.com/vitest-dev/vitest/blob/v5.0.0/packages/browser/context.d.ts).

Put unit tests in `test/**/*.test.ts` and import test APIs explicitly from `vitest`. The test environment is Node, suitable
for framework-independent game logic. No browser runner or DOM emulation is installed.

The specification linter has the repository's first tests. Coverage is available on demand; there is no initial coverage
threshold.

## Local Git hooks

Enable the repository's tracked hooks once per checkout or worktree:

```sh
npm run hooks:install
```

The pre-commit hook runs specification linting first, followed by formatting and code linting. The pre-push hook runs the
same validation pipeline as `npm run check` and CI: specification linting, formatting, code linting, tests, type checking,
and the production build. The hooks invoke the installed project tools directly so Git clients and agents do not depend on
shell-specific npm initialization. A failing command aborts the Git operation. Git's `--no-verify` option can bypass
client-side hooks, so CI remains authoritative.

## Deployment and updates

Pull requests and pushes to `main` run formatting, linting, tests, type checking, and a production build. Successful `main`
builds deploy to [GitHub Pages](https://konrad-jamrozik.github.io/game-v5/). The workflow also supports manual dispatch.
Repository **Settings > Pages > Build and deployment > Source** must be **GitHub Actions**.

Vite's base URL is `/game-v5/`. Import application assets through Vite; reference files in `public/` using
`import.meta.env.BASE_URL` when constructing URLs so they work under the Pages subpath.

Dependencies are pinned and installed reproducibly with `npm ci`. Dependabot opens grouped weekly updates for npm and
GitHub Actions; updates require review and are not automatically merged.

## License

[CC BY-NC 4.0](LICENSE), matching [game-ts](https://github.com/konrad-jamrozik/game-ts).
