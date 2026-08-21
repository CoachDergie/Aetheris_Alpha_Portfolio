import React from 'react';
import { NatalData, CelestialBody, PlanetaryAspect, LunarPhaseInfo } from '../types';
import { Sparkles, Moon, MapPin, Compass } from 'lucide-react';

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
  return (
    <div className="flex flex-col gap-5 w-full max-w-xl mx-auto p-3 sm:p-5 text-center">
      {/* Headset Style Title */}
      <div className="space-y-1">
        <h2 className="text-lg sm:text-xl font-black font-mono tracking-widest text-[#ffd700] uppercase drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]">
          ✦ NATAL CELESTIAL MANDALA
        </h2>
        <p className="text-xs font-mono font-bold text-gray-300 tracking-wider uppercase">
          ASCENDANT: {ascendant.sign} {ascendant.deg}°{ascendant.min}' • MIDHEAVEN: {midheaven.sign} {midheaven.deg}°
        </p>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-[#ffd700]/40 to-transparent my-1"></div>

      {/* Planetary Matrix Cards - Single Column Stack */}
      <div className="flex flex-col gap-3 text-left w-full">
        {bodies.map((body) => (
          <div
            key={body.name}
            id={`natal-body-${body.name.toLowerCase()}`}
            className="bg-gradient-to-b from-[#141b2e]/95 to-[#0a0e1a]/95 border border-yellow-500/30 hover:border-[#ffd700] rounded-2xl p-4 shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all flex flex-col justify-between"
          >
            <div className="flex items-start gap-3.5">
              <div className="text-3xl text-[#ffd700] font-serif flex items-center justify-center w-11 h-11 rounded-xl bg-yellow-950/40 border border-yellow-500/40 shadow-[0_0_12px_rgba(255,215,0,0.3)] shrink-0">
                {body.symbol}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-black font-mono text-white tracking-wider uppercase truncate">
                    {body.name}
                  </h3>
                  <span className="text-xs font-mono font-bold text-[#ffd700] uppercase shrink-0">
                    IN {body.sign} {body.degree}°{body.minute}'
                  </span>
                </div>

                <p className="text-xs text-gray-300 mt-1 font-sans leading-relaxed">
                  {body.archetype}
                </p>

                {body.qliphoticSphere && (
                  <div className="mt-2 px-2.5 py-0.5 rounded-lg bg-cyan-950/80 border border-cyan-400/40 text-[#00e5ff] text-[10px] font-mono font-bold inline-block shadow-[0_0_10px_rgba(0,229,255,0.2)]">
                    ⚡ QLIPHA: {body.qliphoticSphere.toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Planetary Aspects Section - Single Column Stack */}
      <div className="mt-4 space-y-3">
        <h3 className="text-sm font-black font-mono text-[#ffd700] uppercase tracking-widest text-center drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
          ✦ PLANETARY ASPECTS
        </h3>

        <div className="flex flex-col gap-2.5 text-left w-full">
          {aspects.map((aspect, idx) => (
            <div
              key={idx}
              id={`natal-aspect-${idx}`}
              className="bg-[#101628]/95 border border-cyan-500/30 rounded-xl p-3.5 shadow-[0_0_15px_rgba(0,0,0,0.4)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black font-mono text-white uppercase tracking-wider">
                  {aspect.planet1} {aspect.aspectType.toUpperCase()} {aspect.planet2}
                </span>
                <span className="text-[10px] font-mono text-cyan-300 font-extrabold">
                  ORB: {aspect.orb}° • {aspect.intensity.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-gray-300 mt-1.5 leading-snug font-sans">
                {aspect.esotericMeaning}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
