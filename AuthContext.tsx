import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { UserProfile, PoliceOfficerUser } from './types';

interface AuthContextType {
  // Citizen User
  currentUser: UserProfile | null;
  isUserLoggedIn: boolean;
  registerUser: (userData: Omit<UserProfile, 'id' | 'createdAt'> & { password?: string }) => Promise<{ success: boolean; error?: string }>;
  loginUser: (identifier: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logoutUser: () => void;
  updateUserProfile: (data: Partial<UserProfile>) => void;

  // Police Controller Officer
  currentPoliceOfficer: PoliceOfficerUser | null;
  isPoliceLoggedIn: boolean;
  registerPoliceOfficer: (officerData: Omit<PoliceOfficerUser, 'id' | 'createdAt' | 'isVerifiedDutyOfficer'> & { secretKey: string }) => Promise<{ success: boolean; error?: string }>;
  loginPoliceOfficer: (stationCode: string, badgeNumber: string, secretKey: string) => Promise<{ success: boolean; error?: string }>;
  logoutPoliceOfficer: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial Default Users and Stations if none exist
const DEFAULT_POLICE_OFFICERS: Array<PoliceOfficerUser & { secretKey: string }> = [
  {
    id: 'POLICE-DUTY-001',
    badgeNumber: 'WB-HOOGHLY-712601',
    name: 'Sub-Inspector R. Ghosh',
    rank: 'Duty Officer In-Charge (SI)',
    stationCode: '712601_ARAMBAGH',
    stationName: 'Arambagh Police Station (আরামবাগ থানা)',
    district: 'Hooghly',
    phone: '+91 98321 54321',
    email: 'arambagh.ps@wbpolice.gov.in',
    isVerifiedDutyOfficer: true,
    secretKey: 'police123',
    createdAt: Date.now() - 86400000 * 30
  },
  {
    id: 'POLICE-DUTY-002',
    badgeNumber: 'WB-HOOGHLY-712417',
    name: 'Inspector M. Banerjee',
    rank: 'Inspector In-Charge (IC)',
    stationCode: '712417_KHANAKUL',
    stationName: 'Khanakul Police Station (খানাাকুল থানা)',
    district: 'Hooghly',
    phone: '+91 98322 65432',
    email: 'khanakul.ps@wbpolice.gov.in',
    isVerifiedDutyOfficer: true,
    secretKey: 'police123',
    createdAt: Date.now() - 86400000 * 20
  }
];

const DEFAULT_CITIZEN_USER: UserProfile = {
  id: 'USER-CITIZEN-001',
  name: 'অনন্যা রায় (Ananya Roy)',
  email: 'ananya.roy@example.com',
  phone: '+91 98765 43210',
  emergencyContactName: 'বিকাশ রায় (বাবা)',
  emergencyContactPhone: '+91 98765 11111',
  bloodGroup: 'O+',
  address: 'ওয়ার্ড ৪, আরামবাগ বাস স্ট্যান্ড রোড',
  city: 'আরামবাগ (Arambagh)',
  state: 'পশ্চিমবঙ্গ (West Bengal)',
  pinCode: '712601',
  createdAt: Date.now() - 86400000 * 10
};

export function AuthProvider({ children }: { children: ReactNode }) {
  // Citizen state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('nirbhoya_active_user');
      if (stored) return JSON.parse(stored);
      // Preload a default profile so the app feels alive, or null
      return DEFAULT_CITIZEN_USER;
    } catch {
      return DEFAULT_CITIZEN_USER;
    }
  });

  // Police Officer state
  const [currentPoliceOfficer, setCurrentPoliceOfficer] = useState<PoliceOfficerUser | null>(() => {
    try {
      const stored = localStorage.getItem('nirbhoya_active_police');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Ensure police officers directory exists
  useEffect(() => {
    try {
      const storedOfficers = localStorage.getItem('nirbhoya_police_directory');
      if (!storedOfficers) {
        localStorage.setItem('nirbhoya_police_directory', JSON.stringify(DEFAULT_POLICE_OFFICERS));
      }
      const storedUsers = localStorage.getItem('nirbhoya_user_directory');
      if (!storedUsers) {
        localStorage.setItem('nirbhoya_user_directory', JSON.stringify([
          { ...DEFAULT_CITIZEN_USER, password: 'password123' }
        ]));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save active user
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('nirbhoya_active_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('nirbhoya_active_user');
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  // Save active police
  useEffect(() => {
    try {
      if (currentPoliceOfficer) {
        localStorage.setItem('nirbhoya_active_police', JSON.stringify(currentPoliceOfficer));
      } else {
        localStorage.removeItem('nirbhoya_active_police');
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentPoliceOfficer]);

  // Citizen Registration
  const registerUser = useCallback(async (
    userData: Omit<UserProfile, 'id' | 'createdAt'> & { password?: string }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const rawUsers = localStorage.getItem('nirbhoya_user_directory') || '[]';
      const users: Array<UserProfile & { password?: string }> = JSON.parse(rawUsers);

      // Check duplicate phone or email
      const exists = users.find(u => 
        (userData.phone && u.phone === userData.phone) || 
        (userData.email && u.email.toLowerCase() === userData.email.toLowerCase())
      );

      if (exists) {
        return { success: false, error: 'এই ফোন নম্বর বা ইমেইল দিয়ে ইতিপূর্বে একাউন্ট খোলা হয়েছে!' };
      }

      const newUser: UserProfile & { password?: string } = {
        ...userData,
        id: `USER-${Date.now().toString().slice(-6)}`,
        createdAt: Date.now()
      };

      users.push(newUser);
      localStorage.setItem('nirbhoya_user_directory', JSON.stringify(users));

      // Auto login
      const { password, ...safeUser } = newUser;
      setCurrentUser(safeUser);

      // Also set primary emergency contact if provided
      if (userData.emergencyContactName && userData.emergencyContactPhone) {
        try {
          const rawContacts = localStorage.getItem('emergency_contacts') || '[]';
          const contacts = JSON.parse(rawContacts);
          const newPrimary = {
            id: Date.now().toString(),
            name: userData.emergencyContactName,
            phone: userData.emergencyContactPhone,
            relationship: 'Primary Contact (রেজিস্ট্রেশন থেকে সংরক্ষিত)',
            isPrimary: true
          };
          const updatedContacts = [newPrimary, ...contacts.filter((c: any) => c.phone !== userData.emergencyContactPhone)];
          localStorage.setItem('emergency_contacts', JSON.stringify(updatedContacts));
          window.dispatchEvent(new Event('storage'));
        } catch (e) {}
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'নিবন্ধন ব্যর্থ হয়েছে!' };
    }
  }, []);

  // Citizen Login
  const loginUser = useCallback(async (identifier: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanIdent = identifier.trim().toLowerCase();
      const rawUsers = localStorage.getItem('nirbhoya_user_directory') || '[]';
      const users: Array<UserProfile & { password?: string }> = JSON.parse(rawUsers);

      const found = users.find(u => 
        u.phone.replace(/\s+/g, '').includes(cleanIdent.replace(/\s+/g, '')) ||
        u.email.toLowerCase() === cleanIdent
      );

      if (!found) {
        return { success: false, error: 'কোনো ব্যবহারকারী পাওয়া যায়নি! সঠিক ফোন নম্বর বা ইমেইল দিন।' };
      }

      // If user registered with a password, check it
      if (found.password && password && found.password !== password) {
        return { success: false, error: 'পাসওয়ার্ড সঠিক নয়! অনুগ্রহ করে পুনরায় চেষ্টা করুন।' };
      }

      const { password: _, ...safeUser } = found;
      setCurrentUser(safeUser);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'লগইন ব্যর্থ হয়েছে!' };
    }
  }, []);

  const logoutUser = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const updateUserProfile = useCallback((data: Partial<UserProfile>) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      try {
        const rawUsers = localStorage.getItem('nirbhoya_user_directory') || '[]';
        const users: UserProfile[] = JSON.parse(rawUsers);
        const newUsers = users.map(u => u.id === prev.id ? { ...u, ...data } : u);
        localStorage.setItem('nirbhoya_user_directory', JSON.stringify(newUsers));
      } catch (e) {}
      return updated;
    });
  }, []);

  // Police Officer Registration (with Authorization Token)
  const registerPoliceOfficer = useCallback(async (
    officerData: Omit<PoliceOfficerUser, 'id' | 'createdAt' | 'isVerifiedDutyOfficer'> & { secretKey: string }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const rawOfficers = localStorage.getItem('nirbhoya_police_directory') || '[]';
      const officers: Array<PoliceOfficerUser & { secretKey: string }> = JSON.parse(rawOfficers);

      // Check badge exists
      if (officers.some(o => o.badgeNumber.toLowerCase() === officerData.badgeNumber.trim().toLowerCase())) {
        return { success: false, error: 'এই ব্যাজ নম্বরটি (Badge No) ইতিমধ্যে নিবন্ধিত আছে।' };
      }

      const newOfficer: PoliceOfficerUser & { secretKey: string } = {
        ...officerData,
        id: `OFFICER-${Date.now().toString().slice(-6)}`,
        isVerifiedDutyOfficer: true,
        createdAt: Date.now()
      };

      officers.push(newOfficer);
      localStorage.setItem('nirbhoya_police_directory', JSON.stringify(officers));

      const { secretKey, ...safeOfficer } = newOfficer;
      setCurrentPoliceOfficer(safeOfficer);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'অফিসার রেজিস্ট্রেশন ব্যর্থ হয়েছে!' };
    }
  }, []);

  // Police Officer Login
  const loginPoliceOfficer = useCallback(async (
    stationCode: string,
    badgeNumber: string,
    secretKey: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const rawOfficers = localStorage.getItem('nirbhoya_police_directory') || '[]';
      const officers: Array<PoliceOfficerUser & { secretKey: string }> = JSON.parse(rawOfficers);

      const cleanBadge = badgeNumber.trim().toLowerCase();
      const officer = officers.find(o => 
        o.badgeNumber.toLowerCase() === cleanBadge &&
        (stationCode === 'ALL' || o.stationCode === stationCode)
      );

      if (!officer) {
        return { 
          success: false, 
          error: 'ব্যাজ নম্বর বা থানা নির্বাচন সঠিক নয়। শুধুমাত্র অনুমোদিত পুলিশ অফিসাররা এই পোর্টালে প্রবেশ করতে পারেন।' 
        };
      }

      if (officer.secretKey !== secretKey.trim()) {
        return { success: false, error: 'অনুমোদিত সিকিউরিটি পিন/কি (Secret Key) সঠিক নয়!' };
      }

      const { secretKey: _, ...safeOfficer } = officer;
      setCurrentPoliceOfficer(safeOfficer);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'পুলিশ লগইন ব্যর্থ হয়েছে!' };
    }
  }, []);

  const logoutPoliceOfficer = useCallback(() => {
    setCurrentPoliceOfficer(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isUserLoggedIn: !!currentUser,
        registerUser,
        loginUser,
        logoutUser,
        updateUserProfile,

        currentPoliceOfficer,
        isPoliceLoggedIn: !!currentPoliceOfficer,
        registerPoliceOfficer,
        loginPoliceOfficer,
        logoutPoliceOfficer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
