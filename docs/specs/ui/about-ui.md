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

## Web UI

[Web UI](web-ui.md) answers _which screens does the browser user interface need, and what does each show by default?_
It owns that guidance for the game's browser user interface.

# How they relate

Web UI uses Engine Contract and Campaign Lifecycle from the Foundation family and Domain Model from the Mechanics
family, and Gameplay Dependency Direction in the Implementation family uses it.

<!-- generated:family-diagram:start -->

_Generated from the specifications’ Relationships sections by `npm run docs:generate`; do not edit between the markers. Arrows run from Dependency to Dependent; layer 1 holds the specifications that depend on no other specification of the Family; dashed boxes stand for whole other Families._

## Within the family

This family has a single specification, so there are no relationships within it.

## Across families

![UI family: relationships with other families](../../images/ui-family-across.svg)

<!-- generated:family-diagram:end -->

# Why these boundaries

UI guidance is kept apart from Foundation and Mechanics so that changing how the game is presented never changes game
behavior. E.g. which Agents are ready for a mission is owned by [Agents](../mechanics/agents-spec.md) and
[Missions](../mechanics/missions.md); a UI specification only decides how prominently each Agent appears.
