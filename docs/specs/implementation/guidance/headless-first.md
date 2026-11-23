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

So the whole game is suggested to stay playable through the [Command-Line Interface](../../design/ui/cli.md), and the [Graphical User Interface](../../design/ui/gui.md) to add presentation only, over an engine API that is already known to work. The order in which interfaces are built is not observable, because every user interface is [equivalent to the engine API it adapts](../../design/foundation/engine-contract.md#api-hierarchy).

# Headless milestone

The whole game is playable headlessly when each of the following can be done through the Command-Line Interface alone: play a [Campaign](../../design/foundation/core-concepts.md#campaign-and-session) to its end, save and load it, undo and redo within a [Turn](../../design/foundation/engine-contract.md#player-actions-and-turns) and across Turns, let [Autopilot](../../design/foundation/engine-contract.md#autopilot) play, and use the [Developer API](../../design/foundation/engine-contract.md#api-surfaces) in [Dev mode](../../design/foundation/engine-contract.md#principals-and-access).

A change to the engine API that the Graphical User Interface needs is suggested to be made reachable through the Command-Line Interface in the same change, so that the whole game stays playable headlessly.
