# Terminal CLI

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | CLI                                                            |
| Family      | Interfaces                                                     |
| Status      | Stub                                                           |
| Audience    | UI designer, Implementer                                       |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Overview

This document specifies convenient terminal access to the engine API through a complete adapter usable by humans and AI.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

Terminal CLI is a required adapter over all four engine API namespaces. TypeScript Player API supplies signatures,
Player Information supplies permitted views, and History and Persistence supplies storage and restoration semantics.
CLI syntax and output apply those contracts without independently implementing gameplay behavior.

Creation or load selects the Current campaign. Session controller commands manage persistence, history, Dev mode,
and Autopilot. Player API output always shows Player-visible information. Full-state inspection and cheats use
separately authorized Developer API commands. Autopilot AI access remains restricted when adapted through CLI;
an Autopilot AI must not receive an unrestricted command channel.

# Relationships

- Uses [Core Concepts](../foundation/core-concepts.md)
- Uses [Engine Contract](../foundation/engine-contract.md)
- Uses [History and Persistence](../foundation/history-and-persistence.md)
- Uses [Player Information](./player-information.md)
- Uses [TypeScript Player API](./typescript-api.md)
- Used by [Campaign Integration and Acceptance Tests](../acceptance/campaign-integration-and-acceptance-tests.md)

# Glossary

API surface and Principal terms are owned by the [Engine Contract glossary](../foundation/engine-contract.md#glossary).

TODO: Define CLI-specific terms without duplicating shared definitions.

# Commands and sessions

TODO: Specify grammar, parsing, help/discovery, persistence, and mappings to Engine Contract's required starter
operations. Cover campaign lifecycle, action-level and turn-level history navigation, all Autopilot limits and
disengagement reasons, and separate developer inspection and cheats. Expose Autopilot memory only in its restricted
execution context; it is not a human gameplay command.

# Output contract

TODO: Specify human-readable and machine-readable output, stable JSON shapes, errors, standard streams, and exit
codes. Both formats preserve Player API visibility and separately authorized Developer API access. Autopilot
status must distinguish limit reached from the other disengagement reasons.

# Interaction behavior

TODO: Specify interactive and noninteractive Session controller workflows, restricted Autopilot AI execution,
and interruption behavior. Keep gameplay, visibility, history, and Autopilot limit enforcement in the engine.

# Edge cases and failure behavior

TODO: Specify malformed input, unavailable storage, stale access, and process interruption. CLI errors must
preserve the underlying API information boundary.

# Acceptance examples

TODO: Provide equivalent readable and JSON workflows for creation, gameplay, history navigation, developer access,
and Autopilot. Verify that an Autopilot AI cannot reach Session API or Developer API through CLI commands.
Identify each exercised requirement section.

# Open decisions

- TODO: Choose CLI grammar, process/Session model, and output versioning.
