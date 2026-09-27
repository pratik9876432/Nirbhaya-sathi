import React, { useState, useEffect } from 'react';
import { Timer, TimerOff, X, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEmergency } from '../EmergencyContext';

export default function SafetyTimer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [durationParams, setDurationParams] = useState(15); // minutes
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const { startEmergency } = useEmergency();

  useEffect(() => {
    let interval: number;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      startEmergency();
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, startEmergency]);

  const startTimer = () => {
    setTimeLeft(durationParams * 60);
    setIsActive(true);
  };

  const stopTimer = () => {
    setIsActive(false);
    setTimeLeft(0);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        <div className={`flex flex-col items-center justify-center gap-3 p-6 rounded-3xl transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 ${isActive ? 'bg-orange-500 text-white animate-pulse' : 'bg-orange-50 text-orange-600'}`}>
          {isActive ? <Timer size={32} /> : <TimerOff size={32} />}
          <span className="font-bold text-sm text-center">Safety Timer</span>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 text-orange-600 font-black text-xl">
                  <ShieldAlert />
                  <span>Periodic Check-in</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X />
                </button>
              </div>

              {!isActive ? (
                <div className="space-y-6">
                  <p className="text-gray-500 text-sm font-medium">
                    Set a safety timer. If you don't check in to cancel it before the time runs out, an SOS alert will be triggered automatically.
                  </p>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">Select Duration</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[5, 15, 30, 60].map(mins => (
                        <button
                          key={mins}
                          onClick={() => setDurationParams(mins)}
                          className={`py-3 rounded-xl font-bold transition-all ${
                            durationParams === mins 
                              ? 'bg-orange-600 text-white shadow-md' 
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {mins}m
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={startTimer}
                    className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-gray-800 transition-all text-center"
                  >
                    START TIMER
                  </button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="text-6xl font-mono font-black text-orange-600 mb-2">
                    {formatTime(timeLeft)}
                  </div>
                  <p className="text-gray-500 font-bold mb-8">remaining until automatic SOS</p>
                  
                  <button
                    onClick={stopTimer}
                    className="w-full bg-gray-100 text-gray-800 py-4 rounded-2xl font-black shadow-sm hover:bg-gray-200 transition-all text-center flex justify-center items-center gap-2"
                  >
                    <X size={20} />
                    IM SAFE (CANCEL)
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
