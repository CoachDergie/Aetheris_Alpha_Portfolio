import { CelestialBody, PlanetaryAspect, LunarPhaseInfo, DailyInvocation } from '../types';

export const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const PLANET_THEMES: Record<string, string> = {
  Sun: "core vitality and self-expression",
  Moon: "emotional needs and intuition",
  Mars: "drive, action, and boundaries",
  Mercury: "communication and mental clarity",
  Jupiter: "growth, optimism, and abundance",
  Venus: "relationships, harmony, and self-worth",
  Saturn: "discipline, structure, and responsibility",
  Uranus: "innovation, authenticity, and change",
  Neptune: "empathy, spirituality, and compassion",
  Pluto: "deep transformation and psychological power",
};

export function generateAspectGuidance(p1: string, p2: string, aspectType: string): string {
  const t1 = PLANET_THEMES[p1] || p1;
  const t2 = PLANET_THEMES[p2] || p2;

  switch (aspectType) {
    case 'Conjunction':
      return `Alignment of ${p1} and ${p2}. This fusion intensely concentrates your ${t1} alongside your ${t2}, requiring active focus to channel productively.`;
    case 'Sextile':
      return `${p1} Sextile ${p2}. An opportunity emerges connecting your ${t1} and ${t2}. This is favorable, but active work is required to make progress.`;
    case 'Square':
      return `Tension between ${p1} and ${p2}. This creates noticeable friction between your ${t1} and ${t2}. Use this discomfort as a catalyst for active personal growth.`;
    case 'Trine':
      return `${p1} Trine ${p2}. A natural alignment smoothly bridging your ${t1} with your ${t2}. This typically represents an automatic blessing and harmony.`;
    case 'Opposition':
      return `${p1} opposes ${p2}. You are pulled between ${t1} and ${t2}. This polarity requires deep discipline to balance. It is a good time to be guarded mentally.`;
    default:
      return `Interaction between ${p1} and ${p2}.`;
  }
}

