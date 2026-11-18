# Implementation License

| Metadata | Value |
| --- | --- |
| Spec ID | LICENSE |
| Family | Mandatory |
| Audience | Engine designer, Implementer |
| Owns | The license under which each Implementation is published, and the files that state it. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Implementation Specification Conventions](../../governance/conventions/implementation-spec-conventions.md) |

# Overview

An Implementation is derived from the specifications and ships material authored in the [Spec repo](implementation-placement.md#glossary), e.g. the [Bootstrap GDRs](../../design/content/bootstrap-gdrs.md#glossary) the [Soundtrack](../../design/ui/music.md#glossary), the [Sound set](../../design/ui/sounds.md#glossary), and the [Background artwork](../../design/ui/visual-design.md#glossary). The Spec repo is published under the Game license, so every Implementation must be published under the same license, and the game as a whole, its specifications and every Implementation of them, is offered on one set of terms.

# Glossary

| Term | Definition |
| --- | --- |
| Game license | The Creative Commons Attribution-NonCommercial 4.0 International license, CC BY-NC 4.0, with the SPDX identifier `CC-BY-NC-4.0`, under which the [Spec repo](implementation-placement.md#glossary) is published as its `LICENSE` file at the repository root states. |

# License files

A reader of an [Implementation repo](implementation-placement.md#glossary), or a tool that scans it, must find the license where it conventionally looks, so every Implementation states the Game license in the same places. The following rules are complete:

- **License file:** The [Implementation repo](implementation-placement.md#glossary) must hold at its root a file named `LICENSE` whose content is identical to that of the `LICENSE` file at the root of the Spec repo.
- **README:** The Implementation repo must hold at its root a `README.md` with a section headed `License` that names the Game license, CC BY-NC 4.0, and links the `LICENSE` file.
- **Project metadata:** Where a project or package manifest of the Implementation has a field that declares the project's license, that field must hold `CC-BY-NC-4.0`; e.g., the `license` field of a `package.json`.
- **One license:** The Implementation must not declare any other license for itself, alone or beside the Game license, e.g. a dual license under MIT.

# Third-party material

An Implementation may use material it did not derive from the Spec repo, and the Game license cannot be granted for what belongs to someone else. Material of a third party, e.g. a dependency installed by a package manager, keeps its own license, and the Implementation must keep with it every notice that license requires, e.g. an attribution. Such material is not the Implementation's own work, so it does not count as declaring another license under [License files](#license-files).

# Edge cases and failure behavior

When the `LICENSE` file of the Spec repo changes, an Implementation conforms only once its own `LICENSE` file is again identical to it; updating the Implementation copies the new file. An Implementation whose `LICENSE` file differs from the Spec repo's in any way, e.g. by a year added to it, violates [License files](#license-files).
