/** The messages between lab.ts and its worker threads, and what one Campaign reports. */

/** One Campaign to play: a variant's parameters on one seed. */
export interface LabTask {
  readonly variant: string
  readonly seed: string
  readonly turns: number
  /** Tuning parameters that differ from BASIC_AI_THRESHOLDS. */
  readonly params: Record<string, unknown>
  /** Where to write the Campaign's record, or none. */
  readonly log: string | null
}

/** A few values at the start of each Turn after the AI played the one before it. */
export interface TurnRow {
  readonly turn: number
  readonly panic: number
  readonly money: number
  readonly funding: number
  readonly income: number
  readonly upkeep: number
  readonly agents: number
  readonly contracting: number
  readonly contractingCap: number
  readonly recovery: number
  readonly researchers: number
  /** The Projected progress gain of every Active Investigation, in progress points. */
  readonly research: number
  readonly strike: number
  readonly strikeRating: number
  readonly goal: number
  readonly meanSkill: number
  readonly killed: number
  /** Player actions the AI made in the Turn, Advance turn excluded. */
  readonly actions: number
}

export interface CampaignResult {
  readonly variant: string
  readonly seed: string
  readonly ending: { readonly ending: string; readonly reasons: readonly string[]; readonly turn: number } | null
  readonly turns: number
  readonly seconds: number
  readonly rows: readonly TurnRow[]
  /** By MissionSiteArchetype ID. */
  readonly missions: Record<
    string,
    {
      kind: string
      rating: number
      won: number
      lost: number
      expired: number
      firstWin: number | null
    }
  >
  /** Panic added by Lost and Expired Response Mission sites, by operation level, and taken away by Won Missions. */
  readonly panic: { readonly byLevel: Record<string, number>; readonly reduced: number }
  readonly leadsCompleted: number
  readonly leadsDiscovered: number
  readonly upgrades: Record<string, number>
  readonly detectors: {
    /** The longest run of Turns with a Contracting cap above 0 and nobody on Contracting. */
    readonly contractingIdleTurns: number
    /** The first Upgrade bought 3 times or more in one Turn. */
    readonly repeatedPurchase: string | null
    /** Turns in which an Agent carries the Fallback Weapon while Storage holds a Weapon. */
    readonly strandedWeaponTurns: number
    /** The longest run of Turns in which the Strike team falls short of its Strike goal. */
    readonly strikeShortTurns: number
    /** The longest run of Turns with projected income below projected upkeep. */
    readonly negativeNetTurns: number
    readonly maxActionsPerTurn: number
  }
  /** Why play stopped before the Campaign ending or the last Turn, e.g. the AI failed. */
  readonly error: string | null
}

export type FromWorker =
  | { readonly type: 'ready' }
  | { readonly type: 'done'; readonly result: CampaignResult }
  | { readonly type: 'failed'; readonly variant: string; readonly seed: string; readonly message: string }
