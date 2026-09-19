# Specification Conventions

| Metadata              | Value                                                                                                          |
| --------------------- | -------------------------------------------------------------------------------------------------------------- |
| Spec ID               | CONV                                                                                                           |
| Family                | Governance                                                                                                     |
| Status                | Accepted                                                                                                       |
| Acceptance reference  | Project owner approval in this task: "OK I like what you wrote in Spec conventions. Mark it as Accepted."      |
| Scope                 | Writing, reviewing, and maintaining game-v5 specifications                                                     |
| Related documents     | [Spec index](../README.md), [game design brief](../../game-design-brief.md)                                    |
| Relationship revision | Project owner requested flat directional relationship lists without Scope and glossary-controlled terminology. |
| Validation revision   | Requested by the project owner: add deterministic repository linting and a correctness-review skill.           |
| Organization revision | Project owner approval in this task: "OK apply the proposed changes."                                          |

# Purpose and boundaries

Specifications are the durable authority for intended behavior. Code and tests implement that behavior and may be replaced without changing the contract. The [game design brief](../../game-design-brief.md) explains intent and strategic tensions; the specifications resolve those ideas into precise rules.

These conventions are the accepted working agreement. A stub uses the standard layout, but neither its presence nor its formatting makes unresolved rules accepted.

Do not prescribe internal classes, file organization, libraries, or algorithms unless they affect an observable contract, determinism, compatibility, or an explicit architectural constraint. For example, exact public TypeScript signatures and the chosen random algorithm belong in specifications.

# Relationships

- Uses [Artifact Relationships](./artifact-relationships.md)

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
| Content    | `content/`    | Versioned content entries, named parameters, catalogs, and starting configurations             |
| Interfaces | `interfaces/` | Observable player, developer, API, CLI, and UI contracts                                       |
| Acceptance | `acceptance/` | Cross-system fixtures, scenarios, expected outcomes, and requirement traceability              |

The Game Specification Index has Family Governance and remains at `docs/specs/README.md` as the navigation entry point.
Family describes ownership, not dependencies: a Foundation specification may depend on Mechanics specifications without
changing Family. Moving a specification between Families changes its declared ownership category and requires updating its
metadata, register entry, path, and links together.

## One owner per rule

A rule, formula, parameter value, or API field has one authoritative owner. Other specifications reference it instead of restating a competing version.

- Domain Model owns shared campaign instance kinds, their campaign instances, and invariants; subsystem specifications own their detailed transitions.
- Numbers and Randomness owns units, numeric operations, and reproducibility conventions.
- Mechanics own formulas. Initial Campaign Content owns named balance values and content rows.
- Turn Resolution owns phase ordering and state-read timing, not subsystem formulas.
- Combat produces battle results; Missions converts them into campaign effects.
- Investigations owns probability and estimate calculations; Player Information owns which results and fields players see.
- Interface specifications reference mechanical eligibility and effects rather than independently defining them.
- Acceptance scenarios exercise rules; they cannot introduce new rules.

## Implicit relationships

The following relationships exist without explicit table rows:

1. Every registered specification implicitly depends on Specification Conventions through `follows` for document structure, lifecycle, and writing rules.
2. Specification Conventions consequently has every other registered specification as an implicit Dependent.
3. An acceptance example or test scenario that explicitly identifies requirements it checks implicitly depends on those requirements through `verifies`.
4. The checked requirements consequently have that acceptance example or test scenario as an implicit Dependent.
5. No other relationship is implicit unless Specification Conventions adds and defines it.

Implicit relationships are exempt from mirrored table rows.

## Relationship inventories

Every registered specification contains adjacent Relationships and Glossary H1 sections immediately after
Purpose and boundaries. Relationships contains one flat unordered list, without tables or subsections. Each bullet
describes the current document and consists of a directional phrase followed by one hyperlink whose text is the
linked document's title. Link to the registered document itself, without an anchor or a scope annotation.

Use this complete phrase order; omit groups with no entries and sort document titles alphabetically within each group:

1. Uses
2. Refines
3. Follows
4. Implements
5. Verifies
6. Used by
7. Refined by
8. Followed by
9. Implemented by
10. Verified by

Groups are contiguous entries, not headings. For example, Engine Contract contains:

- Uses [Modeling Foundations](../foundation/modeling-foundations.md)

Modeling Foundations contains the mirror:

- Used by [Engine Contract](../foundation/engine-contract.md)

Both entries describe the same relationship. The first five phrases describe the current document as Dependent;
the last five describe it as Dependency. Reverse-facing phrases are grammatical presentations of the canonical
relationship kinds, not additional kinds or glossary synonyms.

