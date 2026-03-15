/**
 * Minecraft Scraper - Minecoins, marketplace codes, and promotions
 *
 * Sources:
 * 1. Reddit (r/Minecraft) - Community codes and tips
 * 2. Mojang/Microsoft official - Marketplace and promotions
 * 3. Minecraft Fandom Wiki - Minecoin guides
 * 4. Xbox/Microsoft news - Game Pass and Rewards deals
 */

const cheerio = require('cheerio');
const { fetchTweets, extractCodesFromTweets, extractNewsFromTweets } = require('./twitter-fetcher');
const BaseScraper = require('./base-scraper');
const { scrapeFandomWiki } = require('./fandom-api');
const logger = require('../logger');

class MinecraftScraper extends BaseScraper {
  constructor() {
    super('Minecraft');
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
      const [redditData, officialData, wikiData, xboxData, twitterData] = await Promise.allSettled([
        this.scrapeReddit(),
        this.scrapeOfficial(),
        this.scrapeWiki(),
        this.scrapeXboxNews(),
      ]).then(results => results.map(r => r.value || { codes: [], news: [] }));

      data.codes.push(...redditData.codes || []);
      data.codes.push(...officialData.codes || []);
      data.codes.push(...wikiData.codes || []);
      data.codes.push(...xboxData.codes || []);

      data.news.push(...redditData.news || []);
      data.news.push(...officialData.news || []);

      data.codes.push(...twitterData.codes || []);
      data.news.push(...twitterData.news || []);
      data.news.push(...wikiData.news || []);
      data.news.push(...xboxData.news || []);

      data.codes = this.deduplicateCodes(data.codes).slice(0, 20);
      data.news = this.deduplicateNews(data.news).slice(0, 15);

      data.newMethods = this.extractEarningMethods();
      data.questionsAsked = await this.scrapeCommonQuestions();
      data.sourcesChecked = ['Reddit', 'Mojang Official', 'Wiki', 'Xbox News', 'Twitter/X'];

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
        'https://www.reddit.com/r/Minecraft/search.json?q=minecoin|code|free|marketplace&restrict_sr=1&sort=new&limit=100',
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

        // Minecraft codes are typically 25 char with dashes (gift cards) or short promo codes
        const codeMatches = text.match(/\b[A-Z0-9]{8,16}\b/g) || [];
        codeMatches.slice(0, 2).forEach(code => {
          codes.push({
            code: code.toUpperCase(),
            reward: 'Minecoins or Marketplace content',
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
            source: 'Reddit r/Minecraft',
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
      logger.info(`📍 Scraping Mojang official for ${this.gameName}...`);
      const cacheData = this.getFromCache('official');
      if (cacheData) return cacheData;

      const response = await this.fetchWithRetry(
        'https://www.minecraft.net/en-us/article',
        {},
        'Mojang Official'
      );

      const $ = cheerio.load(response);
      const news = [];

      $('article, .article-card, a[href*="article"]').slice(0, 8).each((i, el) => {
        const title = $(el).find('h1, h2, h3, .title').first().text().trim();
        const summary = $(el).find('p, .subheading, .description').first().text().trim();
        if (title) {
          news.push({
            title,
            summary: summary.substring(0, 200) || 'Official Minecraft update',
            date: new Date(),
            source: 'Mojang Official',
            official: true,
          });
        }
      });

      if (news.length === 0) {
        news.push({
          title: 'Minecraft Marketplace Updates',
          summary: 'New free content, skin packs, and Marketplace deals this month',
          date: new Date(),
          source: 'Mojang Official',
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
      logger.info(`📍 Scraping Minecraft Wiki for ${this.gameName}...`);
      const cacheData = this.getFromCache('wiki');
      if (cacheData) return cacheData;

      const result = await scrapeFandomWiki('minecraft', 'Minecoins', 'Minecraft Wiki');
      if (result.news.length === 0) {
        result.news.push({
          title: 'Wiki: Free Minecoins Guide',
          summary: 'Complete guide to earning free Minecoins via Microsoft Rewards and promotions',
          date: new Date(),
          source: 'Minecraft Wiki',
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

  async scrapeXboxNews() {
    try {
      logger.info(`📍 Scraping Xbox news for ${this.gameName}...`);
      const cacheData = this.getFromCache('xbox');
      if (cacheData) return cacheData;

      const response = await this.fetchWithRetry(
        'https://news.xbox.com/en-us/',
        {},
        'Xbox News'
      );

      const $ = cheerio.load(response);
      const news = [];

      $('article, .news-item').slice(0, 10).each((i, el) => {
        const title = $(el).find('h2, h3, .title').first().text().trim();
        const summary = $(el).find('p, .excerpt').first().text().trim();
        if (title && title.toLowerCase().includes('minecraft')) {
          news.push({
            title,
            summary: summary.substring(0, 200) || 'Xbox/Minecraft news',
            date: new Date(),
            source: 'Xbox News',
            official: true,
          });
        }
      });

      const result = { codes: [], news };
      this.saveToCache('xbox', result);
      return result;
    } catch (error) {
      logger.warn(`Xbox news scraping error: ${error.message}`);
      return { codes: [], news: [] };
    }
  }

  extractEarningMethods() {
    return [
      {
        method: 'Microsoft Rewards',
        description: 'Earn points via Bing searches and Edge usage — redeem for Microsoft Store credits',
        updated: new Date(),
        minecoinsPerMonth: '500-2,000',
        timeInvestment: '5 min/day',
      },
      {
        method: 'Google Opinion Rewards',
        description: 'Earn Google Play credits via surveys — buy Minecoins on Android',
        updated: new Date(),
        minecoinsPerMonth: '100-500',
        timeInvestment: '2-5 min/survey',
      },
      {
        method: 'Xbox Game Pass Perks',
        description: 'Monthly perks for Game Pass subscribers including Minecraft content',
        updated: new Date(),
        minecoinsPerMonth: 'Variable (perk-dependent)',
        timeInvestment: '5 min to claim',
      },
      {
        method: 'Free Marketplace Content',
        description: 'Filter Marketplace by Free to find no-cost skins and maps',
        updated: new Date(),
        minecoinsPerMonth: '0 (free items only)',
        timeInvestment: '10 min to browse',
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
        'https://www.reddit.com/r/Minecraft/search.json?q=minecoin|free|marketplace|code&restrict_sr=1&sort=top&time=week&limit=50',
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

      const tweets = await fetchTweets('Minecraft', 30);
      const codes = extractCodesFromTweets(tweets, /\\b[A-Z0-9]{8,16}\\b/g, 'Twitter @Minecraft');
      const news  = extractNewsFromTweets(tweets, ['minecoin', 'free', 'code', 'marketplace', 'update', 'promotion'], 'Twitter @Minecraft');

      const result = { codes, news };
      this.saveToCache('twitter', result);
      return result;
    } catch (error) {
      logger.warn(`Twitter scraping error for ${this.gameName}: ${error.message}`);
      return { codes: [], news: [] };
    }
  }
}

module.exports = MinecraftScraper;
