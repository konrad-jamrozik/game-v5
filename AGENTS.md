# Repository agent instructions

Before running an npm script, verify that `node` and `npm` are available with `Get-Command` on Windows or `command -v`
on POSIX systems. Do not discover a missing package manager by attempting the script. Follow the Agent environment setup
in `README.md` when the toolchain is unavailable.

Choose verification commands as described in the [Verification](README.md#verification) section of `README.md`. Before
declaring repository changes complete, run `npm run check` and report any failures.

## Linking to documents in chat

When pointing the user at a repository document or section, use a Markdown link whose target is the file's absolute local
path followed by a heading anchor, for example `[Campaign and Session](/abs/path/to/repo/docs/specs/foundation/core-concepts.md#campaign-and-session)`.
Build the absolute path from the current working directory (the repository root), not from a remembered location.
The Claude desktop app opens such links in its local Markdown preview pane at that anchor. Do not use relative paths,
repository-root paths with a leading slash, plain `path:line` text, or GitHub URLs; these were tried and do not give
the user a working anchored preview link. Anchors are the lowercase, hyphenated heading text; verify the heading exists
with `grep -n` first.

## Committing and publishing changes

Commit and push repository changes directly to `main`; do not use feature or session branches unless the user asks.
After pushing, give the user a link to the commit's diff view so they can see exactly what was committed, in the form
`https://github.com/konrad-jamrozik/game-v5/commit/<full-sha>`.
