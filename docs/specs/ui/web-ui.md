# Web UI

| Metadata    | Value                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------ |
| Spec ID     | WEB                                                                                              |
| Family      | UI                                                                                               |
| Status      | Stub                                                                                             |
| Audience    | UI designer, Implementer                                                                         |
| Owns        | Guidance on the screens of the browser user interface and what each shows the Player by default. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                                   |

# Overview

This document gives the Implementer guidance on the game's browser user interface: which screens the Player needs,
what each screen shows by default, and what it keeps one step away. It is a non-behavioural UI document: it owns no
game behavior and no engine API operation. What the Web UI may show and which operations it may call stay owned by
[Engine Contract](../foundation/engine-contract.md) and the specification that owns each value.

# Relationships

- Uses [Campaign Lifecycle](../foundation/campaign-lifecycle.md)
- Uses [Domain Model](../mechanics/domain-model.md)
- Uses [Engine Contract](../foundation/engine-contract.md)
- Used by [Gameplay Dependency Direction](../implementation/gameplay-dependency-direction.md)

# Main menu

The Web UI opens at the Main menu, the Session state with no Current campaign under
[Session lifecycle](../foundation/campaign-lifecycle.md#session-lifecycle) in Campaign Lifecycle.

TODO: State what the Main menu offers by default, e.g. creating a Campaign, loading a Campaign save, and changing
Global configuration, and what it keeps one step away.

# Campaign screens

TODO: List the screens the Player needs while a Campaign is current, e.g. an Agents screen and a Mission site
screen, and for each the game concepts under [Domain Model](../mechanics/domain-model.md) it shows by default and
what it keeps one step away.

TODO: State how the Web UI reaches Advance turn, Timeline navigation, saving, and Autopilot, each through the
operations that [API hierarchy](../foundation/engine-contract.md#api-hierarchy) in Engine Contract names.
