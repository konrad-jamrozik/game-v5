# GDR Balance Bench

A local page for balancing the game. It shows every balance value of the Bootstrap GDRs next to what that value causes, e.g. how often a team wins a Mission site, how long an Agent can work before it tires, or how fast Panic rises. Change a value on the page and the readouts recompute.

It is a tool for the Game designer, not a specification and not part of any Implementation. It writes nothing to the repository: the page lists the values that were changed, and those are then applied to the YAML files under `content/` by hand or by an agent.

## Run it

It needs a clone of the Implementation repo `game-v5-impl-web` next to this repository, with its dependencies installed, because every Combat is fought by that Implementation's engine. From the repository root:

```bash
npm run balance:bench
```

Then open <http://127.0.0.1:4717/>. To use other locations or another port:

```bash
node tools/gdr-balance-bench/server.ts --impl <game-v5-impl-web clone> --spec <game-v5 clone> --port <number>
```

## What it reads, and when

Both are read again each time the page is loaded in the browser, so nothing is rebuilt after a change on disk:

- **GDR values** come from the YAML files under `content/` of this repository, the Compendium articles excepted.
- **The engine** is the TypeScript source under `src/` of the Implementation clone, as it is on disk, including uncommitted changes. The page states the commit it ran.

An engine that does not start, e.g. because the Implementation is in the middle of an update, is reported on the page under the test team, and the GDR values still load.

## How the Combat numbers are made

The page has no Combat rules of its own. For each Mission site, it sends the test team and the site's Enemies, with the values as edited on the page, to the engine's `developer.tools.fightCombatBatch`, which fights a batch of Detached Combats by the procedure the game itself uses, without building their Combat reports.

- **Test team wins** is the share of 100 Combats in which the Combat outcome was Prevailed, and **Agents killed** is the mean over those 100. A retreat counts as a loss, because a Mission is Won only when its Combat is Prevailed.
- **Team for target** is the smallest team, of the test team's skill and upgrades, that reaches the target win rate, searched up to 300 Agents. Each team size tried is fought in one batch of 100 Combats.
- **Initiative operation levels** come from the engine's `developer.queries.getInitiativeOperationLevels`.
- Every Combat's Detached seed is fixed, so a changed number reflects an edit, not new dice. The batch for a team of `n` at a Mission site has the Detached seed `<site>|<n>`, so its Combat `i` has `<site>|<n>#<i>`, e.g. `raid_hq|40#7`; `developer.tools.fightCombat` with that seed, e.g. through the Implementation's CLI command `fight`, shows that Combat in full.

The Combats run on one worker thread per spare CPU core. A Combat of 300 Agents against `raid_hq` takes about 12 ms in the engine, most of it in drawing each attacker's target among its candidates.

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
| `worker.ts`  | Loads the engine from the Implementation clone and fights the Combats.                              |
