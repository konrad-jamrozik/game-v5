# Timeline

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | TIMELINE                                                       |
| Family      | Foundation                                                     |
| Status      | Draft                                                          |
| Audience    | Engine designer, UI designer, Implementer                      |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Overview

This document defines the Timeline of a Campaign: what it records, how undo and redo navigate it by action and by
Turn, and what a restored Timeline position guarantees.

It owns Timeline navigation only. The past that game behavior consults is World history, owned by
[Campaign State](campaign-state.md); persisting a Timeline is owned by [Saves](saves.md).

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

| Term                | Definition                                                                                                                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Timeline entry      | One Committed action recorded in the Timeline.                                                                                                                                             |
| Timeline position   | A point in the Timeline: before its first Timeline entry, or immediately after any one Timeline entry. The Campaign state at a Timeline position is a Committed state.                     |
| Timeline cursor     | The Timeline position the Campaign is currently at. Timeline entries after it are the redo entries.                                                                                        |
| Timeline branch     | The Timeline entries reachable from the Timeline cursor by undo and redo. Committing a new action after undo starts a new Timeline branch and discards the previous redo entries.          |
| Turn-start position | A Timeline position immediately after campaign creation or immediately after a committed Advance turn action.                                                                              |
| Turn                | The Timeline positions from one Turn-start position up to, but not including, the next Turn-start position. Every Timeline position belongs to exactly one Turn, and Advance turn ends it. |

# Timeline structure

