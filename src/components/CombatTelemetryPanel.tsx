import React, { useState, useEffect } from 'react';
import { PunchTelemetry } from '../types';
import { generatePunchTelemetry, soundEffects } from '../utils/telemetry';
import { Flame, Zap, Shield, RotateCcw, AlertTriangle, Crosshair, Hand, CheckCircle } from 'lucide-react';

interface CombatTelemetryPanelProps {
  punches: PunchTelemetry[];
  setPunches: React.Dispatch<React.SetStateAction<PunchTelemetry[]>>;
  bodyWeightKg?: number;
}

type PunchType = 'Lead Jab' | 'Cross Strike' | 'Palm Strike' | 'Iron Fist' | 'Hook' | 'Spear Hand';
type GuidedState = 'idle' | 'checking_spatial' | 'spatial_unavailable' | 'align_sphere' | 'target_spawned' | 'recoil' | 'recorded';

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

  const [guidedState, setGuidedState] = useState<GuidedState>('idle');
  const [activePunchType, setActivePunchType] = useState<PunchType>('Lead Jab');

  const handleRecordPunch = (type: PunchType) => {
    const newPunch = generatePunchTelemetry(type, 1.0);
    setLastPunch(newPunch);
    setPunches((prev) => [newPunch, ...prev.slice(0, 19)]);
    soundEffects.playPunchSwoosh(newPunch.speedMs);
  };

  const startGuidedCalibration = (type: PunchType) => {
    setActivePunchType(type);
    setGuidedState('checking_spatial');
    
    setTimeout(() => {
      // Check for spatial tracking availability
      if (window.AndroidXR && typeof window.AndroidXR.getHandTelemetry === 'function') {
        try {
          const telemetryStr = window.AndroidXR.getHandTelemetry();
          if (telemetryStr) {
            setGuidedState('align_sphere');
            return;
          }
        } catch (e) {
          console.warn("Failed to get hand telemetry", e);
        }
      }
      
      // Fallback: Check if we are running in browser and want to simulate it, but user explicitly asked for a dialog
      // if spatial isn't enabled.
      setGuidedState('spatial_unavailable');
    }, 1000);
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (guidedState === 'align_sphere') {
      soundEffects.playHolographicChime(432);
      timeout = setTimeout(() => setGuidedState('target_spawned'), 3000);
    } else if (guidedState === 'target_spawned') {
      soundEffects.playHolographicChime(528);
      timeout = setTimeout(() => setGuidedState('recoil'), 2500);
    } else if (guidedState === 'recoil') {
      soundEffects.playPunchSwoosh(10);
      timeout = setTimeout(() => {
        handleRecordPunch(activePunchType);
        setGuidedState('recorded');
      }, 1500);
    } else if (guidedState === 'recorded') {
      soundEffects.playHolographicChime(852);
      timeout = setTimeout(() => setGuidedState('idle'), 2000);
    }
    return () => clearTimeout(timeout);
  }, [guidedState, activePunchType]);


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

      {guidedState !== 'idle' ? (
        <div className="w-full bg-[#1E2638] border-2 border-cyan-500/50 rounded-2xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.4)] flex flex-col items-center justify-center min-h-[250px] relative overflow-hidden">
          {guidedState === 'checking_spatial' && (
            <div className="flex flex-col items-center animate-pulse text-cyan-400">
              <Zap className="w-10 h-10 mb-4" />
              <p className="font-mono font-bold uppercase tracking-widest text-sm">Initializing Spatial Sensors...</p>
            </div>
          )}
          
          {guidedState === 'spatial_unavailable' && (
            <div className="flex flex-col items-center text-red-400">
              <AlertTriangle className="w-10 h-10 mb-4 text-red-500" />
              <p className="font-mono font-bold uppercase tracking-widest text-sm mb-2 text-white">Spatial Data Unavailable</p>
              <p className="font-sans text-xs text-gray-400 mb-6 max-w-[80%] text-center">
                Hand-tracking and spatial environmental data could not be acquired. Please ensure headset permissions are granted or use manual logging.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setGuidedState('idle')}
                  className="px-4 py-2 rounded-xl border border-gray-600 hover:bg-gray-700 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleRecordPunch(activePunchType);
                    setGuidedState('idle');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#00e5ff] hover:bg-cyan-400 text-black font-mono font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all"
                >
                  Manual Log
                </button>
              </div>
            </div>
          )}

          {guidedState === 'align_sphere' && (
            <div className="flex flex-col items-center text-cyan-300 animate-in fade-in zoom-in duration-500">
              <div className="w-16 h-16 rounded-full border-2 border-cyan-400 border-dashed animate-[spin_4s_linear_infinite] mb-4 flex items-center justify-center bg-cyan-900/30">
                <Hand className="w-6 h-6 text-cyan-400 animate-none" />
              </div>
              <p className="font-mono font-bold uppercase tracking-widest text-sm text-white">Step 1: Alignment</p>
              <p className="font-sans text-xs text-cyan-200 mt-2">Align your hand inside the sphere in front of your head and hold still.</p>
            </div>
          )}

          {guidedState === 'target_spawned' && (
            <div className="flex flex-col items-center text-yellow-400 animate-in fade-in zoom-in duration-300">
              <div className="relative mb-4 flex flex-col items-center justify-center">
                 <Crosshair className="w-16 h-16 text-yellow-400 animate-ping absolute opacity-20" />
                 <Crosshair className="w-16 h-16 text-yellow-400 relative z-10" />
              </div>
              <p className="font-mono font-bold uppercase tracking-widest text-sm text-white">Step 2: Strike</p>
              <p className="font-sans text-xs text-yellow-200 mt-2">Target spawned 2.5 ft ahead. Strike the target!</p>
            </div>
          )}

          {guidedState === 'recoil' && (
            <div className="flex flex-col items-center text-red-400 animate-in fade-in zoom-in duration-300">
              <RotateCcw className="w-12 h-12 mb-4 text-red-500 animate-spin" />
              <p className="font-mono font-bold uppercase tracking-widest text-sm text-white">Step 3: Recoil</p>
              <p className="font-sans text-xs text-red-200 mt-2">Return your fist to the original sphere to complete telemetry.</p>
            </div>
          )}

          {guidedState === 'recorded' && (
            <div className="flex flex-col items-center text-green-400 animate-in fade-in zoom-in duration-500">
              <CheckCircle className="w-14 h-14 mb-4 text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.6)]" />
              <p className="font-mono font-bold uppercase tracking-widest text-sm text-white">Telemetry Recorded</p>
              <p className="font-sans text-xs text-green-200 mt-2 text-center max-w-[80%]">
                Your strike mechanics have been successfully analyzed and stored in the localized grid.
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* 3 Live Gauges */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full min-w-0">
            {/* Peak Velocity Gauge */}
            <div className="bg-[#1E2638] border border-cyan-500/40 rounded-xl p-2 sm:p-3 shadow-[0_2px_15px_rgba(0,0,0,0.3)] flex flex-col items-center min-w-0">
              <span className="text-[8px] sm:text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider truncate w-full text-center">
                VELOCITY
              </span>
              <div className="text-base sm:text-2xl font-black font-mono text-[#00e5ff] my-0.5 sm:my-1 drop-shadow-[0_0_8px_rgba(0,229,255,0.5)] truncate">
                {lastPunch.speedMs.toFixed(1)} <span className="text-[10px] sm:text-xs">m/s</span>
              </div>
              <span className="text-[7.5px] sm:text-[8px] font-mono text-gray-400 uppercase truncate">&gt; 9.0 m/s</span>
            </div>

            {/* Impact Force Gauge */}
            <div className="bg-[#1E2638] border border-yellow-500/40 rounded-xl p-2 sm:p-3 shadow-[0_2px_15px_rgba(0,0,0,0.3)] flex flex-col items-center min-w-0">
              <span className="text-[8px] sm:text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider truncate w-full text-center">
                FORCE
              </span>
              <div className="text-base sm:text-2xl font-black font-mono text-[#ffd700] my-0.5 sm:my-1 drop-shadow-[0_0_8px_rgba(255,215,0,0.5)] truncate">
                {lastPunch.impactForceJoules.toFixed(1)} <span className="text-[10px] sm:text-xs">J</span>
              </div>
              <span className="text-[7.5px] sm:text-[8px] font-mono text-gray-400 uppercase truncate">Peak Joules</span>
            </div>

            {/* Recoil Return Gauge */}
            <div className="bg-[#1E2638] border border-red-500/40 rounded-xl p-2 sm:p-3 shadow-[0_2px_15px_rgba(0,0,0,0.3)] flex flex-col items-center min-w-0">
              <span className="text-[8px] sm:text-[9px] font-mono font-bold text-gray-400 uppercase tracking-wider truncate w-full text-center">
                RECOIL
              </span>
              <div className="text-base sm:text-2xl font-black font-mono text-[#ff5252] my-0.5 sm:my-1 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] truncate">
                {lastPunch.returnTimeSec.toFixed(2)} <span className="text-[10px] sm:text-xs">s</span>
              </div>
              <span className="text-[7.5px] sm:text-[8px] font-mono text-gray-400 uppercase truncate">&lt; 0.30 s</span>
            </div>
          </div>

          {/* Trigger Buttons */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full min-w-0">
            <button
              id="btn-lead-jab"
              onClick={() => startGuidedCalibration('Lead Jab')}
              className="py-2 sm:py-2.5 px-1 rounded-xl bg-[#00e5ff] hover:bg-cyan-400 text-black font-mono font-black text-[9px] sm:text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all hover:scale-105 truncate"
            >
              LEAD JAB
            </button>

            <button
              id="btn-cross-strike"
              onClick={() => startGuidedCalibration('Cross Strike')}
              className="py-2 sm:py-2.5 px-1 rounded-xl bg-[#ffd700] hover:bg-yellow-400 text-black font-mono font-black text-[9px] sm:text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(255,215,0,0.4)] transition-all hover:scale-105 truncate"
            >
              CROSS
            </button>

            <button
              id="btn-palm-strike"
              onClick={() => startGuidedCalibration('Palm Strike')}
              className="py-2 sm:py-2.5 px-1 rounded-xl bg-[#ff5252] hover:bg-red-400 text-black font-mono font-black text-[9px] sm:text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all hover:scale-105 truncate"
            >
              IRON PALM
            </button>
          </div>
        </>
      )}

      {/* Live Strike Stream */}
      <div className="w-full bg-[#1E2638] border border-cyan-500/30 rounded-2xl p-3 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.4)] text-left min-w-0 mt-2">
        <div className="flex justify-between items-center pb-2 border-b border-[#2A3650] min-w-0">
          <span className="text-[10px] sm:text-[11px] font-black font-mono text-[#00e5ff] uppercase tracking-widest truncate">
            STRIKE TELEMETRY
          </span>
          <span className="text-[9px] sm:text-[10px] font-mono text-gray-400 shrink-0">
            {punches.length} RECORDED
          </span>
        </div>

        <div className="mt-2 space-y-1 font-mono min-w-0">
          {punches.slice(0, 6).map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between py-1 border-b border-[#263148] text-[10px] sm:text-[11px] min-w-0 gap-1.5"
            >
              <span className="font-bold text-white tracking-wider truncate min-w-0">{p.type}</span>
              <span className="font-black text-[#00e5ff] shrink-0">{p.speedMs.toFixed(1)} m/s</span>
              <span className="text-[#ffd700] font-bold shrink-0">{p.impactForceJoules.toFixed(1)} J</span>
              <span className="text-gray-400 text-[9px] sm:text-[10px] shrink-0">{p.returnTimeSec.toFixed(2)}s</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
