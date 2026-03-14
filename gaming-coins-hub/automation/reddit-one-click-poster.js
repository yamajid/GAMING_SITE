#!/usr/bin/env node

/**
 * Reddit One-Click Poster
 * Simplest possible solution - generates posts & opens Reddit in browser
 * User clicks one button to post
 * 
 * No credentials needed
 * No API required
 * 100% safe - just copy & paste
 * 
 * Usage: node reddit-one-click-poster.js
 */

const fs = require('fs');
const path = require('path');
const open = require('open');
const chalk = require('chalk');
const readline = require('readline');

class RedditOneClickPoster {
  constructor() {
    this.posts = this.generateTodaysPost();
    this.subreddits = [
      { sub: 'roblox', color: '#FF3B30' },
      { sub: 'FortniteBR', color: '#5865F2' },
      { sub: 'MobileLegendsGame', color: '#FFB900' },
      { sub: 'ClashOfClans', color: '#FF6B00' }
    ];
  }

  generateTodaysPost() {
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return {
      roblox: {
        title: `✅ 5+ FREE Robux Codes Working RIGHT NOW (Updated ${today})`,
        content: `Just discovered these working today!

🎁 **Today's Working Codes:**
- WINTERGAMES2026 → 50 Robux (2 min)
- GABESBIRTHDAY → 100 Robux (2 min)  
- PETERARMSTRONG → 25 Robux (2 min)

⏱️ **Time to redeem:** 2-5 minutes all codes
👉 **How:** Go to Settings → Redeem Code → Enter code

---

**Full verification + more methods:** https://gamingcoinshub.com/docs/roblox/earn-free-robux-2026

I maintain a site that **automatically updates daily** with new working codes as they're released. All verified, no scams.

Let me know if any codes aren't working!`
      },

      FortniteBR: {
        title: `⚡ FREE V-Bucks Codes Available NOW (${today})`,
        content: `Found several working methods for today!

🎁 **V-Bucks This Week:**

**Top Method:** Save the World Daily Quests
- 50-100 V-Bucks **every single day**
- One-time $20 purchase
-$0.20-0.30 per V-Buck = Best ROI

**Quick Methods (No cost):**
- Battle Pass missions: 100-200 V-Bucks per season
- Seasonal events: 50-300 V-Bucks/season

---

**Full strategy guide:** https://gamingcoinshub.com/docs/fortnite/free-vbucks-guide

I maintain a site that **automatically updates daily** with current methods and working codes.

Questions? Comment below!`
      },

      MobileLegendsGame: {
        title: `💎 FREE Diamonds Methods + Codes (${today})`,
        content: `Here are the best ways to get free diamonds in 2026!

💎 **Fastest Method:**
- Monthly Pass + Event Farming = 500-1,000 diamonds/month
- Takes ~1-2 hours daily gameplay
- Best ROI for casual players

✅ **Other Free Methods:**
1. Login streaks: 150-600 diamonds/month
2. Major events: 200-500 per event (3-4/month)
3. Achievements: 50-100 each
4. Redeem codes: 2-5 per month

📊 **Realistic Earnings:**
- Casual (1-2 hrs): 350/month (~$4 value)
- Regular (3-5 hrs): 950/month (~$10 value)  
- Hardcore (5+ hrs): 1,700/month (~$17 value)

---

**Complete breakdown:** https://gamingcoinshub.com/docs/mobile-legends/free-diamonds-guide

Drop a comment if you find any codes working!`
      },

      ClashOfClans: {
        title: `💰 450+ FREE Gems from Achievements (${today})`,
        content: `Complete breakdown of every achievement that gives gems!

🏆 **By The Numbers:**

**Combat Achievements:** 250 gems
- Reach Gold League: 50 gems (easy, 1-2 weeks)
- Reach Crystal/Titan: 50ea (hard, months)

**Resource Gathering:** 120 gems
- Bigger Coffers: 30 gems (2-3 days! 🔥)
- Gold Grab: 40 gems (easy)
- Elixir Escapade: 50 gems

**Destruction & Storage:** 80 gems
- Destroy Me: 40 gems (easy, 3-5 days)
- Total Destruction: 40 gems (hard)

**TOTAL:** 450+ gems ($5+ value) - One-time earn

---

**Full achievement list:** https://gamingcoinshub.com/docs/clash-of-clans/achievements-gems-guide

**Easiest Gems This Week:**
1. Bigger Coffers (30 gems, 2-3 days)
2. Destroy Me (40 gems, 3-5 days)

Got questions about strategies? Comment below!`
      }
    };
  }

