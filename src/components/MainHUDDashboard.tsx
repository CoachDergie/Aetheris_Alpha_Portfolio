import React from 'react';
import { useTradition } from '../contexts/TraditionContext';
import { NatalData, CelestialBody, PlanetaryAspect, LunarPhaseInfo, ViewTab } from '../types';
import { DAILY_INVOCATIONS } from '../utils/astronomy';
import { Sparkles, BookOpen, ChevronRight, Moon, MapPin } from 'lucide-react';

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
  const { t } = useTradition();

  const dayIdx = new Date().getDay();
  const dailyInvocation = DAILY_INVOCATIONS[dayIdx] || DAILY_INVOCATIONS[0];

  return (
    <div className="flex flex-col gap-3 w-full p-2 sm:p-4 min-w-0 max-w-full">
      {/* 1. Inception & Origin Vector Box */}
      <div 
        id="hud-origin-card"
        onClick={onOpenCalibrate}
        className="cursor-pointer bg-[#1E2638] border border-cyan-500/40 hover:border-[#00e5ff] rounded-2xl p-3 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all space-y-2 min-w-0"
      >
        <div className="flex items-center justify-between min-w-0">
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <MapPin className="w-3.5 h-3.5 text-[#00e5ff] shrink-0" />
            <span className="text-[10px] sm:text-[11px] font-mono font-black text-cyan-400 uppercase tracking-widest truncate">
              INCEPTION ORIGIN
            </span>
          </div>
          <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded bg-[#131E30] border border-cyan-500/40 text-cyan-300 font-bold uppercase shrink-0">
            CALIBRATE
          </span>
        </div>

        <div className="pt-0.5 min-w-0">
          <div className="text-base sm:text-lg font-black font-mono text-white uppercase tracking-wider truncate">
            {natal.birthCity.toUpperCase()}
          </div>
          <div className="text-[11px] sm:text-xs font-mono text-gray-400 mt-0.5 truncate">
            {natal.birthDate} // {natal.birthTime} UTC
          </div>
        </div>

        <div className="pt-2 border-t border-[#2A3650] flex items-center justify-between text-[11px] sm:text-xs font-mono min-w-0">
          <span className="text-[#ffd700] font-extrabold truncate">
            ASC: {ascendant.sign} {ascendant.deg}°{ascendant.min}'
          </span>
          <span className="text-gray-400 font-bold truncate">
            MC: {midheaven.sign} {midheaven.deg}°
          </span>
        </div>
      </div>

      {/* 2. Real-Time Lunar Vector Box */}
      <div 
        id="hud-lunar-card"
        onClick={() => setTab('natal')}
        className="cursor-pointer bg-[#1E2638] border border-yellow-500/40 hover:border-[#ffd700] rounded-2xl p-3 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all space-y-2 min-w-0"
      >
        <div className="flex items-center justify-between min-w-0">
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <Moon className="w-3.5 h-3.5 text-[#ffd700] shrink-0" />
            <span className="text-[10px] sm:text-[11px] font-mono font-black text-yellow-400 uppercase tracking-widest truncate">
              LUNAR VECTOR
            </span>
          </div>
          <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded bg-[#2B2312] border border-yellow-500/40 text-yellow-300 font-bold uppercase shrink-0">
            {lunar.currentSign}
          </span>
        </div>

        <div className="pt-0.5 min-w-0">
          <div className="text-base sm:text-lg font-black font-mono text-[#ffd700] uppercase tracking-wider truncate">
            {lunar.phaseName}
          </div>
          <div className="text-[11px] sm:text-xs font-mono text-gray-300 mt-0.5 truncate">
            {lunar.illumination}% Surface Illumination
          </div>
        </div>

        <div className="pt-2 border-t border-[#2A3650] flex items-center justify-between text-[10px] sm:text-xs font-mono min-w-0">
          <span className="text-cyan-300 font-bold truncate">
            VOID: {lunar.isVoidOfCourse ? 'ACTIVE' : 'INACTIVE'}
          </span>
          <span className="text-gray-400 shrink-0">
            NATAL SYNC: LIVE
          </span>
        </div>
      </div>

      {/* 3. Celestial Mandala Core Box */}
      <div 
        id="hud-mandala-card"
        className="bg-[#1E2638] border border-cyan-500/40 rounded-2xl p-3 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.4)] space-y-2.5 min-w-0"
      >
        <div className="flex items-center justify-between pb-2 border-b border-[#2A3650] min-w-0">
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ffd700] shrink-0" />
            <h3 className="text-[11px] sm:text-xs font-black font-mono text-[#ffd700] uppercase tracking-widest truncate">
              CELESTIAL MANDALA CORE
            </h3>
          </div>
          <button
            onClick={() => setTab('natal')}
            className="text-[9px] sm:text-[10px] font-mono text-cyan-400 hover:text-white uppercase flex items-center gap-0.5 font-bold shrink-0"
          >
            <span>Full Mandala</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-1.5 font-mono text-xs min-w-0">
          {bodies.slice(0, 6).map((body) => (
            <div
              key={body.name}
              className="flex items-center justify-between p-2 rounded-xl bg-[#161B26] border border-[#2E3B57] hover:border-cyan-500/40 transition-colors min-w-0 gap-2"
            >
              <div className="flex items-center gap-2 min-w-0 truncate">
                <span className="text-base text-[#ffd700] font-serif w-4 text-center shrink-0">{body.symbol}</span>
                <div className="min-w-0 truncate">
                  <span className="font-bold text-white uppercase text-[11px] sm:text-xs">{body.name}</span>
                  <span className="text-gray-400 ml-1.5 text-[10px] sm:text-xs truncate">in {body.sign} {body.degree}°</span>
                </div>
              </div>
              {body.qliphoticSphere && (
                <span className="text-[8.5px] sm:text-[9.5px] px-1.5 py-0.5 rounded bg-[#122238] border border-cyan-500/40 text-cyan-300 font-bold shrink-0 truncate">
                  {body.qliphoticSphere.split('(')[0].trim()}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Daily Esoteric Formula & Invocation Box */}
      <div 
        id="hud-invocation-card"
        className="bg-[#1E2638] border border-cyan-500/40 rounded-2xl p-3 sm:p-4 shadow-[0_4px_20px_rgba(0,0,0,0.4)] space-y-2.5 min-w-0"
      >
        <div className="flex items-center justify-between pb-2 border-b border-[#2A3650] min-w-0">
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00e5ff] shrink-0" />
            <h3 className="text-[11px] sm:text-xs font-black font-mono text-[#00e5ff] uppercase tracking-widest truncate">
              DAILY ESOTERIC FORMULA
            </h3>
          </div>
          <button
            onClick={() => setTab('occult')}
            className="text-[9px] sm:text-[10px] font-mono text-cyan-400 hover:text-white uppercase flex items-center gap-0.5 font-bold shrink-0"
          >
            <span>Grimoire</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="p-2.5 sm:p-3 bg-[#161B26] border border-[#2E3B57] rounded-xl space-y-1 min-w-0">
          <p className="text-[11px] sm:text-xs font-mono font-bold text-[#ffd700] tracking-wide leading-relaxed break-words">
            "{dailyInvocation.barbarousFormula}"
          </p>
          <p className="text-[10px] sm:text-[11px] text-gray-400 font-mono truncate">
            {dailyInvocation.planet} // {dailyInvocation.martialCorrelation}
          </p>
        </div>
      </div>
    </div>
  );
};
