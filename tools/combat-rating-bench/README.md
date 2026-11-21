# Combat Rating Bench

A local page for finding a Combat rating formula that predicts who wins. Every Mission site's Enemies fight Agent teams that a candidate formula sizes to a set share of the site's rating, e.g. 100%, 120%, and 150%. A good formula gives every team sized to one share the same win rate whatever its skill and Upgrades, e.g. a few Agents of base skill 500 and many of base skill 100 alike. That win rate need not be 50%: e.g. 87% for every team sized to 100% serves as well, because only a consistent win rate makes the rating predict the fight.

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

- **`combatant_cr`** rates one Combatant, by one expression for Agents and another for Enemies, so that Agent gear and Enemy gear can be weighed apart; every preset sets both to the same expression. By default each is the game's `skill * ((damage / damage_base) + ((health + armor) / (health_base + armor_base))) / 2`, under Combat rating in Combat, where `skill` is its effective skill: the mean of an attack half and a toughness half, each 1 at the rating bases. The bonus presets read `health_mult = 1 + (health − health_base) × cr_per_health` instead, and `armor_mult` and `damage_mult` follow the same pattern. An Agent's Weapon damage and Armor Upgrades count only as the weapon damage and armor they add.
- **`team_cr`** rates a team from `sum`, the sum of the `combatant_cr` of its Combatants that are able to fight, and `count`, their number, by default `sum * count ** team_exp / count`. `game` is also available: the game's base Combat rating, Σ effective skill.

The parameters, e.g. `damage_base` and `team_exp`, and the Combat values, e.g. `rating_base_weapon_damage`, are variables of both expressions. The bases and `team_exp` default to the game's CombatParameters values of the same role, `health_base` to `rating_base_health`, `armor_base` to `rating_base_armor`, `damage_base` to `rating_base_weapon_damage`, and `team_exp` to `rating_team_size_exponent`, so that the defaults rate every team as the game does, apart from the game's rounding down of each side's rating. The three `cr_per_*` parameters have no game value and start from fixed ones, 0.01, 0.004, and 0.02, for the bonus presets. The browser keeps only the parameters edited, by typing or by **Fit**; every other one follows `content/` or its fixed default, so that a changed base reaches the page on its next load.

Unchecking a part's **Enabled** box switches it off: its multiplier is 1, or `team_exp` is 1, whatever the values; its parameters are greyed and **Fit** leaves them alone. A parameter that neither expression reads is greyed too. Every change re-rates every Combatant, site, and Agent team at once, and a Run button fights the teams as the current formula sizes them. A formula saved with a variable the page no longer has returns to the default expressions on load. The buttons under the expressions load:

- **Restore all defaults**: the game's expressions and parameters, with every part enabled. The ↺ beside a parameter restores that parameter alone, and a parameter away from its default, or a part switched off, shows in orange.
- **Game's formula**: the game's expressions, keeping the parameters, unlike **Restore all defaults**.
- **Lanchester square**: the combatant expression `skill * health_mult * armor_mult * damage_mult` with the team expression `sqrt(sum * count)`.
- **Multiplicative bonuses**: the combatant expression `skill * health_mult * armor_mult * damage_mult`, in which the three bonuses multiply, e.g. +10% health, +15% armor, and +30% damage make skill × 1.64 rather than × 1.55, with the default team expression. It keeps the parameters.
- **Additive bonuses**: the combatant expression `skill * (1 + (health_mult - 1) + (armor_mult - 1) + (damage_mult - 1))`, in which the three bonuses add, with the default team expression. It keeps the parameters.

## The grid

Clicking a section heading, e.g. **Setup**, folds the section to its heading; the Formula section never folds, but clicking **Combatant types under the formula, and explanations** folds that table together with the explanations beside the expressions, which start folded. The browser remembers what is folded.

- **Rows** are the Mission sites read from `content/`, the Cut content under `content/cut/` excepted, the Initiative sites first and then the Response sites, each from the highest operation level down. Each site is labelled with its kind and operation level, an Initiative site's from the engine's `developer.queries.getInitiativeOperationLevels` and a Response site's with its FactionOperationLevel name, e.g. Response level 3: Strategic threats. Each site's Enemies take their EnemyArchetypes' values. **Skip Response missions** leaves the Response sites out of the grid, the runs, the statistics, and the fit.
- **Blocks** are the shares of the site's rating, by default `80, 90, 100`. In each block, the rows are the base skills of the Agent teams, by default `100, 250, 500`, and the columns their Upgrade sets, each the weapon damage and armor it adds to every Agent, by default `0/0, 2/10, 4/20, 4/30, 4/40, 8/20, 8/30`, so the defaults make 21 sites × 3 shares × 3 skills × 7 Upgrade sets, i.e. 1,323 cells. E.g. `4/20` is +4 weapon damage and +20 armor, i.e. 2 Weapon damage Upgrades of +2 and 4 Armor Upgrades of +5; a column's header shows what it adds, and hovering it shows the Upgrades that add it. The browser keeps only the settings of the setup that were edited; every other one follows its default on each load, so that a changed default reaches the page, and **Restore setup defaults** returns every setting to its default.
- **An Agent team** is Agents of the first AgentArchetype's health, weapon damage, and armor, at full health and rested, with the cell's base skill, plus the weapon damage and armor of the cell's Upgrade set. Its Agent count is the one whose rating, under the current formula, is closest by ratio to the cell's share of the site's rating. A cell whose closest count still misses its share by more than 5%, e.g. one Agent of base skill 500 against a small site, is excluded: it is drawn dashed, never fought, and left out of the statistics and the fit.
- **A cell** shows the Agent count above and the win rate below, tinted red when the Agents win less than 50% and green when they win more; hovering it shows the ratings, the Agents' values, and the Combats won.
- **Nothing is fought until a Run button is pressed**: beside a share in a row, that block; **Run row**, the row; **Run** in the top row, that share for every site; and **Run all**, every cell. A run fights only the cells that have no result for their current team; **Stop** drops the fights not yet done.
- **Results are kept in the browser's local storage**, by a key that hashes the site's Enemies, the Agent team, the Upgrade set, the Combat values, and the engine's commit. The number of Combats is not part of the key: raising **Combats per cell** and running again fights only the Combats a result lacks, the same ones a single larger run would fight, and a result with fewer Combats than asked for shows greyed until then. A change of the formula that changes a cell's Agent count leaves its earlier result greyed until it is run again; one that keeps the count keeps the result. **Forget results** clears them.

