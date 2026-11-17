# Globe

A rotating Earth: NASA satellite maps on a sphere, with a cloud shell, an atmosphere glow, a day and night side, city
lights at night, and its own controls. It is eye candy with no game logic, kept as a working globe that an
Implementation copies unchanged, and this folder also holds a reference viewer to try it in.

## Run it on localhost

The viewer is static files, but a browser will not load the maps from a `file://` page, so serve the folder over HTTP.
From the repository root:

```bash
python -m http.server 4173 --directory lib/globe
```

Then open <http://localhost:4173/>. Any static file server works, e.g. `npx serve lib/globe`.

The page loads three.js r159 from the jsDelivr CDN, so the first load needs an internet connection. It needs a browser
with WebGL 2.

Drag to orbit the camera and scroll to zoom. The three buttons at the bottom left, above the imagery credit, are the
globe's controls:

| Button        | Each press                                                                           | Starts at |
| ------------- | ------------------------------------------------------------------------------------ | --------- |
| ■ or ▶        | Stops or starts the rotation of the planet in view.                                  | Rotating  |
| Clouds        | Shows the clouds in full, then at half opacity, then not at all, then again in full. | Full      |
| Day and night | Sets the speed of the day and night cycle: 1×, 2×, 4×, stopped, then 1× again.       | 1×        |

The day and night cycle moves the sun over the surface, so it goes on while the rotation is stopped. With rotation on
and the cycle at 1×, the two cancel and the sun stands still in view. A browser that asks for reduced motion starts
with both the rotation and the cycle stopped.

## Files

| Path                              | Content                                                                                                        |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `globe.js`                        | `mountGlobe`: the globe's elements, its controls, its messages, and its lifetime. It does not import three.js. |
| `globe-scene.js`                  | The scene, the three shaders, and the orbit and zoom. It imports three.js and is loaded on first show.         |
| `globe.css`                       | The styles of the globe's elements, using the game's Design tokens where the page defines them.                |
| `globe.d.ts`                      | The types of `globe.js`, for TypeScript.                                                                       |
| `index.html`                      | The viewer page: the three.js import map, the globe filling the window, and the map-set comparison.            |
| `assets/`                         | The four maps the globe loads, about 5.3 MB together.                                                          |
| `scripts/build-globe-textures.py` | Rebuilds the maps from NASA's original maps.                                                                   |

The values most worth tuning, e.g. spin speed, day and night speed, and sharpness, are in `SETTINGS` at the top of
`globe-scene.js`.

## Use in an Implementation

Copy `globe.js`, `globe-scene.js`, `globe.css`, and `globe.d.ts` unchanged into one source folder, e.g.
`src/web/globe/`, copy the four maps of `assets/` unchanged into the folder the build serves as is, e.g. `public/globe/`
with Vite, and add `three` at version 0.159.0 as a dependency. Leave the copied source folder out of the formatter and
the linter, so the files stay as they are here. The Globe Integration recipe in `docs/specs/implementation/recipes/`
explains why.

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

`mapBase` is the address of the maps relative to the page, so the globe also loads when the build is served from a
sub-path. `background` is the opaque colour behind the planet: the atmosphere is blended additively onto it, so it
cannot be transparent. Everything else, i.e. loading three.js and the maps on first show, pausing while hidden, the
controls, the messages, and recovery from a lost graphics context, is done by the copied files.

A browser test that is not about the globe runs much faster without it, because a browser without a display draws the
globe in software. Before the page loads, make `HTMLCanvasElement.prototype.getContext('webgl2')` return `null`; the
globe then shows its message in its place.

## Maps

Every map is equirectangular, with north at the top and longitude -180° at the left edge.

| File                      | Size        | Content                                                                                    |
| ------------------------- | ----------- | ------------------------------------------------------------------------------------------ |
| `earth-day.webp`          | 8192 × 4096 | Surface colour.                                                                            |
| `earth-night-lights.webp` | 8192 × 4096 | One channel: city lights only.                                                             |
| `earth-normal-water.jpg`  | 4096 × 2048 | Red and green: tangent-space normal, x towards east and y towards north. Blue: water mask. |
| `earth-clouds.webp`       | 2048 × 1024 | One channel: cloud cover.                                                                  |

The maps are compressed to keep the download small. Compared side by side in the viewer, they showed no visible
difference from the full-quality maps described below.

## How it is drawn

- The surface is a sphere shaded from the four maps: day colour lit by a fixed sun, relief from the normal map, a sun
  glint on water only, and city lights that fade in on the night side.
- The clouds are a second, slightly larger sphere that drifts over the surface at the day and night speed and casts
  shadows on it. At half opacity both the clouds and their shadows are halved.
- The atmosphere is a third, larger sphere drawn from the inside with additive blending, blue on the day side and
  orange near the terminator.
- The planet turns on a tilted axis, and the sun moves around that axis at the day and night speed. At 1× with
  rotation on, the two cancel, so the sun stands still in view while day and night sweep over the surface.

## Rebuilding the maps

The maps are committed, so this is only needed to change how they are derived. It requires Python 3 with Pillow and
NumPy:

```bash
python lib/globe/scripts/build-globe-textures.py
```

The script downloads about 40 MB of source maps into the system temp directory on its first run and reuses them
afterwards.

## Full-quality maps

The same four maps can be built at full quality, about 14 MB together. They are not committed, because the difference
is not visible in the viewer. To get them back:

```bash
python lib/globe/scripts/build-globe-textures.py --full
```

This also writes the following files into `assets-full/`, which Git ignores:

| File                      | Size        | Difference from `assets/`                                           |
| ------------------------- | ----------- | ------------------------------------------------------------------- |
| `earth-day.jpg`           | 8192 × 4096 | JPEG at quality 90 with full colour resolution, in place of WebP.   |
| `earth-night-lights.jpg`  | 8192 × 4096 | JPEG at quality 90, in place of WebP.                               |
| `earth-normal-water.webp` | 4096 × 2048 | Lossless WebP, in place of JPEG.                                    |
| `earth-clouds.jpg`        | 4096 × 2048 | Upscaled smoothly from the source, in place of the 2048 × 1024 map. |

Once `assets-full/` exists, the viewer shows a second button that switches between the two sets without moving the
camera, so they can be compared in place. Adding `?maps=full` to the address starts with the full-quality set.

To use the full-quality maps for good, make `full` the default in `MAP_SETS` in `index.html`, pass their addresses as
`maps` to `mountGlobe` in an Implementation, remove `assets-full/` from `.gitignore`, and commit the folder.

## Sources

All imagery is from NASA's Earth Observatory and is in the public domain.

- Day colour: Blue Marble Next Generation with topography and bathymetry, August 2004.
- Night lights: Earth at Night 2012.
- Relief: GEBCO_08 elevation, as distributed with Blue Marble Next Generation.
- Clouds: Blue Marble 2002 cloud layer. Its largest available size is 2048 × 1024, so clouds are the softest layer.
