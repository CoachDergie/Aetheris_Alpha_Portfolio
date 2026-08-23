import { CelestialBody, PlanetaryAspect, LunarPhaseInfo, DailyInvocation } from '../types';

export const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export const QLIPHOTIC_SPHERES: Record<string, { sphere: string; ruler: string; signature: string; element: string }> = {
  Sun: { sphere: 'Thagirion (The Disputers)', ruler: 'Belphegor', signature: 'Black Sun / Solar Will', element: 'Fire' },
  Moon: { sphere: 'Gamaliel (The Obscene Ones)', ruler: 'Lilith', signature: 'Lunar Abyss & Astral Tide', element: 'Water' },
  Mars: { sphere: 'Golachab (The Burning Ones)', ruler: 'Asmodeus', signature: 'Martial Fury & Iron Might', element: 'Fire' },
  Mercury: { sphere: 'Samael (The Poison of God)', ruler: 'Adrammelech', signature: 'Venomous Intellect & Cunning', element: 'Air' },
  Jupiter: { sphere: 'Gha\'agsheblah (The Smiters)', ruler: 'Astaroth', signature: 'Devouring Expansion & Tyranny', element: 'Water' },
  Venus: { sphere: 'A\'arab Zaraq (The Ravens of Dispersion)', ruler: 'Baal', signature: 'Carnal Passion & Strife', element: 'Earth' },
  Saturn: { sphere: 'Satariel (The Concealers)', ruler: 'Lucifuge Rofocale', signature: 'Cosmic Entropy & Deep Silence', element: 'Earth' },
  Uranus: { sphere: 'Ghagiel (The Hinderers)', ruler: 'Beelzebub', signature: 'Chaotic Lightning & Disruption', element: 'Air' },
  Neptune: { sphere: 'Thaumiel (The Twin Gods)', ruler: 'Satan & Moloch', signature: 'Primordial Dual Void', element: 'Water' },
  Pluto: { sphere: 'Daath / The Abyss (Choronzon)', ruler: 'Choronzon', signature: 'Trans-dimensional Metamorphosis', element: 'Ether' },
};

/** Calculate moon phase accurately based on reference epoch */
export function calculateLunarPhase(date: Date = new Date()): LunarPhaseInfo {
  // Known new moon: Jan 6, 2000 18:14 UTC
  const epoch = new Date('2000-01-06T18:14:00Z').getTime();
  const synodicMonth = 29.53058867 * 86400 * 1000;
  const diff = date.getTime() - epoch;
  const phaseDecimal = ((diff % synodicMonth) + synodicMonth) % synodicMonth / synodicMonth;
  const ageDays = phaseDecimal * 29.53058867;
  const illumination = Math.round((0.5 * (1 - Math.cos(2 * Math.PI * phaseDecimal))) * 100);

  let phaseName = 'New Moon';
  let esotericAffinity = 'Void Inception / Shadow Manifestation';

  if (phaseDecimal < 0.03 || phaseDecimal > 0.97) {
    phaseName = 'New Moon (Dark Moon)';
    esotericAffinity = 'Hecate / Lilith Gateways & Deep Subconscious Channeling';
  } else if (phaseDecimal < 0.22) {
    phaseName = 'Waxing Crescent';
    esotericAffinity = 'Initiation of Dark Will & Barbell Iron Imbuing';
  } else if (phaseDecimal < 0.28) {
    phaseName = 'First Quarter';
    esotericAffinity = 'Breakthrough Force & Strike Velocity Conditioning';
  } else if (phaseDecimal < 0.47) {
    phaseName = 'Waxing Gibbous';
    esotericAffinity = 'Amplified Qi Cultivation & Muscle Hyper-density';
  } else if (phaseDecimal < 0.53) {
    phaseName = 'Full Moon';
    esotericAffinity = 'Peak Astral Surge & Absolute Martial Climax';
  } else if (phaseDecimal < 0.72) {
    phaseName = 'Waning Gibbous (Disseminating)';
    esotericAffinity = 'Transmutation of Residual Fatigue to Spirit Power';
  } else if (phaseDecimal < 0.78) {
    phaseName = 'Last Quarter';
    esotericAffinity = 'Decisive Severing of Weakness & Skeletal Alignment';
  } else {
    phaseName = 'Waning Crescent (Balsamic)';
    esotericAffinity = 'Balsamic Dissolution into Primordial Qi Void';
  }

  // Next full and new moon approximations
  const daysToNextNew = (1 - phaseDecimal) * 29.53;
  const daysToNextFull = phaseDecimal < 0.5 ? (0.5 - phaseDecimal) * 29.53 : (1.5 - phaseDecimal) * 29.53;

  const nextNewDate = new Date(date.getTime() + daysToNextNew * 86400000);
  const nextFullDate = new Date(date.getTime() + daysToNextFull * 86400000);

  // Zodiac sign approximate calculation
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const signIndex = Math.floor(((dayOfYear + ageDays * 12) % 365) / 30.4) % 12;

  return {
    phaseName,
    illumination,
    ageDays: Math.round(ageDays * 10) / 10,
    nextFullMoon: nextFullDate.toISOString().split('T')[0],
    nextNewMoon: nextNewDate.toISOString().split('T')[0],
    currentSign: ZODIAC_SIGNS[signIndex] || 'Scorpio',
    esotericAffinity
  };
}

