# Storage Schema

| Metadata | Value |
| --- | --- |
| Spec ID | SCHEMA |
| Family | Guidance |
| Audience | Implementer |
| Owns | Non-behavioural guidance on the physical layout of everything the game persists. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Implementation Specification Conventions](../../governance/conventions/implementation-spec-conventions.md) |

# Overview

Everything the game persists has to be laid out somehow, and the cost to watch is size: a long [Campaign](../../design/foundation/core-concepts.md#campaign-and-session) accumulates a [History](../../design/foundation/campaign-state.md#glossary) and Retired Campaign instances, and undo needs every [World state](../../design/foundation/engine-contract.md#player-actions-and-turns) of the current [Turn](../../design/foundation/engine-contract.md#player-actions-and-turns). The Storage Schema is the physical layout of everything the game persists, as listed under [Data ownership](../../design/foundation/engine-contract.md#data-ownership).

Two choices shape that layout. [Game storage](../../design/foundation/engine-contract.md#persisted-data) never holds a copy of a [Game Data Record](../../design/foundation/core-concepts.md#game-build-and-content) (GDR), because GDRs belong to the [Game build](../../design/foundation/core-concepts.md#game-build-and-content). A [Timeline](../../design/foundation/timeline.md) is suggested to be held in memory as World states that share their unchanged parts, and written to a [Campaign save](../../design/foundation/engine-contract.md#persisted-data) as the [Turn-start state](../../design/foundation/engine-contract.md#player-actions-and-turns) followed by the Player actions of its ordered Timeline entries.

# Persisted layout

GDRs, e.g. the [Bootstrap GDRs](../../design/content/bootstrap-gdrs.md#glossary), belong to the Game build, so Game storage never holds a copy of them; [Campaign state](../../design/foundation/core-concepts.md#campaign-and-session) refers to a GDR by its identifier.

# Timeline storage

Undo and redo need every [World state](../../design/foundation/engine-contract.md#player-actions-and-turns) of the current [Turn](../../design/foundation/engine-contract.md#player-actions-and-turns), and how those states are stored decides how much memory and save space a long [Campaign](../../design/foundation/core-concepts.md#campaign-and-session) takes.

## The problem with one copy for each World state

Undo and redo must reach every World state of the current Turn, because the [Timeline](../../design/foundation/engine-contract.md#persisted-data) holds every one of them, under [Timeline structure](../../design/foundation/timeline.md#timeline-structure). The simplest implementation keeps a complete copy of each of them. Its size grows in two ways at once:

- **With the [Timeline entries](../../design/foundation/timeline.md#glossary) of the Turn:** a Turn with 50 Timeline entries keeps 51 copies of the World state.
- **With the length of the Campaign:** each copy holds the whole [Retired world state](../../design/foundation/campaign-state.md#glossary), which only ever grows. E.g., in Turn 300, 51 copies each hold every Mission site and Enemy of 300 Turns, although the copies differ only in what the current Turn changed.

The [History](../../design/foundation/campaign-state.md#glossary) is not part of a World state, so it is kept once, whatever the number of Timeline entries.

A [Campaign save](../../design/foundation/engine-contract.md#persisted-data) holds the Timeline of its Turn, and every [Autosave](../../design/foundation/saves.md#autosave-kinds) is a Campaign save, so the same growth repeats in each of them. It also brings Campaign saves closer to the [Save size limit](../../design/foundation/saves.md#save-size-limit).

## Three ways to store a Timeline

A Timeline can be stored as whole World states, as changes between them, or as the [Player actions](../../design/foundation/engine-contract.md#player-actions-and-turns) that produce them, and each trades storage against computation or effort.

| Approach | What is stored | How undo reaches an earlier World state | Trade-off |
| --- | --- | --- | --- |
| Full copies | A complete copy of each World state | Selects the earlier copy | Simplest; has the growth described above |
| Patches | The [Turn-start state](../../design/foundation/engine-contract.md#player-actions-and-turns) and, for each [Timeline entry](../../design/foundation/timeline.md#glossary), a change | Applies the change of the last Timeline entry in reverse | Compact; every Player action needs a correct reverse change, which is costly |
| Replay | The Turn-start state and the Player actions of the ordered Timeline entries | Commits the Player actions again from the Turn-start state, stopping at the new position of the [Timeline pointer](../../design/foundation/engine-contract.md#persisted-data) | Compact and needs no changes to be computed; costs computation instead of storage |

Replay relies only on guarantees the specifications already give:

- **Same result:** committing the same Player actions from the same World state under the same [Campaign configuration](../../design/foundation/campaign-state.md#glossary) gives the same World state, under [Determinism](../../design/foundation/determinism-and-randomness.md#determinism).
- **The Campaign configuration of each Timeline entry:** a change of Campaign configuration never rewrites a World state the Timeline holds, under [Changing Campaign configuration during play](../../design/foundation/configuration.md#changing-campaign-configuration-during-play). Replay must therefore commit each Player action under the Campaign configuration in force when it was first committed, not the current one, so the Campaign configuration changes made during the Turn are stored with the Timeline entries they preceded.
- **No [Autopilot AI](../../design/foundation/engine-contract.md#principals-and-access) involved:** a Timeline entry an Autopilot AI chose is recorded as the Player action itself, so committing it again never asks an Autopilot AI to choose, under [Returning to a World state](../../design/foundation/timeline.md#returning-to-a-world-state).
- **Only inexpensive actions:** Advance turn is not a Timeline entry, under [Timeline entries](../../design/foundation/timeline.md#timeline-entries), so replay never applies Turn advancement.
- **Same [Game build](../../design/foundation/core-concepts.md#game-build-and-content):** a Campaign save is only ever loaded by a Game build that accepts it, under [Game build compatibility](../../design/foundation/saves.md#game-build-compatibility).

## Suggested approach

Use a different representation in memory and in a Campaign save.

- **In memory, share what did not change:** represent each World state as an immutable value that shares every unchanged part with the World state before it. Undo and redo then only move the [Timeline pointer](../../design/foundation/engine-contract.md#persisted-data), without copying or computing anything, and 51 World states cost only what 50 Player actions changed. The Retired world state suits this well: it only ever grows, so the [Retired](../../design/foundation/world-history.md#glossary) [Campaign instances](../../design/foundation/core-concepts.md#campaign-instances) of earlier Turns are shared.
- **In a Campaign save, store the Turn-start state and the Player actions:** write one World state, the Turn-start state, followed by the Player actions of the ordered Timeline entries, the Campaign configuration changes made between them, and the number of the Timeline entries that are [Undone actions](../../design/foundation/timeline.md#glossary); then the History, the current Campaign configuration, and the [Turn report](../../design/foundation/campaign-state.md#glossary) once. Loading rebuilds the other World states by replay. The History, with every [Turn series](../../design/foundation/world-history.md#glossary), is then written once for each Campaign save.

Patches are not suggested: they give no smaller Campaign save than replay and add a reverse change to maintain for every Player action.

# Supported observable contract

**Informative rationale:** Any layout that satisfies [Saves](../../design/foundation/saves.md), [Timeline](../../design/foundation/timeline.md), and [Determinism](../../design/foundation/determinism-and-randomness.md#determinism) satisfies every specification.

# TODOs

- TODO: Describe one physical layout covering every part of [Game storage](../../design/foundation/engine-contract.md#persisted-data) under [Data ownership](../../design/foundation/engine-contract.md#data-ownership): [Global configuration](../../design/foundation/engine-contract.md#persisted-data), and for each Campaign save its identifiers and [Campaign state](../../design/foundation/core-concepts.md#campaign-and-session), under [Persisted layout](#persisted-layout).
- TODO: Suggest how Autosaves are stored beside the other Campaign saves of their Campaign, under [Persisted layout](#persisted-layout).
- TODO: Suggest how the [Current Autosave](../../design/foundation/saves.md#autosave-kinds) is kept up to date after every change without rewriting a whole Campaign save each time, under [Persisted layout](#persisted-layout).
- TODO: Suggest a Campaign save encoding and how a Game build recognises a Campaign save it rejects under [Game build compatibility](../../design/foundation/saves.md#game-build-compatibility), under [Persisted layout](#persisted-layout).
- TODO: Suggest whether Autosaves of one Campaign share stored data with each other, e.g. the History that several Autosaves have in common, and state the expected size of the default five [Turn-end Autosaves](../../design/foundation/saves.md#autosave-kinds), under [Timeline storage](#timeline-storage).
