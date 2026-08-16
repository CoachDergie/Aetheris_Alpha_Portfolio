import React, { useState } from 'react';
import { QiGongBarbellSession, DailyInvocation } from '../types';
import { MARTIAL_MOVEMENTS, calculateBarbellKcal, soundEffects } from '../utils/telemetry';
import { DAILY_INVOCATIONS } from '../utils/astronomy';
import { Dumbbell, Flame, Volume2, Shield, Sparkles, CheckCircle, RefreshCw } from 'lucide-react';

interface QiGongBarbellPanelProps {
  session: QiGongBarbellSession;
  setSession: React.Dispatch<React.SetStateAction<QiGongBarbellSession>>;
  onExportPdf: () => void;
  dayInvocation: DailyInvocation;
}

export const QiGongBarbellPanel: React.FC<QiGongBarbellPanelProps> = ({
  session,
  setSession,
  onExportPdf,
  dayInvocation,
}) => {
  const [selectedDayIdx, setSelectedDayIdx] = useState(new Date().getDay());
  const [selectedMovementIdx, setSelectedMovementIdx] = useState(0);
  const [isChanting, setIsChanting] = useState(false);

  const activeInvocation = DAILY_INVOCATIONS[selectedDayIdx] || dayInvocation;
  const currentMovement = MARTIAL_MOVEMENTS[selectedMovementIdx] || MARTIAL_MOVEMENTS[0];

  const handleBodyWeightChange = (val: number) => {
    const newWeight = Math.max(30, Math.min(250, val));
    const newKcal = calculateBarbellKcal(newWeight, session.barbellWeightKg, currentMovement.met, session.durationMinutes);
    setSession((prev) => ({
      ...prev,
      userBodyWeightKg: newWeight,
      estimatedKcal: newKcal,
    }));
  };

  const handleBarbellWeightChange = (val: number) => {
    const newBarWeight = Math.max(5, Math.min(100, val));
    const newKcal = calculateBarbellKcal(session.userBodyWeightKg, newBarWeight, currentMovement.met, session.durationMinutes);
    setSession((prev) => ({
      ...prev,
      barbellWeightKg: newBarWeight,
      estimatedKcal: newKcal,
    }));
  };

  const handleDurationChange = (minutes: number) => {
    const newMins = Math.max(1, Math.min(180, minutes));
    const newKcal = calculateBarbellKcal(session.userBodyWeightKg, session.barbellWeightKg, currentMovement.met, newMins);
    setSession((prev) => ({
      ...prev,
      durationMinutes: newMins,
      estimatedKcal: newKcal,
    }));
  };

  const handleMovementSelect = (idx: number) => {
    setSelectedMovementIdx(idx);
    const mov = MARTIAL_MOVEMENTS[idx];
    const newKcal = calculateBarbellKcal(session.userBodyWeightKg, session.barbellWeightKg, mov.met, session.durationMinutes);
    setSession((prev) => ({
      ...prev,
      movementName: mov.name,
      estimatedKcal: newKcal,
      focusStance: mov.focus,
    }));
    soundEffects.playHolographicChime(528);
  };

  const handleReciteInvocation = () => {
    setIsChanting(true);
    soundEffects.playHolographicChime(396);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`${activeInvocation.barbarousFormula}. ${activeInvocation.invocationText}`);
      utterance.rate = 0.85;
      utterance.pitch = 0.75;
      utterance.onend = () => setIsChanting(false);
      utterance.onerror = () => setIsChanting(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsChanting(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      {/* 1. Daily Invocations & Barbarous Names Card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl transition-all hover:border-orange-500/30">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-orange-400 font-mono flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            Qi-Gong Alignment & Barbarous Formula
          </h2>
          {/* Day of Week Selector */}
          <select
            value={selectedDayIdx}
            onChange={(e) => setSelectedDayIdx(Number(e.target.value))}
            className="bg-black/60 border border-white/15 rounded text-[10px] font-mono text-orange-300 px-2 py-0.5 outline-none"
          >
            {DAILY_INVOCATIONS.map((d, i) => (
              <option key={d.dayOfWeek} value={i} className="bg-neutral-900 text-white">
                {d.dayOfWeek} ({d.planet.split('/')[0].trim()})
              </option>
            ))}
          </select>
        </div>

        {/* Daily Invocations Quote Box */}
        <div className="space-y-3 font-mono">
          <div className="p-3 bg-black/40 rounded-xl border-l-2 border-orange-500 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[9px] uppercase tracking-wider text-orange-400 font-bold">
                Barbarous True Name Formula
              </span>
              <span className="text-[9px] text-gray-500">{activeInvocation.focusQlipha}</span>
            </div>
            <p className="text-xs font-bold text-orange-200 tracking-wider">
              "{activeInvocation.barbarousFormula}"
            </p>
            <p className="text-[11px] text-gray-300 italic opacity-90 leading-relaxed">
              "{activeInvocation.invocationText}"
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={handleReciteInvocation}
              disabled={isChanting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-950/60 hover:bg-orange-900 border border-orange-700/60 text-orange-300 text-[10px] uppercase font-mono transition-colors"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isChanting ? 'animate-bounce text-orange-400' : ''}`} />
              <span>{isChanting ? 'Chanting Formula...' : 'Chant True Names'}</span>
            </button>

            <span className="text-[10px] text-gray-400">
              Martial: <strong className="text-white">{activeInvocation.martialCorrelation.split('&')[0]}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 2. 6-Foot Trimmed Zinc Barbell Conditioning & kCal Calculator */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-orange-400 font-mono flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-orange-500" />
              6-Foot Zinc Barbell Conditioning
            </h2>
            <span className="text-[10px] font-mono text-orange-300 font-bold">
              6FT | {session.barbellWeightKg}KG SLEEVELESS
            </span>
          </div>

          {/* Biometric Variables Inputs */}
          <div className="grid grid-cols-3 gap-2.5 mb-3 font-mono">
            <div className="p-2 bg-black/40 rounded-xl border border-white/5">
              <label className="text-[9px] uppercase text-gray-400 block mb-0.5">Body Mass</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="35"
                  max="200"
                  value={session.userBodyWeightKg}
                  onChange={(e) => handleBodyWeightChange(Number(e.target.value))}
                  className="w-full bg-transparent text-white text-base font-bold outline-none"
                />
                <span className="text-[10px] text-gray-500">kg</span>
              </div>
            </div>

            <div className="p-2 bg-black/40 rounded-xl border border-white/5">
              <label className="text-[9px] uppercase text-gray-400 block mb-0.5">Zinc Bar Load</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={session.barbellWeightKg}
                  onChange={(e) => handleBarbellWeightChange(Number(e.target.value))}
                  className="w-full bg-transparent text-white text-base font-bold outline-none"
                />
                <span className="text-[10px] text-gray-500">kg</span>
              </div>
            </div>

            <div className="p-2 bg-black/40 rounded-xl border border-white/5">
              <label className="text-[9px] uppercase text-gray-400 block mb-0.5">Duration</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={session.durationMinutes}
                  onChange={(e) => handleDurationChange(Number(e.target.value))}
                  className="w-full bg-transparent text-white text-base font-bold outline-none"
                />
                <span className="text-[10px] text-gray-500">min</span>
              </div>
            </div>
          </div>

          {/* Movement Stance Selector */}
          <div className="space-y-1.5 mb-3 font-mono">
            <label className="text-[9px] uppercase text-gray-400 block">Kung-Fu Qi-Gong Movement Pattern</label>
            <div className="space-y-1">
              {MARTIAL_MOVEMENTS.map((mov, idx) => (
                <button
                  key={mov.name}
                  onClick={() => handleMovementSelect(idx)}
                  className={`w-full text-left p-2 rounded-lg border text-[10px] flex items-center justify-between transition-all ${
                    selectedMovementIdx === idx
                      ? 'bg-orange-600/20 border-orange-500 text-orange-200'
                      : 'bg-black/30 border-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="truncate pr-2 font-medium">{mov.name}</span>
                  <span className="text-[9px] text-orange-400 flex-shrink-0">MET {mov.met}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Energy Usage (kCal) Output Banner */}
          <div className="p-3 bg-gradient-to-r from-orange-950/40 to-black rounded-xl border border-orange-800/40 flex items-center justify-between font-mono">
            <div>
              <p className="text-[9px] text-gray-400 uppercase">Estimated Metabolic Energy</p>
              <p className="text-2xl font-bold text-orange-300">
                {session.estimatedKcal} <span className="text-xs font-normal text-gray-400">kCal</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-gray-400 uppercase">Focus Stance</p>
              <p className="text-[10px] text-white max-w-[150px] truncate">{session.focusStance}</p>
            </div>
          </div>
        </div>

        {/* Export PDF Button matching Design HTML */}
        <div className="flex justify-center pt-3">
          <button
            id="export-pdf-qigong-btn"
            onClick={onExportPdf}
            className="w-full px-4 py-2.5 bg-white/10 hover:bg-white/20 transition-all border border-white/20 rounded-xl text-xs uppercase tracking-widest font-mono text-white flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
          >
            <span>Export Astrology & Telemetry PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
