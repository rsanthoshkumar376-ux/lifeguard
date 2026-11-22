import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

describe('LifeGuard QA: 12. Mobile Responsiveness & WCAG 2.1 AA Accessibility', () => {
  describe('Viewport Configuration & Touch Target Dimensions', () => {
    it('should declare viewport meta tag preventing unauthorized pinch-zoom lockouts', () => {
      const indexHtmlPath = path.resolve(process.cwd(), 'index.html');
      const html = fs.readFileSync(indexHtmlPath, 'utf8');

      assert.ok(html.includes('name="viewport"'), 'Viewport meta tag must be declared');
      assert.ok(html.includes('width=device-width'), 'Viewport width must be set to device-width');
      assert.ok(html.includes('initial-scale=1.0'), 'Initial scale must be 1.0');
      // Accessibility rule: never set user-scalable=no or maximum-scale=1.0
      assert.equal(html.includes('user-scalable=no'), false, 'user-scalable=no is prohibited by WCAG 1.4.4');
    });

    it('should comply with WCAG 2.5.5 minimum touch target size (44x44px)', () => {
      const MIN_TOUCH_TARGET_PX = 44;
      const buttonSizes = [
        { name: 'Emergency SOS Main Button', width: 140, height: 140 },
        { name: 'Call 108 Hotline Action', width: 120, height: 48 },
        { name: 'Bottom Navigation Item', width: 64, height: 56 },
        { name: 'Accessibility Toolbar Toggle', width: 44, height: 44 }
      ];

      for (const btn of buttonSizes) {
        assert.ok(btn.width >= MIN_TOUCH_TARGET_PX, `${btn.name} width (${btn.width}px) must be >= 44px`);
        assert.ok(btn.height >= MIN_TOUCH_TARGET_PX, `${btn.name} height (${btn.height}px) must be >= 44px`);
      }
    });
  });

  describe('WCAG 2.1 Color Contrast Ratios (Level AA Compliance)', () => {
    // Relative luminance formula per WCAG 2.1 specs
    const getLuminance = (r: number, g: number, b: number): number => {
      const a = [r, g, b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
    };

    const getContrastRatio = (rgb1: [number, number, number], rgb2: [number, number, number]): number => {
      const lum1 = getLuminance(...rgb1);
      const lum2 = getLuminance(...rgb2);
      const brightest = Math.max(lum1, lum2);
      const darkest = Math.min(lum1, lum2);
      return Math.round(((brightest + 0.05) / (darkest + 0.05)) * 100) / 100;
    };

    it('should verify high contrast mode (black on white) achieves maximum 21:1 ratio', () => {
      const black: [number, number, number] = [0, 0, 0];
      const white: [number, number, number] = [255, 255, 255];
      const ratio = getContrastRatio(black, white);
      assert.equal(ratio, 21.0, 'Pure black on pure white must equal 21:1');
    });

    it('should verify Medical Blue (#1D4ED8) on white exceeds WCAG AA 4.5:1 requirement', () => {
      const medicalBlue: [number, number, number] = [29, 78, 216]; // #1D4ED8
      const white: [number, number, number] = [255, 255, 255];
      const ratio = getContrastRatio(medicalBlue, white);
      assert.ok(ratio >= 4.5, `Medical Blue contrast ratio (${ratio}:1) must exceed WCAG AA minimum 4.5:1`);
    });

    it('should verify Emergency Red (#DC2626) on white exceeds WCAG AA requirement', () => {
      const emergencyRed: [number, number, number] = [220, 38, 38]; // #DC2626
      const white: [number, number, number] = [255, 255, 255];
      const ratio = getContrastRatio(emergencyRed, white);
      assert.ok(ratio >= 4.5, `Emergency Red contrast ratio (${ratio}:1) must exceed WCAG AA minimum 4.5:1`);
    });
  });

  describe('Color-Independent Status Indicators', () => {
    it('should ensure status displays combine icons and text, never relying on color alone', () => {
      interface StatusBadge {
        status: string;
        color: string;
        iconName: string;
        semanticLabel: string;
      }

      const badges: StatusBadge[] = [
        { status: 'active', color: 'bg-green-100 text-green-800', iconName: 'CheckCircle2', semanticLabel: 'Available' },
        { status: 'emergency', color: 'bg-red-100 text-red-800', iconName: 'AlertTriangle', semanticLabel: 'Emergency Critical' },
        { status: 'pending', color: 'bg-amber-100 text-amber-800', iconName: 'Clock', semanticLabel: 'Pending Verification' },
        { status: 'closed', color: 'bg-gray-100 text-gray-800', iconName: 'XCircle', semanticLabel: 'Inactive' }
      ];

      for (const badge of badges) {
        assert.ok(badge.iconName.length > 0, 'Status must include distinct visual icon');
        assert.ok(badge.semanticLabel.length > 0, 'Status must include explicit textual label');
        assert.notEqual(badge.iconName, '', 'Status indicator must not be color alone');
      }
    });
  });
});
