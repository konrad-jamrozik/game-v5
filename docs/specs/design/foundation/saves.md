# Saves

| Metadata | Value |
| --- | --- |
| Spec ID | SAVES |
| Family | Foundation |
| Audience | Engine designer, UI designer, Implementer |
| Owns | Campaign save contents, saving, loading, Autosaves, deleting Campaign saves, the Save size limit, and Game build compatibility. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

A [Campaign](core-concepts.md#campaign-and-session) outlives the [Session](core-concepts.md#campaign-and-session) it is played in only through its [Campaign saves](engine-contract.md#persisted-data). A Campaign save is a persisted copy of one Campaign at one [Committed state](engine-contract.md#player-actions-and-turns), together with its [Timeline](engine-contract.md#persisted-data) and [Autopilot memory](engine-contract.md#persisted-data), as the [Engine Contract](engine-contract.md) defines it. Loading it lets play continue exactly as if it had never stopped.

Campaign saves come from two sources. The [Session controller](engine-contract.md#principals-and-access) saves on request; saving at a Committed state that one of its Campaign saves of that Campaign already holds replaces that Campaign save instead of adding another. The engine writes Autosaves by itself, so that play can resume even after the game stops unexpectedly, and so that undo can reach back across recent [Turns](engine-contract.md#player-actions-and-turns). Every Campaign save is bounded by the Save size limit, and a [Game build](core-concepts.md#game-build-and-content) may reject a Campaign save written by a different Game build. The Session controller deletes the Campaign saves it no longer wants, one at a time or a whole Campaign at once, e.g. those that a different Game build wrote and that can no longer be loaded.

# Glossary

General terms are in the [Engine Contract glossary](engine-contract.md#glossary). The [Independent identifier](determinism-and-randomness.md#glossary) is in the [Determinism and Randomness glossary](determinism-and-randomness.md#glossary).

## Identifiers

The identifiers of [Campaigns](core-concepts.md#campaign-and-session) and their [Campaign saves](engine-contract.md#persisted-data).

| Term | Definition |
| --- | --- |
| Campaign ID | The Independent identifier identifying one Campaign, assigned when the Campaign is created and shared by every Campaign save of that Campaign. It is not [Campaign state](core-concepts.md#campaign-and-session), and game behavior never consults it. |
| Campaign save ID | The Independent identifier identifying one Campaign save, assigned when that Campaign save is created. |

## Autosave kinds

The Campaign saves the engine writes itself.

| Term | Definition |
| --- | --- |
| Autosave | A Campaign save that the engine writes without a save request from the [Session controller](engine-contract.md#principals-and-access), under [Autosaves](#autosaves). |
| Current Autosave | The Autosave holding the [Committed state](engine-contract.md#player-actions-and-turns) the Campaign is at now, kept up to date at all times so that play can resume after the [Session](core-concepts.md#campaign-and-session) ends for whatever reason. |
| Turn-end Autosave | The Autosave holding the [Turn-end state](engine-contract.md#player-actions-and-turns) of one [Turn](engine-contract.md#player-actions-and-turns), written when the player ends the Turn. |
| Engagement Autosave | The Autosave holding the Committed state in which the most recent [Autopilot engagement](engine-contract.md#autopilot) began. |
| Disengagement Autosave | The Autosave holding the Committed state in which the most recent Autopilot engagement ended. |

## Limits

The bounds on Campaign saves.

| Term | Definition |
| --- | --- |
| Save size limit | The maximum size of one Campaign save, fixed by the [Game build](core-concepts.md#game-build-and-content). |
| Autosave limit | The number of Turns whose Turn-end Autosave is kept for one Campaign. It is a setting in [Global configuration](engine-contract.md#persisted-data). |

# Campaign save contents

A Campaign save holds, as shown under [Data ownership](engine-contract.md#data-ownership):

- its Campaign save ID and the Campaign ID of its Campaign;
- the Campaign state at the saved Committed state;
- the [Timeline](engine-contract.md#persisted-data) as it is at that Committed state, which is the Timeline of the Turn that Committed state belongs to;
- the [Autopilot memory](engine-contract.md#persisted-data) of the Campaign;
- the time it was last written, which is not Campaign state, so gameplay never consults it.

A Campaign save holds nothing a Session holds and no Global configuration. It holds no Timeline of an earlier Turn. How a Campaign save is encoded and stored is the Implementer's choice.

One Campaign may have several Campaign saves, which share its Campaign ID and have distinct Campaign save IDs. E.g., a player may keep a Campaign save from before a risky decision and another from after it. Two Campaigns created with equal creation inputs, including the same [Campaign seed](determinism-and-randomness.md#campaign-seed), and given equal [Player actions](engine-contract.md#player-actions-and-turns) have equal Campaign state but distinct Campaign IDs. Because the [Campaign seed](determinism-and-randomness.md#glossary) is Campaign state, under [Campaign seed](determinism-and-randomness.md#campaign-seed), every Campaign save holds it.

# Saving

Saving captures the [Current campaign](core-concepts.md#campaign-and-session) at its current Committed state. It is available at every Committed state, including before the player ends the Turn, and it is not a Player action.

`session.saves.save()` is the one operation that saves on request. It writes a new Campaign save of the Current campaign at its current Committed state, with its Timeline and Autopilot memory, and reports its Campaign save ID.

When a Campaign save of the same Campaign that `save()` wrote earlier holds a Committed state equal to the current one, i.e. every [Authoritative value](core-concepts.md#value-classification) of the two Campaign states is equal, which makes every [Derived value](core-concepts.md#value-classification) equal too, `save()` instead replaces that Campaign save's Timeline and Autopilot memory with the current ones, keeps its Campaign save ID, and reports it. E.g., saving twice with no Player action in between leaves one Campaign save, and so does saving again after undoing and redoing back to a saved Committed state.

`save()` never writes to or replaces an Autosave. Saving after play has moved to a Committed state no Campaign save holds therefore never changes an earlier Campaign save, so every earlier line of play stays intact without a separate operation.

# Loading

A successful `session.saves.load(save)` atomically:

- restores the Campaign state, Timeline, and Autopilot memory held by the Campaign save;
- selects that Campaign as the Current campaign;
- leaves no active Autopilot engagement and [Dev mode](engine-contract.md#principals-and-access) disabled, under [Campaign selection](campaign-lifecycle.md#campaign-selection) in Campaign Lifecycle.

Play continued after a load produces the outcomes of uninterrupted play, under [Determinism](determinism-and-randomness.md#determinism). An Autopilot engagement that was active when the Campaign was saved is not resumed.

# Autosaves

An Autosave is a Campaign save and holds what every Campaign save holds, under [Campaign save contents](#campaign-save-contents). It belongs to the Campaign it was written from. Only the engine writes or replaces an Autosave; the Session controller can load one with `session.saves.load(save)` and delete one under [Deleting Campaign saves](#deleting-campaign-saves).

The following list of Autosaves is complete.

| Autosave | Written | Holds | Kept |
| --- | --- | --- | --- |
| Current Autosave | When a Campaign is created or loaded, and whenever what a Campaign save holds changes for the Current campaign | The current Committed state of the Current campaign | One for each Campaign |
| Turn-end Autosave | When an Advance turn commits outside an Autopilot engagement | The Turn-end state of the Turn that Advance turn ends | One for each of the most recent Turns, up to the Autosave limit |
| Engagement Autosave | When [Autopilot](engine-contract.md#autopilot) is engaged | The Committed state in which the Autopilot engagement begins | One for each Campaign |
| Disengagement Autosave | When an Autopilot engagement ends, whatever ends it | The Committed state in which the Autopilot engagement ended | One for each Campaign |

[Timeline](timeline.md) states one further Autosave, and when Autosaves of abandoned play are removed.

The following rules are complete.

- **The Current Autosave is always current:** The engine replaces the Current Autosave whenever the Campaign state, the Timeline, or the Autopilot memory of the Current campaign changes, whichever operation changes it; e.g., a Player action of the Session controller, each Player action of an [Autopilot AI](engine-contract.md#principals-and-access), an undo, or a load. Loading the Current Autosave therefore resumes the Campaign exactly where the Session that wrote it left it, e.g. after the player quit without saving or the application stopped unexpectedly.
- **The Current Autosave cannot be turned off:** No setting disables the Current Autosave, and it does not count toward the Autosave limit.
- **Autosave limit:** The Autosave limit is a whole number of at least 0, and its [Game build default](engine-contract.md#persisted-data) is 5. Writing a Turn-end Autosave that brings the Campaign above the Autosave limit removes the Turn-end Autosave of the earliest Turn. With an Autosave limit of 0, no Turn-end Autosave is written. The Autosave limit counts only Turn-end Autosaves.
- **One Turn-end Autosave for each Turn:** A Turn-end Autosave written for a Turn that already has one replaces it.
- **Autopilot engagements:** No Turn-end Autosave is written during an Autopilot engagement, however many Advance turn actions the [Autopilot AI](engine-contract.md#principals-and-access) commits. Engaging Autopilot replaces the Engagement Autosave, and completing disengagement replaces the Disengagement Autosave. This holds for every Autopilot engagement, including one that ends no Turn and a second one in the same Turn. The Current Autosave is replaced during an Autopilot engagement as at any other time.

# Listing Campaign saves

`session.saves.list()` reports every Campaign save in [Game storage](engine-contract.md#persisted-data), of every Campaign, including every Autosave. It needs no Current campaign, so a Session can list Campaign saves before loading one; e.g., a user interface's [Main menu](campaign-lifecycle.md#glossary) lists them for the player to choose from. For each Campaign save it reports at least:

- its Campaign save ID and its Campaign ID, so the Campaign saves of one Campaign can be grouped;
- whether it is an Autosave, and of which kind;
- the Turn its saved Committed state belongs to;
- the number of Player actions that lead from the start of that Turn to its saved Committed state, not counting Advance turn or any action that was undone; e.g., 0 when no Player action has been committed in that Turn yet;
- the time it was last written, so that a user interface can tell which Campaign save is the most recent.

The Campaign save ID it reports is what `session.saves.load(save)` accepts. Listing changes nothing and is not a Player action. It does not verify that a Campaign save can be loaded: a listed Campaign save may still fail to load, under [Edge cases and failure behavior](#edge-cases-and-failure-behavior). The exact form of an entry is the Implementer's choice and follows the [Information boundary](player-api.md#information-boundary).

# Deleting Campaign saves

Deleting removes Campaign saves from Game storage for good. It is how the player discards a line of play, a Campaign they no longer want, or a Campaign save that can no longer be loaded. The following two operations are the complete set that delete Campaign saves at the Session controller's request:

- `session.saves.delete(save)` deletes the one Campaign save with that Campaign save ID, whatever its kind, including an Autosave of any kind.
- `session.saves.deleteCampaign(campaign)` deletes every Campaign save whose Campaign ID is `campaign`, including every Autosave of that Campaign. Afterwards `session.saves.list()` reports no Campaign save of that Campaign.

The following rules are complete.

- **Not the Current campaign:** A request to delete a Campaign save of the Current campaign, or to delete the Current campaign, fails and deletes nothing. The player closes the Campaign first, under [Campaign selection](campaign-lifecycle.md#campaign-selection), so the Current Autosave of a Campaign being played is never removed by a request.
- **Any Campaign save that is listed:** Every Campaign save that `session.saves.list()` reports can be deleted, including one that fails to load, e.g. one rejected under [Game build compatibility](#game-build-compatibility).
- **Permanent:** A deleted Campaign save cannot be restored. Deleting is not a Player action and is not recorded in any Timeline.
- **Nothing else changes:** Deleting changes no other Campaign save, no Global configuration, and nothing of the Session, apart from what `session.saves.list()` reports afterwards.

# Save size limit

The Save size limit is 100 MiB. It is a safety measure against unbounded storage use, not a gameplay rule.

If a Campaign save would exceed the Save size limit, the save operation fails: no Campaign save is written or changed, and the Session keeps its Current campaign and Timeline. [World history](campaign-state.md#glossary), being Campaign state, is never omitted to reduce the size of a Campaign save.

# Game build compatibility

Backward compatibility and migration of Campaign saves across Game builds are not required. A Game build may reject a Campaign save written by a different Game build.

# Edge cases and failure behavior

A load that fails leaves the entire prior Session unchanged, including its Current campaign, under [Committed state integrity](engine-contract.md#committed-state-integrity). A save that fails writes and changes no Campaign save. A delete that fails deletes no Campaign save.

A failed load, save, or delete reports the failure to the Session controller, with exactly one reason and a message that names the Campaign save or the Campaign concerned. The following list of reasons is complete.

| Operation | Reason | When it applies |
| --- | --- | --- |
| Load | Incompatible Game build | The Campaign save is rejected under [Game build compatibility](#game-build-compatibility). |
| Load | Corrupt Campaign save | The Campaign save can be read but its contents are not a valid Campaign save. |
| Load | Unreadable Campaign save | The Campaign save cannot be read, e.g. it no longer exists or Game storage is unavailable. |
| Save | Save size limit exceeded | The Campaign save would exceed the Save size limit. |
| Save | Unwritable Campaign save | The Campaign save cannot be written, e.g. Game storage is full, unavailable, or refuses the write. |
| Delete | Current campaign | The Campaign save, or the Campaign, belongs to the Current campaign, under [Deleting Campaign saves](#deleting-campaign-saves). |
| Delete | Unknown Campaign save | No Campaign save has that Campaign save ID, or no Campaign save has that Campaign ID. |
| Delete | Undeletable Campaign save | Game storage cannot delete the Campaign save, e.g. it is unavailable or refuses the deletion. |

A failed operation is not retried automatically, and it is not an engine defect. An interface shows the reason and message and takes no further action; e.g., a user interface shows an error message and stays on the screen the load or save was requested from. The message follows the [Information boundary](player-api.md#information-boundary).

An Autosave fails to be written for the same reasons as a save. The operation that causes a Current Autosave, a Turn-end Autosave, an Engagement Autosave, or a Disengagement Autosave still completes, and its result reports the Save reason. That Autosave is then missing, and an existing Autosave it would have replaced is removed; e.g., a Current Autosave that cannot be replaced is removed rather than left holding an earlier Committed state.

# Acceptance examples

- **Save and load:** Create Campaign A, save after a gameplay action before Advance turn, then create Campaign B. Load the Campaign save of Campaign A and obtain the exact saved Campaign state with Dev mode disabled and no active Autopilot engagement. Loading a corrupt Campaign save reports the reason Corrupt Campaign save and leaves the Current campaign unchanged ([Saving](#saving), [Loading](#loading), [Edge cases and failure behavior](#edge-cases-and-failure-behavior)).
- **Saving again replaces an equal Campaign save:** In one Turn, commit action A and save, creating S1. Commit action B and save, creating S2. Undo B and save: the Committed state equals S1's, so S1 is replaced and now holds B as an Undone action. Redo B and save: the Committed state equals S2's, so S2 is replaced. The Campaign has two Campaign saves of its own, S1 and S2, with the same Campaign ID ([Saving](#saving)).
- **Keeping a line of play:** Load Campaign save S1 and commit three actions, then save, creating S2. S1 still holds its original Campaign state ([Saving](#saving)).
- **[Campaign configuration](campaign-state.md#glossary) isolation:** Save Campaign A, then load a Campaign save of Campaign B with different Campaign configuration. The saved values of B apply. Loading the Campaign save of A restores the saved values of A ([Loading](#loading)).
- **Listing before loading:** Create Campaign A, `save()`, Advance turn, and `save()` again. End the Session and start a new one. With no Current campaign, `session.saves.list()` reports both Campaign saves with the same Campaign ID and their two Turns, together with the Autosaves of Campaign A ([Listing Campaign saves](#listing-campaign-saves)).
- **Resuming without saving:** Create a Campaign, commit two actions, Advance turn, and commit one action, never calling `save()`. End the Session and start a new one. Loading the Current Autosave of that Campaign restores the Campaign state after the last action ([Autosaves](#autosaves), [Loading](#loading)).
- **The Current Autosave follows every change:** Commit an action, then engage Autopilot with `singleAction`. After each of the two Player actions the Current Autosave holds the Committed state just reached. The Campaign has one Current Autosave throughout ([Autosaves](#autosaves)).
- **Autosave limit:** With the Autosave limit 5, Advance turn seven times from Turn 1. The Campaign has the Turn-end Autosaves of Turn 3 to Turn 7 ([Autosaves](#autosaves)).
- **One Autopilot engagement, one Engagement Autosave:** Play Turn 1 to Turn 4, then in Turn 5 engage Autopilot with `turnAdvancements` and count 30. After disengagement the Campaign has the Turn-end Autosaves of Turn 1 to Turn 4, the Engagement Autosave in Turn 5, the Disengagement Autosave and the Current Autosave in Turn 35, and no Turn-end Autosave of Turn 5 to Turn 34 ([Autosaves](#autosaves)).
- **A second Autopilot engagement replaces the Engagement Autosave:** In one Turn, engage Autopilot with `singleAction` twice. After the second disengagement the Campaign has one Engagement Autosave and one Disengagement Autosave, both of the second Autopilot engagement ([Autosaves](#autosaves)).
- **Autosave limit 0:** With the Autosave limit 0, commit two actions and Advance turn. No Turn-end Autosave is written, and the Current Autosave holds the Committed state after Advance turn ([Autosaves](#autosaves)).
- **Deleting a Campaign save and a Campaign:** Create Campaign A, `save()`, Advance turn, and `save()` again, then close it. `session.saves.delete(save)` with the first Campaign save deletes it; `session.saves.list()` still reports the second and the Autosaves of Campaign A. `session.saves.deleteCampaign(campaign)` with the Campaign ID of A then deletes all of them, and `session.saves.list()` reports no Campaign save of Campaign A ([Deleting Campaign saves](#deleting-campaign-saves)).
- **Deleting while playing:** Load a Campaign save of Campaign A. Deleting any Campaign save of Campaign A, or Campaign A itself, fails with the reason Current campaign and deletes nothing. Deleting a Campaign save of another Campaign succeeds ([Deleting Campaign saves](#deleting-campaign-saves)).
- **Too large:** Save a Campaign whose Campaign save would exceed 100 MiB. The save fails, every existing Campaign save is unchanged, and the Session keeps its Current campaign ([Save size limit](#save-size-limit)).
