# Terminal CLI

| Metadata    | Value                                                                                 |
| ----------- | ------------------------------------------------------------------------------------- |
| Spec ID     | CLI                                                                                   |
| Family      | Interfaces                                                                            |
| Status      | Stub                                                                                  |
| Scope       | Provide a complete terminal adapter usable by humans and AI over the same player API. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                        |

> This is a scoped outline, not an accepted implementation contract. TODOs must be resolved before acceptance.

# Purpose and boundaries

Provide a complete terminal adapter usable by humans and AI over the same player API.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

# Relationships

- Uses [History and Persistence](../foundation/history-and-persistence.md)
- Uses [Player Information](./player-information.md)
- Uses [TypeScript Player API](./typescript-api.md)
- Used by [Campaign Integration and Acceptance Tests](../acceptance/campaign-integration-and-acceptance-tests.md)

# Glossary

TODO: Define the local terms here or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

# Concepts and contract

This adapter uses TypeScript Player API operations, Player Information's permitted views, and History and Persistence's
save/load and history semantics. CLI syntax and output formatting describe an interface using those contracts;
they do not refine the API's gameplay behavior. Exact adapter choices remain TODOs below.

TODO: Specify Command, argument, identifier, session, save path, readable output, JSON result, standard streams, and exit status.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Requirements

## Commands and sessions

TODO: Specify command grammar, argument parsing, help/discovery, session creation/loading, persistence, and mappings to API operations. Cover the complete gameplay surface.

## Output contract

TODO: Specify human-readable and machine-readable output, stable JSON shapes, errors, exit codes, and stdout/stderr separation. Both modes must respect INFO.

## Interaction behavior

TODO: Specify noninteractive automation, any interactive mode, invalid input, history commands, and process interruption behavior. Keep business rules in the engine.

TODO: Assign stable CLI-NNN requirement IDs when concrete rules replace these placeholders.

# Edge cases and failure behavior

TODO: Define behavior for Quoting/escaping identifiers, malformed arguments, missing saves, failed commands, no interactive terminal, and interruption while saving.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

# Acceptance examples

TODO: Provide matching human and JSON play transcripts including an invalid command and undo/redo.
Identify initial conditions, inputs/actions, expected results, and the requirement IDs exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Choose CLI syntax, process/session model, and output versioning before implementation.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
