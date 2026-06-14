const express = require('express');
const { query } = require('../database/connection');
const logger = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * @route   GET /api/v1/coupons
 * @desc    Get active coupons for a platform or product
 * @access  Public
 */
router.get('/', async (req, res, next) => {
  try {
    const { platform, category } = req.query;

    let whereClause = ['status = $1'];
    let params = ['active'];
    let paramIndex = 2;

    if (platform) {
      whereClause.push(`platform = $${paramIndex}`);
      params.push(platform);
      paramIndex++;
    }

    const whereSQL = whereClause.length > 0 ? `WHERE ${whereClause.join(' AND ')}` : '';

    const result = await query(
      `SELECT * FROM coupons
       ${whereSQL}
       AND (valid_till IS NULL OR valid_till > NOW())
       AND (valid_from IS NULL OR valid_from <= NOW())
       ORDER BY discount_value DESC`,
      params
    );

    res.json({
      success: true,
      data: { coupons: result.rows }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/coupons
 * @desc    Create a new coupon (admin only)
 * @access  Private/Admin
 */
router.post('/', async (req, res, next) => {
  try {
    const { 
      platform, 
      coupon_code, 
      description, 
      discount_type, 
      discount_value,
      min_order_value,
      max_discount,
      valid_from,
      valid_till
    } = req.body;

    if (!platform || !coupon_code) {
      throw new AppError('Platform and coupon code are required', 400, 'VALIDATION_ERROR');
    }

    const result = await query(
      `INSERT INTO coupons 
       (platform, coupon_code, description, discount_type, discount_value, min_order_value, max_discount, valid_from, valid_till)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (platform, coupon_code) 
       DO UPDATE SET 
         description = EXCLUDED.description,
         discount_type = EXCLUDED.discount_type,
         discount_value = EXCLUDED.discount_value,
         min_order_value = EXCLUDED.min_order_value,
         max_discount = EXCLUDED.max_discount,
         valid_from = EXCLUDED.valid_from,
         valid_till = EXCLUDED.valid_till,
         status = 'active'
       RETURNING *`,
      [platform, coupon_code, description, discount_type, discount_value, min_order_value, max_discount, valid_from, valid_till]
    );

    logger.info('Coupon created/updated', { platform, couponCode: coupon_code });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: { coupon: result.rows[0] }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
