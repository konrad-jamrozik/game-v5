# Panic and Endings

| Metadata    | Value                                                                                                                                                            |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | ENDING                                                                                                                                                           |
| Family      | Mechanics                                                                                                                                                        |
| Status      | Draft                                                                                                                                                            |
| Audience    | Engine designer, Content designer, AI designer, Implementer                                                                                                      |
| Owns        | Panic and how this turn's changes to it are applied, the conditions that end a Campaign in Victory or Defeat, and what remains possible after a Campaign ending. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                                                                                                   |

# Overview

This document defines [Panic](#glossary), the one Campaign-wide value that measures how alarmed the public is, and the
two ways a Campaign finishes: Victory and Defeat. It owns the Panic value and its range, the Pending panic change that
other rules add to during an Advance turn and the Turn advancement step Panic that applies it, the predicates of the
Turn advancement step Ending check and the order in which they are tried, the record a Campaign ending leaves, what the
engine still answers and still refuses once a Campaign has a Campaign ending, which of these values are Player-visible
information, and the validation rules for the one Game Data Record (GDR) it reads, EndingParameters.

It refines the Campaign-wide properties that [Campaign and Agency](domain-model.md#campaign-and-agency) in Domain Model
places directly on Campaign state, with the properties and rules listed above. It reads two facts owned elsewhere: the
Defeated fact of each Faction, which [Defeat](factions.md#defeat) in Factions owns, and the Agency's money, which
[Economy and Upgrades](economy-and-upgrades.md) owns. [Numbers](../foundation/numbers.md) supplies whole-number
quantities and the Percent value.

This document does not own, e.g.:

- Any single increase or reduction of Panic: each rule that raises or lowers Panic, e.g. the consequence of a Mission site
  being Expired or Won, belongs to [Missions](missions.md). This document owns only the interface those rules add
  to, under [Pending panic change](#pending-panic-change).
- What makes a Faction Defeated: that belongs to [Factions](factions.md) and [Missions](missions.md).
- The order of the Turn advancement steps, or which step a rule belongs to: [Turn Advancement](turn-advancement.md) owns
  both, and places the Panic step and the Ending check step under
  [Turn advancement steps](turn-advancement.md#turn-advancement-steps).

These are ownership pointers; this document relies on none of them except where a rule below says so.

The following are out of scope and are not specified here: a Lead whose completion wins the Campaign, which game-ts had
as its final Peace on Earth Lead and which v5 replaces by the Victory condition under [Victory](#victory); and any
effect of Panic other than Defeat, e.g. an effect on funding. This list is exhaustive.

# Relationships

- Uses [Core Concepts](../foundation/core-concepts.md)
- Uses [Economy and Upgrades](economy-and-upgrades.md)
- Uses [Engine Contract](../foundation/engine-contract.md)
- Uses [Factions](factions.md)
- Uses [Numbers](../foundation/numbers.md)
- Refines [Domain Model](domain-model.md)
- Used by [Missions](./missions.md)
- Used by [Turn Advancement](./turn-advancement.md)

# Glossary

Campaign, Campaign state, GDR, Game build, Authoritative value, and Derived value are defined by the
[Core Concepts glossary](../foundation/core-concepts.md#glossary). World state, Current world state, Constants, and State
are defined by the [Campaign State glossary](../foundation/campaign-state.md#glossary). Player action, Committed state,
Turn, Player API, Developer API, Session controller, and Player-visible information are defined by the
[Engine Contract glossary](../foundation/engine-contract.md#glossary). Percent value is defined by the
[Numbers glossary](../foundation/numbers.md#glossary). Faction, Agency, Mission site, and Response Mission site are
defined by the [Domain Model glossary](domain-model.md#glossary). Turn advancement step is defined by the
[Turn Advancement glossary](turn-advancement.md#glossary). Defeated is a fact of a Faction that
[Defeat](factions.md#defeat) in Factions owns.

## Panic

How alarmed the public is, and how a turn's changes to it are collected.

| Term                 | Definition                                                                                                                                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Panic                | How alarmed the public is, from 0% to 100%; the Campaign is lost when it reaches the Panic limit.                                                                                                           |
| Panic limit          | The Panic at which the Campaign is lost: the value of `defeat_at_panic_pct` in the EndingParameters GDR.                                                                                                    |
| Pending panic change | The sum of every Panic increase minus every Panic reduction that the rules of the earlier Turn advancement steps of one Advance turn have added so far, which the Turn advancement step Panic then applies. |

## Campaign endings

How a Campaign finishes, and why.

| Term            | Definition                                                                                                                                                                                         |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Campaign ending | How a Campaign finished: Victory or Defeat. A Campaign without one is still being played.                                                                                                          |
| Ending reason   | A condition that held when a Campaign ending was recorded and caused it: Every Faction Defeated, Panic at the limit, or Money below zero. Each is defined under [Ending reasons](#ending-reasons). |

# Panic and Campaign ending state

**Proposed rule:** Panic and the Campaign ending are Campaign-wide values. They are not the State of the Agency, of a
Faction, or of any other Campaign instance, and they are not Constants: they belong directly to Campaign state, in
Current world state, under [Campaign and Agency](domain-model.md#campaign-and-agency) in Domain Model. They are not
Campaign instances, so they have no Instance ID, Archetype, or Constants. The Agency does not own Panic because the
public's alarm is a property of the world the Agency acts in, not of the organization. The following table is the
complete set of Campaign-wide values this document owns. Every one is an Authoritative value, and every one is a whole
number or an absent value, under [Whole-number quantities](../foundation/numbers.md#whole-number-quantities) in Numbers.

| Value           | Meaning                                                                                                             | Range and classification                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Panic           | The current Panic, a Percent value.                                                                                 | A whole number from 0 to 100, both included. Changes only in the [Panic step](#panic-step).                    |
| Campaign ending | Absent while the Campaign is being played; Victory or Defeat once the Campaign has finished.                        | Absent, Victory, or Defeat. Changes only in the [Ending check step](#ending-check-step), and only from absent. |
| Ending reasons  | The set of Ending reasons that held when the Campaign ending was recorded, under [Ending reasons](#ending-reasons). | Empty exactly when the Campaign ending is absent. Otherwise as [Ending reasons](#ending-reasons) states.       |
| Ending turn     | The turn number of the Turn whose Advance turn recorded the Campaign ending.                                        | A whole number of at least 1. Absent exactly when the Campaign ending is absent.                               |

A Campaign has exactly one Panic, one Campaign ending value, one set of Ending reasons, and one Ending turn. Panic has no
Turn series: [Turn series](../foundation/campaign-state.md#turn-series) in Campaign State requires the owner of a value to
declare one, and this document declares none.

## Initial values

**Proposed rule:** Campaign creation sets the Campaign-wide values as follows, under
[Campaign instance creation](../foundation/campaign-state.md#campaign-instance-creation) in Campaign State. No GDR and no
Campaign configuration value supplies or changes any of them. This table is exhaustive.

| Value           | Initial value | Source     |
| --------------- | ------------- | ---------- |
| Panic           | 0             | This rule. |
| Campaign ending | Absent        | This rule. |
| Ending reasons  | Empty         | This rule. |
| Ending turn     | Absent        | This rule. |

## State invariants

In every Committed state, all of the following hold. A Committed state that violates one is an internal invariant
violation, reported under [Committed state integrity](../foundation/engine-contract.md#committed-state-integrity) in
Engine Contract. The list is exhaustive.

1. Panic is a whole number from 0 to 100.
2. The Campaign ending, the Ending reasons, and the Ending turn are all absent or empty, or all present.
3. A Campaign ending of Victory has exactly one Ending reason, Every Faction Defeated.
4. A Campaign ending of Defeat has one or two Ending reasons, each of them Panic at the limit or Money below zero.

## Campaign ending lifecycle

The Campaign ending is in exactly one of the states No Campaign ending, Victory, and Defeat. The following table lists
every transition; every transition not listed, e.g. from Victory to Defeat or from Defeat to No Campaign ending, is
impossible. Victory and Defeat are final within a Timeline: no rule, Player action, or query clears or changes either,
and the Campaign ending is never recorded a second time. Only restoring a Committed state from before the ending,
which [Timeline](../foundation/timeline.md) and [Saves](../foundation/saves.md) own, makes the Campaign again a Campaign
without a Campaign ending.

| Source state       | Target state | Trigger                                     | Condition                                                      |
| ------------------ | ------------ | ------------------------------------------- | -------------------------------------------------------------- |
| No Campaign ending | Victory      | The [Ending check step](#ending-check-step) | [Victory](#victory) holds.                                     |
| No Campaign ending | Defeat       | The [Ending check step](#ending-check-step) | [Victory](#victory) does not hold and [Defeat](#defeat) holds. |

# Ending GDRs

This document owns the following GDR Type and states which rule reads each property. A rule in this document names the
property it reads and never copies a GDR value; only the [Acceptance examples](#acceptance-examples) show values. The
GDRs a Game build supplies, and their values, are listed by [Bootstrap GDRs](../content/bootstrap-gdrs.md) and the YAML
files it names.

## EndingParameters

EndingParameters bundles the scalar values this document's rules read. It serves the Calculation parameter purpose under
[GDR purpose: calculation parameter](../foundation/game-data-records.md#gdr-purpose-calculation-parameter) in Game Data
Records. The following property table is exhaustive apart from the `id` and `type` that every GDR has.

| Property              | Meaning                                                                             | Read by                                                                      |
| --------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `defeat_at_panic_pct` | A Percent value: the Panic limit, the Panic at or above which the Campaign is lost. | [Defeat](#defeat), [Player-visible information](#player-visible-information) |

## Ending GDR validation

**Proposed rule:** The GDRs a Game build supplies must satisfy every rule below. The list is exhaustive for the GDRs this
document owns. A Game build whose GDRs violate one of these rules is defective: no Campaign is created from it, and the
violation is reported as a data defect, never repaired into different gameplay, under
[Committed state integrity](../foundation/engine-contract.md#committed-state-integrity) in Engine Contract.

1. **One EndingParameters:** The Game build supplies exactly one EndingParameters GDR.
2. **Exact properties:** The EndingParameters GDR has exactly the properties its table above lists, apart from `id` and
   `type`: no listed property is missing and no other property is present.
3. **The Panic limit is reachable:** `defeat_at_panic_pct` is a whole number from 1 to 100, both included. A value below
   1 would lose every Campaign in its first Advance turn, and a value above 100 could never be reached because
   Panic never exceeds 100 under [Panic step](#panic-step).

The Game build is not required to supply any FactionArchetype; the consequence is stated under [Victory](#victory).

# Pending panic change

**Proposed rule:** Pending panic change is the interface through which every other rule changes Panic. It exists only
inside one Advance turn, and the following rules are complete:

- **Not Campaign state:** The Pending panic change is 0 when an Advance turn begins and is a Derived value of that
  Advance turn's contributions. It is not part of Campaign state: no Committed state contains it, because no Committed
  state lies inside an Advance turn, under [Player queries and actions](../foundation/engine-contract.md#player-queries-and-actions)
  in Engine Contract. It is discarded when the [Panic step](#panic-step) has applied it, and it never carries over to
  another Advance turn.
- **Contributions:** A rule that raises Panic adds a Panic increase to the Pending panic change, and a rule that lowers
  Panic adds a Panic reduction. Each Panic increase and each Panic reduction is a whole number of at least 0 of Panic percentage points, added to or
  subtracted from the Pending panic change as such; it is never a percentage of the current Panic, so a Panic increase
  of 8 raises Panic by 8 points whatever Panic is, e.g. from 40 to 48, not by 8 percent of 40. A contribution of 0 changes
  nothing. The rule that adds one, and the amount it adds, belong to
  [Missions](missions.md) or to whichever specification owns that rule, which is also responsible for any rounding of
  that amount under [Rounding](../foundation/numbers.md#rounding) in Numbers.
- **When contributions are added:** Only rules of Turn advancement steps before the Panic step add to the Pending
  panic change, i.e. every Turn advancement step before the Panic step, under
  [Turn advancement steps](turn-advancement.md#turn-advancement-steps) in Turn Advancement. No rule of the Panic step, of the Ending check step, or of the Turn close step adds to it, and no Player
  action other than Advance turn changes Panic.
- **Several contributions:** Contributions add up, and the order in which they are added does not change the result:
  the Pending panic change is the sum of all Panic increases of the Advance turn minus the sum of all Panic reductions
  of the Advance turn. This is the combined result for the Panic step that [Values a step uses](turn-advancement.md#values-a-step-uses)
  in Turn Advancement requires. It is a whole number and is negative when reductions exceed increases.
- **No intermediate clamp:** Panic itself does not change while contributions are added. Nothing is clamped until the
  Panic step, so a contribution that would take Panic above 100 or below 0 on its own is added in full.

# Panic step

**Proposed rule:** In the Turn advancement step Panic, Panic changes by the Pending panic change and is then clamped to
the range 0 to 100. This is a formula, with the following parts:

- **Inputs:** `P0` is Panic as it is when the step begins, a whole number from 0 to 100, which is the Step-start value
  of this step. `C` is the Pending panic change of this Advance turn, a whole number that may be negative.
- **Expression:** the new Panic is `max(0, min(100, P0 + C))`.
- **Rounding:** no rounding occurs, because every input is a whole number and the expression uses only addition, a
  minimum, and a maximum.
- **Range:** the new Panic is a whole number from 0 to 100, both included.

The clamp is applied once, to the sum. It never reads the Panic limit: Panic is clamped to 100 whatever
`defeat_at_panic_pct` is. A change that the clamp discards is not remembered; e.g., Panic that would have reached 103 is
100, and a later reduction of 3 takes it to 97, not to 100. The step applies even when `C` is 0, in which case Panic is
unchanged. After the step, the Pending panic change is discarded.

# Ending check step

**Proposed rule:** In the Turn advancement step Ending check, which follows the Panic step, the engine decides whether
the Campaign ends, using the values as they are after every earlier step of the same Advance turn, including the Panic
step, under [Values a step uses](turn-advancement.md#values-a-step-uses) in Turn Advancement. This step runs only in an
Advance turn, so a Campaign ending is never recorded by any other Player action, by a query, or by campaign creation;
e.g., a purchase the Agency cannot afford is rejected by [Economy and Upgrades](economy-and-upgrades.md) and cannot take
money below zero, so it cannot end the Campaign. The predicates are tried in the following order, and the first that holds
decides the Campaign ending:

1. [Victory](#victory).
2. Otherwise, [Defeat](#defeat).
3. Otherwise, nothing changes and the Campaign continues.

## Victory

**Proposed rule:** Victory holds exactly when the Campaign has at least one Faction and the Defeated fact of every Faction
is yes. Defeated is read as it is when the step begins, under [Faction State](factions.md#faction-state) in Factions, so a
Faction made Defeated earlier in the same Advance turn counts.

A Campaign that has no Faction never has Victory: the condition "every Faction is Defeated" is not satisfied by an
absence of Factions. **Proposed rule:** this is the consequence for a Game build that supplies no FactionArchetype, which
[Edge cases and failure behavior](factions.md#edge-cases-and-failure-behavior) in Factions leaves valid and leaves to this document. Such a Campaign can end
only in Defeat. This document chooses that consequence rather than a GDR validation rule requiring a FactionArchetype,
because Factions already declares such a Game build valid, and an empty set of Factions would otherwise win the Campaign
in its first Advance turn.

When Victory holds, the Campaign ending becomes Victory, the Ending reasons become the one Ending reason Every Faction
Defeated, and no Defeat condition is evaluated or recorded, whatever Panic and money are.

## Defeat

**Proposed rule:** Defeat is tried only when Victory does not hold. It holds when at least one of its two conditions
holds:

- **Panic at the limit:** Panic, as it is after the [Panic step](#panic-step), is greater than or equal to the Panic
  limit, i.e. to `defeat_at_panic_pct` of EndingParameters. Equality counts: Panic equal to the Panic limit is Defeat.
- **Money below zero:** the Agency's money, as it is when the step begins, is less than 0. Money of exactly 0 is not
  Defeat. Money may be negative, which [Economy and Upgrades](economy-and-upgrades.md) owns.

When Defeat holds, the Campaign ending becomes Defeat and the Ending reasons become every Ending reason whose condition
holds: Panic at the limit when the first condition holds, Money below zero when the second does, and both when both
hold. Both conditions are always evaluated; holding one does not skip the other.

## Ending reasons

The following table is the exhaustive set of Ending reasons.

| Ending reason          | Recorded with | Holds when                                                                                      |
| ---------------------- | ------------- | ----------------------------------------------------------------------------------------------- |
| Every Faction Defeated | Victory       | The Campaign has at least one Faction and every Faction is Defeated, under [Victory](#victory). |
| Panic at the limit     | Defeat        | Panic is greater than or equal to the Panic limit, under [Defeat](#defeat).                     |
| Money below zero       | Defeat        | The Agency's money is less than 0, under [Defeat](#defeat).                                     |

## Recording the ending

When the Ending check step decides a Campaign ending, it records the Campaign ending, the Ending reasons, and the Ending
turn in the Committed state that Advance turn produces. The Ending turn is the turn number of the Turn that this Advance
turn ends, i.e. the turn number before the Turn close step raises it, the same convention as the Defeated turn of a
Faction under [Faction State](factions.md#faction-state). The following pseudocode states the complete step, where `F` is
the set of Factions and `L` is the Panic limit:

```text
if |F| >= 1 and every Faction in F has Defeated = yes:
    Campaign ending = Victory
    Ending reasons  = { Every Faction Defeated }
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

The Turn close step still applies in the Advance turn that records a Campaign ending: [Turn Advancement](turn-advancement.md)
owns that step. The Ending turn is therefore one less than the turn number the Committed state after that Advance turn
shows.

# After a Campaign ending

**Proposed rule:** Once the Campaign has a Campaign ending, the following rules hold in every later Committed state of
the same Timeline, and the list is complete:

- **Every Player action is rejected:** Every state-changing action of Player API and of Developer API, including
  `advanceTurn()` and including a cheat action, is rejected. The Campaign having no Campaign ending is a precondition
  of each of them, in addition to the preconditions the owning specification states, e.g. in
  [Agents](agents-spec.md). A rejected action changes nothing, under
  [Committed state integrity](../foundation/engine-contract.md#committed-state-integrity) in Engine Contract, and the
  error identifies that the Campaign has a Campaign ending, whether or not another precondition also failed.
- **Queries keep answering:** Every query of Player API and of Developer API returns exactly as at any other Committed
  state, subject to [Player-visible information](#player-visible-information) and the visibility rules of the
  specification owning each value. The Campaign ending itself and every other query, including `getReports()`, keep answering.
- **Nothing in Campaign state changes:** Because no Player action can commit, Panic, money, and every other value stay as
  the Advance turn that recorded the Campaign ending left them. The Campaign ending is not cleared by any rule.
- **Other operations are not restricted by this document:** The operations of Session API, e.g. saving, Timeline
  navigation, and closing the Current campaign, are not Player actions. Their availability belongs to their owners,
  e.g. [Timeline](../foundation/timeline.md) and [Saves](../foundation/saves.md). An Autopilot engagement that is active
  when a Campaign ending is recorded ends with the disengagement reason campaign ended, which
  [Autopilot lifecycle and concurrency](../foundation/autopilot.md#autopilot-lifecycle-and-concurrency) in Autopilot owns.

**Returning to an earlier state:** Undo and redo cannot clear the Campaign ending, because the Advance turn that recorded
it is not a Timeline entry and a Campaign with a Campaign ending commits no Player action. Going back across Turns to a
Committed state from before the Advance turn, e.g. by Autosave navigation to the Turn-end Autosave of the Turn that ended
it, restores a Campaign state in which the Campaign ending is absent, under
[Restored Committed states](../foundation/timeline.md#restored-committed-states) in Timeline. Play from there is
ordinary play.

# Player-visible information

**Proposed rule:** The following table states, for every value this document owns, whether it is Player-visible
information under [Player queries and actions](../foundation/engine-contract.md#player-queries-and-actions) in Engine
Contract. It is exhaustive. Every Player-visible value is visible from campaign creation, without a reveal condition. This
document hides nothing.

| Value                                                           | Player-visible information |
| --------------------------------------------------------------- | -------------------------- |
| Panic                                                           | Yes                        |
| The Panic limit, i.e. `defeat_at_panic_pct` of EndingParameters | Yes                        |
| The Campaign ending                                             | Yes                        |
| The Ending reasons                                              | Yes                        |
| The Ending turn                                                 | Yes                        |
| The Pending panic change                                        | No                         |

**Absent versus zero:** Player API reports a Campaign ending of No Campaign ending as the absence of a Campaign ending,
with an empty set of Ending reasons and an absent Ending turn. It never reports absence as Victory, as Defeat, or as a
value that looks like Panic of 0. Panic of 0 is reported as the whole number 0. The player thereby tells a Campaign being
played at Panic 0 apart from a Campaign that has a Campaign ending.

**The Pending panic change:** It is not part of any Committed state, so no query returns it. Whether a single Panic
increase or Panic reduction is visible belongs to [Missions](missions.md). Under [Information boundary](../foundation/engine-contract.md#information-boundary) in Engine
Contract, the error for an action rejected because the Campaign has a Campaign ending reveals only values that this table
makes Player-visible.

# Edge cases and failure behavior

- **Panic exactly at the Panic limit:** Defeat, not a continuing Campaign ([Defeat](#defeat)).
- **Panic one below the Panic limit:** No Defeat from Panic ([Defeat](#defeat)).
- **Panic already 100 and a further increase:** The sum is clamped to 100 in the same way; Panic never exceeds 100 and
  the excess is not remembered ([Panic step](#panic-step)).
- **Panic already 0 and a further reduction:** The sum is clamped to 0 ([Panic step](#panic-step)).
- **Increases and reductions that cancel:** A Pending panic change of 0 leaves Panic unchanged, even when an increase and
  a reduction would each have been clamped on their own ([Pending panic change](#pending-panic-change)).
- **Money exactly zero:** No Defeat from money. Money of -1 is Defeat ([Defeat](#defeat)).
- **Victory and Defeat conditions both hold:** The Campaign ending is Victory with the one Ending reason Every Faction
  Defeated; the Defeat conditions are not recorded ([Victory](#victory)).
- **Both Defeat conditions hold:** The Campaign ending is Defeat with both Ending reasons ([Defeat](#defeat)).
- **No Faction:** The Campaign never has Victory and ends only in Defeat ([Victory](#victory)).
- **Faction made Defeated in the same Advance turn:** The last Faction made Defeated in Mission resolution counts for
  Victory in the Ending check step of the same Advance turn ([Victory](#victory)).
- **Empty roster, no Mission sites, no Investigations:** Not an ending and not an Ending reason. Only Panic at the limit
  and Money below zero cause Defeat ([Defeat](#defeat)).
- **A Player action between Advance turns:** It never records a Campaign ending; the Campaign ending is decided only in
  the Ending check step, e.g. an unaffordable purchase is rejected by its owning specification rather than ending the
  Campaign ([Ending check step](#ending-check-step)).
- **Advance turn after a Campaign ending:** Rejected; the Panic step, the Ending check step, and every other step are not
  applied, so no Campaign ending is recorded twice ([After a Campaign ending](#after-a-campaign-ending)).
- **Invalid Panic limit, an extra property, or a second EndingParameters:** A Game build containing any of them fails
  [Ending GDR validation](#ending-gdr-validation), and no Campaign is created from it.
- **A Committed state violating a state invariant,** e.g. Panic of 101 or a Victory with the Ending reason Money below
  zero, is an internal invariant violation ([State invariants](#state-invariants)).

# Acceptance examples

All examples use the Bootstrap GDR values from `content/panic-and-endings/ending_parameters.yaml`,
`content/factions/faction_operation_levels.yaml`, and `content/missions/mission_site_archetypes.yaml`, unless an example
states a test GDR. The values they read are:

| GDR                 | Values read                           |
| ------------------- | ------------------------------------- |
| `endings`           | `defeat_at_panic_pct` 100             |
| `operation_level_1` | `on_ignored_or_lost` Panic increase 3 |
| `operation_level_2` | `on_ignored_or_lost` Panic increase 8 |
| `apprehend_member`  | Panic reduction when Won: 1           |
| `raid_safehouse`    | Panic reduction when Won: 2           |

Where an example says a Panic increase or reduction is added, the rule that adds it belongs to
[Missions](missions.md) and is only assumed here. In every example the Campaign has one Faction, Red Dawn, which is not
Defeated unless the example says otherwise, and the Agency's money is 500 unless the example says otherwise. "The
Advance turn ending turn t" is the Advance turn committed during Turn t.

## Panic is summed, clamped, and reaches Defeat

This example exercises [Pending panic change](#pending-panic-change), [Panic step](#panic-step), [Defeat](#defeat), and
[Recording the ending](#recording-the-ending).

Initial state: Turn 12, Panic 97, money 40, funding 0, and exactly 4 Agents, all Deployed to one `raid_safehouse`
Mission site. A Response Mission site of Faction operation level 2 is Active and expires in this Advance turn. In the
Advance turn ending turn 12:

- Agency income adds 0, because funding is 0 and no Agent is on Contracting.
- Upkeep takes `10 × 4 = 40`, so money is 0.
- In Mission resolution, the Battle of the `raid_safehouse` Mission site is stipulated to be Prevailed, so the site is
  Won. It adds money 100 and funding 5, so money is 100 and funding is 5, and it adds a Panic reduction of 2.
- In Mission site expiration, the Response Mission site is Expired and adds a Panic increase of 8, and funding falls
  from 5 to 4.

The Pending panic change is `8 − 2 = 6`. The Panic step computes
`max(0, min(100, 97 + 6)) = max(0, min(100, 103)) = 100`.

In the Ending check step, Victory does not hold, because Red Dawn is not Defeated. Panic 100 is at least the Panic limit
100, so Defeat holds; money 100 is not below zero.

| Value           | After the Advance turn ending turn 12 |
| --------------- | ------------------------------------- |
| Panic           | 100                                   |
| Money           | 100                                   |
| Campaign ending | Defeat                                |
| Ending reasons  | { Panic at the limit }                |
| Ending turn     | 12                                    |
| Turn number     | 13, because Turn close still applies  |

## Clamping once, not at each contribution

This example exercises [Pending panic change](#pending-panic-change) and [Panic step](#panic-step).

Initial state: Panic 98. Contributions in the order they are added during one Advance turn: a Panic increase of 8, then
a Panic reduction of 2, then a Panic reduction of 2. The Pending panic change is `8 − 2 − 2 = 4`, and the new Panic is
`max(0, min(100, 98 + 4)) = 100`. Clamping after each contribution would give 100, 98, and 96, so the result 100 shows
that the clamp is applied once to the sum. Adding the same contributions in the order reduction 2, increase 8,
reduction 2 gives the same Pending panic change and the same Panic of 100.

## A cancelling pair is not clamped

This example exercises [Pending panic change](#pending-panic-change) and [Panic step](#panic-step).

Initial state: Panic 99. In one Advance turn the contributions are a Panic increase of 8, a Panic reduction of 2, and a
Panic reduction of 6, which a test rule adds. The Pending panic change is `8 − 2 − 6 = 0`, so Panic is `99 + 0 = 99`. Panic is 99, below the Panic limit 100, so Defeat
from Panic does not hold, and the Campaign has no Campaign ending.

## Panic at the floor and the ordinary case

This example exercises [Panic step](#panic-step).

- Panic 1 and one Panic reduction of 2 give `max(0, min(100, 1 − 2)) = 0`.
- Panic 0 and no contributions give Panic 0, because a Pending panic change of 0 leaves Panic unchanged.
- Panic 50 with Panic increases of 3 and 8 and Panic reductions of 1 and 2 give a Pending panic change of 8 and Panic 58.
  Panic 58 is below the Panic limit, so the Campaign continues.

## The Panic limit is inclusive

This example exercises [Defeat](#defeat) and [Ending GDR validation](#ending-gdr-validation). It uses a test
EndingParameters GDR with `defeat_at_panic_pct` 80.

With a Panic of 79 after the Panic step, and money 500, the Campaign ending stays absent. With a Panic of 80, the
Campaign ending is Defeat with the Ending reasons { Panic at the limit }. With the Bootstrap value 100, a Panic of 99
does not end the Campaign and a Panic of 100 does.

## Money below zero is Defeat; zero is not

This example exercises [Defeat](#defeat).

Initial state: Panic 40, no Panic contributions, Red Dawn not Defeated.

| Money after the earlier steps | Campaign ending | Ending reasons       |
| ----------------------------- | --------------- | -------------------- |
| 1                             | Absent          | Empty                |
| 0                             | Absent          | Empty                |
| -1                            | Defeat          | { Money below zero } |
| -10                           | Defeat          | { Money below zero } |

With money -10, the Panic of 40 is below the Panic limit, so Panic at the limit is not an Ending reason.

## Both Defeat conditions hold

This example exercises [Defeat](#defeat) and [Ending reasons](#ending-reasons).

Initial state: Panic 95, money -5 after the Upkeep step. A Panic increase of 8 is added. The Panic step gives
`max(0, min(100, 95 + 8)) = 100`. In the Ending check step, Victory does not hold, Panic 100 is at least 100, and money
-5 is below zero, so the Campaign ending is Defeat with the Ending reasons { Panic at the limit, Money below zero }.

## Victory prevails over Defeat

This example exercises [Victory](#victory), [Defeat](#defeat), and [Ending check step](#ending-check-step).

Initial state: Turn 150, Panic 95, money 30, funding 0, and Red Dawn, the only Faction, not Defeated. The Agency has
exactly 4 Agents, which equals the Transport cap: Agents a1 and a2 are Deployed to a `raid_hq` Mission site, and Agents a3
and a4 are Deployed to a Response Mission site of `operation_level_2` of Red Dawn. No Agent is on Contracting.

In the Advance turn ending turn 150:

- Agency income adds 0, because funding is 0 and no Agent is on Contracting.
- Upkeep takes `10 × 4 = 40`, so money is -10.
- In Mission resolution, the Battle of the `raid_hq` Mission site is stipulated to be Prevailed, so the site is Won and
  makes Red Dawn Defeated, with the Defeated turn 150, under [Defeat](factions.md#defeat) in Factions. In the same step,
  the Battle of the Response Mission site is stipulated to be Wiped, so that site is Lost and adds a Panic increase of 8
  to the Pending panic change. Funding stays 0, because a funding change of -1 is floored at 0.
- The Panic step gives `max(0, min(100, 95 + 8)) = 100`.

In the Ending check step, the Campaign has one Faction and it is Defeated, so Victory holds. The order of the predicates
means Defeat is not tried.

| Value           | After the Advance turn ending turn 150 |
| --------------- | -------------------------------------- |
| Campaign ending | Victory                                |
| Ending reasons  | { Every Faction Defeated }             |
| Ending turn     | 150                                    |
| Panic           | 100                                    |
| Money           | -10                                    |

Panic at the limit and Money below zero both held, and neither is recorded.

## Victory needs a Faction

This example exercises [Victory](#victory). It uses a test Game build that supplies no FactionArchetype, whose other GDRs
are the Bootstrap GDRs.

The Game build passes [Faction GDR validation](factions.md#faction-gdr-validation), so a Campaign is created with no
Faction. In the Advance turn ending turn 1, Panic is 0 and money is 500; "every Faction is Defeated" is vacuously true,
but the Campaign has no Faction, so Victory does not hold. Defeat does not hold either, so the Campaign has no Campaign
ending. The same Campaign ends in Defeat if Panic reaches 100 or money falls below zero, and never in Victory.

## Player actions never end a Campaign

This example exercises [Ending check step](#ending-check-step).

Initial state: Turn 5, money 500, Panic 20, an Agent on Standby. The player commits `assignAgents` to Training, and then
attempts `purchaseUpgrade` for an Upgrade costing 600. [Economy and Upgrades](economy-and-upgrades.md) rejects the
purchase, and money stays 500. After both actions, the Campaign ending is absent and Panic is 20, because Panic and the
Campaign ending change only in the Panic and Ending check steps of an Advance turn. Developer API queries and Player API
queries show the same absent Campaign ending.

## Rejected actions after a Campaign ending

This example exercises [After a Campaign ending](#after-a-campaign-ending) and
[Player-visible information](#player-visible-information).

Initial state: the Committed state after the Advance turn ending turn 12 in
[Panic is summed, clamped, and reaches Defeat](#panic-is-summed-clamped-and-reaches-defeat), i.e. Turn 13, Panic 100,
money 100, the Campaign ending Defeat, and the 4 surviving Agents In transit.

- `assignAgents` for one of the 4 Agents is rejected, and the error identifies that the Campaign has a Campaign ending,
  although that Agent also fails the precondition that it can be ordered. The Agent's Current assignment is unchanged.
- `advanceTurn()` is rejected. The turn number is still 13, Panic is still 100, and no Timeline entry or other Committed
  state is produced.
- A Developer API cheat action, e.g. `addMoney(100)` with Dev mode enabled, is rejected, and money is still 100.
- `getCampaignState()` of Player API returns Panic 100, the Panic limit 100, the Campaign ending Defeat, the Ending
  reasons { Panic at the limit }, and the Ending turn 12. The result is the same for the Session controller and an
  Autopilot AI, and `getReports()` keeps answering.
- The Campaign ending is never cleared: Panic does not fall, because no Panic reduction can be added without an Advance turn.

## Returning to a Committed state before the ending

This example exercises [After a Campaign ending](#after-a-campaign-ending). The Campaign is the one in
[Rejected actions after a Campaign ending](#rejected-actions-after-a-campaign-ending), and the Autosave limit is at least 1.

`session.timeline.undoToAutosave()` loads the Turn-end Autosave of Turn 12, which holds the Turn-end state in which
the Advance turn began: Turn 12, Panic 97, money 40, funding 0, the 4 Agents Deployed, and no Campaign ending. In that Committed state every Player action
is accepted again, subject to its own preconditions; the player may, e.g., reduce nothing and advance the turn again,
and the Ending check step decides the Campaign ending anew from the values of that Advance turn.

## Player-visible information

This example exercises [Player-visible information](#player-visible-information).

At campaign creation, `getCampaignState()` of Player API returns Panic 0, the Panic limit 100, no Campaign ending, an
empty set of Ending reasons, and no Ending turn. Panic is reported as 0, and the Campaign ending as absent, so the player
distinguishes a Campaign at Panic 0 from one that has finished. No query returns the Pending panic change, including
during the Advance turn that adds to it.

## GDR validation

This example exercises [Ending GDR validation](#ending-gdr-validation). Each row independently changes the Bootstrap
GDRs; the result is that the Game build is defective and no Campaign is created from it.

| Change                                               | Rule violated                |
| ---------------------------------------------------- | ---------------------------- |
| `endings` is removed                                 | One EndingParameters         |
| A second EndingParameters GDR `endings_alt` is added | One EndingParameters         |
| `defeat_at_panic_pct` is 0                           | The Panic limit is reachable |
| `defeat_at_panic_pct` is 101                         | The Panic limit is reachable |
| `defeat_at_panic_pct` is 99.5                        | The Panic limit is reachable |
| A property `panic_floor` is added to `endings`       | Exact properties             |

The unchanged Bootstrap GDRs satisfy all three rules: exactly one EndingParameters GDR exists, it has exactly the
property `defeat_at_panic_pct`, and that value is a whole number from 1 to 100. A `defeat_at_panic_pct` of 1 and one of 100 are both valid.
