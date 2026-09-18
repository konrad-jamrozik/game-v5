# Specification Conventions

| Metadata              | Value                                                                                                                                                           |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID               | CONV                                                                                                                                                            |
| Family                | Governance                                                                                                                                                      |
| Status                | Accepted                                                                                                                                                        |
| Acceptance reference  | Project owner approval in this task: "OK I like what you wrote in Spec conventions. Mark it as Accepted."                                                       |
| Scope                 | Writing, reviewing, and maintaining game-v5 specifications                                                                                                      |
| Related documents     | [Spec index](../README.md), [game design brief](../../game-design-brief.md)                                                                                     |
| Relationship revision | Requested by the project owner: use only Dependencies and Dependents, define implicit relationships centrally, and require one canonical term for each concept. |
| Validation revision   | Requested by the project owner: add deterministic repository linting and a correctness-review skill.                                                            |
| Organization revision | Project owner approval in this task: "OK apply the proposed changes."                                                                                           |

# Purpose and boundaries

Specifications are the durable authority for intended behavior. Code and tests implement that behavior and may be replaced without changing the contract. The [game design brief](../../game-design-brief.md) explains intent and strategic tensions; the specifications resolve those ideas into precise rules.

These conventions are the accepted working agreement. A stub uses the standard layout, but neither its presence nor its formatting makes unresolved rules accepted.

Do not prescribe internal classes, file organization, libraries, or algorithms unless they affect an observable contract, determinism, compatibility, or an explicit architectural constraint. Exact public TypeScript signatures and the chosen random algorithm are examples of details that belong in specifications.

# Relationships

## Dependencies

| Dependency                                          | Relationship | Scope                                         |
| --------------------------------------------------- | ------------ | --------------------------------------------- |
| [Artifact Relationships](artifact-relationships.md) | `uses`       | Relationship terminology and inventory format |

## Dependents

