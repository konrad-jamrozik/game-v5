# SVG diagram generation plan

> Informative work plan. It owns no rules. Delete it when the work is done.

# Goal

Make `npm run docs:generate` write the "Within the family" diagram of each family overview as an SVG file, laid out
in tiers, so the diagram is easier to read than the Mermaid diagram and never goes stale.

The hand-drawn trial `docs/specs/mechanics/mechanics-tiers.svg` shows the intended look. It is not generated and is
removed by this work.

# Precondition

The Mechanics tier plan is applied: the Mechanics family has no dependency loop, so its tiers can be computed. The
trial file also draws the five relationships that plan removed; the generated diagram draws only current relationships.

# Scope

| Diagram                                        | This plan                 |
| ---------------------------------------------- | ------------------------- |
| "Within the family" in each `about-*.md`       | Replaced by an SVG image  |
| "Across families" in each `about-*.md`         | Stays Mermaid             |
| Diagrams under `docs/derived/`                 | Stay Mermaid              |
| `docs/spec-relationship-cycles.md` hand graphs | Unchanged; hand-kept file |

Clickable boxes are out of scope: an SVG shown as an image cannot carry links.

# Design

## Input

The same data the Mermaid diagram uses today in `scripts/spec-docs/generator.ts`: the specifications of one family
with Spec ID, title, and Status, and the uses and refines relationships between them.

## Tiers

- **Tier of a document:** one above the highest tier among the documents of the same family it uses or refines. A
  document depending on none is tier 1.
- **Loops:** the documents of one dependency loop share a tier, placed as if the loop were one document. The
  generator must not fail on a loop, because the governance rules permit uses loops.
- **Drawing order:** tier 1 is the bottom row, so every arrow outside a loop points down.

## Order within a tier

Left-to-right order is the one part automatic layout does badly, so it is hand-kept:

- **Hint:** one comment line in the overview file above the start marker, e.g.
  `<!-- diagram-order: AGENT | COMBAT ECON FACTION | MISSION -->`, listing Spec IDs per tier from tier 1 up.
- **Missing or partial hint:** documents not named are placed after the named ones in Spec ID order. A hint is never
  required.
- **Wrong hint:** a hint naming an unknown Spec ID, or placing a document in a tier other than its computed tier, is
  a `docs:generate` and `docs:check` error.

## Boxes and arrows

- **Box label:** the same text as today, e.g. `AGENT — Agents (Stub)`.
- **Box width:** estimated from the label's character count. The generator does not measure fonts.
- **Tier 1 with one document:** drawn as a wide slab under the whole diagram, as in the trial.
- **Arrow kinds:** a thin grey line for uses and a thick teal line for refines. A pair with both kinds is drawn once
  as refines with the label "+ uses".
- **Arrow direction:** from the Dependent to its Dependency. This is the reverse of the Mermaid diagrams, so the
  generated note under the diagram must say so.
- **Arrows skipping a tier:** routed through the nearest gap between boxes in each tier they pass, so no arrow
  crosses a box.
- **Legend and tier labels:** drawn inside the image.

## The SVG file

- **Path:** `docs/specs/<family>/<family>-family.svg`, e.g. `docs/specs/mechanics/mechanics-family.svg`.
- **Size:** the root element declares `width` and `height` as well as `viewBox`. Without them the Markdown preview
  shows the image about 300 pixels wide.
- **Colors:** defined inside the file, with a light and a dark palette selected by `prefers-color-scheme`, and a
  background rectangle so the image is readable on any page background.
- **Determinism:** the same specifications produce the same bytes. No timestamps and no random IDs.

## The overview file

Between the generated markers, the "Within the family" Mermaid block is replaced by an image link, e.g.
`![Mechanics family diagram](./mechanics-family.svg)`.

# Changes to the tooling

| File                                 | Change                                                                                                                                                                                                                                                |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/spec-docs/svg-diagram.ts`   | New. A pure function from documents, relationships, and the order hint to the SVG text. Tier computation is a separately exported function.                                                                                                           |
| `scripts/spec-docs/generator.ts`     | `renderFamilyOverviews` reads the order hint, emits the image link, and returns the SVG files with the overview files. Prettier is not applied to SVG text.                                                                                           |
| `scripts/derived-docs.ts`            | The check mode compares only `docs/derived/` and the overview files today. It must also read the generated SVG files, report a missing or stale one, and report an unexpected `*-family.svg`. The link check must skip outputs that are not Markdown. |
| `scripts/spec-linter/`               | Confirm that a local image link whose target does not exist is reported; add the check if it is missing.                                                                                                                                              |
| Tests beside the existing test files | Tier computation, loop handling, hint validation, arrow routing around a box, byte-identical repeated output, and stale-file detection.                                                                                                               |
| `README.md`                          | The documentation commands section mentions the generated SVG files.                                                                                                                                                                                  |

# Steps

1. Write tier computation and its tests.
2. Write the SVG renderer and its tests, comparing the Mechanics output with the trial file by eye.
3. Connect it to `renderFamilyOverviews` and to the generate and check modes.
4. Add the order hint to each family overview where the default order reads badly.
5. Delete `docs/specs/mechanics/mechanics-tiers.svg` and the trial paragraph in `about-mechanics.md`.
6. Run `npm run docs:generate` and `npm run check`.
7. Open every family overview in the Markdown preview and on GitHub, in light and dark, and check that no arrow
   crosses a box and no label is clipped.
8. Delete this plan.

# Open decisions

- Whether the "Across families" diagram should follow in a second step. It has a different shape, whole families as
  boxes, so it is left out here.
- Whether a family with a single document should get a diagram at all.
