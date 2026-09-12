# TypeScript Player API

| Metadata    | Value                                                                                        |
| ----------- | -------------------------------------------------------------------------------------------- |
| Spec ID     | API                                                                                          |
| Status      | Stub                                                                                         |
| Scope       | Define the callable TypeScript contract through which humans and AI can fully play the game. |
| Conventions | [Specification conventions](../spec-conventions.md)                                          |

> This is a scoped outline, not an accepted implementation contract. TODOs must be resolved before acceptance.

# Purpose and boundaries

Define the callable TypeScript contract through which humans and AI can fully play the game.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

# Relationships

## Dependencies

| Dependency                                                          | Relationship | Scope                                                                                     |
| ------------------------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------- |
| [Engine Contract](../foundation/engine-contract.md)                 | `refines`    | Callable query, information, continuation, and command-integrity guarantees (ENG-001–004) |
| [Modeling Foundations](../foundation/modeling-foundations.md)       | `uses`       | Identity, typed-reference, and historical-fact semantics (MOD-002–004)                    |
| [Domain Model](../foundation/domain-model.md)                       | `uses`       | Campaign entities, relationships, identifiers, and structural invariants                  |
| [History and Persistence](../foundation/history-and-persistence.md) | `uses`       | Session lifecycle, persistence, undo/redo, branching, and stale handles                   |
| [Player Information](./player-information.md)                       | `uses`       | Observation shapes, reveal conditions, action discovery, reports, and errors              |

## Dependents

| Dependent                                                                                            | Relationship | Scope                                                                       |
| ---------------------------------------------------------------------------------------------------- | ------------ | --------------------------------------------------------------------------- |
| [Campaign Integration and Acceptance Tests](../testing/campaign-integration-and-acceptance-tests.md) | `uses`       | Primary integration-test actions, observations, results, and errors         |
| [Developer API](./developer-api.md)                                                                  | `uses`       | Separation from ordinary player capabilities, observations, and errors      |
| [Terminal CLI](./cli.md)                                                                             | `uses`       | Session lifecycle, action discovery, queries, commands, results, and errors |
| [Web UI](./web-ui.md)                                                                                | `uses`       | Queries, action discovery, commands, results, refresh, and errors           |

# Glossary

TODO: Define the local terms here or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

# Concepts and contract

TODO: Specify Game/session handle, observation, command arguments, action discovery, validation result, structured error, and state revision.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Requirements

## Functions and types

TODO: Specify exact public signatures for session lifecycle, queries, discovery, commands, results, and history. Clarify sync/async behavior; this API does not inherently require HTTP.

## Command semantics

TODO: Specify eligibility, atomic batch behavior, invalid/stale inputs, no-op handling, returned effects, and whether validation can be queried independently. Reference mechanic rules rather than reimplementing them.

## Client boundaries

TODO: Define observation immutability, API compatibility, data refresh behavior, and how callers persist sessions without obtaining dev-only gameplay information. Keep framework and AI-strategy dependencies out.

TODO: Assign stable API-NNN requirement IDs when concrete rules replace these placeholders.

# Edge cases and failure behavior

TODO: Define behavior for Invalid/unknown identifiers, duplicate agent selections, empty batches, repeated commands, stale views, and operations after campaign end.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

# Acceptance examples

TODO: Provide a typed play sequence from creation through action discovery, investigation, turn advancement, report reading, and undo/redo.
Identify initial conditions, inputs/actions, expected results, and the requirement IDs exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Choose signatures, error codes, session ownership, concurrency/revision handling, and sync/async semantics.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
