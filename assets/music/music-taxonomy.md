# Game-v5 music prompt taxonomy

Every track record in [`yaml/`](yaml/), including the rejected and draft records in its `rejected/` and `drafts/` subfolders, describes its prompt by `meta_prompt_taxonomy`, as the [music README](README.md#track-records) describes. [Prompt codes](#prompt-codes) maps each source, stem, and adjustment of it to a short code and to a spelled-out segment, from which each record's code and `prompt_code` are built. [Analysis as of 2026-11-23](#analysis-as-of-2026-11-23) reviews the prompts as they stood on that date.

## Prompt codes

A record's **code** is its source-and-model code, then the code of its `meta_prompt_taxonomy.stem`, then the code of each entry of `meta_prompt_taxonomy.adjustments` in their order, the stem and the adjustments joined by `+`, e.g. `S6 SCNP+Dark+Cello&DBass`. An adjustment with no code adds nothing, and a code appears once even when two adjustments share it. A track named under the [Naming scheme](README.md#naming-scheme) is named by its code and take; a track with a custom name has a code all the same, e.g. `Restricted Orbit` has the code `S6 XCOM+AllowEpic+NoSynth+Slow+Space`.

A record's **`prompt_code`** is its code with each code replaced by its segment and the parts joined by `-` with a space on each side, e.g. the code `V3A-S5 SCNP+Dark+Cello&BClar` gives the prompt code `V03AI - Suno v5 - Scanning Protocol - Dark - Cello and Bass Clarinet`. A prompt code has no length limit, so a segment never abbreviates.

Each entry below is word for word as the records hold it, and every entry of every record appears in exactly one row. A new source, model, stem, or adjustment adds its row here, with a code short and in CamelCase or capitals like the rest, and a segment in Title Case.

### Sources and models

| Code | Source and model | Segment |
| --- | --- | --- |
| `EL-M2` | ElevenLabs, Music v2 | ElevenLabs Music v2 |
| `EL-M2.5` | ElevenLabs, Music v2.5 | ElevenLabs Music v2.5 |
| `V3A-S5` | v03ai, running Suno v5 | V03AI - Suno v5 |
| `S6` | suno.com, running Suno v6; a bare model code means the song was made directly on the model's own site | Suno v6 |

### Stems

| Code | `meta_prompt_taxonomy.stem` | Segment |
| --- | --- | --- |
| `XCOM` | Dark 1990s sci-fi tactical strategy soundtrack in the style of the original X-COM: UFO Defense (1994), retro MIDI and Amiga synths | X-COM |
| `SCNP` | Replicate "Scanning Protocol" (Chris D'Ambrosio, XCOM Legacy OST) | Scanning Protocol |
| `Clandestine` | Dark, grounded soundtrack for a modern clandestine strategy game | Clandestine Strategy |
| `GeoElec` | Cold, ominous electronic strategy-game soundtrack inspired by the original X-COM Geoscape | X-COM Geoscape Electronics |

### Adjustments

| Code | `meta_prompt_taxonomy.adjustments` entry | Segment |
| --- | --- | --- |
| `Var` | more variety, less monotonous | Variety |
| `TFTD` | a tint of Cthulhu and X-COM: Terror from the Deep | Terror from the Deep |
| `NoPulse` | no repeated "bum bum bum" pulse; more variety and flair | No Pulse |
| `Geo` | Geoscape: a global defense command screen | Geoscape |
| `Ominous` | more serious, ominous, dangerous; not relaxing, cozy, or lo-fi | Ominous |
| `Bare` | simplified to a bare-bones prompt | Bare-bones |
| `Slow` | slower (55–65 BPM), darker, less intense; never cheery | Slow |
| `Sections` | song-structure tags: [Intro], [Verse], [Bridge], [Outro] | Song Sections |
| `Loop` | steady, seamlessly loopable pacing; no builds or climaxes | Loopable |
| `Dark` | darker and bassier; less electronic and spacey | Dark |
| `Violin` | instruments: violins, keeping the prompt length | Violin |
| `Cello&BClar` | instruments: cello + bass clarinet | Cello and Bass Clarinet |
| `Piano&Cello` | instruments: felt piano + cello | Felt Piano and Cello |
| `BClar&Trombone` | instruments: bass clarinet + muted trombone | Bass Clarinet and Muted Trombone |
| `Cello&DBass` | instruments: cello + double bass | Cello and Double Bass |
| `DBass&BowedCymbals` | instruments: double bass + bowed cymbals | Double Bass and Bowed Cymbals |
| `7Instr` | instruments: felt piano + violins + cello + double bass + bass clarinet + muted trombone + bowed cymbals | Felt Piano, Violins, Cello, Double Bass, Bass Clarinet, Muted Trombone and Bowed Cymbals |
| `NoMIDI` | no retro MIDI or Amiga-era synth sound | No MIDI |
| `AllowHeroAggr` | allow heroic and aggressive styles: synthwave, epic orchestral, aggressive drums, and heroic brass taken out of Exclude styles | Allow Heroic and Aggressive |
| `AllowEpic` | allow epic styles: choir, synthwave, epic orchestral, aggressive drums, and heroic brass taken out of Exclude styles | Allow Epic |
| `NoSynth` | no synth sounds or drones | No Synth |
| `Space` | a modern, cold space and high-tech atmosphere instead of military | Space |
| `ModMil` | modern military; no 1990s aesthetic | Modern Military |
| `NoDrones` | no ambient drones or eerie high electronic tones | No Drones |
| `ToGeo` | shift toward cold, ominous X-COM Geoscape electronics | Toward X-COM Geoscape |
| `DissFM` | lead with dissonant FM synth motifs, alien electronic grain, and irregular sequencer accents | Dissonant FM Motifs |
| `FaintViola&BFlute` | reduce pizzicato viola and bass flute to occasional background accents | Faint Pizzicato Viola and Bass Flute |
| `76BPM` | quiet forward motion at around 76 BPM | 76 BPM |
| `82BPMSeq` | quiet forward motion at around 82 BPM with irregular sequencer phrases | Irregular Sequencer at 82 BPM |
| `Piano&DampedCymbal` | instruments: close-miked felt piano + lightly tapped, immediately damped cymbal | Felt Piano and Damped Cymbal |
| `FMLead` | rounded FM lead over a faint, intermittent synth bed | Rounded FM Lead |
| `SonarMix` | clean, spacious deep-space mix with sonar pings, detuned signals, and deliberate silence | Deep-Space Mix with Sonar Pings |

An adjustment that only limits the prompt's length says nothing about the music, so it has no code and adds nothing to a code or a prompt code: `kept short`, `shortened for Suno v5 via v03ai`, and `fit within v03ai's 1,000 characters`. A source setting, e.g. Suno's sliders or Exclude styles, has no code either, since it is not a request to the chatbot, unless the Game designer names it as an adjustment, e.g. `AllowHeroAggr` for styles taken out of the Exclude styles. Instruments asked for together form one adjustment, joined by `&`, e.g. `Piano&Cello`; when they are too many to join readably, the code is their count instead, e.g. `7Instr`, while the segment still names each of them.

## Analysis as of 2026-11-23

The analysis below reviews the records as they stood on 2026-11-23 and is not kept up to date; it predates, e.g., `Unknown Contact` and `Deep Space Contact`, and names records by their file names of that date.

Reviewed all **39 YAML records**, including **3 drafts**, under `assets/music/yaml` in the local game-v5 clone. There are **22 distinct recorded input prompt texts** after normalizing whitespace, plus **9 recorded Suno rewrites**. The counts below use YAML records unless stated otherwise. A/B takes can share an input and differ in generation settings, stored text or outcome.

### Prompt stems

| Stem recorded in YAML | Records | Branches |
| --- | --: | --- |
| Original X-COM: UFO Defense (1994) | 22 | Retro MIDI/Amiga electronic soundtrack, deep-ocean cosmic horror, Geoscape, pulse and repetition experiments, modern military, and cold orbital ambience |
| “Scanning Protocol” by Chris D’Ambrosio, XCOM Legacy OST | 17 | Electronic surveillance ambience, darker/bassier versions, acoustic pairings, and a seven-instrument hybrid |

### Taxonomy

| Dimension | What appears in the prompts |
| --- | --- |
| **Mood** | Dark, brooding, ominous, sinister, eerie, menacing, oppressive, claustrophobic, unsettling, cold, serious, disciplined, hypnotic, cerebral, quietly suspenseful, melancholic, mournful, intimate. Emotional cues include paranoia, secrecy, isolation, dread, mystery, vigilance and fear of the unknown. Common exclusions include cheerfulness, comfort, warmth, optimism and relaxation. |
| **Setting and imagery** | Prolonged tactical/strategic gameplay, Geoscape/global defense command, covert military surveillance, alien signal analysis, unseen extraterrestrial threat, subterranean spaces, Lovecraftian deep ocean with submerged ruins and dormant entities, modern military command, and a high-tech orbital command center tracking alien craft. |
| **Era and production** | 1990s DOS/PC game sound, MIDI, Amiga-era synths, Sound Blaster FM, vintage digital and limited polyphony, retro-futurist electronic ambience, organic acoustic recording aesthetic, contemporary orchestral and high-tech sci-fi. Mix choices include slightly lo-fi digital, grainy or narrow/tape hiss, thick resonant low-end, and wide/deep reverberation. |
| **Tempo** | Slow to moderate, slow, very slow, unhurried half-time, free time, 55–65 BPM, around 65 BPM, and 55–70 BPM. |
| **Rhythmic motion** | Subtle sequenced or hypnotic bass pulses, restrained 65 BPM pulse, irregular electronic accents, occasional percussion, uneven ostinato, pulse-free drift, or passages without percussion. Some branches exclude persistent pulses, two-note ostinatos, four-on-the-floor, constant ticking, mechanical patterns and driving beats. Orbital branches deliberately use precise ticking. |
| **Density and space** | Minimalist, sparse instrumentation, deliberate silences, near-silence, ample negative space, isolated notes, staggered entrances, occasional slightly richer passages. |
| **Dynamics and intensity** | Subdued, restrained, consistent low intensity, occasional tension increases, brief dissonant events, no dramatic crescendo, builds, climax, drops or jump scares. Epic/heroic colors are permitted in certain exclusion lists. Brief or restrained swells are used tactically. |
| **Register and texture** | Deep rumble, bass-heavy/low-register weight, long sustains, synth or acoustic drones, hollow tones, glassy/ethereal edges, breathiness, woody/gritty acoustic texture, distant metallic resonances, high electronic signals, sonar-like pings, faint radio static and alien timbres. |
| **Harmony** | Minor-key harmony, sustained dissonant chords, clusters, unresolved progressions, minor seconds, tritones, descending chromatic intervals, subtle or unexpected harmonic shifts. |
| **Melody and development** | Sparse, haunting and memorable motifs, short phrases, restrained melody, counter-melodies, expressive phrasing, evolving textures, instruments entering and receding, recurring motifs in altered forms, and alternating sparse and fuller passages. One treatment asks for minimal melody. |
| **Form and gameplay function** | Instrumental background music for long sessions, unobtrusive evolution, gentle transitions, seamless looping and consistent dynamics. One prompt scripts [Intro], [Verse], [Bridge], [Verse], [Outro] with the opening sound returning at the end. A deep-sea branch requests an unresolved conclusion. |
| **Prompt construction** | Bare-bones or kept short, fitting a 1,000-character cap, preserving length when adding violins, hand-cutting phrases, and experimenting with Suno Variety rewrites. |

**“Minimal” has three concrete meanings here.** Minimalist or sparse describes the number of layers and how much silence they leave. Minimal percussion describes rhythmic density. Consistent low intensity describes the size of dynamic changes. Tempo, pulse, density and intensity each have their own controls in the taxonomy.

### Instruments and sound sources

| Family | Named instruments, treatments and roles |
| --- | --- |
| **Strings** | Violin(s), mournful cello, bowed double bass/contrabass, low strings. Techniques include glassy harmonics, low staccato strings, sustained bowed notes, and cello/double-bass ostinatos. |
| **Keys** | Muted felt piano with soft, isolated notes. Soft piano is expressly excluded in the Geoscape branch. |
| **Woodwind** | Bass clarinet, usually hollow, breathy and low-register, used for sparse replies or uneasy motifs. |
| **Brass** | Muted trombone and unspecified muted brass, low notes and restrained swells. Heroic brass is excluded in some branches and removed from the exclusions in others. |
| **Percussion and resonant metal** | Bowed cymbals, bowed metal, metallic impacts/resonances, sparse metallic percussion, military snare and taiko. Bowed cymbals are specified as distant groans or swells, with crashes and rhythmic cymbal patterns excluded in that branch. The modern military draft calls for tight snare rolls. The orbital branch makes the snare distant and sparse. |
| **Electronic sound sources** | Amiga-style and digital synths, Sound Blaster/dark FM, retro-futurist synths, analog synth pulses in a stored rewrite, synth pads, dissonant synth chords and occasional high electronic tones. MIDI is part of the period aesthetic. |
| **Sound design** | Bass drones, low-frequency rumble, sonar-like pings, faint radio static, console-like ticks, alien tones and textures, abyssal and muffled resonances. Acoustic double bass also supplies drone-like sustain. |
| **Exclusions and permissions** | Guitars, vocals/singing, choir, drum kit, cymbal crashes, aggressive drums, heroic brass, bright synth leads and synthesizer appear in exclusion language depending on the branch. Choir comes off the exclusion list in AllowEpic variants. Those records still specify instrumental. |

The **seven deliberate instrument additions** in `meta_prompt_taxonomy.adjustments` are listed below. Counts include repeated takes and the cymbal draft.

| Instrument addition                                                                         | Records |
| ------------------------------------------------------------------------------------------- | ------: |
| Felt piano, violins, cello, bowed double bass, bass clarinet, muted trombone, bowed cymbals |       2 |
| Bass clarinet + muted trombone                                                              |       2 |
| Cello + bowed double bass                                                                   |       2 |
| Bowed double bass + bowed cymbals                                                           |       3 |
| Felt piano + cello                                                                          |       2 |
| Cello + bass clarinet                                                                       |       1 |
| Violin(s)                                                                                   |       1 |

### What the adjustment names bundle together

| Adjustment | What changed in this corpus |
| --- | --- |
| **Dark** | Twelve records explicitly ask for darker and bassier, less electronic and spacey. The prompts combine heavier bass, organic/gritty texture, claustrophobia and very slow pacing. Several retain drones and slow pulses. |
| **Var / NoPulse** | Eight records label “more variety, less monotonous.” Three use the explicit “no repeated pulse” adjustment. Var often varies motifs, harmony or textures while retaining occasional pulse. NoPulse targets a continuous rhythmic foundation and uses stillness or irregular accents. |
| **Slow / Bare** | Five carry the combined slower/darker/less intense adjustment. Two explicitly shorten to a bare-bones prompt. The orbital inputs specify around 65 BPM. The compressed loop experiment separately uses 55–70 BPM. |
| **NoMIDI / NoDrones / NoSynth** | NoMIDI removes the explicit MIDI/Amiga timbre. NoDrones cuts ambient drones and high tones from one draft. NoSynth replaces the synth palette with acoustic/orchestral sources and excludes synthesizer. Orbital NoSynth retains sonar/static effects. |
| **TFTD / Geo / ModMil / Space** | Four add Terror from the Deep and Lovecraftian color. Geo uses a global command perspective. ModMil uses staccato strings, snare and taiko. Space trades close military percussion for weightless strings, sonar/static, distant snare and a wide mix. |
| **AllowEpic / AllowHeroAggr** | Five records remove choir, synthwave, epic orchestral, aggressive drums and heroic brass from Exclude Styles. Two use the corresponding heroic/aggressive adjustment and keep choir excluded. These are permissions in the form, while the prose frequently still prioritizes psychological tension. |

### Other metadata that affects interpretation

- **Input versus stored prompt.** The nine Suno rewrites include the seven-instrument half-time and pulse-free variants, two very slow felt piano/cello rewrites, two orbital A/B rewrites, the Restricted Orbit rewrite and two NoMIDI rewrites. Those last two add analog synth pulses/uneven ostinato or free-time drones/tape hiss. The orbital B rewrite was reused verbatim as Restricted Orbit’s input. Restricted Orbit also used orbital B audio inspiration at 25% influence, per its notes.
- **Exclude Styles.** All 18 populated Suno lists exclude vocals, singing, EDM, upbeat, trailer music, rock, pop and bright melodies. Branch additions include choir, synthwave, epic orchestral, aggressive drums, heroic brass, jazz swing, big band, cymbal crashes, drum kit, industrial beats, risers, impacts, synthesizer, electronic, chiptune, 8-bit, retro, lo-fi, military march and fast tempo.
- **v03ai style labels.** Dark ambient, sci-fi electronica, cinematic synth, minimal electronic, atmospheric, ominous, bass-heavy, minimalist, brooding, industrial, cinematic, acoustic textures, electronic, synth and ambient.
- **Track tags.** Electronic, ambient, soundtrack, science-fiction/sci-fi, instrumental, sparse, retro-futuristic, dark ambient, tactical strategy, minimalist, dark, brooding, intimate, hypnotic, atmospheric, cinematic and lo-fi.
- **Generation provenance and controls.** Thirteen ElevenLabs Music v2/v2.5, twenty Suno v6 and six Suno v5 via v03ai records. Recorded Suno controls span Weirdness 30–50%, Style Influence 50% or 70%, Variety 0–3, and where supplied, Max Mode off, Personalize off and Duration Auto. The variety-3 record is a draft. File/title, song URL, date, model, duration and notes establish provenance. Three ElevenLabs records share an input that ends mid-sentence. The v03ai notes report truncation in all six records, including four where the YAML preserves the full draft text.
- **Human assessments.** Six records explicitly mark rejection. Three cite monotonous pulsing, one of those also cites excessive speed. One cites a loud, long synth-pad drone. Two cite irritating MIDI sounds. The orbital A notes report earlier modern military attempts sounding too fast and too generic military. These are observations from the metadata.

### Index of all input prompts

Identical recorded prompt text is grouped even when the track, settings, exclusions, or stored rewrite differ.

| Files | Prompt directions |
| --- | --- |
| `EL-M2 XCOM.yaml`<br>`EL-M2.5 XCOM X1.yaml`<br>`EL-M2.5 XCOM X2.yaml` | Original retro electronic formulation. Low drones, metallic percussion, subtle bass pulses, slow to moderate. Stored ending truncated. |
| `EL-M2 XCOM+TFTD X1.yaml`<br>`EL-M2 XCOM+TFTD.yaml` | Adds X-COM: Terror from the Deep and Lovecraftian imagery, Sound Blaster FM, sonar, muffled resonances and abyssal drones. Retains a subtle pulse and adds seamless looping. |
| `EL-M2.5 XCOM+NoPulse+Geo+Ominous.yaml` | Geoscape, stronger menace, 55–65 BPM, DOS FM, minor seconds, tritones and chromatic descent. Bans persistent pulse and ticking. Retains a slightly lo-fi period timbre while avoiding cozy lo-fi. |
| `EL-M2.5 XCOM+TFTD+NoPulse A.yaml`<br>`EL-M2.5 XCOM+TFTD+NoPulse B.yaml` | Deep-sea branch with no continuous pulse. Evolving motifs, counter-melodies, changed instrumentation and percussionless passages. Unresolved conclusion. |
| `EL-M2.5 XCOM+Var A.yaml`<br>`EL-M2.5 XCOM+Var B.yaml`<br>`EL-M2.5 XCOM+Var X1.yaml` | More development through melodic variation, texture, harmony and rhythm. A subtle pulse remains possible. Sparse and fuller passages alternate without intensity jumps. |
| `EL-M2.5 XCOM+Var+Bare+Slow A.yaml`<br>`EL-M2.5 XCOM+Var+Bare+Slow B.yaml` | Shortened formulation at 55–65 BPM with sparse instrumentation, subdued dynamics, restrained intensity and gradual variation. |
| `Restricted Orbit.yaml` | Uses the orbital B rewrite as its input, with B as Suno audio inspiration at 25% influence. 65 BPM, low strings, bowed metal, muted brass, sonar/static and sparse ticking/snare. |
| `S6 SCNP A.yaml`<br>`S6 SCNP B.yaml`<br>`V3A-S5 SCNP.yaml` | Scanning Protocol baseline. Slow electronic surveillance cue with deep synth pads, high signals, subtle pulse, sparse percussion and seamless looping. The v03ai submission was slightly truncated. |
| `S6 SCNP+7Instr A.yaml`<br>`S6 SCNP+7Instr B.yaml` | Scanning Protocol electronics with seven acoustic colors. Instruments enter in turn. A rewrite specifies suspended half-time, while B specifies pulse-free ambient drift. |
| `S6 SCNP+Dark+BClar&Trombone A.yaml`<br>`S6 SCNP+Dark+BClar&Trombone B.yaml` | Dark, bass-heavy and grounded. Breathy bass clarinet and muted trombone over slow bass pulses and drones. Big band, jazz swing and heroic brass excluded. |
| `S6 SCNP+Dark+Cello&DBass A.yaml`<br>`S6 SCNP+Dark+Cello&DBass B.yaml` | Mournful cello over bowed double bass. Very slow, woody sustain, ample silence and minimal ostinato. Consistent texture and dynamics for looping. |
| `S6 SCNP+Dark+DBass&BowedCymbals A.yaml`<br>`S6 SCNP+Dark+DBass&BowedCymbals B.yaml`<br>`S6 SCNP+Dark+DBass&BowedCymbals C.yaml` (draft) | Bowed double bass with near-inaudible bowed cymbal resonances. Very slow, oppressive and sparse. No cymbal crashes, driving beat or climaxes. C varies the model settings. |
| `S6 SCNP+Dark+Piano&Cello A.yaml`<br>`S6 SCNP+Dark+Piano&Cello B.yaml` | Muted felt piano and mournful cello over slow bass pulses and low rumble. Rewrites retain intimate production, low register and very slow pulse. |
| `S6 XCOM+AllowEpic+NoSynth+ModMil.yaml` (draft) | Contemporary military orchestration. Staccato low strings, cello/bass ostinatos, muted brass, tight snare rolls and taiko. Slow to moderate. Synth/electronic and retro styles excluded. |
| `S6 XCOM+AllowEpic+NoSynth+Slow+Space A.yaml`<br>`S6 XCOM+AllowEpic+NoSynth+Slow+Space B.yaml` | Orbital command instead of close military perspective. About 65 BPM, glassy harmonics, bowed metal, low strings, muted brass, sonar, radio static and distant snare. A and B store different rewrites. |
| `S6 XCOM+NoMIDI+NoDrones+AllowEpic.yaml` (draft) | Retro MIDI/Amiga language and drone/high-tone language cut while dissonant synth chords, alien electronic textures and bass pulses remain. Several epic exclusions lifted. |
| `S6 XCOM+Var+NoMIDI+AllowHeroAggr A.yaml`<br>`S6 XCOM+Var+NoMIDI+AllowHeroAggr B.yaml` | Electronic PC-era direction with MIDI/Amiga language removed and heroic/aggressive exclusions lifted. A rewrite adds an uneven ostinato and analog pulses. B uses free-time drift and restrained tape hiss. |
| `V3A-S5 SCNP+Dark.yaml` | Dark, bass-heavy and grounded treatment without a named acoustic instrument. Deep drones and slow hypnotic bass pulse. |
| `V3A-S5 SCNP+Dark+Cello&BClar.yaml` | Dark treatment with bowed cello and breathy low-register bass clarinet. Cinematic/acoustic style labels. |
| `V3A-S5 SCNP+Dark+Violin.yaml` | Dark treatment with melancholy violin, sustained low strings and restrained melody. Instrument added within the existing prompt length. |
| `V3A-S5 XCOM+Sections+Loop X1.yaml` | 55–70 BPM with Intro/Verse/Bridge/Verse/Outro structure and an outro that returns to the opening harmony and drone. Submitted text truncated. |
| `V3A-S5 XCOM+Var X1.yaml` | Variability branch submitted through v03ai with the original retro MIDI/Amiga palette, drones and subtle bass pulses. Submitted text truncated. |
