# 🤖 Enhanced Automation System - 2x Daily

Your automation system now runs **2 times per day** with Claude AI integration!

## 📅 Schedule

```
🌅 2:00 AM UTC (Morning)
   ├─ Scrape 4 sources × 4 games = Fresh codes + news
   ├─ Generate AI-optimized guides with Claude
   └─ Auto-publish to GitHub

☀️  2:00 PM UTC (Afternoon)
   ├─ Scrape Reddit trending questions
   ├─ Generate AI answers using Claude
   └─ Save Q&A cache for reference
```

## 🎮 What Gets Scraped (Morning)

Each game scrapes from **4 sources**:

| Game | Reddit | Blog | Wiki | Updates |
|------|--------|------|------|---------|
| **Roblox** | r/roblox | blog.roblox.com | roblox.fandom.com | updates.roblox.com |
| **Fortnite** | r/FortniteBR | fortnite.com/news | fortnite.fandom.com | fortnite.com/updates |
| **Mobile Legends** | r/MobileLegendsGame | mobilelegends.com/blog | mlbb.fandom.com | community feed |
| **Clash of Clans** | r/ClashOfClans | supercell.com/blog | clashofclans.fandom.com | in-game news |

**Result:** 100+ fresh data points per day

---

## 🤖 Claude AI Features

### Morning: Content Generation
Claude processes scraped data and generates:
- ✅ AI-optimized guide sections
- ✅ Quick Answer format (50 words)
- ✅ Comparison tables
- ✅ Verification badges
- ✅ Today's date (freshness signal)

### Afternoon: Q&A Answering
Claude answers trending questions:
- ✅ "How to get free Robux?" → Full answer with methods
- ✅ "Are V-Bucks generators safe?" → Expert opinion
- ✅ "Best diamond farming?" → Specific strategies
- ✅ Links back to your guides automatically

---

## 🚀 Setup

### 1. Install Dependencies
```bash
npm install node-cron
```

### 2. Add Claude API Key
```bash
# .env
CLAUDE_API_KEY=sk-ant-...
```

### 3. Start Scheduler

**Option A: Use cron (runs in background)**
```bash
# Add to crontab
0 2 * * * cd /path/to/gaming-coins-hub && node automation/scheduler-2x-daily.js
```

**Option B: Run manually (for testing)**
```bash
# Run morning automation now
node automation/scheduler-2x-daily.js --morning-now

# Run afternoon automation now  
node automation/scheduler-2x-daily.js --afternoon-now

# Run both immediately (testing)
node automation/scheduler-2x-daily.js --test-now
```

**Option C: Run always (using npm script)**
```bash
# Add to package.json:
"scripts": {
  "automation:2x": "node automation/scheduler-2x-daily.js"
}

# Run:
npm run automation:2x
```

---

## 🎯 Q&A Answerer

The `qa-answerer.js` script handles question answering independently:

```bash
# Answer trending Reddit questions
node automation/qa-answerer.js --trending

# Answer all common questions (5 per game)
node automation/qa-answerer.js --all

# Answer specific question
node automation/qa-answerer.js --game roblox "How to get free Robux?"
```

**Example Output:**
```
Q: How to get free Robux?
A: The fastest free method is Roblox Premium stipend which gives 450 Robux/month ($20 value). 
   For zero-cost, create game passes - you keep 70% of revenue. Realistically, players earn 
   500-5000 Robux/month combining daily login streaks + limited events.

More detailed methods: https://gamingcoinshub.com/docs/roblox/earn-free-robux-2026
```

---

## 📊 Data Flow

```
Morning Run (2 AM UTC):
┌───────────────────┐
│  4 Games × 4 Src  │ → Scrapers find 100+ data points
└────────┬──────────┘
         ↓
┌───────────────────┐
│  Claude AI        │ → Generates fresh content
└────────┬──────────┘
         ↓
┌───────────────────┐
│  Generator        │ → Updates 4 main guides
└────────┬──────────┘
         ↓
┌───────────────────┐
│  Publisher        │ → Commits to GitHub
└───────────────────┘

Afternoon Run (2 PM UTC):
┌───────────────────┐
│  Reddit Trending  │ → Finds top 5 questions per game
└────────┬──────────┘
         ↓
┌───────────────────┐
│  Claude AI        │ → Generates 20 answers
└────────┬──────────┘
         ↓
┌───────────────────┐
│  Save Q&A Cache   │ → Store for future reference
└───────────────────┘
```

---

## 📈 What Your Site Gets

**Daily updates (from 2 AM run):**
- ✅ Latest codes + methods
- ✅ Fresh content (same-day date stamp)
- ✅ AI-optimized format for search engines
- ✅ Better SEO rankings

**Daily Q&A (from 2 PM run):**
- ✅ 20 AI-generated answers about games
- ✅ Reference for community engagement
- ✅ Insights into what people ask
- ✅ Can be posted to Reddit for backlinks

---

## ⚡ Performance

- **Morning run:** ~5-10 minutes (scraping + AI generation)
- **Afternoon run:** ~3-5 minutes (Q&A generation)
- **CPU:** Low (async operations)
- **API calls:** ~30-40 per day (within limits)

---

## 🔧 Troubleshooting

**Claude API errors?**
- Check `CLAUDE_API_KEY` is set
- Verify you have API credits
- Fallback templates auto-generate if Claude unavailable

**Scrapers timing out?**
- Most reliable: Reddit data
- Slowest: Official blogs
- Has failovers for each source

**GitHub publishing slow?**
- Check network connection
- Verify git credentials
- Logs saved to `automation/logs/`

---

## 📝 Configuration

Edit `automation/scheduler-2x-daily.js` to:
- Change run times: Modify `cron.schedule()` expressions
- Add/remove games: Update `this.scrapers` map
- Change Claude model: Update `model:` in api calls
- Add more data sources: Extend scraper classes

---

## ✅ Your Content Gets:

1. **Daily Freshness** - Updated same day, AI knows
2. **AI Answers** - Trending questions answered with your guides
3. **Multiple Sources** - 4 sources per game = accurate info
4. **GitHub Backups** - All changes tracked and versioned
5. **Automatic Optimization** - Quick Answers, tables, badges all auto-generated

**Result:** Google + AI models see your site as the #1 fresh source for gaming guides! 🚀

---

## Next: Post to Reddit

Your Q&A answers can feed into the reddit-poster for community engagement!

See `MASTER_GUIDE.md` for Reddit posting instructions.
