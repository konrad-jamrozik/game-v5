# Timeline

| Metadata | Value |
| --- | --- |
| Spec ID | TIMELINE |
| Family | Foundation |
| Audience | Engine designer, UI designer, Implementer |
| Owns | The structure of the Timeline, undo and redo of the Player actions of the current Turn, undo and redo across Turns, and what returning to a World state guarantees. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

Undo lets the player take back a decision and try another. The [Timeline](engine-contract.md#persisted-data) of a [Campaign](core-concepts.md#campaign-and-session) makes this possible: it keeps the [World state](engine-contract.md#player-actions-and-turns) the current [Turn](engine-contract.md#player-actions-and-turns) started in and, for each [Player action](engine-contract.md#player-actions-and-turns) since, a Timeline entry holding the action and the World state it produced. Undo and redo then only move the [Timeline pointer](engine-contract.md#persisted-data) between them, at no gameplay cost. The Game rules never read the Timeline beyond its Current world state.

The Turn divides undo and redo into two forms. [Action navigation](#action-navigation) moves the Timeline pointer within the current Turn and never leaves it. [Autosave navigation](#autosave-navigation) goes back and forward across Turns by loading the [Autosaves](saves.md#autosaves) of [Saves](saves.md). Either way, the Current world state becomes exactly the one the Campaign first reached, so play continued from there unfolds as if nothing had been undone, as long as the Campaign's settings stay unchanged.

# Glossary

General terms are in the [Engine Contract glossary](engine-contract.md#glossary), and [Autosave](saves.md#autosave-kinds) terms are in the [Saves glossary](saves.md#glossary).

| Term | Definition |
| --- | --- |
| Timeline entry | One [Player action](engine-contract.md#player-actions-and-turns) of the current [Turn](engine-contract.md#player-actions-and-turns), other than Advance turn, together with the [World state](engine-contract.md#player-actions-and-turns) it produced, as the [Timeline](engine-contract.md#persisted-data) holds them after its [Turn-start state](engine-contract.md#player-actions-and-turns). |
| Undone action | A Timeline entry after the [Timeline pointer](engine-contract.md#persisted-data), which redo can reach again. The Undone actions are always the last Timeline entries of the Timeline, and committing a new action removes all of them. |
| Furthest progress Autosave | The Autosave holding the furthest [World state](engine-contract.md#player-actions-and-turns) of the current line of play, which the [Session controller](engine-contract.md#principals-and-access) left by going back through [Autosave navigation](#autosave-navigation), so redo can return to it, e.g. to a Turn the player has not ended and that therefore has no Turn-end Autosave. |

# Timeline structure

The Timeline holds the [Turn-start state](engine-contract.md#player-actions-and-turns) of the current Turn, followed by that Turn's Timeline entries in the order they were committed. The Timeline pointer is always on the Turn-start state or on one Timeline entry, and the [Current world state](engine-contract.md#player-actions-and-turns) is the Turn-start state or the World state of that Timeline entry. The Player actions of the current Turn that are not undone are read off the Timeline, from its start up to the Timeline pointer; nothing else stores them.

When the player commits a Player action other than Advance turn, the Timeline changes in exactly this way: every Undone action is removed for good, a Timeline entry holding the Player action and the World state it produced is added at the end, and the Timeline pointer moves to that Timeline entry.

The following two hand-kept diagrams show one example Turn with four Timeline entries. They illustrate the terms of the [Glossary](#glossary) and the rules of the sections below, and they add no rule of their own.

The first diagram starts after the fourth Player action and shows undo.

![Undo within one Turn: four undoAction() calls, or one undoAllActions() call, each moving the Timeline pointer back](../../../images/diagrams/timeline-undo-actions.svg)

The second diagram starts where the first one ends, at the Turn-start state, and shows redo.

![Redo within one Turn: four redoAction() calls, or one redoAllActions() call, each moving the Timeline pointer forward](../../../images/diagrams/timeline-redo-actions.svg)

The diagrams read as follows:

- **The horizontal line:** the line is one Turn. It begins at the Turn-start state and ends where the player advances the Turn.
- **Circles:** each circle is one Timeline entry. An arrow ending at a circle means the Timeline pointer moves to that Timeline entry, so its World state becomes the Current world state.
- **The diamond on the left:** this is the Turn-start state, in which no Timeline entry has been committed. The Timeline itself holds it, so undo reaches it whether or not any [Campaign save](engine-contract.md#persisted-data) exists.
- **The diamond on the right:** this is the [Turn-end Autosave](saves.md#autosave-kinds), under [Autosaves](saves.md#autosaves). It holds the [Campaign state](core-concepts.md#campaign-and-session) with the [Turn-end state](engine-contract.md#player-actions-and-turns) as its Current world state: the World state just before the player ends the Turn, and the one that is current when that Campaign save is loaded.
- **Dashed circles:** these are Undone actions.
- **Advance turn:** the rectangle is the engine applying Turn advancement. Advance turn is not a Timeline entry, and no World state lies inside it.

# History, Timeline, and Campaign save

Three things keep a [Campaign](core-concepts.md#campaign-and-session)'s past, for different purposes. The following comparison is complete.

| Kept past | What it records | Read by the Game rules | Effect of undo within a Turn | Stated in |
| --- | --- | --- | --- | --- |
| [History](campaign-state.md#glossary) | What the end of each Turn writes, from the start of the Campaign | Yes | None | [World state and History](campaign-state.md#world-state-and-history) |
| Timeline | The Turn-start state and the Timeline entries of the current Turn | Only its Current world state | Moves the Timeline pointer back by one | [Timeline structure](#timeline-structure) |
| Campaign save | A persisted copy of the Campaign state | Never | None, except that the [Current Autosave](saves.md#autosave-kinds) is replaced to match | [Saves](saves.md) |

The History and the Timeline are independent. A game without undo would have no Timeline entries to navigate and would still need the History; e.g., a chart of money over past Turns reads a Turn series in the History. Starting a new Timeline, as Advance turn does under [Timeline entries](#timeline-entries), never removes anything from the History.

# Timeline entries

Each committed Player action other than Advance turn is exactly one Timeline entry, under [Player actions and Turns](engine-contract.md#player-actions-and-turns) in Engine Contract, which counts a successful [Player cheat action](engine-contract.md#player-actions-and-turns) as a Player action. No other operation is a Timeline entry, e.g. a query, `session.saves.save()`, or `session.campaignConfiguration.set(values)`.

Advance turn is a Player action and not a Timeline entry. A committed Advance turn discards the Timeline of the Turn it ends, including its Undone actions, and starts the Timeline of the next Turn: that Timeline holds the Turn-start state reached by Advance turn and no Timeline entry, and the Timeline pointer is on that Turn-start state. Undo therefore never reverses Advance turn.

An [Autopilot AI](engine-contract.md#principals-and-access)'s actions are the same individual Timeline entries as actions committed directly: an [Autopilot engagement](engine-contract.md#autopilot) is not one undo unit.

A newly created Campaign has a Timeline holding its Turn-start state and no Timeline entry. The Timeline does not depend on any Campaign save: it holds its Turn-start state itself, so every operation under [Action navigation](#action-navigation) works whichever Campaign saves exist; e.g., with an [Autosave limit](saves.md#limits) of 0, or after an Autosave could not be written. Within a Turn, a Timeline has no length limit, and navigating it has no gameplay cost.

# Action navigation

`session.timeline.getStatus()` reports which navigation operations are available, how many Timeline entries the Timeline has, and how many of them are Undone actions, exposing only [Player-visible information](engine-contract.md#api-surfaces).

The following list of navigation operations is complete. Each changes nothing but the Timeline pointer.

| Operation | Effect |
| --- | --- |
| `session.timeline.undoAction()` | Moves the Timeline pointer back by one, so the Timeline entry it was on becomes an Undone action. |
| `session.timeline.redoAction()` | Moves the Timeline pointer forward by one, onto the first Undone action, which is then no longer an Undone action. |
| `session.timeline.undoAllActions()` | Moves the Timeline pointer to the Turn-start state, so every Timeline entry becomes an Undone action. |
| `session.timeline.redoAllActions()` | Moves the Timeline pointer to the last Timeline entry, so no Undone action remains. |

`undoAllActions()` has the same result as calling `undoAction()` until it is unavailable, and `redoAllActions()` the same result as calling `redoAction()` until it is unavailable.

Committing a new Player action removes every Undone action for good, under [Timeline structure](#timeline-structure). The removed Undone actions cannot be redone.

Action navigation never leaves the current Turn: undo stops at the Turn-start state, and redo stops at the last Timeline entry. Going back to an earlier Turn, and forward again, is [Autosave navigation](#autosave-navigation).

# Autosave navigation

Autosave navigation is undo and redo across Turns. It moves the [Current campaign](core-concepts.md#campaign-and-session) between Autosaves and never applies or reverses a Player action itself. The Turn-end Autosave, the [Autopilot Autosave](saves.md#autosave-kinds), the [Engagement Autosave](saves.md#autosave-kinds), and the [Disengagement Autosave](saves.md#autosave-kinds) are written under [Autosaves](saves.md#autosaves); this section adds the Furthest progress Autosave.

The targets of Autosave navigation are the Turn-end Autosaves, the Autopilot Autosaves, the Engagement Autosave, the Disengagement Autosave, and the Furthest progress Autosave of the Current campaign, limited to those whose saved World state is earlier or later than the Current world state. The Current Autosave is never a target: it holds the Current world state.

The following list of operations is complete.

| Operation | Effect |
| --- | --- |
| `session.timeline.undoToAutosave()` | Writes the Furthest progress Autosave when the rules below require it, then loads the target holding the latest World state that is earlier than the Current world state. |
| `session.timeline.redoToAutosave()` | Loads the target holding the earliest World state that is later than the Current world state. |
| `session.timeline.getAutosaveStatus()` | Reports, for each of the two operations above, whether it is available, which Autosave and Turn it loads, and whether it crosses an Autopilot engagement, under Crossing an Autopilot engagement below. |

The following rules are complete.

- **Earlier and later:** A World state is later than another World state of the same Campaign when one or more Player actions lead from the other to it, and the other is then earlier. World states that neither of these relates belong to different lines of play; e.g., two World states reached by different actions after the same undo.
- **Equal targets:** When two targets hold equal World states, the operation loads the Furthest progress Autosave if it is one of them; e.g., the Disengagement Autosave can hold the World state that the Furthest progress Autosave holds. Between two other targets holding equal World states, which one is loaded is the Implementer's choice.
- **Furthest progress Autosave:** `undoToAutosave()` writes the Furthest progress Autosave, holding the current Campaign state, before going back, unless the Campaign has a Furthest progress Autosave holding a later World state than the current one. A Campaign has at most one Furthest progress Autosave. Loading the Furthest progress Autosave through `redoToAutosave()` removes it.
- **A new action removes Autosaves of abandoned play:** When a Player action commits, every Autosave of the Campaign is removed unless its saved World state is the World state in which that action began or an earlier World state. The removal happens before any Autosave that the action itself causes is written.
- **Loading a target:** Loading a target makes the Campaign state it holds current, as [Loading](saves.md#loading) in Saves states, with two differences. [Dev mode](engine-contract.md#principals-and-access) stays unchanged. The [Campaign configuration](campaign-state.md#glossary) stays that of the Current campaign, whatever Campaign configuration the target holds, because the Campaign configuration in the [Session](core-concepts.md#campaign-and-session) always takes precedence over that of an Autosave. Every Campaign save of one Campaign holds the same values fixed after creation, so only values adjustable during play can differ.
- **An Autopilot Autosave is a step like a Turn-end Autosave:** Going back from the end of an Autopilot engagement, the calls load its Disengagement Autosave, then the Autopilot Autosave of each Turn it ended that still has one, latest first, and only then its Engagement Autosave; going forward lands on the same targets in reverse. E.g., with an Autopilot Autosave limit of 5, after Autopilot is engaged in Turn 15 and disengaged in Turn 105, calls of `undoToAutosave()` from the Disengagement Autosave load the Autopilot Autosaves of Turns 104 down to 100 one by one, and the next call loads the Engagement Autosave in Turn 15.
- **Crossing an Autopilot engagement:** A call crosses an Autopilot engagement when it undoes or redoes at once the Player actions of the most recent one that lie between its start and its earliest Autopilot Autosave, or all of them when it has none: `undoToAutosave()` does when it loads the Engagement Autosave, and `redoToAutosave()` does when the Current world state is the World state the Engagement Autosave holds. It is reported so that an interface can name such a call before it is used, because one call then reverses or replays many Player actions that the player did not choose.
- **Never a side effect:** Autosave navigation is never a side effect of another operation. In particular, `undoAction()` at a Turn-start state is rejected and does not load an Autosave, under [Edge cases and failure behavior](#edge-cases-and-failure-behavior). An interface may offer one undo control and one redo control for both forms, provided each control names the form it takes before it is used, because one call of Autosave navigation can cross many Turns; e.g., the GUI labels its undo control Undo Action, Undo Turn, or Undo Autopilot.

Each target holds a whole Campaign state, including the Timeline of its Turn with its Undone actions and its Timeline pointer, under [Campaign save contents](saves.md#campaign-save-contents). Loading a target therefore restores undo and redo of that Turn's Timeline entries, under [Action navigation](#action-navigation).

Going back and going forward land on the same targets. Consequently, calling `undoToAutosave()` N times and then `redoToAutosave()` M times, with M no greater than N and no Player action in between, leaves the Current campaign where N minus M calls of `undoToAutosave()` leave it. With M equal to N, it is where it started, including its Timeline entries and Undone actions, because the last `redoToAutosave()` loads the Furthest progress Autosave.

The following two hand-kept diagrams show one example Campaign. They illustrate the rules of this section and of [Autosaves](saves.md#autosaves), and they add no rule of their own. The player played Turn 4, engaged [Autopilot](engine-contract.md#autopilot) at the start of Turn 5 with an [Autopilot Autosave limit](saves.md#limits) of 1, took over again at the start of Turn 9, ended Turn 9 after one action, and has committed three actions in Turn 10. The diagrams leave out the Turns before Turn 4.

The first diagram shows `undoToAutosave()` called five times.

![Autosave navigation going back: five undoToAutosave() calls from Turn 10](../../../images/diagrams/autosave-navigation-undo.svg)

The second diagram starts where the first one ends and shows `redoToAutosave()` called five times.

![Autosave navigation going forward: five redoToAutosave() calls back to Turn 10](../../../images/diagrams/autosave-navigation-redo.svg)

The diagrams read as follows:

- **Horizontal lines:** each line is one Turn, drawn as in [Timeline structure](#timeline-structure). Each circle is one Timeline entry.
- **Rectangles:** each rectangle is the engine applying a committed Advance turn.
- **Filled diamonds:** each is a Turn-end Autosave or an Autopilot Autosave, written just before the rectangle that follows it.
- **Squares:** the Engagement Autosave is written where the Autopilot engagement begins, and the Disengagement Autosave where it ends.
- **The Autopilot engagement:** the Autopilot AI ended Turns 5 to 8, and each got an Autopilot Autosave; with an Autopilot Autosave limit of 1, only that of Turn 8 is kept. One call therefore crosses the Turns from the Engagement Autosave to the Autopilot Autosave of Turn 8.
- **The Furthest progress Autosave:** the first `undoToAutosave()` writes it in Turn 10, and the fifth `redoToAutosave()` loads it.
- **After a call:** the loaded Autosave holds its own Turn's Timeline, so the player can then undo that Turn's Timeline entries one by one.

# Returning to a World state

After Action navigation, the Current world state is exactly the World state the Campaign reached when it first got there, because undo and redo change nothing but the Timeline pointer. After Autosave navigation, it is exactly the saved World state of the loaded target. Neither form changes the Campaign configuration: a change made after that World state was first reached stays in force, under [Changing Campaign configuration during play](configuration.md#changing-campaign-configuration-during-play) in Configuration.

Play continued from the Current world state produces the outcomes of uninterrupted play as long as the Campaign configuration is unchanged, under [Determinism](determinism-and-randomness.md#determinism). Redo reproduces the Player action exactly:

- Redo moves the Timeline pointer onto the World state the Player action produced when it was committed, even when the Campaign configuration has changed since.
- Redoing an action that an Autopilot AI chose does not ask any Autopilot AI to choose again.
- A Player cheat action is undone and redone whether or not Dev mode is enabled, and doing so grants no [Developer API](engine-contract.md#api-surfaces) access.

Navigation leaves Dev mode unchanged. Navigation preserves [Campaign instance identity](campaign-instances.md#campaign-instance-identity): a World state reached by undo may lack a [Campaign instance](core-concepts.md#campaign-instances) or hold its earlier [State](core-concepts.md#campaign-instances), and redo returns to the same [Instance ID](campaign-instances.md#glossary), [Archetype](core-concepts.md#campaign-instances), and [Constants](core-concepts.md#campaign-instances). Returning to a World state is not creation of a new Campaign instance.

# Edge cases and failure behavior

A navigation operation with no target is rejected and changes nothing, under [World state integrity](engine-contract.md#world-state-integrity); e.g., `undoAction()` at the Turn-start state, or `redoAction()` when the Timeline has no Undone action.

Undo never continues into the previous Turn. At the Turn-start state, `undoAction()` and `undoAllActions()` are unavailable, including when an earlier Turn can be reached through [Autosave navigation](#autosave-navigation).

Action navigation and Autosave navigation are [Session API](engine-contract.md#api-surfaces) operations. They are unavailable to an Autopilot AI and unavailable while an Autopilot engagement is active, under [Autopilot lifecycle and concurrency](autopilot.md#autopilot-lifecycle-and-concurrency).

Autosave navigation fails for the reasons listed under [Edge cases and failure behavior](saves.md#edge-cases-and-failure-behavior) in Saves, with these complete consequences:

- **A Furthest progress Autosave that cannot be written:** `undoToAutosave()` fails with the Save reason and changes nothing.
- **A target that cannot be loaded:** `undoToAutosave()` or `redoToAutosave()` fails with the Load reason and leaves the entire prior [Session](core-concepts.md#campaign-and-session) unchanged. A Furthest progress Autosave written by that call stays.
- **A missing Autosave:** An Autosave that could not be written is not a target; e.g., when the Turn-end Autosave of Turn 3 is missing, `undoToAutosave()` from Turn 4 loads the Turn-end Autosave of Turn 2.

After a Campaign save that is not an Autosave is loaded, Autosaves whose saved World state belongs to a different line of play are not targets. They stay in [Game storage](engine-contract.md#persisted-data) until a new action removes them.
