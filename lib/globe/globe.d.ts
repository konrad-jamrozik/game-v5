// Types of `globe.js`, so that a TypeScript Implementation can import the copied file as it is.

export interface GlobeMaps {
  /** Surface colour. */
  readonly day: string
  /** City lights. */
  readonly night: string
  /** Relief normals and the water mask. */
  readonly normalWater: string
  /** Cloud cover. */
  readonly clouds: string
}

export interface GlobeOptions {
  /** The address of the directory that holds the four maps, relative to the page, e.g. './globe/'. Default './assets/'. */
  readonly mapBase?: string
  /** Addresses of single maps, in place of `mapBase`. */
  readonly maps?: Partial<GlobeMaps>
  /** The opaque CSS colour behind the planet. Default '#050506'. */
  readonly background?: string
  /** An object in which the globe keeps its camera and control settings, to carry them over to a new globe. */
  readonly memory?: object
  /** The tilt to start with; it wins over the tilt in `memory`. Default 'Level'. */
  readonly tilt?: GlobeTilt
  /** Called with the new tilt each time the Tilt button is pressed, e.g. to keep it. */
  readonly onTiltChange?: (tilt: GlobeTilt) => void
}

/** How far the planet's axis leans in view: upright, a little, or as far as Earth's own tilt. */
export type GlobeTilt = 'Level' | 'Mild' | 'Earth'

export interface GlobeHandle {
  /** False while something covers the globe, e.g. a panel opened over it; it then stops drawing. */
  setVisible(visible: boolean): void
  /** Leans the axis as the Tilt button would, e.g. after a kept tilt was reset, without calling `onTiltChange`. */
  setTilt(tilt: GlobeTilt): void
  /** Releases everything the globe created and removes it from its container. */
  dispose(): void
}

/** Fills `container`, which sets the globe's size, with the globe, its controls, its imagery credit, and its messages. */
export function mountGlobe(container: HTMLElement, options?: GlobeOptions): GlobeHandle
