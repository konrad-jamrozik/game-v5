# GitHub Pages Deployment

| Metadata | Value |
| --- | --- |
| Spec ID | GHPAGES |
| Family | Recipes |
| Audience | Engine designer, Implementer |
| Owns | Guidance on publishing an Implementation to a public GitHub repository that deploys every push to GitHub Pages and checks the Implementation once a day. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Implementation Specification Conventions](../../governance/conventions/implementation-spec-conventions.md) |

# Overview

Once an Implementation is worth showing, the Engine designer may want anyone to be able to play it from a link, and to see every later change played the same way without asking the implementer to publish it again. GitHub Pages serves a public repository's static files from a stable address, and GitHub Actions can rebuild those files on every push.

So publishing is a pipeline that starts at a push: each push to the default branch of the public repository builds the [Game build](../../design/foundation/core-concepts.md#game-build-and-content) and replaces the one that players reach. The pipeline repeats no check, because the implementer ran the Implementation's checks before pushing and a second run only delays the deployment. A second pipeline instead runs every check once a day, so that a defect that slipped past the implementer still surfaces within a day. A push whose build fails leaves the previous Game build online.

Implementation Placement forbids publishing an Implementation until the Engine designer decides where it is hosted; this guidance describes one such destination, for the case in which the Engine designer has chosen it.

# Deployment prerequisites

Publishing is outward-facing and hard to reverse, so the implementer should start it only when both of the following hold. The list is exhaustive.

- **The Engine designer requested it.** The Engine designer has asked for the Implementation to be published to a public GitHub repository under the Engine designer's personal GitHub account. Until then the Implementation stays local, under [Creating the Implementation repo](../mandatory/implementation-placement.md#creating-the-implementation-repo). A request for a private repository, for an organization account, or for another host is a different request, and this guidance does not apply to it.
- **GitHub Pages can host the Implementation.** The Implementation's web [Game build](../../design/foundation/core-concepts.md#game-build-and-content) is a set of static files that a browser runs without a server of the Implementation's own; e.g., a single-page application built with Vite qualifies, while an Implementation that needs its own server process, a database server, or a desktop executable does not.

The implementer should also confirm, before changing anything, that the GitHub CLI `gh` is installed and that `gh auth status` reports the Engine designer's account as active. When it reports another account or no login, the implementer should ask the Engine designer to run `gh auth login` rather than ask for a token in chat.

# Local repository

The remote repository is created from the [Implementation repo](../mandatory/implementation-placement.md#implementation-repo). Before creating it, the implementer should commit the whole Implementation on its `main` branch:

```sh
git add -A
git status   # confirm nothing that belongs in .gitignore is staged
git commit -m "Initial commit"
```

The Git ignore rules should exclude installed dependencies, build output, test results, and local [Game storage](../../design/foundation/engine-contract.md#persisted-data), e.g. `node_modules/`, `dist/`, and `test-results/` for a Node implementation. Generated source files that the Implementation's checks or build step read should stay committed, because each CI workflow starts from a clean checkout.

# Public remote repository

The remote repository is named after the [Implementation name](../mandatory/implementation-placement.md#glossary), so that the GitHub Pages address names the Implementation. The implementer should create it public, under the Engine designer's account, with the local repository as its source, and push in the same command:

```sh
gh repo create <account>/<implementation-name> --public --source . --remote origin --push
```

E.g., for the account `konrad-jamrozik` and the Implementation repo `game-v5-impl-web/`, the repository is `konrad-jamrozik/game-v5-impl-web` and the Game build is served at `https://konrad-jamrozik.github.io/game-v5-impl-web/`.

When the repository already exists, the implementer should add it with `git remote add origin <url>` and push with `git push -u origin main` instead. When the name is taken by an unrelated repository, the implementer should ask the Engine designer for another name rather than choose one.

# Paths under GitHub Pages

A GitHub Pages site of a project repository is served under the path `/<repository-name>/`, not at the root of its domain, so a Game build that refers to its own files by absolute paths loads a blank page there. The implementer should make every URL the Game build uses for its own files relative, or prefixed with the repository path; e.g., with Vite, setting `base: './'` in `vite.config.ts` makes every emitted asset URL relative, and the Game build then also runs from any other path.

A Game build that changes the browser's path while it runs, e.g. one that uses history-based client-side routing, should use hash-based routing instead, because GitHub Pages answers a request for any path that is not a file with a 404 page.

# Quick check and full check

The Implementation's checks run in two places with opposite costs: the implementer waits for them on every change, while a scheduled run makes nobody wait. The Implementation should therefore keep two checks, each behind one command, e.g. `npm run check` and `npm run check:full`:

- **The quick check** is the one the implementer runs before declaring a change complete and before every push. It should hold every check that is fast, e.g. formatting, linting, type checking, and the unit tests, and it should finish in well under a minute.
- **The full check** is the quick check together with everything too slow to wait for on every change, e.g. the browser tests and the large runs of the tests described below.

No test should be dropped from the quick check only because its largest useful run is slow. A test that has a size, e.g. a number of Campaign seeds or of generated cases, should run small in the quick check and large in the full check, and should read its size from one setting, e.g. an environment variable that the command of the full check sets. E.g., a test in which the Basic Autopilot AI plays whole Campaigns to their endings plays 1 Campaign seed in the quick check and 200 in the full check.

Before pushing a change, the implementer should also run the part of the full check that the change concerns, e.g. the browser tests for a change to the Graphical User Interface.

The quick check is run far more often than anything else, so it should stay fast as the Implementation grows; e.g., the toolchain that [Tech Stack Suggestion](../guidance/tech-stack-suggestion.md) suggests lints and formats with native programs, which are much faster than tools written in JavaScript.

# Continuous integration workflows

Two CI workflows divide the work: one deploys each push and checks nothing, and the other checks everything once a day and deploys nothing. Both should reside in the [Implementation repo](../mandatory/implementation-placement.md#glossary), under `.github/workflows/`, like every other file needed to build the Implementation under [Implementation repo](../mandatory/implementation-placement.md#implementation-repo). In both, each action should be pinned to its latest major version, which the implementer looks up when writing the workflow, e.g. with `gh api repos/actions/checkout/releases/latest --jq .tag_name`; versions remembered from training data are often outdated.

## Deployment workflow

The deployment workflow is what turns a push into a deployment, so it should do only what a deployment needs. It should reside at `.github/workflows/deploy-pages.yml` and have two jobs:

1. **A build job** that checks out the repository, installs the toolchain at the version the Implementation pins, restores the installed dependencies from a cache, builds the web Game build, and uploads its output directory as the GitHub Pages artifact. It should run no check. A failing step stops the workflow, so nothing is deployed.
2. **A deploy job** that depends on the build job and deploys the uploaded artifact to the `github-pages` environment.

The build job should cache the installed dependencies themselves, e.g. the `node_modules/` directory, under a key made of the pinned toolchain version and the lockfile, and should install them cleanly only when the cache has no entry for that key. A cache of downloaded packages alone, e.g. the `cache: npm` option of `actions/setup-node`, still leaves every run to unpack and link them, which takes most of the time of a clean install.

The workflow should run on every push to `main` and on manual dispatch, should grant only the `contents: read`, `pages: write`, and `id-token: write` permissions, and should let at most one deployment run at a time without cancelling one in progress.

E.g., the following workflow serves a Node implementation that pins its Node version in `.node-version` and builds into `dist/` with `npm run web:build`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version-file: .node-version
      - id: dependencies
        uses: actions/cache@v6
        with:
          path: node_modules
          key: node-modules-${{ runner.os }}-${{ hashFiles('.node-version', 'package-lock.json') }}
      - if: steps.dependencies.outputs.cache-hit != 'true'
        run: npm ci
      - run: npm run web:build
      - uses: actions/configure-pages@v6
      - uses: actions/upload-pages-artifact@v5
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v5
```

## Daily check workflow

The daily check workflow is the safety net under the deployment workflow: it runs the full check on a clean machine, so it catches what the implementer's machine hides and what a push made without the quick check let through. It should reside at `.github/workflows/daily-check.yml`, run once every 24 hours and on manual dispatch, and grant only the `contents: read` permission. It deploys nothing, and its failure leaves the deployed Game build as it is.

Its one job should check out the repository, install the toolchain at the version the Implementation pins, install dependencies cleanly, install whatever else the full check needs, e.g. the browser of the browser tests, and run the full check.

E.g., the following workflow serves a Node implementation whose full check is `npm run check:full` and whose browser tests use Playwright with Chromium:

```yaml
name: Daily full check

on:
  schedule:
    - cron: '17 3 * * *'
  workflow_dispatch:

permissions:
  contents: read

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version-file: .node-version
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run check:full
```

Before pushing the workflows, the implementer should run the full check and the build step locally from a clean install. A check that holds on the implementer's machine may fail on a clean checkout; e.g., a check that the Implementation directory is not a Git repository always fails in CI, because a checkout is a Git repository.

# Enabling GitHub Pages

GitHub Pages deploys from a workflow only after the repository is switched to that source. The implementer should switch it once, before the first push that contains the workflow, so that the first run can deploy:

```sh
gh api -X POST repos/<account>/<implementation-name>/pages -f build_type=workflow
```

When GitHub Pages is already enabled with another source, the same call with `-X PUT` switches it.

# Publishing changes

After the setup, publishing a change is pushing it: every commit pushed to `main` is built and deployed, and nothing checks it again until the next daily check. The implementer should therefore run the quick check before every push, under [Quick check and full check](#quick-check-and-full-check), commit and push each completed change to `main`, then confirm the deployment rather than assume it:

```sh
gh run watch <run-id> --exit-status
curl -s https://<account>.github.io/<implementation-name>/
```

The implementer should report the GitHub Pages address, the commit link, and the run's result to the Engine designer. When the run fails, the implementer should report the failing step and its output; the previously deployed Game build stays online until a later run passes.

Before starting a change, the implementer should confirm that the latest daily check passed, e.g. with `gh run list --workflow daily-check.yml --limit 1`. When it failed, the implementer should report the failing step and its output to the Engine designer and repair it before anything else, because the defect is already deployed.

# Edge cases and failure behavior

Most failures of this setup come from repository settings rather than from the Implementation. The implementer should treat each case below as follows; the list is exhaustive for the cases this guidance covers.

- **GitHub refuses to enable GitHub Pages.** A response of HTTP 422 saying that the current plan does not support GitHub Pages means the repository is private and the account's plan allows GitHub Pages only for public repositories. The implementer should ask the Engine designer whether to make the repository public, e.g. with `gh repo edit <account>/<implementation-name> --visibility public --accept-visibility-change-consequences`, and should never change the visibility without that answer.
- **A push is rejected right after a visibility change.** GitHub may answer `Your repository is disabled` with HTTP 403 for a short time after the visibility changes. The implementer should check with `gh api repos/<account>/<name>` that `disabled` is `false` and retry the push.
- **The first run fails in the deploy job.** The workflow was pushed before GitHub Pages was enabled. The implementer should enable GitHub Pages under [Enabling GitHub Pages](#enabling-github-pages) and rerun the workflow with `gh run rerun <run-id>`.
- **The daily check stops running.** GitHub disables the scheduled workflows of a public repository after 60 days without repository activity, e.g. without a commit. The implementer should turn the workflow back on with `gh workflow enable daily-check.yml` when work on the Implementation resumes.
- **The deployed page is blank.** The Game build refers to its own files by absolute paths; the implementer should make them relative under [Paths under GitHub Pages](#paths-under-github-pages).
