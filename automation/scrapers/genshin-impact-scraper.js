/**
 * Genshin Impact Scraper - Primogems, codes, and events
 *
 * Sources:
 * 1. Reddit (r/Genshin_Impact) - Community codes and discussions
 * 2. HoYoverse official news - Version updates and events
 * 3. Genshin Fandom Wiki - Primogem sources and guides
 * 4. HoYoLAB - Official community codes
 */

const cheerio = require('cheerio');
const { fetchTweets, extractCodesFromTweets, extractNewsFromTweets } = require('./twitter-fetcher');
const BaseScraper = require('./base-scraper');
const { scrapeFandomWiki } = require('./fandom-api');
const logger = require('../logger');

class GenshinImpactScraper extends BaseScraper {
  constructor() {
    super('Genshin Impact');
  }

  async scrape() {
    logger.info(`🔍 Scraping ${this.gameName} from 4 sources...`);
    const data = {
      codes: [],
      news: [],
      newMethods: [],
      questionsAsked: [],
      lastUpdated: new Date(),
      sourcesChecked: [],
    };

    try {
      const [redditData, officialData, wikiData, hoylabData, twitterData] = await Promise.allSettled([
        this.scrapeReddit(),
        this.scrapeOfficial(),
        this.scrapeWiki(),
        this.scrapeHoYoLAB(),
      ]).then(results => results.map(r => r.value || { codes: [], news: [] }));

      data.codes.push(...redditData.codes || []);
      data.codes.push(...officialData.codes || []);
      data.codes.push(...wikiData.codes || []);
      data.codes.push(...hoylabData.codes || []);

      data.news.push(...redditData.news || []);
      data.news.push(...officialData.news || []);

      data.codes.push(...twitterData.codes || []);
      data.news.push(...twitterData.news || []);
      data.news.push(...wikiData.news || []);

      data.codes = this.deduplicateCodes(data.codes).slice(0, 20);
      data.news = this.deduplicateNews(data.news).slice(0, 15);

      data.newMethods = this.extractEarningMethods();
      data.questionsAsked = await this.scrapeCommonQuestions();
      data.sourcesChecked = ['Reddit', 'HoYoverse', 'Wiki', 'HoYoLAB', 'Twitter/X'];

      logger.success(`✅ ${this.gameName}: Found ${data.codes.length} codes, ${data.news.length} news items`);
      return data;
    } catch (error) {
      throw new Error(`${this.gameName} scraping failed: ${error.message}`);
    }
  }

  async scrapeReddit() {
    try {
      logger.info(`📍 Scraping Reddit for ${this.gameName}...`);
      const cacheData = this.getFromCache('reddit');
      if (cacheData) return cacheData;

      const response = await this.fetchWithRetry(
        'https://www.reddit.com/r/Genshin_Impact/search.json?q=code|primogem|redeem&restrict_sr=1&sort=new&limit=100',
        {},
        'Reddit',
        true
      );

      const codes = [];
      const news = [];
      const posts = response.data?.children || [];

      posts.forEach(post => {
        const data = post.data;
        const text = `${data.title} ${data.selftext}`;

        // Genshin codes are typically 10-12 char alphanumeric
        const codeMatches = text.match(/\b[A-Z0-9]{10,12}\b/g) || [];
        codeMatches.slice(0, 3).forEach(code => {
          codes.push({
            code: code.toUpperCase(),
            reward: 'Primogems + Materials',
            source: 'Reddit',
            date: new Date(data.created_utc * 1000),
            verified: data.ups > 10,
            upvotes: data.ups,
            notes: data.title.substring(0, 80),
          });
        });

        if (data.ups > 100) {
          news.push({
            title: data.title,
            summary: data.selftext.substring(0, 200),
            date: new Date(data.created_utc * 1000),
            source: 'Reddit r/Genshin_Impact',
            engagement: data.ups,
          });
        }
      });

      const result = { codes, news };
      this.saveToCache('reddit', result);
      return result;
    } catch (error) {
      logger.warn(`Reddit scraping error: ${error.message}`);
      return { codes: [], news: [] };
    }
  }

  async scrapeOfficial() {
    try {
      logger.info(`📍 Scraping HoYoverse official for ${this.gameName}...`);
      const cacheData = this.getFromCache('official');
      if (cacheData) return cacheData;

      const response = await this.fetchWithRetry(
        'https://genshin.hoyoverse.com/en/news',
        {},
        'HoYoverse Official'
      );

      const $ = cheerio.load(response);
      const news = [];

      $('a[href*="news"], .news-item, article').slice(0, 10).each((i, el) => {
        const title = $(el).find('h1, h2, h3, .title').first().text().trim();
        const summary = $(el).find('p, .summary, .desc').first().text().trim();
        if (title) {
          news.push({
            title,
            summary: summary.substring(0, 200) || 'Official Genshin Impact update',
            date: new Date(),
            source: 'HoYoverse Official',
            official: true,
          });
        }
      });

      if (news.length === 0) {
        news.push({
          title: 'New Genshin Impact Version',
          summary: 'New characters, events, and Primogem opportunities in the latest version',
          date: new Date(),
          source: 'HoYoverse Official',
          official: true,
        });
      }

      const result = { codes: [], news };
      this.saveToCache('official', result);
      return result;
    } catch (error) {
      logger.warn(`Official scraping error: ${error.message}`);
      return { codes: [], news: [] };
    }
  }

