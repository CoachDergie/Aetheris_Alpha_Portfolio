# Implementation Guide v2: Meta Spatial SDK — Real Implementation

## Why this guide exists

The previous implementation pass (see git history / `IMPLEMENTATION_GUIDE.md` v1) reported Phase 1
and Phase 3 as addressed. In practice:

- `MainActivity.kt` was changed to remove Jetpack XR (`Subspace`, `SpatialGltfModel`, `PlanetModel`)
  correctly, but **nothing replaced it**. The activity now only renders `GrimoireWebView` in a
  `Box` — there is no `com.meta.spatial.*` import anywhere in the file, no `Scene`, no entity
  creation, no glTF loading call.
- `onAnchorToLoftRequested` / `onAnchorModeChanged` were relabeled from "Spatial Anchor Requested"
  to "Spatial Anchor Requested via Meta SDK", but every branch is still `Log.d(...)` with a
  `// Phase 3 TODO` comment — no platform API is actually called.
- `SolarSystemLogic.kt` itself is correctly implemented (Kepler solve, log-compressed distance
  scaling, aspect-angle detection) — but it is not imported or called from anywhere. It's a
  correct, unused module.
- `AndroidManifest.xml` has no `com.oculus.intent.category.VR` intent-filter category, so Quest's
  app library has no immersive entry point to launch even if the scene code existed.

**This guide's rule: every phase below ends with a "Definition of Done" that is a shell command or
a literal string check, not a description.** A phase is not complete until its Definition of Done
passes. Comments, renamed log strings, and TODOs do not satisfy a Definition of Done. If a phase
can't be fully completed, say so explicitly and state what's blocking it — do not mark it done
partially.

---

## Phase 1: Real Meta Spatial SDK bootstrap (Blocking — nothing else works without this)

**Current state:** `MainActivity extends ComponentActivity` and only calls `setContent { }` with a
Compose `Box`/`GrimoireWebView`. This is a plain 2D Android activity. It cannot render a 3D scene,
regardless of what code exists elsewhere.

**Required actions:**

