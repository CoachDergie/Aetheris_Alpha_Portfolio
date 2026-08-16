import { DailyInvocation } from '../types';

export interface DiscoveredIncantation extends DailyInvocation {
  id: string;
  source: string; // e.g. 'Greek Magical Papyri (PGM)', 'Chaldean Oracles', 'Enochian Clavicle', 'Hermetic Fragment', 'Astrological Synthesis'
  element: 'Fire' | 'Water' | 'Air' | 'Earth' | 'Aether / Void';
  vibrationalToneHz: number;
  tags: string[];
  dateDiscovered: string;
  isCustom?: boolean;
  notes?: string;
}

export const INITIAL_GRIMOIRE_LIBRARY: DiscoveredIncantation[] = [
  {
    id: 'inc_sun_thagirion',
    dayOfWeek: 'Sunday',
    planet: 'Sun / Sorath / Belphegor',
    barbarousFormula: 'IAO SABAO ARBATHIAO PHEKRO THERION',
    invocationText: 'I invoke the Black Sun within the solar plexus. Let iron will ignite the sinews and harden the bone core.',
    focusQlipha: 'Thagirion (Beauty of the Abyss)',
    martialCorrelation: 'Solar Iron Palm & Concentrated Centerline Strike',
    source: 'PGM IV / Stele of Jeu',
    element: 'Fire',
    vibrationalToneHz: 528,
    tags: ['solar', 'iron palm', 'willpower', 'thagirion'],
    dateDiscovered: '2026-08-15',
  },
  {
    id: 'inc_moon_gamaliel',
    dayOfWeek: 'Monday',
    planet: 'Moon / Lilith / Gamaliel',
    barbarousFormula: 'LILITH ABISHA NAAMAH GAMALIEL TULPHAT',
    invocationText: 'O Nocturnal Tide of the Silver Horn, wash over the nervous system. Transform instinctual perception into razor fluidity.',
    focusQlipha: 'Gamaliel (Astral Dream Weaver)',
    martialCorrelation: 'Fluid Evasion, Baguazhang Circle Walking & Rooting',
    source: 'Sepher Ha-Shedim / Nightside Papyri',
    element: 'Water',
    vibrationalToneHz: 432,
    tags: ['lunar', 'fluidity', 'evasion', 'gamaliel'],
    dateDiscovered: '2026-08-15',
  },
  {
    id: 'inc_mars_golachab',
    dayOfWeek: 'Tuesday',
    planet: 'Mars / Asmodeus / Golachab',
    barbarousFormula: 'ZAZAS ZAZAS NASATANADA ZAZAS GOLACHAB BARBARON',
    invocationText: 'Wrath of the Red Sphere, charge the 6-foot zinc bar with crushing explosive drive. No obstacle shall withstand this momentum.',
    focusQlipha: 'Golachab (Flaming Destruction)',
    martialCorrelation: 'Explosive Thrusts, Heavy Barbell Cleans & Penetrating Punches',
    source: 'Theban Martial Grimoire',
    element: 'Fire',
    vibrationalToneHz: 396,
    tags: ['martial', 'barbell', 'striking', 'golachab'],
    dateDiscovered: '2026-08-15',
  },
  {
    id: 'inc_mercury_samael',
    dayOfWeek: 'Wednesday',
    planet: 'Mercury / Samael / Adrammelech',
    barbarousFormula: 'TAPHATHARATH SAMAEL OROBAS THEUT BARUCH',
    invocationText: 'Mercurial venom and rapid neural fire, sharpen hand trajectory and accelerate recovery return speed.',
    focusQlipha: 'Samael (Poison of Cunning Insight)',
    martialCorrelation: 'Lightning Chain Punches & Instant Telemetric Recoil',
    source: 'Hermetic Corpus / Kyranides',
    element: 'Air',
    vibrationalToneHz: 741,
    tags: ['speed', 'recoil', 'neural', 'samael'],
    dateDiscovered: '2026-08-15',
  },
  {
    id: 'inc_jupiter_ghaagsheblah',
    dayOfWeek: 'Thursday',
    planet: 'Jupiter / Astaroth / Gha\'agsheblah',
    barbarousFormula: 'GHAAGSHEBLAH ASTAROTH BELIAL CHESED-TZADKIK',
    invocationText: 'Sovereign majesty and unstoppable mass, enlarge the structural kinetic envelope. My posture commands the cardinal quarters.',
    focusQlipha: 'Gha\'agsheblah (Devourer of Boundaries)',
    martialCorrelation: 'Heavy Horse Stance (Ma Bu) & Barbell Overhead Holds',
    source: 'Chaldean Oracles Fragment 42',
    element: 'Water',
    vibrationalToneHz: 639,
    tags: ['mass', 'horse stance', 'sovereign', 'expansion'],
    dateDiscovered: '2026-08-15',
  },
  {
    id: 'inc_venus_aarab',
    dayOfWeek: 'Friday',
    planet: 'Venus / Baal / A\'arab Zaraq',
    barbarousFormula: 'ASTARTE BAAL-ZEPHON AARAB ZARAQ NEHESCH',
    invocationText: 'Primal harmony and serpentine sinew tension, weave the fascia into unbreakable organic armor.',
    focusQlipha: 'A\'arab Zaraq (Ravens of Dispersion)',
    martialCorrelation: 'Silk Reeling Qi-Gong (Chan Si Gong) & Joint Fortification',
    source: 'Phoenician Alchemical Tablets',
    element: 'Earth',
    vibrationalToneHz: 417,
    tags: ['silk reeling', 'fascia', 'serpentine', 'tension'],
    dateDiscovered: '2026-08-15',
  },
  {
    id: 'inc_saturn_satariel',
    dayOfWeek: 'Saturday',
    planet: 'Saturn / Lucifuge / Satariel',
    barbarousFormula: 'AGIOS O KAPH SATARIEL CASSIEL MORTE ZODAC',
    invocationText: 'Ancient stone of the abyss and solemn threshold, temper the skeletal structure like carbonized titanium.',
    focusQlipha: 'Satariel (The Deep Concealer)',
    martialCorrelation: 'Iron Shirt (Tie Bu Shan) & 6-ft Barbell Slow Isometric Lockouts',
    source: 'Grimorium Verum / Saturnine Codex',
    element: 'Earth',
    vibrationalToneHz: 285,
    tags: ['iron shirt', 'skeletal', 'isometric', 'satariel'],
    dateDiscovered: '2026-08-15',
  },
  {
    id: 'inc_uranus_ghagiel',
    dayOfWeek: 'Discovered',
    planet: 'Uranus / Beelzebub / Ghagiel',
    barbarousFormula: 'ATHANATOS KHERUBIM GHAGIEL BOLCHOSETH PHORBA',
    invocationText: 'Cosmic lightning shatter the boundary of conventional reaction time. Flash strike beyond conscious anticipation.',
    focusQlipha: 'Ghagiel (The Chaotic Instigator)',
    martialCorrelation: 'Supersonic Jab & Unorthodox Kinetic Angles',
    source: 'Abyssal Transmission 09',
    element: 'Air',
    vibrationalToneHz: 852,
    tags: ['lightning', 'reflexes', 'unorthodox', 'ghagiel'],
    dateDiscovered: '2026-08-15',
  },
  {
    id: 'inc_pluto_choronzon',
    dayOfWeek: 'Discovered',
    planet: 'Pluto / Choronzon / Daath',
    barbarousFormula: 'CHORONZON 333 NOX ARARITA SHITAN TEMPLI-O-H-P',
    invocationText: 'Open the gate of the void at the base of the spine. Kundalini fire surge upwards through every vertebra.',
    focusQlipha: 'Daath (The Threshold of the Abyss)',
    martialCorrelation: 'Spinal Whipping Power (Fa Jin) & Ground Kinetic Root',
    source: 'Liber 418 / Enochian Aethyrs',
    element: 'Aether / Void',
    vibrationalToneHz: 963,
    tags: ['fa jin', 'kundalini', 'abyss', 'spine'],
    dateDiscovered: '2026-08-15',
  }
];

