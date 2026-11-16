# Headless First

| Metadata    | Value                                                                                                                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Spec ID     | HEADLESS                                                                                                                                                                                   |
| Family      | Guidance                                                                                                                                                                                   |
| Audience    | Implementer                                                                                                                                                                                |
| Owns        | Guidance that an Implementation becomes fully playable headlessly, through its Command-Line Interface, before work on its Graphical User Interface begins.                                 |
| Conventions | [Specification conventions](../../governance/conventions/spec-conventions.md), [Implementation Specification Conventions](../../governance/conventions/implementation-spec-conventions.md) |

# Overview

A graphical interface is the most expensive part of an Implementation to build and the part most likely to change, and
it can hide a defect of the engine behind its presentation. The engine, by contrast, is what every specification checks.

So an Implementation is suggested to be built headless first: the engine and its
[Command-Line Interface](../../design/ui/command-line-interface.md) come first, and work on the
[Graphical User Interface](../../design/ui/graphical-user-interface.md) begins only once the whole game can be played
through the Command-Line Interface. The Graphical User Interface then adds presentation only, over an engine API that is
already known to work.

# Relationships

- Uses [Command-Line Interface](../../design/ui/command-line-interface.md)
- Uses [Engine Contract](../../design/foundation/engine-contract.md)
- Uses [Graphical User Interface](../../design/ui/graphical-user-interface.md)

# Headless milestone

The Headless milestone is reached when each of the following can be done through the Command-Line Interface alone. The
list is exhaustive.

- Create a Campaign and play it to its end.
- Save it, and load the Campaign save again.
- Undo and redo within a Turn and across Turns.
- Engage Autopilot and let it play.
- Enable Dev mode and use the Developer API.

Work on the Graphical User Interface is suggested to begin only after the Headless milestone. A change to the engine API
that the Graphical User Interface later needs is made reachable through the Command-Line Interface in the same change,
so that the whole game stays playable headlessly.

# Supported observable contract

**Informative rationale:** Every user interface is equivalent to the engine API it adapts, under
[API hierarchy](../../design/foundation/engine-contract.md#api-hierarchy), so the order in which interfaces are built is
not observable. An Implementation built in another order satisfies every specification all the same.
