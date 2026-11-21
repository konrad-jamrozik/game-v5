# Combat Rating Bench

A local page for finding a Combat rating formula that predicts who wins. Teams of Combatants fight each other in the engine, a candidate formula rates every team, and the page measures how well the ratings predict the Combats: two teams of equal rating should each win 50% of the time whatever their make-up, e.g. a few elite Combatants against many weak ones, and a growing ratio of ratings should raise the win rate the same way for every pair.

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

The formula, the teams, and the settings are kept in the browser's local storage; **Reset** restores the defaults.

## The formula

The rating of a team is computed in two steps, each an editable JavaScript expression with `Math` in scope:

- **`combatant_cr`** rates one Combatant, by default `skill * health_mult * armor_mult * damage_mult`, where `skill` is its effective skill and e.g. `health_mult = 1 + (health − health_base) × health_per_point`; `armor_mult` and `damage_mult` follow the same pattern.
- **`team_cr`** rates a team from `sum`, the sum of the `combatant_cr` of its Combatants that are able to fight, and `count`, their number, by default `sum * count ** team_exp / count`. `game` is also available: the game's base Combat rating, Σ effective skill.

The parameters, e.g. `health_per_point` and `team_exp`, are variables of both expressions. The buttons under the expressions load the game's base Combat rating, the multiplicative default, and a Lanchester square law, `sqrt(sum * count)`.

## How the numbers are made

- **Teams** are lists of groups of identical Combatants at full health, given by count, base skill, health, weapon damage, armor, and exhaustion. **Sizes** multiplies every group's count, giving one variant of the team per entry. A team can be added from an AgentArchetype, an EnemyArchetype, or a Mission site's Enemies, read from `content/`.
- **Pairs** are every variant against every other, or the first variant against every other. With **Size every team to the first variant's rating**, each team other than the first fights in one variant only, whose first group's count gives the rating closest to the first variant's, so every pair is meant to be a 50% fight.
- **Combats** are fought by the engine's `developer.tools.fightCombatBatch`, on explicit Combatants and with the Combat values listed on the page. With **Both sides, averaged**, every pair fights one batch with each team as the Agents' side, and a team's win rate is the mean of the two, because the Agents' side acts first, picks its targets, and alone can retreat. Retreat is off unless **Allow retreat** is checked, by setting `retreat_below_agent_rating_fraction` to 0, because it reads the game's own Combat rating rather than the formula; when it is allowed, a retreat counts as a loss for the retreating team.
- **Seeds** are fixed: the batch of a pair has the Detached seed `<pair key>|<side>`, where the key hashes both teams, the Combats per side, and the Combat values, so a changed number reflects an edit, not new dice. A pair already fought is never fought again in the same page session; **Fight again** forgets every result.
- **Prediction** is `P(A wins) = r^k / (1 + r^k)` with `r = team_cr(A) / team_cr(B)`, exactly 50% at equal ratings. The steepness `k` is fitted to the Combats by least squares, so it measures how sharply the win rate turns, and the remaining error measures how well the formula orders the teams.
- **Prediction error** is the root mean square of the error over the contested pairs, i.e. those that neither the Combats nor the prediction give 95% or more. **Parity error** is the mean distance from 50% of the pairs whose ratings are within 10% of each other. Each states the error that the dice alone leave, which no formula can go below; more Combats per side lower it.
- **Strength vs rating** of a variant is the factor by which it fights above or below its rating: the per-variant factor on the rating that makes the prediction fit best, anchored at a mean of 1, or at 1 for the first variant when only it is paired with the others.
- **Fit** searches the checked parameters by Nelder-Mead for the least squared error of the prediction over the pairs fought so far, refitting `k` at each step. The Combats do not read the formula, so the fit, like every edit of the formula, fights nothing again, unless **Size every team** is on, in which case the resized teams are fought after it.

## Files

| Path         | Content                                                                                            |
| ------------ | -------------------------------------------------------------------------------------------------- |
| `index.html` | The page: the formula, the teams, the experiment, the scoring, and the fit.                        |
| `server.ts`  | Serves the page, reads the defaults from `content/`, and hands the batches to the worker threads.  |
| `worker.ts`  | Loads the engine from the Implementation clone and fights one batch of Detached Combats at a time. |
