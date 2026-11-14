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

This specification refines Domain Model's faction and Faction operation occurrence provenance contract ([Faction and Faction operation occurrences](../foundation/domain-model.md#faction-and-faction-operation-occurrences)/[Mission kind and provenance](../foundation/domain-model.md#mission-kind-and-provenance)) with what a Faction has, and intends to refine it further with escalation,
Faction operation occurrence generation, suppression, and defeat behavior. Numbers supplies arithmetic, and this document owns the distributions of its own random outcomes;
Game Data Records (GDRs) supply the catalogs for Faction operation occurrences and the parameter values. This document states what a
Faction is and what can happen to it, e.g. discovery, suppression, and defeat, without stating what causes it.
[Missions](./missions.md) owns the Mission a Faction operation occurrence creates and the Mission outcomes that
suppress a Faction, and [Leads and Progression](./leads-and-progression.md) owns the completions that discover or
defeat one. These are ownership pointers; this document relies on neither specification.
Exact thresholds and transitions remain TODOs below.

TODO: Specify Faction discovery, activity level, escalation clock, Faction operation occurrence level, Faction operation occurrence clock, suppression, and defeat.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Relationships

- Uses [Core Concepts](../foundation/core-concepts.md)
- Uses [Engine Contract](../foundation/engine-contract.md)
- Uses [Numbers](../foundation/numbers.md)
- Uses [Turn Advancement](../foundation/turn-advancement.md)
- Refines [Domain Model](../foundation/domain-model.md)
- Used by [Leads and Progression](./leads-and-progression.md)
- Used by [Missions](./missions.md)
- Refined by [Leads and Progression](./leads-and-progression.md)
- Refined by [Missions](./missions.md)

# Glossary

TODO: Define the local terms here or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

# Faction aspects

A Faction has activity, Faction operation occurrence clocks, suppression, and defeat and progression facts.
[Faction and Faction operation occurrences](../foundation/domain-model.md#faction-and-faction-operation-occurrences)
in Domain Model owns how a Faction operation occurrence relates a Faction to a Response Mission.

# Escalation

TODO: Specify starting activity, progression thresholds/distributions, update order, maximum activity, and what information is revealed by faction intelligence.

# Faction operation occurrence generation

TODO: Specify countdown timing, severity distribution, mission GDR selection, repeat rules, and behavior with existing active Faction operation occurrences. Name the GDRs that supply the tables.

# Suppression and defeat

TODO: Specify stacking, countdown effects, continued escalation during suppression, what defeat does to a Faction, and treatment of pending Faction operation occurrences/missions/leads after defeat. The predicates that cause defeat belong to Leads and Progression.

# Player-visible information

TODO: State which values this specification owns are Player-visible information, the reveal conditions of each, and
how the player tells an unknown value apart from zero or absence, under
[Player queries and actions](../foundation/engine-contract.md#player-queries-and-actions) in Engine Contract.

# Edge cases and failure behavior

TODO: Define behavior for Suppression gained on a spawn turn, maximum activity, no eligible GDRs for Faction operation occurrences, repeated Faction operation occurrences, and defeat concurrent with a Faction operation occurrence.
State how several Missions affecting one Faction in the same Advance turn combine, under [Values a step uses](../foundation/turn-advancement.md#values-a-step-uses).
State exact thresholds and effect ordering where relevant.

# Acceptance examples

TODO: Give seeded escalation/spawn timelines and compare temporary suppression with permanent defeat.
Identify initial conditions, inputs/actions, expected results, and hyperlinks to the requirement sections exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Choose activity/Faction operation occurrence rules and defeated-faction cleanup semantics.
- TODO: Decide how many Faction Campaign instances may share one Archetype within a Campaign.
- TODO: Decide which data of Factions must remain in World history once they no longer participate in current
  gameplay.
- TODO: State the rule determining the Faction Campaign instances that the initial Campaign state contains, and name the GDRs supplying their initial values, under [Initial Campaign state](../foundation/domain-model.md#initial-campaign-state).
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
