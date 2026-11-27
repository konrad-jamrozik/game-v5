// The three.js scene of the globe: the Earth from four NASA-derived maps, a cloud shell, an atmosphere shell, and
// stars. `globe.js` loads this module only when the globe is first shown, so three.js is not downloaded before then.
// See README.md for what each map holds and how the scene is lit.
import * as THREE from 'three'

export const SETTINGS = {
  spinDegreesPerSecond: 3, // the planet's own turning in view, while rotation is on
  cycleDegreesPerSecond: 3, // the sun's travel over the surface at day and night speed 1×
  cloudDriftRadiansPerSecond: 0.004, // clouds relative to the ground at day and night speed 1×
  sharpness: 2, // minimum backing-store pixels per CSS pixel
  atmosphere: true,
  fieldOfViewDegrees: 30,
  startDistance: 4.6, // camera distance in planet radii at zoom 1
  minZoom: 0.6,
  maxZoom: 14,
  bump: 1.6, // strength of the relief shading
  exposure: 1.15,
  atmosphereRadius: 1.1,
  cloudOpacity: 0.95, // of the cloud shell when clouds are shown in full
}

// Earth's own axial tilt in view, in radians, for which the sun's place on the surface is set.
const EARTH_TILT = { x: 0.15, z: -0.41 }

// The planet starts with longitude 10° E facing the camera.
const EARTH_START_RADIANS = (-100 * Math.PI) / 180

// The view a new globe starts from; `globe.js` keeps it across scenes, so a scene created again keeps the view.
function initialView() {
  return {
    az: 0,
    el: 0.2,
    azVel: 0,
    elVel: 0,
    zoom: 1,
    zoomTarget: 1,
    earthRotation: EARTH_START_RADIANS,
    cloudRotation: 0,
    sunAngle: 0,
  }
}

const NOISE_GLSL = /* glsl */ `
float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 x) {
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1.0, 0.0, 0.0)), f.x), mix(hash(i + vec3(0.0, 1.0, 0.0)), hash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
             mix(mix(hash(i + vec3(0.0, 0.0, 1.0)), hash(i + vec3(1.0, 0.0, 1.0)), f.x), mix(hash(i + vec3(0.0, 1.0, 1.0)), hash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);
}
float fbm3(vec3 p) { float s = 0.0; float a = 0.5; for (int i = 0; i < 3; i++) { s += a * noise(p); p = p * 2.03 + vec3(11.3, 5.7, 3.1); a *= 0.5; } return s / 0.875; }
`

// Devastation, from 0, the planet as it is, to 1, wrecked. Each effect comes in over its own part of that range.
const DEVASTATION_GLSL = /* glsl */ `
uniform float uDev;
float stage(float from, float to) { return smoothstep(from, to, uDev); }
// 0 everywhere at amount 0 and 1 everywhere at amount 1; in between, where field, from 0 to 1, is highest, with an
// edge as wide as soft
float spread(float field, float amount, float soft) { float edge = 1.0 - amount * (1.0 + soft); return smoothstep(edge, edge + soft, field); }
// a colour of the clean sky, turned dirty orange by smoke and then red
vec3 foulSky(vec3 clean) {
  float l = max(max(clean.r, clean.g), clean.b);
  vec3 c = mix(clean, l * vec3(0.8, 0.5, 0.3), stage(0.0, 0.5));
  return mix(c, l * vec3(0.85, 0.24, 0.1), stage(0.45, 1.0));
}
`

// Shared by the surface, the cloud shell, and the atmosphere shell.
const VERTEX = /* glsl */ `
varying vec2 vUv;
varying vec3 vN;
varying vec3 vT;
varying vec3 vPosW;
varying vec3 vObj;
void main() {
  vUv = uv;
  vObj = position;
  vec4 w = modelMatrix * vec4(position, 1.0);
  vPosW = w.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  // tangent towards east; the bitangent N x T then points north, matching the normal map
  vec3 t = cross(vec3(0.0, 1.0, 0.0), normal);
  t = length(t) < 0.0001 ? vec3(1.0, 0.0, 0.0) : normalize(t);
  vT = normalize(mat3(modelMatrix) * t);
  gl_Position = projectionMatrix * viewMatrix * w;
}
`

