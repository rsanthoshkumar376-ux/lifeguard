import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

describe('LifeGuard QA: 13. Firestore Security Rules & Authorization Model', () => {
  const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');

  describe('Global Security & Default Deny Enforcement', () => {
    it('should declare rules_version = 2 and cloud.firestore service', () => {
      assert.ok(rulesContent.includes("rules_version = '2';"), 'Rules version must be 2');
      assert.ok(rulesContent.includes('service cloud.firestore'), 'Must target cloud.firestore');
    });

    it('should NOT contain global open read/write wildcards', () => {
      // Prohibit dangerous patterns like: match /{document=**} { allow read, write: if true; }
      const dangerousPatterns = [
        /match\s+\/\{document=\*\*\}\s*\{\s*allow\s+read,\s*write:\s*if\s+true;/i,
        /match\s+\/\{document=\*\*\}\s*\{\s*allow\s+write:\s*if\s+true;/i,
        /allow\s+read,\s*write:\s*if\s+true;/i
      ];

      for (const pattern of dangerousPatterns) {
        assert.equal(pattern.test(rulesContent), false, `Forbidden dangerous rule pattern detected: ${pattern}`);
      }
    });
  });

  describe('User Role Escalation Prevention (/users/{userId})', () => {
    it('should prevent standard users from escalating to admin or hospital staff during account creation', () => {
      assert.ok(rulesContent.includes("request.resource.data.role in ['patient', 'user', 'donor', 'caregiver']"),
        'User registration must restrict self-selected roles to non-privileged roles');
    });

    it('should prohibit users from changing their existing role during profile updates', () => {
      assert.ok(rulesContent.includes('request.resource.data.role == resource.data.role') ||
                rulesContent.includes("request.resource.data.role in ['patient', 'user', 'donor', 'caregiver']"),
        'User updates must prevent privilege escalation to administrative roles');
    });
  });

  describe('Private Medical Records Isolation', () => {
    it('should strictly restrict medicalProfile to owner only', () => {
      assert.ok(rulesContent.includes('match /users/{userId}/medicalProfile/{docId}'),
        'medicalProfile subcollection must be declared');
      assert.ok(rulesContent.includes('allow read, write: if isOwner(userId);'),
        'medicalProfile access must require isOwner(userId)');
    });

    it('should strictly isolate medications and emergency contacts to owner only', () => {
      assert.ok(rulesContent.includes('match /users/{userId}/medications/{medId}'));
      assert.ok(rulesContent.includes('match /users/{userId}/emergencyContacts/{contactId}'));
    });
  });

  describe('Emergency Access Logs Immutability', () => {
    it('should strictly prohibit update and deletion of emergency access audit logs', () => {
      assert.ok(rulesContent.includes('match /emergencyAccessLogs/{logId}'),
        'emergencyAccessLogs collection must be matched');
      assert.ok(rulesContent.includes('allow update, delete: if false;'),
        'Access audit logs must be strictly immutable (allow update, delete: if false)');
    });
  });

  describe('Emergency Events Authorization (/emergencyEvents/{eventId})', () => {
    it('should allow read access only to owner, admin, or verified emergency responder', () => {
      assert.ok(rulesContent.includes('match /emergencyEvents/{eventId}'));
      assert.ok(rulesContent.includes('resource.data.userId == request.auth.uid ||') &&
                rulesContent.includes('isAdmin()') &&
                rulesContent.includes('isResponder()'),
        'Emergency event reads must be restricted to owner, admin, or paramedic');
    });

    it('should allow only administrators to delete emergency incident records', () => {
      assert.ok(rulesContent.includes('allow delete: if isAdmin();'),
        'Only administrators can delete emergency events');
    });
  });
});
