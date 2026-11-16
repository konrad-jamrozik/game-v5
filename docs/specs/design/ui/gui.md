# Graphical User Interface

| Metadata    | Value                                                                                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | GUI                                                                                                                                                                        |
| Family      | UI                                                                                                                                                                         |
| Audience    | UI designer, Implementer                                                                                                                                                   |
| Owns        | Guidance on the screens of the graphical user interface, what each shows the Player by default, and the confirmations it asks for.                                         |
| Conventions | [Specification conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

The Graphical User Interface (GUI) is where the Player plays the game through a graphical interface. It shows the game
and acts on the Player's choices by calling the engine API of the [Engine Contract](../foundation/engine-contract.md).

Its screens follow the life of a [Session](../foundation/core-concepts.md#campaign-and-session) under [Campaign Lifecycle](../foundation/campaign-lifecycle.md): it opens at
the [Main menu](../foundation/campaign-lifecycle.md#glossary), where no [Campaign](../foundation/core-concepts.md#campaign-and-session) is current yet, and once a Campaign is created or loaded it shows the screens for
playing it. For every screen, the guiding question is what the Player needs to see by default and what can stay one
step away. How each screen looks is owned by [Visual Design](visual-design.md).

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
transit doing nothing. For an Investigation, it also names each Investigation that loses members and each that becomes
Abandoned and loses its progress, under [Abandonment](../mechanics/investigations.md#abandonment) in Investigations. An order that interrupts no
such Agent, e.g. moving an Agent between Standby and Training, needs no confirmation.

# TODOs

- TODO: State what the Main menu offers by default, e.g. creating a Campaign, loading a Campaign save, and changing
  [Global configuration](../foundation/engine-contract.md#persisted-data), and what it keeps one step away, under [Main menu](#main-menu).
- TODO: Write the section "Campaign screens": list the screens the Player needs while a Campaign is current, e.g. an
  Agents screen and a [Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) screen, and for each the game concepts under
  [Domain Model](../mechanics/domain-model.md) it shows by default and what it keeps one step away.
- TODO: Write the section "Campaign screens" part on operations: state how the GUI reaches Advance turn, [Timeline](../foundation/engine-contract.md#persisted-data)
  navigation, saving, and [Autopilot](../foundation/engine-contract.md#autopilot), each through the operations that
  [API hierarchy](../foundation/engine-contract.md#api-hierarchy) names.
