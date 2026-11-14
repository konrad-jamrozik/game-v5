# Saves

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | SAVES                                                          |
| Family      | Foundation                                                     |
| Status      | Draft                                                          |
| Audience    | Engine designer, UI designer, Implementer                      |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Overview

This document defines Campaign saves: what a Campaign save holds, saving, saving as new, loading, listing, the Autosaves the
engine writes, the Save size limit, and which Campaign saves a Game build loads.

It owns what saving and loading observably do. How a Campaign save is encoded and stored is the implementer's choice.
Undo and redo, both within one Turn and across Turns, is owned by [Timeline](timeline.md), which builds on the
Autosaves defined here.

# Relationships

- Uses [Campaign Lifecycle](./campaign-lifecycle.md)
- Uses [Core Concepts](./core-concepts.md)
- Uses [Determinism and Randomness](./determinism-and-randomness.md)
- Uses [Engine Contract](./engine-contract.md)
- Used by [Campaign Integration and Acceptance Tests](../acceptance/campaign-integration-and-acceptance-tests.md)
- Used by [Storage Schema](../implementation/storage-schema.md)
- Used by [Timeline](./timeline.md)

# Glossary

Campaign save, Current save, Current campaign, Game storage, Global configuration, Timeline, Player action,
Committed state, Turn, Turn-end state, Autopilot engagement, and Autopilot memory are defined by the
[Engine Contract glossary](engine-contract.md#glossary). Independent identifier is defined by the
[Determinism and Randomness glossary](determinism-and-randomness.md#glossary).

## Identifiers

The identifiers of Campaigns and their Campaign saves.

| Term             | Definition                                                                                                                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Campaign ID      | The Independent identifier identifying one Campaign, assigned when the Campaign is created and shared by every Campaign save of that Campaign. It is not Campaign state, and game behavior never consults it. |
| Campaign save ID | The Independent identifier identifying one Campaign save, assigned when that Campaign save is created.                                                                                                        |

## Autosave kinds

The Campaign saves the engine writes itself.

| Term                | Definition                                                                                                                                                        |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Autosave            | A Campaign save that the engine writes without a save request from the Session controller, under [Autosaves](#autosaves).                                         |
| Current Autosave    | The Autosave holding the Committed state the Campaign is at now, kept up to date at all times so that play can resume after the Session ends for whatever reason. |
| Turn-end Autosave   | The Autosave holding the Turn-end state of one Turn, written when the player advances the turn.                                                                   |
| Engagement Autosave | The Autosave holding the Committed state in which the most recent Autopilot engagement began.                                                                     |

## Limits

The bounds on Campaign saves.

| Term            | Definition                                                                                                     |
| --------------- | -------------------------------------------------------------------------------------------------------------- |
| Save size limit | The maximum size of one Campaign save, fixed by the Game build.                                                |
| Autosave limit  | The number of Turns whose Turn-end Autosave is kept for one Campaign. It is a setting in Global configuration. |

# Campaign save contents

A Campaign save holds, as shown under [Data ownership](engine-contract.md#data-ownership):

- its Campaign save ID and the Campaign ID of its Campaign;
- the Campaign state at the saved Committed state;
- the Timeline as it is at that Committed state, which is the Timeline of the Turn that Committed state belongs to;
- the Autopilot memory of the Campaign.

A Campaign save holds nothing a Session holds and no Global configuration. It holds no Timeline of an earlier Turn.

One Campaign may have several Campaign saves, which share its Campaign ID and have distinct Campaign save IDs. E.g., a
player may keep a Campaign save from before a risky decision and another from after it. Two Campaigns created with
equal creation inputs, including the same Campaign seed, and given equal commands have equal Campaign state but
distinct Campaign IDs. Because the Campaign seed is Campaign state, under
[Campaign seed](determinism-and-randomness.md#campaign-seed), every Campaign save holds it.

# Saving

Saving captures the Current campaign at its current Committed state. It is available at every Committed state,
including before the player advances the turn, and it is not a Player action.

`session.saves.save()` writes the Current campaign to its Current save, replacing that Campaign save's contents.
When the Current campaign has no Current save, it creates a new Campaign save and makes that the Current save.

`session.saves.saveAsNew()` always creates a new Campaign save of the same Campaign and makes that the Current
save; every earlier Campaign save is unchanged. Keeping a line of play that later play would replace uses
`saveAsNew()`: there is no separate fork operation, and the new Campaign save keeps the Campaign ID and receives a
new Campaign save ID.

Neither operation ever writes to an Autosave.

# Loading

A successful `session.saves.load(save)` atomically:

- restores the Campaign state, Timeline, and Autopilot memory held by the Campaign save;
- selects that Campaign as the Current campaign and that Campaign save as the Current save;
- leaves no active Autopilot engagement and Dev mode disabled, under
  [Campaign selection](campaign-lifecycle.md#campaign-selection) in Campaign Lifecycle.

Loading an Autosave differs in one respect: the Current campaign then has no Current save, so a later `save()`
creates a new Campaign save and leaves the Autosave unchanged.

Play continued after a load produces the outcomes of uninterrupted play, under
[Determinism](determinism-and-randomness.md#determinism). An Autopilot engagement that was active when the Campaign was saved is
not resumed.

# Autosaves

An Autosave is a Campaign save and holds what every Campaign save holds, under
[Campaign save contents](#campaign-save-contents). It belongs to the Campaign it was written from. Only the engine
writes, replaces, or removes an Autosave; the Session controller can load one with `session.saves.load(save)`.

The following list of the Autosaves this document defines is complete.

| Autosave            | Written                                                                                                        | Holds                                                        | Kept                                                            |
| ------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------- |
| Current Autosave    | When a Campaign is created or loaded, and whenever what a Campaign save holds changes for the Current campaign | The current Committed state of the Current campaign          | One for each Campaign                                           |
| Turn-end Autosave   | When an Advance turn commits outside an Autopilot engagement                                                   | The Turn-end state of the Turn that Advance turn ends        | One for each of the most recent Turns, up to the Autosave limit |
| Engagement Autosave | When Autopilot is engaged                                                                                      | The Committed state in which the Autopilot engagement begins | One for each Campaign                                           |

Timeline defines one further Autosave, the Return Autosave, and removes Autosaves of play the player has abandoned,
under [Autosave navigation](timeline.md#autosave-navigation).

The following rules are complete.

- **The Current Autosave is always current:** The engine replaces the Current Autosave whenever the Campaign state,
  the Timeline, or the Autopilot memory of the Current campaign changes, whichever operation changes it; e.g., a
  Player action of the Session controller, each Player action of an Autopilot AI, an undo, or a load. Loading
  the Current Autosave therefore resumes the Campaign exactly where the Session that wrote it left it, e.g. after
  the player quit without saving or the application stopped unexpectedly.
- **The Current Autosave cannot be turned off:** No setting disables the Current Autosave, and it does not count
  toward the Autosave limit.
- **Autosave limit:** The Autosave limit is a whole number of at least 0, and its Game build default is 5. Writing a
  Turn-end Autosave that brings the Campaign above the Autosave limit removes the Turn-end Autosave of the earliest
  Turn. With an Autosave limit of 0, no Turn-end Autosave is written. The Autosave limit counts only Turn-end
  Autosaves.
- **One Turn-end Autosave for each Turn:** A Turn-end Autosave written for a Turn that already has one replaces it.
- **Autopilot engagements:** No Turn-end Autosave is written during an Autopilot engagement, however many Advance turn
  actions the Autopilot AI commits. Engaging Autopilot replaces the Engagement Autosave. This holds for every
  Autopilot engagement, including one that advances no turn and a second one in the same Turn. The Current Autosave
  is replaced during an Autopilot engagement as at any other time.

# Listing Campaign saves

`session.saves.list()` reports every Campaign save in Game storage, of every Campaign, including every
Autosave. It needs no Current campaign, so a Session can list Campaign saves before loading one; e.g., a user interface's
Main menu lists them for the player to choose from. For each Campaign save it reports at least:

- its Campaign save ID and its Campaign ID, so the Campaign saves of one Campaign can be grouped;
- whether it is an Autosave, and of which kind;
- the Turn its saved Committed state belongs to;
- whether it is the Current save.

The Campaign save ID it reports is what `session.saves.load(save)` accepts. Listing changes nothing and is not a
Player action. It does not verify that a Campaign save can be loaded: a listed Campaign save may still fail to
load, under [Edge cases and failure behavior](#edge-cases-and-failure-behavior). The exact form of an entry is
the implementer's choice and follows the [Information boundary](engine-contract.md#information-boundary).

# Save size limit

The Save size limit is 100 MiB. It is a safety measure against unbounded storage use, not a gameplay rule.

If a Campaign save would exceed the Save size limit, the save operation fails: no Campaign save is written or
changed, the Current save is unchanged, and the Session keeps its Current campaign and Timeline. World history, being
Campaign state, is never omitted to reduce the size of a Campaign save.

# Game build compatibility

Backward compatibility and migration of Campaign saves across Game builds are not required. A Game build may reject
a Campaign save written by a different Game build.

# Edge cases and failure behavior

A load that fails leaves the entire prior Session unchanged, including its Current campaign and Current save, under
[Committed state integrity](engine-contract.md#committed-state-integrity). A save that fails writes and changes no
Campaign save.

A failed load or save reports the failure to the Session controller, with exactly one reason and a message that
names the Campaign save concerned. The following list of reasons is complete.

| Operation | Reason                   | When it applies                                                                                    |
| --------- | ------------------------ | -------------------------------------------------------------------------------------------------- |
| Load      | Incompatible Game build  | The Campaign save is rejected under [Game build compatibility](#game-build-compatibility).         |
| Load      | Corrupt Campaign save    | The Campaign save can be read but its contents are not a valid Campaign save.                      |
| Load      | Unreadable Campaign save | The Campaign save cannot be read, e.g. it no longer exists or Game storage is unavailable.         |
| Save      | Save size limit exceeded | The Campaign save would exceed the Save size limit.                                                |
| Save      | Unwritable Campaign save | The Campaign save cannot be written, e.g. Game storage is full, unavailable, or refuses the write. |

A failed operation is not retried automatically, and it is not an engine defect. An interface shows the reason and
message and takes no further action; e.g., a user interface shows an error message and stays on the screen
the load or save was requested from. The message follows the
[Information boundary](engine-contract.md#information-boundary).

An Autosave fails to be written for the same reasons as a save. The operation that causes a Current Autosave, a
Turn-end Autosave, or an Engagement Autosave still completes, and its result reports the Save reason. That Autosave
is then missing, and an existing Autosave it would have replaced is removed; e.g., a Current Autosave that cannot be
replaced is removed rather than left holding an earlier Committed state.

# Acceptance examples

- **Save and load:** Create Campaign A, save after a gameplay action before Advance turn, then create Campaign B.
  Load the Campaign save of Campaign A and obtain the exact saved Campaign state with Dev mode disabled and no active
  Autopilot engagement. Loading a corrupt Campaign save reports the reason Corrupt Campaign save and leaves the
  Current campaign unchanged ([Saving](#saving), [Loading](#loading),
  [Edge cases and failure behavior](#edge-cases-and-failure-behavior)).
- **Keeping a line of play by saving as new:** Load Campaign save S1 and commit three actions. `saveAsNew()` creates
  S2 and makes it the Current save. Commit another action, then `save()`. S2 holds all four actions; S1 still holds
  the original Campaign state. Both have the same Campaign ID ([Saving](#saving)).
- **Campaign configuration isolation:** Save Campaign A, then load a Campaign save of Campaign B with different
  Campaign configuration. The saved values of B apply. Loading the Campaign save of A restores the saved values of A
  ([Loading](#loading)).
- **Listing before loading:** Create Campaign A, `save()`, Advance turn, and `saveAsNew()`. End the Session and start
  a new one. With no Current campaign, `session.saves.list()` reports both Campaign saves with the same Campaign ID and their
  two Turns, together with the Autosaves of Campaign A, and none is the Current save. Load one of them, and
  `session.saves.list()` reports it as the Current save ([Listing Campaign saves](#listing-campaign-saves)).
- **Resuming without saving:** Create a Campaign, commit two actions, Advance turn, and commit one action, never
  calling `save()`. End the Session and start a new one. Loading the Current Autosave of that Campaign restores the
  Campaign state after the last action, and the Current campaign then has no Current save
  ([Autosaves](#autosaves), [Loading](#loading)).
- **The Current Autosave follows every change:** Commit an action, then engage Autopilot with `singleAction`. After
  each of the two Player actions the Current Autosave holds the Committed state just reached. The Campaign has one
  Current Autosave throughout ([Autosaves](#autosaves)).
- **Autosave limit:** With the Autosave limit 5, Advance turn seven times from Turn 1. The Campaign has the Turn-end
  Autosaves of Turn 3 to Turn 7 ([Autosaves](#autosaves)).
- **One Autopilot engagement, one Engagement Autosave:** Play Turn 1 to Turn 4, then in Turn 5 engage Autopilot with
  `turnAdvancements` and count 30. After disengagement the Campaign has the Turn-end Autosaves of Turn 1 to Turn 4,
  the Engagement Autosave in Turn 5, the Current Autosave in Turn 35, and no Turn-end Autosave of Turn 5 to Turn 34
  ([Autosaves](#autosaves)).
- **A second Autopilot engagement replaces the Engagement Autosave:** In one Turn, engage Autopilot with
  `singleAction` twice. After the second disengagement the Campaign has one Engagement Autosave, of the second
  Autopilot engagement ([Autosaves](#autosaves)).
- **Autosave limit 0:** With the Autosave limit 0, commit two actions and Advance turn. No Turn-end Autosave is
  written, and the Current Autosave holds the Committed state after Advance turn ([Autosaves](#autosaves)).
- **Too large:** Save a Campaign whose Campaign save would exceed 100 MiB. The save fails, every existing Campaign
  save is unchanged, and the Session keeps its Current campaign ([Save size limit](#save-size-limit)).
