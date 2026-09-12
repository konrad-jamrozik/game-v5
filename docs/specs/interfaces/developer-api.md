# Developer API

| Metadata    | Value                                                                                   |
| ----------- | --------------------------------------------------------------------------------------- |
| Spec ID     | DEV                                                                                     |
| Status      | Stub                                                                                    |
| Scope       | Expose full authoritative state for debugging through a separate, explicit API surface. |
| Conventions | [Specification conventions](../spec-conventions.md)                                     |

> This is a scoped outline, not an accepted implementation contract. TODOs must be resolved before acceptance.

# Purpose and boundaries

Expose full authoritative state for debugging through a separate, explicit API surface.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

# Relationships

## Dependencies

| Dependency                                                          | Relationship | Scope                                                                  |
| ------------------------------------------------------------------- | ------------ | ---------------------------------------------------------------------- |
| [Engine Contract](../foundation/engine-contract.md)                 | `refines`    | Separate developer inspection and enablement boundary (ENG-003)        |
| [Domain Model](../foundation/domain-model.md)                       | `uses`       | Authoritative campaign state, hidden facts, and structural invariants  |
| [History and Persistence](../foundation/history-and-persistence.md) | `uses`       | Snapshot, restoration, replay, and debug-mutation history behavior     |
| [TypeScript Player API](./typescript-api.md)                        | `uses`       | Separation from ordinary player capabilities, observations, and errors |

## Dependents

None.

# Glossary

TODO: Define the local terms here or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

# Concepts and contract

TODO: Specify Developer capability, full-state inspection, hidden state, debugging operation, snapshot, and validation.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Requirements

## Inspection contract

TODO: Specify full-state inspection including hidden difficulty, RNG state, IDs, and other internal campaign facts. Define read-only/copy behavior and separation from player observations.

## Optional debugging controls

TODO: Decide which mutation, scenario setup, random override, or stepping controls are supported, if any. Do not treat their existence as already approved gameplay features.

## Isolation and history

TODO: Specify how dev access is obtained, how ordinary callers remain independent of it, and how any debug mutation affects invariants, history, saves, and replay guarantees.

TODO: Assign stable DEV-NNN requirement IDs when concrete rules replace these placeholders.

# Edge cases and failure behavior

TODO: Define behavior for Player attempts to use developer functions, malformed debug state, inspection during resolution, and debug changes followed by undo/replay.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

# Acceptance examples

TODO: Provide separate player/dev access examples and tests proving the player API does not expose dev fields.
Identify initial conditions, inputs/actions, expected results, and the requirement IDs exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Choose dev enablement and whether any state-mutating debug controls are needed.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
