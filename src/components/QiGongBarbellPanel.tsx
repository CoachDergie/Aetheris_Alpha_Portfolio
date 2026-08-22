import React, { useState } from 'react';
import { QiGongBarbellSession } from '../types';
import { Dumbbell, Flame, Clock, RefreshCw, FileText, ChevronDown, Activity, Target } from 'lucide-react';
import { MARTIAL_MOVEMENTS } from '../utils/exercises';

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

  const handleExerciseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = MARTIAL_MOVEMENTS.find(m => m.name === e.target.value);
    if (selected) {
      setSession(prev => ({
        ...prev,
        movementName: selected.name,
        focusStance: selected.focus,
        associatedPlanetaryHour: selected.planet,
        // Calculate new estimated kcal based on MET and current duration/weight
        estimatedKcal: Math.round((selected.met * 3.5 * (prev.userBodyWeightKg + (prev.barbellWeightKg * 0.85)) / 200) * prev.durationMinutes * 10) / 10
      }));
    }
  };

  const handleUpdate = (field: keyof QiGongBarbellSession, value: any) => {
    setSession((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Recalculate kcal if weight or duration changes
      if (['userBodyWeightKg', 'barbellWeightKg', 'durationMinutes'].includes(field)) {
        const currentEx = MARTIAL_MOVEMENTS.find(m => m.name === prev.movementName) || MARTIAL_MOVEMENTS[0];
        updated.estimatedKcal = Math.round((currentEx.met * 3.5 * (updated.userBodyWeightKg + (updated.barbellWeightKg * 0.85)) / 200) * updated.durationMinutes * 10) / 10;
      }
      return updated;
    });
  };

  const currentExercise = MARTIAL_MOVEMENTS.find(m => m.name === session.movementName) || MARTIAL_MOVEMENTS[0];

  return (
    <div className="flex flex-col items-center gap-4 w-full p-2.5 sm:p-4 text-center">
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-base sm:text-lg font-black font-mono tracking-widest text-[#ffd700] uppercase drop-shadow-[0_0_12px_rgba(255,215,0,0.6)]">
          ⚡ MARTIAL & CALISTHENICS TRAINING
        </h2>
        <p className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider">
          EASTERN & WESTERN ALIGNMENT PROTOCOLS
        </p>
      </div>

      {/* Movement Selector */}
      <div className="w-full relative">
        <select 
          value={session.movementName}
          onChange={handleExerciseChange}
          className="w-full appearance-none bg-[#1E2638] border border-cyan-500/50 rounded-xl px-4 py-3 text-cyan-400 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider focus:outline-none focus:border-cyan-300 shadow-[0_2px_15px_rgba(0,0,0,0.3)]"
        >
          {MARTIAL_MOVEMENTS.map(ex => (
            <option key={ex.name} value={ex.name} className="bg-[#121824] text-white">
              [{ex.type}] {ex.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500 pointer-events-none" />
      </div>

      {/* Parameters Adjuster */}
      <div className="grid grid-cols-2 gap-2 w-full">
        <div className="bg-[#1E2638] border border-[#2E3B57] rounded-xl p-3 flex flex-col items-center">
          <label className="text-[9px] font-mono text-gray-400 uppercase font-bold mb-1">Resistance / Weight (KG)</label>
          <input 
            type="number" 
            value={session.barbellWeightKg}
            onChange={(e) => handleUpdate('barbellWeightKg', Number(e.target.value))}
            className="bg-[#121824] border border-[#2E3B57] text-[#ffd700] font-black font-mono text-lg text-center w-24 rounded-lg focus:outline-none focus:border-yellow-500/50"
          />
        </div>
        <div className="bg-[#1E2638] border border-[#2E3B57] rounded-xl p-3 flex flex-col items-center">
          <label className="text-[9px] font-mono text-gray-400 uppercase font-bold mb-1">Duration (MINS)</label>
          <input 
            type="number" 
            value={session.durationMinutes}
            onChange={(e) => handleUpdate('durationMinutes', Number(e.target.value))}
            className="bg-[#121824] border border-[#2E3B57] text-[#00e5ff] font-black font-mono text-lg text-center w-24 rounded-lg focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 w-full min-w-0">
        <div className="bg-[#1E2638] border border-yellow-500/30 rounded-xl p-2 sm:p-3 shadow-[0_2px_15px_rgba(0,0,0,0.3)] min-w-0">
          <span className="text-[8px] sm:text-[9px] font-mono text-gray-400 uppercase font-bold truncate block">LOAD WT</span>
          <div className="text-base sm:text-xl font-black font-mono text-[#ffd700] my-0.5 truncate">
            {session.barbellWeightKg} <span className="text-[10px] sm:text-xs">KG</span>
          </div>
          <span className="text-[8px] sm:text-[9px] font-mono text-cyan-300 font-bold truncate block">RESISTANCE</span>
        </div>

        <div className="bg-[#1E2638] border border-cyan-500/30 rounded-xl p-2 sm:p-3 shadow-[0_2px_15px_rgba(0,0,0,0.3)] min-w-0">
          <span className="text-[8px] sm:text-[9px] font-mono text-gray-400 uppercase font-bold truncate block">SETS x REPS</span>
          <div className="text-base sm:text-xl font-black font-mono text-[#00e5ff] my-0.5 truncate">
            {session.sets} x {session.reps}
          </div>
          <span className="text-[8px] sm:text-[9px] font-mono text-gray-400 truncate block">{session.durationMinutes} MINS</span>
        </div>

        <div className="bg-[#1E2638] border border-orange-500/30 rounded-xl p-2 sm:p-3 shadow-[0_2px_15px_rgba(0,0,0,0.3)] min-w-0">
          <span className="text-[8px] sm:text-[9px] font-mono text-gray-400 uppercase font-bold truncate block">EXPENDITURE</span>
          <div className="text-base sm:text-xl font-black font-mono text-orange-400 my-0.5 truncate">
            {session.estimatedKcal} <span className="text-[10px] sm:text-xs">KCAL</span>
          </div>
          <span className="text-[8px] sm:text-[9px] font-mono text-gray-400 font-bold truncate block">METABOLIC</span>
        </div>

        <div className="bg-[#1E2638] border border-emerald-500/30 rounded-xl p-2 sm:p-3 shadow-[0_2px_15px_rgba(0,0,0,0.3)] min-w-0">
          <span className="text-[8px] sm:text-[9px] font-mono text-gray-400 uppercase font-bold truncate block">ALIGNMENT</span>
          <div className="text-[11px] sm:text-xs font-black font-mono text-emerald-400 my-1 truncate">
            {session.focusStance.split('(')[0]}
          </div>
          <span className="text-[8px] sm:text-[9px] font-mono text-gray-400 font-bold truncate block">ROOTED</span>
        </div>
      </div>

      {/* Movement & Planetary Correlation Box */}
      <div className="w-full bg-[#1E2638] border border-[#2E3B57] rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)] text-left space-y-4 min-w-0">
        <div className="flex items-center justify-between pb-3 border-b border-[#2A3650] min-w-0">
          <span className="text-[10px] sm:text-[11px] font-black font-mono text-[#ffd700] uppercase tracking-wider truncate">
            {currentExercise.type} KINETICS
          </span>
          <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded bg-[#122238] border border-cyan-500/40 text-cyan-300 font-bold shrink-0">
            {session.associatedPlanetaryHour}
          </span>
        </div>
        
        <div className="space-y-3 min-w-0">
          <p className="text-[11px] sm:text-xs text-gray-300 font-sans leading-relaxed break-words">
            {currentExercise.desc}
          </p>

          <div className="bg-[#161B26] p-3 rounded-lg border border-[#2A3650] space-y-2">
            <div className="flex items-start gap-2">
              <Activity className="w-3.5 h-3.5 text-orange-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-[9px] font-mono text-orange-400 font-bold uppercase tracking-wider block mb-0.5">Target Musculature</span>
                <span className="text-[10px] sm:text-[11px] text-gray-300 font-sans leading-tight block">{currentExercise.targetMuscles}</span>
              </div>
            </div>
            
            <div className="flex items-start gap-2 pt-2 border-t border-[#2A3650]">
              <Target className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-wider block mb-0.5">Form & Posture Cues</span>
                <span className="text-[10px] sm:text-[11px] text-gray-300 font-sans leading-tight block">{currentExercise.formCues}</span>
              </div>
            </div>
          </div>
        </div>

        {onExportPdf && (
          <div className="pt-2">
            <button
              onClick={onExportPdf}
              className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black font-mono font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(255,215,0,0.3)] transition-all"
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
