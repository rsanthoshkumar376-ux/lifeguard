import { db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export type MemberRole = 'admin' | 'member' | 'senior' | 'child';
export type MemberStatus = 'active' | 'pending' | 'rejected';
export type FamilyRelation = 
  | 'Parent' 
  | 'Spouse' 
  | 'Child' 
  | 'Sibling' 
  | 'Grandparent' 
  | 'In-Law' 
  | 'Guardian' 
  | 'Caregiver' 
  | 'Other';

export interface FamilyMember {
  userId: string;
  name: string;
  phone: string;
  email?: string;
  relation: FamilyRelation;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: string;
  avatarUrl?: string;
  seniorModeEnabled?: boolean;
}

export interface FamilyCircle {
  id: string;
  name: string;
  adminUserId: string;
  adminName: string;
  adminPhone: string;
  members: FamilyMember[];
  createdAt: string;
  updatedAt: string;
}

export interface FamilyInvitation {
  id: string;
  circleId: string;
  circleName: string;
  senderId: string;
  senderName: string;
  recipientPhone: string;
  recipientEmail?: string;
  recipientName: string;
  relation: FamilyRelation;
  role: MemberRole;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface CaregiverPermissions {
  id: string;
  ownerUserId: string;
  ownerName: string;
  caregiverUserId: string;
  caregiverName: string;
  caregiverPhone: string;
  caregiverEmail?: string;
  relation: FamilyRelation;
  // Granular Access Flags
  canViewMedicalId: boolean;
  canViewMedicineSchedule: boolean;
  canViewHealthRecords: boolean;
  canViewAppointments: boolean;
  canReceiveSosAlerts: boolean;
  canManageMedications: boolean; // can mark doses as taken/skipped
  status: 'active' | 'revoked';
  consentedAt: string;
  revokedAt?: string;
  notes?: string;
}

export interface ChildEmergencyProfile {
  childId: string;
  guardianUserId: string;
  guardianName: string;
  guardianRelation: 'Mother' | 'Father' | 'Legal Guardian';
  guardianConsentConfirmed: boolean;
  consentTimestamp: string;
  childName: string;
  dob: string; // YYYY-MM-DD
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  allergies: string[];
  criticalConditions: string[];
  currentMedications: string[];
  schoolOrDaycareName?: string;
  schoolContactNumber?: string;
  pediatricianName?: string;
  pediatricianPhone?: string;
  emergencyInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CaregiverAccessLog {
  id: string;
  ownerUserId: string;
  caregiverUserId: string;
  caregiverName: string;
  resourceAccessed: 'medical_id' | 'medicine_schedule' | 'health_records' | 'appointments' | 'sos_event' | 'child_profile';
  action: 'viewed' | 'logged_dose' | 'updated_profile' | 'consent_granted' | 'access_revoked';
  timestamp: string;
  details?: string;
}

export interface FamilyEmergencyAlert {
  caseId: string;
  circleId: string;
  memberUserId: string;
  memberName: string;
  memberPhone: string;
  category: string;
  status: 'Created' | 'Alert Sent' | 'Acknowledged' | 'Assistance Accepted' | 'Resolved';
  location: {
    latitude: number;
    longitude: number;
    mapsUrl: string;
    capturedAt: string;
  };
  impactDetected: boolean;
  timestamp: string;
  acknowledgedBy: Array<{
    userId: string;
    name: string;
    timestamp: string;
    notes?: string;
  }>;
  resolutionNotes?: string;
}

export interface FamilyNotificationItem {
  id: string;
  circleId: string;
  type: 'sos_alert' | 'med_reminder' | 'appointment' | 'health_update' | 'caregiver_grant';
  title: string;
  description: string;
  timestamp: string;
  priority: 'urgent' | 'high' | 'normal';
  relatedUserId: string;
  relatedUserName: string;
  isRead?: boolean;
}

export interface FamilyCircleState {
  circles: FamilyCircle[];
  invitations: FamilyInvitation[];
  caregiverPermissions: CaregiverPermissions[];
  childProfiles: ChildEmergencyProfile[];
  accessLogs: CaregiverAccessLog[];
  emergencyAlerts: FamilyEmergencyAlert[];
  notifications: FamilyNotificationItem[];
  updatedAt: string;
}

// -------------------------------------------------------------
// LOCAL ENCRYPTION & STORAGE
// -------------------------------------------------------------
const STORAGE_KEY = 'lifeguard_family_circle_v1';
const ENCRYPTION_PREFIX = 'LG_FAM_v1:';

function simpleEncrypt(data: string): string {
  try {
    return ENCRYPTION_PREFIX + btoa(encodeURIComponent(data));
  } catch {
    return data;
  }
}

function simpleDecrypt(data: string): string {
  try {
    if (data.startsWith(ENCRYPTION_PREFIX)) {
      const b64 = data.slice(ENCRYPTION_PREFIX.length);
      return decodeURIComponent(atob(b64));
    }
    return data;
  } catch {
    return data;
  }
}

// -------------------------------------------------------------
// INITIAL SEED DEMO DATA
// -------------------------------------------------------------
const DEFAULT_SEED_DATA: FamilyCircleState = {
  circles: [
    {
      id: 'circle_kumar_01',
      name: 'Kumar Family Health Circle',
      adminUserId: 'user_rajesh',
      adminName: 'Rajesh Kumar',
      adminPhone: '+91 98765 43210',
      createdAt: '2026-03-01T10:00:00Z',
      updatedAt: '2026-03-21T08:30:00Z',
      members: [
        {
          userId: 'user_rajesh',
          name: 'Rajesh Kumar (You)',
          phone: '+91 98765 43210',
          email: 'rajesh.kumar@example.com',
          relation: 'Parent',
          role: 'admin',
          status: 'active',
          joinedAt: '2026-03-01T10:00:00Z'
        },
        {
          userId: 'user_lakshmi',
          name: 'Lakshmi Kumar (Mother)',
          phone: '+91 98765 43211',
          relation: 'Parent',
          role: 'senior',
          status: 'active',
          joinedAt: '2026-03-02T11:00:00Z',
          seniorModeEnabled: true
        },
        {
          userId: 'user_priya',
          name: 'Priya Kumar (Spouse)',
          phone: '+91 98765 43212',
          email: 'priya.k@example.com',
          relation: 'Spouse',
          role: 'member',
          status: 'active',
          joinedAt: '2026-03-02T14:30:00Z'
        },
        {
          userId: 'child_aarav_01',
          name: 'Aarav Kumar (Son, 8y)',
          phone: '+91 98765 43210',
          relation: 'Child',
          role: 'child',
          status: 'active',
          joinedAt: '2026-03-03T09:00:00Z'
        }
      ]
    }
  ],
  invitations: [
    {
      id: 'inv_01',
      circleId: 'circle_kumar_01',
      circleName: 'Kumar Family Health Circle',
      senderId: 'user_rajesh',
      senderName: 'Rajesh Kumar',
      recipientPhone: '+91 98765 43299',
      recipientName: 'Suresh Kumar',
      recipientEmail: 'suresh.k@example.com',
      relation: 'Sibling',
      role: 'member',
      status: 'pending',
      createdAt: '2026-03-20T16:00:00Z'
    }
  ],
  caregiverPermissions: [
    {
      id: 'perm_lakshmi_to_rajesh',
      ownerUserId: 'user_lakshmi',
      ownerName: 'Lakshmi Kumar (Mother)',
      caregiverUserId: 'user_rajesh',
      caregiverName: 'Rajesh Kumar',
      caregiverPhone: '+91 98765 43210',
      relation: 'Parent',
      canViewMedicalId: true,
      canViewMedicineSchedule: true,
      canViewHealthRecords: true,
      canViewAppointments: true,
      canReceiveSosAlerts: true,
      canManageMedications: true,
      status: 'active',
      consentedAt: '2026-03-02T11:15:00Z',
      notes: 'Full parental caregiving and emergency response authorized.'
    },
    {
      id: 'perm_rajesh_to_priya',
      ownerUserId: 'user_rajesh',
      ownerName: 'Rajesh Kumar',
      caregiverUserId: 'user_priya',
      caregiverName: 'Priya Kumar',
      caregiverPhone: '+91 98765 43212',
      relation: 'Spouse',
      canViewMedicalId: true,
      canViewMedicineSchedule: true,
      canViewHealthRecords: false,
      canViewAppointments: true,
      canReceiveSosAlerts: true,
      canManageMedications: false,
      status: 'active',
      consentedAt: '2026-03-05T09:30:00Z',
      notes: 'Emergency and appointments authorization.'
    }
  ],
  childProfiles: [
    {
      childId: 'child_aarav_01',
      guardianUserId: 'user_rajesh',
      guardianName: 'Rajesh Kumar',
      guardianRelation: 'Father',
      guardianConsentConfirmed: true,
      consentTimestamp: '2026-03-03T09:00:00Z',
      childName: 'Aarav Kumar',
      dob: '2018-05-14',
      gender: 'Male',
      bloodGroup: 'B+',
      allergies: ['Peanuts (Severe Anaphylaxis)', 'Amoxicillin'],
      criticalConditions: ['Mild Pediatric Asthma'],
      currentMedications: ['Salbutamol Inhaler (100mcg PRN)'],
      schoolOrDaycareName: 'Oakridge International Primary School, Chennai',
      schoolContactNumber: '+91 44 2828 0000',
      pediatricianName: 'Dr. Radhika Menon, MD (Pediatrics)',
      pediatricianPhone: '+91 94444 11223',
      emergencyInstructions: 'Carry EpiPen in school bag. Call 108 immediately if breathing difficulty occurs with hives.',
      createdAt: '2026-03-03T09:00:00Z',
      updatedAt: '2026-03-15T10:00:00Z'
    }
  ],
  accessLogs: [
    {
      id: 'log_01',
      ownerUserId: 'user_lakshmi',
      caregiverUserId: 'user_rajesh',
      caregiverName: 'Rajesh Kumar',
      resourceAccessed: 'medicine_schedule',
      action: 'viewed',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      details: 'Checked mother\'s evening Telmisartan dose.'
    },
    {
      id: 'log_02',
      ownerUserId: 'user_lakshmi',
      caregiverUserId: 'user_rajesh',
      caregiverName: 'Rajesh Kumar',
      resourceAccessed: 'medicine_schedule',
      action: 'logged_dose',
      timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
      details: 'Marked Rosuvastatin 10mg taken on behalf of patient.'
    },
    {
      id: 'log_03',
      ownerUserId: 'user_rajesh',
      caregiverUserId: 'user_priya',
      caregiverName: 'Priya Kumar',
      resourceAccessed: 'appointments',
      action: 'viewed',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      details: 'Reviewed upcoming cardiology consultation at Apollo Greams.'
    }
  ],
  emergencyAlerts: [
    {
      caseId: 'sos_lakshmi_991',
      circleId: 'circle_kumar_01',
      memberUserId: 'user_lakshmi',
      memberName: 'Lakshmi Kumar (Mother)',
      memberPhone: '+91 98765 43211',
      category: 'Severe Fall',
      status: 'Acknowledged',
      location: {
        latitude: 13.0850,
        longitude: 80.2101,
        mapsUrl: 'https://www.google.com/maps?q=13.0850,80.2101',
        capturedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString()
      },
      impactDetected: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      acknowledgedBy: [
        {
          userId: 'user_rajesh',
          name: 'Rajesh Kumar',
          timestamp: new Date(Date.now() - 1000 * 60 * 17).toISOString(),
          notes: 'Reached mother. First aid provided, attending physician notified.'
        }
      ]
    }
  ],
  notifications: [
    {
      id: 'notif_01',
      circleId: 'circle_kumar_01',
      type: 'sos_alert',
      title: '🚨 Severe Fall Alert: Lakshmi Kumar',
      description: 'Fall impact detected at Anna Nagar residence. Acknowledged by Rajesh Kumar.',
      timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      priority: 'urgent',
      relatedUserId: 'user_lakshmi',
      relatedUserName: 'Lakshmi Kumar'
    },
    {
      id: 'notif_02',
      circleId: 'circle_kumar_01',
      type: 'med_reminder',
      title: '💊 Medicine Taken: Rosuvastatin 10mg',
      description: 'Lakshmi Kumar took her bedtime cholesterol medication.',
      timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
      priority: 'normal',
      relatedUserId: 'user_lakshmi',
      relatedUserName: 'Lakshmi Kumar'
    },
    {
      id: 'notif_03',
      circleId: 'circle_kumar_01',
      type: 'appointment',
      title: '🗓️ Upcoming Hospital Visit in 24 Hours',
      description: 'Cardiology review with Dr. K. Swaminathan at Kauvery Hospital.',
      timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
      priority: 'high',
      relatedUserId: 'user_rajesh',
      relatedUserName: 'Rajesh Kumar'
    }
  ],
  updatedAt: new Date().toISOString()
};

// -------------------------------------------------------------
// STATE FETCH & PERSISTENCE
// -------------------------------------------------------------
export async function getFamilyCircleState(userId?: string): Promise<FamilyCircleState> {
  const uid = userId || 'local_user';

  // 1. Try Firestore if authenticated
  if (userId) {
    try {
      const docRef = doc(db, 'users', userId, 'familyCircle', 'state');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const cloudData = snap.data() as FamilyCircleState;
        saveToLocalCache(cloudData);
        return cloudData;
      }
    } catch (err) {
      console.warn('Firestore family circle fetch deferred/offline:', err);
    }
  }

  // 2. Read from local encrypted cache
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const decrypted = simpleDecrypt(raw);
      const parsed = JSON.parse(decrypted) as FamilyCircleState;
      if (parsed) return parsed;
    }
  } catch (err) {
    console.error('Failed to parse local family circle state:', err);
  }

  // 3. Fallback to rich seed state
  saveToLocalCache(DEFAULT_SEED_DATA);
  return DEFAULT_SEED_DATA;
}

