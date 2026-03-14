# DigitalOcean Deployment Guide

## Prerequisites
- DigitalOcean GitHub Student Pack account
- Docker and Docker Compose
- Git SSH key configured

## Step 1: Create a Droplet

1. **Go to DigitalOcean Console**
2. **Create a Droplet:**
   - OS: Ubuntu 22.04 LTS
   - Size: Basic ($5/month is enough)
   - Region: Closest to your users
   - Auth: Add SSH key
   - Enable backups (optional but recommended)

3. **Note the Droplet IP** (e.g., 123.45.67.89)

## Step 2: SSH into Droplet

```bash
ssh root@your_droplet_ip

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Verify installation
docker --version
docker-compose --version
```

## Step 3: Clone Repository

```bash
cd /opt
git clone https://github.com/yamajid/GAMING_SITE.git
cd GAMING_SITE
```

## Step 4: Set Environment Variables

```bash
# Create .env file with your secrets
cat > .env << EOF
CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxx
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
GTM_CONTAINER_ID=GTM-XXXXXX
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
EOF

# Secure permissions
chmod 600 .env
```

**Note:** Get `GITHUB_TOKEN` from GitHub → Settings → Developer Settings → Personal Access Tokens
- Scopes needed: `repo`, `workflow`, `content:write`

## Step 5: Build & Run Docker Container

```bash
# Build the image
docker-compose build

# Start the container (runs in background)
docker-compose up -d

# Check logs
docker-compose logs -f scraper

# View PM2 status
docker-compose exec scraper pm2 status
```

## Step 6: Monitor & Debug

```bash
# View all logs
docker-compose logs scraper

# View specific app logs
docker-compose exec scraper pm2 logs daily-scraper

# Restart a specific job
docker-compose exec scraper pm2 restart daily-scraper

# View PM2 dashboard (if monitoring enabled)
docker-compose exec scraper pm2 web
# Then visit: http://your_droplet_ip:9615
```

## Step 7: Auto-Update from GitHub (Optional)

Create a webhook on your DigitalOcean droplet to auto-pull & redeploy on push:

```bash
# Create a script
cat > /opt/deploy.sh << 'EOF'
#!/bin/bash
cd /opt/GAMING_SITE
git pull origin main
docker-compose down
docker-compose build
docker-compose up -d
EOF

chmod +x /opt/deploy.sh

# Install webhook listener
npm install -g webhook
```

Then set GitHub repository webhook:
- URL: `http://your_droplet_ip:9000/deploy`
- Events: Push events
- Active: ✓

## Step 8: Backup & Maintenance

```bash
# Weekly backup of docs
0 0 * * 0 tar -czf /backups/docs-$(date +\%F).tar.gz /opt/GAMING_SITE/docs

# Clean old Docker images
0 3 * * 0 docker system prune -af

# View droplet resources
htop
```

## Troubleshooting

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

**Container keeps restarting?**
```bash
docker-compose logs --tail=100 scraper
# Check for Node.js errors
```

**SSH Key Issues?**
```bash
ssh -v root@your_droplet_ip  # For debugging
```

## Cost Breakdown (GitHub Student Pack)
- Droplet $5/month (Can get $200 free credit)
- Bandwidth: Usually included, overage ~$0.01/GB
- Total: ~$5/month (effectively free with student credit)

## Next Steps

1. ✅ Test the deployment locally:
   ```bash
   docker-compose up
   ```

2. ✅ Commit these files to GitHub

3. ✅ Create the DigitalOcean droplet

4. ✅ Deploy using the steps above

5. ✅ Monitor logs for the first few runs

## API Keys Reference

Get these from:

**CLAUDE_API_KEY:**
- https://console.anthropic.com/account/keys

**GITHUB_TOKEN:**
- https://github.com/settings/tokens
- Permissions: `repo`, `workflow`, `content:write`

**GOOGLE_ANALYTICS_ID:**
- https://analytics.google.com/

**GTM_CONTAINER_ID:**
- https://tagmanager.google.com/
