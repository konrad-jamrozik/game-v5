---
name: absorb-implementation-feedback
description: Review an Implementation's Open Specification problems together with the Engine designer and turn each into a specification change or a recorded decline, so that a rebuilt Implementation does not meet them again.
---

# Absorb Implementation feedback into the specifications

Use this skill when the user asks to back-propagate what an Implementation learned into the specifications, e.g.
"go through the implementation's feedback" or "fix the spec problems the implementer found".

Building or updating an Implementation records, as feedback, the defects it met in the specifications, under
[Implementation Feedback](../../../docs/specs/implementation/mandatory/implementation-feedback.md). Only the specifications are
durable: a fix that stays in an Implementation is lost when the Implementation is rebuilt. This skill moves each fix
into the specifications.

Each run addresses the three most severe open problems, or another number the user asks for, so that every run stays
small and the rest wait for the next run. The user is the Engine designer and always reviews the design first:
propose an outcome for each problem addressed and wait until the user settles them, however clear the problems seem.
Once they are settled, carry the result through to `main` without asking again, escalating only as [Spec repo changes in a worktree](../spec-repo-worktree.md) directs, i.e.
for a far-reaching change or a conflict with no natural resolution. Never run the `update-implementation` skill unless
the user explicitly asks for it.

## Workflow

Every change to the Spec repo follows [Spec repo changes in a worktree](../spec-repo-worktree.md): its worktree, its self-review and
escalation, and its handling of push conflicts. Steps 0, 7, and 8 below name where each applies.

0. Create the Spec repo worktree, under step 1 of Spec repo changes in a worktree, before reading any specification.
1. Identify the Implementation repo: the sibling of the Spec repo's main local clone that the user names, or the only
   one whose name starts with `game-v5-impl-`. Ask the user when several match.
2. Read `feedback/specification-problems.md` there and select the entries whose Resolution is Open or that state no
   Resolution. Read only those entries and the Implementation decisions they link to in
   `feedback/implementation-decisions.md`. Review Implementation decisions on their own, e.g. to make an Implementer's
   choice a requirement, only when the user asks.
3. Read `tracking/specification-baseline.md`. When the worktree's `HEAD`, which is the latest `origin/main`, is ahead of it, check with
   `git diff <baseline>..HEAD` on each problem's affected specifications whether a later commit already removed the
   problem, and set those aside as already fixed.
4. Take each remaining problem's Severity from its entry, under
   [Severity](../../../docs/specs/implementation/mandatory/implementation-feedback.md#severity). Rate an entry that
   states none yourself on that scale, and mark the rating as yours when showing it. Treat related problems, e.g. two
   entries about one formula, as one item with the Severity of its most severe entry. Then pick the top 3 items: the most severe, breaking ties by the most Player-visible, then by the oldest entry.

5. For each of the top 3, read only the affected specification sections the entry names, and name the Family of
   the Design specifications that falls short, under the table in
   [Designer feedback](../../../docs/specs/governance/process/development-loop.md#designer-feedback), e.g. a problem
   met in a Mechanics rule may be fixed by a missing or wrong GDR in Content, or by a UI or visual design gap, with
   the rule left as it is. Then propose one outcome with a recommendation:
   - **Fix the specifications:** remove a Conflict or Duplicate, or answer an Implicit gap or Needed TODO.
   - **Adopt the Implementation decision:** write the option the Implementation chose into the specifications, so a
     rebuilt Implementation chooses it too.
   - **Make it an Implementer's choice:** state at the rule that the matter is the Implementer's choice, under
     [Kinds of unspecified content](../../../docs/specs/governance/conventions/spec-conventions.md#kinds-of-unspecified-content),
     so it stops being a problem.
   - **Decline:** leave the specifications as they are. Nothing durable records a decline, so a rebuilt
     Implementation may record the same problem again; prefer another outcome when one fits.
6. **Design review:** show the user, in this order:
   - the count of pending problems, i.e. the remaining ones, and of those set aside as already fixed;
   - the count of pending items by severity: Critical, High, Medium, and Low;
   - for each of the top 3, its identifiers, severity and why, the governing wording, the recommended outcome with the
     exact change it makes, and the alternatives.

   Stop and wait; discuss until the user settles all three. The user may swap an item for another pending one. When
   the user approves without answering a detail, e.g. the exact wording, choose it yourself and record it as a
   decision for the report.

7. When every item of the top 3 has a decision, make the specification changes in the worktree under
   [Specification Conventions](../../../docs/specs/governance/conventions/spec-conventions.md), redraw on the Design
   canvas every Artboard they affect and export its image, which is always part of a UI change, never a later option,
   and self-review them, under step 3 of Spec repo changes in a worktree. Then commit, push, resolving any conflicts, release the worktree,
   and update the main local clone, under steps 4 to 6 of Spec repo changes in a worktree.
8. After the worktree is released, for each declined problem, set its Resolution in the Implementation's feedback file
   to Declined, naming the Spec repo's reviewed commit by its full hash and the reason, and commit that in the
   Implementation repo without adding a Git remote. Leave fixed problems Open: the next run of the `update-implementation` skill applies the
   change to the code and sets them Resolved.

## Report

Tell the user:

- for each problem of the top 3, its identifier and the outcome, with the commit diff link that carries it; the problems set
  aside as already fixed; how any conflicts were resolved; and whether the main local clone of the Spec repo was
  updated;
- **Decisions to review:** every detail decided on the user's behalf after the design review, each with the option
  chosen, the alternatives, and why, or that there were none;
- how many problems are still pending, by severity, for the next run;
- that the next step is to run the `update-implementation` skill, which applies the new specification changes to the
  Implementation and sets the fixed problems Resolved.
