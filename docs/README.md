# Aetheris

<img width="3840" height="2160" alt="Aetheris_01" src="https://github.com/user-attachments/assets/fe1e5e7c-bbfd-4892-90d8-8cdc6e1c0ac6" />
*A grimoire for the modern seeker — built on real sky, not guesswork.*

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
