# Command-Line Interface

| Metadata | Value |
| --- | --- |
| Spec ID | CLI |
| Family | UI |
| Audience | UI designer, Implementer |
| Owns | Guidance on the command-line interface, the headless interface that makes the whole engine API playable from a terminal. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

Some players need no graphics at all, e.g. an LLM-based agent, a test script, or a human who wants to check a rule quickly. The Command-Line Interface (CLI) serves them: it is the engine API of the [Engine Contract](../foundation/engine-contract.md) made reachable from a terminal, with nothing between the two but reading commands and writing results.

Because it adds no presentation of its own, the CLI is headless: it shows what the engine API returns and nothing else. Everything a Player can do in the game can therefore be done through it, from the [Main menu](../foundation/campaign-lifecycle.md#glossary) to the end of a [Campaign](../foundation/core-concepts.md#campaign-and-session).

# Reach of the CLI

Every [Session API](../foundation/engine-contract.md#api-surfaces) and [Player API](../foundation/engine-contract.md#api-surfaces) operation of the [API hierarchy](../foundation/engine-contract.md#api-hierarchy) is reachable through the CLI, and so is every [Developer API](../foundation/engine-contract.md#api-surfaces) operation while [Dev mode](../foundation/engine-contract.md#principals-and-access) is enabled.

# Output forms

The CLI reports the result of each operation in two forms, each complete on its own:

- **Readable output:** text that a human can read in a terminal.
- **Structured output:** a machine-readable form of the same result, for a script or an LLM-based agent.

Both forms carry [exactly what the engine API returns](../foundation/player-api.md#information-boundary), so a caller never needs the other form to learn more. E.g., a Compendium article is reported in its [resolved form](../mechanics/compendium.md#article-resolution), so both forms give the text, the inserted values, and the Article links that the graphical user interface shows.

# TODOs

- TODO: State how the CLI names [the operations it reaches](#reach-of-the-cli) and their arguments, and how a caller discovers the available ones.
- TODO: State how a caller chooses between [readable and structured output](#output-forms), and what the structured output looks like.
