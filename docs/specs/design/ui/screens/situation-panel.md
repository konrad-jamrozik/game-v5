# Situation Panel

| Metadata    | Value                                                                                                                                                                            |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | SITP                                                                                                                                                                             |
| Family      | UI                                                                                                                                                                               |
| Audience    | UI designer, Implementer                                                                                                                                                         |
| Owns        | What the Situation panel of the Campaign screen shows.                                                                                                                           |
| Conventions | [Specification conventions](../../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../../governance/conventions/design-spec-conventions.md) |

# Overview

The Situation panel keeps the work under way and the work waiting for the Player in view, so that nothing needs
searching for. It heads the left column of the [Campaign Screen](campaign-screen.md), above the Agents panel, and is
styled as a panel that lists groups, under [Panels and cards](../visual-design.md#panels-and-cards) in Visual Design.

# Glossary

These terms are specific to the Situation Panel.

| Term            | Definition                                                                                                                                                                             |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Situation panel | The panel of the [Campaign](../../foundation/core-concepts.md#campaign-and-session) screen that lists the work under way and the work waiting for the Player, under [Groups](#groups). |

# Groups

The Situation panel is in view on the Campaign screen whichever tab is selected. It shows the following groups in this
order, each with the number of its items. A group with nothing to show is left out, and when every group is left out
the panel says that nothing needs attention. The list is exhaustive.

1. **Active Investigations:** one row for each [Investigation](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) whose lifecycle state is Active, under
   [Investigation lifecycle](../../mechanics/investigations.md#investigation-lifecycle) in Investigations, with its [Lead](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions)'s `name`, its [Investigation
   progress](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), its Lead's [Required progress range](../../mechanics/investigations.md#glossary) when the Lead is an [Assessed Lead](../../mechanics/investigations.md#glossary), its projected progress
   gain, under [Projected progress gain](../../mechanics/investigations.md#projected-progress-gain) in Investigations, its [Progress bar](../gui.md#glossary), the size of its
   [Current team](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) and how many of its members are [In transit](../../mechanics/domain-model.md#agency-and-agents), and the number of [Turns](../../foundation/engine-contract.md#player-actions-and-turns) since its Turn started.
2. **Leads to investigate:** each [Discovered Lead](../../mechanics/leads-and-progression.md#glossary) whose [Lead status](../../mechanics/leads-and-progression.md#lead-status) is Available and that has no Active
   Investigation, with its Required progress range when it is an Assessed Lead, and otherwise that the range is
   unknown. It has no Progress bar, because it has no progress.
3. **Active [Mission sites](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions):** each Mission site whose lifecycle state is Active, under
   [Mission site lifecycle](../../mechanics/missions.md#mission-site-lifecycle) in Missions, with its [MissionSiteArchetype](../../mechanics/missions.md#missionsitearchetype)'s `name`, its
   kind, its target [Faction](../../mechanics/domain-model.md#factions), and its Turns until expiration, under [Mission site properties](../../mechanics/missions.md#mission-site-properties) in Missions.
4. **Free [Training](../../mechanics/agents-spec.md#assignments) places:** the [Training cap](../../mechanics/economy-and-upgrades.md#glossary) minus the Agents counted against it, written against the
   Training cap, e.g. "1 / 3"; left out when no place is free.
5. **Agents on [Standby](../../mechanics/agents-spec.md#assignments):** the [Serving](../../mechanics/agents-spec.md#agent-statuses) Agents whose [Assignment](../../mechanics/domain-model.md#agency-and-agents) is Standby, by [Instance ID](../../foundation/campaign-instances.md#glossary).

Selecting a row shows that item where the Campaign screen details it, e.g. a Mission site row shows that Mission site.

# Artboard

![Situation panel Artboard in the Field HUD direction: groups for two Active Investigations with Progress bars, one with its required progress range marked and a preview of the next Turn's gain, one not yet assessed, a Lead to investigate with its required progress range, Active Mission sites with their Turns until expiration, free Training places, and Agents on Standby](../../../../images/artboards/situation-panel.png)

The sample values, e.g. the Lead names and the Agent IDs, appear only on the Artboard, under
[Reading Artboards](../visual-design.md#reading-artboards) in Visual Design.
