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

These terms are specific to Configuration. General terms are in the [Engine Contract glossary](engine-contract.md#glossary); [Campaign configuration](campaign-state.md#glossary) is in the [Campaign State glossary](campaign-state.md#glossary).

| Term | Definition |
| --- | --- |
| Game build default preset | The one [Campaign configuration preset](game-data-records.md#glossary) that the [Game build](core-concepts.md#game-build-and-content) designates as selected when the player has selected no other. |
| Preset edit | A value the player sets before creating a [Campaign](core-concepts.md#campaign-and-session) to override one Campaign configuration value of one Campaign configuration preset. The [Session](core-concepts.md#campaign-and-session) holds it. |

# Kinds of setting

Settings differ in whom they serve and how long they last, so each kind lives in a different place and survives for a different time. Three kinds of setting are distinct. This list is complete, and only the last two take part in the [Configuration cascade](#configuration-cascade).

| Kind | Examples | Where it lives | Persisted |
| --- | --- | --- | --- |
| Session access setting | E.g., Dev mode | Session | Never |
| [Global configuration](engine-contract.md#persisted-data) | E.g., Music volume, the Autosave limit | [Game storage](engine-contract.md#persisted-data) | Yes, one set |
| Campaign configuration | E.g., an investigation difficulty multiplier | [Campaign state](core-concepts.md#campaign-and-session), within each [Campaign save](engine-contract.md#persisted-data) | Yes, per Campaign |

# Global configuration

Global configuration is read when a Session starts, so its settings apply at the main menu before any Campaign is selected. Selecting, creating, or loading a Campaign never replaces Global configuration, and a Campaign save does not contain it. Interface preferences belong to Global configuration, e.g. the volume of music and of Sounds. So does a setting that governs the engine without being read by the [Game rules](core-concepts.md#game-build-and-content), e.g. the [Autosave limit](saves.md#limits), under [Autosaves](saves.md#autosaves).

A Game build has exactly the following Global configuration settings. Each is stated in full, with its permitted values and its [Game build default](engine-contract.md#persisted-data), where the table says. This table is exhaustive, and a new setting joins it in the same change that defines it.

| Setting | Stated in |
| --- | --- |
| [Autosave limit](saves.md#limits), [Autopilot Autosave limit](saves.md#limits) | [Limits](saves.md#limits) in Saves |
| Music on, Music volume | [Music settings](../ui/music.md#music-settings) in Music |
| Sounds on, Sounds volume | [Sound settings](../ui/sounds.md#sound-settings) in Sounds |

Global configuration stores only values the player has set. A setting the player has not set follows the current [Game build default](engine-contract.md#persisted-data), so a changed Game build default in a later Game build reaches it. Resetting a setting removes its stored value.

The [Session controller](engine-contract.md#principals-and-access) reads and changes Global configuration through these operations. The list is complete.

| Operation | Effect |
| --- | --- |
| `session.globalConfiguration.get()` | Reports every Global configuration setting with its effective value, its Game build default, and whether a stored value overrides that default. |
| `session.globalConfiguration.set(setting, value)` | Stores `value` for `setting`. A value the setting does not permit is rejected and changes nothing. |
| `session.globalConfiguration.reset(setting)` | Removes the stored value of `setting`, so the setting follows the Game build default. |

A successful `set` or `reset` is persisted in Game storage at once and applies from then on, in this Session and in later ones. These operations need no [Current campaign](core-concepts.md#campaign-and-session). They are not [Player actions](engine-contract.md#player-actions) and change no Campaign state or Campaign save, so undo, redo, and load never change Global configuration. They remain available during an [Autopilot engagement](engine-contract.md#autopilot), under [Autopilot lifecycle and concurrency](autopilot.md#autopilot-lifecycle-and-concurrency); e.g., the player can change the volume while an [Autopilot AI](engine-contract.md#principals-and-access) plays.

Global configuration holds nothing that campaign creation uses: creating a Campaign neither reads nor changes it.

# Campaign configuration presets

The Game build supplies one or more Campaign configuration presets. Each preset is one [GDR](core-concepts.md#game-build-and-content) serving the Campaign configuration preset purpose under [Purposes of GDRs](game-data-records.md#purposes-of-gdrs) and supplies a value for every Campaign configuration value. A preset is never partial, and presets do not combine. Exactly one preset is the Game build default preset.

A value is a Campaign configuration value if and only if the presets supply it, apart from their `name`, under [CampaignConfiguration](#campaignconfiguration). E.g., starting money, enemy difficulty, and a multiplier of how often [Mission sites](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) appear can be Campaign configuration values. Whatever no preset can change about a new Campaign is not Campaign configuration. It is either a GDR serving another purpose, e.g. a new base [Agent](../mechanics/domain-model.md#agency-and-agents) base skill value, or part of the Game rules, e.g. a starting [Turn](engine-contract.md#player-actions-and-turns) that is the same for every Campaign, and the rule determining which [Campaign instances](core-concepts.md#campaign-instances) the initial Campaign state contains, under [Initial Campaign state](../mechanics/domain-model.md#initial-campaign-state). The [Campaign seed](determinism-and-randomness.md#campaign-seed) is the one exception: no preset supplies it and no Preset edit sets it, yet it differs between Campaigns. It is neither Campaign configuration nor part of the new-Campaign setup; campaign creation receives it separately, under [Campaign seed](determinism-and-randomness.md#campaign-seed). A preset supplies both the values that are adjustable during play and the values that are fixed after creation, under the [Campaign State glossary](campaign-state.md#glossary).

## CampaignConfiguration

A Campaign configuration preset is a GDR of [Type](core-concepts.md#data-modeling) CampaignConfiguration. The following table is exhaustive apart from the `id` and `type` that every GDR has.

| Property | Shape | Meaning |
| --- | --- | --- |
| `name` | Non-empty text. | The display name of the preset, which an interface shows, e.g. "Standard". It is not a Campaign configuration value. |
| One property for each Campaign configuration value | As the specification that owns the value states. | The preset's value of that Campaign configuration value, e.g. `starting_money` and `starting_funding` under [Campaign configuration values](../mechanics/economy-and-upgrades.md#campaign-configuration-values) in Economy and Upgrades. |

A Game build is defective, and no Campaign is created from it, if a CampaignConfiguration has no `name`, a `name` that is not non-empty text, no property for some Campaign configuration value, or any property other than `id`, `type`, `name`, and one for each Campaign configuration value. The violation is reported as a data defect, under [World state integrity](engine-contract.md#world-state-integrity) in Engine Contract.

## Game build default preset

The Game build supplies exactly one GDR of [Type](core-concepts.md#data-modeling) ConfigurationParameters. Its `default_preset` property holds the identifier of one Campaign configuration preset, and that preset is the Game build default preset. No preset states whether it is the default, so the presets supply Campaign configuration values only.

The ConfigurationParameters GDR serves none of the purposes under [Purposes of GDRs](game-data-records.md#purposes-of-gdrs): it affects only the preset selection, which the Session holds; the Game rules never read it, and Campaign state never refers to it.

A Game build is defective, and no Campaign is created from it, if it supplies no ConfigurationParameters GDR or more than one, if that GDR has a property other than `id`, `type`, and `default_preset`, or if its `default_preset` is not the identifier of a Campaign configuration preset the Game build supplies. The violation is reported as a data defect, under [World state integrity](engine-contract.md#world-state-integrity) in Engine Contract.

Presets are immutable: a Preset edit, or a later change to Campaign configuration, never changes a preset. Campaign state retains the values copied at creation, as the [Configuration cascade](#configuration-cascade) states, and no reference to the selected preset. Creation of a Campaign instance that needs a Campaign configuration value reads it from Campaign configuration; e.g., [Agency](../mechanics/domain-model.md#agency-and-agents) creation reads starting money.

# Configuration cascade

The effective value of each setting follows this complete rule set:

| Setting scope     | Effective value                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------- |
| Global preference | A value stored in Global configuration overrides the Game build default.                    |
| New Campaign      | A Preset edit for the selected Campaign configuration preset overrides that preset's value. |
| Existing Campaign | Its own Campaign configuration applies, including changes made during play.                 |

Changes made during play, and which Campaign configuration applies after undo, redo, and load, follow [Changing Campaign configuration during play](#changing-campaign-configuration-during-play).

Which preset is selected, and which Preset edits exist, follows [Preset selection and edits](#preset-selection-and-edits). Presets and the completeness of each preset follow [Campaign configuration presets](#campaign-configuration-presets).

Campaign creation resolves every Campaign configuration value through this cascade and records the complete result in the initial Campaign state; no Campaign configuration value is left to be resolved later. Values are copied at creation, not inherited: a later Game build that changes a preset never changes an existing Campaign, and loading a Campaign save restores its Campaign configuration regardless of the current presets and Global configuration.

# Preset selection and edits

Before creating a Campaign, the Session controller selects one Campaign configuration preset and may edit its values. The preset selection and the Preset edits are not settings: they are none of the kinds under [Kinds of setting](#kinds-of-setting). The following rules are complete:

- **Start:** When a Session starts, the selected preset is the Game build default preset and no Preset edit exists.
- **Selection:** The Session controller may select any preset the Game build supplies. Selecting a preset changes no Preset edit.
- **Edits:** The Session controller may set a Preset edit for any Campaign configuration value of any preset, whether the value is adjustable during play or fixed after creation. A Preset edit must be a permitted value of that Campaign configuration value; an invalid Preset edit is rejected and changes nothing. Removing a Preset edit restores the preset's own value.
- **Edits belong to their preset:** Each preset has its own Preset edits. Selecting another preset neither discards nor applies them, and selecting the preset again shows them as they were left.
- **Creation:** Campaign creation uses the selected preset and that preset's Preset edits, as the [Configuration cascade](#configuration-cascade) states. Preset edits of presets that are not selected have no effect. A successful campaign creation then discards every Preset edit of every preset and selects the Game build default preset, so the next Campaign is set up from scratch. A failed campaign creation changes neither.
- **Lifetime:** The Session holds the preset selection and the Preset edits, under [Data ownership](engine-contract.md#data-ownership). They are never persisted, and they are discarded when the Session ends. Loading or closing a Campaign changes neither.

The Session controller reads and changes the preset selection and the Preset edits through these operations. The list is complete. Creating a Campaign from the new-Campaign setup is `session.campaign.create(options)`, which [Campaign selection](campaign-lifecycle.md#campaign-selection).

| Operation | Effect |
| --- | --- |
| `session.newCampaignSetup.listPresets()` | Reports every preset the Game build supplies, with its `name`, which one is the Game build default preset, which one is selected, and which have Preset edits. |
| `session.newCampaignSetup.getPreset(preset)` | Reports every Campaign configuration value of `preset`: the preset's own value, its Preset edit if one exists, the permitted values a Preset edit may set, and whether the value is adjustable during play or fixed after creation. `preset` need not be selected. |
| `session.newCampaignSetup.getSetup()` | Reports the selected preset and the value campaign creation would use for each of its Campaign configuration values, i.e. its Preset edit where one exists and the preset's own value otherwise. |
| `session.newCampaignSetup.selectPreset(preset)` | Selects `preset`, under the Selection rule. |
| `session.newCampaignSetup.setPresetEdit(preset, value)` | Sets a Preset edit of `preset`, under the Edits rule. |
| `session.newCampaignSetup.removePresetEdit(preset, value)` | Removes a Preset edit of `preset`, under the Edits rule. |

# Changing Campaign configuration during play

Difficulty is represented by Campaign configuration. Players must be able to change difficulty during an ongoing Campaign without restarting it or enabling [Dev mode](engine-contract.md#principals-and-access), so the Campaign configuration values representing difficulty are adjustable during play.

`session.campaignConfiguration.set(values)` is the one operation that changes Campaign configuration during play. It is a [Session API](engine-contract.md#api-surfaces) operation, so only the [Session controller](engine-contract.md#principals-and-access) can call it, never an [Autopilot AI](engine-contract.md#principals-and-access), and it is unavailable during an [Autopilot engagement](engine-contract.md#autopilot), under [Autopilot lifecycle and concurrency](autopilot.md#autopilot-lifecycle-and-concurrency). It needs a [Current campaign](core-concepts.md#campaign-and-session) and changes only that Campaign's Campaign configuration. A change follows these complete rules:

- **Only adjustable values:** A change may name only values that are adjustable during play. A request naming a value that is fixed after creation is invalid.
- **All or nothing:** The complete requested change is validated before it is applied. An invalid request is rejected and leaves Campaign state unchanged.
- **Not a [Player action](engine-contract.md#player-actions-and-turns):** An accepted change is applied atomically and at once. It is not a [Player action](engine-contract.md#player-actions-and-turns): it adds no [Timeline entry](timeline.md#glossary), does not move the [Timeline pointer](engine-contract.md#persisted-data), is listed in no [Action record](world-history.md#glossary), does not end the Turn, and cannot be undone or redone. A request that leaves Campaign configuration unchanged is accepted and changes nothing.
- **Sticky:** A changed value stays in force until the next change. Undo and redo within a Turn keep it, because they move only the Timeline pointer, and undo and redo across Turns keep it too, under [Autosave navigation](timeline.md#autosave-navigation) in [Timeline](engine-contract.md#persisted-data). Only a load of a Campaign save replaces it, with the value that Campaign save holds, under [Loading](saves.md#loading) in Saves.
- **Saved at once:** An accepted change changes the Campaign state of the Current campaign, so it replaces the [Current Autosave](saves.md#autosave-kinds), under [Autosaves](saves.md#autosaves) in Saves.
- **Future calculations only:** A change affects only calculations made after it. It never rewrites a [World state](engine-contract.md#player-actions-and-turns) that already exists, i.e. none that the [Timeline](engine-contract.md#persisted-data) holds, including the [Current world state](engine-contract.md#player-actions-and-turns) and every [Undone action](timeline.md#glossary), and nothing that the [History](campaign-state.md#glossary) holds. It therefore never regenerates an existing World state, rewrites past outcomes, or redraws random outcomes, and redo after a change reaches the World state as it was first produced.
- **Recorded nowhere else:** No [History entry](world-history.md#glossary) or other part of Campaign state records that a change was made. The Mechanics specification that introduces a value may declare a [Turn series](world-history.md#glossary) of it, under [Turn series](world-history.md#turn-series) in History and Turn Report.

Interface specifications must expose these rules and must not introduce different validation or timing.

# What each Campaign configuration value must state

The Mechanics specification that introduces a Campaign configuration value states all of the following:

- its Type and its permitted values;
- whether it is adjustable during play or fixed after creation, under the [Campaign State glossary](campaign-state.md#glossary);
- for a value fixed after creation, how campaign creation uses it; e.g., starting money becomes the Agency's initial money;
- for a value adjustable during play, which future calculations or generation a change affects, including how activities already underway are treated; a change never affects existing World state, under [Changing Campaign configuration during play](#changing-campaign-configuration-during-play).

Examples of possible values are enemy count and an investigation difficulty multiplier; they establish no inventory and no balance values. The values themselves are supplied by the Campaign configuration presets, which are GDRs.

# Edge cases and failure behavior

If a value stored in Global configuration is invalid in the current Game build, the Game build default applies and the problem is reported. Starting the game never fails because of an invalid stored value.

# TODOs

- TODO: Define the inventory of Campaign configuration values that are adjustable during play, e.g. the values representing difficulty, and the Mechanics specification that introduces each. Only two Campaign configuration values exist so far: starting money and starting funding, under [Campaign configuration values](../mechanics/economy-and-upgrades.md#campaign-configuration-values), which are both fixed after Campaign creation, so neither is adjustable during play.
- TODO: Define what `session.campaignConfiguration.set(values)` reports, under [Changing Campaign configuration during play](#changing-campaign-configuration-during-play).
- TODO (later): Allow Campaign-specific overrides of Global configuration preferences, see [Global configuration](#global-configuration).
- TODO (later): Store a selected preset or Preset edits beyond the Session, e.g. a player-saved custom preset or a remembered last selection, see [Preset selection and edits](#preset-selection-and-edits).
