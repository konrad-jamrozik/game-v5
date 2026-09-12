# Leads and Progression

| Metadata    | Value                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------- |
| Spec ID     | LEAD                                                                                                          |
| Status      | Stub                                                                                                          |
| Scope       | Define the progression graph and the lifecycle of lead opportunities, separately from investigation attempts. |
| Conventions | [Specification conventions](../spec-conventions.md)                                                           |

> This is a scoped outline, not an accepted implementation contract. TODOs must be resolved before acceptance.

# Purpose and boundaries

Define the progression graph and the lifecycle of lead opportunities, separately from investigation attempts.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

# Relationships

## Dependencies

| Dependency                                    | Relationship | Scope                                                                            |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------- |
| [Domain Model](../foundation/domain-model.md) | `refines`    | Lead definitions, progression facts, discovery, availability, and unlock effects |
| [Missions](./missions.md)                     | `uses`       | Mission creation, lifecycle, and outcomes that block or advance leads            |
| [Factions](./factions.md)                     | `uses`       | Faction discovery, progression, and defeat states that affect lead availability  |

## Dependents

| Dependent                                                  | Relationship | Scope                                                                    |
| ---------------------------------------------------------- | ------------ | ------------------------------------------------------------------------ |
| [Factions](./factions.md)                                  | `uses`       | Faction-linked discovery, progression, and defeat effects on leads       |
| [Initial Campaign Content](../content/initial-campaign.md) | `refines`    | Concrete lead definitions, prerequisites, and unlock effects             |
| [Investigations](./investigations.md)                      | `uses`       | Lead eligibility, repeatability, completion facts, and unlock effects    |
| [Player Information](../interfaces/player-information.md)  | `uses`       | Lead discovery, availability, prerequisites, and progression information |

# Glossary

TODO: Define the local terms here or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

# Concepts and contract

TODO: Specify Lead definition, prerequisites, discovery, availability, blocking, repeatability, completion count, and unlock effect.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Requirements

## Prerequisites and lifecycle

TODO: Specify prerequisite expression semantics, discovery, active/blocked/completed/archived states, and repeatability. Define blocking by active missions and completed objectives without relying on ID parsing.

## Completion and unlock effects

TODO: Define the supported effect kinds for information, agency/agent improvement, missions, faction progression, and campaign objectives. Reference the authoritative rules for each effect.

## Progression content validation

TODO: Define valid references, cycle/unreachable-content handling, repeatable chains, and when availability is recomputed.

TODO: Assign stable LEAD-NNN requirement IDs when concrete rules replace these placeholders.

# Edge cases and failure behavior

TODO: Define behavior for Multiple prerequisites, simultaneous unlocks, faction defeat with active leads, failed/expired blocking missions, and duplicate completion effects.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

# Acceptance examples

TODO: Show a small lead/mission graph and its availability changes after success, failure, and faction defeat.
Identify initial conditions, inputs/actions, expected results, and the requirement IDs exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Choose prerequisite semantics and supported capability/effect types before authoring the full catalog.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
