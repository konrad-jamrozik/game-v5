# Numbers and Randomness

| Metadata    | Value                                                                                     |
| ----------- | ----------------------------------------------------------------------------------------- |
| Spec ID     | NUM                                                                                       |
| Status      | Stub                                                                                      |
| Scope       | Make every numeric calculation and random outcome reproducible across supported runtimes. |
| Conventions | [Specification conventions](../spec-conventions.md)                                       |

> This is a scoped outline, not an accepted implementation contract. TODOs must be resolved before acceptance.

## 1. Purpose and boundaries

Make every numeric calculation and random outcome reproducible across supported runtimes.

TODO: Confirm the precise included/excluded scope and rule ownership using the [design stem](../../game-design-stem.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

## 2. Dependencies and terminology

- **Normative draft:** [Modeling Foundations](modeling-foundations.md) owns identity semantics (MOD-002); this spec owns generation.
- **Normative draft:** [Engine Contract](engine-contract.md) owns reproducible continuation and non-mutating calculations (ENG-001/002).
- TODO: Identify any normative dependencies needed beyond the design stem; do not introduce ambient platform behavior as an unstated dependency.

TODO: Define the local terms below or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

## 3. Concepts and contract

TODO: Specify Numeric units, integer/fractional quantities, percentages, probabilities, seeds, generator state, draws, and deterministic IDs.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

## 4. Requirements

### Numeric contract

TODO: Choose precision/representation, allowed ranges, rounding operations and their placement, overflow behavior, and treatment of invalid numbers. Cover fractional progress, skill, health, and money.

### Randomness contract

TODO: Specify the PRNG algorithm, seed encoding, initial state, distributions, interval endpoints, integer sampling, and consumption rules. Decide shared versus separated random streams and collection ordering.

### Deterministic boundaries

TODO: Specify behavior across runtimes and versions; exclude ambient randomness and wall-clock time from game results. Define whether rejected/no-op commands consume draws and how ID generation relates to RNG.

TODO: Assign stable NUM-NNN requirement IDs when concrete rules replace these placeholders.

## 5. Edge cases and failure behavior

TODO: Define behavior for Zero and one probabilities, inclusive/exclusive bounds, ties, extreme values, fractional thresholds, seed equivalence, and floating-point pitfalls.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

## 6. Acceptance examples

TODO: Provide exact arithmetic and PRNG test vectors, including seed-to-output sequences and boundary sampling cases.
Identify initial conditions, inputs/actions, expected results, and the requirement IDs exercised. Reference shared
fixtures instead of introducing implicit balance values.

## 7. Open decisions

- TODO: Choose numeric representation, PRNG, draw ordering, and compatibility guarantees; do not silently inherit Math.random().
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
