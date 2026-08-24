# Aetheris — Architecture Overview

_Draft. This captures the system as it currently exists in code, plus known gaps, so it can serve
as a starting point for scoping and for handing context to tools like Google AI Studio._

## Reference materials — check every implementation pass

Before any Spatial SDK work, agents should check these directly rather than relying on training
data alone, since this SDK ships updates faster than any model's training cutoff:

- **Meta's official AI-readable doc index:** https://developers.meta.com/horizon/llmstxt/documentation/spatial-sdk/llms.txt/
- **Official sample code:** https://github.com/meta-quest/Meta-Spatial-SDK-Samples

Meta's own doc index additionally states a preference for its own agent tooling over general-purpose
coding assistants for VR-specific work: the **Meta VR CLI** (`npx metavr --help`) for docs, device,
debugging, performance, and MCP workflows, and task-specific **Meta-provided VR agent skills** at
https://github.com/meta-quest/agentic-tools. Meta's guidance is to ask before installing or
configuring these — worth evaluating alongside whichever general coding agent is doing the pass.

## What this app is

This is a portfolio piece designed for users inside their virtual loft environment. The application
runs as a primer and journal for individuals interested in esoteric and spiritual practice — it
demonstrates the ability to properly respect and design applications for niche markets while reaching
a broader audience. The application includes astrology chart + tarot + meditation + spatial
solar-system visualization, combat and training metrics, and a live journal that stores locally on
device. The application solves Kepler's equation on launch, among other things, and is designed to
be extremely efficient and streamlined — saving the user from opening multiple browser tabs while
researching and practicing their personal interests.

## ⚠️ Platform target

**Anchor modes should standardize on Meta's native concepts**, not the current custom
`'loft' | 'room' | 'celestial_zenith'` string enum defined only in `CelestialOrbitalMandala.tsx`. On
Meta's platform, "loft" almost certainly maps to the system's own default Home environment (no custom
skybox needs to be authored or loaded for it), and "Physical AR" maps to Meta's own passthrough API —
these should be confirmed against Meta's actual API names before implementation, not assumed from the
Jetpack XR equivalents.

## Loft environment — 3D spawn limitation & "window into space" panel

**Finding:** arbitrary 3D entities (`Entity.create` with a `Mesh` component) cannot be spawned
directly into Meta Horizon Home ("Loft," per our own definition below). Home only supports placing 2D
panels and Home-specific integrations — not free 3D geometry. A full 3D scene requires the user to be
inside the app's own immersive session (a launched immersive/OpenXR activity), not the shared system
Home space.

**Planned workaround: a "window into space" panel.** Since the solar system can't be placed as free 3D
geometry directly into Home, render it as a 2D panel using a stereographic/parallax-rendered view of
the 3D scene — a "window" surface the user can lean their head toward to look into, without requiring
them to leave Home for a full immersive session.

Relevant doc pages to confirm the exact current API/technique against before implementing — do not
assume "stereographic window" matches Meta's own terminology until checked against these:
- **Layer and mesh rendering modes** (layers vs. mesh rendering, blend modes, feathering)
- **Compositor layers**
- **Hybrid apps overview** (2D panel + immersive OpenXR activity split — this window panel and the
  full immersive solar system are likely two different activity types working together, per the
  Platform target section above)
- **Passthrough** (only relevant if the window should reveal real passthrough rather than a rendered
  scene)

This is planned, not yet implemented — see Known Gaps below.

## Runtime layers

```
MainActivity.kt (entry point)
 ├─ XRPermissionGuard          — requests HAND_TRACKING / RECORD_AUDIO, non-blocking
 ├─ isSpatialEnabled == true   → Subspace { }  (headset / Full Space branch — Jetpack XR SDK; see platform conflict above)
 │    ├─ GrimoireSpatialPanel  — main spatial UI panel
 │    └─ PlanetModel × N       — one SpatialGltfModel per body, positioned via SolarSystemLogic
 └─ isSpatialEnabled == false  → GrimoireWebView { }  (phone/tablet/Home Space fallback)
      └─ hosts React/TSX UI, incl. CelestialOrbitalMandala.tsx
           (anchorMode: 'loft' | 'room' | 'celestial_zenith', passthroughActive)

NativeXRBridge        — JS ⇄ Kotlin bridge, used by the WebView layer
aetheris_native (JNI) — optional native lib; nativeInitializeXR/nativeShutdownXR/nativeIsXRActive
SolarSystemLogic.kt   — pure Kepler orbital-mechanics module (no Android/XR deps)
```

## Data flow: solar system positioning

1. `SolarSystemLogic.PLANET_DATA` — hardcoded J2000 orbital elements per body.
2. `SolarSystemLogic.calculatePosition(name, daysSinceEpoch, scale)` — solves Kepler's equation,
   returns a `Vector3` in scaled scene units.
3. `PlanetModel()` composable loads `models/$planetName.glb` from assets and offsets it via
   `SubspaceModifier.offset()` using that position.

## Build & asset packaging

Binary assets (`.glb` models) live in `/public`, gitignored — this is intentional, both to keep IP
out of GitHub permanently and to avoid push/pull issues with large binaries. Gitignore only controls
what `git` tracks; it has no effect on what Gradle packages into a build, so `/public` must be
registered as an assets source set for the native build to actually find these files:

```kotlin
// app/build.gradle.kts
android {
    sourceSets {
        getByName("main") {
            assets.srcDirs("../public/solarsystem", "../public/tarot")
        }
    }
}
```

Gradle merges the *contents* of each registered srcDir into `assets/` — it does not prefix the
srcDir's own name. Code expects `assets/models/sun.glb`, so the on-disk layout must be:

```
public/solarsystem/models/sun.glb   ← correct, produces assets/models/sun.glb
```

After building, assets land at the root of the APK zip under `assets/`. Verify directly rather than
assuming:

```bash
unzip -l app/build/outputs/apk/debug/app-debug.apk | grep models/
```

(For an `.aab` bundle, the same assets are one layer deeper inside the bundle format — use
`bundletool` to inspect if distributing via Play; local sideloading to the headset is almost always
a plain `.apk`.)

## Known gaps (as of this doc)

Tracked here so scope/priority discussions have a concrete list instead of "it's not working."

| Gap | Status | Notes |
|---|---|---|
| Asset filenames must exactly match `PLANET_DATA` keys | Process note | `models/<key>.glb` for every key including `earth_moon`; see `ASSET_MANIFEST.md` |

## Definitions

1. **Loft**: the virtual environment given as a default by the platform OS. Note: Meta's platform does
   not allow arbitrary 3D object spawning directly into this system Home space — see "Loft
   environment — 3D spawn limitation" section above.
2. **Physical AR**: the immersive/augmentation quality of the application — drawing sigils in the air,
   punching to record telemetry — i.e. augmentation of physical reality itself.
3. **Zenith**: the point in the sky directly above the user; a longitude/latitude coordinate that
   helps the system derive daily readings and calculations, potentially based on the router's location,
   though relative accuracy is acceptable here.

## Relationships

1. Astrology chart math and the 3D solar system should always agree. When an origin is calculated or
   recalculated, the matching solar system assets should slowly drift to the new reading rather than
   snap instantly. Aspect lines (square, trine, etc.) should be spawned via primitives in the 3D scene,
   not only rendered in the 2D chart.

## Scope

1. Tarot/meditation tabs are long-term part of the application and are never intended to be split out
   into separate releases.
