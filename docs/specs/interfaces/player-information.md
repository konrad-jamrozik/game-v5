# Player Information

| Metadata    | Value                                                                                  |
| ----------- | -------------------------------------------------------------------------------------- |
| Spec ID     | INFO                                                                                   |
| Family      | Interfaces                                                                             |
| Status      | Stub                                                                                   |
| Scope       | Define complete player-facing knowledge and a consistent boundary around hidden state. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                         |

> This is a scoped outline, not an accepted implementation contract. TODOs must be resolved before acceptance.

# Purpose and boundaries

Define complete player-facing knowledge and a consistent boundary around hidden state.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

# Relationships

- Uses [Agents](../mechanics/agents.md)
- Uses [Campaign](../mechanics/campaign.md)
- Uses [Combat](../mechanics/combat.md)
- Uses [Domain Model](../foundation/domain-model.md)
- Uses [Economy and Upgrades](../mechanics/economy-and-upgrades.md)
- Uses [Factions](../mechanics/factions.md)
- Uses [History and Persistence](../foundation/history-and-persistence.md)
- Uses [Investigations](../mechanics/investigations.md)
- Uses [Leads and Progression](../mechanics/leads-and-progression.md)
- Uses [Missions](../mechanics/missions.md)
- Uses [Modeling Foundations](../foundation/modeling-foundations.md)
- Refines [Engine Contract](../foundation/engine-contract.md)
- Used by [Investigations](../mechanics/investigations.md)
- Used by [Terminal CLI](./cli.md)
- Used by [TypeScript Player API](./typescript-api.md)
- Used by [Web UI](./web-ui.md)

# Glossary

TODO: Define the local terms here or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

# Concepts and contract

Player observations follow ENG-003; historical explanations preserve MODEL-004.

This Stub intends to refine ENG-003 by specifying exposed fields, reveal conditions, and consistent human/AI views.
It uses Modeling Foundations' observation and history meanings, Domain Model's concepts, and History and Persistence's
history navigation. The mechanics dependencies supply the facts and calculated results to expose. In particular,
Investigations owns estimate mathematics and permitted inputs; this document owns the exposed fields and reveal
conditions. The exact field and reveal choices remain TODOs below.

TODO: Specify Player observation, known/unknown field, derived estimate, action explanation, report, history visibility, and dev-only information.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Requirements

## Observation schemas and visibility

TODO: Specify field-by-field views for agency, agents, leads, investigations, missions, factions, progression, and history. State reveal conditions and distinguish unknown from zero/absent.

## Derived information and reports

TODO: Specify decision-support values, graphs/relationships, estimates, turn reports, combat records, and action explanations. Reference owning mechanics for formulas; do not duplicate them.

## Boundary consistency

TODO: Apply visibility to queries, action discovery, validation errors, reports, exports, and historical observations. Exclude hidden difficulty, undiscovered information, RNG state, and mutable internal references from ordinary access.

TODO: Assign stable INFO-NNN requirement IDs when concrete rules replace these placeholders.

# Edge cases and failure behavior

TODO: Define behavior for Information newly revealed or undone, queries about unknown IDs, empty results, estimates after failures, and historical reports containing formerly/future-known facts.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

# Acceptance examples

TODO: Provide matched full-state/player-view fixtures and visibility tests for human and AI callers.
Identify initial conditions, inputs/actions, expected results, and the requirement IDs exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Choose reveal rules, observation fields, uncertainty presentation, and history visibility behavior.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
