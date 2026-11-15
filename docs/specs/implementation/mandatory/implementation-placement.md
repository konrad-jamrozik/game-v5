# Implementation Placement

| Metadata    | Value                                                                                                                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Spec ID     | PLACE                                                                                                                                                                                      |
| Family      | Mandatory                                                                                                                                                                                  |
| Audience    | Implementer                                                                                                                                                                                |
| Owns        | Where each implementation and everything it needs reside, relative to this repository.                                                                                                     |
| Conventions | [Specification conventions](../../governance/conventions/spec-conventions.md), [Implementation Specification Conventions](../../governance/conventions/implementation-spec-conventions.md) |

# Overview

Each Implementation of the game must stand on its own, so that it can later become a repository of its own and none
depends on another. An [Implementation](../../governance/conventions/artifact-relationships.md#glossary) is the code, tests, and
tooling that produce a playable Game build from the specifications.

Each Implementation must reside in its own Implementation directory, a sibling of the Specification repository
directory, and must treat that directory as the root of its repository, as if nothing else existed. Several
Implementations may therefore exist side by side, each independent of the others and of the Specification repository.

# Relationships

- Uses [Bootstrap GDRs](../../design/content/bootstrap-gdrs.md)
- Used by [GitHub Pages Deployment](../recipes/github-pages-deployment.md)
- Used by [Implementation Feedback](implementation-feedback.md)
- Used by [Specification Tracking](specification-tracking.md)
- Used by [Specification Updates](../recipes/specification-updates.md)

# Glossary

| Term                               | Definition                                                                                                                                              |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Specification repository directory | The root directory of the local clone of the repository that holds these specifications.                                                                |
| Implementation directory           | A directory `<implementation-name>/` that has the same parent directory as the Specification repository directory and holds exactly one Implementation. |
| Implementation name                | The `<implementation-name>` name of an Implementation directory, which identifies the Implementation.                                                   |

# Implementation directory

Every Implementation must reside entirely in its Implementation directory, never inside the Specification repository
directory. E.g., when the Specification repository directory is `repos/game-v5/`, an Implementation resides in
`repos/game-v5-impl-web/`.

Every file that the Implementation consists of, or that is needed to install, develop, build, test, or run it, must be
inside that directory; e.g., its package manifest, lockfile, TypeScript and build configuration, lint and format
configuration, scripts, tests, and Git ignore rules.

The Implementation name must consist of lowercase letters, digits, and single hyphens, must start with a letter, and
must differ from the name of every other directory in the parent directory of the Specification repository directory.
The Implementation name should start with the name of the Specification repository directory followed by `-impl-`,
e.g. `game-v5-impl-web`. Which name an Implementation uses within these constraints is the Implementer's choice.

## Creating the Implementation directory

The Implementer creates the Implementation directory as a new local directory. When creating it, the Implementer may
immediately initialize it as a local Git repository and commit to it, so that the Implementation has a Git history from
the start; e.g., the Implementer may commit each completed step to review or revert it later.

The Implementer must not add a Git remote to the Implementation directory, push from it, or publish it in any other
way; whether the Implementation gets a remote repository, e.g. on GitHub, and where that repository is hosted, is
decided by the Engine designer after the Implementation is reviewed. Whether or not the Implementer initializes it as a local Git
repository, the Implementation must be ready to become a standalone repository, e.g. by holding its own Git ignore
rules.

# Repository root of an Implementation

An Implementation must treat its Implementation directory as its repository root and must behave as if nothing outside
it existed:

- It must not add, change, or delete any file outside its Implementation directory; e.g., it must not add files to the
  Specification repository directory.
- It must not read, import, extend, or execute any file outside its Implementation directory; e.g., it must not import
  from another Implementation, extend the `tsconfig.json` of the Specification repository directory, call its npm
  scripts, or resolve packages from its `node_modules`.
- Nothing outside its Implementation directory may be required to install, build, test, or run it; e.g., Git hooks, CI
  workflows, and deployment configuration of the Specification repository must not be added or changed for it.

## Game data in an Implementation

The [Bootstrap GDRs](../../design/content/bootstrap-gdrs.md) are authored under the `content/` directory of the Specification
repository directory. An Implementation that builds them into its Game build must hold its own copy of the GDR files it
uses inside its Implementation directory, and its Game build must read that copy rather than the `content/` directory
of the Specification repository directory.

# Edge cases and failure behavior

An Implementation that needs a change outside its Implementation directory, e.g. a new CI job in the Specification
repository, cannot obtain it under these constraints; it provides the equivalent inside its Implementation directory
instead, e.g. a script in its own package manifest that runs its checks.
