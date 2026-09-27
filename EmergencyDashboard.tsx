import React, { useState, useRef } from 'react';
import { useEmergency } from '../EmergencyContext';
import { findNearestPoliceStation } from '../services/policeDatabase';
import { 
  Shield, 
  MapPin, 
  Activity, 
  Phone, 
  AlertCircle, 
  Radio, 
  Car, 
  CheckCircle2, 
  Navigation, 
  MessageSquare,
  Vibrate,
  Mic,
  Play,
  Pause,
  Download,
  EyeOff,
  Eye,
  Lock,
  Sparkles,
  Wifi
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import LiveClock from './LiveClock';
import EmergencyRouteMap from './EmergencyRouteMap';
import QuickEmergencyCall from './QuickEmergencyCall';
import { AudioSnippet } from '../types';

interface EmergencyDashboardProps {
  onOpenPoliceController?: () => void;
}

export default function EmergencyDashboard({ onOpenPoliceController }: EmergencyDashboardProps) {
  const { 
    emergency, 
    activePoliceAlert, 
    stopEmergency,
    isSilentPanic,
    silentAudioSnippets,
    vibrationActive,
    toggleVibration,
    audioLevel
  } = useEmergency();

  const [playingSnippetId, setPlayingSnippetId] = useState<string | null>(null);
  const [isStealthDecoy, setIsStealthDecoy] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const togglePlaySnippet = (snippet: AudioSnippet) => {
    if (playingSnippetId === snippet.id) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setPlayingSnippetId(null);
    } else {
      const src = snippet.audioBlobUrl || (snippet.audioBase64 ? snippet.audioBase64 : null);
      if (src) {
        if (!audioPlayerRef.current) {
          audioPlayerRef.current = new Audio(src);
        } else {
          audioPlayerRef.current.src = src;
        }
        audioPlayerRef.current.play().catch(e => console.warn('Audio play error:', e));
        setPlayingSnippetId(snippet.id);
        audioPlayerRef.current.onended = () => setPlayingSnippetId(null);
      }
    }
  };

  if (!emergency.isActive) return null;

  const nearestPS = emergency.location 
    ? findNearestPoliceStation(emergency.location.lat, emergency.location.lng)
    : null;

  const stationName = activePoliceAlert?.nearestStationName || nearestPS?.name || 'Arambagh Police Station';
  const stationContact = activePoliceAlert?.nearestStationContact || nearestPS?.contact || '03211-255223';
  const stationPin = activePoliceAlert?.nearestStationPin || nearestPS?.pinCode || '712601';

  const isEnRoute = activePoliceAlert?.status === 'EN_ROUTE' || activePoliceAlert?.status === 'DISPATCHED';
  const isOnScene = activePoliceAlert?.status === 'ON_SCENE';
  const isResolved = activePoliceAlert?.status === 'RESOLVED';

  return (
    <>
      {/* Stealth Decoy Cloaking Screen */}
      <AnimatePresence>
        {isStealthDecoy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black text-slate-500 flex flex-col items-center justify-between p-8 select-none cursor-pointer"
            onClick={() => setIsStealthDecoy(false)}
          >
            <div className="flex items-center justify-between w-full text-xs text-zinc-600 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>4G VoLTE</span>
              </span>
              <span>88% 🔋</span>
            </div>

            <div className="text-center space-y-2">
              <LiveClock className="text-5xl font-thin tracking-widest text-zinc-500" showIcon={false} />
              <p className="text-xs text-zinc-700 tracking-wider">Swipe or tap to unlock</p>
            </div>

            <div className="space-y-2 text-center pb-6">
              <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-700">
                <Lock className="w-3.5 h-3.5 text-zinc-700" />
                <span>Decoy Screen Active • Audio & GPS Transmitting Secretly</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsStealthDecoy(false);
                }}
                className="px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-bold transition-colors"
              >
                Exit Stealth Decoy Screen
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-red-600 via-rose-700 to-red-800 text-white rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6"
      >
        <div className="relative z-10 space-y-6">
          {/* Header telemetry */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                <Activity className="animate-pulse w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-black text-xl tracking-tight block">
                  {emergency.isSilentPanic ? 'SILENT PANIC ACTIVE (3s SOS HOLD)' : 'LIVE SOS TELEMETRY ACTIVE'}
                </span>
                <span className="text-xs text-red-200 font-medium">
                  {emergency.isSilentPanic 
                    ? 'Covert distress signal engaged: Tactile vibration pulses & continuous ambient audio stream' 
                    : 'Automatic Emergency Signal Broadcasted to Police Station'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LiveClock className="text-xs font-bold bg-black/20 px-3 py-1.5 rounded-full" showIcon />
              <div className="bg-white text-red-700 px-3.5 py-1 rounded-full text-xs font-black tracking-wider animate-pulse shadow-sm">
                {emergency.isSilentPanic ? 'SILENT STREAM' : 'LIVE BROADCAST'}
              </div>
            </div>
          </div>

          {/* Dedicated High-Frequency Silent Panic & Ambient Audio Stream Card */}
          <div className="bg-slate-950/85 backdrop-blur-xl border border-red-500/40 rounded-3xl p-5 sm:p-6 text-white space-y-5 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-600/30 border border-red-500/50 flex items-center justify-center text-red-400">
                  <Vibrate className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-white flex items-center gap-2">
                    <span>High-Frequency Silent Panic Mode</span>
                    <span className="text-[10px] bg-red-600 text-white font-extrabold px-2 py-0.5 rounded-full animate-pulse">
                      ACTIVE
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 font-medium">
                    Continuous high-frequency tactile vibration cadences & automatic audio-stream snippets upload
                  </p>
                </div>
              </div>

              {/* Stealth Decoy Cloaking trigger button */}
              <button
                onClick={() => setIsStealthDecoy(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm w-fit"
                title="Black screen decoy lock screen to hide emergency activity from attackers"
              >
                <EyeOff className="w-4 h-4 text-amber-400" />
                <span>Stealth Decoy Screen</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Device Vibration & Mic Decibel Level Telemetry */}
              <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <Vibrate className={`w-4 h-4 ${vibrationActive ? 'text-red-400 animate-pulse' : 'text-slate-500'}`} />
                    <span>Device Haptic Vibration:</span>
                  </div>
                  <button
                    onClick={toggleVibration}
                    className={`text-[11px] font-black px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      vibrationActive 
                        ? 'bg-red-600/30 text-red-300 border border-red-500/50' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {vibrationActive ? 'PULSING ACTIVE' : 'MUTED'}
                  </button>
                </div>

                <div className="text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Pattern: </span>
                  Rapid alert cadence [120ms-60ms] followed by 3.5s pocket heartbeat confirmations.
                </div>

                {/* Live Mic Ambient Frequency Meter */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                      <span>Ambient Audio Stream Level</span>
                    </span>
                    <span className="font-mono text-white font-bold">{audioLevel}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500 transition-all duration-100 rounded-full"
                      style={{ width: `${Math.max(8, audioLevel)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Auto-Uploaded Audio Stream Snippets */}
              <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-2.5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Auto-Uploaded Snippets:</span>
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    {silentAudioSnippets.length} Uploaded
                  </span>
                </div>

                {silentAudioSnippets.length === 0 ? (
                  <div className="text-center py-4 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-ping mx-auto" />
                    <p className="text-xs text-slate-400 font-medium">Recording first 5s audio chunk...</p>
                    <p className="text-[10px] text-slate-500">Auto-streaming directly to Police Control Room buffer</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {silentAudioSnippets.slice(0, 4).map((snip, index) => (
                      <div 
                        key={snip.id}
                        className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <p className="font-mono text-white font-bold text-[11px] truncate flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Snippet #{silentAudioSnippets.length - index} ({snip.durationSeconds}s)
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {new Date(snip.timestamp).toLocaleTimeString()} • Auto-Uploaded ✓
                          </p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => togglePlaySnippet(snip)}
                            className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1 transition-colors cursor-pointer text-[10px]"
                            title="Listen to ambient audio snippet"
                          >
                            {playingSnippetId === snip.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            <span>{playingSnippetId === snip.id ? 'Pause' : 'Play'}</span>
                          </button>

                          {snip.audioBlobUrl && (
                            <a
                              href={snip.audioBlobUrl}
                              download={`${snip.id}.webm`}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                              title="Download audio snippet"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-1 border-t border-slate-800/80">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Encrypted ambient snippets buffer automatically transmitted to Police Command Desk</span>
                </div>
              </div>
            </div>
          </div>

        {/* Live Location and Police Station Connected cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-black/20 backdrop-blur-md rounded-2xl p-5 border border-white/15 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-red-200 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-white" /> Live GPS Coordinates
              </span>
              <span className="text-[10px] bg-emerald-500/30 text-emerald-200 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                Transmitting
              </span>
            </div>
            <p className="text-xl font-mono font-black text-white">
              {emergency.location ? `${emergency.location.lat.toFixed(5)}, ${emergency.location.lng.toFixed(5)}` : '22.8824, 87.7842 (Arambagh)'}
            </p>
            <p className="text-xs text-red-200">
              Live coordinates streaming continuously to Station Dispatcher.
            </p>
          </div>

          <div className="bg-black/20 backdrop-blur-md rounded-2xl p-5 border border-white/15 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-red-200 flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-white" /> Connected Police Station
              </span>
              <span className="text-[10px] bg-white/20 text-white font-bold px-2 py-0.5 rounded-full">
                PIN: {stationPin}
              </span>
            </div>
            <p className="text-lg font-bold text-white leading-tight">
              {stationName}
            </p>
            <p className="text-xs text-red-200 flex items-center gap-2">
              <span>📞 {stationContact}</span>
            </p>
          </div>
        </div>

        {/* Simplified Map View: Live Browser Geolocation & Route to Nearest Police Station or Hospital */}
        <EmergencyRouteMap initialLocation={emergency.location} />

        {/* Dedicated 1-Tap Quick Call to Pre-configured Primary Emergency Contact */}
        <QuickEmergencyCall />

        {/* Registered Citizen / Victim Dossier transmitting to Police */}
        {activePoliceAlert?.userName && (
          <div className="bg-black/35 backdrop-blur-md rounded-2xl p-4 border border-white/20 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-red-200 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-white" /> পুলিশ কন্ট্রোলারে প্রেরিত নাগরিকের তথ্য (Dossier Transmitted to Police):
              </span>
              <span className="text-[10px] bg-red-500/30 text-white font-mono px-2 py-0.5 rounded-full">
                {activePoliceAlert.id}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-white">
              <span className="font-black text-sm">{activePoliceAlert.userName}</span>
              <span className="font-mono text-xs text-red-200">📞 {activePoliceAlert.userPhone}</span>
              {activePoliceAlert.userBloodGroup && (
                <span className="bg-white/20 px-2 py-0.5 rounded text-[11px] font-bold">
                  Blood: {activePoliceAlert.userBloodGroup}
                </span>
              )}
              {activePoliceAlert.userGuardianPhone && (
                <span className="text-red-200">
                  অভিভাবক: <strong>{activePoliceAlert.userGuardianName || 'Guardian'}</strong> ({activePoliceAlert.userGuardianPhone})
                </span>
              )}
            </div>
            {activePoliceAlert.emergencyMessage && (
              <div className="text-[11px] text-white/90 bg-black/30 p-2.5 rounded-xl border border-white/10 italic">
                "{activePoliceAlert.emergencyMessage}"
              </div>
            )}
          </div>
        )}

        {/* Live Police Dispatch Controller Status Banner */}
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-5 border border-white/20 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Car className={`w-5 h-5 ${isEnRoute ? 'text-amber-300 animate-bounce' : 'text-white'}`} />
              <span className="text-xs font-black uppercase tracking-wider text-white">
                Police Station Controller Status:
              </span>
            </div>
            <span className={`text-xs font-black px-3 py-1 rounded-xl w-fit ${
              isOnScene 
                ? 'bg-blue-500 text-white' 
                : isEnRoute 
                ? 'bg-amber-400 text-slate-900 font-black' 
                : isResolved 
                ? 'bg-emerald-500 text-white'
                : 'bg-white/20 text-white'
            }`}>
              {isOnScene 
                ? '● POLICE UNIT ON SCENE' 
                : isEnRoute 
                ? `● ${activePoliceAlert?.dispatchedUnit || 'PCR VAN'} EN ROUTE (ETA ~${activePoliceAlert?.etaMinutes || 3}M)` 
                : isResolved
                ? '● CASE SAFELY RESOLVED'
                : '● ALERT RECEIVED AT POLICE COMMAND DESK'}
            </span>
          </div>

          {activePoliceAlert?.policeReplyMessage ? (
            <div className="bg-white/10 rounded-xl p-3.5 border border-white/20 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-amber-200 font-bold">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message from Duty Officer ({activePoliceAlert.assignedOfficer || 'Desk In-Charge'}):</span>
              </div>
              <p className="text-sm font-semibold text-white italic">
                "{activePoliceAlert.policeReplyMessage}"
              </p>
            </div>
          ) : (
            <p className="text-xs text-red-100">
              🚨 Distress alert dispatch is actively being reviewed by the nearest Police Station Desk ({stationName}). An officer is tracking your GPS.
            </p>
          )}

          {onOpenPoliceController && (
            <div className="pt-1">
              <button
                onClick={onOpenPoliceController}
                className="text-xs font-bold text-red-200 hover:text-white underline flex items-center gap-1 cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5" /> View Live Police Station Controller Command Screen
              </button>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <a 
            href={`tel:${stationContact}`}
            className="bg-white text-red-700 hover:bg-red-50 font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl transition-all text-center text-sm cursor-pointer"
          >
            <Phone size={20} />
            DIRECT CALL {stationName.toUpperCase()}
          </a>

          <button 
            onClick={() => {
              const lat = emergency.location?.lat || 22.8824;
              const lng = emergency.location?.lng || 87.7842;
              window.open(`https://www.google.com/maps?q=${lat},${lng}`);
            }}
            className="bg-black/30 hover:bg-black/40 border border-white/30 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all text-sm cursor-pointer"
          >
            <Navigation size={18} />
            OPEN PRESENT LOCATION ON MAP
          </button>
        </div>

        {/* Disengage / I Am Safe Button */}
        <div className="pt-1 flex justify-center">
          <button
            onClick={() => stopEmergency()}
            className="bg-black/40 hover:bg-black/60 border border-white/25 text-white/90 hover:text-white px-6 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>I AM SAFE NOW • DISENGAGE SOS BROADCAST</span>
          </button>
        </div>
      </div>
      
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Shield size={240} />
      </div>
    </motion.div>
    </>
  );
}
