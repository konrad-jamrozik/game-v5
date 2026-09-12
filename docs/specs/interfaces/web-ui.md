# Web UI

| Metadata    | Value                                                                                    |
| ----------- | ---------------------------------------------------------------------------------------- |
| Spec ID     | WEB                                                                                      |
| Status      | Stub                                                                                     |
| Scope       | Specify the first functional browser interface while keeping gameplay in the shared API. |
| Conventions | [Specification conventions](../spec-conventions.md)                                      |

> This is a scoped outline, not an accepted implementation contract. TODOs must be resolved before acceptance.

# Purpose and boundaries

Specify the first functional browser interface while keeping gameplay in the shared API.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

# Relationships

## Dependencies

| Dependency                                                          | Relationship | Scope                                                                         |
| ------------------------------------------------------------------- | ------------ | ----------------------------------------------------------------------------- |
| [TypeScript Player API](./typescript-api.md)                        | `uses`       | Queries, action discovery, commands, results, refresh, and errors             |
| [Player Information](./player-information.md)                       | `uses`       | Visible fields, relationships, estimates, reports, and information boundaries |
| [History and Persistence](../foundation/history-and-persistence.md) | `uses`       | Timeline navigation, undo/redo, restored observations, and session behavior   |

## Dependents

| Dependent                                                                                            | Relationship | Scope                                                       |
| ---------------------------------------------------------------------------------------------------- | ------------ | ----------------------------------------------------------- |
| [Campaign Integration and Acceptance Tests](../testing/campaign-integration-and-acceptance-tests.md) | `uses`       | Browser end-to-end flows and equivalent player interactions |

# Glossary

TODO: Define the local terms here or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

# Concepts and contract

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

TODO: Assign stable WEB-NNN requirement IDs when concrete rules replace these placeholders.

# Edge cases and failure behavior

TODO: Define behavior for Empty/large lists, stale selection after undo, hidden data, unavailable actions, loading/error states, and long reports.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

# Acceptance examples

TODO: Provide user journeys mapping controls to API calls and expected observations, including keyboard operation and timeline navigation.
Identify initial conditions, inputs/actions, expected results, and the requirement IDs exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Choose first-release screen layouts and grid/tree capabilities; graphics and 3D remain deferred.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
