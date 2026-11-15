# About the Conventions family

> Informative overview. It owns no rules; each linked specification owns its content.

# What this family is for

The specifications are written mostly by LLMs and read by LLMs that implement them, so they must be predictable and
unambiguous. Conventions specifications own how every specification is written, registered, and related to others.

# Documents

## Game Specification Index

[Game Specification Index](../../README.md) answers _which specifications exist, and what does each own?_ It is the
navigation entry point and points to the generated catalog of every specification's ID, Family, title, and Owns
summary. It lives at the root of the specifications directory rather than in this one.

## Specification Conventions

[Specification Conventions](spec-conventions.md) answers _how is a specification written?_ It owns layout, metadata,
Specification kinds and Families, ownership rules, terminology, and lifecycle.

## Artifact Relationships

[Artifact Relationships](artifact-relationships.md) answers _how do artifacts declare their dependencies?_ It owns the
five Relationship kinds, their direction, inventories, and graph validation.

# How they relate

Specification Conventions uses Artifact Relationships for the relationship model it requires every specification to
declare. The index is tied to the rest of the specifications by links rather than declared relationships.

<!-- generated:family-diagram:start -->

_Generated from the specifications’ Relationships sections by `npm run docs:generate`; do not edit between the markers. Arrows run from Dependency to Dependent; the Uses and Refines diagrams share their layers, and layer 1 holds the specifications that depend on no other specification of the Family; dashed boxes stand for whole other Families._

## Within the family

### Uses

![Conventions family: uses relationships within the family](../../../images/conventions-family-within-uses.svg)

### Refines

No refines relationships are declared within this family.

## Across families

No relationships are declared with specifications in other families.

<!-- generated:family-diagram:end -->

# Why these boundaries

- **Conventions versus Artifact Relationships:** the relationship model also covers implementations and tests, not
  only specifications, so it is owned separately from specification layout.
- **Index versus everything else:** the index only navigates; ownership stays with each registered document.
