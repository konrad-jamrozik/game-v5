# Turn Resolution

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | TURN                                                           |
| Family      | Foundation                                                     |
| Status      | Stub                                                           |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Purpose and boundaries

Define exactly when subsystem rules run and which state each phase reads.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

- Uses [Agents](../mechanics/agents.md) for Agent assignment, exhaustion, and recovery transitions scheduled within a turn.
- Uses [Campaign](../mechanics/campaign.md) for the Campaign update and end-condition rules scheduled within turn phases.
- Uses [Domain Model](./domain-model.md) for the game structures and references read and changed by turn phases.
- Uses [Economy and Upgrades](../mechanics/economy-and-upgrades.md) for the resource and upgrade transitions scheduled within a turn.
- Uses [Factions](../mechanics/factions.md) for the Faction pressure and operation occurrence transitions scheduled within a turn.
- Uses [Investigations](../mechanics/investigations.md) for the Investigation progress and completion transitions scheduled within a turn.
- Uses [Missions](../mechanics/missions.md) for the Mission transitions and Campaign consequences scheduled within a turn.
- Uses [Numbers and Randomness](./numbers-and-randomness.md) for numeric representation, rounding, and reproducible random draws.
- Refines [Engine Contract](./engine-contract.md) by specifying the precise phase order and snapshot rules for executing a turn.
- Used by [Campaign](../mechanics/campaign.md) for the timing of Campaign updates and checks for end conditions.
- Used by [Campaign Integration and Acceptance Tests](../acceptance/campaign-integration-and-acceptance-tests.md) for effect timing and state snapshots in cross-system scenarios.
- Used by [Economy and Upgrades](../mechanics/economy-and-upgrades.md) for the timing and snapshots used for resource flows and upgrade effects.

# Relationships

- Uses [Agents](../mechanics/agents.md)
- Uses [Campaign](../mechanics/campaign.md)
- Uses [Domain Model](./domain-model.md)
- Uses [Economy and Upgrades](../mechanics/economy-and-upgrades.md)
- Uses [Factions](../mechanics/factions.md)
- Uses [Investigations](../mechanics/investigations.md)
- Uses [Missions](../mechanics/missions.md)
- Uses [Numbers and Randomness](./numbers-and-randomness.md)
- Refines [Engine Contract](./engine-contract.md)
- Used by [Campaign](../mechanics/campaign.md)
- Used by [Campaign Integration and Acceptance Tests](../acceptance/campaign-integration-and-acceptance-tests.md)
- Used by [Economy and Upgrades](../mechanics/economy-and-upgrades.md)

# Glossary

TODO: Define the local terms here or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

# Concepts and contract

Phase ordering and state-read timing must preserve [Derived value consistency](engine-contract.md#derived-value-consistency) and [Committed state integrity](engine-contract.md#committed-state-integrity).

This specification intends to refine [Derived value consistency](engine-contract.md#derived-value-consistency)/[Committed state integrity](engine-contract.md#committed-state-integrity) by specifying calculation snapshots, ordered phases, and the atomic publication
boundary. It uses Domain Model's valid-state constraints and Numbers and Randomness's arithmetic and draw ordering.
Agents, Investigations, Missions, Factions, Economy and Upgrades, and Campaign supply the subsystem transitions and
effects to schedule. Campaign supplies ending predicates; this document supplies when those predicates are evaluated.
The phase order and simultaneous-effect decisions remain TODOs below.

TODO: Specify Turn number, management command, turn advancement, phase input, produced effect, and report boundary.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Requirements

## Phase schedule

TODO: Specify the ordered advancement phases and reference subsystem rules without duplicating formulas. Identify start-of-turn snapshots versus updated-state reads.

## Same-turn effects

TODO: Define when arrivals can work, investigation-created missions begin aging, mission survivors recover, operations spawn, and funding changes start producing income.

## Atomic resolution

TODO: Define when reports and campaign outcomes finalize, how simultaneous effects are ordered, and what happens if resolution encounters an invariant violation.

TODO: Write concrete requirements under descriptive section titles when rules replace these placeholders.

# Edge cases and failure behavior

TODO: Define behavior for Investigation completion and exhaustion together; mission creation/expiration together; reward and defeat conditions together; multiple missions affecting one faction.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

# Acceptance examples

TODO: Provide turn timelines with before/after state for arrival, completion, expiration, rewards, suppression, and terminal outcomes.
Identify initial conditions, inputs/actions, expected results, and hyperlinks to the requirement sections exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Set the phase order and simultaneous-effect precedence explicitly; source-game timing is reference material, not an automatic default.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
