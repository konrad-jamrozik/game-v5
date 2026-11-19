# Terminology Conventions

| Metadata    | Value                                                                    |
| ----------- | ------------------------------------------------------------------------ |
| Spec ID     | TERM                                                                     |
| Family      | Conventions                                                              |
| Audience    | Engine designer, Content designer, UI designer, AI designer, Implementer |
| Owns        | Canonical terms, Non-terms, and how Prohibited synonyms are recorded.    |
| Conventions | [Specification Conventions](spec-conventions.md)                         |

# Overview

One concept gets one word. A reader meeting two different words assumes two different things, so a synonym that a human reader would forgive sends an LLM implementer after a concept that does not exist. Every formal term is therefore defined once, in the Glossary of the specification that owns it, and used in full everywhere else.

Two exceptions keep this workable. A Non-term is a word deliberately left undefined, because it means different things in different places. A Prohibited synonym is a word that is known to compete with a canonical term; it is recorded beside the term it competes with, so that writers and reviewers can find and replace it. Terminology Conventions builds on Specification Conventions: Specification Conventions says how any specification is written, and Terminology Conventions says which words it may use for its concepts.

# Glossary

Terms about [specifications](spec-conventions.md#specifications) in general are in the Specification Conventions glossary.

| Term | Definition |
| --- | --- |
| Canonical term | The sole term assigned to one concept within the specification set. |
| Non-term | A word that specifications use without defining it, either because its meaning deliberately depends on context or because it appears in the definition of a formal term. |
| Prohibited synonym | A word or phrase that competes with a canonical term for the same concept, and that specifications must not use for that concept. |

# Canonical terminology

A reader, and above all an LLM reader, takes two different words to name two different things. Specifications must strictly follow the owning glossaries. Before using a formal term, consult the existing glossaries and use the canonical term for that concept. Introduce a new formal term only when no existing term expresses the required concept; add its definition to the appropriate owning Glossary before using it. Ordinary prose words do not require glossary entries.

One concept must have exactly one canonical term. Do not introduce synonyms, aliases, inverse labels, slash-separated alternatives, or interchangeable terms for the same concept.

This also prohibits near-synonyms: ad hoc descriptive phrases that resemble a defined term, or name a concept that a defined term or an owning section already covers, without being that term. E.g., do not write "item catalogue" where the owning Glossary defines Product list. Use the defined term, or the title of the owning section linked to that section. Coin a new phrase only when no defined term or owning section expresses the concept; if the phrase then names a concept the specification relies on, define it under the rules above.

The owning specification of a term may approve an abbreviation for it, e.g. **Widget Assembly Record (WAR)**. Introduce it as the full term followed by the abbreviation in parentheses at the first relevant mention in a document, and use the abbreviation afterward, including headings, tables, and diagram labels. The owning Glossary keeps the full term with the abbreviation as its term label. An approved abbreviation is an exception to the full-term rule below, not a separate concept.

Use the full glossary term on every mention. Do not abbreviate it, drop words, split its words across a compound, or substitute a generic noun after introducing the full term. E.g., use Product list rather than "list", and Order line rather than "line", when referring to those concepts. Grammatical plurals and possessives must retain every word of the term: Product lists and Order line's are valid; lists and line's are not substitutes.

This rule applies throughout specifications and all other project documentation, including headings, tables, diagram labels, examples, and generated views. Update the owning sources and regenerate derived documentation. Document titles, file paths, literal code identifiers, and exact quotations retain their actual spelling. Ordinary words remain valid when they describe something else; e.g., a list of steps is not a Product list. Review each use in context; do not infer compliance from text search alone.

If two similar terms are kept, they must represent distinct concepts and have separate, non-overlapping definitions in the appropriate Glossary. A term owned by another specification must not be redefined. It needs no link: the generated glossary lists every term with its owner. When an author or reviewer encounters a likely synonym, resolve whether it denotes the same concept. If it does, replace it with the canonical term and record it as a Prohibited synonym of that term, under [Prohibited synonyms](#prohibited-synonyms). If the concepts differ, make their distinct definitions explicit. Do not leave terminology unresolved.

# Non-terms

Some words are better left undefined. A Non-term is a word that specifications use without defining it, for one of two reasons:

- **Context-dependent:** the word deliberately means different things in different contexts. Specifications benefit from that flexibility, and formalizing one meaning would conflict with the others.
- **Defines a term:** the word appears in the definition of a formal term, so it stays plain English to avoid a circular definition.

A Non-term needs no glossary entry, is never capitalized as a formal term, and must not be treated as a defined term. The following list of Non-terms is exhaustive:

| Word | Reason | Meaning in context |
| --- | --- | --- |
| rule; rules | Context-dependent | The usual meaning: a statement of how the game behaves or of what must hold. A validation rule in these conventions is also a rule. A rule about the game takes one of the following five shapes, and this list is exhaustive: a calculation, i.e. a formula that produces a value; an eligibility condition, deciding whether an action is permitted; an effect, changing the game's data; a creation, stating when new data comes into existence and with which initial values; or an invariant, something that must always hold. The shapes describe usage only: a specification never labels a rule with its shape, and no obligation attaches to a shape. |
| rule set; ruleset | Context-dependent | Another way of saying "rules": the rules that apply in some context, taken together. It has no separate meaning. |
| modeling role | Context-dependent | Which modeling concept an element is or exemplifies; e.g., the "Modeling role" column of a worked-example table. Also used when specifying a game concept, below. |
| playthrough | Defines a term | One play of the game; a [Design specification](spec-conventions.md#specifications) may use it to define a term. |

# Prohibited synonyms

A synonym that has been found once is likely to be written again, so it is recorded where writers look for the term it competes with: in the Prohibited synonyms column of the owning Glossary row, under [Prohibited synonyms column](glossary-conventions.md#prohibited-synonyms-column). The generated glossary collects every Prohibited synonym of every Glossary in one table, so a reviewer can search all of them at once.

A Prohibited synonym is prohibited only for the concept of its canonical term. Ordinary uses of the same word for something else remain valid, and the Prohibited synonyms cell says so where a reader could doubt it; e.g., a Prohibited synonym "entry" of a term for stored data does not forbid "glossary entry". Describe unspecified content with the words of [Kinds of unspecified content](spec-conventions.md#kinds-of-unspecified-content), not as deferred or as a deferral.
