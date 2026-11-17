# Leads View

| Metadata    | Value                                                                                                                                                                            |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | LVIEW                                                                                                                                                                            |
| Family      | UI                                                                                                                                                                               |
| Audience    | UI designer, Implementer                                                                                                                                                         |
| Owns        | What the Leads View of the Campaign screen shows, how its panes are arranged, and how it starts and staffs Investigations.                                                       |
| Conventions | [Specification conventions](../../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../../governance/conventions/design-spec-conventions.md) |

# Overview

The Leads View is where the Player decides what to investigate and with whom: it shows every [Lead](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) the Player knows of,
how far each [Investigation](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) has come, and what completing it would bring. It is the second of the Operations
[Detail views](../gui.md#glossary) of the [Campaign Screen](campaign-screen.md). Like the
[Missions View](missions-view.md), it has three panes side by side: the list of Leads, the selected Lead, and its team.

# Lead list

The left pane lists the [Discovered Leads](../../mechanics/leads-and-progression.md#glossary) in the following groups, in this order, each under its name and the number of its
items. A group with no item is left out. The list is exhaustive.

1. **Active Investigations:** each [Investigation](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) whose lifecycle state is Active, under
   [Investigation lifecycle](../../mechanics/investigations.md#investigation-lifecycle) in Investigations, with its [Lead](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions)'s `name` and its [Completion estimate](../gui.md#glossary).
2. **Leads to investigate:** each Discovered Lead whose [Lead status](../../mechanics/leads-and-progression.md#lead-status) is Available and that has no Active
   Investigation, with its [Required progress range](../../mechanics/investigations.md#glossary) when it is an [Assessed Lead](../../mechanics/investigations.md#glossary), and otherwise that the range is unknown.
3. **Inactive:** each Discovered Lead whose [Lead status](../../mechanics/leads-and-progression.md#glossary) is Inactive, with the [Mission site](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) it created that is not yet
   finished, because that is its [Blocking condition](../../mechanics/leads-and-progression.md#glossary), under [Lead availability](../../mechanics/leads-and-progression.md#lead-availability) in Leads and Progression.
4. **Archived:** each Discovered Lead whose Lead status is Archived, collapsed to its name and count until the Player
   expands it, because it can never be investigated again.

When the Leads View opens, the first item is selected, unless the Player opened it from an item of the
[Situation Panel](situation-panel.md), which selects that item's Lead.

# Selected Lead

The middle pane shows the selected Lead:

- Its `name`, its [Faction](../../mechanics/domain-model.md#factions), its `description`, and its Lead status, with each of its Blocking conditions when it is not
  Available.
- Its prerequisites, each with whether it holds, under [Prerequisites](../../mechanics/leads-and-progression.md#prerequisites) in Leads and Progression.
- The Mission site its completion creates: its MissionSiteArchetype's `name` and its number of Enemies, under
  [Completion effect](../../mechanics/leads-and-progression.md#completion-effect) in Leads and Progression.
- For a Lead with an Active Investigation: its [Progress bar](../gui.md#glossary) with the [Investigation progress](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), the Required
  progress range when the Lead is an Assessed Lead, the projected progress gain, under [Projected progress gain](../../mechanics/investigations.md#projected-progress-gain) in Investigations, and the number of
  [Turns](../../foundation/engine-contract.md#player-actions-and-turns) since the Investigation's Turn started.
- The Lead's completion count, i.e. its Completed Investigations, when it has any.

# Team

The right pane staffs the selected Lead's Investigation. It is left out for an Inactive or Archived Lead without an
Active Investigation.

- **[Current team](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions):** for an Active Investigation, each member of its [Current team](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) with its [Instance ID](../../foundation/campaign-instances.md#glossary) and
  [effective skill](../../mechanics/agents-spec.md#combatant-attributes), a member [In transit](../../mechanics/domain-model.md#agency-and-agents) marked as such, and a Recall control that assigns the member to
  [Standby](../../mechanics/agents-spec.md#assignments) through `assignAgents`, after the confirmation under
  [Confirming interrupted Assignments](../gui.md#confirming-interrupted-assignments) in the GUI.
- **Agents to add:** the [Agents](../../mechanics/domain-model.md#agency-and-agents) that can be assigned, under [Agents that can be assigned](../../mechanics/agents-spec.md#agents-that-can-be-assigned) in Agents, and are [Fit for work](../../mechanics/agents-spec.md#assignments) and are not on this
  Investigation, one row each with a checkbox, its Instance ID, its [Assignment](../../mechanics/domain-model.md#agency-and-agents), and its effective skill.
- **Primary button:** for a Lead to investigate, Start makes one `startInvestigation` [Player action](../../foundation/engine-contract.md#player-actions-and-turns) with the checked
  Agents, under [Starting an Investigation](../../mechanics/investigations.md#starting-an-investigation) in Investigations; for an Active Investigation, Assign makes one
  `assignAgentsToInvestigation`, under [Assigning Agents to an Investigation](../../mechanics/investigations.md#assigning-agents-to-an-investigation) in Investigations. Either
  asks for the confirmation under Confirming interrupted Assignments when it takes an [Agent](../../mechanics/domain-model.md#agency-and-agents) off [Contracting](../../mechanics/agents-spec.md#assignments) or another
  Investigation, and is disabled while no Agent is checked.

The pane shows no gain for the checked Agents, because the engine returns a projected progress gain only for an
Active Investigation's Current team; the gain is shown in the middle pane once the Player action is made.

# Artboard

![Leads View panel Artboard: Active Investigations, Leads to investigate, and Inactive and Archived Leads on the left; the selected Lead with its description, Progress bar, and the Mission site its completion creates in the middle; and its Current team with Agents to add on the right](../../../../images/artboards/leads-view.png)

The sample values, e.g. the Lead names, their descriptions, and the Agent IDs, appear only on the Artboard, under
[Reading Artboards](../visual-design.md#reading-artboards) in Visual Design.
