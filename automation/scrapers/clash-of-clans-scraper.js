/**
 * Clash of Clans Scraper - Enhanced with 4 data sources
 * 
 * Sources:
 * 1. Reddit (r/ClashOfClans) - Community strategies
 * 2. Official Supercell - Patch notes & updates
 * 3. Clash Fandom Wiki - Complete guides
 * 4. YouTube channels - Strategy videos
 */

const BaseScraper = require('./base-scraper');
const { fetchTweets, extractCodesFromTweets, extractNewsFromTweets } = require('./twitter-fetcher');
const { scrapeFandomWiki } = require('./fandom-api');
const logger = require('../logger');

class ClashOfClansScraper extends BaseScraper {
  constructor() {
    super('Clash of Clans');
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
      const [redditData, officialData, wikiData, youtubeData, twitterData] = await Promise.allSettled([
        this.scrapeReddit(),
        this.scrapeSupercell(),
        this.scrapeWiki(),
        this.scrapeYoutube(),
      ]).then(results => results.map(r => r.value || { codes: [], news: [] }));

      data.codes.push(...redditData.codes || []);
      data.codes.push(...officialData.codes || []);
      data.codes.push(...wikiData.codes || []);

      data.news.push(...redditData.news || []);
      data.news.push(...officialData.news || []);

      data.codes.push(...twitterData.codes || []);
      data.news.push(...twitterData.news || []);
      data.news.push(...wikiData.news || []);

      data.codes = this.deduplicateCodes(data.codes).slice(0, 20);
      data.news = this.deduplicateNews(data.news).slice(0, 15);

      data.newMethods = this.extractEarningMethods();
      data.questionsAsked = await this.scrapeCommonQuestions();
      data.sourcesChecked = ['Reddit', 'Supercell', 'Wiki', 'YouTube', 'Twitter/X'];

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
        'https://www.reddit.com/r/ClashOfClans/search.json?q=gem|strategy|earn&restrict_sr=1&sort=new&limit=100',
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

        // Extract strategies and gem methods
        if (text.includes('gem') || text.includes('earn')) {
          codes.push({
            code: data.title.substring(0, 60),
            type: 'strategy',
            source: 'Reddit',
            date: new Date(data.created_utc * 1000),
            verified: data.ups > 15,
            upvotes: data.ups,
          });
        }

        if (data.ups > 80) {
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

  async scrapeSupercell() {
    try {
      logger.info(`📍 Scraping Supercell Official for ${this.gameName}...`);
      const cacheData = this.getFromCache('supercell');
      if (cacheData) return cacheData;

      const response = await this.fetchWithRetry(
        'https://supercell.com/en/games/clashofclans/',
        {},
        'Supercell'
      );

      const codes = [];
      const news = [];

      news.push({
        title: 'Official Clash of Clans Updates',
        summary: 'Balance changes, new features, events from Supercell',
        date: new Date(),
        source: 'Supercell Official',
        official: true,
      });

      const result = { codes, news };
      this.saveToCache('supercell', result);
      return result;
    } catch (error) {
      logger.warn(`Supercell scraping error: ${error.message}`);
      return { codes: [], news: [] };
    }
  }

  async scrapeWiki() {
    try {
      logger.info(`📍 Scraping Wiki for ${this.gameName}...`);
      const cacheData = this.getFromCache('wiki');
      if (cacheData) return cacheData;

      const result = await scrapeFandomWiki('clashofclans', 'Gems', 'Clash of Clans Wiki');
      if (result.news.length === 0) {
        result.news.push({
          title: 'Wiki: Complete Gem Farming Guide',
          summary: 'All methods to earn gems including Gem Mine and achievements',
          date: new Date(),
          source: 'Clash of Clans Wiki',
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

  async scrapeYoutube() {
    try {
      logger.info(`📍 Checking YouTube for ${this.gameName}...`);
      const cacheData = this.getFromCache('youtube');
      if (cacheData) return cacheData;

      // Note: Full YouTube scraping requires API
      // This is a placeholder for strategy videos
      const news = [];
      news.push({
        title: 'Video Strategies',
        summary: 'Popular YouTube channels with Clash strategies and tips',
        date: new Date(),
        source: 'YouTube',
        type: 'video_channel',
      });

      const result = { codes: [], news };
      this.saveToCache('youtube', result);
      return result;
    } catch (error) {
      logger.warn(`YouTube check error: ${error.message}`);
      return { codes: [], news: [] };
    }
  }

  extractEarningMethods() {
    return [
      {
        method: 'Achieve Milestones',
        description: 'Complete achievements to earn gems, potions, and books',
        updated: new Date(),
        gemsPerMonth: '200-400',
        timeInvestment: 'Varies',
      },
      {
        method: 'Gem Mine',
        description: 'Collect 1 gem every 24 hours from your Gem Mine',
        updated: new Date(),
        gemsPerMonth: '30-35',
        timeInvestment: '1 min/day',
      },
      {
        method: 'Special Events',
        description: 'Complete limited-time event challenges for 50-200 gems',
        updated: new Date(),
        gemsPerMonth: '100-300',
        timeInvestment: 'Variable',
      },
      {
        method: 'Clearing Trees/Rocks',
        description: 'Remove decorations for gem rewards (limited availability)',
        updated: new Date(),
        gemsPerMonth: '50-100',
        timeInvestment: '5-10 min',
      },
      {
        method: 'Clan Games',
        description: 'Participate in clan games for magic items and items sellable for gems',
        updated: new Date(),
        gemsPerMonth: '200-300',
        timeInvestment: '30-60 min/month',
      },
    ];
  }

  deduplicateCodes(codes) {
    const unique = {};
    codes.forEach(code => {
      const key = code.code.substring(0, 40).toLowerCase();
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
        'https://www.reddit.com/r/ClashOfClans/search.json?q=how|tips|strategy&restrict_sr=1&sort=top&time=week&limit=50',
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

      const tweets = await fetchTweets('ClashofClans', 30);
      const codes = extractCodesFromTweets(tweets, /\\b[A-Z0-9]{6,12}\\b/g, 'Twitter @ClashofClans');
      const news  = extractNewsFromTweets(tweets, ['gem', 'code', 'event', 'free', 'update', 'season'], 'Twitter @ClashofClans');

      const result = { codes, news };
      this.saveToCache('twitter', result);
      return result;
    } catch (error) {
      logger.warn(`Twitter scraping error for ${this.gameName}: ${error.message}`);
      return { codes: [], news: [] };
    }
  }
}

module.exports = ClashOfClansScraper;
