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

export interface PlanetaryAspect {
  planet1: string;
  planet2: string;
  aspectType: 'Conjunction' | 'Opposition' | 'Trine' | 'Square' | 'Sextile';
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
}

export interface PunchTelemetry {
  id: string;
  timestamp: number;
  type: 'Lead Jab' | 'Cross Strike' | 'Palm Strike' | 'Iron Fist' | 'Hook' | 'Spear Hand';
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
  invocationText: string;
  focusQlipha: string;
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

export type ViewTab = 'dashboard' | 'natal' | 'combat' | 'qigong' | 'transits' | 'occult';
