/**
 * Worker thread of server.ts. It loads the engine and the Basic Autopilot AI straight from the TypeScript source of the
 * game-v5-impl-web clone, as it is on disk when the thread starts, and plays the Campaigns server.ts gives it. Each
 * Campaign has an engine of its own, i.e. a Session of its own, whose only Autopilot AI is the Basic Autopilot AI built
 * with that Campaign's parameters, and its Turns are played by ordinary Autopilot engagements with the Autopilot limit
 * `turnAdvancements`. Everything the thread reports is read through Player API queries.
 */
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { parentPort, workerData } from 'node:worker_threads'

import type { CampaignStats, MissionRecord, ToWorker } from './protocol.ts'

const impl = (workerData as { impl: string }).impl
const port = parentPort!

/** How often a Campaign that is playing reports its progress, and its stats, in milliseconds. */
const REPORT_MS = 250

type Result<T> = { ok: true; value: T } | { ok: false; error: { code: string; message: string } }
// The engine's own types live in the Implementation repo, which this file does not import types from.
type Any = any

function ok<T>(result: Result<T>): T {
  if (!result.ok) {
    throw new Error(`${result.error.code}: ${result.error.message}`)
  }
  return result.value
}

interface Campaign {
  readonly id: string
  readonly engine: Any
  /** The Agents the Campaign started with, so that the rest are the Agents hired. */
  readonly initialAgents: number
  /** The active Autopilot engagement, while a run is playing. */
  engagementId: string | null
  lastReport: number
  /** The last Missions fought, the latest first, and the Turn of the last Turn report read for them. */
  recentMissions: MissionRecord[]
  missionsReadTurn: number
  /** How many History entries have been reported to server.ts. */
  sentEntries: number
  /** The Tuning parameters the Campaign plays with, and the game data, for deriving the AI's plan. */
  readonly thresholds: unknown
  readonly gameData: Any
}

/**
 * A Deployable Agent: the engine decides it and reports it on the Agent's view as `deployable`, so that the bench never
 * holds a definition of its own that could drift from the engine's.
 */
const isDeployable = (a: Any): boolean => a.deployable === true

/**
 * A Rested deployable Agent of the Basic Autopilot AI: a Deployable Agent that is also Fit to start work, i.e. one the
 * AI may form a team of for a Mission site.
 */
const isRestedDeployable = (a: Any): boolean => isDeployable(a) && a.fitForWork

/** The Combat rating of the given Agents taken as one side, as `previewDeployment` reports it; 0 for none. */
function ratingOf(player: Any, agents: readonly Any[]): number {
  if (agents.length === 0) return 0
  return ok<Any>(
    player.queries.previewDeployment(
      null,
      agents.map((a) => a.id),
    ),
  ).teamCombatRating as number
}

/** How many of the last Missions fought a Campaign keeps. */
const RECENT_MISSIONS = 4

/**
 * Reads the Missions the latest Advance turn fought from its Turn report, once per Turn report, so that a Campaign
 * keeps its last Missions although each Turn report holds only one Advance turn.
 */
function readMissions(campaign: Campaign) {
  const report = ok<Any>(campaign.engine.player.queries.getTurnReport())
  if (report === null || report.turn === campaign.missionsReadTurn) {
    return
  }
  campaign.missionsReadTurn = report.turn
  for (const mission of report.missions as Any[]) {
    const combat = (report.combatReports as Any[]).find((c) => c.mission === mission.mission)
    const start = combat?.ratings?.find((r: Any) => r.round === 0) ?? combat?.ratings?.[0]
    campaign.recentMissions.unshift({
      mission: mission.mission,
      turn: report.turn,
      name: archetypeNames.get(mission.missionSiteArchetype) ?? mission.missionSiteArchetype,
      kind: mission.kind,
      result: mission.result,
      outcome: combat?.outcome ?? null,
      agents: combat?.agents?.length ?? 0,
      agentsRating: start?.agents ?? null,
      enemiesRating: start?.enemies ?? null,
      killed: (mission.killed as Any[]).length,
      incapacitated:
        combat === undefined
          ? 0
          : (combat.participants as Any[]).filter((p) => p.side === 'agent' && p.final.condition === 'incapacitated')
              .length,
    })
  }
  campaign.recentMissions.length = Math.min(campaign.recentMissions.length, RECENT_MISSIONS)
}

