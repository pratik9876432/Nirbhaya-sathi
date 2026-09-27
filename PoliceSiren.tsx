import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  AlertTriangle, 
  X, 
  ShieldAlert, 
  Zap, 
  Radio, 
  Sliders,
  Sparkles,
  Car,
  Upload,
  Music,
  Trash2,
  CheckCircle2,
  FileAudio
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  startPoliceSiren, 
  stopPoliceSiren, 
  isPoliceSirenPlaying, 
  PoliceSirenTone,
  setCustomSirenAudio,
  getCustomSirenAudio,
  removeCustomSirenAudio
} from '../services/soundSynthesizer';

const SIREN_TONES: { id: PoliceSirenTone; nameEn: string; nameBn: string; desc: string; icon: string }[] = [
  {
    id: 'KOLKATA_112',
    nameEn: 'WB Dial 112 / Kolkata Police',
    nameBn: 'কলকাতা পুলিশ ও ১১২ স্পেশাল',
    desc: 'Dual-frequency acoustic siren with sub-harmonic horn rumble standard for Bengal PCR units',
    icon: '🚨'
  },
  {
    id: 'YELP',
    nameEn: 'Indian PCR Yelp (Fast)',
    nameBn: 'ইন্ডিয়ান পুলিশ ইয়েলপ (দ্রুত)',
    desc: 'Rapid high-pitch frequency sweep standard for PCR vans & Dial 112 interceptors',
    icon: '⚡'
  },
  {
    id: 'WAIL',
    nameEn: 'Classic Police Wail (Slow)',
    nameBn: 'ক্লাসিক পুলিশ ওয়াইল (ধীর)',
    desc: 'Deep continuous rising & falling acoustic horn wail',
    icon: '🚔'
  },
  {
    id: 'HILO',
    nameEn: 'Hi-Lo Two-Tone Horn',
    nameBn: 'হাই-লো ডাবল টোন হর্ন',
    desc: 'Piercing alternating dual-frequency emergency tone',
    icon: '📢'
  },
  {
    id: 'AIRHORN',
    nameEn: 'Police Tactical Airhorn',
    nameBn: 'ট্যাকটিক্যাল পুলিশ এয়ার হর্ন',
    desc: 'Heavy dual-tone mechanical horn blast to deter attackers',
    icon: '📣'
  }
];

