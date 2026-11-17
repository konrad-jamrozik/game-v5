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
the [Training cap](../../mechanics/economy-and-upgrades.md#glossary) against that cap, e.g. "Agents 10 / 12 · Training 2 / 3", with the counts on the baseline of the title, under
[Alignment](../visual-design.md#alignment) in Visual Design, and these controls, in this order:

1. **Hire,** labelled with `hire_cost`, which makes one `hireAgent` [Player action](../../foundation/engine-contract.md#player-actions-and-turns), under [Hiring Agents](../../mechanics/economy-and-upgrades.md#hiring-agents) in
   Economy and Upgrades.
2. **Assign to,** a group under that label holding the buttons **[Standby](../../mechanics/agents-spec.md#assignments),** **[Contracting](../../mechanics/agents-spec.md#assignments),** and **[Training](../../mechanics/agents-spec.md#assignments),** each
   followed by its selection filter, and then the **Allow re-assigning** checkbox. Each button makes one `assignAgents`
   with the selected Agents and that [Assignment](../../mechanics/domain-model.md#agency-and-agents), under [Assigning Agents](../../mechanics/agents-spec.md#assigning-agents) in Agents.
3. **Dismiss,** a destructive button, which makes one `dismissAgents` with the selected Agents, under
   [Dismissing Agents](../../mechanics/economy-and-upgrades.md#dismissing-agents) in Economy and Upgrades, after the Player confirms the Agents it names.

A button is enabled only when pressing it would succeed with the current selection, and is disabled otherwise. It
would succeed when the engine would accept the Player action it makes, e.g. Hire is disabled while money is below
`hire_cost` or the Agent cap is reached, and Dismiss while a selected Agent is not on Standby and
[At assignment](../../mechanics/domain-model.md#agency-and-agents).

## Re-assigning

Re-assigning is changing the Assignment of an [Agent](../../mechanics/domain-model.md#agency-and-agents) that is on Contracting or an [Investigation](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), or that is [In transit](../../mechanics/domain-model.md#agency-and-agents).
From Contracting or an Investigation it interrupts the Agent's work and costs it an Advance turn In transit; an Agent
already In transit stays In transit toward its new Assignment and arrives when it would have arrived, under
[Transit rule](../../mechanics/agents-spec.md#transit-rule) in Agents. A button of Assign to whose `assignAgents` would re-assign a selected Agent
does not succeed, and is disabled, while Allow re-assigning is unchecked, even when the engine would accept the
action. E.g., with agent-1 on Contracting and agent-5 on Standby selected, Training is disabled until Allow
re-assigning is checked, and with agent-5 alone selected it is enabled. Moving an Agent [At assignment](../../mechanics/domain-model.md#agency-and-agents) between Standby
and Training is not re-assigning.

Allow re-assigning is unchecked whenever the Agents View opens. Checking it is the Player's deliberate consent to
interrupt work, so a button of Assign to makes its Player action at once, without the confirmation under
[Confirming interrupted Assignments](../gui.md#confirming-interrupted-assignments) in the GUI.

# Filters

The Agents View has two kinds of filter: one decides which Agents the table shows, and the other decides which of the
shown Agents can be selected.

## Row filters

At the right of the title row, a group labelled "Show agents" holds three filters, each with its count, of which
exactly one is on at a time. All is on whenever the Agents View opens. The filters sit level with the close control,
with their Label above them, under [Alignment](../visual-design.md#alignment) in Visual Design.

- **All:** every Serving Agent.
- **Assignable:** every Serving Agent that can be assigned, under [Agents that can be assigned](../../mechanics/agents-spec.md#agents-that-can-be-assigned) in Agents, and is
  [Fit for work](../../mechanics/agents-spec.md#assignments), including the Agents that only re-assigning can move. It leaves out e.g. a Deployed Agent, a Recovering
  Agent, an Agent In transit to Recovery, and an Agent too exhausted to start work.
- **Memorial:** every [Terminated](../../mechanics/agents-spec.md#agent-statuses) Agent, under [Memorial](#memorial).

## Selection filters

The selection filter after each button of Assign to is a square button holding a funnel icon, drawn as on while it is
on. At most one is on at a time: turning one on turns off the one that was on, and pressing the one that is on turns
it off. While one is on, the table keeps showing every Agent its row filter shows, but only the Agents that its button
would succeed with if that Agent alone were selected can be selected, under [Re-assigning](#re-assigning). E.g., with
Allow re-assigning unchecked, the Contracting selection filter leaves selectable only the Agents on Standby or Training,
At assignment, that are Fit for work.

While no selection filter is on, an Agent can be selected when at least one button of Assign to or Dismiss would succeed
with that Agent alone. So, with Allow re-assigning unchecked, an Agent on Contracting or In transit cannot be selected.

Whenever the selection filter, Allow re-assigning, the row filter, or the [Committed state](../../foundation/engine-contract.md#player-actions-and-turns) changes, every selected Agent
that can no longer be selected, or is no longer shown, is no longer selected. A row does not leave the table because
its Agent was just assigned: e.g., after assigning the selected Agents to Contracting with the Contracting selection
filter on, their rows stay, muted, with "On assignment" or "In transit" as their reason.

# Agent table

The table lists one row per Serving [Agent](../../mechanics/domain-model.md#agency-and-agents) that the row filter shows, by [Instance ID](../../foundation/campaign-instances.md#glossary), under [Tables](../visual-design.md#tables) in Visual Design,
with a selection checkbox and these columns in this order: Instance ID, [effective skill](../../mechanics/agents-spec.md#combatant-attributes), [base skill](../../mechanics/agents-spec.md#combatant-attributes), [current health](../../mechanics/agents-spec.md#combatant-attributes)
against [base health](../../mechanics/agents-spec.md#combatant-attributes), [exhaustion](../../mechanics/agents-spec.md#combatant-attributes), [base weapon damage](../../mechanics/agents-spec.md#combatant-attributes), Assignment with its [Agent status](../../mechanics/agents-spec.md#agent-statuses), and reason. An Assignment to an
Investigation or a [Mission](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) names its [Lead](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) or [Mission site](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), and an Agent In transit says so, e.g.
"Contracting · In transit". Current health and exhaustion take their colours under
[Agent condition](../visual-design.md#agent-condition) in Visual Design. Its default order is by Instance ID, and pressing a column header sorts it by that column, under [Tables](../visual-design.md#tables) in Visual Design.

A row whose Agent cannot be selected, under [Filters](#filters), has its checkbox disabled and its text in Text muted,
except the colours of current health and exhaustion. Its reason says why, as the first of these that applies; the
reason of a row that can be selected is empty:

1. **Deployed:** its Assignment is [Deployed](../../mechanics/agents-spec.md#assignments).
2. **Recovering:** its Assignment is [Recovery](../../mechanics/agents-spec.md#assignments), whether it is [Recovering](../../mechanics/agents-spec.md#agent-statuses) or In transit.
3. **In transit:** it is In transit and Allow re-assigning is unchecked.
4. **On assignment:** it is on Contracting or an Investigation and Allow re-assigning is unchecked.
5. **Already on Standby, Contracting, or Training:** the selection filter that is on is for the Assignment it has.
6. **Too exhausted:** it is not Fit for work and the selection filter that is on is for Contracting or Training.
7. **Training full:** the Training selection filter is on and the [Training cap](../../mechanics/economy-and-upgrades.md#glossary) has no place left.
8. **Otherwise:** the message of the engine's rejection, e.g. of `dismissAgents`.

# Memorial

The Memorial remembers the Agents who have left the [Agency](../../mechanics/domain-model.md#agency-and-agents) and how their service ended. While the Memorial filter is
on, the table lists one row per Terminated Agent, as `getHistory()` returns it under
[Current state, Turn report, and history](../../foundation/world-history.md#current-state-turn-report-and-history) in World History, newest [Turn](../../foundation/engine-contract.md#player-actions-and-turns) terminated first and then by
Instance ID, which is its default order, and pressing a column header sorts it by that column, under Tables in Visual
Design. Its rows have no selection checkbox, and the buttons
and selection filters of Assign to and Dismiss are disabled, because no Player action acts on a Terminated Agent. Its
columns, in this order, are:

- **Instance ID,** **base skill,** and **base health.**
- **Turn terminated.**
- **Cause:** the [Agent status](../../mechanics/domain-model.md#agency-and-agents), [Killed](../../mechanics/agents-spec.md#agent-statuses) in Danger text or [Dismissed](../../mechanics/agents-spec.md#agent-statuses) in Text muted.
- **Missions:** the number of Missions in its [Participation history](../../mechanics/domain-model.md#agency-and-agents).
- **Turns with the Agency,** headed Turns: its Turn terminated minus its Turn hired.
- **Enemies killed,** headed Kills: its Enemies killed, under [Service record](../../mechanics/agents-spec.md#service-record) in Agents.
- **Details:** how its service ended. A Killed Agent's details name the [Enemy](../../mechanics/domain-model.md#combat) and the Mission site that its
  Killed by references, each by its Instance ID and its [Archetype](../../foundation/core-concepts.md#campaign-instances)'s `name`, e.g. "Killed by enemy-7, Initiate, at
  mission-site-5, Apprehend member"; a Dismissed Agent's say "Dismissed".

# Agent details

Selecting an Agent's Instance ID, in the table of Serving Agents or in the Memorial, opens its details one step away,
in place of the table, with a control that returns to it: its AgentArchetype's `name`, its [Turn](../../foundation/engine-contract.md#player-actions-and-turns) hired, its Weapon, and its
[Participation history](../../mechanics/domain-model.md#agency-and-agents), each Investigation or Mission by its Lead or Mission site and its outcome.

# Artboard

![Agents View panel Artboard: the header with Agent and Training counts, the Hire button, the Assign to group of Standby, Contracting, and Training buttons each with its selection filter and the Allow re-assigning checkbox, and the Dismiss button; the Show agents filters All, Assignable, and Memorial; and the table of Serving Agents with a Select all checkbox, their skill, colour-coded health and exhaustion, weapon damage, Assignment, and the reason a muted row cannot be selected](../../../../images/artboards/agents-view.png)

![Agents View Memorial panel Artboard: the Memorial filter on, the Assign to group and Dismiss disabled, and the table of Terminated Agents with base skill, base health, Turn terminated, cause, Missions, Turns with the Agency, Enemies killed, and details of how each Agent's service ended](../../../../images/artboards/agents-memorial.png)

The Agents View shows its [Background artwork](../visual-design.md#background-artwork), Agents in an equipment room,
behind its content, as both [Artboards](../visual-design.md#glossary) show.

The sample values, e.g. the Agent IDs and their values, appear only on the Artboard, under
[Reading Artboards](../visual-design.md#reading-artboards) in Visual Design.
