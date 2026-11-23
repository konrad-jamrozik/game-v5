# CR Sweep Bench

A local page for finding a Combat rating formula that tells the player when a team is safe: one under which a team whose rating is a set share of the Enemies' rating, e.g. 110%, wins nearly every Combat, e.g. 95% of them, whatever the team and whatever the Enemies.

It differs from the [Combat Rating Bench](../combat-rating-bench/README.md) in what it measures. That bench sizes each Agent team by the formula under study, so a changed formula needs new Combats. This one measures first, whatever the formula: for every pairing of an Agent type and an Enemy team it sweeps the Agent count and records the win rate at each count. Any formula is then scored against those win rates without fighting anything again.

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

The same sweeps and scores run without the page, on the same files:

```bash
node tools/cr-sweep-bench/cli.ts run
node tools/cr-sweep-bench/cli.ts score
```

`run` sweeps the pairings of the saved state that have no result yet. `score` prints, for the current formula and each pinned one, its scores, the pairings that need the highest and the lowest rating ratio, and the pairings in four groups by one feature. `score` takes `--level <percent>`, `--ignore <percent>`, `--feature <id>`, e.g. `--feature enemyCount`, and `--rows <number>`; the feature ids are in `lib/model.js`. Both take `--impl` and `--spec`.

## What is swept

A **pairing** is one Agent type against one Enemy team. The page takes both as text:

- **Enemy teams** are the Mission sites read from `content/`, the Cut content under `content/cut/` excepted, each with its Enemies at their EnemyArchetypes' values, and any further teams typed one per line as groups joined by `+`, e.g. `boss and minions: 1 x s400 h60 d20 a40 + 12 x s40 h20 d8`. In a group, `s` is skill, `h` max health, `d` weapon damage, and `a` armor, which is 0 when left out. The typed teams are for fights the Mission sites lack, e.g. a swarm of weak Enemies or one champion.
- **Agent types** are typed one per line, e.g. `veteran, rifle and vest: s200 h30 d14 a20`. A team is any number of Agents of one type, at full health and rested. The defaults are three skills, each with the gear the Agency issues, the best Weapon and Armor of the content, and three mixes between them.
- **Rules** are the content's Combat values, with any typed in their place, one `name = value` per line, e.g. `exhaustion_per_defense = 0`. Retreat is off unless **Agents may retreat** is checked, by setting `retreat_below_agent_rating_fraction` to 0, because the Retreated check reads the game's own Combat rating and not the formula under study; when it is on, a retreat is not a win.

For each pairing, one worker thread:

1. Doubles the Agent count from 1 until the team wins at least 99% of a small batch, the probe, or the count reaches **Most Agents**.
2. Finds the climb, the counts over which the win rate rises from at most 2% to at least 99%, by probing evenly spaced counts inside it ever closer, until every count is probed or the climb has more counts than **Most counts in a climb**.
3. Fights the full batch, **Combats per count**, at every probed count of the climb, and at higher counts while the team still wins less than 99%.

Each batch is one call of the engine's `developer.tools.fightCombatBatch` on explicit Combatants, with the Agent team as the Agents' side, as in a Mission. Agents given by explicit values spend no Ammo. The Detached seed of a batch is the pairing's key and the Agent count, so the same pairing gives the same numbers on every run.

## The files under `data/`

Both are written by the server and by `cli.ts`, so that the page, the command line, and an agent asked to analyse a sweep all read the same ones:

- **`state.json`** holds what the page shows: the configuration, the current formula, the pinned formulas, and the view settings. Without it the defaults apply.
- **`results.ndjson`** holds one line per swept pairing: its Agent type, its Enemy team, the GDR values and engine commit it was fought with, and the Combats won, retreated from, and lost at each Agent count. A later line of the same key replaces an earlier one.

A pairing's key hashes its Agent type, its Enemy team, the GDR values, and the engine's commit, so results fought under other rules or by another engine are kept apart and never mixed. An engine with uncommitted changes under `src` has one key for all such changes: delete `results.ndjson` after changing the engine without committing.

## The formula

A formula is up to four JavaScript expressions and its parameters:

