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

This specification intends to refine Domain Model's agent contract ([Agent lifecycle](../foundation/domain-model.md#agent-lifecycle), [Orders and Task phase](../foundation/domain-model.md#orders-and-task-phase), [Current versus historical teams](../foundation/domain-model.md#current-versus-historical-teams), and [Attribute bounds](../foundation/domain-model.md#attribute-bounds)) with eligibility, Current assignment,
travel, attribute, and lifecycle transitions. It uses Numbers and Randomness for arithmetic and reproducibility.
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

- Uses [Engine Contract](../foundation/engine-contract.md)
- Uses [Numbers and Randomness](../foundation/numbers-and-randomness.md)
- Refines [Domain Model](../foundation/domain-model.md)
- Used by [Combat](./combat.md)
- Used by [Economy and Upgrades](./economy-and-upgrades.md)
- Used by [Investigations](./investigations.md)
- Used by [Missions](./missions.md)
- Used by [Player Information](../interfaces/player-information.md)
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

# Attributes and effectiveness

TODO: Specify effective-skill and readiness formulas with units, floors, caps, and exact thresholds. Define which attributes are individual versus agency-derived.

# Modifiable values

TODO: List every Agent-related value that an upgrade may change, e.g. training skill gain, exhaustion recovery, health
recovery, and maximum health, and state whether each is an individual Agent value or an Agency value. A value not
listed here cannot be changed by another specification. [Economy and Upgrades](./economy-and-upgrades.md) owns how
each upgrade changes a listed value.

# Current assignments and transit

TODO: Provide a transition table for standby, contracting, training, investigation, mission, recovery, death, and dismissal. Specify eligibility and transit for each supported transition.

# Growth and value changes

TODO: Specify training, forced withdrawal, and career tracking, and state what gaining experience does to an Agent.
List, as ownership pointers, every specification that changes health, exhaustion, or experience: Combat for battle
damage and battle-earned experience, Agent Recovery for health and exhaustion recovery, and each specification whose
activity raises exhaustion.

# Edge cases and failure behavior

TODO: Define behavior for Exact readiness/exhaustion thresholds, zero health, recovery completion, destination disappearing during transit, and conflicting Current assignments.
State when an arriving Agent can work, as an exception to the turn-start default under [Turn advancement](../foundation/engine-contract.md#turn-advancement).
State exact thresholds and effect ordering where relevant.

# Acceptance examples

TODO: Provide effective-skill calculations and multi-turn transition examples including transit and forced withdrawal.
Identify initial conditions, inputs/actions, expected results, and hyperlinks to the requirement sections exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Choose transition delays and attribute formulas; balance values are GDRs.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
