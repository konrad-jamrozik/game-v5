# History View

| Metadata | Value |
| --- | --- |
| Spec ID | HVIEW |
| Family | UI |
| Audience | UI designer, Implementer |
| Owns | What the History View of the Campaign screen shows and in which order: its columns, the events of each Turn with the links from its Missions to their Mission sites, and the list of each Turn's Player actions. |
| Conventions | [Specification Conventions](../../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../../governance/conventions/design-spec-conventions.md) |

# Overview

The History View lets the Player find the [Turn](../../foundation/engine-contract.md#player-actions-and-turns) in which something changed in the [Campaign](../../foundation/core-concepts.md#campaign-and-session), and see what the player did in that Turn and what came of it. It is one of the Records [Detail views](../gui.md#glossary) of the [Campaign Screen](campaign-screen.md); the trends over the same Turns are in the [Charts View](charts-view.md).

It shows one row for each [History entry](../../foundation/world-history.md#glossary) that `getHistory()` returns, under [Current world state, Turn report, and history](../../foundation/world-history.md#current-world-state-turn-report-and-history) in History and Turn Report, and one row for the current Turn from its [Open History entry](../../foundation/world-history.md#glossary), so that the Player sees this Turn's decisions so far beside earlier Turns, as if the Turn ended now. The current Turn's row follows every Player action, undo, and redo, e.g. an undone `hireAgent` leaves its list and its Agent leaves its Agents count, and a redo puts both back.

# Turn by Turn table

The [Turn](../../foundation/engine-contract.md#player-actions-and-turns) by Turn table lists one row per ended Turn and one row for the current Turn, newest first, so the current Turn's row is at the top, under [Tables](../visual-design.md#tables) in Visual Design. Once the [Campaign](../../foundation/core-concepts.md#campaign-and-session) has a [Campaign ending](../../mechanics/domain-model.md#campaign-standing), no [Player action](../../foundation/engine-contract.md#player-actions-and-turns) can follow, so the table has no row for the current Turn. Before the first committed Advance turn of a Campaign, the current Turn's row is the only one. Its columns are the following, in this order; the list is exhaustive.

| Column | What it shows for Turn t | Form |
| --- | --- | --- |
| Turn | The turn number t. | A number. |
| Money start | Money at the start of turn for Turn t, under [Turn series of money](../../mechanics/economy-and-upgrades.md#turn-series-of-money) in Economy and Upgrades. | A number. |
| Expenditures | The money spent by the [Player actions](../../foundation/engine-contract.md#player-actions-and-turns) of Turn t: the sum of the money changes below 0 in its [Action record](../../foundation/world-history.md#glossary), under [Action record](../../foundation/world-history.md#action-record) in History and Turn Report, as a positive amount. | "−" and the amount in Danger, or "0" in Text muted when nothing was spent. |
| Money end | Money at the end of turn for Turn t, under [Turn series](../../foundation/world-history.md#glossary) of money. | A number. |
| Income | The income that the [Agency](../../mechanics/domain-model.md#agency-and-agents) income step of the Advance turn ending Turn t added, under [Agency income](../../mechanics/economy-and-upgrades.md#agency-income) in Economy and Upgrades. | "+" and the amount in Positive. |
| Upkeep | The upkeep that the Upkeep step of that Advance turn charged, under [Upkeep](../../mechanics/economy-and-upgrades.md#upkeep) in Economy and Upgrades. | "−" and the amount in Danger. |
| Panic | [Panic](../../mechanics/domain-model.md#campaign-standing) after that Advance turn. | A percentage with two decimals. |
| Agents | The number of [Serving](../../mechanics/agents-spec.md#agent-statuses) [Agents](../../mechanics/domain-model.md#agency-and-agents) in the [Turn-end state](../../foundation/engine-contract.md#player-actions-and-turns) of Turn t. | A number. |
| Player actions | The number of items in the Action record of Turn t, which opens the list under [Player actions list](#player-actions-list). | A number after "▸", or "▾" while its list is open; "0" in Text muted, with no marker. |
| Events | What the Advance turn ending Turn t did, under [Events](#events). | Short labels side by side. |

The current Turn's row shows each column as if the Advance turn ending it were committed at the [Current world state](../../foundation/engine-contract.md#player-actions-and-turns), as far as that is known before it is committed:

- **Turn:** t, followed by "now" in Text muted.
- **Money end:** the Agency's money in the Current world state.
- **Income and Upkeep:** the projected income and projected upkeep, under [Projected income and upkeep](../../mechanics/economy-and-upgrades.md#projected-income-and-upkeep) in Economy and Upgrades, which that Advance turn would add and charge exactly.
- **Panic:** Panic in the Current world state, since what that Advance turn would change depends on events not yet resolved.
- **Agents:** the number of Serving Agents in the Current world state.
- **Events:** empty, since no Advance turn has ended the Turn.
- **Money start, Expenditures, and Player actions:** as for an ended Turn, from the [Open History entry](../../foundation/world-history.md#glossary).

Every column except Events holds numbers, under Tables in Visual Design. The four money columns read from left to right as the Turn's money flow: Money start less Expenditures is Money end, unless a [Player cheat action](../../foundation/engine-contract.md#player-actions-and-turns) added money, and Money end plus Income less Upkeep is the next Turn's Money start, unless the Turn's events changed money too, e.g. the Consequences of a Mission.

# Events

The Events column lists the following labels, in this order, each only when it applies; the list is exhaustive. Each counts or names what the reduced [Turn report](../../foundation/campaign-state.md#glossary) in the [History entry](../../foundation/world-history.md#glossary) holds, under the specification that owns it.

1. **Each [Mission](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions):** for each [Combat](../../mechanics/domain-model.md#combat) the Advance turn fought, in the order of its [Combat reports](../../mechanics/domain-model.md#combat), under [Combat report](../../mechanics/combat.md#combat-report) in Combat, its [Mission site](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions)'s [MissionSiteArchetype](../../mechanics/missions.md#missionsitearchetype) `name` followed by "won" in Positive or "lost" in Danger, and then ", N killed" when N of its Agents were [Killed](../../mechanics/agents-spec.md#agent-statuses); e.g. "Apprehend member won, 1 killed". The label is a link to its Mission site, under [Mission links](#mission-links).
2. **Investigations completed:** "N Investigations completed", or "1 [Investigation](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) completed", in Positive, under [Turn report](../../mechanics/investigations.md#turn-report) in Investigations.
3. **Leads discovered:** "N [Leads](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) discovered", or "1 Lead discovered", in Notice, because a discovered Lead is welcome news that asks for no action, under [Turn report](../../mechanics/leads-and-progression.md#turn-report) in Leads and Progression.
4. **Mission sites expired:** "N Mission sites expired", or "1 Mission site expired", in Accent text, under [Turn report](../../mechanics/missions.md#turn-report) in Missions.
5. **[Campaign ending](../../mechanics/domain-model.md#campaign-standing):** "Victory" in Positive or "Defeat" in Danger, when the Advance turn gave the [Campaign](../../foundation/core-concepts.md#campaign-and-session) its [Campaign ending](../../mechanics/domain-model.md#campaign-standing), under [Panic and Endings](../../mechanics/panic-and-endings.md).

A Turn with none of these leaves the cell empty. Labels too many for the column's width are cut short with "…" and shown in full while the pointer rests on the cell, under Tables in Visual Design.

## Mission links

The Player who sees that a Mission was won or lost wants to see how, so each Mission label leads to its Mission site in full. Pressing it opens the [Missions View](missions-view.md) with that Mission site selected, which shows it as a [Concluded Mission site](missions-view.md#concluded-mission-site) with its participants and the [Consequences](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) that applied. It is a Follow under [View trail](campaign-screen.md#view-trail) in Campaign Screen, so the Escape key and the [Back control](../gui.md#glossary) return to the History View as the Player left it, with its open Player actions lists and its scroll position. The label keeps its colour, and the pointer resting on it underlines it and shows that it can be pressed.

# Player actions list

Pressing the Player actions cell of a Turn whose Action record is not empty opens, directly under that Turn's row, a list of what the player did in that Turn, and pressing it again closes the list; the Player can open the lists of several Turns at once. Like the [Combat log](../../mechanics/combat.md#combat-rounds-and-results) of a [Combat report](turn-report-view.md#combat-report), every list is closed when the View opens. The current Turn's list stays open while its Action record changes, and closes when an undo empties it; the list of a Turn stays open when Advance turn ends that Turn. The list spans the width of the table and shows one line for each item of the Action record, in its order, so the Turn's row stays one line tall.

Each line starts with the number of the Player action in the Turn, from 1, in the Figure style and Text muted, followed by what that Player action did, under the following table, and ends with its money change in the Figure style, "−" and the amount in Danger or "+" and the amount in Positive, or nothing when it is 0. Consecutive items that name the same operation with the same arguments are one line, and so are consecutive `hireAgents` items whatever their `count`; the line is numbered with the first and last of their numbers, e.g. "1–4", and its count and money change are their totals. E.g., four `hireAgents` of 1 Agent each followed by three `purchaseUpgrade` of the Agent cap Upgrade are the two lines "1–4 Hired 4 Agents" and "5–7 Bought 3 Agent cap Upgrades", and one `hireAgents` of 12 Agents is the line "1 Hired 12 Agents". The table is exhaustive.

| Operation | Line, where N is the number of Agents the arguments name, for `hireAgents` the sum of the `count` of the items the line covers, or for `purchaseUpgrade` the number of items the line covers |
| --- | --- |
| `hireAgents` | "Hired N Agents". |
| `dismissAgents` | "[Dismissed](../../mechanics/agents-spec.md#agent-statuses) N Agents". |
| `purchaseUpgrade` | "Bought N" and the [Upgrade](../../mechanics/economy-and-upgrades.md#upgrade)'s `name` followed by "[Upgrades](../../mechanics/domain-model.md#agency-and-agents)", e.g. "Bought 3 Agent cap Upgrades". |
| `assignAgents` | "Assigned N Agents to" and the [Assignment](../../mechanics/domain-model.md#agency-and-agents), e.g. "Assigned 5 Agents to Contracting". |
| `startInvestigation` | "Started Investigation of" and the [Lead](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions)'s `name`, then "with N Agents", e.g. "Started Investigation of Locate Red Dawn courier with 2 Agents". |
| `assignAgentsToInvestigation` | "Assigned N Agents to Investigation of" and its Lead's `name`. |
| `deployAgents` | "[Deployed](../../mechanics/agents-spec.md#assignments) N Agents to" and the Mission site's MissionSiteArchetype `name`, e.g. "Deployed 3 Agents to Raid safehouse". |
| `addMoney` | "Added" and the amount, then "money (cheat)"; for a negative amount, "Removed" and the amount without its sign, then "money (cheat)". |
| `addAgents` | "Added N Agents (cheat)". |
| Any other operation | The operation's name, e.g. that of a Player action a later Mechanics specification adds. |

A count of 1 takes the singular, e.g. "Hired 1 Agent". No line names the Agents an action concerned; a line names only the Lead or Mission site it concerned, resolved through `getCurrentLiveWorldState()`, or through `getCurrentRetiredWorldState()` when it is [Retired](../../foundation/world-history.md#glossary).

# Artboard

![History View panel Artboard: the Turn by Turn table, newest first, with the current Turn's row marked "now" on top, with Expenditures and upkeep in Danger, income in Positive, a Player actions count on each row with the list of Turn 14 open, and the events of each Turn, the won Mission of Turn 14 underlined as the pointer rests on its link, and the discovered Lead of Turn 15 in Notice](../../../../images/artboards/history-view.png)

The sample values, e.g. the Turn numbers, the events of each Turn, and the Player actions, appear only on the Artboard, under [Reading Artboards](../visual-design.md#reading-artboards) in Visual Design.
