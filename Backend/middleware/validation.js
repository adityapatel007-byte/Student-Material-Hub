const { body, param, query, validationResult } = require('express-validator');
const ValidationUtils = require('../utils/validation');

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

/**
 * User registration validation
 */
const validateUserRegistration = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .custom(value => {
      if (!ValidationUtils.isValidName(value)) {
        throw new Error('Name must be 2-50 characters long and contain only letters and spaces');
      }
      return true;
    }),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .custom(value => {
      if (!ValidationUtils.isValidEmail(value)) {
        throw new Error('Please provide a valid email address');
      }
      return true;
    }),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .custom(value => {
      const validation = ValidationUtils.validatePassword(value);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      return true;
    }),
  
  body('university')
    .trim()
    .notEmpty()
    .withMessage('University is required')
    .custom(value => {
      if (!ValidationUtils.isValidUniversity(value)) {
        throw new Error('University name must be 2-100 characters long and contain only letters, spaces, hyphens, and periods');
      }
      return true;
    }),
  
  body('course')
    .trim()
    .notEmpty()
    .withMessage('Course is required')
    .custom(value => {
      if (!ValidationUtils.isValidCourse(value)) {
        throw new Error('Course name must be 2-100 characters long');
      }
      return true;
    }),
  
  body('semester')
    .isInt({ min: 1, max: 12 })
    .withMessage('Semester must be a number between 1 and 12'),
  
  handleValidationErrors
];

/**
 * User login validation
 */
const validateUserLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

/**
 * Update user details validation
 */
const validateUpdateUserDetails = [
  body('name')
    .optional()
    .trim()
    .custom(value => {
      if (value && !ValidationUtils.isValidName(value)) {
        throw new Error('Name must be 2-50 characters long and contain only letters and spaces');
      }
      return true;
    }),
  
  body('university')
    .optional()
    .trim()
    .custom(value => {
      if (value && !ValidationUtils.isValidUniversity(value)) {
        throw new Error('University name must be 2-100 characters long and contain only letters, spaces, hyphens, and periods');
      }
      return true;
    }),
  
  body('course')
    .optional()
    .trim()
    .custom(value => {
      if (value && !ValidationUtils.isValidCourse(value)) {
        throw new Error('Course name must be 2-100 characters long');
      }
      return true;
    }),
  
  body('semester')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Semester must be a number between 1 and 12'),
  
  handleValidationErrors
];

/**
 * Password update validation
 */
const validatePasswordUpdate = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .custom(value => {
      const validation = ValidationUtils.validatePassword(value);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      return true;
    }),
  
  handleValidationErrors
];

/**
 * Material creation validation
 */
const validateMaterialCreation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .custom(value => {
      if (!ValidationUtils.isValidTitle(value)) {
        throw new Error('Title must be 3-200 characters long');
      }
      return true;
    }),
  
  body('description')
    .optional()
    .trim()
    .custom(value => {
      if (value && !ValidationUtils.isValidDescription(value)) {
        throw new Error('Description must be less than 1000 characters');
      }
      return true;
    }),
  
  body('subject')
    .notEmpty()
    .withMessage('Subject is required')
    .custom(value => {
      if (!ValidationUtils.isValidObjectId(value)) {
        throw new Error('Invalid subject ID');
      }
      return true;
    }),
  
  body('materialType')
    .isIn(['notes', 'assignment', 'presentation', 'book', 'paper', 'other'])
    .withMessage('Invalid material type'),
  
  body('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Invalid difficulty level'),
  
  body('academicYear')
    .optional()
    .matches(/^\d{4}-\d{2}$/)
    .withMessage('Academic year must be in format YYYY-YY (e.g., 2024-25)'),
  
  body('semester')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Semester must be a number between 1 and 12'),
  
  body('tags')
    .optional()
    .custom(value => {
      if (value) {
        // Handle both string and array inputs
        const tags = Array.isArray(value) ? value : [value];
        if (!ValidationUtils.isValidTags(tags)) {
          throw new Error('Tags must be an array of 2-30 character strings (letters, numbers, hyphens only), maximum 10 tags');
        }
      }
      return true;
    }),
  
  handleValidationErrors
];

/**
 * Subject creation validation
 */
const validateSubjectCreation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Subject name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Subject name must be 2-100 characters long'),
  
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Subject code is required')
    .isLength({ min: 2, max: 20 })
    .withMessage('Subject code must be 2-20 characters long')
    .matches(/^[A-Z0-9\-]+$/)
    .withMessage('Subject code must contain only uppercase letters, numbers, and hyphens'),
  
  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Department name must be 2-100 characters long'),
  
  body('semester')
    .isInt({ min: 1, max: 12 })
    .withMessage('Semester must be a number between 1 and 12'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  
  handleValidationErrors
];

/**
 * MongoDB ObjectId validation
 */
const validateObjectId = [
  param('id')
    .custom(value => {
      if (!ValidationUtils.isValidObjectId(value)) {
        throw new Error('Invalid ID format');
      }
      return true;
    }),
  
  handleValidationErrors
];

/**
 * Search query validation
 */
const validateSearchQuery = [
  query('search')
    .optional()
    .custom(value => {
      if (value && !ValidationUtils.isValidSearchQuery(value)) {
        throw new Error('Search query must be 1-100 characters long');
      }
      return true;
    }),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

/**
 * Email validation
 */
const validateEmail = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .custom(value => {
      if (!ValidationUtils.isValidEmail(value)) {
        throw new Error('Please provide a valid email address');
      }
      return true;
    }),
  
  handleValidationErrors
];

/**
 * Password reset validation
 */
const validatePasswordReset = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  
  body('password')
    .notEmpty()
    .withMessage('New password is required')
    .custom(value => {
      const validation = ValidationUtils.validatePassword(value);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      return true;
    }),
  
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateUpdateUserDetails,
  validatePasswordUpdate,
  validateMaterialCreation,
  validateSubjectCreation,
  validateObjectId,
  validateSearchQuery,
  validateEmail,
  validatePasswordReset,
  handleValidationErrors
};