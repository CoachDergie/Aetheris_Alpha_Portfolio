import { JournalEntry } from '../types';

export interface DiscoveredIncantation extends JournalEntry {
  id: string;
  source: string; // e.g. 'Standard Affirmation', 'Personal Focus'
  element: 'Fire' | 'Water' | 'Air' | 'Earth' | 'Aether / Void';
  vibrationalToneHz: number;
  tags: string[];
  dateDiscovered: string;
  isCustom?: boolean;
  notes?: string;
}

export const INITIAL_JOURNAL_ENTRIES: DiscoveredIncantation[] = [
  {
    id: 'inc_sun_vitality',
    dayOfWeek: 'Sunday',
    planet: 'Sun / Vitality',
    barbarousFormula: 'I am overflowing with boundless energy and radiant health.',
    invocationText: 'I welcome the light of a new week. My body is strong, my mind is clear, and my spirit is bright.',
    focusQlipha: 'Center of Being',
    hermeticFormula: 'Radiance',
    hermeticSphere: 'Solar Plexus',
    martialCorrelation: 'Core Stability & Centered Breath',
    source: 'Standard Affirmation',
    element: 'Fire',
    vibrationalToneHz: 528,
    tags: ['solar', 'vitality', 'energy', 'health'],
    dateDiscovered: '2026-08-15',
  },
  {
    id: 'inc_moon_flow',
    dayOfWeek: 'Monday',
    planet: 'Moon / Intuition',
    barbarousFormula: 'I move with the fluid grace of the tides, trusting my inner wisdom.',
    invocationText: 'I embrace the changing currents of life. I am adaptable, intuitive, and deeply connected to my true self.',
    focusQlipha: 'Subconscious Depths',
    hermeticFormula: 'Reflection',
    hermeticSphere: 'Foundation',
    martialCorrelation: 'Fluid Evasion & Circle Walking',
    source: 'Standard Affirmation',
    element: 'Water',
    vibrationalToneHz: 432,
    tags: ['lunar', 'fluidity', 'intuition', 'adaptability'],
    dateDiscovered: '2026-08-15',
  },
  {
    id: 'inc_mars_action',
    dayOfWeek: 'Tuesday',
    planet: 'Mars / Action',
    barbarousFormula: 'I am fearless, focused, and take decisive action towards my goals.',
    invocationText: 'I channel my inner fire into productive momentum. Obstacles are merely stepping stones on my path to victory.',
    focusQlipha: 'Dynamic Drive',
    hermeticFormula: 'Courage',
    hermeticSphere: 'Action',
    martialCorrelation: 'Explosive Power & Direct Strikes',
    source: 'Standard Affirmation',
    element: 'Fire',
    vibrationalToneHz: 396,
    tags: ['action', 'courage', 'focus', 'momentum'],
    dateDiscovered: '2026-08-15',
  },
  {
    id: 'inc_mercury_clarity',
    dayOfWeek: 'Wednesday',
    planet: 'Mercury / Clarity',
    barbarousFormula: 'My mind is sharp, my words are true, and my communication is clear.',
    invocationText: 'I process information with lightning speed. I am present, perceptive, and articulate in all my interactions.',
    focusQlipha: 'Mental Agility',
    hermeticFormula: 'Insight',
    hermeticSphere: 'Intellect',
    martialCorrelation: 'Quick Reflexes & Interception',
    source: 'Standard Affirmation',
    element: 'Air',
    vibrationalToneHz: 741,
    tags: ['clarity', 'speed', 'communication', 'focus'],
    dateDiscovered: '2026-08-15',
  },
  {
    id: 'inc_jupiter_expansion',
    dayOfWeek: 'Thursday',
    planet: 'Jupiter / Expansion',
    barbarousFormula: 'I am abundant, successful, and open to limitless possibilities.',
    invocationText: 'I attract prosperity and positive growth in every area of my life. The universe supports my highest good.',
    focusQlipha: 'Limitless Growth',
    hermeticFormula: 'Abundance',
    hermeticSphere: 'Expansion',
    martialCorrelation: 'Broad Stances & Powerful Cleans',
    source: 'Standard Affirmation',
    element: 'Earth',
    vibrationalToneHz: 852,
    tags: ['expansion', 'abundance', 'growth', 'success'],
    dateDiscovered: '2026-08-15',
  },
  {
    id: 'inc_venus_harmony',
    dayOfWeek: 'Friday',
    planet: 'Venus / Harmony',
    barbarousFormula: 'I am surrounded by love, beauty, and perfect balance.',
    invocationText: 'I cultivate peace within and harmony without. I value connection and bring grace to all that I do.',
    focusQlipha: 'Inner Peace',
    hermeticFormula: 'Love',
    hermeticSphere: 'Harmony',
    martialCorrelation: 'Joint Fortification & Smooth Transitions',
    source: 'Standard Affirmation',
    element: 'Earth',
    vibrationalToneHz: 417,
    tags: ['harmony', 'peace', 'balance', 'grace'],
    dateDiscovered: '2026-08-15',
  },
  {
    id: 'inc_saturn_discipline',
    dayOfWeek: 'Saturday',
    planet: 'Saturn / Discipline',
    barbarousFormula: 'I am grounded, patient, and committed to my long-term mastery.',
    invocationText: 'I build my life on a foundation of unshakeable discipline. Through consistent effort, I achieve enduring strength.',
    focusQlipha: 'Structural Integrity',
    hermeticFormula: 'Commitment',
    hermeticSphere: 'Discipline',
    martialCorrelation: 'Isometric Holds & Rooting',
    source: 'Standard Affirmation',
    element: 'Earth',
    vibrationalToneHz: 285,
    tags: ['discipline', 'structure', 'mastery', 'patience'],
    dateDiscovered: '2026-08-15',
  }
];

