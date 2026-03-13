# 🚀 Gaming Coins Hub - Automation Setup Guide

Complete step-by-step guide to set up daily automated content publishing.

**Time needed:** 15-20 minutes  
**Difficulty:** Intermediate

---

## Overview

After setup, your site will automatically:
- ✨ Publish fresh promo codes every day
- 📚 Update earning guides and methods
- 💬 Add new community FAQs
- 🔗 Deploy to your live site instantly

All with **zero manual work** after setup!

---

## Prerequisites

- [ ] Node.js 20+ installed (`node --version`)
- [ ] GitHub account with repository access
- [ ] Available time: 15 minutes

---

## Step 1: Get Reddit API Credentials

Reddit API is free and provides all promo codes and community questions.

### 1.1 Create Reddit App
1. Go to https://www.reddit.com/prefs/apps/
2. Scroll down → Click "Create app" or "Create another app"
3. Fill in:
   - **Name:** `GamingCoinsAutomation` (any name)
   - **Type:** Select `script` (NOT web app)
   - **Redirect URI:** `http://localhost:8080` (required but unused)
4. Click "Create app"

### 1.2 Copy Your Credentials
You'll see a box with your app details:
```
ID (under app name)         → REDDIT_CLIENT_ID
secret                       → REDDIT_CLIENT_SECRET
```

Copy these somewhere safe.

---

## Step 2: Generate GitHub Token

GitHub token allows automation to create commits and deploy.

### 2.1 Create Personal Access Token
1. Go to https://github.com/settings/tokens/new
2. Set details:
   - **Name:** `Gaming Coins Automation`
   - **Expiration:** 90 days (or longer)
3. Select scopes:
   - ✅ `repo` (all repo access)
   - ✅ `workflow` (GitHub Actions)