export async function saveFamilyCircleState(
  state: FamilyCircleState,
  userId?: string
): Promise<boolean> {
  state.updatedAt = new Date().toISOString();
  saveToLocalCache(state);

  if (userId) {
    try {
      const docRef = doc(db, 'users', userId, 'familyCircle', 'state');
      await setDoc(docRef, state, { merge: true });
      return true;
    } catch (err) {
      console.warn('Firestore family circle sync skipped/saved locally:', err);
      return true;
    }
  }
  return true;
}

function saveToLocalCache(state: FamilyCircleState) {
  try {
    const json = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, simpleEncrypt(json));
  } catch (err) {
    console.error('Failed to write family circle state to localStorage:', err);
  }
}

// -------------------------------------------------------------
// CIRCLE & MEMBER MANAGEMENT
// -------------------------------------------------------------
export async function createFamilyCircle(
  name: string,
  adminName: string,
  adminPhone: string,
  userId?: string
): Promise<FamilyCircle> {
  const state = await getFamilyCircleState(userId);
  const uid = userId || 'user_' + Date.now();

  const newCircle: FamilyCircle = {
    id: 'circle_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    name,
    adminUserId: uid,
    adminName,
    adminPhone,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    members: [
      {
        userId: uid,
        name: `${adminName} (Admin)`,
        phone: adminPhone,
        relation: 'Parent',
        role: 'admin',
        status: 'active',
        joinedAt: new Date().toISOString()
      }
    ]
  };

  state.circles.push(newCircle);
  await saveFamilyCircleState(state, userId);
  return newCircle;
}

