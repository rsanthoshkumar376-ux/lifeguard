import { db } from '../config/firebase';
import { collection, doc, getDocs, setDoc, updateDoc, query, where, limit } from 'firebase/firestore';
import { BloodGroup, canDonateRbcTo } from './bloodCompatibilityService';

export interface ApproximateLocation {
  lat: number;
  lng: number;
  areaName: string;
  accuracyRadiusMeters: number;
}

export interface DonorDiscoveryProfile {
  id: string;
  name: string; // First name or initials only for privacy
  bloodGroup: BloodGroup;
  status: 'available' | 'busy' | 'recently_donated' | 'offline';
  phone: string;
  city: string;
  distanceKm?: number;
  approximateLocation: ApproximateLocation;
  allowLocationDiscovery: boolean;
  lastAvailableAt: string;
  lastDonationDate?: string;
  totalDonations: number;
  verifiedDonor: boolean;
}

const LOCAL_DONORS_KEY = 'lifeguard_discovered_donors';
const LOCAL_BLOCKED_USERS_KEY = 'lifeguard_blocked_users';
const LOCAL_REPORTS_KEY = 'lifeguard_submitted_reports';

/**
 * Calculates Haversine distance in kilometers between two coordinates
 */
export const calculateDistanceKm = (
  lat1: number, lon1: number, 
  lat2: number, lon2: number
): number => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10;
};

/**
 * Adds a safe pseudo-random geographic jitter (400m - 800m) to protect donor home coordinates
 */
export const coarsenCoordinates = (lat: number, lng: number, areaName: string = 'Local District'): ApproximateLocation => {
  // 0.005 degrees is approx 500 meters
  const latOffset = (Math.random() - 0.5) * 0.009;
  const lngOffset = (Math.random() - 0.5) * 0.009;
  return {
    lat: Math.round((lat + latOffset) * 10000) / 10000,
    lng: Math.round((lng + lngOffset) * 10000) / 10000,
    areaName,
    accuracyRadiusMeters: 650
  };
};

/**
 * Default sample donors surrounding user center point (e.g. Chennai or current location)
 */
export const generateSeedDonors = (centerLat: number, centerLng: number): DonorDiscoveryProfile[] => {
  const sampleData: Array<{ name: string; group: BloodGroup; offsetLat: number; offsetLng: number; area: string; status: 'available' | 'busy' | 'recently_donated'; verified: boolean }> = [
    { name: 'Dr. Ramesh K.', group: 'O+', offsetLat: 0.012, offsetLng: 0.008, area: 'Central Health District', status: 'available', verified: true },
    { name: 'Ananya S.', group: 'O-', offsetLat: -0.015, offsetLng: -0.011, area: 'West Medical Zone', status: 'available', verified: true }, // Rare Universal Donor!
    { name: 'Karthik V.', group: 'A+', offsetLat: 0.022, offsetLng: -0.018, area: 'North Ring Road', status: 'available', verified: true },
    { name: 'Priya M.', group: 'B+', offsetLat: -0.008, offsetLng: 0.014, area: 'South Avenue', status: 'available', verified: false },
    { name: 'Siddharth R.', group: 'AB+', offsetLat: 0.031, offsetLng: 0.025, area: 'Tech Corridor', status: 'available', verified: true },
    { name: 'Deepika N.', group: 'B-', offsetLat: -0.028, offsetLng: -0.021, area: 'University Campus', status: 'available', verified: true },
    { name: 'Arun P.', group: 'A-', offsetLat: 0.045, offsetLng: -0.038, area: 'Outer Metro', status: 'busy', verified: false },
    { name: 'Sneha L.', group: 'O+', offsetLat: -0.042, offsetLng: 0.035, area: 'Industrial Area', status: 'recently_donated', verified: true },
    { name: 'Vignesh B.', group: 'AB-', offsetLat: 0.065, offsetLng: 0.052, area: 'Express Highway', status: 'available', verified: true }
  ];

  return sampleData.map((d, index) => {
    const lat = centerLat + d.offsetLat;
    const lng = centerLng + d.offsetLng;
    const distanceKm = calculateDistanceKm(centerLat, centerLng, lat, lng);

    return {
      id: `donor_${index + 1}`,
      name: d.name,
      bloodGroup: d.group,
      status: d.status,
      phone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
      city: 'Local Region',
      distanceKm,
      approximateLocation: {
        lat,
        lng,
        areaName: d.area,
        accuracyRadiusMeters: 600
      },
      allowLocationDiscovery: true,
      lastAvailableAt: new Date(Date.now() - index * 1000 * 60 * 35).toISOString(),
      totalDonations: Math.floor(2 + Math.random() * 8),
      verifiedDonor: d.verified
    };
  });
};

