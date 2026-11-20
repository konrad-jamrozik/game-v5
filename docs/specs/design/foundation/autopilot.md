# Autopilot

| Metadata | Value |
| --- | --- |
| Spec ID | AUTO |
| Family | Foundation |
| Audience | Engine designer, UI designer, AI designer, Implementer |
| Owns | Autopilot limits, what an Autopilot AI receives, and Autopilot engagement lifecycle. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

Autopilot lets the player hand play over to an AI for a while and then take it back, e.g. to let an [Autopilot AI](engine-contract.md#principals-and-access) play out the next few [Turns](engine-contract.md#player-actions-and-turns). During each [Autopilot engagement](engine-contract.md#autopilot), the Autopilot AI plays the [Current campaign](core-concepts.md#campaign-and-session) through [Player API](engine-contract.md#api-surfaces) in place of the [Session controller](engine-contract.md#principals-and-access), as the [Engine Contract glossary](engine-contract.md#glossary) defines it.

The guiding principle is that an Autopilot AI plays as an ordinary player would, and no further. It receives only [Player-visible information](engine-contract.md#api-surfaces), and it never learns when its Autopilot engagement will end. The Session controller fixes that end in advance as an Autopilot limit, i.e. one [Player action](engine-contract.md#player-actions-and-turns), the Player actions of the current Turn, or a number of Turn advancements, and can disengage [Autopilot](engine-contract.md#autopilot) sooner. When the Autopilot limit leaves the end of the Turn to the player, the engine withholds the Advance turn the Autopilot AI requests and hands play back. Nothing the Autopilot AI plans or observes outlives its Autopilot engagement: each one starts afresh from what the player can see of the [Campaign](core-concepts.md#campaign-and-session).

# Glossary

These terms are specific to [Autopilot](engine-contract.md#autopilot). General terms are in the [Engine Contract glossary](engine-contract.md#glossary); [Independent identifier](determinism-and-randomness.md#glossary) is in the [Determinism and Randomness glossary](determinism-and-randomness.md#glossary), and [Undone action](timeline.md#glossary) is in the [Timeline glossary](timeline.md#glossary).

| Term | Definition | Prohibited synonyms |
| --- | --- | --- |
| Autopilot limit | The bound on an [Autopilot engagement](engine-contract.md#autopilot), fixed when Autopilot is engaged: one [Player action](engine-contract.md#player-actions-and-turns) other than Advance turn, the Player actions of the current [Turn](engine-contract.md#player-actions-and-turns), or a number of Turn advancements. | Delegation scope |
| Autopilot engagement ID | The Independent identifier identifying one Autopilot engagement, assigned when Autopilot is engaged. |  |
| Autopilot progress | The number of Player actions other than Advance turn and the number of Advance turn actions that have committed in the current Autopilot engagement, reported to the [Session controller](engine-contract.md#principals-and-access). The [Autopilot AI](engine-contract.md#principals-and-access) does not receive it. |  |

# Available Autopilot AIs

`session.autopilot.listAutopilotAis()` reports every Autopilot AI that is available, i.e. that `session.autopilot.engage(autopilotAiId, limit)` would accept at the time of the call. For each one it reports at least:

- the `autopilotAiId` that `engage` accepts;
- a name an interface can show; e.g., a user interface offers these names for the player to choose from.

Listing needs no [Current campaign](core-concepts.md#campaign-and-session), changes nothing, and is not a Player action. An Autopilot AI may become unavailable after it was listed, e.g. a remote service stops responding; `engage` then rejects it, under [Autopilot limits](#autopilot-limits). The list may be empty, and engaging Autopilot is then impossible.

# Autopilot limits

`session.autopilot.engage(autopilotAiId, limit)` engages Autopilot for the Current campaign. At most one Autopilot engagement may be active in a [Session](core-concepts.md#campaign-and-session).

An Autopilot AI ends each Turn it plays by requesting Advance turn once it has no other Player action to make, as a player does; it does not know its Autopilot limit, under [What an Autopilot AI receives](#what-an-autopilot-ai-receives). Each Autopilot limit therefore states whether the engine commits that Advance turn or withholds it. The complete Autopilot limit inventory is:

| Autopilot limit | Input | A requested Advance turn | The Autopilot engagement ends normally when |
| --- | --- | --- | --- |
| `singleAction` | None | Is withheld | One [Player API](engine-contract.md#api-surfaces) action other than Advance turn commits, with the disengagement reason limit reached; or the Autopilot AI requests Advance turn first, with the disengagement reason Advance turn withheld and no Player action committed. |
| `turnActions` | None | Is withheld | The Autopilot AI requests Advance turn, with the disengagement reason Advance turn withheld, after any number of Player actions, including none. |
| `turnAdvancements` | A whole number `count` of at least 1 | Commits | The `count`-th Advance turn commits, with the disengagement reason limit reached. |

A withheld Advance turn is not committed: it changes no [Campaign state](core-concepts.md#campaign-and-session), and it is neither a Player action nor a rejected action. An Advance turn request that the engine would reject is rejected as any other action is and withholds nothing. Autopilot progress counts only committed Player actions; e.g., a query, a rejected action, and a withheld Advance turn count toward none. Autopilot disengages immediately when its Autopilot limit is reached or an Advance turn is withheld; another mutation through that Autopilot engagement is rejected.

A malformed Autopilot limit, e.g. `turnAdvancements` with a `count` of 0, or an unavailable Autopilot AI rejects engagement without changing [Campaign state](core-concepts.md#campaign-and-session) or creating an active Autopilot engagement.

# What an Autopilot engagement holds

An active Autopilot engagement is what a Session holds from a successful `session.autopilot.engage(autopilotAiId, limit)` until that Autopilot engagement ends, under [Data ownership](engine-contract.md#data-ownership). The following list of what it holds is complete.

| Part | What it is |
| --- | --- |
| Autopilot engagement ID | Assigned by the engine and returned by `engage`. The Session controller passes it as `engagementId` to `session.autopilot.getStatus` and `session.autopilot.disengage`. |
| Autopilot AI | The Autopilot AI that `autopilotAiId` named, which plays through Player API for this Autopilot engagement. |
| Autopilot limit | The Autopilot limit that `limit` supplied. It never changes during the Autopilot engagement. |
| Autopilot progress | What has counted toward the Autopilot limit so far. |

An active Autopilot engagement holds nothing else; e.g., it holds no wall-clock duration, and nothing the Autopilot AI has planned or observed. It is Session state: no [Campaign save](engine-contract.md#persisted-data) holds it, and loading a Campaign save leaves no active Autopilot engagement, under [Loading](saves.md#loading). When the Autopilot engagement ends, the Session holds no active Autopilot engagement.

# What an Autopilot AI receives

During its Autopilot engagement, an Autopilot AI may make Player API queries and Player API actions, under [API hierarchy](engine-contract.md#api-hierarchy). The engine supplies it nothing beyond [Player-visible information](engine-contract.md#api-surfaces), e.g. no [Developer API](engine-contract.md#api-surfaces) result and no Campaign save.

The Autopilot AI does not receive its Autopilot limit or Autopilot progress, so it plays for the [Campaign](core-concepts.md#campaign-and-session) as a whole rather than toward the end of the Autopilot engagement. The Autopilot AI has no operation that ends an Autopilot engagement: the engine judges its requests against the Autopilot limit it does not know, and the Autopilot engagement ends only for a disengagement reason under [Autopilot lifecycle and concurrency](#autopilot-lifecycle-and-concurrency).

Each Autopilot engagement starts with only Player-visible information. Nothing else carries over into it, e.g. nothing from an earlier Autopilot engagement or from an Undone action.

# Autopilot lifecycle and concurrency

`session.autopilot.getStatus(engagementId)` reports the Autopilot limit, Autopilot progress, and execution status to the Session controller. The complete disengagement reason inventory is limit reached, Advance turn withheld, disengaged by controller, campaign ended, and AI failed; [Autopilot limits](#autopilot-limits) states when the first two apply. A disengagement result identifies the reason and Autopilot progress, so the Session controller can tell, e.g., that Advance turn withheld with no Player action committed means the Autopilot AI had nothing more to do this Turn. Campaign completion before the Autopilot limit is reached disengages with campaign ended; reaching the Autopilot limit on the same action takes precedence as limit reached. Autopilot disengages as AI failed when the Autopilot AI reports an error, produces no valid action, or exhausts its configured finite execution budget. That budget prevents indefinitely repeated invalid actions, an Autopilot AI that makes no progress, and one that never requests Advance turn; its exact limits are listed under [TODOs](#todos).

Campaign mutations are serialized. During an Autopilot engagement, the Session controller may read Player API queries, Session status, [Timeline](engine-contract.md#persisted-data) status, and Autopilot status, read and change [Global configuration](engine-contract.md#persisted-data), and disengage Autopilot. All other [Session API](engine-contract.md#api-surfaces) operations, e.g. changing Campaign configuration, Session controller gameplay mutations, and [Developer API](engine-contract.md#api-surfaces) operations are unavailable until disengagement completes. `session.autopilot.disengage(engagementId)` requests disengagement between atomic actions. An action already executing either commits completely or fails without effects. Disengagement never implicitly ends a Turn or undoes earlier Player actions. Failure of the Autopilot AI follows the same boundary rule. A late response from a completed Autopilot engagement cannot change Campaign state. Timeline navigation remains available after disengagement.

Engaging Autopilot writes an [Autosave](saves.md#autosave-kinds), and each Turn the Autopilot AI ends gets an [Autopilot Autosave](saves.md#autosave-kinds) instead of a [Turn-end Autosave](saves.md#autosave-kinds), up to the [Autopilot Autosave limit](saves.md#limits), under [Autosaves](saves.md#autosaves). Through [Autosave navigation](timeline.md#autosave-navigation), the last Turns an Autopilot engagement ended are therefore reversed one Turn at a time, the rest of it as a whole, and the Timeline entries of its last Turn one by one. Completing disengagement writes the [Disengagement Autosave](saves.md#autosave-kinds), holding the [World state](engine-contract.md#player-actions-and-turns) in which the Autopilot engagement ended, under [Autosaves](saves.md#autosaves) in Saves.

# Edge cases and failure behavior

An Autopilot engagement can end with no Player action committed, e.g. under `singleAction` or `turnActions` when the Autopilot AI first requests Advance turn, or when the Session controller disengages before any action commits. It then leaves Campaign state as it was, and it still writes its Autosaves, under [Autosaves](saves.md#autosaves) in Saves.

Autopilot disengagement and failure of the Autopilot AI preserve every Player action. An Autopilot AI that calls an operation outside its access is rejected without changing anything, under [World state integrity](engine-contract.md#world-state-integrity).

Timeline navigation cannot erase what a human has seen. The information the engine itself supplies to an Autopilot AI nevertheless follows [What an Autopilot AI receives](#what-an-autopilot-ai-receives).

# TODOs

- TODO: Choose the exact limits of the finite execution budget of an Autopilot AI.
- TODO: Define how an Autopilot AI becomes available beyond those the [Game build](core-concepts.md#game-build-and-content) offers, e.g. whether the player can register one.
