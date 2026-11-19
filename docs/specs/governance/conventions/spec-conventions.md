# Specification Conventions

| Metadata | Value |
| --- | --- |
| Spec ID | CONV |
| Family | Conventions |
| Audience | Engine designer, Content designer, UI designer, AI designer, Implementer |
| Owns | How every specification is written, whatever its Specification kind: layout, metadata, ownership, wording, and unspecified content. |
| Related documents | [Spec index](../../README.md), [game design brief](../../../game-design-brief.md) |

# Overview

Specifications are the durable authority for intended behavior. Code and tests implement that behavior and may be replaced without changing the contract. The [game design brief](../../../game-design-brief.md) explains intent and strategic tensions; the specifications resolve those ideas into precise rules.

Every specification is written the same way, so a reader who knows one can find their way in any other: the same layout, one owner for every rule, exact wording, and visible marks for what is not settled. What a specification may contain differs by Specification kind, and further conventions add detail on terminology, Glossaries, Overviews, and each Specification kind.

# Glossary

## Specifications

What a specification is and how it is identified and classified.

| Term | Definition | Prohibited synonyms |
| --- | --- | --- |
| Specification | A registered artifact that defines rules, contracts, game data, governance, or planned specification work. |  |
| Registered | Declared by its own metadata table, with a stable Spec ID, in a Markdown file under `docs/specs` that is not an overview of a Specification kind or a Family. |  |
| Specification kind | One of the three broad divisions of the specifications, Governance, Design, and Implementation, which differ in what their specifications govern. |  |
| Family | A subdivision of a Specification kind that is a specification's single ownership category, declared in metadata and mapped to its directory. |  |
| Design specification | A specification of the Design Specification kind, which describes the game itself. |  |
| Requirement | A normative statement with a stable identifier that defines implementable behavior or a constraint. |  |

## Artifacts

What specifications describe and what is built and checked from them.

| Term | Definition | Prohibited synonyms |
| --- | --- | --- |
| Artifact | An identified specification, requirement, implementation, test, or other item |  |
| Implementation | An executable artifact intended to satisfy a specification or requirement |  |
| Acceptance example | A worked example that identifies the requirements it checks and states testable expected results. |  |

## Participants

The kinds of participant in making, changing, or playing the game.

| Term | Definition | Prohibited synonyms |
| --- | --- | --- |
| Persona | A kind of participant in making, changing, or playing the game, defined by what the participant does with the game. The Personas are Game designer, Engine designer, Content designer, UI designer, AI designer, Implementer, and Player. | Audience; actor; user role. The Audience metadata row keeps its name, and ordinary uses of "role" remain valid. |
| Game designer | The Persona that does all the design of the game, encompassing what the Engine designer, Content designer, UI designer, and AI designer do. |  |
| Engine designer | The Persona that designs the engine and the rules of the game, decides which inputs to those rules game data supplies, and establishes these specification conventions. | Ruleset designer |
| Content designer | The Persona that authors game data within the structures the Engine designer exposes for content. |  |
| UI designer | The Persona that designs player-facing interfaces over the engine API. |  |
| AI designer | The Persona that designs an AI that plays the game. |  |
| Implementer | The Persona that implements specifications as code and tests. | Implementor |
| Player | The Persona that plays the game. |  |

# Specification kinds and Families

The specifications differ first in what they govern, and that difference decides what each may contain and who must obey it. Governance specifications govern how specifications are written and how work on them proceeds; Design specifications describe the game itself; Implementation specifications steer how an Implementation is built from the Design specifications. Each Specification kind is divided into Families, and each Family is a single ownership category. Neither is tied to authoring order.

Every registered specification declares exactly one of these Families in metadata, and its Specification kind follows from that Family. With the exception of the root index, its file must be a direct child of the directory the following table names for its Family, or of a subdirectory of that directory, one level deep, that groups specifications the Family's overview names together. The following table is exhaustive.

