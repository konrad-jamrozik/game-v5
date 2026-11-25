# Game-v5 music prompt taxonomy

Every track record in [`yaml/`](yaml/), including any draft record in its `drafts/` subfolder, describes its prompt by `meta_prompt_taxonomy`, as the [music README](README.md#track-records) describes. [Prompt codes](#prompt-codes) maps each source, stem, and adjustment of it to a segment, from which each record's `prompt_code` is built. [Analysis](#analysis) reviews the prompts of the current records.

## Prompt codes

A record's **`prompt_code`** is the segment of its source and model, then the segment of its `meta_prompt_taxonomy.stem`, then the segment of each entry of `meta_prompt_taxonomy.adjustments` in their order, all joined by `-` with a space on each side, e.g. `V03AI - Suno v5 - Scanning Protocol - Dark - Cello and Bass Clarinet`. An adjustment with no segment adds nothing, and a segment appears once even when two adjustments share it. A prompt code has no length limit, so a segment never abbreviates.

Each entry below is word for word as the records hold it, and every entry of every record appears in exactly one row. A new source, model, stem, or adjustment adds its row here, with a segment in Title Case.

### Sources and models

| Source and model          | Segment               |
| ------------------------- | --------------------- |
| ElevenLabs, Music v2      | ElevenLabs Music v2   |
| ElevenLabs, Music v2.5    | ElevenLabs Music v2.5 |
| v03ai, running Suno v5    | V03AI - Suno v5       |
| suno.com, running Suno v6 | Suno v6               |

### Stems

| `meta_prompt_taxonomy.stem` | Segment |
| --- | --- |
| Dark 1990s sci-fi tactical strategy soundtrack in the style of the original X-COM: UFO Defense (1994), retro MIDI and Amiga synths | X-COM |
| Replicate "Scanning Protocol" (Chris D'Ambrosio, XCOM Legacy OST) | Scanning Protocol |
| Dark, grounded soundtrack for a modern clandestine strategy game | Clandestine Strategy |
| Cold, ominous electronic strategy-game soundtrack inspired by the original X-COM Geoscape | X-COM Geoscape Electronics |
| Fallout 1 Soundtrack - Vats of Goo (Mariposa Base) | Fallout 1 Soundtrack - Vats of Goo (Mariposa Base) |

### Adjustments

| `meta_prompt_taxonomy.adjustments` entry | Segment |
| --- | --- |
| more variety, less monotonous | Variety |
| a tint of Cthulhu and X-COM: Terror from the Deep | Terror from the Deep |
| no repeated "bum bum bum" pulse; more variety and flair | No Pulse |
| Geoscape: a global defense command screen | Geoscape |
| more serious, ominous, dangerous; not relaxing, cozy, or lo-fi | Ominous |
| simplified to a bare-bones prompt | Bare-bones |
| slower (55–65 BPM), darker, less intense; never cheery | Slow |
| song-structure tags: [Intro], [Verse], [Bridge], [Outro] | Song Sections |
| steady, seamlessly loopable pacing; no builds or climaxes | Loopable |
| darker and bassier; less electronic and spacey | Dark |
| instruments: violins, keeping the prompt length | Violin |
| instruments: cello + bass clarinet | Cello and Bass Clarinet |
| instruments: felt piano + cello | Felt Piano and Cello |
| instruments: bass clarinet + muted trombone | Bass Clarinet and Muted Trombone |
| instruments: cello + double bass | Cello and Double Bass |
| instruments: double bass + bowed cymbals | Double Bass and Bowed Cymbals |
| instruments: felt piano + violins + cello + double bass + bass clarinet + muted trombone + bowed cymbals | Felt Piano, Violins, Cello, Double Bass, Bass Clarinet, Muted Trombone and Bowed Cymbals |
| no retro MIDI or Amiga-era synth sound | No MIDI |
| allow heroic and aggressive styles: synthwave, epic orchestral, aggressive drums, and heroic brass taken out of Exclude styles | Allow Heroic and Aggressive |
| allow epic styles: choir, synthwave, epic orchestral, aggressive drums, and heroic brass taken out of Exclude styles | Allow Epic |
| no synth sounds or drones | No Synth |
| a modern, cold space and high-tech atmosphere instead of military | Space |
| modern military; no 1990s aesthetic | Modern Military |
| no ambient drones or eerie high electronic tones | No Drones |
| shift toward cold, ominous X-COM Geoscape electronics | Toward X-COM Geoscape |
| lead with dissonant FM synth motifs, alien electronic grain, and irregular sequencer accents | Dissonant FM Motifs |
| reduce pizzicato viola and bass flute to occasional background accents | Faint Pizzicato Viola and Bass Flute |
| quiet forward motion at around 76 BPM | 76 BPM |
| quiet forward motion at around 82 BPM with irregular sequencer phrases | Irregular Sequencer at 82 BPM |
| instruments: close-miked felt piano + lightly tapped, immediately damped cymbal | Felt Piano and Damped Cymbal |
| rounded FM lead over a faint, intermittent synth bed | Rounded FM Lead |
| clean, spacious deep-space mix with sonar pings, detuned signals, and deliberate silence | Deep-Space Mix with Sonar Pings |

An adjustment that only limits the prompt's length says nothing about the music, so it has no segment and adds nothing to a prompt code: `kept short`, `shortened for Suno v5 via v03ai`, and `fit within v03ai's 1,000 characters`. A source setting, e.g. Suno's sliders or Exclude styles, has no segment either, since it is not a request to the chatbot, unless the Game designer names it as an adjustment, e.g. Allow Heroic and Aggressive for styles taken out of the Exclude styles. Instruments asked for together form one adjustment, and its segment names each of them, e.g. Felt Piano and Cello.

Some rows are kept for future prompts although no current record uses them. So far Song Sections, Loopable, `shortened for Suno v5 via v03ai`, and `fit within v03ai's 1,000 characters` were used only in generations that were since rejected and deleted, and Modern Military and No Drones only in draft records that were since deleted.

## Analysis

The analysis below reviews the 35 track records as of 2026-11-24, under `assets/music/yaml`, with no draft records among them. There are **21 distinct recorded input prompt texts** after normalizing whitespace, plus **14 recorded Suno rewrites**. The counts below use track records unless stated otherwise. Takes of one prompt can share an input and differ in generation settings, stored text, or outcome.

### Prompt stems

| Stem recorded in YAML | Records | Branches |
| --- | --: | --- |
| Original X-COM: UFO Defense (1994) | 14 | Retro MIDI/Amiga electronic soundtrack, deep-ocean cosmic horror, Geoscape, variety and pulse experiments, a prompt without MIDI, and cold orbital ambience |
| “Scanning Protocol” by Chris D’Ambrosio, XCOM Legacy OST | 16 | Electronic surveillance ambience, darker/bassier versions, acoustic pairings, and a seven-instrument hybrid |
| Modern clandestine strategy game | 2 | A clandestine signals room tracking an unknown contact, shifted toward cold Geoscape electronics with dissonant FM motifs |
| Electronics inspired by the X-COM Geoscape | 2 | A deep-space contact: a rounded FM lead, close-miked felt piano, a damped cymbal tick, and sonar pings |
| “Vats of Goo” (Mariposa Base), Fallout 1 soundtrack | 1 | Dark industrial ambience of a sealed underground research facility whose machinery still runs |

### Taxonomy

| Dimension | What appears in the prompts |
| --- | --- |
| **Mood** | Dark, brooding, ominous, sinister, eerie, menacing, oppressive, claustrophobic, unsettling, cold, serious, disciplined, hypnotic, cerebral, quietly suspenseful, quietly menacing, melancholic, mournful, intimate. Emotional cues include paranoia, secrecy, isolation, dread, mystery, vigilance, an unresolved sense of threat, and fear of the unknown. Common exclusions include cheerfulness, comfort, warmth, optimism and relaxation. |
| **Setting and imagery** | Prolonged tactical/strategic gameplay, Geoscape/global defense command, covert military surveillance, a clandestine signals room, alien signal analysis, an unknown contact in deep space, unseen extraterrestrial threat, subterranean spaces, a sealed underground research facility, Lovecraftian deep ocean with submerged ruins and dormant entities, and a high-tech orbital command center tracking alien craft. |
| **Era and production** | 1990s DOS/PC game sound, MIDI, Amiga-era synths, Sound Blaster FM, cold FM synths, vintage digital and limited polyphony, retro-futurist electronic ambience, lo-fi sampled textures of a 1990s RPG, organic acoustic recording aesthetic, and high-tech sci-fi. Mix choices include slightly lo-fi digital, grainy or narrow/tape hiss, thick resonant low-end, a clean and spacious mix, and wide/deep reverberation. |
| **Tempo** | Slow to moderate, slow, very slow, unhurried half-time, free time, 55–65 BPM, around 65 BPM, around 76 BPM, and around 82 BPM. |
| **Rhythmic motion** | Subtle sequenced or hypnotic bass pulses, restrained 65 BPM pulse, irregular electronic accents, irregular sequencer phrases that change pattern and drop out, a muted mechanical pulse, occasional percussion, uneven ostinato, pulse-free drift, or passages without percussion. Some branches exclude persistent pulses, two-note ostinatos, repetitive bass ostinatos, four-on-the-floor, constant ticking, steady drum beats and driving beats. Orbital branches deliberately use precise ticking. |
| **Density and space** | Minimalist, sparse instrumentation, deliberate silences, near-silence, silence between sounds, long gaps between sounds, ample negative space, isolated notes, staggered entrances, occasional slightly richer passages. |
| **Dynamics and intensity** | Subdued, restrained, consistent low intensity, occasional tension increases, brief dissonant events, no dramatic crescendo, builds, climax, drops or jump scares. Epic/heroic colors are permitted in certain exclusion lists. Brief or restrained swells are used tactically. |
| **Register and texture** | Deep rumble, bass-heavy/low-register weight, long sustains, synth or acoustic drones, hollow tones and resonances, glassy/ethereal edges, breathiness, woody/gritty acoustic texture, distant metallic resonances and strikes, high electronic signals, sonar-like pings, detuned signal fragments, faint radio static, electrical hum and alien timbres. |
| **Harmony** | Minor-key harmony, sustained dissonant chords, clusters, unresolved progressions, minor seconds, tritones, descending chromatic intervals, sparse dissonant motifs, subtle or unexpected harmonic shifts. |
| **Melody and development** | Sparse, haunting and memorable motifs, short phrases, two- or three-note fragments, restrained melody, counter-melodies, expressive phrasing, evolving textures, instruments entering and receding, recurring motifs in altered forms, and alternating sparse and fuller passages. Some treatments ask for minimal melody. |
| **Form and gameplay function** | Instrumental background music for long sessions, unobtrusive evolution, gentle transitions, seamless looping and consistent dynamics. A deep-sea branch requests an unresolved conclusion. |
| **Prompt construction** | Bare-bones or kept short, fitting v03ai's 1,000-character cap, preserving length when adding violins, hand-cutting phrases, and experimenting with Suno Variety rewrites. |

**“Minimal” has three concrete meanings here.** Minimalist or sparse describes the number of layers and how much silence they leave. Minimal percussion describes rhythmic density. Consistent low intensity describes the size of dynamic changes. Tempo, pulse, density and intensity each have their own controls in the taxonomy.

### Instruments and sound sources

| Family | Named instruments, treatments and roles |
| --- | --- |
| **Strings** | Violin(s), mournful cello, bowed double bass/contrabass, low strings, and dry pizzicato viola as a rare accent. Techniques include glassy harmonics, low staccato strings, sustained bowed notes, and cello/double-bass ostinatos. |
| **Keys** | Muted felt piano with soft, isolated notes, and close-miked felt piano answering with low two- or three-note fragments. Soft piano is expressly excluded in the Geoscape branch, and sentimental piano in the deep-space branch. |
| **Woodwind** | Bass clarinet, usually hollow, breathy and low-register, used for sparse replies or uneasy motifs, and bass flute as a brief filtered breath deep in the mix. |
| **Brass** | Muted trombone and unspecified muted brass, low notes and restrained swells. Heroic brass is excluded in some branches and removed from the exclusions in others. |
| **Percussion and resonant metal** | Bowed cymbals, bowed metal, a lightly tapped and immediately damped cymbal, metallic impacts/resonances and strikes, sparse metallic percussion, and military snare. Bowed cymbals are specified as distant groans or swells, with crashes and rhythmic cymbal patterns excluded in that branch; the deep-space branch excludes cymbal crashes, cymbal washes and drum fills. The orbital branch makes the snare distant and sparse. |
| **Electronic sound sources** | Amiga-style and digital synths, Sound Blaster/dark FM, cold FM synths with sparse dissonant motifs, a rounded FM lead over a faint synth bed, retro-futurist synths, analog synth pulses in a stored rewrite, synth pads, dissonant synth chords and occasional high electronic tones. MIDI is part of the period aesthetic. |
| **Sound design** | Bass drones, low-frequency rumble, sonar-like pings, faint radio interference and static, detuned signal fragments, electrical hum, console-like ticks, alien tones and textures, abyssal and muffled resonances. Acoustic double bass also supplies drone-like sustain. |
| **Exclusions and permissions** | Guitars, vocals/singing, choir, intelligible speech, drum kit, cymbal crashes, aggressive drums, heroic brass, bright synth leads and synthesizer appear in exclusion language depending on the branch. Choir comes off the exclusion list in Allow Epic variants. Those records still specify instrumental. |

The **eight deliberate instrument additions** in `meta_prompt_taxonomy.adjustments` are listed below. Counts include repeated takes.

| Instrument addition                                                                         | Records |
| ------------------------------------------------------------------------------------------- | ------: |
| Felt piano, violins, cello, bowed double bass, bass clarinet, muted trombone, bowed cymbals |       2 |
| Bass clarinet + muted trombone                                                              |       2 |
| Cello + bowed double bass                                                                   |       2 |
| Bowed double bass + bowed cymbals                                                           |       2 |
| Felt piano + cello                                                                          |       2 |
| Close-miked felt piano + damped cymbal                                                      |       2 |
| Cello + bass clarinet                                                                       |       1 |
| Violin(s)                                                                                   |       1 |

### What the adjustments bundle together

| Adjustment | What changed in this corpus |
| --- | --- |
| **Dark** | Eleven records explicitly ask for darker and bassier, less electronic and spacey. The prompts combine heavier bass, organic/gritty texture, claustrophobia and very slow pacing. Several retain drones and slow pulses. |
| **Variety / No Pulse** | Six records label “more variety, less monotonous.” Three use the explicit “no repeated pulse” adjustment. Variety often varies motifs, harmony or textures while retaining occasional pulse. No Pulse targets a continuous rhythmic foundation and uses stillness or irregular accents. |
| **Slow / Bare-bones** | Five carry the combined slower/darker/less intense adjustment. Two explicitly shorten to a bare-bones prompt. The orbital inputs specify around 65 BPM. |
| **No MIDI / No Synth / No Drones** | No MIDI removes the explicit MIDI/Amiga timbre. No Synth replaces the synth palette with acoustic/orchestral sources and excludes synthesizer; orbital No Synth retains sonar/static effects. No Drones, cutting ambient drones and high tones, appeared only in a since-deleted draft. |
| **Terror from the Deep / Geoscape / Modern Military / Space** | Three add Terror from the Deep and Lovecraftian color. Geoscape uses a global command perspective. Space trades close military percussion for weightless strings, sonar/static, distant snare and a wide mix. Modern Military, with staccato strings, snare and taiko, appeared only in a since-deleted draft. |
| **Allow Epic / Allow Heroic and Aggressive** | Three records remove choir, synthwave, epic orchestral, aggressive drums and heroic brass from Exclude Styles. Two use the corresponding heroic/aggressive adjustment and keep choir excluded. These are permissions in the form, while the prose frequently still prioritizes psychological tension. |
| **Toward X-COM Geoscape / Dissonant FM Motifs / Faint Pizzicato Viola and Bass Flute / 76 BPM** | Two records turn a grounded clandestine-strategy prompt toward cold Geoscape electronics: dissonant FM motifs and irregular sequencer accents lead, the acoustic viola and bass flute shrink to rare accents, and quiet forward motion sits at around 76 BPM. |
| **Irregular Sequencer at 82 BPM / Felt Piano and Damped Cymbal / Rounded FM Lead / Deep-Space Mix with Sonar Pings** | Two records build a deep-space contact cue: short irregular sequencer phrases at around 82 BPM, a rounded FM lead over a fading synth bed, felt piano fragments and a damped cymbal tick, and a clean mix of sonar pings, detuned signals and silence. |

### Other metadata that affects interpretation

- **Input versus stored prompt.** The fourteen Suno rewrites are the seven-instrument pair's half-time and pulse-free variants, two very slow felt piano/cello rewrites, the two orbital rewrites, the UFO Salvage Operation rewrite, the two No MIDI rewrites, the clandestine-strategy pair, the deep-space pair, and Subterranean Facility. The No MIDI rewrites add analog synth pulses/uneven ostinato or free-time drones/tape hiss. The rewrite stored for Countering the Threat was reused verbatim as UFO Salvage Operation’s input, which also used Countering the Threat as audio inspiration at 25% influence.
- **Exclude Styles.** Twenty of the twenty-two Suno records have an Exclude styles list, and all of them exclude vocals and EDM. Branch additions include singing, choir, intelligible speech, synthwave, upbeat, trailer music, rock, pop, bright melodies, epic orchestral, aggressive drums, heroic brass, jazz swing, big band, cymbal crashes, cymbal washes, drum fills, drum kit, steady drum beats, industrial beats, industrial rock, risers, impacts, synthesizer, chiptune, 8-bit, retro, lo-fi, military march, fast tempo, fantasy soundtrack, pastoral woodwinds, flute solos, playful pizzicato, chamber classical, repetitive bass ostinatos, sentimental piano, prominent bass riffs, orchestral swells and jump scares.
- **v03ai style labels.** Dark ambient, sci-fi electronica, cinematic synth, minimal electronic, atmospheric, ominous, bass-heavy, minimalist, brooding, industrial, cinematic and acoustic textures.
- **Track tags.** Electronic, ambient, sci-fi/science-fiction, strategy-game soundtrack, soundtrack, atmospheric, retro-futuristic, instrumental, cinematic, minimalist, intimate, dark, brooding, hypnotic, dark ambient, tactical strategy, suspenseful, ominous, industrial, lo-fi and sparse.
- **Generation provenance and controls.** Nine ElevenLabs Music records (two v2, seven v2.5), twenty-two Suno v6 records and four Suno v5 via v03ai records. Recorded Suno controls span Weirdness 40–50%, Style Influence 50% or 70%, Variety 0–2, Max Mode off, Personalize on or off, and Duration Auto. File/title, song URL, date, model and duration establish provenance. Inside the Command Center's recorded ElevenLabs input ends mid-sentence. All four v03ai records keep the full prompt ChatGPT produced, which v03ai's 1,000-character cap truncated on submission.
- **Human assessments.** Twelve records carry the Game designer's verdict. Four are very dark, possibly defeat or loss tracks: Solemn Aftermath, The Human Toll, What Remains, and The Reports Keep Coming. Two are higher-energy tracks: The Alien Fleet Arrives and Their Weapons in Our Hands. The bass clarinet and muted trombone pair, Smuggling Artifacts and Shady Deals, recalls the Fallout 1 town music. Signal Intelligence is a great result, both clandestine-strategy takes are good results, and Subterranean Facility is a pleasing first prompt built on another game's track. These are observations from the metadata.

### Index of all input prompts

Identical recorded prompt text is grouped even when the track, settings, exclusions, or stored rewrite differ.

| Records | Prompt directions |
| --- | --- |
| `Inside the Command Center.yaml` | Original retro electronic formulation. Low drones, metallic percussion, subtle bass pulses, slow to moderate. Stored ending truncated. |
| `Undersea Operations.yaml` | Adds X-COM: Terror from the Deep and Lovecraftian imagery, Sound Blaster FM, sonar, muffled resonances and abyssal drones. Retains a subtle pulse and adds seamless looping. |
| `Deployment Preparations.yaml` | Geoscape, stronger menace, 55–65 BPM, DOS FM, minor seconds, tritones and chromatic descent. Bans persistent pulse and ticking. Retains a slightly lo-fi period timbre while avoiding cozy lo-fi. |
| `A City on Sonar.yaml`<br>`Survey at Depth.yaml` | Deep-sea branch with no continuous pulse. Evolving motifs, counter-melodies, changed instrumentation and percussionless passages. Unresolved conclusion. |
| `Inside the Megastructure.yaml`<br>`Approaching the Megastructure.yaml` | More development through melodic variation, texture, harmony and rhythm. A subtle pulse remains possible. Sparse and fuller passages alternate without intensity jumps. |
| `Sacrifice for Earth.yaml`<br>`Descent to Earth.yaml` | Shortened formulation at 55–65 BPM with sparse instrumentation, subdued dynamics, restrained intensity and gradual variation. |
| `UFO Salvage Operation.yaml` | Uses the rewrite stored for Countering the Threat as its input, with Countering the Threat as Suno audio inspiration at 25% influence. 65 BPM, low strings, bowed metal, muted brass, sonar/static and sparse ticking/snare. |
| `Alien Technology.yaml`<br>`Alien Lifeforms.yaml`<br>`On the Trail of the Unknown.yaml` | Scanning Protocol baseline. Slow electronic surveillance cue with deep synth pads, high signals, subtle pulse, sparse percussion and seamless looping. The v03ai submission was slightly truncated. |
| `Solemn Aftermath.yaml`<br>`Containment Protocol.yaml` | Scanning Protocol electronics with seven acoustic colors. Instruments enter in turn. One rewrite specifies suspended half-time, the other pulse-free ambient drift. |
| `Smuggling Artifacts.yaml`<br>`Shady Deals.yaml` | Dark, bass-heavy and grounded. Breathy bass clarinet and muted trombone over slow bass pulses and drones. Big band, jazz swing and heroic brass excluded. |
| `The Human Toll.yaml`<br>`What Remains.yaml` | Mournful cello over bowed double bass. Very slow, woody sustain, ample silence and minimal ostinato. Consistent texture and dynamics for looping. |
| `Network Expansion.yaml`<br>`Surface Logistics.yaml` | Bowed double bass with near-inaudible bowed cymbal resonances. Very slow, oppressive and sparse. No cymbal crashes, driving beat or climaxes. |
| `Dark Omen.yaml`<br>`Night Shift.yaml` | Muted felt piano and mournful cello over slow bass pulses and low rumble. Rewrites retain intimate production, low register and very slow pulse. |
| `Assault on the Alien Facility.yaml`<br>`Countering the Threat.yaml` | Orbital command instead of close military perspective. About 65 BPM, glassy harmonics, bowed metal, low strings, muted brass, sonar, radio static and distant snare. The two store different rewrites. |
| `The Alien Fleet Arrives.yaml`<br>`Their Weapons in Our Hands.yaml` | Electronic PC-era direction with MIDI/Amiga language removed and heroic/aggressive exclusions lifted. One rewrite adds an uneven ostinato and analog pulses, the other free-time drift and restrained tape hiss. |
| `Reports of the Strange.yaml` | Dark, bass-heavy and grounded treatment without a named acoustic instrument. Deep drones and slow hypnotic bass pulse. |
| `The Reports Keep Coming.yaml` | Dark treatment with bowed cello and breathy low-register bass clarinet. Cinematic/acoustic style labels. |
| `The Infestation Spreads.yaml` | Dark treatment with melancholy violin, sustained low strings and restrained melody. Instrument added within the existing prompt length. |
| `In Pursuit of Shapeshifters.yaml`<br>`Artifact Experiments.yaml` | A clandestine signals room tracking an unknown contact. Cold FM synths carry sparse dissonant motifs over a grainy electronic bed at around 76 BPM, with irregular sequencer accents, radio interference and detuned signals; pizzicato viola and bass flute only as rare accents. |
| `Signal Intelligence.yaml`<br>`Cybernetic Elites.yaml` | A deep-space contact in the suspense of the X-COM Geoscape. Short irregular sequencer phrases at around 82 BPM, a rounded FM lead over a fading synth bed, close-miked felt piano fragments, a damped cymbal tick, sonar pings and silence between sounds. Cybernetic Elites is a crop of its generation's other song. |
| `Subterranean Facility.yaml` | Dark industrial ambience of a sealed underground research facility. Slowly shifting synth drones, hollow low-end resonance, a muted mechanical pulse, metallic strikes, electrical hum and filtered radio static, with long gaps between sounds and lo-fi sampled textures. |
