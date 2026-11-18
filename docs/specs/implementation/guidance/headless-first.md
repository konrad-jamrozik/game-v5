# Headless First

| Metadata | Value |
| --- | --- |
| Spec ID | HEADLESS |
| Family | Guidance |
| Audience | Implementer |
| Owns | Guidance that an Implementation becomes fully playable headlessly, through its Command-Line Interface, before work on its Graphical User Interface begins. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Implementation Specification Conventions](../../governance/conventions/implementation-spec-conventions.md) |

# Overview

A graphical interface is the most expensive part of an Implementation to build and the part most likely to change, and it can hide a defect of the engine behind its presentation. The engine, by contrast, is what every specification checks.

So an Implementation is suggested to be built headless first: the engine and its [Command-Line Interface](../../design/ui/cli.md) come first, and work on the [Graphical User Interface](../../design/ui/gui.md) begins only once the whole game can be played through the Command-Line Interface. The Graphical User Interface then adds presentation only, over an engine API that is already known to work.

# Headless milestone

The Headless milestone is reached when each of the following can be done through the Command-Line Interface alone. The list is exhaustive.

- Create a [Campaign](../../design/foundation/core-concepts.md#campaign-and-session) and play it to its end.
- Save it, and load the [Campaign save](../../design/foundation/engine-contract.md#persisted-data) again.
- Undo and redo within a [Turn](../../design/foundation/engine-contract.md#player-actions-and-turns) and across Turns.
- Engage [Autopilot](../../design/foundation/engine-contract.md#autopilot) and let it play.
- Enable [Dev mode](../../design/foundation/engine-contract.md#principals-and-access) and use the [Developer API](../../design/foundation/engine-contract.md#api-surfaces).

Work on the Graphical User Interface is suggested to begin only after the Headless milestone. A change to the engine API that the Graphical User Interface later needs is made reachable through the Command-Line Interface in the same change, so that the whole game stays playable headlessly.

# Supported observable contract

**Informative rationale:** Every user interface is equivalent to the engine API it adapts, under [API hierarchy](../../design/foundation/engine-contract.md#api-hierarchy), so the order in which interfaces are built is not observable. An Implementation built in another order satisfies every specification all the same.
