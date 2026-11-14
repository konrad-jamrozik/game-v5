# Saves

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | SAVES                                                          |
| Family      | Foundation                                                     |
| Status      | Draft                                                          |
| Audience    | Engine designer, UI designer, Implementer                      |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Overview

This document defines Campaign saves: what a Campaign save holds, saving, saving as new, loading, the Autosaves the
engine writes, undo and redo across Turns by Autosave navigation, the Save size limit, and which Campaign saves a
Game build loads.

It owns what saving and loading observably do. How a Campaign save is encoded and stored is the implementer's choice.
Undo and redo within one Turn is owned by [Timeline](timeline.md).

# Relationships

- Uses [Core Concepts](./core-concepts.md)
- Uses [Engine Contract](./engine-contract.md)
- Uses [Timeline](./timeline.md)
- Used by [Campaign Integration and Acceptance Tests](../acceptance/campaign-integration-and-acceptance-tests.md)
- Used by [Storage Schema](../implementation/storage-schema.md)
- Used by [Terminal CLI](../interfaces/cli.md)
- Used by [TypeScript Player API](../interfaces/typescript-api.md)
- Used by [Web UI](../interfaces/web-ui.md)

# Glossary

Campaign save, Current save, Current campaign, Game storage, Global configuration, Timeline, Committed action,
Committed state, Autopilot engagement, Autopilot memory, and Independent identifier are defined by the
[Engine Contract glossary](engine-contract.md#glossary). Turn, Turn-start state, Turn-end state, Timeline entry, and
Undone action are defined by the [Timeline glossary](timeline.md#glossary).

## Identifiers

The identifiers of Campaigns and their Campaign saves.

| Term             | Definition                                                                                                                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Campaign ID      | The Independent identifier identifying one Campaign, assigned when the Campaign is created and shared by every Campaign save of that Campaign. It is not Campaign state, and game behavior never consults it. |
| Campaign save ID | The Independent identifier identifying one Campaign save, assigned when that Campaign save is created.                                                                                                        |

## Autosave kinds

The Campaign saves the engine writes itself, which make undo and redo across Turns possible.

| Term                   | Definition                                                                                                                                                  |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Autosave               | A Campaign save that the engine writes without a save request from the Session controller, under [Autosaves](#autosaves).                                   |
| Turn-end Autosave      | The Autosave holding the Turn-end state of one Turn, written when the player advances the turn.                                                             |
| Engagement Autosave    | The Autosave holding the Committed state in which the most recent Autopilot engagement began.                                                               |
| Disengagement Autosave | The Autosave holding the Committed state in which the most recent Autopilot engagement ended.                                                               |
| Return Autosave        | The Autosave holding the Committed state the Session controller left by going back through [Autosave navigation](#autosave-navigation), so redo can return. |

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
- the Timeline of the Turn that Committed state belongs to, including its Undone actions;
- the Autopilot memory of the Campaign.

A Campaign save holds nothing a Session holds and no Global configuration. It holds no Timeline of an earlier Turn:
earlier Turns are reached through [Autosave navigation](#autosave-navigation).

One Campaign may have several Campaign saves, which share its Campaign ID and have distinct Campaign save IDs. E.g., a
player may keep the Undone actions that a new action after undo would otherwise discard. Two Campaigns created with
equal creation inputs, including the same Campaign seed, and given equal commands have equal Campaign state but
distinct Campaign IDs. Because the Campaign seed is Campaign state, under
[Campaign seed](engine-contract.md#campaign-seed), every Campaign save holds it.

# Saving

Saving captures the Current campaign at its current Committed state. It is available at every Committed state,
including before the player advances the turn, and it is not a Timeline entry.

`session.campaign.save()` writes the Current campaign to its Current save, replacing that Campaign save's contents.
When the Current campaign has no Current save, it creates a new Campaign save and makes that the Current save.

`session.campaign.saveAsNew()` always creates a new Campaign save of the same Campaign and makes that the Current
save; every earlier Campaign save is unchanged. Keeping a line of play that a new action would discard uses
`saveAsNew()`: there is no separate fork operation, and the new Campaign save keeps the Campaign ID and receives a
new Campaign save ID.

Neither operation ever writes to an Autosave.

# Loading

A successful `session.campaign.load(save)` atomically:

- restores the Campaign state, Timeline, and Autopilot memory held by the Campaign save;
- selects that Campaign as the Current campaign and that Campaign save as the Current save;
- leaves no active Autopilot engagement and Dev mode disabled, under
  [Campaign lifecycle](engine-contract.md#campaign-lifecycle).

Loading an Autosave differs in one respect: the Current campaign then has no Current save, so a later `save()`
creates a new Campaign save and leaves the Autosave unchanged.

Play continued after a load produces the outcomes of uninterrupted play, under
[Determinism](engine-contract.md#determinism). An Autopilot engagement that was active when the Campaign was saved is
not resumed.

# Autosaves

An Autosave is a Campaign save and holds what every Campaign save holds, under
[Campaign save contents](#campaign-save-contents). It belongs to the Campaign it was written from. Only the engine
writes, replaces, or removes an Autosave; the Session controller can load one with `session.campaign.load(save)`.

The following list of Autosaves is complete.

| Autosave               | Written                                                                                                                           | Holds                                                             | Kept                                                            |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------- |
| Turn-end Autosave      | When an Advance turn commits outside an Autopilot engagement                                                                      | The Turn-end state of the Turn that Advance turn ends             | One for each of the most recent Turns, up to the Autosave limit |
| Engagement Autosave    | When Autopilot is engaged                                                                                                         | The Committed state in which the Autopilot engagement begins      | One for each Campaign                                           |
| Disengagement Autosave | When disengagement of Autopilot completes                                                                                         | The Committed state in which the Autopilot engagement ends        | One for each Campaign                                           |
| Return Autosave        | When `undoToAutosave()` is called, unless the Campaign has a Return Autosave holding a later Committed state than the current one | The current Committed state, with its Timeline, before going back | One for each Campaign                                           |

Each Autosave holds the Timeline as it is at its Committed state, including its Undone actions. Loading an Autosave
therefore restores undo and redo of that Turn's Timeline entries, under
[Action navigation](timeline.md#action-navigation).

The following rules are complete.

- **Autosave limit:** The Autosave limit is a whole number of at least 0, and its Game build default is 5. Writing a
  Turn-end Autosave that brings the Campaign above the Autosave limit removes the Turn-end Autosave of the earliest
  Turn. With an Autosave limit of 0, no Turn-end Autosave is written. The Autosave limit counts only Turn-end
  Autosaves.
- **One Turn-end Autosave for each Turn:** A Turn-end Autosave written for a Turn that already has one replaces it.
- **Autopilot engagements:** No Turn-end Autosave is written during an Autopilot engagement, however many Advance turn
  actions the Autopilot AI commits. Engaging Autopilot replaces the Engagement Autosave and removes the
  Disengagement Autosave; the completed disengagement writes the new Disengagement Autosave. This holds for every
  Autopilot engagement, including one that advances no turn and a second one in the same Turn.
- **A new action removes Autosaves of abandoned play:** When a Player API or Developer API action commits, every
  Autosave of the Campaign is removed unless it holds the Committed state in which that action began or an earlier
  Committed state. The removal happens before any Autosave that the action itself causes is written.
- **Earlier and later:** A Committed state is later than another Committed state of the same Campaign when one or more
  Committed actions lead from the other to it, and the other is then earlier. Committed states that neither of these
  relates belong to different lines of play; e.g., two Committed states reached by different actions after the same
  undo.

Undo and redo within a Turn do not depend on any Autosave: the Timeline holds its own Turn-start state, under
[Timeline entries](timeline.md#timeline-entries).

# Autosave navigation

Autosave navigation is undo and redo across Turns. It moves the Current campaign between Autosaves and never applies
or reverses a Committed action itself.

The targets of Autosave navigation are the Turn-end Autosaves, the Engagement Autosave, and the Return Autosave of
the Current campaign, limited to those holding a Committed state that is earlier or later than the current Committed
state. A Disengagement Autosave is never a target; it can be loaded with `session.campaign.load(save)`.

The following list of operations is complete.

| Operation                              | Effect                                                                                                                                                                          |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `session.campaign.undoToAutosave()`    | Writes the Return Autosave when [Autosaves](#autosaves) requires it, then loads the target holding the latest Committed state that is earlier than the current Committed state. |
| `session.campaign.redoToAutosave()`    | Loads the target holding the earliest Committed state that is later than the current Committed state.                                                                           |
| `session.campaign.getAutosaveStatus()` | Reports, for each of the two operations above, whether it is available and which Autosave and Turn it loads.                                                                    |

Going back and going forward land on the same targets. Consequently, calling `undoToAutosave()` N times and then
`redoToAutosave()` M times, with M no greater than N and no Committed action in between, leaves the Current campaign
where N minus M calls of `undoToAutosave()` leave it. With M equal to N, it is where it started, including its
Timeline entries and Undone actions, because the last `redoToAutosave()` loads the Return Autosave. Loading the Return
Autosave through `redoToAutosave()` removes it.

Loading a target restores the Campaign state, Timeline, and Autopilot memory it holds, as [Loading](#loading) states,
with these differences: the Current save and Dev mode stay unchanged. Play continued from a loaded target produces
the outcomes of uninterrupted play, under [Determinism](engine-contract.md#determinism).

Autosave navigation is never a side effect of another operation. In particular, `session.timeline.undoAction()` at a
Turn-start state is rejected and does not load an Autosave, under
[Edge cases and failure behavior](timeline.md#edge-cases-and-failure-behavior). An interface presents Autosave
navigation as a control separate from undo and redo within the Turn, because one call can cross many Turns.

The following two hand-kept diagrams show one example Campaign. They illustrate the rules of this section and of
[Autosaves](#autosaves), and they add no rule of their own. The player played Turn 3 and Turn 4, engaged Autopilot
in Turn 5, took over again in Turn 9, and has committed three actions in Turn 10.

The first diagram shows `undoToAutosave()` called four times.

![Autosave navigation going back: four undoToAutosave() calls from Turn 10](./autosave-navigation-undo.svg)

The second diagram starts where the first one ends and shows `redoToAutosave()` called four times.

![Autosave navigation going forward: four redoToAutosave() calls back to Turn 10](./autosave-navigation-redo.svg)

The diagrams read as follows:

- **Horizontal lines:** each line is one Turn, drawn as in [Timeline structure](timeline.md#timeline-structure). Each
  circle is one Timeline entry.
- **Rectangles:** each rectangle is the engine applying a committed Advance turn.
- **Filled diamonds:** each is a Turn-end Autosave, written just before the rectangle that follows it.
- **The Autopilot engagement:** the Engagement Autosave and the Disengagement Autosave surround it, and no Turn-end
  Autosave is written inside it. One call therefore crosses the whole Autopilot engagement.
- **The Return Autosave:** the first `undoToAutosave()` writes it in Turn 10, and the fourth `redoToAutosave()` loads
  it.
- **After a call:** the loaded Autosave holds its own Turn's Timeline, so the player can then undo that Turn's
  Timeline entries one by one.

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
message and takes no further action; e.g., the Web UI shows an error message and stays on the screen
the load or save was requested from. The message follows the
[Information boundary](engine-contract.md#information-boundary).

Autosaves fail for the same reasons, with these complete consequences:

- **An Autosave that cannot be written:** The operation that causes a Turn-end Autosave, an Engagement Autosave, or a
  Disengagement Autosave still completes, and its result reports the Save reason. That Autosave is then missing, and
  an existing Autosave it would have replaced is removed.
- **A Return Autosave that cannot be written:** `undoToAutosave()` fails with the Save reason and changes nothing.
- **A target that cannot be loaded:** `undoToAutosave()` or `redoToAutosave()` fails with the Load reason and leaves
  the entire prior Session unchanged. A Return Autosave written by that call stays.
- **No target:** `undoToAutosave()` or `redoToAutosave()` with no target is rejected and changes nothing, under
  [Committed state integrity](engine-contract.md#committed-state-integrity); e.g., `redoToAutosave()` when no
  Autosave holds a later Committed state.

Autosave navigation is a Session API operation. It is unavailable to an Autopilot AI and unavailable while an
Autopilot engagement is active, under [Autopilot lifecycle and concurrency](autopilot.md#autopilot-lifecycle-and-concurrency).

After a Campaign save that is not an Autosave is loaded, Autosaves holding a Committed state of a different line of
play are not targets, under [Autosave navigation](#autosave-navigation). They stay in Game storage until a new action
removes them, under [Autosaves](#autosaves).

# Acceptance examples

- **Save and load:** Create Campaign A, save after a gameplay action before Advance turn, then create Campaign B.
  Load the Campaign save of Campaign A and obtain the exact saved Campaign state with Dev mode disabled and no active
  Autopilot engagement. Loading a corrupt Campaign save reports the reason Corrupt Campaign save and leaves the
  Current campaign unchanged ([Saving](#saving), [Loading](#loading),
  [Edge cases and failure behavior](#edge-cases-and-failure-behavior)).
- **Keeping a line of play by saving as new:** Load Campaign save S1 and commit three actions. `saveAsNew()` creates
  S2 and makes it the Current save. Undo two actions and commit a different action, then `save()`. S2 holds the new
  actions; S1 still holds the original Campaign state. Both have the same Campaign ID ([Saving](#saving)).
- **Campaign configuration isolation:** Save Campaign A, then load a Campaign save of Campaign B with different
  Campaign configuration. The saved values of B apply. Loading the Campaign save of A restores the saved values of A
  ([Loading](#loading)).
- **A Campaign save holds one Turn of Timeline:** Commit two actions, Advance turn, commit one action, and save. Load
  that Campaign save. One `undoAction()` restores the Turn-start state, and a second is rejected
  ([Campaign save contents](#campaign-save-contents)).
- **Going back and forward across Turns:** With the Autosave limit 5, commit actions and Advance turn in Turn 1, Turn
  2, and Turn 3, then commit two actions in Turn 4. Three `undoToAutosave()` calls load the Turn-end Autosaves of Turn
  3, Turn 2, and Turn 1 in that order. One `redoToAutosave()` then loads the Turn-end Autosave of Turn 2, the same
  result as two `undoToAutosave()` calls. Two more `redoToAutosave()` calls restore Turn 4 with its two Timeline
  entries ([Autosave navigation](#autosave-navigation)).
- **Undo within a loaded Turn:** After `undoToAutosave()` loads the Turn-end Autosave of a Turn with three Timeline
  entries, three `undoAction()` calls restore that Turn's Turn-start state. `redoToAutosave()` then loads the same
  Turn-end Autosave again ([Autosaves](#autosaves), [Autosave navigation](#autosave-navigation)).
- **Autosave limit:** With the Autosave limit 5, Advance turn seven times from Turn 1. The Campaign has the Turn-end
  Autosaves of Turn 3 to Turn 7. Five `undoToAutosave()` calls succeed and a sixth is rejected
  ([Autosaves](#autosaves), [Edge cases and failure behavior](#edge-cases-and-failure-behavior)).
- **One Autopilot engagement, one pair of Autosaves:** Play Turn 1 to Turn 4, then in Turn 5 engage Autopilot with
  `turnAdvancements` and count 30. After disengagement the Campaign has the Turn-end Autosaves of Turn 1 to Turn 4,
  the Engagement Autosave in Turn 5, and the Disengagement Autosave in Turn 35, and no Turn-end Autosave of Turn 5 to
  Turn 34. One `undoToAutosave()` loads the Engagement Autosave; four more load the Turn-end Autosaves of Turn 4 to
  Turn 1 ([Autosaves](#autosaves), [Autosave navigation](#autosave-navigation)).
- **A second Autopilot engagement replaces the pair:** In one Turn, engage Autopilot with `singleAction` twice. After
  the second disengagement the Campaign has one Engagement Autosave and one Disengagement Autosave, both of the second
  Autopilot engagement ([Autosaves](#autosaves)).
- **A new action removes later Autosaves:** From Turn 4, call `undoToAutosave()` twice, loading the Turn-end Autosave
  of Turn 2, and commit a new action. The Turn-end Autosave of Turn 3 and the Return Autosave are removed, the
  Turn-end Autosaves of Turn 1 and Turn 2 remain, and `redoToAutosave()` is rejected ([Autosaves](#autosaves)).
- **No Autosaves:** With the Autosave limit 0, commit two actions and Advance turn. No Turn-end Autosave is written
  and `undoToAutosave()` is rejected. In the new Turn, commit an action; `undoAction()` restores the Turn-start state
  ([Autosaves](#autosaves)).
- **Too large:** Save a Campaign whose Campaign save would exceed 100 MiB. The save fails, every existing Campaign
  save is unchanged, and undo and redo in the Session still work ([Save size limit](#save-size-limit)).
