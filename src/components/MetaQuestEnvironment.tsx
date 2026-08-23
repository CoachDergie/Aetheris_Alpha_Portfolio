import React, { useState, useEffect } from 'react';
import { EnvironmentViewMode } from '../types';
import { setNativeAnchorMode } from '../services/NativeXR';
import { 
  Activity, 
  Layers, 
  Sparkles,
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
  showDevTelemetry,
  setShowDevTelemetry,
}) => {
  return (
    <div
      className="relative w-full min-h-screen min-h-[100dvh] h-full bg-[#161B26] text-gray-200 font-sans select-none flex flex-col items-center justify-start overflow-x-hidden max-w-[100vw]"
      style={{
        backgroundColor: '#161B26',
        minHeight: '100dvh',
      }}
    >
      {/* 1. TOP COMPACT XR STATUS RIBBON */}
      <div className="w-full bg-[#131722] border-b border-[#263148] flex items-center justify-between px-2 sm:px-3 py-1 text-[9px] sm:text-[10px] font-mono select-none shrink-0 min-w-0">
        <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 truncate">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#00e5ff] shadow-[0_0_8px_#00e5ff] shrink-0"></span>
          <span className="font-bold text-[#00e5ff] tracking-wider truncate">HORIZON OS // OCCULT HUD</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <div className="hidden sm:flex items-center gap-1 bg-[#1A2130] p-0.5 rounded border border-[#2E3B57]">
             <button onClick={() => setNativeAnchorMode('room')} className="px-2 py-0.5 text-[9px] hover:bg-orange-500 hover:text-white rounded text-gray-400">ROOM</button>
             <button onClick={() => setNativeAnchorMode('loft')} className="px-2 py-0.5 text-[9px] hover:bg-cyan-500 hover:text-white rounded text-gray-400">LOFT</button>
             <button onClick={() => setNativeAnchorMode('celestial_zenith')} className="px-2 py-0.5 text-[9px] hover:bg-purple-500 hover:text-white rounded text-gray-400">ZENITH</button>
          </div>
          <button
            id="toggle-telemetry-btn"
            onClick={() => setShowDevTelemetry(!showDevTelemetry)}
            className={`px-1.5 sm:px-2 py-0.5 rounded border text-[8.5px] sm:text-[9px] font-bold transition-all ${
              showDevTelemetry
                ? 'bg-emerald-950 border-emerald-400 text-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.4)]'
                : 'bg-[#1A2130] border-[#2E3B57] text-gray-400 hover:text-white'
            }`}
            title="Toggle XR Performance Telemetry"
          >
            <Activity className="w-3 h-3 inline mr-0.5" />
            {showDevTelemetry ? 'FPS 72' : 'METRICS'}
          </button>
        </div>
      </div>

      {/* 2. DEVELOPER METRICS HUD OVERLAY */}
      {showDevTelemetry && (
        <div className="fixed top-8 left-2 z-50 bg-[#131722] border border-emerald-500/60 p-2 rounded-xl font-mono text-[9px] text-emerald-400 shadow-[0_4px_20px_rgba(0,0,0,0.8)] space-y-1 select-none pointer-events-none max-w-[90vw]">
          <div className="text-[8.5px] font-bold text-gray-400 border-b border-emerald-500/30 pb-0.5">
            COM.OCULUS.VRSHELL // 72.0 FPS
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-gray-400">SURFACE:</span>
            <span>#161B26 OPAQUE</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-gray-400">CANVAS DEPTH:</span>
            <span>24-BIT ARGB8888</span>
          </div>
        </div>
      )}

      {/* 3. MAIN XR SPATIAL CHASSIS */}
      {/* Edge-to-edge on thin viewports, cleanly centered on wider desktop/curved panels */}
      <div className="w-full flex-1 flex flex-col bg-[#161B26] items-center min-w-0 max-w-full">
        <div className="w-full max-w-2xl flex-1 flex flex-col bg-[#161B26] min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
};
