const BaseScraper = require('./base.scraper');
const logger = require('../utils/logger');

class FlipkartScraper extends BaseScraper {
  constructor() {
    super('Flipkart');
  }

  async scrapeProduct(url) {
    if (!this.browser) await this.init();

    return await this.retryOperation(async () => {
      const page = await this.browser.newPage();
      
      try {
        await page.setViewport({ width: 1920, height: 1080 });
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Wait for product details to load
        await page.waitForSelector('._35KyD6, ._9MoMh7', { timeout: 10000 });
        
        const productData = await page.evaluate(() => {
          // Get title (different selectors for old and new Flipkart design)
          const titleElement = document.querySelector('._35KyD6') || 
                              document.querySelector('._9MoMh7') ||
                              document.querySelector('[data-testid="pdp-title"]');
          const title = titleElement ? titleElement.textContent.trim() : '';
          
          // Get price
          const priceElement = document.querySelector('._1vC4OE._2rQ-NK') ||
                              document.querySelector('[data-testid="price-section"] ._3FAW0m') ||
                              document.querySelector('.Nx9Bqj.cxCvQg');
          const priceText = priceElement ? priceElement.textContent : '';
          const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || null;
          
          // Get MRP
          const mrpElement = document.querySelector('._3L43e6') ||
                            document.querySelector('.dXUytf') ||
                            document.querySelector('.UnnEuk');
          const mrpText = mrpElement ? mrpElement.textContent : '';
          const mrp = parseFloat(mrpText.replace(/[^0-9.]/g, '')) || null;
          
          // Get availability
          const availabilityElement = document.querySelector('._59OaZu') ||
                                     document.querySelector('[data-testid="out-of-stock-message"]');
          const isAvailable = !availabilityElement;
          
          // Get rating
          const ratingElement = document.querySelector('._2IZV2o') ||
                               document.querySelector('[data-testid="rating-aggregate"]');
          const rating = ratingElement ? parseFloat(ratingElement.textContent) : null;
          
          // Get number of ratings
          const ratingsCountElement = document.querySelector('._38sUEc') ||
                                     document.querySelector('[data-testid="total-ratings-count"]');
          const ratingsCount = ratingsCountElement ? 
                             parseInt(ratingsCountElement.textContent.replace(/[^0-9]/g, '')) : null;
          
          // Get seller info
          const sellerElement = document.querySelector('._3k8hWc') ||
                               document.querySelector('[data-testid="seller-name"]');
          const seller = sellerElement ? sellerElement.textContent.trim() : 'Flipkart';
          
          return {
            title,
            price,
            mrp,
            currency: 'INR',
            availability: isAvailable ? 'available' : 'unavailable',
            rating,
            ratingsCount,
            seller,
            url: window.location.href.split('?')[0],
            platform: 'flipkart',
            scrapedAt: new Date().toISOString()
          };
        });
        
        logger.info('Flipkart product scraped successfully', { 
          title: productData.title, 
          price: productData.price 
        });
        
        return productData;
        
      } catch (error) {
        logger.error('Flipkart scraping failed', { url, error: error.message });
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
        const searchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;
        await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        
        const products = await page.evaluate(() => {
          const elements = document.querySelectorAll('._2771n3, .DOjaWF');
          
          return Array.from(elements).slice(0, 20).map(el => {
            const titleEl = el.querySelector('._2kHMtA, a[title]');
            const priceEl = el.querySelector('._1vC4OE._2rQ-NK, .Nx9Bqj.cxCvQg');
            const ratingEl = el.querySelector('._2IZV2o, [data-testid="rating-aggregate"]');
            
            return {
              title: titleEl ? titleEl.textContent.trim() : '',
              price: priceEl ? parseFloat(priceEl.textContent.replace(/[^0-9.]/g, '')) : null,
              rating: ratingEl ? parseFloat(ratingEl.textContent) : null,
              url: el.querySelector('a')?.href || ''
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

module.exports = FlipkartScraper;
