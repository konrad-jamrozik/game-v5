/**
 * The search of one Mission site for the smallest team of the test team's kind that reaches the target win rate.
 *
 * The search is a set of probes, each one batch of Combats of one team size, which server.ts hands to whichever worker
 * thread is idle, so that one site's search uses several threads at once. A probe that passes shows that every larger
 * team passes too, and one that fails that every smaller team fails, so the answer lies in [lo, hi]. The first probe is
 * the test team itself, fought in full for its win rate; the search then starts from a size estimated from Combat
 * ratings, steps outward from it with a doubling step until the answer is bracketed, and bisects the largest gap that
 * no probe covers yet, counting the probes still running as covering their size.
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
  target: number
  trials: number
  maxn: number
  /** The Combat rating of the site's Enemies at full health, i.e. the sum of their effective skills. */
  rating: number
  /** The effective skill of one Agent of the test team. */
  agentRating: number
}

/**
 * At most this many probes of one site run at once. More would mostly be wasted, because each probe narrows the
 * range the next ones choose from, and would slow every other probe by competing for the CPU.
 */
export const MAX_RUNNING_PER_SITE = 3

/** A solved site's need is used for estimates only from this size up, below which it is too coarse to scale. */
export const MIN_HINT_NEED = 8

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
export function estimate(job: SiteJob, hints: readonly Hint[]): number {
  let best: Hint | null = null
  for (const hint of hints) {
    if (hint.need < MIN_HINT_NEED) {
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

export class SiteSearch {
  /** Every size below lo fails. */
  lo = 1
  /** The smallest size known to pass; 0 while none is known. */
  hi = 0
  /** The sizes whose probes are still running. */
  readonly running = new Set<number>()
  /** The sizes probed so far, finished or running. */
  readonly tried = new Set<number>()
  /** The answer once known: a team size, or null when no team up to maxn reaches the target. */
  need: number | null | undefined = undefined
  failed: string | null = null
  /** The number of probes finished so far, i.e. team sizes tried, and of Combats they fought. */
  probes = 0
  combats = 0
  private baseSent = false
  private baseDone = false
  /** Whether a probe of the search, rather than the test team, has failed; until then the search steps down. */
  private lowFromSearch = false
  private start = 0
  private step = 1

  readonly job: SiteJob

  constructor(job: SiteJob) {
    this.job = job
  }

  get done(): boolean {
    return this.need !== undefined || this.failed !== null
  }

  /** The next size to probe, or null when every useful size is already running; `full` for the test team's own. */
  next(hints: readonly Hint[]): { size: number; full: boolean } | null {
    if (this.done) {
      return null
    }
    if (!this.baseSent) {
      this.baseSent = true
      this.tried.add(this.job.n)
      this.running.add(this.job.n)
      return { size: this.job.n, full: true }
    }
    if (!this.baseDone || this.running.size >= MAX_RUNNING_PER_SITE) {
      return null
    }
    if (this.start === 0) {
      this.start = Math.min(this.hi > 0 ? this.hi : this.job.maxn, Math.max(this.lo, estimate(this.job, hints)))
      // The first step is a few percent of the estimate, so the answer is usually bracketed by the first tries.
      this.step = Math.max(1, Math.round(this.start * 0.04))
    }
    const top = this.hi > 0 ? this.hi - 1 : this.job.maxn
    const open = (size: number): boolean => size >= this.lo && size <= top && !this.tried.has(size)
    let size: number | null = null
    if (open(this.start)) {
      size = this.start
    } else if (this.hi === 0) {
      // Step up from the estimate, doubling the step, up to the largest team.
      for (let k = 1; size === null; k += 1) {
        const candidate = Math.min(this.job.maxn, this.start + (2 ** k - 1) * this.step)
        if (open(candidate)) {
          size = candidate
        }
        if (candidate >= this.job.maxn) {
          break
        }
      }
    } else if (!this.lowFromSearch) {
      // Step down from the estimate, doubling the step, until a size fails.
      for (let k = 1; size === null; k += 1) {
        const candidate = Math.max(this.lo, this.start - (2 ** k - 1) * this.step)
        if (open(candidate)) {
          size = candidate
        }
        if (candidate <= this.lo) {
          break
        }
      }
    }
    if (size === null && this.hi > 0) {
      // Bisect the largest gap of [lo, hi) that no finished or running probe covers.
      const marks = [this.lo - 1, ...[...this.running].filter((s) => s >= this.lo && s < this.hi), this.hi].sort(
        (a, b) => a - b,
      )
      let gap = 1
      for (let i = 1; i < marks.length; i += 1) {
        const a = marks[i - 1]!
        const b = marks[i]!
        if (b - a > gap) {
          gap = b - a
          size = Math.floor((a + b) / 2)
        }
      }
    }
    if (size === null) {
      return null
    }
    this.tried.add(size)
    this.running.add(size)
    return { size, full: false }
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
    }
    if (result.pass) {
      this.hi = this.hi === 0 ? result.size : Math.min(this.hi, result.size)
    } else if (result.size + 1 > this.lo) {
      this.lo = result.size + 1
      if (!result.full) {
        this.lowFromSearch = true
      }
    }
    if (this.hi > 0 && this.lo >= this.hi) {
      this.need = this.hi
    } else if (this.hi === 0 && this.lo > this.job.maxn) {
      this.need = null
    }
  }
}
