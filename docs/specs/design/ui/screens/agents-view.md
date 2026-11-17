# Agents View

| Metadata    | Value                                                                                                                                                                            |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | AVIEW                                                                                                                                                                            |
| Family      | UI                                                                                                                                                                               |
| Audience    | UI designer, Implementer                                                                                                                                                         |
| Owns        | What the Agents View of the Campaign screen shows and how it hires, dismisses, and assigns Agents.                                                                               |
| Conventions | [Specification conventions](../../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../../governance/conventions/design-spec-conventions.md) |

# Overview

The Agents View is where the Player manages the roster: who serves, what each [Agent](../../mechanics/domain-model.md#agency-and-agents) is doing, and how fit each is for
the next task. It is the third of the Operations [Detail views](../gui.md#glossary) of the
[Campaign Screen](campaign-screen.md). Unlike the [Missions View](missions-view.md) and the [Leads View](leads-view.md),
it is one table, because the Player compares Agents with one another and acts on several at once.

# Header

The header shows the number of [Serving](../../mechanics/agents-spec.md#agent-statuses) Agents against the [Agent cap](../../mechanics/domain-model.md#agency-and-agents) and the number of Agents counted against
the [Training cap](../../mechanics/economy-and-upgrades.md#glossary) against that cap, e.g. "Agents 10 / 12 · Training 2 / 3", and these buttons, in this order:

1. **Hire,** labelled with `hire_cost`, which makes one `hireAgent` [Player action](../../foundation/engine-contract.md#player-actions-and-turns), under [Hiring Agents](../../mechanics/economy-and-upgrades.md#hiring-agents) in
   Economy and Upgrades.
2. **Standby,** **[Contracting](../../mechanics/agents-spec.md#assignments),** and **[Training](../../mechanics/agents-spec.md#assignments),** each of which makes one `assignAgents` with the selected Agents and
   that [Assignment](../../mechanics/domain-model.md#agency-and-agents), under [Assigning Agents](../../mechanics/agents-spec.md#assigning-agents) in Agents, after the confirmation under
   [Confirming interrupted Assignments](../gui.md#confirming-interrupted-assignments) in the GUI when it applies.
3. **Dismiss,** a destructive button, which makes one `dismissAgents` with the selected Agents, under
   [Dismissing Agents](../../mechanics/economy-and-upgrades.md#dismissing-agents) in Economy and Upgrades, after the Player confirms the Agents it names.

A button is disabled when the Player action it makes would be rejected with the current selection, e.g. Hire while
money is below `hire_cost` or the Agent cap is reached, and Dismiss while a selected Agent is not on [Standby](../../mechanics/agents-spec.md#assignments) and
[At assignment](../../mechanics/domain-model.md#agency-and-agents).

# Agent table

The table lists one row per Serving [Agent](../../mechanics/domain-model.md#agency-and-agents), by [Instance ID](../../foundation/campaign-instances.md#glossary), under [Tables](../visual-design.md#tables) in Visual Design,
with a selection checkbox and these columns in this order: Instance ID, [effective skill](../../mechanics/agents-spec.md#combatant-attributes), [base skill](../../mechanics/agents-spec.md#combatant-attributes), [current health](../../mechanics/agents-spec.md#combatant-attributes)
against [base health](../../mechanics/agents-spec.md#combatant-attributes), [exhaustion](../../mechanics/agents-spec.md#combatant-attributes), [base weapon damage](../../mechanics/agents-spec.md#combatant-attributes), and Assignment with its [Agent status](../../mechanics/agents-spec.md#agent-statuses). An Assignment to an
[Investigation](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) or a [Mission](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) names its [Lead](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) or [Mission site](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), and an Agent [In transit](../../mechanics/domain-model.md#agency-and-agents) says so, e.g.
"Contracting · In transit". An Agent that is not [Fit for work](../../mechanics/agents-spec.md#assignments) shows its exhaustion in Accent text.

Two filters above the table switch between all Serving Agents and the Agents that can be assigned, under
[Agents that can be assigned](../../mechanics/agents-spec.md#agents-that-can-be-assigned) in Agents, each with its count. A checkbox is disabled for an Agent that no button can act on, e.g. a
Deployed Agent.

# Agent details

Selecting an Agent's Instance ID opens its details one step away, in place of the table, with a control that returns
to it: its AgentArchetype's `name`, its [Turn](../../foundation/engine-contract.md#player-actions-and-turns) hired, its Weapon, and its
[Participation history](../../mechanics/domain-model.md#agency-and-agents), each Investigation or Mission by its Lead or Mission site and its outcome.

# Artboard

![Agents View panel Artboard in the Field HUD direction: the header with Agent and Training counts and the Hire, Standby, Contracting, Training, and Dismiss buttons above the table of Serving Agents with their skill, health, exhaustion, weapon damage, and Assignment](../../../../images/artboards/agents-view.png)

The sample values, e.g. the Agent IDs and their values, appear only on the Artboard, under
[Reading Artboards](../visual-design.md#reading-artboards) in Visual Design.
