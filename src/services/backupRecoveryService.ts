/**
 * LifeGuard Secure Backup, Disaster Recovery & Account Restoration Engine
 * Exports comprehensive personal health archives encrypted with AES-GCM 256-bit,
 * verifies SHA-256 checksums, and restores clinical records with schema validation.
 */

import { encryptData, decryptData, computeChecksum } from './cryptoService';
import { safeLogger } from '../utils/safeLogger';

export interface BackupArchiveHeader {
  version: '1.0';
  app: 'LifeGuard';
  exportTimestamp: string;
  userId: string;
  checksumSha256: string;
  dataCategories: string[];
}

export interface EncryptedBackupPackage {
  header: BackupArchiveHeader;
  encryptedPayload: string;
}

export interface RestorationReport {
  success: boolean;
  restoredAt: string;
  categoriesRestored: string[];
  recordsCount: number;
  warnings?: string[];
}

/**
 * Creates an encrypted backup file package of the user's entire LifeGuard profile and data
 */
export async function createEncryptedBackup(userId: string, passphrase: string): Promise<string> {
  if (!passphrase || passphrase.length < 8) {
    throw new Error('Backup passphrase must be at least 8 characters long.');
  }

  // 1. Gather all local datasets
  const backupData: Record<string, any> = {
    userId,
    userProfile: localStorage.getItem('lifeguard_current_user'),
    medicalProfile: localStorage.getItem('lifeguard_medical_profile'),
    healthRecords: localStorage.getItem('LG_HEALTH_RECORDS_v1:' + userId),
    vitalsHistory: localStorage.getItem('LG_VITALS_v1:' + userId),
    medications: localStorage.getItem('LG_MEDS_v1:' + userId),
    appointments: localStorage.getItem('LG_APPOINTMENTS_v1:' + userId),
    familyCircle: localStorage.getItem('LG_FAM_v1:circle_kumar_01') || localStorage.getItem('lifeguard_family_circle'),
    offlineEmergencyCard: localStorage.getItem('lifeguard_offline_emergency_card'),
    activeEmergencyToken: localStorage.getItem('lifeguard_active_emergency_token'),
    consentHistory: localStorage.getItem('lifeguard_dpdp_consents_v1')
  };

  const categories = Object.keys(backupData).filter(k => backupData[k] !== null);
  const jsonPlaintext = JSON.stringify(backupData);

  // 2. Compute Checksum of plaintext before encryption
  const checksumSha256 = await computeChecksum(jsonPlaintext);

  // 3. Encrypt with User Passphrase (AES-GCM 256-bit)
  const encryptedPayload = await encryptData(jsonPlaintext, passphrase);

  const archivePackage: EncryptedBackupPackage = {
    header: {
      version: '1.0',
      app: 'LifeGuard',
      exportTimestamp: new Date().toISOString(),
      userId,
      checksumSha256,
      dataCategories: categories
    },
    encryptedPayload
  };

  return JSON.stringify(archivePackage, null, 2);
}

/**
 * Downloads the encrypted backup package as a timestamped file
 */
export function downloadBackupFile(backupJsonString: string, userId: string) {
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `lifeguard-backup-${userId.slice(0, 8)}-${dateStr}.enc.json`;
  const blob = new Blob([backupJsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Restores and verifies an encrypted backup package
 */
export async function restoreEncryptedBackup(
  backupJsonString: string,
  passphrase: string
): Promise<RestorationReport> {
  let pkg: EncryptedBackupPackage;
  try {
    pkg = JSON.parse(backupJsonString);
  } catch {
    throw new Error('Invalid file format: Backup file must be a valid JSON package.');
  }

  if (pkg.header?.app !== 'LifeGuard') {
    throw new Error('Incompatible archive: File is not a LifeGuard encrypted backup.');
  }

  // 1. Decrypt with User Passphrase
  let decryptedJson: string;
  try {
    decryptedJson = await decryptData(pkg.encryptedPayload, passphrase);
  } catch {
    throw new Error('Decryption failed: Incorrect passphrase or corrupted backup file.');
  }

  // 2. Verify Checksum Integrity
  const calculatedChecksum = await computeChecksum(decryptedJson);
  if (calculatedChecksum !== pkg.header.checksumSha256) {
    throw new Error('Integrity check failed: Checksum does not match. The file may have been modified.');
  }

  // 3. Parse and Restore Data
  const data = JSON.parse(decryptedJson);
  const restoredCategories: string[] = [];
  let recordsCount = 0;

  for (const [key, value] of Object.entries(data)) {
    if (key === 'userId' || value === null) continue;

    if (key === 'userProfile' && typeof value === 'string') {
      localStorage.setItem('lifeguard_current_user', value);
      restoredCategories.push('User Profile');
      recordsCount++;
    } else if (key === 'medicalProfile' && typeof value === 'string') {
      localStorage.setItem('lifeguard_medical_profile', value);
      restoredCategories.push('Medical Profile');
      recordsCount++;
    } else if (key === 'healthRecords' && typeof value === 'string') {
      localStorage.setItem('LG_HEALTH_RECORDS_v1:' + (data.userId || 'restored'), value);
      restoredCategories.push('Health Records & Reports');
      recordsCount++;
    } else if (key === 'vitalsHistory' && typeof value === 'string') {
      localStorage.setItem('LG_VITALS_v1:' + (data.userId || 'restored'), value);
      restoredCategories.push('Vital Readings');
      recordsCount++;
    } else if (key === 'medications' && typeof value === 'string') {
      localStorage.setItem('LG_MEDS_v1:' + (data.userId || 'restored'), value);
      restoredCategories.push('Medicine Tracker');
      recordsCount++;
    } else if (key === 'appointments' && typeof value === 'string') {
      localStorage.setItem('LG_APPOINTMENTS_v1:' + (data.userId || 'restored'), value);
      restoredCategories.push('Appointments');
      recordsCount++;
    } else if (key === 'familyCircle' && typeof value === 'string') {
      localStorage.setItem('LG_FAM_v1:circle_kumar_01', value);
      restoredCategories.push('Family Circle');
      recordsCount++;
    } else if (key === 'offlineEmergencyCard' && typeof value === 'string') {
      localStorage.setItem('lifeguard_offline_emergency_card', value);
      restoredCategories.push('Offline Emergency ID Card');
      recordsCount++;
    } else if (key === 'consentHistory' && typeof value === 'string') {
      localStorage.setItem('lifeguard_dpdp_consents_v1', value);
      restoredCategories.push('DPDP Consent Records');
      recordsCount++;
    }
  }

  safeLogger.info('Restoration successful. Categories restored:', restoredCategories.length);

  return {
    success: true,
    restoredAt: new Date().toISOString(),
    categoriesRestored: restoredCategories,
    recordsCount
  };
}
