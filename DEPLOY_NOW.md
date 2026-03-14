# 🚀 Deploy Now - Step by Step

## 1️⃣ Create DigitalOcean Droplet (5 minutes)

### Go to DigitalOcean Console
```
https://www.digitalocean.com
```

### Create a New Droplet
1. Click **"Create"** → **"Droplets"**
2. **Choose Image:**
   - Select **Ubuntu 22.04 LTS**

3. **Choose Size:**
   - Select **Basic** plan
   - **$5/month** (or free with 1337 student pack credit)
   - 1GB RAM is enough

4. **Choose Region:**
   - Pick closest to your users

5. **Authentication:**
   - Choose **SSH keys** (recommended) or password

6. **Hostname:**
   - Name it: `gaming-scraper` or similar

7. **Click "Create Droplet"**

### ⏳ Wait 30-60 seconds for droplet to be created, then note the **IP Address**

---

## 2️⃣ Deploy to Your Droplet (10 minutes)

### Open Terminal and SSH In

```bash
ssh root@YOUR_DROPLET_IP
```

Replace `YOUR_DROPLET_IP` with the IP from step 1 (e.g., `123.45.67.89`)

If you get "Connection refused", wait 30 more seconds and retry.

### Download and Run Deployment Script

```bash
cd /tmp
curl -O https://raw.githubusercontent.com/yamajid/GAMING_SITE/main/deploy-digitalocean.sh
chmod +x deploy-digitalocean.sh
./deploy-digitalocean.sh
```

This will automatically:
- ✅ Update system
- ✅ Install Docker
- ✅ Install Docker Compose
- ✅ Clone your repository
- ✅ Build Docker image
- ✅ Start the container
- ✅ Show you the status

⏳ **Wait 2-3 minutes** while Docker builds...

---

## 3️⃣ Add Your API Keys (5 minutes)

After the script finishes, add your API keys:

```bash
nano /opt/GAMING_SITE/.env
```

Add these (get them from the links below):

```env
CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxx
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
GTM_CONTAINER_ID=GTM-XXXXXX
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
NODE_ENV=production
```

**Get Your Keys:**
- **Claude API Key** → https://console.anthropic.com/account/keys
- **GitHub Token** → https://github.com/settings/tokens (scopes: `repo`, `workflow`)
- **Google Analytics ID** → Already set on Netlify
- **GTM Container ID** → Already set on Netlify

**Save File:**
- Press `CTRL+X`
- Press `Y`
- Press `ENTER`

### Restart Container with New Keys

```bash
cd /opt/GAMING_SITE
docker-compose restart
```

⏳ Wait 10 seconds...

---

## 4️⃣ Verify Everything Works (5 minutes)

### Check Container Status
```bash
docker-compose ps
```

You should see: `gaming_site-scraper ... Up`

### Check Logs
```bash
docker-compose logs scraper
```

Should show no errors, and PM2 running.

### Check PM2 Jobs
```bash
docker-compose exec scraper pm2 status
```

Should show 3 jobs:
- ✅ daily-scraper
- ✅ scheduler-2x-daily
- ✅ reddit-poster

### Verify Git Credentials Work
```bash
docker-compose exec scraper git config --list | grep user
```

Should show your git configuration.

---

## 5️⃣ Set Up GitHub Webhook (Optional - 10 minutes)

This makes your site auto-update when you push to GitHub.

**Follow:** `GITHUB_WEBHOOK_SETUP.md` in your repo

---

## 🎉 You're Done!

Your setup now:

```
GitHub (you push)
    ↓
DigitalOcean Scraper (runs daily)
    ↓
Updates content in repo
    ↓
Netlify (auto-rebuilds)
    ↓
Live at gamingcoinshub.com ✨
```

---

## 🛠️ Useful Commands

### View Live Logs
```bash
ssh root@YOUR_DROPLET_IP
cd /opt/GAMING_SITE
docker-compose logs -f scraper
```

### Restart Jobs
```bash
docker-compose exec scraper pm2 restart all
```

### Stop Everything
```bash
docker-compose down
```

### Start Again
```bash
docker-compose up -d
```

### Update Code (Pull Latest from GitHub)
```bash
cd /opt/GAMING_SITE
git pull origin main
docker-compose down
docker-compose build
docker-compose up -d
```

### Check Disk Space
```bash
df -h
```

### Check CPU/Memory Usage
```bash
htop
```
(Press `Q` to exit)

---

## 🚨 Troubleshooting

### "Connection refused" when SSH
- **Solution:** Wait 60 seconds for droplet to fully boot, then retry

### Container won't start
```bash
docker-compose logs scraper  # View error details
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Out of disk space
```bash
docker system prune -af  # Remove unused images
du -sh /opt/GAMING_SITE/*  # Check what's using space
```

### Scraper not running
```bash
docker-compose exec scraper pm2 status
docker-compose exec scraper pm2 logs daily-scraper
```

### Git errors
```bash
docker exec gaming_site-scraper git config --list
# Make sure email and name are set in git config
```

---

## ✅ Deployment Checklist

- [ ] DigitalOcean droplet created
- [ ] Noted the IP address
- [ ] SSH'd into droplet successfully
- [ ] Deployment script ran without errors
- [ ] All 3 PM2 jobs showing as "online"
- [ ] No errors in docker-compose logs
- [ ] API keys added to .env
- [ ] Container restarted
- [ ] Verified site updates on Netlify
- [ ] (Optional) GitHub webhook configured

---

## 💰 Your Cost

- Droplet: **$5/month** (potentially free with student pack)
- Site: **Live & Running! 🎮**

---

## 🎯 Next Steps

1. **Create droplet** (Step 1)
2. **Run deployment** (Step 2)
3. **Add API keys** (Step 3)
4. **Verify** (Step 4)
5. **Optional: GitHub webhook** (Step 5)

**Ready? Start with Step 1 above!** 🚀
