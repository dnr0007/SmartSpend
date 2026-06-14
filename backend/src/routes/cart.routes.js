const express = require('express');
const { query } = require('../database/connection');
const logger = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/v1/carts
 * @desc    Get user's carts
 * @access  Private
 */
router.get('/', auth, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT c.*, 
        COUNT(ci.id) as item_count,
        SUM(ci.quantity) as total_quantity
       FROM carts c
       LEFT JOIN cart_items ci ON c.id = ci.cart_id
       WHERE c.user_id = $1
       GROUP BY c.id
       ORDER BY c.updated_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: { carts: result.rows }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/carts
 * @desc    Create a new cart
 * @access  Private
 */
router.post('/', auth, async (req, res, next) => {
  try {
    const { name } = req.body;

    const result = await query(
      `INSERT INTO carts (user_id, name)
       VALUES ($1, $2)
       RETURNING *`,
      [req.user.id, name || 'My Cart']
    );

    logger.info('Cart created', { cartId: result.rows[0].id, userId: req.user.id });

    res.status(201).json({
      success: true,
      message: 'Cart created successfully',
      data: { cart: result.rows[0] }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/carts/:id
 * @desc    Get cart details with items
 * @access  Private
 */
router.get('/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get cart details
    const cartResult = await query(
      `SELECT * FROM carts WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    if (cartResult.rows.length === 0) {
      throw new AppError('Cart not found', 404, 'NOT_FOUND');
    }

    const cart = cartResult.rows[0];

    // Get cart items
    const itemsResult = await query(
      `SELECT ci.*, p.canonical_name, p.brand, p.image_url
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = $1`,
      [id]
    );

    // Get cart comparisons if available
    const comparisonsResult = await query(
      `SELECT * FROM cart_comparisons
       WHERE cart_id = $1
       ORDER BY final_total ASC
       LIMIT 10`,
      [id]
    );

    res.json({
      success: true,
      data: {
        cart,
        items: itemsResult.rows,
        comparisons: comparisonsResult.rows
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/v1/carts/:id/items
 * @desc    Add/update item in cart
 * @access  Private
 */
router.put('/:id/items', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { product_id, quantity, preferred_brand, preferred_pack_size } = req.body;

    // Verify cart ownership
    const cartCheck = await query(
      `SELECT id FROM carts WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    if (cartCheck.rows.length === 0) {
      throw new AppError('Cart not found', 404, 'NOT_FOUND');
    }

    // Check if item exists
    const existingItem = await query(
      `SELECT id FROM cart_items WHERE cart_id = $1 AND product_id = $2`,
      [id, product_id]
    );

    let result;
    if (existingItem.rows.length > 0) {
      // Update existing item
      result = await query(
        `UPDATE cart_items
         SET quantity = COALESCE($3, quantity),
             preferred_brand = COALESCE($4, preferred_brand),
             preferred_pack_size = COALESCE($5, preferred_pack_size)
         WHERE cart_id = $1 AND product_id = $2
         RETURNING *`,
        [id, product_id, quantity, preferred_brand, preferred_pack_size]
      );
    } else {
      // Add new item
      result = await query(
        `INSERT INTO cart_items (cart_id, product_id, quantity, preferred_brand, preferred_pack_size)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [id, product_id, quantity || 1, preferred_brand, preferred_pack_size]
      );
    }

    // Update cart timestamp
    await query(
      `UPDATE carts SET updated_at = NOW() WHERE id = $1`,
      [id]
    );

    res.json({
      success: true,
      message: 'Item added/updated successfully',
      data: { item: result.rows[0] }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/v1/carts/:id/items/:product_id
 * @desc    Remove item from cart
 * @access  Private
 */
router.delete('/:id/items/:product_id', auth, async (req, res, next) => {
  try {
    const { id, product_id } = req.params;

    await query(
      `DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2`,
      [id, product_id]
    );

    await query(
      `UPDATE carts SET updated_at = NOW() WHERE id = $1`,
      [id]
    );

    res.json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
