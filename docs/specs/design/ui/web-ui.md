# Web UI

| Metadata    | Value                                                                                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | WEB                                                                                                                                                                        |
| Family      | UI                                                                                                                                                                         |
| Audience    | UI designer, Implementer                                                                                                                                                   |
| Owns        | Guidance on the screens of the browser user interface and what each shows the Player by default.                                                                           |
| Conventions | [Specification conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

The Web UI is where the Player plays the game in a browser. It shows the game and acts on the Player's choices by
calling the engine API of the [Engine Contract](../foundation/engine-contract.md).

Its screens follow the life of a Session under [Campaign Lifecycle](../foundation/campaign-lifecycle.md): it opens at
the Main menu, where no Campaign is current yet, and once a Campaign is created or loaded it shows the screens for
playing it. For every screen, the guiding question is what the Player needs to see by default and what can stay one
step away.

# Relationships

- Uses [Campaign Lifecycle](../foundation/campaign-lifecycle.md)
- Uses [Domain Model](../mechanics/domain-model.md)
- Uses [Engine Contract](../foundation/engine-contract.md)
- Used by [Gameplay Dependency Direction](../../implementation/guidance/gameplay-dependency-direction.md)

# Main menu

The Web UI opens at the Main menu, the Session state with no Current campaign under
[Session lifecycle](../foundation/campaign-lifecycle.md#session-lifecycle) in Campaign Lifecycle.

# TODOs

- TODO: State what the Main menu offers by default, e.g. creating a Campaign, loading a Campaign save, and changing
  Global configuration, and what it keeps one step away, under [Main menu](#main-menu).
- TODO: Write the section "Campaign screens": list the screens the Player needs while a Campaign is current, e.g. an
  Agents screen and a Mission site screen, and for each the game concepts under
  [Domain Model](../mechanics/domain-model.md) it shows by default and what it keeps one step away.
- TODO: Write the section "Campaign screens" part on operations: state how the Web UI reaches Advance turn, Timeline
  navigation, saving, and Autopilot, each through the operations that
  [API hierarchy](../foundation/engine-contract.md#api-hierarchy) names.
