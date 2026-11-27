# Globe Integration

| Metadata | Value |
| --- | --- |
| Spec ID | GLOBE |
| Family | Recipes |
| Audience | UI designer, Implementer |
| Owns | Guidance on carrying the reference globe of the Spec repo into an Implementation and showing it in its graphical user interface. |
| Conventions | [Specification Conventions](../../governance/conventions/spec-conventions.md), [Implementation Specification Conventions](../../governance/conventions/implementation-spec-conventions.md) |

# Overview

A rotating Earth gives the game a sense of place, but it cannot be rebuilt from a description: its look comes from large maps derived from satellite imagery and from shaders tuned by eye. The Spec repo therefore keeps a working globe, complete with its controls and its handling of failures, and the Implementation copies that globe unchanged rather than writing or porting one.

Everything about the hookup follows from treating the globe as a sealed decoration. It reads no game state and the engine never learns of it, so it lives wholly in the user interface. It is also the heaviest thing a Game build ships, so it costs the Player nothing until it is first shown. The [Campaign Screen](../../design/ui/screens/campaign-screen.md) gives the globe most of the screen, but an Implementation without a globe is still correct, and a failure of the globe should never cost the Player the game.

# Globe library

The `lib/globe/` directory of the [Spec repo](../mandatory/implementation-placement.md#glossary) holds the globe, its reference viewer `index.html`, and a `README.md` that says how to run the viewer, how to mount the globe, and where the imagery is from. The reference viewer is the standard for how the globe looks and behaves: an Implementation's globe should be indistinguishable from it at the same camera position and with the same controls set. A change to the globe's look or behaviour is made in `lib/globe/`, never in the Implementation's copy.

# Globe files in the Implementation repo

An Implementation cannot draw its globe from `lib/globe/` directly, because it must not reach outside its [Implementation repo](../mandatory/implementation-placement.md#repository-root-of-an-implementation). So the Implementation holds its own copy of the globe, kept current by its [sync script](../mandatory/implementation-placement.md#keeping-the-copies-current) like [its game data](../mandatory/implementation-placement.md#game-data-in-an-implementation):

- **The maps** are copied unchanged into the directory from which the [Game build](../../design/foundation/core-concepts.md#game-build-and-content) serves static files, and are not resized or compressed again.
- **The code** is copied unchanged into one directory of the user-interface source, which the Implementation's formatter and linter leave out, because they would otherwise rewrite or reject code written in the Spec repo's own style.
- **three.js** is a dependency of the Implementation's own, at the version `index.html` pins, rather than loaded from the content delivery network the viewer uses, because a Game build that loads code from a third-party host stops working when that host does.

Copying the files unchanged keeps the globe's look, its controls, and its failure handling exactly those of the reference viewer, and lets a later comparison with the Spec repo show only real changes. The viewer's page, `README.md`, and the scripts that serve the viewer and rebuild the maps are not copied.

# Full-quality maps

The maps in `lib/globe/assets/` are kept at full quality, about 14 MB together, rather than compressed to about 5.3 MB, so that the globe shows all the detail of its sources on any display. A smaller download is not worth that detail, because the globe loads its maps only when it is first visible and the screen is usable before then.

# Globe in the user interface

The globe is decoration, so it should never displace game information or reach into the game. The Implementation's part is one small component, the only code it writes for the globe:

- **Where the GUI puts it.** One element that fills the [Globe stage](../../design/ui/gui.md#glossary) of the Campaign Screen, and nowhere else. It is a backdrop: the [Side panel](../../design/ui/gui.md#glossary) and every [Detail view](../../design/ui/gui.md#glossary) are drawn over it, and the screen is usable before it has loaded.
- **Shown only when seen.** The component hides the globe while a Detail view covers the Globe stage or the Campaign Screen is left, e.g. for the Main menu, so that it stops drawing. It keeps the globe for the rest of the [Session](../../design/foundation/core-concepts.md#campaign-and-session) rather than disposing it with the Campaign Screen, because a new globe decodes its maps and loads them into graphics memory again, which takes seconds each time the Player comes back.
- **Nothing from the game.** The component imports nothing from the engine, calls no function of the engine API, and writes nothing to [Game storage](../../design/foundation/engine-contract.md#persisted-data). What the globe shows, e.g. where the camera points, is not part of a Campaign and is forgotten when the Session ends. The one thing the user interface sets on the globe is its devastation, through `setDevastation` and `setDevastationEffects`, as [Globe devastation](../../design/ui/screens/campaign-screen.md#globe-devastation) says: the Campaign Screen hands the component the level and the effects, so the component itself still reads nothing from the game.

# Loading and running cost

The globe's maps are about 14 MB to download and take a few hundred megabytes of graphics memory, and it redraws on every frame. The copied code therefore loads three.js and the maps only when the globe is first visible, and stops drawing while it is hidden or the browser tab is in the background.

The `sharpness` setting in `globe-scene.js` decides how many pixels are drawn for each pixel of the canvas. It should be lowered, in the Spec repo, only when the globe cannot hold the frame rate of the display, because lowering it is what makes the globe look blurred.

# Checking the globe

How the globe looks cannot be asserted through the engine API, so it is checked by looking at it beside the reference viewer: bring each to the same view with the same controls set, and compare the day side, the line between day and night, and the clouds. The browser's developer tools should also show that the globe logs no error, that no map is requested before the globe is first shown, and that drawing stops while the globe is hidden. This comparison is repeated after every change of the three.js version, in `index.html` and in the Implementation alike, because the shaders rely on what three.js adds around them.

Automated tests should not compare rendered pixels, which differ between graphics hardware. A browser that runs tests without a display draws the globe in software, slowly enough to slow every action of a test to seconds, so the browser tests run with WebGL turned off, and the globe shows its message in its place.
