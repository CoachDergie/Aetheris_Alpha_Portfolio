export type TraditionMode = 'qliphothic' | 'hermetic';

const EXACT_REPLACEMENTS: Record<string, string> = {
  // Spheres
  "Thagirion (The Disputers)": "Tiphareth (Beauty & Harmony)",
  "Thagirion (Beauty of the Abyss)": "Tiphareth (Beauty & Harmony)",
  "Thagirion": "Tiphareth",
  "Gamaliel (The Obscene Ones)": "Yesod (Foundation & Reflection)",
  "Gamaliel (Astral Dream Weaver)": "Yesod (Astral Foundation)",
  "Gamaliel": "Yesod",
  "Golachab (The Burning Ones)": "Geburah (Severity & Strength)",
  "Golachab (Flaming Destruction)": "Geburah (Martial Discipline)",
  "Golachab-Satariel Cross": "Geburah-Binah Cross",
  "Golachab": "Geburah",
  "Samael (The Poison of God)": "Hod (Glory & Intellect)",
  "Samael": "Hod",
  "Gha'agsheblah (The Smiters)": "Chesed (Mercy & Expansion)",
  "Gha'agsheblah": "Chesed",
  "A'arab Zaraq (The Ravens of Dispersion)": "Netzach (Victory & Harmony)",
  "A'arab Zaraq": "Netzach",
  "Satariel (The Concealers)": "Binah (Understanding & Form)",
  "Satariel (The Deep Concealer)": "Binah (Understanding & Structure)",
  "Satariel": "Binah",
  "Ghagiel (The Hinderers)": "Chokmah (Wisdom & Awakening)",
  "Ghagiel": "Chokmah",
  "Thaumiel (The Twin Gods)": "Kether (Crown & Unity)",
  "Thaumiel": "Kether",

  "Earth / Nahemoth": "Earth / Malkuth",
  "Nahemoth": "Malkuth",
  "Uranus / Chaos": "Uranus / Chokmah",
  "Chaos": "Chokmah",
  "Pluto / Thaumiel": "Pluto / Daath", // or Kether

  "Daath / The Abyss (Choronzon)": "Daath (The Hidden Knowledge)",
  "Daath (The Threshold of the Abyss)": "Daath (Knowledge & Synthesis)",
  "Daath": "Daath",

  // Entities
  "Belphegor": "Michael",
  "Lilith": "Gabriel",
  "Asmodeus": "Kamael",
  "Adrammelech": "Raphael",
  "Astaroth": "Sachiel",
  "Baal": "Haniel",
  "Lucifuge Rofocale": "Tzaphkiel",
  "Lucifuge": "Tzaphkiel",
  "Beelzebub": "Raziel",
  "Satan & Moloch": "Metatron",
  "Choronzon": "Archangels",
  "Sorath": "Michael",
  "Seere": "Sachiel",
  "Andras": "Kamael",

  // Themes
  "Black Sun / Solar Will": "Radiant Sun / Solar Will",
  "Black Sun": "Solar Light",
  "Lunar Abyss & Astral Tide": "Lunar Intuition & Astral Tide",
  "Lunar Abyss": "Lunar Sphere",
  "Martial Fury & Iron Might": "Martial Courage & Iron Might",
  "Devouring Expansion & Tyranny": "Expansion & Benevolence",
  "Cosmic Entropy & Deep Silence": "Cosmic Structure & Deep Silence",
  "Trans-dimensional Metamorphosis": "Evolutionary Metamorphosis",
  "Primordial Dual Void": "Primordial Divine Unity",
  "Chaotic Lightning & Disruption": "Awakening & Innovation",
  "Carnal Passion & Strife": "Love & Devotion",
  "Venomous Intellect & Cunning": "Intellect & Eloquence",

  "QLIPHOTH": "SEPHIROTH",
  "QLIPHOTHIC": "HERMETIC",
  "Qlipha": "Sephira",
  "qliphoticSphere": "sephirothicSphere",
  "GOETIC / ALCHEMICAL": "ANGELIC / ALCHEMICAL",
  "Goetic": "Angelic"
};

export function translate(text: string | undefined | null, mode: TraditionMode): string {
  if (!text) return '';
  if (mode === 'qliphothic') return text;

  let translated = text;

  // Replace exact phrases from longest to shortest to avoid partial matches overwriting
  const keys = Object.keys(EXACT_REPLACEMENTS).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    translated = translated.split(key).join(EXACT_REPLACEMENTS[key]);
  }

  // Handle case-insensitive general replacements that might not be exact
  translated = translated.replace(/Qliphothic/g, 'Hermetic');
  translated = translated.replace(/qliphothic/g, 'hermetic');
  translated = translated.replace(/Qliphotic/g, 'Hermetic');
  translated = translated.replace(/qliphotic/g, 'hermetic');
  
  return translated;
}
