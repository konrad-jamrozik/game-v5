# Turn Summary

| Metadata | Value |
| --- | --- |
| Spec ID | TSUM |
| Family | UI |
| Audience | UI designer, Implementer |
| Owns | When the Turn summary dialog of the Campaign screen appears, which Summary events it shows, and how the Player steps through them. |
| Conventions | [Specification Conventions](../../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../../governance/conventions/design-spec-conventions.md) |

# Overview

The Turn summary tells the Player, as soon as an Advance turn ends, what it did that the Player must know before going on, so that a won Mission or a new Mission site is not missed in the full Turn report, and leads from a new Mission site straight to deploying to it. It shows one Summary event at a time, each under a large picture with all its details, so that every event gets the Player's attention on its own, and the Player steps through them or jumps to the full Turn report. The Player can reopen it later in the Turn. It is a [dialog](../visual-design.md#dialogs) over the [Campaign Screen](campaign-screen.md).

# Glossary

| Term | Definition |
| --- | --- |
| Turn summary | The dialog that shows what an Advance turn did, one [Summary event](#summary-events) at a time, shown after it only when it did something the Player must know. |
| Summary event | One thing an Advance turn did that the Turn summary [shows on its own](#summary-events), e.g. one Mission resolved or one new Mission site. |
| Event art | The [picture](#layout) at the top of the Turn summary that illustrates the Summary event shown. |

# Summary events

After an Advance turn that the Player requested through the GUI is committed, the GUI shows the Turn summary when that Advance turn has at least one Summary event other than an Expired [Mission site](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), which the [Situation panel](situation-panel.md#glossary) [already shows](situation-panel.md#groups), and shows nothing otherwise. Once shown, or reopened, the Turn summary shows the Expired Mission sites as well. It reads every Summary event from the [Turn report](../../foundation/campaign-state.md#glossary) and the [Current world state](../../foundation/engine-contract.md#player-actions-and-turns).

The Summary events come in these kinds, in this order, and in the order of the Turn report within a kind. Each kind has a colour, which marks its [dot](#stepping-through-events) and the eyebrow above its title.

| Kind | One Summary event for each | Colour |
| --- | --- | --- |
| Mission | [Mission](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) resolved, Won or Lost | Accent when Won, Danger when Lost |
| Investigation completed | [Investigation](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) that [completed in the Advance turn](../../mechanics/investigations.md#turn-report) | Investigation |
| Lead discovered | [Lead](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) [discovered in the Advance turn](../../mechanics/leads-and-progression.md#turn-report) | Notice |
| New Mission site | Mission site [created in the Advance turn](../../mechanics/missions.md#turn-report) | Warning |
| Expired Mission site | Mission site that became Expired in the Advance turn; one that became Cancelled is left out | Danger deep |
| Investigation interrupted | item of the [section of that name](turn-report-view.md#sections) in the Turn Report View | Text muted |

Each Summary event has a title, a tag beside its kind, a meta line under its title, and details, so that the Player needs the full Turn report only for what a Summary event does not hold:

- **Mission:** titled by the [Mission site title](../gui.md#glossary) of its Mission site, whose details form the meta line, with the number of Agents deployed. Its tag is "Won", or "Lost" with the [Combat outcome](../../mechanics/combat.md#combat-rounds-and-results), e.g. "Lost · Retreated". Its details are:
  - its [Consequences](../../mechanics/missions.md#consequences) as the [Consequences section](turn-report-view.md#sections) of the Turn Report View lists them for it, with its rise in the [Contracting cap](../../mechanics/economy-and-upgrades.md#glossary), e.g. "Reputation increased for first apprehension: our [Contracting](../../mechanics/agents-spec.md#assignments) network expands by 4";
  - its Recovered and Spent equipment as the [Equipment section](turn-report-view.md#sections) lists them, each with the number of [Items](../../mechanics/equipment.md#glossary), the number of rounds, and their [Sale value](../../mechanics/equipment.md#glossary), e.g. "Recovered: 3 Items, 11 rounds · worth 165", and each left out when empty;
  - its Agents: the number deployed, the Agents killed, by name, and the number sent to [Recovery](../../mechanics/agents-spec.md#assignments);
  - the Leads discovered that the Turn report credits to it, by `name`;
  - a link that opens its [Combat replay](combat-replay.md#glossary).
- **Investigation completed:** titled by its Lead's `name`. Its tag is the number of [Turns](../../foundation/engine-contract.md#player-actions-and-turns) from its Turn started to the Turn the Advance turn ended, e.g. "After 4 Turns". Its details are its final [Investigation progress](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) over its Lead's [Required progress range](../../mechanics/investigations.md#glossary), the gain of the Advance turn, its [Progress bar](../gui.md#glossary), and the Mission site its completion created, if any; and, when its Lead's [Completion effect](../../mechanics/leads-and-progression.md#completion-effect) holds `unlock_contracting`, a line saying that Agents can now be assigned to [Contracting](../../mechanics/agents-spec.md#assignments) in the [Agents View](agents-view.md), e.g. "Contracting unlocked: assign Agents to it in the Agents View", which opens the Agents View when selected, so that the Player learns where the new work is started.
- **Lead discovered:** titled by its `name`, with its [Faction](../../mechanics/domain-model.md#factions), if any, on the meta line. Its tag names the Mission it is credited to, if any. Its details are its `description`, without its Required progress range, and a link that opens the [Leads View](leads-view.md).
- **New Mission site:** titled by its MissionSiteArchetype's `name`, tagged by its kind, with its Faction and its origin, i.e. the Lead of its origin Investigation or its target Faction, on the meta line. Its details are its Turns until expiration, its number of Enemies with their [Combat rating](../../mechanics/combat.md#combat-rating), its rewards and its penalties as [Consequences](../visual-design.md#consequences), and a link to [its Mission site](#links).
- **Expired Mission site:** titled by its MissionSiteArchetype's `name`, tagged by its kind, with its Faction on the meta line. Its details are its [Consequences](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) and a link to [its Mission site](#links).
- **Investigation interrupted:** titled by its Lead's `name`, tagged "Interrupted", with no details beyond the reason, that its [Lead can no longer be investigated](../../mechanics/investigations.md#lead-no-longer-available).

Each Consequence is [coloured by whether it is good or bad for the Player](../visual-design.md#consequences), the rise in the Contracting cap in Positive, Recovered in Positive, Spent and each [Agent](../../mechanics/domain-model.md#agency-and-agents) killed in Danger.

# Layout

The Turn summary is 1120 px wide and 736 px tall in the [Reference window](../visual-design.md#reference-window), with 24 px above and below it, so that the Event art can take most of the screen. From top to bottom it holds:

1. **Event art,** 1120 × 480 px, i.e. 21:9, the widest standard ratio that leaves room for the details below it. Art for it is painted at 2240 × 960 px, so that it stays sharp on a display of twice the density. At its top left stand the title "Turn N summary" and "Now Turn N+1"; over its bottom, which fades into the Surface, stand the eyebrow, i.e. a dot in the colour of the Summary event's kind, the kind, and the tag, then the title, then the meta line. Until a picture exists, the Event art is a placeholder drawn in the colour of the kind, as the end of the page "Turn Summary Carousel", <https://claude.ai/artifact/VktR52J2zLVv7dcL2TdtUy>, shows for each kind.
2. **Details,** the rest of the height above the control row, in blocks side by side under Group headings, e.g. Consequences, Equipment, and Agents; they scroll when they do not fit.
3. **Control row,** 68 px tall: the "Open Turn report" button on the left, the [stepping controls](#stepping-through-events) in the centre, and "Continue", the primary button, on the right.

# Stepping through events

The Turn summary opens at its first Summary event. The stepping controls show where the Player is and let them move: a "‹" button that shows the previous Summary event, one dot for each Summary event in the colour of its kind, the number of the Summary event shown out of all of them, e.g. "3 / 7", and a "›" button that shows the next Summary event. The dots of one kind stand together, with a wider gap between kinds, so that the row also counts each kind. The dot of the Summary event shown is larger and ringed, the dots of those already shown are brighter than those not yet shown, and selecting a dot shows its Summary event. "‹" is disabled on the first Summary event and "›" on the last. The Left and Right arrow keys do what "‹" and "›" do, and the Enter key shows the next Summary event, or, on the last, does what Continue does.

# Showing and dismissing

The Player dismisses the Turn summary from any Summary event with its primary button, "Continue", or the Escape key, and its "Open Turn report" button opens the full Turn report in the [Turn Report View](turn-report-view.md). Opening a [Detail view](../gui.md#glossary) from the Turn summary closes it, and the [View trail](campaign-screen.md#view-trail) leads the Player back to it, at the Summary event it was showing.

The Turn summary is not shown after loading a [Campaign save](../../foundation/engine-contract.md#persisted-data), after undo, redo, or other [Timeline](../../foundation/timeline.md) navigation, nor for an Advance turn that [Autopilot](../../foundation/engine-contract.md#autopilot) requested, so that a long run of Advance turns does not open one Turn summary for each.

The Player [reopens the Turn summary](turn-report-view.md#turn-summary-button) from the Turn Report View, whenever the Turn report it shows has at least one Summary event, including after loading a Campaign save or after [Timeline](../../foundation/engine-contract.md#persisted-data) navigation. A reopened Turn summary opens at its first Summary event and reads the Current world state as it does when first shown, so a detail read from it, e.g. a new Mission site's Turns until expiration, shows its current value, not its value when the Advance turn ended.

# Links

A Summary event leads to where the Player acts on it. The Combat replay link of a Mission opens the Turn Report View with that Mission's [Combat replay](combat-replay.md#glossary) shown, as its [Visualize button](combat-replay.md#visualize-button) in the Turn Report View does, so that the Player who reads a Mission's outcome can watch how it came about. The link of a new or Expired Mission site opens the [Missions View](missions-view.md) with [that Mission site selected](missions-view.md#mission-site-list), so that the Player who reads of a new Mission site can deploy to it at once.

# Screenshot

The Turn Summary as the game draws it:

![Turn summary Screenshot](../../../../images/screens/turn-summary.png)

_Captured on 2026-11-24 00:10 UTC._

# TODOs

- TODO (later): A picture of [Event art](#layout) for each kind of Summary event.
