# Graphical User Interface

| Metadata    | Value                                                                                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | GUI                                                                                                                                                                        |
| Family      | UI                                                                                                                                                                         |
| Audience    | UI designer, Implementer                                                                                                                                                   |
| Owns        | Guidance on the screens of the graphical user interface, what each shows the Player by default, and the confirmations and warnings it gives.                               |
| Conventions | [Specification conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

The Graphical User Interface (GUI) is where the Player plays the game through a graphical interface. It shows the game
and acts on the Player's choices by calling the engine API of the [Engine Contract](../foundation/engine-contract.md).

Its screens follow the life of a [Session](../foundation/core-concepts.md#campaign-and-session) under [Campaign Lifecycle](../foundation/campaign-lifecycle.md): it opens at
the [Main menu](../foundation/campaign-lifecycle.md#glossary), where no [Campaign](../foundation/core-concepts.md#campaign-and-session) is current yet, and once a Campaign is created or loaded it shows the screens for
playing it. For every screen, the guiding question is what the Player needs to see by default and what can stay one
step away. How each screen looks is owned by [Visual Design](visual-design.md).

# Glossary

These terms are specific to the Graphical User Interface.

| Term            | Definition                                                                                                                                                                                                                                                                                |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Situation panel | The panel of the [Campaign](../foundation/core-concepts.md#campaign-and-session) screen that lists the work under way and the work waiting for the Player, under [Situation panel](#situation-panel).                                                                                     |
| Turn summary    | The dialog that summarizes what an Advance turn did, shown after it only when it did something the Player must know, under [Turn summary](#turn-summary).                                                                                                                                 |
| Progress bar    | The bar that shows an [Investigation](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions)'s progress against its [Lead](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions)'s required progress, under [Progress bar](#progress-bar). |

# Main menu

The GUI opens at the [Main menu](../foundation/campaign-lifecycle.md#glossary), the [Session](../foundation/core-concepts.md#campaign-and-session) state with no [Current campaign](../foundation/engine-contract.md#session-data) under
[Session lifecycle](../foundation/campaign-lifecycle.md#session-lifecycle) in Campaign Lifecycle.

The Main menu lists the [Campaign saves](../foundation/engine-contract.md#persisted-data), and lets the Player delete each listed Campaign save and each listed [Campaign](../foundation/core-concepts.md#campaign-and-session)
with all its Campaign saves, under [Deleting Campaign saves](../foundation/saves.md#deleting-campaign-saves) in Saves.
Because deleting cannot be undone, the GUI asks the Player to confirm each deletion first, naming the Campaign save or
the Campaign and how many Campaign saves it removes.

# Confirming interrupted Assignments

Taking an [Agent](../mechanics/domain-model.md#agency-and-agents) off [Contracting](../mechanics/agents-spec.md#assignments) or an [Investigation](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) interrupts its work and costs it an Advance turn
[In transit](../mechanics/domain-model.md#agency-and-agents), under [Transit rule](../mechanics/agents-spec.md#transit-rule) in Agents, so the GUI guards against doing it by mistake.
Before it makes any [Player action](../foundation/engine-contract.md#player-actions-and-turns) that changes the [Assignment](../mechanics/domain-model.md#agency-and-agents) of an Agent on Contracting or an
Investigation, whatever the new Assignment, the GUI asks the Player to confirm, e.g. before `assignAgents`, `startInvestigation`, or
`assignAgentsToInvestigation`. The confirmation names each such Agent and says that it spends the next Advance turn In
transit doing nothing. For an Investigation, it also names each Investigation that loses members, with its
[Investigation progress](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) before and after the loss, under [Progress loss](../mechanics/investigations.md#progress-loss) in Investigations, and each that becomes
Abandoned and loses all its progress, under [Abandonment](../mechanics/investigations.md#abandonment). An order that interrupts no
such Agent, e.g. moving an Agent between Standby and Training, needs no confirmation.

# Warning on deploying tired Agents

The engine lets an Agent of any [exhaustion](../mechanics/agents-spec.md#combatant-attributes) be deployed, under [Deploying Agents](../mechanics/missions.md#deploying-agents) in Missions,
because a tired team may be the only answer to a [Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions). A tired Agent fights worse and drops out of a
[Combat](../mechanics/domain-model.md#combat) sooner, under [Incapacitation condition](../mechanics/combat.md#incapacitation-condition) in Combat, so the GUI makes sure the Player
deploys one knowingly. Before it makes a `deployAgents` [Player action](../foundation/engine-contract.md#player-actions-and-turns) whose team includes an Agent with exhaustion of
20 or more, the GUI warns the Player and asks to confirm. The warning names each such Agent with its exhaustion and
[effective skill](../mechanics/agents-spec.md#combatant-attributes). It is a warning, not a block: the Player may confirm and deploy. The threshold 20 is a constant of the
GUI, not a [GDR](../foundation/core-concepts.md#game-build-and-content) value, because no game rule reads it.

# Campaign screen

While a Campaign is current, the GUI shows the Campaign screen. Two of its parts keep the Player aware, without
searching, of what is under way and what waits for a decision: the Situation panel, always in view, and the Turn
summary, shown once after an Advance turn. Both show [Investigation progress](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) and a gain of it in [progress points](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) with two
decimals, e.g. 7.02 for a stored 702.

## Situation panel

The Situation panel is in view on the Campaign screen whichever tab is selected. It shows the following groups in this
order, each with the number of its items. A group with nothing to show is left out, and when every group is left out
the panel says that nothing needs attention. The list is exhaustive.

1. **Active Investigations:** one row for each Investigation whose lifecycle state is Active, under
   [Investigation lifecycle](../mechanics/investigations.md#investigation-lifecycle) in Investigations, with its [Lead](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions)'s `name`, its Investigation
   progress, its Lead's [Required progress range](../mechanics/investigations.md#glossary) when the Lead is an [Assessed Lead](../mechanics/investigations.md#glossary), its projected progress
   gain, under [Projected progress gain](../mechanics/investigations.md#projected-progress-gain) in Investigations, its Progress bar, the size of its
   [Current team](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) and how many of its members are [In transit](../mechanics/domain-model.md#agency-and-agents), and the number of [Turns](../foundation/engine-contract.md#player-actions-and-turns) since its Turn started.
2. **Leads to investigate:** each [Discovered Lead](../mechanics/leads-and-progression.md#glossary) whose [Lead status](../mechanics/leads-and-progression.md#lead-status) is Available and that has no Active
   Investigation, with its Required progress range when it is an Assessed Lead, and otherwise that the range is
   unknown. It has no Progress bar, because it has no progress.
3. **Active Mission sites:** each Mission site whose lifecycle state is Active, under
   [Mission site lifecycle](../mechanics/missions.md#mission-site-lifecycle) in Missions, with its [MissionSiteArchetype](../mechanics/missions.md#missionsitearchetype)'s `name`, its
   kind, its target [Faction](../mechanics/domain-model.md#factions), and its Turns until expiration, under [Mission site properties](../mechanics/missions.md#mission-site-properties) in Missions.
4. **Free [Training](../mechanics/agents-spec.md#assignments) places:** the [Training cap](../mechanics/economy-and-upgrades.md#glossary) minus the Agents counted against it, written against the
   Training cap, e.g. "1 / 3"; left out when no place is free.
5. **Agents on [Standby](../mechanics/agents-spec.md#assignments):** the [Serving](../mechanics/agents-spec.md#agent-statuses) Agents whose Assignment is Standby, by [Instance ID](../foundation/campaign-instances.md#glossary).

Selecting a row shows that item where the Campaign screen details it, e.g. a Mission site row shows that Mission site.

## Progress bar

A Progress bar shows how far an Investigation is from completing while its [Actual required progress](../mechanics/investigations.md#glossary) stays hidden.
How it is drawn depends on what the Player knows:

- **Assessed Lead:** the bar spans 0 to the greatest value of the Lead's Required progress range, e.g. 0 to 15 for a
  [Required progress](../mechanics/leads-and-progression.md#glossary) of 10. A tick marks the [Required progress](../mechanics/leads-and-progression.md#glossary), and the part from it to the end of the bar is marked
  as the zone in which the Investigation may complete in any Advance turn, because its Actual required progress lies
  there. The fill runs from 0 to the Investigation progress. On an Active Investigation, a preview segment after the
  fill shows the projected progress gain, and a caption says that the Investigation may complete next turn when its
  progress and that gain together reach the Required progress, and that it may complete any turn once its progress has
  reached it.
- **Lead that is not an Assessed Lead:** the bar has no scale, because the Required progress is hidden. It shows a short
  fixed stub that does not grow with progress, and a caption stating the assessment threshold as a share of the
  Required progress, from `assessment_threshold_pct` under [InvestigationParameters](../mechanics/investigations.md#investigationparameters) in Investigations, e.g. "assessed at
  25% of required".
- **Completed Investigation, in the Turn summary:** the bar is drawn as for an Assessed Lead, because a Completed
  Investigation is always [Assessed](../mechanics/investigations.md#glossary). Its fill is split at the Investigation progress before the last Advance turn, so
  that the gain of that Advance turn, from the [Turn report](../foundation/world-history.md#glossary), is a separate segment, and a mark shows where the
  Investigation completed, labelled with its final Investigation progress.

## Turn summary

After an Advance turn that the Player requested through the GUI is committed, the GUI shows the Turn summary when that
Advance turn did at least one thing listed below, and shows nothing otherwise. It reads every item from the
[Turn report](../foundation/world-history.md#glossary) and the current [Committed state](../foundation/engine-contract.md#player-actions-and-turns). Its groups follow in this order, each left out when empty; the
list is exhaustive.

1. **Missions:** for each [Combat report](../mechanics/domain-model.md#combat) of the Turn report, its [Mission](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions)'s Mission site with its
   MissionSiteArchetype's `name`, kind, and target Faction; whether the Mission is Won or Lost, with the
   [Combat outcome](../mechanics/combat.md#combat-rounds-and-results); the number of Agents in its Team sent, under [Mission properties](../mechanics/missions.md#mission-properties) in Missions; the Agents
   [Killed](../mechanics/agents-spec.md#agent-statuses); the Agents of its Team sent whose Assignment is now [Recovery](../mechanics/agents-spec.md#assignments); the [Enemies](../mechanics/domain-model.md#combat) dead out of the
   Enemies present; and the [Consequences](../mechanics/missions.md#consequences) that applied, e.g. money, funding, a [Panic](../mechanics/domain-model.md#campaign-standing) reduction, and a
   Faction made [Eliminated](../mechanics/domain-model.md#factions).
2. **Investigations completed:** each Investigation under [Turn report](../mechanics/investigations.md#turn-report) in Investigations, with its
   Lead's `name`, the number of Turns from its Turn started to the Turn the Advance turn ended, its final Investigation
   progress, its Lead's Required progress range, its Progress bar, and the Mission site its completion created, if any.
3. **New Mission sites:** each Mission site created, under [Turn report](../mechanics/missions.md#turn-report) in Missions, with its
   MissionSiteArchetype's `name`, its kind, its origin, i.e. the Lead of its origin Investigation or its target
   Faction, its number of Enemies, and its Turns until expiration.
4. **Mission sites ended:** each Mission site that became Expired or Cancelled, under the same Turn report section, with
   its MissionSiteArchetype's `name`, its kind, the lifecycle state it reached, and, for an Expired one, its
   [Consequences](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions).
5. **Leads discovered:** each Lead under [Turn report](../mechanics/leads-and-progression.md#turn-report) in Leads and Progression, with its Required
   progress range when it is an Assessed Lead, and otherwise that the range is unknown.

The Player dismisses the Turn summary with one action, and it offers to open the full Turn report. It is not shown
after loading a [Campaign save](../foundation/engine-contract.md#persisted-data), after undo, redo, or other [Timeline](../foundation/timeline.md) navigation, nor for an Advance turn that
[Autopilot](../foundation/engine-contract.md#autopilot) requested, so that a long run of Advance turns does not open one Turn summary for each.

# TODOs

- TODO: State what the Main menu offers by default, e.g. creating a Campaign, loading a Campaign save, and changing
  [Global configuration](../foundation/engine-contract.md#persisted-data), and what it keeps one step away, under [Main menu](#main-menu).
- TODO: Complete the section [Campaign screen](#campaign-screen): list the other screens and tabs the Player needs while
  a Campaign is current, e.g. an Agents screen and a [Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) screen, and for each the game concepts under
  [Domain Model](../mechanics/domain-model.md) it shows by default and what it keeps one step away.
- TODO: Write the part of the section [Campaign screen](#campaign-screen) on operations: state how the GUI reaches Advance turn, [Timeline](../foundation/engine-contract.md#persisted-data)
  navigation, saving, and [Autopilot](../foundation/engine-contract.md#autopilot), each through the operations that
  [API hierarchy](../foundation/engine-contract.md#api-hierarchy) names.
