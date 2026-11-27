# Basic Autopilot AI Study, 2026-11-27, current AI

| Metadata | Value |
| --- | --- |
| Spec ID | AISTUDY4 |
| Family | Autopilot Studies |
| Audience | Game designer, AI designer, Implementer |
| Owns | What the Autopilot Lab study of 2026-11-27 measured of the Basic Autopilot AI after the exhaustion factor of the Combat rating, a Combat margin of 120%, and 2 Enemies per Agent, the root causes of its defeats and of its highest-rated losses, and the change it proposes. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Implementation Specification Conventions](../../governance/conventions/implementation-spec-conventions.md) |

# Overview

The Game designer asked: "I applied some fixes to autopilot AI and changes to CR formula. Can you run autopilot AI as it is right now and report back? Importantly DO NOT ATTEMPT to change handling of CR ratio. Currently it is 120% + allows more for existential threats. Leave it at that, do not try other combinations." This study answered with [Balancing runs](../mandatory/campaign-tests.md#glossary) of the [Autopilot Lab](../../design/autopilot-ais/autopilot-lab.md), leaving the Combat margin and the team for an existential site as they are; its numbers go stale with the next change of the game.

The [Basic Autopilot AI](../../design/autopilot-ais/basic-autopilot-ai.md) won 29 of 40 Campaigns. Nine of its 11 defeats came from an existential site that expired because fewer Deployable Agents stood in base than its Enemies ask for, while their Combat rating was up to four times the Enemies'. Planning the Strike team for the Agents the Threat asks for cut the defeats to 4 and won 36 of 40 by Turn 500.

# Glossary

| Term | Definition |
| --- | --- |
| Current baseline | The Basic Autopilot AI of the Implementation when the study began, with its [Game designer values](../../design/autopilot-ais/basic-autopilot-ai.md#game-designer-values). |
| Strike count change | The Current baseline with the Enemies of the [Strike goal](../../design/autopilot-ais/basic-autopilot-ai.md#glossary) taken as the most of the [Threat](../../design/autopilot-ais/basic-autopilot-ai.md#glossary)'s and the weakest [Next rung](../../design/autopilot-ais/basic-autopilot-ai.md#glossary)'s, rather than those of whichever of the two sets its [Combat rating](../../design/mechanics/combat.md#combatant-condition-in-a-combat). |

# Method

Every run played the Standard [Campaign configuration preset](../../design/foundation/game-data-records.md#glossary) on 20 [Campaigns](../../design/foundation/core-concepts.md#campaign-and-session) of the seeds `lab-1` to `lab-20` and on 20 of `two-1` to `two-20`, each for up to 400 [Turns](../../design/foundation/engine-contract.md#player-actions-and-turns) or until its [Campaign ending](../../design/mechanics/domain-model.md#campaign-standing), and the kept change also for up to 500. The Current baseline was `game-v5-impl-web` at commit `09d9144`, played from a worktree because the main clone held another session's uncommitted work. Each change is a commit of the study branch `bd0b-improve-autopilot-ai-20261127-0430`, played alone on the same seeds, since a Campaign plays the same with the same seed. The [Combats](../../design/mechanics/domain-model.md#combat) were read from each run's `summary.json` and their [Combat setup seeds](../../design/mechanics/combat.md#combat-rounds-and-results). A run took 63 to 103 seconds on 31 threads.

# Review of current performance

The Current baseline wins nearly three Campaigns in four and loses the rest late, mostly to existential operations.

| Question | Current baseline over the 40 Campaigns |
| --- | --- |
| Does any Campaign end in Victory? | 29, 16 of the `lab` seeds and 13 of the `two` seeds. |
| When does it end? | At Turn 331 (293–358) on the `lab` seeds and 332 (294–346) on the `two` seeds, median (p25–p75). |
| Why does it lose? | 9 by an existential operation not stopped, 2 by [Panic](../../design/mechanics/domain-model.md#campaign-standing) at the limit. |
| How far does it get? | The HQ is raided in 95% of Campaigns on the `lab` seeds and 85% on the `two` seeds, first at Turn 247 to 254 median. |
| How many Combats does it win? | 97.1% of 4,310; 92.8% of those that began between 120% and 150% of the Enemies' [Combat rating](../../design/mechanics/combat.md#combat-rating), and over 99% above 150%. |

# Flaws and root causes

Two mechanisms explain most defeats and the highest-rated losses.

- **An existential site expires for want of Agents, not of strength.** In 6 of the 9 existential defeats, `defend_against_hq_assault`, with 100 Enemies and so 50 Agents needed, expired while the Deployable Agents rated 140% to 414% of its Enemies but numbered 23 to 48, e.g. `two-16` at Turn 295 with 46 of 50 at 414%, and `lab-5` at Turn 273 with 39 of 50 at 300%. The [Agency](../../design/mechanics/domain-model.md#agency-and-agents) then had about 100 Agents, a [Transport cap](../../design/mechanics/economy-and-upgrades.md#glossary) of 56 to 72, over 600,000 money, and about 43 Agents on [Contracting](../../design/mechanics/agents-spec.md#assignments). The Strike goal took both its Combat rating and its Enemies from `raid_hq`, the stronger Next rung, whose fewer Enemies ask for fewer Agents, so the [Strike team](../../design/autopilot-ais/basic-autopilot-ai.md#glossary) was sized for about 29 Agents and no plan kept 50 in base. Of the other 3 existential defeats, 2 came from an Agency too weak for its level 5 site, e.g. `two-13` at 25% at Turn 154, and 1 from a Combat Lost at 123%, `lab-20` at Turn 235.
- **The highest-rated losses pit unarmored Agents against armored Enemies.** The table below holds the five Combats not Won at the highest ratio. In four of them one [Agent](../../design/mechanics/domain-model.md#agency-and-agents) carries most of the team's [base skill](../../design/mechanics/agents-spec.md#combatant-attributes), and in all five most Agents wear no Armor and carry Weapons of 8 to 20 damage against soldiers and lieutenants of 20 and 25 Armor. The Combat rating weighs a Weapon's damage against a rating base, not against the Enemies' Armor, so those Agents rate higher than they fight.

## Top losses by Combat rating ratio

The five Combats of the Current baseline not Won at the highest ratio of the Agents' Combat rating to the Enemies' at [Combat start](../../design/mechanics/combat.md#combat-rounds-and-results), every one of them Retreated.

| Ratio | Campaign, Turn | Mission site | Agents against Enemies | Outcome | Suspected root cause | Combat setup seed |
| --- | --- | --- | --- | --- | --- | --- |
| 210% | `lab-3`, 255 | `foil_vip_assassination` | 4 against 7 | Retreated in 5 rounds, 2 dead | One Agent of base skill 1,279 carries 70% of the team; the other three of about 190 are at [exhaustion](../../design/mechanics/agents-spec.md#combatant-attributes) 70, just below the [exhaustion factor](../../design/mechanics/combat.md#combatant-condition-in-a-combat), and none wears Armor against 2 soldiers and a lieutenant. | `cs1-eyJiIjoiZGV2IiwicyI6Im1lOWE3NjAwMWNhZmYzMzcxIiwibSI6eyJwaXN0b2xfYW1tbyI6MzU3MiwicmlmbGVfYW1tbyI6MTgwMSwibWFjaGluZV9ndW5fYW1tbyI6MTIyNSwibGFzZXJfcGlzdG9sX2JhdHRlcnkiOjU5MywibGFzZXJfcmlmbGVfYmF0dGVyeSI6ODB9LCJhIjpbWzEsMTI3OTAwLDMwMDAsMzAsMzIwMCwyMiwwLCJsYXNlcl9waXN0b2wiLCJzdGFuZGFyZF91bmlmb3JtIl0sWzEsMTg2MDAsMzAwMCwzMCw3MDAwLDIwLDAsIm1hY2hpbmVfZ3VuIiwic3RhbmRhcmRfdW5pZm9ybSJdLFsxLDE5MjAwLDMwMDAsMzAsNzAwMCwyMCwwLCJtYWNoaW5lX2d1biIsInN0YW5kYXJkX3VuaWZvcm0iXSxbMSwxODQwMCwzMDAwLDMwLDcwMDAsMjAsMCwibWFjaGluZV9ndW4iLCJzdGFuZGFyZF91bmlmb3JtIl1dLCJlIjpbWzIsMTIwMDAsMzAwMCwzMCwwLDE0LDIwLCJyaWZsZSIsInNvbGRpZXIiXSxbNCw4MDAwLDI1MDAsMjUsMCwxMCw1LCJjb21iYXRfcGlzdG9sIiwiaGFuZGxlciJdLFsxLDE0MDAwLDMwMDAsMzAsMCwxNiwyNSwiYXVnbWVudGVkX3JpZmxlIiwibGlldXRlbmFudCJdXX0` |
| 167% | `two-2`, 327 | `intercept_arms_deal` | 17 against 29 | Retreated in 4 rounds, 14 dead | One Agent of base skill 2,495 and 16 of 100 with no Armor and Weapons of 8 to 16 damage, against 10 soldiers of 20 Armor and 3 lieutenants of 25. | `cs1-eyJiIjoiZGV2IiwicyI6Im04Y2JkYmQ5NGJmYzRhMzRiIiwibSI6eyJwaXN0b2xfYW1tbyI6NDMyMSwicmlmbGVfYW1tbyI6Mjc5MywibWFjaGluZV9ndW5fYW1tbyI6MTIxNSwibGFzZXJfcGlzdG9sX2JhdHRlcnkiOjEwNjAsImxhc2VyX3JpZmxlX2JhdHRlcnkiOjI2MH0sImEiOltbMSwyNDk1MDAsMzAwMCwzMCw5MDAsMzIsNSwiYXVnbWVudGVkX2xhc2VyX3JpZmxlIiwicGFkZGVkX2phY2tldCJdLFs0LDEwMDAwLDMwMDAsMzAsMCwxNiwwLCJhdWdtZW50ZWRfcmlmbGUiLCJzdGFuZGFyZF91bmlmb3JtIl0sWzQsMTAwMDAsMzAwMCwzMCwwLDE0LDAsInJpZmxlIiwic3RhbmRhcmRfdW5pZm9ybSJdLFs0LDEwMDAwLDMwMDAsMzAsMCwxMCwwLCJjb21iYXRfcGlzdG9sIiwic3RhbmRhcmRfdW5pZm9ybSJdLFs0LDEwMDAwLDMwMDAsMzAsMCw4LDAsImJhc2ljX3Bpc3RvbCIsInN0YW5kYXJkX3VuaWZvcm0iXV0sImUiOltbNCw0MDAwLDIwMDAsMjAsMCw4LDAsImJhc2ljX3Bpc3RvbCIsImluaXRpYXRlIl0sWzgsNjAwMCwyNTAwLDI1LDAsMTAsMCwiY29tYmF0X3Bpc3RvbCIsIm9wZXJhdGl2ZSJdLFsxMCwxMjAwMCwzMDAwLDMwLDAsMTQsMjAsInJpZmxlIiwic29sZGllciJdLFs0LDgwMDAsMjUwMCwyNSwwLDEwLDUsImNvbWJhdF9waXN0b2wiLCJoYW5kbGVyIl0sWzMsMTQwMDAsMzAwMCwzMCwwLDE2LDI1LCJhdWdtZW50ZWRfcmlmbGUiLCJsaWV1dGVuYW50Il1dfQ` |
| 159% | `lab-19`, 216 | `intercept_arms_deal` | 18 against 29 | Retreated in 6 rounds, 14 dead | Two Agents of base skill 1,502 and 900 and 16 of 100 to 162, all but one without Armor, against the same armored Enemies. | `cs1-eyJiIjoiZGV2IiwicyI6Im05ODgzZmMyZDRlNzNjNjllIiwibSI6eyJwaXN0b2xfYW1tbyI6MjQwNCwicmlmbGVfYW1tbyI6MTQxMCwibWFjaGluZV9ndW5fYW1tbyI6MTA1NSwibGFzZXJfcGlzdG9sX2JhdHRlcnkiOjQyMCwibGFzZXJfcmlmbGVfYmF0dGVyeSI6NDB9LCJhIjpbWzEsMTUwMTUwLDMwMDAsMzAsODAwLDI4LDIwLCJsYXNlcl9yaWZsZSIsImJhbGxpc3RpY192ZXN0Il0sWzEsODk5NTAsMzAwMCwzMCw3MDAsMjAsMCwibWFjaGluZV9ndW4iLCJzdGFuZGFyZF91bmlmb3JtIl0sWzEsMTYyMDAsMzAwMCwzMCwxMDAsMjAsMCwibWFjaGluZV9ndW4iLCJzdGFuZGFyZF91bmlmb3JtIl0sWzQsMTAwMDAsMzAwMCwzMCwwLDE2LDAsImF1Z21lbnRlZF9yaWZsZSIsInN0YW5kYXJkX3VuaWZvcm0iXSxbNCwxMDAwMCwzMDAwLDMwLDAsMTQsMCwicmlmbGUiLCJzdGFuZGFyZF91bmlmb3JtIl0sWzQsMTAwMDAsMzAwMCwzMCwwLDEwLDAsImNvbWJhdF9waXN0b2wiLCJzdGFuZGFyZF91bmlmb3JtIl0sWzMsMTAwMDAsMzAwMCwzMCwwLDgsMCwiYmFzaWNfcGlzdG9sIiwic3RhbmRhcmRfdW5pZm9ybSJdXSwiZSI6W1s0LDQwMDAsMjAwMCwyMCwwLDgsMCwiYmFzaWNfcGlzdG9sIiwiaW5pdGlhdGUiXSxbOCw2MDAwLDI1MDAsMjUsMCwxMCwwLCJjb21iYXRfcGlzdG9sIiwib3BlcmF0aXZlIl0sWzEwLDEyMDAwLDMwMDAsMzAsMCwxNCwyMCwicmlmbGUiLCJzb2xkaWVyIl0sWzQsODAwMCwyNTAwLDI1LDAsMTAsNSwiY29tYmF0X3Bpc3RvbCIsImhhbmRsZXIiXSxbMywxNDAwMCwzMDAwLDMwLDAsMTYsMjUsImF1Z21lbnRlZF9yaWZsZSIsImxpZXV0ZW5hbnQiXV19` |
| 156% | `two-2`, 243 | `intercept_arms_deal` | 19 against 29 | Retreated in 5 rounds, 14 dead | One Agent of base skill 1,482 and two of about 600, all at exhaustion 41 or 42, and 16 of 100 with machine guns and no Armor, against the same armored Enemies. | `cs1-eyJiIjoiZGV2IiwicyI6Im05YjY2NjcxNzA2MDFjOGM4IiwibSI6eyJwaXN0b2xfYW1tbyI6Mjg5OCwicmlmbGVfYW1tbyI6MTk0NSwibWFjaGluZV9ndW5fYW1tbyI6MTc0MCwibGFzZXJfcGlzdG9sX2JhdHRlcnkiOjU2MCwibGFzZXJfcmlmbGVfYmF0dGVyeSI6NjB9LCJhIjpbWzEsMTQ4MjAwLDMwMDAsMzAsNDIwMCwyOCw1LCJsYXNlcl9yaWZsZSIsInBhZGRlZF9qYWNrZXQiXSxbMSw1OTMwMCwzMDAwLDMwLDQxMDAsMjAsMCwibWFjaGluZV9ndW4iLCJzdGFuZGFyZF91bmlmb3JtIl0sWzEsNjAxMDAsMzAwMCwzMCw0MTAwLDIwLDAsIm1hY2hpbmVfZ3VuIiwic3RhbmRhcmRfdW5pZm9ybSJdLFsxNiwxMDAwMCwzMDAwLDMwLDAsMjAsMCwibWFjaGluZV9ndW4iLCJzdGFuZGFyZF91bmlmb3JtIl1dLCJlIjpbWzQsNDAwMCwyMDAwLDIwLDAsOCwwLCJiYXNpY19waXN0b2wiLCJpbml0aWF0ZSJdLFs4LDYwMDAsMjUwMCwyNSwwLDEwLDAsImNvbWJhdF9waXN0b2wiLCJvcGVyYXRpdmUiXSxbMTAsMTIwMDAsMzAwMCwzMCwwLDE0LDIwLCJyaWZsZSIsInNvbGRpZXIiXSxbNCw4MDAwLDI1MDAsMjUsMCwxMCw1LCJjb21iYXRfcGlzdG9sIiwiaGFuZGxlciJdLFszLDE0MDAwLDMwMDAsMzAsMCwxNiwyNSwiYXVnbWVudGVkX3JpZmxlIiwibGlldXRlbmFudCJdXX0` |
| 152% | `lab-15`, 84 | `foil_sabotage` | 4 against 7 | Retreated in 4 rounds, none dead | Four Agents of base skill 156 to 420 with rifles and no Armor against 2 soldiers of 20 Armor; with no strong Agent, the retreat rule more likely met a run of misses than a weak team. | `cs1-eyJiIjoiZGV2IiwicyI6Im04ZTY0MzkzNDhlYzFkNzExIiwibSI6eyJwaXN0b2xfYW1tbyI6Nzc3LCJyaWZsZV9hbW1vIjo1MjAsIm1hY2hpbmVfZ3VuX2FtbW8iOjAsImxhc2VyX3Bpc3RvbF9iYXR0ZXJ5IjowLCJsYXNlcl9yaWZsZV9iYXR0ZXJ5IjowfSwiYSI6W1sxLDQyMDAwLDMwMDAsMzAsMCwxNiwwLCJhdWdtZW50ZWRfcmlmbGUiLCJzdGFuZGFyZF91bmlmb3JtIl0sWzEsMjE0MDAsMzAwMCwzMCwwLDE0LDAsInJpZmxlIiwic3RhbmRhcmRfdW5pZm9ybSJdLFsxLDE2MzAwLDMwMDAsMzAsNDAwLDE0LDAsInJpZmxlIiwic3RhbmRhcmRfdW5pZm9ybSJdLFsxLDE1NjAwLDMwMDAsMzAsMjcwMCwxNCwwLCJyaWZsZSIsInN0YW5kYXJkX3VuaWZvcm0iXV0sImUiOltbMiw0MDAwLDIwMDAsMjAsMCw4LDAsImJhc2ljX3Bpc3RvbCIsImluaXRpYXRlIl0sWzIsNjAwMCwyNTAwLDI1LDAsMTAsMCwiY29tYmF0X3Bpc3RvbCIsIm9wZXJhdGl2ZSJdLFsyLDEyMDAwLDMwMDAsMzAsMCwxNCwyMCwicmlmbGUiLCJzb2xkaWVyIl0sWzEsODAwMCwyNTAwLDI1LDAsMTAsNSwiY29tYmF0X3Bpc3RvbCIsImhhbmRsZXIiXV19` |

## Detectors

Three Detectors flag Campaigns, none of them an AI defect on reading.

- The Strike team is short of its Strike goal for 50 Turns or more in a row in 39 of 40 Campaigns, e.g. `lab-20` for 155 Turns: the goal looks a [Faction operation level](../../design/mechanics/factions.md#glossary) ahead, so the Agency is short of it until it catches up, at about Turn 150.
- An [Upgrade](../../design/mechanics/domain-model.md#agency-and-agents) is bought 3 or more times in a Turn in 22 of 40 Campaigns, e.g. `lab-5` with `training_cap` bought 3 times in Turn 143, when money allows several acquisitions of a cap at once.
- Projected income stays below upkeep for 10 Turns or more in 2 Campaigns, e.g. `two-20` for 25 Turns, whose money never fell below 440 and which ended in Victory.

# Improvements

The study tried two changes to the Strike team, in this order, leaving the Combat margin and the team for an existential site as they are.

| Change | Victories, `lab` and `two` seeds | Defeats, existential and Panic | Still played at the last Turn | Kept |
| --- | --- | --- | --- | --- |
| Current baseline, 400 Turns | 16, 13 | 9, 2 | 0 | — |
| The Strike team keeps the Rest share above the Agents it asks for, and money over 100 Turns of upkeep lifts the [Contracting cap](../../design/mechanics/economy-and-upgrades.md#glossary) from it; `lab` seeds only | 12 of 20, against 16 | 6, 0 | 2 | No |
| Strike count change, 400 Turns | 16, 11 | 1, 3 | 9 | Yes |
| Strike count change, 500 Turns | 19, 17 | 1, 3 | 0 | Yes |

The first change is rejected: it lost more Campaigns on the `lab` seeds, and the Strike team it sized was still too small for `defend_against_hq_assault`, because the Strike goal still asked for the Agents of `raid_hq`. Its commit is reverted on the study branch.

The Strike count change is proposed. It cut the existential defeats from 9 to 1 and the defeats from 11 to 4 on the same seeds; the Campaigns it kept alive took longer, so 9 were still played at Turn 400, and by Turn 500 it won 36 of 40. In [Basic Autopilot AI](../../design/autopilot-ais/basic-autopilot-ai.md#glossary), it would make the [Strike team size](../../design/autopilot-ais/basic-autopilot-ai.md#glossary) count the Agents needed for the more numerous Enemies of the Threat and the weakest Next rung, while the Strike goal keeps the stronger Combat rating of the two.

# Experimental results

The proposed AI loses far fewer Campaigns than the Current baseline and wins more of them, though later.

| Question                                  | Current baseline             | Proposed AI, 500 Turns       |
| ----------------------------------------- | ---------------------------- | ---------------------------- |
| Victories of 40                           | 29                           | 36                           |
| Defeats, existential and Panic            | 9, 2                         | 1, 3                         |
| Turn of the ending, `lab` and `two` seeds | 331 (293–358), 332 (294–346) | 349 (334–378), 351 (292–405) |
| Combats Won                               | 97.1% of 4,310               | 96.5% of 4,921               |

Against the [Autopilot AI Expectations](../../design/autopilot-ais/autopilot-ai-expectations.md), both meet [Expectation](../../design/autopilot-ais/autopilot-ai-expectations.md#glossary) 1, with 29 and 36 Victories of 40, and Expectation 3, with the Combat margin of 120%. Both fail Expectation 2: no Victory had a [Loss share](../../design/autopilot-ais/autopilot-ai-expectations.md#glossary) of 20% or more, the median being 11% to 13%.

# Game balance remarks

Two findings concern the game rather than the AI, because no choice of team avoids them.

- **The Combat rating ignores Armor against Weapon damage.** Agents with Weapons of 8 to 20 damage and no Armor rate as if they fought at full strength against Enemies of 20 and 25 Armor, and all five top losses had such Agents, e.g. `lab-19` at Turn 216 with 14 Agents dead. A [rating factor](../../design/mechanics/combat.md#combatant-condition-in-a-combat) that weighs a side's Weapon damage against the other side's mean Armor, or a [Combat rating](../../design/mechanics/combat.md#combat-rating) health term that counts Armor more, is the change to try.
- **`raid_hq` is lost often late in a Campaign.** Campaigns still played at Turn 400 under the Strike count change had raided 2 or 3 HQs and lost up to 5 HQ raids, e.g. `lab-8` with 2 Won and 5 Lost, so the last HQ decides how long a Campaign takes.
