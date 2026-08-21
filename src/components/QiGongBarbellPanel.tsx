import React from 'react';
import { QiGongBarbellSession } from '../types';
import { Dumbbell, Flame, Clock, RefreshCw, FileText } from 'lucide-react';

interface QiGongBarbellPanelProps {
  session: QiGongBarbellSession;
  setSession: React.Dispatch<React.SetStateAction<QiGongBarbellSession>>;
  onExportPdf?: () => void;
}

export const QiGongBarbellPanel: React.FC<QiGongBarbellPanelProps> = ({
  session,
  setSession,
  onExportPdf,
}) => {
  const handleUpdate = (field: keyof QiGongBarbellSession, value: any) => {
    setSession((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full p-2.5 sm:p-4 text-center">
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-base sm:text-lg font-black font-mono tracking-widest text-[#ffd700] uppercase drop-shadow-[0_0_12px_rgba(255,215,0,0.6)]">
          ⚡ QI-GONG BARBELL KINETICS
        </h2>
        <p className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider">
          ROOTED STANCE (MA BU) • HEAVY LEVER DYNAMICS
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
        <div className="bg-[#1E2638] border border-yellow-500/30 rounded-xl p-3 shadow-[0_2px_15px_rgba(0,0,0,0.3)]">
          <span className="text-[9px] font-mono text-gray-400 uppercase font-bold">BARBELL WEIGHT</span>
          <div className="text-xl font-black font-mono text-[#ffd700] my-0.5">
            {session.barbellWeightKg} <span className="text-xs">KG</span>
          </div>
          <span className="text-[9px] font-mono text-cyan-300 font-bold">{session.barbellLengthFt} FT LEVER</span>
        </div>

        <div className="bg-[#1E2638] border border-cyan-500/30 rounded-xl p-3 shadow-[0_2px_15px_rgba(0,0,0,0.3)]">
          <span className="text-[9px] font-mono text-gray-400 uppercase font-bold">SETS x REPS</span>
          <div className="text-xl font-black font-mono text-[#00e5ff] my-0.5">
            {session.sets} x {session.reps}
          </div>
          <span className="text-[9px] font-mono text-gray-400">{session.durationMinutes} MINS</span>
        </div>

        <div className="bg-[#1E2638] border border-orange-500/30 rounded-xl p-3 shadow-[0_2px_15px_rgba(0,0,0,0.3)]">
          <span className="text-[9px] font-mono text-gray-400 uppercase font-bold">EST. EXPENDITURE</span>
          <div className="text-xl font-black font-mono text-orange-400 my-0.5">
            {session.estimatedKcal} <span className="text-xs">KCAL</span>
          </div>
          <span className="text-[9px] font-mono text-gray-400 font-bold">METABOLIC</span>
        </div>

        <div className="bg-[#1E2638] border border-emerald-500/30 rounded-xl p-3 shadow-[0_2px_15px_rgba(0,0,0,0.3)]">
          <span className="text-[9px] font-mono text-gray-400 uppercase font-bold">STANCE ALIGNMENT</span>
          <div className="text-xs font-black font-mono text-emerald-400 my-1 truncate">
            {session.focusStance.split('(')[0]}
          </div>
          <span className="text-[9px] font-mono text-gray-400 font-bold">ROOTED</span>
        </div>
      </div>

      {/* Movement & Planetary Correlation Box */}
      <div className="w-full bg-[#1E2638] border border-[#2E3B57] rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)] text-left space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#2A3650]">
          <span className="text-[11px] font-black font-mono text-[#ffd700] uppercase tracking-wider">
            QI-GONG MOVEMENT FORM
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#122238] border border-cyan-500/40 text-cyan-300 font-bold">
            {session.associatedPlanetaryHour}
          </span>
        </div>

        <div className="space-y-1">
          <div className="text-sm font-black font-mono text-white">
            {session.movementName}
          </div>
          <p className="text-xs text-gray-300 font-sans leading-relaxed">
            Integrating deep pelvic floor breathing with barbell stabilization. Generates immense martial internal power (Fa Jin) while reinforcing bone density along the sagittal plane.
          </p>
        </div>

        {onExportPdf && (
          <div className="pt-2">
            <button
              onClick={onExportPdf}
              className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black font-mono font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(255,215,0,0.3)] transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>EXPORT MARTIAL DOSSIER (PDF)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
