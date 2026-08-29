# Aetheris
Aetheris — a native Horizon OS XR app blending astrology, tarot, and meditation with a rendered solar system view

<img width="3840" height="2160" alt="Aetheris_01" src="https://github.com/user-attachments/assets/fe1e5e7c-bbfd-4892-90d8-8cdc6e1c0ac6" />
*A grimoire for the modern seeker — built on real sky, not guesswork.*

Written by: Michael Kelley
https://www.linkedin.com/in/michael-kelley-ab1a49402/

Released works:
MetaOS: To be announced
Amazon: https://www.amazon.com/3D-Asset-Development-Biochemical-Animations-ebook/dp/B0FQ18M57G/ref=sr_1_1?crid=3JZDSD5H62I2I&dib=eyJ2IjoiMSJ9.kHIo_jwefvQO9E_Dlg49zg.qrVdF4O_YkAveRA2wUT4Ts-HYFkJCSTBBSmwiM-ajmU&dib_tag=se&keywords=3d+asset+development+for+biochemical+animations&qid=1787769324&sprefix=3d+asset+development+for+biochemical+animation%2Caps%2C125&sr=8-1

Token efficiency plan outlined in AGENTS.md
ARCHITECTURE.md for a basic overview of the design behind the application.
ASSET_MANIFEST.md for .gitignored files stored locally.

### Section for recruiters
## Why it's technically interesting

**Real orbital mechanics, not a lookup table.** `SolarSystemLogic.kt` solves Kepler's equation
(Newton-Raphson iteration on eccentric anomaly) per planet, per frame, from standard Keplerian
orbital elements — semi-major axis, eccentricity, inclination, longitude of ascending node,
argument of perihelion, mean longitude, and daily motion. Positions are transformed from the
orbital plane into a shared ecliptic frame via the standard rotation matrix (Ω, i, ω), not
approximated.

**Distance and scale are compressed, but the math underneath isn't.** True 1:1 AU distances would
either collapse the inner planets into a single point or scatter the outer planets meters outside
a viewable panel. `orbitalDistanceScale()` applies a square-root compression beyond 1 AU so the
scene stays legible while ecliptic longitude — and therefore aspect calculations — are computed
before any compression is applied.

**Aspect detection from first principles.** Rather than hardcoding aspect tables, `calculateAspects()`
derives conjunctions/sextiles/squares/trines/oppositions directly from the angular difference
between each pair of planets' ecliptic longitudes, with an 8° orb of tolerance — the same
approach a human astrologer would use with an ephemeris.

**Panel-based, not immersive — deliberately.** `MainActivity` is a `ComponentActivity`, not a
Jetpack XR/Spatial activity. Both `MainActivity` and `CelestialActivity` register under
`com.oculus.intent.category.2D` in the manifest and are marked `resizeableActivity="true"` with
`com.oculus.vrshell.supports_free_resizing`, so they behave like a window in Meta's Loft — the same
category of experience as the Instagram or browser panel — rather than launching a full VR
environment. That was a deliberate reversion after an earlier immersive-mode pass broke enough
platform behavior to not be worth it.

**Two windows, two activities, one time base.** The Grimoire HUD (`MainActivity`) and the "window
into space" solar system view (`CelestialActivity`) are separate Activities with separate task
affinities, each independently resizeable in the Loft, but both driven from the same
`getDaysSinceJ2000()` time source so the sky stays in agreement with itself across windows.

## Architecture overview

```
MainActivity          → Entry point. Hosts the Grimoire WebView HUD (left panel).
                         Requests RECORD_AUDIO / ACCESS_COARSE_LOCATION, then opens the
                         celestial window as a second task.
CelestialActivity      → The "window into space" pane. Currently rendering via
                         CelestialRenderer2D for alpha stability; the Filament/TextureView-based
                         3D renderer (CelestialRenderer) is implemented but disabled pending
                         further resize-handling work (see Status below).
SolarSystemLogic.kt    → Pure logic layer: Kepler solving, coordinate transforms, distance/size
                         scaling, and aspect detection. No Android/rendering dependencies —
                         portable and independently testable.
MainViewModel.kt       → App state: current tab, natal data, tarot draws, meditations, and a
                         continuous per-frame time-drift loop that eases the simulated date
                         toward a target rather than snapping, so transitions read as motion
                         through time rather than a jump cut.
```

## Build & run

- **Platform:** Meta Horizon OS, `minSdkVersion`/`targetSdkVersion` 69 (Horizon SDK), OpenGL ES 3.1
- **Supported devices:** Quest 2, Quest Pro, Quest 3, Quest 3S
- **Toolchain:** IntelliJ IDEA / Android Studio, Kotlin + Jetpack Compose, Google Filament for the
  3D rendering path
