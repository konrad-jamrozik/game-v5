# About Implementation specifications

> Informative overview. It owns no rules; each linked specification owns its content.

# What Implementation specifications are for

The Design specifications are abstract on purpose, while an Implementation is built in a concrete environment, e.g. a
directory on the Game designer's machine with a particular toolchain. Implementation specifications bridge the two.
They are non-behavioural: they own no game behavior, observable contract, or GDR, and no acceptance test through the
engine API depends on them.

# Families

The Implementation specifications divide by how binding they are and what they cover, as described in
[Implementation binding](../governance/conventions/spec-conventions.md#implementation-binding).

- [About the Mandatory family](mandatory/about-mandatory.md): repository constraints that every Implementation must
  meet, whatever its platform.
- [About the Guidance family](guidance/about-guidance.md): technical suggestions on matters the Design specifications
  leave open.
- [About the Recipes family](recipes/about-recipes.md): suggested steps for carrying out one recurring task.

# Why these boundaries

Advice to implementers must never become an observable contract, so Implementation specifications are kept apart from
the Design specifications. Within them, the line between Mandatory and the other two Families is the line an
Implementer must not cross: an Implementation that ignores every Guidance and Recipes specification can still be
correct, while one that violates a Mandatory specification cannot. Guidance and Recipes are split because a
suggestion about what to build changes for different reasons than the steps of a task.
