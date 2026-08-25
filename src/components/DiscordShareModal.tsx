import React, { useState } from 'react';
import { NatalData, CelestialBody, PlanetaryAspect, LunarPhaseInfo, PunchTelemetry, QiGongBarbellSession } from '../types';
import { Share2, Copy, Check, X, ShieldAlert } from 'lucide-react';
import { soundEffects } from '../utils/telemetry';

interface DiscordShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  natal: NatalData;
  bodies: CelestialBody[];
  aspects: PlanetaryAspect[];
  lunar: LunarPhaseInfo;
  punches: PunchTelemetry[];
  session: QiGongBarbellSession;
}

export const DiscordShareModal: React.FC<DiscordShareModalProps> = ({
  isOpen,
  onClose,
  natal,
  bodies,
  aspects,
  lunar,
  punches,
  session,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [includeNatal, setIncludeNatal] = useState<boolean>(true);
  const [includeLunar, setIncludeLunar] = useState<boolean>(true);
  const [includeCombat, setIncludeCombat] = useState<boolean>(true);
  const [includeQiGong, setIncludeQiGong] = useState<boolean>(true);

  if (!isOpen) return null;

  const generateDiscordMarkdown = () => {
    let md = `\`\`\`ansi\n\u001b[1;36m⚡ AETHERIS // TRANSMISSION DOSSIER ⚡\u001b[0m\n`;
    md += `\u001b[0;33mTimestamp:\u001b[0m ${new Date().toISOString()}\n`;
    md += `---------------------------------------------------\n\`\`\`\n\n`;

    if (includeNatal) {
      md += `**🌌 INCEPTION MANDALA**\n`;
      md += `> **Planetary Positions**:\n`;
      bodies.slice(0, 5).forEach((b) => {
        md += `> • **${b.symbol} ${b.name}**: \`${b.sign} ${b.degree}°${b.minute}'\` (${b.qliphoticSphere || 'Neutral'})\n`;
      });
      md += `\n`;
    }

    if (includeLunar) {
      md += `**🌙 LIVE LUNAR VECTOR**\n`;
      md += `> **Phase**: \`${lunar.phaseName}\` (${lunar.illumination}% Illumination)\n`;
      md += `> **Zodiac**: \`${lunar.currentSign}\` | **Moon Age**: \`${lunar.ageDays.toFixed(1)} Days\`\n`;
      md += `> **Void of Course**: \`${lunar.isVoidOfCourse ? 'ACTIVE' : 'INACTIVE'}\`\n\n`;
    }

    if (includeCombat && punches.length > 0) {
      const avgSpeed = punches.reduce((acc, p) => acc + p.speedMs, 0) / punches.length;
      const peakForce = Math.max(...punches.map((p) => p.impactForceJoules));
      md += `**🥊 MARTIAL COMBAT TELEMETRY**\n`;
      md += `> **Strikes Logged**: \`${punches.length}\`\n`;
      md += `> **Mean Velocity**: \`${avgSpeed.toFixed(2)} m/s\` | **Peak Impact**: \`${peakForce.toFixed(1)} Joules\`\n`;
      md += `> **Recent Strike**: \`${punches[0].type}\` (\`${punches[0].speedMs.toFixed(1)} m/s\` in \`${punches[0].returnTimeSec.toFixed(2)}s\`)\n\n`;
    }

    if (includeQiGong) {
      md += `**⚡ QI-GONG BARBELL KINETICS**\n`;
      md += `> **Form**: \`${session.movementName}\`\n`;
      md += `> **Barbell**: \`${session.barbellWeightKg}kg (${session.barbellLengthFt}ft)\` | **Volume**: \`${session.sets} sets × ${session.reps} reps\`\n`;
      md += `> **Planetary Alignment**: \`${session.associatedPlanetaryHour}\`\n\n`;
    }

    md += `*Generated via Aetheris for Meta Quest XR // End Transmission*`;
    return md;
  };

  const handleCopy = () => {
    const text = generateDiscordMarkdown();
    navigator.clipboard.writeText(text);
    setCopied(true);
    soundEffects.playHolographicChime(880);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131824]/90">
      <div className="bg-[#1E2638] border border-[#2E3B57] rounded-2xl p-6 max-w-lg w-full shadow-[0_4px_30px_rgba(0,0,0,0.6)] font-mono text-xs">
        <div className="flex justify-between items-center border-b border-[#2A3650] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              DISCORD TELEMETRY DOSSIER
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modular Inclusion Toggles */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <label className="flex items-center gap-2 p-2 bg-[#161B26] border border-[#2E3B57] rounded-xl cursor-pointer hover:border-cyan-500/50">
            <input
              type="checkbox"
              checked={includeNatal}
              onChange={(e) => setIncludeNatal(e.target.checked)}
              className="accent-cyan-400"
            />
            <span className="text-gray-300">Natal Mandala</span>
          </label>
          <label className="flex items-center gap-2 p-2 bg-[#161B26] border border-[#2E3B57] rounded-xl cursor-pointer hover:border-yellow-500/50">
            <input
              type="checkbox"
              checked={includeLunar}
              onChange={(e) => setIncludeLunar(e.target.checked)}
              className="accent-yellow-400"
            />
            <span className="text-gray-300">Lunar Vector</span>
          </label>
          <label className="flex items-center gap-2 p-2 bg-[#161B26] border border-[#2E3B57] rounded-xl cursor-pointer hover:border-cyan-500/50">
            <input
              type="checkbox"
              checked={includeCombat}
              onChange={(e) => setIncludeCombat(e.target.checked)}
              className="accent-cyan-400"
            />
            <span className="text-gray-300">Combat Kinetics</span>
          </label>
          <label className="flex items-center gap-2 p-2 bg-[#161B26] border border-[#2E3B57] rounded-xl cursor-pointer hover:border-emerald-500/50">
            <input
              type="checkbox"
              checked={includeQiGong}
              onChange={(e) => setIncludeQiGong(e.target.checked)}
              className="accent-emerald-400"
            />
            <span className="text-gray-300">Qi-Gong Barbell</span>
          </label>
        </div>

        {/* Formatted Preview Box */}
        <div className="bg-[#161B26] border border-[#2E3B57] rounded-xl p-3 max-h-48 overflow-y-auto text-[11px] text-gray-300 whitespace-pre-wrap font-mono mb-4">
          {generateDiscordMarkdown()}
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'COPIED TO CLIPBOARD' : 'COPY DISCORD MARKDOWN'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-[#161B26] border border-[#2E3B57] text-gray-400 hover:text-white font-bold uppercase transition-all"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
