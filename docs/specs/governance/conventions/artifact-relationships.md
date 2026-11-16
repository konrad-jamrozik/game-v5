# Artifact Relationships

| Metadata    | Value                                                                            |
| ----------- | -------------------------------------------------------------------------------- |
| Spec ID     | REL                                                                              |
| Family      | Conventions                                                                      |
| Audience    | Engine designer, Implementer                                                     |
| Owns        | Artifact relationship terminology, direction, inventories, and graph validation. |
| Conventions | [Specification Conventions](spec-conventions.md)                                 |

# Overview

A specification rarely stands alone: it builds on vocabulary from one document, adds detail to a contract in another,
and is implemented and tested elsewhere. Relationships make these connections explicit, so that a change to one
artifact shows which others it can affect. Every relationship runs from a Dependency to a Dependent and has one
Relationship kind, e.g. `uses` or `refines`, which says what the Dependent takes from the Dependency. Explicit
relationships are recorded in mirrored lists, and the relationships of each kind form a graph that is checked for
cycles.

The two kinds between specifications are read off their text rather than judged: a specification uses another when it
applies a term or rule the other owns, and refines another when the other hands off to it the detail of a term the
other owns. Because terms have a single owner, a cycle among these relationships shows a term or a rule in the wrong
specification, and the acyclic graph that remains places every specification in a layer.

A relationship records a connection, not a judgment: it does not accept a proposed rule,
and it proves nothing about an implementation or a test run.

# Relationships

- Used by [Specification Conventions](./spec-conventions.md)

# Glossary

## Artifacts

The things that relationships connect.

