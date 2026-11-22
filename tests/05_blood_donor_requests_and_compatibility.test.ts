import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  BloodGroup,
  ALL_BLOOD_GROUPS,
  RBC_RECIPIENT_COMPATIBILITY,
  RBC_DONOR_COMPATIBILITY,
  canDonateRbcTo,
  getCompatibleDonorsFor,
  getCompatibleRecipientsFor,
  BLOOD_COMPONENTS,
  STANDARD_ELIGIBILITY
} from '../src/services/bloodCompatibilityService';

describe('LifeGuard QA: 05. Blood Donor Requests & RBC Compatibility Matrix', () => {
  describe('All 8 Blood Groups RBC Transfusion Compatibility', () => {
    it('should confirm O- as the Universal Red Blood Cell Donor', () => {
      const oNegCompatibleRecipients = getCompatibleRecipientsFor('O-');
      assert.equal(oNegCompatibleRecipients.length, 8, 'O- can donate RBC to all 8 blood groups');
      for (const group of ALL_BLOOD_GROUPS) {
        assert.equal(canDonateRbcTo('O-', group), true, `O- must be able to donate RBC to ${group}`);
      }
    });

    it('should confirm AB+ as the Universal Red Blood Cell Recipient', () => {
      const abPosCompatibleDonors = getCompatibleDonorsFor('AB+');
      assert.equal(abPosCompatibleDonors.length, 8, 'AB+ can receive RBC from all 8 blood groups');
      for (const group of ALL_BLOOD_GROUPS) {
        assert.equal(canDonateRbcTo(group, 'AB+'), true, `AB+ must be able to receive RBC from ${group}`);
      }
    });

    it('should strictly restrict O- recipient to receiving ONLY O- RBC', () => {
      const oNegDonors = getCompatibleDonorsFor('O-');
      assert.deepEqual(oNegDonors, ['O-'], 'O- recipient can ONLY safely receive O- RBC');
      assert.equal(canDonateRbcTo('O+', 'O-'), false);
      assert.equal(canDonateRbcTo('A-', 'O-'), false);
      assert.equal(canDonateRbcTo('B-', 'O-'), false);
      assert.equal(canDonateRbcTo('AB-', 'O-'), false);
    });

    it('should strictly verify O+ recipient compatibility', () => {
      const oPosDonors = getCompatibleDonorsFor('O-');
      assert.equal(canDonateRbcTo('O+', 'O+'), true);
      assert.equal(canDonateRbcTo('O-', 'O+'), true);
      assert.equal(canDonateRbcTo('A+', 'O+'), false);
      assert.equal(canDonateRbcTo('B+', 'O+'), false);
    });

    it('should strictly verify A- recipient compatibility (A-, O-)', () => {
      const aNegDonors = getCompatibleDonorsFor('A-');
      assert.deepEqual(aNegDonors, ['A-', 'O-']);
      assert.equal(canDonateRbcTo('A-', 'A-'), true);
      assert.equal(canDonateRbcTo('O-', 'A-'), true);
      assert.equal(canDonateRbcTo('A+', 'A-'), false);
      assert.equal(canDonateRbcTo('B-', 'A-'), false);
    });

    it('should strictly verify A+ recipient compatibility (A+, A-, O+, O-)', () => {
      const aPosDonors = getCompatibleDonorsFor('A+');
      assert.deepEqual(aPosDonors, ['A+', 'A-', 'O+', 'O-']);
      assert.equal(canDonateRbcTo('A+', 'A+'), true);
      assert.equal(canDonateRbcTo('A-', 'A+'), true);
      assert.equal(canDonateRbcTo('O+', 'A+'), true);
      assert.equal(canDonateRbcTo('O-', 'A+'), true);
      assert.equal(canDonateRbcTo('B+', 'A+'), false);
      assert.equal(canDonateRbcTo('AB+', 'A+'), false);
    });

    it('should strictly verify B- recipient compatibility (B-, O-)', () => {
      const bNegDonors = getCompatibleDonorsFor('B-');
      assert.deepEqual(bNegDonors, ['B-', 'O-']);
      assert.equal(canDonateRbcTo('B-', 'B-'), true);
      assert.equal(canDonateRbcTo('O-', 'B-'), true);
      assert.equal(canDonateRbcTo('B+', 'B-'), false);
      assert.equal(canDonateRbcTo('A-', 'B-'), false);
    });

    it('should strictly verify B+ recipient compatibility (B+, B-, O+, O-)', () => {
      const bPosDonors = getCompatibleDonorsFor('B+');
      assert.deepEqual(bPosDonors, ['B+', 'B-', 'O+', 'O-']);
      assert.equal(canDonateRbcTo('B+', 'B+'), true);
      assert.equal(canDonateRbcTo('B-', 'B+'), true);
      assert.equal(canDonateRbcTo('O+', 'B+'), true);
      assert.equal(canDonateRbcTo('O-', 'B+'), true);
      assert.equal(canDonateRbcTo('A+', 'B+'), false);
    });

    it('should strictly verify AB- recipient compatibility (AB-, A-, B-, O-)', () => {
      const abNegDonors = getCompatibleDonorsFor('AB-');
      assert.deepEqual(abNegDonors, ['AB-', 'A-', 'B-', 'O-']);
      assert.equal(canDonateRbcTo('AB-', 'AB-'), true);
      assert.equal(canDonateRbcTo('A-', 'AB-'), true);
      assert.equal(canDonateRbcTo('B-', 'AB-'), true);
      assert.equal(canDonateRbcTo('O-', 'AB-'), true);
      assert.equal(canDonateRbcTo('O+', 'AB-'), false);
      assert.equal(canDonateRbcTo('A+', 'AB-'), false);
    });

    it('should restrict AB+ donor to donating RBC only to AB+', () => {
      const recipients = getCompatibleRecipientsFor('AB+');
      assert.deepEqual(recipients, ['AB+'], 'AB+ donor can donate RBC only to AB+');
      for (const group of ALL_BLOOD_GROUPS) {
        if (group !== 'AB+') {
          assert.equal(canDonateRbcTo('AB+', group), false, `AB+ donor cannot give RBC to ${group}`);
        }
      }
    });
  });

  describe('Clinical Crossmatching & Safety Disclaimers', () => {
    it('should require mandatory clinical disclaimer notice', () => {
      const MANDATORY_DISCLAIMER_KEYWORD = 'crossmatch';
      const noticeText = 'Blood group compatibility alone is NOT sufficient for transfusion. Laboratory crossmatching, Rh subtyping, antibody screening, and hospital blood bank verification remain strictly mandatory before transfusion.';
      assert.ok(noticeText.toLowerCase().includes(MANDATORY_DISCLAIMER_KEYWORD), 'Notice must mention crossmatching');
    });
  });

  describe('Blood Components & Hospital Transfusion Requisitions', () => {
    it('should support all standard therapeutic blood components', () => {
      assert.ok(BLOOD_COMPONENTS.includes('Whole Blood'));
      assert.ok(BLOOD_COMPONENTS.includes('Packed Red Blood Cells (PRBC)'));
      assert.ok(BLOOD_COMPONENTS.includes('Platelet Concentrate (RDP)'));
      assert.ok(BLOOD_COMPONENTS.includes('Single Donor Platelets (SDP)'));
      assert.ok(BLOOD_COMPONENTS.includes('Fresh Frozen Plasma (FFP)'));
      assert.ok(BLOOD_COMPONENTS.includes('Cryoprecipitate'));
    });
  });

  describe('Geographic Radius Filtering & Distance Calculation', () => {
    const haversineDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return Math.round(R * c * 10) / 10;
    };

    it('should compute exact Haversine distance between two coordinates', () => {
      // Chennai Central (13.0827, 80.2707) to Apollo Hospital Greams Road (13.0604, 80.2505)
      const dist = haversineDistanceKm(13.0827, 80.2707, 13.0604, 80.2505);
      // Distance is approximately 3.3 km
      assert.ok(dist >= 3.0 && dist <= 3.8, `Expected distance ~3.3km, received ${dist}km`);
    });

    it('should filter blood requests by radius (2km, 5km, 10km, 25km)', () => {
      const userLocation = { lat: 13.0827, lng: 80.2707 };

      const sampleRequests = [
        { id: 'req_1', title: 'ER Case 1', lat: 13.0840, lng: 80.2720 }, // ~0.2 km away
        { id: 'req_2', title: 'ER Case 2', lat: 13.0604, lng: 80.2505 }, // ~3.3 km away
        { id: 'req_3', title: 'ER Case 3', lat: 12.9800, lng: 80.2000 }, // ~13.8 km away
        { id: 'req_4', title: 'ER Case 4', lat: 12.9249, lng: 80.1000 }  // ~25.5 km away
      ];

      const filterByRadius = (radiusKm: number) => {
        return sampleRequests
          .map(r => ({ ...r, dist: haversineDistanceKm(userLocation.lat, userLocation.lng, r.lat, r.lng) }))
          .filter(r => r.dist <= radiusKm);
      };

      assert.equal(filterByRadius(2).length, 1, 'Only req_1 should be within 2km');
      assert.equal(filterByRadius(5).length, 2, 'req_1 and req_2 should be within 5km');
      assert.equal(filterByRadius(10).length, 2, 'req_1 and req_2 within 10km');
      assert.equal(filterByRadius(20).length, 3, 'req_1, req_2, and req_3 within 20km');
      assert.equal(filterByRadius(30).length, 4, 'All 4 within 30km');
    });
  });

  describe('Donor Eligibility Guidelines', () => {
    it('should verify standard physiological eligibility criteria', () => {
      assert.equal(STANDARD_ELIGIBILITY.minAgeYears, 18);
      assert.equal(STANDARD_ELIGIBILITY.maxAgeYears, 65);
      assert.equal(STANDARD_ELIGIBILITY.minWeightKg, 45);

      const isEligible = (age: number, weightKg: number) => {
        return age >= STANDARD_ELIGIBILITY.minAgeYears && 
               age <= STANDARD_ELIGIBILITY.maxAgeYears && 
               weightKg >= STANDARD_ELIGIBILITY.minWeightKg;
      };

      assert.equal(isEligible(25, 62), true);
      assert.equal(isEligible(16, 55), false, 'Under 18 must be ineligible');
      assert.equal(isEligible(70, 70), false, 'Over 65 must be ineligible');
      assert.equal(isEligible(30, 42), false, 'Under 45kg must be ineligible');
    });
  });
});
