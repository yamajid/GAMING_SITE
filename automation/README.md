# Gaming Coins Hub - Daily Automation System

🤖 **Automated daily content refresh** - Fresh promo codes, earning methods, and FAQs every day!

## Overview

This automation system runs daily to:
- ✅ **Scrape** fresh promo codes from Reddit & official sources
- ✅ **Collect** latest news and earning methods  
- ✅ **Generate** AI-powered guides and FAQ updates
- ✅ **Publish** automatically to GitHub + Vercel

Content refreshes at **2:00 AM UTC** every day (customizable).

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
```bash
cd automation
cp .env.example .env.automation
```

Edit `.env.automation` with your API keys:
```
REDDIT_CLIENT_ID=your_id
REDDIT_CLIENT_SECRET=your_secret
GITHUB_TOKEN=ghp_xxxxx
GITHUB_OWNER=your-username
GITHUB_REPO=gaming-coins-hub
```

### 3. Test the Pipeline  
```bash
node scheduler.js --once
```

### 4. Enable Daily Scheduling
```bash
node scheduler.js
```

The scheduler will now run automatically every day at 2:00 AM UTC.

---

## File Structure

```
automation/
├── scheduler.js              # Main orchestrator (runs daily)
├── generator.js              # Content generation engine
├── publisher.js              # GitHub + Vercel publishing
├── logger.js                 # Colored console logging
├── config.js                 # Configuration management
├── .env.example              # Environment variable template
└── scrapers/
    ├── roblox-scraper.js     # Roblox codes & methods
    ├── fortnite-scraper.js   # V-Bucks codes & news
    ├── mobile-legends-scraper.js # Diamond events
    └── clash-of-clans-scraper.js # Gem methods
```

---

## Configuration

### Schedule (Cron Format)
Edit `AUTOMATION_SCHEDULE` in `.env.automation`:

```
# Default (2:00 AM UTC daily)
AUTOMATION_SCHEDULE=0 2 * * *

# Every 6 hours
AUTOMATION_SCHEDULE=0 */6 * * *

# Every Monday at 8:00 AM
AUTOMATION_SCHEDULE=0 8 * * 1

# Every 30 minutes
AUTOMATION_SCHEDULE=*/30 * * * *
```

### Required API Keys

#### Reddit API
1. Go to https://www.reddit.com/prefs/apps/
2. Create "script" type app
3. Copy Client ID and Client Secret to `.env.automation`

#### GitHub
1. Go to https://github.com/settings/tokens/new
2. Select `repo` scope (full control)
3. Copy token to `GITHUB_TOKEN`

#### Claude API (Optional)
1. Get key from https://console.anthropic.com/
2. Set `CLAUDE_API_KEY` for better content generation
3. Without it, uses template generation

#### Vercel (Optional)
1. Get token from https://vercel.com/account/tokens
2. Set `VERCEL_TOKEN` and `VERCEL_PROJECT_ID`
3. Enables automatic deployment after publishing

---

## Usage

### Run Once (Testing)
```bash
node scheduler.js --once
```

### Run Continuously (Production)
```bash
node scheduler.js &
# Or with nohup (survives terminal close)
nohup node scheduler.js > automation.log 2>&1 &
```

### View Logs
```bash
tail -f automation.log
```

### Stop Scheduler
```bash
pkill -f "node scheduler.js"
```

---

## Pipeline Flow

```
1. SCRAPE (30 seconds)
   ├─ Roblox codes (Reddit + Blog)
   ├─ Fortnite news (Epic Games + Reddit)
   ├─ Mobile Legends events (Moonton + Reddit)
   └─ Clash of Clans methods (Supercell + Reddit)
   └─ Result: { codes[], news[], methods[], questions[] }

2. GENERATE (60 seconds)
   ├─ AI content synthesis (Claude API)
   ├─ Guide templating
   ├─ FAQ updates
   └─ Result: { MDX files, metadata }

3. PUBLISH (30 seconds)
   ├─ GitHub API commits
   ├─ Create PR + auto-merge
   ├─ Push to main branch
   └─ Result: Published to repository

4. DEPLOY (Automatic)
   └─ Vercel webhook triggers
   └─ Site live with fresh content
```

Total time: ~2-3 minutes per cycle

---

## Troubleshooting

