# Panic and Endings

| Metadata | Value |
| --- | --- |
| Spec ID | ENDING |
| Family | Mechanics |
| Audience | Engine designer, Content designer, AI designer, Implementer |
| Owns | Panic and how this Turn's changes to it are applied, the conditions that end a Campaign in Victory or Defeat, and what remains possible after a Campaign ending. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

The [Agency](domain-model.md#agency-and-agents) wins by eliminating every [Faction](domain-model.md#factions), and it loses when the public's alarm or its own debts get out of hand. [Panic](#glossary) measures that alarm: one [Campaign](../foundation/core-concepts.md#campaign-and-session)-wide value from 0% to 100% that belongs directly to [Campaign state](../foundation/core-concepts.md#campaign-and-session), under [Campaign and Agency](domain-model.md#campaign-and-agency). It can rise, e.g. when a [Response Mission site](domain-model.md#leads-investigations-mission-sites-and-missions) is ignored, and fall, e.g. after a Won [Initiative Mission](domain-model.md#leads-investigations-mission-sites-and-missions).

Within an Advance turn, [Panic](domain-model.md#campaign-standing) does not move with each event. Every Panic increase and Panic reduction joins the Pending panic change, and the Panic step applies their sum once, clamped to the range 0 to 100, so the order of events never changes the result. Right after it, the Ending check step decides whether the Campaign has a [Campaign ending](domain-model.md#campaign-standing): Victory when every Faction is [Eliminated](factions.md#glossary), and otherwise Defeat when Panic reaches the Panic limit or the Agency's money is below zero. A Campaign ending is final: every [Player action](../foundation/engine-contract.md#player-actions-and-turns) is then rejected, while every query keeps answering.

# Glossary

These terms are specific to [Panic](domain-model.md#campaign-standing) and [Campaign endings](domain-model.md#campaign-standing). Panic, Campaign ending, and other general terms are in the [Domain Model glossary](domain-model.md#glossary).

| Term | Definition |
| --- | --- |
| Panic limit | The Panic at which the [Campaign](../foundation/core-concepts.md#campaign-and-session) is lost: the value of `defeat_at_panic_pct` in the EndingParameters [Game Data Record](../foundation/core-concepts.md#game-build-and-content) (GDR). |
| Pending panic change | The sum of every Panic increase minus every Panic reduction that the rules of the earlier [Turn advancement steps](turn-advancement.md#turn-advancement-steps) of one Advance turn have added so far, which the [Turn advancement step](domain-model.md#turn-advancement-steps) Panic then applies. |
| Ending reason | A condition that held when a Campaign ending was recorded and caused it: Every [Faction](domain-model.md#factions) [Eliminated](factions.md#glossary), Panic at the limit, or Money below zero. Each is defined under [Ending reasons](#ending-reasons). |

# Panic and Campaign ending state

**Proposed rule:** Panic and the Campaign ending are Campaign-wide values. They are not the [State](../foundation/core-concepts.md#campaign-instances) of the [Agency](domain-model.md#agency-and-agents), of a Faction, or of any other [Campaign instance](../foundation/core-concepts.md#campaign-instances), and they are not [Constants](../foundation/core-concepts.md#campaign-instances): they belong directly to [Campaign state](../foundation/core-concepts.md#campaign-and-session), in the [Live world state](../foundation/campaign-state.md#glossary) of every [World state](../foundation/engine-contract.md#player-actions-and-turns), under [Campaign and Agency](domain-model.md#campaign-and-agency) in Domain Model. They are not Campaign instances, so they have no [Instance ID](../foundation/campaign-instances.md#glossary), [Archetype](../foundation/core-concepts.md#campaign-instances), or Constants. Panic is not a value of the Agency because the public's alarm is a property of the world the Agency acts in, not of the organization. The following table is the complete set of these Campaign-wide values. Every one is an [Authoritative value](../foundation/core-concepts.md#value-classification), and every one is a whole number or an absent value, under [Whole-number quantities](../foundation/numbers.md#whole-number-quantities) in Numbers.

| Value | Meaning | Range and classification |
| --- | --- | --- |
| Panic | The current Panic, a [Percent value](../foundation/numbers.md#glossary). | A whole number from 0 to 100, both included. Changes only in the [Panic step](#panic-step). |
| Campaign ending | Absent while the Campaign is being played; Victory or Defeat once the Campaign has finished. | Absent, Victory, or Defeat. Changes only in the [Ending check step](#ending-check-step), and only from absent. |
| Ending reasons | The set of Ending reasons that held when the Campaign ending was recorded, under [Ending reasons](#ending-reasons). | Empty exactly when the Campaign ending is absent. Otherwise as [Ending reasons](#ending-reasons) states. |
| Ending turn | The turn number of the [Turn](../foundation/engine-contract.md#player-actions-and-turns) whose Advance turn recorded the Campaign ending. | A whole number of at least 1. Absent exactly when the Campaign ending is absent. |

A Campaign has exactly one Panic, one Campaign ending value, one set of Ending reasons, and one Ending turn. Panic has no [Turn series](../foundation/world-history.md#turn-series), under [Turn series](../foundation/world-history.md#turn-series) in History and Turn Report.

## Initial values

**Proposed rule:** Campaign creation sets the Campaign-wide values as follows, under [Campaign instance creation](../foundation/campaign-instances.md#campaign-instance-creation) in Campaign Instances. No Game Data Record (GDR) and no [Campaign configuration](../foundation/campaign-state.md#glossary) value supplies or changes any of them. This table is exhaustive.

| Value           | Initial value | Source     |
| --------------- | ------------- | ---------- |
| Panic           | 0             | This rule. |
| Campaign ending | Absent        | This rule. |
| Ending reasons  | Empty         | This rule. |
| Ending turn     | Absent        | This rule. |

## State invariants

In every [World state](../foundation/engine-contract.md#player-actions-and-turns), all of the following hold. A World state that violates one is an internal invariant violation, reported under [World state integrity](../foundation/engine-contract.md#world-state-integrity) in Engine Contract. The list is exhaustive.

1. Panic is a whole number from 0 to 100.
2. The Campaign ending, the Ending reasons, and the Ending turn are all absent or empty, or all present.
3. A Campaign ending of Victory has exactly one Ending reason, Every Faction [Eliminated](domain-model.md#factions).
4. A Campaign ending of Defeat has one or two Ending reasons, each of them Panic at the limit or Money below zero.

## Campaign ending lifecycle

The Campaign ending is in exactly one of the states No Campaign ending, Victory, and Defeat. The following table lists every transition; every transition not listed, e.g. from Victory to Defeat or from Defeat to No Campaign ending, is impossible. Victory and Defeat are final within a [Timeline](../foundation/engine-contract.md#persisted-data): no rule, [Player action](../foundation/engine-contract.md#player-actions-and-turns), or query clears or changes either, and the Campaign ending is never recorded a second time. Only restoring a World state from before the ending, under [Timeline](../foundation/timeline.md) and [Saves](../foundation/saves.md), makes the Campaign again a Campaign without a Campaign ending.

| Source state | Target state | Trigger | Condition |
| --- | --- | --- | --- |
| No Campaign ending | Victory | The [Ending check step](#ending-check-step) | [Victory](#victory) holds. |
| No Campaign ending | Defeat | The [Ending check step](#ending-check-step) | [Victory](#victory) does not hold and [Defeat](#defeat) holds. |

# Ending GDRs

The GDRs a [Game build](../foundation/core-concepts.md#game-build-and-content) supplies, and their values, are listed by [Bootstrap GDRs](../content/bootstrap-gdrs.md#glossary) and the YAML files it names.

## EndingParameters

EndingParameters bundles the scalar values that the ending rules read. It serves the Calculation parameter purpose under [GDR purpose: calculation parameter](../foundation/game-data-records.md#gdr-purpose-calculation-parameter) in Game Data Records. The table below is exhaustive apart from the `id` and `type` that every GDR has.

| Property | Meaning | Read by |
| --- | --- | --- |
| `defeat_at_panic_pct` | A Percent value: the Panic limit, the Panic at or above which the Campaign is lost. | [Defeat](#defeat), [Player-visible information](#player-visible-information) |

## Ending GDR validation

**Proposed rule:** The GDRs a Game build supplies must satisfy every rule below. The list is exhaustive for EndingParameters. A Game build whose GDRs violate one of these rules is defective: no Campaign is created from it, and the violation is reported as a data defect, never repaired into different gameplay, under [World state integrity](../foundation/engine-contract.md#world-state-integrity) in Engine Contract.

1. **One EndingParameters:** The Game build supplies exactly one EndingParameters GDR.
2. **Exact properties:** The EndingParameters GDR has exactly the properties its table above lists, apart from `id` and `type`: no listed property is missing and no other property is present.
3. **The Panic limit is reachable:** `defeat_at_panic_pct` is a whole number from 1 to 100, both included. A value below 1 would lose every Campaign in its first Advance turn, and a value above 100 could never be reached because Panic never exceeds 100 under [Panic step](#panic-step).

The Game build is not required to supply any FactionArchetype; the consequence is stated under [Victory](#victory).

# Pending panic change

**Proposed rule:** Pending panic change is the interface through which every other rule changes Panic. It exists only inside one Advance turn, and the following rules are complete:

- **Not Campaign state:** The Pending panic change is 0 when an Advance turn begins and is a [Derived value](../foundation/core-concepts.md#value-classification) of that Advance turn's contributions. It is not part of Campaign state: no World state contains it, because no World state lies inside an Advance turn, under [Player actions](../foundation/engine-contract.md#player-actions) in Engine Contract. It is discarded when the [Panic step](#panic-step) has applied it, and it never carries over to another Advance turn.
- **Contributions:** A rule that raises Panic adds a Panic increase to the Pending panic change, and a rule that lowers Panic adds a Panic reduction. Each Panic increase and each Panic reduction is a whole number of at least 0 of Panic percentage points, added to or subtracted from the Pending panic change as such; it is never a percentage of the current Panic, so a Panic increase of 8 raises Panic by 8 points whatever Panic is, e.g. from 40 to 48, not by 8 percent of 40. A contribution of 0 changes nothing. The rule that adds a contribution, e.g. a rule of [Missions](missions.md), states its amount and any rounding of that amount under [Rounding](../foundation/numbers.md#rounding) in Numbers.
- **When contributions are added:** Only rules of Turn advancement steps before the Panic step add to the Pending panic change, i.e. every Turn advancement step before the Panic step, under [Turn advancement steps](turn-advancement.md#turn-advancement-steps) in Turn Advancement. No rule of the Panic step, of the Ending check step, or of the Turn close step adds to it, and no Player action other than Advance turn changes Panic.
- **Several contributions:** Contributions add up, and the order in which they are added does not change the result: the Pending panic change is the sum of all Panic increases of the Advance turn minus the sum of all Panic reductions of the Advance turn. This is the combined result for the Panic step that [Values a step uses](turn-advancement.md#values-a-step-uses) in Turn Advancement requires. It is a whole number and is negative when reductions exceed increases.
- **No intermediate clamp:** Panic itself does not change while contributions are added. Nothing is clamped until the Panic step, so a contribution that would take Panic above 100 or below 0 on its own is added in full.

## Panic Effect kind

Game data changes Panic through one [Effect kind](../foundation/effect-lists.md#glossary), whose sign says whether Panic rises or falls.

**Proposed rule:** The Effect kind `panic` is defined as follows, under [Effect kinds](../foundation/effect-lists.md#effect-kinds) in Effect Lists:

- **Value:** a whole number of Panic percentage points: positive, zero, or negative. It is never a percentage of the current Panic.
- **Change:** applying one [Effect](../foundation/effect-lists.md#glossary) adds one contribution to the Pending panic change, under the rules above: a positive value `v` adds a Panic increase of `v`, a negative value `−v` adds a Panic reduction of `v`, and 0 adds nothing. It never changes Panic directly.
- **Supplied inputs:** none, because a Campaign has exactly one Panic.
- **Combined result:** the contributions add up as **Several contributions** above states, and the Panic step applies their sum once.

A rule may apply a `panic` Effect only in a Turn advancement step before the Panic step, under **When contributions are added** above.

# Panic step

**Proposed rule:** In the Turn advancement step Panic, Panic changes by the Pending panic change and is then clamped to the range 0 to 100. This is a formula, with the following parts:

- **Inputs:** `P0` is Panic as it is when the step begins, a whole number from 0 to 100, which is the [Step-start value](turn-advancement.md#glossary) of this step. `C` is the Pending panic change of this Advance turn, a whole number that may be negative.
- **Expression:** the new Panic is `max(0, min(100, P0 + C))`.
- **Rounding:** no rounding occurs, because every input is a whole number and the expression uses only addition, a minimum, and a maximum.
- **Range:** the new Panic is a whole number from 0 to 100, both included.

The clamp is applied once, to the sum. It never reads the Panic limit: Panic is clamped to 100 whatever `defeat_at_panic_pct` is. A change that the clamp discards is not remembered; e.g., Panic that would have reached 103 is 100, and a later reduction of 3 takes it to 97, not to 100. The step applies even when `C` is 0, in which case Panic is unchanged. After the step, the Pending panic change is discarded.

# Ending check step

**Proposed rule:** In the Turn advancement step Ending check, which follows the Panic step, the engine decides whether the Campaign ends, using the values as they are after every earlier step of the same Advance turn, including the Panic step, under [Values a step uses](turn-advancement.md#values-a-step-uses) in Turn Advancement. This step runs only in an Advance turn, so a Campaign ending is never recorded by any other Player action, by a query, or by campaign creation; e.g., a purchase the Agency cannot afford is rejected by [Economy and Upgrades](economy-and-upgrades.md) and cannot take money below zero, so it cannot end the Campaign. The predicates are tried in the following order, and the first that holds decides the Campaign ending:

1. [Victory](#victory).
2. Otherwise, [Defeat](#defeat).
3. Otherwise, nothing changes and the Campaign continues.

## Victory

**Proposed rule:** Victory holds exactly when the Campaign has at least one Faction and the Eliminated fact of every Faction is yes. Eliminated is read as it is when the step begins, under [Faction State](factions.md#faction-state) in Factions, so a Faction made Eliminated earlier in the same Advance turn counts.

A Campaign that has no Faction never has Victory: the condition "every Faction is Eliminated" is not satisfied by an absence of Factions. **Proposed rule:** this is the consequence for a Game build that supplies no FactionArchetype, which is valid under [Edge cases and failure behavior](factions.md#edge-cases-and-failure-behavior) in Factions. Such a Campaign can end only in Defeat. Victory requires at least one Faction, rather than a GDR validation rule requiring a FactionArchetype, because Factions already declares such a Game build valid, and an empty set of Factions would otherwise win the Campaign in its first Advance turn.

When Victory holds, the Campaign ending becomes Victory, the Ending reasons become the one Ending reason Every Faction Eliminated, and no Defeat condition is evaluated or recorded, whatever Panic and money are.

## Defeat

**Proposed rule:** Defeat is tried only when Victory does not hold. It holds when at least one of its two conditions holds:

- **Panic at the limit:** Panic, as it is after the [Panic step](#panic-step), is greater than or equal to the Panic limit, i.e. to `defeat_at_panic_pct` of EndingParameters. Equality counts: Panic equal to the Panic limit is Defeat.
- **Money below zero:** the Agency's money, as it is when the step begins, is less than 0. Money of exactly 0 is not Defeat. Money may be negative, under [Economy and Upgrades](economy-and-upgrades.md).

When Defeat holds, the Campaign ending becomes Defeat and the Ending reasons become every Ending reason whose condition holds: Panic at the limit when the first condition holds, Money below zero when the second does, and both when both hold. Both conditions are always evaluated; holding one does not skip the other.

## Ending reasons

An Ending reason records why a Campaign ended, which matters for Defeat, whose two conditions can hold separately or together.

The following table is the exhaustive set of Ending reasons.

| Ending reason | Recorded with | Holds when |
| --- | --- | --- |
| Every Faction Eliminated | Victory | The Campaign has at least one Faction and every Faction is Eliminated, under [Victory](#victory). |
| Panic at the limit | Defeat | Panic is greater than or equal to the Panic limit, under [Defeat](#defeat). |
| Money below zero | Defeat | The Agency's money is less than 0, under [Defeat](#defeat). |

## Recording the ending

When the Ending check step decides a Campaign ending, it records the Campaign ending, the Ending reasons, and the Ending turn in the World state that Advance turn produces. The Ending turn is the turn number of the Turn that this Advance turn ends, i.e. the turn number before the Turn close step raises it, the same convention as the Eliminated turn of a Faction under [Faction State](factions.md#faction-state). The following pseudocode states the complete step, where `F` is the set of Factions and `L` is the Panic limit:

```text
if |F| >= 1 and every Faction in F has Eliminated = yes:
    Campaign ending = Victory
    Ending reasons  = { Every Faction Eliminated }
else:
    reasons = { }
    if Panic >= L:        add Panic at the limit to reasons
    if money < 0:         add Money below zero to reasons
    if reasons is not empty:
        Campaign ending = Defeat
        Ending reasons  = reasons
if a Campaign ending was recorded:
    Ending turn = the turn number of the Turn this Advance turn ends
```

The Turn close step of [Turn Advancement](turn-advancement.md) still applies in the Advance turn that records a Campaign ending. The Ending turn is therefore one less than the turn number the World state after that Advance turn shows.

# After a Campaign ending

**Proposed rule:** Once the Campaign has a Campaign ending, the following rules hold in every later World state of the same Timeline, and the list is complete:

- **Every Player action is rejected:** Every state-changing action of [Player API](../foundation/engine-contract.md#api-surfaces) and of [Developer API](../foundation/engine-contract.md#api-surfaces), including `advanceTurn()` and including a [Player cheat action](../foundation/engine-contract.md#player-actions-and-turns), is rejected. The Campaign having no Campaign ending is a precondition of each of them, in addition to the other preconditions of that action, e.g. those in [Agents](agents-spec.md). A rejected action changes nothing, under [World state integrity](../foundation/engine-contract.md#world-state-integrity) in Engine Contract, and the error identifies that the Campaign has a Campaign ending, whether or not another precondition also failed.
- **Queries keep answering:** Every query of Player API and of Developer API returns exactly as at any other World state, subject to [Player-visible information](#player-visible-information) and the visibility rules of each value. The Campaign ending itself and every other query, including `getTurnReport()` and `getHistory()`, keep answering.
- **No [World state](../foundation/engine-contract.md#player-actions-and-turns) changes:** Because no Player action can commit, Panic, money, and every other value of the [World state](../foundation/engine-contract.md#player-actions-and-turns) stay as the Advance turn that recorded the Campaign ending left them. The Campaign ending is not cleared by any rule.
- **Other operations are not restricted:** The operations of [Session API](../foundation/engine-contract.md#api-surfaces), e.g. saving, Timeline navigation, changing Campaign configuration, and closing the [Current campaign](../foundation/core-concepts.md#campaign-and-session), are not Player actions, so a Campaign ending does not reject them. Their availability follows their own rules, e.g. in [Timeline](../foundation/timeline.md) and [Saves](../foundation/saves.md). An [Autopilot engagement](../foundation/engine-contract.md#autopilot) that is active when a Campaign ending is recorded ends with the disengagement reason campaign ended, under [Autopilot lifecycle and concurrency](../foundation/autopilot.md#autopilot-lifecycle-and-concurrency) in [Autopilot](../foundation/engine-contract.md#autopilot).

**Returning to an earlier state:** Undo and redo cannot clear the Campaign ending, because the Advance turn that recorded it is not a [Timeline entry](../foundation/timeline.md#glossary) and a Campaign with a Campaign ending commits no Player action. Going back across Turns to a World state from before the Advance turn, e.g. by [Autosave](../foundation/saves.md#autosave-kinds) navigation to the [Turn-end Autosave](../foundation/saves.md#autosave-kinds) of the Turn that ended it, makes current a World state in which the Campaign ending is absent, under [Returning to a World state](../foundation/timeline.md#returning-to-a-world-state) in Timeline. Play from there is ordinary play.

# Turn report

**Proposed rule:** The [Turn report](../foundation/campaign-state.md#glossary) of an Advance turn holds Panic in the [Turn-end state](../foundation/engine-contract.md#player-actions-and-turns) and after the Advance turn, and the Campaign ending it recorded with its Ending reasons, or none, under [Recording the ending](#recording-the-ending). The [History entry](../foundation/world-history.md#glossary) of the Turn the Advance turn ends holds Panic after the Advance turn and the Campaign ending it recorded, without its Ending reasons, or none, and holds Panic in the [Turn-start state](../foundation/engine-contract.md#player-actions-and-turns) and in the Turn-end state of that Turn. All are [Player-visible information](../foundation/engine-contract.md#api-surfaces), under [Turn report and history](../foundation/world-history.md#turn-report-and-history) in History and Turn Report.

# Player-visible information

**Proposed rule:** Every value marked Yes below is [Player-visible information](../foundation/engine-contract.md#api-surfaces) under [Player-visible information](../foundation/player-api.md#player-visible-information) in Player API from campaign creation, without a reveal condition. The table is exhaustive.

| Value                                                           | Player-visible information |
| --------------------------------------------------------------- | -------------------------- |
| Panic                                                           | Yes                        |
| The Panic limit, i.e. `defeat_at_panic_pct` of EndingParameters | Yes                        |
| The Campaign ending                                             | Yes                        |
| The Ending reasons                                              | Yes                        |
| The Ending turn                                                 | Yes                        |
| The Pending panic change                                        | No                         |

**Absent versus zero:** Player API reports a Campaign ending of No Campaign ending as the absence of a Campaign ending, with an empty set of Ending reasons and an absent Ending turn. It never reports absence as Victory, as Defeat, or as a value that looks like Panic of 0. Panic of 0 is reported as the whole number 0. The player thereby tells a Campaign being played at Panic 0 apart from a Campaign that has a Campaign ending.

**The Pending panic change:** It is not part of any World state, so no query returns it. Whether a single Panic increase or Panic reduction is visible is stated with the rule that adds it, e.g. in [Missions](missions.md). Under [Information boundary](../foundation/player-api.md#information-boundary) in Player API, the error for an action rejected because the Campaign has a Campaign ending reveals only values that this table makes Player-visible.

# Edge cases and failure behavior

- **Panic exactly at the Panic limit:** Defeat, not a continuing Campaign ([Defeat](#defeat)).
- **Panic one below the Panic limit:** No Defeat from Panic ([Defeat](#defeat)).
- **Panic already 100 and a further increase:** The sum is clamped to 100 in the same way; Panic never exceeds 100 and the excess is not remembered ([Panic step](#panic-step)).
- **Panic already 0 and a further reduction:** The sum is clamped to 0 ([Panic step](#panic-step)).
- **Increases and reductions that cancel:** A Pending panic change of 0 leaves Panic unchanged, even when an increase and a reduction would each have been clamped on their own ([Pending panic change](#pending-panic-change)).
- **Money exactly zero:** No Defeat from money. Money of -1 is Defeat ([Defeat](#defeat)).
- **Victory and Defeat conditions both hold:** The Campaign ending is Victory with the one Ending reason Every Faction Eliminated; the Defeat conditions are not recorded ([Victory](#victory)).
- **Both Defeat conditions hold:** The Campaign ending is Defeat with both Ending reasons ([Defeat](#defeat)).
- **No Faction:** The Campaign never has Victory and ends only in Defeat ([Victory](#victory)).
- **Faction made Eliminated in the same Advance turn:** The last Faction made Eliminated in [Mission](domain-model.md#leads-investigations-mission-sites-and-missions) resolution counts for Victory in the Ending check step of the same Advance turn ([Victory](#victory)).
- **Empty roster, no [Mission sites](domain-model.md#leads-investigations-mission-sites-and-missions), no Investigations:** Not an ending and not an Ending reason. Only Panic at the limit and Money below zero cause Defeat ([Defeat](#defeat)).
- **A Player action between Advance turns:** It never records a Campaign ending; the Campaign ending is decided only in the Ending check step, e.g. an unaffordable purchase is rejected by [Economy and Upgrades](economy-and-upgrades.md) rather than ending the Campaign ([Ending check step](#ending-check-step)).
- **Advance turn after a Campaign ending:** Rejected; the Panic step, the Ending check step, and every other step are not applied, so no Campaign ending is recorded twice ([After a Campaign ending](#after-a-campaign-ending)).
- **Invalid Panic limit, an extra property, or a second EndingParameters:** A Game build containing any of them fails [Ending GDR validation](#ending-gdr-validation), and no Campaign is created from it.
- **A World state violating a state invariant,** e.g. Panic of 101 or a Victory with the Ending reason Money below zero, is an internal invariant violation ([State invariants](#state-invariants)).

# TODOs

- TODO (later): A [Lead](domain-model.md#leads-investigations-mission-sites-and-missions) whose completion wins the Campaign, under [Victory](#victory).
- TODO (later): Effects of Panic other than Defeat, e.g. an effect on funding, under [Panic and Campaign ending state](#panic-and-campaign-ending-state).
