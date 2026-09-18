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

## Dependencies

| Dependency                                                   | Relationship | Scope                                                                                                     |
| ------------------------------------------------------------ | ------------ | --------------------------------------------------------------------------------------------------------- |
| [Engine Contract](./engine-contract.md)                      | `refines`    | Phase boundaries, state-read timing, calculation consistency, and committed-state integrity (ENG-001/004) |
| [Domain Model](./domain-model.md)                            | `uses`       | Campaign instances, state transitions, and structural invariants                                          |
| [Numbers and Randomness](./numbers-and-randomness.md)        | `uses`       | Deterministic draw ordering and numeric effect application                                                |
| [Agents](../mechanics/agents.md)                             | `uses`       | Transit, task contribution, fatigue, recovery, and assignment transitions                                 |
| [Investigations](../mechanics/investigations.md)             | `uses`       | Progress, completion, team-change, and abandonment effects                                                |
| [Missions](../mechanics/missions.md)                         | `uses`       | Mission aging, resolution, expiration, and consequence effects                                            |
| [Factions](../mechanics/factions.md)                         | `uses`       | Escalation, operation generation, suppression, and defeat effects                                         |
| [Economy and Upgrades](../mechanics/economy-and-upgrades.md) | `uses`       | Income, upkeep, capacity, and upgrade timing                                                              |
| [Campaign](../mechanics/campaign.md)                         | `uses`       | Turn counters, panic, and terminal-outcome evaluation                                                     |

## Dependents

| Dependent                                                                                               | Relationship | Scope                                                                  |
| ------------------------------------------------------------------------------------------------------- | ------------ | ---------------------------------------------------------------------- |
| [Campaign](../mechanics/campaign.md)                                                                    | `uses`       | Timing and precedence for turn counters, panic, and outcome evaluation |
| [Campaign Integration and Acceptance Tests](../acceptance/campaign-integration-and-acceptance-tests.md) | `uses`       | Cross-system phase order, state-read timing, and same-turn effects     |

# Glossary

TODO: Define the local terms here or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

# Concepts and contract

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
