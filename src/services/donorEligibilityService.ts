import { BloodGroup } from './bloodCompatibilityService';

export type DonationType = 
  | 'Whole Blood'
  | 'Plateletpheresis (SDP)'
  | 'Plasmapheresis'
  | 'Double Red Blood Cells (2RBC)';

export interface DonationIntervalPolicy {
  donationType: DonationType;
  maleIntervalDays: number;
  femaleIntervalDays: number;
  maxPerYearMale: number;
  maxPerYearFemale: number;
  description: string;
  recoveryAdvice: string;
}

/**
 * Standard Donation Intervals according to National Blood Transfusion Council (NBTC),
 * Drugs & Cosmetics Act (India), and WHO guidelines.
 * Configurable according to institutional blood bank policies.
 */
export const DEFAULT_DONATION_POLICIES: Record<DonationType, DonationIntervalPolicy> = {
  'Whole Blood': {
    donationType: 'Whole Blood',
    maleIntervalDays: 90, // 3 months
    femaleIntervalDays: 120, // 4 months
    maxPerYearMale: 4,
    maxPerYearFemale: 3,
    description: 'Standard whole blood collection (350ml or 450ml). Red cells require 8-12 weeks for physiological iron replenishment.',
    recoveryAdvice: 'Drink plenty of oral fluids over the next 48 hours. Avoid strenuous physical exercise for 24 hours.'
  },
  'Plateletpheresis (SDP)': {
    donationType: 'Plateletpheresis (SDP)',
    maleIntervalDays: 7, // 7 days standard (minimum 48h emergency rule, max 24 times/yr)
    femaleIntervalDays: 7,
    maxPerYearMale: 24,
    maxPerYearFemale: 24,
    description: 'Apheresis platelet donation. Platelet counts recover within 48 to 72 hours. Up to 24 procedures permitted per year.',
    recoveryAdvice: 'Rest arm for 2 hours. Normal platelet count regenerates within 48 hours.'
  },
  'Plasmapheresis': {
    donationType: 'Plasmapheresis',
    maleIntervalDays: 14, // 2 weeks
    femaleIntervalDays: 14,
    maxPerYearMale: 24,
    maxPerYearFemale: 24,
    description: 'Apheresis plasma collection. Circulating plasma proteins replenish within 24 to 48 hours with healthy nutrition.',
    recoveryAdvice: 'Maintain healthy protein intake and adequate hydration.'
  },
  'Double Red Blood Cells (2RBC)': {
    donationType: 'Double Red Blood Cells (2RBC)',
    maleIntervalDays: 120, // 4 months
    femaleIntervalDays: 180, // 6 months
    maxPerYearMale: 3,
    maxPerYearFemale: 2,
    description: 'Automated 2 units of concentrated red blood cells. Requires extended red cell recovery period.',
    recoveryAdvice: 'Supplemental dietary iron and vitamin C recommended for enhanced iron absorption.'
  }
};

export interface EligibilityResult {
  isEligible: boolean;
  daysRemaining: number;
  daysElapsed: number;
  requiredIntervalDays: number;
  nextEligibleDate: string; // ISO date string
  progressPercent: number; // 0 to 100
  donationType: DonationType;
  policy: DonationIntervalPolicy;
  warningNotice: string;
}

const LOCAL_POLICY_OVERRIDE_KEY = 'lifeguard_donation_policy_overrides';

export const getDonationPolicies = (): Record<DonationType, DonationIntervalPolicy> => {
  try {
    const raw = localStorage.getItem(LOCAL_POLICY_OVERRIDE_KEY);
    if (raw) {
      return { ...DEFAULT_DONATION_POLICIES, ...JSON.parse(raw) };
    }
  } catch {}
  return DEFAULT_DONATION_POLICIES;
};

