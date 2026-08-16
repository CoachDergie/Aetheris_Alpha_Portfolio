import { PunchTelemetry, QiGongBarbellSession } from '../types';

export const MARTIAL_MOVEMENTS = [
  { name: 'Six-Foot Barbell Horse Stance Press (Ma Bu Tui)', met: 7.8, focus: 'Quadriceps Rooting & Shoulder Girdle Core' },
  { name: 'Dragon Tail Levered Zinc Bar Rotation (Long Wei Bang)', met: 8.5, focus: 'Rotational Oblique Power & Wrist Fortification' },
  { name: 'Iron Pillar Ground-to-Overhead Snatch (Tie Zhu Ba)', met: 9.2, focus: 'Full-Chain Triple Extension & Kinetic Burst' },
  { name: 'Sleeveless Barbell Golden Bell Qi-Gong Isometric Hold', met: 6.5, focus: 'Fascial Tension & Skeletal Density' },
  { name: 'Cross-Body Zinc Spear Thrust & Deflect (Qiang Tui)', met: 8.0, focus: 'Forward Line Thrust & Lats Stabilization' },
];

/** Calculate calories burned based on body weight, barbell load, MET, and duration */
export function calculateBarbellKcal(
  bodyWeightKg: number,
  barbellWeightKg: number,
  movementMet: number,
  durationMinutes: number
): number {
  // Effective load adds biomechanical resistance of trimmed 6-ft zinc bar
  const effectiveMass = bodyWeightKg + (barbellWeightKg * 0.85);
  // Standard exercise energy expenditure formula: Calories = (MET * 3.5 * massKg / 200) * minutes
  const kcal = (movementMet * 3.5 * effectiveMass / 200) * durationMinutes;
  return Math.round(kcal * 10) / 10;
}

/** Simulate or calculate punch physics */
export function generatePunchTelemetry(
  type: 'Lead Jab' | 'Cross Strike' | 'Palm Strike' | 'Iron Fist' | 'Hook' | 'Spear Hand',
  userStrengthModifier = 1.0
): PunchTelemetry {
  // Average martial punch speeds: 6.0 m/s to 11.5 m/s
  let baseSpeed = 7.5;
  let baseReturn = 0.35;
  let baseAngle = 10;

  switch (type) {
    case 'Lead Jab':
      baseSpeed = 8.8 + (Math.random() * 2.2 - 1.0);
      baseReturn = 0.22 + (Math.random() * 0.08 - 0.04);
      baseAngle = 5 + (Math.random() * 6 - 3);
      break;
    case 'Cross Strike':
      baseSpeed = 9.8 + (Math.random() * 2.5 - 1.0);
      baseReturn = 0.38 + (Math.random() * 0.1 - 0.05);
      baseAngle = 14 + (Math.random() * 8 - 4);
      break;
    case 'Palm Strike':
      baseSpeed = 7.9 + (Math.random() * 1.8 - 0.9);
      baseReturn = 0.30 + (Math.random() * 0.06 - 0.03);
      baseAngle = 8 + (Math.random() * 6 - 3);
      break;
    case 'Iron Fist':
      baseSpeed = 10.4 + (Math.random() * 2.6 - 1.0);
      baseReturn = 0.42 + (Math.random() * 0.12 - 0.06);
      baseAngle = 18 + (Math.random() * 10 - 5);
      break;
    case 'Hook':
      baseSpeed = 8.5 + (Math.random() * 2.0 - 1.0);
      baseReturn = 0.36 + (Math.random() * 0.08 - 0.04);
      baseAngle = 22 + (Math.random() * 8 - 4);
      break;
    case 'Spear Hand':
      baseSpeed = 9.2 + (Math.random() * 2.0 - 1.0);
      baseReturn = 0.25 + (Math.random() * 0.05 - 0.02);
      baseAngle = 3 + (Math.random() * 4 - 2);
      break;
  }

  const speed = Math.max(3.0, Math.round((baseSpeed * userStrengthModifier) * 100) / 100);
  const returnTime = Math.max(0.12, Math.round(baseReturn * 1000) / 1000);
  const anglePitch = Math.round(baseAngle * 10) / 10;
  const angleYaw = Math.round((Math.random() * 16 - 8) * 10) / 10;

  // Kinetic energy: E = 0.5 * m * v^2 (where hand/forearm mass ~ 1.5kg)
  const armMass = 1.6;
  const impactJoules = Math.round(0.5 * armMass * Math.pow(speed, 2) * 10) / 10;
  const energyKcal = Math.round((impactJoules * 0.000239006 + 0.18) * 100) / 100;

  return {
    id: `punch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
    type,
    speedMs: speed,
    anglePitchDeg: anglePitch,
    angleYawDeg: angleYaw,
    returnTimeSec: returnTime,
    impactForceJoules: impactJoules,
    energyKcal
  };
}

/** Web Audio Sound Synthesizer for Immersive Sci-Fi / Martial Sound Effects */
class SoundEngine {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  playPunchSwoosh(speed = 8) {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400 + speed * 60, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.18);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160 + speed * 15, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.18);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.18);
    } catch {
      // Audio might be blocked by browser policy until gesture
    }
  }

  playHolographicChime(freq = 432) {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx.currentTime + 0.4);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
    } catch {
      // Audio fail-safe
    }
  }
}

export const soundEffects = new SoundEngine();
