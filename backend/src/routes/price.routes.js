const express = require('express');
const { query } = require('../database/connection');
const logger = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');
const PriceService = require('../services/price.service');

const router = express.Router();
const priceService = new PriceService();

/**
 * @route   POST /api/v1/prices/track
 * @desc    Track price for a product URL
 * @access  Public
 */
router.post('/track', async (req, res, next) => {
  try {
    const { platform, url } = req.body;

    if (!platform || !url) {
      throw new AppError('Platform and URL are required', 400, 'VALIDATION_ERROR');
    }

    const result = await priceService.scrapeAndStorePrice(platform, url);

    res.json({
      success: true,
      message: 'Price tracked successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/prices/history/:productId
 * @desc    Get price history for a product
 * @access  Public
 */
router.get('/history/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { days = 90 } = req.query;

    const history = await priceService.getPriceHistory(productId, parseInt(days));

    res.json({
      success: true,
      data: { history }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/prices/current/:productId
 * @desc    Get current prices across platforms
 * @access  Public
 */
router.get('/current/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;

    const prices = await priceService.getCurrentPrices(productId);

    res.json({
      success: true,
      data: { prices }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
