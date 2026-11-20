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
2. **Active [Mission sites](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions):** each Mission site whose lifecycle state is Active, under [Mission site lifecycle](../../mechanics/missions.md#mission-site-lifecycle) in Missions, with its [MissionSiteArchetype](../../mechanics/missions.md#missionsitearchetype)'s `name` and its [Turns](../../foundation/engine-contract.md#player-actions-and-turns) until expiration, under [Mission site properties](../../mechanics/missions.md#mission-site-properties) in Missions, e.g. "Foil sabotage 1 T left".
3. **Active Investigations:** one item for each [Investigation](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) whose lifecycle state is Active, under [Investigation lifecycle](../../mechanics/investigations.md#investigation-lifecycle) in Investigations, with its [Lead](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions)'s `name`, its [Progress circle](../gui.md#glossary), and its [Completion estimate](../gui.md#glossary), e.g. "Apprehend Red Dawn member ◔ ETA 3–5 T".
4. **Leads:** the [Discovered Leads](../../mechanics/leads-and-progression.md#glossary) whose [Lead status](../../mechanics/leads-and-progression.md#lead-status) is Available and that have no Active Investigation, each with its `name` only, under [Leads shown](#leads-shown). The count of the group is the number of all such Leads, however many of them it shows.

Selecting an item opens the Detail view that details it with that item selected: a Mission site opens Missions, an Investigation or a Lead opens Leads, and the Agents line opens Agents.

## Leads shown

The Leads group keeps the panel compact however many Leads wait, so it shows at most four lines and puts the newest Leads first, where the Player looks for what has just come in. Its Leads are ordered from the newest to the oldest by the [Turn](../../foundation/engine-contract.md#player-actions-and-turns) in which each was discovered, as the [History entries](../../foundation/world-history.md#glossary) record it under [Turn report](../../mechanics/leads-and-progression.md#turn-report) in Leads and Progression, and Leads discovered in the same Turn, or at campaign creation, in the authored order of the Lead [GDRs](../../foundation/core-concepts.md#game-build-and-content). A Lead discovered at campaign creation is older than every Lead discovered in a Turn.

- **Four or fewer Leads:** the group shows each of them, one line each, in that order.
- **More than four Leads:** the group shows the first three in that order, and a fourth line saying how many Leads it does not show, e.g. "5 more leads" when there are 8, in Text muted. Selecting that line opens the Leads View with its default selection, under [Lead list](leads-view.md#lead-list) in Leads View.

# Artboard

![Situation panel Artboard: one-line items grouped as the Agents line first; Active Mission sites with their Turns until expiration, one urgent; Active Investigations with a Progress circle and a Completion estimate, one that may complete any turn and one not yet assessed; and Leads, counting 8, with the three newest Leads and a muted line saying 5 more leads](../../../../images/artboards/situation-panel.png)

The sample values, e.g. the Lead names and the numbers of Agents, appear only on the Artboard, under [Reading Artboards](../visual-design.md#reading-artboards) in Visual Design.
