# Upgrades View

| Metadata    | Value                                                                                                                                                                            |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | UVIEW                                                                                                                                                                            |
| Family      | UI                                                                                                                                                                               |
| Audience    | UI designer, Implementer                                                                                                                                                         |
| Owns        | What the Upgrades View of the Campaign screen shows and how it purchases Upgrades.                                                                                               |
| Conventions | [Specification Conventions](../../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../../governance/conventions/design-spec-conventions.md) |

# Overview

The Upgrades View is where the Player spends money on the agency itself, so it shows for each [Upgrade](../../mechanics/domain-model.md#agency-and-agents) what one more
purchase changes and whether the agency can afford it. It is the last of the Operations
[Detail views](../gui.md#glossary) of the [Campaign Screen](campaign-screen.md). Its header shows the agency's money.

# Upgrade cards

The [Upgrades](../../mechanics/domain-model.md#agency-and-agents) are cards side by side, one per Upgrade [GDR](../../foundation/core-concepts.md#game-build-and-content) of the [Game build](../../foundation/core-concepts.md#game-build-and-content), in the order the Game build supplies
them, under [Panels and cards](../visual-design.md#panels-and-cards) in Visual Design. Each card shows, under
[Upgrades](../../mechanics/economy-and-upgrades.md#upgrades) in Economy and Upgrades:

- Its `name` and its kind: [Cap Upgrade](../../mechanics/economy-and-upgrades.md#glossary) or [Weapon damage Upgrade](../../mechanics/economy-and-upgrades.md#glossary).
- What one more acquisition changes, by its `effect` and `increment`:
  - **Cap Upgrade:** the cap it raises, with its current value and its value after one more acquisition, e.g.
    "Agent cap 12 → 14", under [Agency caps](../../mechanics/economy-and-upgrades.md#agency-caps) in Economy and Upgrades.
  - **Weapon damage Upgrade:** the [Increment](../../mechanics/economy-and-upgrades.md#glossary) it adds to the [base weapon damage](../../mechanics/agents-spec.md#combatant-attributes) of every [Serving](../../mechanics/agents-spec.md#agent-statuses) [Agent](../../mechanics/domain-model.md#agency-and-agents) and of every
    Agent created later, e.g. "+2 base weapon damage", under [Weapon damage Upgrade](../../mechanics/economy-and-upgrades.md#weapon-damage-upgrade) in Economy and Upgrades.
- Its [Acquisitions](../../mechanics/economy-and-upgrades.md#glossary) so far, e.g. "Bought 2×".
- A primary Buy button labelled with its `price`, which makes one `purchaseUpgrade` [Player action](../../foundation/engine-contract.md#player-actions-and-turns), under
  [Purchasing Upgrades](../../mechanics/economy-and-upgrades.md#purchasing-upgrades) in Economy and Upgrades. While money is below the price, the button is disabled and the
  card says how much money is missing, in Danger.

# Artboard

![Upgrades View panel Artboard: the agency's money in the header and one card per Upgrade, each with its kind, the value it changes before and after one more acquisition, its Acquisitions, and a Buy button with its price, one of them disabled with the money missing](../../../../images/artboards/upgrades-view.png)

The sample values, e.g. the Upgrade names, prices, and caps, appear only on the Artboard, under
[Reading Artboards](../visual-design.md#reading-artboards) in Visual Design.
