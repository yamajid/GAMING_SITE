/**
 * Configuration Management - Load and validate environment variables
 */

const logger = require('./logger');

class Config {
  constructor() {
    this.config = {};
    this.loadConfig();
  }

  loadConfig() {
    // No critical env vars - script writes files; workflow handles git push
    const critical = [];

    // Required for enhanced content generation
    const recommended = [
      'CLAUDE_API_KEY',
    ];

    // Optional environment variables
    const optional = {
      AUTOMATION_SCHEDULE: '0 2 * * *', // 2:00 AM UTC daily
      REDDIT_CLIENT_ID: null,
      REDDIT_CLIENT_SECRET: null,
      // Netlify auto-deploys on push - no API needed
      GITHUB_OWNER: 'yamajid',
      GITHUB_REPO: 'GAMING_SITE',
      SLACK_WEBHOOK: null,
      DISCORD_WEBHOOK: null,
      EMAIL_WEBHOOK: null,
      DEBUG: 'false',
      DRY_RUN: 'false',
      GOOGLE_ANALYTICS_ID: null,
      GTM_CONTAINER_ID: null,
      TWITTER_ACCOUNT: '@GamingCoinsHub',
    };

    // Load critical variables (must have)
    critical.forEach(key => {
      if (!process.env[key]) {
        logger.error(`❌ CRITICAL: Missing required env var: ${key}`);
      }
      this.config[key] = process.env[key];
    });

    // Load recommended variables (warn if missing)
    recommended.forEach(key => {
      if (!process.env[key]) {
        logger.warn(`⚠️ RECOMMENDED: Missing ${key} - Content quality will be lower`);
      }
      this.config[key] = process.env[key] || null;
    });

    // Load optional variables with defaults
    Object.entries(optional).forEach(([key, defaultValue]) => {
      this.config[key] = process.env[key] || defaultValue;
    });

    this.validateConfig();
  }

  validateConfig() {
    // Validate schedule format (cron)
    if (!this.isCron(this.config.AUTOMATION_SCHEDULE)) {
      logger.warn(`Invalid cron format: ${this.config.AUTOMATION_SCHEDULE}, using default`);
      this.config.AUTOMATION_SCHEDULE = '0 2 * * *';
    }

    // Log startup configuration
    logger.header('⚙️  Automation Configuration Loaded');
    logger.info(`📅 Schedule: ${this.config.AUTOMATION_SCHEDULE} (cron format)`);
    logger.info(`🐙 GitHub: ${this.config.GITHUB_OWNER}/${this.config.GITHUB_REPO}`);
    
    // Claude API status
    if (this.config.CLAUDE_API_KEY) {
      logger.success(`✅ Claude API: Ready for AI content generation`);
    } else {
      logger.warn(`⚠️  Claude API: Not configured - using template generation only`);
    }

    logger.info(`🐛 Debug Mode: ${this.config.DEBUG === 'true' ? '✓ Enabled' : '✗ Disabled'}`);
    logger.info(`🔒 Dry Run: ${this.config.DRY_RUN === 'true' ? '✓ Enabled (no commits)' : '✗ Disabled (will publish)'}`);
    
    // SEO tracking
    if (this.config.GOOGLE_ANALYTICS_ID) {
      logger.info(`📊 Google Analytics: Configured`);
    }
  }

  get(key) {
    return this.config[key];
  }

  getAll() {
    return this.config;
  }

  isCron(expression) {
    // Basic cron format validation (5 fields)
    const cronRegex = /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/;
    return cronRegex.test(expression);
  }
}

module.exports = new Config();
