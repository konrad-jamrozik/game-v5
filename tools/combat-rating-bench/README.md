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

- **`combatant_cr`** rates one Combatant, by default `skill * health_mult * armor_mult * damage_mult`, where `skill` is its effective skill and e.g. `health_mult = 1 + (health − health_base) × cr_per_health`; `armor_mult` and `damage_mult` follow the same pattern. An Agent's Weapon damage and Armor Upgrades count only as the weapon damage and armor they add, and the multipliers rate Agents and Enemies alike.
- **`team_cr`** rates a team from `sum`, the sum of the `combatant_cr` of its Combatants that are able to fight, and `count`, their number, by default `sum * count ** team_exp / count`. `game` is also available: the game's base Combat rating, Σ effective skill.

The parameters, e.g. `cr_per_health` and `team_exp`, and the Combat values, e.g. `rating_bonus_per_weapon_damage_upgrade`, are variables of both expressions. `cr_per_damage` and `cr_per_armor` default to the game's `rating_bonus_per_weapon_damage_upgrade` and `rating_bonus_per_armor_upgrade`, each divided by what one Upgrade adds, so that an Agent's Upgrades rate about as in the game; unlike the game's, they also rate the Enemies' weapon damage and armor. The browser keeps only the parameters edited, by typing or by **Fit**; every other one follows `content/`, so that a changed bonus reaches the page on its next load.

Unchecking a part's **Enabled** box switches it off: its multiplier is 1, or `team_exp` is 1, whatever the values; its parameters are greyed and **Fit** leaves them alone. A parameter that neither expression reads is greyed too. Every change re-rates every Combatant, site, and Agent team at once, and a Run button fights the teams as the current formula sizes them. A formula saved with a variable the page no longer has returns to the default expressions on load. The buttons under the expressions load:

- **Restore all defaults**: the default expressions and parameters, with every part enabled. The ↺ beside a parameter restores that parameter alone, and a parameter away from its default, or a part switched off, shows in orange.
- **Lanchester square**: the default combatant expression with the team expression `sqrt(sum * count)`.

## The grid

Clicking a section heading, e.g. **Setup**, folds the section to its heading; the Formula section never folds, but clicking **Combatant types under the formula, and explanations** folds that table together with the explanations beside the expressions, which start folded. The browser remembers what is folded.

- **Rows** are the Mission sites read from `content/`, the Cut content under `content/cut/` excepted, the Initiative sites first and then the Response sites, each from the highest operation level down. Each site is labelled with its kind and operation level, an Initiative site's from the engine's `developer.queries.getInitiativeOperationLevels` and a Response site's with its FactionOperationLevel name, e.g. Response level 3: Strategic threats. Each site's Enemies take their EnemyArchetypes' values. **Skip Response missions** leaves the Response sites out of the grid, the runs, the statistics, and the fit.
- **Blocks** are the shares of the site's rating, by default `100, 120, 150`. In each block, the rows are the base skills of the Agent teams, by default `100, 250, 500`, and the columns their Upgrades as `weapon/armor` counts, by default `0/0, 5/0, 0/5, 5/5, 10/0, 0/10, 10/10`, so the defaults make 24 sites × 3 shares × 3 skills × 7 Upgrade sets, i.e. 1,512 cells.
- **An Agent team** is Agents of the first AgentArchetype's health, weapon damage, and armor, at full health and rested, with the cell's base skill; each Weapon damage Upgrade adds the `weapon_damage` Upgrade's `increment` to weapon damage, and each Armor Upgrade the `armor` Upgrade's to armor. Its Agent count is the one whose rating, under the current formula, is closest by ratio to the cell's share of the site's rating. A cell whose closest count still misses its share by more than 5%, e.g. one Agent of base skill 500 against a small site, is excluded: it is drawn dashed, never fought, and left out of the statistics and the fit.
- **A cell** shows the Agent count above and the win rate below, tinted red when the Agents win less than 50% and green when they win more; hovering it shows the ratings, the Agents' values, and the Combats won.
- **Nothing is fought until a Run button is pressed**: beside a share in a row, that block; **Run row**, the row; **Run** in the top row, that share for every site; and **Run all**, every cell. A run fights only the cells that have no result for their current team; **Stop** drops the fights not yet done.
- **Results are kept in the browser's local storage**, by a key that hashes the site's Enemies, the Agent team, the Upgrade counts, the Combats per cell, the Combat values, and the engine's commit. A change of the formula that changes a cell's Agent count leaves its earlier result greyed until it is run again; one that keeps the count keeps the result. **Forget results** clears them.

## How the Combats are fought

Each cell is one batch of the engine's `developer.tools.fightCombatBatch`, on explicit Combatants, with the Agent team as the Agents' side, as in a Mission, and the Combat values listed on the page. The batch's Rating Upgrades are the cell's Upgrade counts. Retreat is off unless **Allow retreat** is checked, by setting `retreat_below_agent_rating_fraction` to 0, because it reads the game's own Combat rating rather than the formula; when it is allowed, a retreat counts as a loss. The Detached seed of a cell is its key, so a changed number reflects an edit, not new dice.

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
| `index.html` | The page: the formula, the setup, the grid, the analysis, and the fit.                              |
| `server.ts`  | Serves the page, reads the GDR values from `content/`, and hands the batches to the worker threads. |
| `worker.ts`  | Loads the engine from the Implementation clone and fights one batch of Detached Combats at a time.  |
