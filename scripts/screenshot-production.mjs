#!/usr/bin/env node

/**
 * Production Screenshot Script
 *
 * Serves the production build locally and takes screenshots
 * Avoids dev server Hot Module Reload issues
 */

import { chromium } from 'playwright';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const THEMES = [
  { variant: 'default', button: 'DEF', name: 'Default' },
  { variant: 'medieval', button: 'MED', name: 'Medieval' },
  { variant: 'riddim', button: 'RID', name: 'Riddim' },
  { variant: 'vaporwave', button: 'VAP', name: 'Vaporwave' },
];

const MODES = ['light', 'dark'];
const PORT = 8080;
const APP_URL = `http://localhost:${PORT}`;
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

async function startServer() {
  return new Promise((resolve, reject) => {
    const server = spawn('npx', ['serve', 'out', '-p', PORT.toString()], {
      cwd: join(__dirname, '..'),
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let output = '';

    server.stdout.on('data', (data) => {
      output += data.toString();
      if (output.includes('Accepting connections')) {
        setTimeout(() => resolve(server), 3000);
      }
    });

    server.stderr.on('data', (data) => {
      const message = data.toString();
      if (message.includes('Accepting connections')) {
        setTimeout(() => resolve(server), 3000);
      }
    });

    setTimeout(() => reject(new Error('Server start timeout')), 15000);
  });
}

async function takeScreenshots() {
  const version = await getVersion();
  const timestamp = Date.now();

  console.log(`\n📸 Store Soundscape Screenshot History (Production)`);
  console.log(`🏷️  Version: ${version}`);
  console.log(`⏰ Timestamp: ${new Date().toISOString()}\n`);

  let server = null;

  try {
    // Start production server
    console.log(`🚀 Starting production server on port ${PORT}...`);
    server = await startServer();
    console.log(`✅ Server running at ${APP_URL}\n`);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: SCREENSHOT_WIDTH, height: SCREENSHOT_HEIGHT },
    });

    const page = await context.newPage();

    // Navigate to app
    console.log(`🌐 Loading application...`);
    await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Create directories
    const screenshotsDir = join(__dirname, '..', 'screenshots');
    await mkdir(screenshotsDir, { recursive: true });

    const versionDir = join(screenshotsDir, `v${version}-${timestamp}`);
    await mkdir(versionDir, { recursive: true });

    for (const theme of THEMES) {
      console.log(`\n🎨 ${theme.name} theme`);

      const themeDir = join(versionDir, theme.variant);
      await mkdir(themeDir, { recursive: true });

      // Click theme button
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
        console.log(`  ⚠️  Could not find ${theme.button} button`);
        continue;
      }

      await page.waitForTimeout(1000);

      for (const mode of MODES) {
        console.log(`  📷 ${mode} mode...`);

        // Get and set mode
        const currentMode = await page.evaluate(() =>
          document.documentElement.getAttribute('data-mode')
        );

        if (currentMode !== mode) {
          await page.evaluate(() => {
            const switchBtn = document.querySelector('[role="switch"]');
            if (switchBtn) switchBtn.click();
          });
          await page.waitForTimeout(500);
        }

        // Take screenshot
        const screenshotPath = join(themeDir, `${mode}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: false });

        console.log(`  ✅ Saved`);
      }
    }

    // Create summary
    const summaryPath = join(versionDir, 'README.md');
    const summaryContent = `# Store Soundscape v${version}
📸 Screenshots taken: ${new Date().toISOString()}

## Themes
${THEMES.map(t => `- **${t.name}** (\`${t.variant}\`)`).join('\n')}

## Modes
${MODES.map(m => `- ${m}`).join('\n')}

## Directory
\`\`\`
v${version}-${timestamp}/
${THEMES.map(t => `├── ${t.variant}/
│   ├── light.png
│   └── dark.png`).join('\n')}
\`\`\`
`;

    await writeFile(summaryPath, summaryContent);

    console.log(`\n✨ Screenshots complete!`);
    console.log(`📁 Location: screenshots/v${version}-${timestamp}/\n`);

    await browser.close();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;
  } finally {
    if (server) {
      console.log('🛑 Stopping server...');
      server.kill();
    }
  }
}

takeScreenshots().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
