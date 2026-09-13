# Agents

| Metadata    | Value                                                                           |
| ----------- | ------------------------------------------------------------------------------- |
| Spec ID     | AGENT                                                                           |
| Family      | Mechanics                                                                       |
| Status      | Stub                                                                            |
| Scope       | Define agent capability, task availability, development, fatigue, and recovery. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                  |

> This is a scoped outline, not an accepted implementation contract. TODOs must be resolved before acceptance.

# Purpose and boundaries

Define agent capability, task availability, development, fatigue, and recovery.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

# Relationships

## Dependencies

| Dependency                                                        | Relationship | Scope                                                                            |
| ----------------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------- |
| [Domain Model](../foundation/domain-model.md)                     | `refines`    | Agent lifecycle, assignments, task phases, attributes, and participation history |
| [Numbers and Randomness](../foundation/numbers-and-randomness.md) | `uses`       | Attribute arithmetic, thresholds, rounding, and reproducible random effects      |

## Dependents

| Dependent                                                 | Relationship | Scope                                                                                |
| --------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------ |
| [Combat](./combat.md)                                     | `uses`       | Agent capability, effective skill, health, exhaustion, and experience changes        |
| [Economy and Upgrades](./economy-and-upgrades.md)         | `uses`       | Hiring, dismissal, roster eligibility, and agent-facing upgrade effects              |
| [Investigations](./investigations.md)                     | `uses`       | Team contribution, transit, exhaustion, withdrawal, and assignment effects           |
| [Missions](./missions.md)                                 | `uses`       | Deployment eligibility, transit, survivor return, casualties, and assignment changes |
| [Player Information](../interfaces/player-information.md) | `uses`       | Agent attributes, assignments, readiness, and career information                     |
| [Turn Resolution](../foundation/turn-resolution.md)       | `uses`       | Transit, task contribution, fatigue, recovery, and assignment transitions            |

# Glossary

TODO: Define the local terms here or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

# Concepts and contract

TODO: Specify Base/effective skill, health, exhaustion, equipment, orders, activity state, readiness, transit, and career statistics.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Requirements

## Attributes and effectiveness

TODO: Specify effective-skill and readiness formulas with units, floors, caps, and exact thresholds. Define which attributes are individual versus agency-derived.

## Assignments and transit

TODO: Provide a transition table for standby, contracting, training, investigation, mission, recovery, death, and dismissal. Specify eligibility and transit for each supported transition.

## Growth and recovery

TODO: Specify training, task exhaustion, fatigue recovery, injury recovery, forced withdrawal, and career tracking. Link combat experience rules to COMBAT and economic effects to ECON.

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
