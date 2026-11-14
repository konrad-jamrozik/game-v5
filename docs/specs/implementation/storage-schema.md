# Storage Schema

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | SCHEMA                                                         |
| Family      | Implementation                                                 |
| Status      | Stub                                                           |
| Audience    | Implementer                                                    |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Overview

This document steers implementers toward one physical layout for everything the game persists. It is a
non-behavioural Implementation document: it owns no game behavior, observable contract, or GDR, and no acceptance test
depends on it. What is persisted, and what saving and loading observably do, remain owned by
[Data ownership](../foundation/engine-contract.md#data-ownership) in Engine Contract, [Saves](../foundation/saves.md),
and [Timeline](../foundation/timeline.md).

# Relationships

- Uses [Engine Contract](../foundation/engine-contract.md)
- Uses [Saves](../foundation/saves.md)
- Uses [Timeline](../foundation/timeline.md)

# Persisted layout

TODO: Describe one physical layout covering every part of Game storage under
[Data ownership](../foundation/engine-contract.md#data-ownership): Global configuration, and for each Campaign save
its identifiers, Campaign state, Timeline, and Autopilot memory.

TODO: Suggest how Autosaves are stored beside the other Campaign saves of their Campaign.

TODO: Suggest a Campaign save encoding and how a Game build recognises a Campaign save it rejects under
[Game build compatibility](../foundation/saves.md#game-build-compatibility).

# Timeline storage

**Informative rationale:** This section is guidance. It describes a storage problem and suggests one way to avoid it;
an implementation may store a Timeline differently.

## The problem with one copy for each Committed state

Undo and redo must restore every Committed state of the current Turn, under
[Restored Committed states](../foundation/timeline.md#restored-committed-states). The simplest implementation keeps a
complete copy of Campaign state for each of them. Its size grows in two ways at once:

- **With the Timeline entries of the Turn:** a Turn with 50 Timeline entries keeps 51 copies of Campaign state.
- **With the length of the Campaign:** each copy holds World history, including every
  [Turn series](../foundation/campaign-state.md#turn-series) in full. E.g., in turn 300, 51 copies each hold 300
  turns of every Turn series, although the copies differ only in the recorded values of the current Turn.

A Campaign save holds the Timeline of its Turn, and every Autosave is a Campaign save, so the same growth repeats in
each of them. It also brings Campaign saves closer to the [Save size limit](../foundation/saves.md#save-size-limit).

## Three ways to store a Timeline

| Approach    | What is stored                                              | How undo restores a Committed state                                                           | Trade-off                                                                         |
| ----------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Full copies | A complete copy of Campaign state for each Committed state  | Selects the earlier copy                                                                      | Simplest; has the growth described above                                          |
| Patches     | The Turn-start state and, for each Timeline entry, a change | Applies the change of the last Timeline entry in reverse                                      | Compact; every Committed action needs a correct reverse change, which is costly   |
| Replay      | The Turn-start state and the ordered Timeline entries       | Commits the Timeline entries again from the Turn-start state, stopping before the one to undo | Compact and needs no changes to be computed; costs computation instead of storage |

Replay relies only on guarantees the specifications already give:

- **Same result:** committing the same Committed actions from the same Campaign state gives the same Campaign state,
  under [Determinism](../foundation/engine-contract.md#determinism).
- **No Autopilot AI involved:** a Timeline entry an Autopilot AI chose is recorded as the Committed action itself, so
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
  or computing anything, and 51 Committed states cost only what 50 Committed actions changed. A Turn series suits this
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
every Committed action.

TODO: Suggest whether Autosaves of one Campaign share stored data with each other, e.g. the recorded values of Turn
series that several Autosaves have in common, and state the expected size of the default five Turn-end Autosaves.

# Supported observable contract

**Informative rationale:** Any layout that satisfies [Saves](../foundation/saves.md),
[Timeline](../foundation/timeline.md), and [Determinism](../foundation/engine-contract.md#determinism) satisfies
every specification, including one that ignores this document.
