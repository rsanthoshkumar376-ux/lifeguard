/**
 * LifeGuard Security Monitoring, Session & MFA Service
 * Manages active sessions, unusual login heuristic detection,
 * session revocation, optional MFA, and emergency recovery keys.
 */

import { generateSecureToken, generateRecoveryKey, computeChecksum } from './cryptoService';

export interface UserSession {
  sessionId: string;
  userId: string;
  deviceName: string;
  platform: string;
  browser: string;
  ipAddress: string;
  approximateLocation: string;
  createdAt: string;
  lastActiveAt: string;
  isCurrent: boolean;
  status: 'active' | 'revoked' | 'expired';
}

export interface SecurityEvent {
  id: string;
  userId: string;
  type: 
    | 'login_success' 
    | 'login_failed' 
    | 'unusual_device' 
    | 'session_revoked' 
    | 'mfa_enabled' 
    | 'mfa_disabled' 
    | 'qr_revoked' 
    | 'recovery_key_generated' 
    | 'suspicious_activity';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
  ipAddress?: string;
  deviceInfo?: string;
}

export interface SecuritySettingsState {
  mfaEnabled: boolean;
  mfaMethod: 'sms_otp' | 'authenticator_app';
  stepUpAuthRequiredForRecords: boolean;
  recoveryKeyHash?: string;
  recoveryKeyCreatedAt?: string;
  lastSecurityAuditAt: string;
}

const STORAGE_SESSIONS = 'lifeguard_active_sessions_v1';
const STORAGE_SECURITY_EVENTS = 'lifeguard_security_events_v1';
const STORAGE_SECURITY_SETTINGS = 'lifeguard_security_settings_v1';

/**
 * Detects current device metadata
 */
function getDeviceMetadata(): { deviceName: string; platform: string; browser: string } {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
  let platform = 'Unknown OS';
  if (/Android/i.test(ua)) platform = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) platform = 'iOS';
  else if (/Windows/i.test(ua)) platform = 'Windows';
  else if (/Macintosh|Mac OS/i.test(ua)) platform = 'macOS';
  else if (/Linux/i.test(ua)) platform = 'Linux';

  let browser = 'Unknown Browser';
  if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) browser = 'Chrome';
  else if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';

  const deviceName = `${platform} (${browser})`;
  return { deviceName, platform, browser };
}

/**
 * Gets or initializes the current active session
 */
export function getCurrentSession(userId: string): UserSession {
  const sessions = getAllSessions(userId);
  const current = sessions.find(s => s.isCurrent && s.status === 'active');
  if (current) return current;

  const { deviceName, platform, browser } = getDeviceMetadata();
  const newSession: UserSession = {
    sessionId: generateSecureToken('ses_'),
    userId,
    deviceName,
    platform,
    browser,
    ipAddress: '127.0.0.1 (Local Verified)',
    approximateLocation: 'Chennai, TN, India',
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    isCurrent: true,
    status: 'active'
  };

  sessions.unshift(newSession);
  saveSessions(sessions);
  return newSession;
}

/**
 * Retrieves all registered user sessions
 */
export function getAllSessions(userId: string): UserSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_SESSIONS);
    if (raw) {
      const parsed: UserSession[] = JSON.parse(raw);
      return parsed.filter(s => s.userId === userId);
    }
  } catch (err) {
    console.error('Failed reading sessions:', err);
  }

  // Generate seed demo sessions for immediate realism
  const { deviceName, platform, browser } = getDeviceMetadata();
  const initialSessions: UserSession[] = [
    {
      sessionId: 'ses_current_device',
      userId,
      deviceName,
      platform,
      browser,
      ipAddress: '49.207.218.42 (Active)',
      approximateLocation: 'Chennai, India',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      lastActiveAt: new Date().toISOString(),
      isCurrent: true,
      status: 'active'
    },
    {
      sessionId: 'ses_tablet_demo',
      userId,
      deviceName: 'iPad Air (Safari)',
      platform: 'iOS',
      browser: 'Safari',
      ipAddress: '106.51.72.19',
      approximateLocation: 'Bengaluru, India',
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      lastActiveAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      isCurrent: false,
      status: 'active'
    }
  ];

  saveSessions(initialSessions);
  return initialSessions;
}

function saveSessions(sessions: UserSession[]) {
  try {
    localStorage.setItem(STORAGE_SESSIONS, JSON.stringify(sessions));
  } catch (err) {
    console.error('Failed saving sessions:', err);
  }
}

/**
 * Revokes an individual session
 */
