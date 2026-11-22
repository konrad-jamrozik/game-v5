# Specification Work Plan and Backlog

| Metadata    | Value                                                                 |
| ----------- | --------------------------------------------------------------------- |
| Spec ID     | PLAN                                                                  |
| Family      | Process                                                               |
| Audience    | Engine designer                                                       |
| Owns        | Specification authoring order, review checkpoints, and work tracking. |
| Conventions | [Specification Conventions](../conventions/spec-conventions.md)       |

> **Stale — needs update.** This plan predates the removal of specification Status (Stub, Draft, Accepted) and still describes Batches, work states, and current progress in terms of accepting specifications. Do not follow it until it is rewritten.

# Overview

The game is specified a few related documents at a time rather than all at once, so that each decision is reviewed before later ones build on it. The specifications are the durable design, and code and tests are derived from accepted contracts, so the work planned here is writing specifications, not implementing them. The [Game Design Brief](../../../game-design-brief.md) supplies the strategic intent and architectural constraints.

The work is divided into eight Batches, each a bounded set of related specifications with one review checkpoint at its end. The order follows reliance: shared vocabulary and contracts come before the mechanics built on them. Work states track progress separately from the Status of each document, which the [derived specification catalog](../../../derived/README.md) lists.

**Current work:** Batch 1 is partially complete. [Core Concepts](../../design/foundation/core-concepts.md), [Campaign State](../../design/foundation/campaign-state.md), and [Engine Contract](../../design/foundation/engine-contract.md) are Accepted, while [Game Data Records](../../design/foundation/game-data-records.md) and [Domain Model](../../design/mechanics/domain-model.md) are **In review**. Batch 2 is Drafting: [Numbers](../../design/foundation/numbers.md) is a complete Draft, and none of its specifications has been presented for review. Batches 3 to 7 are **In review** as one checkpoint; Batch 8 has not started.

# Glossary

