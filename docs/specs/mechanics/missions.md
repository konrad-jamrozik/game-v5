# Missions

| Metadata    | Value                                                                               |
| ----------- | ----------------------------------------------------------------------------------- |
| Spec ID     | MISSION                                                                             |
| Family      | Mechanics                                                                           |
| Status      | Stub                                                                                |
| Audience    | Engine designer, Content designer, AI designer, Implementer                         |
| Owns        | Define mission commitments and translate combat results into campaign consequences. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                      |

# Overview

This document defines mission commitments and how combat results translate into campaign consequences.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

This specification refines Domain Model's mission contract ([Current versus historical teams](domain-model.md#current-versus-historical-teams)/[Mission kind and provenance](domain-model.md#mission-kind-and-provenance)/[Combat and consequences](domain-model.md#combat-and-consequences)) with what a Mission has, and intends to refine it
further with creation, deployment, deadlines,
resolution, and campaign consequences. Agents supplies participant eligibility, Combat supplies Battle results,
Economy and Upgrades supplies capacities and resource effects, and Factions supplies operation provenance and
suppression semantics. This specification also intends to refine Factions'
[Faction operation occurrence generation](./factions.md#faction-operation-occurrence-generation) and
[Suppression and defeat](./factions.md#suppression-and-defeat) with the Mission an occurrence creates and the Mission
outcomes that suppress a Faction. Game Data Records (GDRs) supply the mission catalog and numeric values under this contract.
The lifecycle and consequence choices remain TODOs below.

TODO: Specify Initiative mission, Response mission, Faction operation occurrence, deadline, deployment, Battle result, mission outcome, and partial success.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Relationships

- Uses [Agents](./agents-spec.md)
- Uses [Combat](./combat.md)
- Uses [Core Concepts](../foundation/core-concepts.md)
- Uses [Economy and Upgrades](./economy-and-upgrades.md)
- Uses [Engine Contract](../foundation/engine-contract.md)
- Uses [Factions](./factions.md)
- Refines [Domain Model](domain-model.md)
- Refines [Factions](./factions.md)
- Used by [Agent Recovery](./agent-recovery.md)
- Used by [Leads and Progression](./leads-and-progression.md)
- Used by [Turn Advancement](./turn-advancement.md)

# Glossary

TODO: Define the local terms here or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

# Mission aspects

A Mission has an Initiative or Response kind, an origin, an optional target Faction, deadline facts, a lifecycle and
outcome, Enemies, a Current team, Participation history, and a Battle result once resolved. Its Archetype describes
the encounter configuration. [Mission kind and provenance](domain-model.md#mission-kind-and-provenance)
and [Combat and consequences](domain-model.md#combat-and-consequences) in Domain Model own how a
Mission relates to Factions, Enemies, and its Battle result.

# Creation and lifecycle

TODO: Specify mission creation, states, deadlines, deployment/recall eligibility, transport use, resolution, and expiration. Distinguish mission purpose from combat tactics.

# Outcomes and partial success

TODO: Provide exact rewards and penalties for victory, retreat, wipe, and expiration. Define how damage inflicted benefits the player after failure, with units, normalization, bounds, and interaction with operation severity.

# Consequences and return

TODO: Specify survivor return, casualty effects, resource changes, suppression, unlocks, and reports. Reference owning rules to prevent duplicate application.

# Player-visible information

TODO: State which values this specification owns are Player-visible information, the reveal conditions of each, and
how the player tells an unknown value apart from zero or absence, under
[Player queries and actions](../foundation/engine-contract.md#player-queries-and-actions) in Engine Contract.

# Edge cases and failure behavior

TODO: Define behavior for Last-turn deployment, failed attempts versus expiration, negligible damage, overkill, multiple missions against one faction, and simultaneous rewards/penalties.
State whether a Mission created during Advance turn ages in that same Advance turn, and the outcome when creation and expiration, or reward and defeat conditions, coincide, under [Values a step uses](turn-advancement.md#values-a-step-uses).
State exact thresholds and effect ordering where relevant.

# Acceptance examples

TODO: Compare ignored, failed-with-damage, and successful versions of the same mission; include shared-transport contention.
Identify initial conditions, inputs/actions, expected results, and hyperlinks to the requirement sections exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Choose the partial-success formula and mission lifecycle rules, including whether reattempts exist; do not copy victory-only rewards as the v5 contract.
- TODO: Decide which data of Enemies must remain in World history once they no longer participate in current
  gameplay. This affects [Combat](combat.md).
- TODO: State the rule determining the Mission and Enemy Campaign instances that the initial Campaign state contains, and name the GDRs supplying their initial values, under [Initial Campaign state](domain-model.md#initial-campaign-state).
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
