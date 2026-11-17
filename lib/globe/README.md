# Globe

A reference viewer for a rotating Earth: NASA satellite maps on a sphere, with a cloud shell, an atmosphere glow, a day
and night side, and city lights at night. It is eye candy with no game logic, kept as a working reference to copy from.

## Run it on localhost

The viewer is static files, but a browser will not load the maps from a `file://` page, so serve the folder over HTTP.
From the repository root:

```bash
python -m http.server 4173 --directory lib/globe
```

Then open <http://localhost:4173/>. Any static file server works, e.g. `npx serve lib/globe`.

The page loads three.js r159 from the jsDelivr CDN, so the first load needs an internet connection. It needs a browser
with WebGL 2.

Drag to orbit the camera and scroll to zoom. The button below the globe stops and starts the rotation.

## Files

| Path                              | Content                                                        |
| --------------------------------- | -------------------------------------------------------------- |
| `index.html`                      | The page: a full-window canvas and the three.js import map.    |
| `globe.js`                        | The scene, the three shaders, and the orbit and zoom controls. |
| `assets/`                         | The four maps the viewer loads, about 5.3 MB together.         |
| `scripts/build-globe-textures.py` | Rebuilds the maps from NASA's original maps.                   |

The values most worth tuning, e.g. spin speed, sharpness, and whether clouds are drawn, are in `SETTINGS` at the top of
`globe.js`.

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
- The clouds are a second, slightly larger sphere that drifts over the surface and casts shadows on it.
- The atmosphere is a third, larger sphere drawn from the inside with additive blending, blue on the day side and
  orange near the terminator.
- The sun stays fixed while the planet spins on a tilted axis, so the day and night cycle comes from the rotation.

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

To use the full-quality maps for good, make `full` the default in `MAP_SETS` at the top of `globe.js`, remove
`assets-full/` from `.gitignore`, and commit the folder.

## Sources

All imagery is from NASA's Earth Observatory and is in the public domain.

- Day colour: Blue Marble Next Generation with topography and bathymetry, August 2004.
- Night lights: Earth at Night 2012.
- Relief: GEBCO_08 elevation, as distributed with Blue Marble Next Generation.
- Clouds: Blue Marble 2002 cloud layer. Its largest available size is 2048 × 1024, so clouds are the softest layer.