| Term           | Definition                                                                                                                                                                           | Prohibited synonyms |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- |
| Artifact       | An identified [specification](spec-conventions.md#glossary), [requirement](spec-conventions.md#glossary), implementation, test, or other item that can participate in a relationship |                     |
| Implementation | An executable artifact intended to satisfy a specification or requirement                                                                                                            |                     |

## Relationship structure

Directional connections between artifacts and how they are recorded.

| Term                  | Definition                                                                                                         | Prohibited synonyms                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Relationship          | A directional connection from one Dependency to one Dependent with a Relationship kind                             |                                                                    |
| Dependency            | The artifact on which the Dependent relies; it appears on the left of `Dependency → Dependent`                     |                                                                    |
| Dependent             | The artifact that relies on the Dependency; it appears on the right of `Dependency → Dependent`                    |                                                                    |
| Relationship kind     | Exactly one of `follows`, `refines`, `uses`, `implements`, or `verifies`                                           | Relationship type. Ordinary kinds of other things remain distinct. |
| Explicit relationship | A relationship recorded in mirrored directional list entries                                                       |                                                                    |
| Implicit relationship | A relationship created by an applicability rule under Implicit relationships rather than repeated artifact entries |                                                                    |
| Relationships section | An artifact's flat list of explicit directional relationships                                                      |                                                                    |

## Reading relationships from text

What in a specification's text creates a `uses` or `refines` relationship.

| Term           | Definition                                                                                                                                                    | Prohibited synonyms |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| Term owner     | The specification whose Glossary defines a term; every term has exactly one                                                                                   |                     |
| Named rule     | A section of a specification, identified by its heading                                                                                                       |                     |
| Normative text | Every part of a specification except its Overview, its Relationships section, its acceptance examples, and the examples its other text introduces with "e.g." |                     |
| Pointer        | A sentence or table row of Normative text that names a term and links the specification that states it, and states no rule of its own                         | Owner link          |
| Handoff        | A Pointer whose term the pointing specification owns; it hands the detail of that term to the linked specification                                            |                     |

## Graphs

Structures formed by artifacts and their relationships.

| Term  | Definition                                                            | Prohibited synonyms |
| ----- | --------------------------------------------------------------------- | ------------------- |
| Graph | A collection of artifacts and relationships                           |                     |
| Cycle | A directional relationship path that returns to its starting artifact |                     |
| DAG   | A directed acyclic graph                                              |                     |

# Direction

Every relationship is read as **Dependency → Dependent**.

If A depends on B, B is the Dependency and A is the Dependent. The relationship runs `B → A`. Dependency and Dependent
are the only terms for the two participating artifacts in this model.

Every relationship must run `Dependency → Dependent`. The Dependent `follows`, `refines`,
`uses`, `implements`, or `verifies` the Dependency. Do not reverse the relationship when presenting it in the other
artifact's Relationships section. Do not enumerate a transitive relationship unless it also exists directly. An
artifact must not depend on itself.

# Relationship kinds

Each Relationship kind describes how the Dependent relates to the Dependency.

| Relationship kind | Meaning                                                                                                                  | Permitted artifacts                                       | Illustrative example                                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `follows`         | The Dependent conforms to the Dependency's document structure, lifecycle, or writing rules                               | Document → document governed by those rules               | Specification Conventions → Agents                                                                                             |
| `refines`         | The Dependency hands off to the Dependent the detail of a term the Dependency owns, and the Dependent states that detail | Specification → refining specification                    | Domain Model → Agents                                                                                                          |
| `uses`            | The Dependent's Normative text applies a term the Dependency owns or a Named rule of the Dependency                      | Specification → specification                             | Core Concepts → Engine Contract                                                                                                |
| `implements`      | The Dependent executable artifact provides behavior intended to satisfy the Dependency                                   | Specification or requirement → implementation             | Engine Contract → identified engine implementation                                                                             |
| `verifies`        | The Dependent test or scenario specifies or performs checks of the Dependency                                            | Specification or requirement → acceptance example or test | [Committed state integrity](../../design/foundation/engine-contract.md#player-actions-and-turns) → identified restoration test |

A refining specification is a part of the specification it refines: it states what that specification leaves to it.
An implementation can `implement` a specification; a specification does not implement its implementation. A test can
`verify` a requirement without asserting that the test currently passes.

# Choosing uses or refines

Whether one specification uses or refines another is decided by its text, under the following rules, so that two
readers of the same text record the same relationships.

## Uses

A specification uses another when its Normative text applies a term the other owns, or applies a Named rule of the
other by linking that section in a clause that relies on it. E.g., "Each new [Enemy](../../design/mechanics/domain-model.md#combat) gets its initial values under
[Campaign instance](../../design/foundation/core-concepts.md#campaign-instances) creation in Campaign Instances" applies a Named rule of Campaign Instances, and "An Enemy is a
Campaign instance" applies a term Campaign Instances owns; either makes the specification use Campaign Instances.

Only Normative text counts. A term that appears only in the Overview, in an acceptance example, or in an example
introduced with "e.g." creates no relationship, because those parts illustrate or orient and state no rule.
[Acceptance examples](design-spec-conventions.md#glossary) check the rules the specification states elsewhere, so they add no reliance of their own.

## Refines

A specification refines another when the other hands off to it, through a Handoff, the detail of a term the other
owns, and the refining specification states that detail. E.g., Engine Contract owns the term [Timeline](../../design/foundation/engine-contract.md#persisted-data) and its [Engine
subsystems](../../design/foundation/engine-contract.md#engine-subsystem-kinds) table names the Timeline and links Timeline as the specification that states it, so Timeline refines Engine
Contract; Agents owns current health and its table of changes to attributes links [Combat](../../design/mechanics/domain-model.md#combat) as the specification that
states how current health is lowered, so Combat refines Agents.

A specification that applies a term without being handed its detail uses the term's owner and does not refine it,
however much detail it adds. A specification may refine several specifications when each hands it detail. A Handoff
may name a specification whose detail is still a `TODO:`; it then records an intended refinement, not completed
detail, and the relationship is reassessed when the detail is written.

## Pointers that create no relationship

A Pointer whose term another specification owns creates no relationship. It only says where a term is
stated, e.g. "The [Autopilot limit](../../design/foundation/autopilot.md#glossary) is stated in What an [Autopilot engagement](../../design/foundation/engine-contract.md#autopilot) holds in [Autopilot](../../design/foundation/engine-contract.md#autopilot)" in a specification that
leaves Autopilot limit to Autopilot, so it may point in either direction, including from a Dependency to one of its own Dependents.

A sentence that both names a term and applies it is not a Pointer: it applies the term, and the specification uses the
term's owner.

## One kind per pair

A pair of specifications has at most one of `uses` and `refines`. When a specification both refines another and
applies its terms, it records only `refines`, because a refining specification applies its parent's terms by its nature.

# Links that create no relationship

A link or mention creates a `uses` or `refines` relationship only through a term or Named rule it carries in Normative
text, under [Choosing uses or refines](#choosing-uses-or-refines). Every other link creates no relationship, needs no
mirror, and forms no Cycle. The following links are of this kind:

- **Pointers:** say which specification states a term another specification owns.
- **Navigation links:** help a reader find related material.
- **Migration records:** say where content moved.
- **Citations and evidence acknowledgements:** credit material inspected while drafting.
- **Examples:** name other artifacts to explain a rule; they do not declare relationships for the named artifacts.
- **Process information:** review order, work-plan rows, and folder location.

Calling a link a Pointer, navigation link, or citation does not exempt the text around it: when that text applies a
term or Named rule of the linked specification, the specification uses it. Specification Conventions may restrict such
links further for particular documents.

# Relationship graphs

Validate each Relationship kind graph separately. The `follows` graph, the `refines` graph, and the `uses` graph must
each be a DAG, and so must the combined graph of explicit `uses` and `refines` relationships. Writing rules must not
govern each other through a cycle, refinements must not form a cycle of increasingly detailed definitions, and no
specification may rely, directly or through others, on a term or rule of a specification that relies on it.

A cycle in the combined `uses` and `refines` graph shows a term or a rule in the wrong specification. It is resolved by
moving the term to the specification that the others in the cycle build on, or by moving the rule that applies it to a
specification that builds on the term's owner; it is never resolved by dropping a relationship the text creates.

## Real and apparent dependencies

Before moving anything, decide whether the sentence that applies the term creates a real dependency. Remove the
sentence in thought and ask what the specifications then no longer state:

1. **A rule is lost or becomes vaguer:** the dependency is real. Keep the sentence and resolve the cycle by moving the
   term or the rule. Rewording the sentence so that it avoids the term while it still needs what the term means is
   not a resolution; it hides the dependency.
2. **Nothing is lost, because another specification states the same rule:** the sentence is a duplicate. Remove it
   from the specification the rule does not belong to and keep the statement in the one whose subject the rule is
   about, e.g. a rule about what a preset supplies belongs to the specification that owns presets, not to one that
   only mentions a value no preset supplies.
3. **Nothing is lost, because the sentence only illustrates a general rule:** the sentence is an example that lacks
   its "e.g.". Mark it, under [Marking examples](spec-conventions.md#marking-examples); an example is not Normative
   text, so it creates no relationship.

Only the second and third outcomes remove a relationship, and only because the text never created one.

The combined DAG places each specification in a layer: a specification's layer is one after the latest layer among the
specifications it uses or refines, and a specification depending on none is in the first layer.

The `implements` and `verifies` graphs are acyclic under their permitted-artifact rules. A graph combining `follows`
with other Relationship kinds need not be acyclic, and such a cycle is not by itself a defect. Every such mixed cycle
must be documented in the informative [Specification relationship cycles](../../../spec-relationship-cycles.md)
register, with its internal edges, their independently supplied meanings, their supporting contract passages, and a
future removal approach with an exit criterion. The register reports relationships; it does not create them or
authorize future contract changes. Links that create no relationship are not part of any graph.

# Recording relationships

Every relationship must use the canonical terms Artifact, Relationship, Dependency, Dependent, and Relationship kind
as defined by the Glossary. Every explicit relationship identifies one Dependency, one Dependent, and exactly one of the
five Relationship kinds, and satisfies that kind's permitted-artifact rules. Exact duplicates are invalid. A document
pair may have several Relationship kinds when each expresses distinct reliance, except that it has at most one of
`uses` and `refines`, under [One kind per pair](#one-kind-per-pair).

Each explicit relationship is recorded twice: once in the Dependent's Relationships section and once, as its mirror
with the reverse-facing phrase, in the Dependency's. Both entries must resolve to the same Dependency, Dependent, and
Relationship kind. Implicit relationships are defined centrally under [Implicit relationships](#implicit-relationships)
and are not listed. The layout of a specification's Relationships section, including its phrases, order, and links, is
given under [Relationship inventories](#relationship-inventories).

Because `uses` and `refines` follow from the text, the recorded entries of those kinds must be exactly the
relationships the text creates: an entry the text does not create, and a relationship the text creates that has no
entry, are both documentation defects.

Relationship entries have no Scope field. Substantive constraints and requirement references belong in the
contract prose; a link to an artifact does not imply reliance on every rule in that artifact.

Adding, changing, or removing an explicit relationship must update both entries. A missing or disagreeing entry is a
documentation defect. Changes must preserve rule ownership and requirement traceability. Update the cycle register
whenever a change introduces, alters, or removes a mixed cycle.

# Implicit relationships

Some relationships hold for every specification, or for every specification of one [Specification kind](spec-conventions.md#specifications), so recording
them in every Relationships list would add entries that carry no information. The following relationships exist
without explicit table rows:

1. Every registered specification implicitly depends through `follows`, for document structure, lifecycle, and
   writing rules, on Specification Conventions and on every other specification its Conventions metadata row links,
   under [Following the conventions](spec-conventions.md#following-the-conventions).
2. Each of those convention specifications consequently has those specifications as implicit Dependents.
3. An acceptance example that explicitly identifies requirements it checks implicitly depends on those requirements through `verifies`.
4. The checked requirements consequently have that acceptance example as an implicit Dependent.
5. No other relationship is implicit unless Artifact Relationships adds and defines it.

Implicit relationships are exempt from mirrored table rows.

# Relationship inventories

Every specification records its explicit relationships in the same place and the same shape, so that a mirror is easy
to check. When present, the Relationships and Glossary H1 sections follow Overview in that order, and Glossary immediately
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

- Uses [Core Concepts](../../design/foundation/core-concepts.md)

Core Concepts contains the mirror:

- Used by [Engine Contract](../../design/foundation/engine-contract.md)

Both entries describe the same relationship. The first five phrases describe the current document as Dependent;
the last five describe it as Dependency. Reverse-facing phrases are grammatical presentations of the canonical
Relationship kinds, not additional Relationship kinds or glossary synonyms.

List explicit relationships only. When there are none, omit the Relationships section. Do not repeat implicit
relationships. Every explicit relationship
must have its mirror with the same Dependency, Dependent, and Relationship kind. Duplicate entries of the same
Relationship kind and direction are invalid. Inventory lists are exhaustive, not example lists.

Relationship entries have no Scope field. Keep substantive constraints and requirement references in the owning
contract prose; a document link does not imply reliance on every rule in that document.
[Links that create no relationship](#links-that-create-no-relationship) defines which
links, e.g. citations and Pointers, are not relationships.

Relationships is the only inventory of explicit relationships. Overview must not repeat it as
directional-phrase bullets; where a reliance matters, the owning contract prose states it.

Classify relationships using [Choosing uses or refines](#choosing-uses-or-refines).
Each refinement is visible in the prose on both sides: the Handoff in the refined specification, and the section of the
refining specification that states the handed-off detail, which links the refined section in a clause about the
subject; e.g., "Every Order total is a Price, under Prices; for an Order it is computed as follows." Overview may also
name the parent, under [Specification Overview](overview-conventions.md#specification-overview). No section or
paragraph has the refinement itself as its subject; e.g., not "This document refines Store Model by specifying
placement, payment, and shipping constraints."

# Evidence

A `uses` relationship is evidenced by the term or Named rule the Dependent's Normative text applies. A `refines`
relationship is evidenced by the Handoff in the Dependency and the detail the Dependent states; an intended refinement
is evidenced by the Handoff alone and must explicitly identify the detail still to be specified. An `implements` or
`verifies` relationship must not be presented as evidence that implementation is complete or tests pass.

# Adoption

New and existing registered specifications must record explicit relationships as defined here and apply the
implicit relationships. Resolve relationship TODOs that affect the contract, verify mirrored entries,
check links, and validate the graphs. Do not invent implementation or test relationships for planned artifacts.

# Edge cases and failure behavior

| Case                                                                          | Required result                                                                                                         |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| A depends on B                                                                | Record `B → A`; B is the Dependency and A is the Dependent                                                              |
| `follows` and another Relationship kind connect the same artifacts            | Keep both when they express distinct reliance                                                                           |
| A both refines B and applies B's terms                                        | Record only `refines`                                                                                                   |
| Only implicit relationships apply                                             | Omit the Relationships section                                                                                          |
| Explicit relationships exist                                                  | List all explicit relationships; omit implicit ones                                                                     |
| No explicit relationships exist                                               | Omit the Relationships section                                                                                          |
| One mirrored entry is missing or disagrees                                    | Treat the inventory as defective and update both entries                                                                |
| No implementation or test has been identified                                 | Do not invent an `implements` or `verifies` relationship                                                                |
| A requirement moves                                                           | Update both entries, links, and requirement references in contract prose                                                |
| A referenced specification still has `TODO:` items                            | Record concrete unresolved contract work without inferring missing rules                                                |
| A specification points to the owner of a term another specification owns      | Record nothing; it is a Pointer under [Pointers that create no relationship](#pointers-that-create-no-relationship)     |
| A specification applies a term owned by a specification that uses it          | Treat the Cycle as a misplaced term or rule and move it, under [Relationship graphs](#relationship-graphs)              |
| The sentence that closes a Cycle restates a rule another specification states | Remove the restatement, under [Real and apparent dependencies](#real-and-apparent-dependencies)                         |
| The sentence that closes a Cycle only illustrates a general rule              | Mark it as an example, under [Real and apparent dependencies](#real-and-apparent-dependencies)                          |
| The sentence that closes a Cycle needs the term to state its rule             | Keep it and move the term or rule; never reword it to avoid the term                                                    |
| A work-plan row orders reviews                                                | Record nothing; it is process information under [Links that create no relationship](#links-that-create-no-relationship) |

# Acceptance examples

## Classification cases

These cases exercise [Choosing uses or refines](#choosing-uses-or-refines), [Recording relationships](#recording-relationships),
[Direction](#direction), and [Evidence](#evidence); they add no relationships to the named documents. The table is exhaustive.

| Case                                                                                                                                                                                                       | Expected classification and reason                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Domain Model describes agents using Campaign instance and [GDR](../../design/foundation/core-concepts.md#game-build-and-content)                                                                           | Uses Campaign Instances; it applies the term Campaign instance, which Campaign Instances owns                                                    |
| Domain Model owns [Agent](../../design/mechanics/domain-model.md#agency-and-agents) and points to Agents as the specification that states what an Agent has; Agents states it                              | Refines Domain Model; Domain Model hands off the detail of a term it owns                                                                        |
| [Combat rounds](../../design/mechanics/combat.md#combat-rounds-and-results) a value with a rounding operation that Numbers defines                                                                         | Uses Numbers; it applies a Named rule of Numbers                                                                                                 |
| Timeline preserves references under [References](../../design/foundation/campaign-instances.md#references) while restoring [Campaign state](../../design/foundation/core-concepts.md#campaign-and-session) | Uses Campaign Instances; it applies a Named rule of Campaign Instances                                                                           |
| Engine Contract owns Timeline and its Engine subsystems table points to Timeline as its owner                                                                                                              | Timeline refines Engine Contract; the table row is a Handoff                                                                                     |
| A specification names [Information boundary](../../design/foundation/player-api.md#information-boundary) and TODOs for exact exposed fields                                                                | Uses [Player API](../../design/foundation/engine-contract.md#api-surfaces); the TODO leaves the fields unspecified but the Named rule is applied |
| A specification uses a term of another only in an example introduced with "e.g."                                                                                                                           | No relationship; the example is not Normative text                                                                                               |
| A specification names a term another specification owns and links that owner, stating no rule                                                                                                              | No relationship; the sentence is a Pointer                                                                                                       |
| A specification adds much detail about a term it applies, but the term's owner has no Handoff to it                                                                                                        | Uses, not Refines; detail without a Handoff is not refinement                                                                                    |
| A refinement is also recorded as a Uses entry for the same pair                                                                                                                                            | Keep only Refines; a pair has at most one of `uses` and `refines`                                                                                |

## Complete coverage of Relationship kinds

| Relationship kind | Dependency                                                                                        | Dependent                        | Expected interpretation                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `follows`         | Specification Conventions                                                                         | Agents                           | Agents follows Specification Conventions                                                                            |
| `refines`         | Domain Model                                                                                      | Agents                           | Agents refines Domain Model                                                                                         |
| `uses`            | Core Concepts                                                                                     | Engine Contract                  | Engine Contract uses Core Concepts                                                                                  |
| `implements`      | Engine Contract                                                                                   | Identified engine implementation | The implementation implements Engine Contract                                                                       |
| `verifies`        | [Committed state integrity](../../design/foundation/engine-contract.md#committed-state-integrity) | Identified restoration test      | The test verifies [Committed state integrity](../../design/foundation/engine-contract.md#committed-state-integrity) |

## Mirrored entries

Given Agents refines Domain Model for the Agent concept, Agents contains:

- Refines [Domain Model](../../design/mechanics/domain-model.md)

Domain Model contains the mirror:

- Refined by [Agents](../../design/mechanics/agents-spec.md)

Both entries describe Domain Model → Agents. The Agent lifecycle rules belong in the contract prose.
Removing or changing either entry requires the corresponding change in the other.

## No explicit relationships

A registered specification with no explicit relationships omits the Relationships section. Its implicit
relationships still apply. It must not list implicit entries.

## Graph checks

- Specification Conventions → A and A → Specification Conventions, both `follows`: reject the cycle.
- Domain Model → Agents and Agents → Domain Model, both `refines`: reject the cycle.
- A applies a term B owns while B applies a term A owns, so each uses the other: reject the cycle, and move one of the
  terms, or the rule applying it, so that both terms are owned at or below the specification that applies them.
- Specification Conventions → Artifact Relationships through implicit `follows`, combined with Artifact Relationships →
  Specification Conventions through `uses`, is a permitted cycle combining Relationship kinds.
