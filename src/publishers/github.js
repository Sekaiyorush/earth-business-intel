/**
 * GitHub Publisher
 * Publishes reports to GitHub repository
 */

import simpleGit from 'simple-git';
import { config } from '../config.js';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '../..');

export class GitHubPublisher {
  constructor() {
    this.git = simpleGit(rootDir);
    this.enabled = config.github.enabled;
    this.reportsDir = join(rootDir, config.github.reportsPath);
  }

  /**
   * Check if GitHub publishing is configured
   */
  isConfigured() {
    if (!this.enabled) {
      console.log('⚠️ GitHub publishing disabled. Set GITHUB_ENABLED=true to enable.');
      return false;
    }

    if (!config.github.owner) {
      console.log('⚠️ GitHub owner not configured. Set GITHUB_OWNER in .env');
      return false;
    }

    return true;
  }

  /**
   * Save and publish a report
   */
  async publish(reportContent, filename) {
    if (!this.isConfigured()) {
      console.log('💾 Saving locally only (GitHub not configured)');
      return this.saveLocal(reportContent, filename);
    }

    try {
      // Ensure reports directory exists
      if (!existsSync(this.reportsDir)) {
        mkdirSync(this.reportsDir, { recursive: true });
      }

      const filePath = join(this.reportsDir, filename);
      
      // Write report
      writeFileSync(filePath, reportContent, 'utf8');
      console.log(`✅ Report saved: ${filePath}`);

      // Git operations
      const status = await this.git.status();
      
      if (status.files.length === 0) {
        console.log('ℹ️ No changes to commit');
        return { success: true, published: false, reason: 'no-changes' };
      }

      // Add, commit, push
      await this.git.add('.');
      await this.git.commit(config.github.commitMessage(new Date().toISOString().split('T')[0]));
      await this.git.push('origin', config.github.branch);

      const repoUrl = `https://github.com/${config.github.owner}/${config.github.repo}`;
      console.log(`🚀 Published to GitHub: ${repoUrl}`);

      return {
        success: true,
        published: true,
        url: `${repoUrl}/blob/${config.github.branch}/${config.github.reportsPath}/${filename}`
      };

    } catch (error) {
      console.error('❌ GitHub publish failed:', error.message);
      
      // Fallback to local save
      console.log('💾 Falling back to local save...');
      return this.saveLocal(reportContent, filename);
    }
  }

  /**
   * Save report locally only
   */
  saveLocal(reportContent, filename) {
    try {
      const localDir = join(rootDir, 'reports');
      if (!existsSync(localDir)) {
        mkdirSync(localDir, { recursive: true });
      }

      const filePath = join(localDir, filename);
      writeFileSync(filePath, reportContent, 'utf8');
      
      console.log(`✅ Report saved locally: ${filePath}`);
      
      return {
        success: true,
        published: false,
        localPath: filePath
      };

    } catch (error) {
      console.error('❌ Local save failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Initialize GitHub repo if needed
   */
  async initRepo() {
    try {
      const isRepo = await this.git.checkIsRepo();
      
      if (!isRepo) {
        console.log('📦 Initializing Git repository...');
        await this.git.init();
        await this.git.addRemote('origin', 
          `https://github.com/${config.github.owner}/${config.github.repo}.git`);
      }

      return true;
    } catch (error) {
      console.error('❌ Git init failed:', error.message);
      return false;
    }
  }
}

export default GitHubPublisher;