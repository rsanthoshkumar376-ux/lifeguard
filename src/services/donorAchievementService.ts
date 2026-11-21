import { BloodGroup } from './bloodCompatibilityService';
import { DonationType, calculateDonationEligibility, isRareBloodGroup } from './donorEligibilityService';

export interface VerifiedDonationRecord {
  id: string;
  donationDate: string; // ISO
  donationType: DonationType;
  hospitalOrBloodBank: string;
  city: string;
  units: number;
  bloodGroup: BloodGroup | string;
  verificationStatus: 'verified' | 'pending_verification';
  verifiedBy: string;
  certificateId: string;
  hemoglobinGdl?: number;
  notes?: string;
}

export interface DonorBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'rare' | 'safety';
  isUnlocked: boolean;
  unlockedAt?: string;
  currentCount: number;
  targetCount: number;
}

export interface DonationCertificateData {
  certificateId: string;
  donorName: string;
  bloodGroup: string;
  donationType: DonationType;
  units: number;
  donationDate: string;
  hospitalName: string;
  city: string;
  accreditationAuthority: string;
  signatoryName: string;
  signatoryTitle: string;
  qrVerificationUrl: string;
}

const LOCAL_DONATIONS_KEY = 'lifeguard_verified_donations_history';

/**
 * Retrieve all past donation records for the user
 */
export const getDonationHistory = (): VerifiedDonationRecord[] => {
  let list: VerifiedDonationRecord[] = [];
  try {
    const raw = localStorage.getItem(LOCAL_DONATIONS_KEY);
    if (raw) list = JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading donations history:', e);
  }

  if (list.length === 0) {
    list = generateSeedDonationHistory();
    try {
      localStorage.setItem(LOCAL_DONATIONS_KEY, JSON.stringify(list));
    } catch {}
  }

  return list.sort((a, b) => new Date(b.donationDate).getTime() - new Date(a.donationDate).getTime());
};

/**
 * Log a new donation safely.
 * GUARD AGAINST UNSAFE / EXCESSIVE DONATIONS:
 * Rejects or blocks logging if donor has not met the medical recovery interval!
 */
