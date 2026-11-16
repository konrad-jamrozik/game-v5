# GitHub Pages Deployment

| Metadata    | Value                                                                                                                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Spec ID     | GHPAGES                                                                                                                                                                                    |
| Family      | Recipes                                                                                                                                                                                    |
| Audience    | Engine designer, Implementer                                                                                                                                                               |
| Owns        | Guidance on publishing an Implementation to a public GitHub repository that checks and deploys it to GitHub Pages.                                                                         |
| Conventions | [Specification conventions](../../governance/conventions/spec-conventions.md), [Implementation Specification Conventions](../../governance/conventions/implementation-spec-conventions.md) |

# Overview

Once an Implementation is worth showing, the Engine designer may want anyone to be able to play it from a link, and to
see every later change played the same way without asking the implementer to publish it again. GitHub Pages serves a
public repository's static files from a stable address, and GitHub Actions can rebuild those files on every push.

So publishing is one pipeline that starts at a push: each push to the default branch of the public repository runs the
Implementation's own checks, and only a push whose checks pass replaces the Game build that players reach. A failed
check leaves the previous Game build online.

Implementation Placement forbids publishing an Implementation until the Engine designer decides where it is hosted;
this guidance describes one such destination, for the case in which the Engine designer has chosen it.

# Relationships

- Uses [Implementation Placement](../mandatory/implementation-placement.md)

# Deployment prerequisites

Publishing is outward-facing and hard to reverse, so the implementer should start it only when both of the following
hold. The list is exhaustive.

