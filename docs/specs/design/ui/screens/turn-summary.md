# Turn Summary

| Metadata | Value |
| --- | --- |
| Spec ID | TSUM |
| Family | UI |
| Audience | UI designer, Implementer |
| Owns | When the Turn summary dialog of the Campaign screen appears and what it shows. |
| Conventions | [Specification Conventions](../../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../../governance/conventions/design-spec-conventions.md) |

# Overview

The Turn summary tells the Player, as soon as an Advance turn ends, what it did that the Player must know before going on, so that a won Mission or a new Mission site is not missed in the full Turn report, and leads from a new Mission site straight to deploying to it. The Player can reopen it later in the Turn. It is a [dialog](../visual-design.md#dialogs) over the [Campaign Screen](campaign-screen.md).

# Glossary

| Term | Definition |
| --- | --- |
| Turn summary | The dialog that summarizes what an Advance turn did, shown after it only when it did [something the Player must know](#groups). |

# Groups

After an Advance turn that the Player requested through the GUI is committed, the GUI shows the Turn summary when that Advance turn did at least one thing listed below other than an Expired [Mission site](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), which the [Situation panel](situation-panel.md#glossary) [already shows](situation-panel.md#groups), and shows nothing otherwise. Once shown, or reopened, the Turn summary lists the Expired Mission sites as well. It reads every item from the [Turn report](../../foundation/campaign-state.md#glossary) and the [Current world state](../../foundation/engine-contract.md#player-actions-and-turns).

Its groups follow in this order, each under a [Group heading](../visual-design.md#panels-and-cards) with the number of its items, and each left out when empty:

1. **Missions:** for each [Combat report](../../mechanics/domain-model.md#combat) of the Turn report, its [Mission](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions)'s Mission site with its MissionSiteArchetype's `name`, kind, and target [Faction](../../mechanics/domain-model.md#factions); whether the Mission is Won or Lost, with the [Combat outcome](../../mechanics/combat.md#combat-rounds-and-results) of a Lost one, e.g. "Lost · Retreated", while a Won one says "Won" alone; the number of Agents in its [Team sent](../../mechanics/missions.md#mission-properties); the number of Agents [Killed](../../mechanics/agents-spec.md#agent-statuses); the number of Agents of its Team sent whose [Assignment](../../mechanics/domain-model.md#agency-and-agents) is now [Recovery](../../mechanics/agents-spec.md#assignments); the [Enemies](../../mechanics/domain-model.md#combat) dead out of the Enemies present; the [Consequences](../../mechanics/missions.md#consequences) that applied, e.g. money, funding, and a [Panic](../../mechanics/domain-model.md#campaign-standing) reduction; and a Combat report button. The card names no [Agent](../../mechanics/domain-model.md#agency-and-agents), because the Combat report names each participant.
2. **Investigations completed:** each [Investigation](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) that [completed in the Advance turn](../../mechanics/investigations.md#turn-report), with its [Lead](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions)'s `name`, the number of [Turns](../../foundation/engine-contract.md#player-actions-and-turns) from its Turn started to the Turn the Advance turn ended, its final [Investigation progress](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), its Lead's [Required progress range](../../mechanics/investigations.md#glossary), its [Progress bar](../gui.md#glossary), and the Mission site its completion created, if any.
3. **New Mission sites:** each Mission site [created in the Advance turn](../../mechanics/missions.md#turn-report), with its MissionSiteArchetype's `name`, its kind, its origin, i.e. the Lead of its origin Investigation or its target Faction, its number of Enemies, and its Turns until expiration.
4. **Expired Mission sites:** each Mission site that became Expired in the Advance turn, with its MissionSiteArchetype's `name`, its kind, and its [Consequences](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions). A Mission site that became Cancelled is left out.
5. **Leads discovered:** each Lead [discovered in the Advance turn](../../mechanics/leads-and-progression.md#turn-report), with its `name` only, without its Required progress range.
6. **Investigations interrupted:** the same items, each with the same value, as the section of that name in the [Turn Report View](turn-report-view.md).

# Showing and dismissing

The Player dismisses the Turn summary with one action, and it offers to open the full Turn report in the [Turn Report View](turn-report-view.md). Opening a [Detail view](../gui.md#glossary) from the Turn summary closes it, and the [View trail](campaign-screen.md#view-trail) leads the Player back to it.

The Turn summary is not shown after loading a [Campaign save](../../foundation/engine-contract.md#persisted-data), after undo, redo, or other [Timeline](../../foundation/timeline.md) navigation, nor for an Advance turn that [Autopilot](../../foundation/engine-contract.md#autopilot) requested, so that a long run of Advance turns does not open one Turn summary for each.

The Player [reopens the Turn summary](turn-report-view.md#turn-summary-button) from the Turn Report View, whenever the Turn report it shows has an item for at least one group, including after loading a Campaign save or after [Timeline](../../foundation/engine-contract.md#persisted-data) navigation. A reopened Turn summary reads the Current world state as it does when first shown, so an item read from it, e.g. the Agents whose Assignment is now Recovery, shows its current value, not its value when the Advance turn ended.

# Mission cards

Each Mission is a card, so that the outcome of a Mission reads apart from the lists around it. The card is an [item that takes more than one line](../visual-design.md#panels-and-cards): its first line holds its Mission site's name, kind, and target Faction, with the outcome as its value. Its outcome is in Positive for Won or Danger for Lost, its number of [Killed](../../mechanics/agents-spec.md#agent-statuses) Agents is in Danger when above 0, its number of Agents sent to [Recovery](../../mechanics/agents-spec.md#assignments) is in Accent text when above 0, and its Consequences are [coloured by whether each is good or bad for the Player](../visual-design.md#consequences).

The Combat report button, a neutral button at the end of the card, opens the Turn Report View with that Mission's [Combat report](turn-report-view.md#combat-report) shown.

# Mission site links

Each item of New Mission sites and of Expired Mission sites leads to its Mission site, so that the Player who reads of a new Mission site can deploy to it at once. Selecting the item opens the [Missions View](missions-view.md) with [that Mission site selected](missions-view.md#mission-site-list). The item keeps its colours, and the pointer resting on it underlines its name and shows that it can be pressed.

# Artboard

![Turn summary panel Artboard](../../../../images/artboards/turn-summary.png)

The following appear only on the [Artboard](../visual-design.md#glossary) of the Turn summary and [must not be implemented](../visual-design.md#reading-artboards):

- The layout inside each Mission card below its first line, and the labels of the buttons, e.g. "Continue", "Open Turn report", and "Combat report".
- The sample values, e.g. the Mission site names and the numbers.
