# Turn Summary

| Metadata    | Value                                                                                                                                                                            |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | TSUM                                                                                                                                                                             |
| Family      | UI                                                                                                                                                                               |
| Audience    | UI designer, Implementer                                                                                                                                                         |
| Owns        | When the Turn summary dialog of the Campaign screen appears and what it shows.                                                                                                   |
| Conventions | [Specification Conventions](../../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../../governance/conventions/design-spec-conventions.md) |

# Overview

The Turn summary tells the Player, once, what an Advance turn did that the Player must know before going on, so that a
won Mission or a new Mission site is not missed in the full Turn report. It is a dialog over the
[Campaign Screen](campaign-screen.md), styled under [Dialogs](../visual-design.md#dialogs) in Visual Design.

# Glossary

These terms are specific to the Turn Summary.

| Term         | Definition                                                                                                                                    |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Turn summary | The dialog that summarizes what an Advance turn did, shown after it only when it did something the Player must know, under [Groups](#groups). |

# Groups

After an Advance turn that the Player requested through the GUI is committed, the GUI shows the Turn summary when that
Advance turn did at least one thing listed below, and shows nothing otherwise. It reads every item from the
[Turn report](../../foundation/world-history.md#glossary) and the current [Committed state](../../foundation/engine-contract.md#player-actions-and-turns). Its groups follow in this order, each left out when empty; the
list is exhaustive.

1. **Missions:** for each [Combat report](../../mechanics/domain-model.md#combat) of the Turn report, its [Mission](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions)'s [Mission site](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) with its
   MissionSiteArchetype's `name`, kind, and target [Faction](../../mechanics/domain-model.md#factions); whether the Mission is Won or Lost, with the
   [Combat outcome](../../mechanics/combat.md#combat-rounds-and-results); the number of Agents in its Team sent, under [Mission properties](../../mechanics/missions.md#mission-properties) in Missions; the Agents
   [Killed](../../mechanics/agents-spec.md#agent-statuses); the Agents of its Team sent whose [Assignment](../../mechanics/domain-model.md#agency-and-agents) is now [Recovery](../../mechanics/agents-spec.md#assignments); the [Enemies](../../mechanics/domain-model.md#combat) dead out of the
   Enemies present; and the [Consequences](../../mechanics/missions.md#consequences) that applied, e.g. money, funding, a [Panic](../../mechanics/domain-model.md#campaign-standing) reduction, and a
   Faction made [Eliminated](../../mechanics/domain-model.md#factions).
2. **Investigations completed:** each [Investigation](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) under [Turn report](../../mechanics/investigations.md#turn-report) in Investigations, with its
   [Lead](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions)'s `name`, the number of [Turns](../../foundation/engine-contract.md#player-actions-and-turns) from its Turn started to the Turn the Advance turn ended, its final [Investigation
   progress](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), its Lead's [Required progress range](../../mechanics/investigations.md#glossary), its [Progress bar](../gui.md#glossary), and the Mission site its completion created, if any.
3. **New Mission sites:** each Mission site created, under [Turn report](../../mechanics/missions.md#turn-report) in Missions, with its
   MissionSiteArchetype's `name`, its kind, its origin, i.e. the Lead of its origin Investigation or its target
   Faction, its number of Enemies, and its Turns until expiration.
4. **Mission sites ended:** each Mission site that became Expired or Cancelled, under the same Turn report section, with
   its MissionSiteArchetype's `name`, its kind, the lifecycle state it reached, and, for an Expired one, its
   [Consequences](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions).
5. **Leads discovered:** each Lead under [Turn report](../../mechanics/leads-and-progression.md#turn-report) in Leads and Progression, with its Required
   progress range when it is an [Assessed Lead](../../mechanics/investigations.md#glossary), and otherwise that the range is unknown.

# Showing and dismissing

The Player dismisses the Turn summary with one action, and it offers to open the full Turn report. It is not shown
after loading a [Campaign save](../../foundation/engine-contract.md#persisted-data), after undo, redo, or other [Timeline](../../foundation/timeline.md) navigation, nor for an Advance turn that
[Autopilot](../../foundation/engine-contract.md#autopilot) requested, so that a long run of Advance turns does not open one Turn summary for each.

# Mission cards

Each Mission is a card, so that the outcome of a Mission reads apart from the lists around it. Its outcome is in
Positive for Won or Danger for Lost, its [Killed](../../mechanics/agents-spec.md#agent-statuses) Agents are in Danger, and its Agents sent to [Recovery](../../mechanics/agents-spec.md#assignments) are in Accent
text.

# Artboard

![Turn summary panel Artboard: the dialog alone, listing a Won Mission with its Killed Agents, Agents sent to Recovery, and Consequences; a completed Investigation with a Progress bar marking the progress before the last Advance turn, the gain that completed it, and a check where it completed; new Mission sites; an Expired Mission site; and a discovered Lead, with Open Turn report and Continue buttons](../../../../images/artboards/turn-summary.png)

The following appear only on the [Artboard](../visual-design.md#glossary) and must not be implemented, under
[Reading Artboards](../visual-design.md#reading-artboards) in Visual Design:

- The layout inside each Mission card, and the labels of the buttons, e.g. "Continue" and "Open Turn report".
- The sample values, e.g. the Mission site names and the Agent IDs.
