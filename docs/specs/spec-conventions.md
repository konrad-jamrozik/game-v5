# Specification Conventions

| Metadata             | Value                                                                                                     |
| -------------------- | --------------------------------------------------------------------------------------------------------- |
| Spec ID              | CONV                                                                                                      |
| Status               | Accepted                                                                                                  |
| Acceptance reference | Project owner approval in this task: "OK I like what you wrote in Spec conventions. Mark it as Accepted." |
| Scope                | Writing, reviewing, and maintaining game-v5 specifications                                                |
| Related documents    | [Spec index](README.md), [design stem](../game-design-stem.md)                                            |

## 1. Purpose and boundaries

Specifications are the durable source of truth for intended behavior. Code and tests implement that behavior and may be
replaced without changing the contract. The [design stem](../game-design-stem.md) explains intent and strategic tensions;
the specifications resolve those ideas into precise rules.

These conventions are the accepted working agreement. The created stubs use this layout, but neither their presence nor
their formatting makes their unresolved rules accepted.

Do not prescribe internal classes, file organization, libraries, or algorithms unless they affect an observable contract,
determinism, compatibility, or an explicit architectural constraint. Exact public TypeScript signatures and the chosen
random algorithm are examples of details that do belong in specifications.

## 2. Document lifecycle and ownership

### Status

Use one of these statuses in the metadata table:

| Status     | Meaning                                                                                                   |
| ---------- | --------------------------------------------------------------------------------------------------------- |
| Stub       | A scoped outline with TODOs; not an implementable contract.                                               |
| Draft      | Proposed rules are being developed; unresolved decisions are explicit.                                    |
| Accepted   | The user or designated project owner has explicitly accepted the document as the implementation contract. |
| Superseded | A replacement is linked; the document is retained only for historical context.                            |

Creating a document, generating tests, or successfully implementing it does not promote it to Accepted. Record the
acceptance reference when a document is accepted. Do not infer approval from silence. Work may explore a draft when
requested, but must not silently settle its open design decisions.

Each document has a stable Spec ID, title, status, scope, and related-document links. The index registers IDs and scopes.
The spec index itself is a navigation document and need not follow the full rule-spec template.

### One owner per rule

A rule, formula, parameter value, or API field has one authoritative owner. Other documents reference it instead of
restating a competing version.

- Domain model owns shared entities and invariants; subsystem specs own their detailed transitions.
- Numbers and randomness owns units, numeric operations, and reproducibility conventions.
- Mechanics own formulas. Initial campaign content owns named balance values and content rows.
- Turn resolution owns phase ordering and state-read timing, not subsystem formulas.
- Combat produces battle results; missions converts them into campaign effects.
- Investigations owns probability/estimate calculations; player information owns which results and fields players see.
- Interface specs reference mechanical eligibility and effects rather than independently defining them.
- Acceptance scenarios exercise rules; they cannot introduce new ones.

List dependencies with their reason. Distinguish normative dependencies from background references. Cross-references
can be mutual; they do not require duplicated ownership or imply a strict authoring order.

## 3. Predictable layout and allowed variation

Rule specifications use the following top-level headings in this order:

1. **Purpose and boundaries** — intent, owned behavior, included/excluded scope.
2. **Dependencies and terminology** — authoritative references and terms needed to read this spec.
3. **Concepts and contract** — state, inputs, outputs, units, visibility, and relevant types or tables.
4. **Requirements** — normative formulas, transitions, tables, or interface behavior.
5. **Edge cases and failure behavior** — thresholds, invalid inputs, simultaneous effects, and exceptional cases.
6. **Acceptance examples** — worked examples and testable expected results with requirement references.
7. **Open decisions** — unresolved choices, consequences, and TODOs; accepted documents state "None."

Use a metadata table immediately below the title. Use numbered top-level headings and descriptive, unnumbered
subheadings. Keep stable requirement IDs independent of heading numbers.

### Handling sections that do not apply

Retain the seven headings for navigation. If a section truly does not apply, write **Not applicable —** followed by a
specific explanation. Never use an empty section, unexplained "N/A", or a TODO as a substitute for that explanation.

A missing decision is not "not applicable." For example, a mechanics document can have no public function signatures
while still defining inputs, outputs, and state changes.

### Specialized material

Add domain-specific subsections under the closest shared heading. Examples:

| Spec kind          | Typical specialized subsections                                 |
| ------------------ | --------------------------------------------------------------- |
| Mechanics          | State transitions; formulas; effect timing; information exposed |
| Numeric foundation | Representation; rounding; draw order; test vectors              |
| API                | Functions/types; preconditions; results/errors; atomicity       |
| CLI                | Grammar; sessions; output formats; exit codes                   |
| UI                 | Screens; grids/trees; interactions; accessibility               |
| Content            | Starting configuration; parameter tables; catalogs; validation  |
| Acceptance         | Fixture format; scenarios; expected outcomes; traceability      |

Long supporting tables may use descriptive appendices after section 7. State whether an appendix is normative or
informative. Do not add unrelated top-level categories just to accommodate a unique feature. If a section repeatedly
outgrows its document, split it into an indexed spec with clear ownership.

These conventions and the index are document-governance exceptions to the seven-section template.

