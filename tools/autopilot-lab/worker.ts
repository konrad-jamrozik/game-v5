/**
 * Autopilot Lab worker thread: loads the engine and the Basic Autopilot AI of one Implementation clone, plays the
 * Campaigns it is given one Turn at a time under Autopilot, and reports, for each, a compact record of what happened:
 * its ending, a few values of every Turn, its Missions, where its Panic came from, and the defects its detectors saw.
 * It reads the game only through Player API, as a player could, except that it wraps the AI's Player API to count the
 * actions it requests.
 */
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { parentPort, workerData } from 'node:worker_threads'
import type { CampaignResult, LabTask, TurnRow } from './protocol.ts'

// The engine's types live in the Implementation repo, which this file does not import types from.
type Any = any
type Result<T> = { ok: true; value: T } | { ok: false; error: { code: string; message: string } }

const port = parentPort
if (port === null) {
  throw new Error('worker.ts runs only as a worker thread of lab.ts.')
}
const { impl } = workerData as { impl: string }

function ok<T>(result: Result<T>): T {
  if (!result.ok) {
    throw new Error(`${result.error.code}: ${result.error.message}`)
  }
  return result.value
}

const booted = (async () => {
  const engine = await import(pathToFileURL(path.join(impl, 'src/engine/index.ts')).href)
  const ai = await import(pathToFileURL(path.join(impl, 'src/ai/index.ts')).href)
  return { ...engine, ...ai }
})()

/** The AI with its Player actions counted, by name and argument, for the Turn being played. */
function counted(ai: Any, counts: Map<string, number>): Any {
  return {
    ...ai,
    step: ({ player }: Any) => {
      const actions: Record<string, Any> = {}
      for (const [op, action] of Object.entries(player.actions as Record<string, Any>)) {
        actions[op] =
          op === 'advanceTurn'
            ? action
            : async (...args: unknown[]) => {
                const key = op === 'purchaseUpgrade' ? `${op} ${String(args[0])}` : op
                counts.set(key, (counts.get(key) ?? 0) + 1)
                return action(...args)
              }
      }
      return ai.step({ player: { ...player, actions } })
    },
  }
}

