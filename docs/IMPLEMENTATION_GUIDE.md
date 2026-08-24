# Aetheris — Implementation Plan: Window Pane, Sigil Drawing, Combat Toggle, Incantation Expansion

_Draft for Google AI Studio and human team review. Written against `MainActivity.kt`,
`ARCHITECTURE.md`, and `ASSET_MANIFEST.md` as currently in the repo._

## Reference materials for this pass

- **Official sample code:** https://github.com/meta-quest/Meta-Spatial-SDK-Samples — check for
  panel-rendering, texture-compositing, and pointer/raycast-input samples here.
- **Meta's AI-readable doc index:** https://developers.meta.com/horizon/llmstxt/documentation/spatial-sdk/llms.txt/

---

## 1. Terminology check — pin this down before writing render code

`ARCHITECTURE.md` says "stereographic/parallax-rendered view" for the window pane; the current code
labels it `CelestialPortal` and shows "WINDOW INTO SPACE." These are two different things and the
choice changes the implementation:

- **Stereographic** (an azimuthal fisheye-style map projection) — a single, monoscopic image with a
  wide-angle "looking through a bubble" distortion. Cheap, works fine in a flat 2D panel, renders
  once per frame.

treat this as a monoscopic stereographic/fisheye projection with parallax added
via head-pose-driven camera offset (small camera shift as the user's head moves, using whatever head
pose signal is available to a 2D panel) rather than true stereo. This matches "lean your head toward
it to look into it" from `ARCHITECTURE.md` and avoids depending on stereo panel support that may not
exist.

---

## 2. Task A — Render the 3D solar-system assets in the window pane

### Current state
`CelestialPortal` draws the solar system with 2D primitives only — `drawCircle` for orbit rings, the
sun, and each planet as a dot. It does not load any `.glb` file. `SolarSystemLogic` already produces
correct positions (Kepler solve, `calculatePosition`), so the math side is done; only the rendering
side needs to change.

### Target state
Replace the dot-based `Canvas` drawing with actual rendered `.glb` models
(`assets/models/<planet>.glb`, per `ASSET_MANIFEST.md`), composited into the same panel real-estate
`CelestialPortal` currently occupies, using the fisheye/stereographic projection from Section 1.

### Rendering approach
A Compose `Canvas` cannot load or shade a glTF mesh; this needs an actual 3D renderer running inside
a standard Android `View` (not inside a `Subspace`, since this panel is not in an immersive session:

1. **A standalone Android 3D engine composited into the panel** (e.g. Filament via a `TextureView`/
   `GLSurfaceView`, or an equivalent that loads glTF directly and doesn't require an XR session).
   Independent of any Meta or Jetpack XR API — this is the safer bet against the platform-target
   conflict in Section 0, since it works identically regardless of which XR SDK eventually owns the
   immersive branch.

it must **not** reuse the old `SpatialGltfModel` / `Subspace` code path — that path isn't present in the current file and depends on the still-unresolved platform target.

### Data flow
`daysSinceEpoch` already updates every frame via `withFrameNanos` and feeds `calculatePosition` for
the existing dot-based draw. Keep that data flow — swap only the draw call, from `drawCircle` per
planet to "set the position of the corresponding 3D node/entity in the embedded renderer, then let
the renderer draw the frame." Camera parameters (FOV, projection type) implement the fisheye/
stereographic look from Section 1; `systemScale` stays as the existing compressed-AU scale value.

### Steps
1. Prototype loading a single model (`sun.glb`) in the chosen renderer inside a bare `TextureView`/
   panel, confirmed visible in the actual Loft panel on-device (emulator visuals for Home panels are
   not reliable — verify on a real headset).
2. Wire `SolarSystemLogic.calculatePosition` output to the renderer's per-frame node transforms for
   all ten non-sun bodies (`earth_moon` positioned relative to `earth`, per `ASSET_MANIFEST.md`).
3. Implement the fisheye/stereographic camera projection.
4. Replace `CelestialPortal`'s `Canvas` block with the new renderer view, keeping the "WINDOW INTO
   SPACE" label and existing panel bounds/clipping.
5. Perf pass against Section 2's asset-size flag.

### DONE for Task A means
- All ten bodies (sun + nine per `PLANET_DATA`, `earth_moon` separately) render as their actual glTF
  models, not placeholder dots, verified on-device in the Loft panel.
- Planet positions visibly match `SolarSystemLogic`'s Kepler output (spot-check at least one date
  against a known ephemeris).
- The projection matches whatever Section 1 decision was made, written down in this doc or a linked
  follow-up, not left ambiguous.
- No `TODO`, commented-out old `drawCircle` block, or stub renderer left in the file.
- Frame rate measured and recorded on an actual Quest device, not assumed acceptable.

---

## 3. Task B — Disable the combat tab without removing it

Team intent: keep all combat/telemetry code intact in this branch (for the post-alpha fork), but
make it unreachable/invisible in the alpha build users see.

### Approach
A single build-time or runtime feature flag gating the tab's entry point in navigation — not
per-line comments, not deleting files, not `if (false)`. The flag should be one obvious switch, e.g.
a `BuildConfig` in one config file, checked in exactly one place (the nav/tab
list), so re-enabling it for the fork later is a one-line change.

### Steps
1. Locate the tab-registration point in the grimoire WebView's nav (likely in the React/TSX layer
   the WebView hosts, not `MainActivity.kt` itself — confirm which layer owns tab registration).
