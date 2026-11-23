# GitHub Pages Deployment

| Metadata | Value |
| --- | --- |
| Spec ID | GHPAGES |
| Family | Recipes |
| Audience | Engine designer, Implementer |
| Owns | Guidance on publishing an Implementation to a public GitHub repository that deploys every push to GitHub Pages and checks the Implementation once a day. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Implementation Specification Conventions](../../governance/conventions/implementation-spec-conventions.md) |

# Overview

The Engine designer wants anyone to be able to play the Implementation from a link, and to see every later change played the same way without asking the implementer to publish it again. GitHub Pages serves a public repository's static files from a stable address, and GitHub Actions rebuilds those files on every push.

So publishing is a pipeline that starts at a push: each push to `main` of the [Implementation repo](../mandatory/implementation-placement.md#glossary) builds the [Game build](../../design/foundation/core-concepts.md#game-build-and-content) and replaces the one that players reach. The pipeline repeats no check, because the implementer ran the Implementation's checks before pushing and a second run only delays the deployment. A second pipeline instead runs every check once a day, so that a defect that slipped past the implementer still surfaces within a day. A push whose build fails leaves the previous Game build online.

# Paths under GitHub Pages

A GitHub Pages site of a project repository is served under the path `/<repository-name>/`, not at the root of its domain, so every URL the [Game build](../../design/foundation/core-concepts.md#game-build-and-content) uses for its own files is suggested to stay relative. A Game build that changes the browser's path while it runs should use hash-based routing rather than history-based routing, because GitHub Pages answers a request for any path that is not a file with a 404 page.

# Quick check and full check

The Implementation's checks run in two places with opposite costs: the implementer waits for them on every change, while a scheduled run makes nobody wait. So the quick check, which the implementer runs before declaring a change complete and before every push, should hold every check that is fast and finish in well under a minute, and the full check adds everything too slow to wait for on every change, e.g. the browser tests.

No test should be dropped from the quick check only because its largest useful run is slow. A test that has a size, e.g. a number of generated cases, should run small in the quick check and large in the full check, and read its size from one setting. Before pushing a change, the implementer should also run the part of the full check that the change concerns, e.g. the browser tests for a change to the Graphical User Interface.

# Continuous integration workflows

Two CI workflows divide the work: the deployment workflow deploys each push and checks nothing, and the daily check workflow runs the full check on a clean machine once a day and deploys nothing. The deployment workflow caches the installed dependencies themselves rather than the downloaded packages, because unpacking and linking packages takes most of the time of a clean install.

When a workflow is changed, each action should be pinned to its latest major version, which the implementer looks up, e.g. with `gh api repos/actions/checkout/releases/latest --jq .tag_name`; versions remembered from training data are often outdated. A check that holds on the implementer's machine may fail on a clean checkout, so the full check and the build step should first be run locally from a clean install.

# Publishing changes

Publishing a change is pushing it: every commit pushed to `main` is built and deployed, and nothing checks it again until the next daily check. The implementer should therefore run the quick check before every push, then confirm the deployment rather than assume it:

```sh
gh run watch <run-id> --exit-status
curl -s https://<account>.github.io/<implementation-name>/
```

The implementer should report the GitHub Pages address, the commit link, and the run's result to the Engine designer. When the run fails, the implementer should report the failing step and its output; the previously deployed Game build stays online until a later run passes.

Before starting a change, the implementer should confirm that the latest daily check passed, e.g. with `gh run list --workflow daily-check.yml --limit 1`. When it failed, the implementer should report the failing step and its output to the Engine designer and repair it before anything else, because the defect is already deployed. GitHub disables the scheduled workflows of a public repository after 60 days without repository activity; when work resumes after such a pause, the implementer should turn the daily check back on with `gh workflow enable daily-check.yml`.
