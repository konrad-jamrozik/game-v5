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

## Dependencies

| Dependency                                                     | Relationship | Scope                                                                            |
| -------------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------- |
| [Modeling Foundations](../foundation/modeling-foundations.md)  | `uses`       | Immutable content entries and typed content-reference semantics (MODEL-001/002)  |
| [Domain Model](../foundation/domain-model.md)                  | `uses`       | Campaign instance kinds, structural invariants, and game-specific identity scope |
| [Campaign](../mechanics/campaign.md)                           | `refines`    | Concrete starting configuration, outcome content, and named campaign parameters  |
| [Leads and Progression](../mechanics/leads-and-progression.md) | `refines`    | Concrete lead content entries, prerequisites, and unlock effects                 |
| [Missions](../mechanics/missions.md)                           | `refines`    | Concrete mission content entries, deadlines, rewards, and consequence parameters |
| [Factions](../mechanics/factions.md)                           | `refines`    | Concrete faction content entries, escalation values, and operation pools         |
| [Economy and Upgrades](../mechanics/economy-and-upgrades.md)   | `refines`    | Concrete resource, purchase, capacity, and upgrade values                        |

## Dependents

| Dependent                                                                                               | Relationship | Scope                                                                        |
| ------------------------------------------------------------------------------------------------------- | ------------ | ---------------------------------------------------------------------------- |
| [Campaign](../mechanics/campaign.md)                                                                    | `uses`       | Starting configuration, scenario values, and victory content                 |
| [Campaign Integration and Acceptance Tests](../acceptance/campaign-integration-and-acceptance-tests.md) | `uses`       | Reproducible scenario content, named parameters, and starting configurations |
| [Economy and Upgrades](../mechanics/economy-and-upgrades.md)                                            | `uses`       | Purchase prices, upgrade increments, limits, and other named balance values  |

# Glossary

Shared modeling terms, including Content entry and Instance, are owned by the
[Modeling Foundations glossary](../foundation/modeling-foundations.md#glossary).

TODO: Define remaining local terms here without duplicating shared definitions.

# Concepts and contract

TODO: Specify Scenario ID/version, named balance parameter, content entry ID, starting state, lead graph, enemy, weapon, faction, and mission content entry.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Requirements

## Starting configuration and parameters

TODO: List exact initial resources, roster, capabilities, faction setup, and all named balance parameters with units and valid ranges. Mechanics own formulas; this document owns values.

## Content catalogs

TODO: Define factions, enemies, weapons, Initiative/Response missions, rewards, deadlines, all eight upgrade categories, lead prerequisites, and completion effects using explicit IDs.

## Completeness and validation

TODO: Ensure every formula parameter and content reference resolves, progression reaches its intended ending, and required operation pools exist. Distinguish source-game examples from chosen v5 content.

TODO: Assign stable INIT-NNN requirement IDs when concrete rules replace these placeholders.

# Edge cases and failure behavior

TODO: Define behavior for Missing IDs/parameters, duplicate content entries, impossible prerequisites, invalid weights, and incomplete mission or faction catalogs.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

# Acceptance examples

TODO: Provide one fully specified scenario that acceptance fixtures can reference without inventing missing values.
Identify initial conditions, inputs/actions, expected results, and the requirement IDs exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Select the initial campaign scope and balance values; do not imply the entire game-ts catalog must be transplanted.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
