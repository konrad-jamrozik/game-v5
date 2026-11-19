# Turn Report View

| Metadata | Value |
| --- | --- |
| Spec ID | TRVIEW |
| Family | UI |
| Audience | UI designer, Implementer |
| Owns | What the Turn Report View of the Campaign screen shows of the most recent Turn report, and how it opens a Combat report or reopens the Turn summary. |
| Conventions | [Specification Conventions](../../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../../governance/conventions/design-spec-conventions.md) |

# Overview

The Turn Report View shows in full what the most recent Advance turn did, so that the Player can look past the [Turn Summary](turn-summary.md) into every fact of it. It is the first of the Records [Detail views](../gui.md#glossary) of the [Campaign Screen](campaign-screen.md), and the Turn summary's offer to open the full [Turn report](../../foundation/campaign-state.md#glossary) opens it.

It shows only the Turn report of the most recent committed Advance turn, because a [Campaign](../../foundation/core-concepts.md#campaign-and-session) keeps no other in full, under [Turn report and history](../../foundation/world-history.md#turn-report-and-history) in History and Turn Report; earlier [Turns](../../foundation/engine-contract.md#player-actions-and-turns) are read in the reduced form of the [History View](history-view.md). Its heading names the Turn that Advance turn ended and the Turn it began. Before the first committed Advance turn of a Campaign, it says that there is no Turn report yet.

A Turn summary button in its title row, to the left of its close control, reopens the Turn summary of the Turn report it shows, under [Showing and dismissing](turn-summary.md#showing-and-dismissing) in Turn Summary. The button is disabled, not hidden, when there is no Turn report yet or the Turn summary would have no group, so that the title row keeps the same controls from Turn to Turn.

# Sections

The Turn Report View shows the following sections in this order, each under a Group heading with the number of its items, under [Panels and cards](../visual-design.md#panels-and-cards) in Visual Design. They are exactly what the [Turn report](../../foundation/campaign-state.md#glossary) holds, each under the specification that owns it, so a section with nothing to show is left out and the View adds no section of its own, e.g. none for money or Panic, which the History View shows. The list is exhaustive.

1. **Missions:** one row for each [Combat report](../../mechanics/domain-model.md#combat), under [Combat report](../../mechanics/combat.md#combat-report) in [Combat](../../mechanics/domain-model.md#combat): its [Mission](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions)'s [Mission site](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) by its MissionSiteArchetype's `name`, whether the Mission is Won or Lost with its [Combat outcome](../../mechanics/combat.md#combat-rounds-and-results) and number of [Combat rounds](../../mechanics/combat.md#combat-rounds-and-results), the number of [Agents](../../mechanics/domain-model.md#agency-and-agents) on its side, the Agents [Killed](../../mechanics/agents-spec.md#agent-statuses), the Enemies dead out of the Enemies present, and the sum of the [Mission skill gains](../../mechanics/agents-spec.md#growth) of its survivors, under [Turn report](../../mechanics/missions.md#turn-report) in Missions, e.g. "+176 skill". A Combat report button on the row opens that Combat report.
2. **[Investigations](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) completed:** each under [Turn report](../../mechanics/investigations.md#turn-report) in Investigations, with its [Lead](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions)'s `name`, the gain of the Advance turn, and its final [Investigation progress](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions).
3. **Mission sites:** the [Mission sites](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) created, Expired, and Cancelled, under [Turn report](../../mechanics/missions.md#turn-report) in Missions, each with its MissionSiteArchetype's `name`, its [Instance ID](../../foundation/campaign-instances.md#glossary) in Text muted, its target [Faction](../../mechanics/domain-model.md#factions), and what happened to it, a created one with its [Turns](../../foundation/engine-contract.md#player-actions-and-turns) until expiration and an Expired one with its [Consequences](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions).
4. **Leads discovered:** each under [Turn report](../../mechanics/leads-and-progression.md#turn-report) in Leads and Progression, with its `name`.
5. **Investigations interrupted:** each [Investigation](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) that the Advance turn ended because its Lead can no longer be investigated, under [Lead no longer available](../../mechanics/investigations.md#lead-no-longer-available) in Investigations, with its Lead's `name`. This section is left out when there is none.

Selecting a Mission site, an [Investigation](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), or a Lead opens the Operations [Detail view](../gui.md#glossary) that details it, with it selected, e.g. a new Mission site opens the [Missions View](missions-view.md) and a discovered Lead the [Leads View](leads-view.md). It is a Follow under [View trail](campaign-screen.md#view-trail) in Campaign Screen, so the Escape key and the [Back control](../gui.md#glossary) return to the Turn Report View.

# Combat report

The Combat report of a Mission opens one step away, in place of the sections, as a Follow under [View trail](campaign-screen.md#view-trail) in Campaign Screen, so the Escape key and the Back control return to them. The [Turn summary](turn-summary.md#glossary) opens it too, from its Mission card, under [Mission cards](turn-summary.md#mission-cards) in Turn Summary. It shows every fact the Combat report holds, under [Combat report](../../mechanics/combat.md#combat-report) in Combat, naming each [Agent](../../mechanics/domain-model.md#agency-and-agents) by its [Instance ID](../../foundation/campaign-instances.md#glossary) and each [Enemy](../../mechanics/domain-model.md#combat) by its [Enemy label](../gui.md#glossary), under [Enemy labels](../gui.md#enemy-labels) in Graphical User Interface, in the participants table and in the [Combat log](../../mechanics/combat.md#combat-rounds-and-results) alike:

- The participants of each side, in their fixed order, as a table under [Tables](../visual-design.md#tables) in Visual Design, with their starting and final values, [damage dealt](../../mechanics/combat.md#combat-rounds-and-results) and [damage taken](../../mechanics/combat.md#combat-rounds-and-results), and final condition, a Killed [Agent](../../mechanics/domain-model.md#agency-and-agents) in Danger. A Skill gained column shows, for each Agent that survived, its Mission skill gain from the Turn report followed by its parts, [combat skill gain](../../mechanics/agents-spec.md#growth) plus [survival skill gain](../../mechanics/agents-spec.md#growth), under [Mission growth](../../mechanics/agents-spec.md#mission-growth) in Agents, e.g. "+43 (13+30)" in Positive; for a Killed Agent, its combat skill gain struck through in Text muted, e.g. "~~+5~~", because it was never added; and nothing for an Enemy.
- The [Combat rating](../../mechanics/combat.md#combatant-condition-in-a-combat) of each side at Combat start and after each Combat round.
- The [Combat log](../../mechanics/combat.md#combat-rounds-and-results), one row per attack in its order, collapsed until the Player expands it.

## Combat log colours

The colours of the Combat log tell the Player whose attack each row is and whom its outcome favours. Whether a hit or a miss is good for the Player depends on who made it, so no colour means "hit" or "damage" by itself:

- **Row:** a row whose attacker is an Agent is filled with the Agent attack tint, and a row whose attacker is an [Enemy](../../mechanics/domain-model.md#combat) with the Enemy attack tint, under [Colours](../visual-design.md#colours) in Visual Design.
- **Outcome:** the attack's outcome, i.e. its hit outcome, the [health removed](../../mechanics/combat.md#combat-rounds-and-results), the defender's [current health](../../mechanics/agents-spec.md#combatant-attributes) after it, and whether it made a participant dead or [Incapacitated](../../mechanics/combat.md#combatant-condition-in-a-combat), is in Positive when an Agent hit, in Danger when an Enemy hit, and in Text muted when the attack missed, whichever side made it. The other values of the row are in Text.
- **Decisive attack:** the word that names a participant made dead or Incapacitated is bold, e.g. "hit for 14, health 0, **dead**".

E.g., an Enemy that hits an Agent gives a row with the Enemy attack tint and its outcome in Danger, while an Agent that misses an Enemy gives a row with the Agent attack tint and its outcome in Text muted.

# Artboard

![Turn Report View panel Artboard: the Turn the report covers in its heading, and its sections: a Won Mission with the skill its survivors gained and its Combat report button, a completed Investigation, Mission sites created, Expired, and Cancelled, and a discovered Lead](../../../../images/artboards/turn-report-view.png)

![Combat report panel Artboard: a Won Mission's Combat report with its return control, the participants table of both sides, with each Enemy by its Enemy label and each Agent's skill gained, the Combat ratings of each side by Combat round, and the expanded Combat log, whose rows are tinted by the attacker's side and whose outcomes are coloured by whom they favour](../../../../images/artboards/combat-report.png)

The sample values, e.g. the Mission site names, the Lead names, the Instance IDs, the Enemy labels, and the numbers, appear only on the Artboards, under [Reading Artboards](../visual-design.md#reading-artboards) in Visual Design.
