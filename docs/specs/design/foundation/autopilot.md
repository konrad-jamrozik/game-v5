# Autopilot

| Metadata | Value |
| --- | --- |
| Spec ID | AUTO |
| Family | Foundation |
| Audience | Engine designer, UI designer, AI designer, Implementer |
| Owns | Autopilot limits, what an Autopilot AI receives, Autopilot engagement lifecycle, and Autopilot memory. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

Autopilot lets the player hand play over to an AI for a while and then take it back, e.g. to let an [Autopilot AI](engine-contract.md#principals-and-access) play out the next few [Turns](engine-contract.md#player-actions-and-turns). During each [Autopilot engagement](engine-contract.md#autopilot), the Autopilot AI plays the [Current campaign](core-concepts.md#campaign-and-session) through [Player API](engine-contract.md#api-surfaces) in place of the [Session controller](engine-contract.md#principals-and-access), as the [Engine Contract glossary](engine-contract.md#glossary) defines it.

The guiding principle is that an Autopilot AI plays as an ordinary player would, and no further. It receives only [Player-visible information](engine-contract.md#api-surfaces), and it never learns when its Autopilot engagement will end. The Session controller fixes that end in advance as an Autopilot limit, counted in [Player actions](engine-contract.md#player-actions-and-turns) or Turn advancements, and can disengage [Autopilot](engine-contract.md#autopilot) sooner. What the Autopilot AI plans beyond one Autopilot engagement it keeps in [Autopilot memory](engine-contract.md#persisted-data), which moves with the [Campaign](core-concepts.md#campaign-and-session) through undo, redo, and load, so it never holds a plan written at an [Undone action](timeline.md#glossary).

# Glossary

These terms are specific to [Autopilot](engine-contract.md#autopilot). General terms are in the [Engine Contract glossary](engine-contract.md#glossary); [Independent identifier](determinism-and-randomness.md#glossary) is in the [Determinism and Randomness glossary](determinism-and-randomness.md#glossary), and [Timeline entry](timeline.md#glossary) and [Undone action](timeline.md#glossary) are in the [Timeline glossary](timeline.md#glossary).

| Term | Definition | Prohibited synonyms |
| --- | --- | --- |
| Autopilot limit | The bound on an [Autopilot engagement](engine-contract.md#autopilot), fixed when Autopilot is engaged and measured in [Player actions](engine-contract.md#player-actions-and-turns) or [Turn](engine-contract.md#player-actions-and-turns) advancements. | Delegation scope |
| Autopilot engagement ID | The Independent identifier identifying one Autopilot engagement, assigned when Autopilot is engaged. |  |
| Autopilot progress | The Player actions and Turn advancements counted toward the Autopilot limit in the current Autopilot engagement, reported to the [Session controller](engine-contract.md#principals-and-access). The [Autopilot AI](engine-contract.md#principals-and-access) does not receive it. |  |

# Available Autopilot AIs

`session.autopilot.listAutopilotAis()` reports every Autopilot AI that is available, i.e. that `session.autopilot.engage(autopilotAiId, limit)` would accept at the time of the call. For each one it reports at least:

- the `autopilotAiId` that `engage` accepts;
- a name an interface can show; e.g., a user interface offers these names for the player to choose from;
- whether it wrote the [Autopilot memory](engine-contract.md#persisted-data) of the [Current campaign](core-concepts.md#campaign-and-session), when there is a Current campaign that has Autopilot memory. Engaging any other Autopilot AI discards that Autopilot memory, under [Autopilot memory](#autopilot-memory).

Listing needs no Current campaign, changes nothing, and is not a Player action. An Autopilot AI may become unavailable after it was listed, e.g. a remote service stops responding; `engage` then rejects it, under [Autopilot limits](#autopilot-limits). The list may be empty, and engaging Autopilot is then impossible.

# Autopilot limits

`session.autopilot.engage(autopilotAiId, limit)` engages Autopilot for the Current campaign. At most one Autopilot engagement may be active in a [Session](core-concepts.md#campaign-and-session). The complete Autopilot limit inventory is:

| Autopilot limit | Input | Successful completion |
| --- | --- | --- |
| `singleAction` | No action count | One [Player API](engine-contract.md#api-surfaces) action successfully commits, including Advance turn if chosen. |
| `untilTurnAdvanced` | No Turn count | The first Advance turn action successfully commits, after any preceding Player actions. |
| `turnAdvancements` | A positive integer `count` | Exactly `count` Advance turn actions successfully commit. |

Only Player actions or Turn advancements count toward an Autopilot limit; e.g., a query or a rejected action counts toward none. Autopilot disengages immediately at its Autopilot limit; another mutation through that Autopilot engagement is rejected.

A malformed Autopilot limit or an unavailable Autopilot AI rejects engagement without changing [Campaign state](core-concepts.md#campaign-and-session) or creating an active Autopilot engagement.

# What an Autopilot engagement holds

An active Autopilot engagement is what a Session holds from a successful `session.autopilot.engage(autopilotAiId, limit)` until that Autopilot engagement ends, under [Data ownership](engine-contract.md#data-ownership). The following list of what it holds is complete.

| Part | What it is |
| --- | --- |
| Autopilot engagement ID | Assigned by the engine and returned by `engage`. The Session controller passes it as `engagementId` to `session.autopilot.getStatus` and `session.autopilot.disengage`. |
| Autopilot AI | The Autopilot AI that `autopilotAiId` named, which plays through Player API for this Autopilot engagement. |
| Autopilot limit | The Autopilot limit that `limit` supplied. It never changes during the Autopilot engagement. |
| Autopilot progress | What has counted toward the Autopilot limit so far. |

An active Autopilot engagement holds nothing else; e.g., it holds no wall-clock duration, and nothing the Autopilot AI has planned or observed, which only Autopilot memory carries. It is Session state: no [Campaign save](engine-contract.md#persisted-data) holds it, and loading a Campaign save leaves no active Autopilot engagement, under [Loading](saves.md#loading). When the Autopilot engagement ends, the Session holds no active Autopilot engagement.

# What an Autopilot AI receives

During its Autopilot engagement, an Autopilot AI may make Player API queries, Player API actions, and [Autopilot memory API](engine-contract.md#api-surfaces) operations, under [API hierarchy](engine-contract.md#api-hierarchy). The engine supplies it nothing beyond [Player-visible information](engine-contract.md#api-surfaces) and the Autopilot memory, e.g. no [Developer API](engine-contract.md#api-surfaces) result and no Campaign save.

The Autopilot AI does not receive its Autopilot limit or Autopilot progress, so it plays for the [Campaign](core-concepts.md#campaign-and-session) as a whole rather than toward the end of the Autopilot engagement; a plan extending beyond the Autopilot limit is carried forward in Autopilot memory. The Autopilot AI never decides when an Autopilot engagement ends: it ends only for a disengagement reason under [Autopilot lifecycle and concurrency](#autopilot-lifecycle-and-concurrency).

Each Autopilot engagement starts with only Player-visible information and the Autopilot memory. Nothing else carries over into it, e.g. nothing from an earlier Autopilot engagement or from an Undone action.

# Autopilot lifecycle and concurrency

`session.autopilot.getStatus(engagementId)` reports the Autopilot limit, Autopilot progress, and execution status to the Session controller. The complete disengagement reason inventory is limit reached, disengaged by controller, campaign ended, and AI failed. A disengagement result identifies the reason, whether the Autopilot limit was reached, and Autopilot progress. Campaign completion before the Autopilot limit is reached disengages with campaign ended; reaching the Autopilot limit on the same action takes precedence as limit reached. Autopilot disengages as AI failed when the Autopilot AI reports an error, produces no valid action, or exhausts its configured finite execution budget. That budget prevents indefinitely repeated invalid actions or an Autopilot AI that makes no progress; its exact limits are listed under [TODOs](#todos).

Campaign mutations are serialized. During an Autopilot engagement, the Session controller may read Player API queries, Session status, [Timeline](engine-contract.md#persisted-data) status, and Autopilot status, read and change [Global configuration](engine-contract.md#persisted-data), and disengage Autopilot. All other [Session API](engine-contract.md#api-surfaces) operations, Session controller gameplay mutations, and [Developer API](engine-contract.md#api-surfaces) operations are unavailable until disengagement completes. `session.autopilot.disengage(engagementId)` requests disengagement between atomic actions. An action already executing either commits completely or fails without effects. Disengagement never implicitly ends a Turn or undoes earlier Player actions. Failure of the Autopilot AI follows the same boundary rule. A late response from a completed Autopilot engagement cannot change Campaign state or write Autopilot memory. Timeline navigation remains available after disengagement.

Engaging Autopilot writes an [Autosave](saves.md#autosave-kinds), and no [Turn-end Autosave](saves.md#autosave-kinds) is written during an Autopilot engagement, under [Autosaves](saves.md#autosaves). An Autopilot engagement that ends the Turn is therefore reversed as a whole through [Autosave navigation](timeline.md#autosave-navigation), while the Timeline entries of its last Turn are reversed one by one. Completing disengagement writes the [Disengagement Autosave](saves.md#autosave-kinds), holding the [Committed state](engine-contract.md#player-actions-and-turns) in which the Autopilot engagement ended, under [Autosaves](saves.md#autosaves) in Saves.

# Autopilot memory

A Campaign has at most one Autopilot memory, and that Autopilot memory records which Autopilot AI wrote it. A newly created Campaign has no Autopilot memory.

`autopilotMemory.read()` returns the Autopilot memory most recently written at or before the current Committed state, or an explicit absence when there is none. `autopilotMemory.write(memory)` atomically replaces the Autopilot memory. Writing is not a Timeline entry, does not change Campaign state or any gameplay outcome, and does not count toward the Autopilot limit. Only the active Autopilot AI can read or write Autopilot memory; the Session controller cannot inject knowledge through Autopilot memory API.

Engaging Autopilot with an Autopilot AI other than the one that wrote the Autopilot memory discards that Autopilot memory at engagement, at every Committed state the Timeline can restore. The newly engaged Autopilot AI reads absence until it writes. Campaign saves written earlier are unchanged.

Autopilot memory follows the Committed state that undo and redo restore:

- After undo, `autopilotMemory.read()` returns the Autopilot memory as it was at the restored Committed state, never Autopilot memory written at an Undone action.
- Redo restores the Autopilot memory of the Committed state it restores.
- Committing a new action after undo discards the Autopilot memory written at the discarded Undone actions.

A Campaign save holds the Autopilot memory under [Campaign save contents](saves.md#campaign-save-contents), and a successful load restores it. This includes loading an Autosave through [Autosave navigation](timeline.md#autosave-navigation).

# Edge cases and failure behavior

Autopilot disengagement and failure of the Autopilot AI preserve every Player action. An Autopilot AI that calls an operation outside its access is rejected without changing anything, under [Committed state integrity](engine-contract.md#committed-state-integrity).

Timeline navigation cannot erase what a human has seen. The information the engine itself supplies to an Autopilot AI nevertheless follows [What an Autopilot AI receives](#what-an-autopilot-ai-receives).

# Acceptance examples

- **Listing Autopilot AIs:** With Autopilot AIs X and Y available and no Current campaign, `listAutopilotAis()` reports X and Y. Create a Campaign, engage Autopilot with X, which writes Autopilot memory, and wait for disengagement. `listAutopilotAis()` reports X as the one that wrote the Autopilot memory. `engage` with an `autopilotAiId` that was not listed is rejected ([Available Autopilot AIs](#available-autopilot-ais), [Autopilot limits](#autopilot-limits)).

- **Limit accounting:** In `singleAction`, repeated queries and a rejected action do not reach the Autopilot limit; one committed gameplay action does. In `turnAdvancements` with count 2, ordinary actions do not increase Autopilot progress; the second committed Advance turn disengages Autopilot before a third can execute ([Autopilot limits](#autopilot-limits)).
- **Engagement ends at the first Advance turn:** Engage Autopilot with `untilTurnAdvanced`. Its first committed Advance turn disengages Autopilot, and a later action through that Autopilot engagement is rejected ([Autopilot limits](#autopilot-limits)).
- **Autopilot memory follows undo and redo:** At Committed state P, Autopilot AI X writes plan M. Later in the same Turn, at Committed state Q, it observes a newly revealed outcome and writes M2. Undo to P and engage Autopilot with X again: it reads M, and nothing from Q is supplied to it. Save at P with its Undone actions, load, and redo to Q: X reads M2 ([Autopilot memory](#autopilot-memory), [What an Autopilot AI receives](#what-an-autopilot-ai-receives)).
- **A different Autopilot AI discards Autopilot memory:** Autopilot AI X writes plan M and Autopilot disengages. Engage Autopilot with Autopilot AI Y: Y reads absence. Disengage, undo to an earlier Committed state, and engage Autopilot with X: X also reads absence ([Autopilot memory](#autopilot-memory)).
- **Disengagement during an action:** Disengage Autopilot during an action. The action either commits completely or fails without effects; earlier Player actions remain ([Autopilot lifecycle and concurrency](#autopilot-lifecycle-and-concurrency)).

# TODOs

- TODO: Choose the exact limits of the finite execution budget of an Autopilot AI.
- TODO: Define how an Autopilot AI becomes available beyond those the [Game build](core-concepts.md#game-build-and-content) offers, e.g. whether the player can register one.
- TODO (later): Keep Autopilot memory for several Autopilot AIs in one Campaign, see [Autopilot memory](#autopilot-memory).
