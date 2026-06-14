const BaseScraper = require('./base.scraper');
const logger = require('../utils/logger');

class AmazonScraper extends BaseScraper {
  constructor() {
    super('Amazon');
  }

  async scrapeProduct(url) {
    if (!this.browser) await this.init();

    return await this.retryOperation(async () => {
      const page = await this.browser.newPage();
      
      try {
        // Set viewport and user agent
        await page.setViewport({ width: 1920, height: 1080 });
        
        // Navigate to product page
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Wait for product details to load
        await page.waitForSelector('#productTitle', { timeout: 10000 });
        
        // Extract product information
        const productData = await page.evaluate(() => {
          // Get title
          const titleElement = document.querySelector('#productTitle');
          const title = titleElement ? titleElement.textContent.trim() : '';
          
          // Get price
          const priceElement = document.querySelector('.a-price .a-offscreen');
          const priceText = priceElement ? priceElement.textContent : '';
          const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || null;
          
          // Get MRP
          const mrpElement = document.querySelector('.a-text-price.a-text-strike .a-offscreen');
          const mrpText = mrpElement ? mrpElement.textContent : '';
          const mrp = parseFloat(mrpText.replace(/[^0-9.]/g, '')) || null;
          
          // Get availability
          const availabilityElement = document.querySelector('#availability span');
          const availability = availabilityElement ? availabilityElement.textContent.trim() : 'Unknown';
          
          // Get rating
          const ratingElement = document.querySelector('[data-hook="average-star-rating"] .a-size-base');
          const rating = ratingElement ? parseFloat(ratingElement.textContent) : null;
          
          // Get number of ratings
          const ratingsCountElement = document.querySelector('[data-hook="total-review-count"]');
          const ratingsCount = ratingsCountElement ? parseInt(ratingsCountElement.textContent.replace(/[^0-9]/g, '')) : null;
          
          // Get seller info
          const sellerElement = document.querySelector('#sellerProfileTriggerId');
          const seller = sellerElement ? sellerElement.textContent.trim() : 'Amazon';
          
          // Get product URL (canonical)
          const canonicalUrl = window.location.href.split('?')[0];
          
          return {
            title,
            price,
            mrp,
            currency: 'INR',
            availability: availability.toLowerCase().includes('in stock') ? 'available' : 'unavailable',
            rating,
            ratingsCount,
            seller,
            url: canonicalUrl,
            platform: 'amazon',
            scrapedAt: new Date().toISOString()
          };
        });
        
        logger.info('Amazon product scraped successfully', { 
          title: productData.title, 
          price: productData.price 
        });
        
        return productData;
        
      } catch (error) {
        logger.error('Amazon scraping failed', { url, error: error.message });
        throw error;
      } finally {
        await page.close();
      }
    });
  }

  async searchProducts(query) {
    if (!this.browser) await this.init();

    return await this.retryOperation(async () => {
      const page = await this.browser.newPage();
      
      try {
        const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;
        await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        
        const products = await page.evaluate(() => {
          const elements = document.querySelectorAll('[data-component-type="s-search-result"]');
          
          return Array.from(elements).slice(0, 20).map(el => {
            const titleEl = el.querySelector('h2 a span');
            const priceEl = el.querySelector('.a-price .a-offscreen');
            const ratingEl = el.querySelector('[data-hook="average-star-rating"] .a-size-base');
            
            return {
              title: titleEl ? titleEl.textContent.trim() : '',
              price: priceEl ? parseFloat(priceEl.textContent.replace(/[^0-9.]/g, '')) : null,
              rating: ratingEl ? parseFloat(ratingEl.textContent) : null,
              url: el.querySelector('h2 a')?.href || ''
            };
          }).filter(p => p.title);
        });
        
        return products;
        
      } finally {
        await page.close();
      }
    });
  }
}

module.exports = AmazonScraper;
