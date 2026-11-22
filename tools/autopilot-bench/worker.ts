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

import type { CampaignStats, MissionRecord, ToWorker, TurnPoint } from './protocol.ts'

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
  /** The Turn-start values of the Current Turn, as `TurnPoint.start` holds them. */
  turnStart: number[]
  /** The money the Current Turn's Player actions spent so far: on hiring, on Cap Upgrades, and on other Upgrades. */
  spent: [number, number, number]
  /** The ended Turns not yet reported to server.ts. */
  unsent: TurnPoint[]
  /** The Serving Agents of the Turn whose Advance turn was requested last, read just before it. */
  turnEnd: { status: number[]; skill: number[]; strength: number[] } | null
  /** The Creation Combat rating of every Mission site seen so far, by Instance ID. */
  siteRatings: Map<string, number>
  /** The last Turn recorded in the series. */
  recordedTurn: number
}

/** The Upgrades whose effect raises a cap, by ID: the Cap Upgrades. */
const capUpgrades = new Set<string>()
const CAP_EFFECTS = new Set(['agent_cap', 'transport_cap', 'training_cap'])

/** The width of an effective skill band of the skill chart. */
const SKILL_BAND = 50

/** The Agents of a Turn point, from the Serving Agents as they are now. */
function agentsPoint(agents: readonly Any[]): {
  status: number[]
  skill: number[]
} {
  const status = [0, 0, 0, 0, 0, 0, 0]
  const skill: number[] = []
  for (const a of agents) {
    const kind = a.assignment?.kind as string | undefined
    const group =
      a.agentStatus === 'InTransit'
        ? 6
        : a.agentStatus === 'Recovering' || kind === 'Recovery'
          ? 5
          : kind === 'Standby'
            ? 0
            : kind === 'Training'
              ? 1
              : kind === 'Contracting'
                ? 2
                : kind === 'Investigation'
                  ? 3
                  : kind === 'Deployed'
                    ? 4
                    : 0
    status[group]! += 1
    const band = Math.max(0, Math.floor((a.effectiveSkill as number) / SKILL_BAND))
    while (skill.length <= band) skill.push(0)
    skill[band]! += 1
  }
  return { status, skill }
}

/**
 * A Deployable Agent, as the engine defines it: In base and able to take orders, i.e. At assignment on Standby or
 * Training, and Capable for deployment, i.e. not meeting the incapacitation condition with its current values, which
 * the engine reports as `ableToFight`.
 */
const isDeployable = (a: Any): boolean =>
  a.canBeAssigned && (a.assignment?.kind === 'Standby' || a.assignment?.kind === 'Training') && a.ableToFight

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

/** The number that ends a Mission site's Instance ID, which orders the Mission sites by creation. */
function siteNumber(id: string): number {
  return Number(/(\d+)$/.exec(id)?.[1] ?? 0)
}

/**
 * The Combat strength of a Turn point, as the game's Combat strength chart holds it: the Combat rating of the
 * Deployable Agents and of every Serving Agent, each taken as one side, then the Creation Combat rating of the last
 * Mission site created and the mean of the last five, rounded down, or -1 for both while no Mission site exists. A
 * Mission site's Creation Combat rating is the engine's `creationCombatRating` when it reports one, and otherwise the
 * Combat rating of its Enemies the first time the bench sees it, i.e. while they are still as created, since the bench
 * reads every Turn.
 */
function strengthPoint(campaign: Campaign, player: Any): number[] {
  const live = ok<Any>(player.queries.getCurrentLiveWorldState())
  const retired = ok<Any>(player.queries.getCurrentRetiredWorldState())
  const agents: Any[] = live.agents
  for (const site of [...(live.missionSites as Any[]), ...(retired.missionSites as Any[])]) {
    if (!campaign.siteRatings.has(site.id)) {
      campaign.siteRatings.set(site.id, (site.creationCombatRating ?? site.enemiesCombatRating) as number)
    }
  }
  const ordered = [...campaign.siteRatings.entries()].sort((x, y) => siteNumber(x[0]) - siteNumber(y[0]))
  const last = ordered.slice(-5).map(([, rating]) => rating)
  const sites =
    last.length === 0 ? [-1, -1] : [last[last.length - 1]!, Math.floor(last.reduce((a, b) => a + b, 0) / last.length)]
  return [ratingOf(player, agents.filter(isDeployable)), ratingOf(player, agents), ...sites]
}

function startPoint(live: Any): number[] {
  const agency = live.agency
  return [agency.money, agency.servingAgents, agency.agentCap, agency.transportCap, agency.trainingCap]
}

/**
 * The Basic Autopilot AI, with its Player API wrapped so that the bench sees each Turn's player phase end: just before
 * the AI requests Advance turn, it reads the Serving Agents, and once the Advance turn has ended the Turn, it reads the
 * Turn report and the next Turn's start. It also reads the money each `hireAgent` and `purchaseUpgrade` spent, the
 * money after it less the money before, as the Action record holds it. The AI plays exactly as it would unwrapped.
 */
