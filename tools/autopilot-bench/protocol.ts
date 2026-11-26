/** The messages between server.ts and its worker threads, and the stats of a Campaign that the page shows. */

/** From server.ts to a worker thread. */
export type ToWorker =
  | { readonly type: 'create'; readonly id: string; readonly seed: string; readonly params: unknown }
  | { readonly type: 'play'; readonly id: string; readonly turns: number }
  | { readonly type: 'stop'; readonly id: string }
  | { readonly type: 'remove'; readonly id: string }

export interface UpgradeInfo {
  readonly id: string
  readonly name: string
  readonly effect: string
}

/** The game data the Implementation's `agencyCharts` reads beside the History: the Ranks and the AgentParameters. */
export interface ChartDataInfo {
  readonly ranks: readonly { readonly name: string; readonly minBaseSkill: number }[]
  readonly agentParameters: Readonly<Record<string, number>>
}

/** From a worker thread to server.ts. */
export type FromWorker =
  | {
      readonly type: 'ready'
      readonly defaults: Record<string, unknown>
      readonly upgrades: readonly UpgradeInfo[]
      readonly chartData: ChartDataInfo
    }
  | { readonly type: 'error'; readonly message: string }
  | { readonly type: 'stats'; readonly id: string; readonly stats: CampaignStats }
  | {
      readonly type: 'done'
      readonly id: string
      readonly reason: string
      readonly detail: string | null
      readonly stats: CampaignStats
    }
  | { readonly type: 'failed'; readonly id: string | null; readonly message: string }

/** One Mission fought, read from the Turn report of the Advance turn that fought its Combat. */
export interface MissionRecord {
  readonly mission: string
  /** The Turn that Advance turn ended. */
  readonly turn: number
  readonly name: string
  readonly kind: string
  readonly result: 'Won' | 'Lost'
  /** The Combat outcome for the Agents' side, e.g. Won, Wiped, or Retreated. */
  readonly outcome: string | null
  /** The Agents of the team sent. */
  readonly agents: number
  /** The Combat rating of each side at Combat start. */
  readonly agentsRating: number | null
  readonly enemiesRating: number | null
  readonly killed: number
  /** Agents of the team whose final condition in the Combat is Incapacitated. */
  readonly incapacitated: number
}

export interface MissionCounts {
  won: number
  lost: number
  expired: number
}

/**
 * One ended Turn of a Campaign for the per-Turn charts: its History entry, reduced by the Implementation's
 * `chartEntryOf` to what the charts read, and its Money at the start of turn.
 */
export interface TurnPoint {
  readonly entry: unknown
  readonly moneyAtStart: number | null
}

/** The Current Turn for the per-Turn charts: the Open History entry, reduced alike, and its Money at the start of turn. */
export interface CurrentPoint {
  readonly open: { readonly turn: number; readonly turnStart: unknown; readonly turnEnd: unknown }
  readonly moneyAtStart: number | null
}

/** What the page shows of a Campaign at its Current Turn, all read through Player API queries. */
export interface CampaignStats {
  /**
   * The ended Turns not yet reported, in Turn order. server.ts appends them to the Campaign's series and sends the page
   * only the part of it the page does not have.
   */
  readonly series: readonly TurnPoint[]
  readonly current: CurrentPoint
  /** Every Mission site, live and Retired, as the Combat strength chart reads it. */
  readonly sites: readonly {
    readonly id: string
    readonly turnCreated: number
    readonly creationCombatRating: number
  }[]
  readonly turn: number
  readonly ending: { readonly ending: string; readonly reasons: readonly string[]; readonly turn: number } | null
  readonly panicHundredths: number
  readonly money: number
  readonly funding: number
  readonly projectedIncome: number
  readonly projectedUpkeep: number
  readonly agents: number
  readonly agentCap: number
  readonly transportCap: number
  readonly trainingCap: number
  /** Serving Agents by the kind of their Current assignment, those In transit included. */
  readonly assignments: Record<string, number>
  /** The Basic Autopilot AI's Rested deployable Agents by the kind of their Current assignment, Standby or Training. */
  readonly restedDeployable: Record<string, number>
  /** The mean base skill of the Serving Agents. */
  readonly meanSkill: number
  /** Acquisitions by Upgrade ID. */
  readonly upgrades: Record<string, number>
  /**
   * The Combat rating, as `previewDeployment` reports it, of the Agents the Basic Autopilot AI may form a team of: its
   * Rested deployable Agents.
   */
  readonly ratingReady: number
  /** How many Agents that is. */
  readonly ready: number
  /** The Combat rating of every Serving Agent together at full health and exhaustion 0. */
  readonly ratingFresh: number
  readonly missions: { Response: MissionCounts; Initiative: MissionCounts }
  /** The last four Missions fought, the latest first. */
  readonly recentMissions: readonly MissionRecord[]
  readonly factions: readonly {
    readonly id: string
    readonly name: string
    readonly eliminated: boolean
    /** The Won Initiative Mission site against the Faction with the highest Initiative operation level. */
    readonly best: { readonly level: number | null; readonly name: string } | null
    /** The Initiative Mission site one Initiative operation level above `best`; none once the Faction is Eliminated. */
    readonly next: {
      readonly level: number
      readonly name: string
      /** The Combat rating of the MissionSiteArchetype's Enemies, and how many Enemies it has. */
      readonly enemiesRating: number
      readonly enemies: number
      /** The Active Mission site of it against the Faction, which a team can be deployed to now; none otherwise. */
      readonly site: { readonly turnsUntilExpiration: number } | null
      /** The discovered Lead of the Faction that creates it; none while no such Lead is discovered. */
      readonly lead: {
        readonly completions: number
        readonly investigating: boolean
        readonly available: boolean
        readonly status: string
      } | null
    } | null
  }[]
  /**
   * BASICAI, as the Basic Autopilot AI derives it now: the Strike team, its Rested rating against the Strike goal, the
   * Threat, and the weakest Next rung; none while there is no Strike goal.
   */
  readonly strike: {
    readonly size: number
    readonly wanted: number
    readonly rating: number
    readonly goal: number
    readonly gap: boolean
    readonly threat: number | null
    readonly rung: { readonly name: string; readonly rating: number } | null
  } | null
  /** The AmmoTypes that are Ammo short. */
  readonly ammoShort: readonly string[]
  /** The Projected progress gain of every Active Investigation together, in progress points per Turn. */
  readonly research: number
  /** Agents beyond those the Campaign started with. */
  readonly hired: number
  readonly killed: number
  readonly dismissed: number
  readonly activeInvestigations: number
  /** The name of the Lead of each Active Investigation, with the Agents of its Current team. */
  readonly investigatedLeads: readonly { readonly name: string; readonly agents: number }[]
}
