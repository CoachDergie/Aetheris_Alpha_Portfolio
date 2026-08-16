import React, { useState, useEffect } from 'react';
import { PunchTelemetry } from '../types';
import { generatePunchTelemetry, soundEffects } from '../utils/telemetry';
import { Flame, Zap, Target, RotateCcw, Activity, ShieldAlert, Award } from 'lucide-react';

interface CombatTelemetryPanelProps {
  punches: PunchTelemetry[];
  setPunches: React.Dispatch<React.SetStateAction<PunchTelemetry[]>>;
  bodyWeightKg: number;
}

export const CombatTelemetryPanel: React.FC<CombatTelemetryPanelProps> = ({
  punches,
  setPunches,
  bodyWeightKg,
}) => {
  const [activeType, setActiveType] = useState<PunchTelemetry['type']>('Lead Jab');
  const [isStriking, setIsStriking] = useState(false);
  const [strengthModifier, setStrengthModifier] = useState(1.0);

  const latestPunch = punches[0] || {
    speedMs: 7.4,
    anglePitchDeg: 12.0,
    returnTimeSec: 0.32,
    energyKcal: 0.28,
    impactForceJoules: 43.8,
    type: 'Lead Jab',
  };

  const handleExecuteStrike = (strikeType?: PunchTelemetry['type']) => {
    const typeToUse = strikeType || activeType;
    setIsStriking(true);
    const newPunch = generatePunchTelemetry(typeToUse, strengthModifier);
    soundEffects.playPunchSwoosh(newPunch.speedMs);

    setPunches((prev) => [newPunch, ...prev.slice(0, 19)]);

    setTimeout(() => {
      setIsStriking(false);
    }, 250);
  };

  // Keyboard shortcut listener for rapid virtual sparring (Space or Enter to punch)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space' || e.code === 'KeyP') {
        e.preventDefault();
        handleExecuteStrike();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeType, strengthModifier]);

  const totalCaloriesExpended = punches.reduce((sum, p) => sum + p.energyKcal, 0);
  const maxSpeed = punches.length > 0 ? Math.max(...punches.map((p) => p.speedMs)) : 7.4;

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      {/* 1. Primary Combat Telemetry Display (Matching Design HTML) */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl transition-all hover:border-orange-500/30">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-orange-400 font-mono flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            Combat Telemetry (OpenXR)
          </h2>
          <span className="text-[9px] text-gray-400 font-mono">
            {punches.length} Strikes Logged
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 font-mono">
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
            <p className="text-[9px] opacity-60 uppercase text-gray-300">Peak Velocity</p>
            <p className="text-2xl font-bold text-orange-300">
              {latestPunch.speedMs.toFixed(1)} <span className="text-[10px] font-normal text-gray-400">m/s</span>
            </p>
            <div className="w-full bg-white/10 h-1 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-orange-500 h-full transition-all duration-300"
                style={{ width: `${Math.min(100, (latestPunch.speedMs / 14) * 100)}%` }}
              />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
            <p className="text-[9px] opacity-60 uppercase text-gray-300">Launch Angle</p>
            <p className="text-2xl font-bold text-orange-300">
              {latestPunch.anglePitchDeg > 0 ? `+${latestPunch.anglePitchDeg}` : latestPunch.anglePitchDeg}°{' '}
              <span className="text-[10px] font-normal text-gray-400">pitch</span>
            </p>
            <p className="text-[9px] text-gray-500">Yaw: {latestPunch.angleYawDeg || 0}°</p>
          </div>

          <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
            <p className="text-[9px] opacity-60 uppercase text-gray-300">Return Recoil</p>
            <p className="text-2xl font-bold text-orange-300">
              {latestPunch.returnTimeSec.toFixed(2)} <span className="text-[10px] font-normal text-gray-400">s</span>
            </p>
            <p className="text-[9px] text-emerald-400/80">
              {latestPunch.returnTimeSec < 0.28 ? 'Ultra-Rapid' : 'Standard'}
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
            <p className="text-[9px] opacity-60 uppercase text-gray-300">Kinetic Energy</p>
            <p className="text-2xl font-bold text-orange-300">
              {latestPunch.impactForceJoules ? latestPunch.impactForceJoules.toFixed(0) : '44'}{' '}
              <span className="text-[10px] font-normal text-gray-400">J</span>
            </p>
            <p className="text-[9px] text-gray-400">Total: {totalCaloriesExpended.toFixed(1)} kcal</p>
          </div>
        </div>
      </div>

      {/* 2. Interactive Strike Simulator & Hand Trigger */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-orange-400 font-mono flex items-center gap-1">
            <Target className="w-3 h-3" />
            Gesture Strike Trigger
          </h3>
          <span className="text-[9px] text-gray-400 font-mono">Press [Space] or Tap</span>
        </div>

        {/* Strike Type Selector Chips */}
        <div className="grid grid-cols-3 gap-1.5 mb-3 font-mono text-[10px]">
          {(['Lead Jab', 'Cross Strike', 'Palm Strike', 'Iron Fist', 'Hook', 'Spear Hand'] as PunchTelemetry['type'][]).map(
            (st) => (
              <button
                key={st}
                onClick={() => {
                  setActiveType(st);
                  handleExecuteStrike(st);
                }}
                className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                  activeType === st
                    ? 'bg-orange-600/30 border-orange-500 text-orange-200 shadow-[0_0_8px_rgba(255,69,0,0.3)]'
                    : 'bg-black/40 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            )
          )}
        </div>

        {/* Large Action Strike Button with Visual Flare */}
        <button
          id="strike-telemetry-btn"
          onClick={() => handleExecuteStrike()}
          className={`w-full py-3.5 rounded-xl border flex items-center justify-center gap-2 font-mono text-sm uppercase tracking-widest font-bold transition-all relative overflow-hidden ${
            isStriking
              ? 'bg-orange-500 text-black border-white shadow-[0_0_25px_rgba(255,69,0,0.8)] scale-95'
              : 'bg-gradient-to-r from-orange-600/80 to-red-600/80 text-white border-orange-500/80 hover:brightness-110 shadow-[0_0_15px_rgba(255,69,0,0.4)]'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Execute Strike [{activeType}]</span>
        </button>
      </div>

      {/* 3. Strike Telemetry History Log */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl flex-1 overflow-y-auto max-h-[220px]">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-orange-400 font-mono flex items-center gap-1">
            <Activity className="w-3 h-3" />
            Strike Telemetry Log
          </h3>
          <button
            onClick={() => setPunches([])}
            className="text-[9px] text-gray-500 hover:text-gray-300 font-mono uppercase"
          >
            Clear Log
          </button>
        </div>

        <div className="space-y-1.5 font-mono text-xs">
          {punches.length === 0 ? (
            <p className="text-gray-500 text-[11px] py-4 text-center">
              No strikes captured yet. Trigger punches to track speed & angle telemetry.
            </p>
          ) : (
            punches.slice(0, 8).map((p, idx) => (
              <div
                key={p.id || idx}
                className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/5 hover:border-orange-500/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-orange-400 font-bold">#{punches.length - idx}</span>
                  <span className="text-white text-[11px]">{p.type}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="text-orange-300 font-semibold">{p.speedMs.toFixed(1)} m/s</span>
                  <span className="text-gray-400">{p.anglePitchDeg}°</span>
                  <span className="text-emerald-400">{p.returnTimeSec.toFixed(2)}s</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
