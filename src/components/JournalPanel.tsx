import React, { useState } from 'react';
import { useTradition } from '../contexts/TraditionContext';
import { DiscoveredIncantation } from '../types';
import { Sparkles, BookOpen, Volume2, Search, Plus, Compass, Trash2 } from 'lucide-react';
import { soundEffects } from '../utils/telemetry';
import { JournalSection } from './JournalSection';

interface JournalPanelProps {
  journal: DiscoveredIncantation[];
  setJournal: React.Dispatch<React.SetStateAction<DiscoveredIncantation[]>>;
  onDiscoverNew: (promptQuery?: string) => void;
  onDeleteEntry: (id: string) => void;
}

export const JournalPanel: React.FC<JournalPanelProps> = ({
  journal,
  setJournal,
  onDiscoverNew,
  onDeleteEntry,
}) => {
  const { t, tradition } = useTradition();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');

  const filteredJournal = journal.filter((inc) => {
    const searchLower = (searchQuery || '').toLowerCase();
    const title = (inc.dayOfWeek ? `${inc.dayOfWeek} Invocation` : (inc as any).title || '').toLowerCase();
    const formula = (inc.barbarousFormula || '').toLowerCase();
    const planet = (inc.planet || '').toLowerCase();
    const intent = (inc.invocationText || (inc as any).intent || '').toLowerCase();
    return (
      title.includes(searchLower) ||
      formula.includes(searchLower) ||
      planet.includes(searchLower) ||
      intent.includes(searchLower)
    );
  });

  const handleSynthesize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    onDiscoverNew(customPrompt.trim());
    setCustomPrompt('');
  };

  const handleVocalize = (text: string) => {
    soundEffects.playHolographicChime(852);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 0.75;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full p-2.5 sm:p-4 text-center">
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-base sm:text-lg font-black font-mono tracking-widest text-[#00e5ff] uppercase drop-shadow-[0_0_12px_rgba(0,229,255,0.6)]">
          📜 JOURNAL
        </h2>
        <p className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider">
          Transcribed Invocations & Incantations
        </p>
      </div>

      {/* Sigil Casting Button (Native XR) */}
      <button
        onClick={() => {
          soundEffects.playHolographicChime(1100);
          if (window.AndroidXR && typeof window.AndroidXR.requestLoftAnchor === 'function') {
            window.AndroidXR.requestLoftAnchor();
          } else {
             // Fallback for non-XR preview
             console.log("SPATIAL ANCHOR REQUESTED");
          }
        }}
        className="w-full px-4 py-3 rounded-xl bg-purple-900/40 border border-purple-500/50 hover:bg-purple-800/60 hover:border-purple-400 text-purple-300 font-mono font-black text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all flex items-center justify-center gap-2"
      >
        <Compass className="w-4 h-4" />
        <span>CAST SIGIL (SPATIAL ANCHOR)</span>
      </button>

      {/* Synthesis Input Bar */}
      <form onSubmit={handleSynthesize} className="flex gap-2 w-full">
        <input
          type="text"
          placeholder="Synthesize formula (e.g. 'I am healthy, I am wealthy, I am free.')..."
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          className="flex-1 px-3 py-2 bg-[#1E2638] border border-[#2E3B57] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-400 placeholder-gray-500"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-[#00e5ff] hover:bg-cyan-400 text-black font-mono font-black text-xs uppercase tracking-wider shadow-[0_0_12px_rgba(0,229,255,0.4)] transition-all flex items-center gap-1 shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>INVOKE</span>
        </button>
      </form>

      {/* Journal List Cards */}
      <div className="w-full space-y-2.5 text-left">
        {filteredJournal.map((inc) => (
          <div
            key={inc.id}
            className="p-3.5 rounded-xl border transition-all bg-[#1E2638] border-[#2E3B57] hover:border-cyan-500/40 relative group"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-black font-mono text-white uppercase">
                  {inc.dayOfWeek ? `${inc.dayOfWeek} Transmission` : (inc as any).title || 'INVOCATION'}
                </span>
                <span className="text-[10px] font-mono text-[#ffd700] font-bold ml-2">{t(inc.planet)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVocalize(tradition === 'hermetic' ? (inc.hermeticFormula || inc.barbarousFormula) : inc.barbarousFormula);
                  }}
                  className="p-1 rounded-lg hover:bg-[#2A3650] text-[#00e5ff] hover:text-white transition-colors"
                  title="Vocalize Affirmation"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteEntry(inc.id);
                  }}
                  className="p-1 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete Entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-xs font-mono text-cyan-300 font-bold mt-1 pr-6">"{tradition === 'hermetic' ? (inc.hermeticFormula || inc.barbarousFormula) : inc.barbarousFormula}"</p>
            <p className="text-[11px] text-gray-400 mt-1 font-sans pr-6">
              {inc.invocationText || (inc as any).intent || ''}
            </p>
            <div className="pt-2 mt-2 border-t border-[#2A3650] flex items-center justify-between text-[10px] font-mono text-gray-500">
              <span>SPHERE: {tradition === 'hermetic' ? (inc.hermeticSphere || t(inc.focusQlipha)) : inc.focusQlipha}</span>
              <span>MARTIAL: {inc.martialCorrelation || 'Universal Centerline'}</span>
            </div>
          </div>
        ))}
        {filteredJournal.length === 0 && (
          <div className="text-center py-6 text-gray-500 text-xs font-mono">
            No entries found. Synthesize a new invocation above.
          </div>
        )}
      </div>

      {/* Legacy Journal Notes Section */}
      <JournalSection />
    </div>
  );
};
;
