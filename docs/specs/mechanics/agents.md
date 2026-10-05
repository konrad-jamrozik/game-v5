# Agents

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | AGENT                                                          |
| Family      | Mechanics                                                      |
| Status      | Stub                                                           |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Purpose and boundaries

Define agent capability, task availability, development, exhaustion, and recovery.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

- Uses [Combat](./combat.md) for the Battle result facts that affect Agent development and recovery.
- Uses [Economy and Upgrades](./economy-and-upgrades.md) for the purchases and upgrade effects that affect Agent availability and capability.
- Uses [Initial Campaign Content](../content/initial-campaign.md) for Agent archetypes and development and recovery parameters.
- Uses [Numbers and Randomness](../foundation/numbers-and-randomness.md) for numeric representation, rounding, and reproducible random draws.
- Refines [Domain Model](../foundation/domain-model.md) by specifying Agent capability, task availability, development, exhaustion, and recovery rules.
- Used by [Combat](./combat.md) for Agent capabilities and exhaustion when resolving a battle.
- Used by [Economy and Upgrades](./economy-and-upgrades.md) for Agent capability and availability rules affected by personnel purchases and upgrades.
- Used by [Investigations](./investigations.md) for Agent capabilities and task availability when assigning Investigation participants.
- Used by [Missions](./missions.md) for Agent capabilities and availability when committing Mission participants.
- Used by [Player Information](../interfaces/player-information.md) for Agent capabilities, Current assignments, exhaustion, and recovery.
- Used by [Turn Resolution](../foundation/turn-resolution.md) for Agent assignment, exhaustion, and recovery transitions scheduled within a turn.

# Relationships

- Uses [Combat](./combat.md)
- Uses [Economy and Upgrades](./economy-and-upgrades.md)
- Uses [Initial Campaign Content](../content/initial-campaign.md)
- Uses [Numbers and Randomness](../foundation/numbers-and-randomness.md)
- Refines [Domain Model](../foundation/domain-model.md)
- Used by [Combat](./combat.md)
- Used by [Economy and Upgrades](./economy-and-upgrades.md)
- Used by [Investigations](./investigations.md)
- Used by [Missions](./missions.md)
- Used by [Player Information](../interfaces/player-information.md)
- Used by [Turn Resolution](../foundation/turn-resolution.md)

# Glossary

Shared Campaign instance Type names are owned by the [Domain Model glossary](../foundation/domain-model.md#glossary).

| Term       | Definition                                                                                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Health     | The combatant attribute bounded by zero and maximum health under [Attribute bounds](../foundation/domain-model.md#attribute-bounds).                                           |
| Exhaustion | The nonnegative combatant attribute governed by [Attribute bounds](../foundation/domain-model.md#attribute-bounds); accumulation, caps, and recovery await this specification. |

TODO: Define remaining local terms here or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

# Concepts and contract

This specification intends to refine Domain Model's agent contract ([Agent lifecycle](../foundation/domain-model.md#agent-lifecycle), [Orders and Task phase](../foundation/domain-model.md#orders-and-task-phase), [Current versus historical teams](../foundation/domain-model.md#current-versus-historical-teams), and [Attribute bounds](../foundation/domain-model.md#attribute-bounds)) with eligibility, Current assignment,
travel, attribute, and lifecycle transitions. It uses Numbers and Randomness for arithmetic and reproducibility.
Combat supplies battle-earned experience, Economy and Upgrades supplies economic effects on personnel and
capabilities, and Initial Campaign Content supplies balance values. Those inputs are applied to agent transitions;
this document supplies the agent capabilities used by Combat and Economy and Upgrades in return.
The formulas and transition choices below remain TODOs; the domain constraints still apply.

TODO: Specify Base/effective skill, health, exhaustion, equipment, orders, activity state, readiness, transit, and career statistics.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Requirements

## Attributes and effectiveness

TODO: Specify effective-skill and readiness formulas with units, floors, caps, and exact thresholds. Define which attributes are individual versus agency-derived.

## Current assignments and transit

TODO: Provide a transition table for standby, contracting, training, investigation, mission, recovery, death, and dismissal. Specify eligibility and transit for each supported transition.

## Growth and recovery

TODO: Specify training, task exhaustion, exhaustion recovery, injury recovery, forced withdrawal, and career tracking. Link combat experience rules to COMBAT and economic effects to ECON.

TODO: Write concrete requirements under descriptive section titles when rules replace these placeholders.

# Edge cases and failure behavior

TODO: Define behavior for Exact readiness/exhaustion thresholds, zero health, recovery completion, destination disappearing during transit, and conflicting Current assignments.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

# Acceptance examples

TODO: Provide effective-skill calculations and multi-turn transition examples including transit and forced withdrawal.
Identify initial conditions, inputs/actions, expected results, and hyperlinks to the requirement sections exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Choose transition delays, attribute formulas, and recovery rules; balance values belong to INIT.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
