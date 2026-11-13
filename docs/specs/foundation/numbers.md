# Numbers

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | NUMBERS                                                        |
| Family      | Foundation                                                     |
| Status      | Stub                                                           |
| Audience    | Engine designer, Implementer                                   |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Overview

This document defines how the game's numbers behave: which quantities are whole numbers, the precision of those that are not, and how rounding works.

These rules are observable, e.g. through the amounts the engine API reports and a Campaign save holds, so they are
requirements on every implementation. This document is a placeholder: its scope is fixed, and its rules are not yet
written.

This document owns nothing about randomness. [Determinism](engine-contract.md#determinism) and
[Campaign seed](engine-contract.md#campaign-seed) in Engine Contract own reproducibility and the Campaign seed, and
each Mechanics specification owns the distributions of its own random outcomes. This document owns the precision of
a probability only as it owns the precision of any other number.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

# Relationships

- Used by [Agents](../mechanics/agents-spec.md)
- Used by [Combat](../mechanics/combat.md)
- Used by [Economy and Upgrades](../mechanics/economy-and-upgrades.md)
- Used by [Factions](../mechanics/factions.md)
- Used by [Investigations](../mechanics/investigations.md)

# Glossary

TODO: Define the local terms here or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

# Whole and fractional quantities

TODO: State which quantities are whole numbers and which are not, e.g. money, health, skill, and fractional
progress, with the unit and allowed range of each kind.

# Precision

TODO: State the precision of every quantity that is not a whole number, including percentages and probabilities, so
that every implementation computes equal values on every machine, as
[Determinism](engine-contract.md#determinism) requires.

# Rounding

TODO: Define the rounding operations a formula may name and the default placement of rounding, for use by formulas
under [Formula and state machine notations](../governance/spec-conventions.md#formula-and-state-machine-notations).

# Edge cases and failure behavior

TODO: Define behavior at the limits of allowed ranges, for values exactly halfway between two rounding results, and
for results that are not valid numbers, e.g. a division by zero.

# Acceptance examples

TODO: Provide exact arithmetic examples, including boundary cases, each with its inputs, expected result, and
hyperlinks to the requirement sections exercised.

# Open decisions

- TODO: Choose which quantities are whole numbers and the precision of those that are not.
- TODO: Choose the rounding operations and the behavior at the limits of allowed ranges.
