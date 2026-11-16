# About the UI family

> Informative overview. It owns no rules; each linked specification owns its content.

# What this family is for

The UI family gives the Implementer guidance on how to design the game's user interfaces (UIs): which screens the
Player needs, what each screen shows by default, and what it keeps one step away. It describes how a UI presents what
the engine API already offers. It adds no gameplay information and no engine API operation: what a UI may show and
which operations it may call stay owned by [Engine Contract](../foundation/engine-contract.md) and the specification
that owns each value.

The guidance states what the Player is expected to be able to do comfortably and how the graphical user interface
looks, so that every Implementation of it has the same visual direction. E.g. the family is expected to say that deploying Agents on a mission has a
dedicated screen for choosing which Agents exactly to deploy. By default, that screen lists only the Agents most relevant
for deployment, i.e. those ready to go on that mission. The Player can ask the screen to also show the other Agents,
e.g. to open the detailed view of an Agent that is recovering.

# Documents

## Command-Line Interface

[Command-Line Interface](cli.md) answers _how is the whole game played from a terminal, without
graphics?_ It owns the guidance for the game's headless interface to the engine API, with readable and structured
output.

## Graphical User Interface

[Graphical User Interface](gui.md) answers _which screens does the graphical user interface need,
and what does each show by default?_ It owns that guidance for the game's graphical user interface.

## Visual Design

[Visual Design](visual-design.md) answers _what does the graphical user interface look like?_ It owns the visual
direction, the Design tokens, and the styling of components and charts, illustrated by Artboards.

# How they relate

Both interfaces present the same engine API and neither depends on the other. Each uses Engine Contract and Campaign
Lifecycle from the Foundation family; the Command-Line Interface also uses Player API, and the Graphical User Interface
uses Domain Model from the Mechanics family. Visual Design uses the Graphical User Interface: it styles the screens that
the Graphical User Interface lists. Headless First in the Guidance family uses both, and Gameplay Dependency
Direction uses the Graphical User Interface.

<!-- generated:family-diagram:start -->

_Generated from the specifications’ Relationships sections by `npm run docs:generate`; do not edit between the markers. Arrows run from Dependency to Dependent; the Uses and Refines diagrams share their layers, and layer 1 holds the specifications that depend on no other specification of the Family; dashed boxes stand for whole other Families._

## Within the family

### Uses

![UI family: uses relationships within the family](../../../images/diagrams/ui-family-within-uses.svg)

### Refines

No refines relationships are declared within this family.

## Across families

![UI family: relationships with other families](../../../images/diagrams/ui-family-across.svg)

<!-- generated:family-diagram:end -->

# Why these boundaries

UI guidance is kept apart from Foundation and Mechanics so that changing how the game is presented never changes game
behavior. E.g. which Agents are ready for a mission is owned by [Agents](../mechanics/agents-spec.md) and
[Missions](../mechanics/missions.md); a UI specification only decides how prominently each Agent appears.
