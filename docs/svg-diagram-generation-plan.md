# SVG diagram generation plan

> Informative work plan. It owns no rules. Delete it when the work is done.

# Goal

Make `npm run docs:generate` write the diagrams of every family overview as SVG files laid out in layers, so the
diagrams are easier to read than Mermaid diagrams and never go stale.

# Done: the Mechanics trial

The Mechanics family is the trial. Both diagrams of `docs/specs/mechanics/about-mechanics.md` are generated SVG
files, and the overview links to them between its generated markers:

- `docs/specs/mechanics/mechanics-family-within.svg`: relationships within the family.
- `docs/specs/mechanics/mechanics-family-across.svg`: relationships with other families.

`npm run docs:check` reports a missing, stale, or unexpected `*-family-within.svg` or `*-family-across.svg` file.

## How the diagrams are drawn

- **Direction:** layer 1 is the top row. Arrows run from a Dependency down to its Dependent, so they read "used by"
  and "refined by", as in the Mermaid diagrams.
- **Layer of a document:** one after the latest layer among the documents of the same family it uses or refines. A
  document depending on none is in layer 1. The layer number is printed beside each row.
- **Loops:** the documents of one dependency loop share a layer, and the arrows between them are drawn as arcs under
  the row. The generator does not fail on a loop.
- **Order within a layer:** computed, with no hand-kept hint. The generator reorders each row to reduce crossings.
- **Arrows skipping a layer:** routed between the boxes of the layers they pass.
- **Arrow styles:** one color each for "used by", "refined by", and a pair with both kinds. The legend lists only the
  styles the diagram uses.
- **Across families:** the families a family depends on are drawn above its documents and the families depending on
  it below. Documents with identical relationships to other families share one box. Rows are not layers there, so no
  layer numbers are printed.
- **File:** the SVG declares its size, carries its own light and dark colors, and is byte-identical for the same
  specifications.

The code is in `scripts/spec-docs/svg-diagram.ts` (layers, layout, drawing) and `scripts/spec-docs/generator.ts`
(what each family diagram contains). The families using SVG are listed in `SVG_DIAGRAM_FAMILIES` in the generator.

# Remaining

1. Review the two Mechanics diagrams in the Markdown preview and on GitHub, in light and dark, and adjust the styling
   constants in `scripts/spec-docs/svg-diagram.ts`.
2. Add the other families to `SVG_DIAGRAM_FAMILIES`, run `npm run docs:generate`, and review each overview.
3. Update the tests that expect Mermaid blocks in family overviews.
4. Decide whether the diagrams under `docs/derived/` should follow.
5. Delete this plan.
