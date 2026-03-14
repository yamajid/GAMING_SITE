# GitHub Webhook Setup (Auto-Deploy to DigitalOcean)

This guide explains how to automatically trigger deployment on DigitalOcean when you push to GitHub.

## Option 1: Simple - Redeploy Entire Container (Recommended)

### DigitalOcean Setup

1. **SSH into your droplet:**
   ```bash
   ssh root@your_droplet_ip
   ```

2. **Create a deploy script at `/opt/deploy.sh`:**
   ```bash
   sudo nano /opt/deploy.sh
   ```

   Paste this content:
   ```bash
   #!/bin/bash
   set -e
   
   PROJECT_DIR="/opt/GAMING_SITE"
   LOG_FILE="/var/log/gaming-scraper-deploy.log"
   
   echo "$(date): Starting deployment..." >> $LOG_FILE
   
   cd $PROJECT_DIR
   
   # Pull latest code
   git pull origin main >> $LOG_FILE 2>&1
   
   # Rebuild and restart
   docker-compose down >> $LOG_FILE 2>&1
   docker-compose build >> $LOG_FILE 2>&1
   docker-compose up -d >> $LOG_FILE 2>&1
   
   echo "$(date): Deployment complete" >> $LOG_FILE
   ```

3. **Make it executable:**
   ```bash
   sudo chmod +x /opt/deploy.sh
   ```

4. **Install webhook handler (Node.js):**
   ```bash
   sudo npm install -g webhook
   ```

5. **Create webhook config at `/opt/webhook-config.json`:**
   ```bash
   sudo nano /opt/webhook-config.json
   ```

   Paste this:
   ```json
   [
     {
       "id": "gaming-scraper-webhook",
       "execute-command": "/opt/deploy.sh",
       "command-working-directory": "/opt",
       "trigger-rule":
       {
         "match":
         {
           "type": "payload-hash-sha1",
           "secret": "YOUR_SECRET_HERE",
           "parameter":
           {
             "source": "header",
             "name": "X-Hub-Signature"
           }
         }
       }
     }
   ]
   ```

   Replace `YOUR_SECRET_HERE` with a random string (e.g., `openssl rand -hex 32`)

6. **Create systemd service to run webhook:**
   ```bash
   sudo nano /etc/systemd/system/webhook.service
   ```

   Paste:
   ```ini
   [Unit]
   Description=GitHub Webhook Service
   After=network.target

   [Service]
   Type=simple
   User=root
   WorkingDirectory=/opt
   ExecStart=/usr/bin/webhook -hooks /opt/webhook-config.json -verbose -port 9000
   Restart=always
   RestartSec=10

   [Install]
   WantedBy=multi-user.target
   ```

7. **Enable and start the service:**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable webhook
   sudo systemctl start webhook
   sudo systemctl status webhook
   ```

### GitHub Setup

1. Go to your repository: https://github.com/yamajid/GAMING_SITE

2. Settings → Webhooks → Add webhook

3. Fill in:
   - **Payload URL:** `http://your_droplet_ip:9000/hooks/gaming-scraper-webhook`
   - **Content type:** `application/json`
   - **Secret:** (same as `YOUR_SECRET_HERE` above)
   - **Events:** Push events
   - **Active:** ✓

4. Click **Add webhook**

5. Test by clicking "Send test"

## Option 2: Advanced - Git Hook Method

Alternative: Use Git hooks within the container

```bash
# Inside droplet
docker-compose exec scraper pm2 deploy
```

## Troubleshooting

**Webhook not triggering?**
```bash
# Check webhook service
sudo systemctl status webhook
sudo journalctl -u webhook -f

# Check GitHub webhook delivery
# Go to GitHub → Settings → Webhooks → Click webhook → Recent Deliveries
```

**Deploy script failing?**
```bash
# Check logs
tail -f /var/log/gaming-scraper-deploy.log

# Run manually to debug
/opt/deploy.sh
```

**Permission denied?**
```bash
sudo chmod +x /opt/deploy.sh
sudo chown root:root /opt/deploy.sh
```

## Manual Deploy (If Webhook Fails)

SSH into droplet and run:
```bash
cd /opt/GAMING_SITE
git pull origin main
docker-compose down
docker-compose build
docker-compose up -d
```

## Auto-Redeploy on Content Changes

The workflow above automatically redeploys when you push to GitHub. This means:

1. You push to `main` branch
2. GitHub triggers webhook
3. DigitalOcean pulls latest code
4. Docker image rebuilds
5. Scraper restarts with new logic
6. Fresh content flows to Netlify

Perfect for continuous deployment! 🚀