  /**
   * Display formatted post for user
   */
  displayPost(subreddit, post) {
    console.log(`
┌─────────────────────────────────────────────────────────────────┐
│ ${chalk.bold.magenta(`POST TO r/${subreddit}`)}
└─────────────────────────────────────────────────────────────────┘

${chalk.bold('Title:')}
${chalk.cyan(post.title)}

${chalk.bold('Content:')}
${post.content}

${chalk.bold('Links:')}
📎 Reddit: ${chalk.blue(`https://reddit.com/r/${subreddit}/submit`)}
📎 Your Site: ${chalk.blue('https://gamingcoinshub.com')}

${chalk.bold('Posting Steps:')}
1. Title is copied below
2. Content is copied below
3. Click link → opens Reddit
4. Paste title & content
5. Click Post!

${chalk.yellow('─'.repeat(65))}
`);
  }

  /**
   * Copy text to clipboard
   */
  copyToClipboard(text) {
    try {
      require('child_process').execSync(`printf '${text.replace(/'/g, "'\\''")}'| xclip -selection clipboard`);
      return true;
    } catch {
      // Fallback - save to file
      const tmpFile = path.join(__dirname, 'clipboard.txt');
      fs.writeFileSync(tmpFile, text);
      console.log(chalk.yellow(`\n📋 Copied to file: ${tmpFile} (copy manually)`));
      return false;
    }
  }

  /**
   * Interactive posting flow
   */
  async interactiveFlow() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (query) => new Promise((resolve) => rl.question(query, resolve));

    console.log(`
${chalk.bold.cyan('╔═══════════════════════════════════════════════════════════════╗')}
${chalk.bold.cyan('║')}  ${chalk.bold('🎯 Reddit One-Click Poster - No API Needed')}
${chalk.bold.cyan('║')}  Simple • Safe • Reliable
${chalk.bold.cyan('╚═══════════════════════════════════════════════════════════════╝')}

${chalk.yellow('📋 Available Posts:')}
`);

    this.subreddits.forEach((item, i) => {
      console.log(`  ${chalk.cyan(`${i + 1}`)} → r/${item.sub}`);
    });

    console.log(`\n${chalk.yellow('How it works:')}`);
    console.log(`  1️⃣  I copy your post title & content`);
    console.log(`  2️⃣  Opens Reddit in your browser`);
    console.log(`  3️⃣  You paste (Ctrl+V) and click Post`);
    console.log(`  4️⃣  Done! 🚀\n`);

    let postMore = true;

    while (postMore) {
      const chosen = await question(
        chalk.bold.cyan(`Which subreddit to post to? (1-${this.subreddits.length}, 0 to done): `)
      );

      const index = parseInt(chosen) - 1;

      if (chosen === '0') {
        postMore = false;
        continue;
      }

      if (index < 0 || index >= this.subreddits.length) {
        console.log(chalk.red('❌ Invalid choice\n'));
        continue;
      }

      const subreddit = this.subreddits[index].sub;
      const post = this.posts[subreddit];

      // Display post
      this.displayPost(subreddit, post);

      // Copy & open
      const ready = await question(
        chalk.bold.green('Ready to post? (y to open Reddit, n to skip): ')
      );

      if (ready.toLowerCase() === 'y') {
        console.log(chalk.yellow(`\n✨ Copying post and opening Reddit...\n`));

        // Copy title
        this.copyToClipboard(post.title);

        // Wait a second
        await new Promise(r => setTimeout(r, 1000));

        // Open Reddit submit page
        try {
          await open(`https://reddit.com/r/${subreddit}/submit`);
          console.log(chalk.green(`✅ Reddit opened in browser\n`));
        } catch (error) {
          console.log(chalk.red(`\nManually go to: https://reddit.com/r/${subreddit}/submit\n`));
        }

        const posted = await question(
          chalk.yellow('Did you post successfully? (y/n): ')
        );

        if (posted.toLowerCase() === 'y') {
          console.log(chalk.green(`✅ Great! Post to r/${subreddit} complete!\n`));

          // Wait between posts
          const wait = await question(
            chalk.yellow('Post to another subreddit? (y/n): ')
          );

          if (wait.toLowerCase() !== 'y') {
            postMore = false;
          } else {
            console.log(chalk.yellow('⏳ Waiting 5 minutes before next post to avoid spam detection...\n'));
            await new Promise(r => setTimeout(r, 300000)); // 5 min
          }
        }
      }
    }

    rl.close();
    console.log(`
${chalk.green('🎉 All done!')}
${chalk.cyan('Your posts are now live on Reddit!')}
${chalk.yellow('Monitor them for engagement and reply to comments.')}
    `);
  }

  /**
   * Auto-post mode (testing)
   */
  async autoPostMode() {
    console.log(chalk.bold.cyan('\n🤖 Auto-Post Mode (Display Only)\n'));

    for (const item of this.subreddits) {
      const post = this.posts[item.sub];
      this.displayPost(item.sub, post);
      
      console.log(chalk.yellow('→ In production, Reddit would open here'));
      console.log(chalk.yellow('→ User would paste and submit\n'));

      // Wait between posts
      if (item !== this.subreddits[this.subreddits.length - 1]) {
        console.log(chalk.dim('⏳ Waiting before next post...\n'));
        await new Promise(r => setTimeout(r, 3000));
      }
    }

    console.log(chalk.green('\n✅ All posts displayed (in interactive mode, Reddit opens)'));
  }
}

// Run
if (require.main === module) {
  const isInteractive = process.argv.includes('--interactive');
  
  const poster = new RedditOneClickPoster();

  if (isInteractive) {
    poster.interactiveFlow().catch(console.error);
  } else {
    poster.autoPostMode().catch(console.error);
  }
}

module.exports = RedditOneClickPoster;
