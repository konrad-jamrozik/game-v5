/**
 * The part of the CR Sweep Bench that the page and the Node scripts share: the text forms, the candidate Combat rating
 * formulas, what the swept win rates say of each measurement, and the scoring of a formula against them. It uses no
 * DOM and no Node API.
 */

/* ---------- text forms ---------- */

/** The numbers of a list separated by commas or spaces, e.g. `1, 2, 4`. */
export function parseList(text) {
  return String(text)
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(Number)
    .filter(Number.isFinite)
}

const FIELD = { s: 'skill', h: 'health', d: 'damage', a: 'armor' }

/**
 * One Combatant, e.g. `s100 h30 d10 a0`: skill, max health, weapon damage, and armor, which is 0 when left out. Every
 * value is a whole number, so that the Combatant can fight on either side.
 */
export function parseCombatant(text) {
  const out = { skill: NaN, health: NaN, damage: NaN, armor: 0 }
  for (const token of text.trim().split(/\s+/)) {
    const m = /^([shda])(\d+)$/i.exec(token)
    if (m === null) {
      return `cannot read "${token}"; write e.g. s100 h30 d10 a0, in whole numbers`
    }
    out[FIELD[m[1].toLowerCase()]] = Number(m[2])
  }
  const whole = (v, min) => Number.isSafeInteger(v) && v >= min
  if (!whole(out.skill, 1)) {
    return 's (skill) must be a whole number of at least 1'
  }
  if (!whole(out.health, 1)) {
    return 'h (max health) must be a whole number of at least 1'
  }
  if (!whole(out.damage, 1)) {
    return 'd (weapon damage) must be a whole number of at least 1'
  }
  if (!whole(out.armor, 0)) {
    return 'a (armor) must be a whole number of at least 0'
  }
  return out
}

