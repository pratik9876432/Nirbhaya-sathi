export interface Contact {
  id: string;
  name: string;
  phone: string;
  isPrimary?: boolean;
  relationship?: string;
}

export interface PoliceStation {
  code: string;
  name: string;
  district: string;
  pinCode?: string;
  type: 'General' | 'Women' | 'Cyber';
  contact: string;
  location: { lat: number; lng: number };
}

export type EmergencyType = 'Danger' | 'Harassment' | 'Kidnap' | 'Attack' | 'Medical';

export interface AudioSnippet {
  id: string;
  alertId: string;
  timestamp: number;
  durationSeconds: number;
  audioBlobUrl?: string;
  audioBase64?: string;
  uploadStatus: 'RECORDING' | 'UPLOADING' | 'UPLOADED' | 'FAILED';
  sizeBytes?: number;
}

export interface EmergencyState {
  isActive: boolean;
  type: EmergencyType | null;
  startTime: number | null;
  location: { lat: number; lng: number } | null;
  isSilentPanic?: boolean;
  audioSnippets?: AudioSnippet[];
  audioUrl?: string;
  videoUrl?: string;
}

export type LanguageCode = 
  | 'bn' | 'hi' | 'en' | 'ta' | 'te' | 'kn' | 'ml' | 'mr' | 'gu' | 'pa' 
  | 'as' | 'or' | 'ur' | 'sa' | 'kok' | 'mni' | 'brx' | 'ks' | 'doi' 
  | 'mai' | 'ne' | 'sat';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
}

export interface Translation {
  heroTitle: string;
  heroSubtitle: string;
  emergencyBtn: string;
  sosTitle: string;
  aiAssistant: string;
  safeRoute: string;
  community: string;
  reportIncident: string;
  education: string;
  familySafety: string;
  ruralSupport: string;
  citySmart: string;
  [key: string]: string;
}

export interface Incident {
  id: string;
  type: string;
  description: string;
  location: { lat: number; lng: number };
  timestamp: number;
  anonymous: boolean;
  status: 'pending' | 'verified' | 'resolved';
}

export type PoliceAlertStatus = 'PENDING' | 'DISPATCHED' | 'EN_ROUTE' | 'ON_SCENE' | 'RESOLVED' | 'CANCELLED';

export interface PoliceAlertTimelineItem {
  timestamp: number;
  title: string;
  description: string;
  officer?: string;
}

export interface PoliceAlert {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail?: string;
  userBloodGroup?: string;
  userGuardianName?: string;
  userGuardianPhone?: string;
  userAddress?: string;
  userCity?: string;
  emergencyType: EmergencyType;
  emergencyMessage?: string;
  timestamp: number;
  location: { lat: number; lng: number };
  addressEstimate?: string;
  nearestStationCode: string;
  nearestStationName: string;
  nearestStationContact?: string;
  nearestStationPin?: string;
  district?: string;
  status: PoliceAlertStatus;
  dispatchedUnit?: string;
  assignedOfficer?: string;
  officerPhone?: string;
  officerVehiclePlate?: string;
  etaMinutes?: number;
  policeNotes?: string;
  policeReplyMessage?: string;
  batteryLevel?: number;
  isSilentPanic?: boolean;
  audioSnippets?: AudioSnippet[];
  timeline: PoliceAlertTimelineItem[];
}

export interface SafeJourneyTrip {
  id: string;
  destination: string;
  durationMinutes: number;
  startTime: number;
  emergencyContactsToNotify: string[];
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED_SOS';
}

export interface AudioEvidenceItem {
  id: string;
  timestamp: number;
  durationSeconds: number;
  audioBlobUrl?: string;
  locationEstimate?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  bloodGroup?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  createdAt: number;
}

export interface PoliceOfficerUser {
  id: string;
  badgeNumber: string;
  name: string;
  rank: string;
  stationCode: string;
  stationName: string;
  district: string;
  phone: string;
  email: string;
  isVerifiedDutyOfficer: boolean;
  createdAt: number;
}

