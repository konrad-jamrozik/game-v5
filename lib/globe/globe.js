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
const CYCLE_SPEEDS = [1, 2, 4, 8, 16, 0] // day and night speed: slow, then 2, 4, 8, and 16 times as fast, stopped

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
    memory.controls = { rotating: !reduced, clouds: CLOUD_LEVELS[0], cycleSpeed: reduced ? 0 : CYCLE_SPEEDS[0] }
  }
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
  const cycleButton = controlButton(() => {
    controls.cycleSpeed = CYCLE_SPEEDS[(CYCLE_SPEEDS.indexOf(controls.cycleSpeed) + 1) % CYCLE_SPEEDS.length]
    showControls()
  })
  bar.append(spinButton, cloudsButton, cycleButton)
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
    cycleButton.innerHTML = `${ICONS.cycle}<span>${speed}</span>`
    cycleButton.title = `Day and night: ${controls.cycleSpeed === 0 ? 'stopped' : `${speed} speed`}`
    cycleButton.setAttribute('aria-label', cycleButton.title)
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
