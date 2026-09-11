# Specification Work Plan and Backlog

| Metadata             | Value                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Spec ID              | PLAN                                                                                                                      |
| Status               | Accepted                                                                                                                  |
| Acceptance reference | Project owner approval in this task: "change work plan status to Accepted and propose commit message for pending changes" |
| Scope                | Specification authoring order, review checkpoints, and backlog tracking                                                   |
| Conventions          | [Specification conventions](spec-conventions.md)                                                                          |

## 1. Purpose and boundaries

Develop the game specifications in manageable review batches rather than drafting the entire game at once. This document
owns the accepted authoring sequence and work tracking; individual specifications own game rules and interface contracts.

The specifications are the durable design artifacts. Code and tests will be derived from accepted contracts. This is a
specification work plan, not an implementation schedule, and it does not select formulas, frameworks, or balance values.

**Next work:** draft [Domain Model](foundation/domain-model.md) alone and present it for review. No subject-spec
drafting has started as part of creating this work plan.

## 2. Dependencies and terminology

- **Normative:** [Specification conventions](spec-conventions.md) defines document structure, rule ownership, lifecycle,
  and acceptance. It is Accepted; its approval does not accept other documents.
- **Design input:** [Design stem](../game-design-stem.md) supplies strategic intent and architectural constraints.
- **Navigation:** [Spec index](README.md) registers document IDs and ownership. This work plan owns the detailed sequence.

A **batch** is a bounded set of related specifications with one review checkpoint at its end. At that checkpoint, the
user can accept the drafts, request revisions, or change direction. Feedback and revised drafts remain part of the same
checkpoint until resolved; they do not create additional checkpoints. Combat and Missions are separate batches.

## 3. Concepts and contract

### Work tracking

Track work separately from document status:

| Work state | Meaning                                                                                      |
| ---------- | -------------------------------------------------------------------------------------------- |
| Queued     | Planned, but substantive drafting has not started.                                           |
| Drafting   | A draft is being written; do not imply acceptance.                                           |
| In review  | Drafts have been presented; feedback and any resulting revisions are being handled.          |
| Complete   | The listed deliverable has been explicitly accepted, with its acceptance reference recorded. |

Document metadata remains authoritative for Stub, Draft, Accepted, and Superseded status. Work remains In review while
feedback is incorporated and revised drafts are reviewed. For a multi-document batch, record partial completion explicitly
instead of marking the whole batch Complete.

### Current baseline

- Specification Conventions is Accepted.
- All 19 subject specifications are Stub documents.
- This work plan is Accepted; the 10-batch sequence has been selected and later changes must be explicit.
- No implementation milestones or delivery dates have been committed.

## 4. Requirements

### Review sequence and backlog

**PLAN-001:** Use the following 10-batch sequence, starting with Domain Model alone. If review reveals a better grouping,
propose the change explicitly and update this table when agreed rather than silently changing the order.

| Batch | Specifications                                                                                                                                       | Review objective and reason for this order                                                                                                    | Work state |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 1     | [Domain Model](foundation/domain-model.md)                                                                                                           | Agree on vocabulary, entities, relationships, authoritative state, and boundaries before specifying behavior. Review this document alone.     | Queued     |
| 2     | [Numbers and Randomness](foundation/numbers-and-randomness.md); [History and Persistence](foundation/history-and-persistence.md)                     | Establish exact calculations, reproducible randomness, reversible state, replay, and save/load contracts before relying on them in mechanics. | Queued     |
| 3     | [Agents](mechanics/agents.md); [Economy and Upgrades](mechanics/economy-and-upgrades.md)                                                             | Define personnel availability, effectiveness, growth, resources, and purchases used by other mechanics.                                       | Queued     |
| 4     | [Leads and Progression](mechanics/leads-and-progression.md); [Investigations](mechanics/investigations.md)                                           | Define the first major strategic subsystem, including precise progress, completion probabilities, player uncertainty, and commitment costs.   | Queued     |
| 5     | [Combat](mechanics/combat.md)                                                                                                                        | Define automatic battle resolution and its outputs. Present this for review before drafting the mission-consequence contract.                 | Queued     |
| 6     | [Missions](mechanics/missions.md)                                                                                                                    | Translate battle results into deployment outcomes, expiration, rewards, and damage-related partial success. Hold a separate review.           | Queued     |
| 7     | [Factions](mechanics/factions.md); [Campaign](mechanics/campaign.md); [Turn Resolution](foundation/turn-resolution.md)                               | Connect escalation, operations, panic, endings, and precise phase ordering into a coherent campaign loop.                                     | Queued     |
| 8     | [Player Information](interfaces/player-information.md); [TypeScript API](interfaces/typescript-api.md); [Developer API](interfaces/developer-api.md) | Finalize complete observation, command, and debugging contracts once the mechanics they expose are defined.                                   | Queued     |
| 9     | [CLI](interfaces/cli.md)                                                                                                                             | Specify complete human and AI play through a thin terminal adapter over the API.                                                              | Queued     |
| 10    | [Web UI](interfaces/web-ui.md)                                                                                                                       | Specify grids, trees, charts, and interactions around the established player contract.                                                        | Queued     |

The table is an authoring sequence, not a declaration that every referenced spec is already accepted. Some dependencies
are mutual. Drafts must identify unresolved dependencies explicitly rather than borrowing unstated rules from stubs.

### Work that grows alongside the batches

