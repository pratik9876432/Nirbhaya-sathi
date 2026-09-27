import { PoliceAlert, PoliceAlertStatus, EmergencyType, PoliceStation, AudioSnippet } from '../types';
import { findNearestPoliceStation } from './policeDatabase';

const STORAGE_KEY = 'nirbhoya_police_alerts';
const CHANNEL_NAME = 'nirbhoya_police_broadcast_channel';

// Default initial mock/demo alerts for demonstration when first opened
const SEED_ALERTS: PoliceAlert[] = [
  {
    id: 'SOS-WB-712601-0941',
    userId: 'CITIZEN-Hooghly-921',
    userName: 'Riya Mukherjee',
    userPhone: '+91 98301 44521',
    emergencyType: 'Danger',
    timestamp: Date.now() - 1000 * 60 * 12, // 12 mins ago
    location: { lat: 22.8860, lng: 87.7810 },
    addressEstimate: 'Near Arambagh Netaji Bus Stand, Hooghly (PIN: 712601)',
    nearestStationCode: '712601_ARAMBAGH',
    nearestStationName: 'Arambagh Police Station',
    nearestStationContact: '03211-255223',
    nearestStationPin: '712601',
    district: 'Hooghly',
    status: 'EN_ROUTE',
    dispatchedUnit: 'PCR Van 01 (Arambagh Sadar)',
    assignedOfficer: 'SI R. Ghosh (Hooghly Police)',
    etaMinutes: 2,
    policeReplyMessage: 'PCR Van 01 is 500m away. SI R. Ghosh is arriving with flashing beacons. Stay in safe shop area.',
    batteryLevel: 78,
    timeline: [
      {
        timestamp: Date.now() - 1000 * 60 * 12,
        title: 'Emergency SOS Triggered',
        description: 'Instant GPS distress dispatch received by Arambagh PS Control Room.'
      },
      {
        timestamp: Date.now() - 1000 * 60 * 9,
        title: 'PCR Van 01 Dispatched',
        description: 'Unit dispatched with emergency sirens and flashing beacons.',
        officer: 'Duty Officer Arambagh PS'
      }
    ]
  },
  {
    id: 'SOS-WB-712413-0820',
    userId: 'CITIZEN-Hooghly-314',
    userName: 'Soma Mondal',
    userPhone: '+91 94332 88910',
    emergencyType: 'Harassment',
    timestamp: Date.now() - 1000 * 60 * 35, // 35 mins ago
    location: { lat: 22.7120, lng: 87.8680 },
    addressEstimate: 'Khanakul Market Road, Khanakul Block (PIN: 712413)',
    nearestStationCode: '712413_KHANAKUL',
    nearestStationName: 'Khanakul Police Station',
    nearestStationContact: '03211-266224',
    nearestStationPin: '712413',
    district: 'Hooghly',
    status: 'RESOLVED',
    dispatchedUnit: 'Khanakul Shakti Quick Response Mobile',
    assignedOfficer: 'ASI M. Banerjee',
    policeNotes: 'Patrol arrived within 6 mins. Complainant escorted safely to residence. Threat neutralized.',
    policeReplyMessage: 'All clear. Officer verified safety on spot.',
    batteryLevel: 91,
    timeline: [
      {
        timestamp: Date.now() - 1000 * 60 * 35,
        title: 'SOS Alert Logged',
        description: 'Distress ping received at Khanakul Police Station controller.'
      },
      {
        timestamp: Date.now() - 1000 * 60 * 29,
        title: 'Shakti Mobile Arrived on Scene',
        description: 'Unit reached Khanakul Market Road.',
        officer: 'ASI M. Banerjee'
      },
      {
        timestamp: Date.now() - 1000 * 60 * 15,
        title: 'Case Resolved & Safely Escorted',
        description: 'Citizen safe and secure.',
        officer: 'Khanakul Duty Desk'
      }
    ]
  }
];

export function getStoredAlerts(): PoliceAlert[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ALERTS));
      return SEED_ALERTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_ALERTS;
  } catch (e) {
    console.error('Failed to load police alerts from localStorage', e);
    return SEED_ALERTS;
  }
}

export function saveAlerts(alerts: PoliceAlert[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
    broadcastUpdate();
  } catch (e) {
    console.error('Failed to save police alerts', e);
  }
}

function broadcastUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('nirbhoya_alerts_updated'));
    try {
      if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel(CHANNEL_NAME);
        channel.postMessage({ type: 'ALERTS_UPDATED', timestamp: Date.now() });
        channel.close();
      }
    } catch (e) {}
  }
}

export function createPoliceEmergencyAlert(
  lat: number,
  lng: number,
  emergencyType: EmergencyType = 'Danger',
  userMeta?: {
    name?: string;
    phone?: string;
    id?: string;
    email?: string;
    bloodGroup?: string;
    guardianName?: string;
    guardianPhone?: string;
    address?: string;
    city?: string;
    customMessage?: string;
    isSilentPanic?: boolean;
  }
): PoliceAlert {
  const nearestPS: PoliceStation = findNearestPoliceStation(lat, lng);
  const alertId = `SOS-WB-${nearestPS.pinCode ? nearestPS.pinCode.split(',')[0].trim() : '712001'}-${Math.floor(1000 + Math.random() * 9000)}`;

  let address = `Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)} (Near ${nearestPS.name}, District ${nearestPS.district})`;
  if (nearestPS.pinCode) {
    address += ` - PIN: ${nearestPS.pinCode}`;
  }

  const defaultMsg = userMeta?.isSilentPanic
    ? `🚨 SILENT PANIC ALARM (COVERT SOS): Citizen triggered 3s Silent Panic. Live ambient audio stream recording & GPS transmitting continuously! Haptic tactile pulse active.`
    : `🚨 EMERGENCY DISTRESS ALERT: Women/Girl in immediate danger! Location: ${lat.toFixed(5)}, ${lng.toFixed(5)} near ${nearestPS.name}. Please dispatch immediate PCR mobile unit.`;

  const newAlert: PoliceAlert = {
    id: alertId,
    userId: userMeta?.id || `USER-${Math.floor(10000 + Math.random() * 90000)}`,
    userName: userMeta?.name || 'Women in Distress (বিপদে সাহায্য প্রার্থী)',
    userPhone: userMeta?.phone || '+91 98321 00000',
    userEmail: userMeta?.email,
    userBloodGroup: userMeta?.bloodGroup,
    userGuardianName: userMeta?.guardianName,
    userGuardianPhone: userMeta?.guardianPhone,
    userAddress: userMeta?.address,
    userCity: userMeta?.city,
    emergencyType,
    emergencyMessage: userMeta?.customMessage || defaultMsg,
    timestamp: Date.now(),
    location: { lat, lng },
    addressEstimate: address,
    nearestStationCode: nearestPS.code,
    nearestStationName: nearestPS.name,
    nearestStationContact: nearestPS.contact,
    nearestStationPin: nearestPS.pinCode,
    district: nearestPS.district,
    status: 'PENDING',
    batteryLevel: Math.floor(65 + Math.random() * 30),
    isSilentPanic: userMeta?.isSilentPanic ?? false,
    audioSnippets: [],
    timeline: [
      {
        timestamp: Date.now(),
        title: userMeta?.isSilentPanic ? 'Silent Panic Mode Triggered (3s Hold)' : 'High-Priority SOS Alert Dispatched',
        description: userMeta?.isSilentPanic 
          ? `Discreet 3-second hold Silent Panic initiated. Automatic ambient audio snippets auto-streaming to ${nearestPS.name} Control Room.`
          : `Instant emergency alert transmitted directly to ${nearestPS.name} Control Room with live GPS coordinates and registered profile.`
      }
    ]
  };

  const current = getStoredAlerts();
  // Filter out any previous active alerts from same user session to avoid clutter
  const updated = [newAlert, ...current.filter(a => a.id !== newAlert.id)];
  saveAlerts(updated);

  // Play audio chime if possible
  playPoliceRadioChime();

  return newAlert;
}

