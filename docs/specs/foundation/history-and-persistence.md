# History and Persistence

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | HIST                                                           |
| Family      | Foundation                                                     |
| Status      | Stub                                                           |
| Audience    | Engine designer, UI designer, Implementer                      |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Overview

This document defines reversible campaign history, reproducible replay, and durable save/load behavior.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

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

API surface and Principal terms and Turn-start checkpoint are owned by the
[Engine Contract glossary](engine-contract.md#glossary).

| Term                         | Definition                                                                                                                                                                                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Game storage                 | The persisted root of all data that survives the end of a Session: one Global configuration and zero or more Campaign saves.                                                                                                                                 |
| Global configuration         | The one persisted set of application-wide settings, shared by all Campaigns and available before any Campaign is selected. It contains preferences and defaults for new Campaigns, stores only values the player has set, and never contains Campaign state. |
| Campaign save                | A persisted snapshot of one Campaign's timeline, identified by its Campaign save ID and recording its Campaign ID, its Campaign state at the saved history position, and its Controller continuation data. One Campaign may have several Campaign saves.     |
| Campaign ID                  | The ULID identifying one Campaign, assigned when the Campaign is created and recorded in every Campaign save of that Campaign. It is not Campaign state, Rules never consult it, and it is distinct from the Instance ID of the Campaign instance.           |
| Campaign save ID             | The ULID identifying one Campaign save, assigned when that Campaign save is created.                                                                                                                                                                         |
| Controller continuation data | Data needed to continue controlling a Campaign that gameplay Rules never consult: the action history, including retained redo entries, the history cursor, and Autopilot memory checkpoints.                                                                 |
| Save size limit              | The maximum size of one Campaign save on disk, fixed by the Game build.                                                                                                                                                                                      |
| Baseline                     | The complete Campaign state at the earliest position a Campaign save can restore: the initial Campaign state, or the saved Campaign state when the save's action history was dropped.                                                                        |

# Refined Engine Contract guarantees

Session API selects the Current campaign under [Campaign lifecycle](engine-contract.md#campaign-lifecycle).
This specification refines [Action history and turn navigation](engine-contract.md#action-history-and-turn-navigation),
[Autopilot memory](engine-contract.md#autopilot-memory), and [Save and load](engine-contract.md#save-and-load)
with restoration procedures, checkpoint storage, the Save size limit, and encoding. Navigation targets, retained save
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

# Storage containers

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
after undo would otherwise discard, or keep a save with full history before a later save drops it under the Save size limit.
Campaign saves of one Campaign share its Campaign ID and have distinct Campaign save IDs. Two Campaigns created with
equal Campaign configuration and seed and given equal commands have equal Campaign state but distinct Campaign IDs;
each may be saved. Identifier format follows [Unique identifiers](../governance/spec-conventions.md#unique-identifiers).

Saving overwrites the Current save, and saving as new creates another Campaign save of the same Campaign, under
[Save and load](engine-contract.md#save-and-load). A fork is a Campaign save created by saving as new; it keeps the
Campaign ID and receives a new Campaign save ID.

Global configuration is read when a Session starts, so its settings apply at the main menu before any Campaign is
selected. Selecting, creating, or loading a Campaign never replaces Global configuration, and Campaign saves do not
contain it. Interface preferences such as volume, language, and tutorial popups belong to Global configuration.

## Configuration cascade

Three kinds of setting are distinct. Only the last two take part in the configuration cascade.

| Kind                   | For example                             | Where it lives                            | Persisted         |
| ---------------------- | --------------------------------------- | ----------------------------------------- | ----------------- |
| Session access setting | Dev mode                                | Session                                   | Never             |
| Global configuration   | Volume, language, new-Campaign defaults | Game storage                              | Yes, one set      |
| Campaign configuration | Investigation difficulty multiplier     | Campaign state, within each Campaign save | Yes, per Campaign |

The effective value of each setting follows this complete rule set:

| Setting scope     | Effective value                                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Global preference | A value stored in Global configuration overrides the Game build default.                                                             |
| New Campaign      | An explicit creation choice overrides a new-Campaign default stored in Global configuration, which overrides the Game build default. |
| Existing Campaign | Its own Campaign configuration applies, including changes committed during play and restored by undo, redo, and load.                |

Campaign creation resolves every Campaign configuration value through this cascade and records the complete result in
the initial Campaign state; no Campaign configuration value is left to be resolved later. Values are copied at
creation, not inherited: changing a new-Campaign default or a Game build default never changes an existing Campaign,
and loading a Campaign save restores its Campaign configuration regardless of the current Global configuration.

Global configuration stores only values the player has set. A setting the player has not set follows the current
Game build default, so a later Game build's changed default reaches it; resetting a setting removes its stored value.
If a stored value is invalid in the current Game build, the Game build default applies and the problem is reported;
starting the game never fails because of an invalid stored value.

Creating a Campaign does not change the stored new-Campaign defaults. The player changes them only through a separate,
explicit action. Campaign-specific overrides of global preferences are out of scope.

# Controller state

Autopilot memory is isolated by Campaign, Autopilot AI identity, history position, and timeline
branch. Restoration must not supply memory or external conversation from an undone future. Developer API commands
follow the same deterministic replay guarantees as Player API commands. Dev mode is Session authority and must not
be restored from action history or saves.

# Undo and redo

TODO: Specify storage and restoration procedures for atomic Player API and Developer API action-history entries,
complete continuation state, memory checkpoints, and retained redo continuation under Engine Contract.
Represent Turn-start checkpoints using
Engine Contract navigation targets; individual actions remain separate history entries within an Autopilot engagement.

## Save size limit

Undo and redo history in the Session has no turn limit. The Save size limit is a safety measure against unbounded
disk use rather than a gameplay rule; no rewind penalty is added.

Every Campaign save has a Baseline and the action history after it. Restoring any position replays action history
from the Baseline. A save written with its full history has the initial Campaign state as its Baseline.

If writing a Campaign save with its action history would exceed the Save size limit, the save is written without it:
it contains the Campaign state at the history cursor, which becomes its Baseline, and no action history, so neither
undo nor redo entries are retained. Its Autopilot memory checkpoints are reduced to the one applicable at the cursor.
The save operation reports that history was dropped. The Session keeps its own undo and redo history until the
Current campaign is closed or replaced; other Campaign saves of the same Campaign are unchanged. Dropping action
history never removes History within World state.

After such a save is loaded, the Baseline is the earliest position: undo before it is unavailable, and replay of
later actions starts from it.

The Save size limit is 100 MiB. If a Campaign save would exceed the limit even without action history, the save
operation fails: no Campaign save is written or changed, the Current save is unchanged, and the Session keeps its
Current campaign and history.

# Replay and persistence

TODO: Specify save encoding, load validation, and replay procedures under
[Save and load](engine-contract.md#save-and-load) and
[Game build compatibility](engine-contract.md#game-build-compatibility). Saves retain complete continuation state,
the history cursor, retained undo/redo continuation, and Autopilot memory checkpoints. Failed load preserves the
prior Session; successful load has no active Autopilot engagement and Dev mode disabled.

# Campaign configuration persistence

Campaign configuration is Campaign state under [Campaign state composition](campaign-modeling-contract.md#campaign-state-composition).
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
- **Defaults copied at creation:** With a stored new-Campaign default difficulty of hard, create Campaign A without an
  explicit choice and Campaign B choosing easy. A records hard and B records easy. Changing the stored default to
  normal changes neither A nor B, and loading either save restores its own value ([Configuration cascade](#configuration-cascade)).
- **History dropped at the size limit:** At turn 40, save a Campaign whose action history would exceed the Save size
  limit. The save reports dropped history. Load it: the turn 40 position is the Baseline, `undoAction()` and
  `undoTurn()` are unavailable, and new actions replay from it ([Save size limit](#save-size-limit)).
- **Save too large without history:** Save a Campaign whose Campaign state alone exceeds 100 MiB. The save fails,
  every existing Campaign save is unchanged, and undo and redo in the Session still work ([Save size limit](#save-size-limit)).

TODO: Specify action-level and turn-level restoration and save/load scenarios comparing complete Campaign state,
generated Instance IDs, RNG state, reports, and applicable Autopilot memory. Verify developer-command replay
with Dev mode disabled and removal of discarded-future memory. Identify each exercised requirement section.

# Open decisions

- TODO: Choose checkpoint storage, save encoding, and storage versioning.
- TODO: Choose validation and incompatible-save diagnostics under Engine Contract compatibility rules.
