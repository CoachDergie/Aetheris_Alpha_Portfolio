import React, { useState } from 'react';
import { NatalData } from '../types';
import { Calendar, Clock, MapPin, X, Check } from 'lucide-react';

interface NatalCalibrateModalProps {
  isOpen: boolean;
  onClose: () => void;
  natal: NatalData;
  onSave: (updated: NatalData) => void;
}

const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export const NatalCalibrateModal: React.FC<NatalCalibrateModalProps> = ({
  isOpen,
  onClose,
  natal,
  onSave,
}) => {
  if (!isOpen) return null;

  const [selYear, setSelYear] = useState<number>(parseInt(natal.birthDate.substring(0, 4)) || 1996);
  const [selMonth, setSelMonth] = useState<number>(parseInt(natal.birthDate.substring(5, 7)) || 10);
  const [selDay, setSelDay] = useState<number>(parseInt(natal.birthDate.substring(8, 10)) || 31);

  const initialHour = parseInt(natal.birthTime.substring(0, 2)) || 3;
  const initialMin = parseInt(natal.birthTime.substring(3, 5)) || 33;
  const [selHour, setSelHour] = useState<number>(initialHour % 12 === 0 ? 12 : initialHour % 12);
  const [selMin, setSelMin] = useState<number>(initialMin);
  const [selAmPm, setSelAmPm] = useState<'AM' | 'PM'>(initialHour >= 12 ? 'PM' : 'AM');
  const [city, setCity] = useState<string>(natal.birthCity || 'Alexandria');
  const [country, setCountry] = useState<string>(natal.birthCountry || 'Occult Coordinates');

  const handleApply = () => {
    const formattedMonth = selMonth.toString().padStart(2, '0');
    const formattedDay = selDay.toString().padStart(2, '0');
    const formattedDate = `${selYear}-${formattedMonth}-${formattedDay}`;

    let militaryHour = selHour;
    if (selAmPm === 'AM' && selHour === 12) militaryHour = 0;
    if (selAmPm === 'PM' && selHour !== 12) militaryHour = selHour + 12;
    const formattedTime = `${militaryHour.toString().padStart(2, '0')}:${selMin.toString().padStart(2, '0')}`;

    onSave({
      ...natal,
      birthDate: formattedDate,
      birthTime: formattedTime,
      birthCity: city,
      birthCountry: country,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-[#121626] border-2 border-[#00e5ff] rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,229,255,0.4)] text-gray-200 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cyan-500/30">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#00e5ff]" />
            <h2 className="text-xl font-black tracking-widest uppercase text-[#00e5ff] font-mono">
              CALIBRATE ORIGIN
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 space-y-6">
          {/* 1. Date of Inception */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold font-mono text-gray-400 uppercase tracking-wider mb-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>DATE OF INCEPTION</span>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-black/50 border border-gray-700 rounded-xl text-center">
                <span className="text-[10px] text-gray-400 uppercase">YEAR</span>
                <div className="text-lg font-black text-white font-mono my-1">{selYear}</div>
                <div className="flex justify-center gap-2">
                  <button 
                    onClick={() => setSelYear((y) => Math.max(1900, y - 1))}
                    className="px-2 py-1 bg-white/10 hover:bg-cyan-900 rounded text-xs font-mono font-bold"
                  >
                    -
                  </button>
                  <button 
                    onClick={() => setSelYear((y) => Math.min(2030, y + 1))}
                    className="px-2 py-1 bg-white/10 hover:bg-cyan-900 rounded text-xs font-mono font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="p-3 bg-black/50 border border-gray-700 rounded-xl text-center">
                <span className="text-[10px] text-gray-400 uppercase">MONTH</span>
                <div className="text-lg font-black text-cyan-300 font-mono my-1">
                  {MONTH_NAMES[selMonth - 1]}
                </div>
                <div className="flex justify-center gap-2">
                  <button 
                    onClick={() => setSelMonth((m) => (m === 1 ? 12 : m - 1))}
                    className="px-2 py-1 bg-white/10 hover:bg-cyan-900 rounded text-xs font-mono font-bold"
                  >
                    -
                  </button>
                  <button 
                    onClick={() => setSelMonth((m) => (m === 12 ? 1 : m + 1))}
                    className="px-2 py-1 bg-white/10 hover:bg-cyan-900 rounded text-xs font-mono font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="p-3 bg-black/50 border border-gray-700 rounded-xl text-center">
                <span className="text-[10px] text-gray-400 uppercase">DAY</span>
                <div className="text-lg font-black text-white font-mono my-1">
                  {selDay.toString().padStart(2, '0')}
                </div>
                <div className="flex justify-center gap-2">
                  <button 
                    onClick={() => setSelDay((d) => (d === 1 ? 31 : d - 1))}
                    className="px-2 py-1 bg-white/10 hover:bg-cyan-900 rounded text-xs font-mono font-bold"
                  >
                    -
                  </button>
                  <button 
                    onClick={() => setSelDay((d) => (d === 31 ? 1 : d + 1))}
                    className="px-2 py-1 bg-white/10 hover:bg-cyan-900 rounded text-xs font-mono font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Temporal Vectors (Time) */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold font-mono text-gray-400 uppercase tracking-wider mb-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>TEMPORAL VECTORS (TIME UTC)</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-black/50 border border-gray-700 rounded-xl text-center">
                <span className="text-[10px] text-gray-400 uppercase">HOUR</span>
                <div className="text-lg font-black text-white font-mono my-1">
                  {selHour.toString().padStart(2, '0')}
                </div>
                <div className="flex justify-center gap-2">
                  <button 
                    onClick={() => setSelHour((h) => (h === 1 ? 12 : h - 1))}
                    className="px-2 py-1 bg-white/10 hover:bg-cyan-900 rounded text-xs font-mono font-bold"
                  >
                    -
                  </button>
                  <button 
                    onClick={() => setSelHour((h) => (h === 12 ? 1 : h + 1))}
                    className="px-2 py-1 bg-white/10 hover:bg-cyan-900 rounded text-xs font-mono font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="p-3 bg-black/50 border border-gray-700 rounded-xl text-center">
                <span className="text-[10px] text-gray-400 uppercase">MINUTE</span>
                <div className="text-lg font-black text-white font-mono my-1">
                  {selMin.toString().padStart(2, '0')}
                </div>
                <div className="flex justify-center gap-2">
                  <button 
                    onClick={() => setSelMin((m) => (m === 0 ? 55 : m - 5))}
                    className="px-2 py-1 bg-white/10 hover:bg-cyan-900 rounded text-xs font-mono font-bold"
                  >
                    -5
                  </button>
                  <button 
                    onClick={() => setSelMin((m) => (m >= 55 ? 0 : m + 5))}
                    className="px-2 py-1 bg-white/10 hover:bg-cyan-900 rounded text-xs font-mono font-bold"
                  >
                    +5
                  </button>
                </div>
              </div>

              <div className="p-3 bg-black/50 border border-gray-700 rounded-xl text-center flex flex-col justify-between">
                <span className="text-[10px] text-gray-400 uppercase">PERIOD</span>
                <button
                  onClick={() => setSelAmPm((p) => (p === 'AM' ? 'PM' : 'AM'))}
                  className="w-full py-2 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 rounded-lg text-sm font-black text-cyan-300 font-mono"
                >
                  {selAmPm}
                </button>
              </div>
            </div>
          </div>

          {/* 3. Spatial Sector (City) */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold font-mono text-gray-400 uppercase tracking-wider mb-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>SPATIAL SECTOR (CITY / REGION)</span>
            </div>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-2.5 bg-black/60 border border-cyan-500/40 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.15)]"
              placeholder="e.g. Alexandria, Cairo, Tokyo, Athens"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-700 hover:bg-white/5 text-gray-400 font-mono text-xs font-bold uppercase transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00e5ff] hover:bg-cyan-400 text-black font-mono text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(0,229,255,0.6)] transition-all"
          >
            <Check className="w-4 h-4" />
            <span>CALIBRATE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
