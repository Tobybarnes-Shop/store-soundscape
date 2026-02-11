const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function takeScreenshot() {
  const version = process.argv[2] || `v${Date.now()}`;
  const screenshotsDir = path.join(__dirname, '..', 'screenshots');

  // Ensure screenshots directory exists
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  // Try localhost first, then production URL
  const urls = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://store-soundscape.quick.shopify.io'
  ];

  let connected = false;
  for (const url of urls) {
    try {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 5000 });
      connected = true;
      console.log(`Connected to ${url}`);
      break;
    } catch (e) {
      console.log(`Could not connect to ${url}`);
    }
  }

  if (!connected) {
    console.error('Could not connect to any URL. Make sure dev server is running.');
    await browser.close();
    process.exit(1);
  }

  // Wait a moment for any animations
  await new Promise(r => setTimeout(r, 1000));

  const filename = `${version}.png`;
  const filepath = path.join(screenshotsDir, filename);

  await page.screenshot({ path: filepath, fullPage: false });
  console.log(`Screenshot saved: screenshots/${filename}`);

  await browser.close();
}

takeScreenshot().catch(console.error);