## 4. Writing exact requirements

Use plain English by default. **Must** and **must not** express requirements; **may** expresses a permitted alternative.
Avoid "usually", "approximately", "appropriate", and "should" in implementation-critical rules unless their measurable
meaning is defined. Rationale and suggestions belong in clearly labeled informative text.

Give each implementable requirement a permanent identifier such as **INV-001**. The prefix comes from the index; the
number increases without reuse. Preserve identifiers when wording changes, and mark retired requirements with their
replacement rather than reassigning the number. Place IDs in the text so they are searchable; link the owning section
and name the ID when referencing a requirement.

Stubs do not invent requirement IDs for TODOs. Allocate IDs when actual rules are proposed.

A rule should make its trigger, inputs, preconditions, outcome, and state changes clear. Use a transition table or
pseudocode where prose would conceal ordering. Define:

- Valid and invalid inputs, including empty and duplicate collections.
- Exact thresholds, inclusivity, caps, floors, and tie-breaking.
- Which state snapshot supplies each input and when each effect becomes visible.
- Atomicity and whether rejection changes state, history, or randomness.
- Expected player-command rejection separately from an internal invariant violation.

### Formulas and uncertainty

Define every symbol, unit, domain, and referenced parameter. Show evaluation order and rounding points; link common
numeric rules rather than assuming real-number arithmetic equals runtime arithmetic.

For random rules, specify the distribution, draw timing/order, interval boundaries, success comparison, and which
information is hidden. Distinguish the true probability, conditional probability, cumulative probability, and displayed
estimate whenever relevant. Define what information an estimate conditions on, including previous outcomes.

Include worked numerical examples for normal cases and boundaries. Equations, prose, pseudocode, and examples must
agree. An unexplained "chance increases over time" or "diminishing returns" is not a complete rule.

### Contracts and content

Public API specs define exact names, types, argument shapes, outputs, and errors when they are ready for acceptance.
Conceptual domain specs need not mirror implementation storage layouts.

Content tables define stable IDs, units, values, references, and their owning formulas. A name or a number appearing only
inside an example is not an implicit content definition. Use parameter references instead of copying balance values
throughout mechanics docs.

## 5. Examples, conformance, and sources

Every substantial rule must be covered by an acceptance example or a referenced test scenario. Examples identify:

- The rule IDs exercised and any content/rules version.
- Initial state and inputs, including the seed or RNG state for stochastic results.
- The command or event sequence.
- Expected state, output, visibility, history, and RNG behavior where relevant.
- Exact comparisons or explicitly specified numeric tolerances.

Subsystem examples stay with their rules. Cross-system scenarios belong in
[Campaign Acceptance Scenarios](acceptance/campaign-scenarios.md) and reference their owners.

Test derivation must follow the spec; current code output is not an independent oracle. If code, tests, and the spec
disagree, identify the discrepancy and resolve it explicitly. Do not rewrite a spec merely to bless existing behavior.
Do not silently replace an accepted rule to match a newer stem passage; record the design conflict and proposed revision.

Separate exact conformance criteria from strategic playtesting goals. A game being interesting or having multiple viable
strategies requires playtesting; it cannot be established by a deterministic unit test alone.

Use relative Markdown links between specs. For source-game references, identify relevant paths and, when a behavioral
claim is carried into a drafted spec, the inspected revision where practical.

Label source material or proposals as **Inherited behavior**, **v5 requirement**, **Proposed rule**, or
**Informative rationale** when the distinction could be unclear. Legacy bugs and undocumented implementation quirks
are not requirements. A legacy formula can become a proposed rule only by being stated explicitly.

## 6. TODOs and acceptance checklist

A TODO states what is missing and what a complete answer must include. Prefer:

> TODO: Define the per-turn completion probability, including its conditioning on previous unsuccessful turns,
> progress-removal behavior, rounding, and a numerical example.

Avoid vague placeholders such as "TODO: implement investigations." Documentation TODOs request decisions or contract
content, not implementation.

Use Open decisions to collect unresolved choices and identify affected sections/specs. A TODO may appear at the exact
location of missing content; summarize blocking choices in section 7 without duplicating entire rules. Do not invent a
default to close a TODO unless it is explicitly labeled as a proposal.

Before acceptance, verify:

- Scope and ownership are clear and all references resolve.
- There are no unresolved implementation-affecting TODOs or decisions within scope.
- Inputs, transitions, formulas, outputs, units, timing, and visibility are unambiguous.
- Boundary cases and failures are defined.
- Worked examples and acceptance scenarios agree with the rules.
- Related contracts and content tables are consistent.
- Deferred features are explicitly out of scope, not holes in an allegedly complete contract.
- The project owner has accepted the revision.

When accepted behavior changes, identify affected requirement IDs and dependent specs, revise their examples together,
and record any save/replay/API compatibility impact. Git history and review records provide change history; avoid
duplicating every edit in per-document changelogs.

## 7. Acceptance

Accepted by the project owner through the explicit approval recorded above. This acceptance applies to the conventions
only; the subject specifications remain stubs until drafted and reviewed separately. Future changes to the conventions
must be presented as revisions rather than silently changing the accepted agreement.
