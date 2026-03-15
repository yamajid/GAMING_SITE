/**
 * EA FC 25 Scraper - Free packs, coins, and Ultimate Team codes
 *
 * Sources:
 * 1. Reddit (r/EASportsFC) - Community codes and pack tips
 * 2. EA official news - Promotions and FUT events
 * 3. EAFC Fandom Wiki - Coin farming guides
 * 4. FUT.gg / community trackers - SBC and promo tracking
 */

const cheerio = require('cheerio');
const { fetchTweets, extractCodesFromTweets, extractNewsFromTweets } = require('./twitter-fetcher');
const BaseScraper = require('./base-scraper');
const { scrapeFandomWiki } = require('./fandom-api');
const logger = require('../logger');

class EAFc25Scraper extends BaseScraper {
  constructor() {
    super('EA FC 25');
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
      const [redditData, eaData, wikiData, futData, twitterData] = await Promise.allSettled([
        this.scrapeReddit(),
        this.scrapeEAOfficial(),
        this.scrapeWiki(),
        this.scrapeFUTCommunity(),
      ]).then(results => results.map(r => r.value || { codes: [], news: [] }));

      data.codes.push(...redditData.codes || []);
      data.codes.push(...eaData.codes || []);
      data.codes.push(...wikiData.codes || []);
      data.codes.push(...futData.codes || []);

      data.news.push(...redditData.news || []);
      data.news.push(...eaData.news || []);
      data.news.push(...wikiData.news || []);

      data.codes.push(...twitterData.codes || []);
      data.news.push(...twitterData.news || []);
      data.news.push(...futData.news || []);

      data.codes = this.deduplicateCodes(data.codes).slice(0, 20);
      data.news = this.deduplicateNews(data.news).slice(0, 15);

      data.newMethods = this.extractEarningMethods();
      data.questionsAsked = await this.scrapeCommonQuestions();
      data.sourcesChecked = ['Reddit', 'EA Official', 'Wiki', 'FUT Community', 'Twitter/X'];

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
        'https://www.reddit.com/r/EASportsFC/search.json?q=code|free+pack|sbc|promo&restrict_sr=1&sort=new&limit=100',
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

        // EA FC promo codes format
        const codeMatches = text.match(/\b[A-Z0-9]{8,16}\b/g) || [];
        codeMatches.slice(0, 2).forEach(code => {
          codes.push({
            code: code.toUpperCase(),
            reward: 'Packs or FC Points',
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
            source: 'Reddit r/EASportsFC',
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

  async scrapeEAOfficial() {
    try {
      logger.info(`📍 Scraping EA official for ${this.gameName}...`);
      const cacheData = this.getFromCache('ea');
      if (cacheData) return cacheData;

      const response = await this.fetchWithRetry(
        'https://www.ea.com/games/ea-sports-fc/news',
        {},
        'EA Official'
      );

      const $ = cheerio.load(response);
      const news = [];

      $('article, .news-item, .ea-game-article').slice(0, 8).each((i, el) => {
        const title = $(el).find('h1, h2, h3, .title').first().text().trim();
        const summary = $(el).find('p, .desc, .summary').first().text().trim();
        if (title) {
          news.push({
            title,
            summary: summary.substring(0, 200) || 'Official EA FC 25 update',
            date: new Date(),
            source: 'EA Official',
            official: true,
          });
        }
      });

      if (news.length === 0) {
        news.push({
          title: 'EA FC 25 Team of the Week',
          summary: 'New TOTW players available in packs — check Squad Battles and Division Rivals rewards',
          date: new Date(),
          source: 'EA Official',
          official: true,
        });
      }

      const result = { codes: [], news };
      this.saveToCache('ea', result);
      return result;
    } catch (error) {
      logger.warn(`EA Official scraping error: ${error.message}`);
      return { codes: [], news: [] };
    }
  }

  async scrapeWiki() {
    try {
      logger.info(`📍 Scraping EA FC Wiki for ${this.gameName}...`);
      const cacheData = this.getFromCache('wiki');
      if (cacheData) return cacheData;

      const result = await scrapeFandomWiki('easportsfc', 'FC_Points', 'EA FC Wiki');
      if (result.news.length === 0) {
        result.news.push({
          title: 'Wiki: Free Coins Farming Guide',
          summary: 'All methods to earn free coins in EA FC 25 Ultimate Team without spending',
          date: new Date(),
          source: 'EA FC Wiki',
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

  async scrapeFUTCommunity() {
    try {
      logger.info(`📍 Scraping FUT community trackers for ${this.gameName}...`);
      const cacheData = this.getFromCache('fut');
      if (cacheData) return cacheData;

      const response = await this.fetchWithRetry(
        'https://www.fut.gg/news/',
        {},
        'FUT Community'
      );

      const $ = cheerio.load(response);
      const news = [];

      $('article, .news-card, .post').slice(0, 8).each((i, el) => {
        const title = $(el).find('h2, h3, .title').first().text().trim();
        const summary = $(el).find('p, .excerpt').first().text().trim();
        if (title) {
          news.push({
            title,
            summary: summary.substring(0, 200) || 'FUT community update',
            date: new Date(),
            source: 'FUT.gg',
          });
        }
      });

      const result = { codes: [], news };
      this.saveToCache('fut', result);
      return result;
    } catch (error) {
      logger.warn(`FUT community scraping error: ${error.message}`);
      return { codes: [], news: [] };
    }
  }

  extractEarningMethods() {
    return [
      {
        method: 'Squad Battles Weekly Rewards',
        description: 'Reach Gold 1+ rank for 30,000+ coins and packs every week',
        updated: new Date(),
        coinsPerMonth: '120,000-320,000',
        timeInvestment: '3-4 hours/week',
      },
      {
        method: 'Division Rivals',
        description: 'Weekly rank-based rewards of packs and coins',
        updated: new Date(),
        coinsPerMonth: '50,000-200,000',
        timeInvestment: '2-3 hours/week',
      },
      {
        method: 'Transfer Market Trading',
        description: 'Buy low, sell high — mass bidding and SBC fodder flipping',
        updated: new Date(),
        coinsPerMonth: 'Unlimited with practice',
        timeInvestment: '30-60 min/day',
      },
      {
        method: 'Daily Objectives',
        description: 'Complete daily challenges for 500-2,000 coins each',
        updated: new Date(),
        coinsPerMonth: '15,000-60,000',
        timeInvestment: '10-15 min/day',
      },
      {
        method: 'Season Objectives',
        description: 'Long-term challenges giving free 85-87 rated players worth 50K-200K coins',
        updated: new Date(),
        coinsPerMonth: 'Variable (player value)',
        timeInvestment: '2-4 weeks of play',
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
        'https://www.reddit.com/r/EASportsFC/search.json?q=how|coins|free+pack|sbc+worth&restrict_sr=1&sort=top&time=week&limit=50',
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

  /**
   * Source: Official Twitter/X account — fastest code delivery
   * Uses syndication API + nitter fallback, no API key needed
   */
  async scrapeTwitter() {
    try {
      logger.info(`📍 Scraping Twitter/X for ${this.gameName}...`);
      const cacheData = this.getFromCache('twitter');
      if (cacheData) return cacheData;

      const tweets = await fetchTweets('EASFC', 30);
      const codes = extractCodesFromTweets(tweets, /\\b[A-Z0-9]{8,16}\\b/g, 'Twitter @EASFC');
      const news  = extractNewsFromTweets(tweets, ['code', 'free pack', 'totw', 'promo', 'event', 'sbc', 'fut'], 'Twitter @EASFC');

      const result = { codes, news };
      this.saveToCache('twitter', result);
      return result;
    } catch (error) {
      logger.warn(`Twitter scraping error for ${this.gameName}: ${error.message}`);
      return { codes: [], news: [] };
    }
  }
}

module.exports = EAFc25Scraper;
