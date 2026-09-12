# Campaign

| Metadata    | Value                                                                                     |
| ----------- | ----------------------------------------------------------------------------------------- |
| Spec ID     | CAMP                                                                                      |
| Status      | Stub                                                                                      |
| Scope       | Define campaign initialization, global panic, and the conditions that start and end play. |
| Conventions | [Specification conventions](../spec-conventions.md)                                       |

> This is a scoped outline, not an accepted implementation contract. TODOs must be resolved before acceptance.

## 1. Purpose and boundaries

Define campaign initialization, global panic, and the conditions that start and end play.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

## 2. Dependencies and terminology

### Relationships

| Type      | Target                                                     | Scope                                                                           |
| --------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `refines` | [Domain Model](../foundation/domain-model.md)              | Campaign initialization, global progression facts, panic, and terminal outcomes |
| `uses`    | [Turn Resolution](../foundation/turn-resolution.md)        | Timing and precedence for turn counters, panic, and outcome evaluation          |
| `uses`    | [Initial Campaign Content](../content/initial-campaign.md) | Starting configuration, scenario values, and victory content                    |

TODO: Define the local terms below or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

## 3. Concepts and contract

TODO: Specify Initial campaign, ongoing/won/lost lifecycle, panic, funding/money boundary, and victory objective.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

## 4. Requirements

### Initialization

TODO: Specify how the scenario and seed produce initial state, including roster, resources, progression, factions, and counters; link exact content values to INIT.

### Panic and endings

TODO: Specify panic representation, clamping, contributing effects, victory and defeat predicates, and simultaneous win/loss precedence. Decide whether v5 retains the final Peace on Earth investigation.

### Terminal behavior

TODO: Define allowed observations and commands after an ending and how history restores an ongoing campaign.

TODO: Assign stable CAMP-NNN requirement IDs when concrete rules replace these placeholders.

## 5. Edge cases and failure behavior

TODO: Define behavior for Zero money versus negative money, panic at its limit, all factions defeated, same-turn victory/defeat, and post-ending commands.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

## 6. Acceptance examples

TODO: Give initialization and ending scenarios with exact expected state and outcome reasons.
Identify initial conditions, inputs/actions, expected results, and the requirement IDs exercised. Reference shared
fixtures instead of introducing implicit balance values.

## 7. Open decisions

- TODO: Choose victory objectives, panic behavior, and terminal-condition precedence.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