- **Permissions requested at first launch:** `ACCESS_COARSE_LOCATION`, `RECORD_AUDIO`,
  `MODIFY_AUDIO_SETTINGS`

```bash
./gradlew assembleRelease
adb install -r app/build/outputs/apk/release/app-release.apk
```

## Status / roadmap

This is an **alpha build** — some things are intentionally unfinished:

- The 3D window-into-space renderer (Filament + TextureView) is implemented but currently disabled
  in favor of a 2D fallback for launch stability; re-enabling it is next.
- Combat/training telemetry (visible in `MainViewModel`) exists in the codebase from an earlier
  scope but is planned to ship disabled by default via a build flag, not removed — it may return
  as a separate mode post-alpha.
- Current planet models are placeholders; a pass to 1k-textured models is planned for later in
  alpha.
- Planned: a sigil-drawing feature in the grimoire tab using the same window-pane rendering
  approach as the solar system view.

## License / IP

[TODO — see LICENSE and NOTICE files. Code is licensed under [MIT/Apache-2.0]; the Aetheris name,
branding, and original written content (incantations, card interpretations, meditation copy) are
not covered by that license.]

## About the author

U.S. Navy veteran (Mass Communications) and published technical author —
[*3D Asset Development for Biochemical Animations*](https://www.amazon.com/3D-Asset-Development-Biochemical-Animations-ebook/dp/B0FQ18M57G).
Background spanning Unreal Engine, Blender, and hands-on Horizon OS SDK integration.
[LinkedIn — TODO]

### Planned README for MetaOS sales.
## Why this exists

Most "spiritual" apps on the store treat astrology and tarot as decoration — a purple gradient, a
canned horoscope, a card flip animation with no math underneath it. We noticed the gap ourselves
while looking through what's currently offered in wellness on the Meta Horizon store, and it lined
up with something Meta's own developer portal has been reflecting too: real, growing demand for
esoteric and wellness experiences that don't feel like they were built by people who've never opened
a tarot deck or pulled up an ephemeris.

Aetheris is our answer to that. It's built for people who want to go deeper into their own practice
— and who also want the tool underneath that practice to be honest. If we tell you where a planet
is, we mean it's actually there, computed from real orbital mechanics, not looked up from a static
table or faked for effect. We built this with respect for the traditions it draws from, and for the
people using it to understand themselves better.

## What's inside

**Sky & self**
- A full 3D solar system, rendered live and positioned by solving Kepler's equation on-device — no
  server round-trip, no cached positions. All three of Kepler's laws (elliptical orbits, equal
  areas in equal time, and the harmonic law relating period to distance) underlie the model, not
  just the pretty parts.
- Orrery-style scaling: true 1:1 astronomical distances would make most planets invisible specks or
  scatter them meters apart, so distance and planet size are compressed for a scene you can actually
  look at and read, while the underlying math stays accurate.
- A natal mandala built from your own birth data, with planetary aspects (conjunctions, squares,
  trines, sextiles, and more) derived automatically from the current or natal chart — computed
  locally, drawn both in the 2D chart and as lines in the live 3D scene.
- When a new reading is calculated, the chart and the solar system drift toward the new positions
  together rather than snapping — sky and self are meant to stay in agreement.
- A moon phase HUD for at-a-glance lunar tracking.

**Practice & reflection**
- A 78-card tarot library with filtering, and one-, three-, and five-card spreads the app draws and
  interprets with you.
- A box-breathing meditation pacer to bring you into a steady state before a reading or a journal
  entry.
- A journal that's actually yours: written entries stay on your device. It includes an incantation
  and mantra engine to help you put words to what you're working through, along with reflective
  prompts drawn from philosophers and historical figures who thought seriously about the questions
  you're asking.

## Built the way it's described

Everything above runs on-device. Orbital positions, aspects, tarot draws, and your journal are
computed and stored locally rather than shipped off to a server — what you enter stays with you.
The app is native to Meta's platform, and your data is protected using standard Android
device-level storage and security practices.

This is a portfolio piece as much as a product: it's meant to show that a niche, tradition-rooted
audience can be taken seriously without sacrificing technical rigor — real orbital mechanics, a
real rendering pipeline, and a real respect for the practice, all in the same build.

## A note to the community this is for

We didn't set out to explain your practice to you or to flatten it into a gimmick. Aetheris is a
tool — one we hope earns a place next to whatever books, decks, or teachers already guide your
practice, by being accurate where it can be and quiet about the rest. If something in here ever
reads as mocking or hollow, that's a bug, and we want to hear about it.
