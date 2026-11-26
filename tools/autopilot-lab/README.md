# Autopilot Lab

A command-line tool that plays many Campaigns with the Basic Autopilot AI, headless and in parallel, and prints one compact summary of them. It is built for an agent: one command, a few hundred lines of Markdown back, and the same seeds every time, so that one change can be measured against its baseline. The [Autopilot Bench](../autopilot-bench/README.md) is the same idea for a human watching a page.

A run of the Lab is a Balancing run under [Campaign Tests](../../docs/specs/implementation/mandatory/campaign-tests.md#balancing-runs): an agent makes one only when the Game designer asks, and reports its results in chat or an Artifact, never in a specification, the code, a test, or a commit message. The `autopilot-lab` skill in `.claude/skills/` says how to use it.

It is not a specification and not part of any Implementation. It writes nothing to either repository; its records go to a folder outside them.

## Run it

It needs a clone of the Implementation repo `game-v5-impl-web` with its dependencies installed, by default the sibling of this repository's main local clone, also when run from a worktree. From the repository root:

```bash
npm run autopilot:lab -- --campaigns 20 --turns 400
npm run autopilot:lab -- --campaigns 20 --turns 400 --vs combatMarginPct=120,researchTeamSize=4
npm run autopilot:lab -- --campaigns 20 --turns 400 --impl-b <another game-v5-impl-web clone or worktree>
```

| Option | Default | Meaning |
| --- | --- | --- |
| `--campaigns` | 20 | Campaigns per variant, with the seeds `<seeds>-1` to `<seeds>-<campaigns>`. |
| `--turns` | 200 | The last Turn played; a Campaign that ends earlier stops there. |
| `--seeds` | `lab` | The seed prefix. Two runs with the same prefix play the same Campaigns. |
| `--set` | none | Tuning parameters of variant A that differ from `BASIC_AI_THRESHOLDS`, as `key=value,key=value`; may repeat. |
| `--vs` | none | What variant B changes on top of A, in the same form. Giving it, or `--impl-b`, makes the run a comparison. |
| `--impl` | the sibling clone | The Implementation clone variant A plays with, as it is on disk, uncommitted changes included. |
| `--impl-b` | `--impl` | The clone variant B plays with, e.g. a worktree with a changed AI or changed game data. |
| `--threads` | CPU cores less one | Worker threads, shared evenly between the variants. |
| `--out` | `autopilot-lab/<time>` in the OS temporary folder | Where the records and the summary go. |
| `--json` | off | Print `summary.json` instead of the Markdown summary. |
| `--limit` | 180 | The Run time limit in seconds, which may only be shortened. |

A Lab run stops at its Run time limit of three minutes: it stops every Campaign still being played, starts no other, and summarizes only the finished ones, saying at the top how many of each variant it stopped and never started. A Campaign of 300 Turns takes 15 to 30 seconds on one thread, so a comparison of 20 Campaigns per variant to Turn 400 takes one to two minutes on a machine of many cores.

To try a change of game data or of the AI's code, make it in a temporary worktree of the Implementation repo, link or install its `node_modules`, and compare with `--impl-b`. Game data in the Implementation is a copy made by its `npm run sync:spec`, so edit it in the worktree directly for an experiment and put a change that is kept into `content/` of this repository.

## What it prints

Each section has one column per variant:

- **Endings:** how many Campaigns end in Victory, in Defeat by each set of Ending reasons, in an error, or are still being played at the last Turn; the Turn of the ending; and the Loss share of the Victories, i.e. their Mission sites Expired or whose Mission is Lost among those Expired, Won, or Lost, with how many reach 20%.
- **Over time:** at Turns 10, 25, 50, 75, 100, 150, 200, and the last, the median and the 25th to 75th percentile, over the Campaigns still being played, of Panic, money, net projected income, Agents, Contracting against its cap, the share on Recovery, research points per Turn, the Strike team's Rested rating against its Strike goal, mean base skill, and Agents Killed.
- **Missions:** for each kind of Mission site, from the weakest, the Missions Won, Lost, and Expired per Campaign, the share of Campaigns with a win, and the median Turn of the first win.
- **Panic:** the Panic each Faction operation level added per Campaign by Lost and Expired Response Mission sites, and what Won Missions took away.
- **Progress and purchases:** Leads completed and discovered, and the acquisitions of each Upgrade, at the end.
- **Combats by the ratio of the Combat ratings at Combat start:** every Combat a Mission fought, by the Agents' side's Combat rating over the Enemies' at Combat start, in bands from below 100% to 400% and above: how many, the share Lost, the Agents dead per Combat, and the share in which an Agent ran out of Ammo. Then, per variant, the Lost Combats at 110% or more, the strongest first, each with its Campaign, Turn, Mission site, ratio, sides, outcome, and its Combat setup seed, which the Combat simulator's Seed field takes to fight the same Combat again.
- **Detectors:** how many Campaigns show a pattern that points at a defect rather than at balance, with the worst seed: Contracting idle with a cap above 0, an Upgrade bought 3 or more times in one Turn, Agents with the Fallback Weapon while Storage holds Weapons, a Strike team short of its goal for 50 Turns in a row, projected income below upkeep for 10 Turns in a row, and 200 or more Player actions in one Turn.
- **Errors:** every Campaign that failed, with the start of its stack.

The records folder holds `summary.md`, `summary.json` with every Campaign's result but its Turn rows, and one `<variant>-<seed>.json` per Campaign with its values at the start of every Turn, to read one seed in detail.

## How a Campaign is played

Each Campaign is a Session of its own, made by the Implementation's `createEngine` with the Autosave limit 0, whose only Autopilot AI is the one `createBasicAutopilotAi` builds from the variant's parameters. Every Turn is one Autopilot engagement with the Autopilot limit `turnAdvancements` of 1, after which the Lab reads the Campaign through Player API and derives the Strike team with the Implementation's own `makePlan`. It wraps the AI's Player API only to count the actions it requests.

## Files

| Path          | Content                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------- |
| `lab.ts`      | The command: the variants, the worker threads, and the summary.                             |
| `worker.ts`   | Loads the engine and the AI from one Implementation clone and plays the Campaigns given it. |
| `protocol.ts` | The messages between them and what one Campaign reports.                                    |