async function boot() {
  const { MemoryStorage, createEngine } = await import(pathToFileURL(path.join(impl, 'src/engine/index.ts')).href)
  const { BASIC_AI_THRESHOLDS, createBasicAutopilotAi, makePlan } = await import(
    pathToFileURL(path.join(impl, 'src/ai/index.ts')).href
  )
  // The game's own reduction of a History entry to what its Agency charts read, which the page draws them from.
  chartEntryOf = (await import(pathToFileURL(path.join(impl, 'src/web/agency-charts.ts')).href)).chartEntryOf
  // The Upgrades, read from a scratch Campaign, so that the page can name them and weigh them.
  const scratch = await createEngine({
    storage: new MemoryStorage(),
    newId: () => 'x',
    randomNumbers: (n: number) => new Array<number>(n).fill(1),
  })
  ok(await scratch.session.campaign.create({ seed: 'autopilot-bench' }))
  const upgrades = (ok<Any>(scratch.player.queries.getCurrentLiveWorldState()).agency.upgrades as Any[]).map((u) => ({
    id: u.id as string,
    name: u.name as string,
    effect: u.effect as string,
  }))
  // Each Initiative operation level's MissionSiteArchetype, from Developer API on the scratch Campaign alone, so that
  // a row can name the next Initiative Mission site to win against each Faction. It is fixed game data.
  ok(scratch.session.developer.enable())
  const levels = ok<Any>(scratch.developer.queries.getInitiativeOperationLevels()).missionSiteArchetypes as Any[]
  const data = ok<Any>(scratch.player.queries.getGameData())
  const chartData = {
    ranks: (data.ranks as Any[]).map((r) => ({ name: r.name as string, minBaseSkill: r.minBaseSkill as number })),
    agentParameters: data.agentParameters as Record<string, number>,
  }
  for (const a of data.missionSiteArchetypes as Any[]) {
    archetypeNames.set(a.id, a.name)
    archetypeEnemies.set(a.id, {
      rating: a.enemiesCombatRating as number,
      count: (a.enemies as Any[]).reduce((sum, e) => sum + (e.count as number), 0),
    })
  }
  for (const item of levels) {
    if (item.level !== null) {
      chain.set(item.level as number, item.id as string)
    }
  }
  planOf = makePlan
  return { MemoryStorage, createEngine, BASIC_AI_THRESHOLDS, createBasicAutopilotAi, upgrades, chartData }
}

/** The Implementation's `chartEntryOf`, which reduces a History entry to what the Agency charts read. */
let chartEntryOf: (entry: Any) => unknown = () => null

/** The Implementation's `makePlan`, which derives the Basic Autopilot AI's plan from Player-visible information. */
let planOf: ((live: Any, retired: Any, data: Any, thresholds: unknown) => Any) | null = null

/** The name of the Initiative Mission site of each Initiative operation level. */
const chain = new Map<number, string>()
/** The Combat rating of each MissionSiteArchetype's Enemies and their number, by its ID. */
const archetypeEnemies = new Map<string, { rating: number; count: number }>()
/** The name of each MissionSiteArchetype, by its ID. */
const archetypeNames = new Map<string, string>()

const booted = boot()
const campaigns = new Map<string, Campaign>()

