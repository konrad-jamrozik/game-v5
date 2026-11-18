# Main Menu

| Metadata    | Value                                                                                                                                                                            |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | MENU                                                                                                                                                                             |
| Family      | UI                                                                                                                                                                               |
| Audience    | UI designer, Implementer                                                                                                                                                         |
| Owns        | What the Main menu screen of the graphical user interface shows and how it is laid out.                                                                                          |
| Conventions | [Specification Conventions](../../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../../governance/conventions/design-spec-conventions.md) |

# Overview

The GUI opens at the [Main menu](../../foundation/campaign-lifecycle.md#glossary), the [Session](../../foundation/core-concepts.md#campaign-and-session) state with no [Current campaign](../../foundation/core-concepts.md#campaign-and-session) under
[Session lifecycle](../../foundation/campaign-lifecycle.md#session-lifecycle) in Campaign Lifecycle. It is one of the screens that the
[Graphical User Interface](../gui.md) lists, and it is drawn with the Design tokens and components of
[Visual Design](../visual-design.md).

# Campaign saves

The [Main menu](../../foundation/campaign-lifecycle.md#glossary) lists the [Campaign saves](../../foundation/engine-contract.md#persisted-data), and lets the Player delete each listed Campaign save and each listed [Campaign](../../foundation/core-concepts.md#campaign-and-session)
with all its Campaign saves, under [Deleting Campaign saves](../../foundation/saves.md#deleting-campaign-saves) in Saves.
Because deleting cannot be undone, the GUI asks the Player to confirm each deletion first, naming the Campaign save or
the Campaign and how many Campaign saves it removes.

# New Campaign

The New Campaign panel sets up a Campaign and creates it, under [Preset selection and edits](../../foundation/configuration.md#preset-selection-and-edits) in Configuration. It holds,
from top to bottom:

1. **Preset:** a selector of every [Campaign configuration preset](../../foundation/game-data-records.md#glossary) the [Game build](../../foundation/core-concepts.md#game-build-and-content) supplies, marking the [Game build
   default preset](../../foundation/configuration.md#glossary) and each preset that has [Preset edits](../../foundation/configuration.md#glossary). Choosing a preset selects it.
2. **Preset edits:** one field for each [Campaign configuration](../../foundation/campaign-state.md#glossary) value of the selected preset, labelled with the value's
   name, showing the preset's own value as its placeholder and its Preset edit, if any, as its content. Entering a
   value sets a Preset edit, and emptying the field removes it. A value the engine rejects changes nothing, and the
   field shows the reason the engine reports.
3. **Seed:** an optional [Campaign seed](../../foundation/determinism-and-randomness.md#glossary). When it is left empty, campaign creation receives none and the engine chooses
   one, under [Campaign seed](../../foundation/determinism-and-randomness.md#campaign-seed) in Determinism and Randomness.
4. **Start Campaign:** the primary button, which creates the Campaign with `session.campaign.create(options)` and
   shows the Campaign screen.

# Layout

The layout puts what the Player most often wants, the Campaign saves, in the wider column, and the rarer actions beside
it. Everything the Main menu offers is on it at once: resuming, loading, and deleting Campaign saves, creating a
Campaign, and the [Global configuration](../../foundation/engine-contract.md#persisted-data) settings, so that none waits one step away.

- The Campaign saves fill the left column, one card per Campaign, under
  [Panels and cards](../visual-design.md#panels-and-cards) in Visual Design. The card of the Campaign of the most recent
  Campaign save has the Accent top edge.
- A card's header shows the Campaign and its latest [Turn](../../foundation/engine-contract.md#player-actions-and-turns), with Resume and Delete campaign at its right edge. Resume
  returns the Player to the Campaign where they left it, by loading its [Current Autosave](../../foundation/saves.md#autosave-kinds), or its most recent Campaign
  save when it has none. Resume is the primary button on the card with the Accent top edge and a neutral button on the
  others, so that going back to the Campaign just left from the Campaign screen takes one click.
- When the Player reached the Main menu by leaving a Campaign from the Campaign screen, a close control sits at the
  upper right corner of the Main menu's content, the rectangle that holds its title and its two columns, under
  [Close controls](../visual-design.md#close-controls) in Visual Design, so that it sits where the Player is looking
  rather than at the far corner of a wide window. It and the Escape key do what Resume does for that Campaign, so the
  Main menu closes like any view opened over play. A Main menu reached otherwise, e.g. when the game starts, has no
  close control.
- Each Campaign save of the Campaign is one row of the card: its name, its [Turn](../../foundation/engine-contract.md#player-actions-and-turns) and its number of [Player actions](../../foundation/engine-contract.md#player-actions-and-turns) in
  that Turn in the Figure style, e.g. T13 A5, under [Listing Campaign saves](../../foundation/saves.md#listing-campaign-saves) in Saves, and Load and Delete
  in the last column. Load and Delete sit side by side in one row, right-aligned, under
  [Buttons](../visual-design.md#buttons) in Visual Design, so that the buttons of every row line up in the same two
  columns.
- The New Campaign and [Settings panels](../gui.md#glossary) are stacked in the right column.
- The Settings panel, under [Settings panel](../gui.md#settings-panel) in the Graphical User Interface, opens with
  the [Music control](../music.md#music-control), labelled Music, above its rows, so that the music can be silenced or
  turned down before a Campaign is chosen.

# Artboard

![Main menu screen Artboard: Campaign saves grouped by Campaign on the left, with Load and Delete side by side on each save and Delete campaign in each Campaign header; New Campaign and Settings panels on the right](../../../../images/artboards/main-menu.png)

The following appear only on the [Artboard](../visual-design.md#glossary) and must not be implemented, under
[Reading Artboards](../visual-design.md#reading-artboards) in Visual Design:

- The sample values, e.g. the Campaign IDs, T16 A3, the Track title GEO-4, the Music volume 50, the preset `standard`,
  and its values 500 and 20.
