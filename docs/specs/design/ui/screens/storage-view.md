# Storage View

| Metadata | Value |
| --- | --- |
| Spec ID | STVIEW |
| Family | UI |
| Audience | UI designer, Implementer |
| Owns | What the Storage View of the Campaign screen shows of the Agency's Items and Ammo, and how it sells them. |
| Conventions | [Specification Conventions](../../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../../governance/conventions/design-spec-conventions.md) |

# Overview

The Storage View is where the Player sees at a glance what gear the agency owns, who wears it, and what it is worth, and sells what it does not need. It is the fourth of the Operations [Detail views](../gui.md#glossary) of the [Campaign Screen](campaign-screen.md). Every value it shows is a [Sale value](../../mechanics/equipment.md#glossary), what selling would bring, because that is what the gear is worth to the agency. Its header shows the agency's money.

# Totals

Under the title, a table of totals has one row per category, Weapons, Armor, and [Ammo](../../mechanics/combat.md#ammo), and a Total row, with these columns: Owned, Equipped, Available, Owned value, and Available value. Owned is the [Owned count](../../mechanics/equipment.md#glossary), Equipped the [Equipped count](../../mechanics/equipment.md#glossary), and Available the count in [Storage](../../mechanics/equipment.md#storage), each summed over the category; Ammo has no Equipped count and shows "–". Owned value and Available value are the [Sale value](../../mechanics/equipment.md#glossary) of the Owned and of the Available count of the category. The Total row sums only the values.

# Storage table

The [Storage](../../mechanics/equipment.md#glossary) table lists the [Items](../../mechanics/equipment.md#glossary) and Ammo in three groups, Weapons, Armor, and Ammo, each under a group row that can be folded and that repeats its category's totals. Within a group, the rows are in the order the [Game build](../../foundation/core-concepts.md#game-build-and-content) supplies them, and a row whose Owned count is 0 is left out; a group with no row says "Nothing in Storage". The columns, in this order, are:

| Column | What it shows |
| --- | --- |
| Item | The `name` of the [Item](../../mechanics/equipment.md#glossary) or the [AmmoType](../../mechanics/combat.md#ammotype). |
| Stats | For a Weapon, its `base_weapon_damage` followed by the sword icon and its AmmoType's `name`, e.g. "14 ⚔ Rifle ammo"; for an Armor, its `base_armor` followed by the shield icon, e.g. "20 🛡"; for an AmmoType, its count in Storage against the rounds [Ammo short](../../mechanics/equipment.md#ammo-short) asks for and the number of Agents whose Weapons use it, e.g. "95 / 130 needed (13 Agents)", with the warning icon in Warning while it is Ammo short. |
| Owned, Eq., Avail. | The Owned count, the Equipped count, or "–" for an AmmoType, and the count in Storage. |
| Unit | The Sale value of one, [with two decimals](../gui.md#decimal-quantities-shown) when it is not whole, e.g. "0.50". |
| Owned value, Avail. value | The Sale value of the Owned and of the Available count, with two decimals when not whole. |
| Sell | A stepper with a number field, from 0 to the count in Storage, or to the Owned count while Allow selling equipped is checked, and a "max" button that sets it to that limit. |

# Selling

A sell bar along the bottom of the Storage View gathers the counts chosen in the Sell column into one sale, so that the Player can sell several kinds of Items and Ammo in one [Player action](../../foundation/engine-contract.md#player-actions-and-turns) and see what it brings before committing:

1. **What is sold:** each Item and AmmoType whose Sell count is above 0, by `name` and count, e.g. "Selling 2 Rifles · 1 Ballistic vest · 50 Pistol ammo".
2. **What it brings:** the [Sale value](../../mechanics/equipment.md#selling-items) of the whole sale, rounded down once as the action rounds it, and the money after it, e.g. "Earns +155 · Money after 4,365".
3. **Allow selling equipped:** a checkbox, unchecked whenever the Storage View opens. While it is unchecked, no Sell count can exceed the count in Storage. While it is checked and the sale takes Items off Agents, the bar adds one line per such [Agent](../../mechanics/domain-model.md#agency-and-agents) in the order [Selling Items](../../mechanics/equipment.md#selling-items) takes them, e.g. "agent-12 loses Rifle → Knife".
4. **Clear,** which sets every Sell count to 0, and **Sell,** a primary button labelled with the Sale value, which makes one [`sellItems`](../../mechanics/equipment.md#selling-items) with the chosen counts and the checkbox as `takeEquipped`, at once and without a confirmation, because Undo Action takes it back. Both are disabled while every Sell count is 0, and Sell also while [Action preview](../../foundation/player-api.md#action-preview) reports that the engine would reject the sale.

After a sale every Sell count is 0 again.

# Screenshot

The Storage View as the game draws it:

![Storage View Screenshot](../../../../images/screens/storage-view.png)

_Captured on 2026-11-23._
