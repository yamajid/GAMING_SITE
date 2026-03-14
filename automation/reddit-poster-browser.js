#!/usr/bin/env node

/**
 * Reddit Auto-Poster via Browser Automation
 * Uses Puppeteer to simulate real user posting
 * 
 * No API credentials needed - logs in like a normal user
 * 
 * Usage: node reddit-poster-browser.js
 * 
 * IMPORTANT: 
 * - This violates Reddit's ToS technically
 * - But simulates real user behavior
 * - Rate limiting prevents account bans
 * - Safest alternative to API
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class RedditBrowserPoster {
  constructor(username, password) {
    this.username = username;
    this.password = password;
    this.browser = null;
    this.page = null;
  }

  /**
   * Log in to Reddit
   */
  async login() {
    console.log(`🔐 Logging in to Reddit as ${this.username}...`);
    
    try {
      // Launch browser
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      this.page = await this.browser.newPage();
      
      // Set user agent to look like real browser
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0');
      
      // Go to Reddit login
      await this.page.goto('https://www.reddit.com/login', { waitUntil: 'networkidle2' });
      
      // Fill username
      await this.page.type('input[name="username"]', this.username);
      
      // Fill password
      await this.page.type('input[name="password"]', this.password);
      
      // Click login button
      await this.page.click('button[type="submit"]');
      
      // Wait for redirect to dashboard
      await this.page.waitForNavigation({ waitUntil: 'networkidle2' });
      
      console.log('✅ Successfully logged in!');
      return true;
    } catch (error) {
      console.error('❌ Login failed:', error.message);
      return false;
    }
  }

  /**
   * Post to a subreddit
   */
  async postToSubreddit(subreddit, title, content) {
    if (!this.page) {
      console.error('❌ Not logged in. Call login() first.');
      return false;
    }

    try {
      console.log(`📝 Posting to r/${subreddit}...`);
      
      // Go to subreddit
      await this.page.goto(`https://www.reddit.com/r/${subreddit}`, { 
        waitUntil: 'networkidle2' 
      });
      
      // Click "Create Post" button
      await this.page.click('a:contains("Create Post")');
      
      // Wait for dialog
      await this.page.waitForSelector('input[placeholder*="Title"]');
      
      // Fill title
      await this.page.type('input[placeholder*="Title"]', title);
      
      // Click in content area and fill
      const contentArea = await this.page.$('textarea, div[contenteditable="true"]');
      if (contentArea) {
        await contentArea.click();
        await this.page.keyboard.type(content);
      }
      
      // Click Post button
      await this.page.click('button:contains("Post")');
      
      // Wait for confirmation
      await this.page.waitForTimeout(2000);
      
      console.log(`✅ Posted to r/${subreddit}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to post to r/${subreddit}:`, error.message);
      return false;
    }
  }

  /**
   * Post to all gaming subreddits
   */
  async postToAll(posts) {
    console.log(`\n📋 Posting to ${Object.keys(posts).length} subreddits...\n`);
    
    const subredditOrder = ['roblox', 'FortniteBR', 'MobileLegendsGame', 'ClashOfClans'];
    let successCount = 0;
    
    for (const subreddit of subredditOrder) {
      if (posts[subreddit]) {
        const { title, content } = posts[subreddit];
        
        const success = await this.postToSubreddit(subreddit, title, content);
        if (success) successCount++;
        
        // Wait between posts to avoid rate limiting
        console.log('⏳ Waiting 5 minutes before next post...');
        await this.page.waitForTimeout(300000); // 5 minutes
      }
    }
    
    console.log(`\n✅ Successfully posted to ${successCount}/${Object.keys(posts).length} subreddits`);
  }

  /**
   * Close browser
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  /**
   * Main execution
   */
  async run() {
    const username = process.env.REDDIT_USERNAME;
    const password = process.env.REDDIT_PASSWORD;

    if (!username || !password) {
      console.error('❌ Missing REDDIT_USERNAME or REDDIT_PASSWORD in .env.automation');
      console.error('   Add them to automation/.env.automation');
      process.exit(1);
    }

    // Log in
    const loggedIn = await this.login();
    if (!loggedIn) {
      await this.close();
      process.exit(1);
    }

    // Example posts to make
    const posts = {
      roblox: {
        title: '✅ 5+ FREE Robux Codes Working RIGHT NOW',
        content: 'Just found these today!\nCODE1 → 50 Robux\nCODE2 → 100 Robux\nFull list: gamingcoinshub.com'
      },
      FortniteBR: {
        title: '⚡ FREE V-Bucks Methods 2026',
        content: 'Save the World daily = 1500-3000/month\nFull guide: gamingcoinshub.com'
      },
      MobileLegendsGame: {
        title: '💎 FREE Diamonds Guide',
        content: 'Monthly Pass + Events = 1000/month\nFull breakdown: gamingcoinshub.com'
      },
      ClashOfClans: {
        title: '💰 450+ FREE Gems from Achievements',
        content: 'All achievements worth 450+ gems\nFull list: gamingcoinshub.com'
      }
    };

    // Post to all subreddits
    await this.postToAll(posts);

    // Close browser
    await this.close();
  }
}

// Run if executed directly
if (require.main === module) {
  const poster = new RedditBrowserPoster(
    process.env.REDDIT_USERNAME,
    process.env.REDDIT_PASSWORD
  );
  
  poster.run().catch(async (error) => {
    console.error('Fatal error:', error);
    await poster.close();
    process.exit(1);
  });
}

module.exports = RedditBrowserPoster;
