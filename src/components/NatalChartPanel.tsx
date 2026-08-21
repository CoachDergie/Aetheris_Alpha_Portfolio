import React from 'react';
import { NatalData, CelestialBody, PlanetaryAspect, LunarPhaseInfo } from '../types';

interface NatalChartPanelProps {
  natal: NatalData;
  setNatal: React.Dispatch<React.SetStateAction<NatalData>>;
  bodies: CelestialBody[];
  aspects: PlanetaryAspect[];
  lunar: LunarPhaseInfo;
  ascendant: { sign: string; deg: number; min: number };
  midheaven: { sign: string; deg: number; min: number };
}

export const NatalChartPanel: React.FC<NatalChartPanelProps> = ({
  natal,
  setNatal,
  bodies,
  aspects,
  lunar,
  ascendant,
  midheaven,
}) => {
  return (
    <div className="flex flex-col gap-4 w-full p-2 sm:p-3 text-center">
      {/* Headset Style Title */}
      <div className="space-y-1">
        <h2 className="text-base sm:text-lg font-black font-mono tracking-widest text-[#ffd700] uppercase drop-shadow-[0_0_12px_rgba(255,215,0,0.6)]">
          ✦ NATAL CELESTIAL MANDALA
        </h2>
        <p className="text-xs font-mono font-bold text-gray-300 tracking-wider">
          ASCENDANT: {ascendant.sign} {ascendant.deg}° • MIDHEAVEN: {midheaven.sign} {midheaven.deg}°
        </p>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-[#ffd700]/40 to-transparent my-0.5"></div>

      {/* Planetary Matrix Cards - Single Column Centered Stack Matching Headset Screenshot */}
      <div className="flex flex-col gap-3 text-center w-full">
        {bodies.map((body) => (
          <div
            key={body.name}
            id={`natal-body-${body.name.toLowerCase()}`}
            className="bg-gradient-to-b from-[#141b2e]/95 to-[#0a0e1a]/95 border border-yellow-500/30 hover:border-[#ffd700] rounded-2xl p-4 shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all flex flex-col items-center justify-center space-y-1.5"
          >
            {/* Celestial Glyph */}
            <div className="text-3xl text-[#ffd700] font-serif flex items-center justify-center w-10 h-10 rounded-xl bg-yellow-950/40 border border-yellow-500/40 shadow-[0_0_12px_rgba(255,215,0,0.3)]">
              {body.symbol}
            </div>

            {/* Name and Sign */}
            <div className="text-xs font-black font-mono tracking-wider uppercase text-white">
              <span className="text-[#ffd700]">{body.name}</span> IN {body.sign.toUpperCase()} {body.degree}°{body.minute}'
            </div>

            {/* Archetype Description */}
            <p className="text-[11px] text-gray-300 font-sans leading-relaxed max-w-sm px-2">
              {body.archetype}
            </p>

            {/* Qliphotic Correlation */}
            {body.qliphoticSphere && (
              <div className="mt-1 px-2.5 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-400/40 text-[#00e5ff] text-[10px] font-mono font-bold shadow-[0_0_10px_rgba(0,229,255,0.2)]">
                ⚡ QLIPHA: {body.qliphoticSphere.toUpperCase()}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Planetary Aspects Section - Single Column Stack */}
      <div className="mt-3 space-y-2.5">
        <h3 className="text-xs font-black font-mono text-[#ffd700] uppercase tracking-widest text-center drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
          ✦ PLANETARY ASPECTS
        </h3>

        <div className="flex flex-col gap-2 text-left w-full">
          {aspects.map((aspect, idx) => (
            <div
              key={idx}
              id={`natal-aspect-${idx}`}
              className="bg-[#101628]/95 border border-cyan-500/30 rounded-xl p-3 shadow-[0_0_12px_rgba(0,0,0,0.4)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black font-mono text-white uppercase tracking-wider">
                  {aspect.planet1} {aspect.aspectType.toUpperCase()} {aspect.planet2}
                </span>
                <span className="text-[9px] font-mono text-cyan-300 font-bold">
                  ORB: {aspect.orb}° ({aspect.intensity.toUpperCase()})
                </span>
              </div>
              <p className="text-[10px] text-gray-300 mt-1 leading-snug font-sans">
                {aspect.esotericMeaning}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
