# Overview Conventions

| Metadata | Value |
| --- | --- |
| Spec ID | OVW |
| Family | Conventions |
| Audience | Engine designer, Content designer, UI designer, AI designer, Implementer |
| Owns | How the Overview of a specification and the overviews of Specification kinds and Families orient a reader. |
| Conventions | [Specification Conventions](spec-conventions.md) |

# Overview

A reader meets a subject first through its overview, and decides there whether to read on. An overview therefore orients rather than inventories: it gives the idea that explains the subject before any of its parts, so that the details read as consequences instead of a list to memorize.

The same aim shapes overviews at every level. A specification's Overview introduces one subject; a [Family](spec-conventions.md#specifications) overview explains how the specifications of a Family divide their subjects between them; a [Specification kind](spec-conventions.md#specifications) overview explains how its Families divide. Overview Conventions builds on Specification Conventions, which places Overview first among the framing sections; Overview Conventions says what an overview says.

# Specification Overview

Overview introduces the subject to a reader who has not met it. It moves from the idea to the parts:

1. **The idea:** the opening sentences say in plain words what the subject is for, or which principle governs it, as one would explain it to a newcomer; e.g., "Buying from the store is an exchange of promises: the customer promises to pay, and the store promises to deliver what was paid for." Formal terms come after the idea that motivates them.
2. **The organizing principle:** Overview then says what divides or shapes the subject, and introduces its main concepts as consequences of that principle, each with what sets it apart; e.g., "Everything about an Order follows from one rule: the store never ships what has not been paid for, and never keeps money for what it cannot ship." It introduces at most four concepts; the rest belongs to the topic sections.
3. **Its place:** when the subject builds on or stands beside the subject of another [specification](spec-conventions.md#specifications), one or two sentences say what this subject focuses on relative to that one and why it is separate; e.g., "Orders builds on Store Model: Store Model says what the store sells, and Orders says how one sale proceeds, which changes far more often."

Overview is one to three paragraphs, as a guide about 150 words, and never more than 200. It must not:

- open with a list, or with a sentence whose subject is the document, its constraints, or its rules; e.g., not "Orders follow constraints on placement, payment, shipping, and cancellation";
- contain a sentence that enumerates more than three items;
- list the document's sections, say what the document defines, states, or owns, or say what it does not cover. The Owns metadata row is the only statement of ownership.

A reader who stops after the first paragraph can explain to someone else what the subject is and why it is shaped as it is. A reader who stops after Overview knows the few concepts that every later section builds on, though not yet their rules.

E.g., the following Overview of an Orders specification is an inventory: it lists facts, and the reader must reconstruct the idea that explains them.

> Orders follow constraints on placement, payment, shipping, cancellation, and total calculation. An Order is placed, paid, shipped, and delivered or cancelled, and its total is the sum of its lines plus shipping. These constraints build on Store Model.

The following Overview of the same subject orients the reader instead:

> Buying from the store is an exchange of promises: the customer promises to pay, and the store promises to deliver what was paid for. An Order records one such exchange, from the moment the customer places it until the goods arrive or the Order is cancelled.
>
> Everything about an Order follows from one rule: the store never ships what has not been paid for, and never keeps money for what it cannot ship. So payment comes before shipping, and an Order can be cancelled, with a full refund, only until it ships. Orders builds on Store Model: Store Model says what the store sells, and Orders says how one sale proceeds, which changes far more often.

# Family overviews

Each [Family](spec-conventions.md#specifications) that has at least one [registered](spec-conventions.md#specifications) specification has an informative Family overview at `docs/specs/<kind directory>/<family directory>/about-<family directory>.md`, e.g. `design/foundation/about-foundation.md`. A Family overview is not a specification: it has no metadata or Spec ID, and it owns no game behavior, contract, term, or game data. It explains what question each specification in the Family answers, how they relate, and why the boundaries between them sit where they do, linking each specification instead of restating its content.

A Family overview begins with the H1 `About the <Family> family` and contains the H1 sections What this family is for, Documents, How they relate, and Why these boundaries, in that order; further sections, e.g. Reading order, may follow. It links every registered specification of its Family, and when the Family keeps specifications in a subdirectory, its Documents section says what that subdirectory groups. The How they relate section contains one pair of `<!-- generated:family-diagram:start -->` and `<!-- generated:family-diagram:end -->` markers. `npm run docs:generate` replaces the content between them with diagrams of the [References](artifact-relationships.md#references) of the Family's specifications, both within the Family and with other Families, so the diagrams are never edited by hand. The prose outside the markers is maintained by hand: update it when adding, renaming, re-scoping, or moving a specification in that Family.

Each [Specification kind](spec-conventions.md#specifications) that has at least one registered specification also has an informative overview at `docs/specs/<kind directory>/about-<kind directory>.md`, e.g. `design/about-design.md`. It begins with the H1 `About <Specification kind> specifications`, explains what the Specification kind governs and why its Families are divided as they are, and links the overview of each of its Families. Like a Family overview, it is not a specification.
