/**
 * Authoritative Red Blood Cell (RBC) and Plasma Compatibility Matrix
 * Compliant with WHO, American Association of Blood Banks (AABB), and NBTC India guidelines.
 * 
 * IMPORTANT CLINICAL NOTICE:
 * Blood group compatibility alone is NOT sufficient for transfusion.
 * Laboratory crossmatching, Rh subtyping, antibody screening, and hospital blood bank
 * verification remain strictly mandatory before any clinical blood transfusion.
 */

export type BloodGroup = 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';

export const ALL_BLOOD_GROUPS: BloodGroup[] = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

/**
 * Red Blood Cell (RBC) Compatibility Matrix
 * Key: Recipient Blood Group -> Array of compatible Donor Blood Groups
 */
export const RBC_RECIPIENT_COMPATIBILITY: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-'],
  'O+': ['O+', 'O-'],
  'A-': ['A-', 'O-'],
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'] // Universal Recipient
};

/**
 * Red Blood Cell (RBC) Donor Compatibility Matrix
 * Key: Donor Blood Group -> Array of compatible Recipient Blood Groups
 */
export const RBC_DONOR_COMPATIBILITY: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal RBC Donor
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+']
};

/**
 * Checks whether donor RBC is compatible with recipient
 */
export const canDonateRbcTo = (donor: BloodGroup, recipient: BloodGroup): boolean => {
  return RBC_RECIPIENT_COMPATIBILITY[recipient]?.includes(donor) ?? false;
};

/**
 * Gets all donor blood groups compatible with the recipient
 */
export const getCompatibleDonorsFor = (recipient: BloodGroup): BloodGroup[] => {
  return RBC_RECIPIENT_COMPATIBILITY[recipient] || [recipient];
};

/**
 * Gets all recipient blood groups that this donor can give to
 */
export const getCompatibleRecipientsFor = (donor: BloodGroup): BloodGroup[] => {
  return RBC_DONOR_COMPATIBILITY[donor] || [donor];
};

/**
 * Blood Component Types used in hospital transfusion requests
 */
export type BloodComponent = 
  | 'Whole Blood'
  | 'Packed Red Blood Cells (PRBC)'
  | 'Platelet Concentrate (RDP)'
  | 'Single Donor Platelets (SDP)'
  | 'Fresh Frozen Plasma (FFP)'
  | 'Cryoprecipitate';

export const BLOOD_COMPONENTS: BloodComponent[] = [
  'Whole Blood',
  'Packed Red Blood Cells (PRBC)',
  'Platelet Concentrate (RDP)',
  'Single Donor Platelets (SDP)',
  'Fresh Frozen Plasma (FFP)',
  'Cryoprecipitate'
];

/**
 * Essential physiological eligibility criteria
 */
export interface DonorEligibilityChecklist {
  minAgeYears: number; // 18
  maxAgeYears: number; // 65
  minWeightKg: number; // 45kg (female) / 50kg (male)
  minHemoglobinGdl: number; // 12.5 g/dL
  minDonationIntervalDays: number; // 90 days for men, 120 days for women
}

export const STANDARD_ELIGIBILITY: DonorEligibilityChecklist = {
  minAgeYears: 18,
  maxAgeYears: 65,
  minWeightKg: 45,
  minHemoglobinGdl: 12.5,
  minDonationIntervalDays: 90
};

export const CLINICAL_TRANSFUSION_DISCLAIMER = 
  'CLINICAL NOTICE: Blood group matching is an initial discovery filter only. Final transfusion eligibility strictly requires mandatory pre-transfusion testing, blood bank crossmatching, and hospital physician verification under national health guidelines. Never perform emergency transfusions without verified crossmatching.';
