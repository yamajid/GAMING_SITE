# Quick Start: Gaming Coins Hub - Complete Deployment

## 🎯 Overview

Your site is now ready with:
- ✅ Netlify hosting (live at gamingcoinshub.com)
- ✅ Daily automated scrapers (DigitalOcean)
- ✅ GitHub CI/CD webhook
- ✅ PM2 process management
- ✅ Docker containerization

## 🚀 Quick Setup (15 minutes)

### Step 1: Create DigitalOcean Droplet (5 min)

1. Visit: https://www.digitalocean.com
2. Create → Droplets
3. Choose:
   - | Image | OS | RAM | Cost |
     |-------|-----|-----|------|
     | Ubuntu 22.04 LTS | Linux | 1GB | $5/month* |
     | Basic | - | - | - |
   - *Free with GitHub Student Pack*
4. Add SSH key or password
5. Create & note the IP (e.g., `123.45.67.89`)

### Step 2: Deploy to DigitalOcean (10 min)

```bash
# Connect to droplet
ssh root@YOUR_DROPLET_IP

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
apt install docker-compose -y

# Clone your repo
cd /opt
git clone https://github.com/yamajid/GAMING_SITE.git
cd GAMING_SITE

# Create .env file with your secrets
cat > .env << EOF
CLAUDE_API_KEY=sk-ant-YOUR_KEY_HERE
GOOGLE_ANALYTICS_ID=G-YOUR_ID_HERE
GTM_CONTAINER_ID=GTM-YOUR_ID_HERE
GITHUB_TOKEN=ghp_YOUR_TOKEN_HERE
NODE_ENV=production
EOF

# Build and run
docker-compose build
docker-compose up -d

# Check status
docker-compose logs -f scraper
```

### Step 3: Set Up GitHub Webhook (Optional but Recommended)

See: `GITHUB_WEBHOOK_SETUP.md`

This allows automatic redeploy when you push code changes.

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| [DEPLOYMENT_DIGITALOCEAN.md](./DEPLOYMENT_DIGITALOCEAN.md) | Complete DigitalOcean setup guide |
| [GITHUB_WEBHOOK_SETUP.md](./GITHUB_WEBHOOK_SETUP.md) | Auto-deploy on GitHub push |
| [.env.scraper.example](./.env.scraper.example) | Environment variables reference |
| [automation/ecosystem.config.js](./automation/ecosystem.config.js) | PM2 job scheduling |
| [Dockerfile](./Dockerfile) | Docker container definition |
| [docker-compose.yml](./docker-compose.yml) | Docker orchestration |

## 🔑 Get Your API Keys

### Claude API Key
- https://console.anthropic.com/account/keys
- Free tier available

### GitHub Token
- https://github.com/settings/tokens
- New → classic
- Scopes: `repo`, `workflow`, `content:write`

### Google Analytics ID
- https://analytics.google.com/
- Already configured in Netlify

### Google Tag Manager ID
- https://tagmanager.google.com/
- Already configured in Netlify

## 📊 Scheduled Jobs

Your scraper runs automatically:

| Time (UTC) | Task | File |
|-----------|------|------|
| 2:00 AM | Fresh daily content | `daily-content-fresh.js` |
| 12:00 PM | 2x daily scheduler | `scheduler-2x-daily.js` |
| 12:00 AM | Reddit poster | `reddit-one-click-poster.js` |
| 6:00 PM | Reddit poster | (same) |

## 🛠️ Common Commands

```bash
# View logs
docker-compose logs -f scraper

# View PM2 status
docker-compose exec scraper pm2 status

# Restart a job
docker-compose exec scraper pm2 restart daily-scraper

# Stop scraper
docker-compose down

# Start scraper
docker-compose up -d

# Rebuild image
docker-compose build --no-cache
```

## 🔍 Monitoring

### Check scraper is running
```bash
docker-compose ps
docker-compose logs scraper | tail -50
```

### View PM2 dashboard (optional)
```bash
# Start web monitoring
docker-compose exec scraper pm2 web

# Visit in browser: http://YOUR_DROPLET_IP:9615
```

## 🚨 Troubleshooting

**Scraper not running?**
```bash
docker-compose logs scraper
docker-compose exec scraper pm2 status
```

**Out of disk space?**
```bash
df -h
docker system prune -af
```

**Container won't start?**
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

**Git push failed?**
```bash
# Inside container, check git config
docker-compose exec scraper git config --list
```

## 🎉 What's Next?

1. ✅ Deploy to DigitalOcean (see above)
2. ✅ Set up GitHub webhook (optional)
3. ✅ Monitor first scrape run
4. ✅ Verify content updates on Netlify
5. ✅ Set up monitoring/alerts (optional)

## 💰 Cost Breakdown

| Service | Cost | Notes |
|---------|------|-------|
| Netlify | $0/month | Free tier (production) |
| DigitalOcean | $5/month | ~$200 free with student pack |
| APIs (Claude, Analytics, GTM) | $0-50/month | Free tier or pay-as-you-go |
| **Total** | **$5-55/month** | Depends on API usage |

## 🔐 Security

- **Secrets in .env:** Never commit to Git
- **GitHub Workflow:** Uses encrypted secrets
- **Docker:** Runs as non-root when possible
- **Backups:** Enable in DigitalOcean dashboard

## 📈 Scale Later

- Increase droplet size if needed ($15/month → $30/month)
- Add CDN (Cloudflare - free)
- Add monitoring (UptimeRobot - free)
- Add analytics dashboard (Vercel Analytics - paid)

## 🆘 Need Help?

Check these files:
1. `DEPLOYMENT_DIGITALOCEAN.md` - Full setup details
2. `GITHUB_WEBHOOK_SETUP.md` - CI/CD setup
3. `automation/README.md` - Scraper documentation
4. Logs: `docker-compose logs -f scraper`

## ✨ Your Setup is Production-Ready!

You now have:
- 🌐 Global CDN (Netlify)
- 🤖 Automated content updates (DigitalOcean)
- 🔄 CI/CD pipeline (GitHub Webhooks)
- 📊 SEO optimized
- 📈 Analytics tracking
- 🚀 Ready to scale

Happy deploying! 🎮
