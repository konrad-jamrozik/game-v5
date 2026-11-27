// The globe as one drop-in piece: `mountGlobe(container, options)` fills `container` with the globe's canvas, its
// controls, its imagery credit, and its messages, and returns a handle to show, hide, and remove it. This module does
// not import three.js; it loads `globe-scene.js`, and with it three.js and the maps, only when the globe is first
// shown. It reads no game state. See README.md for how to run it and how to use it in an Implementation.

const MAP_FILES = {
  day: 'earth-day.webp',
  night: 'earth-night-lights.webp',
  normalWater: 'earth-normal-water.jpg',
  clouds: 'earth-clouds.webp',
}

// The values each control steps through, the first being the default.
const CLOUD_LEVELS = [1, 0.5, 0] // shown in full, at half opacity, off
const CYCLE_SPEEDS = [0, 1, 2, 4, 8, 16, 32] // day and night speed, from stopped to 32 times as fast; 1× by default
// the planet's axis: `z` leans it sideways in view, `x` leans its north pole toward the camera, both in radians
const TILTS = [
  { name: 'Level', x: 0, z: 0 }, // the axis upright, the equator level
  { name: 'Mild', x: 0.15, z: -0.15 },
  { name: 'Earth', x: 0.15, z: -0.41 }, // Earth's own axial tilt, about 23.5°
]

const MESSAGES = {
  loading: 'Loading the globe…',
  webgl: 'The globe needs WebGL 2, which this browser does not offer.',
  maps: 'The globe could not load its maps. It tries again the next time it is shown.',
  lost: 'The globe was interrupted. It starts again the next time it is shown.',
}

const LABEL =
  'Rotating globe of the Earth built from NASA satellite imagery, with clouds, an atmosphere glow, a day and night ' +
  'side, and city lights at night'

const CREDIT = 'Imagery: NASA Blue Marble and Earth at Night'

const ICONS = {
  stop: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3.5" y="3.5" width="9" height="9" rx="0.5"/></svg>',
  start: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 2.8v10.4L13 8z"/></svg>',
  cloud:
    '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.6 12.5a3.1 3.1 0 0 1-.4-6.2 4.2 4.2 0 0 1 8 1.1 2.6 2.6 0 0 1-.3 5.1z"/></svg>',
  cycle:
    '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2.2a5.8 5.8 0 1 0 0 11.6zm0 1.3a4.5 4.5 0 0 1 0 9z" fill-rule="evenodd"/></svg>',
  slower: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="7.3" width="10" height="1.4"/></svg>',
  faster:
    '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M7.3 3h1.4v4.3H13v1.4H8.7V13H7.3V8.7H3V7.3h4.3z"/></svg>',
}

// a ring crossed by the planet's axis, leaning as the axis leans in view
function tiltIcon(z) {
  const degrees = ((-z * 180) / Math.PI).toFixed(1)
  return (
    '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3a5 5 0 1 0 0 10A5 5 0 0 0 8 3zm0 1.3a3.7 3.7 0 1 1 0 7.4 3.7 3.7 0 0 1 0-7.4z" fill-rule="evenodd"/>' +
    `<rect x="7.35" y="0.5" width="1.3" height="15" transform="rotate(${degrees} 8 8)"/></svg>`
  )
}

function element(tag, className) {
  const node = document.createElement(tag)
  node.className = className
  return node
}

function controlButton(onClick) {
  const button = element('button', 'globe-button')
  button.type = 'button'
  button.addEventListener('click', onClick)
  return button
}

/**
 * Mounts the globe in `container`, which sets its size. Options, all optional:
 * - `mapBase`: the address of the directory that holds the four maps, relative to the page, e.g. './globe/'.
 *   Default './assets/'.
 * - `maps`: addresses of single maps, by name (`day`, `night`, `normalWater`, `clouds`), in place of `mapBase`.
 * - `background`: the opaque CSS colour behind the planet. Default '#050506'.
 * - `memory`: an object in which the globe keeps its camera and control settings; a new globe given the same object
 *   starts where the old one was.
 */
