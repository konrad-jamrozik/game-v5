# Campaign Lifecycle

| Metadata | Value |
| --- | --- |
| Spec ID | LIFE |
| Family | Foundation |
| Audience | Engine designer, UI designer, AI designer, Implementer |
| Owns | Session start and end, creating, loading, selecting, and closing the Current campaign, and Session status. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

Running the game and playing a [Campaign](core-concepts.md#campaign-and-session) are separate things. A [Session](core-concepts.md#campaign-and-session) is one run of the game, from start to exit, while a Campaign is a playthrough that can span many Sessions through its [Campaign saves](engine-contract.md#persisted-data). The game starts at the Main menu, where the Session has no [Current campaign](core-concepts.md#campaign-and-session), and only a few [Session API](engine-contract.md#api-surfaces) operations work there, e.g. listing Campaign saves.

A Session plays at most one Campaign at a time, its Current campaign. Creating a Campaign or loading a Campaign save selects it, and closing it returns the Session to the Main menu; this Campaign selection changes on request only. [Nothing a Session holds is persisted](engine-contract.md#data-ownership), so replacing or closing the Current campaign never writes a Campaign save, and every new Session starts at the Main menu again.

# Glossary

| Term | Definition |
| --- | --- |
| Campaign selection | The [Session](core-concepts.md#campaign-and-session)'s choice of [Current campaign](core-concepts.md#campaign-and-session), made by a successful campaign creation or load and ended by closure or by another selection. |
| Main menu | The state of a Session that has no Current campaign; e.g., a newly opened Session is at the Main menu. |

# Session lifecycle

A Session starts when the game starts and ends when the game exits. A newly opened Session is at the Main menu, with no Current campaign and [Dev mode](engine-contract.md#principals-and-access) disabled.

![Campaign lifecycle: a Session starts with no Current campaign, create or load selects one, close removes it, and the Session ends when the game exits](../../../images/diagrams/campaign-lifecycle.svg)

`session.getStatus()` reports whether a Current campaign exists and the Session's access and [Autopilot](engine-contract.md#autopilot) status.

# Campaign selection

The Campaign selection decides which [Campaign](core-concepts.md#campaign-and-session), if any, the Session is playing. Three operations change it:

- **Create:** `session.campaign.create(options)` creates a Campaign using the current [Game build](core-concepts.md#game-build-and-content) and the Session's new-Campaign setup, gives it the [Campaign name](saves.md#identifiers) that `options` holds, if any, and selects it as the Current campaign.
- **Load:** `session.saves.load(save)` [restores a Campaign save](saves.md#loading) and selects its Campaign as the Current campaign.
- **Close:** `session.campaign.close()` removes the Current campaign and returns the Session to the Main menu.

Every successful create, load, or close disables Dev mode. Closing or replacing the previous Current campaign writes no [Campaign save](engine-contract.md#persisted-data): its [Current Autosave](saves.md#autosave-kinds) already holds its [Current world state](engine-contract.md#player-actions-and-turns).

A failed create or load leaves the Session exactly as it was, including its Current campaign.

# Operations without a Current campaign

At the Main menu the Session still has to be managed before any Campaign is current, e.g. to load a Campaign save or create a Campaign.

These [Session API](engine-contract.md#api-surfaces) operations need no Current campaign: `session.getStatus()`, every `session.globalConfiguration` operation, `session.saves.list()`, `session.saves.load(save)`, `session.saves.delete(save)`, `session.saves.deleteCampaign(campaign)`, `session.campaign.create(options)`, every `session.newCampaignSetup` operation, and `session.autopilot.listAutopilotAis()`. Every other operation that depends on a Campaign fails when no Current campaign exists.
