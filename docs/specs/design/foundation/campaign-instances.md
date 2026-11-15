# Campaign Instances

| Metadata    | Value                                                                                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec ID     | CINST                                                                                                                                                                      |
| Family      | Foundation                                                                                                                                                                 |
| Audience    | Engine designer, Content designer, Implementer                                                                                                                             |
| Owns        | How every thing in a Campaign's world is modeled as a Campaign instance.                                                                                                   |
| Conventions | [Specification conventions](../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../governance/conventions/design-spec-conventions.md) |

# Overview

Most of a Campaign's world is made of things that come and go, e.g. Agents are hired and lost, and Mission sites appear
and expire. The engine models every such thing the same way, as a Campaign instance. Its Instance ID never changes, and
its Archetype is the shared Game Data Record (GDR) it was made from; its Constants stay fixed for its life, and its
State is what play changes.

Because every thing has this one shape, any of them can be created, referenced, and inspected in the same terms. A
Campaign instance can also take on a shared capability through a Role Type, e.g. taking part in combat, without
changing that shape. Campaign Instances builds on [Campaign State](campaign-state.md), which places every Campaign
instance in World state.

# Relationships

- Uses [Campaign State](./campaign-state.md)
- Uses [Core Concepts](./core-concepts.md)
- Uses [Determinism and Randomness](./determinism-and-randomness.md)
- Uses [Engine Contract](./engine-contract.md)
- Used by [Developer Access](./developer-access.md)
- Used by [Domain Model](../mechanics/domain-model.md)
- Used by [Game Data Records](./game-data-records.md)
- Used by [Timeline](./timeline.md)
- Used by [World History](./world-history.md)

# Glossary

These terms are specific to Campaign Instances. General terms are in the [Core Concepts glossary](core-concepts.md#glossary)
and the [Campaign State glossary](campaign-state.md#glossary).

| Term              | Definition                                                                                                                                                                                                                                                 | Prohibited synonyms                                                                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Campaign instance | A particular occurrence within a Campaign of a declared Type, with Instance ID, an Archetype reference, Constants, and State.                                                                                                                              | Instance; occurrence; Campaign instance kind, for which say Campaign instance Type. Explaining what an occurrence means in a definition remains valid. |
| Instance ID       | The identifier of one Campaign instance, unique within a declared identity scope and stable for the Campaign instance's lifetime. It is a [Campaign-scoped identifier](determinism-and-randomness.md#glossary).                                            | ID; Entity ID. GDR identifiers, Spec IDs, and other identifiers keep their own names.                                                                  |
| Archetype         | A GDR referenced by a Campaign instance, supplying shared characteristics and initial values. It is shared immutable data, never instantiated; the Campaign instance’s Archetype reference is set when the Campaign instance is created and never changes. | Template; EnemyType; EnemyKind, for which say EnemyArchetype                                                                                           |
| State             | Values owned by this Campaign instance that may change under gameplay rules. State is specific to this Campaign instance and is distinct from Campaign state, which describes the whole playthrough.                                                       | MutableState; Instance state that does not separate State from Constants; Changeable reference, for which say Mutable reference                        |
| Constants         | Values owned by this Campaign instance that remain fixed for its lifetime. A reference stored in Constants has a fixed target; it does not require the target’s State to remain fixed.                                                                     | ImmutableState; Fixed reference, for which say Immutable reference                                                                                     |
| Role Type         | A Type that Campaign instance Types can adopt. It states the properties a Campaign instance Type must have to adopt it, and the properties its Campaign instances gain for a stated duration.                                                              |                                                                                                                                                        |

# Campaign instance structure

Every thing in a Campaign's world is described in the same terms, so any two of them can be compared, inspected, and
referenced alike. A Campaign instance Type always has exactly four properties: Instance ID, an Archetype reference,
Constants, and State. Every Campaign instance has exactly these four properties. The singleton Agency is not exempt:
its Archetype reference is required like that of any other Campaign instance.

The four-property shape is the ubiquitous language for Campaign instances. It is chosen for uniformity and ease of
reasoning: every Campaign instance is described, compared, and inspected in the same terms. The shape therefore
belongs in this specification under the vocabulary criterion of
[What belongs in a Design specification](../../governance/conventions/design-spec-conventions.md#what-belongs-in-a-design-specification) and must not be
removed or weakened as an implementation detail.

How full Campaign state inspection presents each Campaign instance is owned by
[Inspection contract](developer-access.md#inspection-contract) in Developer Access.

# Campaign instance creation

Things come into existence both when a Campaign is created and during play, and each needs a complete set of starting
values from a known source. Creation of a Campaign instance, during campaign initialization or gameplay, is specified
by the specification that owns the creating behavior. That specification states when the Campaign instance is created,
its Type, and the initial values of its Archetype reference, Constants, and State, together with the source of each
value; e.g., a named GDR or a value in Campaign state. The initial values need not all come from the Campaign
instance's Archetype: the creating specification may take some of them from another GDR, e.g. one serving the Campaign
instance initialization purpose under [Purposes of GDRs](game-data-records.md#purposes-of-gdrs) or a Referenced GDR
(e.g., the Lead GDR supplying an Investigation's hidden difficulty), or from a value in Campaign state. Every newly
created Campaign instance has a fresh Instance ID under [Campaign instance identity](#campaign-instance-identity).
Which code creates Campaign instances, and what that code receives, is left to the implementer: the creating
specification does not state that code, its signature, or its dependencies. It states the resulting facts instead,
e.g. which Campaign instance owns the new one.

# Campaign instance identity

A Campaign instance must stay recognizable as the same thing for its whole life, including when play is undone and
redone. Instance IDs are unique within their explicitly declared scope and stable for the Campaign instance’s lifetime.
Restoration, including undo/redo, preserves identity and immutable facts; uniqueness applies within the Campaign’s
current timeline, excluding discarded futures.

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

Campaign instances point at one another and at GDRs, e.g. an Investigation at its Lead, and every such pointer must
always lead somewhere valid. References identify a particular target and its expected Type. In Committed state,
Campaign instance references must resolve within the same Campaign; GDR references identify the GDR ID and must
resolve against the current Game build. Required historical references remain resolvable, under
[Historical fact preservation](world-history.md#historical-fact-preservation) in World History. Relationships must not
be inferred from display names or identifier text.

References that can change belong in State; fixed references belong in Constants. Instance ID and the Archetype reference
are separate immutable properties. Reference mutability is independent of the target’s mutability.
