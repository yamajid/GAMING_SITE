/**
 * Base Scraper - Provides retry logic, rate limiting, and caching
 * All game scrapers should extend this class
 */

const axios = require('axios');
const logger = require('../logger');
const fs = require('fs');
const path = require('path');

class BaseScraper {
  constructor(gameName) {
    this.gameName = gameName;
    this.maxRetries = 3;
    this.retryDelay = 2000; // 2 seconds
    this.timeout = 10000; // 10 seconds
    this.cacheDir = path.join(__dirname, '../cache');
    this.cacheTTL = 3600000; // 1 hour
    this.setupCache();
  }

  setupCache() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  getCachePath(source) {
    return path.join(this.cacheDir, `${this.gameName}-${source}.json`);
  }

  getFromCache(source) {
    try {
      const cachePath = this.getCachePath(source);
      if (!fs.existsSync(cachePath)) return null;

      const data = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      const age = Date.now() - data.timestamp;

      if (age > this.cacheTTL) {
        fs.unlinkSync(cachePath);
        return null;
      }

      logger.cacheHit(this.gameName, source);
      return data.content;
    } catch (error) {
      logger.warn(`Cache read error for ${source}: ${error.message}`);
      return null;
    }
  }

  saveToCache(source, content) {
    try {
      const cachePath = this.getCachePath(source);
      fs.writeFileSync(cachePath, JSON.stringify({
        timestamp: Date.now(),
        content,
      }));
    } catch (error) {
      logger.warn(`Cache write error: ${error.message}`);
    }
  }

  /**
   * Browser-like headers to reduce 403 (bot-blocking) on some sites.
   * Note: Cloudflare and heavy bot protection still block - Reddit's JSON API works best.
   */
  getBrowserHeaders(url) {
    const parsed = new URL(url);
    const origin = `${parsed.protocol}//${parsed.host}`;
    return {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Referer': `${origin}/`,
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      'DNT': '1',
    };
  }

  /** Headers for JSON APIs (Reddit, etc) - fewer headers, JSON accept */
  getJsonHeaders(url) {
    return {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
    };
  }

  /**
   * Fetch with retry logic and automatic backoff
   * @param {boolean} useJsonHeaders - Use JSON headers (for Reddit API). Default: full browser headers
   */
  async fetchWithRetry(url, options = {}, source = 'unknown', useJsonHeaders = false) {
    let lastError;
    const defaultHeaders = useJsonHeaders ? this.getJsonHeaders(url) : this.getBrowserHeaders(url);
    const mergedHeaders = { ...defaultHeaders, ...(options.headers || {}) };

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        logger.http(`Fetching ${source} (attempt ${attempt}/${this.maxRetries}): ${url}`, 'info');

        const response = await axios.get(url, {
          timeout: this.timeout,
          headers: mergedHeaders,
          maxRedirects: 5,
          validateStatus: (status) => status < 400, // Don't throw on 3xx
          ...options,
        });

        if (response.status === 200) {
          logger.http(`✓ ${source} → ${(response.data && typeof response.data === 'string' ? response.data.length : JSON.stringify(response.data).length)} bytes`, 'success');
          return response.data;
        }

        throw new Error(`HTTP ${response.status}`);
      } catch (error) {
        lastError = error;
        const is403 = error.response?.status === 403;
        const is404 = error.response?.status === 404;
        logger.warn(`Attempt ${attempt} failed for ${source}: ${error.message}${is403 ? ' (likely bot-blocked)' : ''}`);

        // Don't retry 403/404 - site is blocking us
        if (is403 || is404) {
          throw new Error(`Failed to fetch ${source}: ${error.message}${is403 ? ' (site blocks scrapers)' : ''}`);
        }

        // Exponential backoff for other errors
        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1);
          logger.debug(`Waiting ${delay}ms before retry...`);
          await this.sleep(delay);
        }
      }
    }

    throw new Error(`Failed to fetch ${source} after ${this.maxRetries} attempts: ${lastError.message}`);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Parse structured data with error handling
   */
  parseJSON(data, source) {
    try {
      return typeof data === 'string' ? JSON.parse(data) : data;
    } catch (error) {
      logger.error(`Failed to parse JSON from ${source}: ${error.message}`);
      return null;
    }
  }

  /**
   * Main scrape method - override in subclasses
   */
  async scrape() {
    throw new Error('scrape() must be implemented by subclass');
  }
}

module.exports = BaseScraper;
