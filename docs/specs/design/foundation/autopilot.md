# Autopilot

| Metadata | Value |
| --- | --- |
| Spec ID | AUTO |
| Family | Foundation |
| Audience | Engine designer, UI designer, AI designer, Implementer |
| Owns | Autopilot limits, what an Autopilot AI receives, and Autopilot engagement lifecycle. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

Autopilot lets the player hand play over to an AI for a while and then take it back, e.g. to let an [Autopilot AI](engine-contract.md#principals-and-access) play out the next few [Turns](engine-contract.md#player-actions-and-turns). During each [Autopilot engagement](engine-contract.md#autopilot), the Autopilot AI plays the [Current campaign](core-concepts.md#campaign-and-session) through [Player API](engine-contract.md#api-surfaces) in place of the [Session controller](engine-contract.md#principals-and-access).

The guiding principle is that an Autopilot AI plays as an ordinary player would, and no further. It receives only [Player-visible information](engine-contract.md#api-surfaces), and it never learns when its Autopilot engagement will end. The Session controller fixes that end in advance as an Autopilot limit, i.e. one [Player action](engine-contract.md#player-actions-and-turns), the Player actions of the current Turn, or a number of Turn advancements, and can disengage [Autopilot](engine-contract.md#autopilot) sooner. When the Autopilot limit leaves the end of the Turn to the player, the engine withholds the Advance turn the Autopilot AI requests and hands play back. Nothing the Autopilot AI plans or observes outlives its Autopilot engagement: each one starts afresh from what the player can see of the [Campaign](core-concepts.md#campaign-and-session).

# Glossary

| Term | Definition | Prohibited synonyms |
| --- | --- | --- |
| Autopilot limit | The bound on an [Autopilot engagement](engine-contract.md#autopilot), fixed when [Autopilot](engine-contract.md#autopilot) is engaged: one [Player action](engine-contract.md#player-actions-and-turns) other than Advance turn, the Player actions of the current [Turn](engine-contract.md#player-actions-and-turns), or a number of Turn advancements. | Delegation scope |
| Autopilot engagement ID | The [Independent identifier](determinism-and-randomness.md#glossary) identifying one Autopilot engagement, assigned when Autopilot is engaged. |  |
| Autopilot progress | The number of Player actions other than Advance turn and the number of Advance turn actions that have committed in the current Autopilot engagement, reported to the [Session controller](engine-contract.md#principals-and-access). The [Autopilot AI](engine-contract.md#principals-and-access) does not receive it. |  |

# Available Autopilot AIs

A player chooses which AI plays in their place, so the engine reports the Autopilot AIs it can engage. `session.autopilot.listAutopilotAis()` reports every Autopilot AI that is available, i.e. that `session.autopilot.engage(autopilotAiId, limit)` would accept at the time of the call. For each one it reports at least:

- the `autopilotAiId` that `engage` accepts;
- a name an interface can show; e.g., a user interface offers these names for the player to choose from.

The list may be empty. An Autopilot AI may become unavailable after it was listed, e.g. a remote service stops responding; `engage` then rejects it.

# Autopilot limits

`session.autopilot.engage(autopilotAiId, limit)` engages Autopilot for the [Current campaign](core-concepts.md#campaign-and-session). At most one Autopilot engagement may be active in a [Session](core-concepts.md#campaign-and-session).

An Autopilot AI ends each Turn it plays by requesting Advance turn once it has no other Player action to make, as a player does; it [does not know its Autopilot limit](#what-an-autopilot-ai-receives). Each Autopilot limit therefore states whether the engine commits that Advance turn or withholds it.

| Autopilot limit | Input | A requested Advance turn | The Autopilot engagement ends normally when |
| --- | --- | --- | --- |
| `singleAction` | None | Is withheld | One [Player API](engine-contract.md#api-surfaces) action other than Advance turn commits, with the disengagement reason limit reached; or the Autopilot AI requests Advance turn first, with the disengagement reason Advance turn withheld and no Player action committed. |
| `turnActions` | None | Is withheld | The Autopilot AI requests Advance turn, with the disengagement reason Advance turn withheld, after any number of Player actions, including none. |
| `turnAdvancements` | A whole number `count` of at least 1 | Commits | The `count`-th Advance turn commits, with the disengagement reason limit reached. |

A withheld Advance turn is not committed: it changes no [Campaign state](core-concepts.md#campaign-and-session), and it is neither a Player action nor a rejected action. An Advance turn request that the engine would reject is rejected as any other action is and withholds nothing. Autopilot disengages immediately when its Autopilot limit is reached or an Advance turn is withheld; another mutation through that Autopilot engagement is rejected.

# What an Autopilot engagement holds

An active Autopilot engagement is what a Session [holds](engine-contract.md#data-ownership) from a successful `session.autopilot.engage(autopilotAiId, limit)` until that Autopilot engagement ends: its Autopilot engagement ID, its Autopilot AI, its Autopilot limit, and its Autopilot progress.

The engine assigns the Autopilot engagement ID and `engage` returns it; the Session controller passes it as `engagementId` to `session.autopilot.getStatus` and `session.autopilot.disengage`. The Autopilot limit never changes during the Autopilot engagement. An active Autopilot engagement holds nothing else; e.g., it holds no wall-clock duration, and nothing the Autopilot AI has planned or observed.

# What an Autopilot AI receives

An Autopilot AI plays with what an ordinary player has: it makes [Player API](engine-contract.md#api-hierarchy) queries and actions, and the engine supplies it nothing beyond [Player-visible information](engine-contract.md#api-surfaces), e.g. no [Developer API](engine-contract.md#api-surfaces) result and no Campaign save.

The Autopilot AI does not receive its Autopilot limit or Autopilot progress, so it plays for the [Campaign](core-concepts.md#campaign-and-session) as a whole rather than toward the end of the Autopilot engagement. The Autopilot AI has no operation that ends an Autopilot engagement: the engine judges its requests against the Autopilot limit it does not know, and the Autopilot engagement ends only for a [disengagement reason](#autopilot-lifecycle-and-concurrency).

Each Autopilot engagement starts with only Player-visible information. Nothing else carries over into it, e.g. nothing from an earlier Autopilot engagement or from an Undone action.

# Autopilot lifecycle and concurrency

An Autopilot engagement ends for one disengagement reason, and until then the Session controller can watch it and stop it but cannot play alongside it.

`session.autopilot.getStatus(engagementId)` reports the Autopilot limit, Autopilot progress, and execution status to the Session controller. The disengagement reasons are [limit reached and Advance turn withheld](#autopilot-limits), disengaged by controller, campaign ended, and AI failed. A disengagement result identifies the reason and Autopilot progress, so the Session controller can tell, e.g., that Advance turn withheld with no Player action committed means the Autopilot AI had nothing more to do this Turn. Campaign completion before the Autopilot limit is reached disengages with campaign ended; reaching the Autopilot limit on the same action takes precedence as limit reached. Autopilot disengages as AI failed when the Autopilot AI reports an error, produces no valid action, or exhausts its configured finite execution budget. That budget prevents indefinitely repeated invalid actions, an Autopilot AI that makes no progress, and one that never requests Advance turn.

Campaign mutations are serialized. During an Autopilot engagement, the Session controller may read Player API queries, Session status, [Timeline](engine-contract.md#persisted-data) status, and Autopilot status, read and change [Global configuration](engine-contract.md#persisted-data), and disengage Autopilot. Every other [Session API](engine-contract.md#api-surfaces) operation, e.g. changing Campaign configuration, every gameplay mutation of the Session controller, and every [Developer API](engine-contract.md#api-surfaces) operation is unavailable until disengagement completes. `session.autopilot.disengage(engagementId)` requests disengagement between atomic actions. Disengagement never implicitly ends a Turn or undoes earlier Player actions. Failure of the Autopilot AI follows the same boundary rule. A late response from a completed Autopilot engagement cannot change Campaign state.

# TODOs

- TODO: Choose the exact limits of the [finite execution budget](#autopilot-lifecycle-and-concurrency) of an Autopilot AI.
- TODO: Define how an Autopilot AI becomes available beyond those the [Game build](core-concepts.md#game-build-and-content) offers, e.g. whether the player can register one.
