# Missions

| Metadata    | Value                                                                               |
| ----------- | ----------------------------------------------------------------------------------- |
| Spec ID     | MISSION                                                                             |
| Family      | Mechanics                                                                           |
| Status      | Stub                                                                                |
| Scope       | Define mission commitments and translate combat results into campaign consequences. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                      |

> This is a scoped outline, not an accepted implementation contract. TODOs must be resolved before acceptance.

# Purpose and boundaries

Define mission commitments and translate combat results into campaign consequences.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

# Relationships

## Dependencies

| Dependency                                        | Relationship | Scope                                                                                           |
| ------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------- |
| [Domain Model](../foundation/domain-model.md)     | `refines`    | Mission lifecycle, deployment, provenance, deadlines, battle results, and campaign consequences |
| [Agents](./agents.md)                             | `uses`       | Deployment eligibility, transit, survivor return, casualties, and assignment changes            |
| [Combat](./combat.md)                             | `uses`       | Battle-result facts consumed by mission outcome and partial-success rules                       |
| [Economy and Upgrades](./economy-and-upgrades.md) | `uses`       | Resource rewards, penalties, and shared transport capacity                                      |
| [Factions](./factions.md)                         | `uses`       | Operation severity, suppression, and faction progression consequences                           |

## Dependents

| Dependent                                                  | Relationship | Scope                                                                            |
| ---------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------- |
| [Initial Campaign Content](../content/initial-campaign.md) | `refines`    | Concrete mission content entries, deadlines, rewards, and consequence parameters |
| [Leads and Progression](./leads-and-progression.md)        | `uses`       | Mission creation, lifecycle, and outcomes that block or advance leads            |
| [Player Information](../interfaces/player-information.md)  | `uses`       | Mission state, deadlines, outcomes, and consequence reports                      |
| [Turn Resolution](../foundation/turn-resolution.md)        | `uses`       | Mission aging, resolution, expiration, and consequence effects                   |

# Glossary

TODO: Define the local terms here or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

# Concepts and contract

TODO: Specify Initiative mission, Response mission, faction operation, deadline, deployment, battle result, mission outcome, and partial success.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Requirements

## Creation and lifecycle

TODO: Specify mission creation, states, deadlines, deployment/recall eligibility, transport use, resolution, and expiration. Distinguish mission purpose from combat tactics.

## Outcomes and partial success

TODO: Provide exact rewards and penalties for victory, retreat, wipe, and expiration. Define how damage inflicted benefits the player after failure, with units, normalization, bounds, and interaction with operation severity.

## Consequences and return

TODO: Specify survivor return, casualty effects, resource changes, suppression, unlocks, and reports. Reference owning rules to prevent duplicate application.

TODO: Assign stable MISSION-NNN requirement IDs when concrete rules replace these placeholders.

# Edge cases and failure behavior

TODO: Define behavior for Last-turn deployment, failed attempts versus expiration, negligible damage, overkill, multiple missions against one faction, and simultaneous rewards/penalties.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

# Acceptance examples

TODO: Compare ignored, failed-with-damage, and successful versions of the same mission; include shared-transport contention.
Identify initial conditions, inputs/actions, expected results, and the requirement IDs exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Choose the partial-success formula and mission lifecycle rules, including whether reattempts exist; do not copy victory-only rewards as the v5 contract.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
