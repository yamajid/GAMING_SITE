/**
 * Roblox Scraper - Collects codes, news, and earning methods for Robux
 */

const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../logger');

class RobloxScraper {
  constructor() {
    this.name = 'Roblox';
    this.sources = {
      codesReddit: 'https://www.reddit.com/r/roblox/search?q=code&restrict_sr=1&sort=new',
      newsTwitter: 'https://twitter.com/search?q=roblox%20code&f=live',
      officialBlog: 'https://blog.roblox.com/',
    };
  }

  /**
   * Main scrape method
   */
  async scrape() {
    logger.info(`🔍 Scraping ${this.name}...`);
    const data = {
      codes: [],
      news: [],
      newMethods: [],
      questionsAsked: [],
      lastUpdated: new Date(),
    };

    try {
      // Scrape promo codes
      data.codes = await this.scrapePromoCodes();
      
      // Scrape news and updates
      data.news = await this.scrapeNews();
      
      // Identify new earning methods from news
      data.newMethods = this.extractNewMethods(data.news);
      
      // Extract common questions
      data.questionsAsked = await this.scrapeCommonQuestions();

      return data;
    } catch (error) {
      throw new Error(`${this.name} scraping failed: ${error.message}`);
    }
  }

  /**
   * Scrape active promo codes
   */
  async scrapePromoCodes() {
    const codes = [];

    try {
      // Method 1: Scrape from Reddit (most reliable)
      const redditCodes = await this.scrapeRedditCodes();
      codes.push(...redditCodes);

      // Method 2: Check official Roblox blog
      const blogCodes = await this.scrapeBlogCodes();
      codes.push(...blogCodes);

      // Remove duplicates
      const uniqueCodes = [...new Set(codes.map(c => c.code))].map(code => 
        codes.find(c => c.code === code)
      );

      return uniqueCodes.slice(0, 20); // Return top 20
    } catch (error) {
      logger.warn(`Failed to scrape promo codes: ${error.message}`);
      return [];
    }
  }

  /**
   * Scrape codes from Reddit
   */
  async scrapeRedditCodes() {
    try {
      const response = await axios.get(
        'https://www.reddit.com/r/roblox/search.json?q=promo%20code&restrict_sr=1&sort=new&limit=50',
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          timeout: 10000,
        }
      );

      const codes = [];
      const posts = response.data.data.children || [];

      for (const post of posts) {
        const text = `${post.data.title} ${post.data.selftext}`.toLowerCase();
        
        // Regex pattern for common Roblox code formats
        const codeMatches = text.match(/[A-Z0-9]{6,}/g) || [];
        
        for (const match of codeMatches) {
          if (match.length >= 6 && /[A-Z0-9]{6,}/.test(match)) {
            codes.push({
              code: match,
              source: 'Reddit',
              posted: new Date(post.data.created_utc * 1000),
              verified: true,
              notes: post.data.title.substring(0, 100),
            });
          }
        }
      }

      return codes;
    } catch (error) {
      logger.warn(`Reddit scraping failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Scrape codes from official blog
   */
  async scrapeBlogCodes() {
    try {
      const response = await axios.get('https://blog.roblox.com/', {
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      const codes = [];

      $('article').each((i, article) => {
        const text = $(article).text().toLowerCase();
        if (text.includes('code') || text.includes('promo')) {
          const matches = text.match(/[A-Z0-9]{6,}/g) || [];
          matches.forEach(match => {
            codes.push({
              code: match,
              source: 'Official Blog',
              verified: true,
              posted: new Date(),
            });
          });
        }
      });

      return codes;
    } catch (error) {
      logger.warn(`Blog scraping failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Scrape news and updates
   */
  async scrapeNews() {
    try {
      const response = await axios.get('https://blog.roblox.com/', {
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      const news = [];

      $('article').slice(0, 10).each((i, article) => {
        const title = $(article).find('h2, .title').text().trim();
        const summary = $(article).find('p').first().text().trim();
        const date = $(article).find('time').attr('datetime') || new Date().toISOString();

        if (title) {
          news.push({
            title,
            summary: summary.substring(0, 200),
            date: new Date(date),
            source: 'Official Blog',
            relevance: this.calculateRelevance(title + ' ' + summary),
          });
        }
      });

      return news;
    } catch (error) {
      logger.warn(`News scraping failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Extract new earning methods from news
   */
  extractNewMethods(news) {
    const methods = [];
    const keywords = ['earn', 'robux', 'free', 'cash', 'dev', 'exchange', 'reward'];

    news.forEach(item => {
      const text = (item.title + ' ' + item.summary).toLowerCase();
      if (keywords.some(kw => text.includes(kw))) {
        methods.push({
          method: item.title,
          description: item.summary,
          updated: item.date,
          source: item.source,
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
      const response = await axios.get(
        'https://www.reddit.com/r/roblox/search.json?q=how%20to&restrict_sr=1&sort=new&limit=30',
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          timeout: 10000,
        }
      );

      const questions = [];
      const posts = response.data.data.children || [];

      posts.forEach(post => {
        if (post.data.title && post.data.title.length < 200) {
          questions.push({
            question: post.data.title,
            upvotes: post.data.ups,
            comments: post.data.num_comments,
            date: new Date(post.data.created_utc * 1000),
          });
        }
      });

      return questions.slice(0, 10);
    } catch (error) {
      logger.warn(`Questions scraping failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Calculate relevance score (0-1)
   */
  calculateRelevance(text) {
    const keywords = ['free', 'earn', 'robux', 'code', 'promo', 'reward'];
    let score = 0;
    keywords.forEach(kw => {
      if (text.toLowerCase().includes(kw)) score += 0.1;
    });
    return Math.min(score, 1);
  }
}

module.exports = RobloxScraper;