/** Every statistic the page shows of a Campaign, from Player API queries alone. */
function statsOf(campaign: Campaign): CampaignStats {
  const player = campaign.engine.player
  const live = ok<Any>(player.queries.getCurrentLiveWorldState())
  const retired = ok<Any>(player.queries.getCurrentRetiredWorldState())
  const agency = live.agency
  const agents: Any[] = live.agents
  const ratingNow = ok<Any>(
    player.queries.previewDeployment(
      null,
      agents.map((a) => a.id),
    ),
  ).teamCombatRating as number
  // The Combat rating at full health and exhaustion 0: each Agent's effective skill is then its base skill, rounded
  // down. Whatever the engine adds on top of the sum of effective skills, e.g. a bonus for Upgrades, is carried over
  // as the ratio of its rating to that sum.
  const skillNow = agents.reduce((s, a) => s + (a.ableToFight ? (a.effectiveSkill as number) : 0), 0)
  const skillFresh = agents.reduce((s, a) => s + Math.floor((a.skillHundredths as number) / 100), 0)
  const ratingFresh = Math.round(skillFresh * (skillNow > 0 ? ratingNow / skillNow : 1))
  // The Agents the Basic Autopilot AI may form a team of for a Mission site: its Rested deployable Agents.
  const ready = agents.filter(isDeployable)
  const ratingReady = ratingOf(player, ready)
  const missions = { Response: { won: 0, lost: 0, expired: 0 }, Initiative: { won: 0, lost: 0, expired: 0 } }
  const siteById = new Map<string, Any>(retired.missionSites.map((s: Any) => [s.id, s]))
  const best = new Map<string, { level: number | null; name: string }>()
  for (const mission of retired.missions as Any[]) {
    const kind = mission.kind as 'Response' | 'Initiative'
    if (mission.lifecycle === 'Won') {
      missions[kind].won += 1
    } else if (mission.lifecycle === 'Lost') {
      missions[kind].lost += 1
    }
    const site = siteById.get(mission.missionSite)
    if (kind === 'Initiative' && mission.lifecycle === 'Won' && site !== undefined) {
      const level = site.initiativeOperationLevel as number | null
      const prior = best.get(site.targetFaction)
      if (prior === undefined || (level ?? -1) > (prior.level ?? -1)) {
        best.set(site.targetFaction, { level, name: site.name })
      }
    }
  }
  for (const site of retired.missionSites as Any[]) {
    if (site.lifecycle === 'Expired') {
      missions[site.kind as 'Response' | 'Initiative'].expired += 1
    }
  }
  const all = [...agents, ...(retired.agents as Any[])]
  const assignments: Record<string, number> = {}
  const restedDeployable: Record<string, number> = {}
  for (const a of agents) {
    const kind = (a.assignment?.kind as string | undefined) ?? 'None'
    assignments[kind] = (assignments[kind] ?? 0) + 1
    if (isRestedDeployable(a)) {
      restedDeployable[kind] = (restedDeployable[kind] ?? 0) + 1
    }
  }
  // The per-Turn charts read the History, as the game's Agency charts do: the History entries not yet reported, and the
  // Open History entry for the Current Turn.
  const history = ok<Any>(player.queries.getHistory())
  const moneyAt = new Map<number, number>(
    (history.turnSeries.moneyAtStartOfTurn as Any[]).map((v) => [v.turn as number, v.value as number]),
  )
  const fresh = (history.entries as Any[]).slice(campaign.sentEntries)
  campaign.sentEntries += fresh.length
  const open = history.openEntry
  return {
    series: fresh.map((entry) => ({ entry: chartEntryOf(entry), moneyAtStart: moneyAt.get(entry.turn) ?? null })),
    current: {
      open: { turn: open.turn, turnStart: open.turnStart, turnEnd: open.turnEnd },
      moneyAtStart: moneyAt.get(open.turn) ?? null,
    },
    sites: [...(live.missionSites as Any[]), ...(retired.missionSites as Any[])].map((s) => ({
      id: s.id as string,
      turnCreated: s.turnCreated as number,
      creationCombatRating: s.creationCombatRating as number,
    })),
    turn: live.turn,
    ending:
      live.ending === null
        ? null
        : { ending: live.ending.ending, reasons: live.ending.reasons, turn: live.ending.turn },
    panicHundredths: live.panicHundredths,
    money: agency.money,
    funding: agency.funding,
    projectedIncome: agency.projectedIncome,
    projectedUpkeep: agency.projectedUpkeep,
    agents: agency.servingAgents,
    agentCap: agency.agentCap,
    transportCap: agency.transportCap,
    trainingCap: agency.trainingCap,
    assignments,
    restedDeployable,
    meanSkill:
      agents.length === 0 ? 0 : agents.reduce((s, a) => s + (a.skillHundredths as number), 0) / agents.length / 100,
    upgrades: Object.fromEntries((agency.upgrades as Any[]).map((u) => [u.id, u.acquisitions as number])),
    ratingReady,
    ready: ready.length,
    ratingFresh,
    missions,
    recentMissions: [...campaign.recentMissions],
    factions: (live.factions as Any[]).map((f) => {
      const top = best.get(f.id)?.level ?? 0
      const level = [...chain.keys()].filter((l) => l > top).sort((x, y) => x - y)[0]
      if (f.eliminated || level === undefined) {
        return { id: f.id, name: f.name, eliminated: f.eliminated, best: best.get(f.id) ?? null, next: null }
      }
      const archetype = chain.get(level)!
      const enemies = archetypeEnemies.get(archetype)
      // The discovered Lead of this Faction whose completion creates the Mission site.
      const lead = (retired.leads as Any[]).find((l) => l.faction === f.id && l.createsMissionSite === archetype)
      // An Active Mission site of it against this Faction, which a team can be deployed to now.
      const site = (live.missionSites as Any[]).find(
        (m) => m.archetype === archetype && m.targetFaction === f.id && m.lifecycle === 'Active',
      )
      return {
        id: f.id,
        name: f.name,
        eliminated: f.eliminated,
        best: best.get(f.id) ?? null,
        next: {
          level,
          name: archetypeNames.get(archetype) ?? archetype,
          enemiesRating: enemies?.rating ?? 0,
          enemies: enemies?.count ?? 0,
          site: site === undefined ? null : { turnsUntilExpiration: site.turnsUntilExpiration as number },
          lead:
            lead === undefined
              ? null
              : {
                  completions: lead.completionCount as number,
                  investigating: lead.activeInvestigation !== null,
                  available: lead.canBeInvestigatedNow === true || lead.status === 'Available',
                  status: lead.status as string,
                },
        },
      }
    }),
    strike: strikeOf(campaign, live, retired),
    ammoShort: (agency.equipment.items as Any[])
      .filter((item) => item.kind === 'ammo' && item.ammoShort === true)
      .map((item) => item.name as string),
    research:
      (live.investigations as Any[]).reduce((sum, i) => sum + ((i.projectedProgressGain as number | null) ?? 0), 0) /
      100,
    hired: all.length - campaign.initialAgents,
    killed: all.filter((a) => a.agentStatus === 'Killed').length,
    dismissed: all.filter((a) => a.agentStatus === 'Dismissed').length,
    activeInvestigations: live.investigations.length,
    investigatedLeads: (live.investigations as Any[]).map((i) => ({
      name: i.leadName as string,
      agents: (i.currentTeam as Any[]).length,
    })),
  }
}

