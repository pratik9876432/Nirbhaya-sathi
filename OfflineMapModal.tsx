import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  createCachedTileLayer, 
  preCacheAreaTiles, 
  getCachedTileCount,
  clearTileCache 
} from '../services/mapTileCacheService';
import { WEST_BENGAL_POLICE, findNearestPoliceStationWithDetails } from '../services/policeDatabase';
import { VERIFIED_HOSPITALS, findNearestHospital } from '../services/hospitalDatabase';
import { useLanguage } from '../LanguageContext';
import { 
  MapPin, 
  Map, 
  Wifi, 
  WifiOff, 
  Database, 
  DownloadCloud, 
  ShieldCheck, 
  Building2, 
  Hospital, 
  RotateCw, 
  CheckCircle2, 
  X,
  Compass,
  Trash2,
  Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OfflineMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OfflineMapModal({ isOpen, onClose }: OfflineMapModalProps) {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  // Default coordinate: Arambagh, Hooghly
  const [currentLat, setCurrentLat] = useState(22.8824);
  const [currentLng, setCurrentLng] = useState(87.7842);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [cachedTileCount, setCachedTileCount] = useState<number>(0);
  const [isCaching, setIsCaching] = useState(false);
  const [cacheProgressText, setCacheProgressText] = useState<string | null>(null);
  const [cacheSuccessMsg, setCacheSuccessMsg] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<'current' | 'kolkata' | 'hooghly' | 'siliguri'>('current');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // Sync online status & update tile count
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    getCachedTileCount().then(c => setCachedTileCount(c));

    // Get current GPS position if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentLat(pos.coords.latitude);
          setCurrentLng(pos.coords.longitude);
        },
        () => {}
      );
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize or update Leaflet map inside modal
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [currentLat, currentLng],
          zoom: 13,
          attributionControl: false,
        });

        // Add custom offline cached tile layer
        const cachedLayer = createCachedTileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution: '&copy; OpenStreetMap',
        });
        cachedLayer.addTo(map);

        const markersGroup = L.layerGroup().addTo(map);
        markersGroupRef.current = markersGroup;
        mapInstanceRef.current = map;
      } else {
        mapInstanceRef.current.setView([currentLat, currentLng], 13);
        mapInstanceRef.current.invalidateSize();
      }

      // Render markers for current center, nearest police, and nearest hospital
      renderMapMarkers();
    }, 150);

    return () => clearTimeout(timer);
  }, [isOpen, currentLat, currentLng]);

  const renderMapMarkers = () => {
    const map = mapInstanceRef.current;
    const group = markersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // 1. User / Center Marker
    const userHtml = `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-8 h-8 rounded-full bg-blue-500/40 animate-ping"></div>
        <div class="relative w-7 h-7 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-white shadow-xl">
          <div class="w-2.5 h-2.5 bg-white rounded-full"></div>
        </div>
      </div>
    `;
    const userIcon = L.divIcon({ html: userHtml, className: 'center-marker', iconSize: [28, 28], iconAnchor: [14, 14] });
    L.marker([currentLat, currentLng], { icon: userIcon }).addTo(group).bindPopup('<b>Selected Location / Live GPS</b>');

    // 2. Nearest Police Station
    const nearestPolice = findNearestPoliceStationWithDetails(currentLat, currentLng);
    const policeHtml = `
      <div class="w-8 h-8 rounded-xl bg-indigo-600 text-white border-2 border-white flex items-center justify-center shadow-lg text-xs font-bold">
        👮
      </div>
    `;
    const policeIcon = L.divIcon({ html: policeHtml, className: 'police-marker', iconSize: [32, 32], iconAnchor: [16, 16] });
    L.marker([nearestPolice.station.location.lat, nearestPolice.station.location.lng], { icon: policeIcon })
      .addTo(group)
      .bindPopup(`<b>${nearestPolice.station.name}</b><br/>Dist: ${nearestPolice.distanceKm} km<br/>Tel: ${nearestPolice.station.contact}`);

    // 3. Nearest Hospital
    const nearestHosp = findNearestHospital(currentLat, currentLng);
    const hospHtml = `
      <div class="w-8 h-8 rounded-xl bg-emerald-600 text-white border-2 border-white flex items-center justify-center shadow-lg text-xs font-bold">
        🏥
      </div>
    `;
    const hospIcon = L.divIcon({ html: hospHtml, className: 'hosp-marker', iconSize: [32, 32], iconAnchor: [16, 16] });
    L.marker([nearestHosp.hospital.location.lat, nearestHosp.hospital.location.lng], { icon: hospIcon })
      .addTo(group)
      .bindPopup(`<b>${nearestHosp.hospital.name}</b><br/>Dist: ${nearestHosp.distanceKm} km<br/>Emergency: ${nearestHosp.hospital.contact}`);
  };

  const handleDownloadTiles = async () => {
    setIsCaching(true);
    setCacheProgressText(isBn ? 'ম্যাপ টাইলস ক্যাশে সংরক্ষিত হচ্ছে...' : 'Caching offline map tiles...');
    setCacheSuccessMsg(null);

    try {
      const res = await preCacheAreaTiles(
        currentLat,
        currentLng,
        [12, 13, 14, 15],
        (done, total) => {
          setCacheProgressText(`${done} / ${total} ${isBn ? 'টাইলস সেভ হয়েছে' : 'tiles saved'}`);
        }
      );

      const count = await getCachedTileCount();
      setCachedTileCount(count);
      setIsCaching(false);
      setCacheProgressText(null);
      setCacheSuccessMsg(
        isBn 
          ? `সফলভাবে ${res.successful}টি টাইল অফলাইনে সেভ হয়েছে! ইন্টারনেট ছাড়াও ম্যাপ কাজ করবে।`
          : `Successfully cached ${res.successful} map tiles! Map and route will work without internet.`
      );

      setTimeout(() => setCacheSuccessMsg(null), 4000);
    } catch (err: any) {
      setIsCaching(false);
      setCacheProgressText(null);
      setCacheSuccessMsg(isBn ? 'টাইল ক্যাশিং ব্যর্থ হয়েছে' : 'Tile caching failed. Try again.');
    }
  };

  const handleClearCache = async () => {
    await clearTileCache();
    const count = await getCachedTileCount();
    setCachedTileCount(count);
    setCacheSuccessMsg(isBn ? 'ম্যাপ ক্যাশ খালি করা হয়েছে' : 'Tile cache cleared successfully');
    setTimeout(() => setCacheSuccessMsg(null), 2500);
  };

  const handlePresetSelect = (preset: 'current' | 'kolkata' | 'hooghly' | 'siliguri') => {
    setSelectedPreset(preset);
    let lat = currentLat;
    let lng = currentLng;

    if (preset === 'kolkata') {
      lat = 22.5726;
      lng = 88.3639;
    } else if (preset === 'hooghly') {
      lat = 22.8824;
      lng = 87.7842;
    } else if (preset === 'siliguri') {
      lat = 26.7271;
      lng = 88.3953;
    }

    setCurrentLat(lat);
    setCurrentLng(lng);
    mapInstanceRef.current?.setView([lat, lng], 13);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white w-full max-w-4xl h-[90vh] rounded-[2.5rem] flex flex-col shadow-2xl overflow-hidden border border-gray-100"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
              <Database className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-xl text-white">
                  {isBn ? 'অফলাইন ইমার্জেন্সি ম্যাপ ও টাইল ক্যাশ' : 'Offline Emergency Map & Tile Cache'}
                </h3>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  isOnline ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                }`}>
                  {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3 animate-pulse" />}
                  {isOnline ? 'Online' : 'Offline Mode'}
                </span>
              </div>
              <p className="text-indigo-200 text-xs mt-0.5 font-medium">
                {isBn 
                  ? 'ইন্টারনেট না থাকলেও নিকটবর্তী থানা ও হাসপাতাল সরাসরি ম্যাপে দেখুন।'
                  : 'Cached OpenStreetMap tiles + offline police & hospital database for zero-connectivity emergencies.'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 text-indigo-200 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Map + Controls */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Panel: Controls, Presets & Tile Cache Stats */}
          <div className="w-full md:w-80 p-5 bg-gray-50 border-r border-gray-100 flex flex-col justify-between gap-4 overflow-y-auto shrink-0">
            <div className="space-y-4">
              {/* Storage Stats Box */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200/70 shadow-sm space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{isBn ? 'ক্যাশ স্থিতি' : 'Offline Cache Storage'}</span>
                </span>

                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-slate-900 font-mono">
                    {cachedTileCount}
                  </span>
                  <span className="text-xs font-bold text-gray-500">
                    {isBn ? 'টাইলস সংরক্ষিত' : 'tiles in storage'}
                  </span>
                </div>

                <p className="text-[11px] text-gray-500 leading-tight">
                  {cachedTileCount > 0 
                    ? (isBn ? '✅ ইন্টারনেট সংযোগ বিচ্ছিন্ন হলেও ম্যাপ দৃশ্যমান থাকবে।' : '✅ Offline map tiles ready for instant zero-data rendering.')
                    : (isBn ? '⚠️ কোনো টাইল সেভ করা নেই। নিচের বাটনে ক্লিক করে অফলাইন ম্যাপ সেভ করুন।' : '⚠️ No tiles cached yet. Click "Save Offline Map" below.')}
                </p>
              </div>

              {/* Area Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 block">
                  {isBn ? 'এলাকা নির্বাচন করুন:' : 'Select Target Region:'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handlePresetSelect('hooghly')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                      selectedPreset === 'hooghly'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Arambagh / Hooghly
                  </button>
                  <button
                    onClick={() => handlePresetSelect('kolkata')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                      selectedPreset === 'kolkata'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Kolkata City
                  </button>
                  <button
                    onClick={() => handlePresetSelect('siliguri')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                      selectedPreset === 'siliguri'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Siliguri / North
                  </button>
                  <button
                    onClick={() => handlePresetSelect('current')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer flex items-center gap-1 ${
                      selectedPreset === 'current'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <Navigation className="w-3 h-3" /> Live GPS
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleDownloadTiles}
                  disabled={isCaching || !isOnline}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-3 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <DownloadCloud className={`w-4 h-4 ${isCaching ? 'animate-bounce' : ''}`} />
                  <span>{isCaching ? (cacheProgressText || 'Caching...') : (isBn ? '📥 এই এলাকার ম্যাপ অফলাইনে সেভ করুন' : '📥 Pre-Cache Offline Map')}</span>
                </button>

                {cachedTileCount > 0 && (
                  <button
                    onClick={handleClearCache}
                    className="w-full bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isBn ? 'ক্যাশ মুছে ফেলুন' : 'Clear Tile Cache'}</span>
                  </button>
                )}
              </div>

              {/* Notification Banner */}
              {cacheSuccessMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-3 rounded-xl flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{cacheSuccessMsg}</span>
                </div>
              )}
            </div>

            {/* Offline Resilience Note */}
            <div className="bg-amber-50 rounded-2xl p-3.5 border border-amber-200 text-[11px] text-amber-900 space-y-1">
              <span className="font-black flex items-center gap-1 text-amber-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                {isBn ? 'সম্পূর্ণ অফলাইন সুরক্ষা' : 'Guaranteed Offline Safety'}
              </span>
              <p className="leading-snug text-amber-800/90">
                {isBn
                  ? 'পশ্চিমবঙ্গের ৫০০+ থানা এবং সমস্ত জেলা হাসপাতালের জিপিএস ডেটা অ্যাপের ভেতর অন্তর্ভুক্ত থাকায় ইন্টারনেট ছাড়াও দিকনির্দেশনা পাওয়া যাবে।'
                  : 'All 500+ West Bengal Police Stations and District Hospitals are stored natively client-side for offline distance & bearing calculations.'}
              </p>
            </div>
          </div>

          {/* Right Panel: Leaflet Interactive Map View */}
          <div className="flex-1 relative bg-slate-900 min-h-[300px]">
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Offline Map HUD Badges */}
            <div className="absolute top-3 left-3 z-[400] flex flex-col gap-1.5 pointer-events-none">
              <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-xs font-black text-white shadow-xl flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Leaflet Cached Layer • IndexedDB Storage</span>
              </div>
              <div className="bg-black/75 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10 text-[11px] text-slate-300 font-mono">
                Lat: {currentLat.toFixed(4)}, Lng: {currentLng.toFixed(4)}
              </div>
            </div>

            {/* Legend Overlay at Bottom Left */}
            <div className="absolute bottom-3 left-3 z-[400] bg-slate-950/85 backdrop-blur-md p-2.5 rounded-xl border border-white/15 text-[11px] text-white flex flex-col gap-1 shadow-xl">
              <span className="text-[10px] font-black uppercase text-slate-400">Map Legend</span>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600 border border-white inline-block"></span>
                <span>You / Center Position</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-indigo-600 border border-white inline-block"></span>
                <span>Police Station</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-emerald-600 border border-white inline-block"></span>
                <span>Hospital Safe Haven</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
