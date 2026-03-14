#!/usr/bin/env node

/**
 * Gaming Coins Hub - Daily Automation Scheduler
 * 
 * This script orchestrates daily tasks:
 * - Scrapes fresh codes and news for all 4 games
 * - Generates updated guides using Claude API
 * - Writes files to disk → GitHub Actions commits & pushes → Netlify auto-deploys
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
const MobileLegendsScraper = require('./scrapers/mobile-legends-scraper');
const ClashOfClansScraper = require('./scrapers/clash-of-clans-scraper');
const ContentGenerator = require('./generator');
const Publisher = require('./publisher');

class AutomationScheduler {
  constructor() {
    this.scrapers = {
      roblox: new RobloxScraper(),
      fortnite: new FortniteScraper(),
      mobileLegends: new MobileLegendsScraper(),
      clashOfClans: new ClashOfClansScraper(),
    };
    this.generator = new ContentGenerator();
    this.publisher = new Publisher();
    this.stats = {
      startTime: null,
      endTime: null,
      scrapersSuccess: 0,
      scrapersFailed: 0,
      filesGenerated: 0,
      filesWritten: 0,
      filesFailed: 0,
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

      // Step 3: Write files to disk (GitHub Actions will git commit & push → Netlify deploys)
      let publishResult = { filesWritten: 0, filesFailed: 0 };
      if (config.get('DRY_RUN') === 'true') {
        logger.info('🔒 DRY_RUN: Skipping file write');
      } else {
        logger.info('🚀 Step 3: Writing generated files to disk...');
        publishResult = await this.publishContent(generatedFiles);
      }

      this.stats.endTime = new Date();
      this.stats.filesGenerated = generatedFiles.length;
      this.stats.filesWritten = publishResult.filesWritten ?? 0;
      this.stats.filesFailed = publishResult.filesFailed ?? 0;

      logger.success(`✅ Daily automation completed successfully!`);
      this.logStats();

      // Send success notification
      await this.notifySuccess();
    } catch (error) {
      logger.error(`❌ Automation failed: ${error.message}`);
      this.stats.scrapersFailed++;
      
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
            const codes = data.codes?.length ?? 0;
            const news = data.news?.length ?? 0;
            logger.info(`✓ ${gameName}: Found ${codes} codes, ${news} news items`);
            this.stats.scrapersSuccess++;
          })
          .catch(error => {
            logger.warn(`✗ ${gameName}: ${error.message}`);
            allData[gameName] = { codes: [], news: [], error: error.message };
            this.stats.scrapersFailed++;
          })
      );
    }

    await Promise.all(scrapePromises);
    return allData;
  }

  /**
   * Generate fresh content for all games - ALWAYS 3 files per game (12 total)
   * Uses templates when data is empty; ensures maximum output
   */
  async generateContent(scrapedData) {
    const generatedFiles = [];

    for (const [gameName, data] of Object.entries(scrapedData)) {
      try {
        logger.generator(`Generating content for ${gameName}...`);

        // 1. Codes file - always generate (template handles empty)
        const codesFile = await this.generator.generateCodesFile(
          gameName,
          data.codes || [],
          data.lastUpdated || new Date()
        );
        generatedFiles.push(codesFile);
        logger.generator(`  ✓ ${codesFile.path} (${(data.codes?.length ?? 0)} codes)`);

        // 2. FAQ file - always generate (template handles empty)
        const faqFile = await this.generator.generateFAQUpdate(
          gameName,
          data.news || [],
          data.questionsAsked || []
        );
        generatedFiles.push(faqFile);
        logger.generator(`  ✓ ${faqFile.path} (${(data.news?.length ?? 0)} news, ${(data.questionsAsked?.length ?? 0)} Q&A)`);

        // 3. Earning guide - always generate (template handles empty)
        const guideFile = await this.generator.generateEarningGuide(
          gameName,
          data.newMethods || []
        );
        generatedFiles.push(guideFile);
        logger.generator(`  ✓ ${guideFile.path} (${(data.newMethods?.length ?? 0)} methods)`);

        // 4. Latest-updates roundup - always generate (16 files total)
        const updatesFile = await this.generator.generateLatestUpdates(gameName, data);
        generatedFiles.push(updatesFile);
        logger.generator(`  ✓ ${updatesFile.path} (roundup)`);
      } catch (error) {
        logger.warn(`⚠️ Failed to generate content for ${gameName}: ${error.message}`);
      }
    }

    return generatedFiles;
  }

  /**
   * Write generated files to disk. In CI, workflow handles git commit & push. Netlify auto-deploys.
   */
  async publishContent(generatedFiles) {
    try {
      const result = await this.publisher.publishFiles(generatedFiles);
      logger.info(`📝 Wrote ${result.filesWritten} files to disk`);
      if (result.filesFailed > 0) {
        logger.warn(`⚠️  ${result.filesFailed} file(s) failed to write`);
      }
      if (process.env.GITHUB_ACTIONS === 'true') {
        logger.info(`⏳ GitHub Actions will commit & push → Netlify auto-deploys`);
      }
      return result;
    } catch (error) {
      logger.error(`Failed to write files: ${error.message}`);
      throw error;
    }
  }

  /**
   * Log automation statistics - rich box output
   */
  logStats() {
    const duration = Math.round((this.stats.endTime - this.stats.startTime) / 1000);
    const totalScrapers = Object.keys(this.scrapers).length;
    logger.stats('Automation Statistics', {
      Duration: `${duration}s`,
      Scrapers: `${this.stats.scrapersSuccess}/${totalScrapers} succeeded, ${this.stats.scrapersFailed} failed`,
      'Files generated': this.stats.filesGenerated,
      'Files written': this.stats.filesWritten,
      'Files failed': this.stats.filesFailed,
    });
  }

  /**
   * Send success notification
   */
  async notifySuccess() {
    // Send webhook notification (Slack, Discord, email, etc.)
    if (process.env.WEBHOOK_URL) {
      try {
        const message = `✅ Gaming Coins Hub automation succeeded!\n${this.stats.filesGenerated} files generated, ${this.stats.filesWritten} written`;
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
