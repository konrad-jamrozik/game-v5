# Missions View

| Metadata | Value |
| --- | --- |
| Spec ID | MVIEW |
| Family | UI |
| Audience | UI designer, Implementer |
| Owns | What the Missions View of the Campaign screen shows, how its panes are arranged, and how it deploys Agents. |
| Conventions | [Specification Conventions](../../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../../governance/conventions/design-spec-conventions.md) |

# Overview

The Missions View is where the Player answers [Mission sites](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions): it shows what waits at each one, what winning or losing it would change, and lets the Player send a team. It is the first of the Operations [Detail views](../gui.md#glossary) of the [Campaign Screen](campaign-screen.md). It reads left to right as the Player decides: which Mission site, what is there, and who goes. It has three panes side by side: the list of Mission sites, the selected Mission site, and the deployment.

# Mission site list

The left pane lists, by default, two groups, each under its name and the number of its items:

1. **Active [Mission sites](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions):** each Mission site whose lifecycle state is Active, under [Mission site lifecycle](../../mechanics/missions.md#mission-site-lifecycle) in Missions, soonest to expire first, with its [MissionSiteArchetype](../../mechanics/missions.md#missionsitearchetype)'s `name`, its kind and target [Faction](../../mechanics/domain-model.md#factions), and its [Turns](../../foundation/engine-contract.md#player-actions-and-turns) until expiration, under [Mission site properties](../../mechanics/missions.md#mission-site-properties) in Missions.
2. **Deployed this Turn:** each [Mission](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) whose lifecycle state is [Deployed](../../mechanics/agents-spec.md#assignments), under [Mission lifecycle](../../mechanics/missions.md#mission-lifecycle) in Missions, with its Mission site's MissionSiteArchetype `name` and target Faction, and the number of [Agents](../../mechanics/domain-model.md#agency-and-agents) in its Team sent. Its [Combat](../../mechanics/domain-model.md#combat) is fought in the next Advance turn.

A toggle replaces both groups with one group, Finished: the Mission sites in a final state, newest first, each with its MissionSiteArchetype's `name`, its target Faction, and the final state it reached, under [Final state](#final-state). The toggle is one step away because those Mission sites need no decision.

Every item of the list shows its Mission site's [Instance ID](../../foundation/campaign-instances.md#glossary) after the `name`, in Text muted, e.g. "Apprehend member mission-site-12", because several Mission sites often share one MissionSiteArchetype and only the Instance ID tells them apart.

When the Missions View opens, the first Active Mission site is selected, unless the Player opened it from an item of the [Situation Panel](situation-panel.md) or of the [Turn Report View](turn-report-view.md), or from a Mission of the [History View](history-view.md), under [Mission links](history-view.md#mission-links) in History View, which selects that item's Mission site. A Mission site so selected that is in a final state opens the View with the toggle on Finished, so that the selected Mission site is in the list.

# Selected Mission site

The middle pane shows the selected Mission site:

- Its MissionSiteArchetype's `name` and its Instance ID, its kind, its origin, i.e. the [Lead](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) of the [Investigation](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) that created an [Initiative Mission site](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) or the [Faction operation level](../../mechanics/factions.md#glossary) that created a [Response Mission site](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), its target Faction, its Turn created, its Turns until expiration while it is Active, under [Mission site properties](../../mechanics/missions.md#mission-site-properties) in Missions, and its lifecycle state, or for a Mission site in a final state the final state it reached, under [Final state](#final-state).
- Its Enemies, in their order, one row each with the EnemyArchetype's `name`, [base skill](../../mechanics/agents-spec.md#combatant-attributes), [current health](../../mechanics/agents-spec.md#combatant-attributes) against [base health](../../mechanics/agents-spec.md#combatant-attributes), and [base weapon damage](../../mechanics/agents-spec.md#combatant-attributes), under [Player-visible information](../../mechanics/combat.md#player-visible-information) in Combat, and the [Combat rating](../../mechanics/combat.md#combat-rating) of the Enemies' side beside the Enemies heading, under [Combat ratings](#combat-ratings).
- Its [Consequences](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), under [Consequences](../../mechanics/missions.md#consequences) in Missions, each change written as what it does, e.g. "+60 money", "Panic −0.50", "Red Dawn Eliminated", or "Campaign lost", and coloured under [Consequences](../visual-design.md#consequences) in Visual Design. While the Mission site is Active or Deployed, they are its Consequences for each final state: what a Won Mission changes, and what a Lost Mission or an Expired Mission site changes. Once it is in a final state, they are only the Consequences that applied, after the Label "Applied", from the [History entry](../../foundation/world-history.md#glossary) of the Turn its final state was reached in, under [Turn report](../../mechanics/missions.md#turn-report) in Missions, or "none" when nothing applied, e.g. for a Cancelled Mission site or a Lost Initiative Mission.

For a Deployed Mission site, the pane also shows its Mission with its Team sent, and a row under the Team sent shows the [Combat rating](../../mechanics/combat.md#combatant-condition-in-a-combat) of its [Current team](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), which is its Team sent, under [Combat ratings](#combat-ratings).

## Concluded Mission site

A Concluded Mission site shows what its Combat did to every participant, so that the Player sees, Turns later, what each Mission cost and won. Its values come from the reduced [Combat report](../../mechanics/combat.md#combat-report) in the History entry of the Turn its Mission's Combat was fought in, never from the participants' current values, which have changed since, and the [Combat report](turn-report-view.md#combat-report) in full stays in the Turn Report View for as long as it is kept.

In place of the Enemies table above and of its Mission's Team sent, the pane shows two tables of participants, the Enemies first and then the Agents of the Team sent, under [Tables](../visual-design.md#tables) in Visual Design, each in its side's fixed order and each under its heading with its side's Combat rating at Combat start and at Combat end, under [Combat ratings](#combat-ratings), e.g. "COMBAT RATING 240 → 0". Each table has these columns, in this order, each under its header:

| Column | What it shows |
| --- | --- |
| Enemy or [Agent](../../mechanics/domain-model.md#agency-and-agents) | The [Enemy](../../mechanics/domain-model.md#combat)'s [Enemy label](../gui.md#glossary), or the Agent's Instance ID. |
| Skill | Its [effective skill](../../mechanics/agents-spec.md#combatant-attributes) at Combat start and at Combat end, e.g. "40 → 12". |
| Health | Its current health at Combat start and at Combat end, e.g. "20 → 0". |
| Condition | Its final condition: "[Killed](../../mechanics/agents-spec.md#agent-statuses)" for a dead Agent, "Dead" for a dead Enemy, "[Incapacitated](../../mechanics/combat.md#combatant-condition-in-a-combat)", or nothing for one [able to fight](../../mechanics/combat.md#combatant-condition-in-a-combat). |

The row of a participant whose final condition is dead is in Danger, and the row of an Incapacitated one is in Warning, under [Colours](../visual-design.md#colours) in Visual Design, on both sides alike, as the decisive words of the [Combat log](../../mechanics/combat.md#combat-rounds-and-results) name both, under [Combat log colours](turn-report-view.md#combat-log-colours) in Turn Report View: they are the end states the Player looks for first. A participant able to fight at Combat end keeps Text.

## Final state

A Mission site in a final state shows the final state it reached, in the list and in place of its lifecycle state in the middle pane, coloured by whom it favours. A Concluded Mission site shows its Mission's outcome instead of "Concluded", because the outcome is what the Player wants to know: "Won" in Positive for a Won Mission, and the [Combat outcome](../../mechanics/combat.md#combat-rounds-and-results) of a Lost Mission, "Retreated" or "Wiped", in Danger. An Expired Mission site shows "Expired" in Accent text, and a Cancelled one "Cancelled" in Text muted.

# Deployment

The right pane deploys a team to the selected Mission site when it is Active, and is left out otherwise. It lists the Agents that [Deploying Agents](../../mechanics/missions.md#deploying-agents) in Missions allows to be deployed, i.e. the Agents that can take orders, under [Agents that can take orders](../../mechanics/agents-spec.md#agents-that-can-take-orders) in Agents, are [At assignment](../../mechanics/domain-model.md#agency-and-agents), and whose [Assignment](../../mechanics/domain-model.md#agency-and-agents) is [Standby](../../mechanics/agents-spec.md#assignments) or [Training](../../mechanics/agents-spec.md#assignments), and that do not meet the incapacitation condition, under [Incapacitation condition](../../mechanics/combat.md#incapacitation-condition) in Combat, in a table under [Tables](../visual-design.md#tables) in Visual Design, one row each with a selection checkbox and these columns in this order, each under its header: [Instance ID](../../foundation/campaign-instances.md#glossary), Assignment, [effective skill](../../mechanics/agents-spec.md#combatant-attributes), and [exhaustion](../../mechanics/agents-spec.md#combatant-attributes). The exhaustion of an [Agent](../../mechanics/domain-model.md#agency-and-agents) is shown only when it is at or above the threshold of [Warning on deploying tired Agents](../gui.md#warning-on-deploying-tired-agents) in the GUI, coloured under [Agent condition](../visual-design.md#agent-condition) in Visual Design, and its cell is empty otherwise. The table's default order is by Instance ID, and pressing a column header sorts it by that column, under Tables in Visual Design, so that, e.g., pressing the effective skill header puts the most skilled Agents first. The exhaustion column sorts by every Agent's exhaustion, whether its cell shows it or not. Sorting the rows changes neither which Agents are checked nor the order in which they were checked.

Above the rows, the pane shows how many places of the [Transport cap](../../mechanics/economy-and-upgrades.md#glossary) the Deployed Agents and the checked Agents together take, against the Transport cap, e.g. "Transport 3 / 4". After it, on the same line, the pane shows the Combat rating of the checked Agents taken as one side, under [Combat ratings](#combat-ratings), so that the Player can weigh the team against the Enemies' Combat rating before deploying it. It changes as Agents are checked and cleared, and is 0 while no Agent is checked../../mechanics/combat.md#incapacitation-condition) and [Combat rating](../../mechanics/combat.md#combat-rating) in Combat. The pane adds no chance of winning, because the engine returns none for a team not yet deployed.

The Deploy button is the pane's primary button. It makes one `deployAgents` [Player action](../../foundation/engine-contract.md#player-actions-and-turns) with the checked Agents in the order they were checked, after the warning under [Warning on deploying tired Agents](../gui.md#warning-on-deploying-tired-agents) in the GUI when it applies. It is disabled while no Agent is checked or while the checked Agents would exceed the Transport cap.

# Combat ratings

The Missions View shows three Combat ratings, under [Combat rating](../../mechanics/combat.md#combat-rating) in Combat: of the selected Mission site's Enemies, of a Deployed Mission's Current team, and of the checked Agents in the deployment pane; and, for a Concluded Mission site, the Combat rating of each side at Combat start and at Combat end, as its [Combat report](../../mechanics/domain-model.md#combat) records them. Each Combat rating of a side of Agents counts the [Agency](../../mechanics/domain-model.md#agency-and-agents)'s [Weapon damage Upgrades](../../mechanics/economy-and-upgrades.md#glossary) and [Armor Upgrades](../../mechanics/economy-and-upgrades.md#glossary), and none is ever shown as a [base Combat rating](../../mechanics/combat.md#combatant-condition-in-a-combat), which only the [Agent details](agents-view.md#agent-details) show, so that the Player weighs exactly the values the Combat weighs when its team considers retreating. The Player decides whom to send by comparing them, so each stands out from the figures around it in one shared style: the Label "Combat rating" followed by the value in the Figure style and Accent text, under [Colours](../visual-design.md#colours) in Visual Design, e.g. "COMBAT RATING 120".

The Enemies' Combat rating sits on the line of the Enemies heading, centred on it under [Alignment](../visual-design.md#alignment) in Visual Design, and ends at the right edge of the Enemies table, not of the pane, so that its last character lines up with the right-aligned figures of the table's last column, the base weapon damage. The Combat ratings of a Concluded Mission site sit the same way on the lines of the headings of its two participant tables. On a wide pane the spare width lies to the right of both the table and its Combat rating.

# Artboard

![Missions View panel Artboard: Active Mission sites and the Missions deployed this Turn on the left, the selected Mission site with its Enemies and Consequences in the middle, and the deployment pane with checked Agents, Transport cap usage, and the Deploy button on the right](../../../../images/artboards/missions-view.png)

![Missions View panel Artboard with the toggle on the Mission sites in a final state: each with its Instance ID, target Faction, and final state, Won, Retreated, Expired, Wiped, or Cancelled, coloured by whom it favours; and the selected Concluded Mission site, whose Enemies and Agents tables show each participant's effective skill and current health at Combat start and at Combat end, with dead rows in Danger and Incapacitated rows in Warning, each side's Combat rating at Combat start and at Combat end, and the Consequences that applied](../../../../images/artboards/missions-view-concluded.png)

The Missions View shows its [Background artwork](../visual-design.md#background-artwork), a command center, behind its panes, as the [Artboards](../visual-design.md#glossary) show.

The sample values, e.g. the Mission site names, the Instance IDs, the Enemies, the Agent IDs, and the numbers, appear only on the Artboards, under [Reading Artboards](../visual-design.md#reading-artboards) in Visual Design.