const EARTH_FRAGMENT = /* glsl */ `
uniform sampler2D tDay;
uniform sampler2D tNight;
uniform sampler2D tNrm;
uniform sampler2D tClouds;
uniform vec3 uSun;
uniform float uCloudShift;
uniform float uCloudsOn;
uniform float uBump;
uniform float uExposure;
uniform float uAtmo;
uniform float uTime;
varying vec2 vUv;
varying vec3 vN;
varying vec3 vT;
varying vec3 vPosW;
varying vec3 vObj;
${NOISE_GLSL}
${DEVASTATION_GLSL}
void main() {
  // the maps are uploaded unflipped, so row 0 is north
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
  vec3 N = normalize(vN);
  vec3 T = normalize(vT - N * dot(vT, N));
  vec3 B = cross(N, T);
  vec3 nm = texture2D(tNrm, uv).rgb;
  float water = nm.b;
  vec2 nxy = (nm.rg * 2.0 - 1.0) * uBump * (1.0 - water);
  vec3 Nb = normalize(N + T * nxy.x + B * nxy.y);
  vec3 V = normalize(cameraPosition - vPosW);
  vec3 L = normalize(uSun);
  float ndl = dot(N, L);
  float day = smoothstep(-0.1, 0.25, ndl);
  float relief = clamp(dot(Nb, L) - ndl, -0.6, 0.6);
  float diff = max(max(ndl, 0.0) + relief * day * 1.2, 0.0);
  vec3 albedo = pow(texture2D(tDay, uv).rgb, vec3(2.2));
  float lights = pow(texture2D(tNight, uv).r, 1.6);
  float nightK = 1.0 - smoothstep(-0.18, 0.06, ndl);
  // what devastation changes; at 0 every value below is the clean planet's
  vec3 sunCol = vec3(1.0, 0.96, 0.9) * 3.0;
  vec3 seaLift = vec3(0.004, 0.02, 0.05);
  vec3 lightCol = vec3(1.0, 0.72, 0.38);
  vec3 dayScatter = vec3(0.3, 0.55, 1.0);
  vec3 duskScatter = vec3(1.0, 0.45, 0.2);
  vec3 skyAmbient = vec3(0.3, 0.45, 0.8);
  vec3 skyMirror = vec3(0.25, 0.45, 0.8);
  vec3 nightAmbient = vec3(0.4, 0.5, 0.8);
  vec3 fireGlow = vec3(0.0);
  float rimGain = 0.9;
  float rimLitFloor = 0.0;
  if (uDev > 0.0) {
    vec3 P = normalize(vObj);
    float land = 1.0 - water;
    float haze = stage(0.0, 0.5);
    float burn = stage(0.3, 0.9);
    // how built-up the place is: the city lights, blurred over a town and over a region
    float urban = smoothstep(0.02, 0.22, texture2D(tNight, uv, 4.0).r);
    float region = smoothstep(0.01, 0.2, texture2D(tNight, uv, 6.0).r);
    float lum = dot(albedo, vec3(0.2126, 0.7152, 0.0722));
    // land dries to brown, spreading from patch to patch, and greys to ash
    float broad = smoothstep(0.25, 0.75, fbm3(P * 5.0));
    vec3 dry = lum * mix(vec3(1.5, 0.95, 0.5), vec3(0.85, 0.74, 0.64), stage(0.6, 1.0) * 0.7);
    albedo = mix(albedo, dry, spread(broad, stage(0.1, 0.7), 0.3) * land * 0.9);
    // scorched ground, around the cities first
    float patches = smoothstep(0.25, 0.75, fbm3(P * 11.0 + 4.0));
    float charred = spread(patches * 0.7 + region * 0.3, stage(0.35, 1.0) * 0.8, 0.5) * land;
    albedo *= mix(1.0, 0.1, charred);
    // murky sea under a dimmer, redder sun
    albedo = mix(albedo, lum * vec3(0.9, 0.75, 0.4), stage(0.15, 0.75) * water * 0.8);
    seaLift = mix(seaLift, vec3(0.026, 0.018, 0.006), stage(0.15, 0.75));
    sunCol *= mix(vec3(1.0), vec3(0.8, 0.6, 0.46), haze);
    dayScatter = foulSky(dayScatter);
    skyAmbient = foulSky(skyAmbient);
    skyMirror = foulSky(skyMirror);
    nightAmbient = foulSky(nightAmbient);
    duskScatter = mix(duskScatter, vec3(1.0, 0.2, 0.06), stage(0.2, 1.0));
    rimGain *= 1.0 + 0.5 * haze;
    rimLitFloor = 0.22 * stage(0.5, 1.0);
    // city lights go out district by district, and those left redden
    float district = smoothstep(0.25, 0.75, fbm3(P * 16.0 + 9.0));
    lights *= 1.0 - 0.93 * spread(district, stage(0.3, 0.9), 0.25);
    lightCol = mix(lightCol, vec3(1.0, 0.42, 0.16), burn);
    // fires: embers where people live, then wildfires on the scorched land
    float seeds = noise(P * 130.0) * 0.65 + noise(P * 380.0) * 0.35;
    float presence = max(urban, 0.5 * stage(0.6, 1.0) * patches) * land;
    float edge = 1.0 - 0.43 * burn * presence;
    float fire = smoothstep(edge, edge + 0.1, seeds) * step(0.001, burn * presence);
    float flicker = 0.55 + 0.9 * noise(P * 90.0 + uTime * vec3(0.9, 1.3, 0.7));
    vec3 fireCol = mix(vec3(1.0, 0.16, 0.02), vec3(1.0, 0.5, 0.12), smoothstep(edge + 0.06, edge + 0.24, seeds));
    fireGlow = fireCol * fire * flicker * (0.6 + 1.0 * nightK);
    // and the red glow they throw on the smoke over a burning region
    fireGlow += vec3(1.0, 0.15, 0.03) * region * burn * 0.11 * nightK * land;
  }
  vec2 cuv = vec2(uv.x + uCloudShift, uv.y);
  vec2 sdir = vec2(dot(L, T), -dot(L, B));
  float cShadow = texture2D(tClouds, cuv + sdir * 0.003).r * uCloudsOn;
  float cTop = texture2D(tClouds, cuv).r * uCloudsOn;
  vec3 col = albedo * sunCol * diff * (1.0 - 0.6 * cShadow);
  col += albedo * skyAmbient * 0.12 * day;
  // water: base lift, sun glint, sky reflection towards the limb
  col += seaLift * water * diff * 1.5;
  vec3 H = normalize(L + V);
  float nh = max(dot(N, H), 0.0);
  float spec = pow(nh, 220.0) * 6.0 + pow(nh, 28.0) * 0.35;
  col += vec3(1.0, 0.93, 0.8) * spec * water * (1.0 - cShadow) * (1.0 - cTop * 0.8) * day;
  float fres = pow(1.0 - max(dot(N, V), 0.0), 5.0);
  col += skyMirror * fres * water * max(ndl, 0.0) * 0.8;
  // night side: city lights, dimmed under cloud, and a faint surface
  col += lightCol * lights * 1.6 * nightK * (1.0 - 0.75 * cTop);
  col += albedo * nightAmbient * 0.012;
  col += fireGlow * (1.0 - 0.6 * cTop);
  // atmosphere seen against the surface
  float rim = pow(1.0 - max(dot(N, V), 0.0), 2.6);
  float lit = max(smoothstep(-0.2, 0.5, ndl), rimLitFloor);
  vec3 scatter = mix(duskScatter, dayScatter, smoothstep(-0.1, 0.35, ndl));
  col += scatter * rim * lit * rimGain * uAtmo;
  float term = 1.0 - smoothstep(0.0, 0.28, abs(ndl - 0.05));
  col *= mix(vec3(1.0), vec3(1.25, 0.8, 0.55), term * 0.6);
  col = vec3(1.0) - exp(-col * uExposure);
  gl_FragColor = vec4(pow(col, vec3(1.0 / 2.2)), 1.0);
}
`

