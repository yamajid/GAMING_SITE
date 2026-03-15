/**
 * Content Generator - AI-Powered + Template-Based Content Creation
 * Uses Claude API for high-quality content generation (when key provided)
 * Falls back to templates when API is unavailable
 */

const logger = require('./logger');
const config = require('./config');

class ContentGenerator {
  constructor() {
    this.apiKey = config.get('CLAUDE_API_KEY');
    this.name = 'ContentGenerator';
    this.claudeClient = null;
    this.setupClaudeClient();
  }

  setupClaudeClient() {
    if (this.apiKey) {
      try {
        const Anthropic = require('@anthropic-ai/sdk');
        this.claudeClient = new Anthropic({ apiKey: this.apiKey });
        logger.success('✅ Claude API client initialized');
      } catch (error) {
        logger.warn(`⚠️  Claude SDK not available: ${error.message}`);
        this.claudeClient = null;
      }
    } else {
      logger.warn('⚠️  No Claude API key - using fallback template generation');
    }
  }

  async generateContent(gameData) {
    const results = [];

    for (const [game, data] of Object.entries(gameData)) {
      try {
        logger.info(`✍️  Generating fresh content for ${game}...`);
        
        const content = await this.generateGameContent(game, data);
        results.push({
          game,
          content,
          generated: new Date(),
          success: true,
          usedClaude: !!this.claudeClient,
        });
      } catch (error) {
        logger.error(`Failed to generate content for ${game}: ${error.message}`);
        results.push({
          game,
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  }

  async generateGameContent(game, data) {
    const { codes, news, newMethods, questionsAsked } = data;

    // Generate content using Claude or fallback to templates
    const codesGuide = await this.generateCodesGuide(game, codes);
    const methodsGuide = await this.generateMethodsGuide(game, newMethods);
    const faqUpdates = await this.generateFAQUpdates(game, questionsAsked);
    const blog = await this.generateBlogPost(game, codes, news);

    return {
      codesGuide,
      methodsGuide,
      faqUpdates,
      blogPost: blog,
      metadata: {
        generatedAt: new Date(),
        game,
        sourceDataPoints: codes.length + news.length + newMethods.length + questionsAsked.length,
        usedClaude: !!this.claudeClient,
      },
    };
  }

  /**
   * Generate codes guide with AI enhancement
   */
  async generateCodesGuide(game, codes) {
    if (this.claudeClient && codes.length > 0) {
      try {
        const prompt = `You are a gaming guide writer. Generate a SEO-friendly, engaging section about the latest verified promo codes for ${game}. 
        
Available codes found today:
${codes.map(c => `- ${c.code} (verified: ${c.verified}, source: ${c.source})`).join('\n')}

Requirements:
- Markdown format
- Include "How to Redeem" instructions specific to ${game}
- Add tips for code expiration and verification
- Optimize for keywords: "${game} codes", "free ${game}", "working ${game} codes"
- Keep under 400 words
- Start with ## heading`;

        const response = await this.claudeClient.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1500,
          messages: [{ role: 'user', content: prompt }],
        });

        logger.info(`✓ Claude generated codes guide for ${game}`);
        return response.content[0].text;
      } catch (error) {
        logger.warn(`Claude API error for ${game} codes: ${error.message}, falling back to template`);
      }
    }

    // Fallback template generation
    return this.templateCodesGuide(game, codes);
  }

  /** Map scheduler game keys to docs folder names (kebab-case) */
  static getDocsFolder(gameName) {
    const map = {
      roblox: 'roblox',
      fortnite: 'fortnite',
      mobileLegends: 'mobile-legends',
      clashOfClans: 'clash-of-clans',
      genshinImpact: 'genshin-impact',
      pubgMobile: 'pubg-mobile',
      minecraft: 'minecraft',
      eaFc25: 'fifa-fc25',
    };
    return map[gameName] || gameName;
  }

  /**
   * Generate codes file for Publisher (returns {path, content})
   * Called by scheduler.
   *
   * SEO-safe: reads the existing file and updates ONLY the codes table
   * between the sentinel comments. Preserves frontmatter, SchemaOrg imports,
   * descriptions, how-to sections, and all other SEO content.
   */
  async generateCodesFile(gameName, codes, lastUpdated) {
    const fs = require('fs');
    const path = require('path');
    const folder = ContentGenerator.getDocsFolder(gameName);
    const filePath = `docs/${folder}/working-codes.md`;
    const absPath = path.resolve(__dirname, '..', '..', filePath);

    // Read existing file to preserve SEO content
    let existingContent = '';
    try {
      existingContent = fs.readFileSync(absPath, 'utf8');
    } catch (e) {
      // File doesn't exist yet — fall back to full template
    }

    const freshCodes = (codes || []).slice(0, 15);
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const month = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Build just the codes table section
    let codesTable = `<!-- AUTO-UPDATED: ${new Date().toISOString()} -->\n`;
    codesTable += `**Last verified:** ${dateStr} ✅\n\n`;

    if (freshCodes.length === 0) {
      codesTable += `## ✅ Currently Working Codes\n\n`;
      codesTable += `No new codes found today. We check every 12 hours — bookmark this page and check back soon!\n\n`;
    } else {
      codesTable += `## ✅ Currently Working Codes\n\n`;
      codesTable += `| Code | Reward | Source | Status |\n`;
      codesTable += `|------|--------|--------|--------|\n`;
      freshCodes.forEach(code => {
        const reward = code.reward || code.notes || 'In-game reward';
        const source = code.source || 'Community';
        codesTable += `| \`${code.code}\` | ${reward.substring(0, 40)} | ${source} | ✅ Active |\n`;
      });
      codesTable += `\n`;
    }
    codesTable += `<!-- END-AUTO-UPDATED -->`;

    // If existing file has sentinel comments — replace just that section
    if (existingContent.includes('<!-- AUTO-UPDATED:') && existingContent.includes('<!-- END-AUTO-UPDATED -->')) {
      const startIdx = existingContent.indexOf('<!-- AUTO-UPDATED:');
      const endIdx = existingContent.indexOf('<!-- END-AUTO-UPDATED -->') + '<!-- END-AUTO-UPDATED -->'.length;
      const newContent = existingContent.substring(0, startIdx) + codesTable + existingContent.substring(endIdx);
      return { path: filePath, content: newContent };
    }

    // If existing file has a "## ✅ Currently Working Codes" section — replace it
    if (existingContent.includes('## ✅ Currently Working Codes')) {
      // Find the section and replace through the next ## heading or end of file
      const sectionStart = existingContent.indexOf('## ✅ Currently Working Codes');
      const nextSection = existingContent.indexOf('\n## ', sectionStart + 5);
      const before = existingContent.substring(0, sectionStart);
      const after = nextSection !== -1 ? existingContent.substring(nextSection) : '';
      return { path: filePath, content: before + codesTable + '\n' + after };
    }

    // Existing file has no codes section yet — update the "Last verified" date and append codes
    if (existingContent.length > 100) {
      // Update date in frontmatter title if present
      let updated = existingContent.replace(
        /\*\*Last verified:\*\*.*\n/,
        `**Last verified:** ${dateStr} ✅\n`
      );
      // Append codes table before the first ## section after the intro
      const firstH2 = updated.indexOf('\n## ');
      if (firstH2 !== -1) {
        updated = updated.substring(0, firstH2) + '\n\n' + codesTable + updated.substring(firstH2);
      } else {
        updated += '\n\n' + codesTable;
      }
      return { path: filePath, content: updated };
    }

    // Fallback: file doesn't exist or is empty — generate minimal SEO-safe file
    const content = this.templateSEOCodesFile(gameName, folder, freshCodes, month, codesTable);
    return { path: filePath, content };
  }

  /**
   * Fallback template used only when working-codes.md doesn't exist yet.
   * Generates a full SEO-compliant file with frontmatter and SchemaOrg.
   */
  templateSEOCodesFile(gameName, folder, codes, month, codesTable) {
    const gameSlug = folder;
    const currencyNames = {
      roblox: 'Robux', fortnite: 'V-Bucks', 'mobile-legends': 'Diamonds',
      'clash-of-clans': 'Gems', 'genshin-impact': 'Primogems',
      'pubg-mobile': 'UC', minecraft: 'Minecoins', 'fifa-fc25': 'FC Points',
    };
    const currency = currencyNames[gameSlug] || 'in-game currency';

    return `---
title: "${gameName} Codes - Working Redeem Codes ${new Date().getFullYear()}"
description: "All working ${gameName} codes for ${month}. Free ${currency} and rewards verified and updated every 12 hours."
sidebar_position: 2
slug: working-codes
keywords: [${gameName.toLowerCase()} codes, working codes ${new Date().getFullYear()}, free ${currency.toLowerCase()} codes]
tags: [${gameName}, Codes]
---

import SchemaOrg from '@site/src/components/SchemaOrg';

<SchemaOrg
  type="howto"
  title="How to Redeem ${gameName} Codes"
  description="Step-by-step guide to redeeming ${gameName} codes for free ${currency}."
  steps={[
    "Open the game on your device",
    "Navigate to the code redemption section",
    "Enter the code exactly as shown",
    "Confirm to receive your reward"
  ]}
/>

# ${gameName} Codes — ${month}

${codesTable}
`;
  }

  /**
   * Generate FAQ file for Publisher (returns {path, content})
   * Called by scheduler
   */
  async generateFAQUpdate(gameName, news, questionsAsked) {
    const content = await this.generateFAQUpdates(gameName, questionsAsked || []);
    const folder = ContentGenerator.getDocsFolder(gameName);
    const path = `docs/${folder}/faq.md`;
    return { path, content };
  }

  /**
   * Generate earning guide file for Publisher (returns {path, content})
   * Called by scheduler
   */
  async generateEarningGuide(gameName, newMethods) {
    const content = await this.generateMethodsGuide(gameName, newMethods || []);
    const folder = ContentGenerator.getDocsFolder(gameName);
    const path = `docs/${folder}/earning-guide.md`;
    return { path, content };
  }

  /**
   * Generate latest-updates roundup file (returns {path, content})
   * Brief summary of codes + news + methods for quick reference
   */
  async generateLatestUpdates(gameName, data) {
    const codes = data.codes || [];
    const news = data.news || [];
    const methods = data.newMethods || [];
    const date = new Date().toLocaleDateString();
    let content = `## ${gameName} Latest Updates (${date})\n\n`;
    content += `| Metric | Count |\n|--------|-------|\n`;
    content += `| Active codes | ${codes.length} |\n`;
    content += `| News items | ${news.length} |\n`;
    content += `| Earning methods | ${methods.length} |\n\n`;
    if (codes.length > 0) {
      content += `### Top Codes\n${codes.slice(0, 3).map(c => `- \`${c.code}\` ${c.verified ? '✅' : ''}`).join('\n')}\n\n`;
    }
    if (news.length > 0) {
      content += `### Recent News\n${news.slice(0, 2).map(n => `- ${n.title}`).join('\n')}\n\n`;
    }
    content += `See [working-codes](./working-codes.md), [faq](./faq.md), and [earning-guide](./earning-guide.md) for details.\n`;
    const folder = ContentGenerator.getDocsFolder(gameName);
    const path = `docs/${folder}/latest-updates.md`;
    return { path, content };
  }

