# History and Persistence

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | HIST                                                           |
| Family      | Foundation                                                     |
| Status      | Stub                                                           |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Purpose and boundaries

Define reversible sessions, reproducible replay, and durable save/load behavior.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

- Uses [Developer API](../interfaces/developer-api.md) for the detailed isolation and replay behavior of Developer API commands during restoration.
- Uses [Domain Model](./domain-model.md) for the game structures and identity/reference relationships preserved during restoration.
- Uses [Modeling Foundations](./modeling-foundations.md) for Campaign state, History, Retained data, and identity/reference contracts in restoration and replay.
- Uses [Numbers and Randomness](./numbers-and-randomness.md) for numeric representation, rounding, and reproducible random draws.
- Refines [Engine Contract](./engine-contract.md) by specifying the reversible session, replay, and save/load guarantees.
- Used by [Campaign Integration and Acceptance Tests](../acceptance/campaign-integration-and-acceptance-tests.md) for restoration, replay, and continuation contracts exercised by scenarios.
- Used by [Developer API](../interfaces/developer-api.md) for the retained Campaign state and restoration behavior available for debugging.
- Used by [Player Information](../interfaces/player-information.md) for the retained facts and restored session state available for player reports.
- Used by [Terminal CLI](../interfaces/cli.md) for the session and save/load behavior exposed through terminal commands.
- Used by [TypeScript Player API](../interfaces/typescript-api.md) for the session, restoration, and save/load operations exposed by the player API.
- Used by [Web UI](../interfaces/web-ui.md) for the session and save/load behavior exposed through browser controls.

# Relationships

- Uses [Developer API](../interfaces/developer-api.md)
- Uses [Domain Model](./domain-model.md)
- Uses [Modeling Foundations](./modeling-foundations.md)
- Uses [Numbers and Randomness](./numbers-and-randomness.md)
- Refines [Engine Contract](./engine-contract.md)
- Used by [Campaign Integration and Acceptance Tests](../acceptance/campaign-integration-and-acceptance-tests.md)
- Used by [Developer API](../interfaces/developer-api.md)
- Used by [Player Information](../interfaces/player-information.md)
- Used by [Terminal CLI](../interfaces/cli.md)
- Used by [TypeScript Player API](../interfaces/typescript-api.md)
- Used by [Web UI](../interfaces/web-ui.md)

# Glossary

| Term    | Definition                                                                                                                           |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Session | The owner of Current campaign selection, its Campaign state, history navigation, and controller state that must follow that history. |

API surface and execution-role terms and Turn-start checkpoint are owned by the
[Engine Contract glossary](engine-contract.md#glossary).

TODO: Define storage-specific terms without duplicating shared definitions.

# Concepts and contract

## Session

Session API selects the Current campaign under [Campaign lifecycle](engine-contract.md#campaign-lifecycle).
This specification refines [Action history and turn navigation](engine-contract.md#action-history-and-turn-navigation),
[Delegated AI memory](engine-contract.md#delegated-ai-memory), and [Save and load](engine-contract.md#save-and-load)
with restoration procedures, checkpoint storage, retention limits, and encoding. Navigation targets, retained save
contents, and Dev mode lifecycle are defined by Engine Contract, not open decisions here.

This specification also refines [Derived value consistency](engine-contract.md#derived-value-consistency),
[Continuation state](engine-contract.md#continuation-state), and
[Committed state integrity](engine-contract.md#committed-state-integrity) with cache invalidation, restoration of
complete continuation state, and atomic undo/redo and load procedures. Domain Model supplies the Campaign instances
restored; Numbers and Randomness supplies numeric and generator-state contracts. Developer API supplies the
inspection and cheat-command isolation details used during restoration.

Restoration must preserve [Campaign instances](modeling-foundations.md#campaign-instances),
[References](modeling-foundations.md#references), and
[Historical fact preservation](modeling-foundations.md#historical-fact-preservation). Undo may remove a Campaign
instance or restore earlier State; redo restores its Instance ID, Archetype, and Constants unchanged. Required
historical records remain immutable even in an evolving collection. Restoration is not creation of a new occurrence.

## Controller state

Delegated AI continuation memory is isolated by Campaign, AI controller identity, history position, and timeline
branch. Restoration must not supply memory or external conversation from an undone future. Developer API commands
follow the same deterministic replay guarantees as Player API commands. Dev mode is Session authority and must not
be restored from action history or saves.

# Requirements

## Undo and redo

TODO: Specify storage and restoration procedures for atomic Player API and Developer API action-history entries,
complete continuation state, memory checkpoints, and retained redo continuation under Engine Contract.
Define history retention limits without an additional rewind penalty. Represent Turn-start checkpoints using
Engine Contract navigation targets; individual actions remain separate history entries within a Delegation run.

## Replay and persistence

TODO: Specify save encoding, load validation, and replay procedures under
[Save and load](engine-contract.md#save-and-load) and
[Game build compatibility](engine-contract.md#game-build-compatibility). Saves retain complete continuation state,
the history cursor, retained undo/redo continuation, and Delegated AI memory checkpoints. Failed load preserves the
prior Session; successful load has no active Delegation run and Dev mode disabled.

## Session-owned state

TODO: Specify storage separation for Current campaign selection, Campaign state, UI preferences, Dev mode, and
Delegated AI memory. History navigation leaves Dev mode unchanged and restores only applicable memory checkpoints.
Detail checkpoint replacement at the same position, discarded-future removal across AI controllers, late-result
rejection, and cache invalidation. External model conversations must not bypass restored memory boundaries.

# Edge cases and failure behavior

TODO: Specify errors and atomic restoration behavior for unavailable targets, corrupt saves, and interrupted storage.
Define representation of partially retained futures without changing Engine Contract navigation targets.

# Acceptance examples

TODO: Specify action-level and turn-level restoration and save/load scenarios comparing complete Campaign state,
generated Instance IDs, RNG state, reports, and applicable Delegated AI memory. Verify developer-command replay
with Dev mode disabled and removal of discarded-future memory. Identify each exercised requirement section.

# Open decisions

- TODO: Choose history retention limits, checkpoint storage, save encoding, and storage versioning.
- TODO: Choose validation and incompatible-save diagnostics under Engine Contract compatibility rules.
