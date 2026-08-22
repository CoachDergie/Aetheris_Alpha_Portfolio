import React from 'react';
import { ShieldAlert, Check } from 'lucide-react';

interface ContentWarningModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export const ContentWarningModal: React.FC<ContentWarningModalProps> = ({ isOpen, onAccept }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#131824]/95 backdrop-blur-sm">
      <div className="bg-[#1E2638] border border-cyan-500/30 rounded-2xl p-8 max-w-xl w-full shadow-[0_4px_50px_rgba(0,229,255,0.15)] font-mono text-sm">
        <div className="flex items-center gap-3 mb-6">
          <ShieldAlert className="w-8 h-8 text-cyan-400" />
          <h2 className="text-xl font-black text-white uppercase tracking-widest">
            Protocol Overview
          </h2>
        </div>
        
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            Welcome to <span className="font-bold text-white">AETHERIS</span>.
          </p>
          <p>
            This application blends real-time physical training telemetry (such as kinetic combat metrics and Qi-Gong barbell conditioning) with symbolic frameworks drawn from ceremonial and chaos magick traditions.
          </p>
          <p>
            The invocations, astrological calculations, and qliphotic correspondences presented here are intended as conceptual tools for psychological focus and martial discipline. This synthesis is designed to empower your practice and is presented with deep respect for these esoteric traditions.
          </p>
        </div>

        <button
          onClick={onAccept}
          className="mt-8 w-full py-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(0,229,255,0.4)]"
        >
          <Check className="w-5 h-5" />
          <span>Acknowledge & Initialize</span>
        </button>
      </div>
    </div>
  );
};
