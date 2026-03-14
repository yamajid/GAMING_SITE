# 🚀 AI Traffic Blitz Setup - Reddit + Social Posting

Add these environment variables to your `.env.automation` file to enable social posting automation:

## Reddit API Setup (Required for auto-posting)

### Step 1: Create Reddit App
1. Go to: https://www.reddit.com/prefs/apps
2. Click **"Create another app..."**
3. Fill form:
   - **Name:** "GamingCoinsHub-Automation"
   - **App Type:** Select "Script"
   - **Description:** "Daily code posting to gaming subreddits"
   - **Redirect URI:** `http://localhost:8080` (can be anything for script)
4. Click **Create app**
5. You'll see:
   - **Client ID** (under your app name)
   - **Client Secret** (click "secret" button)
   - **User Agent:** Use format `linux:GamingCoinsHub-Automation:1.0`

### Step 2: Get Reddit Refresh Token
```bash
# Run this one-time setup script
cd automation
npm install snoowrap oauth2-simple
node setup-reddit-auth.js
```

Will open browser → grant permissions → copy token to `.env.automation`

### Step 3: Add to `.env.automation`
```env
# Reddit Auto-Posting
REDDIT_CLIENT_ID=your_client_id_here
REDDIT_CLIENT_SECRET=your_client_secret_here
REDDIT_REFRESH_TOKEN=your_refresh_token_here
REDDIT_USERNAME=your_reddit_username
REDDIT_USER_AGENT=linux:GamingCoinsHub-Automation:1.0

# Twitter API (for X posting)
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_SECRET=your_access_secret

# Email Service (for subscriber notifications)
SENDGRID_API_KEY=sg-your_key_here
# OR
MAILGUN_API_KEY=key-your_key_here
```

---

## Quick Test

### Test Reddit Posting (Manual)
```bash
cd automation
node reddit-poster.js --test --subreddit=r/roblox
```

Expected output:
```
✅ Connected to Reddit API
✅ Ready to post to r/roblox
(dry-run mode - no actual post)
```

### Test Fresh Content Generation
```bash
node daily-content-fresh.js --test
```

Expected output:
```
[Today] 🤖 Fresh Content Generator Starting...
✅ Claude API connected
✅ Generated content for Roblox
✅ Generated content for Fortnite
...
✅ Fresh content generated! Ready to post manually.
```

---

## Enable Daily Automation

### Option A: Using Node-Cron (Built-in)
```bash
npm run cron-enable

# This will:
# - Start daily scheduler at 2 AM UTC
# - Auto-generate fresh content
# - Post to Reddit at 3 AM UTC
# - Send emails at 6 AM UTC
# - Run continuously
```

### Option B: Using GitHub Actions (Cloud-Based)
```bash
npm run setup-github-actions

# This will:
# - Create `.github/workflows/daily-automation.yml`
# - Run on GitHub servers (no local machine needed!)
# - Completely free tier
```

### Option C: Using crontab (Linux/Mac)
```bash
# Add to your system crontab
crontab -e

# Add these lines:
0 2 * * * cd /home/yamajid/Desktop/gaming_site/gaming-coins-hub && node automation/scheduler.js >> /tmp/gaming-automation.log 2>&1
0 3 * * 1,3,5 cd /home/yamajid/Desktop/gaming_site/gaming-coins-hub && node automation/reddit-poster.js >> /tmp/reddit-posts.log 2>&1
```

---

## Manual Reddit Posting (If Not Using Cron)

### Post to Reddit Manually
```bash
# Generate content
node automation/daily-content-fresh.js

# Review in: automation/output/social-schedule-[today].json

# Post manually (or use this):
node automation/reddit-poster.js --game=Roblox --subreddit=r/roblox
```

---

## Monitoring & Debugging

### Check Automation Logs
```bash
# Today's logs
tail -f /tmp/gaming-automation.log

# Reddit posting logs
tail -f /tmp/reddit-posts.log

# Error logs
cat /tmp/gaming-automation-errors.log
```

### Monitor Reddit Post Performance
```bash
# Check your posts
node automation/reddit-monitor.js

# Shows:
# - Upvotes/hour
# - Comments
# - Engagement rate
```

### Test without Posting
```bash
# Dry-run mode (doesn't actually post)
node automation/daily-content-fresh.js --dry-run
node automation/reddit-poster.js --dry-run
```

---

## Reddit Rate Limits & Rules ⚠️

### What We Follow:
- ✅ 1 post per game per day (4 max total)
- ✅ Post 3+ hours apart to avoid spam detection
- ✅ True, helpful content (not spam)
- ✅ No vote manipulation
- ✅ Respect subreddit rules

### What Gets Us Banned:
- ❌ Posting same content multiple times
- ❌ Deleting and reposting
- ❌ Using multiple accounts
- ❌ Vote brigading
- ❌ Linking to affiliate/monetized content

**Our approach:** Genuine helpful content → Natural upvotes → No ban

---

## Troubleshooting

### "Reddit API Authentication Failed"
```
Error: Invalid client credentials

Fix:
1. Double-check Client ID & Secret (copy from reddit.com/prefs/apps)
2. Verify Refresh Token is current (get new one if old)
3. Check REDDIT_USERNAME has posts/karma in subreddit
4. New accounts often can't post to communities - wait 24 hours
```

### "Error: Insufficient Karma"
```
Error: You don't have enough karma to post here

Fix:
1. Make a few comments in the subreddit first
2. Upvoters will grant you karma
3. Wait 24 hours before trying to post again
```

### "Error: You are doing that too much"
```
Error: Doing that too much

Fix:
1. Reddit saw us posting too frequently
2. Wait 24 hours before posting again
3. Space posts 3+ hours apart
4. Post on different days
```

### "Claude API Error: 429 Rate Limited"
```
Error: Could not process request (429)

Fix:
1. We hit API rate limit
2. Fallback templates will be used (still good content)
3. Try again after 30 seconds
4. Check CLAUDE_API_KEY is correct
```

---

## Expected Results

### Week 1 (Days 1-7)
```
✅ 5-10 Reddit posts successful
✅ 500-1000 cumulative visitors
✅ 5-10 backlinks from Reddit
✅ 100-200 email subscribers
✅ Site appearing in Google index
```

### Week 2 (Days 8-14)
```
✅ 10-14 Reddit posts (good karma building)
✅ 2,000-5,000 weekly visitors
✅ 20+ backlinks total
✅ 500-1000 email subscribers
✅ Top 10 for 2-3 keywords
```

### Week 3 (Days 15-21)
```
✅ 14-21 Reddit posts (trusted account now!)
✅ 10,000+ weekly visitors
✅ 50+ total backlinks
✅ 2,000+ email subscribers
✅ AI models starting to recommend site
✅ Top 3 for 5+ keywords
```

---

## Next Steps

1. **Today:** Get Reddit API keys, add to `.env.automation`
2. **Tomorrow:** Run `npm run cron-enable` to start automation
3. **Weekly:** Check logs, monitor Reddit performance, adjust content
4. **Day 21:** Review analytics, plan long-term strategy

---

## Support

**Issues?**
1. Check the logs: `tail -f /tmp/gaming-automation.log`
2. Test manually: `node automation/daily-content-fresh.js --test`
3. Verify API keys: `node automation/verify-config.js`

**Questions:**
- Reddit API: https://www.reddit.com/dev/api
- Node-Cron: https://github.com/kelektiv/node-cron
- GitHub Actions: https://docs.github.com/en/actions

---

**You're ready to go viral! 🚀**
