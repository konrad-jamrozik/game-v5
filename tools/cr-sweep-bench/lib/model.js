/**
 * The part of the CR Sweep Bench that the page and the Node scripts share: the text form of Enemy teams and Agent
 * types, the candidate Combat rating formulas, and the scoring of a formula against the swept win rates. It uses no
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

/** One Combatant, e.g. `s100 h30 d10 a0`: skill, max health, weapon damage, and armor, which is 0 when left out. */
function parseCombatant(text, side) {
  const out = { skill: NaN, health: NaN, damage: NaN, armor: 0 }
  for (const token of text.trim().split(/\s+/)) {
    const m = /^([shda])(\d+(?:\.\d+)?)$/i.exec(token)
    if (m === null) {
      return `cannot read "${token}"; write e.g. s100 h30 d10 a0`
    }
    out[FIELD[m[1].toLowerCase()]] = Number(m[2])
  }
  const whole = (v, min) => Number.isSafeInteger(v) && v >= min
  if (side === 'enemy' ? !whole(out.skill, 1) : !(out.skill > 0 && Number.isInteger(Math.round(out.skill * 100)))) {
    return side === 'enemy' ? 's (skill) must be a whole number of at least 1' : 's (skill) must be above 0'
  }
  if (side === 'agent' && Math.abs(out.skill * 100 - Math.round(out.skill * 100)) > 1e-6) {
    return 's (skill) may have at most two digits after the decimal point'
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

function named(raw) {
  const at = raw.indexOf(':')
  return at < 0 ? { name: raw, body: raw } : { name: raw.slice(0, at).trim() || raw, body: raw.slice(at + 1) }
}

/**
 * Enemy teams, one per line, each one or more groups joined by `+`, e.g.
 * `boss and minions: 1 x s400 h60 d20 a40 + 12 x s40 h20 d8`. Text after `#` is a comment.
 */
export function parseTeams(text) {
  const teams = []
  const errors = []
  for (const { raw, line } of lines(text)) {
    const { name, body } = named(raw)
    const groups = []
    let problem = null
    for (const part of body.split('+')) {
      const m = /^\s*(\d+)\s*x\s+(.*)$/i.exec(part)
      if (m === null) {
        problem = `cannot read "${part.trim()}"; write e.g. 4 x s40 h20 d8 a0`
        break
      }
      const combatant = parseCombatant(m[2], 'enemy')
      if (typeof combatant === 'string') {
        problem = combatant
        break
      }
      if (Number(m[1]) < 1) {
        problem = 'a group needs at least 1 Enemy'
        break
      }
      groups.push({ count: Number(m[1]), ...combatant })
    }
    if (problem === null) {
      teams.push({ name, groups })
    } else {
      errors.push({ line, message: problem })
    }
  }
  return { teams, errors }
}

/** Agent types, one per line, e.g. `veteran, rifle and vest: s200 h30 d14 a20`. */
export function parseTypes(text) {
  const types = []
  const errors = []
  for (const { raw, line } of lines(text)) {
    const { name, body } = named(raw)
    const combatant = parseCombatant(body, 'agent')
    if (typeof combatant === 'string') {
      errors.push({ line, message: combatant })
    } else {
      types.push({ name, ...combatant })
    }
  }
  return { types, errors }
}

export const formatCombatant = (c) => `s${c.skill} h${c.health} d${c.damage} a${c.armor}`
export const formatGroups = (groups) => groups.map((g) => `${g.count} x ${formatCombatant(g)}`).join(' + ')

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

/** The names a formula's expressions may read besides its own parameters. */
export const FORMULA_VARS = { combatant: COMBATANT_VARS, team: TEAM_VARS, math: MATH }

/**
 * A formula is `{ combatant, aux, team, enemyCombatant, params }`. `combatant` rates one Combatant and `aux`, which
 * may be empty, gives a second number for it; `team` rates a side from `sum` and `sum2`, the sums of the two over the
 * side, and `count`. `enemyCombatant`, when not empty, replaces `combatant` for Enemies. Returns
 * `rate(groups, side, opponentStats)`, which takes a real `count` in every group so that the scoring can interpolate.
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
    // eslint-disable-next-line no-new-func -- the designer's own expression, typed on the designer's own machine.
    const fn = new Function(...vars, ...names, ...MATH, 'Math', `"use strict"; return (${expr});`)
    return (...args) => fn(...args, ...values, ...math, Math)
  }
  const blank = (expr) => expr === undefined || expr === null || String(expr).trim() === ''
  const agent = build(formula.combatant, COMBATANT_VARS)
  const enemy = blank(formula.enemyCombatant) ? agent : build(formula.enemyCombatant, COMBATANT_VARS)
  const aux = blank(formula.aux) ? null : build(formula.aux, COMBATANT_VARS)
  const team = build(formula.team, TEAM_VARS)
  return {
    rate(groups, side, opp) {
      const o = [opp.count, opp.skill, opp.damage, opp.health, opp.armor]
      const own = side === 'agent' ? agent : enemy
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
      return team(sum, sum2, count, ...o)
    },
  }
}

/* ---------- win-rate curves ---------- */

/**
 * The win rates of a pairing's points, made non-decreasing in the Agent count by pooling adjacent violators weighted
 * by their Combats, because more Agents never truly win less and a dip is only the dice.
 */
export function isotonic(points) {
  const sorted = [...points].filter((p) => p.trials > 0).sort((a, b) => a.n - b.n)
  const blocks = []
  for (const p of sorted) {
    blocks.push({ weight: p.trials, value: p.won / p.trials, size: 1 })
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
      const p = sorted[at]
      out.push({ n: p.n, rate: block.value, raw: p.won / p.trials, trials: p.trials })
      at += 1
    }
  }
  return out
}

/** The Agent count, between the points, at which the curve first reaches the win rate `p`; null when it never does. */
export function crossing(curve, p) {
  let prev = { n: 0, rate: 0 }
  for (const point of curve) {
    if (point.rate >= p) {
      return point.rate === prev.rate
        ? point.n
        : prev.n + ((point.n - prev.n) * (p - prev.rate)) / (point.rate - prev.rate)
    }
    prev = point
  }
  return null
}

/* ---------- features of a pairing ---------- */

/** What a pairing can be grouped and coloured by. `get` reads a prepared pairing. */
export const FEATURES = [
  { id: 'enemyCount', label: 'Enemies', log: true, get: (p) => p.enemyStats.count },
  { id: 'needed', label: 'Agents needed', log: true, get: (p) => p.needed },
  { id: 'countRatio', label: 'Agents needed per Enemy', log: true, get: (p) => p.needed / p.enemyStats.count },
  { id: 'agentSkill', label: 'Agent skill', log: true, get: (p) => p.agent.skill },
  {
    id: 'skillRatio',
    label: 'Agent skill ÷ mean Enemy skill',
    log: true,
    get: (p) => p.agent.skill / p.enemyStats.skill,
  },
  {
    id: 'agentHits',
    label: 'Hits an Agent needs per Enemy',
    log: true,
    get: (p) => (p.enemyStats.health + p.enemyStats.armor) / p.agent.damage,
  },
  {
    id: 'enemyHits',
    label: 'Hits an Enemy needs per Agent',
    log: true,
    get: (p) => (p.agent.health + p.agent.armor) / p.enemyStats.damage,
  },
  { id: 'agentArmor', label: 'Agent armor', log: false, get: (p) => p.agent.armor },
  { id: 'agentDamage', label: 'Agent weapon damage', log: false, get: (p) => p.agent.damage },
  { id: 'enemyArmor', label: 'Mean Enemy armor', log: false, get: (p) => p.enemyStats.armor },
  {
    id: 'enemyMix',
    label: 'Enemy skill, highest ÷ lowest',
    log: true,
    get: (p) => Math.max(...p.enemy.groups.map((g) => g.skill)) / Math.min(...p.enemy.groups.map((g) => g.skill)),
  },
  { id: 'fightSize', label: 'Combatants in the fight', log: true, get: (p) => p.needed + p.enemyStats.count },
]

/* ---------- scoring ---------- */

/**
 * What the swept win rates say of each pairing, whatever the formula: the Agent count that wins `level` of the
 * Combats, `needed`, and the count that wins half, `even`. A pairing that gives neither is excluded with its reason.
 */
export function prepare(records, level) {
  const pairings = []
  const excluded = []
  for (const record of records) {
    const curve = isotonic(record.points ?? [])
    const base = { key: record.key, agent: record.agent, enemy: record.enemy, record, curve }
    if (curve.length === 0) {
      excluded.push({ ...base, reason: 'no Combats fought' })
      continue
    }
    if (curve[0].n === 1 && curve[0].rate >= level) {
      excluded.push({ ...base, reason: 'one Agent already wins that often' })
      continue
    }
    const needed = crossing(curve, level)
    if (needed === null) {
      excluded.push({ ...base, reason: `never wins that often with up to ${curve[curve.length - 1].n} Agents` })
      continue
    }
    pairings.push({
      ...base,
      needed,
      even: crossing(curve, 0.5),
      enemyStats: sideStats(record.enemy.groups),
    })
  }
  return { pairings, excluded, level }
}

function ratioOf(compiled, pairing) {
  const { agent, enemy, enemyStats } = pairing
  return (n) => {
    const own = [{ count: n, skill: agent.skill, health: agent.health, damage: agent.damage, armor: agent.armor }]
    const mine = compiled.rate(own, 'agent', enemyStats)
    const theirs = compiled.rate(enemy.groups, 'enemy', { ...agent, count: n })
    return mine / theirs
  }
}

/** The Agent count at which `ratio` reaches `target`, searched around `near`; Infinity when it never does. */
function solveCount(ratio, target, near) {
  let lo = near
  let hi = near
  for (let i = 0; i < 40 && !(ratio(hi) >= target); i += 1) {
    hi *= 2
  }
  if (!(ratio(hi) >= target)) {
    return Infinity
  }
  for (let i = 0; i < 40 && ratio(lo) >= target; i += 1) {
    lo /= 2
  }
  for (let i = 0; i < 50; i += 1) {
    const mid = (lo + hi) / 2
    if (ratio(mid) >= target) {
      hi = mid
    } else {
      lo = mid
    }
  }
  return hi
}

const quantile = (sorted, q) => sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(q * sorted.length) - 1))]
const geomean = (values) => Math.exp(values.reduce((sum, v) => sum + Math.log(v), 0) / (values.length || 1))

