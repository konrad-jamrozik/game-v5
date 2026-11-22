# Repository agent instructions

## Repository locations

- Spec repo (this repository): local clone at `~\repos\game-v5`; GitHub <https://github.com/konrad-jamrozik/game-v5>; GitHub Pages <https://konrad-jamrozik.github.io/game-v5/>.
- Current Implementation repo: local clone at `C:\Users\spawa\repos\game-v5-impl-web`; GitHub <https://github.com/konrad-jamrozik/game-v5-impl-web>; GitHub Pages <https://konrad-jamrozik.github.io/game-v5-impl-web/>.

Before running an npm script, verify that `node` and `npm` are available with `Get-Command` on Windows or `command -v` on POSIX systems. Do not discover a missing package manager by attempting the script. Follow the Agent environment setup in `README.md` when the toolchain is unavailable.

As of 2026-11-14, the environment for this repository is:

- Node is managed with nvm.
- Node version 26.13.1.

Choose verification commands as described in the [Verification](README.md#verification) section of `README.md`. Before declaring repository changes complete, run `npm run check` and report any failures.

## Editing files and running commands

These rules apply in this repository and in every Implementation repo:

- Never put multi-line text, or text with quotes or backticks, inside a shell command, e.g. a script passed with `python -c` or `node -e`, a heredoc, or a PowerShell here-string. The shell's quoting breaks it, e.g. with "unexpected EOF while looking for matching". Create or replace a file with the Write tool and change one with the Edit tool; when a change needs a script, e.g. one replacement repeated across many files, write the script to a file in the scratchpad first and run that file.
- Edit a file only against its current content. `npm run docs:link-terms`, `npm run docs:generate`, and the formatter rewrite files, e.g. they add links, join each paragraph onto one line, or re-pad the columns of a narrow table, so text copied before they ran no longer matches. Make all planned edits first, then run `npm run fix` once, review what it changed, e.g. the term links it added, and run `npm run check`. Read a section again before editing it after `npm run fix` ran. In an Implementation repo, use its own `fix` script when it has one, e.g. `npm run fix` in `game-v5-impl-web`.
- On Windows, Node's `execSync` and `exec` run a command string through `cmd.exe`, where `^` is the escape character and is silently dropped, e.g. `git checkout C^ -- tests` in a script checks out `C`'s own files instead of its parent's. In every command a script runs, write `C~1` instead of `C^`, or pass the arguments as an array to `execFileSync`.
- A temporary `git worktree` that shares a clone's `node_modules` through a junction or symbolic link must lose that link before the worktree is removed, e.g. with `cmd //c rmdir <worktree>\node_modules`, which removes only the link; `git worktree remove --force` follows the link and deletes the clone's real `node_modules`.
- To read or search a specification as prose rather than as link syntax, run `npm run docs:plain -- <file>`.
- To export Artboard images from the Design canvas, use `npm run artboards:export`, as [Design canvas](docs/specs/design/ui/visual-design.md#design-canvas) describes, never a one-off script.
- Redrawing Artboards is part of every specification change, never separate design work to defer. The Artboards and the specifications together are the source from which an Implementation's UI is regenerated, so whenever a change alters what a screen or panel shows or how it looks, redraw every Artboard that shows it, and draw a new Artboard for a new screen, panel, or dialog, in the same change. Never record a difference between an Artboard and the new text as an element that "appears only on the Artboard"; that list holds only what a picture cannot avoid, e.g. sample values, as [Reading Artboards](docs/specs/design/ui/visual-design.md#reading-artboards) states.
- Whenever an Artboard changes, publish the edited canvas artboard to the Design canvas with the Artifact tool, then export its image from the published version. Never ask the user before publishing it, and never commit an Artboard image whose canvas artboard was not published, because the next export from the canvas would undo the change.
- Never use `git stash` to set work aside or to compare with an earlier commit; check the earlier commit out in a temporary `git worktree` instead.

## Implementing the game

When implementing the game, follow every specification in `docs/specs/implementation/mandatory/`, e.g. [Implementation Placement](docs/specs/implementation/mandatory/implementation-placement.md) and [Implementation Feedback](docs/specs/implementation/mandatory/implementation-feedback.md). They apply whatever the task says about platform, language, or engine, e.g. equally to a browser implementation and to a dedicated game-engine implementation, and no other instruction waives them.

To build a new Implementation, use the `build-implementation` skill; to bring an existing one up to date with the specifications, use the `update-implementation` skill.

## Marking examples

In every document and in chat, introduce every example with "e.g.", as defined in [Marking examples](docs/specs/governance/conventions/spec-conventions.md#marking-examples). Never state an example as a bare sentence after a general statement; the reader must not have to infer whether a sentence is general or illustrative.

## Reply markers

In chat replies, mark these lines with an emoji at the start of the line or bullet, never mid-sentence. The markers are for chat only and never appear in committed files.

- ❓ A question to the user.
- ⌛ The one question or decision without which the work cannot continue. Use it at most once per reply, as the last line, and instead of ❓.
- ✅ A confirmation that a piece of work is complete, e.g. "✅ `npm run check` passes".
- 🚀 A push to the Spec repo or an Implementation repo, on the line that gives the commit link.
- 🔧 A fix that was not part of the plan, e.g. a resolved rebase conflict, a repaired failing check, or a reverted edit.
- 🚧 Work left for later, e.g. Open Specification problems or a deferred feature.
- 👟 The next step, every time it is mentioned, e.g. "👟 Next, run the `update-implementation` skill".
- 🔍 The heading of the decisions for the user to review, once for the whole section rather than on each decision, e.g. "🔍 Decisions to review".

## Linking to documents in chat

When pointing the user at a repository document or section, use a Markdown link whose target is the file's absolute local path followed by a heading anchor, e.g. `[Campaign and Session](/abs/path/to/repo/docs/specs/foundation/core-concepts.md#campaign-and-session)`. Build the absolute path from the current working directory (the repository root), not from a remembered location. The Claude desktop app opens such links in its local Markdown preview pane at that anchor. Do not use relative paths, repository-root paths with a leading slash, plain `path:line` text, or GitHub URLs; these were tried and do not give the user a working anchored preview link. Anchors are the lowercase, hyphenated heading text; verify the heading exists with `grep -n` first.

## Committing and publishing changes

This section is standing authorization: once repository changes are complete and `npm run check` passes, commit and push them without asking the user for confirmation first. Commit and push directly to `main`; do not use feature or session branches unless the user asks. After pushing, give the user a link to the commit's diff view so they can see exactly what was committed, in the form `https://github.com/konrad-jamrozik/game-v5/commit/<full-sha>`.

Exceptions: do not commit or push, and leave the whole change set uncommitted in the working tree so the user can review the local diff first, when either:

- the user explicitly asks to review the local diff before it is committed; or
- the change set is so expansive that you judge the user should look at it before it is published, e.g. it rewrites large parts of several specifications or reverses an established design decision.

In either case, tell the user the change set is uncommitted and why.

The `absorb-implementation-feedback` and `apply-designer-feedback` skills never use this standing authorization. They change the Spec repo only as [Spec repo changes in a worktree](.claude/skills/spec-repo-worktree.md) directs: once the design is settled, they push to `main` from a worktree, resolve natural conflicts, report the decisions for the user to review, and escalate only a far-reaching change. `absorb-implementation-feedback` always has the user review the design first; `apply-designer-feedback` does so only when the user's feedback shows any uncertainty. Never run the `update-implementation` skill unless the user explicitly asks for it. The one exception is the `add-music` skill, which, after pushing new tracks, refreshes the Implementation's content by that skill's Content-only update only.
