# Storage Schema

| Metadata | Value |
| --- | --- |
| Spec ID | SCHEMA |
| Family | Guidance |
| Audience | Implementer |
| Owns | Non-behavioural guidance on the physical layout of everything the game persists. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Implementation Specification Conventions](../../governance/conventions/implementation-spec-conventions.md) |

# Overview

Everything the game persists has to be laid out somehow, and the cost to watch is size: a long [Campaign](../../design/foundation/core-concepts.md#campaign-and-session) accumulates a [History](../../design/foundation/campaign-state.md#glossary) and Retired Campaign instances, and undo needs every [World state](../../design/foundation/engine-contract.md#player-actions-and-turns) of the current [Turn](../../design/foundation/engine-contract.md#player-actions-and-turns). The Storage Schema is the physical layout of [everything the game persists](../../design/foundation/engine-contract.md#data-ownership).

Two choices shape that layout: [Game storage](../../design/foundation/engine-contract.md#persisted-data) holds no copy of a [Game Data Record](../../design/foundation/core-concepts.md#game-build-and-content) (GDR), and a [Timeline](../../design/foundation/timeline.md) is stored as the Player actions that produce its World states rather than as the states themselves.

# Persisted layout

GDRs belong to the [Game build](../../design/foundation/core-concepts.md#game-build-and-content), so [Game storage](../../design/foundation/engine-contract.md#persisted-data) never holds a copy of them; [Campaign state](../../design/foundation/core-concepts.md#campaign-and-session) refers to a [GDR](../../design/foundation/core-concepts.md#game-build-and-content) by its identifier.

# Timeline storage

Undo and redo must reach every [World state](../../design/foundation/engine-contract.md#player-actions-and-turns) of the current [Turn](../../design/foundation/engine-contract.md#player-actions-and-turns). A complete copy of each would grow with the [Timeline entries](../../design/foundation/timeline.md#glossary) of the Turn and, through the [Retired world state](../../design/foundation/campaign-state.md#glossary) each copy holds, with the length of the [Campaign](../../design/foundation/core-concepts.md#campaign-and-session), and every [Autosave](../../design/foundation/saves.md#autosave-kinds) would repeat that growth on its way to the [Save size limit](../../design/foundation/saves.md#save-size-limit).

## Three ways to store a Timeline

A [Timeline](../../design/foundation/engine-contract.md#persisted-data) can be stored as whole World states, as changes between them, or as the [Player actions](../../design/foundation/engine-contract.md#player-actions-and-turns) that produce them, and each trades storage against computation or effort.

| Approach | What is stored | How undo reaches an earlier World state | Trade-off |
| --- | --- | --- | --- |
| Full copies | A complete copy of each World state | Selects the earlier copy | Simplest; grows with the Turn and with the Campaign |
| Patches | The [Turn-start state](../../design/foundation/engine-contract.md#player-actions-and-turns) and, for each [Timeline entry](../../design/foundation/timeline.md#glossary), a change | Applies the change of the last Timeline entry in reverse | Compact; every Player action needs a correct reverse change, which is costly |
| Replay | The Turn-start state and the Player actions of the ordered Timeline entries | Commits the Player actions again from the Turn-start state, stopping at the new position of the [Timeline pointer](../../design/foundation/engine-contract.md#persisted-data) | Compact and needs no changes to be computed; costs computation instead of storage |

Replay is correct only while these guarantees of the specifications hold:

- **Same result:** committing the same Player actions from the same World state under the same [Campaign configuration](../../design/foundation/campaign-state.md#glossary) [gives the same World state](../../design/foundation/determinism-and-randomness.md#determinism).
- **The Campaign configuration of each Timeline entry:** a change of Campaign configuration [never rewrites a World state](../../design/foundation/configuration.md#changing-campaign-configuration-during-play) the Timeline holds. Replay must therefore commit each Player action under the Campaign configuration in force when it was first committed, so the Campaign configuration changes made during the Turn are stored with the Timeline entries they preceded.
- **No [Autopilot AI](../../design/foundation/engine-contract.md#principals-and-access) involved:** a Timeline entry an Autopilot AI chose is recorded as the Player action itself, so committing it again [never asks an Autopilot AI to choose](../../design/foundation/timeline.md#returning-to-a-world-state).
- **Only inexpensive actions:** Advance turn is [not a Timeline entry](../../design/foundation/timeline.md#timeline-entries), so replay never applies Turn advancement.
- **Same [Game build](../../design/foundation/core-concepts.md#game-build-and-content):** a [Campaign save](../../design/foundation/engine-contract.md#persisted-data) is only ever loaded by a Game build that [accepts it](../../design/foundation/saves.md#game-build-compatibility).

## Suggested approach

Memory and a Campaign save are suggested to use different representations. In memory, each World state is an immutable value that shares every unchanged part with the World state before it, so undo and redo only move the Timeline pointer, and the [Retired](../../design/foundation/world-history.md#glossary) [Campaign instances](../../design/foundation/core-concepts.md#campaign-instances) of earlier Turns are shared. A [Campaign save](../../design/foundation/engine-contract.md#persisted-data) holds one World state, the Turn-start state, followed by the Player actions of the ordered Timeline entries with the Campaign configuration changes made between them, and loading rebuilds the other World states by replay.

Patches are not suggested: they give no smaller Campaign save than replay and add a reverse change to maintain for every Player action.
