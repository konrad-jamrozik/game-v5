# Agents View

| Metadata | Value |
| --- | --- |
| Spec ID | AVIEW |
| Family | UI |
| Audience | UI designer, Implementer |
| Owns | What the Agents View of the Campaign screen shows and how it hires, dismisses, and assigns Agents. |
| Conventions | [Specification Conventions](../../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../../governance/conventions/design-spec-conventions.md) |

# Overview

The Agents View is where the Player manages the roster: who serves, what each [Agent](../../mechanics/domain-model.md#agency-and-agents) is doing, and how fit each is for the next task. It is the third of the Operations [Detail views](../gui.md#glossary) of the [Campaign Screen](campaign-screen.md). Unlike the [Missions View](missions-view.md) and the [Leads View](leads-view.md), it is one table, because the Player compares Agents with one another and acts on several at once.

# Glossary

| Term | Definition | Prohibited synonyms |
| --- | --- | --- |
| Assignment filter | The toggle after each button of Assign to that, while on, lets the Player select only the Agents that button can assign and orders the table so that they come first, under Assignment filters. | selection filter |

# Header

After the title, side by side, the header shows how many places are still free under two caps, so that the Player sees how much room is left to hire and to train:

1. **Agent places free:** the [Agent cap](../../mechanics/domain-model.md#agency-and-agents) minus the number of [Serving](../../mechanics/agents-spec.md#agent-statuses) Agents, against the Agent cap.
2. **Training places free:** the [Training cap](../../mechanics/economy-and-upgrades.md#glossary) minus the number of Agents counted against it, against the Training cap.

Each is its Label above its free count, in the Figure style, followed by its cap bar, under [Cap bars](../visual-design.md#cap-bars) in Visual Design, and the two together are as tall as the title's line and centred on it, under [Alignment](../visual-design.md#alignment) in Visual Design. A free count is never shown below 0. A cap bar fills with the share of its cap that is taken, not the share that is free, e.g. with Training places free 4 / 12, its cap bar is filled two thirds of the way from the left.

Under the title row, the header holds these controls, in this order:

1. **Hire,** labelled with `hire_cost`, which makes one `hireAgent` [Player action](../../foundation/engine-contract.md#player-actions-and-turns), under [Hiring Agents](../../mechanics/economy-and-upgrades.md#hiring-agents) in Economy and Upgrades.
2. **Assign to,** a group under that label holding the buttons **[Standby](../../mechanics/agents-spec.md#assignments),** **[Contracting](../../mechanics/agents-spec.md#assignments),** and **[Training](../../mechanics/agents-spec.md#assignments),** each followed by its Assignment filter. Each button makes one `assignAgents` with the selected Agents and that [Assignment](../../mechanics/domain-model.md#agency-and-agents), under [Assigning Agents](../../mechanics/agents-spec.md#assigning-agents) in Agents, at once and without a confirmation, because Undo Action takes it back.
3. **Dismiss,** a destructive button, which makes one `dismissAgents` with the selected Agents, under [Dismissing Agents](../../mechanics/economy-and-upgrades.md#dismissing-agents) in Economy and Upgrades, after the Player confirms the Agents it names.

A button is enabled only when pressing it would succeed with the current selection, and is disabled otherwise. It would succeed when the engine would accept the Player action it makes, e.g. Hire is disabled while money is below `hire_cost` or the Agent cap is reached, and Dismiss while a selected Agent is not on Standby and [At assignment](../../mechanics/domain-model.md#agency-and-agents). E.g., with agent-1 on Contracting and agent-5 on Standby selected, only Standby is enabled, because an Agent on Contracting can be assigned only to Standby, under [Assigning Agents](../../mechanics/agents-spec.md#assigning-agents) in Agents, and with an Agent [In transit](../../mechanics/domain-model.md#agency-and-agents) among the selected ones, every button of Assign to and Dismiss is disabled.

# Filters

The Agents View has two kinds of filter: one decides which Agents the table shows, and the other decides which of the shown Agents can be selected.

## Row filters

At the right of the title row, a group labelled "Show agents" holds four filters, each with its count, of which exactly one is on at a time. All is on whenever the Agents View opens. The filters sit level with the close control, with their Label above them, under [Alignment](../visual-design.md#alignment) in Visual Design.

- **All:** every Serving [Agent](../../mechanics/domain-model.md#agency-and-agents).
- **[In base](../../mechanics/agents-spec.md#agent-statuses):** every Agent In base, i.e. [At assignment](../../mechanics/domain-model.md#agency-and-agents) on Standby or Training, or [Recovering](../../mechanics/agents-spec.md#agent-statuses), whatever its [current health](../../mechanics/agents-spec.md#combatant-attributes) and [exhaustion](../../mechanics/agents-spec.md#combatant-attributes).
- **[Away](../../mechanics/agents-spec.md#agent-statuses):** every Agent Away, i.e. [In transit](../../mechanics/domain-model.md#agency-and-agents), [Deployed](../../mechanics/agents-spec.md#assignments), or At assignment on Contracting or an [Investigation](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), whatever its current health and exhaustion.
- **Memorial:** every [Terminated](../../mechanics/agents-spec.md#agent-statuses) Agent, under [Memorial](#memorial).

In base and Away split the Serving Agents, so their counts add up to the count of All.

## Assignment filters

The Assignment filter after each button of Assign to is a square button holding a funnel icon, drawn as on while it is on. At most one is on at a time: turning one on turns off the one that was on, and pressing the one that is on turns it off. No Assignment filter is on whenever the Agents View opens.

While an Assignment filter is on, the table keeps showing every Agent its row filter shows, but only the Agents that its button would succeed with if that Agent alone were selected can be selected. E.g., the Contracting Assignment filter leaves selectable only the Agents on Standby or Training, At assignment, that are Fit for work, and the Standby Assignment filter leaves selectable also the Agents on Contracting or an Investigation, At assignment.

While no Assignment filter is on, every shown Serving Agent can be selected, and each button is enabled or disabled by the whole selection, under [Header](#header). E.g., selecting an Agent on Contracting disables Contracting and Training, and selecting an Agent In transit disables every button of Assign to and Dismiss.

Whenever the Assignment filter, the row filter, or the [Committed state](../../foundation/engine-contract.md#player-actions-and-turns) changes, every selected Agent that can no longer be selected, or is no longer shown, is no longer selected. A row does not leave the table because its Agent was just assigned: e.g., after assigning the selected Agents to Contracting with the Contracting Assignment filter on, their rows stay, muted, with "In transit" as their Blocked by.

# Agent table

The table lists one row per Serving [Agent](../../mechanics/domain-model.md#agency-and-agents) that the row filter shows, by [Instance ID](../../foundation/campaign-instances.md#glossary), under [Tables](../visual-design.md#tables) in Visual Design, with a selection checkbox and these columns in this order: Instance ID, [effective skill](../../mechanics/agents-spec.md#combatant-attributes), [base skill](../../mechanics/agents-spec.md#combatant-attributes), [current health](../../mechanics/agents-spec.md#combatant-attributes) against [base health](../../mechanics/agents-spec.md#combatant-attributes), [exhaustion](../../mechanics/agents-spec.md#combatant-attributes), [base weapon damage](../../mechanics/agents-spec.md#combatant-attributes), Assignment with its [Agent status](../../mechanics/agents-spec.md#agent-statuses), and Blocked by. An Assignment to an [Investigation](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) or a [Mission](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) names its [Lead](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) or [Mission site](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), and an Agent [In transit](../../mechanics/domain-model.md#agency-and-agents) says so, e.g. "Contracting · In transit". Current health and exhaustion take their colours under [Agent condition](../visual-design.md#agent-condition) in Visual Design. Its default order is by Instance ID, and pressing a column header sorts it by that column, under [Tables](../visual-design.md#tables) in Visual Design.

While an Assignment filter is on, the Blocked by column is the first sort tier, ascending, so the Agents that can be selected, whose Blocked by is empty, come first. It is locked: pressing its header changes nothing, and the up to four tiers the Player chooses by pressing the other headers, under [Tables](../visual-design.md#tables) in Visual Design, come under it, so they order the Agents within each group of Blocked by. E.g., with the Contracting Assignment filter on and the table sorted by effective skill, the Agents that can go to Contracting come first, by effective skill, highest first, and then the others, each group of Blocked by again by effective skill. When the Assignment filter is turned off, the lock ends, the Blocked by tier is dropped, and the tiers the Player chose stay.

A row whose Agent cannot be selected, under [Filters](#filters), has its checkbox disabled and its text in Text muted, except the colours of current health and exhaustion. Its Blocked by says why, as the first of these that applies; the Blocked by of a row that can be selected is empty, and so is every row's while no Assignment filter is on:

1. **Deployed:** its Assignment is [Deployed](../../mechanics/agents-spec.md#assignments).
2. **Recovering:** its Assignment is [Recovery](../../mechanics/agents-spec.md#assignments), whether it is [Recovering](../../mechanics/agents-spec.md#agent-statuses) or In transit.
3. **In transit:** it is In transit.
4. **On assignment:** it is on Contracting or an Investigation and the Assignment filter that is on is for Contracting or Training.
5. **Already on Standby, Contracting, or Training:** the Assignment filter that is on is for the Assignment it has.
6. **Too exhausted:** it is not [Fit for work](../../mechanics/agents-spec.md#assignments) and the Assignment filter that is on is for Contracting or Training.
7. **Training full:** the Training Assignment filter is on and the [Training cap](../../mechanics/economy-and-upgrades.md#glossary) has no place left.
8. **Otherwise:** the message of the engine's rejection.

# Memorial

The Memorial remembers the Agents who have left the [Agency](../../mechanics/domain-model.md#agency-and-agents) and how their service ended. While the Memorial filter is on, the table lists one row per Terminated Agent, as `getHistory()` returns it under [Current state, Turn report, and history](../../foundation/world-history.md#current-state-turn-report-and-history) in World History, newest [Turn](../../foundation/engine-contract.md#player-actions-and-turns) terminated first and then by Instance ID, which is its default order, and pressing a column header sorts it by that column, under Tables in Visual Design. Its rows have no selection checkbox, and the buttons and Assignment filters of Assign to and Dismiss are disabled, because no Player action acts on a Terminated Agent. Its columns, in this order, are:

- **Instance ID,** **base skill,** and **base health.**
- **Turn terminated.**
- **Cause:** the [Agent status](../../mechanics/domain-model.md#agency-and-agents), [Killed](../../mechanics/agents-spec.md#agent-statuses) in Danger text or [Dismissed](../../mechanics/agents-spec.md#agent-statuses) in Text muted.
- **Missions:** the number of Missions in its [Participation history](../../mechanics/domain-model.md#agency-and-agents).
- **Turns with the Agency,** headed Turns: its Turn terminated minus its Turn hired.
- **Enemies killed,** headed Kills: its Enemies killed, under [Service record](../../mechanics/agents-spec.md#service-record) in Agents.
- **Details:** how its service ended. A Killed Agent's details name the [Enemy](../../mechanics/domain-model.md#combat) and the Mission site that its Killed by references, the Enemy by its [Enemy label](../gui.md#glossary), under [Enemy labels](../gui.md#enemy-labels) in Graphical User Interface, and the Mission site by its Instance ID and its [Archetype](../../foundation/core-concepts.md#campaign-instances)'s `name`, e.g. "Killed by initiate-2 at mission-site-5, Apprehend member"; a Dismissed Agent's say "Dismissed".

# Agent details

Selecting an Agent's Instance ID, in the table of Serving Agents or in the Memorial, opens its details one step away, in place of the table, as a Follow under [View trail](campaign-screen.md#view-trail) in Campaign Screen, so the Escape key and the [Back control](../gui.md#glossary) return to the table. They show its AgentArchetype's `name`, its [Turn](../../foundation/engine-contract.md#player-actions-and-turns) hired, its Weapon, and its [Participation history](../../mechanics/domain-model.md#agency-and-agents), each Investigation or Mission by its Lead or Mission site and its outcome.

# Artboard

![Agents View panel Artboard: the header with the Agent places free and Training places free, each with its cap bar, the Hire button, the Assign to group of Standby, Contracting, and Training buttons each with its Assignment filter, the Contracting one on, and the Dismiss button; the Show agents filters All, In base, Away, and Memorial; and the table of Serving Agents with a Select all checkbox, their skill, colour-coded health and exhaustion, weapon damage, Assignment, and Blocked by, sorted first by the locked Blocked by tier so that the Agents that can be selected come first and then by effective skill, with each muted row saying what blocks it](../../../../images/artboards/agents-view.png)

![Agents View Memorial panel Artboard: the Memorial filter on, the Assign to group and Dismiss disabled, and the table of Terminated Agents with base skill, base health, Turn terminated, cause, Missions, Turns with the Agency, Enemies killed, and details of how each Agent's service ended](../../../../images/artboards/agents-memorial.png)

The Agents View shows its [Background artwork](../visual-design.md#background-artwork), Agents in an equipment room, behind its content, as both [Artboards](../visual-design.md#glossary) show.

The sample values, e.g. the Agent IDs and their values, appear only on the Artboard, under [Reading Artboards](../visual-design.md#reading-artboards) in Visual Design.
