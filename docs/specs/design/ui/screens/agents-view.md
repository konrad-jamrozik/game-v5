# Agents View

| Metadata    | Value                                                                                                                                                                            |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | AVIEW                                                                                                                                                                            |
| Family      | UI                                                                                                                                                                               |
| Audience    | UI designer, Implementer                                                                                                                                                         |
| Owns        | What the Agents View of the Campaign screen shows and how it hires, dismisses, and assigns Agents.                                                                               |
| Conventions | [Specification Conventions](../../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../../governance/conventions/design-spec-conventions.md) |

# Overview

The Agents View is where the Player manages the roster: who serves, what each [Agent](../../mechanics/domain-model.md#agency-and-agents) is doing, and how fit each is for
the next task. It is the third of the Operations [Detail views](../gui.md#glossary) of the
[Campaign Screen](campaign-screen.md). Unlike the [Missions View](missions-view.md) and the [Leads View](leads-view.md),
it is one table, because the Player compares Agents with one another and acts on several at once.

# Header

The header shows the number of [Serving](../../mechanics/agents-spec.md#agent-statuses) Agents against the [Agent cap](../../mechanics/domain-model.md#agency-and-agents) and the number of Agents counted against
the [Training cap](../../mechanics/economy-and-upgrades.md#glossary) against that cap, e.g. "Agents 10 / 12 · Training 2 / 3", and these controls, in this order:

1. **Hire,** labelled with `hire_cost`, which makes one `hireAgent` [Player action](../../foundation/engine-contract.md#player-actions-and-turns), under [Hiring Agents](../../mechanics/economy-and-upgrades.md#hiring-agents) in
   Economy and Upgrades.
2. **Assign to,** a group under that label holding the buttons **[Standby](../../mechanics/agents-spec.md#assignments),** **[Contracting](../../mechanics/agents-spec.md#assignments),** and **[Training](../../mechanics/agents-spec.md#assignments),** each
   followed by its filter toggle, and then the **Allow re-assigning** checkbox. Each button makes one `assignAgents` with
   the selected Agents and that [Assignment](../../mechanics/domain-model.md#agency-and-agents), under [Assigning Agents](../../mechanics/agents-spec.md#assigning-agents) in Agents.
3. **Dismiss,** a destructive button, which makes one `dismissAgents` with the selected Agents, under
   [Dismissing Agents](../../mechanics/economy-and-upgrades.md#dismissing-agents) in Economy and Upgrades, after the Player confirms the Agents it names.

A button is enabled only when pressing it would succeed with the current selection, and is disabled otherwise. It
would succeed when the engine would accept the Player action it makes, e.g. Hire is disabled while money is below
`hire_cost` or the Agent cap is reached, and Dismiss while a selected Agent is not on Standby and
[At assignment](../../mechanics/domain-model.md#agency-and-agents).

## Re-assigning

Re-assigning is changing the Assignment of an [Agent](../../mechanics/domain-model.md#agency-and-agents) on Contracting or an [Investigation](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), which interrupts its work
and costs it an Advance turn [In transit](../../mechanics/domain-model.md#agency-and-agents), under [Transit rule](../../mechanics/agents-spec.md#transit-rule) in Agents. A button of Assign to whose
`assignAgents` would re-assign a selected Agent does not succeed, and is disabled, while Allow re-assigning is
unchecked, even when the engine would accept the action. E.g., with agent-1 on Contracting and agent-5 on Standby
selected, Training is disabled until Allow re-assigning is checked, and with agent-5 alone selected it is enabled.
Moving an Agent between Standby and Training is not re-assigning.

Allow re-assigning is unchecked whenever the Agents View opens. Checking it is the Player's deliberate consent to
interrupt work, so a button of Assign to makes its Player action at once, without the confirmation under
[Confirming interrupted Assignments](../gui.md#confirming-interrupted-assignments) in the GUI.

# Agent filters

The filters decide which Agents the table shows. At the right of the title row, a group labelled "Show agents" holds
three filters, each with its count:

- **All:** every Serving Agent.
- **In Standby:** every Serving Agent whose Assignment is Standby, whether [At assignment](../../mechanics/domain-model.md#agency-and-agents) or In transit.
- **Memorial:** every [Terminated](../../mechanics/agents-spec.md#agent-statuses) Agent, under [Memorial](#memorial).

The filter toggle after each button of Assign to is a filter too: while it is on, the table shows only the Serving
Agents that the button would succeed with if that Agent alone were selected, under [Re-assigning](#re-assigning).
E.g., with Allow re-assigning unchecked, the Contracting toggle shows the Agents on Standby or Training that can be
assigned and are [Fit for work](../../mechanics/agents-spec.md#assignments). Each toggle is a square button holding a funnel icon, and is drawn as on while its
filter is on.

Exactly one of the six filters is on at a time: turning one on turns off the one that was on, and All is on whenever
the Agents View opens. A selected Agent that the newly chosen filter does not show is no longer selected.

# Agent table

The table lists one row per Serving [Agent](../../mechanics/domain-model.md#agency-and-agents) that the filter shows, by [Instance ID](../../foundation/campaign-instances.md#glossary), under [Tables](../visual-design.md#tables) in Visual Design,
with a selection checkbox and these columns in this order: Instance ID, [effective skill](../../mechanics/agents-spec.md#combatant-attributes), [base skill](../../mechanics/agents-spec.md#combatant-attributes), [current health](../../mechanics/agents-spec.md#combatant-attributes)
against [base health](../../mechanics/agents-spec.md#combatant-attributes), [exhaustion](../../mechanics/agents-spec.md#combatant-attributes), [base weapon damage](../../mechanics/agents-spec.md#combatant-attributes), and Assignment with its [Agent status](../../mechanics/agents-spec.md#agent-statuses). An Assignment to an
Investigation or a [Mission](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) names its [Lead](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) or [Mission site](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), and an Agent In transit says so, e.g.
"Contracting · In transit". An Agent that is not [Fit for work](../../mechanics/agents-spec.md#assignments) shows its exhaustion in Accent text.

A checkbox is disabled for an Agent that no button can act on even with Allow re-assigning checked, e.g. a
Deployed Agent.

# Memorial

The Memorial remembers the Agents who have left the [Agency](../../mechanics/domain-model.md#agency-and-agents) and how their service ended. While the Memorial filter is
on, the table lists one row per Terminated Agent, as `getHistory()` returns it under
[Current state, Turn report, and history](../../foundation/world-history.md#current-state-turn-report-and-history) in World History, newest [Turn](../../foundation/engine-contract.md#player-actions-and-turns) terminated first and then by
Instance ID. Its rows have no selection checkbox, and the buttons of Assign to and Dismiss are disabled, because no
Player action acts on a Terminated Agent. Its columns, in this order, are: Instance ID, base skill, base health, Turn
terminated, cause, and details.

- **Cause:** the [Agent status](../../mechanics/domain-model.md#agency-and-agents), [Killed](../../mechanics/agents-spec.md#agent-statuses) in Danger text or [Dismissed](../../mechanics/agents-spec.md#agent-statuses) in Text muted.
- **Details:** two lines: how the Agent's service ended, and below it, in Text secondary, its service in numbers.
  E.g., "Killed by enemy-7, Initiate, at mission-site-5, Apprehend member" over "3 Missions · 12 Turns with the
  Agency · 4 Enemies killed", or "Dismissed" over "0 Missions · 5 Turns with the Agency · 0 Enemies killed". A Killed
  Agent's first line names the [Enemy](../../mechanics/domain-model.md#combat) and the
  Mission site that its Killed by references, each by its Instance ID and its [Archetype](../../foundation/core-concepts.md#campaign-instances)'s `name`. Missions is the
  number of Missions in its [Participation history](../../mechanics/domain-model.md#agency-and-agents), Turns with the Agency is its Turn terminated minus its Turn hired,
  and Enemies killed is its Enemies killed, under [Service record](../../mechanics/agents-spec.md#service-record) in Agents.

# Agent details

Selecting an Agent's Instance ID, in the table of Serving Agents or in the Memorial, opens its details one step away,
in place of the table, with a control that returns to it: its AgentArchetype's `name`, its [Turn](../../foundation/engine-contract.md#player-actions-and-turns) hired, its Weapon, and its
[Participation history](../../mechanics/domain-model.md#agency-and-agents), each Investigation or Mission by its Lead or Mission site and its outcome.

# Artboard

![Agents View panel Artboard: the header with Agent and Training counts, the Hire button, the Assign to group of Standby, Contracting, and Training buttons each with its filter toggle and the Allow re-assigning checkbox, and the Dismiss button; the Show agents filters All, In Standby, and Memorial; and the table of Serving Agents with their skill, health, exhaustion, weapon damage, and Assignment](../../../../images/artboards/agents-view.png)

![Agents View Memorial panel Artboard: the Memorial filter on, the Assign to group and Dismiss disabled, and the table of Terminated Agents with base skill, base health, Turn terminated, cause, and two-line details of how each Agent's service ended and its Missions, Turns with the Agency, and Enemies killed](../../../../images/artboards/agents-memorial.png)

The sample values, e.g. the Agent IDs and their values, appear only on the Artboard, under
[Reading Artboards](../visual-design.md#reading-artboards) in Visual Design.
