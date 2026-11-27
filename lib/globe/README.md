# Globe

A rotating Earth: NASA satellite maps on a sphere, with a cloud shell, an atmosphere glow, a day and night side, city lights at night, and its own controls. It is eye candy with no game logic, kept as a working globe that an Implementation copies unchanged, and this folder also holds a reference viewer to try it in.

## Run it on localhost

The viewer is static files, but a browser will not load the maps from a `file://` page, so serve the folder over HTTP. From the repository root:

```bash
npm run globe
```

Then open <http://localhost:4720/>. To use another port, run `npm run globe -- --port 4800`.

This server forbids the browser to keep any file, so a reload always shows the globe as it is on disk. Any other static file server also works, e.g. `python -m http.server 4720 --directory lib/globe`, but the browser may then go on running the globe's code from before a change, e.g. a new control that does nothing, until a reload that skips its cache, Ctrl+Shift+R in most browsers.

The page loads three.js r159 from the jsDelivr CDN, so the first load needs an internet connection. It needs a browser with WebGL 2.

Drag to orbit the camera and scroll to zoom. The buttons at the bottom left, above the imagery credit, are the globe's controls:

| Button | Each press | Starts at |
| --- | --- | --- |
| ■ or ▶ | Stops or starts the rotation of the planet in view. | Rotating |
| Clouds | Shows the clouds in full, then at half opacity, then not at all, then again in full. | Full |
| − and + | Slow down or speed up the day and night cycle, which the speed between them shows, one step of 0×, i.e. stopped, 1×, 2×, 4×, 8×, 16×, and 32×; + on 32× goes to 0×, and − on 0× to 32×. Each also resumes a paused cycle. | 1× |
| The speed | Pauses the day and night cycle at whatever speed it is, showing ‖ in place of its icon, or resumes it at that speed. | Running |

The planet's axis stands upright in view, with the equator level. The day and night cycle moves the sun over the surface, so it goes on while the rotation is stopped. With rotation on and the cycle at 1×, the two cancel and the sun stands still in view. A browser that asks for reduced motion starts with both the rotation and the cycle stopped.

## Devastation

Devastation is an experiment: one number from 0, the planet as it is, to 1, wrecked, that an Implementation would set from the game, e.g. from Panic, with `setDevastation` on the handle. Nothing sets it yet, so the globe is drawn at 0 everywhere but in the viewer.

In the viewer, the Devastation slider at the top left sets it, and `?devastation=60` in the address starts with it at 60%. Each effect comes in over its own part of the range:

| From about | Effect |
| --- | --- |
| 0% | The atmosphere glow thickens and turns from blue to a dirty orange, the clouds grey to smoke, and banks of smoke fill the gaps between them. |
| 10% | The land dries to brown, patch by patch, and the sea turns murky. |
| 30% | City lights go out district by district, and fires start where the cities are, flickering and brightest on the night side. |
| 35% | The ground scorches black, around the cities first. |
| 45% | The sky turns red, and dark plumes stand over the burning regions. |
| 60% | Wildfires spread over the scorched land, and a red glow reaches around the night side. |

The globe eases to a new level over about a second. A browser that asks for reduced motion gets fires and smoke that stand still. Turning the clouds off also hides the smoke, which is drawn on the cloud shell.

On top of those, eleven further effects can each be switched off, with the checkboxes under the slider or with `setDevastationEffects` on the handle, e.g. `{ bloom: false }`. `?off=bloom,alien` in the address starts with those off, and `?only=scars` with every other one off. `DEVASTATION_EFFECTS` in `globe.js` lists them:

| Name | From about | Effect |
| --- | --- | --- |
| `scars` | 30% | Craters, each appearing white-hot at its own level and cooling to dull red and then black as devastation rises further. |
| `terrain` | 15% | Forests scorch and burn first, deserts raise dust storms, the ice greys with soot and melts back from its edge, and the sea floods the coasts. |
| `slicks` | 15% | Slicks spread from the coasts, algae-green in some seas and oil-black in others. |
| `alien` | 65% | Violet and green veins glow in a few regions of the scorched land and around the scars, and curtains of the same light hang in the atmosphere glow. |
| `lightning` | 40% | Cells of thick smoke flash now and then. Left out for a browser that asks for reduced motion. |
| `fireLines` | 40% | Fire fronts creep over the land and leave black behind them. |
| `wind` | 45% | The smoke is drawn out along the parallels, plumes trail downwind, and storms turn in the smoke. |
| `debris` | 55% | Ash and embers drift around the planet. |
| `dayFires` | 30% | Fires are bright on the day side too, under darker smoke columns that shade the ground. |
| `bloom` | 10% | Fires, lightning, and the red rim glow. The one effect with a real cost: the scene is drawn into an offscreen picture and blurred, though only while devastation is above 0. |
| `sky` | 20% | The sun dims and reddens, and the fainter stars go out. |

## Files

