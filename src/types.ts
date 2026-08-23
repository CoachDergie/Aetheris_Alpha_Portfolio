export interface NatalData {
  birthDate: string;
  birthTime: string;
  birthCity: string;
  birthCountry: string;
  latitude: number;
  longitude: number;
}

export interface CelestialBody {
  name: string;
  symbol: string;
  sign: string;
  degree: number;
  minute: number;
  house: number;
  archetype: string;
  qliphoticSphere?: string;
  darkSignature?: string;
  isRetrograde?: boolean;
}

export type AspectType = 'Conjunction' | 'Opposition' | 'Trine' | 'Square' | 'Sextile';

export interface PlanetaryAspect {
  planet1: string;
  planet2: string;
  aspectType: AspectType;
  orb: number;
  intensity: 'Extreme' | 'High' | 'Moderate' | 'Subtle';
  esotericMeaning: string;
}

export interface LunarPhaseInfo {
  phaseName: string;
  illumination: number; // 0 - 100
  ageDays: number;
  nextFullMoon: string;
  nextNewMoon: string;
  currentSign: string;
  esotericAffinity: string;
  isVoidOfCourse?: boolean;
}

export interface PunchTelemetry {
  id: string;
  timestamp: number;
  type: string;
  speedMs: number;
  anglePitchDeg: number;
  angleYawDeg: number;
  returnTimeSec: number;
  impactForceJoules: number;
  energyKcal: number;
}

export interface QiGongBarbellSession {
  userBodyWeightKg: number;
  barbellWeightKg: number;
  barbellLengthFt: number; // default 6
  durationMinutes: number;
  movementName: string;
  sets: number;
  reps: number;
  estimatedKcal: number;
  associatedPlanetaryHour: string;
  focusStance: string;
}

export interface DailyInvocation {
  dayOfWeek: string;
  planet: string;
  barbarousFormula: string;
  hermeticFormula?: string;
  invocationText: string;
  focusQlipha: string;
  hermeticSphere?: string;
  martialCorrelation: string;
}

export interface DiscoveredIncantation extends DailyInvocation {
  id: string;
  source: string;
  element: 'Fire' | 'Water' | 'Air' | 'Earth' | 'Aether / Void';
  vibrationalToneHz: number;
  tags: string[];
  dateDiscovered: string;
  isCustom?: boolean;
  notes?: string;
}

export interface TarotCard {
  id: string;
  name: string;
  imagePath: string;
  suit?: 'Major' | 'Cups' | 'Wands' | 'Swords' | 'Pentacles';
  uprightMeaning: string;
  reversedMeaning: string;
  associatedPlanetOrSign: string;
  glyph?: string;
}

export interface DrawnCard {
  card: TarotCard;
  isReversed: boolean;
  positionName?: string;
}

export interface Meditation {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  associatedPlanet: string;
  focusArchetype: string;
  breathingPattern: 'Box (4-4-4-4)' | 'Fire (2-1-2-1)' | 'Void (4-7-8)' | 'Deep (5-5-5-5)';
  mantra: string;
}

export type ViewTab = 'dashboard' | 'natal' | 'combat' | 'qigong' | 'meditations' | 'tarot' | 'occult';
export type EnvironmentViewMode = 'headset_xr' | 'direct_panel' | 'passthrough_ar';
