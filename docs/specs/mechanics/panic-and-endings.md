# Panic and Endings

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | ENDING                                                         |
| Family      | Mechanics                                                      |
| Status      | Stub                                                           |
| Audience    | Engine designer, Content designer, AI designer, Implementer    |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Overview

This document defines global panic, the conditions that end a Campaign in victory or defeat, and what remains possible
after an ending.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

This specification intends to refine Domain Model's Campaign contract ([Agency per Campaign](../foundation/domain-model.md#agency-per-campaign)) with
panic and ending behavior. It supplies the ending predicates, which apply in the Panic and Ending check steps under
[Turn advancement steps](../foundation/turn-advancement.md#turn-advancement-steps). Campaign creation and Campaign configuration
are owned by [Campaign configuration presets](../foundation/configuration.md#campaign-configuration-presets) in
Configuration, not by this document. Panic and ending rules remain TODOs below.

TODO: Specify ongoing/won/lost lifecycle, panic, funding/money boundary, and victory objective.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Relationships

- Uses [Core Concepts](../foundation/core-concepts.md)
- Uses [Engine Contract](../foundation/engine-contract.md)
- Uses [Turn Advancement](../foundation/turn-advancement.md)
- Refines [Domain Model](../foundation/domain-model.md)

# Glossary

Campaign and Campaign state are defined by [Core Concepts](../foundation/core-concepts.md#glossary).

TODO: Define the local terms here, e.g. panic, or link their authoritative definitions.

# Panic and endings

TODO: Specify panic representation, clamping, contributing effects, victory and defeat predicates, and simultaneous win/loss precedence. Decide whether v5 retains the final Peace on Earth investigation.

# Terminal behavior

TODO: Define allowed Player-visible information and commands after an ending and how undo restores an ongoing campaign.

# Player-visible information

TODO: State which values this specification owns are Player-visible information, the reveal conditions of each, and
how the player tells an unknown value apart from zero or absence, under
[Player queries and actions](../foundation/engine-contract.md#player-queries-and-actions) in Engine Contract.

# Edge cases and failure behavior

TODO: Define behavior for Zero money versus negative money, panic at its limit, all factions defeated, same-turn victory/defeat, and post-ending commands.
State the ending predicates in terms of the values after the earlier steps of the same Advance turn, under [Values a step uses](../foundation/turn-advancement.md#values-a-step-uses).
State exact thresholds and effect ordering where relevant.

# Acceptance examples

TODO: Give ending scenarios with exact expected state and outcome reasons.
Identify initial conditions, inputs/actions, expected results, and hyperlinks to the requirement sections exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Choose victory objectives, panic behavior, and terminal-condition precedence.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
