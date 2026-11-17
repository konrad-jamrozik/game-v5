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
searching for. It is compact by design: each item takes one line that says what the item is and the one thing the
Player must know about it now, and every other detail is in the Detail view that the item opens. It sits in the
[Side panel](../gui.md#glossary) of the [Campaign Screen](campaign-screen.md), below the navigation, and is styled as a panel that lists
groups, under [Panels and cards](../visual-design.md#panels-and-cards) in Visual Design.

# Glossary

These terms are specific to the Situation Panel.

| Term            | Definition                                                                                                                                                                             |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Situation panel | The panel of the [Campaign](../../foundation/core-concepts.md#campaign-and-session) screen that lists the work under way and the work waiting for the Player, under [Groups](#groups). |

# Groups

The Situation panel is in view on the Campaign screen whether or not a [Detail view](../gui.md#glossary) is open. It
shows the following groups in this order, each with the number of its items. A group with nothing to show is left out,
and when every group is left out the panel says that nothing needs attention. Each item is one line; a name too long
for the line is shortened with an ellipsis. The list is exhaustive.

1. **Active [Mission sites](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions):** each Mission site whose lifecycle state is Active, under
   [Mission site lifecycle](../../mechanics/missions.md#mission-site-lifecycle) in Missions, with its [MissionSiteArchetype](../../mechanics/missions.md#missionsitearchetype)'s `name` and its [Turns](../../foundation/engine-contract.md#player-actions-and-turns) until expiration,
   under [Mission site properties](../../mechanics/missions.md#mission-site-properties) in Missions, e.g. "Foil sabotage 1 T left".
2. **Active Investigations:** one item for each [Investigation](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) whose lifecycle state is Active, under
   [Investigation lifecycle](../../mechanics/investigations.md#investigation-lifecycle) in Investigations, with its [Lead](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions)'s `name`, its [Progress circle](../gui.md#glossary), and its
   [Completion estimate](../gui.md#glossary), e.g. "Apprehend Red Dawn member ◔ ETA 3–5 T".
3. **Leads to investigate:** each [Discovered Lead](../../mechanics/leads-and-progression.md#glossary) whose [Lead status](../../mechanics/leads-and-progression.md#lead-status) is Available and that has no Active
   Investigation, with its `name` only.
4. **Agents:** one line with the number of [Serving](../../mechanics/agents-spec.md#agent-statuses) Agents whose [Assignment](../../mechanics/domain-model.md#agency-and-agents) is [Standby](../../mechanics/agents-spec.md#assignments), and the number of free
   [Training](../../mechanics/agents-spec.md#assignments) places, i.e. the [Training cap](../../mechanics/economy-and-upgrades.md#glossary) minus the Agents counted against it, e.g. "4 on Standby · 2 Training
   places free". Each of the two parts is left out when its number is 0, and the group is left out when both are; the
   count of the group is the number of Serving Agents.

Selecting an item opens the Detail view that details it with that item selected: a Mission site opens Missions, an
Investigation or a Lead opens Leads, and the Agents line opens Agents.

# Artboard

![Situation panel Artboard in the Field HUD direction: one-line items grouped as Active Mission sites with their Turns until expiration, one urgent; Active Investigations with a Progress circle and a Completion estimate, one that may complete any turn and one not yet assessed; a Lead to investigate; and the Agents line](../../../../images/artboards/situation-panel.png)

The sample values, e.g. the Lead names and the numbers of Agents, appear only on the Artboard, under
[Reading Artboards](../visual-design.md#reading-artboards) in Visual Design.
