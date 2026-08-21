import React, { useState } from 'react';
import { X, Search, ExternalLink, BookOpen, Compass, Globe, Sparkles } from 'lucide-react';
import { soundEffects } from '../utils/telemetry';

interface SearchReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchReferenceModal: React.FC<SearchReferenceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'astrology' | 'martial' | 'esoteric'>('all');

  if (!isOpen) return null;

  const handleSearchGoogle = (searchTerm: string) => {
    const q = encodeURIComponent(searchTerm);
    window.open(`https://www.google.com/search?q=${q}`, '_blank', 'noopener,noreferrer');
    soundEffects.playHolographicChime(600);
  };

  const curatedTopics = [
    {
      category: 'astrology',
      title: 'Planetary Transits & Hard Squares (Mars-Saturn / Pluto)',
      query: 'astrological squares planetary transits mars saturn aspects ephemeris',
      desc: 'Planetary friction dynamics, square aspects, and transit timing analysis.'
    },
    {
      category: 'esoteric',
      title: 'The Qliphoth & Dark Energetic Correspondences',
      query: 'qliphoth tree of death planetary correspondences demon sigils occult',
      desc: 'Spheres of Thagirion, Golachab, Gamaliel, and Nightside occult cosmology.'
    },
    {
      category: 'martial',
      title: 'Internal Kung-Fu & Qi-Gong Barbell Conditioning',
      query: 'internal kung fu tie bu shan iron shirt qi gong barbell strength isometric',
      desc: 'Fascial conditioning, Ma Bu horse stance loading, and tendon density.'
    },
    {
      category: 'astrology',
      title: 'Synodic Lunar Cycle & Moon Illumination Phases',
      query: 'lunar phase synodic month illumination calculation astronomy ephemeris',
      desc: 'Real-time lunar tracking, void of course moon, and celestial longitude.'
    },
    {
      category: 'esoteric',
      title: 'Barbarous Names of Evocation (Greek Magical Papyri / PGM)',
      query: 'barbarous names of evocation pgm magical papyri true names',
      desc: 'Ancient vocables, vibrational resonance, and kinetic chanting.'
    }
  ];

  const filteredTopics = activeCategory === 'all'
    ? curatedTopics
    : curatedTopics.filter((t) => t.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85">
      <div className="bg-[#120822] border border-orange-500/40 rounded-2xl p-6 max-w-xl w-full shadow-[0_0_40px_rgba(255,69,0,0.3)] font-mono text-xs max-h-[85vh] flex flex-col">
        <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              External Reference & Research Indexer
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="flex gap-2 mb-4 flex-shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search astrological alignments, Qliphotic lore, punch physics..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && query.trim()) {
                  handleSearchGoogle(query);
                }
              }}
              className="w-full bg-black/60 border border-white/15 rounded-xl pl-9 pr-3 py-2 text-white text-xs outline-none focus:border-orange-500"
            />
          </div>
          <button
            onClick={() => query.trim() && handleSearchGoogle(query)}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-[0_0_10px_rgba(255,69,0,0.4)]"
          >
            <span>Search</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Category Filter Chips */}
        <div className="flex gap-1.5 mb-3 flex-shrink-0">
          {(['all', 'astrology', 'martial', 'esoteric'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-lg text-[10px] uppercase font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-orange-950/80 border border-orange-500 text-orange-300'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Curated Reference Index List */}
        <div className="space-y-2 overflow-y-auto flex-1 pr-1">
          {filteredTopics.map((topic, idx) => (
            <div
              key={idx}
              onClick={() => handleSearchGoogle(topic.query)}
              className="p-3 rounded-xl bg-black/40 border border-white/5 hover:border-orange-500/40 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-orange-950 text-orange-400 border border-orange-800 uppercase font-mono">
                    {topic.category}
                  </span>
                  <p className="text-white font-bold text-xs group-hover:text-orange-300 transition-colors">
                    {topic.title}
                  </p>
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed">{topic.desc}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-orange-400 flex-shrink-0 ml-2 transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
