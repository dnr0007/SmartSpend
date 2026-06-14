const express = require('express');
const { query } = require('../database/connection');
const logger = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/v1/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', auth, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, name, phone, email, city, created_at FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    res.json({
      success: true,
      data: { user: result.rows[0] }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/v1/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', auth, async (req, res, next) => {
  try {
    const { name, city } = req.body;

    const result = await query(
      `UPDATE users SET name = COALESCE($1, name), city = COALESCE($2, city), updated_at = NOW()
       WHERE id = $3 RETURNING id, name, phone, email, city, created_at`,
      [name, city, req.user.id]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: result.rows[0] }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
