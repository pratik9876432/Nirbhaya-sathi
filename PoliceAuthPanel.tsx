import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../LanguageContext';
import { WEST_BENGAL_POLICE } from '../services/policeDatabase';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  UserCheck, 
  Radio, 
  Building2, 
  AlertCircle, 
  CheckCircle2, 
  Phone, 
  Mail, 
  Sparkles,
  ChevronRight,
  X,
  BadgeAlert,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';

interface PoliceAuthPanelProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function PoliceAuthPanel({ onSuccess, onCancel }: PoliceAuthPanelProps) {
  const { loginPoliceOfficer, registerPoliceOfficer } = useAuth();
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login state
  const [selectedStation, setSelectedStation] = useState('712601_ARAMBAGH');
  const [badgeNumber, setBadgeNumber] = useState('WB-HOOGHLY-712601');
  const [secretKey, setSecretKey] = useState('police123');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [regName, setRegName] = useState('');
  const [regRank, setRegRank] = useState('Duty Officer In-Charge (SI)');
  const [regBadge, setRegBadge] = useState('');
  const [regStation, setRegStation] = useState('712601_ARAMBAGH');
  const [regPhone, setRegPhone] = useState('+91 98321 00000');
  const [regEmail, setRegEmail] = useState('');
  const [regSecretKey, setRegSecretKey] = useState('police123');
  const [regMasterKey, setRegMasterKey] = useState('WB_POLICE_HQ_DISPATCH');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  const handlePoliceLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!badgeNumber.trim() || !secretKey.trim()) {
      setLoginError(isBn ? 'ব্যাজ নম্বর ও সিক্রেট কি প্রদান করুন' : 'Badge number and secret key required');
      return;
    }

    setLoginLoading(true);
    const res = await loginPoliceOfficer(selectedStation, badgeNumber, secretKey);
    setLoginLoading(false);

    if (!res.success) {
      setLoginError(res.error || 'Authentication failed');
    } else {
      onSuccess();
    }
  };

  const handlePoliceRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim() || !regBadge.trim()) {
      setRegError(isBn ? 'অফিসারের নাম ও ব্যাজ নম্বর আবশ্যক!' : 'Officer name and Badge number are required!');
      return;
    }

    // Master key validation to ensure unauthorized civilians cannot register as police
    if (regMasterKey.trim() !== 'WB_POLICE_HQ_DISPATCH') {
      setRegError(isBn ? 'হেডকোয়ার্টার অনুমোদন কোড (HQ Passcode) ভুল! অনুমোদিত পুলিশ অফিসার ব্যতীত প্রবেশ নিষিদ্ধ।' : 'Invalid Police HQ Passcode! Unauthorized registration denied.');
      return;
    }

    const stationObj = WEST_BENGAL_POLICE.find(p => p.code === regStation) || WEST_BENGAL_POLICE[0];

    setRegLoading(true);
    const res = await registerPoliceOfficer({
      name: regName.trim(),
      rank: regRank,
      badgeNumber: regBadge.trim().toUpperCase(),
      stationCode: regStation,
      stationName: stationObj.name,
      district: stationObj.district,
      phone: regPhone.trim(),
      email: regEmail.trim() || `${regBadge.trim().toLowerCase()}@wbpolice.gov.in`,
      secretKey: regSecretKey.trim() || 'police123'
    });
    setRegLoading(false);

    if (!res.success) {
      setRegError(res.error || 'Registration failed');
    } else {
      setRegSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 800);
    }
  };

  const fillArambaghDemo = () => {
    setSelectedStation('712601_ARAMBAGH');
    setBadgeNumber('WB-HOOGHLY-712601');
    setSecretKey('police123');
  };

  const fillKhanakulDemo = () => {
    setSelectedStation('712417_KHANAKUL');
    setBadgeNumber('WB-HOOGHLY-712417');
    setSecretKey('police123');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glowing police radar effect */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-lg w-full z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl"
        >
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 p-6 border-b border-red-900/30 relative">
            {onCancel && (
              <button
                onClick={onCancel}
                className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 shadow-inner">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-white tracking-tight">
                    {isBn ? 'পুলিশ কন্ট্রোল রুম লগইন' : 'Police Control Desk Auth'}
                  </h2>
                  <span className="text-[10px] bg-red-600/30 border border-red-500/40 text-red-400 font-mono px-2 py-0.5 rounded-full font-bold uppercase">
                    Law Enforcement Only
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isBn ? 'পশ্চিমবঙ্গ পুলিশ সুরক্ষিত কন্ট্রোল ও ডিসপ্যাচ গেটওয়ে' : 'West Bengal Police Secure Emergency Dispatch Gateway'}
                </p>
              </div>
            </div>

            {/* Mode Selector */}
            <div className="flex bg-slate-950/80 border border-slate-800 p-1 rounded-2xl mt-5 gap-1">
              <button
                type="button"
                onClick={() => { setActiveTab('LOGIN'); setLoginError(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'LOGIN' 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{isBn ? 'ডিউটি অফিসার লগইন' : 'Duty Officer Login'}</span>
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('REGISTER'); setRegError(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'REGISTER' 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BadgeAlert className="w-3.5 h-3.5" />
                <span>{isBn ? 'নতুন অফিসার রেজিস্ট্রেশন' : 'Officer Registration'}</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* 1. LOGIN TAB */}
            {activeTab === 'LOGIN' && (
              <form onSubmit={handlePoliceLogin} className="space-y-4">
                {loginError && (
                  <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 rounded-2xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">
                    {isBn ? 'থানা নির্বাচন করুন (Designated Police Station)' : 'Police Station Jurisdiction'}
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={selectedStation}
                      onChange={(e) => setSelectedStation(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 font-medium"
                    >
                      {WEST_BENGAL_POLICE.map(ps => (
                        <option key={ps.code} value={ps.code}>
                          {ps.name} - ({ps.district}, PIN: {ps.pinCode})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">
                    {isBn ? 'অফিসার ব্যাজ / আইডি নম্বর (Official Badge No)' : 'Police Badge / ID Number'}
                  </label>
                  <div className="relative">
                    <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={badgeNumber}
                      onChange={(e) => setBadgeNumber(e.target.value)}
                      placeholder="e.g. WB-HOOGHLY-712601"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 font-mono tracking-wide"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-300 block">
                      {isBn ? 'সুরক্ষিত পিন / কি (Secret Security PIN)' : 'Security PIN / Passcode'}
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">Default: police123</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={secretKey}
                      onChange={(e) => setSecretKey(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 font-mono tracking-widest"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Radio className="w-4 h-4" />
                    <span>{loginLoading ? (isBn ? 'যাচাই করা হচ্ছে...' : 'Authenticating...') : (isBn ? 'কন্ট্রোল প্যানেলে প্রবেশ করুন' : 'Enter Police Dispatch Console')}</span>
                  </button>
                </div>

                {/* Quick Auto-Fill Demo Accounts for Verification */}
                <div className="pt-4 border-t border-slate-800/80 space-y-2">
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    {isBn ? 'টেস্টিং ডিউটি অফিসার অ্যাকাউন্ট (১-ক্লিক অটো-লগইন)' : 'Test Duty Officer Accounts'}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={fillArambaghDemo}
                      className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition-all cursor-pointer group"
                    >
                      <span className="text-[11px] font-bold text-white group-hover:text-red-400 block truncate">
                        Arambagh PS (আরামবাগ)
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        SI R. Ghosh (712601)
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={fillKhanakulDemo}
                      className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition-all cursor-pointer group"
                    >
                      <span className="text-[11px] font-bold text-white group-hover:text-red-400 block truncate">
                        Khanakul PS (খানাাকুল)
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        IC M. Banerjee (712417)
                      </span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* 2. REGISTRATION TAB */}
            {activeTab === 'REGISTER' && (
              <form onSubmit={handlePoliceRegister} className="space-y-3.5">
                {regError && (
                  <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 rounded-2xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{regError}</span>
                  </div>
                )}

                {regSuccess && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-2xl text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{isBn ? 'অফিসার অ্যাকাউন্ট সফলভাবে অনুমোদিত হয়েছে।' : 'Police officer registered successfully.'}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 block">
                      {isBn ? 'অফিসারের নাম *' : 'Officer Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder={isBn ? 'যেমন: এস আই সুব্রত রায়' : 'e.g. SI Subrata Roy'}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 block">
                      {isBn ? 'পদমর্যাদা (Rank / Role)' : 'Officer Rank'}
                    </label>
                    <select
                      value={regRank}
                      onChange={(e) => setRegRank(e.target.value)}
                      className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 font-medium"
                    >
                      <option value="Inspector In-Charge (IC)">Inspector In-Charge (IC)</option>
                      <option value="Duty Officer In-Charge (SI)">Duty Officer (SI)</option>
                      <option value="Assistant Sub-Inspector (ASI)">Assistant Sub-Inspector (ASI)</option>
                      <option value="Control Room Dispatcher">Control Room Dispatcher</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 block">
                      {isBn ? 'ব্যাজ নম্বর (Badge ID) *' : 'Badge ID Number *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={regBadge}
                      onChange={(e) => setRegBadge(e.target.value)}
                      placeholder="WB-HOOGHLY-XXXX"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono uppercase focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 block">
                      {isBn ? 'অফিসিয়াল ফোন নম্বর' : 'Duty Contact Phone'}
                    </label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+91 98321 00000"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">
                    {isBn ? 'নিযুক্ত থানা (Station Jurisdiction)' : 'Station Jurisdiction'}
                  </label>
                  <select
                    value={regStation}
                    onChange={(e) => setRegStation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 font-medium"
                  >
                    {WEST_BENGAL_POLICE.map(ps => (
                      <option key={ps.code} value={ps.code}>
                        {ps.name} - ({ps.district})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5" />
                      {isBn ? 'হেডকোয়ার্টার অনুমোদন পাসকোড *' : 'HQ Security Passcode *'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Code: WB_POLICE_HQ_DISPATCH</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={regMasterKey}
                    onChange={(e) => setRegMasterKey(e.target.value)}
                    placeholder="WB_POLICE_HQ_DISPATCH"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-red-800/80 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">
                    {isBn ? 'লগইন পিন / পাসওয়ার্ড নির্ধারণ করুন' : 'Choose Duty Login PIN'}
                  </label>
                  <input
                    type="password"
                    value={regSecretKey}
                    onChange={(e) => setRegSecretKey(e.target.value)}
                    placeholder="e.g. police123"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={regLoading}
                    className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <BadgeAlert className="w-4 h-4" />
                    <span>{regLoading ? (isBn ? 'রেজিস্টার হচ্ছে...' : 'Registering...') : (isBn ? 'অফিসার রেজিস্ট্রেশন সম্পন্ন করুন' : 'Complete Officer Registration')}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
