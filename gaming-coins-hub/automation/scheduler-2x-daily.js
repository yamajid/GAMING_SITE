#!/usr/bin/env node

/**
 * Enhanced Automation Scheduler - 2x Daily
 * 
 * Runs at:
 * - 2:00 AM UTC (Morning) - Scrape all sources, generate fresh content
 * - 2:00 PM UTC (Afternoon) - Answer trending questions with Claude
 * 
 * Features:
 * - 4x data sources per game (Reddit, Blog, Wiki, Updates)
 * - Claude AI content generation
 * - Trending question Q&A
 * - Automatic GitHub publishing
 */

const cron = require('node-cron');
const path = require('path');
const fs = require('fs');

// Automation modules
const logger = require('./logger');
const config = require('./config');

// Scrapers
const RobloxScraper = require('./scrapers/roblox-scraper');
const FortniteScraper = require('./scrapers/fortnite-scraper');
const MobileLegendsScraperaper = require('./scrapers/mobile-legends-scraper');
const ClashOfClansScraper = require('./scrapers/clash-of-clans-scraper');

// Generators & Publishers
const ContentGenerator = require('./generator');
const Publisher = require('./publisher');
const QAAnswerer = require('./qa-answerer');

class EnhancedScheduler {
  constructor() {
    this.scrapers = {
      roblox: new RobloxScraper(),
      fortnite: new FortniteScraper(),
      mobileLegends: new MobileLegendsScraperaper(),
      clashOfClans: new ClashOfClansScraper(),
    };

    this.generator = new ContentGenerator();
    this.publisher = new Publisher();
    this.qaAnswerer = new QAAnswerer();

    this.stats = {
      morningRun: null,
      afternoonRun: null,
      totalCodesFound: 0,
      totalNewsItems: 0,
      totalQAAnswersGenerated: 0,
    };
  }

  /**
   * MORNING RUN - 2:00 AM UTC
   * Scrapes fresh data and generates updated guides
   */
  async morningRun() {
    logger.info('🌅 Starting MORNING automation (2 AM UTC)...');
    this.stats.morningRun = new Date();

    try {
      // Step 1: Scrape from all 4 sources for all games
      logger.info('📡 Scraping fresh codes + news from 4 sources...');
      const scrapedData = await this.scrapeAllGamesAllSources();

      // Step 2: Generate new guides with Claude
      logger.info('✍️ Generating AI-optimized guides...');
      const generatedFiles = await this.generator.generateAll(scrapedData);

      // Step 3: Publish to GitHub
      logger.info('🚀 Publishing to GitHub...');
      await this.publisher.publishContent(generatedFiles);

      // Step 4: Log success
      logger.success('✅ MORNING RUN COMPLETE');
      this.logMorningStats(scrapedData, generatedFiles);

    } catch (error) {
      logger.error(`❌ Morning run failed: ${error.message}`);
      await this.notifyFailure('morning', error);
    }
  }

  /**
   * AFTERNOON RUN - 2:00 PM UTC
   * Answers trending questions with Claude
   */
  async afternoonRun() {
    logger.info('☀️ Starting AFTERNOON automation (2 PM UTC)...');
    this.stats.afternoonRun = new Date();

    try {
      // Step 1: Answer all trending questions with Claude
      logger.info('🤖 Generating AI answers for trending questions...');
      const answers = await this.qaAnswerer.answerTrendingQuestions();

      // Step 2: Save Q&A cache
      logger.info('💾 Saving Q&A answers...');
      this.qaAnswerer.saveAnswers(answers);

      // Step 3: Post answers to community (optional)
      logger.info('📢 Posting answers to Reddit communities...');
      await this.postAnswersToReddit(answers);

      // Step 4: Log success
      logger.success('✅ AFTERNOON RUN COMPLETE');
      this.logAfternoonStats(answers);

    } catch (error) {
      logger.error(`❌ Afternoon run failed: ${error.message}`);
      await this.notifyFailure('afternoon', error);
    }
  }

  /**
   * Scrape all games from all 4 sources in parallel
   */
  async scrapeAllGamesAllSources() {
    const allData = {};

    const scrapePromises = Object.entries(this.scrapers).map(
      ([gameName, scraper]) =>
        scraper.scrape()
          .then(data => {
            allData[gameName] = data;
            this.stats.totalCodesFound += data.codes?.length || 0;
            this.stats.totalNewsItems += data.news?.length || 0;

            logger.info(
              `✓ ${gameName}: ${data.codes.length} codes, ${data.news.length} news from ${data.sourcesChecked.length} sources`
            );
          })
          .catch(error => {
            logger.warn(`⚠️ ${gameName} scraping failed: ${error.message}`);
            allData[gameName] = { codes: [], news: [], sourcesChecked: [] };
          })
    );

    await Promise.all(scrapePromises);
    return allData;
  }

