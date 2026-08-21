import React, { useState, useEffect } from 'react';
import { PunchTelemetry } from '../types';
import { generatePunchTelemetry, soundEffects } from '../utils/telemetry';
import { Flame, Zap, Target, Activity, ShieldAlert, Award } from 'lucide-react';

interface CombatTelemetryPanelProps {
  punches: PunchTelemetry[];
  setPunches: React.Dispatch<React.SetStateAction<PunchTelemetry[]>>;
  bodyWeightKg?: number;
}

export const CombatTelemetryPanel: React.FC<CombatTelemetryPanelProps> = ({
  punches,
  setPunches,
  bodyWeightKg = 82,
}) => {
  const [isStriking, setIsStriking] = useState(false);

  const lastPunch = punches[0] || {
    id: 'init_p',
    timestamp: Date.now(),
    type: 'Lead Jab',
    speedMs: 7.4,
    anglePitchDeg: 12.0,
    angleYawDeg: 2.1,
    returnTimeSec: 0.32,
    impactForceJoules: 43.8,
    energyKcal: 0.28,
  };

  const handleRecordPunch = (type: 'Lead Jab' | 'Cross Strike' | 'Palm Strike' | 'Iron Fist' | 'Hook' | 'Spear Hand') => {
    setIsStriking(true);
    const newPunch = generatePunchTelemetry(type, 1.0);
    soundEffects.playPunchSwoosh(newPunch.speedMs);
    setPunches((prev) => [newPunch, ...prev.slice(0, 19)]);
    setTimeout(() => setIsStriking(false), 200);
  };

  // Keyboard shortcut listener (Space = Lead Jab, KeyC = Cross Strike, KeyI = Palm Strike)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        handleRecordPunch('Lead Jab');
      } else if (e.code === 'KeyC') {
        e.preventDefault();
        handleRecordPunch('Cross Strike');
      } else if (e.code === 'KeyI') {
        e.preventDefault();
        handleRecordPunch('Palm Strike');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-xl mx-auto p-2 sm:p-4 text-center">
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-base sm:text-lg font-black font-mono tracking-widest text-[#00e5ff] uppercase drop-shadow-[0_0_12px_rgba(0,229,255,0.6)]">
          🥊 MARTIAL COMBAT TELEMETRY
        </h2>
        <p className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider">
          STRIKE KINETICS // IMPACT FORCE & VECTOR RECOIL
        </p>
      </div>

      {/* 3 Live Gauges matching Headset (Single / 2-col stack) */}
      <div className="grid grid-cols-3 gap-2 w-full">
        {/* Peak Velocity Gauge */}
        <div className="bg-gradient-to-b from-[#141b2e]/90 to-[#0a0e1a]/95 border border-cyan-500/40 rounded-xl p-3 shadow-[0_0_20px_rgba(0,229,255,0.15)] flex flex-col items-center">
          <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider">
            VELOCITY
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono text-[#00e5ff] my-1 drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]">
            {lastPunch.speedMs.toFixed(1)} <span className="text-xs">m/s</span>
          </div>
          <span className="text-[8px] font-mono text-gray-500 uppercase">&gt; 9.0 m/s</span>
        </div>

        {/* Impact Force Gauge */}
        <div className="bg-gradient-to-b from-[#141b2e]/90 to-[#0a0e1a]/95 border border-yellow-500/40 rounded-xl p-3 shadow-[0_0_20px_rgba(255,215,0,0.15)] flex flex-col items-center">
          <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider">
            FORCE
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono text-[#ffd700] my-1 drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]">
            {lastPunch.impactForceJoules.toFixed(1)} <span className="text-xs">J</span>
          </div>
          <span className="text-[8px] font-mono text-gray-500 uppercase">CLIMAX</span>
        </div>

        {/* Recoil Return Gauge */}
        <div className="bg-gradient-to-b from-[#141b2e]/90 to-[#0a0e1a]/95 border border-red-500/40 rounded-xl p-3 shadow-[0_0_20px_rgba(239,68,68,0.15)] flex flex-col items-center">
          <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider">
            RECOIL
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono text-[#ff5252] my-1 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">
            {lastPunch.returnTimeSec.toFixed(2)} <span className="text-xs">s</span>
          </div>
          <span className="text-[8px] font-mono text-gray-500 uppercase">&lt; 0.30 s</span>
        </div>
      </div>

      {/* Strike Trigger Buttons matching Headset */}
      <div className="grid grid-cols-3 gap-2 w-full">
        <button
          id="btn-lead-jab"
          onClick={() => handleRecordPunch('Lead Jab')}
          className="py-2.5 px-1 rounded-xl bg-[#00e5ff] hover:bg-cyan-400 text-black font-mono font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,229,255,0.5)] transition-all hover:scale-105"
        >
          LEAD JAB
        </button>

        <button
          id="btn-cross-strike"
          onClick={() => handleRecordPunch('Cross Strike')}
          className="py-2.5 px-1 rounded-xl bg-[#ffd700] hover:bg-yellow-400 text-black font-mono font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(255,215,0,0.5)] transition-all hover:scale-105"
        >
          CROSS
        </button>

        <button
          id="btn-iron-palm"
          onClick={() => handleRecordPunch('Palm Strike')}
          className="py-2.5 px-1 rounded-xl bg-[#ff5252] hover:bg-red-400 text-black font-mono font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all hover:scale-105"
        >
          IRON PALM
        </button>
      </div>

      {/* Strike History Stream Log matching Headset */}
      <div className="w-full bg-[#101628]/95 border border-cyan-500/30 rounded-2xl p-4 shadow-[0_0_20px_rgba(0,0,0,0.6)] text-left">
        <div className="flex justify-between items-center pb-2.5 border-b border-cyan-500/20">
          <span className="text-[11px] font-black font-mono text-[#00e5ff] uppercase tracking-widest">
            STRIKE TELEMETRY
          </span>
          <span className="text-[10px] font-mono text-gray-400">
            {punches.length} RECORDED
          </span>
        </div>

        <div className="mt-2 space-y-1.5 font-mono">
          {punches.slice(0, 6).map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between py-1.5 border-b border-gray-800/80 text-[11px]"
            >
              <span className="font-bold text-white tracking-wider">{p.type}</span>
              <span className="font-black text-[#00e5ff]">{p.speedMs.toFixed(1)} m/s</span>
              <span className="font-bold text-[#ffd700]">{p.impactForceJoules.toFixed(1)} J</span>
              <span className="text-gray-400 text-[10px]">{p.returnTimeSec.toFixed(2)}s</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
