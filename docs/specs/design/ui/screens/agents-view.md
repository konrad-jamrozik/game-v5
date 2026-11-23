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
| Assignment filter | The toggle after each button of Assign to that, while on, [lets the Player select only the Agents that button can assign](#assignment-filters) and orders the table so that they come first. | selection filter |

# Header

After the title, the header shows how many places are still free under the caps, so that the Player sees how much room is left to hire, to train, and to contract:

1. **Agent places free:** the [Agent cap](../../mechanics/domain-model.md#agency-and-agents) minus the number of [Serving](../../mechanics/agents-spec.md#agent-statuses) Agents, against the Agent cap.
2. **Training places free:** the [Training cap](../../mechanics/economy-and-upgrades.md#glossary) minus the number of Agents counted against it, against the Training cap.
3. **Contracting places free:** the [Contracting cap](../../mechanics/economy-and-upgrades.md#glossary) minus the number of Agents counted against it, against the Contracting cap. It is shown only while the Contracting cap is at least 1.

Each is followed by its [cap bar](../visual-design.md#cap-bars). A free count is never shown below 0, and the cap bar of a cap of 0 is an empty track.

Under the title row, the header holds these controls, in this order:

1. **Hire,** labelled with `hire_cost`, which [hires 1 Agent](../../mechanics/economy-and-upgrades.md#hiring-agents) in one [Player action](../../foundation/engine-contract.md#player-actions-and-turns).
2. **Assign to,** a group under that label holding the buttons **[Standby](../../mechanics/agents-spec.md#assignments),** **[Contracting](../../mechanics/agents-spec.md#assignments),** and **[Training](../../mechanics/agents-spec.md#assignments),** each followed by its Assignment filter. Contracting and its Assignment filter are shown only while the Contracting cap is at least 1, so that, until a [Lead](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) unlocks Contracting, the Player sees no way to start it. Each button [assigns the selected Agents](../../mechanics/agents-spec.md#assigning-agents) to that [Assignment](../../mechanics/domain-model.md#agency-and-agents) in one Player action, at once and without a confirmation, because Undo Action takes it back.
3. **Dismiss,** a destructive button, which [dismisses the selected Agents](../../mechanics/economy-and-upgrades.md#dismissing-agents) in one Player action, after the Player confirms the Agents it names.

After Dismiss, the header shows how many Agents are selected and, while at least one is selected, the [Combat rating](../../mechanics/combat.md#combatant-condition-in-a-combat) of the selected Agents taken as one side, in the [shared Combat rating style](missions-view.md#combat-ratings), e.g. "2 selected COMBAT RATING 296", so that the Player can gather a team strong enough for a [Mission site](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) before opening the Missions View.

A button is enabled only when pressing it would succeed with the current selection, i.e. when [Action preview](../../foundation/player-api.md#action-preview) reports that the engine would accept the Player action it makes, so that no button repeats a precondition of the action. E.g., with an Agent on Standby and an Agent on Training selected, Standby and Training are disabled, because one of the selected Agents already has that Assignment, and so is Dismiss, because one of them is not on Standby.

# Filters

The Agents View has two kinds of filter: one decides which Agents the table shows, and the other decides which of the shown Agents can be selected.

## Row filters

At the right of the title row, a group labelled "Show agents" holds four filters, each with its count, of which exactly one is on at a time. All is on whenever the Agents View opens. The group stands on a [Control backdrop](../visual-design.md#colours).

- **All:** every Serving [Agent](../../mechanics/domain-model.md#agency-and-agents).
- **[In base](../../mechanics/agents-spec.md#agent-statuses):** every Agent In base.
- **[Away](../../mechanics/agents-spec.md#agent-statuses):** every Agent Away.
- **Memorial:** every [Terminated](../../mechanics/agents-spec.md#agent-statuses) Agent, in the [Memorial](#memorial).

Below the four filters, two checkboxes, in this order, hide more Agents from the table that All, In base, or Away shows, so that the Player can keep in view only the Agents ready for work:

- **Hide with [exhaustion](../../mechanics/agents-spec.md#combatant-attributes) > N,** where N is `exhaustion_free_points` of [AgentParameters](../../mechanics/agents-spec.md#agentparameters), e.g. "Hide with exhaustion > 30": hides every Agent whose exhaustion is above N.
- **Hide recovering:** hides every Agent whose Assignment is [Recovery](../../mechanics/agents-spec.md#assignments), whether it is [Recovering](../../mechanics/agents-spec.md#agent-statuses) or [In transit](../../mechanics/domain-model.md#agency-and-agents).

Both are unchecked whenever the Agents View opens. They change no count of the row filters. While Memorial is on, both are disabled and keep their check.

## Assignment filters

At most one Assignment filter is on at a time: turning one on turns off the one that was on, and pressing the one that is on turns it off. No Assignment filter is on whenever the Agents View opens.

While an Assignment filter is on, the table keeps showing every Agent its row filter shows, but an Agent can be selected only when the filter's button would succeed with that Agent alone selected, as Action preview reports it; e.g., with the Standby Assignment filter on, an Agent on Contracting can be selected and an Agent In transit cannot. While no Assignment filter is on, every shown Serving Agent can be selected.

Whenever the Assignment filter, the row filter, a checkbox of the [row filters](#row-filters), or the [Current world state](../../foundation/engine-contract.md#player-actions-and-turns) changes, every selected Agent that can no longer be selected, or is no longer shown, is no longer selected. A row does not leave the table because its Agent was just assigned: e.g., after assigning the selected Agents to Contracting with the Contracting Assignment filter on, their rows stay, muted, with "In transit" as their Blocked by.

# Agent table

The table lists one row per Serving [Agent](../../mechanics/domain-model.md#agency-and-agents) that the row filter shows and its checkboxes do not hide, with a selection checkbox and these columns in this order: [Instance ID](../../foundation/campaign-instances.md#glossary), [effective skill](../../mechanics/agents-spec.md#combatant-attributes), [base skill](../../mechanics/agents-spec.md#combatant-attributes), [Experience](../../mechanics/agents-spec.md#growth) headed Exp., [current health](../../mechanics/agents-spec.md#combatant-attributes) against [effective max health](../../mechanics/agents-spec.md#combatant-attributes), exhaustion, [effective weapon damage](../../mechanics/agents-spec.md#combatant-attributes), Assignment with its [Agent status](../../mechanics/agents-spec.md#agent-statuses), and Blocked by. An Assignment to an [Investigation](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) or a [Mission](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) names its [Lead](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) or [Mission site](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), and an Agent In transit says so, e.g. "Contracting · In transit". Current health and exhaustion take the colours of their [Agent condition](../visual-design.md#agent-condition). The table's default order is by Instance ID, and its column headers [sort it](../visual-design.md#tables).

While an Assignment filter is on, the Blocked by column is a [locked](../visual-design.md#tables) first sort tier, ascending, so that the Agents that can be selected, whose Blocked by is empty, come first, and the tiers the Player chooses order the Agents within each group of Blocked by. When the Assignment filter is turned off, the Blocked by tier is dropped, and the tiers the Player chose stay.

A row whose Agent cannot be selected has its checkbox disabled and its text in Text muted, except the colours of current health and exhaustion. Its Blocked by says why, as the first of these that applies, and the Blocked by of a row that can be selected is empty:

1. **Deployed:** its Assignment is [Deployed](../../mechanics/agents-spec.md#assignments).
2. **Recovering:** its Assignment is Recovery, whether it is Recovering or In transit.
3. **In transit:** it is In transit.
4. **On assignment:** it is on Contracting or an Investigation and the Assignment filter that is on is for Contracting or Training.
5. **Already on Standby, Contracting, or Training:** the Assignment filter that is on is for the Assignment it has.
6. **Too exhausted:** it is not [Fit to start work](../../mechanics/agents-spec.md#assignments) and the Assignment filter that is on is for Contracting or Training.
7. **Training full:** the Training Assignment filter is on and the Training cap has no place left.
8. **Contracting full:** the Contracting Assignment filter is on and the Contracting cap has no place left.
9. **Otherwise:** the message of the rejection that Action preview reports.

# Memorial

The Memorial remembers the Agents who have left the [Agency](../../mechanics/domain-model.md#agency-and-agents) and how their service ended. While the Memorial filter is on, the table lists one row per Terminated Agent, by default newest [Turn](../../foundation/engine-contract.md#player-actions-and-turns) terminated first and then by Instance ID, and its column headers sort it. Its rows have no selection checkbox, and the buttons and Assignment filters of Assign to and Dismiss are disabled. Its columns, in this order, are:

- **Instance ID,** **base skill,** **Experience,** headed Exp., and **effective max health.**
- **Turn terminated.**
- **Cause:** the [Agent status](../../mechanics/domain-model.md#agency-and-agents), [Killed](../../mechanics/agents-spec.md#agent-statuses) in Danger text or [Dismissed](../../mechanics/agents-spec.md#agent-statuses) in Text muted.
- **Missions:** the number of Missions in its [Participation history](../../mechanics/domain-model.md#agency-and-agents).
- **Turns with the Agency,** headed Turns: its Turn terminated minus its Turn hired.
- **Enemies killed,** headed Kills: the Enemies killed of its [Service record](../../mechanics/agents-spec.md#service-record).
- **Killed by:** the [Enemy](../../mechanics/domain-model.md#combat) that its Killed by references, by its [Enemy label](../gui.md#glossary), e.g. "initiate-2".
- **Where:** the Mission site that its Killed by references, by its [Archetype](../../foundation/core-concepts.md#campaign-instances)'s `name` followed by "#" and the number that ends its Instance ID, in Text muted, e.g. "Apprehend member #5" for mission-site-5.

A Dismissed Agent's Killed by and Where cells are empty. Neither column ever [cuts its value short](../visual-design.md#tables) with "…".

# Agent details

Selecting an Agent's Instance ID, in the table of Serving Agents or in the Memorial, opens its details one step away, in place of the table, as a [Follow](campaign-screen.md#view-trail). They show its AgentArchetype's `name`, its [Turn](../../foundation/engine-contract.md#player-actions-and-turns) hired, its Weapon with its effective weapon damage, its Armor with its [effective armor](../../mechanics/agents-spec.md#combatant-attributes), its base skill, its current health against its effective max health, its exhaustion, its Combat rating with its [base Combat rating](../../mechanics/combat.md#combatant-condition-in-a-combat) beside it, and its [Participation history](#participation-history), e.g. "Standard uniform · armor 2" and "COMBAT RATING 78 · base 76". Its base skill, current health, and exhaustion are shown [with two decimals](../gui.md#decimal-quantities-shown).

The Agent details are the one place that shows a base Combat rating, so that the Player can see how much of the Agent's Combat rating the Agency's [Upgrades](../../mechanics/domain-model.md#agency-and-agents) give. A Terminated Agent's details show its [Final](../../mechanics/agents-spec.md#service-record) weapon damage, armor, and max health, the last in place of its current health against its effective max health, and no exhaustion and no Combat rating.

## Participation history

The Agent details list the Agent's [Participation history](../../mechanics/domain-model.md#agency-and-agents) in its order, one row per Investigation or Mission, with these columns in this order:

| Column | What it shows |
| --- | --- |
| Name | "Investigation" and its Lead's `name`, or "Mission" and its Mission site's MissionSiteArchetype `name`, e.g. "Mission · Raid outpost". |
| Faction | The [Faction](../../mechanics/domain-model.md#factions) of an Investigation's Lead, or nothing for a Lead without one, or the target Faction of a Mission's Mission site. |
| Turn | An Investigation's Turn started, or a Mission's Turn deployed, e.g. "Turn 42". |
| Outcome | The Investigation's or the Mission's final lifecycle state: Completed or Won in Positive, Lost in Danger, and Abandoned in Text muted. |

Each row leads to what it records, so that the Player can see how each Mission the Agent served in went. Pressing a Mission's row opens the Missions View with its Mission site selected, and pressing an Investigation's row opens the Leads View with its Lead selected, each as a Follow.

# Artboard

![Agents View panel Artboard](../../../../images/artboards/agents-view.png)

![Agents View panel Artboard with the Memorial filter on](../../../../images/artboards/agents-memorial.png)

![Agent details panel Artboard](../../../../images/artboards/agent-details.png)

The sample values of the [Artboards](../visual-design.md#glossary) [appear only there](../visual-design.md#reading-artboards), e.g. the Agent IDs and their values.
