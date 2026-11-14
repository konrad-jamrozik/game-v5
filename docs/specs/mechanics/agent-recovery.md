# Agent Recovery

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | RECOVER                                                        |
| Family      | Mechanics                                                      |
| Status      | Stub                                                           |
| Audience    | Engine designer, Content designer, AI designer, Implementer    |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Overview

This document defines how an Agent's health goes up and exhaustion goes down, and the result when several rules
change one of those values in the same turn.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

This specification intends to refine Agents' health and exhaustion contract
([Attributes and effectiveness](./agents-spec.md#attributes-and-effectiveness) and
[Modifiable values](./agents-spec.md#modifiable-values)) with the rules that raise health and lower exhaustion, within
the meanings and bounds Agents states for those values. It reads the recovery rates as the modifiable values Agents
lists and does not depend on how upgrades change them. It uses Missions for when a returning Agent starts recovering,
and applies its rules in the Agent recovery step under [Turn advancement steps](../foundation/turn-advancement.md#turn-advancement-steps).
The rules that lower health or raise exhaustion belong to the specifications owning the activity, e.g. Combat. The
recovery rules remain TODOs below.

TODO: Specify health recovery, exhaustion recovery, the Agent states in which each applies, and the combined result
of several changes to one value in a turn.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Relationships

- Uses [Missions](./missions.md)
- Uses [Turn Advancement](../foundation/turn-advancement.md)
- Refines [Agents](./agents-spec.md)
- Used by [Player Information](../interfaces/player-information.md)

# Glossary

Health and Exhaustion are defined by the [Agents glossary](./agents-spec.md#glossary).

TODO: Define the local terms here or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

# Health recovery

TODO: Specify the amount recovered per turn, the Agent states in which health recovers, when recovery completes, and
what an Agent can do while recovering.

# Exhaustion recovery

TODO: Specify the amount recovered per turn, the Agent states in which exhaustion recovers, and whether recovery
differs by Current assignment.

# Several changes in one turn

TODO: State the combined result when a value is both raised and lowered in the same Advance turn, e.g. an Agent that
gains exhaustion from an activity and recovers exhaustion in that turn, following the order under
[Turn advancement steps](../foundation/turn-advancement.md#turn-advancement-steps).

# Edge cases and failure behavior

TODO: Define behavior for recovery reaching the maximum exactly, an Agent that returns from a Mission during Advance
turn, recovery interrupted by a new Current assignment, and a recovery rate changed by an upgrade while recovery is
underway.
State when Mission survivors begin recovering, consistent with the order under [Turn advancement steps](../foundation/turn-advancement.md#turn-advancement-steps).
State exact thresholds and effect ordering where relevant.

# Acceptance examples

TODO: Provide multi-turn recovery examples for health and exhaustion, including the turn an Agent returns from a Mission.
Identify initial conditions, inputs/actions, expected results, and hyperlinks to the requirement sections exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Decide whether recovery depends on how the damage was taken; if it does, this specification also uses Combat.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
