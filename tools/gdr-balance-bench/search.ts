/**
 * The search of one Mission site for the smallest team of the test team's kind that reaches the target win rate.
 *
 * The search is a set of probes, each one batch of Combats of one team size, which server.ts hands to whichever worker
 * thread is idle, so that one site's search uses several threads at once. A probe that passes shows that every larger
 * team passes too, and one that fails that every smaller team fails, so the answer lies in [lo, hi]. The first probe is
 * the test team itself, fought in full for its win rate. The search then starts from a size estimated from Combat
 * ratings, waiting for a solved site to estimate from when one is on its way; tries the estimate and a size a little
 * either side of it at once; then aims at the size where the probes' win rates cross the target, extrapolated while
 * the answer is not bracketed and interpolated once it is. It steps outward blindly, one size at a time with a doubling
 * step, only when the win rates cannot tell, and bisects the largest gap that no probe covers yet, counting the probes
 * still running as covering their size, only when the aimed sizes are taken.
 */

/** One Mission site of a run, as the page sends it. */
export interface SiteJob {
  type: 'site'
  gen: number
  id: string
  enemies: unknown[]
  agent: unknown
  n: number
  gdrValues: Record<string, number>
  /** The Rating Upgrades of the Agents' side: the test team's Weapon damage and Armor Upgrades together. */
  ratingUpgrades: number
  target: number
  /** Whether to search for the smallest team that reaches the target; without it, only the test team is fought. */
  findTeam: boolean
  trials: number
  maxn: number
  /** The Combat rating of the site's Enemies at full health, i.e. the sum of their effective skills. */
  rating: number
  /** The Combat rating of one Agent of the test team: its effective skill, raised by the team's Rating Upgrades. */
  agentRating: number
}

/**
 * At most this many probes of one site run at once. More would mostly be wasted, because each probe narrows the
 * range the next ones choose from, and would slow every other probe by competing for the CPU.
 */
export const MAX_RUNNING_PER_SITE = 3

/**
 * A solved site's need is used for estimates only from this size up. Below it, a need is too coarse to scale and the
 * need per Combat rating point is higher, e.g. 14 Agents for 1,100 points against 218 for 19,980.
 */
export const MIN_HINT_NEED = 15

/** The first round probes the estimate and this fraction of it either side, since estimates are within about 5%. */
export const FIRST_ROUND_SPREAD = 0.025

/** A site already solved in this run: its Combat rating and the team size it needs. */
export interface Hint {
  rating: number
  need: number
}

/** One probe for a worker thread: a batch of Combats of one team size. */
export interface Probe {
  type: 'probe'
  gen: number
  id: string
  size: number
  /** Whether to fight all `trials` Combats, for the test team's own win rate, rather than stop once decided. */
  full: boolean
  enemies: unknown[]
  agent: unknown
  gdrValues: Record<string, number>
  ratingUpgrades: number
  target: number
  trials: number
}

/** A probe's result from a worker thread. */
export type ProbeResult =
  | {
      type: 'probe'
      gen: number
      id: string
      size: number
      full: boolean
      /** The number of Combats the probe fought. */
      fought: number
      win: number
      killed: number
      pass: boolean
    }
  | { type: 'probe'; gen: number; id: string; size: number; full: boolean; error: string }

/**
 * The team size to start from. Teams that need equal strength scale with the Enemies' Combat rating, so the estimate
 * is the need of the solved site whose Combat rating is closest, scaled by the ratio of the two ratings; with no such
 * site solved yet, it is the team whose Combat rating equals the Enemies'.
 */
export function defaultEstimate(job: SiteJob): number {
  return Math.min(job.maxn, Math.max(1, Math.round(job.rating / Math.max(1, job.agentRating))))
}

/** Whether a hint can serve as an estimate for other sites. */
export function isUsableHint(hint: Hint): boolean {
  return hint.need >= MIN_HINT_NEED
}

export function estimate(job: SiteJob, hints: readonly Hint[]): number {
  let best: Hint | null = null
  for (const hint of hints) {
    if (!isUsableHint(hint)) {
      continue
    }
    if (best === null || Math.abs(Math.log(hint.rating / job.rating)) < Math.abs(Math.log(best.rating / job.rating))) {
      best = hint
    }
  }
  const guess =
    best !== null && job.rating > 0 ? (best.need * job.rating) / best.rating : job.rating / Math.max(1, job.agentRating)
  return Math.min(job.maxn, Math.max(1, Math.round(guess)))
}

