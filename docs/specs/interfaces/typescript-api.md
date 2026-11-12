# TypeScript Player API

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | API                                                            |
| Family      | Interfaces                                                     |
| Status      | Stub                                                           |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Overview

Define exact callable TypeScript signatures for Session API, Player API, Developer API, and Autopilot memory API, preserving Engine Contract authority and execution guarantees.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

This specification refines [API hierarchy](../foundation/engine-contract.md#api-hierarchy),
[Campaign lifecycle](../foundation/engine-contract.md#campaign-lifecycle),
[Autopilot limits](../foundation/engine-contract.md#autopilot-limits), and
[Autopilot lifecycle and concurrency](../foundation/engine-contract.md#autopilot-lifecycle-and-concurrency)
with exact callable signatures, argument Types, scoped access, Autopilot progress, and disengagement result Types. Player API always
exposes Player-visible information and includes Advance turn. Session API is restricted to the Session controller;
Developer API is separately gated by Dev mode. Autopilot memory API supplies Autopilot memory for the active Autopilot AI.

Public operations preserve [Derived value consistency](../foundation/engine-contract.md#derived-value-consistency),
[Continuation state](../foundation/engine-contract.md#continuation-state),
[Information boundary](../foundation/engine-contract.md#information-boundary), and
[Committed state integrity](../foundation/engine-contract.md#committed-state-integrity).
This specification refines those guarantees with exact query results, rejection behavior, and restoration-operation
results. Domain Model supplies represented game concepts, Player Information supplies permitted views, Developer API
supplies detailed full-state inspection and cheat-command contracts, and History and Persistence supplies storage
and restoration procedures. Campaign Modeling Contract supplies identity, reference, and Campaign instance contracts.

An operation creating a Campaign instance must satisfy
[Campaign instances](../foundation/campaign-modeling-contract.md#campaign-instances), with a declared return Type and
initialization of Instance ID, Archetype, Constants, and State. Returning an existing Campaign instance or restoring
its earlier State does not itself create a new Campaign instance. Public restoration preserves
[References](../foundation/campaign-modeling-contract.md#references) and
[Historical fact preservation](../foundation/campaign-modeling-contract.md#historical-fact-preservation).

# Relationships

- Uses [Campaign Modeling Contract](../foundation/campaign-modeling-contract.md)
- Uses [Core Concepts](../foundation/core-concepts.md)
- Uses [Developer API](./developer-api.md)
- Uses [Domain Model](../foundation/domain-model.md)
- Uses [History and Persistence](../foundation/history-and-persistence.md)
- Uses [Player Information](./player-information.md)
- Refines [Engine Contract](../foundation/engine-contract.md)
- Used by [Campaign Integration and Acceptance Tests](../acceptance/campaign-integration-and-acceptance-tests.md)
- Used by [Developer API](./developer-api.md)
- Used by [Terminal CLI](./cli.md)
- Used by [Web UI](./web-ui.md)

# Glossary

API surface and Principal terms are owned by the [Engine Contract glossary](../foundation/engine-contract.md#glossary).
Shared modeling and Session terms are owned by [Core Concepts](../foundation/core-concepts.md#glossary).
Campaign-specific composition terms are owned by [Campaign Modeling Contract](../foundation/campaign-modeling-contract.md#glossary).

TODO: Define signature-specific terms here without duplicating shared definitions.

# Functions and types

TODO: Specify exact signatures for Engine Contract's required starter operations in all four namespaces. Define
argument Types, return Types, structured errors, and scoped access validity. Cover action-level and turn-level
history navigation, all three Autopilot limits, engine-enforced disengagement reasons, and memory read/write.
Define operation availability without a Current campaign and handle invalidation after creation or load.
Clarify sync/async behavior; this API does not inherently require HTTP.

# Command semantics

TODO: Specify eligibility, atomic batch behavior, stale-input handling, and returned effects by referencing owning
mechanics and Engine Contract. Rejected actions and actions with no effect follow Engine Contract history and
randomness rules. Define whether eligibility can be queried independently without exposing hidden information.

TODO: Define Autopilot engagement, progress, disengagement, disengagement reasons, and finite execution budgets. Reject
stale action submissions and memory writes after termination. Failure must not silently advance a turn or replace
the Current campaign. Define Autopilot AI identity and how a configured Autopilot AI is selected without coupling
gameplay resolution to model providers.

# Client boundaries

TODO: Define detached Player API and Developer API results, revision handling, refresh behavior, and authorization
errors. Full Campaign state is available only through authorized Developer API inspection. Player API visibility
never changes with Dev mode. Implement Engine Contract save/load and memory isolation through History and Persistence.
Apply [Game build compatibility](../foundation/engine-contract.md#game-build-compatibility).

# Edge cases and failure behavior

TODO: Specify exact errors for invalid identifiers, stale access, unavailable history targets, and unauthorized
calls. Define concurrent submissions and process interruption without exposing intermediate Campaign state.

# Acceptance examples

TODO: Provide typed sequences exercising Engine Contract acceptance scenarios, including all Autopilot limits,
Developer API isolation, deterministic action replay, disengagement, and timeline-correct Autopilot memory.
Each scenario must identify the requirement sections it verifies.

# Open decisions

- TODO: Choose exact signatures, error codes, revision handling, and sync/async operation results.
- TODO: Choose finite Autopilot execution budgets and Autopilot AI selection inputs.
