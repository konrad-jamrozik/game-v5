# About the Conventions family

> Informative overview. It owns no rules; each linked specification owns its content.

# What this family is for

The specifications are written mostly by LLMs and read by LLMs that implement them, so they must be predictable and unambiguous. Conventions specifications own how every specification is written, registered, and related to others.

# Documents

## Game Specification Index

[Game Specification Index](../../README.md) answers _which specifications exist, and where does a reader start?_ It lives at the root of the specifications directory rather than in this one.

## Specification Conventions

[Specification Conventions](spec-conventions.md) answers _how is any specification written?_

## Design Specification Conventions

[Design Specification Conventions](design-spec-conventions.md) answers _what does a Design specification state, and how exactly?_

## Implementation Specification Conventions

[Implementation Specification Conventions](implementation-spec-conventions.md) answers _what may an Implementation specification state, and how strongly?_

## Terminology Conventions

[Terminology Conventions](terminology-conventions.md) answers _which words may name a concept?_

## Glossary Conventions

[Glossary Conventions](glossary-conventions.md) answers _how is a Glossary written?_

## Overview Conventions

[Overview Conventions](overview-conventions.md) answers _how does an overview orient a reader?_

## Artifact Relationships

[Artifact Relationships](artifact-relationships.md) answers _how does one specification come to rely on another?_

# How they relate

Specification Conventions is the baseline, and the others each add detail on one part of it. Terminology Conventions, Glossary Conventions, and Overview Conventions apply to every specification, while Design Specification Conventions and Implementation Specification Conventions each apply to one Specification kind. Glossary Conventions records in each Glossary the Prohibited synonyms that Terminology Conventions defines. The index is tied to the rest of the specifications by navigation links only.

<!-- generated:family-diagram:start -->

_Generated from the links between the specifications by `npm run docs:generate`; do not edit between the markers. An arrow runs from a specification to each specification that references it, i.e. links to it; layer 1 holds the specifications that reference no other specification of the Family, specifications that reference each other in a cycle share a layer, and dashed boxes stand for whole other Families._

## Within the family

![Conventions family: references within the family](../../../images/diagrams/conventions-family-within.svg)

## Across families

![Conventions family: relationships with other families](../../../images/diagrams/conventions-family-across.svg)

<!-- generated:family-diagram:end -->

# Why these boundaries

- **Baseline versus the specifications that build on it:** what holds for every specification changes rarely, while the rules for one Specification kind or one section change with the work on it; e.g., a new rule for formulas touches only Design Specification Conventions.
- **Terminology Conventions versus Glossary Conventions:** Terminology Conventions decides which words a specification may use anywhere in it; Glossary Conventions decides how one section, the Glossary, is laid out.
- **Conventions versus Artifact Relationships:** how the specifications reference each other changes with tooling, e.g. how a mention is recognized, while specification layout rarely does, so they are owned separately.
- **Index versus everything else:** the index only navigates; ownership stays with each registered document.
