import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { useEmergency } from '../EmergencyContext';
import { useAuth } from '../AuthContext';
import { LANGUAGES } from '../constants';
import { Shield, Languages, Menu, X, Users, MessageSquareWarning, GraduationCap, Phone, Home, Mountain, Sparkles, Radio, ShieldAlert, User, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import LiveClock from './LiveClock';
import { ActiveModalType } from './FeatureModals';

interface HeaderProps {
  onOpenModal?: (modal: ActiveModalType) => void;
  onOpenPoliceController?: () => void;
  onOpenUserAuth?: () => void;
}

export default function Header({ onOpenModal, onOpenPoliceController, onOpenUserAuth }: HeaderProps) {
  const { language, setLanguage, currentLanguageName, t } = useLanguage();
  const { allPoliceAlerts } = useEmergency();
  const { currentUser, isUserLoggedIn } = useAuth();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isBn = language === 'bn';
  const activeAlertsCount = allPoliceAlerts.filter(a => a.status === 'PENDING' || a.status === 'EN_ROUTE' || a.status === 'DISPATCHED').length;

  const menuItems = [
    {
      id: 'user_profile',
      label: isUserLoggedIn ? (isBn ? `প্রোফাইল: ${currentUser?.name}` : `Profile: ${currentUser?.name}`) : (isBn ? 'নাগরিক অ্যাকাউন্ট (লগইন / রেজিস্টার)' : 'Citizen Account (Login / Register)'),
      icon: isUserLoggedIn ? <UserCheck className="w-5 h-5 text-rose-600" /> : <User className="w-5 h-5 text-indigo-600" />,
      action: () => onOpenUserAuth?.(),
      badge: isUserLoggedIn ? 'Active' : undefined,
      highlight: false
    },
    { 
      id: 'panic_defense', 
      label: isBn ? 'প্যানিক ও সেলফ ডিফেন্স' : 'Panic & Self-Defense', 
      icon: <ShieldAlert className="w-5 h-5 text-red-600 animate-pulse" />, 
      action: () => onOpenModal?.('panic_defense'),
      badge: 'LIFE-SAVING',
      highlight: true
    },
    { 
      id: 'controller', 
      label: t('policeController') || 'Police Station Controller', 
      icon: <Radio className="w-5 h-5 text-red-600 animate-pulse" />, 
      action: () => onOpenPoliceController?.(),
      badge: activeAlertsCount > 0 ? `${activeAlertsCount} Active` : undefined,
      highlight: false
    },
    { id: 'features', label: t('features') || 'Quick Safety Tools', icon: <Sparkles className="w-5 h-5 text-indigo-600" />, action: () => {
      document.getElementById('quick-tools')?.scrollIntoView({ behavior: 'smooth' });
    }},
    { id: 'community', label: t('community') || 'Community Network', icon: <Users className="w-5 h-5 text-emerald-600" />, action: () => onOpenModal?.('community') },
    { id: 'report', label: t('reportIncident') || 'Report Incident', icon: <MessageSquareWarning className="w-5 h-5 text-amber-600" />, action: () => onOpenModal?.('report') },
    { id: 'education', label: t('education') || 'Safety Education & Rights', icon: <GraduationCap className="w-5 h-5 text-purple-600" />, action: () => onOpenModal?.('education') },
    { id: 'helplines', label: t('helplines') || 'Emergency Helplines', icon: <Phone className="w-5 h-5 text-red-600" />, action: () => onOpenModal?.('helplines') },
    { id: 'family', label: t('familySafety') || 'Family Mode', icon: <Home className="w-5 h-5 text-rose-600" />, action: () => onOpenModal?.('family') },
    { id: 'rural', label: t('ruralSupport') || 'Rural Support', icon: <Mountain className="w-5 h-5 text-teal-600" />, action: () => onOpenModal?.('rural') },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="bg-indigo-600 p-2 rounded-xl shadow-md shadow-indigo-200">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-gray-900 text-lg hidden sm:block tracking-tight">
            {isBn ? 'নির্ভয়া সাথী' : 'Nirbhaya Sathi'}
          </span>
        </div>

        <div className="hidden md:flex flex-1 justify-center">
          <LiveClock className="text-gray-600 text-sm" showIcon />
        </div>

        <div className="flex items-center gap-2.5">
          {/* Panic & Self-Defense Quick Shortcut Header Button */}
          <button
            onClick={() => onOpenModal?.('panic_defense')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs shadow-md shadow-red-600/30 transition-all cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="hidden sm:inline">{isBn ? 'প্যানিক ও সেলফ ডিফেন্স' : 'Self Defense'}</span>
            <span className="sm:hidden">ডিফেন্স</span>
          </button>

          {/* Police Station Controller Header Quick Shortcut */}
          <button
            onClick={() => onOpenPoliceController?.()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer relative"
          >
            <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span className="hidden lg:inline">{t('policeController') || 'Police Controller'}</span>
            <span className="lg:hidden">থানা</span>
            {activeAlertsCount > 0 && (
              <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full ml-1">
                {activeAlertsCount}
              </span>
            )}
          </button>

          {/* User Account / Profile / Login Button */}
          <button
            onClick={() => onOpenUserAuth?.()}
            title={isUserLoggedIn ? `${currentUser?.name} (Click for profile)` : "Citizen Login / Register"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              isUserLoggedIn 
                ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-200'
            }`}
          >
            {isUserLoggedIn ? (
              <>
                <UserCheck className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline max-w-[90px] truncate">{currentUser?.name?.split(' ')[0] || 'User'}</span>
                <span className="sm:hidden">প্রোফাইল</span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline">{isBn ? 'নাগরিক একাউন্ট' : 'Citizen Sign In'}</span>
                <span className="sm:hidden">লগইন</span>
              </>
            )}
          </button>

          <div className="relative">
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-gray-100/80 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-sm font-bold text-gray-700"
            >
              <Languages className="w-4 h-4 text-indigo-600" />
              <span>{currentLanguageName}</span>
            </button>

            <AnimatePresence>
              {isLangOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-72 overflow-y-auto z-50"
                >
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsLangOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-indigo-50 transition-colors flex items-center justify-between ${language === lang.code ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-gray-700 font-medium'}`}
                    >
                      <span>{lang.nativeName}</span>
                      <span className="text-xs text-gray-400">({lang.name})</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-all text-gray-800"
            aria-label="Toggle Navigation Menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-b border-gray-100 overflow-hidden shadow-xl"
          >
            <div className="px-4 py-6 space-y-2 max-w-7xl mx-auto">
              <div className="md:hidden pb-4 mb-2 border-b border-gray-100">
                <LiveClock className="text-gray-600 text-sm justify-center" showIcon />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {menuItems.map((item) => (
                  <button 
                    key={item.id} 
                    className={`flex items-center justify-between w-full text-left font-bold px-4 py-3 rounded-2xl transition-all ${
                      (item as any).highlight 
                        ? 'bg-slate-900 text-white hover:bg-slate-800' 
                        : 'text-gray-800 hover:text-indigo-600 hover:bg-indigo-50/60'
                    }`}
                    onClick={() => {
                      setIsMenuOpen(false);
                      item.action();
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {(item as any).badge && (
                      <span className="bg-red-600 text-white text-xs font-black px-2 py-0.5 rounded-full">
                        {(item as any).badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
