import React from 'react';
import { ViewTab } from '../types';
import { Sparkles, Mic, Eye, FileText, Share2, Search, ShieldCheck, Dumbbell, Compass, Flame } from 'lucide-react';

interface HeaderProps {
  currentTab: ViewTab;
  setTab: (tab: ViewTab) => void;
  passthroughActive: boolean;
  setPassthroughActive: (active: boolean) => void;
  isListening: boolean;
  toggleListening: () => void;
  onOpenDiscordShare: () => void;
  onOpenSearch: () => void;
  onExportPdf: () => void;
  isEncrypted: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setTab,
  passthroughActive,
  setPassthroughActive,
  isListening,
  toggleListening,
  onOpenDiscordShare,
  onOpenSearch,
  onExportPdf,
  isEncrypted,
}) => {
  return (
    <header className="relative z-20 flex flex-wrap justify-between items-center px-6 py-4 border-b border-white/10 backdrop-blur-md bg-black/60">
      {/* Brand & HUD Status Icon */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-orange-500 flex items-center justify-center shadow-[0_0_15px_rgba(255,69,0,0.5)] bg-black/40">
          <div className="w-2.5 h-2.5 bg-orange-400 rounded-full animate-pulse"></div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-light tracking-[0.25em] uppercase italic text-white">
              Aetheris <span className="font-bold text-orange-500">V.1</span>
            </h1>
            <span className="text-[9px] px-2 py-0.5 rounded bg-orange-950/80 border border-orange-700/60 text-orange-400 font-mono">
              OPENXR • QUEST
            </span>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-mono hidden sm:block">
            Esoteric Astrological Alignment & Martial Qi-Gong Telemetry
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-1 sm:gap-2 my-2 sm:my-0 bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md">
        <button
          id="nav-dashboard"
          onClick={() => setTab('dashboard')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
            currentTab === 'dashboard'
              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/50 shadow-[0_0_10px_rgba(255,69,0,0.3)]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span className="hidden md:inline">HUD Master</span>
        </button>

        <button
          id="nav-natal"
          onClick={() => setTab('natal')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
            currentTab === 'natal'
              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/50 shadow-[0_0_10px_rgba(255,69,0,0.3)]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Natal & Transits</span>
        </button>

        <button
          id="nav-combat"
          onClick={() => setTab('combat')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
            currentTab === 'combat'
              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/50 shadow-[0_0_10px_rgba(255,69,0,0.3)]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Punch Telemetry</span>
        </button>

        <button
          id="nav-qigong"
          onClick={() => setTab('qigong')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
            currentTab === 'qigong'
              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/50 shadow-[0_0_10px_rgba(255,69,0,0.3)]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Dumbbell className="w-3.5 h-3.5" />
          <span>6ft Zinc Qi-Gong</span>
        </button>
      </nav>

      {/* Quick Actions & Live Hardware Status */}
      <div className="flex items-center gap-3 text-[11px] uppercase tracking-widest text-gray-400">
        {/* Passthrough Toggle */}
        <button
          id="toggle-passthrough-btn"
          onClick={() => setPassthroughActive(!passthroughActive)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors ${
            passthroughActive
              ? 'bg-orange-950/60 border-orange-500 text-orange-300 shadow-[0_0_10px_rgba(255,69,0,0.3)]'
              : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
          }`}
          title="Toggle AR Camera Passthrough Overlay"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">{passthroughActive ? 'AR Passthrough: ON' : 'Passthrough: OFF'}</span>
        </button>

        {/* Voice Command Toggle */}
        <button
          id="toggle-voice-btn"
          onClick={toggleListening}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors ${
            isListening
              ? 'bg-red-950/80 border-red-500 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.4)] animate-pulse'
              : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
          }`}
          title="Toggle Voice Command Recognition"
        >
          <Mic className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">{isListening ? 'Voice: ACTIVE' : 'Voice: STANDBY'}</span>
        </button>

        {/* Reference Search */}
        <button
          id="open-search-btn"
          onClick={onOpenSearch}
          className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
          title="Index External Occult & Martial References"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Discord Share */}
        <button
          id="share-discord-btn"
          onClick={onOpenDiscordShare}
          className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-indigo-400 hover:text-indigo-300 transition-colors"
          title="Share Occult & Combat Dossier to Discord"
        >
          <Share2 className="w-4 h-4" />
        </button>

        {/* PDF Export */}
        <button
          id="export-pdf-header-btn"
          onClick={onExportPdf}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600/80 hover:bg-orange-500 text-white font-semibold transition-all shadow-[0_0_12px_rgba(255,69,0,0.4)]"
          title="Export High-Resolution Astrological & Martial PDF"
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">PDF Report</span>
        </button>

        {/* Encrypted Vault indicator */}
        <div className="hidden xl:flex items-center gap-1 text-[10px] text-gray-500 font-mono pl-2 border-l border-white/10">
          <ShieldCheck className={`w-3.5 h-3.5 ${isEncrypted ? 'text-emerald-400' : 'text-gray-500'}`} />
          <span>{isEncrypted ? 'AES-256' : 'VAULT'}</span>
        </div>
      </div>
    </header>
  );
};
