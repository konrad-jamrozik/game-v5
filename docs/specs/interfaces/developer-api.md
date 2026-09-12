# Developer API

| Metadata    | Value                                                                                   |
| ----------- | --------------------------------------------------------------------------------------- |
| Spec ID     | DEV                                                                                     |
| Status      | Stub                                                                                    |
| Scope       | Expose full authoritative state for debugging through a separate, explicit API surface. |
| Conventions | [Specification conventions](../spec-conventions.md)                                     |

> This is a scoped outline, not an accepted implementation contract. TODOs must be resolved before acceptance.

## 1. Purpose and boundaries

Expose full authoritative state for debugging through a separate, explicit API surface.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

## 2. Dependencies and terminology

### Relationships

| Type      | Target                                                              | Scope                                                                  |
| --------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `refines` | [Engine Contract](../foundation/engine-contract.md)                 | Separate developer inspection and enablement boundary (ENG-003)        |
| `uses`    | [Domain Model](../foundation/domain-model.md)                       | Authoritative campaign state, hidden facts, and structural invariants  |
| `uses`    | [History and Persistence](../foundation/history-and-persistence.md) | Snapshot, restoration, replay, and debug-mutation history behavior     |
| `uses`    | [TypeScript Player API](typescript-api.md)                          | Separation from ordinary player capabilities, observations, and errors |

TODO: Define the local terms below or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

## 3. Concepts and contract

TODO: Specify Developer capability, full-state inspection, hidden state, debugging operation, snapshot, and validation.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

## 4. Requirements

### Inspection contract

TODO: Specify full-state inspection including hidden difficulty, RNG state, IDs, and other internal campaign facts. Define read-only/copy behavior and separation from player observations.

### Optional debugging controls

TODO: Decide which mutation, scenario setup, random override, or stepping controls are supported, if any. Do not treat their existence as already approved gameplay features.

### Isolation and history

TODO: Specify how dev access is obtained, how ordinary callers remain independent of it, and how any debug mutation affects invariants, history, saves, and replay guarantees.

TODO: Assign stable DEV-NNN requirement IDs when concrete rules replace these placeholders.

## 5. Edge cases and failure behavior

TODO: Define behavior for Player attempts to use developer functions, malformed debug state, inspection during resolution, and debug changes followed by undo/replay.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

## 6. Acceptance examples

TODO: Provide separate player/dev access examples and tests proving the player API does not expose dev fields.
Identify initial conditions, inputs/actions, expected results, and the requirement IDs exercised. Reference shared
fixtures instead of introducing implicit balance values.

## 7. Open decisions

- TODO: Choose dev enablement and whether any state-mutating debug controls are needed.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
