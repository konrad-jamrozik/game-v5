# Situation Panel

| Metadata | Value |
| --- | --- |
| Spec ID | SITP |
| Family | UI |
| Audience | UI designer, Implementer |
| Owns | What the Situation panel of the Campaign screen shows. |
| Conventions | [Specification Conventions](../../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../../governance/conventions/design-spec-conventions.md) |

# Overview

The Situation panel keeps the work under way and the work waiting for the Player in view, so that nothing needs searching for. It is compact by design: each item takes one line that says what the item is and the one thing the Player must know about it now, and every other detail is in the Detail view that the item opens. It sits in the [Side panel](../gui.md#glossary) of the [Campaign Screen](campaign-screen.md), below the navigation, and is styled as a panel that lists groups, under [Panels and cards](../visual-design.md#panels-and-cards) in Visual Design.

# Glossary

These terms are specific to the Situation Panel.

| Term | Definition |
| --- | --- |
| Situation panel | The panel of the [Campaign](../../foundation/core-concepts.md#campaign-and-session) screen that lists the work under way and the work waiting for the Player, under [Groups](#groups). |

# Groups

The Situation panel is in view on the Campaign screen whether or not a [Detail view](../gui.md#glossary) is open. It shows the following groups in this order, each with the number of its items. A group with nothing to show is left out, and when every group is left out the panel says that nothing needs attention. Each item is one line; a name too long for the line is shortened with an ellipsis. The list is exhaustive.

1. **Agents:** one line with the number of [Serving](../../mechanics/agents-spec.md#agent-statuses) Agents whose [Assignment](../../mechanics/domain-model.md#agency-and-agents) is [Standby](../../mechanics/agents-spec.md#assignments), and the number of free [Training](../../mechanics/agents-spec.md#assignments) places, i.e. the [Training cap](../../mechanics/economy-and-upgrades.md#glossary) minus the Agents counted against it, e.g. "4 on Standby · 2 Training places free". Each of the two parts is left out when its number is 0, and the group is left out when both are; the count of the group is the number of Serving Agents.
2. **[Mission sites](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions):** first each Mission site whose lifecycle state is Active, under [Mission site lifecycle](../../mechanics/missions.md#mission-site-lifecycle) in Missions, soonest to expire first, with its [MissionSiteArchetype](../../mechanics/missions.md#missionsitearchetype)'s `name` and its [Turns](../../foundation/engine-contract.md#player-actions-and-turns) until expiration, under [Mission site properties](../../mechanics/missions.md#mission-site-properties) in Missions, e.g. "Foil sabotage 3 T left"; then each Mission site that became Expired or Cancelled in the most recent Advance turn, under [Turn report](../../mechanics/missions.md#turn-report) in Missions, with its MissionSiteArchetype's `name` and the lifecycle state it reached, e.g. "Foil sabotage Expired". The count of the group is the number of Active Mission sites, because only they wait for a decision. The items are coloured under Mission site urgency.
3. **Active Investigations:** one item for each [Investigation](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) whose lifecycle state is Active, under [Investigation lifecycle](../../mechanics/investigations.md#investigation-lifecycle) in Investigations, with its [Lead](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions)'s `name`, its [Progress circle](../gui.md#glossary), and its [Completion estimate](../gui.md#glossary), e.g. "Apprehend Red Dawn member ◔ ETA 3–5 T".

Selecting an item opens the Detail view that details it with that item selected: a Mission site opens Missions, an Investigation opens Leads, and the Agents line opens Agents. An Expired or Cancelled Mission site opens the [Missions View](missions-view.md) with its toggle on Concluded, under [Mission site list](missions-view.md#mission-site-list) in Missions View.

## Mission site urgency

A Mission site about to be lost and one just lost stand out from the rest of the group, so that the Player sees the first in time to deploy to it, and learns of the second here, because an Advance turn whose only news is an Expired Mission site opens no dialog after it.

- **Expires next:** an Active Mission site whose Turns until expiration is 1, which becomes Expired in the next Advance turn unless a team is deployed to it, is in Warning, under [Colours](../visual-design.md#colours) in Visual Design, with the warning-triangle icon of [Agent condition](../visual-design.md#agent-condition) in Visual Design before its Turns until expiration, e.g. "Foil sabotage ⚠ 1 T left".
- **Just lost:** a Mission site that became Expired or Cancelled in the most recent Advance turn is in Danger deep and struck through, name and lifecycle state alike, with a prohibition icon, a circle crossed by a diagonal like 🚫, outlined in Danger, in place of the warning triangle, e.g. "~~Foil sabotage~~ 🚫 ~~Expired~~". It is listed until the next Advance turn, and the next Advance turn leaves it out.
- **Other:** every other Active Mission site is drawn as any other item of the panel.

# Artboard

![Situation panel Artboard: one-line items grouped as the Agents line first; Mission sites with their Turns until expiration, one that Expires next in Warning with the warning triangle, and one Expired in the last Advance turn struck through in Danger deep with the prohibition icon; and Active Investigations with a Progress circle and a Completion estimate, one that may complete any turn and one not yet assessed](../../../../images/artboards/situation-panel.png)

The sample values, e.g. the Mission site and Lead names and the numbers of Agents, appear only on the Artboard, under [Reading Artboards](../visual-design.md#reading-artboards) in Visual Design.
