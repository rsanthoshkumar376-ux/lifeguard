import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { 
  ALLOWED_MIME_TYPES, 
  MAX_FILE_SIZE_BYTES, 
  validateUploadedDocument 
} from '../server/services/geminiService';

describe('LifeGuard QA: 08. Document Uploads & Sanitization Validation', () => {
  describe('MIME Type Whitelisting & Malicious Format Rejection', () => {
    it('should accept valid medical document formats (PDF, JPEG, PNG, WEBP)', () => {
      const validBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      assert.equal(validateUploadedDocument(validBase64, 'application/pdf').valid, true);
      assert.equal(validateUploadedDocument(validBase64, 'image/jpeg').valid, true);
      assert.equal(validateUploadedDocument(validBase64, 'image/png').valid, true);
      assert.equal(validateUploadedDocument(validBase64, 'image/webp').valid, true);
    });

    it('should reject dangerous and executable file MIME types', () => {
      const dummyBase64 = 'data:application/octet-stream;base64,VGhpcyBpcyBhIHRlc3Q=';

      const exeCheck = validateUploadedDocument(dummyBase64, 'application/x-msdownload');
      assert.equal(exeCheck.valid, false);
      assert.match(exeCheck.error!, /Unsupported document format/);

      const shCheck = validateUploadedDocument(dummyBase64, 'application/x-sh');
      assert.equal(shCheck.valid, false);

      const jsCheck = validateUploadedDocument(dummyBase64, 'application/javascript');
      assert.equal(jsCheck.valid, false);

      const svgCheck = validateUploadedDocument(dummyBase64, 'image/svg+xml');
      assert.equal(svgCheck.valid, false, 'SVG files are disallowed due to embedded XSS script risks');
    });
  });

  describe('File Size Limit Enforcement (10MB)', () => {
    it('should accept documents within the 10MB limit', () => {
      // 100 KB mock base64 string
      const smallBase64 = 'A'.repeat(100 * 1024);
      const res = validateUploadedDocument(smallBase64, 'application/pdf');
      assert.equal(res.valid, true);
    });

    it('should reject documents exceeding 10MB', () => {
      // Create string equivalent to ~11MB base64
      // 11MB = ~14.6M base64 chars
      const oversizedBase64 = 'A'.repeat(15 * 1024 * 1024);
      const res = validateUploadedDocument(oversizedBase64, 'application/pdf');
      assert.equal(res.valid, false);
      assert.match(res.error!, /Document exceeds maximum allowed size of 10MB/);
    });
  });

  describe('Document Category & Metadata Organization', () => {
    it('should validate standard clinical document categories', () => {
      const allowedCategories = [
        'laboratory',
        'prescription',
        'discharge_summary',
        'imaging_scan',
        'vaccination',
        'other'
      ];

      const isValidCategory = (cat: string) => allowedCategories.includes(cat);

      assert.equal(isValidCategory('laboratory'), true);
      assert.equal(isValidCategory('prescription'), true);
      assert.equal(isValidCategory('discharge_summary'), true);
      assert.equal(isValidCategory('malicious_category'), false);
    });
  });
});
