const { query } = require('../database/connection');
const logger = require('../utils/logger');
const AmazonScraper = require('../scrapers/amazon.scraper');
const FlipkartScraper = require('../scrapers/flipkart.scraper');

class PriceService {
  constructor() {
    this.amazonScraper = new AmazonScraper();
    this.flipkartScraper = new FlipkartScraper();
  }

  async scrapeAndStorePrice(platform, url) {
    try {
      let productData;

      switch (platform.toLowerCase()) {
        case 'amazon':
          productData = await this.amazonScraper.scrapeProduct(url);
          break;
        case 'flipkart':
          productData = await this.flipkartScraper.scrapeProduct(url);
          break;
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }

      if (!productData || !productData.price) {
        throw new Error('Failed to extract price data');
      }

      // Find or create canonical product
      const product = await this.findOrCreateProduct(productData);

      // Find or create platform product mapping
      const platformProduct = await this.findOrCreatePlatformProduct(
        product.id,
        platform,
        productData
      );

      // Store price snapshot
      await this.storePriceSnapshot(platformProduct.id, productData);

      logger.info('Price data stored successfully', {
        productId: product.id,
        platform,
        price: productData.price
      });

      return {
        product,
        platformProduct,
        priceData: productData
      };
    } catch (error) {
      logger.error('Price scraping and storage failed', { error: error.message });
      throw error;
    }
  }

  async findOrCreateProduct(productData) {
    const normalizedKey = productData.title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 100);

    // Try to find existing product
    const existing = await query(
      `SELECT * FROM products 
       WHERE normalized_key LIKE $1 
       LIMIT 1`,
      [`%${normalizedKey}%`]
    );

    if (existing.rows.length > 0) {
      return existing.rows[0];
    }

    // Create new product
    const result = await query(
      `INSERT INTO products (canonical_name, brand, category, image_url, normalized_key)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        productData.title,
        this.extractBrand(productData.title),
        'Uncategorized',
        null,
        normalizedKey
      ]
    );

    return result.rows[0];
  }

  async findOrCreatePlatformProduct(productId, platform, productData) {
    const platformProductId = this.generatePlatformProductId(platform, productData.url);

    const existing = await query(
      `SELECT * FROM platform_products 
       WHERE platform = $1 AND platform_product_id = $2`,
      [platform, platformProductId]
    );

    if (existing.rows.length > 0) {
      // Update existing record
      await query(
        `UPDATE platform_products 
         SET title = $1, image_url = $2, seller_name = $3, is_active = TRUE, last_checked_at = NOW()
         WHERE platform = $4 AND platform_product_id = $5`,
        [productData.title, productData.image_url || null, productData.seller, platform, platformProductId]
      );

      return { id: existing.rows[0].id };
    }

    // Create new platform product
    const result = await query(
      `INSERT INTO platform_products 
       (product_id, platform, platform_type, platform_product_id, product_url, title, seller_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        productId,
        platform,
        'ecommerce',
        platformProductId,
        productData.url,
        productData.title,
        productData.seller
      ]
    );

    return result.rows[0];
  }

  async storePriceSnapshot(platformProductId, productData) {
    const discountPercent = productData.mrp && productData.price
      ? ((productData.mrp - productData.price) / productData.mrp * 100).toFixed(2)
      : null;

    await query(
      `INSERT INTO price_snapshots 
       (platform_product_id, price, mrp, discount_percent, availability_status)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        platformProductId,
        productData.price,
        productData.mrp,
        discountPercent,
        productData.availability
      ]
    );
  }

  generatePlatformProductId(platform, url) {
    // Extract unique product ID from URL
    const urlObj = new URL(url);
    
    if (platform === 'amazon') {
      // Amazon ASIN extraction
      const asinMatch = urlObj.pathname.match(/\/dp\/([A-Z0-9]{10})/);
      if (asinMatch) return `AMZ_${asinMatch[1]}`;
    } else if (platform === 'flipkart') {
      // Flipkart product ID extraction
      const pidMatch = urlObj.pathname.match(/\.p\.(\w+)\.html/);
      if (pidMatch) return `FK_${pidMatch[1]}`;
    }

    // Fallback: use hash of URL
    const crypto = require('crypto');
    return `${platform.toUpperCase()}_${crypto.createHash('md5').update(url).digest('hex').substring(0, 16)}`;
  }

  extractBrand(title) {
    // Simple brand extraction - can be improved with ML
    const commonBrands = [
      'Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Realme', 'Oppo', 'Vivo',
      'Sony', 'LG', 'HP', 'Dell', 'Lenovo', 'Asus', 'Acer',
      'Nike', 'Adidas', 'Puma', 'Reebok',
      'Boat', 'Noise', 'Fire-Boltt', 'Fastrack'
    ];

    for (const brand of commonBrands) {
      if (title.toLowerCase().includes(brand.toLowerCase())) {
        return brand;
      }
    }

    return 'Unknown';
  }

  async getPriceHistory(productId, days = 90) {
    const result = await query(
      `SELECT 
        pp.platform,
        ps.price,
        ps.mrp,
        ps.discount_percent,
        ps.captured_at
       FROM price_snapshots ps
       JOIN platform_products pp ON ps.platform_product_id = pp.id
       WHERE pp.product_id = $1 
         AND ps.captured_at >= NOW() - INTERVAL '${days} days'
       ORDER BY ps.captured_at ASC`,
      [productId]
    );

    return result.rows;
  }

  async getCurrentPrices(productId) {
    const result = await query(
      `SELECT DISTINCT ON (pp.platform)
        pp.platform,
        pp.platform_type,
        pp.title,
        pp.product_url,
        ps.price,
        ps.mrp,
        ps.discount_percent,
        ps.availability_status,
        ps.captured_at
       FROM platform_products pp
       LEFT JOIN LATERAL (
         SELECT * FROM price_snapshots 
         WHERE platform_product_id = pp.id 
         ORDER BY captured_at DESC 
         LIMIT 1
       ) ps ON true
       WHERE pp.product_id = $1 AND pp.is_active = TRUE
       ORDER BY pp.platform, ps.captured_at DESC`,
      [productId]
    );

    return result.rows;
  }

  async cleanup() {
    await this.amazonScraper.close();
    await this.flipkartScraper.close();
  }
}

module.exports = PriceService;