function lines(text) {
  return String(text)
    .split(/\r?\n/)
    .map((raw, index) => ({ raw: raw.replace(/#.*$/, '').trim(), line: index + 1 }))
    .filter((l) => l.raw !== '')
}

/** Combatant types, one per line, e.g. `elite: s400 h30 d10 a0`. Text after `#` is a comment. */
export function parseTypes(text) {
  const types = []
  const errors = []
  for (const { raw, line } of lines(text)) {
    const at = raw.indexOf(':')
    if (at < 1) {
      errors.push({ line, message: 'write a name, a colon, and the values, e.g. elite: s400 h30 d10 a0' })
      continue
    }
    const combatant = parseCombatant(raw.slice(at + 1))
    if (typeof combatant === 'string') {
      errors.push({ line, message: combatant })
    } else {
      types.push({ name: raw.slice(0, at).trim(), ...combatant })
    }
  }
  return { types, errors }
}

export const formatCombatant = (c) => `s${c.skill} h${c.health} d${c.damage} a${c.armor}`
export const formatGroups = (groups) => groups.map((g) => `${g.count} × ${formatCombatant(g)}`).join(' + ')

/** GDR values to fight with instead of the content's, one `name = value` per line. */
export function parseOverrides(text) {
  const values = {}
  const errors = []
  for (const { raw, line } of lines(text)) {
    const m = /^([a-z_][a-z0-9_]*)\s*=\s*(-?\d+(?:\.\d+)?)$/i.exec(raw)
    if (m === null) {
      errors.push({ line, message: `cannot read "${raw}"; write e.g. exhaustion_per_defense = 0` })
    } else {
      values[m[1]] = Number(m[2])
    }
  }
  return { values, errors }
}

/** The number of Combatants of a side and the mean of each of their values. */
export function sideStats(groups) {
  const total = { count: 0, skill: 0, health: 0, damage: 0, armor: 0 }
  for (const g of groups) {
    total.count += g.count
    total.skill += g.count * g.skill
    total.health += g.count * g.health
    total.damage += g.count * g.damage
    total.armor += g.count * g.armor
  }
  const n = total.count || 1
  return {
    count: total.count,
    skill: total.skill / n,
    health: total.health / n,
    damage: total.damage / n,
    armor: total.armor / n,
  }
}

/* ---------- formulas ---------- */

const MATH = ['sqrt', 'min', 'max', 'pow', 'log', 'exp', 'abs', 'ceil', 'floor', 'round']
const OPPONENT = ['opp_count', 'opp_skill', 'opp_damage', 'opp_health', 'opp_armor']
const COMBATANT_VARS = ['skill', 'damage', 'health', 'armor', 'count', ...OPPONENT]
const TEAM_VARS = ['sum', 'sum2', 'count', ...OPPONENT]

/**
 * A formula is `{ combatant, aux, team, enemyCombatant, enemyTeam, params }`. `combatant` rates one Combatant and
 * `aux`, which may be empty, gives a second number for it; `team` rates a side from `sum` and `sum2`, the sums of the
 * two over the side, and `count`. `enemyCombatant` and `enemyTeam`, when not empty, replace `combatant` and `team` for
 * the Enemies' side. Returns `rate(groups, side, opponentStats)`, which takes a real `count` in every group so that
 * the scoring can read between whole counts.
 */
export function compileFormula(formula) {
  const names = Object.keys(formula.params ?? {})
  for (const name of names) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
      throw new Error(`"${name}" is not a parameter name`)
    }
  }
  const values = names.map((name) => Number(formula.params[name]))
  const math = MATH.map((name) => Math[name])
  const build = (expr, vars) => {
    // The designer's own expression, typed on the designer's own machine.
    const fn = new Function(...vars, ...names, ...MATH, 'Math', `"use strict"; return (${expr});`)
    return (...args) => fn(...args, ...values, ...math, Math)
  }
  const blank = (expr) => expr === undefined || expr === null || String(expr).trim() === ''
  const agent = build(formula.combatant, COMBATANT_VARS)
  const enemy = blank(formula.enemyCombatant) ? agent : build(formula.enemyCombatant, COMBATANT_VARS)
  const aux = blank(formula.aux) ? null : build(formula.aux, COMBATANT_VARS)
  const agentTeam = build(formula.team, TEAM_VARS)
  const enemyTeam = blank(formula.enemyTeam) ? agentTeam : build(formula.enemyTeam, TEAM_VARS)
  return {
    rate(groups, side, opp) {
      const o = [opp.count, opp.skill, opp.damage, opp.health, opp.armor]
      const own = side === 'agents' ? agent : enemy
      let sum = 0
      let sum2 = 0
      let count = 0
      for (const g of groups) {
        count += g.count
      }
      for (const g of groups) {
        sum += g.count * own(g.skill, g.damage, g.health, g.armor, count, ...o)
        if (aux !== null) {
          sum2 += g.count * aux(g.skill, g.damage, g.health, g.armor, count, ...o)
        }
      }
      return (side === 'agents' ? agentTeam : enemyTeam)(sum, sum2, count, ...o)
    },
  }
}

/* ---------- curves ---------- */

/**
 * Values made non-decreasing in `n` by pooling adjacent violators weighted by `weight`, because a larger swept side
 * never truly does worse and a dip is only the dice.
 */
export function isotonic(points) {
  const sorted = [...points].sort((a, b) => a.n - b.n)
  const blocks = []
  for (const p of sorted) {
    blocks.push({ weight: p.weight, value: p.value, size: 1 })
    while (blocks.length > 1 && blocks[blocks.length - 2].value > blocks[blocks.length - 1].value) {
      const b = blocks.pop()
      const a = blocks.pop()
      const weight = a.weight + b.weight
      blocks.push({ weight, value: (a.value * a.weight + b.value * b.weight) / weight, size: a.size + b.size })
    }
  }
  const out = []
  let at = 0
  for (const block of blocks) {
    for (let i = 0; i < block.size; i += 1) {
      out.push({ n: sorted[at].n, value: block.value })
      at += 1
    }
  }
  return out
}

/** The `n`, between the points, at which a non-decreasing curve first reaches `p`; null when it never does. */
export function crossing(curve, p) {
  let prev = { n: 0, value: 0 }
  for (const point of curve) {
    if (point.value >= p) {
      return point.value === prev.value
        ? point.n
        : prev.n + ((point.n - prev.n) * (p - prev.value)) / (point.value - prev.value)
    }
    prev = point
  }
  return null
}

/**
 * Reads `y` at `x` off points `[x, y]` sorted by `x`, in a straight line between them on a log-log scale and along
 * the nearest segment beyond them. Returns null without two points.
 */
export function readCurve(points, x) {
  const usable = points.filter(([px, py]) => px > 0 && py > 0)
  if (usable.length < 2 || !(x > 0)) {
    return null
  }
  let i = usable.findIndex(([px]) => px >= x)
  i = i < 0 ? usable.length - 1 : Math.max(1, i)
  const [x0, y0] = usable[i - 1]
  const [x1, y1] = usable[i]
  const t = (Math.log(x) - Math.log(x0)) / (Math.log(x1) - Math.log(x0))
  return {
    y: Math.exp(Math.log(y0) + t * (Math.log(y1) - Math.log(y0))),
    beyond: x < usable[0][0] / 1.001 || x > usable[usable.length - 1][0] * 1.001,
  }
}

/** The slope of ln y on ln x by least squares: doubling x multiplies y by 2 ^ slope. Null without two points. */
export function logSlope(points) {
  const usable = points.filter(([x, y]) => x > 0 && y > 0).map(([x, y]) => [Math.log(x), Math.log(y)])
  if (usable.length < 2) {
    return null
  }
  const mx = usable.reduce((s, p) => s + p[0], 0) / usable.length
  const my = usable.reduce((s, p) => s + p[1], 0) / usable.length
  const sxx = usable.reduce((s, p) => s + (p[0] - mx) ** 2, 0)
  return sxx === 0 ? null : usable.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0) / sxx
}

/* ---------- measurements ---------- */

/** The share of the Combats the Agents must win for a team to count as safe, unless a caller asks otherwise. */
export const SAFE = 0.95

/**
 * What the swept win rates say of each measurement, whatever the formula. A measurement fixes one side and sweeps the
 * count `n` of one Combatant type, its `unit`, on the other.
 *
 * - `even`: the swept count at which the Agents win half the Combats. With the reference Combatant as the unit, it is
 *   the strength of the fixed side in reference Combatants.
 * - `safe`: the swept count at which the Agents win the `level` share: above `even` when the Agents are swept, below
 *   it when the Enemies are.
 *
 * A measurement whose `even` lies below one swept Combatant, or beyond the most swept, is unresolved.
 */
export function prepare(measurements, level = SAFE) {
  return measurements.map((m) => {
    const out = { ...m, even: null, safe: null, curve: [], status: 'not swept' }
    if (!m.record) {
      return out
    }
    // The success of the swept side: the Agents' win rate when they are swept, its complement when the Enemies are.
    const curve = isotonic(
      m.record.points
        .filter((p) => p.trials > 0)
        .map((p) => ({
          n: p.n,
          weight: p.trials,
          value: m.swept === 'agents' ? p.won / p.trials : 1 - p.won / p.trials,
        })),
    )
    out.curve = curve
    if (curve.length === 0) {
      return out
    }
    const even = crossing(curve, 0.5)
    if (even === null) {
      out.status = `the swept side never reaches even odds with up to ${curve[curve.length - 1].n}`
      return out
    }
    if (curve[0].n === 1 && curve[0].value >= 0.5) {
      out.status = 'one swept Combatant is already at even odds or better'
      return out
    }
    out.even = even
    out.safe = crossing(curve, m.swept === 'agents' ? level : 1 - level)
    out.status = 'ok'
    return out
  })
}

const groupsAt = (m, n) => {
  const swept = [{ count: n, ...m.unit }]
  return m.swept === 'agents' ? { agents: swept, enemies: m.enemies } : { agents: m.agents, enemies: swept }
}

/** The rating ratio, Agents to Enemies, that a compiled formula gives a measurement at the swept count `n`. */
export function ratioAt(compiled, m, n) {
  const { agents, enemies } = groupsAt(m, n)
  return compiled.rate(agents, 'agents', sideStats(enemies)) / compiled.rate(enemies, 'enemies', sideStats(agents))
}

/** The swept count at which the formula rates the two sides equal, i.e. the `even` it predicts; null when none. */
export function predictEven(compiled, m, near = 10) {
  // The swept side's rating against the fixed side's grows with the swept count.
  const lead = (n) => (m.swept === 'agents' ? ratioAt(compiled, m, n) : 1 / ratioAt(compiled, m, n))
  let lo = near
  let hi = near
  for (let i = 0; i < 40 && !(lead(hi) >= 1); i += 1) {
    hi *= 2
  }
  for (let i = 0; i < 40 && lead(lo) >= 1; i += 1) {
    lo /= 2
  }
  if (!(lead(hi) >= 1) || lead(lo) >= 1) {
    return null
  }
  for (let i = 0; i < 50; i += 1) {
    const mid = (lo + hi) / 2
    if (lead(mid) >= 1) {
      hi = mid
    } else {
      lo = mid
    }
  }
  return hi
}

/* ---------- the yardstick ---------- */

const sig = (groups) => groups.map((g) => `${g.count}x${formatCombatant(g)}`).join('+')

/**
 * What the measurements say when read in reference Combatants, whatever the formula.
 *
 * - `factors[stat][role]`: `[value, strength]` of a team of the base count whose every Combatant is the reference with
 *   one value changed, for each value tried.
 * - `counts[type][role]`: `[count, strength]` of a team of `count` Combatants of one type.
 * - `pairs`, `mixes`: teams with two values changed, and teams of two types, each with what the single measurements
 *   predict of it.
 * - `checks`: Agent teams against Enemy teams that are not the reference, each with the count the yardstick predicts.
 *   `sites` holds the same for the Mission sites.
 *
 * A role is `agents` or `enemies`: the side the measured team fought on.
 */
export function analyse(prepared) {
  const ok = prepared.filter((m) => m.status === 'ok')
  const byRole = () => ({ agents: [], enemies: [] })
  const factors = {}
  const counts = {}
  for (const m of ok) {
    if (m.kind === 'factor') {
      ;(factors[m.meta.factor] ??= byRole())[m.meta.role].push([m.meta.value, m.even, m])
    } else if (m.kind === 'count') {
      ;(counts[m.meta.type] ??= byRole())[m.meta.role].push([m.meta.value, m.even, m])
    }
  }
  for (const set of [...Object.values(factors), ...Object.values(counts)]) {
    set.agents.sort((a, b) => a[0] - b[0])
    set.enemies.sort((a, b) => a[0] - b[0])
  }
  const find = (kind, role, test) => ok.find((m) => m.kind === kind && m.meta.role === role && test(m.meta))

  // Two values changed together: were the two effects independent, the strength would be base × effect × effect.
  const pairs = []
  for (const m of ok.filter((x) => x.kind === 'pair')) {
    const { role, factorA, valueA, factorB, valueB, baseA, baseB } = m.meta
    const single = (factor, value) => find('factor', role, (meta) => meta.factor === factor && meta.value === value)
    const [a, b, base] = [
      single(factorA, valueA),
      single(factorB, valueB),
      single(factorA, baseA) ?? single(factorB, baseB),
    ]
    const predicted = a && b && base ? (a.even * b.even) / base.even : null
    pairs.push({ m, predicted, gap: predicted === null ? null : m.even / predicted })
  }

  // Two types in one team: were strength a plain sum, the team would be worth its two halves together.
  const mixes = []
  for (const m of ok.filter((x) => x.kind === 'mix')) {
    const { role, typeA, typeB, half } = m.meta
    const [a, b] = [typeA, typeB].map((type) => readCurve(counts[type]?.[role] ?? [], half))
    const predicted = a && b ? a.y + b.y : null
    mixes.push({ m, predicted, gap: predicted === null ? null : m.even / predicted })
  }

  // Agents of a type against a team that is not the reference. The yardstick predicts the count: the Enemy team is
  // worth so many reference Agents, those are worth so many reference Enemies, and the Agent type's own count curve
  // says how many of it are worth as many.
  const reference = ok.find((m) => m.kind === 'count' && m.meta.isReference)?.meta.type
  const yardstick = (m) => {
    const same = ok.find((x) => x.swept === 'agents' && x.unitIsReference && sig(x.enemies) === sig(m.enemies))
    const refCurve = counts[reference]?.agents ?? []
    const ownCurve = counts[m.meta.type]?.agents ?? []
    if (!same || refCurve.length < 2 || ownCurve.length < 2) {
      return null
    }
    const worth = readCurve(refCurve, same.even)
    // Read the type's curve backwards: the count whose strength is `worth`.
    const back = readCurve(
      ownCurve.map(([count, strength]) => [strength, count]).sort((x, y) => x[0] - y[0]),
      worth.y,
    )
    return back === null ? null : { count: back.y, beyond: worth.beyond || back.beyond }
  }
  const versus = (kind) =>
    ok
      .filter((m) => m.kind === kind && !m.unitIsReference)
      .map((m) => {
        const predicted = yardstick(m)
        return {
          m,
          predicted: predicted?.count ?? null,
          beyond: predicted?.beyond ?? false,
          gap: predicted ? m.even / predicted.count : null,
        }
      })

  // The dice: how many more Agents win the safe share than win half, for sweeps of the reference Agent.
  const dice = ok
    .filter((m) => m.swept === 'agents' && m.unitIsReference && m.safe !== null)
    .map((m) => ({ m, margin: m.safe / m.even }))

  return { factors, counts, pairs, mixes, checks: versus('check'), sites: versus('site'), dice, reference }
}

/* ---------- scoring ---------- */

const rms = (values) => Math.sqrt(values.reduce((s, v) => s + v * v, 0) / (values.length || 1))
const mean = (values) => values.reduce((s, v) => s + v, 0) / (values.length || 1)

/** A spread of log errors as a share, e.g. 0.12 for ±12%. */
const asShare = (logError) => Math.exp(logError) - 1

/**
 * Scores a formula against prepared measurements. For each resolved measurement, `evenRatio` is the rating ratio,
 * Agents to Enemies, the formula gives at even odds, which a perfect formula makes 100%, and `safeRatio` is the ratio
 * at the count where the Agents win the safe share.
 *
 * The experiments, i.e. every measurement but the Mission sites, are what a formula is fitted to; the sites only
 * examine it. For each of the two, `typical` is the root mean square of the log of `evenRatio`, as a share, and
 * `worst` its largest. For the sites, `safeRatio` is the highest of any, the ratio the game could promise.
 */
export function score(formula, prepared) {
  let compiled
  try {
    compiled = compileFormula(formula)
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) }
  }
  const rows = []
  const seen = new Set()
  try {
    for (const m of prepared) {
      // Measurements of one key are one sweep, which counts once.
      if (m.status !== 'ok' || seen.has(m.key)) {
        continue
      }
      seen.add(m.key)
      const evenRatio = ratioAt(compiled, m, m.even)
      if (!(evenRatio > 0) || !Number.isFinite(evenRatio)) {
        return { error: `the formula gives no rating ratio above 0 for ${m.label}` }
      }
      rows.push({
        m,
        evenRatio,
        safeRatio: m.safe === null ? null : ratioAt(compiled, m, m.safe),
        predicted: predictEven(compiled, m, m.even),
      })
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) }
  }
  const summarise = (list) => {
    const logs = list.map((r) => Math.log(r.evenRatio))
    const safes = list.map((r) => r.safeRatio).filter((v) => v !== null && Number.isFinite(v))
    return {
      count: list.length,
      typical: list.length === 0 ? null : asShare(rms(logs)),
      bias: list.length === 0 ? null : Math.exp(mean(logs)),
      worst: list.length === 0 ? null : asShare(Math.max(...logs.map(Math.abs))),
      safeRatio: safes.length === 0 ? null : Math.max(...safes),
      lowestSafe: safes.length === 0 ? null : Math.min(...safes),
    }
  }
  const experiments = rows.filter((r) => r.m.kind !== 'site')
  return {
    rows,
    compiled,
    experiments: summarise(experiments),
    sites: summarise(rows.filter((r) => r.m.kind === 'site')),
    // What Fit makes smallest: the mean square log error at even odds over the experiments.
    objective: experiments.length === 0 ? null : mean(experiments.map((r) => Math.log(r.evenRatio) ** 2)),
  }
}

