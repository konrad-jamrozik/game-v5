# Sounds

| Metadata    | Value                                                                                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | SOUNDS                                                                                                                                                                     |
| Family      | UI                                                                                                                                                                         |
| Audience    | UI designer, Implementer                                                                                                                                                   |
| Owns        | The short sounds the graphical user interface plays in answer to the Player: the Sound set, when each Sound plays, and its settings.                                       |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

The GUI answers the Player's clicks with short sounds, so that the command console feels like a responsive instrument
and the Player hears that an order was taken without looking for its effect. Each Sound has one meaning: one Sound
answers a Main click, which does something, another answers a Go back, which leaves or cancels something, and a third
announces that an Advance turn brought news worth a Turn summary. Changing a selection makes no sound.

Sounds belong to the [Graphical User Interface](gui.md) alone, like the [Music](music.md) they play over. They read no
game state beyond what the GUI already shows, change no [Campaign state](../foundation/core-concepts.md#campaign-and-session),
and draw no random outcome of a [Campaign](../foundation/core-concepts.md#campaign-and-session); the
[Command-Line Interface](cli.md) plays no sounds. Their two settings are part of
[Global configuration](../foundation/engine-contract.md#persisted-data), so a choice the Player makes once applies in
every later [Session](../foundation/core-concepts.md#campaign-and-session).

# Glossary

| Term          | Definition                                                                                                                                                                   |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sound         | One short sound that the GUI plays in answer to the Player, supplied as one audio file and named by its Sound name, under [Sound set](#sound-set).                           |
| Sound name    | The name of a Sound, which is the name of its file without the extension, e.g. `main-click`.                                                                                 |
| Sound set     | The Sounds that the [Game build](../foundation/core-concepts.md#game-build-and-content) supplies for the GUI to play, under [Sound set](#sound-set).                         |
| Main click    | A Player input that does something, e.g. opens a Detail view, advances the Turn, or hires Agents, under [Main click](#main-click).                                           |
| Go back       | A Player input that leaves what the Player is looking at or cancels what they were about to do, without doing anything else, e.g. the Escape key, under [Go back](#go-back). |
| Sounds on     | The [Global configuration](../foundation/engine-contract.md#persisted-data) setting that says whether the GUI plays Sounds, under [Sound settings](#sound-settings).         |
| Sounds volume | The Global configuration setting that says how loud the GUI plays Sounds, under [Sound settings](#sound-settings).                                                           |

# Sound set

The Sound set is authored as audio files, so that a sound designer replaces a Sound by replacing its file and nothing
else. Each Sound is one audio file directly in the `assets/sounds/` directory at the repository root, in one of the
following formats; the list is complete:

- WAV, with the extension `.wav`, the format in which the Sounds are authored.
- Ogg Opus, with the extension `.opus`.
- MP3, with the extension `.mp3`.

The Game build supplies every Sound unchanged, in its own format. No two files of the directory have the same Sound
name, and any other file in the directory, e.g. a README, is not a Sound.

The GUI plays the following Sounds, each at the moments the linked section states; the table is complete. A file of
the directory whose Sound name is not in the table is not played.

| Sound name                 | Plays                                                                                                                         |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `main-click`               | On every Main click, under [Main click](#main-click).                                                                         |
| `go-back-click`            | On every Go back, under [Go back](#go-back).                                                                                  |
| `interesting-turn-summary` | When the [Turn summary](screens/turn-summary.md#glossary) appears after an Advance turn, under [Turn summary](#turn-summary). |

# When Sounds play

Every Sound answers one input of the Player, so the Player hears a Sound only for what they did, never for what the
game does on its own, e.g. an [Advance turn](../foundation/engine-contract.md#player-actions-and-turns) that
[Autopilot](../foundation/engine-contract.md#autopilot) requests plays no Sound. The Player's inputs fall into three
kinds: a Main click, a Go back, and every other input, which plays no Sound. A key that does what a button does, e.g. a
keyboard shortcut, plays the Sound that the button plays.

## Main click

A Main click is the Player selecting a button that does something: it opens a view or a dialog, asks the engine for a
[Player action](../foundation/engine-contract.md#player-actions-and-turns), confirms a choice, or starts, loads, or
saves a [Campaign](../foundation/core-concepts.md#campaign-and-session). E.g., each of these is a Main click: opening a
Detail view from the [Side panel](gui.md#glossary), Advance turn, Hire, assigning Agents, deploying Agents, confirming
a deployment under [Warning on deploying tired Agents](gui.md#warning-on-deploying-tired-agents), Load on a Campaign
save, and opening the Turn Report View from the Turn summary. The GUI plays `main-click` when the Player selects the
button, before the engine answers, so the Sound does not wait for a long Player action.

The following inputs are not Main clicks and play no Sound, because they only choose what a later Main click acts on
or change how something is shown; the list is complete:

- Selecting or clearing an item, e.g. checking the selection checkbox of an Agent, selecting rows of a table by
  pressing or dragging, or checking Select all.
- Changing a toggle, filter, sort, or tab, e.g. the Allow re-assigning checkbox of the
  [Agents View](screens/agents-view.md) or the Music toggle of the [Music control](music.md#music-control).
- Dragging a slider, typing text, hovering, and scrolling.
- A Go back, which plays its own Sound.

## Go back

A Go back is the Player leaving what they are looking at, or cancelling what they were about to do, without doing
anything else. It is either the Escape key, when it closes or cancels something, or a control that does what the
Escape key does at that moment, e.g. the close control of a Detail view or the close button of the
[Main menu](screens/main-menu.md). The GUI plays `go-back-click` on every Go back. E.g., each of these is a Go back:
closing the open Detail view, which shows the globe again; closing the Main menu, which returns to the Campaign; and
cancelling a deployment of Agents before it is confirmed, e.g. dismissing the warning under
[Warning on deploying tired Agents](gui.md#warning-on-deploying-tired-agents) without deploying.

The Escape key when there is nothing to close or cancel, e.g. while the Campaign screen shows the globe with no dialog
open, is not a Go back and plays no Sound.

## Turn summary

When an Advance turn that the Player requested brings news that the Player must know, the GUI shows the
[Turn summary](screens/turn-summary.md#glossary) under [Groups](screens/turn-summary.md#groups) in Turn Summary, and
announces it with a Sound of its own, so that the news is heard before it is read. The Player's Advance turn is a Main
click, so `main-click` plays first. When the Turn summary appears, `interesting-turn-summary` plays, starting no sooner
than `main-click` ends, so the two are heard one after the other and never over each other. An Advance turn that shows
no Turn summary plays only `main-click`.

Reopening the Turn summary from the [Turn Report View](screens/turn-report-view.md) is a Main click and plays only
`main-click`, because it brings no news.

# Sound settings

The Player decides whether Sounds play and how loud they are, and the choice should survive the end of a
[Session](../foundation/core-concepts.md#campaign-and-session), so both are settings of Global configuration, read and
changed through `session.globalConfiguration` under [Global configuration](../foundation/configuration.md#global-configuration)
in Configuration. The following table is complete for Sounds.

| Setting       | Permitted values                         | Game build default |
| ------------- | ---------------------------------------- | ------------------ |
| Sounds on     | `true` or `false`                        | `true`             |
| Sounds volume | A whole number from 0 to 100, inclusive. | 50                 |

The two settings are independent of Music on and Music volume under [Music settings](music.md#music-settings), so the
Player can silence the music and keep the Sounds, or the reverse. Each has a row of its own in the Settings panel of
the [Main Menu](screens/main-menu.md).

While Sounds on is `false`, the GUI plays no Sound. Otherwise it plays each Sound at the gain

gain = (v / 100)²

where v is the Sounds volume, a factor of the amplitude at which the Sound was authored, so that the Sounds volume
follows the Player's ear as the Music volume does under [Loudness](music.md#loudness) in Music. No rounding occurs. E.g.,
with a Sounds volume of 50, the gain is 0.5² = 0.25.

# Playing a Sound

A Sound plays once, from its beginning to its end, without a fade. It plays over the music, which neither pauses nor
changes its gain, and over any Sound already playing, apart from the order under [Turn summary](#turn-summary). Changing
screen, opening or closing a [Detail view](gui.md#glossary), and a Go back do not stop a Sound that is playing. A change of Sounds on or
Sounds volume applies to the Sounds that start after it.

# Edge cases and failure behavior

A Sound is never worth interrupting play for, so every failure of it is silent.

- **Missing Sound:** A Game build without the file of a Sound in the table under [Sound set](#sound-set) plays nothing
  at the moments that Sound would play, and every other Sound plays as usual.
- **Sound that cannot be played:** A Sound whose file cannot be loaded or decoded plays nothing, and no error is shown
  to the Player.
- **Blocked sound:** When the platform withholds sound until the Player first interacts with the GUI, e.g. a web
  browser that blocks sound until the first click or key press, a Sound withheld by it is not played later.
- **Invalid stored value:** A stored Sounds on or Sounds volume that is not permitted follows the
  [Game build default](../foundation/engine-contract.md#persisted-data), under
  [Edge cases and failure behavior](../foundation/configuration.md#edge-cases-and-failure-behavior) in Configuration.

# Acceptance examples

These examples use the Sound set of `main-click.wav`, `go-back-click.wav`, and `interesting-turn-summary.wav`, with
Sounds on `true` and the Sounds volume 50.

- **Opening and closing a Detail view:** The Player selects Agents in the Side panel: `main-click` plays at a gain of
  0.25 and the Agents View opens. The Player presses Escape: `go-back-click` plays and the globe shows again. The
  Player presses Escape again: nothing is open, so no Sound plays ([Main click](#main-click), [Go back](#go-back)).
- **Selecting is silent:** In the Agents View the Player checks the selection checkboxes of three Agents and then
  clears one: no Sound plays. The Player then selects Hire: `main-click` plays ([Main click](#main-click)).
- **Cancelled deployment:** The Player selects a team with an Agent of exhaustion 25 and selects Deploy: `main-click`
  plays and the warning appears. The Player presses Escape: `go-back-click` plays, the warning closes, and no Agent is
  deployed ([Go back](#go-back)).
- **Advance turn with news:** The Player selects Advance turn and the Advance turn wins a Mission: `main-click` plays,
  and when the Turn summary appears, `interesting-turn-summary` plays after `main-click` ends. The Player selects
  Advance turn again and that Advance turn does nothing listed under [Groups](screens/turn-summary.md#groups): only
  `main-click` plays ([Turn summary](#turn-summary)).
- **Reopened Turn summary:** In the Turn Report View the Player reopens the Turn summary: only `main-click` plays
  ([Turn summary](#turn-summary)).
- **Autopilot:** During an Autopilot engagement, ten Advance turns are committed and none of them plays a Sound
  ([When Sounds play](#when-sounds-play)).
- **Sounds off, music on:** The Player sets Sounds on to `false` in the Settings panel. The music plays on, and opening
  a Detail view plays no Sound ([Sound settings](#sound-settings)).
- **Missing file:** A Game build without `go-back-click.wav` closes a Detail view on Escape in silence, and
  `main-click` still plays on every Main click ([Edge cases and failure behavior](#edge-cases-and-failure-behavior)).
