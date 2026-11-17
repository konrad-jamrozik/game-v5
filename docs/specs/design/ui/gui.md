# Graphical User Interface

| Metadata    | Value                                                                                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | GUI                                                                                                                                                                        |
| Family      | UI                                                                                                                                                                         |
| Audience    | UI designer, Implementer                                                                                                                                                   |
| Owns        | Which screens the graphical user interface has, the progress indicators that several of them show, and the confirmations and warnings it gives.                            |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

The Graphical User Interface (GUI) is where the Player plays the game through a graphical interface. It shows the game
and acts on the Player's choices by calling the engine API of the [Engine Contract](../foundation/engine-contract.md).

Its screens follow the life of a [Session](../foundation/core-concepts.md#campaign-and-session) under [Campaign Lifecycle](../foundation/campaign-lifecycle.md): it opens at
the [Main menu](../foundation/campaign-lifecycle.md#glossary), where no [Campaign](../foundation/core-concepts.md#campaign-and-session) is current yet, and once a Campaign is created or loaded it shows the screens for
playing it. For every screen, the guiding question is what the Player needs to see by default and what can stay one
step away. How each screen looks is owned by [Visual Design](visual-design.md).

# Glossary

These terms are specific to the Graphical User Interface.

| Term                | Definition                                                                                                                                                                                                                                                                                                                  |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Detail view         | A panel of the [Campaign screen](screens/campaign-screen.md) for one part of the [Campaign](../foundation/core-concepts.md#campaign-and-session) that the Player looks at in detail or acts on, opened from the Side panel over the Globe stage.                                                                            |
| Globe stage         | The region of the Campaign screen that shows the globe and over which a Detail view opens.                                                                                                                                                                                                                                  |
| Side panel          | The region at the right of the Campaign screen that opens Detail views and holds the summary of the work waiting for the Player.                                                                                                                                                                                            |
| Completion estimate | The range of [Advance turns](../foundation/engine-contract.md#player-actions-and-turns) within which an Active [Investigation](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) may complete if its projected progress gain stays as it is, under [Completion estimate](#completion-estimate). |
| Progress bar        | The bar that shows an Investigation's progress against its [Lead](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions)'s required progress, under [Progress bar](#progress-bar).                                                                                                                   |
| Progress circle     | The small circle that shows an Active Investigation's progress as a share of its Lead's [Required progress](../mechanics/leads-and-progression.md#glossary), under [Progress circle](#progress-circle).                                                                                                                     |

# Screens

The GUI has two screens, and each has its own specification in the `screens/` directory, which owns what the screen
shows, how it is laid out, and how it is illustrated:

- [Main Menu](screens/main-menu.md): the screen the GUI opens at, where no [Campaign](../foundation/core-concepts.md#campaign-and-session) is current yet.
- [Campaign Screen](screens/campaign-screen.md): the screen for playing the current Campaign. Its parts with a
  specification of their own are the [Situation Panel](screens/situation-panel.md), the
  [Turn Summary](screens/turn-summary.md) dialog, and one specification for each Detail view: the
  [Missions View](screens/missions-view.md), [Leads View](screens/leads-view.md),
  [Agents View](screens/agents-view.md), [Upgrades View](screens/upgrades-view.md),
  [Turn Report View](screens/turn-report-view.md), [History View](screens/history-view.md),
  [Charts View](screens/charts-view.md), and [Compendium View](screens/compendium-view.md).

# Confirming interrupted Assignments

Taking an [Agent](../mechanics/domain-model.md#agency-and-agents) off [Contracting](../mechanics/agents-spec.md#assignments) or an [Investigation](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) interrupts its work and costs it an Advance turn
[In transit](../mechanics/domain-model.md#agency-and-agents), under [Transit rule](../mechanics/agents-spec.md#transit-rule) in Agents, so the GUI guards against doing it by mistake.
Before it makes any [Player action](../foundation/engine-contract.md#player-actions-and-turns) that changes the [Assignment](../mechanics/domain-model.md#agency-and-agents) of an Agent on Contracting or an
Investigation, whatever the new Assignment, the GUI asks the Player to confirm, e.g. before `assignAgents`, `startInvestigation`, or
`assignAgentsToInvestigation`. The confirmation names each such Agent and says that it spends the next Advance turn In
transit doing nothing. For an Investigation, it also names each Investigation that loses members, with its
[Investigation progress](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) before and after the loss, under [Progress loss](../mechanics/investigations.md#progress-loss) in Investigations, and each that becomes
Abandoned and loses all its progress, under [Abandonment](../mechanics/investigations.md#abandonment). An order that interrupts no
such Agent, e.g. moving an Agent between Standby and Training, needs no confirmation. The [Agents View](screens/agents-view.md) asks no such
confirmation, because its Allow re-assigning checkbox takes its place, under
[Re-assigning](screens/agents-view.md#re-assigning) in Agents View.

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

# Progress circle

A Progress circle lets the Player read in one glyph, on a line too short for a [Progress bar](#progress-bar), how far an
Active Investigation has come. Like the Progress bar, it keeps the [Actual required progress](../mechanics/investigations.md#glossary) hidden. How it is
drawn depends on what the Player knows:

- **[Assessed Lead](../mechanics/investigations.md#glossary):** the circle fills clockwise from the top by the share of the [Required progress](../mechanics/leads-and-progression.md#glossary) that the
  [Investigation progress](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) has reached, e.g. three quarters for progress 7.50 of a Required progress of 10. Once
  the progress has reached the Required progress, the circle is full and carries a check, because the Investigation may
  then complete in any Advance turn.
- **Lead that is not an Assessed Lead:** the circle is an empty dashed outline with a question mark, because the
  Required progress is hidden.

# Completion estimate

A Completion estimate tells the Player roughly when an Active Investigation will complete, so that a plan can be made
without reading the Progress bar. It is worked out by the GUI from [Player-visible information](../foundation/engine-contract.md#api-surfaces) only: the Investigation
progress p, the projected progress gain g, under [Projected progress gain](../mechanics/investigations.md#projected-progress-gain) in Investigations, and the
Lead's [Required progress range](../mechanics/investigations.md#glossary) from R, its Required progress, to M, its greatest value. It is not a [Derived value](../foundation/core-concepts.md#value-classification)
of the engine, and it assumes that g stays as it is. It is written with "T" for Advance turns:

- **Assessed Lead and g above 0:** the Investigation completes at the earliest after a = max(1, ⌈(R − p) / g⌉) and at the
  latest after b = ⌈(M − p) / g⌉ Advance turns, written "ETA a–b T", or "ETA a T" when a equals b, e.g. "ETA 3–5 T".
  Once p has reached R, it is written "ETA ≤ b T", because the Investigation may complete in any Advance turn.
- **g is 0,** e.g. while every member of the [Current team](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) is [In transit](../mechanics/domain-model.md#agency-and-agents): "stalled".
- **Lead that is not an Assessed Lead:** "ETA ?", because R and M are hidden.
