# Specification Work Plan and Backlog

| Metadata    | Value                                                                 |
| ----------- | --------------------------------------------------------------------- |
| Spec ID     | PLAN                                                                  |
| Family      | Process                                                               |
| Audience    | Engine designer                                                       |
| Owns        | Specification authoring order, review checkpoints, and work tracking. |
| Conventions | [Specification Conventions](../conventions/spec-conventions.md)       |

> **Stale — needs update.** The work states below were last updated before specification Status (Stub, Draft, Accepted) was removed. Do not follow them until this plan is rewritten.

# Overview

The game is specified a few related documents at a time rather than all at once, so that each decision is reviewed before later ones build on it. The [Game Design Brief](../../../game-design-brief.md) supplies the strategic intent and architectural constraints.

The work is divided into eight Batches, each a bounded set of related specifications with one review checkpoint at its end. The order follows reliance: shared vocabulary and contracts come before the mechanics built on them.

# Glossary

| Term | Definition |
| --- | --- |
| Batch | A bounded set of related [specifications](../conventions/spec-conventions.md#specifications) with one review checkpoint at its end. At that checkpoint, the user can accept the drafts, request revisions, or change direction. Feedback and revised drafts remain part of the same checkpoint until resolved; they do not create additional checkpoints. Combat and Missions are separate batches. |

# Work tracking

Each Batch has a work state, which says how far its review has come.

| Work state | Meaning |
| --- | --- |
| Queued | Planned, but substantive drafting has not started. |
| Drafting | A draft is being written; do not imply acceptance. |
| In review | Drafts have been presented; feedback and any resulting revisions are being handled. |
| Complete | The listed deliverable has been explicitly accepted by the [Game designer](../conventions/spec-conventions.md#participants). |

Work remains In review while feedback is incorporated and revised drafts are reviewed. For a multi-document batch, record partial completion explicitly instead of marking the whole batch Complete; partial acceptance does not accept the remaining documents. Update this backlog when a work state changes or review feedback changes priorities.

# Review sequence and backlog

The review sequence fixes the order in which specifications are reviewed, so that each Batch can rely on the Batches reviewed before it.

## Batch sequence

If review reveals a better grouping, e.g. a batch too large to review comfortably, propose the change explicitly and update this table when agreed rather than silently changing the order. Batches 3 to 7 are presented together as one checkpoint instead of one checkpoint per batch.

| Batch | Specifications | Review objective and reason for this order | Work state |
| --- | --- | --- | --- |
| 1 | [Core Concepts](../../design/foundation/core-concepts.md); [Domain Model](../../design/mechanics/domain-model.md); [Campaign State](../../design/foundation/campaign-state.md); [Game Data Records](../../design/foundation/game-data-records.md); [Engine Contract](../../design/foundation/engine-contract.md) | Agree on vocabulary, [Types](../../design/foundation/core-concepts.md#data-modeling), four-property [Campaign instances](../../design/foundation/core-concepts.md#campaign-instances), archetypes and other Game Data Records ([GDRs](../../design/foundation/core-concepts.md#game-build-and-content)), mandatory [Instance IDs](../../design/foundation/campaign-instances.md#glossary), Campaign instance creation, relationships, [Authoritative values](../../design/foundation/core-concepts.md#value-classification) in [Campaign state](../../design/foundation/core-concepts.md#campaign-and-session), and boundaries before specifying behavior. Review the five documents as one batch. | In review |
| 2 | [Numbers](../../design/foundation/numbers.md); [Timeline](../../design/foundation/timeline.md); [Saves](../../design/foundation/saves.md); [Configuration](../../design/foundation/configuration.md); [Autopilot](../../design/foundation/autopilot.md) | Establish exact calculations, undo and redo, save and load, configuration, and [Autopilot](../../design/foundation/engine-contract.md#autopilot) contracts before relying on them in mechanics. | Drafting |
| 3 | [Agents](../../design/mechanics/agents-spec.md); [Economy and Upgrades](../../design/mechanics/economy-and-upgrades.md) | Define personnel availability, effectiveness, growth, resources, and purchases used by other mechanics. | In review |
| 4 | [Leads and Progression](../../design/mechanics/leads-and-progression.md); [Investigations](../../design/mechanics/investigations.md) | Define the first major strategic game system, including precise progress and completion probabilities. | In review |
| 5 | [Combat](../../design/mechanics/combat.md) | Define automatic [Combat](../../design/mechanics/domain-model.md#combat) resolution and its outputs. Present this for review before drafting the mission-consequence contract. | In review |
| 6 | [Missions](../../design/mechanics/missions.md); [Agent Recovery](../../design/mechanics/agent-recovery.md) | Translate [Combat reports](../../design/mechanics/domain-model.md#combat) into [Mission site](../../design/mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) outcomes, expiration, and rewards; partial success and [Faction](../../design/mechanics/domain-model.md#factions) suppression are `TODO (later):` items of Missions. Hold a separate review. Then define health and [exhaustion](../../design/mechanics/agents-spec.md#combatant-attributes) recovery, which relies on when Agents return from Missions. | In review |
| 7 | [Factions](../../design/mechanics/factions.md); [Panic and Endings](../../design/mechanics/panic-and-endings.md) | Connect escalation, operations, panic, endings, and same-turn interactions into a coherent campaign loop. | In review |
| 8 | [Developer Access](../../design/foundation/developer-access.md) | Finalize [Dev mode](../../design/foundation/engine-contract.md#principals-and-access), full Campaign state inspection, [Player cheat actions](../../design/foundation/engine-contract.md#player-actions-and-turns), and random outcome overrides once the mechanics they expose are defined. | Queued |

Graphics, animation, and possible 3D presentation specifications are not written until those stages are requested.

## Parallel GDR work

The game data cannot wait for a Batch of its own, because each mechanic needs it as soon as it is drafted.

| Track | Document | When and what to add | Work state |
| --- | --- | --- | --- |
| Content | GDRs; no specification | Add exact named parameters and small example GDRs as each mechanics specification needs them. Complete the playable campaign GDRs after batch 7 and review it explicitly. | Queued |
