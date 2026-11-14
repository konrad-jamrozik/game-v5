# Economy and Upgrades

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | ECON                                                           |
| Family      | Mechanics                                                      |
| Status      | Stub                                                           |
| Audience    | Engine designer, Content designer, AI designer, Implementer    |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Overview

This document defines resource flows, personnel purchases, and agency improvements.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

This specification intends to refine Domain Model's Agency, Weapons and upgrades, and attribute contracts (including [Attribute bounds](../foundation/domain-model.md#attribute-bounds))
with resource flows, purchase eligibility, and upgrade effects. Agents supplies personnel state and capabilities.
This specification also intends to refine Agents' [Modifiable values](./agents-spec.md#modifiable-values) with how
each upgrade changes them;
Numbers supplies arithmetic. GDRs supply prices and increments, while this
document supplies their meanings and formulas. This document states which values its formulas use under
[Turn advancement](../foundation/engine-contract.md#turn-advancement). These rules remain TODOs.

TODO: Specify Spendable money, recurring funding, upkeep, contracting income, hiring, dismissal, capacity, and upgrades.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Relationships

- Uses [Agents](./agents-spec.md)
- Uses [Engine Contract](../foundation/engine-contract.md)
- Uses [Numbers](../foundation/numbers.md)
- Refines [Agents](./agents-spec.md)
- Refines [Domain Model](../foundation/domain-model.md)
- Used by [Missions](./missions.md)
- Used by [Player Information](../interfaces/player-information.md)

# Glossary

TODO: Define the local terms here or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

# Income and costs

TODO: Specify formulas for hiring, dismissal, upkeep, contracting, and recurring funding; state each formula's exceptions to the turn-start default under [Turn advancement](../foundation/engine-contract.md#turn-advancement), e.g. whether upkeep uses an Agent's rank before or after the same turn's training and when a funding change starts producing income; and distinguish cash from income rate.

# Upgrade effects

TODO: Specify all eight categories: agent capacity, transport capacity, training capacity, training skill gain, exhaustion recovery, health recovery, maximum health, and weapon damage. Define stacking and application to existing/future agents, including wounded/deployed agents.

# Purchase and capacity rules

TODO: Specify affordability, purchase atomicity, capacity accounting/reservation/release, and whether an upgrade changes current allocations. Name the GDR values that supply prices and increments.

# Turn series of money and purchases

This specification declares the following Turn series, under
[Turn series](../foundation/campaign-state.md#turn-series) in Campaign State. Each records the Agency's money.

| Turn series                | Recorded moment of each turn                                             |
| -------------------------- | ------------------------------------------------------------------------ |
| Money at the start of turn | The Committed state in which the turn starts, before any action of it.   |
| Money at the end of turn   | The Committed state in which the Advance turn that ends the turn begins. |

TODO: Declare the remaining Turn series this specification owns, e.g. upgrades purchased during each turn or upkeep
paid in each turn. For each, state the recorded value, its unit, and the recorded moment of each turn. State which
money value the two Turn series above record once Spendable money is specified.

# Edge cases and failure behavior

TODO: Define behavior for Exact affordability, insufficient funds, cap reached, zero funding, agents dying during upkeep resolution, and max-health upgrades on wounded agents.
State exact thresholds and effect ordering where relevant.

# Acceptance examples

TODO: Provide money/funding breakdowns, purchase rejection examples, and exact before/after upgrade calculations.
Identify initial conditions, inputs/actions, expected results, and hyperlinks to the requirement sections exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Resolve upgrade stacking, retroactivity, capacity semantics, and income/cost timing.
- TODO: State the rule determining the Agency Campaign instances that the initial Campaign state contains, and name the GDRs supplying their initial values, under [Initial Campaign state](../foundation/domain-model.md#initial-campaign-state).
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
