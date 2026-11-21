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

import type { CampaignStats, ToWorker } from './protocol.ts'

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
  // Each Initiative operation level's MissionSiteArchetype, from Developer API on the scratch Campaign alone, so that
  // a row can name the next Initiative Mission site to win against each Faction. It is fixed game data.
  ok(scratch.session.developer.enable())
  const levels = ok<Any>(scratch.developer.queries.getInitiativeOperationLevels()).missionSiteArchetypes as Any[]
  const names = new Map<string, string>(
    (ok<Any>(scratch.player.queries.getGameData()).missionSiteArchetypes as Any[]).map((a) => [a.id, a.name]),
  )
  for (const item of levels) {
    if (item.level !== null) {
      chain.set(item.level as number, names.get(item.id) ?? item.id)
    }
  }
  exhaustionFreePoints = ok<Any>(scratch.player.queries.getGameData()).agentParameters['exhaustionFreePoints'] as number
  return { MemoryStorage, createEngine, BASIC_AI_THRESHOLDS, createBasicAutopilotAi, upgrades }
}

/** The name of the Initiative Mission site of each Initiative operation level. */
const chain = new Map<number, string>()
/**
 * AgentParameters' `exhaustion_free_points`, up to which an Agent counts as a Rested Agent, so that an Agent on Standby
 * above it is resting, and counts as exhausted in Work.
 */
let exhaustionFreePoints = 0

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
  // The Agents the Basic Autopilot AI may form a team of for a Mission site: its Rested Agents that are able to fight,
  // i.e. those that can be assigned, are Fit for work, are on Standby or Training, have their full health, and have
  // exhaustion of at most exhaustion_free_points.
  const ready = agents.filter(
    (a) =>
      a.canBeAssigned &&
      a.fitForWork &&
      (a.assignment?.kind === 'Standby' || a.assignment?.kind === 'Training') &&
      a.healthLostHundredths === 0 &&
      a.exhaustion <= exhaustionFreePoints &&
      a.ableToFight,
  )
  const ratingReady = ok<Any>(
    player.queries.previewDeployment(
      null,
      ready.map((a) => a.id),
    ),
  ).teamCombatRating as number
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
  for (const a of agents) {
    const assigned = (a.assignment?.kind as string | undefined) ?? 'None'
    const kind = assigned === 'Standby' && a.exhaustion > exhaustionFreePoints ? 'Exhausted' : assigned
    assignments[kind] = (assignments[kind] ?? 0) + 1
  }
  return {
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
    meanSkill:
      agents.length === 0 ? 0 : agents.reduce((s, a) => s + (a.skillHundredths as number), 0) / agents.length / 100,
    upgrades: Object.fromEntries((agency.upgrades as Any[]).map((u) => [u.id, u.acquisitions as number])),
    ratingReady,
    ready: ready.length,
    ratingFresh,
    missions,
    factions: (live.factions as Any[]).map((f) => {
      const top = best.get(f.id)?.level ?? 0
      const level = [...chain.keys()].filter((l) => l > top).sort((x, y) => x - y)[0]
      return {
        id: f.id,
        name: f.name,
        eliminated: f.eliminated,
        best: best.get(f.id) ?? null,
        next: f.eliminated || level === undefined ? null : { level, name: chain.get(level)! },
      }
    }),
    hired: all.length - campaign.initialAgents,
    killed: all.filter((a) => a.agentStatus === 'Killed').length,
    dismissed: all.filter((a) => a.agentStatus === 'Dismissed').length,
    activeInvestigations: live.investigations.length,
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
          report(campaign, false)
        }
        await new Promise((resolve) => setImmediate(resolve))
      },
    },
    { autopilotAis: [b.createBasicAutopilotAi({ ...b.BASIC_AI_THRESHOLDS, ...(params as object) })] },
  )
  ok(await engine.session.globalConfiguration.set('autosaveLimit', 0))
  ok(await engine.session.campaign.create({ seed }))
  const initialAgents = ok<Any>(engine.player.queries.getCurrentLiveWorldState()).agents.length
  const campaign: Campaign = { id, engine, initialAgents, engagementId: null, lastReport: 0 }
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
