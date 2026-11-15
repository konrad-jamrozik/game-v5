# World History

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | WHIST                                                          |
| Family      | Foundation                                                     |
| Audience    | Engine designer, UI designer, AI designer, Implementer         |
| Owns        | What a Campaign remembers about its past, and for how long.    |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Overview

The game often needs to know not only how things are but how they were, e.g. to chart money over the last 200 turns or
to report what each Combat did last turn. A past value usually cannot be recomputed from the present, so the Campaign
must keep it.

World history is the part of World state that does. It keeps the historical facts that rules and queries need, a Turn
series for each value whose past is charted, and a record of every ended Turn, in full for the most recent one and
reduced for the rest. World History refines [Campaign State](campaign-state.md), which places World history within
World state. Unlike the Timeline, which records only the undo and redo of the current turn, World history is consulted
by game behavior.

# Relationships

- Uses [Campaign Instances](./campaign-instances.md)
- Uses [Core Concepts](./core-concepts.md)
- Uses [Engine Contract](./engine-contract.md)
- Refines [Campaign State](./campaign-state.md)
- Used by [Domain Model](../mechanics/domain-model.md)

# Glossary

These terms are specific to World History. General terms are in the [Campaign State glossary](campaign-state.md#glossary).

| Term          | Definition                                                                                                                                                                                                                                                                                |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Retained      | Describes model data kept available for rules, Player API queries, reference resolution, or restoration. Retained describes availability; World history describes data about past Campaign state or events. Retention does not establish mutability or a lifecycle state.                 |
| Turn series   | Retained data in World history recording one value at stated moments of every turn of the Campaign, from campaign creation onward, under [Turn series](#turn-series). The specification owning the value declares it.                                                                     |
| Turn report   | Retained data in World history describing what one committed Advance turn did, e.g. each Combat it fought and how that Combat went. A Campaign has at most one Turn report: the one of its most recent committed Advance turn, under [Turn report and history](#turn-report-and-history). |
| History entry | Retained data in World history describing one ended Turn: a reduced form of its Turn-start state, of its Turn-end state, and of the Turn report of the Advance turn that ended it. Reduced means holding only part of that information, to bound what is retained.                        |

# Historical fact preservation

A past value cannot always be recovered from its current replacement. E.g., a query that needs enemy_1's original
current health must retain that value of 10 or the original inputs needed to reconstruct it. Current health of 7 is not a
replacement for that historical fact. When a rule or query needs the historical basis, the original inputs or historical
value must be preserved; required historical values must not be overwritten with current calculations. A past
calculation retained as a historical fact is an Authoritative value, under
[Authoritative and Derived values](core-concepts.md#authoritative-and-derived-values) in Core Concepts. This does not
require retaining every intermediate calculation or every possible chart. The values that a chart or a comparison
across turns needs are retained exactly where a specification declares a Turn series, under
[Turn series](#turn-series).

When a Campaign instance no longer participates in current gameplay, data required by rules, queries, or retained
references must remain in World history rather than being deleted. E.g., if enemy_1 no longer participates in a Mission,
a retained reference to enemy_1 must still resolve. Retention does not introduce a separate lifecycle state or transition
name or require moving data into a separate storage location. Consuming specifications must declare which lifecycle
changes require retention and which data must remain available. The Instance ID and relationships needed to resolve
retained references must be preserved under [Campaign instance identity](campaign-instances.md#campaign-instance-identity)
and [References](campaign-instances.md#references) in Campaign Instances. An evolving collection can contain immutable
historical records: e.g., adding a Combat report does not permit rewriting an earlier retained Combat report.

# Turn series

A Turn series keeps the past values of one value available for the whole Campaign, so that game behavior and queries
can use them long after the value has changed; e.g., a chart of money over the last 200 turns. Such past values cannot
be recovered from the current value, so they are retained in World history under
[Historical fact preservation](#historical-fact-preservation).

A Turn series follows these complete rules:

- **Declared by the owner of the value:** A value has a Turn series only when the specification owning that value
  declares one. The declaration states the value and the moments of each turn at which it is recorded; e.g., at the
  start of each turn and at the end of each turn. No other specification declares a Turn series for that value.
- **One recorded value for each moment:** For every turn of the Campaign and every declared moment of it that the
  Campaign has reached, the Turn series holds exactly one recorded value: the value as it was at that moment.
- **Kept from campaign creation:** A Turn series starts at campaign creation and is never shortened. It has no limit on
  the number of turns it covers, and its recorded values are never removed, merged, or replaced by a summary.
- **Recorded values are historical facts:** A recorded value is an Authoritative value, including when the value it
  records is a Derived value. It is never recomputed from current Campaign state.
- **Moments within the current turn:** A declaration may name a moment that is not yet final while the turn is in
  progress; e.g., the number of upgrades purchased during the turn so far. The recorded value for the current turn is
  then the value in the current Committed state, and it becomes final when the turn ends.
- **Part of Campaign state:** A Turn series is World history, so every Campaign save holds it in full, and restoration
  restores it together with the rest of Campaign state. After undo, redo, or load, each Turn series holds exactly the
  recorded values of the restored Committed state.

A Turn series is Player-visible information exactly when the specification declaring it says so. Player API returns a
Player-visible Turn series in full: every recorded value from campaign creation up to the current Committed state,
each with the turn and the recorded moment it belongs to. The result is the same for the Session controller and an
Autopilot AI, and after undo, redo, or load it holds the recorded values of the restored Committed state. A
specification describing a chart names the Turn series the chart shows and declares none itself.

# Turn report and history

The Turn report and the History entries keep what happened in a Campaign: the Turn report in full for the most recent
committed Advance turn, and one reduced History entry for every ended Turn. They follow these complete rules:

- **Written only by Advance turn:** The Advance turn that ends Turn t replaces the Turn report with its own and adds
  the History entry for Turn t. No other Player action changes the Turn report or any History entry. Before the first
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

How Player API returns the Turn report and the History entries is stated under
[Current state, Turn report, and history](engine-contract.md#current-state-turn-report-and-history) in Engine Contract.

# Acceptance examples

- **A Turn series covers the whole Campaign:** A specification declares a Turn series of money at the end of each
  turn. In turn 205 the Turn series holds 204 recorded values, one for each of turn 1 to turn 204, and each equals the
  money the Campaign had when that turn ended. Saving and loading the Campaign keeps all 204
  ([Turn series](#turn-series)).
- **Undo restores a Turn series:** A specification declares a Turn series of the upgrades purchased during each turn.
  In one turn the player purchases 7 upgrades, and the recorded value for that turn is 7. The player undoes 2 of the
  purchases: the recorded value is 5, and the recorded values of earlier turns are unchanged. Redoing both purchases
  makes it 7 again ([Turn series](#turn-series)).
