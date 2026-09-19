# Numbers and Randomness

| Metadata    | Value                                                                                     |
| ----------- | ----------------------------------------------------------------------------------------- |
| Spec ID     | NUMRNG                                                                                    |
| Family      | Foundation                                                                                |
| Status      | Stub                                                                                      |
| Scope       | Make every numeric calculation and random outcome reproducible across supported runtimes. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                            |

> This is a scoped outline, not an accepted implementation contract. TODOs must be resolved before acceptance.

# Purpose and boundaries

Make every numeric calculation and random outcome reproducible across supported runtimes.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

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

Deterministic identity generation must preserve [MODEL-002](modeling-foundations.md#model-002--identity); calculations and continuation follow [ENG-001](engine-contract.md#eng-001--derived-value-consistency) and [ENG-002](engine-contract.md#eng-002--continuation-state).

This Stub intends to refine [ENG-001](engine-contract.md#eng-001--derived-value-consistency)/[ENG-002](engine-contract.md#eng-002--continuation-state)/[ENG-004](engine-contract.md#eng-004--committed-state-integrity) with numeric operations, reproducible generator-state evolution, and
draw-consumption rules at query, command, and restoration boundaries. It uses the identity convention in [MODEL-002](modeling-foundations.md#model-002--identity);
choosing a generation algorithm does not elaborate the meaning of identity. Rejected commands cannot consume draws
under [ENG-004](engine-contract.md#eng-004--committed-state-integrity); the existing no-op and algorithm TODOs remain unresolved.

TODO: Specify Numeric units, integer/fractional quantities, percentages, probabilities, seeds, generator state, draws, and deterministic IDs.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Requirements

## Numeric contract

TODO: Choose precision/representation, allowed ranges, rounding operations and their placement, overflow behavior, and treatment of invalid numbers. Cover fractional progress, skill, health, and money.

## Randomness contract

TODO: Specify the PRNG algorithm, seed encoding, initial state, distributions, interval endpoints, integer sampling, and consumption rules. Decide shared versus separated random streams and collection ordering.

## Deterministic boundaries

TODO: Specify behavior across supported runtimes and runtime versions under the build compatibility policy in
[Engine Contract](engine-contract.md#requirements), [ENG-005](engine-contract.md#eng-005--build-compatibility); exclude ambient randomness and wall-clock time from game results.
Detail preservation of RNG state on rejection under [ENG-004](engine-contract.md#eng-004--committed-state-integrity). Decide whether no-op commands consume draws and how ID
generation relates to RNG.

TODO: Assign stable NUMRNG-NNN requirement IDs when concrete rules replace these placeholders.

# Edge cases and failure behavior

TODO: Define behavior for Zero and one probabilities, inclusive/exclusive bounds, ties, extreme values, fractional thresholds, seed equivalence, and floating-point pitfalls.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

# Acceptance examples

TODO: Provide exact arithmetic and PRNG test vectors, including seed-to-output sequences and boundary sampling cases.
Identify initial conditions, inputs/actions, expected results, and the requirement IDs exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Choose numeric representation, PRNG, draw ordering, and supported-runtime guarantees; do not silently inherit Math.random().
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
