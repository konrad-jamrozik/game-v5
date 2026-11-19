# Charts View

| Metadata | Value |
| --- | --- |
| Spec ID | CVIEW |
| Family | UI |
| Audience | UI designer, Implementer |
| Owns | Which charts the Charts View of the Campaign screen shows, what each Faction chart counts, and in which order. |
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

# Faction charts

One chart for each [Faction](../../mechanics/domain-model.md#factions) shows how much that Faction has pressed the [Agency](../../mechanics/domain-model.md#agency-and-agents), so that the Player can tell which Faction has been the most active and whether one has fallen quiet. The Faction charts sit below the trend charts, three side by side to a row, in the order of the Factions in [Campaign state](../../foundation/core-concepts.md#campaign-and-session), and each is the size of a trend chart. Each is titled with the Faction's name and "response sites", e.g. "Red Dawn · response sites", and its series is, for each Turn, the number of [Response Mission sites](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) whose target Faction is that Faction and whose Turn created is less than that Turn, i.e. the total the Faction has produced by the start of that Turn, under [Mission site properties](../../mechanics/missions.md#mission-site-properties) in Missions. Its current value is that total in the current Turn. Every [Response Mission site](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) counts, whatever its lifecycle state. A Faction that is [Eliminated](../../mechanics/domain-model.md#factions) keeps its chart, whose series stays level from then on.

# Artboard

![Charts View panel Artboard: a full-width Panic chart with its loss limit above three smaller charts for Money at start, Serving Agents and Funding, and below them one chart of response sites for each of Red Dawn, Exalt, and Black Lotus](../../../../images/artboards/charts-view.png)

The sample values, e.g. the Turn numbers and the values of each series, appear only on the Artboard, under [Reading Artboards](../visual-design.md#reading-artboards) in Visual Design.
