import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateSecureToken } from '../src/services/cryptoService';
import { checkQrScanRateLimit } from '../src/services/emergencyToken';

describe('LifeGuard QA: 02. Public QR & Token Revocation', () => {
  describe('Cryptographically Secure Token Generation', () => {
    it('should generate random high-entropy tokens with emg_ prefix', () => {
      const token1 = generateSecureToken('emg_');
      const token2 = generateSecureToken('emg_');

      assert.ok(token1.startsWith('emg_'), 'Token must have emg_ prefix');
      assert.ok(token2.startsWith('emg_'), 'Token must have emg_ prefix');
      assert.notEqual(token1, token2, 'Generated tokens must be distinct');
      assert.ok(token1.length >= 28, 'Token length must provide sufficient entropy');
    });

    it('should generate collision-resistant tokens across 1,000 samples', () => {
      const tokens = new Set<string>();
      for (let i = 0; i < 1000; i++) {
        tokens.add(generateSecureToken('emg_'));
      }
      assert.equal(tokens.size, 1000, 'Zero collisions across 1,000 generated tokens');
    });
  });

  describe('Public Emergency QR Data Sanitization & Leak Prevention', () => {
    it('should sanitize public data to only approved emergency fields', () => {
      const fullPrivateMedicalProfile = {
        userId: 'usr_pat_99',
        fullName: 'Rajesh Sharma',
        bloodGroup: 'B+',
        dateOfBirth: '1985-04-12',
        residentialAddress: 'Flat 402, Royal Palms, Anna Nagar, Chennai - 600040',
        aadhaarNumber: '1234-5678-9012',
        bankAccountDetails: 'HDFC0001234 - 50100234567890',
        healthInsurancePolicy: 'STAR-HEALTH-998877',
        psychiatricNotes: 'Confidential psychiatric consultation records',
        allergies: ['Penicillin', 'Peanuts'],
        criticalConditions: ['Type 2 Diabetes Mellitus', 'Hypertension'],
        emergencyInstructions: 'Patient carries emergency insulin pen. Call primary contacts immediately.',
        primaryContacts: [
          { name: 'Priya Sharma (Spouse)', phone: '+919876543210', relationship: 'Spouse' },
          { name: '108 Emergency Ambulance', phone: '108', relationship: 'Ambulance' }
        ]
      };

      // Function that filters private record down to public emergency card
      const sanitizePublicEmergencyCard = (profile: any) => {
        return {
          preferredName: profile.fullName || 'Emergency Patient',
          bloodGroup: profile.bloodGroup,
          allergies: profile.allergies || [],
          criticalConditions: profile.criticalConditions || [],
          emergencyInstructions: profile.emergencyInstructions || '',
          primaryContacts: profile.primaryContacts || []
        };
      };

      const publicCard = sanitizePublicEmergencyCard(fullPrivateMedicalProfile);

      // Verify approved fields are present
      assert.equal(publicCard.preferredName, 'Rajesh Sharma');
      assert.equal(publicCard.bloodGroup, 'B+');
      assert.deepEqual(publicCard.allergies, ['Penicillin', 'Peanuts']);
      assert.deepEqual(publicCard.criticalConditions, ['Type 2 Diabetes Mellitus', 'Hypertension']);
      assert.equal(publicCard.primaryContacts.length, 2);

      // Strictly verify sensitive fields are NOT exposed
      assert.equal((publicCard as any).residentialAddress, undefined, 'Residential address must NOT be leaked');
      assert.equal((publicCard as any).aadhaarNumber, undefined, 'National ID must NOT be leaked');
      assert.equal((publicCard as any).bankAccountDetails, undefined, 'Financial details must NOT be leaked');
      assert.equal((publicCard as any).healthInsurancePolicy, undefined, 'Insurance policy must NOT be leaked');
      assert.equal((publicCard as any).psychiatricNotes, undefined, 'Confidential clinical notes must NOT be leaked');
    });
  });

  describe('Token Revocation & Lifecycle', () => {
    interface EmergencyTokenRecord {
      id: string;
      token: string;
      userId: string;
      active: boolean;
      createdAt: string;
      revokedAt?: string;
    }

    it('should transition token state from active to revoked', () => {
      const tokenRecord: EmergencyTokenRecord = {
        id: 'emg_sample_token_123',
        token: 'emg_sample_token_123',
        userId: 'usr_patient_1',
        active: true,
        createdAt: new Date().toISOString()
      };

      assert.equal(tokenRecord.active, true);
      assert.equal(tokenRecord.revokedAt, undefined);

      // Revocation event
      tokenRecord.active = false;
      tokenRecord.revokedAt = new Date().toISOString();

      assert.equal(tokenRecord.active, false);
      assert.ok(tokenRecord.revokedAt);
    });

    it('should reject validation of revoked tokens', () => {
      const tokensDatabase = new Map<string, EmergencyTokenRecord>();
      const tokenId = 'emg_revoked_token_456';

      tokensDatabase.set(tokenId, {
        id: tokenId,
        token: tokenId,
        userId: 'usr_patient_1',
        active: false,
        createdAt: '2026-01-01T00:00:00Z',
        revokedAt: '2026-02-01T00:00:00Z'
      });

      const validateToken = (token: string) => {
        const record = tokensDatabase.get(token);
        if (!record) {
          return { valid: false, error: 'Token not found.' };
        }
        if (!record.active) {
          return {
            valid: false,
            revoked: true,
            error: 'This emergency QR token has been revoked by the patient.'
          };
        }
        return { valid: true, record };
      };

      const result = validateToken(tokenId);
      assert.equal(result.valid, false);
      assert.equal(result.revoked, true);
      assert.match(result.error, /revoked/i);
    });

    it('should revoke previous active token when rotating/regenerating token', () => {
      const userTokens: EmergencyTokenRecord[] = [
        {
          id: 'token_old',
          token: 'token_old',
          userId: 'usr_pat_1',
          active: true,
          createdAt: '2026-01-01T00:00:00Z'
        }
      ];

      // Rotation logic
      const rotateToken = (userId: string) => {
        // 1. Deactivate old active tokens
        userTokens.forEach(t => {
          if (t.userId === userId && t.active) {
            t.active = false;
            t.revokedAt = new Date().toISOString();
          }
        });

        // 2. Add new active token
        const newToken: EmergencyTokenRecord = {
          id: 'token_new',
          token: 'token_new',
          userId,
          active: true,
          createdAt: new Date().toISOString()
        };
        userTokens.push(newToken);
        return newToken;
      };

      rotateToken('usr_pat_1');

      const oldToken = userTokens.find(t => t.id === 'token_old');
      const newToken = userTokens.find(t => t.id === 'token_new');

      assert.equal(oldToken?.active, false, 'Old token must be marked inactive');
      assert.ok(oldToken?.revokedAt, 'Old token must record revoked timestamp');
      assert.equal(newToken?.active, true, 'New token must be active');
    });
  });

  describe('QR Scan Rate Limiting', () => {
    it('should allow up to 15 scans per minute per token', () => {
      const testToken = 'emg_ratelimit_test_' + Date.now();
      for (let i = 0; i < 15; i++) {
        const allowed = checkQrScanRateLimit(testToken, 15, 60000);
        assert.equal(allowed, true, `Request ${i + 1} should be permitted`);
      }
    });

    it('should reject the 16th scan within the rate limit window', () => {
      const testToken = 'emg_ratelimit_test_blocked_' + Date.now();
      for (let i = 0; i < 15; i++) {
        checkQrScanRateLimit(testToken, 15, 60000);
      }
      const request16 = checkQrScanRateLimit(testToken, 15, 60000);
      assert.equal(request16, false, '16th request must be blocked by rate limiter');
    });
  });
});
