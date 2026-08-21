import React, { useState, useEffect } from 'react';
import { EnvironmentViewMode } from '../types';
import { 
  Compass, 
  Volume2, 
  VolumeX, 
  Layers, 
  Activity, 
  Battery, 
  Wifi, 
  Sliders, 
  Camera, 
  Mic 
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
  soundEnabled,
  setSoundEnabled,
  lunarPhaseName,
}) => {
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { width, height, left, top } = currentTarget.getBoundingClientRect();
    const nx = (clientX - left) / width;
    const ny = (clientY - top) / height;
    setMousePos({ x: nx, y: ny });
  };

  // Subtle 3D tilt calculation
  const tiltX = viewMode === 'headset_xr' ? (mousePos.y - 0.5) * -3 : 0;
  const tiltY = viewMode === 'headset_xr' ? (mousePos.x - 0.5) * 4 : 0;

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative w-full min-h-screen bg-[#070913] text-gray-200 overflow-x-hidden font-sans select-none flex flex-col items-center justify-start pb-8"
      style={{
        backgroundColor: '#070913',
        minHeight: '100vh',
      }}
    >
      {/* 1. OPTIONAL VR / MR ENVIRONMENT BACKDROP (Active only in Simulated XR Mode) */}
      {viewMode === 'headset_xr' && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Deep Starry Cosmos */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f172a] via-[#080d1a] to-[#03060d]"></div>
          
          {/* Constellation Points */}
          <div className="absolute inset-0 bg-[radial-gradient(#00e5ff_1px,transparent_1px)] [background-size:48px_48px] opacity-20"></div>
          <div className="absolute inset-0 bg-[radial-gradient(#ffd700_1.5px,transparent_1.5px)] [background-size:96px_96px] opacity-25 animate-pulse"></div>

          {/* Luminous Volumetric Moon */}
          <div 
            className="absolute top-10 right-[15%] w-32 h-32 rounded-full bg-gradient-to-tr from-[#fff7d6] via-[#ffd700] to-[#fff] shadow-[0_0_80px_rgba(255,215,0,0.4),0_0_150px_rgba(0,229,255,0.2)] opacity-80 transition-transform duration-700 ease-out hidden md:flex items-center justify-center"
            style={{
              transform: `translate(${(mousePos.x - 0.5) * -15}px, ${(mousePos.y - 0.5) * -10}px)`,
            }}
          >
            <div className="w-full h-full rounded-full border border-yellow-200/40 relative overflow-hidden">
              <div className="absolute top-5 left-6 w-6 h-6 rounded-full bg-yellow-600/20 blur-[1px]"></div>
              <div className="absolute top-12 right-8 w-8 h-8 rounded-full bg-yellow-700/15 blur-[2px]"></div>
            </div>
          </div>

          {/* Horizon Silhouettes */}
          <div 
            className="absolute bottom-0 inset-x-0 h-[320px] transition-transform duration-500 ease-out hidden md:block"
            style={{
              transform: `translateX(${(mousePos.x - 0.5) * -20}px)`,
            }}
          >
            <svg className="absolute bottom-16 inset-x-0 w-full h-64 text-[#080d1a] opacity-80" viewBox="0 0 1440 320" preserveAspectRatio="none">
              <path fill="currentColor" d="M0,128L60,149.3C120,171,240,213,360,197.3C480,181,600,107,720,106.7C840,107,960,181,1080,202.7C1200,224,1320,192,1380,176L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
            </svg>
          </div>
        </div>
      )}

      {viewMode === 'passthrough_ar' && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-black/95">
          <div className="absolute inset-0 bg-[radial-gradient(#00e5ff_1px,transparent_1px)] [background-size:32px_32px] opacity-20"></div>
        </div>
      )}

      {/* 2. TOP XR COMPACT BAR & VIEW CONTROLLER */}
      <div className="relative z-30 w-full max-w-[440px] flex items-center justify-between px-3 py-1.5 bg-black/80 backdrop-blur-md border-b border-cyan-500/20 text-[10px] font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_#00e5ff]"></span>
          <span className="font-bold text-cyan-300 tracking-wider">META QUEST // LOFT HUD</span>
        </div>

        <div className="flex items-center gap-1 bg-gray-900/80 p-0.5 rounded-lg border border-cyan-500/30">
          <button
            id="view-mode-direct"
            onClick={() => setViewMode('direct_panel')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
              viewMode === 'direct_panel'
                ? 'bg-cyan-500 text-black shadow-[0_0_8px_rgba(0,229,255,0.6)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Panel
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
            XR Sim
          </button>
        </div>

        <button
          id="toggle-telemetry-btn"
          onClick={() => setShowDevTelemetry(!showDevTelemetry)}
          className={`px-2 py-0.5 rounded border text-[9px] font-bold transition-all ${
            showDevTelemetry
              ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300'
              : 'bg-black/40 border-gray-700 text-gray-400'
          }`}
          title="Toggle VR Metrics"
        >
          <Activity className="w-3 h-3 inline mr-0.5" />
          {showDevTelemetry ? 'ON' : 'METRICS'}
        </button>
      </div>

      {/* 3. DEVELOPER METRICS HUD OVERLAY */}
      {showDevTelemetry && (
        <div className="fixed top-12 left-4 z-40 bg-black/90 border border-emerald-500/60 p-2.5 rounded-lg font-mono text-[10px] text-emerald-400 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md space-y-1 select-none pointer-events-none">
          <div className="text-[9px] font-bold text-gray-400 border-b border-emerald-500/30 pb-0.5">
            COM.OCULUS.VRSHELL // 72.0 FPS
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-gray-400">APP PSS:</span>
            <span>412 MB</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-gray-400">CPU / GPU:</span>
            <span>28% / 44%</span>
          </div>
        </div>
      )}

      {/* 4. MAIN NARROW SIDE-SCREEN APPLET CHASSIS (Phone/Headset Form Factor) */}
      <div 
        className={`relative z-10 w-full max-w-[440px] px-2 sm:px-3 pt-2 flex flex-col flex-1 transition-all duration-200 ${
          viewMode === 'headset_xr' ? 'perspective-[1200px]' : ''
        }`}
      >
        <div 
          className="w-full flex-1 rounded-2xl sm:rounded-3xl border-2 border-cyan-500/50 shadow-[0_0_40px_rgba(0,229,255,0.2),0_15px_50px_rgba(0,0,0,0.9)] bg-[#0b0e1a] backdrop-blur-xl flex flex-col overflow-hidden"
          style={{
            transform: viewMode === 'headset_xr' ? `rotateX(${tiltX}deg) rotateY(${tiltY}deg)` : 'none',
          }}
        >
          {children}
        </div>
      </div>

      {/* 5. VIRTUAL META QUEST SYSTEM DOCK */}
      {viewMode === 'headset_xr' && (
        <div className="relative z-30 pt-4 flex justify-center pointer-events-auto">
          <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-black/85 border border-white/20 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] text-gray-300">
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
