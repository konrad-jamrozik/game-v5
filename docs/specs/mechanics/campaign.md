# Campaign

| Metadata    | Value                                                                                     |
| ----------- | ----------------------------------------------------------------------------------------- |
| Spec ID     | CAMP                                                                                      |
| Family      | Mechanics                                                                                 |
| Status      | Stub                                                                                      |
| Scope       | Define campaign initialization, global panic, and the conditions that start and end play. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                            |

> This is a scoped outline, not an accepted implementation contract. TODOs must be resolved before acceptance.

# Purpose and boundaries

Define campaign initialization, global panic, and the conditions that start and end play.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

# Relationships

## Dependencies

| Dependency                                                 | Relationship | Scope                                                                           |
| ---------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------- |
| [Domain Model](../foundation/domain-model.md)              | `refines`    | Campaign initialization, global progression facts, panic, and terminal outcomes |
| [Turn Resolution](../foundation/turn-resolution.md)        | `uses`       | Timing and precedence for turn counters, panic, and outcome evaluation          |
| [Initial Campaign Content](../content/initial-campaign.md) | `uses`       | Starting configuration, scenario values, and victory content                    |

## Dependents

| Dependent                                                  | Relationship | Scope                                                                           |
| ---------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------- |
| [Initial Campaign Content](../content/initial-campaign.md) | `refines`    | Concrete starting configuration, outcome content, and named campaign parameters |
| [Player Information](../interfaces/player-information.md)  | `uses`       | Campaign status, panic, objectives, and terminal outcomes                       |
| [Turn Resolution](../foundation/turn-resolution.md)        | `uses`       | Turn counters, panic, and terminal-outcome evaluation                           |

# Glossary

TODO: Define the local terms here or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

# Concepts and contract

TODO: Specify Initial campaign, ongoing/won/lost lifecycle, panic, funding/money boundary, and victory objective.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Requirements

## Initialization

TODO: Specify how the scenario and seed produce initial state, including roster, resources, progression, factions, and counters; link exact content values to INIT.

## Panic and endings

TODO: Specify panic representation, clamping, contributing effects, victory and defeat predicates, and simultaneous win/loss precedence. Decide whether v5 retains the final Peace on Earth investigation.

## Terminal behavior

TODO: Define allowed observations and commands after an ending and how history restores an ongoing campaign.

TODO: Assign stable CAMP-NNN requirement IDs when concrete rules replace these placeholders.

# Edge cases and failure behavior

TODO: Define behavior for Zero money versus negative money, panic at its limit, all factions defeated, same-turn victory/defeat, and post-ending commands.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

# Acceptance examples

TODO: Give initialization and ending scenarios with exact expected state and outcome reasons.
Identify initial conditions, inputs/actions, expected results, and the requirement IDs exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Choose victory objectives, panic behavior, and terminal-condition precedence.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
