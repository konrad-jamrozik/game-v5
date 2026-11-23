# Glossary Conventions

| Metadata    | Value                                                                           |
| ----------- | ------------------------------------------------------------------------------- |
| Spec ID     | GLOSS                                                                           |
| Family      | Conventions                                                                     |
| Audience    | Engine designer, Content designer, UI designer, AI designer, Implementer        |
| Owns        | How a specification's Glossary is arranged and how its definitions are written. |
| Conventions | [Specification Conventions](spec-conventions.md)                                |

# Overview

A Glossary is a lookup table, not an essay: a reader arrives with one word and leaves with its meaning. Everything about it serves that one look-up. Terms are grouped by subject so the right row is quick to find, each definition says in plain words what the term means rather than how it is modeled, and the words that must not stand in for the term sit in the same row.

[Specification Conventions](spec-conventions.md) places the Glossary among the framing sections of a specification; Glossary Conventions says what goes inside it.

# Glossary groups

A Glossary is where a reader looks a term up, so it is arranged for finding. When a Glossary's terms form more than one subject, group them. Each group is an H2 subsection of Glossary named after the subject its terms cover, never after its role in the document. Each group contains a one-sentence description followed by exactly one Term and Definition table, and holds at least two terms. A Glossary whose terms form only one group is not grouped: it keeps a single Term and Definition table directly under its H1 and has no H2 subsections. A Glossary defines only the terms its [specification](spec-conventions.md#specifications) owns. It opens directly with its table, or with its first group: it does not say whose terms these are or where other terms are defined, because the first mention of every term already links the Glossary that defines it. A Glossary contains no other subsections and no headings deeper than H2.

Groups only aid navigation. They do not change a term's owner or meaning, and links to a term continue to target the owning Glossary.

# Glossary definitions

A Glossary definition states what the term means, in plain English, so that a reader who knows nothing about how the concept is modeled learns what it is. Do not define a term by its modeling role or its structure alone. E.g., define Invoice as "A request for payment that a supplier sends to a customer", not as "A record type whose records each reference one customer". State how a concept is modeled where the specification classifies its concepts, e.g. in a table of concepts and their modeling roles, not in the Glossary. A term that itself names modeling vocabulary is defined by its structure, because that structure is its meaning.

# Prohibited synonyms column

A Glossary row may record the words that must not stand in for its term, so that a writer who looks the term up also sees what not to write. A Term and Definition table may have a third column, `Prohibited synonyms`, and then every table of that Glossary has it. A cell of that column lists the [Prohibited synonyms](terminology-conventions.md#prohibited-synonyms) of the row's term, under [Prohibited synonyms](terminology-conventions.md#prohibited-synonyms), separated by semicolons. When the synonym is prohibited only in some uses, a sentence after the list states the use it is prohibited in, or the ordinary uses that remain valid. A row whose term has no [Prohibited synonym](terminology-conventions.md#glossary) leaves the cell empty.

E.g., a store specification's Glossary row for the term Order may record "Purchase; sale" in its Prohibited synonyms cell, followed by "Ordinary uses of "sale", e.g. a seasonal sale, remain valid."
