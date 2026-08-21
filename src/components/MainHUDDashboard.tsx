import React from 'react';
import { NatalData, CelestialBody, PlanetaryAspect, LunarPhaseInfo, ViewTab } from '../types';
import { DAILY_INVOCATIONS } from '../utils/astronomy';
import { Sparkles, BookOpen, ChevronRight, Moon, MapPin, Compass } from 'lucide-react';

interface MainHUDDashboardProps {
  natal: NatalData;
  bodies: CelestialBody[];
  aspects: PlanetaryAspect[];
  lunar: LunarPhaseInfo;
  ascendant: { sign: string; deg: number; min: number };
  midheaven: { sign: string; deg: number; min: number };
  setTab: (tab: ViewTab) => void;
  onOpenCalibrate: () => void;
}

export const MainHUDDashboard: React.FC<MainHUDDashboardProps> = ({
  natal,
  bodies,
  aspects,
  lunar,
  ascendant,
  midheaven,
  setTab,
  onOpenCalibrate,
}) => {
  const dayIdx = new Date().getDay();
  const dailyInvocation = DAILY_INVOCATIONS[dayIdx] || DAILY_INVOCATIONS[0];

  return (
    <div className="flex flex-col gap-4 w-full max-w-xl mx-auto p-3 sm:p-5">
      {/* Side-Screen Applet Sub-Header Indicator */}
      <div className="flex items-center justify-between px-1 pb-1 border-b border-cyan-500/20 text-[11px] font-mono">
        <span className="text-cyan-400 font-bold tracking-widest uppercase flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          XR SIDE-SCREEN HUD
        </span>
        <span className="text-gray-400">STACKED TELEMETRY STREAM</span>
      </div>

      {/* 1. Inception & Origin Vector Box (Single Column Stack) */}
      <div 
        id="hud-origin-card"
        onClick={onOpenCalibrate}
        className="cursor-pointer bg-gradient-to-b from-[#141a2e]/95 to-[#0c1020]/95 border border-cyan-500/40 hover:border-[#00e5ff] rounded-2xl p-4 shadow-[0_0_25px_rgba(0,0,0,0.6)] transition-all hover:shadow-[0_0_20px_rgba(0,229,255,0.25)] space-y-2.5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#00e5ff]" />
            <span className="text-[11px] font-mono font-black text-cyan-400 uppercase tracking-widest">
              INCEPTION ORIGIN
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold uppercase">
            CALIBRATE
          </span>
        </div>

        <div className="pt-1">
          <div className="text-lg font-black font-mono text-white uppercase tracking-wider">
            {natal.birthCity.toUpperCase()}
          </div>
          <div className="text-xs font-mono text-gray-400 mt-0.5">
            {natal.birthDate} // {natal.birthTime} UTC
          </div>
        </div>

        <div className="pt-2 border-t border-cyan-500/20 flex items-center justify-between text-xs font-mono">
          <span className="text-[#ffd700] font-extrabold">
            ASC: {ascendant.sign} {ascendant.deg}°{ascendant.min}'
          </span>
          <span className="text-gray-400 font-bold">
            MC: {midheaven.sign} {midheaven.deg}°
          </span>
        </div>
      </div>

      {/* 2. Real-Time Lunar Vector Box (Single Column Stack) */}
      <div 
        id="hud-lunar-card"
        onClick={() => setTab('natal')}
        className="cursor-pointer bg-gradient-to-b from-[#141a2e]/95 to-[#0c1020]/95 border border-yellow-500/40 hover:border-[#ffd700] rounded-2xl p-4 shadow-[0_0_25px_rgba(0,0,0,0.6)] transition-all hover:shadow-[0_0_20px_rgba(255,215,0,0.25)] space-y-2.5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="w-3.5 h-3.5 text-[#ffd700]" />
            <span className="text-[11px] font-mono font-black text-yellow-400 uppercase tracking-widest">
              LUNAR VECTOR
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-yellow-950/80 border border-yellow-500/40 text-yellow-300 font-bold uppercase">
            {lunar.currentSign}
          </span>
        </div>

        <div className="pt-1">
          <div className="text-lg font-black font-mono text-[#ffd700] uppercase tracking-wider">
            {lunar.phaseName}
          </div>
          <div className="text-xs font-mono text-gray-300 mt-0.5">
            {lunar.illumination}% Surface Illumination
          </div>
        </div>

        <div className="pt-2 border-t border-yellow-500/20 flex items-center justify-between text-xs font-mono">
          <span className="text-cyan-300 font-bold">
            VOID OF COURSE: {lunar.isVoidOfCourse ? 'ACTIVE' : 'INACTIVE'}
          </span>
          <span className="text-gray-400">
            NATAL SYNC: LIVE
          </span>
        </div>
      </div>

      {/* 3. Celestial Mandala Core Box (Single Column Stack) */}
      <div 
        id="hud-mandala-card"
        className="bg-[#101526]/95 border border-cyan-500/40 rounded-2xl p-4 shadow-[0_0_25px_rgba(0,0,0,0.6)] space-y-3"
      >
        <div className="flex items-center justify-between pb-2.5 border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#ffd700]" />
            <h3 className="text-xs font-black font-mono text-[#ffd700] uppercase tracking-widest">
              CELESTIAL MANDALA CORE
            </h3>
          </div>
          <button
            onClick={() => setTab('natal')}
            className="text-[10px] font-mono text-cyan-400 hover:text-white uppercase flex items-center gap-1 font-bold"
          >
            <span>Full Mandala</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2 font-mono text-xs">
          {bodies.slice(0, 6).map((body) => (
            <div
              key={body.name}
              className="flex items-center justify-between p-2.5 rounded-xl bg-black/50 border border-gray-800 hover:border-cyan-500/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg text-[#ffd700] font-serif w-5 text-center">{body.symbol}</span>
                <div>
                  <span className="font-bold text-white uppercase">{body.name}</span>
                  <span className="text-gray-400 ml-2">in {body.sign} {body.degree}°</span>
                </div>
              </div>
              {body.qliphoticSphere && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold">
                  {body.qliphoticSphere.split('(')[0].trim()}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Daily Esoteric Formula & Invocation Box (Single Column Stack) */}
      <div 
        id="hud-invocation-card"
        className="bg-[#101526]/95 border border-cyan-500/40 rounded-2xl p-4 shadow-[0_0_25px_rgba(0,0,0,0.6)] space-y-3"
      >
        <div className="flex items-center justify-between pb-2.5 border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#00e5ff]" />
            <h3 className="text-xs font-black font-mono text-[#00e5ff] uppercase tracking-widest">
              DAILY ESOTERIC FORMULA
            </h3>
          </div>
          <button
            onClick={() => setTab('occult')}
            className="text-[10px] font-mono text-cyan-400 hover:text-white uppercase flex items-center gap-1 font-bold"
          >
            <span>Grimoire</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="p-3 bg-black/40 border border-gray-800 rounded-xl space-y-1.5">
          <p className="text-xs font-mono font-bold text-[#ffd700] tracking-wide leading-relaxed">
            "{dailyInvocation.barbarousFormula}"
          </p>
          <p className="text-[11px] text-gray-400 font-mono">
            {dailyInvocation.planet} // {dailyInvocation.martialCorrelation}
          </p>
        </div>
      </div>
    </div>
  );
};
