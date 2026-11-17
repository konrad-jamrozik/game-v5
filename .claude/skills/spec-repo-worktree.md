# Spec repo changes in a worktree

The `absorb-implementation-feedback` and `apply-designer-feedback` skills make every change to the Spec repo in a Git
worktree of their own, so that other work in the main local clone, e.g. another agent's uncommitted edits, neither
blocks them nor leaks into their change. Both skills link to the steps below by number; this file is not a skill of its
own. For those skills, it replaces the standing authorization to commit and push under Committing and publishing
changes in `AGENTS.md`: the skill decides, commits, and pushes on its own, and escalates to the user only as step 3 and
step 4 direct. A skill never runs the `update-implementation` skill unless the user explicitly asks for it; it ends by
telling the user that `update-implementation` is the next step. The Spec repo and Implementation repo are defined in the Glossary of
[Implementation Placement](../../docs/specs/implementation/mandatory/implementation-placement.md#glossary); the main local
clone is the Spec repo's root directory, e.g. `repos/game-v5/`.

The steps differ by host. In T3 Code, recognized by its tools being available, e.g. `t3_worktree_status`, the worktree
must be created through T3 Code so that the thread is attached to it and T3 Code shows its branch and path; a worktree
created any other way, e.g. with `EnterWorktree`, is invisible to T3 Code. In any other host, use `EnterWorktree` and
`ExitWorktree`.

Name every worktree `<id>-<skill-name>-<yyyymmdd-hhmm>`, where `<id>` is 4 random lowercase hexadecimal characters
generated fresh for it, e.g. `a3f9-apply-designer-feedback-20261115-2230`, so that worktrees from the same skill stay
distinguishable even where a host truncates their names. Generate `<id>` with
`node -e "console.log(require('crypto').randomBytes(2).toString('hex'))"`; never make it up.

1. **Create the worktree** at the start of the skill, before reading any specification. When the session is already in
   a worktree, e.g. `t3_worktree_status` reports `attached: true`, ask the user how to proceed instead.
   - **T3 Code:** call `t3_worktree_handoff` with the worktree name as `branch`, `baseRef: "main"`, and
     `startFromOrigin: true`, as the last call of the turn. It creates the worktree in the location set in T3 Code's
     settings, attaches the thread to it, and ends the live session. Its `continuationPrompt` names the skill, restates
     the user's request in full, and says that step 1 of Spec repo changes in a worktree is done up to the checks
     below, so the session resumes in the worktree with them.
   - **Any other host:** call `EnterWorktree` with the worktree name. It creates the worktree under
     `.claude/worktrees/` on a new local branch and moves the session into it.

   Then, in the worktree, run `git fetch origin` and confirm that `HEAD` equals `origin/main`; a new worktree with no
   changes may be reset to `origin/main` when it does not. Then run `npm ci` and `npm run hooks:install` in it. Read
   and edit specifications only in the worktree.

2. **Find the Implementation repo from the main local clone**, never from the worktree: the main local clone is the
   parent directory of `git rev-parse --path-format=absolute --git-common-dir`, and Implementation repos are its
   siblings.
3. **Self-review, and escalate only far-reaching changes.** Make the changes in the worktree, run
   `npm run docs:generate` and `npm run check`, then run `git add -N .` so that new files appear in the diff, and
   review the whole diff yourself. On the happy path, continue to step 4 without waiting for the user: the user reviews
   the decisions afterwards, from the report. Record every decision you made on the user's behalf as you go, each with
   the option chosen, the alternatives, and why, for that report.

   Stop before committing and escalate only when the change is far-reaching enough that publishing it unreviewed would
   be destructive or force massive rework, e.g. the diff is suspiciously large for the feedback, it rewrites large
   parts of several specifications, it reverses an established design decision, or it changes a fundamental
   assumption of the game or of the Development loop; or when the user asked to review the diff before it is
   committed. To escalate:
   - **Plan:** publish the plan as a private Artifact. For each specification file that changed, it names the file and
     its Spec ID, the affected sections, the change from current to proposed wording, or a precise description when
     the change is large, why the change is made, and its knock-on effects, e.g. Glossary rows, term links, derived
     views, and Implementation feedback entries. It also lists what did not change, e.g. declined problems, and why
     the change was escalated.
   - **Local diff:** in the same turn, show the user the worktree's absolute path, `git diff --stat`, and the full diff
     of the hand-written files with regenerated files only summarized.

   Then wait for the user's approval. After each requested change, edit the worktree, run the checks again, republish
   the same Artifact, and show the diff again.

4. **Commit and push** to `main` with `git push origin HEAD:main`. The worktree's local branch is never pushed, so the
   rule against feature branches does not apply to it. When the push is rejected, run `git fetch origin` and
   `git rebase origin/main`:
   - On a conflict, resolve it yourself when a natural resolution exists, i.e. one that keeps the intent of both sides
     without contradicting either, e.g. both sides added rows to one table, or one side reworded a sentence the other
     moved. Otherwise run `git rebase --abort` and escalate: tell the user each conflicting file and hunk, the incoming
     commits by hash and subject, both sides, and a suggested resolution, and resolve it only after the user approves.
   - When the rebase succeeds but an incoming commit changed a file this change also changes, read those incoming
     changes, because a textually clean rebase can still combine contradicting rules. Fix a contradiction the same way
     as a conflict: yourself when the fix is natural, otherwise escalate before pushing.
   - Then run `npm run check` again, push, and tell the user which commits the change was rebased onto and how each
     conflict or contradiction was resolved.

   After pushing, give the user the commit diff link, as under
   [Committing and publishing changes](../../AGENTS.md#committing-and-publishing-changes) in `AGENTS.md`.

5. **Release the worktree** once the push succeeded: run `git fetch origin` and confirm with
   `git merge-base --is-ancestor HEAD origin/main` that `origin/main` holds the pushed commits.
   - **T3 Code:** leave the worktree in place, because the thread's session runs inside it, and tell the user its
     absolute path; T3 Code removes it with the thread, as set up in Agent environment setup in `README.md`.
   - **Any other host:** only then call `ExitWorktree` with `action: "remove"` and `discard_changes: true`. The flag is
     needed because `ExitWorktree` compares against the main local clone's `main`, which does not hold the pushed
     commits yet. When the user abandons the change, or approval is still pending at the end of the session, use
     `action: "keep"` and give the user the worktree's absolute path.
6. **Update the main local clone** with `git fetch origin` and `git merge --ff-only origin/main` run in it, from it in
   any other host and through `git -C <main local clone>` in T3 Code, and tell the user whether it succeeded. Do not
   use `git pull`: with `pull.rebase` set, it refuses whenever the main local clone has any uncommitted change. When
   the merge fails, e.g. because uncommitted changes there would be overwritten, the main local clone is not on
   `main`, or its `main` has commits missing from `origin/main`, tell the user why and leave the main local clone as it
   is: never stash, merge otherwise, or reset it.

Until step 5, make Git changes only in the worktree; make every Git change in the main local clone or an
Implementation repo, e.g. a commit in an Implementation repo, only after step 5. Outside T3 Code, while the session is
in the worktree, the harness also refuses Git commands aimed at the main local clone, e.g. through `git -C`, and may
refuse those aimed at an Implementation repo.