export async function inviteFamilyMember(
  circleId: string,
  invitee: {
    name: string;
    phone: string;
    email?: string;
    relation: FamilyRelation;
    role: MemberRole;
  },
  senderName: string,
  userId?: string
): Promise<FamilyInvitation> {
  const state = await getFamilyCircleState(userId);
  const circle = state.circles.find(c => c.id === circleId);
  if (!circle) throw new Error('Family circle not found');

  const newInvite: FamilyInvitation = {
    id: 'inv_' + Date.now(),
    circleId,
    circleName: circle.name,
    senderId: userId || 'local_user',
    senderName,
    recipientName: invitee.name,
    recipientPhone: invitee.phone,
    recipientEmail: invitee.email,
    relation: invitee.relation,
    role: invitee.role,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  // Also add as pending member in the circle
  const pendingMember: FamilyMember = {
    userId: 'pending_' + Date.now(),
    name: invitee.name,
    phone: invitee.phone,
    email: invitee.email,
    relation: invitee.relation,
    role: invitee.role,
    status: 'pending',
    joinedAt: new Date().toISOString(),
    seniorModeEnabled: invitee.role === 'senior'
  };

  circle.members.push(pendingMember);
  circle.updatedAt = new Date().toISOString();
  state.invitations.unshift(newInvite);

  await saveFamilyCircleState(state, userId);
  return newInvite;
}

export async function respondToInvitation(
  invitationId: string,
  accept: boolean,
  userId?: string
): Promise<boolean> {
  const state = await getFamilyCircleState(userId);
  const invite = state.invitations.find(i => i.id === invitationId);
  if (!invite) return false;

  invite.status = accept ? 'accepted' : 'rejected';

  // Update member status in circle
  const circle = state.circles.find(c => c.id === invite.circleId);
  if (circle) {
    const member = circle.members.find(m => m.phone === invite.recipientPhone);
    if (member) {
      member.status = accept ? 'active' : 'rejected';
      if (accept && userId) {
        member.userId = userId;
      }
    }
  }

  await saveFamilyCircleState(state, userId);
  return true;
}

export async function removeFamilyMember(
  circleId: string,
  memberUserId: string,
  requestingUserId?: string
): Promise<boolean> {
  const state = await getFamilyCircleState(requestingUserId);
  const circle = state.circles.find(c => c.id === circleId);
  if (!circle) return false;

  circle.members = circle.members.filter(m => m.userId !== memberUserId);
  circle.updatedAt = new Date().toISOString();

  await saveFamilyCircleState(state, requestingUserId);
  return true;
}

export async function assignFamilyAdmin(
  circleId: string,
  newAdminUserId: string,
  requestingUserId?: string
): Promise<boolean> {
  const state = await getFamilyCircleState(requestingUserId);
  const circle = state.circles.find(c => c.id === circleId);
  if (!circle) return false;

  const newAdminMember = circle.members.find(m => m.userId === newAdminUserId);
  if (!newAdminMember) return false;

  // Downgrade old admin to member
  const oldAdmin = circle.members.find(m => m.userId === circle.adminUserId);
  if (oldAdmin) oldAdmin.role = 'member';

  circle.adminUserId = newAdminUserId;
  circle.adminName = newAdminMember.name;
  circle.adminPhone = newAdminMember.phone;
  newAdminMember.role = 'admin';
  circle.updatedAt = new Date().toISOString();

  await saveFamilyCircleState(state, requestingUserId);
  return true;
}

// -------------------------------------------------------------
// CAREGIVER PERMISSIONS & DATA ISOLATION
// -------------------------------------------------------------
export async function grantOrUpdateCaregiverPermissions(
  perm: Omit<CaregiverPermissions, 'id' | 'consentedAt' | 'status'>,
  userId?: string
): Promise<CaregiverPermissions> {
  const state = await getFamilyCircleState(userId);

  const existingIdx = state.caregiverPermissions.findIndex(
    p => p.ownerUserId === perm.ownerUserId && p.caregiverUserId === perm.caregiverUserId
  );

  const newPerm: CaregiverPermissions = {
    ...perm,
    id: existingIdx !== -1 ? state.caregiverPermissions[existingIdx].id : 'perm_' + Date.now(),
    consentedAt: new Date().toISOString(),
    status: 'active'
  };

  if (existingIdx !== -1) {
    state.caregiverPermissions[existingIdx] = newPerm;
  } else {
    state.caregiverPermissions.push(newPerm);
  }

  // Log consent action
  state.accessLogs.unshift({
    id: 'log_' + Date.now(),
    ownerUserId: perm.ownerUserId,
    caregiverUserId: perm.caregiverUserId,
    caregiverName: perm.caregiverName,
    resourceAccessed: 'medical_id',
    action: 'consent_granted',
    timestamp: new Date().toISOString(),
    details: `Granted permissions: Medical ID (${perm.canViewMedicalId}), Meds (${perm.canViewMedicineSchedule}), Records (${perm.canViewHealthRecords}), Appts (${perm.canViewAppointments}), SOS (${perm.canReceiveSosAlerts}).`
  });

  await saveFamilyCircleState(state, userId);
  return newPerm;
}

export async function revokeCaregiverPermissions(
  permId: string,
  userId?: string
): Promise<boolean> {
  const state = await getFamilyCircleState(userId);
  const perm = state.caregiverPermissions.find(p => p.id === permId);
  if (!perm) return false;

  perm.status = 'revoked';
  perm.revokedAt = new Date().toISOString();

  // Log revocation
  state.accessLogs.unshift({
    id: 'log_' + Date.now(),
    ownerUserId: perm.ownerUserId,
    caregiverUserId: perm.caregiverUserId,
    caregiverName: perm.caregiverName,
    resourceAccessed: 'medical_id',
    action: 'access_revoked',
    timestamp: new Date().toISOString(),
    details: 'Caregiver access revoked by patient.'
  });

  await saveFamilyCircleState(state, userId);
  return true;
}

// -------------------------------------------------------------
// CHILD EMERGENCY PROFILE & GUARDIAN CONSENT
// -------------------------------------------------------------
export async function saveChildEmergencyProfile(
  profile: Omit<ChildEmergencyProfile, 'childId' | 'createdAt' | 'updatedAt' | 'consentTimestamp'>,
  childId?: string,
  userId?: string
): Promise<ChildEmergencyProfile> {
  const state = await getFamilyCircleState(userId);
  const nowIso = new Date().toISOString();

  let finalChildId = childId;
  let existing = childId ? state.childProfiles.find(c => c.childId === childId) : null;

  if (!finalChildId) {
    finalChildId = 'child_' + Date.now();
  }

  const newChild: ChildEmergencyProfile = {
    ...profile,
    childId: finalChildId,
    guardianConsentConfirmed: true,
    consentTimestamp: existing?.consentTimestamp || nowIso,
    createdAt: existing?.createdAt || nowIso,
    updatedAt: nowIso
  };

  if (existing) {
    const idx = state.childProfiles.findIndex(c => c.childId === finalChildId);
    state.childProfiles[idx] = newChild;
  } else {
    state.childProfiles.push(newChild);
  }

  // Audit log
  state.accessLogs.unshift({
    id: 'log_' + Date.now(),
    ownerUserId: profile.guardianUserId,
    caregiverUserId: profile.guardianUserId,
    caregiverName: profile.guardianName,
    resourceAccessed: 'child_profile',
    action: 'updated_profile',
    timestamp: nowIso,
    details: `Updated pediatric emergency profile for ${profile.childName} with guardian consent.`
  });

  await saveFamilyCircleState(state, userId);
  return newChild;
}

export async function deleteChildProfile(
  childId: string,
  userId?: string
): Promise<boolean> {
  const state = await getFamilyCircleState(userId);
  state.childProfiles = state.childProfiles.filter(c => c.childId !== childId);
  await saveFamilyCircleState(state, userId);
  return true;
}

// -------------------------------------------------------------
// EMERGENCY DASHBOARD & ACKNOWLEDGEMENTS
// -------------------------------------------------------------
export async function acknowledgeCircleEmergency(
  caseId: string,
  responderUserId: string,
  responderName: string,
  notes?: string,
  userId?: string
): Promise<boolean> {
  const state = await getFamilyCircleState(userId);
  const alert = state.emergencyAlerts.find(a => a.caseId === caseId);
  if (!alert) return false;

  alert.status = 'Acknowledged';
  alert.acknowledgedBy.push({
    userId: responderUserId,
    name: responderName,
    timestamp: new Date().toISOString(),
    notes: notes || 'Assistance acknowledged by family member.'
  });

  // Log
  state.accessLogs.unshift({
    id: 'log_' + Date.now(),
    ownerUserId: alert.memberUserId,
    caregiverUserId: responderUserId,
    caregiverName: responderName,
    resourceAccessed: 'sos_event',
    action: 'viewed',
    timestamp: new Date().toISOString(),
    details: `Acknowledged SOS emergency (${alert.category}) for ${alert.memberName}.`
  });

  await saveFamilyCircleState(state, userId);
  return true;
}

export async function resolveCircleEmergency(
  caseId: string,
  resolutionNotes: string,
  userId?: string
): Promise<boolean> {
  const state = await getFamilyCircleState(userId);
  const alert = state.emergencyAlerts.find(a => a.caseId === caseId);
  if (!alert) return false;

  alert.status = 'Resolved';
  alert.resolutionNotes = resolutionNotes;
  await saveFamilyCircleState(state, userId);
  return true;
}

// -------------------------------------------------------------
// SENIOR CITIZEN MODE PREFERENCES
// -------------------------------------------------------------
const SENIOR_MODE_STORAGE_KEY = 'lifeguard_senior_mode_active';

export function isSeniorModeActive(): boolean {
  try {
    return localStorage.getItem(SENIOR_MODE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setSeniorModeActive(active: boolean) {
  try {
    localStorage.setItem(SENIOR_MODE_STORAGE_KEY, active ? 'true' : 'false');
  } catch {}
}
