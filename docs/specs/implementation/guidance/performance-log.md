# Performance Log

| Metadata | Value |
| --- | --- |
| Spec ID | PERFLOG |
| Family | Guidance |
| Audience | Engine designer, Implementer |
| Owns | The record of every Performance change considered for the current Implementation and its tools, with its status, reasons, Estimated and Observed gains, and commits, so that each Applied one can be reverted. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Implementation Specification Conventions](../../governance/conventions/implementation-spec-conventions.md) |

# Overview

Each Performance investigation adds a section, the latest last, and the rows of its [Performance changes](implementation-performance.md#glossary) change only their [Performance change status](implementation-performance.md#glossary), reasons, gains, and commits afterwards. How the gains are measured and what a row records are under [Implementation Performance](implementation-performance.md#recording-a-performance-change).

Every Applied Performance change adds code that a game with far fewer Agents and Upgrades would not need. The surest way to keep Turns fast is suggested to be fewer Agents and fewer Player actions per Turn, e.g. fewer and larger Upgrades; with few enough of both, the Applied changes can be reverted to make the code simpler.

# Glossary

| Term | Definition |
| --- | --- |
| Performance Tier 1 | The [Performance changes](implementation-performance.md#glossary) of the [Autopilot](../../design/foundation/engine-contract.md#autopilot) [Turn](../../design/foundation/engine-contract.md#player-actions-and-turns) investigation that alter no specification: each [Player action](../../design/foundation/engine-contract.md#player-actions-and-turns) costs less, and every [Campaign](../../design/foundation/core-concepts.md#campaign-and-session) plays out exactly as before. |
| Performance Tier 2 | The Performance changes of the Autopilot Turn investigation that altered specifications: a Turn needs fewer full reads of the [Current world state](../../design/foundation/engine-contract.md#player-actions-and-turns) and fewer commits. |

# Autopilot Turn investigation, 2026-11-21

The Game designer found that Turns played by the [Basic Autopilot AI](../../design/autopilot-ais/basic-autopilot-ai.md) grew slow as the [Agency](../../design/mechanics/domain-model.md#agency-and-agents) grew. Profiling showed the rules of Advance turn took about 4% of the time and the [Per-action cost](implementation-performance.md#glossary) the rest.

- **T3 thread:** Speed Up Autopilot Turn Performance, `3bcde20e-372a-4a94-93ba-2c69831310ce`, 2026-11-21 to 2026-11-22.
- **Artifacts:** [Autopilot Speed-up Plan](https://claude.ai/artifact/VFaA2KENgokxxsA68xjuFJ), with the profile of one Player action and the estimated against the observed gains of each tier; [Autopilot Turn Growth](https://claude.ai/artifact/Dp6eyvbNYzUvs15CdSTBFP), with the time per Turn up to 3,580 Agents and the share and growth of each remaining cost.
- **Benchmark:** the Autopilot benchmark of [Measuring a Performance change](implementation-performance.md#measuring-a-performance-change). The Basic Autopilot AI was rewritten during the investigation, so the estimates come from an earlier benchmark of the same seed, 130 Turns and about 1,200 Agents, which took 22.0 s.

| Measurement | Before Performance Tier 1 | Performance Tier 1 | Performance Tiers 1 and 2 |
| --- | --- | --- | --- |
| Autopilot benchmark | 17.7 s | 5.1 s | 1.9 s |
| Estimated | 22.0 s | 5.3 s, 4.2× | 2.9 s, 7.6× |
| Observed |  | 3.5×; 4.9× in its own run, 38.1 s → 7.8 s, median of three | 9.3× overall; 2.7× on top of Performance Tier 1 |

## Performance Tier 1: cheaper Player actions

Performance Tier 1 is Applied in one commit of the [Implementation repo](../mandatory/implementation-placement.md#glossary), [`173acdcae0c642b80fa605216df52e3383868308`](https://github.com/konrad-jamrozik/game-v5-impl-web/commit/173acdcae0c642b80fa605216df52e3383868308), on 2026-11-22, and changes no specification. Its changes were measured together, so each row's [Estimated gain](implementation-performance.md#glossary) is the share of the earlier benchmark's time that the cost it removes took.

| Performance change | Subsystem | Status | Estimated gain | Where | What it does |
| --- | --- | --- | --- | --- | --- |
| Cached [Agent](../../design/mechanics/domain-model.md#agency-and-agents) views | Engine views | Applied | Most of 35%, the AI's full reads | `src/engine/views/views.ts`, `agentViews` | Keeps each Agent's frozen view in a `WeakMap` keyed by the Agent object, reused while the GDRs, the health recovery rate, and the [Upgrade bonus](../../design/mechanics/economy-and-upgrades.md#glossary) are unchanged. A commit that changes an Agent replaces its object, so a stale view is never found. |
| Incremental whole-number invariant | Engine commit | Applied | Most of 24%, the invariant check | `src/kernel/values.ts`, `findNonWholeNumber` | Remembers in a `WeakSet` the frozen objects, with every object under them frozen too, whose numbers are all whole, so each commit walks only the objects it created rather than the whole [Campaign state](../../design/foundation/core-concepts.md#campaign-and-session). |
| Cheap Save size check | [Campaign saves](../../design/foundation/engine-contract.md#persisted-data) | Applied | Part of 18%, the [Current Autosave](../../design/foundation/saves.md#autosave-kinds) | `src/engine/session/core.ts`, `writeSave` | Counts the UTF-8 bytes of a [Campaign save](../../design/foundation/engine-contract.md#persisted-data) only when its text is longer than a third of the [Save size limit](../../design/foundation/saves.md#save-size-limit), since one UTF-16 code unit takes at most 3 bytes. |
| Hiring counts without drafts | Engine actions | Applied | Part of 15%, Immer | `src/engine/actions/actions.ts`, hiring | Counts [Serving](../../design/mechanics/agents-spec.md#agent-statuses) Agents on the state the action started from, through Immer's `original`, rather than through a draft for each Agent. |
| Won [Mission](../../design/mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) index | Engine actions | Applied | Part of 15%, Immer | `src/engine/mechanics/conditions/conditions.ts`, `src/engine/mechanics/leads/leads.ts` | Lead discovery reads the Won Missions once for all [Leads](../../design/mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), as `wonMissionIndex`, instead of once for each `mission_won` [Condition](../../design/foundation/conditions.md#glossary). |
| Sorting by an index map | Advance turn | Applied | Not estimated; a sort was quadratic in the Agents | `src/engine/turn/advance.ts`, `sortByKeyOrder` | Advance turn sorts report items by a map of the order of Agents and [Mission sites](../../design/mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) instead of searching the keys inside every comparison. |

Reverting Performance Tier 1 is suggested to come after reverting Performance Tier 2, because Performance Tier 2's Action results find the changed Agents through the Cached Agent views. Each row can also be reverted alone, since none changes a result. A later commit may have changed the same files, so `git revert` can conflict; the rows name the functions each change added, so a change can also be taken out by hand.

## Performance Tier 2: fewer reads and fewer commits

The Game designer chose Performance Tier 2's changes on 2026-11-22 to remove the AI's full read before every Player action. They are Applied in two commits of the [Spec repo](../mandatory/implementation-placement.md#glossary), [`851e9638a13fc232daf7ebae7cb7810f6079200a`](https://github.com/konrad-jamrozik/game-v5/commit/851e9638a13fc232daf7ebae7cb7810f6079200a) and [`ed6ee402c7ef4dfda4b3ad675829e4a83cdf06ee`](https://github.com/konrad-jamrozik/game-v5/commit/ed6ee402c7ef4dfda4b3ad675829e4a83cdf06ee), and one commit of the Implementation repo, [`92d1d9114f2cb9ec728ce7818291a079ae209afe`](https://github.com/konrad-jamrozik/game-v5-impl-web/commit/92d1d9114f2cb9ec728ce7818291a079ae209afe). Estimated together at 1.8× on top of Performance Tier 1, they were Observed at 2.7×.

| Performance change | Subsystem | Status | Specifications | Implementation | What it does |
| --- | --- | --- | --- | --- | --- |
| Action results | Engine commit | Applied | [Action results](../../design/foundation/player-api.md#action-results) in [Player API](../../design/foundation/engine-contract.md#api-surfaces); the sentence on results under API hierarchy in [Engine Contract](../../design/foundation/engine-contract.md) | `worldStateChanges` in `src/engine/views/views.ts`, wired through `src/engine/rules.ts`, `src/engine/game-rules.ts`, `src/engine/session/core.ts`, and `src/engine/player-api.ts`; `src/ai/world-state-changes.ts` applies them | Every Player action other than Advance turn returns what it changed in what the two [World state](../../design/foundation/engine-contract.md#player-actions-and-turns) queries return, so a caller keeps its query results current without querying again. |
| Batch hiring | Engine actions | Applied | [Hiring Agents](../../design/mechanics/economy-and-upgrades.md#hiring-agents) in Economy and Upgrades, with its edge cases; the History View, Agents View, Charts View, History and Turn Report, and Agents specifications, which name the action | `hireAgents` in `src/engine/actions/actions.ts`, the Hire button, the CLI, the Money flow chart, and the History View lines; Campaign saves that name the old `hireAgent` stay loadable | `hireAgent()` became `hireAgents(count)`, so filling the roster is one Player action, one commit, one invariant check, and one [Current Autosave](../../design/foundation/saves.md#autosave-kinds) instead of one for each Agent. |
| The AI reads once per step | [Autopilot AI](../../design/foundation/engine-contract.md#principals-and-access) | Applied | [Information](../../design/autopilot-ais/basic-autopilot-ai.md#information) and Purchases in Basic Autopilot AI | `src/ai/basic/basic-autopilot-ai.ts` | The Basic Autopilot AI reads both World state queries at the start of each step of its Turn routine and applies the changes its Player actions return, and hires every due Agent in one `hireAgents`. |
| Whole-number arithmetic | Engine actions | Applied | None: [Exact evaluation](../../design/foundation/numbers.md#exact-evaluation) in Numbers already allows any arithmetic that gives the exact result | `floorDivSafe` in `src/kernel/rational.ts`; `effectiveSkill` and `exhaustionOf` in `src/engine/mechanics/agents/agents.ts`; `rateSideInWholeNumbers` in `src/engine/mechanics/combat/combat.ts` | [Effective skill](../../design/mechanics/agents-spec.md#combatant-attributes), [exhaustion](../../design/mechanics/agents-spec.md#combatant-attributes), and the [Combat rating](../../design/mechanics/combat.md#combatant-condition-in-a-combat) of a side are decided in ordinary whole numbers and fall back to Rational and BigInt only outside the safe-integer range. |

Batch hiring is the one change that alters play: hiring one Agent at a time let the earlier steps of the Turn routine act between hires on a larger [Roster size](../../design/autopilot-ais/basic-autopilot-ai.md#glossary) each time, while one `hireAgents` lets them see the new Agents only once all of them are hired. With one hire per Player action instead, the same Campaign ends in the same Campaign state as before Performance Tier 2, in 4.0 s rather than 1.9 s.

Reverting Performance Tier 2 is suggested to start in the Spec repo, with `git revert` of `ed6ee40` and then `851e963`, followed by the `apply` skill, because the Implementation follows its specifications. The Whole-number arithmetic has no specification and is reverted in the Implementation alone, together with `tests/mechanics/whole-number-arithmetic.test.ts`. Reverting Action results alone, while keeping Batch hiring, is possible: the Basic Autopilot AI then reads the World state queries after every Player action again.

## Changes not applied

After Performance Tier 2, a late Turn still grows faster than the Agency. At Turn 234 with 3,580 Agents a Turn took about 750 ms, of which Action results took 44%, invariant checks 18%, and applying actions through Immer 14%, measured in Autopilot Turn Growth. The following Performance changes were found and are not applied.

| Performance change | Subsystem | Status | Reason | Estimated gain |
| --- | --- | --- | --- | --- |
| Incremental Current Autosave: a base record written at the Turn start, a load, or an undo, and one small record appended for each Player action | Campaign saves | Postponed, 2026-11-22 | Needs a change to [Saves](../../design/foundation/saves.md#autosave-kinds) and [Storage Schema](storage-schema.md) and an append operation of [Game storage](../../design/foundation/engine-contract.md#persisted-data) that a half-written record cannot corrupt; the Game designer chose the other Performance Tier 2 changes first | 18% of the earlier benchmark; 3% of a late Turn after Performance Tier 2; also every GUI Player action |
| Keep the encoded [Turn-start state](../../design/foundation/engine-contract.md#player-actions-and-turns) until the next Advance turn | Campaign saves | Proposed | A smaller step toward the Incremental Current Autosave that needs no specification change | Most of the Current Autosave's encoding, not its write |
| Batch [Upgrade](../../design/mechanics/domain-model.md#agency-and-agents) purchases, e.g. `purchaseUpgrades(upgrade, count)` | Engine actions | Proposed | About 15 Upgrade purchases per late Turn, each a Player action that multiplies every Per-action cost; needs a specification change like Batch hiring | Not estimated; the largest, as it cuts the number of Player actions |
| Action results only for the Agents an action touched, and an Upgrade purchase returning the new Upgrade bonus once instead of every Agent | Engine commit | Proposed | Action results grow as about n^2.1 with the Agents; the Upgrade bonus part needs a change to Action results | Most of 44% of a late Turn |
| Invariant checks only of the instances a commit created or changed, with the full check kept for a loaded Campaign save and for tests | Engine commit | Proposed | Every commit loops over every [Campaign instance](../../design/foundation/core-concepts.md#campaign-instances) the Campaign ever had | Most of 18% of a late Turn |
| Counting Agents without draft proxies for the [Training](../../design/mechanics/agents-spec.md#assignments) and [Transport cap](../../design/mechanics/economy-and-upgrades.md#glossary) checks | Engine actions | Proposed | Hiring already counts this way | Part of 14% of a late Turn |

## Autopilot Bench change

The Autopilot Bench in `tools/autopilot-bench/` of the Spec repo had made Campaigns about 45% slower by reading the Current world state around every Player action for its Campaign log, 47 s against 32 s on 130 Turns of seed `1-1`. [`f4c6c03ff9186db39bfcc73651d66a2871880f98`](https://github.com/konrad-jamrozik/game-v5/commit/f4c6c03ff9186db39bfcc73651d66a2871880f98) narrowed the reads to the Player actions that spend money, Observed at 35 s, and [`0bbec00`](https://github.com/konrad-jamrozik/game-v5/commit/0bbec00) dropped the reads, so that the bench reads every Turn of its charts from the [History](../../design/foundation/campaign-state.md#glossary), which the engine keeps anyway. Subsystem: Tools; status: Applied.

# GUI Player action investigation, 2026-11-27

The Game designer found that equipping an Agent with a Weapon through the [Equipment picker](../../design/ui/screens/agents-view.md#equipment-picker) at Turn 244, with 132 Agents, took about 200 ms before the picker closed and 200 ms more before the [Agent details](../../design/ui/screens/agents-view.md#agent-details) showed the new Weapon.

- **T3 thread:** Weapon [Assignment](../../design/mechanics/domain-model.md#agency-and-agents) UI Lag, `f952fe7d-076d-4fae-bf73-9002119903d9`, 2026-11-27.
- **Benchmark:** the GUI action benchmark of [Measuring a Performance change](implementation-performance.md#measuring-a-performance-change), at Turn 226 with 132 Agents, in Node, on `game-v5-impl-web` at `ea0f96f`.

| Cost of one Player action | Measured in Node |
| --- | --- |
| Engine commit of `equipAgent` | About 10 ms: Lead discovery's Won Mission index about 7 ms, the invariant check about 4 ms |
| Current Autosave | 2.2 MiB of text encoded and written for every Player action, awaited before the screen updates |
| One refresh of every query the Campaign screen reads | About 35 ms: available actions 25 ms, which copies the whole World state once for each Upgrade; History 5 ms, which copies every [History entry](../../design/foundation/world-history.md#glossary); [Retired world state](../../design/foundation/campaign-state.md#glossary) 4 ms |
| Refreshes for one Player action | 3: the GUI recomputes every query when its busy state starts, after the commit, and when its busy state ends, because its query cache is also invalidated by GUI-only changes |

The first 200 ms is the refresh that runs in the same render that closes the Equipment picker; the second is the commit, the Current Autosave, and the two later refreshes. No component of the Campaign screen is memoized, so each refresh renders the whole screen, the Agent table included.

| Performance change | Subsystem | Status | Reason | Estimated gain |
| --- | --- | --- | --- | --- |
| Engine queries cached by the engine's revision alone, with the GUI's busy state and notices in a store of their own, and each query computed only when a shown screen reads it | GUI | Proposed | Removes two of the three refreshes, and the queries no shown screen reads | About 70 ms of 105 ms in Node |
| Close the Equipment picker in its own render, and start the Player action in the next frame | GUI | Proposed | Meets the one-frame target for a control that closes; changes no rule, since the picker already closes when a row is chosen | The first 200 ms as perceived |
| Available actions without copies of the World state, by checks that apply no action or by a discarded Immer draft | Engine views | Proposed | One copy of the whole World state for each Upgrade on every refresh | 25 ms to under 1 ms per refresh |
| Views return frozen parts of the Campaign state instead of copies, so an unchanged view keeps its identity, with memoized rows and panels and a virtualized Agent table | Engine views, GUI | Proposed | Copies grow with the History; identity lets React skip unchanged parts | 5 ms per refresh for the History; rendering not measured |
| Current Autosave written after the screen updates, and at most about once a second and when the page is hidden, or only at Advance turn and when the page is hidden | Campaign saves | Proposed | The GUI waits for a 2.2 MiB write; writing less often needs a change to [Saves](../../design/foundation/saves.md#autosave-kinds) | Not measured in the browser; overlaps the Incremental Current Autosave |
| A smaller Campaign save: the Retired world state and the History in records appended once per Turn, the Enemies of Mission sites no longer in play dropped, or older History entries kept in summary | Campaign saves | Proposed | The Campaign save grows every Turn, 2.2 MiB at Turn 226; changes [Saves](../../design/foundation/saves.md) and [Storage Schema](storage-schema.md) | Not estimated |
| Lead discovery only when Missions change, or a Won Mission index kept in the Campaign state | Engine actions | Proposed | Every Player action reads every Mission the Campaign ever had | About 7 ms per Player action |
| Invariant checks only at Advance turn or in [Dev mode](../../design/foundation/engine-contract.md#principals-and-access) and tests | Engine commit | Proposed | An alternative to checking only the changed instances | About 4 ms per Player action |
