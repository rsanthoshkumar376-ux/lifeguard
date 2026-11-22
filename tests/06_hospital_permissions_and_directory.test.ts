import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('LifeGuard QA: 06. Hospital Permissions, Directory & Blood Bank Inventory', () => {
  interface HospitalEntity {
    id: string;
    name: string;
    licenseNumber: string;
    address: string;
    city: string;
    phone: string;
    email: string;
    verificationStatus: 'pending' | 'verified' | 'rejected' | 'suspended';
    rejectionReason?: string;
    has24HourEmergency: boolean;
    icuBedsTotal: number;
    icuBedsAvailable: number;
  }

  interface BloodInventoryItem {
    id: string;
    hospitalId: string;
    component: string;
    bloodGroup: string;
    availableUnits: number;
    expiryDate: string; // YYYY-MM-DD
    status: 'in_stock' | 'expiring_soon' | 'out_of_stock' | 'expired';
  }

  describe('Hospital Registration & Required Field Validation', () => {
    const registerHospital = (data: Partial<HospitalEntity>): HospitalEntity => {
      if (!data.name || !data.licenseNumber || !data.phone || !data.email) {
        throw new Error('Hospital name, statutory license number, phone, and official email are strictly required.');
      }

      return {
        id: 'hosp_' + Math.random().toString(36).substr(2, 9),
        name: data.name,
        licenseNumber: data.licenseNumber,
        address: data.address || '',
        city: data.city || '',
        phone: data.phone,
        email: data.email,
        verificationStatus: 'pending', // Initial state must be pending review
        has24HourEmergency: data.has24HourEmergency ?? true,
        icuBedsTotal: data.icuBedsTotal || 0,
        icuBedsAvailable: data.icuBedsAvailable || 0
      };
    };

    it('should register a hospital facility with pending verification status', () => {
      const hospital = registerHospital({
        name: 'Apollo Speciality Hospital',
        licenseNumber: 'TN-MED-EST-2024-8891',
        address: '21 Greams Lane, Thousand Lights',
        city: 'Chennai',
        phone: '+914428290200',
        email: 'er.desk@apollohospitals.example.com',
        has24HourEmergency: true,
        icuBedsTotal: 50,
        icuBedsAvailable: 12
      });

      assert.ok(hospital.id.startsWith('hosp_'));
      assert.equal(hospital.name, 'Apollo Speciality Hospital');
      assert.equal(hospital.verificationStatus, 'pending');
      assert.equal(hospital.has24HourEmergency, true);
    });

    it('should reject registration if statutory license number is omitted', () => {
      assert.throws(() => {
        registerHospital({
          name: 'Unlicensed Clinic',
          phone: '+919999999999',
          email: 'test@clinic.com'
        });
      }, /Hospital name, statutory license number, phone, and official email are strictly required/);
    });
  });

  describe('Administrator Hospital Verification Workflow', () => {
    it('should permit administrator to verify a pending hospital', () => {
      const hospital: HospitalEntity = {
        id: 'hosp_test_1',
        name: 'Government General Hospital',
        licenseNumber: 'TN-GOV-001',
        address: 'EVR Periyar Salai',
        city: 'Chennai',
        phone: '+914425305000',
        email: 'dean@gghchennai.gov.in',
        verificationStatus: 'pending',
        has24HourEmergency: true,
        icuBedsTotal: 100,
        icuBedsAvailable: 24
      };

      const verifyHospital = (callerRole: string, hosp: HospitalEntity) => {
        if (callerRole !== 'administrator' && callerRole !== 'admin') {
          throw new Error('Access Denied: Only administrators can verify hospital facilities.');
        }
        hosp.verificationStatus = 'verified';
        return hosp;
      };

      assert.throws(() => {
        verifyHospital('patient', hospital);
      }, /Access Denied/);

      assert.throws(() => {
        verifyHospital('hospital', hospital);
      }, /Access Denied/);

      const verified = verifyHospital('administrator', hospital);
      assert.equal(verified.verificationStatus, 'verified');
    });

    it('should permit administrator to reject registration with clinical reason', () => {
      const hospital: HospitalEntity = {
        id: 'hosp_test_2',
        name: 'Dubious Clinic',
        licenseNumber: 'INVALID-99',
        address: 'Unknown',
        city: 'Unknown',
        phone: '+910000000000',
        email: 'fake@fake.com',
        verificationStatus: 'pending',
        has24HourEmergency: false,
        icuBedsTotal: 0,
        icuBedsAvailable: 0
      };

      const rejectHospital = (callerRole: string, hosp: HospitalEntity, reason: string) => {
        if (callerRole !== 'administrator') throw new Error('Access Denied');
        hosp.verificationStatus = 'rejected';
        hosp.rejectionReason = reason;
        return hosp;
      };

      const rejected = rejectHospital('administrator', hospital, 'Invalid Clinical Establishment license certificate.');
      assert.equal(rejected.verificationStatus, 'rejected');
      assert.equal(rejected.rejectionReason, 'Invalid Clinical Establishment license certificate.');
    });
  });

  describe('Blood Bank Inventory & Stock Expiry Status', () => {
    const computeStockStatus = (availableUnits: number, expiryDateStr: string): BloodInventoryItem['status'] => {
      if (availableUnits <= 0) return 'out_of_stock';
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expiry = new Date(expiryDateStr);
      expiry.setHours(0, 0, 0, 0);

      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return 'expired';
      if (diffDays <= 7) return 'expiring_soon';
      return 'in_stock';
    };

    it('should mark stock as out_of_stock when available units is 0', () => {
      assert.equal(computeStockStatus(0, '2026-12-31'), 'out_of_stock');
    });

    it('should flag stock as expiring_soon when expiry is within 7 days', () => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 4);
      const expiryStr = nextWeek.toISOString().split('T')[0];

      assert.equal(computeStockStatus(5, expiryStr), 'expiring_soon');
    });

    it('should mark fresh stock as in_stock', () => {
      const future = new Date();
      future.setDate(future.getDate() + 25);
      const expiryStr = future.toISOString().split('T')[0];

      assert.equal(computeStockStatus(15, expiryStr), 'in_stock');
    });
  });
});
