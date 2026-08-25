import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Wind, Sparkles, Maximize2 } from 'lucide-react';
import { soundEffects } from '../utils/telemetry';

type BreathPhase = 'INHALE' | 'HOLD_IN' | 'EXHALE' | 'HOLD_OUT';

interface PhaseConfig {
  id: BreathPhase;
  name: string;
  sub: string;
  color: string;
  rgb: [number, number, number];
  secondaryColor: string;
  glowColor: string;
}

const PHASES: PhaseConfig[] = [
  {
    id: 'INHALE',
    name: 'Inhale: Draw Prana into Lower Dantian',
    sub: 'DRAW VITAL COSMIC BREATH INWARD THROUGH CROWN & PORES',
    color: '#00e5ff',
    rgb: [0, 229, 255],
    secondaryColor: '#ffffff',
    glowColor: 'rgba(0, 229, 255, 0.6)',
  },
  {
    id: 'HOLD_IN',
    name: 'Hold: Compress and Circulate Qi',
    sub: 'CONDENSE ENERGY INTO CORE • MICROCOSMIC SPINAL ORBIT',
    color: '#ffd700',
    rgb: [255, 215, 0],
    secondaryColor: '#00e5ff',
    glowColor: 'rgba(255, 215, 0, 0.7)',
  },
  {
    id: 'EXHALE',
    name: 'Exhale: Release Toxins and Excess Heat',
    sub: 'DISCHARGE TURBIDITY, STAGNANT CHI & INTERNAL HEAT',
    color: '#ff5252',
    rgb: [255, 82, 82],
    secondaryColor: '#ff9100',
    glowColor: 'rgba(255, 82, 82, 0.6)',
  },
  {
    id: 'HOLD_OUT',
    name: 'Hold: Rest in the Void',
    sub: 'ABSOLUTE STILLNESS • BOUNDLESS ZERO-POINT AWARENESS',
    color: '#a855f7',
    rgb: [168, 85, 247],
    secondaryColor: '#6366f1',
    glowColor: 'rgba(168, 85, 247, 0.3)',
  },
];

const FADE_DURATION = 250; // 0.25s smooth transition duration

