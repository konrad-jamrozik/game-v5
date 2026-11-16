# Repository agent instructions

Before running an npm script, verify that `node` and `npm` are available with `Get-Command` on Windows or `command -v`
on POSIX systems. Do not discover a missing package manager by attempting the script. Follow the Agent environment setup
in `README.md` when the toolchain is unavailable.

As of 2026-11-14, the environment for this repository is:

- Node is managed with nvm.
- Node version 26.13.1.

Choose verification commands as described in the [Verification](README.md#verification) section of `README.md`. Before
declaring repository changes complete, run `npm run check` and report any failures.

## Implementing the game

When implementing the game, follow every specification in `docs/specs/implementation/mandatory/`, e.g. [Implementation Placement](docs/specs/implementation/mandatory/implementation-placement.md) and
[Implementation Feedback](docs/specs/implementation/mandatory/implementation-feedback.md). They apply whatever the task says about
platform, language, or engine, e.g. equally to a browser implementation and to a dedicated game-engine mplementation, and no other instruction waives them.

## Marking examples

In every document and in chat, introduce every example with "e.g.", as defined in
[Marking examples](docs/specs/governance/conventions/spec-conventions.md#marking-examples). Never state an example as a bare
sentence after a general statement; the reader must not have to infer whether a sentence is general or illustrative.

## Linking to documents in chat

When pointing the user at a repository document or section, use a Markdown link whose target is the file's absolute local
path followed by a heading anchor, e.g. `[Campaign and Session](/abs/path/to/repo/docs/specs/foundation/core-concepts.md#campaign-and-session)`.
Build the absolute path from the current working directory (the repository root), not from a remembered location.
The Claude desktop app opens such links in its local Markdown preview pane at that anchor. Do not use relative paths,
repository-root paths with a leading slash, plain `path:line` text, or GitHub URLs; these were tried and do not give
the user a working anchored preview link. Anchors are the lowercase, hyphenated heading text; verify the heading exists
with `grep -n` first.

## Committing and publishing changes

This section is standing authorization: once repository changes are complete and `npm run check` passes, commit and
push them without asking the user for confirmation first. Commit and push directly to `main`; do not use feature or
session branches unless the user asks.
After pushing, give the user a link to the commit's diff view so they can see exactly what was committed, in the form
`https://github.com/konrad-jamrozik/game-v5/commit/<full-sha>`.

Exceptions: do not commit or push, and leave the whole change set uncommitted in the working tree so the user can
review the local diff first, when either:

- the user explicitly asks to review the local diff before it is committed; or
- the change set is so expansive that you judge the user should look at it before it is published, e.g. it rewrites
  large parts of several specifications or reverses an established design decision.

In either case, tell the user the change set is uncommitted and why.

The `absorb-implementation-feedback` and `apply-designer-feedback` skills never use this standing authorization. They
change the Spec repo only as [Spec repo changes in a worktree](#spec-repo-changes-in-a-worktree) directs.

## Spec repo changes in a worktree

The `absorb-implementation-feedback` and `apply-designer-feedback` skills make every change to the Spec repo in a Git
worktree of their own, so that other work in the main local clone, e.g. another agent's uncommitted edits, neither
blocks them nor leaks into their change. The Spec repo and Implementation repo are defined in the Glossary of
[Implementation Placement](docs/specs/implementation/mandatory/implementation-placement.md#glossary); the main local
clone is the Spec repo's root directory, e.g. `repos/game-v5/`.

1. **Create the worktree** at the start of the skill, before reading any specification: call the `EnterWorktree` tool
   with a name of the form `<skill-name>-<yyyymmdd-hhmm>`. It creates the worktree under `.claude/worktrees/` on a new
   local branch and moves the session into it. Run `git fetch origin` and confirm that `HEAD` equals `origin/main`; a
   new worktree with no changes may be reset to `origin/main` when it does not. Then run `npm ci` and
   `npm run hooks:install` in it. Read and edit specifications only in the worktree. When the session is already in a
   worktree, ask the user how to proceed instead.
2. **Find the Implementation repo from the main local clone**, never from the worktree: the main local clone is the
   parent directory of `git rev-parse --path-format=absolute --git-common-dir`, and Implementation repos are its
   siblings.
3. **Gate 1: plan.** After every follow-up question is answered and every outcome is decided, and before editing any
   file, publish the plan as a private Artifact. For each specification file that will change, it names the file and
   its Spec ID, the affected sections, the change from current to proposed wording, or a precise description when the
   change is large, why the change is made, and its knock-on effects, e.g. Glossary rows, Relationships sections,
   derived views, and Implementation feedback entries. It also lists what will not change, e.g. declined problems.
   Stop and wait for the user to approve it; republish the same Artifact after each requested change.
4. **Gate 2: local diff.** Make the approved changes in the worktree, run `npm run docs:generate` and
   `npm run check`, then run `git add -N .` so that new files appear in the diff. Show the user the worktree's absolute
   path, `git diff --stat`, the full diff of the hand-written files with regenerated files only summarized, and every
   departure from the approved plan. Stop and wait for the user to approve it; show the diff again after each requested
   change.
5. **Commit and push** to `main` with `git push origin HEAD:main`. The worktree's local branch is never pushed, so the
   rule against feature branches does not apply to it. When the push is rejected, run `git fetch origin` and
   `git rebase origin/main`:
   - On a conflict, run `git rebase --abort` and never resolve it on your own. Tell the user each conflicting file and
     hunk, the incoming commits by hash and subject, both sides, and a suggested resolution, and resolve it only after
     the user approves.
   - When the rebase succeeds but an incoming commit changed a file this change also changes, stop and show the user
     those commits before pushing, because a textually clean rebase can still combine contradicting rules.
   - Otherwise run `npm run check` again, push, and tell the user which commits the change was rebased onto.

   After pushing, give the user the commit diff link, as under
   [Committing and publishing changes](#committing-and-publishing-changes).

6. **Remove the worktree** once the push succeeded: run `git fetch origin`, confirm with
   `git merge-base --is-ancestor HEAD origin/main` that `origin/main` holds the pushed commits, and only then call
   `ExitWorktree` with `action: "remove"` and `discard_changes: true`. The flag is needed because `ExitWorktree`
   compares against the main local clone's `main`, which does not hold the pushed commits yet. When the user abandons
   the change, or approval is still pending at the end of the session, use `action: "keep"` and give the user the
   worktree's absolute path.
7. **Update the main local clone**, from it, with `git fetch origin` and `git merge --ff-only origin/main`, and tell
   the user whether it succeeded. Do not use `git pull`: with `pull.rebase` set, it refuses whenever the main local
   clone has any uncommitted change. When the merge fails, e.g. because uncommitted changes there would be
   overwritten, the main local clone is not on `main`, or its `main` has commits missing from `origin/main`, tell the
   user why and leave the main local clone as it is: never stash, merge otherwise, or reset it.

While the session is in the worktree, run Git only in the worktree: the harness refuses Git commands aimed at the main
local clone, e.g. through `git -C`, and may refuse those aimed at an Implementation repo. Make every Git change in those repositories, e.g. a
commit in an Implementation repo, only after the worktree is removed in step 6.
