# CR Sweep Bench

A local page for finding a Combat rating formula that tells the player when a team is safe: one under which a team whose rating is a set share of the Enemies' rating, e.g. 110%, wins nearly every Combat, e.g. 95% of them, whatever the team and whatever the Enemies.

It finds the formula from controlled experiments, not from the game's content. One Combatant, the **reference**, is the yardstick: the strength of a team is the number of reference Combatants it is an even match for, which the game's own engine measures and no formula enters. Changing one value of a team at a time then shows what that value alone is worth. A grouping of arbitrary teams by one of their values cannot show this, because the teams differ in everything else too.

It differs from the [Combat Rating Bench](../combat-rating-bench/README.md), which sizes each Agent team by the formula under study and fights it against the Mission sites.

It is a tool for the Game designer, not a specification and not part of any Implementation. It writes nothing to the repository outside its own `data/` folder, which git ignores: a formula found with it is applied to the specifications by hand or by an agent.

## Run it

It needs a clone of the Implementation repo `game-v5-impl-web` next to this repository, with its dependencies installed, because every Combat is fought by that Implementation's engine. From the repository root:

```bash
npm run sweep:bench
```

Then open <http://127.0.0.1:4720/>. Reloading the page starts the engine again from the source on disk and reads the GDR values again. To use other locations or another port:

```bash
node tools/cr-sweep-bench/server.ts --impl <game-v5-impl-web clone> --spec <game-v5 clone> --port <number>
```

The same sweeps and readings run without the page, on the same files:

```bash
node tools/cr-sweep-bench/cli.ts run
node tools/cr-sweep-bench/cli.ts score
```

`run` sweeps what the saved state asks for and has no result for yet. `score` prints every reading below as text and scores the current formula and each pinned one; `--rows <number>` sets how many rows each list shows. Both take `--impl` and `--spec`.

## A measurement

A measurement fixes one side and sweeps the count of one Combatant type on the other. For each, one worker thread:

1. Doubles the swept count from 1 until the swept side gets its way in at least 99% of a small batch, the probe, or the count reaches **Most swept**. The swept side gets its way when the Agents win, if it is the Agents, and when they do not, if it is the Enemies.
2. Finds the climb, the counts over which that share rises from at most 2% to at least 99%, by probing evenly spaced counts inside it ever closer, until every count is probed or the climb has more counts than **Most counts in a climb**.
3. Fights the full batch, **Combats per count**, at every probed count of the climb.

From the win rates, made non-decreasing in the swept count and read between whole counts in a straight line, come two counts:

- **Even odds:** the swept count at which the Agents win half the Combats.
- **95%:** the swept count at which the Agents win 95% of them.

A measurement whose even odds lie below one swept Combatant, or beyond **Most swept**, is unresolved and listed apart.

Each batch is one call of the engine's `developer.tools.fightCombatBatch`. Every Combatant is given by explicit values, at full health and rested. A Combatant of explicit values has no AmmoType, so no Agent spends Ammo or falls back to its knife, whatever the fight. The Detached seed of a batch is the measurement's key and the swept count, so one measurement gives the same numbers on every run.

**Rules** are the content's Combat values, with any typed in their place, one `name = value` per line, e.g. `exhaustion_per_defense = 0`. Retreat is off unless **Agents may retreat** is checked, by setting `retreat_below_agent_rating_fraction` to 0, because the Retreated check reads the game's own Combat rating and not the formula under study; when it is on, a retreat is not a win.

## The experiments

The **strength** of a team is its even odds against the reference Combatant: the number of reference Enemies a team of Agents is an even match for, or the number of reference Agents a team of Enemies is. Every team is measured in both roles, because Agents strike first and choose their targets while Enemies do not.

- **One value changed:** a team of the **Team size**, by default 10, whose every Combatant is the reference with one value changed, for each value listed under Skill, Weapon damage, Max health, and Armor. The curve of strength against that value is what the value alone is worth, e.g. "doubling weapon damage multiplies strength by ×1.3".
- **One type at each size:** a team of one Combatant type at each of the **Team sizes of one type**, for the reference and each type under **Other Combatant types**. The curve shows whether twice the Combatants are twice the strength.
- **Two values changed:** a team with two values changed, each to the lowest and the highest listed. If the two acted independently, the strength would be the base strength times the two single effects; the **gap** is the measured strength over that.
- **Two types in one team:** a team of half one type and half another. If strength were a plain sum, it would be worth its two halves together; the gap is the measured strength over that.
- **Cross-checks:** Agents of each type swept against Enemy teams of each type, at each of the **Enemy team sizes of the cross-checks**. Neither side is the reference, so these are fights the yardstick did not see. The yardstick still predicts them: the Enemy team is worth so many reference Agents, those are worth so many reference Enemies, and the Agent type's own size curve says how many of it are worth as many. The gap between the measured and the predicted count is what no rating that gives each side one number can explain, so its spread is the least error any formula can have.
- **Mission sites:** Agents of each type swept against each Mission site of the content, the Cut content under `content/cut/` excepted. They are the final exam: no formula is fitted to them.

