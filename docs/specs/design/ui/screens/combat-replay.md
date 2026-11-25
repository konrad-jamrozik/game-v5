# Combat Replay

| Metadata | Value |
| --- | --- |
| Spec ID | CRPLAY |
| Family | UI |
| Audience | UI designer, Implementer |
| Owns | How the Combat replay opens in the Turn Report View, how it draws the Combatants and their attacks on the Battlefield, and how the Player steps and plays it. |
| Conventions | [Specification Conventions](../../../governance/conventions/spec-conventions.md), [Design Specification Conventions](../../../governance/conventions/design-spec-conventions.md) |

# Overview

The Combat replay lets the Player watch a Combat instead of reading it: it plays the Combat log back, attack by attack, as shots between the figures of the Combatants on a Battlefield, so that who fought whom, who wore armor, and who fell is seen at a glance. It is one step away in the [Turn Report View](turn-report-view.md), like the Combat report it is drawn from.

It shows only what the Combat report holds and fights nothing again, so in a Campaign it exists only for a Combat whose Combat report the Turn report still holds. Another screen may show the same Combat replay for a Combat report of its own. Where a figure stands decides nothing: the Battlefield is a picture of the Combat, not part of its rules.

# Glossary

| Term | Definition |
| --- | --- |
| Combat replay | The view, e.g. of the Turn Report View, that plays one [Combat](../../mechanics/domain-model.md#combat) back from its [Combat report](../../mechanics/domain-model.md#combat), as attacks between the figures of its [Combatants](../../mechanics/domain-model.md#combat) on the Battlefield. |
| Battlefield | The square grid of the Combat replay on which one figure stands for each [Combatant](../../mechanics/domain-model.md#combat) of both sides. |
| Rank insignia | The mark beside a figure on the Battlefield that says how skilled its Combatant is when rested. |

# Visualize button

The Player reaches the Combat replay from wherever a [Combat](../../mechanics/domain-model.md#combat) is summed up. A Visualize button stands beside each [Combat report](../../mechanics/domain-model.md#combat) button, i.e. on a row of the Missions section of the Turn Report View and in the title row of a Combat report, and a [Mission](../../mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) card of the [Turn summary](turn-summary.md#mission-cards) does the same when selected. It opens the Turn Report View with that Mission's Combat replay shown in place of its content, as a Follow.

# Battlefield layout

The Battlefield places the two sides apart so that every shot reads as crossing from one to the other. It is a grid of 30 by 30 cells: the Agents stand on its left side and the Enemies on its right side. A figure never leaves its cell, except to lunge with a blade, and the same Combat always shows every figure in the same cell. The Battlefield is centred in the width it is given.

Each side stands several columns deep, and how near the other side a figure stands follows how strong its Combatant is, so that a side reads as a front line of its weakest with its elite behind them. Among the Combatants of its side, the lower a Combatant's [Combat rating](../../mechanics/combat.md#combatant-condition-in-a-combat) at Combat start, the nearer the other side its figure tends to stand, and the higher, the nearer its own edge of the Battlefield. A side stands seven columns deep, or up to nine when it has more Combatants than seven columns hold. Chance moves a figure a little from the column its Combat rating alone gives it, so that a side of equal Combatants still stands spread over its columns.

A column says how strong its Combatants are, and where in the column a figure stands says nothing. The figures of one column therefore stand evenly spaced around the middle row of the Battlefield, in the fixed order of their side from top to bottom: at most four rows apart, so that a column of few figures gathers at the middle, and closer when the column holds more than that fits, down to one figure in every row. Columns whose figures stand four rows apart are staggered, each one row below the column before it, so that the names beside the figures have room.

# Figures

A figure shows what the Player must know about its Combatant without a table: whose side it is on, what kind it is, how much health and armor it has left, and how skilled it is.

- **Name:** each figure is named beside it, an [Agent](../../mechanics/domain-model.md#agency-and-agents) by its [Instance ID](../../foundation/campaign-instances.md#glossary) and an [Enemy](../../mechanics/domain-model.md#combat) by its [Enemy label](../gui.md#glossary). A side with more Combatants than the Battlefield has rows shows no names, because they would lie over one another; the pointer resting on a figure still names it.
- **Agent:** a circle in Positive.
- **Enemy:** a shape and a colour that say its EnemyArchetype, by the place of that EnemyArchetype in the EnemyArchetype order. The first three EnemyArchetypes are triangles, the next three squares, the next three pentagons, and the three after them hexagons. Within a shape, the first is in Enemy amber, the second in Danger, and the third in Enemy violet.
- **Health:** the figure is filled with its colour from the bottom, as far as its [current health](../../mechanics/agents-spec.md#combatant-attributes) is of its [effective max health](../../mechanics/agents-spec.md#combatant-attributes), so that it empties from the top as it is hit.
- **Armor:** a rim around the figure in Text muted, the thicker the more [current armor](../../mechanics/agents-spec.md#combatant-attributes) the Combatant has, so that a hit thins the rim before it empties the figure, and a Combatant with no current armor has no rim.
- **Condition:** a figure whose Combatant is [Incapacitated](../../mechanics/combat.md#combatant-condition-in-a-combat) is dimmed and has a dashed outline, and that of a dead one is empty and crossed out.
- **Rank insignia:** a mark beside the figure, of Agents and Enemies alike.

## Rank insignia thresholds

A Rank insignia lets the Player pick out the veterans of both sides, so it must not change as a Combatant is worn down in the Combat. It is therefore taken from the Combatant's [base skill](../../mechanics/agents-spec.md#combatant-attributes) at Combat start, rounded down, which is its [effective skill](../../mechanics/agents-spec.md#combatant-attributes) at full current health and without [exhaustion](../../mechanics/agents-spec.md#combatant-attributes).

| Base skill at least | Rank insignia  |
| ------------------- | -------------- |
| 100                 | One chevron    |
| 120                 | Two chevrons   |
| 145                 | Three chevrons |
| 175                 | One bar        |
| 210                 | Two bars       |
| 250                 | Three bars     |
| 300                 | One star       |
| 450                 | Two stars      |
| 700                 | Three stars    |

A Combatant below the first row has no Rank insignia.

# Shots

Each kind of Weapon attacks in its own way, so that the Player sees what a Combatant is armed with, and when an Agent has run out of [Ammo](../../mechanics/combat.md#ammo), without reading the [Combat log](../../mechanics/combat.md#combat-rounds-and-results). An attack is drawn in this order: the attacker is marked, its shot crosses to the defender, the shot lands or passes beside the defender, and a hit thins the defender's rim, empties its figure, and shows its damage outcome above it.

The shot of an attack follows the `shot` of the AmmoType of the attacker's Weapon. An attack with a Weapon that has no `ammo_type`, e.g. an Agent's attack with the Fallback Weapon after its Ammo has run out, is a blade.

| Shot | Crossing | Hit |
| --- | --- | --- |
| `bullet` | One tracer in Tracer flies from the attacker to the defender. | A ring of sparks. |
| `burst` | Three tracers in Tracer follow one another. | Three smaller rings of sparks, one after another. |
| `beam` | A straight beam in Beam appears at once from the attacker to the defender and fades. | A glow in Beam that spreads over the defender. |
| Blade | The attacker lunges to the defender and returns to its cell. | A slash across the defender. |

A tracer or a beam is the longer and thicker the higher the attacker's [effective weapon damage](../../mechanics/agents-spec.md#combatant-attributes). A shot that misses is aimed beside the defender and flies on past it, and a blade that misses slashes beside it. A hit shakes the defender.

# Playback

The Player sets the pace: one attack at a time to study a Combat, or all of it at once to see how it went.

- **Steps:** a [Combat turn](../../mechanics/combat.md#combat-rounds-and-results) button plays the next attack, a Phase button plays to the end of the current Agents' phase or [Enemies' phase](../../mechanics/combat.md#combat-rounds-and-results), and a [Combat round](../../mechanics/combat.md#combat-rounds-and-results) button plays to the end of the current Combat round. A Combat turn in which a Combatant made no attack is not in the Combat log and is not a step.
- **Repeat:** a Repeat button plays again the last of these three steps the Player took: it returns to where that step began and plays the same attacks once more, e.g. the same Combat round after the Combat round button, so that the Player can watch a step as often as needed. It is disabled until a step has been taken. The R key presses it. While the Combat replay is shown on the [Campaign screen](campaign-screen.md#undo-and-redo), the R key therefore does not press the Redo button.
- **Play:** a Play button plays to the end of the Combat and becomes Pause while it plays. At the end of the Combat it becomes Replay, which plays the Combat again from its start.
- **Going back:** a Back button returns to before the last attack, a Start button to Combat start, and a slider to any attack. The Combat log is listed beside the Battlefield, and selecting a row of it shows the Combat right after that attack.
- **Speed:** how long one attack takes to play: 2 s, 1.5 s, 1 s, 0.5 s, 0.25 s, or 0.1 s.
- **Instant:** when on, all attacks of a phase play at the same time, so a step is a phase, and several hits on one defender show their damage outcomes as one sum.
- **Overlap:** when on, the next attack starts a Delay after the last one started, whether or not that one has finished, and keeps doing so across phases and Combat rounds. The Delay is 1.5 s, 1 s, 0.5 s, 0.25 s, or 0.1 s, and is independent of the Speed. With Instant on, the Delay runs from the start of one phase to the start of the next.
- **Aim lines:** a faint dashed line joins each attacker to its defender, for every attack being played and, at rest, for the step last played. An Aim lines checkbox, on at first, turns these lines off, e.g. for a Combat of many Combatants in which they hide the shots.
- **Options:** the Speed, Instant, Overlap with its Delay, and Aim lines are set once and then left alone, so they sit behind an Options button, which shows them and hides them again, and the Battlefield, the buttons, the slider, and the Combat log share one screen of the [Reference window](../visual-design.md#reference-window) without them. They are hidden whenever a [Session](../../foundation/core-concepts.md#campaign-and-session) starts, and whether they are shown stays as the Player last left it for the rest of the Session.

Beside the Battlefield, the Combat replay names the attack being played, i.e. its Combat round and phase, attacker, defender, [Hit chance](../../mechanics/combat.md#combat-rounds-and-results), and result, and at the end the [Combat outcome](../../mechanics/combat.md#combat-rounds-and-results). A bar compares the [Combat ratings](../../mechanics/combat.md#combatant-condition-in-a-combat) of the two sides as of the last Combat round completed. The pointer resting on a figure shows the values of its Combatant.

# Screenshot

The Combat replay as the game draws it:

![Combat replay Screenshot](../../../../images/screens/combat-replay.png)

_Captured on 2026-11-24 00:10 UTC._

# TODOs

- TODO (later): Let the Player change a Combat from the Combat replay, e.g. choose whom a Combatant attacks, and have the Advance turn apply the changed result.
- TODO (later): Make where a figure stands in the [Battlefield layout](#battlefield-layout) matter, e.g. through range, obstacles, and movement.
