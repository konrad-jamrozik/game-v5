---
name: apply-designer-feedback
description: Turn the Game designer's feedback on an Implementation, e.g. something wrong or unwanted seen while playing it, into a specification change or a conformance fix, so the change survives a rebuild of the Implementation.
---

# Apply Designer feedback

Use this skill when the Game designer reports something about an Implementation they want changed, e.g. "the Combat
report shows the wrong damage" or "Missions feel too easy".

The Implementation is disposable, so the fix must start from the specifications. How Designer feedback enters them is
owned by [Designer feedback](../../../docs/specs/governance/development-loop.md#designer-feedback) in Development Loop;
follow it, and let it win when this skill disagrees.

## Workflow

1. Identify the Implementation directory: the sibling directory of this repository that the user names, or the only
   one whose name starts with `game-v5-impl-`. Ask the user when several match.
2. Find the specifications the feedback concerns. Search the specifications for the feature's terms, or go from the
   Implementation's files back to Spec IDs through its `records/specification-map.md`. Read only the sections that
   govern the observed behavior, at the Implementation's Specification baseline in
   `records/specification-baseline.md`.
3. Classify the feedback into one case of Designer feedback, and show the user the governing wording and what the
   Implementation does:
   - **The specifications say otherwise:** a conformance defect.
   - **The specifications say what the Implementation does:** a design change.
   - **The specifications leave it open:** an Implementer's choice or a gap.
4. Propose what to do with a recommendation, and wait for the user's decision; the user is the Game designer and
   decides every design question.
5. Carry out the decision:
   - **Specification change**, for a design change, a newly specified open matter, or a clarification of ambiguous
     wording: edit the specifications under `AGENTS.md` and
     [Specification Conventions](../../../docs/specs/governance/spec-conventions.md), run `npm run check`, and commit
     and push as `AGENTS.md` directs. Then run the `update-implementation` skill when the user asked for the change to
     reach the Implementation.
   - **Conformance fix:** change the Implementation, in its directory, to match the specifications at its
     Specification baseline, add a test that would have caught the defect, keep the Specification
     map current, and commit there without adding a Git remote. Leave the Specification baseline unchanged.

## Report

Tell the user the case, the governing specification sections, what changed and where, the commits, and whether
`update-implementation` still needs to run.
