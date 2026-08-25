import React, { useEffect, useState, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, Check, HelpCircle } from 'lucide-react';
import { soundEffects } from '../utils/telemetry';

// SpeechRecognition type declarations for browsers
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

interface VoiceCommandControllerProps {
  isListening: boolean;
  setIsListening: (val: boolean) => void;
  onCommand: (command: string) => void;
}

export const VoiceCommandController: React.FC<VoiceCommandControllerProps> = ({
  isListening,
  setIsListening,
  onCommand,
}) => {
  const [lastSpoken, setLastSpoken] = useState<string>('');
  const [commandFeedback, setCommandFeedback] = useState<string>('Voice engine on standby. Say "Strike", "AR Mode", "Export", etc.');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const win = window as unknown as IWindow;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setCommandFeedback('Web Speech API not supported in this browser environment; use on-screen triggers.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript.toLowerCase().trim();
      setLastSpoken(transcript);
      processVoiceCommand(transcript);
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition status:', event.error);
      if (event.error === 'not-allowed') {
        setIsListening(false);
        setCommandFeedback('Microphone permission required for voice commands.');
      }
    };

    recognition.onend = () => {
      if (isListening) {
        try {
          recognition.start();
        } catch {
          // ignore
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {
        // ignore
      }
    };
  }, []);

  useEffect(() => {
    if (!recognitionRef.current) return;
    if (isListening) {
      try {
        recognitionRef.current.start();
        setCommandFeedback('Listening for hands-free voice command...');
        soundEffects.playHolographicChime(580);
      } catch {
        // already started
      }
    } else {
      try {
        recognitionRef.current.stop();
        setCommandFeedback('Voice commands suspended.');
      } catch {
        // already stopped
      }
    }
  }, [isListening]);

  const processVoiceCommand = (text: string) => {
    let matched = false;

    if (text.includes('strike') || text.includes('punch') || text.includes('hit') || text.includes('jab')) {
      onCommand('punch');
      setCommandFeedback('Voice recognized: Executed strike telemetry!');
      matched = true;
    } else if (text.includes('passthrough') || text.includes('ar mode') || text.includes('camera') || text.includes('eye')) {
      onCommand('toggle_passthrough');
      setCommandFeedback('Voice recognized: Toggled AR Passthrough mode.');
      matched = true;
    } else if (text.includes('export') || text.includes('pdf') || text.includes('report') || text.includes('download')) {
      onCommand('export_pdf');
      setCommandFeedback('Voice recognized: Exporting high-resolution dossier PDF.');
      matched = true;
    } else if (text.includes('natal') || text.includes('chart') || text.includes('transit') || text.includes('astrology')) {
      onCommand('nav_natal');
      setCommandFeedback('Voice recognized: Navigated to Natal Chart & Transits.');
      matched = true;
    } else if (text.includes('combat') || text.includes('telemetry') || text.includes('speed')) {
      onCommand('nav_combat');
      setCommandFeedback('Voice recognized: Navigated to Combat Telemetry.');
      matched = true;
    } else if (text.includes('barbell') || text.includes('qigong') || text.includes('qi gong') || text.includes('exercise')) {
      onCommand('nav_qigong');
      setCommandFeedback('Voice recognized: Navigated to 6ft Zinc Qi-Gong.');
      matched = true;
    } else if (text.includes('discord') || text.includes('share')) {
      onCommand('share_discord');
      setCommandFeedback('Voice recognized: Opening Discord share modal.');
      matched = true;
    } else if (text.includes('chant') || text.includes('invocation') || text.includes('true name') || text.includes('formula')) {
      onCommand('chant_invocation');
      setCommandFeedback('Voice recognized: Reciting Daily Affirmation.');
      matched = true;
    } else if (text.includes('reset') || text.includes('recalibrate') || text.includes('zero')) {
      onCommand('recalibrate');
      setCommandFeedback('Voice recognized: Recalibrated spatial coordinates.');
      matched = true;
    }

    if (matched) {
      soundEffects.playHolographicChime(741);
    } else {
      setCommandFeedback(`Heard: "${text}" (Try "Strike", "AR Mode", "Export PDF")`);
    }
  };

  return (
    <div className="bg-black/80 border border-white/10 rounded-xl px-4 py-2 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsListening(!isListening)}
          className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
            isListening
              ? 'bg-red-900/80 border-red-500 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.6)] animate-pulse'
              : 'bg-white/5 border-white/20 text-gray-400 hover:text-white'
          }`}
          title="Toggle Voice Engine"
        >
          {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </button>

        <div className="space-y-0.5">
          <p className="text-[10px] uppercase text-orange-400 font-bold tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-orange-500" />
            Hands-Free Voice Command Engine
          </p>
          <p className="text-gray-300 text-[11px]">{commandFeedback}</p>
        </div>
      </div>

      {/* Quick speech sample chips */}
      <div className="hidden md:flex items-center gap-1 text-[9px] text-gray-400">
        <span className="text-gray-500">Say:</span>
        {['"Strike"', '"AR Mode"', '"Export PDF"', '"Qi Gong"', '"Chant"'].map((chip) => (
          <button
            key={chip}
            onClick={() => processVoiceCommand(chip.replace(/"/g, ''))}
            className="px-2 py-0.5 rounded bg-white/5 hover:bg-orange-500/20 border border-white/10 text-orange-200/90 font-mono transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
};
