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

- Uses [Domain Model](./domain-model.md)
- Uses [Modeling Foundations](./modeling-foundations.md)
- Uses [Numbers and Randomness](./numbers-and-randomness.md)
- Refines [Engine Contract](./engine-contract.md)
- Used by [Campaign Integration and Acceptance Tests](../acceptance/campaign-integration-and-acceptance-tests.md)
- Used by [Developer API](../interfaces/developer-api.md)
- Used by [Player Information](../interfaces/player-information.md)
- Used by [Terminal CLI](../interfaces/cli.md)
- Used by [TypeScript Player API](../interfaces/typescript-api.md)
- Used by [Web UI](../interfaces/web-ui.md)

# Glossary

| Term    | Definition                                                                                                   |
| ------- | ------------------------------------------------------------------------------------------------------------ |
| Session | The owner of current campaign state, history navigation, and controller state that must follow that history. |

TODO: Define remaining local terms here or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

# Concepts and contract

## Session

The [Session definition](#glossary) was migrated from Domain Model and remains a draft. Controller state can include,
for example, persistent AI strategy memory. Storage/restoration decisions remain unresolved; this specification stays Stub.
Storage and restoration must preserve MODEL-002 through MODEL-004 and ENG-001, ENG-002, and ENG-004.

This Stub intends to refine ENG-001/002/004 by specifying cache restoration or invalidation, complete continuation state, and atomic
undo/redo and save/load procedures. It uses Modeling Foundations' identity, reference, and historical-preservation
conventions; storage procedures do not refine those meanings. Domain Model supplies the game instances restored,
and Numbers and Randomness supplies the numeric and generator-state contracts. The TODOs below retain the unresolved
procedure and encoding choices.

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