**The dice** is read from every sweep of reference Agents: the count that wins 95% over the count that wins half, against the same Enemies. No formula changes it. It is how far a safe ratio must lie above even odds, and it is larger in fights of few Combatants, which few attacks decide.

## The formula

A formula is up to five JavaScript expressions and its parameters:

- **Rating of one Combatant** reads `skill`, `damage`, `health`, `armor`, and `count`, the number of Combatants of its side. `skill` is the effective skill, which for a Combatant at full health and rested is its base skill.
- **Second number of one Combatant** is optional and reads the same; its sum over the side is `sum2`.
- **Rating of a side** reads `sum`, the sum of the ratings of its Combatants, `sum2`, and `count`.
- **Rating of one Enemy** and **Rating of the Enemies' side** are optional and replace the first and the third expression for Enemies, so that the two sides can be rated apart.

Every expression also reads the parameters, the functions `sqrt min max pow log exp abs ceil floor round`, and the means of the other side, `opp_count`, `opp_skill`, `opp_damage`, `opp_health`, and `opp_armor`. A formula that reads the other side rates one team differently against each opponent, so those serve to find out what a formula misses and not as a rating to show the player.

The pinned formulas start with the game's own, under Combat rating in Combat, and with the square law, `skill * sqrt(damage * (health + k * armor)) / base` summed over the side and multiplied by `count ** e`. **Pin for comparison** adds the current formula under a name, and **Load** makes a pinned one current.

## How a formula is scored

A perfect formula rates the two sides of every measurement equal at even odds, i.e. gives a rating ratio, Agents to Enemies, of 100% there.

- **Experiments** covers every measurement but the Mission sites: how far the ratio at even odds typically lies from 100%, as the root mean square of its logarithm, and the furthest. **Fit** searches the checked parameters by Nelder-Mead for the lowest such error, and never reads the Mission sites.
- **Mission sites** gives the same for the sites, and the **safe ratio**: the highest ratio any site measurement has at its 95% count. A team at or above it wins at least 95% against every site swept, so it is the ratio the game could promise.

The charts of **What one value is worth** draw the formula's prediction as lines over the measured dots, so a formula's error shows as the value it misjudges. **Every measurement** lists each with the formula's ratio at even odds and at 95%; clicking one shows its win rate at each swept count.

## The files under `data/`

Both are written by the server and by `cli.ts`, so that the page, the command line, and an agent asked to analyse a sweep all read the same ones:

- **`state.json`** holds what the page shows: the configuration, the current formula, and the pinned formulas. Without it the defaults apply.
- **`results.ndjson`** holds one line per sweep: its two sides, the GDR values it was fought with, and the Combats won, retreated from, and lost at each swept count. A later line of the same key replaces an earlier one.

A sweep's key hashes its two sides, the GDR values, and the git tree of the engine's source, `src/engine` of the Implementation clone. Results fought under other rules or by another engine are therefore kept apart, and a commit that leaves the engine alone keeps every result. An engine with uncommitted changes has one key for all such changes: delete `results.ndjson` after changing the engine without committing.

## Files

| Path           | Content                                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------- |
| `index.html`   | The page: the experiments, their readings, the formula, and every measurement.                    |
| `lib/model.js` | What the page and the scripts share: the text forms, the formulas, the readings, and the scoring. |
| `server.ts`    | Serves the page and answers its requests.                                                         |
| `cli.ts`       | Sweeps and reports from the command line.                                                         |
| `store.ts`     | Reads the GDR values from `content/`, plans the measurements, and reads and writes under `data/`. |
| `run.ts`       | Sweeps what a configuration asks for and has no result for yet.                                   |
| `pool.ts`      | The worker threads.                                                                               |
| `worker.ts`    | Loads the engine from the Implementation clone and sweeps one measurement at a time.              |
