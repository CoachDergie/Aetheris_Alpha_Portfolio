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
  EnvironmentViewMode,
} from './types';
import { calculateNatalChart, calculateLunarPhase } from './utils/astronomy';
import { INITIAL_GRIMOIRE_LIBRARY, synthesizeDiscoveryFromQuery } from './utils/incantationDiscovery';
import { generatePunchTelemetry, soundEffects } from './utils/telemetry';
import { saveToEncryptedVault, loadFromEncryptedVault } from './utils/crypto';
import { generateAstrologyPdfReport } from './utils/pdfExport';
import { MetaQuestEnvironment } from './components/MetaQuestEnvironment';
import { Header } from './components/Header';
import { MainHUDDashboard } from './components/MainHUDDashboard';
import { NatalChartPanel } from './components/NatalChartPanel';
import { NatalCalibrateModal } from './components/NatalCalibrateModal';
import { CombatTelemetryPanel } from './components/CombatTelemetryPanel';
import { QiGongBarbellPanel } from './components/QiGongBarbellPanel';
import { TarotPanel } from './components/TarotPanel';
import { MeditationPanel } from './components/MeditationPanel';
import { GrimoirePanel } from './components/GrimoirePanel';
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
  const [viewMode, setViewMode] = useState<EnvironmentViewMode>('headset_xr');
  const [showDevTelemetry, setShowDevTelemetry] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [isCalibrateModalOpen, setIsCalibrateModalOpen] = useState<boolean>(false);
  const [isDiscordModalOpen, setIsDiscordModalOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);

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
      colors: ['#00e5ff', '#ffd700', '#ffffff', '#34d399'],
    });
  }, [natal, bodies, aspects, lunar, ascendant, midheaven, punches, session, activeDailyInvocation]);

  const handleDiscoverNewIncantation = useCallback((promptQuery?: string) => {
    const queryToUse = promptQuery || `${bodies[0]?.name || 'Sun'} in ${bodies[0]?.sign || 'Scorpio'} ${aspects[0]?.aspectType || 'Square'}`;
    const newInc = synthesizeDiscoveryFromQuery(queryToUse);
    setGrimoire((prev) => [newInc, ...prev]);
    setActiveDailyInvocation(newInc);
    soundEffects.playHolographicChime(963);
  }, [bodies, aspects]);

  const handleAddDirectToGrimoire = useCallback((newInc: DiscoveredIncantation) => {
    setGrimoire((prev) => {
      if (prev.some((item) => item.id === newInc.id)) return prev;
      return [newInc, ...prev];
    });
    setActiveDailyInvocation(newInc);
  }, []);

  return (
    <MetaQuestEnvironment
      viewMode={viewMode}
      setViewMode={setViewMode}
      showDevTelemetry={showDevTelemetry}
      setShowDevTelemetry={setShowDevTelemetry}
      soundEnabled={soundEnabled}
      setSoundEnabled={setSoundEnabled}
      lunarPhaseName={lunar.phaseName}
    >
      {/* 1. Header with Headset Titles & Floating 7 Navigation Tabs */}
      <Header
        currentTab={currentTab}
        setTab={setCurrentTab}
        lunarPhaseName={lunar.phaseName}
        lunarIllumination={lunar.illumination}
        birthCity={natal.birthCity}
        birthDate={natal.birthDate}
        birthTime={natal.birthTime}
        onOpenCalibrate={() => setIsCalibrateModalOpen(true)}
        onOpenDiscordShare={() => setIsDiscordModalOpen(true)}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onExportPdf={handleExportPdf}
      />

      {/* 2. Main Content View according to selected tab */}
      <main className="p-2 sm:p-4">
        {currentTab === 'dashboard' && (
          <MainHUDDashboard
            natal={natal}
            bodies={bodies}
            aspects={aspects}
            lunar={lunar}
            ascendant={ascendant}
            midheaven={midheaven}
            setTab={setCurrentTab}
            onOpenCalibrate={() => setIsCalibrateModalOpen(true)}
          />
        )}

        {currentTab === 'natal' && (
          <NatalChartPanel
            natal={natal}
            setNatal={setNatal}
            bodies={bodies}
            aspects={aspects}
            lunar={lunar}
            ascendant={ascendant}
            midheaven={midheaven}
          />
        )}

        {currentTab === 'combat' && (
          <CombatTelemetryPanel
            punches={punches}
            setPunches={setPunches}
            bodyWeightKg={session.userBodyWeightKg}
          />
        )}

        {currentTab === 'qigong' && (
          <QiGongBarbellPanel
            session={session}
            setSession={setSession}
            onExportPdf={handleExportPdf}
          />
        )}

        {currentTab === 'meditations' && (
          <MeditationPanel />
        )}

        {currentTab === 'tarot' && (
          <TarotPanel />
        )}

        {currentTab === 'occult' && (
          <GrimoirePanel
            grimoire={grimoire}
            setGrimoire={setGrimoire}
            activeDailyInvocation={activeDailyInvocation}
            setActiveDailyInvocation={setActiveDailyInvocation}
            onDiscoverNew={handleDiscoverNewIncantation}
          />
        )}
      </main>

      {/* 3. Interactive Origin Calibration Modal */}
      <NatalCalibrateModal
        isOpen={isCalibrateModalOpen}
        onClose={() => setIsCalibrateModalOpen(false)}
        natal={natal}
        onSave={(updated) => setNatal(updated)}
      />

      {/* 4. Discord Share Dossier Modal */}
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

      {/* 5. Occult & Martial Search Reference Modal */}
      <SearchReferenceModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onAddToGrimoire={handleAddDirectToGrimoire}
      />
    </MetaQuestEnvironment>
  );
}
