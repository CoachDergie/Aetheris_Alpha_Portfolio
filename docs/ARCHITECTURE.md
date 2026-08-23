# Aetheris — Architecture Overview

_Draft. This captures the system as it currently exists in code, plus known gaps, so it can serve
as a starting point for scoping and for handing context to tools like Google AI Studio._

## What this app is

This is a portfolio piece designed for users inside their virtual loft environment. The application
runs as a primer and journal for individuals interested in esoteric and spiritual practice — it
demonstrates the ability to properly respect and design applications for niche markets while reaching
a broader audience. The application includes astrology chart + tarot + meditation + spatial
solar-system visualization, combat and training metrics, and a live journal that stores locally on
device. The application solves Kepler's equation on launch, among other things, and is designed to
be extremely efficient and streamlined — saving the user from opening multiple browser tabs while
researching and practicing their personal interests.

## ⚠️ Platform target — needs resolution before further native work

**Target platform: Meta OS (Horizon OS / Quest).** This is the confirmed intended target.

**Conflict:** the current native XR implementation in `MainActivity.kt` is written entirely against
**Google's Jetpack XR SDK** — `androidx.xr.compose.*`, `androidx.xr.runtime.*`, `SpatialGltfModel`,
`Subspace`, `LocalSpatialCapabilities`, `session.scene.spatialEnvironment`. This SDK targets **Android
XR devices** (e.g. Samsung Galaxy XR) and does not run on Meta Quest / Horizon OS. Meta's platform has
its own separate stack (Meta Spatial SDK in Kotlin, or Unity/Unreal via Meta's OpenXR integration),
with its own session, environment, and spatial-anchor APIs.

**Practical effect:** every fix discussed so far for the native layer (`allowUnboundedSubspace`,
`session.scene.spatialEnvironment.preferredSpatialEnvironment`, the `SpatialGltfModel` positioning
pipeline) is correct *for Jetpack XR / Android XR*, but none of those APIs exist on Meta's platform.
If Meta OS is the real target, the native XR layer needs to be rebuilt against Meta's actual SDK, not
patched — this is a swap of the underlying platform, not a bug fix.

**Anchor modes should standardize on Meta's native concepts**, not the current custom
`'loft' | 'room' | 'celestial_zenith'` string enum defined only in `CelestialOrbitalMandala.tsx`. On
Meta's platform, "loft" almost certainly maps to the system's own default Home environment (no custom
skybox needs to be authored or loaded for it), and "Physical AR" maps to Meta's own passthrough API —
these should be confirmed against Meta's actual API names before implementation, not assumed from the
Jetpack XR equivalents.

**Open question for the team / for Gemini to resolve first:** confirm whether the Jetpack XR code path
is being kept for a secondary Android XR build target, or should be removed/replaced outright once the
Meta-native implementation lands. This changes how much of the existing `MainActivity.kt` is salvage
vs. rewrite.

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
| **Native XR layer targets the wrong SDK for the platform** | **Blocking — needs team decision** | See "Platform target" section above. Jetpack XR SDK code cannot run on Meta OS/Quest as-is. |
| `anchorMode` should use Meta's native environment/passthrough concepts | Needs Meta SDK research | Current `'loft'/'room'/'celestial_zenith'` enum is app-defined, not backed by any platform API yet |
| Zenith requires geolocation | Planned, not started | Derives readings from lat/long ("potentially based on the router; relative accuracy is OK"). `XRPermissionGuard` currently only requests `HAND_TRACKING` / `RECORD_AUDIO` — no `ACCESS_COARSE_LOCATION` / `ACCESS_FINE_LOCATION` requested anywhere yet |
| Aspect lines (square/trine/opposition) as 3D primitives | Planned, not started | Currently only exist as 2D SVG lines in `CelestialOrbitalMandala.tsx`; per Relationships below, these should be spawned as primitives in the 3D scene, matching the astrology chart math |
| Linear AU distance scale (`systemScale = 100f`) unusable at room scale | Found, needs design decision | Neptune ends up meters away; needs a compressed/non-linear display scale, not true AU ratios |
| `daysSinceEpoch` computed once via `remember`, never updates | Found, not yet fixed | Orbits are frozen at app-launch time; per Relationships below, recalculation should ease/drift the solar system to the new reading, not jump instantly |
| No real environment/passthrough call wired to `anchorMode` | Found, not yet fixed | Blocked on Platform target decision above — the correct API to call depends on which SDK is actually in use |
| `NativeXRBridge` anchor callback only logs | Found, not yet fixed | `Log.d("Aetheris", "Spatial Anchor Requested")` — no actual native/session call |
| Asset filenames must exactly match `PLANET_DATA` keys | Process note | `models/<key>.glb` for every key including `earth_moon`; see `ASSET_MANIFEST.md` |

## Definitions

1. **Loft**: the virtual environment given as a default by the platform OS.
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

1. Tarot/meditation tabs are long-term part of the application and are never intended to be split out into separate releases.