  templateCodesGuide(game, codes) {
    let guide = `## Latest ${game} Codes (Updated ${new Date().toLocaleDateString()})\n\n`;
    
    if (codes.length === 0) {
      guide += `No new **${game}** codes available at this moment. We check for new codes hourly, so check back soon!\n\n`;
      return guide;
    }

    guide += `Found **${codes.length} active ${game} codes** today:\n\n`;
    
    codes.forEach((code, idx) => {
      guide += `${idx + 1}. **\`${code.code}\`** ${code.verified ? '✅ Verified' : '⏳ Pending'}\n`;
      if (code.notes) guide += `   ${code.notes}\n`;
      guide += '\n';
    });

    guide += '### How to Redeem Codes in ' + game + '\n\n';
    
    const redeemSteps = {
      Roblox: [
        'Open the Roblox app or website',
        'Click your avatar (top-right corner)',
        'Select "Redeem Robux"',
        'Enter the code and confirm'
      ],
      Fortnite: [
        'Open Epic Games Launcher',
        'Go to Fortnite',
        'Select your account',
        'Go to "Redeem Code"',
        'Enter the V-Bucks code'
      ],
      'Mobile Legends': [
        'Open Mobile Legends game',
        'Tap the Mail icon',
        'Find "Redeem Gifts"',
        'Paste the code'
      ],
      'Clash of Clans': [
        'Open Clash of Clans',
        'Tap your username (top corner)',
        'Select the gem symbol',
        'Choose "Redeem Code"'
      ],
      'Genshin Impact': [
        'Go to genshin.hoyoverse.com/en/gift',
        'Log in with your HoYoverse account',
        'Select your game server',
        'Enter the code and click Exchange',
        'Collect rewards from your in-game mailbox'
      ],
      'PUBG Mobile': [
        'Open PUBG Mobile',
        'Tap your profile picture (top left)',
        'Tap Events then Redeem',
        'Enter the code and confirm'
      ],
      Minecraft: [
        'Go to minecraft.net/redeem',
        'Log in with your Microsoft account',
        'Enter the redemption code',
        'Click Redeem to confirm'
      ],
      'EA FC 25': [
        'Go to ea.com/redeem',
        'Log in with your EA account',
        'Enter the code',
        'Click Redeem — content is added to your account'
      ],
    };

    const steps = redeemSteps[game] || ['Check in-game settings for redemption', 'Look for "Redeem Code" option'];
    steps.forEach((step, i) => {
      guide += `${i + 1}. ${step}\n`;
    });

    guide += '\n⏰ **Note:** Codes usually expire within 7-14 days. Redeem immediately!\n\n';
    
    return guide;
  }

