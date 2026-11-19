# State redesign brief

A redesign of what a Campaign holds, how undo and redo work, and what a Campaign save is. It replaces the current model, in which a Campaign save keeps Campaign state, the Timeline, and Autopilot memory side by side.

## Campaign state

A Campaign save maps one to one to Campaign state: a save holds exactly the Campaign state, plus its own bookkeeping, e.g. its Campaign save ID and the time it was written.

Campaign state is composed of:

- the Timeline;
- a pointer to the Timeline entry that is current;
- the History;
- the Campaign configuration;
- the Turn report.

"Game rules" is the name for the rules that decide whether a Player action is allowed, what it changes, what Advance turn does, and what a query reports. It replaces the undefined phrase "game behavior".

Because Campaign state now includes the Timeline, which the Game rules never read, Campaign state can no longer be defined as "what the Game rules read". The Game rules read only the current world state, the History, and the Campaign configuration.

A Committed state is the world state the pointer is on, not the whole Campaign state.

## World state

A world state has two parts:

- the Live world state part: every instance that is still in play;
- the Retired world state part: every instance that has left play, e.g. past Mission sites, Killed Agents, Dismissed Agents, and Abandoned Investigations, each kept with its final values.

Retired instances are not moved into the History. Some instances leave play through a Player action in the middle of a Turn, e.g. a Dismissed Agent or an Investigation Abandoned by a recall, and undo must bring those back. One rule for every Retired instance is simpler than one rule for those that leave during Advance turn and another for those that leave through a Player action. The player-facing history screens still show Retired instances.

## Timeline

- The Timeline always starts at the start of the current Turn: its first world state is the Turn-start state.
- Each Timeline entry after that holds one Player action and the world state that Player action produced.
- The list of Player actions of the current Turn is read off the Timeline, from its start up to the pointer. Nothing else stores it.

When the player plays without undo or redo, each Player action does the following:

- a new Timeline entry is added, holding the Player action and the new world state;
- the pointer moves to that new entry.

When the player presses "undo player action", only this happens:

- the pointer moves back by one.

When the player presses "redo player action", only this happens:

- the pointer moves forward by one.

A Player action made while redoable entries exist removes those entries for good.

## History

- The History goes back to the beginning of the Campaign, the start of Turn 1. This is unlike the Timeline, whose first world state is the start of the current Turn.
- The History holds only what the end of a Turn writes: one entry for each ended Turn, and the Turn series.
- Only Advance turn changes the History. Undo and redo within a Turn can never reach it, so the History needs no pointer.
- "History" becomes a permitted term. Today "History, as a component of Campaign state" is a prohibited synonym of World history; that prohibition is removed.

Facts that the Game rules read and that can change during a Turn are not History. They stay in the world state, so that undo restores them; e.g. an Agent's Participation history, which grows when the player recalls the Agent from an Investigation.

What the interface shows as the history of the current Turn is not stored and is not part of the History. It is derived from the Timeline: the Turn-start state, the Player actions of the Timeline entries up to the pointer, and the world state the pointer is on. It therefore follows every Player action, undo, and redo by itself. When Advance turn ends the Turn, the entry for that Turn is written into the History from the same data.

## Turn report

The Turn report is fixed and always describes the Turn advancement from the previous Turn to the current one. The first Turn has no Turn report.

## Campaign configuration

- Changing the Campaign configuration is not a Player action and cannot be undone or redone. It is sticky.
- Undo and redo across Turns, which load an Autosave, ignore the Campaign configuration of that Autosave. The Campaign configuration in the Session always takes precedence.
- An explicit Load always takes the Campaign configuration of the save it loads. This covers loading a save of a different Campaign, which must not receive the settings of the Campaign that was current before.
- Consequence, accepted: an undone Turn can be played again under a different Campaign configuration, e.g. a different difficulty. "Play continued after undo unfolds as if nothing had been undone" therefore holds only while the Campaign configuration is unchanged, and the specifications must say so.

- A change to the Campaign configuration affects only future calculations and never rewrites an existing world state. Otherwise the change would have to alter world states already on the Timeline.

## Autopilot memory

There is no Autopilot memory. The feature is removed completely.
