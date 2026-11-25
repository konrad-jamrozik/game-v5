# Configuration

| Metadata | Value |
| --- | --- |
| Spec ID | CONFIG |
| Family | Foundation |
| Audience | Engine designer, UI designer, Implementer |
| Owns | Kinds of setting, Global configuration, and the configuration cascade. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

The game is configurable, but not every setting applies all the time. Some settings belong to the player and apply to every [Campaign](core-concepts.md#campaign-and-session), e.g. volume and language. Some belong to one Campaign and shape how it plays, e.g. its starting money or a difficulty multiplier. Some last only as long as the current [Session](core-concepts.md#campaign-and-session) and govern access rather than play, e.g. [Dev mode](engine-contract.md#principals-and-access). These are, in order, [Global configuration](engine-contract.md#persisted-data), [Campaign configuration](campaign-state.md#glossary), and Session access settings.

Because a setting's value can come from more than one place, a configuration cascade decides which one applies: a value the player chose overrides the default the [Game build](core-concepts.md#game-build-and-content) supplies. A new Campaign starts from a Campaign configuration preset the player picks and may edit, and creation copies the result into the Campaign, so a later Game build never changes an existing Campaign. Once play begins, only the settings meant for it, e.g. difficulty, can still change.

# Glossary

| Term | Definition |
| --- | --- |
| Game build default preset | The one [Campaign configuration preset](game-data-records.md#glossary) that the [Game build](core-concepts.md#game-build-and-content) designates as selected when the player has selected no other. |
| Preset edit | A value the player sets before creating a [Campaign](core-concepts.md#campaign-and-session) to override one [Campaign configuration](campaign-state.md#glossary) value of one Campaign configuration preset. The [Session](core-concepts.md#campaign-and-session) holds it. |

# Kinds of setting

Settings differ in whom they serve and how long they last, so each kind lives in a different place and survives for a different time. Three kinds of setting are distinct, and only [Global configuration](engine-contract.md#persisted-data) and Campaign configuration take part in the [configuration cascade](#configuration-cascade).

| Kind | Examples | Where it lives | Persisted |
| --- | --- | --- | --- |
| Session access setting | E.g., Dev mode | Session | Never |
| [Global configuration](engine-contract.md#persisted-data) | E.g., Music volume, the Autosave limit | [Game storage](engine-contract.md#persisted-data) | Yes, one set |
| Campaign configuration | E.g., an investigation difficulty multiplier | [Campaign state](core-concepts.md#campaign-and-session), within each [Campaign save](engine-contract.md#persisted-data) | Yes, per Campaign |

# Global configuration

Global configuration is read when a Session starts, so its settings apply at the main menu before any Campaign is selected. Interface preferences belong to Global configuration, e.g. the volume of music and of Sounds. So does a setting that governs the engine without being read by the [Game rules](core-concepts.md#game-build-and-content), e.g. the [Autosave limit](saves.md#limits).

Global configuration stands apart from every Campaign. Selecting, creating, or loading a Campaign never replaces it, undo and redo never change it, and campaign creation neither reads nor changes it. A change of a setting is not a [Player action](engine-contract.md#player-actions-and-turns) and changes no Campaign state.

A Game build has the following Global configuration settings. The specification that owns a setting states its permitted values and its [Game build default](engine-contract.md#persisted-data).

| Setting | Stated in |
| --- | --- |
| [Autosave limit](saves.md#limits), [Autopilot Autosave limit](saves.md#limits) | [Limits](saves.md#limits) in Saves |
| Music on, Music volume | [Music settings](../ui/music.md#music-settings) in Music |
| Music control collapsed | [Music control in the Side panel](../ui/music.md#music-control-in-the-side-panel) in Music |
| Sounds on, Sounds volume | [Sound settings](../ui/sounds.md#sound-settings) in Sounds |
| Autopilot controls shown, [Autopilot](engine-contract.md#autopilot) [Turns](engine-contract.md#player-actions-and-turns), Autopilot controls expanded, [Autopilot AI](engine-contract.md#principals-and-access) | [Autopilot settings](../ui/screens/campaign-screen.md#autopilot-settings) in Campaign Screen |
| [Dev mode](engine-contract.md#principals-and-access) on, Reveal hidden content on | [Developer tools](../ui/gui.md#developer-tools) in Graphical User Interface |
| [Combat simulator](../ui/screens/combat-simulator.md#glossary) shown | [Opening the Combat simulator](../ui/screens/combat-simulator.md#opening-the-combat-simulator) in Combat Simulator |
| Combat simulator setup | [Teams](../ui/screens/combat-simulator.md#teams) in Combat Simulator |
| [Screen limit](../ui/visual-design.md#glossary) | [Screen limit](../ui/visual-design.md#screen-limit) in Visual Design |
| [Side panel](../ui/gui.md#glossary) hidden | [Hiding the Side panel](../ui/screens/campaign-screen.md#hiding-the-side-panel) in Campaign Screen |
| Last 100 Turns charts | [Charts](../ui/visual-design.md#charts) in Visual Design |
| Artwork tuning | [Artwork tuning](../ui/visual-design.md#artwork-tuning) in Visual Design |
| [Combat replay](../ui/screens/combat-replay.md#glossary) Options shown | [Options](../ui/screens/combat-replay.md#options) in Combat Replay |

Global configuration stores only values the player has set. A setting the player has not set follows the current Game build default, so a changed Game build default in a later Game build reaches it. Resetting a setting removes its stored value.

The [Session controller](engine-contract.md#principals-and-access) sets and resets settings through `session.globalConfiguration`. A value the setting does not permit is rejected and changes nothing. A successful change is persisted in Game storage at once and applies from then on, in this Session and in later ones.

If a value stored in Global configuration is invalid in the current Game build, the Game build default applies and the problem is reported. Starting the game never fails because of an invalid stored value.

# Campaign configuration presets

The Game build supplies one or more Campaign configuration presets. Each preset is one [GDR](core-concepts.md#game-build-and-content) serving the [Campaign configuration preset purpose](game-data-records.md#purposes-of-gdrs), and it supplies a value for every Campaign configuration value, whether that value is adjustable during play or fixed after creation. Presets do not combine.

A value is a Campaign configuration value if and only if the presets supply it, apart from their [`name`](#campaignconfiguration). E.g., starting money, enemy difficulty, and a multiplier of how often [Mission sites](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) appear can be Campaign configuration values. Whatever no preset can change about a new Campaign is not Campaign configuration. It is either a GDR serving another purpose, e.g. a new base [Agent](../mechanics/domain-model.md#agency-and-agents) base skill value, or part of the Game rules, e.g. a starting [Turn](engine-contract.md#player-actions-and-turns) that is the same for every Campaign, or the rule determining [which Campaign instances the initial Campaign state contains](../mechanics/domain-model.md#initial-campaign-state).

The [Campaign seed](determinism-and-randomness.md#campaign-seed) is the one exception: no preset supplies it and no Preset edit sets it, yet it differs between Campaigns. It is neither Campaign configuration nor part of the new-Campaign setup; campaign creation receives it separately.

## CampaignConfiguration

A Campaign configuration preset is a GDR of [Type](core-concepts.md#data-modeling) CampaignConfiguration.

| Property | Meaning |
| --- | --- |
| `name` | The display name of the preset, which an interface shows, e.g. "Standard". It is non-empty text, and it is not a Campaign configuration value. |
| One property for each Campaign configuration value | The preset's value of that Campaign configuration value, in the shape that the specification that owns the value states, e.g. [`starting_money` and `starting_funding`](../mechanics/economy-and-upgrades.md#campaign-configuration-values). |

## Game build default preset

The Game build supplies one GDR of [Type](core-concepts.md#data-modeling) ConfigurationParameters. Its `default_preset` property holds the identifier of one Campaign configuration preset the Game build supplies, and that preset is the Game build default preset. No preset states whether it is the default, so the presets supply Campaign configuration values only.

The ConfigurationParameters GDR serves none of the [purposes of GDRs](game-data-records.md#purposes-of-gdrs): it affects only the preset selection, which the Session holds; the Game rules never read it, and Campaign state never refers to it.

# Configuration cascade

The configuration cascade gives every setting one effective value, according to the scope in which the setting applies.

| Setting scope     | Effective value                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------- |
| Global preference | A value stored in Global configuration overrides the Game build default.                    |
| New Campaign      | A Preset edit for the selected Campaign configuration preset overrides that preset's value. |
| Existing Campaign | Its own Campaign configuration applies, including changes made during play.                 |

Campaign creation resolves every Campaign configuration value through this cascade and records the complete result in the initial Campaign state; no Campaign configuration value is left to be resolved later. Values are copied at creation, not inherited: Campaign state holds no reference to the selected preset, a later Game build that changes a preset never changes an existing Campaign, and loading a Campaign save restores its Campaign configuration regardless of the current presets and Global configuration. Creation of a [Campaign instance](core-concepts.md#campaign-instances) that needs a Campaign configuration value reads it from Campaign configuration; e.g., [Agency](../mechanics/domain-model.md#agency-and-agents) creation reads starting money.

# Preset selection and edits

Before creating a Campaign, the Session controller selects one Campaign configuration preset and may edit its values. The preset selection and the Preset edits together are the new-Campaign setup, and they are not [settings of any kind](#kinds-of-setting).

- **Start:** When a Session starts, the selected preset is the Game build default preset and no Preset edit exists.
- **Selection:** The Session controller may select any preset the Game build supplies. Selecting a preset changes no Preset edit.
- **Edits:** The Session controller may set a Preset edit for any Campaign configuration value of any preset, whether the value is adjustable during play or fixed after creation. A Preset edit must be a permitted value of that Campaign configuration value; an invalid Preset edit is rejected and changes nothing. Removing a Preset edit restores the preset's own value.
- **Edits belong to their preset:** Each preset has its own Preset edits. Selecting another preset neither discards nor applies them, and selecting the preset again shows them as they were left.
- **Creation:** [Campaign creation uses](#configuration-cascade) the selected preset and that preset's Preset edits, so Preset edits of presets that are not selected have no effect. A successful campaign creation then discards every Preset edit of every preset and selects the Game build default preset, so the next Campaign is set up from scratch. A failed campaign creation changes neither.
- **Lifetime:** The [Session holds](engine-contract.md#data-ownership) the preset selection and the Preset edits. They are never persisted, and they are discarded when the Session ends. Loading or closing a Campaign changes neither.

# Changing Campaign configuration during play

Difficulty is represented by Campaign configuration. Players must be able to change difficulty during an ongoing Campaign without restarting it or enabling [Dev mode](engine-contract.md#principals-and-access), so the Campaign configuration values representing difficulty are adjustable during play.

`session.campaignConfiguration.set(values)` is the one operation that changes Campaign configuration during play, and it changes only the Campaign configuration of the [Current campaign](core-concepts.md#campaign-and-session). A change follows these rules:

- **Only adjustable values:** A change may name only values that are adjustable during play. A request naming a value that is fixed after creation is invalid.
- **All or nothing:** The complete requested change is validated before it is applied. An invalid request is rejected and leaves Campaign state unchanged.
- **Not a [Player action](engine-contract.md#player-actions-and-turns):** An accepted change is applied atomically and at once, and it is not a Player action. A request that leaves Campaign configuration unchanged is accepted and changes nothing.
- **Sticky:** A changed value stays in force until the next change. Undo and redo keep it, both within a Turn and [across Turns](timeline.md#autosave-navigation). Only [loading a Campaign save](saves.md#loading) replaces it, with the value that Campaign save holds.
- **Future calculations only:** A change affects only calculations made after it. It never rewrites a [World state](engine-contract.md#player-actions-and-turns) that already exists, i.e. none that the [Timeline](engine-contract.md#persisted-data) holds, including the [Current world state](engine-contract.md#player-actions-and-turns) and every [Undone action](timeline.md#glossary), and nothing that the [History](campaign-state.md#glossary) holds.
- **Recorded nowhere else:** No [History entry](world-history.md#glossary) or other part of Campaign state records that a change was made. The Mechanics specification that introduces a value may [declare a Turn series](world-history.md#turn-series) of it.

# What each Campaign configuration value must state

A Campaign configuration value belongs to the Mechanics specification whose rules read it, so that one specification answers what the value is and what changing it does. That specification states:

- its Type and its permitted values;
- whether it is [adjustable during play or fixed after creation](campaign-state.md#glossary);
- for a value fixed after creation, how campaign creation uses it; e.g., starting money becomes the Agency's initial money;
- for a value adjustable during play, which future calculations or generation a change affects, including how activities already underway are treated.

# TODOs

- TODO: Define the inventory of Campaign configuration values that are adjustable during play, e.g. the values representing difficulty, and the Mechanics specification that introduces each. Three Campaign configuration values exist so far: [starting money and starting funding](../mechanics/economy-and-upgrades.md#campaign-configuration-values), and the [Prologue](../mechanics/turn-advancement.md#prologue). All three are fixed after Campaign creation, so none is adjustable during play.
- TODO: Define what `session.campaignConfiguration.set(values)` reports. Affects [Changing Campaign configuration during play](#changing-campaign-configuration-during-play).
- TODO (later): Allow Campaign-specific overrides of Global configuration preferences, see [Global configuration](#global-configuration).
- TODO (later): Store a selected preset or Preset edits beyond the Session, e.g. a player-saved custom preset or a remembered last selection, see [Preset selection and edits](#preset-selection-and-edits).
