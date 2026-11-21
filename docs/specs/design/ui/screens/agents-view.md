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

A button is enabled only when pressing it would succeed with the current selection, and is disabled otherwise. It would succeed when the engine would accept the Player action it makes, as [Action preview](../../foundation/player-api.md#action-preview) in [Player API](../../foundation/engine-contract.md#api-surfaces) reports it for that action with the current selection, so that no button repeats a precondition of the action, e.g. Hire is disabled while money is below `hire_cost` or the Agent cap is reached, and Dismiss while a selected Agent is not on Standby and [At assignment](../../mechanics/domain-model.md#agency-and-agents). E.g., with agent-1 on Contracting and agent-5 on Standby selected, only Standby is enabled, because an Agent on Contracting can be assigned only to Standby, under [Assigning Agents](../../mechanics/agents-spec.md#assigning-agents) in Agents, and with an Agent [In transit](../../mechanics/domain-model.md#agency-and-agents) among the selected ones, every button of Assign to and Dismiss is disabled.

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

While an Assignment filter is on, the table keeps showing every Agent its row filter shows, but only the Agents that its button would succeed with if that Agent alone were selected can be selected, as Action preview reports it for `assignAgents` with that Agent alone and that Assignment. E.g., the Contracting Assignment filter leaves selectable only the Agents on Standby or Training, At assignment, that are Fit to start work, and the Standby Assignment filter leaves selectable also the Agents on Contracting or an Investigation, At assignment.

While no Assignment filter is on, every shown Serving Agent can be selected, and each button is enabled or disabled by the whole selection, under [Header](#header). E.g., selecting an Agent on Contracting disables Contracting and Training, and selecting an Agent In transit disables every button of Assign to and Dismiss.

Whenever the Assignment filter, the row filter, or the [Current world state](../../foundation/engine-contract.md#player-actions-and-turns) changes, every selected Agent that can no longer be selected, or is no longer shown, is no longer selected. A row does not leave the table because its Agent was just assigned: e.g., after assigning the selected Agents to Contracting with the Contracting Assignment filter on, their rows stay, muted, with "In transit" as their Blocked by.

# Agent table

The table lists one row per Serving [Agent](../../mechanics/domain-model.md#agency-and-agents) that the row filter shows, by [Instance ID](../../foundation/campaign-instances.md#glossary), under [Tables](../visual-design.md#tables) in Visual Design, with a selection checkbox and these columns in this order: Instance ID, [effective skill](../../mechanics/agents-spec.md#combatant-attributes), [base skill](../../mechanics/agents-spec.md#combatant-attributes), [Experience](../../mechanics/agents-spec.md#growth) headed Exp., [current health](../../mechanics/agents-spec.md#combatant-attributes) against [effective max health](../../mechanics/agents-spec.md#combatant-attributes), [exhaustion](../../mechanics/agents-spec.md#combatant-attributes), [effective weapon damage](../../mechanics/agents-spec.md#combatant-attributes), Assignment with its [Agent status](../../mechanics/agents-spec.md#agent-statuses), and Blocked by. An Assignment to an [Investigation](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) or a [Mission](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) names its [Lead](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) or [Mission site](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), and an Agent [In transit](../../mechanics/domain-model.md#agency-and-agents) says so, e.g. "Contracting · In transit". Every value is a whole number: base skill and current health are [Decimal quantities](../../foundation/numbers.md#glossary), rounded down under [Decimal quantities shown](../gui.md#decimal-quantities-shown) in Graphical User Interface, e.g. "101" for 101.90 and "29 / 30" for 29.40; their two decimals are in the Agent details. Current health and exhaustion take their colours under [Agent condition](../visual-design.md#agent-condition) in Visual Design. Its default order is by Instance ID, and pressing a column header sorts it by that column, under [Tables](../visual-design.md#tables) in Visual Design.

While an Assignment filter is on, the Blocked by column is the first sort tier, ascending, so the Agents that can be selected, whose Blocked by is empty, come first. It is locked: pressing its header changes nothing, and the up to four tiers the Player chooses by pressing the other headers, under [Tables](../visual-design.md#tables) in Visual Design, come under it, so they order the Agents within each group of Blocked by. E.g., with the Contracting Assignment filter on and the table sorted by effective skill, the Agents that can go to Contracting come first, by effective skill, highest first, and then the others, each group of Blocked by again by effective skill. When the Assignment filter is turned off, the lock ends, the Blocked by tier is dropped, and the tiers the Player chose stay.

A row whose Agent cannot be selected, under [Filters](#filters), has its checkbox disabled and its text in Text muted, except the colours of current health and exhaustion. Its Blocked by says why, as the first of these that applies; the Blocked by of a row that can be selected is empty, and so is every row's while no Assignment filter is on:

1. **Deployed:** its Assignment is [Deployed](../../mechanics/agents-spec.md#assignments).
2. **Recovering:** its Assignment is [Recovery](../../mechanics/agents-spec.md#assignments), whether it is [Recovering](../../mechanics/agents-spec.md#agent-statuses) or In transit.
3. **In transit:** it is In transit.
4. **On assignment:** it is on Contracting or an Investigation and the Assignment filter that is on is for Contracting or Training.
5. **Already on Standby, Contracting, or Training:** the Assignment filter that is on is for the Assignment it has.
6. **Too exhausted:** it is not [Fit to start work](../../mechanics/agents-spec.md#assignments) and the Assignment filter that is on is for Contracting or Training.
7. **Training full:** the Training Assignment filter is on and the [Training cap](../../mechanics/economy-and-upgrades.md#glossary) has no place left.
8. **Otherwise:** the message of the rejection that Action preview reports.

# Memorial

The Memorial remembers the Agents who have left the [Agency](../../mechanics/domain-model.md#agency-and-agents) and how their service ended. While the Memorial filter is on, the table lists one row per Terminated Agent, as `getCurrentRetiredWorldState()` returns it, [Retired](../../foundation/world-history.md#glossary), under [Current world state, Turn report, and history](../../foundation/world-history.md#current-world-state-turn-report-and-history) in History and Turn Report, newest [Turn](../../foundation/engine-contract.md#player-actions-and-turns) terminated first and then by Instance ID, which is its default order, and pressing a column header sorts it by that column, under Tables in Visual Design. Its rows have no selection checkbox, and the buttons and Assignment filters of Assign to and Dismiss are disabled, because no Player action acts on a Terminated Agent. Its columns, in this order, are:

- **Instance ID,** **base skill,** **Experience,** headed Exp., and **effective max health.**
- **Turn terminated.**
- **Cause:** the [Agent status](../../mechanics/domain-model.md#agency-and-agents), [Killed](../../mechanics/agents-spec.md#agent-statuses) in Danger text or [Dismissed](../../mechanics/agents-spec.md#agent-statuses) in Text muted.
- **Missions:** the number of Missions in its [Participation history](../../mechanics/domain-model.md#agency-and-agents).
- **Turns with the Agency,** headed Turns: its Turn terminated minus its Turn hired.
- **Enemies killed,** headed Kills: its Enemies killed, under [Service record](../../mechanics/agents-spec.md#service-record) in Agents.
- **Killed by:** the [Enemy](../../mechanics/domain-model.md#combat) that its Killed by references, by its [Enemy label](../gui.md#glossary), under [Enemy labels](../gui.md#enemy-labels) in Graphical User Interface, e.g. "initiate-2".
- **Where:** the Mission site that its Killed by references, by its [Archetype](../../foundation/core-concepts.md#campaign-instances)'s `name` followed by "#" and the number that ends its Instance ID, in Text muted, e.g. "Apprehend member #5" for mission-site-5: the column already says it is a Mission site, so the number alone tells apart the Mission sites that share a `name`.

A Dismissed Agent's Killed by and Where cells are empty, because its Cause already says how its service ended. Neither column ever cuts its value short with "…", under [Tables](../visual-design.md#tables) in Visual Design: Killed by is wide enough for the longest Enemy label that the EnemyArchetypes of the [GDRs](../../foundation/core-concepts.md#game-build-and-content) give with a two-digit number, e.g. "high-commander-12", and Where for the longest `name` of a MissionSiteArchetype of the GDRs with a three-digit number, e.g. "Foil nuclear plant bombing #123".

# Agent details

Selecting an Agent's Instance ID, in the table of Serving Agents or in the Memorial, opens its details one step away, in place of the table, as a Follow under [View trail](campaign-screen.md#view-trail) in Campaign Screen, so the Escape key and the [Back control](../gui.md#glossary) return to the table. They show its AgentArchetype's `name`, its [Turn](../../foundation/engine-contract.md#player-actions-and-turns) hired, its Weapon with its effective weapon damage, its Armor with its [effective armor](../../mechanics/agents-spec.md#combatant-attributes), e.g. "Service armor · armor 2", its base skill, its current health against its effective max health, its exhaustion, its [Combat rating](../../mechanics/combat.md#combat-rating) with its [base Combat rating](../../mechanics/combat.md#combatant-condition-in-a-combat) beside it, e.g. "COMBAT RATING 78 · base 76", and its [Participation history](../../mechanics/domain-model.md#agency-and-agents), each Investigation or Mission by its Lead or Mission site and its outcome.

The Agent details are the one place that shows an Agent's base skill, current health, and exhaustion with two decimals, under [Decimal quantities shown](../gui.md#decimal-quantities-shown) in Graphical User Interface, e.g. "109.40", "22.40 / 30", and "12.40", so that the Player can see how close each is to its next whole number, e.g. how many Advance turns of Training or recovery remain. The exhaustion shown is the Agent's [Exact exhaustion](../../mechanics/agents-spec.md#combatant-attributes), under [Exhaustion and Exact exhaustion](../../mechanics/agents-spec.md#exhaustion-and-exact-exhaustion) in Agents: e.g. "12.40" stands for an exhaustion of 13, which every rule reads. They are also the one place that shows a base [Combat rating](../../mechanics/combat.md#combatant-condition-in-a-combat), i.e. the Agent's effective skill before the Agency's [Weapon damage Upgrades](../../mechanics/economy-and-upgrades.md#glossary) and [Armor Upgrades](../../mechanics/economy-and-upgrades.md#glossary) raise it, so that the Player can see how much of the Agent's Combat rating those [Upgrades](../../mechanics/domain-model.md#agency-and-agents) give; everywhere else, a Combat rating is shown only as the raised value, under [Combat ratings](missions-view.md#combat-ratings) in Missions View. The Combat rating takes the shared Combat rating style, the Label "Combat rating" and the value in the Figure style and Accent text, and the base Combat rating follows it in the Figure style and Text secondary, under [Colours](../visual-design.md#colours) in Visual Design. A Terminated Agent's details show its Final weapon damage in place of its effective weapon damage, its Final armor in place of its effective armor, and its Final max health in place of its current health against its effective max health, and no exhaustion and no Combat rating, because a Terminated Agent has no condition left to watch.

# Artboard

![Agents View panel Artboard: the header with the Agent places free and Training places free, each with its cap bar, the Hire button, the Assign to group of Standby, Contracting, and Training buttons each with its Assignment filter, the Contracting one on, and the Dismiss button; the Show agents filters All, In base, Away, and Memorial; and the table of Serving Agents with a Select all checkbox, their skill and Experience, colour-coded health and exhaustion, weapon damage, Assignment, and Blocked by, sorted first by the locked Blocked by tier so that the Agents that can be selected come first and then by effective skill, with each muted row saying what blocks it](../../../../images/artboards/agents-view.png)

![Agents View Memorial panel Artboard: the Memorial filter on, the Assign to group and Dismiss disabled, and the table of Terminated Agents with base skill, Experience, effective max health, Turn terminated, cause, Missions, Turns with the Agency, Enemies killed, and, for a Killed Agent, the Enemy that killed it and the Mission site where](../../../../images/artboards/agents-memorial.png)

![Agent details panel Artboard: a Serving Agent's details reached from the Agents View, with the Back control to the Agents View, its AgentArchetype's name, Turn hired, Weapon with its effective weapon damage, Armor with its effective armor, its base skill, current health against effective max health, and Exact exhaustion each with two decimals, its Combat rating in Accent text with its base Combat rating beside it, and its Participation history with each outcome coloured](../../../../images/artboards/agent-details.png)

The Agents View shows its [Background artwork](../visual-design.md#background-artwork), Agents in an equipment room, behind its content, as each of its [Artboards](../visual-design.md#glossary) show.

The sample values, e.g. the Agent IDs and their values, appear only on the Artboard, under [Reading Artboards](../visual-design.md#reading-artboards) in Visual Design.
