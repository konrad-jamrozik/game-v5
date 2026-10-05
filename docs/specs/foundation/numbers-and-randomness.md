# Numbers and Randomness

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | NUMRNG                                                         |
| Family      | Foundation                                                     |
| Status      | Stub                                                           |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Purpose and boundaries

Make every numeric calculation and random outcome reproducible across supported runtimes.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

- Uses [Modeling Foundations](./modeling-foundations.md) for Rule, Authoritative value, and Derived value terminology in numeric contracts.
- Refines [Engine Contract](./engine-contract.md) by specifying the numeric and random behavior required for reproducible execution.
- Used by [Agents](../mechanics/agents.md) for numeric representation, rounding, and reproducible random draws.
- Used by [Combat](../mechanics/combat.md) for numeric representation, rounding, and reproducible random draws.
- Used by [Economy and Upgrades](../mechanics/economy-and-upgrades.md) for numeric representation, rounding, and reproducible random draws.
- Used by [Factions](../mechanics/factions.md) for numeric representation, rounding, and reproducible random draws.
- Used by [History and Persistence](./history-and-persistence.md) for numeric representation, rounding, and reproducible random draws.
- Used by [Investigations](../mechanics/investigations.md) for numeric representation, rounding, and reproducible random draws.
- Used by [Turn Resolution](./turn-resolution.md) for numeric representation, rounding, and reproducible random draws.

# Relationships

- Uses [Modeling Foundations](./modeling-foundations.md)
- Refines [Engine Contract](./engine-contract.md)
- Used by [Agents](../mechanics/agents.md)
- Used by [Combat](../mechanics/combat.md)
- Used by [Economy and Upgrades](../mechanics/economy-and-upgrades.md)
- Used by [Factions](../mechanics/factions.md)
- Used by [History and Persistence](./history-and-persistence.md)
- Used by [Investigations](../mechanics/investigations.md)
- Used by [Turn Resolution](./turn-resolution.md)

# Glossary

TODO: Define the local terms here or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

# Concepts and contract

Deterministic identity generation must preserve [Campaign instances](modeling-foundations.md#campaign-instances); calculations and continuation follow [Derived value consistency](engine-contract.md#derived-value-consistency) and [Continuation state](engine-contract.md#continuation-state).

This specification intends to refine [Derived value consistency](engine-contract.md#derived-value-consistency)/[Continuation state](engine-contract.md#continuation-state)/[Committed state integrity](engine-contract.md#committed-state-integrity) with numeric operations, reproducible generator-state evolution, and
draw-consumption rules at query, command, and restoration boundaries. It uses the identity convention in [Campaign instances](modeling-foundations.md#campaign-instances);
choosing a generation algorithm does not elaborate the meaning of identity. Rejected commands cannot consume draws
under [Committed state integrity](engine-contract.md#committed-state-integrity); the existing no-op and algorithm TODOs remain unresolved.

TODO: Specify Numeric units, integer/fractional quantities, percentages, probabilities, seeds, generator state, draws, and deterministic IDs.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Requirements

## Numeric contract

TODO: Choose precision/representation, allowed ranges, rounding operations and their placement, overflow behavior, and treatment of invalid numbers. Cover fractional progress, skill, health, and money.

## Randomness contract

TODO: Specify the PRNG algorithm, seed encoding, initial state, distributions, interval endpoints, integer sampling, and consumption rules. Decide shared versus separated random streams and collection ordering.

## Deterministic boundaries

TODO: Specify behavior across supported runtimes and runtime versions under the Game build compatibility policy in
[Requirements](engine-contract.md#requirements), [Game build compatibility](engine-contract.md#game-build-compatibility); exclude ambient randomness and wall-clock time from game results.
Detail preservation of RNG state on rejection under [Committed state integrity](engine-contract.md#committed-state-integrity). Decide whether no-op commands consume draws and how ID
generation relates to RNG.

TODO: Write concrete requirements under descriptive section titles when rules replace these placeholders.

# Edge cases and failure behavior

TODO: Define behavior for Zero and one probabilities, inclusive/exclusive bounds, ties, extreme values, fractional thresholds, seed equivalence, and floating-point pitfalls.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

# Acceptance examples

TODO: Provide exact arithmetic and PRNG test vectors, including seed-to-output sequences and boundary sampling cases.
Identify initial conditions, inputs/actions, expected results, and hyperlinks to the requirement sections exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Choose numeric representation, PRNG, draw ordering, and supported-runtime guarantees; do not silently inherit Math.random().
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
