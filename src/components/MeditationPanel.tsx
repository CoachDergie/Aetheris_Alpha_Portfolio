import React, { useState, useEffect, useRef } from 'react';
import { Meditation } from '../types';
import { MEDITATION_LIBRARY } from '../utils/meditationData';
import { HeartHandshake, Play, Pause, RotateCcw, Sparkles, Volume2, VolumeX, CheckCircle, X } from 'lucide-react';

interface MeditationPanelProps {
  accentGold?: string;
  accentCyan?: string;
}

export const MeditationPanel: React.FC<MeditationPanelProps> = ({
  accentGold = '#ffd700',
  accentCyan = '#00e5ff',
}) => {
  const [selectedMeditation, setSelectedMeditation] = useState<Meditation | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(600);
  const [breathPhase, setBreathPhase] = useState<'INHALE' | 'HOLD' | 'EXHALE' | 'VOID'>('INHALE');
  const [breathCount, setBreathCount] = useState<number>(4);
  const [isAudioDroneOn, setIsAudioDroneOn] = useState<boolean>(true);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // Initialize timer when meditation is chosen
  const handleSelectMeditation = (med: Meditation) => {
    setSelectedMeditation(med);
    setSecondsRemaining(med.durationMinutes * 60);
    setIsPlaying(false);
  };

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isPlaying) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, secondsRemaining]);

  // Breathing Pacer cycle
  useEffect(() => {
    let breathInterval: NodeJS.Timeout;
    if (isPlaying) {
      let count = 4;
      let phase: 'INHALE' | 'HOLD' | 'EXHALE' | 'VOID' = 'INHALE';

      breathInterval = setInterval(() => {
        count--;
        if (count <= 0) {
          if (phase === 'INHALE') phase = 'HOLD';
          else if (phase === 'HOLD') phase = 'EXHALE';
          else if (phase === 'EXHALE') phase = 'VOID';
          else phase = 'INHALE';
          count = 4;
        }
        setBreathPhase(phase);
        setBreathCount(count);
      }, 1000);
    }
    return () => clearInterval(breathInterval);
  }, [isPlaying]);

  // Web Audio Synth Harmonic Drone
  useEffect(() => {
    if (isPlaying && isAudioDroneOn) {
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // 432 Hz Solfeggio harmonic drone
        osc.type = 'sine';
        osc.frequency.setValueAtTime(432, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        audioCtxRef.current = ctx;
        oscRef.current = osc;
        gainRef.current = gain;
      } catch (err) {
        console.warn('AudioContext disabled or not supported:', err);
      }
    } else {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
      oscRef.current = null;
      audioCtxRef.current = null;
    }

    return () => {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, [isPlaying, isAudioDroneOn]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainderSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 sm:p-6 flex flex-col items-center gap-6">
      {/* Title */}
      <div className="text-center space-y-1">
        <h2 className="text-xl sm:text-2xl font-black font-mono tracking-widest text-[#ffd700] uppercase drop-shadow-[0_0_12px_rgba(255,215,0,0.5)]">
          🧘 MEDITATION LIBRARY
        </h2>
        <p className="text-xs font-mono text-gray-400 uppercase tracking-wider">
          Guided Esoteric Respiration • Planetary Harmonic Alignment
        </p>
      </div>

      {/* Meditation Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
        {MEDITATION_LIBRARY.map((med) => (
          <div
            key={med.id}
            onClick={() => handleSelectMeditation(med)}
            className="cursor-pointer bg-gradient-to-b from-[#141a2e]/90 to-[#0c1020]/95 border border-yellow-500/30 hover:border-[#ffd700] rounded-2xl p-5 shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(255,215,0,0.25)] transition-all flex flex-col justify-between"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-950/60 border border-yellow-500/50 flex items-center justify-center text-[#ffd700] shadow-[0_0_12px_rgba(255,215,0,0.3)]">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-black font-mono text-white uppercase tracking-wider">
                  {med.title}
                </h3>
                <span className="text-[11px] font-mono font-bold text-[#ffd700]">
                  {med.associatedPlanet}
                </span>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{med.description}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between text-xs font-mono text-gray-400">
              <span>PATTERN: {med.breathingPattern}</span>
              <span className="font-bold text-white px-2.5 py-1 rounded-lg bg-yellow-500/20 border border-yellow-500/40 text-yellow-300">
                {med.durationMinutes} MIN
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ACTIVE MEDITATION SESSION MODAL */}
      {selectedMeditation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-xl bg-[#101526] border-2 border-[#ffd700] rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(255,215,0,0.35)] text-gray-200 font-sans flex flex-col items-center text-center">
            <button
              onClick={() => {
                setIsPlaying(false);
                setSelectedMeditation(null);
              }}
              className="absolute top-5 right-5 p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-yellow-950/60 border border-yellow-500/60 flex items-center justify-center text-[#ffd700] shadow-[0_0_20px_rgba(255,215,0,0.5)] mb-3">
              <HeartHandshake className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-black font-mono text-[#ffd700] uppercase tracking-wider">
              {selectedMeditation.title}
            </h2>
            <span className="text-xs font-mono text-cyan-300 font-bold uppercase mt-1">
              {selectedMeditation.associatedPlanet} • {selectedMeditation.focusArchetype}
            </span>

            {/* Breathing Visualizer Orb */}
            <div className="my-8 relative w-48 h-48 flex items-center justify-center">
              {/* Outer Pulsing Ring */}
              <div
                className={`absolute inset-0 rounded-full border-2 border-[#ffd700] transition-transform duration-1000 ease-in-out ${
                  breathPhase === 'INHALE'
                    ? 'scale-125 opacity-100 shadow-[0_0_40px_rgba(255,215,0,0.6)]'
                    : breathPhase === 'HOLD'
                    ? 'scale-125 opacity-80 border-cyan-400 shadow-[0_0_40px_rgba(0,229,255,0.6)]'
                    : breathPhase === 'EXHALE'
                    ? 'scale-75 opacity-40 shadow-none'
                    : 'scale-75 opacity-20 border-gray-600'
                }`}
              ></div>

              {/* Center Core */}
              <div className="z-10 text-center font-mono">
                <div className="text-sm font-black text-white uppercase tracking-widest">
                  {isPlaying ? breathPhase : 'READY'}
                </div>
                <div className="text-3xl font-black text-[#ffd700] my-1">
                  {isPlaying ? breathCount : '4'}s
                </div>
                <div className="text-[10px] text-gray-400">
                  {selectedMeditation.breathingPattern}
                </div>
              </div>
            </div>

            {/* Mantra transmission */}
            <div className="w-full p-3 rounded-xl bg-black/60 border border-cyan-500/30 font-mono text-xs text-cyan-300 mb-6">
              <span className="text-gray-500 block text-[10px] uppercase font-bold">MANTRA / CURRENT:</span>
              <span className="font-extrabold tracking-wider">{selectedMeditation.mantra}</span>
            </div>

            {/* Timer & Controls */}
            <div className="text-4xl font-black font-mono text-white tracking-widest mb-6">
              {formatTime(secondsRemaining)}
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsAudioDroneOn(!isAudioDroneOn)}
                className={`p-3 rounded-xl border transition-all ${
                  isAudioDroneOn
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                    : 'bg-black/40 border-gray-700 text-gray-400'
                }`}
                title="Toggle 432Hz Ambient Harmonic Drone"
              >
                {isAudioDroneOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-mono text-sm font-black uppercase tracking-widest transition-all ${
                  isPlaying
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                    : 'bg-[#ffd700] hover:bg-yellow-400 text-black shadow-[0_0_25px_rgba(255,215,0,0.6)]'
                }`}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'PAUSE SESSION' : 'BEGIN SESSION'}</span>
              </button>

              <button
                onClick={() => {
                  setIsPlaying(false);
                  setSecondsRemaining(selectedMeditation.durationMinutes * 60);
                }}
                className="p-3 rounded-xl bg-black/40 border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white transition-colors"
                title="Reset Timer"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