/** BASICAI: the Strike team and what it answers, from the Implementation's own plan. */
function strikeOf(campaign: Campaign, live: Any, retired: Any): CampaignStats['strike'] {
  if (planOf === null) {
    return null
  }
  const plan = planOf(live, retired, campaign.gameData, campaign.thresholds)
  if (plan.goal === null) {
    return null
  }
  const rungs = [...(plan.rungs as Map<string, Any>).values()].sort((a, b) => a.combatRating - b.combatRating)
  const rung = rungs[0]
  return {
    size: plan.strike.length as number,
    wanted: plan.strikeWanted as number,
    rating: plan.strikeRating as number,
    goal: plan.goal.combatRating as number,
    gap: plan.gap as boolean,
    threat: plan.threat === null ? null : (plan.threat.combatRating as number),
    rung:
      rung === undefined
        ? null
        : { name: archetypeNames.get(rung.archetype) ?? (rung.archetype as string), rating: rung.combatRating },
  }
}

function report(campaign: Campaign, force: boolean) {
  const now = Date.now()
  if (!force && now - campaign.lastReport < REPORT_MS) {
    return
  }
  campaign.lastReport = now
  port.postMessage({ type: 'stats', id: campaign.id, stats: statsOf(campaign) })
}

async function create(message: Extract<ToWorker, { type: 'create' }>) {
  const { id, seed, params } = message
  const b = await booted
  const thresholds = { ...b.BASIC_AI_THRESHOLDS, ...(params as object) }
  let n = 0
  const holder: { campaign: Campaign | null } = { campaign: null }
  const engine = await b.createEngine(
    {
      storage: new b.MemoryStorage(),
      newId: () => `${id}-${(n += 1)}`,
      randomNumbers: (count: number) => Array.from({ length: count }, (_, i) => i * 7 + 1),
      // Between two steps of the Autopilot AI, i.e. after each Turn it plays: report progress, and let the other
      // Campaigns of this thread and the messages from server.ts run.
      yieldToHost: async () => {
        const campaign = holder.campaign
        if (campaign !== null && campaign.engagementId !== null) {
          readMissions(campaign)
          report(campaign, false)
        }
        await new Promise((resolve) => setImmediate(resolve))
      },
    },
    { autopilotAis: [b.createBasicAutopilotAi(thresholds)] },
  )
  ok(await engine.session.globalConfiguration.set('autosaveLimit', 0))
  ok(await engine.session.campaign.create({ seed }))
  const live = ok<Any>(engine.player.queries.getCurrentLiveWorldState())
  const initialAgents = live.agents.length
  const campaign: Campaign = {
    id,
    engine,
    initialAgents,
    engagementId: null,
    lastReport: 0,
    recentMissions: [],
    missionsReadTurn: 0,
    sentEntries: 0,
    thresholds,
    gameData: ok<Any>(engine.player.queries.getGameData()),
  }
  holder.campaign = campaign
  campaigns.set(id, campaign)
  report(campaign, true)
}

