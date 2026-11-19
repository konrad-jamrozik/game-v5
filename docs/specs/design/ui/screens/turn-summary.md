# Turn Summary

| Metadata | Value |
| --- | --- |
| Spec ID | TSUM |
| Family | UI |
| Audience | UI designer, Implementer |
| Owns | When the Turn summary dialog of the Campaign screen appears and what it shows. |
| Conventions | [Specification Conventions](../../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../../governance/conventions/design-spec-conventions.md) |

# Overview

The Turn summary tells the Player, as soon as an Advance turn ends, what it did that the Player must know before going on, so that a won Mission or a new Mission site is not missed in the full Turn report. The Player can reopen it later in the Turn. It is a dialog over the [Campaign Screen](campaign-screen.md), styled under [Dialogs](../visual-design.md#dialogs) in Visual Design.

# Glossary

These terms are specific to the Turn Summary.

| Term | Definition |
| --- | --- |
| Turn summary | The dialog that summarizes what an Advance turn did, shown after it only when it did something the Player must know, under [Groups](#groups). |

# Groups

After an Advance turn that the Player requested through the GUI is committed, the GUI shows the Turn summary when that Advance turn did at least one thing listed below, and shows nothing otherwise. It reads every item from the [Turn report](../../foundation/campaign-state.md#glossary) and the current [Committed state](../../foundation/engine-contract.md#player-actions-and-turns). Its groups follow in this order, each under a Group heading with the number of its items, under [Panels and cards](../visual-design.md#panels-and-cards) in Visual Design, and each left out when empty; the list is exhaustive.

1. **Missions:** for each [Combat report](../../mechanics/domain-model.md#combat) of the Turn report, its [Mission](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions)'s [Mission site](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) with its MissionSiteArchetype's `name`, kind, and target [Faction](../../mechanics/domain-model.md#factions); whether the Mission is Won or Lost, with the [Combat outcome](../../mechanics/combat.md#combat-rounds-and-results); the number of Agents in its Team sent, under [Mission properties](../../mechanics/missions.md#mission-properties) in Missions; the number of Agents [Killed](../../mechanics/agents-spec.md#agent-statuses); the number of Agents of its Team sent whose [Assignment](../../mechanics/domain-model.md#agency-and-agents) is now [Recovery](../../mechanics/agents-spec.md#assignments); the [Enemies](../../mechanics/domain-model.md#combat) dead out of the Enemies present; the [Consequences](../../mechanics/missions.md#consequences) that applied, e.g. money, funding, a [Panic](../../mechanics/domain-model.md#campaign-standing) reduction, and a Faction made [Eliminated](../../mechanics/domain-model.md#factions); and a Combat report button. The card names no [Agent](../../mechanics/domain-model.md#agency-and-agents): the counts are enough to tell how the Mission went, and the Combat report names each participant.
2. **Investigations completed:** each [Investigation](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) under [Turn report](../../mechanics/investigations.md#turn-report) in Investigations, with its [Lead](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions)'s `name`, the number of [Turns](../../foundation/engine-contract.md#player-actions-and-turns) from its Turn started to the Turn the Advance turn ended, its final [Investigation progress](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), its Lead's [Required progress range](../../mechanics/investigations.md#glossary), its [Progress bar](../gui.md#glossary), and the Mission site its completion created, if any.
3. **New Mission sites:** each Mission site created, under [Turn report](../../mechanics/missions.md#turn-report) in Missions, with its MissionSiteArchetype's `name`, its kind, its origin, i.e. the Lead of its origin Investigation or its target Faction, its number of Enemies, and its Turns until expiration.
4. **Mission sites ended:** each Mission site that became Expired or Cancelled, under the same Turn report section, with its MissionSiteArchetype's `name`, its kind, the lifecycle state it reached, and, for an Expired one, its [Consequences](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions).
5. **Leads discovered:** each Lead under [Turn report](../../mechanics/leads-and-progression.md#turn-report) in Leads and Progression, with its `name` only. Its Required progress range is left out: a Lead discovered in the Advance turn had no Investigation before it, and Assessment happens only in an Advance turn, so the Lead is not an [Assessed Lead](../../mechanics/investigations.md#glossary) until the next Advance turn, even when the Turn summary is reopened, and the range would always be unknown here. The [Leads View](leads-view.md) shows the range once the Lead is an Assessed Lead.

# Showing and dismissing

The Player dismisses the Turn summary with one action, and it offers to open the full Turn report, which, like a Combat report button, keeps the Turn summary at the start of the [View trail](campaign-screen.md#view-trail). It is not shown after loading a [Campaign save](../../foundation/engine-contract.md#persisted-data), after undo, redo, or other [Timeline](../../foundation/timeline.md) navigation, nor for an Advance turn that [Autopilot](../../foundation/engine-contract.md#autopilot) requested, so that a long run of Advance turns does not open one Turn summary for each.

The Player reopens the Turn summary from the [Turn Report View](turn-report-view.md), whenever the Turn report it shows has an item for at least one group under [Groups](#groups), including after loading a Campaign save or after [Timeline](../../foundation/engine-contract.md#persisted-data) navigation. A reopened Turn summary reads the current Committed state as it does when first shown, so an item read from it, e.g. the Agents whose Assignment is now Recovery, shows its current value, not its value when the Advance turn ended.

# Mission cards

Each Mission is a card, so that the outcome of a Mission reads apart from the lists around it. The card is an item that takes more than one line, under [Panels and cards](../visual-design.md#panels-and-cards) in Visual Design: its first line holds its Mission site's name, kind, and target Faction, with the outcome as its value. Its outcome is in Positive for Won or Danger for Lost, its number of [Killed](../../mechanics/agents-spec.md#agent-statuses) Agents is in Danger when above 0, its number of Agents sent to [Recovery](../../mechanics/agents-spec.md#assignments) is in Accent text when above 0, and its Consequences are coloured under [Consequences](../visual-design.md#consequences) in Visual Design.

The Combat report button, a neutral button at the end of the card, opens the [Turn Report View](turn-report-view.md) with that Mission's Combat report shown one step away, under [Combat report](turn-report-view.md#combat-report) in Turn Report View, and closes the Turn summary. The Turn summary stays at the start of the [View trail](campaign-screen.md#view-trail) in Campaign Screen, so the Escape key, the [Back control](../gui.md#glossary), and the close control of the Turn Report View all bring the Turn summary back, and the Player can open the Combat report of the next Mission from it.

# Artboard

![Turn summary panel Artboard: the dialog alone, listing a Won Mission with its numbers of Killed Agents and Agents sent to Recovery, its Consequences coloured by whom they favour, and its Combat report button; a completed Investigation with a Progress bar marking the progress before the last Advance turn, the gain that completed it, and a check where it completed; new Mission sites; an Expired Mission site; and a discovered Lead, with Open Turn report and Continue buttons](../../../../images/artboards/turn-summary.png)

The following appear only on the [Artboard](../visual-design.md#glossary) and must not be implemented, under [Reading Artboards](../visual-design.md#reading-artboards) in Visual Design:

- The layout inside each Mission card below its first line, and the labels of the buttons, e.g. "Continue", "Open Turn report", and "Combat report".
- The sample values, e.g. the Mission site names and the numbers.
