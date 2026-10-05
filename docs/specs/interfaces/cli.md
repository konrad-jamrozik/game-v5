# Terminal CLI

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | CLI                                                            |
| Family      | Interfaces                                                     |
| Status      | Stub                                                           |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Purpose and boundaries

Provide convenient terminal access to the engine API through a complete adapter usable by humans and AI.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

- Uses [History and Persistence](../foundation/history-and-persistence.md) for the session and save/load behavior exposed through terminal commands.
- Uses [Player Information](./player-information.md) for Player-visible information and the boundary around hidden Campaign state.
- Uses [TypeScript Player API](./typescript-api.md) for the player commands, reports, and errors adapted for terminal interaction.
- Used by [Campaign Integration and Acceptance Tests](../acceptance/campaign-integration-and-acceptance-tests.md) for terminal player flows and their observable results.

# Relationships

- Uses [History and Persistence](../foundation/history-and-persistence.md)
- Uses [Player Information](./player-information.md)
- Uses [TypeScript Player API](./typescript-api.md)
- Used by [Campaign Integration and Acceptance Tests](../acceptance/campaign-integration-and-acceptance-tests.md)

# Glossary

API surface and execution-role terms are owned by the [Engine Contract glossary](../foundation/engine-contract.md#glossary).

TODO: Define CLI-specific terms without duplicating shared definitions.

# Concepts and contract

Terminal CLI is a required adapter over all four engine API namespaces. TypeScript Player API supplies signatures,
Player Information supplies permitted views, and History and Persistence supplies storage and restoration semantics.
CLI syntax and output apply those contracts without independently implementing gameplay behavior.

Creation or load selects the Current campaign. Session controller commands manage persistence, history, Dev mode,
and delegation. Player API output always shows Player-visible information. Full-state inspection and cheats use
separately authorized Developer API commands. Delegated AI access remains restricted when adapted through CLI;
a Delegated AI must not receive an unrestricted command channel.

# Requirements

## Commands and sessions

TODO: Specify grammar, parsing, help/discovery, persistence, and mappings to Engine Contract's required starter
operations. Cover campaign lifecycle, action-level and turn-level history navigation, all delegation scopes and
terminal results, and separate developer inspection and cheats. Expose Delegated AI memory only in its restricted
execution context; it is not a human gameplay command.

## Output contract

TODO: Specify human-readable and machine-readable output, stable JSON shapes, errors, standard streams, and exit
codes. Both formats preserve Player API visibility and separately authorized Developer API access. Delegation
progress must distinguish scope completion from early termination.

## Interaction behavior

TODO: Specify interactive and noninteractive Session controller workflows, restricted Delegated AI execution,
and interruption behavior. Keep gameplay, visibility, history, and scope enforcement in the engine.

# Edge cases and failure behavior

TODO: Specify malformed input, unavailable storage, stale access, and process interruption. CLI errors must
preserve the underlying API information boundary.

# Acceptance examples

TODO: Provide equivalent readable and JSON workflows for creation, gameplay, history navigation, developer access,
and delegation. Verify that a Delegated AI cannot reach Session API or Developer API through CLI commands.
Identify each exercised requirement section.

# Open decisions

- TODO: Choose CLI grammar, process/Session model, and output versioning.
