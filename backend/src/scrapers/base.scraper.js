const puppeteer = require('puppeteer');
const logger = require('../utils/logger');

class BaseScraper {
  constructor(platform) {
    this.platform = platform;
    this.browser = null;
  }

  async init() {
    try {
      const args = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ];

      this.browser = await puppeteer.launch({
        headless: 'new',
        args,
        timeout: 60000
      });

      logger.info(`${this.platform} scraper initialized`);
    } catch (error) {
      logger.error(`${this.platform} scraper initialization failed`, { error: error.message });
      throw error;
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      logger.info(`${this.platform} scraper closed`);
    }
  }

  async scrapeProduct(url) {
    throw new Error('scrapeProduct method must be implemented by subclass');
  }

  async retryOperation(operation, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        logger.warn(`Retry ${i + 1}/${maxRetries} for ${this.platform}`, { error: error.message });
        await this.sleep(2000 * (i + 1));
      }
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = BaseScraper;
