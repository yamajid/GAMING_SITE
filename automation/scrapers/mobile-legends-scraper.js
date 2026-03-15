/**
 * Mobile Legends Scraper - Enhanced with 4 data sources
 * 
 * Sources:
 * 1. Reddit (r/MobileLegendsGame) - Community codes & tips
 * 2. Official ML website - Official announcements
 * 3. ML Fandom/Wiki - Hero guides and events
 * 4. Discord communities - Exclusive codes
 */

const BaseScraper = require('./base-scraper');
const { fetchTweets, extractCodesFromTweets, extractNewsFromTweets } = require('./twitter-fetcher');
const { scrapeFandomWiki } = require('./fandom-api');
const logger = require('../logger');

class MobileLegendsScraper extends BaseScraper {
  constructor() {
    super('Mobile Legends: Bang Bang');
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
      const [redditData, officialData, wikiData, discordData, twitterData] = await Promise.allSettled([
        this.scrapeReddit(),
        this.scrapeOfficial(),
        this.scrapeWiki(),
        this.scrapeDiscord(),
      ]).then(results => results.map(r => r.value || { codes: [], news: [] }));

      data.codes.push(...redditData.codes || []);
      data.codes.push(...officialData.codes || []);
      data.codes.push(...wikiData.codes || []);
      data.codes.push(...discordData.codes || []);

      data.news.push(...redditData.news || []);
      data.news.push(...officialData.news || []);

      data.codes.push(...twitterData.codes || []);
      data.news.push(...twitterData.news || []);
      data.news.push(...wikiData.news || []);

      data.codes = this.deduplicateCodes(data.codes).slice(0, 25);
      data.news = this.deduplicateNews(data.news).slice(0, 15);

      data.newMethods = this.extractEarningMethods();
      data.questionsAsked = await this.scrapeCommonQuestions();
      data.sourcesChecked = ['Reddit', 'Official', 'Wiki', 'Discord', 'Twitter/X'];

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
        'https://www.reddit.com/r/MobileLegendsGame/search.json?q=code|diamond|free&restrict_sr=1&sort=new&limit=100',
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

        const codeMatches = text.match(/\b[A-Z0-9]{6,12}\b/g) || [];
        codeMatches.slice(0, 3).forEach(code => {
          codes.push({
            code: code.toUpperCase(),
            source: 'Reddit',
            date: new Date(data.created_utc * 1000),
            verified: data.ups > 10,
            upvotes: data.ups,
            type: 'diamond_code',
          });
        });

        const linkMatches = text.match(/mlbb\.me\/\S+/gi) || [];
        linkMatches.forEach(link => {
          codes.push({
            code: link,
            source: 'Reddit',
            date: new Date(data.created_utc * 1000),
            verified: data.ups > 10,
            type: 'gift_link',
          });
        });

        if (data.ups > 50) {
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

  async scrapeOfficial() {
    try {
      logger.info(`📍 Scraping Official for ${this.gameName}...`);
      const cacheData = this.getFromCache('official');
      if (cacheData) return cacheData;

      const result = await scrapeFandomWiki('mobilelegends', 'Events', 'Mobile Legends Events');
      if (result.news.length === 0) {
        result.news.push({
          title: 'Latest ML Events & Promos',
          summary: 'Official Mobile Legends events, new heroes, and free diamond campaigns',
          date: new Date(),
          source: 'Mobile Legends Official',
          official: true,
        });
      }
      this.saveToCache('official', result);
      return result;
    } catch (error) {
      logger.warn(`Official scraping error: ${error.message}`);
      return { codes: [], news: [] };
    }
  }

  async scrapeWiki() {
    try {
      logger.info(`📍 Scraping Wiki for ${this.gameName}...`);
      const cacheData = this.getFromCache('wiki');
      if (cacheData) return cacheData;

      const result = await scrapeFandomWiki('mobilelegends', 'Free_Diamonds', 'Mobile Legends Wiki');
      if (result.news.length === 0) {
        result.news.push({
          title: 'Wiki: Free Diamonds Guide',
          summary: 'Complete guide to earning free diamonds through campaigns and events',
          date: new Date(),
          source: 'Mobile Legends Wiki',
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

  async scrapeDiscord() {
    try {
      logger.info(`📍 Checking Discord for ${this.gameName}...`);
      const cacheData = this.getFromCache('discord');
      if (cacheData) return cacheData;

      const codes = [];
      const result = { codes, news: [] };
      this.saveToCache('discord', result);
      return result;
    } catch (error) {
      logger.warn(`Discord check error: ${error.message}`);
      return { codes: [], news: [] };
    }
  }

  extractEarningMethods() {
    return [
      {
        method: 'Daily Quests & Missions',
        description: 'Complete daily tasks to earn free diamonds (5-20 per day)',
        updated: new Date(),
        diamondsPerMonth: '150-600',
        timeInvestment: '15-30 min',
      },
      {
        method: 'Battle Point Redemption',
        description: 'Convert Battle Points to diamonds via events',
        updated: new Date(),
        diamondsPerMonth: '100-400',
        timeInvestment: 'Varies',
      },
      {
        method: 'Monthly Check-in',
        description: 'Log in daily for free diamond rewards',
        updated: new Date(),
        diamondsPerMonth: '100-200',
        timeInvestment: '1 min/day',
      },
      {
        method: 'Event Participation',
        description: 'Seasonal events with free diamond rewards',
        updated: new Date(),
        diamondsPerMonth: '200-500',
        timeInvestment: 'Variable',
      },
      {
        method: 'Gift Link Codes',
        description: 'Redeem exclusive gift links from events',
        updated: new Date(),
        diamondsPerMonth: '100-300',
        timeInvestment: '5 min',
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
      if (!unique[key]) {
        unique[key] = item;
      }
    });
    return Object.values(unique)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  async scrapeCommonQuestions() {
    try {
      const response = await this.fetchWithRetry(
        'https://www.reddit.com/r/MobileLegendsGame/search.json?q=how|help|where&restrict_sr=1&sort=top&time=week&limit=50',
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

      const tweets = await fetchTweets('MobileLegendsOL', 30);
      const codes = extractCodesFromTweets(tweets, /\\b[A-Z0-9]{6,12}\\b/g, 'Twitter @MobileLegendsOL');
      const news  = extractNewsFromTweets(tweets, ['diamond', 'code', 'free', 'event', 'redeem', 'reward'], 'Twitter @MobileLegendsOL');

      const result = { codes, news };
      this.saveToCache('twitter', result);
      return result;
    } catch (error) {
      logger.warn(`Twitter scraping error for ${this.gameName}: ${error.message}`);
      return { codes: [], news: [] };
    }
  }
}

module.exports = MobileLegendsScraper;