export const DISCOVERY_CATALOG: Omit<DiscoveredIncantation, 'id' | 'dateDiscovered'>[] = [
  {
    dayOfWeek: 'Discovered',
    planet: 'Mars-Saturn / Golachab-Satariel',
    barbarousFormula: 'BARBATHIAS ARAPHAXAT CHARKHARODON OROKOTH',
    invocationText: 'Unite the crushing gravity of Saturn with the incendiary fury of Mars. The zinc barbell becomes an extension of dense gravitational mass.',
    focusQlipha: 'Golachab-Satariel Cross',
    martialCorrelation: 'Heavy Zinc Barbell Overhead Lockout & Ground Smash',
    source: 'Greek Magical Papyri (PGM VII. 969-79)',
    element: 'Fire',
    vibrationalToneHz: 360,
    tags: ['heavy load', 'crushing', 'gravity', 'mars-saturn'],
  },
  {
    dayOfWeek: 'Discovered',
    planet: 'Sun-Mars / Thagirion-Golachab',
    barbarousFormula: 'SEMESILAM ABRASAX BAINCHOOOCH PHNOUBIS',
    invocationText: 'Crown the solar center with triumphant combat flame. Every cell in the muscular envelope vibrates with impenetrable solar armor.',
    focusQlipha: 'Thagirion Prime',
    martialCorrelation: 'Golden Bell Armor (Jin Zhong Zhao) & Explosive Fist',
    source: 'Gnostic Abrasax Gem Formulae',
    element: 'Fire',
    vibrationalToneHz: 528,
    tags: ['abrasax', 'golden bell', 'solar armor', 'fa jin'],
  },
  {
    dayOfWeek: 'Discovered',
    planet: 'Mercury-Uranus / Samael-Ghagiel',
    barbarousFormula: 'TETRAGRAMMATON ANAPHAXETON PHENEX BIFRONS',
    invocationText: 'Split the second into micro-fractions. Accelerate sensory processing so the opponent strikes move in perceived slow-motion.',
    focusQlipha: 'Samael Vortex',
    martialCorrelation: 'Hyper-Reflex Interception & Lightning Wing Chun Trapping',
    source: 'Clavicula Salomonis / Goetic Crypt',
    element: 'Air',
    vibrationalToneHz: 741,
    tags: ['micro-timing', 'speed', 'trapping', 'interception'],
  },
  {
    dayOfWeek: 'Discovered',
    planet: 'Neptune-Moon / Thaumiel-Gamaliel',
    barbarousFormula: 'LEVIATHAN TANIN\'IVER RAHAB TIAMAT THELI',
    invocationText: 'Submerge consciousness into the primordial abyssal ocean. Flow around kinetic strikes like water carving through solid granite.',
    focusQlipha: 'Thaumiel Oceanic Rift',
    martialCorrelation: 'Water Style Dissolving & Dragon Coiling Qi-Gong',
    source: 'Babylonian Enuma Elish Tablets',
    element: 'Water',
    vibrationalToneHz: 432,
    tags: ['leviathan', 'oceanic', 'water style', 'dissolving'],
  },
  {
    dayOfWeek: 'Discovered',
    planet: 'Venus-Earth / A\'arab-Lilith',
    barbarousFormula: 'ERESHKIGAL ALLATU ISHTAR KISAR AGARTHI',
    invocationText: 'Draw the deep terrestrial core pulse upwards through the soles of the feet. Unshakable rooting down to the mantle of the earth.',
    focusQlipha: 'Nahemoth / Earth Core Gate',
    martialCorrelation: 'Rooted Rooting (Zhan Zhuang) & Earth Power Generation',
    source: 'Sumerian Descent Tablets',
    element: 'Earth',
    vibrationalToneHz: 174,
    tags: ['zhan zhuang', 'earth root', 'sumerian', 'soles'],
  },
  {
    dayOfWeek: 'Discovered',
    planet: 'Sirius / Sothis Galactic Vector',
    barbarousFormula: 'ANUBIS HERU-UR TYPHON SETH APOCALYPTOS',
    invocationText: 'Align the crown antenna with the binary pulse of Sirius. Transcend bodily fatigue; the spirit commands the anatomical machine.',
    focusQlipha: 'Sothian Stellar Vortex',
    martialCorrelation: 'Iron Body Conditioning & Continuous 100-Strike Flurry',
    source: 'Hermetic Book of the Dead (Pert Em Hru)',
    element: 'Aether / Void',
    vibrationalToneHz: 963,
    tags: ['sirius', 'endurance', 'flurry', 'anubis'],
  }
];

/** Synthesize a new discovery based on query keywords, planets, and user intentions */
export function synthesizeDiscoveryFromQuery(query: string): DiscoveredIncantation {
  const q = query.toLowerCase();

  const matched = DISCOVERY_CATALOG.find((item) =>
    item.tags.some((t) => q.includes(t)) ||
    q.includes(item.element.toLowerCase()) ||
    q.includes(item.planet.toLowerCase().slice(0, 4))
  );

  const base = matched || DISCOVERY_CATALOG[Math.floor(Math.random() * DISCOVERY_CATALOG.length)];
  const id = `discovered_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const dateStr = new Date().toISOString().split('T')[0];

  return {
    ...base,
    id,
    dateDiscovered: dateStr,
    notes: `Discovered during query: "${query}"`,
  };
}
