# Configuration

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | CONFIG                                                         |
| Family      | Foundation                                                     |
| Status      | Draft                                                          |
| Audience    | Engine designer, UI designer, Implementer                      |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Overview

This document defines the kinds of setting the game has, what Global configuration holds, the Campaign configuration
presets a Game build supplies, the configuration cascade that gives every setting its effective value, how the player
selects and edits a Campaign configuration preset before creating a Campaign, and how Campaign configuration changes
during play.

It owns where a setting lives and which value applies. Which Campaign configuration values exist and what they do is
owned by the Mechanics specifications using them, under
[What each Campaign configuration value must state](#what-each-campaign-configuration-value-must-state).

# Relationships

- Uses [Campaign State](./campaign-state.md)
- Uses [Core Concepts](./core-concepts.md)
- Uses [Engine Contract](./engine-contract.md)
- Uses [Timeline](./timeline.md)

# Glossary

Global configuration, Game storage, Campaign save, and Dev mode are defined by the
[Engine Contract glossary](engine-contract.md#glossary). Campaign configuration is defined by the
[Campaign State glossary](campaign-state.md#glossary).

| Term                          | Definition                                                                                                                                                                                                        |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Game build default            | The value the Game build supplies for a Global configuration setting when nothing overrides it.                                                                                                                   |
| Campaign configuration preset | A GDR supplying a value for every Campaign configuration value, from which campaign creation obtains the initial Campaign configuration, under [Campaign configuration presets](#campaign-configuration-presets). |
| Game build default preset     | The one Campaign configuration preset that the Game build designates as selected when the player has selected no other.                                                                                           |
| Preset edit                   | A value the player sets before creating a Campaign to override one Campaign configuration value of one Campaign configuration preset. The Session holds it.                                                       |

# Kinds of setting

Three kinds of setting are distinct. This list is complete, and only the last two take part in the
[Configuration cascade](#configuration-cascade).

| Kind                   | Examples                                     | Where it lives                            | Persisted         |
| ---------------------- | -------------------------------------------- | ----------------------------------------- | ----------------- |
| Session access setting | E.g., Dev mode                               | Session                                   | Never             |
| Global configuration   | E.g., volume, language                       | Game storage                              | Yes, one set      |
| Campaign configuration | E.g., an investigation difficulty multiplier | Campaign state, within each Campaign save | Yes, per Campaign |

# Global configuration

Global configuration is read when a Session starts, so its settings apply at the main menu before any Campaign is
selected. Selecting, creating, or loading a Campaign never replaces Global configuration, and a Campaign save does
not contain it. Interface preferences belong to Global configuration, e.g. volume, language, and tutorial popups.
So does a setting that governs the engine without being consulted by game behavior, e.g. the
[Autosave limit](saves.md#glossary), which [Autosaves](saves.md#autosaves) in Saves owns.

Global configuration stores only values the player has set. A setting the player has not set follows the current
Game build default, so a changed Game build default in a later Game build reaches it. Resetting a setting removes its
stored value.

The Session controller reads and changes Global configuration through these operations. The list is complete.

| Operation                                         | Effect                                                                                                                                          |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `session.globalConfiguration.get()`               | Reports every Global configuration setting with its effective value, its Game build default, and whether a stored value overrides that default. |
| `session.globalConfiguration.set(setting, value)` | Stores `value` for `setting`. A value the setting does not permit is rejected and changes nothing.                                              |
| `session.globalConfiguration.reset(setting)`      | Removes the stored value of `setting`, so the setting follows the Game build default.                                                           |

A successful `set` or `reset` is persisted in Game storage at once and applies from then on, in this Session and in
later ones. These operations need no Current campaign. They are not Player actions and change no Campaign state,
Timeline, or Campaign save, so undo, redo, and load never change Global configuration. They remain available during
an Autopilot engagement, under [Autopilot lifecycle and concurrency](autopilot.md#autopilot-lifecycle-and-concurrency);
e.g., the player can change the volume while an Autopilot AI plays.

Global configuration holds nothing that campaign creation uses: creating a Campaign neither reads nor changes it.
Campaign-specific overrides of global preferences are out of scope.

# Campaign configuration presets

The Game build supplies one or more Campaign configuration presets. Each preset is one GDR serving the Campaign
configuration preset purpose under [Purposes of GDRs](game-data-records.md#purposes-of-gdrs) and supplies a value for
every Campaign configuration value. A preset is never partial, and presets do not combine. Exactly one preset is the
Game build default preset.

A value is a Campaign configuration value if and only if the presets supply it. E.g., starting money, enemy
difficulty, and a multiplier of how often Missions appear can be Campaign configuration values. Whatever no preset can
change about a new Campaign is not Campaign configuration. It is either a GDR serving another purpose, e.g. a recruit
skill value, or game behavior, e.g. a starting turn that is the same for every Campaign, and the rule determining
which Campaign instances the initial Campaign state contains, under
[Initial Campaign state](domain-model.md#initial-campaign-state). The Campaign seed is the one exception: no preset
supplies it and no Preset edit sets it, yet it differs between Campaigns. It is neither Campaign configuration nor
part of the new-Campaign setup; campaign creation receives it separately, under
[Campaign seed](engine-contract.md#campaign-seed). A preset supplies both the values that are adjustable during play and the values that are fixed after
creation, under [Campaign state composition](campaign-state.md#campaign-state-composition).

Presets are immutable: a Preset edit, or a later change to Campaign configuration, never changes a preset. Campaign
state retains the values copied at creation, as the [Configuration cascade](#configuration-cascade) states, and no
reference to the selected preset. Creation of a Campaign instance that needs a Campaign configuration value reads it
from Campaign configuration; e.g., Agency creation reads starting money.

# Configuration cascade

The effective value of each setting follows this complete rule set:

| Setting scope     | Effective value                                                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Global preference | A value stored in Global configuration overrides the Game build default.                                                         |
| New Campaign      | A Preset edit for the selected Campaign configuration preset overrides that preset's value.                                      |
| Existing Campaign | Its own Campaign configuration applies, including changes committed during play and the values restored by undo, redo, and load. |

Changes committed during play follow [Changing Campaign configuration during play](#changing-campaign-configuration-during-play).

Which preset is selected, and which Preset edits exist, follows [Preset selection and edits](#preset-selection-and-edits).
Presets and the completeness of each preset follow [Campaign configuration presets](#campaign-configuration-presets).

Campaign creation resolves every Campaign configuration value through this cascade and records the complete result in
the initial Campaign state; no Campaign configuration value is left to be resolved later. Values are copied at
creation, not inherited: a later Game build that changes a preset never changes an existing Campaign, and loading a
Campaign save restores its Campaign configuration regardless of the current presets and Global configuration.

# Preset selection and edits

Before creating a Campaign, the Session controller selects one Campaign configuration preset and may edit its values.
The preset selection and the Preset edits are not settings: they are none of the kinds under
[Kinds of setting](#kinds-of-setting). The following rules are complete:

- **Start:** When a Session starts, the selected preset is the Game build default preset and no Preset edit exists.
- **Selection:** The Session controller may select any preset the Game build supplies. Selecting a preset changes no
  Preset edit.
- **Edits:** The Session controller may set a Preset edit for any Campaign configuration value of any preset, whether
  the value is adjustable during play or fixed after creation. A Preset edit must be a permitted value of that
  Campaign configuration value; an invalid Preset edit is rejected and changes nothing. Removing a Preset edit restores
  the preset's own value.
- **Edits belong to their preset:** Each preset has its own Preset edits. Selecting another preset neither discards
  nor applies them, and selecting the preset again shows them as they were left.
- **Creation:** Campaign creation uses the selected preset and that preset's Preset edits, as the
  [Configuration cascade](#configuration-cascade) states. Preset edits of presets that are not selected have no effect.
  A successful campaign creation then discards every Preset edit of every preset and selects the Game build default
  preset, so the next Campaign is set up from scratch. A failed campaign creation changes neither.
- **Lifetime:** The Session holds the preset selection and the Preset edits, under
  [Data ownership](engine-contract.md#data-ownership). They are never persisted, and they are discarded when the
  Session ends. Loading or closing a Campaign changes neither.

The Session controller reads and changes the preset selection and the Preset edits through these operations. The
list is complete, apart from `session.newCampaign.create(options)`, which
[Campaign lifecycle](engine-contract.md#campaign-lifecycle) owns.

| Operation                                             | Effect                                                                                                                                                                                                                                                             |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `session.newCampaign.listPresets()`                   | Reports every preset the Game build supplies, which one is the Game build default preset, which one is selected, and which have Preset edits.                                                                                                                      |
| `session.newCampaign.getPreset(preset)`               | Reports every Campaign configuration value of `preset`: the preset's own value, its Preset edit if one exists, the permitted values a Preset edit may set, and whether the value is adjustable during play or fixed after creation. `preset` need not be selected. |
| `session.newCampaign.getSetup()`                      | Reports the selected preset and the value campaign creation would use for each of its Campaign configuration values, i.e. its Preset edit where one exists and the preset's own value otherwise.                                                                   |
| `session.newCampaign.selectPreset(preset)`            | Selects `preset`, under the Selection rule.                                                                                                                                                                                                                        |
| `session.newCampaign.setPresetEdit(preset, value)`    | Sets a Preset edit of `preset`, under the Edits rule.                                                                                                                                                                                                              |
| `session.newCampaign.removePresetEdit(preset, value)` | Removes a Preset edit of `preset`, under the Edits rule.                                                                                                                                                                                                           |

Storing a selected preset or Preset edits beyond the Session is out of scope; e.g., a player-saved custom preset or a
remembered last selection.

# Changing Campaign configuration during play

Difficulty is represented by Campaign configuration. Players must be able to change difficulty during an ongoing
Campaign without restarting it or enabling Dev mode, so the Campaign configuration values representing difficulty are
adjustable during play.

A Campaign configuration change follows these complete rules:

- **Only adjustable values:** A change may name only values that are adjustable during play. A request naming a value
  that is fixed after creation is invalid.
- **All or nothing:** The complete requested change is validated before it is committed. An invalid request leaves
  Campaign state unchanged.
- **One action:** An accepted change is committed atomically as one Timeline entry and does not advance the turn.
- **No change:** A request that leaves Campaign configuration unchanged follows the rule for an action with no effect
  under [Player queries and actions](engine-contract.md#player-queries-and-actions).
- **No rewriting:** Changing Campaign configuration alone never regenerates existing World state, rewrites past
  outcomes, or redraws random outcomes. Any such effect requires an explicit rule in the Mechanics specification
  owning the value.

The public command and report signatures remain an open decision. Interface specifications must expose these rules
and must not introduce different validation or timing.

# What each Campaign configuration value must state

The Mechanics specification owning a Campaign configuration value states all of the following:

- its Type and its permitted values;
- whether it is adjustable during play or fixed after creation, under
  [Campaign state composition](campaign-state.md#campaign-state-composition);
- for a value fixed after creation, how campaign creation uses it; e.g., starting money becomes the Agency's initial
  money;
- for a value adjustable during play, when a change takes effect and whether it affects existing World state, future
  calculations or generation, or both, including how activities already underway are treated.

Examples of possible values are enemy count and an investigation difficulty multiplier; they establish no inventory
and no balance values. The values themselves are supplied by the Campaign configuration presets, which are GDRs.

# Edge cases and failure behavior

If a value stored in Global configuration is invalid in the current Game build, the Game build default applies and
the problem is reported. Starting the game never fails because of an invalid stored value.

# Acceptance examples

These examples use a Game build with two presets: Standard, the Game build default preset, with starting money 100
and investigation difficulty multiplier 1; and Hard, with starting money 60 and investigation difficulty multiplier 2.

- **Values copied at creation:** Select Hard and create Campaign A. Then select Hard, set a Preset edit of starting
  money 80, and create Campaign B. A records starting money 60 and B records 80; both record multiplier 2. A later
  Game build changing Hard's starting money to 50 changes neither A nor B, and loading a Campaign save of either
  restores its own values ([Configuration cascade](#configuration-cascade)).
- **Edits survive switching presets:** Select Hard and set a Preset edit of starting money 80. Select Standard, then
  select Hard again. Hard shows starting money 80 and multiplier 2; while Standard was selected it showed starting
  money 100 and multiplier 1 ([Preset selection and edits](#preset-selection-and-edits)).
- **Creation discards edits:** Select Hard, set a Preset edit of starting money 80, and create a Campaign. Afterwards
  the selected preset is Standard, and selecting Hard shows starting money 60
  ([Preset selection and edits](#preset-selection-and-edits)).
- **New Session starts from the default:** Select Hard, set a Preset edit of starting money 80, and end the Session
  without creating a Campaign. In the next Session the selected preset is Standard, and selecting Hard shows starting
  money 60 ([Preset selection and edits](#preset-selection-and-edits)).
- **Invalid edit:** Set a Preset edit of starting money to a value that Campaign configuration value does not permit.
  The request is rejected, and Hard still shows its previous starting money
  ([Preset selection and edits](#preset-selection-and-edits)).
- **Adjustment during play:** In an ongoing Campaign, submit valid values for adjustable Campaign configuration values,
  different from the current ones. The requested values commit together, the turn remains unchanged, and the change
  is one Timeline entry ([Changing Campaign configuration during play](#changing-campaign-configuration-during-play)).
- **Invalid adjustment:** Submit a change containing a value outside its permitted values. The whole request fails,
  and both Campaign configuration and World state remain unchanged
  ([Changing Campaign configuration during play](#changing-campaign-configuration-during-play)).
- **Fixed value:** Submit a change containing a valid value for an adjustable value and a different value for a value
  that is fixed after creation. The whole request fails, and both Campaign configuration and World state remain
  unchanged ([Changing Campaign configuration during play](#changing-campaign-configuration-during-play)).
- **Unset setting follows the Game build:** The player never sets the language. A later Game build changes the Game
  build default language, and the game starts in the new default ([Global configuration](#global-configuration)).
- **Changing a setting without a Campaign:** In a Session with no Current campaign, set the volume through
  `session.globalConfiguration.set`. `get()` reports the new volume as a stored value. End the Session and start a
  new one: the volume is still the stored value. `reset` it, and `get()` reports the Game build default volume
  ([Global configuration](#global-configuration)).
- **Listing presets and their values:** `listPresets()` reports Standard and Hard, with Standard as both the Game
  build default preset and the selected preset. Set a Preset edit of starting money 80 for Hard. `getPreset` for Hard
  reports starting money with the preset's own value 60 and the Preset edit 80, and `listPresets()` reports that Hard
  has Preset edits ([Preset selection and edits](#preset-selection-and-edits)).
- **Invalid stored value:** Global configuration stores a volume that the current Game build does not allow. The game
  starts with the Game build default volume and reports the problem
  ([Edge cases and failure behavior](#edge-cases-and-failure-behavior)).

# Open decisions

- TODO: Define the inventory of Campaign configuration values that are adjustable during play, the Mechanics
  specification owning each, and the public command and report signatures in the Interfaces specifications.
