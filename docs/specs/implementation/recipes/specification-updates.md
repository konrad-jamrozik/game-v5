# Specification Updates

| Metadata    | Value                                                                                                                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Spec ID     | UPDATES                                                                                                                                                                                    |
| Family      | Recipes                                                                                                                                                                                    |
| Audience    | Engine designer, Implementer                                                                                                                                                               |
| Owns        | Non-behavioural guidance for bringing an Implementation from its Specification baseline to a later Specification revision.                                                                 |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Implementation Specification Conventions](../../governance/conventions/implementation-spec-conventions.md) |

# Overview

An Implementation that falls behind the specifications is best brought up to date by reading only what changed, not by
reading everything again. The changes since its [Specification baseline](../mandatory/specification-tracking.md#glossary) are a difference between two [Specification
revisions](../mandatory/specification-tracking.md#glossary), and that difference, rather than the full specifications, is the work to do.

The difference is suggested to drive every step. It shows which specifications changed and which of their sections,
and the [Specification map](../mandatory/specification-tracking.md#specification-map), under [Specification Tracking](../mandatory/specification-tracking.md), leads from each changed
specification to the files that implement it. The implementer then reads those files, makes the change, and moves the
Specification baseline forward, leaving every unchanged specification and every unaffected file unread.

# Finding what changed

The difference between the [Specification baseline](../mandatory/specification-tracking.md#glossary) and the target [Specification revision](../mandatory/specification-tracking.md#glossary) is the complete list of
changes to apply, so it is suggested to be computed first and read before anything else. In the
[Spec repo](../mandatory/implementation-placement.md#glossary), the implementer should run
`git diff --find-renames <baseline>..<target> -- docs/specs content assets LICENSE`, where `<baseline>` is the
Specification baseline and `<target>` is the target Specification revision, usually the latest commit. The other paths
cover the files that the Implementation copies: `content` the [GDR](../../design/foundation/core-concepts.md#game-build-and-content) files, under
[Game data in an Implementation](../mandatory/implementation-placement.md#game-data-in-an-implementation); `assets` the
[Soundtrack](../../design/ui/music.md#glossary), under
[Music in an Implementation](../mandatory/implementation-placement.md#music-in-an-implementation), and the
[Background artwork](../../design/ui/visual-design.md#glossary), under
[Artwork in an Implementation](../mandatory/implementation-placement.md#artwork-in-an-implementation); and `LICENSE` the
license text, under [License files](../mandatory/implementation-license.md#license-files).

Commit messages between the two Specification revisions explain why things changed and help to read the difference,
e.g. by naming the rule a commit rewrote. The difference itself, not a commit message, decides what must change.
Specification changes that are not committed are not part of any Specification revision and should not be applied.

# Sorting changes

Most changes to the specifications reword them without changing what an Implementation must do, so it is suggested to
sort every changed passage before opening any file of the Implementation. Each changed passage is either:

- **Editorial:** wording, links, layout, or examples change, and every rule still requires what it required before;
  e.g., a sentence is rephrased or a section moves to another specification unchanged.
- **Normative:** a rule, term definition, formula, GDR, or Repository constraint now requires something different;
  e.g., a formula gains a term or a glossary definition narrows.

An editorial change needs no change to the Implementation's behavior, though it can still need a [Specification map](../mandatory/specification-tracking.md#specification-map)
change, under [Restructured specifications](#restructured-specifications). When a large change looks editorial, e.g. a
term renamed across many specifications, `git diff --word-diff` shows only the changed words and confirms it quickly.

# Locating affected code

Each normative change is suggested to lead to code through the [Specification map](../mandatory/specification-tracking.md#glossary), under
[Specification map](../mandatory/specification-tracking.md#specification-map), rather than through a search of the whole
Implementation. The implementer should read the files listed under the changed specification's Spec ID and, within
them, the code that carries out the changed section, which the section's heading and wording identify.

A specification whose section in the Specification map lists a large part of the Implementation, e.g. a Foundation
specification whose terms most code uses, should not have all its files read. The implementer should instead find the
term or rule the change touches and search the listed files for it.

A change can also affect specifications that did not change themselves, through their Relationships. The implementer
should read a Dependent of a changed specification only when the change alters the meaning of something the Dependent
relies on, e.g. a glossary definition it uses, and then search its listed files for that term rather than reading them
all.

# Restructured specifications

Moving content between specifications changes where rules are owned without always changing the rules, and the
Specification map follows ownership. The following cases are complete:

- **Moved or renamed file:** the Spec ID is unchanged, so the Specification map needs no change.
- **Content moved between specifications:** the files that implement the moved content move to the section of the
  specification that now owns it.
- **Deleted or merged specification:** its section leaves the Specification map, and its files move to the sections of
  the specifications that now cover them, under
  [Edge cases and failure behavior](../mandatory/specification-tracking.md#edge-cases-and-failure-behavior).
- **New specification:** the implementer implements it and adds its section, which may hold `No files.`.

# Completing an update

An update is complete when the Implementation conforms to the target Specification revision and its tracking and feedback files say so, so
that the next update can start from the new Specification baseline. In one change to the Implementation, the
implementer should:

1. change the code and its tests for every normative change;
2. update the Specification map for every file added, moved, or deleted, and for every restructured specification;
3. update [Implementation Feedback](../mandatory/implementation-feedback.md): set the Resolution of each [Specification problem](../mandatory/implementation-feedback.md#glossary) that
   the target Specification revision settles, and record any new Specification problem or [Implementation decision](../mandatory/implementation-feedback.md#glossary);
4. run the Implementation's checks;
5. set the Specification baseline to the target Specification revision.

A large difference may be split by specification and the parts worked on in parallel, e.g. by one subagent per changed
specification, each given only its part of the difference and its section of the Specification map. When the whole
difference is too large for one change, the implementer may instead update to an intermediate Specification revision
first and repeat, so that each change moves the Specification baseline only as far as the Implementation conforms.

# Edge cases and failure behavior

A difference that holds only editorial changes needs only the Specification baseline moved forward, together with any
Specification map change it requires.

A normative change that contradicts an Implementation decision, e.g. a rule that now requires an option the decision
rejected, is applied, and the Implementation decision's entry is updated to say which Specification revision overrode
it.

A Specification baseline that names a commit missing from the repository's history, e.g. after that history was
rewritten, gives no difference to compute. The implementer should then review the Implementation against the
specifications one Family at a time, update the Specification map as it goes, and set the Specification baseline to
the reviewed Specification revision.
