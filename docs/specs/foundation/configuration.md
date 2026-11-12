# Configuration

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | CONFIG                                                         |
| Family      | Foundation                                                     |
| Status      | Draft                                                          |
| Audience    | Engine designer, UI designer, Implementer                      |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Overview

This document defines the kinds of setting the game has, what Global configuration holds, the configuration
cascade that gives every setting its effective value, and how the player selects and edits a Campaign configuration
preset before creating a Campaign.

It owns where a setting lives and which value applies. Which Campaign configuration values exist and what they do is
owned by the specifications using them, e.g. [Campaign](../mechanics/campaign.md).

# Relationships

- Uses [Campaign State](./campaign-state.md)
- Uses [Core Concepts](./core-concepts.md)
- Uses [Domain Model](./domain-model.md)
- Uses [Engine Contract](./engine-contract.md)

# Glossary

Global configuration, Game storage, Campaign save, and Dev mode are defined by the
[Engine Contract glossary](engine-contract.md#glossary). Campaign configuration is defined by the
[Campaign State glossary](campaign-state.md#glossary). Campaign configuration preset and Game build default preset are
defined by the [Domain Model glossary](domain-model.md#glossary).

| Term               | Definition                                                                                                                                                  |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Game build default | The value the Game build supplies for a Global configuration setting when nothing overrides it.                                                             |
| Preset edit        | A value the player sets before creating a Campaign to override one Campaign configuration value of one Campaign configuration preset. The Session holds it. |

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

Global configuration stores only values the player has set. A setting the player has not set follows the current
Game build default, so a changed Game build default in a later Game build reaches it. Resetting a setting removes its
stored value.

Global configuration holds nothing that campaign creation uses: creating a Campaign neither reads nor changes it.
Campaign-specific overrides of global preferences are out of scope.

# Configuration cascade

The effective value of each setting follows this complete rule set:

| Setting scope     | Effective value                                                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Global preference | A value stored in Global configuration overrides the Game build default.                                                         |
| New Campaign      | A Preset edit for the selected Campaign configuration preset overrides that preset's value.                                      |
| Existing Campaign | Its own Campaign configuration applies, including changes committed during play and the values restored by undo, redo, and load. |

Which preset is selected, and which Preset edits exist, follows [Preset selection and edits](#preset-selection-and-edits).
Presets and the completeness of each preset are owned by
[Campaign configuration ownership](domain-model.md#campaign-configuration-ownership).

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

Storing a selected preset or Preset edits beyond the Session is out of scope; e.g., a player-saved custom preset or a
remembered last selection.

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
- **Unset setting follows the Game build:** The player never sets the language. A later Game build changes the Game
  build default language, and the game starts in the new default ([Global configuration](#global-configuration)).
- **Invalid stored value:** Global configuration stores a volume that the current Game build does not allow. The game
  starts with the Game build default volume and reports the problem
  ([Edge cases and failure behavior](#edge-cases-and-failure-behavior)).
