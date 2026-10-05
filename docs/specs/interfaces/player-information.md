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

Player API, Dev mode, Session controller, and Delegated AI are owned by the
[Engine Contract glossary](../foundation/engine-contract.md#glossary).

TODO: Define information-schema terms without duplicating shared definitions.

# Concepts and contract

This specification refines [Information boundary](../foundation/engine-contract.md#information-boundary) with exposed
Properties, reveal conditions, and human/AI query consistency. Player API always exposes only Player-visible
information, independent of Dev mode. Separate full-state inspection is specified by Developer API; developer
inspection never changes gameplay reveal conditions or information supplied to Delegated AI.

Modeling Foundations supplies Player-visible information, Authoritative value, Derived value, and historical meanings.
Domain Model supplies represented concepts, and History and Persistence supplies restored facts and history positions.
Mechanics supply facts and calculations to expose. Investigations owns estimate mathematics and permitted inputs;
this specification owns the exposed Properties and reveal conditions, without duplicating formulas.
Historical explanations preserve [Historical fact preservation](../foundation/modeling-foundations.md#historical-fact-preservation).

# Requirements

## Player-visible information schemas and visibility

TODO: Specify the complete Player API query schemas using owning mechanics. State reveal conditions and distinguish
unknown information from zero or absence. For example, cover Agent capabilities, Investigation estimates, and
Mission outcomes without exposing hidden inputs through ordinary queries.

## Derived values and reports

TODO: Specify complete query and report inventories, including historical Player-visible information at the current
cursor. Reference owning mechanics for calculations. Restored views and reports must not reveal discarded-future facts.

## Boundary consistency

Session controller and Delegated AI receive the same Player-visible information for equal Campaign state and
equivalent Player API queries, independent of Dev mode. Delegated AI never receives Developer API inspection,
unrestricted saves, hidden command logs, or the Session controller's unrestricted conversation.

TODO: Define schema-level visibility for every Player API result path and history metadata. For example, validate
queries, action discovery, and errors against the same hidden-state boundary. Exclude gameplay RNG state and mutable
Campaign references. Engine Contract owns Delegated AI context and memory restoration guarantees.

# Edge cases and failure behavior

TODO: Define unknown-identifier results, information revealed and then undone, and formerly known historical facts.
Player API errors and action availability must preserve the information boundary in every Dev mode setting.

# Acceptance examples

TODO: Provide paired full-state and Player API fixtures proving visibility for Session controller and Delegated AI,
including after Dev mode changes and history navigation. Identify each exercised requirement section.

# Open decisions

- TODO: Choose complete Player API query schemas, reveal conditions, and uncertainty presentation.
- TODO: Choose historical-report visibility consistent with the restored history cursor.
