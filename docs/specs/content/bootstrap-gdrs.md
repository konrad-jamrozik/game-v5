# Bootstrap GDRs

| Metadata    | Value                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------- |
| Spec ID     | BOOT                                                                                              |
| Family      | Content                                                                                           |
| Status      | Stub                                                                                              |
| Audience    | Content designer, Implementer                                                                     |
| Owns        | Which Game Data Records (GDRs) a Game build supplies so that a first playable Campaign can start. |
| Conventions | [Specification conventions](../governance/spec-conventions.md)                                    |

# Overview

This document defines the Bootstrap GDRs: the smallest set of Game Data Records (GDRs) a Game build supplies so that
a first playable Campaign can be created and played. It names which GDRs must exist and what each is for; the values
themselves live in the GDRs, not in this document. What a GDR can be used for is owned by
[Game Data Records](../foundation/game-data-records.md), and the meaning of each value by the Mechanics specification
that needs it.

# Relationships

- Uses [Configuration](../foundation/configuration.md)
- Uses [Domain Model](../mechanics/domain-model.md)
- Uses [Game Data Records](../foundation/game-data-records.md)
- Used by [Storage Schema](../implementation/storage-schema.md)

# Glossary

| Term           | Definition                                                                                     |
| -------------- | ---------------------------------------------------------------------------------------------- |
| Bootstrap GDRs | The GDRs a Game build must supply so that a first playable Campaign can be created and played. |

# Required GDRs

TODO: List the Bootstrap GDRs by purpose, e.g. at least one Campaign configuration preset under
[Campaign configuration presets](../foundation/configuration.md#campaign-configuration-presets) in Configuration, and
the Archetypes of the Campaign instance Types under [Game concepts](../mechanics/domain-model.md#game-concepts) in
Domain Model that the initial Campaign state contains.

TODO: State which GDRs the first playable Campaign needs beyond the initial Campaign state, e.g. the Leads, weapons,
and upgrades the Player can reach.