| Path | Content |
| --- | --- |
| `globe.js` | `mountGlobe`: the globe's elements, its controls, its messages, and its lifetime. It does not import three.js. |
| `globe-scene.js` | The scene, its shaders, and the orbit and zoom. It imports three.js and is loaded on first show. |
| `globe.css` | The styles of the globe's elements, using the game's Design tokens where the page defines them. |
| `globe.d.ts` | The types of `globe.js`, for TypeScript. |
| `index.html` | The viewer page: the three.js import map, the globe filling the window, and the Devastation slider and effect checkboxes. |
| `assets/` | The four maps the globe loads, about 14 MB together. |
| `scripts/build-globe-textures.py` | Rebuilds the maps from NASA's original maps. |
| `scripts/serve.ts` | Serves the viewer on localhost, as `npm run globe` runs it. |

The values most worth tuning, e.g. spin speed, day and night speed, and sharpness, are in `SETTINGS` at the top of `globe-scene.js`.

## Use in an Implementation

Copy `globe.js`, `globe-scene.js`, `globe.css`, and `globe.d.ts` unchanged into one source folder, e.g. `src/web/globe/`, copy the four maps of `assets/` unchanged into the folder the build serves as is, e.g. `public/globe/` with Vite, and add `three` at version 0.159.0 as a dependency. Leave the copied source folder out of the formatter and the linter, so the files stay as they are here. The Globe Integration recipe in `docs/specs/implementation/recipes/` explains why.

Then mount the globe in the element that should hold it, which sets its size. In a page without a framework:

```js
import { mountGlobe } from './globe/globe.js'
import './globe/globe.css' // or a <link rel="stylesheet"> to it

const globe = mountGlobe(document.getElementById('globe-stage'), { mapBase: './globe/', background: '#0d0d0b' })
// globe.setVisible(false) while a panel covers it, globe.setVisible(true) when it is closed
// globe.dispose() when the element is removed
```

In React:

```tsx
import { useEffect, useRef } from 'react'
import { mountGlobe, type GlobeHandle } from './globe/globe.js'
import './globe/globe.css'

export function Globe({ covered }: { covered: boolean }) {
  const element = useRef<HTMLDivElement>(null)
  const globe = useRef<GlobeHandle | null>(null)
  useEffect(() => {
    if (element.current === null) return
    const background = getComputedStyle(element.current).getPropertyValue('--background').trim() || '#0d0d0b'
    globe.current = mountGlobe(element.current, { mapBase: './globe/', background })
    return () => {
      globe.current?.dispose()
      globe.current = null
    }
  }, [])
  useEffect(() => {
    globe.current?.setVisible(!covered)
  }, [covered])
  return <div ref={element} style={{ position: 'absolute', inset: 0 }} />
}
```

`mapBase` is the address of the maps relative to the page, so the globe also loads when the build is served from a sub-path. `background` is the opaque colour behind the planet: the atmosphere is blended additively onto it, so it cannot be transparent. Everything else, i.e. loading three.js and the maps on first show, pausing while hidden, the controls, the messages, and recovery from a lost graphics context, is done by the copied files.

A browser test that is not about the globe runs much faster without it, because a browser without a display draws the globe in software. Before the page loads, make `HTMLCanvasElement.prototype.getContext('webgl2')` return `null`; the globe then shows its message in its place.

## Maps

Every map is equirectangular, with north at the top and longitude -180° at the left edge.

| File | Size | Content |
| --- | --- | --- |
| `earth-day.jpg` | 8192 × 4096 | Surface colour, as JPEG at quality 90 with full colour resolution. |
| `earth-night-lights.jpg` | 8192 × 4096 | One channel: city lights only, as JPEG at quality 90. |
| `earth-normal-water.webp` | 4096 × 2048 | Red and green: tangent-space normal, x towards east and y towards north. Blue: water mask. Lossless WebP. |
| `earth-clouds.jpg` | 4096 × 2048 | One channel: cloud cover, upscaled smoothly from the 2048 × 1024 source. |

The maps are kept at full quality, about 14 MB together, so the globe shows all the detail of its sources.

## How it is drawn

- The surface is a sphere shaded from the four maps: day colour lit by a fixed sun, relief from the normal map, a sun glint on water only, and city lights that fade in on the night side.
- The clouds are a second, slightly larger sphere that drifts over the surface at the day and night speed and casts shadows on it. At half opacity both the clouds and their shadows are halved.
- The atmosphere is a third, larger sphere drawn from the inside with additive blending, blue on the day side and orange near the terminator.
- The planet turns on its upright axis, and the sun, placed for Earth's own tilt of about 23.5° so that the lit side shows a season, moves around that axis at the day and night speed. At 1× with rotation on, the two cancel, so the sun stands still in view while day and night sweep over the surface.

## Rebuilding the maps

The maps are committed, so this is only needed to change how they are derived. It requires Python 3 with Pillow and NumPy:

```bash
python lib/globe/scripts/build-globe-textures.py
```

The script downloads about 40 MB of source maps into the system temp directory on its first run and reuses them afterwards.

## Sources

All imagery is from NASA's Earth Observatory and is in the public domain.

- Day colour: Blue Marble Next Generation with topography and bathymetry, August 2004.
- Night lights: Earth at Night 2012.
- Relief: GEBCO_08 elevation, as distributed with Blue Marble Next Generation.
- Clouds: Blue Marble 2002 cloud layer. Its largest available size is 2048 × 1024, so clouds are the softest layer.
