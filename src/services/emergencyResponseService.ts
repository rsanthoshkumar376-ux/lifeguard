import { db, auth } from '../config/firebase';
import { 
  collection, doc, setDoc, getDoc, updateDoc, 
  onSnapshot, query, where, orderBy, limit, serverTimestamp 
} from 'firebase/firestore';
import { EmergencyContact, getEmergencyContacts, getMedicalProfile } from './medicalProfile';

export type EmergencyStatus = 
  | 'Created'
  | 'Alert Sent'
  | 'Acknowledged'
  | 'Assistance Accepted'
  | 'Resolved';

export type EmergencyCategory = 
  | 'Vehicle Accident'
  | 'Severe Fall'
  | 'Cardiac Emergency'
  | 'Medical Crisis'
  | 'Physical Threat'
  | 'General SOS';

export interface EmergencyTimelineEntry {
  id: string;
  timestamp: string; // ISO string
  status: EmergencyStatus;
  title: string;
  description: string;
  actor: string; // e.g. "User", "Accident Sensor", "Emergency Contact", "First Responder"
  metadata?: Record<string, any>;
}

export interface EmergencyLocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  speed?: number | null;
  heading?: number | null;
  mapsUrl: string;
  capturedAt: string;
}

export interface EmergencyCase {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  bloodGroup: string;
  category: EmergencyCategory;
  status: EmergencyStatus;
  impactDetected: boolean;
  sensorMagnitude?: number;
  location?: EmergencyLocationData;
  liveTrackingActive: boolean;
  timeline: EmergencyTimelineEntry[];
  contactsNotified: Array<{ name: string; phone: string; status: 'pending' | 'sent' | 'acknowledged' }>;
  emergencyNotes?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

const LOCAL_ACTIVE_CASE_KEY = 'lifeguard_active_emergency_case';
const LOCAL_CASE_HISTORY_KEY = 'lifeguard_emergency_history';

/**
 * Creates a new Emergency Case in Firestore with local-storage fallback
 */
export const createEmergencyCase = async (params: {
  userId?: string;
  userName?: string;
  userPhone?: string;
  bloodGroup?: string;
  category?: EmergencyCategory;
  impactDetected?: boolean;
  sensorMagnitude?: number;
  location?: EmergencyLocationData;
  emergencyNotes?: string;
}): Promise<EmergencyCase> => {
  const caseId = 'case_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();

  // Try to load user contacts and profile for pre-filling
  let contacts: EmergencyContact[] = [];
  try {
    contacts = await getEmergencyContacts(params.userId);
  } catch (e) {
    console.warn('Could not load contacts for emergency case pre-fill', e);
  }

  let profile: any = null;
  try {
    profile = await getMedicalProfile(params.userId);
  } catch (e) {
    console.warn('Could not load profile for emergency case pre-fill', e);
  }

  const initialTimeline: EmergencyTimelineEntry[] = [
    {
      id: 'tl_' + Date.now(),
      timestamp: now,
      status: 'Created',
      title: params.impactDetected ? 'Accident Detected by Sensor' : 'Emergency SOS Initiated',
      description: params.impactDetected 
        ? `Sudden impact detected (${params.sensorMagnitude?.toFixed(1) || '30+'} m/s²). 30s countdown expired.`
        : `User manually triggered ${params.category || 'General SOS'} alert.`,
      actor: params.impactDetected ? 'Accident Detection Sensor' : 'User'
    }
  ];

  if (params.location) {
    initialTimeline.push({
      id: 'tl_' + (Date.now() + 1),
      timestamp: now,
      status: 'Alert Sent',
      title: 'GPS Coordinates Captured',
      description: `Location locked: Lat ${params.location.latitude.toFixed(5)}, Lng ${params.location.longitude.toFixed(5)} (±${Math.round(params.location.accuracy || 0)}m).`,
      actor: 'Device GPS'
    });
  }

  const newCase: EmergencyCase = {
    id: caseId,
    userId: params.userId || auth?.currentUser?.uid || 'guest-user',
    userName: params.userName || profile?.name || 'Emergency Patient',
    userPhone: params.userPhone || '+91 98765 43210',
    bloodGroup: params.bloodGroup || profile?.bloodGroup || 'O+',
    category: params.category || 'General SOS',
    status: params.location ? 'Alert Sent' : 'Created',
    impactDetected: !!params.impactDetected,
    sensorMagnitude: params.sensorMagnitude,
    location: params.location,
    liveTrackingActive: true,
    timeline: initialTimeline,
    contactsNotified: contacts.map(c => ({
      name: c.name,
      phone: c.phone,
      status: 'sent'
    })),
    emergencyNotes: params.emergencyNotes || profile?.emergencyInstructions || '',
    createdAt: now,
    updatedAt: now
  };

  // 1. Save locally immediately for offline guarantee
  saveCaseLocally(newCase);

  // 2. Sync to Firestore if online & available
  try {
    if (db) {
      const docRef = doc(db, 'emergencyEvents', caseId);
      await setDoc(docRef, {
        ...newCase,
        serverTimestamp: serverTimestamp()
      });
    }
  } catch (err) {
    console.warn('Firestore emergencyEvents write skipped (saved locally):', err);
  }

  return newCase;
};

/**
 * Updates status of an existing emergency case with timeline entry
 */
export const updateEmergencyCaseStatus = async (
  caseId: string, 
  status: EmergencyStatus, 
  title: string, 
  description: string, 
  actor = 'User'
): Promise<EmergencyCase | null> => {
  const currentCase = getActiveLocalCase();
  if (!currentCase || currentCase.id !== caseId) return null;

  const now = new Date().toISOString();
  const timelineEntry: EmergencyTimelineEntry = {
    id: 'tl_' + Date.now(),
    timestamp: now,
    status,
    title,
    description,
    actor
  };

  const updatedCase: EmergencyCase = {
    ...currentCase,
    status,
    updatedAt: now,
    resolvedAt: status === 'Resolved' ? now : currentCase.resolvedAt,
    liveTrackingActive: status === 'Resolved' ? false : currentCase.liveTrackingActive,
    timeline: [...currentCase.timeline, timelineEntry]
  };

  saveCaseLocally(updatedCase);

  if (status === 'Resolved') {
    archiveLocalCase(updatedCase);
  }

  try {
    if (db) {
      const docRef = doc(db, 'emergencyEvents', caseId);
      await updateDoc(docRef, {
        status,
        updatedAt: now,
        resolvedAt: status === 'Resolved' ? now : null,
        liveTrackingActive: status === 'Resolved' ? false : currentCase.liveTrackingActive,
        timeline: updatedCase.timeline
      });
    }
  } catch (err) {
    console.warn('Firestore emergency status update error (local updated):', err);
  }

  return updatedCase;
};

/**
 * Updates location of an emergency case during live GPS sharing
 */
export const updateEmergencyLocation = async (
  caseId: string,
  location: EmergencyLocationData
): Promise<EmergencyCase | null> => {
  const currentCase = getActiveLocalCase();
  if (!currentCase || currentCase.id !== caseId) return null;

  const now = new Date().toISOString();
  const timelineEntry: EmergencyTimelineEntry = {
    id: 'tl_loc_' + Date.now(),
    timestamp: now,
    status: currentCase.status,
    title: 'Live Location Updated',
    description: `Accurate to ±${Math.round(location.accuracy || 0)}m at ${new Date(location.capturedAt).toLocaleTimeString()}`,
    actor: 'GPS Tracker'
  };

  const updatedCase: EmergencyCase = {
    ...currentCase,
    location,
    updatedAt: now,
    timeline: [...currentCase.timeline, timelineEntry]
  };

  saveCaseLocally(updatedCase);

  try {
    if (db) {
      const docRef = doc(db, 'emergencyEvents', caseId);
      await updateDoc(docRef, {
        location,
        updatedAt: now,
        timeline: updatedCase.timeline
      });
    }
  } catch (err) {
    console.warn('Firestore location update failed (local updated):', err);
  }

  return updatedCase;
};

/**
 * Toggles temporary live location tracking on/off
 */
export const setLiveTrackingState = async (caseId: string, active: boolean): Promise<boolean> => {
  const currentCase = getActiveLocalCase();
  if (!currentCase || currentCase.id !== caseId) return false;

  currentCase.liveTrackingActive = active;
  currentCase.updatedAt = new Date().toISOString();
  saveCaseLocally(currentCase);

  try {
    if (db) {
      const docRef = doc(db, 'emergencyEvents', caseId);
      await updateDoc(docRef, {
        liveTrackingActive: active,
        updatedAt: currentCase.updatedAt
      });
    }
  } catch (e) {
    console.warn('Failed to update liveTrackingActive in Firestore', e);
  }

  return true;
};

/**
 * Generates pre-filled SMS emergency text
 */
export const generateEmergencySmsText = (emergencyCase: EmergencyCase): string => {
  const name = emergencyCase.userName || 'Emergency Patient';
  const blood = emergencyCase.bloodGroup || 'O+';
  const category = emergencyCase.category || 'SOS Emergency';
  const mapsLink = emergencyCase.location?.mapsUrl || 'Location pending';
  const accuracy = emergencyCase.location?.accuracy ? `(±${Math.round(emergencyCase.location.accuracy)}m)` : '';
  const webIdLink = typeof window !== 'undefined' ? `${window.location.origin}/emergency/id` : 'https://lifeguard-azure.vercel.app';

  return `🚨 EMERGENCY SOS ALERT!
${name} requires URGENT medical help!
Category: ${category}
Blood Group: ${blood}
Current Location: ${mapsLink} ${accuracy}
Medical ID & Profile: ${webIdLink}
Time: ${new Date(emergencyCase.createdAt).toLocaleTimeString()}
Please call 108 or check on them immediately!`;
};

/**
 * Formats native Android/iOS SMS Intent URI
 */
export const getSmsIntentUri = (phoneNumbers: string[], smsBody: string): string => {
  const recipient = phoneNumbers.filter(Boolean).join(',');
  const encoded = encodeURIComponent(smsBody);
  
  // Cross-platform mobile SMS intent:
  // Android supports sms:phone?body=message
  // iOS supports sms:phone&body=message
  const isIos = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isIos) {
    return `sms:${recipient}&body=${encoded}`;
  }
  return `sms:${recipient}?body=${encoded}`;
};

