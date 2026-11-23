# Saves

| Metadata | Value |
| --- | --- |
| Spec ID | SAVES |
| Family | Foundation |
| Audience | Engine designer, UI designer, Implementer |
| Owns | Campaign save contents, saving, loading, Autosaves, deleting Campaign saves, the Save size limit, and Game build compatibility. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

A [Campaign](core-concepts.md#campaign-and-session) outlives the [Session](core-concepts.md#campaign-and-session) it is played in only through its [Campaign saves](engine-contract.md#persisted-data). A Campaign save is a persisted copy of one Campaign's [Campaign state](core-concepts.md#campaign-and-session), with its [Timeline](engine-contract.md#persisted-data) and its [Current world state](engine-contract.md#player-actions-and-turns), as the [Engine Contract](engine-contract.md) defines it. Loading it lets play continue exactly as if it had never stopped.

Campaign saves come from two sources. The [Session controller](engine-contract.md#principals-and-access) saves on request; saving at a World state that one of its Campaign saves of that Campaign already holds replaces that Campaign save instead of adding another. The engine writes Autosaves by itself, so that play can resume even after the game stops unexpectedly, and so that undo can reach back across recent [Turns](engine-contract.md#player-actions-and-turns). Every Campaign save is bounded by the Save size limit, and a [Game build](core-concepts.md#game-build-and-content) may reject a Campaign save written by a different Game build. The Session controller deletes the Campaign saves it no longer wants, one at a time or a whole Campaign at once, e.g. those that a different Game build wrote and that can no longer be loaded.

# Glossary

## Identifiers

The identifiers of [Campaigns](core-concepts.md#campaign-and-session) and their [Campaign saves](engine-contract.md#persisted-data).

| Term | Definition |
| --- | --- |
| Campaign ID | The [Independent identifier](determinism-and-randomness.md#glossary) identifying one Campaign, assigned when the Campaign is created and shared by every Campaign save of that Campaign. It is not [Campaign state](core-concepts.md#campaign-and-session), and the [Game rules](core-concepts.md#game-build-and-content) never read it. |
| Campaign save ID | The Independent identifier identifying one Campaign save, assigned when that Campaign save is created. |

## Autosave kinds

The Campaign saves the engine writes itself.

| Term | Definition |
| --- | --- |
| Autosave | A Campaign save that the engine writes without a save request from the [Session controller](engine-contract.md#principals-and-access), under [Autosaves](#autosaves). |
| Current Autosave | The Autosave holding the Campaign state the Campaign has now, with the [World state](engine-contract.md#player-actions-and-turns) it is at, kept up to date at all times so that play can resume after the [Session](core-concepts.md#campaign-and-session) ends for whatever reason. |
| Turn-end Autosave | The Autosave holding the [Turn-end state](engine-contract.md#player-actions-and-turns) of one [Turn](engine-contract.md#player-actions-and-turns), written when the player ends the Turn. |
| Autopilot Autosave | The Autosave holding the Turn-end state of one Turn that an [Autopilot AI](engine-contract.md#principals-and-access) ended during an [Autopilot engagement](engine-contract.md#autopilot). |
| Engagement Autosave | The Autosave holding the World state in which the most recent [Autopilot engagement](engine-contract.md#autopilot) began. |
| Disengagement Autosave | The Autosave holding the World state in which the most recent Autopilot engagement ended. |

## Limits

The bounds on Campaign saves.

| Term | Definition |
| --- | --- |
| Save size limit | The maximum size of one Campaign save, fixed by the [Game build](core-concepts.md#game-build-and-content). |
| Autosave limit | The number of Turns whose Turn-end Autosave is kept for one Campaign. It is a setting in [Global configuration](engine-contract.md#persisted-data). |
| Autopilot Autosave limit | The number of Turns whose Autopilot Autosave is kept for one Campaign. It is a setting in Global configuration. |

# Campaign save contents

A Campaign save holds, as shown under [Data ownership](engine-contract.md#data-ownership):

- its Campaign save ID and the Campaign ID of its Campaign;
- the Campaign state of the Campaign as it was when the Campaign save was written, whole, under [Campaign state composition](campaign-state.md#campaign-state-composition) in Campaign State; its saved World state is the [Current world state](engine-contract.md#player-actions-and-turns) of that Campaign state, the one its [Timeline pointer](engine-contract.md#persisted-data) is on, and its [Timeline](engine-contract.md#persisted-data) is that of the Turn the saved World state belongs to;
- the time it was last written, which is not Campaign state, so the Game rules never read it.

A Campaign save holds nothing else a Session holds, e.g. no Dev mode and no Autopilot engagement, and no Global configuration. It holds no Timeline of an earlier Turn. How a Campaign save is encoded and stored is the Implementer's choice.

One Campaign may have several Campaign saves, which share its Campaign ID and have distinct Campaign save IDs. E.g., a player may keep a Campaign save from before a risky decision and another from after it. Two Campaigns created with equal creation inputs, including the same [Campaign seed](determinism-and-randomness.md#campaign-seed), and given equal [Player actions](engine-contract.md#player-actions-and-turns) have equal Campaign state but distinct Campaign IDs. Because the [Campaign seed](determinism-and-randomness.md#glossary) is Campaign state, under [Campaign seed](determinism-and-randomness.md#campaign-seed), every Campaign save holds it.

# Saving

Saving captures the [Current campaign](core-concepts.md#campaign-and-session) at its Current world state. It is available at every World state, including before the player ends the Turn, and it is not a Player action.

`session.saves.save()` is the one operation that saves on request. It writes a new Campaign save holding the current Campaign state of the Current campaign, and reports its Campaign save ID.

When a Campaign save of the same Campaign that `save()` wrote earlier holds an equal place in play, `save()` instead replaces that Campaign save's Campaign state with the current one, keeps its Campaign save ID, and reports it. A Campaign save holds an equal place in play when its saved World state, its [History](campaign-state.md#glossary), and its [Turn report](campaign-state.md#glossary) are equal to the current ones, i.e. every [Authoritative value](core-concepts.md#value-classification) of each is equal, which makes every [Derived value](core-concepts.md#value-classification) equal too. The two Campaign states can then differ only in the rest of their Timelines, e.g. in their Undone actions, and in their [Campaign configuration](campaign-state.md#glossary), and the replacement takes the current ones. E.g., saving twice with no Player action in between leaves one Campaign save, and so does saving again after undoing and redoing back to a saved World state.

`save()` never writes to or replaces an Autosave. Saving after play has moved to a World state no Campaign save holds therefore never changes an earlier Campaign save, so every earlier line of play stays intact without a separate operation.

# Loading

A successful `session.saves.load(save)` atomically:

- makes the Campaign state held by the Campaign save current, whole, including its [Campaign configuration](campaign-state.md#glossary), whatever the Campaign configuration of the Campaign that was current before; [Autosave navigation](timeline.md#autosave-navigation) in Timeline states the one exception;
- selects that Campaign as the Current campaign;
- leaves no active Autopilot engagement and [Dev mode](engine-contract.md#principals-and-access) disabled, under [Campaign selection](campaign-lifecycle.md#campaign-selection) in Campaign Lifecycle.

Play continued after a load produces the outcomes of uninterrupted play, under [Determinism](determinism-and-randomness.md#determinism). An Autopilot engagement that was active when the Campaign was saved is not resumed.

# Autosaves

An Autosave is a Campaign save and holds what every Campaign save holds, under [Campaign save contents](#campaign-save-contents). It belongs to the Campaign it was written from. Only the engine writes or replaces an Autosave; the Session controller can load one with `session.saves.load(save)` and delete one under [Deleting Campaign saves](#deleting-campaign-saves).

The following list of Autosaves is complete.

| Autosave | Written | Holds | Kept |
| --- | --- | --- | --- |
| Current Autosave | When a Campaign is created or loaded, and whenever the Campaign state of the Current campaign changes | The current Campaign state of the Current campaign | One for each Campaign |
| Turn-end Autosave | When an Advance turn commits outside an Autopilot engagement | The Turn-end state of the Turn that Advance turn ends | One for each of the most recent Turns, up to the Autosave limit |
| Autopilot Autosave | When an Advance turn commits during an Autopilot engagement | The Turn-end state of the Turn that Advance turn ends | One for each of the most recent Turns, up to the Autopilot Autosave limit |
| Engagement Autosave | When [Autopilot](engine-contract.md#autopilot) is engaged | The World state in which the Autopilot engagement begins | One for each Campaign |
| Disengagement Autosave | When an Autopilot engagement ends, whatever ends it | The World state in which the Autopilot engagement ended | One for each Campaign |

[Timeline](timeline.md) states one further Autosave, and when Autosaves of abandoned play are removed.

The following rules are complete.

- **The Current Autosave is always current:** The engine replaces the Current Autosave whenever the Campaign state of the Current campaign changes, whichever operation changes it; e.g., a Player action of the Session controller, each Player action of an [Autopilot AI](engine-contract.md#principals-and-access), an undo, a load, or a change of Campaign configuration. Loading the Current Autosave therefore resumes the Campaign exactly where the Session that wrote it left it, e.g. after the player quit without saving or the application stopped unexpectedly.
- **The Current Autosave cannot be turned off:** No setting disables the Current Autosave, and it counts toward neither the Autosave limit nor the Autopilot Autosave limit.
- **Autosave limit:** The Autosave limit is a whole number of at least 0, and its [Game build default](engine-contract.md#persisted-data) is 5. Writing a Turn-end Autosave that brings the Campaign above the Autosave limit removes the Turn-end Autosave of the earliest Turn. With an Autosave limit of 0, no Turn-end Autosave is written. The Autosave limit counts only Turn-end Autosaves.
- **Autopilot Autosave limit:** The Autopilot Autosave limit is a whole number of at least 0, and its Game build default is 5. Writing an Autopilot Autosave that brings the Campaign above the Autopilot Autosave limit removes the Autopilot Autosave of the earliest Turn, so a long Autopilot engagement leaves the Autopilot Autosaves of the last Turns it ended. With an Autopilot Autosave limit of 0, no Autopilot Autosave is written. The Autopilot Autosave limit counts only Autopilot Autosaves.
- **One Autosave for each Turn end:** A Turn-end Autosave or an Autopilot Autosave written for a Turn that already has either replaces it.
- **Autopilot engagements:** No Turn-end Autosave is written during an Autopilot engagement, however many Advance turn actions the Autopilot AI commits; each Turn it ends gets an Autopilot Autosave instead, so the Turns played by an Autopilot AI never displace those the player played. Engaging Autopilot replaces the Engagement Autosave, and completing disengagement replaces the Disengagement Autosave. This holds for every Autopilot engagement, including one that ends no Turn, one that commits no Player action, and a second one in the same Turn. The Current Autosave is replaced during an Autopilot engagement as at any other time.

# Listing Campaign saves

`session.saves.list()` reports every Campaign save in [Game storage](engine-contract.md#persisted-data), of every Campaign, including every Autosave. It needs no Current campaign, so a Session can list Campaign saves before loading one; e.g., a user interface's [Main menu](campaign-lifecycle.md#glossary) lists them for the player to choose from. For each Campaign save it reports at least:

- its Campaign save ID and its Campaign ID, so the Campaign saves of one Campaign can be grouped;
- whether it is an Autosave, and of which kind;
- the Turn its saved World state belongs to;
- the number of Player actions that lead from the start of that Turn to its saved World state, not counting Advance turn or any action that was undone; e.g., 0 when no Player action has been committed in that Turn yet;
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

If a Campaign save would exceed the Save size limit, the save operation fails: no Campaign save is written or changed, and the Session keeps its Current campaign unchanged. No part of Campaign state, e.g. the History or the Timeline, is ever omitted to reduce the size of a Campaign save.

# Game build compatibility

Backward compatibility and migration of Campaign saves across Game builds are not required. A Game build may reject a Campaign save written by a different Game build.

# Edge cases and failure behavior

A load that fails leaves the entire prior Session unchanged, including its Current campaign, under [World state integrity](engine-contract.md#world-state-integrity). A save that fails writes and changes no Campaign save. A delete that fails deletes no Campaign save.

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

An Autosave fails to be written for the same reasons as a save. The operation that causes a Current Autosave, a Turn-end Autosave, an Autopilot Autosave, an Engagement Autosave, or a Disengagement Autosave still completes, and its result reports the Save reason. That Autosave is then missing, and an existing Autosave it would have replaced is removed; e.g., a Current Autosave that cannot be replaced is removed rather than left holding an earlier World state.
