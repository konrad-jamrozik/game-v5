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

- Uses [Initial Campaign Content](../content/initial-campaign.md)
- Uses [Leads and Progression](./leads-and-progression.md)
- Uses [Numbers and Randomness](../foundation/numbers-and-randomness.md)
- Refines [Domain Model](../foundation/domain-model.md)
- Used by [Initial Campaign Content](../content/initial-campaign.md)
- Used by [Leads and Progression](./leads-and-progression.md)
- Used by [Missions](./missions.md)
- Used by [Player Information](../interfaces/player-information.md)
- Used by [Turn Resolution](../foundation/turn-resolution.md)

# Glossary

TODO: Define the local terms here or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

# Concepts and contract

This Stub intends to refine Domain Model's faction and operation-provenance contract ([DOM-011](../foundation/domain-model.md#dom-011--mission-kind-and-provenance)) with escalation,
operation generation, suppression, and defeat behavior. Numbers and Randomness supplies distributions and draws;
Initial Campaign Content supplies operation catalogs and parameter values. Leads and Progression supplies earned
unlock effects and prerequisites; this document supplies faction state and defeat facts consumed by that progression.
Exact thresholds and transitions remain TODOs below.

TODO: Specify Faction discovery, activity level, escalation clock, operation level, operation clock, suppression, and defeat.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Requirements

## Escalation

TODO: Specify starting activity, progression thresholds/distributions, update order, maximum activity, and what information is revealed by faction intelligence.

## Operation generation

TODO: Specify countdown timing, severity distribution, mission content entry selection, repeat rules, and behavior with existing active operations. Link tables to INIT.

## Suppression and defeat

TODO: Specify stacking, countdown effects, continued escalation during suppression, defeat predicates, and treatment of pending operations/missions/leads after defeat.

TODO: Assign stable FACTION-NNN requirement IDs when concrete rules replace these placeholders.

# Edge cases and failure behavior

TODO: Define behavior for Suppression gained on a spawn turn, maximum activity, no eligible operation content entries, repeated operations, and defeat concurrent with an operation.
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
