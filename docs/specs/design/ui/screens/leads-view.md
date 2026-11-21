# Leads View

| Metadata | Value |
| --- | --- |
| Spec ID | LVIEW |
| Family | UI |
| Audience | UI designer, Implementer |
| Owns | What the Leads View of the Campaign screen shows, how its panes are arranged, and how it starts and staffs Investigations. |
| Conventions | [Specification Conventions](../../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../../governance/conventions/design-spec-conventions.md) |

# Overview

The Leads View is where the Player decides what to investigate and with whom: it shows every [Lead](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) the Player knows of, how far each [Investigation](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) has come, and what completing it would bring. It is the second of the Operations [Detail views](../gui.md#glossary) of the [Campaign Screen](campaign-screen.md). Like the [Missions View](missions-view.md), it has three panes side by side: the list of Leads, the selected Lead, and its team.

# Lead list

The left pane lists the [Discovered Leads](../../mechanics/leads-and-progression.md#glossary) in the following groups, in this order, each under its name and the number of its items. A group with no item is left out. The list is exhaustive.

1. **Active Investigations:** each [Investigation](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) whose lifecycle state is Active, under [Investigation lifecycle](../../mechanics/investigations.md#investigation-lifecycle) in Investigations, with its [Lead](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions)'s `name` and its [Completion estimate](../gui.md#glossary).
2. **Leads to investigate:** each Discovered Lead whose [Lead status](../../mechanics/leads-and-progression.md#lead-status) is Available and that has no Active Investigation, with its [Required progress range](../../mechanics/investigations.md#glossary) when it is an [Assessed Lead](../../mechanics/investigations.md#glossary), and otherwise the words "effort needed unknown".
3. **Inactive:** each Discovered Lead whose [Lead status](../../mechanics/leads-and-progression.md#glossary) is Inactive, with the [Mission site](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) it created that is not yet finished, when it has one. The list gives no other cause, because the Player is never told why a Lead is not available, under [Player-visible information](../../mechanics/leads-and-progression.md#player-visible-information) in Leads and Progression.
4. **Archived:** each Discovered Lead whose Lead status is Archived, collapsed to its name and count until the Player expands it, because it can never be investigated again.

When the Leads View opens, the first item is selected, unless the Player opened it from an item of the [Situation Panel](situation-panel.md) or of the [Turn Report View](turn-report-view.md), which selects that item's Lead. The Leads View shows the [Back control](../gui.md#glossary) when the Player reached it by following an item, under [View trail](campaign-screen.md#view-trail) in Campaign Screen.

# Selected Lead

The middle pane shows the selected Lead:

- Its `name`, its [Faction](../../mechanics/domain-model.md#factions) when it has one, its `description`, and its Lead status: Available, Inactive, i.e. it cannot be investigated for now, or Archived, i.e. it can never be investigated again. It shows no condition and no cause.
- When its `investigate_again` is `never`, a note that the Lead can be completed only once, and when it is `always`, a note that it can be investigated again after a win, under [Lead availability](../../mechanics/leads-and-progression.md#lead-availability) in Leads and Progression.
- What its completion does, under the heading "On completion", one line for each [Effect](../../foundation/effect-lists.md#glossary) of its `on_completion`, under [Completion effect](../../mechanics/leads-and-progression.md#completion-effect) in Leads and Progression: for a Mission site it creates, "Creates the Mission site", its MissionSiteArchetype's `name`, and its number of Enemies; for its Faction made [Eliminated](../../mechanics/domain-model.md#factions), "Eliminates" and the Faction's name, in Positive; and for the [Campaign](../../foundation/core-concepts.md#campaign-and-session) won, "Wins the Campaign", in Positive. A Lead whose `on_completion` is empty shows no such heading.
- For a Lead with an Active Investigation: its [Progress bar](../gui.md#glossary) with the [Investigation progress](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), the Required progress range when the Lead is an Assessed Lead, the projected progress gain, under [Projected progress gain](../../mechanics/investigations.md#projected-progress-gain) in Investigations, and the number of [Turns](../../foundation/engine-contract.md#player-actions-and-turns) since the Investigation's Turn started.
- The Lead's completion count, i.e. its Completed Investigations, when it has any.

# Team

The right pane staffs the selected Lead's Investigation. It is left out for an Inactive or Archived Lead without an Active Investigation.

- **[Current team](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions):** for an Active Investigation, each member of its [Current team](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) with its [Instance ID](../../foundation/campaign-instances.md#glossary) and [effective skill](../../mechanics/agents-spec.md#combatant-attributes), a member [In transit](../../mechanics/domain-model.md#agency-and-agents) marked as such, and a Recall control that assigns the member to [Standby](../../mechanics/agents-spec.md#assignments) through `assignAgents` at once, without a confirmation, because Undo Action takes it back. The Recall control of a member In transit is disabled, because an [Agent](../../mechanics/domain-model.md#agency-and-agents) In transit cannot take orders, under [Agents that can take orders](../../mechanics/agents-spec.md#agents-that-can-take-orders) in Agents.
- **Agents to add:** the [Agents](../../mechanics/domain-model.md#agency-and-agents) that can take orders, under [Agents that can take orders](../../mechanics/agents-spec.md#agents-that-can-take-orders) in Agents, whose [Assignment](../../mechanics/domain-model.md#agency-and-agents) is a [Base Assignment](../../mechanics/agents-spec.md#assignments), i.e. Standby or [Training](../../mechanics/agents-spec.md#assignments), and that are [Fit to start work](../../mechanics/agents-spec.md#assignments), in a table under [Tables](../visual-design.md#tables) in Visual Design, one row each with a checkbox and these columns, each under its header, in this order: Instance ID, [Assignment](../../mechanics/domain-model.md#agency-and-agents), effective skill, [base skill](../../mechanics/agents-spec.md#combatant-attributes), and [exhaustion](../../mechanics/agents-spec.md#combatant-attributes), coloured under [Agent condition](../visual-design.md#agent-condition) in Visual Design. Its default order is by effective skill, highest first, and then by Instance ID. Pressing a column header sorts it by that column, under Tables.
- **Team progress estimate:** while at least one [Agent](../../mechanics/domain-model.md#agency-and-agents) is checked, the gain per Advance turn of the team the primary button would make, under [Team progress estimate](../../mechanics/investigations.md#team-progress-estimate) in Investigations, in [progress points](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), e.g. "Est. +3.62 / turn": for Start, of the checked Agents; for Assign, of the Current team together with the checked Agents. It is an estimate, because it takes every Agent's effective skill as it is now and counts no Advance turn In transit.
- **Primary button:** for a Lead to investigate, Start makes one `startInvestigation` [Player action](../../foundation/engine-contract.md#player-actions-and-turns) with the checked Agents, under [Starting an Investigation](../../mechanics/investigations.md#starting-an-investigation) in Investigations; for an Active Investigation, Assign makes one `assignAgentsToInvestigation`, under [Assigning Agents to an Investigation](../../mechanics/investigations.md#assigning-agents-to-an-investigation) in Investigations. Either is disabled while no Agent is checked.

The Team progress estimate is the engine's, not the GUI's, under [API hierarchy](../../foundation/engine-contract.md#api-hierarchy) in Engine Contract. Once the Player action is made, the middle pane shows the Investigation's projected progress gain, which counts only the members [At assignment](../../mechanics/domain-model.md#agency-and-agents).

# Artboard

![Leads View panel Artboard, as reached by following an item of the Turn Report View, so that its title row shows the Back control "‹ Turn report" before its close control: Active Investigations, Leads to investigate, one with its Required progress range and one marked effort needed unknown, and Inactive and Archived Leads on the left; the selected Lead with its description, Progress bar, and the Mission site its completion creates in the middle; and its Current team, the Agents to add table, and the Team progress estimate on the right](../../../../images/artboards/leads-view.png)

The sample values, e.g. the Lead names, their descriptions, and the Agent IDs, appear only on the Artboard, under [Reading Artboards](../visual-design.md#reading-artboards) in Visual Design.
