# Storage View

| Metadata | Value |
| --- | --- |
| Spec ID | STVIEW |
| Family | UI |
| Audience | UI designer, Implementer |
| Owns | What the Storage View of the Campaign screen shows of the Agency's Items and Ammo, and how it sells them. |
| Conventions | [Specification Conventions](../../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../../governance/conventions/design-spec-conventions.md) |

# Overview

The Storage View is where the Player sees at a glance what gear the agency owns, who wears it, and what it is worth, and sells what it does not need. It is the first of the Base [Detail views](../gui.md#glossary) of the [Campaign Screen](campaign-screen.md). Every value it shows is a [Sale value](../../mechanics/equipment.md#glossary), what selling would bring, because that is what the gear is worth to the agency. Its header shows the agency's money and what a value is, as the share of the price that [`sale_price_fraction`](../../mechanics/equipment.md#selling-items) gives, in words where it is a half and as a percentage otherwise, e.g. "Value is half the price" or "Value is 40% of the price".

# Totals

The header ends with what all the gear is worth, so that the totals cost the table below no height: the [Sale value](../../mechanics/equipment.md#glossary) of everything the agency owns, and of what is in [Storage](../../mechanics/equipment.md#storage), i.e. what selling all of it without taking anything off an [Agent](../../mechanics/domain-model.md#agency-and-agents) would bring, e.g. "Owned worth 157.50 · Available worth 102.50", each with two decimals when it is not whole.

# Storage table

The [Storage](../../mechanics/equipment.md#glossary) table lists the [Items](../../mechanics/equipment.md#glossary) and [Ammo](../../mechanics/combat.md#ammo) in three groups, Weapons, Armor, and Ammo, each under a group row that sums its category's counts: the [Owned count](../../mechanics/equipment.md#glossary), the [Equipped count](../../mechanics/equipment.md#glossary), and the count in Storage. Within a group, the rows are in the order the [Game build](../../foundation/core-concepts.md#game-build-and-content) supplies them, and a row whose Owned count is 0 is left out; a group with no row says "Nothing in Storage". The columns are:

| Column | What it shows |
| --- | --- |
| Item | The `name` of the [Item](../../mechanics/equipment.md#glossary) or the [AmmoType](../../mechanics/combat.md#ammotype). |
| Stats | For a Weapon, its `base_weapon_damage` with the sword icon and its AmmoType's `name`, e.g. "14 ⚔ Rifle ammo"; for an Armor, its `base_armor` with the shield icon, e.g. "20 🛡"; for an AmmoType, its count in Storage against the rounds [Ammo short](../../mechanics/equipment.md#ammo-short) asks for and the number of Agents whose Weapons use it, e.g. "95 / 130 recommended (13 Agents)". While the AmmoType is [Ammo short](../../mechanics/equipment.md#glossary), its Stats are in Accent text with the warning icon in Warning, whose tooltip names the AmmoType, its rounds in Storage, and the rounds it falls short of, e.g. "Pistol ammo 69, below 70 for 7 Agents". |
| Owned, Equip., Avail. | The Owned count, the Equipped count, or "–" for an AmmoType, and the count in Storage. |
| Unit | The Sale value of one, [with two decimals](../gui.md#decimal-quantities-shown) when it is not whole, e.g. "0.50". |
| Sell | A [stepper](../visual-design.md#steppers), from 0 to the count in Storage, or to the Owned count while Allow selling equipped is checked, and a "max" button that sets it to that limit. |
| Earns | The Sale value of the Sell count, with two decimals when not whole, so that the Player sees what each row adds to the sale; empty while the Sell count is 0. |

# Selling

A sell bar gathers the counts chosen in the Sell column into one sale, so that the Player can sell several kinds of Items and Ammo in one [Player action](../../foundation/engine-contract.md#player-actions-and-turns) and see what it brings before committing. Like the buy bar of the [Acquisitions View](acquisitions-view.md#buying), its parts start at its left edge:

1. **What is sold:** each Item and AmmoType whose Sell count is above 0, one per line, by count and `name`, under the label "Selling", e.g. "2 Rifles", "1 Ballistic vest", and "50 Pistol ammo".
2. **What it brings:** the [Sale value](../../mechanics/equipment.md#selling-items) of the whole sale, rounded down once as the action rounds it, and the money after it, e.g. "Earns +155 · Money after 4,365".
3. **Allow selling equipped:** a checkbox, unchecked whenever the Storage View opens. While it is unchecked, no Sell count can exceed the count in Storage. While it is checked and the sale takes Items off Agents, the bar adds one line per such [Agent](../../mechanics/domain-model.md#agency-and-agents) in the order [Selling Items](../../mechanics/equipment.md#selling-items) takes them, e.g. "agent-12 loses Rifle → Knife".
4. **Clear,** which sets every Sell count to 0, and **Sell,** labelled with the Sale value, which makes one [`sellItems`](../../mechanics/equipment.md#selling-items) with the chosen counts and the checkbox as `takeEquipped`, at once and without a confirmation, because Undo Action takes it back. Both are disabled while every Sell count is 0.

After a sale every Sell count is 0 again.

# Screenshot

The Storage View as the game draws it:

![Storage View Screenshot](../../../../images/screens/storage-view.png)

_Captured on 2026-11-23 19:47 UTC._
