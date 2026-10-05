# Campaign

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | CAMP                                                           |
| Family      | Mechanics                                                      |
| Status      | Stub                                                           |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Purpose and boundaries

Define campaign initialization, global panic, and the conditions that start and end play.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

- Uses [Initial Campaign Content](../content/initial-campaign.md) for the starting GDRs and values needed to initialize a playable Campaign.
- Uses [Turn Resolution](../foundation/turn-resolution.md) for the timing of Campaign updates and checks for end conditions.
- Refines [Domain Model](../foundation/domain-model.md) by specifying Campaign initialization, global panic, and victory and defeat rules.
- Used by [Initial Campaign Content](../content/initial-campaign.md) for the initialization contract that starting Campaign data must satisfy.
- Used by [Player Information](../interfaces/player-information.md) for Campaign initialization and global start and end conditions.
- Used by [Turn Resolution](../foundation/turn-resolution.md) for the Campaign update and end-condition rules scheduled within turn phases.

# Relationships

- Uses [Initial Campaign Content](../content/initial-campaign.md)
- Uses [Turn Resolution](../foundation/turn-resolution.md)
- Refines [Domain Model](../foundation/domain-model.md)
- Used by [Initial Campaign Content](../content/initial-campaign.md)
- Used by [Player Information](../interfaces/player-information.md)
- Used by [Turn Resolution](../foundation/turn-resolution.md)

# Glossary

TODO: Define the local terms here or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

# Concepts and contract

This specification intends to refine Domain Model's campaign boundary ([Campaign boundary](../foundation/domain-model.md#campaign-boundary-1) and its Campaign and agency section) with
initialization and ending behavior. Initial Campaign Content supplies the exact starting values and catalogs;
this document supplies their initialization meaning. Turn Resolution supplies state-read timing and the phase in
which campaign predicates are checked; this document supplies the predicates. The exact rules remain TODOs below.

TODO: Specify Initial campaign, ongoing/won/lost lifecycle, panic, funding/money boundary, and victory objective.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Requirements

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

TODO: Give initialization and ending scenarios with exact expected state and outcome reasons.
Identify initial conditions, inputs/actions, expected results, and hyperlinks to the requirement sections exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Choose victory objectives, panic behavior, and terminal-condition precedence.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
