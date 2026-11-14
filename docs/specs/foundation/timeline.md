# Timeline

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | TIMELINE                                                       |
| Family      | Foundation                                                     |
| Status      | Draft                                                          |
| Audience    | Engine designer, UI designer, Implementer                      |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Overview

This document defines the Timeline of a Campaign and all undo and redo: what the Timeline records, how undo and redo
navigate the Player actions of the current Turn, how undo and redo cross Turns by Autosave navigation, and what a
restored Committed state guarantees.

Undo and redo come in two forms. [Action navigation](#action-navigation) steps through the Player actions of the
current Turn and never leaves that Turn. [Autosave navigation](#autosave-navigation) goes back and forward across
Turns by loading the Autosaves that [Saves](saves.md) defines. The past that game behavior consults is World history,
owned by [Campaign State](campaign-state.md).

# Relationships

- Uses [Campaign State](./campaign-state.md)
- Uses [Core Concepts](./core-concepts.md)
- Uses [Engine Contract](./engine-contract.md)
- Uses [Saves](./saves.md)
- Used by [Autopilot](./autopilot.md)
- Used by [Campaign Integration and Acceptance Tests](../acceptance/campaign-integration-and-acceptance-tests.md)
- Used by [Configuration](./configuration.md)
- Used by [Developer API](../interfaces/developer-api.md)
- Used by [Player Information](../interfaces/player-information.md)
- Used by [Storage Schema](../implementation/storage-schema.md)
- Used by [Terminal CLI](../interfaces/cli.md)
- Used by [TypeScript Player API](../interfaces/typescript-api.md)
- Used by [Web UI](../interfaces/web-ui.md)

# Glossary

Timeline, Player action, Committed state, Turn, Turn-start state, Turn-end state, Campaign save, Current campaign,
Current save, and the API surface and Principal terms are defined by the
[Engine Contract glossary](engine-contract.md#glossary). World history is defined by the
[Campaign State glossary](campaign-state.md#glossary). Autosave, Current Autosave, Turn-end Autosave, Engagement
Autosave, and Autosave limit are defined by the [Saves glossary](saves.md#glossary).

| Term            | Definition                                                                                                                                                                                    |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Timeline entry  | One Player action of the current Turn, other than Advance turn, recorded in the Timeline.                                                                                                     |
| Undone action   | A Timeline entry that undo has reversed and that redo can restore. The Undone actions are always the last Timeline entries of the Timeline, and committing a new action discards all of them. |
| Return Autosave | The Autosave holding the Committed state the Session controller left by going back through [Autosave navigation](#autosave-navigation), so redo can return.                                   |

# Timeline structure

The Timeline holds the Turn-start state of the current Turn and that Turn's Timeline entries in the order they were
committed. The Campaign state is always a Committed state of the current Turn: the Committed state right after the
last Timeline entry that is not an Undone action, or the Turn-start state when there is none.

The following two hand-kept diagrams show one example Turn with four Timeline entries. They illustrate the terms of
the [Glossary](#glossary) and the rules of the sections below, and they add no rule of their own.

The first diagram starts after the fourth Player action and shows undo.

![Undo within one Turn: four undoAction() calls, or one undoAllActions() call](../../images/timeline-undo-actions.svg)

The second diagram starts where the first one ends, at the Turn-start state, and shows redo.

![Redo within one Turn: four redoAction() calls, or one redoAllActions() call](../../images/timeline-redo-actions.svg)

The diagrams read as follows:

- **The horizontal line:** the line is one Turn. It begins at the Turn-start state and ends where the player advances
  the turn.
- **Circles:** each circle is one Timeline entry. An arrow ending at a circle means the Campaign state becomes the
  Committed state right after that Player action.
- **The diamond on the left:** this is the Turn-start state, in which no Timeline entry has been committed. The
  Timeline itself holds it, so undo reaches it whether or not any Campaign save exists.
- **The diamond on the right:** this is the Turn-end Autosave, which [Autosaves](saves.md#autosaves) in Saves owns.
  It holds the Turn-end state: the Committed state just before the player advances the turn, and the Committed state
  restored when that Campaign save is loaded.
- **Dashed circles:** these are Undone actions.
- **Advance turn:** the rectangle is the engine applying turn advancement. Advance turn is not a Timeline entry, and
  no Committed state lies inside it.

# World history, Timeline, and Campaign save

Three things keep a Campaign's past, for different purposes. The following comparison is complete.

| Kept past     | What it records                                                            | Consulted by game behavior | Effect of undo                                                            | Owner                                                                      |
| ------------- | -------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| World history | Past Campaign state or events that game behavior and reports need          | Yes                        | Restored as part of Campaign state, to what it was at the Committed state | [Campaign state composition](campaign-state.md#campaign-state-composition) |
| Timeline      | The Turn-start state and the Timeline entries of the current Turn          | Never                      | Turns the last Timeline entry that is not an Undone action into one       | This document                                                              |
| Campaign save | A persisted copy of the Campaign at one Committed state, with its Timeline | Never                      | None, except that the Current Autosave is replaced to match               | [Saves](saves.md)                                                          |

World history and the Timeline are independent. A game without undo would have no Timeline and would still need
World history; e.g., a report listing the Missions an Agent took part in reads World history. Starting a new Timeline,
as Advance turn does under [Timeline entries](#timeline-entries), never removes World history.

# Timeline entries

Each committed Player API or Developer API action other than Advance turn is exactly one Timeline entry, under
[Player queries and actions](engine-contract.md#player-queries-and-actions) and
[Dev mode and developer operations](engine-contract.md#dev-mode-and-developer-operations). No other operation is a
Timeline entry, e.g. a query or `session.campaign.save()`.

Advance turn is a Player action and not a Timeline entry. A committed Advance turn discards the Timeline of the
Turn it ends, including its Undone actions, and starts the Timeline of the next Turn: that Timeline holds the
Turn-start state reached by Advance turn and no Timeline entry. Undo therefore never reverses Advance turn.

An Autopilot AI's actions are the same individual Timeline entries as actions committed directly: an Autopilot
engagement is not one undo unit.

A newly created Campaign has a Timeline holding its Turn-start state and no Timeline entry. The Timeline does not
depend on any Campaign save: it holds its Turn-start state itself, so every operation under
[Action navigation](#action-navigation) works whichever Campaign saves exist; e.g., with an Autosave limit of 0, or
after an Autosave could not be written. Within a Turn, a Timeline has no length limit, and navigating it has no
gameplay cost.

# Action navigation

`session.timeline.getStatus()` reports which navigation operations are available, how many Timeline entries the
Timeline has, and how many of them are Undone actions, exposing only Player-visible information.

The following list of navigation operations is complete.

| Operation                           | Effect                                                                                               |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `session.timeline.undoAction()`     | Turns the last Timeline entry that is not an Undone action into an Undone action.                    |
| `session.timeline.redoAction()`     | Restores the first Undone action, so that it is no longer an Undone action.                          |
| `session.timeline.undoAllActions()` | Turns every Timeline entry into an Undone action. The Campaign state becomes the Turn-start state.   |
| `session.timeline.redoAllActions()` | Restores every Undone action. The Campaign state becomes the Committed state after the last of them. |

`undoAllActions()` has the same result as calling `undoAction()` until it is unavailable, and `redoAllActions()` the
same result as calling `redoAction()` until it is unavailable.

Committing a new Player API or Developer API action discards every Undone action. The discarded Undone actions cannot
be redone.

Action navigation never leaves the current Turn: undo stops at the Turn-start state, and redo stops after the last
Timeline entry. Going back to an earlier Turn, and forward again, is [Autosave navigation](#autosave-navigation).

# Autosave navigation

Autosave navigation is undo and redo across Turns. It moves the Current campaign between Autosaves and never applies
or reverses a Player action itself. [Autosaves](saves.md#autosaves) in Saves owns when the Turn-end Autosave and
the Engagement Autosave are written; this section adds the Return Autosave.

The targets of Autosave navigation are the Turn-end Autosaves, the Engagement Autosave, and the Return Autosave of
the Current campaign, limited to those holding a Committed state that is earlier or later than the current Committed
state. The Current Autosave is never a target: it holds the current Committed state.

The following list of operations is complete.

| Operation                              | Effect                                                                                                                                                                 |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `session.timeline.undoToAutosave()`    | Writes the Return Autosave when the rules below require it, then loads the target holding the latest Committed state that is earlier than the current Committed state. |
| `session.timeline.redoToAutosave()`    | Loads the target holding the earliest Committed state that is later than the current Committed state.                                                                  |
| `session.timeline.getAutosaveStatus()` | Reports, for each of the two operations above, whether it is available and which Autosave and Turn it loads.                                                           |

The following rules are complete.

- **Earlier and later:** A Committed state is later than another Committed state of the same Campaign when one or more
  Player actions lead from the other to it, and the other is then earlier. Committed states that neither of these
  relates belong to different lines of play; e.g., two Committed states reached by different actions after the same
  undo.
- **Return Autosave:** `undoToAutosave()` writes the Return Autosave, holding the current Committed state with its
  Timeline, before going back, unless the Campaign has a Return Autosave holding a later Committed state than the
  current one. A Campaign has at most one Return Autosave. Loading the Return Autosave through `redoToAutosave()`
  removes it.
- **A new action removes Autosaves of abandoned play:** When a Player API or Developer API action commits, every
  Autosave of the Campaign is removed unless it holds the Committed state in which that action began or an earlier
  Committed state. The removal happens before any Autosave that the action itself causes is written.
- **Loading a target:** Loading a target restores the Campaign state, Timeline, and Autopilot memory it holds, as
  [Loading](saves.md#loading) in Saves states, with these differences: the Current save and Dev mode stay unchanged.
- **Never a side effect:** Autosave navigation is never a side effect of another operation. In particular,
  `undoAction()` at a Turn-start state is rejected and does not load an Autosave, under
  [Edge cases and failure behavior](#edge-cases-and-failure-behavior). An interface presents Autosave navigation as a
  control separate from Action navigation, because one call can cross many Turns.

Each target holds the Timeline as it is at its Committed state, including its Undone actions, under
[Campaign save contents](saves.md#campaign-save-contents). Loading a target therefore restores undo and redo of that
Turn's Timeline entries, under [Action navigation](#action-navigation).

Going back and going forward land on the same targets. Consequently, calling `undoToAutosave()` N times and then
`redoToAutosave()` M times, with M no greater than N and no Player action in between, leaves the Current campaign
where N minus M calls of `undoToAutosave()` leave it. With M equal to N, it is where it started, including its
Timeline entries and Undone actions, because the last `redoToAutosave()` loads the Return Autosave.

The following two hand-kept diagrams show one example Campaign. They illustrate the rules of this section and of
[Autosaves](saves.md#autosaves), and they add no rule of their own. The player played Turn 3 and Turn 4, engaged
Autopilot in Turn 5, took over again in Turn 9, and has committed three actions in Turn 10.

The first diagram shows `undoToAutosave()` called four times.

![Autosave navigation going back: four undoToAutosave() calls from Turn 10](../../images/autosave-navigation-undo.svg)

The second diagram starts where the first one ends and shows `redoToAutosave()` called four times.

![Autosave navigation going forward: four redoToAutosave() calls back to Turn 10](../../images/autosave-navigation-redo.svg)

The diagrams read as follows:

- **Horizontal lines:** each line is one Turn, drawn as in [Timeline structure](#timeline-structure). Each circle is
  one Timeline entry.
- **Rectangles:** each rectangle is the engine applying a committed Advance turn.
- **Filled diamonds:** each is a Turn-end Autosave, written just before the rectangle that follows it.
- **The Autopilot engagement:** the Engagement Autosave is written where it begins, and no Turn-end Autosave is
  written inside it. One call therefore crosses the whole Autopilot engagement. No Autosave marks where it ends: the
  Turn-end Autosave of Turn 9 holds that Turn's Timeline, which reaches back to it.
- **The Return Autosave:** the first `undoToAutosave()` writes it in Turn 10, and the fourth `redoToAutosave()` loads
  it.
- **After a call:** the loaded Autosave holds its own Turn's Timeline, so the player can then undo that Turn's
  Timeline entries one by one.

# Restored Committed states

After navigation, the Campaign state equals the Committed state as it was when the Campaign first reached it,
including its Campaign configuration and World history. This holds for Action navigation and Autosave navigation
alike. Autopilot memory after navigation is stated under [Autopilot memory](autopilot.md#autopilot-memory).

Play continued from a restored Committed state produces the outcomes of uninterrupted play, under
[Determinism](engine-contract.md#determinism). Redo reproduces the Player action exactly:

- Redoing an action that an Autopilot AI chose does not ask any Autopilot AI to choose again.
- A Developer API action is undone and redone whether or not Dev mode is enabled, and doing so grants no Developer
  API access.

Navigation leaves Dev mode unchanged. Restoration preserves
[Campaign instance identity](campaign-state.md#campaign-instance-identity): undo may remove a Campaign instance or
restore its earlier State, and redo restores the same Instance ID, Archetype, and Constants. Restoration is not creation
of a new Campaign instance.

# Edge cases and failure behavior

A navigation operation with no target is rejected and changes nothing, under
[Committed state integrity](engine-contract.md#committed-state-integrity); e.g., `undoAction()` at the Turn-start
state, or `redoAction()` when the Timeline has no Undone action.

Undo never continues into the previous Turn. At the Turn-start state, `undoAction()` and `undoAllActions()` are
unavailable, including when an earlier Turn can be reached through [Autosave navigation](#autosave-navigation).

Action navigation and Autosave navigation are Session API operations. They are unavailable to an Autopilot AI and
unavailable while an Autopilot engagement is active, under
[Autopilot lifecycle and concurrency](autopilot.md#autopilot-lifecycle-and-concurrency).

Autosave navigation fails for the reasons listed under
[Edge cases and failure behavior](saves.md#edge-cases-and-failure-behavior) in Saves, with these complete
consequences:

- **A Return Autosave that cannot be written:** `undoToAutosave()` fails with the Save reason and changes nothing.
- **A target that cannot be loaded:** `undoToAutosave()` or `redoToAutosave()` fails with the Load reason and leaves
  the entire prior Session unchanged. A Return Autosave written by that call stays.
- **A missing Autosave:** An Autosave that could not be written is not a target; e.g., when the Turn-end Autosave of
  Turn 3 is missing, `undoToAutosave()` from Turn 4 loads the Turn-end Autosave of Turn 2.

After a Campaign save that is not an Autosave is loaded, Autosaves holding a Committed state of a different line of
play are not targets. They stay in Game storage until a new action removes them.

# Acceptance examples

- **Action undo and redo:** At a Turn-start state, add money through Developer API and commit two ordinary gameplay
  actions. Undo each action and redo it with Dev mode disabled. Complete Campaign state and retained reports equal the
  original results after each step, and queries between actions do not change those results
  ([Action navigation](#action-navigation), [Restored Committed states](#restored-committed-states)).
- **Undo stops at the Turn-start state:** Commit two actions, Advance turn, and commit one action. One `undoAction()`
  restores the Turn-start state of the new Turn. A second `undoAction()` is rejected and changes nothing
  ([Timeline entries](#timeline-entries), [Edge cases and failure behavior](#edge-cases-and-failure-behavior)).
- **All actions at once:** Commit four actions in one Turn. `undoAllActions()` restores the Turn-start state and
  leaves four Undone actions. `redoAllActions()` restores the Committed state after the fourth action. Both results
  equal those of four `undoAction()` calls and four `redoAction()` calls
  ([Action navigation](#action-navigation)).
- **A new action discards the Undone actions:** Undo one action, then commit a different action. The undone action
  cannot be redone ([Action navigation](#action-navigation)).
- **Undo needs no Campaign save:** Create a Campaign and never save it, with an Autosave limit of 0. Commit two
  actions and Advance turn. No Turn-end Autosave is written and `undoToAutosave()` is rejected. In the new Turn,
  commit three actions. Three `undoAction()` calls restore the Turn-start state
  ([Timeline entries](#timeline-entries), [Autosave navigation](#autosave-navigation)).
- **A Campaign save holds one Turn of Timeline:** Commit two actions, Advance turn, commit one action, and save. Load
  that Campaign save. One `undoAction()` restores the Turn-start state, and a second is rejected
  ([Timeline entries](#timeline-entries)).
- **Keeping Undone actions by saving as new:** Commit three actions and call `saveAsNew()`, creating Campaign save
  S1. Undo two actions, commit a different action, and call `saveAsNew()`, creating S2. Loading S1 restores the three
  original actions; loading S2 restores the new line of play ([Action navigation](#action-navigation)).
- **Campaign configuration follows undo and redo:** Commit a Campaign configuration change. Undo restores the
  preceding Campaign configuration and World state; redo restores the changed Campaign configuration and World state
  ([Restored Committed states](#restored-committed-states)).
- **Autopilot actions are separate Timeline entries:** An Autopilot AI commits three actions in one Autopilot
  engagement without advancing the turn. After disengagement, three `undoAction()` calls are needed to reverse them
  ([Timeline entries](#timeline-entries)).
- **Going back and forward across Turns:** With the Autosave limit 5, commit actions and Advance turn in Turn 1, Turn
  2, and Turn 3, then commit two actions in Turn 4. Three `undoToAutosave()` calls load the Turn-end Autosaves of Turn
  3, Turn 2, and Turn 1 in that order. One `redoToAutosave()` then loads the Turn-end Autosave of Turn 2, the same
  result as two `undoToAutosave()` calls. Two more `redoToAutosave()` calls restore Turn 4 with its two Timeline
  entries ([Autosave navigation](#autosave-navigation)).
- **Undo within a loaded Turn:** After `undoToAutosave()` loads the Turn-end Autosave of a Turn with three Timeline
  entries, three `undoAction()` calls restore that Turn's Turn-start state. `redoToAutosave()` then loads the same
  Turn-end Autosave again ([Autosave navigation](#autosave-navigation)).
- **Going back stops at the Autosave limit:** With the Autosave limit 5, Advance turn seven times from Turn 1. Five
  `undoToAutosave()` calls load the Turn-end Autosaves of Turn 7 to Turn 3, and a sixth is rejected
  ([Autosave navigation](#autosave-navigation), [Edge cases and failure behavior](#edge-cases-and-failure-behavior)).
- **One call crosses an Autopilot engagement:** Play Turn 1 to Turn 4, then in Turn 5 engage Autopilot with
  `turnAdvancements` and count 30. After disengagement in Turn 35, one `undoToAutosave()` loads the Engagement
  Autosave in Turn 5; four more load the Turn-end Autosaves of Turn 4 to Turn 1. Five `redoToAutosave()` calls then
  restore Turn 35 as it was left ([Autosave navigation](#autosave-navigation)).
- **A new action removes later Autosaves:** From Turn 4, call `undoToAutosave()` twice, loading the Turn-end Autosave
  of Turn 2, and commit a new action. The Turn-end Autosave of Turn 3 and the Return Autosave are removed, the
  Turn-end Autosaves of Turn 1 and Turn 2 remain, and `redoToAutosave()` is rejected
  ([Autosave navigation](#autosave-navigation)).
