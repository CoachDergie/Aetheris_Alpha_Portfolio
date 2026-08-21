import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ViewTab } from '../types';
import { 
  Compass, 
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
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface HeaderProps {
  currentTab: ViewTab;
  setTab: (tab: ViewTab) => void;
  lunarPhaseName: string;
  lunarIllumination: number;
  birthCity: string;
  birthDate: string;
  birthTime: string;
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
  onOpenCalibrate,
  onOpenDiscordShare,
  onOpenSearch,
  onExportPdf,
}) => {
  const tabs: { id: ViewTab; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'dashboard', label: 'HUD', icon: <Compass className="w-4 h-4" />, color: '#00e5ff' },
    { id: 'natal', label: 'NATAL', icon: <Sparkles className="w-4 h-4" />, color: '#ffd700' },
    { id: 'combat', label: 'COMBAT', icon: <Flame className="w-4 h-4" />, color: '#00e5ff' },
    { id: 'qigong', label: 'QI-GONG', icon: <Dumbbell className="w-4 h-4" />, color: '#ffd700' },
    { id: 'meditations', label: 'MEDITATION', icon: <HeartHandshake className="w-4 h-4" />, color: '#34d399' },
    { id: 'tarot', label: 'TAROT', icon: <Layers className="w-4 h-4" />, color: '#a855f7' },
    { id: 'occult', label: 'GRIMOIRE', icon: <BookOpen className="w-4 h-4" />, color: '#00e5ff' },
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
    // Slight delay to ensure DOM dimensions are computed
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
    const walk = (x - startX) * 1.5; // Drag sensitivity multiplier

    if (Math.abs(walk) > 4) {
      setHasDragged(true);
    }
    navContainerRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsMouseDown(false);
  };

  // Convert vertical wheel to horizontal side-scroll seamlessly
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!navContainerRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      navContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  const handleTabClick = (tabId: ViewTab) => {
    if (hasDragged) {
      // If user was dragging across, do not register a click toggle
      return;
    }
    setTab(tabId);
    centerTab(tabId, true);
  };

  return (
    <header className="px-4 sm:px-6 pt-5 pb-4 border-b border-cyan-500/20 bg-black/40 rounded-t-3xl select-none">
      {/* 1. Main Headset Title & Lunar Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black tracking-[0.25em] uppercase text-[#00e5ff] drop-shadow-[0_0_12px_rgba(0,229,255,0.7)]">
              ⚡ AETHERIS // OCCULT CONSOLE
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-cyan-950/80 border border-cyan-400/50 text-cyan-300">
              OPENXR V1.0.32
            </span>
          </div>
          <p className="text-xs font-mono font-bold tracking-widest text-[#ffd700] drop-shadow-[0_0_8px_rgba(255,215,0,0.5)] mt-1 flex items-center gap-2">
            <span>LUNAR PHASE: {lunarPhaseName.toUpperCase()}</span>
            <span className="text-gray-400 font-normal">({lunarIllumination}% ILLUMINATION)</span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            id="header-search-btn"
            onClick={onOpenSearch}
            className="p-2 rounded-lg bg-black/40 border border-cyan-500/30 text-gray-300 hover:text-cyan-300 hover:border-cyan-400 transition-colors"
            title="Search Occult & Martial Reference"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            id="header-discord-btn"
            onClick={onOpenDiscordShare}
            className="p-2 rounded-lg bg-black/40 border border-indigo-500/30 text-indigo-400 hover:text-indigo-300 hover:border-indigo-400 transition-colors"
            title="Share Dossier to Discord"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            id="header-pdf-btn"
            onClick={onExportPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black font-bold text-xs tracking-wider transition-all shadow-[0_0_15px_rgba(255,215,0,0.4)]"
            title="Export Astrological & Martial Report PDF"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>EXPORT PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Contextual Side-Scroll Navigation with Click-and-Drag and Center-Selected (No Scrollbar) */}
      <div className="relative group/nav">
        {/* Subtle Side Fade Edges indicating continuous drag capability */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#0c1020] to-transparent z-10 opacity-70"></div>
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#0c1020] to-transparent z-10 opacity-70"></div>

        <div
          ref={navContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onWheel={handleWheel}
          className={`flex items-center gap-2 overflow-x-auto py-2 px-6 no-scrollbar transition-all ${
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
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase font-mono transition-all shrink-0 whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-950/90 text-[#00e5ff] border border-[#00e5ff] shadow-[0_0_15px_rgba(0,229,255,0.4)] scale-105'
                    : 'bg-black/40 text-gray-400 hover:text-white border border-gray-800/80 hover:border-cyan-500/40 hover:bg-black/60'
                }`}
              >
                <span className={isActive ? 'text-[#00e5ff]' : 'text-gray-400'}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. CALIBRATE ORIGIN RIBBON matching Headset */}
      <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-black/60 border border-cyan-500/30">
        <div className="flex items-center gap-2 text-xs font-mono">
          <MapPin className="w-4 h-4 text-[#00e5ff]" />
          <span className="font-extrabold text-white tracking-wider">
            {birthCity.toUpperCase()} // {birthDate} // {birthTime} UTC
          </span>
        </div>

        <button
          id="calibrate-origin-ribbon-btn"
          onClick={onOpenCalibrate}
          className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 border border-[#00e5ff] text-[#00e5ff] hover:text-white font-mono text-xs font-black tracking-widest uppercase transition-all shadow-[0_0_10px_rgba(0,229,255,0.25)]"
        >
          [ 📍 CALIBRATE ORIGIN ]
        </button>
      </div>
    </header>
  );
};
