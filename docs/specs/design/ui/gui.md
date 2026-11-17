# Graphical User Interface

| Metadata    | Value                                                                                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | GUI                                                                                                                                                                        |
| Family      | UI                                                                                                                                                                         |
| Audience    | UI designer, Implementer                                                                                                                                                   |
| Owns        | Which screens the graphical user interface has, the Progress bar that several of them show, and the confirmations and warnings it gives.                                   |
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

| Term         | Definition                                                                                                                                                                                                                                                                                |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Progress bar | The bar that shows an [Investigation](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions)'s progress against its [Lead](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions)'s required progress, under [Progress bar](#progress-bar). |

# Screens

The GUI has two screens, and each has its own specification in the `screens/` directory, which owns what the screen
shows, how it is laid out, and how it is illustrated:

- [Main Menu](screens/main-menu.md): the screen the GUI opens at, where no [Campaign](../foundation/core-concepts.md#campaign-and-session) is current yet.
- [Campaign Screen](screens/campaign-screen.md): the screen for playing the current Campaign. Its parts with a
  specification of their own are the [Situation Panel](screens/situation-panel.md), the
  [Turn Summary](screens/turn-summary.md) dialog, and the [History Tab](screens/history-tab.md).

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

# Progress bar

A Progress bar shows how far an Investigation is from completing while its [Actual required progress](../mechanics/investigations.md#glossary) stays hidden.
How it is drawn depends on what the Player knows:

- **[Assessed Lead](../mechanics/investigations.md#glossary):** the bar spans 0 to the greatest value of the Lead's [Required progress range](../mechanics/investigations.md#glossary), e.g. 0 to 15 for a
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
- **Completed Investigation:** the bar is drawn as for an Assessed Lead, because a Completed
  Investigation is always [Assessed](../mechanics/investigations.md#glossary). Its fill is split at the Investigation progress before the last Advance turn, so
  that the gain of that Advance turn, from the [Turn report](../foundation/world-history.md#glossary), is a separate segment, and a mark shows where the
  Investigation completed, labelled with its final Investigation progress.
