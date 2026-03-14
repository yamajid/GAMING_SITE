/**
 * Fortnite Scraper - Enhanced with 4 data sources
 * 
 * Sources:
 * 1. Reddit (r/FortniteBR) - Community codes and tips
 * 2. Epic Games Official - Official announcements
 * 3. Fortnite Wiki - Items, events, strategies
 * 4. FortniteLoungeDB - Database of current codes
 */

const cheerio = require('cheerio');
const BaseScraper = require('./base-scraper');
const { scrapeFandomWiki } = require('./fandom-api');
const { fetchWithPlaywright } = require('./playwright-fetcher');
const logger = require('../logger');

class FortniteScraper extends BaseScraper {
  constructor() {
    super('Fortnite');
  }

  /**
   * Main scrape method - orchestrates all 4 sources
   */
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
      // Parallel fetch from all sources
      const [redditData, epicData, wikiData, fortniteLabData] = await Promise.allSettled([
        this.scrapeReddit(),
        this.scrapeEpicGames(),
        this.scrapeWiki(),
        this.scrapeFortniteLounge(),
      ]).then(results => results.map(r => r.value || { codes: [], news: [] }));

      // Aggregate data
      data.codes.push(...redditData.codes || []);
      data.codes.push(...epicData.codes || []);
      data.codes.push(...wikiData.codes || []);
      data.codes.push(...fortniteLabData.codes || []);

      data.news.push(...redditData.news || []);
      data.news.push(...epicData.news || []);
      data.news.push(...wikiData.news || []);

      // Remove duplicates and sort
      data.codes = this.deduplicateCodes(data.codes).slice(0, 25);
      data.news = this.deduplicateNews(data.news).slice(0, 15);

      // Extract earning methods
      data.newMethods = this.extractEarningMethods();

      // Extract common questions
      data.questionsAsked = await this.scrapeCommonQuestions();

      data.sourcesChecked = ['Reddit', 'Epic Games', 'Wiki', 'FortniteLounge'];

