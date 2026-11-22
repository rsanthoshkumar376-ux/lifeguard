import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('LifeGuard QA: 07. Health Records & Vitals Validation', () => {
  describe('Vitals Numerical & Range Validation', () => {
    interface VitalReading {
      type: 'blood_pressure' | 'heart_rate' | 'spo2' | 'temperature' | 'blood_glucose';
      value: any;
      unit: string;
      recordedAt: string;
    }

    const validateVital = (vital: VitalReading): boolean => {
      switch (vital.type) {
        case 'blood_pressure': {
          const { systolic, diastolic } = vital.value || {};
          if (typeof systolic !== 'number' || typeof diastolic !== 'number') {
            throw new Error('Blood pressure requires numeric systolic and diastolic values.');
          }
          if (systolic < 70 || systolic > 250) {
            throw new Error(`Physiologically invalid systolic BP: ${systolic} mmHg (allowed 70-250)`);
          }
          if (diastolic < 40 || diastolic > 150) {
            throw new Error(`Physiologically invalid diastolic BP: ${diastolic} mmHg (allowed 40-150)`);
          }
          if (diastolic >= systolic) {
            throw new Error('Diastolic pressure cannot equal or exceed systolic pressure.');
          }
          return true;
        }
        case 'heart_rate': {
          const hr = Number(vital.value);
          if (isNaN(hr) || hr < 30 || hr > 220) {
            throw new Error(`Physiologically invalid heart rate: ${vital.value} bpm (allowed 30-220)`);
          }
          return true;
        }
        case 'spo2': {
          const spo2 = Number(vital.value);
          if (isNaN(spo2) || spo2 < 50 || spo2 > 100) {
            throw new Error(`Physiologically invalid oxygen saturation: ${vital.value}% (allowed 50-100)`);
          }
          return true;
        }
        case 'temperature': {
          const temp = Number(vital.value);
          // Fahrenheit check: 90 - 108 °F
          if (isNaN(temp) || temp < 90 || temp > 108) {
            throw new Error(`Physiologically invalid temperature: ${vital.value} °F (allowed 90-108)`);
          }
          return true;
        }
        case 'blood_glucose': {
          const bg = Number(vital.value);
          if (isNaN(bg) || bg < 20 || bg > 600) {
            throw new Error(`Physiologically invalid blood glucose: ${vital.value} mg/dL (allowed 20-600)`);
          }
          return true;
        }
        default:
          throw new Error('Unsupported vital type');
      }
    };

    it('should validate normal and hypertensive blood pressure readings', () => {
      assert.equal(validateVital({
        type: 'blood_pressure',
        value: { systolic: 120, diastolic: 80 },
        unit: 'mmHg',
        recordedAt: new Date().toISOString()
      }), true);

      assert.equal(validateVital({
        type: 'blood_pressure',
        value: { systolic: 160, diastolic: 95 },
        unit: 'mmHg',
        recordedAt: new Date().toISOString()
      }), true);
    });

    it('should reject inverted blood pressure (diastolic >= systolic)', () => {
      assert.throws(() => {
        validateVital({
          type: 'blood_pressure',
          value: { systolic: 80, diastolic: 120 },
          unit: 'mmHg',
          recordedAt: new Date().toISOString()
        });
      }, /Diastolic pressure cannot equal or exceed systolic pressure/);
    });

    it('should validate SpO2 and reject impossible values (>100% or <50%)', () => {
      assert.equal(validateVital({
        type: 'spo2',
        value: 98,
        unit: '%',
        recordedAt: new Date().toISOString()
      }), true);

      assert.throws(() => {
        validateVital({
          type: 'spo2',
          value: 105,
          unit: '%',
          recordedAt: new Date().toISOString()
        });
      }, /Physiologically invalid oxygen saturation/);
    });

    it('should validate blood glucose and reject non-physiological readings', () => {
      assert.equal(validateVital({
        type: 'blood_glucose',
        value: 110,
        unit: 'mg/dL',
        recordedAt: new Date().toISOString()
      }), true);

      assert.throws(() => {
        validateVital({
          type: 'blood_glucose',
          value: 5,
          unit: 'mg/dL',
          recordedAt: new Date().toISOString()
        });
      }, /Physiologically invalid blood glucose/);
    });
  });

  describe('Strict Non-Inference of Missing Readings', () => {
    it('should NEVER interpolate or invent missing readings on chart timeline', () => {
      // 5-day timeline where Days 2 & 4 are missing readings
      const rawVitalsData = [
        { date: '2026-11-01', systolic: 120 },
        { date: '2026-11-03', systolic: 125 },
        { date: '2026-11-05', systolic: 130 }
      ];

      const fullCalendarDays = [
        '2026-11-01',
        '2026-11-02',
        '2026-11-03',
        '2026-11-04',
        '2026-11-05'
      ];

      const chartDataSeries = fullCalendarDays.map(day => {
        const entry = rawVitalsData.find(e => e.date === day);
        return {
          date: day,
          systolic: entry ? entry.systolic : null // Strictly NULL - Never inferred!
        };
      });

      assert.equal(chartDataSeries[0].systolic, 120);
      assert.equal(chartDataSeries[1].systolic, null, 'Day 2 reading must remain null, never estimated');
      assert.equal(chartDataSeries[2].systolic, 125);
      assert.equal(chartDataSeries[3].systolic, null, 'Day 4 reading must remain null, never estimated');
      assert.equal(chartDataSeries[4].systolic, 130);
    });
  });

  describe('Health Timeline Chronological Ordering', () => {
    it('should sort timeline events in descending chronological order (most recent first)', () => {
      const events = [
        { id: '1', date: '2024-05-10', title: 'Appendectomy Surgery' },
        { id: '2', date: '2026-10-15', title: 'Cardiology Consultation' },
        { id: '3', date: '2025-01-20', title: 'HbA1c Lab Report' }
      ];

      const sorted = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      assert.equal(sorted[0].id, '2', 'Most recent event (2026) must be first');
      assert.equal(sorted[1].id, '3', 'Second event (2025)');
      assert.equal(sorted[2].id, '1', 'Oldest event (2024) must be last');
    });
  });
});
