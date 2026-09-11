# Terminal CLI

| Metadata    | Value                                                                                 |
| ----------- | ------------------------------------------------------------------------------------- |
| Spec ID     | CLI                                                                                   |
| Status      | Stub                                                                                  |
| Scope       | Provide a complete terminal adapter usable by humans and AI over the same player API. |
| Conventions | [Specification conventions](../spec-conventions.md)                                   |

> This is a scoped outline, not an accepted implementation contract. TODOs must be resolved before acceptance.

## 1. Purpose and boundaries

Provide a complete terminal adapter usable by humans and AI over the same player API.

TODO: Confirm the precise included/excluded scope and rule ownership using the [design stem](../../game-design-stem.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

## 2. Dependencies and terminology

- [TypeScript Player API](typescript-api.md): TODO: Identify the specific owned contracts referenced here and classify each dependency as normative or background.
- [Player Information](player-information.md): TODO: Identify the specific owned contracts referenced here and classify each dependency as normative or background.
- [History and Persistence](../foundation/history-and-persistence.md): TODO: Identify the specific owned contracts referenced here and classify each dependency as normative or background.

TODO: Define the local terms below or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

## 3. Concepts and contract

TODO: Specify Command, argument, identifier, session, save path, readable output, JSON result, standard streams, and exit status.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

## 4. Requirements

### Commands and sessions

TODO: Specify command grammar, argument parsing, help/discovery, session creation/loading, persistence, and mappings to API operations. Cover the complete gameplay surface.

### Output contract

TODO: Specify human-readable and machine-readable output, stable JSON shapes, errors, exit codes, and stdout/stderr separation. Both modes must respect INFO.

### Interaction behavior

TODO: Specify noninteractive automation, any interactive mode, invalid input, history commands, and process interruption behavior. Keep business rules in the engine.

TODO: Assign stable CLI-NNN requirement IDs when concrete rules replace these placeholders.

## 5. Edge cases and failure behavior

TODO: Define behavior for Quoting/escaping identifiers, malformed arguments, missing saves, failed commands, no interactive terminal, and interruption while saving.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

## 6. Acceptance examples

TODO: Provide matching human and JSON play transcripts including an invalid command and undo/redo.
Identify initial conditions, inputs/actions, expected results, and the requirement IDs exercised. Reference shared
fixtures instead of introducing implicit balance values.

## 7. Open decisions

- TODO: Choose CLI syntax, process/session model, and output versioning before implementation.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
