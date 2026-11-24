# Equipment

| Metadata | Value |
| --- | --- |
| Spec ID | EQUIP |
| Family | Mechanics |
| Audience | Engine designer, Content designer, AI designer, Implementer |
| Owns | Items, the Storage of the Agency, which Items are Unlocked, equipping Agents, buying and selling Items, Ammo short, Mission equipment losses and Spoils of war, the EquipmentParameters GDR, and the equipAgent, buyItems, and sellItems actions. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

What an [Agent](domain-model.md#agency-and-agents) carries into a [Combat](domain-model.md#combat) is the Agency's own stock, not a gift of the game. The [Agency](domain-model.md#agency-and-agents) keeps its Weapons, Armors, and rounds of Ammo in its Storage, as counts. An Agent wears one Weapon and one Armor taken from Storage, every attack an Agent makes spends a round from Storage, a Won Mission brings the Enemies' Weapons back as spoils, and a lost one can cost the Agents' gear. The Player buys an Item once an interrogation has unlocked it, and can sell any Item at half its price.

Equipment builds on [Combat](combat.md), which owns the Weapon, Armor, and AmmoType GDRs and says what a Weapon's damage, an Armor's armor, and a round do in a Combat; Equipment says how the Agency comes to have them and who carries them.

# Glossary

| Term | Definition | Prohibited synonyms |
| --- | --- | --- |
| Item | A [Weapon](combat.md#weapon) or an [Armor](combat.md#armor) that has a `price`, i.e. one the [Agency](domain-model.md#agency-and-agents) can hold in Storage, buy, and sell. | Inventory item; gear piece |
| Storage | What the Agency holds and no [Agent](domain-model.md#agency-and-agents) wears: for each Item and each [AmmoType](combat.md#ammotype), a count of at least 0. | Inventory; armory |
| Fallback Armor | The Armor an Agent wears when it wears no Item Armor, `fallback_armor` of [EquipmentParameters](#equipmentparameters), e.g. a uniform. It is never an Item and cannot be taken away, and neither can the [Fallback Weapon](combat.md#ammo). |  |
| Equipped count | For one Item, the number of [Serving](agents-spec.md#agent-statuses) Agents wearing it. |  |
| Owned count | For one Item, its count in Storage plus its Equipped count; for one AmmoType, its count in Storage. |  |
| Unlocked | Whether the Agency may buy an Item or an AmmoType. |  |
| Sale value | The money selling Items brings: [a share of their `price`](#selling-items). |  |
| Ammo short | Whether Storage holds fewer rounds of an AmmoType than the Serving Agents whose Weapons use it should have at hand. |  |
| Recovered Item | An Item worn by an Agent [Killed](agents-spec.md#agent-statuses) in a Won [Mission](domain-model.md#leads-investigations-mission-sites-and-missions), which goes back into Storage. Spoils of war are never Recovered Items. | Returned item |
| Spoils of war | The Weapons and [Ammo](combat.md#ammo) a Won [Mission](domain-model.md#leads-investigations-mission-sites-and-missions) adds to Storage. | Loot |

# Equipment GDRs

What an Item and a round cost, and which interrogation unlocks them, are game data, so that the Agency's stock can be rebalanced without changing a rule. The [Weapon](combat.md#weapon), [Armor](combat.md#armor), and [AmmoType](combat.md#ammotype) GDRs of [Combat](domain-model.md#combat) carry the properties `price` and `unlocked_by`, and a Weapon also `ammo_type`; they are stated there, and the rules below read them.

## EquipmentParameters

EquipmentParameters bundles the values the rules of Equipment read.

| Property | Meaning | Read by |
| --- | --- | --- |
| `fallback_armor` | A reference to the Fallback Armor: an Armor with no `price`. | [Equipping Agents](#equipping-agents) |
| `starting_ammo` | For each AmmoType it lists, the rounds of it in the Storage of a new [Campaign](../foundation/core-concepts.md#campaign-and-session), a whole number of at least 1. An AmmoType it does not list starts at 0. | [Storage](#storage) |
| `hire_ammo` | For each AmmoType it lists, the rounds of it that each hired Agent brings into Storage, a whole number of at least 1. An AmmoType it does not list gains none. | [Equipment of new and departing Agents](#equipment-of-new-and-departing-agents) |
| `sale_price_fraction` | The share of `price` that selling brings: a decimal number greater than 0 and at most 1. | [Selling Items](#selling-items) |
| `spoils_ammo_max` | The most rounds that one Weapon of the spoils of war brings with it: a whole number of at least 0. | [Spoils of war](#spoils-of-war) |
| `ammo_short_rounds_per_agent` | How many rounds Storage should hold for each Serving Agent whose Weapon uses an AmmoType: a whole number of at least 0. | [Ammo short](#ammo-short) |

# Storage

The Agency's Storage is an [Authoritative value](../foundation/core-concepts.md#value-classification) of its [State](../foundation/core-concepts.md#campaign-instances): for each Item and each AmmoType the [Game build](../foundation/core-concepts.md#game-build-and-content) supplies, a whole number of at least 0. Storage holds counts, not individual Items: two Items of one Weapon are interchangeable.

The Storage of the initial [Campaign state](../foundation/core-concepts.md#campaign-and-session) holds the rounds `starting_ammo` lists and no Item. The Agents of the [Initial roster](agents-spec.md#initial-roster) wear what their AgentArchetype gives them, which comes from no Storage.

A rule that puts an Item or rounds in Storage raises its count, and one that takes them out lowers it; no rule takes out more than Storage holds. An Item that leaves the Agency in any other way, e.g. with the [Mission equipment losses](#mission-equipment-losses), changes no count.

# Unlocked Items

The Agency can buy only what its interrogations have shown it where to get, and the Player learns what an interrogation unlocks only once it is completed.

An Item is Unlocked when it has no `unlocked_by`, or when at least one [Lead](domain-model.md#leads-investigations-mission-sites-and-missions) that its `unlocked_by` lists is completed, i.e. the [`lead_completed`](leads-and-progression.md#lead-completed-condition-kind) [Condition](../foundation/conditions.md#glossary) naming it holds. Once Unlocked, an Item stays Unlocked for the rest of the Campaign. An AmmoType is Unlocked exactly when at least one Weapon whose `ammo_type` it is is Unlocked. Unlocked is a [Derived value](../foundation/core-concepts.md#value-classification) of the [World state](../foundation/engine-contract.md#player-actions-and-turns), never stored. E.g., with `unlocked_by` listing the interrogate Lead of a Lieutenant of each Faction, completing any one of them unlocks the Item.

Being Unlocked governs only buying: an Item that is not Unlocked can still be in Storage, e.g. from the spoils of war, and can be equipped and sold.

# Equipping Agents

Every Serving Agent wears exactly one Weapon and one Armor, its equipped values under the [Combatant Role Type](agents-spec.md#combatant-role-type). Each is either an Item or the Fallback Weapon or Fallback Armor.

The [Player action](../foundation/engine-contract.md#player-actions-and-turns) `player.actions.equipAgent(agent, equipment)` puts on the Agent that `agent` identifies the Weapon or Armor that `equipment` identifies, in place of the one it wears of the same kind. It requires that the Agent is Serving, that it does not already wear `equipment`, and that `equipment` is the Fallback Weapon, the Fallback Armor, or an Item whose count in Storage is at least 1. It is allowed whatever the Agent's [Assignment](domain-model.md#agency-and-agents) and [Agent status](domain-model.md#agency-and-agents), [Deployed](agents-spec.md#assignments) included.

When the action is accepted, at once and within the same [Turn](../foundation/engine-contract.md#player-actions-and-turns):

1. An Item taken off the Agent goes into Storage; the Fallback Weapon and the Fallback Armor go nowhere.
2. An Item put on the Agent is taken out of Storage.
3. The Agent's Weapon and [base weapon damage](agents-spec.md#combatant-attributes), or Armor and [base armor](agents-spec.md#combatant-attributes), become those of `equipment`, i.e. its `base_weapon_damage` or `base_armor`.

E.g., an Agent wearing a pistol is equipped with a rifle while Storage holds 2 rifles and 0 pistols: Storage then holds 1 rifle and 1 pistol.

## Equipment of new and departing Agents

A new Agent wears the `weapon` and the `armor` of its [AgentArchetype](agents-spec.md#agentarchetype), whichever rule [creates](agents-spec.md#agent-creation) it; they come with its hire, from no Storage. Each Agent that [`hireAgents`](economy-and-upgrades.md#hiring-agents) hires also puts the rounds `hire_ammo` lists into Storage, so that it does not join with an empty magazine; an Agent that another rule creates, e.g. one of the Initial roster, brings none. E.g., with a `hire_ammo` of 10 pistol rounds, hiring 3 Agents adds 30 pistol rounds to Storage. When an Agent is [Dismissed](agents-spec.md#agent-status), every Item it wears goes into Storage. What becomes of the Items of an Agent [Killed](agents-spec.md#agent-statuses) in a [Combat](domain-model.md#combat) is decided by [Mission equipment losses](#mission-equipment-losses).

# Buying Items

The Player action `player.actions.buyItems(items)` buys several Items and rounds at once, so that one Player action fills Storage. `items` lists one or more entries, each an Item or an AmmoType with a count, a whole number of at least 1, and names each Item or AmmoType at most once.

```text
cost = sum over the entries of ( price × count )
```

It requires that every entry is Unlocked and that the Agency's money is at least the cost; when any requirement fails, it buys nothing. When accepted, the Agency's money falls by the cost and every entry's count goes into Storage, at once, within the same Turn. E.g., 2 Items of price 200 and 100 rounds of price 1 cost 500.

# Selling Items

The Player action `player.actions.sellItems(items, takeEquipped)` sells several Items and rounds at once for their Sale value. `items` lists entries as for `buyItems`, and `takeEquipped` says whether Items that Agents wear may be sold.

```text
Sale value = round down( sale_price_fraction × sum over the entries of ( price × count ) )
```

The sum is [evaluated exactly](../foundation/numbers.md#exact-evaluation) and [rounded](../foundation/numbers.md#rounding) once, for the whole action. E.g., with a `sale_price_fraction` of 0.5, selling 1 Item of price 30 and 51 rounds of price 1 brings `round down(0.5 × 81) = 40`.

Each entry requires that its count is at most its count in Storage, or, when `takeEquipped` is yes and the entry is an Item, at most its Owned count; when any entry fails, the action sells nothing. When accepted, at once and within the same Turn:

1. Each entry's count is taken out of Storage, as far as Storage holds it.
2. For an Item whose count exceeds what Storage held, the rest is taken off the Serving Agents wearing it, one Item per Agent, from the Agent with the lowest [effective skill](agents-spec.md#combatant-attributes); among Agents of equal effective skill, from the one whose [Instance ID](../foundation/campaign-instances.md#glossary) has the higher number. Each such Agent then wears the Fallback Weapon or the Fallback Armor in its place.
3. The Agency's money rises by the Sale value.

E.g., Storage holds 1 rifle and three Agents wear one: agent-4 of effective skill 80, and agent-9 and agent-12 of effective skill 55. Selling 3 rifles with `takeEquipped` yes takes the one in Storage, then agent-12's, then agent-9's, and agent-4 keeps its rifle.

# Ammo short

The Agency should not send Agents into a Combat with too few rounds for their Weapons, so an AmmoType is Ammo short when

```text
count in Storage  <  ammo_short_rounds_per_agent × N
```

where N is the number of Serving Agents whose Weapon's `ammo_type` is that AmmoType. Ammo short is a Derived value and changes no rule; it is for the Player to see. E.g., with an `ammo_short_rounds_per_agent` of 10, seven Agents whose Weapons use one AmmoType make it Ammo short at 69 rounds and not at 70.

# Mission equipment

A Mission settles the equipment of its team when it is [resolved](missions.md#resolving-one-mission), so that winning pays and losing costs gear. Ammo is spent attack by attack, by [Combat](combat.md#ammo-in-a-combat), and is never lost otherwise.

## Mission equipment losses

What becomes of the Items worn by the Agents of a Mission's Team sent depends on its [Combat outcome](combat.md#combat-rounds-and-results):

| Combat outcome | Agents Killed in the Combat | Survivors |
| --- | --- | --- |
| Won | Their Items go into Storage as Recovered Items. | Keep their Items. |
| Retreated | Their Items are lost. | Keep their Items. |
| Wiped | Their Items are lost. | Their Items are lost, and each then wears the Fallback Weapon and the Fallback Armor. |

A Killed Agent keeps the reference to the Weapon and the Armor it wore, as part of its [Service record](agents-spec.md#service-record), whatever became of them.

## Spoils of war

A Won Mission brings back what the Enemies carried, except their Armor, which the fight has ruined.

When a Mission is Won, for every [Enemy](domain-model.md#combat) of its [Mission site](domain-model.md#leads-investigations-mission-sites-and-missions), whatever became of it in the Combat, whose Weapon is an Item:

1. One Item of that Weapon goes into Storage.
2. That Weapon has one named random outcome, its spoils ammo outcome: a [uniform whole-number outcome](../foundation/numbers.md#uniform-whole-number-outcomes) from 0 to `spoils_ammo_max`, both included. That many rounds of its `ammo_type` go into Storage.

E.g., with a `spoils_ammo_max` of 4, a Won Mission against four Enemies with rifles and one with a machine gun adds 4 rifles and 1 machine gun to Storage, and, with the spoils ammo outcomes 3, 0, 4, 1, and 2, 8 rounds of rifle Ammo and 2 of machine gun Ammo.

# Turn report

The [Turn report](../foundation/campaign-state.md#glossary) of an Advance turn holds, for each Mission resolved in it, the Items lost, the Recovered Items, and the Spoils of war, each as counts per Item or AmmoType, and, for each [Combat report](combat.md#combat-report), the rounds of each AmmoType its Combat spent. It also holds the Items and AmmoTypes that became Unlocked in it. The [History entry](../foundation/world-history.md#glossary) of the Turn the Advance turn ends holds all of these.

# Player-visible information

A player decides what to equip, buy, and sell from what the Agency holds, so the Storage, every Equipped count and Owned count, whether each Item and AmmoType is Unlocked and Ammo short, and every property of EquipmentParameters are [Player-visible information](../foundation/engine-contract.md#api-surfaces) from the moment they exist. The `unlocked_by` of a Weapon or an Armor is not Player-visible information, so that the Player learns what an interrogation unlocks only when it is completed.

# TODOs

- TODO (later): Armor taken as spoils of war, e.g. a chance that an Enemy's Armor survives the fight.
- TODO (later): Ammo that Enemies spend.
