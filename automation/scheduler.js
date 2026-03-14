#!/usr/bin/env node

/**
 * Gaming Coins Hub - Daily Automation Scheduler
 * 
 * This script orchestrates daily tasks:
 * - Scrapes fresh codes and news for all 4 games
 * - Generates updated guides using Claude API
 * - Auto-publishes content to GitHub + Vercel
 * 
 * Runs at: 2:00 AM UTC daily (can be customized)
 */

const cron = require('node-cron');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');
const config = require('./config');
const RobloxScraper = require('./scrapers/roblox-scraper');
const FortniteScraper = require('./scrapers/fortnite-scraper');
const MobileLegendsScraperaper = require('./scrapers/mobile-legends-scraper');
const ClashOfClansScraper = require('./scrapers/clash-of-clans-scraper');
const ContentGenerator = require('./generator');
const Publisher = require('./publisher');

class AutomationScheduler {
  constructor() {
    this.scrapers = {
      roblox: new RobloxScraper(),
      fortnite: new FortniteScraper(),
      mobileLegends: new MobileLegendsScraperaper(),
      clashOfClans: new ClashOfClansScraper(),
    };
    this.generator = new ContentGenerator();
    this.publisher = new Publisher();
    this.stats = {
      startTime: null,
      endTime: null,
      success: 0,
      failed: 0,
      filesGenerated: 0,
      filesPublished: 0,
    };
  }

  /**
   * Main automation pipeline
   */
  async runDailyAutomation() {
    logger.info('🤖 Starting daily automation pipeline...');
    this.stats.startTime = new Date();

    try {
      // Step 1: Scrape data from all games
      logger.info('📡 Step 1: Scraping fresh data from games...');
      const scrapedData = await this.scrapeAllGames();

      // Step 2: Generate content
      logger.info('✍️ Step 2: Generating fresh content...');
      const generatedFiles = await this.generateContent(scrapedData);

      // Step 3: Publish to repository
      logger.info('🚀 Step 3: Publishing to GitHub...');
      const publishedFiles = await this.publishContent(generatedFiles);

      this.stats.endTime = new Date();
      this.stats.filesGenerated = generatedFiles.length;
      this.stats.filesPublished = publishedFiles.length;

      logger.success(`✅ Daily automation completed successfully!`);
      this.logStats();

      // Send success notification
      await this.notifySuccess();
    } catch (error) {
      logger.error(`❌ Automation failed: ${error.message}`);
      this.stats.failed++;
      
      // Send failure notification
      await this.notifyFailure(error);
      process.exit(1);
    }
  }

  /**
   * Scrape data from all games
   */
  async scrapeAllGames() {
    const allData = {};
    const scrapePromises = [];

    for (const [gameName, scraper] of Object.entries(this.scrapers)) {
      scrapePromises.push(
        scraper.scrape()
          .then(data => {
            allData[gameName] = data;
            logger.info(`✓ ${gameName}: Found ${data.codes?.length || 0} codes, ${data.news?.length || 0} news items`);
            this.stats.success++;
          })
          .catch(error => {
            logger.warn(`✗ ${gameName}: ${error.message}`);
            allData[gameName] = { codes: [], news: [], error: error.message };
            this.stats.failed++;
          })
      );
    }

    await Promise.all(scrapePromises);
    return allData;
  }

  /**
   * Generate fresh content for all games
   */
  async generateContent(scrapedData) {
    const generatedFiles = [];

    for (const [gameName, data] of Object.entries(scrapedData)) {
      try {
        // Generate updated codes file
        if (data.codes && data.codes.length > 0) {
          const codesFile = await this.generator.generateCodesFile(
            gameName,
            data.codes,
            data.lastUpdated || new Date()
          );
          generatedFiles.push(codesFile);
          logger.info(`📄 Generated: ${codesFile.path}`);
        }

        // Generate updated FAQ file with fresh questions
        if (data.news && data.news.length > 0) {
          const faqFile = await this.generator.generateFAQUpdate(
            gameName,
            data.news,
            data.questionsAsked
          );
          generatedFiles.push(faqFile);
          logger.info(`📄 Generated: ${faqFile.path}`);
        }

        // Generate updated earning guide if new methods discovered
        if (data.newMethods && data.newMethods.length > 0) {
          const guideFile = await this.generator.generateEarningGuide(
            gameName,
            data.newMethods
          );
          generatedFiles.push(guideFile);
          logger.info(`📄 Generated: ${guideFile.path}`);
        }
      } catch (error) {
        logger.warn(`⚠️ Failed to generate content for ${gameName}: ${error.message}`);
      }
    }

    return generatedFiles;
  }

