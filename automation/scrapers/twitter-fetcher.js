/**
 * Twitter/X Fetcher — No API key required
 *
 * Strategy (tries in order, falls back gracefully):
 * 1. Twitter Syndication API (syndication.twitter.com) — used for embedded
 *    timelines on third-party sites, publicly accessible, returns JSON
 * 2. Nitter public instances — open-source Twitter frontend mirrors
 * 3. Silent fail — returns empty result so other sources still run
 *
 * Why this works without an API key:
 * Twitter's syndication endpoint was built for website embeds and requires
 * no authentication. Nitter instances scrape Twitter and expose clean HTML.
 */

const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../logger');

// Nitter public instances — try each in order until one responds
const NITTER_INSTANCES = [
  'https://nitter.privacyredirect.com',
  'https://nitter.poast.org',
  'https://nitter.lucabased.xyz',
  'https://nitter.woodland.cafe',
];

const CACHE = new Map(); // in-memory, keyed by account handle
const CACHE_TTL = 3600000; // 1 hour

/**
 * Fetch recent tweets from a public Twitter account.
 * Returns array of { text, date, url } objects.
 *
 * @param {string} handle - Twitter handle WITHOUT the @ (e.g. 'Roblox')
 * @param {number} limit  - Max tweets to return (default 20)
 */
async function fetchTweets(handle, limit = 20) {
  const cacheKey = `${handle}-${limit}`;
  const cached = CACHE.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    logger.info(`🐦 Twitter cache hit for @${handle}`);
    return cached.data;
  }

  // Try syndication API first
  let tweets = await fetchViaSyndication(handle, limit);

  // Fall back to nitter if syndication failed or returned nothing
  if (!tweets || tweets.length === 0) {
    tweets = await fetchViaNitter(handle, limit);
  }

  if (tweets && tweets.length > 0) {
    CACHE.set(cacheKey, { ts: Date.now(), data: tweets });
    logger.info(`🐦 @${handle}: ${tweets.length} tweets fetched`);
  } else {
    logger.warn(`🐦 @${handle}: no tweets retrieved (all sources failed)`);
    tweets = [];
  }

  return tweets;
}

/**
 * Twitter Syndication API — returns embedded timeline JSON
 * URL pattern used by Twitter's own "embed a timeline" feature
 */
async function fetchViaSyndication(handle, limit) {
  try {
    // This endpoint powers Twitter's embedded timeline widgets on third-party sites
    const url = `https://syndication.twitter.com/srv/timeline-profile/screen-name/${handle}`;
    const response = await axios.get(url, {
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/html, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://twitter.com/',
      },
      maxRedirects: 3,
    });

    // Response can be HTML (embedded widget page) containing JSON data
    const html = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);

    // Extract tweet data embedded in the HTML as __NEXT_DATA__ JSON
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (!nextDataMatch) return [];

    const nextData = JSON.parse(nextDataMatch[1]);
    const timeline = nextData?.props?.pageProps?.timeline?.entries || [];

    return timeline
      .filter(entry => entry?.content?.tweet)
      .slice(0, limit)
      .map(entry => {
        const tweet = entry.content.tweet;
        return {
          text: tweet.full_text || tweet.text || '',
          date: new Date(tweet.created_at || Date.now()),
          url: `https://twitter.com/${handle}/status/${tweet.id_str}`,
          likes: tweet.favorite_count || 0,
          retweets: tweet.retweet_count || 0,
        };
      })
      .filter(t => t.text);
  } catch (err) {
    logger.warn(`🐦 Syndication API failed for @${handle}: ${err.message}`);
    return [];
  }
}

/**
 * Nitter fallback — tries multiple public instances
 */
async function fetchViaNitter(handle, limit) {
  for (const instance of NITTER_INSTANCES) {
    try {
      const url = `${instance}/${handle}`;
      const response = await axios.get(url, {
        timeout: 6000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; GamingCoinsHub/1.0)',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        maxRedirects: 2,
      });

      const $ = cheerio.load(response.data);
      const tweets = [];

      $('.timeline-item, .tweet-content, article').slice(0, limit).each((i, el) => {
        const text = $(el).find('.tweet-content, p.tweet-text, .content').first().text().trim();
        const timeEl = $(el).find('time, .tweet-date a');
        const dateStr = timeEl.attr('datetime') || timeEl.attr('title') || '';
        const linkEl = $(el).find('a.tweet-link, a[href*="/status/"]').first();
        const relUrl = linkEl.attr('href') || '';

        if (text && text.length > 10) {
          tweets.push({
            text,
            date: dateStr ? new Date(dateStr) : new Date(),
            url: relUrl ? `https://twitter.com${relUrl.replace(instance, '')}` : `https://twitter.com/${handle}`,
            likes: 0,
            retweets: 0,
          });
        }
      });

      if (tweets.length > 0) {
        logger.info(`🐦 Nitter (${instance}) got ${tweets.length} tweets for @${handle}`);
        return tweets;
      }
    } catch (err) {
      logger.warn(`🐦 Nitter ${instance} failed for @${handle}: ${err.message}`);
    }
  }
  return [];
}

/**
 * Extract promo codes from tweet text.
 * Different games use different code formats — pass a regex to customise.
 *
 * @param {Array}  tweets      - Array from fetchTweets()
 * @param {RegExp} codePattern - Regex to match codes (default: 6-16 uppercase alphanumeric)
 * @param {string} sourceName  - Label for the 'source' field on returned codes
 */
function extractCodesFromTweets(tweets, codePattern, sourceName) {
  const defaultPattern = /\b[A-Z0-9]{6,16}\b/g;
  const pattern = codePattern || defaultPattern;
  const codes = [];
  const seen = new Set();

  tweets.forEach(tweet => {
    const matches = tweet.text.match(pattern) || [];
    matches.forEach(code => {
      // Skip common false positives (all digits, common words)
      if (/^\d+$/.test(code)) return;
      if (['HTTPS', 'HTTP', 'HTML', 'NULL', 'TRUE', 'FALSE'].includes(code)) return;
      if (seen.has(code)) return;
      seen.add(code);

      codes.push({
        code: code.toUpperCase(),
        source: sourceName || 'Twitter/X Official',
        date: tweet.date,
        verified: true, // from official account = high confidence
        notes: tweet.text.substring(0, 100),
        tweetUrl: tweet.url,
        likes: tweet.likes,
      });
    });
  });

  return codes;
}

/**
 * Extract news items from tweets (high-engagement or keyword-matching)
 *
 * @param {Array}  tweets     - Array from fetchTweets()
 * @param {Array}  keywords   - Words that make a tweet newsworthy
 * @param {string} sourceName - Label for the 'source' field
 */
function extractNewsFromTweets(tweets, keywords, sourceName) {
  const defaultKeywords = ['update', 'event', 'new', 'free', 'launch', 'patch', 'bonus', 'reward'];
  const kws = keywords || defaultKeywords;

  return tweets
    .filter(tweet => {
      const lower = tweet.text.toLowerCase();
      return kws.some(kw => lower.includes(kw)) || tweet.likes > 50;
    })
    .slice(0, 8)
    .map(tweet => ({
      title: tweet.text.substring(0, 100).replace(/\n/g, ' '),
      summary: tweet.text.substring(0, 280),
      date: tweet.date,
      source: sourceName || 'Twitter/X Official',
      url: tweet.url,
      engagement: tweet.likes,
      official: true,
    }));
}

module.exports = {
  fetchTweets,
  extractCodesFromTweets,
  extractNewsFromTweets,
};
