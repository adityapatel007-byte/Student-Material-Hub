const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  logout
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name', 'Name is required').notEmpty().trim(),
  body('email', 'Please provide a valid email').isEmail().normalizeEmail(),
  body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  body('university', 'University is required').notEmpty().trim(),
  body('course', 'Course is required').notEmpty().trim(),
  body('semester', 'Semester must be a number between 1-12').isInt({ min: 1, max: 12 })
];

const loginValidation = [
  body('email', 'Please provide a valid email').isEmail().normalizeEmail(),
  body('password', 'Password is required').notEmpty()
];

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.get('/logout', logout);

module.exports = router;
