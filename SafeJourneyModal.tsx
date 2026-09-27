import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  X, 
  CheckCircle2, 
  PhoneCall, 
  Share2,
  StopCircle,
  Timer
} from 'lucide-react';
import { motion } from 'motion/react';
import { useEmergency } from '../EmergencyContext';
import { SafeJourneyTrip } from '../types';

interface SafeJourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'nirbhoya_safe_journey';

export default function SafeJourneyModal({ isOpen, onClose }: SafeJourneyModalProps) {
  const { emergency, contacts, triggerSOS } = useEmergency();
  const [destination, setDestination] = useState('Home (Arambagh Sadar)');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [activeTrip, setActiveTrip] = useState<SafeJourneyTrip | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const trip: SafeJourneyTrip = JSON.parse(saved);
        if (trip.status === 'ACTIVE') {
          const elapsedSecs = Math.floor((Date.now() - trip.startTime) / 1000);
          const totalSecs = trip.durationMinutes * 60;
          if (elapsedSecs < totalSecs) {
            setActiveTrip(trip);
            setRemainingSeconds(totalSecs - elapsedSecs);
          } else {
            // Expired
            trip.status = 'EXPIRED_SOS';
            setActiveTrip(trip);
          }
        }
      }
    } catch (e) {}
  }, [isOpen]);

  // Countdown ticker
  useEffect(() => {
    if (!activeTrip || activeTrip.status !== 'ACTIVE') return;

    const interval = window.setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          // Auto trigger danger emergency
          handleTripExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTrip]);

  const handleStartTrip = () => {
    if (!destination.trim()) return;

    const newTrip: SafeJourneyTrip = {
      id: `TRIP-${Date.now()}`,
      destination,
      durationMinutes,
      startTime: Date.now(),
      emergencyContactsToNotify: contacts.map(c => c.name),
      status: 'ACTIVE'
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTrip));
    setActiveTrip(newTrip);
    setRemainingSeconds(durationMinutes * 60);
  };

  const handleTripExpired = () => {
    if (activeTrip) {
      const updated = { ...activeTrip, status: 'EXPIRED_SOS' as const };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setActiveTrip(updated);
      // Trigger SOS!
      triggerSOS('Danger');
    }
  };

  const handleCompleteTrip = () => {
    if (activeTrip) {
      const updated = { ...activeTrip, status: 'COMPLETED' as const };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setActiveTrip(null);
    }
  };

  const handleExtendTrip = (extraMins: number) => {
    if (activeTrip) {
      const newDuration = activeTrip.durationMinutes + extraMins;
      const updated: SafeJourneyTrip = {
        ...activeTrip,
        durationMinutes: newDuration
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setActiveTrip(updated);
      setRemainingSeconds(prev => prev + extraMins * 60);
    }
  };

  if (!isOpen) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white text-gray-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-xl text-gray-900">Safe Journey Escort</h3>
              <p className="text-xs text-gray-500 font-bold">Auto-SOS if you don't check in on time</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 rounded-full bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ACTIVE TRIP TRACKER */}
        {activeTrip && activeTrip.status === 'ACTIVE' ? (
          <div className="space-y-6">
            <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-indigo-700 font-bold text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping" />
                Live Travel Geofence Escort Active
              </div>

              <div className="text-5xl font-black text-indigo-900 tracking-tight font-mono">
                {formatTimer(remainingSeconds)}
              </div>

              <p className="text-xs text-indigo-700 font-medium">
                Destination: <span className="font-bold">{activeTrip.destination}</span>
              </p>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3 text-xs text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                If you do not tap <strong>"I Reached Safely"</strong> before the timer reaches 00:00, emergency SOS and police alert will automatically broadcast to your contacts and police controller!
              </span>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleExtendTrip(10)}
                className="py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Clock className="w-4 h-4 text-gray-600" />
                +10 Mins (Traffic)
              </button>

              <button
                onClick={() => triggerSOS('Danger')}
                className="py-3 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <AlertTriangle className="w-4 h-4 text-red-600" />
                SOS Now
              </button>
            </div>

            <button
              onClick={handleCompleteTrip}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>I Have Reached Safely (Check In)</span>
            </button>
          </div>
        ) : (
          /* TRIP SETUP FORM */
          <div className="space-y-5">
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-700">Where are you heading?</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {['Home (Arambagh)', 'College / Tuition', 'Market / Bus Stand', 'Office / Hospital', 'Khanakul Rd'].map((dest, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setDestination(dest)}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left truncate ${
                      destination === dest 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {dest}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Or enter custom destination address..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700">Estimated Travel Time</label>
              <div className="grid grid-cols-4 gap-2">
                {[10, 15, 25, 45].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDurationMinutes(m)}
                    className={`p-3 rounded-2xl text-xs font-black border transition-all flex flex-col items-center gap-1 ${
                      durationMinutes === m
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Timer className="w-4 h-4" />
                    <span>{m} Mins</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <p className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Who gets notified if timer expires:
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  Local Police Station Controller (Arambagh / Khanakul PS)
                </li>
                {contacts.map((c, i) => (
                  <li key={i} className="flex items-center gap-2 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    Emergency Contact: {c.name} ({c.phone})
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={handleStartTrip}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
            >
              <Navigation className="w-5 h-5" />
              <span>Start Safe Journey Escort ({durationMinutes} mins)</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
