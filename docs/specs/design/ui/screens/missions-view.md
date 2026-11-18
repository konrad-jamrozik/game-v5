# Missions View

| Metadata    | Value                                                                                                                                                                            |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | MVIEW                                                                                                                                                                            |
| Family      | UI                                                                                                                                                                               |
| Audience    | UI designer, Implementer                                                                                                                                                         |
| Owns        | What the Missions View of the Campaign screen shows, how its panes are arranged, and how it deploys Agents.                                                                      |
| Conventions | [Specification Conventions](../../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../../governance/conventions/design-spec-conventions.md) |

# Overview

The Missions View is where the Player answers [Mission sites](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions): it shows what waits at each one, what winning or losing it
would change, and lets the Player send a team. It is the first of the Operations [Detail views](../gui.md#glossary) of the
[Campaign Screen](campaign-screen.md). It reads left to right as the Player decides: which Mission site, what is there,
and who goes. It has three panes side by side: the list of Mission sites, the selected Mission site, and the
deployment.

# Mission site list

The left pane lists, by default, two groups, each under its name and the number of its items:

1. **Active [Mission sites](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions):** each Mission site whose lifecycle state is Active, under
   [Mission site lifecycle](../../mechanics/missions.md#mission-site-lifecycle) in Missions, soonest to expire first, with its [MissionSiteArchetype](../../mechanics/missions.md#missionsitearchetype)'s `name`,
   its kind and target [Faction](../../mechanics/domain-model.md#factions), and its [Turns](../../foundation/engine-contract.md#player-actions-and-turns) until expiration, under
   [Mission site properties](../../mechanics/missions.md#mission-site-properties) in Missions.
2. **Deployed this Turn:** each [Mission](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) whose lifecycle state is [Deployed](../../mechanics/agents-spec.md#assignments), under [Mission lifecycle](../../mechanics/missions.md#mission-lifecycle) in
   Missions, with its Mission site's MissionSiteArchetype `name` and the number of [Agents](../../mechanics/domain-model.md#agency-and-agents) in its Team sent. Its
   [Combat](../../mechanics/domain-model.md#combat) is fought in the next Advance turn.

A toggle replaces both groups with the Mission sites in a final state, newest first, each with the final state it
reached, e.g. Concluded with its Mission Won, or Expired. The toggle is one step away because those Mission sites need
no decision.

When the Missions View opens, the first Active Mission site is selected, unless the Player opened it from an item of
the [Situation Panel](situation-panel.md) or of the [Turn Report View](turn-report-view.md), which selects that item's
Mission site.

# Selected Mission site

The middle pane shows the selected Mission site:

- Its MissionSiteArchetype's `name`, its kind, its origin, i.e. the [Lead](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) of the [Investigation](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) that created an
  [Initiative Mission site](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) or the [Faction operation level](../../mechanics/factions.md#glossary) that created a [Response Mission site](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), its target Faction, its
  Turn created, and its Turns until expiration, under [Mission site properties](../../mechanics/missions.md#mission-site-properties) in Missions.
- Its Enemies, in their order, one row each with the EnemyArchetype's `name`, [base skill](../../mechanics/agents-spec.md#combatant-attributes), [current health](../../mechanics/agents-spec.md#combatant-attributes) against [base
  health](../../mechanics/agents-spec.md#combatant-attributes), and [base weapon damage](../../mechanics/agents-spec.md#combatant-attributes), under [Player-visible information](../../mechanics/combat.md#player-visible-information) in Combat, and the
  [Combat rating](../../mechanics/combat.md#combat-rating) of the Enemies' side beside the Enemies heading, under
  [Combat ratings](#combat-ratings).
- Its [Consequences](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) for each final state, under [Consequences](../../mechanics/missions.md#consequences) in Missions: what a Won Mission changes,
  and what a Lost Mission or an Expired Mission site changes, each change written as what it does, e.g. "+60 money",
  "Panic −5", or "Red Dawn Eliminated".

For a Mission site that is no longer Active, the pane also shows its Mission, if any, with its Team sent and its
lifecycle state. While the Mission is Deployed, a row under the Team sent shows the [Combat rating](../../mechanics/combat.md#combatant-condition-in-a-combat) of its [Current team](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions),
which is its Team sent, under [Combat ratings](#combat-ratings). Once the Mission is Won or Lost, the row is left out,
because its Agents' values have changed since its Combat; the Combat ratings its Combat had are in its
[Combat report](turn-report-view.md#combat-report).

# Deployment

The right pane deploys a team to the selected Mission site when it is Active, and is left out otherwise. It lists the
Agents that [Deploying Agents](../../mechanics/missions.md#deploying-agents) in Missions allows to be deployed, i.e. the Agents that
can be assigned, under [Agents that can be assigned](../../mechanics/agents-spec.md#agents-that-can-be-assigned) in Agents, are [At assignment](../../mechanics/domain-model.md#agency-and-agents), and whose [Assignment](../../mechanics/domain-model.md#agency-and-agents) is [Standby](../../mechanics/agents-spec.md#assignments) or [Training](../../mechanics/agents-spec.md#assignments), in a table under
[Tables](../visual-design.md#tables) in Visual Design, one row each with a selection checkbox and these columns in this order, each under
its header: [Instance ID](../../foundation/campaign-instances.md#glossary), Assignment, [effective skill](../../mechanics/agents-spec.md#combatant-attributes), and [exhaustion](../../mechanics/agents-spec.md#combatant-attributes). The exhaustion of an [Agent](../../mechanics/domain-model.md#agency-and-agents) is shown only when it is at or above the
threshold of [Warning on deploying tired Agents](../gui.md#warning-on-deploying-tired-agents) in the GUI, coloured under [Agent condition](../visual-design.md#agent-condition) in Visual Design, and its
cell is empty otherwise. The table's default order is by Instance ID, and pressing a column header sorts it by that
column, under Tables in Visual Design, so that, e.g., pressing the effective skill header puts the most skilled Agents
first. The exhaustion column sorts by every Agent's exhaustion, whether its cell shows it or not. Sorting the rows changes neither which Agents are checked nor the order in which they were checked.

Above the rows, the pane shows how many places of the [Transport cap](../../mechanics/economy-and-upgrades.md#glossary) the Deployed Agents and the checked Agents
together take, against the Transport cap, e.g. "Transport 3 / 4". After it, on the same line, the pane shows the
Combat rating of the checked Agents taken as one side, under [Combat ratings](#combat-ratings), so that the Player can
weigh the team against the Enemies' Combat rating before deploying it. It changes as Agents are checked and cleared,
and is 0 while no Agent is checked. An Agent that meets the incapacitation condition adds nothing to it, under
[Incapacitation condition](../../mechanics/combat.md#incapacitation-condition) and
[Combat rating](../../mechanics/combat.md#combat-rating) in Combat. The pane adds no chance of winning, because the engine
returns none for a team not yet deployed.

The Deploy button is the pane's primary button. It makes one `deployAgents` [Player action](../../foundation/engine-contract.md#player-actions-and-turns) with the checked Agents in the
order they were checked, after the warning under [Warning on deploying tired Agents](../gui.md#warning-on-deploying-tired-agents) in the GUI when it
applies. It is disabled while no Agent is checked or while the checked Agents would exceed the Transport cap.

# Combat ratings

The Missions View shows three Combat ratings, under [Combat rating](../../mechanics/combat.md#combat-rating) in
Combat: of the selected Mission site's Enemies, of a Deployed Mission's Current team, and of the checked Agents in the
deployment pane. The Player decides whom to send by comparing them, so each stands out from the figures around it in
one shared style: the Label "Combat rating" followed by the value in the Figure style and Accent text, under
[Colours](../visual-design.md#colours) in Visual Design, e.g. "COMBAT RATING 120".

The Enemies' Combat rating sits on the line of the Enemies heading, centred on it under
[Alignment](../visual-design.md#alignment) in Visual Design, and ends at the right edge of the Enemies table, not of
the pane, so that its last character lines up with the right-aligned figures of the table's last column, the base
weapon damage. On a wide pane the spare width lies to the right of both the table and its Combat rating.

# Artboard

![Missions View panel Artboard: Active Mission sites and the Missions deployed this Turn on the left, the selected Mission site with its Enemies and Consequences in the middle, and the deployment pane with checked Agents, Transport cap usage, and the Deploy button on the right](../../../../images/artboards/missions-view.png)

The Missions View shows its [Background artwork](../visual-design.md#background-artwork), a command center, behind its
panes, as the [Artboard](../visual-design.md#glossary) shows.

The sample values, e.g. the Mission site names, the Enemies, and the Agent IDs, appear only on the Artboard, under
[Reading Artboards](../visual-design.md#reading-artboards) in Visual Design.
