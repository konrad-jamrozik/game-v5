# Initial Campaign Content

| Metadata    | Value                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------- |
| Spec ID     | INIT                                                                                        |
| Family      | Content                                                                                     |
| Status      | Stub                                                                                        |
| Scope       | Provide the complete, versioned numeric and content inputs for the first playable campaign. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                              |

> This is a scoped outline, not an accepted implementation contract. TODOs must be resolved before acceptance.

# Purpose and boundaries

Provide the complete, versioned numeric and content inputs for the first playable campaign.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

# Relationships

- Uses [Campaign](../mechanics/campaign.md)
- Uses [Domain Model](../foundation/domain-model.md)
- Uses [Economy and Upgrades](../mechanics/economy-and-upgrades.md)
- Uses [Factions](../mechanics/factions.md)
- Uses [Leads and Progression](../mechanics/leads-and-progression.md)
- Uses [Missions](../mechanics/missions.md)
- Uses [Modeling Foundations](../foundation/modeling-foundations.md)
- Used by [Agents](../mechanics/agents.md)
- Used by [Campaign](../mechanics/campaign.md)
- Used by [Campaign Integration and Acceptance Tests](../acceptance/campaign-integration-and-acceptance-tests.md)
- Used by [Economy and Upgrades](../mechanics/economy-and-upgrades.md)
- Used by [Factions](../mechanics/factions.md)
- Used by [Leads and Progression](../mechanics/leads-and-progression.md)
- Used by [Missions](../mechanics/missions.md)

# Glossary

Shared modeling terms, for example Content entry and Campaign instance, are owned by the
[Modeling Foundations glossary](../foundation/modeling-foundations.md#glossary).

TODO: Define remaining local terms here without duplicating shared definitions.

# Concepts and contract

Content entries and their references follow [MODEL-001](../foundation/modeling-foundations.md#model-001--campaign-instance-composition), [MODEL-002](../foundation/modeling-foundations.md#model-002--identity), and [MODEL-003](../foundation/modeling-foundations.md#model-003--references).

This document uses Domain Model's game concepts and Modeling Foundations' content and reference conventions. It uses
Campaign's initialization contract, Economy and Upgrades' parameter meanings, Factions' operation rules, Leads and
Progression's prerequisites/effects, and Missions' catalog requirements to supply valid content. Supplying those data
values does not refine the mechanical behavior. The mechanics consume this document's exact values and catalogs;
formulas and transitions remain owned by the mechanics. Values and catalogs remain TODOs below.

TODO: Specify Scenario ID/version, named balance parameter, content entry ID, starting state, lead graph, enemy, weapon, faction, and mission content entry.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Requirements

## Starting configuration and parameters

TODO: List exact initial resources, roster, capabilities, faction setup, and all named balance parameters with units and valid ranges. Mechanics own formulas; this document owns values.

## Content catalogs

TODO: Supply archetype catalogs for every campaign-instance Type declared in
[Domain Model](../foundation/domain-model.md#types-multiplicity-and-lifecycle), including singleton Campaign and Agency.
Declare each archetype’s content ID, shared characteristics, and construction defaults. Keep non-archetype balance
parameters distinct. Mechanics retain ownership of constructor behavior; catalog details and balance values remain open.

InvestigationArchetype entries and Lead entries are separate catalogs. Their references and allowed combinations
must follow the owning mechanics; speculative investigation kinds in Modeling Foundations do not select production
content. A Lead is not automatically an InvestigationArchetype.

TODO: Define factions, enemies, weapons, Initiative/Response missions, rewards, deadlines, all eight upgrade categories, lead prerequisites, and completion effects using explicit IDs.

## Completeness and validation

TODO: Ensure every formula parameter and content reference resolves, progression reaches its intended ending, and required operation pools exist. Distinguish source-game examples from chosen v5 content.

TODO: Assign stable INIT-NNN requirement IDs when concrete rules replace these placeholders.

# Edge cases and failure behavior

TODO: Define behavior for Missing IDs/parameters, duplicate content entries, impossible prerequisites, invalid weights, and incomplete mission or faction catalogs.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

# Acceptance examples

TODO: Include the required archetypes, all three instance components, and IDs for every occurrence, including Campaign
and Agency, in initial-state validation. Provide one fully specified scenario that acceptance fixtures can reference without inventing missing values.
Identify initial conditions, inputs/actions, expected results, and the requirement IDs exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Select the initial campaign scope and balance values; do not imply the entire game-ts catalog must be transplanted.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