export const savePolicyOverrides = (overrides: Partial<Record<DonationType, Partial<DonationIntervalPolicy>>>): void => {
  try {
    const current = getDonationPolicies();
    const updated = { ...current, ...overrides };
    localStorage.setItem(LOCAL_POLICY_OVERRIDE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed saving policy overrides', e);
  }
};

/**
 * Calculates estimated next eligible date and readiness.
 * CRITICAL CLINICAL RULE:
 * Intervals are NOT universally 90 days.
 * Whole blood male = 90d, female = 120d, SDP = 7d, Plasma = 14d, 2RBC = 120d.
 */
export const calculateDonationEligibility = (params: {
  lastDonationDateIso: string;
  donationType?: DonationType;
  gender?: 'male' | 'female' | 'other';
}): EligibilityResult => {
  const { lastDonationDateIso, donationType = 'Whole Blood', gender = 'male' } = params;
  const policies = getDonationPolicies();
  const policy = policies[donationType] || DEFAULT_DONATION_POLICIES['Whole Blood'];

  const requiredDays = gender === 'female' ? policy.femaleIntervalDays : policy.maleIntervalDays;

  const lastDate = new Date(lastDonationDateIso);
  const now = new Date();
  
  // Calculate difference in whole days
  const diffTime = now.getTime() - lastDate.getTime();
  const daysElapsed = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.max(0, requiredDays - daysElapsed);
  const isEligible = daysElapsed >= requiredDays;

  const nextDate = new Date(lastDate.getTime() + requiredDays * 24 * 60 * 60 * 1000);
  const progressPercent = Math.min(100, Math.round((daysElapsed / requiredDays) * 100));

  return {
    isEligible,
    daysRemaining,
    daysElapsed,
    requiredIntervalDays: requiredDays,
    nextEligibleDate: nextDate.toISOString(),
    progressPercent,
    donationType,
    policy,
    warningNotice: 'Eligibility requires on-site medical screening. Final fitness depends on hemoglobin (≥12.5 g/dL), blood pressure, weight, and clinical assessment by the blood bank physician.'
  };
};

/**
 * RARE BLOOD GROUP NETWORK
 * Identifies rare and uncommon ABO/Rh groups and Bombay Blood Phenotype.
 */
export interface RareBloodInfo {
  isRare: boolean;
  frequencyDescription: string;
  rarityLevel: 'Extremely Rare' | 'Rare' | 'Uncommon' | 'Standard';
  clinicalSignificance: string;
  emergencyAlertWorthy: boolean;
}

export const RARE_BLOOD_REGISTRY: Record<string, RareBloodInfo> = {
  'O-': {
    isRare: true,
    frequencyDescription: 'Only ~1.4% of Indian population',
    rarityLevel: 'Rare',
    clinicalSignificance: 'Universal Red Cell Donor. Essential for emergency polytrauma resuscitations before crossmatch is ready.',
    emergencyAlertWorthy: true
  },
  'AB-': {
    isRare: true,
    frequencyDescription: 'Less than 0.4% of Indian population',
    rarityLevel: 'Extremely Rare',
    clinicalSignificance: 'The rarest standard blood group in India. Critically dependent on dedicated donor registry.',
    emergencyAlertWorthy: true
  },
  'A-': {
    isRare: true,
    frequencyDescription: '~1.2% of Indian population',
    rarityLevel: 'Rare',
    clinicalSignificance: 'Rh-negative group with limited compatibility.',
    emergencyAlertWorthy: true
  },
  'B-': {
    isRare: true,
    frequencyDescription: '~1.8% of Indian population',
    rarityLevel: 'Rare',
    clinicalSignificance: 'Uncommon Rh-negative group requiring proactive donor matching.',
    emergencyAlertWorthy: true
  },
  'Bombay Blood (hh)': {
    isRare: true,
    frequencyDescription: '1 in 10,000 to 1 in 17,500 in India (0.006%)',
    rarityLevel: 'Extremely Rare',
    clinicalSignificance: 'Lacks H antigen. Can ONLY receive blood from another Bombay Blood phenotype individual. Worldwide critical emergency matching.',
    emergencyAlertWorthy: true
  },
  'O+': {
    isRare: false,
    frequencyDescription: '~37% of Indian population',
    rarityLevel: 'Standard',
    clinicalSignificance: 'Most prevalent blood group with high volume demand.',
    emergencyAlertWorthy: false
  },
  'B+': {
    isRare: false,
    frequencyDescription: '~32% of Indian population',
    rarityLevel: 'Standard',
    clinicalSignificance: 'Second most common group with constant emergency requirements.',
    emergencyAlertWorthy: false
  },
  'A+': {
    isRare: false,
    frequencyDescription: '~22% of Indian population',
    rarityLevel: 'Standard',
    clinicalSignificance: 'Standard ABO positive group.',
    emergencyAlertWorthy: false
  },
  'AB+': {
    isRare: false,
    frequencyDescription: '~7% of Indian population',
    rarityLevel: 'Uncommon',
    clinicalSignificance: 'Universal Red Cell Recipient & Universal Plasma Donor.',
    emergencyAlertWorthy: false
  }
};

export const getRareBloodInfo = (group: string): RareBloodInfo => {
  return RARE_BLOOD_REGISTRY[group] || {
    isRare: false,
    frequencyDescription: 'Standard ABO/Rh distribution',
    rarityLevel: 'Standard',
    clinicalSignificance: 'Clinical crossmatching required.',
    emergencyAlertWorthy: false
  };
};

export const isRareBloodGroup = (group: string): boolean => {
  return RARE_BLOOD_REGISTRY[group]?.isRare ?? false;
};
