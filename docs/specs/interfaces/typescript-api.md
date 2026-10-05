# TypeScript Player API

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | API                                                            |
| Family      | Interfaces                                                     |
| Status      | Stub                                                           |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Purpose and boundaries

Define exact callable TypeScript signatures for Session API, Player API, Developer API, and Delegated AI API, preserving Engine Contract authority and execution guarantees.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

- Uses [Developer API](./developer-api.md) for full Campaign state inspection fields and Dev mode transition behavior.
- Uses [Domain Model](../foundation/domain-model.md) for the game concepts and identifiers represented in commands and reports.
- Uses [History and Persistence](../foundation/history-and-persistence.md) for the session, restoration, and save/load operations exposed by the player API.
- Uses [Modeling Foundations](../foundation/modeling-foundations.md) for shared Types, Instance IDs, and Campaign instance references in the public interface.
- Uses [Player Information](./player-information.md) for Player-visible information and the boundary around hidden Campaign state.
- Refines [Engine Contract](../foundation/engine-contract.md) by specifying the exact TypeScript player command, report, and error signatures.
- Used by [Campaign Integration and Acceptance Tests](../acceptance/campaign-integration-and-acceptance-tests.md) for the command and report surface exercised by integration scenarios.
- Used by [Developer API](./developer-api.md) for Dev mode controls and full Campaign state access through Developer API.
- Used by [Terminal CLI](./cli.md) for the player commands, reports, and errors adapted for terminal interaction.
- Used by [Web UI](./web-ui.md) for the player commands, reports, and errors adapted for browser interaction.

# Relationships

- Uses [Developer API](./developer-api.md)
- Uses [Domain Model](../foundation/domain-model.md)
- Uses [History and Persistence](../foundation/history-and-persistence.md)
- Uses [Modeling Foundations](../foundation/modeling-foundations.md)
- Uses [Player Information](./player-information.md)
- Refines [Engine Contract](../foundation/engine-contract.md)
- Used by [Campaign Integration and Acceptance Tests](../acceptance/campaign-integration-and-acceptance-tests.md)
- Used by [Developer API](./developer-api.md)
- Used by [Terminal CLI](./cli.md)
- Used by [Web UI](./web-ui.md)

# Glossary

API surface and execution-role terms are owned by the [Engine Contract glossary](../foundation/engine-contract.md#glossary).
Shared modeling terms are owned by Modeling Foundations.

TODO: Define signature-specific terms here without duplicating shared definitions.

# Concepts and contract

This specification refines [API hierarchy](../foundation/engine-contract.md#api-hierarchy),
[Campaign lifecycle](../foundation/engine-contract.md#campaign-lifecycle),
[Delegation scopes](../foundation/engine-contract.md#delegation-scopes), and
[Delegation lifecycle and concurrency](../foundation/engine-contract.md#delegation-lifecycle-and-concurrency)
with exact callable signatures, argument Types, scoped access, progress, and terminal result Types. Player API always
exposes Player-visible information and includes Advance turn. Session API is restricted to the Session controller;
Developer API is separately gated by Dev mode. Delegated AI API supplies continuation memory for the active Delegated AI.

Public operations preserve [Derived value consistency](../foundation/engine-contract.md#derived-value-consistency),
[Continuation state](../foundation/engine-contract.md#continuation-state),
[Information boundary](../foundation/engine-contract.md#information-boundary), and
[Committed state integrity](../foundation/engine-contract.md#committed-state-integrity).
This specification refines those guarantees with exact query results, rejection behavior, and restoration-operation
results. Domain Model supplies represented game concepts, Player Information supplies permitted views, Developer API
supplies detailed full-state inspection and cheat-command contracts, and History and Persistence supplies storage
and restoration procedures. Modeling Foundations supplies identity, reference, and Campaign instance contracts.

An operation creating a Campaign instance must satisfy
[Campaign instances](../foundation/modeling-foundations.md#campaign-instances), with a declared return Type and
initialization of Instance ID, Archetype, Constants, and State. Returning an existing Campaign instance or restoring
its earlier State does not itself create a new Campaign instance. Public restoration preserves
[References](../foundation/modeling-foundations.md#references) and
[Historical fact preservation](../foundation/modeling-foundations.md#historical-fact-preservation).

# Requirements

## Functions and types

TODO: Specify exact signatures for Engine Contract's required starter operations in all four namespaces. Define
argument Types, return Types, structured errors, and scoped access validity. Cover action-level and turn-level
history navigation, all three delegation scopes, engine-enforced terminal results, and memory read/write.
Define operation availability without a Current campaign and handle invalidation after creation or load.
Clarify sync/async behavior; this API does not inherently require HTTP.

## Command semantics

TODO: Specify eligibility, atomic batch behavior, stale-input handling, and returned effects by referencing owning
mechanics and Engine Contract. Rejected actions and actions with no effect follow Engine Contract history and
randomness rules. Define whether eligibility can be queried independently without exposing hidden information.

TODO: Define Delegation run start, progress, cancellation, terminal results, and finite execution budgets. Reject
stale action submissions and memory writes after termination. Failure must not silently advance a turn or replace
the Current campaign. Define AI controller identity and how a configured AI controller is selected without coupling
gameplay resolution to model providers.

## Client boundaries

TODO: Define detached Player API and Developer API results, revision handling, refresh behavior, and authorization
errors. Full Campaign state is available only through authorized Developer API inspection. Player API visibility
never changes with Dev mode. Implement Engine Contract save/load and memory isolation through History and Persistence.
Apply [Game build compatibility](../foundation/engine-contract.md#game-build-compatibility).

# Edge cases and failure behavior

TODO: Specify exact errors for invalid identifiers, stale access, unavailable history targets, and unauthorized
calls. Define concurrent submissions and process interruption without exposing intermediate Campaign state.

# Acceptance examples

TODO: Provide typed sequences exercising Engine Contract acceptance scenarios, including all delegation scopes,
Developer API isolation, deterministic action replay, cancellation, and timeline-correct Delegated AI memory.
Each scenario must identify the requirement sections it verifies.

# Open decisions

- TODO: Choose exact signatures, error codes, revision handling, and sync/async operation results.
- TODO: Choose finite delegation execution budgets and AI controller selection inputs.