The following hand-kept diagram shows one example Timeline: a Campaign with six Committed actions, of which the last
two have been undone. It illustrates the terms of the [Glossary](#glossary) and the rules of the sections below, and
it adds no rule of its own.

![Timeline structure: Timeline entries, Timeline positions, Turns, and undo and redo](./timeline-structure.svg)

The diagram reads as follows:

- **Timeline entries:** each box is one Timeline entry, which is one Committed action. A Player API action and a
  Developer API action are Timeline entries alike, under [Timeline entries](#timeline-entries).
- **Timeline positions:** each circle is a Timeline position. The Campaign state at it is a Committed state, labelled
  S0 to S6. A Timeline with six Timeline entries therefore has seven Timeline positions.
- **Advance turn:** Advance turn is one Timeline entry, and the Timeline position after it is a Turn-start position.
  The values partway through it are not a Committed state, so no Timeline position lies inside it.
- **Turns:** each bracket groups the Timeline positions of one Turn.
- **Undo and redo:** the Timeline cursor is at S4. Each arrow shows where one navigation operation moves it, under
  [Action navigation](#action-navigation) and [Turn navigation](#turn-navigation). The two dashed boxes are the redo
  entries.

# World history, Timeline, and Campaign save

Three things keep a Campaign's past, for different purposes. The following comparison is complete.

| Kept past     | What it records                                                              | Consulted by game behavior | Effect of undo                                                              | Owner                                                                      |
| ------------- | ---------------------------------------------------------------------------- | -------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| World history | Past Campaign state or events that game behavior and reports need            | Yes                        | Restored as part of Campaign state, to what it was at the Timeline position | [Campaign state composition](campaign-state.md#campaign-state-composition) |
| Timeline      | The Committed actions of the Campaign and the Timeline cursor                | Never                      | Moves the Timeline cursor                                                   | This document                                                              |
| Campaign save | A persisted copy of the Campaign at one Timeline position, with its Timeline | Never                      | None until the Campaign is saved again                                      | [Saves](saves.md)                                                          |

World history and the Timeline are independent. A game without undo would have no Timeline and would still need
World history; e.g., a report listing the Missions an Agent took part in reads World history. Removing a Timeline,
as a Campaign save may under [Save size limit](saves.md#save-size-limit), never removes World history.

# Timeline entries

Each committed Player API or Developer API action is exactly one Timeline entry, under
[Player queries and actions](engine-contract.md#player-queries-and-actions) and
[Dev mode and developer operations](engine-contract.md#dev-mode-and-developer-operations). No other operation is a
Timeline entry, e.g. a query or `session.campaigns.save()`.

Advance turn is one Timeline entry; its phases are not separate Timeline entries. An Autopilot AI's actions are the same
individual Timeline entries as actions committed directly: an Autopilot engagement is not one undo unit.

A newly created Campaign has a Timeline with no Timeline entries, and its Timeline cursor is at the first Timeline
position. Within a Session, a Timeline has no length limit, and navigating it has no gameplay cost.

# Action navigation

`session.timeline.getStatus()` reports which navigation operations are available and where the Timeline cursor is,
exposing only Player-visible information.

`session.timeline.undoAction()` moves the Timeline cursor to the Timeline position immediately before the preceding
Timeline entry. `session.timeline.redoAction()` moves it to the Timeline position immediately after the next redo entry.

Committing a new Player API or Developer API action after undo discards every redo entry and starts a new Timeline
branch. The discarded Timeline entries cannot be redone.

# Turn navigation

Turn-start positions exist immediately after campaign creation and after every committed Advance turn. The current
Turn's start is the most recent Turn-start position at or before the Timeline cursor.

`session.timeline.undoTurn()` moves the Timeline cursor to the Turn-start position preceding the current Turn's start.
It therefore reverses the previous completed Turn together with any actions already committed in the current Turn.
`session.timeline.redoTurn()` moves the Timeline cursor to the nearest Turn-start position strictly after it. This is
the complete target-selection rule.

E.g., from the start of Turn 5 or partway through Turn 5, `undoTurn()` returns to the start of Turn 4. To reverse only
current-Turn actions, use `undoAction()`. At a Turn-start position, one `redoTurn()` redoes the next complete Turn.
Redo entries that are not followed by a Turn-start position remain reachable through `redoAction()`.

# Restored Timeline positions

After navigation, the Campaign state equals the Committed state that was at the target Timeline position when it was
first reached, including its Campaign configuration and World history. Autopilot memory after navigation is stated
under [Autopilot memory](autopilot.md#autopilot-memory).

Play continued from a restored Timeline position produces the outcomes of uninterrupted play, under
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
[Committed state integrity](engine-contract.md#committed-state-integrity); e.g., `undoAction()` at the first Timeline
position, or `redoTurn()` with no later Turn-start position.

Timeline navigation is a Session API operation. It is unavailable to an Autopilot AI and unavailable while an
Autopilot engagement is active, under [Autopilot lifecycle and concurrency](autopilot.md#autopilot-lifecycle-and-concurrency).

A loaded Campaign save may start its Timeline later than campaign creation; [Save size limit](saves.md#save-size-limit)
states which Timeline positions are then unavailable.

# Acceptance examples

- **Action undo and redo:** Starting at Timeline position P, add money through Developer API, commit ordinary gameplay
  actions, and Advance turn. Undo each action and redo it with Dev mode disabled. Complete Campaign state and retained
  reports equal the original results, and queries between actions do not change those results
  ([Action navigation](#action-navigation), [Restored Timeline positions](#restored-timeline-positions)).
- **Turn targets:** At the start of Turn 5, `undoTurn()` restores the start of Turn 4 and `redoTurn()` restores the
  start of Turn 5. After one action in Turn 5, `undoTurn()` also restores the start of Turn 4 and undoes that
  current-Turn action ([Turn navigation](#turn-navigation)).
- **New Timeline branch:** Undo one action, then commit a different action. The undone action cannot be redone
  ([Action navigation](#action-navigation)).
- **Campaign configuration follows the Timeline cursor:** Commit a Campaign configuration change. Undo restores the
  preceding Campaign configuration and World state; redo restores the changed Campaign configuration and World state
  ([Restored Timeline positions](#restored-timeline-positions)).
- **Autopilot actions are separate Timeline entries:** An Autopilot AI commits three actions in one Autopilot
  engagement. After disengagement, three `undoAction()` calls are needed to reverse them
  ([Timeline entries](#timeline-entries)).
