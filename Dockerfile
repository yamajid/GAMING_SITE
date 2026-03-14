FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy automation scripts
COPY automation/ ./automation/
COPY docs/ ./docs/

# Copy git config for commits
RUN git config --global user.email "scraper@gamingcoinshub.com" && \
    git config --global user.name "Gaming Scraper"

# Install PM2 globally
RUN npm install -g pm2

# Expose for PM2 monitoring (optional)
EXPOSE 9615

# Start PM2
CMD ["pm2-runtime", "start", "automation/ecosystem.config.js"]
