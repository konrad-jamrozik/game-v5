# Specification Work Plan and Backlog

| Metadata    | Value                                            |
| ----------- | ------------------------------------------------ |
| Spec ID     | PLAN                                             |
| Family      | Governance                                       |
| Status      | Draft                                            |
| Audience    | Engine designer                                  |
| Conventions | [Specification conventions](spec-conventions.md) |

# Overview

This document organizes development of the game specifications into manageable review batches rather than drafting the entire game at once. It
owns the accepted authoring sequence and work tracking; individual specifications own game rules and interface contracts.

The specifications are the durable design artifacts. Code and tests will be derived from accepted contracts. This is a specification work plan, not an implementation schedule; it decides no specification content, e.g. [Mechanics family](../mechanics/about-mechanics.md) formulas or Game Data Record (GDR) values.
The [Game Design Brief](../../game-design-brief.md) supplies strategic intent and architectural constraints, while the
[specification index](../README.md) registers document IDs, Families, and ownership.

**Current work:** Batch 1 is partially complete. [Core Concepts](../foundation/core-concepts.md), [Campaign State](../foundation/campaign-state.md), and
[Game Data Records](../foundation/game-data-records.md) are Accepted. [Engine Contract](../foundation/engine-contract.md) and [Domain Model](../foundation/domain-model.md) are **In review**. Review their
contracts and unresolved design questions before advancing. Batch 2 is Drafting and has not been presented for review; batches 3 to 10 have not started.

# Relationships

- Used by [Outstanding Work Items](work-todos.md)

# Glossary

| Term  | Definition                                                                                                                                                                                                                                                                                                                                     |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Batch | A bounded set of related specifications with one review checkpoint at its end. At that checkpoint, the user can accept the drafts, request revisions, or change direction. Feedback and revised drafts remain part of the same checkpoint until resolved; they do not create additional checkpoints. Combat and Missions are separate batches. |

# Work tracking

Track work separately from document status:

| Work state | Meaning                                                                             |
| ---------- | ----------------------------------------------------------------------------------- |
| Queued     | Planned, but substantive drafting has not started.                                  |
| Drafting   | A draft is being written; do not imply acceptance.                                  |
| In review  | Drafts have been presented; feedback and any resulting revisions are being handled. |
| Complete   | The listed deliverable has been explicitly accepted by the project owner.           |

Document metadata remains authoritative for Stub, Draft, Accepted, and Superseded status. Work remains In review while
feedback is incorporated and revised drafts are reviewed. For a multi-document batch, record partial completion explicitly
instead of marking the whole batch Complete.

# Current baseline

- Batch 1 is In review, with three of its five specifications Accepted. Batch 2 is Drafting: four of its five
  specifications are Draft and none has been presented for review. Batches 3 to 10 are Queued.
- The 8-batch sequence has been selected and later changes must be explicit.
- No implementation milestones or delivery dates have been committed.

# Relationship inventory migration

[Artifact Relationships](artifact-relationships.md) is In review as a separate governance
specification. It defines two directional inventories, centrally defined implicit relationships, mirrored explicit
relationships, and canonical relationship terminology. This work does not advance mechanics review
batches.

Inventory migration is **Complete** for the current specification set. Explicit relationships use mirrored flat
directional lists; implicit relationships are omitted from those lists. Substantive reliance is explained in owning
contract prose. The relationships of the batch 1 specifications form no
cycle. Core Concepts supplies shared vocabulary; Engine Contract uses Core Concepts, and Campaign State refines Engine Contract. Game Data Records uses Core Concepts, Engine Contract, and Campaign State. Domain Model uses Core Concepts, Engine Contract, Campaign State, and Game Data Records. Domain Model retains the
game-specific identity scope; Engine Contract retains execution guarantees. Operational specifications use modeling
conventions and refine the corresponding engine behavior.

The [cycle register](../../spec-relationship-cycles.md) records retained cycles and prospective removal work. Its
removal approaches do not select new gameplay rules or change the accepted review sequence.

# Review sequence and backlog

## Batch sequence

Use the following 8-batch sequence, starting with Core Concepts, Engine Contract, Campaign State, Game Data Records, and Domain Model. If review reveals a better grouping,
propose the change explicitly and update this table when agreed rather than silently changing the order.

