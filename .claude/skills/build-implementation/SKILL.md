---
name: build-implementation
description: Build a new Implementation of the game from the specifications, keeping from the start the Specification baseline, Specification map, and feedback files that let later changes to the specifications be applied without rebuilding it.
---

# Build a new Implementation

Use this skill when the user asks for a new Implementation of the game, e.g. "implement the game" or "build a web
implementation". To bring an existing Implementation up to date, use the `update-implementation` skill instead.

Building an Implementation is long and usually spread across subagents, and the tracking and feedback files that make it cheap to update
later are the part most easily dropped along the way. This skill keeps them in place from the first step to the last.
The rules belong to the Mandatory Implementation specifications, which every Implementation must follow under the
repository's `AGENTS.md`; this skill only orders the work around them. When this skill and a specification disagree,
the specification wins.

## Before reading the specifications

1. Refuse to start unless the main local clone of the Spec repo is on `main`, has no uncommitted or untracked
   files, and is at the same commit as `origin/main`. Run `git fetch origin`, then check `git branch --show-current`,
   `git status --porcelain`, and `git rev-parse HEAD origin/main` there. When any check fails, tell the user exactly
   which and stop; never pull, stash, commit, or reset to make it pass.
2. Record `git rev-parse HEAD` now, before any subagent reads the specifications. That commit is the Specification
   baseline, under [Specification baseline](../../../docs/specs/implementation/mandatory/specification-tracking.md#specification-baseline),
   even when the specifications receive new commits during the build.
3. Read every specification in `docs/specs/implementation/mandatory/`, and follow
   [Implementation Placement](../../../docs/specs/implementation/mandatory/implementation-placement.md) to choose the
   Implementation name and create the Implementation repo.
4. In the new Implementation repo, write `tracking/specification-baseline.md` with the recorded commit, and the empty record
   files that [Implementation Feedback](../../../docs/specs/implementation/mandatory/implementation-feedback.md) and
   [Specification Tracking](../../../docs/specs/implementation/mandatory/specification-tracking.md) require, before any code.

## During the build

- **One owner for the tracking and feedback files.** Keep `tracking/` and `feedback/` written by the orchestrating agent only. Parallel subagents editing
  one Markdown file collide, and a subagent that was not told about them forgets them.
- **Every subagent brief asks for tracking and feedback input.** Each brief names the specifications the subagent implements and asks
  it to return, with its work:
  - the files it added, moved, or deleted, each with the Spec IDs it implements;
  - every Specification problem it met, with the affected specification, section, and quoted wording;
  - every Implementation decision it made, with the options considered and why it chose one.
- **Record in the same change.** After each subagent returns, update the Specification map and the feedback files
  before committing its work, so that no commit holds code that the Specification map does not list.
- **Leave the Specification baseline where it is.** Subagents read the specifications as they are on disk, so a commit
  made to them during the build may be partly followed. The Specification baseline still stays at the recorded
  commit: the first run of the `update-implementation` skill rechecks every later commit and finds what is already
  done.

## Before finishing

Check each of the following against the files, not from memory, and fix whatever fails:

1. `tracking/specification-baseline.md` names the commit recorded before reading the specifications.
2. `tracking/specification-map.md` has one section for each Spec ID registered at that commit, and no other. List
   those Spec IDs with `git grep -h "^| Spec ID" <baseline> -- docs/specs` in the Spec repo.
3. Every path listed in the Specification map exists in the Implementation repo, and every file of the
   Implementation that implements a specification, including its tests, is listed.
4. Every Specification problem states a Resolution and links its Implementation decisions, and every Guidance
   or Recipes specification has a Treatment of guidance Implementation decision, under Implementation
   Records.
5. The Implementation's own checks pass, run from its Implementation repo.

Commit the result in the Implementation repo. Never add a Git remote or push from it, under Implementation
Placement.

## Report

Tell the user the Implementation repo, the Specification baseline, the result of each check above, the number of
Open Specification problems, and whether the specifications received commits after the Specification baseline. Suggest
the `absorb-implementation-feedback` skill for the Open Specification problems and the `update-implementation` skill
for those later commits.