4. Scroll down → Click "Generate token"
5. **Copy the token immediately** (won't show again!)

---

## Step 3: Clone Configuration

### 3.1 Create .env File
In the `automation/` directory:

```bash
cd automation
cp .env.example .env.automation
```

### 3.2 Edit Your Secrets
```bash
nano .env.automation
```

Fill in the values from Steps 1-2:

```env
# Reddit (from Step 1)
REDDIT_CLIENT_ID=YOUR_ID_HERE
REDDIT_CLIENT_SECRET=YOUR_SECRET_HERE

# GitHub (from Step 2)
GITHUB_TOKEN=ghp_YOUR_TOKEN_HERE
GITHUB_OWNER=YOUR_USERNAME
GITHUB_REPO=gaming-coins-hub

# Keep defaults for now
CLAUDE_API_KEY=
VERCEL_TOKEN=
VERCEL_PROJECT_ID=
```

Save with `Ctrl+O` → `Enter` → `Ctrl+X`

---

## Step 4: Install Dependencies

### 4.1 Install Packages
```bash
npm install
```

This installs:
- axios (web scraping)
- cheerio (HTML parsing)
- node-cron (scheduling)
- And other dependencies

**Expected output:**
```
added 150 packages in 12s
```

---

## Step 5: Test the Automation (Local)

### 5.1 Run Once
Test that everything works before enabling daily runs:

```bash
node automation/scheduler.js --once
```

### 5.2 Expected Output
You should see colored output like:
```
[2024-01-15T02:00:00Z] [GAMING-COINS] 🤖 Starting daily automation pipeline...
[2024-01-15T02:00:05Z] [GAMING-COINS] 🔍 Scraping Roblox...
[2024-01-15T02:00:10Z] [GAMING-COINS] 🔍 Scraping Fortnite...
...
[2024-01-15T02:02:30Z] [GAMING-COINS] ✅ Daily automation completed successfully!
```

### 5.3 Troubleshoot If It Fails

**Error: "Missing required env var"**
- Check `.env.automation` has all required fields
- Verify Reddit/GitHub credentials are copied correctly

**Error: "Reddit API rate limited"**
- This is normal during testing
- Wait 1 hour before retrying
- Production runs use minimal API requests

**Error: "GitHub authentication failed"**
- Verify GitHub token is correct
- Check token hasn't expired
- Verify `GITHUB_OWNER` matches your username

See [automation/README.md](./automation/README.md#troubleshooting) for more help.

---

## Step 6: Enable Daily Scheduling (Choose One)

### Option A: Local Scheduling (Simple)

Keep the scheduler running on your computer:

```bash
node automation/scheduler.js &
```

**Pros:** Simple, free, instant updates  
**Cons:** Requires computer to stay on at 2 AM UTC

### Option B: GitHub Actions (Recommended)

Run automation in the cloud automatically.

#### 6.1 Add Secrets to GitHub

1. Go to https://github.com/YOUR_USERNAME/gaming-coins-hub/settings/secrets/actions

2. Click "New repository secret"

3. Add each secret:
   - Name: `REDDIT_CLIENT_ID` → Value: (from Step 1)
   - Name: `REDDIT_CLIENT_SECRET` → Value: (from Step 1)
   - Name: `CLAUDE_API_KEY` → Value: leave empty for now (optional)
   - Name: `VERCEL_TOKEN` → Value: leave empty for now (optional)

4. Click "Add secret" for each

#### 6.2 Workflow Already Configured

The file `.github/workflows/daily-automation.yml` already exists and will:
- Run automatically at 2:00 AM UTC every day
- Or manually via GitHub UI
- Send Slack notifications on failure (if configured)

#### 6.3 Test the Workflow

1. Go to GitHub → Actions tab
2. Find "Daily Gaming Coins Automation"
3. Click "Run workflow" → "Run workflow"
4. Watch it execute in real-time
5. Check results in the workflow logs

**Expected:** Workflow completes in 2-3 minutes with green ✅

---

## Step 7: (Optional) Add Content Generation with Claude

For AI-powered guide generation:

### 7.1 Get Claude API Key
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Create API key
4. Copy key

### 7.2 Add to GitHub Secrets
1. Go to Settings → Secrets → Actions
2. Add secret: `CLAUDE_API_KEY` = your key
3. The generator will now use Claude for better content

**Cost:** ~$0.15/day for daily content generation  
**Benefit:** 10x better content quality

---

## Step 8: (Optional) Auto-Deploy to Vercel

To make generated content go live instantly:

### 8.1 Get Vercel Credentials
1. Go to https://vercel.com/account/tokens
2. Create new token with "Full Access"
3. Copy token
4. Go to Vercel dashboard → Select project → Settings → General
5. Copy "Project ID"

### 8.2 Add to GitHub Secrets
Add these secrets:
- `VERCEL_TOKEN` = token from 8.1
- `VERCEL_PROJECT_ID` = project ID from 8.1

Now deployments happen automatically after each content sync!

---

## Verification Checklist

- [ ] Reddit credentials working (test with `--once`)
- [ ] GitHub commits appear in repository
- [ ] New markdown files created in docs/
- [ ] (Optional) Vercel deployment triggered
- [ ] (Optional) GitHub Actions workflow running
- [ ] (Optional) Slack/Discord notifications working

---

## Monitoring & Maintenance

### Daily Health Check
```bash
# View recent logs
tail -50 automation.log

# Check GitHub for today's commits
git log --oneline -5
```

### Update Automation
To update scrapers or add new games:

```bash
# Pull latest changes
git pull

# Test new changes
node automation/scheduler.js --once

# If working, let GitHub Actions handle the rest
```

### Disable Temporarily
```bash
# GitHub Actions: Disable workflow
# → Go to Actions → Select workflow → Click menu → Disable

# Local scheduler
pkill -f "node automation/scheduler.js"
```

---

## Troubleshooting

### "Automation not running"
```bash
# Check if running locally
ps aux | grep "node automation"

# Check GitHub Actions status
# → Go to Actions tab on GitHub
```

### "Old codes appearing in guides"
- Add deduplication logic to scraper
- Increase `slice(0, N)` limit for more codes
- Check Reddit API for actual new codes

### "Two automation runs conflicting"
- Don't run both local + GitHub Actions
- Choose one method in Step 6
- Disable the other

### "Want to change schedule time"
Change in `.github/workflows/daily-automation.yml`:
```yaml
cron: '0 2 * * *'  # Change these numbers
```

Cron format: `minute hour day month weekday`
- `0 2` = 2:00 AM UTC
- `0 8` = 8:00 AM UTC
- `0 0 * * 1` = Every Monday

---

## Summary

You now have a fully automated content pipeline that:
1. ✅ Runs daily at your chosen time
2. ✅ Scrapes fresh data from 4 games
3. ✅ Generates AI-powered content (optional)
4. ✅ Publishes to your GitHub repo
5. ✅ Deploys to Vercel automatically

Your site will have **fresh content every single day** with zero manual effort!

---

## Next Steps

1. **Monitor first week** - check that content quality is good
2. **Adjust settings** - tweak schedule, add notifications, enable Claude
3. **Scale up** - add more games or content types
4. **Monetize** - track traffic boost from fresh content

---

## Support & Questions

- 📖 Read [automation/README.md](./automation/README.md) for detailed docs
- 🐛 Check GitHub Issues for common problems
- 💬 Discuss in GitHub Discussions
- 🔗 Forum: https://docusaurus.io/community

---

## Advanced: Custom Scraper

Want to scrape a different source? Follow this pattern:

```javascript
// scrapers/custom-scraper.js
const axios = require('axios');
const logger = require('../logger');

class CustomScraper {
  async scrape() {
    logger.info('🔍 Scraping custom source...');
    return {
      codes: [],
      news: [],
      newMethods: [],
      questionsAsked: [],
      lastUpdated: new Date(),
    };
  }
}

module.exports = CustomScraper;
```

Then add to scheduler.js:
```javascript
const CustomScraper = require('./scrapers/custom-scraper');
// In constructor:
custom: new CustomScraper(),
```

---

## Feedback

After setup, please share:
- ✅ What worked great
- ❌ What was confusing
- 💡 How to improve this guide

This helps make automation better for everyone!

---

**Congratulations!** Your gaming coins hub now has automated content. 🎉
