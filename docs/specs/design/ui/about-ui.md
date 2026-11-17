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

[Graphical User Interface](gui.md) answers _which screens does the graphical user interface have,
and what do they share?_ It lists the screens and owns the Progress bar and the confirmations and warnings that span
them.

## Visual Design

[Visual Design](visual-design.md) answers _what does the graphical user interface look like?_ It owns the visual
direction, the Design tokens, and the styling of components and charts, and the Design canvas every Artboard is
exported from.

## Screens

The `screens/` directory groups one specification per screen, panel, or dialog of the graphical user interface, so
that each answers _what does this part show by default, and how is it laid out?_ next to its Artboard. The
[Main Menu](screens/main-menu.md) is where the GUI opens, and the [Campaign Screen](screens/campaign-screen.md) is where
a Campaign is played. The parts of the Campaign screen that need more than a line have their own: the
[Situation Panel](screens/situation-panel.md) for the work waiting for the Player, the
[Turn Summary](screens/turn-summary.md) for what an Advance turn did, and one specification for each Detail view the
Side panel opens: the [Missions View](screens/missions-view.md), [Leads View](screens/leads-view.md),
[Agents View](screens/agents-view.md), and [Upgrades View](screens/upgrades-view.md), in which the Player acts, and the
[Turn Report View](screens/turn-report-view.md), [History View](screens/history-view.md),
[Charts View](screens/charts-view.md), and [Compendium View](screens/compendium-view.md), in which the Player reads
what has happened and how the game works.

# How they relate

Both interfaces present the same engine API and neither depends on the other. Each uses Engine Contract and Campaign
Lifecycle from the Foundation family; the Command-Line Interface also uses Player API, and the Graphical User Interface
lists the screen specifications, which use Domain Model and the Mechanics specifications that detail the concepts each
shows, and World History for the Turn report. The Situation Panel, the Turn Summary, and every Detail view
specification are parts of the Campaign Screen. Every screen specification uses Visual Design for its look, and Visual Design names each screen
specification as the place of its Artboard. Headless First in the Guidance family uses both, and Gameplay Dependency
Direction uses the Graphical User Interface.

<!-- generated:family-diagram:start -->

_Generated from the links between the specifications by `npm run docs:generate`; do not edit between the markers. An arrow runs from a specification to each specification that references it, i.e. links to it; layer 1 holds the specifications that reference no other specification of the Family, specifications that reference each other in a cycle share a layer, and dashed boxes stand for whole other Families._

## Within the family

![UI family: references within the family](../../../images/diagrams/ui-family-within.svg)

## Across families

![UI family: relationships with other families](../../../images/diagrams/ui-family-across.svg)

<!-- generated:family-diagram:end -->

# Why these boundaries

UI guidance is kept apart from Foundation and Mechanics so that changing how the game is presented never changes game
behavior. E.g. which Agents are ready for a mission is owned by [Agents](../mechanics/agents-spec.md) and
[Missions](../mechanics/missions.md); a UI specification only decides how prominently each Agent appears.
