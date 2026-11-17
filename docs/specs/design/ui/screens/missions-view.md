# Missions View

| Metadata    | Value                                                                                                                                                                            |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | MVIEW                                                                                                                                                                            |
| Family      | UI                                                                                                                                                                               |
| Audience    | UI designer, Implementer                                                                                                                                                         |
| Owns        | What the Missions View of the Campaign screen shows, how its panes are arranged, and how it deploys Agents.                                                                      |
| Conventions | [Specification conventions](../../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../../governance/conventions/design-spec-conventions.md) |

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
the [Situation Panel](situation-panel.md), which selects that item's Mission site.

# Selected Mission site

The middle pane shows the selected Mission site:

- Its MissionSiteArchetype's `name`, its kind, its origin, i.e. the [Lead](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) of the [Investigation](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) that created an
  [Initiative Mission site](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) or the [Faction operation level](../../mechanics/factions.md#glossary) that created a [Response Mission site](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), its target Faction, its
  Turn created, and its Turns until expiration, under [Mission site properties](../../mechanics/missions.md#mission-site-properties) in Missions.
- Its Enemies, in their order, one row each with the EnemyArchetype's `name`, [base skill](../../mechanics/agents-spec.md#combatant-attributes), [current health](../../mechanics/agents-spec.md#combatant-attributes) against [base
  health](../../mechanics/agents-spec.md#combatant-attributes), and [base weapon damage](../../mechanics/agents-spec.md#combatant-attributes), under [Player-visible information](../../mechanics/combat.md#player-visible-information) in Combat, and the
  [Combat rating](../../mechanics/combat.md#combat-rating) of the Enemies' side above the rows.
- Its [Consequences](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) for each final state, under [Consequences](../../mechanics/missions.md#consequences) in Missions: what a Won Mission changes,
  and what a Lost Mission or an Expired Mission site changes, each change written as what it does, e.g. "+60 money",
  "Panic −5", or "Red Dawn Eliminated".

For a Mission site that is no longer Active, the pane also shows its Mission, if any, with its Team sent and its
lifecycle state.

# Deployment

The right pane deploys a team to the selected Mission site when it is Active, and is left out otherwise. It lists the
Agents that [Deploying Agents](../../mechanics/missions.md#deploying-agents) in Missions allows to be deployed, i.e. the Agents that
can be assigned, under [Agents that can be assigned](../../mechanics/agents-spec.md#agents-that-can-be-assigned) in Agents, and whose [Assignment](../../mechanics/domain-model.md#agency-and-agents) is [Standby](../../mechanics/agents-spec.md#assignments) or [Training](../../mechanics/agents-spec.md#assignments), one row each with a checkbox,
its [Instance ID](../../foundation/campaign-instances.md#glossary), its Assignment, and its [effective skill](../../mechanics/agents-spec.md#combatant-attributes). An [Agent](../../mechanics/domain-model.md#agency-and-agents) whose [exhaustion](../../mechanics/agents-spec.md#combatant-attributes) is at or above the threshold
of [Warning on deploying tired Agents](../gui.md#warning-on-deploying-tired-agents) in the GUI shows its exhaustion in Accent text.

Above the rows, the pane shows how many places of the [Transport cap](../../mechanics/economy-and-upgrades.md#glossary) the Deployed Agents and the checked Agents
together take, against the Transport cap, e.g. "Transport 3 / 4". The pane adds no other figure, e.g. no sum of the
checked Agents' effective skills and no chance of winning, because the engine returns neither for a team not yet
deployed.

The Deploy button is the pane's primary button. It makes one `deployAgents` [Player action](../../foundation/engine-contract.md#player-actions-and-turns) with the checked Agents in the
order they were checked, after the warning under [Warning on deploying tired Agents](../gui.md#warning-on-deploying-tired-agents) in the GUI when it
applies. It is disabled while no Agent is checked or while the checked Agents would exceed the Transport cap.

# Artboard

![Missions View panel Artboard in the Field HUD direction: Active Mission sites and the Missions deployed this Turn on the left, the selected Mission site with its Enemies and Consequences in the middle, and the deployment pane with checked Agents, Transport cap usage, and the Deploy button on the right](../../../../images/artboards/missions-view.png)

The sample values, e.g. the Mission site names, the Enemies, and the Agent IDs, appear only on the Artboard, under
[Reading Artboards](../visual-design.md#reading-artboards) in Visual Design.
