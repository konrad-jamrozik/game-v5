---
name: absorb-implementation-feedback
description: Review an Implementation's Open Specification problems together with the Engine designer and turn each into a specification change or a recorded decline, so that a rebuilt Implementation does not meet them again.
---

# Absorb Implementation feedback into the specifications

Use this skill when the user asks to back-propagate what an Implementation learned into the specifications, e.g.
"go through the implementation's feedback" or "fix the spec problems the implementer found".

Building or updating an Implementation records, as feedback, the defects it met in the specifications, under
[Implementation Feedback](../../../docs/specs/implementation/implementation-feedback.md). Only the specifications are
durable: a fix that stays in an Implementation is lost when the Implementation is rebuilt. This skill moves each fix
into the specifications. The user is the Engine designer and decides every outcome; propose, never settle a design
question silently.

## Workflow

1. Identify the Implementation directory: the sibling directory of this repository that the user names, or the only
   one whose name starts with `game-v5-impl-`. Ask the user when several match.
2. Read `feedback/specification-problems.md` there and select the entries whose Resolution is Open or that state no
   Resolution. Read only those entries and the Implementation decisions they link to in
   `feedback/implementation-decisions.md`. Review Implementation decisions on their own, e.g. to make an Implementer's
   choice a requirement, only when the user asks.
3. Read `tracking/specification-baseline.md`. When this repository's latest commit is ahead of it, check with
   `git diff <baseline>..HEAD` on each problem's affected specifications whether a later commit already removed the
   problem, and set those aside as already fixed.
4. For each remaining problem, read only the affected specification sections the entry names, and propose one outcome
   with a recommendation:
   - **Fix the specifications:** remove a Conflict or Duplicate, or answer an Implicit gap or Needed TODO.
   - **Adopt the Implementation decision:** write the option the Implementation chose into the specifications, so a
     rebuilt Implementation chooses it too.
   - **Make it an Implementer's choice:** state at the rule that the matter is the Implementer's choice, under
     [Kinds of unspecified content](../../../docs/specs/governance/spec-conventions.md#kinds-of-unspecified-content),
     so it stops being a problem.
   - **Decline:** leave the specifications as they are. Warn that nothing durable records a decline, so a rebuilt
     Implementation may record the same problem again.
5. Present the proposals to the user in small groups and wait for each decision. Group related problems, e.g. two
   entries about one formula, so one decision covers them.
6. Make the accepted specification changes under the repository's `AGENTS.md` and
   [Specification Conventions](../../../docs/specs/governance/spec-conventions.md), run `npm run check`, and commit and
   push as `AGENTS.md` directs, including its exceptions.
7. For each declined problem, set its Resolution in the Implementation's feedback file to Declined, naming this repository's
   reviewed commit by its full hash and the user's reason, and commit that in the Implementation directory without
   adding a Git remote. Leave fixed problems Open: the next run of the `update-implementation` skill applies the
   change to the code and sets them Resolved.

## Report

Tell the user, for each reviewed problem, its identifier and the outcome, with the specification commit that carries
it. List the problems set aside as already fixed, and suggest running the `update-implementation` skill to apply the
new specification changes to the Implementation.
