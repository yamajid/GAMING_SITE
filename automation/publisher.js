/**
 * Publisher - Handles GitHub commits and Vercel deployment
 */

const axios = require('axios');
const logger = require('../logger');

class Publisher {
  constructor(githubToken, vercelToken) {
    this.githubToken = githubToken || process.env.GITHUB_TOKEN;
    this.vercelToken = vercelToken || process.env.VERCEL_TOKEN;
    this.baseUrl = 'https://api.github.com';
    this.owner = process.env.GITHUB_OWNER || 'yamajid';
    this.repo = process.env.GITHUB_REPO || 'GAMING_SITE';
  }

  /** Alias - scheduler calls publishFiles */
  async publishFiles(generatedFiles) {
    return this.publishContent(generatedFiles);
  }

  async publishContent(generatedFiles) {
    try {
      logger.info('📤 Publishing content to GitHub...');

      // Step 1: Create branch for changes
      const branchName = this.createBranchName();
      
      // Step 2: Commit generated files
      const commits = await this.commitFiles(generatedFiles, branchName);
      
      // Step 3: Create pull request
      const prUrl = await this.createPullRequest(branchName);
      
      // Step 4: Merge PR automatically
      await this.mergePullRequest(branchName);
      
      // Step 5: Trigger Vercel deployment
      await this.triggerVercelDeployment();

      logger.success(`✅ Published ${commits.length} files to production`);
      
      return {
        success: true,
        filesPublished: commits.length,
        prUrl,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error(`Publishing failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async commitFiles(files, branchName) {
    /**
     * Files structure:
     * [{ path: 'docs/roblox/new-guide.md', content: '...' }, ...]
     */
    
    const commits = [];

    for (const file of files) {
      try {
        // Get current file SHA to update it
        const existingSha = await this.getFileSha(file.path);
        
        const commitData = {
          message: `[AUTO] Update ${file.path} - ${new Date().toISOString()}`,
          content: Buffer.from(file.content).toString('base64'),
          branch: branchName,
        };

        if (existingSha) {
          commitData.sha = existingSha;
        }

        // Put file to repo (create or update)
        await axios.put(
          `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${file.path}`,
          commitData,
          {
            headers: {
              Authorization: `token ${this.githubToken}`,
              'User-Agent': 'gaming-coins-automation',
            },
          }
        );

        commits.push(file.path);
        logger.info(`✔️  Committed ${file.path}`);
      } catch (error) {
        logger.warn(`Failed to commit ${file.path}: ${error.message}`);
      }
    }

    return commits;
  }

  async getFileSha(path) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}`,
        {
          headers: {
            Authorization: `token ${this.githubToken}`,
            'User-Agent': 'gaming-coins-automation',
          },
        }
      );
      return response.data.sha;
    } catch (error) {
      // File doesn't exist yet (will be created)
      return null;
    }
  }

  async createPullRequest(branchName) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/repos/${this.owner}/${this.repo}/pulls`,
        {
          title: `[AUTO] Daily Content Update - ${new Date().toLocaleDateString()}`,
          body: '🤖 Automated content refresh from daily game scrapers\n\n- Fresh promo codes\n- Updated earning methods\n- Community FAQs',
          head: branchName,
          base: 'main',
        },
        {
          headers: {
            Authorization: `token ${this.githubToken}`,
            'User-Agent': 'gaming-coins-automation',
          },
        }
      );

      const prNumber = response.data.number;
      const prUrl = response.data.html_url;
      logger.info(`📝 Created PR #${prNumber}: ${prUrl}`);
      
      return prUrl;
    } catch (error) {
      logger.warn(`PR creation failed: ${error.message}`);
      return null;
    }
  }

  async mergePullRequest(branchName) {
    try {
      // Get PR number by branch name
      const prsResponse = await axios.get(
        `${this.baseUrl}/repos/${this.owner}/${this.repo}/pulls?head=${this.owner}:${branchName}`,
        {
          headers: {
            Authorization: `token ${this.githubToken}`,
            'User-Agent': 'gaming-coins-automation',
          },
        }
      );

      if (prsResponse.data.length === 0) {
        logger.warn('No PR found to merge');
        return;
      }

      const prNumber = prsResponse.data[0].number;

      // Merge PR
      await axios.put(
        `${this.baseUrl}/repos/${this.owner}/${this.repo}/pulls/${prNumber}/merge`,
        {
          commit_message: '[AUTO] Daily automation merged',
          merge_method: 'squash',
        },
        {
          headers: {
            Authorization: `token ${this.githubToken}`,
            'User-Agent': 'gaming-coins-automation',
          },
        }
      );

      logger.success(`🔀 Merged PR #${prNumber}`);
    } catch (error) {
      logger.warn(`PR merge failed: ${error.message}`);
    }
  }

  async triggerVercelDeployment() {
    try {
      if (!this.vercelToken) {
        logger.warn('Vercel token not configured - skipping deployment');
        return;
      }

      /**
       * Option 1: Trigger via webhook (if configured)
       * const webhookUrl = process.env.VERCEL_WEBHOOK;
       * if (webhookUrl) { await axios.post(webhookUrl); }
       */

      /**
       * Option 2: Use Vercel API to redeploy
       */
      const projectId = process.env.VERCEL_PROJECT_ID;
      if (!projectId) {
        logger.warn('Vercel project ID not configured');
        return;
      }

      const response = await axios.post(
        `https://api.vercel.com/v13/deployments?projectId=${projectId}`,
        { gitSource: { ref: 'main' } },
        {
          headers: {
            Authorization: `Bearer ${this.vercelToken}`,
          },
        }
      );

      logger.success(`🚀 Vercel deployment triggered: ${response.data.url}`);
    } catch (error) {
      logger.warn(`Vercel deployment failed: ${error.message}`);
    }
  }

  createBranchName() {
    const timestamp = new Date().toISOString().split('T')[0];
    return `auto/content-update-${timestamp}`;
  }
}

module.exports = Publisher;