| Batch | Specifications                                                                                                                                                                                                                                                  | Review objective and reason for this order                                                                                                                                                                                                                                                                                                                            | Work state |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 1     | [Core Concepts](../foundation/core-concepts.md); [Domain Model](../foundation/domain-model.md); [Campaign State](../foundation/campaign-state.md); [Game Data Records](../foundation/game-data-records.md); [Engine Contract](../foundation/engine-contract.md) | Agree on vocabulary, Types, four-property Campaign instances, archetypes and other Game Data Records (GDRs), mandatory Instance IDs, Campaign instance creation, relationships, Authoritative values in Campaign state, and boundaries before specifying behavior. Review the five documents as one batch, preserving the Accepted status of retained modeling rules. | In review  |
| 2     | [Numbers](../foundation/numbers.md); [Timeline](../foundation/timeline.md); [Saves](../foundation/saves.md); [Configuration](../foundation/configuration.md); [Autopilot](../foundation/autopilot.md)                                                           | Establish exact calculations, undo and redo, save and load, configuration, and Autopilot contracts before relying on them in mechanics.                                                                                                                                                                                                                               | Drafting   |
| 3     | [Agents](../mechanics/agents-spec.md); [Economy and Upgrades](../mechanics/economy-and-upgrades.md)                                                                                                                                                             | Define personnel availability, effectiveness, growth, resources, and purchases used by other mechanics.                                                                                                                                                                                                                                                               | Queued     |
| 4     | [Leads and Progression](../mechanics/leads-and-progression.md); [Investigations](../mechanics/investigations.md)                                                                                                                                                | Define the first major strategic game system, including precise progress, completion probabilities, player uncertainty, and commitment costs.                                                                                                                                                                                                                         | Queued     |
| 5     | [Combat](../mechanics/combat.md)                                                                                                                                                                                                                                | Define automatic battle resolution and its outputs. Present this for review before drafting the mission-consequence contract.                                                                                                                                                                                                                                         | Queued     |
| 6     | [Missions](../mechanics/missions.md); [Agent Recovery](../mechanics/agent-recovery.md)                                                                                                                                                                          | Translate Battle results into deployment outcomes, expiration, rewards, and damage-related partial success. Hold a separate review. Then define health and exhaustion recovery, which relies on when Agents return from Missions.                                                                                                                                     | Queued     |
| 7     | [Factions](../mechanics/factions.md); [Panic and Endings](../mechanics/panic-and-endings.md)                                                                                                                                                                    | Connect escalation, operations, panic, endings, and same-turn interactions into a coherent campaign loop.                                                                                                                                                                                                                                                             | Queued     |
| 8     | [Developer Access](../foundation/developer-access.md)                                                                                                                                                                                                           | Finalize Dev mode, full Campaign state inspection, cheat operations, and random outcome overrides once the mechanics they expose are defined.                                                                                                                                                                                                                         | Queued     |

The table is an authoring sequence, not a declaration that every referenced specification is already accepted. Some dependencies
are mutual. Drafts must identify unresolved dependencies explicitly rather than borrowing unstated rules from stubs.

# Work that grows alongside the batches

## Parallel GDR and acceptance work

Develop the following documents incrementally with the mechanics they support. They are part of the backlog,
not work postponed until after the interfaces.

Initial campaign scope and balance decisions are recorded as GDRs, not in a specification. Propose parameter values and GDRs
incrementally alongside each mechanic, then review the complete playable campaign after batch 7. Their later resolution
is scheduled work, not an unresolved decision about this work plan.

| Track      | Document                                                                                                | When and what to add                                                                                                                                                                                                                                                                           | Work state |
| ---------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Content    | GDRs; no specification                                                                                  | Add exact named parameters and small example GDRs as each mechanics specification needs them. Complete the playable campaign GDRs after batch 7 and review it explicitly.                                                                                                                      | Queued     |
| Acceptance | [Campaign Integration and Acceptance Tests](../acceptance/campaign-integration-and-acceptance-tests.md) | Add precise cross-system examples with each batch from batch 3, the first batch that defines gameplay. Batches 1 and 2 state their checks in each specification's own Acceptance examples. Review campaign-loop coverage after batch 7 and add API/CLI/web parity scenarios with batches 8–10. | Queued     |

## Early information and API boundaries