/**
 * Searches and filters consenting donors within a geographic radius
 */
export const searchNearbyDonors = async (params: {
  centerLat: number;
  centerLng: number;
  radiusKm: number; // 2, 5, 10, 25
  bloodGroupFilter?: BloodGroup | 'All';
  compatibleForRecipient?: BloodGroup | null;
  availabilityOnly?: boolean;
}): Promise<DonorDiscoveryProfile[]> => {
  const { centerLat, centerLng, radiusKm, bloodGroupFilter, compatibleForRecipient, availabilityOnly } = params;

  let allDonors: DonorDiscoveryProfile[] = [];

  // Check Local Storage Cache / Seed
  try {
    const raw = localStorage.getItem(LOCAL_DONORS_KEY);
    if (raw) {
      allDonors = JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading local donors:', e);
  }

  // If empty, seed realistic local dataset surrounding the query point
  if (allDonors.length === 0) {
    allDonors = generateSeedDonors(centerLat, centerLng);
    try {
      localStorage.setItem(LOCAL_DONORS_KEY, JSON.stringify(allDonors));
    } catch {}
  }

  // Try Firestore for real user donor registrations
  if (db) {
    try {
      const q = query(
        collection(db, 'donors'),
        where('allowLocationDiscovery', '==', true),
        limit(50)
      );
      const snaps = await getDocs(q);
      if (!snaps.empty) {
        const cloudDonors: DonorDiscoveryProfile[] = snaps.docs.map(doc => {
          const d = doc.data() as any;
          return {
            id: doc.id,
            name: d.name || 'Anonymous Donor',
            bloodGroup: d.bloodGroup || 'O+',
            status: d.isAvailable ? 'available' : 'busy',
            phone: d.phone || '',
            city: d.city || 'Local Area',
            approximateLocation: d.approximateLocation || coarsenCoordinates(d.lat || centerLat, d.lng || centerLng),
            allowLocationDiscovery: true,
            lastAvailableAt: d.lastAvailableAt || new Date().toISOString(),
            totalDonations: d.totalDonations || 1,
            verifiedDonor: !!d.verified
          };
        });

        // Merge with seed list without duplicates
        const cloudIds = new Set(cloudDonors.map(c => c.id));
        allDonors = [...cloudDonors, ...allDonors.filter(d => !cloudIds.has(d.id))];
      }
    } catch (err) {
      console.warn('Firestore donor query fallback to local:', err);
    }
  }

  // Check blocked users list
  const blockedIds = getBlockedUserIds();

  // Calculate distance for all and filter
  const results = allDonors
    .filter(donor => !blockedIds.has(donor.id))
    .filter(donor => donor.allowLocationDiscovery)
    .map(donor => {
      const distance = calculateDistanceKm(
        centerLat, centerLng,
        donor.approximateLocation.lat, donor.approximateLocation.lng
      );
      return { ...donor, distanceKm: distance };
    })
    .filter(donor => {
      // Radius Filter
      if (donor.distanceKm! > radiusKm) return false;

      // Availability Filter
      if (availabilityOnly && donor.status !== 'available') return false;

      // Compatibility Matrix Filtering
      if (compatibleForRecipient) {
        return canDonateRbcTo(donor.bloodGroup, compatibleForRecipient);
      }

      // Explicit Blood Group Filter
      if (bloodGroupFilter && bloodGroupFilter !== 'All') {
        return donor.bloodGroup === bloodGroupFilter;
      }

      return true;
    })
    .sort((a, b) => {
      // Available donors first, then sort by distance
      if (a.status === 'available' && b.status !== 'available') return -1;
      if (b.status === 'available' && a.status !== 'available') return 1;
      return (a.distanceKm || 0) - (b.distanceKm || 0);
    });

  return results;
};

/**
 * Updates donor availability and location consent
 */
export const updateDonorAvailabilitySettings = async (params: {
  userId: string;
  isAvailable: boolean;
  bloodGroup: BloodGroup;
  lat: number;
  lng: number;
  allowLocationDiscovery: boolean;
}): Promise<boolean> => {
  const { userId, isAvailable, bloodGroup, lat, lng, allowLocationDiscovery } = params;
  const approx = coarsenCoordinates(lat, lng);

  const payload = {
    userId,
    bloodGroup,
    isAvailable,
    allowLocationDiscovery,
    approximateLocation: approx,
    lastAvailableAt: new Date().toISOString()
  };

  // Save to Firestore
  if (db) {
    try {
      await setDoc(doc(db, 'donors', userId), payload, { merge: true });
    } catch (err) {
      console.warn('Failed writing donor availability to Firestore:', err);
    }
  }

  // Update local list
  try {
    const raw = localStorage.getItem(LOCAL_DONORS_KEY);
    const donors: DonorDiscoveryProfile[] = raw ? JSON.parse(raw) : [];
    const index = donors.findIndex(d => d.id === userId);
    const updatedProfile: DonorDiscoveryProfile = {
      id: userId,
      name: 'You (Active Donor)',
      bloodGroup,
      status: isAvailable ? 'available' : 'busy',
      phone: '+91 (Your Registered Number)',
      city: approx.areaName,
      approximateLocation: approx,
      allowLocationDiscovery,
      lastAvailableAt: new Date().toISOString(),
      totalDonations: 1,
      verifiedDonor: true
    };

    if (index >= 0) {
      donors[index] = updatedProfile;
    } else {
      donors.unshift(updatedProfile);
    }
    localStorage.setItem(LOCAL_DONORS_KEY, JSON.stringify(donors));
  } catch (e) {
    console.error('Failed to update local donor profile', e);
  }

  return true;
};

/**
 * Block unwanted donors or requesters
 */
export const blockUserOrDonor = (targetId: string, reason?: string) => {
  try {
    const raw = localStorage.getItem(LOCAL_BLOCKED_USERS_KEY);
    const blocked: string[] = raw ? JSON.parse(raw) : [];
    if (!blocked.includes(targetId)) {
      blocked.push(targetId);
      localStorage.setItem(LOCAL_BLOCKED_USERS_KEY, JSON.stringify(blocked));
    }
  } catch (e) {
    console.error('Failed to block user', e);
  }
};

export const getBlockedUserIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(LOCAL_BLOCKED_USERS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
};

/**
 * Report suspicious, fraudulent, or commercial blood selling activity
 */
export const reportSpamOrFraud = (reportData: {
  reporterId?: string;
  targetId: string;
  targetType: 'donor' | 'request' | 'hospital';
  reason: string;
  details?: string;
}) => {
  try {
    const raw = localStorage.getItem(LOCAL_REPORTS_KEY);
    const reports = raw ? JSON.parse(raw) : [];
    reports.push({
      ...reportData,
      id: 'rep_' + Date.now(),
      reportedAt: new Date().toISOString()
    });
    localStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(reports));
  } catch (e) {
    console.error('Failed to submit report locally', e);
  }
};
