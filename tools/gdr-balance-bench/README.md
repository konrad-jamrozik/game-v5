# GDR Balance Bench

A local page for balancing the game. It shows every balance value of the Bootstrap GDRs next to what that value causes, e.g. how often a team wins a Mission site, how long an Agent can work before it tires, or how fast Panic rises. Change a value on the page and the readouts recompute.

It is a tool for the Game designer, not a specification and not part of any Implementation. It writes nothing to the repository: the page lists the values that were changed, and those are then applied to the YAML files under `content/` by hand or by an agent.

## Run it

It needs a clone of the Implementation repo `game-v5-impl-web` next to this repository, with its dependencies installed, because every Combat is fought by that Implementation's engine. From the repository root:

```bash
npm run balance:bench
```

Then open <http://127.0.0.1:4717/>. The server runs under `node --watch`, so it restarts by itself whenever `server.ts` or `search.ts` changes on disk, e.g. after a pull; reload the page after such a restart. To use other locations or another port:

```bash
node tools/gdr-balance-bench/server.ts --impl <game-v5-impl-web clone> --spec <game-v5 clone> --port <number>
```

## What it reads, and when

Both are read again each time the page is loaded in the browser, so nothing is rebuilt after a change on disk:

- **GDR values** come from the YAML files under `content/` of this repository, the Compendium articles and the Cut content under `content/cut/` excepted.
- **The engine** is the TypeScript source under `src/` of the Implementation clone, as it is on disk, including uncommitted changes. The page states the commit it ran.

An engine that does not start, e.g. because the Implementation is in the middle of an update, is reported on the page under the test team, and the GDR values still load.

## How the Combat numbers are made

The page has no Combat rules of its own. For each Mission site, it sends the test team and the site's Enemies, with the values as edited on the page, to the engine's `developer.tools.fightCombatBatch`, which fights a batch of Detached Combats by the procedure the game itself uses, without building their Combat reports.

- **Test team wins** is the share of 100 Combats in which the Combat outcome was Prevailed, and **Agents killed** is the mean over those 100. A retreat counts as a loss, because a Mission is Won only when its Combat is Prevailed.
- **Team for target** can be turned off with the checkbox Find team for target under the test team; each site then fights only the test team's own 100 Combats, and Team for target and Transport upgrades show a dash.
- **Team for target** is the smallest team, of the test team's skill and upgrades, that reaches the target win rate, searched up to 300 Agents. The search starts from an estimate: the team size of the already solved Mission site whose Combat rating is closest, scaled by the ratio of the two Combat ratings, counting only sites that needed at least 15 Agents, because smaller ones scale badly; a site waits for such an estimate while a smaller site that will give one is still being searched, and otherwise starts from the team whose Combat rating equals the Enemies'. It first tries the estimate and a size 2.5% either side of it at once. Each probe also reports its win rate, and win rates rise with team size, so the search then aims at the size where the target is crossed: extrapolated from the two nearest probes while all of them fail or all pass, and interpolated between the largest failing and the smallest passing size once the answer is bracketed. It steps outward blindly, one size at a time with a doubling step, only when the win rates cannot tell, and bisects only when the aimed sizes are taken. E.g. after one Enemy count of `raid_hq` changes, its search typically needs 5 team sizes and about 3 seconds. Up to three team sizes of one site are fought at once, on worker threads that would otherwise be idle, and a site whose Enemies are stronger gets a free thread first, because its search takes longest. Each team size tried is one batch of at most 100 Combats that stops as soon as it is certain whether the team reaches the target, e.g. after the eleventh loss with a target of 90%.
- **Team Combat rating** under the test team shows its Combat rating, which counts its Weapon damage Upgrades by `rating_bonus_per_weapon_damage_upgrade` and its Armor Upgrades by `rating_bonus_per_armor_upgrade` as the game does, and beside it its base Combat rating without them. Every batch passes the two counts of those Upgrades as the setup's Rating Upgrades, so that the Retreated check weighs the same Combat ratings as in a Campaign; an engine that predates Rating Upgrades ignores them. The search's estimates use the Combat rating too.
- **Mission sites** are shown in two tables, the Initiative sites and the Response sites. In each, **× above** is a site's Rating divided by the Rating of the row above it, and **Team / Rating** is the test team's Combat rating as a percentage of the site's Rating.
- **Initiative operation levels** come from the engine's `developer.queries.getInitiativeOperationLevels`.
- A change on the page searches again only the Mission sites whose own inputs it changes, i.e. their Enemies, the test team, the GDR values a Combat reads, or the target; every other site keeps its result, and its search too if it is still running. E.g. changing one Enemy count of `raid_outpost` fights only `raid_outpost` again.
- Every Combat's Detached seed is fixed, so a changed number reflects an edit, not new dice. The batch for a team of `n` at a Mission site has the Detached seed `<site>|<n>`, so its Combat `i` has `<site>|<n>#<i>`, e.g. `raid_hq|40#7`; `developer.tools.fightCombat` with that seed, e.g. through the Implementation's CLI command `fight`, shows that Combat in full.

The Combats run on one worker thread per spare CPU core; server.ts runs each site's search, in search.ts, and hands each team size to try to whichever thread is free. A Combat of 300 Agents against `raid_hq` takes about 12 ms in the engine, most of it in drawing each attacker's target among its candidates.

The other readouts, e.g. the Turns an Investigation takes and the expected Panic by Turn, are computed in the page from the formulas of the specifications; the page says where one is an estimate.

## Limits

- The page knows the shape of the Bootstrap GDRs as they were when it was written. A new value of a parameter GDR on disk, e.g. of CombatParameters, appears as a row without a description and is passed to the engine. A new GDR, e.g. a new EnemyArchetype or Mission site, does not appear until the page is extended.
- Each `<faction>` Lead row sets the Lead of all three Factions, and shows the value of the first Faction.
- The Lead chain's structure and the display-only GDRs, e.g. Compendium articles, artwork, and music, are not shown.

## Files

| Path         | Content                                                                                             |
| ------------ | --------------------------------------------------------------------------------------------------- |
| `index.html` | The page: the editable values, the readouts, and the list of changes.                               |
| `server.ts`  | Serves the page, reads the GDR values from `content/`, and hands the Combats to the worker threads. |
| `search.ts`  | The search of one site for the smallest team that reaches the target win rate.                      |
| `worker.ts`  | Loads the engine from the Implementation clone and fights the Combats of one team size at a time.   |
