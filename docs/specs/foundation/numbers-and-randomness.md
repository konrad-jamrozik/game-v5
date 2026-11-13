# Numbers and Randomness

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | NUMRNG                                                         |
| Family      | Foundation                                                     |
| Status      | Stub                                                           |
| Audience    | Engine designer, Implementer                                   |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Overview

This document makes every numeric calculation and random outcome reproducible across supported runtimes.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

Deterministic identity generation must preserve [Campaign instances](campaign-state.md#campaign-instances); calculations follow [Derived value consistency](engine-contract.md#derived-value-consistency) and [Determinism](engine-contract.md#determinism).

This specification intends to refine [Derived value consistency](engine-contract.md#derived-value-consistency)/[Determinism](engine-contract.md#determinism)/[Committed state integrity](engine-contract.md#committed-state-integrity) with numeric operations, reproducible generator-state evolution, and
draw-consumption rules at query, command, and restoration boundaries. It uses the identity convention in [Campaign instances](campaign-state.md#campaign-instances);
choosing a generation algorithm does not elaborate the meaning of identity. Rejected commands cannot consume draws
under [Committed state integrity](engine-contract.md#committed-state-integrity); the existing no-op and algorithm TODOs remain unresolved.

TODO: Specify Numeric units, integer/fractional quantities, percentages, probabilities, the permitted values of the Campaign seed, generator state, draws, and deterministic IDs.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Relationships

- Uses [Campaign State](./campaign-state.md)
- Uses [Core Concepts](./core-concepts.md)
- Refines [Engine Contract](./engine-contract.md)
- Used by [Agents](../mechanics/agents-spec.md)
- Used by [Combat](../mechanics/combat.md)
- Used by [Economy and Upgrades](../mechanics/economy-and-upgrades.md)
- Used by [Factions](../mechanics/factions.md)
- Used by [Investigations](../mechanics/investigations.md)

# Glossary

TODO: Define the local terms here or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

# Numeric contract

TODO: Choose precision/representation, allowed ranges, rounding operations and their placement, overflow behavior, and treatment of invalid numbers. Cover fractional progress, skill, health, and money.

# Randomness contract

Every random outcome of a Campaign derives from its Campaign seed and has no other source, under
[Campaign seed](engine-contract.md#campaign-seed). Determinism is required only within one implementation and Game
build under [Determinism](engine-contract.md#determinism). How random outcomes are derived from the Campaign seed,
including the generator algorithm and the order of random draws, is therefore the implementer's choice. Acceptance
tests may supply a Campaign seed and assert that the same Campaign seed reproduces the same outcomes, or use fixed
injected random outcomes; they must never assert which outcome a particular Campaign seed produces.

Only state changes, including Campaign instance creation, may consume gameplay randomness. Checking an invariant never
consumes gameplay randomness, and computing Derived values and checking action preconditions never consume it under
[Derived value consistency](engine-contract.md#derived-value-consistency).

TODO: Specify distributions, interval endpoints, integer sampling, and the remaining randomness consumption rules.

TODO: Specify the permitted values of a Campaign seed and its written form, e.g. text the player can copy.

# Deterministic boundaries

TODO: Specify behavior across supported runtimes and runtime versions under the Game build compatibility policy in
[Game build compatibility](saves.md#game-build-compatibility); exclude ambient randomness and wall-clock time from game results.
Detail preservation of RNG state on rejection under [Committed state integrity](engine-contract.md#committed-state-integrity). Decide whether no-op commands consume draws.

# Edge cases and failure behavior

TODO: Define behavior for Zero and one probabilities, inclusive/exclusive bounds, ties, extreme values, fractional thresholds, seed equivalence, and floating-point pitfalls.
State exact thresholds and effect ordering where relevant.

# Acceptance examples

TODO: Provide exact arithmetic test vectors and boundary sampling cases that use fixed injected random outcomes rather than seed-to-output sequences.
Identify initial conditions, inputs/actions, expected results, and hyperlinks to the requirement sections exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Choose numeric representation and supported-runtime guarantees; every random outcome must still derive from the Campaign seed under [Campaign seed](engine-contract.md#campaign-seed).
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