- **The Engine designer requested it.** The Engine designer has asked for the Implementation to be published to a
  public GitHub repository under the Engine designer's personal GitHub account. Until then the Implementation stays
  local, under [Creating the Implementation repo](../mandatory/implementation-placement.md#creating-the-implementation-repo).
  A request for a private repository, for an organization account, or for another host is a different request, and this
  guidance does not apply to it.
- **GitHub Pages can host the Implementation.** The Implementation's web Game build is a set of static files that a
  browser runs without a server of the Implementation's own; e.g., a single-page application built with Vite qualifies,
  while an Implementation that needs its own server process, a database server, or a desktop executable does not.

The implementer should also confirm, before changing anything, that the GitHub CLI `gh` is installed and that
`gh auth status` reports the Engine designer's account as active. When it reports another account or no login, the
implementer should ask the Engine designer to run `gh auth login` rather than ask for a token in chat.

# Local repository

The remote repository is created from the
[Implementation repo](../mandatory/implementation-placement.md#glossary). Before creating it, the implementer should
commit the whole Implementation on its `main` branch:

```sh
git add -A
git status   # confirm nothing that belongs in .gitignore is staged
git commit -m "Initial commit"
```

The Git ignore rules should exclude installed dependencies, build output, test results, and local Game storage, e.g.
`node_modules/`, `dist/`, and `test-results/` for a Node implementation. Generated source files that the
Implementation's checks or build step read should stay committed, because the CI workflow starts from a clean checkout.

# Public remote repository

The remote repository is named after the [Implementation name](../mandatory/implementation-placement.md#glossary), so that the
GitHub Pages address names the Implementation. The implementer should create it public, under the Engine designer's
account, with the local repository as its source, and push in the same command:

```sh
gh repo create <account>/<implementation-name> --public --source . --remote origin --push
```

E.g., for the account `konrad-jamrozik` and the Implementation repo `game-v5-impl-web/`, the repository is
`konrad-jamrozik/game-v5-impl-web` and the Game build is served at
`https://konrad-jamrozik.github.io/game-v5-impl-web/`.

When the repository already exists, the implementer should add it with `git remote add origin <url>` and push with
`git push -u origin main` instead. When the name is taken by an unrelated repository, the implementer should ask the
Engine designer for another name rather than choose one.

# Paths under GitHub Pages

A GitHub Pages site of a project repository is served under the path `/<repository-name>/`, not at the root of its
domain, so a Game build that refers to its own files by absolute paths loads a blank page there. The implementer
should make every URL the Game build uses for its own files relative, or prefixed with the repository path; e.g., with
Vite, setting `base: './'` in `vite.config.ts` makes every emitted asset URL relative, and the Game build then also runs
from any other path.

A Game build that changes the browser's path while it runs, e.g. one that uses history-based client-side routing,
should use hash-based routing instead, because GitHub Pages answers a request for any path that is not a file with a
404 page.

# Continuous integration workflow

The CI workflow is what turns a push into a deployment: it repeats the Implementation's checks on a clean machine and
deploys only their result. It should reside in the Implementation repo, at `.github/workflows/deploy-pages.yml`,
like every other file needed to build the Implementation under
[Implementation repo](../mandatory/implementation-placement.md#implementation-repo).

The workflow should have two jobs:

1. **A build job** that checks out the repository, installs the toolchain at the version the Implementation pins,
   installs dependencies cleanly, runs the same full check the implementer runs before declaring a change complete,
   builds the web Game build, and uploads its output directory as the GitHub Pages artifact. A failing step stops the
   workflow, so nothing is deployed.
2. **A deploy job** that depends on the build job and deploys the uploaded artifact to the `github-pages` environment.

The workflow should run on every push to `main` and on manual dispatch, should grant only the `contents: read`,
`pages: write`, and `id-token: write` permissions, and should let at most one deployment run at a time without
cancelling one in progress. Each action should be pinned to its latest major version, which the implementer looks up
when writing the workflow, e.g. with `gh api repos/actions/checkout/releases/latest --jq .tag_name`; versions
remembered from training data are often outdated.

E.g., the following workflow serves a Node implementation that pins its Node version in `.node-version`, runs its
checks with `npm run check`, and builds into `dist/` with `npm run web:build`:

```yaml
name: Check and deploy to GitHub Pages

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
          cache: npm
      - run: npm ci
      - run: npm run check
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

Before pushing the workflow, the implementer should run the same check and build steps locally from a clean install.
A check that holds on the implementer's machine may fail on a clean checkout; e.g., a check that the Implementation
directory is not a Git repository always fails in CI, because a checkout is a Git repository.

# Enabling GitHub Pages

GitHub Pages deploys from a workflow only after the repository is switched to that source. The implementer should
switch it once, before the first push that contains the workflow, so that the first run can deploy:

```sh
gh api -X POST repos/<account>/<implementation-name>/pages -f build_type=workflow
```

When GitHub Pages is already enabled with another source, the same call with `-X PUT` switches it.

# Publishing changes

After the setup, publishing a change is pushing it: every commit pushed to `main` is checked and, when its checks pass,
deployed. The implementer should commit and push each completed change to `main`, then confirm the deployment rather
than assume it:

```sh
gh run watch <run-id> --exit-status
curl -s https://<account>.github.io/<implementation-name>/
```

The implementer should report the GitHub Pages address, the commit link, and the run's result to the Engine designer.
When the run fails, the implementer should report the failing step and its output; the previously deployed Game build
stays online until a later run passes.

# Edge cases and failure behavior

Most failures of this setup come from repository settings rather than from the Implementation. The implementer should
treat each case below as follows; the list is exhaustive for the cases this guidance covers.

- **GitHub refuses to enable GitHub Pages.** A response of HTTP 422 saying that the current plan does not support
  GitHub Pages means the repository is private and the account's plan allows GitHub Pages only for public repositories.
  The implementer should ask the Engine designer whether to make the repository public, e.g. with
  `gh repo edit <account>/<implementation-name> --visibility public --accept-visibility-change-consequences`, and
  should never change the visibility without that answer.
- **A push is rejected right after a visibility change.** GitHub may answer `Your repository is disabled` with HTTP 403
  for a short time after the visibility changes. The implementer should check with `gh api repos/<account>/<name>` that
  `disabled` is `false` and retry the push.
- **The first run fails in the deploy job.** The workflow was pushed before GitHub Pages was enabled. The implementer
  should enable GitHub Pages under [Enabling GitHub Pages](#enabling-github-pages) and rerun the workflow with
  `gh run rerun <run-id>`.
- **The deployed page is blank.** The Game build refers to its own files by absolute paths; the implementer should make
  them relative under [Paths under GitHub Pages](#paths-under-github-pages).
