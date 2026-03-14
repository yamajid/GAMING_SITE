/**
 * Publisher - Writes generated files to disk for git commit & push
 * Netlify auto-deploys when changes are pushed to main (no Vercel)
 */

const fs = require('fs');
const path = require('path');
const logger = require('./logger');

class Publisher {
  constructor() {
    this.repoRoot = path.resolve(__dirname, '../..');
  }

  /** Alias - scheduler calls publishFiles */
  async publishFiles(generatedFiles) {
    return this.writeFilesToDisk(generatedFiles);
  }

  /**
   * Write generated files to disk. Caller (GitHub Actions) handles git add, commit, push.
   * Netlify auto-deploys on push to main.
   */
  async writeFilesToDisk(generatedFiles) {
    const written = [];
    const failed = [];

    for (const file of generatedFiles) {
      try {
        const filePath = path.join(this.repoRoot, file.path);
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, file.content, 'utf8');
        written.push(file.path);
        logger.publisher(`✔️  ${file.path} (${(file.content?.length ?? 0)} chars)`);
      } catch (error) {
        failed.push({ path: file.path, error: error.message });
        logger.warn(`Failed to write ${file.path}: ${error.message}`);
      }
    }

    return {
      success: failed.length === 0,
      filesWritten: written.length,
      filesFailed: failed.length,
      paths: written,
      failed,
      timestamp: new Date(),
    };
  }
}

module.exports = Publisher;
