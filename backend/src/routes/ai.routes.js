const express = require('express');
const { query } = require('../database/connection');
const logger = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * @route   POST /api/v1/ai/recommend
 * @desc    Get AI buy/wait recommendation for a product
 * @access  Public
 */
router.post('/recommend', async (req, res, next) => {
  try {
    const { productId, currentPrice, historicalLow, averagePrice } = req.body;

    if (!currentPrice) {
      throw new AppError('Current price is required', 400, 'VALIDATION_ERROR');
    }

    // Calculate deal score and recommendation
    let recommendation = 'HOLD';
    let confidence = 'MEDIUM';
    let reasons = [];

    if (historicalLow && currentPrice <= historicalLow * 1.05) {
      recommendation = 'BUY_NOW';
      confidence = 'HIGH';
      reasons.push('Price is at or near historical low');
    } else if (averagePrice && currentPrice < averagePrice * 0.9) {
      recommendation = 'BUY_NOW';
      confidence = 'MEDIUM';
      reasons.push('Price is below average');
    } else if (averagePrice && currentPrice > averagePrice * 1.1) {
      recommendation = 'WAIT';
      confidence = 'MEDIUM';
      reasons.push('Price is above average - wait for drop');
    } else {
      reasons.push('Price is within normal range');
    }

    res.json({
      success: true,
      data: {
        recommendation,
        confidence,
        reasons,
        dealScore: calculateDealScore(currentPrice, historicalLow, averagePrice)
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/ai/savings-report/:userId
 * @desc    Get user's monthly savings report
 * @access  Private
 */
router.get('/savings-report/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { month = new Date().getMonth() + 1, year = new Date().getFullYear() } = req.query;

    // Calculate estimated savings from cart comparisons and price tracking
    const result = await query(
      `SELECT 
        COUNT(DISTINCT cc.cart_id) as carts_compared,
        AVG(cc.final_total) as avg_cart_total,
        MIN(cc.final_total) as best_cart_total,
        MAX(cc.final_total) as worst_cart_total
       FROM cart_comparisons cc
       JOIN carts c ON cc.cart_id = c.id
       WHERE c.user_id = $1 
         AND EXTRACT(MONTH FROM cc.captured_at) = $2
         AND EXTRACT(YEAR FROM cc.captured_at) = $3`,
      [userId, month, year]
    );

    const stats = result.rows[0];
    const estimatedSavings = stats.best_cart_total && stats.worst_cart_total
      ? (stats.worst_cart_total - stats.best_cart_total).toFixed(2)
      : 0;

    res.json({
      success: true,
      data: {
        month: parseInt(month),
        year: parseInt(year),
        cartsCompared: stats.carts_compared || 0,
        estimatedSavings: parseFloat(estimatedSavings),
        averageCartTotal: parseFloat(stats.avg_cart_total || 0),
        bestDeal: parseFloat(stats.best_cart_total || 0)
      }
    });
  } catch (error) {
    next(error);
  }
});

function calculateDealScore(current, historicalLow, average) {
  let score = 50; // Base score

  if (historicalLow && current <= historicalLow) {
    score = 100; // Best possible deal
  } else if (historicalLow && current <= historicalLow * 1.1) {
    score = 85; // Near best price
  } else if (average && current <= average * 0.85) {
    score = 75; // Good deal
  } else if (average && current <= average) {
    score = 60; // Average deal
  } else if (average && current > average * 1.2) {
    score = 20; // Bad deal
  }

  return Math.round(score);
}

module.exports = router;