## The Sampler

The Sampler fights one Agent team against one Mission site over a grid of values, e.g. Agents of base skill 250 against one site, with the Agent count from 50 to 100 on the X axis, +weapon damage on the Y axis, and +armor on the Z axis. Each of its dimensions, the Agent count, the Agent base skill, +weapon damage, +armor, the Mission site, and the Combats per sample, is either **Fixed** at one value or sampled from **From** to **To** by **Step** along the X, Y, or Z axis, one dimension per axis. A sampled Mission site covers every site shown in the grid; until a site is chosen, the fixed one is the site whose rating is closest to that of the middle sample. A fixed site's level, rating, and means show beside the dimensions, as under Mission sites. The Agents are those of the grid, at full health and rested.

- **X and Y** make one table with the first values at the upper left, as in the grid: X grows to the right and Y down. **Z** makes one table per value, laid out down the first column, then down the next. When Z is weapon damage or armor, the labels of the axis that shows the other also show the Z value, e.g. +4⚔ above +5🛡.
- **A cell** is tinted by its win rate, as in the grid, and shows, each behind its checkbox, the **Win rate**, the **Rating ratio**, the Agent team's rating as a percentage of the site's by the current formula, e.g. 85%, **Agent CR left**, in blue, the mean share of the Agents' starting rating left at the end of a Combat by the current formula, and **Agent exhaustion**, in yellow, the mean exhaustion of the Agents alive at the end, rounded to a whole number. Each checkbox's label is in its line's colour. Hovering it shows the ratings, the outcomes, and the win rate that the curve fitted on the grid predicts.
- **Nothing is fought until Run samples**, or a table's **Run**, is pressed. A sample's key is that of a grid cell of the same Combat, so the two share results. A sample is fought one Combat at a time, through `developer.tools.fightCombat` on the batch's seeds, to read the Agents' final health and exhaustion; its CR left is greyed once the formula changes, and the next run fights its Combats again, on the same seeds, to measure it anew.
- **CR to win diff** replaces every other figure, whose checkboxes wait until it is unchecked, with the rating ratio minus the win rate, in points. A cell is red when the Agents win less than their ratio, e.g. a ratio of 110% and a win rate of 98% is −12%, and yellow when they win more, e.g. 90% and 98% is +8%, at full strength from 20 points. It is empty when the two match, or when a ratio of 100% or more wins every Combat.
- **Combats per sample** can be raised, e.g. from 5 to 12, and the next run fights only the 7 more.
- **Re-run samples**, or a table's **Re-run**, forgets the samples' results and fights them again on a new seed, because running again on the same seed fights the same Combats. The result keeps its new seed, so raising the Combats afterwards still continues it.
- At most 60 values per axis and 5,000 samples in all.

## How the Combats are fought

Each cell is one batch of the engine's `developer.tools.fightCombatBatch`, on explicit Combatants, with the Agent team as the Agents' side, as in a Mission, and the Combat values listed on the page. The explicit values already hold what the cell's Upgrades add, which is all the game's Combat rating counts of them. Retreat is off unless **Allow retreat** is checked, by setting `retreat_below_agent_rating_fraction` to 0, because it reads the game's own Combat rating rather than the formula; when it is allowed, a retreat counts as a loss. The Detached seed of a cell is its key, so a changed number reflects an edit, not new dice.

## Analysis

The analysis covers the cells that have a result for the current formula and are therefore within 5% of their share:

- **For each share**, the mean win rate and its spread, i.e. the standard deviation over the cells. The spread that a finite number of Combats alone leaves is stated beside it, and the rest is the **formula spread**, the part a better formula can remove. The spread, not the mean, is what a formula is judged by.
- **Histograms** of the win rates of each share.
- **Win rate by rating ratio** plots every cell against the ratio of its Agent team's rating to its site's, coloured by base skill, with the curve `P = 1 / (1 + e^−(k·ln r + b))`, whose steepness `k` and offset `b`, which sets the win rate at equal ratings, are both fitted to the cells. The **Curve** tile gives that win rate at equal ratings, and each share tile the curve's prediction for its share.
- **Agent teams** gives the mean win rate of each Agent team over the sites, ± the standard deviation, for each share, so that a team type the formula rates too high or too low stands out.
- **Fit** searches the checked parameters by Nelder-Mead for the least squared error of the curve over the cells with a result, refitting `k` and `b` at each step. It fights nothing: the Agent counts the new formula gives differ, so the changed cells show their earlier results greyed until they are run again.

## Files

| Path         | Content                                                                                             |
| ------------ | --------------------------------------------------------------------------------------------------- |
| `index.html` | The page: the formula, the setup, the grid, the Sampler, the analysis, and the fit.                 |
| `server.ts`  | Serves the page, reads the GDR values from `content/`, and hands the batches to the worker threads. |
| `worker.ts`  | Loads the engine from the Implementation clone and fights one batch of Detached Combats at a time.  |