/** Compute Natal and Planetary Bodies based on birth inputs */
export function calculateNatalChart(birthDateStr: string, birthTimeStr: string, lat = 40.71, lon = -74.00): {
  bodies: CelestialBody[];
  aspects: PlanetaryAspect[];
  ascendant: { sign: string; deg: number; min: number };
  midheaven: { sign: string; deg: number; min: number };
} {
  const date = new Date(`${birthDateStr}T${birthTimeStr || '12:00'}:00Z`);
  const year = date.getUTCFullYear() || 1990;
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate() || 1;
  const hour = date.getUTCHours() + date.getUTCMinutes() / 60;

  // Pseudo-astronomical calculation for deterministic accurate natal rendering
  const seed = (year * 365.25 + month * 30.6 + day + hour / 24 + lat * 0.05 + lon * 0.02);

  const planetConfigs = [
    { name: 'Sun', symbol: '☉', speed: 0.9856, offset: 280, archetype: 'Radiant Solar Center / Inner Daemon' },
    { name: 'Moon', symbol: '☽', speed: 13.176, offset: 40, archetype: 'Subconscious Abyss / Nocturnal Currents' },
    { name: 'Mars', symbol: '♂', speed: 0.524, offset: 120, archetype: 'Martial Strike Vector / Raw Kinetic Drive' },
    { name: 'Mercury', symbol: '☿', speed: 1.6, offset: 200, archetype: 'Cunning Intelligence / Neural Transmission' },
    { name: 'Jupiter', symbol: '♃', speed: 0.083, offset: 310, archetype: 'Devouring Expansion / Astral Dominance' },
    { name: 'Venus', symbol: '♀', speed: 1.2, offset: 15, archetype: 'Sensual Magnetism / Alchemical Binding' },
    { name: 'Saturn', symbol: '♄', speed: 0.033, offset: 180, archetype: 'Iron Discipline / Heavy Skeletal Boundary' },
    { name: 'Uranus', symbol: '♅', speed: 0.011, offset: 45, archetype: 'Lightning Blast / Sudden Biomechanical Shift' },
    { name: 'Neptune', symbol: '♆', speed: 0.006, offset: 290, archetype: 'Dissolving Mist / Limitless Astral Tide' },
    { name: 'Pluto', symbol: '♇', speed: 0.004, offset: 215, archetype: 'Chthonic Transmutation / Kundalini Undercurrent' },
  ];

  const bodies: CelestialBody[] = planetConfigs.map((p, idx) => {
    const rawDeg = ((p.offset + seed * p.speed + idx * 29.3) % 360 + 360) % 360;
    const signIndex = Math.floor(rawDeg / 30);
    const degreeInSign = Math.floor(rawDeg % 30);
    const minute = Math.floor(((rawDeg % 30) - degreeInSign) * 60);
    const house = ((Math.floor(rawDeg / 30) + 1 + idx) % 12) + 1;
    const qlData = QLIPHOTIC_SPHERES[p.name];

    return {
      name: p.name,
      symbol: p.symbol,
      sign: ZODIAC_SIGNS[signIndex],
      degree: degreeInSign,
      minute,
      house,
      archetype: p.archetype,
      qliphoticSphere: qlData?.sphere || 'Qliphotic Void',
      darkSignature: qlData?.signature || 'Cosmic Resonance',
      isRetrograde: (idx % 3 === 0 && p.name !== 'Sun' && p.name !== 'Moon')
    };
  });

  // Calculate Ascendant and Midheaven
  const ascDeg = ((seed * 1.05 + lat + hour * 15) % 360 + 360) % 360;
  const mcDeg = ((seed * 0.98 + lon + hour * 15 + 90) % 360 + 360) % 360;

  const ascSignIdx = Math.floor(ascDeg / 30);
  const ascendant = {
    sign: ZODIAC_SIGNS[ascSignIdx],
    deg: Math.floor(ascDeg % 30),
    min: Math.floor((ascDeg % 1) * 60)
  };

  const mcSignIdx = Math.floor(mcDeg / 30);
  const midheaven = {
    sign: ZODIAC_SIGNS[mcSignIdx],
    deg: Math.floor(mcDeg % 30),
    min: Math.floor((mcDeg % 1) * 60)
  };

  // Compute aspects between planets
  const aspects: PlanetaryAspect[] = [];
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const b1 = bodies[i];
      const b2 = bodies[j];
      const deg1 = (ZODIAC_SIGNS.indexOf(b1.sign) * 30) + b1.degree;
      const deg2 = (ZODIAC_SIGNS.indexOf(b2.sign) * 30) + b2.degree;
      let diff = Math.abs(deg1 - deg2);
      if (diff > 180) diff = 360 - diff;

      // Aspect checks
      if (Math.abs(diff - 0) <= 8) {
        aspects.push({
          planet1: b1.name,
          planet2: b2.name,
          aspectType: 'Conjunction',
          orb: Math.round(Math.abs(diff - 0) * 10) / 10,
          intensity: 'Extreme',
          esotericMeaning: `${b1.name} fused with ${b2.name}: Concentrated occult kinetic vortex.`
        });
      } else if (Math.abs(diff - 90) <= 7) {
        aspects.push({
          planet1: b1.name,
          planet2: b2.name,
          aspectType: 'Square',
          orb: Math.round(Math.abs(diff - 90) * 10) / 10,
          intensity: 'High',
          esotericMeaning: `${b1.name} Square ${b2.name}: High tension frictional friction powering raw martial strike leverage.`
        });
      } else if (Math.abs(diff - 180) <= 8) {
        aspects.push({
          planet1: b1.name,
          planet2: b2.name,
          aspectType: 'Opposition',
          orb: Math.round(Math.abs(diff - 180) * 10) / 10,
          intensity: 'High',
          esotericMeaning: `${b1.name} Opposing ${b2.name}: Polarized dual current demanding iron discipline to balance.`
        });
      } else if (Math.abs(diff - 120) <= 6) {
        aspects.push({
          planet1: b1.name,
          planet2: b2.name,
          aspectType: 'Trine',
          orb: Math.round(Math.abs(diff - 120) * 10) / 10,
          intensity: 'Moderate',
          esotericMeaning: `${b1.name} Trine ${b2.name}: Unhindered flow of internal Qi and instinctual timing.`
        });
      } else if (Math.abs(diff - 60) <= 4) {
        aspects.push({
          planet1: b1.name,
          planet2: b2.name,
          aspectType: 'Sextile',
          orb: Math.round(Math.abs(diff - 60) * 10) / 10,
          intensity: 'Subtle',
          esotericMeaning: `${b1.name} Sextile ${b2.name}: Tactical opportunity and neuromuscular synchronization.`
        });
      }
    }
  }

  return { bodies, aspects, ascendant, midheaven };
}

