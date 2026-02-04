/**
 * Setup Script
 * Initializes the Intel Bot and helps with configuration
 */

import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

console.log('🦋 RITA\'s Business Intelligence Bot - Setup');
console.log('=============================================\n');

// Check if .env exists
const envPath = join(rootDir, '.env');

if (!existsSync(envPath)) {
  console.log('📝 Creating .env file...\n');
  
  const envTemplate = `# RITA's Business Intelligence Bot
# Configuration File

# 🎯 Mode: 'test' (local only) or 'production' (publishes to GitHub)
MODE=test

# 📤 GitHub Publishing (Optional)
# Set to 'true' to enable automatic GitHub publishing
GITHUB_ENABLED=false
GITHUB_OWNER=your-github-username
GITHUB_REPO=your-repo-name

# 📱 Telegram Notifications (Optional)
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id

# 📝 Notion Integration (Optional)
NOTION_TOKEN=your-notion-token
NOTION_DATABASE_ID=your-database-id
`;

  writeFileSync(envPath, envTemplate);
  console.log('✅ Created .env file');
  console.log('📝 Please edit .env with your settings\n');
} else {
  console.log('✅ .env file already exists\n');
}

// Installation instructions
console.log('📦 Installation Steps:');
console.log('1. npm install');
console.log('2. Edit .env with your settings');
console.log('3. npm run test    (test mode)');
console.log('4. npm run daily   (production mode)\n');

console.log('💙 Setup complete! Run "npm install" to get started.\n');