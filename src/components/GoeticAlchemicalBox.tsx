import React, { useState, useMemo } from 'react';
import { CelestialBody, PlanetaryAspect } from '../types';
import { soundEffects } from '../utils/telemetry';
import { Sparkles, Shield, Eye, Flame, Compass, RefreshCw, Volume2, Info } from 'lucide-react';

interface GoeticAlchemicalBoxProps {
  bodies: CelestialBody[];
  aspects: PlanetaryAspect[];
  onSelectSigilToGrimoire?: (sigilName: string, formula: string) => void;
}

interface GoeticDaemonSigil {
  id: string;
  name: string;
  rank: string; // King, Duke, Marquis, Prince, President
  planet: string;
  alchemicalMetal: string;
  alchemicalSymbol: string;
  element: 'Fire' | 'Water' | 'Air' | 'Earth' | 'Void';
  legions: number;
  barbarousFormula: string;
  martialEmpowerment: string;
  description: string;
  svgPathData: string;
  glyph: string;
}

const GOETIC_DAEMONS: GoeticDaemonSigil[] = [
  {
    id: 'asmodeus',
    name: 'Asmodeus / Ashmedai',
    rank: 'King of Wrath & Fire',
    planet: 'Mars',
    alchemicalMetal: 'Iron (Ferrum)',
    alchemicalSymbol: '♂',
    element: 'Fire',
    legions: 72,
    barbarousFormula: 'AYER AVAGE ALOREN ASMODEUS AKEN',
    martialEmpowerment: 'Penetrating Kinetic Thrusts & Unyielding Barbell Lockout',
    description: 'Governs ring of wrath, combustible momentum, and invulnerable core compression.',
    glyph: '🜍',
    svgPathData: 'M 15 50 L 85 50 M 50 15 L 50 85 M 25 25 L 75 75 M 25 75 L 75 25 M 50 20 L 65 35 L 35 35 Z M 50 80 L 65 65 L 35 65 Z M 20 50 L 35 35 L 35 65 Z M 80 50 L 65 35 L 65 65 Z',
  },
  {
    id: 'bael',
    name: 'Bael / Belphegor',
    rank: 'First Monarch of the Abyss',
    planet: 'Sun',
    alchemicalMetal: 'Gold (Aurum)',
    alchemicalSymbol: '☉',
    element: 'Fire',
    legions: 66,
    barbarousFormula: 'EYER SECOR ON CA BAEL APERIO',
    martialEmpowerment: 'Solar Iron Palm & Radiant Heavy Body Armor',
    description: 'Grants optical dominance, high centerline discipline, and supreme will projection.',
    glyph: '☉',
    svgPathData: 'M 50 15 A 35 35 0 1 0 50 85 A 35 35 0 1 0 50 15 M 50 30 A 20 20 0 1 0 50 70 A 20 20 0 1 0 50 30 M 50 50 L 50 20 M 50 50 L 76 65 M 50 50 L 24 65 M 20 20 L 80 80',
  },
  {
    id: 'lucifuge',
    name: 'Lucifuge / Satariel',
    rank: 'High Chancellor of Saturn',
    planet: 'Saturn',
    alchemicalMetal: 'Lead (Plumbum)',
    alchemicalSymbol: '♄',
    element: 'Earth',
    legions: 54,
    barbarousFormula: 'LUCIFUGE ROFOCALE TENEBRIS SATARIEL AGIA',
    martialEmpowerment: 'Iron Shirt Bone Hardening & Heavy Barbell Root',
    description: 'Channeller of dense gravitational mass and skeletal structural lockdown.',
    glyph: '♄',
    svgPathData: 'M 30 20 L 70 20 M 50 20 L 50 80 M 35 45 L 65 45 M 50 80 Q 70 80 70 65 Q 70 50 50 50 M 25 35 L 35 45 L 25 55 M 75 35 L 65 45 L 75 55',
  },
  {
    id: 'phenex',
    name: 'Phenex / Phoenix',
    rank: 'Great Marquis of Lunar Harmony',
    planet: 'Moon',
    alchemicalMetal: 'Silver (Argentum)',
    alchemicalSymbol: '☽',
    element: 'Water',
    legions: 20,
    barbarousFormula: 'EF ENTO GORMA PHENEX TULPHAT',
    martialEmpowerment: 'Regenerative Fluid Evasion & Circular Footwork',
    description: 'Translates celestial sound into restorative breathing and neural recovery.',
    glyph: '☽',
    svgPathData: 'M 60 15 C 35 25 35 75 60 85 C 45 70 45 30 60 15 M 20 50 Q 50 30 80 50 M 20 50 Q 50 70 80 50 M 50 35 L 50 65',
  },
  {
    id: 'samael_marbas',
    name: 'Marbas / Samael',
    rank: 'President of Mercurial Precision',
    planet: 'Mercury',
    alchemicalMetal: 'Quicksilver (Hydrargyrum)',
    alchemicalSymbol: '☿',
    element: 'Air',
    legions: 36,
    barbarousFormula: 'RENICH TASA UBERACA BIACH SAMAEL',
    martialEmpowerment: 'Sub-Second Punch Velocity & Lightning Trapping',
    description: 'Governs biological mechanics, anatomical joint manipulation, and rapid velocity.',
    glyph: '☿',
    svgPathData: 'M 50 35 A 15 15 0 1 0 50 65 A 15 15 0 1 0 50 35 M 50 65 L 50 90 M 35 78 L 65 78 M 35 25 C 35 15 65 15 65 25',
  },
  {
    id: 'astaroth',
    name: 'Astaroth / Seere',
    rank: 'Mighty Duke of Jupiterian Grace',
    planet: 'Jupiter',
    alchemicalMetal: 'Tin (Stannum)',
    alchemicalSymbol: '♃',
    element: 'Air',
    legions: 40,
    barbarousFormula: 'TASA ALORA FOREN ASTAROTH CHESED',
    martialEmpowerment: 'Expansion Horse Stance & Heavy Barbell Overhead Press',
    description: 'Imparts sovereign spatial territory, deep diaphragmatic volume, and momentum.',
    glyph: '♃',
    svgPathData: 'M 25 35 Q 45 20 50 35 L 50 85 M 25 55 L 75 55 M 65 35 L 65 75 M 50 35 L 75 35',
  },
  {
    id: 'sitri',
    name: 'Sitri / Astarte',
    rank: 'Great Prince of Venusian Silk',
    planet: 'Venus',
    alchemicalMetal: 'Copper (Cuprum)',
    alchemicalSymbol: '♀',
    element: 'Earth',
    legions: 60,
    barbarousFormula: 'ANDRO MALKOS SITRI VAPULA AARAB',
    martialEmpowerment: 'Silk Reeling Qi-Gong (Chan Si Gong) & Fascial Elasticity',
    description: 'Harmonizes rotational kinetic spirals and connective tissue elasticity.',
    glyph: '♀',
    svgPathData: 'M 50 18 A 20 20 0 1 0 50 58 A 20 20 0 1 0 50 18 M 50 58 L 50 90 M 32 74 L 68 74',
  },
  {
    id: 'andras',
    name: 'Andras / Choronzon',
    rank: 'Marquis of Discordant Strike',
    planet: 'Uranus / Pluto',
    alchemicalMetal: 'Antimony & Brimstone',
    alchemicalSymbol: '🜍',
    element: 'Void',
    legions: 30,
    barbarousFormula: 'ENEN TASA ALORA ANDRAS CHORONZON 333',
    martialEmpowerment: 'Spinal Fa-Jin Whipping Power & Unorthodox Angles',
    description: 'Shatters predictable timing; unleashes explosive instantaneous strike torque.',
    glyph: '♁',
    svgPathData: 'M 50 15 L 85 80 L 15 80 Z M 50 35 L 70 70 L 30 70 Z M 50 15 L 50 85 M 25 50 L 75 50',
  }
];