Batch 1 states the player-information boundary and the API capabilities needed to support it in Engine Contract:
[API hierarchy](../foundation/engine-contract.md#api-hierarchy) gives the required starter operation inventory, and
[Information boundary](../foundation/engine-contract.md#information-boundary) gives the boundary. Both are part of the
batch 1 deliverable and are reviewed with it. Extend the operation inventory with each mechanic; do not defer its
design influence until batch 8. Each Mechanics specification states its own Player-visible information as it is drafted.

## Incremental timing refinement

Refine turn timing and shared contracts as mechanics are drafted. [Turn Advancement](../foundation/turn-advancement.md) is the canonical order
of the rules applied during Advance turn. Each Mechanics specification places its turn rules in a step under
[Turn advancement steps](../foundation/turn-advancement.md#turn-advancement-steps), and a draft that contradicts that order is corrected to
match it.

# Review and completion workflow

## Batch workflow

For each authorized batch:

1. Inspect the brief, accepted dependencies, related drafts, and relevant game-ts code where useful.
2. Draft the contract using the accepted conventions. Clearly distinguish proposed rules from inherited behavior.
3. Add formulas, boundary cases, worked examples, and relevant updates to GDRs and scenarios.
4. Check internal consistency and cross-specification references. Identify unresolved dependencies and decisions.
5. Present a concise review summary: proposed behavior, departures from game-ts, trade-offs, open questions, and affected
   documents. Set the work state to In review; the specification remains Draft.
6. Pause before advancing to the next batch so the user can review. Incorporate feedback or follow explicit instructions
   to continue. Record acceptance only when it is explicitly given.

## Backlog updates

Update this backlog when drafting begins, a draft enters review, feedback requires revision, or a document is
accepted. Keep current
status summaries consistent with document metadata.

## Separate implementation authorization

Do not treat the completion of a draft or batch as authorization to implement game code. Implementation
scope and milestones are selected separately. Graphics, animation, and possible browser-based 3D specifications remain
deferred until those stages are requested.

# First implementation milestone assessment

After the batch 4 review, assess whether the accepted contracts support a small headless playable slice.
Propose its concrete scope and identify missing contracts, GDRs, or acceptance scenarios before implementation is
authorized. Do not assume completing batch 4 guarantees readiness, or that all 25 subject specifications must be accepted
before any implementation can begin. If contracts are missing, schedule their resolution before implementing the slice.

# Edge cases and failure behavior

## Earlier-specification gaps

If a later mechanic exposes a missing assumption in an earlier specification, identify the affected rule and propose a
revision in its owning document. Do not silently change Accepted rules or duplicate a workaround in another specification.

## Oversized batches

If a batch becomes too large to review comfortably, propose a split at a coherent contract boundary and
record it here. Partial acceptance does not accept the remaining documents or implicitly resolve their open decisions.

## Unresolved dependencies

If a draft depends on unresolved GDRs or rules, label the dependency and its impact. Explicitly scoped
example fixtures can illustrate a proposal, but must not masquerade as the final campaign configuration. An unresolved
implementation-affecting dependency prevents acceptance of the affected contract.

If review feedback changes priorities, update the backlog and explain affected dependencies. Existing drafts remain
available for revision; a change in order alone does not invalidate their content.

# Acceptance examples

These are workflow checks, not gameplay tests:

- **First review ([Batch sequence](#batch-sequence), [Early information and API boundaries](#early-information-and-api-boundaries), [Batch workflow](#batch-workflow)):** Presenting newly drafted batch 1 material sets that material to
  Draft and batch 1 to In review; reorganizing an existing Accepted contract preserves its Accepted status. The starter operation inventory and Information boundary in Engine Contract do not imply that the batch 8 contracts are
  complete. The next batch does not begin without the review opportunity or an explicit instruction to continue.
- **Requested revision ([Batch workflow](#batch-workflow), [Backlog updates](#backlog-updates)):** Feedback requests a different model for Agents and Current assignments. Batch 1 remains
  In review while affected notes and examples are updated.
- **Separate combat/mission checkpoints ([Batch sequence](#batch-sequence), [Oversized batches](#oversized-batches)):** Accepting Combat completes batch 5, not batch 6. The damage-related
  campaign benefit of a failed mission remains a Missions decision.
- **Incremental GDRs ([Parallel GDR and acceptance work](#parallel-gdr-and-acceptance-work), [Unresolved dependencies](#unresolved-dependencies)):** Drafting Investigations adds its parameters as GDRs and
  relevant multi-turn scenarios. This does not mark the entire GDR catalog or scenario suite Accepted.
- **Later conflict ([Earlier-specification gaps](#earlier-specification-gaps)):** A mission rule conflicts with an Accepted Timeline rule. The discrepancy is documented and
  a revision is proposed to the owner; neither implementation nor a second specification silently overrides the accepted rule.
- **Milestone assessment ([Separate implementation authorization](#separate-implementation-authorization), [First implementation milestone assessment](#first-implementation-milestone-assessment)):** After batch 4 is reviewed, assess the accepted contracts for a headless
  slice. If its required turn timing or API contract is unresolved, list the gap and propose the necessary specification
  work; do not invent the missing rule in code or treat the assessment as implementation authorization.
