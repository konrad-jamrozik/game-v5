# History and Persistence

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | HIST                                                           |
| Family      | Foundation                                                     |
| Status      | Stub                                                           |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Purpose and boundaries

Define reversible campaign history, reproducible replay, and durable save/load behavior.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

- Uses [Campaign Modeling Contract](./campaign-modeling-contract.md) for campaign identity, reference resolution, and historical-preservation constraints that restoration must preserve.
- Uses [Core Concepts](./core-concepts.md) for Session, Campaign state, History, and committed-data meanings applied to restoration and storage.
- Uses [Developer API](../interfaces/developer-api.md) for the detailed isolation and replay behavior of Developer API commands during restoration.
- Uses [Domain Model](./domain-model.md) for the game structures and identity/reference relationships preserved during restoration.
- Uses [Numbers and Randomness](./numbers-and-randomness.md) for numeric representation, rounding, and reproducible random draws.
- Refines [Engine Contract](./engine-contract.md) by specifying the reversible campaign history, replay, and save/load guarantees.
- Used by [Campaign Integration and Acceptance Tests](../acceptance/campaign-integration-and-acceptance-tests.md) for restoration, replay, and continuation contracts exercised by scenarios.
- Used by [Developer API](../interfaces/developer-api.md) for the retained Campaign state and restoration behavior available for debugging.
- Used by [Player Information](../interfaces/player-information.md) for the retained facts and restored campaign state available for player reports.
- Used by [Terminal CLI](../interfaces/cli.md) for the session and save/load behavior exposed through terminal commands.
- Used by [TypeScript Player API](../interfaces/typescript-api.md) for the session, restoration, and save/load operations exposed by the player API.
- Used by [Web UI](../interfaces/web-ui.md) for the session and save/load behavior exposed through browser controls.

# Relationships

- Uses [Campaign Modeling Contract](./campaign-modeling-contract.md)
- Uses [Core Concepts](./core-concepts.md)
- Uses [Developer API](../interfaces/developer-api.md)
- Uses [Domain Model](./domain-model.md)
- Uses [Numbers and Randomness](./numbers-and-randomness.md)
- Refines [Engine Contract](./engine-contract.md)
- Used by [Campaign Integration and Acceptance Tests](../acceptance/campaign-integration-and-acceptance-tests.md)
- Used by [Developer API](../interfaces/developer-api.md)
- Used by [Player Information](../interfaces/player-information.md)
- Used by [Terminal CLI](../interfaces/cli.md)
- Used by [TypeScript Player API](../interfaces/typescript-api.md)
- Used by [Web UI](../interfaces/web-ui.md)

# Glossary

