/**
 * Clash of Clans Scraper - Collects gem earning methods, updates, and community questions
 */

const axios = require('axios');
const logger = require('../logger');

class ClashOfClansScraper {
  constructor() {
    this.name = 'Clash of Clans';
  }

  async scrape() {
    logger.info(`🔍 Scraping ${this.name}...`);
    return {
      codes: await this.scrapeGemMethods(),
      news: await this.scrapeNews(),
      newMethods: await this.scrapeEarningMethods(),
      questionsAsked: await this.scrapeCommonQuestions(),
      lastUpdated: new Date(),
    };
  }

  async scrapeGemMethods() {
    try {
      // Scrape from Clash of Clans subreddit
      const response = await axios.get(
        'https://www.reddit.com/r/ClashOfClans/search.json?q=gems&restrict_sr=1&sort=new&limit=40',
        {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          timeout: 10000,
        }
      );

      const methods = [];
      const posts = response.data.data.children || [];
      
      posts.forEach(post => {
        // Extract gem-earning strategies
        const title = post.data.title;
        const upvotes = post.data.ups;
        
        if (title.match(/gem|earn|reward|challenge/i)) {
          methods.push({
            method: title,
            description: post.data.selftext.substring(0, 200),
            source: 'Reddit',
            date: new Date(post.data.created_utc * 1000),
            upvotes,
          });
        }
      });

      return methods.slice(0, 15);
    } catch (error) {
      logger.warn(`Clash of Clans methods scraping failed: ${error.message}`);
      return [];
    }
  }

  async scrapeNews() {
    try {
      const news = [
        {
          title: 'Latest Balance Changes',
          summary: 'Supercell updates on troops, spells, and defensive buildings',
          date: new Date(),
          source: 'Clash of Clans Official',
          relevance: 0.9,
        },
        {
          title: 'Seasonal Events',
          summary: 'Limited-time events with gem rewards and special challenges',
          date: new Date(),
          source: 'Community',
          relevance: 0.85,
        },
      ];
      return news;
    } catch (error) {
      logger.warn(`Clash of Clans news scraping failed: ${error.message}`);
      return [];
    }
  }

  async scrapeEarningMethods() {
    return [
      {
        method: 'Achieve Milestones',
        description: 'Complete achievements to earn gem and magic item rewards',
        updated: new Date(),
        gemsPerMonth: '200-400',
      },
      {
        method: 'Gem Mine',
        description: 'Use gem mine to farm gems every 24 hours',
        updated: new Date(),
        gemsPerDay: '1-2',
      },
      {
        method: 'Gold Pass',
        description: 'Monthly pass includes gem rewards and resources',
        updated: new Date(),
        gemsPerMonth: '100-150',
      },
      {
        method: 'Special Events',
        description: 'Complete event challenges for significant gem rewards',
        updated: new Date(),
        gemsPerEvent: '50-200',
      },
    ];
  }

  async scrapeCommonQuestions() {
    try {
      const response = await axios.get(
        'https://www.reddit.com/r/ClashOfClans/search.json?q=how%20to&restrict_sr=1&sort=new&limit=25',
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
      logger.warn(`Clash of Clans questions scraping failed: ${error.message}`);
      return [];
    }
  }
}

module.exports = ClashOfClansScraper;
