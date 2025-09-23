const express = require('express');
const {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  logout,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  getAccountStatus
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  validateUserRegistration,
  validateUserLogin,
  validateUpdateUserDetails,
  validatePasswordUpdate,
  validateEmail,
  validatePasswordReset
} = require('../middleware/validation');

const router = express.Router();

// Authentication routes
router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);
router.get('/logout', logout);

// Email verification routes
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', validateEmail, resendVerificationEmail);
router.get('/account-status/:email', getAccountStatus);

// Password reset routes
router.post('/forgotpassword', validateEmail, forgotPassword);
router.put('/resetpassword/:token', validatePasswordReset, resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, validateUpdateUserDetails, updateDetails);
router.put('/updatepassword', protect, validatePasswordUpdate, updatePassword);

// Test route for debugging
router.post('/test', (req, res) => {
  console.log('TEST - Request body:', req.body);
  console.log('TEST - Request headers:', req.headers);
  res.json({ body: req.body, headers: req.headers });
});

module.exports = router;