List explicit relationships only. When there are none, write exactly **No explicit relationships.** as an unformatted
paragraph. Do not repeat implicit relationships or the former implicit-only sentences. Every explicit relationship
must have its mirror with the same Dependency, Dependent, and relationship kind. A document pair may have multiple
kinds, but duplicate entries of the same kind and direction are invalid. Inventory lists are exhaustive, not example lists.

Relationship entries have no Scope field. Keep substantive constraints and requirement references in the owning
contract prose; a document link does not imply reliance on every rule in that document. Ordinary citations and evidence
acknowledgements do not create relationships.

Classify relationships using [Choosing uses or refines](artifact-relationships.md#choosing-uses-or-refines).
Each refinement must identify the parent contract and the added detail about the same subject or behavior in its
owning prose. A scoped Stub may declare that intended detail without settling its TODOs. Applying vocabulary,
obeying invariants, or supplying content values alone establishes uses. Do not hide substantive reliance behind
an informative citation or duplicate a refinement as uses for the same reliance.

Maintain [Specification relationship cycles](../../spec-relationship-cycles.md) when changing relationships.
The register must cover retained combined uses/refines cycles and mixed governance cycles, with supporting meanings
and future removal criteria. It is an informative report outside the registered specification corpus.

## Canonical terminology

Specifications must strictly follow the owning glossaries. Before using a formal term, consult the existing glossaries
and use the canonical term for that concept. Introduce a new formal term only when no existing term expresses the
required concept; add its definition to the appropriate owning Glossary before using it. Ordinary prose words do not
require glossary entries.

One concept must have exactly one canonical term. Do not introduce synonyms, aliases, inverse labels, slash-separated alternatives, or interchangeable terms for the same concept.

If two similar terms are retained, they must represent distinct concepts and have separate, non-overlapping definitions in the appropriate Glossary. A term owned by another specification must link to that specification's Glossary rather than be redefined. When an author or reviewer encounters a likely synonym, resolve whether it denotes the same concept. If it does,
replace it with the canonical term and add it to Terminology replacements with its context and a link to the owning
Glossary. If the concepts differ, make their distinct definitions explicit. Unresolved terminology blocks acceptance.

Relationship descriptions use `Dependency`, `Dependent`, `relationship`, `artifact`, and `relationship kind` exactly as defined by Artifact Relationships. Relationship or glossary content must not substitute competing formal terms for them.

## Terminology replacements

Use the following contextual replacements. This table records prohibited synonyms, not alternative accepted names.
Canonical terms remain owned by their linked glossaries; this list does not redefine them.

| INSTEAD OF                       | USE                                                                   | Context                                                             |
| -------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Entity ID                        | [Instance ID](../foundation/modeling-foundations.md#glossary)         | Identifying a campaign instance.                                    |
| Content definition               | [Content entry](../foundation/modeling-foundations.md#glossary)       | Referring to concrete immutable game data rather than its schema.   |
| Evolving campaign facts          | [Campaign state](../foundation/modeling-foundations.md#glossary)      | Describing the data of a particular campaign.                       |
| Authoritative fact               | [Authoritative value](../foundation/modeling-foundations.md#glossary) | Naming the source-of-truth category.                                |
| Computed value; calculated value | [Derived value](../foundation/modeling-foundations.md#glossary)       | Naming the formal category of values calculated from other values.  |
| Archived; archival               | [Historical](../foundation/modeling-foundations.md#glossary)          | Describing retained past state or events.                           |
| Deconstructed; destroyed         | [Became historical](../foundation/modeling-foundations.md#glossary)   | Describing a lifecycle transition that retains a campaign instance. |
| Fatigue                          | [Exhaustion](../mechanics/agents.md#glossary)                         | Naming the combatant attribute, its accumulation, or recovery.      |
| Hit points; hit-point            | [Health](../mechanics/agents.md#glossary)                             | Naming the combatant health attribute.                              |
| Past participation               | [Participation history](../foundation/domain-model.md#glossary)       | Naming retained participation facts.                                |

These are contextual replacements, not a ban on ordinary uses of “definition,” legitimate destruction mechanics,
or unrelated uses of “configuration.” “Template” may describe the role of a content entry used to initialize a campaign
instance, but it is not a synonym for every content entry or a separate formal modeling category. Historical does not
replace named lifecycle states; for example, Killed and Completed.

When specifying a game concept, state its applicable modeling role and mutability. For a campaign instance kind, state
multiplicity with an explicit scope, construction and historical transitions, authoritative versus derived values, and
which values affect current gameplay versus serve only historical explanation. Classify properties separately when
these dimensions differ within one campaign instance. Link to the owning specification for details; explicitly retain
unresolved decisions rather than filling them with assumptions.

# Predictable layout and allowed variation

Rule specifications use the following top-level headings in this order:

1. `# Purpose and boundaries`
2. `# Relationships`, containing the flat directional inventory
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

Add domain-specific subsections under the closest shared heading. Examples of useful content shapes within a Family follow; these are not additional metadata categories or directories.

| Specialized material | Examples of subsections                    |
| -------------------- | ------------------------------------------ |
| Mechanics rules      | State transitions; formulas; effect timing |
| Numeric contracts    | Representation; rounding; test vectors     |
| API contracts        | Functions; preconditions; results          |

Long supporting tables may use descriptive appendices after Open decisions. State whether an appendix is normative or informative. Do not add unrelated top-level categories for a unique feature. If a section repeatedly outgrows its specification, split it into an indexed specification with clear ownership.

# Writing exact requirements

Use plain English by default. **Must** and **must not** express requirements; **may** expresses a permitted alternative. Avoid "usually", "approximately", "appropriate", and "should" in implementation-critical rules unless their measurable meaning is defined. Rationale and suggestions belong in clearly labeled informative text.

Give each implementable requirement a permanent identifier; for example, **INVSTG-nnn**, where `nnn` is a three-digit number. The prefix comes from the index; the number increases without reuse. Preserve identifiers when wording changes, and mark retired requirements with their replacement rather than reassigning the number. Place IDs in the text so they are searchable; link the owning section and name the ID when referencing a requirement.

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

Content tables define stable IDs, units, values, references, and their owning formulas. A name or a number appearing only inside an example is not an implicit content entry. Use parameter references instead of copying balance values throughout mechanics specifications.

## Illustrative and exhaustive enumerations

Every non-exhaustive enumeration must explicitly use "for example", "e.g.", or an "Examples" label. This applies to
inline enumerations, bullet lists, and illustrative tables. "Such as", "including", and "illustrates" alone do not
satisfy the rule. Each illustrative list must contain at most three examples. Do not split one list into smaller
lists merely to evade this limit. Use the fewest representative examples needed and link to the authoritative
enumeration when readers need the full set.

Clearly identify exhaustive enumerations and maintain them in their authoritative owner. Elsewhere, reference that
owner rather than copying the list. Do not shorten exhaustive contracts, procedures, or worked acceptance scenarios
under the three-example limit, or relabel normative obligations as examples. This distinction prevents illustrative
lists from looking like complete sets that must grow whenever a new value is added.

# Examples, conformance, and evidence

Every substantial rule must be covered by an acceptance example or a referenced test scenario. Every acceptance example must identify all applicable items in this checklist:

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

A successful deterministic lint means only that every machine-checkable convention passed. It does not accept a specification or establish relationship truth, refinement compatibility, the meaning of a `uses` cycle, conceptual synonymy, formula correctness, acceptance-example validity, or gameplay correctness. Review those semantic concerns separately.

A TODO states what is missing and what a complete answer must include. Prefer:

> TODO: Define the per-turn completion probability, including its conditioning on previous unsuccessful turns, progress-removal behavior, rounding, and a numerical example.

Avoid vague placeholders; for example, "TODO: implement investigations." Documentation TODOs request decisions or contract content, not implementation.

Use Open decisions to collect unresolved choices and identify affected sections or specifications. A TODO may appear at the exact location of missing content; summarize blocking choices in Open decisions without duplicating entire rules. Do not invent a default to close a TODO unless it is explicitly labeled as a proposal.

Before acceptance, verify:

- Scope and ownership are clear and all references resolve.
- Explicit and implicit relationships satisfy Artifact Relationships, including mirrored explicit entries.
- Canonical terminology is consistent, necessary new formal terms are defined in their owning Glossary, and encountered synonyms are recorded in Terminology replacements.
- Every illustrative enumeration is explicitly labeled and contains at most three examples; exhaustive enumerations are clearly distinguished and owned.
- There are no unresolved implementation-affecting TODOs or decisions within scope.
- Inputs, transitions, formulas, outputs, units, timing, and visibility are unambiguous.
- Boundary cases and failures are defined.
- Worked examples and acceptance scenarios agree with the rules.
- Related contracts and content tables are consistent.
- Deferred features are explicitly out of scope, not holes in an allegedly complete contract.
- The project owner has accepted the revision.

When accepted behavior changes, identify affected requirement IDs and dependent specifications, revise their examples together, and record any save, replay, or API compatibility impact. Git history and review records provide change history; avoid duplicating every edit in per-document changelogs.

# Acceptance

Accepted by the project owner through the explicit approval recorded above. This acceptance applies to the conventions only; subject specifications retain their own statuses. The relationship, canonical-terminology, and illustrative-enumeration revisions were explicitly requested by the project owner. Future changes must be presented as revisions rather than silently changing the accepted agreement.