export function updateAlertStatus(
  alertId: string, 
  status: PoliceAlertStatus, 
  details?: {
    dispatchedUnit?: string;
    assignedOfficer?: string;
    etaMinutes?: number;
    policeNotes?: string;
    policeReplyMessage?: string;
  }
): PoliceAlert | null {
  const current = getStoredAlerts();
  const index = current.findIndex(a => a.id === alertId);
  if (index === -1) return null;

  const target = current[index];
  const newTimeline = [...target.timeline];

  let title = `Status Updated to ${status}`;
  let desc = `Police Station updated dispatch state to ${status}.`;

  if (status === 'DISPATCHED' || status === 'EN_ROUTE') {
    title = `PCR Unit Dispatched: ${details?.dispatchedUnit || 'Emergency Patrol Van'}`;
    desc = `Officer ${details?.assignedOfficer || 'Assigned Duty Team'} en route. ETA: ${details?.etaMinutes || 3} mins.`;
  } else if (status === 'ON_SCENE') {
    title = 'Police Unit On Scene';
    desc = `Patrol vehicle reached user coordinates (${target.location.lat.toFixed(4)}, ${target.location.lng.toFixed(4)}). Intervening now.`;
  } else if (status === 'RESOLVED') {
    title = 'Emergency Case Resolved';
    desc = details?.policeNotes || 'Citizen verified safe. Police intervention successful and logged.';
  } else if (status === 'CANCELLED') {
    title = 'SOS Closed / User Safe';
    desc = 'Distress call closed by citizen or station verified safe test.';
  }

  newTimeline.unshift({
    timestamp: Date.now(),
    title,
    description: desc,
    officer: details?.assignedOfficer || target.assignedOfficer || 'Duty Officer'
  });

  const updatedAlert: PoliceAlert = {
    ...target,
    status,
    dispatchedUnit: details?.dispatchedUnit !== undefined ? details.dispatchedUnit : target.dispatchedUnit,
    assignedOfficer: details?.assignedOfficer !== undefined ? details.assignedOfficer : target.assignedOfficer,
    etaMinutes: details?.etaMinutes !== undefined ? details.etaMinutes : target.etaMinutes,
    policeNotes: details?.policeNotes !== undefined ? details.policeNotes : target.policeNotes,
    policeReplyMessage: details?.policeReplyMessage !== undefined ? details.policeReplyMessage : target.policeReplyMessage,
    timeline: newTimeline
  };

  current[index] = updatedAlert;
  saveAlerts(current);
  return updatedAlert;
}

export function sendPoliceMessageToUser(alertId: string, message: string, officerName = 'Duty Officer'): PoliceAlert | null {
  const current = getStoredAlerts();
  const index = current.findIndex(a => a.id === alertId);
  if (index === -1) return null;

  const target = current[index];
  const newTimeline = [...target.timeline];

  newTimeline.unshift({
    timestamp: Date.now(),
    title: 'Message Transmitted to Citizen',
    description: `"${message}"`,
    officer: officerName
  });

  const updatedAlert: PoliceAlert = {
    ...target,
    policeReplyMessage: message,
    timeline: newTimeline
  };

  current[index] = updatedAlert;
  saveAlerts(current);
  return updatedAlert;
}

/**
 * Appends a newly uploaded audio snippet to the active police alert
 */
export function appendAudioSnippetToAlert(alertId: string, snippet: AudioSnippet): PoliceAlert | null {
  const current = getStoredAlerts();
  const index = current.findIndex(a => a.id === alertId);
  if (index === -1) return null;

  const target = current[index];
  const existingSnippets = target.audioSnippets || [];
  
  // Avoid duplicate snippet IDs
  if (existingSnippets.some(s => s.id === snippet.id)) {
    return target;
  }

  const updatedSnippets = [...existingSnippets, snippet];
  const updatedTimeline = [...target.timeline];

  if (updatedSnippets.length === 1 || updatedSnippets.length % 3 === 0) {
    updatedTimeline.push({
      timestamp: Date.now(),
      title: `Audio Stream Evidence Snippet #${updatedSnippets.length} Uploaded`,
      description: `Ambient audio recording (${snippet.durationSeconds}s) securely received and archived for dispatcher surveillance.`
    });
  }

  const resultAlert: PoliceAlert = {
    ...target,
    audioSnippets: updatedSnippets,
    timeline: updatedTimeline
  };

  current[index] = resultAlert;
  saveAlerts(current);
  return resultAlert;
}

/**
 * Web Audio API synthesizer for generating clean, authentic police dispatch beeps / control room chime
 */
export function playPoliceRadioChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // 2-tone control room radio alert chirp (e.g. 880Hz -> 1760Hz)
    const osc1 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc1.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.1); // D6
    osc1.frequency.setValueAtTime(1760, ctx.currentTime + 0.2); // A6

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);

    osc1.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.45);
  } catch (e) {
    // AudioContext autoplay restrictions or disabled
  }
}