export const QLIPHOTIC_SPHERES: Record<string, { sphere: string; ruler: string; signature: string; element: string }> = {
  Sun: { sphere: 'Physical Wellness', ruler: 'Vitality', signature: 'Energy & Radiant Health', element: 'Fire' },
  Moon: { sphere: 'Emotional Wellness', ruler: 'Intuition', signature: 'Emotional Balance & Flow', element: 'Water' },
  Mars: { sphere: 'Occupational Wellness', ruler: 'Action', signature: 'Motivation & Drive', element: 'Fire' },
  Mercury: { sphere: 'Intellectual Wellness', ruler: 'Communication', signature: 'Clarity & Sharpness', element: 'Air' },
  Jupiter: { sphere: 'Spiritual Wellness', ruler: 'Growth', signature: 'Expansion & Abundance', element: 'Water' },
  Venus: { sphere: 'Social Wellness', ruler: 'Harmony', signature: 'Connection & Relationships', element: 'Earth' },
  Saturn: { sphere: 'Physical Wellness', ruler: 'Discipline', signature: 'Structure & Endurance', element: 'Earth' },
  Uranus: { sphere: 'Mental Wellness', ruler: 'Innovation', signature: 'Creativity & Change', element: 'Air' },
  Neptune: { sphere: 'Environmental Wellness', ruler: 'Empathy', signature: 'Connection to Nature', element: 'Water' },
  Pluto: { sphere: 'Mental Wellness', ruler: 'Transformation', signature: 'Deep Personal Growth', element: 'Ether' },
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
  let esotericAffinity = 'New Beginnings & Goal Setting';

  if (phaseDecimal < 0.03 || phaseDecimal > 0.97) {
    phaseName = 'New Moon (Dark Moon)';
    esotericAffinity = 'Deep Rest & Introspection';
  } else if (phaseDecimal < 0.22) {
    phaseName = 'Waxing Crescent';
    esotericAffinity = 'Building Habits & Gentle Momentum';
  } else if (phaseDecimal < 0.28) {
    phaseName = 'First Quarter';
    esotericAffinity = 'Overcoming Challenges & Action';
  } else if (phaseDecimal < 0.47) {
    phaseName = 'Waxing Gibbous';
    esotericAffinity = 'Refining Processes & Growth';
  } else if (phaseDecimal < 0.53) {
    phaseName = 'Full Moon';
    esotericAffinity = 'Peak Energy & Celebration of Results';
  } else if (phaseDecimal < 0.72) {
    phaseName = 'Waning Gibbous (Disseminating)';
    esotericAffinity = 'Gratitude & Sharing Knowledge';
  } else if (phaseDecimal < 0.78) {
    phaseName = 'Last Quarter';
    esotericAffinity = 'Releasing What No Longer Serves';
  } else {
    phaseName = 'Waning Crescent (Balsamic)';
    esotericAffinity = 'Restoration & Healing';
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
    { name: 'Sun', symbol: '☉', speed: 0.9856, offset: 280, archetype: 'Radiant Vitality & Core Strength' },
    { name: 'Moon', symbol: '☽', speed: 13.176, offset: 40, archetype: 'Emotional Flow & Intuition' },
    { name: 'Mars', symbol: '♂', speed: 0.524, offset: 120, archetype: 'Decisive Action & Motivation' },
    { name: 'Mercury', symbol: '☿', speed: 1.6, offset: 200, archetype: 'Clear Communication & Learning' },
    { name: 'Jupiter', symbol: '♃', speed: 0.083, offset: 310, archetype: 'Abundance & Spiritual Growth' },
    { name: 'Venus', symbol: '♀', speed: 1.2, offset: 15, archetype: 'Social Harmony & Connection' },
    { name: 'Saturn', symbol: '♄', speed: 0.033, offset: 180, archetype: 'Discipline & Enduring Structure' },
    { name: 'Uranus', symbol: '♅', speed: 0.011, offset: 45, archetype: 'Innovation & Creative Change' },
    { name: 'Neptune', symbol: '♆', speed: 0.006, offset: 290, archetype: 'Empathy & Environmental Awareness' },
    { name: 'Pluto', symbol: '♇', speed: 0.004, offset: 215, archetype: 'Profound Transformation & Depth' },
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
      qliphoticSphere: qlData?.sphere || 'Wellness Dimension',
      darkSignature: qlData?.signature || 'Positive Resonance',
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
          esotericMeaning: generateAspectGuidance(b1.name, b2.name, 'Conjunction')
        });
      } else if (Math.abs(diff - 90) <= 7) {
        aspects.push({
          planet1: b1.name,
          planet2: b2.name,
          aspectType: 'Square',
          orb: Math.round(Math.abs(diff - 90) * 10) / 10,
          intensity: 'High',
          esotericMeaning: generateAspectGuidance(b1.name, b2.name, 'Square')
        });
      } else if (Math.abs(diff - 180) <= 8) {
        aspects.push({
          planet1: b1.name,
          planet2: b2.name,
          aspectType: 'Opposition',
          orb: Math.round(Math.abs(diff - 180) * 10) / 10,
          intensity: 'High',
          esotericMeaning: generateAspectGuidance(b1.name, b2.name, 'Opposition')
        });
      } else if (Math.abs(diff - 120) <= 6) {
        aspects.push({
          planet1: b1.name,
          planet2: b2.name,
          aspectType: 'Trine',
          orb: Math.round(Math.abs(diff - 120) * 10) / 10,
          intensity: 'Moderate',
          esotericMeaning: generateAspectGuidance(b1.name, b2.name, 'Trine')
        });
      } else if (Math.abs(diff - 60) <= 4) {
        aspects.push({
          planet1: b1.name,
          planet2: b2.name,
          aspectType: 'Sextile',
          orb: Math.round(Math.abs(diff - 60) * 10) / 10,
          intensity: 'Subtle',
          esotericMeaning: generateAspectGuidance(b1.name, b2.name, 'Sextile')
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
    barbarousFormula: 'I am overflowing with boundless energy and radiant health.',
    invocationText: 'I welcome the light of a new week. My body is strong, my mind is clear, and my spirit is bright.',
    focusQlipha: 'Thagirion (Beauty of the Abyss)',
    hermeticFormula: 'YHVH ELOAH V\'DAAT',
    hermeticSphere: 'Tiphereth (Beauty)',
    martialCorrelation: 'Solar Iron Palm & Concentrated Centerline Strike'
  },
  {
    dayOfWeek: 'Monday',
    planet: 'Moon / Lilith / Gamaliel',
    barbarousFormula: 'I move with the fluid grace of the tides, trusting my inner wisdom.',
    invocationText: 'I embrace the changing currents of life. I am adaptable, intuitive, and deeply connected to my true self.',
    focusQlipha: 'Gamaliel (Astral Dream Weaver)',
    hermeticFormula: 'SHADDAI EL CHAI',
    hermeticSphere: 'Yesod (Foundation)',
    martialCorrelation: 'Fluid Evasion, Baguazhang Circle Walking & Rooting'
  },
  {
    dayOfWeek: 'Tuesday',
    planet: 'Mars / Asmodeus / Golachab',
    barbarousFormula: 'I am fearless, focused, and take decisive action towards my goals.',
    invocationText: 'I channel my inner fire into productive momentum. Obstacles are merely stepping stones on my path to victory.',
    focusQlipha: 'Golachab (Flaming Destruction)',
    hermeticFormula: 'ELOHIM GIBOR',
    hermeticSphere: 'Geburah (Severity)',
    martialCorrelation: 'Explosive Thrusts, Heavy Barbell Cleans & Penetrating Punches'
  },
  {
    dayOfWeek: 'Wednesday',
    planet: 'Mercury / Samael / Adrammelech',
    barbarousFormula: 'My mind is sharp, my words are true, and my communication is clear.',
    invocationText: 'I process information with lightning speed. I am present, perceptive, and articulate in all my interactions.',
    focusQlipha: 'Samael (Poison of Cunning Insight)',
    hermeticFormula: 'ELOHIM TZAQBAOTH',
    hermeticSphere: 'Hod (Glory)',
    martialCorrelation: 'Lightning Chain Punches & Instant Telemetric Recoil'
  },
  {
    dayOfWeek: 'Thursday',
    planet: 'Jupiter / Astaroth / Gha\'agsheblah',
    barbarousFormula: 'I am abundant, successful, and open to limitless possibilities.',
    invocationText: 'Sovereign majesty and unstoppable mass, enlarge the structural kinetic envelope. My posture commands the cardinal quarters.',
    focusQlipha: 'Gha\'agsheblah (Devourer of Boundaries)',
    hermeticFormula: 'EL',
    hermeticSphere: 'Chesed (Mercy)',
    martialCorrelation: 'Heavy Horse Stance (Ma Bu) & Barbell Overhead Holds'
  },
  {
    dayOfWeek: 'Friday',
    planet: 'Venus / Baal / A\'arab Zaraq',
    barbarousFormula: 'I am surrounded by love, beauty, and perfect balance.',
    invocationText: 'Primal harmony and serpentine sinew tension, weave the fascia into unbreakable organic armor.',
    focusQlipha: 'A\'arab Zaraq (Ravens of Dispersion)',
    hermeticFormula: 'YHVH TZAQBAOTH',
    hermeticSphere: 'Netzach (Victory)',
    martialCorrelation: 'Silk Reeling Qi-Gong (Chan Si Gong) & Joint Fortification'
  },
  {
    dayOfWeek: 'Saturday',
    planet: 'Saturn / Lucifuge / Satariel',
    barbarousFormula: 'I am grounded, patient, and committed to my long-term mastery.',
    invocationText: 'I build my life on a foundation of unshakeable discipline. Through consistent effort, I achieve enduring strength.',
    focusQlipha: 'Satariel (The Deep Concealer)',
    hermeticFormula: 'YHVH ELOHIM',
    hermeticSphere: 'Binah (Understanding)',
    martialCorrelation: 'Iron Shirt (Tie Bu Shan) & 6-ft Barbell Slow Isometric Lockouts'
  }
];
