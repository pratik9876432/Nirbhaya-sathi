import React, { useState, useEffect } from 'react';
import { MapPin, Share2, Navigation, X, Shield, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function LiveTrip() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    let watchId: number;
    if (isSharing && typeof navigator !== 'undefined' && navigator.geolocation) {
      const handleSuccess = (pos: GeolocationPosition) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      };
      const handleError = (err: any) => {
        console.warn("LiveTrip location fallback activated:", err?.message || err);
        setLocation(prev => prev || { lat: 22.5726, lng: 88.3639 });
      };

      try {
        watchId = navigator.geolocation.watchPosition(
          handleSuccess,
          handleError,
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
        );
      } catch (e) {
        handleError(e);
      }
    } else if (isSharing) {
      setLocation({ lat: 22.5726, lng: 88.3639 });
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isSharing]);

  const handleShare = () => {
    if (!location) return;
    const url = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
    const text = `I'm sharing my live trip with you for safety. Track me here: ${url}`;
    
    if (navigator.share) {
      navigator.share({ title: 'Live Trip Sharing', text, url }).catch(console.error);
    } else {
      alert("Link copied to clipboard: " + url);
    }
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        <div className="flex flex-col items-center justify-center gap-3 p-6 rounded-3xl bg-indigo-50 text-indigo-600 transition-all cursor-pointer">
          <Navigation size={32} />
          <span className="font-bold text-sm text-center">Live Trip</span>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
                  <Shield />
                  <span>Live Journey</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X />
                </button>
              </div>

              {!isSharing ? (
                <div className="space-y-6 text-center">
                  <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-indigo-600">
                    <Navigation size={40} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">Share your journey</h3>
                    <p className="text-gray-500 text-sm mt-2">Let family and friends track your real-time movement until you arrive safely.</p>
                  </div>
                  <button 
                    onClick={() => setIsSharing(true)}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100"
                  >
                    START LIVE SHARING
                  </button>
                </div>
              ) : (
                <div className="space-y-8 text-center">
                  <div className="relative">
                    <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto text-indigo-600">
                      <MapPin size={40} className="animate-bounce" />
                    </div>
                    <motion.div 
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-indigo-400 rounded-full -z-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="font-bold text-indigo-600 uppercase tracking-widest text-xs">Tracking active</p>
                    <p className="text-2xl font-black outline-text">SAFE JOURNEY</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <button 
                      onClick={handleShare}
                      className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2"
                    >
                      <Share2 size={20} />
                      SHARE LIVE LINK
                    </button>
                    <button 
                      onClick={() => { setIsSharing(false); setIsOpen(false); }}
                      className="w-full bg-gray-100 text-gray-600 py-4 rounded-2xl font-black"
                    >
                      STOP SHARING
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
