# Charts View

| Metadata | Value |
| --- | --- |
| Spec ID | CVIEW |
| Family | UI |
| Audience | UI designer, Implementer |
| Owns | Which charts the Charts View of the Campaign screen shows, what each Agency chart and Faction chart counts, and in which order. |
| Conventions | [Specification Conventions](../../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../../governance/conventions/design-spec-conventions.md) |

# Overview

The Charts View lets the Player read how the [Campaign](../../foundation/core-concepts.md#campaign-and-session) has gone, [Turn](../../foundation/engine-contract.md#player-actions-and-turns) by Turn, so that a slow trend, e.g. Panic creeping up, is visible before it decides the Campaign. It is one of the Records [Detail views](../gui.md#glossary) of the [Campaign Screen](campaign-screen.md), and its charts follow [Charts](../visual-design.md#charts) in Visual Design. The Turn in which a value changed is found in the [History View](history-view.md).

# Panic chart

The Charts View leads with [Panic](../../mechanics/domain-model.md#campaign-standing), because Panic is how a [Campaign](../../foundation/core-concepts.md#campaign-and-session) is lost. The Panic chart spans the full width of the [Detail view](../gui.md#glossary) above the other charts, is at least 180 px tall at a window 1280 px wide, and draws its series in Accent with a 14% Accent fill below the line. Its current value uses a 30 px Figure style in Accent text and is written with two decimals, e.g. "24.35%". The [Panic limit](../../mechanics/panic-and-endings.md#glossary) is a 1.5 px Danger line at the limit value with a Limit band below it, labelled "LOSS AT" and the limit, e.g. "LOSS AT 100%".

# Trend charts

Three smaller charts show the resources the agency runs on. They sit side by side below the Panic chart, in this order:

1. Money at the start of each [Turn](../../foundation/engine-contract.md#player-actions-and-turns).
2. The number of [Serving](../../mechanics/agents-spec.md#agent-statuses) [Agents](../../mechanics/domain-model.md#agency-and-agents).
3. Funding.

# Agency charts

Four larger charts break the agency down, Turn by Turn: what its Agents were doing, where its money came from and went, what it owned, and how skilled its Agents were, so that the Player sees, e.g., that upkeep has outgrown income or that most Agents sit on Standby. They sit below the trend charts and above the [Faction](../../mechanics/domain-model.md#factions) charts, each spanning the full width of the [Detail view](../gui.md#glossary), in the order below. At a window 1280 px wide each plot area is at least 180 px tall. Each shows a legend in place of a current value, under [Charts](../visual-design.md#charts) in Visual Design, with its series in the order they are listed below and coloured as [Chart series colours](../visual-design.md#chart-series-colours) gives them.

Each value comes from the [History entry](../../foundation/world-history.md#glossary) of its Turn, or for the current Turn from the [Open History entry](../../foundation/world-history.md#glossary), or from the [Turn series of money](../../mechanics/economy-and-upgrades.md#turn-series-of-money), as the owners of the values declare them: the Agents under [Turn report](../../mechanics/agents-spec.md#turn-report) in Agents, and the money and caps under [Turn report](../../mechanics/economy-and-upgrades.md#turn-report) in Economy and Upgrades.

1. **Agent activity**, titled "Agents · end of Turn": for each Turn, a stacked bar of the [Serving](../../mechanics/agents-spec.md#agent-statuses) [Agents](../../mechanics/domain-model.md#agency-and-agents) in its [Turn-end state](../../foundation/engine-contract.md#player-actions-and-turns), by what each was doing: Standby, [Training](../../mechanics/agents-spec.md#assignments), [Contracting](../../mechanics/agents-spec.md#assignments), Investigating, [Deployed](../../mechanics/agents-spec.md#assignments), [Recovering](../../mechanics/agents-spec.md#agent-statuses), and [In transit](../../mechanics/domain-model.md#agency-and-agents). An [Agent](../../mechanics/domain-model.md#agency-and-agents) In transit counts as In transit whatever its [Assignment](../../mechanics/domain-model.md#agency-and-agents), a Recovering Agent as Recovering, and every other Serving Agent by the Assignment it is [At assignment](../../mechanics/domain-model.md#agency-and-agents) on, Investigating standing for an [Investigation](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions). The bar of the current Turn shows the [Current world state](../../foundation/engine-contract.md#player-actions-and-turns), so it changes with every [Player action](../../foundation/engine-contract.md#player-actions-and-turns), undo, and redo.
2. **Money flow**, titled "Money flow": for each ended Turn t, a stacked bar of what the Turn earned above the baseline and a stacked bar of what it spent below it, and a Net flow line. The income series are Funding, the funding the [Agency](../../mechanics/domain-model.md#agency-and-agents) income step of the Advance turn ending t used; Contracting income, that step's income less that funding; and [Mission](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) rewards, the money of every Consequence that applied in that Advance turn. The expenditure series are Upkeep, the upkeep of that Advance turn; Hiring, the money that the `hireAgent` items of the [Action record](../../foundation/world-history.md#glossary) of Turn t spent; [Cap Upgrades](../../mechanics/economy-and-upgrades.md#glossary), the money that its `purchaseUpgrade` items spent on a Cap Upgrade; and Other [Upgrades](../../mechanics/domain-model.md#agency-and-agents), the money that its other `purchaseUpgrade` items spent. Net flow is Money at the start of turn of Turn t + 1 less that of Turn t, so it also counts money that nothing above shows, e.g. that of `addMoney`. The current Turn has not ended, so the chart shows no bar or point for it.
3. **Assets**, titled "Assets · start of Turn": for each Turn, lines of Money at the start of turn on the left axis, and of the number of Serving Agents, the [Agent cap](../../mechanics/domain-model.md#agency-and-agents), the [Transport cap](../../mechanics/economy-and-upgrades.md#glossary), and the [Training cap](../../mechanics/economy-and-upgrades.md#glossary) in its [Turn-start state](../../foundation/engine-contract.md#player-actions-and-turns) on the right axis.
4. **Agents by [effective skill](../../mechanics/agents-spec.md#combatant-attributes)**, titled "Agents by effective skill · end of Turn": for each Turn, a stacked bar of the Serving Agents in its Turn-end state, by effective skill in bands 50 wide, i.e. 0–49, 50–99, 100–149, and so on, under [Effective skill](../../mechanics/agents-spec.md#effective-skill) in Agents, with the lowest band nearest the baseline. The legend names each band by its range, e.g. "100–149", from 0–49 up to the highest band that holds an Agent in any Turn shown. As in the Agent activity chart, the bar of the current Turn shows the Current world state.

# Faction charts

One chart for each [Faction](../../mechanics/domain-model.md#factions) shows how much that Faction has pressed the [Agency](../../mechanics/domain-model.md#agency-and-agents), so that the Player can tell which Faction has been the most active and whether one has fallen quiet. The Faction charts sit below the Agency charts, three side by side to a row, in the order of the Factions in [Campaign state](../../foundation/core-concepts.md#campaign-and-session), and each is the size of a trend chart. Each is titled with the Faction's name and "response sites", e.g. "Red Dawn · response sites", and its series is, for each Turn, the number of [Response Mission sites](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) whose target Faction is that Faction and whose Turn created is less than that Turn, i.e. the total the Faction has produced by the start of that Turn, under [Mission site properties](../../mechanics/missions.md#mission-site-properties) in Missions. Its current value is that total in the current Turn. Every [Response Mission site](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) counts, whatever its lifecycle state. A Faction that is [Eliminated](../../mechanics/domain-model.md#factions) keeps its chart, whose series stays level from then on.

# Artboard

![Charts View panel Artboard: a full-width Panic chart with its loss limit above three smaller charts for Money at start, Serving Agents and Funding, then four full-width Agency charts of Agent activity, Money flow, Assets, and Agents by effective skill, and below them one chart of response sites for each of Red Dawn, Exalt, and Black Lotus](../../../../images/artboards/charts-view.png)

The sample values, e.g. the Turn numbers and the values of each series, appear only on the Artboard, under [Reading Artboards](../visual-design.md#reading-artboards) in Visual Design.
