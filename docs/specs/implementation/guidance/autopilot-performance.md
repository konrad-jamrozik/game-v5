# Autopilot Performance

| Metadata | Value |
| --- | --- |
| Spec ID | APPERF |
| Family | Guidance |
| Audience | Engine designer, Implementer |
| Owns | Non-behavioural guidance on keeping Turns fast as an Agency grows, and the record of the performance changes made to the current Implementation, with their commits, so that each can be reverted. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Implementation Specification Conventions](../../governance/conventions/implementation-spec-conventions.md) |

# Overview

A Turn played by an [Autopilot AI](../../design/foundation/engine-contract.md#principals-and-access) gets slower as the Agency grows, and faster than the Agency grows. The rules of Advance turn are a small part of it, about 4% before the changes below. Most of the time goes to work that the engine and the [Basic Autopilot AI](../../design/autopilot-ais/basic-autopilot-ai.md) repeat on every [Player action](../../design/foundation/engine-contract.md#player-actions-and-turns), each time over the whole Campaign, while the number of Player actions in a Turn also grows with the Agency. A Turn then costs about the square of the number of Agents.

Two kinds of change answer this. Changes of the first kind make each Player action cheaper without changing any rule; they live in an Implementation alone. Changes of the second kind make a Turn need fewer full reads and fewer commits; they changed specifications. Every change listed here adds code that a game with far fewer Agents and Upgrades would not need, so each is recorded with its commits and with what reverting it involves.

# Glossary

| Term | Definition |
| --- | --- |
| Per-action cost | Work that the engine or an [Autopilot AI](../../design/foundation/engine-contract.md#principals-and-access) does once for every [Player action](../../design/foundation/engine-contract.md#player-actions-and-turns), as opposed to once for every [Turn](../../design/foundation/engine-contract.md#player-actions-and-turns). |
| Performance Tier 1 | The performance changes that alter no specification: each Player action costs less, and every [Campaign](../../design/foundation/core-concepts.md#campaign-and-session) plays out exactly as before. |
| Performance Tier 2 | The performance changes that altered specifications: a Turn needs fewer full reads of the [Current world state](../../design/foundation/engine-contract.md#player-actions-and-turns) and fewer commits. |

# Where the time goes

A Turn's cost is roughly the number of Player actions in it times the Per-action cost, and both grow with the [Agency](../../design/mechanics/domain-model.md#agency-and-agents). The following wall-clock times on one machine, of the Basic Autopilot AI with the [Tuning parameters](../../design/autopilot-ais/basic-autopilot-ai.md#glossary) shown, compare versions rather than promise speeds.

| Measurement | Before Performance Tier 1 | Performance Tier 1 | Performance Tiers 1 and 2 |
| --- | --- | --- | --- |
| 130 Turns from seed `1-1`, Reserve share 10%, Investigator share 10%, Cap share 30%, about 1,000 Agents at the end | 17.7 s | 5.1 s | 1.9 s |

After Performance Tier 2, a late Turn still grows faster than the Agency, because some Per-action costs remain proportional to the Campaign and the number of [Upgrade](../../design/mechanics/domain-model.md#agency-and-agents) purchases in a Turn grows with income. The surest way to keep Turns fast is suggested to be fewer Agents and fewer Player actions per Turn, e.g. fewer and larger Upgrades. With few enough of both, the changes below can be reverted to make the code simpler.

# Performance Tier 1: cheaper Player actions

Performance Tier 1 is one commit of the [Implementation repo](../mandatory/implementation-placement.md#glossary), [`173acdcae0c642b80fa605216df52e3383868308`](https://github.com/konrad-jamrozik/game-v5-impl-web/commit/173acdcae0c642b80fa605216df52e3383868308), and changes no specification.

| Change | Where | What it does |
| --- | --- | --- |
| Cached [Agent](../../design/mechanics/domain-model.md#agency-and-agents) views | `src/engine/views/views.ts`, `agentViews` | Keeps each Agent's frozen view in a `WeakMap` keyed by the Agent object, reused while the GDRs, the health recovery rate, and the [Upgrade bonus](../../design/mechanics/economy-and-upgrades.md#glossary) are unchanged. A commit that changes an Agent replaces its object, so a stale view is never found. The Upgrade bonus is computed once for each view rather than once for each Agent. |
| Incremental whole-number invariant | `src/kernel/values.ts`, `findNonWholeNumber` | Remembers in a `WeakSet` the frozen objects, with every object under them frozen too, whose numbers are all whole, so each commit walks only the objects it created rather than the whole [Campaign state](../../design/foundation/core-concepts.md#campaign-and-session), the [History](../../design/foundation/campaign-state.md#glossary) included. |
| Cheap Save size check | `src/engine/session/core.ts`, `writeSave` | Counts the UTF-8 bytes of a [Campaign save](../../design/foundation/engine-contract.md#persisted-data) only when its text is longer than a third of the [Save size limit](../../design/foundation/saves.md#save-size-limit), since one UTF-16 code unit takes at most 3 bytes. |
| Hiring counts without drafts | `src/engine/actions/actions.ts`, hiring | Counts [Serving](../../design/mechanics/agents-spec.md#agent-statuses) Agents on the state the action started from, through Immer's `original`, rather than through a draft for each Agent. |
| Won [Mission](../../design/mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) index | `src/engine/mechanics/conditions/conditions.ts`, `src/engine/mechanics/leads/leads.ts` | Lead discovery reads the Won Missions once for all [Leads](../../design/mechanics/domain-model.md#leads-investigations-mission-sites-and-missions), as `wonMissionIndex`, instead of once for each `mission_won` [Condition](../../design/foundation/conditions.md#glossary). |
| Sorting by an index map | `src/engine/turn/advance.ts`, `sortByKeyOrder` | Advance turn sorts report items by a map of the order of Agents and [Mission sites](../../design/mechanics/domain-model.md#leads-investigations-mission-sites-and-missions) instead of searching the keys inside every comparison. |

Reverting Performance Tier 1 is suggested to come after reverting Performance Tier 2, because Performance Tier 2's Action results find the changed Agents through the Cached Agent views. Each row can also be reverted alone, since none changes a result: every Campaign ends in the same Campaign state with or without it, and the Implementation's tests pass unchanged apart from those the change added. A later commit may have changed the same files, so `git revert` can conflict; the table rows name the functions each change added, so a change can also be taken out by hand.

# Performance Tier 2: fewer reads and fewer commits

Performance Tier 2 changed specifications in two commits of the [Spec repo](../mandatory/implementation-placement.md#glossary), [`851e9638a13fc232daf7ebae7cb7810f6079200a`](https://github.com/konrad-jamrozik/game-v5/commit/851e9638a13fc232daf7ebae7cb7810f6079200a) and [`ed6ee402c7ef4dfda4b3ad675829e4a83cdf06ee`](https://github.com/konrad-jamrozik/game-v5/commit/ed6ee402c7ef4dfda4b3ad675829e4a83cdf06ee), and was implemented in one commit of the Implementation repo, [`92d1d9114f2cb9ec728ce7818291a079ae209afe`](https://github.com/konrad-jamrozik/game-v5-impl-web/commit/92d1d9114f2cb9ec728ce7818291a079ae209afe).

| Change | Specifications | Implementation | What it does |
| --- | --- | --- | --- |
| Action results | [Action results](../../design/foundation/player-api.md#action-results) in [Player API](../../design/foundation/engine-contract.md#api-surfaces); the sentence on results under API hierarchy in [Engine Contract](../../design/foundation/engine-contract.md) | `worldStateChanges` in `src/engine/views/views.ts`, wired through `src/engine/rules.ts`, `src/engine/game-rules.ts`, `src/engine/session/core.ts`, and `src/engine/player-api.ts`; `src/ai/world-state-changes.ts` applies them | Every Player action other than Advance turn returns what it changed in what the two [World state](../../design/foundation/engine-contract.md#player-actions-and-turns) queries return, so a caller keeps its query results current without querying again. |
| Batch hiring | [Hiring Agents](../../design/mechanics/economy-and-upgrades.md#hiring-agents) in Economy and Upgrades, with its edge cases; the History View, Agents View, Charts View, History and Turn Report, and Agents specifications, which name the action | `hireAgents` in `src/engine/actions/actions.ts`, the Hire button, the CLI, the Money flow chart, and the History View lines; Campaign saves that name the old `hireAgent` stay loadable | `hireAgent()` became `hireAgents(count)`, so filling the roster is one Player action, one commit, one invariant check, and one [Current Autosave](../../design/foundation/saves.md#autosave-kinds) instead of one for each Agent. |
| The AI reads once per step | [Information](../../design/autopilot-ais/basic-autopilot-ai.md#information) and Purchases in Basic Autopilot AI | `src/ai/basic/basic-autopilot-ai.ts` | The Basic Autopilot AI reads both World state queries at the start of each step of its Turn routine and applies the changes its Player actions return, and hires every due Agent in one `hireAgents`. |
| Whole-number arithmetic | None: [Exact evaluation](../../design/foundation/numbers.md#exact-evaluation) in Numbers already allows any arithmetic that gives the exact result | `floorDivSafe` in `src/kernel/rational.ts`; `effectiveSkill` and `exhaustionOf` in `src/engine/mechanics/agents/agents.ts`; `rateSideInWholeNumbers` in `src/engine/mechanics/combat/combat.ts` | [Effective skill](../../design/mechanics/agents-spec.md#combatant-attributes), [exhaustion](../../design/mechanics/agents-spec.md#combatant-attributes), and the [Combat rating](../../design/mechanics/combat.md#combatant-condition-in-a-combat) of a side are decided in ordinary whole numbers and fall back to Rational and BigInt only outside the safe-integer range. |

Batch hiring is the one change that alters play: hiring one Agent at a time let the earlier steps of the Turn routine act between hires on a larger [Roster size](../../design/autopilot-ais/basic-autopilot-ai.md#glossary) each time, while one `hireAgents` lets them see the new Agents only once all of them are hired. With one hire per Player action instead, the same Campaign ends in the same Campaign state as before Performance Tier 2, in 4.0 s rather than 1.9 s.

Reverting Performance Tier 2 is suggested to start in the Spec repo, with `git revert` of `ed6ee40` and then `851e963`, followed by the `apply` skill, because the Implementation follows its specifications. The Whole-number arithmetic has no specification and is reverted in the Implementation alone, together with `tests/mechanics/whole-number-arithmetic.test.ts`. Reverting Action results alone, while keeping Batch hiring, is possible: the Basic Autopilot AI then reads the World state queries after every Player action again.

# Autopilot Bench changes

The [Autopilot](../../design/foundation/engine-contract.md#autopilot) Bench in `tools/autopilot-bench/` of the Spec repo reads the Current world state only around the Player actions that spend money, because reading it around every Player action made Campaigns about 45% slower; this came with the Write log option in [`f4c6c03ff9186db39bfcc73651d66a2871880f98`](https://github.com/konrad-jamrozik/game-v5/commit/f4c6c03ff9186db39bfcc73651d66a2871880f98). Its Campaign log is written only when Write log is on.
