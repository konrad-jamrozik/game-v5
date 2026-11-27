/**
 * Renders the synthesised Combat replay Sounds of `assets/sounds/` as WAV files: `node scripts/render-combat-sounds.ts`.
 * Each Sound is a recipe of filtered noise bursts and swept tones, and the noise comes from a seeded generator, so the
 * same recipe always renders the same file.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SAMPLE_RATE = 44100
const SILENT = 0.0001

type Wave = 'sine' | 'square' | 'sawtooth' | 'triangle'
type Filter = 'lowpass' | 'highpass' | 'bandpass'

interface Part {
  /** When the part starts, in seconds from the start of the Sound. */
  readonly at?: number
  /** How long the part rises to its peak, in seconds. */
  readonly attack?: number
  /** How long the part decays from its peak, in seconds. */
  readonly dur: number
  readonly peak: number
  /** The frequency at the start and, when it sweeps, at the end, in Hz. */
  readonly f0: number
  readonly f1?: number
}

interface TonePart extends Part {
  readonly kind: 'tone'
  readonly wave?: Wave
}

interface NoisePart extends Part {
  readonly kind: 'noise'
  readonly filter?: Filter
  readonly q?: number
}

interface Recipe {
  readonly name: string
  /** The loudest sample of the rendered file, from 0 to 1. */
  readonly level: number
  /** What its noise is generated from, when not its place among the recipes. */
  readonly seed?: number
  readonly parts: readonly (TonePart | NoisePart)[]
}

const tone = (part: Omit<TonePart, 'kind'>): TonePart => ({ kind: 'tone', ...part })
const noise = (part: Omit<NoisePart, 'kind'>): NoisePart => ({ kind: 'noise', ...part })

const RIFLE: readonly (TonePart | NoisePart)[] = [
  noise({ dur: 0.025, peak: 0.9, filter: 'highpass', f0: 2600 }),
  noise({ dur: 0.2, peak: 0.9, f0: 5200, f1: 500 }),
  tone({ dur: 0.12, peak: 0.9, f0: 120, f1: 40 }),
  noise({ at: 0.02, dur: 0.55, peak: 0.16, f0: 1200, f1: 300 }),
]

