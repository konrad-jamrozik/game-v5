# History and Persistence

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | HIST                                                           |
| Family      | Foundation                                                     |
| Status      | Stub                                                           |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Purpose and boundaries

Define reversible sessions, reproducible replay, and durable save/load behavior.

TODO: Confirm the precise included/excluded scope and rule ownership using the [game design brief](../../game-design-brief.md).
Separate inherited game-ts behavior, required v5 changes, and new proposals.

- Uses [Developer API](../interfaces/developer-api.md) for the policy governing Dev mode retention during reset, load, and history navigation.
- Uses [Domain Model](./domain-model.md) for the game structures and identity/reference relationships preserved during restoration.
- Uses [Modeling Foundations](./modeling-foundations.md) for Campaign state, History, Retained data, and identity/reference contracts in restoration and replay.
- Uses [Numbers and Randomness](./numbers-and-randomness.md) for numeric representation, rounding, and reproducible random draws.
- Refines [Engine Contract](./engine-contract.md) by specifying the reversible session, replay, and save/load guarantees.
- Used by [Campaign Integration and Acceptance Tests](../acceptance/campaign-integration-and-acceptance-tests.md) for restoration, replay, and continuation contracts exercised by scenarios.
- Used by [Developer API](../interfaces/developer-api.md) for the retained Campaign state and restoration behavior available for debugging.
- Used by [Player Information](../interfaces/player-information.md) for the retained facts and restored session state available for player reports.
- Used by [Terminal CLI](../interfaces/cli.md) for the session and save/load behavior exposed through terminal commands.
- Used by [TypeScript Player API](../interfaces/typescript-api.md) for the session, restoration, and save/load operations exposed by the player API.
- Used by [Web UI](../interfaces/web-ui.md) for the session and save/load behavior exposed through browser controls.

# Relationships

- Uses [Developer API](../interfaces/developer-api.md)
- Uses [Domain Model](./domain-model.md)
- Uses [Modeling Foundations](./modeling-foundations.md)
- Uses [Numbers and Randomness](./numbers-and-randomness.md)
- Refines [Engine Contract](./engine-contract.md)
- Used by [Campaign Integration and Acceptance Tests](../acceptance/campaign-integration-and-acceptance-tests.md)
- Used by [Developer API](../interfaces/developer-api.md)
- Used by [Player Information](../interfaces/player-information.md)
- Used by [Terminal CLI](../interfaces/cli.md)
- Used by [TypeScript Player API](../interfaces/typescript-api.md)
- Used by [Web UI](../interfaces/web-ui.md)

# Glossary

| Term    | Definition                                                                                                                           |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Session | The owner of Current campaign selection, its Campaign state, history navigation, and controller state that must follow that history. |

TODO: Define remaining local terms here or link their authoritative definitions. Resolve terminology conflicts without
duplicating shared definitions.

# Concepts and contract

## Session

The Campaign bootstrap API and Campaign control API select the Current campaign through Reset campaign or Load
campaign state under [Campaign bootstrap and selection](engine-contract.md#campaign-bootstrap-and-selection).
Revert turn in [Campaign control commands](engine-contract.md#campaign-control-commands) restores an earlier Committed
state at a turn boundary; this document owns the exact boundary and which state must be restored.

Controller state can include, for example, persistent AI strategy memory. Storage/restoration decisions remain unresolved.
Storage and restoration must preserve [Campaign instances](modeling-foundations.md#campaign-instances), [References](modeling-foundations.md#references), and [Historical fact preservation](modeling-foundations.md#historical-fact-preservation) and [Derived value consistency](engine-contract.md#derived-value-consistency), [Continuation state](engine-contract.md#continuation-state), and [Committed state integrity](engine-contract.md#committed-state-integrity).

This specification intends to refine [Derived value consistency](engine-contract.md#derived-value-consistency)/[Continuation state](engine-contract.md#continuation-state)/[Committed state integrity](engine-contract.md#committed-state-integrity) by specifying cache restoration or invalidation, complete continuation state, and atomic
undo/redo and save/load procedures. It uses Modeling Foundations' identity, reference, and historical-preservation
conventions; storage procedures do not refine those meanings. Domain Model supplies the Campaign instances restored,
and Numbers and Randomness supplies the numeric and generator-state contracts. The TODOs below retain the unresolved
procedure and encoding choices.

Restoring history is not constructing a new occurrence. Undo may remove an occurrence or restore earlier State;
redo restores that occurrence’s ID, archetype, and Constants unchanged. Required historical records remain immutable
even in an evolving collection. These obligations do not select snapshots, reference encoding, or a save format.

## Remaining contract details

TODO: Specify session storage/restoration, snapshot, history entry, cursor, redo continuation, command log, save format, and version.
Define relevant fields, inputs/outputs, units, allowed ranges, and visibility; use conceptual tables or exact types as
appropriate to this document.

# Requirements

## Undo and redo

TODO: Specify atomic history boundaries, restored fields including RNG/IDs/reports, new-command branching, rejected/no-op actions, and history limits. Preserve the brief's absence of an additional rewind penalty.

TODO: Define the Revert turn target when actions have occurred since the most recent Advance turn, the earliest
available target, and its relation to action-level undo/redo. Do not assume every gameplay command is a turn boundary.

## Replay and persistence

TODO: Define save contents, encoding, load validation, and replay inputs for the current Game build under
[Requirements](engine-contract.md#requirements), [Game build compatibility](engine-contract.md#game-build-compatibility). Decide whether saves retain undo and redo history.

## Session-owned state

TODO: Separate Current campaign selection and Campaign state from UI preferences, Dev mode, and AI controller
memory. Define how reset/load and history navigation restore or invalidate AI delegation, strategy memory, and cached
views. Developer API owns the policy for retaining Dev mode across these operations.

TODO: Write concrete requirements under descriptive section titles when rules replace these placeholders.

# Edge cases and failure behavior

TODO: Define behavior for Undo at the beginning, redo at the end, branching after undo, save/load with a redo continuation, incompatible/corrupt saves, and campaign endings.
State exact thresholds and effect ordering where relevant. Use a reasoned Not applicable statement only for cases
that truly fall outside this document's scope.

# Acceptance examples

TODO: Specify command/undo/redo and save/load round trips, including generated IDs, hidden state, and reports.
Identify initial conditions, inputs/actions, expected results, and hyperlinks to the requirement sections exercised. Reference shared
fixtures instead of introducing implicit balance values.

# Open decisions

- TODO: Choose history retention, serialization, incompatible-save handling under [Game build compatibility](engine-contract.md#game-build-compatibility), and how debug changes affect replay.
- TODO: Identify remaining implementation-affecting decisions and their dependent specifications; mark explicitly
  deferred features as out of scope rather than leaving ambiguous gaps.