const ALCHEMICAL_ELEMENTS = [
  { name: 'Sulfur (Soul / Fire)', symbol: '🜍', metal: 'Brimstone', resonancePlanet: 'Mars / Sun', baseHz: 528 },
  { name: 'Mercury (Mind / Spirit)', symbol: '☿', metal: 'Quicksilver', resonancePlanet: 'Mercury', baseHz: 741 },
  { name: 'Salt (Body / Form)', symbol: '🜔', metal: 'Earth Core', resonancePlanet: 'Earth / Saturn', baseHz: 396 },
  { name: 'Gold (Sol)', symbol: '☉', metal: 'Aurum', resonancePlanet: 'Sun', baseHz: 528 },
  { name: 'Silver (Luna)', symbol: '☽', metal: 'Argentum', resonancePlanet: 'Moon', baseHz: 432 },
  { name: 'Iron (Mars)', symbol: '♂', metal: 'Ferrum', resonancePlanet: 'Mars', baseHz: 396 },
  { name: 'Lead (Saturn)', symbol: '♄', metal: 'Plumbum', resonancePlanet: 'Saturn', baseHz: 285 },
  { name: 'Tin (Jupiter)', symbol: '♃', metal: 'Stannum', resonancePlanet: 'Jupiter', baseHz: 639 },
  { name: 'Copper (Venus)', symbol: '♀', metal: 'Cuprum', resonancePlanet: 'Venus', baseHz: 417 },
  { name: 'Antimony (Crucible)', symbol: '♁', metal: 'Stibnite', resonancePlanet: 'Pluto', baseHz: 963 },
];

