# Autopilot

| Metadata    | Value                                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------------------ |
| Spec ID     | AUTO                                                                                                   |
| Family      | Foundation                                                                                             |
| Status      | Draft                                                                                                  |
| Audience    | Engine designer, UI designer, AI designer, Implementer                                                 |
| Owns        | Autopilot limits, what an Autopilot AI receives, Autopilot engagement lifecycle, and Autopilot memory. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                                         |

# Overview

This document defines Autopilot: how an Autopilot engagement is bounded, what an Autopilot AI receives, how an
Autopilot engagement ends, and how Autopilot memory behaves.

It owns the behavior of Autopilot only. Which API surfaces an Autopilot AI can call is owned by
[API hierarchy](engine-contract.md#api-hierarchy) in Engine Contract. How an Autopilot AI decides what to do is outside
this document: each Autopilot AI a Game build offers is described in the Autopilot AIs family.

# Relationships

- Uses [Core Concepts](./core-concepts.md)
- Uses [Determinism and Randomness](./determinism-and-randomness.md)
- Uses [Engine Contract](./engine-contract.md)
- Uses [Timeline](./timeline.md)
- Used by [Basic Autopilot AI](../autopilot-ais/basic-autopilot-ai.md)

# Glossary

Autopilot, Autopilot AI, Autopilot engagement, Autopilot memory, Autopilot memory API, Session controller,
Player-visible information, and Turn are defined by the [Engine Contract glossary](engine-contract.md#glossary).
Independent identifier is defined by the [Determinism and Randomness glossary](determinism-and-randomness.md#glossary).
Timeline entry and Undone action are defined by the [Timeline glossary](timeline.md#glossary).

| Term                    | Definition                                                                                                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Autopilot limit         | The bound on an Autopilot engagement, fixed when Autopilot is engaged and measured in Player actions or turn advancements.                                                                 |
| Autopilot engagement ID | The Independent identifier identifying one Autopilot engagement, assigned when Autopilot is engaged.                                                                                       |
| Autopilot progress      | The Player actions and turn advancements counted toward the Autopilot limit in the current Autopilot engagement, reported to the Session controller. The Autopilot AI does not receive it. |

# Available Autopilot AIs

`session.autopilot.listAutopilotAis()` reports every Autopilot AI that is available, i.e. that
`session.autopilot.engage(autopilotAiId, limit)` would accept at the time of the call. For each one it reports at
least:

- the `autopilotAiId` that `engage` accepts;
- a name an interface can show; e.g., a user interface offers these names for the player to choose from;
- whether it wrote the Autopilot memory of the Current campaign, when there is a Current campaign that has Autopilot
  memory. Engaging any other Autopilot AI discards that Autopilot memory, under [Autopilot memory](#autopilot-memory).

Listing needs no Current campaign, changes nothing, and is not a Player action. An Autopilot AI may become
unavailable after it was listed, e.g. a remote service stops responding; `engage` then rejects it, under
[Autopilot limits](#autopilot-limits). The list may be empty, and engaging Autopilot is then impossible.

# Autopilot limits

`session.autopilot.engage(autopilotAiId, limit)` engages Autopilot for the Current campaign. At most one
Autopilot engagement may be active in a Session. The complete Autopilot limit inventory is:

| Autopilot limit     | Input                      | Successful completion                                                                   |
| ------------------- | -------------------------- | --------------------------------------------------------------------------------------- |
| `singleAction`      | No action count            | One Player API action successfully commits, including Advance turn if chosen.           |
| `untilTurnAdvanced` | No turn count              | The first Advance turn action successfully commits, after any preceding Player actions. |
| `turnAdvancements`  | A positive integer `count` | Exactly `count` Advance turn actions successfully commit.                               |

Only Player actions or turn advancements count toward an Autopilot limit; e.g., a query or a rejected action
counts toward none. Autopilot disengages immediately at its Autopilot limit; another mutation through that Autopilot
engagement is rejected.

A malformed Autopilot limit or an unavailable Autopilot AI rejects engagement without changing Campaign state or
creating an active Autopilot engagement.

# What an Autopilot engagement holds

An active Autopilot engagement is what a Session holds from a successful `session.autopilot.engage(autopilotAiId, limit)`
until that Autopilot engagement ends, under [Data ownership](engine-contract.md#data-ownership). The following list of
what it holds is complete.

| Part                    | What it is                                                                                                                                                              |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Autopilot engagement ID | Assigned by the engine and returned by `engage`. The Session controller passes it as `engagementId` to `session.autopilot.getStatus` and `session.autopilot.disengage`. |
| Autopilot AI            | The Autopilot AI that `autopilotAiId` named, which plays through Player API for this Autopilot engagement.                                                              |
| Autopilot limit         | The Autopilot limit that `limit` supplied. It never changes during the Autopilot engagement.                                                                            |
| Autopilot progress      | What has counted toward the Autopilot limit so far.                                                                                                                     |

An active Autopilot engagement holds nothing else; e.g., it holds no wall-clock duration, and nothing the Autopilot AI
has planned or observed, which only Autopilot memory carries. It is Session state: no Campaign save holds it, and
loading a Campaign save leaves no active Autopilot engagement, under [Loading](saves.md#loading). When the Autopilot
engagement ends, the Session holds no active Autopilot engagement.

# What an Autopilot AI receives

During its Autopilot engagement, an Autopilot AI may make Player API queries, Player API actions, and Autopilot
memory API operations, under [API hierarchy](engine-contract.md#api-hierarchy). The engine supplies it nothing beyond
Player-visible information and the Autopilot memory, e.g. no Developer API result and no Campaign save.

The Autopilot AI does not receive its Autopilot limit or Autopilot progress, so it plays for the Campaign as a whole
rather than toward the end of the Autopilot engagement; a plan extending beyond the Autopilot limit is carried forward in
Autopilot memory. The Autopilot AI never decides when an Autopilot engagement ends: it ends only for a disengagement
reason under [Autopilot lifecycle and concurrency](#autopilot-lifecycle-and-concurrency).

Each Autopilot engagement starts with only Player-visible information and the Autopilot memory. Nothing else carries
over into it, e.g. nothing from an earlier Autopilot engagement or from an Undone action.

# Autopilot lifecycle and concurrency

`session.autopilot.getStatus(engagementId)` reports the Autopilot limit, Autopilot progress, and execution status to the Session
controller. The complete disengagement reason inventory is limit reached, disengaged by controller, campaign ended, and AI
failed. A disengagement result identifies the reason, whether the Autopilot limit was reached, and Autopilot progress.
Campaign completion before the Autopilot limit is reached disengages with campaign ended; reaching the Autopilot limit on the same
action takes precedence as limit reached. Autopilot disengages as AI failed when the Autopilot AI reports an error,
produces no valid action, or exhausts its configured finite execution budget. That budget prevents indefinitely
repeated invalid actions or an Autopilot AI that makes no progress; its exact limits are an open decision.

Campaign mutations are serialized. During an Autopilot engagement, the Session controller may read Player API queries,
Session status, Timeline status, and Autopilot status, read and change Global configuration, and disengage Autopilot. All other Session API operations,
Session controller gameplay mutations, and Developer API operations are unavailable until disengagement completes.
`session.autopilot.disengage(engagementId)` requests disengagement between atomic actions. An action already executing either
commits completely or fails without effects. Disengagement never implicitly advances a turn or undoes earlier
Player actions. Failure of the Autopilot AI follows the same boundary rule. A late response from a completed Autopilot engagement
cannot change Campaign state or write Autopilot memory. Timeline navigation remains available after disengagement.

Engaging Autopilot writes an Autosave, and no Turn-end Autosave is written during an Autopilot engagement.
[Autosaves](saves.md#autosaves) in Saves owns these rules. An Autopilot engagement that advances the turn is
therefore reversed as a whole through [Autosave navigation](timeline.md#autosave-navigation), while the Timeline
entries of its last Turn are reversed one by one. Completing disengagement writes no Autosave of its own: the Current
Autosave already holds the Committed state in which the Autopilot engagement ended.

# Autopilot memory

A Campaign has at most one Autopilot memory, and that Autopilot memory records which Autopilot AI wrote it. Keeping
Autopilot memory for several Autopilot AIs in one Campaign is out of scope. A newly created Campaign has no Autopilot
memory.

`autopilotMemory.read()` returns the Autopilot memory most recently written at or before the current Committed state,
or an explicit absence when there is none. `autopilotMemory.write(memory)` atomically replaces
the Autopilot memory. Writing is not a Timeline entry, does not change Campaign state or any gameplay outcome, and does
not count toward the Autopilot limit. Only the active Autopilot AI can read or write Autopilot memory; the Session
controller cannot inject knowledge through Autopilot memory API.

Engaging Autopilot with an Autopilot AI other than the one that wrote the Autopilot memory discards that Autopilot
memory at engagement, at every Committed state the Timeline can restore. The newly engaged Autopilot AI reads absence
until it writes. Campaign saves written earlier are unchanged.

Autopilot memory follows the Committed state that undo and redo restore:

- After undo, `autopilotMemory.read()` returns the Autopilot memory as it was at the restored Committed state, never
  Autopilot memory written at an Undone action.
- Redo restores the Autopilot memory of the Committed state it restores.
- Committing a new action after undo discards the Autopilot memory written at the discarded Undone actions.

A Campaign save holds the Autopilot memory under [Campaign save contents](saves.md#campaign-save-contents), and a
successful load restores it. This includes loading an Autosave through
[Autosave navigation](timeline.md#autosave-navigation).

# Edge cases and failure behavior

Autopilot disengagement and failure of the Autopilot AI preserve every Player action. An Autopilot AI that calls
an operation outside its access is rejected without changing anything, under
[Committed state integrity](engine-contract.md#committed-state-integrity).

Timeline navigation cannot erase what a human has seen. The information the engine itself supplies to an Autopilot AI
nevertheless follows [What an Autopilot AI receives](#what-an-autopilot-ai-receives).

# Acceptance examples

- **Listing Autopilot AIs:** With Autopilot AIs X and Y available and no Current campaign, `listAutopilotAis()`
  reports X and Y. Create a Campaign, engage Autopilot with X, which writes Autopilot memory, and wait for
  disengagement. `listAutopilotAis()` reports X as the one that wrote the Autopilot memory. `engage` with an
  `autopilotAiId` that was not listed is rejected ([Available Autopilot AIs](#available-autopilot-ais),
  [Autopilot limits](#autopilot-limits)).

- **Limit accounting:** In `singleAction`, repeated queries and a rejected action do not reach the Autopilot limit;
  one committed gameplay action does. In `turnAdvancements` with count 2, ordinary actions do not increase Autopilot
  progress; the second committed Advance turn disengages Autopilot before a third can execute
  ([Autopilot limits](#autopilot-limits)).
- **Engagement ends at the first Advance turn:** Engage Autopilot with `untilTurnAdvanced`. Its first committed Advance
  turn disengages Autopilot, and a later action through that Autopilot engagement is rejected
  ([Autopilot limits](#autopilot-limits)).
- **Autopilot memory follows undo and redo:** At Committed state P, Autopilot AI X writes plan M. Later in the same
  Turn, at Committed state Q, it observes a newly revealed outcome and writes M2. Undo to P and engage Autopilot with X
  again: it reads M, and nothing from Q is supplied to it. Save at P with its Undone actions, load, and redo to Q: X
  reads M2 ([Autopilot memory](#autopilot-memory), [What an Autopilot AI receives](#what-an-autopilot-ai-receives)).
- **A different Autopilot AI discards Autopilot memory:** Autopilot AI X writes plan M and Autopilot disengages. Engage
  Autopilot with Autopilot AI Y: Y reads absence. Disengage, undo to an earlier Committed state, and engage Autopilot
  with X: X also reads absence ([Autopilot memory](#autopilot-memory)).
- **Disengagement during an action:** Disengage Autopilot during an action. The action either commits completely or
  fails without effects; earlier Player actions remain
  ([Autopilot lifecycle and concurrency](#autopilot-lifecycle-and-concurrency)).

# Open decisions

- TODO: Choose the exact limits of the finite execution budget of an Autopilot AI.
- TODO: Define how an Autopilot AI becomes available beyond those the Game build offers, e.g. whether the player can
  register one.
