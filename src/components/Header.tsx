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

import { FEATURES } from '../config/features';

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
  let tabs: { id: ViewTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'HUD', icon: <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
    { id: 'natal', label: 'NATAL', icon: <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
    { id: 'combat', label: 'COMBAT', icon: <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
    { id: 'qigong', label: 'TRAINING', icon: <Dumbbell className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
    { id: 'meditations', label: 'MEDITATION', icon: <HeartHandshake className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
    { id: 'tarot', label: 'TAROT', icon: <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
    { id: 'occult', label: 'JOURNAL', icon: <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
  ];

  if (!FEATURES.ENABLE_NATAL_TAB) {
    tabs = tabs.filter(tab => tab.id !== 'natal');
  }
  if (!FEATURES.ENABLE_COMBAT_TAB) {
    tabs = tabs.filter(tab => tab.id !== 'combat');
  }
  if (!FEATURES.ENABLE_TRAINING_TAB) {
    tabs = tabs.filter(tab => tab.id !== 'qigong');
  }
  if (!FEATURES.ENABLE_MEDITATION_TAB) {
    tabs = tabs.filter(tab => tab.id !== 'meditations');
  }
  if (!FEATURES.ENABLE_TAROT_TAB) {
    tabs = tabs.filter(tab => tab.id !== 'tarot');
  }
  if (!FEATURES.ENABLE_JOURNAL_TAB) {
    tabs = tabs.filter(tab => tab.id !== 'occult');
  }

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
    <header className="px-2 sm:px-4 pt-2.5 pb-2.5 bg-[#1A2130] border-b border-[#263148] select-none w-full min-w-0 max-w-full overflow-hidden">
      {/* 1. Top Quick Action Bar (Search, Discord, PDF, Audio) */}
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#263148] text-[9px] sm:text-[10px] font-mono min-w-0">
        <span className="text-[#00e5ff] font-bold tracking-widest flex items-center gap-1 sm:gap-1.5 truncate">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#00e5ff] animate-pulse shrink-0"></span>
          <span className="truncate">SPATIAL CONSOLE</span>
        </span>

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            id="header-search-btn"
            onClick={onOpenSearch}
            className="p-1 sm:p-1.5 rounded-md bg-[#161B26] border border-[#2E3B57] text-gray-300 hover:text-cyan-300 hover:border-cyan-400 transition-colors"
            title="Search Journal"
          >
            <Search className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
          <button
            id="header-discord-btn"
            onClick={onOpenDiscordShare}
            className="p-1 sm:p-1.5 rounded-md bg-[#161B26] border border-[#3E4A6B] text-indigo-400 hover:text-indigo-300 hover:border-indigo-400 transition-colors"
            title="Share Dossier"
          >
            <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
          <button
            id="header-pdf-btn"
            onClick={onExportPdf}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black font-bold text-[9px] sm:text-[10px] tracking-wider transition-all shadow-[0_0_10px_rgba(255,215,0,0.3)]"
            title="Export Report PDF"
          >
            <FileText className="w-3 h-3" />
            <span>PDF</span>
          </button>
          {onToggleSound && (
            <button
              id="header-audio-btn"
              onClick={onToggleSound}
              className="p-1 sm:p-1.5 rounded-md bg-[#161B26] border border-[#2E3B57] text-gray-300 hover:text-cyan-300 transition-colors"
              title="Toggle Audio"
            >
              {soundEnabled ? <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#00e5ff]" /> : <VolumeX className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Headset Title & Lunar Status with Fluid Responsive Clamp Typography */}
      <div className="text-center space-y-0.5 mb-2 px-1 min-w-0 w-full">
        <img
          src="file:///android_res/drawable/ic_launcher_foreground.png"
          alt="Aetheris"
          className="mx-auto mb-1 w-8 h-8 sm:w-10 sm:h-10 object-contain"
        />
        <h1 className="text-[clamp(12px,3.8vw,18px)] font-black tracking-wider uppercase text-[#00e5ff] drop-shadow-[0_0_12px_rgba(0,229,255,0.6)] flex items-center justify-center font-mono truncate w-full">
          <span className="truncate">AETHERIS</span>
        </h1>
        <p className="text-[clamp(8.5px,2.4vw,11px)] font-mono font-bold tracking-wider text-[#00e5ff] uppercase truncate w-full">
          LUNAR PHASE: {lunarPhaseName.toUpperCase()}
          <span className="text-gray-400 ml-1 font-normal">({lunarIllumination}%)</span>
        </p>
      </div>

      {/* 3. 7 Navigation Tabs with Fluid Scaling (Zero Horizontal Clipping) */}
      <div className="relative w-full mb-2 min-w-0 group/nav">
        <div
          ref={navContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onWheel={handleWheel}
          className={`w-full flex items-center justify-between gap-1 overflow-x-auto py-1 px-0.5 no-scrollbar transition-all min-w-0 ${
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
                className={`flex flex-col items-center justify-center py-1 sm:py-1.5 px-0.5 sm:px-1.5 rounded-lg sm:rounded-xl text-[clamp(7px,1.9vw,9.5px)] font-black tracking-tight sm:tracking-wider uppercase font-mono transition-all flex-1 min-w-[32px] sm:min-w-[46px] shrink-0 ${
                  isActive
                    ? 'bg-[#122238] text-[#00e5ff] border-2 border-[#00e5ff] shadow-[0_0_12px_rgba(0,229,255,0.4)] scale-[1.03]'
                    : 'bg-[#161B26] text-gray-400 hover:text-white border border-[#2E3B57] hover:border-cyan-500/40 hover:bg-[#1E2638]'
                }`}
              >
                <span className={`mb-0.5 ${isActive ? 'text-[#00e5ff]' : 'text-gray-400'}`}>
                  {tab.icon}
                </span>
                <span className="leading-none truncate w-full text-center">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. CALIBRATE ORIGIN BAR (Dynamic min/max scaling for phone and narrow viewports) */}
      <div 
        id="calibrate-origin-bar-container"
        className="w-full bg-[#161B26] border border-[#2E3B57] hover:border-cyan-500/50 rounded-xl p-1.5 sm:p-2 flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-1.5 sm:gap-2 shadow-[0_2px_10px_rgba(0,0,0,0.4)] transition-all min-w-0"
      >
        <div className="flex items-center gap-1.5 sm:gap-2 pl-1 min-w-0 overflow-hidden">
          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00e5ff] shrink-0" />
          <div className="flex items-center gap-1 text-[clamp(9px,2.4vw,11px)] font-mono font-bold text-gray-300 truncate min-w-0">
            <span className="text-white uppercase truncate">{birthCity}</span>
            <span className="text-gray-500 shrink-0">({birthDate})</span>
          </div>
        </div>

        <button
          id="calibrate-origin-ribbon-btn"
          onClick={onOpenCalibrate}
          className="w-full xs:w-auto px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg bg-[#122238] hover:bg-[#172D4A] border border-[#00e5ff] text-[#00e5ff] hover:text-white font-mono text-[clamp(9.5px,2.6vw,12px)] font-black tracking-widest uppercase transition-all shadow-[0_0_12px_rgba(0,229,255,0.25)] flex items-center justify-center gap-1.5 shrink-0"
        >
          <span>CALIBRATE ORIGIN</span>
        </button>
      </div>
    </header>
  );
};
