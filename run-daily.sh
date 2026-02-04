#!/bin/bash
# RITA's Daily Business Intelligence Cron Job
# Runs every day at 6:00 AM UTC

LOG_FILE="/root/.openclaw/workspace/earth-intel-bot/logs/cron-$(date +%Y-%m-%d).log"

# Change to project directory
cd /root/.openclaw/workspace/earth-intel-bot

# Run the intel engine
echo "[$(date)] Starting daily intel run..." >> "$LOG_FILE"
npm run daily >> "$LOG_FILE" 2>&1

# Check if successful
if [ $? -eq 0 ]; then
    echo "[$(date)] ✅ Daily intel completed successfully" >> "$LOG_FILE"
else
    echo "[$(date)] ❌ Daily intel failed - check logs" >> "$LOG_FILE"
fi

echo "---" >> "$LOG_FILE"