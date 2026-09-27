import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useEmergency } from '../EmergencyContext';
import { useLanguage } from '../LanguageContext';
import { PoliceAlert, PoliceAlertStatus, EmergencyType } from '../types';
import { WEST_BENGAL_POLICE } from '../services/policeDatabase';
import { 
  updateAlertStatus, 
  sendPoliceMessageToUser, 
  createPoliceEmergencyAlert, 
  playPoliceRadioChime 
} from '../services/policeAlertService';
import { 
  playPoliceRadioStatic, 
  speakDispatchAnnouncement,
  startPiercingAlarm,
  stopPiercingAlarm
} from '../services/soundSynthesizer';
import PoliceTacticalRadar from './PoliceTacticalRadar';
import PoliceRadioComms from './PoliceRadioComms';
import { 
  ShieldAlert, 
  MapPin, 
  Phone, 
  Radio, 
  Car, 
  CheckCircle2, 
  Clock, 
  Navigation, 
  Volume2, 
  VolumeX, 
  FileText, 
  Send, 
  Filter, 
  AlertTriangle, 
  UserCheck, 
  Printer, 
  X,
  BatteryCharging,
  Sparkles,
  Search,
  Activity,
  Zap,
  Shield,
  Wifi,
  Bell,
  RefreshCw,
  Key,
  LogOut,
  BadgeAlert,
  Users,
  Mic,
  Play,
  Pause,
  Download,
  Vibrate
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import LiveClock from './LiveClock';
import { useAuth } from '../AuthContext';
import PoliceAuthPanel from './PoliceAuthPanel';
import RegisteredCitizensDatabase from './RegisteredCitizensDatabase';

interface PoliceStationControllerProps {
  onClose?: () => void;
  isModal?: boolean;
}

export default function PoliceStationController({ onClose, isModal = false }: PoliceStationControllerProps) {
  const { allPoliceAlerts, refreshPoliceAlerts } = useEmergency();
  const { t } = useLanguage();
  const { currentPoliceOfficer, isPoliceLoggedIn, logoutPoliceOfficer } = useAuth();

  // If officer is not logged in, show authentication panel
  if (!isPoliceLoggedIn) {
    return <PoliceAuthPanel onSuccess={() => {}} onCancel={onClose} />;
  }

  
  // Real-Time Duty Mode States
  const [isRealTimeWorkMode, setIsRealTimeWorkMode] = useState(true);
  const [selectedStationCode, setSelectedStationCode] = useState<string>('712601_ARAMBAGH'); // Default Arambagh PS
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ACTIVE');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlertForReport, setSelectedAlertForReport] = useState<PoliceAlert | null>(null);
  const [dispatchModalAlert, setDispatchModalAlert] = useState<PoliceAlert | null>(null);
  const [messageModalAlert, setMessageModalAlert] = useState<PoliceAlert | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeRadarAlert, setActiveRadarAlert] = useState<PoliceAlert | null>(null);
  const [dutyOfficerName, setDutyOfficerName] = useState('Inspector In-Charge S. Roy (Arambagh PS)');
  const [activeTab, setActiveTab] = useState<'DISPATCH_QUEUE' | 'TACTICAL_RADAR' | 'RADIO_COMMS' | 'CITIZENS_REGISTRY'>('DISPATCH_QUEUE');
  const [policeAudioPlayingId, setPoliceAudioPlayingId] = useState<string | null>(null);
  const policeAudioRef = useRef<HTMLAudioElement | null>(null);

  const handleTogglePlayPoliceAudio = (snippet: any) => {
    if (policeAudioPlayingId === snippet.id) {
      if (policeAudioRef.current) {
        policeAudioRef.current.pause();
      }
      setPoliceAudioPlayingId(null);
    } else {
      const src = snippet.audioBlobUrl || snippet.audioBase64;
      if (src) {
        if (!policeAudioRef.current) {
          policeAudioRef.current = new Audio(src);
        } else {
          policeAudioRef.current.src = src;
        }
        policeAudioRef.current.play().catch(e => console.warn('Audio play error in police console:', e));
        setPoliceAudioPlayingId(snippet.id);
        policeAudioRef.current.onended = () => setPoliceAudioPlayingId(null);
      }
    }
  };

  // Direct SOS dispatch trigger from registered database
  const handleDispatchForRegisteredUser = (user: any) => {
    // Generate simulated emergency near Arambagh / user town
    const lat = 22.8824 + (Math.random() - 0.5) * 0.02;
    const lng = 87.7842 + (Math.random() - 0.5) * 0.02;
    const alert = createPoliceEmergencyAlert(lat, lng, 'Danger', {
      name: user.name,
      phone: user.phone,
      id: user.id,
      email: user.email,
      bloodGroup: user.bloodGroup,
      guardianName: user.emergencyContactName,
      guardianPhone: user.emergencyContactPhone,
      address: user.address,
      city: user.city,
      customMessage: `🚨 জরুরি বিপদ অ্যালার্ট: "${user.name}" বিপদে পড়েছেন! অভিভাবক: ${user.emergencyContactName || 'N/A'} (${user.emergencyContactPhone || 'N/A'})। জিপিএস অবস্থান ট্র্যাক করা হয়েছে।`
    });
    refreshPoliceAlerts();
    setActiveTab('DISPATCH_QUEUE');
  };

  // Dispatch form state
  const [selectedUnit, setSelectedUnit] = useState('PCR Van 01 (Arambagh Sadar)');
  const [officerName, setOfficerName] = useState('SI R. Ghosh (Hooghly Police)');
  const [etaMinutes, setEtaMinutes] = useState(3);
  const [dispatchNotes, setDispatchNotes] = useState('');

  // Station info
  const currentStation = WEST_BENGAL_POLICE.find(p => p.code === selectedStationCode) || WEST_BENGAL_POLICE[0];

  // Filtered alerts
  const filteredAlerts = allPoliceAlerts.filter(alert => {
    if (selectedStationCode !== 'ALL' && alert.nearestStationCode !== selectedStationCode) {
      if (selectedStationCode.includes('HOOGHLY') && alert.district === 'Hooghly') {
        // match
      } else {
        return false;
      }
    }

    if (statusFilter === 'ACTIVE') {
      if (alert.status === 'RESOLVED' || alert.status === 'CANCELLED') return false;
    } else if (statusFilter === 'RESOLVED') {
      if (alert.status !== 'RESOLVED' && alert.status !== 'CANCELLED') return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        alert.id.toLowerCase().includes(q) ||
        alert.userName.toLowerCase().includes(q) ||
        alert.userPhone.includes(q) ||
        alert.nearestStationName.toLowerCase().includes(q) ||
        (alert.nearestStationPin && alert.nearestStationPin.includes(q)) ||
        (alert.addressEstimate && alert.addressEstimate.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  const activeAlertsCount = allPoliceAlerts.filter(a => a.status === 'PENDING' || a.status === 'DISPATCHED' || a.status === 'EN_ROUTE' || a.status === 'ON_SCENE').length;
  const pendingCount = allPoliceAlerts.filter(a => a.status === 'PENDING').length;
  const enRouteCount = allPoliceAlerts.filter(a => a.status === 'DISPATCHED' || a.status === 'EN_ROUTE' || a.status === 'ON_SCENE').length;
  const resolvedCount = allPoliceAlerts.filter(a => a.status === 'RESOLVED').length;

  const prevPendingCount = useRef(pendingCount);

  // Sound & Voice Announcement on new pending SOS in Real-Time Mode
  useEffect(() => {
    if (isRealTimeWorkMode && pendingCount > prevPendingCount.current) {
      if (soundEnabled) {
        playPoliceRadioChime();
        speakDispatchAnnouncement(`Attention Control Room. New citizen emergency SOS distress received at Arambagh Sector. Priority One.`);
      }
    }
    prevPendingCount.current = pendingCount;
  }, [pendingCount, isRealTimeWorkMode, soundEnabled]);

  // Real-Time ETA Countdown Engine
  useEffect(() => {
    if (!isRealTimeWorkMode) return;

    const interval = setInterval(() => {
      let changed = false;
      const updated = allPoliceAlerts.map(alert => {
        if ((alert.status === 'EN_ROUTE' || alert.status === 'DISPATCHED') && alert.etaMinutes && alert.etaMinutes > 0) {
          const nextEta = Math.max(0, alert.etaMinutes - 1);
          changed = true;
          if (nextEta === 0) {
            // Auto mark ON_SCENE when ETA hits 0
            if (soundEnabled) {
              speakDispatchAnnouncement(`Unit ${alert.dispatchedUnit || 'PCR'} has arrived on scene at citizen coordinates.`);
            }
            return {
              ...alert,
              etaMinutes: 0,
              status: 'ON_SCENE' as PoliceAlertStatus,
              policeNotes: 'PCR Unit arrived on scene. Visual contact established.'
            };
          }
          return { ...alert, etaMinutes: nextEta };
        }
        return alert;
      });

      if (changed) {
        refreshPoliceAlerts();
      }
    }, 60000); // Check every minute or can be adjusted

    return () => clearInterval(interval);
  }, [isRealTimeWorkMode, allPoliceAlerts, soundEnabled, refreshPoliceAlerts]);

  const handleSimulateAlert = (scenario: 'Arambagh' | 'Khanakul' | 'Tarakeswar' = 'Arambagh', type: EmergencyType = 'Danger') => {
    let lat = 22.8824;
    let lng = 87.7842;
    let name = 'Priyanka Sen (Bus Stand More)';
    let phone = '+91 98321 44521';

    if (scenario === 'Khanakul') {
      lat = 22.7092;
      lng = 87.8631;
      name = 'Sunita Mukherjee (Market Road)';
      phone = '+91 94332 77112';
    } else if (scenario === 'Tarakeswar') {
      lat = 22.8910;
      lng = 87.7950;
      name = 'Ananya Roy (Expressway Link)';
      phone = '+91 98001 22900';
    }

    const created = createPoliceEmergencyAlert(lat, lng, type, {
      name,
      phone,
      id: `CITIZEN-${Date.now().toString().slice(-4)}`
    });

    refreshPoliceAlerts();
    setActiveRadarAlert(created);

    if (soundEnabled) {
      playPoliceRadioChime();
      speakDispatchAnnouncement(`Emergency SOS signal received from ${name}. Location logged on tactical radar.`);
    }
  };

  const handleExecuteDispatch = () => {
    if (!dispatchModalAlert) return;
    updateAlertStatus(dispatchModalAlert.id, 'EN_ROUTE', {
      dispatchedUnit: selectedUnit,
      assignedOfficer: officerName,
      etaMinutes: Number(etaMinutes),
      policeReplyMessage: `🚨 [${dispatchModalAlert.nearestStationName}] ${selectedUnit} dispatched. ${officerName} is arriving in ~${etaMinutes} mins. Stay calm.`
    });

    if (soundEnabled) {
      playPoliceRadioStatic(180);
      speakDispatchAnnouncement(`Unit ${selectedUnit} authorized and dispatched with emergency sirens. Officer ${officerName}.`);
    }

    setDispatchModalAlert(null);
    refreshPoliceAlerts();
  };

  const handleRapidAutoDispatch = (alert: PoliceAlert) => {
    const defaultUnit = alert.nearestStationName.includes('Khanakul')
      ? 'Khanakul Shakti Quick Response Mobile'
      : 'PCR Van 01 (Arambagh Sadar)';
    const defaultOfficer = 'SI R. Ghosh (Hooghly Police)';

    updateAlertStatus(alert.id, 'EN_ROUTE', {
      dispatchedUnit: defaultUnit,
      assignedOfficer: defaultOfficer,
      etaMinutes: 2,
      policeReplyMessage: `🚨 [${alert.nearestStationName}] Priority PCR Unit dispatched instantly with flashing beacons. Help is arriving.`
    });

    if (soundEnabled) {
      playPoliceRadioStatic(180);
      speakDispatchAnnouncement(`Rapid Dispatch Activated. ${defaultUnit} en route to ${alert.userName}. ETA 2 minutes.`);
    }

    refreshPoliceAlerts();
  };

  const handleUpdateStatus = (alertId: string, status: PoliceAlertStatus) => {
    updateAlertStatus(alertId, status);
    if (soundEnabled) {
      playPoliceRadioStatic(120);
    }
    refreshPoliceAlerts();
  };

  const handleSendMessage = () => {
    if (!messageModalAlert || !customMessage.trim()) return;
    sendPoliceMessageToUser(messageModalAlert.id, customMessage.trim(), dutyOfficerName || 'Duty Desk Officer');
    
    if (soundEnabled) {
      playPoliceRadioStatic(150);
    }

    setCustomMessage('');
    setMessageModalAlert(null);
    refreshPoliceAlerts();
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Real-Time Command Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/40">
                  <Radio className="w-6 h-6 animate-pulse" />
                </div>
                {isRealTimeWorkMode && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-ping" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                    POLICE STATION CONTROLLER
                  </h1>
                  <span className={`border text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                    isRealTimeWorkMode 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm shadow-emerald-500/20' 
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${isRealTimeWorkMode ? 'bg-emerald-500 animate-ping' : 'bg-slate-500'}`} />
                    {isRealTimeWorkMode ? 'REAL-TIME WORK MODE ACTIVE' : 'DUTY STANDBY'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  West Bengal Police Emergency Command Desk • থানা জরুরি কন্ট্রোল সিস্টেম
                </p>
              </div>
            </div>

            {onClose && (
              <button 
                onClick={onClose}
                className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Station Selector & Real-Time Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Real-Time Duty Mode Toggle */}
            <button
              onClick={() => setIsRealTimeWorkMode(!isRealTimeWorkMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all flex items-center gap-1.5 cursor-pointer ${
                isRealTimeWorkMode
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-600/30'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{isRealTimeWorkMode ? 'Duty Mode: ON' : 'Duty Mode: PAUSED'}</span>
            </button>

            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs">
              <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
              <select
                value={selectedStationCode}
                onChange={(e) => setSelectedStationCode(e.target.value)}
                className="bg-transparent text-white font-bold outline-none cursor-pointer text-xs"
              >
                <optgroup label="Hooghly District Stations">
                  <option value="712601_ARAMBAGH" className="bg-slate-900 text-white">Arambagh PS (PIN 712601) - 03211-255223</option>
                  <option value="712413_KHANAKUL" className="bg-slate-900 text-white">Khanakul PS (PIN 712413) - 03211-266224</option>
                  <option value="712614_GOGHAT" className="bg-slate-900 text-white">Goghat PS (PIN 712614)</option>
                  <option value="712410_TARAKESWAR" className="bg-slate-900 text-white">Tarakeswar PS (PIN 712410)</option>
                  <option value="300072" className="bg-slate-900 text-white">Hooghly Sadar Commissionerate</option>
                </optgroup>
                <optgroup label="Statewide View">
                  <option value="ALL" className="bg-slate-900 text-white">All Police Stations (Statewide)</option>
                </optgroup>
              </select>
            </div>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Mute Siren Chime" : "Enable Siren Chime"}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                soundEnabled 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30' 
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Logged in Officer Badge & Logout */}
            {currentPoliceOfficer && (
              <div className="flex items-center gap-2 bg-red-950/80 border border-red-800/80 rounded-xl px-2.5 py-1.5 text-xs">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <div className="text-left hidden xl:block">
                  <div className="font-bold text-white leading-tight flex items-center gap-1">
                    <span>{currentPoliceOfficer.name}</span>
                    <span className="text-[10px] text-red-300 font-mono">({currentPoliceOfficer.badgeNumber})</span>
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight">
                    {currentPoliceOfficer.rank}
                  </div>
                </div>
                <button
                  onClick={logoutPoliceOfficer}
                  title="Log out of Police Console"
                  className="p-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Test Simulation Button */}
            <button
              onClick={() => handleSimulateAlert(selectedStationCode.includes('KHANAKUL') ? 'Khanakul' : 'Arambagh')}
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-lg shadow-red-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate SOS Dispatch</span>
            </button>

            {onClose && (
              <button 
                onClick={onClose}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Exit Console</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Real-time Status Metric Counters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/90 border border-red-500/30 rounded-2xl p-4 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                Immediate Distress (Pending)
              </span>
              <ShieldAlert className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-3xl font-black text-white font-mono">{pendingCount}</div>
            <p className="text-[11px] text-slate-400 mt-1">Requires Immediate PCR Dispatch</p>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-red-500/10 rounded-full blur-xl" />
          </div>

          <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Car className="w-4 h-4 text-amber-400" />
                Units Dispatched / En Route
              </span>
            </div>
            <div className="text-3xl font-black text-white font-mono">{enRouteCount}</div>
            <p className="text-[11px] text-slate-400 mt-1">Patrol Teams Intercepting</p>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-amber-500/10 rounded-full blur-xl" />
          </div>

          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Safely Resolved Today
              </span>
            </div>
            <div className="text-3xl font-black text-white font-mono">{resolvedCount}</div>
            <p className="text-[11px] text-slate-400 mt-1">Citizen Confirmed Safe & Secure</p>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl" />
          </div>

          <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-4 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-indigo-400" />
                Station Telemetry
              </span>
              <LiveClock />
            </div>
            <div className="text-sm font-bold text-white truncate">{currentStation.name}</div>
            <p className="text-[11px] text-indigo-300 mt-0.5">📞 {currentStation.contact} • PIN: {currentStation.pinCode || '712601'}</p>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl" />
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto">
          {[
            { id: 'DISPATCH_QUEUE', label: `🚨 Live Dispatch Queue (${filteredAlerts.length})`, icon: <Activity className="w-4 h-4" /> },
            { id: 'CITIZENS_REGISTRY', label: '👥 Registered Citizens & Women Dossier', icon: <Users className="w-4 h-4" /> },
            { id: 'TACTICAL_RADAR', label: '🛰️ GPS Tactical Radar Map', icon: <Navigation className="w-4 h-4" /> },
            { id: 'RADIO_COMMS', label: '📻 Police Radio & Air Comms', icon: <Radio className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 0. Registered Citizens Directory View */}
        {activeTab === 'CITIZENS_REGISTRY' && (
          <RegisteredCitizensDatabase onDispatchSOSForUser={handleDispatchForRegisteredUser} />
        )}

        {/* 1. Tactical Radar View */}
        {activeTab === 'TACTICAL_RADAR' && (
          <PoliceTacticalRadar
            alerts={allPoliceAlerts}
            selectedAlertId={activeRadarAlert?.id || null}
            onSelectAlert={(a) => {
              setActiveRadarAlert(a);
              setActiveTab('DISPATCH_QUEUE');
            }}
            isRealTimeMode={isRealTimeWorkMode}
          />
        )}

        {/* 2. Radio Comms View */}
        {activeTab === 'RADIO_COMMS' && (
          <PoliceRadioComms
            alerts={allPoliceAlerts}
            onRefresh={refreshPoliceAlerts}
          />
        )}

        {/* 3. Dispatch Queue View (Default) */}
        {activeTab === 'DISPATCH_QUEUE' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search case ID, citizen, phone, location, PIN..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Filter:
                </span>
                <button
                  onClick={() => setStatusFilter('ACTIVE')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === 'ACTIVE'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Active ({activeAlertsCount})
                </button>
                <button
                  onClick={() => setStatusFilter('RESOLVED')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === 'RESOLVED'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Resolved ({resolvedCount})
                </button>
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === 'ALL'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  All Records ({allPoliceAlerts.length})
                </button>
              </div>
            </div>

            {/* Alerts List */}
            {filteredAlerts.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
                <CheckCircle2 className="w-16 h-16 text-emerald-500/50 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">No active distress calls in this view</h3>
                  <p className="text-sm text-slate-400">All citizen signals are currently safe or matched filter criteria is clear.</p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => handleSimulateAlert('Arambagh', 'Danger')}
                    className="bg-red-600 hover:bg-red-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-lg cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" /> Trigger Arambagh SOS Test
                  </button>
                  <button
                    onClick={() => handleSimulateAlert('Khanakul', 'Harassment')}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-lg cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" /> Trigger Khanakul SOS Test
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredAlerts.map((alert) => {
                    const isPending = alert.status === 'PENDING';
                    const isEnRoute = alert.status === 'EN_ROUTE' || alert.status === 'DISPATCHED';
                    const isOnScene = alert.status === 'ON_SCENE';
                    const isResolved = alert.status === 'RESOLVED';

                    const mapUrl = `https://www.google.com/maps?q=${alert.location.lat},${alert.location.lng}`;
                    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${alert.location.lat},${alert.location.lng}`;

                    return (
                      <motion.div
                        key={alert.id}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`rounded-3xl p-5 md:p-6 border transition-all ${
                          isPending 
                            ? 'bg-red-950/40 border-red-500/60 shadow-xl shadow-red-950/50 ring-1 ring-red-500/40' 
                            : isEnRoute
                            ? 'bg-amber-950/30 border-amber-500/40 shadow-lg'
                            : isOnScene
                            ? 'bg-blue-950/30 border-blue-500/40 shadow-lg'
                            : 'bg-slate-900/80 border-slate-800 opacity-90'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                          {/* Case Title & Type */}
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-mono font-black text-indigo-400 bg-indigo-950/80 border border-indigo-800/80 px-2.5 py-0.5 rounded-lg">
                                {alert.id}
                              </span>
                              <span className={`text-xs font-black px-2.5 py-0.5 rounded-lg border ${
                                alert.emergencyType === 'Danger'
                                  ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                                  : alert.emergencyType === 'Attack' || alert.emergencyType === 'Kidnap'
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              }`}>
                                EMERGENCY: {alert.emergencyType.toUpperCase()}
                              </span>

                              {/* Status Badge */}
                              <span className={`text-xs font-black px-2.5 py-0.5 rounded-lg ${
                                isPending
                                  ? 'bg-red-600 text-white animate-bounce'
                                  : isEnRoute
                                  ? 'bg-amber-500 text-slate-950 font-black'
                                  : isOnScene
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-emerald-600 text-white'
                              }`}>
                                ● STATUS: {alert.status}
                              </span>

                              {alert.isSilentPanic && (
                                <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-red-600 text-white border border-red-400 flex items-center gap-1 animate-pulse">
                                  <Vibrate className="w-3.5 h-3.5 animate-bounce" />
                                  <span>SILENT PANIC (3s HOLD)</span>
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-sm pt-1">
                              <span className="font-black text-white text-base">{alert.userName}</span>
                              <a 
                                href={`tel:${alert.userPhone}`}
                                className="text-indigo-400 hover:text-indigo-300 font-mono font-bold flex items-center gap-1 hover:underline"
                              >
                                <Phone className="w-3.5 h-3.5" /> {alert.userPhone}
                              </a>
                              {alert.userBloodGroup && (
                                <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-black px-2 py-0.5 rounded-md">
                                  Blood: {alert.userBloodGroup}
                                </span>
                              )}
                              <span className="text-slate-400 text-xs flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> {new Date(alert.timestamp).toLocaleTimeString()} ({Math.max(1, Math.floor((Date.now() - alert.timestamp) / 60000))} min ago)
                              </span>
                              {alert.batteryLevel && (
                                <span className="text-slate-400 text-xs flex items-center gap-1">
                                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" /> {alert.batteryLevel}% Battery
                                </span>
                              )}
                            </div>

                            {/* Registered Citizen Profile & Guardian Dossier */}
                            {(alert.userGuardianPhone || alert.userAddress || alert.userCity) && (
                              <div className="flex flex-wrap items-center gap-3 text-xs pt-1.5 text-slate-300 bg-slate-950/40 px-3 py-1.5 rounded-xl border border-slate-800">
                                {alert.userGuardianPhone && (
                                  <span className="flex items-center gap-1 text-rose-400 font-medium">
                                    <span className="font-bold">অভিভাবক:</span> {alert.userGuardianName || 'Primary Guardian'} (
                                    <a href={`tel:${alert.userGuardianPhone}`} className="underline font-mono font-bold text-white hover:text-rose-300">
                                      {alert.userGuardianPhone}
                                    </a>
                                    )
                                  </span>
                                )}
                                {(alert.userCity || alert.userAddress) && (
                                  <span className="text-slate-400">
                                    • স্থায়ী এলাকা: <strong className="text-slate-200">{alert.userCity || alert.userAddress}</strong>
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Citizen Emergency Distress Message */}
                            {alert.emergencyMessage && (
                              <div className="p-2.5 bg-red-950/60 border border-red-700/60 rounded-xl text-xs text-red-200 mt-2 flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-black text-white block">ভুক্তভোগী নারীর বিপদ সংকেত বার্তা (Distress Message):</span>
                                  <p className="font-medium text-red-100">{alert.emergencyMessage}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Quick Navigation & Dossier */}
                          <div className="flex flex-wrap items-center gap-2">
                            <a
                              href={directionsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                            >
                              <Navigation className="w-3.5 h-3.5" />
                              <span>PCR Navigation</span>
                            </a>

                            <a
                              href={mapUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                            >
                              <MapPin className="w-3.5 h-3.5 text-red-400" />
                              <span>Live GPS Pin</span>
                            </a>

                            <button
                              onClick={() => setSelectedAlertForReport(alert)}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5 text-amber-400" />
                              <span>Incident Dossier PDF</span>
                            </button>
                          </div>
                        </div>

                        {/* Coordinates & Matched Station details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 text-xs">
                          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-red-400" /> Citizen Live Location
                            </span>
                            <p className="text-white font-mono font-bold text-sm">
                              {alert.location.lat.toFixed(5)}, {alert.location.lng.toFixed(5)}
                            </p>
                            <p className="text-slate-400 text-[11px] truncate">
                              {alert.addressEstimate || 'Nearby Area'}
                            </p>
                          </div>

                          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                              <Radio className="w-3.5 h-3.5 text-indigo-400" /> Matched Station Desk
                            </span>
                            <p className="text-white font-bold text-sm truncate">
                              {alert.nearestStationName}
                            </p>
                            <p className="text-indigo-300 text-[11px]">
                              PIN: {alert.nearestStationPin || '712601'} • 📞 {alert.nearestStationContact || '03211-255223'}
                            </p>
                          </div>

                          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                              <Car className="w-3.5 h-3.5 text-amber-400" /> Assigned Response Unit
                            </span>
                            <p className="text-white font-bold text-sm truncate">
                              {alert.dispatchedUnit || 'Awaiting Unit Assignment'}
                            </p>
                            <p className="text-amber-300 text-[11px] truncate">
                              {alert.assignedOfficer ? `Officer: ${alert.assignedOfficer}` : 'Status: Ready for dispatch'}
                              {alert.etaMinutes !== undefined && alert.etaMinutes > 0 ? ` (ETA: ~${alert.etaMinutes}m)` : alert.status === 'ON_SCENE' ? ' (ARRIVED ON SCENE)' : ''}
                            </p>
                          </div>
                        </div>

                        {/* Station-User Communication Banner */}
                        {alert.policeReplyMessage && (
                          <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-3 mb-4 text-xs flex items-start gap-2.5">
                            <Radio className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                            <div className="space-y-0.5 flex-1">
                              <span className="text-indigo-300 font-bold">Active Message Transmitted to Citizen's Screen:</span>
                              <p className="text-white italic">"{alert.policeReplyMessage}"</p>
                            </div>
                          </div>
                        )}

                        {/* Silent Panic / Live Ambient Audio Surveillance Snippets from Citizen Device */}
                        {((alert.audioSnippets && alert.audioSnippets.length > 0) || alert.isSilentPanic) && (
                          <div className="bg-slate-950/90 border border-red-500/40 rounded-2xl p-4 mb-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs font-bold text-red-300">
                                <Mic className="w-4 h-4 text-red-400 animate-pulse" />
                                <span>Citizen Ambient Audio Stream Snippets ({alert.audioSnippets?.length || 0})</span>
                              </div>
                              <span className="text-[10px] bg-red-600/30 text-red-300 font-bold px-2 py-0.5 rounded-md border border-red-500/40">
                                AUTO-UPLOADED FROM FIELD
                              </span>
                            </div>

                            {(!alert.audioSnippets || alert.audioSnippets.length === 0) ? (
                              <p className="text-xs text-slate-400 italic">
                                Waiting for incoming 5-second ambient audio snippets from citizen device...
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                                {alert.audioSnippets.map((snip, sIdx) => (
                                  <div 
                                    key={snip.id} 
                                    className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2 text-xs shadow-sm"
                                  >
                                    <div className="min-w-0">
                                      <span className="font-bold text-white text-[11px] block truncate flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                        Snippet #{alert.audioSnippets!.length - sIdx} ({snip.durationSeconds}s)
                                      </span>
                                      <span className="text-[10px] text-slate-400">
                                        {new Date(snip.timestamp).toLocaleTimeString()}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        onClick={() => handleTogglePlayPoliceAudio(snip)}
                                        className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                                      >
                                        {policeAudioPlayingId === snip.id ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                        <span>{policeAudioPlayingId === snip.id ? 'Pause' : 'Listen'}</span>
                                      </button>
                                      {snip.audioBlobUrl && (
                                        <a
                                          href={snip.audioBlobUrl}
                                          download={`${snip.id}.webm`}
                                          className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                                          title="Download court evidence file"
                                        >
                                          <Download className="w-3 h-3" />
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action Controllers */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {isPending && (
                              <>
                                <button
                                  onClick={() => handleRapidAutoDispatch(alert)}
                                  className="bg-red-600 hover:bg-red-500 text-white px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-red-600/40 transition-all cursor-pointer animate-pulse"
                                >
                                  <Zap className="w-4 h-4" />
                                  <span>1-CLICK RAPID DISPATCH</span>
                                </button>
                                <button
                                  onClick={() => setDispatchModalAlert(alert)}
                                  className="bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
                                >
                                  <Car className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Custom Unit Config</span>
                                </button>
                              </>
                            )}

                            {isEnRoute && (
                              <button
                                onClick={() => handleUpdateStatus(alert.id, 'ON_SCENE')}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                              >
                                <UserCheck className="w-4 h-4" />
                                <span>MARK UNIT ON SCENE</span>
                              </button>
                            )}

                            {(isEnRoute || isOnScene) && (
                              <button
                                onClick={() => handleUpdateStatus(alert.id, 'RESOLVED')}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>MARK CASE RESOLVED (CITIZEN SAFE)</span>
                              </button>
                            )}

                            <button
                              onClick={() => setMessageModalAlert(alert)}
                              className="bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Radio Message to User</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-2 text-xs">
                            <a
                              href={`tel:${alert.userPhone}`}
                              className="bg-slate-800 hover:bg-slate-700 text-emerald-400 px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>Call Citizen</span>
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Dispatch Modal */}
      <AnimatePresence>
        {dispatchModalAlert && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl text-white"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-red-400 font-black">
                  <Car className="w-5 h-5" />
                  <span>DISPATCH EMERGENCY POLICE UNIT</span>
                </div>
                <button onClick={() => setDispatchModalAlert(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl space-y-1">
                  <p className="text-slate-400">Target Distress Alert:</p>
                  <p className="text-white font-bold text-sm">{dispatchModalAlert.id} - {dispatchModalAlert.userName}</p>
                  <p className="text-indigo-400 font-mono">Location: {dispatchModalAlert.location.lat.toFixed(4)}, {dispatchModalAlert.location.lng.toFixed(4)}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">Select Response Unit / Vehicle:</label>
                  <select
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-bold outline-none cursor-pointer"
                  >
                    <option value="PCR Van 01 (Arambagh Sadar)">PCR Van 01 (Arambagh Sadar Mobile)</option>
                    <option value="PCR Van 04 (Khanakul Block Patrol)">PCR Van 04 (Khanakul Block Patrol)</option>
                    <option value="Hooghly Shakti QRT (Women Quick Response)">Hooghly Shakti QRT (Women Quick Response)</option>
                    <option value="Highway Interceptor 03 (Netaji Expressway)">Highway Interceptor 03 (Netaji Expressway)</option>
                    <option value="Motorcycle Quick Patrol Unit 02">Motorcycle Quick Patrol Unit 02</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold uppercase tracking-wider">Assigned Duty Officer:</label>
                    <input
                      type="text"
                      value={officerName}
                      onChange={(e) => setOfficerName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold uppercase tracking-wider">Estimated ETA (Mins):</label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={etaMinutes}
                      onChange={(e) => setEtaMinutes(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">Radio Dispatch Notes:</label>
                  <textarea
                    rows={2}
                    value={dispatchNotes}
                    onChange={(e) => setDispatchNotes(e.target.value)}
                    placeholder="e.g. Sirens and beacons activated, approaching via main market link..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setDispatchModalAlert(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl text-xs font-bold text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteDispatch}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl text-xs font-black shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Car className="w-4 h-4" /> AUTHORIZE DISPATCH
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Message Modal */}
      <AnimatePresence>
        {messageModalAlert && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl text-white"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-indigo-400 font-black">
                  <Radio className="w-5 h-5" />
                  <span>TRANSMIT RADIO MESSAGE TO CITIZEN</span>
                </div>
                <button onClick={() => setMessageModalAlert(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-slate-400">
                  This message will be displayed instantly on the citizen's live emergency screen:
                </p>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Quick Presets:</span>
                  {[
                    `🚨 [${messageModalAlert.nearestStationName}] PCR Van dispatched to your exact GPS coordinates. Stay where you are.`,
                    `📞 Duty Officer is calling your phone now. Please answer if safe.`,
                    `🚔 Siren and flashlights active on approaching vehicle. We see your live location.`,
                    `✅ Stay inside the nearest shop/lighted area. Police unit is 200m away.`
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCustomMessage(preset)}
                      className="w-full text-left p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] transition-all cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase tracking-wider">Custom Message Text:</label>
                  <textarea
                    rows={3}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Type message to citizen..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-xs outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setMessageModalAlert(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl text-xs font-bold text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!customMessage.trim()}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-3 rounded-xl text-xs font-black shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" /> TRANSMIT MESSAGE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Incident Dossier / FIR Summary Sheet Modal */}
      <AnimatePresence>
        {selectedAlertForReport && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white text-slate-900 rounded-3xl max-w-2xl w-full p-8 space-y-6 shadow-2xl my-8 print:m-0 print:p-0 print:shadow-none"
            >
              {/* Official Header */}
              <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xl tracking-tight uppercase text-slate-950">WEST BENGAL POLICE</span>
                    <span className="bg-slate-900 text-white text-[10px] font-black px-2 py-0.5 rounded">OFFICIAL CASE DOSSIER</span>
                  </div>
                  <p className="text-xs font-bold text-slate-600">EMERGENCY DISTRESS DISPATCH & TELEMETRY RECORD</p>
                  <p className="text-[11px] text-slate-500">Government of West Bengal • {selectedAlertForReport.nearestStationName} Desk</p>
                </div>
                <button 
                  onClick={() => setSelectedAlertForReport(null)}
                  className="p-2 rounded-full hover:bg-slate-100 print:hidden cursor-pointer"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Case Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-bold block text-[10px] uppercase">Incident Case Ref:</span>
                  <span className="font-mono font-black text-sm text-indigo-700">{selectedAlertForReport.id}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-bold block text-[10px] uppercase">Emergency Category:</span>
                  <span className="font-bold text-red-600 uppercase">{selectedAlertForReport.emergencyType}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-bold block text-[10px] uppercase">Status:</span>
                  <span className="font-bold text-slate-900 uppercase">{selectedAlertForReport.status}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-bold block text-[10px] uppercase">Complainant / Citizen:</span>
                  <span className="font-bold text-slate-900">{selectedAlertForReport.userName}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-bold block text-[10px] uppercase">Contact Number:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedAlertForReport.userPhone}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-bold block text-[10px] uppercase">Timestamp:</span>
                  <span className="font-bold text-slate-900">{new Date(selectedAlertForReport.timestamp).toLocaleString()}</span>
                </div>
              </div>

              {/* Location telemetry */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <span className="font-black text-slate-900 uppercase tracking-wider text-[11px] block">
                  GPS Telemetry & Location Stamp:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono">
                  <p><span className="text-slate-500">Latitude:</span> <strong>{selectedAlertForReport.location.lat.toFixed(6)}° N</strong></p>
                  <p><span className="text-slate-500">Longitude:</span> <strong>{selectedAlertForReport.location.lng.toFixed(6)}° E</strong></p>
                </div>
                <p className="text-slate-700"><span className="text-slate-500 font-medium">Nearest Station / Jurisdiction:</span> <strong>{selectedAlertForReport.nearestStationName} (PIN: {selectedAlertForReport.nearestStationPin || '712601'})</strong></p>
              </div>

              {/* Timeline Log */}
              <div className="space-y-3 text-xs">
                <span className="font-black text-slate-900 uppercase tracking-wider text-[11px] block">
                  Official Response Timeline:
                </span>
                <div className="space-y-2 border-l-2 border-indigo-300 pl-4 ml-2">
                  {selectedAlertForReport.timeline.map((item, idx) => (
                    <div key={idx} className="space-y-0.5 relative">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600" />
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{item.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{new Date(item.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{item.description}</p>
                      {item.officer && <p className="text-[10px] text-indigo-700 font-semibold">Attending Officer: {item.officer}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Signatures */}
              <div className="border-t pt-8 flex justify-between items-end text-xs text-slate-500">
                <div>
                  <p className="font-bold text-slate-900">Arambagh / Khanakul Police Division</p>
                  <p>Computerized Dispatch System • NIRBHOYA SATHI</p>
                </div>
                <div className="text-right space-y-1">
                  <div className="h-10 border-b border-slate-300 w-40 ml-auto" />
                  <p className="font-bold text-slate-900">Duty Officer In-Charge Signature</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t print:hidden">
                <button
                  onClick={() => window.print()}
                  className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-indigo-700 cursor-pointer shadow-md"
                >
                  <Printer className="w-4 h-4" /> Print / Save Dossier PDF
                </button>
                <button
                  onClick={() => setSelectedAlertForReport(null)}
                  className="bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-300 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
