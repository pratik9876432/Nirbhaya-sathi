import React, { useState } from 'react';
import { 
  Flashlight, 
  Eye, 
  ShieldOff, 
  Sun, 
  Moon, 
  Smartphone, 
  Sparkles,
  Volume2,
  AlertOctagon,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { startPiercingAlarm, stopPiercingAlarm } from '../services/soundSynthesizer';

interface TacticalStrobeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TacticalStrobeModal({ isOpen, onClose }: TacticalStrobeModalProps) {
  const [isStrobeActive, setIsStrobeActive] = useState(false);
  const [strobeSpeed, setStrobeSpeed] = useState<'FAST' | 'HYPER' | 'SOS'>('HYPER');
  const [withAlarm, setWithAlarm] = useState(true);

  const toggleStrobe = () => {
    if (isStrobeActive) {
      setIsStrobeActive(false);
      stopPiercingAlarm();
    } else {
      setIsStrobeActive(true);
      if (withAlarm) {
        startPiercingAlarm('HIGH_ALARM');
      }
    }
  };

  const handleClose = () => {
    setIsStrobeActive(false);
    stopPiercingAlarm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-lg p-4">
        {/* Fullscreen blinding strobe flasher when active */}
        {isStrobeActive && (
          <div 
            onClick={toggleStrobe}
            className={`fixed inset-0 z-[120] cursor-pointer flex flex-col items-center justify-between p-8 ${
              strobeSpeed === 'HYPER' 
                ? 'animate-strobe-hyper' 
                : strobeSpeed === 'FAST' 
                ? 'animate-strobe-fast' 
                : 'animate-strobe-sos'
            }`}
          >
            <div className="text-center pt-8">
              <span className="bg-black/80 text-white px-6 py-2 rounded-full font-black text-sm tracking-widest uppercase border border-red-500 shadow-2xl">
                ⚠️ TACTICAL DISORIENTATION STROBE ACTIVE
              </span>
            </div>

            <div className="text-center space-y-2 bg-black/80 p-6 rounded-3xl border border-white/20 text-white max-w-sm">
              <AlertOctagon className="w-12 h-12 text-red-500 mx-auto animate-bounce" />
              <h3 className="text-xl font-black text-white">Point screen at attacker's eyes</h3>
              <p className="text-xs text-slate-300">
                High frequency flashes temporarily disorient vision and cause visual blindspots.
              </p>
              <p className="text-xs font-bold text-amber-400">
                (Tap anywhere to STOP Strobe)
              </p>
            </div>

            <button
              onClick={toggleStrobe}
              className="bg-red-600 hover:bg-red-500 text-white font-black text-base px-8 py-4 rounded-3xl shadow-2xl uppercase tracking-wider"
            >
              STOP STROBE
            </button>
          </div>
        )}

        {/* SETUP DIALOG */}
        {!isStrobeActive && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-slate-900 border border-slate-800 text-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Flashlight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Tactical Defense Strobe</h3>
                  <p className="text-xs text-slate-400">High-intensity screen & siren defense</p>
                </div>
              </div>
              <button onClick={handleClose} className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">Strobe Flash Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'HYPER', label: 'Hyper 20Hz', desc: 'Disorienting' },
                    { id: 'FAST', label: 'Fast 10Hz', desc: 'Attention' },
                    { id: 'SOS', label: 'Morse SOS', desc: 'Rescue' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setStrobeSpeed(m.id as any)}
                      className={`p-3 rounded-2xl text-left border transition-all ${
                        strobeSpeed === m.id
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-lg shadow-amber-500/20'
                          : 'bg-slate-800/80 border-slate-700 text-slate-300'
                      }`}
                    >
                      <p className="text-xs font-black">{m.label}</p>
                      <p className="text-[10px] opacity-80">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-800/60 rounded-2xl border border-slate-700">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-red-400" />
                  <div>
                    <p className="text-xs font-bold text-white">Simultaneous Piercing Alarm</p>
                    <p className="text-[10px] text-slate-400">Blasts max-volume screeching audio</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={withAlarm}
                  onChange={(e) => setWithAlarm(e.target.checked)}
                  className="w-5 h-5 accent-red-600 rounded cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={toggleStrobe}
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
            >
              <Flashlight className="w-5 h-5" />
              <span>Launch Tactical Strobe Now</span>
            </button>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
}
