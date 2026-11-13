# Factions

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | FACTION                                                        |
| Family      | Mechanics                                                      |
| Status      | Stub                                                           |
| Audience    | Engine designer, Content designer, AI designer, Implementer    |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Overview

This document defines escalating faction pressure, Faction operation occurrence generation, suppression, and permanent defeat.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

This specification intends to refine Domain Model's faction and Faction operation occurrence provenance contract ([Mission kind and provenance](../foundation/domain-model.md#mission-kind-and-provenance)) with escalation,
Faction operation occurrence generation, suppression, and defeat behavior. Numbers and Randomness supplies distributions and draws;
Game Data Records (GDRs) supply the catalogs for Faction operation occurrences and the parameter values. Leads and Progression supplies earned
unlock effects and prerequisites; this document supplies faction state and defeat facts consumed by that progression.
Exact thresholds and transitions remain TODOs below.

TODO: Specify Faction discovery, activity level, escalation clock, Faction operation occurrence level, Faction operation occurrence clock, suppression, and defeat.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Relationships

- Uses [Core Concepts](../foundation/core-concepts.md)
- Uses [Engine Contract](../foundation/engine-contract.md)
- Uses [Leads and Progression](./leads-and-progression.md)
- Uses [Numbers and Randomness](../foundation/numbers-and-randomness.md)
- Refines [Domain Model](../foundation/domain-model.md)
- Used by [Leads and Progression](./leads-and-progression.md)
- Used by [Missions](./missions.md)
- Used by [Player Information](../interfaces/player-information.md)

# Glossary

TODO: Define the local terms here or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

# Escalation

TODO: Specify starting activity, progression thresholds/distributions, update order, maximum activity, and what information is revealed by faction intelligence.

# Faction operation occurrence generation

TODO: Specify countdown timing, severity distribution, mission GDR selection, repeat rules, and behavior with existing active Faction operation occurrences. Name the GDRs that supply the tables.

# Suppression and defeat

TODO: Specify stacking, countdown effects, continued escalation during suppression, defeat predicates, and treatment of pending Faction operation occurrences/missions/leads after defeat.

# Edge cases and failure behavior

TODO: Define behavior for Suppression gained on a spawn turn, maximum activity, no eligible GDRs for Faction operation occurrences, repeated Faction operation occurrences, and defeat concurrent with a Faction operation occurrence.
State how several Missions affecting one Faction in the same Advance turn combine, under [Turn advancement](../foundation/engine-contract.md#turn-advancement).
State exact thresholds and effect ordering where relevant.

# Acceptance examples

TODO: Give seeded escalation/spawn timelines and compare temporary suppression with permanent defeat.
Identify initial conditions, inputs/actions, expected results, and hyperlinks to the requirement sections exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Choose activity/Faction operation occurrence rules and defeated-faction cleanup semantics.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
