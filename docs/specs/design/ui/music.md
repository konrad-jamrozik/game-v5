# Music

| Metadata    | Value                                                                                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | MUSIC                                                                                                                                                                      |
| Family      | UI                                                                                                                                                                         |
| Audience    | UI designer, Implementer                                                                                                                                                   |
| Owns        | The music of the graphical user interface: the Soundtrack, how it is played, its settings, and the Music control.                                                          |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

The GUI plays quiet background music under every screen, so that watching the Earth from the command console feels
like a covert operation under way. The music is meant to be heard and then forgotten: it plays the Tracks of the
Soundtrack in a random order, each fading in and out smoothly, and never stops or restarts because the Player changes
screen. The Player can turn it off or set its volume at any time, from the Main menu and from the Campaign screen, and
can always see which Track is playing.

The music belongs to the [Graphical User Interface](gui.md) alone. It reads no game state, changes no
[Campaign state](../foundation/core-concepts.md#campaign-and-session), and draws no random outcome of a
[Campaign](../foundation/core-concepts.md#campaign-and-session); the [Command-Line Interface](cli.md) plays no music.
Its two settings are part of [Global configuration](../foundation/engine-contract.md#persisted-data), so a choice the
Player makes once applies in every later [Session](../foundation/core-concepts.md#campaign-and-session).

# Glossary

| Term          | Definition                                                                                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Soundtrack    | The music that the [Game build](../foundation/core-concepts.md#game-build-and-content) supplies for the GUI to play, as a set of Tracks.                            |
| Track         | One piece of music of the Soundtrack, supplied as one audio file.                                                                                                   |
| Track title   | The name by which the GUI shows a Track, derived from the name of its file under [Soundtrack](#soundtrack).                                                         |
| Music on      | The [Global configuration](../foundation/engine-contract.md#persisted-data) setting that says whether the GUI plays music, under [Music settings](#music-settings). |
| Music volume  | The Global configuration setting that says how loud the GUI plays music, under [Music settings](#music-settings).                                                   |
| Music control | The control through which the Player sets Music on and Music volume, and which shows the Track title of the current Track, under [Music control](#music-control).   |
| Current Track | The Track that is playing, or that is paused because Music on is false, under [Playback](#playback).                                                                |

# Soundtrack

The Soundtrack is authored as audio files, so that a composer adds a Track by adding a file and nothing else. Each
Track is one file directly in the `assets/music/` directory at the repository root, in the Ogg Opus format with the
extension `.opus`. The Soundtrack is every such file, and the Game build supplies every Track unchanged.

The file name of a Track is its Track title with each space replaced by an underscore, so the Track title is the file
name without its extension and with each underscore replaced by a space. E.g., the file `Black_Orbit_Watch.opus` is
the Track titled "Black Orbit Watch". No two Tracks have the same Track title.

# Music settings

The Player decides whether music plays and how loud it is, and the choice should survive the end of a [Session](../foundation/core-concepts.md#campaign-and-session), so both
are settings of Global configuration, read and changed through `session.globalConfiguration` under
[Global configuration](../foundation/configuration.md#global-configuration) in Configuration. The following table is
complete for music.

| Setting      | Permitted values                         | Game build default |
| ------------ | ---------------------------------------- | ------------------ |
| Music on     | `true` or `false`                        | `true`             |
| Music volume | A whole number from 0 to 100, inclusive. | 50                 |

Music volume is a percentage of the loudness at which the Track was authored. Music on and Music volume are
independent: turning music off keeps the Music volume, and setting the Music volume while music is off stores it for
when music is turned on.

## Loudness

The loudness of the music follows the Player's ear rather than the number on the slider, so that the lower half of the
slider is as useful as the upper half. The gain applied to the Current Track, a factor of the amplitude at which the
Track was authored, is:

gain = f × (v / 100)²

where v is the Music volume, a whole number from 0 to 100, and f is the fade factor, a number from 0 to 1 under
[Fades](#fades). No rounding occurs, so the gain is a number from 0 to 1: 0 is silence, and 1 plays the Track as
authored. E.g., with a Music volume of 50 and no fade under way, the gain is 1 × 0.5² = 0.25.

# Playback

The GUI plays music from the moment it opens until the Session ends, whichever screen it shows, so that the music is
one continuous background rather than a sound tied to a screen. The following rules are complete:

- **Start:** When the GUI opens and Music on is `true`, it starts the first Track of the playing order. When the
  platform withholds sound until the Player first interacts with the GUI, e.g. a web browser that blocks sound until
  the first click or key press, the first Track starts at that first interaction instead, from its beginning.
- **Continuity:** Changing screen, opening or closing a [Detail view](gui.md#glossary), and creating, loading, or
  closing a [Campaign](../foundation/core-concepts.md#campaign-and-session) neither restart nor interrupt the Current Track. Neither does an
  [Autopilot engagement](../foundation/engine-contract.md#autopilot).
- **Next Track:** When the Current Track ends, the next Track of the playing order starts at once from its beginning
  and becomes the Current Track.
- **Music off:** When Music on becomes `false`, the Current Track fades out under [Fades](#fades) and then pauses at
  the point it reached.
- **Music on:** When Music on becomes `true`, the paused Current Track resumes from the point at which it paused and
  fades in. When no Track has started yet in the Session, the first Track of the playing order starts instead.
- **Volume:** A change of Music volume changes the gain under [Loudness](#loudness) at once, also during a fade, and
  never restarts or pauses the Current Track. A Music volume of 0 with Music on `true` keeps the Tracks playing
  silently, so the playing order goes on.

## Playing order

The Player should hear every Track before hearing any Track again, and should not hear the same Track twice in a row.
The Tracks are therefore played in rounds, under these complete rules:

- **Rounds:** Each round plays every Track of the Soundtrack exactly once, in an order drawn uniformly at random from
  all the orders the next rule permits. The first round starts when the first Track of the Session starts, and each
  round starts when the previous one ends.
- **No repeat across rounds:** When the Soundtrack has two or more Tracks, the first Track of a round is never the last
  Track of the round before it.

The order of each round is one random outcome, the round order. It is drawn from a source of randomness that belongs to
the GUI and differs between Sessions, never from the randomness of a Campaign, so playing music never changes what a
Campaign draws under [Random outcomes](../foundation/determinism-and-randomness.md#random-outcomes).

## Fades

A Track should never start or stop abruptly. The fade factor f under [Loudness](#loudness) rises and falls linearly
with time, under these complete rules:

| Moment                                      | Change of f                                        | Duration  |
| ------------------------------------------- | -------------------------------------------------- | --------- |
| A Track starts from its beginning           | From 0 to 1                                        | 3 seconds |
| A Track reaches its last 3 seconds          | From 1 to 0, ending when the Track ends            | 3 seconds |
| Music on becomes `false`                    | From its current value to 0, then the Track pauses | 1 second  |
| Music on becomes `true` and a Track resumes | From 0 to 1                                        | 1 second  |

Outside these fades, f is 1. When a fade starts while another is under way, the new fade starts from the current value
of f, and its duration shrinks in proportion to the distance left; e.g., turning music off when f is 0.5 fades from 0.5
to 0 in 0.5 seconds. A Track shorter than 6 seconds fades in over its first half and out over its second half.

# Music control

The Player should be able to silence the music or change its volume without leaving what they are doing, and to find
out what is playing. The Music control does both, and it appears in two places: in the Settings panel of the
[Main Menu](screens/main-menu.md), and in the footer of the [Side panel](gui.md#glossary) of the
[Campaign Screen](screens/campaign-screen.md), so it is always one click away. It holds, in one row, from left to
right:

1. **Music toggle:** a neutral button showing a speaker, struck through while Music on is `false`. Selecting it sets
   Music on to the opposite value through `session.globalConfiguration.set`. Its accessible name is "Music on" or
   "Music off", after the state it shows.
2. **Volume slider:** a horizontal slider from 0 to 100 in steps of 1, showing the Music volume, followed by the Music
   volume in the Figure style. While the Player drags it, the gain follows the slider at once under
   [Loudness](#loudness); the Music volume is set through `session.globalConfiguration.set` when the Player releases
   it, so that dragging stores one value rather than one for each step. The slider stays enabled while Music on is
   `false`.
3. **Track title:** the Track title of the Current Track, after a music note, e.g. "♪ Black Orbit Watch", in the
   Caption style. While Music on is `false` it reads "Music off" in Muted text instead, and before the first Track
   starts it reads nothing. A title too long for the space ends in an ellipsis, and the whole title shows on hover.

The Music control is drawn with the [Design tokens](visual-design.md#glossary) and components of [Visual Design](visual-design.md). A setting that
`session.globalConfiguration.set` rejects leaves the Music control showing the setting's previous value.

# Edge cases and failure behavior

Music is never worth interrupting play for, so every failure of it is silent to the Player apart from the Track title.

- **Empty Soundtrack:** A Game build with no Track plays no music. The Music control still sets Music on and Music
  volume, and its Track title reads nothing.
- **Track that cannot be played:** A Track whose file cannot be loaded or decoded is skipped as if it had ended at
  once, and the next Track of the playing order starts. When every Track of a round fails, the GUI plays no more music
  in the Session, and the Track title reads nothing. Neither shows an error to the Player.
- **One Track:** A Soundtrack of one Track plays it again and again, each time with its fades.
- **Invalid stored value:** A stored Music on or Music volume that is not permitted follows the [Game build default](../foundation/engine-contract.md#persisted-data),
  under [Edge cases and failure behavior](../foundation/configuration.md#edge-cases-and-failure-behavior) in
  Configuration.

# Acceptance examples

These examples use a Soundtrack of three Tracks, `Depth_Signal.opus`, `Silent_Contact.opus`, and
`Unseen_Sector.opus`, each 120 seconds long.

- **Track title:** The Track of `Silent_Contact.opus` is titled "Silent Contact", and the Music control shows
  "♪ Silent Contact" while it plays ([Soundtrack](#soundtrack)).
- **Rounds:** With the round order of the first round fixed to Silent Contact, Unseen Sector, Depth Signal, the Session
  plays those three Tracks in that order. The second round's order is one of the four orders that do not start with
  Depth Signal, e.g. Unseen Sector, Depth Signal, Silent Contact ([Playing order](#playing-order)).
- **Fade in:** With the Music volume 50, 1.5 seconds after a Track starts f is 0.5 and the gain is
  0.5 × 0.5² = 0.125; from 3 seconds on, the gain is 0.25 ([Loudness](#loudness), [Fades](#fades)).
- **Fade out to the next Track:** 118.5 seconds into a Track, f is 0.5. At 120 seconds the Track ends with f at 0, and
  the next Track of the round starts at once with f at 0 ([Fades](#fades), [Playback](#playback)).
- **Off and on again:** 60 seconds into Unseen Sector the Player selects the Music toggle. Music on is stored as
  `false`, the Track fades out over 1 second and pauses at 61 seconds, and the Music control reads "Music off". The
  Player selects the Music toggle again: the Track resumes at 61 seconds, fades in over 1 second, and the Music
  control reads "♪ Unseen Sector" ([Playback](#playback)).
- **Volume across screens and Sessions:** On the Main menu the Player drags the Volume slider to 30 and releases it.
  Music volume is stored as 30. The Player loads a Campaign save: the Current Track plays on without a break, and the
  Music control of the Campaign screen shows 30. In the next Session the music starts with the Music volume 30
  ([Music settings](#music-settings), [Playback](#playback)).
- **Blocked sound:** In a web browser that blocks sound until the first interaction, the GUI opens at the Main menu
  and the Track title reads nothing. The Player clicks Load on a Campaign save: the first Track starts from its
  beginning with its fade in, and the Campaign loads ([Playback](#playback)).
- **Unplayable Track:** The file of Silent Contact is damaged. When Silent Contact is next in a round, it is skipped,
  and the Track after it starts at once; no error is shown
  ([Edge cases and failure behavior](#edge-cases-and-failure-behavior)).
