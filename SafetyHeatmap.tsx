import React, { useState } from 'react';
import { Map, X, MapPin, Search, ShieldCheck, AlertTriangle, Crosshair, ZoomIn, ZoomOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../LanguageContext';

// Mock high-risk and safe zones in West Bengal / Kolkata
const SECTOR_DATA = [
  { id: 1, name: 'Sector V Night Path', type: 'danger', riskLevel: 'High Risk (9.2/10)', safetyTip: 'Avoid isolated alleys after 10 PM. Stay on main lighted avenues.', activePatrols: 2, contacts: 'Salt Lake PS' },
  { id: 2, name: 'Downtown Market Area', type: 'danger', riskLevel: 'Moderate-High Risk (7.5/10)', safetyTip: 'High crowd density. Keep emergency widget active on lockscreen.', activePatrols: 1, contacts: 'Bowbazar PS' },
  { id: 3, name: 'Alipore Lonely Alleyways', type: 'danger', riskLevel: 'High Risk (8.1/10)', safetyTip: 'Use continuous tracking and share live route with friends.', activePatrols: 1, contacts: 'Alipore PS' },
  { id: 4, name: 'Kolkata Police HQ Safe Zone', type: 'safe', riskLevel: 'Very Safe (0.5/10)', safetyTip: '24/7 active police presence, emergency rescue units stationed.', activePatrols: 12, contacts: 'Lalbazar HQ' },
  { id: 5, name: 'Salt Lake Women Center', type: 'safe', riskLevel: 'Very Safe (0.8/10)', safetyTip: 'Verified secure shelter, volunteer response system live.', activePatrols: 4, contacts: 'Salt Lake Women PS' },
  { id: 6, name: 'Siliguri Safe Hub', type: 'safe', riskLevel: 'Very Safe (1.2/10)', safetyTip: 'Community-led night patrols active. High public light density.', activePatrols: 3, contacts: 'Siliguri Town PS' }
];

export default function SafetyHeatmap() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState<typeof SECTOR_DATA[0] | null>(SECTOR_DATA[0]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const { t } = useLanguage();

  const filteredSectors = SECTOR_DATA.filter(sector => 
    sector.name.toLowerCase().includes(search.toLowerCase()) || 
    sector.contacts.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        <div className="flex flex-col items-center justify-center gap-3 p-6 rounded-3xl transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 bg-purple-50 text-purple-600">
          <Map size={32} />
          <span className="font-bold text-sm text-center">Safety Heatmap</span>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-5xl h-[90vh] rounded-[2.5rem] p-6 shadow-2xl flex flex-col md:flex-row gap-6 overflow-hidden"
            >
              {/* Left Column: Map Controls & Sector List */}
              <div className="w-full md:w-80 flex flex-col h-full shrink-0">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-black text-purple-600 text-xl flex items-center gap-2">
                      <MapPin />
                      <span>Safety Zones</span>
                    </h3>
                    <p className="text-gray-400 text-xs font-semibold lowercase">Active Area Safety Index</p>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="md:hidden p-2 hover:bg-gray-100 rounded-full">
                    <X />
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative mb-4">
                  <Search className="absolute left-3.5 top-3.5 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search areas, police stations..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl pl-10 pr-4 py-3 text-sm focus:ring-4 focus:ring-purple-100 focus:border-purple-600 transition-all outline-none font-bold text-gray-700"
                  />
                </div>

                {/* Sector List */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {filteredSectors.map((sector) => (
                    <button
                      key={sector.id}
                      onClick={() => setSelectedSector(sector)}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3 ${
                        selectedSector?.id === sector.id
                          ? 'bg-purple-50 border-purple-200 shadow-sm'
                          : 'bg-white border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className={`mt-1 p-1.5 rounded-lg ${sector.type === 'danger' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {sector.type === 'danger' ? <AlertTriangle size={16} /> : <ShieldCheck size={16} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-900 text-sm leading-tight truncate">{sector.name}</p>
                        <p className="text-xs text-gray-500 font-semibold mt-0.5">{sector.contacts}</p>
                        <span className={`inline-block mt-2 text-[10px] font-black px-2 py-0.5 rounded-full ${
                          sector.type === 'danger' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {sector.riskLevel}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: Visual SVG Interactive Grid Map */}
              <div className="flex-1 bg-slate-950 rounded-[2rem] p-6 flex flex-col relative h-full">
                <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
                  <button 
                    onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 1.8))}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-2 rounded-xl border border-white/10 transition-all active:scale-95"
                    title="Zoom In"
                  >
                    <ZoomIn size={18} />
                  </button>
                  <button 
                    onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.8))}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-2 rounded-xl border border-white/10 transition-all active:scale-95"
                    title="Zoom Out"
                  >
                    <ZoomOut size={18} />
                  </button>
                  <button onClick={() => setIsOpen(false)} className="hidden md:flex bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-2 rounded-xl border border-white/10 transition-all">
                    <X size={18} />
                  </button>
                </div>

                {/* Map Grid Canvas */}
                <div className="flex-1 relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]">
                  {/* Glowing Radar Sweep Animation */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-500/5 to-transparent animate-[pulse_6s_infinite] pointer-events-none" />

                  {/* SVG Map Representation */}
                  <motion.div 
                    animate={{ scale: zoomLevel }}
                    transition={{ type: 'spring', stiffness: 100 }}
                    className="w-full h-full flex items-center justify-center relative"
                  >
                    {/* Compass/Grid background */}
                    <div className="absolute w-96 h-96 rounded-full border border-white/5 flex items-center justify-center animate-[spin_120s_linear_infinite] pointer-events-none">
                      <div className="w-80 h-80 rounded-full border border-dashed border-white/5" />
                      <div className="w-48 h-48 rounded-full border border-white/5" />
                    </div>

                    {/* Interactive Sectors on SVG Map */}
                    {SECTOR_DATA.map((sector, index) => {
                      // Custom positions on grid for beautiful visual balance
                      const positions = [
                        { top: '35%', left: '30%' }, // Sector V
                        { top: '55%', left: '45%' }, // Downtown
                        { top: '70%', left: '25%' }, // Alipore
                        { top: '50%', left: '60%' }, // Lalbazar HQ
                        { top: '25%', left: '70%' }, // Salt Lake
                        { top: '15%', left: '40%' }  // Siliguri
                      ];
                      const pos = positions[index] || { top: '50%', left: '50%' };
                      const isSelected = selectedSector?.id === sector.id;

                      return (
                        <motion.button
                          key={sector.id}
                          onClick={() => setSelectedSector(sector)}
                          style={{ top: pos.top, left: pos.left }}
                          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
                          whileHover={{ scale: 1.2 }}
                        >
                          {/* Radiating rings for active threat / safety hubs */}
                          <div className="absolute -inset-4 rounded-full pointer-events-none">
                            <div className={`absolute inset-0 rounded-full animate-ping opacity-25 ${
                              sector.type === 'danger' ? 'bg-red-500' : 'bg-emerald-500'
                            }`} style={{ animationDuration: sector.type === 'danger' ? '1.5s' : '3s' }} />
                          </div>

                          {/* Center node */}
                          <div className={`relative w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all ${
                            isSelected 
                              ? 'scale-125 border-2 border-white ring-4 ring-indigo-500/50' 
                              : 'opacity-80 group-hover:opacity-100'
                          } ${sector.type === 'danger' ? 'bg-red-600 text-white' : 'bg-emerald-500 text-white'}`}>
                            {sector.type === 'danger' ? <AlertTriangle size={14} /> : <ShieldCheck size={14} />}
                          </div>

                          {/* Custom hover tooltip */}
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-10 bg-slate-900 border border-white/10 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-2xl">
                            {sector.name}
                          </div>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                </div>

                {/* Selected Sector Details Box */}
                {selectedSector && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    key={selectedSector.id}
                    className="mt-4 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          selectedSector.type === 'danger' ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {selectedSector.type === 'danger' ? 'Caution Patrol' : 'Safe Shelter'}
                        </span>
                        <h4 className="font-black text-sm text-white truncate">{selectedSector.name}</h4>
                      </div>
                      <p className="text-xs text-gray-300 font-medium leading-relaxed">{selectedSector.safetyTip}</p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0 w-full sm:w-auto">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Emergency Unit</p>
                        <p className="text-xs font-black text-purple-300">{selectedSector.contacts}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Patrol Frequency</p>
                        <p className="text-sm font-black text-white">{selectedSector.activePatrols} Units/Hour</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

