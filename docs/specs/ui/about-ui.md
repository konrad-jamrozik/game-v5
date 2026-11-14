# About the UI family

> Informative overview. It owns no rules; each linked specification owns its content.

# What this family is for

The UI family gives the Implementer guidance on how to design the game's user interfaces (UIs): which screens the
Player needs, what each screen shows by default, and what it keeps one step away. It describes how a UI presents what
the engine API already offers. It adds no gameplay information and no engine API operation: what a UI may show and
which operations it may call stay owned by [Engine Contract](../foundation/engine-contract.md) and the specification
that owns each value.

The guidance states what the Player is expected to be able to do comfortably, not exact layouts, widgets, or styling,
which remain the Implementer's choice. E.g. the family is expected to say that deploying Agents on a mission has a
dedicated screen for choosing which Agents exactly to deploy. By default, that screen lists only the Agents most relevant
for deployment, i.e. those ready to go on that mission. The Player can ask the screen to also show the other Agents,
e.g. to open the detailed view of an Agent that is recovering.

# Documents

This family has no specification yet. A UI specification is added when guidance for a screen or a cross-screen
principle is ready to be written, e.g. a specification for the mission deployment screen described above.

# Why these boundaries

UI guidance is kept apart from Foundation and Mechanics so that changing how the game is presented never changes game
behavior. E.g. which Agents are ready for a mission is owned by [Agents](../mechanics/agents-spec.md) and
[Missions](../mechanics/missions.md); a UI specification only decides how prominently each Agent appears.
