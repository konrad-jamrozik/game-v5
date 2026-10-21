# Campaign

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | CAMP                                                           |
| Family      | Mechanics                                                      |
| Status      | Stub                                                           |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Purpose and boundaries

Define campaign initialization, adjustable Campaign configuration, global panic, and the conditions that start and end play.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

- Uses [Core Concepts](../foundation/core-concepts.md) for Campaign state, World state, and Campaign configuration meanings applied to adjustable campaign parameters.
- Uses [Engine Contract](../foundation/engine-contract.md) for atomic command commitment and action-history guarantees applied to Campaign configuration changes.
- Uses [Initial Campaign Content](../content/initial-campaign.md) for the starting GDRs and values needed to initialize a playable Campaign.
- Uses [Turn Resolution](../foundation/turn-resolution.md) for the timing of Campaign updates and checks for end conditions.
- Refines [Domain Model](../foundation/domain-model.md) by specifying Campaign initialization, Campaign configuration changes, global panic, and victory and defeat rules.
- Used by [Initial Campaign Content](../content/initial-campaign.md) for the initialization contract that starting Campaign data must satisfy.
- Used by [Player Information](../interfaces/player-information.md) for Campaign initialization and global start and end conditions.
- Used by [Turn Resolution](../foundation/turn-resolution.md) for the Campaign update and end-condition rules scheduled within turn phases.

# Relationships

- Uses [Core Concepts](../foundation/core-concepts.md)
- Uses [Engine Contract](../foundation/engine-contract.md)
- Uses [Initial Campaign Content](../content/initial-campaign.md)
- Uses [Turn Resolution](../foundation/turn-resolution.md)
- Refines [Domain Model](../foundation/domain-model.md)
- Used by [Initial Campaign Content](../content/initial-campaign.md)
- Used by [Player Information](../interfaces/player-information.md)
- Used by [Turn Resolution](../foundation/turn-resolution.md)

# Glossary

Campaign state, World state, and Campaign configuration are defined by
[Core Concepts](../foundation/core-concepts.md#glossary). This document uses those meanings without redefining them.

# Concepts and contract

This specification intends to refine Domain Model's campaign boundary ([Campaign boundary](../foundation/domain-model.md#campaign-boundary-1) and its Campaign and agency section) with
initialization, Campaign configuration changes, and ending behavior. Initial Campaign Content supplies the exact starting values and catalogs;
this document supplies their initialization meaning. Turn Resolution supplies state-read timing and the phase in
which campaign predicates are checked; this document supplies the predicates. Initialization and ending rules remain
TODOs below; Campaign configuration requirements are specified separately.

TODO: Specify Initial campaign, ongoing/won/lost lifecycle, panic, funding/money boundary, and victory objective.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Requirements

## Campaign configuration

Difficulty is represented by Campaign configuration owned by the Campaign. It may consist of independently
adjustable parameters rather than a single difficulty level. Examples of possible parameters are enemy count and
an investigation difficulty multiplier; these examples do not establish a final parameter inventory or balance values.

Players must be able to change difficulty during an ongoing Campaign without restarting it or enabling Dev mode.
An accepted configuration change is an atomic Campaign mutation at a committed action boundary and does not
itself advance the turn. The complete requested change must be validated before commitment; invalid changes
leave Campaign state unchanged. A change is retained in action history with the inputs needed to reproduce it.
Requests that leave configuration unchanged follow Engine Contract's rules for actions with no effect.

Each parameter's owning mechanic must specify its Type, permitted values, creation default source, and effect timing.
It must state whether a change affects existing World state, future calculations or generation, or both, including
how activities already underway are treated. Updating configuration alone does not authorize regenerating existing
World state, rewriting past outcomes, or resampling randomness. Any such effect requires an explicit mechanical rule.
Initial Campaign Content owns concrete defaults and balance values; subsystem mechanics own formulas and effects.

The exact parameter inventory and public command/report signatures remain open decisions. Interface specifications
must expose the mechanical contract rather than introduce different validation or timing rules.

## Initialization

TODO: Specify how the scenario and seed produce initial state, covering all of these required areas: roster, resources, progression, factions, and counters; link exact Game Data Record (GDR) values to INIT.

## Panic and endings

TODO: Specify panic representation, clamping, contributing effects, victory and defeat predicates, and simultaneous win/loss precedence. Decide whether v5 retains the final Peace on Earth investigation.

## Terminal behavior

TODO: Define allowed Player-visible information and commands after an ending and how history restores an ongoing campaign.

TODO: Write concrete requirements under descriptive section titles when rules replace these placeholders.

# Edge cases and failure behavior

TODO: Define behavior for Zero money versus negative money, panic at its limit, all factions defeated, same-turn victory/defeat, and post-ending commands.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

# Acceptance examples

- **Adjustment during play:** In an ongoing Campaign, submit valid configuration values different from the current ones. The requested values
  commit together, the turn remains unchanged, and the change is retained as one action-history entry
  ([Campaign configuration](#campaign-configuration)).
- **Invalid adjustment:** Submit a configuration change containing a value outside its parameter's permitted range.
  The whole request fails and both configuration and World state remain unchanged
  ([Campaign configuration](#campaign-configuration)).

TODO: Give initialization and ending scenarios with exact expected state and outcome reasons.
Identify initial conditions, inputs/actions, expected results, and hyperlinks to the requirement sections exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Define the adjustable difficulty parameter inventory, each parameter's owning mechanic and effect timing,
  and the corresponding public command/report signatures in the interface specifications.
- TODO: Choose victory objectives, panic behavior, and terminal-condition precedence.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
