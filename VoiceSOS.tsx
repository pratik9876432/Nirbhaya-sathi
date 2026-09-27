import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Settings, X, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEmergency } from '../EmergencyContext';

// Using Web Speech API
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export default function VoiceSOS() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [triggerWords, setTriggerWords] = useState(['help', 'bachao', 'emergency']);
  const { startEmergency } = useEmergency();
  
  const [recognition, setRecognition] = useState<any>(null);
  const isListeningRef = React.useRef(isListening);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    if (SpeechRecognition) {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-IN'; // Works for Indian English and some Hindi
        
        rec.onresult = (event: any) => {
          try {
            const current = event.resultIndex;
            const transcript = event.results[current][0].transcript.toLowerCase();
            
            // Check for trigger words
            const triggered = triggerWords.some(word => transcript.includes(word));
            if (triggered) {
              console.log("VOICE SOS TRIGGERED by word in: ", transcript);
              startEmergency();
              try { rec.stop(); } catch (e) {}
              setIsListening(false);
            }
          } catch (err) {
            console.error("Error in speech recognition onresult:", err);
          }
        };

        rec.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          if (event.error === 'not-allowed') setIsListening(false);
        };

        rec.onend = () => {
          // Automatically restart if we are supposed to be listening
          if (isListeningRef.current) {
            try {
              rec.start();
            } catch (e) {}
          }
        };

        setRecognition(rec);
      } catch (e) {
        console.warn("SpeechRecognition is not allowed or supported in this browser context:", e);
      }
    }
  }, [triggerWords, startEmergency]);

  useEffect(() => {
    if (recognition) {
      try {
        if (isListening) {
          recognition.start();
        } else {
          recognition.stop();
        }
      } catch (e) {
        console.warn("Error toggling SpeechRecognition:", e);
      }
    }
  }, [isListening, recognition]);

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        <div className={`flex flex-col items-center justify-center gap-3 p-6 rounded-3xl transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 ${isListening ? 'bg-rose-600 text-white animate-pulse shadow-rose-500/40' : 'bg-rose-50 text-rose-600'}`}>
          {isListening ? <Mic size={32} /> : <MicOff size={32} />}
          <span className="font-bold text-sm text-center">Voice SOS</span>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 text-rose-600 font-black text-xl">
                  <ShieldAlert />
                  <span>Voice Triggered SOS</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X />
                </button>
              </div>

              {!SpeechRecognition ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl font-medium text-sm">
                  Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-gray-500 text-sm font-medium">
                    When enabled, the app constantly listens in the background. If you say a trigger word, the SOS will automatically activate.
                  </p>
                  
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Active Trigger Words</h4>
                    <div className="flex flex-wrap gap-2">
                      {triggerWords.map(word => (
                        <span key={word} className="bg-white px-3 py-1 rounded-full text-sm font-bold text-gray-700 shadow-sm border border-gray-200">
                          "{word}"
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setIsListening(!isListening)}
                    className={`w-full py-4 rounded-2xl font-black shadow-lg transition-all flex items-center justify-center gap-2 ${
                      isListening ? 'bg-rose-600 justify-center text-white hover:bg-rose-700' : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {isListening ? (
                      <>
                        <Mic size={20} className="animate-pulse" />
                        LISTENING... (TAP TO STOP)
                      </>
                    ) : (
                      <>
                        <MicOff size={20} />
                        START LISTENING
                      </>
                    )}
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
