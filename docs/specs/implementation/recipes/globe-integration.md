# Globe Integration

| Metadata    | Value                                                                                                                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Spec ID     | GLOBE                                                                                                                                                                                      |
| Family      | Recipes                                                                                                                                                                                    |
| Audience    | UI designer, Implementer                                                                                                                                                                   |
| Owns        | Guidance on carrying the reference globe of the Spec repo into an Implementation and showing it in its graphical user interface.                                                           |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Implementation Specification Conventions](../../governance/conventions/implementation-spec-conventions.md) |

# Overview

A rotating Earth gives the game a sense of place, but it cannot be rebuilt from a description: its look comes from
large maps derived from satellite imagery and from shaders tuned by eye. The Spec repo therefore keeps a working globe,
and hooking it up means carrying that globe into an Implementation, not writing one.

Everything about the hookup follows from treating the globe as a sealed decoration. It reads no game state and the
engine never learns of it, so it lives wholly in the user interface. It is also the heaviest thing a Game build ships,
so it costs the Player nothing until it is first shown.

The Graphical User Interface says what the Player needs to see, and the globe is decoration behind that: the
[Campaign Screen](../../design/ui/screens/campaign-screen.md) gives the globe most of the screen, but an Implementation
without a globe is still correct.

# Globe library

The `lib/globe/` directory of the [Spec repo](../mandatory/implementation-placement.md#glossary) holds a globe that already works, so that an implementer copies a known
result instead of approximating one. Its files are the following; the table is exhaustive.

| Path                              | Content                                                                              |
| --------------------------------- | ------------------------------------------------------------------------------------ |
| `README.md`                       | How to run the reference viewer, what each map holds, and where the imagery is from. |
| `index.html`                      | The page of the reference viewer, which pins the version of three.js it runs on.     |
| `globe.js`                        | The scene, the shaders, the orbit and zoom controls, and their tunable `SETTINGS`.   |
| `assets/`                         | The four maps the globe is drawn from, about 5.3 MB together.                        |
| `scripts/build-globe-textures.py` | The script that rebuilds the maps from their public-domain originals.                |

The reference viewer is the standard for how the globe looks. The implementer should run it as `README.md` describes
before changing anything, and an Implementation's globe should be indistinguishable from it at the same camera
position.

# Globe files in the Implementation repo

An Implementation cannot draw its globe from `lib/globe/` directly, because it must not read, import, extend, or
execute any file outside its [Implementation repo](../mandatory/implementation-placement.md#glossary), under
[Repository root of an Implementation](../mandatory/implementation-placement.md#repository-root-of-an-implementation).
The implementer should therefore give the Implementation its own copy of what the globe needs, in the same way as
[Game data in an Implementation](../mandatory/implementation-placement.md#game-data-in-an-implementation):

1. **The maps.** The four files of `assets/` should be copied unchanged into the directory from which the [Game build](../../design/foundation/core-concepts.md#game-build-and-content)
   serves static files, e.g. `public/globe/` with Vite. They should not be resized or compressed again, so that a later
   comparison with the Spec repo shows only real changes.
2. **The scene.** `globe.js` should be ported into the user-interface source of the Implementation as one module. The
   shaders and the `SETTINGS` values should be kept as they are, and only what the stack requires should change, e.g.
   type annotations for TypeScript. The reference viewer is a page that owns its globe until it closes, so the port
   should turn it into a function that draws on a canvas it is given and returns a way to pause the drawing and to
   release everything, under [Globe in the user interface](#globe-in-the-user-interface). The parts that only serve
   the viewer's page should be left out: the map-set switch and its `?maps=` address parameter, the rotation button,
   and the status and credit text. The rotation should still stop when the Player's system asks for reduced motion,
   as it does in the viewer.
3. **three.js.** The Implementation should declare three.js as a dependency of its own, at the version `index.html`
   pins, in place of the import from a content delivery network, together with its type declarations at the same
   version when the stack needs them, e.g. `@types/three` for TypeScript. A Game build that loads code from a
   third-party host stops working when that host does.

The implementer should not copy `index.html`, `README.md`, or the script: the page is replaced by the Implementation's
own user interface, and the maps are rebuilt only in the Spec repo.

The copied maps and the ported module implement Globe Integration, so they are what the
[Specification map](../mandatory/specification-tracking.md#specification-map) lists under it. A later change to
`lib/globe/` is outside `docs/specs` and `content`; when updating the Implementation under
[Finding what changed](specification-updates.md#finding-what-changed), the implementer should add `lib/globe` to the
paths of the difference and copy again each file that changed.

# Full-quality maps

The maps in `assets/` are compressed, because a side-by-side comparison showed no visible difference from the same
maps at full quality, which are about 14 MB together. The full-quality maps are not kept in the Spec repo, but they can
be rebuilt whenever the compression is suspected of costing detail, e.g. on a much larger display.

`README.md` describes how to build them into `assets-full/` and how to compare the two sets in the reference viewer.
An Implementation that is to show them should copy the four files of `assets-full/` in place of those of `assets/`,
under [Globe files in the Implementation repo](#globe-files-in-the-implementation-repo), and change the four map
addresses in the ported module to the new file names. Nothing else in the module depends on which set is used.

# Globe in the user interface

The globe is decoration, so it should never displace game information or reach into the game. The implementer should
wrap the ported module in one component of the graphical user interface that follows these suggestions:

- **Nothing from the game.** The component should import nothing from the engine, call no function of the engine API,
  and write nothing to [Game storage](../../design/foundation/engine-contract.md#persisted-data). What the globe shows, e.g. where the camera points, is not part of a Campaign and
  is forgotten when the globe is closed.
- **Where the GUI puts it.** The globe should be shown in the [Globe stage](../../design/ui/gui.md#glossary) of the
  [Campaign Screen](../../design/ui/screens/campaign-screen.md), centred in it, and nowhere else. It is a
  backdrop: it should never cover the [Side panel](../../design/ui/gui.md#glossary) or a [Detail view](../../design/ui/gui.md#glossary), and the [Campaign](../../design/foundation/core-concepts.md#campaign-and-session) screen should be usable before it has
  loaded.
- **Owned lifetime.** The component should create the renderer when it is first shown and release it when it is
  removed, including the textures, the geometries, the event listeners, and the animation frame request. The reference
  viewer never releases anything, because its page lives as long as its globe.
- **Sized by its container.** The reference viewer fills the browser window. The component should instead take the size
  of the element that holds it and follow that element when it changes size.
- **Framed by Visual Design.** The colours of the globe come from the maps. The panel around it, its heading, and any
  message shown in its place should follow [Visual Design](../../design/ui/visual-design.md). The space behind the
  planet should be the Globe stage's Background colour, set as the renderer's opaque clear colour in place of the
  viewer's own near-black. It should not be a transparent canvas over the page: the atmosphere shell is blended
  additively onto what is already drawn, so over a transparent canvas a dark ring shows where its glow should be.
- **Reachable without a pointer.** The canvas should carry a text alternative that says what it shows, and the rest of
  the screen should stay reachable by keyboard while the globe is in view. The wheel should zoom the globe only while
  the pointer is over it.

The imagery is in the public domain and needs no licence. The implementer should still credit it where the
Implementation credits its other sources, with the wording under Sources in `README.md`. An Implementation that has no
place for credits in its user interface can show the short credit of the reference viewer, e.g. "Imagery: NASA Blue
Marble and Earth at Night", in a corner of the Globe stage, hidden while a Detail view covers it.

# Loading and running cost

The globe is far heavier than the rest of a Game build: its maps are about 5.3 MB to download and take a few hundred
megabytes of graphics memory, and it redraws on every frame. A Player who never opens the globe should pay none of
that, and a Player who leaves it should stop paying:

- **Load on first show.** Three.js, the ported module, and the maps should be loaded only when the globe is first
  shown, e.g. through a dynamic `import()`, which Vite emits as a separate file. While they load, the component should
  show a short message in the globe's place.
- **Draw only while visible.** The component should stop requesting animation frames while the globe is not in view,
  e.g. while a Detail view covers the Globe stage or the browser tab is in the background, and resume when it is shown again.
- **Relative map addresses.** The addresses of the maps should be relative to the Game build, so that the globe also
  loads under [Paths under GitHub Pages](github-pages-deployment.md#paths-under-github-pages).

The `sharpness` setting decides how many pixels are drawn for each pixel of the canvas. The implementer should lower it
only when the globe cannot hold the frame rate of the display, because lowering it is what makes the globe look
blurred.

# Checking the globe

How the globe looks cannot be asserted through the engine API, so it is checked by looking at it beside the reference
viewer. The implementer should run both, bring each to the same view, and compare the day side, the line between day
and night, the city lights on the night side, the clouds, and the glow at the edge of the planet.

The implementer should also confirm in the browser's developer tools that the globe logs no error, that no map is
requested before the globe is first shown, and that drawing stops while the globe is hidden.

Automated tests should not compare rendered pixels, which differ between graphics hardware. One test is suggested: that
the component mounts and unmounts cleanly where WebGL is unavailable, as it is in a test environment without a browser.

A browser that runs tests without a display usually draws the globe in software, slowly enough that the globe takes
most of the time of the page, e.g. a test that lets the [Autopilot](../../design/foundation/engine-contract.md#autopilot) play many Turns then runs many times longer. A browser test
that is not about the globe should therefore take WebGL 2 away from its page, e.g. by making
`getContext('webgl2')` return nothing before the page loads, which also exercises the case where WebGL 2 is
unavailable.

# Edge cases and failure behavior

A failure of the globe should never cost the Player the game. The implementer should treat each case below as follows;
the list is exhaustive for the cases this guidance covers.

- **WebGL 2 is unavailable.** The component should show a short message in the globe's place and nothing else should
  change; every other part of the graphical user interface keeps working.
- **A map fails to load.** The component should show a short message in the globe's place, without retrying on its
  own. Showing the globe again, e.g. after closing a Detail view that covered it, is the retry.
- **The graphics context is lost.** A browser may drop the graphics context, e.g. after the computer sleeps. The
  component should create the renderer again the next time the globe is shown, on a new canvas element, because a
  canvas whose graphics context was lost cannot be drawn on again until the browser restores it.
- **A map is larger than the graphics hardware accepts.** The ported module already reduces such a map to the largest
  size the hardware accepts, so the globe is shown less sharp rather than not at all.
- **A newer three.js is wanted.** The shaders rely on what three.js adds around them, which changes between versions.
  After changing the version, the implementer should repeat the comparison under
  [Checking the globe](#checking-the-globe).
