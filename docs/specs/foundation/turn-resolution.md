# Turn Resolution

| Metadata    | Value                                                                     |
| ----------- | ------------------------------------------------------------------------- |
| Spec ID     | TURN                                                                      |
| Family      | Foundation                                                                |
| Status      | Stub                                                                      |
| Scope       | Define exactly when subsystem rules run and which state each phase reads. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)            |

> This is a scoped outline, not an accepted implementation contract. TODOs must be resolved before acceptance.

# Purpose and boundaries

Define exactly when subsystem rules run and which state each phase reads.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

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

Phase ordering and state-read timing must preserve [ENG-001](engine-contract.md#eng-001--derived-consistency) and [ENG-004](engine-contract.md#eng-004--committed-state-integrity).

This Stub intends to refine [ENG-001](engine-contract.md#eng-001--derived-consistency)/[ENG-004](engine-contract.md#eng-004--committed-state-integrity) by specifying calculation snapshots, ordered phases, and the atomic publication
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

TODO: Assign stable TURN-NNN requirement IDs when concrete rules replace these placeholders.

# Edge cases and failure behavior

TODO: Define behavior for Investigation completion and exhaustion together; mission creation/expiration together; reward and defeat conditions together; multiple missions affecting one faction.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

# Acceptance examples

TODO: Provide turn timelines with before/after state for arrival, completion, expiration, rewards, suppression, and terminal outcomes.
Identify initial conditions, inputs/actions, expected results, and the requirement IDs exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Set the phase order and simultaneous-effect precedence explicitly; source-game timing is reference material, not an automatic default.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
