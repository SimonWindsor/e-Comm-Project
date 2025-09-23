const { body, validationResult } = require('express-validator');

// Validation middleware for user registration
const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('phoneNumber')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('address.numberStreet')
    .notEmpty()
    .withMessage('Street address is required'),
  body('address.locality')
    .notEmpty()
    .withMessage('City is required'),
  body('address.stateProvince')
    .notEmpty()
    .withMessage('State/Province is required'),
  body('address.country')
    .notEmpty()
    .withMessage('Country is required'),
  body('address.zipcode')
    .notEmpty()
    .withMessage('ZIP code is required')
];

// Validation middleware for login
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Validation middleware for reviews
const validateReview = [
  body('itemId')
    .isUUID()
    .withMessage('Invalid item ID'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('review')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Review must be between 10 and 1000 characters')
];

// Validation middleware for cart operations
const validateCartItem = [
  body('itemString')
    .notEmpty()
    .withMessage('Item string is required'),
  body('oldValue')
    .notEmpty()
    .withMessage('Old value is required'),
  body('newValue')
    .notEmpty()
    .withMessage('New value is required')
];

// Generic validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateReview,
  validateCartItem,
  handleValidationErrors
};
