#!/usr/bin/env node

/**
 * Versioned Screenshot History Script
 *
 * Automatically takes screenshots of all themes and saves them with version numbers
 * Creating a visual history of the app's evolution.
 */

import { chromium } from 'playwright';
import { mkdir, readFile } from 'fs/promises';
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

async function getVersion() {
  try {
    const packagePath = join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(await readFile(packagePath, 'utf-8'));
    return packageJson.version || '0.1.0';
  } catch {
    return '0.1.0';
  }
}

async function waitForStableLoad(page, maxWait = 10000) {
  // Wait for page to be loaded and stable
  const startTime = Date.now();
  let lastUrl = '';
  let stableCount = 0;

  while (Date.now() - startTime < maxWait) {
    const currentUrl = page.url();
    if (currentUrl === lastUrl) {
      stableCount++;
      if (stableCount >= 3) {
        // URL hasn't changed for 3 checks, consider it stable
        await page.waitForTimeout(500);
        return true;
      }
    } else {
      stableCount = 0;
    }
    lastUrl = currentUrl;
    await page.waitForTimeout(500);
  }

  return false;
}

async function takeScreenshots() {
  const version = await getVersion();
  const timestamp = Date.now();
  console.log(`\n📸 Store Soundscape Screenshot History`);
  console.log(`🏷️  Version: ${version}`);
  console.log(`⏰ Timestamp: ${new Date().toISOString()}\n`);

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
    console.log(`🌐 Navigating to ${APP_URL}...`);
    await page.goto(APP_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // Wait for page to stabilize
    console.log(`⏳ Waiting for page to stabilize...`);
    await waitForStableLoad(page);

    // Wait for React to hydrate and render
    console.log(`⚛️  Waiting for React hydration...`);
    await page.waitForSelector('.te-panel', { timeout: 10000 });
    await page.waitForTimeout(3000);

    // Create base screenshots directory
    const screenshotsDir = join(__dirname, '..', 'screenshots');
    await mkdir(screenshotsDir, { recursive: true });

    // Create version directory
    const versionDir = join(screenshotsDir, `v${version}-${timestamp}`);
    await mkdir(versionDir, { recursive: true });

    for (const theme of THEMES) {
      console.log(`\n🎨 ${theme.name} theme`);

      // Create theme directory
      const themeDir = join(versionDir, theme.variant);
      await mkdir(themeDir, { recursive: true });

      // Click theme button
      try {
        const clicked = await page.evaluate((buttonText) => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const button = buttons.find(b => b.textContent?.trim() === buttonText);
          if (button) {
            button.click();
            return true;
          }
          return false;
        }, theme.button);

        if (!clicked) {
          console.log(`  ⚠️  Could not find ${theme.button} button, skipping...`);
          continue;
        }

        await page.waitForTimeout(2000); // Wait for theme to apply
      } catch (error) {
        console.log(`  ⚠️  Error clicking ${theme.button} button: ${error.message}`);
        continue;
      }

      for (const mode of MODES) {
        try {
          console.log(`  📷 ${mode} mode...`);

          // Get current mode
          const currentMode = await page.evaluate(() => {
            return document.documentElement.getAttribute('data-mode');
          });

          // Toggle mode if needed
          if (currentMode !== mode) {
            await page.evaluate(() => {
              const switchButton = document.querySelector('[role="switch"]');
              if (switchButton) switchButton.click();
            });
            await page.waitForTimeout(800);
          }

          // Take screenshot
          const screenshotPath = join(themeDir, `${mode}.png`);
          await page.screenshot({
            path: screenshotPath,
            fullPage: false,
          });

          console.log(`  ✅ Saved to screenshots/v${version}-${timestamp}/${theme.variant}/${mode}.png`);
        } catch (error) {
          console.log(`  ❌ Failed to capture ${mode} mode: ${error.message}`);
        }
      }
    }

    // Create a summary file
    const summaryPath = join(versionDir, 'README.md');
    const summaryContent = `# Store Soundscape v${version}
Screenshots taken: ${new Date().toISOString()}

## Themes Captured
${THEMES.map(t => `- ${t.name} (${t.variant})`).join('\n')}

## Modes
${MODES.map(m => `- ${m}`).join('\n')}

## Directory Structure
\`\`\`
v${version}-${timestamp}/
${THEMES.map(t => `├── ${t.variant}/
│   ├── light.png
│   └── dark.png`).join('\n')}
\`\`\`
`;

    await writeFile(summaryPath, summaryContent);

    console.log(`\n✨ Screenshots complete!`);
    console.log(`📁 Saved to: screenshots/v${version}-${timestamp}/`);
    console.log(`📄 Summary: screenshots/v${version}-${timestamp}/README.md\n`);

  } catch (error) {
    console.error('\n❌ Error taking screenshots:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// Import writeFile
import { writeFile } from 'fs/promises';

// Run the script
takeScreenshots().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