export const DISCOVERY_CATALOG: Omit<DiscoveredIncantation, 'id' | 'dateDiscovered'>[] = [
  {
    dayOfWeek: 'Discovered',
    planet: 'Focus / Synthesis',
    barbarousFormula: 'I am healthy, I am wealthy, I am free.',
    invocationText: 'I align my mind, body, and spirit to manifest my highest potential. Every breath reinforces my absolute sovereign freedom.',
    focusQlipha: 'Unified Center',
    hermeticFormula: 'Sovereignty',
    hermeticSphere: 'Alignment',
    martialCorrelation: 'Centered Posture & Deep Breathing',
    source: 'Standard Affirmation',
    element: 'Aether / Void',
    vibrationalToneHz: 963,
    tags: ['health', 'wealth', 'freedom', 'synthesis'],
  },
  {
    dayOfWeek: 'Discovered',
    planet: 'Strength / Resilience',
    barbarousFormula: 'I am unbreakable, I am resilient, I am forged in fire.',
    invocationText: 'Challenges only serve to make me stronger. I rise above adversity with unyielding power and grace.',
    focusQlipha: 'Indomitable Will',
    hermeticFormula: 'Resilience',
    hermeticSphere: 'Strength',
    martialCorrelation: 'Iron Body & Unwavering Focus',
    source: 'Standard Affirmation',
    element: 'Fire',
    vibrationalToneHz: 396,
    tags: ['strength', 'resilience', 'unbreakable', 'power'],
  },
  {
    dayOfWeek: 'Discovered',
    planet: 'Peace / Clarity',
    barbarousFormula: 'I am calm, I am centered, I am at peace.',
    invocationText: 'I release all tension and anxiety. My mind is a still lake, perfectly reflecting the truth of the present moment.',
    focusQlipha: 'Stillness',
    hermeticFormula: 'Tranquility',
    hermeticSphere: 'Peace',
    martialCorrelation: 'Meditation & Internal Qi Flow',
    source: 'Standard Affirmation',
    element: 'Water',
    vibrationalToneHz: 432,
    tags: ['peace', 'calm', 'centered', 'stillness'],
  }
];

/** Synthesize a new discovery based on query keywords, planets, and user intentions */
export function synthesizeDiscoveryFromQuery(query: string = ''): DiscoveredIncantation {
  const q = (query || '').toLowerCase();
  
  const matched = DISCOVERY_CATALOG.find((item) => {
    const tags = Array.isArray(item.tags) ? item.tags : [];
    const element = (item.element || '').toLowerCase();
    const planet = (item.planet || '').toLowerCase();
    return tags.some((t) => (t && q.includes(t.toLowerCase()))) ||
      (element && q.includes(element)) ||
      (planet && q.includes(planet.slice(0, 4)));
  });

  const base = matched || DISCOVERY_CATALOG[Math.floor(Math.random() * DISCOVERY_CATALOG.length)];
  
  const id = `discovered_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const dateStr = new Date().toISOString().split('T')[0];

  return {
    ...base,
    id,
    dateDiscovered: dateStr,
    notes: query ? `Discovered during query: "${query}"` : 'Discovered via synthesis',
  };
}
