# Initial Campaign Content

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | INIT                                                           |
| Family      | Content                                                        |
| Status      | Stub                                                           |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Purpose and boundaries

Provide the complete, versioned numeric and GDR inputs for the first playable campaign.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

- Uses [Campaign](../mechanics/campaign.md) for the initialization contract that starting Campaign data must satisfy.
- Uses [Domain Model](../foundation/domain-model.md) for the game concepts and structural constraints that concrete GDRs must satisfy.
- Uses [Economy and Upgrades](../mechanics/economy-and-upgrades.md) for the parameter meanings and catalog requirements for resource flows, purchases, and upgrades.
- Uses [Factions](../mechanics/factions.md) for the operation occurrence rules that Faction GDRs must support.
- Uses [Leads and Progression](../mechanics/leads-and-progression.md) for the progression prerequisites and effects that Lead GDRs must encode.
- Uses [Missions](../mechanics/missions.md) for the catalog requirements that Mission and Enemy GDRs must satisfy.
- Uses [Modeling Foundations](../foundation/modeling-foundations.md) for GDR immutability and reference conventions for concrete game data.
- Used by [Agents](../mechanics/agents.md) for Agent archetypes and development and recovery parameters.
- Used by [Campaign](../mechanics/campaign.md) for the starting GDRs and values needed to initialize a playable Campaign.
- Used by [Campaign Integration and Acceptance Tests](../acceptance/campaign-integration-and-acceptance-tests.md) for reproducible GDRs and numeric inputs for scenario fixtures.
- Used by [Economy and Upgrades](../mechanics/economy-and-upgrades.md) for resource, personnel, and upgrade values and catalogs.
- Used by [Factions](../mechanics/factions.md) for Faction archetypes and operation occurrence parameters.
- Used by [Leads and Progression](../mechanics/leads-and-progression.md) for the Lead catalog and its concrete progression prerequisites and effects.
- Used by [Missions](../mechanics/missions.md) for Mission and Enemy catalogs and concrete reward inputs.

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

Shared modeling terms, for example GDR and Campaign instance, are owned by the
[Modeling Foundations glossary](../foundation/modeling-foundations.md#glossary).

TODO: Define remaining local terms here without duplicating shared definitions.

# Concepts and contract

GDRs and their references follow [Campaign instances](../foundation/modeling-foundations.md#campaign-instances) and [References](../foundation/modeling-foundations.md#references).

This document uses Domain Model's game concepts and Modeling Foundations' GDR and reference conventions. It uses
Campaign's initialization contract, Economy and Upgrades' parameter meanings, Factions' operation rules, Leads and
Progression's prerequisites/effects, and Missions' catalog requirements to supply valid GDRs. Supplying those data
values does not refine the mechanical behavior. The mechanics consume this document's exact values and catalogs;
formulas and transitions remain owned by the mechanics. Values and catalogs remain TODOs below.

TODO: Specify Scenario ID/version, named balance parameter, GDR ID, starting state, lead graph, enemy, weapon, faction, and mission GDR.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Requirements

## Starting configuration and parameters

TODO: List exact initial resources, roster, capabilities, faction setup, and all named balance parameters with units and valid ranges. Mechanics own formulas; this document owns values.

## GDR catalogs

TODO: Supply archetype catalogs for every Campaign instance Type declared in
[Types, multiplicity, and lifecycle](../foundation/domain-model.md#types-multiplicity-and-lifecycle), including singleton Campaign and Agency.
Declare each archetype’s GDR ID, shared characteristics, and construction defaults. Keep non-archetype balance
parameters distinct. Mechanics retain ownership of Campaign instance constructor behavior; catalog details and balance values remain open.

InvestigationArchetype GDRs and Lead GDRs are separate catalogs. Their references and allowed combinations
must follow the owning mechanics; the illustrative InvestigationArchetype GDRs in Modeling Foundations do not select production
GDRs. A Lead is not automatically an InvestigationArchetype.

TODO: Define factions, enemies, weapons, Initiative/Response missions, rewards, deadlines, all eight upgrade categories, lead prerequisites, and completion effects using explicit GDR identifiers.

## Completeness and validation

TODO: Ensure every formula parameter and GDR reference resolves, progression reaches its intended ending, and required operation pools exist. Distinguish source-game examples from chosen v5 GDRs.

TODO: Write concrete requirements under descriptive section titles when rules replace these placeholders.

# Edge cases and failure behavior

TODO: Define behavior for missing GDR identifiers or parameters, duplicate GDRs, impossible prerequisites, invalid weights, and incomplete mission or faction catalogs.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

# Acceptance examples

TODO: Include the required archetypes, all four properties, and Instance IDs for every Campaign instance, including Campaign
and Agency, in initial-state validation. Provide one fully specified scenario that acceptance fixtures can reference without inventing missing values.
Identify initial conditions, inputs/actions, expected results, and hyperlinks to the requirement sections exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Select the initial campaign scope and balance values; do not imply the entire game-ts catalog must be transplanted.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
