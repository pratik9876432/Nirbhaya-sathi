import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  PhoneOff, 
  UserCheck, 
  Mic, 
  MicOff, 
  Volume2, 
  ShieldCheck, 
  X,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playFakeRingtone } from '../services/soundSynthesizer';

interface FakeCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FakeCallModal({ isOpen, onClose }: FakeCallModalProps) {
  const [callerName, setCallerName] = useState('Baba / Father (বাবা)');
  const [callerPhone, setCallerPhone] = useState('+91 98301 22910');
  const [callDelaySeconds, setCallDelaySeconds] = useState(0);
  const [callState, setCallState] = useState<'SETUP' | 'WAITING' | 'RINGING' | 'CONNECTED'>('SETUP');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);

  // Handle countdown & ringing
  useEffect(() => {
    let timer: number | null = null;
    let ringStopper: (() => void) | null = null;

    if (callState === 'WAITING') {
      let remaining = callDelaySeconds;
      timer = window.setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          if (timer) clearInterval(timer);
          setCallState('RINGING');
        }
      }, 1000);
    } else if (callState === 'RINGING') {
      ringStopper = playFakeRingtone();
    } else if (callState === 'CONNECTED') {
      setCallDuration(0);
      timer = window.setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
      if (ringStopper) ringStopper();
    };
  }, [callState, callDelaySeconds]);

  if (!isOpen) return null;

  const handleStartCall = () => {
    if (callDelaySeconds === 0) {
      setCallState('RINGING');
    } else {
      setCallState('WAITING');
    }
  };

  const handleAcceptCall = () => {
    setCallState('CONNECTED');
  };

  const handleDeclineOrEnd = () => {
    setCallState('SETUP');
    onClose();
  };

  const formatCallTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        {/* SETUP SCREEN */}
        {callState === 'SETUP' && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-slate-900 border border-slate-700 text-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">Fake Rescue Call</h3>
                  <p className="text-xs text-slate-400">Escape unsafe social or street situations</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Preset Caller Identity</label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {[
                    { name: 'Baba (বাবা)', phone: '+91 98301 22910' },
                    { name: 'Maa (মা)', phone: '+91 98301 44820' },
                    { name: 'Police Helpline', phone: '112 / 1091' }
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCallerName(p.name);
                        setCallerPhone(p.phone);
                      }}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                        callerName === p.name 
                          ? 'bg-indigo-600 border-indigo-400 text-white' 
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {p.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={callerName}
                  onChange={(e) => setCallerName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Caller Display Name"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Trigger Delay</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Instant', sec: 0 },
                    { label: '10 sec', sec: 10 },
                    { label: '30 sec', sec: 30 },
                    { label: '60 sec', sec: 60 }
                  ].map((d, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCallDelaySeconds(d.sec)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                        callDelaySeconds === d.sec 
                          ? 'bg-indigo-600 border-indigo-400 text-white' 
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 flex items-start gap-2.5 text-xs text-slate-300">
                <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  Simulates a realistic incoming phone call. You can answer and speak to pretend someone is on the other line waiting for you.
                </span>
              </div>
            </div>

            <button
              onClick={handleStartCall}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>{callDelaySeconds === 0 ? 'Trigger Fake Call Now' : `Start Timer (${callDelaySeconds}s)`}</span>
            </button>
          </motion.div>
        )}

        {/* WAITING SCREEN */}
        {callState === 'WAITING' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-slate-900 border border-slate-700 text-white w-full max-w-sm rounded-3xl p-8 text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mx-auto text-indigo-400 animate-pulse">
              <Phone className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-lg">Fake Call Scheduled</h4>
            <p className="text-xs text-slate-400">
              Put phone in pocket or table. Call will ring in a few seconds...
            </p>
            <button
              onClick={() => setCallState('SETUP')}
              className="text-xs text-red-400 font-bold hover:underline"
            >
              Cancel Call
            </button>
          </motion.div>
        )}

        {/* REALISTIC INCOMING CALL SCREEN */}
        {callState === 'RINGING' && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-b from-slate-900 via-slate-800 to-black text-white w-full max-w-sm h-[600px] rounded-[3rem] p-8 flex flex-col justify-between shadow-2xl border-4 border-slate-700 relative overflow-hidden"
          >
            {/* Top info */}
            <div className="text-center pt-8 space-y-2">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Incoming Call</p>
              <h2 className="text-2xl font-black text-white tracking-wide">{callerName}</h2>
              <p className="text-sm font-medium text-slate-300">{callerPhone}</p>
            </div>

            {/* Pulsing Avatar */}
            <div className="flex justify-center items-center my-auto">
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-indigo-600/20 animate-ping absolute inset-0" />
                <div className="w-28 h-28 rounded-full bg-slate-700 border-2 border-indigo-400 flex items-center justify-center relative shadow-xl">
                  <UserCheck className="w-12 h-12 text-indigo-300" />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-6 pb-6">
              <div className="flex items-center justify-around">
                {/* Decline */}
                <div className="text-center space-y-1">
                  <button
                    onClick={handleDeclineOrEnd}
                    className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 cursor-pointer"
                  >
                    <PhoneOff className="w-7 h-7" />
                  </button>
                  <span className="text-[11px] text-slate-400 font-medium">Decline</span>
                </div>

                {/* Accept */}
                <div className="text-center space-y-1">
                  <button
                    onClick={handleAcceptCall}
                    className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/40 animate-bounce transition-transform active:scale-95 cursor-pointer"
                  >
                    <Phone className="w-7 h-7" />
                  </button>
                  <span className="text-[11px] text-slate-400 font-medium">Accept</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* CONNECTED CALL SCREEN */}
        {callState === 'CONNECTED' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gradient-to-b from-slate-900 via-slate-800 to-black text-white w-full max-w-sm h-[600px] rounded-[3rem] p-8 flex flex-col justify-between shadow-2xl border-4 border-slate-700 relative overflow-hidden"
          >
            {/* Top caller info */}
            <div className="text-center pt-8 space-y-1">
              <h2 className="text-2xl font-black text-white">{callerName}</h2>
              <p className="text-sm text-emerald-400 font-bold">{formatCallTime(callDuration)}</p>
              <p className="text-xs text-slate-400">HD Voice Encrypted Call</p>
            </div>

            {/* Realistic in-call script suggestions */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 text-xs space-y-2 text-slate-200 shadow-inner">
              <p className="font-bold text-indigo-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Rescue Script Prompt:
              </p>
              <p className="italic text-slate-300">
                &ldquo;Yes, I'm almost at the corner! Are you waiting for me right outside? See you in 1 minute!&rdquo;
              </p>
              <p className="text-[10px] text-slate-400">
                (Speak loudly into the phone to deter any person following you)
              </p>
            </div>

            {/* In-Call controls */}
            <div className="space-y-6 pb-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3.5 rounded-2xl flex flex-col items-center gap-1 transition-all ${
                    isMuted ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  <span className="text-[10px]">{isMuted ? 'Muted' : 'Mute'}</span>
                </button>

                <button
                  onClick={() => setIsSpeaker(!isSpeaker)}
                  className={`p-3.5 rounded-2xl flex flex-col items-center gap-1 transition-all ${
                    isSpeaker ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  <Volume2 className="w-5 h-5" />
                  <span className="text-[10px]">Speaker</span>
                </button>

                <button
                  onClick={() => alert('Safe Location coordinates broadcast to family.')}
                  className="p-3.5 rounded-2xl bg-slate-800 text-slate-300 flex flex-col items-center gap-1 hover:bg-slate-700"
                >
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-[10px]">Share GPS</span>
                </button>
              </div>

              {/* End Call Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleDeclineOrEnd}
                  className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white shadow-xl shadow-red-600/30 transition-transform active:scale-95 cursor-pointer"
                >
                  <PhoneOff className="w-7 h-7" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
}
