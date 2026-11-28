# Tutorials

| Metadata | Value |
| --- | --- |
| Spec ID | TUTOR |
| Family | UI |
| Audience | Content designer, UI designer, Implementer |
| Owns | How the graphical user interface teaches the Player: the Tutorials settings, the Tutorial intro, the Tutorial bubbles and the TutorialBubble GDRs, Tutorial progress, and when a Tutorial bubble disappears. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

The Player learns the game by playing it, so the GUI teaches only when the Player asks and never stops play to do it. It teaches in two steps. Before the first Turn, a short Tutorial intro names what the Agency does and where to learn more. After that, each screen carries a few Tutorial bubbles, each beside one thing a new Player may not understand, and the Player selects one to read a few sentences about it. A bubble pulses until the Player has opened it, then stays dim for a few Turns so that the Player can read it again, and then disappears, so that a screen the Player has learned is left clean. What a bubble said stays in the [Compendium View](screens/compendium-view.md), and the [Compendium](../mechanics/compendium.md) holds the depth.

Tutorials belong to the [Graphical User Interface](gui.md) alone. They change no [Campaign state](../foundation/core-concepts.md#campaign-and-session), so a [Campaign](../foundation/core-concepts.md#campaign-and-session) plays the same with them or without them. What the Player has been taught belongs to the Player rather than to a Campaign, so it is kept in [Global configuration](../foundation/configuration.md#global-configuration): a bubble opened in one Campaign stays opened in the next, and loading, undo, and other [Timeline](../foundation/timeline.md) navigation never bring one back.

# Glossary

| Term | Definition |
| --- | --- |
| Tutorial intro | The [Special event](screens/turn-summary.md#glossary) of `tutorial_intro`, which the GUI shows after the welcome of a new [Campaign](../foundation/core-concepts.md#campaign-and-session) while Tutorials on is true. |
| Tutorial bubble | A golden "?" beside one part of a screen, which the Player selects to read a short explanation of that part in its Tutorial note. |
| Tutorial note | The small popup that a Tutorial bubble opens, holding its explanation. |
| Tutorial anchor | The name of a part of a screen that a Tutorial bubble stands beside, e.g. `agents_view.exhaustion_column`. |
| Player Turn count | How many Advance turns the Player has requested through the GUI, in every Campaign together. |
| Tutorial progress | Which Tutorial bubbles the Player has opened, each with the Player Turn count when it was first opened. |

# Tutorials settings

Whether the game teaches the Player is the Player's choice, made once and kept for every later Campaign, and so is how long a bubble stays once read, so both are settings of [Global configuration](../foundation/configuration.md#global-configuration). Tutorial progress and the Player Turn count are kept there too, as values the GUI records rather than settings the Player sets.

| Value | Permitted values | Game build default | Set by |
| --- | --- | --- | --- |
| Tutorials on | `true` or `false` | `true` | The Tutorials checkbox of the `campaign_start` [Special event](screens/turn-summary.md#special-events) and the "Tutorials enabled" checkbox of the [Settings panel](gui.md#settings-panel), which show the same value. |
| Tutorial bubble lifetime | A whole number from 1 to 100, inclusive. | 3 | Its row among the other settings of the [Settings panel](gui.md#glossary). |
| Player Turn count | A whole number of at least 0. | 0 | The GUI, which adds 1 when an Advance turn the Player requested is committed. |
| Tutorial progress | A set of TutorialBubble identifiers, each with a whole number. | Empty | The GUI, when the Player [opens a Tutorial bubble](#tutorial-notes), and the "Reset tutorials" button of the Settings panel, which empties it. |

The Player Turn count counts the Advance turns the Player requested, not the [Turns](../foundation/engine-contract.md#player-actions-and-turns) of a Campaign, so it never decreases: undo, loading a [Campaign save](../foundation/engine-contract.md#persisted-data), and starting a new Campaign leave it as it is. An Advance turn that [Autopilot](../foundation/engine-contract.md#autopilot) requested does not count, because the Player was not watching it.

While Tutorials on is `false`, the GUI shows no Tutorial bubble and skips the Tutorial intro, and nothing else changes. Turning it on again brings back every bubble that has not disappeared.

Tutorial progress and the Player Turn count are [left out of the list of changed settings](gui.md#changed-settings), since the Player does not set them; the "Reset tutorials" button is the Player's way to start over, and it leaves the Player Turn count as it is.

# Tutorial intro

The Tutorial intro gives the Player the shape of the game in one page before the first Turn, so that the Player knows what to do first and where every later answer is. It is the Special event of the trigger `tutorial_intro`, shown in the dialog of the [Turn summary](screens/turn-summary.md#glossary) as soon as the Player closes the Special event of `campaign_start`, while Tutorials on is `true`, so that a Player who clears the Tutorial checkbox of the welcome never sees it. Like the welcome, it is shown on its own once for a Campaign, and the [Turn summary button](screens/turn-report-view.md#turn-summary-button) of the Turn Report View replays it right after the welcome while the Campaign has no [Turn report](../foundation/campaign-state.md#glossary) yet and Tutorials on is `true`.

It is drawn as the Special event of `campaign_start` is, with these differences, so that teaching reads apart from story:

- **Colour:** Tutorial gold takes the place of Special, in the placeholder of its [Event art](screens/turn-summary.md#glossary) and its glyph, a "?" in a circle, and a 2 px line of Tutorial gold runs along the dialog's top edge.
- **Text:** the eyebrow "Tutorial" in Tutorial gold, then its `title`, then its `text` as a sub line, all aligned to the left at the top of the Event art rather than centred.
- **Points:** its `points` below the text, in two columns, read along each row, so that the page never scrolls. Each point shows its icon, a line drawing in Tutorial gold, beside its `heading` and, under the heading, its `text`.
- **Bubble point:** the point whose icon is `bubble` shows a live Tutorial bubble right after its heading, the bubble of the anchor `tutorial_intro.bubble`, so that the Player sees and tries the thing the point describes rather than a picture of it.
- **Control row:** only "Continue", the primary button, centred, with no Tutorial checkbox. It, the Enter key, and the Escape key close the dialog.

# Tutorial bubbles

A Tutorial bubble offers help where the question arises without taking the Player's attention from play, so it is small, it pulses only until it has been read, and it opens nothing until the Player selects it.

## TutorialBubble

Each Tutorial bubble is one [GDR](../foundation/core-concepts.md#game-build-and-content) of [Type](../foundation/core-concepts.md#data-modeling) TutorialBubble, which serves the Display content purpose. A [Game build](../foundation/core-concepts.md#game-build-and-content) may supply any number of them, including none, and the Content designer writes and places them without a change to any rule or screen.

| Property | Meaning |
| --- | --- |
| `anchor` | The Tutorial anchor the bubble stands beside, one of those [the GUI offers](#tutorial-anchors). No two TutorialBubble GDRs have the same anchor. |
| `title` | The heading of its Tutorial note, e.g. "Exhaustion". |
| `text` | Its explanation, two or three sentences, as templated text whose [Placeholders](../mechanics/compendium.md#placeholders) are resolved as in a Compendium article, so that it states no value of the game itself. |
| `article` | Optional: the identifier of the [Compendium article](../mechanics/compendium.md#glossary) its Tutorial note links to for more. |
| `visible_when` | Optional: a [Condition](../foundation/conditions.md) that must hold for the bubble to be shown, with the same [Condition kinds](../foundation/conditions.md#glossary) as the `visible_when` of a [CompendiumArticle](../mechanics/compendium.md#compendiumarticle), so that a bubble about something the Player cannot use yet stays hidden, e.g. a bubble about Contracting until Contracting is unlocked. |

## Tutorial anchors

The GUI names the parts of its screens that a bubble may stand beside, so that game data places a bubble by name and a screen that changes its layout keeps its bubbles. Each screen offers at most four anchors, so that its bubbles stay few enough to notice and none is beside something self-evident.

| Tutorial anchor | It stands beside |
| --- | --- |
| `tutorial_intro.bubble` | The heading of the bubble point of the [Tutorial intro](#tutorial-intro). |
| `campaign_screen.panic` | The [Panic](../mechanics/domain-model.md#campaign-standing) value of the [status bar](screens/campaign-screen.md#regions). |
| `campaign_screen.advance_turn` | The Advance turn button of the status bar. |
| `campaign_screen.operations` | The Operations group heading of the [Navigation](screens/campaign-screen.md#navigation) of the [Side panel](gui.md#glossary). |
| `campaign_screen.situation` | The heading of the [Situation panel](screens/situation-panel.md). |
| `agents_view.hire` | The Hire button of the [Agents View](screens/agents-view.md). |
| `agents_view.assign_to` | The Assign to controls of the Agents View. |
| `agents_view.equip` | The Equip button of the Agents View. |
| `agents_view.exhaustion_column` | The heading of the [Exhaustion](../mechanics/agents-spec.md#combatant-attributes) column of the [Agent](../mechanics/domain-model.md#agency-and-agents) table of the Agents View. |

An `anchor` that names no anchor of this table is a [data defect](../foundation/game-data-records.md#data-defects).

## Showing a bubble

A bubble is shown beside its anchor, while that part of the screen is shown, exactly when Tutorials on is `true`, its `visible_when`, if any, holds in the [Current world state](../foundation/core-concepts.md#campaign-and-session), and it has not disappeared. It disappears once the Player Turn count is at least its count in Tutorial progress plus the Tutorial bubble lifetime, i.e. after that many Advance turns the Player requested since first opening it, so that the Player can read it again while learning and the screen is clean once the Player has learned it. A bubble never opened never disappears.

A bubble is a "?" in Tutorial gold, in a circle 24 px across with a 1.5 px rim of Tutorial gold over a Control backdrop fill, standing just outside the top right corner of what its anchor names, so that it covers no value or label. It has three looks:

- **New,** until it is in Tutorial progress: a ring of Tutorial gold spreads out of its rim and fades, every 1.8 s, so that the eye finds it.
- **Seen,** once it is in Tutorial progress: still, with its rim and "?" at 45% opacity.
- **Hovered or focused:** full Tutorial gold, with a ring of Tutorial gold at 30% opacity 3 px around it.

While the Player asks for reduced motion, a new bubble does not pulse and shows instead a still second ring 5 px outside its rim, so that it stays apart from a seen one. A bubble is a button: the Tab key reaches it, and its accessible name is "Tutorial: " followed by its `title`.

## Tutorial notes

Selecting a bubble, or pressing Enter on it, opens its Tutorial note and, when it is not yet in Tutorial progress, adds it there with the current Player Turn count. The note is a panel 320 px wide in the Raised fill, with a 2 px top edge of Tutorial gold and a small arrow that points at its bubble, placed beside the bubble where it fits on the screen. From top to bottom it holds:

1. **Header row:** the eyebrow "Tutorial" in Tutorial gold after a small "?" in a circle, then, in Text muted, when the bubble will disappear, i.e. "Disappears in N Turns", where N is how many of the Player's Advance turns remain, or "Disappears after this Turn" when one remains, then a [close control](visual-design.md#close-controls) at the right end.
2. **Title:** its `title`.
3. **Text:** its resolved `text`.
4. **Compendium link,** when it has an `article`: "<displayed title> in the Compendium ›", which opens that article in the Compendium View, so that the note stays short and the Compendium holds the depth.

A Tutorial note never blocks play: the rest of the screen stays usable while it is open, and only one is open at a time, so opening another closes it. It closes on its close control, the Escape key, selecting its bubble again, or a click anywhere outside it, and when its anchor is no longer shown, e.g. because a Detail view covers it.

## Tutorials in the Compendium

The Compendium keeps every lesson of the bubbles, so that nothing the GUI teaches is lost when a bubble disappears and a Player who turned tutorials off can still read them. The Tutorials section of the Guide category of the [Compendium View](screens/compendium-view.md#article-sections) lists every Tutorial bubble whose `visible_when`, if any, holds in the [Current world state](../foundation/engine-contract.md#player-actions-and-turns), whether or not it has been opened or has disappeared, and whatever Tutorials on is. Each is listed under its `title` and shown as a [Guide article](../mechanics/compendium.md#glossary) is, with its resolved `text` as its body and, when it has an `article`, that article as its only See also entry. While [Reveal hidden content](gui.md#reveal-hidden-content) is on, it lists every bubble.

# TODOs

- TODO (later): Tutorial bubbles for the [Detail views](gui.md#glossary) other than the Agents View.
