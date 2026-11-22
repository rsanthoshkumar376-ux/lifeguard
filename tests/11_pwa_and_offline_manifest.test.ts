import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

describe('LifeGuard QA: 11. PWA Installation, Manifest & Offline Caching', () => {
  const rootDir = process.cwd();

  it('should verify vite.config.ts contains production VitePWA configuration', () => {
    const viteConfigPath = path.join(rootDir, 'vite.config.ts');
    assert.ok(fs.existsSync(viteConfigPath), 'vite.config.ts must exist');

    const configContent = fs.readFileSync(viteConfigPath, 'utf8');
    assert.ok(configContent.includes('VitePWA'), 'VitePWA plugin must be imported and configured');
    assert.ok(configContent.includes("display: 'standalone'"), 'Display must be standalone for native-like PWA experience');
    assert.ok(configContent.includes("theme_color: '#DC2626'"), 'Theme color must match emergency brand color');
    assert.ok(configContent.includes("start_url: '/'"), 'Start URL must be root');
  });

  it('should verify required PWA icons exist at specified sizes and paths', () => {
    const iconsDir = path.join(rootDir, 'public', 'icons');
    const icon192 = path.join(iconsDir, 'icon-192.png');
    const icon512 = path.join(iconsDir, 'icon-512.png');

    assert.ok(fs.existsSync(icon192), 'icon-192.png must exist for mobile home screens');
    assert.ok(fs.existsSync(icon512), 'icon-512.png must exist for splash screens');

    const stat192 = fs.statSync(icon192);
    const stat512 = fs.statSync(icon512);

    assert.ok(stat192.size > 0, 'icon-192.png must not be empty');
    assert.ok(stat512.size > 0, 'icon-512.png must not be empty');
  });

  it('should verify Workbox service worker offline precache glob patterns', () => {
    const viteConfigPath = path.join(rootDir, 'vite.config.ts');
    const configContent = fs.readFileSync(viteConfigPath, 'utf8');

    assert.ok(configContent.includes('globPatterns'), 'Workbox must declare globPatterns for precaching');
    assert.ok(configContent.includes('skipWaiting: true'), 'skipWaiting must be true for instant app updates');
    assert.ok(configContent.includes('clientsClaim: true'), 'clientsClaim must be true for immediate SW control');
  });

  it('should verify index.html links to theme-color and viewport', () => {
    const indexHtmlPath = path.join(rootDir, 'index.html');
    const htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');

    assert.ok(htmlContent.includes('name="viewport"'), 'index.html must declare viewport meta tag');
    assert.ok(htmlContent.includes('width=device-width'), 'viewport must be set to device-width');
    assert.ok(htmlContent.includes('name="theme-color"'), 'theme-color meta tag must be declared');
  });
});
