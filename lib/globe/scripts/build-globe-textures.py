"""Build the Earth texture sets in lib/globe/assets and lib/globe/assets-small from NASA's public-domain maps.

Usage, from the repository root:

    python lib/globe/scripts/build-globe-textures.py [cache-dir]

Requires Python 3 with Pillow and NumPy. The source maps are downloaded into cache-dir
(default: .globe-texture-cache in the system temp directory) and reused on later runs.

Outputs, all equirectangular with north at the top and longitude -180 at the left edge:

    earth-day.jpg            8192x4096  surface colour
    earth-night-lights.jpg   8192x4096  one channel: city lights only
    earth-normal-water.webp  4096x2048  R,G = tangent-space normal x (east), y (north); B = water mask
    earth-clouds.jpg         4096x2048  one channel: cloud cover

lib/globe/assets-small holds the same four maps encoded smaller, about 5.3 MB against 14 MB:

    earth-day.webp           8192x4096  lossy WebP
    earth-night-lights.webp  8192x4096  lossy WebP
    earth-normal-water.jpg   4096x2048  JPEG at full colour resolution instead of lossless
    earth-clouds.webp        2048x1024  lossy WebP at the source size, not upscaled

Sources (NASA Earth Observatory, public domain):

    day     Blue Marble Next Generation with topography and bathymetry, August 2004
    night   Earth at Night 2012 (Suomi NPP VIIRS day/night band)
    elev    GEBCO_08 elevation, as distributed with Blue Marble Next Generation
    clouds  Blue Marble 2002 cloud layer; 2048x1024 is the largest size NASA still serves
"""

import os
import sys
import tempfile
import urllib.request

import numpy as np
from PIL import Image, ImageFilter

Image.MAX_IMAGE_PIXELS = None

ASSETS = "https://assets.science.nasa.gov/content/dam/science/esd/eo"
SOURCES = {
    "day.jpg": ASSETS + "/images/bmng/bmng-topography-bathymetry/august/world.topo.bathy.200408.3x21600x10800.jpg",
    "night.jpg": ASSETS + "/images/imagerecords/79000/79765/dnb_land_ocean_ice.2012.13500x6750.jpg",
    "elev.jpg": ASSETS + "/images/bmng/topography/gebco_08_rev_elev_5400x2700.jpg",
    "clouds2k.jpg": ASSETS + "/content-feature/bluemarble/images/cloud_combined_2048.jpg",
}

out = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets")
src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(tempfile.gettempdir(), ".globe-texture-cache")
small = os.path.join(os.path.dirname(out), "assets-small")
os.makedirs(out, exist_ok=True)
os.makedirs(small, exist_ok=True)
os.makedirs(src, exist_ok=True)

for name, url in SOURCES.items():
    path = os.path.join(src, name)
    if not os.path.exists(path):
        print("downloading", name)
        request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(request, timeout=600) as response, open(path, "wb") as file:
            file.write(response.read())

# Day colour: 21600x10800 -> 8192x4096.
day = Image.open(os.path.join(src, "day.jpg"))
day.draft("RGB", (10800, 5400))
day = day.convert("RGB").resize((8192, 4096), Image.LANCZOS)
day.save(os.path.join(out, "earth-day.jpg"), quality=90, subsampling=0, optimize=True)
day.save(os.path.join(small, "earth-day.webp"), quality=82, method=6)

# Water mask from the day map: water is where blue clearly dominates. Taking it from the
# day map keeps the glint exactly on what the Player sees as water, lakes included.
d4 = np.asarray(day.resize((4096, 2048), Image.LANCZOS), dtype=np.float32)
r, g, b = d4[..., 0], d4[..., 1], d4[..., 2]
ratio = (b - np.maximum(r, g)) / (b + 1.0)
water = np.clip((ratio - 0.12) / 0.2, 0, 1) * (b > 12)
water_img = Image.fromarray((water * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7))

# Normal map from elevation. Slopes are exaggerated by k; real slopes are invisible at this scale.
elev = Image.open(os.path.join(src, "elev.jpg")).convert("L").filter(ImageFilter.GaussianBlur(0.9))
h = np.asarray(elev, dtype=np.float32)
rows = h.shape[0]
gx = (np.roll(h, -1, axis=1) - np.roll(h, 1, axis=1)) * 0.5  # towards east
gy = np.zeros_like(h)
gy[1:-1] = (h[:-2] - h[2:]) * 0.5  # towards north; image rows run south
lat = (0.5 - (np.arange(rows) + 0.5) / rows) * np.pi
gx /= np.maximum(np.cos(lat), 0.2)[:, None]  # a pixel is narrower on the ground away from the equator
k = 0.05
nx, ny = -gx * k, -gy * k
length = np.sqrt(nx * nx + ny * ny + 1.0)
nx /= length
ny /= length


def encode(a):
    return Image.fromarray(np.clip((a * 0.5 + 0.5) * 255, 0, 255).astype(np.uint8)).resize((4096, 2048), Image.LANCZOS)


# Lossless: lossy WebP halves the colour resolution, which would blur the normals.
normal_water = Image.merge("RGB", (encode(nx), encode(ny), water_img))
normal_water.save(os.path.join(out, "earth-normal-water.webp"), lossless=True, method=4)
# The smaller set keeps full colour resolution (subsampling=0), which lossy WebP cannot.
normal_water.save(os.path.join(small, "earth-normal-water.jpg"), quality=94, subsampling=0, optimize=True)

# Night lights: the source has a dark blue land and ocean base; keep only the warm lights.
night = Image.open(os.path.join(src, "night.jpg")).convert("RGB").resize((8192, 4096), Image.LANCZOS)
n = np.asarray(night, dtype=np.float32)
lights = np.clip((n[..., 0] - 0.28 * n[..., 2] - 4.0) / 200.0, 0, 1) ** 0.85
lights_img = Image.fromarray((lights * 255).astype(np.uint8))
lights_img.save(os.path.join(out, "earth-night-lights.jpg"), quality=90, optimize=True)
lights_img.convert("RGB").save(os.path.join(small, "earth-night-lights.webp"), quality=80, method=6)

# Clouds: upscale smoothly so the GPU does not show the 2048-pixel grid.
clouds = Image.open(os.path.join(src, "clouds2k.jpg")).convert("L")
clouds.resize((4096, 2048), Image.BICUBIC).save(os.path.join(out, "earth-clouds.jpg"), quality=92, optimize=True)
clouds.convert("RGB").save(os.path.join(small, "earth-clouds.webp"), quality=85, method=6)

print("wrote", out, "and", small)
