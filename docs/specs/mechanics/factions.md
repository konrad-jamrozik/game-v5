# Factions

| Metadata    | Value                                                                                        |
| ----------- | -------------------------------------------------------------------------------------------- |
| Spec ID     | FACTION                                                                                      |
| Family      | Mechanics                                                                                    |
| Status      | Stub                                                                                         |
| Scope       | Define escalating faction pressure, operation generation, suppression, and permanent defeat. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                               |

> This is a scoped outline, not an accepted implementation contract. TODOs must be resolved before acceptance.

# Purpose and boundaries

Define escalating faction pressure, operation generation, suppression, and permanent defeat.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

# Relationships

## Dependencies

| Dependency                                                        | Relationship | Scope                                                                            |
| ----------------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------- |
| [Domain Model](../foundation/domain-model.md)                     | `refines`    | Faction lifecycle, activity, operation provenance, suppression, and defeat facts |
| [Numbers and Randomness](../foundation/numbers-and-randomness.md) | `uses`       | Escalation arithmetic, timing distributions, and operation selection             |
| [Leads and Progression](./leads-and-progression.md)               | `uses`       | Faction-linked discovery, progression, and defeat effects on leads               |

## Dependents

| Dependent                                                  | Relationship | Scope                                                                           |
| ---------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------- |
| [Initial Campaign Content](../content/initial-campaign.md) | `refines`    | Concrete faction definitions, escalation values, and operation pools            |
| [Leads and Progression](./leads-and-progression.md)        | `uses`       | Faction discovery, progression, and defeat states that affect lead availability |
| [Missions](./missions.md)                                  | `uses`       | Operation severity, suppression, and faction progression consequences           |
| [Player Information](../interfaces/player-information.md)  | `uses`       | Revealed faction state, activity, operations, suppression, and defeat           |
| [Turn Resolution](../foundation/turn-resolution.md)        | `uses`       | Escalation, operation generation, suppression, and defeat effects               |

# Glossary

TODO: Define the local terms here or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

# Concepts and contract

TODO: Specify Faction discovery, activity level, escalation clock, operation level, operation clock, suppression, and defeat.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Requirements

## Escalation

TODO: Specify starting activity, progression thresholds/distributions, update order, maximum activity, and what information is revealed by faction intelligence.

## Operation generation

TODO: Specify countdown timing, severity distribution, mission-template selection, repeat rules, and behavior with existing active operations. Link tables to INIT.

## Suppression and defeat

TODO: Specify stacking, countdown effects, continued escalation during suppression, defeat predicates, and treatment of pending operations/missions/leads after defeat.

TODO: Assign stable FACTION-NNN requirement IDs when concrete rules replace these placeholders.

# Edge cases and failure behavior

TODO: Define behavior for Suppression gained on a spawn turn, maximum activity, no eligible operation templates, repeated operations, and defeat concurrent with an operation.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

# Acceptance examples

TODO: Give seeded escalation/spawn timelines and compare temporary suppression with permanent defeat.
Identify initial conditions, inputs/actions, expected results, and the requirement IDs exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Choose activity/operation rules and defeated-faction cleanup semantics.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
