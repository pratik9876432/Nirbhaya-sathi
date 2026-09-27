import React, { useState } from 'react';
import { WEST_BENGAL_POLICE } from '../services/policeDatabase';
import { useLanguage } from '../LanguageContext';
import { Search, MapPin, Phone, Building, Info, Navigation, ChevronRight, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PoliceFinder() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Search filter across name, district, pinCode
  const filtered = WEST_BENGAL_POLICE.filter(ps => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      ps.name.toLowerCase().includes(q) || 
      ps.district.toLowerCase().includes(q) ||
      (ps.pinCode && ps.pinCode.toLowerCase().includes(q))
    );
  });

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        <div className="flex flex-col items-center justify-center gap-3 p-6 rounded-3xl bg-blue-50 text-blue-600 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95">
          <Building size={32} />
          <span className="font-bold text-sm text-center">{t('policeFinder')} ({WEST_BENGAL_POLICE.length})</span>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-2xl h-[85vh] rounded-[2.5rem] flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-indigo-600 font-black text-xl">
                    <Building />
                    <span>{t('policeFinder')}</span>
                  </div>
                  <p className="text-gray-500 text-sm font-medium mt-1">{t('policeFinderDesc')}</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full bg-gray-50">
                  <ChevronRight className="rotate-90 text-gray-500" />
                </button>
              </div>

              <div className="p-4 border-b border-gray-100 space-y-3 bg-white">
                <div className="relative flex items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus-within:ring-4 focus-within:ring-indigo-500/20 focus-within:border-indigo-600 transition-all">
                  <Search className="w-5 h-5 text-gray-400 mr-3" />
                  <input 
                    type="text" 
                    placeholder={t('searchPolicePlaceholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 text-md flex-1 outline-none font-bold text-gray-800"
                  />
                  {search && (
                    <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">{filtered.length} found</span>
                  )}
                </div>

                {/* Quick Selection Tags */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
                  <span className="text-gray-400 uppercase tracking-wider text-[10px] shrink-0 font-black">Quick:</span>
                  {[
                    { label: 'Arambagh (712601)', query: '712601' },
                    { label: 'Khanakul (712413)', query: '712413' },
                    { label: 'Hooghly District', query: 'Hooghly' },
                    { label: 'Women PS', query: 'Women' }
                  ].map((chip) => (
                    <button
                      key={chip.query}
                      onClick={() => setSearch(search === chip.query ? '' : chip.query)}
                      className={`px-3 py-1.5 rounded-full border transition-all shrink-0 cursor-pointer ${
                        search === chip.query 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200'
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-100 shrink-0 font-bold hover:bg-red-100 transition-all"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
                {filtered.map(ps => (
                  <div key={ps.code} className="bg-white border border-gray-200 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all group flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h4 className="font-bold text-gray-900 text-lg">{ps.name}</h4>
                        <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full ${ps.type === 'Women' ? 'bg-pink-100 text-pink-700' : ps.type === 'Cyber' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                          {ps.type}
                        </span>
                        {ps.pinCode && (
                          <span className="bg-indigo-50 text-indigo-700 text-[11px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                            <Hash size={12} /> PIN: {ps.pinCode}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 font-bold flex items-center gap-1.5">
                        <MapPin size={14} className="text-gray-400" /> {ps.district}, West Bengal
                      </p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button 
                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${ps.location.lat},${ps.location.lng}`, '_blank')}
                        className="flex-1 sm:flex-none border-2 border-indigo-100 text-indigo-600 font-bold py-2.5 px-4 rounded-xl flex justify-center items-center gap-2 hover:bg-indigo-50 transition-colors"
                      >
                        <Navigation size={18} />
                        <span>{t('navigate')}</span>
                      </button>
                      <button 
                        onClick={() => window.open(`tel:${ps.contact}`)}
                        className="flex-1 sm:flex-none bg-green-600 text-white font-bold py-2.5 px-4 rounded-xl flex justify-center items-center gap-2 shadow-lg shadow-green-100 hover:bg-green-700 transition-colors"
                      >
                        <Phone size={18} />
                        <span>{t('call')}</span>
                      </button>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300">
                    <Info className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-bold text-lg">{t('noPoliceFound')}</p>
                    <p className="text-gray-400 text-sm mt-1">Try searching PIN code (712601, 712413), district or name.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
