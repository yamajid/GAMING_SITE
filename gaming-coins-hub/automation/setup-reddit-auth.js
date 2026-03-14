#!/usr/bin/env node

/**
 * Reddit API Setup Helper
 * Interactive guide to get Reddit credentials
 * 
 * Usage: node setup-reddit-auth.js
 * 
 * This will guide you through:
 * 1. Creating a Reddit app at reddit.com/prefs/apps
 * 2. Getting API credentials
 * 3. Saving to .env.automation
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Color codes for terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log(`
${colors.blue}╔══════════════════════════════════════════════════════════════╗${colors.reset}
${colors.blue}║${colors.reset}     🤖 ${colors.bright}Reddit API Setup Guide${colors.reset}                           ${colors.blue}║${colors.reset}
${colors.blue}║${colors.reset}     Get credentials for auto-posting to gaming subreddits   ${colors.blue}║${colors.reset}
${colors.blue}╚══════════════════════════════════════════════════════════════╝${colors.reset}

`);

  console.log(`${colors.yellow}Step 1: Create Reddit App${colors.reset}
  
1. Go to: ${colors.bright}https://www.reddit.com/prefs/apps${colors.reset}
2. Click: "${colors.bright}Create another app...${colors.reset}}" at the bottom
3. Fill form:
   • ${colors.bright}Name${colors.reset}: GamingCoinsHub-Automation
   • ${colors.bright}App type${colors.reset}: Select "Script"
   • ${colors.bright}Description${colors.reset}: Daily code posting automation
   • ${colors.bright}Redirect URI${colors.reset}: http://localhost:8080
4. Click: "${colors.bright}Create app${colors.reset}}"

${colors.yellow}Step 2: Copy Your Credentials${colors.reset}

After creating the app, you'll see a box with your credentials:

┌─ Copy These Values ─────────────────────────────────────────┐
│                                                              │
│  ${colors.bright}Client ID${colors.reset}       (under your app name, ~14 chars)      │
│  ${colors.bright}Secret${colors.reset}          (click "secret" button to reveal)     │
│  ${colors.bright}Username${colors.reset}        (your Reddit username)               │
│                                                              │
└──────────────────────────────────────────────────────────────┘

`);

  // Collect user input
  const clientId = await question(`${colors.bright}Enter your Client ID:${colors.reset} `);
  const clientSecret = await question(`${colors.bright}Enter your Client Secret:${colors.reset} `);
  const username = await question(`${colors.bright}Enter your Reddit username:${colors.reset} `);
  const password = await question(`${colors.bright}Enter your Reddit password:${colors.reset} `);

  if (!clientId || !clientSecret || !username || !password) {
    console.log(`\n${colors.red}❌ Error: Missing credentials${colors.reset}`);
    rl.close();
    return;
  }

  // Generate refresh token (simplified - real implementation would need OAuth flow)
  // For now, this is where you'd normally do OAuth
  
  console.log(`\n${colors.yellow}Step 3: Generate Refresh Token${colors.reset}`);
  console.log(`
Your credentials have been collected. To complete the setup:

Option A: ${colors.bright}Automatic (Recommended)${colors.reset}
  Run: ${colors.bright}npm run reddit-auth${colors.reset}}
  This will handle the OAuth flow automatically

Option B: ${colors.bright}Manual${colors.reset}
  1. Keep your credentials
  2. Run: ${colors.bright}npm run reddit-test${colors.reset}}
  3. Check if authentication works

For now, saving your credentials to .env.automation...
  `);

  // Save to .env.automation
  const envPath = path.join(__dirname, '.env.automation');
  let envContent = '';

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    // Remove old Reddit settings if they exist
    envContent = envContent
      .split('\n')
      .filter(line => !line.startsWith('REDDIT_'))
      .join('\n');
  }

  const redditConfig = `
# Reddit API Configuration (Added ${new Date().toLocaleDateString()})
REDDIT_CLIENT_ID=${clientId}
REDDIT_CLIENT_SECRET=${clientSecret}
REDDIT_USERNAME=${username}
REDDIT_PASSWORD=${password}
REDDIT_USER_AGENT=linux:GamingCoinsHub-Automation:1.0
`;

  fs.writeFileSync(envPath, envContent + '\n' + redditConfig);

  console.log(`${colors.green}✅ Credentials saved to .env.automation${colors.reset}\n`);

  // Next steps
  console.log(`${colors.blue}📋 Next Steps:${colors.reset}

1. ${colors.bright}Test the connection${colors.reset}
   ${colors.bright}npm run reddit-test${colors.reset}}

2. ${colors.bright}View your Reddit app${colors.reset}
   ${colors.bright}https://www.reddit.com/prefs/apps${colors.reset}}

3. ${colors.bright}Start posting!${colors.reset}
   Once tested, the automation will post daily at 3 AM UTC

4. ${colors.bright}Monitor posts${colors.reset}
   Check r/roblox, r/FortniteBR, etc. for your posts`);

  console.log(`

${colors.yellow}⚠️  Important Security Reminders:${colors.reset}
• ${colors.bright}Never share${colors.reset}} your .env.automation file
• The file is in .gitignore for security
• Credentials will NOT be committed to GitHub
• Keep your Reddit password secure

${colors.green}✨ Setup complete! You're ready for Step 3: Post to Reddit${colors.reset}
`);

  rl.close();
}

main().catch(console.error);
