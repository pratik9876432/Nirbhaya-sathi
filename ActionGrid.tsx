import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import SafetyTimer from './SafetyTimer';
import PoliceFinder from './PoliceFinder';
import LiveTrip from './LiveTrip';
import EmergencyContacts from './EmergencyContacts';
import PoliceSiren from './PoliceSiren';
import VoiceSOS from './VoiceSOS';
import SafetyHeatmap from './SafetyHeatmap';
import FakeCallModal from './FakeCallModal';
import SafeJourneyModal from './SafeJourneyModal';
import AudioEvidenceModal from './AudioEvidenceModal';
import TacticalStrobeModal from './TacticalStrobeModal';
import SafeSpotsModal from './SafeSpotsModal';
import PanicDefenseModal from './PanicDefenseModal';
import OfflineMapModal from './OfflineMapModal';
import { 
  Users, 
  Home, 
  Mountain, 
  GraduationCap, 
  MessageSquareWarning,
  Radio,
  Phone,
  Navigation,
  FileAudio,
  Flashlight,
  Building2,
  ShieldAlert,
  Zap,
  Database
} from 'lucide-react';
import { motion } from 'motion/react';
import { ActiveModalType } from './FeatureModals';

interface ActionGridProps {
  onOpenModal?: (modal: ActiveModalType) => void;
  onOpenPoliceController?: () => void;
}