/** Plays `turns` Turns in one Autopilot engagement, or fewer when the Campaign ends or the run is stopped. */
async function play(campaign: Campaign, turns: number) {
  const engine = campaign.engine
  if (ok<Any>(engine.player.queries.getCurrentLiveWorldState()).ending !== null) {
    port.postMessage({ type: 'done', id: campaign.id, reason: 'campaignEnded', detail: null, stats: statsOf(campaign) })
    return
  }
  const engaged = ok<Any>(await engine.session.autopilot.engage('basic', { kind: 'turnAdvancements', count: turns }))
  campaign.engagementId = engaged.engagementId
  const result = ok<Any>(await engine.session.autopilot.whenDisengaged(engaged.engagementId))
  campaign.engagementId = null
  readMissions(campaign)
  port.postMessage({
    type: 'done',
    id: campaign.id,
    reason: result.reason,
    detail: result.detail ?? null,
    stats: statsOf(campaign),
  })
}

async function handle(message: ToWorker) {
  if (message.type === 'create') {
    await create(message)
    return
  }
  const campaign = campaigns.get(message.id)
  if (campaign === undefined) {
    throw new Error(`No Campaign ${message.id} on this thread.`)
  }
  if (message.type === 'play') {
    await play(campaign, message.turns)
  } else if (message.type === 'stop') {
    if (campaign.engagementId !== null) {
      ok(await campaign.engine.session.autopilot.disengage(campaign.engagementId))
    }
  } else if (message.type === 'remove') {
    if (campaign.engagementId !== null) {
      await campaign.engine.session.autopilot.disengage(campaign.engagementId)
    }
    campaigns.delete(message.id)
  }
}

booted.then(
  (b) =>
    port.postMessage({
      type: 'ready',
      defaults: b.BASIC_AI_THRESHOLDS,
      upgrades: b.upgrades,
      chartData: b.chartData,
    }),
  (e: unknown) => port.postMessage({ type: 'error', message: e instanceof Error ? (e.stack ?? e.message) : String(e) }),
)

port.on('message', (message: ToWorker) => {
  handle(message).catch((e: unknown) => {
    port.postMessage({
      type: 'failed',
      id: 'id' in message ? message.id : null,
      message: e instanceof Error ? e.message : String(e),
    })
  })
})
