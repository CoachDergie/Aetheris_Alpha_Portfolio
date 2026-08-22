import React, { useState } from 'react';
import { DrawnCard, TarotCard } from '../types';
import { TAROT_DECK, getRandomTarotCards, synthesizeTarotGuidance } from '../utils/tarotData';
import { Layers, Sparkles, RefreshCw, Eye, Info, X } from 'lucide-react';

const TarotCardImage = ({ card, isReversed }: { card: TarotCard, isReversed?: boolean }) => {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <div className="w-full h-full flex flex-col justify-between items-center p-2 relative bg-[#161B26] rounded-lg">
        <div className="flex justify-between w-full text-[10px] font-mono text-yellow-400 font-bold">
          <span>{card.glyph || '✦'}</span>
          <span className="uppercase tracking-wider">{card.suit === 'Major' ? 'M.A.' : card.suit}</span>
        </div>

        <div className="text-center my-auto flex flex-col items-center justify-center">
          <div className="text-3xl font-serif text-[#ffd700] drop-shadow-[0_0_12px_rgba(255,215,0,0.5)] mb-1">
            {card.glyph || '🜂'}
          </div>
          <div className="text-[10px] font-black font-mono tracking-wider text-white uppercase leading-tight px-1 text-center">
            {card.name}
          </div>
          {isReversed !== undefined && (
            <div className="text-[8px] font-mono text-cyan-300 font-bold mt-0.5">
              {isReversed ? '↺ REVERSED' : '↑ UPRIGHT'}
            </div>
          )}
        </div>

        <div className="text-[8px] font-mono text-yellow-300/80 border-t border-yellow-500/30 pt-1 w-full text-center truncate">
          {card.associatedPlanetOrSign}
        </div>
      </div>
    );
  }

  return (
    <img
      src={`./tarot/${card.imagePath}`}
      alt={card.name}
      onError={() => setImgError(true)}
      className={`w-full h-full object-contain rounded-lg transition-transform duration-500 ${isReversed ? 'rotate-180' : ''}`}
    />
  );
};

interface TarotPanelProps {
  accentCyan?: string;
  accentGold?: string;
}

