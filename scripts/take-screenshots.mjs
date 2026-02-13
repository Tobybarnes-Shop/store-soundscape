#!/usr/bin/env node

/**
 * Screenshot Automation Script for Store Soundscape
 *
 * Takes screenshots of all themes in both light and dark modes
 * and saves them to each theme's folder.
 */

import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const THEMES = [
  { variant: 'default', button: 'DEF', name: 'Default' },
  { variant: 'medieval', button: 'MED', name: 'Medieval' },
  { variant: 'riddim', button: 'RID', name: 'Riddim' },
  { variant: 'vaporwave', button: 'VAP', name: 'Vaporwave' },
];

const MODES = ['light', 'dark'];

const APP_URL = 'http://localhost:3000';
const SCREENSHOT_WIDTH = 1920;
const SCREENSHOT_HEIGHT = 1080;

async function takeScreenshots() {
  console.log('🚀 Starting screenshot automation...\n');

  // Launch browser
  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: {
      width: SCREENSHOT_WIDTH,
      height: SCREENSHOT_HEIGHT,
    },
  });

  const page = await context.newPage();

  try {
    // Navigate to app
    console.log(`📱 Navigating to ${APP_URL}...`);
    await page.goto(APP_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // Wait for app to be ready
    await page.waitForTimeout(2000);

    for (const theme of THEMES) {
      console.log(`\n🎨 Processing ${theme.name} theme...`);

      // Click theme button without waiting for navigation
      await page.locator(`button:has-text("${theme.button}")`).click({ noWaitAfter: true });
      await page.waitForTimeout(1500); // Wait for theme to apply

      for (const mode of MODES) {
        console.log(`  📸 Taking ${mode} mode screenshot...`);

        // Get current mode
        const currentMode = await page.evaluate(() => {
          return document.documentElement.getAttribute('data-mode');
        });

        // Toggle mode if needed
        if (currentMode !== mode) {
          // Find and click the mode switch
          await page.locator('[role="switch"]').click({ noWaitAfter: true });
          await page.waitForTimeout(800); // Wait for mode transition
        }

        // Create screenshots directory
        const screenshotsDir = join(
          __dirname,
          '..',
          'lib',
          'themes',
          theme.variant,
          'screenshots'
        );
        await mkdir(screenshotsDir, { recursive: true });

        // Take screenshot
        const screenshotPath = join(screenshotsDir, `${mode}.png`);
        await page.screenshot({
          path: screenshotPath,
          fullPage: false,
        });

        console.log(`  ✅ Saved: ${screenshotPath}`);
      }
    }

    console.log('\n✨ All screenshots captured successfully!\n');
  } catch (error) {
    console.error('❌ Error taking screenshots:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the script
takeScreenshots().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
