# Implementation Guide: Architecture Alignment & Feature Refinement

This guide outlines the concrete steps needed to address the gaps highlighted in `ARCHITECTURE.md`, adhere to the `ASSET_MANIFEST.md`, and resolve the Hermetic vs. Qliphothic Grimoire toggle request. 

Please review this guide. Once approved, we can proceed with implementing these phases sequentially.

## Phase 1: The Platform Target Resolution (Blocking)
As noted in the architecture doc, the current native layer heavily relies on Google's Jetpack XR (`androidx.xr.*`), which will not run on Meta Horizon OS. 

**Proposed Action:**
*   **Decision Required from You:** Do we strictly pivot to the **Meta Spatial SDK** (Kotlin-based) and remove Jetpack XR entirely, or are we maintaining a dual-target approach? 
*   **Implementation:** If Meta OS is the sole target, we will strip `Subspace`, `SpatialPanel`, and `SpatialGltfModel`. We will rewrite `MainActivity.kt` to initialize the Meta Spatial SDK, creating a spatial scene and replacing `PlanetModel` with Meta's equivalent GLTF loading and positioning nodes. 

## Phase 2: 3D Solar System Refinements
Addressing the specific physics and rendering gaps identified in the architecture document.

**Proposed Actions:**
1.  **Non-Linear Distance Scale:** The current linear AU scale (`systemScale = 100f`) pushes outer planets like Neptune outside the usable room boundary. We will implement a compressed (logarithmic or tiered) distance scaling algorithm in `SolarSystemLogic.kt` so the inner planets remain distinct, while gas giants stay within a comfortable 2-3 meter radius.
2.  **Continuous Time/Drift:** The orbits are currently frozen at app launch (`remember { SolarSystemLogic.getDaysSinceJ2000() }`). We will introduce a continuous or ease-driven ticker so the planets slowly drift along their orbital paths, or smoothly animate when the user recalculates their Zenith.
3.  **Asset Adherence:** Ensure the rendering loops strictly map to the exact file names defined in `ASSET_MANIFEST.md` (e.g., handling the specific scale and positioning of `earth_moon.glb` relative to `earth.glb`).
4.  **3D Aspect Lines:** Generate dynamic 3D line primitives bridging planets (e.g., Mars to Saturn for a Square aspect) directly in the XR spatial volume, mirroring the math used in the 2D SVG chart.

## Phase 3: Environment & Spatial Anchors
Fleshing out the stubbed XR interactions.

**Proposed Actions:**
1.  **Geolocation Permissions:** Add `ACCESS_COARSE_LOCATION` to `AndroidManifest.xml` and integrate it into `XRPermissionGuard`. We will pass these coordinates to the React layer to accurately calculate the Zenith.
2.  **Passthrough & Environment:** Map the custom `anchorMode` ('loft', 'room', 'celestial_zenith') to actual platform APIs. If we pivot to Meta OS, 'room' will trigger Meta's Passthrough API, and 'loft' will revert to the default Home environment.
3.  **Real Spatial Anchors:** Update `NativeXRBridge.requestLoftAnchor()` from a simple log statement to an actual platform anchor request, enabling the user's hand-tracked Sigil casting to pin to the physical room mesh.

## Phase 4: Grimoire Tradition Toggle (Hermetic vs Qliphothic)
Addressing the bug where the Grimoire tab continues to display Qliphothic text even when the Hermetic tradition is selected.

**Proposed Actions:**
1.  **Schema Update:** Update the `DiscoveredIncantation` interface in `src/types.ts` to support dual-tradition data.
    *   Add `hermeticFormula: string` (True Names / Angelic formulas).
    *   Add `hermeticSphere: string` (Sephirothic equivalents).
2.  **Data Population:** Update `INITIAL_GRIMOIRE_LIBRARY` in `src/utils/incantationDiscovery.ts` to include the Hermetic equivalents for all baseline spells.
3.  **UI Conditional Logic:** In `GrimoirePanel.tsx`, consume the current tradition via `useTradition()`. 
    *   If `tradition === 'hermetic'`, display `hermeticFormula` and `hermeticSphere`.
    *   If `tradition === 'chaos'`, display `barbarousFormula` and `focusQlipha`. 
    *   Update the synthesized/AI generation prompts to enforce the selected tradition when creating new formulas.

---
**Next Steps:** Let me know your decision regarding Phase 1 (Meta OS vs Jetpack XR), and whether this plan aligns with your vision. Once confirmed, I will begin executing the code changes.
