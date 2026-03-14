#!/usr/bin/env node

/**
 * Reddit Web Scraper (No API Required)
 * Scrapes Reddit using Cheerio for:
 * - Trending posts in gaming communities
 * - Current codes being discussed
 * - Popular methods being shared
 * 
 * Usage: node reddit-scraper-no-api.js
 * 
 * This scrapes FROM Reddit but doesn't post
 * (Posting without API is unreliable - use Puppeteer instead)
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

class RedditScraperNoAPI {
  constructor() {
    this.subreddits = [
      'roblox',
      'FortniteBR',
      'MobileLegendsGame',
      'ClashOfClans'
    ];
    
    // Mimic real browser to avoid blocking
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };
  }

  /**
   * Fetch trending posts from a subreddit
   */
  async fetchSubredditTrending(subreddit, limit = 5) {
    try {
      console.log(`🔍 Scraping r/${subreddit} trending posts...`);
      
      const url = `https://www.reddit.com/r/${subreddit}/top.json?t=day&limit=${limit}`;
      
      // Note: Reddit.com blocks scrapers, use old.reddit.com or Reddit's RSS
      const rssUrl = `https://www.reddit.com/r/${subreddit}/top.rss?t=day&limit=${limit}`;
      
      const response = await axios.get(rssUrl, { 
        headers: this.headers,
        timeout: 5000 
      });
      
      const $ = cheerio.load(response.data, { xmlMode: true });
      const posts = [];
      
      $('entry').each((i, elem) => {
        if (i < limit) {
          posts.push({
            title: $(elem).find('title').text(),
            link: $(elem).find('link').attr('href'),
            updated: $(elem).find('updated').text(),
            author: $(elem).find('author name').text(),
            content: $(elem).find('content').text().substring(0, 200)
          });
        }
      });
      
      return posts;
    } catch (error) {
      console.error(`❌ Error scraping r/${subreddit}:`, error.message);
      return [];
    }
  }

  /**
   * Extract mentions of codes from posts
   */
  extractCodes(text) {
    // Match patterns like: CODE1, GAMECODE, PROMO123
    const codePattern = /\b[A-Z]{2,}[0-9A-Z]{2,}\b/g;
    const codes = text.match(codePattern) || [];
    
    // Filter for real-looking codes (more than 4 chars)
    return [...new Set(codes)].filter(code => code.length > 3 && code.length < 15);
  }

  /**
   * Scan trending posts for code mentions
   */
  async findTrendingCodes() {
    console.log('\n📊 Finding trending codes across subreddits...\n');
    
    const allCodes = {};
    
    for (const sub of this.subreddits) {
      const posts = await this.fetchSubredditTrending(sub, 10);
      
      for (const post of posts) {
        const codes = this.extractCodes(post.title + ' ' + post.content);
        
        if (codes.length > 0) {
          console.log(`✅ r/${sub} - Found: ${codes.join(', ')}`);
          console.log(`   Post: "${post.title.substring(0, 60)}..."\n`);
        }
      }
    }
  }

  /**
   * Get trending topics from each subreddit
   */
  async getTrendingTopics() {
    console.log('\n🔥 Trending Topics This Week:\n');
    
    for (const sub of this.subreddits) {
      const posts = await this.fetchSubredditTrending(sub, 3);
      
      console.log(`📘 r/${sub}:`);
      posts.forEach((post, i) => {
        console.log(`   ${i + 1}. ${post.title.substring(0, 70)}...`);
      });
      console.log('');
    }
  }

  /**
   * Monitor subreddit for new posts (polling)
   */
  async monitorSubreddit(subreddit, interval = 60000) {
    console.log(`\n📡 Monitoring r/${subreddit} (checks every ${interval / 1000} seconds)...\n`);
    
    let lastCheck = Date.now() - 3600000; // 1 hour ago
    
    setInterval(async () => {
      try {
        const posts = await this.fetchSubredditTrending(subreddit, 5);
        
        for (const post of posts) {
          const postTime = new Date(post.updated).getTime();
          
          if (postTime > lastCheck) {
            console.log(`🆕 NEW POST: ${post.title}`);
            
            const codes = this.extractCodes(post.title);
            if (codes.length > 0) {
              console.log(`   💰 Codes found: ${codes.join(', ')}`);
            }
          }
        }
        
        lastCheck = Date.now();
      } catch (error) {
        console.error('Monitoring error:', error.message);
      }
    }, interval);
  }

  /**
   * Main execution
   */
  async run() {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║  Reddit Web Scraper (No API Required)                          ║
║  Scrapes trending posts from gaming subreddits                 ║
╚════════════════════════════════════════════════════════════════╝
    `);

    // Option 1: Find trending codes
    await this.findTrendingCodes();

    // Option 2: Get trending topics
    await this.getTrendingTopics();

    // Option 3: Start monitoring (uncomment to enable)
    // await this.monitorSubreddit('roblox', 120000); // Check every 2 minutes
  }
}

// Run if executed directly
if (require.main === module) {
  const scraper = new RedditScraperNoAPI();
  scraper.run().catch(console.error);
}

module.exports = RedditScraperNoAPI;