2. Add the flag and gate only the tab's visibility/route registration with it — leave the combat
   screen component, telemetry recording logic, and any native bridge calls for it completely
   untouched.
3. Confirm the underlying combat code still compiles and isn't dead-code-eliminated by the build
   (some minifiers/tree-shakers will strip an unreferenced route — verify the flagged-off build
   still contains the combat code in the output, not just in source).

### DONE for Task B means
- Combat tab is not visible or reachable in a standard alpha build.
- The exact same source tree, with the flag flipped, restores the combat tab with no other changes.
- Verified in an actual built artifact (not just "looks right in source") that the combat code
  wasn't stripped by the build/minifier when disabled.
- The flag and its location are documented in this repo (a one-line note in `ARCHITECTURE.md` or a
  `README` is enough) so it isn't rediscovered by reading the whole codebase later.

---

## 4. Task C — Sigil-drawing pane with touch/controller tracers + color picker

### Concept, as described
A second interactive panel, structurally similar to the window-into-space pane, but instead of
rendering pre-existing content up front, it starts blank and draws tracer lines wherever the user's
finger/controller touches the panel surface — plus a color wheel/selector for tracer color.

### Rendering approach
Unlike Task A, this does **not** need a 3D renderer — it's 2D ink on a flat surface, which is exactly
what the existing `Canvas` approach in `CelestialPortal` already does well. Recommend keeping this
one in Compose `Canvas` (a `Path` per stroke, appended to on each pointer-move event) rather than
routing it through the same 3D pipeline as Task A — simpler, and stroke rendering doesn't benefit
from a 3D engine.

### Input handling — needs confirmation against the samples repo
"Touch with finger/controller" on a 2D Home panel means the input arrives as a standard Compose
pointer-input event (drag/move), the same as touching a phone screen, **if** Meta's panel input
model surfaces controller raycasts as pointer events to the hosted 2D content. Confirm this against
the Meta Spatial SDK samples (look for a panel-input or pointer-interaction sample) rather than
assuming controller-ray-to-panel-touch mapping works identically to a touchscreen — this is the one
part of Task C most likely to need a different API than plain Compose `pointerInput`.

### Color wheel/selector
A standard HSV color-wheel composable (custom `Canvas`-drawn wheel + a brightness/value slider is
the common pattern) feeding the current stroke color. No native/XR dependency — pure Compose UI,
same layer as the rest of the grimoire panel.

### Open question to flag, not silently decide
Should completed sigils persist (save to the local journal store) or are they ephemeral/session-only?
`ARCHITECTURE.md` describes the journal as storing locally on-device — if sigils are meant to be
saved there too, that's additional scope (storage format, a "save/clear" affordance) that should be
scoped explicitly rather than assumed.

