# Artifact Relationships

| Metadata    | Value                                                                                                 |
| ----------- | ----------------------------------------------------------------------------------------------------- |
| Spec ID     | REL                                                                                                   |
| Family      | Conventions                                                                                           |
| Audience    | Engine designer, Implementer                                                                          |
| Owns        | Term links, the References between specifications that they make, and the Reference graph's layering. |
| Conventions | [Specification Conventions](spec-conventions.md)                                                      |

# Overview

A specification builds on the vocabulary of others, and a change to a term can affect every specification that relies on it. Here, that reliance is not declared by hand: wherever a specification first uses a term another specification owns, it links that term to its definition, and the link makes the specification reference the owner. Code reads the references off the links, so every reader and tool derives the same graph.

Only text that states rules counts, so examples, orientation, and pointers to where something is stated make no reference. Because every term has one owner, the References form a graph without cycles, and that graph places every specification in a layer above the specifications it builds on. A cycle shows a term or rule in the wrong place.

# Glossary

## References

How one [specification](spec-conventions.md#specifications)'s text comes to rely on another.

| Term | Definition | Prohibited synonyms |
| --- | --- | --- |
| Term owner | The specification whose Glossary defines a term; every term has exactly one |  |
| Rule text | Every part of a specification that states rules: everything except its title and metadata table, its Overview, its examples, and its passages labeled as informative rationale |  |
| Term link | A link from a mention of a term to the Glossary group that defines the term in its Term owner | Owner link |
| Reference | The Relationship from a specification to the Term owner of a term its Rule text mentions; the specification references the Term owner | Uses relationship; refines relationship; Relationships section |
| Relationship | A directional connection from one [artifact](spec-conventions.md#artifacts) to another; between specifications, the only one is a Reference |  |

## Graphs

The structure the References form.

| Term | Definition | Prohibited synonyms |
| --- | --- | --- |
| Graph | A collection of artifacts and the Relationships between them |  |
| Reference graph | The Graph of every [registered](spec-conventions.md#specifications) specification and every Reference between them |  |
| Cycle | A path of Relationships that returns to the artifact it starts from |  |
| Layer | A specification's position in the Reference graph: one above the highest layer among the specifications it references, or 1 when it references none |  |

# Term links

The first mention of a term in a specification's Rule text must be a Term link when another specification is the term's Term owner. Its target is the heading of the Glossary group whose table defines the term, or the Glossary heading when the Glossary has no groups, e.g. `[Widget](widget-model.md#parts-and-assemblies)`. Later mentions may be Term links too. Two kinds of mention need no Term link:

- **Governance terms outside Governance:** a specification outside the Governance specifications follows the conventions without linking the terms they own.
- **The specification index:** it navigates to every specification and states no rules of its own.

A link to a specification as a whole or to one of its sections is not a Term link, even when its text contains a term, because a Term link targets the Glossary group that defines the term and such a link names the document or the section instead. The words of its link text are not mentions: when the link text contains a term, the first mention of that term is the next one in Rule text; e.g., after `[Widget assembly](widget-model.md#widget-assembly)`, a link to a section, the next "Widget" is the first mention of Widget. Such links help a reader navigate and make no Reference.

`npm run docs:link-terms` adds every missing Term link and corrects one that targets the wrong Glossary group, and `npm run terms:report` lists the first mention of every term in every specification.

# Rule text

Rule text excludes everything that states no rule, so that what a specification merely illustrates or points to does not tie it to another specification:

- **Overview:** the section that orients a reader.
- **Examples:** a clause introduced with "e.g.", up to the end of its sentence, table cell, paragraph, or list item; a block that opens with "e.g."; the block after a paragraph that opens with "e.g." and ends with a colon; a table column headed "Example"; and a section whose heading starts with "Example" or "Worked example". These are the forms that [Marking examples](spec-conventions.md#marking-examples) requires.
- **Informative rationale:** a block that opens with the label Informative rationale.

# Mentions

A mention is the term as written, or followed by "s" or "es" for its plural. A term written with its abbreviation, e.g. "Widget Assembly Record (WAR)", is mentioned by either the full name or the abbreviation. Whether a word is a mention follows from how the Term owner writes the term:

- **Capitalized terms:** a term its owner writes with a capital mid-sentence is mentioned only with that capital, so that an ordinary word, e.g. "order", is not read as the term "Order".
- **Lowercase terms:** a term of several words that its owner writes lowercase more often than capitalized, or a one-word term that its owner writes lowercase at least five times as often, is mentioned in either case, e.g. "widget weight" and, opening a sentence, "Widget weight". A Glossary table capitalizes every term, so the table alone does not decide.
- **Sentence openings:** a capitalized one-word term opening a sentence, a list item, or a table cell is not a mention, because it can be an ordinary word, e.g. "State the result".
- **Specification titles and [Family](spec-conventions.md#specifications) names:** a title or Family name spelled differently from every term names that specification or Family, so the words in it are not mentions, e.g. "Widget Model" is not a mention of the term "Model". A term spelled exactly like its owner's title names that specification too, and makes no Reference.
- **Longer terms first:** where one term contains another, the longer one is the mention, e.g. "widget weight" rather than "widget".

# References

A specification references the Term owner of every term its Rule text mentions. The References are derived from the text by code and recorded nowhere else: a specification has no section listing what it references or what references it. The derived views and the [Family](spec-conventions.md#specifications) diagrams draw the Reference graph. A specification's Family and folder decide neither what it references nor its Layer.

A test checks rules the specification states; it makes no Reference.

# Reference graph

The Reference graph must have no Cycle. A Cycle shows a term or a rule in the wrong specification: no specification may rely, directly or through others, on a term or rule of a specification that relies on it. A Cycle is resolved by moving the term to the specification that the others in the Cycle build on, or by moving the rule that uses it to a specification that builds on the Term owner; it is never resolved by removing a mention the rule needs.

Because the graph has no Cycle, it places every specification in a Layer, and the Family diagrams and the specification layer diagram draw each specification in its Layer.

## Real and apparent dependencies

Before moving anything, decide whether the sentence whose mention closes the Cycle creates a real dependency. Remove the sentence in thought and ask what the specifications then no longer state:

1. **A rule is lost or becomes vaguer:** the dependency is real. Keep the sentence and resolve the Cycle by moving the term or the rule. Rewording the sentence so that it avoids the term while it still needs what the term means is not a resolution; it hides the dependency.
2. **Nothing is lost, because another specification states the same rule:** the sentence is a duplicate. Remove it from the specification the rule does not belong to and keep the statement in the one whose subject the rule is about, e.g. a rule about what a preset supplies belongs to the specification that owns presets, not to one that only mentions a value no preset supplies.
3. **Nothing is lost, because the sentence only illustrates a general rule:** the sentence is an example that lacks its "e.g.". [Mark it as an example](spec-conventions.md#marking-examples); an example is not Rule text, so it makes no Reference.

Only the second and third outcomes remove a Reference, and only because the text never made one.

# Deterministic validation

`npm run lint:specs` rejects an unlinked first mention, a first mention linked to the wrong Glossary group, a Cycle in the Reference graph, and a Relationships section in a specification.
