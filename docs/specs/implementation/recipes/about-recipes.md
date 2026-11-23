# About the Recipes family

> Informative overview. It owns no rules; each linked specification owns its content.

# What this family is for

Some implementation tasks recur and are easy to get subtly wrong, e.g. publishing a change or updating the globe. Recipes specifications suggest the steps for such a task and the reasons behind its setup that the code cannot show. Like Guidance, they bind no Implementation.

# Documents

## GitHub Pages Deployment

[GitHub Pages Deployment](github-pages-deployment.md) answers _how does a change to the Implementation reach players?_

## Globe Integration

[Globe Integration](globe-integration.md) answers _how does an implementation show the rotating Earth that the Spec repo keeps?_ It keeps the Implementation's globe an unchanged copy of the reference globe, shown as a decoration that reads no game state.

# How they relate

Both Recipes specifications work on files that Implementation Placement of the Mandatory family constrains: GitHub Pages Deployment publishes the Implementation repo, and Globe Integration copies the globe into it and keeps the copy current.

<!-- generated:family-diagram:start -->

_Generated from the links between the specifications by `npm run docs:generate`; do not edit between the markers. An arrow runs from a specification to each specification that references it, i.e. links to it; layer 1 holds the specifications that reference no other specification of the Family, specifications that reference each other in a cycle share a layer, and dashed boxes stand for whole other Families._

## Within the family

No specification of this family links another specification of it.

## Across families

![Recipes family: relationships with other families](../../../images/diagrams/recipes-family-across.svg)

<!-- generated:family-diagram:end -->

# Why these boundaries

Recipes are split from Mandatory for the same reason Guidance is: the files an implementation keeps can be checked in its files, so they are Mandatory, while the way an implementer carries out a task on them is advice that an Implementation can ignore and still be correct.
