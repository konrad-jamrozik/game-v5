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

1. Identify the Implementation directory: the sibling directory of this repository that the user names, or the only
   one whose name starts with `game-v5-impl-`. Ask the user when several match.
2. Take the target Specification revision as this repository's latest commit, unless the user names another. When the
   working tree of this repository has uncommitted changes under `docs/specs` or `content`, tell the user they are
   not applied, because they belong to no Specification revision.
3. Read `tracking/specification-baseline.md` in the Implementation directory.
   - If it is missing, the Implementation has never been tracked. Tell the user that adopting a Specification baseline
     needs one pass over the Implementation to write the Specification map, and do it only after the user agrees,
     under Edge cases and failure behavior of Specification Tracking.
   - If it equals the target, report that the Implementation is up to date and stop.
4. Follow Specification Updates: compute the difference, sort it into editorial and normative changes, reach the
   affected files through the Specification map, and complete the update in one change to the Implementation.
   - Read only the changed passages, the Specification map sections they lead to, and the files those sections list.
     Read an unchanged specification only to resolve a change's meaning, e.g. a term a changed rule now uses.
   - For a difference that touches several unrelated specifications, consider one subagent for each changed
     specification, each given only its part of the difference and its Specification map section.
5. Run the Implementation's own checks from its Implementation directory, never this repository's scripts.
6. Commit the change in the Implementation directory. Never add a Git remote there. Push only when the Implementation
   already has a remote and its own publishing setup expects pushes, e.g. after
   [GitHub Pages Deployment](../../../docs/specs/implementation/recipes/github-pages-deployment.md).

## Report

Tell the user:

- the old and new Specification baseline;
- each normative change and the files it changed, and how many changes were editorial only;
- each Specification problem whose Resolution changed, and each new Specification problem or Implementation decision;
- the result of the Implementation's checks;
- whether Open Specification problems remain, and that the `absorb-implementation-feedback` skill turns them into
  specification changes.