### "Missing env variables"
```bash
# Check what's configured
grep -v "^#" .env.automation | grep -v "^$"

# Add missing keys
nano .env.automation
```

### "Reddit API rate limited"
- Wait 1 hour before next run
- Spread runs further apart in schedule
- Rotate Reddit API keys

### "GitHub commits failing"
```bash
# Test GitHub token
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/user
```

### "Content not publishing"
```bash
# Enable debug mode
DEBUG=true node scheduler.js --once

# Check git remote
cat .git/config | grep url
```

### "Vercel deployment not triggering"
- Verify `VERCEL_PROJECT_ID` is correct
- Check Vercel API token has correct scopes
- Vercel must be connected to GitHub repository

---

## Notifications

### Slack Webhook
```bash
SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Discord Webhook
```bash
DISCORD_WEBHOOK=https://discord.com/api/webhooks/YOUR/WEBHOOK/URL
```

### Email Notification
```bash
EMAIL_WEBHOOK=https://your-service.com/notify
```

---

## Monitoring

### Check Logs
```bash
# Real-time logs
tail -f automation.log

# Last 100 lines
tail -100 automation.log

# Search for errors
grep ERROR automation.log
```

### Statistics
The scheduler outputs:
- ✅ Files generated
- ✅ Files published
- ⏱️ Execution duration
- 📊 Success/failure counts

### GitHub Actions (Optional Cloud Scheduling)
Create `.github/workflows/automation.yml` for cloud-based scheduling:

```yaml
name: Daily Automation
on:
  schedule:
    - cron: '0 2 * * *'  # 2:00 AM UTC
jobs:
  automate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: node automation/scheduler.js --once
        env:
          REDDIT_CLIENT_ID: ${{ secrets.REDDIT_CLIENT_ID }}
          # ... add other secrets
```

---

## Performance

Typical execution times:
- **Scraping:** 30-45 seconds (8 games in parallel)
- **Generation:** 30-60 seconds (depends on API)
- **Publishing:** 20-30 seconds (GitHub + Vercel)
- **Total:** 90-120 seconds per run

---

## Data Output

### Generated Files
```
docs/daily/
├── YYYY-MM-DD-roblox-codes.md      # New Roblox codes
├── YYYY-MM-DD-fortnite-methods.md  # V-Bucks earning
├── YYYY-MM-DD-mobile-legends-faq.md # Diamond FAQs
└── YYYY-MM-DD-clash-of-clans-update.md # Gem strategies
```

### Scraped Data Structure
```javascript
{
  codes: [
    { code: 'PROMO123', verified: true, date: Date, source: 'Reddit' },
    // ... more codes
  ],
  news: [
    { title: 'String', summary: 'String', source: 'Official', relevance: 0.95 },
    // ... more news
  ],
  newMethods: [
    { method: 'String', description: 'String', earning: '100-200 gems/day' },
    // ... more methods
  ],
  questionsAsked: [
    { question: 'String', upvotes: 150, date: Date },
    // ... more questions
  ],
  lastUpdated: Date
}
```

---

## Development

### Add New Scraper
1. Create `scrapers/game-scraper.js` following pattern
2. Implement `async scrape()` method
3. Add to `scheduler.js` scrapers object
4. Update config for any new API keys

### Modify Schedule
Edit line in `config.js`:
```javascript
AUTOMATION_SCHEDULE: process.env.AUTOMATION_SCHEDULE || '0 2 * * *',
```

### Test Single Scraper
```javascript
const RobloxScraper = require('./scrapers/roblox-scraper');
const scraper = new RobloxScraper();
scraper.scrape().then(data => console.log(JSON.stringify(data, null, 2)));
```

---

## Cost Estimation

| Service | Usage | Cost |
|---------|-------|------|
| Reddit API | 4 calls/day | Free |
| GitHub API | 1 PR/day | Free |
| Vercel | Auto-deploy | Free tier |
| Claude API | Optional (50k tokens) | $0.15/day |
| **Total** | | **~$4.50/month** |

---

## Support

- 📚 [Docusaurus Docs](https://docusaurus.io/)
- 🤖 [Claude API Docs](https://api.anthropic.com/)
- 🔗 [GitHub API Docs](https://docs.github.com/rest)
- 🚀 [Vercel Docs](https://vercel.com/docs)

---

## License

Same as main Gaming Coins Hub project
