# Developer API

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | DEV                                                            |
| Family      | Interfaces                                                     |
| Status      | Stub                                                           |
| Audience    | UI designer, Implementer                                       |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Overview

Define full Campaign state inspection and cheat-command details through Developer API, refining Engine Contract access and replay guarantees.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

This specification refines [Information boundary](../foundation/engine-contract.md#information-boundary) and
[Dev mode and developer operations](../foundation/engine-contract.md#dev-mode-and-developer-operations) with inspection
schemas and cheat-command details. Session API controls Dev mode. Developer API exposes full Campaign state,
including all Authoritative values, only to an authorized Session controller with Dev mode enabled and no active
Autopilot engagement. Player API always exposes only Player-visible information; Autopilot AI never receives developer access.

Engine Contract owns access transitions and high-level replay guarantees. Domain Model supplies inspected Campaign
state and invariants. History and Persistence supplies restoration procedures, and TypeScript Player API supplies
callable signatures and authorization results.

# Relationships

- Uses [Campaign Modeling Contract](../foundation/campaign-modeling-contract.md)
- Uses [Core Concepts](../foundation/core-concepts.md)
- Uses [Domain Model](../foundation/domain-model.md)
- Uses [History and Persistence](../foundation/history-and-persistence.md)
- Uses [TypeScript Player API](./typescript-api.md)
- Refines [Engine Contract](../foundation/engine-contract.md)
- Used by [History and Persistence](../foundation/history-and-persistence.md)
- Used by [TypeScript Player API](./typescript-api.md)

# Glossary

API surface and Principal terms are owned by the [Engine Contract glossary](../foundation/engine-contract.md#glossary).

TODO: Define inspection-specific terms without duplicating shared definitions.

# Inspection contract

Full Campaign state inspection presents each Campaign instance as its four properties, Instance ID, Archetype
reference, Constants, and State, as required by
[Campaign instance structure](../foundation/campaign-modeling-contract.md#campaign-instance-structure). How an
implementation stores Campaign instances internally is the implementer's choice.

TODO: Specify the complete detached, read-only Campaign state query schema through `developer.queries.getCampaignState()`.
Include all continuation inputs and distinguish full-state inspection from gameplay reveal conditions. Inspection
must not expose mutable Campaign references or consume gameplay randomness.

# Cheat command details

TODO: Specify `developer.actions.addMoney(amount)` and `developer.actions.addAgents(...)`, with exact input Types,
allowed ranges, initialization, validation, and effects. These required starter operations preserve model invariants
and commit replayable action-history entries. Additional cheat operations use the same namespace and guarantees.

# Isolation and history

TODO: Specify authorization failures and access revocation under Engine Contract. Recorded cheat restoration uses
history authority and does not require Dev mode. Detailed restoration must preserve deterministic continuation
without making internal replay operations callable by Autopilot AI.

# Edge cases and failure behavior

TODO: Specify inspection and cheat errors with Dev mode disabled, during an Autopilot engagement, or with stale access.
Invalid cheat inputs preserve Campaign state, RNG state, generated Instance IDs, reports, and history.

# Acceptance examples

TODO: Provide scenarios proving separate Developer API access, unchanged Player API visibility, Autopilot AI exclusion,
and cheat-command undo/redo and save/load round trips. Identify the requirement sections each scenario verifies.

# Open decisions

- TODO: Choose full-state result Types and precise cheat-command validation and effects.
- TODO: Decide which additional developer operations are needed beyond the required starter inventory.
