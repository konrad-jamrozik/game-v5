# Specification Conventions

| Metadata          | Value                                                                       |
| ----------------- | --------------------------------------------------------------------------- |
| Spec ID           | CONV                                                                        |
| Family            | Governance                                                                  |
| Status            | Accepted                                                                    |
| Audience          | Engine designer, Content designer, UI designer, AI designer, Implementer    |
| Related documents | [Spec index](../README.md), [game design brief](../../game-design-brief.md) |

# Overview

Specifications are the durable authority for intended behavior. Code and tests implement that behavior and may be replaced without changing the contract. The [game design brief](../../game-design-brief.md) explains intent and strategic tensions; the specifications resolve those ideas into precise rules.

These conventions are the accepted working agreement. A stub uses the standard layout, but neither its presence nor its formatting makes unresolved rules accepted.

Specifications state only what satisfies [What belongs in a specification](#what-belongs-in-a-specification). E.g., exact public TypeScript signatures belong in specifications because API callers observe them, while internal classes do not.

# Relationships

- Uses [Artifact Relationships](./artifact-relationships.md)

# Glossary

## Specifications

What a specification is and how it is identified and classified.

| Term          | Definition                                                                                                                                                      |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specification | A registered [artifact](artifact-relationships.md#glossary) that defines rules, contracts, Game Data Records (GDRs), governance, or planned specification work. |
| Registered    | Listed in the [Specification register](../README.md#specification-register) with a stable Spec ID.                                                              |
| Family        | A specification's single ownership category, declared in metadata and the register and mapped to its directory.                                                 |
| Requirement   | A normative statement with a stable identifier that defines implementable behavior or a constraint.                                                             |

## Specification content

Kinds of content a specification states or relies on.

| Term               | Definition                                                                                                                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Canonical term     | The sole term assigned to one concept within the specification set.                                                                                                           |
| Acceptance example | A worked example that identifies the requirements it checks and states testable expected results.                                                                             |
| Evidence basis     | Informative material inspected when drafting a specification; it is not a formal [relationship](artifact-relationships.md#glossary) unless also declared under Relationships. |

## Personas

The kinds of participant in making, changing, or playing the game.

| Term             | Definition                                                                                                                                                                                                                 |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Persona          | A kind of participant in making, changing, or playing the game, defined by what the participant does with the game. The Personas are Engine designer, Content designer, UI designer, AI designer, Implementer, and Player. |
| Engine designer  | The Persona that designs the engine and its game behavior, decides which inputs to that behavior GDRs supply, and establishes these specification conventions.                                                             |
| Content designer | The Persona that authors GDRs conforming to the Types the Engine designer exposes for content.                                                                                                                             |
| UI designer      | The Persona that designs player-facing interfaces over the engine API.                                                                                                                                                     |
| AI designer      | The Persona that designs an AI that plays the game.                                                                                                                                                                        |
| Implementer      | The Persona that implements specifications as code and tests.                                                                                                                                                              |
| Player           | The Persona that plays the game.                                                                                                                                                                                           |

# What belongs in a specification

Specifications describe the design of the game; any implementation that obeys them is acceptable. A statement belongs
in a specification only if it meets at least one of the following criteria. This list is exhaustive:

1. **Observable:** a black-box test through the engine API, a save, or a replay could fail when the statement is
   violated.
2. **Designer-authored:** the statement is a GDR or a description of game behavior that the Engine designer must write down.
3. **Vocabulary:** the statement defines a term or structure needed to state observable or designer-authored statements.

Everything else is left to the implementer's discretion and must not be specified. E.g., the following are out
of scope:

- Internal ordering, e.g. call order and the order of random draws.
- Code structure, e.g. which code creates which objects, internal function signatures, and dependency injection.
- Internal storage layout.

A statement about one of these matters belongs in a specification only when it states an observable consequence, and
then the specification states the consequence rather than the mechanism. Non-observable steering for implementers,
e.g. architecture or code-quality advice, is never a requirement. Record it, when it is worth recording, only in an
Implementation Family document, as described in [Specification families and paths](#specification-families-and-paths).

# Document lifecycle and ownership

## Personas

A Persona describes what a participant does with the game, independently of whether a human or an LLM-based agent fills
it; in this project, LLM-based agents fill the Implementer Persona. One participant may fill several Personas. A Persona
grants no engine API authority. Most Personas write specifications within their area, following these conventions.

The following table is the exhaustive set of Personas. The last column names the Families each Persona mainly works with, as listed in
[Specification families and paths](#specification-families-and-paths), and links key specifications in them.

| Persona          | Filled by    | What the Persona does                                                                                                                                               | Primary Families                                                                                                                          |
| ---------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Engine designer  | Human        | Designs the engine and its game behavior, decides which inputs to that behavior GDRs supply and so become content, and establishes these specification conventions. | Governance, Foundation, Mechanics; e.g. [Specification Conventions](spec-conventions.md), [Core Concepts](../foundation/core-concepts.md) |
| Content designer | Human or LLM | Authors GDRs, including the initial campaign content and in-game encyclopedia articles, within the Types the Engine designer exposes for content.                   | Content, Mechanics; e.g. [Initial Campaign Content](../content/initial-campaign.md)                                                       |
| UI designer      | Human or LLM | Designs player-facing interfaces over the shared engine API.                                                                                                        | Interfaces; e.g. [Player Information](../interfaces/player-information.md), [Web UI](../interfaces/web-ui.md)                             |
| AI designer      | Human or LLM | Designs an AI that plays the game, e.g. an Autopilot AI.                                                                                                            | Interfaces, Foundation; e.g. [Player Information](../interfaces/player-information.md), [Autopilot](../foundation/autopilot.md)           |
| Implementer      | LLM          | Implements specifications as code and tests.                                                                                                                        | Foundation, Mechanics, Interfaces, Acceptance, Implementation                                                                             |
| Player           | Human or LLM | Plays the game.                                                                                                                                                     | None directly; experiences Interfaces and Content                                                                                         |

## Status

Use one of these statuses in the metadata table:

| Status     | Meaning                                                                                                   |
| ---------- | --------------------------------------------------------------------------------------------------------- |
| Stub       | A scoped outline with TODOs; not an implementable contract.                                               |
| Draft      | Proposed rules are being developed; unresolved decisions are explicit.                                    |
| Accepted   | The user or designated project owner has explicitly accepted the document as the implementation contract. |
| Superseded | A replacement is linked; the document is retained only for historical context.                            |

Creating a document, generating tests, or successfully implementing it does not promote it to Accepted. Set Status to Accepted only when the project owner explicitly accepts the document. Do not infer approval from silence. Work may explore a draft when requested, but must not silently settle its open design decisions.

The Status row is the only approval record a specification keeps, and it must stay accurate. Do not record who
requested or approved a change, or when: add no acceptance or revision metadata rows, approval notices, or prose
describing a change's request or approval history. Git history records changes; specifications state the current
contract only.

Only Accepted content constrains design decisions. Stub and Draft content may be revised or rewritten entirely, so
its current wording, terms, API names, or the effort of changing it is never a reason to keep a design choice. Justify
proposals on their merits and on Accepted contracts. Draft content may be cited to identify what a proposal would
change.

Record document status only in the metadata Status row. Do not repeat that a document is Draft, Stub, unaccepted,
proposed, or awaiting review in body paragraphs, notices, Review metadata rows, or Open decisions. Work tracking may
record batch progress; lifecycle rules and worked review scenarios may discuss status changes.

Open decisions contains only substantive unresolved design choices and their affected contracts. Do not list already
stated rules merely to request acceptance. Omit the section when no substantive unresolved choices remain.

Each specification has a stable Spec ID, Family, title, status, Audience, and related-document links. The Audience
metadata row lists the [Personas](#personas) who mainly read or act on the document, separated by commas, in the order
of the Personas table; at least one Persona is required. Overview explains the
specification’s purpose and scope, including what it owns and what it excludes; do not add a Scope row to metadata. The specification
register’s Owns column supplies concise ownership summaries for navigation and the generated catalog.

## Specification families and paths

Family classifies an artifact by the kind of authority it owns. It is independent of relationship direction, graph depth,
and authoring order. A folder location does not create a relationship.

Every registered specification declares exactly one of these Families in metadata and in the Specification register. With
the exception of the root index, its file must be a direct child of the corresponding lowercase directory.

| Family         | Directory         | Ownership boundary                                                                            |
| -------------- | ----------------- | --------------------------------------------------------------------------------------------- |
| Governance     | `governance/`     | Specification conventions, relationship rules, and planning or process contracts              |
| Foundation     | `foundation/`     | Cross-cutting domain, modeling, execution, numeric, timing, undo and redo, and save contracts |
| Mechanics      | `mechanics/`      | Player-facing game-system rules, transitions, formulas, and effects                           |
| Content        | `content/`        | Versioned GDRs, named parameters, catalogs, and starting configurations                       |
| Interfaces     | `interfaces/`     | Observable player, developer, API, CLI, and UI contracts                                      |
| Acceptance     | `acceptance/`     | Cross-system fixtures, scenarios, expected outcomes, and requirement traceability             |
| Implementation | `implementation/` | Non-behavioural steering for implementers, e.g. architecture or code-quality guidance         |

Implementation documents are non-behavioural. They steer implementers toward code that is easier to maintain and to check
against the other specifications, but they own no game behavior, observable contract, or GDR, and no acceptance test depends on
them. An implementation that ignores an Implementation document can still satisfy every other specification. An Implementation
document may explain which observable contract its guidance supports; that contract remains owned and guaranteed by
its own specification. Implementation documents are registered so that they participate in relationship inventories,
generated views, and graph validation like every other specification.

The Game Specification Index has Family Governance and remains at `docs/specs/README.md` as the navigation entry point.
Family describes ownership, not dependencies; e.g., a Foundation specification may depend on Mechanics specifications without
changing Family. Moving a specification between Families changes its declared ownership category and requires updating its
metadata, register entry, path, and links together.

## Family overviews

Each Family that has at least one registered specification has an informative Family overview at
`docs/specs/<directory>/about-<directory>.md`, e.g. `foundation/about-foundation.md`. A Family overview is not a
specification: it has no metadata, Spec ID, register entry, or relationship inventory, and it owns no game behavior, contract,
term, or GDR. It explains what question each specification in the Family answers, how they relate, and why the
boundaries between them sit where they do, linking each specification instead of restating its content.

A Family overview begins with the H1 `About the <Family> family` and contains the H1 sections What this family is for,
Documents, How they relate, and Why these boundaries, in that order; further sections, e.g. Reading order, may follow.
It links every registered specification of its Family. The How they relate section contains one pair of
`<!-- generated:family-diagram:start -->` and `<!-- generated:family-diagram:end -->` markers. `npm run docs:generate`
replaces the content between them with diagrams of the Family's Explicit relationships, both within the Family and with
other Families, so the diagrams are never edited by hand. The prose outside the markers is maintained by hand: update it
when adding, renaming, re-scoping, or moving a specification in that Family.

## One owner per rule

A rule, formula, parameter value, or API field has one authoritative owner. Other specifications reference it instead of restating a competing version.

## Implicit relationships

The following relationships exist without explicit table rows:

1. Every registered specification implicitly depends on Specification Conventions through `follows` for document structure, lifecycle, and writing rules.
2. Specification Conventions consequently has every other registered specification as an implicit Dependent.
3. An acceptance example or test scenario that explicitly identifies requirements it checks implicitly depends on those requirements through `verifies`.
4. The checked requirements consequently have that acceptance example or test scenario as an implicit Dependent.
5. No other relationship is implicit unless Specification Conventions adds and defines it.

Implicit relationships are exempt from mirrored table rows.

## Relationship inventories

When present, the Relationships and Glossary H1 sections follow Overview in that order, and Glossary immediately
follows Relationships when both are present. Relationships contains one flat unordered list, without tables or subsections. Each bullet
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

Groups are contiguous entries, not headings. E.g., Engine Contract contains:

- Uses [Core Concepts](../foundation/core-concepts.md)

Core Concepts contains the mirror:

- Used by [Engine Contract](../foundation/engine-contract.md)

Both entries describe the same relationship. The first five phrases describe the current document as Dependent;
the last five describe it as Dependency. Reverse-facing phrases are grammatical presentations of the canonical
Relationship kinds, not additional Relationship kinds or glossary synonyms.

List explicit relationships only. When there are none, omit the Relationships section. Do not repeat implicit
relationships. Every explicit relationship
must have its mirror with the same Dependency, Dependent, and Relationship kind. A document pair may have multiple
Relationship kinds, but duplicate entries of the same Relationship kind and direction are invalid. Inventory lists are exhaustive, not example lists.

Relationship entries have no Scope field. Keep substantive constraints and requirement references in the owning
contract prose; a document link does not imply reliance on every rule in that document.
[Links that create no relationship](artifact-relationships.md#links-that-create-no-relationship) defines which
links, e.g. citations and ownership pointers, are not relationships.

Relationships is the only inventory of explicit relationships. Overview must not repeat it as
directional-phrase bullets; where a reliance matters, the owning contract prose states it.

Classify relationships using [Choosing uses or refines](artifact-relationships.md#choosing-uses-or-refines).
Each refinement must identify the parent contract and the added detail about the same subject or behavior in its
owning prose. A scoped Stub may declare that intended detail without settling its TODOs. Applying vocabulary,
obeying invariants, or supplying GDR values alone establishes uses. Do not hide substantive reliance behind
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

This also prohibits near-synonyms: ad hoc descriptive phrases that resemble a defined term, or name a concept that a
defined term or an owning section already covers, without being that term. E.g., do not write "item catalogue" where
the owning Glossary defines Product list. Use the defined term, or the title of the owning section, and link it to its
owner. Coin a new phrase only when no defined term or owning section expresses the concept; if the phrase then names a
concept the specification relies on, define it under the rules above.

Game Data Record has the approved abbreviation **GDR**. Introduce it as **Game Data Record (GDR)**
or **Game Data Records (GDRs)** at the first relevant mention in a document; use **GDR** or **GDRs**
afterward, including headings, tables, and diagram labels. The owning Glossary retains **Game Data Record (GDR)**
as its term label. This abbreviation is an exception to the full-term rule below, not a separate modeling concept.

Player-visible information names the information exposed to an ordinary player. **Player-visible** may be used
as an adjective describing that exposure, e.g., "this value is Player-visible"; it does not name a separate concept.

Use the full glossary term on every mention. Do not abbreviate it, drop words, split its words across a compound,
or substitute a generic noun after introducing the full term. E.g., use GDR rather than "content"
or "entry", and Campaign instance rather than "instance", when referring to those modeling concepts. Grammatical plurals and possessives must retain every word of the term:
GDRs (under the approved abbreviation exception) and Campaign instance's are valid; entries and instance's are not substitutes.

This rule applies throughout specifications and all other project documentation, including headings, tables, diagram
labels, examples, and generated views. Update the owning sources and regenerate derived documentation. Document titles,
file paths, literal code identifiers, and exact quotations retain their actual spelling. Ordinary words remain valid
when they describe something else; e.g., a glossary entry is not a GDR. Review each use in context; do not infer compliance from text search alone.

If two similar terms are retained, they must represent distinct concepts and have separate, non-overlapping definitions in the appropriate Glossary. A term owned by another specification must link to that specification's Glossary rather than be redefined. When an author or reviewer encounters a likely synonym, resolve whether it denotes the same concept. If it does,
replace it with the canonical term and add it to Terminology replacements with its context and a link to the owning
Glossary. If the concepts differ, make their distinct definitions explicit. Unresolved terminology blocks acceptance.

Relationship content uses `Dependency`, `Dependent`, `relationship`, `artifact`, and `relationship kind` exactly as defined by Artifact Relationships. Relationship or glossary content must not substitute competing formal terms for them.
The modeling term [Type](../foundation/core-concepts.md#glossary) describes data independently of a programming
language. Explicit TypeScript terminology remains valid for programming contracts and explanatory analogies;
“relationship type” remains a prohibited substitute for “Relationship kind.”

## Glossary groups

When a Glossary's terms form more than one subject, group them. Each group is an H2 subsection of Glossary named
after the subject its terms cover, never after its role in the document. Each group contains a one-sentence
description followed by exactly one Term and Definition table, and holds at least two terms. A Glossary whose terms
form only one group is not grouped: it keeps a single Term and Definition table directly under its H1 and has no H2
subsections. Prose identifying where shared terms are owned may precede the first group. A Glossary contains no
other subsections and no headings deeper than H2.

Groups only aid navigation. They do not change a term's owner or meaning, and links to a term continue to target the
owning Glossary.

## Terminology replacements

Use the following contextual replacements. This table records prohibited synonyms, not alternative accepted names.
Canonical terms remain owned by their linked glossaries; this list does not redefine them.

| INSTEAD OF                                                           | USE                                                                                                                                                                                                      | Context                                                                                                                                                                                              |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Delegated AI; Delegated agent; scoped AI                             | [Autopilot AI](../foundation/engine-contract.md#glossary)                                                                                                                                                | Referring to the AI that plays while Autopilot is engaged; Agent remains the game-domain concept.                                                                                                    |
| Delegation; Delegation run                                           | [Autopilot](../foundation/engine-contract.md#glossary) or [Autopilot engagement](../foundation/engine-contract.md#glossary)                                                                              | Referring to lending Player API control to an Autopilot AI, or to one such period.                                                                                                                   |
| Delegation scope                                                     | [Autopilot limit](../foundation/autopilot.md#glossary)                                                                                                                                                   | Referring to the bound on an Autopilot engagement.                                                                                                                                                   |
| Holistic AI; overarching AI                                          | [Session controller](../foundation/engine-contract.md#glossary)                                                                                                                                          | Referring to the Principal holding Session authority; its authority does not depend on what kind of caller holds it.                                                                                 |
| Role; execution role                                                 | [Principal](../foundation/engine-contract.md#glossary)                                                                                                                                                   | Naming a kind of engine API caller defined by its API authority; ordinary uses of "role" remain valid.                                                                                               |
| Audience; actor; user role                                           | [Persona](#glossary)                                                                                                                                                                                     | Naming a kind of participant in making, changing, or playing the game; the Audience metadata row keeps its name and lists Personas; ordinary uses of "role" remain valid.                            |
| Game designer; ruleset designer                                      | [Engine designer](#glossary)                                                                                                                                                                             | Naming the Persona that designs the engine and its game behavior.                                                                                                                                    |
| Implementor                                                          | [Implementer](#glossary)                                                                                                                                                                                 | Naming the Persona that implements specifications as code and tests.                                                                                                                                 |
| GDR role                                                             | GDR purpose                                                                                                                                                                                              | Naming what a GDR serves relative to game behavior and Campaign state, as defined in [Purposes of GDRs](../foundation/game-data-records.md#purposes-of-gdrs); one GDR may serve several purposes.    |
| Field; member; key                                                   | [Property](../foundation/core-concepts.md#glossary)                                                                                                                                                      | Naming a component of a structured Type; unrelated uses, e.g. a lookup key, retain their ordinary meaning.                                                                                           |
| Player observation; Player observations                              | [Player-visible information](../foundation/engine-contract.md#glossary)                                                                                                                                  | Referring to information deliberately exposed by the engine to an ordinary player.                                                                                                                   |
| Opportunity                                                          | [Lead](../foundation/domain-model.md#glossary)                                                                                                                                                           | Referring to a Lead; ordinary uses, e.g. opportunity cost, remain valid.                                                                                                                             |
| Attempt                                                              | [Investigation](../foundation/domain-model.md#glossary)                                                                                                                                                  | Referring to an Investigation of a Lead; attempts to execute commands or undertake Missions remain distinct.                                                                                         |
| Fixed reference                                                      | Immutable reference                                                                                                                                                                                      | A reference in [Constants](../foundation/campaign-state.md#glossary); its target cannot be replaced or cleared.                                                                                      |
| Changeable reference                                                 | Mutable reference                                                                                                                                                                                        | A reference in [State](../foundation/campaign-state.md#glossary); gameplay rules govern replacing or clearing its target.                                                                            |
| Content entry; Content; entry; entries                               | [GDR](../foundation/core-concepts.md#glossary)                                                                                                                                                           | Naming immutable game data; use GDR, GDRs, and GDR in attributive uses after introducing the full name. The Content Family, document titles, and the Display content GDR purpose retain their names. |
| Instance; occurrence                                                 | [Campaign instance](../foundation/campaign-state.md#glossary)                                                                                                                                            | Referring to the modeled occurrence, rather than explaining what an occurrence means in a definition.                                                                                                |
| Build                                                                | [Game build](../foundation/core-concepts.md#glossary)                                                                                                                                                    | Naming the version of the game's supplied data and executable logic; ordinary build-tool operations retain their meaning.                                                                            |
| ID                                                                   | [Instance ID](../foundation/campaign-state.md#glossary)                                                                                                                                                  | Identifying a Campaign instance; GDR identifiers, document Spec IDs, and other identifiers retain their own descriptions.                                                                            |
| Relationship type                                                    | [Relationship kind](artifact-relationships.md#glossary)                                                                                                                                                  | Classifying a Relationship; ordinary kinds of other things remain distinct.                                                                                                                          |
| Assignment                                                           | [Current assignment](../foundation/domain-model.md#glossary)                                                                                                                                             | Naming an Agent's current orders; the literal lifecycle label At assignment remains unchanged.                                                                                                       |
| Participation; agent history                                         | [Participation history](../foundation/domain-model.md#glossary)                                                                                                                                          | Referring to retained participation records, rather than the act of participating or an Agent's broader career.                                                                                      |
| Campaign instance kind                                               | [Type](../foundation/core-concepts.md#glossary)                                                                                                                                                          | Describing a category of Campaign instances.                                                                                                                                                         |
| Schema                                                               | [Type](../foundation/core-concepts.md#glossary)                                                                                                                                                          | Describing model data structure; ordinary API or serialization schema usage remains valid.                                                                                                           |
| TypeScript type                                                      | [Type](../foundation/core-concepts.md#glossary)                                                                                                                                                          | Naming a modeling concept; actual TypeScript API declarations and explanatory language analogies remain valid.                                                                                       |
| ImmutableState                                                       | [Constants](../foundation/campaign-state.md#glossary)                                                                                                                                                    | Naming the additional immutable values owned by a Campaign instance; Instance ID is a separate property.                                                                                             |
| MutableState                                                         | [State](../foundation/campaign-state.md#glossary)                                                                                                                                                        | Naming the changeable values owned by a Campaign instance; Campaign state describes the whole playthrough.                                                                                           |
| Instance state (undifferentiated)                                    | [State](../foundation/campaign-state.md#glossary) and [Constants](../foundation/campaign-state.md#glossary)                                                                                              | Separate changeable properties from fixed occurrence facts; do not put the latter in shared GDRs.                                                                                                    |
| EnemyType; EnemyKind                                                 | EnemyArchetype                                                                                                                                                                                           | Naming the shared GDR structure, not the complete Enemy Campaign instance. See [Archetype](../foundation/campaign-state.md#glossary).                                                                |
| Entity ID                                                            | [Instance ID](../foundation/campaign-state.md#glossary)                                                                                                                                                  | Identifying a Campaign instance.                                                                                                                                                                     |
| Content definition                                                   | [GDR](../foundation/core-concepts.md#glossary)                                                                                                                                                           | Referring to concrete immutable game data rather than its Type.                                                                                                                                      |
| Evolving campaign facts                                              | [Campaign state](../foundation/core-concepts.md#glossary)                                                                                                                                                | Describing the data of a particular campaign.                                                                                                                                                        |
| Authoritative fact                                                   | [Authoritative value](../foundation/core-concepts.md#glossary)                                                                                                                                           | Naming the source-of-truth category.                                                                                                                                                                 |
| Computed value; calculated value                                     | [Derived value](../foundation/core-concepts.md#glossary)                                                                                                                                                 | Naming the formal category of values calculated from other values.                                                                                                                                   |
| Archived; archival                                                   | Retained in [World history](../foundation/campaign-state.md#glossary)                                                                                                                                    | Describing retained past data; this phrase does not name a lifecycle state.                                                                                                                          |
| Became historical; deconstructed; destroyed                          | Retained in [World history](../foundation/campaign-state.md#glossary)                                                                                                                                    | Describing retention of Campaign instance data, rather than an actual destruction mechanic. Specify retention as a requirement, not a separate transition term.                                      |
| Scenario (campaign setup); scenario GDR; scenario setup              | [Campaign configuration](../foundation/campaign-state.md#glossary); Campaign configuration preset; campaign creation                                                                                     | Describing how a new Campaign starts; see [Campaign configuration ownership](../foundation/domain-model.md#campaign-configuration-ownership). Test scenario remains valid.                           |
| Fatigue                                                              | [Exhaustion](../mechanics/agents.md#glossary)                                                                                                                                                            | Naming the combatant attribute, its accumulation, or recovery.                                                                                                                                       |
| Hit points; hit-point                                                | [Health](../mechanics/agents.md#glossary)                                                                                                                                                                | Naming the combatant health attribute.                                                                                                                                                               |
| Past participation                                                   | [Participation history](../foundation/domain-model.md#glossary)                                                                                                                                          | Naming Participation history facts.                                                                                                                                                                  |
| Action history; history position; history cursor; history navigation | [Timeline](../foundation/engine-contract.md#glossary); [Timeline position](../foundation/timeline.md#glossary); [Timeline cursor](../foundation/timeline.md#glossary); Timeline navigation               | Referring to the undo and redo record of a Campaign and moving within it.                                                                                                                            |
| History (as a component of Campaign state)                           | [World history](../foundation/campaign-state.md#glossary)                                                                                                                                                | Naming the retained past that game behavior and reports consult; other uses remain valid, e.g. Participation history and Git history.                                                                |
| Continuation state; continuation data; Controller continuation data  | [Campaign state](../foundation/core-concepts.md#glossary), or [Timeline](../foundation/engine-contract.md#glossary) and [Autopilot memory](../foundation/engine-contract.md#glossary) named individually | Naming what is needed to continue a Campaign: Campaign state holds every input game behavior consults; a Campaign save also holds the Timeline and Autopilot memory.                                 |
| Turn-start checkpoint; Autopilot memory checkpoint                   | [Turn-start position](../foundation/timeline.md#glossary); [Autopilot memory](../foundation/engine-contract.md#glossary)                                                                                 | Naming a Timeline position or the Autopilot memory at one; review checkpoints in the work plan remain valid.                                                                                         |
| Template                                                             | [GDR](../foundation/core-concepts.md#glossary) or [Archetype](../foundation/campaign-state.md#glossary)                                                                                                  | Naming immutable game data, or its campaign composition role; describe initialization directly.                                                                                                      |
| Definition (as a modeling category)                                  | [Type](../foundation/core-concepts.md#glossary) or [GDR](../foundation/core-concepts.md#glossary)                                                                                                        | Naming a modeling category; ordinary prose may discuss a term's definition.                                                                                                                          |

These are contextual replacements, not a ban on ordinary uses of “definition,” legitimate destruction mechanics,
or unrelated uses of “configuration.”
Retention in World history does not replace named lifecycle states; e.g., Killed and Completed.

When specifying a game concept, state its applicable modeling role and mutability. Use prose,
property tables, and diagrams for conceptual descriptions; a programming-language declaration is not required. State
multiplicity with an explicit scope, creation and historical transitions, Authoritative values versus Derived values, and
which values affect current gameplay versus serve only historical explanation. Classify properties separately when
these dimensions differ within one Campaign instance. Link to the owning specification for details; explicitly retain
unresolved decisions rather than filling them with assumptions.

## Non-terms

A Non-term is a word that specifications use without defining it, for one of three reasons:

- **Context-dependent:** the word deliberately means different things in different contexts. Specifications benefit
  from that flexibility, and formalizing one meaning would conflict with the others.
- **Deferred:** the word may be formalized later; until then it is reserved.
- **Defines a term:** the word appears in the definition of a formal term, so it stays plain English to avoid a
  circular definition.

A Non-term needs no glossary entry, is never capitalized as a formal term, and must not be treated as a defined term.
The following list of Non-terms is exhaustive:

| Word              | Reason            | Meaning in context                                                                                                                                                                                                                                 |
| ----------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| game behavior     | Context-dependent | What the specification at hand describes the executable implementation doing; e.g., a mechanic's effects or the engine's query guarantees.                                                                                                         |
| game rules; rules | Context-dependent | Ordinary prose for constraints; e.g., a mechanic's constraints on play, or a validation rule in these conventions. Never a stand-in for a complete set of rules.                                                                                   |
| modeling role     | Context-dependent | Which modeling concept an element is or exemplifies; e.g., the "Modeling role" column of the worked-example tables in Game Data Records, whose values include Type, GDR, and Authoritative value. Also used when specifying a game concept, above. |
| playthrough       | Defines a term    | One play of the game, used in the definition of Campaign.                                                                                                                                                                                          |
| Ruleset           | Deferred          | Intentionally unused in specifications. Reserved for future player-facing documentation: a game encyclopedia that explains the rules to the player by highlighting and rewording parts of the specifications.                                      |

# Predictable layout and allowed variation

A specification has three parts, in this order:

1. Framing sections:
   1. `# Overview`, explaining the document's purpose and scope
   2. `# Relationships`, containing the flat directional inventory
   3. `# Glossary`
2. Topic sections: one or more H1 sections, each named after a subject the specification owns; e.g.,
   `# Agent recovery`. Topic sections state the specification's definitions, game behavior, requirements, and
   constraints, grouped by subject. Order them so that a topic follows the topics it builds on.
3. Closing sections:
   1. `# Edge cases and failure behavior`
   2. `# Acceptance examples`
   3. `# Open decisions`, containing only substantive unresolved design choices

Overview is required. Every other section is present only when it applies to the document. Appendices follow the
closing sections.

Use a metadata table immediately below the document-title H1. All sections are unnumbered H1 headings. Subsections may
nest from H2 through H6 when the hierarchy requires it, without skipping a heading level.

Name a topic section after its subject, never after its role in the document. Generic topic headings, e.g.
"Concepts and contract", "Requirements", "Details", or "Specification", are prohibited. State a requirement in the topic
it constrains rather than in a separate collection. An example may sit beside the concept it illustrates instead of
under Acceptance examples. Do not state a contract twice merely to populate a section. Whether a section applies, and
whether embedded examples explain the contracts adequately, are semantic review concerns; the linter checks the order
and content of framing and closing sections, not applicability.

## Handling sections that do not apply

Omit a section that does not apply. Do not keep its heading with a placeholder, e.g. "Not applicable", "N/A",
"None.", or "No explicit relationships."; a present section is never empty.

A missing decision is not "not applicable": keep the section and record the missing content as a TODO. E.g., a
mechanics specification can have no public function signatures while still defining inputs, outputs, and state changes.

## Specialized material

Give each specialized subject its own topic section, or a subsection of the closest topic. The following shapes are common within a Family; they are not additional metadata categories or directories.

| Specialized material | Examples of subsections                    |
| -------------------- | ------------------------------------------ |
| Mechanics rules      | State transitions; formulas; effect timing |
| Numeric contracts    | Representation; rounding; test vectors     |
| API contracts        | Functions; preconditions; results          |

Long supporting tables may use descriptive appendices after the closing sections. State whether an appendix is normative or informative. If a topic repeatedly outgrows its specification, split it into an indexed specification with clear ownership.

# Writing exact requirements

Use plain English by default. **Must** and **must not** express requirements; **may** expresses a permitted alternative. Avoid "usually", "approximately", "appropriate", and "should" in implementation-critical rules unless their measurable meaning is defined. Rationale and suggestions belong in clearly labeled informative text.

Name each coherent requirement or contract with a descriptive section title, without a numbered requirement label or
Spec ID prefix. E.g., Engine Contract uses the heading **Derived value consistency**. Section titles replace
numbered labels throughout specifications, examples, TODOs, and other authored documents. Document-level Spec IDs remain registry and metadata identifiers;
they are not requirement-reference labels.

A section may combine complete obligations with explanation and clearly identified examples in a flowing narrative.
State general constraints explicitly; example-specific choices must not silently become universal rules. Requirements
belong in the topic sections they constrain. Follow the normal heading hierarchy and give sections
distinct, descriptive titles within their document so references are unambiguous.

Reference a requirement or other specification section with a Markdown hyperlink whose visible text is the exact
section title and whose destination is that section's heading anchor. E.g., use
[Derived value consistency](../foundation/engine-contract.md#derived-value-consistency). Link each relevant section
individually rather than using numbered labels, ranges, or a document-only link when a specific contract is meant.
When a title changes or a section moves, update every reference and anchor together. When removing a section, remove
or revise its references; Git history retains the historical record. Glossary-term links may use the canonical term
as their visible text when linking to its owning Glossary.

Stubs keep descriptive TODOs until concrete requirements can be written; do not reserve numbered labels for them.

A rule should make its trigger, inputs, preconditions, outcome, and state changes clear. Use a transition table or pseudocode where prose would conceal ordering. Define:

- Valid and invalid inputs, including empty and duplicate collections.
- Exact thresholds, inclusivity, caps, floors, and tie-breaking.
- Which state snapshot supplies each input and when each effect becomes visible.
- Atomicity and whether rejection changes state, history, or randomness.
- Expected player-command rejection separately from an internal invariant violation.

## Formula and state machine notations

A specification may use either of the following notations where it fits the behavior being described. They are
notations, not a classification: a specification is not required to label its statements, and behavior that fits
neither is described in ordinary prose. A statement written in one of these notations is complete only when it states
every item in that notation's checklist.

A **formula** computes one value from other values. It states:

- Its inputs, each with its unit and domain.
- The expression.
- Rounding: where rounding occurs and which rounding operation applies, or that no rounding occurs.
- The valid range of the result.

E.g., "The total price equals the unit price multiplied by the quantity, rounded down to a whole number. The unit
price is a nonnegative whole number of cents and the quantity is a positive whole number, so the total price is a
nonnegative whole number of cents." [Formulas and uncertainty](#formulas-and-uncertainty) adds the requirements for
symbols, evaluation order, random outcomes, and worked numerical examples.

A **state machine** describes something that is in exactly one of a fixed set of states at a time. It states:

- The exhaustive set of states.
- A transition table listing, for each transition, its source state, target state, trigger, and condition.
- That every transition not listed in the table is impossible.

E.g., a door has the exhaustive states Open, Closed, and Locked, and this transition table:

| Source state | Target state | Trigger | Condition                   |
| ------------ | ------------ | ------- | --------------------------- |
| Open         | Closed       | Close   | Nothing blocks the doorway. |
| Closed       | Open         | Open    | Always permitted.           |
| Closed       | Locked       | Lock    | The opener holds the key.   |
| Locked       | Closed       | Unlock  | The opener holds the key.   |

Every transition not listed, e.g. from Open directly to Locked, is impossible.

## Formulas and uncertainty

Define every symbol, unit, domain, and referenced parameter. Show evaluation order and rounding points; link common numeric rules rather than assuming real-number arithmetic equals runtime arithmetic.

For random rules, specify the distribution, draw timing and order, interval boundaries, success comparison, and which information is hidden. Distinguish the true probability, conditional probability, cumulative probability, and displayed estimate whenever relevant. Define what information an estimate conditions on, including previous outcomes.

Include worked numerical examples for normal cases and boundaries. Equations, prose, pseudocode, and examples must agree. An unexplained "chance increases over time" or "diminishing returns" is not a complete rule.

## Contracts and GDRs

Public API specifications define exact names, types, argument shapes, outputs, and errors when they are ready for acceptance. Conceptual domain specifications need not mirror implementation storage layouts.

GDR tables define stable GDR identifiers, units, values, references, and their owning formulas. A name or a number appearing only inside an example is not an implicit GDR. Use parameter references instead of copying balance values throughout mechanics specifications.

## Marking examples

Introduce every example with "e.g." so a reader never has to infer whether a statement is general or illustrative.
This applies to whole example sentences, clauses, inline enumerations, bullet lists, and illustrative tables. Write
"E.g., Factions can be redesigned without touching Campaign State.", not a bare "Factions can be
redesigned without touching Campaign State." following a general statement. Do not use "for example" or
"for instance" as the marker. "Such as", "including", and "illustrates" alone do not mark an example. A section,
table, or list explicitly titled or labeled "Examples", "Acceptance examples", or "Worked example" is already marked,
and its items need no further "e.g.". This rule applies to every authored document in the repository, not only
specifications.

## Illustrative and exhaustive enumerations

Every non-exhaustive enumeration must be marked under [Marking examples](#marking-examples), with "e.g." or an
"Examples" label. This applies to inline enumerations, bullet lists, and illustrative tables. Each illustrative list must contain at most three examples. Do not split one list into smaller
lists merely to evade this limit. Use the fewest representative examples needed and link to the authoritative
enumeration when readers need the full set.

Clearly identify exhaustive enumerations and maintain them in their authoritative owner. Elsewhere, reference that
owner rather than copying the list. Do not shorten exhaustive contracts, procedures, or worked acceptance scenarios
under the three-example limit, or relabel normative obligations as examples. This distinction prevents illustrative
lists from looking like complete sets that must grow whenever a new value is added.

## Scope exclusions

A statement of what something is not, does not own, or does not do is a non-exhaustive enumeration under
[Illustrative and exhaustive enumerations](#illustrative-and-exhaustive-enumerations), unless it is explicitly
identified as exhaustive. Name only the few key exclusions a reader is likely to expect, and mark them with "e.g.".
Name each exclusion with its canonical term, or with the title of the specification or section that owns it, and link
it to that owner. Do not coin a descriptive phrase for an exclusion under
[Canonical terminology](#canonical-terminology); an exclusion that no defined term or owning section names is rarely
worth stating.

E.g., an Overview of a checkout specification states that it does not own, e.g., payment or shipping, each linked to
the specification that owns it. It does not list "payment processing, tax computation, carrier integration, address
validation, or invoice layout", a long list of phrases that no Glossary defines and no link resolves.

# Examples, conformance, and evidence

Every substantial rule must be covered by an acceptance example or a referenced test scenario. Foundation specifications
using embedded examples may instead explain their modeling contracts through self-contained illustrations alongside
the concepts, linking to the applicable requirements. These illustrations introduce no production gameplay rules and
need not be organized as test fixtures or command sequences. Every acceptance example must identify all applicable
items in this checklist:

- Hyperlinks to the requirement sections exercised and, when needed for reproducibility, the game revision and GDR fixture.
- Initial state and inputs, including fixed injected random outcomes for stochastic results; never assert outcomes
  that depend on a particular seed, and otherwise compare replayed results for equality.
- The command or event sequence.
- Expected state, output, visibility, history, and random behavior where relevant.
- Exact comparisons or explicitly specified numeric tolerances.

Examples of one specification's rules stay in that specification. Cross-system scenarios belong in [Campaign Integration and Acceptance Tests](../acceptance/campaign-integration-and-acceptance-tests.md) and reference their owners.

Test derivation must follow the specification; current code output is not an independent oracle. If code, tests, and the specification disagree, identify the discrepancy and resolve it explicitly. Do not rewrite a specification merely to bless existing behavior. Do not silently replace an accepted rule to match a newer brief passage; record the design conflict and proposed revision.

Separate exact conformance criteria from strategic playtesting goals. A game being interesting or having multiple viable strategies requires playtesting; it cannot be established by a deterministic unit test alone.

Use relative Markdown links between specifications. For inherited-game evidence, identify relevant paths and, when a behavioral claim is carried into a drafted specification, the inspected revision where practical.

Label evidence or proposals as **Inherited behavior**, **v5 requirement**, **Proposed rule**, or **Informative rationale** when the distinction could be unclear. Legacy bugs and undocumented implementation quirks are not requirements. A legacy formula can become a proposed rule only by being stated explicitly.

# TODOs and acceptance checklist

## Deterministic validation

Run `npm run lint:specs` to validate the complete registered specification corpus. The repository-owned, read-only linter parses Markdown structurally and reports stable diagnostics for registry and metadata agreement, required layout, local links and anchors, relationship inventories and mirrors, Family overview presence, structure, and coverage, acyclic `follows` and `refines` graphs, objectively prohibited terminology, prohibited numbered requirement labels and section-title references, and status-specific TODO and Open decisions rules. It performs no network access and offers no automatic fixes.

A successful deterministic lint means only that every machine-checkable convention passed. It does not accept a specification or establish relationship truth, refinement compatibility, the meaning of a `uses` cycle, conceptual synonymy, formula correctness, acceptance-example validity, or gameplay correctness. Review those semantic concerns separately.

A TODO states what is missing and what a complete answer must include. E.g., prefer:

> TODO: Define the per-turn completion probability, including its conditioning on previous unsuccessful turns, progress-removal behavior, rounding, and a numerical example.

Avoid vague placeholders; e.g., "TODO: implement investigations." Documentation TODOs request decisions or contract content, not implementation.

Use Open decisions to collect unresolved choices and identify affected sections or specifications. A TODO may appear at the exact location of missing content; summarize blocking choices in Open decisions without duplicating entire rules. Do not invent a default to close a TODO unless it is explicitly labeled as a proposal.

Before acceptance, verify:

- Scope and ownership are clear and all references resolve.
- Every statement is observable, designer-authored, or vocabulary needed for those statements, as defined in
  [What belongs in a specification](#what-belongs-in-a-specification); implementer-discretion matters are not specified.
- Explicit relationships and Implicit relationships satisfy Artifact Relationships, including mirrored Explicit relationship rows.
- Every mention uses the full canonical glossary term, including headings, tables, and diagrams. Necessary new formal terms are defined in their owning Glossary; encountered synonyms and mention shortcuts are recorded in Terminology replacements.
- Glossary terms are grouped as required by [Glossary groups](#glossary-groups).
- Every example is introduced with "e.g." or sits under an explicit "Examples" label; every illustrative enumeration contains at most three examples; exhaustive enumerations are clearly distinguished and owned.
- There are no unresolved implementation-affecting TODOs or decisions within scope.
- Inputs, transitions, formulas, outputs, units, timing, and visibility are unambiguous.
- Boundary cases and failures are defined.
- Worked examples and acceptance scenarios agree with the rules.
- Related contracts and GDR tables are consistent.
- Deferred features are explicitly out of scope, not holes in an allegedly complete contract.
- The project owner has explicitly accepted the document.

When accepted behavior changes, link to affected requirement sections by title and dependent specifications, revise their examples together, and record any save, replay, or API compatibility impact. Git history and review records provide change history; avoid duplicating every edit in per-document changelogs.

# Acceptance

This acceptance applies to the conventions only; subject specifications retain their own statuses. Future changes must be presented as revisions rather than silently changing the accepted agreement.
