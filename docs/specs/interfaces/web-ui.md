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

API surface and execution-role terms are owned by the [Engine Contract glossary](../foundation/engine-contract.md#glossary).

TODO: Define presentation-specific terms without duplicating shared definitions.

# Concepts and contract

Web UI is a required human-facing adapter over the engine API hierarchy implemented by TypeScript Player API.
Its main menu represents a Session without a Current campaign; creation or load selects the Current campaign.
Player API views always show Player-visible information. Separate developer controls expose inspection and cheats
only under authorized Dev mode access. Delegation controls select one of the three scopes, show progress, and
permit cancellation without passing developer information to Delegated AI.

TypeScript Player API supplies operation results, Player Information supplies permitted views, and History and
Persistence supplies save/load and navigation semantics. Screens and interactions apply those contracts without
independently implementing gameplay behavior.

# Requirements

## Screens and data exploration

TODO: Specify main-menu and campaign screens using Player Information schemas. For example, provide Agent tables,
Lead progression trees, and report details. Define sorting, filtering, and selection without adding exclusive information.
Developer inspection must use a distinct authorized view rather than widening ordinary Player API results.

## Interaction and accessibility

TODO: Specify creation/load/save, gameplay actions, Advance turn, action-level and turn-level history navigation,
Dev mode controls, and delegation scope/progress/cancellation. Define keyboard access, focus behavior, and refresh
after commits or restoration. Controller mutation controls follow Engine Contract delegation restrictions.

## Presentation boundaries

TODO: Prioritize readable colors and layouts over decorative graphics. Future graphics must not add exclusive
gameplay information. Developer views and external AI integration must not leak hidden facts into Delegated AI context.

# Edge cases and failure behavior

TODO: Define empty states, stale selection after restoration, and load failures. Failed operations leave the engine's
prior committed view intact; presentation must not imply an uncommitted gameplay result.

# Acceptance examples

TODO: Provide keyboard-accessible journeys mapping main menu, gameplay, history, developer controls, and delegation
to exact API operations. Verify unchanged Player API visibility with Dev mode enabled and matching results with CLI.
Identify each exercised requirement section.

# Open decisions

- TODO: Choose first-release layouts and grid/tree capabilities; graphics and 3D remain deferred.