| Term | Definition |
| --- | --- |
| Batch | A bounded set of related [specifications](../conventions/spec-conventions.md#specifications) with one review checkpoint at its end. At that checkpoint, the user can accept the drafts, request revisions, or change direction. Feedback and revised drafts remain part of the same checkpoint until resolved; they do not create additional checkpoints. Combat and Missions are separate batches. |

# Work tracking

Track work separately from document status:

| Work state | Meaning                                                                             |
| ---------- | ----------------------------------------------------------------------------------- |
| Queued     | Planned, but substantive drafting has not started.                                  |
| Drafting   | A draft is being written; do not imply acceptance.                                  |
| In review  | Drafts have been presented; feedback and any resulting revisions are being handled. |
| Complete   | The listed deliverable has been explicitly accepted by the project owner.           |

Document metadata remains authoritative for Stub, Draft, Accepted, and Superseded status. Work remains In review while feedback is incorporated and revised drafts are reviewed. For a multi-document batch, record partial completion explicitly instead of marking the whole batch Complete.

# Current baseline

The current baseline records where the work stands, so that the next checkpoint starts from an agreed state.

- Batch 1 is In review, with three of its five specifications Accepted. Batch 2 is Drafting: all five of its specifications are Draft, Numbers is complete, and none has been presented for review. Batches 3 to 7 are In review: their specifications are complete Drafts, presented together as one checkpoint instead of one checkpoint per batch. Batch 8 is Queued.
- The 8-batch sequence has been selected and later changes must be explicit.
- No [implementation](../conventions/spec-conventions.md#artifacts) milestones or delivery dates have been committed.

# Specification references

References between specifications are derived from the links from each term to its definition, under [Artifact Relationships](../conventions/artifact-relationships.md), and `npm run lint:specs` rejects a cycle among them. Earlier hand-written relationship inventories and the cycle register they needed are retired. This work does not advance mechanics review batches.

# Review sequence and backlog

The review sequence fixes the order in which specifications are drafted and reviewed, so that each Batch can rely on the Batches reviewed before it.

## Batch sequence

Use the following 8-batch sequence, starting with Core Concepts, Engine Contract, Campaign State, Game Data Records, and Domain Model. If review reveals a better grouping, propose the change explicitly and update this table when agreed rather than silently changing the order.

| Batch | Specifications | Review objective and reason for this order | Work state |
| --- | --- | --- | --- |
| 1 | [Core Concepts](../../design/foundation/core-concepts.md); [Domain Model](../../design/mechanics/domain-model.md); [Campaign State](../../design/foundation/campaign-state.md); [Game Data Records](../../design/foundation/game-data-records.md); [Engine Contract](../../design/foundation/engine-contract.md) | Agree on vocabulary, [Types](../../design/foundation/core-concepts.md#data-modeling), four-property [Campaign instances](../../design/foundation/core-concepts.md#campaign-instances), archetypes and other Game Data Records ([GDRs](../../design/foundation/core-concepts.md#game-build-and-content)), mandatory [Instance IDs](../../design/foundation/campaign-instances.md#glossary), Campaign instance creation, relationships, [Authoritative values](../../design/foundation/core-concepts.md#value-classification) in [Campaign state](../../design/foundation/core-concepts.md#campaign-and-session), and boundaries before specifying behavior. Review the five documents as one batch, preserving the Accepted status of [retained](../../design/foundation/world-history.md#glossary) modeling rules. | In review |
| 2 | [Numbers](../../design/foundation/numbers.md); [Timeline](../../design/foundation/timeline.md); [Saves](../../design/foundation/saves.md); [Configuration](../../design/foundation/configuration.md); [Autopilot](../../design/foundation/autopilot.md) | Establish exact calculations, undo and redo, save and load, configuration, and [Autopilot](../../design/foundation/engine-contract.md#autopilot) contracts before relying on them in mechanics. | Drafting |
| 3 | [Agents](../../design/mechanics/agents-spec.md); [Economy and Upgrades](../../design/mechanics/economy-and-upgrades.md) | Define personnel availability, effectiveness, growth, resources, and purchases used by other mechanics. | In review |
| 4 | [Leads and Progression](../../design/mechanics/leads-and-progression.md); [Investigations](../../design/mechanics/investigations.md) | Define the first major strategic game system, including precise progress and completion probabilities. | In review |
| 5 | [Combat](../../design/mechanics/combat.md) | Define automatic [Combat](../../design/mechanics/domain-model.md#combat) resolution and its outputs. Present this for review before drafting the mission-consequence contract. | In review |
| 6 | [Missions](../../design/mechanics/missions.md); [Agent Recovery](../../design/mechanics/agent-recovery.md) | Translate [Combat reports](../../design/mechanics/domain-model.md#combat) into [Mission site](../../design/mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) outcomes, expiration, and rewards; partial success and [Faction](../../design/mechanics/domain-model.md#factions) suppression are `TODO (later):` items of Missions. Hold a separate review. Then define health and [exhaustion](../../design/mechanics/agents-spec.md#combatant-attributes) recovery, which relies on when Agents return from Missions. | In review |
| 7 | [Factions](../../design/mechanics/factions.md); [Panic and Endings](../../design/mechanics/panic-and-endings.md) | Connect escalation, operations, panic, endings, and same-turn interactions into a coherent campaign loop. | In review |
| 8 | [Developer Access](../../design/foundation/developer-access.md) | Finalize [Dev mode](../../design/foundation/engine-contract.md#principals-and-access), full Campaign state inspection, [Player cheat actions](../../design/foundation/engine-contract.md#player-actions-and-turns), and random outcome overrides once the mechanics they expose are defined. | Queued |

The table is an authoring sequence, not a declaration that every referenced specification is already accepted. Some dependencies are mutual. Drafts must identify unresolved dependencies explicitly rather than borrowing unstated rules from stubs.

# Work that grows alongside the batches

Some work cannot wait for a Batch of its own, because each mechanic needs it as soon as it is drafted.

## Parallel GDR work

Develop the following work incrementally with the mechanics they support. They are part of the backlog, not work postponed until after the interfaces.

Initial campaign scope and balance decisions are recorded as GDRs, not in a specification. Propose parameter values and GDRs incrementally alongside each mechanic, then review the complete playable campaign after batch 7. Their later resolution is scheduled work, not an unresolved decision about this work plan.

| Track | Document | When and what to add | Work state |
| --- | --- | --- | --- |
| Content | GDRs; no specification | Add exact named parameters and small example GDRs as each mechanics specification needs them. Complete the playable campaign GDRs after batch 7 and review it explicitly. | Queued |

## Early information and API boundaries

Batch 1 states the player-information boundary and the API capabilities needed to support it in Engine Contract and [Player API](../../design/foundation/engine-contract.md#api-surfaces): [API hierarchy](../../design/foundation/engine-contract.md#api-hierarchy) gives the required starter operation inventory, and [Information boundary](../../design/foundation/player-api.md#information-boundary) gives the boundary. Both are part of the batch 1 deliverable and are reviewed with it. Extend the operation inventory with each mechanic; do not postpone its design influence until batch 8. Each Mechanics specification states its own [Player-visible information](../../design/foundation/engine-contract.md#api-surfaces) as it is drafted.

## Incremental timing refinement

Refine [Turn](../../design/foundation/engine-contract.md#player-actions-and-turns) timing and shared contracts as mechanics are drafted. [Turn Advancement](../../design/mechanics/turn-advancement.md) is the canonical order of the rules applied during Advance turn. Each Mechanics specification places its Turn rules in a step under [Turn advancement steps](../../design/mechanics/turn-advancement.md#turn-advancement-steps), and a draft that contradicts that order is corrected to match it.

# Review and completion workflow

Each Batch moves from drafting to review to acceptance in the same way, so that nothing is treated as accepted, or as authorization to implement, before the user says so.

## Batch workflow

For each authorized batch:

1. Inspect the brief, accepted dependencies, and related drafts.
2. Draft the contract using the accepted conventions. Record where a rule is taken from the inherited game in an Informative rationale.
3. Add formulas, boundary cases, worked examples, and relevant updates to GDRs.
4. Check internal consistency and cross-specification references. Identify unresolved dependencies and decisions.
5. Present a concise review summary: proposed behavior, trade-offs, open questions, and affected documents. Set the work state to In review; the specification remains Draft.
6. Pause before advancing to the next batch so the user can review. Incorporate feedback or follow explicit instructions to continue. Record acceptance only when it is explicitly given.

## Backlog updates

Update this backlog when drafting begins, a draft enters review, feedback requires revision, or a document is accepted. Keep current status summaries consistent with document metadata.

## Separate implementation authorization

Do not treat the completion of a draft or batch as authorization to implement game code. Implementation scope and milestones are selected separately. Graphics, animation, and possible 3D presentation specifications are not written until those stages are requested.

# First implementation milestone assessment

After the batch 4 review, assess whether the accepted contracts support a small headless playable slice. Propose its concrete scope and identify missing contracts or GDRs before implementation is authorized. Do not assume completing batch 4 guarantees readiness, or that all 25 subject specifications must be accepted before any implementation can begin. If contracts are missing, schedule their resolution before implementing the slice.

# Edge cases and failure behavior

## Earlier-specification gaps

If a later mechanic exposes a missing assumption in an earlier specification, identify the affected rule and propose a revision in that earlier specification. Do not silently change Accepted rules or duplicate a workaround in another specification.

## Oversized batches

If a batch becomes too large to review comfortably, propose a split at a coherent contract boundary and record it here. Partial acceptance does not accept the remaining documents or implicitly resolve their TODOs.

## Unresolved dependencies

If a draft depends on unresolved GDRs or rules, label the dependency and its impact. Explicitly scoped example fixtures can illustrate a proposal, but must not masquerade as the final campaign configuration. An unresolved implementation-affecting dependency prevents acceptance of the affected contract.

If review feedback changes priorities, update the backlog and explain affected dependencies. Existing drafts remain available for revision; a change in order alone does not invalidate their content.
