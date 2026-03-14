/**
 * Fandom MediaWiki API - Fetches wiki content via official API (bypasses 403 from HTML scraping)
 * Uses https://{wiki}.fandom.com/api.php?action=parse - designed for programmatic access
 *
 * @see https://www.mediawiki.org/wiki/API:Parse
 */

const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../logger');

/**
 * Fetch a Fandom wiki page via MediaWiki API (no Cloudflare blocking)
 * @param {string} wikiSubdomain - e.g. 'roblox', 'fortnite', 'clashofclans', 'mobilelegends'
 * @param {string} pageTitle - Wiki page title, e.g. 'Robux', 'V-Bucks', 'Gems'
 * @returns {Promise<string|null>} HTML content or null on error
 */
async function fetchFandomPage(wikiSubdomain, pageTitle) {
  const apiUrl = `https://${wikiSubdomain}.fandom.com/api.php`;
  const params = { action: 'parse', page: pageTitle, format: 'json', origin: '*' };
  try {
    logger.fandom(`Fetching ${wikiSubdomain}.fandom.com/wiki/${pageTitle.replace(/_/g, ' ')}`);
    logger.fandom(`  API: ${apiUrl}?action=parse&page=${pageTitle}`);

    const response = await axios.get(apiUrl, {
      params,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GamingCoinsHub/1.0; +https://farmcoins.netlify.app)',
        'Accept': 'application/json',
      },
      timeout: 10000,
      validateStatus: (s) => s < 400,
    });

    if (response.status !== 200 || !response.data?.parse?.text) {
      logger.fandom(`${wikiSubdomain}/${pageTitle}: no content (status=${response.status})`, 'warn');
      return null;
    }

    const html = response.data.parse.text['*'];
    const bytes = Buffer.byteLength(html, 'utf8');
    logger.fandom(`✓ Fetched ${wikiSubdomain}/${pageTitle} (${(bytes / 1024).toFixed(1)} KB)`);
    return html;
  } catch (error) {
    logger.fandom(`${wikiSubdomain}/${pageTitle}: ${error.message}`, 'warn');
    return null;
  }
}

/**
 * Parse Fandom HTML and extract codes + news/earning methods
 */
function parseFandomContent(html, sourceName) {
  const codes = [];
  const news = [];
  if (!html) return { codes, news };

  const $ = cheerio.load(html);

  // Extract earning methods from headings
  $('h2, h3').each((i, heading) => {
    const title = $(heading).text().trim();
    const section = $(heading).nextUntil('h2, h3');
    const content = section.text().substring(0, 300);

    if (title && (title.toLowerCase().includes('earn') || title.toLowerCase().includes('free'))) {
      news.push({
        title: `Wiki: ${title}`,
        summary: content,
        date: new Date(),
        source: sourceName,
        type: 'earning_method',
      });
    }
  });

  // Extract potential codes from tables and lists
  $('table, ul, ol').each((i, elem) => {
    const text = $(elem).text();
    const codeMatches = text.match(/\b[A-Z0-9]{6,12}\b/g) || [];
    codeMatches.slice(0, 3).forEach((code) => {
      if (code.length >= 6 && code.length <= 12) {
        codes.push({
          code: code.toUpperCase(),
          source: sourceName,
          verified: true,
          date: new Date(),
        });
      }
    });
  });

  return { codes, news };
}

/**
 * Scrape Fandom wiki page via API - returns { codes, news } for use in game scrapers
 */
async function scrapeFandomWiki(wikiSubdomain, pageTitle, sourceName) {
  const html = await fetchFandomPage(wikiSubdomain, pageTitle);
  const { codes, news } = parseFandomContent(html, sourceName);
  logger.fandom(`Parse result: ${codes.length} codes, ${news.length} news (${sourceName})`);
  return { codes, news };
}

module.exports = {
  fetchFandomPage,
  parseFandomContent,
  scrapeFandomWiki,
};
