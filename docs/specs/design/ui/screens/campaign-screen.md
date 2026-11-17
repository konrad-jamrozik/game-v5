# Campaign Screen

| Metadata    | Value                                                                                                                                                                            |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | CSCR                                                                                                                                                                             |
| Family      | UI                                                                                                                                                                               |
| Audience    | UI designer, Implementer                                                                                                                                                         |
| Owns        | The regions of the Campaign screen of the graphical user interface and the tabs of its main area.                                                                                |
| Conventions | [Specification conventions](../../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../../governance/conventions/design-spec-conventions.md) |

# Overview

While a [Campaign](../../foundation/core-concepts.md#campaign-and-session) is current, the GUI shows the Campaign screen. Two of its parts keep the Player aware,
without searching, of what is under way and what waits for a decision: the [Situation panel](situation-panel.md), always
in view, and the [Turn summary](turn-summary.md), shown once after an Advance turn. Both show
[Investigation progress](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) and a gain of it in [progress points](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) with two decimals, e.g. 7.02 for a stored 702.

The Campaign screen is one of the screens that the [Graphical User Interface](../gui.md) lists, and it is drawn with
the Design tokens and components of [Visual Design](../visual-design.md).

# Regions

The regions keep the agency's vital values and the work waiting for the Player in view, while the main area changes with
the selected tab.

- The status bar spans the top of the screen, under [Status bar](../visual-design.md#status-bar) in Visual Design.
- The left column holds the [Situation panel](situation-panel.md#glossary) above the Agents panel, both as wide as the column.
- The main area fills the rest of the screen to the right of the left column, with the tabs above it.

# Tabs

The tabs switch the main area between the parts of the [Campaign](../../foundation/core-concepts.md#campaign-and-session) the Player looks at one at a time. They are, in this
order, and the list is exhaustive:

1. [Mission sites](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), with the number of Active [Mission sites](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions).
2. Leads.
3. Agency.
4. [Turn report](../../foundation/world-history.md#glossary).
5. [History](history-tab.md).

Each tab is styled under [Tabs](../visual-design.md#tabs) in Visual Design.

# Artboard

![Campaign screen Artboard in the Field HUD direction with the History tab selected: a status bar with Turn, Money, Funding, Agents, a segmented Panic meter and the Faction; the Situation panel above the Agents panel in the left column; the History tab in the main area](../../../../images/artboards/campaign-screen.png)

The [Artboard](../visual-design.md#glossary) shows the Situation panel and the History tab as sample content of their regions; each is detailed by its
own specification and Artboard. The following appear only on the Artboard and must not be implemented, under
[Reading Artboards](../visual-design.md#reading-artboards) in Visual Design:

- The sample values, e.g. Turn 16, Money 625, and the [Agent](../../mechanics/domain-model.md#agency-and-agents) IDs.
- The labels, order, and grouping of the controls in the status bar, e.g. "Menu" instead of "Main menu", and the
  missing keyboard-shortcut hints.

# TODOs

- TODO: Write a specification for each of the Mission sites, [Leads](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), [Agency](../../mechanics/domain-model.md#agency-and-agents), and Turn report tabs, with a [panel
  Artboard](../visual-design.md#glossary), as for the [History](history-tab.md) tab: the game concepts under
  [Domain Model](../../mechanics/domain-model.md) each shows by default and what it keeps one step away.
- TODO: List the other screens the Player needs while a Campaign is current, e.g. an Agents screen and a Mission site
  screen.
- TODO: State how the Campaign screen reaches Advance turn, [Timeline](../../foundation/engine-contract.md#persisted-data) navigation, saving, and
  [Autopilot](../../foundation/engine-contract.md#autopilot), each through the operations that [API hierarchy](../../foundation/engine-contract.md#api-hierarchy) names.
