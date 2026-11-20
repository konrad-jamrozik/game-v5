# History and Turn Report

| Metadata | Value |
| --- | --- |
| Spec ID | WHIST |
| Family | Foundation |
| Audience | Engine designer, UI designer, AI designer, Implementer |
| Owns | What a Campaign remembers about its past, and for how long, including the Turn report and what Player API returns of the past. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

The game often needs to know not only how things are but how they were, e.g. to chart money over the last 200 [Turns](engine-contract.md#player-actions-and-turns) or to report what each [Combat](../mechanics/domain-model.md#combat) did last Turn. A past value usually cannot be recomputed from the present, so the [Campaign](core-concepts.md#campaign-and-session) must keep it.

What a Turn leaves behind is written once, when Advance turn ends it, into the [History](campaign-state.md#glossary): a record of every ended Turn, reduced to bound its size, and a Turn series for each value whose past is charted. The most recent Turn is also kept in full, as the Turn report. Nothing within a Turn writes there, so undo and redo never reach it; the current Turn is shown in the same reduced form, derived from the [Timeline](engine-contract.md#persisted-data). History and Turn Report builds on [Campaign State](campaign-state.md), which places the History and the Turn report in Campaign state and keeps whatever can change during a Turn in the World state instead.

# Glossary

These terms are specific to History and Turn Report. General terms are in the [Campaign State glossary](campaign-state.md#glossary).

| Term | Definition |
| --- | --- |
| Retained | Describes model data kept available for the [Game rules](core-concepts.md#game-build-and-content), [Player API](engine-contract.md#api-surfaces) queries, or reference resolution. Retained describes availability, not where the data is kept: it may be in the [History](campaign-state.md#glossary) or in a [World state](engine-contract.md#player-actions-and-turns), e.g. a Retired Campaign instance. Retention does not establish mutability or a lifecycle state. |
| Retired | Describes a [Campaign instance](core-concepts.md#campaign-instances) that has left play and is therefore in the [Retired world state](campaign-state.md#glossary), where it stays, with every property at its final value, in every later [World state](engine-contract.md#player-actions-and-turns). `getCurrentLiveWorldState()` no longer returns it and `getCurrentRetiredWorldState()` does; it never becomes part of the History, which `getHistory()` returns. The specification owning each Campaign instance [Type](core-concepts.md#data-modeling) states when its Campaign instances become Retired. |
| Turn series | Retained data recording one value at stated moments of every [Turn](engine-contract.md#player-actions-and-turns) of the [Campaign](core-concepts.md#campaign-and-session), from campaign creation onward, kept in the History for every ended Turn, under [Turn series](#turn-series). The specification owning the value declares it. |
| History entry | Retained data in the History describing one ended Turn: a reduced form of its [Turn-start state](engine-contract.md#player-actions-and-turns), of its [Turn-end state](engine-contract.md#player-actions-and-turns), and of the [Turn report](campaign-state.md#glossary) of the Advance turn that ended it, together with its Action record in full. Reduced means holding only part of that information, to bound what is retained. |
| Open History entry | What the History entry of the current Turn would hold if Advance turn ended it at the [Current world state](engine-contract.md#player-actions-and-turns), without the Turn report part, derived from the [Timeline](engine-contract.md#persisted-data) under [Open History entry](#open-history-entry). It is neither a History entry nor part of the History, and it changes with every [Player action](engine-contract.md#player-actions-and-turns), undo, and redo. |
| Action record | The list of the [Player actions](engine-contract.md#player-actions-and-turns) of one Turn other than Advance turn, in the order they were committed, that a History entry or the Open History entry holds, under [Action record](#action-record). |

# Historical fact preservation

A past value cannot always be recovered from its current replacement. E.g., a query that needs enemy-1's original current health must retain that value of 10 or the original inputs needed to reconstruct it, because its current health of 7 does not replace that historical fact. When the Game rules need the historical basis, the original inputs or historical value must be preserved; required historical values must not be overwritten with current calculations. A past calculation retained as a historical fact is an [Authoritative value](core-concepts.md#value-classification), under [Authoritative and Derived values](core-concepts.md#authoritative-and-derived-values) in Core Concepts. This does not require retaining every intermediate calculation or every possible chart. The values that a chart or a comparison across Turns needs are retained exactly where a specification declares a Turn series, under [Turn series](#turn-series).

When a Campaign instance becomes Retired, data required by the Game rules, queries, or retained references stays in the Retired world state rather than being deleted, under [World state and History](campaign-state.md#world-state-and-history) in Campaign State. E.g., once enemy-1 is Retired after the Combat of its [Mission](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), a retained reference to enemy-1 must still resolve. Retention does not introduce a separate lifecycle state or transition name. Consuming specifications must declare which lifecycle changes require retention and which data must remain available. The [Instance ID](campaign-instances.md#glossary) and relationships needed to resolve retained references must be preserved under [Campaign instance identity](campaign-instances.md#campaign-instance-identity) and [References](campaign-instances.md#references) in Campaign Instances. An evolving collection can contain immutable historical records: e.g., adding a [Combat report](../mechanics/domain-model.md#combat) does not permit rewriting an earlier retained Combat report.

# Turn series

A Turn series keeps the past values of one value available for the whole Campaign, so that the Game rules and queries can use them long after the value has changed; e.g., a chart of money over the last 200 Turns. Such past values cannot be recovered from the current value, so they are retained in the History under [Historical fact preservation](#historical-fact-preservation).

A Turn series follows these complete rules:

- **Declared by the owner of the value:** A value has a Turn series only when the specification owning that value declares one. The declaration states the value and the moments of each Turn at which it is recorded; e.g., at the start of each Turn and at the end of each Turn. No other specification declares a Turn series for that value.
- **One recorded value for each moment:** For every Turn of the Campaign and every declared moment of it that the Campaign has reached, the Turn series holds exactly one recorded value: the value as it was at that moment.
- **Kept from campaign creation:** A Turn series starts at campaign creation and is never shortened. It has no limit on the number of Turns it covers, and its recorded values are never removed, merged, or replaced by a summary.
- **Recorded values are historical facts:** A recorded value is an Authoritative value, including when the value it records is a [Derived value](core-concepts.md#value-classification). It is never recomputed from current [Campaign state](core-concepts.md#campaign-and-session).
- **Ended Turns in the History:** The History holds the recorded values of every ended Turn. Only the Advance turn that ends a Turn writes them, so undo and redo within a Turn never change them, and every [Campaign save](engine-contract.md#persisted-data) holds them in full.
- **The current Turn from the Timeline:** The recorded values of the current Turn are not in the History. Each is the value at its moment as the Timeline holds it: in the Turn-start state for a moment at the start of the Turn, and in the Current world state for a moment that is not yet final while the Turn is in progress, e.g. the number of upgrades purchased during the Turn so far. A moment at the end of the Turn is reached only when the Advance turn that ends the Turn commits, so the current Turn has no recorded value for it; e.g., during Turn 205 a Turn series recorded at the end of each Turn holds 204 values. The recorded values of the current Turn therefore follow every Player action, undo, and redo, and the Advance turn that ends the Turn writes them, final, into the History.

A Turn series is [Player-visible information](engine-contract.md#api-surfaces) exactly when the specification declaring it says so. Player API returns a Player-visible Turn series in full: every recorded value from campaign creation up to the Current world state, each with the Turn and the recorded moment it belongs to. The result is the same for the [Session controller](engine-contract.md#principals-and-access) and an [Autopilot AI](engine-contract.md#principals-and-access). A specification describing a chart names the Turn series the chart shows and declares none itself.

# Turn report and history

The Turn report and the History entries keep what happened in a Campaign: the Turn report in full for the most recent committed Advance turn, and one reduced History entry for every ended Turn. They follow these complete rules:

- **Written only by Advance turn:** The Advance turn that ends Turn t replaces the Turn report with its own and adds the History entry for Turn t. Nothing else changes the Turn report or the History; e.g., no other [Player action](engine-contract.md#player-actions-and-turns), no undo or redo within a Turn, and no change of [Campaign configuration](campaign-state.md#glossary). Before the first committed Advance turn of a Campaign, there is no Turn report and no History entry.
- **Never rewritten:** A History entry is never rewritten once added, and a Turn report is never rewritten while it is the most recent one.
- **Agreement:** The Turn report part of the latest History entry is exactly the reduced form of the Turn report, so the two never disagree.
- **Reduction:** Information that the Turn report holds and its History entry does not is required, under [Historical fact preservation](#historical-fact-preservation), only while that Turn report is the most recent one.
- **Part of Campaign state:** The Turn report and every History entry are Campaign state, so every Campaign save holds them. A load gives exactly those of the Campaign save it loads, including a load by [Autosave navigation](timeline.md#autosave-navigation).
- **Declared by the owner of each value:** What the Turn report and each History entry hold of a value is stated by the specification owning that value. The Action record of a History entry is stated under [Action record](#action-record).

## Action record

The Action record keeps what the player did in each Turn, which neither the Turn-start state, the Turn-end state, nor the Turn report can tell, so that a past Turn can show both its decisions and their outcome. It follows these complete rules:

- **What it lists:** The Action record of Turn t lists the Player actions of the [Timeline entries](timeline.md#glossary) of Turn t up to the [Timeline pointer](engine-contract.md#persisted-data), in the order they were committed, i.e. every Player action of Turn t other than Advance turn that was not undone, whichever [Principal](engine-contract.md#principals-and-access) made it. A [Player cheat action](engine-contract.md#player-actions-and-turns) is listed like any other Player action. A rejected action, an action with no effect, a query, and a change of [Campaign configuration](campaign-state.md#glossary) are not Player actions and are not listed.
- **What each item holds:** Each item holds the name of the operation, e.g. `hireAgent`, the arguments it was called with, e.g. the Instance IDs of a `deployAgents`, and any further value that the specification owning that value declares for every item. Each value is a historical fact, under [Historical fact preservation](#historical-fact-preservation), and each Instance ID it holds is a retained reference that still resolves once its Campaign instance is Retired.
- **Read off the Timeline during the Turn:** The Action record of the current Turn is not stored. It is read off the Timeline, from its start up to the Timeline pointer, and each further value of an item is derived from that [Timeline entry](timeline.md#glossary)'s Player action and the World states before and after it. Every Player action other than Advance turn, every undo, and every redo therefore changes it by itself. The Advance turn that ends Turn t writes the Action record of Turn t, as it is then, into the History entry of Turn t. The Action record of the current Turn is the Action record of the Open History entry.
- **Player-visible:** The Action record of every History entry and of the Open History entry is [Player-visible information](engine-contract.md#api-surfaces), and `getHistory()` returns each in full.

## Open History entry

The Open History entry shows the current Turn alongside the ended ones, as it would end if Advance turn were committed now, so that the player can compare what they did so far in this Turn with earlier Turns. It follows these complete rules:

- **What it holds:** For the current Turn t, it holds what the History entry of Turn t would hold of the Turn-start state of Turn t, the same reduced form of the Current world state in place of the Turn-end state of Turn t, and the Action record of Turn t in full. It holds no Turn report part, because no Advance turn has ended Turn t; e.g., it holds no Combat of Turn t.
- **Derived from the Timeline:** The Open History entry is not stored and is not part of the History. It is a [Derived value](core-concepts.md#value-classification) of the Timeline: of its Turn-start state, the Player actions of its Timeline entries up to the Timeline pointer, and the Current world state. Every Player action other than Advance turn, every undo, and every redo therefore changes it by itself; e.g., undoing a `hireAgent` removes its item from the Action record and the hired Agent from the Turn-end part, and redoing it puts both back. It never changes a History entry.
- **Becomes a History entry:** The Advance turn that ends Turn t writes the History entry of Turn t from the same data: the Open History entry as it was at the Turn-end state, together with the reduced form of the new Turn report. The Open History entry of Turn t + 1 then starts with an empty Action record. Before the first committed Advance turn of a Campaign, the Open History entry of Turn 1 is the only one `getHistory()` returns.

# Current world state, Turn report, and history

Player API returns what is true now and what happened earlier through five queries, each named after the one part of [Campaign state](core-concepts.md#campaign-and-session) it returns. The following table is complete for them.

| Query | Returns | Detail |
| --- | --- | --- |
| `player.queries.getCurrentLiveWorldState()` | The Player-visible information of the [Live world state](campaign-state.md#glossary) of the Current world state: every Campaign instance still in play, and every other value of the world. | Full |
| `player.queries.getCurrentRetiredWorldState()` | The Player-visible information of the [Retired world state](campaign-state.md#glossary) of the Current world state: every [Retired](#glossary) Campaign instance, and every fact recorded once for the rest of the Campaign, e.g. that something was discovered. | Full |
| `player.queries.getCampaignConfiguration()` | The Player-visible information of the [Campaign configuration](campaign-state.md#glossary). | Full |
| `player.queries.getTurnReport()` | The Player-visible information of the [Turn report](campaign-state.md#glossary), or none in the first Turn of the Campaign. | Full |
| `player.queries.getHistory()` | The Player-visible information of the [History](campaign-state.md#glossary): every [History entry](#glossary), in Turn order, from Turn 1, followed by the [Open History entry](#glossary). | Reduced |

Every Player-visible value has exactly one query that returns it, the query of the part of Campaign state that holds it. "Current" in the first two names is the [Current world state](engine-contract.md#player-actions-and-turns), the World state the Timeline pointer is on, so after an undo they return the earlier World state. A Retired Campaign instance is part of the World state, never of the History, under [Campaign State](campaign-state.md), so `getCurrentRetiredWorldState()` returns it with every Player-visible property at its final value, e.g. a Killed [Agent](../mechanics/domain-model.md#agency-and-agents) with its current health of 0; a fact of the Retired world state that is not a Campaign instance still holds now, and is returned there too. A Player-visible [Derived value](core-concepts.md#value-classification) of a Campaign instance or fact, e.g. one calculated from the [Game build](core-concepts.md#game-build-and-content) alone, is returned with that Campaign instance or fact. A client that needs both parts of the Current world state, e.g. a Campaign instance in play together with a Retired one it references, calls both queries. E.g., a Mission whose Combat has been fought is Retired, so `getCurrentRetiredWorldState()` returns the Mission, while the Combat report of its Combat is returned by `getTurnReport()` after the Advance turn that fought it and in reduced form by `getHistory()`.

Only Advance turn changes the Turn report and the History, under [Turn report and history](#turn-report-and-history), so Player actions, undo, and redo within a Turn change only what the two World state queries return, and what `getHistory()` returns of the Open History entry. After undo, redo, or load, all five queries return what the current Campaign state implies, and replay reproduces it, under [Derived value consistency](engine-contract.md#derived-value-consistency) in Engine Contract.

Whether the engine stores each value these queries return, or computes it from other Campaign state when asked, is the Implementer's choice.

![What each query returns during Turn 8, after its second Player action: a reduced History entry for Turns 6 and 7, the Open History entry of Turn 8 derived from the Timeline up to the Current world state, the full Turn report of the Advance turn that ended Turn 7, and the Current world state](../../../images/diagrams/query-layers-during-turn.svg)

![What advanceTurn() changes when it ends Turn 8: the Open History entry of Turn 8 becomes its History entry, the Turn report of Turn 7 remains only in reduced form, the new Turn report is returned in full, and the Current world state and the empty Open History entry are those of the Turn-start state of Turn 9](../../../images/diagrams/query-layers-after-advance.svg)
