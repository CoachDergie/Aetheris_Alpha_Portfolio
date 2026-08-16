/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  NatalData,
  CelestialBody,
  PlanetaryAspect,
  LunarPhaseInfo,
  PunchTelemetry,
  QiGongBarbellSession,
  DiscoveredIncantation,
  ViewTab,
} from './types';
import { calculateNatalChart, calculateLunarPhase } from './utils/astronomy';
import { INITIAL_GRIMOIRE_LIBRARY, synthesizeDiscoveryFromQuery } from './utils/incantationDiscovery';
import { generatePunchTelemetry, soundEffects } from './utils/telemetry';
import { saveToEncryptedVault, loadFromEncryptedVault } from './utils/crypto';
import { generateAstrologyPdfReport } from './utils/pdfExport';
import { Header } from './components/Header';
import { PassthroughBackground } from './components/PassthroughBackground';
import { CelestialOrbitalMandala } from './components/CelestialOrbitalMandala';
import { NatalChartPanel } from './components/NatalChartPanel';
import { CombatTelemetryPanel } from './components/CombatTelemetryPanel';
import { QiGongBarbellPanel } from './components/QiGongBarbellPanel';
import { GrimoireLibraryModal } from './components/GrimoireLibraryModal';
import { VoiceCommandController } from './components/VoiceCommandController';
import { DiscordShareModal } from './components/DiscordShareModal';
import { SearchReferenceModal } from './components/SearchReferenceModal';
import confetti from 'canvas-confetti';

const DEFAULT_NATAL: NatalData = {
  birthDate: '1996-10-31',
  birthTime: '03:33',
  birthCity: 'Alexandria',
  birthCountry: 'Occult Coordinates',
  latitude: 31.2001,
  longitude: 29.9187,
};

