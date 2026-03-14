# 🚀 Deployment Guide

Your automation system is **READY TO DEPLOY**!

## ⚙️ Quick Setup (5 minutes)

### Step 1: Get Claude API Key

1. Go to: https://console.anthropic.com
2. Sign in or create account
3. Click "API Keys" → "Create Key"
4. Copy the key (starts with `sk-ant-`)

### Step 2: Create .env.automation

```bash
cd /home/yamajid/Desktop/gaming_site/gaming-coins-hub
cat > .env.automation << 'EOF'
# Claude API Configuration
CLAUDE_API_KEY=sk-ant-YOUR-KEY-HERE

# Reddit Configuration (optional, for posting)
REDDIT_USERNAME=your_username
REDDIT_PASSWORD=your_password

# Logging
LOG_LEVEL=info
EOF
```

Replace `sk-ant-YOUR-KEY-HERE` with your actual API key.

### Step 3: Test It Works

```bash
# Test Q&A answerer (will use your Claude key)
node automation/qa-answerer.js --trending

# Test scheduler (will run both morning & afternoon immediately)
node automation/scheduler-2x-daily.js --test-now
```

---

## 📅 Deployment Options

### **Option A: Automatic Scheduler (RECOMMENDED)**

Runs at exact times: **2 AM & 2 PM UTC daily**

```bash
# Start scheduler (runs forever)
node automation/scheduler-2x-daily.js
```

Or add to system cron:
```bash
crontab -e
```

Add these lines:
```
# Morning: 2 AM UTC
0 2 * * * cd /home/yamajid/Desktop/gaming_site/gaming-coins-hub && node automation/scheduler-2x-daily.js --morning-now >> logs/cron.log 2>&1

# Afternoon: 2 PM UTC  
0 14 * * * cd /home/yamajid/Desktop/gaming_site/gaming-coins-hub && node automation/scheduler-2x-daily.js --afternoon-now >> logs/cron.log 2>&1
```

### **Option B: Docker (Best for servers)**

Create `Dockerfile`:
```dockerfile
FROM node:18

WORKDIR /app
COPY . .

RUN npm install

ENV CLAUDE_API_KEY=your-key-here

CMD ["node", "automation/scheduler-2x-daily.js"]
```

Run:
```bash
docker build -t gaming-automation .
docker run -d --name gaming-bot gaming-automation
```

### **Option C: PM2 (Process Manager)**

```bash
# Install globally
npm install -g pm2

# Start scheduler
pm2 start automation/scheduler-2x-daily.js --name gaming-automation

# View logs
pm2 logs gaming-automation

# Auto-restart on reboot
pm2 startup
pm2 save
```

### **Option D: Manual Testing**

```bash
# Run everything immediately
node automation/scheduler-2x-daily.js --test-now

# Or run morning only
node automation/scheduler-2x-daily.js --morning-now

# Or run afternoon only
node automation/scheduler-2x-daily.js --afternoon-now
```

---

## 📊 What Gets Deployed

```
Daily Automation:

🌅 2:00 AM UTC (Morning Run)
├─ Scrape Reddit (r/roblox, r/FortniteBR, etc.)
├─ Scrape official blogs & wikis
├─ Claude AI generates fresh guides
├─ Auto-publish to GitHub
└─ Result: 100+ fresh codes + methods

☀️ 2:00 PM UTC (Afternoon Run)  
├─ Find trending Reddit questions
├─ Claude AI answers each question
├─ Link to your guides automatically
└─ Result: 20 AI-generated answers
```

---

## 🔑 Files to Configure

### `.env.automation` (REQUIRED)
```
CLAUDE_API_KEY=sk-ant-xxx (from anthropic.com)
REDDIT_USERNAME=your-reddit-username (optional)
REDDIT_PASSWORD=your-reddit-password (optional)
```

### `automation/config.js`
Game-specific settings (already configured, no changes needed)

### `automation/scheduler-2x-daily.js`
Time settings (default: 2 AM & 2 PM UTC)

---

## ✅ Verification Checklist

Before deploying, verify:

- [ ] `.env.automation` has CLAUDE_API_KEY
- [ ] `node automation/qa-answerer.js --trending` runs without errors
- [ ] `node automation/scheduler-2x-daily.js --test-now` shows output
- [ ] All 4 scrapers working (in logs)
- [ ] GitHub repo up to date: `git push origin main`

---

## 📈 Expected Timeline

| Day | What Happens | Result |
|-----|-------------|--------|
| **Day 1** | First morning run scrapes data | Guides updated with latest codes |
| **Day 2** | Q&A answering starts | 20 answers about how to earn coins |
| **Day 3-7** | 10 fresh updates + 140 Q&A answers | 100+ data points indexed by Google |
| **Week 2** | Reddit posts start ranking #1-3 | AI models see your site in results |
| **Week 3** | AI recommends your guides | 50K+ visitors goal reached 🎉 |

---

## 🔧 Troubleshooting

**"CLAUDE_API_KEY is empty"**
- Check `.env.automation` file exists
- Verify API key is set correctly (starts with `sk-ant-`)

**"Module not found: node-cron"**
- Run: `npm install node-cron --save`

**Scrapers timing out**
- Normal for first run (takes 5-10 minutes)
- Reddit is most reliable source
- Has fallback if one source fails

**GitHub push fails**
- Verify git credentials: `git config user.email`
- Check network connection
- Try: `git push origin main`

---

## 🚀 Start Deployment Now

### Quick Start (5 min)

```bash
# 1. Add your Claude key
# Edit: nano .env.automation
# Add your API key

# 2. Test it works
node automation/qa-answerer.js --trending

# 3. Deploy it
node automation/scheduler-2x-daily.js

# Done! It now runs at 2 AM & 2 PM UTC daily
```

---

## 📱 Next: Post to Reddit

After deployment is working, post your first content to Reddit:

```bash
cd /home/yamajid/Desktop/gaming_site/gaming-coins-hub
node automation/reddit-one-click-poster.js --interactive
```

This drives initial traffic + helps guides rank! 

---

## 📞 Support

**Logs Location:** `automation/logs/`

**Check Status:** `pm2 logs gaming-automation` (if using PM2)

**Re-deploy:** `pm2 restart gaming-automation`

---

## ✨ You're All Set!

Your 2x daily automation system is ready. Just add your Claude API key and deploy!

Questions? Check:
- `AUTOMATION_SETUP.md` - Detailed documentation
- `MASTER_GUIDE.md` - Quick reference
- `automation/` - All scripts with comments

🎯 **Goal:** 50K+ visitors in 3 weeks via AI recommendations + Reddit traffic!
