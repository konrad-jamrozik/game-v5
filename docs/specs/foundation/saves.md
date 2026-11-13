# Saves

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | SAVES                                                          |
| Family      | Foundation                                                     |
| Status      | Draft                                                          |
| Audience    | Engine designer, UI designer, Implementer                      |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Overview

This document defines Campaign saves: what a Campaign save holds, saving, saving as new, loading, the Save size
limit, and which Campaign saves a Game build loads.

It owns what saving and loading observably do. How a Campaign save is encoded and stored is the implementer's choice.

# Relationships

- Uses [Core Concepts](./core-concepts.md)
- Uses [Engine Contract](./engine-contract.md)
- Uses [Timeline](./timeline.md)
- Used by [Campaign Integration and Acceptance Tests](../acceptance/campaign-integration-and-acceptance-tests.md)
- Used by [Storage Schema](../implementation/storage-schema.md)
- Used by [Terminal CLI](../interfaces/cli.md)
- Used by [TypeScript Player API](../interfaces/typescript-api.md)
- Used by [Web UI](../interfaces/web-ui.md)

# Glossary

Campaign save, Current save, Current campaign, Game storage, Timeline, Autopilot memory, and Independent identifier
are defined by the [Engine Contract glossary](engine-contract.md#glossary). Timeline position, Timeline cursor, and
Timeline entry are defined by the [Timeline glossary](timeline.md#glossary).

## Identifiers

The identifiers of Campaigns and their Campaign saves.

| Term             | Definition                                                                                                                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Campaign ID      | The Independent identifier identifying one Campaign, assigned when the Campaign is created and shared by every Campaign save of that Campaign. It is not Campaign state, and game behavior never consults it. |
| Campaign save ID | The Independent identifier identifying one Campaign save, assigned when that Campaign save is created.                                                                                                        |

## Save limits

The bound on a Campaign save and its consequence for undo.

| Term            | Definition                                                                 |
| --------------- | -------------------------------------------------------------------------- |
| Save size limit | The maximum size of one Campaign save, fixed by the Game build.            |
| Baseline        | The earliest Timeline position a loaded Campaign save can restore by undo. |

# Campaign save contents

A Campaign save holds, as shown under [Data ownership](engine-contract.md#data-ownership):

- its Campaign save ID and the Campaign ID of its Campaign;
- the Campaign state at the saved Timeline position;
- the Timeline, including its redo entries and Timeline cursor, unless [Save size limit](#save-size-limit) omits it;
- the Autopilot memory of the Campaign.

A Campaign save holds nothing a Session holds and no Global configuration.

One Campaign may have several Campaign saves, which share its Campaign ID and have distinct Campaign save IDs. E.g., a
player may keep a Timeline branch that a new action after undo would otherwise discard. Two Campaigns created with equal
creation inputs, including the same Campaign seed, and given equal commands have equal Campaign state but distinct
Campaign IDs. Because the Campaign seed is Campaign state, under [Campaign seed](engine-contract.md#campaign-seed),
every Campaign save holds it, including one written without its Timeline.

# Saving

Saving captures the Current campaign at its Timeline cursor. It is available at every Timeline position, including
before the player advances the turn, and it is not a Timeline entry.

`session.campaigns.save()` writes the Current campaign to its Current save, replacing that Campaign save's contents.
When the Current campaign has no Current save, it creates a new Campaign save and makes that the Current save.

`session.campaigns.saveAsNew()` always creates a new Campaign save of the same Campaign and makes that the Current
save; every earlier Campaign save is unchanged. Forking a Timeline uses `saveAsNew()`: there is no separate fork
operation, and a fork keeps the Campaign ID and receives a new Campaign save ID.

# Loading

A successful `session.campaigns.load(save)` atomically:

- restores the Campaign state, Timeline, and Autopilot memory held by the Campaign save;
- selects that Campaign as the Current campaign and that Campaign save as the Current save;
- leaves no active Autopilot engagement and Dev mode disabled, under
  [Campaign lifecycle](engine-contract.md#campaign-lifecycle).

Play continued after a load produces the outcomes of uninterrupted play, under
[Determinism](engine-contract.md#determinism). An Autopilot engagement that was active when the Campaign was saved is
not resumed.

# Save size limit

The Save size limit is 100 MiB. It is a safety measure against unbounded storage use, not a gameplay rule.

A Campaign save written with its Timeline has the first Timeline position as its Baseline.

If writing a Campaign save with its Timeline would exceed the Save size limit, the Campaign save is written without
the Timeline:

- It holds the Campaign state at the Timeline cursor, and that Timeline position is its Baseline.
- It holds no Timeline entries, so neither undo nor redo is available immediately after it is loaded.
- It holds the Autopilot memory applicable at the Timeline cursor.
- The save operation reports that the Timeline was omitted.

Omitting the Timeline affects only that Campaign save. The Session keeps its own Timeline until the Current campaign
is closed or replaced, other Campaign saves of the same Campaign are unchanged, and World history, being Campaign
state, is never omitted.

After a Campaign save is loaded, Timeline positions before its Baseline are unavailable to undo. Play from the Baseline
onward produces the outcomes of uninterrupted play.

If a Campaign save would exceed the Save size limit even without its Timeline, the save operation fails: no Campaign
save is written or changed, the Current save is unchanged, and the Session keeps its Current campaign and Timeline.

# Game build compatibility

Backward compatibility and migration of Campaign saves across Game builds are not required. A Game build may reject
a Campaign save written by a different Game build.

# Edge cases and failure behavior

A load that fails leaves the entire prior Session unchanged, including its Current campaign and Current save, under
[Committed state integrity](engine-contract.md#committed-state-integrity). A save that fails writes and changes no
Campaign save.

A failed load or save reports the failure to the Session controller, with exactly one reason and a message that
names the Campaign save concerned. The following list of reasons is complete.

| Operation | Reason                   | When it applies                                                                                    |
| --------- | ------------------------ | -------------------------------------------------------------------------------------------------- |
| Load      | Incompatible Game build  | The Campaign save is rejected under [Game build compatibility](#game-build-compatibility).         |
| Load      | Corrupt Campaign save    | The Campaign save can be read but its contents are not a valid Campaign save.                      |
| Load      | Unreadable Campaign save | The Campaign save cannot be read, e.g. it no longer exists or Game storage is unavailable.         |
| Save      | Save size limit exceeded | The Campaign save would exceed the Save size limit even without its Timeline.                      |
| Save      | Unwritable Campaign save | The Campaign save cannot be written, e.g. Game storage is full, unavailable, or refuses the write. |

A failed operation is not retried automatically, and it is not an engine defect. An interface shows the reason and
message and takes no further action; e.g., the Web UI shows an error message and stays on the screen
the load or save was requested from. The message follows the
[Information boundary](engine-contract.md#information-boundary).

# Acceptance examples

- **Save and load:** Create Campaign A, save after a gameplay action before Advance turn, then create Campaign B.
  Load the Campaign save of Campaign A and obtain the exact saved Campaign state with Dev mode disabled and no active
  Autopilot engagement. Loading a corrupt Campaign save reports the reason Corrupt Campaign save and leaves the
  Current campaign unchanged ([Saving](#saving), [Loading](#loading),
  [Edge cases and failure behavior](#edge-cases-and-failure-behavior)).
- **Fork by saving as new:** Load Campaign save S1 and commit actions. `saveAsNew()` creates S2 and makes it the
  Current save. Undo two actions and commit a different action, then `save()`. S2 holds the new Timeline branch; S1
  still holds the original one. Both have the same Campaign ID ([Saving](#saving)).
- **Campaign configuration isolation:** Save Campaign A, then load a Campaign save of Campaign B with different
  Campaign configuration. The saved values of B apply. Loading the Campaign save of A restores the saved values of A
  ([Loading](#loading)).
- **Timeline omitted at the Save size limit:** At turn 40, save a Campaign whose Campaign save would exceed the Save
  size limit with its Timeline. The save reports the omitted Timeline. Load it: the turn 40 Timeline position is the
  Baseline, `undoAction()` and `undoTurn()` are unavailable, and play continues with the outcomes of uninterrupted
  play ([Save size limit](#save-size-limit)).
- **Too large without a Timeline:** Save a Campaign whose Campaign state alone exceeds 100 MiB. The save fails,
  every existing Campaign save is unchanged, and undo and redo in the Session still work
  ([Save size limit](#save-size-limit)).
