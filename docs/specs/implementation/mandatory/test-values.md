# Test Values

| Metadata | Value |
| --- | --- |
| Spec ID | TESTVAL |
| Family | Mandatory |
| Audience | Engine designer, Implementer |
| Owns | Where an automated test of an Implementation takes the values it checks against. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Implementation Specification Conventions](../../governance/conventions/implementation-spec-conventions.md) |

# Overview

The Game designer retunes the game often, e.g. by changing the hire cost of an Agent in a [GDR](../../design/foundation/core-concepts.md#game-build-and-content) or a Game designer value of a [Tuning parameter](../../design/autopilot-ais/basic-autopilot-ai.md#glossary). A test that copies such a value into what it expects breaks at every retune without any defect in the Implementation. Updating it to whatever the code now produces then becomes routine, and the same routine would hide a real defect. Every Implementation therefore keeps its tests such that a retune changes none of them.

# Glossary

| Term | Definition |
| --- | --- |
| Retunable value | A value that the Game designer tunes rather than a rule fixes: a value that a [GDR](../../design/foundation/core-concepts.md#game-build-and-content) of the [Game build](../../design/foundation/core-concepts.md#game-build-and-content) holds, e.g. the hire cost of an Agent, or the Game designer value of a [Tuning parameter](../../design/autopilot-ais/basic-autopilot-ai.md#glossary). |
| Fixture value | A value that a test sets in the setup it runs against, e.g. the skill of a Combatant it builds or a GDR it replaces, instead of taking it from the Game build. |

# Expected values

The following rules bind every automated test of the [Implementation repo](implementation-placement.md#glossary). A number written in the text of a rule, e.g. a boundary or a limit that the rule itself gives, is not a Retunable value, and a test may write it as a literal.

- **Retunable values from the Game build:** A test must take each Retunable value that what it expects depends on from where the Game build under test holds it, e.g. by reading the GDR, or set it as a Fixture value. It must not write a Retunable value of the Game build as a literal, e.g. an expected cost of 150 copied from a GDR file, and a change to the Implementation must not replace a value a test reads from the Game build with such a literal, also not to repair a test that a retune broke.
- **Expected values from the rule:** A test must derive each value it expects from the rule it checks, e.g. by applying the formula of the specification that owns the rule to the values above, and must not copy it from the output of the code under test.
- **Content checked by structure:** A test that checks the content of the Game build must check its structure, e.g. that every Lead chain reaches its Terminate Lead, and must not check a count of it, e.g. how many GDRs or Compendium articles it holds.
- **Worked examples from their own inputs:** A test that checks a worked example of a specification must set the example's inputs as Fixture values, so that the example's result follows from the example rather than from the content of the day.
