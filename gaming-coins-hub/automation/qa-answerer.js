#!/usr/bin/env node

/**
 * Game Q&A Answerer using Claude AI
 * Monitors Reddit + Discord for questions about games
 * Uses Claude to generate accurate, helpful answers
 */

const Anthropic = require('@anthropic-ai/sdk').default;
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

class QAAnswerer {
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });

    this.games = {
      roblox: {
        subreddit: 'r/roblox',
        file: 'docs/roblox/earn-free-robux-2026.md',
        info: 'Robux earning guide'
      },
      fortnite: {
        subreddit: 'r/FortniteBR',
        file: 'docs/fortnite/free-vbucks-guide.md',
        info: 'V-Bucks earning guide'
      },
      mobileLegends: {
        subreddit: 'r/MobileLegendsGame',
        file: 'docs/mobile-legends/free-diamonds-guide.md',
        info: 'Diamonds earning guide'
      },
      clashOfClans: {
        subreddit: 'r/ClashOfClans',
        file: 'docs/clash-of-clans/achievements-gems-guide.md',
        info: 'Gems/achievements guide'
      }
    };

    this.commonQuestions = {
      roblox: [
        'How to get free Robux?',
        'Are Robux generators safe?',
        'Best way to earn Robux 2026?',
        'How to get free Premium on Roblox?',
        'Fastest method to get Robux?'
      ],
      fortnite: [
        'How to get free V-Bucks?',
        'Are free V-Bucks legit?',
        'Best way to earn V-Bucks?',
        'Can I get free Battle Pass?',
        'How often do V-Buck challenges reset?'
      ],
      mobileLegends: [
        'How to get free diamonds?',
        'Best diamond farming method?',
        'Are diamond generators real?',
        'How to earn diamonds fast?',
        'Monthly diamond limit?'
      ],
      clashOfClans: [
        'How to get free gems?',
        'Best achievement for gems?',
        'How to farm gems efficiently?',
        'Are gem generators safe?',
        'Gem chest spawn rate?'
      ]
    };
  }

  /**
   * Generate answer using Claude for a specific question
   */
  async generateAnswer(game, question) {
    const gameInfo = this.games[game];
    if (!gameInfo) return null;

    // Read the relevant guide
    const guidePath = path.join(__dirname, '..', gameInfo.file);
    const guideContent = fs.existsSync(guidePath) 
      ? fs.readFileSync(guidePath, 'utf8') 
      : 'No guide available';

    const prompt = `You are a gaming expert answering questions about ${game}.

USER QUESTION: "${question}"

RELEVANT GUIDE:
${guideContent.substring(0, 2000)}

REQUIREMENTS:
1. Answer directly and use specific numbers/methods from the guide
2. Include a link to our guide at the end: https://gamingcoinshub.com/${gameInfo.file}
3. Be concise (2-3 paragraphs max)
4. Only recommend verified, safe methods
5. Start with the fastest method
6. End with: "More detailed methods: https://gamingcoinshub.com/${gameInfo.file}"

Answer confidently as if you're the guide author.`;

    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      return response.content[0].type === 'text' ? response.content[0].text : null;
    } catch (error) {
      console.error(`Claude API error: ${error.message}`);
      return this.getFallbackAnswer(game, question);
    }
  }

  /**
   * Fallback answer if Claude API fails
   */
  getFallbackAnswer(game, question) {
    const gameInfo = this.games[game];
    return `Check our comprehensive guide: ${gameInfo.info}

Link: https://gamingcoinshub.com/${gameInfo.file}

We update daily with the latest working methods and codes!`;
  }

  /**
   * Scrape Reddit for trending questions
   */
  async scrapeTrendingQuestions(subreddit) {
    try {
      const url = `https://www.reddit.com/r/${subreddit.replace('r/', '')}/new.json?limit=10`;
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'GamingCoinsHub/1.0'
        },
        timeout: 5000
      });

      const posts = response.data.data.children;
      const questions = posts
        .map(post => ({
          title: post.data.title,
          upvotes: post.data.ups,
          comments: post.data.num_comments
        }))
        .filter(p => p.title.includes('?'))
        .sort((a, b) => b.upvotes - a.upvotes)
        .slice(0, 5);

      return questions;
    } catch (error) {
      console.error(`Reddit scraping failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Generate answers for all trending questions
   */
  async answerTrendingQuestions() {
    console.log('📚 Generating AI answers for trending questions...\n');

    const answers = {};

    for (const [gameName, gameInfo] of Object.entries(this.games)) {
      console.log(`\n🎮 ${gameName.toUpperCase()}`);
      console.log('='.repeat(50));

      // Scrape trending questions
      const trendingQuestions = await this.scrapeTrendingQuestions(gameInfo.subreddit);

      if (trendingQuestions.length === 0) {
        // Use common questions if trending not available
        const commonQ = this.commonQuestions[gameName];
        for (const question of commonQ.slice(0, 3)) {
          console.log(`\n❓ Q: ${question}`);
          const answer = await this.generateAnswer(gameName, question);
          console.log(`✅ A: ${answer.substring(0, 150)}...\n`);

          if (!answers[gameName]) answers[gameName] = [];
          answers[gameName].push({ question, answer });
        }
      } else {
        for (const q of trendingQuestions) {
          console.log(`\n❓ Q: ${q.title} (${q.upvotes} upvotes)`);
          const answer = await this.generateAnswer(gameName, q.title);
          console.log(`✅ A: ${answer.substring(0, 150)}...\n`);

          if (!answers[gameName]) answers[gameName] = [];
          answers[gameName].push({ question: q.title, answer });
        }
      }
    }

    // Save answers to file
    this.saveAnswers(answers);
    return answers;
  }

  /**
   * Save Q&A to file for reference
   */
  saveAnswers(answers) {
    const timestamp = new Date().toISOString();
    const qaFile = path.join(__dirname, 'qa-cache.json');

    const cache = fs.existsSync(qaFile) 
      ? JSON.parse(fs.readFileSync(qaFile, 'utf8'))
      : {};

    cache[timestamp] = answers;

    fs.writeFileSync(qaFile, JSON.stringify(cache, null, 2));
    console.log(`\n✅ Q&A answers saved to qa-cache.json`);
  }

  /**
   * Answer a specific user question
   */
  async answerQuestion(game, question) {
    console.log(`\n🤖 Generating AI answer...\n`);
    const answer = await this.generateAnswer(game, question);
    console.log(`Answer:\n${answer}`);
    return answer;
  }

  /**
   * Batch answer common questions for all games
   */
  async answerAllCommonQuestions() {
    console.log('🎯 Answering all common questions with Claude...\n');

    const allAnswers = {};

    for (const [gameName, questions] of Object.entries(this.commonQuestions)) {
      console.log(`\n📖 ${gameName.toUpperCase()}`);

      allAnswers[gameName] = {};

      for (const question of questions) {
        process.stdout.write(`  | ${question} ... `);
        const answer = await this.generateAnswer(gameName, question);
        allAnswers[gameName][question] = answer;
        console.log('✅');
      }
    }

    this.saveAnswers(allAnswers);
    return allAnswers;
  }
}

// CLI Usage
if (require.main === module) {
  const qa = new QAAnswerer();
  const cmd = process.argv[2];

  if (cmd === '--trending') {
    qa.answerTrendingQuestions().catch(console.error);
  } else if (cmd === '--all') {
    qa.answerAllCommonQuestions().catch(console.error);
  } else if (cmd === '--game' && process.argv[3] && process.argv[4]) {
    const game = process.argv[3];
    const question = process.argv[4];
    qa.answerQuestion(game, question).catch(console.error);
  } else {
    console.log(`
Gaming Coins Hub - Q&A Answerer
================================

Usage:
  node qa-answerer.js --trending    # Answer trending Reddit questions
  node qa-answerer.js --all         # Answer all common questions
  node qa-answerer.js --game <game> "<question>"  # Answer specific question

Examples:
  node qa-answerer.js --game roblox "How to get free Robux?"
  node qa-answerer.js --game fortnite "Best V-Bucks farming?"
    `);
  }
}

module.exports = QAAnswerer;