Only [implicit dependents](#implicit-relationships).

# Glossary

| Term               | Definition                                                                                                                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specification      | A registered [artifact](artifact-relationships.md#glossary) that defines rules, contracts, content, governance, or planned specification work.                                |
| Registered         | Listed in the [Specification register](../README.md#specification-register) with a stable Spec ID.                                                                            |
| Family             | A specification's single ownership category, declared in metadata and the register and mapped to its directory.                                                               |
| Requirement        | A normative statement with a stable identifier that defines implementable behavior or a constraint.                                                                           |
| Canonical term     | The sole term assigned to one concept within the specification set.                                                                                                           |
| Acceptance example | A worked example that identifies the requirements it checks and states testable expected results.                                                                             |
| Evidence basis     | Informative material inspected when drafting a specification; it is not a formal [relationship](artifact-relationships.md#glossary) unless also declared under Relationships. |

# Document lifecycle and ownership

## Status

Use one of these statuses in the metadata table:

| Status     | Meaning                                                                                                   |
| ---------- | --------------------------------------------------------------------------------------------------------- |
| Stub       | A scoped outline with TODOs; not an implementable contract.                                               |
| Draft      | Proposed rules are being developed; unresolved decisions are explicit.                                    |
| Accepted   | The user or designated project owner has explicitly accepted the document as the implementation contract. |
| Superseded | A replacement is linked; the document is retained only for historical context.                            |

Creating a document, generating tests, or successfully implementing it does not promote it to Accepted. Record the acceptance reference when a document is accepted. Do not infer approval from silence. Work may explore a draft when requested, but must not silently settle its open design decisions.

Each specification has a stable Spec ID, Family, title, status, scope, and related-document links. The index registers IDs,
Families, and scopes.

## Specification families and paths

Family classifies an artifact by the kind of authority it owns. It is independent of relationship direction, graph depth,
and authoring order. A folder location does not create a relationship.

Every registered specification declares exactly one of these Families in metadata and in the Specification register. With
the exception of the root index, its file must be a direct child of the corresponding lowercase directory.

| Family     | Directory     | Ownership boundary                                                                             |
| ---------- | ------------- | ---------------------------------------------------------------------------------------------- |
| Governance | `governance/` | Specification conventions, relationship rules, and planning or process contracts               |
| Foundation | `foundation/` | Cross-cutting domain, modeling, execution, numeric, timing, history, and persistence contracts |
| Mechanics  | `mechanics/`  | Player-facing game-system rules, transitions, formulas, and effects                            |
| Content    | `content/`    | Versioned definitions, named parameters, catalogs, and starting configurations                 |
| Interfaces | `interfaces/` | Observable player, developer, API, CLI, and UI contracts                                       |
| Acceptance | `acceptance/` | Cross-system fixtures, scenarios, expected outcomes, and requirement traceability              |

The Game Specification Index has Family Governance and remains at `docs/specs/README.md` as the navigation entry point.
Family describes ownership, not dependencies: a Foundation specification may depend on Mechanics specifications without
changing Family. Moving a specification between Families changes its declared ownership category and requires updating its
metadata, register entry, path, and links together.

## One owner per rule

A rule, formula, parameter value, or API field has one authoritative owner. Other specifications reference it instead of restating a competing version.

- Domain Model owns shared entities and invariants; subsystem specifications own their detailed transitions.
- Numbers and Randomness owns units, numeric operations, and reproducibility conventions.
- Mechanics own formulas. Initial Campaign Content owns named balance values and content rows.
- Turn Resolution owns phase ordering and state-read timing, not subsystem formulas.
- Combat produces battle results; Missions converts them into campaign effects.
- Investigations owns probability and estimate calculations; Player Information owns which results and fields players see.
- Interface specifications reference mechanical eligibility and effects rather than independently defining them.
- Acceptance scenarios exercise rules; they cannot introduce new rules.

## Implicit relationships

The following relationships exist without explicit table rows:

1. Every registered specification implicitly depends on Specification Conventions through `follows`, scoped to document structure, lifecycle, and writing rules.
2. Specification Conventions consequently has every other registered specification as an implicit Dependent.
3. An acceptance example or test scenario that explicitly identifies requirements it checks implicitly depends on those requirements through `verifies`.
4. The checked requirements consequently have that acceptance example or test scenario as an implicit Dependent.
5. No other relationship is implicit unless Specification Conventions adds and defines it.

Implicit relationships are exempt from mirrored table rows.

## Relationship inventories

Use the relationship kinds and direction defined by [Artifact Relationships](artifact-relationships.md). Every specification contains adjacent `Relationships` and `Glossary` sections immediately after `Purpose and boundaries`. `Relationships` contains exactly the `Dependencies` and `Dependents` subsections, in that order.

When explicit Dependencies exist, list only this table:

| Dependency | Relationship | Scope |
| ---------- | ------------ | ----- |

When no explicit Dependencies exist, write exactly:

> Only [implicit dependencies](#implicit-relationships).

The link must resolve to this section from the specification containing it. A registered specification's Dependencies subsection must never say `None.` because its implicit `follows` relationship always applies. Do not mention implicit dependencies beside an explicit table.

When explicit Dependents exist, list only this table:

| Dependent | Relationship | Scope |
| --------- | ------------ | ----- |

When no explicit Dependents exist but implicit dependents apply, write exactly:

> Only [implicit dependents](#implicit-relationships).

When neither explicit nor implicit Dependents exist, write `None.` Do not mention implicit dependents beside an explicit table.

Every explicit relationship must appear in both artifacts with the same relationship kind and scope: the Dependent lists the Dependency under Dependencies, and the Dependency lists the Dependent under Dependents. Do not treat ordinary citations or evidence acknowledgements as relationships.

## Canonical terminology

One concept must have exactly one canonical term. Do not introduce synonyms, aliases, inverse labels, slash-separated alternatives, or interchangeable terms for the same concept.

If two similar terms are retained, they must represent distinct concepts and have separate, non-overlapping definitions in the appropriate Glossary. A term owned by another specification must link to that specification's Glossary rather than be redefined. Undefined synonyms or inconsistent terminology block acceptance.

Relationship descriptions use `Dependency`, `Dependent`, `relationship`, `artifact`, and `relationship kind` exactly as defined by Artifact Relationships. Relationship or glossary content must not substitute competing formal terms for them.

# Predictable layout and allowed variation

Rule specifications use the following top-level headings in this order:

1. `# Purpose and boundaries`
2. `# Relationships`, containing `## Dependencies` and `## Dependents`
3. `# Glossary`
4. `# Concepts and contract`
5. `# Requirements`
6. `# Edge cases and failure behavior`
7. `# Acceptance examples`
8. `# Open decisions`

Use a metadata table immediately below the document-title H1. Major sections are unnumbered H1 headings and their subsections are H2 headings. Keep stable requirement IDs independent of headings. Appendices follow Open decisions.

Specification Conventions (`CONV`) and the Game Specification Index (`INDEX`) are governance-layout exceptions. Both must use the universal Purpose and boundaries, Relationships, and Glossary sequence, but they may replace the remaining standard rule-spec sections with governance-specific H1 sections.

## Handling sections that do not apply

Retain the standard headings for navigation. If a section truly does not apply, write **Not applicable —** followed by a specific explanation. Never use an empty section, unexplained "N/A", or a TODO as a substitute for that explanation.

A missing decision is not "not applicable." For example, a mechanics specification can have no public function signatures while still defining inputs, outputs, and state changes.

## Specialized material

Add domain-specific subsections under the closest shared heading. The following specializations describe useful content
shapes within a Family; they do not define additional metadata categories or directories.

| Specialized material | Typical subsections                                             |
| -------------------- | --------------------------------------------------------------- |
| Mechanics rules      | State transitions; formulas; effect timing; information exposed |
| Numeric contracts    | Representation; rounding; draw order; test vectors              |
| API contracts        | Functions; preconditions; results and errors; atomicity         |
| CLI contracts        | Grammar; sessions; output formats; exit codes                   |
| UI contracts         | Screens; grids and trees; interactions; accessibility           |
| Content catalogs     | Starting configuration; parameter tables; catalogs; validation  |
| Acceptance scenarios | Fixture format; scenarios; expected outcomes; traceability      |

Long supporting tables may use descriptive appendices after Open decisions. State whether an appendix is normative or informative. Do not add unrelated top-level categories for a unique feature. If a section repeatedly outgrows its specification, split it into an indexed specification with clear ownership.

# Writing exact requirements

Use plain English by default. **Must** and **must not** express requirements; **may** expresses a permitted alternative. Avoid "usually", "approximately", "appropriate", and "should" in implementation-critical rules unless their measurable meaning is defined. Rationale and suggestions belong in clearly labeled informative text.

Give each implementable requirement a permanent identifier such as **INVSTG-nnn**, where `nnn` is a three-digit number. The prefix comes from the index; the number increases without reuse. Preserve identifiers when wording changes, and mark retired requirements with their replacement rather than reassigning the number. Place IDs in the text so they are searchable; link the owning section and name the ID when referencing a requirement.

Stubs do not invent requirement IDs for TODOs. Allocate IDs when actual rules are proposed.

A rule should make its trigger, inputs, preconditions, outcome, and state changes clear. Use a transition table or pseudocode where prose would conceal ordering. Define:

- Valid and invalid inputs, including empty and duplicate collections.
- Exact thresholds, inclusivity, caps, floors, and tie-breaking.
- Which state snapshot supplies each input and when each effect becomes visible.
- Atomicity and whether rejection changes state, history, or randomness.
- Expected player-command rejection separately from an internal invariant violation.

## Formulas and uncertainty

Define every symbol, unit, domain, and referenced parameter. Show evaluation order and rounding points; link common numeric rules rather than assuming real-number arithmetic equals runtime arithmetic.

For random rules, specify the distribution, draw timing and order, interval boundaries, success comparison, and which information is hidden. Distinguish the true probability, conditional probability, cumulative probability, and displayed estimate whenever relevant. Define what information an estimate conditions on, including previous outcomes.

Include worked numerical examples for normal cases and boundaries. Equations, prose, pseudocode, and examples must agree. An unexplained "chance increases over time" or "diminishing returns" is not a complete rule.

## Contracts and content

Public API specifications define exact names, types, argument shapes, outputs, and errors when they are ready for acceptance. Conceptual domain specifications need not mirror implementation storage layouts.

Content tables define stable IDs, units, values, references, and their owning formulas. A name or a number appearing only inside an example is not an implicit content definition. Use parameter references instead of copying balance values throughout mechanics specifications.

# Examples, conformance, and evidence

Every substantial rule must be covered by an acceptance example or a referenced test scenario. Examples identify:

- The requirement IDs exercised and, when needed for reproducibility, the game revision and content fixture.
- Initial state and inputs, including the seed or random state for stochastic results.
- The command or event sequence.
- Expected state, output, visibility, history, and random behavior where relevant.
- Exact comparisons or explicitly specified numeric tolerances.

Subsystem examples stay with their rules. Cross-system scenarios belong in [Campaign Integration and Acceptance Tests](../acceptance/campaign-integration-and-acceptance-tests.md) and reference their owners.

Test derivation must follow the specification; current code output is not an independent oracle. If code, tests, and the specification disagree, identify the discrepancy and resolve it explicitly. Do not rewrite a specification merely to bless existing behavior. Do not silently replace an accepted rule to match a newer brief passage; record the design conflict and proposed revision.

Separate exact conformance criteria from strategic playtesting goals. A game being interesting or having multiple viable strategies requires playtesting; it cannot be established by a deterministic unit test alone.

Use relative Markdown links between specifications. For inherited-game evidence, identify relevant paths and, when a behavioral claim is carried into a drafted specification, the inspected revision where practical.

Label evidence or proposals as **Inherited behavior**, **v5 requirement**, **Proposed rule**, or **Informative rationale** when the distinction could be unclear. Legacy bugs and undocumented implementation quirks are not requirements. A legacy formula can become a proposed rule only by being stated explicitly.

# TODOs and acceptance checklist

## Deterministic validation

Run `npm run lint:specs` to validate the complete registered specification corpus. The repository-owned, read-only linter parses Markdown structurally and reports stable diagnostics for registry and metadata agreement, required layout, local links and anchors, relationship inventories and mirrors, acyclic `follows` and `refines` graphs, objectively prohibited terminology, requirement identifiers and references, and status-specific TODO and Open decisions rules. It performs no network access and offers no automatic fixes.

A successful deterministic lint means only that every machine-checkable convention passed. It does not accept a specification or establish relationship truth, scope sufficiency, refinement compatibility, the meaning of a `uses` cycle, conceptual synonymy, formula correctness, acceptance-example validity, or gameplay correctness. Review those semantic concerns separately.

A TODO states what is missing and what a complete answer must include. Prefer:

> TODO: Define the per-turn completion probability, including its conditioning on previous unsuccessful turns, progress-removal behavior, rounding, and a numerical example.

Avoid vague placeholders such as "TODO: implement investigations." Documentation TODOs request decisions or contract content, not implementation.

Use Open decisions to collect unresolved choices and identify affected sections or specifications. A TODO may appear at the exact location of missing content; summarize blocking choices in Open decisions without duplicating entire rules. Do not invent a default to close a TODO unless it is explicitly labeled as a proposal.

Before acceptance, verify:

- Scope and ownership are clear and all references resolve.
- Explicit and implicit relationships satisfy Artifact Relationships, including mirrored explicit entries.
- Canonical terminology is consistent and every formal term is defined in the owning Glossary.
- There are no unresolved implementation-affecting TODOs or decisions within scope.
- Inputs, transitions, formulas, outputs, units, timing, and visibility are unambiguous.
- Boundary cases and failures are defined.
- Worked examples and acceptance scenarios agree with the rules.
- Related contracts and content tables are consistent.
- Deferred features are explicitly out of scope, not holes in an allegedly complete contract.
- The project owner has accepted the revision.

When accepted behavior changes, identify affected requirement IDs and dependent specifications, revise their examples together, and record any save, replay, or API compatibility impact. Git history and review records provide change history; avoid duplicating every edit in per-document changelogs.

# Acceptance

Accepted by the project owner through the explicit approval recorded above. This acceptance applies to the conventions only; subject specifications retain their own statuses. The relationship and canonical-terminology revisions were explicitly requested by the project owner. Future changes must be presented as revisions rather than silently changing the accepted agreement.