export default function PoliceSiren() {
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [selectedTone, setSelectedTone] = useState<PoliceSirenTone>('KOLKATA_112');
  const [volume, setVolume] = useState<number>(0.8);
  const [strobeState, setStrobeState] = useState<'RED' | 'BLUE'>('RED');
  const [customAudioInfo, setCustomAudioInfo] = useState<{ hasCustom: boolean; name: string }>({
    hasCustom: false,
    name: ''
  });
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state with synthesizer and check for saved custom audio
  useEffect(() => {
    setIsActive(isPoliceSirenPlaying());
    const custom = getCustomSirenAudio();
    if (custom.dataUrl) {
      setCustomAudioInfo({ hasCustom: true, name: custom.name });
      setSelectedTone('CUSTOM');
    }
  }, [isOpen]);

  // Red/Blue light beacon animation while siren is active
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setStrobeState(prev => (prev === 'RED' ? 'BLUE' : 'RED'));
    }, 180);
    return () => clearInterval(interval);
  }, [isActive]);

  const handleToggleSiren = (toneToPlay?: PoliceSirenTone) => {
    const tone = toneToPlay || selectedTone;
    if (isActive && tone === selectedTone) {
      stopPoliceSiren();
      setIsActive(false);
    } else {
      setSelectedTone(tone);
      startPoliceSiren(tone, volume);
      setIsActive(true);
    }
  };

  const handleToneChange = (tone: PoliceSirenTone) => {
    setSelectedTone(tone);
    if (isActive) {
      startPoliceSiren(tone, volume);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (isActive) {
      startPoliceSiren(selectedTone, newVol);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCustomSirenAudio(dataUrl, file.name);
        setCustomAudioInfo({ hasCustom: true, name: file.name });
        setSelectedTone('CUSTOM');
        setUploadSuccessMsg(`"${file.name}" অডিও টোন যুক্ত হয়েছে!`);
        setTimeout(() => setUploadSuccessMsg(null), 4000);

        // If siren is playing, switch to new sound immediately
        if (isActive) {
          startPoliceSiren('CUSTOM', volume);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomAudio = () => {
    removeCustomSirenAudio();
    setCustomAudioInfo({ hasCustom: false, name: '' });
    setSelectedTone('KOLKATA_112');
    if (isActive) {
      startPoliceSiren('KOLKATA_112', volume);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      stopPoliceSiren();
    };
  }, []);

  return (
    <>
      {/* Dashboard Quick Card */}
      <div onClick={() => setIsOpen(true)}>
        <div 
          className={`flex flex-col items-center justify-center gap-3 p-6 rounded-3xl transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 border ${
            isActive 
              ? 'bg-red-600 text-white border-red-400 shadow-lg shadow-red-600/40 animate-pulse' 
              : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'
          }`}
        >
          <div className="relative">
            {isActive ? (
              <Volume2 className="w-8 h-8 animate-bounce" />
            ) : (
              <VolumeX className="w-8 h-8 opacity-80" />
            )}
            {isActive && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-ping" />
            )}
          </div>
          <div className="text-center">
            <span className="font-black text-sm block">Police Siren</span>
            <span className="text-[11px] opacity-75 font-semibold block">
              {isActive 
                ? `PLAYING (${selectedTone === 'CUSTOM' ? 'Custom Audio' : selectedTone})` 
                : customAudioInfo.hasCustom 
                ? 'Custom Audio Loaded' 
                : 'WB Dial 112 / PCR Tone'}
            </span>
          </div>
        </div>
      </div>

      {/* Modal Dialogue */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] p-6 sm:p-7 shadow-2xl flex flex-col text-slate-100 relative overflow-hidden my-auto"
            >
              {/* Flashing Police Red/Blue Edge Ambient Glow when active */}
              {isActive && (
                <div 
                  className={`absolute inset-0 pointer-events-none opacity-20 transition-colors duration-150 ${
                    strobeState === 'RED' ? 'bg-red-600' : 'bg-blue-600'
                  }`}
                />
              )}

              {/* Header */}
              <div className="flex justify-between items-center mb-4 relative z-10">
                <div className="flex items-center gap-2.5 text-red-500 font-black text-lg">
                  <div className={`p-2 rounded-2xl ${isActive ? 'bg-red-500 text-white animate-pulse' : 'bg-red-500/20 text-red-400'}`}>
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white text-base font-black">POLICE PCR SIREN</h3>
                    <p className="text-[11px] text-slate-400 font-medium">পুলিশ সাইরেন ও অডিও টোন কন্ট্রোলার</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Police Strobe Visualizer Bar */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800/80 mb-4 relative z-10">
                <div className={`h-4 rounded-xl transition-all duration-100 flex items-center justify-center font-mono text-[9px] font-black tracking-widest ${
                  isActive && strobeState === 'RED'
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/80 scale-105'
                    : 'bg-red-950/60 text-red-700'
                }`}>
                  POLICE RED
                </div>
                <div className={`h-4 rounded-xl transition-all duration-100 flex items-center justify-center font-mono text-[9px] font-black tracking-widest ${
                  isActive && strobeState === 'BLUE'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/80 scale-105'
                    : 'bg-blue-950/60 text-blue-700'
                }`}>
                  BEACON BLUE
                </div>
              </div>

              {/* Central Trigger Button */}
              <div className="text-center py-1 relative z-10">
                <button
                  onClick={() => handleToggleSiren()}
                  className={`w-32 h-32 rounded-full flex flex-col items-center justify-center gap-1 mx-auto shadow-2xl transition-all duration-200 cursor-pointer border-4 ${
                    isActive 
                      ? 'bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 border-red-300 text-white animate-pulse scale-105 shadow-red-600/60' 
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white shadow-slate-950'
                  }`}
                >
                  <Volume2 className={`w-9 h-9 ${isActive ? 'animate-bounce' : 'text-slate-400'}`} />
                  <span className="font-black text-xs tracking-wider">
                    {isActive ? 'STOP SIREN' : 'START SIREN'}
                  </span>
                  <span className="text-[9px] font-bold opacity-80 uppercase truncate max-w-[100px]">
                    {selectedTone === 'CUSTOM' ? 'Custom Audio' : selectedTone}
                  </span>
                </button>
              </div>

              {/* Upload Custom Audio File Section */}
              <div className="mt-4 p-3 bg-slate-950 rounded-2xl border border-indigo-500/30 space-y-2 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-indigo-400">
                    <Music className="w-3.5 h-3.5" />
                    <span>Upload Custom Audio Siren (আপনার অডিও ফাইল যোগ করুন):</span>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.webm"
                    className="hidden"
                  />
                </div>

                {customAudioInfo.hasCustom ? (
                  <div className="flex items-center justify-between bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-500/40 text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <button
                        onClick={() => handleToneChange('CUSTOM')}
                        className={`p-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                          selectedTone === 'CUSTOM'
                            ? 'bg-indigo-600 text-white shadow'
                            : 'bg-slate-800 text-slate-300 hover:text-white'
                        }`}
                      >
                        <FileAudio className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[160px]">{customAudioInfo.name}</span>
                      </button>
                      {selectedTone === 'CUSTOM' && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-black">
                          SELECTED
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        title="Change audio file"
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer text-[11px] font-bold"
                      >
                        Change
                      </button>
                      <button
                        onClick={handleRemoveCustomAudio}
                        title="Delete custom audio"
                        className="p-1.5 bg-red-950/60 hover:bg-red-900 text-red-400 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 px-3 rounded-xl border border-dashed border-indigo-500/50 hover:border-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Audio File (MP3, WAV, AAC, M4A)</span>
                  </button>
                )}

                {uploadSuccessMsg && (
                  <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/40 p-1.5 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{uploadSuccessMsg}</span>
                  </div>
                )}
              </div>

              {/* Tone Selector Options */}
              <div className="space-y-2 mt-4 relative z-10">
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                  Or Select Official Police Synthesizer Tones:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {SIREN_TONES.map(tone => {
                    const isCurrent = selectedTone === tone.id;
                    return (
                      <button
                        key={tone.id}
                        onClick={() => handleToneChange(tone.id)}
                        className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                            : 'bg-slate-800/70 hover:bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-xs">{tone.icon}</span>
                          <span className="font-black text-xs text-white truncate">{tone.nameEn.split('/')[0]}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block truncate">{tone.nameBn}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Volume Slider */}
              <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 mt-4 relative z-10 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-indigo-400" /> Siren Volume (শব্দের তীব্রতা):
                  </span>
                  <span className="font-mono font-bold text-white">{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

