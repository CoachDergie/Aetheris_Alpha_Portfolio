import React, { useState } from 'react';
import { QiGongBarbellSession, DailyInvocation } from '../types';
import { calculateBarbellKcal, soundEffects } from '../utils/telemetry';
import { Dumbbell, Zap, Flame, RotateCcw, Check } from 'lucide-react';

interface QiGongBarbellPanelProps {
  session: QiGongBarbellSession;
  setSession: React.Dispatch<React.SetStateAction<QiGongBarbellSession>>;
  onExportPdf?: () => void;
  dayInvocation?: DailyInvocation;
}

export const QiGongBarbellPanel: React.FC<QiGongBarbellPanelProps> = ({
  session,
  setSession,
  onExportPdf,
  dayInvocation,
}) => {
  const [repCount, setRepCount] = useState<number>(session.reps || 12);
  const [setCount, setSetCount] = useState<number>(session.sets || 5);

  const handleLogRep = () => {
    soundEffects.playHolographicChime(528);
    setRepCount((r) => r + 1);
    setSession((prev) => ({
      ...prev,
      reps: prev.reps + 1,
      estimatedKcal: prev.estimatedKcal + 4,
    }));
  };

  const handleResetSession = () => {
    setRepCount(12);
    setSetCount(5);
    setSession((prev) => ({
      ...prev,
      sets: 5,
      reps: 12,
      estimatedKcal: 198,
    }));
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-5xl mx-auto p-4 sm:p-6 text-center">
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-black font-mono tracking-widest text-[#ffd700] uppercase drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]">
          ⚡ 6-FT BARBELL QI-GONG CONDITIONING
        </h2>
        <p className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
          ZINC-IMBUED BARBELL // HORSE STANCE (MA BU) ROOTING MATRIX
        </p>
      </div>

      {/* Main Condition Card matching Headset */}
      <div className="w-full bg-gradient-to-b from-[#141b2e]/90 to-[#0a0e1a]/95 border-2 border-yellow-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_30px_rgba(255,215,0,0.2)] flex flex-col items-center">
        <h3 className="text-base sm:text-lg font-black font-mono text-[#ffd700] uppercase tracking-wider">
          {session.movementName.toUpperCase()}
        </h3>

        <p className="text-xs font-mono text-gray-300 mt-2">
          STANCE: <strong className="text-white">{session.focusStance}</strong>
        </p>
        <p className="text-xs font-mono font-bold text-[#00e5ff] mt-0.5">
          COSMIC HOUR: {session.associatedPlanetaryHour.toUpperCase()}
        </p>

        {/* 4 Stat Blocks */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full my-8 pt-6 border-t border-gray-800">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">
              BAR LENGTH
            </span>
            <span className="text-2xl font-black font-mono text-[#ffd700] mt-1">
              {session.barbellLengthFt} FT
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">
              BAR WEIGHT
            </span>
            <span className="text-2xl font-black font-mono text-[#00e5ff] mt-1">
              {session.barbellWeightKg} KG
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">
              SETS / REPS
            </span>
            <span className="text-2xl font-black font-mono text-[#ffd700] mt-1">
              {setCount} x {repCount}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">
              ENERGY
            </span>
            <span className="text-2xl font-black font-mono text-[#34d399] mt-1">
              {session.estimatedKcal} KCAL
            </span>
          </div>
        </div>

        {/* Log Rep Button matching Headset */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            id="btn-log-barbell-rep"
            onClick={handleLogRep}
            className="px-8 py-3.5 rounded-xl bg-[#ffd700] hover:bg-yellow-400 text-black font-mono font-black text-xs uppercase tracking-widest shadow-[0_0_25px_rgba(255,215,0,0.6)] transition-all hover:scale-105"
          >
            LOG STANCE REP (+4 KCAL)
          </button>

          <button
            onClick={handleResetSession}
            className="p-3 rounded-xl bg-black/40 border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white transition-colors"
            title="Reset Session"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
