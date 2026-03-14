/**
 * Playwright fetcher - Headless browser for sites with bot protection (e.g. Epic Games)
 * Use when plain HTTP fetch returns 403. Requires: npm install playwright && npx playwright install chromium
 *
 * @see https://playwright.dev/docs/intro
 */

const logger = require('../logger');

/** @type {typeof import('playwright')} */
let playwright = null;

async function loadPlaywright() {
  if (playwright) return playwright;
  try {
    logger.playwright('Loading Playwright module...');
    playwright = await import('playwright');
    logger.playwright('✓ Playwright module loaded');
    return playwright;
  } catch (e) {
    logger.playwright(`Not available: ${e.message}`, 'error');
    return null;
  }
}

/**
 * Fetch HTML from a URL using headless Chromium (bypasses many bot checks)
 * @param {string} url - Full URL to fetch
 * @param {{ timeout?: number }} [opts] - Optional { timeout } in ms (default 15000)
 * @returns {Promise<string|null>} HTML string or null on error
 */
async function fetchWithPlaywright(url, opts = {}) {
  const { timeout = 15000 } = opts;
  const pw = await loadPlaywright();
  if (!pw) return null;

  let browser = null;
  const start = Date.now();
  try {
    logger.playwright(`Launching Chromium (headless, no-sandbox)...`);
    browser = await pw.chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    logger.playwright('✓ Browser launched');

    logger.playwright(`Creating new page (1280×720, Chrome UA)...`);
    const page = await browser.newPage({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 720 },
    });
    logger.playwright(`Navigating to: ${url}`);
    logger.playwright(`  waitUntil: domcontentloaded, timeout: ${timeout}ms`);

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
    logger.playwright('✓ Page loaded');

    logger.playwright('  Waiting 2s for JS to execute...');
    await new Promise(r => setTimeout(r, 2000));

    const html = await page.content();
    const bytes = Buffer.byteLength(html, 'utf8');
    const elapsed = Date.now() - start;
    logger.playwright(`✓ Extracted HTML: ${(bytes / 1024).toFixed(1)} KB in ${elapsed}ms`);

    return html;
  } catch (error) {
    logger.playwright(`✗ Fetch failed (${url}): ${error.message}`, 'error');
    return null;
  } finally {
    if (browser) {
      logger.playwright('Closing browser...');
      await browser.close().catch(() => {});
      logger.playwright('✓ Browser closed');
    }
  }
}

module.exports = {
  fetchWithPlaywright,
  loadPlaywright,
};
