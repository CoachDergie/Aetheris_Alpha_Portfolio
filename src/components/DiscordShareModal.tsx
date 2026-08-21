import React, { useState } from 'react';
import { CelestialBody, PlanetaryAspect, LunarPhaseInfo, NatalData, PunchTelemetry, QiGongBarbellSession } from '../types';
import { X, Copy, Check, Share2, Send, ExternalLink } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const avgSpeed = punches.length > 0 ? (punches.reduce((a, b) => a + b.speedMs, 0) / punches.length).toFixed(1) : '7.4';
  const topSquare = aspects.find((a) => a.aspectType === 'Square') || aspects[0];

  const discordFormattedMessage = `
\`\`\`ansi
[1;33m[AETHERIS V.1 // OCCULT & MARTIAL DOSSIER][0m
[1;35mSubject Natal:[0m ${natal.birthCity || 'Unknown'}, ${natal.birthDate} | Lunar: ${lunar.phaseName} (${lunar.illumination}%) in ${lunar.currentSign}
[1;31mTop Aspect:[0m ${topSquare ? `${topSquare.planet1} ${topSquare.aspectType} ${topSquare.planet2} (${topSquare.intensity})` : 'Harmonic Alignment'}

[1;32m[COMBAT TELEMETRY][0m
• Peak Strike Speed: ${avgSpeed} m/s
• 6ft Zinc Barbell Load: ${session.barbellWeightKg} kg (${session.movementName})
• Session Energy: ${(punches.reduce((s, p) => s + p.energyKcal, 0) + session.estimatedKcal).toFixed(1)} kCal
• Planetary Correspondence: ${bodies[0]?.name} in ${bodies[0]?.sign} [${bodies[0]?.qliphoticSphere}]
\`\`\`
*Generated via OpenXR Immersive Telemetry Node*
  `.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(discordFormattedMessage);
    setCopied(true);
    soundEffects.playHolographicChime(880);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendWebhook = async () => {
    if (!webhookUrl.trim().startsWith('https://discord.com/api/webhooks/')) {
      setWebhookStatus('Please provide a valid Discord Webhook URL (https://discord.com/api/webhooks/...)');
      return;
    }

    setIsSendingWebhook(true);
    setWebhookStatus('Dispatching occult telemetry to Discord channel...');

    try {
      const payload = {
        username: 'Aetheris Occult Telemetry Node',
        avatar_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=128&auto=format&fit=crop&q=80',
        content: `**🌌 [AETHERIS V.1 OCCULT & COMBAT REPORT]**\n${discordFormattedMessage}`,
        embeds: [
          {
            title: `Planetary Alignment & Qi-Gong Telemetry: ${natal.birthCity}`,
            color: 16729856, // Orange
            fields: [
              { name: 'Lunar Phase', value: `${lunar.phaseName} (${lunar.illumination}%)`, inline: true },
              { name: 'Strike Velocity', value: `${avgSpeed} m/s`, inline: true },
              { name: 'Zinc Bar Load', value: `6ft | ${session.barbellWeightKg}kg`, inline: true },
              { name: 'Top Tension Square', value: topSquare ? `${topSquare.planet1} ${topSquare.aspectType} ${topSquare.planet2}` : 'None', inline: false }
            ],
            footer: { text: 'OpenXR Encrypted Astrological Array' },
            timestamp: new Date().toISOString()
          }
        ]
      };

      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setWebhookStatus('Successfully transmitted to Discord channel!');
        soundEffects.playHolographicChime(960);
      } else {
        setWebhookStatus(`Discord returned error code: ${res.status}`);
      }
    } catch (err) {
      setWebhookStatus('Failed to send webhook (CORS or network policy). Copied to clipboard instead!');
      handleCopy();
    } finally {
      setIsSendingWebhook(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85">
      <div className="bg-[#120822] border border-orange-500/40 rounded-2xl p-6 max-w-lg w-full shadow-[0_0_40px_rgba(255,69,0,0.3)] font-mono text-xs">
        <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Share Planetary Reading via Discord
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Discord Preview Box */}
        <div className="mb-4">
          <label className="text-[10px] uppercase text-gray-400 block mb-1">
            Discord Rich Text Embed
          </label>
          <pre className="p-3 bg-black/70 border border-white/10 rounded-xl text-[10px] text-gray-200 overflow-x-auto whitespace-pre-wrap">
            {discordFormattedMessage}
          </pre>
        </div>

        {/* Copy to Clipboard Button */}
        <button
          onClick={handleCopy}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 mb-4 transition-colors shadow-[0_0_12px_rgba(99,102,241,0.4)]"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied to Clipboard!' : 'Copy Discord Formatted Message'}</span>
        </button>

        {/* Direct Webhook Sender */}
        <div className="pt-3 border-t border-white/10 space-y-2">
          <label className="text-[10px] uppercase text-gray-400 block">
            Direct Webhook Integration (Optional)
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://discord.com/api/webhooks/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="flex-1 bg-black/60 border border-white/15 rounded-lg px-2.5 py-1.5 text-white text-[11px] outline-none focus:border-indigo-400"
            />
            <button
              onClick={handleSendWebhook}
              disabled={isSendingWebhook}
              className="px-4 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSendingWebhook ? 'Sending...' : 'Send'}</span>
            </button>
          </div>
          {webhookStatus && (
            <p className="text-[10px] text-orange-300 mt-1">{webhookStatus}</p>
          )}
        </div>
      </div>
    </div>
  );
};