export const DAILY_INVOCATIONS: DailyInvocation[] = [
  {
    dayOfWeek: 'Sunday',
    planet: 'Sun / Sorath / Belphegor',
    barbarousFormula: 'IAO SABAO ARBATHIAO PHEKRO THERION',
    invocationText: 'I invoke the Black Sun within the solar plexus. Let iron will ignite the sinews and harden the bone core.',
    focusQlipha: 'Thagirion (Beauty of the Abyss)',
    hermeticFormula: 'YHVH ELOAH V\'DAAT',
    hermeticSphere: 'Tiphereth (Beauty)',
    martialCorrelation: 'Solar Iron Palm & Concentrated Centerline Strike'
  },
  {
    dayOfWeek: 'Monday',
    planet: 'Moon / Lilith / Gamaliel',
    barbarousFormula: 'LILITH ABISHA NAAMAH GAMALIEL TULPHAT',
    invocationText: 'O Nocturnal Tide of the Silver Horn, wash over the nervous system. Transform instinctual perception into razor fluidity.',
    focusQlipha: 'Gamaliel (Astral Dream Weaver)',
    hermeticFormula: 'SHADDAI EL CHAI',
    hermeticSphere: 'Yesod (Foundation)',
    martialCorrelation: 'Fluid Evasion, Baguazhang Circle Walking & Rooting'
  },
  {
    dayOfWeek: 'Tuesday',
    planet: 'Mars / Asmodeus / Golachab',
    barbarousFormula: 'ZAZAS ZAZAS NASATANADA ZAZAS GOLACHAB BARBARON',
    invocationText: 'Wrath of the Red Sphere, charge the 6-foot zinc bar with crushing explosive drive. No obstacle shall withstand this momentum.',
    focusQlipha: 'Golachab (Flaming Destruction)',
    hermeticFormula: 'ELOHIM GIBOR',
    hermeticSphere: 'Geburah (Severity)',
    martialCorrelation: 'Explosive Thrusts, Heavy Barbell Cleans & Penetrating Punches'
  },
  {
    dayOfWeek: 'Wednesday',
    planet: 'Mercury / Samael / Adrammelech',
    barbarousFormula: 'TAPHATHARATH SAMAEL OROBAS THEUT BARUCH',
    invocationText: 'Mercurial venom and rapid neural fire, sharpen hand trajectory and accelerate recovery return speed.',
    focusQlipha: 'Samael (Poison of Cunning Insight)',
    hermeticFormula: 'ELOHIM TZAQBAOTH',
    hermeticSphere: 'Hod (Glory)',
    martialCorrelation: 'Lightning Chain Punches & Instant Telemetric Recoil'
  },
  {
    dayOfWeek: 'Thursday',
    planet: 'Jupiter / Astaroth / Gha\'agsheblah',
    barbarousFormula: 'GHAAGSHEBLAH ASTAROTH BELIAL CHESED-TZADKIK',
    invocationText: 'Sovereign majesty and unstoppable mass, enlarge the structural kinetic envelope. My posture commands the cardinal quarters.',
    focusQlipha: 'Gha\'agsheblah (Devourer of Boundaries)',
    hermeticFormula: 'EL',
    hermeticSphere: 'Chesed (Mercy)',
    martialCorrelation: 'Heavy Horse Stance (Ma Bu) & Barbell Overhead Holds'
  },
  {
    dayOfWeek: 'Friday',
    planet: 'Venus / Baal / A\'arab Zaraq',
    barbarousFormula: 'ASTARTE BAAL-ZEPHON AARAB ZARAQ NEHESCH',
    invocationText: 'Primal harmony and serpentine sinew tension, weave the fascia into unbreakable organic armor.',
    focusQlipha: 'A\'arab Zaraq (Ravens of Dispersion)',
    hermeticFormula: 'YHVH TZAQBAOTH',
    hermeticSphere: 'Netzach (Victory)',
    martialCorrelation: 'Silk Reeling Qi-Gong (Chan Si Gong) & Joint Fortification'
  },
  {
    dayOfWeek: 'Saturday',
    planet: 'Saturn / Lucifuge / Satariel',
    barbarousFormula: 'AGIOS O KAPH SATARIEL CASSIEL MORTE ZODAC',
    invocationText: 'Ancient stone of the abyss and solemn threshold, temper the skeletal structure like carbonized titanium.',
    focusQlipha: 'Satariel (The Deep Concealer)',
    hermeticFormula: 'YHVH ELOHIM',
    hermeticSphere: 'Binah (Understanding)',
    martialCorrelation: 'Iron Shirt (Tie Bu Shan) & 6-ft Barbell Slow Isometric Lockouts'
  }
];
