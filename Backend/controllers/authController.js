const User = require('../models/User');
const { sendTokenResponse } = require('../utils/auth');
const { validationResult } = require('express-validator');
const EmailService = require('../services/emailService');
const crypto = require('crypto');

const emailService = new EmailService();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    // Debug logging
    console.log('Request body:', req.body);
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { name, email, password, university, course, semester } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      university,
      course,
      semester
    });

    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Send verification email
    try {
      await emailService.sendVerificationEmail(email, name, verificationToken);
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email to verify your account.',
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified
        }
      });
    } catch (error) {
      console.error('Error sending verification email:', error);
      
      // If email fails, still create user but inform about email issue
      res.status(201).json({
        success: true,
        message: 'User registered successfully, but verification email could not be sent. Please contact support.',
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account temporarily locked due to too many failed login attempts. Please try again later.'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      // Handle failed login attempt
      await user.incLoginAttempts();
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in',
        needsVerification: true
      });
    }

    // Check account status
    if (user.accountStatus === 'suspended') {
      return res.status(423).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.'
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      university: req.body.university,
      course: req.body.course,
      semester: req.body.semester
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.comparePassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Password is incorrect'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    // Get hashed token
    const verificationToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken: verificationToken,
      emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Verify user
    await user.verifyEmail();

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(user.email, user.name);
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
      data: {
        isVerified: true,
        accountStatus: user.accountStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with that email'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Send verification email
    try {
      await emailService.sendVerificationEmail(user.email, user.name, verificationToken);
      
      res.status(200).json({
        success: true,
        message: 'Verification email sent successfully'
      });
    } catch (error) {
      console.error('Error sending verification email:', error);
      res.status(500).json({
        success: false,
        message: 'Error sending verification email'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with that email'
      });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send reset email
    try {
      await emailService.sendPasswordResetEmail(user.email, user.name, resetToken);
      
      res.status(200).json({
        success: true,
        message: 'Password reset email sent successfully'
      });
    } catch (error) {
      console.error('Error sending password reset email:', error);
      
      // Remove reset token if email fails
      user.passwordResetToken = undefined;
      user.passwordResetExpire = undefined;
      await user.save({ validateBeforeSave: false });
      
      res.status(500).json({
        success: false,
        message: 'Error sending password reset email'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: resetPasswordToken,
      passwordResetExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    user.loginAttempts = undefined;
    user.lockUntil = undefined;
    
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now log in with your new password.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get account status
// @route   GET /api/auth/account-status/:email
// @access  Public
exports.getAccountStatus = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select('isVerified accountStatus');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with that email'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        isVerified: user.isVerified,
        accountStatus: user.accountStatus,
        needsVerification: !user.isVerified
      }
    });
  } catch (error) {
    next(error);
  }
};