/**
 * Local Storage Persistence Helpers
 */
export const getActiveLocalCase = (): EmergencyCase | null => {
  try {
    const raw = localStorage.getItem(LOCAL_ACTIVE_CASE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveCaseLocally = (emergencyCase: EmergencyCase) => {
  try {
    localStorage.setItem(LOCAL_ACTIVE_CASE_KEY, JSON.stringify(emergencyCase));
  } catch (e) {
    console.error('Failed to save active emergency case locally', e);
  }
};

const archiveLocalCase = (emergencyCase: EmergencyCase) => {
  try {
    localStorage.removeItem(LOCAL_ACTIVE_CASE_KEY);
    const rawHistory = localStorage.getItem(LOCAL_CASE_HISTORY_KEY);
    const history: EmergencyCase[] = rawHistory ? JSON.parse(rawHistory) : [];
    // Keep last 10 cases
    const updated = [emergencyCase, ...history.filter(h => h.id !== emergencyCase.id)].slice(0, 10);
    localStorage.setItem(LOCAL_CASE_HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to archive emergency case', e);
  }
};

export const getLocalCaseHistory = (): EmergencyCase[] => {
  try {
    const rawHistory = localStorage.getItem(LOCAL_CASE_HISTORY_KEY);
    return rawHistory ? JSON.parse(rawHistory) : [];
  } catch {
    return [];
  }
};