/**
 * What a site's answer depends on: its Enemies, the test team, the GDR values, and the target, but not the other sites.
 * Two runs whose job has the same key reuse one search.
 */
export function searchKey(job: SiteJob): string {
  return JSON.stringify([
    job.id,
    job.enemies,
    job.agent,
    job.n,
    job.gdrValues,
    job.ratingUpgrades,
    job.target,
    job.findTeam,
    job.trials,
    job.maxn,
  ])
}

/** Gives every search its own number, which its probes carry, so a probe's result finds its search across runs. */
let nextToken = 0

export class SiteSearch {
  readonly key: string
  readonly token: number = (nextToken += 1)
  /** When the search started, in milliseconds of `performance.now()`. */
  readonly startedAt = performance.now()
  /** Every message the search has sent to the page, so a later run that keeps the search can send them again. */
  readonly sent: unknown[] = []
  /** Every size below lo fails. */
  lo = 1
  /** The smallest size known to pass; 0 while none is known. */
  hi = 0
  /** The sizes whose probes are still running. */
  readonly running = new Set<number>()
  /** The sizes probed so far, finished or running. */
  readonly tried = new Set<number>()
  /** The win rate, in percent, each finished probe saw over the Combats it fought. */
  private readonly wins = new Map<number, number>()
  /**
   * The answer once known: a team size, null when no team up to maxn reaches the target, or 'skipped' when the run
   * does not search for it.
   */
  need: number | null | 'skipped' | undefined = undefined
  failed: string | null = null
  /** The number of probes finished so far, i.e. team sizes tried, and of Combats they fought. */
  probes = 0
  combats = 0
  private baseSent = false
  private baseDone = false
  /** Whether a probe of the search, rather than the test team, has failed; until then the search steps down. */
  private lowFromSearch = false
  private start = 0
  /** The distance of the first round's outer probes from the estimate. */
  private spread = 1
  /** The next steps up and down while the answer is not bracketed on that side; each doubles once used. */
  private upStep = 1
  private downStep = 1

  readonly job: SiteJob

  constructor(job: SiteJob) {
    this.job = job
    this.key = searchKey(job)
  }

  get done(): boolean {
    return this.need !== undefined || this.failed !== null
  }

  /**
   * The next size to probe, or null when every useful size is already running, or when the search waits for an
   * estimate; `full` for the test team's own. With `waitForHint`, a search that has not started yet waits, because a
   * smaller site whose answer will make a usable hint is still being searched.
   */
  next(hints: readonly Hint[], waitForHint: boolean): { size: number; full: boolean } | null {
    if (this.done) {
      return null
    }
    if (!this.baseSent) {
      this.baseSent = true
      return this.issue(this.job.n, true)
    }
    if (!this.baseDone || this.running.size >= MAX_RUNNING_PER_SITE) {
      return null
    }
    if (this.start === 0) {
      if (waitForHint) {
        return null
      }
      this.start = Math.min(this.hi > 0 ? this.hi : this.job.maxn, Math.max(this.lo, estimate(this.job, hints)))
      this.spread = Math.max(1, Math.round(this.start * FIRST_ROUND_SPREAD))
      this.upStep = 2 * this.spread
      this.downStep = 2 * this.spread
    }
    const top = this.hi > 0 ? this.hi - 1 : this.job.maxn
    const open = (size: number): boolean => size >= this.lo && size <= top && !this.tried.has(size)
    // The first round: the estimate and a size a little either side of it, all at once.
    for (const size of [this.start, this.start - this.spread, this.start + this.spread]) {
      if (open(size)) {
        return this.issue(size, false)
      }
    }
    const unresolved = [...this.running].filter((size) => size >= this.lo && (this.hi === 0 || size < this.hi))
    // While every finished probe fails, or every one passes, the win rates of the two nearest still point at the
    // size where the target is crossed; that size and the next one are probed before any blind step.
    const aim = this.extrapolate()
    if (aim !== null) {
      for (const size of this.hi === 0 ? [aim, aim + 1] : [aim, aim - 1]) {
        if (open(size) && !this.running.has(size)) {
          return this.issue(size, false)
        }
      }
    }
    if (this.hi === 0) {
      // Nothing passes yet: step up from the largest size tried, one probe at a time, so no far size is fought before
      // a closer one has failed.
      if (unresolved.length > 0) {
        return null
      }
      const size = Math.min(this.job.maxn, Math.max(this.lo, Math.max(...this.tried)) + this.upStep)
      this.upStep *= 2
      return open(size) ? this.issue(size, false) : null
    }
    if (!this.lowFromSearch) {
      // Nothing near the estimate fails yet: step down from the smallest size that passes, one probe at a time.
      if (unresolved.length > 0) {
        return null
      }
      const size = Math.max(this.lo, this.hi - this.downStep)
      this.downStep *= 2
      return open(size) ? this.issue(size, false) : null
    }
    // The answer is bracketed. Win rates rise with team size, so the size where the target is crossed is interpolated
    // between the largest size that fails and the smallest that passes; that size and its neighbours settle the answer
    // in one round when the interpolation is right.
    const below = this.wins.get(this.lo - 1)
    const above = this.wins.get(this.hi)
    if (below !== undefined && above !== undefined && above > below) {
      const fraction = (this.job.target - below) / (above - below)
      const aim = Math.round(this.lo - 1 + fraction * (this.hi - this.lo + 1))
      for (const size of [aim, aim - 1, aim + 1]) {
        if (open(size) && !this.running.has(size)) {
          return this.issue(size, false)
        }
      }
    }
    // Otherwise bisect the largest gap of [lo, hi) that no finished or running probe covers.
    const marks = [this.lo - 1, ...unresolved, this.hi].sort((a, b) => a - b)
    let gap = 1
    let size: number | null = null
    for (let i = 1; i < marks.length; i += 1) {
      const a = marks[i - 1]!
      const b = marks[i]!
      if (b - a > gap) {
        gap = b - a
        size = Math.floor((a + b) / 2)
      }
    }
    return size === null ? null : this.issue(size, false)
  }