function observed(ai: Any, holder: { campaign: Campaign | null }): Any {
  return {
    ...ai,
    step: ({ player }: Any) => {
      const host = () => holder.campaign?.engine.player
      const money = () => ok<Any>(host().queries.getCurrentLiveWorldState()).agency.money as number
      const spend = async (slot: 0 | 1 | 2, action: () => Promise<Any>) => {
        const campaign = holder.campaign
        if (campaign === null) return action()
        const before = money()
        const result = await action()
        campaign.spent[slot] += before - money()
        return result
      }
      const actions = {
        ...player.actions,
        hireAgent: () => spend(0, () => player.actions.hireAgent()),
        purchaseUpgrade: (upgrade: string) =>
          spend(capUpgrades.has(upgrade) ? 1 : 2, () => player.actions.purchaseUpgrade(upgrade)),
        advanceTurn: async () => {
          const campaign = holder.campaign
          if (campaign === null) return player.actions.advanceTurn()
          campaign.turnEnd = {
            ...agentsPoint(ok<Any>(host().queries.getCurrentLiveWorldState()).agents),
            strength: strengthPoint(campaign, host()),
          }
          const result = await player.actions.advanceTurn()
          endTurn(campaign)
          return result
        },
      }
      return ai.step({ player: { ...player, actions } })
    },
  }
}

/**
 * Records the Turn that an Advance turn has just ended, from its Turn report, and the start of the next one, once per
 * Turn report. It runs right after the Advance turn, and again after each step and after the engagement ends, since
 * an Advance turn that ends the engagement can let the run finish before the wrapper above resumes.
 */
function endTurn(campaign: Campaign) {
  const player = campaign.engine.player
  const end = campaign.turnEnd
  const report = ok<Any>(player.queries.getTurnReport())
  if (report === null || end === null || report.turn <= campaign.recordedTurn) return
  campaign.recordedTurn = report.turn
  campaign.turnEnd = null
  const funding = report.income.funding as number
  const rewards = (report.missions as Any[]).reduce((sum, m) => sum + Math.max(0, m.consequence.money as number), 0)
  const [hiring, caps, other] = campaign.spent
  campaign.unsent.push({
    turn: report.turn,
    start: campaign.turnStart,
    status: end.status,
    skill: end.skill,
    strength: end.strength,
    money: [funding, report.income.income - funding, rewards, report.upkeep.upkeep, hiring, caps, other],
  })
  campaign.spent = [0, 0, 0]
  campaign.turnStart = startPoint(ok<Any>(player.queries.getCurrentLiveWorldState()))
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
  const { BASIC_AI_THRESHOLDS, createBasicAutopilotAi } = await import(
    pathToFileURL(path.join(impl, 'src/ai/index.ts')).href
  )
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
  for (const u of upgrades) {
    if (CAP_EFFECTS.has(u.effect)) capUpgrades.add(u.id)
  }
  // Each Initiative operation level's MissionSiteArchetype, from Developer API on the scratch Campaign alone, so that
  // a row can name the next Initiative Mission site to win against each Faction. It is fixed game data.
  ok(scratch.session.developer.enable())
  const levels = ok<Any>(scratch.developer.queries.getInitiativeOperationLevels()).missionSiteArchetypes as Any[]
  for (const a of ok<Any>(scratch.player.queries.getGameData()).missionSiteArchetypes as Any[]) {
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
  return { MemoryStorage, createEngine, BASIC_AI_THRESHOLDS, createBasicAutopilotAi, upgrades }
}

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
  const ready = agents.filter(isRestedDeployable)
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
  return {
    series: campaign.unsent.splice(0),
    current: {
      turn: live.turn,
      start: campaign.turnStart,
      ...agentsPoint(agents),
      strength: strengthPoint(campaign, player),
      money: null,
    },
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

function report(campaign: Campaign, force: boolean) {
  const now = Date.now()
  if (!force && now - campaign.lastReport < REPORT_MS) {
    return
  }
  campaign.lastReport = now
  port.postMessage({ type: 'stats', id: campaign.id, stats: statsOf(campaign) })
}

async function create(id: string, seed: string, params: unknown) {
  const b = await booted
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
          endTurn(campaign)
          readMissions(campaign)
          report(campaign, false)
        }
        await new Promise((resolve) => setImmediate(resolve))
      },
    },
    { autopilotAis: [observed(b.createBasicAutopilotAi({ ...b.BASIC_AI_THRESHOLDS, ...(params as object) }), holder)] },
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
    turnStart: startPoint(live),
    spent: [0, 0, 0],
    unsent: [],
    turnEnd: null,
    siteRatings: new Map(),
    recordedTurn: 0,
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
  endTurn(campaign)
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
    await create(message.id, message.seed, message.params)
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
  (b) => port.postMessage({ type: 'ready', defaults: b.BASIC_AI_THRESHOLDS, upgrades: b.upgrades }),
  (e: unknown) => port.postMessage({ type: 'error', message: e instanceof Error ? (e.stack ?? e.message) : String(e) }),
)

port.on('message', (message: ToWorker) => {
  handle(message).catch((e: unknown) =>
    port.postMessage({
      type: 'failed',
      id: 'id' in message ? message.id : null,
      message: e instanceof Error ? e.message : String(e),
    }),
  )
})
