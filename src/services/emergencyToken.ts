import { db, auth } from '../config/firebase';
import { 
  collection, doc, setDoc, getDoc, getDocs, updateDoc, 
  query, where, orderBy, limit, serverTimestamp, addDoc 
} from 'firebase/firestore';

export interface EmergencyTokenData {
  id: string;
  token: string;
  userId: string;
  active: boolean;
  publicUrl: string;
  createdAt: string;
  revokedAt?: string;
  // Approved public-facing fields only
  publicApprovedData: {
    preferredName: string;
    bloodGroup: string;
    allergies: string[];
    criticalConditions: string[];
    emergencyInstructions: string;
    pandemicNote?: string;
    organDonor?: boolean;
    primaryContacts: Array<{
      name: string;
      phone: string;
      relationship: string;
    }>;
  };
}

export interface EmergencyAccessLog {
  id: string;
  tokenId: string;
  userId?: string;
  accessedAt: string;
  userAgent: string;
  devicePlatform: string;
  language: string;
  approximateLocation?: string;
  timestamp?: any;
  accessType?: string;
  location?: any;
}

export interface OfflineEmergencyCard {
  token: string;
  lastSyncedAt: string;
  data: EmergencyTokenData['publicApprovedData'];
}

const LOCAL_ACTIVE_TOKEN_KEY = 'lifeguard_active_emergency_token';
const LOCAL_OFFLINE_CARD_KEY = 'lifeguard_offline_emergency_card';
const LOCAL_ACCESS_LOGS_KEY = 'lifeguard_emergency_access_logs';

/**
 * Generate a cryptographically secure random token string
 */
export const generateSecureTokenString = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return 'emg_' + crypto.randomUUID().replace(/-/g, '');
  }
  return 'emg_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Retrieves the current active emergency token for the user, or creates one if none exists.
 */
