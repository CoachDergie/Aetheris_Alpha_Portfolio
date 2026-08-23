# Asset Manifest

_These files are intentionally gitignored under `/public` — both to keep IP out of GitHub history
permanently and to avoid push/pull issues with large binaries. Gitignore only affects `git`; Gradle
still needs `/public` registered as an assets source set to package these into the build (see
`ARCHITECTURE.md` → "Build & asset packaging"). This manifest exists so contributors and AI tooling
(e.g. Google AI Studio) can understand what assets the project expects without the binaries needing
to be pushed/pulled through git._

**Only the section between the GENERATED markers below is touched by `scripts/gen-asset-manifest.sh`.
Everything else in this file is hand-maintained and safe to edit — regenerating will not overwrite it.**

## Source directories

| Directory (on disk) | Registered via | Maps to in APK |
|---|---|---|
| `public/solarsystem/models/` | `assets.srcDirs("../public/solarsystem", ...)` in `app/build.gradle.kts` | `assets/models/` |
| `public/tarot/` | `assets.srcDirs(..., "../public/tarot")` in `app/build.gradle.kts` | `assets/` (flat — no `tarot/` prefix unless the folder itself has a subdirectory) |

Gradle merges the *contents* of each registered srcDir into `assets/` — it does not prefix the
srcDir's own name. See `ARCHITECTURE.md` for the full gradle snippet and APK verification command.

## `public/solarsystem/models/` — expected files

Referenced by `SolarSystemLogic.PLANET_DATA` keys — filenames must match exactly
(`SpatialGltfModelSource.fromPath(Paths.get("models/$planetName.glb"))` in `MainActivity.kt`).

| File | Purpose | Expected scale/pivot convention |
|---|---|---|
| `sun.glb` | Central body, rendered at origin | Object origin at mesh center |
| `mercury.glb` | Planet | Object origin at mesh center |
| `venus.glb` | Planet | Object origin at mesh center |
| `earth.glb` | Planet | Object origin at mesh center |
| `mars.glb` | Planet | Object origin at mesh center |
| `jupiter.glb` | Planet | Object origin at mesh center |
| `saturn.glb` | Planet (+ ring geometry if modeled) | Object origin at mesh center |
| `uranus.glb` | Planet | Object origin at mesh center |
| `neptune.glb` | Planet | Object origin at mesh center |
| `pluto.glb` | Dwarf planet | Object origin at mesh center |
| `earth_moon.glb` | Moon, positioned relative to Earth at runtime | Object origin at mesh center |

`SubspaceModifier.size()` scales each model to fit its layout bounding box regardless of the mesh's
authored scale, so absolute Blender export units are not critical — but a sane pivot (origin at body
center, not scene origin) is, since positions are set via `.offset()` at runtime.

_Note: this table assumes the Jetpack XR native path currently in `MainActivity.kt`. Per
`ARCHITECTURE.md`'s platform-target flag, if the native layer moves to Meta's SDK, confirm whether
the loading mechanism and expected asset layout stay the same._

## `public/tarot/` — expected files

_(Fill in once the tarot asset list is finalized — card art, card-back texture, etc.)_

## Verifying an asset isn't a stub

A truncated/placeholder glTF can pass a basic existence check but contain no scene data. Sanity-check
size before assuming a load failure is a code bug:

```bash
ls -la public/solarsystem/models/*.glb
```

A real exported planet mesh should be at minimum tens of KB; anything under ~1KB is almost certainly
an empty stub, not a model.

<!-- BEGIN GENERATED: scripts/gen-asset-manifest.sh writes only between these two markers -->

_Auto-generated 2026-08-23T18:35:31Z. Do not edit this section by hand —_
_re-run `scripts/gen-asset-manifest.sh` instead. Everything outside these markers is preserved._

### `public/solarsystem/models`