export default function ActionGrid({ onOpenModal, onOpenPoliceController }: ActionGridProps) {
  const { t, language } = useLanguage();
  const isBn = language === 'bn';

  // Advanced Tool Modal States (100% Client-Side)
  const [showFakeCall, setShowFakeCall] = useState(false);
  const [showSafeJourney, setShowSafeJourney] = useState(false);
  const [showAudioVault, setShowAudioVault] = useState(false);
  const [showStrobe, setShowStrobe] = useState(false);
  const [showSafeSpots, setShowSafeSpots] = useState(false);
  const [showPanicDefense, setShowPanicDefense] = useState(false);
  const [showOfflineMap, setShowOfflineMap] = useState(false);

  const advancedSafetyCards = [
    {
      id: 'panicDefense',
      icon: <ShieldAlert className="animate-pulse" />,
      label: isBn ? 'প্যানিক ও সেলফ ডিফেন্স' : 'Panic & Self-Defense',
      sublabel: isBn ? 'আঘাতের স্থান ও মুক্তির নিয়ম' : 'Strikes, Escapes & 4s Panic Guide',
      color: 'bg-gradient-to-br from-red-600 to-rose-700 text-white hover:from-red-500 hover:to-rose-600 shadow-md shadow-red-600/30 border-red-400',
      iconColor: 'text-red-600',
      action: () => setShowPanicDefense(true)
    },
    {
      id: 'policeController',
      icon: <Radio className="animate-pulse" />,
      label: t('policeController') || 'Police Controller Desk',
      sublabel: 'Live GPS Emergency Dispatch',
      color: 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20',
      iconColor: 'text-red-400',
      action: () => onOpenPoliceController?.()
    },
    {
      id: 'fakeCall',
      icon: <Phone />,
      label: 'Fake Rescue Call',
      sublabel: 'Realistic escape ringtone & voice',
      color: 'bg-indigo-50 text-indigo-900 hover:bg-indigo-100/80 border-indigo-100',
      iconColor: 'text-indigo-600',
      action: () => setShowFakeCall(true)
    },
    {
      id: 'safeJourney',
      icon: <Navigation />,
      label: 'Safe Journey Escort',
      sublabel: 'Auto SOS if trip timer expires',
      color: 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100/80 border-emerald-100',
      iconColor: 'text-emerald-600',
      action: () => setShowSafeJourney(true)
    },
    {
      id: 'audioVault',
      icon: <FileAudio />,
      label: 'Audio Evidence Vault',
      sublabel: 'Record threat audio proof',
      color: 'bg-rose-50 text-rose-900 hover:bg-rose-100/80 border-rose-100',
      iconColor: 'text-rose-600',
      action: () => setShowAudioVault(true)
    },
    {
      id: 'tacticalStrobe',
      icon: <Flashlight />,
      label: 'Tactical Defense Strobe',
      sublabel: 'Blinding flash & panic alarm',
      color: 'bg-amber-50 text-amber-900 hover:bg-amber-100/80 border-amber-100',
      iconColor: 'text-amber-600',
      action: () => setShowStrobe(true)
    }
  ];

  const communityEducationActions = [
    { id: 'community', icon: <Users />, label: t('community') || 'Community Network', color: 'bg-emerald-50 text-emerald-700', iconColor: 'text-emerald-600' },
    { id: 'report', icon: <MessageSquareWarning />, label: t('reportIncident') || 'Report Incident', color: 'bg-amber-50 text-amber-700', iconColor: 'text-amber-600' },
    { id: 'education', icon: <GraduationCap />, label: t('education') || 'Safety Education & Rights', color: 'bg-purple-50 text-purple-700', iconColor: 'text-purple-600' },
    { id: 'family', icon: <Home />, label: t('familySafety') || 'Family Mode', color: 'bg-rose-50 text-rose-700', iconColor: 'text-rose-600' },
    { id: 'rural', icon: <Mountain />, label: t('ruralSupport') || 'Rural Support', color: 'bg-teal-50 text-teal-700', iconColor: 'text-teal-600' }
  ];

  return (
    <div id="quick-tools" className="space-y-6 scroll-mt-20">
      {/* 1. Advanced Emergency Safety Arsenal */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {advancedSafetyCards.map((item, index) => (
          <motion.button
            key={item.id}
            onClick={item.action}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex flex-col items-center justify-between p-5 rounded-3xl border ${item.color} transition-all text-center cursor-pointer shadow-sm min-h-[145px]`}
          >
            <div className={`p-3 rounded-2xl bg-white/80 backdrop-blur-sm ${item.iconColor} shadow-sm`}>
              {React.cloneElement(item.icon as React.ReactElement, { size: 24 })}
            </div>
            <div className="space-y-0.5 mt-2">
              <span className="font-black text-xs leading-tight block">{item.label}</span>
              <span className="text-[10px] opacity-75 font-medium block leading-snug">{item.sublabel}</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* 2. Interactive Quick Tools & Widgets */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <PoliceSiren />
        <VoiceSOS />
        <SafetyTimer />
        <SafetyHeatmap />
        <EmergencyContacts />
        <LiveTrip />
        <PoliceFinder />
        <div onClick={() => setShowOfflineMap(true)}>
          <div className="flex flex-col items-center justify-center gap-3 p-6 rounded-3xl transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 bg-teal-50 text-teal-700">
            <Database size={32} />
            <span className="font-bold text-sm text-center">{isBn ? 'অফলাইন ম্যাপ ক্যাশ' : 'Offline Map Cache'}</span>
          </div>
        </div>
        {communityEducationActions.map((action, index) => (
          <motion.button
            key={action.id}
            onClick={() => onOpenModal?.(action.id as ActiveModalType)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex flex-col items-center justify-center gap-3 p-6 rounded-3xl ${action.color} border border-transparent hover:border-current/10 transition-all text-center cursor-pointer shadow-sm`}
          >
            <div className={`${action.iconColor}`}>
              {React.cloneElement(action.icon as React.ReactElement, { size: 30 })}
            </div>
            <span className="font-bold text-[13px] leading-tight px-1">{action.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Advanced Client-Side Modals */}
      <PanicDefenseModal
        isOpen={showPanicDefense}
        onClose={() => setShowPanicDefense(false)}
        onOpenTacticalStrobe={() => setShowStrobe(true)}
        onOpenFakeCall={() => setShowFakeCall(true)}
      />
      <FakeCallModal isOpen={showFakeCall} onClose={() => setShowFakeCall(false)} />
      <SafeJourneyModal isOpen={showSafeJourney} onClose={() => setShowSafeJourney(false)} />
      <AudioEvidenceModal isOpen={showAudioVault} onClose={() => setShowAudioVault(false)} />
      <TacticalStrobeModal isOpen={showStrobe} onClose={() => setShowStrobe(false)} />
      <SafeSpotsModal isOpen={showSafeSpots} onClose={() => setShowSafeSpots(false)} />
      <OfflineMapModal isOpen={showOfflineMap} onClose={() => setShowOfflineMap(false)} />
    </div>
  );
}
