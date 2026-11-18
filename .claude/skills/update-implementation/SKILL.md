---
name: update-implementation
description: Bring an existing Implementation up to date with the latest committed specifications by applying only what changed since its Specification baseline, instead of rebuilding it.
---

# Update an Implementation

Use this skill when the user asks to bring an Implementation in line with changed specifications, e.g. "snap the
implementation to the latest spec" or "apply the spec changes to game-v5-impl-web".

The procedure is owned by two specifications. Read them, and nothing else of the specifications, before starting:

- [Specification Tracking](../../../docs/specs/implementation/mandatory/specification-tracking.md) (Mandatory): the
  Specification baseline and Specification map every Implementation keeps.
- [Specification Updates](../../../docs/specs/implementation/recipes/specification-updates.md) (Guidance): how to apply the
  difference since the Specification baseline.

Do not copy or restate their rules here; when this skill and those specifications disagree, the specifications win.

## Workflow

1. Refuse to start unless the main local clone of the Spec repo is on `main`, has no uncommitted or untracked
   files, and is at the same commit as `origin/main`. Run `git fetch origin`, then check `git branch --show-current`,
   `git status --porcelain`, and `git rev-parse HEAD origin/main` there. When any check fails, tell the user exactly
   which and stop; never pull, stash, commit, or reset to make it pass.
2. Identify the Implementation repo: the sibling of the Spec repo that the user names, or the only one whose name
   starts with `game-v5-impl-`. Ask the user when several match.
   - Refuse to start when another session may be changing the Implementation repo: it must be on `main` and have no
     uncommitted or untracked files. Uncommitted changes there are another session's work in progress; tell the user
     and stop, and never stash, commit, or discard them.
   - When the Implementation repo has a remote, run `git fetch` there and fast-forward `main` to its remote branch
     before reading anything, so that the update starts from every commit another session has already pushed.
3. Take the target Specification revision as the Spec repo's latest commit, unless the user names another.
4. Read `tracking/specification-baseline.md` in the Implementation repo.
   - If it is missing, the Implementation has never been tracked. Tell the user that adopting a Specification baseline
     needs one pass over the Implementation to write the Specification map, and do it only after the user agrees,
     under Edge cases and failure behavior of Specification Tracking.
   - If it equals the target, report that the Implementation is up to date and stop.
5. List the changed paths with
   `git diff --name-status --find-renames <baseline>..<target> -- docs/specs content assets LICENSE` in the Spec repo.
   When no path is under `docs/specs` and none is `LICENSE`, the difference is content-only: take the
   [Content-only update](#content-only-update) below instead of steps 6 and 7, then continue at step 8.
6. Follow Specification Updates: compute the difference, sort it into editorial and normative changes, reach the
   affected files through the Specification map, and complete the update in one change to the Implementation.
   - Read only the changed passages, the Specification map sections they lead to, and the files those sections list.
     Read an unchanged specification only to resolve a change's meaning, e.g. a term a changed rule now uses.
   - For a difference that touches several unrelated specifications, consider one subagent for each changed
     specification, each given only its part of the difference and its Specification map section.
7. Run the Implementation's own checks from its Implementation repo, never the Spec repo's scripts.
8. Commit the change in the Implementation repo. Never add a Git remote there. Push only when the Implementation
   already has a remote and its own publishing setup expects pushes, e.g. after
   [GitHub Pages Deployment](../../../docs/specs/implementation/recipes/github-pages-deployment.md).
   - Before pushing, run `git fetch` and rebase onto the remote branch, then rerun the Implementation's checks when the
     rebase brought in new commits. When the rebase conflicts, or another session moved the Specification baseline,
     abort the rebase, tell the user, and stop; never force-push.

## Content-only update

A content-only difference changes only GDR files under `content/` and asset files under `assets/`, which the
Implementation holds as copies under Implementation Placement. No rule changed, so the engine needs no change: the
update refreshes the copies, runs the checks, and moves the Specification baseline. Read no specification and no
Specification map section for it, and start no subagents.

1. Refresh the copies from the difference, never from a fresh copy of whole directories, so that a deliberate
   deviation of a copy survives, e.g. a GDR file whose values follow an Implementation decision.
   - GDR files: write `git diff --binary --find-renames <baseline>..<target> -- content` from the Spec repo to a patch
     file in the scratchpad, and run `git apply --3way <patch>` in the Implementation repo when its copy sits at the
     same paths, e.g. `content/` in `game-v5-impl-web`; otherwise apply each changed file's hunks to the copy by hand.
     A hunk that does not apply touches a file the Implementation changed on purpose: resolve it by hand as the
     Implementation decision that file's copy follows requires, and record it there.
   - Asset files: copy each added or changed asset to the Implementation's copy unchanged, and delete the copy of each
     deleted one, under the Implementation Placement section for its kind, e.g. Music in an Implementation.
   - Asset READMEs and track records: the Implementation copies no README and no `.yaml` track record in
     `assets/music/yaml/`, so changes to them need nothing; the Track files are those in `assets/music/tracks/`. Which music files are excluded comes from the GDR `music`, so
     a change to it arrives with the GDR files above.
   - Update the record of where the copies came from, e.g. the commit in `content/SOURCE.md`.
2. Run the Implementation's `fix` script when it has one, then its checks. A test that pins a value the content
   changed, e.g. an expected Track list or GDR value, is updated to the new value.
3. Treat any other failure, e.g. GDR validation rejecting a new value, or code relying on a GDR record that is gone,
   as a sign that the change is not content-only in effect: continue from step 6 of the Workflow with the same
   difference instead.
4. Set the Resolution of each Open Specification problem that names a changed GDR or asset file, when the change
   settles it, and add a Specification map entry only for a newly added copied file that the map lists file by file.
5. Set the Specification baseline to the target, and continue at step 8 of the Workflow, which commits and pushes;
   the push redeploys the Implementation when its publishing setup deploys on push.

## Report

Tell the user:

- the old and new Specification baseline;
- for a content-only update, each copied file added, changed, or deleted, and each test updated, instead of the
  normative and editorial changes;
- each normative change and the files it changed, and how many changes were editorial only;
- each Specification problem whose Resolution changed, and each new Specification problem or Implementation decision;
- the result of the Implementation's checks;
- whether Open Specification problems remain, and that the `absorb-implementation-feedback` skill turns them into
  specification changes.
