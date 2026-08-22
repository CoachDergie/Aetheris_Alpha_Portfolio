import React, { useState } from 'react';
import { DiscoveredIncantation } from '../utils/incantationDiscovery';
import { useTradition } from '../contexts/TraditionContext';
import { soundEffects } from '../utils/telemetry';
import {
  BookOpen,
  Volume2,
  Sparkles,
  Plus,
  Trash2,
  Search,
  Check,
  Compass,
  Flame,
  Radio,
  Sliders,
  X,
  CalendarCheck,
  Award
} from 'lucide-react';

interface GrimoireLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  grimoire: DiscoveredIncantation[];
  setGrimoire: React.Dispatch<React.SetStateAction<DiscoveredIncantation[]>>;
  activeDailyInvocation: DiscoveredIncantation;
  setActiveDailyInvocation: (inc: DiscoveredIncantation) => void;
  onDiscoverNew: (queryPrompt?: string) => void;
}

export const GrimoireLibraryModal: React.FC<GrimoireLibraryModalProps> = ({
  isOpen,
  onClose,
  grimoire,
  setGrimoire,
  activeDailyInvocation,
  setActiveDailyInvocation,
  onDiscoverNew,
}) => {
  const { t } = useTradition();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Fire' | 'Water' | 'Air' | 'Earth' | 'Aether / Void'>('All');
  const [selectedIncantation, setSelectedIncantation] = useState<DiscoveredIncantation>(activeDailyInvocation);
  const [isChanting, setIsChanting] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // New Custom Incantation Form State
  const [newFormula, setNewFormula] = useState('');
  const [newText, setNewText] = useState('');
  const [newPlanet, setNewPlanet] = useState('Mars / Golachab');
  const [newQlipha, setNewQlipha] = useState('Golachab (The Burning Sphere)');
  const [newMartial, setNewMartial] = useState('Iron Palm & Heavy Zinc Barbell Clean');
  const [newSource, setNewSource] = useState('Personal Inception / Private Transmission');
  const [newElement, setNewElement] = useState<'Fire' | 'Water' | 'Air' | 'Earth' | 'Aether / Void'>('Fire');
  const [newHz, setNewHz] = useState(528);

  if (!isOpen) return null;

  const filteredGrimoire = grimoire.filter((item) => {
    const searchLower = (searchQuery || '').toLowerCase();
    const formula = (item.barbarousFormula || '').toLowerCase();
    const text = (item.invocationText || '').toLowerCase();
    const planet = (item.planet || '').toLowerCase();
    const qlipha = (item.focusQlipha || '').toLowerCase();
    const martial = (item.martialCorrelation || '').toLowerCase();
    const source = (item.source || '').toLowerCase();
    const tags = Array.isArray(item.tags) ? item.tags : [];

    const matchesSearch =
      formula.includes(searchLower) ||
      text.includes(searchLower) ||
      planet.includes(searchLower) ||
      qlipha.includes(searchLower) ||
      martial.includes(searchLower) ||
      source.includes(searchLower) ||
      tags.some((t) => (t || '').toLowerCase().includes(searchLower));

    const matchesFilter = selectedFilter === 'All' || item.element === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleChant = (inc: DiscoveredIncantation) => {
    setIsChanting(true);
    soundEffects.playHolographicChime(inc.vibrationalToneHz || 528);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = `${inc.barbarousFormula}. ${t(inc.invocationText)}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.82;
      utterance.pitch = 0.7;
      utterance.onend = () => setIsChanting(false);
      utterance.onerror = () => setIsChanting(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsChanting(false), 2500);
    }
  };

  const handleSetAsDaily = (inc: DiscoveredIncantation) => {
    setActiveDailyInvocation(inc);
    soundEffects.playHolographicChime(741);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (grimoire.length <= 1) return;
    setGrimoire((prev) => prev.filter((item) => item.id !== id));
    if (selectedIncantation.id === id) {
      setSelectedIncantation(grimoire.find((g) => g.id !== id) || grimoire[0]);
    }
    soundEffects.playHolographicChime(300);
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormula.trim() || !newText.trim()) return;

    const customInc: DiscoveredIncantation = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      dayOfWeek: 'Practitioner Inscription',
      planet: newPlanet,
      barbarousFormula: newFormula.toUpperCase(),
      invocationText: newText,
      focusQlipha: newQlipha,
      martialCorrelation: newMartial,
      source: newSource,
      element: newElement,
      vibrationalToneHz: Number(newHz),
      tags: ['practitioner-inscribed', newElement.toLowerCase(), newPlanet.toLowerCase().slice(0, 4)],
      dateDiscovered: new Date().toISOString().split('T')[0],
      isCustom: true,
    };

    setGrimoire((prev) => [customInc, ...prev]);
    setSelectedIncantation(customInc);
    setIsCreatingNew(false);
    setNewFormula('');
    setNewText('');
    soundEffects.playHolographicChime(963);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl">
      <div className="bg-[#0f071e] border border-orange-500/50 rounded-2xl max-w-5xl w-full h-[90vh] max-h-[850px] shadow-[0_0_50px_rgba(255,69,0,0.3)] flex flex-col font-mono text-xs overflow-hidden">
        {/* Modal Top Navigation Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-black/40 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-orange-500 flex items-center justify-center bg-orange-950/60 shadow-[0_0_10px_rgba(255,69,0,0.5)]">
              <BookOpen className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-widest uppercase text-white">
                  Grimoire of Barbarous Names & Incantations
                </h2>
                <span className="text-[9px] px-2 py-0.5 rounded bg-orange-950 border border-orange-800 text-orange-400 font-bold">
                  {grimoire.length} INSCRIBED
                </span>
              </div>
              <p className="text-[10px] text-gray-400">
                Dynamic ritual repository • Synchronized with occult queries & ancient manuscript indexing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDiscoverNew()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600/80 hover:bg-orange-500 text-white font-bold transition-all shadow-[0_0_12px_rgba(255,69,0,0.4)]"
              title="Divine & synthesize a new formula from planetary transits"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Discover New Formula</span>
            </button>
            <button
              onClick={() => setIsCreatingNew(!isCreatingNew)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/15 text-gray-300 hover:text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Inscribe Custom</span>
            </button>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Workspace */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Column: Search, Filter & List of Incantations (5 cols) */}
          <div className="md:col-span-5 border-r border-white/10 p-4 flex flex-col gap-3 bg-black/20 overflow-hidden">
            {/* Search Input */}
            <div className="relative flex-shrink-0">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search formula, true name, qlipha, weapon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded-xl pl-9 pr-3 py-2 text-white text-[11px] outline-none focus:border-orange-500 placeholder-gray-500"
              />
            </div>

            {/* Element Filter Tags */}
            <div className="flex flex-wrap gap-1 flex-shrink-0">
              {(['All', 'Fire', 'Water', 'Air', 'Earth', 'Aether / Void'] as const).map((elem) => (
                <button
                  key={elem}
                  onClick={() => setSelectedFilter(elem)}
                  className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold transition-all ${
                    selectedFilter === elem
                      ? 'bg-orange-950 border border-orange-500 text-orange-300'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  {elem}
                </button>
              ))}
            </div>

            {/* Scrollable Incantation Cards List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredGrimoire.length === 0 ? (
                <div className="text-center py-10 text-gray-500 space-y-2">
                  <p>No matching formulas found.</p>
                  <button
                    onClick={() => onDiscoverNew(searchQuery)}
                    className="text-xs text-orange-400 underline hover:text-orange-300"
                  >
                    Discover a formula for "{searchQuery}"
                  </button>
                </div>
              ) : (
                filteredGrimoire.map((inc) => {
                  const isSelected = selectedIncantation.id === inc.id;
                  const isDaily = activeDailyInvocation.id === inc.id;

                  return (
                    <div
                      key={inc.id}
                      onClick={() => setSelectedIncantation(inc)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer relative group ${
                        isSelected
                          ? 'bg-orange-950/40 border-orange-500 shadow-[0_0_15px_rgba(255,69,0,0.2)]'
                          : 'bg-black/40 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-950 border border-purple-800 text-purple-300 uppercase font-mono">
                          {inc.planet.split('/')[0].trim()}
                        </span>
                        <div className="flex items-center gap-1">
                          {isDaily && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold flex items-center gap-1">
                              <Check className="w-2.5 h-2.5" /> DAILY
                            </span>
                          )}
                          <span className="text-[9px] text-gray-500">{inc.element}</span>
                        </div>
                      </div>

                      <p className="text-xs font-bold text-orange-200 tracking-wider mb-1 line-clamp-1">
                        {inc.barbarousFormula}
                      </p>

                      <p className="text-[10px] text-gray-400 italic line-clamp-2 leading-tight mb-2">
                        "{t(inc.invocationText)}"
                      </p>

                      <div className="flex items-center justify-between text-[9px] text-gray-500 pt-1 border-t border-white/5">
                        <span className="truncate max-w-[180px]">{inc.source}</span>
                        <span className="text-orange-400/80 font-mono">{inc.vibrationalToneHz}Hz</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Active Incantation Detail, Resonance Chanting & Inscription Form (7 cols) */}
          <div className="md:col-span-7 p-6 flex flex-col justify-between bg-black/40 overflow-y-auto">
            {isCreatingNew ? (
              /* Custom Inscription Form */
              <form onSubmit={handleCreateCustom} className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> Inscribe New Barbarous Incantation
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(false)}
                    className="text-[10px] text-gray-400 hover:text-white uppercase underline"
                  >
                    Cancel
                  </button>
                </div>

                <div>
                  <label className="text-[9px] uppercase text-gray-400 block mb-1">
                    Barbarous True Names / Formula (e.g., IAO SABAO CHORONZON)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter barbarous words of power..."
                    value={newFormula}
                    onChange={(e) => setNewFormula(e.target.value)}
                    className="w-full bg-black/70 border border-white/20 rounded-xl px-3 py-2 text-white font-bold tracking-wider outline-none focus:border-orange-500 uppercase"
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase text-gray-400 block mb-1">
                    Invocation Text & Intent
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Declare the invocation intention and kinetic empowerment..."
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    className="w-full bg-black/70 border border-white/20 rounded-xl px-3 py-2 text-white outline-none focus:border-orange-500 text-[11px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] uppercase text-gray-400 block mb-1">Planetary Attribution</label>
                    <input
                      type="text"
                      value={newPlanet}
                      onChange={(e) => setNewPlanet(e.target.value)}
                      className="w-full bg-black/70 border border-white/20 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase text-gray-400 block mb-1">Qliphotic Sphere</label>
                    <input
                      type="text"
                      value={newQlipha}
                      onChange={(e) => setNewQlipha(e.target.value)}
                      className="w-full bg-black/70 border border-white/20 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[9px] uppercase text-gray-400 block mb-1">Element</label>
                    <select
                      value={newElement}
                      onChange={(e) => setNewElement(e.target.value as any)}
                      className="w-full bg-black/70 border border-white/20 rounded-lg px-2 py-1.5 text-white outline-none focus:border-orange-500"
                    >
                      <option value="Fire">Fire</option>
                      <option value="Water">Water</option>
                      <option value="Air">Air</option>
                      <option value="Earth">Earth</option>
                      <option value="Aether / Void">Aether / Void</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] uppercase text-gray-400 block mb-1">Frequency (Hz)</label>
                    <input
                      type="number"
                      value={newHz}
                      onChange={(e) => setNewHz(Number(e.target.value))}
                      className="w-full bg-black/70 border border-white/20 rounded-lg px-2 py-1.5 text-white outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase text-gray-400 block mb-1">Source Record</label>
                    <input
                      type="text"
                      value={newSource}
                      onChange={(e) => setNewSource(e.target.value)}
                      className="w-full bg-black/70 border border-white/20 rounded-lg px-2 py-1.5 text-white outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] uppercase text-gray-400 block mb-1">Kung-Fu & Barbell Correlation</label>
                  <input
                    type="text"
                    value={newMartial}
                    onChange={(e) => setNewMartial(e.target.value)}
                    className="w-full bg-black/70 border border-white/20 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-orange-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold uppercase tracking-wider transition-colors shadow-[0_0_15px_rgba(255,69,0,0.4)]"
                >
                  Seal & Inscribe to Local Encrypted Grimoire
                </button>
              </form>
            ) : (
              /* Selected Incantation Detailed View */
              <div className="space-y-5">
                {/* Header info */}
                <div className="border-b border-white/10 pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2.5 py-1 rounded bg-orange-950 border border-orange-700 text-orange-300 font-bold uppercase">
                        {t(selectedIncantation.planet)}
                      </span>
                      <span className="text-[10px] px-2 py-1 rounded bg-white/5 border border-white/10 text-gray-300">
                        {selectedIncantation.element}
                      </span>
                      <span className="text-[10px] px-2 py-1 rounded bg-purple-950/80 border border-purple-800 text-purple-300 font-mono">
                        {selectedIncantation.vibrationalToneHz} Hz
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSetAsDaily(selectedIncantation)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] uppercase font-bold border transition-colors ${
                          activeDailyInvocation.id === selectedIncantation.id
                            ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                            : 'bg-white/5 border-white/15 text-gray-300 hover:text-white'
                        }`}
                      >
                        <CalendarCheck className="w-3.5 h-3.5" />
                        <span>{activeDailyInvocation.id === selectedIncantation.id ? 'Active Daily' : 'Assign to Daily'}</span>
                      </button>

                      {grimoire.length > 1 && (
                        <button
                          onClick={(e) => handleDelete(selectedIncantation.id, e)}
                          className="p-1 text-gray-500 hover:text-red-400 rounded hover:bg-white/5"
                          title="Remove from Grimoire"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-xl font-extrabold text-orange-200 tracking-widest uppercase my-2 font-mono drop-shadow-[0_0_10px_rgba(255,69,0,0.5)]">
                    "{selectedIncantation.barbarousFormula}"
                  </h3>

                  <p className="text-xs text-gray-300 italic leading-relaxed bg-black/50 p-3 rounded-xl border border-white/5">
                    "{t(selectedIncantation.invocationText)}"
                  </p>
                </div>

                {/* Occult & Martial Attributes Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[9px] uppercase text-gray-400">Qliphotic Sphere & Daemon</span>
                    <p className="text-xs font-bold text-purple-300">{t(selectedIncantation.focusQlipha)}</p>
                  </div>
                  <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[9px] uppercase text-gray-400">Manuscript Origin & Source</span>
                    <p className="text-xs font-bold text-orange-300">{selectedIncantation.source}</p>
                  </div>
                  <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-1 col-span-2">
                    <span className="text-[9px] uppercase text-gray-400">Kung-Fu Qi-Gong & 6ft Zinc Barbell Integration</span>
                    <p className="text-xs font-bold text-white">{t(selectedIncantation.martialCorrelation)}</p>
                  </div>
                </div>

                {/* Acoustic & Speech Synthesis Chant Engine */}
                <div className="p-4 bg-gradient-to-r from-orange-950/40 via-purple-950/30 to-black rounded-2xl border border-orange-500/30 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase text-orange-400 font-bold tracking-widest flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                      Acoustic Resonance Engine
                    </p>
                    <p className="text-[11px] text-gray-300">
                      Chant true names with synchronized {selectedIncantation.vibrationalToneHz}Hz harmonic carrier wave.
                    </p>
                  </div>

                  <button
                    onClick={() => handleChant(selectedIncantation)}
                    disabled={isChanting}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-[0_0_20px_rgba(255,69,0,0.4)] ${
                      isChanting
                        ? 'bg-orange-500 text-black animate-pulse'
                        : 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:brightness-110'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>{isChanting ? 'Chanting...' : 'Chant Incantation'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Status Ribbon */}
            <div className="pt-4 border-t border-white/10 flex justify-between items-center text-[10px] text-gray-500">
              <span>Date Recorded: {selectedIncantation.dateDiscovered}</span>
              <span className="text-orange-400/80">AES-256 Vault Encrypted Synchronized</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
