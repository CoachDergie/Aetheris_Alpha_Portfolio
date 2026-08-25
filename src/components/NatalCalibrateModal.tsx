import React, { useState } from 'react';
import { NatalData } from '../types';
import { MapPin, Calendar, Clock, Sparkles, X, Check } from 'lucide-react';
import { soundEffects } from '../utils/telemetry';

interface NatalCalibrateModalProps {
  isOpen: boolean;
  onClose: () => void;
  natal: NatalData;
  onSave: (updated: NatalData) => void;
}

export const NatalCalibrateModal: React.FC<NatalCalibrateModalProps> = ({
  isOpen,
  onClose,
  natal,
  onSave,
}) => {
  const [formData, setFormData] = useState<NatalData>({ ...natal });

  if (!isOpen) return null;

  const handleChange = (field: keyof NatalData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.playHolographicChime(741);
    onSave(formData);
    onClose();
  };

  const handleSetAlexandriaPreset = () => {
    setFormData({
      birthDate: '1996-10-31',
      birthTime: '03:33',
      birthCity: 'Alexandria',
      birthCountry: 'Esoteric Coordinates',
      latitude: 31.2001,
      longitude: 29.9187,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#131824]/90 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#1E2638] border-2 border-[#00e5ff] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_0_50px_rgba(0,229,255,0.4)] text-gray-200 font-sans my-auto max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2A3650]">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#ffd700] shrink-0" />
            <h2 className="text-sm sm:text-base font-black font-mono tracking-wider text-[#00e5ff] uppercase truncate">
              CALIBRATE INCEPTION ORIGIN
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3 sm:space-y-4 font-mono text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Birth Date */}
            <div className="space-y-1">
              <label className="text-gray-300 font-bold uppercase tracking-wider flex items-center gap-1.5 text-[10px] sm:text-xs">
                <Calendar className="w-3.5 h-3.5 text-[#ffd700]" />
                <span>BIRTH DATE</span>
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleChange('birthDate', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#2E3B57] text-white focus:outline-none focus:border-[#00e5ff]"
                required
              />
            </div>

            {/* Birth Time */}
            <div className="space-y-1">
              <label className="text-gray-300 font-bold uppercase tracking-wider flex items-center gap-1.5 text-[10px] sm:text-xs">
                <Clock className="w-3.5 h-3.5 text-[#ffd700]" />
                <span>BIRTH TIME (24H UTC)</span>
              </label>
              <input
                type="time"
                value={formData.birthTime}
                onChange={(e) => handleChange('birthTime', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#2E3B57] text-white focus:outline-none focus:border-[#00e5ff]"
                required
              />
            </div>
          </div>

          {/* Birth City & Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-gray-300 font-bold uppercase tracking-wider flex items-center gap-1.5 text-[10px] sm:text-xs">
                <MapPin className="w-3.5 h-3.5 text-[#00e5ff]" />
                <span>BIRTH CITY</span>
              </label>
              <input
                type="text"
                value={formData.birthCity}
                onChange={(e) => handleChange('birthCity', e.target.value)}
                placeholder="e.g. London, Alexandria"
                className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#2E3B57] text-white focus:outline-none focus:border-[#00e5ff]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-300 font-bold uppercase tracking-wider text-[10px] sm:text-xs">
                COUNTRY / REALM
              </label>
              <input
                type="text"
                value={formData.birthCountry}
                onChange={(e) => handleChange('birthCountry', e.target.value)}
                placeholder="e.g. UK, Egypt, Terrestrial"
                className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#2E3B57] text-white focus:outline-none focus:border-[#00e5ff]"
              />
            </div>
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-gray-400 font-bold uppercase text-[10px]">
                LATITUDE (°N/S)
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.latitude}
                onChange={(e) => handleChange('latitude', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#2E3B57] text-white focus:outline-none focus:border-[#00e5ff]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-400 font-bold uppercase text-[10px]">
                LONGITUDE (°E/W)
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.longitude}
                onChange={(e) => handleChange('longitude', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-[#161B26] border border-[#2E3B57] text-white focus:outline-none focus:border-[#00e5ff]"
                required
              />
            </div>
          </div>

          {/* Presets */}
          <div className="pt-1 flex items-center justify-between">
            <button
              type="button"
              onClick={handleSetAlexandriaPreset}
              className="text-[10px] sm:text-xs text-cyan-400 hover:text-cyan-300 underline font-mono"
            >
              Reset to Esoteric Default (Alexandria)
            </button>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2 sm:gap-3 border-t border-[#2A3650]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#161B26] border border-[#2E3B57] text-gray-400 hover:text-white font-bold transition-all text-xs"
            >
              CANCEL
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-1.5 sm:py-2 rounded-xl bg-[#00e5ff] hover:bg-cyan-400 text-black font-black uppercase tracking-wider shadow-[0_0_20px_rgba(0,229,255,0.6)] transition-all hover:scale-105 text-xs"
            >
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>ALIGN VECTORS</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
