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

Every change to the Spec repo follows [Spec repo changes in a worktree](../spec-repo-worktree.md): its worktree, its Gate 1 plan Artifact,
its Gate 2 local diff, and its handling of push conflicts.

0. Create the Spec repo worktree, under step 1 of Spec repo changes in a worktree, before reading any specification.
1. Identify the Implementation repo: the sibling of the Spec repo's main local clone that the user names, or the only
   one whose name starts with `game-v5-impl-`. Ask the user when several match.
2. Find the specifications the feedback concerns, in every Family of the Design specifications it involves: the rule
   in Foundation or Mechanics, the GDRs in Content, e.g. `bootstrap-gdrs.md`, and the presentation in UI, including
   its visual design. Search the specifications for the feature's terms, or go from the Implementation's files back
   to Spec IDs through its `tracking/specification-map.md`. Read only the sections that govern the observed behavior,
   at the Implementation's Specification baseline in `tracking/specification-baseline.md`.
3. Classify the feedback into one case of Designer feedback for each Family involved, and show the user the governing
   wording of each and what the Implementation does:
   - **The specifications say otherwise:** a conformance defect, only when every Family involved already specifies
     what the user expects, e.g. the rule and its GDR are both present.
   - **The specifications say what the Implementation does:** a design change.
   - **The specifications leave it open:** an Implementer's choice or a gap.

   Name the Family that falls short under the table in Designer feedback, e.g. "the feature is specified but its GDR
   is missing" changes Content only, while "the feature is not specified" changes Mechanics first and then Content.

4. Propose what to do with a recommendation, and wait for the user's decision; the user is the Game designer and
   decides every design question.
5. Carry out the decision:
   - **Specification change**, for a design change, a newly specified open matter, or a clarification of ambiguous
     wording: publish the Gate 1 plan Artifact and wait for approval, edit the specifications in the worktree under
     [Specification Conventions](../../../docs/specs/governance/conventions/spec-conventions.md), show the Gate 2
     local diff and wait for approval, then commit, push, release the worktree, and update the main local clone, under
     steps 3 to 7 of Spec repo changes in a worktree. Then run the `update-implementation` skill when the user asked
     for the change to reach the Implementation.
   - **Conformance fix:** first release the unchanged worktree: outside T3 Code, remove it with `ExitWorktree` and
     `action: "remove"`, because the session must leave it before changing the Implementation repo; in T3 Code, leave
     it in place, as under step 6 of Spec repo changes in a worktree. Then change the Implementation to match the
     specifications at its Specification baseline, add a test that would have caught the defect, keep the
     Specification map current, and commit there without adding a Git remote. Leave the Specification baseline unchanged. No plan
     Artifact or local diff gate applies, because the user approved the fix in step 4 after seeing the governing
     wording and what the Implementation does.

## Report

Tell the user the case, the governing specification sections, what changed and where, the commits, whether the
main local clone of the Spec repo was updated, and whether `update-implementation` still needs to run.