- **Rating of one Combatant** reads `skill`, `damage`, `health`, `armor`, and `count`, the number of Combatants of its side. `skill` is the effective skill, which for a Combatant at full health and rested is its base skill.
- **Second number of one Combatant** is optional and reads the same; its sum over the side is `sum2`.
- **Rating of a side** reads `sum`, the sum of the ratings of its Combatants, `sum2`, and `count`.
- **Rating of one Enemy** is optional and replaces the first expression for Enemies, so that Agents and Enemies can be rated apart.

Every expression also reads the parameters, the functions `sqrt min max pow log exp abs ceil floor round`, and the means of the other side, `opp_count`, `opp_skill`, `opp_damage`, `opp_health`, and `opp_armor`. A formula that reads the other side rates one team differently against each opponent, so those serve to find out what a formula misses, e.g. damage wasted on Enemies too frail to take it, and not as a rating to show the player.

The pinned formulas start with the game's own, under Combat rating in Combat, and with the square law, `skill * sqrt(damage * (health + k * armor)) / base` summed over the side and multiplied by `count ** e`. **Pin for comparison** adds the current formula under a name, and **Load** makes a pinned one current.

## How a formula is scored

The scores read only the swept win rates and the formula. A pairing's win rates are first made non-decreasing in the Agent count, because more Agents never truly win less, and read between the fought counts in a straight line.

- **Agents needed**, of a pairing: the Agent count at which the win rate reaches the **Win rate to promise**, by default 95%. It does not depend on the formula. A pairing in which one Agent already wins that often, or in which **Most Agents** never do, has none and is left out.
- **Ratio needed**, of a pairing: the rating ratio, Agents to Enemies, that the formula gives at the Agents needed.
- **Safe ratio**: the highest ratio needed of any pairing. A team at or above it wins at least the promised share of its Combats against every Enemy team swept, so it is the ratio the game could promise, e.g. 131%. **Ignore the worst pairings** leaves the given share of pairings with the highest ratio needed out of it, to see how much a few pairings cost.
- **Over-deployment**, of a pairing: the Agents the safe ratio asks for, over the Agents needed, e.g. ×1.2 when the safe ratio asks for 12 Agents where 10 win 95%. It is what a formula costs the player. Unlike the safe ratio it does not shrink when a rating is only rescaled, e.g. by showing its square root, so formulas are compared by its mean, and **Fit** searches the checked parameters by Nelder-Mead for the lowest mean.
- **Ratio at even odds**: the mean ratio at which a team wins half its Combats.

A perfect formula gives every pairing the same ratio needed and so an over-deployment of ×1 everywhere. What keeps a formula from it shows in three places:

- **Rating ratio each pairing needs** plots every pairing's ratio needed against one feature of the pairing, e.g. the Agents needed per Enemy or the hits an Agent needs per Enemy. A slope means the formula misjudges that feature.
- **Pairings in four groups** gives the median and highest ratio needed of the pairings in four groups of equal size by that feature. The points of the first chart are coloured by the same groups.
- **Pairings** lists every pairing, sorted by any column; the ones that need the highest ratio set the safe ratio. Clicking one shows its win rate at each Agent count, with the Agents needed and the Agents the safe ratio asks for.

Part of the distance between even odds and the safe ratio is the dice, which no formula removes: a fight of few Combatants is decided by few attacks. Such pairings need a high ratio under every formula.

## Files

| Path           | Content                                                                                             |
| -------------- | --------------------------------------------------------------------------------------------------- |
| `index.html`   | The page: what to sweep, the formula, the scores, the charts, and the tables.                       |
| `lib/model.js` | What the page and the scripts share: the text forms, the formulas, the scoring, and the fit.        |
| `server.ts`    | Serves the page and answers its requests.                                                           |
| `cli.ts`       | Sweeps and scores from the command line.                                                            |
| `store.ts`     | Reads the GDR values from `content/`, and reads and writes the state and the results under `data/`. |
| `run.ts`       | Sweeps the pairings of a configuration that have no result yet.                                     |
| `pool.ts`      | The worker threads.                                                                                 |
| `worker.ts`    | Loads the engine from the Implementation clone and sweeps one pairing at a time.                    |
