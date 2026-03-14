# Deployment Checklist

Complete these steps to deploy your gaming site to production.

## Phase 1: Prepare (Local Machine)

- [x] Remove node_modules from git history
- [x] Add node_modules to .gitignore
- [x] Fix Docusaurus configuration (remove duplicate plugins)
- [x] Update broken links handling
- [x] Create Docker setup (Dockerfile, docker-compose.yml)
- [x] Create PM2 ecosystem config
- [x] Get API keys and credentials
- [ ] Test Docker build locally (`docker-compose build`)

## Phase 2: DigitalOcean Setup

- [ ] Create GitHub Student Pack account (if not done)
- [ ] Create DigitalOcean account with student pack
- [ ] Create Ubuntu 22.04 LTS droplet ($5/month)
- [ ] Note droplet IP address
- [ ] Add SSH key to droplet

## Phase 3: Deploy to DigitalOcean

- [ ] SSH into droplet: `ssh root@YOUR_IP`
- [ ] Update system: `apt update && apt upgrade -y`
- [ ] Install Docker: `curl -fsSL https://get.docker.com | sh`
- [ ] Install Docker Compose: `apt install docker-compose -y`
- [ ] Clone repository: `cd /opt && git clone https://github.com/yamajid/GAMING_SITE.git`
- [ ] Create .env file with API keys
- [ ] Build Docker image: `docker-compose build`
- [ ] Start container: `docker-compose up -d`
- [ ] Verify: `docker-compose logs scraper`
- [ ] Check PM2 status: `docker-compose exec scraper pm2 status`

## Phase 4: GitHub Webhook Setup (Optional)

- [ ] Create webhook handler script (/opt/deploy.sh)
- [ ] Install webhook service: `npm install -g webhook`
- [ ] Create webhook config (/opt/webhook-config.json)
- [ ] Create systemd service for webhook
- [ ] Enable webhook service: `systemctl start webhook`
- [ ] Add webhook to GitHub: Settings → Webhooks
- [ ] Test webhook delivery

## Phase 5: Verification

### Netlify
- [ ] Check Netlify build status (should pass)
- [ ] Verify site loads: https://gamingcoinshub.com
- [ ] Check SEO sitemap: https://gamingcoinshub.com/sitemap.xml

### DigitalOcean
- [ ] SSH into droplet successfully
- [ ] Docker container is running: `docker ps`
- [ ] PM2 shows 3 active jobs
- [ ] Logs show no errors: `docker-compose logs --tail=100 scraper`

### Scrapers
- [ ] Check PM2 is running: `docker-compose exec scraper pm2 status`
- [ ] Review cron schedule matches expects times
- [ ] Check logs for successful scraper runs
- [ ] Verify docs/ folder updates

### GitHub Integration
- [ ] Push a test commit (e.g., update README.md)
- [ ] Webhook triggers (if set up)
- [ ] Netlify rebuilds automatically
- [ ] DigitalOcean pulls latest code (if webhook enabled)

## Phase 6: Monitoring & Maintenance

- [ ] Set up DigitalOcean monitoring alerts
- [ ] Monitor Netlify build logs
- [ ] Check scraper logs daily for errors
- [ ] Set up log rotation (already configured)
- [ ] Create backup strategy (DigitalOcean backups)
- [ ] Document any custom API configurations
- [ ] Set up uptime monitoring (UptimeRobot - free)

## API Keys Acquired

- [ ] CLAUDE_API_KEY - https://console.anthropic.com/account/keys
- [ ] GITHUB_TOKEN - https://github.com/settings/tokens
- [ ] GOOGLE_ANALYTICS_ID - https://analytics.google.com/
- [ ] GTM_CONTAINER_ID - https://tagmanager.google.com/

## Documentation Generated

- [x] DEPLOYMENT_DIGITALOCEAN.md - Full setup guide
- [x] GITHUB_WEBHOOK_SETUP.md - CI/CD guide
- [x] QUICK_START.md - Quick reference
- [x] .env.scraper.example - Environment template
- [x] DEPLOYMENT_CHECKLIST.md (this file)

## Emergency Procedures

### If Scraper Stops Working
```bash
ssh root@YOUR_DROPLET_IP
cd /opt/GAMING_SITE
docker-compose logs scraper | tail -100
docker-compose exec scraper pm2 restart all
```

### If Container Won't Start
```bash
docker-compose down
docker system prune -af
docker-compose build --no-cache
docker-compose up -d
```

### If Out of Disk Space
```bash
du -sh /opt/GAMING_SITE/*
docker system prune -af
npm cache clean --force
```

### Manual Content Update
```bash
docker-compose exec scraper node automation/daily-content-fresh.js
```

## Post-Deployment Tasks

- [ ] Set up monitoring dashboard
- [ ] Configure log aggregation (optional)
- [ ] Schedule backups (DigitalOcean)
- [ ] Document deployment process for team
- [ ] Create runbook for common issues
- [ ] Set up alerts for errors
- [ ] Configure database backups (if using)
- [ ] Plan security updates schedule

## Success Criteria

✅ All sections completed when:
1. Site loads on Netlify
2. Scrapers run on schedule
3. Content updates automatically
4. GitHub webhook triggers redeploy (if set up)
5. No errors in logs
6. All API keys working
7. Backups enabled
8. Monitoring alerts configured

## Cost Verification

| Service | Expected | Actual |
|---------|----------|--------|
| Netlify | $0 | $0 |
| DigitalOcean | $5 | $5 |
| APIs Free Tier | $0 | $0 |
| **Total/Month** | **$5** | **$5** |

Ready to deploy? Start with Phase 1 above! 🚀