export const TarotPanel: React.FC<TarotPanelProps> = ({
  accentCyan = '#00e5ff',
  accentGold = '#ffd700',
}) => {
  const [viewMode, setViewMode] = useState<'DRAW' | 'LIBRARY'>('DRAW');
  const [drawCount, setDrawCount] = useState<number>(1);
  const [currentDraw, setCurrentDraw] = useState<DrawnCard[]>(() => getRandomTarotCards(1));
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [suitFilter, setSuitFilter] = useState<string>('ALL');

  const handleDraw = (count: number) => {
    setDrawCount(count);
    setCurrentDraw(getRandomTarotCards(count));
  };

  const suitCounts: Record<string, number> = {
    ALL: TAROT_DECK.length,
    Major: TAROT_DECK.filter((c) => c.suit === 'Major').length,
    Wands: TAROT_DECK.filter((c) => c.suit === 'Wands').length,
    Cups: TAROT_DECK.filter((c) => c.suit === 'Cups').length,
    Swords: TAROT_DECK.filter((c) => c.suit === 'Swords').length,
    Pentacles: TAROT_DECK.filter((c) => c.suit === 'Pentacles').length,
  };

  const filteredCards = TAROT_DECK.filter((c) => {
    const searchLower = (searchFilter || '').toLowerCase();
    const name = (c.name || '').toLowerCase();
    const astro = (c.associatedPlanetOrSign || '').toLowerCase();
    const upright = (c.uprightMeaning || '').toLowerCase();
    const reversed = (c.reversedMeaning || '').toLowerCase();
    const matchesSearch = 
      name.includes(searchLower) || 
      astro.includes(searchLower) ||
      upright.includes(searchLower) ||
      reversed.includes(searchLower);
    const matchesSuit = suitFilter === 'ALL' || c.suit === suitFilter;
    return matchesSearch && matchesSuit;
  });

  return (
    <div className="p-2.5 sm:p-4 flex flex-col items-center justify-center gap-4 w-full text-center">
      {/* Mode Switcher */}
      <div className="flex w-full bg-[#1A2130] p-1 rounded-xl border border-[#2E3B57]">
        <button
          id="btn-tarot-draw-mode"
          onClick={() => setViewMode('DRAW')}
          className={`flex-1 py-2 rounded-lg font-mono text-xs font-black tracking-widest uppercase transition-all ${
            viewMode === 'DRAW'
              ? 'bg-[#00e5ff] text-black shadow-[0_0_12px_rgba(0,229,255,0.5)]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          🔮 DAILY DRAW
        </button>
        <button
          id="btn-tarot-library-mode"
          onClick={() => setViewMode('LIBRARY')}
          className={`flex-1 py-2 rounded-lg font-mono text-xs font-black tracking-widest uppercase transition-all ${
            viewMode === 'LIBRARY'
              ? 'bg-[#00e5ff] text-black shadow-[0_0_12px_rgba(0,229,255,0.5)]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          📚 LIBRARY ({TAROT_DECK.length})
        </button>
      </div>

      {viewMode === 'DRAW' ? (
        <div className="w-full flex flex-col items-center justify-center gap-4">
          {/* Centered Spread Selector */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-mono text-gray-400 font-bold uppercase">SPREAD:</span>
            <button
              id="spread-1-card"
              onClick={() => handleDraw(1)}
              className={`px-3 py-1 rounded-lg font-mono text-xs font-bold border transition-all ${
                drawCount === 1 ? 'bg-[#122238] border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,229,255,0.3)]' : 'bg-[#1E2638] border-[#2E3B57] text-gray-400 hover:text-white'
              }`}
            >
              1 Card (Oracle)
            </button>
            <button
              id="spread-3-card"
              onClick={() => handleDraw(3)}
              className={`px-3 py-1 rounded-lg font-mono text-xs font-bold border transition-all ${
                drawCount === 3 ? 'bg-[#122238] border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,229,255,0.3)]' : 'bg-[#1E2638] border-[#2E3B57] text-gray-400 hover:text-white'
              }`}
            >
              3 Cards (Trinity)
            </button>
            <button
              id="spread-5-card"
              onClick={() => handleDraw(5)}
              className={`px-3 py-1 rounded-lg font-mono text-xs font-bold border transition-all ${
                drawCount === 5 ? 'bg-[#122238] border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,229,255,0.3)]' : 'bg-[#1E2638] border-[#2E3B57] text-gray-400 hover:text-white'
              }`}
            >
              5 Cards (Pentagram)
            </button>
          </div>

          {/* Centered Drawn Cards Stack */}
          <div className="flex flex-col items-center justify-center gap-4 w-full">
            {currentDraw.map((drawn, idx) => {
              const guidance = synthesizeTarotGuidance(drawn);
              return (
                <div
                  key={`${drawn.card.id}-${idx}`}
                  id={`drawn-card-${idx}`}
                  className="w-full bg-[#1E2638] border-2 border-cyan-500/40 rounded-3xl p-5 shadow-[0_4px_25px_rgba(0,0,0,0.4)] flex flex-col items-center justify-center text-center relative overflow-hidden"
                >
                  {/* Position Badge */}
                  {drawn.positionName && (
                    <span className="mb-2 px-3 py-0.5 rounded-full bg-[#122238] border border-cyan-500/40 text-[#00e5ff] font-mono text-[10px] font-bold tracking-widest uppercase">
                      {drawn.positionName}
                    </span>
                  )}

                  {/* Centered Visual Card Artwork Frame */}
                  <div className="w-44 h-[250px] rounded-xl bg-[#161B26] border-2 border-yellow-500/40 shadow-[0_0_20px_rgba(255,215,0,0.15)] relative overflow-hidden my-2 flex items-center justify-center p-1">
                    <TarotCardImage card={drawn.card} isReversed={drawn.isReversed} />
                  </div>

                  {/* Title & Guidance */}
                  <h3 className="text-sm font-black font-mono text-[#00e5ff] uppercase tracking-wider mt-1">
                    {drawn.card.name} {drawn.isReversed ? '(REVERSED)' : '(UPRIGHT)'}
                  </h3>

                  <p className="text-xs text-gray-300 leading-relaxed font-sans mt-1.5 max-w-md">
                    {guidance}
                  </p>

                  <div className="mt-2.5 px-3 py-1 rounded-lg bg-[#2B2312] border border-yellow-500/40 text-[#ffd700] text-[10px] font-mono font-bold">
                    COSMIC RULER: {drawn.card.associatedPlanetOrSign.toUpperCase()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Centered Re-draw Button */}
          <button
            id="btn-redraw-spread"
            onClick={() => handleDraw(drawCount)}
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#00e5ff] hover:bg-cyan-400 text-black font-mono font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(0,229,255,0.5)] transition-all hover:scale-105"
          >
            <RefreshCw className="w-4 h-4" />
            <span>DRAW NEW SPREAD</span>
          </button>
        </div>
      ) : (
        /* CARD LIBRARY MODE */
        <div className="w-full space-y-3">
          {/* Filter Bar */}
          <div className="flex flex-col gap-2.5 bg-[#1E2638] p-3 rounded-2xl border border-[#2E3B57]">
            <input
              type="text"
              placeholder="Search cards by name, ruler..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#161B26] border border-[#2E3B57] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
            />

            <div className="flex items-center justify-center gap-1.5 overflow-x-auto w-full py-0.5">
              {[
                { key: 'ALL', label: 'ALL', glyph: '✦' },
                { key: 'Major', label: 'Major', glyph: '👑' },
                { key: 'Wands', label: 'Wands', glyph: '🜂' },
                { key: 'Cups', label: 'Cups', glyph: '🜄' },
                { key: 'Swords', label: 'Swords', glyph: '🜁' },
                { key: 'Pentacles', label: 'Pentacles', glyph: '🜃' },
              ].map((suit) => (
                <button
                  key={suit.key}
                  onClick={() => setSuitFilter(suit.key)}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold uppercase transition-all whitespace-nowrap flex items-center gap-1 ${
                    suitFilter === suit.key
                      ? 'bg-[#122238] border border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(0,229,255,0.3)]'
                      : 'bg-[#161B26] border border-[#2E3B57] text-gray-400 hover:text-white'
                  }`}
                >
                  <span>{suit.glyph}</span>
                  <span>{suit.label}</span>
                  <span className="text-[9px] opacity-75 font-normal">({suitCounts[suit.key] || 0})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {filteredCards.map((card) => (
              <div
                key={card.id}
                onClick={() => setSelectedCard(card)}
                className="cursor-pointer bg-[#1E2638] border border-[#2E3B57] hover:border-[#00e5ff] rounded-2xl p-3 flex flex-col items-center text-center transition-all hover:scale-105 hover:shadow-[0_0_15px_rgba(0,229,255,0.2)]"
              >
                <div className="w-full h-40 rounded-xl bg-[#161B26] border border-yellow-500/30 flex justify-center items-center p-1 mb-1.5 overflow-hidden">
                  <TarotCardImage card={card} />
                </div>
                <div className="text-xs font-black font-mono text-white truncate w-full">
                  {card.name}
                </div>
                <div className="text-[10px] font-mono text-cyan-300 truncate w-full mt-0.5">
                  {card.associatedPlanetOrSign}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CARD DETAIL MODAL */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131824]/90">
          <div className="relative w-full max-w-md bg-[#1E2638] border-2 border-[#00e5ff] rounded-3xl p-6 shadow-[0_0_50px_rgba(0,229,255,0.4)] text-gray-200 font-sans">
            <button
              onClick={() => setSelectedCard(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-32 h-[180px] rounded-xl bg-[#161B26] border-2 border-yellow-500/50 flex justify-center items-center shadow-[0_0_20px_rgba(255,215,0,0.25)] mb-3 p-1 overflow-hidden">
                <TarotCardImage card={selectedCard} />
              </div>

              <h2 className="text-base font-black font-mono text-[#00e5ff] uppercase tracking-wider">
                {selectedCard.name}
              </h2>
              <span className="text-xs font-mono text-gray-400 mt-0.5 uppercase">
                SUIT: {selectedCard.suit} • RULER: {selectedCard.associatedPlanetOrSign}
              </span>

              <div className="mt-3 space-y-2.5 w-full text-left">
                <div className="p-3 bg-[#161B26] border border-[#2E3B57] rounded-xl">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                    UPRIGHT ESSENCE
                  </span>
                  <p className="text-xs text-gray-200 mt-1 leading-relaxed">{selectedCard.uprightMeaning}</p>
                </div>

                <div className="p-3 bg-[#161B26] border border-[#2E3B57] rounded-xl">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
                    REVERSED TRANSMISSION
                  </span>
                  <p className="text-xs text-gray-300 mt-1 leading-relaxed">{selectedCard.reversedMeaning}</p>
                </div>
              </div>

              <div className="mt-3 px-4 py-1.5 rounded-xl bg-[#2B2312] border border-yellow-500/40 text-[#ffd700] font-mono text-xs font-bold">
                COSMIC RULER: {selectedCard.associatedPlanetOrSign.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
