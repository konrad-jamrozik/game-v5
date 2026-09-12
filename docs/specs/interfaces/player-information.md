# Player Information

| Metadata    | Value                                                                                  |
| ----------- | -------------------------------------------------------------------------------------- |
| Spec ID     | INFO                                                                                   |
| Status      | Stub                                                                                   |
| Scope       | Define complete player-facing knowledge and a consistent boundary around hidden state. |
| Conventions | [Specification conventions](../spec-conventions.md)                                    |

> This is a scoped outline, not an accepted implementation contract. TODOs must be resolved before acceptance.

## 1. Purpose and boundaries

Define complete player-facing knowledge and a consistent boundary around hidden state.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

## 2. Dependencies and terminology

### Relationships

| Type      | Target                                                              | Scope                                                                                            |
| --------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `refines` | [Engine Contract](../foundation/engine-contract.md)                 | Human/AI information parity, permitted observations, and the player/developer boundary (ENG-003) |
| `uses`    | [Modeling Foundations](../foundation/modeling-foundations.md)       | Player-observation and historical-fact semantics (MOD-004)                                       |
| `uses`    | [Domain Model](../foundation/domain-model.md)                       | Campaign entities, relationships, authoritative facts, and hidden state                          |
| `uses`    | [History and Persistence](../foundation/history-and-persistence.md) | Historical observations, reports, undo, and restored knowledge                                   |
| `uses`    | [Agents](../mechanics/agents.md)                                    | Agent attributes, assignments, readiness, and career information                                 |
| `uses`    | [Economy and Upgrades](../mechanics/economy-and-upgrades.md)        | Agency resources, funding, capacities, and upgrade information                                   |
| `uses`    | [Leads and Progression](../mechanics/leads-and-progression.md)      | Lead discovery, availability, prerequisites, and progression information                         |
| `uses`    | [Investigations](../mechanics/investigations.md)                    | Visible investigation state, calculated estimates, and uncertainty boundaries                    |
| `uses`    | [Combat](../mechanics/combat.md)                                    | Player-visible battle results and combat records                                                 |
| `uses`    | [Missions](../mechanics/missions.md)                                | Mission state, deadlines, outcomes, and consequence reports                                      |
| `uses`    | [Factions](../mechanics/factions.md)                                | Revealed faction state, activity, operations, suppression, and defeat                            |
| `uses`    | [Campaign](../mechanics/campaign.md)                                | Campaign status, panic, objectives, and terminal outcomes                                        |

TODO: Define the local terms below or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

## 3. Concepts and contract

TODO: Specify Player observation, known/unknown field, derived estimate, action explanation, report, history visibility, and dev-only information.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

## 4. Requirements

### Observation schemas and visibility

TODO: Specify field-by-field views for agency, agents, leads, investigations, missions, factions, progression, and history. State reveal conditions and distinguish unknown from zero/absent.

### Derived information and reports

TODO: Specify decision-support values, graphs/relationships, estimates, turn reports, combat records, and action explanations. Reference owning mechanics for formulas; do not duplicate them.

### Boundary consistency

TODO: Apply visibility to queries, action discovery, validation errors, reports, exports, and historical observations. Exclude hidden difficulty, undiscovered information, RNG state, and mutable internal references from ordinary access.

TODO: Assign stable INFO-NNN requirement IDs when concrete rules replace these placeholders.

## 5. Edge cases and failure behavior

TODO: Define behavior for Information newly revealed or undone, queries about unknown IDs, empty results, estimates after failures, and historical reports containing formerly/future-known facts.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

## 6. Acceptance examples

TODO: Provide matched full-state/player-view fixtures and visibility tests for human and AI callers.
Identify initial conditions, inputs/actions, expected results, and the requirement IDs exercised. Reference shared
fixtures instead of introducing implicit balance values.

## 7. Open decisions

- TODO: Choose reveal rules, observation fields, uncertainty presentation, and history visibility behavior.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
