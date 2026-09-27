import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  Heart, 
  MapPin, 
  ShieldAlert, 
  Calendar, 
  Send,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';

interface RegisteredCitizensDatabaseProps {
  onDispatchSOSForUser?: (user: UserProfile) => void;
}

export default function RegisteredCitizensDatabase({ onDispatchSOSForUser }: RegisteredCitizensDatabaseProps) {
  const [citizens, setCitizens] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [broadcastNotice, setBroadcastNotice] = useState('');
  const [noticeSent, setNoticeSent] = useState(false);

  const loadCitizens = () => {
    try {
      const raw = localStorage.getItem('nirbhoya_user_directory') || '[]';
      const parsed = JSON.parse(raw);
      setCitizens(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      console.error(e);
      setCitizens([]);
    }
  };

  useEffect(() => {
    loadCitizens();
    window.addEventListener('storage', loadCitizens);
    return () => window.removeEventListener('storage', loadCitizens);
  }, []);

  const filtered = citizens.filter(c => {
    const q = search.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.city && c.city.toLowerCase().includes(q)) ||
      (c.address && c.address.toLowerCase().includes(q))
    );
  });

  const handleSendCommunityBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastNotice.trim()) return;
    setNoticeSent(true);
    setTimeout(() => {
      setBroadcastNotice('');
      setNoticeSent(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <span>নিবন্ধিত নাগরিক ও নারী সুরক্ষা ডেটাবেস (Registered Citizen Dossier)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              যেকোনো মহিলা বা নাগরিক অ্যাপে রেজিস্ট্রেশন করার সাথে সাথে তাঁদের নাম, ফোন, ব্লাড গ্রুপ ও অভিভাবকের বিবরণ পুলিশের এই কন্ট্রোল প্যানেলে স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকে।
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 bg-indigo-950/80 border border-indigo-700/80 text-indigo-300 font-mono text-xs font-bold rounded-xl">
              মোট নিবন্ধিত নাগরিক: {citizens.length} জন
            </span>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="নাম, ফোন নম্বর, শহর বা অভিভাবক লিখে খুঁজুন..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Directory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((citizen) => (
          <div
            key={citizen.id}
            className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 shadow-lg space-y-4 transition-all"
          >
            {/* Header with Avatar and Blood Group */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 text-white font-black text-base flex items-center justify-center shadow-md">
                  {citizen.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-black text-white text-sm leading-tight">{citizen.name}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">ID: {citizen.id}</span>
                </div>
              </div>

              {citizen.bloodGroup && (
                <span className="px-2 py-0.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400 font-black text-xs">
                  {citizen.bloodGroup}
                </span>
              )}
            </div>

            {/* Contacts & Guardian details */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" /> নাগরিক ফোন:
                </span>
                <a 
                  href={`tel:${citizen.phone}`}
                  className="font-mono font-bold text-white hover:text-emerald-400 transition-colors"
                >
                  {citizen.phone}
                </a>
              </div>

              {citizen.emergencyContactPhone && (
                <div className="p-2.5 bg-rose-950/40 border border-rose-900/60 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-rose-300 font-bold flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-400" /> অভিভাবক: {citizen.emergencyContactName || 'Guardian'}
                    </span>
                    <a
                      href={`tel:${citizen.emergencyContactPhone}`}
                      className="text-white font-mono font-bold hover:underline"
                    >
                      {citizen.emergencyContactPhone}
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" /> শহর / থানা:
                </span>
                <span className="text-white font-medium truncate max-w-[150px]">
                  {citizen.city || 'আরামবাগ'}, {citizen.pinCode || '712601'}
                </span>
              </div>

              {citizen.address && (
                <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded-lg truncate">
                  ঠিকানা: {citizen.address}
                </div>
              )}
            </div>

            {/* Quick Action Button for Police Dispatch */}
            {onDispatchSOSForUser && (
              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => onDispatchSOSForUser(citizen)}
                  className="w-full py-2 bg-red-600/90 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>জরুরি অনুসন্ধান / টেস্ট ডিসপ্যাচ</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-2">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="font-bold text-white">কোনো নাগরিক রেকর্ড পাওয়া যায়নি</p>
          <p className="text-xs">অ্যাপে নতুন নাগরিক রেজিস্টার করলেই এখানে তাঁর রেকর্ড যুক্ত হবে।</p>
        </div>
      )}
    </div>
  );
}
