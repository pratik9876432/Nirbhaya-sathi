import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../LanguageContext';
import { 
  User, 
  Lock, 
  Phone, 
  Mail, 
  Heart, 
  MapPin, 
  UserPlus, 
  LogIn, 
  ShieldCheck, 
  X, 
  AlertCircle,
  CheckCircle2,
  Sparkles,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'LOGIN' | 'REGISTER' | 'PROFILE';
}

export default function UserAuthModal({ isOpen, onClose, initialMode = 'LOGIN' }: UserAuthModalProps) {
  const { currentUser, isUserLoggedIn, loginUser, registerUser, logoutUser, updateUserProfile } = useAuth();
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'PROFILE'>(() => {
    if (isUserLoggedIn) return 'PROFILE';
    return initialMode;
  });

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regEmergencyName, setRegEmergencyName] = useState('');
  const [regEmergencyPhone, setRegEmergencyPhone] = useState('');
  const [regBloodGroup, setRegBloodGroup] = useState('O+');
  const [regAddress, setRegAddress] = useState('');
  const [regCity, setRegCity] = useState('Arambagh');
  const [regPin, setRegPin] = useState('712601');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editEmergencyPhone, setEditEmergencyPhone] = useState(currentUser?.emergencyContactPhone || '');
  const [editAddress, setEditAddress] = useState(currentUser?.address || '');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginIdentifier.trim()) {
      setLoginError(isBn ? 'ফোন নম্বর বা ইমেইল লিখুন' : 'Please enter your phone or email');
      return;
    }
    setLoginLoading(true);
    const res = await loginUser(loginIdentifier, loginPassword);
    setLoginLoading(false);
    if (!res.success) {
      setLoginError(res.error || 'Login failed');
    } else {
      setMode('PROFILE');
      setTimeout(() => {
        onClose();
      }, 800);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (!regName.trim() || !regPhone.trim()) {
      setRegError(isBn ? 'নাম ও মোবাইল নম্বর আবশ্যক!' : 'Name and Mobile number are required!');
      return;
    }
    if (regPhone.replace(/\D/g, '').length < 10) {
      setRegError(isBn ? 'সঠিক ১০ সংখ্যার মোবাইল নম্বর দিন' : 'Enter a valid 10-digit mobile number');
      return;
    }

    setRegLoading(true);
    const res = await registerUser({
      name: regName.trim(),
      phone: regPhone.trim(),
      email: regEmail.trim() || `${regPhone.trim()}@nirbhayasathi.local`,
      password: regPassword.trim() || 'password123',
      emergencyContactName: regEmergencyName.trim() || undefined,
      emergencyContactPhone: regEmergencyPhone.trim() || undefined,
      bloodGroup: regBloodGroup,
      address: regAddress.trim() || undefined,
      city: regCity.trim(),
      state: 'West Bengal',
      pinCode: regPin.trim(),
    });
    setRegLoading(false);

    if (!res.success) {
      setRegError(res.error || 'Registration failed');
    } else {
      setRegSuccess(true);
      setTimeout(() => {
        setRegSuccess(false);
        setMode('PROFILE');
        onClose();
      }, 1000);
    }
  };

  const handleSaveProfile = () => {
    updateUserProfile({
      name: editName,
      emergencyContactPhone: editEmergencyPhone,
      address: editAddress,
    });
    setIsEditingProfile(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 my-8"
      >
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-rose-600 to-indigo-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">
                {isBn ? 'নাগরিক সুরক্ষা অ্যাকাউন্ট' : 'Citizen Safety Profile'}
              </h3>
              <p className="text-xs text-rose-100 font-medium">
                {isBn ? 'জরুরি সেফটি নেটওয়ার্ক ও কন্টাক্ট ডেটাবেস' : 'Emergency SOS & Safety Network Database'}
              </p>
            </div>
          </div>

          {/* Tab Switchers if not forced */}
          {!isUserLoggedIn && (
            <div className="flex bg-black/20 p-1 rounded-2xl mt-5 gap-1">
              <button
                type="button"
                onClick={() => { setMode('LOGIN'); setLoginError(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'LOGIN' ? 'bg-white text-gray-900 shadow-md' : 'text-white/80 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{isBn ? 'লগইন (Login)' : 'Sign In'}</span>
              </button>
              <button
                type="button"
                onClick={() => { setMode('REGISTER'); setRegError(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'REGISTER' ? 'bg-white text-gray-900 shadow-md' : 'text-white/80 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isBn ? 'নতুন নিবন্ধন (Register)' : 'New Register'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Body Content */}
        <div className="p-6">
          {/* 1. LOGIN MODE */}
          {mode === 'LOGIN' && !isUserLoggedIn && (
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
                  {isBn ? 'মোবাইল নম্বর অথবা ইমেইল' : 'Mobile Number or Email'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder={isBn ? 'যেমন: 9876543210 বা ইমেইল' : 'e.g. 9876543210 or email'}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-indigo-600 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-700 block">
                    {isBn ? 'পাসওয়ার্ড (Password)' : 'Password'}
                  </label>
                  <span className="text-[11px] text-indigo-600 font-semibold cursor-pointer">
                    {isBn ? 'ডিফল্ট: password123' : 'Default: password123'}
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-indigo-600 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 active:scale-95 text-white font-black text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{loginLoading ? (isBn ? 'লগইন হচ্ছে...' : 'Verifying...') : (isBn ? 'লগইন করুন' : 'Sign In Now')}</span>
                </button>
              </div>

              {/* Quick Demo Citizen Login button */}
              <div className="pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setLoginIdentifier('98765 43210');
                    setLoginPassword('password123');
                  }}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{isBn ? '১-ক্লিকে টেস্ট ডেমো ইউজার ভরুন' : 'Fill Demo Citizen Credentials'}</span>
                </button>
              </div>
            </form>
          )}

          {/* 2. REGISTER MODE */}
          {mode === 'REGISTER' && !isUserLoggedIn && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              {regError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{isBn ? 'অভিনন্দন! আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।' : 'Success! Your account is created.'}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">
                  {isBn ? 'আপনার পূর্ণ নাম *' : 'Full Name *'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder={isBn ? 'যেমন: মৌমিতা সেন' : 'e.g. Moumita Sen'}
                    className="w-full pl-10 pr-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">
                    {isBn ? 'মোবাইল নম্বর *' : 'Mobile Number *'}
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">
                    {isBn ? 'ব্লাড গ্রুপ (Blood Group)' : 'Blood Group'}
                  </label>
                  <select
                    value={regBloodGroup}
                    onChange={(e) => setRegBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-none font-semibold text-gray-700"
                  >
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">
                  {isBn ? 'ইমেইল অ্যাড্রেস (ঐচ্ছিক)' : 'Email Address (Optional)'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="youremail@example.com"
                    className="w-full pl-10 pr-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-2xl space-y-2">
                <span className="text-[11px] font-black text-rose-700 uppercase tracking-wider flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-600" />
                  {isBn ? 'প্রাথমিক অভিভাবক / জরুরি যোগাযোগ' : 'Primary Emergency Guardian'}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={regEmergencyName}
                    onChange={(e) => setRegEmergencyName(e.target.value)}
                    placeholder={isBn ? 'অভিভাবকের নাম' : 'Guardian Name'}
                    className="w-full px-3 py-1.5 bg-white border border-rose-200 rounded-lg text-xs focus:outline-none focus:border-rose-500"
                  />
                  <input
                    type="tel"
                    value={regEmergencyPhone}
                    onChange={(e) => setRegEmergencyPhone(e.target.value)}
                    placeholder={isBn ? 'অভিভাবকের ফোন' : 'Guardian Phone'}
                    className="w-full px-3 py-1.5 bg-white border border-rose-200 rounded-lg text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">
                    {isBn ? 'শহর / থানা এলাকা' : 'Town / Station'}
                  </label>
                  <input
                    type="text"
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    placeholder="Arambagh"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">
                    {isBn ? 'পিন কোড' : 'PIN'}
                  </label>
                  <input
                    type="text"
                    value={regPin}
                    onChange={(e) => setRegPin(e.target.value)}
                    placeholder="712601"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">
                  {isBn ? 'লগইন পাসওয়ার্ড নির্ধারণ করুন' : 'Choose Login Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="কমপক্ষে ৬ ডিজিটের পাসওয়ার্ড"
                    className="w-full pl-10 pr-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-3 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 active:scale-95 text-white font-black text-sm rounded-xl shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{regLoading ? (isBn ? 'নিবন্ধন হচ্ছে...' : 'Registering...') : (isBn ? 'অ্যাকাউন্ট তৈরি সম্পন্ন করুন' : 'Complete Registration')}</span>
                </button>
              </div>
            </form>
          )}

          {/* 3. PROFILE DETAILS MODE */}
          {(isUserLoggedIn || mode === 'PROFILE') && currentUser && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-gray-900 text-base truncate">
                    {currentUser.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                    <span>{currentUser.phone}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span className="bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded-md text-[10px]">
                      {currentUser.bloodGroup || 'O+'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Details List */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gray-400" /> {isBn ? 'ইমেইল' : 'Email'}
                  </span>
                  <span className="font-semibold text-gray-800">{currentUser.email}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500" /> {isBn ? 'ইমার্জেন্সি অভিভাবক' : 'Guardian Contact'}
                  </span>
                  <span className="font-semibold text-rose-600 font-mono">
                    {currentUser.emergencyContactPhone || 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" /> {isBn ? 'শহর / ঠিকানা' : 'Location'}
                  </span>
                  <span className="font-semibold text-gray-800">
                    {currentUser.city || 'Arambagh'}, {currentUser.pinCode || '712601'}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    logoutUser();
                    setMode('LOGIN');
                  }}
                  className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{isBn ? 'লগআউট (Logout)' : 'Sign Out'}</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{isBn ? 'ঠিক আছে (Close)' : 'Done'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
