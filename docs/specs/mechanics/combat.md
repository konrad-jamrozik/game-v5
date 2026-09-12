# Combat

| Metadata    | Value                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------ |
| Spec ID     | COMBAT                                                                                           |
| Status      | Stub                                                                                             |
| Scope       | Define fully automatic battles and their reproducible results independently of campaign rewards. |
| Conventions | [Specification conventions](../spec-conventions.md)                                              |

> This is a scoped outline, not an accepted implementation contract. TODOs must be resolved before acceptance.

## 1. Purpose and boundaries

Define fully automatic battles and their reproducible results independently of campaign rewards.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

## 2. Dependencies and terminology

### Relationships

| Type      | Target                                                            | Scope                                                                         |
| --------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `refines` | [Domain Model](../foundation/domain-model.md)                     | Combatants, enemy instances, combat transitions, and battle-result facts      |
| `uses`    | [Numbers and Randomness](../foundation/numbers-and-randomness.md) | Combat arithmetic, rounding, draw sites, and deterministic ordering           |
| `uses`    | [Agents](agents.md)                                               | Agent capability, effective skill, health, exhaustion, and experience changes |

TODO: Define the local terms below or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

## 3. Concepts and contract

TODO: Specify Combatant, weapon, effective skill, combat rating, round, attack, damage, incapacitation, retreat, and battle result.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

## 4. Requirements

### Battle flow

TODO: Specify initial snapshots, participation, round/side order, initiative, targeting, ties, and when changed attributes affect subsequent actions.

### Combat calculations

TODO: Specify combat-rating, hit/contest, damage, exhaustion, experience, and casualty formulas. Define random draw sites and reference NUM conventions.

### Termination and results

TODO: Specify victory, retreat, wipe, non-progress/stalemate handling, final injuries and experience, and output needed for partial-success calculation. Campaign rewards belong to MISSION.

TODO: Assign stable COMBAT-NNN requirement IDs when concrete rules replace these placeholders.

## 5. Edge cases and failure behavior

TODO: Define behavior for Ties, no valid targets, all participants incapacitated, zero damage/effective skill, simultaneous terminal conditions, and battles that cannot progress.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

## 6. Acceptance examples

TODO: Give deterministic round-by-round fixtures with attacks, draws, damage, experience, and expected battle results.
Identify initial conditions, inputs/actions, expected results, and the requirement IDs exercised. Reference shared
fixtures instead of introducing implicit balance values.

## 7. Open decisions

- TODO: Choose targeting, attack order, formulas, retreat criteria, and battle termination guarantees.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
