# Economy and Upgrades

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | ECON                                                           |
| Family      | Mechanics                                                      |
| Status      | Stub                                                           |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Purpose and boundaries

Define resource flows, personnel purchases, and agency improvements.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

- Uses [Agents](./agents.md) for Agent capability and availability rules affected by personnel purchases and upgrades.
- Uses [Initial Campaign Content](../content/initial-campaign.md) for resource, personnel, and upgrade values and catalogs.
- Uses [Numbers and Randomness](../foundation/numbers-and-randomness.md) for numeric representation, rounding, and reproducible random draws.
- Uses [Turn Resolution](../foundation/turn-resolution.md) for the timing and snapshots used for resource flows and upgrade effects.
- Refines [Domain Model](../foundation/domain-model.md) by specifying Agency resource flows, personnel purchases, and upgrade rules.
- Used by [Agents](./agents.md) for the purchases and upgrade effects that affect Agent availability and capability.
- Used by [Initial Campaign Content](../content/initial-campaign.md) for the parameter meanings and catalog requirements for resource flows, purchases, and upgrades.
- Used by [Missions](./missions.md) for the resource and upgrade rules applied to Mission rewards and costs.
- Used by [Player Information](../interfaces/player-information.md) for resource flows, purchases, and Agency upgrades.
- Used by [Turn Resolution](../foundation/turn-resolution.md) for the resource and upgrade transitions scheduled within a turn.

# Relationships

- Uses [Agents](./agents.md)
- Uses [Initial Campaign Content](../content/initial-campaign.md)
- Uses [Numbers and Randomness](../foundation/numbers-and-randomness.md)
- Uses [Turn Resolution](../foundation/turn-resolution.md)
- Refines [Domain Model](../foundation/domain-model.md)
- Used by [Agents](./agents.md)
- Used by [Initial Campaign Content](../content/initial-campaign.md)
- Used by [Missions](./missions.md)
- Used by [Player Information](../interfaces/player-information.md)
- Used by [Turn Resolution](../foundation/turn-resolution.md)

# Glossary

TODO: Define the local terms here or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

# Concepts and contract

This specification intends to refine Domain Model's Agency, Weapons and upgrades, and attribute contracts (including [Attribute bounds](../foundation/domain-model.md#attribute-bounds))
with resource flows, purchase eligibility, and upgrade effects. Agents supplies personnel state and capabilities;
Numbers and Randomness supplies arithmetic. Initial Campaign Content supplies prices and increments, while this
document supplies their meanings and formulas. Turn Resolution supplies evaluation timing. These rules remain TODOs.

TODO: Specify Spendable money, recurring funding, upkeep, contracting income, hiring, dismissal, capacity, and upgrades.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Requirements

## Income and costs

TODO: Specify formulas for hiring, dismissal, upkeep, contracting, and recurring funding; identify evaluation snapshots through TURN and distinguish cash from income rate.

## Upgrade effects

TODO: Specify all eight categories: agent capacity, transport capacity, training capacity, training skill gain, exhaustion recovery, health recovery, maximum health, and weapon damage. Define stacking and application to existing/future agents, including wounded/deployed agents.

## Purchase and capacity rules

TODO: Specify affordability, purchase atomicity, capacity accounting/reservation/release, and whether an upgrade changes current allocations. Link prices and increments to INIT.

TODO: Write concrete requirements under descriptive section titles when rules replace these placeholders.

# Edge cases and failure behavior

TODO: Define behavior for Exact affordability, insufficient funds, cap reached, zero funding, agents dying during upkeep resolution, and max-health upgrades on wounded agents.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

# Acceptance examples

TODO: Provide money/funding breakdowns, purchase rejection examples, and exact before/after upgrade calculations.
Identify initial conditions, inputs/actions, expected results, and hyperlinks to the requirement sections exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Resolve upgrade stacking, retroactivity, capacity semantics, and income/cost timing.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
