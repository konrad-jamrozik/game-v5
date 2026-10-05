# Web UI

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | WEB                                                            |
| Family      | Interfaces                                                     |
| Status      | Stub                                                           |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Purpose and boundaries

Specify the first functional browser interface while keeping gameplay in the shared API.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

- Uses [History and Persistence](../foundation/history-and-persistence.md) for the session and save/load behavior exposed through browser controls.
- Uses [Player Information](./player-information.md) for Player-visible information and the boundary around hidden Campaign state.
- Uses [TypeScript Player API](./typescript-api.md) for the player commands, reports, and errors adapted for browser interaction.
- Used by [Campaign Integration and Acceptance Tests](../acceptance/campaign-integration-and-acceptance-tests.md) for browser player flows and their observable results.

# Relationships

- Uses [History and Persistence](../foundation/history-and-persistence.md)
- Uses [Player Information](./player-information.md)
- Uses [TypeScript Player API](./typescript-api.md)
- Used by [Campaign Integration and Acceptance Tests](../acceptance/campaign-integration-and-acceptance-tests.md)

# Glossary

TODO: Define the local terms here or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

# Concepts and contract

Web UI provides a richer human-facing presentation over TypeScript Player API. It adapts the Campaign bootstrap API,
Player action API, and Campaign control API described in [Functions and types](typescript-api.md#functions-and-types).
Its controls select and operate on the same Current campaign as the underlying API; ordinary and full-state views
follow the active Dev mode setting.

This adapter uses TypeScript Player API operations, Player Information's permitted views, and History and Persistence's
history semantics. Screens and interactions apply those contracts without refining their gameplay behavior.
Exact presentation choices remain TODOs below.

TODO: Specify Screen, grid, tree, chart, detail view, selection, action control, notification, and local UI state.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Requirements

## Screens and data exploration

TODO: Specify agency, agent, lead/progression, investigation, mission, faction, and history/report views. Define columns, tree relationships, sorting, filtering, and detail panels using INFO fields.

## Interaction and accessibility

TODO: Specify selection/batch actions, action availability, error presentation, turn advancement, undo/redo, keyboard access, and focus behavior. Define state refresh after commands and history navigation.

## Presentation boundaries

TODO: Prioritize readable colors and layouts over decorative graphics. Record grid/tree requirements for later framework selection; future art/animations/3D must not add exclusive gameplay information.

TODO: Write concrete requirements under descriptive section titles when rules replace these placeholders.

# Edge cases and failure behavior

TODO: Define behavior for Empty/large lists, stale selection after undo, hidden data, unavailable actions, loading/error states, and long reports.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

# Acceptance examples

TODO: Provide user journeys mapping controls to API calls and expected Player-visible information, including keyboard operation and timeline navigation.
Identify initial conditions, inputs/actions, expected results, and hyperlinks to the requirement sections exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Choose first-release screen layouts and grid/tree capabilities; graphics and 3D remain deferred.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