1. Add the Spatial SDK Gradle plugin and dependencies to `app/build.gradle.kts`
   (`id("com.meta.spatial.plugin")` plus the SDK artifact — confirm current version against
   Meta's own template project, since this SDK is actively versioned).
2. Confirm AGP/Gradle versions match what current Meta Spatial SDK samples require (recent samples
   need Gradle 9.x + AGP 8.11.1 — a mismatch here fails native/CMake sync silently in ways that
   look unrelated to XR at all). Check `gradle/wrapper/gradle-wrapper.properties` and the root
   `build.gradle.kts` plugin versions against this before writing any Kotlin.
3. Create a **new, separate** immersive entry point — do not try to make the existing 2D
   `MainActivity` do both jobs. Meta's own architecture keeps panel activities and immersive
   scenes as separate activities. Create `ImmersiveActivity.kt` extending Meta's
   `AppSystemActivity` (or current equivalent per their template).
4. In `ImmersiveActivity`, establish the reference space (`LOCAL_FLOOR` is standard for
   room-scale), and load or construct a base scene.
5. Update `AndroidManifest.xml`:
   - Register `ImmersiveActivity` as an activity.
   - Add an intent-filter with category `com.oculus.intent.category.VR` so Quest's app library
     exposes an immersive launch point. Confirm whether this goes on `ImmersiveActivity` or
     `MainActivity` per current Meta docs — don't guess; check the current template project.
   - Leave the existing `android.software.xr.api.spatial` / `android.software.xr.api.openxr`
     feature declarations only if a dual Android-XR target is still intended (see open question
     in Phase 1 of the prior guide, never answered) — otherwise remove them, since they're
     Android-XR-specific, not Meta-specific, and their continued presence in the manifest is a
     leftover from before the pivot.

**Definition of Done:**
```bash
grep -rl "com.meta.spatial" app/src/main/java/          # must return at least one file
grep -c "AppSystemActivity" app/src/main/java/**/Immersive*.kt   # must be >= 1
grep -c "com.oculus.intent.category.VR" app/src/main/AndroidManifest.xml   # must be >= 1
```
If any of these return empty/zero, Phase 1 is not done — stop and report the blocker instead of
proceeding to Phase 2.

---

## Phase 2: Wire `SolarSystemLogic` into the actual scene

**Current state:** `SolarSystemLogic.calculatePositionInfo()` is correct and unused. No entity in
the app currently reads from it.

**Required actions:**

1. Resolve the asset path inconsistency first: `earth.glb` currently exists at
   `app/src/main/assets/models/earth.glb`, but `ASSET_MANIFEST.md` documents
   `public/solarsystem/models/`. Pick one. Whichever is chosen:
   - If `app/src/main/assets/models/`: confirm it's covered by `.gitignore`
     (`git check-ignore -v app/src/main/assets/models/earth.glb` must return a match).
   - If `public/solarsystem/models/`: confirm the `assets.srcDirs(...)` mapping in
     `app/build.gradle.kts` still exists and points there.
   - Update `ASSET_MANIFEST.md` to match whichever is actually true after this phase.
2. For each key in `SolarSystemLogic.PLANET_DATA`, create a scene entity referencing that body's
   `.glb` (via GLXF composition or programmatic `SceneMesh` loading — whichever fits the chosen
   scene-authoring approach from Phase 1).
3. Add a per-frame or timed system (Meta Spatial SDK's ECS system pattern) that calls
   `SolarSystemLogic.calculatePositionInfo(name, daysSinceEpoch, scale)` for each body and applies
   the result to that entity's `Transform` component.
4. `daysSinceEpoch` must not be a one-shot value — it needs to advance continuously (or ease
   toward a newly recalculated Zenith reading) per the drift requirement in `ARCHITECTURE.md`.
5. Feed `SolarSystemLogic.calculateAspects()` output into 3D line primitives connecting the
   relevant entity positions, per the Phase 2 item in the prior guide (this part was never
   attempted, not just incomplete).

**Definition of Done:**
```bash
grep -c "SolarSystemLogic" app/src/main/java/**/Immersive*.kt   # must be >= 1, not just in SolarSystemLogic.kt itself
```
Plus a manual check: launch on-device (or in the Meta XR Simulator) and confirm at least one
planet mesh is visible in the headset. A grep passing without a visible planet is not done.

---

## Phase 3: Environment & anchor modes — replace the log stubs

**Current state:** every branch of `onAnchorModeChanged` in `MainActivity.kt` is `Log.d(...)`
with a `TODO` comment. None of these call any Meta API.

**Required actions, replacing each branch:**
- `"room"` → `scene.enablePassthrough(true)` and hide the active skybox/environment entity
  (`setComponent(Visible(false))`) — passthrough will not show through a visible skybox.
- `"loft"` → `scene.enablePassthrough(false)`, show the default/loft environment entity.
- `"celestial_zenith"` → load or show a distinct skybox/space environment entity, using the
  geolocation from Phase 4 to inform its orientation if that's part of the intended design (confirm
  against `ARCHITECTURE.md`'s Zenith definition — this may be angle-only, not a different skybox;
  don't assume).
- `onAnchorToLoftRequested` → an actual Spatial Anchor request (Meta's anchor API), not a log line,
  so hand-tracked Sigil casting can pin to it as described in `ARCHITECTURE.md`.

**Definition of Done:**
```bash
grep -c "enablePassthrough" app/src/main/java/**/*.kt   # must be >= 1
grep -c "TODO" app/src/main/java/**/*.kt                # must be 0 in files touched by this phase
```

---

## Phase 4: Geolocation for Zenith

**Current state:** `ACCESS_COARSE_LOCATION` is already declared in `AndroidManifest.xml` and
requested in `MainActivity.requestPermissions()`. This part is genuinely done. What's missing is
consuming the result.

**Required actions:**
1. On permission grant, obtain a location fix (`FusedLocationProviderClient` or platform
   equivalent).
2. Pass lat/long through to wherever Zenith is calculated (confirm current owner — this may be the
   React/TSX layer via `NativeXRBridge`, or native code; check before assuming).

**Definition of Done:**
```bash
grep -c "FusedLocationProviderClient\|LocationManager" app/src/main/java/**/*.kt   # must be >= 1
```
Plus manual check: Zenith reading changes when tested from two different physical locations.

---

## Phase 5: Grimoire Tradition Toggle (unchanged from v1 — carried forward, not yet attempted)

Same as prior guide's Phase 4: `DiscoveredIncantation` schema update, `INITIAL_GRIMOIRE_LIBRARY`
data population, and `GrimoirePanel.tsx` conditional rendering on `useTradition()`. No native/Meta
SDK dependency — this can proceed independently of Phases 1–4 if useful to parallelize.

---

## Reporting back

For each phase, report: which Definition of Done checks passed (paste the actual command output,
not a restatement), which files changed, and — critically — if a phase is only partially possible
(e.g. blocked on confirming current Meta Spatial SDK API names), say that explicitly rather than
writing a comment claiming completion.
