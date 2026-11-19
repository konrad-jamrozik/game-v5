# Upgrades View

| Metadata | Value |
| --- | --- |
| Spec ID | UVIEW |
| Family | UI |
| Audience | UI designer, Implementer |
| Owns | What the Upgrades View of the Campaign screen shows and how it purchases Upgrades. |
| Conventions | [Specification Conventions](../../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../../governance/conventions/design-spec-conventions.md) |

# Overview

The Upgrades View is where the Player spends money on the agency itself, so it shows for each [Upgrade](../../mechanics/domain-model.md#agency-and-agents) what one more purchase changes and whether the agency can afford it. It is the last of the Operations [Detail views](../gui.md#glossary) of the [Campaign Screen](campaign-screen.md). Its header shows the agency's money.

# Upgrade cards

The [Upgrades](../../mechanics/domain-model.md#agency-and-agents) are cards side by side, four to a row, one per Upgrade [GDR](../../foundation/core-concepts.md#game-build-and-content) of the [Game build](../../foundation/core-concepts.md#game-build-and-content), in the order the Game build supplies them, under [Panels and cards](../visual-design.md#panels-and-cards) in Visual Design. Each card shows, under [Upgrades](../../mechanics/economy-and-upgrades.md#upgrades) in Economy and Upgrades:

- Its `name` and its kind: [Cap Upgrade](../../mechanics/economy-and-upgrades.md#glossary), [Weapon damage Upgrade](../../mechanics/economy-and-upgrades.md#glossary), [Base health Upgrade](../../mechanics/economy-and-upgrades.md#glossary), or [Rate Upgrade](../../mechanics/economy-and-upgrades.md#glossary).
- What one more acquisition changes, by its `effect` and `increment`:
  - **Cap Upgrade:** the cap it raises, with its current value and its value after one more acquisition, e.g. "Agent cap 12 → 14", under [Agency caps](../../mechanics/economy-and-upgrades.md#agency-caps) in Economy and Upgrades.
  - **Weapon damage Upgrade:** the [Increment](../../mechanics/economy-and-upgrades.md#glossary) it adds to the [base weapon damage](../../mechanics/agents-spec.md#combatant-attributes) of every [Serving](../../mechanics/agents-spec.md#agent-statuses) [Agent](../../mechanics/domain-model.md#agency-and-agents) and of every Agent created later, e.g. "+2 base weapon damage", under [Weapon damage Upgrade](../../mechanics/economy-and-upgrades.md#weapon-damage-upgrade) in Economy and Upgrades.
  - **Base health Upgrade:** the Increment it adds to the [base health](../../mechanics/agents-spec.md#combatant-attributes) of every Serving Agent and of every Agent created later, e.g. "+1 base health", under [Base health Upgrade](../../mechanics/economy-and-upgrades.md#base-health-upgrade) in Economy and Upgrades.
  - **Rate Upgrade:** the rate it raises, with its current value and its value after one more acquisition, e.g. "Exhaustion recovery 5.00 → 5.50", under [Rate Upgrades](../../mechanics/economy-and-upgrades.md#rate-upgrades) in Economy and Upgrades. The health recovery percentage is shown as a percentage, e.g. "Health recovery 2.00% → 2.20%". Each rate is a [Decimal quantity](../../foundation/numbers.md#glossary), shown with two decimals under [Decimal quantities shown](../gui.md#decimal-quantities-shown) in Graphical User Interface.
- Its [Acquisitions](../../mechanics/economy-and-upgrades.md#glossary) so far, as a count, e.g. "Bought 2×".
- A primary Buy button labelled with its `price`, which makes one `purchaseUpgrade` [Player action](../../foundation/engine-contract.md#player-actions-and-turns), under [Purchasing Upgrades](../../mechanics/economy-and-upgrades.md#purchasing-upgrades) in Economy and Upgrades. While money is below the price, the button is disabled and the card says how much money is missing, in Danger, beside the button.
- Below the Buy button, a tally of its Acquisitions, under [Tallies](../visual-design.md#tallies) in Visual Design, so that the button keeps its place on the card as the tally grows.

The cards of one row line up these parts with one another, so that every Buy button of the row sits on one line and starts at its card's left content edge, whatever the length of each card's change or note, under [Alignment](../visual-design.md#alignment) and [Buttons](../visual-design.md#buttons) in Visual Design.

# Artboard

![Upgrades View panel Artboard: the agency's money in the header and one card per Upgrade in two rows of four, each with its kind, the value it changes before and after one more acquisition, its Acquisitions as a count, a Buy button with its price, one of them disabled with the money missing, and a tally of squares of its Acquisitions under the button](../../../../images/artboards/upgrades-view.png)

The sample values, e.g. the Upgrade names, prices, and caps, appear only on the Artboard, under [Reading Artboards](../visual-design.md#reading-artboards) in Visual Design.
