# Numbers and Randomness

| Metadata    | Value                                                                                     |
| ----------- | ----------------------------------------------------------------------------------------- |
| Spec ID     | NUM                                                                                       |
| Status      | Stub                                                                                      |
| Scope       | Make every numeric calculation and random outcome reproducible across supported runtimes. |
| Conventions | [Specification conventions](../spec-conventions.md)                                       |

> This is a scoped outline, not an accepted implementation contract. TODOs must be resolved before acceptance.

# Purpose and boundaries

Make every numeric calculation and random outcome reproducible across supported runtimes.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

# Relationships

## Dependencies

| Dependency                                        | Relationship | Scope                                                                 |
| ------------------------------------------------- | ------------ | --------------------------------------------------------------------- |
| [Modeling Foundations](./modeling-foundations.md) | `refines`    | Deterministic generation within the identity semantics of MOD-002     |
| [Engine Contract](./engine-contract.md)           | `uses`       | Reproducible continuation and non-mutating calculations (ENG-001/002) |

## Dependents

| Dependent                                                    | Relationship | Scope                                                                             |
| ------------------------------------------------------------ | ------------ | --------------------------------------------------------------------------------- |
| [Agents](../mechanics/agents.md)                             | `uses`       | Attribute arithmetic, thresholds, rounding, and reproducible random effects       |
| [Combat](../mechanics/combat.md)                             | `uses`       | Combat arithmetic, rounding, draw sites, and deterministic ordering               |
| [Economy and Upgrades](../mechanics/economy-and-upgrades.md) | `uses`       | Money, funding, costs, attribute changes, and rounding                            |
| [Factions](../mechanics/factions.md)                         | `uses`       | Escalation arithmetic, timing distributions, and operation selection              |
| [History and Persistence](./history-and-persistence.md)      | `uses`       | RNG and ID-generation state required for replay and restoration                   |
| [Investigations](../mechanics/investigations.md)             | `uses`       | Progress arithmetic, hidden-difficulty sampling, probability, draws, and rounding |
| [Turn Resolution](./turn-resolution.md)                      | `uses`       | Deterministic draw ordering and numeric effect application                        |

# Glossary

TODO: Define the local terms here or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

# Concepts and contract

TODO: Specify Numeric units, integer/fractional quantities, percentages, probabilities, seeds, generator state, draws, and deterministic IDs.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Requirements

## Numeric contract

TODO: Choose precision/representation, allowed ranges, rounding operations and their placement, overflow behavior, and treatment of invalid numbers. Cover fractional progress, skill, health, and money.

## Randomness contract

TODO: Specify the PRNG algorithm, seed encoding, initial state, distributions, interval endpoints, integer sampling, and consumption rules. Decide shared versus separated random streams and collection ordering.

## Deterministic boundaries

TODO: Specify behavior across runtimes and versions; exclude ambient randomness and wall-clock time from game results. Define whether rejected/no-op commands consume draws and how ID generation relates to RNG.

TODO: Assign stable NUM-NNN requirement IDs when concrete rules replace these placeholders.

# Edge cases and failure behavior

TODO: Define behavior for Zero and one probabilities, inclusive/exclusive bounds, ties, extreme values, fractional thresholds, seed equivalence, and floating-point pitfalls.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

# Acceptance examples

TODO: Provide exact arithmetic and PRNG test vectors, including seed-to-output sequences and boundary sampling cases.
Identify initial conditions, inputs/actions, expected results, and the requirement IDs exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Choose numeric representation, PRNG, draw ordering, and compatibility guarantees; do not silently inherit Math.random().
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
