# Factions

| Metadata    | Value                                                                                        |
| ----------- | -------------------------------------------------------------------------------------------- |
| Spec ID     | FACTION                                                                                      |
| Status      | Stub                                                                                         |
| Scope       | Define escalating faction pressure, operation generation, suppression, and permanent defeat. |
| Conventions | [Specification conventions](../spec-conventions.md)                                          |

> This is a scoped outline, not an accepted implementation contract. TODOs must be resolved before acceptance.

## 1. Purpose and boundaries

Define escalating faction pressure, operation generation, suppression, and permanent defeat.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

## 2. Dependencies and terminology

### Relationships

| Type      | Target                                                            | Scope                                                                            |
| --------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `refines` | [Domain Model](../foundation/domain-model.md)                     | Faction lifecycle, activity, operation provenance, suppression, and defeat facts |
| `uses`    | [Numbers and Randomness](../foundation/numbers-and-randomness.md) | Escalation arithmetic, timing distributions, and operation selection             |
| `uses`    | [Leads and Progression](leads-and-progression.md)                 | Faction-linked discovery, progression, and defeat effects on leads               |

TODO: Define the local terms below or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

## 3. Concepts and contract

TODO: Specify Faction discovery, activity level, escalation clock, operation level, operation clock, suppression, and defeat.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

## 4. Requirements

### Escalation

TODO: Specify starting activity, progression thresholds/distributions, update order, maximum activity, and what information is revealed by faction intelligence.

### Operation generation

TODO: Specify countdown timing, severity distribution, mission-template selection, repeat rules, and behavior with existing active operations. Link tables to INIT.

### Suppression and defeat

TODO: Specify stacking, countdown effects, continued escalation during suppression, defeat predicates, and treatment of pending operations/missions/leads after defeat.

TODO: Assign stable FACTION-NNN requirement IDs when concrete rules replace these placeholders.

## 5. Edge cases and failure behavior

TODO: Define behavior for Suppression gained on a spawn turn, maximum activity, no eligible operation templates, repeated operations, and defeat concurrent with an operation.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

## 6. Acceptance examples

TODO: Give seeded escalation/spawn timelines and compare temporary suppression with permanent defeat.
Identify initial conditions, inputs/actions, expected results, and the requirement IDs exercised. Reference shared
fixtures instead of introducing implicit balance values.

## 7. Open decisions

- TODO: Choose activity/operation rules and defeated-faction cleanup semantics.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
