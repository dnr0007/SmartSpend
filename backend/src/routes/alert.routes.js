const express = require('express');
const { query } = require('../database/connection');
const logger = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/v1/alerts
 * @desc    Get user's alerts
 * @access  Private
 */
router.get('/', auth, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT a.*, 
        CASE 
          WHEN a.target_entity_type = 'product' THEN p.canonical_name
          WHEN a.target_entity_type = 'cart' THEN c.name
        END as target_name
       FROM alerts a
       LEFT JOIN products p ON a.target_entity_id = p.id AND a.target_entity_type = 'product'
       LEFT JOIN carts c ON a.target_entity_id = c.id AND a.target_entity_type = 'cart'
       WHERE a.user_id = $1
       ORDER BY a.created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: { alerts: result.rows }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/alerts
 * @desc    Create a new price alert
 * @access  Private
 */
router.post('/', auth, async (req, res, next) => {
  try {
    const { alert_type, target_entity_type, target_entity_id, target_price, notification_channel } = req.body;

    if (!alert_type || !target_entity_type || !target_entity_id) {
      throw new AppError('Alert type, target entity type and ID are required', 400, 'VALIDATION_ERROR');
    }

    const result = await query(
      `INSERT INTO alerts (user_id, alert_type, target_entity_type, target_entity_id, target_price, notification_channel)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.id, alert_type, target_entity_type, target_entity_id, target_price, notification_channel || 'push']
    );

    logger.info('Alert created', { alertId: result.rows[0].id, userId: req.user.id });

    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      data: { alert: result.rows[0] }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/v1/alerts/:id
 * @desc    Update alert status
 * @access  Private
 */
router.put('/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Verify alert ownership
    const alertCheck = await query(
      `SELECT id FROM alerts WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    if (alertCheck.rows.length === 0) {
      throw new AppError('Alert not found', 404, 'NOT_FOUND');
    }

    const result = await query(
      `UPDATE alerts SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status || 'active', id]
    );

    res.json({
      success: true,
      message: 'Alert updated successfully',
      data: { alert: result.rows[0] }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/v1/alerts/:id
 * @desc    Delete an alert
 * @access  Private
 */
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const { id } = req.params;

    await query(
      `DELETE FROM alerts WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    res.json({
      success: true,
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
