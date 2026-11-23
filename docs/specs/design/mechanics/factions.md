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

Three [Game Data Record](../foundation/core-concepts.md#game-build-and-content) (GDR) [Types](../foundation/core-concepts.md#data-modeling) describe Factions: a FactionArchetype for each Faction, a FactionActivityLevel for each Faction activity level, and a FactionOperationLevel for each Faction operation level.

## FactionArchetype

A FactionArchetype is the [Archetype](../foundation/core-concepts.md#campaign-instances) of one Faction.

| Property | Meaning | Read by |
| --- | --- | --- |
| `name` | The Faction's display name. | [Player-visible information](#player-visible-information) |
| `initial_lasts_turns` | A pair `[lo, hi]` of whole numbers of Advance turns with `0 ≤ lo ≤ hi`: the inclusive range of how long the new Faction stays at the first level. | [Level duration](#level-duration) |

## FactionActivityLevel

A FactionActivityLevel describes one Faction activity level. Exactly one is the first level, at which every Faction starts and which no `next` names, and following `next` from any level reaches a final level without visiting a level twice.

| Property | Meaning | Read by |
| --- | --- | --- |
| `name` | The level's display name. | [Player-visible information](#player-visible-information) |
| `lasts_turns` | One of three: a pair `[lo, hi]` of whole numbers of Advance turns with `0 ≤ lo ≤ hi`, the inclusive range of how long a Faction that enters this level stays at it; `per_faction` for the first level, whose range each FactionArchetype sets with its `initial_lasts_turns`; or `null` for a final level, at which a Faction stays for the rest of the [Campaign](../foundation/core-concepts.md#campaign-and-session). | [Level duration](#level-duration) |
| `operation_every_turns` | Either a pair `[lo, hi]` of whole numbers of Advance turns with `1 ≤ lo ≤ hi`, the inclusive range of the interval between two Faction operation occurrences of a Faction at this level, or `null` for a level without operations. | [Operation interval](#operation-interval) |
| `operation_level_weights` | A map from the `level` of a FactionOperationLevel to a whole-number weight of at least 1: how often a Faction operation occurrence of a Faction at this level has each Faction operation level, relative to the others. It is empty exactly for a level without operations. | [Operation level](#operation-level) |
| `next` | The FactionActivityLevel a Faction moves to when its time at this level ends; `null` exactly for a final level. | [Escalation](#escalation) |

## FactionOperationLevel

A FactionOperationLevel describes one Faction operation level, and what is at stake at a Response Mission site of that level.

| Property | Meaning | Read by |
| --- | --- | --- |
| `level` | The Faction operation level as a whole number of at least 1, different for each FactionOperationLevel; it is the key that `operation_level_weights` uses, and the value that the MissionSiteArchetype property `operation_level` names. | [Operation level](#operation-level); [MissionSiteArchetype selection](missions.md#missionsitearchetype-selection) |
| `name` | The level's display name. | [Player-visible information](#player-visible-information) |
| `on_win` | An [Effect list](../foundation/effect-lists.md#glossary): what the [Agency](domain-model.md#agency-and-agents) gains when a [Response Mission](domain-model.md#leads-investigations-mission-sites-and-missions) at a site of this level is Won. | [Consequences](missions.md#consequences) |
| `on_ignored_or_lost` | An Effect list: what changes when a Response Mission site of this level is Expired or its [Mission](domain-model.md#leads-investigations-mission-sites-and-missions) Lost. | [Consequences](missions.md#consequences) |

# Faction State

A Faction is a [Campaign instance](../foundation/core-concepts.md#campaign-instances) whose Archetype is a FactionArchetype. It has no [Constants](../foundation/core-concepts.md#campaign-instances) and no [Turn series](../foundation/world-history.md#glossary), and its [State](../foundation/core-concepts.md#campaign-instances) holds the following [Authoritative values](../foundation/core-concepts.md#value-classification).

| Property | Meaning |
| --- | --- |
| Faction activity level | The FactionActivityLevel the Faction is at. |
| Turns until the next level | The number of Advance turns left before the Faction moves to its Faction activity level's `next`; absent at a final level. |
| Turns until the next operation | The number of Advance turns left before the Faction's next Faction operation occurrence; absent at a level without operations. |
| Eliminated | Whether the Faction is [Eliminated](domain-model.md#factions): no from its creation, and yes once [Elimination](#elimination) applies. |
| Eliminated turn | The turn number of the [Turn](../foundation/engine-contract.md#player-actions-and-turns) that the Advance turn which made the Faction Eliminated ends; absent while Eliminated is no. |

Turns until the next level and Turns until the next operation are the Faction's two countdowns: in every [World state](../foundation/engine-contract.md#player-actions-and-turns), each countdown of a Faction that is not Eliminated is at least 1 when it is present. A Faction is never [Retired](../foundation/world-history.md#glossary): it stays in the [Live world state](../foundation/campaign-state.md#glossary) for the whole Campaign, Eliminated or not.

# Initial Factions

Every Faction is an [initial Faction](domain-model.md#initial-campaign-state): none is created after campaign creation. The Factions are created in the order in which their FactionArchetypes are [authored](../foundation/game-data-records.md#gdr-authoring-format), so the first FactionArchetype's Faction takes the [Instance ID](../foundation/campaign-instances.md#glossary) with the number 1.

Every Faction starts by entering the first level, with a [Level duration](#level-duration) outcome over its FactionArchetype's `initial_lasts_turns`, and [skips](#escalation) levels as in any later move. When the level it starts at has operations, its Turns until the next operation is an [Operation interval](#operation-interval) outcome over that level. No [Campaign configuration](../foundation/campaign-state.md#glossary) value changes an initial Faction or any of its initial values.

E.g., an `initial_lasts_turns` of `[10, 20]` keeps a Faction at the first level for 10 to 20 Advance turns, `[1, 1]` moves it to the first level's `next` in the Advance turn that ends Turn 1, and `[0, 0]` starts it at the first level's `next`.

# Faction random outcomes

Every random outcome of a Faction is one of three named random outcomes. Each belongs to one Faction, and its distribution depends only on the game data its rule names, never on another Faction.

## Level duration

A Faction has one Level duration outcome for each time it enters a Faction activity level that is not a final level, at its creation or in a later move, including a level it then skips. It is a [uniform whole-number outcome](../foundation/numbers.md#uniform-whole-number-outcomes) over the level's `lasts_turns`, or, for the first level, over the `initial_lasts_turns` of the Faction's FactionArchetype.

## Operation interval

A Faction has one Operation interval outcome for each time its Turns until the next operation is set: at its creation, at each of its Faction operation occurrences, and each time it wakes, i.e. moves from a level without operations to a level with them. It is a uniform whole-number outcome over the `operation_every_turns` of the Faction activity level the Faction is at on that occasion.

## Operation level

Each Faction operation occurrence has one Operation level outcome, a weighted choice among the keys of the `operation_level_weights` of the Faction activity level the Faction is at when the occurrence happens. The [Probability](../foundation/numbers.md#glossary) of a key is its weight divided by the sum of all the weights.

E.g., with a weight of 3 for level 1 and a weight of 1 for level 2, the occurrence has Faction operation level 1 with Probability 3 / 4.

# Faction activity

In the [Faction activity step](turn-advancement.md#turn-advancement-steps) of an Advance turn, every Faction that is not Eliminated escalates when its time at its level has run out, and then carries out an operation when one is due. The rule for one such Faction F follows, where "level" means F's Faction activity level at the moment it is read:

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

E.g., a Faction whose two countdowns are both 1 moves to its level's `next` and carries out an operation in the same Advance turn, and that operation's Operation level and Operation interval outcomes use the new level.

## Escalation

A Faction only escalates: a move takes it along `next`, and never to an earlier Faction activity level. A Level duration outcome of 0 makes the Faction skip the level it entered and go on to that level's `next`, in the same move or at its creation.

E.g., a Faction that enters a level whose `lasts_turns` is `[0, 4]` skips it with Probability 1 / 5, and every Faction skips a level whose `lasts_turns` is `[0, 0]`.

# Faction operation occurrence generation

A Faction operation occurrence of a Faction happens when its Turns until the next operation reaches 0 in [Faction activity](#faction-activity). It has three facts, from which [its Response Mission site is created](missions.md#mission-site-creation):

- its initiating Faction;
- its Faction operation level: the FactionOperationLevel whose `level` is the value of its [Operation level](#operation-level) outcome;
- its turn number: the turn number of the Turn whose Advance turn it happens in.

An occurrence happens whatever [Mission sites](domain-model.md#leads-investigations-mission-sites-and-missions) exist: an Active Response Mission site of the same Faction neither prevents nor delays it. When several Factions have an occurrence in one Advance turn, their Response Mission sites are created in the order of the initiating Factions' Instance IDs, from the lowest number.

# Elimination

Elimination puts a Faction out of action for the rest of the Campaign: its Eliminated changes from no to yes, and never back. An Eliminated Faction no longer escalates and carries out no further Faction operation occurrence.

Only an `eliminate_faction` [Effect](../foundation/effect-lists.md#glossary) makes a Faction Eliminated, applied by the [Completion effect](leads-and-progression.md#completion-effect) of a [Lead](domain-model.md#leads-investigations-mission-sites-and-missions) or as a [Mission consequence](missions.md#consequences). This [Effect kind](../foundation/effect-lists.md#effect-kinds) is defined as follows:

- **Value:** always `true`.
- **Change:** the Faction's Eliminated becomes yes and its Eliminated turn is set, at once; its Faction activity level and both countdowns keep their values. Applied to a Faction that is already Eliminated, the Effect changes nothing.
- **Supplied inputs:** the Faction to make Eliminated.
- **Combined result:** several Effects applied to the same Faction in one [Turn advancement step](domain-model.md#turn-advancement-steps) make it Eliminated once, with one Eliminated turn.

# Turn report

The [Turn report](../foundation/campaign-state.md#glossary) of an Advance turn holds, for each Faction that had a Faction operation occurrence in it, in the order of the Factions' Instance IDs, from the lowest number, the Faction's Instance ID and the Response Mission site the occurrence created, with the occurrence's FactionOperationLevel. The [History entry](../foundation/world-history.md#glossary) of the Turn the Advance turn ends holds nothing of a Faction beyond what [Missions](missions.md) holds of that Response Mission site.

# Player-visible information

How dangerous a Faction has become is never shown: the player judges it from the operations the Faction carries out. Each value below is [Player-visible information](../foundation/engine-contract.md#api-surfaces), or hidden, for every Faction alike, Eliminated or not.

| Value | Player-visible information |
| --- | --- |
| A Faction's Instance ID and its FactionArchetype, with the FactionArchetype's `name` | Yes, from campaign creation |
| A Faction's Eliminated and Eliminated turn | Yes, from campaign creation |
| Every FactionOperationLevel's `level` and `name` | Yes, from campaign creation |
| The initiating Faction, Faction operation level, and turn number of a Faction operation occurrence | Yes, once the occurrence has happened, through its Response Mission site |
| A Faction's Faction activity level, and that it has moved to a new one | No |
| A Faction's Turns until the next level and Turns until the next operation | No |
| Every FactionActivityLevel, with all its properties | No |
| Every FactionArchetype's `initial_lasts_turns` | No |
| The value of every Level duration outcome and every Operation interval outcome | No |

# TODOs

- TODO (later): Faction suppression of [Faction activity](#faction-activity).