/* ---------- fitting ---------- */

/** Nelder-Mead: the `x` near `start` that makes `f` smallest. */
export function nelderMead(f, start, maxIterations = 500) {
  const n = start.length
  const simplex = [start.slice()]
  for (let i = 0; i < n; i += 1) {
    const x = start.slice()
    x[i] = x[i] === 0 ? 0.1 : x[i] * 1.15
    simplex.push(x)
  }
  let scored = simplex.map((x) => ({ x, value: f(x) }))
  const combine = (a, b, t) => a.map((v, i) => v + t * (b[i] - v))
  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    scored.sort((a, b) => a.value - b.value)
    const best = scored[0]
    const worst = scored[n]
    if (Math.abs(worst.value - best.value) < 1e-9) {
      break
    }
    const centroid = new Array(n).fill(0)
    for (let i = 0; i < n; i += 1) {
      for (let j = 0; j < n; j += 1) {
        centroid[j] += scored[i].x[j] / n
      }
    }
    const reflected = combine(centroid, worst.x, -1)
    const reflectedValue = f(reflected)
    if (reflectedValue < best.value) {
      const expanded = combine(centroid, worst.x, -2)
      const expandedValue = f(expanded)
      scored[n] =
        expandedValue < reflectedValue ? { x: expanded, value: expandedValue } : { x: reflected, value: reflectedValue }
    } else if (reflectedValue < scored[n - 1].value) {
      scored[n] = { x: reflected, value: reflectedValue }
    } else {
      const contracted = combine(centroid, worst.x, 0.5)
      const contractedValue = f(contracted)
      if (contractedValue < worst.value) {
        scored[n] = { x: contracted, value: contractedValue }
      } else {
        scored = scored.map((s, i) => {
          if (i === 0) {
            return s
          }
          const x = combine(best.x, s.x, 0.5)
          return { x, value: f(x) }
        })
      }
    }
  }
  scored.sort((a, b) => a.value - b.value)
  return scored[0]
}

/** The values of the parameters `names` that bring the formula closest to even odds over the experiments. */
export function fit(formula, names, prepared) {
  const withValues = (x) => {
    const params = { ...formula.params }
    names.forEach((name, i) => {
      params[name] = x[i]
    })
    return { ...formula, params }
  }
  const objective = (x) => {
    const value = score(withValues(x), prepared).objective
    return typeof value === 'number' && Number.isFinite(value) ? value : 1e6
  }
  const found = nelderMead(
    objective,
    names.map((name) => Number(formula.params[name])),
  )
  return { formula: withValues(found.x.map((v) => Number(v.toPrecision(4)))) }
}