export const GoeticAlchemicalBox: React.FC<GoeticAlchemicalBoxProps> = ({
  bodies,
  aspects,
  onSelectSigilToGrimoire,
}) => {
  const [activeTab, setActiveTab] = useState<'goetic' | 'alchemical'>('goetic');
  const [selectedDaemonId, setSelectedDaemonId] = useState<string>('asmodeus');
  const [selectedAlchemIdx, setSelectedAlchemIdx] = useState<number>(0);
  const [isChanting, setIsChanting] = useState<boolean>(false);

  // Compute dominant planetary daemon based on natal / transit bodies
  const dominantDaemon = useMemo(() => {
    // Check if Mars has aspects or high tension
    const marsBody = bodies.find((b) => b.name === 'Mars');
    const sunBody = bodies.find((b) => b.name === 'Sun');
    const saturnBody = bodies.find((b) => b.name === 'Saturn');

    if (aspects.some((a) => a.planet1 === 'Mars' || a.planet2 === 'Mars')) {
      return GOETIC_DAEMONS[0]; // Asmodeus
    } else if (saturnBody && (saturnBody.degree > 15 || aspects.some((a) => a.planet1 === 'Saturn'))) {
      return GOETIC_DAEMONS[2]; // Lucifuge
    } else if (sunBody) {
      return GOETIC_DAEMONS[1]; // Bael
    }
    return GOETIC_DAEMONS[0];
  }, [bodies, aspects]);

  const currentDaemon = GOETIC_DAEMONS.find((d) => d.id === selectedDaemonId) || dominantDaemon;
  const currentAlchem = ALCHEMICAL_ELEMENTS[selectedAlchemIdx] || ALCHEMICAL_ELEMENTS[0];

  // Calculate planetary resonance percentage based on celestial degrees
  const daemonResonance = useMemo(() => {
    const matchedBody = bodies.find((b) => b.name.toLowerCase().includes(currentDaemon.planet.toLowerCase().slice(0, 3)));
    const base = matchedBody ? (matchedBody.degree * 3.14) % 45 + 55 : 82;
    return Math.min(99, Math.round(base));
  }, [bodies, currentDaemon]);

  const handleChantFormula = (formula: string) => {
    setIsChanting(true);
    soundEffects.playHolographicChime(currentDaemon.element === 'Fire' ? 528 : 432);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(formula);
      utterance.rate = 0.82;
      utterance.pitch = 0.65;
      utterance.onend = () => setIsChanting(false);
      utterance.onerror = () => setIsChanting(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsChanting(false), 2000);
    }
  };

  return (
    <div
      id="goetic-alchemical-box"
      className="bg-[#120824]/90 border border-orange-500/40 rounded-2xl p-4 backdrop-blur-xl transition-all shadow-[0_0_25px_rgba(255,69,0,0.18)] font-mono text-xs flex flex-col gap-3"
    >
      {/* Box Header & View Switcher */}
      <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded flex items-center justify-center bg-orange-950/80 border border-orange-600 text-orange-400 font-bold shadow-[0_0_8px_rgba(255,69,0,0.4)]">
            <Flame className="w-3 h-3 text-orange-400" />
          </div>
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-orange-400 font-bold flex items-center gap-1.5">
              Goetic Sigils & Alchemical Matrix
            </h3>
            <p className="text-[8px] text-gray-400">Planetary Alignment Vector: {dominantDaemon.planet} Active</p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-black/60 p-0.5 rounded-lg border border-white/10 text-[9px]">
          <button
            onClick={() => setActiveTab('goetic')}
            className={`px-2 py-0.5 rounded transition-all font-bold ${
              activeTab === 'goetic'
                ? 'bg-orange-600 text-white shadow-[0_0_8px_rgba(255,69,0,0.4)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Goetic Sigils
          </button>
          <button
            onClick={() => setActiveTab('alchemical')}
            className={`px-2 py-0.5 rounded transition-all font-bold ${
              activeTab === 'alchemical'
                ? 'bg-purple-600 text-white shadow-[0_0_8px_rgba(147,51,234,0.4)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Alchemical
          </button>
        </div>
      </div>

      {activeTab === 'goetic' ? (
        /* Goetic Sigils View */
        <div className="space-y-3">
          {/* Quick Daemon Selector Chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {GOETIC_DAEMONS.map((daemon) => {
              const isSelected = daemon.id === selectedDaemonId;
              const isDominant = daemon.id === dominantDaemon.id;

              return (
                <button
                  key={daemon.id}
                  onClick={() => {
                    setSelectedDaemonId(daemon.id);
                    soundEffects.playHolographicChime(500);
                  }}
                  className={`px-2 py-1 rounded-lg border flex items-center gap-1 flex-shrink-0 text-[9px] uppercase transition-all ${
                    isSelected
                      ? 'bg-orange-950 border-orange-500 text-orange-200 shadow-[0_0_10px_rgba(255,69,0,0.3)]'
                      : 'bg-black/40 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <span>{daemon.alchemicalSymbol}</span>
                  <span className="font-bold">{daemon.name.split('/')[0].trim()}</span>
                  {isDominant && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />}
                </button>
              );
            })}
          </div>

          {/* Interactive Sigil Visualizer & Seal Container */}
          <div className="grid grid-cols-12 gap-3 items-center bg-black/60 p-3 rounded-xl border border-white/10 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-orange-600/10 rounded-full blur-2xl pointer-events-none" />

            {/* Left: Dynamic Scalable SVG Sigil Seal (5 cols) */}
            <div className="col-span-5 flex flex-col items-center justify-center p-2 bg-[#090312] border border-orange-500/40 rounded-xl relative group shadow-[inset_0_0_15px_rgba(255,69,0,0.15)]">
              {/* Outer Occult Seal Circle */}
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full animate-[spin_60s_linear_infinite]" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="#ff4500" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                  <circle cx="50" cy="50" r="41" fill="none" stroke="#a855f7" strokeWidth="0.8" opacity="0.8" />
                  <circle cx="50" cy="50" r="3" fill="#ff4500" />
                </svg>

                {/* Inner Sigil Geometry Lines */}
                <svg className="absolute inset-0 w-full h-full p-2" viewBox="0 0 100 100">
                  <path
                    d={currentDaemon.svgPathData}
                    fill="none"
                    stroke="#ffa07a"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-[0_0_6px_rgba(255,69,0,0.8)] transition-all duration-500"
                  />
                </svg>

                <div className="absolute bottom-0 right-0 text-[10px] text-orange-400 font-bold bg-black/80 px-1 rounded border border-orange-800">
                  {currentDaemon.alchemicalSymbol}
                </div>
              </div>

              <div className="mt-1 flex items-center justify-between w-full text-[8px] text-gray-400">
                <span>{currentDaemon.element}</span>
                <span className="text-orange-400 font-bold">{daemonResonance}% Res.</span>
              </div>
            </div>

            {/* Right: Daemon Meta, Barbarous Formula & Martial Synergy (7 cols) */}
            <div className="col-span-7 space-y-1.5">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-bold text-white tracking-wide">{currentDaemon.name}</h4>
                  <p className="text-[9px] text-orange-400 font-semibold">{currentDaemon.rank}</p>
                </div>
                <span className="text-[8px] px-1.5 py-0.2 rounded bg-purple-950 border border-purple-800 text-purple-300">
                  {currentDaemon.legions} Legions
                </span>
              </div>

              <p className="text-[9px] text-gray-400 leading-tight line-clamp-2">
                {currentDaemon.description}
              </p>

              <div className="bg-black/50 p-1.5 rounded border border-white/5 space-y-0.5">
                <span className="text-[8px] uppercase text-gray-500 block">Martial Empowerment:</span>
                <p className="text-[9px] text-orange-200 font-semibold leading-tight">{currentDaemon.martialEmpowerment}</p>
              </div>

              {/* Barbarous Chant & Formula Trigger */}
              <div className="pt-1 flex items-center justify-between gap-1">
                <p className="text-[8px] font-mono text-gray-300 truncate max-w-[120px] italic">
                  "{currentDaemon.barbarousFormula}"
                </p>
                <button
                  onClick={() => handleChantFormula(currentDaemon.barbarousFormula)}
                  disabled={isChanting}
                  className="px-2 py-1 bg-orange-600/80 hover:bg-orange-500 text-white rounded text-[9px] font-bold uppercase flex items-center gap-1 transition-all shadow-[0_0_8px_rgba(255,69,0,0.3)]"
                  title="Vibrate barbarous formula via acoustic engine"
                >
                  <Volume2 className="w-2.5 h-2.5" />
                  <span>{isChanting ? 'Chanting' : 'Vibrate'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Alchemical Symbols & Planetary Metals Matrix */
        <div className="space-y-3">
          {/* Alchemical Glyph Carousel Grid */}
          <div className="grid grid-cols-5 gap-1.5">
            {ALCHEMICAL_ELEMENTS.map((elem, idx) => {
              const isSelected = idx === selectedAlchemIdx;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedAlchemIdx(idx);
                    soundEffects.playHolographicChime(elem.baseHz);
                  }}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-purple-950/80 border-purple-500 text-purple-200 shadow-[0_0_12px_rgba(147,51,234,0.35)] scale-105'
                      : 'bg-black/40 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <span className="text-sm font-bold">{elem.symbol}</span>
                  <span className="text-[8px] truncate w-full text-center mt-0.5">{elem.metal.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Selected Alchemical Element Detail Card */}
          <div className="bg-black/60 p-3 rounded-xl border border-white/10 space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-orange-400">{currentAlchem.symbol}</span>
                <div>
                  <h4 className="text-xs font-bold text-white">{currentAlchem.name}</h4>
                  <p className="text-[9px] text-gray-400">Metal: {currentAlchem.metal}</p>
                </div>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300 font-mono">
                {currentAlchem.baseHz} Hz
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[9px]">
              <div className="p-1.5 bg-white/5 rounded border border-white/5">
                <span className="text-gray-500 uppercase block text-[8px]">Planetary Ruler</span>
                <span className="text-orange-300 font-bold">{currentAlchem.resonancePlanet}</span>
              </div>
              <div className="p-1.5 bg-white/5 rounded border border-white/5">
                <span className="text-gray-500 uppercase block text-[8px]">Harmonic Chime</span>
                <button
                  onClick={() => soundEffects.playHolographicChime(currentAlchem.baseHz)}
                  className="text-purple-300 hover:text-white underline font-bold flex items-center gap-1"
                >
                  <Volume2 className="w-2.5 h-2.5" />
                  <span>Resonate Tone</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alignment Status Footer */}
      <div className="flex items-center justify-between text-[8px] text-gray-500 pt-1 border-t border-white/5">
        <span className="flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-orange-500" />
          <span>Real-Time Planetary Alignment Engine</span>
        </span>
        <span className="text-orange-400/80 font-mono">Clavicula Salomonis / PGM Synced</span>
      </div>
    </div>
  );
};
