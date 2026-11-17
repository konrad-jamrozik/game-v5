# Spec repo changes in a worktree

The `absorb-implementation-feedback` and `apply-designer-feedback` skills change the Spec repo only in a Git worktree of
their own, so that other work in the main local clone, e.g. another agent's uncommitted edits, neither blocks nor leaks
into their change. Both link to the steps below by number; this file is not a skill. For them it replaces the standing
authorization in Committing and publishing changes in `AGENTS.md`: once the design is settled as the skill directs,
it commits and pushes on its own and escalates only as steps 3 and 4 direct. It never runs `update-implementation` unless the user explicitly asks; it
ends by naming it as the next step. The Spec repo and Implementation repo are defined in the Glossary of
[Implementation Placement](../../docs/specs/implementation/mandatory/implementation-placement.md#glossary); the main local
clone is the Spec repo's root directory, e.g. `repos/game-v5/`.

In T3 Code, recognized by its tools, e.g. `t3_worktree_status`, create the worktree only through T3 Code; one made
otherwise, e.g. with `EnterWorktree`, is invisible to it. In any other host, use `EnterWorktree` and `ExitWorktree`.

Name a worktree `<id>-<skill-name>-<yyyymmdd-hhmm>`, e.g. `a3f9-apply-designer-feedback-20261115-2230`, where `<id>`
comes from `node -e "console.log(require('crypto').randomBytes(2).toString('hex'))"`, never made up, so names stay
distinct where a host truncates them.

1. **Create the worktree** before reading any specification.
   - **Already in one**, e.g. `t3_worktree_status` reports `attached: true` after an earlier run in the thread: run
     `git fetch origin`. When `git status --porcelain` prints nothing and `git merge-base --is-ancestor HEAD origin/main`
     succeeds, reuse it, keeping its name: run `git merge --ff-only origin/main` and go to the checks below. Otherwise
     ask the user, naming its uncommitted files and unpushed commits.
   - **T3 Code:** as the last call of the turn, call `t3_worktree_handoff` with the name as `branch`,
     `baseRef: "main"`, and `startFromOrigin: true`. Its `continuationPrompt` names the skill, restates the user's
     request in full, and says step 1 is done up to the checks below.
   - **Any other host:** call `EnterWorktree` with the name.

   Then, in the worktree, run `git fetch origin` and confirm that `HEAD` equals `origin/main`, resetting a worktree
   with no changes to it when not. Run `npm ci` and `npm run hooks:install`. Read and edit specifications only there.

2. **Find the Implementation repo from the main local clone**, never from the worktree: its siblings are the
   Implementation repos, and it is the parent of `git rev-parse --path-format=absolute --git-common-dir`.
3. **Self-review.** Make the changes, publishing every changed Artboard to the Design canvas without asking, as
   Editing files and running commands in `AGENTS.md` directs, run `npm run docs:generate` and `npm run check`, run `git add -N .`, and review
   the whole diff yourself. Record every decision made on the user's behalf, with the option chosen, the alternatives,
   and why, for the report. Then go to step 4 without waiting.

   Escalate instead, before committing, only when the user asked to review the diff first, or when publishing
   unreviewed would be destructive or force massive rework, e.g. the diff is suspiciously large for the feedback, it
   rewrites large parts of several specifications, reverses an established design decision, or changes a fundamental
   assumption. To escalate, publish a private plan Artifact giving, for each changed specification, its file and Spec
   ID, the sections, current and proposed wording or a precise description, the reason, and knock-on effects, e.g.
   Glossary rows or Implementation feedback entries; plus what did not change and why you escalated. In the same turn
   show the worktree's absolute path, `git diff --stat`, and the hand-written diff in full, regenerated files only
   summarized. Wait for approval, and after each requested change rerun the checks, republish, and show the diff again.

4. **Commit and push** with `git push origin HEAD:main`; the local branch is never pushed. When rejected, run
   `git fetch origin` and `git rebase origin/main`. Resolve a conflict yourself when a natural resolution keeps both
   sides' intent, e.g. both sides added rows to one table; otherwise `git rebase --abort` and escalate with each
   conflicting hunk, the incoming commits, both sides, and a suggested resolution. A clean rebase can still combine
   contradicting rules, so read incoming commits that touch the same files and treat a contradiction like a conflict.
   Rerun `npm run check`, push, and report the commits rebased onto, how each conflict was resolved, and the commit
   diff link under [Committing and publishing changes](../../AGENTS.md#committing-and-publishing-changes).
5. **Release the worktree** after `git fetch origin` and `git merge-base --is-ancestor HEAD origin/main` confirm the
   push.
   - **T3 Code:** leave it in place, since the session runs in it, and give its absolute path; T3 Code removes it with
     the thread.
   - **Any other host:** `ExitWorktree` with `action: "remove"` and `discard_changes: true`, needed because it compares
     against the main local clone's stale `main`. When the change is abandoned or still awaits approval, use
     `action: "keep"` and give the worktree's absolute path.
6. **Update the main local clone** with `git fetch origin` and `git merge --ff-only origin/main`, through
   `git -C <main local clone>` in T3 Code, and report the outcome. Never use `git pull`, which refuses with uncommitted
   changes under `pull.rebase`. When the merge fails, e.g. on uncommitted changes, another branch, or local commits,
   say why and leave the clone as it is: never stash, merge otherwise, or reset.

Make Git changes only in the worktree until step 5, and in the main local clone or an Implementation repo only after
it. Outside T3 Code the harness refuses Git commands aimed at the main local clone while the session is in the worktree.
