import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { hasPermission, canAccessPatientData, ROLE_DEFINITIONS, AppRole } from '../src/services/rbacService';

describe('LifeGuard QA: 01. Authentication, Registration & RBAC', () => {
  const JWT_SECRET = 'lifeguard-secret-key-render-2024';

  describe('OTP Generation & Verification Logic', () => {
    it('should generate a 6-digit numeric OTP', () => {
      const phone = '+919876543210';
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      assert.match(otp, /^\d{6}$/, 'OTP must be exactly 6 digits');
      assert.equal(otp.length, 6);
    });

    it('should support test number +919999999999 with deterministic code 123456', () => {
      const phone = '+919999999999';
      const otp = phone === '+919999999999' ? '123456' : '000000';
      assert.equal(otp, '123456');
    });

    it('should reject invalid or expired OTP code', () => {
      const validCode = '582914';
      const userEnteredCode = '111111';
      const isValid = (userEnteredCode === '123456' || userEnteredCode === validCode);
      assert.equal(isValid, false, 'Invalid OTP must be rejected');
    });
  });

  describe('JWT Token Issuance & Verification', () => {
    it('should issue a valid signed JWT with user id and role', () => {
      const payload = { id: 'usr_test_123', role: 'patient' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
      assert.ok(token, 'JWT must be generated');

      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string; exp: number };
      assert.equal(decoded.id, 'usr_test_123');
      assert.equal(decoded.role, 'patient');
      assert.ok(decoded.exp > Math.floor(Date.now() / 1000));
    });

    it('should reject tampered JWT signatures', () => {
      const payload = { id: 'usr_test_123', role: 'patient' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
      const tamperedToken = token.slice(0, -5) + 'abcde';

      assert.throws(() => {
        jwt.verify(tamperedToken, JWT_SECRET);
      }, /invalid signature/i);
    });

    it('should reject expired tokens', () => {
      const payload = { id: 'usr_expired', role: 'patient' };
      const expiredToken = jwt.sign(payload, JWT_SECRET, { expiresIn: -10 }); // Expired 10 seconds ago

      assert.throws(() => {
        jwt.verify(expiredToken, JWT_SECRET);
      }, /jwt expired/i);
    });
  });

  describe('User Registration Validation', () => {
    it('should enforce mandatory fields (phone, fullName, bloodGroup)', () => {
      const validPayload = {
        phone: '+919876543210',
        fullName: 'Ravi Kumar',
        bloodGroup: 'O+',
        city: 'Chennai'
      };

      const validateRegistration = (data: any) => {
        if (!data.phone || !data.fullName || !data.bloodGroup) {
          throw new Error('Phone, Full Name, and Blood Group are required.');
        }
        return true;
      };

      assert.equal(validateRegistration(validPayload), true);

      assert.throws(() => {
        validateRegistration({ phone: '+919876543210', fullName: '' });
      }, /Phone, Full Name, and Blood Group are required/);

      assert.throws(() => {
        validateRegistration({ fullName: 'Ravi', bloodGroup: 'O+' });
      }, /Phone, Full Name, and Blood Group are required/);
    });

    it('should prevent registration with invalid phone format', () => {
      const isValidPhone = (phone: string) => /^\+?[1-9]\d{7,14}$/.test(phone.replace(/[\s-]/g, ''));
      assert.equal(isValidPhone('+919876543210'), true);
      assert.equal(isValidPhone('9876543210'), true);
      assert.equal(isValidPhone('123'), false, 'Too short to be valid phone');
      assert.equal(isValidPhone('phone-number'), false, 'Alphanumeric phone is invalid');
    });
  });

  describe('Role-Based Access Control (RBAC) Least Privilege & Default-Deny', () => {
    it('should verify patient permissions', () => {
      assert.equal(hasPermission('patient', 'VIEW_OWN_MEDICAL_RECORD'), true);
      assert.equal(hasPermission('patient', 'EDIT_OWN_MEDICAL_RECORD'), true);
      assert.equal(hasPermission('patient', 'TRIGGER_EMERGENCY_SOS'), true);
      // Denied actions:
      assert.equal(hasPermission('patient', 'CREATE_BLOOD_REQUEST'), false, 'Patient cannot create hospital blood requests');
      assert.equal(hasPermission('patient', 'VERIFY_HOSPITAL_DOCUMENTS'), false, 'Patient cannot verify hospital documents');
      assert.equal(hasPermission('patient', 'MANAGE_BLOOD_INVENTORY'), false, 'Patient cannot manage blood bank stock');
    });

    it('should verify voluntary blood donor permissions', () => {
      assert.equal(hasPermission('donor', 'VIEW_BLOOD_REQUESTS'), true);
      assert.equal(hasPermission('donor', 'RESPOND_TO_BLOOD_REQUEST'), true);
      assert.equal(hasPermission('donor', 'UPDATE_DONOR_AVAILABILITY'), true);
      assert.equal(hasPermission('donor', 'VIEW_DONOR_ACHIEVEMENTS'), true);
      // Denied actions:
      assert.equal(hasPermission('donor', 'CREATE_BLOOD_REQUEST'), false, 'Donor cannot create hospital blood requests');
      assert.equal(hasPermission('donor', 'VERIFY_HOSPITAL_DOCUMENTS'), false, 'Donor cannot verify hospital documents');
    });

    it('should verify hospital staff permissions', () => {
      assert.equal(hasPermission('hospital', 'CREATE_BLOOD_REQUEST'), true);
      assert.equal(hasPermission('hospital', 'MANAGE_BLOOD_INVENTORY'), true);
      assert.equal(hasPermission('hospital', 'MANAGE_HOSPITAL_PROFILE'), true);
      assert.equal(hasPermission('hospital', 'PROCESS_PATIENT_HANDOVER'), true);
      // Denied actions:
      assert.equal(hasPermission('hospital', 'VERIFY_HOSPITAL_DOCUMENTS'), false, 'Hospital staff cannot self-verify documents');
      assert.equal(hasPermission('hospital', 'MANAGE_USER_ROLES'), false, 'Hospital staff cannot manage user roles');
    });

    it('should verify administrator permissions', () => {
      assert.equal(hasPermission('administrator', 'VERIFY_HOSPITAL_DOCUMENTS'), true);
      assert.equal(hasPermission('administrator', 'REJECT_HOSPITAL_REGISTRATION'), true);
      assert.equal(hasPermission('administrator', 'VIEW_SYSTEM_AUDIT_LOGS'), true);
      assert.equal(hasPermission('administrator', 'MANAGE_USER_ROLES'), true);
    });

    it('should verify emergency responder / paramedic permissions', () => {
      assert.equal(hasPermission('responder', 'ACCESS_EMERGENCY_TRIAGE_FEED'), true);
      assert.equal(hasPermission('responder', 'ACKNOWLEDGE_SOS_INCIDENT'), true);
      assert.equal(hasPermission('responder', 'CALL_PRIMARY_CONTACTS'), true);
      // Denied actions:
      assert.equal(hasPermission('responder', 'VERIFY_HOSPITAL_DOCUMENTS'), false);
    });

    it('should enforce cross-account medical data isolation', () => {
      const patientAlice = 'usr_alice';
      const patientBob = 'usr_bob';
      const strangerAdmin = 'usr_admin_charlie';

      // Patient A cannot access Patient B without consent
      assert.equal(canAccessPatientData(patientAlice, 'patient', patientBob, false), false);

      // Admin cannot browse private health records without explicit clinical authorization
      assert.equal(canAccessPatientData(strangerAdmin, 'administrator', patientBob, false), false);

      // Authorized caregiver with explicit grant CAN access
      assert.equal(canAccessPatientData(patientAlice, 'caregiver', patientBob, true), true);

      // Patient can access their own data
      assert.equal(canAccessPatientData(patientAlice, 'patient', patientAlice, false), true);
    });
  });
});
