# Command-Line Interface

| Metadata    | Value                                                                                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | CLI                                                                                                                                                                        |
| Family      | UI                                                                                                                                                                         |
| Audience    | UI designer, Implementer                                                                                                                                                   |
| Owns        | Guidance on the command-line interface, the headless interface that makes the whole engine API playable from a terminal.                                                   |
| Conventions | [Specification conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

Some players need no graphics at all, e.g. an LLM-based agent, a test script, or a human who wants to check a rule
quickly. The Command-Line Interface (CLI) serves them: it is the engine API of the
[Engine Contract](../foundation/engine-contract.md) made reachable from a terminal, with nothing between the two but
reading commands and writing results.

Because it adds no presentation of its own, the CLI is headless: it shows what the engine API returns and nothing else.
Everything a Player can do in the game can therefore be done through it, from the [Main menu](../foundation/campaign-lifecycle.md#glossary) to the end of a [Campaign](../foundation/core-concepts.md#campaign-and-session).

# Reach of the CLI

Every [Session API](../foundation/engine-contract.md#api-surfaces) and [Player API](../foundation/engine-contract.md#api-surfaces) operation under [API hierarchy](../foundation/engine-contract.md#api-hierarchy) is
reachable through the CLI, and so is every [Developer API](../foundation/engine-contract.md#api-surfaces) operation while [Dev mode](../foundation/engine-contract.md#principals-and-access) is enabled. A whole [Session](../foundation/core-concepts.md#campaign-and-session) can
therefore be carried out through it, under [Session lifecycle](../foundation/campaign-lifecycle.md#session-lifecycle):
e.g. creating a Campaign, playing it to its end, saving and loading it, navigating the [Timeline](../foundation/engine-contract.md#persisted-data), and engaging [Autopilot](../foundation/engine-contract.md#autopilot).

# Output forms

The CLI reports the result of each operation in two forms, each complete on its own:

- **Readable output:** text that a human can read in a terminal.
- **Structured output:** a machine-readable form of the same result, for a script or an LLM-based agent.

Both forms carry exactly what the engine API returns, so a caller never needs the other form to learn more, under
[Information boundary](../foundation/player-api.md#information-boundary) in Player API.

# TODOs

- TODO: State how the CLI names operations and their arguments, and how a caller discovers the available ones, under
  [Reach of the CLI](#reach-of-the-cli).
- TODO: State how a caller chooses between readable and structured output, and what the structured output looks like,
  under [Output forms](#output-forms).
