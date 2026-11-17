# Visual Design

| Metadata    | Value                                                                                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | VIS                                                                                                                                                                        |
| Family      | UI                                                                                                                                                                         |
| Audience    | UI designer, Implementer                                                                                                                                                   |
| Owns        | How the graphical user interface looks: its visual direction, Design tokens, and the styling of its components and charts.                                                 |
| Conventions | [Specification conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

The graphical user interface looks like a dark tactical command console: a near-black field, a single signal-orange
accent, condensed uppercase headings, and monospaced figures, so that the Player reads the state of the agency at a
glance, as an operator reads a heads-up display. The direction is called Field HUD.

Every screen listed by the [Graphical User Interface](gui.md) is drawn with the same Design tokens and components, so a
screen that has no Artboard yet still looks like the screens that have one. The rules here are stated as text and are
complete on their own; Artboards illustrate them. What is particular to one screen or panel, and its Artboard, is in
that screen's or panel's specification, e.g. [Main Menu](screens/main-menu.md).

# Glossary

These terms are specific to Visual Design.

| Term            | Definition                                                                                                                                                              |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Artboard        | A mockup of one screen or one panel of the graphical user interface, exported from the Design canvas and kept in the repository as an image in `docs/images/artboards`. |
| Design canvas   | The claude.ai design artifact from which every Artboard is exported, under [Design canvas](#design-canvas).                                                             |
| Design token    | A named visual value, e.g. a colour, a font, or a spacing step, that every screen uses in place of a literal value.                                                     |
| Panel Artboard  | An Artboard of one panel or dialog on its own, without the screen around it, e.g. the History tab.                                                                      |
| Screen Artboard | An Artboard of a whole screen, which shows where each region of the screen sits; the panels on it are sample content, each detailed by its own specification.           |

# Design canvas

The Design canvas is the source of every Artboard: each image in `docs/images/artboards` is an export of one of its
artboards, so an Artboard is changed on the canvas and never by editing its image. The canvas is a claude.ai Design
artifact in the Game designer's private account, at <https://claude.ai/artifact/Fga63mUQ26RSxkyFybWmLc>, and only
Claude agents working through that account edit it, with the Artifact tool. An Implementer is not expected to open it:
the specifications and the Artboard images carry everything an Implementer needs.

The canvas holds only the chosen Field HUD direction. Each of its artboards is one HTML file, `project/<name>.dc.html`,
listed in the index `project/canvas.json`. A screen artboard embeds each panel artboard it shows with `<dc-import>`
instead of copying it, so that a change to a panel appears in every screen artboard that shows it.

To change an Artboard, edit its canvas artboard, then export the image of that artboard and of every screen artboard
that embeds it, and save each image under the name the table below gives it. An image is exported by reading the
artboard's published files with the Artifact tool and rendering them in a headless browser, e.g. Playwright, at the
width of the artboard's frame in `project/canvas.json` and a device pixel ratio of 1, with each `<dc-import>` replaced
by the body of the artboard it imports, and screenshotting the artboard's whole height. Commit the images with the
specification change they illustrate.

## Artboard sources

Each Artboard image comes from exactly one canvas artboard and is shown in exactly one specification. This table is
exhaustive.

| Image                 | Kind   | Canvas artboard          | Shown in                                      |
| --------------------- | ------ | ------------------------ | --------------------------------------------- |
| `main-menu.png`       | Screen | `Main.dc.html`           | [Main Menu](screens/main-menu.md)             |
| `campaign-screen.png` | Screen | `CampaignScreen.dc.html` | [Campaign Screen](screens/campaign-screen.md) |
| `history-tab.png`     | Panel  | `HistoryTab.dc.html`     | [History Tab](screens/history-tab.md)         |
| `situation-panel.png` | Panel  | `SituationPanel.dc.html` | [Situation Panel](screens/situation-panel.md) |
| `turn-summary.png`    | Panel  | `TurnSummary.dc.html`    | [Turn Summary](screens/turn-summary.md)       |

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

| Token          | Value                    | Role                                                                                                                                                                                               |
| -------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Background     | `#0D0D0B`                | The page behind all panels, and the fill of inputs.                                                                                                                                                |
| Surface        | `#151512`                | Panels, cards, and chart frames.                                                                                                                                                                   |
| Raised         | `#22211C`                | Neutral buttons, the selected tab, and row dividers inside panels.                                                                                                                                 |
| Divider        | `#2B2A24`                | Dividers between panel sections, and empty meter segments.                                                                                                                                         |
| Border         | `#3A382F`                | Borders of controls, table header rules, chart baselines, and the top edge of a plain card.                                                                                                        |
| Text           | `#E8E4D8`                | Primary text and the lines of neutral chart series.                                                                                                                                                |
| Text secondary | `#B8B3A6`                | Supporting prose, e.g. the game description on the Main menu.                                                                                                                                      |
| Text muted     | `#9C978A`                | Labels, hints, and idle states, e.g. an Agent on standby.                                                                                                                                          |
| Axis           | `#8F8A7D`                | Chart axis labels.                                                                                                                                                                                 |
| Accent         | `#FF7A1A`                | The primary action, the selected-tab marker, the current [Campaign](../foundation/core-concepts.md#campaign-and-session)'s card edge, and [Panic](../mechanics/domain-model.md#campaign-standing). |
| Accent dim     | `#7A4A22`                | A partly filled meter segment.                                                                                                                                                                     |
| Accent text    | `#FF8A33`                | Text that needs attention, e.g. a tab count, a low health value, or an expired [Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions).                       |
| On accent      | `#1A0B00`                | Text on an Accent fill.                                                                                                                                                                            |
| Positive       | `#B7C77A`                | Gains and successes, e.g. income, a won [Mission](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), or an Agent on an assignment.                                     |
| Danger         | `#FF7F78`                | Losses, destructive actions, and limits, e.g. upkeep, Delete, and the [Panic limit](../mechanics/panic-and-endings.md#glossary).                                                                   |
| Danger border  | `#5E2A26`                | The border of a destructive button.                                                                                                                                                                |
| Limit band     | `#E5484D` at 12% opacity | The band that marks a losing limit on a chart.                                                                                                                                                     |
| Scrim          | `#0D0D0B` at 72% opacity | The layer that dims the screen behind a dialog.                                                                                                                                                    |

## Typography

Three typefaces separate three kinds of text: condensed headings name things, the body font explains them, and the
monospaced font carries every number and identifier. All three are Google Fonts. This table is exhaustive.

| Style           | Font             | Weight | Size  | Case and spacing                | Use                                                                                             |
| --------------- | ---------------- | ------ | ----- | ------------------------------- | ----------------------------------------------------------------------------------------------- |
| Screen title    | Barlow Condensed | 700    | 56 px | Uppercase, 0.04 em              | The game title on the [Main menu](../foundation/campaign-lifecycle.md#glossary).                |
| Section heading | Barlow Condensed | 700    | 22 px | Uppercase, 0.08 em              | The heading of a Main menu column.                                                              |
| Panel heading   | Barlow Condensed | 700    | 18 px | Uppercase, 0.08 em              | The heading of a panel, a table, or a headline chart.                                           |
| Label           | Barlow Condensed | 600    | 13 px | Uppercase, 0.12 em, Text muted  | Field labels, table headers, and status bar labels.                                             |
| Button          | Barlow Condensed | 600    | 14 px | Uppercase, 0.1 em               | Button and tab text; 17 px on a screen's main action.                                           |
| Body            | Barlow           | 400    | 15 px | Sentence case, line height 1.45 | Prose, table cells that hold words, and input text.                                             |
| Figure          | JetBrains Mono   | 400    | 15 px | Tabular figures                 | Every number and identifier, e.g. Money or a [Campaign ID](../foundation/saves.md#identifiers). |
| Headline figure | JetBrains Mono   | 400    | 22 px | Tabular figures                 | A status bar value and the current value of a chart.                                            |
| Axis            | JetBrains Mono   | 400    | 11 px | Axis colour                     | Chart axis labels.                                                                              |

## Spacing and shape

Even spacing is what makes the screens read as orderly, so spacing follows fixed steps rather than case-by-case values.

- Controls in one group, e.g. Load and Delete, are 8 px apart.
- Panels stacked in one column are 16 px apart on the Campaign screen and 24 px apart on the Main menu; columns and
  the major regions of a screen are 20 px apart on the Campaign screen and 24 px apart on the Main menu.
- A panel has 18 px of inner padding; a table cell has 8 px vertical and 10 px horizontal padding.
- A screen has at least 24 px of outer padding, and the Main menu content is at most 1216 px wide and centred.
- Controls have a 2 px corner radius; panels and cards have square corners and no outline.

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
never wraps onto a second line. Buttons that belong together sit in one row with 8 px between them, aligned to the right
edge of their row or panel; when the row is too narrow, the whole group wraps below the content, never a single label.
A disabled button keeps its kind and is drawn at 40% opacity.

## Inputs

Inputs share one shape so that every editable value is recognisable. An input or a select is 40 px tall, has a
Background fill, a Border outline, and Body text. Its label sits above it in the Label style, or to its left with a
muted hint below the label when the input is one row of a settings list. A numeric input uses the Figure style and
aligns its value to the right.

## Panels and cards

A panel groups what belongs together on a Surface fill with no outline. A card is a panel for one item of a list, e.g.
one Campaign on the Main menu; it has a 2 px top edge in Border, or in Accent when it is the item the Player most likely
wants, e.g. the Campaign of the most recent [Campaign save](../foundation/engine-contract.md#persisted-data).

A panel that lists groups, e.g. the panel of the Campaign screen that lists the work waiting for the Player, heads
each group with a Label and its count in the Figure style and Accent text, and separates groups with Divider rules. A [Mission site](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) that expires within two [Turns](../foundation/engine-contract.md#player-actions-and-turns) shows its Turns until expiration
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
their header included. Row actions sit in the last column, right-aligned, under [Buttons](#buttons). Text that encodes
a state uses the colour of that state, e.g. Positive for a won Mission, and Text muted for an idle Agent.

## Tabs

Tabs switch the main area of the Campaign screen. A tab uses the Button text style with no fill; the selected tab has a
Raised fill, a Border outline, and a 2 px Accent line along its bottom edge. A count on a tab, e.g. the number of
Mission sites, follows the tab name in the Figure style and Accent text.

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
