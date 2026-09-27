import React, { useEffect, useState, useRef } from 'react';
import { PoliceAlert } from '../types';
import { Car, MapPin, Radio, Shield, Navigation, AlertTriangle, Crosshair, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface TacticalRadarProps {
  alerts: PoliceAlert[];
  selectedAlertId: string | null;
  onSelectAlert: (alert: PoliceAlert) => void;
  isRealTimeMode: boolean;
}

interface PatrolUnit {
  id: string;
  name: string;
  code: string;
  type: 'VAN' | 'QRT' | 'BIKE';
  x: number; // 0 - 100% on radar
  y: number; // 0 - 100% on radar
  targetAlertId?: string;
  status: 'PATROL' | 'DISPATCHED' | 'ON_SCENE';
  speedKmH: number;
}

const FIXED_STATIONS = [
  { id: 'stn-1', name: 'Arambagh PS', code: '712601_ARAMBAGH', x: 48, y: 46, pin: '712601' },
  { id: 'stn-2', name: 'Khanakul PS', code: '712413_KHANAKUL', x: 72, y: 76, pin: '712413' },
  { id: 'stn-3', name: 'Goghat PS', code: '712614_GOGHAT', x: 26, y: 32, pin: '712614' },
  { id: 'stn-4', name: 'Tarakeswar PS', code: '712410_TARAKESWAR', x: 68, y: 28, pin: '712410' },
  { id: 'stn-5', name: 'Hooghly Sadar CP', code: '300072', x: 84, y: 42, pin: '712101' },
];

export default function PoliceTacticalRadar({
  alerts,
  selectedAlertId,
  onSelectAlert,
  isRealTimeMode
}: TacticalRadarProps) {
  const [radarAngle, setRadarAngle] = useState(0);
  const [fleet, setFleet] = useState<PatrolUnit[]>([
    { id: 'pcr-01', name: 'PCR Van 01 (Arambagh Sadar)', code: 'PCR-01', type: 'VAN', x: 45, y: 43, status: 'PATROL', speedKmH: 38 },
    { id: 'pcr-02', name: 'Shakti QRT Mobile 01 (Women Wing)', code: 'QRT-01', type: 'QRT', x: 52, y: 50, status: 'PATROL', speedKmH: 45 },
    { id: 'pcr-04', name: 'PCR Van 04 (Khanakul Sector)', code: 'PCR-04', type: 'VAN', x: 70, y: 72, status: 'PATROL', speedKmH: 32 },
    { id: 'pcr-08', name: 'Highway Interceptor 03', code: 'INT-03', type: 'VAN', x: 60, y: 35, status: 'PATROL', speedKmH: 55 },
    { id: 'bike-02', name: 'Quick Response Bike 02', code: 'BIKE-02', type: 'BIKE', x: 38, y: 39, status: 'PATROL', speedKmH: 42 },
  ]);

  // Live Radar sweep animation
  useEffect(() => {
    if (!isRealTimeMode) return;
    const interval = setInterval(() => {
      setRadarAngle(prev => (prev + 3) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, [isRealTimeMode]);

  // Live Moving Patrol Units simulation towards active alerts
  useEffect(() => {
    if (!isRealTimeMode) return;

    const interval = setInterval(() => {
      setFleet(prevFleet => {
        return prevFleet.map(unit => {
          // Check if there is an active alert assigned or en route
          const activeDispatchedAlert = alerts.find(
            a => (a.status === 'EN_ROUTE' || a.status === 'DISPATCHED') && 
                 (a.dispatchedUnit?.includes(unit.code) || a.dispatchedUnit?.includes(unit.name.split(' ')[0]))
          );

          if (activeDispatchedAlert) {
            // Target coordinates mapped to radar space (40-60% base)
            const targetX = 50 + (activeDispatchedAlert.location.lng - 87.7842) * 200;
            const targetY = 50 - (activeDispatchedAlert.location.lat - 22.8824) * 200;

            const clampedTargetX = Math.max(15, Math.min(85, targetX));
            const clampedTargetY = Math.max(15, Math.min(85, targetY));

            const dx = clampedTargetX - unit.x;
            const dy = clampedTargetY - unit.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 1.5) {
              const step = 0.4;
              return {
                ...unit,
                x: unit.x + (dx / dist) * step,
                y: unit.y + (dy / dist) * step,
                status: 'DISPATCHED',
                targetAlertId: activeDispatchedAlert.id,
                speedKmH: Math.floor(48 + Math.random() * 15)
              };
            } else {
              return {
                ...unit,
                status: 'ON_SCENE',
                targetAlertId: activeDispatchedAlert.id,
                speedKmH: 0
              };
            }
          }

          // Idle subtle patrol wander
          const wanderX = (Math.random() - 0.5) * 0.2;
          const wanderY = (Math.random() - 0.5) * 0.2;
          return {
            ...unit,
            x: Math.max(10, Math.min(90, unit.x + wanderX)),
            y: Math.max(10, Math.min(90, unit.y + wanderY)),
            status: 'PATROL',
            speedKmH: Math.floor(25 + Math.random() * 15)
          };
        });
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isRealTimeMode, alerts]);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 md:p-6 shadow-2xl relative overflow-hidden space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Crosshair className="w-5 h-5 animate-spin" style={{ animationDuration: '12s' }} />
            </div>
            {isRealTimeMode && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                TACTICAL GPS RADAR & FLEET DISPATCH
              </h3>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                {isRealTimeMode ? '● LIVE SCAN 10Hz' : 'STANDBY'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Hooghly Police Command Sector • Sector Radius: 35 KM • GPS Differential Locked
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-bold">
          <span className="flex items-center gap-1.5 text-red-400">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" /> SOS Distress
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <Car className="w-3.5 h-3.5" /> PCR Fleet ({fleet.length})
          </span>
          <span className="flex items-center gap-1.5 text-indigo-400">
            <Shield className="w-3.5 h-3.5" /> Police Stations
          </span>
        </div>
      </div>

      {/* Radar Screen Visual Container */}
      <div className="relative w-full aspect-[16/9] max-h-[380px] bg-slate-950 rounded-2xl border border-slate-800/80 overflow-hidden select-none">
        {/* Radar Rings & Grid */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
          <div className="w-[85%] h-[85%] rounded-full border border-emerald-500/30 border-dashed" />
          <div className="w-[60%] h-[60%] rounded-full border border-emerald-500/40" />
          <div className="w-[35%] h-[35%] rounded-full border border-emerald-500/50" />
          <div className="w-[12%] h-[12%] rounded-full border border-emerald-500/60 bg-emerald-500/5" />
          <div className="absolute inset-x-0 top-1/2 h-[1px] bg-emerald-500/20" />
          <div className="absolute inset-y-0 left-1/2 w-[1px] bg-emerald-500/20" />
        </div>

        {/* Tactical Crosshair / Coordinate Markers */}
        <div className="absolute top-2 left-3 font-mono text-[10px] text-emerald-400/80 space-y-0.5 pointer-events-none">
          <p>GEO: 22.8824° N, 87.7842° E</p>
          <p>GRID: HOOGHLY-SECTOR-04</p>
        </div>

        <div className="absolute bottom-2 right-3 font-mono text-[10px] text-emerald-400/80 pointer-events-none text-right">
          <p>CARRIER: VHF / SAT-GPS</p>
          <p>ACTIVE TARGETS: {alerts.filter(a => a.status !== 'RESOLVED' && a.status !== 'CANCELLED').length}</p>
        </div>

        {/* Rotating Radar Sweep Cone */}
        {isRealTimeMode && (
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] pointer-events-none"
            style={{
              transform: `translate(-50%, -50%) rotate(${radarAngle}deg)`,
              background: 'conic-gradient(from 0deg, rgba(16, 185, 129, 0.22) 0deg, rgba(16, 185, 129, 0.05) 35deg, transparent 60deg)',
              borderRadius: '50%'
            }}
          />
        )}

        {/* Fixed Police Stations */}
        {FIXED_STATIONS.map((stn) => (
          <div
            key={stn.id}
            style={{ left: `${stn.x}%`, top: `${stn.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
          >
            <div className="w-5 h-5 rounded-lg bg-indigo-900/90 border border-indigo-400 flex items-center justify-center text-indigo-300 shadow-lg shadow-indigo-900/50">
              <Shield className="w-3 h-3" />
            </div>
            <div className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 top-6 bg-slate-900/95 text-white text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap border border-slate-700 shadow-xl z-30">
              <p>{stn.name}</p>
              <p className="text-[9px] text-indigo-300">PIN {stn.pin}</p>
            </div>
          </div>
        ))}

        {/* Active Patrol Fleet Units */}
        {fleet.map((unit) => (
          <motion.div
            key={unit.id}
            animate={{ left: `${unit.x}%`, top: `${unit.y}%` }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-20"
          >
            <div className={`p-1 rounded-lg border shadow-lg transition-all ${
              unit.status === 'DISPATCHED'
                ? 'bg-amber-500 text-slate-950 border-amber-300 animate-pulse scale-110 shadow-amber-500/50'
                : unit.status === 'ON_SCENE'
                ? 'bg-blue-600 text-white border-blue-300 shadow-blue-600/50'
                : 'bg-slate-800 text-amber-300 border-amber-400/40 shadow-slate-900'
            }`}>
              <Car className="w-3.5 h-3.5" />
            </div>

            <div className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 bottom-6 bg-slate-900/95 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl whitespace-nowrap border border-slate-700 shadow-xl z-30 space-y-0.5">
              <p className="text-amber-300">{unit.name}</p>
              <p className="text-slate-400 font-mono text-[9px]">Speed: {unit.speedKmH} km/h • Status: {unit.status}</p>
            </div>
          </motion.div>
        ))}

        {/* Active Citizen Distress Alerts (Red Pulsing Beacons) */}
        {alerts.map((alert) => {
          const isActive = alert.status === 'PENDING' || alert.status === 'DISPATCHED' || alert.status === 'EN_ROUTE' || alert.status === 'ON_SCENE';
          if (!isActive) return null;

          // Map alert lat/lng to percentage in Arambagh region (centered around 22.8824, 87.7842)
          const posX = 50 + (alert.location.lng - 87.7842) * 200;
          const posY = 50 - (alert.location.lat - 22.8824) * 200;
          const clampedX = Math.max(12, Math.min(88, posX));
          const clampedY = Math.max(12, Math.min(88, posY));

          const isSelected = selectedAlertId === alert.id;
          const isPending = alert.status === 'PENDING';

          return (
            <div
              key={alert.id}
              onClick={() => onSelectAlert(alert)}
              style={{ left: `${clampedX}%`, top: `${clampedY}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-25 group"
            >
              {/* Pulsing Beacon Wave */}
              <span className={`absolute -inset-3 rounded-full animate-ping opacity-75 ${
                isPending ? 'bg-red-500' : 'bg-amber-500'
              }`} />

              <div className={`relative w-7 h-7 rounded-full flex items-center justify-center shadow-xl border-2 transition-transform ${
                isSelected ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'
              } ${
                isPending 
                  ? 'bg-red-600 border-red-300 text-white animate-bounce' 
                  : 'bg-amber-600 border-amber-300 text-white'
              }`}>
                <MapPin className="w-4 h-4" />
              </div>

              {/* Tag Callout */}
              <div className="absolute left-1/2 -translate-x-1/2 top-8 bg-black/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-xl whitespace-nowrap border border-red-500 shadow-2xl z-30">
                <p className="text-red-400 font-black">{alert.id}</p>
                <p className="text-slate-200">{alert.userName.split(' ')[0]} ({alert.emergencyType})</p>
                {alert.etaMinutes && (
                  <p className="text-amber-400 font-mono">ETA: {alert.etaMinutes}m</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-Time Telemetry Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
        <div className="p-2.5 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <div className="truncate">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">GPS Sat-Lock</span>
            <span className="text-white font-mono font-bold">12 Sats (Diff ±2.4m)</span>
          </div>
        </div>

        <div className="p-2.5 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center gap-2.5">
          <Car className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="truncate">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Fleet Patrolling</span>
            <span className="text-white font-mono font-bold">{fleet.filter(f => f.status === 'PATROL').length} Units Active</span>
          </div>
        </div>

        <div className="p-2.5 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center gap-2.5">
          <Navigation className="w-4 h-4 text-red-400 shrink-0" />
          <div className="truncate">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Emergency Intercepts</span>
            <span className="text-white font-mono font-bold">
              {alerts.filter(a => a.status === 'EN_ROUTE' || a.status === 'DISPATCHED').length} Active Missions
            </span>
          </div>
        </div>

        <div className="p-2.5 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center gap-2.5">
          <Radio className="w-4 h-4 text-indigo-400 shrink-0" />
          <div className="truncate">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Radio Frequency</span>
            <span className="text-white font-mono font-bold">156.800 MHz (Hooghly)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
