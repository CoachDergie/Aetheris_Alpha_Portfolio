import React, { useState, useEffect } from 'react';
import { Search, Save, Trash2, Quote, Clock, BookOpen } from 'lucide-react';
import { soundEffects } from '../utils/telemetry';
import { MARCUS_AURELIUS_TEXT, CHRISTINA_MAXIMS_TEXT } from '../utils/quotes';

export interface JournalEntry {
  id: string;
  text: string;
  timestamp: number;
}

export const JournalSection: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [aureliusParagraphs, setAureliusParagraphs] = useState<string[]>([]);
  const [christinaMaxims, setChristinaMaxims] = useState<string[]>([]);

  // Load entries from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('occult_journal_entries');
      if (saved) {
        setEntries(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load journal entries', e);
    }
  }, []);

  // Process texts on mount
  useEffect(() => {
    try {
      const parsedAurelius = MARCUS_AURELIUS_TEXT
        .split('\n\n')
        .map((p) => p.trim())
        .filter((p) => p.length > 20); // filter out empty or very short lines
        
      const parsedChristina = CHRISTINA_MAXIMS_TEXT
        .split('\n')
        .map((p) => p.trim())
        .filter((p) => p.length > 5);

      setAureliusParagraphs(parsedAurelius);
      setChristinaMaxims(parsedChristina);

      // Auto-prefill if empty
      if (!currentInput && (parsedAurelius.length > 0 || parsedChristina.length > 0)) {
        prefillRandomQuote(parsedAurelius, parsedChristina);
      }
    } catch (err) {
      console.error('Failed to parse texts', err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally only run once on mount

  const prefillRandomQuote = (aurelius: string[] = aureliusParagraphs, christina: string[] = christinaMaxims) => {
    const isAurelius = Math.random() > 0.5;
    if (isAurelius && aurelius.length > 0) {
      const rand = aurelius[Math.floor(Math.random() * aurelius.length)];
      setCurrentInput(`${rand}\n\n-Marcus Aurelius`);
    } else if (christina.length > 0) {
      const rand = christina[Math.floor(Math.random() * christina.length)];
      setCurrentInput(`${rand}\n\n-Queen Christina of Sweden`);
    } else if (aurelius.length > 0) {
      const rand = aurelius[Math.floor(Math.random() * aurelius.length)];
      setCurrentInput(`${rand}\n\n-Marcus Aurelius`);
    }
  };

  const handleSave = () => {
    if (!currentInput.trim()) return;
    
    soundEffects.playHolographicChime(432);
    const newEntry: JournalEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      text: currentInput.trim(),
      timestamp: Date.now(),
    };
    
    const updated = [newEntry, ...entries];
    setEntries(updated);
    try {
      localStorage.setItem('occult_journal_entries', JSON.stringify(updated));
    } catch (e) {
      console.warn('XR localStorage restricted, state saved in memory only', e);
    }
    setCurrentInput('');
  };

  const handleClear = () => {
    soundEffects.playHolographicChime(222);
    setCurrentInput('');
  };

  const handlePrefillQuote = () => {
    soundEffects.playHolographicChime(528);
    prefillRandomQuote();
  };

  const handleDeleteEntry = (id: string) => {
    soundEffects.playHolographicChime(222);
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    try {
      localStorage.setItem('occult_journal_entries', JSON.stringify(updated));
    } catch (e) {
      console.warn('XR localStorage restricted, state saved in memory only', e);
    }
  };

  const filteredEntries = entries.filter((e) =>
    e.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full mt-8 pt-6 border-t border-[#2E3B57] space-y-4 text-left">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black font-mono text-[#ffd700] uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          PERSONAL JOURNAL
        </h3>
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500/50" />
        <input
          type="text"
          placeholder="Search journal entries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-[#121824] border border-[#2E3B57] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-400 placeholder-gray-500"
        />
      </div>

      {/* Input Area */}
      <div className="w-full bg-[#1E2638] border border-[#2E3B57] rounded-xl p-3 shadow-inner">
        <textarea
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          placeholder="Transcribe your insights, discoveries, or reflections here..."
          className="w-full h-32 bg-transparent text-sm text-gray-200 font-sans resize-none focus:outline-none placeholder-gray-600"
        />
        
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#2E3B57]">
          <div className="flex items-center gap-2">
            <button
              onClick={handleClear}
              className="px-3 py-1.5 rounded-lg bg-[#161B26] border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 font-mono text-[10px] uppercase font-bold transition-colors flex items-center gap-1.5"
              title="Clear text"
            >
              <Trash2 className="w-3 h-3" />
              CLEAR
            </button>
            <button
              onClick={handlePrefillQuote}
              className="px-3 py-1.5 rounded-lg bg-[#161B26] border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300 font-mono text-[10px] uppercase font-bold transition-colors flex items-center gap-1.5"
              title="Randomize Quote"
            >
              <Quote className="w-3 h-3" />
              RANDOMIZE
            </button>
          </div>
          
          <button
            onClick={handleSave}
            disabled={!currentInput.trim()}
            className="px-4 py-1.5 rounded-lg bg-[#00e5ff] text-black hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed font-mono text-[10px] uppercase font-black tracking-wider transition-colors flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,229,255,0.3)]"
          >
            <Save className="w-3 h-3" />
            SAVE ENTRY
          </button>
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-3 pt-2">
        {filteredEntries.map((entry) => (
          <div key={entry.id} className="w-full bg-[#161B26] border border-[#2E3B57] rounded-xl p-4 shadow-sm relative group">
            <button
              onClick={() => handleDeleteEntry(entry.id)}
              className="absolute top-3 right-3 p-1.5 rounded-md bg-[#1E2638] text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
              title="Delete Entry"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <div className="text-[10px] font-mono text-[#00e5ff] flex items-center gap-1.5 mb-2">
              <Clock className="w-3 h-3" />
              {new Date(entry.timestamp).toLocaleDateString()} {new Date(entry.timestamp).toLocaleTimeString()} 
            </div>
            <p className="text-sm text-gray-300 font-sans whitespace-pre-wrap leading-relaxed">
              {entry.text}
            </p>
          </div>
        ))}
        {filteredEntries.length === 0 && (
          <div className="text-center p-6 border border-dashed border-[#2E3B57] rounded-xl text-gray-500 font-mono text-xs uppercase">
            No entries found
          </div>
        )}
      </div>
    </div>
  );
};
