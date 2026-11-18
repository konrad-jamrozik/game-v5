# Game Specification Index

| Metadata | Value                                                                    |
| -------- | ------------------------------------------------------------------------ |
| Spec ID  | INDEX                                                                    |
| Family   | Conventions                                                              |
| Audience | Engine designer, Content designer, UI designer, AI designer, Implementer |
| Owns     | Specification registration, navigation, and ownership summaries.         |

# Overview

The game is specified in many focused documents rather than one large one, so that each subject can be read, reviewed, and changed on its own. The [Game Design Brief](../game-design-brief.md) says what the game is meant to be; the specifications make it exact.

The specifications divide first by what they govern into three Specification kinds: Governance specifications govern the specifications themselves, Design specifications describe the game, and Implementation specifications steer how an Implementation is built. Each Specification kind is divided into Families. Each specification registers itself through its own metadata, and the generated [derived specification catalog](../derived/README.md) lists them all, so no hand-kept list can fall out of date.

# Start here

These documents give the context every specification assumes: what the game is meant to be, how specifications are written and related, and how the work on them proceeds.

- [Game Design Brief](../game-design-brief.md): strategic intent and architectural constraints.
- [Specification Conventions](governance/conventions/spec-conventions.md): layout, precision requirements, ownership, and how specifications change.
- [Artifact Relationships](governance/conventions/artifact-relationships.md): how linking a term to its definition makes one specification reference another, and how the references form layers.
- [Specification work plan and backlog](governance/process/work-plan.md): review batches, parallel tracks, checkpoints, and current work state.
- [Outstanding work items](governance/process/work-todos.md): known issues in the specifications awaiting scheduling, each with its affected batches.

# Specification kind and Family overviews

Each Specification kind has an informative overview that explains what it governs and why its Families are divided as they are. Each Family has an informative overview that explains what each of its specifications is for, how they relate, and why the boundaries between them sit where they do; it includes generated relationship diagrams.

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

Foundation and Mechanics together form the game engine. Content, UI, and Autopilot AIs build on the game engine, and the Implementation Families build on all the Design Families, as the Builds on column of the Families table in [Specification kinds and Families](governance/conventions/spec-conventions.md#specification-kinds-and-families) states. Every specification also follows the Governance specifications, which the diagram does not draw. `npm run docs:generate` draws the following diagram from the references between the specifications: an arrow from one Family to another means a specification of the first references a specification of the second. Do not edit it by hand.

![Family architecture](../images/diagrams/family-architecture.svg)

# Specification layers

The Foundation and Mechanics specifications form layers, each depending only on the layers below it. `npm run docs:generate` draws the following diagram from the references between the specifications; do not edit it by hand. Every specification is in its Family's rectangle, in the row of its layer: one above the highest layer of the specifications of the same rectangle it depends on, so that a specification depending on none of them is in the bottom row. A specification that neither depends on nor is depended on by anything in its rectangle is drawn in the top row, nearest the specifications above that use it.

![Specification layers](../images/diagrams/specification-stack.svg)

# Specification catalog

Each specification registers itself through its own metadata table, including its Spec ID, Family, and an Owns summary of what it owns. The generated [derived specification catalog](../derived/README.md) lists every specification by Family with its ID, title, and Owns summary, and links the derived glossary and relationship graphs.

# Work plan

The [work plan and backlog](governance/process/work-plan.md) sets the authoring sequence and review checkpoints. Start with the batch 1 specifications; grow GDRs alongside the reviewed mechanics. See that document for the full sequence, current work states, and treatment of cross-specification dependencies.
