# History and Persistence

| Metadata    | Value                                                                            |
| ----------- | -------------------------------------------------------------------------------- |
| Spec ID     | HIST                                                                             |
| Status      | Stub                                                                             |
| Scope       | Define reversible sessions, reproducible replay, and durable save/load behavior. |
| Conventions | [Specification conventions](../spec-conventions.md)                              |

> This is a scoped outline, not an accepted implementation contract. TODOs must be resolved before acceptance.

## 1. Purpose and boundaries

Define reversible sessions, reproducible replay, and durable save/load behavior.

TODO: Confirm the precise included/excluded scope and rule ownership using the [design stem](../../game-design-stem.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

## 2. Dependencies and terminology

- [Domain Model](domain-model.md): TODO: Identify the specific owned contracts referenced here and classify each dependency as normative or background.
- [Numbers and Randomness](numbers-and-randomness.md): TODO: Identify the specific owned contracts referenced here and classify each dependency as normative or background.

TODO: Define the local terms below or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

## 3. Concepts and contract

TODO: Specify Session, snapshot, history entry, cursor, redo continuation, command log, save format, and version.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

## 4. Requirements

### Undo and redo

TODO: Specify atomic history boundaries, restored fields including RNG/IDs/reports, new-command branching, rejected/no-op actions, and history limits. Preserve the stem's absence of an additional rewind penalty.

### Replay and persistence

TODO: Define save contents, encoding, rules/content version references, load validation, replay inputs, and mismatch behavior. Decide whether saves retain undo and redo history.

### Session-owned state

TODO: Separate game state, UI preferences, debug operations, and AI memory. Define restoration or invalidation of strategy memory and cached observations.

TODO: Assign stable HIST-NNN requirement IDs when concrete rules replace these placeholders.

## 5. Edge cases and failure behavior

TODO: Define behavior for Undo at the beginning, redo at the end, branching after undo, save/load with a redo continuation, incompatible/corrupt saves, and campaign endings.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

## 6. Acceptance examples

TODO: Specify command/undo/redo and save/load round trips, including generated IDs, hidden state, and reports.
Identify initial conditions, inputs/actions, expected results, and the requirement IDs exercised. Reference shared
fixtures instead of introducing implicit balance values.

## 7. Open decisions

- TODO: Choose history retention, serialization, compatibility policy, and how debug changes affect replay.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
