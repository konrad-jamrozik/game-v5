# Agents

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | AGENT                                                          |
| Family      | Mechanics                                                      |
| Status      | Stub                                                           |
| Audience    | Engine designer, Content designer, AI designer, Implementer    |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Overview

This document defines what an Agent has and can do: agent capability, task availability, development, and the meaning of health, exhaustion, and experience.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

This specification refines Domain Model's Agent contract ([Agent](../foundation/domain-model.md#agent),
[Current versus historical teams](../foundation/domain-model.md#current-versus-historical-teams), and
[Attribute bounds](../foundation/domain-model.md#attribute-bounds)) with what an Agent has, the Agent lifecycle, and
the Current assignments an Agent can have, and intends to refine it further with eligibility, travel, attribute, and
lifecycle transitions. It uses Numbers for arithmetic.
GDRs supply balance values.

This document is the base of the Mechanics family. It states what each Agent value is, its range, what its extremes
mean, and its effect on the Agent, and it lists every Agent-related value that another specification may change. It
does not state when or by how much those values change. [Combat](./combat.md) owns how a Battle lowers health and
awards experience, [Agent Recovery](./agent-recovery.md) owns how health goes up and exhaustion goes down, and
[Economy and Upgrades](./economy-and-upgrades.md) owns how upgrades change the modifiable values. These are ownership
pointers; this document relies on none of those specifications.
The formulas and transition choices below remain TODOs; the domain constraints still apply.

TODO: Specify Base/effective skill, health, exhaustion, equipment, orders, activity state, readiness, transit, and career statistics.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Relationships

- Uses [Core Concepts](../foundation/core-concepts.md)
- Uses [Engine Contract](../foundation/engine-contract.md)
- Uses [Numbers](../foundation/numbers.md)
- Uses [Turn Advancement](../foundation/turn-advancement.md)
- Refines [Domain Model](../foundation/domain-model.md)
- Used by [Combat](./combat.md)
- Used by [Economy and Upgrades](./economy-and-upgrades.md)
- Used by [Investigations](./investigations.md)
- Used by [Missions](./missions.md)
- Refined by [Agent Recovery](./agent-recovery.md)
- Refined by [Combat](./combat.md)
- Refined by [Economy and Upgrades](./economy-and-upgrades.md)

# Glossary

Shared Campaign instance Type names are owned by the [Domain Model glossary](../foundation/domain-model.md#glossary).

| Term       | Definition                                                                                                                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Health     | The combatant attribute bounded by zero and maximum health under [Attribute bounds](../foundation/domain-model.md#attribute-bounds).                                                                                            |
| Exhaustion | The nonnegative combatant attribute governed by [Attribute bounds](../foundation/domain-model.md#attribute-bounds); its cap awaits this specification; the specifications that raise or lower it own accumulation and recovery. |

TODO: Define remaining local terms here or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

# Agent aspects

An Agent's identity persists through its Current assignments and combat. An Agent has these aspects:

| Aspect                | Meaning                                                                                                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lifecycle             | Serving, Killed, or Dismissed; distinct from the Agent's Current assignment                                                                                               |
| Attributes            | Skill, health, exhaustion, and equipped weapon values, which the [Combatant Role Type](../foundation/domain-model.md#combatant-role-type) requires, and career statistics |
| Current assignment    | The Agent's current orders, including the destination while travelling; an Investigation or Mission Current assignment references that Investigation or Mission           |
| Task phase            | At assignment or In transit, with the timing facts needed to describe travel                                                                                              |
| Participation history | The Investigations and Missions the Agent previously participated in                                                                                                      |

The sections below state the rules for each aspect. [Current versus historical teams](../foundation/domain-model.md#current-versus-historical-teams)
in Domain Model owns how Current assignment and Participation history relate an Agent to Investigations and Missions.

# Agent lifecycle

An Agent's lifecycle must distinguish Serving, Killed, and Dismissed. A Serving Agent must have exactly one Current
assignment and Task phase. A Killed or Dismissed Agent must have neither. Killed and Dismissed are lifecycle states,
not Current assignments.

Within [Attribute bounds](../foundation/domain-model.md#attribute-bounds), Serving Agents must have positive health,
Killed Agents zero health, and Dismissed Agents positive health.

TODO: Specify dismissal eligibility and the transitions between the lifecycle states.

# Attributes and effectiveness

TODO: Specify effective-skill and readiness formulas with units, floors, caps, and exact thresholds. Define which attributes are individual versus agency-derived.
Specify exhaustion caps and rounding.

# Modifiable values

TODO: List every Agent-related value that an upgrade may change, e.g. training skill gain, exhaustion recovery, health
recovery, and maximum health, and state whether each is an individual Agent value or an Agency value. A value not
listed here cannot be changed by another specification. [Economy and Upgrades](./economy-and-upgrades.md) owns how
each upgrade changes a listed value.

# Current assignments and transit

## Orders and Task phase

The Current assignment of a Serving Agent must be exactly one of Standby, Contracting, Training, Investigation with a
reference to that Investigation, Mission with a reference to that Mission, and Recovery. Task phase must distinguish
At assignment from In transit. An Agent In transit keeps the Current assignment it is travelling to, with its
destination and the timing facts that travel requires; transit is not a second Current assignment.

At assignment does not itself imply readiness.

## Transitions and transit

TODO: Specify which transitions and Task phase combinations are allowed, which Current assignments require transit,
and travel duration. Provide a transition table for standby, contracting, training, investigation, mission, recovery, death, and dismissal. Specify eligibility and transit for each supported transition.

# Growth and value changes

TODO: Specify training, forced withdrawal, and career tracking, and state what gaining experience does to an Agent.
List, as ownership pointers, every specification that changes health, exhaustion, or experience: Combat for battle
damage and battle-earned experience, Agent Recovery for health and exhaustion recovery, and each specification whose
activity raises exhaustion.

# Player-visible information

TODO: State which values this specification owns are Player-visible information, the reveal conditions of each, and
how the player tells an unknown value apart from zero or absence, under
[Player queries and actions](../foundation/engine-contract.md#player-queries-and-actions) in Engine Contract.

# Edge cases and failure behavior

TODO: Define behavior for Exact readiness/exhaustion thresholds, zero health, recovery completion, destination disappearing during transit, and conflicting Current assignments.
State when an arriving Agent can work, consistent with the Transit step under [Turn advancement steps](../foundation/turn-advancement.md#turn-advancement-steps).
State exact thresholds and effect ordering where relevant.

# Acceptance examples

TODO: Provide effective-skill calculations and multi-turn transition examples including transit and forced withdrawal.
Identify initial conditions, inputs/actions, expected results, and hyperlinks to the requirement sections exercised. Reference shared
fixtures instead of introducing implicit balance values.

## Lifecycle and Current assignment structure

Given the fixture of [A. Valid relationships](../foundation/domain-model.md#a-valid-relationships) in Domain Model,
with a1 and a2 both Serving, the fixture satisfies [Agent lifecycle](#agent-lifecycle) and
[Orders and Task phase](#orders-and-task-phase): each Agent has exactly one Current assignment, Investigation for a1
and Mission for a2, exactly one Task phase, and positive health.

Each row independently changes that fixture and describes an invalid state.

| Change                                                             | Violation                                                                               |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Mark a1 Killed while keeping its Current assignment and Task phase | [Agent lifecycle](#agent-lifecycle)                                                     |
| Give a1 both a Training and an Investigation Current assignment    | [Agent lifecycle](#agent-lifecycle) and [Orders and Task phase](#orders-and-task-phase) |
| Set the health of a1 to zero while a1 is Serving                   | [Agent lifecycle](#agent-lifecycle)                                                     |

After [C. Completion and later Participation history](../foundation/domain-model.md#c-completion-and-later-participation-history)
in Domain Model, a1 and a2 are still Serving, each with one new valid Current assignment and Task phase, which
satisfies [Agent lifecycle](#agent-lifecycle).

# Open decisions

- TODO: Choose transition delays and attribute formulas; balance values are GDRs.
- TODO: State the rule determining the Agent Campaign instances that the initial Campaign state contains, and name the GDRs supplying their initial values, under [Initial Campaign state](../foundation/domain-model.md#initial-campaign-state).
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
