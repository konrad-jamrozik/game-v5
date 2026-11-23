# Test Focus

| Metadata | Value |
| --- | --- |
| Spec ID | TFOCUS |
| Family | Guidance |
| Audience | Engine designer, Implementer |
| Owns | Non-behavioural guidance on which properties of an Implementation its automated tests are best spent on. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Implementation Specification Conventions](../../governance/conventions/implementation-spec-conventions.md) |

# Overview

Every test costs an update each time what it checks changes, and it repays that cost only by failing when the Implementation is wrong. A defect that a person playing the game would see at once is found by playing it; a defect that play hides, e.g. a Campaign save that replays to a different Campaign state, is found only by a test.

Tests are therefore suggested to be spent where play cannot see, with each rule checked once, at the lowest level that can check it.

# Glossary

| Term | Definition |
| --- | --- |
| Hidden property | A property of an Implementation whose violation a person playing it would not notice, e.g. that equal Campaign seeds and Player actions give equal Campaign state, or that no Player API result holds a value the player may not see. |
| Interface test | An automated test that drives a user interface of the Implementation as a person would, e.g. a browser test that clicks through the Graphical User Interface. |

# Where tests pay

The following suggestions are complete:

- **Hidden properties first:** Tests should cover every Hidden property, e.g. determinism and replay, saves, the Timeline with Undo, Redo, and Autosaves, the boundary of what the player may see, and the boundaries between the layers of the code. A property over many generated sequences of actions, e.g. any mix of actions, Undos, and Redos that restores equal Campaign state, is suggested over a few hand-picked cases.
- **Beyond worked examples:** The worked examples of a specification cover the boundaries it states. Tests should also cover what its rules imply but no example shows, e.g. an order the rules make canonical whatever order the Player actions give, or which Autosaves count as ancestors after an Undo.
- **One test per rule:** Each rule should be checked at one level. A test that repeats another at another level, e.g. a browser test of a sort order that a view-model test already checks, should be dropped.
- **Interface tests for what only an interface shows:** An Interface test should check only what no lower-level test can, e.g. that settings survive a reload of the browser, or that the Graphical User Interface, the Command-Line Interface, and the engine API play the same Campaign to equal Campaign state. Each should keep to one subject, so that an unrelated change, e.g. a renamed label, does not fail it.
- **Presentation by looking:** How a screen looks, e.g. sizes, colours, and wording, should be checked by looking at its [Screenshot](../../design/ui/visual-design.md#glossary) after it is generated again, not by a test that reads a stylesheet or pins a label.

# Edge cases and failure behavior

- **A defect found by playing:** A defect that the Game designer found by playing should get a test only when it breaks a Hidden property or a rule that a lower-level test can check; a defect that only the screen shows needs none.
- **A test that never fails:** A test that would pass whatever the code under test does, e.g. one whose setup cannot reach the outcome its name promises, checks nothing and should be rewritten or dropped.
