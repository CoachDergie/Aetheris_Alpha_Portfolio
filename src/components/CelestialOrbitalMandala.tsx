import React, { useState } from 'react';
import { CelestialBody, PlanetaryAspect, LunarPhaseInfo } from '../types';
import { soundEffects } from '../utils/telemetry';
import { Orbit, Compass, Move, RotateCw, ZoomIn, ZoomOut, Anchor, Eye } from 'lucide-react';

interface CelestialOrbitalMandalaProps {
  bodies: CelestialBody[];
  aspects: PlanetaryAspect[];
  lunar: LunarPhaseInfo;
  ascendant: { sign: string; deg: number; min: number };
  midheaven: { sign: string; deg: number; min: number };
  passthroughActive: boolean;
  setPassthroughActive: (active: boolean) => void;
  anchorMode: 'loft' | 'room' | 'celestial_zenith';
  setAnchorMode: (mode: 'loft' | 'room' | 'celestial_zenith') => void;
}

export const CelestialOrbitalMandala: React.FC<CelestialOrbitalMandalaProps> = ({
  bodies,
  aspects,
  lunar,
  ascendant,
  midheaven,
  passthroughActive,
  setPassthroughActive,
  anchorMode,
}) => {
  const [selectedPlanet, setSelectedPlanet] = useState<CelestialBody | null>(bodies[0] || null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showAspectLines, setShowAspectLines] = useState(true);
  const [showQliphoticNames, setShowQliphoticNames] = useState(true);

  const rotateMandala = () => {
    setRotationAngle((prev) => (prev + 30) % 360);
    soundEffects.playHolographicChime(528);
  };

  const handleSelectPlanet = (body: CelestialBody) => {
    setSelectedPlanet(body);
    soundEffects.playHolographicChime(432);
  };

  return (
    <section className="flex flex-col items-center justify-between relative bg-black/30 border border-white/10 rounded-2xl p-6 backdrop-blur-xl h-full min-h-[480px]">
      {/* Top HUD Controls for AR Mandala */}
      <div className="w-full flex flex-wrap justify-between items-center gap-2 z-10 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <Orbit className="w-4 h-4 text-orange-500 animate-spin" style={{ animationDuration: '30s' }} />
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-orange-400">
            Holographic Celestial Array
          </span>
        </div>

        {/* Spatial Anchoring & Layer Toggles */}
        <div className="flex items-center gap-2">
          <button
            id="toggle-aspects-btn"
            onClick={() => setShowAspectLines(!showAspectLines)}
            className={`px-2 py-1 rounded text-[10px] font-mono border transition-colors ${
              showAspectLines ? 'bg-orange-950/70 border-orange-500 text-orange-300' : 'bg-white/5 border-white/10 text-gray-400'
            }`}
          >
            Aspect Vectors
          </button>
          <button
            id="toggle-qliphoth-btn"
            onClick={() => setShowQliphoticNames(!showQliphoticNames)}
            className={`px-2 py-1 rounded text-[10px] font-mono border transition-colors ${
              showQliphoticNames ? 'bg-purple-950/70 border-purple-500 text-purple-300' : 'bg-white/5 border-white/10 text-gray-400'
            }`}
          >
            Qliphotic Spires
          </button>

        </div>
      </div>

      {/* Center 3D/2D Holographic SVG Mandala */}
      <div className="relative w-full flex-1 flex items-center justify-center my-4 overflow-hidden">
        {/* Orbital Ring Container */}
        <div
          className="w-72 h-72 sm:w-96 sm:h-96 border border-white/10 rounded-full flex items-center justify-center relative transition-transform duration-500 select-none shadow-[0_0_50px_rgba(255,69,0,0.08)]"
          style={{
            transform: `scale(${zoomLevel}) rotate(${rotationAngle}deg)`,
          }}
        >
          {/* Subtle pulsating outer orbits */}
          <div className="absolute inset-0 border border-orange-500/20 rounded-full scale-110 animate-pulse"></div>
          <div className="absolute inset-0 border border-purple-500/20 rounded-full scale-125 pointer-events-none"></div>
          <div className="absolute inset-0 border border-white/5 rounded-full scale-75"></div>
          <div className="absolute inset-0 border border-white/5 rounded-full scale-50"></div>

          {/* SVG Mandala Vectors & Aspect Lines */}
          <svg viewBox="0 0 100 100" className="w-64 h-64 sm:w-80 sm:h-80 opacity-75 overflow-visible">
            {/* Outer Zodiac House Circle */}
            <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,140,0,0.25)" strokeWidth="0.4" strokeDasharray="1,1" />
            <circle cx="50" cy="50" r="28" fill="none" stroke="rgba(147,51,234,0.3)" strokeWidth="0.4" />
            <circle cx="50" cy="50" r="14" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.3" />

            {/* Quadrant Axis Lines */}
            <line x1="50" y1="4" x2="50" y2="96" stroke="rgba(255,69,0,0.3)" strokeWidth="0.4" />
            <line x1="4" y1="50" x2="96" y2="50" stroke="rgba(255,69,0,0.3)" strokeWidth="0.4" />
            <line x1="17.5" y1="17.5" x2="82.5" y2="82.5" stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" strokeDasharray="1,2" />
            <line x1="82.5" y1="17.5" x2="17.5" y2="82.5" stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" strokeDasharray="1,2" />

            {/* Cardinal House Roman Numerals */}
            <g className="text-[3.5px] font-mono fill-orange-400 font-bold select-none text-center">
              <text x="48.5" y="11">X (MC)</text>
              <text x="84" y="51.5">VII (DSC)</text>
              <text x="47.5" y="93">IV (IC)</text>
              <text x="6" y="51.5">I (ASC)</text>
            </g>

            {/* High-Tension Aspect Lines between planets */}
            {showAspectLines &&
              aspects.slice(0, 8).map((asp, idx) => {
                const b1 = bodies.find((b) => b.name === asp.planet1);
                const b2 = bodies.find((b) => b.name === asp.planet2);
                if (!b1 || !b2) return null;
                const deg1 = (b1.degree + (b1.house * 30)) * (Math.PI / 180);
                const deg2 = (b2.degree + (b2.house * 30)) * (Math.PI / 180);
                const x1 = 50 + 38 * Math.cos(deg1);
                const y1 = 50 + 38 * Math.sin(deg1);
                const x2 = 50 + 38 * Math.cos(deg2);
                const y2 = 50 + 38 * Math.sin(deg2);

                const strokeColor =
                  asp.aspectType === 'Square'
                    ? 'rgba(239,68,68,0.5)'
                    : asp.aspectType === 'Opposition'
                    ? 'rgba(249,115,22,0.5)'
                    : 'rgba(59,130,246,0.35)';

                return (
                  <line
                    key={`asp_${idx}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={strokeColor}
                    strokeWidth={asp.aspectType === 'Square' ? '0.7' : '0.4'}
                    strokeDasharray={asp.aspectType === 'Square' ? 'none' : '1,1'}
                  />
                );
              })}

            {/* Planetary Nodes positioned dynamically */}
            {bodies.map((body, idx) => {
              const angle = ((idx * 36 + body.degree * 2.5) % 360) * (Math.PI / 180);
              const radius = 22 + (idx % 3) * 8;
              const cx = 50 + radius * Math.cos(angle);
              const cy = 50 + radius * Math.sin(angle);
              const isSelected = selectedPlanet?.name === body.name;

              return (
                <g
                  key={body.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPlanet(body);
                  }}
                  className="cursor-pointer transition-transform hover:scale-125 group"
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 4.5 : 3.2}
                    fill={isSelected ? '#ff4500' : '#1a0b2e'}
                    stroke={isSelected ? '#ffffff' : '#f97316'}
                    strokeWidth={isSelected ? '0.8' : '0.5'}
                    className="drop-shadow-[0_0_4px_rgba(255,69,0,0.8)]"
                  />
                  <text
                    x={cx}
                    y={cy + 1.2}
                    textAnchor="middle"
                    className="text-[3.2px] fill-white font-bold pointer-events-none select-none"
                  >
                    {body.symbol}
                  </text>
                </g>
              );
            })}

            {/* Center Solar / Lunar Core */}
            <circle cx="50" cy="50" r="4" fill="#ff4500" className="animate-ping opacity-25" />
            <circle cx="50" cy="50" r="3.5" fill="#000000" stroke="#f97316" strokeWidth="0.8" />
            <circle cx="50" cy="50" r="1.5" fill="#ffffff" />
          </svg>

          {/* AR Anchor Status Pill overlay */}
          <div className="absolute bottom-[-18px] bg-orange-950/80 border border-orange-500 text-orange-200 px-5 py-1.5 rounded-full backdrop-blur-md text-[10px] uppercase tracking-[0.3em] font-mono shadow-[0_0_15px_rgba(255,69,0,0.3)] flex items-center gap-2">
            <Anchor className="w-3 h-3 text-orange-400 animate-pulse" />
            AR ANCHOR: {anchorMode.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Selected Planet Esoteric Details & Quick Gesture Bar */}
      <div className="w-full bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-md mt-2 flex flex-col sm:flex-row justify-between items-center gap-3">
        {selectedPlanet ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-950/80 border border-orange-700 flex items-center justify-center text-lg text-orange-400 font-bold font-mono">
              {selectedPlanet.symbol}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase font-mono">{selectedPlanet.name}</span>
                <span className="text-[10px] text-orange-300 font-mono">
                  {selectedPlanet.sign} {selectedPlanet.degree}°{selectedPlanet.minute}' (House {selectedPlanet.house})
                </span>
                {selectedPlanet.isRetrograde && (
                  <span className="text-[9px] px-1.5 py-0.2 bg-red-950 text-red-400 border border-red-800 rounded font-mono">
                    RETROGRADE
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gray-300 font-mono">
                {showQliphoticNames ? `Qlipha: ${selectedPlanet.qliphoticSphere}` : selectedPlanet.archetype}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-400 font-mono">Click or air-tap any planetary node to inspect esoteric vectors</p>
        )}

        {/* Hologram Controls */}
        <div className="flex items-center gap-1.5 font-mono">
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
            className="p-1.5 bg-white/5 hover:bg-white/15 rounded border border-white/10 text-gray-300"
            title="Zoom In Hologram"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
            className="p-1.5 bg-white/5 hover:bg-white/15 rounded border border-white/10 text-gray-300"
            title="Zoom Out Hologram"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={rotateMandala}
            className="p-1.5 bg-white/5 hover:bg-white/15 rounded border border-white/10 text-orange-400"
            title="Rotate Celestial Sphere +30°"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setPassthroughActive(!passthroughActive)}
            className="flex items-center gap-1 px-2.5 py-1 bg-orange-600/30 hover:bg-orange-600/50 border border-orange-500 rounded text-[10px] uppercase text-orange-200"
          >
            <Eye className="w-3 h-3" />
            <span>AR Mode</span>
          </button>
        </div>
      </div>
    </section>
  );
};
