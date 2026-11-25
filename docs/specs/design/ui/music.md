# Music

| Metadata | Value |
| --- | --- |
| Spec ID | MUSIC |
| Family | UI |
| Audience | UI designer, Implementer |
| Owns | The music of the graphical user interface: the Soundtrack, how it is played, its settings, and the Music control. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

The GUI plays quiet background music under every screen, so that watching the Earth from the command console feels like a covert operation under way. The music is meant to be heard and then forgotten: it plays the Tracks of the Soundtrack in a random order, each fading in and out smoothly, and never stops or restarts because the Player changes screen. The Player can turn it off or skip to the next Track at any time, from the Main menu and from the Campaign screen, can always see which Track is playing, and sets its volume in the Settings panel.

The music belongs to the [Graphical User Interface](gui.md) alone. It reads no game state, changes no [Campaign state](../foundation/core-concepts.md#campaign-and-session), and draws no random outcome of a [Campaign](../foundation/core-concepts.md#campaign-and-session); the [Command-Line Interface](cli.md) plays no music. Its settings are part of [Global configuration](../foundation/engine-contract.md#persisted-data), so a choice the Player makes once applies in every later [Session](../foundation/core-concepts.md#campaign-and-session).

# Glossary

| Term | Definition |
| --- | --- |
| Soundtrack | The music that the [Game build](../foundation/core-concepts.md#game-build-and-content) supplies for the GUI to play, as a set of Tracks. |
| Track | One piece of music of the Soundtrack, supplied as one audio file. |
| Track title | The name by which the GUI shows a Track, [derived from the name of its file](#soundtrack). |
| Music on | The [Global configuration](../foundation/engine-contract.md#persisted-data) [setting](#music-settings) that says whether the GUI plays music. |
| Music volume | The Global configuration [setting](#music-settings) that says how loud the GUI plays music. |
| Music control | The [control](#music-control) through which the Player sets Music on and skips the current Track, and which shows its Track title. |
| Current Track | The Track that is [playing](#playback), or that is paused because Music on is false. |

# Soundtrack

The Soundtrack is authored as audio files, so that a composer adds a Track by adding a file and nothing else. Each Track is one audio file directly in the `assets/music/tracks/` directory at the repository root, in one of the following formats:

- Ogg Opus, with the extension `.opus`, the preferred format because it is the smallest at the same quality.
- MP3, with the extension `.mp3`, for music whose source cannot export Ogg Opus.

The Soundtrack is every such file, and the Game build supplies every Track unchanged, in its own format. A file the Game designer does not want played is removed from the directory, e.g. a Track rejected after review.

The Track title is the file name without its extension, unchanged, so that the title the Player sees is the name of the file that holds the Track. E.g., the file `GEO-4.opus` is the Track titled "GEO-4". No two Tracks have the same Track title.

# Music settings

The Player decides whether music plays and how loud it is, and the choice should survive the end of a [Session](../foundation/core-concepts.md#campaign-and-session), so both are settings of [Global configuration](../foundation/configuration.md#global-configuration).

| Setting      | Permitted values                         | Game build default |
| ------------ | ---------------------------------------- | ------------------ |
| Music on     | `true` or `false`                        | `true`             |
| Music volume | A whole number from 0 to 100, inclusive. | 50                 |

Music on and Music volume are independent: turning music off keeps the Music volume, and setting the Music volume while music is off stores it for when music is turned on.

## Loudness

The loudness of the music follows the Player's ear rather than the number on the slider, so that the lower half of the slider is as useful as the upper half. The gain applied to the Current Track, a factor of the amplitude at which the Track was authored, is:

```text
gain = f × (Music volume / 100)²
```

Here f is the [fade factor](#fades). E.g., with a Music volume of 50 and no fade under way, the gain is 1 × 0.5² = 0.25.

# Playback

The GUI plays music from the moment it opens until the Session ends, whichever screen it shows, so that the music is one continuous background rather than a sound tied to a screen.

- **Start:** When the GUI opens and Music on is `true`, it starts the first Track of the playing order. When the platform withholds sound until the Player first interacts with the GUI, e.g. a web browser that blocks sound until the first click or key press, the first Track starts at that first interaction instead, from its beginning.
- **Continuity:** Changing screen, opening or closing a [Detail view](gui.md#glossary), and creating, loading, or closing a [Campaign](../foundation/core-concepts.md#campaign-and-session) neither restart nor interrupt the Current Track. Neither does an [Autopilot engagement](../foundation/engine-contract.md#autopilot).
- **Next Track:** When the Current Track ends, the next Track of the playing order starts at once from its beginning and becomes the Current Track.
- **Skip:** When the Player selects the Skip button, the Current Track [fades out](#fades), and when the fade ends the Current Track ends, so the next Track of the playing order starts. A skipped Track counts as played in its round.
- **Music off:** When Music on becomes `false`, the Current Track fades out and then pauses at the point it reached.
- **Music on:** When Music on becomes `true`, the paused Current Track resumes from the point at which it paused and fades in. When no Track has started yet in the Session, the first Track of the playing order starts instead.
- **Volume:** A change of Music volume changes the [gain](#loudness) at once, also during a fade, and never restarts or pauses the Current Track. A Music volume of 0 with Music on `true` keeps the Tracks playing silently, so the playing order goes on.
- **Unplayable Track:** A Track whose file cannot be loaded or decoded is skipped as if it had ended at once. When every Track of a round fails, the GUI plays no more music in the Session, and the Track title reads nothing. Music is never worth interrupting play for, so no failure of it shows an error to the Player.

## Playing order

The Player should hear every Track before hearing any Track again, and should not hear the same Track twice in a row, so the Tracks are played in rounds.

- **Rounds:** Each round plays every Track of the Soundtrack exactly once, in an order drawn uniformly at random from all the orders the next rule permits. The first round starts when the first Track of the Session starts, and each round starts when the previous one ends.
- **No repeat across rounds:** When the Soundtrack has two or more Tracks, the first Track of a round is never the last Track of the round before it.

The order of each round is one random outcome, the round order. It is drawn from a source of randomness that belongs to the GUI and differs between Sessions, never from the [random outcomes](../foundation/determinism-and-randomness.md#random-outcomes) of a Campaign.

## Fades

A Track should never start or stop abruptly, so the fade factor f of [Loudness](#loudness) rises and falls linearly with time.

| Moment                                      | Change of f                                        | Duration  |
| ------------------------------------------- | -------------------------------------------------- | --------- |
| A Track starts from its beginning           | From 0 to 1                                        | 3 seconds |
| A Track reaches its last 3 seconds          | From 1 to 0, ending when the Track ends            | 3 seconds |
| Music on becomes `false`                    | From its current value to 0, then the Track pauses | 1 second  |
| The Player skips the Track                  | From its current value to 0, then the Track ends   | 1 second  |
| Music on becomes `true` and a Track resumes | From 0 to 1                                        | 1 second  |

Outside these fades, f is 1. When a fade starts while another is under way, the new fade starts from the current value of f, and its duration shrinks in proportion to the distance left; e.g., turning music off when f is 0.5 fades from 0.5 to 0 in 0.5 seconds.

# Music control

The Player should be able to silence the music or skip a Track without leaving what they are doing, and to find out what is playing. The Music control does all of these, and it appears in two places: above the [Settings panel](gui.md#glossary) of the [Main Menu](screens/main-menu.md), and in the footer of the [Side panel](gui.md#glossary) of the [Campaign Screen](screens/campaign-screen.md), so it is always one click away. Setting the volume is rarer, so the [Music volume slider](#music-volume-slider) sits in the Settings panel instead.

The Music control holds these parts, in one row from left to right on the Main Menu, and [on two lines in the Side panel](#music-control-in-the-side-panel):

1. **Music toggle:** a neutral button showing a speaker, struck through while Music on is `false`. Selecting it sets Music on to the opposite value. Its accessible name is "Music on" or "Music off", after the state it shows.
2. **Skip button:** a neutral button showing "⏭", with the accessible name "Next Track". Selecting it [skips the Current Track](#playback). It is disabled while Music on is `false` and before the first Track starts.
3. **Track title:** the Track title of the Current Track, after a music note, e.g. "♪ GEO-4", in 13 px Body and Text secondary. While Music on is `false` it reads "Music off" in Text muted instead, and before the first Track starts it reads nothing. A title too long for the space ends in an ellipsis, and the whole title shows on hover.

## Music control in the Side panel

The Side panel is narrow, and a Track title beside two buttons would be cut to a few letters, so there the Track title takes a line of its own, with the Music toggle and the Skip button in a row under it. The Player who wants that room for the [Situation panel](screens/situation-panel.md) collapses the Music control to its Track title:

- **Collapse button:** a small neutral button at the right end of the Track title's line, showing "▾", with the accessible name "Collapse the Music control". Selecting it hides the row of the Music toggle and the Skip button, and the button then shows "▴", with the accessible name "Expand the Music control", and brings the row back.
- **Kept across Sessions:** whether the Music control is collapsed is the [Global configuration](../foundation/configuration.md#global-configuration) setting Music control collapsed, off by default, so it stays as the Player last left it whatever Campaign is loaded and in every later [Session](../foundation/core-concepts.md#campaign-and-session). Collapsing it changes neither Music on nor what plays.

# Music volume slider

The Music volume slider is the row of the [Settings panel](gui.md#settings-panel) through which the Player sets the Music volume. It is labelled Music volume and holds a horizontal [slider](visual-design.md#sliders) from 0 to 100 in steps of 1, showing the Music volume, followed by the Music volume in the Figure style. While the Player drags it, the [gain](#loudness) follows the slider at once; the Music volume is set when the Player releases it, so that dragging stores one value rather than one for each step. The slider stays enabled while Music on is `false`.
