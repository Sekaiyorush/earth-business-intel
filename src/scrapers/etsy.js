/**
 * Etsy Market Scraper
 * Tracks competitor shops, pricing trends, and popular products
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { config } from '../config.js';

export class EtsyScraper {
  constructor() {
    this.delay = config.system.requestDelay;
    this.userAgent = config.system.userAgent;
  }

  /**
   * Search Etsy for trending products in a category
   */
  async searchProducts(query, limit = 10) {
    try {
      console.log(`🛍️ Searching Etsy: "${query}"`);
      
      const url = `https://www.etsy.com/search?q=${encodeURIComponent(query)}`;
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      const products = [];

      // Extract product listings
      $('[data-listing-id]').each((i, elem) => {
        const title = $(elem).find('h3').text().trim() || 
                     $(elem).find('.title').text().trim() ||
                     $(elem).find('[data-title]').attr('data-title');
        
        const priceText = $(elem).find('.currency-value').first().text() ||
                         $(elem).find('[data-price]').attr('data-price') || '';
        
        const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
        
        const link = $(elem).find('a').attr('href') || '';
        const shop = $(elem).find('.shop-name').text().trim() ||
                    $(elem).find('[data-shop]').attr('data-shop') || '';
        
        const reviews = $(elem).find('.reviews').text().trim() || '';
        const reviewCount = parseInt(reviews.match(/\d+/)?.[0] || '0');

        if (title) {
          products.push({
            title: title.slice(0, 100),
            price,
            currency: 'USD',
            shop: shop.slice(0, 50),
            reviews: reviewCount,
            link: link.startsWith('http') ? link : `https://etsy.com${link}`,
            source: 'etsy'
          });
        }
      });

      await this.sleep(this.delay);
      return products.slice(0, limit);

    } catch (error) {
      console.error(`❌ Etsy search failed for "${query}":`, error.message);
      return [];
    }
  }

  /**
   * Analyze a specific shop
   */
  async analyzeShop(shopName) {
    try {
      console.log(`🏪 Analyzing shop: ${shopName}`);
      
      const url = `https://www.etsy.com/shop/${shopName}`;
      
      const response = await axios.get(url, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      
      const stats = {
        name: shopName,
        sales: $('.shop-sales').text().trim() || 
               $('[data-sales]').attr('data-sales') || 'N/A',
        rating: $('.stars-svg').attr('aria-label') || 
                $('.rating').text().trim() || 'N/A',
        listingCount: $('.listing-count').text().trim() || 'N/A',
        joined: $('.shop-open-date').text().trim() || 'N/A'
      };

      await this.sleep(this.delay);
      return stats;

    } catch (error) {
      console.error(`❌ Shop analysis failed for "${shopName}":`, error.message);
      return { name: shopName, error: error.message };
    }
  }

  /**
   * Get pricing insights for a category
   */
  analyzePricing(products) {
    if (products.length === 0) return null;

    const prices = products.map(p => p.price).filter(p => p > 0);
    
    if (prices.length === 0) return null;

    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    return {
      average: avg.toFixed(2),
      min: min.toFixed(2),
      max: max.toFixed(2),
      sampleSize: prices.length,
      recommendation: avg < 5 ? 'Low price point - consider premium positioning' :
                     avg > 15 ? 'High price point - good for quality positioning' :
                     'Mid-range pricing - competitive zone'
    };
  }

  /**
   * Track competitor shops
   */
  async trackCompetitors() {
    const competitors = config.businesses.asobo.competitors;
    const results = [];

    for (const competitor of competitors) {
      const shopData = await this.analyzeShop(competitor);
      results.push(shopData);
    }

    return results;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default EtsyScraper;