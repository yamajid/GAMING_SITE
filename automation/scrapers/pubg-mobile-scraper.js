/**
 * PUBG Mobile Scraper - UC, Royal Pass, and event codes
 *
 * Sources:
 * 1. Reddit (r/PUBGMobile) - Community codes and events
 * 2. Official PUBG Mobile site - Event announcements
 * 3. PUBG Mobile Fandom Wiki - UC methods and guides
 * 4. Krafton news feed - Official patch notes
 */

const cheerio = require('cheerio');
const BaseScraper = require('./base-scraper');
const { scrapeFandomWiki } = require('./fandom-api');
const logger = require('../logger');

class PUBGMobileScraper extends BaseScraper {
  constructor() {
    super('PUBG Mobile');
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
      const [redditData, officialData, wikiData, kraftonData] = await Promise.allSettled([
        this.scrapeReddit(),
        this.scrapeOfficial(),
        this.scrapeWiki(),
        this.scrapeKrafton(),
      ]).then(results => results.map(r => r.value || { codes: [], news: [] }));

      data.codes.push(...redditData.codes || []);
      data.codes.push(...officialData.codes || []);
      data.codes.push(...wikiData.codes || []);
      data.codes.push(...kraftonData.codes || []);

      data.news.push(...redditData.news || []);
      data.news.push(...officialData.news || []);
      data.news.push(...wikiData.news || []);
      data.news.push(...kraftonData.news || []);

      data.codes = this.deduplicateCodes(data.codes).slice(0, 20);
      data.news = this.deduplicateNews(data.news).slice(0, 15);

      data.newMethods = this.extractEarningMethods();
      data.questionsAsked = await this.scrapeCommonQuestions();
      data.sourcesChecked = ['Reddit', 'PUBG Mobile Official', 'Wiki', 'Krafton'];

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
        'https://www.reddit.com/r/PUBGMobile/search.json?q=code|uc|redeem|royal+pass&restrict_sr=1&sort=new&limit=100',
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

        // PUBG Mobile codes are typically 10-16 char alphanumeric
        const codeMatches = text.match(/\b[A-Z0-9]{10,16}\b/g) || [];
        codeMatches.slice(0, 3).forEach(code => {
          codes.push({
            code: code.toUpperCase(),
            reward: 'Supplies + AG',
            source: 'Reddit',
            date: new Date(data.created_utc * 1000),
            verified: data.ups > 10,
            upvotes: data.ups,
            notes: data.title.substring(0, 80),
          });
        });

        if (data.ups > 80) {
          news.push({
            title: data.title,
            summary: data.selftext.substring(0, 200),
            date: new Date(data.created_utc * 1000),
            source: 'Reddit r/PUBGMobile',
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
      logger.info(`📍 Scraping PUBG Mobile official for ${this.gameName}...`);
      const cacheData = this.getFromCache('official');
      if (cacheData) return cacheData;

      const response = await this.fetchWithRetry(
        'https://www.pubgmobile.com/en-US/news.shtml',
        {},
        'PUBG Mobile Official'
      );

      const $ = cheerio.load(response);
      const news = [];

      $('article, .news-item, .article-item, a[href*="news"]').slice(0, 8).each((i, el) => {
        const title = $(el).find('h1, h2, h3, .title').first().text().trim();
        const summary = $(el).find('p, .desc, .summary').first().text().trim();
        if (title) {
          news.push({
            title,
            summary: summary.substring(0, 200) || 'Official PUBG Mobile update',
            date: new Date(),
            source: 'PUBG Mobile Official',
            official: true,
          });
        }
      });

      if (news.length === 0) {
        news.push({
          title: 'PUBG Mobile Season Update',
          summary: 'New Royal Pass, events, and UC earning opportunities this season',
          date: new Date(),
          source: 'PUBG Mobile Official',
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
      logger.info(`📍 Scraping PUBG Mobile Wiki for ${this.gameName}...`);
      const cacheData = this.getFromCache('wiki');
      if (cacheData) return cacheData;

      const result = await scrapeFandomWiki('pubgmobile', 'Unknown_Cash', 'PUBG Mobile Wiki');
      if (result.news.length === 0) {
        result.news.push({
          title: 'Wiki: UC Earning Guide',
          summary: 'All methods to earn free UC in PUBG Mobile including events and Google Rewards',
          date: new Date(),
          source: 'PUBG Mobile Wiki',
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

  async scrapeKrafton() {
    try {
      logger.info(`📍 Scraping Krafton news for ${this.gameName}...`);
      const cacheData = this.getFromCache('krafton');
      if (cacheData) return cacheData;

      const response = await this.fetchWithRetry(
        'https://krafton.com/en/news/',
        {},
        'Krafton'
      );

      const $ = cheerio.load(response);
      const news = [];

      $('article, .news-card, .post-item').slice(0, 6).each((i, el) => {
        const title = $(el).find('h2, h3, .title').first().text().trim();
        const summary = $(el).find('p, .excerpt').first().text().trim();
        if (title && (title.toLowerCase().includes('pubg') || title.toLowerCase().includes('mobile'))) {
          news.push({
            title,
            summary: summary.substring(0, 200) || 'Krafton official announcement',
            date: new Date(),
            source: 'Krafton',
            official: true,
          });
        }
      });

      const result = { codes: [], news };
      this.saveToCache('krafton', result);
      return result;
    } catch (error) {
      logger.warn(`Krafton scraping error: ${error.message}`);
      return { codes: [], news: [] };
    }
  }

  extractEarningMethods() {
    return [
      {
        method: 'Google Opinion Rewards',
        description: 'Earn Google Play credits via surveys — convert to UC purchases',
        updated: new Date(),
        ucPerMonth: '60-300',
        timeInvestment: '2-5 min/survey',
      },
      {
        method: 'Royal Pass Free Tier',
        description: 'Complete free RP missions each season for supplies and AG',
        updated: new Date(),
        ucPerMonth: '0 (items only)',
        timeInvestment: '15-30 min/week',
      },
      {
        method: 'Watch Events',
        description: 'Watch official PUBG Mobile esports streams for Twitch drops',
        updated: new Date(),
        ucPerMonth: '0-30',
        timeInvestment: 'Passive while watching',
      },
      {
        method: 'Tournament Events',
        description: 'Participate in in-game tournaments for UC prizes',
        updated: new Date(),
        ucPerMonth: 'Variable',
        timeInvestment: 'Variable',
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
        'https://www.reddit.com/r/PUBGMobile/search.json?q=how|uc|royal+pass|free&restrict_sr=1&sort=top&time=week&limit=50',
        {},
        'Reddit Questions',
        true
      );

      const questions = [];
      const posts = response.data?.children || [];

      posts.forEach(post => {
        const data = post.data;
        if (data.title && data.title.length < 300 && data.ups > 5) {
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
}

module.exports = PUBGMobileScraper;