export function revokeSession(sessionId: string, userId: string): boolean {
  const sessions = getAllSessions(userId);
  const target = sessions.find(s => s.sessionId === sessionId);
  if (!target) return false;

  target.status = 'revoked';
  saveSessions(sessions);

  logSecurityEvent({
    userId,
    type: 'session_revoked',
    title: `Session Revoked: ${target.deviceName}`,
    description: `Session from ${target.approximateLocation} (${target.ipAddress}) was manually terminated.`,
    severity: 'warning'
  });

  return true;
}

/**
 * Revokes all sessions except the current active session
 */
export function revokeAllOtherSessions(userId: string): number {
  const sessions = getAllSessions(userId);
  let revokedCount = 0;

  sessions.forEach(s => {
    if (!s.isCurrent && s.status === 'active') {
      s.status = 'revoked';
      revokedCount++;
    }
  });

  saveSessions(sessions);

  logSecurityEvent({
    userId,
    type: 'session_revoked',
    title: 'All Other Sessions Terminated',
    description: `Terminated ${revokedCount} remote sessions across other browsers and devices.`,
    severity: 'warning'
  });

  return revokedCount;
}

/**
 * Logs a security event to the audit trail
 */
export function logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): SecurityEvent {
  const newEvent: SecurityEvent = {
    ...event,
    id: generateSecureToken('sec_'),
    timestamp: new Date().toISOString()
  };

  try {
    const raw = localStorage.getItem(STORAGE_SECURITY_EVENTS);
    const events: SecurityEvent[] = raw ? JSON.parse(raw) : [];
    events.unshift(newEvent);
    // Keep last 100 events
    if (events.length > 100) events.length = 100;
    localStorage.setItem(STORAGE_SECURITY_EVENTS, JSON.stringify(events));
  } catch (err) {
    console.error('Failed storing security event:', err);
  }

  return newEvent;
}

/**
 * Retrieves security events for a user
 */
export function getSecurityEvents(userId: string): SecurityEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_SECURITY_EVENTS);
    if (raw) {
      const parsed: SecurityEvent[] = JSON.parse(raw);
      return parsed.filter(e => e.userId === userId);
    }
  } catch (err) {
    console.error('Failed reading security events:', err);
  }

  // Initial seed events
  return [
    {
      id: 'sec_01',
      userId,
      type: 'login_success',
      title: 'Successful Authentication',
      description: 'Signed in via verified 6-digit SMS OTP.',
      severity: 'info',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      ipAddress: '49.207.218.42'
    },
    {
      id: 'sec_02',
      userId,
      type: 'qr_revoked',
      title: 'Emergency Token Rotated',
      description: 'Previous emergency token revoked and regenerated with 256-bit entropy.',
      severity: 'info',
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString()
    }
  ];
}

/**
 * Reads user security settings (MFA, step-up auth, recovery key)
 */
export function getSecuritySettings(): SecuritySettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_SECURITY_SETTINGS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed reading security settings:', err);
  }

  return {
    mfaEnabled: false,
    mfaMethod: 'sms_otp',
    stepUpAuthRequiredForRecords: true,
    lastSecurityAuditAt: new Date().toISOString()
  };
}

/**
 * Saves user security settings
 */
export function saveSecuritySettings(settings: SecuritySettingsState) {
  try {
    localStorage.setItem(STORAGE_SECURITY_SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed saving security settings:', err);
  }
}

/**
 * Generates and saves a new Emergency Recovery Key
 * Returns the plaintext key once (must be recorded by user)
 */
export async function createEmergencyRecoveryKey(userId: string): Promise<string> {
  const plainKey = generateRecoveryKey();
  const keyHash = await computeChecksum(plainKey);

  const settings = getSecuritySettings();
  settings.recoveryKeyHash = keyHash;
  settings.recoveryKeyCreatedAt = new Date().toISOString();
  saveSecuritySettings(settings);

  logSecurityEvent({
    userId,
    type: 'recovery_key_generated',
    title: 'Emergency Recovery Key Generated',
    description: 'A 16-character alphanumeric backup recovery code was generated.',
    severity: 'info'
  });

  return plainKey;
}

/**
 * Verifies a supplied recovery key against the saved checksum
 */
export async function verifyRecoveryKey(suppliedKey: string): Promise<boolean> {
  const settings = getSecuritySettings();
  if (!settings.recoveryKeyHash) return false;

  const normalized = suppliedKey.trim().toUpperCase();
  const hash = await computeChecksum(normalized);
  return hash === settings.recoveryKeyHash;
}