**PLAN-002:** Develop the following documents incrementally with the mechanics they support. They are part of the backlog,
not work postponed until after the interfaces.

Initial campaign scope and balance decisions belong to Initial Campaign Content. Propose parameter values and content
incrementally alongside each mechanic, then review the complete playable campaign after batch 7. Their later resolution
is scheduled work in that specification, not an unresolved decision about this work plan.

| Track       | Document                                                          | When and what to add                                                                                                                                              | Work state |
| ----------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Content     | [Initial Campaign Content](content/initial-campaign.md)           | Add exact named parameters and small example content as each subsystem needs them. Complete the playable campaign content after batch 7 and review it explicitly. | Queued     |
| Conformance | [Campaign Acceptance Scenarios](acceptance/campaign-scenarios.md) | Add precise cross-system examples with each batch. Review campaign-loop coverage after batch 7 and add API/CLI/web parity scenarios with batches 8–10.            | Queued     |

**PLAN-003:** During batch 1, identify the player-information boundary and outline the API capabilities needed to support
it. Refine these notes with each mechanic; do not defer their design influence until batch 8. Keep supporting notes
explicitly preliminary, and keep Domain Model as the first standalone review deliverable. Exact observation fields and
public signatures are finalized in their owning specs during batch 8.

**PLAN-004:** Refine turn timing and shared contracts as mechanics are drafted. Batch 7 reconciles the complete turn
schedule; earlier drafts must still state their local timing requirements and any unresolved cross-system ordering.

### Review and completion workflow

**PLAN-005:** For each authorized batch:

1. Inspect the stem, accepted dependencies, related drafts, and relevant game-ts code where useful.
2. Draft the contract using the accepted conventions. Clearly distinguish proposed rules from inherited behavior.
3. Add formulas, boundary cases, worked examples, and relevant content/scenario updates.
4. Check internal consistency and cross-spec references. Identify unresolved dependencies and decisions.
5. Present a concise review summary: proposed behavior, departures from game-ts, trade-offs, open questions, and affected
   documents. Set the work state to In review; the specification remains Draft.
6. Pause before advancing to the next batch so the user can review. Incorporate feedback or follow explicit instructions
   to continue. Record acceptance only when it is explicitly given.

**PLAN-006:** Update this backlog when drafting begins, a draft enters review, feedback requires revision, or acceptance is
recorded. Link the accepted document's approval reference rather than duplicating its approval text here. Keep current
status summaries consistent with document metadata.

**PLAN-007:** Do not treat the completion of a draft or batch as authorization to implement game code. Implementation
scope and milestones are selected separately. Graphics, animation, and possible browser-based 3D specifications remain
deferred until those stages are requested.

### First implementation milestone assessment

**PLAN-011:** After the batch 4 review, assess whether the accepted contracts support a small headless playable slice.
Propose its concrete scope and identify missing contracts, content, or acceptance scenarios before implementation is
authorized. Do not assume completing batch 4 guarantees readiness, or that all 19 subject specifications must be accepted
before any implementation can begin. If contracts are missing, schedule their resolution before implementing the slice.

## 5. Edge cases and failure behavior

**PLAN-008:** If a later mechanic exposes a missing assumption in an earlier spec, identify the affected rule and propose a
revision in its owning document. Do not silently change Accepted rules or duplicate a workaround in another spec.

**PLAN-009:** If a batch becomes too large to review comfortably, propose a split at a coherent contract boundary and
record it here. Partial acceptance does not accept the remaining documents or implicitly resolve their open decisions.

**PLAN-010:** If a draft depends on unresolved content or rules, label the dependency and its impact. Explicitly scoped
example fixtures can illustrate a proposal, but must not masquerade as the final campaign configuration. An unresolved
implementation-affecting dependency prevents acceptance of the affected contract.

If review feedback changes priorities, update the backlog and explain affected dependencies. Existing drafts remain
available for revision; a change in order alone does not invalidate their content.

## 6. Acceptance examples

These are workflow checks, not gameplay tests:

- **First review (PLAN-001, PLAN-003, PLAN-005):** Starting from the current baseline, drafting Domain Model changes it to
  Draft and batch 1 to In review when presented. Preliminary API/information notes do not imply those contracts are
  complete. The next batch does not begin without the review opportunity or an explicit instruction to continue.
- **Requested revision (PLAN-005, PLAN-006):** Feedback requests a different agent-assignment model. Batch 1 remains
  In review while affected notes and examples are updated. Domain Model remains Draft until explicitly accepted.
- **Separate combat/mission checkpoints (PLAN-001, PLAN-009):** Accepting Combat completes batch 5, not batch 6. The damage-related
  campaign benefit of a failed mission remains a Missions decision.
- **Incremental content (PLAN-002, PLAN-010):** Drafting Investigations adds its parameters to Initial Campaign Content and
  relevant multi-turn scenarios. This does not mark the entire content catalog or scenario suite Accepted.
- **Later conflict (PLAN-008):** A mission rule conflicts with an Accepted history rule. The discrepancy is documented and
  a revision is proposed to the owner; neither implementation nor a second spec silently overrides the accepted rule.
- **Milestone assessment (PLAN-007, PLAN-011):** After batch 4 is reviewed, assess the accepted contracts for a headless
  slice. If its required turn timing or API contract is unresolved, list the gap and propose the necessary specification
  work; do not invent the missing rule in code or treat the assessment as implementation authorization.

## 7. Open decisions

None.