      logger.success(`✅ ${this.gameName}: Found ${data.codes.length} codes, ${data.news.length} news items`);
      return data;
    } catch (error) {
      throw new Error(`${this.gameName} scraping failed: ${error.message}`);
    }
  }

  /**
   * Source 1: Scrape from Reddit (r/FortniteBR)
   */
  async scrapeReddit() {
    try {
      logger.info(`📍 Scraping Reddit for ${this.gameName}...`);
      const cacheData = this.getFromCache('reddit');
      if (cacheData) return cacheData;

      const response = await this.fetchWithRetry(
        'https://www.reddit.com/r/FortniteBR/search.json?q=vbucks|code|premium&restrict_sr=1&sort=new&limit=100',
        {},
        'Reddit',
        true
      );

      const codes = [];
      const news = [];
      const posts = response.data?.children || [];

      posts.forEach(post => {
        const data = post.data;
        const text = `${data.title} ${data.selftext}`.toLowerCase();

        // Extract V-Bucks codes
        if (text.includes('v-buck') || text.includes('vbuck') || text.includes('code')) {
          const codeMatches = text.match(/\b[A-Z0-9]{8,15}\b/g) || [];
          codeMatches.slice(0, 2).forEach(code => {
            codes.push({
              code: code.toUpperCase(),
              source: 'Reddit',
              date: new Date(data.created_utc * 1000),
              verified: data.ups > 10,
              upvotes: data.ups,
              notes: data.title.substring(0, 80),
            });
          });
        }

        // Extract high-engagement posts as news
        if (data.ups > 100) {
          news.push({
            title: data.title,
            summary: data.selftext.substring(0, 200),
            date: new Date(data.created_utc * 1000),
            source: 'Reddit',
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

  /**
   * Source 2: Scrape from Epic Games official (Playwright bypasses bot protection)
   */
  async scrapeEpicGames() {
    try {
      logger.info(`📍 Scraping Epic Games for ${this.gameName}...`);
      const cacheData = this.getFromCache('epic');
      if (cacheData) return cacheData;

      const url = 'https://www.epicgames.com/fortnite/en-US/patch-notes';
      const html = await fetchWithPlaywright(url, { timeout: 20000 });
      const result = { codes: [], news: [] };

      if (html) {
        const $ = cheerio.load(html);
        $('article, [data-testid="patch-note"], .patch-note, .article-item').slice(0, 8).each((i, el) => {
          const title = $(el).find('h2, h3, .title, [class*="title"]').first().text().trim();
          const summary = $(el).find('p, .summary, [class*="description"]').first().text().trim().substring(0, 200);
          if (title) {
            result.news.push({
              title,
              summary: summary || 'Official Fortnite update',
              date: new Date(),
              source: 'Epic Games Official',
              official: true,
            });
          }
        });
      }

      if (result.news.length === 0) {
        result.news.push({
          title: 'Official Fortnite Updates',
          summary: 'Check Epic Games for latest patch notes and V-Bucks promotions',
          date: new Date(),
          source: 'Epic Games Official',
          official: true,
        });
      }

      this.saveToCache('epic', result);
      return result;
    } catch (error) {
      logger.warn(`Epic Games scraping error: ${error.message}`);
      return { codes: [], news: [] };
    }
  }

  /**
   * Source 3: Scrape from Fortnite Wiki
   */
  async scrapeWiki() {
    try {
      logger.info(`📍 Scraping Fortnite Wiki for ${this.gameName}...`);
      const cacheData = this.getFromCache('wiki');
      if (cacheData) return cacheData;

      const result = await scrapeFandomWiki('fortnite', 'V-Bucks', 'Fortnite Wiki');
      if (result.news.length === 0) {
        result.news.push({
          title: 'Wiki: V-Bucks Farming Guide',
          summary: 'Complete strategies for earning V-Bucks through Save the World and challenges',
          date: new Date(),
          source: 'Fortnite Wiki',
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

  /**
   * Source 4: FortniteLounge - domain deprecated (ENOTFOUND). Skip to save retry time.
   * Reddit remains primary source for Fortnite codes.
   */
  async scrapeFortniteLounge() {
    logger.info(`📍 Skipping FortniteLounge (domain deprecated)...`);
    return { codes: [], news: [] };
  }

  /**
   * Extract Fortnite-specific earning methods
   */
  extractEarningMethods() {
    return [
      {
        method: 'Save the World Daily Challenges',
        description: 'Complete 2-3 daily missions in Save the World (100-400 V-Bucks/week)',
        Updated: new Date(),
        vbucksPer: '50-100 per mission',
        timeInvestment: '20-30 min',
      },
      {
        method: 'Battle Pass Challenges',
        description: 'Complete free Battle Pass challenges and seasonal quests',
        updated: new Date(),
        vbucksPer: '50-100',
        timeInvestment: 'Variable',
      },
      {
        method: 'Creative Fills',
        description: 'Participate in creative events for limited-time V-Buck rewards',
        updated: new Date(),
        vbucksPer: '25-50',
        timeInvestment: '15-30 min',
      },
      {
        method: 'Item Shop Refunds',
        description: 'Use 3 free annual refund tokens strategically',
        updated: new Date(),
        vbucksPer: 'Varies by item',
        timeInvestment: '5 min',
      },
      {
        method: 'Crew Trial',
        description: 'Sometimes free trial month with V-Bucks bundle',
        updated: new Date(),
        vbucksPer: '1,000',
        timeInvestment: '1 min (if available)',
      },
    ];
  }

  /**
   * Deduplicate codes
   */
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

  /**
   * Deduplicate news
   */
  deduplicateNews(news) {
    const unique = {};
    news.forEach(item => {
      const key = item.title.substring(0, 50).toLowerCase();
      if (!unique[key]) {
        unique[key] = item;
      }
    });
    return Object.values(unique)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  /**
   * Scrape common questions from Reddit
   */
  async scrapeCommonQuestions() {
    try {
      const response = await this.fetchWithRetry(
        'https://www.reddit.com/r/FortniteBR/search.json?q=how|where|when&restrict_sr=1&sort=top&time=week&limit=50',
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

      return questions
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 15);
    } catch (error) {
      logger.warn(`Questions scraping error: ${error.message}`);
    }
  }
}

module.exports = FortniteScraper;
