#!/usr/bin/env node

/**
 * Automatic Screenshot Script with Python Server
 *
 * Builds, serves, and screenshots the app automatically
 */

import { chromium } from 'playwright';
import { mkdir, readFile, writeFile, access } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const THEMES = [
  { variant: 'default', button: 'DEF', name: 'Default' },
  { variant: 'medieval', button: 'MED', name: 'Medieval' },
  { variant: 'riddim', button: 'RID', name: 'Riddim' },
  { variant: 'vaporwave', button: 'VAP', name: 'Vaporwave' },
];

const MODES = ['light', 'dark'];
const PORT = 8888;
const APP_URL = `http://localhost:${PORT}`;

async function getVersion() {
  const packagePath = join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(await readFile(packagePath, 'utf-8'));
  return packageJson.version || '0.1.0';
}

async function checkBuild() {
  const outDir = join(__dirname, '..', 'out');
  try {
    await access(outDir);
    return true;
  } catch {
    return false;
  }
}

async function startPythonServer(dir) {
  return new Promise((resolve, reject) => {
    const server = spawn('python3', ['-m', 'http.server', PORT.toString()], {
      cwd: dir,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    // Wait for server to start
    setTimeout(() => resolve(server), 2000);

    server.on('error', reject);
  });
}

async function takeScreenshots() {
  const version = await getVersion();
  const timestamp = Date.now();

  console.log(`\n📸 Store Soundscape Screenshot Automation`);
  console.log(`🏷️  Version: ${version}`);
  console.log(`⏰ ${new Date().toLocaleString()}\n`);

  // Check if build exists
  const hasBuild = await checkBuild();
  if (!hasBuild) {
    console.log(`⚠️  No build found. Run "npm run build" first.`);
    return;
  }

  let server = null;

  try {
    // Start server
    console.log(`🚀 Starting server on port ${PORT}...`);
    const outDir = join(__dirname, '..', 'out');
    server = await startPythonServer(outDir);
    console.log(`✅ Server ready at ${APP_URL}\n`);

    // Launch browser
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
      viewport: { width: 1920, height: 1080 },
    });

    // Load app
    await page.goto(APP_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Create screenshot directory
    const screenshotsDir = join(__dirname, '..', 'screenshots');
    const versionDir = join(screenshotsDir, `v${version}-${timestamp}`);
    await mkdir(versionDir, { recursive: true });

    // Take screenshots
    for (const theme of THEMES) {
      console.log(`🎨 ${theme.name}`);
      const themeDir = join(versionDir, theme.variant);
      await mkdir(themeDir, { recursive: true });

      // Click theme
      await page.evaluate((btn) => {
        const buttons = [...document.querySelectorAll('button')];
        buttons.find(b => b.textContent?.trim() === btn)?.click();
      }, theme.button);
      await page.waitForTimeout(800);

      for (const mode of MODES) {
        const current = await page.evaluate(() =>
          document.documentElement.getAttribute('data-mode')
        );

        if (current !== mode) {
          await page.evaluate(() =>
            document.querySelector('[role="switch"]')?.click()
          );
          await page.waitForTimeout(400);
        }

        const path = join(themeDir, `${mode}.png`);
        await page.screenshot({ path });
        console.log(`  ✓ ${mode}`);
      }
    }

    // Save summary
    const summary = `# v${version} - ${new Date().toLocaleDateString()}

Screenshots: ${THEMES.length} themes × ${MODES.length} modes = ${THEMES.length * MODES.length} total

## Themes
${THEMES.map(t => `- ${t.name}`).join('\n')}
`;
    await writeFile(join(versionDir, 'README.md'), summary);

    console.log(`\n✨ Complete! Saved to screenshots/v${version}-${timestamp}/\n`);

    await browser.close();
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    throw error;
  } finally {
    if (server) {
      server.kill();
    }
  }
}

takeScreenshots().catch(() => process.exit(1));
