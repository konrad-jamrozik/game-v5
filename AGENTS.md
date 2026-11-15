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

When implementing the game, follow every specification in `docs/specs/implementation/` whose Binding metadata is
Mandatory, e.g. [Implementation Placement](docs/specs/implementation/implementation-placement.md) and
[Implementation Feedback](docs/specs/implementation/implementation-feedback.md). They apply whatever the task says about
platform, language, or engine, e.g. equally to a browser implementation and to a dedicated game-engine mplementation, and no other instruction waives them.

## Marking examples

In every document and in chat, introduce every example with "e.g.", as defined in
[Marking examples](docs/specs/governance/spec-conventions.md#marking-examples). Never state an example as a bare
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