  /**
   * Post answers to Reddit communities
   */
  async postAnswersToReddit(answers) {
    // This would integrate with reddit-poster-browser.js
    // For now, just log that answers are ready
    logger.info('📝 Q&A answers ready for Reddit communities');
    
    // In production, this would:
    // 1. Format answers for Reddit
    // 2. Post to relevant subreddits
    // 3. Link back to guides on site
  }

  /**
   * Log morning run statistics
   */
  logMorningStats(scrapedData, generatedFiles) {
    console.log(`
╔═══════════════════════════════════════════╗
║  MORNING RUN STATISTICS (2 AM UTC)        ║
╚═══════════════════════════════════════════╝

📊 DATA SCRAPED:
   Total Codes Found: ${this.stats.totalCodesFound}
   Total News Items: ${this.stats.totalNewsItems}
   Games Updated: ${Object.keys(scrapedData).length}

📄 CONTENT GENERATED:
   Files Generated: ${generatedFiles.length}
   Files Published: (check GitHub)

⏱️ TIME:
   Started: ${this.stats.morningRun.toLocaleTimeString('en-US', { hour12: false })} UTC
   Duration: ${Math.round((Date.now() - this.stats.morningRun.getTime()) / 1000)}s

✅ STATUS: SUCCESS
    `);
  }

  /**
   * Log afternoon run statistics
   */
  logAfternoonStats(answers) {
    let totalAnswers = 0;
    for (const gameAnswers of Object.values(answers)) {
      totalAnswers += Object.keys(gameAnswers).length;
    }
    this.stats.totalQAAnswersGenerated = totalAnswers;

    console.log(`
╔═══════════════════════════════════════════╗
║  AFTERNOON RUN STATISTICS (2 PM UTC)      ║
╚═══════════════════════════════════════════╝

🤖 Q&A GENERATED:
   Total Answers: ${totalAnswers}
   Games Covered: ${Object.keys(answers).length}

📌 ANSWERS PER GAME:
${Object.entries(answers)
  .map(([game, qa]) => `   • ${game}: ${Object.keys(qa).length} answers`)
  .join('\n')}

⏱️ TIME:
   Started: ${this.stats.afternoonRun.toLocaleTimeString('en-US', { hour12: false })} UTC
   Duration: ${Math.round((Date.now() - this.stats.afternoonRun.getTime()) / 1000)}s

✅ STATUS: SUCCESS
    `);
  }

  /**
   * Schedule the two daily runs
   */
  schedule() {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║    Gaming Coins Hub - Enhanced 2x Daily Scheduler       ║
║                                                          ║
║  🌅 MORNING:    2:00 AM UTC - Content Generation        ║
║  ☀️  AFTERNOON:  2:00 PM UTC - Q&A Answering            ║
║                                                          ║
║  ✓ 4 games × 4 sources = Fresh data                     ║
║  ✓ Claude AI generates guides                           ║
║  ✓ Claude AI answers trending questions                 ║
║  ✓ Automatic GitHub publishing                         ║
╚══════════════════════════════════════════════════════════╝
    `);

    // MORNING RUN: 2:00 AM UTC
    const morningCron = cron.schedule('0 2 * * *', () => {
      console.log('\n⏰ 2 AM UTC - Starting morning automation...');
      this.morningRun().catch(console.error);
    }, { timezone: 'UTC' });

    // AFTERNOON RUN: 2:00 PM UTC (14:00 UTC)
    const afternoonCron = cron.schedule('0 14 * * *', () => {
      console.log('\n⏰ 2 PM UTC - Starting afternoon automation...');
      this.afternoonRun().catch(console.error);
    }, { timezone: 'UTC' });

    console.log('✅ Scheduler active. Waiting for scheduled times...\n');

    // Optional: Run immediately for testing
    if (process.argv.includes('--test-now')) {
      console.log('🧪 TEST MODE: Running both immediately...\n');
      this.morningRun().then(() => this.afternoonRun()).catch(console.error);
    }

    return { morningCron, afternoonCron };
  }

  /**
   * Manual trigger for morning run
   */
  async runMorningNow() {
    console.log('▶️  Running morning automation NOW...\n');
    await this.morningRun();
  }

  /**
   * Manual trigger for afternoon run
   */
  async runAfternoonNow() {
    console.log('▶️  Running afternoon automation NOW...\n');
    await this.afternoonRun();
  }

  /**
   * Notify on failure
   */
  async notifyFailure(time, error) {
    const message = `❌ Automation failed (${time}) - ${error.message}`;
    logger.error(message);

    // In production, send email/Slack notification
    // await sendNotification(message);
  }
}

// CLI Usage
if (require.main === module) {
  const scheduler = new EnhancedScheduler();
  const cmd = process.argv[2];

  if (cmd === '--morning-now') {
    scheduler.runMorningNow().catch(console.error);
  } else if (cmd === '--afternoon-now') {
    scheduler.runAfternoonNow().catch(console.error);
  } else if (cmd === '--test-now') {
    scheduler.schedule();
  } else {
    scheduler.schedule();
  }
}

module.exports = EnhancedScheduler;
