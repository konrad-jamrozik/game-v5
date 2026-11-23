# About Design specifications

> Informative overview. It owns no rules; each linked specification owns its content.

# What Design specifications are for

Design specifications describe the game itself: they hold every design decision, each stated once, and the Implementation follows them. They state the decisions the Game designer made, the invariants that must hold, and the vocabulary and explanations both need; whatever they do not state is decided by the code.

# Families

The Design specifications divide into a game engine and what builds on it.

- [About the Foundation family](foundation/about-foundation.md): the vocabulary, engine guarantees, and data contracts that every other Design specification relies on.
- [About the Mechanics family](mechanics/about-mechanics.md): the game concepts and the rules of each game system.
- [About the Content family](content/about-content.md): the GDRs and starting configurations the rules read.
- [About the UI family](ui/about-ui.md): how a user interface presents the engine API to the Player.
- [About the Autopilot AIs family](autopilot-ais/about-autopilot-ais.md): how each Autopilot AI chooses its Player actions.

# Why these boundaries

Foundation and Mechanics together form the game engine; Content, UI, and Autopilot AIs build on it without changing it. That split lets content, interfaces, and AIs vary independently of the rules: e.g., a new user interface needs no change to any Mechanics specification.
