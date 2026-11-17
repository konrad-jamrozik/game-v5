# World History

| Metadata    | Value                                                                                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | WHIST                                                                                                                                                                      |
| Family      | Foundation                                                                                                                                                                 |
| Audience    | Engine designer, UI designer, AI designer, Implementer                                                                                                                     |
| Owns        | What a Campaign remembers about its past, and for how long.                                                                                                                |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

The game often needs to know not only how things are but how they were, e.g. to chart money over the last 200 [Turns](engine-contract.md#player-actions-and-turns) or
to report what each [Combat](../mechanics/domain-model.md#combat) did last Turn. A past value usually cannot be recomputed from the present, so the [Campaign](core-concepts.md#campaign-and-session)
must keep it.

[World history](campaign-state.md#glossary) is the part of [World state](campaign-state.md#glossary) that does. It keeps the historical facts that rules and queries need, a Turn
series for each value whose past is charted, and a record of every ended Turn, in full for the most recent one and
reduced for the rest; [Player API](engine-contract.md#api-surfaces) returns the present, the most recent Turn report, and earlier Turns through separate
queries. World History builds on [Campaign State](campaign-state.md), which places World history within
World state. Unlike the [Timeline](engine-contract.md#persisted-data), which records only the undo and redo of the current Turn, World history is consulted
by game behavior.

# Glossary

These terms are specific to World History. General terms are in the [Campaign State glossary](campaign-state.md#glossary).

| Term          | Definition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Retained      | Describes model data kept available for rules, [Player API](engine-contract.md#api-surfaces) queries, reference resolution, or restoration. Retained describes availability; [World history](campaign-state.md#glossary) describes data about past [Campaign state](core-concepts.md#campaign-and-session) or events. Retention does not establish mutability or a lifecycle state.                                                                                                                        |
| Retired       | Describes a [Campaign instance](core-concepts.md#campaign-instances) that has left [Current world state](campaign-state.md#glossary) and is kept in World history with every property at its final value for the rest of the [Campaign](core-concepts.md#campaign-and-session). `getCurrentState()` no longer returns it, and `getHistory()` returns it instead. The specification owning each Campaign instance [Type](core-concepts.md#data-modeling) states when its Campaign instances become Retired. |
| Turn series   | Retained data in World history recording one value at stated moments of every [Turn](engine-contract.md#player-actions-and-turns) of the [Campaign](core-concepts.md#campaign-and-session), from campaign creation onward, under [Turn series](#turn-series). The specification owning the value declares it.                                                                                                                                                                                              |
| Turn report   | Retained data in World history describing what one committed Advance turn did, e.g. each Combat it fought and how that Combat went. A Campaign has at most one Turn report: the one of its most recent committed Advance turn, under [Turn report and history](#turn-report-and-history).                                                                                                                                                                                                                  |
| History entry | Retained data in World history describing one ended Turn: a reduced form of its [Turn-start state](engine-contract.md#player-actions-and-turns), of its [Turn-end state](engine-contract.md#player-actions-and-turns), and of the Turn report of the Advance turn that ended it. Reduced means holding only part of that information, to bound what is retained.                                                                                                                                           |

# Historical fact preservation

A past value cannot always be recovered from its current replacement. E.g., a query that needs enemy-1's original
current health must retain that value of 10 or the original inputs needed to reconstruct it, because its current health of 7 does not
replace that historical fact. When a rule or query needs the historical basis, the original inputs or historical
value must be preserved; required historical values must not be overwritten with current calculations. A past
calculation retained as a historical fact is an [Authoritative value](core-concepts.md#value-classification), under
[Authoritative and Derived values](core-concepts.md#authoritative-and-derived-values) in Core Concepts. This does not
require retaining every intermediate calculation or every possible chart. The values that a chart or a comparison
across Turns needs are retained exactly where a specification declares a Turn series, under
[Turn series](#turn-series).

When a [Campaign instance](core-concepts.md#campaign-instances) becomes Retired, data required by rules, queries, or retained
references must remain in World history rather than being deleted. E.g., once enemy-1 is Retired after the Combat of its [Mission](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions),
a retained reference to enemy-1 must still resolve. Retention does not introduce a separate lifecycle state or transition
name or require moving data into a separate storage location. Consuming specifications must declare which lifecycle
changes require retention and which data must remain available. The [Instance ID](campaign-instances.md#glossary) and relationships needed to resolve
retained references must be preserved under [Campaign instance identity](campaign-instances.md#campaign-instance-identity)
and [References](campaign-instances.md#references) in Campaign Instances. An evolving collection can contain immutable
historical records: e.g., adding a [Combat report](../mechanics/domain-model.md#combat) does not permit rewriting an earlier retained Combat report.

# Turn series

A Turn series keeps the past values of one value available for the whole Campaign, so that game behavior and queries
can use them long after the value has changed; e.g., a chart of money over the last 200 Turns. Such past values cannot
be recovered from the current value, so they are retained in World history under
[Historical fact preservation](#historical-fact-preservation).

A Turn series follows these complete rules:

- **Declared by the owner of the value:** A value has a Turn series only when the specification owning that value
  declares one. The declaration states the value and the moments of each Turn at which it is recorded; e.g., at the
  start of each Turn and at the end of each Turn. No other specification declares a Turn series for that value.
- **One recorded value for each moment:** For every Turn of the Campaign and every declared moment of it that the
  Campaign has reached, the Turn series holds exactly one recorded value: the value as it was at that moment.
- **Kept from campaign creation:** A Turn series starts at campaign creation and is never shortened. It has no limit on
  the number of Turns it covers, and its recorded values are never removed, merged, or replaced by a summary.
- **Recorded values are historical facts:** A recorded value is an Authoritative value, including when the value it
  records is a [Derived value](core-concepts.md#value-classification). It is never recomputed from current Campaign state.
- **Moments within the current Turn:** A declaration may name a moment that is not yet final while the Turn is in
  progress; e.g., the number of upgrades purchased during the Turn so far. The recorded value for the current Turn is
  then the value in the current [Committed state](engine-contract.md#player-actions-and-turns), and it becomes final when the Turn ends.
- **Part of Campaign state:** A Turn series is World history, so every [Campaign save](engine-contract.md#persisted-data) holds it in full, and restoration
  restores it together with the rest of Campaign state. After undo, redo, or load, each Turn series holds exactly the
  recorded values of the restored Committed state.

A Turn series is [Player-visible information](engine-contract.md#api-surfaces) exactly when the specification declaring it says so. Player API returns a
Player-visible Turn series in full: every recorded value from campaign creation up to the current Committed state,
each with the Turn and the recorded moment it belongs to. The result is the same for the [Session controller](engine-contract.md#principals-and-access) and an
[Autopilot AI](engine-contract.md#principals-and-access), and after undo, redo, or load it holds the recorded values of the restored Committed state. A
specification describing a chart names the Turn series the chart shows and declares none itself.

# Turn report and history

The Turn report and the History entries keep what happened in a Campaign: the Turn report in full for the most recent
committed Advance turn, and one reduced History entry for every ended Turn. They follow these complete rules:

- **Written only by Advance turn:** The Advance turn that ends Turn t replaces the Turn report with its own and adds
  the History entry for Turn t. No other [Player action](engine-contract.md#player-actions-and-turns) changes the Turn report or any History entry. Before the first
  committed Advance turn of a Campaign, there is no Turn report and no History entry.
- **Never rewritten:** A History entry is never rewritten once added, and a Turn report is never rewritten while it is
  the most recent one.
- **Agreement:** The Turn report part of the latest History entry is exactly the reduced form of the Turn report, so
  the two never disagree.
- **Reduction:** Information that the Turn report holds and its History entry does not is required, under
  [Historical fact preservation](#historical-fact-preservation), only while that Turn report is the most recent one.
- **Part of Campaign state:** The Turn report and every History entry are World history, so every Campaign save holds
  them, and restoration restores them together with the rest of Campaign state. After undo, redo, or load, they are
  exactly those of the restored Committed state.
- **Declared by the owner of each value:** What the Turn report and each History entry hold of a value is stated by
  the specification owning that value.

# Current state, Turn report, and history

Player API returns what is true now and what happened earlier through three queries. The following table is complete
for them.

| Query                              | Returns                                                                                                                                                                         | Detail                                                           |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `player.queries.getCurrentState()` | The Player-visible information of [Current world state](campaign-state.md#glossary) and of [Campaign configuration](campaign-state.md#glossary) at the current Committed state. | Full                                                             |
| `player.queries.getTurnReport()`   | The Player-visible information of the [Turn report](#glossary), or none before the first committed Advance turn of the Campaign.                                                | Full                                                             |
| `player.queries.getHistory()`      | The Player-visible information of every [History entry](#glossary), in Turn order, from Turn 1, and of every [Retired](#glossary) Campaign instance.                            | Reduced for History entries; full for Retired Campaign instances |

`getCurrentState()` returns nothing that is retained only in [World history](campaign-state.md#glossary). E.g., a
Mission whose Combat has been fought is Retired, so the Combat report of its Combat is returned by
`getTurnReport()` after the Advance turn that fought it, and in reduced form by `getHistory()`, but not by
`getCurrentState()`. A Retired Campaign instance is returned by `getHistory()` with every Player-visible property at its
final value, e.g. a Killed [Agent](../mechanics/domain-model.md#agency-and-agents) with its current health of 0, so that every Player-visible value has exactly
one query that returns it.

Only Advance turn changes the Turn report and the History entries, under
[Turn report and history](#turn-report-and-history), so Player actions, undo, and
redo within a Turn change only what `getCurrentState()` returns. Undo, redo, and load restore what all three queries
return, and replay reproduces it, under [Derived value consistency](engine-contract.md#derived-value-consistency) in Engine Contract.

Whether the engine stores each value these queries return, or computes it from other Campaign state when asked, is the
Implementer's choice.

![What each query returns during Turn 8, after its second Player action: a reduced History entry for Turns 6 and 7, the full Turn report of the Advance turn that ended Turn 7, and the current Committed state](../../../images/diagrams/query-layers-during-turn.svg)

![What advanceTurn() changes when it ends Turn 8: Turn 8 gets a History entry, the Turn report of Turn 7 remains only in reduced form, the new Turn report is returned in full, and the current state is the Turn-start state of Turn 9](../../../images/diagrams/query-layers-after-advance.svg)

# Acceptance examples

- **A Turn series covers the whole Campaign:** A specification declares a Turn series of money at the end of each
  Turn. In Turn 205 the Turn series holds 204 recorded values, one for each of Turn 1 to Turn 204, and each equals the
  money the Campaign had when that Turn ended. Saving and loading the Campaign keeps all 204
  ([Turn series](#turn-series)).
- **Undo restores a Turn series:** A specification declares a Turn series of the upgrades purchased during each Turn.
  In one Turn the player purchases 7 upgrades, and the recorded value for that Turn is 7. The player undoes 2 of the
  purchases: the recorded value is 5, and the recorded values of earlier Turns are unchanged. Redoing both purchases
  makes it 7 again ([Turn series](#turn-series)).
- **Turn report and history:** During Turn 8, after two Player actions, `getTurnReport()` returns the Turn report of
  the Advance turn that ended Turn 7, and `getHistory()` returns the History entries of Turns 1 to 7. Undoing one of
  the actions changes neither answer. Advance turn then makes `getTurnReport()` return the Turn report of the Advance
  turn that ended Turn 8, and `getHistory()` return the History entries of Turns 1 to 8, whose last entry holds the
  reduced form of that new Turn report. Saving and loading the Campaign changes neither answer
  ([Current state, Turn report, and history](#current-state-turn-report-and-history)).