export function mountGlobe(container, options = {}) {
  const mapBase = options.mapBase ?? './assets/'
  const maps = {
    day: mapBase + MAP_FILES.day,
    night: mapBase + MAP_FILES.night,
    normalWater: mapBase + MAP_FILES.normalWater,
    clouds: mapBase + MAP_FILES.clouds,
    ...options.maps,
  }
  const background = options.background ?? '#050506'
  const memory = options.memory ?? {}
  if (memory.controls === undefined) {
    // a Player who asks for reduced motion gets a still globe until they start it
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    memory.controls = { rotating: !reduced, clouds: CLOUD_LEVELS[0], cycleSpeed: reduced ? 0 : 1 }
  }
  memory.controls.tilt ??= TILTS[0]
  memory.view ??= {}
  const { controls, view } = memory

  const root = element('div', 'globe')
  const status = element('p', 'globe-status')
  status.setAttribute('role', 'status')
  const hud = element('div', 'globe-hud')
  const bar = element('div', 'globe-controls')
  bar.setAttribute('role', 'group')
  bar.setAttribute('aria-label', 'Globe')
  const credit = element('p', 'globe-credit')
  credit.textContent = CREDIT

  const spinButton = controlButton(() => {
    controls.rotating = !controls.rotating
    showControls()
  })
  const cloudsButton = controlButton(() => {
    controls.clouds = CLOUD_LEVELS[(CLOUD_LEVELS.indexOf(controls.clouds) + 1) % CLOUD_LEVELS.length]
    showControls()
  })
  // the day and night speed: a slower and a faster button around the speed it is at
  const stepCycle = (step) => {
    const at = CYCLE_SPEEDS.indexOf(controls.cycleSpeed)
    controls.cycleSpeed = CYCLE_SPEEDS[Math.max(0, Math.min(CYCLE_SPEEDS.length - 1, at + step))]
    showControls()
  }
  const slowerButton = controlButton(() => stepCycle(-1))
  slowerButton.innerHTML = ICONS.slower
  const fasterButton = controlButton(() => stepCycle(1))
  fasterButton.innerHTML = ICONS.faster
  const cycleSpeed = element('span', 'globe-readout')
  const cycleGroup = element('div', 'globe-stepper')
  cycleGroup.append(slowerButton, cycleSpeed, fasterButton)
  const tiltButton = controlButton(() => {
    controls.tilt = TILTS[(TILTS.findIndex((tilt) => tilt.name === controls.tilt.name) + 1) % TILTS.length]
    showControls()
  })
  bar.append(spinButton, cloudsButton, cycleGroup, tiltButton)
  hud.append(bar, credit)

  function showControls() {
    spinButton.innerHTML = controls.rotating ? ICONS.stop : ICONS.start
    spinButton.title = controls.rotating ? 'Stop rotation' : 'Start rotation'
    spinButton.setAttribute('aria-label', spinButton.title)
    spinButton.setAttribute('aria-pressed', String(controls.rotating))

    const clouds = { 1: 'Full', 0.5: 'Half', 0: 'Off' }[controls.clouds]
    cloudsButton.innerHTML = `${ICONS.cloud}<span>${clouds}</span>`
    cloudsButton.title = `Clouds: ${clouds.toLowerCase()}`
    cloudsButton.setAttribute('aria-label', cloudsButton.title)

    const speed = controls.cycleSpeed === 0 ? 'Stopped' : `${controls.cycleSpeed}×`
    cycleSpeed.innerHTML = `${ICONS.cycle}<span>${speed}</span>`
    cycleSpeed.title = `Day and night: ${controls.cycleSpeed === 0 ? 'stopped' : `${speed} speed`}`
    const at = CYCLE_SPEEDS.indexOf(controls.cycleSpeed)
    slowerButton.disabled = at === 0
    slowerButton.title = at === 1 ? 'Stop day and night' : 'Slower day and night'
    slowerButton.setAttribute('aria-label', `${slowerButton.title}; now ${cycleSpeed.title.toLowerCase()}`)
    fasterButton.disabled = at === CYCLE_SPEEDS.length - 1
    fasterButton.title = at === 0 ? 'Start day and night' : 'Faster day and night'
    fasterButton.setAttribute('aria-label', `${fasterButton.title}; now ${cycleSpeed.title.toLowerCase()}`)

    tiltButton.innerHTML = `${tiltIcon(controls.tilt.z)}<span>${controls.tilt.name}</span>`
    tiltButton.title = `Tilt: ${controls.tilt.name.toLowerCase()}`
    tiltButton.setAttribute('aria-label', tiltButton.title)
  }
  showControls()

  let canvas = null
  function newCanvas() {
    // a canvas whose graphics context was lost cannot be drawn on again, so every start gets a new one
    const fresh = element('canvas', 'globe-canvas')
    fresh.setAttribute('role', 'img')
    fresh.setAttribute('aria-label', LABEL)
    if (canvas) canvas.replaceWith(fresh)
    else root.prepend(fresh)
    canvas = fresh
  }
  newCanvas()
  root.append(status, hud)
  container.append(root)

  // idle, loading, shown, webgl (no WebGL 2), maps (a map failed), lost (graphics context lost), or removed
  let state = 'idle'
  let scene = null
  let attempt = 0
  let shown = true
  let pageVisible = document.visibilityState !== 'hidden'
  const inView = () => shown && pageVisible

  function update() {
    const message = MESSAGES[state]
    status.hidden = message === undefined
    status.textContent = message ?? ''
    hud.hidden = !inView()
    bar.hidden = state !== 'shown'
    if (scene) scene.setRunning(inView())
    if (state === 'idle' && inView()) start()
  }

  async function start() {
    state = 'loading'
    const mine = ++attempt
    update()
    try {
      const { createScene } = await import('./globe-scene.js')
      const created = await createScene({
        canvas,
        maps,
        background,
        controls,
        view,
        onContextLost: () => {
          scene?.dispose()
          scene = null
          state = 'lost'
          update()
        },
      })
      if (state === 'removed' || mine !== attempt) {
        created.dispose()
        return
      }
      scene = created
      state = 'shown'
      update()
    } catch (error) {
      if (state === 'removed' || mine !== attempt) return
      console.error(error)
      state = error?.reason === 'webgl' ? 'webgl' : 'maps'
      update()
    }
  }

  // Showing the globe again after a failed map or a lost graphics context is the retry.
  function cameIntoView() {
    if (state === 'maps' || state === 'lost') {
      newCanvas()
      state = 'idle'
    }
  }

  const onVisibility = () => {
    const was = inView()
    pageVisible = document.visibilityState !== 'hidden'
    if (!was && inView()) cameIntoView()
    update()
  }
  document.addEventListener('visibilitychange', onVisibility)

  update()

  return {
    // false while something covers the globe, e.g. a panel opened over it; it then stops drawing
    setVisible(visible) {
      if (state === 'removed') return
      const was = inView()
      shown = visible
      if (!was && inView()) cameIntoView()
      update()
    },
    // releases everything the globe created and removes it from `container`
    dispose() {
      if (state === 'removed') return
      state = 'removed'
      scene?.dispose()
      scene = null
      document.removeEventListener('visibilitychange', onVisibility)
      root.remove()
    },
  }
}