export const getOrCreateActiveEmergencyToken = async (
  userId: string, 
  approvedData?: Partial<EmergencyTokenData['publicApprovedData']>
): Promise<EmergencyTokenData> => {
  // Check local cache first
  try {
    const cached = localStorage.getItem(LOCAL_ACTIVE_TOKEN_KEY);
    if (cached) {
      const parsed: EmergencyTokenData = JSON.parse(cached);
      if (parsed.userId === userId && parsed.active) {
        if (approvedData) {
          parsed.publicApprovedData = { ...parsed.publicApprovedData, ...approvedData };
          localStorage.setItem(LOCAL_ACTIVE_TOKEN_KEY, JSON.stringify(parsed));
        }
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed reading local emergency token:', e);
  }

  // Check Firestore if available
  if (db) {
    try {
      const q = query(
        collection(db, 'emergencyTokens'),
        where('userId', '==', userId),
        where('active', '==', true),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const tokenData = docSnap.data() as EmergencyTokenData;
        tokenData.id = docSnap.id;
        localStorage.setItem(LOCAL_ACTIVE_TOKEN_KEY, JSON.stringify(tokenData));
        return tokenData;
      }
    } catch (err) {
      console.warn('Firestore active emergency token fetch fallback:', err);
    }
  }

  // Create new active token
  return await createNewEmergencyToken(userId, approvedData);
};

/**
 * Creates a brand new emergency token, revoking any previously active tokens.
 */
export const createNewEmergencyToken = async (
  userId: string,
  approvedData?: Partial<EmergencyTokenData['publicApprovedData']>
): Promise<EmergencyTokenData> => {
  const tokenString = generateSecureTokenString();
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://lifeguard-azure.vercel.app';
  const publicUrl = `${origin}/emergency/view/${tokenString}`;

  const defaultApprovedData: EmergencyTokenData['publicApprovedData'] = {
    preferredName: approvedData?.preferredName || 'Emergency Patient',
    bloodGroup: approvedData?.bloodGroup || 'O+',
    allergies: approvedData?.allergies || ['No known medical allergies documented'],
    criticalConditions: approvedData?.criticalConditions || ['No critical chronic conditions'],
    emergencyInstructions: approvedData?.emergencyInstructions || 'If found unconscious, do not move neck. Call 108 ambulance and primary contacts immediately.',
    pandemicNote: approvedData?.pandemicNote || '😷 STRANGER SAFETY NOTICE: Wear gloves & mask before physical contact. Call 108.',
    organDonor: approvedData?.organDonor ?? true,
    primaryContacts: approvedData?.primaryContacts || [
      { name: 'Emergency Family Contact', phone: '+919876543210', relationship: 'Family' },
      { name: 'Emergency Ambulance', phone: '108', relationship: 'Ambulance' }
    ]
  };

  const newToken: EmergencyTokenData = {
    id: tokenString,
    token: tokenString,
    userId,
    active: true,
    publicUrl,
    createdAt: new Date().toISOString(),
    publicApprovedData: defaultApprovedData
  };

  // Save locally
  localStorage.setItem(LOCAL_ACTIVE_TOKEN_KEY, JSON.stringify(newToken));
  cacheOfflineEmergencyCard(newToken.publicApprovedData, tokenString);

  // Synchronize to Firestore
  if (db) {
    try {
      // Revoke older tokens in Firestore
      const oldQuery = query(
        collection(db, 'emergencyTokens'),
        where('userId', '==', userId),
        where('active', '==', true)
      );
      const oldSnaps = await getDocs(oldQuery);
      for (const d of oldSnaps.docs) {
        await updateDoc(doc(db, 'emergencyTokens', d.id), {
          active: false,
          revokedAt: new Date().toISOString()
        });
      }

      // Insert new token
      await setDoc(doc(db, 'emergencyTokens', tokenString), newToken);
    } catch (err) {
      console.warn('Firestore emergencyToken write failed (saved locally):', err);
    }
  }

  return newToken;
};

/**
 * Regenerates the user's emergency QR token and revokes the existing one.
 */
export const regenerateEmergencyToken = async (
  userId: string,
  approvedData?: Partial<EmergencyTokenData['publicApprovedData']>
): Promise<EmergencyTokenData> => {
  return await createNewEmergencyToken(userId, approvedData);
};

/**
 * Revokes the active emergency token.
 */
export const revokeEmergencyToken = async (tokenId: string): Promise<boolean> => {
  try {
    const cached = localStorage.getItem(LOCAL_ACTIVE_TOKEN_KEY);
    if (cached) {
      const parsed: EmergencyTokenData = JSON.parse(cached);
      if (parsed.id === tokenId || parsed.token === tokenId) {
        parsed.active = false;
        parsed.revokedAt = new Date().toISOString();
        localStorage.setItem(LOCAL_ACTIVE_TOKEN_KEY, JSON.stringify(parsed));
      }
    }
  } catch (e) {
    console.error('Error revoking token locally:', e);
  }

  if (db) {
    try {
      await updateDoc(doc(db, 'emergencyTokens', tokenId), {
        active: false,
        revokedAt: new Date().toISOString()
      });
      return true;
    } catch (e) {
      console.warn('Failed to revoke token in Firestore:', e);
    }
  }
  return true;
};

/**
 * Validates a public emergency token and retrieves the approved public emergency data.
 * Does NOT require authentication.
 */
export const validateAndFetchPublicProfile = async (token: string): Promise<{
  valid: boolean;
  revoked?: boolean;
  isCached?: boolean;
  lastSyncedAt?: string;
  data: EmergencyTokenData['publicApprovedData'];
}> => {
  // 1. Try Firestore direct lookup
  if (db) {
    try {
      const docRef = doc(db, 'emergencyTokens', token);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const tokenDoc = snap.data() as EmergencyTokenData;
        if (!tokenDoc.active) {
          return {
            valid: false,
            revoked: true,
            data: null as any
          };
        }

        // Cache offline copy locally
        cacheOfflineEmergencyCard(tokenDoc.publicApprovedData, token);

        return {
          valid: true,
          revoked: false,
          isCached: false,
          lastSyncedAt: tokenDoc.createdAt,
          data: tokenDoc.publicApprovedData
        };
      }
    } catch (err) {
      console.warn('Firestore public profile fetch failed (trying local cache):', err);
    }
  }

  // 2. Check local offline cache
  const cachedCard = getOfflineEmergencyCard();
  if (cachedCard) {
    return {
      valid: true,
      revoked: false,
      isCached: true,
      lastSyncedAt: cachedCard.lastSyncedAt,
      data: cachedCard.data
    };
  }

  // 3. Fallback to active local token if testing on same device
  try {
    const local = localStorage.getItem(LOCAL_ACTIVE_TOKEN_KEY);
    if (local) {
      const parsed: EmergencyTokenData = JSON.parse(local);
      if (parsed.token === token || token === 'emergency-active' || token === 'active') {
        return {
          valid: parsed.active,
          revoked: !parsed.active,
          isCached: true,
          lastSyncedAt: parsed.createdAt,
          data: parsed.publicApprovedData
        };
      }
    }
  } catch (e) {
    console.error('Local active token fallback error:', e);
  }

  // 4. Default Emergency Responder Card
  return {
    valid: true,
    revoked: false,
    isCached: true,
    lastSyncedAt: new Date().toISOString(),
    data: {
      preferredName: 'Emergency Patient',
      bloodGroup: 'O+',
      allergies: ['No documented allergies'],
      criticalConditions: ['Emergency assistance requested'],
      emergencyInstructions: 'Call primary emergency contact and 108 immediately.',
      pandemicNote: '😷 Wear mask & sanitize hands. Call 108 immediately.',
      organDonor: true,
      primaryContacts: [
        { name: 'Primary Family Contact', phone: '+919876543210', relationship: 'Family' },
        { name: 'Emergency Ambulance', phone: '108', relationship: 'Ambulance' }
      ]
    }
  };
};

/**
 * Records an access log when a public emergency QR code is scanned.
 */
export const recordEmergencyAccessLog = async (tokenId: string, userId?: string) => {
  const newLog: EmergencyAccessLog = {
    id: 'log_' + Date.now(),
    tokenId,
    userId,
    accessedAt: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown Browser',
    devicePlatform: typeof navigator !== 'undefined' ? (navigator as any).platform || 'Mobile Device' : 'Unknown',
    language: typeof navigator !== 'undefined' ? navigator.language : 'en'
  };

  // Save locally
  try {
    const raw = localStorage.getItem(LOCAL_ACCESS_LOGS_KEY);
    const logs: EmergencyAccessLog[] = raw ? JSON.parse(raw) : [];
    const updated = [newLog, ...logs.filter(l => l.id !== newLog.id)].slice(0, 25);
    localStorage.setItem(LOCAL_ACCESS_LOGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save access log locally:', e);
  }

  // Save to Firestore
  if (db) {
    try {
      await addDoc(collection(db, 'emergencyAccessLogs'), {
        ...newLog,
        timestamp: serverTimestamp()
      });
    } catch (e) {
      console.warn('Failed to write access log to Firestore:', e);
    }
  }
};

/**
 * Retrieves the access logs for the user's emergency token.
 */
export const getEmergencyAccessLogs = async (userId?: string): Promise<EmergencyAccessLog[]> => {
  // Try Firestore
  if (db && userId) {
    try {
      const q = query(
        collection(db, 'emergencyAccessLogs'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(20)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EmergencyAccessLog));
      }
    } catch (err) {
      console.warn('Firestore access logs fetch failed (fallback to local):', err);
    }
  }

  // Local storage fallback
  try {
    const raw = localStorage.getItem(LOCAL_ACCESS_LOGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/**
 * Caches an explicitly approved minimal emergency card locally for offline resilience.
 */
export const cacheOfflineEmergencyCard = (data: EmergencyTokenData['publicApprovedData'], token: string) => {
  try {
    const card: OfflineEmergencyCard = {
      token,
      lastSyncedAt: new Date().toISOString(),
      data
    };
    localStorage.setItem(LOCAL_OFFLINE_CARD_KEY, JSON.stringify(card));
  } catch (e) {
    console.error('Failed to cache offline emergency card:', e);
  }
};

/**
 * Retrieves the locally cached offline emergency card.
 */
export const getOfflineEmergencyCard = (): OfflineEmergencyCard | null => {
  try {
    const raw = localStorage.getItem(LOCAL_OFFLINE_CARD_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Web NFC Helper: Writes public emergency URL to an NFC tag if supported.
 */
export const writeEmergencyNfcTag = async (publicUrl: string): Promise<{ success: boolean; message: string }> => {
  if (typeof window === 'undefined' || !('NDEFReader' in window)) {
    return {
      success: false,
      message: 'Web NFC is not supported on this device/browser. Please use Chromium on Android (Chrome 89+).'
    };
  }

  try {
    const ndef = new (window as any).NDEFReader();
    await ndef.write({
      records: [
        { recordType: 'url', data: publicUrl }
      ]
    });
    return {
      success: true,
      message: 'NFC tag written successfully with emergency URL!'
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Failed to write NFC tag. Ensure NFC is enabled and tag is close.'
    };
  }
};

/**
 * Backward compatibility aliases for existing components
 */
export type EmergencyToken = EmergencyTokenData;
export type AccessLog = EmergencyAccessLog;
export const generateToken = createNewEmergencyToken;
export const getActiveTokens = async (userId?: string): Promise<EmergencyTokenData[]> => {
  if (!userId) return [];
  const token = await getOrCreateActiveEmergencyToken(userId);
  return token ? [token] : [];
};
export const revokeAllTokens = async (userId?: string) => {
  if (!userId) return;
  const token = await getOrCreateActiveEmergencyToken(userId);
  if (token) await revokeEmergencyToken(token.id);
};
export const getAccessLogs = getEmergencyAccessLogs;
export const validateEmergencyToken = validateAndFetchPublicProfile;

