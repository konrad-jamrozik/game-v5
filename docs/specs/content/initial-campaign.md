# Initial Campaign Content

| Metadata    | Value                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------- |
| Spec ID     | INIT                                                                                        |
| Status      | Stub                                                                                        |
| Scope       | Provide the complete, versioned numeric and content inputs for the first playable campaign. |
| Conventions | [Specification conventions](../spec-conventions.md)                                         |

> This is a scoped outline, not an accepted implementation contract. TODOs must be resolved before acceptance.

## 1. Purpose and boundaries

Provide the complete, versioned numeric and content inputs for the first playable campaign.

TODO: Confirm the precise included/excluded scope and rule ownership using the [design stem](../../game-design-stem.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

## 2. Dependencies and terminology

- **Normative draft:** [Modeling Foundations](../foundation/modeling-foundations.md) owns immutable definitions and typed content references (MOD-001/002).
- [Domain Model](../foundation/domain-model.md): TODO: Identify the specific owned contracts referenced here and classify each dependency as normative or background.
- [Campaign](../mechanics/campaign.md): TODO: Identify the specific owned contracts referenced here and classify each dependency as normative or background.
- [Leads and Progression](../mechanics/leads-and-progression.md): TODO: Identify the specific owned contracts referenced here and classify each dependency as normative or background.
- [Missions](../mechanics/missions.md): TODO: Identify the specific owned contracts referenced here and classify each dependency as normative or background.
- [Factions](../mechanics/factions.md): TODO: Identify the specific owned contracts referenced here and classify each dependency as normative or background.
- [Economy and Upgrades](../mechanics/economy-and-upgrades.md): TODO: Identify the specific owned contracts referenced here and classify each dependency as normative or background.

TODO: Define the local terms below or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

## 3. Concepts and contract

TODO: Specify Scenario ID/version, named balance parameter, definition ID, starting state, lead graph, enemy, weapon, faction, and mission template.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

## 4. Requirements

### Starting configuration and parameters

TODO: List exact initial resources, roster, capabilities, faction setup, and all named balance parameters with units and valid ranges. Mechanics own formulas; this document owns values.

### Content catalogs

TODO: Define factions, enemies, weapons, Initiative/Response missions, rewards, deadlines, all eight upgrade categories, lead prerequisites, and completion effects using explicit IDs.

### Completeness and validation

TODO: Ensure every formula parameter and content reference resolves, progression reaches its intended ending, and required operation pools exist. Distinguish source-game examples from chosen v5 content.

TODO: Assign stable INIT-NNN requirement IDs when concrete rules replace these placeholders.

## 5. Edge cases and failure behavior

TODO: Define behavior for Missing IDs/parameters, duplicate definitions, impossible prerequisites, invalid weights, and incomplete mission or faction catalogs.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

## 6. Acceptance examples

TODO: Provide one fully specified scenario that acceptance fixtures can reference without inventing missing values.
Identify initial conditions, inputs/actions, expected results, and the requirement IDs exercised. Reference shared
fixtures instead of introducing implicit balance values.

## 7. Open decisions

- TODO: Select the initial campaign scope and balance values; do not imply the entire game-ts catalog must be transplanted.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
