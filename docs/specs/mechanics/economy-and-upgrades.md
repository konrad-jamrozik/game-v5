# Economy and Upgrades

| Metadata    | Value                                                                |
| ----------- | -------------------------------------------------------------------- |
| Spec ID     | ECON                                                                 |
| Status      | Stub                                                                 |
| Scope       | Define resource flows, personnel purchases, and agency improvements. |
| Conventions | [Specification conventions](../spec-conventions.md)                  |

> This is a scoped outline, not an accepted implementation contract. TODOs must be resolved before acceptance.

## 1. Purpose and boundaries

Define resource flows, personnel purchases, and agency improvements.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

## 2. Dependencies and terminology

### Relationships

| Type      | Target                                                            | Scope                                                                       |
| --------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `refines` | [Domain Model](../foundation/domain-model.md)                     | Agency resources, roster, upgrade acquisitions, capabilities, and capacity  |
| `uses`    | [Numbers and Randomness](../foundation/numbers-and-randomness.md) | Money, funding, costs, attribute changes, and rounding                      |
| `uses`    | [Agents](agents.md)                                               | Hiring, dismissal, roster eligibility, and agent-facing upgrade effects     |
| `uses`    | [Initial Campaign Content](../content/initial-campaign.md)        | Purchase prices, upgrade increments, limits, and other named balance values |

TODO: Define the local terms below or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

## 3. Concepts and contract

TODO: Specify Spendable money, recurring funding, upkeep, contracting income, hiring, dismissal, capacity, and upgrades.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

## 4. Requirements

### Income and costs

TODO: Specify formulas for hiring, dismissal, upkeep, contracting, and recurring funding; identify evaluation snapshots through TURN and distinguish cash from income rate.

### Upgrade effects

TODO: Specify all eight categories: agent capacity, transport capacity, training capacity, training skill gain, exhaustion recovery, hit-point recovery, maximum hit points, and weapon damage. Define stacking and application to existing/future agents, including wounded/deployed agents.

### Purchase and capacity rules

TODO: Specify affordability, purchase atomicity, capacity accounting/reservation/release, and whether an upgrade changes current allocations. Link prices and increments to INIT.

TODO: Assign stable ECON-NNN requirement IDs when concrete rules replace these placeholders.

## 5. Edge cases and failure behavior

TODO: Define behavior for Exact affordability, insufficient funds, cap reached, zero funding, agents dying during upkeep resolution, and max-health upgrades on wounded agents.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

## 6. Acceptance examples

TODO: Provide money/funding breakdowns, purchase rejection examples, and exact before/after upgrade calculations.
Identify initial conditions, inputs/actions, expected results, and the requirement IDs exercised. Reference shared
fixtures instead of introducing implicit balance values.

## 7. Open decisions

- TODO: Resolve upgrade stacking, retroactivity, capacity semantics, and income/cost timing.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
