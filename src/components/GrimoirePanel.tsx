import React, { useState } from 'react';
import { DiscoveredIncantation } from '../utils/incantationDiscovery';
import { DAILY_INVOCATIONS } from '../utils/astronomy';
import { soundEffects } from '../utils/telemetry';
import { BookOpen, Volume2, Sparkles, Plus, Search, Check, Flame } from 'lucide-react';

interface GrimoirePanelProps {
  grimoire: DiscoveredIncantation[];
  setGrimoire: React.Dispatch<React.SetStateAction<DiscoveredIncantation[]>>;
  activeDailyInvocation: DiscoveredIncantation;
  setActiveDailyInvocation: (inc: DiscoveredIncantation) => void;
  onDiscoverNew?: (queryPrompt?: string) => void;
}

export const GrimoirePanel: React.FC<GrimoirePanelProps> = ({
  grimoire,
  setGrimoire,
  activeDailyInvocation,
  setActiveDailyInvocation,
  onDiscoverNew,
}) => {
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(new Date().getDay());
  const [isChanting, setIsChanting] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');

  const currentDaily = DAILY_INVOCATIONS[selectedDayIdx] || DAILY_INVOCATIONS[0];

  const handleChantFormula = (formula: string, text: string) => {
    setIsChanting(true);
    soundEffects.playHolographicChime(528);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`${formula}. ${text}`);
      utterance.rate = 0.8;
      utterance.pitch = 0.7;
      utterance.onend = () => setIsChanting(false);
      utterance.onerror = () => setIsChanting(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsChanting(false), 2500);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-5xl mx-auto p-4 sm:p-6 text-center">
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-black font-mono tracking-widest text-[#00e5ff] uppercase drop-shadow-[0_0_15px_rgba(0,229,255,0.6)]">
          📜 ESOTERIC GRIMOIRE & INVOCATIONS
        </h2>
        <p className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
          Barbarous True Names • Planetary Spheres • Martial Harmonics
        </p>
      </div>

      {/* Day Selector */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full no-scrollbar">
        {DAILY_INVOCATIONS.map((inv, idx) => (
          <button
            key={inv.dayOfWeek}
            onClick={() => setSelectedDayIdx(idx)}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold uppercase transition-all whitespace-nowrap ${
              selectedDayIdx === idx
                ? 'bg-cyan-950 border border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                : 'bg-black/40 border border-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {inv.dayOfWeek} ({inv.planet.split('/')[0].trim()})
          </button>
        ))}
      </div>

      {/* Active Daily Planetary Invocation Card */}
      <div className="w-full bg-gradient-to-b from-[#141b2e]/90 to-[#0a0e1a]/95 border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_30px_rgba(0,229,255,0.2)] text-left flex flex-col justify-between">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-cyan-500/20 gap-2">
            <div>
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                PLANETARY CURRENT
              </span>
              <h3 className="text-lg font-black font-mono text-white uppercase">
                {currentDaily.planet} // {currentDaily.focusQlipha}
              </h3>
            </div>

            <div className="px-3 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/40 text-[#ffd700] text-xs font-mono font-bold">
              MARTIAL: {currentDaily.martialCorrelation}
            </div>
          </div>

          {/* Barbarous Formula */}
          <div className="my-6 p-4 rounded-2xl bg-black/60 border border-cyan-500/30">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block mb-1">
              BARBAROUS FORMULA
            </span>
            <p className="text-base sm:text-lg font-black font-mono text-[#ffd700] tracking-wider drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]">
              "{currentDaily.barbarousFormula}"
            </p>
          </div>

          {/* Invocation Text */}
          <div className="p-4 rounded-2xl bg-black/40 border border-gray-800">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block mb-1">
              INVOCATION TRANSMISSION
            </span>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed italic">
              "{currentDaily.invocationText}"
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => handleChantFormula(currentDaily.barbarousFormula, currentDaily.invocationText)}
            disabled={isChanting}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00e5ff] hover:bg-cyan-400 text-black font-mono font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(0,229,255,0.5)] transition-all"
          >
            <Volume2 className={`w-4 h-4 ${isChanting ? 'animate-bounce' : ''}`} />
            <span>{isChanting ? 'CHANTING FORMULA...' : 'CHANT TRUE NAMES'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
