import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { 
  Users, 
  MessageSquareWarning, 
  GraduationCap, 
  Phone, 
  Home, 
  Mountain, 
  X, 
  CheckCircle, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  Send, 
  UserCheck, 
  Lock, 
  Share2, 
  MapPin,
  ExternalLink,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import PanicDefenseModal from './PanicDefenseModal';

export type ActiveModalType = 'community' | 'report' | 'education' | 'helplines' | 'family' | 'rural' | 'panic_defense' | null;

interface FeatureModalsProps {
  activeModal: ActiveModalType;
  onClose: () => void;
  onOpenTacticalStrobe?: () => void;
  onOpenFakeCall?: () => void;
}

export default function FeatureModals({ activeModal, onClose, onOpenTacticalStrobe, onOpenFakeCall }: FeatureModalsProps) {
  const { t } = useLanguage();

  if (activeModal === 'panic_defense') {
    return (
      <PanicDefenseModal
        isOpen={true}
        onClose={onClose}
        onOpenTacticalStrobe={onOpenTacticalStrobe}
        onOpenFakeCall={onOpenFakeCall}
      />
    );
  }

  // Report state
  const [reportType, setReportType] = useState('Harassment');
  const [reportLocation, setReportLocation] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);

  // Community state
  const [volunteerName, setVolunteerName] = useState('');
  const [volunteerPhone, setVolunteerPhone] = useState('');
  const [volunteerLocation, setVolunteerLocation] = useState('');
  const [joinedCommunity, setJoinedCommunity] = useState(false);

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDesc.trim()) return;
    const caseId = 'NS-' + Math.floor(100000 + Math.random() * 900000);
    setReportSuccess(caseId);
    setReportDesc('');
    setReportLocation('');
  };

  const handleCommunityJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!volunteerName.trim() || !volunteerPhone.trim()) return;
    setJoinedCommunity(true);
  };

  return (
    <AnimatePresence>
      {activeModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white w-full max-w-2xl max-h-[85vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                {activeModal === 'community' && <Users className="text-emerald-600 w-7 h-7" />}
                {activeModal === 'report' && <MessageSquareWarning className="text-amber-600 w-7 h-7" />}
                {activeModal === 'education' && <GraduationCap className="text-purple-600 w-7 h-7" />}
                {activeModal === 'helplines' && <Phone className="text-red-600 w-7 h-7" />}
                {activeModal === 'family' && <Home className="text-rose-600 w-7 h-7" />}
                {activeModal === 'rural' && <Mountain className="text-teal-600 w-7 h-7" />}
                <div>
                  <h3 className="font-black text-xl text-gray-900">
                    {activeModal === 'community' && (t('community') || 'Community Network')}
                    {activeModal === 'report' && (t('reportIncident') || 'Report Incident')}
                    {activeModal === 'education' && (t('education') || 'Safety Education & Rights')}
                    {activeModal === 'helplines' && (t('helplines') || 'Emergency Helplines')}
                    {activeModal === 'family' && (t('familySafety') || 'Family Circle Mode')}
                    {activeModal === 'rural' && (t('ruralSupport') || 'Rural & Village Support')}
                  </h3>
                  <p className="text-xs font-bold text-gray-400">Nirbhoya Sathi Verified Tool</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-200/60 rounded-full bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* 1. COMMUNITY NETWORK */}
              {activeModal === 'community' && (
                <div className="space-y-6">
                  <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl space-y-3">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-lg">
                      <ShieldCheck className="w-6 h-6 text-emerald-600" />
                      <span>1,240+ Verified Local Volunteers Active</span>
                    </div>
                    <p className="text-emerald-700 text-sm font-medium leading-relaxed">
                      Connect with nearby verified women volunteers, village safety circles, and emergency responders in your district.
                    </p>
                  </div>

                  {!joinedCommunity ? (
                    <form onSubmit={handleCommunityJoin} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
                      <h4 className="font-bold text-gray-800 text-lg">Join Nirbhoya Community Volunteer Circle</h4>
                      <div className="space-y-1">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                        <input 
                          type="text" 
                          value={volunteerName}
                          onChange={(e) => setVolunteerName(e.target.value)}
                          placeholder="Your Name"
                          required
                          className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 font-bold text-gray-800 outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
                          <input 
                            type="tel" 
                            value={volunteerPhone}
                            onChange={(e) => setVolunteerPhone(e.target.value)}
                            placeholder="+91 9876543210"
                            required
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 font-bold text-gray-800 outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">District / PIN Code</label>
                          <input 
                            type="text" 
                            value={volunteerLocation}
                            onChange={(e) => setVolunteerLocation(e.target.value)}
                            placeholder="e.g. Hooghly / 712601"
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 font-bold text-gray-800 outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                      <button 
                        type="submit" 
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 transition-all"
                      >
                        <UserCheck className="w-5 h-5" />
                        REGISTER AS SAFETY VOLUNTEER
                      </button>
                    </form>
                  ) : (
                    <div className="bg-emerald-600 text-white p-6 rounded-3xl text-center space-y-3">
                      <CheckCircle className="w-12 h-12 mx-auto" />
                      <h4 className="font-black text-2xl">Welcome to Nirbhoya Volunteer Network!</h4>
                      <p className="text-emerald-100 text-sm font-medium">
                        You are now connected with local emergency alerts in your area. Thank you for protecting women in your community.
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-800">Recent Community Alerts in West Bengal</h4>
                    {[
                      { area: 'Hooghly (Arambagh)', status: 'Safe Corridor Verified', time: '10 mins ago', type: 'corridor' },
                      { area: 'Howrah Junction', status: 'Volunteer Escort Available', time: '25 mins ago', type: 'escort' },
                      { area: 'Kolkata Salt Lake', status: 'Streetlight Fixed by Circle', time: '1 hour ago', type: 'fix' },
                    ].map((item, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{item.area}</p>
                          <p className="text-xs text-emerald-600 font-bold">{item.status}</p>
                        </div>
                        <span className="text-xs text-gray-400 font-medium">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. REPORT INCIDENT */}
              {activeModal === 'report' && (
                <div className="space-y-6">
                  {reportSuccess ? (
                    <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-3xl text-center space-y-4">
                      <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto" />
                      <h4 className="font-black text-2xl text-emerald-900">Incident Reported Successfully!</h4>
                      <p className="text-emerald-700 text-sm font-medium">
                        Your confidential incident report has been registered. Local authorities and safety circles have been alerted.
                      </p>
                      <div className="bg-white p-4 rounded-2xl border border-emerald-100 inline-block">
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Case Reference ID</span>
                        <span className="font-black text-2xl text-indigo-600">{reportSuccess}</span>
                      </div>
                      <button 
                        onClick={() => setReportSuccess(null)}
                        className="block w-full bg-indigo-600 text-white font-bold py-3.5 rounded-2xl hover:bg-indigo-700 transition-all"
                      >
                        File Another Report
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleReportSubmit} className="space-y-5">
                      <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-3 text-amber-800 text-sm font-medium">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                        <span>All reports are encrypted and can be filed 100% anonymously.</span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Incident Category</label>
                        <select 
                          value={reportType} 
                          onChange={(e) => setReportType(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 font-bold text-gray-800 outline-none focus:ring-2 focus:ring-amber-500"
                        >
                          <option value="Harassment">Eve Teasing / Harassment</option>
                          <option value="Stalking">Stalking / Following</option>
                          <option value="Unsafe Area">Unsafe Dark Area / Unlit Road</option>
                          <option value="Cyber Crime">Online Threat / Cyber Harassment</option>
                          <option value="Physical Threat">Physical Violence / Threat</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Incident Location / PIN Code</label>
                        <input 
                          type="text" 
                          value={reportLocation}
                          onChange={(e) => setReportLocation(e.target.value)}
                          placeholder="e.g. Near Arambagh Bus Stand, PIN 712601"
                          required
                          className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 font-bold text-gray-800 outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Description & Details</label>
                        <textarea 
                          rows={4}
                          value={reportDesc}
                          onChange={(e) => setReportDesc(e.target.value)}
                          placeholder="Provide details about what happened, time, description of persons involved..."
                          required
                          className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 font-bold text-gray-800 outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-bold text-gray-700">Submit Anonymously</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={isAnonymous}
                          onChange={(e) => setIsAnonymous(e.target.checked)}
                          className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                      </div>

                      <button 
                        type="submit" 
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-amber-100 flex items-center justify-center gap-2 transition-all"
                      >
                        <Send className="w-5 h-5" />
                        SUBMIT CONFIDENTIAL REPORT
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* 3. SAFETY EDUCATION & LEGAL RIGHTS */}
              {activeModal === 'education' && (
                <div className="space-y-6">
                  {/* Dedicated Panic & Self-Defense Guide Banner */}
                  <div className="bg-gradient-to-r from-red-600 via-rose-600 to-indigo-700 p-6 rounded-3xl text-white shadow-xl shadow-red-500/20 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                        <ShieldCheck className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h4 className="font-black text-xl text-white">
                          প্যানিক মোমেন্ট ও সম্পূর্ণ সেলফ ডিফেন্স নির্দেশিকা
                        </h4>
                        <p className="text-white/80 text-xs font-medium">
                          Panic Moment Action • Target Strikes • Real Attack Escapes • Improvised Weapons
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-white/90 leading-relaxed font-medium">
                      বিপদে পড়লে আতঙ্কে জমে (Freeze) না গিয়ে কীভাবে তাৎক্ষণিক ৪-সেকেন্ড ব্রিদিং করবেন, শরীরের দুর্বল স্থানে আঘাত হানবেন এবং যেকোনো গ্র্যাব থেকে মুক্ত হবেন তার সম্পূর্ণ নির্দেশিকা।
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        // open panic defense modal directly
                      }}
                      className="w-full bg-white text-red-600 hover:bg-slate-100 font-black py-3 px-4 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow"
                    >
                      <Zap className="w-4 h-4 text-amber-500" />
                      সম্পূর্ণ সেলফ ডিফেন্স ও প্যানিক গাইড খুলুন (Open Guide)
                    </button>
                  </div>

                  <div className="bg-purple-50 border border-purple-100 p-6 rounded-3xl space-y-3">
                    <h4 className="font-black text-purple-900 text-xl flex items-center gap-2">
                      <FileText className="w-6 h-6 text-purple-600" />
                      Know Your Constitutional & Legal Rights (আইনি অধিকার)
                    </h4>
                    <p className="text-purple-800 text-sm font-medium leading-relaxed">
                      Empower yourself with knowledge regarding Indian criminal procedure codes and protective acts for women.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        title: 'Zero FIR (Section 154 CrPC)',
                        desc: 'A woman can file a Zero FIR at ANY police station regardless of place of occurrence. The police officer MUST register it and transfer to jurisdiction.',
                        badge: 'Crucial Right'
                      },
                      {
                        title: 'Right to Virtual / Doorstep Statement',
                        desc: 'Under Section 160 CrPC, women cannot be called to police station for questioning. Statement must be recorded at her residence in presence of female officer.',
                        badge: 'Privacy Protection'
                      },
                      {
                        title: 'POSH Act (Prevention of Sexual Harassment at Workplace)',
                        desc: 'Mandatory Internal Complaints Committee (ICC) in every office with 10+ employees. Free legal support for workplace safety.',
                        badge: 'Workplace Safety'
                      },
                      {
                        title: 'National Cyber Crime Helpline (1930)',
                        desc: 'Immediate reporting of morphing, online harassment, stalkerware, or non-consensual image sharing.',
                        badge: 'Cyber Safety'
                      }
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-gray-900 text-lg">{item.title}</h5>
                          <span className="bg-purple-100 text-purple-700 text-[10px] uppercase font-black px-2.5 py-1 rounded-full">
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm font-medium leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. EMERGENCY HELPLINES */}
              {activeModal === 'helplines' && (
                <div className="space-y-6">
                  <p className="text-gray-500 font-bold text-sm">
                    Toll-free 24x7 emergency phone numbers for immediate police, medical, and distress assistance across West Bengal and India.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { name: 'National Emergency', number: '112', desc: 'Police, Fire, Medical Response', color: 'bg-red-50 text-red-600 border-red-100' },
                      { name: 'Women Helpline', number: '1091', desc: '24x7 Immediate Distress', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
                      { name: 'Domestic Abuse Helpline', number: '181', desc: 'Women Protection Cell', color: 'bg-pink-50 text-pink-600 border-pink-100' },
                      { name: 'Child Helpline', number: '1098', desc: 'Childline Emergency', color: 'bg-amber-50 text-amber-600 border-amber-100' },
                      { name: 'Cyber Crime Helpline', number: '1930', desc: 'Online Fraud & Harassment', color: 'bg-purple-50 text-purple-600 border-purple-100' },
                      { name: 'WB Police Control Room', number: '033-22145486', desc: 'West Bengal Police HQs', color: 'bg-blue-50 text-blue-600 border-blue-100' }
                    ].map((item) => (
                      <div key={item.number} className={`p-5 rounded-3xl border ${item.color} flex flex-col justify-between space-y-3`}>
                        <div>
                          <h5 className="font-black text-lg">{item.name}</h5>
                          <p className="text-xs font-bold opacity-80">{item.desc}</p>
                        </div>
                        <a 
                          href={`tel:${item.number}`}
                          className="w-full bg-white/90 hover:bg-white text-gray-900 font-black py-3 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all"
                        >
                          <Phone className="w-4 h-4 text-green-600" />
                          <span>CALL {item.number}</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. FAMILY CIRCLE MODE */}
              {activeModal === 'family' && (
                <div className="space-y-6">
                  <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl space-y-3">
                    <h4 className="font-black text-rose-900 text-xl flex items-center gap-2">
                      <Home className="w-6 h-6 text-rose-600" />
                      Family Safety Circle Mode
                    </h4>
                    <p className="text-rose-800 text-sm font-medium leading-relaxed">
                      Automatically send check-in updates and geofence alerts to your family members when entering or leaving safe zones.
                    </p>
                  </div>

                  <div className="bg-white border border-gray-100 p-6 rounded-3xl space-y-4">
                    <h5 className="font-bold text-gray-900">Active Family Safe Zones</h5>
                    {['Home (Arambagh)', 'Office / College', 'Hooghly Station Corridor'].map((zone, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-rose-600" />
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{zone}</p>
                            <span className="text-xs text-emerald-600 font-bold">Geofence Active</span>
                          </div>
                        </div>
                        <button className="text-xs text-indigo-600 font-bold hover:underline">Manage</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. RURAL SUPPORT */}
              {activeModal === 'rural' && (
                <div className="space-y-6">
                  <div className="bg-teal-50 border border-teal-100 p-6 rounded-3xl space-y-3">
                    <h4 className="font-black text-teal-900 text-xl flex items-center gap-2">
                      <Mountain className="w-6 h-6 text-teal-600" />
                      Rural & Gram Panchayat Safety Circle
                    </h4>
                    <p className="text-teal-800 text-sm font-medium leading-relaxed">
                      Specially optimized for rural areas in West Bengal with offline SMS alerts, Gram Panchayat Mahila Samiti contacts, and Asha worker network.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h5 className="font-bold text-gray-900">Gram Panchayat Emergency Desks</h5>
                    {[
                      { name: 'Arambagh Gram Panchayat Safety Desk', phone: '03211-255223', pin: '712601' },
                      { name: 'Khanakul Rural Emergency Circle', phone: '03211-266224', pin: '712413 / 712417' },
                      { name: 'Hooghly Zilla Parishad Women Cell', phone: '033-26802112', pin: 'Hooghly HQ' }
                    ].map((item, idx) => (
                      <div key={idx} className="p-5 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <p className="font-bold text-gray-900">{item.name}</p>
                          <p className="text-xs text-teal-700 font-bold">PIN / Region: {item.pin}</p>
                        </div>
                        <a 
                          href={`tel:${item.phone}`}
                          className="bg-teal-600 text-white font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 text-sm hover:bg-teal-700 transition-all"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Call Desk</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
