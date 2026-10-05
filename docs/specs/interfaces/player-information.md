# Player Information

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | INFO                                                           |
| Family      | Interfaces                                                     |
| Status      | Stub                                                           |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Purpose and boundaries

Define complete player-facing knowledge and a consistent boundary around hidden state.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

- Uses [Agents](../mechanics/agents.md) for Agent capabilities, Current assignments, exhaustion, and recovery.
- Uses [Campaign](../mechanics/campaign.md) for Campaign initialization and global start and end conditions.
- Uses [Combat](../mechanics/combat.md) for automatic battle resolution and retained Battle result facts.
- Uses [Domain Model](../foundation/domain-model.md) for the game concepts and relationships represented in player reports.
- Uses [Economy and Upgrades](../mechanics/economy-and-upgrades.md) for resource flows, purchases, and Agency upgrades.
- Uses [Factions](../mechanics/factions.md) for Faction activity, operation occurrence rules, and defeat conditions.
- Uses [History and Persistence](../foundation/history-and-persistence.md) for the retained facts and restored session state available for player reports.
- Uses [Investigations](../mechanics/investigations.md) for Investigation progress, completion, and commitment costs.
- Uses [Leads and Progression](../mechanics/leads-and-progression.md) for Lead prerequisites, completion facts, and progression effects.
- Uses [Missions](../mechanics/missions.md) for Mission commitments, results, and Campaign consequences.
- Uses [Modeling Foundations](../foundation/modeling-foundations.md) for Player-visible information, Authoritative value, and Derived value terminology in visibility rules.
- Refines [Engine Contract](../foundation/engine-contract.md) by specifying the complete player knowledge contract and hidden-state boundary.
- Used by [Investigations](../mechanics/investigations.md) for the visibility and estimate constraints on reporting uncertain Investigation outcomes.
- Used by [Terminal CLI](./cli.md) for Player-visible information and the boundary around hidden Campaign state.
- Used by [TypeScript Player API](./typescript-api.md) for Player-visible information and the boundary around hidden Campaign state.
- Used by [Web UI](./web-ui.md) for Player-visible information and the boundary around hidden Campaign state.

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

Player-visible information follows [Information boundary](../foundation/engine-contract.md#information-boundary); historical explanations preserve [Historical fact preservation](../foundation/modeling-foundations.md#historical-fact-preservation).

This specification intends to refine [Information boundary](../foundation/engine-contract.md#information-boundary) by specifying exposed fields, reveal conditions, and consistent human/AI views.
It uses Modeling Foundations' Player-visible information and Historical meanings, Domain Model's concepts, and History and Persistence's
history navigation. The mechanics dependencies supply the facts and calculated results to expose. In particular,
Investigations owns estimate mathematics and permitted inputs; this document owns the exposed fields and reveal
conditions. The exact field and reveal choices remain TODOs below.

TODO: Specify Player-visible information, known/unknown field, estimate expressed as a Derived value, action explanation, report, history visibility, and dev-only information.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Requirements

## Player-visible information schemas and visibility

TODO: Specify field-by-field views for agency, agents, leads, investigations, missions, factions, progression, and history. State reveal conditions and distinguish unknown from zero/absent.

## Derived values and reports

TODO: Specify decision-support values, graphs/relationships, estimates, turn reports, combat records, and action explanations. Reference owning mechanics for formulas; do not duplicate them.

## Boundary consistency

TODO: Apply visibility to queries, action discovery, validation errors, reports, exports, and historical Player-visible information. Exclude hidden difficulty, undiscovered information, RNG state, and mutable internal references from ordinary access.

TODO: Write concrete requirements under descriptive section titles when rules replace these placeholders.

# Edge cases and failure behavior

TODO: Define behavior for Information newly revealed or undone, queries about unknown IDs, empty results, estimates after failures, and historical reports containing formerly/future-known facts.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

# Acceptance examples

TODO: Provide matched full-state/player-view fixtures and visibility tests for human and AI callers.
Identify initial conditions, inputs/actions, expected results, and hyperlinks to the requirement sections exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Choose reveal rules, Player-visible information fields, uncertainty presentation, and history visibility behavior.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
