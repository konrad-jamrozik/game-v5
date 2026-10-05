# Developer API

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | DEV                                                            |
| Family      | Interfaces                                                     |
| Status      | Stub                                                           |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Purpose and boundaries

Define Dev mode and full Campaign state inspection through the Player action API, plus any optional debugging controls.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

- Uses [Domain Model](../foundation/domain-model.md) for the game concepts and identities exposed for debugging.
- Uses [History and Persistence](../foundation/history-and-persistence.md) for the retained Campaign state and restoration behavior available for debugging.
- Uses [TypeScript Player API](./typescript-api.md) for Dev mode controls and full Campaign state queries exposed by the player interfaces.
- Refines [Engine Contract](../foundation/engine-contract.md) by specifying Dev mode, full Campaign state inspection, and optional debugging operations.
- Used by [History and Persistence](../foundation/history-and-persistence.md) for the policy governing Dev mode retention during reset, load, and history navigation.
- Used by [TypeScript Player API](./typescript-api.md) for full Campaign state inspection fields and Dev mode transition behavior.

# Relationships

- Uses [Domain Model](../foundation/domain-model.md)
- Uses [History and Persistence](../foundation/history-and-persistence.md)
- Uses [TypeScript Player API](./typescript-api.md)
- Refines [Engine Contract](../foundation/engine-contract.md)
- Used by [History and Persistence](../foundation/history-and-persistence.md)
- Used by [TypeScript Player API](./typescript-api.md)

# Glossary

Dev mode, Player action API, Campaign control API, and Current campaign are owned by the
[Engine Contract glossary](../foundation/engine-contract.md#glossary).

TODO: Define the local terms here or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

# Concepts and contract

This specification refines [Information boundary](../foundation/engine-contract.md#information-boundary) by detailing
Dev mode inspection. Enable dev mode and Disable dev mode are Campaign control API commands. With Dev mode enabled,
the Player action API exposes full Campaign state, including all Authoritative values; full-state inspection remains
read-only. With Dev mode disabled, it exposes only Player-visible information.

The high-level access behavior is defined by Engine Contract. The TODOs below detail the full-state representation,
mode transitions, and any optional debugging controls. Domain Model supplies the inspected state; History and
Persistence supplies restoration semantics; TypeScript Player API supplies the callable controls and query surface.

TODO: Specify Dev mode transition results, full-state inspection, hidden state, debugging operation, snapshot, and validation.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Requirements

## Inspection contract

TODO: Specify the complete Campaign state query schema and read-only/copy behavior through the Player action API.
Include the hidden state required for continuation and define how this full-state result relates to ordinary
Player-visible information without treating hidden values as revealed through gameplay.

## Optional debugging controls

TODO: Decide which mutation, scenario setup, random override, or stepping controls are supported, if any. Do not treat their existence as already approved gameplay features.

## Isolation and history

TODO: Specify enable/disable behavior and how any optional debugging command affects invariants, history, saves, and
replay guarantees. Inspection must never permit direct mutation through returned Campaign references.

TODO: Write concrete requirements under descriptive section titles when rules replace these placeholders.

# Edge cases and failure behavior

TODO: Define behavior for full-state queries with Dev mode disabled, malformed debug state, inspection during
resolution, mode changes during AI delegation, and any optional debug changes followed by undo/replay.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

# Acceptance examples

TODO: Provide examples proving that the Player action API exposes full Campaign state only with Dev mode enabled,
that disabling Dev mode restores ordinary query visibility, and that inspecting either view leaves Campaign state unchanged.
Identify initial conditions, inputs/actions, expected results, and hyperlinks to the requirement sections exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Decide whether Dev mode persists across reset, load, or history navigation, and whether any state-mutating
  debugging commands are needed.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
