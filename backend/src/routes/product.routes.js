const express = require('express');
const { query } = require('../database/connection');
const logger = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * @route   GET /api/v1/products/search
 * @desc    Search products across all platforms
 * @access  Public
 */
router.get('/search', async (req, res, next) => {
  try {
    const { q, category, brand, limit = 20, offset = 0 } = req.query;

    if (!q && !category) {
      throw new AppError('Search query or category is required', 400, 'VALIDATION_ERROR');
    }

    let whereClause = [];
    let params = [];
    let paramIndex = 1;

    if (q) {
      whereClause.push(`(p.canonical_name ILIKE $${paramIndex} OR p.brand ILIKE $${paramIndex})`);
      params.push(`%${q}%`);
      paramIndex++;
    }

    if (category) {
      whereClause.push(`p.category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    const whereSQL = whereClause.length > 0 ? `WHERE ${whereClause.join(' AND ')}` : '';

    const result = await query(
      `SELECT 
        p.id,
        p.canonical_name,
        p.brand,
        p.category,
        p.sub_category,
        p.image_url,
        COUNT(DISTINCT pp.id) as platform_count,
        MIN(ps.price) as min_price,
        MAX(ps.price) as max_price,
        AVG(ps.price) as avg_price
       FROM products p
       LEFT JOIN platform_products pp ON p.id = pp.product_id AND pp.is_active = TRUE
       LEFT JOIN price_snapshots ps ON pp.id = ps.platform_product_id
       ${whereSQL}
       GROUP BY p.id
       ORDER BY p.canonical_name
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({
      success: true,
      data: {
        products: result.rows,
        total: result.rows.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/products/:id
 * @desc    Get product details with price comparison
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get product details
    const productResult = await query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );

    if (productResult.rows.length === 0) {
      throw new AppError('Product not found', 404, 'NOT_FOUND');
    }

    const product = productResult.rows[0];

    // Get platform-specific products and prices
    const platformsResult = await query(
      `SELECT 
        pp.platform,
        pp.platform_type,
        pp.title,
        pp.image_url,
        pp.product_url,
        pp.seller_name,
        ps.price,
        ps.mrp,
        ps.discount_percent,
        ps.availability_status,
        ps.captured_at,
        qc.delivery_fee,
        qc.platform_fee,
        qc.handling_fee,
        qc.eta_minutes
       FROM platform_products pp
       LEFT JOIN price_snapshots ps ON pp.id = ps.platform_product_id
       LEFT JOIN quick_commerce_prices qc ON pp.product_id = qc.product_id AND qc.platform = pp.platform
       WHERE pp.product_id = $1 AND pp.is_active = TRUE
       ORDER BY ps.price ASC NULLS LAST`,
      [id]
    );

    // Get price history
    const priceHistoryResult = await query(
      `SELECT 
        pp.platform,
        ps.price,
        ps.captured_at
       FROM platform_products pp
       JOIN price_snapshots ps ON pp.id = ps.platform_product_id
       WHERE pp.product_id = $1
       ORDER BY ps.captured_at DESC
       LIMIT 100`,
      [id]
    );

    res.json({
      success: true,
      data: {
        product,
        platforms: platformsResult.rows,
        priceHistory: priceHistoryResult.rows
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/products
 * @desc    Create a new product (admin only)
 * @access  Private/Admin
 */
router.post('/', async (req, res, next) => {
  try {
    const { canonical_name, brand, category, sub_category, image_url, barcode } = req.body;

    if (!canonical_name) {
      throw new AppError('Product name is required', 400, 'VALIDATION_ERROR');
    }

    // Generate normalized key for matching
    const normalized_key = canonical_name.toLowerCase().replace(/[^a-z0-9]/g, '');

    const result = await query(
      `INSERT INTO products (canonical_name, brand, category, sub_category, image_url, barcode, normalized_key)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [canonical_name, brand, category, sub_category, image_url, barcode, normalized_key]
    );

    logger.info('Product created', { productId: result.rows[0].id });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product: result.rows[0] }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
