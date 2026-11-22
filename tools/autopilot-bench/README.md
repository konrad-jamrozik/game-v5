# Autopilot Bench

A local page for tuning the Basic Autopilot AI. Set its parameters, e.g. how fast it hires, how large a reserve it keeps, or which Upgrades it favors, launch a number of Campaigns played up to a Turn, and compare them: each Campaign is a row that shows the Agency, the work of its Agents, its strength, and its Missions at the Campaign's Current Turn, and charts of every Turn it has played. Play more Turns of one Campaign or of all of them at any time.

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
- **Agency**: the Current Turn, the Campaign ending with its Turn and Ending reasons, e.g. `Defeat T108 existential op` when a Response Mission site of the Existential level Expired or was Lost, which the Fought list does not show because no Combat was fought, Panic, money, funding, projected income and upkeep, Serving Agents against the Agent cap, Agents hired beyond those the Campaign started with, and Agents Killed.
- **Work**: Serving Agents by the kind of their Current assignment, those In transit included, with those on Training and on Standby split into the Basic Autopilot AI's Rested deployable Agents and the rest, so that the two Rested deployable counts add up to the number after `CR ready`. Then `Inv`, the Active Investigations, and the name of the Lead of each, with the Agents of its Current team.
- **Strength**: `CR ready`, the Combat rating, as `previewDeployment` reports it, of the Agents the Basic Autopilot AI may form a team of for a Mission site: its Rested deployable Agents, i.e. the Deployable Agents, those on Standby or Training that can take orders and do not meet the incapacitation condition with their current values, which the engine reports as `ableToFight`, that are also Fit to start work, with their number out of all Serving Agents; a team is further limited by the free Transport cap. `CR all`, the Combat rating of every Serving Agent at full health and exhaustion 0, i.e. the sum of the Agents' base skills rounded down, scaled by the ratio between their Combat rating and the sum of their current effective skills, so that whatever the engine adds to that sum, e.g. a bonus for Upgrades, is kept. Then the mean base skill, the Transport cap and Training cap, and the acquisitions of each Upgrade.
- **Missions**: the Response and the Initiative Missions Won and Lost, and the Mission sites of each kind Expired; for each Faction, the next Initiative Mission site to win against it, one Initiative operation level above the highest it has Won, or that the Faction is Eliminated. Below the next Mission site, four checks, one per line, each 🟢 when it holds and 🔴 when not:
  - **Site**: an Active Mission site of it against the Faction is available, with the Turns until it expires; when none is, the state of the Faction's discovered Lead that creates it: available for the first time, investigated for the first time, or completed at least once, and how many times.
  - **CR**: `CR ready` against the Combat rating of the MissionSiteArchetype's Enemies, as a whole percentage, exceeds the Campaign's `combatMarginPct`.
  - **Agents**: the Rested deployable Agents are at least the Agents needed, one per the Campaign's `enemiesPerAgent` Enemies, rounded up.
  - **Transport**: the free Transport cap, i.e. Transport cap less the Deployed Agents, is at least the Agents needed.

  The last three are the tests of the Basic Autopilot AI's winning team, read from all Rested deployable Agents together.

- **Fought**, below the layers, one per line: the last four Missions, the latest first, each read from the Turn report of the Advance turn that fought its Combat, which the worker thread reads after every Turn. Each shows the Turn, the kind of Mission site and its name, the Agents sent, the Combat rating of the team against that of the Enemies at Combat start, the result, and the Agents Killed and Incapacitated in the Combat.
- **Charts**, at the bottom of the block, side by side where the page is wide enough: five per-Turn charts of every Turn the Campaign has played, from Turn 1 to its Current Turn, which grow as it plays. Hovering a Turn shows its values, and the ⤢ button beside a chart's title shows that chart full screen until Escape, its ✕ button, or a press outside it closes it. A full-screen chart shows the hovered Turn's values on one line below the plot, e.g. `Turn 13: Money 370 · Serving Agents 10 · …`, rather than in a tooltip over it, so that they never hide the chart. The worker thread wraps the Basic Autopilot AI's Player API, without changing what the AI does, so that it reads the Serving Agents just before the AI requests Advance turn, i.e. at the end of the Turn's player phase, and the Turn report and the next Turn's start right after it. Each Turn's values go to the page once, as a few short arrays of numbers.
  - **Agents by status**: a stacked bar per Turn of the Serving Agents at the end of its player phase, and of the Current Turn as they are now, in seven groups, bottom to top: on Standby, on Training, Contracting, on an Investigation, Deployed, Recovering, and In transit, whatever the Assignment they are in transit to.
  - **Finances**: per ended Turn, its income stacked above 0, i.e. the funding the income step used, contracting income, which is the income less that funding, and the money of the Consequences of the Missions its Advance turn resolved; and its expenditures stacked below 0, i.e. upkeep, the money `hireAgent` spent, and the money `purchaseUpgrade` spent on Cap Upgrades and on the other Upgrades, each the money after the action less the money before, as the Action record holds it. The Net flow line is the money at the next Turn's start less the money at this Turn's start, so it also holds what no bar shows, e.g. the money of an Expired Mission site's Consequences, or a Mission's Consequences that cost money, which Mission rewards leaves out.
  - **Assets at Turn start**: lines per Turn of the money, on the left axis, and of the Serving Agents, the Agent cap, the Transport cap, and the Training cap, on the right axis.
  - **Agents by effective skill**: a stacked bar per Turn, at the same moment as Agents by status, of the Serving Agents per effective skill band of 50, i.e. 0–49, 50–99, and so on up to the highest band any Agent of the Campaign reached, the lowest at the bottom. A band without an Agent draws nothing.
  - **Combat strength**: per Turn, at the same moment as Agents by status, the game's Combat strength chart: a stacked bar of the Combat rating of every Serving Agent taken as one side, as `previewDeployment` reports it, whose lower part is that of the Deployable Agents and upper part the rest of it; and two lines, the Creation Combat rating of the last Mission site created and the mean of the last five, rounded down, from the first Turn a Mission site exists. The worker thread takes a Mission site's `creationCombatRating` when the engine reports one, and otherwise the Combat rating of its Enemies the first time it sees the Mission site, while they are still as created; a Campaign launched before the chart existed shows it empty.

## Parameters

The page lists every value of `BASIC_AI_THRESHOLDS`, the engine's defaults, and the weight of every Upgrade other than a Cap Upgrade. A value the engine has that the page does not know appears under Other, without a description, and is passed to the AI as edited. The edits, the launch fields, and More turns are kept in the browser for the next visit.

**Changes** lists every parameter and Upgrade weight that differs from `BASIC_AI_THRESHOLDS`, old and new, each with a Revert button, and the same list as text for `BASIC_AI_THRESHOLDS` in the Implementation's `src/ai/basic/basic-autopilot-ai.ts`. **Copy changes** in the top bar copies that text, e.g. to hand it to Claude to apply. Nothing on the page writes to either repository.

## Files

| Path          | Content                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------- |
| `index.html`  | The page: the parameters, the launch, the Campaign rows, and the glossary.                  |
| `server.ts`   | Serves the page, holds the Campaigns and their runs, and starts the worker threads.         |
| `worker.ts`   | Loads the engine and the AI from the Implementation clone and plays the Campaigns given it. |
| `protocol.ts` | The messages between the server and its worker threads, and the stats a Campaign reports.   |