  /**
   * The size where the target win rate is crossed, extrapolated from the two finished probes nearest to it, when no
   * probe has passed yet (the two largest failing sizes) or none of the search has failed yet (the two smallest passing
   * sizes); null when that cannot be told, e.g. with fewer than two such probes or win rates that do not rise.
   */
  private extrapolate(): number | null {
    if (this.hi > 0 && this.lowFromSearch) {
      return null
    }
    const sizes = [...this.wins.keys()]
      .filter((size) => (this.hi === 0 ? size < this.lo : size >= this.hi))
      .sort((a, b) => (this.hi === 0 ? b - a : a - b))
    const [near, far] = sizes
    if (near === undefined || far === undefined) {
      return null
    }
    const slope = (this.wins.get(near)! - this.wins.get(far)!) / (near - far)
    if (!(slope > 0)) {
      return null
    }
    const size = Math.round(near + (this.job.target - this.wins.get(near)!) / slope)
    // Never further than the next blind step would go.
    return this.hi === 0
      ? Math.min(this.job.maxn, Math.max(this.lo, Math.min(size, near + this.upStep)))
      : Math.max(this.lo, Math.min(this.hi - 1, Math.max(size, near - this.downStep)))
  }

  private issue(size: number, full: boolean): { size: number; full: boolean } {
    this.tried.add(size)
    this.running.add(size)
    return { size, full }
  }

  /** Records a probe's result; stale results of sizes already decided change nothing. */
  record(result: ProbeResult): void {
    this.running.delete(result.size)
    this.probes += 1
    if (!('error' in result)) {
      this.combats += result.fought
    }
    if ('error' in result) {
      this.failed = result.error
      return
    }
    if (result.full) {
      this.baseDone = true
      if (!this.job.findTeam) {
        this.need = 'skipped'
      }
    }
    if (!('error' in result)) {
      this.wins.set(result.size, result.win)
    }
    if (result.pass) {
      this.hi = this.hi === 0 ? result.size : Math.min(this.hi, result.size)
    } else if (result.size + 1 > this.lo) {
      this.lo = result.size + 1
      if (!result.full) {
        this.lowFromSearch = true
      }
    }
    if (this.need === 'skipped') {
      return
    }
    if (this.hi > 0 && this.lo >= this.hi) {
      this.need = this.hi
    } else if (this.hi === 0 && this.lo > this.job.maxn) {
      this.need = null
    }
  }
}
