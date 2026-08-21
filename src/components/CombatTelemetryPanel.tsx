import React, { useState, useEffect } from 'react';
import { PunchTelemetry } from '../types';
import { generatePunchTelemetry, soundEffects } from '../utils/telemetry';
import { Flame, Zap, Shield, RotateCcw } from 'lucide-react';

interface CombatTelemetryPanelProps {
  punches: PunchTelemetry[];
  setPunches: React.Dispatch<React.SetStateAction<PunchTelemetry[]>>;
  bodyWeightKg?: number;
}

type PunchType = 'Lead Jab' | 'Cross Strike' | 'Palm Strike' | 'Iron Fist' | 'Hook' | 'Spear Hand';

export const CombatTelemetryPanel: React.FC<CombatTelemetryPanelProps> = ({
  punches,
  setPunches,
  bodyWeightKg = 80,
}) => {
  const [lastPunch, setLastPunch] = useState<PunchTelemetry>(() => {
    return (
      punches[0] || {
        id: 'p_default',
        timestamp: Date.now(),
        type: 'Lead Jab',
        speedMs: 8.5,
        anglePitchDeg: 12.4,
        angleYawDeg: 2.1,
        returnTimeSec: 0.28,
        impactForceJoules: 64.2,
        energyKcal: 0.32,
      }
    );
  });

  const handleRecordPunch = (type: PunchType) => {
    const newPunch = generatePunchTelemetry(type, 1.0);
    setLastPunch(newPunch);
    setPunches((prev) => [newPunch, ...prev.slice(0, 19)]);
    soundEffects.playPunchSwoosh(newPunch.speedMs);
  };

  const handleResetSession = () => {
    setPunches([]);
  };

  useEffect(() => {
    if (punches.length > 0 && punches[0].id !== lastPunch.id) {
      setLastPunch(punches[0]);
    }
  }, [punches, lastPunch]);

  return (
    <div className="flex flex-col items-center gap-4 w-full p-2.5 sm:p-4 text-center">
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-base sm:text-lg font-black font-mono tracking-widest text-[#00e5ff] uppercase drop-shadow-[0_0_12px_rgba(0,229,255,0.6)]">
          🥊 MARTIAL COMBAT TELEMETRY
        </h2>
        <p className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider">
          STRIKE KINETICS // IMPACT FORCE & VECTOR RECOIL
        </p>
      </div>

      {/* 3 Live Gauges */}
      <div className="grid grid-cols-3 gap-2 w-full">
        {/* Peak Velocity Gauge */}
        <div className="bg-[#1E2638] border border-cyan-500/40 rounded-xl p-3 shadow-[0_2px_15px_rgba(0,0,0,0.3)] flex flex-col items-center">
          <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider">
            VELOCITY
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono text-[#00e5ff] my-1 drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]">
            {lastPunch.speedMs.toFixed(1)} <span className="text-xs">m/s</span>
          </div>
          <span className="text-[8px] font-mono text-gray-400 uppercase">&gt; 9.0 m/s</span>
        </div>

        {/* Impact Force Gauge */}
        <div className="bg-[#1E2638] border border-yellow-500/40 rounded-xl p-3 shadow-[0_2px_15px_rgba(0,0,0,0.3)] flex flex-col items-center">
          <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider">
            FORCE
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono text-[#ffd700] my-1 drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]">
            {lastPunch.impactForceJoules.toFixed(1)} <span className="text-xs">J</span>
          </div>
          <span className="text-[8px] font-mono text-gray-400 uppercase">CLIMAX</span>
        </div>

        {/* Recoil Return Gauge */}
        <div className="bg-[#1E2638] border border-red-500/40 rounded-xl p-3 shadow-[0_2px_15px_rgba(0,0,0,0.3)] flex flex-col items-center">
          <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider">
            RECOIL
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono text-[#ff5252] my-1 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">
            {lastPunch.returnTimeSec.toFixed(2)} <span className="text-xs">s</span>
          </div>
          <span className="text-[8px] font-mono text-gray-400 uppercase">&lt; 0.30 s</span>
        </div>
      </div>

      {/* Trigger Buttons */}
      <div className="grid grid-cols-3 gap-2 w-full">
        <button
          id="btn-lead-jab"
          onClick={() => handleRecordPunch('Lead Jab')}
          className="py-2.5 px-1 rounded-xl bg-[#00e5ff] hover:bg-cyan-400 text-black font-mono font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all hover:scale-105"
        >
          LEAD JAB
        </button>

        <button
          id="btn-cross-strike"
          onClick={() => handleRecordPunch('Cross Strike')}
          className="py-2.5 px-1 rounded-xl bg-[#ffd700] hover:bg-yellow-400 text-black font-mono font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(255,215,0,0.4)] transition-all hover:scale-105"
        >
          CROSS
        </button>

        <button
          id="btn-palm-strike"
          onClick={() => handleRecordPunch('Palm Strike')}
          className="py-2.5 px-1 rounded-xl bg-[#ff5252] hover:bg-red-400 text-black font-mono font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all hover:scale-105"
        >
          IRON PALM
        </button>
      </div>

      {/* Live Strike Stream */}
      <div className="w-full bg-[#1E2638] border border-cyan-500/30 rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.4)] text-left">
        <div className="flex justify-between items-center pb-2.5 border-b border-[#2A3650]">
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
              className="flex items-center justify-between py-1.5 border-b border-[#263148] text-[11px]"
            >
              <span className="font-bold text-white tracking-wider">{p.type}</span>
              <span className="font-black text-[#00e5ff]">{p.speedMs.toFixed(1)} m/s</span>
              <span className="text-[#ffd700] font-bold">{p.impactForceJoules.toFixed(1)} J</span>
              <span className="text-gray-400 text-[10px]">{p.returnTimeSec.toFixed(2)}s</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
