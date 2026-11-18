# Soundtrack

The music tracks the game plays, as the [Music](../../docs/specs/design/ui/music.md#soundtrack) specification
describes. Each `.opus` or `.mp3` file is one track, and its title is its file name without the extension, e.g.
`Silent Threat Protocol.opus` is the track titled "Silent Threat Protocol".

A track is named after the title its source gave it, so that the same name finds it in the source, in its track record,
and in the game, e.g. the ElevenLabs song "Silent Threat Protocol" is `Silent Threat Protocol.opus`. The table lists
each track with its source, including excluded tracks, although their files are no longer here.

| File                                                          | Source            |
| ------------------------------------------------------------- | ----------------- |
| `Abyss Protocol.opus`                                         | ElevenLabs        |
| `Abyssal Tactical Drift.opus`                                 | ElevenLabs        |
| `Beneath the Grid.opus`                                       | ElevenLabs        |
| `Black Orbit Watch.opus`                                      | ElevenLabs        |
| `Depth Signal.opus`                                           | ElevenLabs        |
| `Silent Contact.opus`                                         | ElevenLabs        |
| `Silent Contact Protocol.opus`                                | ElevenLabs        |
| `Silent Hostile Sector.opus`                                  | ElevenLabs        |
| `Silent Threat Protocol.opus`                                 | ElevenLabs        |
| `Subsurface Directive.opus`                                   | ElevenLabs        |
| `Unknown Contact.opus`                                        | ElevenLabs        |
| `Unseen Sector.opus`                                          | ElevenLabs        |
| `Unseen Threat Protocol.opus`                                 | ElevenLabs        |
| `v03AI UFO 1.mp3`                                             | Suno v5 via v03ai |
| `v03AI UFO 2.mp3`                                             | Suno v5 via v03ai |
| `v03AI UFO 3 - Scanning Protocol.mp3`                         | Suno v5 via v03ai |
| `v03AI UFO 4 - Scanning Protocol - Dark.mp3`                  | Suno v5 via v03ai |
| `v03AI UFO 5 - Scanning Protocol - Dark Violin.mp3`           | Suno v5 via v03ai |
| `v03AI UFO 6 - Scanning Protocol - Cello + Bass Clarinet.mp3` | Suno v5 via v03ai |
| `Bass clarinet + muted trombone var1.mp3`                     | Suno v6           |
| `Bass clarinet + muted trombone var2.mp3`                     | Suno v6           |
| `Signal Intercept var1.mp3`                                   | Suno v6           |
| `Signal Intercept var2.mp3`                                   | Suno v6           |
| `Unseen Approach var1.mp3`                                    | Suno v6           |
| `Unseen Approach var2.mp3`                                    | Suno v6           |

## Track records

A `.yaml` file with the same name as a track, e.g. `Silent Threat Protocol.yaml`, records how the track was made, so
that it can be told apart from the others and made again: its original title, source, creation date, the prompt it was
generated from, and what the source reports about it, e.g. tags, BPM, and length. A track record is not a track. Every
track from a source that keeps its prompts, e.g. ElevenLabs, has one, including each excluded track, whose record stays
here after its audio is removed.

## Excluded tracks

The Game designer excluded these tracks from the Soundtrack. Their audio files are not kept in this repository but in
the Game designer's personal backup, outside it; their rows in the table, and their track records where they have one,
stay here:

- `Beneath the Grid.opus`
- `Subsurface Directive.opus`
- `Unseen Sector.opus`
- `Unseen Threat Protocol.opus`
- `v03AI UFO 1.mp3`
- `v03AI UFO 2.mp3`

## Tracks from ElevenLabs

All the `.opus` files are from [ElevenLabs](https://elevenlabs.io/) Music. Each is named after its song's title in
ElevenLabs, with the spaces kept, although ElevenLabs downloads it with underscores for spaces, e.g. the download
`Silent_Threat_Protocol.opus` is saved as `Silent Threat Protocol.opus`. Their track records hold what the song's
details panel in the ElevenLabs Assets page shows: the description and prompt, word for word, and the tags, BPM, and
length.

## Tracks from Suno v5 via v03ai

The files named `v03AI UFO …` are from Suno v5, made via [v03ai](https://v03ai.com/), which cannot export Ogg Opus.
Their names are not their titles in v03ai but the names the Game designer gave the downloads: by mistake, the first two
are both titled "UFO1" in the v03ai interface, and only these names tell them apart. v03ai appends a number to the
download's file name, e.g. `v03AI UFO 3 - Scanning Protocol-1794952681178.mp3`, which is removed.

## Tracks from Suno v6

The other `.mp3` files are from Suno v6, made directly on [suno.com](https://suno.com/), which cannot export Ogg Opus.
Each is named after its song's title in Suno, e.g. `Signal Intercept var1.mp3`.
