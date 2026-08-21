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
  Cast, 
  Sliders, 
  Maximize2, 
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
  const [reticlePos, setReticlePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
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
    setReticlePos({ x: clientX, y: clientY });
  };

  // 3D Parallax tilt calculation based on cursor in headset mode
  const tiltX = viewMode === 'headset_xr' ? (mousePos.y - 0.5) * -4 : 0;
  const tiltY = viewMode === 'headset_xr' ? (mousePos.x - 0.5) * 6 : 0;

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative w-full min-h-screen bg-[#070913] text-gray-200 overflow-x-hidden font-sans select-none flex flex-col justify-between"
    >
      {/* 1. VR / MR ENVIRONMENT BACKDROP */}
      {viewMode === 'headset_xr' && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Deep Starry Cosmos */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f172a] via-[#080d1a] to-[#03060d]"></div>
          
          {/* Stars & Constellation Points */}
          <div className="absolute inset-0 bg-[radial-gradient(#00e5ff_1px,transparent_1px)] [background-size:48px_48px] opacity-20"></div>
          <div className="absolute inset-0 bg-[radial-gradient(#ffd700_1.5px,transparent_1.5px)] [background-size:96px_96px] opacity-25 animate-pulse"></div>

          {/* Luminous Volumetric Moon */}
          <div 
            className="absolute top-10 right-[15%] w-36 h-36 rounded-full bg-gradient-to-tr from-[#fff7d6] via-[#ffd700] to-[#fff] shadow-[0_0_100px_rgba(255,215,0,0.45),0_0_200px_rgba(0,229,255,0.2)] opacity-85 transition-transform duration-700 ease-out flex items-center justify-center"
            style={{
              transform: `translate(${(mousePos.x - 0.5) * -20}px, ${(mousePos.y - 0.5) * -15}px)`,
            }}
          >
            {/* Moon craters texture overlay */}
            <div className="w-full h-full rounded-full border border-yellow-200/40 relative overflow-hidden">
              <div className="absolute top-6 left-8 w-8 h-8 rounded-full bg-yellow-600/20 blur-[1px]"></div>
              <div className="absolute top-16 right-10 w-12 h-12 rounded-full bg-yellow-700/15 blur-[2px]"></div>
              <div className="absolute bottom-6 left-12 w-10 h-10 rounded-full bg-yellow-800/20 blur-[1px]"></div>
            </div>
          </div>

          {/* Distant 3D Mountain Horizon Silhouettes */}
          <div 
            className="absolute bottom-0 inset-x-0 h-[420px] transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(${(mousePos.x - 0.5) * -30}px) translateY(${(mousePos.y - 0.5) * 10}px)`,
            }}
          >
            {/* Far Mountain Ridge */}
            <svg className="absolute bottom-28 inset-x-0 w-full h-64 text-[#0d1527] opacity-60" viewBox="0 0 1440 320" preserveAspectRatio="none">
              <path fill="currentColor" d="M0,192L80,181.3C160,171,320,149,480,170.7C640,192,800,256,960,245.3C1120,235,1280,149,1360,106.7L1440,64L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
            </svg>

            {/* Near Mountain Ridge with Bioluminescent Glow */}
            <svg className="absolute bottom-16 inset-x-0 w-full h-72 text-[#080d1a] opacity-90 drop-shadow-[0_-5px_15px_rgba(0,229,255,0.15)]" viewBox="0 0 1440 320" preserveAspectRatio="none">
              <path fill="currentColor" d="M0,128L60,149.3C120,171,240,213,360,197.3C480,181,600,107,720,106.7C840,107,960,181,1080,202.7C1200,224,1320,192,1380,176L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
            </svg>
          </div>

          {/* Cyber-Zen Terrace Floor with Grid & Bioluminescent Arc */}
          <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-[#050811] via-[#091024]/90 to-transparent">
            {/* Concentric Spatial Deck Grid */}
            <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_60%_80%_at_50%_100%,#000_70%,transparent_100%)] opacity-35 bg-[linear-gradient(to_right,#00e5ff15_1px,transparent_1px),linear-gradient(to_bottom,#00e5ff15_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
            {/* Glowing Terrace Rim Arc */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1200px] h-32 rounded-[100%] border-t-2 border-[#00e5ff]/40 shadow-[0_-15px_40px_rgba(0,229,255,0.25)]"></div>
          </div>
        </div>
      )}

      {viewMode === 'passthrough_ar' && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-black/90">
          {/* Simulated Real World Passthrough Room Wireframe */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b1020]/90 via-[#070b16]/80 to-[#020408]/95 flex items-center justify-center">
            <div className="text-center font-mono space-y-2 opacity-80">
              <div className="w-20 h-20 mx-auto rounded-full border border-cyan-400/50 animate-ping"></div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
                Quest 3 Passthrough Active
              </p>
              <p className="text-xs text-gray-400">
                Spatial Anchor: [ROOM_BOUNDS_FLOATING_HUD] • Hand Raycast Active
              </p>
            </div>
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(#00e5ff_1px,transparent_1px)] [background-size:32px_32px] opacity-20"></div>
        </div>
      )}

      {/* 2. TOP XR ENVIRONMENT BAR & VIEW MODE CONTROLLER */}
      <div className="relative z-30 flex items-center justify-between px-6 py-2.5 bg-black/70 backdrop-blur-md border-b border-cyan-500/20 text-xs font-mono">
        {/* Left: Quest System Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-cyan-950/60 border border-cyan-500/40 text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00e5ff]"></span>
            <span className="font-bold tracking-wider">META QUEST 3 • SPATIAL HUD</span>
          </div>
          <span className="text-gray-400 hidden sm:inline">
            OPENXR HOME // {lunarPhaseName.toUpperCase()}
          </span>
        </div>

        {/* Center: Environment View Mode Switcher */}
        <div className="flex items-center bg-gray-900/80 p-1 rounded-lg border border-cyan-500/30">
          <button
            id="view-mode-headset"
            onClick={() => setViewMode('headset_xr')}
            className={`px-3 py-1 rounded text-[11px] font-bold transition-all ${
              viewMode === 'headset_xr'
                ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(0,229,255,0.6)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🥽 Headset XR Sim
          </button>
          <button
            id="view-mode-direct"
            onClick={() => setViewMode('direct_panel')}
            className={`px-3 py-1 rounded text-[11px] font-bold transition-all ${
              viewMode === 'direct_panel'
                ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(0,229,255,0.6)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🖥️ Direct Panel
          </button>
          <button
            id="view-mode-passthrough"
            onClick={() => setViewMode('passthrough_ar')}
            className={`px-3 py-1 rounded text-[11px] font-bold transition-all ${
              viewMode === 'passthrough_ar'
                ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(0,229,255,0.6)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📷 Passthrough AR
          </button>
        </div>

        {/* Right: Telemetry & Audio Toggles */}
        <div className="flex items-center gap-2">
          <button
            id="toggle-telemetry-btn"
            onClick={() => setShowDevTelemetry(!showDevTelemetry)}
            className={`px-2.5 py-1 rounded border text-[10px] font-bold tracking-wider transition-all ${
              showDevTelemetry
                ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.3)]'
                : 'bg-black/40 border-gray-700 text-gray-400 hover:text-white'
            }`}
            title="Toggle Quest Shell Developer Telemetry HUD"
          >
            <Activity className="w-3 h-3 inline mr-1" />
            VRSHELL HUD: {showDevTelemetry ? 'ON' : 'OFF'}
          </button>

          <button
            id="toggle-audio-btn"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded border border-gray-700 bg-black/40 text-gray-300 hover:text-white hover:border-cyan-400 transition-colors"
            title="Toggle Spatial Sound FX"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 3. DEVELOPER METRICS HUD OVERLAY (Matching com.oculus.vrshell screenshot) */}
      {showDevTelemetry && (
        <div className="fixed top-14 left-6 z-40 bg-black/85 border border-emerald-500/60 p-3 rounded-lg font-mono text-[11px] text-emerald-400 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md space-y-1 select-none pointer-events-none">
          <div className="text-[10px] font-bold text-gray-400 border-b border-emerald-500/30 pb-1">
            COM.OCULUS.VRSHELL // REALTIME METRICS
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-300">FPS:</span>
            <span className="font-bold text-white">72.0 / 90.0</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-300">APP PSS:</span>
            <span>412 MB</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-300">CPU LOAD:</span>
            <span>28% (F: 1.8 GHz)</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-300">GPU LOAD:</span>
            <span>44% (DIRECT RENDER)</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-300">OPENXR LAYER:</span>
            <span className="text-cyan-300">AETHERIS_HUD_V1</span>
          </div>
        </div>
      )}

      {/* 4. MAIN SPATIAL HUD PANEL (With 3D perspective and holographic curved chassis) */}
      <div 
        className={`relative z-10 flex-1 flex flex-col items-center justify-center p-3 sm:p-6 transition-all duration-300 ${
          viewMode === 'headset_xr' ? 'perspective-[1200px]' : ''
        }`}
      >
        <div 
          className={`w-full max-w-xl sm:max-w-2xl transition-transform duration-200 ease-out ${
            viewMode === 'headset_xr'
              ? 'rounded-3xl border border-cyan-400/50 shadow-[0_0_50px_rgba(0,229,255,0.2),0_20px_60px_rgba(0,0,0,0.9)] bg-[#0f1422]/90 backdrop-blur-xl'
              : 'rounded-2xl border border-cyan-500/30 bg-[#0f1422]/95'
          }`}
          style={{
            transform: viewMode === 'headset_xr' ? `rotateX(${tiltX}deg) rotateY(${tiltY}deg)` : 'none',
          }}
        >
          {children}
        </div>
      </div>

      {/* 5. VIRTUAL META QUEST SYSTEM DOCK (At Bottom) */}
      {viewMode === 'headset_xr' && (
        <div className="relative z-30 pb-4 flex justify-center pointer-events-auto">
          <div className="flex items-center gap-4 px-6 py-2.5 rounded-full bg-black/80 border border-white/20 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(0,229,255,0.15)] text-gray-300">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-white pr-3 border-r border-white/20">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{currentTime}</span>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2 rounded-full hover:bg-white/10 hover:text-cyan-300 transition-colors" title="Home">
                <Compass className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-full hover:bg-white/10 hover:text-cyan-300 transition-colors" title="Library">
                <Layers className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-full hover:bg-white/10 hover:text-cyan-300 transition-colors" title="Camera Passthrough">
                <Camera className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-full hover:bg-white/10 hover:text-cyan-300 transition-colors" title="Microphone">
                <Mic className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-full hover:bg-white/10 hover:text-cyan-300 transition-colors" title="Settings">
                <Sliders className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 pl-3 border-l border-white/20 font-mono text-xs">
              <div className="flex items-center gap-1 text-emerald-400">
                <Wifi className="w-3.5 h-3.5" />
                <span className="text-[10px]">5G</span>
              </div>
              <div className="flex items-center gap-1 text-cyan-300">
                <Battery className="w-3.5 h-3.5" />
                <span className="text-[10px]">94%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
