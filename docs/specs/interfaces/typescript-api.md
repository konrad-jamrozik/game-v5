# TypeScript Player API

| Metadata    | Value                                                                                        |
| ----------- | -------------------------------------------------------------------------------------------- |
| Spec ID     | API                                                                                          |
| Status      | Stub                                                                                         |
| Scope       | Define the callable TypeScript contract through which humans and AI can fully play the game. |
| Conventions | [Specification conventions](../spec-conventions.md)                                          |

> This is a scoped outline, not an accepted implementation contract. TODOs must be resolved before acceptance.

## 1. Purpose and boundaries

Define the callable TypeScript contract through which humans and AI can fully play the game.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

## 2. Dependencies and terminology

### Relationships

| Type      | Target                                                              | Scope                                                                                     |
| --------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `refines` | [Engine Contract](../foundation/engine-contract.md)                 | Callable query, information, continuation, and command-integrity guarantees (ENG-001–004) |
| `uses`    | [Modeling Foundations](../foundation/modeling-foundations.md)       | Identity, typed-reference, and historical-fact semantics (MOD-002–004)                    |
| `uses`    | [Domain Model](../foundation/domain-model.md)                       | Campaign entities, relationships, identifiers, and structural invariants                  |
| `uses`    | [History and Persistence](../foundation/history-and-persistence.md) | Session lifecycle, persistence, undo/redo, branching, and stale handles                   |
| `uses`    | [Player Information](player-information.md)                         | Observation shapes, reveal conditions, action discovery, reports, and errors              |

TODO: Define the local terms below or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

## 3. Concepts and contract

TODO: Specify Game/session handle, observation, command arguments, action discovery, validation result, structured error, and state revision.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

## 4. Requirements

### Functions and types

TODO: Specify exact public signatures for session lifecycle, queries, discovery, commands, results, and history. Clarify sync/async behavior; this API does not inherently require HTTP.

### Command semantics

TODO: Specify eligibility, atomic batch behavior, invalid/stale inputs, no-op handling, returned effects, and whether validation can be queried independently. Reference mechanic rules rather than reimplementing them.

### Client boundaries

TODO: Define observation immutability, API compatibility, data refresh behavior, and how callers persist sessions without obtaining dev-only gameplay information. Keep framework and AI-strategy dependencies out.

TODO: Assign stable API-NNN requirement IDs when concrete rules replace these placeholders.

## 5. Edge cases and failure behavior

TODO: Define behavior for Invalid/unknown identifiers, duplicate agent selections, empty batches, repeated commands, stale views, and operations after campaign end.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

## 6. Acceptance examples

TODO: Provide a typed play sequence from creation through action discovery, investigation, turn advancement, report reading, and undo/redo.
Identify initial conditions, inputs/actions, expected results, and the requirement IDs exercised. Reference shared
fixtures instead of introducing implicit balance values.

## 7. Open decisions

- TODO: Choose signatures, error codes, session ownership, concurrency/revision handling, and sync/async semantics.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
