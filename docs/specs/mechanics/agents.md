# Agents

| Metadata    | Value                                                                              |
| ----------- | ---------------------------------------------------------------------------------- |
| Spec ID     | AGENT                                                                              |
| Family      | Mechanics                                                                          |
| Status      | Stub                                                                               |
| Scope       | Define agent capability, task availability, development, exhaustion, and recovery. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                     |

> This is a scoped outline, not an accepted implementation contract. TODOs must be resolved before acceptance.

# Purpose and boundaries

Define agent capability, task availability, development, exhaustion, and recovery.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

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

Shared campaign-instance TypeScript type names are owned by the [Domain Model glossary](../foundation/domain-model.md#glossary).

| Term       | Definition                                                                                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Health     | The combatant attribute bounded by zero and maximum health under [DOM-008](../foundation/domain-model.md#dom-008--attribute-bounds).                                           |
| Exhaustion | The nonnegative combatant attribute governed by [DOM-008](../foundation/domain-model.md#dom-008--attribute-bounds); accumulation, caps, and recovery await this specification. |

TODO: Define remaining local terms here or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

# Concepts and contract

This Stub intends to refine Domain Model's agent contract ([DOM-005](../foundation/domain-model.md#dom-005--agent-lifecycle), [DOM-006](../foundation/domain-model.md#dom-006--orders-and-task-phase), [DOM-007](../foundation/domain-model.md#dom-007--current-versus-historical-teams), and [DOM-008](../foundation/domain-model.md#dom-008--attribute-bounds)) with eligibility, assignment,
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

## Assignments and transit

TODO: Provide a transition table for standby, contracting, training, investigation, mission, recovery, death, and dismissal. Specify eligibility and transit for each supported transition.

## Growth and recovery

TODO: Specify training, task exhaustion, exhaustion recovery, injury recovery, forced withdrawal, and career tracking. Link combat experience rules to COMBAT and economic effects to ECON.

TODO: Assign stable AGENT-NNN requirement IDs when concrete rules replace these placeholders.

# Edge cases and failure behavior

TODO: Define behavior for Exact readiness/exhaustion thresholds, zero health, recovery completion, destination disappearing during transit, and conflicting assignments.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

# Acceptance examples

TODO: Provide effective-skill calculations and multi-turn transition examples including transit and forced withdrawal.
Identify initial conditions, inputs/actions, expected results, and the requirement IDs exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Choose transition delays, attribute formulas, and recovery rules; balance values belong to INIT.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
