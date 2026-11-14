# Campaign Lifecycle

| Metadata    | Value                                                                                                      |
| ----------- | ---------------------------------------------------------------------------------------------------------- |
| Spec ID     | LIFE                                                                                                       |
| Family      | Foundation                                                                                                 |
| Status      | Draft                                                                                                      |
| Audience    | Engine designer, UI designer, AI designer, Implementer                                                     |
| Owns        | Session start and end, creating, loading, selecting, and closing the Current campaign, and Session status. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                                             |

# Overview

A [Session](core-concepts.md#glossary) is one run of the game. It starts when the game starts, at the Main menu with no
Current campaign, and ends when the game exits. During a Session a Campaign becomes the Current campaign by creation or
by load, and the Current campaign is closed on request. `session.getStatus()` reports whether a Current campaign
exists, and a fixed set of Session API operations needs no Current campaign. Nothing a Session holds is persisted,
under [Data ownership](engine-contract.md#data-ownership).

# Relationships

- Uses [Core Concepts](./core-concepts.md)
- Uses [Engine Contract](./engine-contract.md)
- Used by [Configuration](./configuration.md)
- Used by [Determinism and Randomness](./determinism-and-randomness.md)
- Used by [Developer Access](./developer-access.md)
- Used by [Saves](./saves.md)
- Used by [Web UI](../ui/web-ui.md)

# Glossary

These terms are specific to Campaign Lifecycle. General terms are in the
[Core Concepts glossary](core-concepts.md#glossary) and the [Engine Contract glossary](engine-contract.md#glossary).

| Term               | Definition                                                                                                                             |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| Campaign selection | The Session's choice of Current campaign, made by a successful campaign creation or load and ended by closure or by another selection. |
| Main menu          | The state of a Session that has no Current campaign; e.g., a newly opened Session is at the Main menu.                                 |

# Session lifecycle

A Session starts when the game starts and ends when the game exits. A newly opened Session is at the Main menu, with no
Current campaign and Dev mode disabled.

![Campaign lifecycle: a Session starts with no Current campaign, create or load selects one, close removes it, and the Session ends when the game exits](../../images/campaign-lifecycle.svg)

`session.getStatus()` reports whether a Current campaign exists and the Session's access and Autopilot status. It also
reports the Campaign seed, under [Campaign seed](determinism-and-randomness.md#campaign-seed).

# Campaign selection

The following operations are the complete set that change the Campaign selection:

- **Create:** `session.campaign.create(options)` creates a Campaign using the current Game build and the
  Session's new-Campaign setup, and selects it as the Current campaign. A newly created Campaign has a Timeline with no
  Player actions, no Autopilot memory, and no Campaign save, so the Session has no Current save.
- **Load:** `session.saves.load(save)` restores a Campaign save and selects its Campaign as the Current campaign.
  What loading restores is stated under [Loading](saves.md#loading).
- **Close:** `session.campaign.close()` removes the Current campaign and returns the Session to the Main menu.

Every successful create, load, or close has these effects:

- Access granted for the previous Current campaign ends; e.g., an Autopilot AI's access ends under
  [API hierarchy](engine-contract.md#api-hierarchy).
- Dev mode is disabled, under [Dev mode](developer-access.md#dev-mode).
- The previous Current campaign is not saved; closing or replacing it never writes a Campaign save.

A failed create or load leaves the Session exactly as it was, including its Current campaign.

# Operations without a Current campaign

The following Session API operations need no Current campaign, and this list is complete: `session.getStatus()`,
every `session.globalConfiguration` operation, `session.saves.list()`, `session.saves.load(save)`, `session.campaign.create(options)`, every
`session.newCampaignSetup` operation, and `session.autopilot.listAutopilotAis()`. Every other operation that depends on a
Campaign fails when no Current campaign exists, and the failure changes nothing, under
[Committed state integrity](engine-contract.md#committed-state-integrity).

# Acceptance examples

- **Session without a Campaign:** Start the game before selecting a playthrough. It is a Session at the Main menu with
  no Current campaign, not an empty Campaign, and a gameplay query fails without mutation
  ([Operations without a Current campaign](#operations-without-a-current-campaign)).
- **Session not persisted:** Select a Campaign, save it, exit, and start the game again. The new Session has no
  Current campaign until the Campaign save is loaded, and loading restores the Campaign's saved data but none of the
  earlier Session's runtime state ([Session lifecycle](#session-lifecycle), [Campaign selection](#campaign-selection)).
- **Closing does not save:** Create a Campaign, commit an action, and close it. No Campaign save exists afterwards, and
  `session.getStatus()` reports no Current campaign ([Campaign selection](#campaign-selection)).
- **Failed load keeps the Campaign:** With Campaign A current, load a Campaign save that the Game build cannot load.
  The load fails and Campaign A is still the Current campaign ([Campaign selection](#campaign-selection)).
