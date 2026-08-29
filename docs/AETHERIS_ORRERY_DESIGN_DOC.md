# Aetheris — Design Doc: Hand-Built Orrery Renderer (`CelestialRenderer.kt`)

_For self-implementation / portfolio work. Scope: replace glTF-imported planet assets with
procedurally built, properly lit, astronomically-driven geometry inside the existing Filament/
`TextureView` pipeline confirmed working in `CelestialRenderer.kt`._

## Why not the NASA `.glb` files

Worth stating explicitly, since it's the fork in the road: NASA's public 3D models (3D Resources,
Eyes on the Solar System exports) are built for scientific visualization tooling, not real-time
mobile GPUs. Common friction points, consistent with what I ran into:

- Very high triangle counts relative to what a Quest panel needs on-screen.
- Material graphs authored for other renderers — they don't map cleanly onto Filament's ubershader
  or a simple PBR lit material, so it inherits someone else's shader assumptions.
- Inconsistent scale/pivot/axis conventions per body (some z-up, some not centered on the mesh
  origin) — exactly the "fighting the import" experience rather than controlling the result.
- Texture sizes authored for desktop (often 8K+) — unnecessary and expensive for a panel-sized
  render target.

**Recommendation: don't import NASA geometry. Build each planet as a procedural UV sphere in code,
and texture it with NASA-sourced (or NASA-derived) imagery.** This also happens to be the stronger
portfolio artifact — a hand-rolled sphere generator, material setup, and orbital-mechanics-driven
placement demonstrates more than "successfully imported a file.".

### Where to get the texture maps
- **NASA Visible Earth** and the **NASA Scientific Visualization Studio (SVS)** publish equirectangular
  color/bump maps per body, public domain.
- **Solar System Scope** publishes ready-to-use equirectangular textures derived from NASA imagery
  under CC BY 4.0, already sized sanely for real-time use (typically 2K/4K/8K options) — a common,
  well-known shortcut specifically to avoid re-processing NASA's raw imagery yourself. Worth using
  their 2K or 4K tier directly rather than NASA's largest raw exports.
- it only needs: a color/albedo map per body, and optionally a bump/normal map for the rockier
  bodies (Mercury, Mars, the Moon) — Filament's standard lit material takes both.

---

## 1. Geometry — procedural UV sphere, not an imported mesh

Build one reusable sphere generator, parameterized by radius and tessellation (stacks/slices), and
instantiate it once per body at a resolution appropriate to its screen size — not one fixed
tessellation for everything.

```kotlin
// logic/SphereMeshBuilder.kt — pure math, no Filament/Android deps, like SolarSystemLogic
object SphereMeshBuilder {
    data class SphereMesh(
        val positions: FloatArray,   // x,y,z per vertex
        val normals: FloatArray,     // x,y,z per vertex (== normalized position for a unit sphere)
        val uvs: FloatArray,         // u,v per vertex
        val indices: ShortArray
    )

    fun build(radius: Float, stacks: Int, slices: Int): SphereMesh {
        // standard UV-sphere: stacks = latitude bands, slices = longitude bands
        // positions/normals from spherical coordinates, uvs from (slice/slices, stack/stacks),
        // indices as two triangles per quad. Keep this deterministic and unit-tested against
        // known vertex counts — this is the one piece of "real" geometry math in the renderer,
        // worth getting right and documenting rather than copy-pasting from a tutorial unexamined.
    }
}
```

Feed `SphereMesh` into a Filament `VertexBuffer`/`IndexBuffer` pair per body, built once at asset-load
time (mirrors where `startBackgroundAssetLoad()` currently loads `.glb` bytes — same lifecycle slot,
different content).

### Tessellation tiers — don't use one constant everywhere
A fixed `stacks/slices` for every body is the same kind of unexamined-default that produces the
"64-line orbit" problem, just moved to sphere geometry. Tier it instead:

