# Autopilot

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | AUTO                                                           |
| Family      | Foundation                                                     |
| Status      | Draft                                                          |
| Audience    | Engine designer, UI designer, AI designer, Implementer         |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Overview

This document defines Autopilot: how an Autopilot engagement is bounded, what an Autopilot AI receives, how an
Autopilot engagement ends, and how Autopilot memory behaves.

It owns the behavior of Autopilot only. Which API surfaces an Autopilot AI can call is owned by
[API hierarchy](engine-contract.md#api-hierarchy) in Engine Contract, and how an Autopilot AI decides what to do is
outside the specifications.

# Relationships

- Uses [Core Concepts](./core-concepts.md)
- Uses [Engine Contract](./engine-contract.md)
- Uses [Timeline](./timeline.md)
- Used by [Player Information](../interfaces/player-information.md)
- Used by [Terminal CLI](../interfaces/cli.md)
- Used by [Web UI](../interfaces/web-ui.md)
- Refined by [TypeScript Player API](../interfaces/typescript-api.md)

# Glossary

Autopilot, Autopilot AI, Autopilot engagement, Autopilot memory, Autopilot memory API, Session controller, and
Player-visible information are defined by the [Engine Contract glossary](engine-contract.md#glossary). Timeline
position, Timeline cursor, and Timeline branch are defined by the [Timeline glossary](timeline.md#glossary).

| Term               | Definition                                                                                                                                                                                           |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Autopilot limit    | The bound on an Autopilot engagement, fixed when Autopilot is engaged and measured in committed player actions or turn advancements.                                                                 |
| Autopilot progress | The committed player actions and turn advancements counted toward the Autopilot limit in the current Autopilot engagement, reported to the Session controller. The Autopilot AI does not receive it. |

# Autopilot limits

`session.autopilot.engage(autopilotAiId, limit)` engages Autopilot for the Current campaign. At most one
Autopilot engagement may be active in a Session. The complete Autopilot limit inventory is:

| Autopilot limit     | Input                      | Successful completion                                                                   |
| ------------------- | -------------------------- | --------------------------------------------------------------------------------------- |
| `singleAction`      | No action count            | One Player API action successfully commits, including Advance turn if chosen.           |
| `untilTurnAdvanced` | No turn count              | The first Advance turn action successfully commits, after any preceding player actions. |
| `turnAdvancements`  | A positive integer `count` | Exactly `count` Advance turn actions successfully commit.                               |

Only committed player actions or turn advancements count toward an Autopilot limit; e.g., a query or a rejected action
counts toward none. Autopilot disengages immediately at its Autopilot limit; another mutation through that Autopilot
engagement is rejected.

A malformed Autopilot limit or an unavailable Autopilot AI rejects engagement without changing Campaign state or
creating an active Autopilot engagement.

# What an Autopilot AI receives

During its Autopilot engagement, an Autopilot AI may make Player API queries, Player API actions, and Autopilot
memory API operations, under [API hierarchy](engine-contract.md#api-hierarchy). The engine supplies it nothing beyond
Player-visible information and the Autopilot memory, e.g. no Developer API result and no Campaign save.

The Autopilot AI does not receive its Autopilot limit or Autopilot progress, so it plays for the Campaign as a whole
rather than toward the end of the Autopilot engagement; a plan extending beyond the Autopilot limit is carried forward in
Autopilot memory. The Autopilot AI never decides when an Autopilot engagement ends: it ends only for a disengagement
reason under [Autopilot lifecycle and concurrency](#autopilot-lifecycle-and-concurrency).

Each Autopilot engagement starts with only Player-visible information and the Autopilot memory. Nothing else carries
over into it, e.g. nothing from an earlier Autopilot engagement, a later Timeline position, or a discarded Timeline
branch.

# Autopilot lifecycle and concurrency

`session.autopilot.getStatus(engagementId)` reports the Autopilot limit, Autopilot progress, and execution status to the Session
controller. The complete disengagement reason inventory is limit reached, disengaged by controller, campaign ended, and AI
failed. A disengagement result identifies the reason, whether the Autopilot limit was reached, and Autopilot progress.
Campaign completion before the Autopilot limit is reached disengages with campaign ended; reaching the Autopilot limit on the same
action takes precedence as limit reached. Autopilot disengages as AI failed when the Autopilot AI reports an error,
produces no valid action, or exhausts its configured finite execution budget. That budget prevents indefinitely
repeated invalid actions or an Autopilot AI that makes no progress; its exact limits belong to TypeScript Player API.

Campaign mutations are serialized. During an Autopilot engagement, the Session controller may read Player API queries,
Session status, Timeline status, and Autopilot status, and disengage Autopilot. All other Session API operations,
Session controller gameplay mutations, and Developer API operations are unavailable until disengagement completes.
`session.autopilot.disengage(engagementId)` requests disengagement between atomic actions. An action already executing either
commits completely or fails without effects. Disengagement never implicitly advances a turn or undoes earlier
Committed actions. Failure of the Autopilot AI follows the same boundary rule. A late response from a completed Autopilot engagement
cannot change Campaign state or write Autopilot memory. Timeline navigation remains available after disengagement.

# Autopilot memory

A Campaign has at most one Autopilot memory, and that Autopilot memory records which Autopilot AI wrote it. Keeping
Autopilot memory for several Autopilot AIs in one Campaign is out of scope. A newly created Campaign has no Autopilot
memory.

`autopilotMemory.read()` returns the Autopilot memory most recently written at or before the Timeline cursor on the
current Timeline branch, or an explicit absence when there is none. `autopilotMemory.write(memory)` atomically replaces
the Autopilot memory. Writing is not a Timeline entry, does not change Campaign state or any gameplay outcome, and does
not count toward the Autopilot limit. Only the active Autopilot AI can read or write Autopilot memory; the Session
controller cannot inject knowledge through Autopilot memory API.

Engaging Autopilot with an Autopilot AI other than the one that wrote the Autopilot memory discards that Autopilot
memory at engagement, at every Timeline position. The newly engaged Autopilot AI reads absence until it writes.
Campaign saves written earlier are unchanged.

Autopilot memory follows the Timeline cursor:

- After undo, `autopilotMemory.read()` returns the Autopilot memory as it was at the restored Timeline position, never
  Autopilot memory written at a later Timeline position.
- Redo restores the Autopilot memory of the Timeline position it moves to.
- Starting a new Timeline branch discards the Autopilot memory written at the discarded Timeline entries.

A Campaign save holds the Autopilot memory under [Campaign save contents](saves.md#campaign-save-contents), and a
successful load restores it.

# Edge cases and failure behavior

Autopilot disengagement and failure of the Autopilot AI preserve every Committed action. An Autopilot AI that calls
an operation outside its access is rejected without changing anything, under
[Committed state integrity](engine-contract.md#committed-state-integrity).

Timeline navigation cannot erase what a human has seen. The information the engine itself supplies to an Autopilot AI
nevertheless follows [What an Autopilot AI receives](#what-an-autopilot-ai-receives).

# Acceptance examples

- **Limit accounting:** In `singleAction`, repeated queries and a rejected action do not reach the Autopilot limit;
  one committed gameplay action does. In `turnAdvancements` with count 2, ordinary actions do not increase Autopilot
  progress; the second committed Advance turn disengages Autopilot before a third can execute
  ([Autopilot limits](#autopilot-limits)).
- **Engagement ends at the first Advance turn:** Engage Autopilot with `untilTurnAdvanced`. Its first committed Advance
  turn disengages Autopilot, and a later action through that Autopilot engagement is rejected
  ([Autopilot limits](#autopilot-limits)).
- **Autopilot memory follows the Timeline cursor:** At Timeline position P, Autopilot AI X writes plan M. Later at
  Timeline position Q it observes a newly revealed outcome and writes M2. Undo to P and engage Autopilot with X again:
  it reads M, and nothing from Q is supplied to it. Save at P with its redo entries, load, and redo to Q: X reads M2
  ([Autopilot memory](#autopilot-memory), [What an Autopilot AI receives](#what-an-autopilot-ai-receives)).
- **A different Autopilot AI discards Autopilot memory:** Autopilot AI X writes plan M and Autopilot disengages. Engage
  Autopilot with Autopilot AI Y: Y reads absence. Disengage, undo to an earlier Timeline position, and engage Autopilot
  with X: X also reads absence ([Autopilot memory](#autopilot-memory)).
- **Disengagement during an action:** Disengage Autopilot during an action. The action either commits completely or
  fails without effects; earlier Committed actions remain
  ([Autopilot lifecycle and concurrency](#autopilot-lifecycle-and-concurrency)).
