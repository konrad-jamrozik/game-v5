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
| Autosave | A Campaign save that the engine [writes](#autosaves) without a save request from the [Session controller](engine-contract.md#principals-and-access). |
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

A Campaign save holds everything needed to continue its Campaign from one World state, and nothing of the Session that wrote it. Its [contents](engine-contract.md#data-ownership) are:

- its Campaign save ID and the Campaign ID of its Campaign;
- the Campaign state of the Campaign as it was when the Campaign save was written, [whole](campaign-state.md#campaign-state-composition); its saved World state is the [Current world state](engine-contract.md#player-actions-and-turns) of that Campaign state, the one its [Timeline pointer](engine-contract.md#persisted-data) is on, and its [Timeline](engine-contract.md#persisted-data) is that of the Turn the saved World state belongs to;
- the time it was last written, which is not Campaign state, so the Game rules never read it.

One Campaign may have several Campaign saves, which share its Campaign ID and have distinct Campaign save IDs. E.g., a player may keep a Campaign save from before a risky decision and another from after it. Two Campaigns created with equal creation inputs, including the same [Campaign seed](determinism-and-randomness.md#campaign-seed), and given equal [Player actions](engine-contract.md#player-actions-and-turns) have equal Campaign state but distinct Campaign IDs.

# Saving

Saving captures the [Current campaign](core-concepts.md#campaign-and-session) at its Current world state. It is available at every World state, including before the player ends the Turn, and it is not a Player action.

`session.saves.save()` is the one operation that saves on request. It writes a new Campaign save holding the current Campaign state of the Current campaign, and reports its Campaign save ID.

When a Campaign save of the same Campaign that `save()` wrote earlier holds an equal place in play, `save()` instead replaces that Campaign save's Campaign state with the current one, keeps its Campaign save ID, and reports it. A Campaign save holds an equal place in play when its saved World state, its [History](campaign-state.md#glossary), and its [Turn report](campaign-state.md#glossary) are equal to the current ones. The two Campaign states can then differ only in the rest of their Timelines, e.g. in their Undone actions, and in their [Campaign configuration](campaign-state.md#glossary), and the replacement takes the current ones. E.g., saving twice with no Player action in between leaves one Campaign save, and so does saving again after undoing and redoing back to a saved World state.

Saving after play has moved to a World state that no Campaign save written by `save()` holds never changes an earlier Campaign save, so every earlier line of play stays intact without a separate operation. A save that fails writes and changes no Campaign save.

# Loading

Loading replaces whatever the Session is playing with the Campaign that a Campaign save holds, at its saved World state. A successful `session.saves.load(save)` atomically:

- makes the Campaign state held by the Campaign save current, whole, including its [Campaign configuration](campaign-state.md#glossary), whatever the Campaign configuration of the Campaign that was current before, with [Autosave navigation](timeline.md#autosave-navigation) as the one exception;
- selects that Campaign as the Current campaign;
- leaves no active Autopilot engagement and [Dev mode](engine-contract.md#principals-and-access) disabled, as every [Campaign selection](campaign-lifecycle.md#campaign-selection) does.

A load, a save, or a delete that fails reports the failure to the Session controller, with exactly one reason and a message that names the Campaign save or the Campaign concerned. A failed operation is not retried automatically, and it is not an engine defect: an interface shows the reason and message and takes no further action. E.g., a user interface shows an error message and stays on the screen the load or save was requested from.

# Autosaves

An Autosave is a Campaign save and holds [what every Campaign save holds](#campaign-save-contents). It belongs to the Campaign it was written from. Only the engine writes or replaces an Autosave; the Session controller can load one with `session.saves.load(save)` and [delete](#deleting-campaign-saves) one.

| Autosave | Written | Holds | Kept |
| --- | --- | --- | --- |
| Current Autosave | When a Campaign is created or loaded, and whenever the Campaign state of the Current campaign changes | The current Campaign state of the Current campaign | One for each Campaign |
| Turn-end Autosave | When an Advance turn commits outside an Autopilot engagement | The Turn-end state of the Turn that Advance turn ends | One for each of the most recent Turns, up to the Autosave limit |
| Autopilot Autosave | When an Advance turn commits during an Autopilot engagement | The Turn-end state of the Turn that Advance turn ends | One for each of the most recent Turns, up to the Autopilot Autosave limit |
| Engagement Autosave | When [Autopilot](engine-contract.md#autopilot) is engaged | The World state in which the Autopilot engagement begins | One for each Campaign |
| Disengagement Autosave | When an Autopilot engagement ends, whatever ends it | The World state in which the Autopilot engagement ended | One for each Campaign |

One further Autosave, and the removal of the Autosaves of abandoned play, belong to [Autosave navigation](timeline.md#autosave-navigation).

- **The Current Autosave is always current:** The engine replaces the Current Autosave whichever operation changes the Campaign state of the Current campaign; e.g., each Player action of an [Autopilot AI](engine-contract.md#principals-and-access), an undo, or a change of Campaign configuration. No setting disables the Current Autosave, and it counts toward neither the Autosave limit nor the Autopilot Autosave limit.
- **Limits:** The Autosave limit and the Autopilot Autosave limit are each a whole number of at least 0, with a [Game build default](engine-contract.md#persisted-data) of 5, and each counts only the Autosaves of its own kind. Writing an Autosave that brings the Campaign above its limit removes the Autosave of that kind of the earliest Turn; e.g., a long Autopilot engagement leaves the Autopilot Autosaves of the last Turns it ended. With a limit of 0, no Autosave of that kind is written.
- **One Autosave for each Turn end:** A Turn-end Autosave or an Autopilot Autosave written for a Turn that already has either replaces it.
- **Autopilot engagements:** Each Turn that an Autopilot AI ends gets an Autopilot Autosave instead of a Turn-end Autosave, so the Turns played by an Autopilot AI never displace those the player played. Engaging Autopilot replaces the Engagement Autosave, and completing disengagement replaces the Disengagement Autosave, in every Autopilot engagement, including one that ends no Turn, one that commits no Player action, and a second one in the same Turn.
- **An Autosave that cannot be written:** An Autosave fails to be written for the same reasons as a save. The operation that causes the Autosave still completes, and its result reports the reason. That Autosave is then missing, and an existing Autosave it would have replaced is removed; e.g., a Current Autosave that cannot be replaced is removed rather than left holding an earlier World state.

# Listing Campaign saves

`session.saves.list()` reports every Campaign save in [Game storage](engine-contract.md#persisted-data), of every Campaign, including every Autosave; e.g., a user interface's [Main menu](campaign-lifecycle.md#glossary) lists them for the player to choose from. For each Campaign save it reports:

- its Campaign save ID, which `session.saves.load(save)` accepts, and its Campaign ID, so the Campaign saves of one Campaign can be grouped;
- whether it is an Autosave, and of which kind;
- the Turn its saved World state belongs to;
- the number of Player actions that lead from the start of that Turn to its saved World state, not counting Advance turn or any action that was undone; e.g., 0 when no Player action has been committed in that Turn yet;
- the time it was last written, so that a user interface can tell which Campaign save is the most recent.

Listing does not verify that a Campaign save can be loaded: a listed Campaign save may still fail to load.

# Deleting Campaign saves

Deleting removes Campaign saves from Game storage for good. It is how the player discards a line of play, a Campaign they no longer want, or a Campaign save that can no longer be loaded.

- `session.saves.delete(save)` deletes the one Campaign save with that Campaign save ID, whatever its kind, including an Autosave of any kind.
- `session.saves.deleteCampaign(campaign)` deletes every Campaign save whose Campaign ID is `campaign`, including every Autosave of that Campaign.

Both operations obey these rules:

- **Not the Current campaign:** A request to delete a Campaign save of the Current campaign, or to delete the Current campaign, fails and deletes nothing. The player [closes the Campaign](campaign-lifecycle.md#campaign-selection) first, so the Current Autosave of a Campaign being played is never removed by a request.
- **Any Campaign save that is listed:** Every Campaign save that `session.saves.list()` reports can be deleted, including one that fails to load, e.g. one that the Game build [rejects](#game-build-compatibility).
- **Permanent:** A deleted Campaign save cannot be restored.
- **All or nothing:** A delete that fails deletes no Campaign save.

# Save size limit

The Save size limit is 100 MiB. It is a safety measure against unbounded storage use, not a gameplay rule.

Writing a Campaign save that would exceed the Save size limit fails. No part of Campaign state, e.g. the History or the Timeline, is ever omitted to reduce the size of a Campaign save.

# Game build compatibility

Backward compatibility and migration of Campaign saves across Game builds are not required. A Game build may reject a Campaign save written by a different Game build, and a load of a rejected Campaign save fails.
