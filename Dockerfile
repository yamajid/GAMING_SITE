FROM node:20-alpine

WORKDIR /app

# Install git and other required tools
RUN apk add --no-cache git openssh-client

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy automation scripts
COPY automation/ ./automation/
COPY docs/ ./docs/

# Configure git for commits
RUN git config --global user.email "yamajid@student.1337.ma" && \
    git config --global user.name "yamajid"

# Install PM2 globally
RUN npm install -g pm2

# Create logs directory
RUN mkdir -p logs

# Expose for PM2 monitoring (optional)
EXPOSE 9615

# Start PM2
CMD ["pm2-runtime", "start", "automation/ecosystem.config.js"]