async function play(task: LabTask): Promise<CampaignResult> {
  const b = await booted
  const thresholds = { ...b.BASIC_AI_THRESHOLDS, ...task.params }
  const counts = new Map<string, number>()
  let n = 0
  const engine = await b.createEngine(
    {
      storage: new b.MemoryStorage(),
      newId: () => `lab-${(n += 1)}`,
      randomNumbers: (count: number) => Array.from({ length: count }, (_, i) => i * 7 + 1),
    },
    { autopilotAis: [counted(b.createBasicAutopilotAi(thresholds), counts)] },
  )
  ok(await engine.session.globalConfiguration.set('autosaveLimit', 0))
  ok(await engine.session.campaign.create({ seed: task.seed }))
  const player = engine.player
  const data = ok<Any>(player.queries.getGameData())
  const rows: TurnRow[] = []
  const detectors = {
    contractingIdleTurns: 0,
    repeatedPurchase: null as string | null,
    strandedWeaponTurns: 0,
    strikeShortTurns: 0,
    negativeNetTurns: 0,
    maxActionsPerTurn: 0,
  }
  const streaks = { contractingIdle: 0, strikeShort: 0, negativeNet: 0 }
  let error: string | null = null
  const began = performance.now()
  for (;;) {
    const live = ok<Any>(player.queries.getCurrentLiveWorldState())
    if (live.ending !== null || live.turn > task.turns) {
      break
    }
    counts.clear()
    const engaged = ok<Any>(await engine.session.autopilot.engage('basic', { kind: 'turnAdvancements', count: 1 }))
    const result = ok<Any>(await engine.session.autopilot.whenDisengaged(engaged.engagementId))
    if (result.reason !== 'limitReached' && result.reason !== 'campaignEnded') {
      error = `Turn ${live.turn}: Autopilot disengaged with ${result.reason}${result.detail ? `: ${result.detail}` : ''}`
      break
    }
    // The Turn just played, as the AI left it is gone; the next Turn's start is read instead, with the actions it made.
    const after = ok<Any>(player.queries.getCurrentLiveWorldState())
    const retired = ok<Any>(player.queries.getCurrentRetiredWorldState())
    const agency = after.agency
    const plan = b.makePlan(after, retired, data, thresholds)
    const actions = [...counts.values()].reduce((s, v) => s + v, 0)
    detectors.maxActionsPerTurn = Math.max(detectors.maxActionsPerTurn, actions)
    for (const [key, times] of counts) {
      if (key.startsWith('purchaseUpgrade') && times >= 3 && detectors.repeatedPurchase === null) {
        detectors.repeatedPurchase = `${key} ×${times} in Turn ${live.turn}`
      }
    }
    const idle = agency.contractingCap > 0 && agency.contractingAgents === 0
    streaks.contractingIdle = idle ? streaks.contractingIdle + 1 : 0
    detectors.contractingIdleTurns = Math.max(detectors.contractingIdleTurns, streaks.contractingIdle)
    streaks.strikeShort = plan.gap ? streaks.strikeShort + 1 : 0
    detectors.strikeShortTurns = Math.max(detectors.strikeShortTurns, streaks.strikeShort)
    const negative = agency.projectedIncome < agency.projectedUpkeep
    streaks.negativeNet = negative ? streaks.negativeNet + 1 : 0
    detectors.negativeNetTurns = Math.max(detectors.negativeNetTurns, streaks.negativeNet)
    const items = agency.equipment.items as Any[]
    const knives = (after.agents as Any[]).filter((a) => a.weapon === agency.equipment.fallbackWeapon).length
    const storedWeapons = items.filter((i) => i.kind === 'weapon' && i.available > 0).length
    if (knives > 0 && storedWeapons > 0) {
      detectors.strandedWeaponTurns += 1
    }
    const agents = after.agents as Any[]
    rows.push({
      turn: live.turn,
      panic: after.panicHundredths / 100,
      money: agency.money,
      funding: agency.funding,
      income: agency.projectedIncome,
      upkeep: agency.projectedUpkeep,
      agents: agency.servingAgents,
      contracting: agency.contractingAgents,
      contractingCap: agency.contractingCap,
      recovery: agents.filter((a) => a.assignment?.kind === 'Recovery').length,
      researchers: agents.filter((a) => a.assignment?.kind === 'Investigation').length,
      research:
        (after.investigations as Any[]).reduce((s, i) => s + ((i.projectedProgressGain as number | null) ?? 0), 0) /
        100,
      strike: plan.strike.length,
      strikeRating: plan.strikeRating,
      goal: plan.goal?.combatRating ?? 0,
      meanSkill: agents.length === 0 ? 0 : agents.reduce((s, a) => s + a.skillHundredths, 0) / agents.length / 100,
      killed: (retired.agents as Any[]).filter((a) => a.agentStatus === 'Killed').length,
      actions,
    })
  }
  const live = ok<Any>(player.queries.getCurrentLiveWorldState())
  const retired = ok<Any>(player.queries.getCurrentRetiredWorldState())
  const siteOf = new Map<string, Any>((retired.missionSites as Any[]).map((s) => [s.id, s]))
  const missions: CampaignResult['missions'] = {}
  const entry = (site: Any) => {
    const key = site.archetype as string
    missions[key] ??= {
      kind: site.kind,
      rating: site.creationCombatRating,
      won: 0,
      lost: 0,
      expired: 0,
      firstWin: null,
    }
    return missions[key]
  }
  const panic = { byLevel: {} as Record<string, number>, reduced: 0 }
  for (const mission of retired.missions as Any[]) {
    const site = siteOf.get(mission.missionSite)
    if (site === undefined) continue
    const e = entry(site)
    if (mission.lifecycle === 'Won') {
      e.won += 1
      e.firstWin = e.firstWin === null ? mission.turnDeployed : Math.min(e.firstWin, mission.turnDeployed)
      panic.reduced += site.rewards.panicReductionHundredths / 100
    } else if (mission.lifecycle === 'Lost') {
      e.lost += 1
      if (site.kind !== 'Response') continue
      const level = `L${site.operationLevel?.level ?? '?'} lost`
      panic.byLevel[level] = (panic.byLevel[level] ?? 0) + site.penalties.panicIncreaseHundredths / 100
    }
  }
  for (const site of retired.missionSites as Any[]) {
    if (site.lifecycle === 'Expired') {
      entry(site).expired += 1
      if (site.kind !== 'Response') continue
      const level = `L${site.operationLevel?.level ?? '?'} expired`
      panic.byLevel[level] = (panic.byLevel[level] ?? 0) + site.penalties.panicIncreaseHundredths / 100
    }
  }
  const outcome: CampaignResult = {
    variant: task.variant,
    seed: task.seed,
    ending:
      live.ending === null
        ? null
        : { ending: live.ending.ending, reasons: live.ending.reasons, turn: live.ending.turn },
    turns: rows.length,
    seconds: (performance.now() - began) / 1000,
    rows,
    missions,
    panic,
    leadsCompleted: (retired.leads as Any[]).filter((l) => l.completionCount > 0).length,
    leadsDiscovered: (retired.leads as Any[]).length,
    upgrades: Object.fromEntries((live.agency.upgrades as Any[]).map((u) => [u.id, u.acquisitions])),
    detectors,
    error,
  }
  if (task.log !== null) {
    fs.writeFileSync(task.log, JSON.stringify(outcome))
  }
  return outcome
}

port.on('message', (task: LabTask) => {
  play(task).then(
    (result) => port.postMessage({ type: 'done', result }),
    (failure: unknown) =>
      port.postMessage({
        type: 'failed',
        variant: task.variant,
        seed: task.seed,
        message: failure instanceof Error ? (failure.stack ?? failure.message) : String(failure),
      }),
  )
})
port.postMessage({ type: 'ready' })