|   Tier   |                  Bodies                   |Suggested stacks × slices|                             Why                                    |
|-    -   -|-                     -                   -|-           -           -|  -                               -                              -  |
|   Hero   |        Sun, Earth, Saturn (+ rings)       |          48×48          | Largest on-screen footprint / most looked-at                       |
| Standard |           Jupiter, Venus, Mars            |          32×32          | Mid footprint                                                      |
|   Minor  | Mercury, Uranus, Neptune, Pluto, the Moon |          20×20          | Small on-screen footprint at this panel's typical viewing distance |

Confirm these against actual on-device frame timing once built — the table above is a starting
point, not a measured result.

---

## 2. Scale — solve size-scale and distance-scale as two separate problems

`ARCHITECTURE.md`'s known gap ("linear AU distance scale unusable at room scale") applies here too,
and doing this right is part of what makes a hand-built orrery look intentional rather than
arbitrary. The key fact: **no physical orrery, real or digital, renders true-to-scale size and
true-to-scale distance simultaneously** — if Earth is visibly a sphere and not a speck, Neptune's
true-AU distance is many kilometers away at the same scale. Real orrery builders (and this one)
pick two independent scale functions on purpose, not as a shortcut:

- **`planetRadiusScale(body)`** — a size scale chosen for visual legibility (each body clearly a
  sphere, relative size differences still readable — e.g. Jupiter visibly bigger than Mercury —
  without being literally proportional to real km radii).
- **`orbitalDistanceScale(semiMajorAxisAU)`** — already partially solved by the existing
  `orbitalScale` float and `SolarSystemLogic.calculatePosition`; recommend moving from a flat linear
  multiplier to a **compressed (e.g. square-root or log) function of AU** so outer planets don't
  run off-panel while inner planets don't collapse into the sun. This is the actual fix for the
  known gap, and it's a one-function change in `SolarSystemLogic`, not a renderer change.

Document both functions' chosen constants directly in code comments — a future reader (including
you) should be able to tell these are deliberate visual choices, not leftover magic numbers.

---

## 3. Orbit paths — real ellipses, not a fixed-segment circle

The "64-line circle" pattern happens because circle-drawing doesn't need orbital elements at
all — it's decoration. A correct orrery draws each orbit as the **actual ellipse** implied by that
body's Kepler elements, which `SolarSystemLogic.PLANET_DATA` already has (semi-major axis,
eccentricity — confirm inclination is present or add it if not).

- Parametrize each orbit as `r(θ) = a(1 - e²) / (1 + e·cos(θ))` (the polar form of an ellipse from
  its focus) rather than a circle of radius `a` — this alone fixes the "why do all orbits look like
  perfect circles" tell.
- **Adaptive segment count, not a fixed 64** — pick segment count from the ellipse's screen-space
  arc length or eccentricity (a nearly-circular orbit needs fewer segments to look smooth than a
  highly eccentric one at the same visual scale). A simple version: segment count scaled by
  `semiMajorAxisAU * orbitalDistanceScale`, clamped to a min/max — replace the existing `OrbitRing`
  class's presumed-fixed segment logic with this rather than layering a new one alongside it.
- **Actual orbital inclination**, not a flat plane — each planet's orbit is tilted a few degrees
  relative to the ecliptic; render that tilt on the ellipse rather than keeping every orbit flat.
  This is a small, real detail that reads as "someone who understood the astronomy" rather than
  "someone who drew circles."

---

## 4. Lighting — the sun as an actual light source, not just a bright mesh

Current `setupInitialScene()` sets a flat ambient `IndirectLight` and a dim skybox color, with no
positional light — so planets are uniformly lit regardless of their position relative to the sun,
which undersells the whole point of an orrery (day/night terminator, relative brightness falloff
with distance).

