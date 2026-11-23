# Globe Integration

| Metadata | Value |
| --- | --- |
| Spec ID | GLOBE |
| Family | Recipes |
| Audience | UI designer, Implementer |
| Owns | Guidance on carrying the reference globe of the Spec repo into an Implementation and showing it in its graphical user interface. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Implementation Specification Conventions](../../governance/conventions/implementation-spec-conventions.md) |

# Overview

A rotating Earth gives the game a sense of place, but it cannot be rebuilt from a description: its look comes from large maps derived from satellite imagery and from shaders tuned by eye. The Spec repo therefore keeps a working globe, complete with its controls and its handling of failures, and hooking it up means copying that globe into an Implementation unchanged, not writing or porting one.

Everything about the hookup follows from treating the globe as a sealed decoration. It reads no game state and the engine never learns of it, so it lives wholly in the user interface. It is also the heaviest thing a Game build ships, so it costs the Player nothing until it is first shown.

The Graphical User Interface says what the Player needs to see, and the globe is decoration behind that: the [Campaign Screen](../../design/ui/screens/campaign-screen.md) gives the globe most of the screen, but an Implementation without a globe is still correct.

# Globe library

The `lib/globe/` directory of the [Spec repo](../mandatory/implementation-placement.md#glossary) holds a globe that already works, so that an implementer copies a known result instead of approximating one. Its files are the following; the table is exhaustive.

| Path | Content |
| --- | --- |
| `globe.js` | `mountGlobe`, the one entry point: it fills an element with the globe, its controls, its imagery credit, and its messages, and loads `globe-scene.js` only when the globe is first shown. |
| `globe-scene.js` | The scene, the shaders, the orbit and zoom, and their tunable `SETTINGS`. It is the only file that imports three.js. |
| `globe.css` | The styles of what `globe.js` creates, drawn with the [Design tokens](../../design/ui/visual-design.md#glossary) of Visual Design when the page defines them. |
| `globe.d.ts` | The types of `globe.js`, for an Implementation written in TypeScript. |
| `index.html` | The reference viewer: a page that mounts the globe and pins the version of three.js it runs on. |
| `README.md` | How to run the reference viewer, how to mount the globe in an Implementation, what each map holds, and where the imagery is from. |
| `assets/` | The four maps the globe is drawn from, about 5.3 MB together. |
| `scripts/build-globe-textures.py` | The script that rebuilds the maps from their public-domain originals. |

The reference viewer is the standard for how the globe looks and behaves. The implementer should run it as `README.md` describes before hooking the globe up, and an Implementation's globe should be indistinguishable from it at the same camera position and with the same controls set.

# Globe files in the Implementation repo

An Implementation cannot draw its globe from `lib/globe/` directly, because it must not read, import, extend, or execute any file outside its [Implementation repo](../mandatory/implementation-placement.md#glossary), under [Repository root of an Implementation](../mandatory/implementation-placement.md#repository-root-of-an-implementation). The implementer should therefore give the Implementation its own copy of the globe, in the same way as [Game data in an Implementation](../mandatory/implementation-placement.md#game-data-in-an-implementation):

1. **The maps.** The four files of `assets/` should be copied unchanged into the directory from which the [Game build](../../design/foundation/core-concepts.md#game-build-and-content) serves static files, e.g. `public/globe/` with Vite. They should not be resized or compressed again.
2. **The code.** `globe.js`, `globe-scene.js`, `globe.css`, and `globe.d.ts` should be copied unchanged into one directory of the user-interface source, e.g. `src/web/globe/`, and that directory should be left out of the Implementation's formatter and linter, which would otherwise rewrite or reject code written in the Spec repo's own style. The files are plain JavaScript modules that a bundler takes as they are, and `globe.d.ts` gives a TypeScript Implementation the types of `globe.js`, so neither a port nor type declarations of three.js are needed.
3. **three.js.** The Implementation should declare three.js as a dependency of its own, at the version `index.html` pins, so that the `three` import of `globe-scene.js` resolves to it in place of the content delivery network the viewer uses. A Game build that loads code from a third-party host stops working when that host does.

Copying the files unchanged keeps the globe's look, its controls, and its failure handling exactly those of the reference viewer, and lets a later comparison with the Spec repo show only real changes. The implementer should not copy `index.html`, `README.md`, or the script: the viewer's page is replaced by the Implementation's own user interface, and the maps are rebuilt only in the Spec repo.

A later change to `lib/globe/` reaches the Implementation through its [sync script](../mandatory/implementation-placement.md#keeping-the-copies-current), which copies again each file that changed.

# Full-quality maps

The maps in `assets/` are compressed, because a side-by-side comparison showed no visible difference from the same maps at full quality, which are about 14 MB together. The full-quality maps are not kept in the Spec repo, but they can be rebuilt whenever the compression is suspected of costing detail, e.g. on a much larger display.

`README.md` describes how to build them into `assets-full/` and how to compare the two sets in the reference viewer. An Implementation that is to show them should copy the four files of `assets-full/` in place of those of `assets/`, under [Globe files in the Implementation repo](#globe-files-in-the-implementation-repo), and pass their addresses to `mountGlobe` as `maps`. Nothing else depends on which set is used.

# Globe in the user interface

The globe is decoration, so it should never displace game information or reach into the game. The copied code already does everything the globe needs on its own, so the Implementation's part is one small component of its graphical user interface, the only code it writes for the globe:

- **Where the GUI puts it.** The component should be one element that fills the [Globe stage](../../design/ui/gui.md#glossary) of the [Campaign Screen](../../design/ui/screens/campaign-screen.md), and nowhere else; the globe centres itself in it. It is a backdrop: the [Side panel](../../design/ui/gui.md#glossary) and every [Detail view](../../design/ui/gui.md#glossary) should be drawn over it, and the [Campaign](../../design/foundation/core-concepts.md#campaign-and-session) screen is usable before it has loaded.
- **Mounted, shown, and removed.** When the element is created, the component should call `mountGlobe` with the element, `mapBase` set to the address of the copied maps relative to the Game build, e.g. `./globe/`, so that the globe also loads under [Paths under GitHub Pages](github-pages-deployment.md#paths-under-github-pages), and `background` set to the Globe stage's Background colour under [Visual Design](../../design/ui/visual-design.md). It should call `setVisible(false)` while a Detail view covers the Globe stage and `setVisible(true)` when it is closed, and `dispose()` when the element is removed. The user interface should load `globe.css` with its other styles.
- **Nothing from the game.** The component should import nothing from the engine, call no function of the engine API, and write nothing to [Game storage](../../design/foundation/engine-contract.md#persisted-data). What the globe shows, e.g. where the camera points or how its controls are set, is not part of a Campaign and is forgotten when the globe is removed.

`README.md` gives the component for a framework-free page and for React. Everything else is done by the copied code and should not be added to the component:

- **Its controls.** Three transparent buttons sit at the bottom left of the globe, above its imagery credit. The first stops and starts the rotation of the planet in view. The second shows the clouds in full, at half opacity, or not at all, in that order, starting in full. The third sets the speed of the day and night cycle: the default slow speed, twice it, four times it, or stopped, in that order. The day and night cycle moves the sun over the surface and goes on while the rotation is stopped. A Player whose system asks for reduced motion starts with both stopped.
- **Its frame.** The orbit by dragging, the zoom by the wheel only while the pointer is over the globe, a text alternative for the canvas, the imagery credit with the wording under Sources in `README.md`, and every message shown in the globe's place.
- **Its lifetime.** It sizes itself by its element and follows that element's size, and it releases the renderer, the textures, the geometries, the event listeners, and the animation frame request when it is disposed.

# Loading and running cost

The globe is far heavier than the rest of a Game build: its maps are about 5.3 MB to download and take a few hundred megabytes of graphics memory, and it redraws on every frame. The copied code keeps that cost to when the globe is seen:

- **Load on first show.** `globe.js` is small and imports no three.js. It loads `globe-scene.js`, and with it three.js and the maps, through a dynamic `import()` only when the globe is first visible, and shows a short message while they load. A bundler such as Vite emits that import as a separate file without any setting.
- **Draw only while visible.** It stops requesting animation frames while `setVisible(false)` is in force or the browser tab is in the background, and resumes when the globe is shown again.

The `sharpness` setting in `globe-scene.js` decides how many pixels are drawn for each pixel of the canvas. It should be lowered, in the Spec repo, only when the globe cannot hold the frame rate of the display, because lowering it is what makes the globe look blurred.

# Checking the globe

How the globe looks cannot be asserted through the engine API, so it is checked by looking at it beside the reference viewer. The implementer should run both, bring each to the same view with the same controls set, and compare the day side, the line between day and night, the city lights on the night side, the clouds, and the glow at the edge of the planet.

The implementer should also confirm in the browser's developer tools that the globe logs no error, that no map is requested before the globe is first shown, and that drawing stops while the globe is hidden.

Automated tests should not compare rendered pixels, which differ between graphics hardware. One test is suggested: that the Campaign screen stays usable where WebGL 2 is unavailable, with the globe's message shown in its place.

A browser that runs tests without a display usually draws the globe in software, slowly enough that the globe takes most of the time of the page, e.g. a test that lets the Autopilot play many Turns then runs many times longer. A browser test that is not about the globe should therefore take WebGL 2 away from its page, e.g. by making `getContext('webgl2')` return nothing before the page loads, which also exercises the case where WebGL 2 is unavailable.

# Edge cases and failure behavior

A failure of the globe should never cost the Player the game. The copied code treats each case below as follows, so the Implementation adds nothing for them; the list is exhaustive for the cases this guidance covers.

- **WebGL 2 is unavailable.** It shows a short message in the globe's place and nothing else changes; every other part of the graphical user interface keeps working.
- **A map fails to load.** It shows a short message in the globe's place, without retrying on its own. Showing the globe again, e.g. after closing a Detail view that covered it, is the retry.
- **The graphics context is lost.** A browser may drop the graphics context, e.g. after the computer sleeps. It creates the renderer again on a new canvas the next time the globe is shown, keeping the view and the controls.
- **A map is larger than the graphics hardware accepts.** It reduces such a map to the largest size the hardware accepts, so the globe is shown less sharp rather than not at all.
- **A newer three.js is wanted.** The shaders rely on what three.js adds around them, which changes between versions. After changing the version, in `index.html` and in the Implementation alike, the implementer should repeat the comparison under [Checking the globe](#checking-the-globe).