const RECIPES: readonly Recipe[] = [
  {
    name: 'shot-blade',
    level: 0.3,
    parts: [noise({ dur: 0.1, attack: 0.04, peak: 0.3, filter: 'bandpass', q: 2, f0: 700, f1: 2600 })],
  },
  {
    name: 'shot-light-pistol',
    level: 0.45,
    parts: [
      noise({ dur: 0.11, peak: 0.7, f0: 3800, f1: 700 }),
      noise({ dur: 0.02, peak: 0.5, filter: 'highpass', f0: 3000 }),
      tone({ dur: 0.07, peak: 0.6, f0: 190, f1: 60 }),
    ],
  },
  {
    name: 'shot-heavy-pistol',
    level: 0.55,
    parts: [
      noise({ dur: 0.15, peak: 0.8, f0: 3200, f1: 500 }),
      noise({ dur: 0.02, peak: 0.6, filter: 'highpass', f0: 2800 }),
      tone({ dur: 0.09, peak: 0.8, f0: 160, f1: 50 }),
      noise({ at: 0.02, dur: 0.3, peak: 0.12, f0: 900, f1: 300 }),
    ],
  },
  { name: 'shot-rifle', level: 0.7, parts: RIFLE },
  {
    name: 'shot-sighted-rifle',
    level: 0.7,
    parts: [
      ...RIFLE,
      tone({ dur: 0.12, peak: 0.2, wave: 'triangle', f0: 1400, f1: 900 }),
      tone({ dur: 0.1, peak: 0.5, f0: 90, f1: 35 }),
    ],
  },
  {
    name: 'shot-machine-gun',
    level: 0.5,
    parts: [
      noise({ dur: 0.08, peak: 0.75, f0: 4200, f1: 600 }),
      noise({ dur: 0.015, peak: 0.6, filter: 'highpass', f0: 2800 }),
      tone({ dur: 0.06, peak: 0.7, f0: 140, f1: 50 }),
    ],
  },
  {
    name: 'shot-laser-pistol',
    level: 0.45,
    parts: [
      tone({ dur: 0.11, peak: 0.2, wave: 'square', f0: 2200, f1: 500 }),
      tone({ dur: 0.11, peak: 0.3, f0: 1100, f1: 250 }),
      noise({ dur: 0.05, peak: 0.12, filter: 'highpass', f0: 5000 }),
    ],
  },
  {
    name: 'shot-laser-rifle',
    level: 0.6,
    parts: [
      tone({ dur: 0.3, peak: 0.22, wave: 'sawtooth', f0: 1000, f1: 180 }),
      tone({ dur: 0.3, peak: 0.22, wave: 'sawtooth', f0: 1012, f1: 186 }),
      tone({ dur: 0.3, peak: 0.35, f0: 500, f1: 90 }),
      noise({ dur: 0.25, peak: 0.12, filter: 'highpass', f0: 4000 }),
    ],
  },
  {
    name: 'shot-focused-laser-rifle',
    level: 0.75,
    parts: [
      tone({ dur: 0.45, peak: 0.8, f0: 90, f1: 38 }),
      tone({ dur: 0.45, peak: 0.22, wave: 'sawtooth', f0: 1300, f1: 140 }),
      tone({ dur: 0.45, peak: 0.22, wave: 'sawtooth', f0: 1318, f1: 146 }),
      tone({ dur: 0.3, peak: 0.05, wave: 'square', f0: 2600, f1: 1800 }),
      noise({ dur: 0.5, peak: 0.14, filter: 'bandpass', q: 1.2, f0: 6000, f1: 2500 }),
    ],
  },
  {
    name: 'hit-kinetic',
    level: 0.45,
    parts: [
      tone({ dur: 0.07, peak: 0.5, f0: 130, f1: 55 }),
      noise({ dur: 0.03, peak: 0.4, filter: 'bandpass', q: 3, f0: 2400 }),
    ],
  },
  {
    name: 'hit-energy',
    level: 0.4,
    parts: [
      noise({ dur: 0.28, peak: 0.2, filter: 'highpass', f0: 3500 }),
      tone({ dur: 0.2, peak: 0.15, f0: 700, f1: 180 }),
    ],
  },
  {
    name: 'hit-blade',
    level: 0.45,
    parts: [
      noise({ dur: 0.04, peak: 0.5, filter: 'bandpass', q: 1.5, f0: 4500 }),
      tone({ dur: 0.08, peak: 0.5, f0: 110, f1: 50 }),
    ],
  },
  // The three Sounds of a kinetic miss: a narrow whiz, the same an octave lower, and a wider, softer whoosh.
  {
    name: 'miss-kinetic-1',
    level: 0.25,
    seed: 13,
    parts: [noise({ dur: 0.12, attack: 0.03, peak: 0.22, filter: 'bandpass', q: 6, f0: 3200, f1: 900 })],
  },
  {
    name: 'miss-kinetic-2',
    level: 0.25,
    seed: 41,
    parts: [noise({ dur: 0.12, attack: 0.03, peak: 0.22, filter: 'bandpass', q: 5, f0: 1600, f1: 450 })],
  },
  {
    name: 'miss-kinetic-3',
    level: 0.25,
    seed: 42,
    parts: [noise({ dur: 0.17, attack: 0.045, peak: 0.22, filter: 'bandpass', q: 2.2, f0: 900, f1: 300 })],
  },
]

/** A small seeded generator of white noise, from -1 to 1. */
function whiteNoise(seed: number): () => number {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return (((t ^ (t >>> 14)) >>> 0) / 4294967296) * 2 - 1
  }
}

/** The envelope of a part: it rises to the peak over the attack and decays over the duration, both exponentially. */
function envelope(part: Part, attack: number, t: number): number {
  if (t < attack) {
    return SILENT * (part.peak / SILENT) ** (t / attack)
  }
  return part.peak * (SILENT / part.peak) ** Math.min(1, (t - attack) / part.dur)
}

/** The frequency of a part at a moment: it sweeps exponentially from `f0` to `f1` over the whole part. */
function frequency(part: Part, length: number, t: number): number {
  return part.f1 === undefined ? part.f0 : part.f0 * (part.f1 / part.f0) ** Math.min(1, t / length)
}

