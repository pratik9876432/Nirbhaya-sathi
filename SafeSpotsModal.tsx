import React, { useState } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Phone, 
  CheckCircle, 
  X, 
  ExternalLink, 
  Clock, 
  Building2, 
  Hospital, 
  Sparkles, 
  Car,
  Navigation
} from 'lucide-react';
import { motion } from 'motion/react';

interface SafeSpotsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SafeHavenSpot {
  id: string;
  name: string;
  category: 'POLICE' | 'HOSPITAL' | 'SHOP_24X7' | 'GOVT';
  address: string;
  pin: string;
  phone: string;
  openHours: string;
  distanceKm: number;
  lat: number;
  lng: number;
  features: string[];
}

const ARAMBAGH_SAFE_SPOTS: SafeHavenSpot[] = [
  {
    id: 'spot-1',
    name: 'Arambagh Police Station (আরামবাগ থানা)',
    category: 'POLICE',
    address: 'Near Arambagh Netaji More, Sadar Hospital Rd, Arambagh, Hooghly',
    pin: '712601',
    phone: '03211-255223',
    openHours: '24 Hours Open (Always Staffed)',
    distanceKm: 0.8,
    lat: 22.8824,
    lng: 87.7842,
    features: ['Women Help Desk', 'CCTV Active Area', 'Armed PCR Vans', 'Safe Waiting Lounge']
  },
  {
    id: 'spot-2',
    name: 'Arambagh Sub-Divisional Hospital (মহকুমা হাসপাতাল)',
    category: 'HOSPITAL',
    address: 'Hospital Road, Arambagh, Hooghly',
    pin: '712601',
    phone: '03211-255013',
    openHours: '24x7 Emergency Room Active',
    distanceKm: 1.1,
    lat: 22.8870,
    lng: 87.7885,
    features: ['24x7 Security Guards', 'Bright Floodlights', 'Emergency Medical Ward', 'Ambulance Stand']
  },
  {
    id: 'spot-3',
    name: 'Khanakul Police Station (খানাকুল থানা)',
    category: 'POLICE',
    address: 'Khanakul Block 1, Market Link Rd, Hooghly',
    pin: '712413',
    phone: '03211-266224',
    openHours: '24 Hours Open',
    distanceKm: 4.2,
    lat: 22.7092,
    lng: 87.8631,
    features: ['Shakti Quick Response Team', 'Rural Women Desk', 'Mobile Patrol']
  },
  {
    id: 'spot-4',
    name: 'Arambagh Railway Station RPF Post (রেলওয়ে স্টেশন)',
    category: 'GOVT',
    address: 'Arambagh Station Rd, Arambagh',
    pin: '712601',
    phone: '139 / 182',
    openHours: '24 Hours Staffed by Railway Police',
    distanceKm: 1.6,
    lat: 22.8790,
    lng: 87.7790,
    features: ['RPF Security Desk', 'High Lumen Lighting', 'Public Announcement System', 'Auto-Rickshaw Stand']
  },
  {
    id: 'spot-5',
    name: 'Indian Oil 24x7 Fuel Station & Rest Point',
    category: 'SHOP_24X7',
    address: 'Arambagh-Tarakeswar State Highway 2, Arambagh',
    pin: '712601',
    phone: '03211-258100',
    openHours: '24 Hours Open & Well Lit',
    distanceKm: 2.3,
    lat: 22.8910,
    lng: 87.7950,
    features: ['24x7 Attendant Present', 'High Visibility Lighting', 'CCTV Monitored Forecourt']
  }
];

export default function SafeSpotsModal({ isOpen, onClose }: SafeSpotsModalProps) {
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'POLICE' | 'HOSPITAL' | 'SHOP_24X7'>('ALL');

  if (!isOpen) return null;

  const filteredSpots = ARAMBAGH_SAFE_SPOTS.filter(s => {
    if (selectedFilter === 'ALL') return true;
    return s.category === selectedFilter;
  });

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white text-gray-900 w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-xl text-gray-900">Verified Safe Haven Spots</h3>
              <p className="text-xs text-gray-500 font-bold">24x7 Well-lit shelter spots in Arambagh & Hooghly</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 rounded-full bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'ALL', label: 'All Shelters (5)' },
            { id: 'POLICE', label: 'Police Stations' },
            { id: 'HOSPITAL', label: '24x7 Hospitals' },
            { id: 'SHOP_24X7', label: 'Fuel/Lit Spots' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id as any)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedFilter === f.id
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Safe Spots Grid */}
        <div className="space-y-4">
          {filteredSpots.map((spot) => {
            const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`;

            return (
              <div
                key={spot.id}
                className="p-5 rounded-3xl border border-gray-100 bg-gray-50/80 hover:bg-white hover:border-emerald-200 transition-all space-y-3 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-black text-base text-gray-900">{spot.name}</h4>
                    <p className="text-xs text-gray-600 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      {spot.address} (PIN: {spot.pin})
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                      ~{spot.distanceKm} km away
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {spot.features.map((feat, i) => (
                    <span key={i} className="text-[11px] font-bold bg-white text-gray-700 border border-gray-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      {feat}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-200/60">
                  <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" /> {spot.openHours}
                  </span>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${spot.phone}`}
                      className="px-3 py-1.5 rounded-xl bg-gray-200/80 hover:bg-gray-300 text-gray-800 text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <Phone className="w-3.5 h-3.5 text-green-600" /> Call {spot.phone.split('/')[0]}
                    </a>

                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <Navigation className="w-3.5 h-3.5" /> Navigate Live
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