function lerpRgb(rgbA: [number, number, number], rgbB: [number, number, number], t: number): string {
  const r = Math.round(rgbA[0] + (rgbB[0] - rgbA[0]) * t);
  const g = Math.round(rgbA[1] + (rgbB[1] - rgbA[1]) * t);
  const b = Math.round(rgbA[2] + (rgbB[2] - rgbA[2]) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

function lerpRgba(rgbA: [number, number, number], rgbB: [number, number, number], alphaA: number, alphaB: number, t: number): string {
  const r = Math.round(rgbA[0] + (rgbB[0] - rgbA[0]) * t);
  const g = Math.round(rgbA[1] + (rgbB[1] - rgbA[1]) * t);
  const b = Math.round(rgbA[2] + (rgbB[2] - rgbA[2]) * t);
  const a = (alphaA + (alphaB - alphaA) * t).toFixed(3);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export const MeditationPanel: React.FC = () => {
  const [isActive, setIsActive] = useState<boolean>(true);
  const [phaseIdx, setPhaseIdx] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(4);
  const [cycleCount, setCycleCount] = useState<number>(1);
  const [phaseSeconds, setPhaseSeconds] = useState<number>(4);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const stateRef = useRef({
    isActive: true,
    phaseIdx: 0,
    phaseSeconds: 4,
    totalElapsed: 0,
    lastTime: performance.now(),
    cycleCount: 1,
  });

  // Keep stateRef synced
  useEffect(() => {
    stateRef.current.isActive = isActive;
    stateRef.current.phaseSeconds = phaseSeconds;
  }, [isActive, phaseSeconds]);

  // Handle phase transitions and sound effects
  const handleToggle = () => {
    if (!isActive) {
      soundEffects.playHolographicChime(639);
    }
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setPhaseIdx(0);
    setCountdown(phaseSeconds);
    setCycleCount(1);
    stateRef.current.totalElapsed = 0;
    stateRef.current.phaseIdx = 0;
    stateRef.current.cycleCount = 1;
    stateRef.current.lastTime = performance.now();
  };

  // Canvas Mannequin & Particle Simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Local Particle Pool
    const MAX_PARTICLES = 120;
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      maxAlpha: number;
      life: number;
      maxLife: number;
      orbitAngle: number;
      orbitRadius: number;
      orbitSpeed: number;
      spineProgress: number;
      spineSpeed: number;
      isSpine: boolean;
      color: string;
    }

    const particles: Particle[] = [];
    for (let i = 0; i < MAX_PARTICLES; i++) {
      particles.push({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 2,
        alpha: 0,
        maxAlpha: 0.7,
        life: 0,
        maxLife: 100,
        orbitAngle: 0,
        orbitRadius: 10,
        orbitSpeed: 0.05,
        spineProgress: 0,
        spineSpeed: 0.01,
        isSpine: false,
        color: '#00e5ff',
      });
    }

    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    let dpr = window.devicePixelRatio || 1;

    const resize = () => {
      if (!canvas) return;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.scale(dpr, dpr);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    function easeInOutQuad(t: number) {
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    const render = (now: number) => {
      animFrameRef.current = requestAnimationFrame(render);
      const dt = now - stateRef.current.lastTime;
      stateRef.current.lastTime = now;
      const dtFactor = Math.min(2.5, dt / 16.666);

      const pSec = stateRef.current.phaseSeconds;
      const phaseMs = pSec * 1000;

      if (stateRef.current.isActive) {
        stateRef.current.totalElapsed += dt;
      }

      const totalElapsed = stateRef.current.totalElapsed;
      const phaseElapsed = totalElapsed % phaseMs;
      const phaseProgress = phaseElapsed / phaseMs;
      const curPhaseIdx = Math.floor((totalElapsed / phaseMs) % 4);

      if (curPhaseIdx !== stateRef.current.phaseIdx) {
        stateRef.current.phaseIdx = curPhaseIdx;
        setPhaseIdx(curPhaseIdx);
        if (curPhaseIdx === 0) {
          stateRef.current.cycleCount++;
          setCycleCount(stateRef.current.cycleCount);
          soundEffects.playHolographicChime(639);
        } else if (curPhaseIdx === 1) {
          soundEffects.playHolographicChime(528);
        } else if (curPhaseIdx === 2) {
          soundEffects.playHolographicChime(432);
        } else {
          soundEffects.playHolographicChime(396);
        }
      }

      const remaining = Math.max(1, Math.ceil((phaseMs - phaseElapsed) / 1000));
      setCountdown(remaining);

      const prevPhaseIdx = (curPhaseIdx + 3) % 4;
      const currentPhase = PHASES[curPhaseIdx];
      const prevPhase = PHASES[prevPhaseIdx];

      // 0.25-second (250ms) smooth transition factor
      const transitionFactor = Math.min(1, phaseElapsed / FADE_DURATION);
      const smoothFade = easeInOutQuad(transitionFactor);
      const blendedColor = lerpRgb(prevPhase.rgb, currentPhase.rgb, smoothFade);

      // Draw Background
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height * 0.50;
      const scale = Math.min(1.15, Math.max(0.62, Math.min(width / 420, height / 440)));

      // Subtle ambient glow with 0.25s smooth cross-fade
      const bgGlow = ctx.createRadialGradient(centerX, centerY, 10 * scale, centerX, centerY, 180 * scale);
      const curAlpha = currentPhase.id === 'HOLD_OUT' ? 0.04 : 0.08;
      const prevAlpha = prevPhase.id === 'HOLD_OUT' ? 0.04 : 0.08;
      const centerGlow = lerpRgba(prevPhase.rgb, currentPhase.rgb, prevAlpha, curAlpha, smoothFade);
      
      bgGlow.addColorStop(0, centerGlow);
      bgGlow.addColorStop(1, 'rgba(10, 10, 12, 0)');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      // Expansion
      let chestExp = 0;
      let dantianGlow = 0;
      if (currentPhase.id === 'INHALE') {
        chestExp = easeInOutQuad(phaseProgress);
        dantianGlow = phaseProgress;
      } else if (currentPhase.id === 'HOLD_IN') {
        chestExp = 1;
        dantianGlow = 1 + Math.sin(now * 0.008) * 0.25;
      } else if (currentPhase.id === 'EXHALE') {
        chestExp = 1 - easeInOutQuad(phaseProgress);
        dantianGlow = (1 - phaseProgress) * 0.8;
      } else {
        chestExp = 0;
        dantianGlow = 0.15 + Math.sin(now * 0.003) * 0.08;
      }

      // Draw Mannequin Wireframe with 0.25s color transition
      ctx.save();
      const prevBaseAlpha = prevPhase.id === 'HOLD_OUT' ? 0.25 : 0.45;
      const curBaseAlpha = currentPhase.id === 'HOLD_OUT' ? 0.25 : 0.45;
      const strokeColor = lerpRgba(prevPhase.rgb, currentPhase.rgb, prevBaseAlpha, curBaseAlpha + chestExp * 0.25, smoothFade);
      const glowColor = lerpRgba(prevPhase.rgb, currentPhase.rgb, 0.2, 0.4, smoothFade);

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.6;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Landmarks
      const headRadius = 16 * scale;
      const headY = centerY - 100 * scale;
      const crownY = headY - headRadius;
      const thirdEyeY = headY - 2 * scale;
      const throatY = headY + headRadius + 10 * scale;

      const chestW = (32 + chestExp * 8) * scale;
      const shoulderW = (44 + chestExp * 6) * scale;
      const chestH = (24 + chestExp * 4) * scale;

      const shoulderY = throatY + 7 * scale;
      const lShoulderX = centerX - shoulderW;
      const rShoulderX = centerX + shoulderW;

      const sternumY = shoulderY + chestH;
      const lChestX = centerX - chestW;
      const rChestX = centerX + chestW;

      const navelY = sternumY + 32 * scale;
      const dantianY = navelY + 14 * scale;
      const pelvicY = dantianY + 18 * scale;
      const pelvicW = 28 * scale;

      const kneeY = pelvicY + 24 * scale;
      const lKneeX = centerX - 85 * scale;
      const rKneeX = centerX + 85 * scale;

      const elbowY = shoulderY + 38 * scale;
      const lElbowX = centerX - 54 * scale;
      const rElbowX = centerX + 54 * scale;
      const lHandX = lKneeX + 8 * scale;
      const lHandY = kneeY - 6 * scale;
      const rHandX = rKneeX - 8 * scale;
      const rHandY = kneeY - 6 * scale;

      // 1. Head
      ctx.beginPath();
      ctx.arc(centerX, headY, headRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Third Eye Node
      ctx.beginPath();
      ctx.arc(centerX, thirdEyeY, 2 * scale, 0, Math.PI * 2);
      ctx.fillStyle = blendedColor;
      ctx.fill();

      // 2. Neck
      ctx.beginPath();
      ctx.moveTo(centerX, headY + headRadius);
      ctx.lineTo(centerX, throatY);
      ctx.stroke();

      // 3. Collarbone & Ribs
      ctx.beginPath();
      ctx.moveTo(lShoulderX, shoulderY);
      ctx.lineTo(centerX, throatY);
      ctx.lineTo(rShoulderX, shoulderY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(lShoulderX, shoulderY);
      ctx.lineTo(lChestX, sternumY);
      ctx.lineTo(centerX, sternumY + 6 * scale);
      ctx.lineTo(rChestX, sternumY);
      ctx.lineTo(rShoulderX, shoulderY);
      ctx.stroke();

      // 4. Central Spine
      ctx.beginPath();
      ctx.setLineDash([3 * scale, 3 * scale]);
      ctx.moveTo(centerX, crownY);
      ctx.lineTo(centerX, pelvicY);
      ctx.stroke();
      ctx.setLineDash([]);

      // 5. Abdomen & Pelvis
      ctx.beginPath();
      ctx.moveTo(lChestX, sternumY);
      ctx.lineTo(centerX - pelvicW, pelvicY);
      ctx.lineTo(centerX + pelvicW, pelvicY);
      ctx.lineTo(rChestX, sternumY);
      ctx.stroke();

      // 6. Arms & Mudras
      ctx.beginPath();
      ctx.moveTo(lShoulderX, shoulderY);
      ctx.lineTo(lElbowX, elbowY);
      ctx.lineTo(lHandX, lHandY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(rShoulderX, shoulderY);
      ctx.lineTo(rElbowX, elbowY);
      ctx.lineTo(rHandX, rHandY);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(lHandX, lHandY, 3.5 * scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(rHandX, rHandY, 3.5 * scale, 0, Math.PI * 2);
      ctx.stroke();

      // 7. Crossed Legs
      ctx.beginPath();
      ctx.moveTo(centerX - pelvicW, pelvicY);
      ctx.lineTo(lKneeX, kneeY);
      ctx.lineTo(centerX + 12 * scale, kneeY + 10 * scale);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(centerX + pelvicW, pelvicY);
      ctx.lineTo(rKneeX, kneeY);
      ctx.lineTo(centerX - 12 * scale, kneeY + 10 * scale);
      ctx.stroke();

      // 8. Dantian Glowing Node with 0.25s smooth cross-fade
      const dRadius = (7 + dantianGlow * 5) * scale;
      const dGlowGrad = ctx.createRadialGradient(centerX, dantianY, 1 * scale, centerX, dantianY, dRadius * 3);
      const glowOuter = lerpRgba(prevPhase.rgb, currentPhase.rgb, 0.35, 0.6, smoothFade);
      
      dGlowGrad.addColorStop(0, '#ffffff');
      dGlowGrad.addColorStop(0.3, blendedColor);
      dGlowGrad.addColorStop(0.7, glowOuter);
      dGlowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = dGlowGrad;
      ctx.beginPath();
      ctx.arc(centerX, dantianY, dRadius * 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, dantianY, dRadius * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = blendedColor;
      ctx.shadowBlur = 14;
      ctx.fill();

      // Spin rings in Hold with 0.25s smooth opacity cross-fade
      const ringAlpha = currentPhase.id === 'HOLD_IN' 
        ? smoothFade 
        : (prevPhase.id === 'HOLD_IN' ? 1 - smoothFade : 0);

      if (ringAlpha > 0.01) {
        const time = now * 0.003;
        ctx.save();
        ctx.globalAlpha = ringAlpha;
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(centerX, dantianY, dRadius * 1.8, dRadius * 0.8, time, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();

      // Particles Update
      if (stateRef.current.isActive) {
        if (currentPhase.id === 'INHALE') {
          // Spawn incoming
          for (let i = 0; i < 2; i++) {
            const p = particles.find((item) => item.life >= item.maxLife || item.alpha <= 0);
            if (p) {
              const angle = Math.random() * Math.PI * 2;
              const dist = (Math.random() * 180 + 80) * scale;
              p.x = centerX + Math.cos(angle) * dist;
              p.y = dantianY - 30 * scale + Math.sin(angle) * (dist * 0.85);
              p.size = Math.random() * 2.2 + 1;
              p.maxLife = Math.random() * 90 + 60;
              p.life = 0;
              p.alpha = 0;
              p.maxAlpha = Math.random() * 0.8 + 0.2;
              p.color = Math.random() < 0.3 ? '#ffffff' : '#00e5ff';
            }
          }

          particles.forEach((p) => {
            if (p.life < p.maxLife) {
              p.life += dtFactor;
              const prog = Math.min(1, p.life / p.maxLife);
              const dx = centerX - p.x;
              const dy = dantianY - p.y;
              p.x += dx * 0.04 * dtFactor;
              p.y += dy * 0.04 * dtFactor;
              p.alpha = prog < 0.2 ? (prog / 0.2) * p.maxAlpha : prog > 0.8 ? (1 - prog) * 5 * p.maxAlpha : p.maxAlpha;

              ctx.save();
              ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
              ctx.fillStyle = p.color;
              ctx.shadowColor = p.color;
              ctx.shadowBlur = 6;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
          });
        } else if (currentPhase.id === 'HOLD_IN') {
          for (let i = 0; i < 2; i++) {
            const p = particles.find((item) => item.life >= item.maxLife || item.alpha <= 0);
            if (p) {
              p.isSpine = Math.random() < 0.45;
              p.life = 0;
              p.maxLife = Math.random() * 120 + 80;
              p.orbitAngle = Math.random() * Math.PI * 2;
              p.orbitRadius = (Math.random() * 26 + 5) * scale;
              p.orbitSpeed = (Math.random() * 0.08 + 0.04) * (Math.random() < 0.5 ? 1 : -1);
              p.spineProgress = Math.random();
              p.spineSpeed = Math.random() * 0.012 + 0.008;
              p.size = Math.random() * 2.2 + 1;
              p.alpha = 0;
              p.maxAlpha = Math.random() * 0.85 + 0.2;
              p.color = Math.random() < 0.4 ? '#ffd700' : '#00e5ff';
            }
          }

          particles.forEach((p) => {
            if (p.life < p.maxLife) {
              p.life += dtFactor;
              const prog = Math.min(1, p.life / p.maxLife);
              if (p.isSpine) {
                p.spineProgress += p.spineSpeed * dtFactor;
                if (p.spineProgress > 1) p.spineProgress -= 1;
                const isUp = p.spineProgress < 0.5;
                const subProg = isUp ? p.spineProgress / 0.5 : (p.spineProgress - 0.5) / 0.5;
                const spineHeight = pelvicY - crownY;
                if (isUp) {
                  p.y = pelvicY - subProg * spineHeight;
                  p.x = centerX - 5 * scale + Math.sin(subProg * Math.PI) * 4 * scale;
                } else {
                  p.y = crownY + subProg * spineHeight;
                  p.x = centerX + 5 * scale - Math.sin(subProg * Math.PI) * 4 * scale;
                }
              } else {
                p.orbitAngle += p.orbitSpeed * dtFactor;
                p.x = centerX + Math.cos(p.orbitAngle) * p.orbitRadius;
                p.y = dantianY + Math.sin(p.orbitAngle) * (p.orbitRadius * 0.7);
              }
              p.alpha = prog < 0.2 ? (prog / 0.2) * p.maxAlpha : prog > 0.8 ? (1 - prog) * 5 * p.maxAlpha : p.maxAlpha;

              ctx.save();
              ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
              ctx.fillStyle = p.color;
              ctx.shadowColor = p.color;
              ctx.shadowBlur = 6;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
          });
        } else if (currentPhase.id === 'EXHALE') {
          for (let i = 0; i < 2; i++) {
            const p = particles.find((item) => item.life >= item.maxLife || item.alpha <= 0);
            if (p) {
              p.x = centerX + (Math.random() * 16 - 8) * scale;
              p.y = dantianY - 10 * scale;
              const angle = Math.random() * Math.PI * 2;
              const speed = (Math.random() * 1.8 + 0.8) * scale;
              p.vx = Math.cos(angle) * speed;
              p.vy = Math.sin(angle) * speed - 0.5 * scale;
              p.size = Math.random() * 2.8 + 1;
              p.life = 0;
              p.maxLife = Math.random() * 80 + 50;
              p.alpha = 0;
              p.maxAlpha = Math.random() * 0.8 + 0.2;
              p.color = Math.random() < 0.5 ? '#ff5252' : '#ff9100';
            }
          }

          particles.forEach((p) => {
            if (p.life < p.maxLife) {
              p.life += dtFactor;
              const prog = Math.min(1, p.life / p.maxLife);
              p.x += p.vx * dtFactor;
              p.y += p.vy * dtFactor;
              p.alpha = (1 - prog) * p.maxAlpha;

              ctx.save();
              ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
              ctx.fillStyle = p.color;
              ctx.shadowColor = p.color;
              ctx.shadowBlur = 6;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
          });
        } else {
          // Void
          particles.forEach((p) => {
            if (p.alpha > 0) {
              p.alpha = Math.max(0, p.alpha - 0.05 * dtFactor);
              ctx.save();
              ctx.globalAlpha = p.alpha;
              ctx.fillStyle = p.color;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
          });
        }
      }
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      ro.disconnect();
    };
  }, []);

  const activePhaseConfig = PHASES[phaseIdx];

  return (
    <div className="flex flex-col items-center gap-3 w-full p-2 sm:p-4 text-center min-w-0 max-w-full">
      {/* Title */}
      <div className="space-y-1 min-w-0">
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-base sm:text-lg font-black font-mono tracking-widest text-[#00e5ff] uppercase drop-shadow-[0_0_12px_rgba(0,229,255,0.6)] truncate">
            🧘 ESOTERIC RESPIRATION PACER
          </h2>
        </div>
        <p className="text-[10px] sm:text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider truncate">
          TANTRA PRANAYAMA • DANTIAN INTERNAL COMPRESSION
        </p>
      </div>

      {/* Interactive Canvas Mannequin Visualizer */}
      <div className="relative w-full max-w-lg h-72 sm:h-80 bg-[#0a0a0c] border border-cyan-500/30 rounded-2xl overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Phase Header overlay inside canvas with smooth 0.25s transition */}
        <div className="absolute top-2.5 inset-x-0 flex flex-col items-center pointer-events-none px-3 transition-all duration-300">
          <span 
            className="text-[9px] sm:text-[10px] font-mono font-bold tracking-widest uppercase transition-colors duration-300"
            style={{ color: activePhaseConfig.color }}
          >
            PHASE 0{phaseIdx + 1} // 04 • {activePhaseConfig.id.replace('_', ' ')}
          </span>
          <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] truncate max-w-full transition-all duration-300">
            {activePhaseConfig.name}
          </span>
        </div>

        {/* Floating Timer Badge overlay inside canvas with smooth transition */}
        <div className="absolute bottom-2.5 left-3 flex items-center gap-2 bg-[#121824]/80 border border-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm pointer-events-none font-mono transition-all duration-300">
          <span className="text-[10px] text-gray-400 uppercase">TIME:</span>
          <span className="text-sm font-black text-white transition-colors duration-300" style={{ color: activePhaseConfig.color }}>
            {countdown}s
          </span>
          <span className="text-[9px] text-gray-500 border-l border-gray-700 pl-1.5">
            CYC #{cycleCount}
          </span>
        </div>

        {/* Standalone New Tab Launcher */}
        <a
          href="/meditation.html"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-2.5 right-3 flex items-center gap-1 bg-[#121824]/80 hover:bg-cyan-950/80 border border-cyan-500/40 hover:border-[#00e5ff] text-cyan-300 px-2 py-1 rounded-lg backdrop-blur-sm transition-all text-[9px] font-mono font-bold uppercase"
          title="Open Standalone Fullscreen Canvas"
        >
          <span>FULL CANVAS</span>
          <Maximize2 className="w-3 h-3" />
        </a>
      </div>

      {/* Phase Instruction Box */}
      <div className="w-full max-w-lg px-3 py-2 rounded-xl bg-[#1E2638] border border-[#2E3B57] shadow-[0_2px_15px_rgba(0,0,0,0.3)]">
        <p 
          className="text-xs font-mono font-black tracking-wider transition-colors duration-500 truncate"
          style={{ color: activePhaseConfig.color }}
        >
          {activePhaseConfig.sub}
        </p>
      </div>

      {/* Cadence Timing Selector */}
      <div className="flex items-center justify-center gap-1.5">
        <span className="text-[10px] font-mono text-gray-400 uppercase font-bold mr-1">PACING:</span>
        {[3, 4, 5, 6].map((sec) => (
          <button
            key={sec}
            onClick={() => setPhaseSeconds(sec)}
            className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold uppercase transition-all ${
              phaseSeconds === sec
                ? 'bg-[#122238] border border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(0,229,255,0.3)]'
                : 'bg-[#161B26] border border-[#2E3B57] text-gray-400 hover:text-white'
            }`}
          >
            {sec}s
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handleToggle}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl font-mono font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,229,255,0.4)] ${
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
          className="p-2 rounded-xl bg-[#1E2638] border border-[#2E3B57] text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