Session is defined by [Core Concepts](core-concepts.md#glossary).

API surface and execution-role terms and Turn-start checkpoint are owned by the
[Engine Contract glossary](engine-contract.md#glossary).

| Term                         | Definition                                                                                                                                                                                                                                               |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Game storage                 | The persisted root of all data that survives the end of a Session: one Global configuration and zero or more Campaign saves.                                                                                                                             |
| Global configuration         | The one persisted set of application-wide settings, shared by all Campaigns and available before any Campaign is selected. It contains preferences and defaults for new Campaigns, never Campaign state.                                                 |
| Campaign save                | A persisted snapshot of one Campaign's timeline, identified by its Campaign save ID and recording its Campaign ID, its Campaign state at the saved history position, and its Controller continuation data. One Campaign may have several Campaign saves. |
| Campaign ID                  | The ULID identifying one Campaign, assigned when the Campaign is created and recorded in every Campaign save of that Campaign. It is not Campaign state, Rules never consult it, and it is distinct from the Instance ID of the Campaign instance.       |
| Campaign save ID             | The ULID identifying one Campaign save, assigned when that Campaign save is created.                                                                                                                                                                     |
| Controller continuation data | Data needed to continue controlling a Campaign that gameplay Rules never consult: the action history, including retained redo entries, the history cursor, and Autopilot memory checkpoints.                                                             |
| History retention limit      | The maximum number of turns of action history a timeline retains; older Turn-start checkpoints and their entries are discarded as play advances.                                                                                                         |

# Concepts and contract

## Refined Engine Contract guarantees

Session API selects the Current campaign under [Campaign lifecycle](engine-contract.md#campaign-lifecycle).
This specification refines [Action history and turn navigation](engine-contract.md#action-history-and-turn-navigation),
[Autopilot memory](engine-contract.md#autopilot-memory), and [Save and load](engine-contract.md#save-and-load)
with restoration procedures, checkpoint storage, retention limits, and encoding. Navigation targets, retained save
contents, and Dev mode lifecycle are defined by Engine Contract, not open decisions here.

This specification also refines [Derived value consistency](engine-contract.md#derived-value-consistency),
[Continuation state](engine-contract.md#continuation-state), and
[Committed state integrity](engine-contract.md#committed-state-integrity) with cache invalidation, restoration of
complete continuation state, and atomic undo/redo and load procedures. Domain Model supplies the Campaign instances
restored; Numbers and Randomness supplies numeric and generator-state contracts. Developer API supplies the
inspection and cheat-command isolation details used during restoration.

Restoration must preserve [Campaign instances](campaign-modeling-contract.md#campaign-instances),
[References](campaign-modeling-contract.md#references), and
[Historical fact preservation](campaign-modeling-contract.md#historical-fact-preservation). Undo may remove a Campaign
instance or restore earlier State; redo restores its Instance ID, Archetype, and Constants unchanged. Required
historical records remain immutable even in an evolving collection. Restoration is not creation of a new occurrence.

## Storage containers

The following conceptual hierarchy shows ownership of persisted and runtime data. It is not a database schema, file
format, or required class layout.

```text
Game storage (persisted)
├── Global configuration (one set)
└── Campaign saves (zero or more)
    └── Campaign save
        ├── Campaign save ID and Campaign ID
        ├── Campaign state (at the saved history position)
        │   ├── Campaign configuration
        │   └── World state
        │       ├── Current world state
        │       └── History
        └── Controller continuation data
            ├── Action history (past and retained redo entries) and history cursor
            └── Autopilot memory checkpoints

Session (runtime, never persisted)
    Current campaign selection · Current save · Dev mode · active Autopilot engagement
```

A Campaign save contains more than Campaign state because continuing a Campaign also requires Controller continuation
data. Action history and History are distinct: History is part of World state and Rules may consult it, while action
history is the undo and redo record of committed commands and Rules never consult it.

One Campaign may have several Campaign saves. For example, a player may keep a timeline branch that a new action
after undo would otherwise discard, or keep an earlier position if history retention limits truncate a timeline.
Campaign saves of one Campaign share its Campaign ID and have distinct Campaign save IDs. Two Campaigns created with
equal Campaign configuration and seed and given equal commands have equal Campaign state but distinct Campaign IDs;
each may be saved. Identifier format follows [Unique identifiers](../governance/spec-conventions.md#unique-identifiers).

Saving overwrites the Current save, and saving as new creates another Campaign save of the same Campaign, under
[Save and load](engine-contract.md#save-and-load). A fork is a Campaign save created by saving as new; it keeps the
Campaign ID and receives a new Campaign save ID.

Global configuration is read when a Session starts, so its settings apply at the main menu before any Campaign is
selected. Selecting, creating, or loading a Campaign never replaces Global configuration, and Campaign saves do not
contain it. Interface preferences such as volume, language, and tutorial popups belong to Global configuration.

TODO: Specify the configuration cascade between Game build defaults, Global configuration, explicit creation choices,
and Campaign configuration.

## Controller state

Autopilot memory is isolated by Campaign, Autopilot AI identity, history position, and timeline
branch. Restoration must not supply memory or external conversation from an undone future. Developer API commands
follow the same deterministic replay guarantees as Player API commands. Dev mode is Session authority and must not
be restored from action history or saves.

# Requirements

## Undo and redo

TODO: Specify storage and restoration procedures for atomic Player API and Developer API action-history entries,
complete continuation state, memory checkpoints, and retained redo continuation under Engine Contract.
Represent Turn-start checkpoints using
Engine Contract navigation targets; individual actions remain separate history entries within an Autopilot engagement.

### History retention limit

The History retention limit bounds how many turns of action history a timeline retains, as a safety measure against
unbounded storage growth rather than a gameplay rule; no rewind penalty is added. The proposed value is 1000 turns.
When a committed Advance turn would make the retained timeline exceed the limit, the oldest Turn-start checkpoint is
discarded together with the action-history entries and Autopilot memory checkpoints before the new earliest retained
Turn-start checkpoint. For example, with a limit of 1000 turns, after advancing to turn 1001 the earliest undo target
is the start of turn 2; after advancing to turn 1002 it is the start of turn 3.

Truncation applies to the timeline in the Session and reaches a Campaign save only when that save is next written.
Other Campaign saves of the same Campaign keep their own retained history. Truncation never removes History within
World state, and restoring the earliest retained position must not depend on replay from campaign creation.

TODO: Decide whether retained redo entries count toward the History retention limit, confirm the limit value, and
specify how the earliest retained position is stored.

## Replay and persistence

TODO: Specify save encoding, load validation, and replay procedures under
[Save and load](engine-contract.md#save-and-load) and
[Game build compatibility](engine-contract.md#game-build-compatibility). Saves retain complete continuation state,
the history cursor, retained undo/redo continuation, and Autopilot memory checkpoints. Failed load preserves the
prior Session; successful load has no active Autopilot engagement and Dev mode disabled.

## Campaign configuration persistence

Campaign configuration is Campaign state under [World state and Campaign configuration](core-concepts.md#world-state-and-campaign-configuration).
Saving must retain its committed values together with World state. Successful load restores the selected Campaign's
configuration from the save, rather than retaining configuration from the previously selected Campaign or replacing
saved values with creation defaults.

Undo and redo restore the configuration at the target history position together with the corresponding World state.
Reproduction of later actions uses the configuration applicable at their original positions, not the configuration
at the time replay is requested. A configuration change after undo follows the existing timeline-branch rules.
Interface preferences belong to Global configuration, not Campaign state, and Dev mode is never Campaign state.

Session contents, namely the Current campaign selection, Dev mode, and the active Autopilot engagement, are never
persisted. Continuation data associated with a Campaign's history is saved with that Campaign, not with the Session.

TODO: Specify storage separation between Campaign state and Controller continuation data within a Campaign save. History navigation leaves Dev mode unchanged and restores only applicable memory checkpoints.
Detail checkpoint replacement at the same position, discarded-future removal across Autopilot AIs, late-result
rejection, and cache invalidation. External model conversations must not bypass restored memory boundaries.

# Edge cases and failure behavior

TODO: Specify errors and atomic restoration behavior for unavailable targets, corrupt saves, and interrupted storage.
Define representation of partially retained futures without changing Engine Contract navigation targets.

# Acceptance examples

- **Campaign configuration isolation:** Save Campaign A, then load a save of Campaign B with different Campaign
  configuration. B's saved values apply. Loading A's save restores A's saved values
  ([Campaign configuration persistence](#campaign-configuration-persistence)).
- **Configuration history:** Commit a configuration change. Undo restores the preceding configuration and World
  state; redo restores the committed configuration and World state, including any explicitly specified effects
  ([Campaign configuration persistence](#campaign-configuration-persistence)).

TODO: Specify action-level and turn-level restoration and save/load scenarios comparing complete Campaign state,
generated Instance IDs, RNG state, reports, and applicable Autopilot memory. Verify developer-command replay
with Dev mode disabled and removal of discarded-future memory. Identify each exercised requirement section.

# Open decisions

- TODO: Decide whether retained redo entries count toward the History retention limit, and confirm its value.
- TODO: Choose checkpoint storage, save encoding, and storage versioning.
- TODO: Choose validation and incompatible-save diagnostics under Engine Contract compatibility rules.
