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

      logger.info(`✓ Cache hit for ${this.gameName} - ${source}`);
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
   * Fetch with retry logic and automatic backoff
   */
  async fetchWithRetry(url, options = {}, source = 'unknown') {
    let lastError;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        logger.debug(`Fetching ${source} (attempt ${attempt}/${this.maxRetries}): ${url}`);

        const response = await axios.get(url, {
          timeout: this.timeout,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json; text/html; */*',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          ...options,
        });

        if (response.status === 200) {
          logger.info(`✓ Successfully fetched ${source}`);
          return response.data;
        }

        throw new Error(`HTTP ${response.status}`);
      } catch (error) {
        lastError = error;
        logger.warn(`Attempt ${attempt} failed for ${source}: ${error.message}`);

        // Exponential backoff
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
