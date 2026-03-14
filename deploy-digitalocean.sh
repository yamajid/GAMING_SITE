#!/bin/bash

# Gaming Coins Hub - DigitalOcean Deployment Script
# This script automates the initial setup after SSH into a fresh Ubuntu 22.04 droplet

set -e

echo "🚀 Gaming Coins Hub - DigitalOcean Deployment"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Update system
echo -e "${BLUE}[1/8]${NC} Updating system packages..."
apt-get update
apt-get upgrade -y
apt-get install -y curl wget git

# Step 2: Install Docker
echo -e "${BLUE}[2/8]${NC} Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
else
    echo "Docker already installed"
fi

# Step 3: Install Docker Compose
echo -e "${BLUE}[3/8]${NC} Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    apt-get install -y docker-compose
else
    echo "Docker Compose already installed"
fi

# Step 4: Clone repository
echo -e "${BLUE}[4/8]${NC} Cloning repository..."
cd /opt
if [ -d "GAMING_SITE" ]; then
    echo "Repository already exists, pulling latest changes..."
    cd GAMING_SITE
    git pull origin main
else
    git clone https://github.com/yamajid/GAMING_SITE.git
    cd GAMING_SITE
fi

# Step 5: Create .env file
echo -e "${BLUE}[5/8]${NC} Creating .env file..."
if [ ! -f ".env" ]; then
    cat > .env << 'EOF'
# Add your API keys here
CLAUDE_API_KEY=
GOOGLE_ANALYTICS_ID=
GTM_CONTAINER_ID=
GITHUB_TOKEN=
NODE_ENV=production
EOF
    echo -e "${YELLOW}⚠️  .env file created. Please add your API keys!${NC}"
    echo "   Edit: /opt/GAMING_SITE/.env"
else
    echo ".env file already exists"
fi

# Step 6: Build Docker image
echo -e "${BLUE}[6/8]${NC} Building Docker image..."
docker-compose build

# Step 7: Start container
echo -e "${BLUE}[7/8]${NC} Starting container..."
docker-compose up -d

# Step 8: Verify deployment
echo -e "${BLUE}[8/8]${NC} Verifying deployment..."
sleep 5

echo ""
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo "📊 Status:"
docker-compose ps
echo ""
echo "📝 Recent logs:"
docker-compose logs --tail=10 scraper
echo ""
echo -e "${YELLOW}⚠️  NEXT STEPS:${NC}"
echo "1. Add API keys to .env file:"
echo "   nano /opt/GAMING_SITE/.env"
echo ""
echo "2. Restart container:"
echo "   cd /opt/GAMING_SITE && docker-compose restart"
echo ""
echo "3. View logs:"
echo "   docker-compose logs -f scraper"
echo ""
echo "4. Check PM2 status:"
echo "   docker-compose exec scraper pm2 status"
echo ""