| File | Size | SHA-256 | Last Modified |
|---|---|---|---|
| `earth.glb` | 1.3M | `e62cbb580821…` | 2026-08-23 |
| `earth_moon.glb` | 1.4M | `a302ea91549b…` | 2026-08-23 |
| `jupiter.glb` | 11M | `8edc4e9b88b7…` | 2026-08-23 |
| `mars.glb` | 3.9M | `0d27fc65fe3e…` | 2026-08-23 |
| `mercury.glb` | 3.4M | `b51c6a12f7a1…` | 2026-08-23 |
| `neptune.glb` | 1.1M | `46615ec33361…` | 2026-08-23 |
| `pluto.glb` | 6.7M | `9915e6874ff7…` | 2026-08-23 |
| `saturn.glb` | 11M | `b27d26417d1c…` | 2026-08-23 |
| `sun.glb` | 2.1M | `5b17f3d40ca7…` | 2026-08-23 |
| `uranus.glb` | 940K | `9272e57cb576…` | 2026-08-23 |
| `venus.glb` | 1.4M | `9a68184171c9…` | 2026-08-23 |

### `public/tarot`

| File | Size | SHA-256 | Last Modified |
|---|---|---|---|
| `00-TheFool.png` | 324K | `6390bdc08c0c…` | 2020-08-04 |
| `01-TheMagician.png` | 284K | `b2685cc4591e…` | 2020-08-04 |
| `02-TheHighPriestess.png` | 332K | `92db7b0fc974…` | 2020-08-04 |
| `03-TheEmpress.png` | 328K | `a4293ecf234a…` | 2020-08-04 |
| `04-TheEmperor.png` | 316K | `f4e651f950bf…` | 2020-08-04 |
| `05-TheHierophant.png` | 308K | `bd3f7a9b6408…` | 2020-08-04 |
| `06-TheLovers.png` | 332K | `1eaf94a82a6e…` | 2020-08-04 |
| `07-TheChariot.png` | 296K | `83c5bc4e1066…` | 2020-08-04 |
| `08-Strength.png` | 252K | `d988b9f83c79…` | 2020-08-04 |
| `09-TheHermit.png` | 160K | `724030230829…` | 2020-08-04 |
| `10-WheelOfFortune.png` | 308K | `62507acae958…` | 2020-08-04 |
| `11-Justice.png` | 300K | `1ba84ea4ab8c…` | 2020-08-04 |
| `12-TheHangedMan.png` | 244K | `f276f707d1e6…` | 2020-08-04 |
| `13-Death.png` | 300K | `9773b204550f…` | 2020-08-04 |
| `14-Temperance.png` | 308K | `8b6b17ebf841…` | 2020-08-04 |
| `15-TheDevil.png` | 280K | `ac9f2007edda…` | 2020-08-04 |
| `16-TheTower.png` | 268K | `c0316f89c03d…` | 2020-08-04 |
| `17-TheStar.png` | 304K | `996e587ce49a…` | 2020-08-04 |
| `18-TheMoon.png` | 300K | `26dd877210ad…` | 2020-08-04 |
| `19-TheSun.png` | 364K | `9b103a89ea91…` | 2020-08-04 |
| `20-Judgement.png` | 308K | `52d022e5937b…` | 2020-08-04 |
| `21-TheWorld.png` | 328K | `9fb445164dfe…` | 2020-08-04 |
| `CardBacks.png` | 48K | `8099859cd731…` | 2020-08-11 |
| `Cups01.png` | 256K | `1ba114a99909…` | 2020-08-04 |
| `Cups02.png` | 284K | `e43111dcc4f0…` | 2020-08-04 |
| `Cups03.png` | 308K | `6b28eedcffd5…` | 2020-08-04 |
| `Cups04.png` | 260K | `9fc6a6a147bd…` | 2020-08-04 |
| `Cups05.png` | 164K | `d5f269b376bb…` | 2020-08-04 |
| `Cups06.png` | 340K | `a18afd4e9353…` | 2020-08-04 |
| `Cups07.png` | 292K | `fc5d122bdf6a…` | 2020-08-04 |
| `Cups08.png` | 236K | `108f16b72343…` | 2020-08-04 |
| `Cups09.png` | 268K | `beaf0a530e7a…` | 2020-08-04 |
| `Cups10.png` | 304K | `f9be5023cfbe…` | 2020-08-04 |
| `Cups11.png` | 248K | `db5d9723c04c…` | 2020-08-04 |
| `Cups12.png` | 276K | `6dcf00c63d09…` | 2020-08-04 |
| `Cups13.png` | 288K | `2225c4c34302…` | 2020-08-04 |
| `Cups14.png` | 268K | `3913de1b92eb…` | 2020-08-04 |
| `Pentacles01.png` | 224K | `ee726dd47b6e…` | 2020-08-04 |
| `Pentacles02.png` | 284K | `242fc6e3a891…` | 2020-08-04 |
| `Pentacles03.png` | 260K | `a0aabc2dd039…` | 2020-08-04 |
| `Pentacles04.png` | 204K | `eae2734d711a…` | 2020-08-04 |
| `Pentacles05.png` | 312K | `9be883c342e8…` | 2020-08-04 |
| `Pentacles06.png` | 276K | `d01938029cdb…` | 2020-08-04 |
| `Pentacles07.png` | 280K | `662bf83c9cb2…` | 2020-08-04 |
| `Pentacles08.png` | 256K | `438b41a741e8…` | 2020-08-04 |
| `Pentacles09.png` | 308K | `0aab3cdfb7b5…` | 2020-08-04 |
| `Pentacles10.png` | 344K | `eda3c1111cc4…` | 2020-08-04 |
| `Pentacles11.png` | 236K | `293abb94fa9f…` | 2020-08-04 |
| `Pentacles12.png` | 244K | `82abebc99ab6…` | 2020-08-04 |
| `Pentacles13.png` | 344K | `647b40da3ad6…` | 2020-08-04 |
| `Pentacles14.png` | 304K | `a066b17995a2…` | 2020-08-04 |
| `Swords01.png` | 220K | `0e5d19199224…` | 2020-08-04 |
| `Swords02.png` | 200K | `a46795d2971a…` | 2020-08-04 |
| `Swords03.png` | 200K | `76a404ebbade…` | 2020-08-04 |
| `Swords04.png` | 232K | `b29222589a59…` | 2020-08-04 |
| `Swords05.png` | 292K | `51ff9ce465f9…` | 2020-08-04 |
| `Swords06.png` | 232K | `254f236f7fb6…` | 2020-08-04 |
| `Swords07.png` | 248K | `9f1d812d40c2…` | 2020-08-04 |
| `Swords08.png` | 252K | `0fd6e51db183…` | 2020-08-04 |
| `Swords09.png` | 264K | `11ac33c1b443…` | 2020-08-04 |
| `Swords10.png` | 248K | `8b93563df865…` | 2020-08-04 |
| `Swords11.png` | 276K | `d606703af06b…` | 2020-08-04 |
| `Swords12.png` | 296K | `e2058063524a…` | 2020-08-04 |
| `Swords13.png` | 224K | `149687a9d828…` | 2020-08-04 |
| `Swords14.png` | 280K | `f3f1e6fc175a…` | 2020-08-04 |
| `Wands01.png` | 224K | `a29727a0c778…` | 2020-08-04 |
| `Wands02.png` | 220K | `134823b9a9eb…` | 2020-08-04 |
| `Wands03.png` | 292K | `144d4102edd1…` | 2020-08-04 |
| `Wands04.png` | 264K | `6a87ddc59eac…` | 2020-08-04 |
| `Wands05.png` | 292K | `b197cc28b023…` | 2020-08-04 |
| `Wands06.png` | 292K | `fba2c676c228…` | 2020-08-04 |
| `Wands07.png` | 220K | `6338449a0938…` | 2020-08-04 |
| `Wands08.png` | 256K | `ebf9b9f0458e…` | 2020-08-04 |
| `Wands09.png` | 292K | `821b5017f249…` | 2020-08-04 |
| `Wands10.png` | 264K | `9302318e808c…` | 2020-08-04 |
| `Wands11.png` | 276K | `61d8defeed5e…` | 2020-08-04 |
| `Wands12.png` | 316K | `2a7ebfd6edf9…` | 2020-08-04 |
| `Wands13.png` | 324K | `3517b7596a31…` | 2020-08-04 |
| `Wands14.png` | 328K | `daedc4d43711…` | 2020-08-04 |

<!-- END GENERATED -->