- Add a **`Light.Builder(Light.Type.POINT)`** positioned at the sun's transform (origin), with
  intensity tuned so inner planets read as brighter than outer ones — Filament's physically-based
  falloff will do most of this for you once the light exists.
  
  ```kotlin
  val sunLight = EntityManager.get().create()
  LightManager.Builder(LightManager.Type.POINT)
      .color(1.0f, 0.95f, 0.85f)
      .intensity(some_tuned_value)
      .falloff(large_enough_to_reach_neptune_at_current_orbitalDistanceScale)
      .position(0f, 1.5f, 0f) // match systemTransform's translate
      .build(engine, sunLight)
  scene?.addEntity(sunLight)
  ```
  
- Drop or significantly dim the existing flat `IndirectLight` — a strong ambient term flattens the
  terminator effect the point light is there to create. Keep a small amount only so the unlit side
  of a planet isn't pure black.
- The **sun mesh itself** should use an **unlit/emissive material**, not the same lit material as the
  planets — it's a light source, not a lit object; using the lit material on it means it'll go dark
  from its own side, which looks wrong.
- Planet materials: Filament's standard lit material (`baseColor` = the NASA/Solar-System-Scope
  texture, low `roughness` variation per body if you want e.g. Mercury vs. cloud-covered Venus to
  read differently — optional polish, not required for correctness).

---

## 5. Rotation & axial tilt (new data, not currently in `SolarSystemLogic`)

For a real orrery feel, each body should spin on its own axis, tilted correctly — currently
`PLANET_DATA` only has orbital elements, not rotation. Add per body:

```kotlin
data class RotationElements(
    val axialTiltDeg: Float,       // e.g. Earth 23.44, Uranus ~97.77
    val rotationPeriodHours: Float // sidereal rotation period; negative for retrograde (Venus, Uranus)
)
```

Apply as an additional rotation in the per-frame transform in `render()`, composed with the existing
`translateM`/`scaleM` calls — tilt around the orbital-plane normal, then spin around the tilted axis
by `(daysLocal * 24 / rotationPeriodHours) * 360°`. Venus and Uranus are worth getting right
specifically because their retrograde/extreme tilt is a detail most quick implementations skip.

---

## 6. Data & asset checklist before writing renderer code

Confirm/gather these first — building the renderer around missing data is how you end up
back-filling magic numbers later:

- [ ] `RotationElements` added to `SolarSystemLogic.PLANET_DATA` (or a parallel table) for all 10
      bodies (9 planets + Moon).
- [ ] Orbital inclination present per body in `PLANET_DATA` — add if only semi-major-axis/eccentricity
      currently exist.
- [ ] Texture set sourced (Solar System Scope 2K or 4K tier, or NASA SVS equivalents) — one color map
      per body at minimum, stored the same way as the current `.glb`s
      (`public/solarsystem/textures/`, registered as an asset source dir per `ARCHITECTURE.md`'s
      existing Gradle pattern).
- [ ] `orbitalDistanceScale` function decided (sqrt/log-compressed) and documented with its chosen
      constants.
- [ ] Tessellation tier table (Section 1) confirmed or adjusted after an on-device perf pass.

---

## DONE for this pass means

- No `.glb` planet assets loaded in `CelestialRenderer.kt` — all ten bodies are procedural
  `SphereMeshBuilder` geometry, textured with the sourced maps.
- Each orbit renders as a true Kepler ellipse (visibly non-circular for higher-eccentricity bodies
  like Mercury/Pluto), tilted by its actual inclination, with segment count derived from a
  documented function — not a fixed literal like `64`.
- The sun is an actual Filament point light casting position-dependent brightness/falloff onto the
  planets, verified by observing a visible day/night terminator on at least one planet on-device —
  not just present in code.
- Each planet rotates on its own axis at its own period, with Venus/Uranus's atypical tilt/direction
  visibly correct, not defaulted to Earth-like values.
- Size scale and distance scale are two named, separately-documented functions (Section 2) — not one
  shared constant reused for both.
- Frame rate measured on-device with all ten bodies + orbits + lighting active, recorded in the PR [Pull request].
- No leftover `.glb`-loading code path, commented out "in case we go back" — if NASA assets are
  fully replaced, the old loading code is removed, not disabled.
