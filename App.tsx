/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from './LanguageContext';
import { EmergencyProvider, useEmergency } from './EmergencyContext';
import { AuthProvider, useAuth } from './AuthContext';
import Header from './components/Header';
import SOSButton from './components/SOSButton';
import EmergencyDashboard from './components/EmergencyDashboard';
import ActionGrid from './components/ActionGrid';
import Chatbot from './components/Chatbot';
import FeatureModals, { ActiveModalType } from './components/FeatureModals';
import PoliceStationController from './components/PoliceStationController';
import UserAuthModal from './components/UserAuthModal';
import { ShieldCheck, Phone, Info, Globe, Users, Heart, Radio, Car } from 'lucide-react';
import { motion } from 'motion/react';

function AppContent() {
  const { t, language } = useLanguage();
  const isBn = language === 'bn';
  const { emergency, allPoliceAlerts } = useEmergency();
  const { currentUser, isUserLoggedIn } = useAuth();
  const [activeModal, setActiveModal] = useState<ActiveModalType>(null);
  const [showPoliceController, setShowPoliceController] = useState(false);
  const [showUserAuthModal, setShowUserAuthModal] = useState(false);

  const activeAlertsCount = allPoliceAlerts.filter(a => a.status === 'PENDING' || a.status === 'EN_ROUTE' || a.status === 'DISPATCHED').length;

  if (showPoliceController) {
    return (
      <PoliceStationController onClose={() => setShowPoliceController(false)} />
    );
  }

  return (
    <div className={`min-h-screen font-sans text-gray-900 pb-20 transition-colors duration-500 ${emergency.isActive ? 'bg-red-50' : 'bg-slate-50'}`}>
      <Header 
        onOpenModal={(modal) => setActiveModal(modal)} 
        onOpenPoliceController={() => setShowPoliceController(true)}
        onOpenUserAuth={() => setShowUserAuthModal(true)}
      />
      
      <main className="pt-24 px-4 max-w-7xl mx-auto space-y-12">
        {/* Active Police Alert Banner if any alerts active in system */}
        {activeAlertsCount > 0 && !emergency.isActive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-red-500/40 rounded-3xl p-4 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center text-white shrink-0">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <p className="font-bold text-sm text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  {activeAlertsCount} Live Police Distress Signal(s) Active in Control Room
                </p>
                <p className="text-xs text-slate-400">
                  Arambagh & Khanakul Police Station live dispatch desks are monitoring active coordinates.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPoliceController(true)}
              className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer shrink-0 shadow-lg shadow-red-600/30"
            >
              <Car className="w-4 h-4" /> Open Police Controller Desk
            </button>
          </motion.div>
        )}

        {/* Hero Section */}
        <section className="text-center space-y-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900">
              {t('heroTitle')}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
              {t('heroSubtitle')}
            </p>
          </motion.div>

          {emergency.isActive && (
            <EmergencyDashboard onOpenPoliceController={() => setShowPoliceController(true)} />
          )}
          {!emergency.isActive && <SOSButton />}
        </section>

        {/* Feature Grid */}
        <section>
          <div className="flex items-center justify-between mb-6 px-4">
            <h2 className="text-2xl font-bold text-gray-800">{t('quickActions')}</h2>
            <button 
              onClick={() => setActiveModal('education')} 
              className="text-indigo-600 font-semibold text-sm hover:underline flex items-center gap-1 cursor-pointer"
            >
              View All <Info className="w-4 h-4" />
            </button>
          </div>
          <ActionGrid 
            onOpenModal={(modal) => setActiveModal(modal)} 
            onOpenPoliceController={() => setShowPoliceController(true)}
          />
        </section>

        {/* Info Cards / Awareness */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-indigo-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden"
          >
            <div className="relative z-10 space-y-4">
              <h3 className="text-2xl font-bold">{t('helplines') || 'Women Helpline'}</h3>
              <p className="text-indigo-200">Immediate assistance available 24/7 across India. Single emergency number.</p>
              <div className="flex flex-wrap gap-4">
                <a href="tel:1091" className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center gap-3 transition-all">
                  <Phone className="w-5 h-5 text-indigo-300" />
                  <span className="font-black text-xl">1091</span>
                </a>
                <button onClick={() => setActiveModal('helplines')} className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-6 py-3 rounded-2xl flex items-center gap-3 transition-all cursor-pointer">
                  <Phone className="w-5 h-5 text-indigo-300" />
                  <span className="font-black text-sm">All Helplines</span>
                </button>
              </div>
            </div>
            <Globe className="absolute -bottom-8 -right-8 w-48 h-48 text-white/5" />
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden"
          >
            <div className="relative z-10 space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">{t('community') || 'Community Safety'}</h3>
              <p className="text-gray-500">Connect with nearby verified volunteers and village support circles.</p>
              <button 
                onClick={() => setActiveModal('community')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-indigo-200 cursor-pointer"
              >
                <Users className="w-5 h-5" />
                {t('joinNetwork') || 'Join Network'}
              </button>
            </div>
            <Heart className="absolute -bottom-8 -right-8 w-48 h-48 text-indigo-50" />
          </motion.div>
        </section>

        {/* Awareness Section */}
        <section className="bg-gradient-to-br from-indigo-50 to-white rounded-[3rem] p-8 md:p-12 border border-indigo-100/50">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <ShieldCheck className="w-16 h-16 text-indigo-600 mx-auto" />
            <h2 className="text-3xl font-black text-gray-900">{t('education') || 'Education & Rights'}</h2>
            <p className="text-lg text-gray-600 font-medium italic">
              "Safety is not just about protection, it is about knowing your rights and strengths."
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <button 
                onClick={() => setActiveModal('panic_defense')}
                className="bg-gradient-to-r from-red-600 to-rose-600 p-4 rounded-2xl shadow-md border border-red-500 font-black text-white hover:from-red-500 hover:to-rose-500 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-5 h-5 text-amber-300" />
                <span>প্যানিক ও সেলফ ডিফেন্স (Self-Defense)</span>
              </button>
              <button 
                onClick={() => setActiveModal('education')}
                className="bg-white p-4 rounded-2xl shadow-sm border border-indigo-50 font-bold text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer"
              >
                আইনি অধিকার (Legal Rights)
              </button>
              <button 
                onClick={() => setActiveModal('education')}
                className="bg-white p-4 rounded-2xl shadow-sm border border-indigo-50 font-bold text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer"
              >
                সাইবার নিরাপত্তা (Cyber Safety)
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-20 border-t border-gray-100 bg-white py-12 px-4 shadow-[0_-1px_3px_0_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
              <span className="font-bold text-xl">নির্ভয়া সাথী</span>
            </div>
            <p className="text-sm text-gray-500">Empowering women across India through digital safety tools and community support. Your safety is our priority.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-600 font-medium">
                <li><button onClick={() => setShowPoliceController(true)} className="hover:text-indigo-600 font-bold text-red-600 flex items-center gap-1 cursor-pointer"><Radio className="w-3.5 h-3.5" /> Police Station Controller</button></li>
                <li><button onClick={() => setActiveModal('education')} className="hover:text-indigo-600 cursor-pointer">Privacy Policy & Legal Rights</button></li>
                <li><button onClick={() => setActiveModal('helplines')} className="hover:text-indigo-600 font-bold text-indigo-600 cursor-pointer">24x7 Helplines</button></li>
              </ul>
            </div>
          </div>
          <div className="bg-red-50 p-6 rounded-3xl border border-red-100">
            <h4 className="font-bold mb-2 text-red-900">Emergency 24x7</h4>
            <a href="tel:112" className="text-4xl font-black text-red-600 block hover:underline">112</a>
            <p className="text-xs text-red-400 mt-1 font-medium">National Helpline Number</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-50 text-center text-sm text-gray-400 font-medium">
          © 2026 নির্ভয়া সাথী. সাহসি নিরাপদ সঙ্গী।
        </div>
      </footer>

      <Chatbot />

      {/* Feature Modals */}
      <FeatureModals 
        activeModal={activeModal} 
        onClose={() => setActiveModal(null)} 
      />

      {/* Citizen Registration & Login Modal */}
      <UserAuthModal
        isOpen={showUserAuthModal}
        onClose={() => setShowUserAuthModal(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <EmergencyProvider>
          <AppContent />
        </EmergencyProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

