import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ViewTab } from '../types';
import { 
  LayoutGrid, 
  Sparkles, 
  Flame, 
  Dumbbell, 
  HeartHandshake, 
  Layers, 
  BookOpen, 
  FileText, 
  Share2, 
  Search, 
  MapPin,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface HeaderProps {
  currentTab: ViewTab;
  setTab: (tab: ViewTab) => void;
  lunarPhaseName: string;
  lunarIllumination: number;
  birthCity: string;
  birthDate: string;
  birthTime: string;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  onOpenCalibrate: () => void;
  onOpenDiscordShare: () => void;
  onOpenSearch: () => void;
  onExportPdf: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setTab,
  lunarPhaseName,
  lunarIllumination,
  birthCity,
  birthDate,
  birthTime,
  soundEnabled = true,
  onToggleSound,
  onOpenCalibrate,
  onOpenDiscordShare,
  onOpenSearch,
  onExportPdf,
}) => {
  const tabs: { id: ViewTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'HUD', icon: <LayoutGrid className="w-5 h-5" /> },
    { id: 'natal', label: 'NATAL', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'combat', label: 'COMBAT', icon: <Flame className="w-5 h-5" /> },
    { id: 'qigong', label: 'QI-GONG', icon: <Dumbbell className="w-5 h-5" /> },
    { id: 'meditations', label: 'MEDITATION', icon: <HeartHandshake className="w-5 h-5" /> },
    { id: 'tarot', label: 'TAROT', icon: <Layers className="w-5 h-5" /> },
    { id: 'occult', label: 'GRIMOIRE', icon: <BookOpen className="w-5 h-5" /> },
  ];

  const navContainerRef = useRef<HTMLDivElement | null>(null);
  const tabButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Drag-to-scroll state tracking
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  // Center selected tab helper function
  const centerTab = useCallback((tabId: ViewTab, smooth: boolean = true) => {
    const container = navContainerRef.current;
    const tabElement = tabButtonRefs.current[tabId];
    if (!container || !tabElement) return;

    const containerWidth = container.clientWidth;
    const tabOffsetLeft = tabElement.offsetLeft;
    const tabWidth = tabElement.offsetWidth;

    const targetScrollLeft = tabOffsetLeft - containerWidth / 2 + tabWidth / 2;

    container.scrollTo({
      left: Math.max(0, targetScrollLeft),
      behavior: smooth ? 'smooth' : 'auto',
    });
  }, []);

  // Center the active tab on mount and whenever currentTab changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      centerTab(currentTab, true);
    }, 50);
    return () => clearTimeout(timeout);
  }, [currentTab, centerTab]);

  // Mouse Drag handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!navContainerRef.current) return;
    setIsMouseDown(true);
    setHasDragged(false);
    setStartX(e.pageX - navContainerRef.current.offsetLeft);
    setScrollLeftState(navContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDown || !navContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - navContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;

    if (Math.abs(walk) > 4) {
      setHasDragged(true);
    }
    navContainerRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsMouseDown(false);
  };

  // Convert vertical wheel to horizontal side-scroll
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!navContainerRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      navContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  const handleTabClick = (tabId: ViewTab) => {
    if (hasDragged) {
      return;
    }
    setTab(tabId);
    centerTab(tabId, true);
  };

  return (
    <header className="px-3 sm:px-4 pt-3 pb-3 bg-gradient-to-b from-[#0e1424] to-[#0a0d1a] border-b border-cyan-500/30 rounded-t-2xl sm:rounded-t-3xl select-none w-full">
      {/* 1. Top Quick Action Bar (Search, Discord, PDF, Audio) */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/15 text-[10px] font-mono">
        <span className="text-cyan-400 font-bold tracking-widest flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          OPENXR HUD V1.0
        </span>

        <div className="flex items-center gap-1.5">
          <button
            id="header-search-btn"
            onClick={onOpenSearch}
            className="p-1.5 rounded-md bg-black/40 border border-cyan-500/30 text-gray-300 hover:text-cyan-300 hover:border-cyan-400 transition-colors"
            title="Search Grimoire"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
          <button
            id="header-discord-btn"
            onClick={onOpenDiscordShare}
            className="p-1.5 rounded-md bg-black/40 border border-indigo-500/30 text-indigo-400 hover:text-indigo-300 hover:border-indigo-400 transition-colors"
            title="Share Dossier"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button
            id="header-pdf-btn"
            onClick={onExportPdf}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black font-bold text-[10px] tracking-wider transition-all"
            title="Export Report PDF"
          >
            <FileText className="w-3 h-3" />
            <span>PDF</span>
          </button>
          {onToggleSound && (
            <button
              id="header-audio-btn"
              onClick={onToggleSound}
              className="p-1.5 rounded-md bg-black/40 border border-gray-700 text-gray-300 hover:text-cyan-300 transition-colors"
              title="Toggle Audio"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Headset Title & Lunar Status */}
      <div className="text-center space-y-1 mb-3">
        <h1 className="text-base sm:text-lg font-black tracking-[0.18em] uppercase text-[#00e5ff] drop-shadow-[0_0_12px_rgba(0,229,255,0.7)] flex items-center justify-center gap-2 font-mono">
          <span className="text-yellow-400">⚡</span>
          <span>AETHERIS // OCCULT CONSOLE</span>
        </h1>
        <p className="text-[11px] font-mono font-bold tracking-widest text-[#00e5ff] uppercase">
          LUNAR PHASE: {lunarPhaseName.toUpperCase()}
          <span className="text-gray-400 ml-1.5 font-normal">({lunarIllumination}%)</span>
        </p>
      </div>

      {/* 3. 7 Navigation Tabs matching Headset Screenshot (Icon Stacked on Label) */}
      <div className="relative group/nav mb-3">
        {/* Subtle Fade Edges */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-[#0c1020] to-transparent z-10 opacity-70"></div>
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-[#0c1020] to-transparent z-10 opacity-70"></div>

        <div
          ref={navContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onWheel={handleWheel}
          className={`flex items-center justify-between gap-1 sm:gap-1.5 overflow-x-auto py-1 px-1 no-scrollbar transition-all ${
            isMouseDown ? 'cursor-grabbing select-none' : 'cursor-grab'
          }`}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                ref={(el) => (tabButtonRefs.current[tab.id] = el)}
                id={`tab-btn-${tab.id}`}
                onClick={() => handleTabClick(tab.id)}
                className={`flex flex-col items-center justify-center p-1.5 sm:px-2.5 sm:py-2 rounded-xl text-[9px] sm:text-[10px] font-black tracking-wider uppercase font-mono transition-all shrink-0 min-w-[50px] sm:min-w-[56px] ${
                  isActive
                    ? 'bg-cyan-950/90 text-[#00e5ff] border-2 border-[#00e5ff] shadow-[0_0_15px_rgba(0,229,255,0.5)] scale-105'
                    : 'bg-black/30 text-gray-400 hover:text-white border border-gray-800/80 hover:border-cyan-500/40 hover:bg-black/50'
                }`}
              >
                <span className={`mb-1 ${isActive ? 'text-[#00e5ff]' : 'text-gray-400'}`}>
                  {tab.icon}
                </span>
                <span className="leading-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. CALIBRATE ORIGIN BUTTON (Matching the sleek cyan pill in the Headset screenshot) */}
      <div className="w-full bg-[#0a0f1d] border border-cyan-500/40 rounded-xl p-2 flex items-center justify-between gap-2 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-2 pl-1">
          <MapPin className="w-4 h-4 text-[#00e5ff] shrink-0" />
          <span className="text-[10px] font-mono font-bold text-gray-300 hidden xs:inline truncate">
            {birthCity.toUpperCase()} ({birthDate})
          </span>
        </div>

        <button
          id="calibrate-origin-ribbon-btn"
          onClick={onOpenCalibrate}
          className="flex-1 xs:flex-initial text-center px-4 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-[#00e5ff] text-[#00e5ff] hover:text-white font-mono text-xs font-black tracking-widest uppercase transition-all shadow-[0_0_12px_rgba(0,229,255,0.3)]"
        >
          CALIBRATE ORIGIN
        </button>
      </div>
    </header>
  );
};
