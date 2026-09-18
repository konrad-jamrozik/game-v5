# History and Persistence

| Metadata    | Value                                                                            |
| ----------- | -------------------------------------------------------------------------------- |
| Spec ID     | HIST                                                                             |
| Family      | Foundation                                                                       |
| Status      | Stub                                                                             |
| Scope       | Define reversible sessions, reproducible replay, and durable save/load behavior. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                   |

> This is a scoped outline, not an accepted implementation contract. TODOs must be resolved before acceptance.

# Purpose and boundaries

Define reversible sessions, reproducible replay, and durable save/load behavior.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

# Relationships

## Dependencies

| Dependency                                            | Relationship | Scope                                                                                                 |
| ----------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------- |
| [Modeling Foundations](./modeling-foundations.md)     | `refines`    | Storage and restoration details for identity, references, and historical preservation (MODEL-002–004) |
| [Engine Contract](./engine-contract.md)               | `refines`    | Session continuation, restoration, and committed-state integrity (ENG-001/002/004)                    |
| [Domain Model](./domain-model.md)                     | `uses`       | Campaign entities, references, and structural invariants restored by history operations               |
| [Numbers and Randomness](./numbers-and-randomness.md) | `uses`       | RNG and ID-generation state required for replay and restoration                                       |

## Dependents

| Dependent                                                                                               | Relationship | Scope                                                                       |
| ------------------------------------------------------------------------------------------------------- | ------------ | --------------------------------------------------------------------------- |
| [Campaign Integration and Acceptance Tests](../acceptance/campaign-integration-and-acceptance-tests.md) | `uses`       | Replay, save/load, undo/redo, branching, and restored-state fixtures        |
| [Developer API](../interfaces/developer-api.md)                                                         | `uses`       | Snapshot, restoration, replay, and debug-mutation history behavior          |
| [Player Information](../interfaces/player-information.md)                                               | `uses`       | Historical observations, reports, undo, and restored knowledge              |
| [Terminal CLI](../interfaces/cli.md)                                                                    | `uses`       | Save/load, undo/redo, branching, and session behavior                       |
| [TypeScript Player API](../interfaces/typescript-api.md)                                                | `uses`       | Session lifecycle, persistence, undo/redo, branching, and stale handles     |
| [Web UI](../interfaces/web-ui.md)                                                                       | `uses`       | Timeline navigation, undo/redo, restored observations, and session behavior |

# Glossary

TODO: Define the local terms here or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

# Concepts and contract

## Session

**Draft definition migrated from Domain Model:** Session is the owner of current campaign state, history navigation,
and any controller state that must follow that history, such as persistent AI strategy memory. This definition does
not resolve the storage/restoration TODOs below or promote this specification from Stub.

## Remaining contract details

TODO: Specify session storage/restoration, snapshot, history entry, cursor, redo continuation, command log, save format, and version.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Requirements

## Undo and redo

TODO: Specify atomic history boundaries, restored fields including RNG/IDs/reports, new-command branching, rejected/no-op actions, and history limits. Preserve the brief's absence of an additional rewind penalty.

## Replay and persistence

TODO: Define save contents, encoding, load validation, and replay inputs for the current game build. Incompatible saves
from earlier builds may be rejected or discarded; backward compatibility is out of scope during intensive development.
Decide whether saves retain undo and redo history.

## Session-owned state

TODO: Separate game state, UI preferences, debug operations, and AI memory. Define restoration or invalidation of strategy memory and cached observations.

TODO: Assign stable HIST-NNN requirement IDs when concrete rules replace these placeholders.

# Edge cases and failure behavior

TODO: Define behavior for Undo at the beginning, redo at the end, branching after undo, save/load with a redo continuation, incompatible/corrupt saves, and campaign endings.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

# Acceptance examples

TODO: Specify command/undo/redo and save/load round trips, including generated IDs, hidden state, and reports.
Identify initial conditions, inputs/actions, expected results, and the requirement IDs exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Choose history retention, serialization, compatibility policy, and how debug changes affect replay.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
