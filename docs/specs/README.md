# Game Specification Index

| Metadata | Value                                                                    |
| -------- | ------------------------------------------------------------------------ |
| Spec ID  | INDEX                                                                    |
| Family   | Governance                                                               |
| Status   | Draft                                                                    |
| Audience | Engine designer, Content designer, UI designer, AI designer, Implementer |
| Owns     | Specification registration, navigation, and ownership summaries.         |

# Overview

This index is the navigation entry point to the specifications. Each specification registers itself through its own
metadata, and the generated catalog lists them all. It does not define gameplay behavior.

# Start here

- [Game Design Brief](../game-design-brief.md): strategic intent and architectural constraints.
- [Specification conventions](governance/spec-conventions.md): accepted layout, precision requirements, ownership, and lifecycle.
- [Artifact Relationships](governance/artifact-relationships.md): definitions of `follows`, `refines`, `uses`,
  `implements`, and `verifies`, with direction, inventory rules, and examples for all artifacts.
- [Specification relationship cycles](../spec-relationship-cycles.md): informative register of retained cycles,
  their contract meanings, and future removal criteria.
- [Specification work plan and backlog](governance/work-plan.md): accepted review batches, parallel tracks, checkpoints, and current work state.
- [Outstanding work items](governance/work-todos.md): known issues in the specifications awaiting scheduling, each with its affected batches.

# Family overviews

Each Family has an informative overview that explains what each of its specifications is for, how they relate, and why
the boundaries between them sit where they do. Each overview includes generated relationship diagrams.

- [About the Governance family](governance/about-governance.md)
- [About the Foundation family](foundation/about-foundation.md)
- [About the Mechanics family](mechanics/about-mechanics.md)
- [About the Content family](content/about-content.md)
- [About the UI family](ui/about-ui.md)
- [About the Autopilot AIs family](autopilot-ais/about-autopilot-ais.md)
- [About the Implementation family](implementation/about-implementation.md)

# Family architecture

Foundation and Mechanics together form the game engine. Content, UI, and Autopilot AIs build on the game engine, and
Implementation builds on the game engine, Content, UI, and Autopilot AIs, as the Builds on column of the Families table in
[Specification families and paths](governance/spec-conventions.md#specification-families-and-paths) states. Every
specification also follows the Governance family. `npm run docs:generate` draws the following diagram from the
relationships the specifications declare: an arrow from one Family to another means a specification of the first uses
or refines a specification of the second. Do not edit it by hand.

![Family architecture](../images/family-architecture.svg)

# Specification layers

The Foundation and Mechanics specifications form layers, each depending only on the layers below it.
`npm run docs:generate` draws the following diagram from the specifications' Relationships sections; do not edit it by
hand. Every specification is in its Family's rectangle, in the row of its layer: one above the highest layer of the specifications of the same rectangle it depends on, so that a
specification depending on none of them is in the bottom row. A specification that neither depends on nor is depended
on by anything in its rectangle is drawn in the top row, nearest the specifications above that use it.

![Specification layers](../images/specification-stack.svg)

# Specification catalog

Each specification registers itself through its own metadata table, including its Spec ID, Family, and an Owns
summary of what it owns. The generated [derived specification catalog](../derived/README.md) lists every
specification by Family with its ID, title, status, and Owns summary, and links the derived glossary and relationship
graphs.

# Work plan

The [work plan and backlog](governance/work-plan.md) owns the accepted authoring sequence and review checkpoints. Start with
the batch 1 specifications; grow GDRs alongside the reviewed mechanics. See that document for
the full sequence, current work states, and treatment of cross-specification dependencies.
