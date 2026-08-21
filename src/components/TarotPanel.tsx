import React, { useState } from 'react';
import { DrawnCard, TarotCard } from '../types';
import { TAROT_DECK, getRandomTarotCards, synthesizeTarotGuidance } from '../utils/tarotData';
import { Layers, Sparkles, RefreshCw, Eye, Info, X } from 'lucide-react';

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

  const filteredCards = TAROT_DECK.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchFilter.toLowerCase()) || 
                          c.associatedPlanetOrSign.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesSuit = suitFilter === 'ALL' || c.suit === suitFilter;
    return matchesSearch && matchesSuit;
  });

  return (
    <div className="p-3 sm:p-5 flex flex-col items-center justify-center gap-5 w-full max-w-xl mx-auto text-center">
      {/* Mode Switcher */}
      <div className="flex w-full max-w-md bg-black/60 p-1 rounded-xl border border-cyan-500/30">
        <button
          id="btn-tarot-draw-mode"
          onClick={() => setViewMode('DRAW')}
          className={`flex-1 py-2 rounded-lg font-mono text-xs font-black tracking-widest uppercase transition-all ${
            viewMode === 'DRAW'
              ? 'bg-[#00e5ff] text-black shadow-[0_0_15px_rgba(0,229,255,0.6)]'
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
              ? 'bg-[#00e5ff] text-black shadow-[0_0_15px_rgba(0,229,255,0.6)]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          📚 LIBRARY ({TAROT_DECK.length})
        </button>
      </div>

      {viewMode === 'DRAW' ? (
        <div className="w-full flex flex-col items-center justify-center gap-5">
          {/* Centered Spread Selector */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-mono text-gray-400 font-bold uppercase">SPREAD:</span>
            <button
              id="spread-1-card"
              onClick={() => handleDraw(1)}
              className={`px-3 py-1 rounded-lg font-mono text-xs font-bold border transition-all ${
                drawCount === 1 ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,229,255,0.3)]' : 'bg-black/40 border-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              1 Card (Oracle)
            </button>
            <button
              id="spread-3-card"
              onClick={() => handleDraw(3)}
              className={`px-3 py-1 rounded-lg font-mono text-xs font-bold border transition-all ${
                drawCount === 3 ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,229,255,0.3)]' : 'bg-black/40 border-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              3 Cards (Trinity)
            </button>
            <button
              id="spread-5-card"
              onClick={() => handleDraw(5)}
              className={`px-3 py-1 rounded-lg font-mono text-xs font-bold border transition-all ${
                drawCount === 5 ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,229,255,0.3)]' : 'bg-black/40 border-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              5 Cards (Pentagram)
            </button>
          </div>

          {/* Centered Drawn Cards Stack / Grid */}
          <div className="flex flex-col items-center justify-center gap-5 w-full">
            {currentDraw.map((drawn, idx) => {
              const guidance = synthesizeTarotGuidance(drawn);
              return (
                <div
                  key={`${drawn.card.id}-${idx}`}
                  id={`drawn-card-${idx}`}
                  className="w-full bg-gradient-to-b from-[#161d33]/95 to-[#0c1020]/95 border-2 border-cyan-500/40 rounded-3xl p-5 shadow-[0_0_30px_rgba(0,229,255,0.15)] flex flex-col items-center justify-center text-center relative overflow-hidden"
                >
                  {/* Position Badge */}
                  {drawn.positionName && (
                    <span className="mb-2 px-3 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-[#00e5ff] font-mono text-[10px] font-bold tracking-widest uppercase">
                      {drawn.positionName}
                    </span>
                  )}

                  {/* Centered Visual Card Artwork Frame */}
                  <div className="w-48 h-64 rounded-2xl bg-gradient-to-tr from-[#1a233d] to-[#2a3861] border-2 border-yellow-500/40 shadow-[0_0_25px_rgba(255,215,0,0.2)] p-4 flex flex-col justify-between items-center relative overflow-hidden my-2">
                    <div className="flex justify-between w-full text-xs font-mono text-yellow-400 font-bold">
                      <span>{drawn.card.glyph || '✦'}</span>
                      <span className="text-[10px] uppercase tracking-wider">{drawn.card.suit}</span>
                    </div>

                    <div className="text-center my-auto">
                      <div className="text-5xl font-serif text-[#ffd700] drop-shadow-[0_0_15px_rgba(255,215,0,0.6)] mb-2">
                        {drawn.card.glyph || '🜂'}
                      </div>
                      <div className="text-sm font-black font-mono tracking-wider text-white uppercase">
                        {drawn.card.name}
                      </div>
                      <div className="text-[11px] font-mono text-cyan-300 font-bold mt-1">
                        {drawn.isReversed ? '↺ REVERSED' : '↑ UPRIGHT'}
                      </div>
                    </div>

                    <div className="text-[10px] font-mono text-yellow-300/80 border-t border-yellow-500/30 pt-1 w-full text-center">
                      {drawn.card.associatedPlanetOrSign}
                    </div>
                  </div>

                  {/* Title & Guidance */}
                  <h3 className="text-base font-black font-mono text-[#00e5ff] uppercase tracking-wider mt-2">
                    {drawn.card.name} {drawn.isReversed ? '(REVERSED)' : '(UPRIGHT)'}
                  </h3>

                  <p className="text-xs text-gray-300 leading-relaxed font-sans mt-2 max-w-md">
                    {guidance}
                  </p>

                  <div className="mt-3 px-3 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/40 text-[#ffd700] text-[11px] font-mono font-bold">
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
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#00e5ff] hover:bg-cyan-400 text-black font-mono font-black text-xs uppercase tracking-widest shadow-[0_0_25px_rgba(0,229,255,0.6)] transition-all hover:scale-105"
          >
            <RefreshCw className="w-4 h-4" />
            <span>DRAW NEW SPREAD</span>
          </button>
        </div>
      ) : (
        /* CARD LIBRARY MODE */
        <div className="w-full space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col gap-3 bg-black/40 p-3 rounded-2xl border border-cyan-500/30">
            <input
              type="text"
              placeholder="Search cards by name, ruler..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full px-3 py-2 bg-black/60 border border-gray-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
            />

            <div className="flex items-center justify-center gap-1.5 overflow-x-auto w-full py-1">
              {['ALL', 'Major', 'Wands', 'Cups', 'Swords', 'Pentacles'].map((suit) => (
                <button
                  key={suit}
                  onClick={() => setSuitFilter(suit)}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold uppercase transition-all whitespace-nowrap ${
                    suitFilter === suit
                      ? 'bg-cyan-950 border border-cyan-400 text-cyan-300'
                      : 'bg-black/30 border border-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {suit}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredCards.map((card) => (
              <div
                key={card.id}
                onClick={() => setSelectedCard(card)}
                className="cursor-pointer bg-gradient-to-b from-[#141a2e] to-[#0a0d18] border border-cyan-500/30 hover:border-[#00e5ff] rounded-2xl p-3 flex flex-col items-center text-center transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(0,229,255,0.3)]"
              >
                <div className="w-full h-28 rounded-xl bg-gradient-to-tr from-[#1b2440] to-[#29375e] border border-yellow-500/30 flex flex-col justify-between items-center p-2 mb-1.5">
                  <span className="text-yellow-400 text-[10px] font-mono">{card.glyph || '✦'}</span>
                  <span className="text-2xl text-[#ffd700] font-serif">{card.glyph || '🜂'}</span>
                  <span className="text-[9px] font-mono text-gray-400 uppercase">{card.suit}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#121626] border-2 border-[#00e5ff] rounded-3xl p-6 shadow-[0_0_50px_rgba(0,229,255,0.5)] text-gray-200 font-sans">
            <button
              onClick={() => setSelectedCard(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-28 h-38 rounded-2xl bg-gradient-to-tr from-[#1e284a] to-[#2f3d6b] border-2 border-yellow-500/50 flex flex-col justify-center items-center shadow-[0_0_30px_rgba(255,215,0,0.3)] mb-3 p-4">
                <span className="text-4xl text-[#ffd700] font-serif">{selectedCard.glyph || '✦'}</span>
              </div>

              <h2 className="text-lg font-black font-mono text-[#00e5ff] uppercase tracking-wider">
                {selectedCard.name}
              </h2>
              <span className="text-xs font-mono text-gray-400 mt-0.5 uppercase">
                SUIT: {selectedCard.suit} • RULER: {selectedCard.associatedPlanetOrSign}
              </span>

              <div className="mt-4 space-y-3 w-full text-left">
                <div className="p-3 bg-black/50 border border-gray-800 rounded-xl">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                    UPRIGHT ESSENCE
                  </span>
                  <p className="text-xs text-gray-200 mt-1 leading-relaxed">{selectedCard.uprightMeaning}</p>
                </div>

                <div className="p-3 bg-black/50 border border-gray-800 rounded-xl">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
                    REVERSED TRANSMISSION
                  </span>
                  <p className="text-xs text-gray-300 mt-1 leading-relaxed">{selectedCard.reversedMeaning}</p>
                </div>
              </div>

              <div className="mt-4 px-4 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/40 text-[#ffd700] font-mono text-xs font-bold">
                COSMIC RULER: {selectedCard.associatedPlanetOrSign.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
