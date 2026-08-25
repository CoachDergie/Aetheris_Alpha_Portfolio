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

## System Resilience & Telemetry

1. **How are you preventing memory leaks across the JavaScript interface when passing high-frequency C++ Sensor Telemetry to the React DOM?**
   High-frequency telemetry (like IMU/kinetic combat metrics) should not be passed directly over the JS bridge on every frame, as serialization overhead and garbage collection pauses will crash or stutter the React DOM. Instead, the native layer (Kotlin/C++) aggregates and buffers the telemetry, maintaining a ring buffer of state. The React DOM only polls or receives throttled updates (e.g., 10-30Hz max) for visual rendering, while the native layer retains the raw high-frequency data for persistence or precise metrics calculations, preventing bridge saturation and memory leaks.

2. **Does your gradle pipeline autonomously compile the TypeScript payload and inject the static assets into the .APK without manual intervention?**
   Yes. The `buildReactApp` Gradle task natively executes `npm run build` using the Node Gradle plugin before the Android `preBuild` phase. The output is directly synced into `src/main/assets/ui`. Similarly, the `copySolarSystemModels` task automatically pulls the `.glb` files into the assets directory, ensuring all web payloads and 3D assets are bundled autonomously into the `.APK` during a standard Gradle build.

3. **What is your exact fallback protocol when the headset's webview isolated storage drops state during an out of memory event?**
   The WebView acts merely as a stateless UI presentation layer. The authoritative source of truth for the journal, telemetry, and active state is held in the native Android layer (e.g., via Room Database or native shared preferences). If the WebView is killed or drops its `localStorage` state during an OOM event, it re-initializes upon reload by requesting a complete state hydration payload from the NativeXRBridge. No user data is lost because the WebView's local storage is treated as a transient cache, not durable storage.
   
4. Always enforce modern EdgeToEdge parameters for any whole window to ensure that each window attempts to consume every available pixel on resize. This is usually a minor bug but often creates errors when windows attempt to draw a specific scale and standard android fallback is often a grey box artifact.
## Loft environment & "Window into Space" Orrery

Use:

@docs/AETHERIS_ORRERY_DESIGN_DOC.md

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
| 
| 
| Important
To prevent future "Redundant Fixes," avoid using !! (not-null assertions) on the Engine or Scene handles. Always use safe calls (?.) or local immutable copies (val e = engine ?: return) inside the render loop to prevent asynchronous teardown crashes.

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
