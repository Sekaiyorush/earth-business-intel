/**
 * Pinterest Trend Scraper
 * Finds trending coloring book themes, art styles, and keywords
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { config } from '../config.js';

export class PinterestScraper {
  constructor() {
    this.delay = config.system.requestDelay;
    this.userAgent = config.system.userAgent;
  }

  /**
   * Search Pinterest for trending content
   */
  async searchTrends(query) {
    try {
      console.log(`🔍 Searching Pinterest: "${query}"`);
      
      // Pinterest search URL
      const url = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      const pins = [];

      // Extract pin data (this is simplified - Pinterest uses heavy JS)
      $('img').each((i, elem) => {
        const alt = $(elem).attr('alt');
        const src = $(elem).attr('src');
        if (alt && alt.length > 5 && !src?.includes('avatar')) {
          pins.push({
            title: alt.slice(0, 100),
            image: src,
            source: 'pinterest'
          });
        }
      });

      await this.sleep(this.delay);
      return pins.slice(0, 10);

    } catch (error) {
      console.error(`❌ Pinterest search failed for "${query}":`, error.message);
      return [];
    }
  }

  /**
   * Get trending board ideas for coloring books
   */
  async getTrendingBoards() {
    const boards = config.sources.pinterest.trendingBoards;
    const allTrends = [];

    for (const board of boards) {
      const trends = await this.searchTrends(board);
      allTrends.push({
        category: board,
        trends: trends,
        count: trends.length
      });
    }

    return allTrends;
  }

  /**
   * Analyze popular color palettes and styles
   */
  analyzeTrends(trends) {
    const insights = {
      popularStyles: [],
      trendingColors: [],
      emergingThemes: []
    };

    // Simple keyword extraction (in production, use NLP)
    const styleKeywords = ['kawaii', 'anime', 'whimsical', 'vintage', 'minimalist', 'boho'];
    const colorKeywords = ['pastel', 'vibrant', 'monochrome', 'earthy', 'neon'];
    const themeKeywords = ['animals', 'fantasy', 'nature', 'mandalas', 'flowers'];

    const allTitles = trends.flatMap(t => t.trends.map(tr => tr.title.toLowerCase()));
    const text = allTitles.join(' ');

    styleKeywords.forEach(style => {
      if (text.includes(style)) insights.popularStyles.push(style);
    });

    colorKeywords.forEach(color => {
      if (text.includes(color)) insights.trendingColors.push(color);
    });

    themeKeywords.forEach(theme => {
      if (text.includes(theme)) insights.emergingThemes.push(theme);
    });

    return insights;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default PinterestScraper;