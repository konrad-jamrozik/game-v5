# Storage Schema

| Metadata    | Value                                                                                                                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Spec ID     | SCHEMA                                                                                                                                                                                     |
| Family      | Guidance                                                                                                                                                                                   |
| Audience    | Implementer                                                                                                                                                                                |
| Owns        | Non-behavioural guidance on the physical layout of everything the game persists.                                                                                                           |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Implementation Specification Conventions](../../governance/conventions/implementation-spec-conventions.md) |

# Overview

Everything the game persists has to be laid out somehow, and the cost to watch is size: a long [Campaign](../../design/foundation/core-concepts.md#campaign-and-session) accumulates
[World history](../../design/foundation/campaign-state.md#glossary), and undo needs every [Committed state](../../design/foundation/engine-contract.md#player-actions-and-turns) of the current [Turn](../../design/foundation/engine-contract.md#player-actions-and-turns). The Storage Schema is the physical layout of
everything the game persists, as listed under [Data ownership](../../design/foundation/engine-contract.md#data-ownership).

Two choices shape that layout. [Game storage](../../design/foundation/engine-contract.md#persisted-data) never holds a copy of a [Game Data Record](../../design/foundation/core-concepts.md#game-build-and-content) (GDR), because GDRs belong to the
[Game build](../../design/foundation/core-concepts.md#game-build-and-content). A [Timeline](../../design/foundation/timeline.md) is suggested to be held in memory as Committed states that share
their unchanged parts, and written to a [Campaign save](../../design/foundation/engine-contract.md#persisted-data) as the [Turn-start state](../../design/foundation/engine-contract.md#player-actions-and-turns) followed by the ordered [Timeline](../../design/foundation/engine-contract.md#persisted-data) entries.

# Persisted layout

GDRs, e.g. the [Bootstrap GDRs](../../design/content/bootstrap-gdrs.md#glossary), belong to the Game build, so Game storage never holds a
copy of them; [Campaign state](../../design/foundation/core-concepts.md#campaign-and-session) refers to a GDR by its identifier.

# Timeline storage

Undo and redo need every [Committed state](../../design/foundation/engine-contract.md#player-actions-and-turns) of the current [Turn](../../design/foundation/engine-contract.md#player-actions-and-turns), and how those states are stored decides how much memory
and save space a long [Campaign](../../design/foundation/core-concepts.md#campaign-and-session) takes.

## The problem with one copy for each Committed state

Undo and redo must restore every Committed state of the current Turn, under
[Restored Committed states](../../design/foundation/timeline.md#restored-committed-states). The simplest implementation keeps a
complete copy of [Campaign state](../../design/foundation/core-concepts.md#campaign-and-session) for each of them. Its size grows in two ways at once:

- **With the [Timeline](../../design/foundation/engine-contract.md#persisted-data) entries of the Turn:** a Turn with 50 Timeline entries keeps 51 copies of Campaign state.
- **With the length of the Campaign:** each copy holds [World history](../../design/foundation/campaign-state.md#glossary), including every
  [Turn series](../../design/foundation/world-history.md#turn-series) in full. E.g., in Turn 300, 51 copies each hold 300
  Turns of every Turn series, although the copies differ only in the recorded values of the current Turn.

A [Campaign save](../../design/foundation/engine-contract.md#persisted-data) holds the Timeline of its Turn, and every [Autosave](../../design/foundation/saves.md#autosave-kinds) is a Campaign save, so the same growth repeats in
each of them. It also brings Campaign saves closer to the [Save size limit](../../design/foundation/saves.md#save-size-limit).

## Three ways to store a Timeline

A Timeline can be stored as whole Committed states, as changes between them, or as the [Player actions](../../design/foundation/engine-contract.md#player-actions-and-turns) that produce them,
and each trades storage against computation or effort.

| Approach    | What is stored                                                                                                                                                                     | How undo restores a Committed state                                                           | Trade-off                                                                         |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Full copies | A complete copy of Campaign state for each Committed state                                                                                                                         | Selects the earlier copy                                                                      | Simplest; has the growth described above                                          |
| Patches     | The [Turn-start state](../../design/foundation/engine-contract.md#player-actions-and-turns) and, for each [Timeline entry](../../design/foundation/timeline.md#glossary), a change | Applies the change of the last Timeline entry in reverse                                      | Compact; every Player action needs a correct reverse change, which is costly      |
| Replay      | The Turn-start state and the ordered Timeline entries                                                                                                                              | Commits the Timeline entries again from the Turn-start state, stopping before the one to undo | Compact and needs no changes to be computed; costs computation instead of storage |

Replay relies only on guarantees the specifications already give:

- **Same result:** committing the same Player actions from the same Campaign state gives the same Campaign state,
  under [Determinism](../../design/foundation/determinism-and-randomness.md#determinism).
- **No [Autopilot AI](../../design/foundation/engine-contract.md#principals-and-access) involved:** a Timeline entry an Autopilot AI chose is recorded as the Player action itself, so
  committing it again never asks an Autopilot AI to choose, under
  [Restored Committed states](../../design/foundation/timeline.md#restored-committed-states).
- **Only inexpensive actions:** Advance turn is not a Timeline entry, under
  [Timeline entries](../../design/foundation/timeline.md#timeline-entries), so replay never applies Turn advancement.
- **Same [Game build](../../design/foundation/core-concepts.md#game-build-and-content):** a Campaign save is only ever loaded by a Game build that accepts it, under
  [Game build compatibility](../../design/foundation/saves.md#game-build-compatibility).

## Suggested approach

Use a different representation in memory and in a Campaign save.

- **In memory, share what did not change:** represent each Committed state as an immutable value that shares every
  unchanged part with the Committed state before it. Undo and redo then select another Committed state without copying
  or computing anything, and 51 Committed states cost only what 50 Player actions changed. A [Turn series](../../design/foundation/world-history.md#glossary) suits this
  well: it only ever grows at its end, so the recorded values of all earlier Turns are shared and only the recorded
  values of the current Turn differ.
- **In a Campaign save, store the Turn-start state and the Timeline entries:** write one Campaign state, the
  Turn-start state, followed by the ordered Timeline entries and the number of them that are [Undone actions](../../design/foundation/timeline.md#glossary). Loading
  rebuilds the other Committed states by replay. Every Turn series is then written once for each Campaign save.
- **Store [Autopilot memory](../../design/foundation/engine-contract.md#persisted-data) beside the Timeline entries:** Autopilot memory is not Campaign state, so replay does not
  reproduce it. For each Committed state at which an Autopilot AI wrote Autopilot memory, write the Autopilot memory
  it last wrote there, so that undo, redo, and load restore it under
  [Autopilot memory](../../design/foundation/autopilot.md#autopilot-memory).

Patches are not suggested: they give no smaller Campaign save than replay and add a reverse change to maintain for
every Player action.

# Supported observable contract

**Informative rationale:** Any layout that satisfies [Saves](../../design/foundation/saves.md),
[Timeline](../../design/foundation/timeline.md), and [Determinism](../../design/foundation/determinism-and-randomness.md#determinism)
satisfies every specification.

# TODOs

- TODO: Describe one physical layout covering every part of [Game storage](../../design/foundation/engine-contract.md#persisted-data) under
  [Data ownership](../../design/foundation/engine-contract.md#data-ownership): [Global configuration](../../design/foundation/engine-contract.md#persisted-data), and for each Campaign save
  its identifiers, Campaign state, Timeline, and Autopilot memory, under [Persisted layout](#persisted-layout).
- TODO: Suggest how Autosaves are stored beside the other Campaign saves of their Campaign, under
  [Persisted layout](#persisted-layout).
- TODO: Suggest how the [Current Autosave](../../design/foundation/saves.md#autosave-kinds) is kept up to date after every change without rewriting a whole Campaign save
  each time, under [Persisted layout](#persisted-layout).
- TODO: Suggest a Campaign save encoding and how a Game build recognises a Campaign save it rejects under
  [Game build compatibility](../../design/foundation/saves.md#game-build-compatibility), under
  [Persisted layout](#persisted-layout).
- TODO: Suggest whether Autosaves of one Campaign share stored data with each other, e.g. the recorded values of Turn
  series that several Autosaves have in common, and state the expected size of the default five [Turn-end Autosaves](../../design/foundation/saves.md#autosave-kinds),
  under [Timeline storage](#timeline-storage).
