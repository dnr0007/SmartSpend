const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { query } = require('../database/connection');
const logger = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// Generate OTP (6-digit random number)
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register user with phone/email
 * @access  Public
 */
router.post('/register', [
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('phone').optional({ checkFalsy: true }).isMobilePhone('en-IN').withMessage('Valid Indian phone number required'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Valid email required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400, 'VALIDATION_ERROR');
    }

    const { name, phone, email, city } = req.body;

    if (!phone && !email) {
      throw new AppError('Either phone or email is required', 400, 'VALIDATION_ERROR');
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE phone = $1 OR email = $2',
      [phone, email]
    );

    if (existingUser.rows.length > 0) {
      throw new AppError('User already exists', 409, 'USER_EXISTS');
    }

    // Create user
    const result = await query(
      `INSERT INTO users (name, phone, email, city) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, phone, email, city, created_at`,
      [name, phone, email, city]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );

    logger.info('User registered', { userId: user.id });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user with phone/email and OTP
 * @access  Public
 */
router.post('/login', [
  body('phone').optional({ checkFalsy: true }).isMobilePhone('en-IN').withMessage('Valid Indian phone number required'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Valid email required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(errors.array()[0].msg, 400, 'VALIDATION_ERROR');
    }

    const { phone, email } = req.body;

    if (!phone && !email) {
      throw new AppError('Either phone or email is required', 400, 'VALIDATION_ERROR');
    }

    // Find user
    const result = await query(
      'SELECT id, name, phone, email, city FROM users WHERE phone = $1 OR email = $2',
      [phone, email]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const user = result.rows[0];

    // Generate JWT token (in production, implement OTP verification)
    const token = jwt.sign(
      { id: user.id, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );

    logger.info('User logged in', { userId: user.id });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/auth/send-otp
 * @desc    Send OTP for authentication
 * @access  Public
 */
router.post('/send-otp', [
  body('phone').optional({ checkFalsy: true }).isMobilePhone('en-IN'),
  body('email').optional({ checkFalsy: true }).isEmail()
], async (req, res, next) => {
  try {
    const { phone, email } = req.body;

    if (!phone && !email) {
      throw new AppError('Either phone or email is required', 400, 'VALIDATION_ERROR');
    }

    // Generate OTP
    const otp = generateOTP();

    // In production, send OTP via SMS/Email service
    // For now, log it (remove in production)
    logger.info('OTP generated', { phone, email, otp });

    // Store OTP in Redis with expiry (pseudo-code)
    // await redis.setex(`otp:${phone || email}`, 600, otp);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      data: { otp } // Remove in production
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', async (req, res, next) => {
  try {
    // Extract token from header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Not authorized', 401, 'NO_TOKEN');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await query(
      'SELECT id, name, phone, email, city, created_at FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    res.json({
      success: true,
      data: { user: result.rows[0] }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
