# Timeline

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | TIMELINE                                                       |
| Family      | Foundation                                                     |
| Status      | Draft                                                          |
| Audience    | Engine designer, UI designer, Implementer                      |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Overview

This document defines the Timeline of a Campaign: what it records, how undo and redo navigate the Committed actions of
the current Turn, and what a restored Committed state guarantees.

It owns undo and redo within one Turn only. Undo and redo across Turns is
[Autosave navigation](saves.md#autosave-navigation), owned by [Saves](saves.md). The past that game behavior consults
is World history, owned by [Campaign State](campaign-state.md).

# Relationships

- Uses [Campaign State](./campaign-state.md)
- Uses [Core Concepts](./core-concepts.md)
- Uses [Engine Contract](./engine-contract.md)
- Used by [Autopilot](./autopilot.md)
- Used by [Campaign Integration and Acceptance Tests](../acceptance/campaign-integration-and-acceptance-tests.md)
- Used by [Configuration](./configuration.md)
- Used by [Developer API](../interfaces/developer-api.md)
- Used by [Player Information](../interfaces/player-information.md)
- Used by [Saves](./saves.md)
- Used by [Storage Schema](../implementation/storage-schema.md)
- Used by [Terminal CLI](../interfaces/cli.md)
- Used by [TypeScript Player API](../interfaces/typescript-api.md)
- Used by [Web UI](../interfaces/web-ui.md)

# Glossary

Timeline, Committed action, Committed state, Campaign save, and the API surface and Principal terms are defined by the
[Engine Contract glossary](engine-contract.md#glossary). World history is defined by the
[Campaign State glossary](campaign-state.md#glossary).

| Term             | Definition                                                                                                                                                                                    |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Turn             | The part of a Campaign from one Turn-start state up to the next committed Advance turn. Every Committed state belongs to exactly one Turn, and Advance turn ends it.                          |
| Turn-start state | The Committed state immediately after campaign creation or immediately after a committed Advance turn. No other Committed action of its Turn has happened yet.                                |
| Turn-end state   | The Committed state in which a committed Advance turn began.                                                                                                                                  |
| Timeline entry   | One Committed action of the current Turn, other than Advance turn, recorded in the Timeline.                                                                                                  |
| Undone action    | A Timeline entry that undo has reversed and that redo can restore. The Undone actions are always the last Timeline entries of the Timeline, and committing a new action discards all of them. |

# Timeline structure

The Timeline holds the Turn-start state of the current Turn and that Turn's Timeline entries in the order they were
committed. The Campaign state is always a Committed state of the current Turn: the Committed state right after the
last Timeline entry that is not an Undone action, or the Turn-start state when there is none.

The following two hand-kept diagrams show one example Turn with four Timeline entries. They illustrate the terms of
the [Glossary](#glossary) and the rules of the sections below, and they add no rule of their own.

The first diagram starts after the fourth Committed action and shows undo.

![Undo within one Turn: four undoAction() calls, or one undoAllActions() call](./timeline-undo-actions.svg)

The second diagram starts where the first one ends, at the Turn-start state, and shows redo.

![Redo within one Turn: four redoAction() calls, or one redoAllActions() call](./timeline-redo-actions.svg)

The diagrams read as follows:

- **The horizontal line:** the line is one Turn. It begins at the Turn-start state and ends where the player advances
  the turn.
- **Circles:** each circle is one Timeline entry. An arrow ending at a circle means the Campaign state becomes the
  Committed state right after that Committed action.
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
| Campaign save | A persisted copy of the Campaign at one Committed state, with its Timeline | Never                      | None until the Campaign is saved again                                    | [Saves](saves.md)                                                          |

World history and the Timeline are independent. A game without undo would have no Timeline and would still need
World history; e.g., a report listing the Missions an Agent took part in reads World history. Starting a new Timeline,
as Advance turn does under [Timeline entries](#timeline-entries), never removes World history.

# Timeline entries

Each committed Player API or Developer API action other than Advance turn is exactly one Timeline entry, under
[Player queries and actions](engine-contract.md#player-queries-and-actions) and
[Dev mode and developer operations](engine-contract.md#dev-mode-and-developer-operations). No other operation is a
Timeline entry, e.g. a query or `session.campaign.save()`.

Advance turn is a Committed action and not a Timeline entry. A committed Advance turn discards the Timeline of the
Turn it ends, including its Undone actions, and starts the Timeline of the next Turn: that Timeline holds the
Turn-start state reached by Advance turn and no Timeline entry. Undo therefore never reverses Advance turn.

An Autopilot AI's actions are the same individual Timeline entries as actions committed directly: an Autopilot
engagement is not one undo unit.

A newly created Campaign has a Timeline holding its Turn-start state and no Timeline entry. The Timeline does not
depend on any Campaign save: it holds its Turn-start state itself, so every operation under
[Action navigation](#action-navigation) works when the Campaign has no Campaign save at all. Within a Turn, a
Timeline has no length limit, and navigating it has no gameplay cost.

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

# Restored Committed states

After navigation, the Campaign state equals the Committed state as it was when the Campaign first reached it,
including its Campaign configuration and World history. Autopilot memory after navigation is stated under
[Autopilot memory](autopilot.md#autopilot-memory).

Play continued from a restored Committed state produces the outcomes of uninterrupted play, under
[Determinism](engine-contract.md#determinism). Redo reproduces the Committed action exactly:

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
unavailable, including when an earlier Turn can be reached through
[Autosave navigation](saves.md#autosave-navigation).

Timeline navigation is a Session API operation. It is unavailable to an Autopilot AI and unavailable while an
Autopilot engagement is active, under [Autopilot lifecycle and concurrency](autopilot.md#autopilot-lifecycle-and-concurrency).

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
- **Undo without any Campaign save:** Create a Campaign and never save it, with an [Autosave limit](saves.md#glossary) of 0. Commit three
  actions. Three `undoAction()` calls restore the Turn-start state ([Timeline entries](#timeline-entries)).
- **Campaign configuration follows undo and redo:** Commit a Campaign configuration change. Undo restores the
  preceding Campaign configuration and World state; redo restores the changed Campaign configuration and World state
  ([Restored Committed states](#restored-committed-states)).
- **Autopilot actions are separate Timeline entries:** An Autopilot AI commits three actions in one Autopilot
  engagement without advancing the turn. After disengagement, three `undoAction()` calls are needed to reverse them
  ([Timeline entries](#timeline-entries)).
