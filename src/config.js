import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Load .env if it exists
const envPath = join(rootDir, '.env');
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

/**
 * RITA's Business Intelligence Configuration
 * Modify these to customize your automation
 */
export const config = {
  // 🔧 Mode: 'test' = just logs, 'production' = publishes to GitHub
  mode: process.env.MODE || 'test',
  
  // 📊 Businesses to monitor
  businesses: {
    asobo: {
      name: 'Asobo Creations',
      type: 'coloring-books',
      enabled: true,
      etsyShop: 'asobocreations',
      niches: [
        'kawaii coloring pages',
        'cute animal coloring',
        'fantasy coloring book',
        'anime coloring pages',
        'whimsical art'
      ],
      competitors: [
        'Mythographic',
        'ColoringBookCafe',
        'JadeSummerOfficial'
      ]
    },
    peptides: {
      name: 'Peptide Ventures',
      type: 'supplements',
      enabled: true,
      keywords: [
        'peptide therapy',
        'BPC-157',
        'TB-500',
        'anti-aging supplements',
        'biohacking'
      ],
      competitors: [],
      sources: [
        'reddit.com/r/Peptides',
        'reddit.com/r/biohackers'
      ]
    }
  },

  // 🔍 Scraping sources
  sources: {
    pinterest: {
      enabled: true,
      searchTrends: true,
      trendingBoards: [
        'coloring pages',
        'adult coloring',
        'kawaii art',
        'digital art trends'
      ]
    },
    etsy: {
      enabled: true,
      searchTrends: true,
      trackCompetitors: true,
      categories: [
        'coloring book',
        'digital download coloring',
        'printable coloring pages'
      ]
    },
    trends: {
      enabled: true,
      googleTrends: false, // Requires API key
      manualTrends: [
        'anime coloring book',
        'cute animal coloring',
        'fantasy coloring pages',
        'kawaii printable art'
      ]
    }
  },

  // 📤 GitHub Publishing
  github: {
    enabled: process.env.GITHUB_ENABLED === 'true' || true,
    repo: process.env.GITHUB_REPO || 'earth-business-intel',
    owner: process.env.GITHUB_OWNER || 'Sekaiyorush',
    branch: 'main',
    reportsPath: 'reports/daily',
    commitMessage: (date) => `📊 Daily Intel Report - ${date}`
  },

  // 📱 Notifications (optional)
  notifications: {
    telegram: {
      enabled: false,
      botToken: process.env.TELEGRAM_BOT_TOKEN,
      chatId: process.env.TELEGRAM_CHAT_ID
    },
    notion: {
      enabled: false,
      token: process.env.NOTION_TOKEN,
      databaseId: process.env.NOTION_DATABASE_ID
    }
  },

  // ⚙️ System settings
  system: {
    reportsDir: join(rootDir, 'reports'),
    logsDir: join(rootDir, 'logs'),
    maxRetries: 3,
    requestDelay: 2000, // ms between requests (be nice to websites)
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },

  // 🎨 Report customization
  report: {
    format: 'markdown',
    sections: [
      'executive-summary',
      'trending-topics',
      'competitor-activity',
      'opportunity-alerts',
      'action-items'
    ],
    maxTrends: 10,
    maxCompetitors: 5
  }
};

export default config;