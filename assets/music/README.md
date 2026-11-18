# Soundtrack

The music tracks the game plays, as the [Music](../../docs/specs/design/ui/music.md#soundtrack) specification
describes. Each `.opus` or `.mp3` file is one track, and its title is its file name without the extension, e.g.
`GEO-1.opus` is the track titled "GEO-1".

Each file was renamed from the title its source gave it. The table maps each file to that original title and its
source.

| File          | Original title                                          | Source            |
| ------------- | ------------------------------------------------------- | ----------------- |
| `GEO-1.opus`  | Abyss Protocol                                          | ElevenLabs        |
| `GEO-2.opus`  | Abyssal Tactical Drift                                  | ElevenLabs        |
| `GEO-3.opus`  | Beneath the Grid                                        | ElevenLabs        |
| `GEO-4.opus`  | Black Orbit Watch                                       | ElevenLabs        |
| `GEO-5.opus`  | Depth Signal                                            | ElevenLabs        |
| `GEO-6.opus`  | Silent Contact                                          | ElevenLabs        |
| `GEO-7.opus`  | Silent Contact Protocol                                 | ElevenLabs        |
| `GEO-8.opus`  | Silent Hostile Sector                                   | ElevenLabs        |
| `GEO-9.opus`  | Silent Threat Protocol                                  | ElevenLabs        |
| `GEO-10.opus` | Subsurface Directive                                    | ElevenLabs        |
| `GEO-11.opus` | Unknown Contact                                         | ElevenLabs        |
| `GEO-12.opus` | Unseen Sector                                           | ElevenLabs        |
| `GEO-13.opus` | Unseen Threat Protocol                                  | ElevenLabs        |
| `GEO-14.mp3`  | v03AI UFO 1                                             | Suno v5 via v03ai |
| `GEO-15.mp3`  | v03AI UFO 2                                             | Suno v5 via v03ai |
| `GEO-16.mp3`  | v03AI UFO 3 - Scanning Protocol                         | Suno v5 via v03ai |
| `GEO-17.mp3`  | v03AI UFO 4 - Scanning Protocol - Dark                  | Suno v5 via v03ai |
| `GEO-18.mp3`  | v03AI UFO 5 - Scanning Protocol - Dark Violin           | Suno v5 via v03ai |
| `GEO-19.mp3`  | v03AI UFO 6 - Scanning Protocol - Cello + Bass Clarinet | Suno v5 via v03ai |
| `GEO-20.mp3`  | Signal Intercept var1                                   | Suno v6           |
| `GEO-21.mp3`  | Signal Intercept var2                                   | Suno v6           |
| `GEO-22.mp3`  | Unseen Approach var1                                    | Suno v6           |
| `GEO-23.mp3`  | Unseen Approach var2                                    | Suno v6           |
| `GEO-24.mp3`  | Bass clarinet + muted trombone var1                     | Suno v6           |
| `GEO-25.mp3`  | Bass clarinet + muted trombone var2                     | Suno v6           |

## Tracks from ElevenLabs

All the `.opus` files are from [ElevenLabs](https://elevenlabs.io/), each saved under the file name ElevenLabs gave it,
with underscores for spaces, e.g. `GEO-9.opus` was `Silent_Threat_Protocol.opus`.

## Tracks from Suno v5 via v03ai

`GEO-14.mp3` to `GEO-19.mp3` are from Suno v5, made via [v03ai](https://v03ai.com/), which cannot export Ogg Opus.
Their original titles, "v03AI UFO 1" and "v03AI UFO 2", are the file names they had here, not their titles in v03ai: by
mistake, both are titled "UFO1" in the v03ai interface, and only these file names told them apart.

The original titles of the later files from v03ai are the file names they had here without the number v03ai appended,
e.g. `GEO-16.mp3` was `v03AI UFO 3 - Scanning Protocol-1794952681178.mp3`.

## Tracks from Suno v6

`GEO-20.mp3` to `GEO-25.mp3` are from Suno v6, made directly on [suno.com](https://suno.com/), which cannot export
Ogg Opus. Their original titles are the file names they had here, e.g. `GEO-20.mp3` was
`Signal Intercept var1.mp3`.