  /**
   * Generate earning methods guide with AI enhancement
   */
  async generateMethodsGuide(game, methods) {
    if (this.claudeClient && methods.length > 0) {
      try {
        const prompt = `You are an expert in ${game}. Write a comprehensive guide about new earning methods for free currency in ${game}.

New methods discovered:
${methods.map(m => `- ${m.method}: ${m.description}`).join('\n')}

Requirements:
- Markdown format
- Detailed step-by-step instructions
- Time and effortestimates
- ROI calculations where relevant
- SEO keywords: "earn free", "${game.toLowerCase()} earn", "${game.toLowerCase()} free currency"
- Practical tips and warnings
- Keep under 600 words`;

        const response = await this.claudeClient.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2000,
          messages: [{ role: 'user', content: prompt }],
        });

        logger.info(`✓ Claude generated methods guide for ${game}`);
        return response.content[0].text;
      } catch (error) {
        logger.warn(`Claude API error for ${game} methods: ${error.message}`);
      }
    }

    // Fallback template
    return this.templateMethodsGuide(game, methods);
  }

  templateMethodsGuide(game, methods) {
    let guide = `## Fastest Ways to Earn Free ${game} Currency (${new Date().toLocaleDateString()})\n\n`;
    
    if (methods.length === 0) {
      guide += `No new earning methods discovered today. See our complete guide for all current methods.\n`;
      return guide;
    }

    methods.forEach((method, idx) => {
      guide += `### Method ${idx + 1}: ${method.method}\n\n`;
      guide += `**Description:** ${method.description}\n\n`;
      guide += `**Time Investment:** ~15-30 min/day\n`;
      guide += `**Difficulty:** Beginner-friendly\n\n`;
      guide += `**How to do it:**\n`;
      guide += `1. Start with method description\n`;
      guide += `2. Follow steps as outlined\n`;
      guide += `3. Complete and claim rewards\n\n`;
    });

    guide += '### Earning Methods Comparison\n\n';
    guide += '| Method | Time/Day | Earnings/Month | Difficulty |\n';
    guide += '|--------|----------|---|---|\n';
    methods.slice(0, 4).forEach(m => {
      guide += `| ${m.method} | 30 min | Variable | Easy |\n`;
    });

    return guide;
  }

  /**
   * Generate FAQ updates with Claude for better answers
   */
  async generateFAQUpdates(game, questions) {
    if (this.claudeClient && questions.length > 0) {
      try {
        const topQuestions = questions.slice(0, 5);
        const prompt = `You are a ${game} expert. Answer these popular community questions with accurate, helpful info.

Questions:
${topQuestions.map((q, i) => `${i + 1}. ${q.question}`).join('\n')}

Requirements:
- Markdown format
- Direct, actionable answers (2-3 sentences each)
- Include tips and warnings where relevant
- SEO-friendly wording
- Start with ## Heading`;

        const response = await this.claudeClient.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1500,
          messages: [{ role: 'user', content: prompt }],
        });

        logger.info(`✓ Claude generated FAQ for ${game}`);
        return response.content[0].text;
      } catch (error) {
        logger.warn(`Claude API error for ${game} FAQ: ${error.message}`);
      }
    }

    // Fallback template
    return this.templateFAQUpdates(game, questions);
  }

  templateFAQUpdates(game, questions) {
    let faq = `## Community Q&A - ${game} (${new Date().toLocaleDateString()})\n\n`;
    
    if (questions.length === 0) {
      faq += 'No new community questions this week. See our FAQ section for common queries.\n';
      return faq;
    }

    faq += `### #1 Trending Questions\n\n`;
    
    questions.slice(0, 5).forEach((q, idx) => {
      faq += `**Q${idx + 1}:** ${q.question}\n`;
      faq += `*👍 ${q.upvotes} upvotes, 💬 ${q.comments} comments*\n\n`;
    });

    faq += 'Check our detailed FAQ section for answers to these questions!\n';

    return faq;
  }

  /**
   * Generate blog post for publishing
   */
  async generateBlogPost(game, codes, news) {
    if (this.claudeClient && (codes.length > 0 || news.length > 0)) {
      try {
        const codesPreview = codes.slice(0, 3).map(c => c.code).join(', ');
        const prompt = `Write an engaging blog post (300-400 words) about today's news and codes in ${game}.

Today's updates:
- New codes: ${codesPreview || 'None'}
- Major news: ${news[0]?.title || 'Regular updates'}

Requirements:
- Engaging headline with date
- Hook readers with urgency ("Don't miss these codes!")
- Include call-to-action to visit guides
- SEO keywords naturally
- Markdown format
- Friendly, casual tone`;

        const response = await this.claudeClient.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1200,
          messages: [{ role: 'user', content: prompt }],
        });

        logger.info(`✓ Claude generated blog post for ${game}`);
        return response.content[0].text;
      } catch (error) {
        logger.warn(`Claude API error for blog: ${error.message}`);
      }
    }

    // Fallback: Simple blog template
    return `# ${game} Updates - ${new Date().toLocaleDateString()}\n\nFound ${codes.length} new codes and ${news.length} updates today. Check our guides for the latest!`;
  }
}

module.exports = ContentGenerator;
