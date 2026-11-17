# Visual Design

| Metadata    | Value                                                                                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | VIS                                                                                                                                                                        |
| Family      | UI                                                                                                                                                                         |
| Audience    | UI designer, Implementer                                                                                                                                                   |
| Owns        | How the graphical user interface looks: its visual direction, Design tokens, and the styling of its components and charts.                                                 |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

The graphical user interface looks like a dark tactical command console: a near-black field, a single signal-orange
accent, condensed uppercase headings, and monospaced figures, so that the Player reads the state of the agency at a
glance, as an operator reads a heads-up display.

Every screen listed by the [Graphical User Interface](gui.md) is drawn with the same Design tokens and components, so a
screen that has no Artboard yet still looks like the screens that have one. The rules here are stated as text and are
complete on their own; Artboards illustrate them. What is particular to one screen or panel, and its Artboard, is in
that screen's or panel's specification, e.g. [Main Menu](screens/main-menu.md).

# Glossary

These terms are specific to Visual Design.

| Term               | Definition                                                                                                                                                              |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Artboard           | A mockup of one screen or one panel of the graphical user interface, exported from the Design canvas and kept in the repository as an image in `docs/images/artboards`. |
| Background artwork | An image that a [Detail view](gui.md#glossary) draws faintly behind its content, under [Background artwork](#background-artwork).                                       |
| Design canvas      | The claude.ai design artifact from which every Artboard is exported, under [Design canvas](#design-canvas).                                                             |
| Design token       | A named visual value, e.g. a colour, a font, or a spacing step, that every screen uses in place of a literal value.                                                     |
| Panel Artboard     | An Artboard of one panel or dialog on its own, without the screen around it, e.g. the History View.                                                                     |
| Screen Artboard    | An Artboard of a whole screen, which shows where each region of the screen sits; the panels on it are sample content, each detailed by its own specification.           |

# Design canvas

The Design canvas is the source of every Artboard: each image in `docs/images/artboards` is an export of one of its
artboards, so an Artboard is changed on the canvas and never by editing its image. The canvas is a claude.ai Design
artifact in the Game designer's private account, at <https://claude.ai/artifact/Fga63mUQ26RSxkyFybWmLc>, and only
Claude agents working through that account edit it, with the Artifact tool. An Implementer is not expected to open it:
the specifications and the Artboard images carry everything an Implementer needs.

The canvas, named Game v5 Web UI design canvas, holds only the chosen direction. Each of its artboards is one HTML
file, `project/<name>.dc.html`, listed in the index `project/canvas.json`. A screen artboard embeds each panel
artboard it shows with `<dc-import>` instead of copying it, so that a change to a panel appears in every screen
artboard that shows it.

To change an Artboard, edit its canvas artboard, then export the image of that artboard and of every screen artboard
that embeds it, and save each image under the name the table below gives it. An image is exported by reading the
artboard's published files with the Artifact tool and rendering them in a headless browser, e.g. Playwright, at the
width of the artboard's frame in `project/canvas.json` and a device pixel ratio of 1, with each `<dc-import>` replaced
by the body of the artboard it imports, and screenshotting the artboard's whole height. The repository script
`npm run artboards:export -- <canvas-dir> [<image> ...]` does all of this from a local copy of the artboard's
published files, and also exports every screen artboard that embeds a named one. An image uploaded to the canvas, e.g.
a [Background artwork](#background-artwork), is referenced by an artboard as `/_blob/<id>`; the script reads it from
`<canvas-dir>/assets/<id>.<extension>`, a copy that the Artifact tool saves when it reads that upload by its id. Commit
the images with the specification change they illustrate.

## Artboard sources

Each Artboard image comes from exactly one canvas artboard and is shown in exactly one specification. This table is
exhaustive.

| Image                      | Kind   | Canvas artboard              | Shown in                                        |
| -------------------------- | ------ | ---------------------------- | ----------------------------------------------- |
| `main-menu.png`            | Screen | `Main.dc.html`               | [Main Menu](screens/main-menu.md)               |
| `campaign-screen.png`      | Screen | `CampaignScreen.dc.html`     | [Campaign Screen](screens/campaign-screen.md)   |
| `campaign-screen-view.png` | Screen | `CampaignScreenView.dc.html` | [Campaign Screen](screens/campaign-screen.md)   |
| `situation-panel.png`      | Panel  | `SituationPanel.dc.html`     | [Situation Panel](screens/situation-panel.md)   |
| `turn-summary.png`         | Panel  | `TurnSummary.dc.html`        | [Turn Summary](screens/turn-summary.md)         |
| `missions-view.png`        | Panel  | `MissionsView.dc.html`       | [Missions View](screens/missions-view.md)       |
| `leads-view.png`           | Panel  | `LeadsView.dc.html`          | [Leads View](screens/leads-view.md)             |
| `agents-view.png`          | Panel  | `AgentsView.dc.html`         | [Agents View](screens/agents-view.md)           |
| `agents-memorial.png`      | Panel  | `AgentsMemorial.dc.html`     | [Agents View](screens/agents-view.md)           |
| `upgrades-view.png`        | Panel  | `UpgradesView.dc.html`       | [Upgrades View](screens/upgrades-view.md)       |
| `turn-report-view.png`     | Panel  | `TurnReportView.dc.html`     | [Turn Report View](screens/turn-report-view.md) |
| `history-view.png`         | Panel  | `HistoryView.dc.html`        | [History View](screens/history-view.md)         |
| `charts-view.png`          | Panel  | `ChartsView.dc.html`         | [Charts View](screens/charts-view.md)           |
| `compendium-view.png`      | Panel  | `CompendiumView.dc.html`     | [Compendium View](screens/compendium-view.md)   |

# Reading Artboards

An Artboard shows how the rules of this specification look when applied to one screen. It is a picture, not a contract:
the rules are complete only as text, and when an Artboard and the text disagree, the text applies.

What a screen shows and which operations it offers is owned by the [Graphical User Interface](gui.md), the
specification of that screen or panel, and the specifications they use, never by an Artboard. An element that appears
on an Artboard but that no specification requires must not be implemented; each specification that shows an Artboard
lists such elements of it, e.g. the Resume button under [Main Menu](screens/main-menu.md).

# Design tokens

Design tokens keep every screen consistent: a screen uses these values and no other colours, fonts, or radii. The
interface has a dark theme only; the light theme is a TODO.

## Colours

Each colour has one role, so that the same colour always means the same thing across screens. This table is
exhaustive.

| Token          | Value                    | Role                                                                                                                                                                                                                                                                                                                                                                                  |
| -------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Background     | `#0D0D0B`                | The page behind all panels, and the fill of inputs and of an enabled unchecked checkbox.                                                                                                                                                                                                                                                                                              |
| Surface        | `#151512`                | Panels, cards, and chart frames.                                                                                                                                                                                                                                                                                                                                                      |
| Raised         | `#22211C`                | Neutral buttons, navigation buttons, and row dividers inside panels.                                                                                                                                                                                                                                                                                                                  |
| Divider        | `#2B2A24`                | Dividers between panel sections, empty meter segments, and the outline of a disabled checkbox.                                                                                                                                                                                                                                                                                        |
| Border         | `#3A382F`                | Borders of controls, table header rules, chart baselines, and the top edge of a plain card.                                                                                                                                                                                                                                                                                           |
| Text           | `#E8E4D8`                | Primary text and the lines of neutral chart series.                                                                                                                                                                                                                                                                                                                                   |
| Text secondary | `#B8B3A6`                | Supporting prose, e.g. the game description on the Main menu.                                                                                                                                                                                                                                                                                                                         |
| Text muted     | `#9C978A`                | Labels, hints, and idle states, e.g. an Agent on standby; the outline of an enabled unchecked checkbox and the tick of a disabled checked one.                                                                                                                                                                                                                                        |
| Axis           | `#8F8A7D`                | Chart axis labels.                                                                                                                                                                                                                                                                                                                                                                    |
| Accent         | `#FF7A1A`                | The primary action, an enabled checked checkbox, the open-Detail-view marker, the card edge of the [Campaign](../foundation/core-concepts.md#campaign-and-session) of the most recent [Campaign save](../foundation/engine-contract.md#persisted-data) on the [Main menu](../foundation/campaign-lifecycle.md#glossary), and [Panic](../mechanics/domain-model.md#campaign-standing). |
| Accent dim     | `#7A4A22`                | A partly filled meter segment, and a disabled checked checkbox.                                                                                                                                                                                                                                                                                                                       |
| Accent text    | `#FF8A33`                | Text that needs attention, e.g. a count on a navigation button, a low health value, or an expired [Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions).                                                                                                                                                                                       |
| On accent      | `#1A0B00`                | Text on an Accent fill.                                                                                                                                                                                                                                                                                                                                                               |
| Positive       | `#B7C77A`                | Gains and successes, e.g. income, a won [Mission](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), or an Agent on an assignment.                                                                                                                                                                                                                        |
| Danger         | `#FF7F78`                | Losses, destructive actions, and limits, e.g. upkeep, Delete, and the [Panic limit](../mechanics/panic-and-endings.md#glossary).                                                                                                                                                                                                                                                      |
| Danger border  | `#5E2A26`                | The border of a destructive button.                                                                                                                                                                                                                                                                                                                                                   |
| Warning        | `#E3C14B`                | Values that need watching before they become a problem, e.g. an Agent's exhaustion at which it can no longer start work, under [Agent condition](#agent-condition).                                                                                                                                                                                                                   |
| Danger deep    | `#A3271F`                | The far end of the [current health](../mechanics/agents-spec.md#combatant-attributes) scale: an [Agent](../mechanics/domain-model.md#agency-and-agents) close to death, under [Agent condition](#agent-condition).                                                                                                                                                                    |
| Limit band     | `#E5484D` at 12% opacity | The band that marks a losing limit on a chart.                                                                                                                                                                                                                                                                                                                                        |
| Scrim          | `#0D0D0B` at 72% opacity | The layer that dims the screen behind a dialog.                                                                                                                                                                                                                                                                                                                                       |

## Typography

Three typefaces separate three kinds of text: condensed headings name things, the body font explains them, and the
monospaced font carries every number and identifier. All three are Google Fonts. This table is exhaustive.

| Style           | Font             | Weight | Size  | Case and spacing                | Use                                                                                             |
| --------------- | ---------------- | ------ | ----- | ------------------------------- | ----------------------------------------------------------------------------------------------- |
| Screen title    | Barlow Condensed | 700    | 56 px | Uppercase, 0.04 em              | The game title on the [Main menu](../foundation/campaign-lifecycle.md#glossary).                |
| Section heading | Barlow Condensed | 700    | 22 px | Uppercase, 0.08 em              | The heading of a Main menu column.                                                              |
| Panel heading   | Barlow Condensed | 700    | 18 px | Uppercase, 0.08 em              | The heading of a panel, a table, or a headline chart.                                           |
| Label           | Barlow Condensed | 600    | 13 px | Uppercase, 0.12 em, Text muted  | Field labels, table headers, and status bar labels.                                             |
| Button          | Barlow Condensed | 600    | 14 px | Uppercase, 0.1 em               | Button text; 17 px on a screen's main action.                                                   |
| Body            | Barlow           | 400    | 15 px | Sentence case, line height 1.45 | Prose, table cells that hold words, and input text.                                             |
| Figure          | JetBrains Mono   | 400    | 15 px | Tabular figures                 | Every number and identifier, e.g. Money or a [Campaign ID](../foundation/saves.md#identifiers). |
| Headline figure | JetBrains Mono   | 400    | 22 px | Tabular figures                 | A status bar value and the current value of a chart.                                            |
| Axis            | JetBrains Mono   | 400    | 11 px | Axis colour                     | Chart axis labels.                                                                              |

## Spacing and shape

Even spacing is what makes the screens read as orderly, so spacing follows fixed steps rather than case-by-case values.

- Controls in one group, e.g. Load and Delete, are 8 px apart.
- Panels stacked in one column are 16 px apart on the Campaign screen and 24 px apart on the Main menu; columns are
  24 px apart on the Main menu. The regions of the Campaign screen meet without a gap.
- A panel has 18 px of inner padding; a table cell has 8 px vertical and 10 px horizontal padding.
- The Main menu has at least 24 px of outer padding, and the Main menu content is at most 1216 px wide and centred.
- Controls have a 2 px corner radius; panels and cards have square corners and no outline.
- Two pieces of text on one line never touch: they are at least 8 px apart, or joined by a " · " separator, e.g. a
  Mission site's name, kind, and Faction, and a value right-aligned after them.

## Alignment

A screen reads as one instrument only when its parts line up, so every element is aligned with its neighbours by
these rules, at every window width, and no alignment is left to the content an element happens to hold. This list is
exhaustive.

- **Text on one line:** pieces of text on one line share one baseline, whatever their styles, e.g. the Panel heading
  "Agents" and the figures "20 / 20 · Training 4 / 4" after it in the Agents View. Text is never centred on its line
  by the height of its box, because styles of different sizes then sit at different heights.
- **Controls in one row:** the controls of one row, e.g. the filters, buttons, and close control of a Detail view's
  title row, are equally tall and share one centre line. Text in the row, e.g. a count of selected rows after a
  button, is centred on that line too.
- **Labelled groups:** a group of controls under a Label, e.g. the "Show agents" filters of the Agents View, stands
  its Label above its controls, and the controls share the row's centre line with every control of the row that has
  no Label, e.g. the close control sits level with those filters, not with their Label.
- **Cards side by side:** cards in one row are equally tall, and each part of a card starts at the same height on
  every card of the row, because each part takes the height of its tallest instance in the row. E.g., when the change
  of one Upgrade card wraps onto a second line, the Buy buttons of all the Upgrade cards still sit on one line.
- **A note beside a control:** a note about a control, e.g. the money missing for a disabled Buy button, sits on the
  control's row, 8 px after it, and never moves below it; a note longer than the space left beside the control wraps
  within that space.

# Components

Components are the building blocks every screen reuses. A screen that needs a control not described here builds it from
the Design tokens in the same manner.

## Buttons

Buttons come in three kinds so that the Player can tell at a glance what a button will do. This list is exhaustive.

- A neutral button has a Raised fill, a Border outline, and Text-coloured text.
- A primary button has an Accent fill and On-accent text. A panel has at most one primary button, and it is the action
  the panel exists for, e.g. Start Campaign or Advance turn.
- A destructive button has no fill, a Danger border outline, and Danger text, e.g. Delete and Delete campaign.

A button is 36 px tall, 32 px inside a table row, and 44 to 46 px for the main action of a screen. A button's label
never wraps onto a second line. Buttons that belong together sit in one row with 8 px between them. A row of buttons
that follows content on the same line, e.g. the Load and Delete of a Campaign save, or that ends a panel or dialog,
aligns to the right edge of its row or panel. A row of buttons that is a part of its own in a card whose parts are
stacked, e.g. the Buy button of an Upgrade card, starts at the card's left content edge, as the card's text does. When
a row is too narrow, the whole group wraps below the content, never a single label.
A disabled button keeps its kind and is drawn at 40% opacity.

## Inputs

Inputs share one shape so that every editable value is recognisable. An input or a select is 40 px tall, has a
Background fill, a Border outline, and Body text. Its label sits above it in the Label style, or to its left with a
muted hint below the label when the input is one row of a settings list. A numeric input uses the Figure style and
aligns its value to the right.

## Checkboxes

A checkbox shows at a glance whether the Player can change it, because a disabled checkbox among enabled ones, e.g. the
row of an Agent In transit in the [Agents View](screens/agents-view.md), must not pass for one the Player can select. A
checkbox is a 16 px square with the control corner radius, drawn in these states. This list is exhaustive.

- **Enabled, unchecked:** a Background fill and a 1 px Text muted outline.
- **Enabled, checked:** an Accent fill and outline, with an On-accent tick.
- **Disabled, unchecked:** no fill and a 1 px Divider outline, so it reads as an empty slot.
- **Disabled, checked:** an Accent dim fill and outline, with a Text muted tick.

The pointer over a disabled checkbox shows that it cannot be changed. A checkbox's label, when it has one, sits to its
right in Body text, 8 px from it.

## Sliders

A slider shows its value as the filled share of its track, so the Player reads it at a glance, e.g. the Volume slider
of the [Music control](music.md#music-control). At the least value no part of the track is filled and at the greatest
value all of it is, and no part of the track ever shows beyond the thumb at either end. The track is 4 px tall with
fully rounded ends, in Accent from its left end up to the thumb and in Divider beyond. The thumb is a 14 px Accent
circle whose centre sits at the end of the filled part, so at either end of the track it overhangs by half its width
and the track spans exactly the thumb's travel.

## Panels and cards

A panel groups what belongs together on a Surface fill with no outline. A card is a panel for one item of a list, e.g.
one Campaign on the Main menu; it has a 2 px top edge in Border, or in Accent when it is the item the Player most likely
wants, e.g. the Campaign of the most recent [Campaign save](../foundation/engine-contract.md#persisted-data).

A panel that lists groups, e.g. the panel of the Campaign screen that lists the work waiting for the Player, heads
each group with a Label and its count in the Figure style and Accent text, and separates groups with Divider rules.
In a panel whose items take one line each, each item is a row 28 px tall, separated by Raised dividers: its name in Body on the left, and
its value, e.g. a [Completion estimate](gui.md#glossary), right-aligned in the Figure style and Text secondary, with a
[Progress circle](gui.md#glossary) between them. In a panel whose items take more than one line, e.g. the
[Turn Summary](screens/turn-summary.md), an item's value, e.g. the [Turns](../foundation/engine-contract.md#player-actions-and-turns) until expiration of a new [Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), is
likewise right-aligned on the item's first line, in the Figure style when it is a number, and the item's further lines
hold its details. A [Completion estimate](gui.md#glossary) whose earliest Advance turn is the next one is in
Accent text, and "in transit", "stalled", and "ETA ?" are in Text muted. A [Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) that expires within two [Turns](../foundation/engine-contract.md#player-actions-and-turns) shows its Turns until expiration
in Accent text.

## Dialogs

A dialog interrupts the screen only for what the Player must see before going on, e.g. what an Advance turn did. It
sits centred over a Scrim on a Surface fill with a 2 px Accent top edge, at most
640 px wide, with its title in the Section heading style and its buttons in one row at the bottom right under
[Buttons](#buttons); the action that dismisses it is primary. A dialog taller than the window scrolls inside, keeping
its title and buttons in view.

## Tables

Tables carry most of the game's data, so they are dense but aligned. A header row uses the Label style over a Border
rule; body rows are separated by Raised dividers. Columns that hold numbers use the Figure style and are right-aligned,
their header included. Row actions sit in the last column, under [Buttons](#buttons). Text that encodes
a state uses the colour of that state, e.g. Positive for a won Mission, and Text muted for an idle Agent.

A table keeps its columns still, so that the Player's eye finds a value where it was a moment ago. Each column has a
fixed width set by the table's design, and neither what the rows hold nor the width of the screen changes it. E.g., an
Assignment that gains "· In transit", a filter that hides rows, or a wider window moves and resizes no column.

A table's columns sit side by side from its left edge, and no column stretches to fill a wide table, so that every
value stays close to the rest of its row. On a wide screen the spare width lies to the right of the last column, never
between two columns; e.g., the reason column of the [Agents View](screens/agents-view.md) follows the Assignment column
directly, however wide the screen. A table narrower than its columns scrolls sideways within its panel.

Every row of a table is one line tall, so that rows line up and a long value does not push the rows below it down.
Each column is wide enough to hold on one line every value that the specifications list for it, e.g. the reason
"Already on Contracting" in the [Agents View](screens/agents-view.md). A value of free text that can still be too long
for its column, e.g. the message of an engine rejection, is cut short with "…" and shown in full while the pointer rests
on it.

A table whose rows each have a selection checkbox lets the Player select several rows at once, in these ways:

- **Click:** clicking a row's checkbox, or the row outside its links and buttons, selects or clears that row and makes
  it the anchor.
- **Shift-click:** Shift-clicking a row gives every row from the anchor to that row, both included, the state the
  anchor has. E.g., after clicking agent-10 to select it and then Shift-clicking agent-3, agent-3 to agent-10 are all
  selected.
- **Drag:** pressing on a row and moving the pointer across others gives each row passed over the state the pressed
  row took, so one drag selects or clears a run of rows.

A row whose checkbox is disabled is skipped by every one of these. Pressing or dragging over the rows never selects
their text.

The header row holds a Select all checkbox above the rows' checkboxes. Checking it selects every shown row whose
checkbox is enabled, and it stays checked while the selection follows that set: whenever which rows are shown, or which
of them can be selected, changes, e.g. because a filter changed, the selection becomes exactly the shown rows that can
be selected. Unchecking it clears the selection, and clicking, Shift-clicking, or dragging over any row unchecks it and
keeps the selection as it then is.

A table whose column headers sort it remembers up to four sort tiers, so that a new sort refines the earlier ones
instead of discarding them. Rows are ordered by the first tier, rows equal in it by the second, and so on, and rows
equal in every tier keep the table's default order. Pressing a header works as follows:

- **A column in no tier** becomes the first tier, descending when it holds numbers and ascending otherwise; every
  earlier tier moves down one, and a tier pushed past the fourth is dropped.
- **The column of the first tier** flips its direction.
- **The column of a lower tier** becomes the first tier with the direction it had, leaving its old tier, and the tiers
  that were above it move down one.

E.g., after sorting the [Agent table](screens/agents-view.md#agent-table) by effective skill and then by reason, the rows with an empty reason come first,
and among them the rows are ordered by effective skill.

The header of each column in a tier shows its direction as ▲ for ascending or ▼ for descending, after its label, at
full opacity for the first tier and at 70 %, 45 %, and 25 % opacity for the second, third, and fourth tier. A header
is never cut short: each column's width holds its header's label together with that arrow, e.g. the base weapon damage
column of the [Agents View](screens/agents-view.md) is wide enough for its label followed by "▼".

## Agent condition

Wherever a table shows an [Agent](../mechanics/domain-model.md#agency-and-agents)'s [exhaustion](../mechanics/agents-spec.md#combatant-attributes) or [current health](../mechanics/agents-spec.md#combatant-attributes), its colour tells the Player at a glance how worn
down the Agent is, so that a tired or hurt Agent stands out before it is sent anywhere.

- **Exhaustion:** Text below `exhaustion_work_start_max`; Warning from `exhaustion_work_start_max`; Accent text from the
  midpoint of `exhaustion_work_start_max` and `exhaustion_work_limit`, rounded up; and Danger from
  `exhaustion_work_limit`, with a warning-triangle icon before the value. The thresholds come from
  [AgentParameters](../mechanics/agents-spec.md#agentparameters), so they follow the [GDRs](../foundation/core-concepts.md#game-build-and-content). E.g., with the Bootstrap values 30 and 70, exhaustion 29 is
  in Text, 30 in Warning, 50 in Accent text, and 70 in Danger with the triangle.
- **Current health:** a smooth scale over the share of [base health](../mechanics/agents-spec.md#combatant-attributes) that current health is. Its stops are Text at
  100%, Warning at 75%, Accent text at 50%, Danger at 25%, and Danger deep at 0%, and a share between two stops takes
  the colour between them in proportion, mixed in sRGB. E.g., 30 of 30 is in Text, 15 of 30 in Accent text, and 1 of
  30 almost in Danger deep.

## Detail views and navigation

The [Side panel](gui.md#glossary) is the console beside the globe, so it reads as one dark column and the globe as open space.

- **[Globe stage](gui.md#glossary):** a Background fill behind the globe, with no panel or outline around it.
- **Side panel:** 400 px wide, on a Surface fill with a 1 px Divider rule along its left edge. Its sections are
  separated by Divider rules and have 16 px of inner padding.
- **Navigation buttons:** each group name is in the Label style above its buttons, which sit two to a row with 8 px
  between them. A navigation button is a neutral button in the Button style, its name on the left and its count, if
  any, on the right in the Figure style and Accent text. The button of the open [Detail view](gui.md#glossary) has a 2 px Accent line along its
  bottom edge.
- **Detail view:** it covers the Globe stage inset by 16 px, on a Surface fill with a 2 px Accent top edge and 18 px of inner
  padding. Its title is in the Panel heading style on the left, with its buttons and then its close control in one row
  on the right, under [Buttons](#buttons) and [Alignment](#alignment). The close control is a square neutral button,
  36 px wide and tall, holding a ✕. A Detail view taller than the Globe stage scrolls inside, keeping its title row in
  view.

## Background artwork

Background artwork lets the Player enjoy a picture of the agency at work while reading a Detail view, without the
picture ever competing with what the Player reads: it is drawn so faintly that it reads as part of the dark field, not
as an image laid over it. It is decoration only: it shows no game state and the Player cannot act on it.

Each image is a file in the `assets/images/` directory at the repository root, and only the Detail views in this table
show one. This table is exhaustive.

| Detail view                               | Image                             |
| ----------------------------------------- | --------------------------------- |
| [Missions View](screens/missions-view.md) | `v03ai-nano21-command-center.jpg` |
| [Agents View](screens/agents-view.md)     | `chatgpt-agents-i2.png`           |

A Detail view draws its Background artwork as follows:

- **Place:** between its Surface fill and its content, filling the whole Detail view below its top edge. The image is
  scaled to cover that area with its proportions kept, centred, and cropped where the proportions differ. It stays in
  place while the content scrolls over it.
- **Opacity:** 12%, so that even where the image is white, Text muted keeps a contrast ratio of at least 4.5:1 against
  what lies behind it.
- **Panels inside it:** a panel inside the Detail view, e.g. a pane of the Missions View, draws its Background fill at
  35% opacity, so that the image shows through it too while the panel still reads as an area of its own. A selected row
  and a button keep their fills opaque.

The Detail view shows its Background artwork whatever it holds, e.g. the Agents View with its Memorial filter on. When
the image cannot be loaded, the Detail view looks as it would without it.

## Status bar

The status bar keeps the agency's vital values in view on every Campaign screen. It spans the screen on a Surface fill
with a 2 px Accent bottom edge. Each value sits under its label in the Headline figure style; a change of a value, e.g.
projected income, follows it in a 13 px Figure style in Positive or Danger. The screen's controls follow the values,
with the main action, e.g. Advance turn, last and primary.

## Meters

A meter shows a value against its limit, e.g. Panic against the Panic limit. It is a row of 10 equal segments, 8 px
tall with 3 px gaps. Each full tenth of the limit fills one segment in Accent, a remaining part of a tenth fills the next
segment in Accent dim, and the other segments are Divider. The value and the limit are written above the meter's right
end in Accent text, e.g. "24 / 100%".

## Tallies

A tally shows a count that has no limit as a stack of marks, so the Player can compare counts at a glance, e.g. the
Acquisitions of each Upgrade. It is one Accent square per counted item, 12 px wide and tall with 3 px gaps, filled left
to right in rows of 10, e.g. 13 items show one full row and 3 squares under it. It grows by a row with every 10 items up to
10 rows, and a count above 100 still shows 100 squares. A count of 0 shows no squares. The exact count is also shown as
text, e.g. "Bought 137×", because the squares stop growing.

## Progress bars

A [Progress bar](gui.md#glossary) lets the Player read at a glance how close an [Investigation](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) is to completing, so its colour warms as
completion nears instead of switching hue. It is 8 px tall in a panel row and 10 px in a dialog, on a Divider track.

- **Fill:** its colour runs linearly from Accent dim at 0 to Accent at the [Required progress](../mechanics/leads-and-progression.md#glossary), by the share of the
  Required progress reached, and stays Accent beyond it.
- **Zone and tick:** the zone from the Required progress to the end of the bar is hatched with diagonal stripes of
  Raised and Border. The tick at the Required progress is a 2 px Text line that overhangs the bar by 3 px above and
  below. The Required progress and the greatest value of the range are written under the tick and under the bar's end
  in the Axis style.
- **Preview:** the preview segment of the projected progress gain is Positive at 30% opacity.
- **Caption:** a caption under the bar is in 12 px Body and Text muted, or in Accent text when it says that the
  Investigation may complete next turn or any turn, with the projected progress gain on its right in the Figure style and
  Positive, e.g. "+1.74 / turn".
- **Unscaled bar:** the bar of a [Lead](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) that is not an [Assessed Lead](../mechanics/investigations.md#glossary) has a dashed track of Divider dashes 6 px long with
  4 px gaps, and an Accent dim stub 12% of its width.
- **Completed Investigation:** in a dialog, the gain of the last Advance turn is a Positive segment labelled
  with that gain above it in Positive, and the point where the Investigation completed carries a check in a Positive
  circle 20 px wide, with the check in Background and the final [Investigation progress](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) under it in Positive.

## Progress circles

A [Progress circle](gui.md#glossary) is 18 px wide and sits on the text line it belongs to. Its track is a 1.5 px Border
ring, and its fill is a sector from the top, clockwise, coloured as the Fill of [Progress bars](#progress-bars). A full
circle is an Accent disc with a check in On accent. The circle of a [Lead](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) that is not an [Assessed Lead](../mechanics/investigations.md#glossary) is a
1.5 px dashed Accent dim ring with a question mark in a 9 px Figure style and Text muted.

# Charts

Charts must let the Player read a trend across the whole Campaign without squinting. Every chart sits in its own panel
with its title on the left and its current value on the right in the Headline figure style.

- A chart's vertical axis starts at 0 and labels its top and bottom values; the horizontal axis labels the first and
  last [Turn](../foundation/engine-contract.md#player-actions-and-turns), in the Axis style.
- Grid lines are Raised; the baseline is Border.
- A series is a 2 px line in Text colour with its latest point marked by a dot.
- At a window 1280 px wide, a chart's plot area is at least 120 px tall, and at most three charts sit side by side.

# TODOs

- TODO: Define the light theme's Design tokens under [Colours](#colours), since the Settings panel lets the Player
  choose a light theme, including the value of every colour token and the contrast each text colour keeps against its
  fill.
