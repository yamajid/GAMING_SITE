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
    // Required environment variables
    const required = [
      'REDDIT_CLIENT_ID',
      'REDDIT_CLIENT_SECRET',
      'GITHUB_TOKEN',
    ];

    // Optional environment variables
    const optional = {
      AUTOMATION_SCHEDULE: '0 2 * * *', // 2:00 AM UTC daily
      CLAUDE_API_KEY: null,
      VERCEL_TOKEN: null,
      VERCEL_PROJECT_ID: null,
      VERCEL_WEBHOOK: null,
      GITHUB_OWNER: 'your-username',
      GITHUB_REPO: 'gaming-coins-hub',
      SLACK_WEBHOOK: null,
      DISCORD_WEBHOOK: null,
      EMAIL_WEBHOOK: null,
      DEBUG: 'false',
      DRY_RUN: 'false',
    };

    // Load required variables
    required.forEach(key => {
      if (!process.env[key]) {
        logger.error(`Missing required env var: ${key}`);
      }
      this.config[key] = process.env[key];
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
    logger.info(`Schedule: ${this.config.AUTOMATION_SCHEDULE} (cron format)`);
    logger.info(`GitHub Repo: ${this.config.GITHUB_OWNER}/${this.config.GITHUB_REPO}`);
    logger.info(`Debug Mode: ${this.config.DEBUG === 'true' ? '✓ Enabled' : '✗ Disabled'}`);
    logger.info(`Dry Run: ${this.config.DRY_RUN === 'true' ? '✓ Enabled (no commits)' : '✗ Disabled (will publish)'}`);
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
