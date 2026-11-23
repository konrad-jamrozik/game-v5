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

| Term | Definition | Prohibited synonyms |
| --- | --- | --- |
| Faction activity level | How aggressively a [Faction](domain-model.md#factions) currently acts: how often it carries out operations and how severe they are. |  |
| Faction operation level | How severe one [Faction operation occurrence](domain-model.md#factions) is; it decides the [Consequences](domain-model.md#leads-investigations-mission-sites-and-missions) of the [Response Mission site](domain-model.md#leads-investigations-mission-sites-and-missions) the occurrence creates. |  |

# Faction GDRs

Factions are described by three [Game Data Record](../foundation/core-concepts.md#game-build-and-content) (GDR) [Types](../foundation/core-concepts.md#data-modeling): FactionArchetype, FactionActivityLevel, and FactionOperationLevel. The GDRs a [Game build](../foundation/core-concepts.md#game-build-and-content) supplies, and their values, are listed by [GDRs](../content/gdrs.md) and the YAML files it names.

## FactionArchetype

A FactionArchetype is the [Archetype](../foundation/core-concepts.md#campaign-instances) of one Faction. This property table is exhaustive apart from the `id` and `type` that every GDR has.

| Property | Meaning | Read by |
| --- | --- | --- |
| `name` | The Faction's display name. | [Player-visible information](#player-visible-information) |
| `initial_lasts_turns` | A pair `[lo, hi]` of whole numbers of Advance turns: the inclusive range of how long the new Faction stays at the first level, under [Initial Factions](#initial-factions), e.g. how long it stays at `dormant`. A pair whose `lo` equals its `hi` fixes the duration, e.g. `[1, 1]` moves the Faction to the first level's `next` in the Advance turn that ends Turn 1. A duration of 0 makes the Faction skip the first level, e.g. `[0, 0]` makes it start at the first level's `next`. | [Level duration](#level-duration) |

## FactionActivityLevel

A FactionActivityLevel describes one Faction activity level. It is shared by every Faction at that level. This property table is exhaustive apart from `id` and `type`.

| Property | Meaning | Read by |
| --- | --- | --- |
| `name` | The level's display name. | [Player-visible information](#player-visible-information) |
| `lasts_turns` | One of: a pair `[lo, hi]` of whole numbers of Advance turns, the inclusive range of how long a Faction stays at this level, where a duration of 0 makes a Faction that escalates into the level skip it, e.g. `[0, 10]` lets a Faction skip it and `[0, 0]` makes every Faction skip it; `per_faction`, for the first level, whose range each FactionArchetype sets with its `initial_lasts_turns`; or `null` for a final level, at which a Faction stays for the rest of the [Campaign](../foundation/core-concepts.md#campaign-and-session). | [Level duration](#level-duration) |
| `operation_every_turns` | Either a pair `[lo, hi]` of whole numbers of Advance turns, the inclusive range of the interval between two Faction operation occurrences of a Faction at this level, or `null` for a level without operations, at which a Faction has no Faction operation occurrence. | [Operation interval](#operation-interval) |
| `operation_level_weights` | A map from the `level` of a FactionOperationLevel to a whole-number weight: how often a Faction operation occurrence of a Faction at this level has each Faction operation level, relative to the others. It is empty for a level without operations. | [Operation level](#operation-level) |
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

The GDRs a Game build supplies must satisfy every rule below. The list is exhaustive for the Faction GDRs. A Game build whose GDRs violate one of these rules is defective: no [Campaign](../foundation/core-concepts.md#campaign-and-session) is created from it, and the violation is reported as a data defect, never repaired into different gameplay, under [World state integrity](../foundation/engine-contract.md#world-state-integrity) in Engine Contract.

1. **Known properties:** Each FactionArchetype, FactionActivityLevel, and FactionOperationLevel has every property its table above lists and no property other than those, apart from `id` and `type`. Each `name` is non-empty text. The content of a FactionOperationLevel's `on_win` and `on_ignored_or_lost` is validated by [MissionSiteArchetype validation](missions.md#missionsitearchetype-validation) in Missions.
2. **One first level:** Exactly one FactionActivityLevel, the first level, has `lasts_turns` of `per_faction`, and no `next` references it, so a Faction never enters it by escalation.
3. **Ranges are valid:** Every FactionActivityLevel's `operation_every_turns` when it is not `null` is a pair `[lo, hi]` of whole numbers with `1 ≤ lo ≤ hi`. Every FactionActivityLevel's `lasts_turns` when it is neither `null` nor `per_faction`, and every FactionArchetype's `initial_lasts_turns`, is a pair `[lo, hi]` of whole numbers with `0 ≤ lo ≤ hi`.
4. **Final levels agree:** A FactionActivityLevel's `lasts_turns` is `null` exactly when its `next` is `null`.
5. **Next resolves:** Every `next` that is not `null` references a FactionActivityLevel the Game build supplies.
6. **The chain ends:** Following `next` from any FactionActivityLevel reaches a FactionActivityLevel whose `next` is `null` without visiting any FactionActivityLevel twice. A `next` chain with a cycle, including a level whose `next` is itself, is invalid.
7. **Operation levels are distinct:** Every FactionOperationLevel's `level` is a whole number of at least 1, and no two FactionOperationLevels have the same `level`.
8. **Weights are valid:** A FactionActivityLevel's `operation_level_weights` has at least one key when its `operation_every_turns` is not `null`, and no key when it is `null`. Each key equals the `level` of a FactionOperationLevel the Game build supplies, and each weight is a whole number of at least 1.

These rules guarantee that every uniform whole-number outcome below has a valid range and that every Faction operation occurrence has a Faction operation level. That a Response Mission site can be created for every Faction operation level a Faction can have is checked by [MissionSiteArchetype validation](missions.md#missionsitearchetype-validation). A FactionActivityLevel other than the first level that no `next` references is valid; it is never used.

# Faction State

A Faction is a [Campaign instance](../foundation/core-concepts.md#campaign-instances) whose Archetype is a FactionArchetype. Its Archetype reference is set when it is created and never changes. Its [Constants](../foundation/core-concepts.md#campaign-instances) are empty: everything fixed about a Faction is supplied by its FactionArchetype. Its [State](../foundation/core-concepts.md#campaign-instances) has exactly the following properties. This table is exhaustive.

| Property | Value | Classification and range |
| --- | --- | --- |
| Faction activity level | A Mutable reference to the FactionActivityLevel the Faction is currently at. | [Authoritative value](../foundation/core-concepts.md#value-classification). Always resolves to a FactionActivityLevel the Game build supplies. |
| Turns until the next level | The number of Advance turns left before the Faction moves to its Faction activity level's `next`, or absent. | Authoritative value. A whole number, under [Whole-number quantities](../foundation/numbers.md#whole-number-quantities). Absent exactly when the Faction activity level's `next` is `null`. |
| Turns until the next operation | The number of Advance turns left before the Faction's next Faction operation occurrence, or absent. | Authoritative value. A whole number. For a Faction whose [Eliminated](domain-model.md#factions) is no, absent exactly when the Faction activity level's `operation_every_turns` is `null`. |
| Eliminated | Whether the Faction is [Eliminated](domain-model.md#factions): no or yes. | Authoritative value. Starts as no and changes only under [Elimination](#elimination). |
| Eliminated turn | The turn number of the [Turn](../foundation/engine-contract.md#player-actions-and-turns) whose Advance turn made the Faction Eliminated, or absent. | Authoritative value. A whole number of at least 1. Absent exactly when Eliminated is no. |

**Range invariant:** In every [World state](../foundation/engine-contract.md#player-actions-and-turns), for every Faction whose Eliminated is no, Turns until the next operation and Turns until the next level are each at least 1 whenever present. The rules under [Escalation](#escalation) and [Faction operation occurrence generation](#faction-operation-occurrence-generation) maintain this: a countdown that reaches zero takes, within the same [Turn advancement step](domain-model.md#turn-advancement-steps), the value of a [Level duration](#level-duration) or [Operation interval](#operation-interval) outcome that is at least 1, or becomes absent; a Level duration outcome of 0 is never kept, at creation or later, because the Faction skips that level under [Escalation](#escalation). For a Faction whose Eliminated is yes, both countdowns keep the values they had when it became Eliminated and are never read again.

A Faction's name is not a State property: it is the `name` of its FactionArchetype. A Faction has no [Turn series](../foundation/world-history.md#glossary).

**Retention:** A Faction is never [Retired](../foundation/world-history.md#glossary): it stays in the [Live world state](../foundation/campaign-state.md#glossary) for the whole Campaign, including after it is Eliminated, and keeps every property above, so that every reference to it, e.g. a [Mission site](domain-model.md#leads-investigations-mission-sites-and-missions)'s target Faction, resolves, under [Historical fact preservation](../foundation/world-history.md#historical-fact-preservation) in History and Turn Report. No Faction is ever removed.

# Initial Factions

The initial [Campaign state](../foundation/core-concepts.md#campaign-and-session) contains exactly one Faction for each FactionArchetype the Game build supplies, and no other Faction, as [Initial Campaign state](domain-model.md#initial-campaign-state) in Domain Model requires. No Faction is created after campaign creation. The initial Factions are created in the order in which their FactionArchetypes are authored in the Game build, under [GDR authoring format](../foundation/game-data-records.md#gdr-authoring-format) in Game Data Records, so the first FactionArchetype's Faction takes the [Instance ID](../foundation/campaign-instances.md#glossary) with the number 1. Each initial Faction has a fresh [Instance ID](../foundation/campaign-instances.md#glossary) under [Campaign instance identity scope](domain-model.md#campaign-instance-identity-scope) in Domain Model, and the following initial values, under [Campaign instance creation](../foundation/campaign-instances.md#campaign-instance-creation) in Campaign Instances. This table is exhaustive.

| Value | Initial value | Source |
| --- | --- | --- |
| Archetype reference | The FactionArchetype. | The FactionArchetype GDR. |
| Constants | Empty. | None. |
| Faction activity level | The initial level: the first level, or, when the Faction skips it, the level it reaches by skipping. | The first level and `initial_lasts_turns` of the FactionArchetype, under the rule below the table. |
| Turns until the next level | The last [Level duration](#level-duration) outcome of the rule below the table when the initial level's `lasts_turns` is not `null`, which is at least 1; absent when it is `null`. | `initial_lasts_turns` of the FactionArchetype, and `lasts_turns` of each level entered after the first. |
| Turns until the next operation | The Faction's initial [Operation interval](#operation-interval) outcome when the initial level's `operation_every_turns` is not `null`; absent when it is `null`. | `operation_every_turns` of the initial level. |
| Eliminated | No. | This rule. |
| Eliminated turn | Absent. | This rule. |

Every Faction starts by entering the first level, under [Faction GDR validation](#faction-gdr-validation), with a Level duration outcome over its FactionArchetype's `initial_lasts_turns`. While the last Level duration outcome is 0, the Faction skips the level it entered and enters that level's `next`, with a Level duration outcome over that level's `lasts_turns`, as under [Escalation](#escalation); the level it stops at is its initial level. E.g. an `initial_lasts_turns` of `[10, 20]` starts the Faction at `dormant` for 10 to 20 Advance turns, and `[0, 0]` starts it at `faint`, for as long as `faint`'s `lasts_turns` sets.

No [Campaign configuration](../foundation/campaign-state.md#glossary) value adds, removes, or changes an initial Faction or any of its initial values.

# Faction random outcomes

Every random outcome of a Faction is one of the three named random outcomes below. Each Faction has its own outcomes: no outcome is shared between two Factions or between two occasions, and no outcome depends on another Faction. The distribution of each outcome depends only on the GDRs its rule names. One dependency links outcomes of the same Faction: which Faction activity level an Operation level or Operation interval outcome reads depends on whether the Faction has escalated, and so on the Faction's earlier Level duration outcomes, which decide when it escalates. Given that Faction activity level, no outcome depends on the value of any other outcome. Each [Probability](../foundation/numbers.md#glossary) below is exact and is never rounded, under [Probabilities](../foundation/numbers.md#probabilities) in Numbers.

## Level duration

A Level duration outcome belongs to one Faction and one occasion on which that Faction enters a Faction activity level whose `lasts_turns` is not `null`: one entry into a level at its creation under [Initial Factions](#initial-factions), or one entry into a level under [Escalation](#escalation), including a level the Faction then skips. It is a uniform whole-number outcome over a range `[lo, hi]`, from `lo` to `hi`, under [Uniform whole-number outcomes](../foundation/numbers.md#uniform-whole-number-outcomes): each of the `hi − lo + 1` values has Probability `1 / (hi − lo + 1)`. On entering the first level, the range is the `initial_lasts_turns` of the Faction's FactionArchetype; on entering any other level, it is that level's `lasts_turns`. Its value may be 0, which makes the Faction skip the level. The outcome depends only on that range. No Level duration outcome exists when the level entered has `lasts_turns` of `null`.

## Operation interval

An Operation interval outcome belongs to one Faction and one occasion: its creation under [Initial Factions](#initial-factions), one Faction operation occurrence under [Faction operation occurrence generation](#faction-operation-occurrence-generation), or one move from a level without operations to a level with them under [Escalation](#escalation). No Operation interval outcome exists for an occasion on which the level has `operation_every_turns` of `null`. It is a uniform whole-number outcome over `operation_every_turns` of the Faction activity level the Faction is at on that occasion, from `lo` to `hi`. It depends only on that level's `operation_every_turns`.

## Operation level

An Operation level outcome belongs to one Faction operation occurrence. Its possible values are the keys of `operation_level_weights` of the Faction activity level the Faction is at when the occurrence happens. Its distribution is a weighted choice: the Probability of each key `k` is `w(k) / W`, where `w(k)` is the weight of `k` and `W` is the sum of all weights of that `operation_level_weights`. `W` is at least 1 under [Faction GDR validation](#faction-gdr-validation), so the Probabilities are defined, each lies from 0 to 1, and together they sum to 1. The outcome depends only on that level's `operation_level_weights`.

# Faction activity

During each Advance turn, in the [Turn advancement step](domain-model.md#turn-advancement-steps) Faction activity under [Turn advancement steps](turn-advancement.md#turn-advancement-steps) in Turn Advancement, every Faction whose Eliminated is no applies [Escalation](#escalation) and then [Faction operation occurrence generation](#faction-operation-occurrence-generation), in that order. A Faction whose Eliminated is yes applies neither; nothing about it changes in this step. Nothing slows a Faction's escalation or its operations except becoming Eliminated. The following pseudocode states the complete rule for one Faction F whose Eliminated is no; "level" means F's Faction activity level at the moment it is read:

```text
if Turns until the next level is present:
    Turns until the next level = Turns until the next level − 1
    if Turns until the next level = 0:
        while Turns until the next level = 0:
            Faction activity level = next of level
            if lasts_turns of level is null:
                Turns until the next level becomes absent
            else:
                Turns until the next level = F's Level duration outcome for entering level
        if operation_every_turns of level is null:
            Turns until the next operation becomes absent
        else if Turns until the next operation is absent:
            Turns until the next operation = F's Operation interval outcome for this move,
                                             over level
            F woke in this step
if Turns until the next operation is present and F did not wake in this step:
    Turns until the next operation = Turns until the next operation − 1
    if Turns until the next operation = 0:
        one Faction operation occurrence of F happens, using the level F is now at
        Turns until the next operation = F's Operation interval outcome for this occurrence,
                                         over the level F is now at
```

Every subtraction and assignment above produces a whole number, so no rounding occurs. A Faction makes at most one move and has at most one Faction operation occurrence in one Advance turn. One move enters one level, or several when it skips levels whose Level duration outcome is 0; the loop ends because the `next` chain reaches a final level under [Faction GDR validation](#faction-gdr-validation). The new level of a move is the level it ends at; a level skipped on the way has no effect beyond its Level duration outcome, e.g. its `operation_every_turns` is never read.

**Within one Faction:** The operation part of the rule uses the Faction activity level after the escalation part of the same Faction in the same step, so a Faction that moves to a new level in this step already uses the new level's `operation_level_weights` and `operation_every_turns` for an occurrence in this step. A move between two levels that both have operations never resets or otherwise changes Turns until the next operation; only the subtraction of one and a Faction operation occurrence change it. A move to a level without operations makes it absent, and a move from such a level to a level with operations, i.e. the Faction waking, sets it; a Faction that wakes in this step does not count down in it, so its first Faction operation occurrence happens as many Advance turns after the waking one as its Operation interval outcome.

**Several Factions:** Each Faction's rule reads and changes only that Faction's own State, its own random outcomes, and GDRs. No Faction's rule depends on another Faction, so the result of the step is the same whichever order an implementation processes the Factions in, under [Values a step uses](turn-advancement.md#values-a-step-uses) in Turn Advancement. Each Faction whose Turns until the next operation reaches zero has its own Faction operation occurrence and creates its own Response Mission site; several Factions can therefore create several Response Mission sites in one Advance turn. Their Response Mission sites, each with its Enemies, are created in the order of the initiating Factions' Instance IDs, from the lowest number, so the Instance IDs they take under [Campaign instance identity](../foundation/campaign-instances.md#campaign-instance-identity) in Campaign Instances do not depend on that processing order.

Whether this step applies to a Faction is decided by its Eliminated as it is when the step begins, i.e. after the step Mission resolution under [Turn advancement steps](turn-advancement.md#turn-advancement-steps), so a Faction made Eliminated earlier in the same Advance turn neither escalates nor operates in it.

## Escalation

Escalation is the escalation part of the rule under [Faction activity](#faction-activity): a Faction whose Turns until the next level is present counts it down by one, and when it reaches zero the Faction moves to its current Faction activity level's `next`. On entering a level, Turns until the next level becomes the Faction's [Level duration](#level-duration) outcome for entering it when the level's `lasts_turns` is not `null`, and becomes absent when it is `null`. An outcome of 0 makes the Faction skip the level: in the same move, it goes on to that level's `next`, e.g. a Faction leaving `faint` when `emerging` has `lasts_turns` of `[0, 0]` ends the move at `active`, and one leaving `faint` when `emerging` has `[0, 10]` skips `emerging` with Probability `1/11`.

A Faction at a final level, i.e. one whose `next` is `null`, has no Turns until the next level and never escalates again. Under [Faction GDR validation](#faction-gdr-validation) every Faction reaches a final level after finitely many moves and stays at it for the rest of the Campaign. A Faction never moves to an earlier or lower Faction activity level.

# Faction operation occurrence generation

A Faction operation occurrence of a Faction F happens exactly when F's Turns until the next operation reaches zero under [Faction activity](#faction-activity). It has the following complete effects, all in the Faction activity step of the same Advance turn:

1. F's [Operation level](#operation-level) outcome for this occurrence takes a value, a key of the `operation_level_weights` of the Faction activity level F is at after [Escalation](#escalation) in this step. The occurrence's Faction operation level is the FactionOperationLevel whose `level` equals that value.
2. The occurrence has the following facts, and this list is exhaustive:
   - its initiating Faction, F;
   - its Faction operation level, under item 1;
   - its turn number: the turn number of the Turn whose Advance turn it happens in.

   [Missions](missions.md) creates exactly one Response Mission site from these facts, under [Mission site creation](missions.md#mission-site-creation) in Missions.

3. F's Turns until the next operation takes the value of F's [Operation interval](#operation-interval) outcome for this occurrence, over the `operation_every_turns` of the Faction activity level F is at after Escalation in this step.

A Faction operation occurrence is not a separate Campaign instance, and its Response Mission site retains these facts, under [Game concepts](domain-model.md#game-concepts) in Domain Model. A Response Mission site created in this step does not count down toward expiration in the same Advance turn, because [Mission site](domain-model.md#leads-investigations-mission-sites-and-missions) expiration precedes Faction activity under [Turn advancement steps](turn-advancement.md#turn-advancement-steps).

A Faction operation occurrence does not depend on any existing Mission site. In particular, an Active Response Mission site of the same Faction, including one of the same Faction operation level, neither prevents nor delays a new occurrence, and consecutive occurrences may have the same Faction operation level. Which MissionSiteArchetype the Response Mission site has does depend on the Response Mission site of the same Faction's previous occurrence, under [MissionSiteArchetype selection](missions.md#missionsitearchetype-selection) in Missions.

# Elimination

Eliminated is a permanent fact of a Faction. It changes exactly once at most, from no to yes, and never back. Only an `eliminate_faction` [Effect](../foundation/effect-lists.md#glossary) makes a Faction Eliminated: one applied by the [Completion effect](leads-and-progression.md#completion-effect) of a [Lead](domain-model.md#leads-investigations-mission-sites-and-missions), or one applied as a Mission consequence under [Consequences](missions.md#consequences).

Making a Faction F Eliminated during an Advance turn has the following complete effects on F, applied at once:

- Eliminated becomes yes.
- Eliminated turn becomes the turn number of the Turn that this Advance turn ends.
- Faction activity level, Turns until the next level, and Turns until the next operation keep their current values.

When the effect is applied to a Faction whose Eliminated is already yes, nothing changes; in particular, its Eliminated turn keeps its first value.

Game data makes a Faction Eliminated through the [Effect kind](../foundation/effect-lists.md#glossary) `eliminate_faction`, defined as follows, under [Effect kinds](../foundation/effect-lists.md#effect-kinds) in Effect Lists:

- **Value:** always `true`. Any other value is invalid; an [Effect list](../foundation/effect-lists.md#glossary) that eliminates no Faction holds no [Effect](../foundation/effect-lists.md#glossary) of this kind.
- **Change:** applying one Effect makes one Faction Eliminated, with the complete effects stated above.
- **Supplied inputs:** the Faction to make Eliminated, which the rule that applies the Effect supplies.
- **Combined result:** several Effects applied to the same Faction in one Turn advancement step make it Eliminated once, with one Eliminated turn, because applying the effect to a Faction that is already Eliminated changes nothing.

The following table states every change of Eliminated. Every change not listed, e.g. from yes to no, is impossible.

| From | To | Trigger | Condition |
| --- | --- | --- | --- |
| No | Yes | An `eliminate_faction` Effect is applied to the Faction, by the [Completion effect](leads-and-progression.md#completion-effect) of a Lead or by a Mission consequence under [Consequences](missions.md#consequences). | None. |

A Faction whose Eliminated is yes no longer does any of the following; the list is exhaustive for the Faction rules:

- It no longer escalates: [Escalation](#escalation) does not apply to it.
- It no longer carries out operations: no Faction operation occurrence of it happens, so it creates no further Response Mission site.

What becomes of Mission sites that target a Eliminated Faction, whether a [Lead](domain-model.md#leads-investigations-mission-sites-and-missions) of a Eliminated Faction is available, and what wins the Campaign are stated by [Missions](missions.md), [Leads and Progression](leads-and-progression.md), and [Panic and Endings](panic-and-endings.md).

# Turn report

The [Turn report](../foundation/campaign-state.md#glossary) of an Advance turn holds, for each Faction that had a Faction operation occurrence in it, in the order of the Factions' Instance IDs, from the lowest number, its Instance ID and the Response Mission site its Faction operation occurrence created with that occurrence's FactionOperationLevel. The [History entry](../foundation/world-history.md#glossary) of the Turn the Advance turn ends holds nothing of a Faction beyond what [Missions](missions.md) holds of that Response Mission site. Both are [Player-visible information](../foundation/engine-contract.md#api-surfaces), under [Turn report and history](../foundation/world-history.md#turn-report-and-history) in History and Turn Report. Neither holds whether a Faction escalated, and neither reveals either countdown, under [Player-visible information](#player-visible-information).

# Player-visible information

Each Faction value below is [Player-visible information](../foundation/engine-contract.md#api-surfaces), or not, as the table states, under [Player-visible information](../foundation/player-api.md#player-visible-information) in [Player API](../foundation/engine-contract.md#api-surfaces). The table is exhaustive. Each Player-visible value is visible from campaign creation, without a reveal condition, for every Faction, whether or not it is Eliminated. How dangerous a Faction has become is never shown: the player judges it from the operations the Faction carries out.

| Value | Player-visible information |
| --- | --- |
| A Faction's Instance ID and its FactionArchetype, with the FactionArchetype's `name` | Yes |
| A Faction's Faction activity level, and that it has moved to a new one | No |
| The FactionActivityLevels the Game build supplies, with their properties `name`, `lasts_turns`, `operation_every_turns`, `operation_level_weights`, and `next` | No |
| Every FactionArchetype's `initial_lasts_turns` | No |
| Every FactionOperationLevel's `level` and `name` | Yes |
| A Faction's Eliminated and Eliminated turn | Yes |
| A Faction's Turns until the next level | No |
| A Faction's Turns until the next operation | No |
| The value of every Level duration outcome and every Operation interval outcome | No |
| The initiating Faction, Faction operation level, and turn number of each Faction operation occurrence | Yes, once the occurrence has happened, through its Response Mission site under [Missions](missions.md) |

**Hidden versus absent:** Player API returns no property for either countdown of any Faction. It never reports a hidden countdown as zero, as empty, or as absent, and it reports nothing that distinguishes a present countdown from an absent one, so the player cannot tell a Faction at a final Faction activity level, or at a level without operations, from any other. Eliminated turn is never hidden: when Player API reports it as absent, the Faction is not Eliminated.

Under [Information boundary](../foundation/player-api.md#information-boundary) in Player API, no channel of Player API reveals either countdown, e.g. neither a validation error nor the [Turn report](../foundation/campaign-state.md#glossary) nor a [History entry](../foundation/world-history.md#glossary) states how many Advance turns remain before a Faction moves to its next level or carries out its next operation. That a Faction operation occurrence has happened is visible through its Response Mission site, which reveals neither countdown. That a Faction has moved to a new level is not visible. The Faction activity level and the countdowns are available only through [Developer API](../foundation/engine-contract.md#api-surfaces).

# Edge cases and failure behavior

- **Both countdowns reach zero in the same Advance turn:** The Faction moves to its next level, and Turns until the next level takes the value of its Level duration outcome over the new level; its Faction operation occurrence uses the new level's `operation_level_weights`, and Turns until the next operation takes the value of its Operation interval outcome over the new level's `operation_every_turns` ([Faction activity](#faction-activity)).
- **Move to a final level:** Turns until the next level becomes absent and no Level duration outcome exists for that move. Turns until the next operation is unchanged by the move when both levels have operations ([Escalation](#escalation)).
- **Level without operations:** A Faction at a level whose `operation_every_turns` is `null` has no Turns until the next operation and no Faction operation occurrence; it still escalates. When it moves to a level with operations, Turns until the next operation takes the value of an Operation interval outcome and does not count down in that Advance turn ([Faction activity](#faction-activity)).
- **Per-Faction first level:** Every Faction enters the first level and stays there for a Level duration over its own FactionArchetype's `initial_lasts_turns`, e.g. one Faction stays at `dormant` for 5 to 10 Advance turns and another for 30 to 40, and then moves to the same `next` ([Initial Factions](#initial-factions)).
- **Never at the first level:** A FactionArchetype whose `initial_lasts_turns` is `[0, 0]` skips the first level at creation, e.g. starts at `faint` and never is at `dormant`; one whose `lo` is 0 and `hi` above 0 skips it with Probability `1 / (hi + 1)` ([Initial Factions](#initial-factions)).
- **Skipped level:** A Level duration outcome of 0 on entering a level makes the Faction go on to that level's `next` in the same move, or at creation; a level whose `lasts_turns` is `[0, 0]` is skipped by every Faction that enters it ([Escalation](#escalation)).
- **Final level without operations:** A Faction that reaches a final level whose `operation_every_turns` is `null` never has another Faction operation occurrence. This is valid ([Faction GDR validation](#faction-gdr-validation)).
- **At a final level:** The Faction never escalates again; when the level has operations, Faction operation occurrences continue for as long as the Faction is not Eliminated ([Escalation](#escalation)).
- **Level duration or Operation interval at its lower bound:** An outcome value of `lo` is valid. When `lo` is at least 1, the countdown is set to `lo`, and an occurrence or move happens in the `lo`-th Advance turn after the one that set the countdown, e.g. an `initial_lasts_turns` of `[1, 1]` moves the Faction in the Advance turn that ends Turn 1; a Level duration of 0 is never kept as a countdown, because the Faction skips the level ([Faction State](#faction-state)).
- **Eliminated earlier in the same Advance turn:** A Faction made Eliminated in Mission resolution does not apply Faction activity in the same Advance turn, even if a countdown of it would have reached zero ([Faction activity](#faction-activity)).
- **Eliminated twice:** Applying the effect of [Elimination](#elimination) to a Faction that is already Eliminated changes nothing.
- **Existing Response Mission sites:** An Active Response Mission site of the same Faction, or a [Deployed](agents-spec.md#assignments) Mission at one, does not affect a new occurrence, and the same Faction operation level may occur again ([Faction operation occurrence generation](#faction-operation-occurrence-generation)).
- **Several Factions:** Each Faction applies Faction activity independently; several Faction operation occurrences, one per Faction, may happen in one Advance turn ([Faction activity](#faction-activity)).
- **No FactionArchetype:** A Game build that supplies no FactionArchetype passes [Faction GDR validation](#faction-gdr-validation); the initial Campaign state then contains no Faction and the Faction activity step does nothing. What that means for the [Campaign ending](domain-model.md#campaign-standing) is stated by [Panic and Endings](panic-and-endings.md).
- **Unknown property, cyclic `next` chain, or unresolved reference:** These cannot occur in a Campaign, because a Game build containing them fails [Faction GDR validation](#faction-gdr-validation) and no Campaign is created from it. A World state violating the range invariant under [Faction State](#faction-state), e.g. a Faction that is not Eliminated with Turns until the next operation of 0, is an internal invariant violation, reported under [World state integrity](../foundation/engine-contract.md#world-state-integrity) in Engine Contract.
- **Campaign ended:** Once the Campaign has a Campaign ending, Advance turn is rejected under [Panic and Endings](panic-and-endings.md), so no further Faction activity applies.

# TODOs

- TODO (later): Faction suppression, under [Faction activity](#faction-activity).
