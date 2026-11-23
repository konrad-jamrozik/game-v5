# Implementation Placement

| Metadata | Value |
| --- | --- |
| Spec ID | PLACE |
| Family | Mandatory |
| Audience | Implementer |
| Owns | Where each implementation and everything it needs reside, relative to the Spec repo. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Implementation Specification Conventions](../../governance/conventions/implementation-spec-conventions.md) |

# Overview

Each Implementation of the game must stand on its own, so that it can later be published as a repository of its own and none depends on another. An [Implementation](../../governance/conventions/artifact-relationships.md#glossary) is the code, tests, and tooling that produce a playable [Game build](../../design/foundation/core-concepts.md#game-build-and-content) from the specifications.

Each Implementation must reside in its own Implementation repo, a sibling of the Spec repo, and must treat that Implementation repo as if nothing else existed. Several Implementations may therefore exist side by side, each independent of the others and of the Spec repo.

# Glossary

| Term | Definition |
| --- | --- |
| Spec repo | The Git repository that holds these specifications, e.g. `game-v5`. Where the context means a place on disk, it means the root directory of the main local clone of that repository, e.g. `repos/game-v5/`, and never a Git worktree of it. |
| Implementation repo | A local Git repository whose root directory `<implementation-name>/` has the same parent directory as the Spec repo and which holds exactly one Implementation, e.g. `repos/game-v5-impl-a/`. Where the context means a place on disk, it means that root directory. |
| Implementation name | The `<implementation-name>` name of the root directory of an Implementation repo, which identifies the Implementation. |

# Implementation repo

Every Implementation must reside entirely in its Implementation repo, never inside the Spec repo. Every file that the Implementation consists of, or that is needed to install, develop, build, test, or run it, must be inside its Implementation repo; e.g., its dependency declarations, lint and format configuration, and Git ignore rules.

The Implementation name must consist of lowercase letters, digits, and single hyphens, must start with a letter, and must differ from the name of every other directory in the parent directory of the Spec repo. The Implementation name should start with the name of the root directory of the Spec repo followed by `-impl-`, e.g. `game-v5-impl-a`.

## Creating the Implementation repo

The Implementation repo is a Git repository whose default branch is `main`, and it must be ready to become a standalone repository, e.g. by holding its own Git ignore rules. The Implementer must not add a Git remote to it, push from it, or publish it in any other way until the Engine designer has decided whether it gets a remote repository and where that repository is hosted.

The Implementation repo must hold a `.gitattributes` file that stores every text file with LF line endings and checks it out with LF, e.g. `* text=auto eol=lf`. Without it, a checkout on Windows with `core.autocrlf` enabled shows files as modified whose content is unchanged.

The Implementation repo must hold an `AGENTS.md` file at its root that tells every agent not to start a session in the Implementation repo, and to start it in the Spec repo instead and work on the Implementation repo from there. The agent instructions, skills, and conventions that govern work on an Implementation reside in the Spec repo, and a session started in the Implementation repo does not load them. The file must name the Spec repo by its location relative to the Implementation repo, e.g. `../game-v5`, and must hold no other agent instruction, so that no instruction applies only to a session that starts there.

# Repository root of an Implementation

An Implementation must treat the root directory of its Implementation repo as its repository root and must behave as if nothing outside it existed. What it needs from outside, e.g. a CI job, it provides inside its Implementation repo:

- It must not add, change, or delete any file outside its Implementation repo; e.g., it must not add files to the Spec repo.
- It must not read, import, extend, or execute any file outside its Implementation repo; e.g., it must not import from another Implementation, extend the build or project configuration of the Spec repo, run its scripts, or use the dependencies installed for it.
- Nothing outside its Implementation repo may be required to install, build, test, or run it; e.g., Git hooks, CI workflows, and deployment configuration of the Spec repo must not be added or changed for it.

## Game data in an Implementation

The [GDRs](../../design/content/gdrs.md) are authored under the `content/` directory of the Spec repo. An Implementation that builds them into its [Game build](../../design/foundation/core-concepts.md#game-build-and-content) must hold its own copy of the [GDR](../../design/foundation/core-concepts.md#game-build-and-content) files it uses inside its Implementation repo, never a copy of the [Cut content](../../design/foundation/game-data-records.md#cut-content) under `content/cut/`, and its Game build must read that copy rather than the `content/` directory of the Spec repo.

## Music in an Implementation

The [Soundtrack](../../design/ui/music.md#glossary) is authored under the `assets/music/tracks/` directory of the Spec repo. An Implementation that plays it must hold its own copy of every [Track](../../design/ui/music.md#glossary) file inside its Implementation repo, unchanged, and its Game build must serve that copy rather than the `assets/music/tracks/` directory of the Spec repo.

## Sounds in an Implementation

The [Sound set](../../design/ui/sounds.md#glossary) is authored under the `assets/sounds/` directory of the Spec repo. An Implementation that plays it must hold its own copy of every [Sound](../../design/ui/sounds.md#glossary) file inside its Implementation repo, unchanged, and its Game build must serve that copy rather than the `assets/sounds/` directory of the Spec repo.

## Artwork in an Implementation

The [Background artwork](../../design/ui/visual-design.md#glossary) is authored under the `assets/images/` directory of the Spec repo. An Implementation that shows it must hold its own copy of every image file it shows inside its Implementation repo, unchanged, and its Game build must serve that copy rather than the `assets/images/` directory of the Spec repo. The image path in a BackgroundArtwork [GDR](../../design/foundation/core-concepts.md#game-build-and-content) names a file of the Spec repo, and the Game build shows the Implementation's copy of that file.

## Keeping the copies current

A copy that drifts from its original makes the game differ from its design without anyone deciding so, so no copy is edited by hand. The Implementation repo holds one script, run as `npm run sync:spec`, that mirrors every copied file from a commit of the Spec repo: it adds, replaces, and deletes files until each copy equals its original, and with `--check` it only reports the differences. Each commit of the Implementation that follows the specifications names the commit of the Spec repo it follows in a `Spec:` trailer of its message.
