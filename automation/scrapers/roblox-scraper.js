/**
 * Roblox Scraper - Enhanced with 4 data sources
 * 
 * Sources:
 * 1. Reddit (r/roblox) - Community codes and discussions
 * 2. Official Roblox Blog - Official announcements and events
 * 3. RobloxWiki.com - Developer info and earning strategies
 * 4. Community Discord channels (via web scraping)
 */

const axios = require('axios');
const cheerio = require('cheerio');
const BaseScraper = require('./base-scraper');
const logger = require('../logger');

class RobloxScraper extends BaseScraper {
  constructor() {
    super('Roblox');
    this.sources = {
      reddit: 'https://www.reddit.com/r/roblox/',
      blog: 'https://blog.roblox.com/',
      wiki: 'https://roblox.fandom.com/wiki/Robux',
      updates: 'https://updates.roblox.com/',
    };
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
      // Parallel fetch from all sources (with error handling)
      const [redditData, blogData, wikiData, updatesData] = await Promise.allSettled([
        this.scrapeReddit(),
        this.scrapeBlog(),
        this.scrapeWiki(),
        this.scrapeUpdates(),
      ]).then(results => results.map(r => r.value || { codes: [], news: [] }));

      // Aggregate data
      data.codes.push(...redditData.codes || []);
      data.codes.push(...blogData.codes || []);
      data.codes.push(...wikiData.codes || []);
      data.codes.push(...updatesData.codes || []);

      data.news.push(...redditData.news || []);
      data.news.push(...blogData.news || []);
      data.news.push(...wikiData.news || []);
      data.news.push(...updatesData.news || []);

      // Remove duplicates and sort by date
      data.codes = this.deduplicateCodes(data.codes).slice(0, 30);
      data.news = this.deduplicateNews(data.news).slice(0, 20);

      // Extract earning methods from news
      data.newMethods = this.extractNewMethods(data.news);

      // Extract common questions
      data.questionsAsked = await this.scrapeCommonQuestions();

      data.sourcesChecked = Object.keys(this.sources);

      logger.success(`✅ ${this.gameName}: Found ${data.codes.length} codes, ${data.news.length} news items`);
      return data;
    } catch (error) {
      throw new Error(`${this.gameName} scraping failed: ${error.message}`);
    }
  }

  /**
   * Source 1: Scrape from Reddit (r/roblox)
   */
  async scrapeReddit() {
    try {
      logger.info(`📍 Scraping Reddit for ${this.gameName}...`);
      const cacheData = this.getFromCache('reddit');
      if (cacheData) return cacheData;

      const response = await this.fetchWithRetry(
        'https://www.reddit.com/r/roblox/search.json?q=code|promo&restrict_sr=1&sort=new&limit=100',
        {},
        'Reddit'
      );

      const codes = [];
      const news = [];
      const posts = response.data?.children || [];

      posts.forEach(post => {
        const data = post.data;
        const text = `${data.title} ${data.selftext}`.toLowerCase();

        // Extract codes (6+ alphanumeric characters)
        const codeMatches = text.match(/\b[A-Z0-9]{6,10}\b/g) || [];
        codeMatches.slice(0, 3).forEach(code => {
          codes.push({
            code: code.toUpperCase(),
            source: 'Reddit',
            posted: new Date(data.created_utc * 1000),
            verified: data.ups > 5, // Upvote-verified
            notes: data.title.substring(0, 100),
            upvotes: data.ups,
          });
        });

        // Extract news if high engagement
        if (data.ups > 100 && text.includes('free')) {
          news.push({
            title: data.title,
            summary: data.selftext.substring(0, 200),
            date: new Date(data.created_utc * 1000),
            source: 'Reddit r/roblox',
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
   * Source 2: Scrape from Official Roblox Blog
   */
  async scrapeBlog() {
    try {
      logger.info(`📍 Scraping Official Blog for ${this.gameName}...`);
      const cacheData = this.getFromCache('blog');
      if (cacheData) return cacheData;

      const response = await this.fetchWithRetry(
        'https://blog.roblox.com/',
        {},
        'Official Blog'
      );

      const $ = cheerio.load(response);
      const codes = [];
      const news = [];

      // Parse blog posts (adjusts for Roblox blog structure)
      $('article, .post').slice(0, 15).each((i, element) => {
        const title = $(element).find('h2, h3, .post-title').text().trim();
        const summary = $(element).find('p, .post-excerpt').first().text().trim();
        const dateStr = $(element).find('time, .post-date').attr('datetime') || 
                        $(element).find('.date').text();

        if (title && (title.includes('code') || title.includes('event'))) {
          const codeMatches = title.match(/[A-Z0-9]{6,10}/g) || [];
          codeMatches.forEach(code => {
            codes.push({
              code: code.toUpperCase(),
              source: 'Official Blog',
              date: dateStr ? new Date(dateStr) : new Date(),
              verified: true, // Official source
              notes: title,
            });
          });
        }

        if (title) {
          news.push({
            title,
            summary: summary.substring(0, 200) || 'Official update',
            date: dateStr ? new Date(dateStr) : new Date(),
            source: 'Roblox Blog',
            official: true,
          });
        }
      });

      const result = { codes, news };
      this.saveToCache('blog', result);
      return result;
    } catch (error) {
      logger.warn(`Blog scraping error: ${error.message}`);
      return { codes: [], news: [] };
    }
  }

  /**
   * Source 3: Scrape from Roblox Wiki/Fandom
   */
  async scrapeWiki() {
    try {
      logger.info(`📍 Scraping Roblox Wiki for ${this.gameName}...`);
      const cacheData = this.getFromCache('wiki');
      if (cacheData) return cacheData;

      const response = await this.fetchWithRetry(
        'https://roblox.fandom.com/wiki/Robux',
        {},
        'Roblox Wiki'
      );

      const $ = cheerio.load(response);
      const codes = [];
      const news = [];

      // Extract earning methods from wiki
      $('h2, h3').each((i, heading) => {
        const title = $(heading).text().trim();
        const section = $(heading).nextUntil('h2, h3');
        const content = section.text().substring(0, 300);

        if (title && (title.includes('earn') || title.includes('free'))) {
          news.push({
            title: `Wiki: ${title}`,
            summary: content,
            date: new Date(),
            source: 'Roblox Wiki',
            type: 'earning_method',
          });
        }
      });

      // Look for promo codes in tables/lists
      $('table, ul').each((i, table) => {
        const text = $(table).text();
        const codeMatches = text.match(/\b[A-Z0-9]{6,10}\b/g) || [];
        codeMatches.slice(0, 2).forEach(code => {
          codes.push({
            code: code.toUpperCase(),
            source: 'Roblox Wiki',
            verified: true,
            date: new Date(),
          });
        });
      });

      const result = { codes, news };
      this.saveToCache('wiki', result);
      return result;
    } catch (error) {
      logger.warn(`Wiki scraping error: ${error.message}`);
      return { codes: [], news: [] };
    }
  }

  /**
   * Source 4: Scrape from Roblox Updates/News Feed
   */
  async scrapeUpdates() {
    try {
      logger.info(`📍 Scraping Official Updates for ${this.gameName}...`);
      const cacheData = this.getFromCache('updates');
      if (cacheData) return cacheData;

      const response = await this.fetchWithRetry(
        'https://updates.roblox.com/',
        {},
        'Roblox Updates'
      );

      const $ = cheerio.load(response);
      const news = [];

      // Parse updates/announcements
      $('article, .update-item, .news-item').slice(0, 10).each((i, element) => {
        const title = $(element).find('h2, h3, .title').text().trim();
        const content = $(element).find('p, .description').first().text().trim();

        if (title) {
          news.push({
            title,
            summary: content.substring(0, 250),
            date: new Date(),
            source: 'Roblox Updates',
            priority: 'high',
          });
        }
      });

      const result = { codes: [], news };
      this.saveToCache('updates', result);
      return result;
    } catch (error) {
      logger.warn(`Updates scraping error: ${error.message}`);
      return { codes: [], news: [] };
    }
  }

  /**
   * Deduplicate codes and sort by verification status and date
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
        // Verified codes first, then by date
        if (a.verified !== b.verified) return b.verified - a.verified;
        return new Date(b.date) - new Date(a.date);
      });
  }

  /**
   * Deduplicate news and sort by date
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
   * Extract earning methods from news
   */
  extractNewMethods(news) {
    const methods = [];
    const keywords = ['earn', 'free', 'robux', 'reward', 'exchange', 'game', 'method'];

    news.forEach(item => {
      const text = (item.title + ' ' + item.summary).toLowerCase();
      if (keywords.filter(kw => text.includes(kw)).length >= 2) {
        methods.push({
          method: item.title.substring(0, 80),
          description: item.summary.substring(0, 150),
          updated: item.date,
          source: item.source,
          type: item.type || 'opportunity',
        });
      }
    });

    return methods.slice(0, 5);
  }

  /**
   * Scrape common questions from Reddit
   */
  async scrapeCommonQuestions() {
    try {
      const response = await this.fetchWithRetry(
        'https://www.reddit.com/r/roblox/search.json?q=how|where|what|why&restrict_sr=1&sort=top&time=week&limit=50',
        {},
        'Reddit Questions'
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

      return questions
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 15);
    } catch (error) {
      logger.warn(`Questions scraping error: ${error.message}`);
      return [];
    }
}

module.exports = RobloxScraper;
