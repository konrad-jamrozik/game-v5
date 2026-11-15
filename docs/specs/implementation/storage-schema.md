# Storage Schema

| Metadata    | Value                                                                            |
| ----------- | -------------------------------------------------------------------------------- |
| Spec ID     | SCHEMA                                                                           |
| Family      | Implementation                                                                   |
| Status      | Stub                                                                             |
| Binding     | Guidance                                                                         |
| Audience    | Implementer                                                                      |
| Owns        | Non-behavioural guidance on the physical layout of everything the game persists. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                   |

# Overview

Everything the game persists has to be laid out somehow, and the cost to watch is size: a long Campaign accumulates
World history, and undo needs every Committed state of the current Turn. The Storage Schema is the physical layout of
everything the game persists, as listed under [Data ownership](../foundation/engine-contract.md#data-ownership).

Two choices shape that layout. Game storage never holds a copy of a Game Data Record (GDR), because GDRs belong to the
Game build. A [Timeline](../foundation/timeline.md) is suggested to be held in memory as Committed states that share
their unchanged parts, and written to a Campaign save as the Turn-start state followed by the ordered Timeline entries.

# Relationships

- Uses [Bootstrap GDRs](../content/bootstrap-gdrs.md)
- Uses [Core Concepts](../foundation/core-concepts.md)
- Uses [Determinism and Randomness](../foundation/determinism-and-randomness.md)
- Uses [Engine Contract](../foundation/engine-contract.md)
- Uses [Saves](../foundation/saves.md)
- Uses [Timeline](../foundation/timeline.md)

# Persisted layout

GDRs, e.g. the [Bootstrap GDRs](../content/bootstrap-gdrs.md), belong to the Game build, so Game storage never holds a
copy of them; Campaign state refers to a GDR by its identifier.

# Timeline storage

Undo and redo need every Committed state of the current Turn, and how those states are stored decides how much memory
and save space a long Campaign takes.

## The problem with one copy for each Committed state

Undo and redo must restore every Committed state of the current Turn, under
[Restored Committed states](../foundation/timeline.md#restored-committed-states). The simplest implementation keeps a
complete copy of Campaign state for each of them. Its size grows in two ways at once:

- **With the Timeline entries of the Turn:** a Turn with 50 Timeline entries keeps 51 copies of Campaign state.
- **With the length of the Campaign:** each copy holds World history, including every
  [Turn series](../foundation/world-history.md#turn-series) in full. E.g., in turn 300, 51 copies each hold 300
  turns of every Turn series, although the copies differ only in the recorded values of the current Turn.

A Campaign save holds the Timeline of its Turn, and every Autosave is a Campaign save, so the same growth repeats in
each of them. It also brings Campaign saves closer to the [Save size limit](../foundation/saves.md#save-size-limit).

## Three ways to store a Timeline

A Timeline can be stored as whole Committed states, as changes between them, or as the Player actions that produce them,
and each trades storage against computation or effort.

| Approach    | What is stored                                              | How undo restores a Committed state                                                           | Trade-off                                                                         |
| ----------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Full copies | A complete copy of Campaign state for each Committed state  | Selects the earlier copy                                                                      | Simplest; has the growth described above                                          |
| Patches     | The Turn-start state and, for each Timeline entry, a change | Applies the change of the last Timeline entry in reverse                                      | Compact; every Player action needs a correct reverse change, which is costly      |
| Replay      | The Turn-start state and the ordered Timeline entries       | Commits the Timeline entries again from the Turn-start state, stopping before the one to undo | Compact and needs no changes to be computed; costs computation instead of storage |

Replay relies only on guarantees the specifications already give:

- **Same result:** committing the same Player actions from the same Campaign state gives the same Campaign state,
  under [Determinism](../foundation/determinism-and-randomness.md#determinism).
- **No Autopilot AI involved:** a Timeline entry an Autopilot AI chose is recorded as the Player action itself, so
  committing it again never asks an Autopilot AI to choose, under
  [Restored Committed states](../foundation/timeline.md#restored-committed-states).
- **Only inexpensive actions:** Advance turn is not a Timeline entry, under
  [Timeline entries](../foundation/timeline.md#timeline-entries), so replay never applies turn advancement.
- **Same Game build:** a Campaign save is only ever loaded by a Game build that accepts it, under
  [Game build compatibility](../foundation/saves.md#game-build-compatibility).

## Suggested approach

Use a different representation in memory and in a Campaign save.

- **In memory, share what did not change:** represent each Committed state as an immutable value that shares every
  unchanged part with the Committed state before it. Undo and redo then select another Committed state without copying
  or computing anything, and 51 Committed states cost only what 50 Player actions changed. A Turn series suits this
  well: it only ever grows at its end, so the recorded values of all earlier turns are shared and only the recorded
  values of the current Turn differ.
- **In a Campaign save, store the Turn-start state and the Timeline entries:** write one Campaign state, the
  Turn-start state, followed by the ordered Timeline entries and the number of them that are Undone actions. Loading
  rebuilds the other Committed states by replay. Every Turn series is then written once for each Campaign save.
- **Store Autopilot memory beside the Timeline entries:** Autopilot memory is not Campaign state, so replay does not
  reproduce it. For each Committed state at which an Autopilot AI wrote Autopilot memory, write the Autopilot memory
  it last wrote there, so that undo, redo, and load restore it under
  [Autopilot memory](../foundation/autopilot.md#autopilot-memory).

Patches are not suggested: they give no smaller Campaign save than replay and add a reverse change to maintain for
every Player action.

# Supported observable contract

**Informative rationale:** Any layout that satisfies [Saves](../foundation/saves.md),
[Timeline](../foundation/timeline.md), and [Determinism](../foundation/determinism-and-randomness.md#determinism)
satisfies every specification.

# TODOs

- TODO: Describe one physical layout covering every part of Game storage under
  [Data ownership](../foundation/engine-contract.md#data-ownership): Global configuration, and for each Campaign save
  its identifiers, Campaign state, Timeline, and Autopilot memory, under [Persisted layout](#persisted-layout).
- TODO: Suggest how Autosaves are stored beside the other Campaign saves of their Campaign, under
  [Persisted layout](#persisted-layout).
- TODO: Suggest how the Current Autosave is kept up to date after every change without rewriting a whole Campaign save
  each time, under [Persisted layout](#persisted-layout).
- TODO: Suggest a Campaign save encoding and how a Game build recognises a Campaign save it rejects under
  [Game build compatibility](../foundation/saves.md#game-build-compatibility), under
  [Persisted layout](#persisted-layout).
- TODO: Suggest whether Autosaves of one Campaign share stored data with each other, e.g. the recorded values of Turn
  series that several Autosaves have in common, and state the expected size of the default five Turn-end Autosaves,
  under [Timeline storage](#timeline-storage).
