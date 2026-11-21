# Autopilot Bench

A local page for tuning the Basic Autopilot AI. Set its parameters, e.g. how fast it hires, how large a reserve it keeps, or which Upgrades it favors, launch a number of Campaigns played up to a Turn, and compare them: each Campaign is a row that shows the Agency, the work of its Agents, its strength, and its Missions at the Campaign's Current Turn. Play more Turns of one Campaign or of all of them at any time.

It is a tool for the Game designer and the AI designer, not a specification and not part of any Implementation. It writes nothing to the repository.

## Run it

It needs a clone of the Implementation repo `game-v5-impl-web` next to this repository, with its dependencies installed, because every Campaign is played by that Implementation's engine and its Basic Autopilot AI. From the repository root:

```bash
npm run autopilot:bench
```

Then open <http://127.0.0.1:4718/>. To use another clone or another port:

```bash
node tools/autopilot-bench/server.ts --impl <game-v5-impl-web clone> --port <number>
```

A change to the Bench reaches it without a restart wherever it can, because the Campaigns live in the server process and a restart loses them:

- `index.html` is read on every page load: reload the page.
- `worker.ts` and the Implementation clone are loaded by each launch's own worker threads, so a change reaches the Campaigns launched after it; Campaigns launched before keep their code, also for Play more.
- `protocol.ts` holds only types, which Node strips, so a change to it needs nothing.
- `server.ts` needs a restart. `npm run autopilot:bench` runs the server under `node --watch-path` on `server.ts` alone, so it restarts by itself when `server.ts` changes on disk, e.g. after a pull, and on no other change; the restart loses every Campaign, and the page then shows none.

## What it plays, and when

The page plays nothing by itself. Loading or reloading it only reads: it shows the Campaigns the server holds, as they are, and never plays a Turn of them.

- **Launch** creates the number of Campaigns given and plays each from Turn 1 until the Turn given. Campaign `i` of a launch has the Campaign seed `<prefix>-<i>`, so two launches with the same prefix play the same Campaigns and differ only by their parameters.
- **Play more** plays the number of Turns given in More turns of one Campaign; **Play more · all** does so for every Campaign that is not playing and has not ended.
- **Stop** disengages Autopilot after the Turn being played. **Load params** copies a Campaign's parameters into the Parameters editor, e.g. to launch a variant of it.

A Campaign that reaches a Campaign ending stops there.

Each launch starts its own worker threads, up to one per spare CPU core, and each of them loads the engine and the Basic Autopilot AI again from the TypeScript source under `src/` of the Implementation clone, as it is on disk, including uncommitted changes. A Campaign keeps the engine and the parameters it was launched with for every later run, so a change on disk reaches only the Campaigns launched after it. The launches share no thread, and the Campaigns of one launch take turns on its threads, so they progress evenly.

## How a Campaign is played

The bench has no game rules and no AI of its own. Each Campaign is a Session of its own, made by the Implementation's `createEngine`, whose only Autopilot AI is the one `createBasicAutopilotAi` builds from the page's parameters on top of `BASIC_AI_THRESHOLDS`. A run is one ordinary Autopilot engagement with the Autopilot limit `turnAdvancements` and the number of Turns asked for, with the Autosave limit set to 0. Between two Turns the engine yields to the worker thread, which then reports the Campaign's progress at most every 250 ms.

## What a row shows

Every number is read through Player API queries, as a player could see it, except the names of the Initiative Mission sites by Initiative operation level, which are fixed game data read once through `developer.queries.getInitiativeOperationLevels` on a scratch Campaign:

- **Progress** is the Turns played of the latest run out of those asked for, and the share of them. **Time** is the wall-clock time of the latest run, from its request until it ended, and below it the total of every run of the Campaign. A launch's run includes starting the engine and creating the Campaign.
- **Agency**: the Current Turn, the Campaign ending, Panic, money, funding, projected income and upkeep, Serving Agents against the Agent cap, Agents hired beyond those the Campaign started with, and Agents Killed.
- **Work**: Serving Agents by the kind of their Current assignment, those In transit included, with those on Training and on Standby split into the Basic Autopilot AI's Deployable Agents and the rest, so that the two Deployable counts add up to the number after `CR ready`. Then `Inv`, the Active Investigations, and the name of the Lead of each, with the Agents of its Current team.
- **Strength**: `CR ready`, the Combat rating, as `previewDeployment` reports it, of the Agents the Basic Autopilot AI may form a team of for a Mission site: its Deployable Agents, i.e. those on Standby or Training that can take orders, are Fit to start work, and do not meet the incapacitation condition with their current values, which the engine reports as `ableToFight`, with their number out of all Serving Agents; a team is further limited by the free Transport cap. `CR all`, the Combat rating of every Serving Agent at full health and exhaustion 0, i.e. the sum of the Agents' base skills rounded down, scaled by the ratio between their Combat rating and the sum of their current effective skills, so that whatever the engine adds to that sum, e.g. a bonus for Upgrades, is kept. Then the mean base skill, the Transport cap and Training cap, and the acquisitions of each Upgrade.
- **Missions**: the Response and the Initiative Missions Won and Lost, and the Mission sites of each kind Expired; for each Faction, the next Initiative Mission site to win against it, one Initiative operation level above the highest it has Won, or that the Faction is Eliminated. Below the next Mission site, four checks, one per line, each 🟢 when it holds and 🔴 when not:
  - **Site**: an Active Mission site of it against the Faction is available, with the Turns until it expires; when none is, the state of the Faction's discovered Lead that creates it: available for the first time, investigated for the first time, or completed at least once, and how many times.
  - **CR**: `CR ready` against the Combat rating of the MissionSiteArchetype's Enemies, as a whole percentage, exceeds the Campaign's `combatMarginPct`.
  - **Agents**: the Deployable Agents are at least the Agents needed, one per the Campaign's `enemiesPerAgent` Enemies, rounded up.
  - **Transport**: the free Transport cap, i.e. Transport cap less the Deployed Agents, is at least the Agents needed.

  The last three are the tests of the Basic Autopilot AI's winning team, read from all Deployable Agents together.

- **Fought**, below the layers, one per line: the last four Missions, the latest first, each read from the Turn report of the Advance turn that fought its Combat, which the worker thread reads after every Turn. Each shows the Turn, the kind of Mission site and its name, the Agents sent, the Combat rating of the team against that of the Enemies at Combat start, the result, and the Agents Killed and Incapacitated in the Combat.

## Parameters

The page lists every value of `BASIC_AI_THRESHOLDS`, the engine's defaults, and the weight of every Upgrade other than a Cap Upgrade. A value the engine has that the page does not know appears under Other, without a description, and is passed to the AI as edited. The edits, the launch fields, and More turns are kept in the browser for the next visit.

## Files

| Path          | Content                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------- |
| `index.html`  | The page: the parameters, the launch, the Campaign rows, and the glossary.                  |
| `server.ts`   | Serves the page, holds the Campaigns and their runs, and starts the worker threads.         |
| `worker.ts`   | Loads the engine and the AI from the Implementation clone and plays the Campaigns given it. |
| `protocol.ts` | The messages between the server and its worker threads, and the stats a Campaign reports.   |
