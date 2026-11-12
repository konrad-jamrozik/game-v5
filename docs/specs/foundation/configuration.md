# Configuration

| Metadata    | Value                                                          |
| ----------- | -------------------------------------------------------------- |
| Spec ID     | CONFIG                                                         |
| Family      | Foundation                                                     |
| Status      | Draft                                                          |
| Audience    | Engine designer, UI designer, Implementer                      |
| Conventions | [Specification conventions](../governance/spec-conventions.md) |

# Overview

This document defines the kinds of setting the game has, what Global configuration holds, and the configuration
cascade that gives every setting its effective value.

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
[Campaign State glossary](campaign-state.md#glossary).

| Term                 | Definition                                                                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Game build default   | The value the Game build supplies for a setting when nothing overrides it.                                                                                         |
| New-Campaign default | A value stored in Global configuration that campaign creation uses for a Campaign configuration value when the player makes no explicit choice for it at creation. |

# Kinds of setting

Three kinds of setting are distinct. This list is complete, and only the last two take part in the
[Configuration cascade](#configuration-cascade).

| Kind                   | Examples                                      | Where it lives                            | Persisted         |
| ---------------------- | --------------------------------------------- | ----------------------------------------- | ----------------- |
| Session access setting | E.g., Dev mode                                | Session                                   | Never             |
| Global configuration   | E.g., volume, language, New-Campaign defaults | Game storage                              | Yes, one set      |
| Campaign configuration | E.g., an investigation difficulty multiplier  | Campaign state, within each Campaign save | Yes, per Campaign |

# Global configuration

Global configuration is read when a Session starts, so its settings apply at the main menu before any Campaign is
selected. Selecting, creating, or loading a Campaign never replaces Global configuration, and a Campaign save does
not contain it. Interface preferences belong to Global configuration, e.g. volume, language, and tutorial popups.

Global configuration stores only values the player has set. A setting the player has not set follows the current
Game build default, so a changed Game build default in a later Game build reaches it. Resetting a setting removes its
stored value.

Creating a Campaign does not change the stored New-Campaign defaults. The player changes them only through a
separate, explicit action. Campaign-specific overrides of global preferences are out of scope.

# Configuration cascade

The effective value of each setting follows this complete rule set:

| Setting scope     | Effective value                                                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Global preference | A value stored in Global configuration overrides the Game build default.                                                         |
| New Campaign      | An explicit choice at creation overrides a New-Campaign default, which overrides the Game build default.                         |
| Existing Campaign | Its own Campaign configuration applies, including changes committed during play and the values restored by undo, redo, and load. |

For a Campaign configuration value, the Game build default is the value produced by the starting-configuration GDRs
under [Campaign configuration ownership](domain-model.md#campaign-configuration-ownership).

Campaign creation resolves every Campaign configuration value through this cascade and records the complete result in
the initial Campaign state; no Campaign configuration value is left to be resolved later. Values are copied at
creation, not inherited: changing a New-Campaign default or a Game build default never changes an existing Campaign,
and loading a Campaign save restores its Campaign configuration regardless of the current Global configuration.

# Edge cases and failure behavior

If a value stored in Global configuration is invalid in the current Game build, the Game build default applies and
the problem is reported. Starting the game never fails because of an invalid stored value.

# Acceptance examples

- **Defaults copied at creation:** With a stored New-Campaign default difficulty of hard, create Campaign A without an
  explicit choice and Campaign B choosing easy. A records hard and B records easy. Changing the stored New-Campaign
  default to normal changes neither A nor B, and loading a Campaign save of either restores its own value
  ([Configuration cascade](#configuration-cascade)).
- **Unset setting follows the Game build:** The player never sets the language. A later Game build changes the Game
  build default language, and the game starts in the new default ([Global configuration](#global-configuration)).
- **Invalid stored value:** Global configuration stores a volume that the current Game build does not allow. The game
  starts with the Game build default volume and reports the problem
  ([Edge cases and failure behavior](#edge-cases-and-failure-behavior)).

# Open decisions

- TODO: Decide whether an explicit choice at creation and a New-Campaign default select among starting-configuration
  GDRs, set individual Campaign configuration values, or both, consistently with
  [Campaign configuration ownership](domain-model.md#campaign-configuration-ownership).
