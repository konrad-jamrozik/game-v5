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

/** From a worker thread to server.ts. */
export type FromWorker =
  | {
      readonly type: 'ready'
      readonly defaults: Record<string, unknown>
      readonly upgrades: readonly UpgradeInfo[]
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
  /** The Combat outcome for the Agents' side, e.g. Prevailed, Wiped, or Retreated. */
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

/** What the page shows of a Campaign at its Current Turn, all read through Player API queries. */
export interface CampaignStats {
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
  /** The Basic Autopilot AI's Deployable Agents by the kind of their Current assignment, Standby or Training. */
  readonly deployable: Record<string, number>
  /** The mean base skill of the Serving Agents. */
  readonly meanSkill: number
  /** Acquisitions by Upgrade ID. */
  readonly upgrades: Record<string, number>
  /**
   * The Combat rating, as `previewDeployment` reports it, of the Agents the Basic Autopilot AI may form a team of: its
   * Deployable Agents.
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
    readonly next: { readonly level: number; readonly name: string } | null
  }[]
  /** Agents beyond those the Campaign started with. */
  readonly hired: number
  readonly killed: number
  readonly dismissed: number
  readonly activeInvestigations: number
}
