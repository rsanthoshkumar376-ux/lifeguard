import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

describe('LifeGuard QA: 10. Multilingual Content & Translation Completeness', () => {
  const localesDir = path.resolve(process.cwd(), 'public', 'locales');
  const SUPPORTED_LANGS = ['en', 'ta', 'hi', 'te', 'kn', 'ml'];

  it('should verify that all 6 language translation files exist on disk', () => {
    for (const lang of SUPPORTED_LANGS) {
      const filePath = path.join(localesDir, lang, 'translation.json');
      assert.ok(fs.existsSync(filePath), `Translation file missing for language: ${lang} at ${filePath}`);
    }
  });

  it('should verify that all translation files parse as valid JSON', () => {
    for (const lang of SUPPORTED_LANGS) {
      const filePath = path.join(localesDir, lang, 'translation.json');
      const content = fs.readFileSync(filePath, 'utf8');
      assert.doesNotThrow(() => {
        JSON.parse(content);
      }, `Failed to parse JSON for language: ${lang}`);
    }
  });

  it('should verify core namespace parity with English base dictionary', () => {
    const enPath = path.join(localesDir, 'en', 'translation.json');
    const enJson = JSON.parse(fs.readFileSync(enPath, 'utf8'));
    const enTopKeys = Object.keys(enJson);

    // Core top-level namespaces required
    const REQUIRED_NAMESPACES = ['app', 'auth', 'home', 'emergency', 'blood', 'profile', 'hospital'];
    for (const ns of REQUIRED_NAMESPACES) {
      assert.ok(enTopKeys.includes(ns), `English dictionary must contain namespace: ${ns}`);
    }

    for (const lang of ['ta', 'hi', 'te', 'kn', 'ml']) {
      const langPath = path.join(localesDir, lang, 'translation.json');
      const langJson = JSON.parse(fs.readFileSync(langPath, 'utf8'));
      const langTopKeys = Object.keys(langJson);

      for (const ns of REQUIRED_NAMESPACES) {
        assert.ok(langTopKeys.includes(ns), `Language [${lang}] missing required namespace: ${ns}`);
      }
    }
  });

  it('should verify critical emergency actions are localized and non-empty in all 6 languages', () => {
    const CRITICAL_EMERGENCY_KEYS = ['sos', 'medicalId', 'callAmbulance', 'firstAid'];

    for (const lang of SUPPORTED_LANGS) {
      const langPath = path.join(localesDir, lang, 'translation.json');
      const langJson = JSON.parse(fs.readFileSync(langPath, 'utf8'));

      assert.ok(langJson.emergency, `Language [${lang}] missing emergency block`);
      for (const key of CRITICAL_EMERGENCY_KEYS) {
        const val = langJson.emergency[key];
        assert.ok(val && typeof val === 'string' && val.trim().length > 0, 
          `Language [${lang}] emergency.${key} is missing or empty`);
      }
    }
  });

  it('should verify blood group and donor terminology is localized across all languages', () => {
    for (const lang of SUPPORTED_LANGS) {
      const langPath = path.join(localesDir, lang, 'translation.json');
      const langJson = JSON.parse(fs.readFileSync(langPath, 'utf8'));

      assert.ok(langJson.blood, `Language [${lang}] missing blood section`);
      assert.ok(langJson.blood.request, `Language [${lang}] missing blood.request`);
      assert.ok(langJson.blood.donate, `Language [${lang}] missing blood.donate`);
      assert.ok(langJson.blood.bloodGroup, `Language [${lang}] missing blood.bloodGroup`);
    }
  });
});
