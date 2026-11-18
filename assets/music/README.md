# Soundtrack

The music tracks the game plays, as the [Music](../../docs/specs/design/ui/music.md#soundtrack) specification
describes. Each `.opus` or `.mp3` file in [`tracks/`](tracks/) is one track, and its title is its file name without
the extension, e.g. `tracks/Silent Threat Protocol.opus` is the track titled "Silent Threat Protocol". The record of how
each track was made is in [`yaml/`](yaml/), as [Track records](#track-records) describes.

A track is named after the title its source gave it, so that the same name finds it in the source, in its track record,
and in the game, e.g. the ElevenLabs song "Silent Threat Protocol" is `Silent Threat Protocol.opus`. The table lists
each track with its source and whether it is excluded from the Soundtrack.

The `excluded_tracks` of the GDR `music` in
[`content/music/music_parameters.yaml`](../../content/music/music_parameters.yaml) decides which tracks are excluded,
and the Excluded column mirrors it. An excluded track's audio file is not kept in this repository but in the Game
designer's personal backup, outside it; its row in the table, and its track record where it has one, stay here.

| File                                                          | Source            | Excluded |
| ------------------------------------------------------------- | ----------------- | -------- |
| `Abyss Protocol.opus`                                         | ElevenLabs        |          |
| `Abyssal Tactical Drift.opus`                                 | ElevenLabs        |          |
| `Beneath the Grid.opus`                                       | ElevenLabs        | Yes      |
| `Black Orbit Watch.opus`                                      | ElevenLabs        |          |
| `Depth Signal.opus`                                           | ElevenLabs        |          |
| `Silent Contact.opus`                                         | ElevenLabs        |          |
| `Silent Contact Protocol.opus`                                | ElevenLabs        |          |
| `Silent Hostile Sector.opus`                                  | ElevenLabs        |          |
| `Silent Threat Protocol.opus`                                 | ElevenLabs        |          |
| `Subsurface Directive.opus`                                   | ElevenLabs        | Yes      |
| `Unknown Contact.opus`                                        | ElevenLabs        |          |
| `Unseen Sector.opus`                                          | ElevenLabs        | Yes      |
| `Unseen Threat Protocol.opus`                                 | ElevenLabs        | Yes      |
| `v03AI UFO 1.mp3`                                             | Suno v5 via v03ai | Yes      |
| `v03AI UFO 2.mp3`                                             | Suno v5 via v03ai | Yes      |
| `v03AI UFO 3 - Scanning Protocol.mp3`                         | Suno v5 via v03ai |          |
| `v03AI UFO 4 - Scanning Protocol - Dark.mp3`                  | Suno v5 via v03ai |          |
| `v03AI UFO 5 - Scanning Protocol - Dark Violin.mp3`           | Suno v5 via v03ai |          |
| `v03AI UFO 6 - Scanning Protocol - Cello + Bass Clarinet.mp3` | Suno v5 via v03ai |          |
| `Bass clarinet + muted trombone var1.mp3`                     | Suno v6           |          |
| `Bass clarinet + muted trombone var2.mp3`                     | Suno v6           |          |
| `Signal Intercept var1.mp3`                                   | Suno v6           |          |
| `Signal Intercept var2.mp3`                                   | Suno v6           |          |
| `Unseen Approach var1.mp3`                                    | Suno v6           |          |
| `Unseen Approach var2.mp3`                                    | Suno v6           |          |

## Track records

A `.yaml` file in `yaml/` with the same name as a track, e.g. `yaml/Silent Threat Protocol.yaml`, records how the
track was made, so
that it can be told apart from the others and made again: its original title, source, creation date, the prompt it was
generated from, and what the source reports about it, e.g. tags, BPM, and length. Every
track whose prompt is known has one, including each excluded track, whose record stays here after its audio is
removed.

A record holds only the keys it has values for:

| Key                | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `file`             | The track's file name in `tracks/`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `source`           | Where the track was made, as in the table.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `original_title`   | The track's title, its file name without the extension.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `title_in_source`  | The song's title in its source, when it differs from `original_title`, e.g. "UFO 1" in v03ai.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `song_url`         | The song's page in its source, e.g. `https://suno.com/song/<id>`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `model`            | The source's model that made the song, e.g. `v6 (chirp-hawk)` for Suno: the version Suno shows, then its internal model name.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `created`          | When the song was made, as a date, or a date and time in Pacific time: the time the source showed, or, where it showed none, e.g. for most v03ai songs, the time its download was saved.                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `description`      | The source's own description of the song.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `human_assessment` | The Game designer's verdict on the song after listening to it, e.g. `rejected`, optionally followed by why, e.g. `rejected, too irritating MIDI sounds`. Every excluded track's record has one.                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `tags`             | The source's tags for the song; for v03ai, the comma-separated words of the "Style:" line the prompt was written with, which is not part of `prompt`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `bpm`              | The tempo the source reports.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `length`           | The song's length as the source reports it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `prompt_from`      | How the prompt was written with a chatbot: the `tool`, the `conversation_url` and `share_url` of the conversation, the `meta_prompt` the Game designer gave it, and, when the conversation continued from the prompt of another track, that track's file in `continues_from`, so that `meta_prompt` holds only what was added. When the prompt was reused unchanged from another track, `same_prompt_as` names that track's file instead of a `meta_prompt`. When the source changed the prompt before storing it, e.g. Suno's Variety rewriting the Styles text, `produced_prompt` holds the text the chatbot produced and pasted in, word for word. |
| `instruments`      | The instruments the prompt was written around, as the Game designer chose them, e.g. `[bass clarinet, muted trombone]`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `instrumental`     | `true` when the song was generated as an instrumental, with no lyrics, e.g. Suno's Instrumental switch.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `prompt`           | The prompt the song was generated from, word for word; for Suno, its Styles text.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `exclude_styles`   | Suno's Exclude styles text, word for word: what the song must not sound like.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `control_sliders`  | Suno's advanced sliders, as Suno stores them: `weirdness_constraint` for Weirdness, `style_weight` for Style influence, and `aug_creativity` for Variety, each from 0 to 1, e.g. Weirdness 40% is `0.4`. Variety `0` is Off, which keeps the Styles text as written; above 0, Suno may rewrite it.                                                                                                                                                                                                                                                                                                                                                    |
| `notes`            | Anything else needed to read the record, e.g. that the prompt given to the source was truncated.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

## Tracks from ElevenLabs

All the `.opus` files are from [ElevenLabs](https://elevenlabs.io/) Music. Each is named after its song's title in
ElevenLabs, with the spaces kept, although ElevenLabs downloads it with underscores for spaces, e.g. the download
`Silent_Threat_Protocol.opus` is saved as `Silent Threat Protocol.opus`. Their track records hold what the song's
details panel in the ElevenLabs Assets page shows: the description and prompt, word for word, and the tags, BPM, and
length.

## Tracks from Suno v5 via v03ai

The files named `v03AI UFO …` are from Suno v5, made via [v03ai](https://v03ai.com/), which cannot export Ogg Opus.
Each is named after its song's title in v03ai, except the first two: by mistake, both are titled "UFO 1" in v03ai, so
they are named `v03AI UFO 1.mp3` and `v03AI UFO 2.mp3` after the names the Game designer gave their downloads. v03ai
appends a number to the download's file name, e.g. `v03AI UFO 3 - Scanning Protocol-1794952681178.mp3`, which is
removed. Their track records come from the Game designer's notes: the prompt given to v03ai, or, where ChatGPT wrote it,
the full prompt ChatGPT produced and the conversation it came from. v03ai caps a Suno v5 prompt at 1,000 characters,
so a longer prompt was given to it truncated.

## Tracks from Suno v6

The other `.mp3` files are from Suno v6, made directly on [suno.com](https://suno.com/), which cannot export Ogg Opus.
Each is named after its song's title in Suno, e.g. `Signal Intercept var1.mp3`; a Suno song with another title, e.g.
a "(Remastered)" copy, is not a track. Their track records hold the song data Suno keeps for each song: its page, model,
creation time, tags, length, Styles text, Exclude styles text, and sliders.

## Analyzing track contents

To analyze what a track contains, e.g. its instruments, structure, or mood, the
[NVIDIA Music Flamingo demo](https://nvidia-music-flamingo.hf.space/) is a good tool: it takes an audio file and answers
questions about it.

Other tools that may serve the same purpose have not been tested yet: [Google AI Studio](https://aistudio.google.com/)
and the [instrument detection from audio](https://unveilmusic.app/instrument-detection-from-audio) of Unveil Music.
