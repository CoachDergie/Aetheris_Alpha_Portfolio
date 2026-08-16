import React, { useState } from 'react';
import { NatalData, CelestialBody, PlanetaryAspect, LunarPhaseInfo } from '../types';
import { Sparkles, Moon, MapPin, Calendar, Clock, AlertTriangle, Shield, CheckCircle2 } from 'lucide-react';
import { soundEffects } from '../utils/telemetry';
import { GoeticAlchemicalBox } from './GoeticAlchemicalBox';

interface NatalChartPanelProps {
  natal: NatalData;
  setNatal: React.Dispatch<React.SetStateAction<NatalData>>;
  bodies: CelestialBody[];
  aspects: PlanetaryAspect[];
  lunar: LunarPhaseInfo;
  ascendant: { sign: string; deg: number; min: number };
  midheaven: { sign: string; deg: number; min: number };
  onSelectSigilToGrimoire?: (sigilName: string, formula: string) => void;
}

export const NatalChartPanel: React.FC<NatalChartPanelProps> = ({
  natal,
  setNatal,
  bodies,
  aspects,
  lunar,
  ascendant,
  midheaven,
  onSelectSigilToGrimoire,
}) => {
  const [isEditingNatal, setIsEditingNatal] = useState(false);
  const [tempDate, setTempDate] = useState(natal.birthDate);
  const [tempTime, setTempTime] = useState(natal.birthTime);
  const [tempCity, setTempCity] = useState(natal.birthCity);
  const [tempCountry, setTempCountry] = useState(natal.birthCountry);

  const handleSaveNatal = (e: React.FormEvent) => {
    e.preventDefault();
    setNatal((prev) => ({
      ...prev,
      birthDate: tempDate,
      birthTime: tempTime,
      birthCity: tempCity,
      birthCountry: tempCountry,
    }));
    setIsEditingNatal(false);
    soundEffects.playHolographicChime(639);
  };

  return (
    <aside className="flex flex-col gap-4 w-full h-full">
      {/* 1. Natal Coordinates & Quick Editor */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl transition-all hover:border-orange-500/30">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-orange-400 font-mono flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Natal Coordinates
          </h2>
          <button
            onClick={() => setIsEditingNatal(!isEditingNatal)}
            className="text-[10px] font-mono text-orange-400/80 hover:text-orange-300 uppercase underline"
          >
            {isEditingNatal ? 'Cancel' : 'Edit Birth Data'}
          </button>
        </div>

        {isEditingNatal ? (
          <form onSubmit={handleSaveNatal} className="space-y-3 font-mono text-xs">
            <div>
              <label className="text-[9px] uppercase text-gray-400 block mb-1">Date of Birth</label>
              <input
                type="date"
                value={tempDate}
                onChange={(e) => setTempDate(e.target.value)}
                className="w-full bg-black/60 border border-white/20 rounded px-2.5 py-1.5 text-white text-xs focus:border-orange-500 outline-none"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] uppercase text-gray-400 block mb-1">Birth Time</label>
                <input
                  type="time"
                  value={tempTime}
                  onChange={(e) => setTempTime(e.target.value)}
                  className="w-full bg-black/60 border border-white/20 rounded px-2 py-1.5 text-white text-xs focus:border-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] uppercase text-gray-400 block mb-1">City / Region</label>
                <input
                  type="text"
                  placeholder="e.g. Kyoto"
                  value={tempCity}
                  onChange={(e) => setTempCity(e.target.value)}
                  className="w-full bg-black/60 border border-white/20 rounded px-2 py-1.5 text-white text-xs focus:border-orange-500 outline-none"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded text-xs font-semibold uppercase tracking-wider transition-colors shadow-[0_0_10px_rgba(255,69,0,0.4)]"
            >
              Re-Calculate Occult Alignment
            </button>
          </form>
        ) : (
          <div className="space-y-2.5 font-mono">
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-xs text-gray-400">Subject</span>
              <span className="text-xs text-white font-medium">{natal.birthCity || 'New York'}, {natal.birthDate}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-xs text-gray-400">Ascendant</span>
              <span className="text-xs text-orange-300 font-bold">{ascendant.sign} {ascendant.deg}°{ascendant.min}'</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-xs text-gray-400">Midheaven (MC)</span>
              <span className="text-xs text-orange-300 font-bold">{midheaven.sign} {midheaven.deg}°{midheaven.min}'</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-xs text-gray-400">Sun Sign / Daemon</span>
              <span className="text-xs text-orange-200">{bodies[0]?.sign} ({bodies[0]?.degree}°)</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-xs text-gray-400">Lunar Phase</span>
              <span className="text-xs text-orange-200">{lunar.phaseName} ({lunar.illumination}%)</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Real-Time Lunar Phase & Dark Affinity */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-orange-400 font-mono flex items-center gap-1.5">
            <Moon className="w-3.5 h-3.5" />
            Real-Time Lunar Vector
          </h2>
          <span className="text-[9px] px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800 text-purple-300 font-mono">
            {lunar.currentSign}
          </span>
        </div>

        <div className="flex items-center gap-3 py-1">
          {/* Visual Lunar Orb */}
          <div className="relative w-12 h-12 rounded-full bg-slate-900 border border-white/20 flex items-center justify-center overflow-hidden shadow-[0_0_12px_rgba(255,255,255,0.15)] flex-shrink-0">
            <div
              className="absolute inset-0 bg-orange-100 rounded-full transition-all duration-700"
              style={{
                clipPath: `polygon(0 0, ${lunar.illumination}% 0, ${lunar.illumination}% 100%, 0 100%)`,
                opacity: 0.9,
              }}
            />
            <span className="relative z-10 text-[10px] font-mono text-black font-bold mix-blend-difference">
              {lunar.illumination}%
            </span>
          </div>

          <div className="text-xs font-mono space-y-1">
            <p className="text-white font-semibold">{lunar.phaseName}</p>
            <p className="text-[10px] text-gray-400">Age: {lunar.ageDays} days • Next Full: {lunar.nextFullMoon}</p>
            <p className="text-[9px] text-orange-300/90 italic line-clamp-1">{lunar.esotericAffinity}</p>
          </div>
        </div>
      </div>

      {/* 3. High-Intensity Planetary Transits & Squares */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl max-h-[220px] overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-orange-400 font-mono flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
            Planetary Transits & Squares
          </h2>
          <span className="text-[9px] text-gray-400 font-mono">Orbs &lt; 8°</span>
        </div>

        <div className="space-y-2 font-mono">
          {aspects.length === 0 ? (
            <p className="text-xs text-gray-400">No discordant aspects active at this instant.</p>
          ) : (
            aspects.slice(0, 3).map((asp, idx) => {
              const isSquare = asp.aspectType === 'Square';
              const isOpp = asp.aspectType === 'Opposition';

              return (
                <div
                  key={idx}
                  className={`p-2 rounded-xl border transition-all ${
                    isSquare
                      ? 'bg-red-950/20 border-red-800/50 hover:border-red-500'
                      : isOpp
                      ? 'bg-orange-950/20 border-orange-800/50 hover:border-orange-500'
                      : 'bg-purple-950/20 border-purple-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded flex items-center justify-center bg-black/60 text-orange-400 text-[10px] border border-white/10">
                        {asp.planet1 === 'Mars' ? '♂' : asp.planet1 === 'Saturn' ? '♄' : asp.planet1 === 'Sun' ? '☉' : '✦'}
                      </span>
                      <p className="text-[10px] font-bold text-white">
                        {asp.planet1} {asp.aspectType} {asp.planet2}
                      </p>
                    </div>
                    <span
                      className={`text-[8px] px-1.5 py-0.2 rounded uppercase font-mono ${
                        isSquare
                          ? 'bg-red-900/60 text-red-300'
                          : isOpp
                          ? 'bg-orange-900/60 text-orange-300'
                          : 'bg-purple-900/60 text-purple-300'
                      }`}
                    >
                      {asp.intensity}
                    </span>
                  </div>
                  <p className="text-[8px] text-gray-400 leading-tight line-clamp-1">{asp.esotericMeaning}</p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. Bottom-Left: Updated Goetic Sigils & Alchemical Symbols Box */}
      <GoeticAlchemicalBox
        bodies={bodies}
        aspects={aspects}
        onSelectSigilToGrimoire={onSelectSigilToGrimoire}
      />
    </aside>
  );
};

