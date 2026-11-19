# Player API

| Metadata | Value |
| --- | --- |
| Spec ID | PAPI |
| Family | Foundation |
| Audience | Engine designer, UI designer, AI designer, Implementer |
| Owns | What the player can see of a Campaign, and how gameplay actions change it. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

A player knows only what the game chooses to show, and acts only through the moves the game offers. That holds whoever is playing, e.g. a human at a graphical interface or an [Autopilot AI](engine-contract.md#principals-and-access), and on every channel the engine answers through, not only in query results.

[Player API](engine-contract.md#api-surfaces) is the API surface where this happens, under [API hierarchy](engine-contract.md#api-hierarchy) in Engine Contract. Three rules shape it: a value is Player-visible only where the specification owning it says so; a gameplay action states its preconditions and its changes, and a rejected one changes nothing; and no answer, error, or identifier reveals what the queries hide. The specification owning each value or gameplay action supplies the detail.

# Player-visible information

[Player-visible information](engine-contract.md#api-surfaces) describes deliberate ordinary-player exposure. The specification that owns a value states whether it is Player-visible information and under which reveal conditions, e.g. each Mechanics specification for the values it owns. A value that no specification declares Player-visible is not Player-visible information.

[Player API](engine-contract.md#api-surfaces) queries always return Player-visible information. The same query at equal [Campaign state](core-concepts.md#campaign-and-session) returns the same Player-visible information for the [Session controller](engine-contract.md#principals-and-access) and [Autopilot AI](engine-contract.md#principals-and-access), independent of [Dev mode](engine-contract.md#principals-and-access).

# Gameplay actions

The mechanics specification owning each gameplay action, e.g. `assignAgents(...)` or `purchaseUpgrade(...)`, states the action's preconditions, what the player observes when a precondition fails, and the action's state changes: when they apply, which values change, and by how much. A rejected action changes nothing, under [World state integrity](engine-contract.md#world-state-integrity) in Engine Contract, and a successful one is one [Player action](engine-contract.md#player-actions-and-turns), under [Player actions](engine-contract.md#player-actions) in Engine Contract.

The gameplay action inventory is extensible; future gameplay actions follow the same atomicity, visibility, and replay contract.

# Information boundary

The boundary of Player-visible information applies to every channel through which Player API returns information, not only query results: action discovery, validation errors, [Timeline](engine-contract.md#persisted-data) status, and identifiers. E.g., the error for a rejected action must not reveal a hidden value that the matching query hides. [Developer API](engine-contract.md#api-surfaces) is the only path to information that is not Player-visible information, under [API hierarchy](engine-contract.md#api-hierarchy) in Engine Contract.

A [Campaign save](engine-contract.md#persisted-data) contains information that is not Player-visible information, so no operation available to an Autopilot AI returns a Campaign save or its contents. The engine guarantees only the information it supplies to an Autopilot AI; it cannot erase information a human discloses outside the engine API.

# Acceptance examples

- **Same answer for every [Principal](engine-contract.md#principals-and-access):** A value H is not Player-visible information. With Dev mode enabled, the Session controller makes a Player API query; at an equal Campaign state, an Autopilot AI makes the same query. Both receive equal results, and neither result contains H ([Player-visible information](#player-visible-information)).
- **A rejection reveals nothing:** A gameplay action is rejected because of the hidden value H. Its error does not reveal H, and Campaign state is unchanged ([Gameplay actions](#gameplay-actions), [Information boundary](#information-boundary)).
