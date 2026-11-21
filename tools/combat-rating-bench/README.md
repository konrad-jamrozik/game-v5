# Combat Rating Bench

A local page for finding a Combat rating formula that predicts who wins. Every Mission site's Enemies fight Agent teams that a candidate formula sizes to a set share of the site's rating, e.g. 100%, 120%, and 150%. A good formula gives every team sized to 100% a 50% win rate whatever its skill and Upgrades, e.g. a few Agents of base skill 500 and many of base skill 100 alike, and every team sized to a larger share one consistent win rate.

It is a tool for the Game designer, not a specification and not part of any Implementation. It writes nothing to the repository: a formula found with it is applied to the specifications by hand or by an agent, and the page prints it as text to copy.

## Run it

It needs a clone of the Implementation repo `game-v5-impl-web` next to this repository, with its dependencies installed, because every Combat is fought by that Implementation's engine. From the repository root:

```bash
npm run rating:bench
```

Then open <http://127.0.0.1:4719/>. The server runs under `node --watch`, so it restarts by itself whenever `server.ts` changes; reload the page after such a restart. Reloading the page also starts the engine again from the source on disk and reads the GDR values again. To use other locations or another port:

```bash
node tools/combat-rating-bench/server.ts --impl <game-v5-impl-web clone> --spec <game-v5 clone> --port <number>
```

## The formula

The rating of a team is computed in two steps, each an editable JavaScript expression with `Math` in scope:

- **`combatant_cr`** rates one Combatant, by default `skill * health_mult * armor_mult * damage_mult`, where `skill` is its effective skill and e.g. `health_mult = 1 + (health − health_base) × cr_per_health`; `armor_mult` and `damage_mult` follow the same pattern.
- **`team_cr`** rates a team from `sum`, the sum of the `combatant_cr` of its Combatants that are able to fight, and `count`, their number, by default `sum * count ** team_exp / count`. `game` is also available: the game's base Combat rating, Σ effective skill.

The parameters, e.g. `cr_per_health` and `team_exp`, are variables of both expressions. The buttons under the expressions load the game's base Combat rating, the multiplicative default, and a Lanchester square law, `sqrt(sum * count)`.

## The grid

- **Rows** are the Mission sites read from `content/`, the Cut content under `content/cut/` excepted, the Initiative sites first and then the Response sites by operation level. Each site's Enemies take their EnemyArchetypes' values.
- **Blocks** are the shares of the site's rating, by default `100, 120, 150`. In each block, the rows are the base skills of the Agent teams, by default `100, 250, 500`, and the columns their Upgrades as `weapon/armor` counts, by default `0/0, 5/0, 0/5, 5/5, 10/0, 0/10, 10/10`, so the defaults make 24 sites × 3 shares × 3 skills × 7 Upgrade sets, i.e. 1,512 cells.
- **An Agent team** is Agents of the first AgentArchetype's health, weapon damage, and armor, at full health and rested, with the cell's base skill; each Weapon damage Upgrade adds the `weapon_damage` Upgrade's `increment` to weapon damage, and each Armor Upgrade the `armor` Upgrade's to armor. Its Agent count is the one whose rating, under the current formula, is closest by ratio to the cell's share of the site's rating. A cell whose closest count still misses its share by more than 10%, e.g. one Agent of base skill 500 against a small site, is drawn dashed and left out of the statistics.
- **A cell** shows the Agent count above and the win rate below, tinted blue below 50% and orange above; hovering it shows the ratings, the Agents' values, and the Combats won.
- **Nothing is fought until a Run button is pressed**: beside a share in a row, that block; **Run row**, the row; **Run** in the top row, that share for every site; and **Run all**, every cell. A run fights only the cells that have no result for their current team; **Stop** drops the fights not yet done.
- **Results are kept in the browser's local storage**, by a key that hashes the site's Enemies, the Agent team, the Upgrade counts, the Combats per cell, the Combat values, and the engine's commit. A change of the formula that changes a cell's Agent count leaves its earlier result greyed until it is run again; one that keeps the count keeps the result. **Forget results** clears them.

## How the Combats are fought

Each cell is one batch of the engine's `developer.tools.fightCombatBatch`, on explicit Combatants, with the Agent team as the Agents' side, as in a Mission, and the Combat values listed on the page. The batch's Rating Upgrades are the cell's Upgrade counts. Retreat is off unless **Allow retreat** is checked, by setting `retreat_below_agent_rating_fraction` to 0, because it reads the game's own Combat rating rather than the formula; when it is allowed, a retreat counts as a loss. The Detached seed of a cell is its key, so a changed number reflects an edit, not new dice.

## Analysis

The analysis covers the cells that have a result for the current formula and are within 10% of their share:

- **For each share**, the mean win rate and its spread, i.e. the standard deviation over the cells. The spread that a finite number of Combats alone leaves is stated beside it, and the rest is the **formula spread**, the part a better formula can remove. For 100%, the distance from 50% is given as a root mean square, with its formula part too.
- **Histograms** of the win rates of each share.
- **Win rate by rating ratio** plots every cell against the ratio of its Agent team's rating to its site's, coloured by base skill, with the curve `P = r^k / (1 + r^k)`, exactly 50% at equal ratings, whose steepness `k` is fitted to the cells.
- **Agent teams** gives the mean win rate of each Agent team over the sites, ± the standard deviation, for each share, so that a team type the formula rates too high or too low stands out.
- **Fit** searches the checked parameters by Nelder-Mead for the least squared error of the curve over the cells with a result, refitting `k` at each step. It fights nothing: the Agent counts the new formula gives differ, so the changed cells show their earlier results greyed until they are run again.

## Files

| Path         | Content                                                                                             |
| ------------ | --------------------------------------------------------------------------------------------------- |
| `index.html` | The page: the formula, the setup, the grid, the analysis, and the fit.                              |
| `server.ts`  | Serves the page, reads the GDR values from `content/`, and hands the batches to the worker threads. |
| `worker.ts`  | Loads the engine from the Implementation clone and fights one batch of Detached Combats at a time.  |
