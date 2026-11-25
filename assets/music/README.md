# Soundtrack

The music tracks the game plays, as the [Music](../../docs/specs/design/ui/music.md#soundtrack) specification describes. Each `.opus` or `.mp3` file in [`tracks/`](tracks/) is one track, and its title is its file name without the extension, e.g. `tracks/Descent to Earth.opus` is the track titled "Descent to Earth". The record of how each track was made is in [`yaml/`](yaml/), as [Track records](#track-records) describes.

The Game designer chooses each track's name, as [Track names](#track-names) describes, e.g. `tracks/In Pursuit of Shapeshifters.mp3`. The table lists each track with its record's `serial_id` and `variant`, which keep when it was made and which take of its prompt it is, whatever its name, as [Track records](#track-records) describes; its original title, the title its source gave it, which finds the song in the source; and its source.

Every track in the table is in the Soundtrack. A track the Game designer rejects is deleted: its audio file, its record, and its row, so that its song stays only in its source, e.g. ElevenLabs or Suno.

| File | Serial ID | Variant | Original title | Source |
| --- | --: | --- | --- | --- |
| `A City on Sonar.opus` | 3 | A | Depth Signal | ElevenLabs |
| `Alien Lifeforms.mp3` | 15 | B | Signal Intercept var2 | Suno v6 |
| `Alien Technology.mp3` | 14 | A | Signal Intercept var1 | Suno v6 |
| `Approaching the Megastructure.opus` | 7 | B | Silent Contact | ElevenLabs |
| `Artifact Experiments.mp3` | 32 | B | Unknown Contact B | Suno v6 |
| `Assault on the Alien Facility.mp3` | 28 | A | S6 XCOM+AllowEpic+NoSynth+Slow+Space A | Suno v6 |
| `Containment Protocol.mp3` | 25 | B | S6 SCNP+7Instr B | Suno v6 |
| `Countering the Threat.mp3` | 29 | B | S6 XCOM+AllowEpic+NoSynth+Slow+Space B | Suno v6 |
| `Cybernetic Elites.mp3` | 34 | B | Deep Space Contact B | Suno v6 |
| `Dark Omen.mp3` | 16 | A | Unseen Approach var1 | Suno v6 |
| `Deployment Preparations.opus` | 5 | One only | Black Orbit Watch | ElevenLabs |
| `Descent to Earth.opus` | 9 | B | Silent Threat Protocol | ElevenLabs |
| `In Pursuit of Shapeshifters.mp3` | 31 | A | Unknown Contact A | Suno v6 |
| `Inside the Command Center.opus` | 1 | One only | Silent Contact Protocol | ElevenLabs |
| `Inside the Megastructure.opus` | 6 | A | Unknown Contact | ElevenLabs |
| `Network Expansion.mp3` | 22 | A | S6 SCNP+Dark+DBass&BowedCymbals A | Suno v6 |
| `Night Shift.mp3` | 17 | B | Unseen Approach var2 | Suno v6 |
| `On the Trail of the Unknown.mp3` | 10 | One only | v03AI UFO 3 - Scanning Protocol | Suno v5 via v03ai |
| `Reports of the Strange.mp3` | 11 | One only | v03AI UFO 4 - Scanning Protocol - Dark | Suno v5 via v03ai |
| `Sacrifice for Earth.opus` | 8 | A | Silent Hostile Sector | ElevenLabs |
| `Shady Deals.mp3` | 19 | B | Bass clarinet + muted trombone var2 | Suno v6 |
| `Signal Intelligence.mp3` | 33 | A | Deep Space Contact A | Suno v6 |
| `Smuggling Artifacts.mp3` | 18 | A | Bass clarinet + muted trombone var1 | Suno v6 |
| `Solemn Aftermath.mp3` | 24 | A | S6 SCNP+7Instr A | Suno v6 |
| `Subterranean Facility.mp3` | 35 | One only | Subterranean Facility | Suno v6 |
| `Surface Logistics.mp3` | 23 | B | S6 SCNP+Dark+DBass&BowedCymbals B | Suno v6 |
| `Survey at Depth.opus` | 4 | B | Abyssal Tactical Drift | ElevenLabs |
| `The Alien Fleet Arrives.mp3` | 26 | A | S6 XCOM+Var+NoMIDI+AllowHeroAggr A | Suno v6 |
| `The Human Toll.mp3` | 20 | A | S6 SCNP+Dark+Cello&DBass A | Suno v6 |
| `The Infestation Spreads.mp3` | 12 | One only | v03AI UFO 5 - Scanning Protocol - Dark Violin | Suno v5 via v03ai |
| `The Reports Keep Coming.mp3` | 13 | One only | v03AI UFO 6 - Scanning Protocol - Cello + Bass Clarinet | Suno v5 via v03ai |
| `Their Weapons in Our Hands.mp3` | 27 | B | S6 XCOM+Var+NoMIDI+AllowHeroAggr B | Suno v6 |
| `UFO Salvage Operation.mp3` | 30 | C | Restricted Orbit | Suno v6 |
| `Undersea Operations.opus` | 2 | One only | Abyss Protocol | ElevenLabs |
| `What Remains.mp3` | 21 | B | S6 SCNP+Dark+Cello&DBass B | Suno v6 |

## Track names

A track's name is any name the Game designer chooses, e.g. `In Pursuit of Shapeshifters` or the song's title in its source, e.g. `Subterranean Facility`. A name is a file name, so it must be valid on Windows: it contains none of `\ / : * ? " < > |` and does not end in a space or a period.

- **Before the Game designer names it:** a new track is named by its record's `prompt_code` and, when its `variant` is a letter, `-` and that letter, e.g. `Suno v6 - Scanning Protocol - Dark - Felt Piano and Cello - A` for a first take, or the `prompt_code` alone for a `One only` track. The `prompt_code` is built from the record's `meta_prompt_taxonomy`, as [Prompt codes](music-taxonomy.md#prompt-codes) describes.
- **Renaming:** nothing keeps an old name, so every mention of a renamed track changes with it: its file and record, its record's `file`, and this README. Its `prompt_code`, `variant`, and `serial_id` do not change.

## Track records

A `.yaml` file with the same name as a track records how the track was made, so that it can be told apart from the others and made again: its source and model, when it was made, the key decisions behind its prompt, the prompt and settings submitted to the source, the prompt as the source stored it, and what the source reports about it, e.g. tags and length. Every track has one, and deleting a track deletes its record. A draft record, whose first line is `# DRAFT: TODO values are filled in from the source after generation.`, records a track that is planned but not yet added: its `file` is not yet in `tracks/`, no row of the table lists it, and each value only the source can give is `TODO`. Where a record is kept tells its state:

- `yaml/`: a track's record, e.g. `yaml/Descent to Earth.yaml`.
- `yaml/drafts/`: a draft record, which moves into `yaml/` once its track is added, e.g. a draft for a third take of the Suno v6 Scanning Protocol prompt is `yaml/drafts/Suno v6 - Scanning Protocol - C.yaml`.

The following table lists every key a record may hold; the list is exhaustive. A record holds only the keys it has values for, except the required ones, which every record holds. Keys nested in another key are written with a dot, e.g. `suno.prompt` is the `prompt` key inside `suno`. Once written, `prompt_code` and `variant` never change, also when the track is renamed, and `serial_id` changes only when a deleted track leaves a gap to close.

| Key | Required | Value |
| --- | --- | --- |
| `file` | Yes | The track's file name in `tracks/`. |
| `source` | Yes | Where the track was made, as in the table, e.g. `ElevenLabs Music`, `Suno v5 via v03ai`, or `Suno v6`. |
| `original_title` | Yes | The track's title before any renaming: its title in its source, or the name the Game designer gave its download. |
| `source_title` | Yes | The song's title in its source now. A track's name may differ from it, e.g. `Descent to Earth.opus` is the ElevenLabs song "Silent Threat Protocol", so the song is found in its source by this title, or for Suno by `song_url`. It equals `original_title` until the Game designer renames the song in its source, and then changes with it, e.g. to the title Suno shows, read as [Reading Suno song data](#reading-suno-song-data) describes. |
| `serial_id` | Yes | The order in which the Game designer made the track among all tracks, from `1` with no gaps, by `created`; songs made at the same time take the order of their takes, e.g. `Alien Technology` is `14` and `Alien Lifeforms` is `15`. Deleting a track renumbers every later one, e.g. deleting track `14` makes `15` the new `14`. A draft holds `TODO` and gets the next number when it is completed. |
| `prompt_code` | Yes | The record's prompt, named by the segments of its source, stem, and adjustments, as [Prompt codes](music-taxonomy.md#prompt-codes) describes, e.g. `V03AI - Suno v5 - Scanning Protocol - Dark - Cello and Bass Clarinet`. |
| `variant` | Yes | Which take of its `prompt_code` the track is: a letter, `A`, `B`, `C` and on, or `One only` when no other record has the same `prompt_code`. The songs of one generation take `A`, `B`, and on, in the order of their takes. A record written later takes the next letter after the highest any record of its `prompt_code` holds, or `B` after a `One only` record, e.g. `UFO Salvage Operation` is `C` after its prompt's `A` and `B`. No two records have the same `prompt_code` and `variant`. |
| `song_url` |  | The song's page in its source, e.g. `https://suno.com/song/<id>`. |
| `model` |  | The source's model that made the song, as the source labels it, e.g. `Music v2.5` or `v6 (chirp-hawk)`. |
| `created` | Yes | When the song was made, as a date, or a date and time in Pacific time: the time the source keeps, or, where it shows none, the time its download was saved, as each source's section says. |
| `tags` | Yes, except from v03ai | The source's tags for the song, as a list. v03ai reports none; the "Style:" line given to it is `v03ai.style`. |
| `length` |  | The song's length as the source reports it, as `m:ss`. |
| `instrumental` |  | `true` when the song was generated as an instrumental, with no lyrics, e.g. Suno's Instrumental switch. |
| `meta_prompt_taxonomy` | Yes | The key decisions behind the prompt, at a glance, from which the record's `prompt_code` is built. It lists only what is in effect in the prompt, e.g. not an instrument that a later adjustment replaced, nor a tint added and dropped again. |
| `meta_prompt_taxonomy.stem` | Yes | The idea the prompt grew from, which every track of one line of prompts shares, e.g. `Replicate "Scanning Protocol" (Chris D'Ambrosio, XCOM Legacy OST)`. |
| `meta_prompt_taxonomy.adjustments` | Yes | The adjustments that shaped the prompt from the stem, in the order the Game designer asked for them, each in a few words, as a list; `[]` when the prompt is the stem itself. A source setting is not an adjustment, since the source's key below holds it, unless the Game designer names it as one, e.g. Allow Heroic and Aggressive for styles taken out of the Exclude styles. |
| `elevenlabs`, `suno`, or `v03ai` | Yes | Everything submitted to the source to generate the song, word for word: the key of the record's source, `elevenlabs` for `ElevenLabs Music`, `suno` for `Suno v6`, and `v03ai` for `Suno v5 via v03ai`. |
| `elevenlabs.prompt` | Yes | The prompt given to ElevenLabs Music. |
| `suno.prompt` | Yes | The Styles text pasted into Suno. |
| `suno.exclude_styles` |  | Suno's Exclude styles text: what the song must not sound like. |
| `suno.weirdness` |  | Suno's Weirdness, from 0 to 1, e.g. Weirdness 40% is `0.4`. |
| `suno.style_influence` |  | Suno's Style influence, from 0 to 1, e.g. Style influence 70% is `0.7`. |
| `suno.variety` |  | Suno's Variety, as the number of its slider setting from left to right: `0` Off, `1` Normal, `2` High, `3` Extra, `4` Max. At `0`, Suno keeps the Styles text as written; above it, Suno may rewrite it. |
| `suno.max_mode` |  | Suno's Max Mode, `true` when on. |
| `suno.personalize` |  | Suno's Personalize, `true` when on. |
| `suno.duration` |  | Suno's Duration, e.g. `auto`. |
| `v03ai.prompt` | Yes | The prompt given to v03ai, or the full prompt it was cut from to fit v03ai's 1,000 characters. |
| `v03ai.style` |  | The comma-separated words of the "Style:" line given to v03ai, as a list. |
| `final_prompt_from_gen_tool` |  | The prompt as the source stored it, word for word, when it differs from the one submitted, e.g. Suno's Variety rewrote the Styles text, differently for each take. Without it, the source kept the submitted prompt unchanged. |
| `human_assessment` |  | The Game designer's verdict on the song after listening to it, optionally followed by why, e.g. `Great result.` |

## Tracks from ElevenLabs

All the `.opus` files are from [ElevenLabs](https://elevenlabs.io/) Music, whose records' `source` is `ElevenLabs Music`. ElevenLabs gives no song link, and downloads a song under its title with underscores for spaces, e.g. `Silent_Threat_Protocol.opus` for the song "Silent Threat Protocol". Their track records hold what the song's details panel in the ElevenLabs Assets page shows: the prompt, word for word, the tags, the length, and, as `created`, the exact Added time to the second, which orders songs made in the same minute; their `model` comes from the label beside each song in the ElevenLabs Music history.

## Tracks from Suno v5 via v03ai

The files whose records' `source` is `Suno v5 via v03ai` are from Suno v5, made via [v03ai](https://v03ai.com/), which cannot export Ogg Opus. v03ai gives no song link and shows no creation time, so `created` is when the download was saved. It appends a number to the download's file name, e.g. `v03AI UFO 3 - Scanning Protocol-1794952681178.mp3`, which is not part of the title.

## Tracks from Suno v6

The files whose records' `source` is `Suno v6` are from Suno v6, made directly on [suno.com](https://suno.com/), which cannot export Ogg Opus. A record's `song_url` opens its song; a Suno song that no record names, e.g. a "(Remastered)" copy, is not a track. Their track records hold the song data Suno keeps for each song: its page, model, creation time, tags, length, Styles text, Exclude styles text, and sliders. Suno caps the Styles text at 1,000 characters, so every prompt written for Suno v6 fits within it.

### Reading Suno song data

A song's `<id>` is in its song link, e.g. `https://suno.com/song/<id>`. When the Game designer sends no link, the MP3 Suno downloads holds it: its ID3 tags hold the link, as the `WOAS` frame, and a comment `made with suno; created=<UTC time>; id=<id>`, which a look at the file's printable text in its first few kilobytes shows, e.g. `head -c 6000 <file> | tr -c '[:print:]' '\n' | grep suno`.

A Suno song page renders its data in the browser, so a web fetch of the page shows none of it. Its data is instead the clip's JSON from `https://studio-api.prod.suno.com/api/clip/<id>`, which needs no sign-in, e.g. `curl -s -o clip.json "https://studio-api.prod.suno.com/api/clip/<id>"`. A record takes from it:

| Clip JSON field | Record key |
| --- | --- |
| `title` | `source_title`; and, for a new song, `original_title` too, which must match the take's name |
| `major_model_version` and `model_name`, e.g. `v6` and `chirp-hawk` | `model`, e.g. `v6 (chirp-hawk)` |
| `created_at`, in UTC | `created`, converted to Pacific time |
| `display_tags`, comma-separated | `tags`, as a list; `[]` when Suno gives none |
| `metadata.duration`, in seconds | `length`, as `m:ss`, rounded down to the whole second, e.g. `188.8` is `3:08` |
| `metadata.tags` | `final_prompt_from_gen_tool`: the final Styles text, as Suno stored it, when it differs from `suno.prompt` |
| `metadata.negative_tags` | `suno.exclude_styles`, without its leading spaces |
| `metadata.make_instrumental` | `instrumental` |
| `metadata.control_sliders.style_weight` | `suno.style_influence`; Suno omits it at the default of 50%, i.e. `0.5` |
| `metadata.control_sliders.aug_creativity` | `suno.variety`, by its number |
| `metadata.control_sliders.weirdness_constraint` | `suno.weirdness`; Suno omits it at the default of 50%, i.e. `0.5` |

`batch_index` gives each song's place in its generation, `0` for the first, which takes the earlier letter.

A song generated with audio inspiration, i.e. a song dragged into Suno's Audio panel as Inspo, has `metadata.task` `playlist_condition`; the clip data holds neither the inspiring song nor the Audio influence slider, so the record holds neither. An Audio influence slider set without any song in the Audio panel has no effect, and the clip shows a plain generation.

A song cropped in Suno's editor is a new clip with `metadata.type` `edit_crop`: it has its own `<id>`, title, creation time, and duration, and keeps the Styles text of the song it was cropped from in `metadata.tags`, but holds no display tags, Exclude styles, Instrumental switch, or sliders, and hides the song it was cropped from. A record of a crop takes those settings from its generation, as the Game designer gave them.

## Analyzing track contents

To analyze what a track contains, e.g. its instruments, structure, or mood, the [NVIDIA Music Flamingo demo](https://nvidia-music-flamingo.hf.space/) is a good tool: it takes an audio file and answers questions about it.
