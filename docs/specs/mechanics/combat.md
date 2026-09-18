# Combat

| Metadata    | Value                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------ |
| Spec ID     | COMBAT                                                                                           |
| Family      | Mechanics                                                                                        |
| Status      | Stub                                                                                             |
| Scope       | Define fully automatic battles and their reproducible results independently of campaign rewards. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                                   |

> This is a scoped outline, not an accepted implementation contract. TODOs must be resolved before acceptance.

# Purpose and boundaries

Define fully automatic battles and their reproducible results independently of campaign rewards.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

# Relationships

- Uses [Agents](./agents.md)
- Uses [Numbers and Randomness](../foundation/numbers-and-randomness.md)
- Refines [Domain Model](../foundation/domain-model.md)
- Used by [Missions](./missions.md)
- Used by [Player Information](../interfaces/player-information.md)

# Glossary

TODO: Define the local terms here or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

# Concepts and contract

TODO: Specify Combatant, weapon, effective skill, combat rating, round, attack, damage, incapacitation, retreat, and battle result.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Requirements

## Battle flow

TODO: Specify initial snapshots, participation, round/side order, initiative, targeting, ties, and when changed attributes affect subsequent actions.

## Combat calculations

TODO: Specify combat-rating, hit/contest, damage, exhaustion, experience, and casualty formulas. Define random draw sites and reference NUMRNG conventions.

## Termination and results

TODO: Specify victory, retreat, wipe, non-progress/stalemate handling, final injuries and experience, and output needed for partial-success calculation. Campaign rewards belong to MISSION.

TODO: Assign stable COMBAT-NNN requirement IDs when concrete rules replace these placeholders.

# Edge cases and failure behavior

TODO: Define behavior for Ties, no valid targets, all participants incapacitated, zero damage/effective skill, simultaneous terminal conditions, and battles that cannot progress.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

# Acceptance examples

TODO: Give deterministic round-by-round fixtures with attacks, draws, damage, experience, and expected battle results.
Identify initial conditions, inputs/actions, expected results, and the requirement IDs exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Choose targeting, attack order, formulas, retreat criteria, and battle termination guarantees.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