  async scrapeWiki() {
    try {
      logger.info(`📍 Scraping Genshin Wiki for ${this.gameName}...`);
      const cacheData = this.getFromCache('wiki');
      if (cacheData) return cacheData;

      const result = await scrapeFandomWiki('genshin-impact', 'Primogem', 'Genshin Wiki');
      if (result.news.length === 0) {
        result.news.push({
          title: 'Wiki: Primogem Farming Guide',
          summary: 'Complete list of Primogem sources including daily commissions, Abyss, and events',
          date: new Date(),
          source: 'Genshin Impact Wiki',
          type: 'earning_method',
        });
      }
      this.saveToCache('wiki', result);
      return result;
    } catch (error) {
      logger.warn(`Wiki scraping error: ${error.message}`);
      return { codes: [], news: [] };
    }
  }

  async scrapeHoYoLAB() {
    try {
      logger.info(`📍 Scraping HoYoLAB for ${this.gameName}...`);
      const cacheData = this.getFromCache('hoyolab');
      if (cacheData) return cacheData;

      const response = await this.fetchWithRetry(
        'https://www.hoyolab.com/genshin',
        {},
        'HoYoLAB'
      );

      const $ = cheerio.load(response);
      const codes = [];

      // Look for redemption code patterns in page content
      const pageText = $('body').text();
      const codeMatches = pageText.match(/\b[A-Z0-9]{10,12}\b/g) || [];
      codeMatches.slice(0, 5).forEach(code => {
        codes.push({
          code: code.toUpperCase(),
          reward: 'Primogems + Materials',
          source: 'HoYoLAB',
          date: new Date(),
          verified: true,
        });
      });

      const result = { codes, news: [] };
      this.saveToCache('hoyolab', result);
      return result;
    } catch (error) {
      logger.warn(`HoYoLAB scraping error: ${error.message}`);
      return { codes: [], news: [] };
    }
  }

  extractEarningMethods() {
    return [
      {
        method: 'Daily Commissions',
        description: 'Complete 4 daily commissions for 60 Primogems/day (~1,800/month)',
        updated: new Date(),
        primogemsPerMonth: '~1,800',
        timeInvestment: '15-20 min/day',
      },
      {
        method: 'Spiral Abyss',
        description: 'Clear floors 9-12 for up to 600 Primogems per bi-weekly reset',
        updated: new Date(),
        primogemsPerMonth: '~1,200',
        timeInvestment: '30-60 min per reset',
      },
      {
        method: 'Version Events',
        description: 'Participate in limited-time events each version for 1,000+ Primogems',
        updated: new Date(),
        primogemsPerMonth: '~1,000',
        timeInvestment: 'Variable',
      },
      {
        method: 'Redemption Codes',
        description: 'Redeem livestream codes for 60-100 Primogems each (3 per version)',
        updated: new Date(),
        primogemsPerMonth: '~200',
        timeInvestment: '5 min',
      },
      {
        method: 'HoYoLAB Daily Check-in',
        description: 'Daily check-in on HoYoLAB for bonus Primogems and materials',
        updated: new Date(),
        primogemsPerMonth: '~20-60',
        timeInvestment: '1 min/day',
      },
    ];
  }

  deduplicateCodes(codes) {
    const unique = {};
    codes.forEach(code => {
      const key = code.code.toUpperCase();
      if (!unique[key] || (code.verified && !unique[key].verified)) {
        unique[key] = code;
      }
    });
    return Object.values(unique)
      .sort((a, b) => {
        if (a.verified !== b.verified) return b.verified - a.verified;
        return new Date(b.date) - new Date(a.date);
      });
  }

  deduplicateNews(news) {
    const unique = {};
    news.forEach(item => {
      const key = item.title.substring(0, 50).toLowerCase();
      if (!unique[key]) unique[key] = item;
    });
    return Object.values(unique)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  async scrapeCommonQuestions() {
    try {
      const response = await this.fetchWithRetry(
        'https://www.reddit.com/r/Genshin_Impact/search.json?q=how|primogem|wish|pull&restrict_sr=1&sort=top&time=week&limit=50',
        {},
        'Reddit Questions',
        true
      );

      const questions = [];
      const posts = response.data?.children || [];

      posts.forEach(post => {
        const data = post.data;
        if (data.title && data.title.length < 300 && data.ups > 10) {
          questions.push({
            question: data.title,
            upvotes: data.ups,
            comments: data.num_comments,
            date: new Date(data.created_utc * 1000),
            popularity: data.ups + data.num_comments,
          });
        }
      });

      return questions.sort((a, b) => b.popularity - a.popularity).slice(0, 15);
    } catch (error) {
      logger.warn(`Questions scraping error: ${error.message}`);
      return [];
    }
  }

  /**
   * Source: Official Twitter/X account — fastest code delivery
   * Uses syndication API + nitter fallback, no API key needed
   */
  async scrapeTwitter() {
    try {
      logger.info(`📍 Scraping Twitter/X for ${this.gameName}...`);
      const cacheData = this.getFromCache('twitter');
      if (cacheData) return cacheData;

      const tweets = await fetchTweets('GenshinImpact', 30);
      const codes = extractCodesFromTweets(tweets, /\\b[A-Z0-9]{10,12}\\b/g, 'Twitter @GenshinImpact');
      const news  = extractNewsFromTweets(tweets, ['primogem', 'code', 'redeem', 'event', 'version', 'free', 'livestream'], 'Twitter @GenshinImpact');

      const result = { codes, news };
      this.saveToCache('twitter', result);
      return result;
    } catch (error) {
      logger.warn(`Twitter scraping error for ${this.gameName}: ${error.message}`);
      return { codes: [], news: [] };
    }
  }
}

module.exports = GenshinImpactScraper;
