import React, { useState } from 'react';
import { useEmergency } from '../EmergencyContext';
import { 
  PhoneCall, 
  Settings, 
  User, 
  Check, 
  X, 
  Sparkles, 
  ShieldAlert, 
  Heart,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QuickEmergencyCallProps {
  className?: string;
}

export default function QuickEmergencyCall({ className = '' }: QuickEmergencyCallProps) {
  const { contacts, primaryContact, setPrimaryContact, savePrimaryQuickContact } = useEmergency();
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRel, setEditRel] = useState('');
  const [selectedExistingId, setSelectedExistingId] = useState<string>('');

  // Fallback if no contact configured yet
  const activePrimary = primaryContact || (contacts.length > 0 ? contacts[0] : null);

  const openConfig = () => {
    if (activePrimary) {
      setEditName(activePrimary.name);
      setEditPhone(activePrimary.phone);
      setEditRel(activePrimary.relationship || 'Primary Guardian');
      setSelectedExistingId(activePrimary.id);
    } else {
      setEditName('Maa / Mother');
      setEditPhone('+919876543210');
      setEditRel('Mother');
      setSelectedExistingId('');
    }
    setIsConfiguring(true);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPhone.trim()) return;

    if (selectedExistingId && selectedExistingId !== 'new') {
      // Set existing contact as primary and update details
      setPrimaryContact(selectedExistingId);
    } else {
      // Save new primary quick contact
      savePrimaryQuickContact({
        name: editName.trim() || 'Primary Contact',
        phone: editPhone.trim(),
        relationship: editRel.trim() || 'Guardian'
      });
    }
    setIsConfiguring(false);
  };

  const handleSelectExisting = (contactId: string) => {
    setSelectedExistingId(contactId);
    const chosen = contacts.find(c => c.id === contactId);
    if (chosen) {
      setEditName(chosen.name);
      setEditPhone(chosen.phone);
      setEditRel(chosen.relationship || '');
    }
  };

  return (
    <>
      <div className={`bg-black/30 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20 text-white ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/30 border border-rose-400/40 flex items-center justify-center text-rose-300">
              <PhoneCall className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-black text-sm tracking-tight">Dedicated 1-Tap Quick Call</h4>
                <span className="bg-rose-500/30 text-rose-200 border border-rose-400/30 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  Instant Dial
                </span>
              </div>
              <p className="text-[11px] text-red-200">
                Instantly dials your pre-configured primary guardian without phone menus
              </p>
            </div>
          </div>

          <button
            onClick={openConfig}
            className="self-start sm:self-auto text-xs font-bold text-red-200 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Configure Primary Emergency Contact"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{activePrimary ? 'Change Contact' : 'Set Primary'}</span>
          </button>
        </div>

        {/* Primary Contact Card & Instant Call Button */}
        {activePrimary ? (
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white/10 p-3.5 rounded-xl border border-white/15">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white font-black text-lg shadow-md border border-white/30 shrink-0">
                {activePrimary.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-white">{activePrimary.name}</span>
                  {activePrimary.relationship && (
                    <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">
                      {activePrimary.relationship}
                    </span>
                  )}
                  <span className="text-[10px] font-black text-emerald-300 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Primary
                  </span>
                </div>
                <p className="text-xs text-red-100 font-mono font-bold mt-0.5">
                  {activePrimary.phone}
                </p>
              </div>
            </div>

            {/* Direct 1-Tap Call Anchor Button (Bypasses all app navigation) */}
            <a
              href={`tel:${activePrimary.phone}`}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 hover:text-black font-black py-3 px-5 rounded-xl flex items-center justify-center gap-2 text-sm shadow-xl transition-all cursor-pointer text-center active:scale-95 shrink-0"
              title={`Call ${activePrimary.name} immediately`}
            >
              <PhoneCall className="w-4 h-4 animate-bounce" />
              <span>QUICK CALL ({activePrimary.name.split(' ')[0].toUpperCase()})</span>
            </a>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 bg-white/10 p-3.5 rounded-xl border border-white/15">
            <div className="text-xs text-red-100">
              <span className="font-bold block text-white">No primary contact configured yet.</span>
              Tap Configure to set a trusted guardian for 1-tap emergency calling.
            </div>
            <button
              onClick={openConfig}
              className="bg-white text-red-700 hover:bg-red-50 font-black py-2.5 px-4 rounded-xl text-xs shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              Configure Now
            </button>
          </div>
        )}
      </div>

      {/* Configuration Modal */}
      <AnimatePresence>
        {isConfiguring && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 text-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-rose-400 font-black text-base">
                  <ShieldAlert className="w-5 h-5 text-rose-500" />
                  <span>Configure Quick Call Contact</span>
                </div>
                <button
                  onClick={() => setIsConfiguring(false)}
                  className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-300">
                Select from existing contacts or enter your trusted guardian (Mother, Father, Spouse, Friend) for instant 1-tap dialing during emergencies.
              </p>

              {/* Existing Contacts Selector if any exist */}
              {contacts.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Choose from saved contacts:
                  </label>
                  <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {contacts.map((c) => (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => handleSelectExisting(c.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                          selectedExistingId === c.id
                            ? 'bg-rose-950/60 border-rose-500 text-white font-bold'
                            : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-rose-400" />
                          <span>{c.name}</span>
                          <span className="text-slate-400 font-mono">({c.phone})</span>
                        </div>
                        {selectedExistingId === c.id && (
                          <Check className="w-4 h-4 text-rose-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Form Inputs for Name, Phone, and Relationship */}
              <form onSubmit={handleSaveConfig} className="space-y-3.5 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => {
                      setEditName(e.target.value);
                      setSelectedExistingId('new');
                    }}
                    placeholder="e.g. Maa / Mother / Rahul"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Emergency Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => {
                      setEditPhone(e.target.value);
                      setSelectedExistingId('new');
                    }}
                    placeholder="e.g. +91 9876543210"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Relationship / Tag (Optional)
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {['Mother', 'Father', 'Sister', 'Spouse', 'Friend', 'Guardian'].map(tag => (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => setEditRel(tag)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                          editRel === tag
                            ? 'bg-rose-600 border-rose-500 text-white'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={editRel}
                    onChange={(e) => setEditRel(e.target.value)}
                    placeholder="e.g. Mother, Sister, Roommate"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>

                <div className="flex gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsConfiguring(false)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-2.5 rounded-xl text-xs font-black shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Quick Contact</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
