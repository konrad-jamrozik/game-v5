# TypeScript Player API

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | API                                                            |
| Family      | Interfaces                                                     |
| Status      | Stub                                                           |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Purpose and boundaries

Define the callable TypeScript contract through which humans and AI can fully play the game.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

- Uses [Domain Model](../foundation/domain-model.md) for the game concepts and identifiers represented in commands and reports.
- Uses [History and Persistence](../foundation/history-and-persistence.md) for the session, restoration, and save/load operations exposed by the player API.
- Uses [Modeling Foundations](../foundation/modeling-foundations.md) for shared Types, Instance IDs, and Campaign instance references in the public interface.
- Uses [Player Information](./player-information.md) for Player-visible information and the boundary around hidden Campaign state.
- Refines [Engine Contract](../foundation/engine-contract.md) by specifying the exact TypeScript player command, report, and error signatures.
- Used by [Campaign Integration and Acceptance Tests](../acceptance/campaign-integration-and-acceptance-tests.md) for the command and report surface exercised by integration scenarios.
- Used by [Developer API](./developer-api.md) for the player-facing contract alongside which the separate debugging surface operates.
- Used by [Terminal CLI](./cli.md) for the player commands, reports, and errors adapted for terminal interaction.
- Used by [Web UI](./web-ui.md) for the player commands, reports, and errors adapted for browser interaction.

# Relationships

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

TODO: Define the local terms here or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

# Concepts and contract

Public operations preserve [Derived value consistency](../foundation/engine-contract.md#derived-value-consistency), [Continuation state](../foundation/engine-contract.md#continuation-state), [Information boundary](../foundation/engine-contract.md#information-boundary), and [Committed state integrity](../foundation/engine-contract.md#committed-state-integrity) and [Campaign instances](../foundation/modeling-foundations.md#campaign-instances), [References](../foundation/modeling-foundations.md#references), and [Historical fact preservation](../foundation/modeling-foundations.md#historical-fact-preservation). An operation that creates a
Campaign instance must use a Campaign instance constructor contract satisfying [Campaign instances](../foundation/modeling-foundations.md#campaign-instances), with a declared Type for the returned Campaign instance and initialization of Instance ID, Archetype, Constants, and State. These conceptual components do not prescribe public argument shapes or serialized layouts.
Returning an existing Campaign instance or restoring its earlier state does not itself create a new Campaign instance; restoration
remains governed by History and Persistence and [Committed state integrity](../foundation/engine-contract.md#committed-state-integrity).

This specification intends to refine [Derived value consistency](../foundation/engine-contract.md#derived-value-consistency), [Continuation state](../foundation/engine-contract.md#continuation-state), [Information boundary](../foundation/engine-contract.md#information-boundary), and [Committed state integrity](../foundation/engine-contract.md#committed-state-integrity) with exact callable queries and commands, rejection behavior,
Player-visible information isolation, and continuation operations. It uses Modeling Foundations' meanings, Domain Model's game
concepts, Player Information's permitted views, and History and Persistence's restoration contract. The signatures
and error choices below remain TODOs rather than an already specified API.

TODO: Specify Game/session handle, Player-visible information, command arguments, action discovery, validation result, structured error, and state revision.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Requirements

## Functions and types

TODO: Specify exact public signatures for session lifecycle, queries, discovery, commands, results, and history. Clarify sync/async behavior; this API does not inherently require HTTP.

## Command semantics

TODO: Specify eligibility, atomic batch behavior, invalid/stale inputs, no-op handling, returned effects, and whether validation can be queried independently. Reference mechanic rules rather than reimplementing them.

## Client boundaries

TODO: Define Player-visible information immutability, data refresh behavior, and how callers persist sessions without obtaining dev-only gameplay information.
Apply the Game build compatibility policy in [Requirements](../foundation/engine-contract.md#requirements), [Game build compatibility](../foundation/engine-contract.md#game-build-compatibility).
Keep framework and AI-strategy dependencies out.

TODO: Write concrete requirements under descriptive section titles when rules replace these placeholders.

# Edge cases and failure behavior

TODO: Define behavior for Invalid/unknown identifiers, duplicate agent selections, empty batches, repeated commands, stale views, and operations after campaign end.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

# Acceptance examples

TODO: Provide a typed play sequence from creation through action discovery, investigation, turn advancement, report reading, and undo/redo.
Identify initial conditions, inputs/actions, expected results, and hyperlinks to the requirement sections exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Choose signatures, error codes, session ownership, concurrency/revision handling, and sync/async semantics.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
