// SCAN ROUTES

// Scan routes configuration
import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import {
    checkPassword,
    deleteScan,
    getScanById,
    getScanStats,
    getUserScans,
    performEmailScan,
    performPhoneScan,
    performUsernameScan
} from '../controllers/scan.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// All scan routes require authentication
router.use(protect);

// Username scan
router.post(
  '/username',
  [
    body('username')
      .notEmpty()
      .withMessage('Username is required')
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Username can only contain letters, numbers, underscores, and hyphens')
  ],
  validate,
  performUsernameScan
);

// Email scan
router.post(
  '/email',
  [
    body('email')
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail()
  ],
  validate,
  performEmailScan
);

// Phone scan
router.post(
  '/phone',
  [
    body('phone')
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^[\d\s+()-]+$/)
      .withMessage('Please provide a valid phone number')
  ],
  validate,
  performPhoneScan
);

// Password strength checker
router.post(
  '/password-strength',
  [
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  validate,
  checkPassword
);

// Get specific scan by ID
router.get(
  '/:scanId',
  [
    param('scanId')
      .isMongoId()
      .withMessage('Invalid scan ID')
  ],
  validate,
  getScanById
);

// Get all scans for user
router.get(
  '/',
  [
    query('scanType')
      .optional()
      .isIn(['username', 'email', 'phone', 'metadata', 'social', 'password'])
      .withMessage('Invalid scan type'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer')
  ],
  validate,
  getUserScans
);

// Get scan statistics
router.get('/stats/overview', getScanStats);

// Delete scan
router.delete(
  '/:scanId',
  [
    param('scanId')
      .isMongoId()
      .withMessage('Invalid scan ID')
  ],
  validate,
  deleteScan
);

export default router;