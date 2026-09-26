import { BloodGroup } from '../types';

export const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const COMPATIBILITY_DISCLAIMER = "Disclaimer: This compatibility matching is for informational purposes only. Actual blood compatibility must be verified by medical professionals through cross-matching before any transfusion.";

const compatibilityChart: Record<BloodGroup, { canDonateTo: BloodGroup[], canReceiveFrom: BloodGroup[] }> = {
  'A+': {
    canDonateTo: ['A+', 'AB+'],
    canReceiveFrom: ['A+', 'A-', 'O+', 'O-']
  },
  'A-': {
    canDonateTo: ['A+', 'A-', 'AB+', 'AB-'],
    canReceiveFrom: ['A-', 'O-']
  },
  'B+': {
    canDonateTo: ['B+', 'AB+'],
    canReceiveFrom: ['B+', 'B-', 'O+', 'O-']
  },
  'B-': {
    canDonateTo: ['B+', 'B-', 'AB+', 'AB-'],
    canReceiveFrom: ['B-', 'O-']
  },
  'AB+': {
    canDonateTo: ['AB+'],
    canReceiveFrom: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  'AB-': {
    canDonateTo: ['AB+', 'AB-'],
    canReceiveFrom: ['A-', 'B-', 'AB-', 'O-']
  },
  'O+': {
    canDonateTo: ['A+', 'B+', 'AB+', 'O+'],
    canReceiveFrom: ['O+', 'O-']
  },
  'O-': {
    canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    canReceiveFrom: ['O-']
  }
};

export const canDonateTo = (donor: BloodGroup, recipient: BloodGroup): boolean => {
  return compatibilityChart[donor].canDonateTo.includes(recipient);
};

export const canReceiveFrom = (recipient: BloodGroup, donor: BloodGroup): boolean => {
  return compatibilityChart[recipient].canReceiveFrom.includes(donor);
};

export const getCompatibleDonors = (recipientBloodGroup: BloodGroup): BloodGroup[] => {
  return compatibilityChart[recipientBloodGroup].canReceiveFrom;
};

export const getCompatibleRecipients = (donorBloodGroup: BloodGroup): BloodGroup[] => {
  return compatibilityChart[donorBloodGroup].canDonateTo;
};

export const isEligibleToDonateByCooldown = (lastDonationDate: Date | null, cooldownDays: number = 90): boolean => {
  if (!lastDonationDate) return true;
  
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastDonationDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays >= cooldownDays;
};
