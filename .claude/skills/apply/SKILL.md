---
name: apply
description: Apply the Game designer's feedback on an Implementation end to end, by running the apply-designer-feedback skill and then, without asking again, the update-implementation skill, so the change reaches the Implementation in one request.
---

# Apply Designer feedback end to end

Use this skill when the Game designer wants their feedback on an Implementation both settled in the specifications and carried into the Implementation in one go, e.g. "/apply the Combat report shows the wrong damage".

This skill chains two skills and adds no rule of its own; follow each one, and let it win when this skill disagrees:

1. Run the `apply-designer-feedback` skill on the user's feedback, in the mode it chooses from the feedback's phrasing. In Discuss mode, wait for the user to settle the design as that skill directs; the chain continues only once its change is done.
2. Once it finishes, run the `update-implementation` skill on the same Implementation repo, with the commit `apply-designer-feedback` pushed, or the Spec repo's latest commit when it pushed none, as the target Specification revision. Invoking this skill is the user's explicit request for that run, so do not ask again.
   - Skip this step when `apply-designer-feedback` ended in a conformance fix only, since it leaves the Specification baseline unchanged and no specification changed, or when it stopped without a change, e.g. on an escalation.
   - When `update-implementation` refuses to start, e.g. because the main local clone of the Spec repo is not at `origin/main`, report which check failed and stop, as that skill directs.

## Report

Give the report of `apply-designer-feedback`, including its Decisions to review, followed by the report of `update-implementation`, or the reason step 2 was skipped or stopped.