const DEFAULT_BARBELL_SESSION: QiGongBarbellSession = {
  userBodyWeightKg: 82,
  barbellWeightKg: 20,
  barbellLengthFt: 6,
  durationMinutes: 25,
  movementName: 'Six-Foot Barbell Horse Stance Press (Ma Bu Tui)',
  sets: 5,
  reps: 12,
  estimatedKcal: 198,
  associatedPlanetaryHour: 'Mars / Golachab',
  focusStance: 'Ma Bu (Heavy Rooted Horse Stance)',
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  const [passthroughActive, setPassthroughActive] = useState<boolean>(false);
  const [anchorMode, setAnchorMode] = useState<'loft' | 'room' | 'celestial_zenith'>('loft');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isDiscordModalOpen, setIsDiscordModalOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [isGrimoireModalOpen, setIsGrimoireModalOpen] = useState<boolean>(false);
  const [isEncrypted, setIsEncrypted] = useState<boolean>(true);

  // User Natal & Telemetry State
  const [natal, setNatal] = useState<NatalData>(DEFAULT_NATAL);
  const [session, setSession] = useState<QiGongBarbellSession>(DEFAULT_BARBELL_SESSION);
  const [grimoire, setGrimoire] = useState<DiscoveredIncantation[]>(INITIAL_GRIMOIRE_LIBRARY);
  const [activeDailyInvocation, setActiveDailyInvocation] = useState<DiscoveredIncantation>(INITIAL_GRIMOIRE_LIBRARY[0]);
  const [punches, setPunches] = useState<PunchTelemetry[]>([
    {
      id: 'p_init_1',
      timestamp: Date.now() - 5000,
      type: 'Lead Jab',
      speedMs: 7.4,
      anglePitchDeg: 12.0,
      angleYawDeg: 2.1,
      returnTimeSec: 0.32,
      impactForceJoules: 43.8,
      energyKcal: 0.28,
    },
    {
      id: 'p_init_2',
      timestamp: Date.now() - 12000,
      type: 'Cross Strike',
      speedMs: 9.8,
      anglePitchDeg: 14.5,
      angleYawDeg: -1.2,
      returnTimeSec: 0.28,
      impactForceJoules: 76.8,
      energyKcal: 0.35,
    },
  ]);

  // Load from local encrypted storage on mount
  useEffect(() => {
    loadFromEncryptedVault<{
      natal: NatalData;
      session: QiGongBarbellSession;
      punches: PunchTelemetry[];
      grimoire: DiscoveredIncantation[];
      activeDailyInvocation: DiscoveredIncantation;
    }>().then((vaultData) => {
      if (vaultData) {
        if (vaultData.natal) setNatal(vaultData.natal);
        if (vaultData.session) setSession(vaultData.session);
        if (vaultData.punches && vaultData.punches.length > 0) setPunches(vaultData.punches);
        if (vaultData.grimoire && vaultData.grimoire.length > 0) setGrimoire(vaultData.grimoire);
        if (vaultData.activeDailyInvocation) setActiveDailyInvocation(vaultData.activeDailyInvocation);
      }
    });
  }, []);

  // Save to encrypted vault on state update
  useEffect(() => {
    const timer = setTimeout(() => {
      saveToEncryptedVault({ natal, session, punches, grimoire, activeDailyInvocation });
    }, 1000);
    return () => clearTimeout(timer);
  }, [natal, session, punches, grimoire, activeDailyInvocation]);

  // Calculate live astronomy, lunar vectors, and transits
  const lunar = useMemo(() => calculateLunarPhase(new Date()), []);

  const { bodies, aspects, ascendant, midheaven } = useMemo(() => {
    return calculateNatalChart(natal.birthDate, natal.birthTime, natal.latitude, natal.longitude);
  }, [natal]);

  // PDF Export trigger with visual celebratory fireworks
  const handleExportPdf = useCallback(() => {
    soundEffects.playHolographicChime(880);
    generateAstrologyPdfReport(
      natal,
      bodies,
      aspects,
      lunar,
      ascendant,
      midheaven,
      punches,
      session,
      activeDailyInvocation
    );

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#ff4500', '#9333ea', '#ffffff', '#fb923c'],
    });
  }, [natal, bodies, aspects, lunar, ascendant, midheaven, punches, session, activeDailyInvocation]);

  // Discover new formula from planetary transits or queries
  const handleDiscoverNewIncantation = useCallback((promptQuery?: string) => {
    const queryToUse = promptQuery || `${bodies[0]?.name || 'Sun'} in ${bodies[0]?.sign || 'Scorpio'} ${aspects[0]?.aspectType || 'Square'}`;
    const newInc = synthesizeDiscoveryFromQuery(queryToUse);
    setGrimoire((prev) => [newInc, ...prev]);
    setActiveDailyInvocation(newInc);
    soundEffects.playHolographicChime(963);

    confetti({
      particleCount: 40,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#a855f7', '#ff4500', '#3b82f6'],
    });
  }, [bodies, aspects]);

  const handleAddDirectToGrimoire = useCallback((newInc: DiscoveredIncantation) => {
    setGrimoire((prev) => {
      if (prev.some((item) => item.id === newInc.id)) return prev;
      return [newInc, ...prev];
    });
    setActiveDailyInvocation(newInc);
  }, []);

  const handleSigilToGrimoire = useCallback((sigilName: string, formula: string) => {
    handleDiscoverNewIncantation(`${sigilName} ${formula}`);
  }, [handleDiscoverNewIncantation]);

  // Handle voice commands from speech recognition
  const handleVoiceCommand = useCallback(
    (cmd: string) => {
      if (cmd === 'punch') {
        const newPunch = generatePunchTelemetry('Lead Jab', 1.0);
        soundEffects.playPunchSwoosh(newPunch.speedMs);
        setPunches((prev) => [newPunch, ...prev.slice(0, 19)]);
      } else if (cmd === 'toggle_passthrough') {
        setPassthroughActive((prev) => !prev);
      } else if (cmd === 'export_pdf') {
        handleExportPdf();
      } else if (cmd === 'nav_natal') {
        setCurrentTab('natal');
      } else if (cmd === 'nav_combat') {
        setCurrentTab('combat');
      } else if (cmd === 'nav_qigong') {
        setCurrentTab('qigong');
      } else if (cmd === 'share_discord') {
        setIsDiscordModalOpen(true);
      } else if (cmd === 'open_grimoire') {
        setIsGrimoireModalOpen(true);
      } else if (cmd === 'discover_formula') {
        handleDiscoverNewIncantation();
      } else if (cmd === 'chant_invocation') {
        if ('speechSynthesis' in window) {
          const utter = new SpeechSynthesisUtterance(
            `${activeDailyInvocation.barbarousFormula}. ${activeDailyInvocation.invocationText}`
          );
          utter.rate = 0.85;
          window.speechSynthesis.speak(utter);
        }
      }
    },
    [handleExportPdf, activeDailyInvocation, handleDiscoverNewIncantation]
  );

  return (
    <div className="w-full min-h-screen bg-black text-gray-200 font-sans relative flex flex-col justify-between overflow-x-hidden selection:bg-orange-500 selection:text-black">
      {/* 1. Spatial Passthrough & Immersive Backdrop (Theme Design) */}
      <PassthroughBackground
        passthroughActive={passthroughActive}
        anchorType={anchorMode}
        handTrackingSimActive={true}
      />

      {/* 2. Top HUD Navigation & Status Bar */}
      <Header
        currentTab={currentTab}
        setTab={setCurrentTab}
        passthroughActive={passthroughActive}
        setPassthroughActive={setPassthroughActive}
        isListening={isListening}
        toggleListening={() => setIsListening(!isListening)}
        onOpenDiscordShare={() => setIsDiscordModalOpen(true)}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onExportPdf={handleExportPdf}
        onOpenGrimoire={() => setIsGrimoireModalOpen(true)}
        grimoireCount={grimoire.length}
        isEncrypted={isEncrypted}
      />

      {/* 3. Main HUD Body Container */}
      <main className="relative z-10 flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto flex flex-col gap-6">
        {/* Voice Command Ribbon */}
        <VoiceCommandController
          isListening={isListening}
          setIsListening={setIsListening}
          onCommand={handleVoiceCommand}
        />

        {/* View Switcher: HUD Master Grid vs Tab Focus */}
        {currentTab === 'dashboard' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Section: Natal Coordinates, Transits & Goetic/Alchemical Box (col-span-3) */}
            <div className="lg:col-span-3 h-full">
              <NatalChartPanel
                natal={natal}
                setNatal={setNatal}
                bodies={bodies}
                aspects={aspects}
                lunar={lunar}
                ascendant={ascendant}
                midheaven={midheaven}
                onSelectSigilToGrimoire={handleSigilToGrimoire}
              />
            </div>

            {/* Center Section: Holographic Orbital Mandala & AR Anchors (col-span-6) */}
            <div className="lg:col-span-6 h-full min-h-[500px]">
              <CelestialOrbitalMandala
                bodies={bodies}
                aspects={aspects}
                lunar={lunar}
                ascendant={ascendant}
                midheaven={midheaven}
                passthroughActive={passthroughActive}
                setPassthroughActive={setPassthroughActive}
                anchorMode={anchorMode}
                setAnchorMode={setAnchorMode}
              />
            </div>

            {/* Right Section: Combat Telemetry & 6ft Zinc Qi-Gong (col-span-3) */}
            <div className="lg:col-span-3 h-full flex flex-col gap-6">
              <CombatTelemetryPanel
                punches={punches}
                setPunches={setPunches}
                bodyWeightKg={session.userBodyWeightKg}
              />
              <QiGongBarbellPanel
                session={session}
                setSession={setSession}
                onExportPdf={handleExportPdf}
                activeInvocation={activeDailyInvocation}
                onOpenGrimoire={() => setIsGrimoireModalOpen(true)}
              />
            </div>
          </div>
        ) : currentTab === 'natal' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4">
              <NatalChartPanel
                natal={natal}
                setNatal={setNatal}
                bodies={bodies}
                aspects={aspects}
                lunar={lunar}
                ascendant={ascendant}
                midheaven={midheaven}
                onSelectSigilToGrimoire={handleSigilToGrimoire}
              />
            </div>
            <div className="lg:col-span-8 min-h-[540px]">
              <CelestialOrbitalMandala
                bodies={bodies}
                aspects={aspects}
                lunar={lunar}
                ascendant={ascendant}
                midheaven={midheaven}
                passthroughActive={passthroughActive}
                setPassthroughActive={setPassthroughActive}
                anchorMode={anchorMode}
                setAnchorMode={setAnchorMode}
              />
            </div>
          </div>
        ) : currentTab === 'combat' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6">
              <CombatTelemetryPanel
                punches={punches}
                setPunches={setPunches}
                bodyWeightKg={session.userBodyWeightKg}
              />
            </div>
            <div className="lg:col-span-6">
              <QiGongBarbellPanel
                session={session}
                setSession={setSession}
                onExportPdf={handleExportPdf}
                activeInvocation={activeDailyInvocation}
                onOpenGrimoire={() => setIsGrimoireModalOpen(true)}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <QiGongBarbellPanel
                session={session}
                setSession={setSession}
                onExportPdf={handleExportPdf}
                activeInvocation={activeDailyInvocation}
                onOpenGrimoire={() => setIsGrimoireModalOpen(true)}
              />
            </div>
            <div className="lg:col-span-5">
              <CombatTelemetryPanel
                punches={punches}
                setPunches={setPunches}
                bodyWeightKg={session.userBodyWeightKg}
              />
            </div>
          </div>
        )}
      </main>

      {/* 4. Footer Status matching Design HTML */}
      <footer className="relative z-20 px-6 py-4 bg-black/60 border-t border-white/10 backdrop-blur-md flex flex-wrap justify-between items-center text-[10px] uppercase tracking-[0.2em] text-gray-500 font-mono gap-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>DEVICE: META QUEST 3 | OPENXR V1.0.32 | HAND TRACKING ACTIVE</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-gray-400">PASSTHROUGH: {passthroughActive ? 'ACTIVE' : 'STANDBY'}</span>
          <span className="text-indigo-400">DISCORD: READY</span>
          <span className="text-emerald-400">ENCRYPTION: AES-256 GCM</span>
        </div>
      </footer>

      {/* 5. Modals */}
      <DiscordShareModal
        isOpen={isDiscordModalOpen}
        onClose={() => setIsDiscordModalOpen(false)}
        natal={natal}
        bodies={bodies}
        aspects={aspects}
        lunar={lunar}
        punches={punches}
        session={session}
      />

      <GrimoireLibraryModal
        isOpen={isGrimoireModalOpen}
        onClose={() => setIsGrimoireModalOpen(false)}
        grimoire={grimoire}
        setGrimoire={setGrimoire}
        activeDailyInvocation={activeDailyInvocation}
        setActiveDailyInvocation={setActiveDailyInvocation}
        onDiscoverNew={handleDiscoverNewIncantation}
      />

      <SearchReferenceModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onAddToGrimoire={handleAddDirectToGrimoire}
      />
    </div>
  );
}