const CLOUD_FRAGMENT = /* glsl */ `
uniform sampler2D tClouds;
uniform vec3 uSun;
uniform float uExposure;
uniform float uOpacity;
uniform sampler2D tNight;
uniform float uCloudShift;
uniform float uTime;
varying vec2 vUv;
varying vec3 vN;
varying vec3 vObj;
${NOISE_GLSL}
${DEVASTATION_GLSL}
void main() {
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
  vec3 P = normalize(vObj);
  float c = texture2D(tClouds, uv).r;
  vec3 tone = vec3(0.92);
  vec3 dark = vec3(0.012, 0.016, 0.026);
  vec3 underglow = vec3(0.0);
  if (uDev > 0.0) {
    // the clouds grey to smoke, and banks of smoke fill the gaps between them
    float banks = smoothstep(0.3, 0.8, fbm3(P * 4.0 + 2.0)) * (0.6 + 0.4 * fbm3(P * 22.0 + uTime * 0.015));
    float pall = banks * stage(0.05, 0.7) * 0.42;
    // plumes stand over the burning regions of the ground, which the cloud shell drifts across
    vec2 ground = vec2(uv.x - uCloudShift, uv.y);
    float region = smoothstep(0.01, 0.2, texture2D(tNight, ground, 6.0).r);
    float plume = region * stage(0.45, 1.0) * (0.35 + 0.65 * fbm3(P * 30.0 + uTime * 0.03)) * 0.75;
    float smoke = max(pall, plume);
    tone = mix(tone, vec3(0.3, 0.24, 0.19), stage(0.0, 0.6));
    tone = mix(tone, vec3(0.07, 0.055, 0.045), clamp(plume * 1.6 - c, 0.0, 1.0));
    c = max(c, smoke);
    dark = mix(dark, vec3(0.011, 0.006, 0.004), stage(0.2, 0.8));
    underglow = vec3(0.9, 0.13, 0.03) * region * stage(0.3, 0.9) * 0.14;
  }
  // the cloud map is the lowest-resolution layer, so break its edges up with fine noise
  float n = fbm3(P * 120.0);
  float a = smoothstep(0.06, 0.8, c * (0.75 + 0.6 * n));
  float ndl = dot(normalize(vN), normalize(uSun));
  float lit = smoothstep(-0.15, 0.35, ndl);
  vec3 sunCol = mix(vec3(1.0, 0.5, 0.25), vec3(1.0, 0.97, 0.93), smoothstep(-0.05, 0.3, ndl)) * 3.2;
  vec3 col = tone * sunCol * (max(ndl, 0.0) * 0.85 + 0.15) * lit + dark + underglow * (1.0 - lit);
  col = vec3(1.0) - exp(-col * uExposure);
  gl_FragColor = vec4(pow(col, vec3(1.0 / 2.2)), a * uOpacity);
}
`

