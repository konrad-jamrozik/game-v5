# Implementation Placement

| Metadata    | Value                                                                        |
| ----------- | ---------------------------------------------------------------------------- |
| Spec ID     | PLACE                                                                        |
| Family      | Implementation                                                               |
| Status      | Draft                                                                        |
| Binding     | Mandatory                                                                    |
| Audience    | Implementer                                                                  |
| Owns        | Where in this repository each implementation and everything it needs reside. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)               |

# Overview

An [Implementation](../governance/artifact-relationships.md#glossary) of the game is the code, tests, and tooling that
produce a playable Game build from the specifications. Each Implementation resides in its own Implementation directory
under `implementations/` and treats that directory as the root of its repository, as if nothing else in the repository
existed. Several Implementations may exist side by side, each independent of the others and of the specifications and
tooling around it.

# Relationships

- Uses [Bootstrap GDRs](../content/bootstrap-gdrs.md)
- Used by [Implementation Records](implementation-records.md)
- Used by [Implementation Scaffold](implementation-scaffold.md)

# Glossary

| Term                     | Definition                                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Implementation directory | The directory `implementations/<implementation-name>/` that holds exactly one Implementation.                 |
| Implementation name      | The `<implementation-name>` path segment of an Implementation directory, which identifies the Implementation. |

# Implementation directory

Every Implementation must reside entirely in its Implementation directory. Every file that the Implementation consists
of, or that is needed to install, develop, build, test, or run it, must be inside that directory; e.g., its package
manifest, lockfile, TypeScript and build configuration, lint and format configuration, scripts, tests, and Git ignore
rules.

The Implementation name must consist of lowercase letters, digits, and single hyphens, must start with a letter, and
must differ from the name of every other Implementation directory. Which name an Implementation uses is the
Implementer's choice.

# Repository root of an Implementation

An Implementation must treat its Implementation directory as its repository root and must behave as if nothing outside
it existed:

- It must not add, change, or delete any file outside its Implementation directory.
- It must not read, import, extend, or execute any file outside its Implementation directory; e.g., it must not import
  from another Implementation, extend the root `tsconfig.json`, call the root npm scripts, or resolve packages from the
  root `node_modules`.
- Nothing outside its Implementation directory may be required to install, build, test, or run it; e.g., root Git
  hooks, root CI workflows, and root deployment configuration must not be added or changed for it.

## Game data in an Implementation

The [Bootstrap GDRs](../content/bootstrap-gdrs.md) are authored under the root `content/` directory. An Implementation
that builds them into its Game build must hold its own copy of the GDR files it uses inside its Implementation
directory, and its Game build must read that copy rather than the root `content/` directory.

# Edge cases and failure behavior

An Implementation that needs a change outside its Implementation directory, e.g. a new root CI job, cannot obtain it
under these constraints; it provides the equivalent inside its Implementation directory instead, e.g. a script in its
own package manifest that runs its checks.
