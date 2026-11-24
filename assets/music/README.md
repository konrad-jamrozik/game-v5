# Soundtrack

The music tracks the game plays, as the [Music](../../docs/specs/design/ui/music.md#soundtrack) specification describes. Each `.opus` or `.mp3` file in [`tracks/`](tracks/) is one track, and its title is its file name without the extension, e.g. `tracks/EL-M2.5 XCOM+Var+Bare+Slow B.opus` is the track titled "EL-M2.5 XCOM+Var+Bare+Slow B". The record of how each track was made is in [`yaml/`](yaml/), as [Track records](#track-records) describes.

The Game designer chooses each track's name. It may be any name valid as a file name, as [Custom names](#custom-names) describes, e.g. `tracks/Unknown Contact A.mp3`, or, optionally, a name under the [Naming scheme](#naming-scheme), so that the name tells how the track was made, e.g. `tracks/S6 SCNP A.mp3`. A track not named otherwise takes its original title as its name, e.g. `tracks/Restricted Orbit.mp3`. The table lists each track with its original title, the title its source gave it, which finds the song in the source; its source; and whether it is excluded from the Soundtrack.

The `excluded_tracks` of the GDR `music` in [`content/music/music_parameters.yaml`](../../content/music/music_parameters.yaml) decides which tracks are excluded, and the Excluded column mirrors it; an excluded track named under the scheme ends in its `X` number, as [Naming scheme](#naming-scheme) describes. An excluded track's audio file is not kept in this repository but in the Game designer's personal backup, outside it; its row in the table, and its track record, stay here.

| File | Original title | Source | Excluded |
| --- | --- | --- | --- |
| `Deep Space Contact A.mp3` | Deep Space Contact A | Suno v6 |  |
| `Deep Space Contact B.mp3` | Deep Space Contact B | Suno v6 |  |
| `EL-M2 XCOM.opus` | Silent Contact Protocol | ElevenLabs |  |
| `EL-M2 XCOM+TFTD X1.opus` | Subsurface Directive | ElevenLabs | Yes |
| `EL-M2 XCOM+TFTD.opus` | Abyss Protocol | ElevenLabs |  |
| `EL-M2.5 XCOM X1.opus` | Unseen Sector | ElevenLabs | Yes |
| `EL-M2.5 XCOM X2.opus` | Unseen Threat Protocol | ElevenLabs | Yes |
| `EL-M2.5 XCOM+NoPulse+Geo+Ominous.opus` | Black Orbit Watch | ElevenLabs |  |
| `EL-M2.5 XCOM+TFTD+NoPulse A.opus` | Depth Signal | ElevenLabs |  |
| `EL-M2.5 XCOM+TFTD+NoPulse B.opus` | Abyssal Tactical Drift | ElevenLabs |  |
| `EL-M2.5 XCOM+Var A.opus` | Unknown Contact | ElevenLabs |  |
| `EL-M2.5 XCOM+Var B.opus` | Silent Contact | ElevenLabs |  |
| `EL-M2.5 XCOM+Var X1.opus` | Beneath the Grid | ElevenLabs | Yes |
| `EL-M2.5 XCOM+Var+Bare+Slow A.opus` | Silent Hostile Sector | ElevenLabs |  |
| `EL-M2.5 XCOM+Var+Bare+Slow B.opus` | Silent Threat Protocol | ElevenLabs |  |
| `Restricted Orbit.mp3` | Restricted Orbit | Suno v6 |  |
| `S6 SCNP A.mp3` | Signal Intercept var1 | Suno v6 |  |
| `S6 SCNP B.mp3` | Signal Intercept var2 | Suno v6 |  |
| `S6 SCNP+7Instr A.mp3` | S6 SCNP+7Instr A | Suno v6 |  |
| `S6 SCNP+7Instr B.mp3` | S6 SCNP+7Instr B | Suno v6 |  |
| `S6 SCNP+Dark+BClar&Trombone A.mp3` | Bass clarinet + muted trombone var1 | Suno v6 |  |
| `S6 SCNP+Dark+BClar&Trombone B.mp3` | Bass clarinet + muted trombone var2 | Suno v6 |  |
| `S6 SCNP+Dark+Cello&DBass A.mp3` | S6 SCNP+Dark+Cello&DBass A | Suno v6 |  |
| `S6 SCNP+Dark+Cello&DBass B.mp3` | S6 SCNP+Dark+Cello&DBass B | Suno v6 |  |
| `S6 SCNP+Dark+DBass&BowedCymbals A.mp3` | S6 SCNP+Dark+DBass&BowedCymbals A | Suno v6 |  |
| `S6 SCNP+Dark+DBass&BowedCymbals B.mp3` | S6 SCNP+Dark+DBass&BowedCymbals B | Suno v6 |  |
| `S6 SCNP+Dark+Piano&Cello A.mp3` | Unseen Approach var1 | Suno v6 |  |
| `S6 SCNP+Dark+Piano&Cello B.mp3` | Unseen Approach var2 | Suno v6 |  |
| `S6 XCOM+AllowEpic+NoSynth+Slow+Space A.mp3` | S6 XCOM+AllowEpic+NoSynth+Slow+Space A | Suno v6 |  |
| `S6 XCOM+AllowEpic+NoSynth+Slow+Space B.mp3` | S6 XCOM+AllowEpic+NoSynth+Slow+Space B | Suno v6 |  |
| `S6 XCOM+Var+NoMIDI+AllowHeroAggr A.mp3` | S6 XCOM+Var+NoMIDI+AllowHeroAggr A | Suno v6 |  |
| `S6 XCOM+Var+NoMIDI+AllowHeroAggr B.mp3` | S6 XCOM+Var+NoMIDI+AllowHeroAggr B | Suno v6 |  |
| `Unknown Contact A.mp3` | Unknown Contact A | Suno v6 |  |
| `Unknown Contact B.mp3` | Unknown Contact B | Suno v6 |  |
| `V3A-S5 SCNP.mp3` | v03AI UFO 3 - Scanning Protocol | Suno v5 via v03ai |  |
| `V3A-S5 SCNP+Dark.mp3` | v03AI UFO 4 - Scanning Protocol - Dark | Suno v5 via v03ai |  |
| `V3A-S5 SCNP+Dark+Cello&BClar.mp3` | v03AI UFO 6 - Scanning Protocol - Cello + Bass Clarinet | Suno v5 via v03ai |  |
| `V3A-S5 SCNP+Dark+Violin.mp3` | v03AI UFO 5 - Scanning Protocol - Dark Violin | Suno v5 via v03ai |  |
| `V3A-S5 XCOM+Sections+Loop X1.mp3` | v03AI UFO 2 | Suno v5 via v03ai | Yes |
| `V3A-S5 XCOM+Var X1.mp3` | v03AI UFO 1 | Suno v5 via v03ai | Yes |

## Custom names

A track with a custom name, i.e. any name not built under the [Naming scheme](#naming-scheme), e.g. `Unknown Contact A` or `Restricted Orbit`, is outside the scheme: its name has no codes, take, or `X` number, does not change when the track is excluded, and gives the track no part in the take letters of the scheme's names, while its record's `meta_prompt_taxonomy` still records how it was made. A custom name may still end in a letter that tells apart the songs of one generation, e.g. `Unknown Contact A` and `Unknown Contact B`, as the Game designer chooses. It follows only the Windows rules of the scheme: it is a valid Windows file name, with none of `\ / : * ? " < > |` and no trailing space or period.

## Naming scheme

The naming scheme is optional: the Game designer uses it when a track's name should tell how the track was made. A name under the scheme tells, at a glance, how it came to be: where and with which model it was generated, which prompt stem it grew from, and each adjustment the Game designer asked for on the way to its prompt. It is built from the track's record:

```text
Source[-Model] Stem[+Adjustment…] [Take]
```

e.g. `EL-M2.5 XCOM+TFTD+NoPulse B` is the second track that ElevenLabs Music v2.5 made from the X-COM stem with a Terror from the Deep tint and the repeated pulse removed.

- **Source and model:** where the song was generated and, joined by a hyphen, the model, from `source` and `model`. A source with no recorded model is its code alone, e.g. `EL`.
- **Stem:** the code of `meta_prompt_taxonomy.stem`.
- **Adjustments:** the code of each entry of `meta_prompt_taxonomy.adjustments` that has one, in order, each joined by `+`. An adjustment that only limits the prompt's length, e.g. "kept short" or "fit within v03ai's 1,000 characters", has no code, since it says nothing about the music; neither has a source setting, e.g. Suno's sliders or Exclude styles, since it is not a request to the chatbot, unless the Game designer names it as an adjustment, e.g. `AllowHeroAggr` for styles taken out of the Exclude styles. Instruments asked for together form one adjustment, joined by `&`, e.g. `Piano&Cello`; when they are too many to join readably, the code is their count instead, e.g. `7Instr`. A code appears once even when two adjustments share it.
- **Take:** tells apart the tracks that would otherwise get the same name, e.g. the two variations of one generation, or two generations of the same prompt with different lengths, in the order of `created`. The tracks kept in the Soundtrack are lettered `A`, `B`, `C` and on, so the Player only ever sees an unbroken run of letters; a kept track that no other kept track shares its name with gets no letter. The excluded tracks are numbered apart, `X1`, `X2`, `X3` and on, even when alone, e.g. `EL-M2.5 XCOM+Var X1`.
- **Renaming on exclusion:** excluding a track renames it and re-letters the kept tracks of its name. E.g., of tracks `A` to `F`, excluding `C` and `E` makes them `X1` and `X2`, and `D` and `F` become `C` and `D`. Nothing keeps an old name, so every mention of a renamed track changes with it: its file and record, its record's `file`, the notes of every record, the GDR `music`, and this README.

A name under the scheme, with its take but without the extension, is at most 40 characters, and a name without a take at most 38, so that a take letter added later still fits. A name is a file name, so it must be valid on Windows: no code may contain any of `\ / : * ? " < > |`, and a name must not end in a space or a period. The codes use only letters, digits, and `-`, `.`, `&`, with `+` and spaces between them, e.g. a model is `M2.5`, never `M2:5`.

The codes are these lists; a new source, model, stem, or adjustment adds its code here, short and in CamelCase or capitals like the rest:

| Source and model | Meaning |
| --- | --- |
| `EL-M2` | ElevenLabs, Music v2 |
| `EL-M2.5` | ElevenLabs, Music v2.5 |
| `V3A-S5` | v03ai, running Suno v5 |
| `S6` | suno.com, running Suno v6; a bare model code means the song was made directly on the model's own site |

| Stem | `meta_prompt_taxonomy.stem` |
| --- | --- |
| `XCOM` | Dark 1990s sci-fi tactical strategy soundtrack in the style of the original X-COM: UFO Defense (1994), retro MIDI and Amiga synths |
| `SCNP` | Replicate "Scanning Protocol" (Chris D'Ambrosio, XCOM Legacy OST) |

| Adjustment | `meta_prompt_taxonomy.adjustments` entry |
| --- | --- |
| `Var` | more variety, less monotonous |
| `TFTD` | a tint of Cthulhu and X-COM: Terror from the Deep |
| `NoPulse` | no repeated "bum bum bum" pulse; more variety and flair |
| `Geo` | Geoscape: a global defense command screen |
| `Ominous` | more serious, ominous, dangerous; not relaxing, cozy, or lo-fi |
| `Bare` | simplified to a bare-bones prompt |
| `Slow` | slower (55–65 BPM), darker, less intense; never cheery |
| `Sections` | song-structure tags: [Intro], [Verse], [Bridge], [Outro] |
| `Loop` | steady, seamlessly loopable pacing; no builds or climaxes |
| `Dark` | darker and bassier; less electronic and spacey |
| `Violin` | instruments: violins, keeping the prompt length |
| `Cello&BClar` | instruments: cello + bass clarinet |
| `Piano&Cello` | instruments: felt piano + cello |
| `BClar&Trombone` | instruments: bass clarinet + muted trombone |
| `Cello&DBass` | instruments: cello + double bass |
| `DBass&BowedCymbals` | instruments: double bass + bowed cymbals |
| `7Instr` | instruments: felt piano + violins + cello + double bass + bass clarinet + muted trombone + bowed cymbals |
| `NoMIDI` | no retro MIDI or Amiga-era synth sound |
| `AllowHeroAggr` | allow heroic and aggressive styles: synthwave, epic orchestral, aggressive drums, and heroic brass taken out of Exclude styles |
| `AllowEpic` | allow epic styles: choir, synthwave, epic orchestral, aggressive drums, and heroic brass taken out of Exclude styles |
| `NoSynth` | no synth sounds or drones |
| `Space` | a modern, cold space and high-tech atmosphere instead of military |

## Track records

A `.yaml` file in `yaml/` with the same name as a track, e.g. `yaml/EL-M2.5 XCOM+Var+Bare+Slow B.yaml`, records how the track was made, so that it can be told apart from the others and made again: its source and model, when it was made, the key decisions behind its prompt, the prompt and settings submitted to the source, the prompt as the source stored it, and what the source reports about it, e.g. tags and length. Every track has one, including each excluded track, whose record stays here after its audio is removed. A draft record, whose first line is `# DRAFT: TODO values are filled in from the source after generation.`, records a track that is planned but not yet added: its `file` is not yet in `tracks/`, no row of the table lists it, and each value only the source can give is `TODO`.

The following table lists every key a record may hold; the list is exhaustive. A record holds only the keys it has values for, except the required ones, which every record holds. Keys nested in another key are written with a dot, e.g. `suno.prompt` is the `prompt` key inside `suno`.

| Key | Required | Value |
| --- | --- | --- |
| `file` | Yes | The track's file name in `tracks/`. |
| `source` | Yes | Where the track was made, as in the table, e.g. `ElevenLabs Music`, `Suno v5 via v03ai`, or `Suno v6`. |
| `original_title` | Yes | The track's title before any renaming: its title in its source, or the name the Game designer gave its download. |
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
| `human_assessment` |  | The Game designer's verdict on the song after listening to it, e.g. `rejected`, optionally followed by why, e.g. `rejected, too irritating MIDI sounds`. Every excluded track's record has one. |
| `notes` |  | Anything else needed to read the record, e.g. that the prompt given to the source was truncated. |

## Tracks from ElevenLabs

All the `.opus` files are from [ElevenLabs](https://elevenlabs.io/) Music, named `EL-…` under the naming scheme. A song's title in ElevenLabs is its record's `original_title`; ElevenLabs downloads it under that title with underscores for spaces, e.g. `Silent_Threat_Protocol.opus` for the song "Silent Threat Protocol", saved here as `EL-M2.5 XCOM+Var+Bare+Slow B.opus`. Their track records hold what the song's details panel in the ElevenLabs Assets page shows: the prompt, word for word, and the tags and length; their `model` comes from the ElevenLabs Music history, which labels each song with the model that made it.

## Tracks from Suno v5 via v03ai

The files named `V3A-S5 …` are from Suno v5, made via [v03ai](https://v03ai.com/), which cannot export Ogg Opus. A record's `original_title` is the song's title in v03ai, except for the first two songs: by mistake, both are titled "UFO 1" in v03ai, so their `original_title` is the name the Game designer gave their downloads, "v03AI UFO 1" and "v03AI UFO 2". v03ai appends a number to the download's file name, e.g. `v03AI UFO 3 - Scanning Protocol-1794952681178.mp3`, which is not part of the title. Their track records come from the Game designer's notes: the prompt given to v03ai, or, where ChatGPT wrote it, the full prompt ChatGPT produced. v03ai caps a Suno v5 prompt at 1,000 characters, so a longer prompt was given to it truncated.

## Tracks from Suno v6

The files named `S6 …`, and the custom-named `Restricted Orbit.mp3`, `Unknown Contact A.mp3`, `Unknown Contact B.mp3`, `Deep Space Contact A.mp3`, and `Deep Space Contact B.mp3`, are from Suno v6, made directly on [suno.com](https://suno.com/), which cannot export Ogg Opus. A record's `original_title` is the song's title in Suno, e.g. "Signal Intercept var1" for `S6 SCNP A.mp3`, and its `song_url` is the song's page; a Suno song that no record names, e.g. a "(Remastered)" copy, is not a track. Their track records hold the song data Suno keeps for each song: its page, model, creation time, tags, length, Styles text, Exclude styles text, and sliders. Suno caps the Styles text at 1,000 characters, so every prompt written for Suno v6 fits within it.

### Reading Suno song data

A song's `<id>` is in its song link, e.g. `https://suno.com/song/<id>`. When the Game designer sends no link, the MP3 Suno downloads holds it: its ID3 tags hold the link, as the `WOAS` frame, and a comment `made with suno; created=<UTC time>; id=<id>`, which a look at the file's printable text in its first few kilobytes shows, e.g. `head -c 6000 <file> | tr -c '[:print:]' '\n' | grep suno`.

A Suno song page renders its data in the browser, so a web fetch of the page shows none of it. Its data is instead the clip's JSON from `https://studio-api.prod.suno.com/api/clip/<id>`, which needs no sign-in, e.g. `curl -s -o clip.json "https://studio-api.prod.suno.com/api/clip/<id>"`. A record takes from it:

| Clip JSON field | Record key |
| --- | --- |
| `title` | `original_title`, which must match the take's name |
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

The Game designer has proposed the renames below. Each proposed name is a custom name, as [Custom names](#custom-names) describes, and no rename is applied until the Game designer accepts it.

| File                                     | Proposed name       |
| ---------------------------------------- | ------------------- |
| `S6 XCOM+Var+NoMIDI+AllowHeroAggr A.mp3` | Alien fleet arrives |
| `Deep Space Contact A.mp3`               | Signal Intelligence |
