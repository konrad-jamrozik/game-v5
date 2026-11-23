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

The music belongs to the [Graphical User Interface](gui.md) alone. It reads no game state, changes no [Campaign state](../foundation/core-concepts.md#campaign-and-session), and draws no random outcome of a [Campaign](../foundation/core-concepts.md#campaign-and-session); the [Command-Line Interface](cli.md) plays no music. Its two settings are part of [Global configuration](../foundation/engine-contract.md#persisted-data), so a choice the Player makes once applies in every later [Session](../foundation/core-concepts.md#campaign-and-session).

# Glossary

| Term | Definition |
| --- | --- |
| Soundtrack | The music that the [Game build](../foundation/core-concepts.md#game-build-and-content) supplies for the GUI to play, as a set of Tracks. |
| Track | One piece of music of the Soundtrack, supplied as one audio file. |
| Track title | The name by which the GUI shows a Track, derived from the name of its file under [Soundtrack](#soundtrack). |
| Music on | The [Global configuration](../foundation/engine-contract.md#persisted-data) setting that says whether the GUI plays music, under [Music settings](#music-settings). |
| Music volume | The Global configuration setting that says how loud the GUI plays music, under [Music settings](#music-settings). |
| Music control | The control through which the Player sets Music on and skips the current Track, and which shows its Track title, under [Music control](#music-control). |
| Current Track | The Track that is playing, or that is paused because Music on is false, under [Playback](#playback). |

# Soundtrack

The Soundtrack is authored as audio files, so that a composer adds a Track by adding a file and nothing else. Each Track is one audio file directly in the `assets/music/tracks/` directory at the repository root, in one of the following formats; the list is complete:

- Ogg Opus, with the extension `.opus`, the preferred format because it is the smallest at the same quality.
- MP3, with the extension `.mp3`, for music whose source cannot export Ogg Opus.

The Soundtrack is every such file except the excluded ones, and the Game build supplies every Track unchanged, in its own format. The directory holds nothing else: the README and the records of how each Track was made lie beside it, in `assets/music/`.

Which files are excluded is content rather than design, so it comes from the MusicParameters [GDR](../foundation/core-concepts.md#game-build-and-content) `music` in `content/music/music_parameters.yaml`: the Game designer excludes a file, e.g. one pending review, by naming it there without changing this specification. The GDR serves the Display content purpose and has this property; the list is exhaustive:

| Property | Meaning |
| --- | --- |
| `excluded_tracks` | The files that are not Tracks, each by its file name with its extension, e.g. `EL-M2.5 XCOM+Var X1.opus`. A file it names is never played. A name that matches no file in the directory is allowed, since the Game designer may keep an excluded file's audio elsewhere. |

The Track title is the file name without its extension, unchanged, so that the title the Player sees is the name of the file that holds the Track. E.g., the file `EL-M2.5 XCOM+Var+Bare+Slow B.opus` is the Track titled "EL-M2.5 XCOM+Var+Bare+Slow B". No two Tracks have the same Track title.

# Music settings

The Player decides whether music plays and how loud it is, and the choice should survive the end of a [Session](../foundation/core-concepts.md#campaign-and-session), so both are settings of Global configuration, read and changed through `session.globalConfiguration` under [Global configuration](../foundation/configuration.md#global-configuration) in Configuration. The following table is complete for music.

| Setting      | Permitted values                         | Game build default |
| ------------ | ---------------------------------------- | ------------------ |
| Music on     | `true` or `false`                        | `true`             |
| Music volume | A whole number from 0 to 100, inclusive. | 50                 |

Music volume is a percentage of the loudness at which the Track was authored. Music on and Music volume are independent: turning music off keeps the Music volume, and setting the Music volume while music is off stores it for when music is turned on.

## Loudness

The loudness of the music follows the Player's ear rather than the number on the slider, so that the lower half of the slider is as useful as the upper half. The gain applied to the Current Track, a factor of the amplitude at which the Track was authored, is:

gain = f × (v / 100)²

where v is the Music volume, a whole number from 0 to 100, and f is the fade factor, a number from 0 to 1 under [Fades](#fades). No rounding occurs, so the gain is a number from 0 to 1: 0 is silence, and 1 plays the Track as authored. E.g., with a Music volume of 50 and no fade under way, the gain is 1 × 0.5² = 0.25.

# Playback

The GUI plays music from the moment it opens until the Session ends, whichever screen it shows, so that the music is one continuous background rather than a sound tied to a screen. The following rules are complete:

- **Start:** When the GUI opens and Music on is `true`, it starts the first Track of the playing order. When the platform withholds sound until the Player first interacts with the GUI, e.g. a web browser that blocks sound until the first click or key press, the first Track starts at that first interaction instead, from its beginning.
- **Continuity:** Changing screen, opening or closing a [Detail view](gui.md#glossary), and creating, loading, or closing a [Campaign](../foundation/core-concepts.md#campaign-and-session) neither restart nor interrupt the Current Track. Neither does an [Autopilot engagement](../foundation/engine-contract.md#autopilot).
- **Next Track:** When the Current Track ends, the next Track of the playing order starts at once from its beginning and becomes the Current Track.
- **Skip:** When the Player selects the Skip button, the Current Track fades out under [Fades](#fades), and when the fade ends the Current Track ends, so the next Track of the playing order starts. Selecting the Skip button again during that fade ends the Current Track at once. When Music on becomes `false` during that fade, the Current Track ends at once and the next Track becomes the Current Track, paused at its beginning. A skipped Track counts as played in its round.
- **Music off:** When Music on becomes `false`, the Current Track fades out under [Fades](#fades) and then pauses at the point it reached.
- **Music on:** When Music on becomes `true`, the paused Current Track resumes from the point at which it paused and fades in. When no Track has started yet in the Session, the first Track of the playing order starts instead.
- **Volume:** A change of Music volume changes the gain under [Loudness](#loudness) at once, also during a fade, and never restarts or pauses the Current Track. A Music volume of 0 with Music on `true` keeps the Tracks playing silently, so the playing order goes on.

## Playing order

The Player should hear every Track before hearing any Track again, and should not hear the same Track twice in a row. The Tracks are therefore played in rounds, under these complete rules:

- **Rounds:** Each round plays every Track of the Soundtrack exactly once, in an order drawn uniformly at random from all the orders the next rule permits. The first round starts when the first Track of the Session starts, and each round starts when the previous one ends.
- **No repeat across rounds:** When the Soundtrack has two or more Tracks, the first Track of a round is never the last Track of the round before it.

The order of each round is one random outcome, the round order. It is drawn from a source of randomness that belongs to the GUI and differs between Sessions, never from the randomness of a Campaign, so playing music never changes what a Campaign draws under [Random outcomes](../foundation/determinism-and-randomness.md#random-outcomes).

## Fades

A Track should never start or stop abruptly. The fade factor f under [Loudness](#loudness) rises and falls linearly with time, under these complete rules:

| Moment                                      | Change of f                                        | Duration  |
| ------------------------------------------- | -------------------------------------------------- | --------- |
| A Track starts from its beginning           | From 0 to 1                                        | 3 seconds |
| A Track reaches its last 3 seconds          | From 1 to 0, ending when the Track ends            | 3 seconds |
| Music on becomes `false`                    | From its current value to 0, then the Track pauses | 1 second  |
| The Player skips the Track                  | From its current value to 0, then the Track ends   | 1 second  |
| Music on becomes `true` and a Track resumes | From 0 to 1                                        | 1 second  |

Outside these fades, f is 1. When a fade starts while another is under way, the new fade starts from the current value of f, and its duration shrinks in proportion to the distance left; e.g., turning music off when f is 0.5 fades from 0.5 to 0 in 0.5 seconds. A Track shorter than 6 seconds fades in over its first half and out over its second half.

# Music control

The Player should be able to silence the music or skip a Track without leaving what they are doing, and to find out what is playing. The Music control does all of these, and it appears in two places: above the [Settings panel](gui.md#glossary) of the [Main Menu](screens/main-menu.md), and in the footer of the [Side panel](gui.md#glossary) of the [Campaign Screen](screens/campaign-screen.md), so it is always one click away. Setting the volume is rarer, so the Music volume slider sits in the Settings panel instead, under [Music volume slider](#music-volume-slider). The Music control holds, in one row, from left to right:

1. **Music toggle:** a neutral button showing a speaker, struck through while Music on is `false`. Selecting it sets Music on to the opposite value through `session.globalConfiguration.set`. Its accessible name is "Music on" or "Music off", after the state it shows.
2. **Skip button:** a neutral button showing "⏭", with the accessible name "Next Track". Selecting it skips the Current Track under [Playback](#playback). It is disabled while Music on is `false` and before the first Track starts.
3. **Track title:** the Track title of the Current Track, after a music note, e.g. "♪ GEO-4", in the Caption style. While Music on is `false` it reads "Music off" in Muted text instead, and before the first Track starts it reads nothing. A title too long for the space ends in an ellipsis, and the whole title shows on hover.

The Music control is drawn with the [Design tokens](visual-design.md#glossary) and components of [Visual Design](visual-design.md). A setting that `session.globalConfiguration.set` rejects leaves the Music control showing the setting's previous value.

# Music volume slider

The Music volume slider is the row of the Settings panel, under [Settings panel](gui.md#settings-panel) in the Graphical User Interface, through which the Player sets the Music volume. It is labelled Music volume and holds a horizontal slider from 0 to 100 in steps of 1, under [Sliders](visual-design.md#sliders), showing the Music volume, followed by the Music volume in the Figure style. While the Player drags it, the gain follows the slider at once under [Loudness](#loudness); the Music volume is set through `session.globalConfiguration.set` when the Player releases it, so that dragging stores one value rather than one for each step. The slider stays enabled while Music on is `false`. A setting that `session.globalConfiguration.set` rejects leaves the slider showing the previous value.

# Edge cases and failure behavior

Music is never worth interrupting play for, so every failure of it is silent to the Player apart from the Track title.

- **Empty Soundtrack:** A Game build with no Track plays no music. The Music control still sets Music on, the Music volume slider still sets Music volume, and the Track title reads nothing.
- **Track that cannot be played:** A Track whose file cannot be loaded or decoded is skipped as if it had ended at once, and the next Track of the playing order starts. When every Track of a round fails, the GUI plays no more music in the Session, and the Track title reads nothing. Neither shows an error to the Player.
- **One Track:** A Soundtrack of one Track plays it again and again, each time with its fades.
- **Invalid stored value:** A stored Music on or Music volume that is not permitted follows the [Game build default](../foundation/engine-contract.md#persisted-data), under [Edge cases and failure behavior](../foundation/configuration.md#global-configuration) in Configuration.