const ATMOSPHERE_FRAGMENT = /* glsl */ `
uniform vec3 uSun;
uniform float uRa;
uniform float uStrength;
varying vec3 vN;
varying vec3 vPosW;
${DEVASTATION_GLSL}
void main() {
  vec3 N = normalize(vN);
  vec3 V = normalize(cameraPosition - vPosW);
  // |N.V| on the far side of the shell: 0 at its outer edge, m where the view ray grazes the planet
  float m = sqrt(1.0 - 1.0 / (uRa * uRa));
  float x = clamp(abs(dot(N, V)) / m, 0.0, 1.0);
  float glow = pow(x, 3.0);
  float ndl = dot(N, normalize(uSun));
  // devastation fouls the sky, thickens the glow, and at its worst leaves a red glow on the night side too
  float lit = max(smoothstep(-0.35, 0.45, ndl), 0.3 * stage(0.5, 1.0));
  vec3 dusk = mix(vec3(1.0, 0.45, 0.18), vec3(1.0, 0.18, 0.05), stage(0.2, 1.0));
  vec3 c = mix(dusk, foulSky(vec3(0.32, 0.58, 1.0)), smoothstep(-0.15, 0.3, ndl));
  gl_FragColor = vec4(c * glow * lit * uStrength * (1.0 + 0.5 * stage(0.0, 0.6)), 1.0);
}
`

