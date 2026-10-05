# Developer API

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | DEV                                                            |
| Family      | Interfaces                                                     |
| Status      | Stub                                                           |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Purpose and boundaries

Expose all Authoritative values in Campaign state for debugging through a separate, explicit API surface.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

- Uses [Domain Model](../foundation/domain-model.md) for the game concepts and identities exposed for debugging.
- Uses [History and Persistence](../foundation/history-and-persistence.md) for the retained Campaign state and restoration behavior available for debugging.
- Uses [TypeScript Player API](./typescript-api.md) for the player-facing contract alongside which the separate debugging surface operates.
- Refines [Engine Contract](../foundation/engine-contract.md) by specifying the separate debugging API contract for access to all Authoritative values in Campaign state.

# Relationships

- Uses [Domain Model](../foundation/domain-model.md)
- Uses [History and Persistence](../foundation/history-and-persistence.md)
- Uses [TypeScript Player API](./typescript-api.md)
- Refines [Engine Contract](../foundation/engine-contract.md)

# Glossary

TODO: Define the local terms here or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

# Concepts and contract

Developer inspection and enablement refine the separate capability boundary in [Information boundary](../foundation/engine-contract.md#information-boundary).

This is an intended Stub refinement: the TODOs below will detail acquisition of that capability and its inspection
surface. Domain Model supplies the inspected state; History and Persistence supplies restoration semantics;
TypeScript Player API supplies the ordinary callable surface from which developer access must remain separate.

TODO: Specify Developer capability, full-state inspection, hidden state, debugging operation, snapshot, and validation.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Requirements

## Inspection contract

TODO: Specify full-state inspection (for example, hidden difficulty, RNG state, and Instance IDs). Define read-only/copy behavior and separation from Player-visible information.

## Optional debugging controls

TODO: Decide which mutation, scenario setup, random override, or stepping controls are supported, if any. Do not treat their existence as already approved gameplay features.

## Isolation and history

TODO: Specify how dev access is obtained, how ordinary callers remain independent of it, and how any debug mutation affects invariants, history, saves, and replay guarantees.

TODO: Write concrete requirements under descriptive section titles when rules replace these placeholders.

# Edge cases and failure behavior

TODO: Define behavior for Player attempts to use developer functions, malformed debug state, inspection during resolution, and debug changes followed by undo/replay.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

# Acceptance examples

TODO: Provide separate player/dev access examples and tests proving the player API does not expose dev fields.
Identify initial conditions, inputs/actions, expected results, and hyperlinks to the requirement sections exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Choose dev enablement and whether any state-mutating debug controls are needed.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
