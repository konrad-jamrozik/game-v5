# Visual Design

| Metadata | Value |
| --- | --- |
| Spec ID | VIS |
| Family | UI |
| Audience | UI designer, Implementer |
| Owns | How the graphical user interface looks: its visual direction, Design tokens, and the styling of its components and charts. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

The graphical user interface looks like a dark tactical command console: a near-black field, a single signal-orange accent, condensed uppercase headings, and monospaced figures, so that the Player reads the state of the agency at a glance, as an operator reads a heads-up display.

Every screen listed by the [Graphical User Interface](gui.md) is drawn with the same Design tokens and components, so a screen that has no Artboard yet still looks like the screens that have one. The rules here are stated as text and are complete on their own; Artboards illustrate them. What is particular to one screen or panel, and its Artboard, is in that screen's or panel's specification, e.g. [Main Menu](screens/main-menu.md).

# Glossary

| Term | Definition |
| --- | --- |
| Artboard | A mockup of one screen or one panel of the graphical user interface, exported from the Design canvas and kept in the repository as an image in `docs/images/artboards`. |
| Background artwork | An image that a [Detail view](gui.md#glossary) draws faintly behind its content, under [Background artwork](#background-artwork). |
| Design canvas | The claude.ai design artifact from which every Artboard is exported, under [Design canvas](#design-canvas). |
| Design token | A named visual value, e.g. a colour, a font, or a spacing step, that every screen uses in place of a literal value. |
| Panel Artboard | An Artboard of one panel or dialog on its own, without the screen around it, e.g. the History View. |
| Screen Artboard | An Artboard of a whole screen, which shows where each region of the screen sits; the panels on it are sample content, each detailed by its own specification. |

# Design canvas

The Design canvas is the source of every Artboard: each image in `docs/images/artboards` is an export of one of its artboards, so an Artboard is changed on the canvas and never by editing its image. The canvas is a claude.ai Design artifact in the Game designer's private account, at <https://claude.ai/artifact/Fga63mUQ26RSxkyFybWmLc>, and only Claude agents working through that account edit it, with the Artifact tool. An Implementer is not expected to open it: the specifications and the Artboard images carry everything an Implementer needs.

The canvas, named Game v5 Web UI design canvas, holds only the chosen direction. Each of its artboards is one HTML file, `project/<name>.dc.html`, listed in the index `project/canvas.json`. A screen artboard embeds each panel artboard it shows with `<dc-import>` instead of copying it, so that a change to a panel appears in every screen artboard that shows it.

To change an Artboard, edit its canvas artboard, then export the image of that artboard and of every screen artboard that embeds it, and save each image under the name the table below gives it. An image is exported by reading the artboard's published files with the Artifact tool and rendering them in a headless browser, e.g. Playwright, at the width of the artboard's frame in `project/canvas.json` and a device pixel ratio of 1, with each `<dc-import>` replaced by the body of the artboard it imports, and screenshotting the artboard's whole height. The repository script `npm run artboards:export -- <canvas-dir> [<image> ...]` does all of this from a local copy of the artboard's published files, and also exports every screen artboard that embeds a named one. An image uploaded to the canvas, e.g. a [Background artwork](#background-artwork), is referenced by an artboard as `/_blob/<id>`; the script reads it from `<canvas-dir>/assets/<id>.<extension>`, a copy that the Artifact tool saves when it reads that upload by its id. Commit the images with the specification change they illustrate.

## Artboard sources

Each Artboard image comes from exactly one canvas artboard and is shown in exactly one specification. This table is exhaustive.

| Image | Kind | Canvas artboard | Shown in |
| --- | --- | --- | --- |
| `main-menu.png` | Screen | `Main.dc.html` | [Main Menu](screens/main-menu.md) |
| `campaign-screen.png` | Screen | `CampaignScreen.dc.html` | [Campaign Screen](screens/campaign-screen.md) |
| `campaign-screen-view.png` | Screen | `CampaignScreenView.dc.html` | [Campaign Screen](screens/campaign-screen.md) |
| `situation-panel.png` | Panel | `SituationPanel.dc.html` | [Situation Panel](screens/situation-panel.md) |
| `turn-summary.png` | Panel | `TurnSummary.dc.html` | [Turn Summary](screens/turn-summary.md) |
| `settings-panel.png` | Panel | `SettingsPanel.dc.html` | [Campaign Screen](screens/campaign-screen.md) |
| `autopilot-footer.png` | Panel | `AutopilotFooter.dc.html` | [Campaign Screen](screens/campaign-screen.md) |
| `keyboard-shortcuts.png` | Panel | `KeyboardShortcuts.dc.html` | [Campaign Screen](screens/campaign-screen.md) |
| `missions-view.png` | Panel | `MissionsView.dc.html` | [Missions View](screens/missions-view.md) |
| `missions-view-concluded.png` | Panel | `MissionsViewConcluded.dc.html` | [Missions View](screens/missions-view.md) |
| `leads-view.png` | Panel | `LeadsView.dc.html` | [Leads View](screens/leads-view.md) |
| `agents-view.png` | Panel | `AgentsView.dc.html` | [Agents View](screens/agents-view.md) |
| `agents-memorial.png` | Panel | `AgentsMemorial.dc.html` | [Agents View](screens/agents-view.md) |
| `agent-details.png` | Panel | `AgentDetails.dc.html` | [Agents View](screens/agents-view.md) |
| `upgrades-view.png` | Panel | `UpgradesView.dc.html` | [Upgrades View](screens/upgrades-view.md) |
| `turn-report-view.png` | Panel | `TurnReportView.dc.html` | [Turn Report View](screens/turn-report-view.md) |
| `combat-report.png` | Panel | `CombatReport.dc.html` | [Turn Report View](screens/turn-report-view.md) |
| `history-view.png` | Panel | `HistoryView.dc.html` | [History View](screens/history-view.md) |
| `charts-view.png` | Panel | `ChartsView.dc.html` | [Charts View](screens/charts-view.md) |
| `compendium-view.png` | Panel | `CompendiumView.dc.html` | [Compendium View](screens/compendium-view.md) |
| `compendium-view-subject.png` | Panel | `CompendiumViewSubject.dc.html` | [Compendium View](screens/compendium-view.md) |

# Reading Artboards

An Artboard shows how the rules of this specification look when applied to one screen. The Artboards and the text together are the source from which every Implementation's graphical user interface is regenerated, so they must never disagree: a specification change that changes what a screen or panel shows, or how it looks, redraws every Artboard that shows it on the [Design canvas](#design-canvas) and exports their images in the same change. An Artboard that still disagrees with the text is a defect of the specifications, fixed by redrawing it; until it is, the text applies, because the rules are complete only as text.

What a screen shows and which operations it offers is owned by the [Graphical User Interface](gui.md), the specification of that screen or panel, and the specifications they use, never by an Artboard. An element that appears on an Artboard but that no specification requires must not be implemented; each specification that shows an Artboard lists such elements of it. That list holds only what a picture cannot avoid, e.g. its sample values or a drawing that stands in for the real globe, and never a difference left for a later redraw.

# Design tokens

Design tokens keep every screen consistent: a screen uses these values and no other colours, fonts, or radii. The interface has a dark theme only: a light theme, and any setting that switches themes, is out of scope.

## Colours

Each colour has one role, so that the same colour always means the same thing across screens. This table is exhaustive.

| Token | Value | Role |
| --- | --- | --- |
| Background | `#0D0D0B` | The page behind all panels, and the fill of inputs and of an enabled unchecked checkbox. |
| Surface | `#151512` | Panels, cards, and chart frames. |
| Raised | `#22211C` | Neutral buttons, navigation buttons, and row dividers inside panels. |
| Divider | `#2B2A24` | Dividers between panel sections, empty meter segments, and the outline of a disabled checkbox. |
| Border | `#3A382F` | Borders of controls, table header rules, chart baselines, and the top edge of a plain card. |
| Text | `#E8E4D8` | Primary text and the lines of neutral chart series. |
| Text secondary | `#B8B3A6` | Supporting prose, e.g. the game description on the Main menu. |
| Text muted | `#9C978A` | Labels, hints, and idle states, e.g. an Agent on standby or a missed attack in the Combat log; the outline of an enabled unchecked checkbox and the tick of a disabled checked one. |
| Axis | `#8F8A7D` | Chart axis labels. |
| Accent | `#FF7A1A` | The primary action, an enabled checked checkbox, the open-Detail-view marker, the card edge of the [Campaign](../foundation/core-concepts.md#campaign-and-session) of the most recent [Campaign save](../foundation/engine-contract.md#persisted-data) on the [Main menu](../foundation/campaign-lifecycle.md#glossary), and [Panic](../mechanics/domain-model.md#campaign-standing). |
| Accent dim | `#7A4A22` | A partly filled meter segment, and a disabled checked checkbox. |
| Accent text | `#FF8A33` | Text that needs attention, e.g. a count on a navigation button, a low health value, or an expired [Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions); and a figure the Player decides by, e.g. a [Combat rating](../mechanics/combat.md#combat-rating), under [Combat ratings](screens/missions-view.md#combat-ratings) in Missions View. |
| On accent | `#1A0B00` | Text on an Accent fill. |
| Positive | `#B7C77A` | Gains and successes, e.g. income, a won [Mission](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), an Agent on an assignment, or a hit by an Agent in the Combat log. |
| Positive bright | `#5FE08A` | A figure comfortably past what the Player needs, brighter than Positive, e.g. a deployment's Combat rating of at least 110% of the Enemies' one, under [Deployment](screens/missions-view.md#deployment) in Missions View. |
| Danger | `#FF7F78` | Losses, destructive actions, and limits, e.g. upkeep, Delete, the [Panic limit](../mechanics/panic-and-endings.md#glossary), and a hit by an Enemy in the Combat log. |
| Danger border | `#5E2A26` | The border of a destructive button. |
| Warning | `#E3C14B` | Values that need watching before they become a problem, e.g. an Agent's exhaustion at which it can no longer start work, under [Agent condition](#agent-condition), or a Mission site that Expires in the next Advance turn, under [Mission site urgency](screens/situation-panel.md#mission-site-urgency) in Situation Panel; and the outline and text of a weighty button. |
| Danger deep | `#A3271F` | The far end of the [current health](../mechanics/agents-spec.md#combatant-attributes) scale: an [Agent](../mechanics/domain-model.md#agency-and-agents) close to death, under [Agent condition](#agent-condition); and a [Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) lost in the most recent Advance turn, struck through, under [Mission site urgency](screens/situation-panel.md#mission-site-urgency) in Situation Panel. |
| Notice | `#8FB8D6` | Welcome news that asks for no action, milder than a success in Positive, e.g. a discovered Lead among the events of the History View. |
| Autopilot | `#B4A0E5` | The outline and text of an [Autopilot](../foundation/engine-contract.md#autopilot) button, which acts on what an [Autopilot AI](../foundation/engine-contract.md#principals-and-access) did. |
| Agent attack tint | `#B7C77A` at 7% opacity | The fill of a [Combat log](../mechanics/combat.md#combat-rounds-and-results) row whose attacker is an Agent, under [Combat log colours](screens/turn-report-view.md#combat-log-colours) in Turn Report View. |
| Enemy attack tint | `#FF7F78` at 7% opacity | The fill of a Combat log row whose attacker is an [Enemy](../mechanics/domain-model.md#combat). |
| Limit band | `#E5484D` at 12% opacity | The band that marks a losing limit on a chart. |
| Scrim | `#0D0D0B` at 72% opacity | The layer that dims the screen behind a dialog. |
| Control backdrop | `#0D0D0B` at 55% opacity | The fill behind a group of controls that stands over a Background artwork, with 10 px of inner padding and the control corner radius, so that the artwork interferes less with reading the controls, e.g. the Show agents group of the Agents View. |

## Chart series colours

A chart with several series needs more hues than the roles above can spare, and each must stay apart from its neighbours in a stacked bar. These colours are used only for the series of the charts named here, under [Agency charts](screens/charts-view.md#agency-charts) in Charts View, and nowhere else. Related series share a hue family, e.g. every income is green and every expenditure red, so that the Player reads the kind of a series before its legend. This table is exhaustive.

| Chart | Series | Value |
| --- | --- | --- |
| Agent activity | Standby | `#7FD45F` |
| Agent activity | Training | `#2E8B3E` |
| Agent activity | Contracting | `#E8C547` |
| Agent activity | Investigating | `#A77BDB` |
| Agent activity | Deployed | `#F28C28` |
| Agent activity | Recovering | `#D2453D` |
| Agent activity | [In transit](../mechanics/domain-model.md#agency-and-agents) | `#3D8FD9` |
| Money flow | Funding | `#3E8E41` |
| Money flow | Contracting income | `#6CC05B` |
| Money flow | Mission rewards | `#A9DD8F` |
| Money flow | Upkeep | `#A8322D` |
| Money flow | Hiring | `#D9473F` |
| Money flow | [Cap Upgrades](../mechanics/economy-and-upgrades.md#glossary) | `#FF6F61` |
| Money flow | Other [Upgrades](../mechanics/domain-model.md#agency-and-agents) | `#F2A39B` |
| Money flow | Net flow | `#E8C547` |
| Assets | Money | `#8BC34A` |
| Assets | Serving Agents | `#A1887F` |
| Assets | [Agent cap](../mechanics/domain-model.md#agency-and-agents) | `#D7CCC8` |
| Assets | [Transport cap](../mechanics/economy-and-upgrades.md#glossary) | `#3D8FD9` |
| Assets | [Training cap](../mechanics/economy-and-upgrades.md#glossary) | `#E8C547` |
| Assets | [Contracting cap](../mechanics/economy-and-upgrades.md#glossary) | `#C77DDB` |
| Agents by [effective skill](../mechanics/agents-spec.md#combatant-attributes) | Skill bands 1 to 12, from the lowest | `#6A5ACD`, `#4A86D9`, `#2FB0B8`, `#45BF6E`, `#A3CC3F`, `#E3C43A`, `#F0913A`, `#E8605A`, `#D94A8C`, `#B45AD6`, `#F2A6D8`, `#F4EFE6` |
| Agents by effective skill | Recovering | `#FF4D4D` |
| Agents by effective skill | Exhaustion above `exhaustion_work_limit` | `#FF9A2E` |
| Agents by effective skill | Exhaustion above `exhaustion_free_points` | `#FFE14D` |
| Combat strength | Deployable Agents | `#4A86D9` |
| Combat strength | Other Agents | `#2E4E78` |
| Combat strength | Last [Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) | `#E8605A` |
| Combat strength | Last 5 Mission sites | `#E3C43A` |

## Typography

Three typefaces separate three kinds of text: condensed headings name things, the body font explains them, and the monospaced font carries every number and identifier. All three are Google Fonts. This table is exhaustive.

| Style | Font | Weight | Size | Case and spacing | Use |
| --- | --- | --- | --- | --- | --- |
| Screen title | Barlow Condensed | 700 | 56 px | Uppercase, 0.04 em | The game title on the [Main menu](../foundation/campaign-lifecycle.md#glossary). |
| Section heading | Barlow Condensed | 700 | 22 px | Uppercase, 0.08 em | The heading of a Main menu column, the title of a dialog, and the title of a Detail view. |
| Panel heading | Barlow Condensed | 700 | 18 px | Uppercase, 0.08 em | The heading of a panel, a table, or a headline chart. |
| Group heading | Barlow Condensed | 700 | 16 px | Uppercase, 0.08 em, Text secondary | The heading of a group of items in a panel or a dialog, under [Panels and cards](#panels-and-cards), and every heading inside a pane of a Detail view, under [Detail views and navigation](#detail-views-and-navigation). |
| Label | Barlow Condensed | 600 | 13 px | Uppercase, 0.12 em, Text muted | Field labels, table headers, and status bar labels. |
| Button | Barlow Condensed | 600 | 14 px | Uppercase, 0.1 em | Button text; 17 px on a screen's main action. |
| Body | Barlow | 400 | 15 px | Sentence case, line height 1.45 | Prose, table cells that hold words, and input text. |
| Figure | JetBrains Mono | 400 | 15 px | Tabular figures | Every number and identifier, e.g. Money or a [Campaign ID](../foundation/saves.md#identifiers). |
| Headline figure | JetBrains Mono | 400 | 22 px | Tabular figures | A status bar value and the current value of a chart. |
| Axis | JetBrains Mono | 400 | 11 px | Axis colour | Chart axis labels. |

Text steps down as it nests, so that the Player reads how a screen is built before reading its words: text nested under a heading is never larger than that heading, and each further level is no larger and no brighter than the level it sits under. E.g., in the Turn Summary, the "New Mission sites" Group heading outranks the name of each new Mission site under it, in Body and Text, and the name outranks its details, in Body and Text secondary or Text muted. A Label names a control or a column, not a group of items, e.g. "Show agents" above the filters of the Agents View or a table header, so it never heads a group of items.

## Spacing and shape

Even spacing is what makes the screens read as orderly, so spacing follows fixed steps rather than case-by-case values.

- Controls in one group, e.g. Load and Delete, are 8 px apart.
- Panels stacked in one column are 16 px apart on the Campaign screen and 24 px apart on the Main menu; columns are 24 px apart on the Main menu. The regions of the Campaign screen meet without a gap.
- A panel has 18 px of inner padding; a table cell has 8 px vertical and 10 px horizontal padding.
- The Main menu has at least 24 px of outer padding, and the Main menu content is at most 1216 px wide and centred.
- Controls have a 2 px corner radius; panels and cards have square corners and no outline.
- Two pieces of text on one line never touch: they are at least 8 px apart, or joined by a " · " separator, e.g. a Mission site's name, kind, and Faction, and a value right-aligned after them.

## Alignment

A screen reads as one instrument only when its parts line up, so every element is aligned with its neighbours by these rules, at every window width, and no alignment is left to the content an element happens to hold. This list is exhaustive.

- **Text on one line:** pieces of text of one size on one line share one baseline. Smaller text after a heading on its line, e.g. the free places and their cap bars after the title "Agents" in the Agents View or the money after the title of the Upgrades View, is centred on the heading: the middle of its capitals sits level with the middle of the heading's capitals, never on the heading's baseline. Text is never centred on its line by the height of its box, because styles of different sizes then sit at different heights.
- **Controls in one row:** the controls of one row, e.g. the filters, buttons, and close control of a Detail view's title row, are equally tall and share one centre line. Text in the row, e.g. a count of selected rows after a button, is centred on that line too.
- **Labelled groups:** a group of controls under a Label, e.g. the "Show agents" filters of the Agents View, stands its Label above its controls, and the controls share the row's centre line with every control of the row that has no Label, e.g. a button or the close control of the row sits level with those filters, not with their Label.
- **Cards side by side:** cards in one row are equally tall, and each part of a card starts at the same height on every card of the row, because each part takes the height of its tallest instance in the row. E.g., when the change of one Upgrade card wraps onto a second line, the Buy buttons of all the Upgrade cards still sit on one line.
- **A note beside a control:** a note about a control, e.g. the money missing for a disabled Buy button, sits on the control's row, 8 px after it, and never moves below it; a note longer than the space left beside the control wraps within that space. The note never sets the row's height: the row is as tall as its controls, and a wrapped note stays centred on their centre line and extends above and below it into the spacing around the row.
- **Controls stay still:** a control keeps its place and its size whatever changes around it, so that the Player's hand finds it where it was a moment ago. A change of state, e.g. a button turning disabled, gaining focus, or being clicked, a note that appears, wraps, or vanishes, or a count, tally, or label that grows, moves and resizes no control on the screen. Content that changes grows away from the controls, e.g. downward below them, or within space reserved for it.

# Components

Components are the building blocks every screen reuses. A screen that needs a control not described here builds it from the Design tokens in the same manner.

## Buttons

Buttons come in five kinds so that the Player can tell at a glance what a button will do. This list is exhaustive.

- A neutral button has a Raised fill, a Border outline, and Text-coloured text.
- A primary button has an Accent fill and On-accent text. A panel has at most one primary button, and it is the action the panel exists for, e.g. Start Campaign or Advance turn.
- A destructive button has no fill, a Danger border outline, and Danger text, e.g. Delete and Delete campaign.
- A weighty button has no fill, a Warning outline, and Warning text. It marks a reversible step with a larger reach than its usual form, e.g. Undo Turn in place of Undo Action.
- An Autopilot button has no fill, an Autopilot outline, and Autopilot text. It marks a reversible step that crosses an [Autopilot engagement](../foundation/engine-contract.md#autopilot), undoing or redoing at once the [Turns](../foundation/engine-contract.md#player-actions-and-turns) an Autopilot AI played that no [Autopilot Autosave](../foundation/saves.md#autosave-kinds) separates, e.g. Undo Autopilot in place of Undo Turn, so that it never passes for a step of the Player's own play.

A button is 36 px tall, 32 px inside a table row, and 44 to 46 px for the main action of a screen. A button's label never wraps onto a second line. Buttons that belong together sit in one row with 8 px between them. A row of buttons that follows content on the same line, e.g. the Load and Delete of a Campaign save, or that ends a panel or dialog, aligns to the right edge of its row or panel. A row of buttons that is a part of its own in a card whose parts are stacked, e.g. the Buy button of an Upgrade card, starts at the card's left content edge, as the card's text does. When a row is too narrow, the whole group wraps below the content, never a single label. A disabled button keeps its kind and is drawn at 60% opacity, so that its label stays readable over a [Background artwork](#background-artwork).

## Inputs

Inputs share one shape so that every editable value is recognisable. An input or a select is 40 px tall, has a Background fill, a Border outline, and Body text. Its label sits above it in the Label style, or to its left with a muted hint below the label when the input is one row of a settings list. A numeric input uses the Figure style and aligns its value to the right.

## Checkboxes

A checkbox shows at a glance whether the Player can change it, because a disabled checkbox among enabled ones, e.g. the row of an Agent In transit in the [Agents View](screens/agents-view.md), must not pass for one the Player can select. A checkbox is a 16 px square with the control corner radius, drawn in these states. This list is exhaustive.

- **Enabled, unchecked:** a Background fill and a 1 px Text muted outline.
- **Enabled, checked:** an Accent fill and outline, with an On-accent tick.
- **Disabled, unchecked:** no fill and a 1 px Divider outline, so it reads as an empty slot.
- **Disabled, checked:** an Accent dim fill and outline, with a Text muted tick.

The pointer over a disabled checkbox shows that it cannot be changed. A checkbox's label, when it has one, sits to its right in Body text, 8 px from it.

## Sliders

A slider shows its value as the filled share of its track, so the Player reads it at a glance, e.g. the [Music volume slider](music.md#music-volume-slider). At the least value no part of the track is filled and at the greatest value all of it is, and no part of the track ever shows beyond the thumb at either end. The track is 4 px tall with fully rounded ends, in Accent from its left end up to the thumb and in Divider beyond. The thumb is a 14 px Accent circle whose centre sits at the end of the filled part, so at either end of the track it overhangs by half its width and the track spans exactly the thumb's travel.

## Panels and cards

A panel groups what belongs together on a Surface fill with no outline. A card is a panel for one item of a list, e.g. one Campaign on the Main menu; it has a 2 px top edge in Border, or in Accent when it is the item the Player most likely wants, e.g. the Campaign of the most recent [Campaign save](../foundation/engine-contract.md#persisted-data).

A panel that lists groups, e.g. the panel of the Campaign screen that lists the work waiting for the Player, heads each group with a Group heading and its count in the Figure style and Accent text, and separates groups with Divider rules. In a panel whose items take one line each, each item is a row 28 px tall, separated by Raised dividers: its name in Body on the left, and its value, e.g. a [Completion estimate](gui.md#glossary), right-aligned in the Figure style and Text secondary, with a [Progress circle](gui.md#glossary) between them. In a panel whose items take more than one line, e.g. the [Turn Summary](screens/turn-summary.md), an item's value, e.g. the [Turns](../foundation/engine-contract.md#player-actions-and-turns) until expiration of a new [Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), is likewise right-aligned on the item's first line, in the Figure style when it is a number, and the item's further lines hold its details. The item's name is in Body and Text, and its details are in Body or Figure and in Text secondary or Text muted, unless a colour of a state applies, under [Typography](#typography). A [Completion estimate](gui.md#glossary) whose earliest Advance turn is the next one is in Accent text, and "in transit", "stalled", and "ETA ?" are in Text muted. A [Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) that expires within two [Turns](../foundation/engine-contract.md#player-actions-and-turns) shows its Turns until expiration in Accent text.

## Dialogs

A dialog interrupts the screen only for what the Player must see before going on, e.g. what an Advance turn did. It sits centred over a Scrim on a Surface fill with a 2 px Accent top edge, at most 640 px wide, with its title in the Section heading style and its buttons in one row at the bottom right under [Buttons](#buttons); the action that dismisses it is primary. A dialog taller than the window scrolls inside, keeping its title and buttons in view.

## Close controls

The Player closes every view opened over a screen the same way and finds its close control in the same place, so that closing never needs a search. The views that close this way are a [Detail view](gui.md#glossary), the [Settings panel](gui.md#settings-panel), the keyboard shortcuts, the developer tools, and the [Main menu](screens/main-menu.md) reached from the Campaign screen; the list is exhaustive. A dialog that ends with buttons, e.g. the [Turn Summary](screens/turn-summary.md), is closed by those buttons instead.

- **Shape:** the close control is a square neutral button, 36 px wide and tall, holding a ✕, never a text button, e.g. one labelled Close.
- **Place:** it ends the title row of its view, at the right edge of the view's rectangle inset by that view's inner padding, never at the corner of the window when the view is narrower. It is one of the title row's controls under [Alignment](#alignment), so it shares their centre line, and sits level with the controls of a group under a Label, never with the Label, e.g. the "Show agents" filters of the Agents View. In a title row with no other control, it is centred on the title's line.
- **Escape:** the Escape key does what the close control of the topmost open view does, except in a Detail view that shows a [Back control](gui.md#glossary), where it does what the Back control does, under [View trail](screens/campaign-screen.md#view-trail) in Campaign Screen.

## Tables

Tables carry most of the game's data, so they are dense but aligned. A header row uses the Label style over a Border rule; body rows are separated by Raised dividers. Columns that hold numbers use the Figure style and are right-aligned, their header included. Row actions sit in the last column, under [Buttons](#buttons). Text that encodes a state uses the colour of that state, e.g. Positive for a won Mission, and Text muted for an idle Agent.

A table keeps its columns still, so that the Player's eye finds a value where it was a moment ago. Each column has a fixed width set by the table's design, and neither what the rows hold nor the width of the screen changes it. E.g., an Assignment that gains "· In transit", a filter that hides rows, or a wider window moves and resizes no column.

A table's columns sit side by side from its left edge, and no column stretches to fill a wide table, so that every value stays close to the rest of its row. On a wide screen the spare width lies to the right of the last column, never between two columns; e.g., the Blocked by column of the [Agents View](screens/agents-view.md) follows the Assignment column directly, however wide the screen. A table narrower than its columns scrolls sideways within its panel, which happens only when the window is too narrow for the panel, e.g. a pane of a Detail view, to take the table's full width, under [Detail views and navigation](#detail-views-and-navigation).

Every row of a table is one line tall, so that rows line up and a long value does not push the rows below it down. Each column is wide enough to hold on one line every value that the specifications list for it, e.g. the Blocked by "Already on Contracting" in the [Agents View](screens/agents-view.md). A value of free text that can still be too long for its column, e.g. the message of an engine rejection, is cut short with "…" and shown in full while the pointer rests on it.

A column that shows a game quantity is wide enough for the widest value that quantity can take, in every table and whatever values the [GDRs](../foundation/core-concepts.md#game-build-and-content) give, so that a veteran Agent's row late in a long Campaign is never cut short. The widest values are these, and this list is exhaustive:

| Quantity | Widest value |
| --- | --- |
| Skill, base or effective | Four digits, e.g. "1234". |
| Exhaustion | Three digits, e.g. "123". |
| Health | Three digits, followed by the max health it is out of when the column shows both, e.g. "123/123". |
| Armor | Three digits, e.g. "123". |
| Damage, e.g. a Weapon's damage or the damage a participant dealt or took in a Combat | Three digits, e.g. "123". |
| Experience gained, e.g. Mission experience | Three digits after its sign, e.g. "+123". |
| Chance, e.g. a hit chance | Two digits and one decimal before the percent sign, e.g. "99.9%". |

A column that shows a value at two moments joined by "→" holds the widest value on both sides, e.g. "1234 → 1234" for an effective skill, "123 → 123/123" for a health, and "123 → 123" for an armor. A column that shows several quantities in one value holds the widest value of each, e.g. "99.9% (1234 vs 1234)" for a hit chance with the effective skills it compares.

A table whose rows each have a selection checkbox lets the Player select several rows at once, in these ways:

- **Click:** clicking a row's checkbox, or the row outside its links and buttons, selects or clears that row and makes it the anchor.
- **Shift-click:** Shift-clicking a row gives every row from the anchor to that row, both included, the state the anchor has. E.g., after clicking agent-10 to select it and then Shift-clicking agent-3, agent-3 to agent-10 are all selected.
- **Drag:** pressing on a row and moving the pointer across others gives each row passed over the state the pressed row took, so one drag selects or clears a run of rows.

A row whose checkbox is disabled is skipped by every one of these. Pressing or dragging over the rows never selects their text.

The header row holds a Select all checkbox above the rows' checkboxes. Checking it selects every shown row whose checkbox is enabled, and it stays checked while the selection follows that set: whenever which rows are shown, or which of them can be selected, changes, e.g. because a filter changed, the selection becomes exactly the shown rows that can be selected. Unchecking it clears the selection, and clicking, Shift-clicking, or dragging over any row unchecks it and keeps the selection as it then is.

A table whose column headers sort it remembers up to four sort tiers, so that a new sort refines the earlier ones instead of discarding them. Rows are ordered by the first tier, rows equal in it by the second, and so on, and rows equal in every tier keep the table's default order. Pressing a header works as follows:

- **A column in no tier** becomes the first tier, descending when it holds numbers and ascending otherwise; every earlier tier moves down one, and a tier pushed past the fourth is dropped.
- **The column of the first tier** flips its direction.
- **The column of a lower tier** becomes the first tier with the direction it had, leaving its old tier, and the tiers that were above it move down one.

E.g., after sorting the [Agent table](screens/agents-view.md#agent-table) by effective skill and then by Blocked by, the rows with an empty Blocked by come first, and among them the rows are ordered by effective skill.

A view may lock a tier above the four, e.g. the Blocked by tier of the Agent table while an [Assignment filter](screens/agents-view.md#glossary) is on. Pressing a locked tier's header changes nothing, and pressing any other header changes the tiers under it as above.

The header of each column in a tier shows its direction as ▲ for ascending or ▼ for descending, after its label, at full opacity for the first tier and at 70 %, 45 %, and 25 % opacity for the second, third, and fourth tier, counting a locked tier as the first and showing every tier past the fourth at 25 %. A header is never cut short: each column's width holds its header's label together with that arrow, e.g. the effective weapon damage column of the [Agents View](screens/agents-view.md) is wide enough for its label followed by "▼".

## Agent condition

Wherever a table shows an [Agent](../mechanics/domain-model.md#agency-and-agents)'s [exhaustion](../mechanics/agents-spec.md#combatant-attributes) or [current health](../mechanics/agents-spec.md#combatant-attributes), its colour tells the Player at a glance how worn down the Agent is, so that a tired or hurt Agent stands out before it is sent anywhere. The outcome of an attack in a Combat log is the one exception: its colour says whom the attack favours, under [Combat log colours](screens/turn-report-view.md#combat-log-colours) in Turn Report View.

- **Exhaustion:** Text up to `exhaustion_work_start_max`, when the Agent can start work; Warning above `exhaustion_work_start_max`, when it cannot start work until it has rested, under [Start-work gate](../mechanics/agents-spec.md#start-work-gate); Accent text from the midpoint of `exhaustion_work_start_max` and `exhaustion_work_limit`, rounded up; and Danger from `exhaustion_work_limit`, at which [Contracting](../mechanics/agents-spec.md#assignments) and [Training](../mechanics/agents-spec.md#assignments) end, under [Forced return](../mechanics/agents-spec.md#forced-return), with a warning-triangle icon before the value. The thresholds come from [AgentParameters](../mechanics/agents-spec.md#agentparameters), so they follow the [GDRs](../foundation/core-concepts.md#game-build-and-content). E.g., with the GDR values 30 and 70, exhaustion 30 is in Text, 31 in Warning, 50 in Accent text, and 70 in Danger with the triangle.
- **Current health:** a smooth scale over the share of [effective max health](../mechanics/agents-spec.md#combatant-attributes) that current health is. Its stops are Text at 100%, Warning at 75%, Accent text at 50%, Danger at 25%, and Danger deep at 0%, and a share between two stops takes the colour between them in proportion, mixed in sRGB. E.g., 30 of 30 is in Text, 15 of 30 in Accent text, and 1 of 30 almost in Danger deep. The share is taken from the exact current health, e.g. 29.40 of 30 is 98%.

## Consequences

Wherever a screen lists the [Consequences](../mechanics/missions.md#consequences) that applied, e.g. on a Mission card of the [Turn summary](screens/turn-summary.md), each Consequence is coloured by whether it is good or bad for the Player, so that a costly outcome stands out among the gains. A Consequence that gains money or funding, reduces [Panic](../mechanics/domain-model.md#campaign-standing), or makes a [Faction](../mechanics/domain-model.md#factions) [Eliminated](../mechanics/domain-model.md#factions) is in Positive; one that loses funding or increases Panic is in Danger. The label before them and the separators between them stay in Text muted. E.g., "Consequences: money +30, funding +5" shows "money +30" and "funding +5" in Positive, while an Expired Mission site's "Consequences: Panic +3, funding −2" shows both in Danger.

## Detail views and navigation

The [Side panel](gui.md#glossary) is the console beside the globe, so it reads as one dark column and the globe as open space.

- **[Globe stage](gui.md#glossary):** a Background fill behind the globe, with no panel or outline around it.
- **Side panel:** 400 px wide, on a Surface fill with a 1 px Divider rule along its left edge. Its sections are separated by Divider rules and have 16 px of inner padding.
- **Navigation buttons:** each group name is in the Label style above its buttons, which sit two to a row with 8 px between them. A navigation button is a neutral button in the Button style, its name on the left and its count, if any, on the right in the Figure style and Accent text. The button of the open [Detail view](gui.md#glossary) has a 2 px Accent line along its bottom edge.
- **Detail view:** it covers the Globe stage inset by 16 px, on a Surface fill with a 2 px Accent top edge and 18 px of inner padding. Its title is in the Section heading style on the left, its buttons are in one row on the right, ending 8 px before the close control, under [Buttons](#buttons) and [Alignment](#alignment), and its close control ends that row, under [Close controls](#close-controls). While it shows a [Back control](gui.md#glossary), that neutral button in the Button style, e.g. "‹ Turn report", is the last button of the row, 8 px before the close control, so that the Player finds it beside the ✕ in every Detail view. The one exception is a Back control that stands in the place of a button of the same name, which it replaces, under [Turn summary button](screens/turn-report-view.md#turn-summary-button) in Turn Report View, so that the Player finds what both open at the same place whichever of the two the row shows. The title sits at the same place in every Detail view, starting at the top of the inner padding, so that switching Detail views never moves it; a row whose controls stand taller than the title, e.g. a group under a Label, grows downward and never pushes the title down. The close control, and the Back control beside it, always sit on the title's line, centred on it, whatever else the row holds, so that the ✕ is at the same place in every Detail view; a taller group of controls ends 8 px before them and hangs below that line. A Detail view taller than the Globe stage scrolls inside, keeping its title row in view.
- **Panes:** in a Detail view whose content is panes side by side, e.g. the Missions View, every heading inside a pane, e.g. the name of a group of the left pane, the name of the selected item, and the heading of each part of the right pane, is in the Group heading style, so that the panes read alike and one level below the title. A pane that holds a table is never narrower than that table's columns while the Detail view has room for it, and the panes share the rest of the width, so that a table scrolls sideways only when the window is too narrow for every pane to take its least width.

## Background artwork

Background artwork lets the Player enjoy a picture of the agency at work while reading a Detail view, without the picture ever competing with what the Player reads: it is drawn so faintly that it reads as part of the dark field, not as an image laid over it. It is decoration only: it shows no game state and the Player cannot act on it.

Each image is a file in the `assets/images/` directory at the repository root. Which Detail view shows which image, and how faintly, is content rather than design, so it comes from the BackgroundArtwork GDRs: the Content designer changes an image or its opacity in a [GDR](../foundation/core-concepts.md#game-build-and-content) file without changing this specification. A Detail view that no BackgroundArtwork GDR names shows no Background artwork. The GDRs list each one under [Visual Design GDRs](../content/gdrs.md#visual-design-gdrs).

A BackgroundArtwork GDR serves the Display content purpose and has these properties; the list is exhaustive:

| Property | Meaning |
| --- | --- |
| `detail_view` | The Detail view that shows the image, by its name in lowercase words joined by underscores, e.g. `missions` for the [Missions View](screens/missions-view.md). No two GDRs name one Detail view. |
| `image` | The path of the image file relative to the repository root, e.g. `assets/images/chatgpt-agents-i2.png`. |
| `opacity_pct` | The opacity at which the image is drawn, a whole number from 0 to 100. |

The Content designer chooses `opacity_pct` so that Text muted keeps a contrast ratio of at least 4.5:1 against nearly all of what lies behind it, giving up that ratio only over the image's brightest highlights, e.g. 30 keeps it over about 98% of each of the current images, while 12 keeps it even where an image is white.

A Detail view draws its Background artwork as follows:

- **Place:** between its Surface fill and its content, filling the whole Detail view below its top edge. The image is scaled to cover that area with its proportions kept, centred, and cropped where the proportions differ. It stays in place while the content scrolls over it.
- **Opacity:** the `opacity_pct` of its GDR.
- **Panels inside it:** a panel inside the Detail view, e.g. a pane of the Missions View, draws its Background fill at 35% opacity, so that the image shows through it too while the panel still reads as an area of its own. A selected row and a button keep their fills opaque.

The Detail view shows its Background artwork whatever it holds, e.g. the Agents View with its Memorial filter on. When the image cannot be loaded, the Detail view looks as it would without it.

### Artwork tuning

Artwork tuning lets the Game designer settle each image and its opacity while seeing them in the game, before writing the chosen values into the BackgroundArtwork GDRs. The developer tools, opened from the [Settings panel](gui.md#settings-panel) of the Campaign screen, hold an Artwork tuning section. The Game designer first picks the Detail view to tune, and the controls below it then tune that Detail view's Background artwork alone, so no control reads as belonging to another Detail view. The section stacks these controls in this order, each under its Label in the manner of [Inputs](#inputs), 16 px apart; the list is exhaustive:

- **Detail view:** a select of the Detail views that a BackgroundArtwork GDR names, each shown by its name, e.g. "Missions", starting at the Detail view of the first GDR. Picking another Detail view keeps the values already tuned for each.
- **Opacity:** a slider from 0% to 100% in steps of 1%, with its value as a figure beside it, e.g. "30%". It starts at the `opacity_pct` of the GDR.
- **Image:** a select of every image file in the `assets/images/` directory, each shown by its file name, starting at the `image` of the GDR. Any image can be tried on any Detail view, e.g. the Agents View's image on the Missions View.

A Detail view showing that Background artwork follows a change at once, so the Game designer can keep it open while moving the slider. A Reset button ends the section, below the controls, and returns every Detail view, not only the picked one, to the values of its GDR. Tuned values are part of the [Session](../foundation/core-concepts.md#campaign-and-session), not of [Campaign state](../foundation/core-concepts.md#campaign-and-session): they last until the Session ends and are never saved. Artwork tuning is available whether or not [Dev mode](../foundation/engine-contract.md#principals-and-access) is enabled, because it neither reveals hidden information nor changes Campaign state.

## Status bar

The status bar keeps the agency's vital values in view on every Campaign screen. It spans the screen on a Surface fill with a 2 px Accent bottom edge. Each value sits under its label in the Headline figure style; a change of a value, e.g. projected income, follows it in a 13 px Figure style in Positive or Danger. The screen's controls follow the values, with the main action, e.g. Advance turn, last and primary.

## Meters

A meter shows a value against its limit, e.g. Panic against the Panic limit. It is a row of 10 equal segments, 8 px tall with 3 px gaps. Each full tenth of the limit fills one segment in Accent, a remaining part of a tenth fills the next segment in Accent dim, and the other segments are Divider. The value and the limit are written above the meter's right end in Accent text, e.g. "24.35 / 100%".

## Cap bars

A cap bar shows at a glance how much of a cap is taken, e.g. of the [Agent cap](../mechanics/domain-model.md#agency-and-agents), so that the Player sees how much room is left without reading numbers. It is a solid bar 80 px wide and 8 px tall on a Divider track, whatever the size of the cap, so that a growing cap never widens it. Its fill covers, from the left, the share of the cap that is taken, coloured as the Fill of [Progress bars](#progress-bars), from Accent dim when the cap is empty to Accent when it is full; a cap with more taken than it allows shows a full bar. The exact values stand beside the bar as text, because the bar alone does not give them.

## Tallies

A tally shows a count that has no limit as a stack of marks, so the Player can compare counts at a glance, e.g. the Acquisitions of each Upgrade. It is one Accent square per counted item, 12 px wide and tall with 3 px gaps, filled left to right in rows of 10, e.g. 13 items show one full row and 3 squares under it. It grows by a row with every 10 items up to 10 rows, and a count above 100 still shows 100 squares. A count of 0 shows no squares. The exact count is also shown as text, e.g. "Bought 137×", because the squares stop growing.

## Progress bars

A [Progress bar](gui.md#glossary) lets the Player read at a glance how close an [Investigation](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) is to completing, so its colour warms as completion nears instead of switching hue. It is 8 px tall in a panel row and 10 px in a dialog, on a Divider track.

- **Fill:** its colour runs linearly from Accent dim at 0 to Accent at the [Required progress](../mechanics/leads-and-progression.md#glossary), by the share of the Required progress reached, and stays Accent beyond it.
- **Zone and tick:** the zone from the Required progress to the end of the bar is hatched with diagonal stripes of Raised and Border. The tick at the Required progress is a 2 px Text line that overhangs the bar by 3 px above and below. The Required progress and the greatest value of the range are written under the tick and under the bar's end in the Axis style.
- **Preview:** the preview segment of the projected progress gain is Positive at 30% opacity.
- **Caption:** a caption under the bar is in 12 px Body and Text muted, or in Accent text when it says that the Investigation may complete next turn or any turn, with the projected progress gain on its right in the Figure style and Positive, e.g. "+1.74 / turn".
- **Unscaled bar:** the bar of a [Lead](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) that is not an [Assessed Lead](../mechanics/investigations.md#glossary) has a dashed track of Divider dashes 6 px long with 4 px gaps, and an Accent dim stub 12% of its width.
- **Completed Investigation:** in a dialog, the gain of the last Advance turn is a Positive segment labelled with that gain above it in Positive, and the point where the Investigation completed carries a check in a Positive circle 20 px wide, with the check in Background and the final [Investigation progress](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) under it in Positive. When the final Investigation progress would overlap the Required progress or the greatest value of the range written under the bar, that value of the range is left out, and the final Investigation progress keeps its place.

## Progress circles

A [Progress circle](gui.md#glossary) is 18 px wide and sits on the text line it belongs to. Its track is a 1.5 px Border ring, and its fill is a sector from the top, clockwise, coloured as the Fill of [Progress bars](#progress-bars). A full circle is an Accent disc with a check in On accent. The circle of a [Lead](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) that is not an [Assessed Lead](../mechanics/investigations.md#glossary) is a 1.5 px dashed Accent dim ring with a question mark in a 9 px Figure style and Text muted.

# Charts

Charts must let the Player read a trend across the whole Campaign without squinting. Every chart sits in its own panel with its title on the left and its current value on the right in the Headline figure style. A chart with several series shows a legend there instead of a current value, because no one value sums it up.

- A chart's vertical axis starts at 0 and labels its top and bottom values; the horizontal axis labels the first and last [Turn](../foundation/engine-contract.md#player-actions-and-turns), in the Axis style. A chart whose series also fall below 0 labels its top and bottom values and draws its baseline at 0.
- Grid lines are Raised; the baseline is Border.
- A chart with one series draws it as a 2 px line in Text colour with its latest point marked by a dot. A chart with several series draws each in its colour under [Chart series colours](#chart-series-colours): a line series as a 2 px line with its latest point marked by a dot, and a bar series as a segment of a stacked bar. A dot is 7 px across, and every line, outline, and dot keeps its size on screen however wide the chart is drawn.
- A stacked bar stands for one Turn and is 70% as wide as one Turn's share of the plot, with no gap between its segments. Its segments are stacked in the order of the legend, outward from the baseline, and a series whose value is 0 in that Turn draws no segment.
- A line series drawn over stacked bars has a 4 px Background outline beneath its 2 px line, so that it stays apart from a bar segment of a like colour behind it, and the line, its outline, and its dot are drawn at 50% opacity, so that the bars behind them stay readable, e.g. the Net flow line of the Money flow chart.
- A legend lists the series in their order, each as a 10 px square in its colour, or a 10 px by 2 px stroke for a line series, followed by its name in the Axis style in Text secondary, and wraps onto further lines when the chart is too narrow for one.
- While the pointer rests on a Turn of a chart with a legend, a line below the chart reads that Turn's values in the Axis style in Text secondary: "Turn" and its number, then each series with its value in legend order, leaving out every series whose value is 0. A chart whose stacked bars all count one quantity above the baseline, e.g. Agents, starts the list with "Total" and the sum of the bar, because the total is what its legend cannot show, e.g. "Turn 94: Total 40 · [Standby](../mechanics/agents-spec.md#assignments) 8 · [Training](../mechanics/agents-spec.md#assignments) 6 · [Contracting](../mechanics/agents-spec.md#assignments) 10". The line keeps its height while the pointer rests on no Turn, so that the charts below it never move.
- A chart whose series count two kinds of quantity, e.g. money and Agents, labels the vertical axis of the first on the left and of the second on the right, and names the right-axis series in its legend after the left-axis ones.
- At a window 1280 px wide, a chart's plot area is at least 120 px tall, and at most three charts sit side by side.
- Every chart has a "Last 100 Turns" checkbox, under [Checkboxes](#checkboxes), at the right end of its title row, before its legend or current value, so that the Player can look closely at the recent Turns of a long Campaign. While it is checked, the chart shows only the last 100 of the Turns it would otherwise show, labels the first and last of them on its horizontal axis, and scales its vertical axis to the values of those Turns; a chart of 100 Turns or fewer looks the same either way. Each chart keeps its own checkbox, unchecked when a Session starts and as the Player last left it for the rest of the Session.