| Specification kind | Family | Directory | Ownership boundary | Builds on |
| --- | --- | --- | --- | --- |
| Governance | Conventions | `governance/conventions/` | How specifications are written, registered, and related | Nothing |
| Governance | Process | `governance/process/` | How the game is developed, and how work on the specifications is planned and tracked | Nothing |
| Design | Foundation | `design/foundation/` | Cross-cutting vocabulary, modeling, engine execution, numeric, undo and redo, and save contracts | Nothing |
| Design | Mechanics | `design/mechanics/` | Game concepts, player-facing game-system rules, transitions, formulas, and effects, and the order of Advance turn | Foundation |
| Design | Content | `design/content/` | Versioned game data, named parameters, catalogs, and starting configurations | Foundation, Mechanics |
| Design | UI | `design/ui/` | Non-behavioural guidance on how user interfaces present the engine API to the Player | Foundation, Mechanics |
| Design | Autopilot AIs | `design/autopilot-ais/` | The goals and priorities of each AI that plays the game for the player | Foundation, Mechanics |
| Implementation | Mandatory | `implementation/mandatory/` | Repository constraints that every Implementation must meet | Foundation, Mechanics, Content, UI, Autopilot AIs |
| Implementation | Guidance | `implementation/guidance/` | Technical suggestions on matters the Design specifications leave open, e.g. architecture guidance | Foundation, Mechanics, Content, UI, Autopilot AIs |
| Implementation | Recipes | `implementation/recipes/` | Suggested steps for carrying out one recurring implementation task, e.g. publishing an Implementation | Foundation, Mechanics, Content, UI, Autopilot AIs, Mandatory |

