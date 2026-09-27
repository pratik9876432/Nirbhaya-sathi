import React, { useState, useEffect } from 'react';
import { Phone, X, User, PhoneForwarded } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function FakeCall() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [callerName, setCallerName] = useState('Home (Mom)');

  const triggerCall = () => {
    setTimeout(() => {
      setIsCalling(true);
    }, 3000); // Trigger after 3 seconds for simulation
  };

  return (
    <>
      <div onClick={() => { setIsOpen(true); triggerCall(); }}>
        <div className="flex flex-col items-center justify-center gap-3 p-6 rounded-3xl bg-zinc-100 text-zinc-600 transition-all cursor-pointer">
          <Phone size={32} />
          <span className="font-bold text-sm text-center">Fake Call</span>
        </div>
      </div>

      <AnimatePresence>
        {isCalling && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="fixed inset-0 z-[100] bg-zinc-900 flex flex-col items-center justify-between py-24 px-8"
          >
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center mx-auto">
                <User size={48} className="text-zinc-500" />
              </div>
              <h2 className="text-3xl font-bold text-white">{callerName}</h2>
              <p className="text-zinc-400 font-medium">Incoming Call...</p>
            </div>

            <div className="flex justify-around w-full max-w-sm">
              <button 
                onClick={() => setIsCalling(false)}
                className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white"
              >
                <X size={32} />
              </button>
              <button 
                onClick={() => setIsCalling(false)}
                className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white animate-bounce"
              >
                <Phone size={32} />
              </button>
            </div>
            
            <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
              Deterrence Mode Active
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