### Steps
1. Confirm input-handling model against the SDK samples (see above) before writing pointer code.
2. Build the blank tracer canvas: capture pointer-down/move/up into `Path` objects, redraw on each
   frame or on each point (whichever the samples/perf testing favors).
3. Build the HSV color wheel + value slider, wire to current stroke color.
4. Decide and implement the persistence question above.
5. Integrate as a pane alongside (or as a mode of) the existing window-into-space pane — confirm with
   the team whether these are two separate panels or a tab-switched view of one panel.

### DONE for Task C means
- Touching/dragging on the panel with both a real finger (if applicable) and an actual Quest
  controller produces a visible tracer line, verified on-device — not just mouse/emulator input.
- Color wheel changes the color of new strokes, verified visually.
- The persistence question above has an explicit answer in this doc or a linked follow-up, not left
  implicit.
- No placeholder "TODO: wire input" left in the pointer-handling code.

---

## 5. Task D — Expand the incantation/mantra section

### Scope
Two parts: (1) actual content — explain to the user what an incantation/mantra is and why it's
useful for meditation, in the app's own voice; (2) whatever UI/structural expansion the section
needs to hold that content plus its existing function.

### Content requirements
- A short, plain-language definition distinguishing incantation from mantra as the app uses the
  terms (they're often used interchangeably in casual spiritual-practice writing, but if this app
  treats them as distinct concepts, say so explicitly rather than leaving it ambiguous to the user).
- A brief, non-clinical explanation of why repetition of a phrase/sound is used in meditation
  practice (focus anchor, breath pacing, etc.) — written for a general audience, not asserting
  scientific claims the team hasn't verified.
- This is user-facing copy — have someone on the team actually write and review it as content, not
  generate-and-ship placeholder text.

### DONE for Task D means
- The definition and "why it helps" copy is real, reviewed, final text in the app — not lorem-ipsum,
  not a bracketed `[explain incantations here]` placeholder.
- Section renders correctly alongside the existing incantation/mantra functionality (whatever that
  currently is — confirm it isn't broken by the expansion).
- Content has been read by at least one team member for tone/accuracy before merge, not just by the
  agent that wrote it.

---

## 6. "DONE" policy for this pass — applies to all four tasks above

Stated goal: stop agents and team members from marking work complete via comments, blank files, or
partial stubs. Concrete rules for this pass:

1. **No commented-out code as a substitute for a decision.** If something is disabled (Task B), it's
   disabled via an explicit flag checked at one call site — never by wrapping a block in `/* */` or
   `//`.
2. **No placeholder assets.** Per `ASSET_MANIFEST.md`'s own stub-detection note, any new asset added
   for these tasks gets the same sanity check — a real exported file is at minimum tens of KB; a
   file under ~1KB is a stub, not a deliverable. Run the existing
   `ls -la public/solarsystem/models/*.glb`-style check (or the tarot/asset-manifest generator) on
   anything new before calling it done.
3. **No TODO-only functions.** A function that exists only to satisfy a call site but does nothing
   (`fun onTracerColorChanged(color) { /* TODO */ }`) is not done — it's either implemented or the
   task isn't merged.
4. **"Confirmed on-device," not "looks right in source."** Every DONE checklist above requires an
   on-device (real Quest headset) verification step, not an emulator screenshot or a code read-
   through — this repo has already had one round of the Home-panel-vs-emulator gap
   (`ARCHITECTURE.md`'s 3D-spawn-in-Home finding), so on-device verification is treated as
   mandatory here, not optional.
5. **Open questions get written down, not silently resolved.** Sections 0, 1, and Task C's
   persistence question are explicit "confirm before building" items. If an agent or contributor
   hits one of these unresolved, the correct action is to flag it in the PR description, not guess
   and ship.
6. **A task is DONE only when its own DONE section above is fully checked off.** Partial completion
   gets marked partial in the PR, not merged as done.
