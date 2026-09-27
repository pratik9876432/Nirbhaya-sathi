import React, { useState } from 'react';
import { useEmergency } from '../EmergencyContext';
import { useLanguage } from '../LanguageContext';
import { Users, UserPlus, X, Trash2, Edit2, ShieldAlert, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function EmergencyContacts() {
  const { contacts, addContact, updateContact, deleteContact, setPrimaryContact } = useEmergency();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);

  const resetForm = () => {
    setName('');
    setPhone('');
    setRelationship('');
    setIsPrimary(false);
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    if (editingId) {
      updateContact(editingId, { name, phone, relationship, isPrimary });
    } else {
      addContact({ name, phone, relationship, isPrimary });
    }
    resetForm();
  };

  const startEdit = (contact: any) => {
    setName(contact.name);
    setPhone(contact.phone);
    setRelationship(contact.relationship || '');
    setIsPrimary(!!contact.isPrimary);
    setEditingId(contact.id);
    setIsAdding(true);
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        <ActionButton label={t('emergencyContacts') || 'SOS Contacts'} icon={<Users />} color="text-rose-600" bgColor="bg-rose-50" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl flex flex-col max-h-[80vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 text-rose-600 font-black text-xl">
                  <ShieldAlert />
                  <span>{t('emergencyContacts') || 'SOS Contacts'}</span>
                </div>
                <button onClick={() => { setIsOpen(false); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-full">
                  <X />
                </button>
              </div>

              {!isAdding ? (
                <div className="flex-1 overflow-auto space-y-4">
                  <p className="text-gray-500 font-medium text-sm">
                    {t('emergencyContactsDesc') || 'These contacts will be automatically notified via SMS when you trigger an SOS.'}
                  </p>
                  
                  {contacts.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>{t('noContacts') || 'No contacts added yet'}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {contacts.map(c => (
                        <div key={c.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                          c.isPrimary 
                            ? 'bg-rose-50/70 border-rose-200 ring-1 ring-rose-200' 
                            : 'bg-gray-50 border-gray-100'
                        }`}>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-gray-900">{c.name}</p>
                              {c.isPrimary && (
                                <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                                  <Star size={10} fill="currentColor" /> Quick Call Primary
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 font-medium font-mono">{c.phone}</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button 
                              onClick={() => setPrimaryContact(c.id)} 
                              title={c.isPrimary ? 'Current Quick Call Primary' : 'Set as Quick Call Primary Contact'}
                              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                                c.isPrimary ? 'text-amber-500 bg-amber-50' : 'text-gray-400 hover:text-amber-500 hover:bg-gray-100'
                              }`}
                            >
                              <Star size={18} fill={c.isPrimary ? 'currentColor' : 'none'} />
                            </button>
                            <button onClick={() => startEdit(c)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer">
                              <Edit2 size={18} />
                            </button>
                            <button onClick={() => deleteContact(c.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => setIsAdding(true)}
                    className="w-full bg-rose-50 text-rose-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-rose-100 transition-all mt-4 cursor-pointer"
                  >
                    <UserPlus size={20} />
                    {t('addContact') || 'ADD CONTACT'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSave} className="space-y-5 flex-1">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Contact Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Mom"
                      required
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-rose-100 focus:border-rose-600 transition-all outline-none font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Phone Number</label>
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 9876543210"
                      required
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-rose-100 focus:border-rose-600 transition-all outline-none font-bold"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Relationship / Tag</label>
                    <input 
                      type="text" 
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      placeholder="e.g. Mother, Sister, Roommate"
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-3.5 focus:ring-4 focus:ring-rose-100 focus:border-rose-600 transition-all outline-none font-bold text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-2.5 px-2">
                    <input
                      type="checkbox"
                      id="isPrimaryContact"
                      checked={isPrimary}
                      onChange={(e) => setIsPrimary(e.target.checked)}
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                    <label htmlFor="isPrimaryContact" className="text-xs font-bold text-gray-700 cursor-pointer">
                      ⭐ Set as Primary 1-Tap Quick Call Contact
                    </label>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button"
                      onClick={resetForm}
                      className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all cursor-pointer"
                    >
                      CANCEL
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 bg-rose-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-rose-700 transition-all cursor-pointer"
                    >
                      SAVE
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function ActionButton({ icon, label, color, bgColor }: any) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 p-6 rounded-3xl ${bgColor} ${color} transition-all cursor-pointer hover:scale-105 active:scale-95`}>
      {React.cloneElement(icon, { size: 32 })}
      <span className="font-bold text-sm text-center line-clamp-1">{label}</span>
    </div>
  );
}