// A failure to start, with a reason that `globe.js` turns into a message.
export class GlobeUnavailable extends Error {
  constructor(reason, message) {
    super(message)
    this.reason = reason // 'webgl' or 'maps'
  }
}

async function loadBitmap(url, maxSize) {
  const res = await fetch(url)
  if (!res.ok) throw new GlobeUnavailable('maps', `could not load ${url} (status ${res.status})`)
  const blob = await res.blob()
  let bmp = await createImageBitmap(blob)
  // a map larger than the graphics hardware accepts is reduced to the largest size it accepts
  if (bmp.width > maxSize) {
    const h = Math.round((bmp.height * maxSize) / bmp.width)
    bmp.close()
    bmp = await createImageBitmap(blob, { resizeWidth: maxSize, resizeHeight: h, resizeQuality: 'high' })
  }
  return bmp
}

function makeTexture(renderer, bmp, oneChannel) {
  const tex = new THREE.Texture(bmp)
  tex.flipY = false
  if (oneChannel) tex.format = THREE.RedFormat
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  tex.minFilter = THREE.LinearMipmapLinearFilter
  tex.magFilter = THREE.LinearFilter
  tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())
  tex.needsUpdate = true
  return tex
}

async function loadMaps(renderer, maps) {
  const maxSize = renderer.capabilities.maxTextureSize
  const loaded = await Promise.allSettled([
    loadBitmap(maps.day, maxSize),
    loadBitmap(maps.night, maxSize),
    loadBitmap(maps.normalWater, maxSize),
    loadBitmap(maps.clouds, maxSize),
  ])
  const failed = loaded.find((one) => one.status === 'rejected')
  if (failed) {
    for (const one of loaded) if (one.status === 'fulfilled') one.value.close()
    const error = failed.reason
    throw error instanceof GlobeUnavailable ? error : new GlobeUnavailable('maps', String(error))
  }
  const [day, night, normalWater, clouds] = loaded.map((one) => one.value)
  return {
    tDay: makeTexture(renderer, day, false),
    tNight: makeTexture(renderer, night, true),
    tNrm: makeTexture(renderer, normalWater, false),
    tClouds: makeTexture(renderer, clouds, true),
  }
}

function makeStars() {
  // on a far sphere, so they shift as the camera orbits
  let seed = 424243
  const rnd = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  const count = 2600
  const pos = new Float32Array(count * 3)
  const col = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const z = rnd() * 2 - 1
    const a = rnd() * Math.PI * 2
    const r = Math.sqrt(1 - z * z)
    pos.set([80 * r * Math.cos(a), 80 * z, 80 * r * Math.sin(a)], i * 3)
    const b = 0.15 + 0.85 * rnd() ** 3
    col.set([b * (0.85 + 0.15 * rnd()), b * 0.92, b * (0.85 + 0.15 * rnd())], i * 3)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
  return new THREE.Points(geo, new THREE.PointsMaterial({ size: 2, sizeAttenuation: false, vertexColors: true }))
}

