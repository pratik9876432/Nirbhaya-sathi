import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { EmergencyState, EmergencyType, Contact, PoliceAlert, AudioSnippet } from './types';
import { createPoliceEmergencyAlert, getStoredAlerts, updateAlertStatus, appendAudioSnippetToAlert } from './services/policeAlertService';
import { startSilentPanicVibration, stopSilentPanicVibration, SilentAudioStreamer } from './services/silentPanicService';

interface EmergencyContextType {
  emergency: EmergencyState;
  contacts: Contact[];
  primaryContact: Contact | null;
  activePoliceAlert: PoliceAlert | null;
  allPoliceAlerts: PoliceAlert[];
  addContact: (contact: Omit<Contact, 'id'>) => void;
  updateContact: (id: string, contact: Omit<Contact, 'id'>) => void;
  deleteContact: (id: string) => void;
  setPrimaryContact: (id: string) => void;
  savePrimaryQuickContact: (contact: { name: string; phone: string; relationship?: string }) => void;
  startEmergency: (type?: EmergencyType, isSilent?: boolean) => void;
  startSilentPanicEmergency: () => void;
  stopEmergency: () => void;
  updateLocation: (lat: number, lng: number) => void;
  refreshPoliceAlerts: () => void;
  isSilentPanic: boolean;
  silentAudioSnippets: AudioSnippet[];
  vibrationActive: boolean;
  audioLevel: number;
  toggleVibration: () => void;
}

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