function wave(kind: Wave, phase: number): number {
  const x = phase - Math.floor(phase)
  if (kind === 'sine') {
    return Math.sin(x * Math.PI * 2)
  }
  if (kind === 'square') {
    return x < 0.5 ? 1 : -1
  }
  return kind === 'sawtooth' ? 2 * x - 1 : 1 - 4 * Math.abs(x - 0.5)
}

function render(recipe: Recipe, seed: number): Float32Array {
  const ends = recipe.parts.map((part) => (part.at ?? 0) + (part.attack ?? 0.003) + part.dur)
  const samples = new Float32Array(Math.ceil((Math.max(...ends) + 0.01) * SAMPLE_RATE))
  recipe.parts.forEach((part, index) => {
    const attack = part.attack ?? 0.003
    const length = attack + part.dur
    const start = Math.round((part.at ?? 0) * SAMPLE_RATE)
    const count = Math.floor(length * SAMPLE_RATE)
    const next = whiteNoise(seed * 31 + index)
    let phase = 0
    // The state of the noise filter, a biquad in transposed direct form II.
    let z1 = 0
    let z2 = 0
    for (let n = 0; n < count; n += 1) {
      const t = n / SAMPLE_RATE
      const f = frequency(part, length, t)
      let value: number
      if (part.kind === 'tone') {
        phase += f / SAMPLE_RATE
        value = wave(part.wave ?? 'sine', phase)
      } else {
        const w = (2 * Math.PI * Math.min(f, SAMPLE_RATE * 0.45)) / SAMPLE_RATE
        const cos = Math.cos(w)
        const alpha = Math.sin(w) / (2 * (part.q ?? 0.7))
        const filter = part.filter ?? 'lowpass'
        const b0 = filter === 'lowpass' ? (1 - cos) / 2 : filter === 'highpass' ? (1 + cos) / 2 : alpha
        const b1 = filter === 'lowpass' ? 1 - cos : filter === 'highpass' ? -(1 + cos) : 0
        const b2 = filter === 'bandpass' ? -alpha : b0
        const a0 = 1 + alpha
        const input = next()
        value = (b0 / a0) * input + z1
        z1 = (b1 / a0) * input + ((2 * cos) / a0) * value + z2
        z2 = (b2 / a0) * input - ((1 - alpha) / a0) * value
      }
      const at = start + n
      samples[at] = (samples[at] ?? 0) + value * envelope(part, attack, t)
    }
  })
  // The file is as loud as its level says, and its last 5 ms fade, so that it does not end in a click.
  const loudest = samples.reduce((peak, sample) => Math.max(peak, Math.abs(sample)), 0) || 1
  const fade = Math.round(0.005 * SAMPLE_RATE)
  return samples.map((sample, n) => (sample / loudest) * recipe.level * Math.min(1, (samples.length - 1 - n) / fade))
}

/** A mono 16-bit PCM WAV file. */
function wav(samples: Float32Array): Buffer {
  const data = Buffer.alloc(44 + samples.length * 2)
  data.write('RIFF', 0, 'ascii')
  data.writeUInt32LE(36 + samples.length * 2, 4)
  data.write('WAVEfmt ', 8, 'ascii')
  data.writeUInt32LE(16, 16)
  data.writeUInt16LE(1, 20)
  data.writeUInt16LE(1, 22)
  data.writeUInt32LE(SAMPLE_RATE, 24)
  data.writeUInt32LE(SAMPLE_RATE * 2, 28)
  data.writeUInt16LE(2, 32)
  data.writeUInt16LE(16, 34)
  data.write('data', 36, 'ascii')
  data.writeUInt32LE(samples.length * 2, 40)
  samples.forEach((sample, n) => {
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, sample)) * 32767), 44 + n * 2)
  })
  return data
}

const directory = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'sounds')
mkdirSync(directory, { recursive: true })
RECIPES.forEach((recipe, index) => {
  writeFileSync(join(directory, `${recipe.name}.wav`), wav(render(recipe, recipe.seed ?? index + 1)))
})
console.log(`Rendered ${RECIPES.length} Sounds into ${directory}`)
