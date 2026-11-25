# Soundtrack

The music tracks the game plays, as the [Music](../../docs/specs/design/ui/music.md#soundtrack) specification describes. Each `.opus` or `.mp3` file in [`tracks/`](tracks/) is one track, and its title is its file name without the extension, e.g. `tracks/Descent to Earth.opus` is the track titled "Descent to Earth". The record of how each track was made is in [`yaml/`](yaml/), as [Track records](#track-records) describes.

The Game designer chooses each track's name. It may be any name valid as a file name, as [Custom names](#custom-names) describes, e.g. `tracks/Unknown Contact A.mp3`, or, optionally, a name under the [Naming scheme](#naming-scheme), so that the name tells how the track was made, e.g. `tracks/S6 SCNP A.mp3`. A track not named otherwise takes its original title as its name, e.g. `tracks/Restricted Orbit.mp3`. The table lists each track with its record's `serial_id`, code, and `variant`, which keep when it was made, how it was made, and which take it is, whatever its name, as [Track records](#track-records) describes; its original title, the title its source gave it, which finds the song in the source; and its source.

Every track in the table is in the Soundtrack. A track the Game designer rejects is deleted: its audio file, its record, and its row, so that its song stays only in its source, e.g. ElevenLabs or Suno.

| File | Serial ID | Code | Variant | Original title | Source |
| --- | --: | --- | --- | --- | --- |
| `A City on Sonar.opus` | 3 | `EL-M2.5 XCOM+TFTD+NoPulse` | A | Depth Signal | ElevenLabs |
| `Approaching the Megastructure.opus` | 7 | `EL-M2.5 XCOM+Var` | B | Silent Contact | ElevenLabs |
| `Deep Space Contact A.mp3` | 33 | `S6 GeoElec+82BPMSeq+Piano&DampedCymbal+FMLead+SonarMix` | A | Deep Space Contact A | Suno v6 |
| `Deep Space Contact B.mp3` | 34 | `S6 GeoElec+82BPMSeq+Piano&DampedCymbal+FMLead+SonarMix` | B | Deep Space Contact B | Suno v6 |
| `Deployment Preparations.opus` | 5 | `EL-M2.5 XCOM+NoPulse+Geo+Ominous` | One only | Black Orbit Watch | ElevenLabs |
| `Descent to Earth.opus` | 9 | `EL-M2.5 XCOM+Var+Bare+Slow` | B | Silent Threat Protocol | ElevenLabs |
| `Inside the Command Center.opus` | 1 | `EL-M2 XCOM` | One only | Silent Contact Protocol | ElevenLabs |
| `Inside the Megastructure.opus` | 6 | `EL-M2.5 XCOM+Var` | A | Unknown Contact | ElevenLabs |
| `On the Trail of the Unknown.mp3` | 10 | `V3A-S5 SCNP` | One only | v03AI UFO 3 - Scanning Protocol | Suno v5 via v03ai |
| `Reports of the Strange.mp3` | 11 | `V3A-S5 SCNP+Dark` | One only | v03AI UFO 4 - Scanning Protocol - Dark | Suno v5 via v03ai |
| `Restricted Orbit.mp3` | 30 | `S6 XCOM+AllowEpic+NoSynth+Slow+Space` | C | Restricted Orbit | Suno v6 |
| `S6 SCNP A.mp3` | 14 | `S6 SCNP` | A | Signal Intercept var1 | Suno v6 |
| `S6 SCNP B.mp3` | 15 | `S6 SCNP` | B | Signal Intercept var2 | Suno v6 |
| `S6 SCNP+7Instr A.mp3` | 24 | `S6 SCNP+7Instr` | A | S6 SCNP+7Instr A | Suno v6 |
| `S6 SCNP+7Instr B.mp3` | 25 | `S6 SCNP+7Instr` | B | S6 SCNP+7Instr B | Suno v6 |
| `S6 SCNP+Dark+BClar&Trombone A.mp3` | 18 | `S6 SCNP+Dark+BClar&Trombone` | A | Bass clarinet + muted trombone var1 | Suno v6 |
| `S6 SCNP+Dark+BClar&Trombone B.mp3` | 19 | `S6 SCNP+Dark+BClar&Trombone` | B | Bass clarinet + muted trombone var2 | Suno v6 |
| `S6 SCNP+Dark+Cello&DBass A.mp3` | 20 | `S6 SCNP+Dark+Cello&DBass` | A | S6 SCNP+Dark+Cello&DBass A | Suno v6 |
| `S6 SCNP+Dark+Cello&DBass B.mp3` | 21 | `S6 SCNP+Dark+Cello&DBass` | B | S6 SCNP+Dark+Cello&DBass B | Suno v6 |
| `S6 SCNP+Dark+DBass&BowedCymbals A.mp3` | 22 | `S6 SCNP+Dark+DBass&BowedCymbals` | A | S6 SCNP+Dark+DBass&BowedCymbals A | Suno v6 |
| `S6 SCNP+Dark+DBass&BowedCymbals B.mp3` | 23 | `S6 SCNP+Dark+DBass&BowedCymbals` | B | S6 SCNP+Dark+DBass&BowedCymbals B | Suno v6 |
| `S6 SCNP+Dark+Piano&Cello A.mp3` | 16 | `S6 SCNP+Dark+Piano&Cello` | A | Unseen Approach var1 | Suno v6 |
| `S6 SCNP+Dark+Piano&Cello B.mp3` | 17 | `S6 SCNP+Dark+Piano&Cello` | B | Unseen Approach var2 | Suno v6 |
| `S6 XCOM+AllowEpic+NoSynth+Slow+Space A.mp3` | 28 | `S6 XCOM+AllowEpic+NoSynth+Slow+Space` | A | S6 XCOM+AllowEpic+NoSynth+Slow+Space A | Suno v6 |
| `S6 XCOM+AllowEpic+NoSynth+Slow+Space B.mp3` | 29 | `S6 XCOM+AllowEpic+NoSynth+Slow+Space` | B | S6 XCOM+AllowEpic+NoSynth+Slow+Space B | Suno v6 |
| `S6 XCOM+Var+NoMIDI+AllowHeroAggr A.mp3` | 26 | `S6 XCOM+Var+NoMIDI+AllowHeroAggr` | A | S6 XCOM+Var+NoMIDI+AllowHeroAggr A | Suno v6 |
| `S6 XCOM+Var+NoMIDI+AllowHeroAggr B.mp3` | 27 | `S6 XCOM+Var+NoMIDI+AllowHeroAggr` | B | S6 XCOM+Var+NoMIDI+AllowHeroAggr B | Suno v6 |
| `Sacrifice for Earth.opus` | 8 | `EL-M2.5 XCOM+Var+Bare+Slow` | A | Silent Hostile Sector | ElevenLabs |
| `Subterranean Facility.mp3` | 35 | `S6 VatsOfGoo` | One only | Subterranean Facility | Suno v6 |
| `Survey at Depth.opus` | 4 | `EL-M2.5 XCOM+TFTD+NoPulse` | B | Abyssal Tactical Drift | ElevenLabs |
| `The Infestation Spreads.mp3` | 12 | `V3A-S5 SCNP+Dark+Violin` | One only | v03AI UFO 5 - Scanning Protocol - Dark Violin | Suno v5 via v03ai |
| `The Reports Keep Coming.mp3` | 13 | `V3A-S5 SCNP+Dark+Cello&BClar` | One only | v03AI UFO 6 - Scanning Protocol - Cello + Bass Clarinet | Suno v5 via v03ai |
| `Undersea Operations.opus` | 2 | `EL-M2 XCOM+TFTD` | One only | Abyss Protocol | ElevenLabs |
| `Unknown Contact A.mp3` | 31 | `S6 Clandestine+ToGeo+DissFM+FaintViola&BFlute+76BPM` | A | Unknown Contact A | Suno v6 |
| `Unknown Contact B.mp3` | 32 | `S6 Clandestine+ToGeo+DissFM+FaintViola&BFlute+76BPM` | B | Unknown Contact B | Suno v6 |

## Custom names

A track with a custom name, i.e. any name not built under the [Naming scheme](#naming-scheme), e.g. `Unknown Contact A` or `Restricted Orbit`, is outside the scheme: its name has no codes or take, and gives the track no part in the take letters of the scheme's names, while its record's `meta_prompt_taxonomy` still records how it was made, and so gives it a code and a `prompt_code`, e.g. `Restricted Orbit` has the code `S6 XCOM+AllowEpic+NoSynth+Slow+Space`. A custom name may still end in a letter that tells apart the songs of one generation, e.g. `Unknown Contact A` and `Unknown Contact B`, as the Game designer chooses. It follows only the Windows rules of the scheme: it is a valid Windows file name, with none of `\ / : * ? " < > |` and no trailing space or period.

## Naming scheme

The naming scheme is optional: the Game designer uses it when a track's name should tell how the track was made. A name under the scheme tells, at a glance, how it came to be: where and with which model it was generated, which prompt stem it grew from, and each adjustment the Game designer asked for on the way to its prompt. It is built from the track's record:

```text
Source[-Model] Stem[+Adjustment…] [Take]
```

e.g. `S6 SCNP+Dark+Piano&Cello B` is the second track that Suno v6 made from the Scanning Protocol stem, made darker and given felt piano and cello.

- **Source and model:** where the song was generated and, joined by a hyphen, the model, from `source` and `model`. A source with no recorded model is its code alone, e.g. `EL`.
- **Stem:** the code of `meta_prompt_taxonomy.stem`.
- **Adjustments:** the code of each entry of `meta_prompt_taxonomy.adjustments` that has one, in order, each joined by `+`, e.g. an adjustment that only limits the prompt's length has none.
- **Take:** tells apart the tracks that would otherwise get the same name, e.g. the two variations of one generation, or two generations of the same prompt with different lengths. A track's take is the letter of its record's `variant`, given when the track is named, e.g. `S6 SCNP B`; a track that is the only one of its name when it is named gets no letter, e.g. the track first named `EL-M2 XCOM`, now `Inside the Command Center`. A take never changes: renaming or deleting another track of the same name re-letters nothing, so the letters may have gaps, e.g. `S6 SCNP+7Instr B` keeps its letter after `S6 SCNP+7Instr A` is given a custom name.
- **Renaming:** nothing keeps an old name, so every mention of a renamed track changes with it: its file and record, its record's `file`, the notes of every record, and this README.

The name without its take is the record's code, which every record has, whatever its name, as [Prompt codes](music-taxonomy.md#prompt-codes) describes.

A name under the scheme, with its take but without the extension, is at most 40 characters, and a name without a take at most 38, so that a take letter added later still fits. A name is a file name, so it must be valid on Windows: no code may contain any of `\ / : * ? " < > |`, and a name must not end in a space or a period. The codes use only letters, digits, and `-`, `.`, `&`, with `+` and spaces between them, e.g. a model is `M2.5`, never `M2:5`.

The codes, the `meta_prompt_taxonomy` entry each stands for, and the segment each gives a `prompt_code` are listed in [Prompt codes](music-taxonomy.md#prompt-codes); a new source, model, stem, or adjustment adds its code there.

## Track records

A `.yaml` file with the same name as a track records how the track was made, so that it can be told apart from the others and made again: its source and model, when it was made, the key decisions behind its prompt, the prompt and settings submitted to the source, the prompt as the source stored it, and what the source reports about it, e.g. tags and length. Every track has one, and deleting a track deletes its record. A draft record, whose first line is `# DRAFT: TODO values are filled in from the source after generation.`, records a track that is planned but not yet added: its `file` is not yet in `tracks/`, no row of the table lists it, and each value only the source can give is `TODO`. Where a record is kept tells its state:

- `yaml/`: a track's record, e.g. `yaml/Descent to Earth.yaml`.
- `yaml/drafts/`: a draft record, which moves into `yaml/` once its track is added, e.g. a draft for a third take of `S6 SCNP` is `yaml/drafts/S6 SCNP C.yaml`.

The following table lists every key a record may hold; the list is exhaustive. A record holds only the keys it has values for, except the required ones, which every record holds. Keys nested in another key are written with a dot, e.g. `suno.prompt` is the `prompt` key inside `suno`. Once written, `prompt_code` and `variant` never change, also when the track is renamed, and `serial_id` changes only when a deleted track leaves a gap to close.

| Key | Required | Value |
| --- | --- | --- |
| `file` | Yes | The track's file name in `tracks/`. |
| `source` | Yes | Where the track was made, as in the table, e.g. `ElevenLabs Music`, `Suno v5 via v03ai`, or `Suno v6`. |
| `original_title` | Yes | The track's title before any renaming: its title in its source, or the name the Game designer gave its download. |
| `source_title` | Yes | The song's title in its source now, which finds it there. It equals `original_title` until the Game designer renames the song in its source, and then changes with it, e.g. after a rename in Suno it is the title Suno shows, read from the song's clip data as [Reading Suno song data](#reading-suno-song-data) describes. |
| `serial_id` | Yes | The order in which the Game designer made the track among all tracks, from `1` with no gaps, by `created`; songs made at the same time take the order of their takes, e.g. `S6 SCNP A` is `14` and `S6 SCNP B` is `15`. Deleting a track renumbers every later one, e.g. deleting track `14` makes `15` the new `14`. A draft holds `TODO` and gets the next number when it is completed. |
| `prompt_code` | Yes | The record's code with each code spelled out, as [Prompt codes](music-taxonomy.md#prompt-codes) describes, e.g. `V03AI - Suno v5 - Scanning Protocol - Dark - Cello and Bass Clarinet`. |
| `variant` | Yes | Which take of its `prompt_code` the track is: a letter, `A`, `B`, `C` and on, or `One only` when no other record has the same `prompt_code`. A track whose name ends in a take letter has that letter, e.g. `S6 SCNP B` or `Unknown Contact B`. Every other record takes the next letter after the highest any record of its `prompt_code` holds, in the order of `created`, e.g. `Restricted Orbit` is `C` after `S6 XCOM+AllowEpic+NoSynth+Slow+Space A` and `B`; a record written later for a `prompt_code` whose record is `One only` takes `B`. No two records have the same `prompt_code` and `variant`. |
| `song_url` |  | The song's page in its source, e.g. `https://suno.com/song/<id>`. |
| `model` |  | The source's model that made the song, as the source labels it, e.g. `Music v2.5` for ElevenLabs, from the label beside the song in the ElevenLabs Music history, or `v6 (chirp-hawk)` for Suno: the version Suno shows, then its internal model name. |
| `created` | Yes | When the song was made, as a date, or a date and time in Pacific time: the time the source keeps, e.g. the exact Added time of an ElevenLabs song in the Assets page, to the second, which orders songs made in the same minute; or, where the source shows none, e.g. for most v03ai songs, the time its download was saved. |
| `tags` | Yes, except from v03ai | The source's tags for the song, as a list. v03ai reports none; the "Style:" line given to it is `v03ai.style`. |
| `length` |  | The song's length as the source reports it, as `m:ss`. |
| `instrumental` |  | `true` when the song was generated as an instrumental, with no lyrics, e.g. Suno's Instrumental switch. |
| `meta_prompt_taxonomy` | Yes | The key decisions behind the prompt, at a glance, from which a name under the [Naming scheme](#naming-scheme) is built. It lists only what is in effect in the prompt, e.g. not an instrument that a later adjustment replaced, nor a tint added and dropped again. |
| `meta_prompt_taxonomy.stem` | Yes | The idea the prompt grew from, which every track of one line of prompts shares, e.g. `Replicate "Scanning Protocol" (Chris D'Ambrosio, XCOM Legacy OST)`. |
| `meta_prompt_taxonomy.adjustments` | Yes | The adjustments that shaped the prompt from the stem, in the order the Game designer asked for them, each in a few words, as a list; `[]` when the prompt is the stem itself. A source setting is not an adjustment, since the source's key below holds it, unless the Game designer names it as one, e.g. `AllowHeroAggr`. |
| `elevenlabs`, `suno`, or `v03ai` | Yes | Everything submitted to the source to generate the song, word for word: the key of the record's source, `elevenlabs` for `ElevenLabs Music`, `suno` for `Suno v6`, and `v03ai` for `Suno v5 via v03ai`. |
| `elevenlabs.prompt` | Yes | The prompt given to ElevenLabs Music. |
| `suno.prompt` | Yes | The Styles text pasted into Suno. |
| `suno.exclude_styles` |  | Suno's Exclude styles text: what the song must not sound like. |
| `suno.weirdness` |  | Suno's Weirdness, from 0 to 1, e.g. Weirdness 40% is `0.4`. |
| `suno.style_influence` |  | Suno's Style influence, from 0 to 1, e.g. Style influence 70% is `0.7`. |
| `suno.variety` |  | Suno's Variety, as the number of its slider setting from left to right, each with its UI label and tooltip: `0` Off / Exact style, `1` Normal / Balanced variety, `2` High / Distinct styles, `3` Extra / Bold exploration, `4` Max / Unreasonably varied. At `0`, Suno keeps the Styles text as written; above it, Suno may rewrite it. |
| `suno.max_mode` |  | Suno's Max Mode, `true` when on. |
| `suno.personalize` |  | Suno's Personalize, `true` when on. |
| `suno.duration` |  | Suno's Duration, e.g. `auto`. |
| `v03ai.prompt` | Yes | The prompt given to v03ai, or the full prompt it was cut from, as the notes say. |
| `v03ai.style` |  | The comma-separated words of the "Style:" line given to v03ai, as a list. |
| `final_prompt_from_gen_tool` |  | The prompt as the source stored it, word for word, when it differs from the one submitted, e.g. Suno's Variety rewrote the Styles text, differently for each take. Without it, the source kept the submitted prompt unchanged. |
| `human_assessment` |  | The Game designer's verdict on the song after listening to it, optionally followed by why, e.g. `Great result.` |
| `notes` |  | Anything else needed to read the record, e.g. that the prompt given to the source was truncated. |

## Tracks from ElevenLabs

All the `.opus` files are from [ElevenLabs](https://elevenlabs.io/) Music, their codes start with `EL-`, and they have custom names, e.g. `Descent to Earth.opus`. A song's title in ElevenLabs is its record's `original_title`; ElevenLabs downloads it under that title with underscores for spaces, e.g. `Silent_Threat_Protocol.opus` for the song "Silent Threat Protocol", saved here first as `EL-M2.5 XCOM+Var+Bare+Slow B.opus` and now named `Descent to Earth.opus`. Their track records hold what the song's details panel in the ElevenLabs Assets page shows: the prompt, word for word, and the tags and length; their `model` comes from the ElevenLabs Music history, which labels each song with the model that made it.

## Tracks from Suno v5 via v03ai

The files whose codes start with `V3A-S5` are from Suno v5, made via [v03ai](https://v03ai.com/), which cannot export Ogg Opus, and they have custom names, e.g. `The Reports Keep Coming.mp3`. A record's `original_title` is the song's title in v03ai. v03ai appends a number to the download's file name, e.g. `v03AI UFO 3 - Scanning Protocol-1794952681178.mp3`, which is not part of the title. Their track records come from the Game designer's notes: the prompt given to v03ai, or, where ChatGPT wrote it, the full prompt ChatGPT produced. v03ai caps a Suno v5 prompt at 1,000 characters, so a longer prompt was given to it truncated.

## Tracks from Suno v6

The files named `S6 …`, and the custom-named `Restricted Orbit.mp3`, `Unknown Contact A.mp3`, `Unknown Contact B.mp3`, `Deep Space Contact A.mp3`, `Deep Space Contact B.mp3`, and `Subterranean Facility.mp3`, are from Suno v6, made directly on [suno.com](https://suno.com/), which cannot export Ogg Opus. A record's `original_title` is the song's title in Suno, e.g. "Signal Intercept var1" for `S6 SCNP A.mp3`, and its `song_url` is the song's page; a Suno song that no record names, e.g. a "(Remastered)" copy, is not a track. Their track records hold the song data Suno keeps for each song: its page, model, creation time, tags, length, Styles text, Exclude styles text, and sliders. Suno caps the Styles text at 1,000 characters, so every prompt written for Suno v6 fits within it.

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

A song generated with audio inspiration, i.e. a song dragged into Suno's Audio panel as Inspo, has `metadata.task` `playlist_condition`; the clip data holds neither the inspiring song nor the Audio influence slider, so a record gives both in `notes`, as the Game designer reports them. An Audio influence slider set without any song in the Audio panel has no effect, and the clip shows a plain generation; a record leaves the slider out and says so in `notes`.

A song cropped in Suno's editor is a new clip with `metadata.type` `edit_crop`: it has its own `<id>`, title, creation time, and duration, and keeps the Styles text of the song it was cropped from in `metadata.tags`, but holds no display tags, Exclude styles, Instrumental switch, or sliders, and hides the song it was cropped from. A record of a crop takes those settings from its generation, as the Game designer gave them, and says in `notes` that it is a crop and of which song.

## Analyzing track contents

To analyze what a track contains, e.g. its instruments, structure, or mood, the [NVIDIA Music Flamingo demo](https://nvidia-music-flamingo.hf.space/) is a good tool: it takes an audio file and answers questions about it.

Other tools that may serve the same purpose have not been tested yet: [Google AI Studio](https://aistudio.google.com/) and the [instrument detection from audio](https://unveilmusic.app/instrument-detection-from-audio) of Unveil Music.

## Proposed renames

The Game designer has proposed the renames below. Each proposed name is a custom name, as [Custom names](#custom-names) describes, and no rename is applied until the Game designer accepts it. The Song in Suno column links each song's page, its record's `song_url`, where the Game designer renames the song in Suno to its proposed name; its `original_title` then keeps the old title, and its `source_title` takes the new one.

| File | Proposed name | Song in Suno |
| --- | --- | --- |
| `S6 XCOM+Var+NoMIDI+AllowHeroAggr A.mp3` | The Alien Fleet Arrives | <https://suno.com/song/af9ac107-bfa1-47d7-817a-88e7f3336a87> |
| `Deep Space Contact A.mp3` | Signal Intelligence | <https://suno.com/song/d237fe73-8783-4528-8066-0da304f25b8a> |
| `S6 SCNP+Dark+BClar&Trombone B.mp3` | Shady Deals | <https://suno.com/song/43ac40cb-ca03-4624-92c4-58b02b4ebd80> |
| `S6 SCNP+7Instr A.mp3` | Solemn Aftermath | <https://suno.com/song/fee835a7-513a-4f47-bc06-311dd16052ca> |
| `S6 SCNP+Dark+Cello&DBass A.mp3` | The Human Toll | <https://suno.com/song/38874a24-f261-42ec-a253-faf8faa0be89> |
| `S6 XCOM+AllowEpic+NoSynth+Slow+Space B.mp3` | Countering the Threat | <https://suno.com/song/d08a8576-3b68-456a-8547-2e775decb863> |
| `S6 XCOM+Var+NoMIDI+AllowHeroAggr B.mp3` | Their Weapons in Our Hands | <https://suno.com/song/fe0b5c85-02f7-4d8e-a16f-93ab2a1a2f78> |
| `Deep Space Contact B.mp3` | Cybernetic Elites | <https://suno.com/song/251bc2cd-853c-4c56-92b5-a02ed9035dee> |
| `Restricted Orbit.mp3` | UFO Salvage Operation | <https://suno.com/song/80ccffaa-15b3-406d-a0a6-1cda627d7b68> |
| `Unknown Contact A.mp3` | In Pursuit of Shapeshifters | <https://suno.com/song/c864e73b-5123-45e6-bc3f-81e805d38922> |
| `Unknown Contact B.mp3` | Artifact Experiments | <https://suno.com/song/8698c8f6-09ac-49b9-b010-dca3a9b504c5> |
| `S6 SCNP+Dark+BClar&Trombone A.mp3` | Smuggling Artifacts | <https://suno.com/song/b6fca565-f6e6-47c9-b03a-3a04ce1f264e> |
| `S6 SCNP+7Instr B.mp3` | Containment Protocol | <https://suno.com/song/0802b4c8-ef9f-4c93-8827-541ae9bc9e89> |
| `S6 SCNP+Dark+Cello&DBass B.mp3` | What Remains | <https://suno.com/song/52086cbd-4c5b-47af-b543-ecd2af20b803> |
| `S6 XCOM+AllowEpic+NoSynth+Slow+Space A.mp3` | Assault on the Alien Facility | <https://suno.com/song/b69361c4-340c-4e8a-91cf-17c72f44b11d> |
| `S6 SCNP A.mp3` | Alien Technology | <https://suno.com/song/d4b1248f-965c-4e78-876e-75b2216fd0fc> |
| `S6 SCNP B.mp3` | Alien Lifeforms | <https://suno.com/song/725ddb4b-4f7a-442d-943a-dc903f5e9f91> |
| `S6 SCNP+Dark+Piano&Cello A.mp3` | Dark Omen | <https://suno.com/song/d21c736d-38a9-4e91-ad81-502302ff010f> |
| `S6 SCNP+Dark+Piano&Cello B.mp3` | Night Shift | <https://suno.com/song/3afb7b9b-ff21-4b88-9c8c-d9aa646f3299> |
| `S6 SCNP+Dark+DBass&BowedCymbals A.mp3` | Network Expansion | <https://suno.com/song/8f3d0acb-ceb5-4015-8289-35d51fdd1e70> |
| `S6 SCNP+Dark+DBass&BowedCymbals B.mp3` | Surface Logistics | <https://suno.com/song/f6f12491-aecd-41cb-ac57-53966a3e3f8b> |