  /**
   * Publish generated files to GitHub and Vercel
   */
  async publishContent(generatedFiles) {
    try {
      const published = await this.publisher.publishFiles(generatedFiles);
      logger.info(`🚀 Published ${published.length} files to GitHub`);
      
      // Vercel auto-triggers on git push, so deployment happens automatically
      logger.info(`⏳ Vercel deployment will auto-trigger from GitHub push`);
      
      return published;
    } catch (error) {
      logger.error(`Failed to publish: ${error.message}`);
      throw error;
    }
  }

  /**
   * Log automation statistics
   */
  logStats() {
    const duration = Math.round((this.stats.endTime - this.stats.startTime) / 1000);
    logger.info(`\n📊 Automation Statistics:`);
    logger.info(`   Duration: ${duration}s`);
    logger.info(`   Successful scrapers: ${this.stats.success}/${Object.keys(this.scrapers).length}`);
    logger.info(`   Failed scrapers: ${this.stats.failed}`);
    logger.info(`   Files generated: ${this.stats.filesGenerated}`);
    logger.info(`   Files published: ${this.stats.filesPublished}\n`);
  }

  /**
   * Send success notification
   */
  async notifySuccess() {
    // Send webhook notification (Slack, Discord, email, etc.)
    if (process.env.WEBHOOK_URL) {
      try {
        const message = `✅ Gaming Coins Hub automation succeeded!\n${this.stats.filesGenerated} files generated & published`;
        await fetch(process.env.WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: message }),
        });
      } catch (error) {
        logger.warn(`Failed to send success notification: ${error.message}`);
      }
    }
  }

  /**
   * Send failure notification
   */
  async notifyFailure(error) {
    if (process.env.WEBHOOK_URL) {
      try {
        const message = `❌ Gaming Coins Hub automation failed!\nError: ${error.message}`;
        await fetch(process.env.WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: message }),
        });
      } catch (notifyError) {
        logger.warn(`Failed to send failure notification: ${notifyError.message}`);
      }
    }
  }

  /**
   * Schedule daily automation
   */
  scheduleDaily() {
    // Schedule for 2:00 AM UTC every day
    // Format: second minute hour day-of-month month day-of-week
    const schedule = config.AUTOMATION_SCHEDULE || '0 2 * * *';

    cron.schedule(schedule, async () => {
      logger.info(`\n⏰ Scheduled automation triggered at ${new Date().toISOString()}`);
      await this.runDailyAutomation();
    });

    logger.success(`✅ Scheduler configured: "${schedule}" (daily automation ready)`);
    logger.info(`Next run: ${this.getNextRun()}`);
  }

  /**
   * Get next scheduled run time
   */
  getNextRun() {
    const schedule = config.AUTOMATION_SCHEDULE || '0 2 * * *';
    // Simple approximation - for exact time use better cron parser
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(2, 0, 0, 0);
    return tomorrow.toISOString();
  }

  /**
   * Run automation once immediately (for testing)
   */
  async runOnce() {
    await this.runDailyAutomation();
  }
}

// Main execution
async function main() {
  const scheduler = new AutomationScheduler();

  // Check if running with --once flag for immediate execution
  if (process.argv.includes('--once')) {
    logger.info('Running automation once (test mode)...');
    await scheduler.runOnce();
  } else {
    // Start scheduled automation
    scheduler.scheduleDaily();
    logger.info('🔄 Automation scheduler is now active. Press Ctrl+C to stop.');
    
    // Keep process alive
    process.on('SIGINT', () => {
      logger.info('Shutting down scheduler...');
      process.exit(0);
    });
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    logger.error(`Fatal error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = AutomationScheduler;
