# Combat

| Metadata    | Value                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------ |
| Spec ID     | COMBAT                                                                                           |
| Family      | Mechanics                                                                                        |
| Status      | Stub                                                                                             |
| Audience    | Engine designer, Content designer, AI designer, Implementer                                      |
| Owns        | Define fully automatic battles and their reproducible results independently of campaign rewards. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                                   |

# Overview

This document defines fully automatic battles and their reproducible results independently of campaign rewards.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

This specification refines Domain Model's combatant and battle-result contract ([Attribute bounds](domain-model.md#attribute-bounds)/[Combat and consequences](domain-model.md#combat-and-consequences)) with what an Enemy has and what a
Battle result holds, and intends to refine it further with battle transitions,
calculations, and termination rules. It uses Agents' combatant capabilities and Numbers' arithmetic, and it
owns the distributions of its own random outcomes. It also intends to refine Agents'
[Attributes and effectiveness](./agents-spec.md#attributes-and-effectiveness) with how a Battle lowers health, raises
exhaustion, and awards experience, within the meanings and bounds Agents states for those values. The combat
decisions below remain TODOs; campaign consequences remain owned by Missions.

TODO: Specify weapon, effective skill, combat rating, round, attack, damage, incapacitation, retreat, and Battle result.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Relationships

- Uses [Agents](./agents-spec.md)
- Uses [Core Concepts](../foundation/core-concepts.md)
- Uses [Engine Contract](../foundation/engine-contract.md)
- Uses [Numbers](../foundation/numbers.md)
- Refines [Agents](./agents-spec.md)
- Refines [Domain Model](domain-model.md)
- Used by [Missions](./missions.md)
- Used by [Turn Advancement](./turn-advancement.md)

# Glossary

TODO: Define the local terms here or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

# Combatants and Battle results

Agent and Enemy adopt the [Combatant Role Type](domain-model.md#combatant-role-type). An Enemy has its
own values of the properties the Combatant Role Type requires, within
[Attribute bounds](domain-model.md#attribute-bounds).

TODO: State the exhaustive set of properties a Combatant gains for the duration of a battle, e.g. morale and
incapacitated, with the Type, initial value, and meaning of each. State whether any of them is ever part of Committed
state, or whether every battle begins and ends within one Player action.

A Battle result holds the participants, the outcome, combat facts, and the measures needed for Mission consequences.
A Battle result must retain the facts that the partial-success formula requires; [Missions](./missions.md) owns that
formula. [Combat and consequences](domain-model.md#combat-and-consequences) in Domain Model owns how a
Battle result relates to its Mission.

# Battle flow

TODO: Specify initial snapshots, participation, round/side order, initiative, targeting, ties, and when changed attributes affect subsequent actions.

# Combat calculations

TODO: Specify combat-rating, hit/contest, damage, exhaustion, experience, and casualty formulas. Name each random outcome of each combat calculation and state its distribution.

# Termination and results

TODO: Specify victory, retreat, wipe, non-progress/stalemate handling, final injuries and experience, and output needed for partial-success calculation. Campaign rewards belong to MISSION.

# Player-visible information

TODO: State which values this specification owns are Player-visible information, the reveal conditions of each, and
how the player tells an unknown value apart from zero or absence, under
[Player queries and actions](../foundation/engine-contract.md#player-queries-and-actions) in Engine Contract.

# Edge cases and failure behavior

TODO: Define behavior for Ties, no valid targets, all participants incapacitated, zero damage/effective skill, simultaneous terminal conditions, and battles that cannot progress.
State exact thresholds and effect ordering where relevant.

# Acceptance examples

TODO: Give deterministic round-by-round fixtures with attacks, draws, damage, experience, and expected Battle results.
Identify initial conditions, inputs/actions, expected results, and hyperlinks to the requirement sections exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Choose targeting, attack order, formulas, retreat criteria, and battle termination guarantees.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