/**
 * Scores a formula against prepared pairings.
 *
 * - `ratio`, of a pairing: the rating ratio, Agents to Enemies, the formula gives at the Agent count needed.
 * - `threshold`: the highest `ratio` of any pairing, or of all but the `ignoreWorst` share of them. A team at or above
 *   it wins at least `level` of its Combats in every pairing counted, so it is the ratio the game can promise.
 * - `over`, of a pairing: the Agents the threshold asks for, over the Agents needed. This over-deployment is what a
 *   poor formula costs the player, and unlike the threshold it does not shrink when a rating is merely rescaled, e.g.
 *   by showing its square root.
 */
export function score(formula, prepared, options = {}) {
  const ignoreWorst = options.ignoreWorst ?? 0
  let compiled
  try {
    compiled = compileFormula(formula)
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) }
  }
  const rows = []
  try {
    for (const pairing of prepared.pairings) {
      const ratio = ratioOf(compiled, pairing)
      const atNeeded = ratio(pairing.needed)
      if (!(atNeeded > 0) || !Number.isFinite(atNeeded)) {
        return {
          error: `the formula gives no rating ratio above 0 for ${pairing.agent.name} against ${pairing.enemy.name}`,
        }
      }
      rows.push({
        pairing,
        ratioFn: ratio,
        ratio: atNeeded,
        evenRatio: pairing.even === null ? null : ratio(pairing.even),
      })
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) }
  }
  if (rows.length === 0) {
    return { rows, summary: null }
  }
  const sorted = rows.map((r) => r.ratio).sort((a, b) => a - b)
  const threshold = quantile(sorted, 1 - ignoreWorst)
  let unsafePoints = 0
  for (const row of rows) {
    row.safeCount = solveCount(row.ratioFn, threshold, row.pairing.needed)
    row.over = row.safeCount / row.pairing.needed
    row.ignored = row.ratio > threshold * (1 + 1e-9)
    if (!row.ignored) {
      for (const p of row.pairing.record.points) {
        if (p.trials >= 50 && p.won / p.trials < prepared.level - 0.03 && row.ratioFn(p.n) >= threshold) {
          unsafePoints += 1
        }
      }
    }
  }
  const counted = rows.filter((r) => !r.ignored)
  const overs = counted.map((r) => r.over).sort((a, b) => a - b)
  const evens = rows.filter((r) => r.evenRatio !== null).map((r) => r.evenRatio)
  const finite = overs.every(Number.isFinite)
  return {
    rows,
    summary: {
      threshold,
      lowest: sorted[0],
      overMean: finite ? geomean(overs) : Infinity,
      overMedian: quantile(overs, 0.5),
      overMax: overs[overs.length - 1],
      evenRatio: geomean(evens),
      ignored: rows.length - counted.length,
      unsafePoints,
      // What Fit makes smallest: the mean over-deployment, on a log scale.
      objective: finite ? overs.reduce((sum, v) => sum + Math.log(v), 0) / overs.length : 1e6,
    },
  }
}

/* ---------- fitting ---------- */

/** Nelder-Mead: the `x` near `start` that makes `f` smallest. */
export function nelderMead(f, start, maxIterations = 400) {
  const n = start.length
  let simplex = [start.slice()]
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
    if (Math.abs(worst.value - best.value) < 1e-7) {
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

/** The values of the parameters `names` that give the formula the lowest mean over-deployment, and that formula. */
export function fit(formula, names, prepared, options = {}) {
  if (names.length === 0) {
    return { formula, objective: score(formula, prepared, options).summary?.objective ?? null }
  }
  const withValues = (x) => {
    const params = { ...formula.params }
    names.forEach((name, i) => {
      params[name] = x[i]
    })
    return { ...formula, params }
  }
  const objective = (x) => {
    const result = score(withValues(x), prepared, options)
    const value = result.summary?.objective
    return typeof value === 'number' && Number.isFinite(value) ? value : 1e6
  }
  const found = nelderMead(
    objective,
    names.map((name) => Number(formula.params[name])),
  )
  const rounded = found.x.map((v) => Number(v.toPrecision(4)))
  return { formula: withValues(rounded), objective: objective(rounded) }
}
