# Factions

| Metadata    | Value                                                                                                                                  |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | FACTION                                                                                                                                |
| Family      | Mechanics                                                                                                                              |
| Status      | Draft                                                                                                                                  |
| Audience    | Engine designer, Content designer, AI designer, Implementer                                                                            |
| Owns        | What a Faction has, its creation, its escalation through Faction activity levels, Faction operation occurrence generation, and defeat. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                                                                         |

# Overview

This document defines what a [Faction](domain-model.md#glossary) has and does on its own: its State, how each initial
Faction is created, how a Faction escalates from one Faction activity level to the next, how it generates Faction
operation occurrences, the Defeated fact and what a Defeated Faction no longer does, which of these values are
Player-visible information, and the validation rules for the Game Data Records (GDRs) it reads.

It refines [Faction and Faction operation occurrences](domain-model.md#faction-and-faction-operation-occurrences) in
Domain Model, which defines what a Faction and a Faction operation occurrence are and how a Faction operation
occurrence relates a Faction to its [Response Mission site](domain-model.md#glossary), with the properties and rules
listed above. It reads only the three GDR Types it owns, FactionArchetype, FactionActivityLevel, and
FactionOperationLevel. [Numbers](../foundation/numbers.md) supplies whole-number arithmetic and the arithmetic of
probabilities; this document owns the distributions of its own random outcomes. Domain Model, which it refines, is the
only Mechanics specification it depends on.

This document does not own, e.g.:

- The Response Mission site a Faction operation occurrence creates: the MissionSiteArchetype it is created from, its
  creation, its lifecycle, and its consequences belong to [Missions](missions.md).
- What causes a Faction to become Defeated: the Mission site consequence that defeats a Faction belongs to
  [Missions](missions.md).
- When Faction activity happens relative to the rest of Advance turn: [Turn Advancement](turn-advancement.md) owns the
  order of every Turn advancement step.

These are ownership pointers; this document relies on none of them.

The following features are out of scope and are not specified here: Faction suppression, Faction discovery, dormant
Faction activity levels from which a Faction carries out no operations, and avoiding a repeat of a Faction's previous
operation. The list is exhaustive: it names every deferred feature that would change a rule of this document. With them
out of scope, every Faction is known to the player from campaign creation, and nothing slows a
Faction's escalation or its operations except becoming Defeated.

# Relationships

- Uses [Core Concepts](../foundation/core-concepts.md)
- Uses [Engine Contract](../foundation/engine-contract.md)
- Uses [Numbers](../foundation/numbers.md)
- Refines [Domain Model](domain-model.md)
- Used by [Leads and Progression](./leads-and-progression.md)
- Used by [Missions](./missions.md)
- Used by [Panic and Endings](./panic-and-endings.md)
- Used by [Turn Advancement](./turn-advancement.md)
- Refined by [Missions](./missions.md)

# Glossary

Faction, Faction operation occurrence, Mission site, Initiative Mission site, Response Mission site, and Report are
defined by the [Domain Model glossary](domain-model.md#glossary). Campaign instance, Instance ID, Archetype, Constants,
State, and World history are defined by the [Campaign State glossary](../foundation/campaign-state.md#glossary). GDR,
Game build, Derived value, and Authoritative value are defined by the
[Core Concepts glossary](../foundation/core-concepts.md#glossary). Player-visible information, Player action, Committed
state, Turn, Session controller, Autopilot AI, Player API, and Developer API are defined by the
[Engine Contract glossary](../foundation/engine-contract.md#glossary). Probability is defined by the
[Numbers glossary](../foundation/numbers.md#glossary). Turn advancement step is defined by the
[Turn Advancement glossary](turn-advancement.md#glossary). The Mission site states, e.g. Active and Won, are defined by
[Missions](missions.md), and Campaign ending by [Panic and Endings](panic-and-endings.md).

| Term                    | Definition                                                                                                                                |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Faction activity level  | How aggressively a Faction currently acts: how often it carries out operations and how severe they are.                                   |
| Faction operation level | How severe one Faction operation occurrence is; it decides the rewards and penalties of the Response Mission site the occurrence creates. |

# Faction GDRs

This document owns the following three GDR Types and states which rule reads each property. A rule in this document
names the property it reads and never copies a GDR value; only the [Acceptance examples](#acceptance-examples) show
values. The GDRs a Game build supplies, and their values, are listed by [Bootstrap GDRs](../content/bootstrap-gdrs.md)
and the YAML files it names.

## FactionArchetype

A FactionArchetype is the Archetype of one Faction. The following property table is exhaustive apart from the `id` and
`type` that every GDR has.

| Property                 | Meaning                                                          | Read by                                                   |
| ------------------------ | ---------------------------------------------------------------- | --------------------------------------------------------- |
| `name`                   | The Faction's display name.                                      | [Player-visible information](#player-visible-information) |
| `initial_activity_level` | A reference to the FactionActivityLevel a new Faction starts at. | [Initial Factions](#initial-factions)                     |

## FactionActivityLevel

A FactionActivityLevel describes one Faction activity level. It is shared by every Faction at that level. The
following property table is exhaustive apart from `id` and `type`.

| Property                  | Meaning                                                                                                                                                                                                        | Read by                                                   |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `name`                    | The level's display name.                                                                                                                                                                                      | [Player-visible information](#player-visible-information) |
| `lasts_turns`             | Either a pair `[lo, hi]` of whole numbers of Advance turns, the inclusive range of how long a Faction stays at this level, or `null` for a final level, at which a Faction stays for the rest of the Campaign. | [Level duration](#level-duration)                         |
| `operation_every_turns`   | A pair `[lo, hi]` of whole numbers of Advance turns: the inclusive range of the interval between two Faction operation occurrences of a Faction at this level.                                                 | [Operation interval](#operation-interval)                 |
| `operation_level_weights` | A map from the `level` of a FactionOperationLevel to a whole-number weight: how often a Faction operation occurrence of a Faction at this level has each Faction operation level, relative to the others.      | [Operation level](#operation-level)                       |
| `next`                    | A reference to the FactionActivityLevel a Faction moves to when its time at this level ends, or `null` for a final level.                                                                                      | [Escalation](#escalation)                                 |

## FactionOperationLevel

A FactionOperationLevel describes one Faction operation level. The following property table is exhaustive apart from
`id` and `type`.

| Property             | Meaning                                                                                                                                                                                             | Read by                                                                                                                                 |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `level`              | The Faction operation level as a whole number; it is the key that `operation_level_weights` uses, and the value that the MissionSiteArchetype property `operation_level`, owned by Missions, names. | [Operation level](#operation-level); [Missions](missions.md), which owns how a Response Mission site's MissionSiteArchetype is selected |
| `name`               | The level's display name.                                                                                                                                                                           | [Player-visible information](#player-visible-information)                                                                               |
| `on_win`             | What the Agency gains when a Response Mission site of this level is Won.                                                                                                                            | [Missions](missions.md), which owns its meaning                                                                                         |
| `on_ignored_or_lost` | What changes when a Response Mission site of this level is Expired or Lost.                                                                                                                         | [Missions](missions.md), which owns its meaning                                                                                         |

## Faction GDR validation

**Proposed rule:** The GDRs a Game build supplies must satisfy every rule below. The list is exhaustive for the GDRs
this document reads. A Game build whose GDRs violate one of these rules is defective: no Campaign is created from it,
and the violation is reported as a data defect, never repaired into different gameplay, under
[Committed state integrity](../foundation/engine-contract.md#committed-state-integrity) in Engine Contract.

1. **Known properties:** Each FactionArchetype, FactionActivityLevel, and FactionOperationLevel has every property its
   table above lists and no property other than those, apart from `id` and `type`. Each `name` is non-empty text. The
   content of a FactionOperationLevel's `on_win` and `on_ignored_or_lost` is validated by
   [MissionSiteArchetype validation](missions.md#missionsitearchetype-validation) in Missions, which owns their meaning.
2. **Initial level resolves:** Every FactionArchetype's `initial_activity_level` references a FactionActivityLevel the
   Game build supplies.
3. **Ranges are valid:** Every FactionActivityLevel's `operation_every_turns`, and its `lasts_turns` when that is not
   `null`, is a pair `[lo, hi]` of whole numbers with `1 ≤ lo ≤ hi`.
4. **Final levels agree:** A FactionActivityLevel's `lasts_turns` is `null` exactly when its `next` is `null`.
5. **Next resolves:** Every `next` that is not `null` references a FactionActivityLevel the Game build supplies.
6. **The chain ends:** Following `next` from any FactionActivityLevel reaches a FactionActivityLevel whose `next` is
   `null` without visiting any FactionActivityLevel twice. A `next` chain with a cycle, including a level whose `next`
   is itself, is invalid.
7. **Operation levels are distinct:** Every FactionOperationLevel's `level` is a whole number of at least 1, and no two
   FactionOperationLevels have the same `level`.
8. **Weights are valid:** Every FactionActivityLevel's `operation_level_weights` has at least one key. Each key equals
   the `level` of a FactionOperationLevel the Game build supplies, and each weight is a whole number of at least 1.

These rules guarantee that every uniform whole-number outcome below has a valid range and that every Faction operation
occurrence has a Faction operation level. That a Response Mission site can be created for every Faction operation level
a Faction can have is a validation rule of [Missions](missions.md). A FactionActivityLevel that no
FactionArchetype's `initial_activity_level` and no `next` reaches is valid; it is never used.

# Faction State

**Proposed rule:** A Faction is a Campaign instance whose Archetype is a FactionArchetype. Its Archetype reference is
set when it is created and never changes. Its Constants are empty: everything fixed about a Faction is supplied by its
FactionArchetype. Its State has exactly the following properties. This table is exhaustive.

| Property                       | Value                                                                                                        | Classification and range                                                                                                                                                                   |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Faction activity level         | A Mutable reference to the FactionActivityLevel the Faction is currently at.                                 | Authoritative value. Always resolves to a FactionActivityLevel the Game build supplies.                                                                                                    |
| Turns until the next level     | The number of Advance turns left before the Faction moves to its Faction activity level's `next`, or absent. | Authoritative value. A whole number, under [Whole-number quantities](../foundation/numbers.md#whole-number-quantities). Absent exactly when the Faction activity level's `next` is `null`. |
| Turns until the next operation | The number of Advance turns left before the Faction's next Faction operation occurrence.                     | Authoritative value. A whole number. Always present.                                                                                                                                       |
| Defeated                       | Whether the Faction is Defeated: no or yes.                                                                  | Authoritative value. Starts as no and changes only under [Defeat](#defeat).                                                                                                                |
| Defeated turn                  | The turn number of the Turn whose Advance turn made the Faction Defeated, or absent.                         | Authoritative value. A whole number of at least 1. Absent exactly when Defeated is no.                                                                                                     |

**Range invariant:** In every Committed state, for every Faction whose Defeated is no, Turns until the next operation is
at least 1, and Turns until the next level is at least 1 whenever it is present. The rules under
[Escalation](#escalation) and [Faction operation occurrence generation](#faction-operation-occurrence-generation)
maintain this: a countdown that reaches zero takes, within the same Turn advancement step, the value of a
[Level duration](#level-duration) or [Operation interval](#operation-interval) outcome, which is at least 1. For a Faction whose Defeated is yes, both countdowns keep the values they had when it became Defeated
and are never read again.

A Faction's name is not a State property: it is the `name` of its FactionArchetype. A Faction has no Turn series.

**Retention:** A Faction participates in current gameplay for the whole Campaign, including after it is Defeated, and
keeps every property above, so that every reference to it, e.g. a Mission site's target Faction, resolves, under
[Historical fact preservation](../foundation/campaign-state.md#historical-fact-preservation) in Campaign State. No
Faction is ever removed.

# Initial Factions

**Proposed rule:** The initial Campaign state contains exactly one Faction for each FactionArchetype the Game build
supplies, and no other Faction, as [Initial Campaign state](domain-model.md#initial-campaign-state) in Domain Model
requires. No Faction is created after campaign creation. Each initial Faction has a fresh Instance ID under
[Campaign instance identity scope](domain-model.md#campaign-instance-identity-scope) in Domain Model, and the following
initial values, under [Campaign instance creation](../foundation/campaign-state.md#campaign-instance-creation) in
Campaign State. This table is exhaustive.

| Value                          | Initial value                                                                                                                            | Source                                                       |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Archetype reference            | The FactionArchetype.                                                                                                                    | The FactionArchetype GDR.                                    |
| Constants                      | Empty.                                                                                                                                   | None.                                                        |
| Faction activity level         | The FactionActivityLevel that the FactionArchetype's `initial_activity_level` references.                                                | `initial_activity_level` of the FactionArchetype.            |
| Turns until the next level     | The Faction's initial [Level duration](#level-duration) outcome when that level's `lasts_turns` is not `null`; absent when it is `null`. | `lasts_turns` of the initial FactionActivityLevel.           |
| Turns until the next operation | The Faction's initial [Operation interval](#operation-interval) outcome.                                                                 | `operation_every_turns` of the initial FactionActivityLevel. |
| Defeated                       | No.                                                                                                                                      | This rule.                                                   |
| Defeated turn                  | Absent.                                                                                                                                  | This rule.                                                   |

No Campaign configuration value adds, removes, or changes an initial Faction or any of its initial values.

# Faction random outcomes

Every random outcome of this document is one of the three named random outcomes below. Each Faction has its own
outcomes: no outcome is shared between two Factions or between two occasions, and no outcome depends on another
Faction. The distribution of each outcome depends only on the GDRs its rule names. One dependency links outcomes of the
same Faction: which Faction activity level an Operation level or Operation interval outcome reads depends on whether
the Faction has escalated, and so on the Faction's earlier Level duration outcomes, which decide when it escalates.
Given that Faction activity level, no outcome depends on the value of any other outcome. Each Probability below is exact
and is never rounded, under [Probabilities](../foundation/numbers.md#probabilities) in Numbers.

## Level duration

A Level duration outcome belongs to one Faction and one occasion on which that Faction enters a Faction activity level
whose `lasts_turns` is not `null`: its creation under [Initial Factions](#initial-factions), or one move under
[Escalation](#escalation). It is a uniform whole-number outcome over `lasts_turns` of the level entered, from `lo` to
`hi`, under [Uniform whole-number outcomes](../foundation/numbers.md#uniform-whole-number-outcomes): each of the
`hi − lo + 1` values has Probability `1 / (hi − lo + 1)`. It depends only on that level's `lasts_turns`. No Level
duration outcome exists when the level entered has `lasts_turns` of `null`.

## Operation interval

An Operation interval outcome belongs to one Faction and one occasion: its creation under
[Initial Factions](#initial-factions), or one Faction operation occurrence under
[Faction operation occurrence generation](#faction-operation-occurrence-generation). It is a uniform whole-number
outcome over `operation_every_turns` of the Faction activity level the Faction is at on that occasion, from `lo` to
`hi`. It depends only on that level's `operation_every_turns`.

## Operation level

An Operation level outcome belongs to one Faction operation occurrence. Its possible values are the keys of
`operation_level_weights` of the Faction activity level the Faction is at when the occurrence happens. Its distribution
is a weighted choice: the Probability of each key `k` is `w(k) / W`, where `w(k)` is the weight of `k` and `W` is the
sum of all weights of that `operation_level_weights`. `W` is at least 1 under
[Faction GDR validation](#faction-gdr-validation), so the Probabilities are defined, each lies from 0 to 1, and together
they sum to 1. The outcome depends only on that level's `operation_level_weights`.

# Faction activity

**Proposed rule:** During each Advance turn, in the Turn advancement step Faction activity under
[Turn advancement steps](turn-advancement.md#turn-advancement-steps) in Turn Advancement, every Faction whose Defeated
is no applies [Escalation](#escalation) and then
[Faction operation occurrence generation](#faction-operation-occurrence-generation), in that order. A Faction whose
Defeated is yes applies neither; nothing about it changes in this step. The following pseudocode states the complete
rule for one Faction F whose Defeated is no; "level" means F's Faction activity level at the moment it is read:

```text
if Turns until the next level is present:
    Turns until the next level = Turns until the next level − 1
    if Turns until the next level = 0:
        Faction activity level = next of level
        if lasts_turns of the new level is null:
            Turns until the next level becomes absent
        else:
            Turns until the next level = F's Level duration outcome for this move
Turns until the next operation = Turns until the next operation − 1
if Turns until the next operation = 0:
    one Faction operation occurrence of F happens, using the level F is now at
    Turns until the next operation = F's Operation interval outcome for this occurrence,
                                     over the level F is now at
```

Every subtraction and assignment above produces a whole number, so no rounding occurs. A Faction moves at most one
Faction activity level and has at most one Faction operation occurrence in one Advance turn.

**Within one Faction:** The operation part of the rule uses the Faction activity level after the escalation part of the
same Faction in the same step, so a Faction that moves to a new level in this step already uses the new level's
`operation_level_weights` and `operation_every_turns` for an occurrence in this step. A change of Faction activity
level never resets or otherwise changes Turns until the next operation; only the subtraction of one and a
Faction operation occurrence change it.

**Several Factions:** Each Faction's rule reads and changes only that Faction's own State, its own random outcomes, and
GDRs. No Faction's rule depends on another Faction, so the result of the step is the same whichever order an
implementation processes the Factions in, and no order is specified, under
[Values a step uses](turn-advancement.md#values-a-step-uses) in Turn Advancement. Each Faction whose Turns until the next
operation reaches zero has its own Faction operation occurrence and creates its own Response Mission site; several
Factions can therefore create several Response Mission sites in one Advance turn.

Whether this step applies to a Faction is decided by its Defeated as it is when the step begins, i.e. after the
step Mission resolution under [Turn advancement steps](turn-advancement.md#turn-advancement-steps), so a Faction made Defeated earlier in the same Advance
turn neither escalates nor operates in it.

## Escalation

Escalation is the escalation part of the rule under [Faction activity](#faction-activity): a Faction whose Turns until
the next level is present counts it down by one, and when it reaches zero the Faction moves to its current Faction
activity level's `next`. On the move, Turns until the next level becomes the Faction's [Level duration](#level-duration)
outcome for this move when the new level's `lasts_turns` is not `null`, and becomes absent when it is `null`.

A Faction at a final level, i.e. one whose `next` is `null`, has no Turns until the next level and never escalates
again. Under [Faction GDR validation](#faction-gdr-validation) every Faction reaches a final level after finitely many
moves and stays at it for the rest of the Campaign. A Faction never moves to an earlier or lower Faction activity level.

# Faction operation occurrence generation

**Proposed rule:** A Faction operation occurrence of a Faction F happens exactly when F's Turns until the next operation
reaches zero under [Faction activity](#faction-activity). It has the following complete effects, all in the Faction
activity step of the same Advance turn:

1. F's [Operation level](#operation-level) outcome for this occurrence takes a value, a key of the
   `operation_level_weights` of the Faction activity level F is at after [Escalation](#escalation) in this step. The
   occurrence's Faction operation level is the FactionOperationLevel whose `level` equals that value.
2. The occurrence has the following facts, and this list is exhaustive:
   - its initiating Faction, F;
   - its Faction operation level, under item 1;
   - its turn number: the turn number of the Turn whose Advance turn it happens in.

   [Missions](missions.md) creates exactly one Response Mission site from these facts, under
   [Mission site creation](missions.md#mission-site-creation) in Missions, which owns which MissionSiteArchetype it is
   created from.

3. F's Turns until the next operation takes the value of F's [Operation interval](#operation-interval) outcome for this
   occurrence, over the `operation_every_turns` of the Faction activity level F is at after Escalation in this step.

[Faction and Faction operation occurrences](domain-model.md#faction-and-faction-operation-occurrences) in Domain Model
owns that a Faction operation occurrence is not a separate Campaign instance and that the Response Mission site retains
these facts, and [Mission site kind and provenance](domain-model.md#mission-site-kind-and-provenance) owns that each
Faction operation occurrence creates exactly one Response Mission site. [Missions](missions.md) owns everything else
about the Response Mission site: its MissionSiteArchetype, its Instance ID, its other initial values, its Enemies, its
lifecycle, and its consequences. [Turn Advancement](turn-advancement.md) owns that a
Response Mission site created in this step does not count down toward expiry in the same Advance turn, because Mission
site expiration precedes Faction activity under [Turn advancement steps](turn-advancement.md#turn-advancement-steps).

A Faction operation occurrence does not depend on any existing Mission site. In particular, an Active Response Mission
site of the same Faction, including one of the same Faction operation level, neither prevents nor delays a new
occurrence, and consecutive occurrences may have the same Faction operation level.

**Informative rationale:** game-ts also escalated Factions through activity levels and drew operations from per-level
frequencies and severity weights. This document keeps that structure in a reduced form and states it as a Proposed
rule; the game-ts values and its avoidance of repeated operations are not carried over.

# Defeat

**Proposed rule:** Defeated is a permanent fact of a Faction. It changes exactly once at most, from no to yes, and
never back. This document defines the effect of making a Faction Defeated; [Missions](missions.md) owns the Mission
site consequence that applies it. No other rule makes a Faction Defeated.

Making a Faction F Defeated during an Advance turn has the following complete effects on F, applied at once:

- Defeated becomes yes.
- Defeated turn becomes the turn number of the Turn that this Advance turn ends.
- Faction activity level, Turns until the next level, and Turns until the next operation keep their current values.

When the effect is applied to a Faction whose Defeated is already yes, nothing changes; in particular, its Defeated
turn keeps its first value.

The following table states every change of Defeated. Every change not listed, e.g. from yes to no, is impossible.

| From | To  | Trigger                                                                          | Condition |
| ---- | --- | -------------------------------------------------------------------------------- | --------- |
| No   | Yes | A Mission site consequence owned by [Missions](missions.md) defeats the Faction. | None.     |

A Faction whose Defeated is yes no longer does any of the following; the list is exhaustive for this document's rules:

- It no longer escalates: [Escalation](#escalation) does not apply to it.
- It no longer carries out operations: no Faction operation occurrence of it happens, so it creates no further Response
  Mission site.

What becomes of Mission sites that target a Defeated Faction belongs to [Missions](missions.md), and whether a Lead of a
Defeated Faction is available belongs to [Leads and Progression](leads-and-progression.md). Whether every Faction being
Defeated ends the Campaign belongs to [Panic and Endings](panic-and-endings.md).

# Player-visible information

**Proposed rule:** The following table states, for every value this document owns, whether it is Player-visible
information under [Player queries and actions](../foundation/engine-contract.md#player-queries-and-actions) in Engine
Contract. It is exhaustive. Each Player-visible value is visible from campaign creation, without a reveal condition,
for every Faction, whether or not it is Defeated.

| Value                                                                                                                                                                            | Player-visible information                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| A Faction's Instance ID and its FactionArchetype, including the FactionArchetype's `name`                                                                                        | Yes                                                                                                    |
| A Faction's Faction activity level, including every property of that FactionActivityLevel: `name`, `lasts_turns`, `operation_every_turns`, `operation_level_weights`, and `next` | Yes                                                                                                    |
| Every FactionOperationLevel's `level` and `name`                                                                                                                                 | Yes                                                                                                    |
| A Faction's Defeated and Defeated turn                                                                                                                                           | Yes                                                                                                    |
| A Faction's Turns until the next level                                                                                                                                           | No                                                                                                     |
| A Faction's Turns until the next operation                                                                                                                                       | No                                                                                                     |
| The value of every Level duration outcome and every Operation interval outcome                                                                                                   | No                                                                                                     |
| The initiating Faction, Faction operation level, and turn number of each Faction operation occurrence                                                                            | Yes, once the occurrence has happened, through its Response Mission site under [Missions](missions.md) |

**Hidden versus absent:** Player API returns no property for either countdown of any Faction. It never reports a
hidden countdown as zero, as empty, or as absent, and it reports nothing that distinguishes a present Turns until the
next level from an absent one. The player tells a final Faction activity level, at which Turns until the next level is
absent, from the visible `next` of that level being `null`, never from the countdown. Defeated turn is never hidden:
when Player API reports it as absent, the Faction is not Defeated.

Under [Information boundary](../foundation/engine-contract.md#information-boundary) in Engine Contract, no channel of
Player API reveals either countdown, e.g. neither a validation error nor a Report states how many Advance turns remain
before a Faction moves to its next level or carries out its next operation. That a Faction operation occurrence has
happened is visible through its Response Mission site, and that a Faction has moved to a new level is visible through
its Faction activity level; neither reveals the new value of either countdown. The countdowns are available only through
Developer API.

# Edge cases and failure behavior

- **Both countdowns reach zero in the same Advance turn:** The Faction moves to its next level, and Turns until the next
  level takes the value of its Level duration outcome over the new level; its Faction operation occurrence uses the new
  level's `operation_level_weights`, and Turns until the next operation takes the value of its Operation interval
  outcome over the new level's `operation_every_turns` ([Faction activity](#faction-activity)).
- **Move to a final level:** Turns until the next level becomes absent and no Level duration outcome exists for that
  move. Turns until the next operation is unchanged by the move ([Escalation](#escalation)).
- **At a final level:** The Faction never escalates again; Faction operation occurrences continue for as long as it is
  not Defeated ([Escalation](#escalation)).
- **Level duration or Operation interval at its lower bound:** An outcome value of `lo` is valid. Because `lo` is at
  least 1, the countdown is never set to zero, and an occurrence or move happens in the `lo`-th Advance turn after the
  one that set the countdown ([Faction GDR validation](#faction-gdr-validation), [Faction State](#faction-state)).
- **Defeated earlier in the same Advance turn:** A Faction made Defeated in Mission resolution does not apply Faction
  activity in the same Advance turn, even if a countdown of it would have reached zero ([Faction activity](#faction-activity)).
- **Defeated twice:** Applying the effect of [Defeat](#defeat) to a Faction that is already Defeated changes nothing.
- **Existing Response Mission sites:** An Active or Deployed Response Mission site of the same Faction does not affect a
  new occurrence, and the same Faction operation level may occur again
  ([Faction operation occurrence generation](#faction-operation-occurrence-generation)).
- **Several Factions:** Each Faction applies Faction activity independently; several Faction operation occurrences, one
  per Faction, may happen in one Advance turn ([Faction activity](#faction-activity)).
- **No FactionArchetype:** A Game build that supplies no FactionArchetype passes [Faction GDR validation](#faction-gdr-validation);
  the initial Campaign state then contains no Faction and the Faction activity step does nothing. What that means for
  the Campaign ending belongs to [Panic and Endings](panic-and-endings.md).
- **Unknown property, cyclic `next` chain, or unresolved reference:** These cannot occur in a Campaign,
  because a Game build containing them fails [Faction GDR validation](#faction-gdr-validation) and no Campaign is created
  from it. A Committed state violating the range invariant under [Faction State](#faction-state), e.g. a Faction that is
  not Defeated with Turns until the next operation of 0, is an internal invariant violation, reported under
  [Committed state integrity](../foundation/engine-contract.md#committed-state-integrity) in Engine Contract.
- **Campaign ended:** Once the Campaign has a Campaign ending, Advance turn is rejected, so no further Faction activity
  applies; [Panic and Endings](panic-and-endings.md) owns that rejection.

# Acceptance examples

All examples use the Bootstrap GDR values from `content/factions/faction_archetypes.yaml`,
`content/factions/faction_activity_levels.yaml`, and `content/factions/faction_operation_levels.yaml`, unless an example
states a test GDR. The values they read are:

| GDR                 | Values read                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------------- |
| `red_dawn`          | `name` Red Dawn; `initial_activity_level` `faint`                                                             |
| `faint`             | `name` Faint; `lasts_turns` [60, 90]; `operation_every_turns` [15, 25]; weights 1: 80, 2: 20; `next` `active` |
| `active`            | `name` Active; `lasts_turns` [60, 90]; `operation_every_turns` [11, 21]; weights 1: 40, 2: 60; `next` `war`   |
| `war`               | `name` War; `lasts_turns` null; `operation_every_turns` [8, 18]; weights 1: 20, 2: 80; `next` null            |
| `operation_level_1` | `level` 1; `name` Soft operations                                                                             |
| `operation_level_2` | `level` 2; `name` Violent but small-scale                                                                     |

The Response Mission site each Faction operation occurrence creates, and the MissionSiteArchetype it is created from,
are owned by [Missions](missions.md); e.g., with the Bootstrap GDRs, under
[MissionSiteArchetype selection](missions.md#missionsitearchetype-selection) in Missions, an occurrence of Faction
operation level 1 creates a Response Mission site from `foil_recruitment_push`, and one of level 2 from `foil_sabotage`.
The examples name those Mission sites only to show when they are created. "The Advance turn ending turn t" is the
Advance turn committed during Turn t; the Campaign starts in Turn 1. In every example, Red Dawn is not
Defeated unless the example says otherwise.

## Campaign creation through the first escalation

This example exercises [Initial Factions](#initial-factions), [Level duration](#level-duration),
[Operation interval](#operation-interval), [Operation level](#operation-level), [Faction activity](#faction-activity),
[Escalation](#escalation), and [Faction operation occurrence generation](#faction-operation-occurrence-generation).

**Campaign creation.** The Game build supplies one FactionArchetype, `red_dawn`, so the initial Campaign state contains
exactly one Faction, Red Dawn. Injected outcomes: Red Dawn's initial Level duration outcome is 60, a uniform
whole-number outcome over 60 to 90 in which each of 31 values has Probability 1 / 31; its initial Operation interval
outcome is 15, a uniform whole-number outcome over 15 to 25 in which each of 11 values has Probability 1 / 11.

| Value                          | After campaign creation |
| ------------------------------ | ----------------------- |
| Faction activity level         | `faint`                 |
| Turns until the next level     | 60                      |
| Turns until the next operation | 15                      |
| Defeated                       | No                      |
| Defeated turn                  | Absent                  |

**Advance turns ending turns 1 to 14.** Each Advance turn subtracts one from each countdown and neither reaches zero.
After the Advance turn ending turn 14, Turns until the next level is 46 and Turns until the next operation is 1.

**First operation, Advance turn ending turn 15.** Turns until the next level becomes 45. Turns until the next operation
becomes 0, so one Faction operation occurrence happens at `faint`. Injected outcomes: Operation level 1, with
Probability 80 / 100; Operation interval 25, with Probability 1 / 11 over 15 to 25. Result: the occurrence has
initiating Faction Red Dawn, Faction operation level `operation_level_1`, and turn number 15, and Missions creates one
Response Mission site from it, e.g. from `foil_recruitment_push`; Turns until the next operation is 25.

**Second operation, Advance turn ending turn 40.** The 25 Advance turns ending turns 16 to 40 bring Turns until the next
operation from 25 to 0 and Turns until the next level from 45 to 20. One Faction operation occurrence happens at
`faint`. Injected outcomes: Operation level 2, with Probability 20 / 100; Operation interval 20, with Probability
1 / 11. Result: the occurrence has Faction operation level `operation_level_2` and turn number 40, and Missions creates
a second Response Mission site from it, e.g. from `foil_sabotage`, whether or not the first one is still Active; Turns
until the next operation is 20.

**First escalation and third operation, Advance turn ending turn 60.** The Advance turns ending turns 41 to 59 bring
Turns until the next level to 1 and Turns until the next operation to 1. In the Advance turn ending turn 60:

1. Turns until the next level becomes 0, so Red Dawn moves to `faint`'s `next`, `active`. `active`'s `lasts_turns` is
   not null; injected Level duration outcome 90, with Probability 1 / 31 over 60 to 90. Turns until the next level is 90.
2. Turns until the next operation becomes 0, so one Faction operation occurrence happens at `active`, the level Red Dawn
   is now at. Injected outcomes: Operation level 2, with Probability 60 / 100 under `active`'s weights, not 20 / 100
   under `faint`'s; Operation interval 11, over `active`'s 11 to 21, with Probability 1 / 11. Missions creates a
   Response Mission site of Faction operation level `operation_level_2`, e.g. from `foil_sabotage`.

| Value                          | After the Advance turn ending turn 60 |
| ------------------------------ | ------------------------------------- |
| Faction activity level         | `active`                              |
| Turns until the next level     | 90                                    |
| Turns until the next operation | 11                                    |

Three Response Mission sites have been created in total, in the Advance turns ending turns 15, 40, and 60. None of
them counted down toward expiry in the Advance turn that created it, which [Turn Advancement](turn-advancement.md) owns.

## A level change does not reset the operation countdown

This example exercises [Faction activity](#faction-activity) and [Escalation](#escalation).

Initial state: Red Dawn is at `active` with Turns until the next level 1 and Turns until the next operation 5. In the
next Advance turn, Turns until the next level becomes 0 and Red Dawn moves to `war`. `war`'s `lasts_turns` is null, so
no Level duration outcome exists and Turns until the next level becomes absent. Turns until the next operation becomes
4: the move neither resets it nor gives it a new outcome value, and no Faction operation occurrence happens. In each of the next four
Advance turns no further escalation happens; in the fourth, Turns until the next operation reaches 0 and the occurrence
uses `war`'s weights, so Operation level 1 has Probability 20 / 100 and Operation level 2 has Probability 80 / 100, and
its Operation interval outcome is over 8 to 18.

## Operations at the final level

This example exercises [Escalation](#escalation), [Operation level](#operation-level), and
[Operation interval](#operation-interval).

Initial state: Red Dawn is at `war`, Turns until the next level is absent, and Turns until the next operation is 1. In
the next Advance turn, nothing escalates and an occurrence happens. Injected outcomes: Operation level 1, with
Probability 20 / 100; Operation interval 8, the lower bound, with Probability 1 / 11. Result: one occurrence of
Faction operation level `operation_level_1`, from which Missions creates one Response Mission site, e.g. from
`foil_recruitment_push`; Red Dawn stays at `war`;
Turns until the next operation is 8, so the next occurrence happens in the eighth Advance turn after this one. With an
injected Operation interval of 18, the upper bound, it would happen in the eighteenth.

## Defeat stops escalation and operations

This example exercises [Defeat](#defeat) and [Faction activity](#faction-activity).

Initial state: during Turn 120, Red Dawn is at `active` with Turns until the next level 1 and Turns until the next
operation 1. In the Advance turn ending turn 120, a Mission site consequence owned by [Missions](missions.md) makes Red
Dawn Defeated in Mission resolution. Result after that Advance turn: Defeated is yes; Defeated turn is 120; Faction
activity level is still `active`; Turns until the next level is still 1 and Turns until the next operation is still 1,
because Faction activity did not apply to Red Dawn; no Faction operation occurrence happened and no Response Mission
site was created. Had the Campaign continued, no later Advance turn would change any of these values. Applying the
defeat effect to Red Dawn again would leave Defeated turn at 120.

## Several Factions

This example exercises [Initial Factions](#initial-factions) and [Faction activity](#faction-activity). It uses a test
FactionArchetype `test_faction` with `name` Test Faction and `initial_activity_level` `active`, supplied alongside
`red_dawn`.

At campaign creation the initial Campaign state contains exactly two Factions, Red Dawn at `faint` and Test Faction at
`active`. Injected outcomes: Red Dawn's initial Level duration 70 and Operation interval 15; Test Faction's initial
Level duration 60 and Operation interval 15 over `active`'s 11 to 21. In the Advance turn ending turn 15, both Factions'
Turns until the next operation reach 0, and two Faction operation occurrences happen. Injected outcomes: Red Dawn's
Operation level 1 with Probability 80 / 100 and Operation interval 20; Test Faction's Operation level 2 with Probability
60 / 100 and Operation interval 11. Result: two Faction operation occurrences, one of Faction operation level
`operation_level_1` with initiating Faction Red Dawn and one of `operation_level_2` with initiating Faction Test
Faction, from which Missions creates two Response Mission sites, e.g. from `foil_recruitment_push` and from
`foil_sabotage`; Red Dawn's Turns until the next
operation is 20 and Test Faction's is 11. Processing Test Faction before Red Dawn gives the same Committed state.

## Player-visible information

This example exercises [Player-visible information](#player-visible-information).

In the Committed state after the Advance turn ending turn 15 in
[Campaign creation through the first escalation](#campaign-creation-through-the-first-escalation), a Player API query
of Factions returns, for Red Dawn: its Instance ID; FactionArchetype `red_dawn` with name Red Dawn; Faction activity
level `faint` with name Faint, `lasts_turns` [60, 90], `operation_every_turns` [15, 25], weights 1: 80 and 2: 20, and
`next` `active`; Defeated no; and Defeated turn absent. It returns no property for Turns until the next level, 45, or
Turns until the next operation, 25, and the result is the same for the Session controller and an Autopilot AI. After
Red Dawn reaches `war`, the query shows `next` null, from which the player knows that Red Dawn will not escalate
further, while the absent Turns until the next level is still not returned.

## GDR validation

This example exercises [Faction GDR validation](#faction-gdr-validation). Each row independently changes the Bootstrap
GDRs; the result is that the Game build is defective and no Campaign is created from it.

| Change                                                                    | Rule violated          |
| ------------------------------------------------------------------------- | ---------------------- |
| `war`'s `next` is `faint`, and its `lasts_turns` is [60, 90]              | The chain ends         |
| `faint`'s `operation_level_weights` gains the key 3 with weight 5         | Weights are valid      |
| `active`'s `lasts_turns` is null while its `next` is `war`                | Final levels agree     |
| `faint`'s `operation_every_turns` is [0, 25]                              | Ranges are valid       |
| `red_dawn`'s `initial_activity_level` is `dormant`, which is not supplied | Initial level resolves |
| `faint`'s weight for key 2 is 0                                           | Weights are valid      |
| `red_dawn` has a property `description`                                   | Known properties       |
| `war` has no `next` property                                              | Known properties       |

The unchanged Bootstrap GDRs satisfy every rule: every GDR has exactly the properties its table lists; the chain
`faint`, `active`, `war` ends at `war`; levels 1 and 2 each have one FactionOperationLevel; and every range has `lo` of
at least 1. Whether every Faction operation level has a MissionSiteArchetype to create a Response Mission site from is
checked by [MissionSiteArchetype validation](missions.md#missionsitearchetype-validation) in Missions.