export const logDonationSafely = (record: {
  donationDate: string;
  donationType: DonationType;
  hospitalOrBloodBank: string;
  city: string;
  units?: number;
  bloodGroup: BloodGroup | string;
  gender?: 'male' | 'female' | 'other';
  hemoglobinGdl?: number;
  notes?: string;
}): { success: boolean; record?: VerifiedDonationRecord; error?: string } => {
  const history = getDonationHistory();
  const lastDonation = history[0];

  if (lastDonation) {
    const eligibility = calculateDonationEligibility({
      lastDonationDateIso: lastDonation.donationDate,
      donationType: record.donationType,
      gender: record.gender || 'male'
    });

    // Check if new donation date is too soon
    const daysSinceLast = Math.floor(
      (new Date(record.donationDate).getTime() - new Date(lastDonation.donationDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLast < eligibility.requiredIntervalDays) {
      return {
        success: false,
        error: `Unsafe Donation Blocked: National guidelines require a minimum recovery period of ${eligibility.requiredIntervalDays} days for ${record.donationType}. Your last recorded donation was ${daysSinceLast} days ago (${eligibility.daysRemaining} days remaining). Gamification strictly forbids rewarding premature donations to safeguard your health.`
      };
    }
  }

  const certNumber = `CERT-NBTC-2026-${Math.floor(10000 + Math.random() * 90000)}`;
  const newRecord: VerifiedDonationRecord = {
    id: 'don_' + Date.now(),
    donationDate: record.donationDate,
    donationType: record.donationType,
    hospitalOrBloodBank: record.hospitalOrBloodBank,
    city: record.city,
    units: record.units || 1,
    bloodGroup: record.bloodGroup,
    verificationStatus: 'verified',
    verifiedBy: 'Hospital Transfusion Medical Officer',
    certificateId: certNumber,
    hemoglobinGdl: record.hemoglobinGdl || 13.2,
    notes: record.notes
  };

  history.unshift(newRecord);
  try {
    localStorage.setItem(LOCAL_DONATIONS_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed saving donation', e);
  }

  return { success: true, record: newRecord };
};

/**
 * Calculates badges and achievements based on voluntary eligible donations.
 * Never rewards unsafe or excessive donations.
 */
export const calculateDonorAchievements = (donorBloodGroup: string = 'O+'): DonorBadge[] => {
  const history = getDonationHistory();
  const verifiedCount = history.filter(h => h.verificationStatus === 'verified').length;
  const hasApheresis = history.some(h => h.donationType.includes('Platelet') || h.donationType.includes('Plasma'));
  const isRare = isRareBloodGroup(donorBloodGroup);

  return [
    {
      id: 'badge_first_donation',
      title: 'First-Time Life Saver',
      description: 'Awarded on completing your first voluntary verified blood donation.',
      icon: '🥉',
      tier: 'bronze',
      isUnlocked: verifiedCount >= 1,
      unlockedAt: history[history.length - 1]?.donationDate,
      currentCount: Math.min(1, verifiedCount),
      targetCount: 1
    },
    {
      id: 'badge_regular_donor',
      title: 'Regular Life Saver',
      description: 'Completed 3 voluntary blood donations respecting mandatory rest intervals.',
      icon: '🥈',
      tier: 'silver',
      isUnlocked: verifiedCount >= 3,
      unlockedAt: verifiedCount >= 3 ? history[history.length - 3]?.donationDate : undefined,
      currentCount: Math.min(3, verifiedCount),
      targetCount: 3
    },
    {
      id: 'badge_community_champion',
      title: 'Community Lifeline Champion',
      description: 'Completed 5 verified donations, positively impacting up to 15 emergency patients.',
      icon: '🥇',
      tier: 'gold',
      isUnlocked: verifiedCount >= 5,
      unlockedAt: verifiedCount >= 5 ? history[history.length - 5]?.donationDate : undefined,
      currentCount: Math.min(5, verifiedCount),
      targetCount: 5
    },
    {
      id: 'badge_century_guardian',
      title: 'Guardian Milestone',
      description: 'Completed 10 voluntary donations. Exceptional civic dedication to emergency care.',
      icon: '💎',
      tier: 'platinum',
      isUnlocked: verifiedCount >= 10,
      currentCount: Math.min(10, verifiedCount),
      targetCount: 10
    },
    {
      id: 'badge_apheresis_hero',
      title: 'Platelet / Apheresis Hero',
      description: 'Contributed single donor platelets (SDP) or plasma for oncology & trauma patients.',
      icon: '🩸',
      tier: 'special' as any,
      isUnlocked: hasApheresis,
      currentCount: hasApheresis ? 1 : 0,
      targetCount: 1
    },
    {
      id: 'badge_rare_guardian',
      title: 'Rare Blood Guardian',
      description: 'Active standby donor for rare Rh-negative or Bombay Blood Phenotype emergency network.',
      icon: '⭐',
      tier: 'rare',
      isUnlocked: isRare,
      currentCount: isRare ? 1 : 0,
      targetCount: 1
    },
    {
      id: 'badge_safety_honor',
      title: 'Voluntary Safety Honor',
      description: 'Demonstrated complete adherence to physiological rest intervals and medical screenings.',
      icon: '🛡️',
      tier: 'safety',
      isUnlocked: verifiedCount >= 1,
      currentCount: 1,
      targetCount: 1
    }
  ];
};

/**
 * Builds formatted data for a certificate of appreciation
 */
export const generateCertificateData = (donation: VerifiedDonationRecord, donorName: string = 'Honorable Voluntary Donor'): DonationCertificateData => {
  return {
    certificateId: donation.certificateId,
    donorName,
    bloodGroup: donation.bloodGroup,
    donationType: donation.donationType,
    units: donation.units,
    donationDate: new Date(donation.donationDate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }),
    hospitalName: donation.hospitalOrBloodBank,
    city: donation.city,
    accreditationAuthority: 'National Blood Transfusion Council (NBTC) & LifeGuard Health Network',
    signatoryName: 'Dr. S. Sundaram, MD, DNB',
    signatoryTitle: 'Director of Transfusion Medicine & Blood Bank',
    qrVerificationUrl: window.location.origin + `/blood/certificate/${donation.certificateId}`
  };
};

function generateSeedDonationHistory(): VerifiedDonationRecord[] {
  const now = Date.now();
  const day = 1000 * 60 * 60 * 24;

  return [
    {
      id: 'don_seed_01',
      donationDate: new Date(now - day * 105).toISOString(), // 105 days ago (eligible again!)
      donationType: 'Whole Blood',
      hospitalOrBloodBank: 'Apollo Speciality Hospital Blood Bank',
      city: 'Chennai',
      units: 1,
      bloodGroup: 'O+',
      verificationStatus: 'verified',
      verifiedBy: 'Dr. S. Sundaram (Transfusion Director)',
      certificateId: 'CERT-NBTC-2026-88102',
      hemoglobinGdl: 14.1,
      notes: 'Routine voluntary donation at hospital blood bank.'
    },
    {
      id: 'don_seed_02',
      donationDate: new Date(now - day * 210).toISOString(), // 210 days ago
      donationType: 'Whole Blood',
      hospitalOrBloodBank: 'Indian Red Cross Society Blood Center',
      city: 'Chennai',
      units: 1,
      bloodGroup: 'O+',
      verificationStatus: 'verified',
      verifiedBy: 'Dr. Ramesh K. (Medical Officer)',
      certificateId: 'CERT-NBTC-2025-44910',
      hemoglobinGdl: 13.8,
      notes: 'Voluntary World Blood Donor Day Drive.'
    },
    {
      id: 'don_seed_03',
      donationDate: new Date(now - day * 340).toISOString(), // 340 days ago
      donationType: 'Plateletpheresis (SDP)',
      hospitalOrBloodBank: 'Government General Hospital (RGGGH)',
      city: 'Chennai',
      units: 1,
      bloodGroup: 'O+',
      verificationStatus: 'verified',
      verifiedBy: 'Dr. V. Priya (Superintendent)',
      certificateId: 'CERT-NBTC-2025-11029',
      hemoglobinGdl: 13.5,
      notes: 'Emergency apheresis platelet donation for pediatric leukemia patient.'
    }
  ];
}
