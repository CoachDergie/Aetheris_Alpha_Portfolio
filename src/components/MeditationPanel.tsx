import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Wind, Sparkles } from 'lucide-react';
import { soundEffects } from '../utils/telemetry';

type BreathPhase = 'INHALE' | 'HOLD_IN' | 'EXHALE' | 'HOLD_OUT';

export const MeditationPanel: React.FC = () => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [phase, setPhase] = useState<BreathPhase>('INHALE');
  const [countdown, setCountdown] = useState<number>(4);
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const [inhaleDuration, setInhaleDuration] = useState<number>(4);
  const [holdInDuration, setHoldInDuration] = useState<number>(4);
  const [exhaleDuration, setExhaleDuration] = useState<number>(4);
  const [holdOutDuration, setHoldOutDuration] = useState<number>(4);

  // Box Breathing Loop
  useEffect(() => {
    let timer: any = null;
    if (isActive) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // Transition phase
            if (phase === 'INHALE') {
              setPhase('HOLD_IN');
              soundEffects.playHolographicChime(528);
              return holdInDuration;
            } else if (phase === 'HOLD_IN') {
              setPhase('EXHALE');
              soundEffects.playHolographicChime(432);
              return exhaleDuration;
            } else if (phase === 'EXHALE') {
              setPhase('HOLD_OUT');
              soundEffects.playHolographicChime(396);
              return holdOutDuration;
            } else {
              setPhase('INHALE');
              soundEffects.playHolographicChime(639);
              return inhaleDuration;
            }
          }
          return prev - 1;
        });

        setTotalSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isActive, phase, inhaleDuration, holdInDuration, exhaleDuration, holdOutDuration]);

  const handleToggle = () => {
    if (!isActive) {
      soundEffects.playHolographicChime(639);
    }
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase('INHALE');
    setCountdown(inhaleDuration);
    setTotalSeconds(0);
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'INHALE':
        return '#00e5ff';
      case 'HOLD_IN':
        return '#ffd700';
      case 'EXHALE':
        return '#ff5252';
      case 'HOLD_OUT':
        return '#a855f7';
    }
  };

  const getPhaseInstruction = () => {
    switch (phase) {
      case 'INHALE':
        return 'DRAW PRANA INTO LOWER DANTIAN';
      case 'HOLD_IN':
        return 'COMPRESS & CIRCULATE QI';
      case 'EXHALE':
        return 'RELEASE TOXINS & EXCESS HEAT';
      case 'HOLD_OUT':
        return 'REST IN OCCULT VOID / STILLNESS';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full p-2.5 sm:p-4 text-center">
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-base sm:text-lg font-black font-mono tracking-widest text-[#00e5ff] uppercase drop-shadow-[0_0_12px_rgba(0,229,255,0.6)]">
          🧘 OCCULT RESPIRATION PACER
        </h2>
        <p className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider">
          TANTRA PRANAYAMA • DANTIAN INTERNAL COMPRESSION
        </p>
      </div>

      {/* Visual Breathing Ring */}
      <div className="relative w-52 h-52 flex items-center justify-center my-2">
        <div
          className={`absolute inset-0 rounded-full border-4 transition-all duration-1000 ${
            phase === 'INHALE' ? 'scale-110 shadow-[0_0_30px_rgba(0,229,255,0.4)]' : ''
          } ${phase === 'HOLD_IN' ? 'scale-110 shadow-[0_0_30px_rgba(255,215,0,0.4)]' : ''} ${
            phase === 'EXHALE' ? 'scale-90 shadow-[0_0_30px_rgba(239,68,68,0.4)]' : ''
          } ${phase === 'HOLD_OUT' ? 'scale-90 shadow-[0_0_30px_rgba(168,85,247,0.4)]' : ''}`}
          style={{ borderColor: getPhaseColor() }}
        ></div>

        <div className="z-10 flex flex-col items-center justify-center space-y-1 font-mono">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: getPhaseColor() }}>
            {phase.replace('_', ' ')}
          </span>
          <span className="text-5xl font-black text-white">{countdown}</span>
          <span className="text-[10px] text-gray-400">SECONDS</span>
        </div>
      </div>

      {/* Phase Instruction */}
      <div className="px-4 py-2 rounded-xl bg-[#1E2638] border border-[#2E3B57] shadow-[0_2px_15px_rgba(0,0,0,0.3)]">
        <p className="text-xs font-mono font-black text-[#00e5ff] tracking-wider">
          {getPhaseInstruction()}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handleToggle}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-mono font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,229,255,0.4)] ${
            isActive
              ? 'bg-amber-500 hover:bg-amber-400 text-black'
              : 'bg-[#00e5ff] hover:bg-cyan-400 text-black'
          }`}
        >
          {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isActive ? 'PAUSE' : 'BEGIN PACER'}</span>
        </button>

        <button
          onClick={handleReset}
          className="p-2.5 rounded-xl bg-[#1E2638] border border-[#2E3B57] text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
