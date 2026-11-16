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

[Specification Conventions](spec-conventions.md) answers _how is any specification written?_ It owns the rules that
hold whatever the Specification kind: Specification kinds and Families, metadata, layout, ownership, requirement
wording, examples, and unspecified content.

## Design Specification Conventions

[Design Specification Conventions](design-spec-conventions.md) answers _what does a Design specification state, and
how exactly?_ It owns what may be specified about the game, and how rules, formulas, GDRs, and acceptance examples are
written.

## Implementation Specification Conventions

[Implementation Specification Conventions](implementation-spec-conventions.md) answers _what may an Implementation
specification state, and how strongly?_ It owns Binding and the wording each Binding requires.

## Terminology Conventions

[Terminology Conventions](terminology-conventions.md) answers _which words may name a concept?_ It owns canonical terms, Non-terms, and how
Prohibited synonyms are recorded.

## Glossary Conventions

[Glossary Conventions](glossary-conventions.md) answers _how is a Glossary written?_ It owns Glossary groups,
Glossary definitions, and the Prohibited synonyms column.

## Overview Conventions

[Overview Conventions](overview-conventions.md) answers _how does an overview orient a reader?_ It owns the
Overview of a specification and the overviews of Specification kinds and Families.

## Artifact Relationships

[Artifact Relationships](artifact-relationships.md) answers _how do artifacts declare their dependencies?_ It owns the
five Relationship kinds, their direction, implicit relationships, inventories, and graph validation.

# How they relate

Specification Conventions is the baseline, and five specifications refine it, each adding detail on one part of it.
Terminology Conventions, Glossary Conventions, and Overview Conventions apply to every specification, while Design Specification
Conventions and Implementation Specification Conventions each apply to one Specification kind. Glossary Conventions uses Terminology Conventions, whose Prohibited synonyms it records in each Glossary. Specification Conventions uses Artifact
Relationships for the relationship model it requires every specification to declare. The index is tied to the rest of
the specifications by links rather than declared relationships.

<!-- generated:family-diagram:start -->

_Generated from the specifications’ Relationships sections by `npm run docs:generate`; do not edit between the markers. Arrows run from Dependency to Dependent; the Uses and Refines diagrams share their layers, and layer 1 holds the specifications that depend on no other specification of the Family; dashed boxes stand for whole other Families._

## Within the family

### Uses

![Conventions family: uses relationships within the family](../../../images/diagrams/conventions-family-within-uses.svg)

### Refines

![Conventions family: refines relationships within the family](../../../images/diagrams/conventions-family-within-refines.svg)

## Across families

No relationships are declared with specifications in other families.

<!-- generated:family-diagram:end -->

# Why these boundaries

- **Baseline versus refinements:** what holds for every specification changes rarely, while the rules for one
  Specification kind or one section change with the work on it; e.g., a new rule for formulas touches only Design
  Specification Conventions.
- **Terminology Conventions versus Glossary Conventions:** Terminology Conventions decides which words a specification may use anywhere in
  it; Glossary Conventions decides how one section, the Glossary, is laid out.
- **Conventions versus Artifact Relationships:** the relationship model also covers implementations and tests, not
  only specifications, so it is owned separately from specification layout.
- **Index versus everything else:** the index only navigates; ownership stays with each registered document.
