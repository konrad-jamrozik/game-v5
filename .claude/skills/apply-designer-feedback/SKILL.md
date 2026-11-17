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

First choose the mode from how the user phrased the feedback:

- **Go:** the user states the feedback as an instruction, e.g. "apply feedback: this UI renders wrong due to
  alignment". Design the change yourself, make every judgement call with the option you would recommend, and carry it
  through to `main` without waiting for approval; the user reviews your decisions afterwards, from the report.
- **Discuss:** the feedback shows any hint of uncertainty, e.g. it asks a question ("should Missions be harder?"),
  hedges ("maybe", "I'm not sure", "what do you think"), weighs options, or asks to discuss. Hold a design discussion
  first: give your analysis and a recommendation with its alternatives, and wait. Make no specification change until
  the user settles the design; then continue as in Go mode.

When unsure which mode applies, use Discuss. In either mode, escalate only as
[Spec repo changes in a worktree](../spec-repo-worktree.md) directs, i.e. for a far-reaching change or a conflict with no
natural resolution, and never run the `update-implementation` skill unless the user explicitly asks for it.

## Workflow

Every change to the Spec repo follows [Spec repo changes in a worktree](../spec-repo-worktree.md): its worktree, its self-review and
escalation, and its handling of push conflicts.

0. Create the Spec repo worktree, under step 1 of Spec repo changes in a worktree, before reading any specification.
1. Identify the Implementation repo: the sibling of the Spec repo's main local clone that the user names, or the only
   one whose name starts with `game-v5-impl-`. Ask the user when several match.
2. Find the specifications the feedback concerns, in every Family of the Design specifications it involves: the rule
   in Foundation or Mechanics, the GDRs in Content, e.g. `bootstrap-gdrs.md`, and the presentation in UI, including
   its visual design. Search the specifications for the feature's terms, or go from the Implementation's files back
   to Spec IDs through its `tracking/specification-map.md`. Read only the sections that govern the observed behavior,
   at the Implementation's Specification baseline in `tracking/specification-baseline.md`.
3. Classify the feedback into one case of Designer feedback for each Family involved, noting the governing wording of
   each and what the Implementation does:
   - **The specifications say otherwise:** a conformance defect, only when every Family involved already specifies
     what the user expects, e.g. the rule and its GDR are both present.
   - **The specifications say what the Implementation does:** a design change.
   - **The specifications leave it open:** an Implementer's choice or a gap.

   Name the Family that falls short under the table in Designer feedback, e.g. "the feature is specified but its GDR
   is missing" changes Content only, while "the feature is not specified" changes Mechanics first and then Content.

4. In Discuss mode, hold the design discussion here and wait until the user settles it. Then decide what to do,
   choosing the option you would recommend for every open design question, e.g. which Family
   changes, the exact wording, or a value the feedback leaves open, and record each decision with its alternatives and
   reason for the report. When the feedback is ambiguous, take its most plausible reading and record that as a
   decision too.
5. Carry out the decision:
   - **Specification change**, for a design change, a newly specified open matter, or a clarification of ambiguous
     wording: edit the specifications in the worktree under
     [Specification Conventions](../../../docs/specs/governance/conventions/spec-conventions.md), self-review it, then
     commit, push, resolving any conflicts, release the worktree, and update the main local clone, under steps 3 to 6
     of Spec repo changes in a worktree.
   - **Conformance fix:** first release the unchanged worktree: outside T3 Code, remove it with `ExitWorktree` and
     `action: "remove"`, because the session must leave it before changing the Implementation repo; in T3 Code, leave
     it in place, as under step 5 of Spec repo changes in a worktree. Then change the Implementation to match the
     specifications at its Specification baseline, add a test that would have caught the defect, keep the
     Specification map current, and commit there without adding a Git remote. Leave the Specification baseline
     unchanged.

## Report

Tell the user:

- the case for each Family involved, the governing specification sections, what changed and where, the commit diff
  links, how any conflicts were resolved, and whether the main local clone of the Spec repo was updated;
- **Decisions to review:** every decision made on the user's behalf, each with the option chosen, the alternatives,
  and why, most consequential first;
- that the next step is to run the `update-implementation` skill, unless the change was a conformance fix only.
