import React, { useState, useEffect } from 'react';
import { EnvironmentViewMode } from '../types';
import { 
  Compass, 
  Layers, 
  Activity, 
  Battery, 
  Wifi, 
  Camera, 
} from 'lucide-react';

interface MetaQuestEnvironmentProps {
  children: React.ReactNode;
  viewMode: EnvironmentViewMode;
  setViewMode: (mode: EnvironmentViewMode) => void;
  showDevTelemetry: boolean;
  setShowDevTelemetry: (show: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  lunarPhaseName: string;
}

export const MetaQuestEnvironment: React.FC<MetaQuestEnvironmentProps> = ({
  children,
  viewMode,
  setViewMode,
  showDevTelemetry,
  setShowDevTelemetry,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('03:33');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative w-full min-h-screen min-h-[100dvh] bg-[#070913] text-gray-200 font-sans select-none flex flex-col items-center justify-start overflow-x-hidden"
      style={{
        backgroundColor: '#070913',
        minHeight: '100dvh',
      }}
    >
      {/* 1. OPTIONAL COSMIC STARFIELD FOR SIMULATED XR MODE */}
      {viewMode === 'headset_xr' && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f172a] via-[#080d1a] to-[#070913]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(#00e5ff_1px,transparent_1px)] [background-size:48px_48px] opacity-20"></div>
          <div className="absolute inset-0 bg-[radial-gradient(#ffd700_1.5px,transparent_1.5px)] [background-size:96px_96px] opacity-25 animate-pulse"></div>
        </div>
      )}

      {/* 2. TOP XR COMPACT BAR & VIEW CONTROLLER */}
      <div className="relative z-30 w-full max-w-xl flex items-center justify-between px-3 py-1.5 bg-[#0a0d18] border-b border-cyan-500/20 text-[10px] font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_#00e5ff]"></span>
          <span className="font-bold text-cyan-300 tracking-wider">AETHERIS // XR HUD</span>
        </div>

        <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded-lg border border-cyan-500/30">
          <button
            id="view-mode-direct"
            onClick={() => setViewMode('direct_panel')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
              viewMode === 'direct_panel'
                ? 'bg-cyan-500 text-black shadow-[0_0_8px_rgba(0,229,255,0.6)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            HUD Panel
          </button>
          <button
            id="view-mode-headset"
            onClick={() => setViewMode('headset_xr')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
              viewMode === 'headset_xr'
                ? 'bg-cyan-500 text-black shadow-[0_0_8px_rgba(0,229,255,0.6)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Cosmos
          </button>
        </div>

        <button
          id="toggle-telemetry-btn"
          onClick={() => setShowDevTelemetry(!showDevTelemetry)}
          className={`px-2 py-0.5 rounded border text-[9px] font-bold transition-all ${
            showDevTelemetry
              ? 'bg-emerald-950 border-emerald-400 text-emerald-300'
              : 'bg-black/50 border-gray-700 text-gray-400'
          }`}
          title="Toggle VR Metrics"
        >
          <Activity className="w-3 h-3 inline mr-0.5" />
          {showDevTelemetry ? 'ON' : 'METRICS'}
        </button>
      </div>

      {/* 3. DEVELOPER METRICS HUD OVERLAY */}
      {showDevTelemetry && (
        <div className="fixed top-10 left-4 z-40 bg-[#060810] border border-emerald-500/60 p-2.5 rounded-lg font-mono text-[10px] text-emerald-400 shadow-[0_0_20px_rgba(0,0,0,0.8)] space-y-1 select-none pointer-events-none">
          <div className="text-[9px] font-bold text-gray-400 border-b border-emerald-500/30 pb-0.5">
            SAMSUNG.XR / VRSHELL // 72.0 FPS
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-gray-400">HEAP:</span>
            <span>248 MB</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-gray-400">GPU RENDER:</span>
            <span>SKIA DIRECT 2D</span>
          </div>
        </div>
      )}

      {/* 4. MAIN RESPONSIVE CHASSIS */}
      {/* Expands seamlessly to 100% on thin mobile/side-screen, centers cleanly up to max-w-xl */}
      <div className="relative z-10 w-full max-w-xl flex-1 flex flex-col bg-[#070913] border-x border-cyan-500/20 sm:shadow-[0_0_40px_rgba(0,229,255,0.15)]">
        <div className="w-full flex-1 flex flex-col bg-[#070913]">
          {children}
        </div>
      </div>

      {/* 5. VIRTUAL META QUEST SYSTEM DOCK (Simulated Mode Only) */}
      {viewMode === 'headset_xr' && (
        <div className="relative z-30 py-3 flex justify-center pointer-events-auto w-full bg-[#070913] border-t border-gray-900">
          <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#0d1222] border border-white/20 text-gray-300">
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-white pr-2 border-r border-white/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{currentTime}</span>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-1 rounded-full hover:text-cyan-300" title="Home">
                <Compass className="w-3.5 h-3.5" />
              </button>
              <button className="p-1 rounded-full hover:text-cyan-300" title="Library">
                <Layers className="w-3.5 h-3.5" />
              </button>
              <button className="p-1 rounded-full hover:text-cyan-300" title="Passthrough">
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2 pl-2 border-l border-white/20 font-mono text-[10px]">
              <div className="flex items-center gap-0.5 text-emerald-400">
                <Wifi className="w-3 h-3" />
                <span>5G</span>
              </div>
              <div className="flex items-center gap-0.5 text-cyan-300">
                <Battery className="w-3 h-3" />
                <span>94%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
