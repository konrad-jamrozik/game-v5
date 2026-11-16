---
name: apply-designer-feedback
description: Turn the Game designer's feedback on an Implementation, e.g. something wrong or unwanted seen while playing it, into a specification change or a conformance fix, so the change survives a rebuild of the Implementation.
---

# Apply Designer feedback

Use this skill when the Game designer reports something about an Implementation they want changed, e.g. "the Combat
report shows the wrong damage" or "Missions feel too easy".

The Implementation is disposable, so the fix must start from the specifications. How Designer feedback enters them is
owned by [Designer feedback](../../../docs/specs/governance/process/development-loop.md#designer-feedback) in Development Loop;
follow it, and let it win when this skill disagrees.

## Workflow

Every change to the Spec repo follows [Spec repo changes in a worktree](../../../AGENTS.md#spec-repo-changes-in-a-worktree) in the repository's `AGENTS.md`: its worktree, its Gate 1 plan Artifact,
its Gate 2 local diff, and its handling of push conflicts.

0. Create the Spec repo worktree, under step 1 of Spec repo changes in a worktree, before reading any specification.
1. Identify the Implementation repo: the sibling of the Spec repo's main local clone that the user names, or the only
   one whose name starts with `game-v5-impl-`. Ask the user when several match.
2. Find the specifications the feedback concerns. Search the specifications for the feature's terms, or go from the
   Implementation's files back to Spec IDs through its `tracking/specification-map.md`. Read only the sections that
   govern the observed behavior, at the Implementation's Specification baseline in
   `tracking/specification-baseline.md`.
3. Classify the feedback into one case of Designer feedback, and show the user the governing wording and what the
   Implementation does:
   - **The specifications say otherwise:** a conformance defect.
   - **The specifications say what the Implementation does:** a design change.
   - **The specifications leave it open:** an Implementer's choice or a gap.
4. Propose what to do with a recommendation, and wait for the user's decision; the user is the Game designer and
   decides every design question.
5. Carry out the decision:
   - **Specification change**, for a design change, a newly specified open matter, or a clarification of ambiguous
     wording: publish the Gate 1 plan Artifact and wait for approval, edit the specifications in the worktree under
     [Specification Conventions](../../../docs/specs/governance/conventions/spec-conventions.md), show the Gate 2
     local diff and wait for approval, then commit, push, remove the worktree, and update the main local clone, under
     steps 3 to 7 of Spec repo changes in a worktree. Then run the `update-implementation` skill when the user asked
     for the change to reach the Implementation.
   - **Conformance fix:** first remove the unchanged worktree with `ExitWorktree` and `action: "remove"`, because
     the session must leave it before changing the Implementation repo. Then change the Implementation to match the
     specifications at its Specification baseline, add a test that would have caught the defect, keep the
     Specification map current, and commit there without adding a Git remote. Leave the Specification baseline unchanged. No plan
     Artifact or local diff gate applies, because the user approved the fix in step 4 after seeing the governing
     wording and what the Implementation does.

## Report

Tell the user the case, the governing specification sections, what changed and where, the commits, whether the
main local clone of the Spec repo was updated, and whether `update-implementation` still needs to run.
