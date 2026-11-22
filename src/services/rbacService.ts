/**
 * LifeGuard Role-Based Access Control (RBAC) System
 * Enforces least-privilege authorization across 6 distinct healthcare roles:
 * 1. Patient: Primary user managing own medical history, emergency ID, and medications.
 * 2. Donor: Voluntary blood donor searching requests, recording donations, managing availability.
 * 3. Caregiver: Delegated family/clinical caregiver with authorized patient access.
 * 4. Hospital: Registered clinical staff managing blood bank, requisitions, and triage.
 * 5. Administrator: Statutory compliance officer, verifying hospitals and reviewing audits.
 * 6. Responder: Certified paramedic / 108 ambulance responder viewing authorized triage telemetry.
 */

export type AppRole = 
  | 'patient' 
  | 'donor' 
  | 'caregiver' 
  | 'hospital' 
  | 'administrator' 
  | 'responder';

export type Permission =
  // Patient Permissions
  | 'VIEW_OWN_MEDICAL_RECORD'
  | 'EDIT_OWN_MEDICAL_RECORD'
  | 'MANAGE_OWN_EMERGENCY_ID'
  | 'REVOKE_EMERGENCY_TOKEN'
  | 'GRANT_CAREGIVER_ACCESS'
  | 'REVOKE_CAREGIVER_ACCESS'
  | 'DELETE_OWN_ACCOUNT'
  | 'TRIGGER_EMERGENCY_SOS'
  // Donor Permissions
  | 'VIEW_BLOOD_REQUESTS'
  | 'RESPOND_TO_BLOOD_REQUEST'
  | 'UPDATE_DONOR_AVAILABILITY'
  | 'VIEW_DONOR_ACHIEVEMENTS'
  // Caregiver Permissions
  | 'VIEW_DELEGATED_PATIENT_SUMMARY'
  | 'VIEW_DELEGATED_MEDICATIONS'
  | 'MARK_DELEGATED_MEDICATION'
  | 'RECEIVE_PATIENT_SOS_ALERT'
  // Hospital Staff Permissions
  | 'MANAGE_HOSPITAL_PROFILE'
  | 'CREATE_BLOOD_REQUEST'
  | 'FULFILL_BLOOD_REQUEST'
  | 'MANAGE_BLOOD_INVENTORY'
  | 'PROCESS_PATIENT_HANDOVER'
  | 'SEARCH_DONOR_DIRECTORY'
  // Administrator Permissions
  | 'VERIFY_HOSPITAL_DOCUMENTS'
  | 'REJECT_HOSPITAL_REGISTRATION'
  | 'VIEW_SYSTEM_AUDIT_LOGS'
  | 'MANAGE_USER_ROLES'
  | 'EXECUTE_SECURITY_TESTS'
  // Emergency Responder / Paramedic Permissions
  | 'ACCESS_EMERGENCY_TRIAGE_FEED'
  | 'ACKNOWLEDGE_SOS_INCIDENT'
  | 'UPDATE_PARAMEDIC_VITALS'
  | 'CALL_PRIMARY_CONTACTS';

export interface RoleDefinition {
  role: AppRole;
  title: string;
  description: string;
  badgeColor: string;
  permissions: Permission[];
}