// Draws the globe on `canvas`, which takes its size from its CSS box, over the opaque CSS colour `background`.
// `controls` is read on every frame: { rotating: boolean, clouds: 1 | 0.5 | 0, cycleSpeed: number, cyclePaused: boolean,
// tilt: { x: number, z: number }, devastation: number }, the tilt leaning the planet's axis in view, in radians, and
// the devastation running from 0, the planet as it is, to 1, wrecked.
// `view` holds the camera's orbit and zoom, so that a scene created again, e.g. after a lost graphics context,
// shows the same view. `onContextLost` is called when the browser drops the graphics context; the scene must then
// be disposed. Rejects with GlobeUnavailable, after releasing what it created.
export async function createScene({ canvas, maps, background, controls, view, onContextLost }) {
  if (view.earthRotation === undefined) Object.assign(view, initialView())
  const context = canvas.getContext('webgl2', { antialias: true, powerPreference: 'high-performance', alpha: false })
  if (!context) throw new GlobeUnavailable('webgl', 'WebGL 2 is unavailable')
  const renderer = new THREE.WebGLRenderer({ canvas, context })
  renderer.setPixelRatio(1)
  // opaque, because the atmosphere shell is blended additively onto what is behind it
  renderer.setClearColor(new THREE.Color(background), 1)

  let textures
  try {
    textures = await loadMaps(renderer, maps)
  } catch (error) {
    renderer.dispose()
    throw error
  }

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(SETTINGS.fieldOfViewDegrees, 1, 0.01, 200)

  // The planet on its axis, leaning as `controls.tilt` sets; the sun is placed for Earth's own tilt below.
  const tilt = new THREE.Group()
  tilt.rotation.z = EARTH_TILT.z
  tilt.rotation.x = EARTH_TILT.x
  scene.add(tilt)

  // The sun in world space, as the shaders read it. It starts where the original viewer fixed it; the day and night
  // cycle then moves it around the planet's axis, independently of whether the planet turns in view.
  const sun = new THREE.Vector3(1, 0.18, 0.35).normalize()

  const earthMat = new THREE.ShaderMaterial({
    uniforms: {
      tDay: { value: textures.tDay },
      tNight: { value: textures.tNight },
      tNrm: { value: textures.tNrm },
      tClouds: { value: textures.tClouds },
      uSun: { value: sun },
      uCloudShift: { value: 0 },
      uCloudsOn: { value: 1 },
      uBump: { value: SETTINGS.bump },
      uExposure: { value: SETTINGS.exposure },
      uAtmo: { value: SETTINGS.atmosphere ? 1 : 0 },
      uDev: { value: 0 },
      uTime: { value: 0 },
    },
    vertexShader: VERTEX,
    fragmentShader: EARTH_FRAGMENT,
  })
  const earth = new THREE.Mesh(new THREE.SphereGeometry(1, 192, 96), earthMat)
  earth.rotation.y = view.earthRotation
  tilt.add(earth)

  const cloudMat = new THREE.ShaderMaterial({
    uniforms: {
      tClouds: { value: textures.tClouds },
      uSun: { value: sun },
      uExposure: { value: SETTINGS.exposure },
      uOpacity: { value: SETTINGS.cloudOpacity },
      tNight: { value: textures.tNight },
      uCloudShift: { value: 0 },
      uDev: { value: 0 },
      uTime: { value: 0 },
    },
    vertexShader: VERTEX,
    fragmentShader: CLOUD_FRAGMENT,
    transparent: true,
    depthWrite: false,
  })
  const cloudMesh = new THREE.Mesh(new THREE.SphereGeometry(1.008, 160, 80), cloudMat)
  cloudMesh.renderOrder = 1
  cloudMesh.rotation.y = view.cloudRotation
  earth.add(cloudMesh)

  const atmosphereMat = new THREE.ShaderMaterial({
    uniforms: {
      uSun: { value: sun },
      uRa: { value: SETTINGS.atmosphereRadius },
      uStrength: { value: 0.95 },
      uDev: { value: 0 },
    },
    vertexShader: VERTEX,
    fragmentShader: ATMOSPHERE_FRAGMENT,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(SETTINGS.atmosphereRadius, 128, 64), atmosphereMat)
  atmosphere.renderOrder = 2
  atmosphere.visible = SETTINGS.atmosphere
  scene.add(atmosphere)

  const stars = makeStars()
  scene.add(stars)

  // The sun in the planet's own frame when the planet is at its start, so that the cycle can turn it about the
  // planet's axis.
  earth.rotation.y = EARTH_START_RADIANS
  tilt.updateMatrixWorld(true)
  const earthQuaternion = new THREE.Quaternion()
  const startSunLocal = new THREE.Vector3(1, 0.18, 0.35)
    .normalize()
    .applyQuaternion(earth.getWorldQuaternion(earthQuaternion).invert())
  earth.rotation.y = view.earthRotation
  const axis = new THREE.Vector3(0, 1, 0)
  // The sun stays where it is on the surface when the tilt changes, so another tilt turns the lit side with the planet.
  const applyTilt = () => {
    tilt.rotation.z = controls.tilt?.z ?? EARTH_TILT.z
    tilt.rotation.x = controls.tilt?.x ?? EARTH_TILT.x
  }
  applyTilt()

  // Orbit and zoom.
  const clampEl = (v) => Math.max(-1.45, Math.min(1.45, v))
  const distance = () => 1 + (SETTINGS.startDistance - 1) / view.zoom
  // radians of orbit per CSS pixel, so the surface under the pointer follows it
  const dragScale = () => {
    const focal = canvas.clientHeight / 2 / Math.tan((SETTINGS.fieldOfViewDegrees * Math.PI) / 360)
    return (1.3 * (distance() - 1)) / focal
  }
  let drag = null
  const onPointerDown = (e) => {
    canvas.setPointerCapture(e.pointerId)
    drag = { x: e.clientX, y: e.clientY, t: performance.now() }
    view.azVel = 0
    view.elVel = 0
    canvas.classList.add('dragging')
  }
  const onPointerMove = (e) => {
    if (!drag) return
    const now = performance.now()
    const k = dragScale()
    const da = -(e.clientX - drag.x) * k
    const de = (e.clientY - drag.y) * k
    const dt = Math.max(0.008, (now - drag.t) / 1000)
    view.az += da
    view.el = clampEl(view.el + de)
    view.azVel = Math.max(-6, Math.min(6, da / dt))
    view.elVel = Math.max(-6, Math.min(6, de / dt))
    drag = { x: e.clientX, y: e.clientY, t: now }
  }
  const endDrag = () => {
    if (!drag) return
    if (performance.now() - drag.t > 120) {
      view.azVel = 0
      view.elVel = 0
    }
    drag = null
    canvas.classList.remove('dragging')
  }
  // the wheel zooms only while the pointer is over the globe
  const onWheel = (e) => {
    e.preventDefault()
    const target = view.zoomTarget * Math.exp(-e.deltaY * 0.0015)
    view.zoomTarget = Math.max(SETTINGS.minZoom, Math.min(SETTINGS.maxZoom, target))
  }
  let frame = null
  const stopFrames = () => {
    if (frame !== null) cancelAnimationFrame(frame)
    frame = null
  }
  const onLost = (e) => {
    e.preventDefault()
    stopFrames()
    onContextLost()
  }
  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerup', endDrag)
  canvas.addEventListener('pointercancel', endDrag)
  canvas.addEventListener('wheel', onWheel, { passive: false })
  canvas.addEventListener('webglcontextlost', onLost)

  let backingWidth = 0
  let backingHeight = 0
  const resize = () => {
    if (canvas.clientWidth === 0 || canvas.clientHeight === 0) return
    const k = Math.max(SETTINGS.sharpness, window.devicePixelRatio || 1)
    const w = Math.min(4096, Math.round(canvas.clientWidth * k))
    const h = Math.round((w * canvas.clientHeight) / canvas.clientWidth)
    if (w === backingWidth && h === backingHeight) return
    backingWidth = w
    backingHeight = h
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    stars.material.size = (1.1 * w) / canvas.clientWidth
  }

  // The devastation drawn, which follows `controls.devastation` over about a second, and the clock of the fires and
  // the smoke, which stands still for a Player who asks for reduced motion.
  const askedDevastation = () => Math.max(0, Math.min(1, controls.devastation ?? 0))
  let devastation = askedDevastation()
  let effectsTime = 0
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches

  let last = 0
  const deg = Math.PI / 180
  const tick = (t) => {
    frame = requestAnimationFrame(tick)
    const dt = last ? Math.min(0.05, (t - last) / 1000) : 0
    last = t
    view.zoom += (view.zoomTarget - view.zoom) * (1 - Math.exp(-dt * 10))
    if (!drag) {
      const k = Math.exp(-dt * 2.2)
      view.azVel *= k
      view.elVel *= k
      view.az += view.azVel * dt
      view.el = clampEl(view.el + view.elVel * dt)
    }
    // Rotation turns the planet in view; the day and night cycle moves the sun over its surface. At speed 1× with
    // rotation on, the two cancel in world space, so the sun stands still as in the original viewer.
    if (controls.rotating) view.earthRotation += dt * SETTINGS.spinDegreesPerSecond * deg
    const cycleSpeed = controls.cyclePaused ? 0 : controls.cycleSpeed
    view.sunAngle -= dt * SETTINGS.cycleDegreesPerSecond * deg * cycleSpeed
    view.cloudRotation += dt * SETTINGS.cloudDriftRadiansPerSecond * cycleSpeed
    applyTilt()
    earth.rotation.y = view.earthRotation
    cloudMesh.rotation.y = view.cloudRotation
    tilt.updateMatrixWorld(true)
    sun
      .copy(startSunLocal)
      .applyAxisAngle(axis, view.sunAngle)
      .applyQuaternion(earth.getWorldQuaternion(earthQuaternion))
    // clouds: in full, at half opacity, or off
    cloudMesh.visible = controls.clouds > 0
    cloudMat.uniforms.uOpacity.value = SETTINGS.cloudOpacity * controls.clouds
    earthMat.uniforms.uCloudsOn.value = controls.clouds
    const asked = askedDevastation()
    devastation += (asked - devastation) * (1 - Math.exp(-dt * 5))
    if (Math.abs(asked - devastation) < 0.001) devastation = asked
    if (!still) effectsTime += dt
    for (const material of [earthMat, cloudMat, atmosphereMat]) material.uniforms.uDev.value = devastation
    earthMat.uniforms.uTime.value = effectsTime
    cloudMat.uniforms.uTime.value = effectsTime
    resize()
    const d = distance()
    const ce = Math.cos(view.el)
    camera.position.set(d * Math.sin(view.az) * ce, d * Math.sin(view.el), d * Math.cos(view.az) * ce)
    camera.lookAt(0, 0, 0)
    // rotating the cloud shell by a moves its features by a / 2π in u; the shadow lookup undoes that
    earthMat.uniforms.uCloudShift.value = -cloudMesh.rotation.y / (Math.PI * 2)
    cloudMat.uniforms.uCloudShift.value = earthMat.uniforms.uCloudShift.value
    renderer.render(scene, camera)
  }

  let disposed = false
  return {
    setRunning(running) {
      if (disposed || running === (frame !== null)) return
      if (running) {
        last = 0 // resume without a jump for the time it was paused
        frame = requestAnimationFrame(tick)
      } else {
        stopFrames()
      }
    },
    dispose() {
      if (disposed) return
      disposed = true
      stopFrames()
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', endDrag)
      canvas.removeEventListener('pointercancel', endDrag)
      canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('webglcontextlost', onLost)
      for (const mesh of [earth, cloudMesh, atmosphere, stars]) {
        mesh.geometry.dispose()
        mesh.material.dispose()
      }
      for (const tex of Object.values(textures)) {
        tex.image.close()
        tex.dispose()
      }
      renderer.dispose()
    },
  }
}
