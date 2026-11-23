# Game Specification Index

| Metadata | Value                                                                    |
| -------- | ------------------------------------------------------------------------ |
| Spec ID  | INDEX                                                                    |
| Family   | Conventions                                                              |
| Audience | Engine designer, Content designer, UI designer, AI designer, Implementer |
| Owns     | Specification registration, navigation, and ownership summaries.         |

# Overview

The game is specified in many focused documents rather than one large one, so that each subject can be read, reviewed, and changed on its own. The [Game Design Brief](../game-design-brief.md) says what the game is meant to be; the specifications record what was decided about it.

The specifications divide by what they govern into three Specification kinds, each divided into Families. Each specification registers itself through its own metadata, and the generated [derived specification catalog](../derived/README.md) lists every specification by Family with its ID, title, and Owns summary, so no hand-kept list can fall out of date.

# Start here

These documents give the context every specification assumes: what the game is meant to be, how specifications are written and related, and how the game is developed.

- [Game Design Brief](../game-design-brief.md): strategic intent and architectural constraints.
- [Specification Conventions](governance/conventions/spec-conventions.md): layout, ownership, wording, and how specifications change.
- [Artifact Relationships](governance/conventions/artifact-relationships.md): how linking a term to its definition makes one specification reference another, and how the references form layers.
- [Development Loop](governance/process/development-loop.md): which artifact is the truth for which question, and how a change reaches the game.

# Specification kind and Family overviews

Each Specification kind and each Family has an informative overview that explains how its subjects are divided and why.

- [About Governance specifications](governance/about-governance.md)
  - [About the Conventions family](governance/conventions/about-conventions.md)
  - [About the Process family](governance/process/about-process.md)
- [About Design specifications](design/about-design.md)
  - [About the Foundation family](design/foundation/about-foundation.md)
  - [About the Mechanics family](design/mechanics/about-mechanics.md)
  - [About the Content family](design/content/about-content.md)
  - [About the UI family](design/ui/about-ui.md)
  - [About the Autopilot AIs family](design/autopilot-ais/about-autopilot-ais.md)
- [About Implementation specifications](implementation/about-implementation.md)
  - [About the Mandatory family](implementation/mandatory/about-mandatory.md)
  - [About the Guidance family](implementation/guidance/about-guidance.md)
  - [About the Recipes family](implementation/recipes/about-recipes.md)

# Family architecture

The diagram shows which Families build on which, so it can be compared with the Builds on column of the [Families table](governance/conventions/spec-conventions.md#specification-kinds-and-families). `npm run docs:generate` draws it from the references between the specifications, and it is never edited by hand: an arrow from one Family to another means a specification of the first references a specification of the second. The Governance specifications, which every specification follows, are not drawn.

![Family architecture](../images/diagrams/family-architecture.svg)

# Specification layers

The Foundation and Mechanics specifications form layers, each depending only on the layers below it. `npm run docs:generate` draws the following diagram from the references between the specifications, and it is never edited by hand. Every specification is in its Family's rectangle, in the row of its layer: one above the highest layer of the specifications of the same rectangle it depends on, so that a specification depending on none of them is in the bottom row. A specification that neither depends on nor is depended on by anything in its rectangle is drawn in the top row, nearest the specifications above that use it.

![Specification layers](../images/diagrams/specification-stack.svg)
