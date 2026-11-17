# Campaign Instances

| Metadata    | Value                                                                                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | CINST                                                                                                                                                                      |
| Family      | Foundation                                                                                                                                                                 |
| Audience    | Engine designer, Content designer, Implementer                                                                                                                             |
| Owns        | How every thing in a Campaign's world is modeled as a Campaign instance.                                                                                                   |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

Most of a [Campaign](core-concepts.md#campaign-and-session)'s world is made of things that come and go, e.g. Agents are hired and lost, and [Mission sites](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) appear
and expire. The engine models every such thing the same way, as a [Campaign instance](core-concepts.md#campaign-instances). Its Instance ID never changes, and
its [Archetype](core-concepts.md#campaign-instances) is the shared [Game Data Record](core-concepts.md#game-build-and-content) (GDR) it was made from; its [Constants](core-concepts.md#campaign-instances) stay fixed for its life, and its
[State](core-concepts.md#campaign-instances) is what play changes.

Because every thing has this one shape, any of them can be created, referenced, and inspected in the same terms. A
Campaign instance can also take on a shared capability through a Role Type, e.g. taking part in combat, without
changing that shape. Campaign Instances builds on [Campaign State](campaign-state.md), which places every Campaign
instance in [World state](campaign-state.md#glossary).

# Glossary

These terms are specific to Campaign Instances. [Campaign instance](core-concepts.md#campaign-instances), [Archetype](core-concepts.md#campaign-instances), [State](core-concepts.md#campaign-instances), [Constants](core-concepts.md#campaign-instances), and other general terms are in the [Core Concepts glossary](core-concepts.md#glossary) and the [Campaign State glossary](campaign-state.md#glossary).

| Term        | Definition                                                                                                                                                                                                                                                                                                                                                                               | Prohibited synonyms                                                                   |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Instance ID | The identifier of one Campaign instance, unique within a declared identity scope and stable for the Campaign instance's lifetime, formed from its Campaign instance [Type](core-concepts.md#data-modeling) and that Type's creation count under [Campaign instance identity](#campaign-instance-identity). It is a [Campaign-scoped identifier](determinism-and-randomness.md#glossary). | ID; Entity ID. GDR identifiers, Spec IDs, and other identifiers keep their own names. |
| Role Type   | A [Type](core-concepts.md#data-modeling) that Campaign instance Types can adopt. It states the properties a Campaign instance Type must have to adopt it, and the properties its Campaign instances gain for a stated duration.                                                                                                                                                          |                                                                                       |

# Campaign instance structure

Every thing in a [Campaign](core-concepts.md#campaign-and-session)'s world is described in the same terms, so any two of them can be compared, inspected, and
referenced alike. A Campaign instance Type always has exactly four properties: Instance ID, an Archetype reference,
Constants, and State. Every Campaign instance has exactly these four properties. E.g., the singleton [Agency](../mechanics/domain-model.md#agency-and-agents) is not exempt:
its Archetype reference is required like that of any other Campaign instance.

The four-property shape is the ubiquitous language for Campaign instances. It is chosen for uniformity and ease of
reasoning: every Campaign instance is described, compared, and inspected in the same terms. The shape therefore
belongs in this specification under the vocabulary criterion of
[What belongs in a Design specification](../../governance/conventions/design-spec-conventions.md#what-belongs-in-a-design-specification) and must not be
removed or weakened as an implementation detail.

How full [Campaign state](core-concepts.md#campaign-and-session) inspection presents each Campaign instance is owned by
[Inspection contract](developer-access.md#inspection-contract) in Developer Access.

# Campaign instance creation

The specification that owns a creating behavior, at Campaign initialization or during play, states when a Campaign
instance is created, its Type, and the initial value of its Archetype reference, its Constants and its State, with the
source of each. E.g., a source can be its Archetype, another GDR, or a value of Campaign state. Every new Campaign
instance gets a fresh Instance ID under [Campaign instance identity](#campaign-instance-identity). Which code creates
it is the Implementer's choice.

# Campaign instance identity

A Campaign instance must stay recognizable as the same thing for its whole life, including when play is undone and
redone. Instance IDs are unique within their explicitly declared scope and stable for the Campaign instance’s lifetime.
Restoration, including undo/redo, preserves identity and immutable facts; uniqueness applies within the Campaign’s
current timeline, excluding discarded futures.

An Instance ID names its Campaign instance Type and counts within it, so that it reads well wherever it is shown. It is
the Type's name in lowercase with each space replaced by a hyphen, then a hyphen, then a number. Each Campaign instance
Type numbers its Campaign instances from 1 in the order they are created, and never reuses a number within the
Campaign's current timeline, but an undone creation is a discarded future and frees its number. E.g., the first three
Campaign instances of a Type named Field unit are field-unit-1 to field-unit-3, and the fourth is field-unit-4 even
when field-unit-2 no longer takes part in play. When the creation of field-unit-4 is undone and another Field unit is
created, it is again field-unit-4.

# Role Types

A Role Type describes a capability that several Campaign instance Types share; e.g., a Role Type for taking part in
combat, adopted by every Campaign instance Type whose Campaign instances can fight. The specification declaring a
Role Type states all of the following:

- **Adoption condition:** the exhaustive set of properties a Campaign instance Type must have to adopt the Role Type.
- **Adopters:** the exhaustive set of Campaign instance Types that adopt it.
- **Gained properties:** the properties that every Campaign instance of an adopting Campaign instance Type gains for
  a stated duration, when the Role Type has any, and when that duration begins and ends.

Adopting a Role Type creates no Campaign instance and no Instance ID, and adds no fifth property under
[Campaign instance structure](#campaign-instance-structure). The properties named by the adoption condition are
ordinary properties of the adopting Campaign instance Type and persist like any other. Gained properties belong to
the Campaign instance that gains them and exist only for the stated duration. A Role Type has no Campaign instances
of its own, so nothing references a Role Type's occurrence; references target the adopting Campaign instance.

# References

Campaign instances can point at one another and at [GDRs](core-concepts.md#game-build-and-content), e.g. an [Investigation](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) at its [Lead](../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions). Every reference names a
target of its expected Type. In [Committed state](engine-contract.md#player-actions-and-turns), Campaign instance references resolve within the same Campaign, and GDR
references resolve against the current [Game build](core-concepts.md#game-build-and-content). Required historical references remain resolvable, under [Historical fact preservation](world-history.md#historical-fact-preservation) in World History. Relationships must not
be inferred from display names or identifier text.

References that can change belong in State; fixed references belong in Constants. Instance ID and the Archetype reference
are separate immutable properties. Reference mutability is independent of the target’s mutability.