The Builds on column states which Families a Family builds on. A specification depends only on specifications of its own Family, of the Families its Family builds on, and of the Families those build on in turn; every specification also follows Specification Conventions, as its Conventions metadata row shows. Foundation and Mechanics together form the game engine, which Content, UI, and Autopilot AIs build on; every Implementation Family builds on all the Design Families, and Recipes also builds on Mandatory. The Conventions specifications rely on no Design or Implementation specification, because they govern them: they state their rules without the terms those specifications own and do not link them, and a writing rule about one such term belongs to the specification that owns it. [Family architecture](../../README.md#family-architecture) in the specification index shows a diagram generated from the links between the specifications, so it can be compared with this table.

The Game Specification Index has Family Conventions and remains at `docs/specs/README.md` as the navigation entry point. Family describes ownership; the Builds on column limits which Families a specification may depend on. Moving a specification between Families changes its declared ownership category and requires updating its metadata, path, and links together.

## What belongs in a specification

A statement belongs in a specification only when the conventions of its Specification kind admit it, and everything else is left out. The criteria for a Design specification are under [What belongs in a Design specification](design-spec-conventions.md#what-belongs-in-a-design-specification), and those for an Implementation specification under [What belongs in an Implementation specification](implementation-spec-conventions.md#what-belongs-in-an-implementation-specification). A Governance specification states only how specifications are written, related, and registered, or how the work on them proceeds.

## Following the conventions

Some conventions hold for every specification and some only for one Specification kind, and every specification shows which ones it follows. Following Specification Conventions includes following every other Conventions specification, except [Design Specification Conventions](design-spec-conventions.md) and [Implementation Specification Conventions](implementation-spec-conventions.md), which apply only to their own Specification kind.

Every registered specification other than Specification Conventions and the Game Specification Index has a Conventions metadata row. The row links Specification Conventions; a Design specification's row also links Design Specification Conventions, and an Implementation specification's row also links Implementation Specification Conventions. The row links nothing else.

# Document lifecycle and ownership

A specification is written and read by different participants, keeps changing as the game is developed, and must keep one clear owner for everything it states throughout.

## Personas

A Persona describes what a participant does with the game, independently of whether a human or an LLM-based agent fills it; in this project, LLM-based agents fill the Implementer Persona. One participant may fill several Personas. A Persona grants no engine API authority. Most Personas write specifications within their area, following these conventions.

The following table is the exhaustive set of Personas. The last column names the Families each Persona mainly works with, as listed in [Specification kinds and Families](#specification-kinds-and-families), and links key specifications in them.

| Persona | Filled by | What the Persona does | Primary Families |
| --- | --- | --- | --- |
| Game designer | Human | Does all the design of the game, encompassing the Engine designer, Content designer, UI designer, and AI designer Personas, and decides how much of that work to delegate to LLMs. | All Families |
| Engine designer | Human | Designs the engine and the rules of the game, decides which inputs to those rules game data supplies and so become content, and establishes these specification conventions. | Conventions, Foundation, Mechanics |
| Content designer | Human or LLM | Authors game data, including the initial content and in-game encyclopedia articles, within the structures the Engine designer exposes for content. | Foundation, Mechanics |
| UI designer | Human or LLM | Designs player-facing interfaces over the shared engine API. | UI, Foundation |
| AI designer | Human or LLM | Designs an AI that plays the game. | Autopilot AIs, Foundation |
| Implementer | LLM | Implements specifications as code and tests. | Foundation, Mechanics, UI, Autopilot AIs, Mandatory, Guidance, Recipes |
| Player | Human or LLM | Plays the game. | None directly; plays through a user interface |

## Changing specifications

Every specification may change at any time, because the game is under active development. Its current wording, terms, API names, or the effort of changing it is never a reason to keep a design choice; justify proposals on their merits. Creating a document, generating tests, or successfully implementing it does not make it any less open to change.

A specification states the current contract only. Do not record who requested or approved a change, or when: add no approval or revision metadata rows, approval notices, or prose describing a change's request or approval history. Git history records changes. Do not describe a document's maturity, e.g. that it is a draft or awaiting review, in metadata, body paragraphs, notices, or TODOs; what it has not settled yet is recorded as described under [Kinds of unspecified content](#kinds-of-unspecified-content).

The TODOs section contains only the items that [Kinds of unspecified content](#kinds-of-unspecified-content) defines. Do not list already stated rules merely to request review. Omit the section when it would have no item.

Each specification has a stable Spec ID, Family, title, Audience, Owns summary, and Conventions row. The Audience metadata row lists the [Personas](#personas) who mainly read or act on the document, separated by commas, in the order of the Personas table; at least one Persona is required. Overview describes the subject of the specification under [Specification Overview](overview-conventions.md#specification-overview); do not add a Scope row to metadata. The Owns metadata row is a one-sentence summary of what the specification owns; the generated catalog lists it for navigation.

## One owner per rule

A rule, formula, parameter value, or API field has one authoritative owner. Other specifications reference it instead of restating a competing version.

When a rule uses something another specification decides, link that section where the rule uses it. The link is the whole pointer. Do not write a sentence or clause whose only content is that another specification owns something. The one exception is a place where a reader would conclude that a rule is missing from all specifications; there, one clause with a link is enough. E.g., write "the Order is cancelled when its payment fails" with "payment fails" linked to the section that decides it, not "Payments owns when a payment fails". A table column that names the owner of each row is data a reader looks up, not narration, and remains valid.

# Predictable layout and allowed variation

Readers find their way through many specifications by knowing where everything sits. A specification has three parts, in this order:

1. Framing sections:
   1. `# Overview`, describing the subject of the specification
   2. `# Glossary`
2. Topic sections: one or more H1 sections, each named after a subject the specification owns; e.g., `# Order cancellation`. Topic sections state the specification's definitions, rules, requirements, and constraints, grouped by subject. Order them so that a topic follows the topics it builds on.
3. Closing sections:
   1. `# Edge cases and failure behavior`
   2. `# Acceptance examples`
   3. `# TODOs`, containing every TODO of the specification under [Kinds of unspecified content](#kinds-of-unspecified-content)

Overview is required. Every other section is present only when it applies to the document. Appendices follow the closing sections.

Use a metadata table immediately below the document-title H1. All sections are unnumbered H1 headings. Subsections may nest from H2 through H6 when the hierarchy requires it, without skipping a heading level.

Name a topic section after its subject, never after its role in the document. Generic topic headings, e.g. "Concepts and contract", "Requirements", "Details", or "Specification", are prohibited. State a requirement in the topic it constrains rather than in a separate collection. An example may sit beside the concept it illustrates instead of under Acceptance examples. Do not state a contract twice merely to populate a section. Whether a section applies, and whether embedded examples explain the contracts adequately, are semantic review concerns; the linter checks the order and content of framing and closing sections, not applicability.

## One subject per specification

A specification has one subject, which its Overview can state in one sentence without joining unrelated nouns. When the Owns row or Overview needs a list of subjects that change for different reasons, e.g. "Order placement, product catalog structure, and customer accounts", split the specification so that each part has one subject.

## Subject before document

Write about the subject, not about the document. Do not announce what a section will say, summarize what it said, explain why a rule is placed where it is, except in the statement of the subject's place under [Specification Overview](overview-conventions.md#specification-overview), or describe how the document treats game data values, examples, or other documents.

### Orientation before detail

Every topic section, and every subsection that states rules, opens with a lead: one to three sentences saying what the subject of the section is for or which problem its rules solve, before any list, table, subsection, or rule. E.g., a section on refunds opens "A refund returns money the store should not keep, e.g. for goods that never arrived," and then lists the rules; it does not open with "Refunds follow these complete rules:". A completeness statement, e.g. "The following rules are complete", follows the lead.

## Handling sections that do not apply

Omit a section that does not apply. Do not keep its heading with a placeholder, e.g. "Not applicable", "N/A", or "None."; a present section is never empty.

A missing decision is not "not applicable": record the missing content as a TODO in the TODOs section, naming the section to be written, under [Kinds of unspecified content](#kinds-of-unspecified-content). E.g., a specification can have no public function signatures while still defining inputs, outputs, and state changes.

# Requirement wording

A requirement is read by an LLM that takes every word literally, so its wording leaves no doubt about what is obligatory. Use plain English by default. **Must** and **must not** express requirements; **may** expresses a permitted alternative. Avoid "usually", "approximately", "appropriate", and "should" in implementation-critical rules unless their measurable meaning is defined. Rationale and suggestions belong in clearly labeled informative text.

Name each coherent requirement or contract with a descriptive section title, without a numbered requirement label or Spec ID prefix. E.g., a specification of a store uses the heading **Order total consistency**. Section titles replace numbered labels throughout specifications, examples, TODOs, and other authored documents. Document-level Spec IDs remain registry and metadata identifiers; they are not requirement-reference labels.

A section may combine complete obligations with explanation and clearly identified examples in a flowing narrative. State general constraints explicitly; example-specific choices must not silently become universal rules. Requirements belong in the topic sections they constrain. Follow the normal heading hierarchy and give sections distinct, descriptive titles within their document so references are unambiguous.

Reference a requirement or other specification section with a Markdown hyperlink whose visible text is the exact section title and whose destination is that section's heading anchor. E.g., use `[Order total consistency](orders.md#order-total-consistency)`. Link each relevant section individually rather than using numbered labels, ranges, or a document-only link when a specific contract is meant. When a title changes or a section moves, update every reference and anchor together. When removing a section, remove or revise its references; Git history retains the historical record.

Content not yet written stays as descriptive TODOs in the TODOs section until concrete requirements can be written; do not reserve numbered labels for them.

Use relative Markdown links between specifications.

## Marking examples

Introduce every example with "e.g." so a reader never has to infer whether a statement is general or illustrative. This applies to whole example sentences, clauses, inline enumerations, bullet lists, and illustrative tables. Write "E.g., Orders can be redesigned without touching Store Model.", not a bare "Orders can be redesigned without touching Store Model." following a general statement. Do not use "for example" or "for instance" as the marker. "Such as", "including", and "illustrates" alone do not mark an example. A section, table, or list explicitly titled or labeled "Examples", "Acceptance examples", or "Worked example" is already marked, and its items need no further "e.g.". This rule applies to every authored document in the repository, not only specifications.

## Illustrative and exhaustive enumerations

Every non-exhaustive enumeration must be marked under [Marking examples](#marking-examples), with "e.g." or an "Examples" label. This applies to inline enumerations, bullet lists, and illustrative tables. Each illustrative list must contain at most three examples. Do not split one list into smaller lists merely to evade this limit. Use the fewest representative examples needed and link to the authoritative enumeration when readers need the full set.

Clearly identify exhaustive enumerations and maintain them in their authoritative owner. Elsewhere, reference that owner rather than copying the list. Do not shorten exhaustive contracts, procedures, or worked acceptance scenarios under the three-example limit, or relabel normative obligations as examples. This distinction prevents illustrative lists from looking like complete sets that must grow whenever a new value is added.

# Validation and unspecified content

Part of a specification's quality can be checked by a machine and the rest only by a reviewer, and whatever it has not settled yet must be visible rather than hidden.

## Deterministic validation

Run `npm run lint:specs` to validate the complete registered specification corpus. The repository-owned, read-only linter parses Markdown structurally and reports stable diagnostics for metadata completeness, Family directories under [Specification kinds and Families](#specification-kinds-and-families), required layout, local links and anchors, linked first mentions of terms and the absence of cycles among the specifications under [Deterministic validation](artifact-relationships.md#deterministic-validation), links from a Conventions specification to a Design or Implementation specification, the Conventions row under [Following the conventions](#following-the-conventions), Specification kind and Family overview presence, structure, and coverage under [Family overviews](overview-conventions.md#family-overviews), objectively prohibited terminology, the shape of the [Prohibited synonyms column](glossary-conventions.md#prohibited-synonyms-column), prohibited numbered requirement labels and section-title references, the length limits and prohibited document-describing phrases under [Subject before document](#subject-before-document), [Specification Overview](overview-conventions.md#specification-overview), and [Glossary groups](glossary-conventions.md#glossary-groups), topic sections and their subsections that open with a list, table, or subsection instead of a lead under [Orientation before detail](#orientation-before-detail), and the TODO rules under [Kinds of unspecified content](#kinds-of-unspecified-content). It performs no network access and offers no automatic fixes.

A successful deterministic lint means only that every machine-checkable convention passed. It does not establish conceptual synonymy, formula correctness, acceptance-example validity, or gameplay correctness. A review checks every rule of the conventions that a specification follows, under [Following the conventions](#following-the-conventions), including those the linter cannot check.

## Kinds of unspecified content

A specification leaves something unspecified in exactly one of three ways. This table is exhaustive.

| Kind | Meaning | Where it is written | How it is marked |
| --- | --- | --- | --- |
| Implementer's choice | It will never be specified. Any implementation is correct. | At the rule it concerns, in the topic section. It is part of the contract. | The fixed phrase "Implementer's choice", e.g. "the exact error representation is the Implementer's choice". |
| TODO | It will be specified, but is not yet. | Only in the closing `# TODOs` section, one list item per TODO. Each item links the section it affects, when that section exists. | `TODO:` when the specification cannot be implemented without it; `TODO (later):` when the specification is complete without it and the feature is to be added later. |
| Out of scope | It is not part of the game, and there is no plan to specify it. | Nowhere, unless a reader would expect the rule; then one sentence in the topic section, under [Scope exclusions](design-spec-conventions.md#scope-exclusions). | The words "out of scope". |

No TODO text appears outside the TODOs section. A specification may omit a section whose content is not written yet, and the TODO item names the section to be written. A `TODO:` item marks content without which the section it affects cannot be implemented. A `TODO (later):` item does not: without it, the specification is a complete contract for the game as it is now.

A TODO states what is missing and what a complete answer must include. E.g., prefer:

> TODO: Define the discount applied to a repeat Order, including its conditioning on earlier cancelled Orders, its upper limit, rounding, and a numerical example.

Avoid vague placeholders; e.g., "TODO: implement discounts." Documentation TODOs request decisions or contract content, not implementation. A `TODO (later):` item names the feature in one line, e.g. "TODO (later): Gift wrapping."

Do not invent a default to close a TODO unless it is explicitly labeled as a proposal.
