# Factions

| Metadata | Value |
| --- | --- |
| Spec ID | FACTION |
| Family | Mechanics |
| Audience | Engine designer, Content designer, AI designer, Implementer |
| Owns | What a Faction has, its creation, its escalation through Faction activity levels, Faction operation occurrence generation, and elimination. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

Factions are the pressure the [Agency](domain-model.md#agency-and-agents) works against: left alone, a [Faction](domain-model.md#factions) only grows more dangerous, and nothing but elimination stops it. A [Faction](domain-model.md#glossary) is an organization that opposes the Agency, and every Faction a [Campaign](../foundation/core-concepts.md#campaign-and-session) will ever have exists from its start.

A Faction's danger is its Faction activity level, which sets how often it acts and how severely. After a random number of Advance turns at one level, the Faction moves up to the next, until it reaches a final level, and it never moves back. At random intervals it carries out a [Faction operation occurrence](domain-model.md#factions), whose Faction operation level decides how much is at stake, and each occurrence creates one [Response Mission site](domain-model.md#leads-investigations-mission-sites-and-missions), the Agency's chance to stop it. A Faction that becomes Eliminated stops escalating and operating for the rest of the Campaign.

Factions builds on [Domain Model](domain-model.md): Domain Model says that Factions create Response Mission sites, and Factions says when they do and how severe each operation is.

# Glossary

These terms are specific to Factions. General terms are in the [Domain Model glossary](domain-model.md#glossary).

| Term | Definition | Prohibited synonyms |
| --- | --- | --- |
| Faction activity level | How aggressively a [Faction](domain-model.md#factions) currently acts: how often it carries out operations and how severe they are. |  |
| Faction operation level | How severe one [Faction operation occurrence](domain-model.md#factions) is; it decides the [Consequences](domain-model.md#leads-investigations-mission-sites-and-missions) of the [Response Mission site](domain-model.md#leads-investigations-mission-sites-and-missions) the occurrence creates. |  |

# Faction GDRs

Factions are described by three [Game Data Record](../foundation/core-concepts.md#game-build-and-content) (GDR) [Types](../foundation/core-concepts.md#data-modeling): FactionArchetype, FactionActivityLevel, and FactionOperationLevel. The GDRs a [Game build](../foundation/core-concepts.md#game-build-and-content) supplies, and their values, are listed by [Bootstrap GDRs](../content/bootstrap-gdrs.md#glossary) and the YAML files it names.

## FactionArchetype

A FactionArchetype is the [Archetype](../foundation/core-concepts.md#campaign-instances) of one Faction. This property table is exhaustive apart from the `id` and `type` that every GDR has.

| Property | Meaning | Read by |
| --- | --- | --- |
| `name` | The Faction's display name. | [Player-visible information](#player-visible-information) |
| `initial_activity_level` | A reference to the FactionActivityLevel a new Faction starts at. | [Initial Factions](#initial-factions) |

## FactionActivityLevel

A FactionActivityLevel describes one Faction activity level. It is shared by every Faction at that level. This property table is exhaustive apart from `id` and `type`.

| Property | Meaning | Read by |
| --- | --- | --- |
| `name` | The level's display name. | [Player-visible information](#player-visible-information) |
| `lasts_turns` | Either a pair `[lo, hi]` of whole numbers of Advance turns, the inclusive range of how long a Faction stays at this level, or `null` for a final level, at which a Faction stays for the rest of the [Campaign](../foundation/core-concepts.md#campaign-and-session). | [Level duration](#level-duration) |
| `operation_every_turns` | A pair `[lo, hi]` of whole numbers of Advance turns: the inclusive range of the interval between two Faction operation occurrences of a Faction at this level. | [Operation interval](#operation-interval) |
| `operation_level_weights` | A map from the `level` of a FactionOperationLevel to a whole-number weight: how often a Faction operation occurrence of a Faction at this level has each Faction operation level, relative to the others. | [Operation level](#operation-level) |
| `next` | A reference to the FactionActivityLevel a Faction moves to when its time at this level ends, or `null` for a final level. | [Escalation](#escalation) |

## FactionOperationLevel

A FactionOperationLevel describes one Faction operation level. This property table is exhaustive apart from `id` and `type`.

| Property | Meaning | Read by |
| --- | --- | --- |
| `level` | The Faction operation level as a whole number; it is the key that `operation_level_weights` uses, and the value that the MissionSiteArchetype property `operation_level` names. | [Operation level](#operation-level); [MissionSiteArchetype selection](missions.md#missionsitearchetype-selection) |
| `name` | The level's display name. | [Player-visible information](#player-visible-information) |
| `on_win` | An [Effect list](../foundation/effect-lists.md#glossary): what the [Agency](domain-model.md#agency-and-agents) gains when a [Response Mission](domain-model.md#leads-investigations-mission-sites-and-missions) at a site of this level is Won. | [Missions](missions.md) |
| `on_ignored_or_lost` | An Effect list: what changes when a Response Mission site of this level is Expired or its [Mission](domain-model.md#leads-investigations-mission-sites-and-missions) Lost. | [Missions](missions.md) |

## Faction GDR validation

**Proposed rule:** The GDRs a Game build supplies must satisfy every rule below. The list is exhaustive for the Faction GDRs. A Game build whose GDRs violate one of these rules is defective: no Campaign is created from it, and the violation is reported as a data defect, never repaired into different gameplay, under [World state integrity](../foundation/engine-contract.md#world-state-integrity) in Engine Contract.

1. **Known properties:** Each FactionArchetype, FactionActivityLevel, and FactionOperationLevel has every property its table above lists and no property other than those, apart from `id` and `type`. Each `name` is non-empty text. The content of a FactionOperationLevel's `on_win` and `on_ignored_or_lost` is validated by [MissionSiteArchetype validation](missions.md#missionsitearchetype-validation) in Missions.
2. **Initial level resolves:** Every FactionArchetype's `initial_activity_level` references a FactionActivityLevel the Game build supplies.
3. **Ranges are valid:** Every FactionActivityLevel's `operation_every_turns`, and its `lasts_turns` when that is not `null`, is a pair `[lo, hi]` of whole numbers with `1 ≤ lo ≤ hi`.
4. **Final levels agree:** A FactionActivityLevel's `lasts_turns` is `null` exactly when its `next` is `null`.
5. **Next resolves:** Every `next` that is not `null` references a FactionActivityLevel the Game build supplies.
6. **The chain ends:** Following `next` from any FactionActivityLevel reaches a FactionActivityLevel whose `next` is `null` without visiting any FactionActivityLevel twice. A `next` chain with a cycle, including a level whose `next` is itself, is invalid.
7. **Operation levels are distinct:** Every FactionOperationLevel's `level` is a whole number of at least 1, and no two FactionOperationLevels have the same `level`.
8. **Weights are valid:** Every FactionActivityLevel's `operation_level_weights` has at least one key. Each key equals the `level` of a FactionOperationLevel the Game build supplies, and each weight is a whole number of at least 1.

These rules guarantee that every uniform whole-number outcome below has a valid range and that every Faction operation occurrence has a Faction operation level. That a Response Mission site can be created for every Faction operation level a Faction can have is checked by [MissionSiteArchetype validation](missions.md#missionsitearchetype-validation). A FactionActivityLevel that no FactionArchetype's `initial_activity_level` and no `next` reaches is valid; it is never used.

# Faction State

**Proposed rule:** A Faction is a [Campaign instance](../foundation/core-concepts.md#campaign-instances) whose Archetype is a FactionArchetype. Its Archetype reference is set when it is created and never changes. Its [Constants](../foundation/core-concepts.md#campaign-instances) are empty: everything fixed about a Faction is supplied by its FactionArchetype. Its [State](../foundation/core-concepts.md#campaign-instances) has exactly the following properties. This table is exhaustive.

| Property | Value | Classification and range |
| --- | --- | --- |
| Faction activity level | A Mutable reference to the FactionActivityLevel the Faction is currently at. | [Authoritative value](../foundation/core-concepts.md#value-classification). Always resolves to a FactionActivityLevel the Game build supplies. |
| Turns until the next level | The number of Advance turns left before the Faction moves to its Faction activity level's `next`, or absent. | Authoritative value. A whole number, under [Whole-number quantities](../foundation/numbers.md#whole-number-quantities). Absent exactly when the Faction activity level's `next` is `null`. |
| Turns until the next operation | The number of Advance turns left before the Faction's next Faction operation occurrence. | Authoritative value. A whole number. Always present. |
| Eliminated | Whether the Faction is [Eliminated](domain-model.md#factions): no or yes. | Authoritative value. Starts as no and changes only under [Elimination](#elimination). |
| Eliminated turn | The turn number of the [Turn](../foundation/engine-contract.md#player-actions-and-turns) whose Advance turn made the Faction Eliminated, or absent. | Authoritative value. A whole number of at least 1. Absent exactly when Eliminated is no. |

**Range invariant:** In every [World state](../foundation/engine-contract.md#player-actions-and-turns), for every Faction whose Eliminated is no, Turns until the next operation is at least 1, and Turns until the next level is at least 1 whenever it is present. The rules under [Escalation](#escalation) and [Faction operation occurrence generation](#faction-operation-occurrence-generation) maintain this: a countdown that reaches zero takes, within the same [Turn advancement step](turn-advancement.md#glossary), the value of a [Level duration](#level-duration) or [Operation interval](#operation-interval) outcome, which is at least 1. For a Faction whose Eliminated is yes, both countdowns keep the values they had when it became Eliminated and are never read again.

A Faction's name is not a State property: it is the `name` of its FactionArchetype. A Faction has no [Turn series](../foundation/world-history.md#glossary).

**Retention:** A Faction is never [Retired](../foundation/world-history.md#glossary): it stays in the [Live world state](../foundation/campaign-state.md#glossary) for the whole Campaign, including after it is Eliminated, and keeps every property above, so that every reference to it, e.g. a [Mission site](domain-model.md#leads-investigations-mission-sites-and-missions)'s target Faction, resolves, under [Historical fact preservation](../foundation/world-history.md#historical-fact-preservation) in History and Turn Report. No Faction is ever removed.

# Initial Factions

**Proposed rule:** The initial [Campaign state](../foundation/core-concepts.md#campaign-and-session) contains exactly one Faction for each FactionArchetype the Game build supplies, and no other Faction, as [Initial Campaign state](domain-model.md#initial-campaign-state) in Domain Model requires. No Faction is created after campaign creation. Each initial Faction has a fresh [Instance ID](../foundation/campaign-instances.md#glossary) under [Campaign instance identity scope](domain-model.md#campaign-instance-identity-scope) in Domain Model, and the following initial values, under [Campaign instance creation](../foundation/campaign-instances.md#campaign-instance-creation) in Campaign Instances. This table is exhaustive.

| Value | Initial value | Source |
| --- | --- | --- |
| Archetype reference | The FactionArchetype. | The FactionArchetype GDR. |
| Constants | Empty. | None. |
| Faction activity level | The FactionActivityLevel that the FactionArchetype's `initial_activity_level` references. | `initial_activity_level` of the FactionArchetype. |
| Turns until the next level | The Faction's initial [Level duration](#level-duration) outcome when that level's `lasts_turns` is not `null`; absent when it is `null`. | `lasts_turns` of the initial FactionActivityLevel. |
| Turns until the next operation | The Faction's initial [Operation interval](#operation-interval) outcome. | `operation_every_turns` of the initial FactionActivityLevel. |
| Eliminated | No. | This rule. |
| Eliminated turn | Absent. | This rule. |

No [Campaign configuration](../foundation/campaign-state.md#glossary) value adds, removes, or changes an initial Faction or any of its initial values.

# Faction random outcomes

Every random outcome of a Faction is one of the three named random outcomes below. Each Faction has its own outcomes: no outcome is shared between two Factions or between two occasions, and no outcome depends on another Faction. The distribution of each outcome depends only on the GDRs its rule names. One dependency links outcomes of the same Faction: which Faction activity level an Operation level or Operation interval outcome reads depends on whether the Faction has escalated, and so on the Faction's earlier Level duration outcomes, which decide when it escalates. Given that Faction activity level, no outcome depends on the value of any other outcome. Each [Probability](../foundation/numbers.md#glossary) below is exact and is never rounded, under [Probabilities](../foundation/numbers.md#probabilities) in Numbers.

## Level duration

A Level duration outcome belongs to one Faction and one occasion on which that Faction enters a Faction activity level whose `lasts_turns` is not `null`: its creation under [Initial Factions](#initial-factions), or one move under [Escalation](#escalation). It is a uniform whole-number outcome over `lasts_turns` of the level entered, from `lo` to `hi`, under [Uniform whole-number outcomes](../foundation/numbers.md#uniform-whole-number-outcomes): each of the `hi − lo + 1` values has Probability `1 / (hi − lo + 1)`. It depends only on that level's `lasts_turns`. No Level duration outcome exists when the level entered has `lasts_turns` of `null`.

## Operation interval

An Operation interval outcome belongs to one Faction and one occasion: its creation under [Initial Factions](#initial-factions), or one Faction operation occurrence under [Faction operation occurrence generation](#faction-operation-occurrence-generation). It is a uniform whole-number outcome over `operation_every_turns` of the Faction activity level the Faction is at on that occasion, from `lo` to `hi`. It depends only on that level's `operation_every_turns`.

## Operation level

An Operation level outcome belongs to one Faction operation occurrence. Its possible values are the keys of `operation_level_weights` of the Faction activity level the Faction is at when the occurrence happens. Its distribution is a weighted choice: the Probability of each key `k` is `w(k) / W`, where `w(k)` is the weight of `k` and `W` is the sum of all weights of that `operation_level_weights`. `W` is at least 1 under [Faction GDR validation](#faction-gdr-validation), so the Probabilities are defined, each lies from 0 to 1, and together they sum to 1. The outcome depends only on that level's `operation_level_weights`.

# Faction activity

**Proposed rule:** During each Advance turn, in the [Turn advancement step](domain-model.md#turn-advancement-steps) Faction activity under [Turn advancement steps](turn-advancement.md#turn-advancement-steps) in Turn Advancement, every Faction whose Eliminated is no applies [Escalation](#escalation) and then [Faction operation occurrence generation](#faction-operation-occurrence-generation), in that order. A Faction whose Eliminated is yes applies neither; nothing about it changes in this step. Nothing slows a Faction's escalation or its operations except becoming Eliminated. The following pseudocode states the complete rule for one Faction F whose Eliminated is no; "level" means F's Faction activity level at the moment it is read:

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

Every subtraction and assignment above produces a whole number, so no rounding occurs. A Faction moves at most one Faction activity level and has at most one Faction operation occurrence in one Advance turn.

**Within one Faction:** The operation part of the rule uses the Faction activity level after the escalation part of the same Faction in the same step, so a Faction that moves to a new level in this step already uses the new level's `operation_level_weights` and `operation_every_turns` for an occurrence in this step. A change of Faction activity level never resets or otherwise changes Turns until the next operation; only the subtraction of one and a Faction operation occurrence change it.

**Several Factions:** Each Faction's rule reads and changes only that Faction's own State, its own random outcomes, and GDRs. No Faction's rule depends on another Faction, so the result of the step is the same whichever order an implementation processes the Factions in, under [Values a step uses](turn-advancement.md#values-a-step-uses) in Turn Advancement. Each Faction whose Turns until the next operation reaches zero has its own Faction operation occurrence and creates its own Response Mission site; several Factions can therefore create several Response Mission sites in one Advance turn. Their Response Mission sites, each with its Enemies, are created in the order of the initiating Factions' Instance IDs, from the lowest number, so the Instance IDs they take under [Campaign instance identity](../foundation/campaign-instances.md#campaign-instance-identity) in Campaign Instances do not depend on that processing order.

Whether this step applies to a Faction is decided by its Eliminated as it is when the step begins, i.e. after the step Mission resolution under [Turn advancement steps](turn-advancement.md#turn-advancement-steps), so a Faction made Eliminated earlier in the same Advance turn neither escalates nor operates in it.

## Escalation

Escalation is the escalation part of the rule under [Faction activity](#faction-activity): a Faction whose Turns until the next level is present counts it down by one, and when it reaches zero the Faction moves to its current Faction activity level's `next`. On the move, Turns until the next level becomes the Faction's [Level duration](#level-duration) outcome for this move when the new level's `lasts_turns` is not `null`, and becomes absent when it is `null`.

A Faction at a final level, i.e. one whose `next` is `null`, has no Turns until the next level and never escalates again. Under [Faction GDR validation](#faction-gdr-validation) every Faction reaches a final level after finitely many moves and stays at it for the rest of the Campaign. A Faction never moves to an earlier or lower Faction activity level.

# Faction operation occurrence generation

**Proposed rule:** A Faction operation occurrence of a Faction F happens exactly when F's Turns until the next operation reaches zero under [Faction activity](#faction-activity). It has the following complete effects, all in the Faction activity step of the same Advance turn:

1. F's [Operation level](#operation-level) outcome for this occurrence takes a value, a key of the `operation_level_weights` of the Faction activity level F is at after [Escalation](#escalation) in this step. The occurrence's Faction operation level is the FactionOperationLevel whose `level` equals that value.
2. The occurrence has the following facts, and this list is exhaustive:
   - its initiating Faction, F;
   - its Faction operation level, under item 1;
   - its turn number: the turn number of the Turn whose Advance turn it happens in.

   [Missions](missions.md) creates exactly one Response Mission site from these facts, under [Mission site creation](missions.md#mission-site-creation) in Missions.

3. F's Turns until the next operation takes the value of F's [Operation interval](#operation-interval) outcome for this occurrence, over the `operation_every_turns` of the Faction activity level F is at after Escalation in this step.

A Faction operation occurrence is not a separate Campaign instance, and its Response Mission site retains these facts, under [Game concepts](domain-model.md#game-concepts) in Domain Model. A Response Mission site created in this step does not count down toward expiration in the same Advance turn, because [Mission site](domain-model.md#leads-investigations-mission-sites-and-missions) expiration precedes Faction activity under [Turn advancement steps](turn-advancement.md#turn-advancement-steps).

A Faction operation occurrence does not depend on any existing Mission site. In particular, an Active Response Mission site of the same Faction, including one of the same Faction operation level, neither prevents nor delays a new occurrence, and consecutive occurrences may have the same Faction operation level.

**Informative rationale:** game-ts also escalated Factions through activity levels and drew operations from per-level frequencies and severity weights. Factions keep that structure in a reduced form, as a Proposed rule; the game-ts values and its avoidance of repeated operations are not carried over.

# Elimination

**Proposed rule:** Eliminated is a permanent fact of a Faction. It changes exactly once at most, from no to yes, and never back. Only a Mission consequence under [Consequences](missions.md#consequences) makes a Faction Eliminated.

Making a Faction F Eliminated during an Advance turn has the following complete effects on F, applied at once:

- Eliminated becomes yes.
- Eliminated turn becomes the turn number of the Turn that this Advance turn ends.
- Faction activity level, Turns until the next level, and Turns until the next operation keep their current values.

When the effect is applied to a Faction whose Eliminated is already yes, nothing changes; in particular, its Eliminated turn keeps its first value.

**Proposed rule:** Game data makes a Faction Eliminated through the [Effect kind](../foundation/effect-lists.md#glossary) `eliminate_faction`, defined as follows, under [Effect kinds](../foundation/effect-lists.md#effect-kinds) in Effect Lists:

- **Value:** always `true`. Any other value is invalid; an [Effect list](../foundation/effect-lists.md#glossary) that eliminates no Faction holds no [Effect](../foundation/effect-lists.md#glossary) of this kind.
- **Change:** applying one Effect makes one Faction Eliminated, with the complete effects stated above.
- **Supplied inputs:** the Faction to make Eliminated, which the rule that applies the Effect supplies.
- **Combined result:** several Effects applied to the same Faction in one Turn advancement step make it Eliminated once, with one Eliminated turn, because applying the effect to a Faction that is already Eliminated changes nothing.

The following table states every change of Eliminated. Every change not listed, e.g. from yes to no, is impossible.

| From | To | Trigger | Condition |
| --- | --- | --- | --- |
| No | Yes | A Mission consequence under [Consequences](missions.md#consequences) eliminates the Faction. | None. |

A Faction whose Eliminated is yes no longer does any of the following; the list is exhaustive for the Faction rules:

- It no longer escalates: [Escalation](#escalation) does not apply to it.
- It no longer carries out operations: no Faction operation occurrence of it happens, so it creates no further Response Mission site.

What becomes of Mission sites that target a Eliminated Faction, whether a [Lead](domain-model.md#leads-investigations-mission-sites-and-missions) of a Eliminated Faction is available, and whether every Faction being Eliminated ends the Campaign are stated by [Missions](missions.md), [Leads and Progression](leads-and-progression.md), and [Panic and Endings](panic-and-endings.md).

# Turn report

**Proposed rule:** The [Turn report](../foundation/campaign-state.md#glossary) of an Advance turn holds, for each Faction whose Faction activity level escalated in it or that had a Faction operation occurrence in it, in the order of the Factions in Campaign state, its Instance ID, the Faction activity level it escalated to, if it escalated, and the Response Mission site its Faction operation occurrence created with that occurrence's FactionOperationLevel, if one happened. The [History entry](../foundation/world-history.md#glossary) of the Turn the Advance turn ends holds the Factions that escalated in it, by Instance ID. All are [Player-visible information](../foundation/engine-contract.md#api-surfaces), under [Turn report and history](../foundation/world-history.md#turn-report-and-history) in History and Turn Report; neither reveals either countdown, under [Player-visible information](#player-visible-information).

# Player-visible information

**Proposed rule:** Each Faction value below is [Player-visible information](../foundation/engine-contract.md#api-surfaces), or not, as the table states, under [Player-visible information](../foundation/player-api.md#player-visible-information) in [Player API](../foundation/engine-contract.md#api-surfaces). The table is exhaustive. Each Player-visible value is visible from campaign creation, without a reveal condition, for every Faction, whether or not it is Eliminated.

| Value | Player-visible information |
| --- | --- |
| A Faction's Instance ID and its FactionArchetype, including the FactionArchetype's `name` | Yes |
| A Faction's Faction activity level, including every property of that FactionActivityLevel: `name`, `lasts_turns`, `operation_every_turns`, `operation_level_weights`, and `next` | Yes |
| Every FactionOperationLevel's `level` and `name` | Yes |
| A Faction's Eliminated and Eliminated turn | Yes |
| A Faction's Turns until the next level | No |
| A Faction's Turns until the next operation | No |
| The value of every Level duration outcome and every Operation interval outcome | No |
| The initiating Faction, Faction operation level, and turn number of each Faction operation occurrence | Yes, once the occurrence has happened, through its Response Mission site under [Missions](missions.md) |

**Hidden versus absent:** Player API returns no property for either countdown of any Faction. It never reports a hidden countdown as zero, as empty, or as absent, and it reports nothing that distinguishes a present Turns until the next level from an absent one. The player tells a final Faction activity level, at which Turns until the next level is absent, from the visible `next` of that level being `null`, never from the countdown. Eliminated turn is never hidden: when Player API reports it as absent, the Faction is not Eliminated.

Under [Information boundary](../foundation/player-api.md#information-boundary) in Player API, no channel of Player API reveals either countdown, e.g. neither a validation error nor the [Turn report](../foundation/campaign-state.md#glossary) nor a [History entry](../foundation/world-history.md#glossary) states how many Advance turns remain before a Faction moves to its next level or carries out its next operation. That a Faction operation occurrence has happened is visible through its Response Mission site, and that a Faction has moved to a new level is visible through its Faction activity level; neither reveals the new value of either countdown. The countdowns are available only through [Developer API](../foundation/engine-contract.md#api-surfaces).

# Edge cases and failure behavior

- **Both countdowns reach zero in the same Advance turn:** The Faction moves to its next level, and Turns until the next level takes the value of its Level duration outcome over the new level; its Faction operation occurrence uses the new level's `operation_level_weights`, and Turns until the next operation takes the value of its Operation interval outcome over the new level's `operation_every_turns` ([Faction activity](#faction-activity)).
- **Move to a final level:** Turns until the next level becomes absent and no Level duration outcome exists for that move. Turns until the next operation is unchanged by the move ([Escalation](#escalation)).
- **At a final level:** The Faction never escalates again; Faction operation occurrences continue for as long as it is not Eliminated ([Escalation](#escalation)).
- **Level duration or Operation interval at its lower bound:** An outcome value of `lo` is valid. Because `lo` is at least 1, the countdown is never set to zero, and an occurrence or move happens in the `lo`-th Advance turn after the one that set the countdown ([Faction GDR validation](#faction-gdr-validation), [Faction State](#faction-state)).
- **Eliminated earlier in the same Advance turn:** A Faction made Eliminated in Mission resolution does not apply Faction activity in the same Advance turn, even if a countdown of it would have reached zero ([Faction activity](#faction-activity)).
- **Eliminated twice:** Applying the effect of [Elimination](#elimination) to a Faction that is already Eliminated changes nothing.
- **Existing Response Mission sites:** An Active Response Mission site of the same Faction, or a [Deployed](agents-spec.md#assignments) Mission at one, does not affect a new occurrence, and the same Faction operation level may occur again ([Faction operation occurrence generation](#faction-operation-occurrence-generation)).
- **Several Factions:** Each Faction applies Faction activity independently; several Faction operation occurrences, one per Faction, may happen in one Advance turn ([Faction activity](#faction-activity)).
- **No FactionArchetype:** A Game build that supplies no FactionArchetype passes [Faction GDR validation](#faction-gdr-validation); the initial Campaign state then contains no Faction and the Faction activity step does nothing. What that means for the [Campaign ending](domain-model.md#campaign-standing) is stated by [Panic and Endings](panic-and-endings.md).
- **Unknown property, cyclic `next` chain, or unresolved reference:** These cannot occur in a Campaign, because a Game build containing them fails [Faction GDR validation](#faction-gdr-validation) and no Campaign is created from it. A World state violating the range invariant under [Faction State](#faction-state), e.g. a Faction that is not Eliminated with Turns until the next operation of 0, is an internal invariant violation, reported under [World state integrity](../foundation/engine-contract.md#world-state-integrity) in Engine Contract.
- **Campaign ended:** Once the Campaign has a Campaign ending, Advance turn is rejected under [Panic and Endings](panic-and-endings.md), so no further Faction activity applies.

# TODOs

- TODO (later): Faction suppression, under [Faction activity](#faction-activity).
- TODO (later): Faction discovery, under [Player-visible information](#player-visible-information).
- TODO (later): Dormant Faction activity levels, from which a Faction carries out no operations, under [Faction operation occurrence generation](#faction-operation-occurrence-generation).
- TODO (later): Avoiding a repeat of a Faction's previous operation, under [Faction operation occurrence generation](#faction-operation-occurrence-generation).
