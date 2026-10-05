# Leads and Progression

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | LEAD                                                           |
| Family      | Mechanics                                                      |
| Status      | Stub                                                           |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Purpose and boundaries

Define the progression graph and the lifecycle of Leads, separately from Investigations.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

- Uses [Factions](./factions.md) for the Faction activity and defeat rules affected by Lead progression.
- Uses [Initial Campaign Content](../content/initial-campaign.md) for the Lead catalog and its concrete progression prerequisites and effects.
- Uses [Missions](./missions.md) for the Mission outcomes that establish Lead completion and progression facts.
- Refines [Domain Model](../foundation/domain-model.md) by specifying Lead progression and lifecycle rules.
- Used by [Factions](./factions.md) for the progression facts and effects that govern Faction activity and defeat.
- Used by [Initial Campaign Content](../content/initial-campaign.md) for the progression prerequisites and effects that Lead GDRs must encode.
- Used by [Investigations](./investigations.md) for the Lead prerequisites and completion effects pursued through Investigations.
- Used by [Player Information](../interfaces/player-information.md) for Lead prerequisites, completion facts, and progression effects.

# Relationships

- Uses [Factions](./factions.md)
- Uses [Initial Campaign Content](../content/initial-campaign.md)
- Uses [Missions](./missions.md)
- Refines [Domain Model](../foundation/domain-model.md)
- Used by [Factions](./factions.md)
- Used by [Initial Campaign Content](../content/initial-campaign.md)
- Used by [Investigations](./investigations.md)
- Used by [Player Information](../interfaces/player-information.md)

# Glossary

TODO: Define the local terms here or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

# Concepts and contract

This specification intends to refine Domain Model's lead and progression contract ([Leads and Investigations](../foundation/domain-model.md#leads-and-investigations)/[Progression facts](../foundation/domain-model.md#progression-facts)) with prerequisite semantics,
availability, and unlock effects. It uses Factions' state and defeat facts and Missions' lifecycle/results to evaluate
progression. Factions in turn uses this document's unlock effects. Initial Campaign Content supplies the actual lead
graph and effect Game Data Records (GDRs) conforming to these rules. The expression and effect choices remain TODOs below.

TODO: Specify Lead GDR, prerequisites, discovery, availability, blocking, repeatability, completion count, and unlock effect.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Requirements

## Prerequisites and lifecycle

TODO: Specify prerequisite expression semantics, discovery, active/blocked/completed/historical states, and repeatability. Define blocking by active missions and completed objectives without relying on ID parsing.

## Completion and unlock effects

TODO: Define the supported effect kinds for information, agency/agent improvement, missions, faction progression, and campaign objectives. Reference the authoritative rules for each effect.

## Progression GDR validation

TODO: Define valid references, handling of cycles and unreachable GDRs, repeatable chains, and when availability is recomputed.

TODO: Write concrete requirements under descriptive section titles when rules replace these placeholders.

# Edge cases and failure behavior

TODO: Define behavior for Multiple prerequisites, simultaneous unlocks, faction defeat with active leads, failed/expired blocking missions, and duplicate completion effects.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

# Acceptance examples

TODO: Show a small lead/mission graph and its availability changes after success, failure, and faction defeat.
Identify initial conditions, inputs/actions, expected results, and hyperlinks to the requirement sections exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Choose prerequisite semantics and supported capability/effect types before authoring the full catalog.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