export const ROLE_DEFINITIONS: Record<AppRole, RoleDefinition> = {
  patient: {
    role: 'patient',
    title: 'Patient / Individual',
    description: 'Owns personal health records, emergency Medical ID, and daily medication schedules.',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    permissions: [
      'VIEW_OWN_MEDICAL_RECORD',
      'EDIT_OWN_MEDICAL_RECORD',
      'MANAGE_OWN_EMERGENCY_ID',
      'REVOKE_EMERGENCY_TOKEN',
      'GRANT_CAREGIVER_ACCESS',
      'REVOKE_CAREGIVER_ACCESS',
      'DELETE_OWN_ACCOUNT',
      'TRIGGER_EMERGENCY_SOS',
      'VIEW_BLOOD_REQUESTS'
    ]
  },
  donor: {
    role: 'donor',
    title: 'Voluntary Blood Donor',
    description: 'Consenting blood donor discovering nearby emergency requisitions and logging milestones.',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    permissions: [
      'VIEW_OWN_MEDICAL_RECORD',
      'EDIT_OWN_MEDICAL_RECORD',
      'MANAGE_OWN_EMERGENCY_ID',
      'TRIGGER_EMERGENCY_SOS',
      'VIEW_BLOOD_REQUESTS',
      'RESPOND_TO_BLOOD_REQUEST',
      'UPDATE_DONOR_AVAILABILITY',
      'VIEW_DONOR_ACHIEVEMENTS'
    ]
  },
  caregiver: {
    role: 'caregiver',
    title: 'Authorized Caregiver',
    description: 'Authorized family member or nurse monitoring senior health, medications, and distress calls.',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    permissions: [
      'VIEW_OWN_MEDICAL_RECORD',
      'EDIT_OWN_MEDICAL_RECORD',
      'TRIGGER_EMERGENCY_SOS',
      'VIEW_DELEGATED_PATIENT_SUMMARY',
      'VIEW_DELEGATED_MEDICATIONS',
      'MARK_DELEGATED_MEDICATION',
      'RECEIVE_PATIENT_SOS_ALERT'
    ]
  },
  hospital: {
    role: 'hospital',
    title: 'Hospital Clinical Staff',
    description: 'Verified clinical personnel managing blood requests, inventory batches, and SBAR handovers.',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    permissions: [
      'VIEW_BLOOD_REQUESTS',
      'MANAGE_HOSPITAL_PROFILE',
      'CREATE_BLOOD_REQUEST',
      'FULFILL_BLOOD_REQUEST',
      'MANAGE_BLOOD_INVENTORY',
      'PROCESS_PATIENT_HANDOVER',
      'SEARCH_DONOR_DIRECTORY'
    ]
  },
  administrator: {
    role: 'administrator',
    title: 'System & Compliance Admin',
    description: 'Audits regulatory certificates, reviews access logs, and manages platform compliance.',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    permissions: [
      'VIEW_OWN_MEDICAL_RECORD',
      'EDIT_OWN_MEDICAL_RECORD',
      'VIEW_BLOOD_REQUESTS',
      'VERIFY_HOSPITAL_DOCUMENTS',
      'REJECT_HOSPITAL_REGISTRATION',
      'VIEW_SYSTEM_AUDIT_LOGS',
      'MANAGE_USER_ROLES',
      'EXECUTE_SECURITY_TESTS'
    ]
  },
  responder: {
    role: 'responder',
    title: 'Emergency First Responder',
    description: 'Paramedic or 108 ambulance personnel coordinating roadside triage and critical transit.',
    badgeColor: 'bg-red-100 text-red-800 border-red-200',
    permissions: [
      'ACCESS_EMERGENCY_TRIAGE_FEED',
      'ACKNOWLEDGE_SOS_INCIDENT',
      'UPDATE_PARAMEDIC_VITALS',
      'CALL_PRIMARY_CONTACTS',
      'PROCESS_PATIENT_HANDOVER'
    ]
  }
};

/**
 * Normalizes legacy roles ('user', 'hospital_staff', 'admin') to standard AppRole
 */
export function normalizeUserRole(rawRole?: string): AppRole {
  if (!rawRole) return 'patient';
  const lower = rawRole.toLowerCase();
  if (lower === 'admin' || lower === 'administrator') return 'administrator';
  if (lower === 'hospital_staff' || lower === 'hospital') return 'hospital';
  if (lower === 'donor') return 'donor';
  if (lower === 'caregiver') return 'caregiver';
  if (lower === 'responder' || lower === 'paramedic') return 'responder';
  return 'patient';
}

/**
 * Checks if a user has a specific permission based on their assigned role
 */
export function hasPermission(roleOrUser: AppRole | { role?: string }, permission: Permission): boolean {
  const role: AppRole = typeof roleOrUser === 'string' 
    ? roleOrUser 
    : normalizeUserRole(roleOrUser?.role);

  const def = ROLE_DEFINITIONS[role];
  if (!def) return false;
  return def.permissions.includes(permission);
}

/**
 * Validates whether a caller can access a specific patient's medical records
 */
export function canAccessPatientData(
  callerUserId: string,
  callerRole: AppRole,
  targetPatientId: string,
  isExplicitCaregiver = false
): boolean {
  // 1. A patient can always access their own data
  if (callerUserId === targetPatientId) {
    return true;
  }

  // 2. Administrators cannot browse private medical records without explicit audit authorization
  if (callerRole === 'administrator') {
    return false; // Deny by default: Admins manage infrastructure, not individual clinical charts
  }

  // 3. Authorized Caregiver with active explicit grant
  if (callerRole === 'caregiver' && isExplicitCaregiver) {
    return true;
  }

  // 4. Hospital & Responders cannot browse general health records; only approved handover summaries
  return false;
}
