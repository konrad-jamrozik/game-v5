# Specification Tracking

| Metadata    | Value                                                                                                                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Spec ID     | TRACK                                                                                                                                                                                      |
| Family      | Mandatory                                                                                                                                                                                  |
| Audience    | Engine designer, Implementer                                                                                                                                                               |
| Owns        | The Specification baseline and Specification map records that tie each Implementation to the specifications it conforms to.                                                                |
| Conventions | [Specification conventions](../../governance/conventions/spec-conventions.md), [Implementation Specification Conventions](../../governance/conventions/implementation-spec-conventions.md) |

# Overview

The specifications keep changing after an Implementation is built, and rebuilding it for every change is expensive. An
Implementation therefore follows the specifications by change: whoever updates it must be able to tell which
specifications changed since it was last brought up to date, and which of its files those changes affect, without
reading the rest.

Two records make that possible. The Specification baseline names the Specification revision the Implementation
conforms to, so the changes since then are the difference between that revision and a later one. The Specification map
names, for each specification, the files that implement it, so each change leads to the files it can affect.
[Specification Updates](../recipes/specification-updates.md) suggests how to use both records to update an Implementation.

# Relationships

- Uses [Implementation Feedback](implementation-feedback.md)
- Uses [Implementation Placement](implementation-placement.md)
- Used by [Specification Updates](../recipes/specification-updates.md)

# Glossary

| Term                   | Definition                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Specification revision | One commit of the repository that holds these specifications, identified by its full commit hash.                  |
| Specification baseline | The Specification revision whose specifications an Implementation currently conforms to.                           |
| Specification map      | The record of which files of an Implementation implement each specification, keyed by the specification's Spec ID. |

# Tracking files

Both records say where the Implementation stands against the specifications rather than what it learned from them, so
they are kept together in their own directory, apart from the feedback files of
[Feedback files](implementation-feedback.md#feedback-files) of Implementation Feedback. Every Implementation must keep these two Markdown
files in its [Implementation directory](implementation-placement.md#glossary):

| Path                                 | Contents                               |
| ------------------------------------ | -------------------------------------- |
| `tracking/specification-baseline.md` | The Specification baseline             |
| `tracking/specification-map.md`      | The Specification map at that baseline |

These tracking files are required whatever the platform, language, or engine of the Implementation and whatever the
instructions it is built under.

# Specification baseline

The Specification baseline states how far the Implementation has followed the specifications, so it must never claim
more than the Implementation does. `tracking/specification-baseline.md` must hold the H1 `Specification baseline`
followed by one line `Revision: <commit hash>`, where `<commit hash>` is the full hash of one commit of the
repository that holds these specifications, e.g. `Revision: b63b86e0c4f1d2a9e8b7c6d5f4a3b2c1d0e9f8a7`.

The Implementation must conform to every specification at its Specification baseline, except where an entry of its
[Implementation Feedback](implementation-feedback.md) states otherwise, e.g. a Specification problem that the
specifications at that revision leave unsettled. A Specification baseline therefore names a commit, never
specifications with changes that are not committed.

The Specification baseline must be set when the Implementation is first built, to the Specification revision the
implementer began building from: the latest commit of the repository that holds these specifications when the
implementer first read them. A commit made to the specifications while the Implementation is being built, e.g. while
subagents are still reading them, is not covered by the Specification baseline, even when part of the Implementation
already follows it. When the specifications the implementer begins from have changes that are not committed, the
implementer must tell the Engine designer before building, because no Specification revision holds those changes. The
Specification baseline must change only in the same change to the Implementation that
brings the Implementation into conformance with the specifications at the new Specification revision.

# Specification map

The Specification map turns a changed specification into the list of files that a change to it can affect, so it must
cover every specification and stay accurate. `tracking/specification-map.md` must hold the H1 `Specification map`
followed by one H2 section for each specification registered at the Specification baseline, and for no other
specification. Each heading is the Spec ID followed by the specification's title, e.g. `## COMBAT: Combat`, and the
sections are in alphabetical order of Spec ID.

Each section must list, as one path per bullet relative to the Implementation directory, every file of the
Implementation that implements the specification, including its tests, e.g. `- engine/combat/` and
`- tests/combat/`. A directory path stands for every file in it. One file may be listed under several
specifications. A specification that no file implements, e.g. a Governance specification, has a section holding the
single line `No files.` instead of a list.

The Specification map is keyed by Spec ID rather than by the path of the specification, so that moving or renaming a
specification file leaves it valid. It must be kept current while the Implementation changes: a change to the
Implementation that adds, moves, or deletes a file that implements a specification must update the Specification map
in the same change.

# Edge cases and failure behavior

An Implementation built before it had a Specification baseline adopts one by setting it, under
[Specification baseline](#specification-baseline), to the latest Specification revision whose specifications it
conforms to, and by writing the Specification map at that revision in the same change.

A Spec ID that the specifications retire, e.g. because a specification is deleted or merged into another, leaves the
Specification map in the change that moves the Specification baseline past that retirement; the files listed under it
move to the sections of the specifications that now cover them. A specification that is split keeps its Spec ID in the
part that retains it, and each new part receives its own section.

A path listed in the Specification map must exist in the Implementation directory; a file that is deleted is removed
from every section that lists it in the same change.
