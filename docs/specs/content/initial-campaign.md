# Initial Campaign Content

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | INIT                                                           |
| Family      | Content                                                        |
| Status      | Stub                                                           |
| Audience    | Content designer, Implementer                                  |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Overview

This document provides the complete, versioned numeric and GDR inputs for the first playable campaign.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

GDRs and their references follow [Campaign instances](../foundation/campaign-state.md#campaign-instances) and [References](../foundation/campaign-state.md#references).

This document uses Domain Model's game concepts and Core Concepts' GDR meanings and Campaign State's composition and reference constraints. It uses
Campaign's initialization contract, Economy and Upgrades' parameter meanings, Factions' operation rules, Leads and
Progression's prerequisites/effects, and Missions' catalog requirements to supply valid GDRs. Supplying those data
values does not refine the mechanical behavior. The mechanics consume this document's exact values and catalogs;
formulas and transitions remain owned by the mechanics. Values and catalogs remain TODOs below.

TODO: Specify Campaign configuration preset GDR IDs, named balance parameter, GDR ID, starting state, lead graph, enemy, weapon, faction, and mission GDR.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Relationships

- Uses [Campaign](../mechanics/campaign.md)
- Uses [Campaign State](../foundation/campaign-state.md)
- Uses [Core Concepts](../foundation/core-concepts.md)
- Uses [Domain Model](../foundation/domain-model.md)
- Uses [Economy and Upgrades](../mechanics/economy-and-upgrades.md)
- Uses [Factions](../mechanics/factions.md)
- Uses [Game Data Records](../foundation/game-data-records.md)
- Uses [Leads and Progression](../mechanics/leads-and-progression.md)
- Uses [Missions](../mechanics/missions.md)
- Used by [Agents](../mechanics/agents.md)
- Used by [Campaign](../mechanics/campaign.md)
- Used by [Campaign Integration and Acceptance Tests](../acceptance/campaign-integration-and-acceptance-tests.md)
- Used by [Economy and Upgrades](../mechanics/economy-and-upgrades.md)
- Used by [Factions](../mechanics/factions.md)
- Used by [Leads and Progression](../mechanics/leads-and-progression.md)
- Used by [Missions](../mechanics/missions.md)

# Glossary

Shared terms, e.g. GDR and Type, are owned by [Core Concepts](../foundation/core-concepts.md#glossary).
Campaign-specific composition terms are owned by [Campaign State](../foundation/campaign-state.md#glossary).

TODO: Define remaining local terms here without duplicating shared definitions.

# Starting configuration and parameters

TODO: Supply the Campaign configuration presets under
[Campaign configuration ownership](../foundation/domain-model.md#campaign-configuration-ownership): each preset's GDR
ID, its display name, and its value for every Campaign configuration value. Name the one Game build default preset.

TODO: List exact initial resources, roster, capabilities, faction setup, and all named balance parameters with units and valid ranges. Mechanics own formulas; this document owns values.

# GDR catalogs

TODO: Supply archetype catalogs for every Campaign instance Type declared in
[Types, multiplicity, and lifecycle](../foundation/domain-model.md#types-multiplicity-and-lifecycle), including the singleton Agency.
Declare each archetype’s GDR ID, shared characteristics, and initial values. Keep non-archetype balance
parameters distinct. Mechanics retain ownership of the creation of Campaign instances; catalog details and balance values remain open.

InvestigationArchetype GDRs and Lead GDRs are separate catalogs. Their references and allowed combinations
must follow the owning mechanics; the illustrative InvestigationArchetype GDRs in Game Data Records do not select production
GDRs. A Lead is not automatically an InvestigationArchetype.

TODO: Define factions, enemies, weapons, Initiative/Response missions, rewards, deadlines, all eight upgrade categories, lead prerequisites, and completion effects using explicit GDR identifiers.

TODO: Supply GDRs serving the Display content purpose, as defined in [GDR purpose: display content](../foundation/game-data-records.md#gdr-purpose-display-content),
for the first playable campaign: names and descriptions for player-visible GDRs, encyclopedia articles, and
media references.

# Completeness and validation

TODO: Ensure every formula parameter and GDR reference resolves, progression reaches its intended ending, and required operation pools exist. Distinguish source-game examples from chosen v5 GDRs.

# Edge cases and failure behavior

TODO: Define behavior for missing GDR identifiers or parameters, duplicate GDRs, impossible prerequisites, invalid weights, and incomplete mission or faction catalogs.
State exact thresholds and effect ordering where relevant.

# Acceptance examples

TODO: Include the required archetypes, all four properties, and Instance IDs for every Campaign instance, including Campaign
and Agency, in initial-state validation. Provide one fully specified Campaign configuration preset that acceptance fixtures can reference without inventing missing values.
Identify initial conditions, inputs/actions, expected results, and hyperlinks to the requirement sections exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Select the initial campaign scope and balance values; do not imply the entire game-ts catalog must be transplanted.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
