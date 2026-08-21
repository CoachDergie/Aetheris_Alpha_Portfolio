import React, { useState } from 'react';
import { DiscoveredIncantation } from '../types';
import { Search, X, BookOpen, Plus, Sparkles, Compass } from 'lucide-react';
import { synthesizeDiscoveryFromQuery } from '../utils/incantationDiscovery';
import { soundEffects } from '../utils/telemetry';

interface SearchReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToGrimoire: (incantation: DiscoveredIncantation) => void;
}

export const SearchReferenceModal: React.FC<SearchReferenceModalProps> = ({
  isOpen,
  onClose,
  onAddToGrimoire,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  if (!isOpen) return null;

  const curatedTopics = [
    { title: 'The Bornless Ritual (Akephalos)', category: 'INVOCATION', planet: 'Sun / Sol', formula: 'AEE-IOU-OEA-SABAOTH', desc: 'Ancient Greco-Egyptian rite of self-deification and true solar alignment.' },
    { title: 'Golachab Martial Surge (Fa Jin)', category: 'MARTIAL', planet: 'Mars / Samael', formula: 'GOLACHAB-SEKHMET-BARZAL', desc: 'Explosive Fa Jin discharge through rooted horse stance.' },
    { title: 'Choronzon 333 Veil Banishing', category: 'QLIPHOTH', planet: 'Saturn / Binah', formula: 'ZAZAS-ZAZAS-NASATANADA-ZAZAS', desc: 'Closing the abyss gates against psychic fragmentation.' },
    { title: 'Thaumiel Duality Transcendence', category: 'QLIPHOTH', planet: 'Pluto / Kether', formula: 'THAUMIEL-MOLOCH-LUCIFER', desc: 'Unifying polarized dualities into supreme unified awareness.' },
    { title: 'Prana Kumbhaka Lock', category: 'MEDITATION', planet: 'Mercury / Thoth', formula: 'OM-MANI-PADME-HUM-VAJRA', desc: 'Holding the breath to pressurize the central Sushumna nadi.' },
    { title: 'Hecate Trimorphis Crossroads', category: 'LUNAR', planet: 'Moon / Yesod', formula: 'HEKATE-PHOSPHOROS-ENODIA', desc: 'Navigating lunar transitions and void of course vectors.' },
  ];

  const filtered = activeCategory === 'ALL'
    ? curatedTopics.filter((t) => t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.desc.toLowerCase().includes(searchTerm.toLowerCase()))
    : curatedTopics.filter((t) => t.category === activeCategory);

  const handleSelectTopic = (topic: typeof curatedTopics[0]) => {
    const synthesized = synthesizeDiscoveryFromQuery(`${topic.title} ${topic.planet}`);
    onAddToGrimoire(synthesized);
    soundEffects.playHolographicChime(963);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131824]/90">
      <div className="bg-[#1E2638] border border-[#2E3B57] rounded-2xl p-6 max-w-xl w-full shadow-[0_4px_30px_rgba(0,0,0,0.6)] font-mono text-xs max-h-[85vh] flex flex-col">
        <div className="flex justify-between items-center border-b border-[#2A3650] pb-3 mb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              OCCULT & MARTIAL CODEX
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="space-y-3 mb-4 flex-shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search esoteric systems, barbarous names, martial forms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#161B26] border border-[#2E3B57] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-400 placeholder-gray-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {['ALL', 'INVOCATION', 'MARTIAL', 'QLIPHOTH', 'MEDITATION', 'LUNAR'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold uppercase transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-[#122238] border border-cyan-400 text-cyan-300'
                    : 'bg-[#161B26] border border-[#2E3B57] text-gray-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto space-y-2.5 pr-1 flex-1">
          {filtered.map((topic, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-[#161B26] border border-[#2E3B57] hover:border-cyan-400 transition-all flex flex-col justify-between gap-2"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-black text-white text-xs tracking-wider uppercase">
                    {topic.title}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#1E2638] border border-yellow-500/30 text-yellow-300 font-bold">
                    {topic.planet}
                  </span>
                </div>
                <p className="text-[11px] text-[#00e5ff] font-mono mt-1 font-bold">
                  "{topic.formula}"
                </p>
                <p className="text-gray-400 text-[11px] mt-1 font-sans">
                  {topic.desc}
                </p>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => handleSelectTopic(topic)}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#00e5ff] hover:bg-cyan-400 text-black font-black font-mono text-[10px] uppercase tracking-wider transition-all"
                >
                  <Plus className="w-3 h-3" />
                  <span>TRANSCRIBE TO GRIMOIRE</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