export function EmergencyProvider({ children }: { children: ReactNode }) {
  const [emergency, setEmergency] = useState<EmergencyState>({
    isActive: false,
    type: null,
    startTime: null,
    location: null,
    isSilentPanic: false,
    audioSnippets: [],
  });

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeAlertId, setActiveAlertId] = useState<string | null>(null);
  const [allPoliceAlerts, setAllPoliceAlerts] = useState<PoliceAlert[]>([]);
  const [isSilentPanic, setIsSilentPanic] = useState(false);
  const [silentAudioSnippets, setSilentAudioSnippets] = useState<AudioSnippet[]>([]);
  const [vibrationActive, setVibrationActive] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const audioStreamerRef = useRef<SilentAudioStreamer | null>(null);

  const refreshPoliceAlerts = useCallback(() => {
    const alerts = getStoredAlerts();
    setAllPoliceAlerts(alerts);
  }, []);

  useEffect(() => {
    refreshPoliceAlerts();

    const handleStorage = () => refreshPoliceAlerts();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('nirbhoya_alerts_updated', handleStorage);

    let channel: BroadcastChannel | null = null;
    try {
      if ('BroadcastChannel' in window) {
        channel = new BroadcastChannel('nirbhoya_police_broadcast_channel');
        channel.onmessage = () => refreshPoliceAlerts();
      }
    } catch (e) {}

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('nirbhoya_alerts_updated', handleStorage);
      if (channel) channel.close();
    };
  }, [refreshPoliceAlerts]);

  const activePoliceAlert = React.useMemo(() => {
    if (!activeAlertId) return null;
    return allPoliceAlerts.find(a => a.id === activeAlertId) || null;
  }, [activeAlertId, allPoliceAlerts]);

  useEffect(() => {
    const saved = localStorage.getItem('emergency_contacts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setContacts(parsed);
          return;
        }
      } catch (e) {}
    }
    // Default initial trusted primary contact if none exists
    const defaultContacts: Contact[] = [
      { id: '1', name: 'Maa / Mother', phone: '+919876543210', relationship: 'Mother', isPrimary: true },
      { id: '2', name: 'Baba / Father', phone: '+919830123456', relationship: 'Father', isPrimary: false }
    ];
    setContacts(defaultContacts);
    localStorage.setItem('emergency_contacts', JSON.stringify(defaultContacts));
  }, []);

  const primaryContact = React.useMemo(() => {
    return contacts.find(c => c.isPrimary) || (contacts.length > 0 ? contacts[0] : null);
  }, [contacts]);

  const setPrimaryContact = useCallback((id: string) => {
    setContacts(prev => {
      const updated = prev.map(c => ({
        ...c,
        isPrimary: c.id === id
      }));
      localStorage.setItem('emergency_contacts', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const savePrimaryQuickContact = useCallback((contactData: { name: string; phone: string; relationship?: string }) => {
    setContacts(prev => {
      let updated: Contact[];
      const existingPrimaryIndex = prev.findIndex(c => c.isPrimary);
      if (existingPrimaryIndex >= 0) {
        updated = prev.map((c, idx) => 
          idx === existingPrimaryIndex 
            ? { ...c, name: contactData.name, phone: contactData.phone, relationship: contactData.relationship || c.relationship, isPrimary: true }
            : { ...c, isPrimary: false }
        );
      } else if (prev.length > 0) {
        updated = prev.map((c, idx) => 
          idx === 0
            ? { ...c, name: contactData.name, phone: contactData.phone, relationship: contactData.relationship || c.relationship, isPrimary: true }
            : { ...c, isPrimary: false }
        );
      } else {
        updated = [{
          id: Date.now().toString(),
          name: contactData.name,
          phone: contactData.phone,
          relationship: contactData.relationship || 'Primary Contact',
          isPrimary: true
        }];
      }
      localStorage.setItem('emergency_contacts', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addContact = useCallback((contact: Omit<Contact, 'id'>) => {
    const newContact: Contact = { 
      ...contact, 
      id: Date.now().toString(),
      isPrimary: contact.isPrimary ?? false 
    };
    setContacts(prev => {
      let updated: Contact[];
      if (newContact.isPrimary) {
        updated = prev.map(c => ({ ...c, isPrimary: false })).concat(newContact);
      } else {
        // If it's the very first contact, auto-designate as primary
        if (prev.length === 0) newContact.isPrimary = true;
        updated = [...prev, newContact];
      }
      localStorage.setItem('emergency_contacts', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateContact = useCallback((id: string, contact: Omit<Contact, 'id'>) => {
    setContacts(prev => {
      const updated = prev.map(c => {
        if (c.id === id) {
          return { ...c, ...contact };
        }
        if (contact.isPrimary) {
          return { ...c, isPrimary: false };
        }
        return c;
      });
      localStorage.setItem('emergency_contacts', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteContact = useCallback((id: string) => {
    setContacts(prev => {
      const updated = prev.filter(c => c.id !== id);
      // If deleted was primary and list has remaining, make the first one primary
      if (updated.length > 0 && !updated.some(c => c.isPrimary)) {
        updated[0].isPrimary = true;
      }
      localStorage.setItem('emergency_contacts', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const gpsWatchRef = useRef<number | null>(null);

  const updateLocation = useCallback((lat: number, lng: number) => {
    setEmergency(prev => ({ ...prev, location: { lat, lng } }));
  }, []);

  const startEmergency = useCallback((type: EmergencyType = 'Danger', isSilent = false) => {
    setIsSilentPanic(isSilent);
    setSilentAudioSnippets([]);

    setEmergency({
      isActive: true,
      type,
      startTime: Date.now(),
      location: null,
      isSilentPanic: isSilent,
      audioSnippets: [],
    });
    
    // Clear any existing GPS watch
    if (gpsWatchRef.current !== null) {
      try {
        navigator.geolocation.clearWatch(gpsWatchRef.current);
      } catch (e) {}
      gpsWatchRef.current = null;
    }

    // Stop any previously running audio streamer
    if (audioStreamerRef.current) {
      audioStreamerRef.current.stop();
      audioStreamerRef.current = null;
    }

    // If Silent Panic Mode is triggered, activate high-frequency vibration patterns
    if (isSilent) {
      setVibrationActive(true);
      startSilentPanicVibration(() => {
        setVibrationActive(true);
      });
    }

    const dispatchAlertForLocation = (lat: number, lng: number) => {
      updateLocation(lat, lng);

      // Use active user profile from storage if available
      let callerName = isSilent 
        ? 'Citizen in Silent Danger (নিঃশব্দ প্যানিক)' 
        : 'Women in Danger (বিপদে সাহায্য প্রার্থী)';
      let callerPhone = '+91 98321 00000';
      let callerId = `CITIZEN-${Date.now().toString().slice(-4)}`;
      let callerEmail: string | undefined;
      let callerBlood: string | undefined;
      let guardianName: string | undefined;
      let guardianPhone: string | undefined;
      let callerAddress: string | undefined;
      let callerCity: string | undefined;

      try {
        const storedUser = localStorage.getItem('nirbhoya_active_user');
        if (storedUser) {
          const userObj = JSON.parse(storedUser);
          if (userObj.name) callerName = userObj.name;
          if (userObj.phone) callerPhone = userObj.phone;
          if (userObj.id) callerId = userObj.id;
          if (userObj.email) callerEmail = userObj.email;
          if (userObj.bloodGroup) callerBlood = userObj.bloodGroup;
          if (userObj.emergencyContactName) guardianName = userObj.emergencyContactName;
          if (userObj.emergencyContactPhone) guardianPhone = userObj.emergencyContactPhone;
          if (userObj.address) callerAddress = userObj.address;
          if (userObj.city) callerCity = userObj.city;
        }
      } catch (e) {}

      const customMsg = isSilent
        ? `🚨 SILENT PANIC ALARM (COVERT SOS): Citizen "${callerName}" (${callerPhone}) held SOS for 3 seconds. Continuous ambient audio stream snippets are auto-uploading to Control Room. Location: [${lat.toFixed(5)}, ${lng.toFixed(5)}] Hooghly Police Zone.`
        : `🚨 জরুরী বিপদ সংকেত: "${callerName}" (${callerPhone}) চরম বিপদে পড়েছেন! জিপিএস অবস্থান: [${lat.toFixed(5)}, ${lng.toFixed(5)}]। অভিভাবক: ${guardianName || 'N/A'} (${guardianPhone || 'N/A'})। জরুরি পুলিশ বাহিনী দ্রুত প্রেরণ করুন!`;

      const alert = createPoliceEmergencyAlert(lat, lng, type, {
        name: callerName,
        phone: callerPhone,
        id: callerId,
        email: callerEmail,
        bloodGroup: callerBlood,
        guardianName: guardianName,
        guardianPhone: guardianPhone,
        address: callerAddress,
        city: callerCity,
        isSilentPanic: isSilent,
        customMessage: customMsg
      });
      setActiveAlertId(alert.id);
      refreshPoliceAlerts();

      // If Silent Panic Mode: automatically launch ambient audio stream recorder and auto-uploader
      if (isSilent) {
        const streamer = new SilentAudioStreamer({
          alertId: alert.id,
          snippetDurationMs: 5000,
          onAudioLevel: (lvl) => setAudioLevel(lvl),
          onSnippetUploaded: (snippet) => {
            setSilentAudioSnippets(prev => [snippet, ...prev]);
            setEmergency(prev => ({
              ...prev,
              audioSnippets: [snippet, ...(prev.audioSnippets || [])]
            }));
            appendAudioSnippetToAlert(alert.id, snippet);
            refreshPoliceAlerts();
          }
        });
        streamer.start();
        audioStreamerRef.current = streamer;
      }
    };

    // Enable continuous tracking with graceful fallback
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      try {
        const handleSuccess = (pos: GeolocationPosition) => {
          dispatchAlertForLocation(pos.coords.latitude, pos.coords.longitude);
        };

        const handleError = (err: GeolocationPositionError) => {
          console.warn("Geolocation watch info:", err?.message || "Location unavailable");
          // Fallback to Arambagh / Hooghly default coordinates so emergency dispatch functions
          dispatchAlertForLocation(22.8824, 87.7842);
        };

        const watchId = navigator.geolocation.watchPosition(
          handleSuccess,
          () => {
            try {
              navigator.geolocation.getCurrentPosition(
                handleSuccess,
                handleError,
                { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
              );
            } catch (e) {
              handleError(e as any);
            }
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 30000 }
        );
        gpsWatchRef.current = watchId;
      } catch (e) {
        console.warn("Geolocation watch could not be initialized:", e);
        dispatchAlertForLocation(22.8824, 87.7842);
      }
    } else {
      dispatchAlertForLocation(22.8824, 87.7842);
    }
  }, [updateLocation, refreshPoliceAlerts]);

  const startSilentPanicEmergency = useCallback(() => {
    startEmergency('Danger', true);
  }, [startEmergency]);

  const toggleVibration = useCallback(() => {
    if (vibrationActive) {
      stopSilentPanicVibration();
      setVibrationActive(false);
    } else {
      setVibrationActive(true);
      startSilentPanicVibration(() => setVibrationActive(true));
    }
  }, [vibrationActive]);

  const stopEmergency = useCallback(() => {
    // Stop audio streaming
    if (audioStreamerRef.current) {
      audioStreamerRef.current.stop();
      audioStreamerRef.current = null;
    }
    // Stop haptic vibration
    stopSilentPanicVibration();
    setVibrationActive(false);
    setIsSilentPanic(false);
    setAudioLevel(0);

    if (gpsWatchRef.current !== null) {
      try {
        navigator.geolocation.clearWatch(gpsWatchRef.current);
      } catch (e) {}
      gpsWatchRef.current = null;
    }

    if (activeAlertId) {
      updateAlertStatus(activeAlertId, 'CANCELLED', {
        policeNotes: 'Emergency stopped by user - marked as safe.'
      });
    }

    setEmergency({
      isActive: false,
      type: null,
      startTime: null,
      location: null,
      isSilentPanic: false,
      audioSnippets: [],
    });
    setActiveAlertId(null);
    refreshPoliceAlerts();
  }, [activeAlertId, refreshPoliceAlerts]);

  // Shake detection (mobile simulation)
  useEffect(() => {
    let lastUpdate = 0;
    let lastX = 0, lastY = 0, lastZ = 0;
    const SHAKE_THRESHOLD = 800;

    const handleMotion = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity;
      if (!acceleration) return;

      const currTime = Date.now();
      if ((currTime - lastUpdate) > 100) {
        const diffTime = currTime - lastUpdate;
        lastUpdate = currTime;

        const x = acceleration.x || 0;
        const y = acceleration.y || 0;
        const z = acceleration.z || 0;

        const speed = Math.abs(x + y + z - lastX - lastY - lastZ) / diffTime * 10000;

        if (speed > SHAKE_THRESHOLD && !emergency.isActive) {
          startEmergency('Danger');
        }

        lastX = x; lastY = y; lastZ = z;
      }
    };

    try {
      if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', handleMotion);
      }
    } catch (e) {
      console.warn("DeviceMotionEvent registration not supported or allowed:", e);
    }

    return () => {
      try {
        if (window.DeviceMotionEvent) {
          window.removeEventListener('devicemotion', handleMotion);
        }
      } catch (e) {}
      
      // Cleanup geolocation watch if component unmounts
      if (gpsWatchRef.current !== null) {
        try {
          navigator.geolocation.clearWatch(gpsWatchRef.current);
        } catch (e) {}
      }
    };
  }, [emergency.isActive, startEmergency]);

  return (
    <EmergencyContext.Provider value={{ 
      emergency, 
      contacts, 
      primaryContact,
      activePoliceAlert,
      allPoliceAlerts,
      addContact, 
      updateContact, 
      deleteContact, 
      setPrimaryContact,
      savePrimaryQuickContact,
      startEmergency, 
      startSilentPanicEmergency,
      stopEmergency, 
      updateLocation,
      refreshPoliceAlerts,
      isSilentPanic,
      silentAudioSnippets,
      vibrationActive,
      audioLevel,
      toggleVibration
    }}>
      {children}
    </EmergencyContext.Provider>
  );
}

export function useEmergency() {
  const context = useContext(EmergencyContext);
  if (context === undefined) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  return context;
}
