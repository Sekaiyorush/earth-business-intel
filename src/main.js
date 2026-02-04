/**
 * RITA's Business Intelligence Engine
 * Main orchestrator - runs daily to gather market intel
 */

import { config } from './config.js';
import { PinterestScraper } from './scrapers/pinterest.js';
import { EtsyScraper } from './scrapers/etsy.js';
import { ReportGenerator } from './generators/report.js';
import { GitHubPublisher } from './publishers/github.js';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

class IntelEngine {
  constructor() {
    this.pinterest = new PinterestScraper();
    this.etsy = new EtsyScraper();
    this.reporter = new ReportGenerator();
    this.publisher = new GitHubPublisher();
    this.data = {
      pinterest: [],
      pinterestInsights: null,
      etsy: {
        products: [],
        competitors: [],
        pricing: null
      }
    };
  }

  async run() {
    console.log('🦋 RITA\'s Business Intelligence Engine');
    console.log('========================================');
    console.log(`📅 ${new Date().toLocaleString('en-US', { timeZone: 'UTC' })} UTC`);
    console.log(`🔧 Mode: ${config.mode.toUpperCase()}`);
    console.log('');

    try {
      // Step 1: Gather Pinterest data
      if (config.sources.pinterest.enabled) {
        await this.gatherPinterestData();
      }

      // Step 2: Gather Etsy data
      if (config.sources.etsy.enabled) {
        await this.gatherEtsyData();
      }

      // Step 3: Generate report
      const report = this.reporter.generate(this.data);
      const filename = this.reporter.getFilename();

      // Step 4: Publish
      const result = await this.publisher.publish(report, filename);

      // Step 5: Summary
      this.printSummary(result, filename);

      return result;

    } catch (error) {
      console.error('💥 Engine failed:', error);
      throw error;
    }
  }

  async gatherPinterestData() {
    console.log('🔍 Gathering Pinterest trends...\n');
    
    const trends = await this.pinterest.getTrendingBoards();
    this.data.pinterest = trends;
    
    if (trends.length > 0) {
      this.data.pinterestInsights = this.pinterest.analyzeTrends(trends);
    }

    console.log(`✅ Collected ${trends.reduce((acc, t) => acc + t.trends.length, 0)} Pinterest trends\n`);
  }

  async gatherEtsyData() {
    console.log('🛍️ Gathering Etsy market data...\n');

    // Search for products in each category
    const allProducts = [];
    for (const category of config.sources.etsy.categories) {
      const products = await this.etsy.searchProducts(category, 10);
      allProducts.push(...products);
    }

    // Remove duplicates
    const uniqueProducts = allProducts.filter((product, index, self) => 
      index === self.findIndex(p => p.title === product.title)
    );

    this.data.etsy.products = uniqueProducts;
    this.data.etsy.pricing = this.etsy.analyzePricing(uniqueProducts);

    // Track competitors
    if (config.sources.etsy.trackCompetitors) {
      const competitors = await this.etsy.trackCompetitors();
      this.data.etsy.competitors = competitors;
    }

    console.log(`✅ Collected ${uniqueProducts.length} Etsy products\n`);
  }

  printSummary(result, filename) {
    console.log('\n📊 SUMMARY');
    console.log('==========');
    console.log(`Report: ${filename}`);
    console.log(`Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    if (result.published) {
      console.log(`Published: 🚀 ${result.url}`);
    } else if (result.localPath) {
      console.log(`Saved: 💾 ${result.localPath}`);
    }

    console.log('\n📈 Data Collected:');
    console.log(`  - Pinterest trends: ${this.data.pinterest.reduce((a, t) => a + t.trends.length, 0)}`);
    console.log(`  - Etsy products: ${this.data.etsy.products.length}`);
    console.log(`  - Competitors tracked: ${this.data.etsy.competitors.length}`);

    console.log('\n💙 RITA says: "Market intel delivered! Sleep tight, babe." 🦋');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // Ensure directories exist
  const dirs = ['reports', 'logs'];
  dirs.forEach(dir => {
    const path = join(rootDir, dir);
    if (!existsSync(path)) {
      mkdirSync(path, { recursive: true });
    }
  });

  const engine = new IntelEngine();
  engine.run().catch(console.error);
}

export default IntelEngine;