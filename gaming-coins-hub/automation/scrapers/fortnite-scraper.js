/**
 * Fortnite Scraper - Collects codes, news, and V-Bucks methods
 */

const axios = require('axios');
const logger = require('../logger');

class FortniteScraper {
  constructor() {
    this.name = 'Fortnite';
  }

  async scrape() {
    logger.info(`🔍 Scraping ${this.name}...`);
    return {
      codes: await this.scrapeVBucksCodes(),
      news: await this.scrapeNews(),
      newMethods: await this.scrapeEarningMethods(),
      questionsAsked: await this.scrapeCommonQuestions(),
      lastUpdated: new Date(),
    };
  }

  async scrapeVBucksCodes() {
    try {
      // Scrape from Fortnite subreddit and Twitter
      const codes = [];
      
      // Reddit endpoint
      const response = await axios.get(
        'https://www.reddit.com/r/FortniteBR/search.json?q=code&restrict_sr=1&sort=new&limit=50',
        {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          timeout: 10000,
        }
      );

      const posts = response.data.data.children || [];
      posts.forEach(post => {
        const matches = post.data.selftext.match(/[A-Z0-9]{10,}/g) || [];
        matches.forEach(code => {
          codes.push({
            code,
            source: 'Reddit',
            posted: new Date(post.data.created_utc * 1000),
            verified: post.data.ups > 50,
          });
        });
      });

      return codes.slice(0, 15);
    } catch (error) {
      logger.warn(`Fortnite codes scraping failed: ${error.message}`);
      return [];
    }
  }

  async scrapeNews() {
    try {
      // Scrape from Fortnite official or gaming news sites
      const news = [
        {
          title: 'Latest Fortnite Updates',
          summary: 'Check official Fortnite blog for new cosmetics, events, and V-Bucks drops',
          date: new Date(),
          source: 'Fortnite Official',
          relevance: 0.9,
        },
      ];
      return news;
    } catch (error) {
      logger.warn(`Fortnite news scraping failed: ${error.message}`);
      return [];
    }
  }

  async scrapeEarningMethods() {
    return [
      {
        method: 'Save the World Daily Missions',
        description: 'Complete daily missions in Save the World PvE mode for V-Bucks',
        updated: new Date(),
        vbucksPer: '50-100',
      },
      {
        method: 'Battle Pass Challenges',
        description: 'Complete seasonal challenges to earn V-Bucks',
        updated: new Date(),
        vbucksPer: '50-100',
      },
    ];
  }

  async scrapeCommonQuestions() {
    try {
      const response = await axios.get(
        'https://www.reddit.com/r/FortniteBR/search.json?q=how%20to&restrict_sr=1&sort=new&limit=20',
        {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          timeout: 10000,
        }
      );

      return (response.data.data.children || []).map(post => ({
        question: post.data.title,
        upvotes: post.data.ups,
        date: new Date(post.data.created_utc * 1000),
      })).slice(0, 10);
    } catch (error) {
      logger.warn(`Fortnite questions scraping failed: ${error.message}`);
      return [];
    }
  }
}

module.exports = FortniteScraper;
